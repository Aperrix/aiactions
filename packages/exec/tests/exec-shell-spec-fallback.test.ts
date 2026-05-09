/**
 * Unit tests for the POSIX bash → sh fallback in `getShellInvocation`.
 * The probe itself (`probeBashAvailability`) is exercised separately;
 * here we only assert that the parameter routes through correctly.
 */

import { describe, expect, test } from "vite-plus/test";

import { getShellInvocation, probeBashAvailability } from "../src/shell-spec.ts";

describe("getShellInvocation - POSIX default with bashAvailable", () => {
  test("uses bash when shell is unspecified and bash is available on linux", () => {
    const inv = getShellInvocation(undefined, "/tmp/x", "linux", true);
    expect(inv.bin).toBe("bash");
    expect(inv.args).toEqual(["-e", "/tmp/x"]);
    expect(inv.extension).toBe(".sh");
  });

  test("falls back to sh when bash is unavailable on linux", () => {
    const inv = getShellInvocation(undefined, "/tmp/x", "linux", false);
    expect(inv.bin).toBe("sh");
    expect(inv.args).toEqual(["-e", "/tmp/x"]);
    expect(inv.extension).toBe(".sh");
  });

  test("falls back to sh when bash is unavailable on darwin", () => {
    const inv = getShellInvocation(undefined, "/tmp/x", "darwin", false);
    expect(inv.bin).toBe("sh");
    expect(inv.args).toEqual(["-e", "/tmp/x"]);
    expect(inv.extension).toBe(".sh");
  });

  test("uses pwsh on win32 regardless of bashAvailable", () => {
    const a = getShellInvocation(undefined, "C:\\x", "win32", true);
    const b = getShellInvocation(undefined, "C:\\x", "win32", false);
    expect(a.bin).toBe("pwsh");
    expect(b.bin).toBe("pwsh");
  });

  test("explicit shell: bash ignores bashAvailable", () => {
    const inv = getShellInvocation("bash", "/tmp/x", "linux", false);
    expect(inv.bin).toBe("bash");
  });
});

describe("probeBashAvailability", () => {
  test("returns a boolean", async () => {
    const result = await probeBashAvailability();
    expect(typeof result).toBe("boolean");
  });
});
