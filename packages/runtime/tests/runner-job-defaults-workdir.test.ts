/**
 * Tests for `defaults.run.working-directory` inheritance. Mirrors the
 * shell precedence test. We use `pwd` to verify the effective cwd of
 * the spawned process. Skipped on Windows because `pwd` is a POSIX
 * shell builtin.
 */

import { mkdir, mkdtemp } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { workflowSchema } from "@aiactions/schema";
import { describe, expect, test } from "vite-plus/test";

import { runWorkflow } from "../src/run-workflow.ts";

const POSIX = process.platform !== "win32";
const parseWorkflow = (input: unknown) => workflowSchema.parse(input);

async function makeFixture(): Promise<{ root: string; sub: string }> {
  const root = await mkdtemp(join(tmpdir(), "aiactions-workdir-"));
  const sub = join(root, "scripts");
  await mkdir(sub, { recursive: true });
  return { root, sub };
}

describe.skipIf(!POSIX)("runWorkflow — effective working-directory from defaults chain", () => {
  test("step.working-directory wins over job over workflow", async () => {
    const { root, sub } = await makeFixture();
    const workflow = parseWorkflow({
      name: "precedence",
      defaults: { run: { "working-directory": "/nonexistent" } },
      jobs: {
        one: {
          defaults: { run: { "working-directory": "/also-nope" } },
          steps: [{ "working-directory": sub, run: "pwd" }],
        },
      },
    });
    const r = await runWorkflow(workflow, { cwd: root });
    expect(r.status).toBe("succeeded");
    expect(r.jobs.one?.steps[0]?.stdout.trim()).toBe(sub);
  });

  test("job.defaults.run.working-directory wins when step unset", async () => {
    const { root, sub } = await makeFixture();
    const workflow = parseWorkflow({
      name: "precedence",
      jobs: {
        one: {
          defaults: { run: { "working-directory": sub } },
          steps: [{ run: "pwd" }],
        },
      },
    });
    const r = await runWorkflow(workflow, { cwd: root });
    expect(r.status).toBe("succeeded");
    expect(r.jobs.one?.steps[0]?.stdout.trim()).toBe(sub);
  });

  test("workflow.defaults.run.working-directory wins when step + job unset", async () => {
    const { root, sub } = await makeFixture();
    const workflow = parseWorkflow({
      name: "precedence",
      defaults: { run: { "working-directory": sub } },
      jobs: {
        one: { steps: [{ run: "pwd" }] },
      },
    });
    const r = await runWorkflow(workflow, { cwd: root });
    expect(r.status).toBe("succeeded");
    expect(r.jobs.one?.steps[0]?.stdout.trim()).toBe(sub);
  });

  test("no defaults anywhere uses runWorkflow's cwd", async () => {
    const { root } = await makeFixture();
    const workflow = parseWorkflow({
      name: "no-defaults",
      jobs: {
        one: { steps: [{ run: "pwd" }] },
      },
    });
    const r = await runWorkflow(workflow, { cwd: root });
    expect(r.status).toBe("succeeded");
    expect(r.jobs.one?.steps[0]?.stdout.trim()).toBe(root);
  });
});
