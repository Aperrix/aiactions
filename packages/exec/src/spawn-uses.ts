/**
 * `executeUsesStep` — parent-side spawn + IPC orchestrator for a
 * `step.uses:` invocation. Spawns the loader, writes the inputs
 * payload to stdin, threads FD 3 through `ProtocolStreamParser`,
 * captures stdout/stderr, drives abort + timeout via SIGTERM →
 * SIGKILL escalation, and returns the aggregated result.
 *
 * The shell-step orchestrator (`spawnShell`) is intentionally NOT
 * reused: it does not expose FD 3, does not write to stdin, and does
 * not need the loader-specific lifecycle. The two paths share the
 * same kill semantics by re-implementing the small POSIX
 * process-group kill primitive locally — a deliberate paste because
 * the surface is too small to warrant a third module.
 */

import { spawn, type ChildProcess } from "node:child_process";
import { fileURLToPath } from "node:url";

import type { ActionManifest, RuntimeEvent, RunStatus } from "@aiactions/schema";
import { ExecError } from "./errors.ts";

import { ProtocolStreamParser, type ErrorFrame, type ProtocolFrame } from "./protocol.ts";

/**
 * The shape `spawn-uses` needs to spawn a `uses:` action: the loaded
 * manifest plus the absolute directory the action lives in. The
 * resolver in `@aiactions/core` constructs values of this type and
 * passes them in.
 */
export interface ResolvedAction {
  readonly manifest: ActionManifest;
  readonly dir: string;
}

const KILL_GRACE_MS = 5000;
const isPosix = process.platform !== "win32";
const LOADER_URL = new URL("./loader.mjs", import.meta.url);
const LOADER_PATH = fileURLToPath(LOADER_URL);

/** Caller input for `executeUsesStep`. */
export interface UsesExecRequest {
  readonly resolved: ResolvedAction;
  readonly inputs: Readonly<Record<string, string>>;
  readonly env: NodeJS.ProcessEnv;
  readonly jobId: string;
  readonly stepIndex: number;
  readonly stepId: string | undefined;
  readonly signal?: AbortSignal;
  readonly timeoutMs?: number;
  readonly emit?: (event: RuntimeEvent) => void;
}

/** Output of `executeUsesStep`. */
export interface UsesExecResult {
  readonly status: RunStatus;
  readonly exitCode: number | null;
  readonly outputs: Record<string, string>;
  readonly stdout: string;
  readonly stderr: string;
  readonly capturedError?: { readonly message: string; readonly stack?: string };
  readonly protocolWarnings: readonly ExecError[];
}

const killProcess = (child: ChildProcess, signal: NodeJS.Signals): void => {
  if (isPosix && typeof child.pid === "number") {
    try {
      process.kill(-child.pid, signal);
    } catch (err) {
      const errno = (err as NodeJS.ErrnoException).code;
      if (errno !== "ESRCH") throw err;
    }
    return;
  }
  child.kill(signal);
};

/**
 * Run a `step.uses:` invocation end to end.
 */
export function executeUsesStep(request: UsesExecRequest): Promise<UsesExecResult> {
  const { resolved } = request;
  const mainPath = `${resolved.dir}/${resolved.manifest.runs.main.replace(/^\.\//, "")}`;

  return new Promise<UsesExecResult>((resolve, reject) => {
    const env: NodeJS.ProcessEnv = {
      ...request.env,
      RUNNER_ACTION_MAIN: mainPath,
    };

    const child = spawn(process.execPath, [LOADER_PATH], {
      cwd: resolved.dir,
      env,
      stdio: ["pipe", "pipe", "pipe", "pipe"],
      windowsHide: true,
      detached: isPosix,
    });

    const outputs: Record<string, string> = {};
    const warnings: ExecError[] = [];
    let stdout = "";
    let stderr = "";
    let killed = false;
    let timedOut = false;
    let killTimer: NodeJS.Timeout | undefined;
    let timeoutTimer: NodeJS.Timeout | undefined;
    let capturedError: ErrorFrame | undefined;

    const startKill = (reason: "abort" | "timeout"): void => {
      if (killed) return;
      killed = true;
      if (reason === "timeout") timedOut = true;
      killProcess(child, "SIGTERM");
      killTimer = setTimeout(() => {
        if (!child.killed) killProcess(child, "SIGKILL");
      }, KILL_GRACE_MS);
    };

    if (request.signal) {
      if (request.signal.aborted) {
        startKill("abort");
      } else {
        request.signal.addEventListener("abort", () => startKill("abort"), { once: true });
      }
    }

    if (request.timeoutMs !== undefined) {
      timeoutTimer = setTimeout(() => startKill("timeout"), request.timeoutMs);
    }

    const emit = request.emit;

    child.stdout?.setEncoding("utf-8");
    child.stdout?.on("data", (chunk: string) => {
      stdout += chunk;
      emit?.({
        kind: "step-stdout",
        at: Date.now(),
        jobId: request.jobId,
        stepIndex: request.stepIndex,
        chunk,
      });
    });
    child.stderr?.setEncoding("utf-8");
    child.stderr?.on("data", (chunk: string) => {
      stderr += chunk;
      emit?.({
        kind: "step-stderr",
        at: Date.now(),
        jobId: request.jobId,
        stepIndex: request.stepIndex,
        chunk,
      });
    });

    const fd3 = child.stdio[3];
    if (fd3 !== null && typeof fd3 === "object" && "setEncoding" in fd3) {
      fd3.setEncoding("utf-8");
      const parser = new ProtocolStreamParser({
        onFrame: (frame: ProtocolFrame) => {
          if (frame.type === "output") {
            outputs[frame.name] = frame.value;
            return;
          }
          if (frame.type === "error") {
            capturedError = frame;
            return;
          }
          // log frames: not surfaced as a runtime event in MS1.1; the
          // event union does not yet have a step-log kind. Captured
          // logs land in stderr for visibility (the loader writes them
          // to FD 3, not stderr — but downstream consumers can request
          // a future event kind without changing the protocol).
        },
        onError: (err) => warnings.push(err),
      });
      fd3.on("data", (chunk: string) => parser.push(chunk));
      fd3.on("end", () => parser.end());
    }

    child.once("error", (err) => {
      if (timeoutTimer) clearTimeout(timeoutTimer);
      if (killTimer) clearTimeout(killTimer);
      reject(err);
    });

    child.once("close", (code) => {
      if (timeoutTimer) clearTimeout(timeoutTimer);
      if (killTimer) clearTimeout(killTimer);
      const exitCode = killed ? null : code;
      const status: RunStatus =
        killed || (typeof exitCode === "number" && exitCode !== 0) ? "failed" : "succeeded";
      const result: UsesExecResult = {
        status,
        exitCode,
        outputs,
        stdout,
        stderr,
        ...(capturedError !== undefined && {
          capturedError:
            capturedError.stack !== undefined
              ? { message: capturedError.message, stack: capturedError.stack }
              : { message: capturedError.message },
        }),
        protocolWarnings: warnings,
      };
      // Suppress unused-var warning for `timedOut` — kept for future
      // event kind mapping; remove when a `kind: "step-timeout"` event
      // is introduced.
      void timedOut;
      resolve(result);
    });

    // Write inputs payload to stdin, then close.
    child.stdin?.write(JSON.stringify({ inputs: request.inputs }));
    child.stdin?.end();
  });
}
