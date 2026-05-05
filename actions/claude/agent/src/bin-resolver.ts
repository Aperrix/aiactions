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
 */

import { isExecutableSync, whichSync } from "./which.ts";

const INSTALL_HINT =
  "`claude` binary not found. " +
  "Install Claude Code (https://docs.anthropic.com/en/docs/claude-code/setup) " +
  "and run `claude login`. Alternatively, set the input " +
  "`path_to_claude_code_executable` or env var `AIACTIONS_CLAUDE_BIN`.";

/**
 * Resolve the `claude` binary path.
 *
 * Resolution order:
 * 1. Explicit input override (`path_to_claude_code_executable`).
 * 2. Env override (`AIACTIONS_CLAUDE_BIN`).
 * 3. PATH lookup via `whichSync("claude", env)`.
 *
 * Explicit overrides (1 and 2) are validated against `isExecutableSync`
 * — fail-fast with a precise error identifying which source supplied
 * the path so a typo surfaces immediately rather than as a confusing
 * spawn error later.
 *
 * @param inputOverride - Value of the `path_to_claude_code_executable` action input (may be empty string).
 * @param env - Process environment (used for `AIACTIONS_CLAUDE_BIN` and `PATH`).
 * @returns Absolute (or explicit) path to the `claude` binary.
 * @throws {Error} When the binary cannot be located, or when an explicit override path is not executable.
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
    return explicit;
  }

  const onPath = whichSync("claude", env);
  if (onPath) return onPath;
  throw new Error(INSTALL_HINT);
}
