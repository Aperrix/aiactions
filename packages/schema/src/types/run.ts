/**
 * Outcome types for a workflow run. Three terminal statuses are exposed
 * in MS1.0; the union is left open at the type level so future
 * milestones can add `cancelled` / `timed-out` without breaking
 * consumers that exhaustive-switch on the current set.
 *
 * Contents:
 * - `RunStatus` — `succeeded | failed | skipped`.
 * - `StepResult` — one entry per step the runner reached. Skipped steps
 *   carry `status: 'skipped'`, `exitCode: null` and empty stdio.
 * - `JobResult` — aggregated step outcomes plus declared `outputs:`.
 * - `RunResult` — top-level summary returned by `runWorkflow`.
 *
 * Timestamps are wall-clock milliseconds (`Date.now()` semantics) so
 * consumers can compute durations without keeping the runner alive.
 */

/** Terminal status of a step, job or whole run. */
export type RunStatus = "succeeded" | "failed" | "skipped";

/** Outcome of a single step the runner attempted. */
export interface StepResult {
  /** Author-declared `id:` if any, else `undefined`. */
  readonly id: string | undefined;
  /** Zero-based index of the step within its parent job. */
  readonly index: number;
  /** Terminal status of the step. */
  readonly status: RunStatus;
  /** Process exit code; `null` if the step never spawned (skipped) or
   * was killed before exiting (timeout / cancellation). */
  readonly exitCode: number | null;
  /** Captured stdout, decoded as UTF-8. */
  readonly stdout: string;
  /** Captured stderr, decoded as UTF-8. */
  readonly stderr: string;
  /** Wall-clock start time in milliseconds. */
  readonly startedAt: number;
  /** Wall-clock end time in milliseconds. */
  readonly finishedAt: number;
}

/** Outcome of a single job. */
export interface JobResult {
  /** Terminal status of the job (worst-case fold over its steps). */
  readonly status: RunStatus;
  /** Step outcomes in declaration order. */
  readonly steps: readonly StepResult[];
  /** Resolved `jobs.<id>.outputs:` values, after expression evaluation. */
  readonly outputs: Readonly<Record<string, string>>;
  /** Wall-clock start time in milliseconds. */
  readonly startedAt: number;
  /** Wall-clock end time in milliseconds. */
  readonly finishedAt: number;
}

/** Aggregated outcome of an entire workflow run. */
export interface RunResult {
  /** Terminal status of the run (worst-case fold over its jobs). */
  readonly status: RunStatus;
  /** Per-job outcomes, keyed by job id. */
  readonly jobs: Readonly<Record<string, JobResult>>;
  /** Wall-clock start time in milliseconds. */
  readonly startedAt: number;
  /** Wall-clock end time in milliseconds. */
  readonly finishedAt: number;
}
