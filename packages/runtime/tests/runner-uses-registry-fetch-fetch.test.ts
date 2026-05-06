/**
 * Tests for `fetchActionFromCanonical` — exercises the real git
 * sparse-checkout pipeline against a local bare repo built by
 * `makeBareRepoWithAction`. POSIX-only; Windows path semantics are
 * a separate concern.
 */

import { mkdtemp, readFile, stat } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { describe, expect, test } from "vite-plus/test";

import { fetchActionFromCanonical } from "../src/runner/uses/registry-fetch.ts";

import { makeBareRepoWithAction } from "./fixtures/registry/make-bare-repo.ts";

const POSIX = process.platform !== "win32";

describe.skipIf(!POSIX)("fetchActionFromCanonical", () => {
  test("clones, sparse-checks-out, and moves the action into the cache", async () => {
    const work = await mkdtemp(join(tmpdir(), "aiactions-fetch-"));
    const bareRepo = await makeBareRepoWithAction({
      cwd: work,
      namespace: "octocat",
      name: "lint",
      tag: "octocat/lint@v1.0.0",
      manifest: "name: lint\ndescription: lint things\nruns:\n  using: node\n  main: index.mjs\n",
      sources: { "index.mjs": "export default async () => {};\n" },
    });

    const registryRoot = join(work, "registry");
    const sha = await fetchActionFromCanonical(
      { namespace: "octocat", name: "lint", version: "1.0.0" },
      registryRoot,
      { canonicalUrl: `file://${bareRepo}`, tmpRoot: join(work, "tmp") },
    );

    expect(sha).toMatch(/^[0-9a-f]{40}$/);
    const manifestPath = join(registryRoot, "octocat", "lint", "1.0.0", "aiaction.yaml");
    const manifest = await readFile(manifestPath, "utf8");
    expect(manifest).toContain("name: lint");
  });

  test("surfaces git stderr on unknown ref", async () => {
    const work = await mkdtemp(join(tmpdir(), "aiactions-fetch-"));
    const bareRepo = await makeBareRepoWithAction({
      cwd: work,
      namespace: "octocat",
      name: "lint",
      tag: "octocat/lint@v1.0.0",
      manifest: "name: lint\ndescription: x\nruns:\n  using: node\n  main: index.mjs\n",
      sources: { "index.mjs": "export default async () => {};\n" },
    });

    const registryRoot = join(work, "registry");
    await expect(
      fetchActionFromCanonical(
        { namespace: "octocat", name: "lint", version: "9.9.9-does-not-exist" },
        registryRoot,
        { canonicalUrl: `file://${bareRepo}`, tmpRoot: join(work, "tmp") },
      ),
    ).rejects.toThrow(/9\.9\.9-does-not-exist/);
  });

  test("does not leave a partial directory at the cache path on failure", async () => {
    const work = await mkdtemp(join(tmpdir(), "aiactions-fetch-"));
    const bareRepo = await makeBareRepoWithAction({
      cwd: work,
      namespace: "octocat",
      name: "lint",
      tag: "octocat/lint@v1.0.0",
      manifest: "name: lint\ndescription: x\nruns:\n  using: node\n  main: index.mjs\n",
      sources: { "index.mjs": "export default async () => {};\n" },
    });

    const registryRoot = join(work, "registry");
    await expect(
      fetchActionFromCanonical(
        { namespace: "octocat", name: "lint", version: "9.9.9-does-not-exist" },
        registryRoot,
        { canonicalUrl: `file://${bareRepo}`, tmpRoot: join(work, "tmp") },
      ),
    ).rejects.toBeDefined();

    await expect(
      stat(join(registryRoot, "octocat", "lint", "9.9.9-does-not-exist")),
    ).rejects.toMatchObject({ code: "ENOENT" });
  });
});
