/**
 * `@aiactions/registry` error hierarchy.
 *
 * - `RegistryError` — abstract base for the package. Cannot be
 *   instantiated directly; subclass and throw the concrete subclass.
 * - `RegistryFetchError` — git clone, sparse-checkout, rev-parse, or
 *   destination filesystem operations failed; or registry-index HTTP fetch
 *   failed (network, non-2xx, timeout).
 * - `RegistryResolveError` — `git ls-remote` failed or no published tag
 *   matches the requested major-range.
 * - `RegistryValidationError` — registry index JSON is malformed or
 *   fails Zod validation against `registrySchema`.
 *
 * Folds the previous runtime `LockfileVersionMismatch` (lockfile-side)
 * and `ActionResolutionError` (registry-fetch-side) into this hierarchy
 * per spec section 10.1.
 */

import { AIactionsError } from "@aiactions/schema";

export abstract class RegistryError extends AIactionsError {
  constructor(message: string, options?: ErrorOptions) {
    if (new.target === RegistryError) {
      throw new Error("RegistryError is abstract; instantiate a concrete subclass");
    }
    super(message, options);
  }
}

export class RegistryFetchError extends RegistryError {}

export class RegistryResolveError extends RegistryError {}

export class RegistryValidationError extends RegistryError {}
