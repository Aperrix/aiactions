import { expect, test } from "vite-plus/test";

import { UsageError } from "../src/_shared/cli-error.ts";
import { parseShortRef } from "../src/lib/parse-short-ref.ts";

test("valid short ref parses", () => {
  expect(parseShortRef("claude/agent")).toEqual({ ns: "claude", name: "agent" });
});

test("ref containing @ is rejected (not a short ref)", () => {
  expect(() => parseShortRef("claude/agent@1.0.0")).toThrow(UsageError);
});

test("bare name without ns rejected", () => {
  expect(() => parseShortRef("agent")).toThrow(/expected.*<ns>/);
});

test("uppercase rejected", () => {
  expect(() => parseShortRef("Claude/agent")).toThrow();
});

test("empty string rejected", () => {
  expect(() => parseShortRef("")).toThrow();
});
