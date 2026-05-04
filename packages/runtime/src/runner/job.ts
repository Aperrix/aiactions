/**
 * Job runner — executes the steps of a single job in declaration
 * order against the live process. Wires the exec primitives
 * (`shell-spec`, `script-file`, `spawn`) and the eval primitive
 * (`evaluateExpression`) into the per-step lifecycle, and emits
 * runtime events to the optional `emit` callback.
 *
 * Scope (MS1.0):
 * - `run:` steps only — `uses:` raises `RuntimeUnsupportedError`.
 * - `if:` accepts boolean literals only — string expressions raise
 *   `RuntimeUnsupportedError`.
 * - Job-level `outputs:` are evaluated against the (workflow ⊕ job)
 *   env context. Anything referencing `steps.<id>.outputs.<name>` or
 *   another unsupported context surfaces an `ExpressionEvalError`.
 *
 * On a non-zero exit code (or any thrown error during interpolation),
 * the current step is marked `failed` and remaining steps are marked
 * `skipped`. Tmpfile cleanup runs in a `try/finally` so it survives
 * crashes mid-execution.
 *
 * Contents:
 * - `JobRunRequest` — caller input.
 * - `runJob(request)` — main entry point.
 */

import { resolve as resolvePath } from "node:path";

import type { Job, Step } from "@aiactions/workflows";

import { evaluateExpression } from "../eval/expression.ts";
import type { EvalContext } from "../eval/expression.ts";
import { writeScript } from "../exec/script-file.ts";
import { getShellInvocation } from "../exec/shell-spec.ts";
import { spawnShell } from "../exec/spawn.ts";
import { RuntimeUnsupportedError } from "../types/errors.ts";
import type { RuntimeEvent } from "../types/events.ts";
import type { JobResult, RunStatus, StepResult } from "../types/run.ts";

/** Caller input for `runJob`. */
export interface JobRunRequest {
  /** Parsed job to execute. */
  readonly job: Job;
  /** Stable job id (matches the key in `workflow.jobs`). */
  readonly jobId: string;
  /** Per-run identifier; reused for tmpfile naming. */
  readonly runId: string;
  /** Default working directory for steps that do not declare their own. */
  readonly cwd: string;
  /** Workflow-level `env:` already interpolated by the caller. */
  readonly workflowEnv: Readonly<Record<string, string>>;
  /** Workflow inputs already coerced to string form by the caller. */
  readonly inputs: Readonly<Record<string, string>>;
  /** Optional cancellation signal. */
  readonly signal?: AbortSignal;
  /** Optional event sink, called synchronously per emitted event. */
  readonly emit?: (event: RuntimeEvent) => void;
}

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
 * Resolve a step's `if:` value to a run/skip decision. MS1.0 only
 * supports boolean literals; expression strings throw because the
 * minimal evaluator cannot make a truthy/falsy decision without the
 * full GHA context (function calls, comparators, etc.).
 */
const evaluateIf = (cond: boolean | string | undefined): boolean => {
  if (cond === undefined || cond === true) return true;
  if (cond === false) return false;
  throw new RuntimeUnsupportedError(
    `step 'if:' expression evaluation is not yet supported in MS1.0 (got: ${JSON.stringify(cond)})`,
  );
};

/**
 * Build the env passed to the child process. Layers stack on top of
 * the OS env so step-declared vars win over workflow vars and over
 * the user's shell — same precedence GHA documents.
 */
const buildSpawnEnv = (
  layers: ReadonlyArray<Readonly<Record<string, string>>>,
): NodeJS.ProcessEnv => {
  const out: NodeJS.ProcessEnv = { ...process.env };
  for (const layer of layers) {
    for (const [key, value] of Object.entries(layer)) {
      out[key] = value;
    }
  }
  return out;
};

/** Make a `StepResult` for a skipped step. */
const skippedStepResult = (step: Step, index: number, at: number): StepResult => ({
  id: step.id,
  index,
  status: "skipped",
  exitCode: null,
  stdout: "",
  stderr: "",
  startedAt: at,
  finishedAt: at,
});

/**
 * Execute one job's steps and return the aggregated `JobResult`.
 *
 * @param request - Job, identifiers, env, inputs, and optional event
 *   sink + cancellation signal.
 * @returns Aggregated job outcome.
 * @throws {RuntimeUnsupportedError} when the job uses a feature not
 *   yet implemented (e.g. `step.uses:`, `if:` expression strings,
 *   job-level `uses:`).
 * @throws {ExpressionEvalError} when an `${{ }}` body cannot be
 *   resolved (e.g. `steps.<id>.outputs.<name>` referenced in a
 *   `job.outputs` value).
 */
export async function runJob(request: JobRunRequest): Promise<JobResult> {
  const startedAt = Date.now();
  const inputs = request.inputs;
  const emit = request.emit;
  emit?.({ kind: "job-started", at: startedAt, jobId: request.jobId });

  if (request.job.steps === undefined) {
    throw new RuntimeUnsupportedError(
      "job-level 'uses:' (reusable workflows) is not yet implemented (MS1.4)",
    );
  }

  // Interpolate job env against workflow env. Step env is interpolated
  // per-step against the merged workflow ⊕ job env.
  const jobEnvRaw = request.job.env ?? {};
  const jobEnvCtx: EvalContext = { env: request.workflowEnv, inputs };
  const jobEnv = interpolateEnvLayer(jobEnvRaw, jobEnvCtx);
  const workflowJobEnv: Record<string, string> = { ...request.workflowEnv, ...jobEnv };

  const stepResults: StepResult[] = [];
  let jobStatus: RunStatus = "succeeded";
  let aborted = false;

  for (let i = 0; i < request.job.steps.length; i++) {
    const step = request.job.steps[i];
    const stepStartedAt = Date.now();

    if (aborted || request.signal?.aborted) {
      aborted = true;
      const result = skippedStepResult(step, i, stepStartedAt);
      stepResults.push(result);
      emit?.({
        kind: "step-skipped",
        at: stepStartedAt,
        jobId: request.jobId,
        stepIndex: i,
        stepId: step.id,
        reason: request.signal?.aborted ? "run aborted" : "previous step failed",
      });
      continue;
    }

    if (step.uses !== undefined) {
      throw new RuntimeUnsupportedError(`step.uses: is not yet implemented (MS1.1) — step #${i}`);
    }

    if (step.run === undefined) {
      // Schema XOR guarantees one of run/uses; reaching here = parser bug.
      throw new RuntimeUnsupportedError(
        `step #${i} has neither 'run' nor 'uses' — schema invariant violated`,
      );
    }

    if (!evaluateIf(step.if)) {
      const result = skippedStepResult(step, i, stepStartedAt);
      stepResults.push(result);
      emit?.({
        kind: "step-skipped",
        at: stepStartedAt,
        jobId: request.jobId,
        stepIndex: i,
        stepId: step.id,
        reason: "if: false",
      });
      continue;
    }

    const stepEnvRaw = step.env ?? {};
    const stepEnvCtx: EvalContext = { env: workflowJobEnv, inputs };
    const stepEnv = interpolateEnvLayer(stepEnvRaw, stepEnvCtx);
    const fullEnv: Record<string, string> = { ...workflowJobEnv, ...stepEnv };
    const fullCtx: EvalContext = { env: fullEnv, inputs };

    const stepWorkingDir =
      step.workingDirectory !== undefined
        ? evaluateExpression(step.workingDirectory, fullCtx)
        : undefined;
    const stepCwd =
      stepWorkingDir !== undefined ? resolvePath(request.cwd, stepWorkingDir) : request.cwd;

    const runBody = evaluateExpression(step.run, fullCtx);

    const placeholder = getShellInvocation(step.shell, "<placeholder>", process.platform);
    const handle = await writeScript(
      runBody,
      request.runId,
      i,
      placeholder.extension,
      process.platform,
    );
    const concrete = getShellInvocation(step.shell, handle.path, process.platform);
    const timeoutMs = step.timeoutMinutes !== undefined ? step.timeoutMinutes * 60_000 : undefined;

    emit?.({
      kind: "step-started",
      at: stepStartedAt,
      jobId: request.jobId,
      stepIndex: i,
      stepId: step.id,
    });

    let stepStatus: RunStatus = "succeeded";
    let stepExitCode: number | null = 0;
    let stepStdout = "";
    let stepStderr = "";
    try {
      const result = await spawnShell({
        bin: concrete.bin,
        args: concrete.args,
        cwd: stepCwd,
        env: buildSpawnEnv([fullEnv]),
        signal: request.signal,
        timeoutMs,
        onStdout: (chunk) =>
          emit?.({
            kind: "step-stdout",
            at: Date.now(),
            jobId: request.jobId,
            stepIndex: i,
            chunk,
          }),
        onStderr: (chunk) =>
          emit?.({
            kind: "step-stderr",
            at: Date.now(),
            jobId: request.jobId,
            stepIndex: i,
            chunk,
          }),
      });
      stepStdout = result.stdout;
      stepStderr = result.stderr;
      stepExitCode = result.exitCode;
      if (result.killed || result.exitCode !== 0) {
        stepStatus = "failed";
      }
    } finally {
      await handle.cleanup();
    }

    const stepFinishedAt = Date.now();
    stepResults.push({
      id: step.id,
      index: i,
      status: stepStatus,
      exitCode: stepExitCode,
      stdout: stepStdout,
      stderr: stepStderr,
      startedAt: stepStartedAt,
      finishedAt: stepFinishedAt,
    });

    emit?.({
      kind: "step-finished",
      at: stepFinishedAt,
      jobId: request.jobId,
      stepIndex: i,
      stepId: step.id,
      status: stepStatus,
      exitCode: stepExitCode,
    });

    if (stepStatus === "failed") {
      jobStatus = "failed";
      aborted = true;
    }
  }

  // Job outputs are only evaluated when the job is on track to succeed.
  // The MS1.0 evaluator only knows `env` and `inputs`; any reference to
  // `steps.*.outputs.*` will surface as an `ExpressionEvalError`.
  const jobOutputs: Record<string, string> = {};
  if (request.job.outputs !== undefined && jobStatus === "succeeded") {
    const outputCtx: EvalContext = { env: workflowJobEnv, inputs };
    for (const [key, raw] of Object.entries(request.job.outputs)) {
      jobOutputs[key] = evaluateExpression(raw, outputCtx);
    }
  }

  const finishedAt = Date.now();
  emit?.({
    kind: "job-finished",
    at: finishedAt,
    jobId: request.jobId,
    status: jobStatus,
  });

  return {
    status: jobStatus,
    steps: stepResults,
    outputs: jobOutputs,
    startedAt,
    finishedAt,
  };
}
