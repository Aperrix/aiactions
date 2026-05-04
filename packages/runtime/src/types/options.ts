/**
 * Caller-side options for `runWorkflow`. The runtime is local-only
 * (single machine, single process) and the caller owns the contextual
 * inputs: working directory, declared workflow inputs, ambient env, the
 * event sink, and the cancellation signal.
 */

import type { RuntimeEvent } from "./events.ts";

/** Allowed scalar shapes for a `workflow_call` input value. Mirrors the
 * three primitive types the workflow `inputs.<name>.type:` enum admits. */
export type WorkflowInputValue = string | number | boolean;

/** Options the caller passes to `runWorkflow`. */
export interface RunOptions {
  /** Map of `inputs.<name>` values for this invocation. Keys not declared
   * in the workflow's `inputs:` block are surfaced as a runtime warning
   * (MS1.x) but do not abort the run. */
  readonly inputs?: Readonly<Record<string, WorkflowInputValue>>;
  /** Extra env vars layered above the workflow's own `env:`. The
   * trust-tier curation introduced in MS1.2 decides which actually reach
   * each child process; in MS1.0 the merged env is used verbatim. */
  readonly env?: Readonly<Record<string, string>>;
  /** Working directory used as the default for every step that does not
   * declare its own `working-directory:`. Must exist; absolute paths are
   * recommended. */
  readonly cwd: string;
  /** Optional event sink, called synchronously as runtime events occur.
   * Throwing from this callback aborts the run. */
  readonly onEvent?: (event: RuntimeEvent) => void;
  /** Caller-provided cancellation token. Aborting cancels in-flight
   * steps via `subprocess.kill()` and short-circuits remaining ones with
   * `status: 'skipped'`. */
  readonly signal?: AbortSignal;
}
