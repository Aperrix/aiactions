import { afterEach, beforeEach, describe, expect, test } from "vite-plus/test";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { readLockfile, upsertLockfileEntry, writeLockfile } from "../src/lockfile.ts";

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
    expect(lock).toEqual({ version: 1, actions: {} });
  });

  test("returns empty struct on parsed value with wrong version", async () => {
    const { mkdir, writeFile } = await import("node:fs/promises");
    await mkdir(join(cwd, ".aiactions"), { recursive: true });
    await writeFile(
      join(cwd, ".aiactions", "lock.json"),
      JSON.stringify({ version: 0, actions: {} }),
      "utf8",
    );
    const lock = await readLockfile(cwd);
    expect(lock).toEqual({ version: 1, actions: {} });
  });

  test("returns empty struct on malformed JSON", async () => {
    const { mkdir, writeFile } = await import("node:fs/promises");
    await mkdir(join(cwd, ".aiactions"), { recursive: true });
    await writeFile(join(cwd, ".aiactions", "lock.json"), "{ this is not valid json", "utf8");
    const lock = await readLockfile(cwd);
    expect(lock).toEqual({ version: 1, actions: {} });
  });

  test("returns empty struct on git merge conflict markers", async () => {
    const { mkdir, writeFile } = await import("node:fs/promises");
    await mkdir(join(cwd, ".aiactions"), { recursive: true });
    await writeFile(
      join(cwd, ".aiactions", "lock.json"),
      [
        "<<<<<<< HEAD",
        '{ "version": 1, "actions": { "a/b@1.0.0": { "resolvedSha": "aaa" } } }',
        "=======",
        '{ "version": 1, "actions": { "a/b@1.0.0": { "resolvedSha": "bbb" } } }',
        ">>>>>>> branch",
      ].join("\n"),
      "utf8",
    );
    const lock = await readLockfile(cwd);
    expect(lock).toEqual({ version: 1, actions: {} });
  });

  test("returns empty struct when entry is missing required resolvedSha", async () => {
    const { mkdir, writeFile } = await import("node:fs/promises");
    await mkdir(join(cwd, ".aiactions"), { recursive: true });
    await writeFile(
      join(cwd, ".aiactions", "lock.json"),
      JSON.stringify({ version: 1, actions: { "a/b@1.0.0": {} } }),
      "utf8",
    );
    const lock = await readLockfile(cwd);
    expect(lock).toEqual({ version: 1, actions: {} });
  });

  test("returns empty struct when entry contains an unknown extra field (.strict)", async () => {
    const { mkdir, writeFile } = await import("node:fs/promises");
    await mkdir(join(cwd, ".aiactions"), { recursive: true });
    await writeFile(
      join(cwd, ".aiactions", "lock.json"),
      JSON.stringify({
        version: 1,
        actions: { "a/b@1.0.0": { resolvedSha: "abc", extra: "nope" } },
      }),
      "utf8",
    );
    const lock = await readLockfile(cwd);
    expect(lock).toEqual({ version: 1, actions: {} });
  });

  test("returns the parsed value when content is valid v1", async () => {
    const { mkdir, writeFile } = await import("node:fs/promises");
    await mkdir(join(cwd, ".aiactions"), { recursive: true });
    await writeFile(
      join(cwd, ".aiactions", "lock.json"),
      JSON.stringify({
        version: 1,
        actions: { "claude/agent@1.0.0": { resolvedSha: "deadbeef" } },
      }),
      "utf8",
    );
    const lock = await readLockfile(cwd);
    expect(lock).toEqual({
      version: 1,
      actions: { "claude/agent@1.0.0": { resolvedSha: "deadbeef" } },
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
      version: 1,
      actions: { "claude/agent@1.0.0": { resolvedSha: "abc" } },
    });
    const raw = await readFile(join(cwd, ".aiactions", "lock.json"), "utf8");
    expect(raw.endsWith("\n")).toBe(true);
    expect(raw).toBe(
      [
        "{",
        '  "version": 1,',
        '  "actions": {',
        '    "claude/agent@1.0.0": {',
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
      version: 1,
      actions: {
        "z/last@1.0.0": { resolvedSha: "z" },
        "a/first@1.0.0": { resolvedSha: "a" },
        "m/middle@1.0.0": { resolvedSha: "m" },
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
    await writeLockfile(cwd, { version: 1, actions: {} });
    const dirStat = await stat(join(cwd, ".aiactions"));
    expect(dirStat.isDirectory()).toBe(true);
  });

  test("write → read → identical struct", async () => {
    const lock = {
      version: 1 as const,
      actions: {
        "a/x@1.0.0": { resolvedSha: "111" },
        "b/y@2.0.0": { resolvedSha: "222" },
      },
    };
    await writeLockfile(cwd, lock);
    const roundtrip = await readLockfile(cwd);
    expect(roundtrip).toEqual(lock);
  });

  test("write same lockfile twice is byte-identical", async () => {
    const { readFile } = await import("node:fs/promises");
    const lock = {
      version: 1 as const,
      actions: {
        "z/last@1.0.0": { resolvedSha: "z" },
        "a/first@1.0.0": { resolvedSha: "a" },
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
      resolvedSha: "abc",
    });
    const lock = await readLockfile(cwd);
    expect(lock).toEqual({
      version: 1,
      actions: { "claude/agent@1.0.0": { resolvedSha: "abc" } },
    });
  });

  test("calling twice with the same ref overwrites (last write wins)", async () => {
    const ref = { namespace: "claude", name: "agent", version: "1.0.0" } as const;
    await upsertLockfileEntry({ cwd, ref, resolvedSha: "old" });
    await upsertLockfileEntry({ cwd, ref, resolvedSha: "new" });
    const lock = await readLockfile(cwd);
    expect(lock.actions).toEqual({
      "claude/agent@1.0.0": { resolvedSha: "new" },
    });
  });

  test("preserves other entries when adding a new ref", async () => {
    await upsertLockfileEntry({
      cwd,
      ref: { namespace: "a", name: "first", version: "1.0.0" },
      resolvedSha: "111",
    });
    await upsertLockfileEntry({
      cwd,
      ref: { namespace: "b", name: "second", version: "2.0.0" },
      resolvedSha: "222",
    });
    const lock = await readLockfile(cwd);
    expect(lock.actions).toEqual({
      "a/first@1.0.0": { resolvedSha: "111" },
      "b/second@2.0.0": { resolvedSha: "222" },
    });
  });
});
