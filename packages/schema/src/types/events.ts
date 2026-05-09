/**
 * Discriminated union of all runtime events. The runtime emits events
 * synchronously as they happen so the caller can stream stdio, surface
 * progress, or persist a journal of the run.
 *
 * Each event carries the minimum data needed for that responsibility;
 * the full structured outcome of the run is returned by `runWorkflow`
 * separately, so consumers do not have to reassemble state from the
 * event stream.
 *
 * Contents:
 * - `RuntimeEventKind` — string literal tags.
 * - One interface per event kind, all carrying a wall-clock `at` field.
 * - `RuntimeEvent` — the union consumers narrow on `kind`.
 */

import type { RunStatus } from "./run.ts";

/** Discriminator tags for `RuntimeEvent`. */
export type RuntimeEventKind =
  | "workflow-started"
  | "workflow-finished"
  | "job-started"
  | "job-finished"
  | "job-skipped"
  | "step-started"
  | "step-finished"
  | "step-skipped"
  | "step-stdout"
  | "step-stderr";

/** Emitted once at the very start of the run. */
export interface WorkflowStartedEvent {
  readonly kind: "workflow-started";
  readonly at: number;
}

/** Emitted once when the run terminates, regardless of outcome. */
export interface WorkflowFinishedEvent {
  readonly kind: "workflow-finished";
  readonly at: number;
  readonly status: RunStatus;
}

/** Emitted when a job actually starts executing its first step. */
export interface JobStartedEvent {
  readonly kind: "job-started";
  readonly at: number;
  readonly jobId: string;
}

/** Emitted when a job has produced a terminal status. */
export interface JobFinishedEvent {
  readonly kind: "job-finished";
  readonly at: number;
  readonly jobId: string;
  readonly status: RunStatus;
}

/** Emitted instead of `JobStartedEvent` when a job is skipped (its
 * `if:` evaluated false, or one of its `needs:` failed). */
export interface JobSkippedEvent {
  readonly kind: "job-skipped";
  readonly at: number;
  readonly jobId: string;
  readonly reason: string;
}

/** Emitted before a step's process is spawned. */
export interface StepStartedEvent {
  readonly kind: "step-started";
  readonly at: number;
  readonly jobId: string;
  readonly stepIndex: number;
  readonly stepId: string | undefined;
}

/** Emitted after a step's process has exited. */
export interface StepFinishedEvent {
  readonly kind: "step-finished";
  readonly at: number;
  readonly jobId: string;
  readonly stepIndex: number;
  readonly stepId: string | undefined;
  readonly status: RunStatus;
  readonly exitCode: number | null;
}

/** Emitted instead of `StepStartedEvent`/`StepFinishedEvent` when a step
 * is skipped (its `if:` evaluated false, or a previous step failed). */
export interface StepSkippedEvent {
  readonly kind: "step-skipped";
  readonly at: number;
  readonly jobId: string;
  readonly stepIndex: number;
  readonly stepId: string | undefined;
  readonly reason: string;
}

/** Emitted once per stdout chunk read from a running step. Chunks are
 * decoded as UTF-8; consumers must accept partial-line boundaries. */
export interface StepStdoutEvent {
  readonly kind: "step-stdout";
  readonly at: number;
  readonly jobId: string;
  readonly stepIndex: number;
  readonly chunk: string;
}

/** Emitted once per stderr chunk read from a running step. */
export interface StepStderrEvent {
  readonly kind: "step-stderr";
  readonly at: number;
  readonly jobId: string;
  readonly stepIndex: number;
  readonly chunk: string;
}

/** Union of every runtime event. Consumers narrow on `kind`. */
export type RuntimeEvent =
  | WorkflowStartedEvent
  | WorkflowFinishedEvent
  | JobStartedEvent
  | JobFinishedEvent
  | JobSkippedEvent
  | StepStartedEvent
  | StepFinishedEvent
  | StepSkippedEvent
  | StepStdoutEvent
  | StepStderrEvent;
