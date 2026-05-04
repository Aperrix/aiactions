/**
 * Schema-level tests for `shell:` custom template strings. The runtime
 * tests in `packages/runtime/tests/exec-shell-spec-custom.test.ts`
 * exercise the parsing and execution paths.
 */

import { describe, expect, test } from "vite-plus/test";

import { shellSchema } from "../src/schema/shell.ts";

describe("shellSchema - built-in enum values", () => {
  test.each(["bash", "sh", "pwsh", "python", "cmd"])("accepts %s", (s) => {
    expect(shellSchema.parse(s)).toBe(s);
  });
});

describe("shellSchema - custom template strings", () => {
  test.each([
    "perl {0}",
    "node {0}",
    "python -u {0}",
    "bash -x {0} arg1 arg2",
    "bash {0}",
    "/usr/bin/env python3 {0}",
  ])("accepts %s", (s) => {
    expect(shellSchema.parse(s)).toBe(s);
  });

  test.each(["perl", "{0}", "  {0}", "perl {1}", "perl {0} {0}", "", "perl{0}"])(
    "rejects %s",
    (s) => {
      expect(() => shellSchema.parse(s)).toThrow();
    },
  );
});
