import { afterEach, beforeEach, expect, test } from "vite-plus/test";

import { makeBareRepoWithAction } from "../../../fixtures/make-bare-repo.ts";
import { runCli } from "../../../fixtures/run-cli.ts";
import {
  jsonRegistry,
  startRegistryServer,
  statusOnly,
  type RegistryServer,
} from "../../../fixtures/registry-server.ts";
import { makeTempHome, type TempHome } from "../../../fixtures/with-temp-home.ts";

const NOOP_MANIFEST = "name: noop\ndescription: x\nruns:\n  using: node\n  main: index.mjs\n";
const NOOP_SOURCES: Readonly<Record<string, string>> = {
  "index.mjs": "export default async () => {};\n",
};

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

test("install <ns>/<name> resolves latest semver and installs", async () => {
  const bareRepo = await makeBareRepoWithAction({
    cwd: env.home,
    namespace: "foo",
    name: "bar",
    tag: "foo/bar@v2.1.0",
    manifest: NOOP_MANIFEST,
    sources: NOOP_SOURCES,
  });
  registry = await startRegistryServer(
    jsonRegistry({
      actions: [
        { ref: "foo/bar@2.0.0", description: "x" },
        { ref: "foo/bar@2.1.0", description: "x" },
      ],
    }),
  );

  const result = await runCli(["action", "install", "foo/bar", "--json"], {
    HOME: env.home,
    AIACTIONS_REGISTRY_URL: registry.url,
    AIACTIONS_CANONICAL_URL: `file://${bareRepo}`,
  });

  expect(result.exitCode).toBe(0);
  expect(result.stdout).toMatch(/"ref":"foo\/bar@2\.1\.0"/);
});

test("install with bare name (no ns) exits USAGE", async () => {
  const result = await runCli(["action", "install", "agent"], { HOME: env.home });
  expect(result.exitCode).toBe(2);
  expect(result.stderr).toMatch(/expected.*<ns>/);
});

test("install <ns>/<name> not in registry exits NOT_FOUND", async () => {
  registry = await startRegistryServer(jsonRegistry({ actions: [] }));
  const result = await runCli(["action", "install", "missing/x"], {
    HOME: env.home,
    AIACTIONS_REGISTRY_URL: registry.url,
  });
  expect(result.exitCode).toBe(4);
  expect(result.stderr).toMatch(/no action 'missing\/x' in registry/);
});

test("install <ns>/<name> with registry 500 exits REGISTRY", async () => {
  registry = await startRegistryServer(statusOnly(500));
  const result = await runCli(["action", "install", "foo/bar"], {
    HOME: env.home,
    AIACTIONS_REGISTRY_URL: registry.url,
  });
  expect(result.exitCode).toBe(6);
  expect(result.stderr).toMatch(/registry/i);
});

test("install <ns>/<name> with malformed JSON exits REGISTRY", async () => {
  registry = await startRegistryServer((_req, res) => {
    res.writeHead(200);
    res.end("{not json");
  });
  const result = await runCli(["action", "install", "foo/bar"], {
    HOME: env.home,
    AIACTIONS_REGISTRY_URL: registry.url,
  });
  expect(result.exitCode).toBe(6);
  expect(result.stderr).toMatch(/malformed|invalid/i);
});

test("install <ns>/<name>@<ver> (explicit) bypasses registry fetch", async () => {
  const bareRepo = await makeBareRepoWithAction({
    cwd: env.home,
    namespace: "claude",
    name: "agent",
    tag: "claude/agent@v1.0.0",
    manifest: NOOP_MANIFEST,
    sources: NOOP_SOURCES,
  });
  // No registry server started; if install hits the network it will fail.
  const result = await runCli(["action", "install", "claude/agent@1.0.0", "--json"], {
    HOME: env.home,
    AIACTIONS_REGISTRY_URL: "http://127.0.0.1:1/never",
    AIACTIONS_CANONICAL_URL: `file://${bareRepo}`,
  });
  expect(result.exitCode).toBe(0);
});
