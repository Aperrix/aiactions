import { afterEach, beforeEach, describe, expect, test } from "vite-plus/test";
import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { readLockfile, upsertLockfileEntry, writeLockfile } from "../src/lockfile.ts";
import { LockfileVersionMismatch } from "../src/types/errors.ts";

describe("readLockfile", () => {
  let cwd: string;

  beforeEach(async () => {
    cwd = await mkdtemp(join(tmpdir(), "aia-lock-"));
  });

  afterEach(async () => {
    await rm(cwd, { recursive: true, force: true });
  });

  test("returns empty struct when lockfile is missing (ENOENT)", async () => {
    const lock = await readLockfile(cwd);
    expect(lock).toEqual({ version: 2, actions: {} });
  });

  test("throws LockfileVersionMismatch on a v1 file", async () => {
    await mkdir(join(cwd, ".aiactions"), { recursive: true });
    await writeFile(
      join(cwd, ".aiactions", "lock.json"),
      JSON.stringify({ version: 1, actions: {} }),
      "utf8",
    );
    await expect(readLockfile(cwd)).rejects.toThrow(LockfileVersionMismatch);
    await expect(readLockfile(cwd)).rejects.toThrow(/schema v1, expected v2/u);
  });

  test("returns empty struct on malformed JSON", async () => {
    await mkdir(join(cwd, ".aiactions"), { recursive: true });
    await writeFile(join(cwd, ".aiactions", "lock.json"), "{ this is not valid json", "utf8");
    const lock = await readLockfile(cwd);
    expect(lock).toEqual({ version: 2, actions: {} });
  });

  test("returns empty struct on git merge conflict markers", async () => {
    await mkdir(join(cwd, ".aiactions"), { recursive: true });
    await writeFile(
      join(cwd, ".aiactions", "lock.json"),
      [
        "<<<<<<< HEAD",
        '{ "version": 2, "actions": { "a/b@1.0.0": { "resolvedVersion": "1.0.0", "resolvedSha": "aaa" } } }',
        "=======",
        '{ "version": 2, "actions": { "a/b@1.0.0": { "resolvedVersion": "1.0.0", "resolvedSha": "bbb" } } }',
        ">>>>>>> branch",
      ].join("\n"),
      "utf8",
    );
    const lock = await readLockfile(cwd);
    expect(lock).toEqual({ version: 2, actions: {} });
  });

  test("returns empty struct when entry is missing required resolvedSha", async () => {
    await mkdir(join(cwd, ".aiactions"), { recursive: true });
    await writeFile(
      join(cwd, ".aiactions", "lock.json"),
      JSON.stringify({ version: 2, actions: { "a/b@1.0.0": { resolvedVersion: "1.0.0" } } }),
      "utf8",
    );
    const lock = await readLockfile(cwd);
    expect(lock).toEqual({ version: 2, actions: {} });
  });

  test("returns empty struct when entry contains an unknown extra field (.strict)", async () => {
    await mkdir(join(cwd, ".aiactions"), { recursive: true });
    await writeFile(
      join(cwd, ".aiactions", "lock.json"),
      JSON.stringify({
        version: 2,
        actions: {
          "a/b@1.0.0": { resolvedVersion: "1.0.0", resolvedSha: "abc", extra: "nope" },
        },
      }),
      "utf8",
    );
    const lock = await readLockfile(cwd);
    expect(lock).toEqual({ version: 2, actions: {} });
  });

  test("returns the parsed value when content is valid v2", async () => {
    await mkdir(join(cwd, ".aiactions"), { recursive: true });
    await writeFile(
      join(cwd, ".aiactions", "lock.json"),
      JSON.stringify({
        version: 2,
        actions: {
          "claude/agent@1.0.0": { resolvedVersion: "1.0.0", resolvedSha: "deadbeef" },
        },
      }),
      "utf8",
    );
    const lock = await readLockfile(cwd);
    expect(lock).toEqual({
      version: 2,
      actions: { "claude/agent@1.0.0": { resolvedVersion: "1.0.0", resolvedSha: "deadbeef" } },
    });
  });
});

describe("writeLockfile", () => {
  let cwd: string;

  beforeEach(async () => {
    cwd = await mkdtemp(join(tmpdir(), "aia-lock-"));
  });

  afterEach(async () => {
    await rm(cwd, { recursive: true, force: true });
  });

  test("writes JSON with 2-space indent and trailing newline", async () => {
    const { readFile } = await import("node:fs/promises");
    await writeLockfile(cwd, {
      version: 2,
      actions: { "claude/agent@1.0.0": { resolvedVersion: "1.0.0", resolvedSha: "abc" } },
    });
    const raw = await readFile(join(cwd, ".aiactions", "lock.json"), "utf8");
    expect(raw.endsWith("\n")).toBe(true);
    expect(raw).toBe(
      [
        "{",
        '  "version": 2,',
        '  "actions": {',
        '    "claude/agent@1.0.0": {',
        '      "resolvedVersion": "1.0.0",',
        '      "resolvedSha": "abc"',
        "    }",
        "  }",
        "}",
        "",
      ].join("\n"),
    );
  });

  test("sorts actions alphabetically for deterministic output", async () => {
    const { readFile } = await import("node:fs/promises");
    await writeLockfile(cwd, {
      version: 2,
      actions: {
        "z/last@1.0.0": { resolvedVersion: "1.0.0", resolvedSha: "z" },
        "a/first@1.0.0": { resolvedVersion: "1.0.0", resolvedSha: "a" },
        "m/middle@1.0.0": { resolvedVersion: "1.0.0", resolvedSha: "m" },
      },
    });
    const raw = await readFile(join(cwd, ".aiactions", "lock.json"), "utf8");
    const aIdx = raw.indexOf("a/first");
    const mIdx = raw.indexOf("m/middle");
    const zIdx = raw.indexOf("z/last");
    expect(aIdx).toBeLessThan(mIdx);
    expect(mIdx).toBeLessThan(zIdx);
  });

  test("creates the .aiactions/ directory if missing", async () => {
    const { stat } = await import("node:fs/promises");
    await writeLockfile(cwd, { version: 2, actions: {} });
    const dirStat = await stat(join(cwd, ".aiactions"));
    expect(dirStat.isDirectory()).toBe(true);
  });

  test("write → read → identical struct", async () => {
    const lock = {
      version: 2 as const,
      actions: {
        "a/x@1.0.0": { resolvedVersion: "1.0.0", resolvedSha: "111" },
        "b/y@2.0.0": { resolvedVersion: "2.0.0", resolvedSha: "222" },
      },
    };
    await writeLockfile(cwd, lock);
    const roundtrip = await readLockfile(cwd);
    expect(roundtrip).toEqual(lock);
  });

  test("write same lockfile twice is byte-identical", async () => {
    const { readFile } = await import("node:fs/promises");
    const lock = {
      version: 2 as const,
      actions: {
        "z/last@1.0.0": { resolvedVersion: "1.0.0", resolvedSha: "z" },
        "a/first@1.0.0": { resolvedVersion: "1.0.0", resolvedSha: "a" },
      },
    };
    await writeLockfile(cwd, lock);
    const first = await readFile(join(cwd, ".aiactions", "lock.json"), "utf8");
    await writeLockfile(cwd, lock);
    const second = await readFile(join(cwd, ".aiactions", "lock.json"), "utf8");
    expect(second).toBe(first);
  });
});

describe("upsertLockfileEntry", () => {
  let cwd: string;

  beforeEach(async () => {
    cwd = await mkdtemp(join(tmpdir(), "aia-lock-"));
  });

  afterEach(async () => {
    await rm(cwd, { recursive: true, force: true });
  });

  test("creates the lockfile and entry when both are missing", async () => {
    await upsertLockfileEntry({
      cwd,
      ref: { namespace: "claude", name: "agent", version: "1.0.0" },
      resolvedVersion: "1.0.0",
      resolvedSha: "abc",
    });
    const lock = await readLockfile(cwd);
    expect(lock).toEqual({
      version: 2,
      actions: { "claude/agent@1.0.0": { resolvedVersion: "1.0.0", resolvedSha: "abc" } },
    });
  });

  test("calling twice with the same ref overwrites (last write wins)", async () => {
    const ref = { namespace: "claude", name: "agent", version: "1.0.0" } as const;
    await upsertLockfileEntry({ cwd, ref, resolvedVersion: "1.0.0", resolvedSha: "old" });
    await upsertLockfileEntry({ cwd, ref, resolvedVersion: "1.0.0", resolvedSha: "new" });
    const lock = await readLockfile(cwd);
    expect(lock.actions).toEqual({
      "claude/agent@1.0.0": { resolvedVersion: "1.0.0", resolvedSha: "new" },
    });
  });

  test("preserves other entries when adding a new ref", async () => {
    await upsertLockfileEntry({
      cwd,
      ref: { namespace: "a", name: "first", version: "1.0.0" },
      resolvedVersion: "1.0.0",
      resolvedSha: "111",
    });
    await upsertLockfileEntry({
      cwd,
      ref: { namespace: "b", name: "second", version: "2.0.0" },
      resolvedVersion: "2.0.0",
      resolvedSha: "222",
    });
    const lock = await readLockfile(cwd);
    expect(lock.actions).toEqual({
      "a/first@1.0.0": { resolvedVersion: "1.0.0", resolvedSha: "111" },
      "b/second@2.0.0": { resolvedVersion: "2.0.0", resolvedSha: "222" },
    });
  });

  test("v2 lockfile round-trips with resolvedVersion", async () => {
    await upsertLockfileEntry({
      cwd,
      ref: { namespace: "claude", name: "agent", version: "1" },
      resolvedVersion: "1.0.0",
      resolvedSha: "abc123",
    });
    const lock = await readLockfile(cwd);
    expect(lock).toEqual({
      version: 2,
      actions: { "claude/agent@1": { resolvedVersion: "1.0.0", resolvedSha: "abc123" } },
    });
  });
});
