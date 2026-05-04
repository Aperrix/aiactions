/**
 * Tests for `evaluateExpression` — the minimal MS1.0 `${{ }}`
 * evaluator. Exercises the happy paths (env / inputs lookup, mixed
 * literal+expression strings, single-expression strings) and every
 * failure mode (unknown context, undefined key, nested access,
 * unsupported syntax).
 *
 * Contents:
 * - Pure literals pass through unchanged.
 * - Single-expression bodies resolve to the value verbatim.
 * - Mixed literal+expression strings interpolate per segment.
 * - `env.X` / `inputs.X` lookups.
 * - `inputs` values are surfaced verbatim (the runner pre-stringifies).
 * - Whitespace inside `${{ }}` is tolerated.
 * - Errors: undefined key, unknown context, nested access, malformed
 *   body, illegal characters in key.
 */

import { describe, expect, test } from "vite-plus/test";

import { evaluateExpression } from "../src/eval/expression.ts";
import { ExpressionEvalError } from "../src/types/errors.ts";

const ctx = (
  env: Readonly<Record<string, string>> = {},
  inputs: Readonly<Record<string, string>> = {},
) => ({ env, inputs });

describe("evaluateExpression — happy paths", () => {
  test("returns pure literal unchanged", () => {
    expect(evaluateExpression("echo hi", ctx())).toBe("echo hi");
  });

  test("returns empty string for empty input", () => {
    expect(evaluateExpression("", ctx())).toBe("");
  });

  test("resolves a single ${{ env.X }} body", () => {
    expect(evaluateExpression("${{ env.FOO }}", ctx({ FOO: "bar" }))).toBe("bar");
  });

  test("resolves a single ${{ inputs.X }} body", () => {
    expect(evaluateExpression("${{ inputs.name }}", ctx({}, { name: "ada" }))).toBe("ada");
  });

  test("interpolates a mix of literal and expression segments", () => {
    const result = evaluateExpression(
      "echo ${{ env.GREETING }}, ${{ inputs.target }}!",
      ctx({ GREETING: "hello" }, { target: "world" }),
    );
    expect(result).toBe("echo hello, world!");
  });

  test("tolerates whitespace inside ${{ }}", () => {
    expect(evaluateExpression("${{   env.X   }}", ctx({ X: "1" }))).toBe("1");
  });

  test("inputs values are surfaced verbatim (no re-stringification)", () => {
    expect(evaluateExpression("${{ inputs.flag }}", ctx({}, { flag: "false" }))).toBe("false");
    expect(evaluateExpression("${{ inputs.count }}", ctx({}, { count: "42" }))).toBe("42");
    expect(evaluateExpression("${{ inputs.empty }}", ctx({}, { empty: "" }))).toBe("");
  });

  test("multiple references to the same key resolve independently", () => {
    expect(evaluateExpression("${{ env.X }}-${{ env.X }}", ctx({ X: "a" }))).toBe("a-a");
  });
});

describe("evaluateExpression — error paths", () => {
  test("throws on undefined env key", () => {
    expect(() => evaluateExpression("${{ env.MISSING }}", ctx())).toThrow(ExpressionEvalError);
    expect(() => evaluateExpression("${{ env.MISSING }}", ctx())).toThrow(
      /env\.MISSING is not defined/,
    );
  });

  test("throws on undefined inputs key", () => {
    expect(() => evaluateExpression("${{ inputs.x }}", ctx())).toThrow(/inputs\.x is not defined/);
  });

  test("throws on unsupported context", () => {
    expect(() => evaluateExpression("${{ steps.x.outputs.y }}", ctx())).toThrow(
      ExpressionEvalError,
    );
    expect(() => evaluateExpression("${{ github.actor }}", ctx())).toThrow(/github.*not supported/);
    expect(() => evaluateExpression("${{ matrix.os }}", ctx())).toThrow(/matrix.*not supported/);
    expect(() => evaluateExpression("${{ secrets.TOKEN }}", ctx())).toThrow(
      /secrets.*not supported/,
    );
  });

  test("throws on nested access (env.A.B)", () => {
    expect(() => evaluateExpression("${{ env.A.B }}", ctx({ A: "x" }))).toThrow(
      ExpressionEvalError,
    );
    expect(() => evaluateExpression("${{ env.A.B }}", ctx({ A: "x" }))).toThrow(/<context>\.<key>/);
  });

  test("throws on body with operators", () => {
    expect(() => evaluateExpression("${{ env.X == 'y' }}", ctx({ X: "y" }))).toThrow(
      ExpressionEvalError,
    );
  });

  test("throws on body with function calls", () => {
    expect(() => evaluateExpression("${{ success() }}", ctx())).toThrow(ExpressionEvalError);
  });

  test("throws on body with quoted literal", () => {
    expect(() => evaluateExpression("${{ 'literal' }}", ctx())).toThrow(ExpressionEvalError);
  });

  test("throws on body without context (just a key)", () => {
    expect(() => evaluateExpression("${{ FOO }}", ctx({ FOO: "x" }))).toThrow(ExpressionEvalError);
  });

  test("throws on body with leading dot or trailing dot", () => {
    expect(() => evaluateExpression("${{ .env.X }}", ctx({ X: "a" }))).toThrow(ExpressionEvalError);
    expect(() => evaluateExpression("${{ env.X. }}", ctx({ X: "a" }))).toThrow(ExpressionEvalError);
  });

  test("throws on context name with uppercase characters", () => {
    expect(() => evaluateExpression("${{ Env.X }}", ctx({ X: "a" }))).toThrow(ExpressionEvalError);
  });

  test("propagates tokenizer errors for malformed ${{ }}", () => {
    expect(() => evaluateExpression("a ${{ env.X", ctx({ X: "1" }))).toThrow(/unterminated/);
  });
});
