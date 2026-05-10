import { mkdtemp, readdir, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { afterEach, beforeEach, expect, test } from "vite-plus/test";

import packageJson from "../package.json" with { type: "json" };
import { makeBareRepoWithAction } from "./fixtures/make-bare-repo.ts";
import {
  jsonRegistry,
  startRegistryServer,
  type RegistryServer,
} from "./fixtures/registry-server.ts";
import { runCli } from "./fixtures/run-cli.ts";
import { makeTempHome, type TempHome } from "./fixtures/with-temp-home.ts";

let env: TempHome;
let registry: RegistryServer | undefined;

beforeEach(async () => {
  env = await makeTempHome();
});

afterEach(async () => {
  if (registry) await registry.close();
  registry = undefined;
  await env.cleanup();
});

test("aia --version prints the package version", async () => {
  const result = await runCli(["--version"]);
  expect(result.exitCode).toBe(0);
  expect(result.stdout.trim()).toBe(packageJson.version);
});

test("aia --help prints USAGE block", async () => {
  const result = await runCli(["--help"]);
  expect(result.exitCode).toBe(0);
  expect(result.stdout).toContain("USAGE");
  expect(result.stdout).toContain("aia");
});

test("aia <resource> --help prints the resource's USAGE block", async () => {
  const result = await runCli(["workflow", "--help"]);
  expect(result.exitCode).toBe(0);
  expect(result.stdout).toContain("USAGE");
  expect(result.stdout).toContain("workflow");
  expect(result.stdout).toContain("list");
  expect(result.stdout).toContain("check");
});

test("aia <resource> <verb> --help prints the verb's USAGE block", async () => {
  const result = await runCli(["workflow", "list", "--help"]);
  expect(result.exitCode).toBe(0);
  expect(result.stdout).toContain("USAGE");
  expect(result.stdout).toContain("--json");
});

test("aia workflow check --help renders without invoking the run handler", async () => {
  const result = await runCli(["workflow", "check", "--help"]);
  expect(result.exitCode).toBe(0);
  expect(result.stdout).toContain("USAGE");
  expect(result.stdout).toContain("--all");
  expect(result.stderr).not.toContain("expected exactly one of");
});

test("aia action check --help renders without invoking the run handler (regression)", async () => {
  const result = await runCli(["action", "check", "--help"]);
  expect(result.exitCode).toBe(0);
  expect(result.stdout).toContain("USAGE");
  expect(result.stdout).toContain("--all");
  expect(result.stderr).not.toContain("expected exactly one of");
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

  registry = await startRegistryServer(jsonRegistry({ actions: [] }));
  const result = await runCli(["action", "list", "--json"], {
    HOME: env.home,
    AIACTIONS_REGISTRY_URL: registry.url,
  });
  expect(result.exitCode).toBe(0);
  const out = JSON.parse(result.stdout) as {
    registry: { url: string; fetchedAt: string } | null;
    registryError: string | null;
    entries: Array<{
      coord: string;
      latestRegistry: string | null;
      installedVersions: string[];
      description: string | null;
      localOnly: boolean;
    }>;
  };
  expect(out.registry).not.toBeNull();
  expect(out.registryError).toBeNull();
  expect(out.entries).toHaveLength(1);
  expect(out.entries[0]).toMatchObject({
    coord: "test/smoke",
    latestRegistry: null,
    installedVersions: ["1.0.0"],
    localOnly: true,
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

  registry = await startRegistryServer(jsonRegistry({ actions: [] }));
  const listResult = await runCli(["action", "list", "--json"], {
    HOME: env.home,
    AIACTIONS_REGISTRY_URL: registry.url,
  });
  const parsed = JSON.parse(listResult.stdout) as { entries: unknown[] };
  expect(parsed.entries).toEqual([]);
});

test("aia action check <valid> exits 0 with success line on stdout", async () => {
  const path = join(env.home, "aiaction.yaml");
  await writeFile(
    path,
    "schemaVersion: 1\nname: smoke\ndescription: x\nruns:\n  using: node\n  main: ./index.mjs\n",
  );

  const result = await runCli(["action", "check", path], { HOME: env.home });
  expect(result.exitCode).toBe(0);
  expect(result.stdout).toMatch(/manifest valid/);
});

test("aia action check <invalid> exits 7 with error lines on stderr", async () => {
  const path = join(env.home, "aiaction.yaml");
  await writeFile(
    path,
    "schemaVersion: 2\nname: Bad Name\ndescription: x\nruns:\n  using: node\n  main: index.js\n",
  );

  const result = await runCli(["action", "check", path], { HOME: env.home });
  expect(result.exitCode).toBe(7);
  expect(result.stderr).toMatch(/✗/);
  expect(result.stderr).toMatch(/schemaVersion/);
});

test("aia workflow run --file <happy.yaml> exits 0 with echoed step output", async () => {
  const dir = await mkdtemp(join(tmpdir(), "phase6.5-bin-happy-"));
  const file = join(dir, "greet.yaml");
  await writeFile(
    file,
    `name: greet\njobs:\n  hello:\n    steps:\n      - name: say-hi\n        run: echo hi\n`,
    "utf-8",
  );

  const result = await runCli(["workflow", "run", "--file", file]);
  expect(result.exitCode).toBe(0);
  expect(result.stdout).toContain("hi");
  expect(result.stderr).toContain("✓ Run succeeded");
});

test("aia workflow run --file <happy.yaml> --json emits NDJSON on stdout", async () => {
  const dir = await mkdtemp(join(tmpdir(), "phase6.5-bin-json-"));
  const file = join(dir, "greet.yaml");
  await writeFile(
    file,
    `name: greet\njobs:\n  hello:\n    steps:\n      - name: say-hi\n        run: echo hi\n`,
    "utf-8",
  );

  const result = await runCli(["workflow", "run", "--file", file, "--json"]);
  expect(result.exitCode).toBe(0);
  const lines = result.stdout
    .trim()
    .split("\n")
    .filter((l) => l.length > 0);
  expect(lines.length).toBeGreaterThan(2);
  const kinds = lines.map((l) => JSON.parse(l).kind);
  expect(kinds).toContain("workflow-started");
  expect(kinds).toContain("workflow-finished");
});

test("aia workflow run --file <failing.yaml> exits 8 (RUN_FAILED)", async () => {
  const dir = await mkdtemp(join(tmpdir(), "phase6.5-bin-fail-"));
  const file = join(dir, "boom.yaml");
  await writeFile(
    file,
    `name: boom\njobs:\n  fail:\n    steps:\n      - name: fail\n        run: exit 1\n`,
    "utf-8",
  );

  const result = await runCli(["workflow", "run", "--file", file]);
  expect(result.exitCode).toBe(8);
  expect(result.stderr).toContain("✗ Run failed");
});

test("aia workflow run nonexistent exits 2 (USAGE) — workflow not found", async () => {
  // Must run inside a git repo so discoverWorkflows() can proceed past the
  // NotInGitRepoError guard and reach the "workflow not found" path.
  const result = await runCli(["workflow", "run", "nonexistent"], {}, { cwd: process.cwd() });
  expect(result.exitCode).toBe(2);
  expect(result.stderr).toContain("workflow not found: nonexistent");
});

test("aia workflow run with no args exits 2 (USAGE)", async () => {
  const result = await runCli(["workflow", "run"]);
  expect(result.exitCode).toBe(2);
  expect(result.stderr).toContain("expected <name> or --file");
});

test("aia workflow run --file <happy.yaml> --cwd /nonexistent-xyz exits 2 (USAGE)", async () => {
  const dir = await mkdtemp(join(tmpdir(), "phase6.5-bin-cwd-"));
  const file = join(dir, "greet.yaml");
  await writeFile(
    file,
    `name: greet\njobs:\n  hello:\n    steps:\n      - name: say-hi\n        run: echo hi\n`,
    "utf-8",
  );

  const result = await runCli([
    "workflow",
    "run",
    "--file",
    file,
    "--cwd",
    "/definitely-not-a-real-path-xyz-1234",
  ]);
  expect(result.exitCode).toBe(2);
  expect(result.stderr).toContain("cwd does not exist");
});

test("aia workflow run --file <bad-schema.yaml> exits 7 (SCHEMA)", async () => {
  const dir = await mkdtemp(join(tmpdir(), "phase6.5-bin-schema-"));
  const file = join(dir, "bad.yaml");
  // `run:` AND `uses:` together on a single step is a schema violation.
  await writeFile(
    file,
    `name: bad\njobs:\n  x:\n    steps:\n      - run: echo a\n        uses: ./somewhere\n`,
    "utf-8",
  );

  const result = await runCli(["workflow", "run", "--file", file]);
  expect(result.exitCode).toBe(7);
});

test("aia workflow run --file <happy.yaml> --input branch=main passes inputs through", async () => {
  const dir = await mkdtemp(join(tmpdir(), "phase6.5-bin-input-"));
  const file = join(dir, "greet.yaml");
  await writeFile(
    file,
    `name: greet\ninputs:\n  branch:\n    type: string\n    default: develop\njobs:\n  hello:\n    steps:\n      - name: echo-input\n        run: echo "branch=\${{ inputs.branch }}"\n`,
    "utf-8",
  );

  const result = await runCli(["workflow", "run", "--file", file, "--input", "branch=main"]);
  expect(result.exitCode).toBe(0);
  expect(result.stdout).toContain("branch=main");
});
