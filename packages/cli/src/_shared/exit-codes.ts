import {
  RegistryFetchError,
  RegistryResolveError,
  RegistryValidationError,
} from "@aiactions/registry";
import type { AIactionsError } from "@aiactions/schema";

/**
 * Process exit codes used by `aia`. Aligned with sysexits convention
 * (0 = OK, 2 = USAGE, 4 = data not found) plus a custom CONFLICT slot
 * reserved for future install/overwrite flows.
 */
export const EXIT = {
  OK: 0,
  RUNTIME: 1,
  USAGE: 2,
  NOT_FOUND: 4,
  CONFLICT: 5,
  REGISTRY: 6,
  SCHEMA: 7,
} as const;

export type ExitCode = (typeof EXIT)[keyof typeof EXIT];

/**
 * Map a concrete brick-error constructor to the exit code the CLI uses
 * when that error reaches the top-level handler. Brick errors extend
 * `AIactionsError` (not `CliError`) and therefore do not carry an
 * exit-code field of their own — this table is the single source of
 * truth for that mapping.
 */
export const EXIT_BY_BRICK_ERROR: ReadonlyMap<
  new (message: string, options?: ErrorOptions) => AIactionsError,
  ExitCode
> = new Map<new (message: string, options?: ErrorOptions) => AIactionsError, ExitCode>([
  [RegistryFetchError, EXIT.REGISTRY],
  [RegistryResolveError, EXIT.REGISTRY],
  [RegistryValidationError, EXIT.REGISTRY],
]);
