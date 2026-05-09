/**
 * Environment-variable parsing for AIactions runtime configuration.
 *
 * Recognized vars:
 * - AIA_HOME           — overrides $HOME for path resolution
 * - AIA_REGISTRY_ROOT  — full path to the actions registry root
 * - AIA_TMP_ROOT       — full path to the tmp/staging dir
 * - AIA_DEBUG          — when truthy, enables debug logging
 */

export interface Env {
  /** Resolved home directory. AIA_HOME overrides $HOME. Empty string if neither set. */
  readonly home: string;
  /** Optional explicit registry root override (AIA_REGISTRY_ROOT). */
  readonly registryRoot?: string;
  /** Optional explicit tmp root override (AIA_TMP_ROOT). */
  readonly tmpRoot?: string;
  /** Debug logging enabled (AIA_DEBUG truthy). */
  readonly debug: boolean;
}

export interface LoadEnvOptions {
  /** Override the env source. Defaults to `process.env`. */
  readonly source?: NodeJS.ProcessEnv;
}

export function loadEnv(options: LoadEnvOptions = {}): Env {
  const env = options.source ?? process.env;
  const home = env.AIA_HOME ?? env.HOME ?? "";
  const registryRoot = env.AIA_REGISTRY_ROOT;
  const tmpRoot = env.AIA_TMP_ROOT;
  const debug = Boolean(env.AIA_DEBUG);
  return { home, registryRoot, tmpRoot, debug };
}
