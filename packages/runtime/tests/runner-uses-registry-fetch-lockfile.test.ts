/**
 * Tests for `appendLockfileEntry` — atomic upsert into
 * <cwd>/.aiactions/lock.yaml. Pure I/O, no git involved.
 */

import { mkdtemp, readFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { describe, expect, test } from "vite-plus/test";

import { appendLockfileEntry } from "../src/runner/uses/registry-fetch.ts";

const POSIX = process.platform !== "win32";

describe.skipIf(!POSIX)("appendLockfileEntry", () => {
  test("creates the lockfile when missing", async () => {
    const cwd = await mkdtemp(join(tmpdir(), "aiactions-lockfile-"));
    await appendLockfileEntry({
      cwd,
      ref: { namespace: "aperrix", name: "lint", version: "v1.0.0" },
      resolvedSha: "0000000000000000000000000000000000000001",
      fetchedAt: new Date("2026-05-05T10:00:00.000Z"),
    });

    const content = await readFile(join(cwd, ".aiactions", "lock.yaml"), "utf8");
    expect(content).toContain("aperrix/lint@v1.0.0:");
    expect(content).toContain("resolved-sha: '0000000000000000000000000000000000000001'");
    expect(content).toContain("fetched-at: '2026-05-05T10:00:00.000Z'");
  });

  test("merges into an existing lockfile, preserving prior entries", async () => {
    const cwd = await mkdtemp(join(tmpdir(), "aiactions-lockfile-"));
    await appendLockfileEntry({
      cwd,
      ref: { namespace: "aperrix", name: "lint", version: "v1.0.0" },
      resolvedSha: "1111111111111111111111111111111111111111",
      fetchedAt: new Date("2026-05-05T10:00:00.000Z"),
    });
    await appendLockfileEntry({
      cwd,
      ref: { namespace: "octocat", name: "format", version: "main" },
      resolvedSha: "2222222222222222222222222222222222222222",
      fetchedAt: new Date("2026-05-05T10:01:00.000Z"),
    });

    const content = await readFile(join(cwd, ".aiactions", "lock.yaml"), "utf8");
    expect(content).toContain("aperrix/lint@v1.0.0:");
    expect(content).toContain("octocat/format@main:");
    expect(content).toContain("1111111111111111111111111111111111111111");
    expect(content).toContain("2222222222222222222222222222222222222222");
  });

  test("overwrites the entry for the same ref", async () => {
    const cwd = await mkdtemp(join(tmpdir(), "aiactions-lockfile-"));
    await appendLockfileEntry({
      cwd,
      ref: { namespace: "aperrix", name: "lint", version: "v1.0.0" },
      resolvedSha: "3333333333333333333333333333333333333333",
      fetchedAt: new Date("2026-05-05T10:00:00.000Z"),
    });
    await appendLockfileEntry({
      cwd,
      ref: { namespace: "aperrix", name: "lint", version: "v1.0.0" },
      resolvedSha: "4444444444444444444444444444444444444444",
      fetchedAt: new Date("2026-05-05T11:00:00.000Z"),
    });

    const content = await readFile(join(cwd, ".aiactions", "lock.yaml"), "utf8");
    expect(content).toContain("4444444444444444444444444444444444444444");
    expect(content).not.toContain("3333333333333333333333333333333333333333");
  });
});
