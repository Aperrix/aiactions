import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { afterEach, beforeEach, expect, test } from "vite-plus/test";

import { emitRegistry } from "./gen-actions-registry.ts";

let work: string;

beforeEach(async () => {
  work = await mkdtemp(join(tmpdir(), "aia-reg-"));
});

afterEach(async () => {
  await rm(work, { recursive: true, force: true });
});

const validManifest =
  "schemaVersion: 1\nname: agent\ndescription: x\nruns:\n  using: node\n  main: ./index.mjs\n";

async function makeAction(
  ns: string,
  name: string,
  pkg: { name?: string; version?: string; description?: string } = {},
): Promise<void> {
  const dir = join(work, ns, name);
  await mkdir(dir, { recursive: true });
  await writeFile(
    join(dir, "package.json"),
    JSON.stringify(
      {
        name: pkg.name ?? `@${ns}/${name}`,
        version: pkg.version ?? "1.0.0",
        description: pkg.description ?? `the ${ns}/${name} action`,
        private: true,
        type: "module",
      },
      null,
      2,
    ),
  );
  await writeFile(join(dir, "aiaction.yaml"), validManifest);
}

test("empty actions directory yields an empty registry", async () => {
  const reg = await emitRegistry(work);
  expect(reg).toEqual({ actions: [] });
});

test("single valid action produces one entry", async () => {
  await makeAction("claude", "agent", {
    version: "1.0.0",
    description: "Run a Claude agent loop",
  });
  const reg = await emitRegistry(work);
  expect(reg.actions).toEqual([
    { ref: "claude/agent@1.0.0", description: "Run a Claude agent loop" },
  ]);
});

test("multiple actions are sorted lexicographically by ref", async () => {
  await makeAction("openai", "review", { version: "0.2.0", description: "Review code" });
  await makeAction("claude", "agent", { version: "1.0.0", description: "Agent loop" });
  await makeAction("anthropic", "haiku", { version: "0.1.0", description: "Haiku writer" });
  const reg = await emitRegistry(work);
  expect(reg.actions.map((e) => e.ref)).toEqual([
    "anthropic/haiku@0.1.0",
    "claude/agent@1.0.0",
    "openai/review@0.2.0",
  ]);
});

test("invalid manifest yaml throws", async () => {
  await makeAction("claude", "agent");
  await writeFile(join(work, "claude", "agent", "aiaction.yaml"), "not: a: valid: manifest:\n");
  await expect(emitRegistry(work)).rejects.toThrow();
});

test("package.json name mismatch throws", async () => {
  await makeAction("claude", "agent", { name: "@wrong/scope" });
  await expect(emitRegistry(work)).rejects.toThrow(/must equal '@claude\/agent'/u);
});

test("missing description throws", async () => {
  await makeAction("claude", "agent");
  await writeFile(
    join(work, "claude", "agent", "package.json"),
    JSON.stringify({ name: "@claude/agent", version: "1.0.0", private: true }, null, 2),
  );
  await expect(emitRegistry(work)).rejects.toThrow(/must have a description/u);
});

test("idempotent: two runs produce identical output", async () => {
  await makeAction("claude", "agent", { version: "1.0.0" });
  await makeAction("openai", "review", { version: "0.2.0" });
  const a = await emitRegistry(work);
  const b = await emitRegistry(work);
  expect(JSON.stringify(a)).toBe(JSON.stringify(b));
});

test("ignores stray files at the namespace and name levels", async () => {
  await makeAction("claude", "agent", { version: "1.0.0" });
  await writeFile(join(work, "loose-file.txt"), "");
  await writeFile(join(work, "claude", "another-stray.txt"), "");
  const reg = await emitRegistry(work);
  expect(reg.actions).toHaveLength(1);
});
