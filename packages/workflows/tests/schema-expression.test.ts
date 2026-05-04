/**
 * Tests for the `${{ }}` tokenizer + companion utilities.
 *
 * Contents:
 * - `tokenizeExpression`: empty input, pure literals, single + mixed
 *   + adjacent expressions, trimming, malformed forms.
 * - `containsExpression`: presence predicate.
 * - `expressionStringSchema`: success / failure of parse.
 */

import { describe, expect, test } from "vite-plus/test";

import {
  containsExpression,
  ExpressionTokenKind,
  expressionStringSchema,
  tokenizeExpression,
} from "../src/schema/expression.ts";

describe("tokenizeExpression", () => {
  test("empty input returns empty array", () => {
    expect(tokenizeExpression("")).toEqual([]);
  });

  test("pure literal becomes one literal token", () => {
    expect(tokenizeExpression("hello world")).toEqual([
      { kind: ExpressionTokenKind.literal, value: "hello world" },
    ]);
  });

  test("single ${{ }} becomes one expression token with trimmed body", () => {
    expect(tokenizeExpression("${{ env.X }}")).toEqual([
      { kind: ExpressionTokenKind.expression, value: "env.X" },
    ]);
  });

  test("body whitespace is trimmed including tabs and newlines", () => {
    expect(tokenizeExpression("${{\t  env.X  \n}}")).toEqual([
      { kind: ExpressionTokenKind.expression, value: "env.X" },
    ]);
  });

  test("mixed literal + expression + literal yields three tokens in order", () => {
    expect(tokenizeExpression("echo ${{ env.X }} done")).toEqual([
      { kind: ExpressionTokenKind.literal, value: "echo " },
      { kind: ExpressionTokenKind.expression, value: "env.X" },
      { kind: ExpressionTokenKind.literal, value: " done" },
    ]);
  });

  test("adjacent expressions produce two expression tokens with no literal between them", () => {
    expect(tokenizeExpression("${{ a }}${{ b }}")).toEqual([
      { kind: ExpressionTokenKind.expression, value: "a" },
      { kind: ExpressionTokenKind.expression, value: "b" },
    ]);
  });

  test("expression at the end of a literal preserves trailing emptiness without an empty literal", () => {
    expect(tokenizeExpression("foo ${{ x }}")).toEqual([
      { kind: ExpressionTokenKind.literal, value: "foo " },
      { kind: ExpressionTokenKind.expression, value: "x" },
    ]);
  });

  test("expression at the start preserves the rest as a literal", () => {
    expect(tokenizeExpression("${{ x }} bar")).toEqual([
      { kind: ExpressionTokenKind.expression, value: "x" },
      { kind: ExpressionTokenKind.literal, value: " bar" },
    ]);
  });

  test("unterminated ${{ throws", () => {
    expect(() => tokenizeExpression("hello ${{ env.X")).toThrowError(/unterminated/);
  });

  test("nested ${{ inside an expression body throws", () => {
    expect(() => tokenizeExpression("${{ a ${{ b }} }}")).toThrowError(/nested/);
  });

  test("empty expression body throws", () => {
    expect(() => tokenizeExpression("${{ }}")).toThrowError(/empty expression/);
    expect(() => tokenizeExpression("${{}}")).toThrowError(/empty expression/);
  });
});

describe("containsExpression", () => {
  test("returns true when string contains '${{'", () => {
    expect(containsExpression("a ${{ x }} b")).toBe(true);
    expect(containsExpression("${{")).toBe(true);
  });

  test("returns false when string does not contain '${{'", () => {
    expect(containsExpression("plain string")).toBe(false);
    expect(containsExpression("")).toBe(false);
    expect(containsExpression("$ { { x } }")).toBe(false);
  });
});

describe("expressionStringSchema", () => {
  test("accepts well-formed expression strings (literal, expression, mixed)", () => {
    expect(expressionStringSchema.safeParse("plain").success).toBe(true);
    expect(expressionStringSchema.safeParse("${{ env.X }}").success).toBe(true);
    expect(expressionStringSchema.safeParse("a ${{ x }} b ${{ y }} c").success).toBe(true);
    expect(expressionStringSchema.safeParse("").success).toBe(true);
  });

  test("rejects unterminated expressions with a custom-coded issue", () => {
    const result = expressionStringSchema.safeParse("a ${{ x");
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toMatch(/unterminated/);
    }
  });

  test("rejects empty-body expressions", () => {
    const result = expressionStringSchema.safeParse("${{   }}");
    expect(result.success).toBe(false);
  });

  test("rejects nested expressions", () => {
    const result = expressionStringSchema.safeParse("${{ a ${{ b }} }}");
    expect(result.success).toBe(false);
  });

  test("rejects non-string input at the type level", () => {
    expect(expressionStringSchema.safeParse(42).success).toBe(false);
    expect(expressionStringSchema.safeParse(null).success).toBe(false);
  });
});
