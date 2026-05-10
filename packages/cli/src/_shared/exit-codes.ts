import { JobError, OrchestrationError, StepError } from "@aiactions/core";
import { NotInGitRepoError } from "@aiactions/discovery";
import {
  RegistryFetchError,
  RegistryResolveError,
  RegistryValidationError,
} from "@aiactions/registry";
import {
  type AIactionsError,
  WorkflowParseError,
  WorkflowSchemaError,
  WorkflowValidationError,
} from "@aiactions/schema";

/**
 * Process exit codes used by `aia`. Aligned with sysexits convention
 * (0 = OK, 2 = USAGE, 4 = data not found) plus a custom CONFLICT slot
 * reserved for future install/overwrite flows and a custom RUN_FAILED
 * slot used when a workflow ran end-to-end but a step exited non-zero.
 */
export const EXIT = {
  OK: 0,
  RUNTIME: 1,
  USAGE: 2,
  NOT_FOUND: 4,
  CONFLICT: 5,
  REGISTRY: 6,
  SCHEMA: 7,
  RUN_FAILED: 8,
} as const;

export type ExitCode = (typeof EXIT)[keyof typeof EXIT];

/**
 * Map a concrete brick-error constructor to the exit code the CLI uses
 * when that error reaches the top-level handler. Brick errors extend
 * `AIactionsError` (not `CliError`) and therefore do not carry an
 * exit-code field of their own — this table is the single source of
 * truth for that mapping.
 *
 * The key type uses `(...args: any[])` because the table is a
 * constructor-identity lookup (`err.constructor`), the signature is
 * never invoked. Some brick errors (e.g. `NotInGitRepoError`) carry
 * non-`(message, options?)` constructor signatures and would otherwise
 * fail to type-fit a strict shape.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type BrickErrorCtor = abstract new (...args: any[]) => AIactionsError;

export const EXIT_BY_BRICK_ERROR: ReadonlyMap<BrickErrorCtor, ExitCode> = new Map<
  BrickErrorCtor,
  ExitCode
>([
  [RegistryFetchError, EXIT.REGISTRY],
  [RegistryResolveError, EXIT.REGISTRY],
  [RegistryValidationError, EXIT.REGISTRY],

  [WorkflowParseError, EXIT.SCHEMA],
  [WorkflowSchemaError, EXIT.SCHEMA],
  [WorkflowValidationError, EXIT.SCHEMA],

  [NotInGitRepoError, EXIT.USAGE],

  // Phase 6.5: runtime orchestrator-side crashes. A step exiting non-zero
  // is NOT a throw — it propagates as RunResult.status="failed" and is
  // mapped to EXIT.RUN_FAILED in the slice itself.
  [JobError, EXIT.RUNTIME],
  [StepError, EXIT.RUNTIME],
  [OrchestrationError, EXIT.RUNTIME],
]);
