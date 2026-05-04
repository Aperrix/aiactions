/**
 * Tests for `stepSchema` — XOR enforcement, kebab-to-camel remap, and
 * the permissive `if:` form.
 *
 * Contents:
 * - `stepSchema` happy paths: minimal `run:` and `uses:` shapes.
 * - XOR enforcement: both / neither rejected with clear messages.
 * - `with:` placement: only valid on `uses:` steps.
 * - Kebab-to-camel remap: `working-directory` → `workingDirectory`,
 *   `timeout-minutes` → `timeoutMinutes`.
 * - `if:` permissive form: boolean literals and any well-formed
 *   expression string accepted; non-boolean numbers rejected.
 * - Step id regex: kebab accepted, uppercase / invalid rejected.
 */

import { describe, expect, test } from "vite-plus/test";

import { stepSchema } from "../src/schema/step.ts";

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
