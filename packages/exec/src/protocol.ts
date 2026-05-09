/**
 * FD3 line-delimited JSON protocol between the runtime parent and the
 * action loader child. Pure data — no spawn, no FD, no I/O. The
 * parent's `exec.ts` wires `child.stdio[3]`'s data events into a
 * `ProtocolStreamParser`; the child's `loader.mjs` writes encoded
 * frames synchronously to FD 3.
 *
 * Frame schema (one JSON object per line, `\n` terminator):
 * - `{ type: "output", name: string, value: string }` — emit a named
 *   step output.
 * - `{ type: "log", level: LogLevel, message: string }` — emit a
 *   structured log line back to the runtime.
 * - `{ type: "error", message: string, stack?: string }` — terminal
 *   error frame; the action's `run()` threw or the loader itself
 *   crashed.
 *
 * Robustness:
 * - Lines longer than `PROTOCOL_MAX_LINE_BYTES` (1 MiB) raise
 *   `ExecError` and the parser drops them (prevents OOM
 *   from a misbehaving action that floods FD 3).
 * - Invalid JSON / unknown types / malformed shapes raise
 *   `ExecError` per line; the parser logs the error and
 *   continues — a single bad line never aborts the run.
 * - A partial line at end-of-stream surfaces as `ExecError`
 *   so the run can warn about lost data.
 */

import type { LogLevel } from "./context.ts";
import { ExecError } from "./errors.ts";

/** Output frame: action emitted a named step output. */
export interface OutputFrame {
  readonly type: "output";
  readonly name: string;
  readonly value: string;
}

/** Log frame: action emitted a structured log line. */
export interface LogFrame {
  readonly type: "log";
  readonly level: LogLevel;
  readonly message: string;
}

/** Error frame: action threw, or loader crashed. Terminal. */
export interface ErrorFrame {
  readonly type: "error";
  readonly message: string;
  readonly stack?: string;
}

/** Discriminated union of every protocol frame. Consumers narrow on `type`. */
export type ProtocolFrame = OutputFrame | LogFrame | ErrorFrame;

/** Hard cap on a single FD3 line. Prevents OOM from an action that
 * writes without newlines. 1 MiB is generous for log messages and
 * reasonable for output values (which are strings). */
export const PROTOCOL_MAX_LINE_BYTES = 1024 * 1024;

const VALID_LOG_LEVELS: ReadonlySet<LogLevel> = new Set<LogLevel>([
  "debug",
  "info",
  "warn",
  "error",
]);

const isLogLevel = (value: unknown): value is LogLevel =>
  typeof value === "string" && VALID_LOG_LEVELS.has(value as LogLevel);

/**
 * Parse a single FD3 line (without the terminating newline) into a
 * typed frame.
 *
 * @throws {ExecError} when the line is not valid JSON, the
 *   parsed value is not an object, the `type` discriminator is missing
 *   or unknown, or required fields are missing or wrong type.
 */
export function parseFrameLine(line: string): ProtocolFrame {
  let value: unknown;
  try {
    value = JSON.parse(line);
  } catch {
    throw new ExecError(`FD3 protocol: invalid JSON on line: ${truncate(line)}`);
  }
  if (value === null || typeof value !== "object") {
    throw new ExecError(`FD3 protocol: expected an object, got ${typeof value}: ${truncate(line)}`);
  }
  const obj = value as Record<string, unknown>;
  switch (obj.type) {
    case "output":
      if (typeof obj.name !== "string" || typeof obj.value !== "string") {
        throw new ExecError(
          `FD3 protocol: malformed output frame (need name+value strings): ${truncate(line)}`,
        );
      }
      return { type: "output", name: obj.name, value: obj.value };
    case "log":
      if (!isLogLevel(obj.level) || typeof obj.message !== "string") {
        throw new ExecError(
          `FD3 protocol: malformed log frame (need level+message): ${truncate(line)}`,
        );
      }
      return { type: "log", level: obj.level, message: obj.message };
    case "error": {
      if (typeof obj.message !== "string") {
        throw new ExecError(
          `FD3 protocol: malformed error frame (need message): ${truncate(line)}`,
        );
      }
      const frame: ErrorFrame =
        typeof obj.stack === "string"
          ? { type: "error", message: obj.message, stack: obj.stack }
          : { type: "error", message: obj.message };
      return frame;
    }
    default:
      throw new ExecError(
        `FD3 protocol: unknown frame type '${String(obj.type)}': ${truncate(line)}`,
      );
  }
}

/** Encode a frame as a single newline-terminated JSON line. */
export function encodeFrame(frame: ProtocolFrame): string {
  return `${JSON.stringify(frame)}\n`;
}

/** Configuration for `ProtocolStreamParser`. */
export interface ProtocolStreamParserOptions {
  /** Called once per successfully parsed frame. */
  readonly onFrame: (frame: ProtocolFrame) => void;
  /** Called once per malformed line (or partial-line-at-EOF). The
   * parser does NOT abort the run; the caller decides what to do
   * with the error (typically: log + continue). */
  readonly onError: (err: ExecError) => void;
}

/**
 * Line-buffered parser for the FD3 stream. Feed it raw chunks via
 * `push(chunk)` as they arrive on the FD3 pipe; call `end()` once the
 * pipe closes so any partial line at end-of-stream surfaces as a
 * warning.
 */
export class ProtocolStreamParser {
  private buffer = "";
  private over = false;
  private readonly onFrame: (frame: ProtocolFrame) => void;
  private readonly onError: (err: ExecError) => void;

  constructor(opts: ProtocolStreamParserOptions) {
    this.onFrame = opts.onFrame;
    this.onError = opts.onError;
  }

  push(chunk: string): void {
    this.buffer += chunk;
    while (true) {
      if (this.buffer.length > PROTOCOL_MAX_LINE_BYTES) {
        // Look for a newline up to the cap. If none, drop and reset.
        const cap = this.buffer.indexOf("\n");
        if (cap === -1 || cap > PROTOCOL_MAX_LINE_BYTES) {
          this.over = true;
          this.onError(
            new ExecError(`FD3 protocol: line exceeds ${PROTOCOL_MAX_LINE_BYTES} bytes; dropped`),
          );
          this.buffer = "";
          return;
        }
      }
      const nl = this.buffer.indexOf("\n");
      if (nl === -1) return;
      const line = this.buffer.slice(0, nl);
      this.buffer = this.buffer.slice(nl + 1);
      if (this.over) {
        // We just dropped an over-long line; this one is its tail.
        this.over = false;
        continue;
      }
      if (line.length === 0) continue;
      try {
        this.onFrame(parseFrameLine(line));
      } catch (err) {
        if (err instanceof ExecError) {
          this.onError(err);
        } else {
          throw err;
        }
      }
    }
  }

  end(): void {
    if (this.buffer.length > 0) {
      this.onError(
        new ExecError(
          `FD3 protocol: stream ended on a partial line (${this.buffer.length} bytes); dropped`,
        ),
      );
      this.buffer = "";
    }
  }
}

const truncate = (line: string): string => (line.length <= 200 ? line : `${line.slice(0, 200)}…`);
