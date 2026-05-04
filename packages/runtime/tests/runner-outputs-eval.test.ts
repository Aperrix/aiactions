/**
 * Tests for the steps.<id>.outputs.<key> extension to the runtime
 * expression evaluator. Pure-data tests on evaluateExpression — no
 * subprocess.
 */

import { describe, expect, test } from "vite-plus/test";

import { evaluateExpression, type EvalContext } from "../src/eval/expression.ts";
import { ExpressionEvalError } from "../src/types/errors.ts";

const baseCtx = (steps: Record<string, { outputs: Record<string, string> }> = {}): EvalContext => ({
  env: {},
  inputs: {},
  steps,
});

describe("evaluateExpression — steps.<id>.outputs.<key>", () => {
  test("resolves a known output", () => {
    const ctx = baseCtx({ s1: { outputs: { foo: "bar" } } });
    expect(evaluateExpression("${{ steps.s1.outputs.foo }}", ctx)).toBe("bar");
  });

  test("unknown step id raises ExpressionEvalError", () => {
    const ctx = baseCtx({ s1: { outputs: {} } });
    expect(() => evaluateExpression("${{ steps.nope.outputs.foo }}", ctx)).toThrow(
      ExpressionEvalError,
    );
  });

  test("known step but missing output yields empty string", () => {
    const ctx = baseCtx({ s1: { outputs: {} } });
    expect(evaluateExpression("${{ steps.s1.outputs.foo }}", ctx)).toBe("");
  });

  test("supports inline mixing with literals", () => {
    const ctx = baseCtx({ s1: { outputs: { msg: "hello" } } });
    expect(evaluateExpression("> ${{ steps.s1.outputs.msg }} <", ctx)).toBe("> hello <");
  });

  test("env and inputs paths still work alongside steps", () => {
    const ctx: EvalContext = {
      env: { X: "x" },
      inputs: { Y: "y" },
      steps: { s1: { outputs: { Z: "z" } } },
    };
    expect(evaluateExpression("${{ env.X }}+${{ inputs.Y }}+${{ steps.s1.outputs.Z }}", ctx)).toBe(
      "x+y+z",
    );
  });
});
