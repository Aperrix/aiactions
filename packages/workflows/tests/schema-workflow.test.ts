/**
 * Tests for `workflowSchema` — top-level shape, workflow_call inputs/
 * outputs, env passthrough, and the topology-aggregating `superRefine`
 * (cycle / dangling / empty-jobs).
 *
 * Contents:
 * - happy paths: minimal + maximal documents.
 * - workflow_call shape: typed inputs and `value:`-bearing outputs.
 * - `passthrough:` allowlist.
 * - topology issues are tagged with `params.kind === "topology"` so the
 *   parser can route them to `WorkflowValidationError`.
 */

import { describe, expect, test } from "vite-plus/test";

import { TOPOLOGY_ISSUE_KIND, workflowSchema } from "../src/schema/workflow.ts";

interface IssueParams {
  readonly kind?: unknown;
}

describe("workflowSchema — happy paths", () => {
  test("accepts minimal workflow", () => {
    const result = workflowSchema.safeParse({
      name: "minimal",
      jobs: { lint: { steps: [{ run: "echo hi" }] } },
    });
    expect(result.success).toBe(true);
  });

  test("accepts workflow with full optional top-level fields", () => {
    const result = workflowSchema.safeParse({
      name: "max",
      description: "everything plugged in",
      env: { FOO: "bar" },
      passthrough: ["GH_TOKEN", "PATH"],
      inputs: {
        target: { type: "string", required: true, description: "deploy target" },
        flag: { type: "boolean", default: false },
        count: { type: "number", default: 0 },
      },
      outputs: {
        url: { description: "deployed url", value: "${{ jobs.deploy.outputs.url }}" },
      },
      jobs: {
        build: { steps: [{ run: "echo build" }] },
        deploy: {
          needs: ["build"],
          steps: [{ run: "echo deploy" }],
          outputs: { url: "${{ steps.x.outputs.url }}" },
        },
      },
    });
    expect(result.success).toBe(true);
  });
});

describe("workflowSchema — workflow_call shape", () => {
  test("accepts string / boolean / number input types", () => {
    for (const type of ["string", "boolean", "number"] as const) {
      const result = workflowSchema.safeParse({
        name: "wf",
        inputs: { x: { type } },
        jobs: { a: { steps: [{ run: "x" }] } },
      });
      expect(result.success).toBe(true);
    }
  });

  test("rejects unknown input type", () => {
    const result = workflowSchema.safeParse({
      name: "wf",
      inputs: { x: { type: "object" } },
      jobs: { a: { steps: [{ run: "x" }] } },
    });
    expect(result.success).toBe(false);
  });

  test("rejects output without a value field", () => {
    const result = workflowSchema.safeParse({
      name: "wf",
      outputs: { y: { description: "no value" } },
      jobs: { a: { steps: [{ run: "x" }] } },
    });
    expect(result.success).toBe(false);
  });
});

describe("workflowSchema — passthrough allowlist", () => {
  test("accepts valid POSIX env names", () => {
    const result = workflowSchema.safeParse({
      name: "wf",
      passthrough: ["PATH", "HOME", "GH_TOKEN"],
      jobs: { a: { steps: [{ run: "x" }] } },
    });
    expect(result.success).toBe(true);
  });

  test("rejects passthrough entries that violate env-name regex", () => {
    const result = workflowSchema.safeParse({
      name: "wf",
      passthrough: ["1BAD"],
      jobs: { a: { steps: [{ run: "x" }] } },
    });
    expect(result.success).toBe(false);
  });
});

describe("workflowSchema — topology", () => {
  test("rejects empty jobs map and tags issue as topology", () => {
    const result = workflowSchema.safeParse({ name: "wf", jobs: {} });
    expect(result.success).toBe(false);
    if (!result.success) {
      const topology = result.error.issues.filter((i) => {
        if (i.code !== "custom") return false;
        const params = (i as { params?: IssueParams }).params;
        return params?.kind === TOPOLOGY_ISSUE_KIND;
      });
      expect(topology.length).toBeGreaterThan(0);
      expect(topology[0]?.message).toMatch(/at least one job/);
    }
  });

  test("rejects dangling needs reference and tags issue as topology", () => {
    const result = workflowSchema.safeParse({
      name: "wf",
      jobs: {
        a: { needs: ["ghost"], steps: [{ run: "x" }] },
      },
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const topology = result.error.issues.filter((i) => {
        if (i.code !== "custom") return false;
        const params = (i as { params?: IssueParams }).params;
        return params?.kind === TOPOLOGY_ISSUE_KIND;
      });
      expect(topology.some((i) => /dangling 'needs'/.test(i.message))).toBe(true);
    }
  });

  test("rejects cycle in needs graph and tags issue as topology", () => {
    const result = workflowSchema.safeParse({
      name: "wf",
      jobs: {
        a: { needs: ["b"], steps: [{ run: "x" }] },
        b: { needs: ["a"], steps: [{ run: "x" }] },
      },
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const topology = result.error.issues.filter((i) => {
        if (i.code !== "custom") return false;
        const params = (i as { params?: IssueParams }).params;
        return params?.kind === TOPOLOGY_ISSUE_KIND;
      });
      expect(topology.some((i) => /cycle detected/.test(i.message))).toBe(true);
    }
  });

  test("does not raise cycle issues when dangling needs are present (skip-on-dangling)", () => {
    const result = workflowSchema.safeParse({
      name: "wf",
      jobs: {
        a: { needs: ["b", "ghost"], steps: [{ run: "x" }] },
        b: { needs: ["a"], steps: [{ run: "x" }] },
      },
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const dangling = result.error.issues.filter((i) => /dangling 'needs'/.test(i.message));
      const cycle = result.error.issues.filter((i) => /cycle detected/.test(i.message));
      expect(dangling.length).toBeGreaterThan(0);
      expect(cycle.length).toBe(0);
    }
  });
});

describe("workflowSchema — name field", () => {
  test("rejects missing name", () => {
    const result = workflowSchema.safeParse({ jobs: { a: { steps: [{ run: "x" }] } } });
    expect(result.success).toBe(false);
  });

  test("rejects empty-string name", () => {
    const result = workflowSchema.safeParse({
      name: "",
      jobs: { a: { steps: [{ run: "x" }] } },
    });
    expect(result.success).toBe(false);
  });
});
