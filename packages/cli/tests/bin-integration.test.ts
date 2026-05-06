import { readdir } from "node:fs/promises";
import { join } from "node:path";

import { afterEach, beforeEach, expect, test } from "vite-plus/test";

import { makeBareRepoWithAction } from "./fixtures/make-bare-repo.ts";
import { runCli } from "./fixtures/run-cli.ts";
import { makeTempHome, type TempHome } from "./fixtures/with-temp-home.ts";

let env: TempHome;

beforeEach(async () => {
  env = await makeTempHome();
});

afterEach(async () => {
  await env.cleanup();
});

test("aia --version prints the package version", async () => {
  const result = await runCli(["--version"]);
  expect(result.exitCode).toBe(0);
  expect(result.stdout.trim()).toBe("0.0.0");
});

test("aia --help prints USAGE block", async () => {
  const result = await runCli(["--help"]);
  expect(result.exitCode).toBe(0);
  expect(result.stdout).toContain("USAGE");
  expect(result.stdout).toContain("aia");
});

test("aia action install end-to-end populates the cache", async () => {
  const bareRepo = await makeBareRepoWithAction({
    cwd: env.home,
    namespace: "test",
    name: "smoke",
    tag: "test/smoke@v1.0.0",
    manifest: "name: smoke\ndescription: x\nruns:\n  using: node\n  main: index.mjs\n",
    sources: { "index.mjs": "export default async () => {};\n" },
  });

  const result = await runCli(["action", "install", "test/smoke@1.0.0", "--json"], {
    HOME: env.home,
    AIACTIONS_CANONICAL_URL: `file://${bareRepo}`,
  });

  expect(result.exitCode).toBe(0);
  const out = JSON.parse(result.stdout) as {
    ref: string;
    fetched: boolean;
    dir: string;
    resolvedSha: string | null;
  };
  expect(out.ref).toBe("test/smoke@1.0.0");
  expect(out.fetched).toBe(true);

  const versions = await readdir(join(env.registryRoot, "test", "smoke"));
  expect(versions).toEqual(["1.0.0"]);
});

test("aia action list end-to-end on populated cache", async () => {
  const bareRepo = await makeBareRepoWithAction({
    cwd: env.home,
    namespace: "test",
    name: "smoke",
    tag: "test/smoke@v1.0.0",
    manifest: "name: smoke\ndescription: x\nruns:\n  using: node\n  main: index.mjs\n",
    sources: { "index.mjs": "export default async () => {};\n" },
  });

  await runCli(["action", "install", "test/smoke@1.0.0", "--json"], {
    HOME: env.home,
    AIACTIONS_CANONICAL_URL: `file://${bareRepo}`,
  });

  const result = await runCli(["action", "list", "--json"], { HOME: env.home });
  expect(result.exitCode).toBe(0);
  const out = JSON.parse(result.stdout) as Array<{
    namespace: string;
    name: string;
    version: string;
    dir: string;
  }>;
  expect(out).toHaveLength(1);
  expect(out[0]).toMatchObject({
    namespace: "test",
    name: "smoke",
    version: "1.0.0",
  });
});

test("aia action uninstall end-to-end with --yes", async () => {
  const bareRepo = await makeBareRepoWithAction({
    cwd: env.home,
    namespace: "test",
    name: "smoke",
    tag: "test/smoke@v1.0.0",
    manifest: "name: smoke\ndescription: x\nruns:\n  using: node\n  main: index.mjs\n",
    sources: { "index.mjs": "export default async () => {};\n" },
  });

  await runCli(["action", "install", "test/smoke@1.0.0", "--json"], {
    HOME: env.home,
    AIACTIONS_CANONICAL_URL: `file://${bareRepo}`,
  });

  const result = await runCli(["action", "uninstall", "test/smoke@1.0.0", "--yes", "--json"], {
    HOME: env.home,
  });
  expect(result.exitCode).toBe(0);
  const out = JSON.parse(result.stdout) as {
    removed: Array<{ ref: string; dir: string }>;
    skipped: unknown[];
  };
  expect(out.removed).toHaveLength(1);
  expect(out.removed[0]?.ref).toBe("test/smoke@1.0.0");

  const listResult = await runCli(["action", "list", "--json"], { HOME: env.home });
  expect(JSON.parse(listResult.stdout)).toEqual([]);
});
