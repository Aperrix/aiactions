/**
 * Thin wrapper around `node:child_process.spawn` for executing a shell
 * invocation produced by `getShellInvocation` against a tmpfile written
 * by `writeScript`. Captures stdio, plumbs an optional `AbortSignal`,
 * and supports a wall-clock timeout that escalates SIGTERM → SIGKILL.
 *
 * Does NOT understand workflows, jobs or steps — those concerns live
 * in the job runner (`runner/job.ts`, MS1.0.e). This module exists so
 * the runner can stay focused on policy (env merge, if-evaluation,
 * outputs) without re-deriving low-level process plumbing.
 *
 * Contents:
 * - `SpawnRequest` — input options.
 * - `SpawnResult` — `{ exitCode, stdout, stderr, killed, timedOut }`.
 * - `spawnShell(request)` — returns once the process has exited.
 */

import { spawn } from "node:child_process";

/** Input to `spawnShell`. */
export interface SpawnRequest {
  /** Binary to execve (resolved through `PATH`). */
  readonly bin: string;
  /** Argument vector. */
  readonly args: readonly string[];
  /** Working directory for the child process. */
  readonly cwd: string;
  /** Full env to expose to the child; the runner curates this upstream. */
  readonly env: NodeJS.ProcessEnv;
  /** Caller cancellation token. Aborting starts a SIGTERM → SIGKILL escalation. */
  readonly signal?: AbortSignal;
  /** Hard wall-clock cap. Once elapsed, same SIGTERM → SIGKILL escalation. */
  readonly timeoutMs?: number;
  /** Stdout chunk callback (decoded UTF-8, not line-buffered). */
  readonly onStdout?: (chunk: string) => void;
  /** Stderr chunk callback (decoded UTF-8, not line-buffered). */
  readonly onStderr?: (chunk: string) => void;
}

/** Output of `spawnShell`. */
export interface SpawnResult {
  /** Process exit code; `null` if the child was killed before exiting. */
  readonly exitCode: number | null;
  /** Aggregated stdout, decoded as UTF-8. */
  readonly stdout: string;
  /** Aggregated stderr, decoded as UTF-8. */
  readonly stderr: string;
  /** `true` if the runtime sent any kill signal to the child. */
  readonly killed: boolean;
  /** `true` if the kill was triggered by `timeoutMs` (vs `signal.abort()`). */
  readonly timedOut: boolean;
}

/** Grace period between SIGTERM and SIGKILL, milliseconds. */
const KILL_GRACE_MS = 5000;

const isPosix = process.platform !== "win32";

/**
 * Send a signal to the child. On POSIX, target the whole process group
 * (negative PID) so children spawned by the shell — `sleep`, `npm
 * install`, etc. — also receive it; otherwise SIGTERM kills the shell
 * but leaves orphans holding the stdio pipes open, which prevents the
 * `close` event from firing. On Windows, fall back to the standard
 * per-PID `child.kill()`.
 */
const killProcess = (child: ReturnType<typeof spawn>, signal: NodeJS.Signals): void => {
  if (isPosix && typeof child.pid === "number") {
    try {
      process.kill(-child.pid, signal);
    } catch (err) {
      // ESRCH = group already gone; tolerate.
      const errno = (err as NodeJS.ErrnoException).code;
      if (errno !== "ESRCH") throw err;
    }
    return;
  }
  child.kill(signal);
};

/**
 * Run a shell invocation and resolve once the process has exited or
 * been killed.
 *
 * Behaviour:
 * - stdio is captured into UTF-8 strings; `onStdout` / `onStderr` are
 *   invoked synchronously per chunk for streaming consumers.
 * - On `signal.abort()` or `timeoutMs` elapsing, the child (and on
 *   POSIX its whole process group) receives SIGTERM. If it has not
 *   exited after `KILL_GRACE_MS` (5 s), SIGKILL is sent.
 * - The returned promise NEVER rejects on a non-zero exit code — the
 *   caller inspects `exitCode` to decide whether the step failed. The
 *   promise REJECTS only when `child_process.spawn` itself emits an
 *   `error` event (e.g. `ENOENT` for an unknown binary).
 */
export function spawnShell(request: SpawnRequest): Promise<SpawnResult> {
  return new Promise<SpawnResult>((resolve, reject) => {
    const child = spawn(request.bin, [...request.args], {
      cwd: request.cwd,
      env: request.env,
      stdio: ["ignore", "pipe", "pipe"],
      windowsHide: true,
      // POSIX-only: make the child its own process group leader so we
      // can signal the whole group via `process.kill(-pid, sig)`. The
      // parent still waits on the child because we never call
      // `child.unref()`.
      detached: isPosix,
    });

    let stdout = "";
    let stderr = "";
    let killed = false;
    let timedOut = false;
    let killTimer: NodeJS.Timeout | undefined;
    let timeoutTimer: NodeJS.Timeout | undefined;

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

    child.stdout?.setEncoding("utf8");
    child.stdout?.on("data", (chunk: string) => {
      stdout += chunk;
      request.onStdout?.(chunk);
    });
    child.stderr?.setEncoding("utf8");
    child.stderr?.on("data", (chunk: string) => {
      stderr += chunk;
      request.onStderr?.(chunk);
    });

    child.once("error", (err) => {
      if (timeoutTimer) clearTimeout(timeoutTimer);
      if (killTimer) clearTimeout(killTimer);
      reject(err);
    });

    child.once("close", (code) => {
      if (timeoutTimer) clearTimeout(timeoutTimer);
      if (killTimer) clearTimeout(killTimer);
      resolve({
        exitCode: killed ? null : code,
        stdout,
        stderr,
        killed,
        timedOut,
      });
    });
  });
}
