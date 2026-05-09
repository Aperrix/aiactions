/**
 * Tests for the env-map schemas: name regex, value coercion, and the
 * full record shape.
 *
 * Contents:
 * - `envNameSchema`: positive + negative identifier cases.
 * - `envValueSchema`: string passthrough + number/boolean coercion +
 *   expression-string validation.
 * - `envSchema`: full happy map + bad-key / bad-value rejection.
 */

import { describe, expect, test } from "vite-plus/test";

import { envNameSchema, envSchema, envValueSchema } from "../src/schemas/env.ts";

describe("envNameSchema", () => {
  test("accepts POSIX identifiers (uppercase, underscore, digits, mixed)", () => {
    for (const name of ["FOO", "_PRIVATE", "BAR_BAZ", "X1", "x", "X_1_y"]) {
      expect(envNameSchema.safeParse(name).success).toBe(true);
    }
  });

  test("rejects names that start with a digit", () => {
    expect(envNameSchema.safeParse("1FOO").success).toBe(false);
  });

  test("rejects names containing whitespace, hyphen, or punctuation", () => {
    for (const name of ["FOO BAR", "FOO-BAR", "FOO.BAR", "FOO!"]) {
      expect(envNameSchema.safeParse(name).success).toBe(false);
    }
  });

  test("rejects empty string", () => {
    expect(envNameSchema.safeParse("").success).toBe(false);
  });
});

describe("envValueSchema", () => {
  test("accepts plain strings", () => {
    const result = envValueSchema.safeParse("hello");
    expect(result.success).toBe(true);
    if (result.success) expect(result.data).toBe("hello");
  });

  test("coerces numbers to string", () => {
    const result = envValueSchema.safeParse(3000);
    expect(result.success).toBe(true);
    if (result.success) expect(result.data).toBe("3000");
  });

  test("coerces booleans to string", () => {
    const result = envValueSchema.safeParse(true);
    expect(result.success).toBe(true);
    if (result.success) expect(result.data).toBe("true");
  });

  test("accepts expression-string values", () => {
    const result = envValueSchema.safeParse("${{ env.OTHER }}");
    expect(result.success).toBe(true);
    if (result.success) expect(result.data).toBe("${{ env.OTHER }}");
  });

  test("rejects malformed expression strings", () => {
    expect(envValueSchema.safeParse("a ${{ x").success).toBe(false);
    expect(envValueSchema.safeParse("${{   }}").success).toBe(false);
  });

  test("rejects null and undefined and objects", () => {
    expect(envValueSchema.safeParse(null).success).toBe(false);
    expect(envValueSchema.safeParse(undefined).success).toBe(false);
    expect(envValueSchema.safeParse({}).success).toBe(false);
    expect(envValueSchema.safeParse([]).success).toBe(false);
  });
});

describe("envSchema", () => {
  test("accepts a fully valid map mixing literals, numbers and expressions", () => {
    const result = envSchema.safeParse({
      FOO: "bar",
      PORT: 3000,
      DEBUG: true,
      VERSION: "${{ env.OTHER }}",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toEqual({
        FOO: "bar",
        PORT: "3000",
        DEBUG: "true",
        VERSION: "${{ env.OTHER }}",
      });
    }
  });

  test("rejects map with bad key", () => {
    const result = envSchema.safeParse({ "1FOO": "bar" });
    expect(result.success).toBe(false);
  });

  test("rejects map with bad value", () => {
    const result = envSchema.safeParse({ FOO: "a ${{ x" });
    expect(result.success).toBe(false);
  });

  test("accepts empty map", () => {
    const result = envSchema.safeParse({});
    expect(result.success).toBe(true);
  });
});
