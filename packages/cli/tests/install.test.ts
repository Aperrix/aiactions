import { mkdir, readdir } from "node:fs/promises";
import { join } from "node:path";

import { afterEach, beforeEach, expect, test, vi } from "vite-plus/test";

import { installCommand } from "../src/commands/action/install.ts";
import { UsageError } from "../src/lib/errors.ts";
import { makeBareRepoWithAction } from "./fixtures/make-bare-repo.ts";
import { makeTempHome, type TempHome } from "./fixtures/with-temp-home.ts";

let env: TempHome;
let originalCwd: string;

beforeEach(async () => {
  env = await makeTempHome();
  process.env.HOME = env.home;
  Object.defineProperty(process.stdout, "isTTY", { value: false, configurable: true });
  // Switch cwd into the temp home so ensureCachedAction's lockfile write
  // (`<cwd>/.aiactions/lock.yaml`) lands in the disposable area instead of
  // polluting the package source tree.
  originalCwd = process.cwd();
  const { mkdir } = await import("node:fs/promises");
  await mkdir(env.home, { recursive: true });
  process.chdir(env.home);
});

afterEach(async () => {
  process.chdir(originalCwd);
  await env.cleanup();
  delete process.env.AIACTIONS_CANONICAL_URL;
});

test("rejects malformed ref with UsageError", async () => {
  await expect(
    installCommand.run!({
      args: { ref: "garbage", json: false } as never,
      cmd: installCommand,
      data: undefined,
      rawArgs: [],
    }),
  ).rejects.toThrow(UsageError);
});

test("rejects local ref with UsageError", async () => {
  await expect(
    installCommand.run!({
      args: { ref: "./local", json: false } as never,
      cmd: installCommand,
      data: undefined,
      rawArgs: [],
    }),
  ).rejects.toThrow(/install only supports registry refs/u);
});

test("end-to-end: cache miss → fetch from bare repo → cache populated", async () => {
  const bareRepo = await makeBareRepoWithAction({
    cwd: env.home,
    namespace: "test",
    name: "noop",
    tag: "test/noop@v1.0.0",
    manifest: "name: noop\ndescription: x\nruns:\n  using: node\n  main: index.mjs\n",
    sources: { "index.mjs": "export default async () => {};\n" },
  });

  process.env.AIACTIONS_CANONICAL_URL = `file://${bareRepo}`;

  const stdoutChunks: string[] = [];
  const stdoutSpy = vi.spyOn(process.stdout, "write").mockImplementation((c) => {
    stdoutChunks.push(String(c));
    return true;
  });

  try {
    await installCommand.run!({
      args: { ref: "test/noop@1.0.0", json: true } as never,
      cmd: installCommand,
      data: undefined,
      rawArgs: [],
    });
  } finally {
    stdoutSpy.mockRestore();
  }

  const out = JSON.parse(stdoutChunks.join(""));
  expect(out.ref).toBe("test/noop@1.0.0");
  expect(out.fetched).toBe(true);
  expect(out.dir).toBe(join(env.registryRoot, "test", "noop", "1.0.0"));
  expect(typeof out.resolvedSha).toBe("string");

  const versions = await readdir(join(env.registryRoot, "test", "noop"));
  expect(versions).toEqual(["1.0.0"]);
});

test("cache hit short-circuits — fetched: false", async () => {
  const dir = join(env.registryRoot, "test", "preinstalled", "1.0.0");
  await mkdir(dir, { recursive: true });

  const stdoutChunks: string[] = [];
  const stdoutSpy = vi.spyOn(process.stdout, "write").mockImplementation((c) => {
    stdoutChunks.push(String(c));
    return true;
  });

  try {
    await installCommand.run!({
      args: { ref: "test/preinstalled@1.0.0", json: true } as never,
      cmd: installCommand,
      data: undefined,
      rawArgs: [],
    });
  } finally {
    stdoutSpy.mockRestore();
  }

  const out = JSON.parse(stdoutChunks.join(""));
  expect(out.fetched).toBe(false);
  expect(out.resolvedSha).toBeNull();
});
