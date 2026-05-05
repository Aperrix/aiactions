import { mkdir, stat } from "node:fs/promises";
import { join } from "node:path";

import { afterEach, beforeEach, expect, test, vi } from "vite-plus/test";

import { uninstallCommand } from "../src/commands/action/uninstall.ts";
import { NotFoundError, UsageError } from "../src/lib/errors.ts";
import { makeTempHome, type TempHome } from "./fixtures/with-temp-home.ts";

let env: TempHome;

beforeEach(async () => {
  env = await makeTempHome();
  process.env.HOME = env.home;
  Object.defineProperty(process.stdout, "isTTY", { value: false, configurable: true });
});

afterEach(async () => {
  await env.cleanup();
});

async function pre(ns: string, name: string, ver: string): Promise<string> {
  const dir = join(env.registryRoot, ns, name, ver);
  await mkdir(dir, { recursive: true });
  return dir;
}

async function exists(p: string): Promise<boolean> {
  try {
    await stat(p);
    return true;
  } catch {
    return false;
  }
}

test("ref + --yes → removes entry and prunes empty parents", async () => {
  await pre("claude", "agent", "v1");
  await uninstallCommand.run!({
    args: { ref: "claude/agent@v1", yes: true, json: false } as never,
    cmd: uninstallCommand,
    data: undefined,
    rawArgs: [],
  });
  expect(await exists(join(env.registryRoot, "claude", "agent", "v1"))).toBe(false);
  expect(await exists(join(env.registryRoot, "claude", "agent"))).toBe(false);
  expect(await exists(join(env.registryRoot, "claude"))).toBe(false);
});

test("ref + --yes preserves sibling versions", async () => {
  await pre("claude", "agent", "v1");
  await pre("claude", "agent", "v2");
  await uninstallCommand.run!({
    args: { ref: "claude/agent@v1", yes: true, json: false } as never,
    cmd: uninstallCommand,
    data: undefined,
    rawArgs: [],
  });
  expect(await exists(join(env.registryRoot, "claude", "agent", "v1"))).toBe(false);
  expect(await exists(join(env.registryRoot, "claude", "agent", "v2"))).toBe(true);
});

test("ref absent → NotFoundError", async () => {
  await expect(
    uninstallCommand.run!({
      args: { ref: "ghost/missing@v1", yes: true, json: false } as never,
      cmd: uninstallCommand,
      data: undefined,
      rawArgs: [],
    }),
  ).rejects.toThrow(NotFoundError);
});

test("malformed ref → UsageError", async () => {
  await expect(
    uninstallCommand.run!({
      args: { ref: "garbage", yes: true, json: false } as never,
      cmd: uninstallCommand,
      data: undefined,
      rawArgs: [],
    }),
  ).rejects.toThrow(UsageError);
});

test("no-arg + non-TTY → UsageError (refuse destructive op)", async () => {
  await pre("claude", "agent", "v1");
  await expect(
    uninstallCommand.run!({
      args: { ref: "", yes: false, json: false } as never,
      cmd: uninstallCommand,
      data: undefined,
      rawArgs: [],
    }),
  ).rejects.toThrow(UsageError);
});

test("ref + non-TTY + no --yes → UsageError", async () => {
  await pre("claude", "agent", "v1");
  await expect(
    uninstallCommand.run!({
      args: { ref: "claude/agent@v1", yes: false, json: false } as never,
      cmd: uninstallCommand,
      data: undefined,
      rawArgs: [],
    }),
  ).rejects.toThrow(/refusing destructive op/u);
});

test("--json without ref → UsageError", async () => {
  await expect(
    uninstallCommand.run!({
      args: { ref: "", yes: true, json: true } as never,
      cmd: uninstallCommand,
      data: undefined,
      rawArgs: [],
    }),
  ).rejects.toThrow(UsageError);
});

test("ref + --yes + --json → emits JSON receipt", async () => {
  const dir = await pre("claude", "agent", "v1");
  const stdoutChunks: string[] = [];
  const stdoutSpy = vi.spyOn(process.stdout, "write").mockImplementation((c) => {
    stdoutChunks.push(String(c));
    return true;
  });
  try {
    await uninstallCommand.run!({
      args: { ref: "claude/agent@v1", yes: true, json: true } as never,
      cmd: uninstallCommand,
      data: undefined,
      rawArgs: [],
    });
  } finally {
    stdoutSpy.mockRestore();
  }
  const out = JSON.parse(stdoutChunks.join(""));
  expect(out).toEqual({
    removed: [{ ref: "claude/agent@v1", dir }],
    skipped: [],
  });
});

// TODO(MS1.5): no-arg + TTY multiselect path is intentionally unmocked here.
// `vi.doMock` + dynamic re-import does not survive Vitest's static module
// cache, and a hoisted `vi.mock` would force every test in this file
// through the same fake clack. The interactive picker is small and exercised
// by the bin-integration suite when run interactively in real terminals;
// future work can introduce a prompts adapter (DI seam) that makes this
// path unit-testable without breaking the other tests in this file.
test.skip("no-arg + TTY + mocked multiselect → batch removal (deferred)", () => {
  expect(true).toBe(true);
});
