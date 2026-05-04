/**
 * Pure GHA-faithful mapping from `(shell, scriptPath, platform)` to a
 * concrete `(bin, args, extension)` shell invocation. The runtime later
 * spawns `bin` with `args` (no `shell:true`); per the GHA spec, the
 * script body is written to a tmpfile and substituted as `{0}`.
 *
 * Reference:
 * https://docs.github.com/en/actions/reference/workflows-and-actions/workflow-syntax#jobsjob_idstepsshell
 *
 * Linux/macOS support is fully native. Windows support is best-effort
 * and currently UNTESTED on a real Windows machine; the code paths are
 * present so a Windows contributor can verify and patch incrementally
 * without an architectural change.
 *
 * Contents:
 * - `ShellInvocation` — `{ bin, args, extension }`.
 * - `getShellInvocation(shell, scriptPath, platform)` — pure mapping.
 *
 * Note: `python` is accepted by the workflow schema (so authors can
 * write fixtures targeting a future runtime) but rejected here with
 * `RuntimeUnsupportedError`. Running Python steps requires an external
 * interpreter contract that is deferred past MS1.0.
 *
 * Note: this module does NOT implement the GHA Linux fallback "if bash
 * not on PATH, retry with sh". That is the caller's job — shell-spec
 * reports what GHA documents; the job runner catches ENOENT on the
 * first spawn and retries via `getShellInvocation("sh", ...)`.
 */

import type { Shell } from "@aiactions/workflows";

import { RuntimeUnsupportedError } from "../types/errors.ts";

/** Output of `getShellInvocation`. */
export interface ShellInvocation {
  /** Binary name to spawn. Resolved through `PATH` by `child_process.spawn`. */
  readonly bin: string;
  /** Argument vector. The script path is already substituted in. */
  readonly args: readonly string[];
  /** Extension expected on the tmpfile (`.sh`, `.ps1`, `.cmd`). */
  readonly extension: string;
}

/**
 * Translate a `(shell, scriptPath, platform)` triple into the concrete
 * binary + argv that should be spawned to execute the step. Mirrors
 * GHA's documented behaviour:
 *
 * | Platform     | shell value | Invocation                                            | Extension |
 * | ------------ | ----------- | ----------------------------------------------------- | --------- |
 * | Linux/macOS  | unspecified | `bash -e <script>`                                    | `.sh`     |
 * | All          | `bash`      | `bash --noprofile --norc -e -o pipefail <script>`     | `.sh`     |
 * | Linux/macOS  | `sh`        | `sh -e <script>`                                      | `.sh`     |
 * | All          | `pwsh`      | `pwsh -command ". '<script>'"`                        | `.ps1`    |
 * | Windows      | unspecified | `pwsh -command ". '<script>'"`                        | `.ps1`    |
 * | Windows      | `cmd`       | `%ComSpec% /D /E:ON /V:OFF /S /C "CALL \"<script>\""` | `.cmd`    |
 *
 * @param shell - Author-declared `step.shell` value or `undefined` for
 *   the platform default.
 * @param scriptPath - Absolute path of the tmpfile containing the
 *   step's script body (already on disk).
 * @param platform - Target platform (`process.platform`); injected so
 *   the function stays pure and table-testable.
 * @returns The shell invocation to spawn.
 * @throws {RuntimeUnsupportedError} when (a) `shell === 'python'`,
 *   (b) `shell === 'sh'` on Windows, or
 *   (c) `shell === 'cmd'` on a non-Windows platform.
 */
export function getShellInvocation(
  shell: Shell | undefined,
  scriptPath: string,
  platform: NodeJS.Platform,
): ShellInvocation {
  if (shell === "python") {
    throw new RuntimeUnsupportedError("shell: python is not yet supported (deferred past MS1.0)");
  }
  if (shell === "sh" && platform === "win32") {
    throw new RuntimeUnsupportedError("shell: sh is not available on Windows");
  }
  if (shell === "cmd" && platform !== "win32") {
    throw new RuntimeUnsupportedError("shell: cmd is only available on Windows");
  }

  if (shell === "bash") {
    return {
      bin: "bash",
      args: ["--noprofile", "--norc", "-e", "-o", "pipefail", scriptPath],
      extension: ".sh",
    };
  }
  if (shell === "sh") {
    return { bin: "sh", args: ["-e", scriptPath], extension: ".sh" };
  }
  if (shell === "pwsh") {
    return {
      bin: "pwsh",
      args: ["-command", `. '${scriptPath}'`],
      extension: ".ps1",
    };
  }
  if (shell === "cmd") {
    return {
      bin: process.env.ComSpec ?? "cmd.exe",
      args: ["/D", "/E:ON", "/V:OFF", "/S", "/C", `CALL "${scriptPath}"`],
      extension: ".cmd",
    };
  }

  // shell === undefined: platform default.
  if (platform === "win32") {
    return {
      bin: "pwsh",
      args: ["-command", `. '${scriptPath}'`],
      extension: ".ps1",
    };
  }
  return { bin: "bash", args: ["-e", scriptPath], extension: ".sh" };
}
