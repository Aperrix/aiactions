import { join } from "node:path";

export interface ResolveRegistryRootOptions {
  /** Override `HOME` resolution. Tests inject a tmpdir; prod leaves unset. */
  readonly home?: string;
}

/**
 * Resolve the user-level actions cache root: `<HOME>/.aiactions/actions`.
 * Throws if `HOME` is not set and no override is provided.
 */
export function resolveRegistryRoot(options: ResolveRegistryRootOptions = {}): string {
  const home = options.home ?? process.env.HOME;
  if (!home) {
    throw new Error("HOME is not set; cannot locate ~/.aiactions/actions cache root");
  }
  return join(home, ".aiactions", "actions");
}
