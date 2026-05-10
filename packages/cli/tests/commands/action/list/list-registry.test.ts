import { mkdir } from "node:fs/promises";
import { join } from "node:path";

import { afterEach, beforeEach, expect, test } from "vite-plus/test";

import { runCli } from "../../../fixtures/run-cli.ts";
import {
  jsonRegistry,
  startRegistryServer,
  statusOnly,
  type RegistryServer,
} from "../../../fixtures/registry-server.ts";
import { makeTempHome, type TempHome } from "../../../fixtures/with-temp-home.ts";

let env: TempHome;
let registry: RegistryServer | undefined;

async function seedCache(coord: string, version: string): Promise<void> {
  const [ns, name] = coord.split("/");
  await mkdir(join(env.registryRoot, ns!, name!, version), { recursive: true });
}

beforeEach(async () => {
  env = await makeTempHome();
});

afterEach(async () => {
  if (registry) await registry.close();
  registry = undefined;
  await env.cleanup();
});

test("list shows registry entries with [installed] when cache matches latest", async () => {
  registry = await startRegistryServer(
    jsonRegistry({
      actions: [{ ref: "claude/agent@1.0.0", description: "Agent loop" }],
    }),
  );
  await seedCache("claude/agent", "1.0.0");

  const result = await runCli(["action", "list"], {
    HOME: env.home,
    AIACTIONS_REGISTRY_URL: registry.url,
  });
  expect(result.exitCode).toBe(0);
  expect(result.stdout).toMatch(/claude\/agent@1\.0\.0.*\[installed\]/);
});

test("list flags outdated cached versions", async () => {
  registry = await startRegistryServer(
    jsonRegistry({
      actions: [{ ref: "foo/bar@2.0.0", description: "Bar" }],
    }),
  );
  await seedCache("foo/bar", "1.0.0");

  const result = await runCli(["action", "list"], {
    HOME: env.home,
    AIACTIONS_REGISTRY_URL: registry.url,
  });
  expect(result.exitCode).toBe(0);
  expect(result.stdout).toMatch(
    /foo\/bar@2\.0\.0.*\[installed,\s*registry has @2\.0\.0,\s*cache has @1\.0\.0\]/,
  );
});

test("list emits 'Local only:' section for cache-only refs", async () => {
  registry = await startRegistryServer(jsonRegistry({ actions: [] }));
  await seedCache("legacy/old", "0.0.1");

  const result = await runCli(["action", "list"], {
    HOME: env.home,
    AIACTIONS_REGISTRY_URL: registry.url,
  });
  expect(result.exitCode).toBe(0);
  expect(result.stdout).toMatch(/Local only:[\s\S]*legacy\/old@0\.0\.1/);
});

test("list --json shape matches spec when registry healthy", async () => {
  registry = await startRegistryServer(
    jsonRegistry({
      actions: [{ ref: "claude/agent@1.0.0", description: "Agent loop" }],
    }),
  );
  await seedCache("claude/agent", "1.0.0");

  const result = await runCli(["action", "list", "--json"], {
    HOME: env.home,
    AIACTIONS_REGISTRY_URL: registry.url,
  });
  expect(result.exitCode).toBe(0);
  const parsed = JSON.parse(result.stdout) as {
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
  expect(parsed.registry).not.toBeNull();
  expect(parsed.registryError).toBeNull();
  expect(parsed.entries).toHaveLength(1);
  expect(parsed.entries[0]).toMatchObject({
    coord: "claude/agent",
    latestRegistry: "1.0.0",
    installedVersions: ["1.0.0"],
    description: "Agent loop",
    localOnly: false,
  });
});

test("list degrades to local-only with stderr warning when registry 500s", async () => {
  registry = await startRegistryServer(statusOnly(500));
  await seedCache("claude/agent", "1.0.0");

  const result = await runCli(["action", "list"], {
    HOME: env.home,
    AIACTIONS_REGISTRY_URL: registry.url,
  });
  expect(result.exitCode).toBe(0);
  expect(result.stderr).toMatch(/registry unreachable/i);
  expect(result.stdout).toMatch(/claude\/agent@1\.0\.0/);
});

test("list --json sets registry: null and registryError on failure", async () => {
  registry = await startRegistryServer(statusOnly(500));
  await seedCache("claude/agent", "1.0.0");

  const result = await runCli(["action", "list", "--json"], {
    HOME: env.home,
    AIACTIONS_REGISTRY_URL: registry.url,
  });
  expect(result.exitCode).toBe(0);
  const parsed = JSON.parse(result.stdout) as {
    registry: unknown;
    registryError: string | null;
    entries: Array<{ coord: string }>;
  };
  expect(parsed.registry).toBeNull();
  expect(typeof parsed.registryError).toBe("string");
  expect(parsed.entries.find((e) => e.coord === "claude/agent")).toBeDefined();
});
