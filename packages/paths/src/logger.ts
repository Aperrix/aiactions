/**
 * Structured logger writing one line per call to a sink (default: stderr).
 * Level filtering threshold defaults to `info`, or `debug` when AIA_DEBUG
 * is truthy in the loaded env.
 */

import { loadEnv } from "./env.ts";

export type LogLevel = "debug" | "info" | "warn" | "error";

export interface Logger {
  debug(msg: string, meta?: Record<string, unknown>): void;
  info(msg: string, meta?: Record<string, unknown>): void;
  warn(msg: string, meta?: Record<string, unknown>): void;
  error(msg: string, meta?: Record<string, unknown>): void;
}

export interface LoggerOptions {
  /** Override the threshold. Defaults to `debug` if AIA_DEBUG, else `info`. */
  readonly minLevel?: LogLevel;
  /** Override the sink. Defaults to `process.stderr.write`. */
  readonly sink?: (line: string) => void;
}

const ORDER: Record<LogLevel, number> = { debug: 0, info: 1, warn: 2, error: 3 };

export function createLogger(options: LoggerOptions = {}): Logger {
  const env = loadEnv();
  const minLevel: LogLevel = options.minLevel ?? (env.debug ? "debug" : "info");
  const sink =
    options.sink ??
    ((line: string) => {
      process.stderr.write(line);
    });

  const emit = (level: LogLevel, msg: string, meta?: Record<string, unknown>) => {
    if (ORDER[level] < ORDER[minLevel]) return;
    const metaPart = meta !== undefined ? ` ${JSON.stringify(meta)}` : "";
    sink(`[${level}] ${msg}${metaPart}\n`);
  };

  return {
    debug: (msg, meta) => emit("debug", msg, meta),
    info: (msg, meta) => emit("info", msg, meta),
    warn: (msg, meta) => emit("warn", msg, meta),
    error: (msg, meta) => emit("error", msg, meta),
  };
}
