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
 * Note: `python` is now wired up — `shell: python` produces a literal
 * `python {0}` invocation per the GHA spec. No fail-fast flag is
 * injected (Python's exception → SystemExit path is the contract).
 */

import { execFile } from "node:child_process";
import { promisify } from "node:util";

import { BUILTIN_SHELLS, customShellTemplateRegex, type Shell } from "@aiactions/workflows";

import { RuntimeUnsupportedError } from "../types/errors.ts";

const pExecFile = promisify(execFile);

/**
 * Probes whether `bash` is reachable on PATH by running `bash --version`.
 * Returns `false` on any spawn error (typically `ENOENT`). Callers should
 * memoise the result for the duration of a single workflow run; the cost
 * is one process spawn (~10 ms) and the answer cannot change inside a run.
 */
export async function probeBashAvailability(): Promise<boolean> {
  try {
    await pExecFile("bash", ["--version"]);
    return true;
  } catch {
    return false;
  }
}

/** Result of parsing a custom GHA shell template string. */
export interface ParsedCustomShellTemplate {
  /** First whitespace-delimited token of the template. */
  readonly bin: string;
  /** Tokens between `bin` and `{0}`. */
  readonly preArgs: readonly string[];
  /** Tokens after `{0}`. */
  readonly postArgs: readonly string[];
}

/**
 * Parse a GHA shell template string of the form
 * `<cmd> [opts] {0} [more_opts]` into its components. The schema layer
 * has already validated the regex shape; this function trusts that and
 * tokenises by whitespace.
 *
 * @throws {RuntimeUnsupportedError} if `{0}` is not present (defensive
 *   — should be blocked at the schema layer).
 */
export function parseCustomShellTemplate(template: string): ParsedCustomShellTemplate {
  const tokens = template.trim().split(/\s+/);
  const placeholderIdx = tokens.indexOf("{0}");
  if (placeholderIdx === -1) {
    throw new RuntimeUnsupportedError(`shell template missing {0}: ${template}`);
  }
  const bin = tokens[0]!;
  const preArgs = tokens.slice(1, placeholderIdx);
  const postArgs = tokens.slice(placeholderIdx + 1);
  return { bin, preArgs, postArgs };
}

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
 * Translate a `(shell, scriptPath, platform, bashAvailable)` tuple into
 * the concrete binary + argv that should be spawned to execute the step.
 * Mirrors GHA's documented behaviour:
 *
 * | Platform     | shell value | Invocation                                            | Extension |
 * | ------------ | ----------- | ----------------------------------------------------- | --------- |
 * | Linux/macOS  | unspecified | `bash -e <script>` (or `sh -e <script>` if bash is missing) | `.sh`     |
 * | All          | `bash`      | `bash --noprofile --norc -e -o pipefail <script>`     | `.sh`     |
 * | Linux/macOS  | `sh`        | `sh -e <script>`                                      | `.sh`     |
 * | All          | `pwsh`      | `pwsh -command ". '<script>'"`                        | `.ps1`    |
 * | All          | `python`    | `python <script>`                                     | (none)    |
 * | Windows      | unspecified | `pwsh -command ". '<script>'"`                        | `.ps1`    |
 * | Windows      | `cmd`       | `%ComSpec% /D /E:ON /V:OFF /S /C "CALL \"<script>\""` | `.cmd`    |
 *
 * The `bashAvailable` parameter only affects the POSIX platform-default
 * branch; explicit `shell: bash` always returns a bash invocation, even
 * when the binary is absent (the spawn layer surfaces the `ENOENT`).
 *
 * @param shell - Author-declared `step.shell` value or `undefined` for
 *   the platform default.
 * @param scriptPath - Absolute path of the tmpfile containing the
 *   step's script body (already on disk).
 * @param platform - Target platform (`process.platform`); injected so
 *   the function stays pure and table-testable.
 * @param bashAvailable - Whether `bash` is reachable on PATH. Probed
 *   once per workflow run via `probeBashAvailability` and threaded
 *   through `JobRunRequest`. Tests inject `true`/`false` directly.
 * @returns The shell invocation to spawn.
 * @throws {RuntimeUnsupportedError} when (a) `shell === 'sh'` on
 *   Windows, or (b) `shell === 'cmd'` on a non-Windows platform.
 */
export function getShellInvocation(
  shell: Shell | undefined,
  scriptPath: string,
  platform: NodeJS.Platform,
  bashAvailable: boolean,
): ShellInvocation {
  // Custom template: any non-builtin string. The schema regex has
  // already validated the `<cmd> [opts] {0} [more]` shape; we trust
  // it and route through the parser. When the author writes a
  // template — even one whose first token matches a built-in name
  // (e.g. `bash {0}`) — the runtime executes it verbatim, with no
  // injected default flags.
  if (typeof shell === "string" && !(BUILTIN_SHELLS as readonly string[]).includes(shell)) {
    if (!customShellTemplateRegex.test(shell)) {
      throw new RuntimeUnsupportedError(
        `shell value is neither a built-in nor a valid template: ${shell}`,
      );
    }
    const parsed = parseCustomShellTemplate(shell);
    return {
      bin: parsed.bin,
      args: [...parsed.preArgs, scriptPath, ...parsed.postArgs],
      extension: "",
    };
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
  if (shell === "python") {
    return { bin: "python", args: [scriptPath], extension: "" };
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
  if (bashAvailable) {
    return { bin: "bash", args: ["-e", scriptPath], extension: ".sh" };
  }
  return { bin: "sh", args: ["-e", scriptPath], extension: ".sh" };
}
