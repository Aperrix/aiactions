/**
 * Consolidated schema tests for the workflow domain: workflow, job, step,
 * defaults, and topology helpers.
 *
 * Merged from:
 * - packages/workflows/tests/schema-workflow.test.ts
 * - packages/workflows/tests/schema-job.test.ts
 * - packages/workflows/tests/schema-step.test.ts
 * - packages/workflows/tests/schema-defaults.test.ts
 * - packages/workflows/tests/schema-topology.test.ts
 */

import { describe, expect, test } from "vite-plus/test";

import {
  type DepRecord,
  findCycle,
  findDanglingDeps,
  jobSchema,
  stepSchema,
  TOPOLOGY_ISSUE_KIND,
  topoSort,
  workflowSchema,
} from "../src/schemas/workflow.ts";

interface IssueParams {
  readonly kind?: unknown;
}

// -----------------------------------------------------------------------------
// Workflow — was packages/workflows/tests/schema-workflow.test.ts
// -----------------------------------------------------------------------------

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

  test("rejects whitespace-only name", () => {
    const result = workflowSchema.safeParse({
      name: "   ",
      jobs: { a: { steps: [{ run: "x" }] } },
    });
    expect(result.success).toBe(false);
  });
});

describe("workflowSchema — topology issue codes", () => {
  test("empty jobs issue carries code EMPTY_JOBS", () => {
    const result = workflowSchema.safeParse({ name: "wf", jobs: {} });
    expect(result.success).toBe(false);
    if (!result.success) {
      const codes = result.error.issues
        .filter((i) => (i as { params?: IssueParams }).params?.kind === TOPOLOGY_ISSUE_KIND)
        .map((i) => (i as { params?: { code?: unknown } }).params?.code);
      expect(codes).toContain("EMPTY_JOBS");
    }
  });

  test("dangling needs issue carries code DANGLING_NEED", () => {
    const result = workflowSchema.safeParse({
      name: "wf",
      jobs: { a: { needs: ["ghost"], steps: [{ run: "x" }] } },
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const codes = result.error.issues
        .filter((i) => (i as { params?: IssueParams }).params?.kind === TOPOLOGY_ISSUE_KIND)
        .map((i) => (i as { params?: { code?: unknown } }).params?.code);
      expect(codes).toContain("DANGLING_NEED");
    }
  });

  test("cycle issue carries code CYCLE_DETECTED", () => {
    const result = workflowSchema.safeParse({
      name: "wf",
      jobs: {
        a: { needs: ["b"], steps: [{ run: "x" }] },
        b: { needs: ["a"], steps: [{ run: "x" }] },
      },
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const codes = result.error.issues
        .filter((i) => (i as { params?: IssueParams }).params?.kind === TOPOLOGY_ISSUE_KIND)
        .map((i) => (i as { params?: { code?: unknown } }).params?.code);
      expect(codes).toContain("CYCLE_DETECTED");
    }
  });
});

// -----------------------------------------------------------------------------
// Job — was packages/workflows/tests/schema-job.test.ts
// -----------------------------------------------------------------------------

describe("jobSchema — happy paths", () => {
  test("accepts minimal steps job", () => {
    const result = jobSchema.safeParse({ steps: [{ run: "echo hi" }] });
    expect(result.success).toBe(true);
  });

  test("accepts minimal uses job (reusable workflow)", () => {
    const result = jobSchema.safeParse({ uses: "./reusable.yaml" });
    expect(result.success).toBe(true);
  });

  test("accepts uses job with `with:` map", () => {
    const result = jobSchema.safeParse({
      uses: "org/wf@1",
      with: { input1: "value1" },
    });
    expect(result.success).toBe(true);
  });

  test("accepts steps job with full optional fields", () => {
    const result = jobSchema.safeParse({
      name: "Build",
      needs: ["lint", "test"],
      if: true,
      env: { FOO: "bar" },
      outputs: { version: "${{ steps.x.outputs.ver }}" },
      steps: [{ run: "echo build" }],
    });
    expect(result.success).toBe(true);
  });
});

describe("jobSchema — XOR enforcement", () => {
  test("rejects job declaring both steps and uses", () => {
    const result = jobSchema.safeParse({
      steps: [{ run: "echo hi" }],
      uses: "./reusable.yaml",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some((i) => /not both/.test(i.message))).toBe(true);
    }
  });

  test("rejects job declaring neither steps nor uses", () => {
    const result = jobSchema.safeParse({ name: "Empty" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some((i) => /either 'steps:' or 'uses:'/.test(i.message))).toBe(
        true,
      );
    }
  });

  test("rejects steps job that also declares with", () => {
    const result = jobSchema.safeParse({
      steps: [{ run: "echo hi" }],
      with: { x: "y" },
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(
        result.error.issues.some((i) => /'with:' is only valid on 'uses:' jobs/.test(i.message)),
      ).toBe(true);
    }
  });
});

describe("jobSchema — needs", () => {
  test("accepts empty needs array", () => {
    const result = jobSchema.safeParse({ steps: [{ run: "x" }], needs: [] });
    expect(result.success).toBe(true);
  });

  test("accepts kebab-case ids in needs", () => {
    const result = jobSchema.safeParse({
      steps: [{ run: "x" }],
      needs: ["lint", "test-suite", "build-1"],
    });
    expect(result.success).toBe(true);
  });

  test("rejects needs entries with uppercase or underscores", () => {
    expect(jobSchema.safeParse({ steps: [{ run: "x" }], needs: ["Lint"] }).success).toBe(false);
    expect(jobSchema.safeParse({ steps: [{ run: "x" }], needs: ["lint_step"] }).success).toBe(
      false,
    );
  });

  test("rejects needs entries that are not strings", () => {
    expect(jobSchema.safeParse({ steps: [{ run: "x" }], needs: [42] }).success).toBe(false);
  });
});

describe("jobSchema — steps minimum", () => {
  test("rejects empty steps array", () => {
    const result = jobSchema.safeParse({ steps: [] });
    expect(result.success).toBe(false);
  });
});

describe("jobSchema — outputs", () => {
  test("accepts record of name → expression string", () => {
    const result = jobSchema.safeParse({
      steps: [{ run: "x" }],
      outputs: {
        ver: "${{ steps.x.outputs.ver }}",
        plain: "literal",
      },
    });
    expect(result.success).toBe(true);
  });

  test("rejects malformed expression in output value", () => {
    const result = jobSchema.safeParse({
      steps: [{ run: "x" }],
      outputs: { bad: "a ${{ x" },
    });
    expect(result.success).toBe(false);
  });

  test("rejects empty output name", () => {
    const result = jobSchema.safeParse({
      steps: [{ run: "x" }],
      outputs: { "": "value" },
    });
    expect(result.success).toBe(false);
  });
});

// -----------------------------------------------------------------------------
// Step — was packages/workflows/tests/schema-step.test.ts
// -----------------------------------------------------------------------------

describe("stepSchema — happy paths", () => {
  test("accepts minimal run step", () => {
    const result = stepSchema.safeParse({ run: "echo hi" });
    expect(result.success).toBe(true);
  });

  test("accepts minimal uses step", () => {
    const result = stepSchema.safeParse({ uses: "aiactions/lint@1" });
    expect(result.success).toBe(true);
  });

  test("accepts uses step with `with:` map", () => {
    const result = stepSchema.safeParse({
      uses: "aiactions/lint@1",
      with: { input1: "value1", input2: "${{ env.X }}" },
    });
    expect(result.success).toBe(true);
  });

  test("accepts step with full optional fields populated", () => {
    const result = stepSchema.safeParse({
      id: "my-step",
      name: "My Step",
      if: true,
      env: { FOO: "bar" },
      "working-directory": "src/",
      "timeout-minutes": 5,
      run: "echo ${{ env.FOO }}",
    });
    expect(result.success).toBe(true);
  });
});

describe("stepSchema — XOR enforcement", () => {
  test("rejects step declaring both run and uses", () => {
    const result = stepSchema.safeParse({ run: "echo hi", uses: "aiactions/lint@1" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some((i) => /not both/.test(i.message))).toBe(true);
    }
  });

  test("rejects step declaring neither run nor uses", () => {
    const result = stepSchema.safeParse({ id: "x" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some((i) => /either 'run:' or 'uses:'/.test(i.message))).toBe(
        true,
      );
    }
  });

  test("rejects run step that also declares with", () => {
    const result = stepSchema.safeParse({ run: "echo hi", with: { x: "y" } });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(
        result.error.issues.some((i) => /'with:' is only valid on 'uses:'/.test(i.message)),
      ).toBe(true);
    }
  });
});

describe("stepSchema — kebab-to-camel remap", () => {
  test("remaps working-directory to workingDirectory", () => {
    const result = stepSchema.safeParse({ run: "x", "working-directory": "src/" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect((result.data as { workingDirectory?: string }).workingDirectory).toBe("src/");
      expect((result.data as Record<string, unknown>)["working-directory"]).toBeUndefined();
    }
  });

  test("remaps timeout-minutes to timeoutMinutes", () => {
    const result = stepSchema.safeParse({ run: "x", "timeout-minutes": 5 });
    expect(result.success).toBe(true);
    if (result.success) {
      expect((result.data as { timeoutMinutes?: number }).timeoutMinutes).toBe(5);
      expect((result.data as Record<string, unknown>)["timeout-minutes"]).toBeUndefined();
    }
  });

  test("absent kebab keys are not introduced as undefined camelCase keys", () => {
    const result = stepSchema.safeParse({ run: "x" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect("workingDirectory" in (result.data as object)).toBe(false);
      expect("timeoutMinutes" in (result.data as object)).toBe(false);
    }
  });
});

describe("stepSchema — `if:` permissive form", () => {
  test("accepts boolean literals", () => {
    expect(stepSchema.safeParse({ run: "x", if: true }).success).toBe(true);
    expect(stepSchema.safeParse({ run: "x", if: false }).success).toBe(true);
  });

  test("accepts ${{ }} expression strings", () => {
    expect(stepSchema.safeParse({ run: "x", if: "${{ env.X == 'y' }}" }).success).toBe(true);
  });

  test("accepts bare expression strings without ${{ }} wrapping (GHA-faithful)", () => {
    expect(stepSchema.safeParse({ run: "x", if: "success()" }).success).toBe(true);
  });

  test("rejects numbers", () => {
    expect(stepSchema.safeParse({ run: "x", if: 1 }).success).toBe(false);
    expect(stepSchema.safeParse({ run: "x", if: 0 }).success).toBe(false);
  });

  test("rejects null and undefined-equivalent forms", () => {
    expect(stepSchema.safeParse({ run: "x", if: null }).success).toBe(false);
  });

  test("rejects malformed expression strings (unterminated ${{)", () => {
    expect(stepSchema.safeParse({ run: "x", if: "a ${{ x" }).success).toBe(false);
  });
});

describe("stepSchema — review tightening (whitespace + multi-issue)", () => {
  test("rejects whitespace-only step name", () => {
    expect(stepSchema.safeParse({ run: "x", name: "   " }).success).toBe(false);
  });

  test("rejects empty run", () => {
    expect(stepSchema.safeParse({ run: "" }).success).toBe(false);
  });

  test("rejects whitespace-only run", () => {
    expect(stepSchema.safeParse({ run: "   \n\t" }).success).toBe(false);
  });

  test("surfaces both XOR and `with:`-on-`run:` issues in the same parse", () => {
    const result = stepSchema.safeParse({
      run: "echo hi",
      uses: "aiactions/lint@1",
      with: { x: "y" },
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const messages = result.error.issues.map((i) => i.message);
      expect(messages.some((m) => /not both/.test(m))).toBe(true);
      expect(messages.some((m) => /'with:' is only valid on 'uses:'/.test(m))).toBe(true);
    }
  });
});

describe("stepSchema — id regex", () => {
  test("accepts kebab-case ids", () => {
    expect(stepSchema.safeParse({ run: "x", id: "lint" }).success).toBe(true);
    expect(stepSchema.safeParse({ run: "x", id: "lint-step" }).success).toBe(true);
    expect(stepSchema.safeParse({ run: "x", id: "step-1" }).success).toBe(true);
  });

  test("rejects uppercase, underscores, leading digit, special chars", () => {
    expect(stepSchema.safeParse({ run: "x", id: "Lint" }).success).toBe(false);
    expect(stepSchema.safeParse({ run: "x", id: "lint_step" }).success).toBe(false);
    expect(stepSchema.safeParse({ run: "x", id: "1step" }).success).toBe(false);
    expect(stepSchema.safeParse({ run: "x", id: "step!" }).success).toBe(false);
  });
});

describe("stepSchema — shell field", () => {
  test("accepts each enumerated shell on a run step", () => {
    for (const shell of ["bash", "sh", "pwsh", "python", "cmd"] as const) {
      const result = stepSchema.safeParse({ run: "x", shell });
      expect(result.success).toBe(true);
    }
  });

  test("rejects unknown shell values", () => {
    expect(stepSchema.safeParse({ run: "x", shell: "zsh" }).success).toBe(false);
    expect(stepSchema.safeParse({ run: "x", shell: "" }).success).toBe(false);
    expect(stepSchema.safeParse({ run: "x", shell: "bash -e" }).success).toBe(false);
  });

  test("rejects shell on a uses step", () => {
    const result = stepSchema.safeParse({
      uses: "aiactions/lint@1",
      shell: "bash",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(
        result.error.issues.some((i) => /'shell:' is only valid on 'run:'/.test(i.message)),
      ).toBe(true);
    }
  });

  test("absent shell field stays absent on the parsed output", () => {
    const result = stepSchema.safeParse({ run: "x" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect("shell" in (result.data as object)).toBe(false);
    }
  });
});

// -----------------------------------------------------------------------------
// Defaults — was packages/workflows/tests/schema-defaults.test.ts
// -----------------------------------------------------------------------------

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

// -----------------------------------------------------------------------------
// Topology — was packages/workflows/tests/schema-topology.test.ts
// -----------------------------------------------------------------------------

describe("findDanglingDeps", () => {
  test("returns empty array for an empty graph", () => {
    expect(findDanglingDeps([])).toEqual([]);
  });

  test("returns empty array when no deps are dangling", () => {
    const records: DepRecord[] = [
      { id: "a", deps: [] },
      { id: "b", deps: ["a"] },
    ];
    expect(findDanglingDeps(records)).toEqual([]);
  });

  test("returns a single entry for a single dangling dep", () => {
    const records: DepRecord[] = [{ id: "a", deps: ["ghost"] }];
    expect(findDanglingDeps(records)).toEqual([{ id: "a", missing: ["ghost"] }]);
  });

  test("collects multiple missing deps per node", () => {
    const records: DepRecord[] = [
      { id: "a", deps: ["x", "y", "z"] },
      { id: "x", deps: [] },
    ];
    expect(findDanglingDeps(records)).toEqual([{ id: "a", missing: ["y", "z"] }]);
  });

  test("collects dangling deps across multiple nodes", () => {
    const records: DepRecord[] = [
      { id: "a", deps: ["ghost1"] },
      { id: "b", deps: ["ghost2"] },
    ];
    const found = findDanglingDeps(records);
    expect(found).toHaveLength(2);
    expect(found).toContainEqual({ id: "a", missing: ["ghost1"] });
    expect(found).toContainEqual({ id: "b", missing: ["ghost2"] });
  });
});

describe("findCycle", () => {
  test("returns null for an empty graph", () => {
    expect(findCycle([])).toBeNull();
  });

  test("returns null for an acyclic linear graph", () => {
    const records: DepRecord[] = [
      { id: "a", deps: [] },
      { id: "b", deps: ["a"] },
      { id: "c", deps: ["b"] },
    ];
    expect(findCycle(records)).toBeNull();
  });

  test("detects a two-node cycle", () => {
    const records: DepRecord[] = [
      { id: "a", deps: ["b"] },
      { id: "b", deps: ["a"] },
    ];
    const cycle = findCycle(records);
    expect(cycle).not.toBeNull();
    if (cycle) {
      expect(cycle).toContain("a");
      expect(cycle).toContain("b");
      expect(cycle[0]).toBe(cycle[cycle.length - 1]);
    }
  });

  test("detects a three-node cycle", () => {
    const records: DepRecord[] = [
      { id: "a", deps: ["b"] },
      { id: "b", deps: ["c"] },
      { id: "c", deps: ["a"] },
    ];
    const cycle = findCycle(records);
    expect(cycle).not.toBeNull();
    if (cycle) {
      expect(cycle.length).toBeGreaterThanOrEqual(3);
      expect(cycle[0]).toBe(cycle[cycle.length - 1]);
    }
  });

  test("detects a self-loop as a cycle", () => {
    const records: DepRecord[] = [{ id: "a", deps: ["a"] }];
    const cycle = findCycle(records);
    expect(cycle).not.toBeNull();
  });

  test("ignores dangling deps when looking for cycles", () => {
    const records: DepRecord[] = [
      { id: "a", deps: ["ghost", "b"] },
      { id: "b", deps: [] },
    ];
    expect(findCycle(records)).toBeNull();
  });
});

describe("topoSort", () => {
  test("returns empty array for an empty graph", () => {
    expect(topoSort([])).toEqual([]);
  });

  test("orders a linear chain so that deps precede dependents", () => {
    const records: DepRecord[] = [
      { id: "c", deps: ["b"] },
      { id: "b", deps: ["a"] },
      { id: "a", deps: [] },
    ];
    const order = topoSort(records);
    expect(order.indexOf("a")).toBeLessThan(order.indexOf("b"));
    expect(order.indexOf("b")).toBeLessThan(order.indexOf("c"));
  });

  test("orders a diamond DAG so that the root precedes both branches and both precede the leaf", () => {
    const records: DepRecord[] = [
      { id: "root", deps: [] },
      { id: "left", deps: ["root"] },
      { id: "right", deps: ["root"] },
      { id: "leaf", deps: ["left", "right"] },
    ];
    const order = topoSort(records);
    expect(order.indexOf("root")).toBeLessThan(order.indexOf("left"));
    expect(order.indexOf("root")).toBeLessThan(order.indexOf("right"));
    expect(order.indexOf("left")).toBeLessThan(order.indexOf("leaf"));
    expect(order.indexOf("right")).toBeLessThan(order.indexOf("leaf"));
  });

  test("throws when a dep is unknown (dangling)", () => {
    const records: DepRecord[] = [{ id: "a", deps: ["ghost"] }];
    expect(() => topoSort(records)).toThrowError(/dangling dep/);
  });

  test("throws when the graph contains a cycle", () => {
    const records: DepRecord[] = [
      { id: "a", deps: ["b"] },
      { id: "b", deps: ["a"] },
    ];
    expect(() => topoSort(records)).toThrowError(/cycle/);
  });
});
