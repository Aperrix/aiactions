/**
 * Tests for `writeScript` — tmpfile creation, content roundtrip, mode
 * (POSIX), and idempotent cleanup semantics.
 *
 * Contents:
 * - Path is under `os.tmpdir()` and ends with the requested extension.
 * - File content matches the body byte-for-byte.
 * - Cleanup unlinks the file.
 * - Cleanup is idempotent — second call after unlink does not throw.
 * - Parent directory exists with mode `0o700` on POSIX (skipped on
 *   Windows, where Node ignores `mode`).
 */

import { randomUUID } from "node:crypto";
import { readFile, stat } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname } from "node:path";

import { describe, expect, test } from "vite-plus/test";

import { writeScript } from "../src/script-file.ts";

const isWindows = process.platform === "win32";

describe("writeScript", () => {
  test("returns a path under os.tmpdir() with the requested extension", async () => {
    const runId = randomUUID();
    const handle = await writeScript("echo hi\n", runId, 0, ".sh", process.platform);
    try {
      expect(handle.path.startsWith(tmpdir())).toBe(true);
      expect(handle.path.endsWith(".sh")).toBe(true);
    } finally {
      await handle.cleanup();
    }
  });

  test("file content matches the body byte-for-byte", async () => {
    const runId = randomUUID();
    const body = "#!/usr/bin/env bash\necho hi\n";
    const handle = await writeScript(body, runId, 7, ".sh", process.platform);
    try {
      const read = await readFile(handle.path, { encoding: "utf8" });
      expect(read).toBe(body);
    } finally {
      await handle.cleanup();
    }
  });

  test("cleanup unlinks the file", async () => {
    const runId = randomUUID();
    const handle = await writeScript("x", runId, 0, ".sh", process.platform);
    await handle.cleanup();
    await expect(stat(handle.path)).rejects.toMatchObject({ code: "ENOENT" });
  });

  test("cleanup is idempotent (second call does not throw)", async () => {
    const runId = randomUUID();
    const handle = await writeScript("x", runId, 0, ".sh", process.platform);
    await handle.cleanup();
    await expect(handle.cleanup()).resolves.toBeUndefined();
  });

  test.skipIf(isWindows)("parent directory has mode 0o700 on POSIX", async () => {
    const runId = randomUUID();
    const handle = await writeScript("x", runId, 0, ".sh", process.platform);
    try {
      const parent = dirname(handle.path);
      const info = await stat(parent);
      // Mask off file type bits; check permission bits only.
      // eslint-disable-next-line no-bitwise
      expect(info.mode & 0o777).toBe(0o700);
    } finally {
      await handle.cleanup();
    }
  });
});
