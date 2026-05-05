import { mkdir } from "node:fs/promises";
import { join } from "node:path";

import { afterEach, beforeEach, expect, test, vi } from "vite-plus/test";

import { listCommand } from "../src/commands/action/list.ts";
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

test("empty cache → stderr note, no stdout, exit 0", async () => {
  const stdoutChunks: string[] = [];
  const stderrChunks: string[] = [];
  const stdoutSpy = vi.spyOn(process.stdout, "write").mockImplementation((c) => {
    stdoutChunks.push(String(c));
    return true;
  });
  const stderrSpy = vi.spyOn(process.stderr, "write").mockImplementation((c) => {
    stderrChunks.push(String(c));
    return true;
  });

  try {
    await listCommand.run!({
      args: { json: false } as never,
      cmd: listCommand,
      data: undefined,
      rawArgs: [],
    });
  } finally {
    stdoutSpy.mockRestore();
    stderrSpy.mockRestore();
  }

  expect(stdoutChunks.join("")).toBe("");
  expect(stderrChunks.join("")).toContain("no cached actions");
});

test("populated cache → table on stdout with header + rows", async () => {
  await mkdir(join(env.registryRoot, "claude", "agent", "v1"), { recursive: true });
  await mkdir(join(env.registryRoot, "openai", "review", "v2"), { recursive: true });

  const stdoutChunks: string[] = [];
  const stdoutSpy = vi.spyOn(process.stdout, "write").mockImplementation((c) => {
    stdoutChunks.push(String(c));
    return true;
  });

  try {
    await listCommand.run!({
      args: { json: false } as never,
      cmd: listCommand,
      data: undefined,
      rawArgs: [],
    });
  } finally {
    stdoutSpy.mockRestore();
  }

  const out = stdoutChunks.join("");
  expect(out).toContain("NAMESPACE");
  expect(out).toContain("NAME");
  expect(out).toContain("VERSION");
  expect(out).toContain("PATH");
  expect(out).toContain("claude");
  expect(out).toContain("agent");
  expect(out).toContain("v1");
  expect(out).toContain("openai");
  expect(out).toContain("review");
  expect(out).toContain("v2");
});

test("--json on populated cache → JSON array of entries", async () => {
  await mkdir(join(env.registryRoot, "claude", "agent", "v1"), { recursive: true });

  const stdoutChunks: string[] = [];
  const stdoutSpy = vi.spyOn(process.stdout, "write").mockImplementation((c) => {
    stdoutChunks.push(String(c));
    return true;
  });

  try {
    await listCommand.run!({
      args: { json: true } as never,
      cmd: listCommand,
      data: undefined,
      rawArgs: [],
    });
  } finally {
    stdoutSpy.mockRestore();
  }

  const out = JSON.parse(stdoutChunks.join(""));
  expect(out).toEqual([
    {
      namespace: "claude",
      name: "agent",
      version: "v1",
      dir: join(env.registryRoot, "claude", "agent", "v1"),
    },
  ]);
});

test("--json on empty cache → JSON empty array", async () => {
  const stdoutChunks: string[] = [];
  const stdoutSpy = vi.spyOn(process.stdout, "write").mockImplementation((c) => {
    stdoutChunks.push(String(c));
    return true;
  });

  try {
    await listCommand.run!({
      args: { json: true } as never,
      cmd: listCommand,
      data: undefined,
      rawArgs: [],
    });
  } finally {
    stdoutSpy.mockRestore();
  }

  expect(JSON.parse(stdoutChunks.join(""))).toEqual([]);
});
