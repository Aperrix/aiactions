/**
 * `@aiactions/core` error hierarchy.
 *
 * - `RunnerError` — abstract base for orchestrator-side failures.
 * - `JobError` — declared but currently unused; reserved for
 *   future job-level failure modes.
 * - `StepError` — declared but currently unused.
 * - `OrchestrationError` — concrete sink for any orchestrator-side
 *   failure that is not job- or step-scoped (missing workflow file,
 *   manifest validation failure, unsupported runtime feature).
 *
 * Folds the previous runtime `RuntimeUnsupportedError` (raised by
 * runner/job and runner/uses/resolver), `ActionResolutionError`
 * (raised by resolver), and `ActionManifestError` (raised by resolver)
 * into `RunnerError` / `OrchestrationError`, per spec section 10.1.
 */

import { AIactionsError } from "@aiactions/schema";

export abstract class RunnerError extends AIactionsError {}

export class JobError extends RunnerError {}

export class StepError extends RunnerError {}

export class OrchestrationError extends RunnerError {}
