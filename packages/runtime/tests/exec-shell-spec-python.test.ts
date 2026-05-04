/**
 * Unit tests for `shell: python` in `getShellInvocation`. Asserts the
 * GHA-faithful invocation shape — `python {0}`, no extension. Failure
 * semantics (Python exception → non-zero exit → failed step) are
 * exercised by the higher-level runner tests.
 */

import { describe, expect, test } from "vite-plus/test";

import { getShellInvocation } from "../src/exec/shell-spec.ts";

describe("getShellInvocation - shell: python", () => {
  test("returns python invocation with no extension on linux", () => {
    const inv = getShellInvocation("python", "/tmp/aiactions-run/step-0", "linux", true);
    expect(inv.bin).toBe("python");
    expect(inv.args).toEqual(["/tmp/aiactions-run/step-0"]);
    expect(inv.extension).toBe("");
  });

  test("returns python invocation with no extension on darwin", () => {
    const inv = getShellInvocation("python", "/tmp/aiactions-run/step-0", "darwin", true);
    expect(inv.bin).toBe("python");
    expect(inv.args).toEqual(["/tmp/aiactions-run/step-0"]);
    expect(inv.extension).toBe("");
  });

  test("returns python invocation with no extension on win32", () => {
    const inv = getShellInvocation("python", "C:\\tmp\\step-0", "win32", true);
    expect(inv.bin).toBe("python");
    expect(inv.args).toEqual(["C:\\tmp\\step-0"]);
    expect(inv.extension).toBe("");
  });
});
