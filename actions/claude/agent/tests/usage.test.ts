/**
 * Unit tests for `buildUsage`. Covers: missing fields default to 0,
 * total falls back to input+output, model_usage passthrough.
 */

import { describe, expect, test } from "vite-plus/test";

import { buildUsage } from "../src/usage.ts";

describe("buildUsage", () => {
  test("zeros out all fields when result is empty", () => {
    expect(buildUsage({})).toEqual({
      input: 0,
      output: 0,
      total: 0,
      cost_usd: 0,
      num_turns: 0,
      model_usage: {},
    });
  });

  test("maps the standard result shape", () => {
    const result = buildUsage({
      usage: { input_tokens: 100, output_tokens: 200, total_tokens: 300 },
      total_cost_usd: 0.05,
      num_turns: 3,
      model_usage: { "claude-sonnet-4-6": { input_tokens: 100, output_tokens: 200 } },
    });
    expect(result).toEqual({
      input: 100,
      output: 200,
      total: 300,
      cost_usd: 0.05,
      num_turns: 3,
      model_usage: { "claude-sonnet-4-6": { input_tokens: 100, output_tokens: 200 } },
    });
  });

  test("computes total = input + output when total_tokens is missing", () => {
    const result = buildUsage({ usage: { input_tokens: 10, output_tokens: 5 } });
    expect(result.total).toBe(15);
  });
});
