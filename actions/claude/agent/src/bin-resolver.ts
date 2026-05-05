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

import { whichSync } from "./which.ts";

const INSTALL_HINT =
  "`claude` binary not found. " +
  "Install Claude Code (https://docs.anthropic.com/en/docs/claude-code/setup) " +
  "and run `claude login`. Alternatively, set the input " +
  "`path_to_claude_code_executable` or env var `AIACTIONS_CLAUDE_BIN`.";

/**
 * Resolve the `claude` binary path.
 *
 * @param inputOverride - Value of the `path_to_claude_code_executable` action input (may be empty string).
 * @param env - Process environment (used for `AIACTIONS_CLAUDE_BIN` and `PATH`).
 * @returns Absolute (or explicit) path to the `claude` binary.
 * @throws {Error} When the binary cannot be located by any strategy.
 */
export function resolveClaudeBinary(
  inputOverride: string | undefined,
  env: NodeJS.ProcessEnv,
): string {
  const explicit =
    inputOverride && inputOverride.length > 0 ? inputOverride : env.AIACTIONS_CLAUDE_BIN;
  if (explicit && explicit.length > 0) return explicit;
  const onPath = whichSync("claude", env);
  if (onPath) return onPath;
  throw new Error(INSTALL_HINT);
}
