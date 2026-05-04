/**
 * Public entry point of the runtime. Takes a parsed `Workflow` and
 * executes its jobs in topological order, returning a `RunResult`
 * once the run terminates.
 *
 * MS1.0 scope:
 * - `run:` steps only — `step.uses:` and job-level `uses:` raise
 *   `RuntimeUnsupportedError` (deferred to MS1.1 / MS1.4).
 * - Jobs run sequentially in `needs:`-respecting topological order.
 *   Concurrency is intentionally deferred (MS1.x) so the failure
 *   semantics stay simple while the rest of the runtime stabilizes.
 * - Expression evaluation is limited to `env.<name>` and
 *   `inputs.<name>` (see `evaluateExpression`).
 *
 * Job orchestration:
 * - `workflow.env` is interpolated once against the resolved inputs
 *   (with `env: {}` as the eval context — workflow.env values may
 *   reference inputs but not other env vars in the same layer).
 *   Caller-provided `options.env` is layered on top so tests / CLI
 *   flags can override workflow defaults.
 * - For each job in topo order: if any dependency in `needs:`
 *   produced a non-`succeeded` outcome, the current job is marked
 *   `skipped` and a `job-skipped` event is emitted; otherwise
 *   `runJob` is invoked. A failed job downgrades the workflow
 *   status to `failed`.
 */

import { randomUUID } from "node:crypto";

import { topoSort, type DepRecord, type Workflow } from "@aiactions/workflows";

import { evaluateExpression } from "./eval/expression.ts";
import type { EvalContext } from "./eval/expression.ts";
import { runJob } from "./runner/job.ts";
import type { RunOptions, WorkflowInputValue } from "./types/options.ts";
import type { JobResult, RunResult, RunStatus } from "./types/run.ts";

const interpolateEnvLayer = (
  layer: Readonly<Record<string, string>>,
  ctx: EvalContext,
): Record<string, string> => {
  const out: Record<string, string> = {};
  for (const [key, raw] of Object.entries(layer)) {
    out[key] = evaluateExpression(raw, ctx);
  }
  return out;
};

/**
 * Resolve `inputs:` values — applies declared defaults first, then
 * caller-provided overrides win. Result is stringified so the
 * downstream evaluator sees uniform string scalars regardless of
 * the YAML-side `type:` declaration.
 *
 * MS1.0 does NOT enforce `required: true` — callers are responsible
 * for providing the inputs the workflow needs. A missing required
 * input that is later referenced via `${{ inputs.X }}` surfaces as
 * an `ExpressionEvalError` (`inputs.X is not defined`) at evaluation
 * time, which is informative enough for the local-run case.
 */
const resolveInputs = (
  declared: Workflow["inputs"],
  provided: Readonly<Record<string, WorkflowInputValue>> | undefined,
): Record<string, string> => {
  const out: Record<string, string> = {};
  if (declared !== undefined) {
    for (const [name, spec] of Object.entries(declared)) {
      if (spec.default !== undefined) {
        out[name] = String(spec.default);
      }
    }
  }
  if (provided !== undefined) {
    for (const [name, value] of Object.entries(provided)) {
      out[name] = String(value);
    }
  }
  return out;
};

/** Synthesize a `JobResult` representing a job that never executed. */
const skippedJobResult = (at: number): JobResult => ({
  status: "skipped",
  steps: [],
  outputs: {},
  startedAt: at,
  finishedAt: at,
});

/**
 * Execute a workflow on the local machine.
 *
 * @param workflow - Parsed workflow document, as returned by
 *   `parseWorkflow` from `@aiactions/workflows`. The schema's
 *   `superRefine` already enforced that `jobs:` is non-empty,
 *   acyclic and has no dangling `needs:` references — `runWorkflow`
 *   does not re-validate.
 * @param options - Caller-side options (inputs, env, cwd, event
 *   sink, abort signal).
 * @returns Aggregated run result once execution completes.
 */
export async function runWorkflow(workflow: Workflow, options: RunOptions): Promise<RunResult> {
  const startedAt = Date.now();
  const runId = randomUUID();
  const onEvent = options.onEvent;

  onEvent?.({ kind: "workflow-started", at: startedAt });

  const inputs = resolveInputs(workflow.inputs, options.inputs);
  const baseEnv =
    workflow.env !== undefined ? interpolateEnvLayer(workflow.env, { env: {}, inputs }) : {};
  const callerEnv = options.env ?? {};
  const workflowEnv: Record<string, string> = { ...baseEnv, ...callerEnv };

  const records: DepRecord[] = Object.entries(workflow.jobs).map(([id, job]) => ({
    id,
    deps: job.needs ?? [],
  }));
  const order = topoSort(records);

  const jobs: Record<string, JobResult> = {};
  let workflowStatus: RunStatus = "succeeded";

  for (const jobId of order) {
    const job = workflow.jobs[jobId];
    if (job === undefined) {
      // The schema guarantees `jobs[jobId]` exists for every key
      // returned by `topoSort`; this branch is defensive.
      continue;
    }

    const at = Date.now();

    const needs = job.needs ?? [];
    const failedDep = needs.find((dep) => jobs[dep]?.status !== "succeeded");
    if (failedDep !== undefined) {
      const reason = `dependency '${failedDep}' did not succeed`;
      onEvent?.({ kind: "job-skipped", at, jobId, reason });
      jobs[jobId] = skippedJobResult(at);
      continue;
    }

    if (options.signal?.aborted) {
      onEvent?.({ kind: "job-skipped", at, jobId, reason: "run aborted" });
      jobs[jobId] = skippedJobResult(at);
      continue;
    }

    const jobResult = await runJob({
      job,
      jobId,
      runId,
      cwd: options.cwd,
      workflowEnv,
      inputs,
      signal: options.signal,
      emit: onEvent,
      workflowFile: options.workflowFile,
      registryRoot: options.registryRoot ?? `${options.cwd.replace(/[\\/]+$/, "")}/actions`,
    });
    jobs[jobId] = jobResult;
    if (jobResult.status === "failed") {
      workflowStatus = "failed";
    }
  }

  const finishedAt = Date.now();
  onEvent?.({ kind: "workflow-finished", at: finishedAt, status: workflowStatus });

  return {
    status: workflowStatus,
    jobs,
    startedAt,
    finishedAt,
  };
}
