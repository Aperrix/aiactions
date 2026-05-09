import { join } from "node:path";

import { loadEnv, type Env } from "./env.ts";

export interface PathsResolveOptions {
  /** Override the loaded env. Defaults to `loadEnv()`. */
  readonly env?: Env;
}

/** Thrown when path resolution requires a home directory but none is set. */
export class HomeUnresolvedError extends Error {
  constructor() {
    super("No home directory: set $HOME or AIA_HOME");
    this.name = "HomeUnresolvedError";
  }
}

/**
 * Resolve `<home>/.aiactions/actions/`, the per-user actions cache.
 * AIA_REGISTRY_ROOT, when set, short-circuits the computation and is
 * returned verbatim.
 */
export function resolveRegistryRoot(options: PathsResolveOptions = {}): string {
  const env = options.env ?? loadEnv();
  if (env.registryRoot !== undefined && env.registryRoot !== "") {
    return env.registryRoot;
  }
  if (env.home === "") {
    throw new HomeUnresolvedError();
  }
  return join(env.home, ".aiactions", "actions");
}

/**
 * Resolve `<home>/.aiactions/cache/`, reserved for non-action caches
 * (HTTP responses, fetched archives) — currently unused by the runtime
 * but exposed so future consumers can opt in without a breaking change.
 */
export function resolveCacheRoot(options: PathsResolveOptions = {}): string {
  const env = options.env ?? loadEnv();
  if (env.home === "") {
    throw new HomeUnresolvedError();
  }
  return join(env.home, ".aiactions", "cache");
}

/**
 * Resolve `<registryRoot>/.tmp/`, the EXDEV-safe staging dir for
 * registry fetches (per the MS1.8.6 default). AIA_TMP_ROOT, when set,
 * short-circuits the computation.
 */
export function resolveTmpRoot(options: PathsResolveOptions = {}): string {
  const env = options.env ?? loadEnv();
  if (env.tmpRoot !== undefined && env.tmpRoot !== "") {
    return env.tmpRoot;
  }
  return join(resolveRegistryRoot({ env }), ".tmp");
}
