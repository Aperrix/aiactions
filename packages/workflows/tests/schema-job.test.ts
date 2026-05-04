/**
 * Tests for `jobSchema` — XOR enforcement (steps[] vs uses), needs array
 * shape, outputs map shape, and the `with:`-only-on-uses rule.
 *
 * Contents:
 * - happy paths: steps job, uses job, full optional fields.
 * - XOR enforcement.
 * - `with:` placement.
 * - `needs:` shape (kebab-case, empty array allowed).
 * - `steps:` minimum cardinality (≥ 1 when present).
 * - `outputs:` shape (record name → expression string).
 */

import { describe, expect, test } from "vite-plus/test";

import { jobSchema } from "../src/schema/job.ts";

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
