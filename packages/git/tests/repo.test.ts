import { afterEach, describe, expect, test } from "vite-plus/test";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { GitError } from "../src/errors.ts";
import { cloneSparseShallow, lsRemoteTags, revParseHead, sparseCheckoutSet } from "../src/repo.ts";
import { makeBareRepoWithAction } from "./fixtures/make-bare-repo.ts";

const tmpToClean: string[] = [];

afterEach(async () => {
  while (tmpToClean.length > 0) {
    const dir = tmpToClean.pop();
    if (dir !== undefined) {
      await rm(dir, { recursive: true, force: true });
    }
  }
});

async function makeFixture(): Promise<{ bareRepo: string; cleanupRoot: string }> {
  const cleanupRoot = await mkdtemp(join(tmpdir(), "aiactions-git-"));
  tmpToClean.push(cleanupRoot);
  const bareRepo = await makeBareRepoWithAction({
    cwd: cleanupRoot,
    namespace: "ns",
    name: "act",
    tag: "ns/act@v1.0.0",
    manifest: "name: ns/act\n",
    sources: { "main.mjs": "export default async () => {};\n" },
  });
  return { bareRepo, cleanupRoot };
}

describe("lsRemoteTags", () => {
  test("returns the raw stdout listing tag refs", async () => {
    const { bareRepo } = await makeFixture();

    const out = await lsRemoteTags(`file://${bareRepo}`);

    expect(out).toContain("refs/tags/ns/act@v1.0.0");
  });

  test("throws GitError when the URL is unreachable", async () => {
    await expect(lsRemoteTags("file:///does/not/exist.git")).rejects.toBeInstanceOf(GitError);
  });
});

describe("cloneSparseShallow", () => {
  test("clones a shallow sparse copy at the requested branch", async () => {
    const { bareRepo, cleanupRoot } = await makeFixture();
    const dest = join(cleanupRoot, "clone");

    await cloneSparseShallow({
      url: `file://${bareRepo}`,
      branch: "ns/act@v1.0.0",
      dest,
      filter: "blob:none",
    });

    const sha = await revParseHead(dest);
    expect(sha.length).toBe(40);
  });

  test("throws GitError when the branch tag does not exist", async () => {
    const { bareRepo, cleanupRoot } = await makeFixture();
    const dest = join(cleanupRoot, "clone-bad");

    await expect(
      cloneSparseShallow({
        url: `file://${bareRepo}`,
        branch: "no-such-tag",
        dest,
        filter: "blob:none",
      }),
    ).rejects.toBeInstanceOf(GitError);
  });
});

describe("sparseCheckoutSet", () => {
  test("narrows a sparse clone to the requested paths", async () => {
    const { bareRepo, cleanupRoot } = await makeFixture();
    const dest = join(cleanupRoot, "clone-narrow");

    await cloneSparseShallow({
      url: `file://${bareRepo}`,
      branch: "ns/act@v1.0.0",
      dest,
      filter: "blob:none",
    });

    await sparseCheckoutSet(dest, ["actions/ns/act"]);

    const sha = await revParseHead(dest);
    expect(sha.length).toBe(40);
  });
});

describe("revParseHead", () => {
  test("returns the trimmed HEAD SHA", async () => {
    const { bareRepo, cleanupRoot } = await makeFixture();
    const dest = join(cleanupRoot, "clone-head");

    await cloneSparseShallow({
      url: `file://${bareRepo}`,
      branch: "ns/act@v1.0.0",
      dest,
      filter: "blob:none",
    });

    const sha = await revParseHead(dest);
    expect(sha).toMatch(/^[0-9a-f]{40}$/);
    expect(sha).toBe(sha.trim());
  });
});
