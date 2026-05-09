/**
 * `@aiactions/registry` error hierarchy.
 *
 * - `RegistryError` — abstract base for the package.
 * - `RegistryFetchError` — git clone, sparse-checkout, rev-parse, or
 *   destination filesystem operations failed.
 * - `RegistryResolveError` — `git ls-remote` failed or no published tag
 *   matches the requested major-range.
 *
 * Folds the previous runtime `LockfileVersionMismatch` (lockfile-side)
 * and `ActionResolutionError` (registry-fetch-side) into this hierarchy
 * per spec section 10.1.
 */

import { AIactionsError } from "@aiactions/schema";

export abstract class RegistryError extends AIactionsError {}

export class RegistryFetchError extends RegistryError {}

export class RegistryResolveError extends RegistryError {}
