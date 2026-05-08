import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";

import { afterEach, beforeEach, expect, test } from "vite-plus/test";

import { runCli } from "./fixtures/run-cli.ts";
import { makeTempHome, type TempHome } from "./fixtures/with-temp-home.ts";

const VALID_MANIFEST = `schemaVersion: 1
name: smoke
description: Smoke fixture.
runs:
  using: node
  main: ./index.mjs
`;

const INVALID_MANIFEST = `schemaVersion: 2
name: Bad Name
description: Broken.
runs:
  using: node
  main: index.js
`;

let env: TempHome;

beforeEach(async () => {
  env = await makeTempHome();
});

afterEach(async () => {
  await env.cleanup();
});

test("aia action check (no args) exits USAGE", async () => {
  const result = await runCli(["action", "check"], { HOME: env.home });
  expect(result.exitCode).toBe(2);
  expect(result.stderr).toMatch(/path|--all/i);
});

test("aia action check <path> --all is rejected as USAGE", async () => {
  const p = join(env.home, "aiaction.yaml");
  await writeFile(p, VALID_MANIFEST);
  const result = await runCli(["action", "check", p, "--all"], { HOME: env.home });
  expect(result.exitCode).toBe(2);
  expect(result.stderr).toMatch(/mutually exclusive|exactly one of/i);
});

test("aia action check <valid> --json reports ok=true", async () => {
  const p = join(env.home, "aiaction.yaml");
  await writeFile(p, VALID_MANIFEST);
  const result = await runCli(["action", "check", p, "--json"], { HOME: env.home });
  expect(result.exitCode).toBe(0);
  const out = JSON.parse(result.stdout) as {
    ok: boolean;
    files: Array<{ path: string; ok: boolean; errors: unknown[]; warnings: unknown[] }>;
  };
  expect(out.ok).toBe(true);
  expect(out.files).toHaveLength(1);
  expect(out.files[0]?.ok).toBe(true);
  expect(out.files[0]?.errors).toEqual([]);
  expect(out.files[0]?.warnings).toEqual([]);
});

test("aia action check <invalid> --json reports ok=false with errors[]", async () => {
  const p = join(env.home, "aiaction.yaml");
  await writeFile(p, INVALID_MANIFEST);
  const result = await runCli(["action", "check", p, "--json"], { HOME: env.home });
  expect(result.exitCode).toBe(7);
  const out = JSON.parse(result.stdout) as {
    ok: boolean;
    files: Array<{
      ok: boolean;
      errors: Array<{ zodPath: string; message: string }>;
      warnings: unknown[];
    }>;
  };
  expect(out.ok).toBe(false);
  expect(out.files[0]?.ok).toBe(false);
  expect(out.files[0]?.errors.length).toBeGreaterThanOrEqual(2);
  const paths = out.files[0]!.errors.map((e) => e.zodPath);
  expect(paths).toContain("schemaVersion");
});

test("aia action check --all walks cwd, ok across mixed fixtures", async () => {
  const root = env.home;
  await mkdir(join(root, "actions/a"), { recursive: true });
  await mkdir(join(root, "actions/b"), { recursive: true });
  await writeFile(join(root, "actions/a/aiaction.yaml"), VALID_MANIFEST);
  await writeFile(join(root, "actions/b/aiaction.yaml"), INVALID_MANIFEST);

  const result = await runCli(
    ["action", "check", "--all", "--json"],
    { HOME: env.home },
    {
      cwd: root,
    },
  );
  expect(result.exitCode).toBe(7);
  const out = JSON.parse(result.stdout) as {
    ok: boolean;
    files: Array<{ path: string; ok: boolean }>;
  };
  expect(out.ok).toBe(false);
  expect(out.files).toHaveLength(2);
  expect(out.files.filter((f) => f.ok)).toHaveLength(1);
  expect(out.files.filter((f) => !f.ok)).toHaveLength(1);
});

test("aia action check --all returns NOT_FOUND when cwd has no manifests", async () => {
  const result = await runCli(
    ["action", "check", "--all"],
    { HOME: env.home },
    {
      cwd: env.home,
    },
  );
  expect(result.exitCode).toBe(4);
  expect(result.stderr).toMatch(/no aiaction\.yaml found/i);
});

test("aia action check skips node_modules and .git when walking", async () => {
  const root = env.home;
  await mkdir(join(root, "node_modules/foo"), { recursive: true });
  await mkdir(join(root, ".git/objects"), { recursive: true });
  await mkdir(join(root, "actions/a"), { recursive: true });
  await writeFile(join(root, "node_modules/foo/aiaction.yaml"), VALID_MANIFEST);
  await writeFile(join(root, ".git/objects/aiaction.yaml"), VALID_MANIFEST);
  await writeFile(join(root, "actions/a/aiaction.yaml"), VALID_MANIFEST);

  const result = await runCli(
    ["action", "check", "--all", "--json"],
    { HOME: env.home },
    {
      cwd: root,
    },
  );
  expect(result.exitCode).toBe(0);
  const out = JSON.parse(result.stdout) as {
    files: Array<{ path: string }>;
  };
  expect(out.files).toHaveLength(1);
  expect(out.files[0]?.path).toMatch(/actions\/a\/aiaction\.yaml$/);
});
