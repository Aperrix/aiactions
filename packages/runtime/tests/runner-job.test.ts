/**
 * Tests for `runJob` — the per-job executor that wires the exec and
 * eval primitives together. Exercises happy paths, env / input
 * interpolation across workflow / job / step layers, fail-fast on
 * non-zero exits, `if:` evaluation (boolean / string literal /
 * `${{ }}` expression / bare body), schema-deferred features
 * (`uses:`, expression operators), abort signal cascade, and the
 * runtime event stream.
 *
 * POSIX-only — Windows shell behaviour is exercised by integration
 * tests run on a Windows host (deferred until CI matrix lands).
 */

import { describe, expect, test } from "vite-plus/test";

import { jobSchema, type Job } from "@aiactions/schema";

import { runJob, type JobRunRequest } from "../src/runner/job.ts";
import { ExpressionEvalError, RuntimeUnsupportedError } from "../src/types/errors.ts";
import type { RuntimeEvent } from "../src/types/events.ts";

const POSIX = process.platform !== "win32";

const makeRequest = (
  job: Job,
  overrides: Partial<Omit<JobRunRequest, "job">> = {},
): JobRunRequest => ({
  job,
  jobId: "test-job",
  runId: `test-run-${Math.random().toString(36).slice(2)}`,
  cwd: process.cwd(),
  workflowEnv: {},
  inputs: {},
  bashAvailable: true,
  ...overrides,
});

const parseJob = (input: unknown): Job => jobSchema.parse(input);

describe.skipIf(!POSIX)("runJob — happy paths", () => {
  test("single echo step succeeds with status succeeded", async () => {
    const job = parseJob({ steps: [{ run: "echo hi" }] });
    const result = await runJob(makeRequest(job));
    expect(result.status).toBe("succeeded");
    expect(result.steps).toHaveLength(1);
    expect(result.steps[0]?.status).toBe("succeeded");
    expect(result.steps[0]?.exitCode).toBe(0);
    expect(result.steps[0]?.stdout).toContain("hi");
  });

  test("interpolates env and inputs into the run body", async () => {
    const job = parseJob({
      steps: [{ run: "echo ${{ env.GREETING }}, ${{ inputs.target }}" }],
    });
    const result = await runJob(
      makeRequest(job, {
        workflowEnv: { GREETING: "hello" },
        inputs: { target: "world" },
      }),
    );
    expect(result.status).toBe("succeeded");
    expect(result.steps[0]?.stdout).toContain("hello, world");
  });

  test("env layers stack: workflow -> job -> step", async () => {
    const job = parseJob({
      env: { JOB_VAR: "${{ env.WF_VAR }}-job" },
      steps: [
        {
          env: { STEP_VAR: "${{ env.JOB_VAR }}-step" },
          run: 'echo "$STEP_VAR"',
        },
      ],
    });
    const result = await runJob(makeRequest(job, { workflowEnv: { WF_VAR: "root" } }));
    expect(result.steps[0]?.stdout.trim()).toBe("root-job-step");
  });

  test("workingDirectory shifts the step's cwd relative to request.cwd", async () => {
    const job = parseJob({
      steps: [{ run: "pwd" }, { "working-directory": "/tmp", run: "pwd" }],
    });
    const result = await runJob(makeRequest(job, { cwd: process.cwd() }));
    expect(result.steps[0]?.stdout.trim()).toBe(process.cwd());
    expect(result.steps[1]?.stdout).toContain("tmp");
    expect(result.steps[1]?.stdout.trim()).not.toBe(process.cwd());
  });
});

describe.skipIf(!POSIX)("runJob — fail-fast and skipping", () => {
  test("non-zero exit fails the step and skips later steps", async () => {
    const job = parseJob({
      steps: [{ run: "exit 1" }, { run: "echo unreachable" }],
    });
    const result = await runJob(makeRequest(job));
    expect(result.status).toBe("failed");
    expect(result.steps[0]?.status).toBe("failed");
    expect(result.steps[0]?.exitCode).toBe(1);
    expect(result.steps[1]?.status).toBe("skipped");
    expect(result.steps[1]?.exitCode).toBeNull();
    expect(result.steps[1]?.stdout).toBe("");
  });

  test("if: false skips the step but later steps still run", async () => {
    const job = parseJob({
      steps: [{ if: false, run: "echo skipped" }, { run: "echo ran" }],
    });
    const result = await runJob(makeRequest(job));
    expect(result.status).toBe("succeeded");
    expect(result.steps[0]?.status).toBe("skipped");
    expect(result.steps[1]?.status).toBe("succeeded");
    expect(result.steps[1]?.stdout).toContain("ran");
  });

  test("if: 'true' / 'false' string literals coerce to boolean", async () => {
    const trueJob = parseJob({
      steps: [{ if: "true", run: "echo ran" }],
    });
    const trueResult = await runJob(makeRequest(trueJob));
    expect(trueResult.steps[0]?.status).toBe("succeeded");
    expect(trueResult.steps[0]?.stdout).toContain("ran");

    const falseJob = parseJob({
      steps: [{ if: "false", run: "echo skipped" }],
    });
    const falseResult = await runJob(makeRequest(falseJob));
    expect(falseResult.steps[0]?.status).toBe("skipped");
  });

  test("if: ${{ inputs.flag }} truthy value runs the step", async () => {
    const job = parseJob({
      steps: [{ if: "${{ inputs.flag }}", run: "echo ran" }],
    });
    const result = await runJob(makeRequest(job, { inputs: { flag: "true" } }));
    expect(result.steps[0]?.status).toBe("succeeded");
    expect(result.steps[0]?.stdout).toContain("ran");
  });

  test("if: ${{ inputs.flag }} 'false' value skips the step", async () => {
    const job = parseJob({
      steps: [{ if: "${{ inputs.flag }}", run: "echo skipped" }],
    });
    const result = await runJob(makeRequest(job, { inputs: { flag: "false" } }));
    expect(result.steps[0]?.status).toBe("skipped");
  });

  test("if: ${{ env.X }} empty string skips (truthy rule: '' => false)", async () => {
    const job = parseJob({
      env: { GATE: "" },
      steps: [{ if: "${{ env.GATE }}", run: "echo skipped" }],
    });
    const result = await runJob(makeRequest(job));
    expect(result.steps[0]?.status).toBe("skipped");
  });

  test("if: ${{ env.X }} '0' string skips (truthy rule: '0' => false)", async () => {
    const job = parseJob({
      env: { GATE: "0" },
      steps: [{ if: "${{ env.GATE }}", run: "echo skipped" }],
    });
    const result = await runJob(makeRequest(job));
    expect(result.steps[0]?.status).toBe("skipped");
  });

  test("if: bare body (no ${{ }} wrap) is auto-wrapped and evaluated", async () => {
    const job = parseJob({
      steps: [{ if: "inputs.flag", run: "echo ran" }],
    });
    const result = await runJob(makeRequest(job, { inputs: { flag: "yes" } }));
    expect(result.steps[0]?.status).toBe("succeeded");
    expect(result.steps[0]?.stdout).toContain("ran");
  });

  test("pre-aborted signal cascades into all step results", async () => {
    const ac = new AbortController();
    ac.abort();
    const job = parseJob({
      steps: [{ run: "echo first" }, { run: "echo second" }],
    });
    const result = await runJob(makeRequest(job, { signal: ac.signal }));
    expect(result.steps[0]?.status).toBe("skipped");
    expect(result.steps[1]?.status).toBe("skipped");
  });
});

describe.skipIf(!POSIX)("runJob — deferred features", () => {
  test("job-level uses raises RuntimeUnsupportedError", async () => {
    const job = parseJob({ uses: "ns/workflow@1.0.0" });
    await expect(runJob(makeRequest(job))).rejects.toBeInstanceOf(RuntimeUnsupportedError);
  });

  test("if: expression with operators raises ExpressionEvalError", async () => {
    const job = parseJob({
      steps: [{ if: "${{ inputs.x == 'y' }}", run: "echo x" }],
    });
    await expect(runJob(makeRequest(job, { inputs: { x: "y" } }))).rejects.toBeInstanceOf(
      ExpressionEvalError,
    );
  });

  test("job.outputs referencing steps.* raises ExpressionEvalError", async () => {
    const job = parseJob({
      outputs: { result: "${{ steps.x.outputs.y }}" },
      steps: [{ id: "x", run: "echo x" }],
    });
    await expect(runJob(makeRequest(job))).rejects.toBeInstanceOf(ExpressionEvalError);
  });

  test("job.outputs referencing env resolves", async () => {
    const job = parseJob({
      outputs: { greeting: "${{ env.OUT }}" },
      env: { OUT: "hello" },
      steps: [{ run: "echo done" }],
    });
    const result = await runJob(makeRequest(job));
    expect(result.outputs.greeting).toBe("hello");
  });
});

describe.skipIf(!POSIX)("runJob — runtime events", () => {
  test("emits the full lifecycle for a successful run-step", async () => {
    const events: RuntimeEvent[] = [];
    const job = parseJob({ steps: [{ run: "echo hi" }] });
    await runJob(makeRequest(job, { emit: (e) => events.push(e) }));
    const kinds = events.map((e) => e.kind);
    expect(kinds).toContain("job-started");
    expect(kinds).toContain("step-started");
    expect(kinds).toContain("step-stdout");
    expect(kinds).toContain("step-finished");
    expect(kinds).toContain("job-finished");
  });

  test("emits step-skipped instead of started/finished for if: false steps", async () => {
    const events: RuntimeEvent[] = [];
    const job = parseJob({ steps: [{ if: false, run: "echo skipped" }] });
    await runJob(makeRequest(job, { emit: (e) => events.push(e) }));
    const kinds = events.map((e) => e.kind);
    expect(kinds).toContain("step-skipped");
    expect(kinds).not.toContain("step-started");
    expect(kinds).not.toContain("step-finished");
  });

  test("step-stderr is emitted separately from step-stdout", async () => {
    const events: RuntimeEvent[] = [];
    const job = parseJob({
      steps: [{ run: "echo out\necho err 1>&2\n" }],
    });
    await runJob(makeRequest(job, { emit: (e) => events.push(e) }));
    const kinds = events.map((e) => e.kind);
    expect(kinds).toContain("step-stdout");
    expect(kinds).toContain("step-stderr");
  });
});
