import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";

import { afterEach, beforeEach, expect, test } from "vite-plus/test";

import { walkCache } from "../src/lib/walk-cache.ts";
import { makeTempHome, type TempHome } from "./fixtures/with-temp-home.ts";

let env: TempHome;

beforeEach(async () => {
  env = await makeTempHome();
});

afterEach(async () => {
  await env.cleanup();
});

test("returns empty array when registry root is missing", async () => {
  const entries = await walkCache(env.registryRoot);
  expect(entries).toEqual([]);
});

test("returns empty array when registry root exists but is empty", async () => {
  await mkdir(env.registryRoot, { recursive: true });
  const entries = await walkCache(env.registryRoot);
  expect(entries).toEqual([]);
});

test("enumerates all <ns>/<name>/<ver> entries", async () => {
  await mkdir(join(env.registryRoot, "claude", "agent", "v1"), { recursive: true });
  await mkdir(join(env.registryRoot, "claude", "agent", "v2"), { recursive: true });
  await mkdir(join(env.registryRoot, "openai", "review", "v1"), { recursive: true });

  const entries = await walkCache(env.registryRoot);
  expect(entries).toHaveLength(3);
  expect(entries).toContainEqual({
    namespace: "claude",
    name: "agent",
    version: "v1",
    dir: join(env.registryRoot, "claude", "agent", "v1"),
  });
  expect(entries).toContainEqual({
    namespace: "claude",
    name: "agent",
    version: "v2",
    dir: join(env.registryRoot, "claude", "agent", "v2"),
  });
  expect(entries).toContainEqual({
    namespace: "openai",
    name: "review",
    version: "v1",
    dir: join(env.registryRoot, "openai", "review", "v1"),
  });
});

test("ignores files at any level (only directories count)", async () => {
  await mkdir(join(env.registryRoot, "claude", "agent", "v1"), { recursive: true });
  await writeFile(join(env.registryRoot, "claude", "agent", "stray.txt"), "");

  const entries = await walkCache(env.registryRoot);
  expect(entries).toHaveLength(1);
  expect(entries[0]?.version).toBe("v1");
});
