/**
 * Tests for `ensureCachedAction` — orchestrates existence-first cache
 * + delegates to fetchActionFromCanonical on miss + writes the
 * lockfile entry post-fetch.
 */

import { mkdir, mkdtemp, readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { describe, expect, test } from "vite-plus/test";

import { ensureCachedAction } from "../src/runner/uses/registry-fetch.ts";

import { makeBareRepoWithAction } from "./fixtures/registry/make-bare-repo.ts";

const POSIX = process.platform !== "win32";

describe.skipIf(!POSIX)("ensureCachedAction", () => {
  test("returns the cache path immediately on hit, without fetching", async () => {
    const work = await mkdtemp(join(tmpdir(), "aiactions-ensure-"));
    const registryRoot = join(work, "registry");
    const cwd = join(work, "project");
    await mkdir(cwd, { recursive: true });

    const cachedDir = join(registryRoot, "user", "tool", "1.0.0");
    await mkdir(cachedDir, { recursive: true });
    await writeFile(
      join(cachedDir, "aiaction.yaml"),
      "name: tool\ndescription: x\nruns:\n  using: node\n  main: index.mjs\n",
      "utf8",
    );

    const result = await ensureCachedAction(
      { namespace: "user", name: "tool", version: "1.0.0" },
      registryRoot,
      cwd,
      { canonicalUrl: "file:///does-not-exist", tmpRoot: join(work, "tmp") },
    );

    expect(result.dir).toBe(cachedDir);
    expect(result.fetched).toBe(false);
    expect(result.resolvedSha).toBeNull();
  });

  test("fetches on cache miss and writes the lockfile", async () => {
    const work = await mkdtemp(join(tmpdir(), "aiactions-ensure-"));
    const registryRoot = join(work, "registry");
    const cwd = join(work, "project");
    await mkdir(cwd, { recursive: true });

    const bareRepo = await makeBareRepoWithAction({
      cwd: work,
      namespace: "octocat",
      name: "lint",
      tag: "octocat/lint@v1.0.0",
      manifest: "name: lint\ndescription: x\nruns:\n  using: node\n  main: index.mjs\n",
      sources: { "index.mjs": "export default async () => {};\n" },
    });

    const result = await ensureCachedAction(
      { namespace: "octocat", name: "lint", version: "1.0.0" },
      registryRoot,
      cwd,
      { canonicalUrl: `file://${bareRepo}`, tmpRoot: join(work, "tmp") },
    );

    expect(result.dir).toBe(join(registryRoot, "octocat", "lint", "1.0.0"));
    expect(result.fetched).toBe(true);
    expect(result.resolvedSha).toMatch(/^[0-9a-f]{40}$/);

    const lock = await readFile(join(cwd, ".aiactions", "lock.yaml"), "utf8");
    expect(lock).toContain("octocat/lint@1.0.0:");
    expect(lock).toContain(result.resolvedSha!);
  });

  test("does not overwrite an existing user-placed cache entry", async () => {
    const work = await mkdtemp(join(tmpdir(), "aiactions-ensure-"));
    const registryRoot = join(work, "registry");
    const cwd = join(work, "project");
    await mkdir(cwd, { recursive: true });

    const cachedDir = join(registryRoot, "myorg", "internal", "2.0.0");
    await mkdir(cachedDir, { recursive: true });
    await writeFile(
      join(cachedDir, "aiaction.yaml"),
      "name: internal\ndescription: user-private\nruns:\n  using: node\n  main: index.mjs\n",
      "utf8",
    );
    await writeFile(join(cachedDir, "marker"), "user-placed\n", "utf8");

    await ensureCachedAction(
      { namespace: "myorg", name: "internal", version: "2.0.0" },
      registryRoot,
      cwd,
      { canonicalUrl: "file:///does-not-exist", tmpRoot: join(work, "tmp") },
    );

    const marker = await readFile(join(cachedDir, "marker"), "utf8");
    expect(marker.trim()).toBe("user-placed");
  });

  test("constructs the per-action tag '<ns>/<name>@v<version>' from the coordinate", async () => {
    const work = await mkdtemp(join(tmpdir(), "aiactions-ensure-"));
    const registryRoot = join(work, "registry");
    const cwd = join(work, "project");
    await mkdir(cwd, { recursive: true });

    const bareRepo = await makeBareRepoWithAction({
      cwd: work,
      namespace: "octocat",
      name: "lint",
      tag: "octocat/lint@v2.3.4",
      manifest: "name: lint\ndescription: x\nruns:\n  using: node\n  main: index.mjs\n",
      sources: { "index.mjs": "export default async () => {};\n" },
    });

    const result = await ensureCachedAction(
      { namespace: "octocat", name: "lint", version: "2.3.4" },
      registryRoot,
      cwd,
      { canonicalUrl: `file://${bareRepo}`, tmpRoot: join(work, "tmp") },
    );

    expect(result.dir).toBe(join(registryRoot, "octocat", "lint", "2.3.4"));
    expect(result.fetched).toBe(true);
    expect(result.resolvedSha).toMatch(/^[0-9a-f]{40}$/);
  });
});
