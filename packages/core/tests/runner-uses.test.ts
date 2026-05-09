/**
 * Integration test for runJob with `step.uses:` steps. Exercises the
 * resolver + exec + evaluator extension together: a workflow with an
 * action step followed by a run step that consumes its outputs.
 *
 * POSIX-only.
 */

import { join } from "node:path";

import { describe, expect, test } from "vite-plus/test";

import { jobSchema, type Job } from "@aiactions/schema";

import { runJob, type JobRunRequest } from "../src/runner/run-job.ts";
import type { RuntimeEvent } from "@aiactions/schema";

const POSIX = process.platform !== "win32";
const FAKE_WORKFLOW = join(import.meta.dirname, "fake.yaml");

const parseJob = (input: unknown): Job => jobSchema.parse(input);

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
  workflowFile: FAKE_WORKFLOW,
  bashAvailable: true,
  ...overrides,
});

describe.skipIf(!POSIX)("runJob — step.uses end-to-end", () => {
  test("uses step output flows into a downstream run step", async () => {
    const job = parseJob({
      steps: [
        {
          id: "echoer",
          uses: "./fixtures/actions/echo",
          with: { message: "hello-from-action" },
        },
        { run: 'echo "${{ steps.echoer.outputs.echoed }}"' },
      ],
    });
    const result = await runJob(makeRequest(job));
    expect(result.status).toBe("succeeded");
    expect(result.steps).toHaveLength(2);
    expect(result.steps[0]?.status).toBe("succeeded");
    expect(result.steps[1]?.status).toBe("succeeded");
    expect(result.steps[1]?.stdout).toContain("hello-from-action");
  });

  test("crashing action fails the step and skips later steps", async () => {
    const job = parseJob({
      steps: [{ id: "bad", uses: "./fixtures/actions/crashing" }, { run: "echo unreachable" }],
    });
    const result = await runJob(makeRequest(job));
    expect(result.status).toBe("failed");
    expect(result.steps[0]?.status).toBe("failed");
    expect(result.steps[1]?.status).toBe("skipped");
  });

  test("uses step without id still runs and discards outputs", async () => {
    const job = parseJob({
      steps: [{ uses: "./fixtures/actions/two-outputs" }, { run: "echo done" }],
    });
    const result = await runJob(makeRequest(job));
    expect(result.status).toBe("succeeded");
    expect(result.steps[1]?.stdout).toContain("done");
  });

  test("uses step with if: false is skipped without spawning a subprocess", async () => {
    const job = parseJob({
      steps: [
        {
          id: "skipped",
          uses: "./fixtures/actions/echo",
          if: false,
          with: { message: "should-not-run" },
        },
        { run: "echo after" },
      ],
    });
    const events: RuntimeEvent[] = [];
    const result = await runJob(makeRequest(job, { emit: (e) => events.push(e) }));
    expect(result.status).toBe("succeeded");
    expect(result.steps[0]?.status).toBe("skipped");
    expect(result.steps[0]?.exitCode).toBeNull();
    expect(result.steps[0]?.stdout).toBe("");
    // No `step-started` for index 0 means no subprocess was spawned.
    const startedForSkipped = events.filter((e) => e.kind === "step-started" && e.stepIndex === 0);
    expect(startedForSkipped).toHaveLength(0);
    // Sanity: the run step after still ran.
    expect(result.steps[1]?.status).toBe("succeeded");
    expect(result.steps[1]?.stdout).toContain("after");
  });

  test("pre-aborted signal short-circuits before the loader is spawned", async () => {
    const job = parseJob({
      steps: [
        {
          id: "first",
          uses: "./fixtures/actions/echo",
          with: { message: "never-runs" },
        },
      ],
    });
    const ac = new AbortController();
    ac.abort();
    const events: RuntimeEvent[] = [];
    const result = await runJob(
      makeRequest(job, { signal: ac.signal, emit: (e) => events.push(e) }),
    );
    expect(result.steps[0]?.status).toBe("skipped");
    expect(result.steps[0]?.exitCode).toBeNull();
    expect(result.steps[0]?.stdout).toBe("");
    const startedForFirst = events.filter((e) => e.kind === "step-started" && e.stepIndex === 0);
    expect(startedForFirst).toHaveLength(0);
  });

  test("uses step output flows into a downstream uses step's with:", async () => {
    const job = parseJob({
      steps: [
        {
          id: "first",
          uses: "./fixtures/actions/echo",
          with: { message: "chained" },
        },
        {
          id: "second",
          uses: "./fixtures/actions/echo",
          with: { message: "${{ steps.first.outputs.echoed }}" },
        },
      ],
    });
    const result = await runJob(makeRequest(job));
    expect(result.status).toBe("succeeded");
    expect(result.steps).toHaveLength(2);
    expect(result.steps[0]?.status).toBe("succeeded");
    expect(result.steps[1]?.status).toBe("succeeded");
    // `runJob` does not return per-step outputs; both steps succeeding
    // is the proxy assertion that the second step received a
    // well-formed `with:` and ran the loader to completion. If the
    // expression failed to resolve, `evaluateExpression` would have
    // thrown and the second step would surface as failed.
  });
});
