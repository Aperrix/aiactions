/**
 * Tests for the `defaults.run.{shell,working-directory}` block at
 * workflow and job scope. Inheritance/precedence is enforced by the
 * runtime; the schema only validates shape.
 */

import { describe, expect, test } from "vite-plus/test";

import { workflowSchema } from "../src/schema/workflow.ts";

const minimalSteps = [{ run: "echo hi" }];

describe("workflow.defaults.run", () => {
  test("accepts shell + working-directory at workflow scope", () => {
    const result = workflowSchema.safeParse({
      name: "defaults-test",
      defaults: {
        run: {
          shell: "python",
          "working-directory": "./scripts",
        },
      },
      jobs: { one: { steps: minimalSteps } },
    });
    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.data.defaults?.run?.shell).toBe("python");
    expect(result.data.defaults?.run?.workingDirectory).toBe("./scripts");
  });

  test("accepts custom shell template at workflow scope", () => {
    const result = workflowSchema.safeParse({
      name: "defaults-test",
      defaults: { run: { shell: "perl {0}" } },
      jobs: { one: { steps: minimalSteps } },
    });
    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.data.defaults?.run?.shell).toBe("perl {0}");
  });

  test("accepts an empty defaults.run block", () => {
    const result = workflowSchema.safeParse({
      name: "defaults-test",
      defaults: { run: {} },
      jobs: { one: { steps: minimalSteps } },
    });
    expect(result.success).toBe(true);
  });

  test("rejects unknown keys under defaults.run", () => {
    const result = workflowSchema.safeParse({
      name: "defaults-test",
      defaults: { run: { bogus: "value" } },
      jobs: { one: { steps: minimalSteps } },
    });
    expect(result.success).toBe(false);
  });

  test("rejects unknown keys under defaults", () => {
    const result = workflowSchema.safeParse({
      name: "defaults-test",
      defaults: { notrun: { shell: "bash" } },
      jobs: { one: { steps: minimalSteps } },
    });
    expect(result.success).toBe(false);
  });
});

describe("job.defaults.run", () => {
  test("accepts shell + working-directory at job scope", () => {
    const result = workflowSchema.safeParse({
      name: "defaults-test",
      jobs: {
        one: {
          defaults: {
            run: {
              shell: "python",
              "working-directory": "./scripts",
            },
          },
          steps: [{ run: 'print("hi")' }],
        },
      },
    });
    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.data.jobs.one?.defaults?.run?.shell).toBe("python");
    expect(result.data.jobs.one?.defaults?.run?.workingDirectory).toBe("./scripts");
  });

  test("accepts both workflow- and job-level defaults", () => {
    const result = workflowSchema.safeParse({
      name: "defaults-test",
      defaults: { run: { shell: "bash" } },
      jobs: {
        one: {
          defaults: { run: { shell: "python" } },
          steps: [{ run: 'print("hi")' }],
        },
      },
    });
    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.data.defaults?.run?.shell).toBe("bash");
    expect(result.data.jobs.one?.defaults?.run?.shell).toBe("python");
  });
});
