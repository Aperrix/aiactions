/**
 * Tests for `getShellInvocation` — the pure mapping from
 * `(shell, scriptPath, platform)` to a concrete `(bin, args, extension)`.
 *
 * Contents:
 * - Linux/macOS defaults and explicit shell values.
 * - Windows defaults and Windows-only shells.
 * - Cross-platform shells (`bash`, `pwsh`).
 * - Rejection paths: `sh` on Windows, `cmd` on POSIX.
 */

import { describe, expect, test } from "vite-plus/test";

import { getShellInvocation } from "../src/exec/shell-spec.ts";
import { RuntimeUnsupportedError } from "../src/types/errors.ts";

const SCRIPT = "/tmp/aiactions-x/step-0.sh";

describe("getShellInvocation — Linux/macOS defaults", () => {
  test("unspecified shell on linux returns 'bash -e <script>'", () => {
    const inv = getShellInvocation(undefined, SCRIPT, "linux", true);
    expect(inv.bin).toBe("bash");
    expect(inv.args).toEqual(["-e", SCRIPT]);
    expect(inv.extension).toBe(".sh");
  });

  test("unspecified shell on darwin returns 'bash -e <script>'", () => {
    const inv = getShellInvocation(undefined, SCRIPT, "darwin", true);
    expect(inv.bin).toBe("bash");
    expect(inv.args).toEqual(["-e", SCRIPT]);
  });

  test("explicit shell: bash uses --noprofile --norc -eo pipefail", () => {
    const inv = getShellInvocation("bash", SCRIPT, "linux", true);
    expect(inv.bin).toBe("bash");
    expect(inv.args).toEqual(["--noprofile", "--norc", "-e", "-o", "pipefail", SCRIPT]);
    expect(inv.extension).toBe(".sh");
  });

  test("shell: sh on linux returns 'sh -e <script>'", () => {
    const inv = getShellInvocation("sh", SCRIPT, "linux", true);
    expect(inv.bin).toBe("sh");
    expect(inv.args).toEqual(["-e", SCRIPT]);
    expect(inv.extension).toBe(".sh");
  });
});

describe("getShellInvocation — Windows defaults", () => {
  test("unspecified shell on win32 returns pwsh", () => {
    const inv = getShellInvocation(undefined, SCRIPT, "win32", true);
    expect(inv.bin).toBe("pwsh");
    expect(inv.args).toEqual(["-command", `. '${SCRIPT}'`]);
    expect(inv.extension).toBe(".ps1");
  });

  test("explicit shell: cmd uses ComSpec with /D /E:ON /V:OFF /S /C CALL", () => {
    const previousComSpec = process.env.ComSpec;
    process.env.ComSpec = "C:\\Windows\\System32\\cmd.exe";
    try {
      const inv = getShellInvocation("cmd", SCRIPT, "win32", true);
      expect(inv.bin).toBe("C:\\Windows\\System32\\cmd.exe");
      expect(inv.args).toEqual(["/D", "/E:ON", "/V:OFF", "/S", "/C", `CALL "${SCRIPT}"`]);
      expect(inv.extension).toBe(".cmd");
    } finally {
      if (previousComSpec === undefined) delete process.env.ComSpec;
      else process.env.ComSpec = previousComSpec;
    }
  });

  test("explicit shell: cmd falls back to 'cmd.exe' when ComSpec unset", () => {
    const previousComSpec = process.env.ComSpec;
    delete process.env.ComSpec;
    try {
      const inv = getShellInvocation("cmd", SCRIPT, "win32", true);
      expect(inv.bin).toBe("cmd.exe");
    } finally {
      if (previousComSpec !== undefined) process.env.ComSpec = previousComSpec;
    }
  });
});

describe("getShellInvocation — cross-platform shells", () => {
  test("explicit shell: pwsh works on linux", () => {
    const inv = getShellInvocation("pwsh", SCRIPT, "linux", true);
    expect(inv.bin).toBe("pwsh");
    expect(inv.args).toEqual(["-command", `. '${SCRIPT}'`]);
    expect(inv.extension).toBe(".ps1");
  });

  test("explicit shell: pwsh works on win32", () => {
    const inv = getShellInvocation("pwsh", SCRIPT, "win32", true);
    expect(inv.bin).toBe("pwsh");
    expect(inv.args).toEqual(["-command", `. '${SCRIPT}'`]);
  });

  test("explicit shell: bash works on win32 (Git for Windows etc.)", () => {
    const inv = getShellInvocation("bash", SCRIPT, "win32", true);
    expect(inv.bin).toBe("bash");
    expect(inv.args).toEqual(["--noprofile", "--norc", "-e", "-o", "pipefail", SCRIPT]);
  });
});

describe("getShellInvocation — rejection paths", () => {
  test("shell: sh on win32 throws RuntimeUnsupportedError", () => {
    expect(() => getShellInvocation("sh", SCRIPT, "win32", true)).toThrow(RuntimeUnsupportedError);
  });

  test("shell: cmd on linux throws RuntimeUnsupportedError", () => {
    expect(() => getShellInvocation("cmd", SCRIPT, "linux", true)).toThrow(RuntimeUnsupportedError);
  });

  test("shell: cmd on darwin throws RuntimeUnsupportedError", () => {
    expect(() => getShellInvocation("cmd", SCRIPT, "darwin", true)).toThrow(
      RuntimeUnsupportedError,
    );
  });
});
