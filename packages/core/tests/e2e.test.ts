/**
 * End-to-end tests for the runtime — every fixture is a real YAML file
 * round-tripped through `parseWorkflow` (yaml + Zod schema +
 * topology validation) and then handed to `runWorkflow`. They cover
 * the parser ↔ runtime contract that unit tests bypass when they
 * construct schemas directly.
 *
 * POSIX-only — Windows shell behaviour is exercised by integration
 * tests run on a Windows host (deferred until CI matrix lands).
 */

import { resolve } from "node:path";

import { parseWorkflow } from "@aiactions/parser";
import { describe, expect, test } from "vite-plus/test";

import { runWorkflow } from "../src/run-workflow.ts";
import type { RuntimeEvent } from "@aiactions/schema";

const FIXTURES = resolve(import.meta.dirname, "fixtures");
const POSIX = process.platform !== "win32";

const fixturePath = (name: string): string => resolve(FIXTURES, name);

describe.skipIf(!POSIX)("runWorkflow e2e — YAML round-trip", () => {
  test("hello.yaml prints 'hello, world'", async () => {
    const wf = await parseWorkflow(fixturePath("hello.yaml"));
    const result = await runWorkflow(wf, { cwd: process.cwd() });
    expect(result.status).toBe("succeeded");
    expect(result.jobs.greet?.steps[0]?.stdout).toContain("hello, world");
  });

  test("env-and-inputs.yaml resolves the declared default input", async () => {
    const wf = await parseWorkflow(fixturePath("env-and-inputs.yaml"));
    const result = await runWorkflow(wf, { cwd: process.cwd() });
    expect(result.jobs.greet?.steps[0]?.stdout.trim()).toBe("hello, world");
  });

  test("env-and-inputs.yaml accepts a caller-provided input override", async () => {
    const wf = await parseWorkflow(fixturePath("env-and-inputs.yaml"));
    const result = await runWorkflow(wf, {
      cwd: process.cwd(),
      inputs: { who: "ada" },
    });
    expect(result.jobs.greet?.steps[0]?.stdout.trim()).toBe("hello, ada");
  });

  test("needs-cascade.yaml runs jobs in topological order", async () => {
    const order: string[] = [];
    const wf = await parseWorkflow(fixturePath("needs-cascade.yaml"));
    const result = await runWorkflow(wf, {
      cwd: process.cwd(),
      onEvent: (event: RuntimeEvent) => {
        if (event.kind === "job-started") order.push(event.jobId);
      },
    });
    expect(result.status).toBe("succeeded");
    expect(order).toEqual(["prepare", "build", "test"]);
  });

  test("failing.yaml fails the dependent job as skipped", async () => {
    const wf = await parseWorkflow(fixturePath("failing.yaml"));
    const result = await runWorkflow(wf, { cwd: process.cwd() });
    expect(result.status).toBe("failed");
    expect(result.jobs.setup?.status).toBe("failed");
    expect(result.jobs.setup?.steps[0]?.exitCode).toBe(1);
    expect(result.jobs.finalize?.status).toBe("skipped");
    expect(result.jobs.finalize?.steps).toHaveLength(0);
  });

  test("working-directory.yaml runs the step inside the declared cwd", async () => {
    const wf = await parseWorkflow(fixturePath("working-directory.yaml"));
    const result = await runWorkflow(wf, { cwd: process.cwd() });
    expect(result.status).toBe("succeeded");
    expect(result.jobs.cwd?.steps[0]?.stdout).toContain("tmp");
    expect(result.jobs.cwd?.steps[0]?.stdout.trim()).not.toBe(process.cwd());
  });
});
