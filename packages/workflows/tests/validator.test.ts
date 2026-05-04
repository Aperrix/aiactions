/**
 * Tests for `validateWorkflow` — the non-throwing list-style entry
 * point. Filters Zod issues to only graph-invariant ones (skipping any
 * shape-level issue that may surface).
 *
 * Contents:
 * - returns empty list for a valid workflow.
 * - returns issues for cycles (with the specific `CYCLE_DETECTED` code).
 * - returns issues for dangling needs.
 * - returns empty list when the workflow has no graph problems.
 */

import { describe, expect, test } from "vite-plus/test";

import { validateWorkflow } from "../src/parser/validate-workflow.ts";
import type { Workflow } from "../src/schema/workflow.ts";

describe("validateWorkflow", () => {
  test("returns empty list for a valid workflow", () => {
    const wf: Workflow = {
      name: "ok",
      jobs: {
        a: { steps: [{ run: "echo a" }] },
        b: { needs: ["a"], steps: [{ run: "echo b" }] },
      },
    };
    expect(validateWorkflow(wf)).toEqual([]);
  });

  test("returns issues for cycle", () => {
    const wf: Workflow = {
      name: "cycle",
      jobs: {
        a: { needs: ["b"], steps: [{ run: "echo a" }] },
        b: { needs: ["a"], steps: [{ run: "echo b" }] },
      },
    };
    const issues = validateWorkflow(wf);
    expect(issues.length).toBeGreaterThan(0);
    expect(issues.some((i) => /cycle/.test(i.message))).toBe(true);
    expect(issues.every((i) => i.code === "CYCLE_DETECTED")).toBe(true);
  });

  test("returns issues for dangling needs", () => {
    const wf: Workflow = {
      name: "dangling",
      jobs: {
        a: { needs: ["ghost"], steps: [{ run: "echo a" }] },
      },
    };
    const issues = validateWorkflow(wf);
    expect(issues.length).toBeGreaterThan(0);
    expect(issues.some((i) => /dangling/.test(i.message))).toBe(true);
  });

  test("returns empty list when the workflow has no graph problems even if jobs has only one entry", () => {
    const wf: Workflow = {
      name: "single",
      jobs: {
        only: { steps: [{ run: "echo solo" }] },
      },
    };
    expect(validateWorkflow(wf)).toEqual([]);
  });
});
