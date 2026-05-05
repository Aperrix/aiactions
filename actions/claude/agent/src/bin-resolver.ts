/**
 * Resolves the user's local `claude` binary. Resolution order:
 * 1. Explicit input (`path_to_claude_code_executable`).
 * 2. Env override (`AIACTIONS_CLAUDE_BIN`).
 * 3. PATH lookup via `whichSync("claude", env)`.
 *
 * Throws a friendly error pointing the user at the install + login
 * commands when none of the above succeed.
 *
 * Contents:
 * - `resolveClaudeBinary(inputOverride, env)` — returns the path or throws.
 * - `isUnsafePath(p)` — rejects world-writable temp prefixes.
 */

import { realpathSync } from "node:fs";

import { isExecutableSync, whichSync } from "./which.ts";

const INSTALL_HINT =
  "`claude` binary not found. " +
  "Install Claude Code (https://docs.anthropic.com/en/docs/claude-code/setup) " +
  "and run `claude login`. Alternatively, set the input " +
  "`path_to_claude_code_executable` or env var `AIACTIONS_CLAUDE_BIN`.";

/**
 * Returns true when `absolutePath` resolves into a world-writable temp
 * directory (`/tmp` or `/var/tmp`). Used to reject explicit binary
 * overrides that could be injected by a prior workflow step.
 *
 * The PATH-lookup branch is intentionally excluded — a `claude` binary
 * placed on PATH is a deliberate developer choice we do not second-guess.
 *
 * @param absolutePath - Already-canonicalized absolute path.
 */
function isUnsafePath(absolutePath: string): boolean {
  return absolutePath.startsWith("/tmp/") || absolutePath.startsWith("/var/tmp/");
}

/**
 * Resolve the `claude` binary path.
 *
 * Resolution order:
 * 1. Explicit input override (`path_to_claude_code_executable`).
 * 2. Env override (`AIACTIONS_CLAUDE_BIN`).
 * 3. PATH lookup via `whichSync("claude", env)`.
 *
 * Explicit overrides (1 and 2) are validated against `isExecutableSync`,
 * canonicalized via `realpathSync` (resolves symlinks), and then checked
 * against `isUnsafePath` — fail-fast with a precise error identifying
 * which source supplied the path so a typo or injection surfaces
 * immediately rather than as a confusing spawn error later.
 *
 * @param inputOverride - Value of the `path_to_claude_code_executable` action input (may be empty string).
 * @param env - Process environment (used for `AIACTIONS_CLAUDE_BIN` and `PATH`).
 * @returns Absolute (or explicit) path to the `claude` binary.
 * @throws {Error} When the binary cannot be located, when an explicit override path is not executable,
 *   or when the resolved path falls under a world-writable temp directory.
 */
export function resolveClaudeBinary(
  inputOverride: string | undefined,
  env: NodeJS.ProcessEnv,
): string {
  const fromInput = inputOverride && inputOverride.length > 0 ? inputOverride : undefined;
  const fromEnv =
    !fromInput && env.AIACTIONS_CLAUDE_BIN && env.AIACTIONS_CLAUDE_BIN.length > 0
      ? env.AIACTIONS_CLAUDE_BIN
      : undefined;
  const explicit = fromInput ?? fromEnv;

  if (explicit !== undefined) {
    if (!isExecutableSync(explicit)) {
      const source = fromInput
        ? `"path_to_claude_code_executable" input`
        : `"AIACTIONS_CLAUDE_BIN" env`;
      throw new Error(
        `\`claude\` binary not accessible at '${explicit}'. ` +
          `Check that the path exists and is executable. (Source: ${source})`,
      );
    }
    const resolved = realpathSync(explicit);
    if (isUnsafePath(resolved)) {
      const source = fromInput
        ? `"path_to_claude_code_executable" input`
        : `"AIACTIONS_CLAUDE_BIN" env`;
      throw new Error(
        `\`claude\` binary resolves to an unsafe path '${resolved}' ` +
          `(under a world-writable temp directory). ` +
          `Set the input or env to a path outside /tmp and /var/tmp. (Source: ${source})`,
      );
    }
    return resolved;
  }

  const onPath = whichSync("claude", env);
  if (onPath) return onPath;
  throw new Error(INSTALL_HINT);
}
