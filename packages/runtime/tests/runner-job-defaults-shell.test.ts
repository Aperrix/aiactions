/**
 * Tests for the step-level / job-level / workflow-level shell
 * inheritance chain. Each test asserts that the runtime spawns the
 * correct binary by inspecting the resolved invocation through a
 * minimal `runWorkflow` call.
 */

import { execFile } from "node:child_process";
import { promisify } from "node:util";

import { workflowSchema } from "@aiactions/schema";
import { describe, expect, test } from "vite-plus/test";

import { runWorkflow } from "../src/run-workflow.ts";

const POSIX = process.platform !== "win32";
const parseWorkflow = (input: unknown) => workflowSchema.parse(input);
const pExecFile = promisify(execFile);

async function pythonAvailable(): Promise<boolean> {
  try {
    await pExecFile("python", ["--version"]);
    return true;
  } catch {
    return false;
  }
}

describe.skipIf(!POSIX)("runWorkflow — effective shell from defaults chain", () => {
  test("step.shell wins over job.defaults.run.shell over workflow.defaults.run.shell", async () => {
    if (!(await pythonAvailable())) return;
    const workflow = parseWorkflow({
      name: "precedence",
      defaults: { run: { shell: "sh" } },
      jobs: {
        one: {
          defaults: { run: { shell: "bash" } },
          steps: [{ shell: "python", run: 'print("from-python")' }],
        },
      },
    });
    const r = await runWorkflow(workflow, { cwd: process.cwd() });
    expect(r.status).toBe("succeeded");
    expect(r.jobs.one?.steps[0]?.stdout).toContain("from-python");
  });

  test("job.defaults.run.shell wins when step.shell unset", async () => {
    if (!(await pythonAvailable())) return;
    const workflow = parseWorkflow({
      name: "precedence",
      defaults: { run: { shell: "sh" } },
      jobs: {
        one: {
          defaults: { run: { shell: "python" } },
          steps: [{ run: 'print("from-job-default")' }],
        },
      },
    });
    const r = await runWorkflow(workflow, { cwd: process.cwd() });
    expect(r.status).toBe("succeeded");
    expect(r.jobs.one?.steps[0]?.stdout).toContain("from-job-default");
  });

  test("workflow.defaults.run.shell wins when step + job both unset", async () => {
    if (!(await pythonAvailable())) return;
    const workflow = parseWorkflow({
      name: "precedence",
      defaults: { run: { shell: "python" } },
      jobs: {
        one: { steps: [{ run: 'print("from-workflow-default")' }] },
      },
    });
    const r = await runWorkflow(workflow, { cwd: process.cwd() });
    expect(r.status).toBe("succeeded");
    expect(r.jobs.one?.steps[0]?.stdout).toContain("from-workflow-default");
  });

  test("no defaults anywhere falls back to platform default (bash on POSIX)", async () => {
    const workflow = parseWorkflow({
      name: "no-defaults",
      jobs: {
        one: { steps: [{ run: "echo from-bash-default" }] },
      },
    });
    const r = await runWorkflow(workflow, { cwd: process.cwd() });
    expect(r.status).toBe("succeeded");
    expect(r.jobs.one?.steps[0]?.stdout).toContain("from-bash-default");
  });
});
