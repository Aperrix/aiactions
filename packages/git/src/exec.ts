/**
 * Low-level `git` invocation. All higher-level helpers in this package
 * funnel through `gitExec`; consumers wanting raw access can call it
 * directly when no helper exists.
 *
 * Captures stdout/stderr in memory. `git` is invoked via `execFile`
 * (argv array, no shell) for safety against argument injection.
 */

import { execFile } from "node:child_process";
import { promisify } from "node:util";

import { GitError } from "./errors.ts";

const pExecFile = promisify(execFile);

export interface GitExecOptions {
  /** Working directory for the spawned process. Defaults to current cwd. */
  readonly cwd?: string;
}

export interface GitExecResult {
  readonly stdout: string;
  readonly stderr: string;
}

export async function gitExec(
  args: readonly string[],
  options: GitExecOptions = {},
): Promise<GitExecResult> {
  try {
    const result = await pExecFile(
      "git",
      args as string[],
      options.cwd !== undefined ? { cwd: options.cwd } : {},
    );
    return { stdout: result.stdout.toString(), stderr: result.stderr.toString() };
  } catch (err) {
    const e = err as Error & { stderr?: string | Buffer; code?: number };
    const stderr = e.stderr !== undefined ? e.stderr.toString() : "";
    const code = typeof e.code === "number" ? e.code : 1;
    throw new GitError(`git ${args.join(" ")} exited ${code}: ${stderr.trim()}`, {
      args,
      stderr,
      code,
      cause: e,
    });
  }
}
