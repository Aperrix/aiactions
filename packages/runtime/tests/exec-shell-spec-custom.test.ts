/**
 * Unit tests for the custom shell template path in `getShellInvocation`
 * and for `parseCustomShellTemplate`. End-to-end execution of a custom
 * shell is covered by an additional smoke test in run-workflow.test.ts.
 */

import { describe, expect, test } from "vite-plus/test";

import { getShellInvocation, parseCustomShellTemplate } from "../src/exec/shell-spec.ts";

describe("parseCustomShellTemplate", () => {
  test("simple template with no extra args", () => {
    expect(parseCustomShellTemplate("perl {0}")).toEqual({
      bin: "perl",
      preArgs: [],
      postArgs: [],
    });
  });

  test("template with pre-args only", () => {
    expect(parseCustomShellTemplate("python -u {0}")).toEqual({
      bin: "python",
      preArgs: ["-u"],
      postArgs: [],
    });
  });

  test("template with post-args only", () => {
    expect(parseCustomShellTemplate("python {0} -m foo")).toEqual({
      bin: "python",
      preArgs: [],
      postArgs: ["-m", "foo"],
    });
  });

  test("template with both pre- and post-args", () => {
    expect(parseCustomShellTemplate("bash -x {0} arg1 arg2")).toEqual({
      bin: "bash",
      preArgs: ["-x"],
      postArgs: ["arg1", "arg2"],
    });
  });

  test("absolute-path command", () => {
    expect(parseCustomShellTemplate("/usr/bin/env python3 {0}")).toEqual({
      bin: "/usr/bin/env",
      preArgs: ["python3"],
      postArgs: [],
    });
  });
});

describe("getShellInvocation - custom shell template", () => {
  test("returns the parsed template with scriptPath substituted", () => {
    const inv = getShellInvocation("perl {0}", "/tmp/x", "linux", true);
    expect(inv.bin).toBe("perl");
    expect(inv.args).toEqual(["/tmp/x"]);
    expect(inv.extension).toBe("");
  });

  test("custom `bash {0}` does NOT inject --noprofile / -eo pipefail", () => {
    const inv = getShellInvocation("bash {0}", "/tmp/x", "linux", true);
    expect(inv.bin).toBe("bash");
    expect(inv.args).toEqual(["/tmp/x"]);
  });

  test("template with extra args wraps scriptPath in correct position", () => {
    const inv = getShellInvocation("bash -x {0} arg1", "/tmp/x", "linux", true);
    expect(inv.bin).toBe("bash");
    expect(inv.args).toEqual(["-x", "/tmp/x", "arg1"]);
  });
});
