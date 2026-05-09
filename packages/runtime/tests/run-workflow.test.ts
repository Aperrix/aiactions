/**
 * Tests for the public `runWorkflow` entry point. Exercises the
 * topology-aware scheduler, dependency-failure cascading,
 * workflow-level env / input interpolation, and the workflow
 * lifecycle event stream.
 *
 * POSIX-only — Windows shell behaviour is exercised by integration
 * tests run on a Windows host (deferred until CI matrix lands).
 */

import { execFile } from "node:child_process";
import { promisify } from "node:util";

import { describe, expect, test } from "vite-plus/test";

import { workflowSchema } from "@aiactions/schema";

import { runWorkflow } from "../src/run-workflow.ts";
import type { RuntimeEvent } from "../src/types/events.ts";

const POSIX = process.platform !== "win32";
const pExecFile = promisify(execFile);

async function pythonAvailable(): Promise<boolean> {
  try {
    await pExecFile("python", ["--version"]);
    return true;
  } catch {
    return false;
  }
}

const parseWorkflow = (input: unknown) => workflowSchema.parse(input);

describe.skipIf(!POSIX)("runWorkflow — happy paths", () => {
  test("single job with single step succeeds", async () => {
    const workflow = parseWorkflow({
      name: "smoke",
      jobs: { build: { steps: [{ run: "echo hi" }] } },
    });
    const result = await runWorkflow(workflow, { cwd: process.cwd() });
    expect(result.status).toBe("succeeded");
    expect(Object.keys(result.jobs)).toEqual(["build"]);
    expect(result.jobs.build?.status).toBe("succeeded");
    expect(result.jobs.build?.steps[0]?.stdout).toContain("hi");
  });

  test("multiple jobs run in topological order", async () => {
    const order: string[] = [];
    const workflow = parseWorkflow({
      name: "topo",
      jobs: {
        a: { steps: [{ run: "echo a" }] },
        b: { needs: ["a"], steps: [{ run: "echo b" }] },
        c: { needs: ["b"], steps: [{ run: "echo c" }] },
      },
    });
    const result = await runWorkflow(workflow, {
      cwd: process.cwd(),
      onEvent: (e: RuntimeEvent) => {
        if (e.kind === "job-started") order.push(e.jobId);
      },
    });
    expect(result.status).toBe("succeeded");
    expect(order).toEqual(["a", "b", "c"]);
  });

  test("independent jobs without needs both run", async () => {
    const workflow = parseWorkflow({
      name: "parallel",
      jobs: {
        a: { steps: [{ run: "echo a" }] },
        b: { steps: [{ run: "echo b" }] },
      },
    });
    const result = await runWorkflow(workflow, { cwd: process.cwd() });
    expect(result.status).toBe("succeeded");
    expect(result.jobs.a?.status).toBe("succeeded");
    expect(result.jobs.b?.status).toBe("succeeded");
  });
});

describe.skipIf(!POSIX)("runWorkflow — env and inputs", () => {
  test("workflow.env interpolates against inputs and reaches steps", async () => {
    const workflow = parseWorkflow({
      name: "env",
      inputs: { greeting: { type: "string", default: "hello" } },
      env: { GREET: "${{ inputs.greeting }}" },
      jobs: {
        a: { steps: [{ run: 'echo "$GREET"' }] },
      },
    });
    const result = await runWorkflow(workflow, { cwd: process.cwd() });
    expect(result.jobs.a?.steps[0]?.stdout.trim()).toBe("hello");
  });

  test("caller-provided inputs override declared defaults", async () => {
    const workflow = parseWorkflow({
      name: "input-override",
      inputs: { who: { type: "string", default: "anon" } },
      jobs: {
        a: { steps: [{ run: "echo ${{ inputs.who }}" }] },
      },
    });
    const result = await runWorkflow(workflow, {
      cwd: process.cwd(),
      inputs: { who: "ada" },
    });
    expect(result.jobs.a?.steps[0]?.stdout.trim()).toBe("ada");
  });

  test("caller-provided env layers on top of workflow env", async () => {
    const workflow = parseWorkflow({
      name: "env-override",
      env: { X: "from-workflow" },
      jobs: { a: { steps: [{ run: 'echo "$X"' }] } },
    });
    const result = await runWorkflow(workflow, {
      cwd: process.cwd(),
      env: { X: "from-caller" },
    });
    expect(result.jobs.a?.steps[0]?.stdout.trim()).toBe("from-caller");
  });

  test("boolean and number inputs are stringified", async () => {
    const workflow = parseWorkflow({
      name: "input-types",
      inputs: {
        flag: { type: "boolean" },
        count: { type: "number" },
      },
      jobs: {
        a: {
          steps: [{ run: "echo ${{ inputs.flag }}-${{ inputs.count }}" }],
        },
      },
    });
    const result = await runWorkflow(workflow, {
      cwd: process.cwd(),
      inputs: { flag: true, count: 42 },
    });
    expect(result.jobs.a?.steps[0]?.stdout.trim()).toBe("true-42");
  });
});

describe.skipIf(!POSIX)("runWorkflow — failure cascades", () => {
  test("a failed job marks the workflow failed", async () => {
    const workflow = parseWorkflow({
      name: "fail",
      jobs: { a: { steps: [{ run: "exit 1" }] } },
    });
    const result = await runWorkflow(workflow, { cwd: process.cwd() });
    expect(result.status).toBe("failed");
    expect(result.jobs.a?.status).toBe("failed");
  });

  test("a job whose needs include a failed dependency is skipped", async () => {
    const events: RuntimeEvent[] = [];
    const workflow = parseWorkflow({
      name: "cascade",
      jobs: {
        a: { steps: [{ run: "exit 1" }] },
        b: { needs: ["a"], steps: [{ run: "echo unreachable" }] },
        c: { needs: ["b"], steps: [{ run: "echo also-unreachable" }] },
      },
    });
    const result = await runWorkflow(workflow, {
      cwd: process.cwd(),
      onEvent: (e: RuntimeEvent) => events.push(e),
    });
    expect(result.status).toBe("failed");
    expect(result.jobs.a?.status).toBe("failed");
    expect(result.jobs.b?.status).toBe("skipped");
    expect(result.jobs.c?.status).toBe("skipped");
    const skippedJobIds = events
      .filter((e) => e.kind === "job-skipped")
      .map((e) => (e as { jobId: string }).jobId);
    expect(skippedJobIds).toContain("b");
    expect(skippedJobIds).toContain("c");
  });

  test("an independent job runs even when a parallel job fails", async () => {
    const workflow = parseWorkflow({
      name: "siblings",
      jobs: {
        a: { steps: [{ run: "exit 1" }] },
        b: { steps: [{ run: "echo b-ran" }] },
      },
    });
    const result = await runWorkflow(workflow, { cwd: process.cwd() });
    expect(result.status).toBe("failed");
    expect(result.jobs.a?.status).toBe("failed");
    expect(result.jobs.b?.status).toBe("succeeded");
    expect(result.jobs.b?.steps[0]?.stdout).toContain("b-ran");
  });
});

describe.skipIf(!POSIX)("runWorkflow — events and abort", () => {
  test("emits workflow-started and workflow-finished bracketing the run", async () => {
    const events: RuntimeEvent[] = [];
    const workflow = parseWorkflow({
      name: "events",
      jobs: { a: { steps: [{ run: "echo hi" }] } },
    });
    await runWorkflow(workflow, {
      cwd: process.cwd(),
      onEvent: (e: RuntimeEvent) => events.push(e),
    });
    expect(events[0]?.kind).toBe("workflow-started");
    expect(events[events.length - 1]?.kind).toBe("workflow-finished");
  });

  test("pre-aborted signal skips every job", async () => {
    const ac = new AbortController();
    ac.abort();
    const workflow = parseWorkflow({
      name: "abort",
      jobs: {
        a: { steps: [{ run: "echo a" }] },
        b: { steps: [{ run: "echo b" }] },
      },
    });
    const result = await runWorkflow(workflow, {
      cwd: process.cwd(),
      signal: ac.signal,
    });
    expect(result.jobs.a?.status).toBe("skipped");
    expect(result.jobs.b?.status).toBe("skipped");
  });
});

describe.skipIf(!POSIX)("runWorkflow — shell: python", () => {
  test("runs the script and reports succeeded", async () => {
    if (!(await pythonAvailable())) return;
    const workflow = parseWorkflow({
      name: "python-smoke",
      jobs: {
        one: {
          steps: [
            {
              shell: "python",
              run: 'import sys\nprint("hello-from-python")\nsys.exit(0)\n',
            },
          ],
        },
      },
    });
    const result = await runWorkflow(workflow, { cwd: process.cwd() });
    expect(result.status).toBe("succeeded");
    expect(result.jobs.one?.steps[0]?.stdout).toContain("hello-from-python");
  });
});

describe.skipIf(!POSIX)("runWorkflow — custom shell template", () => {
  test("`bash {0}` runs verbatim (no fail-fast injection)", async () => {
    const workflow = parseWorkflow({
      name: "custom-bash-smoke",
      jobs: {
        one: {
          steps: [
            {
              shell: "bash {0}",
              run: "echo before\nfalse\necho after\n",
            },
          ],
        },
      },
    });
    const result = await runWorkflow(workflow, { cwd: process.cwd() });
    // With `set -e`, the `false` would have aborted the script and
    // `echo after` would not have run. With bare bash, the script
    // runs to the end and exits with the last command's status
    // (echo after returns 0).
    expect(result.status).toBe("succeeded");
    const stdout = result.jobs.one?.steps[0]?.stdout ?? "";
    expect(stdout).toContain("before");
    expect(stdout).toContain("after");
  });
});
