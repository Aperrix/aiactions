/**
 * Smoke test for the bare-repo fixture helper. Asserts that the helper
 * builds a clonable bare repo with the expected action layout at the
 * declared tag.
 */

import { execFile } from "node:child_process";
import { mkdtemp } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { promisify } from "node:util";

import { describe, expect, test } from "vite-plus/test";

import { makeBareRepoWithAction } from "./make-bare-repo.ts";

const pExecFile = promisify(execFile);
const POSIX = process.platform !== "win32";

describe.skipIf(!POSIX)("makeBareRepoWithAction — extraTags", () => {
  test("seeds extra version tags pointing at the same head", async () => {
    const work = await mkdtemp(join(tmpdir(), "aia-bare-multi-"));
    const bareRepo = await makeBareRepoWithAction({
      cwd: work,
      namespace: "octocat",
      name: "lint",
      tag: "octocat/lint@v1.0.0",
      manifest: "name: lint\ndescription: x\nruns:\n  using: node\n  main: index.mjs\n",
      sources: { "index.mjs": "export default async () => {};\n" },
      extraTags: ["octocat/lint@v1.1.0", "octocat/lint@v1.2.3", "octocat/lint@v2.0.0"],
    });

    const { stdout } = await pExecFile("git", ["ls-remote", "--tags", `file://${bareRepo}`]);
    const tagLines = stdout.trim().split("\n");
    const tagNames = tagLines.map((line) => line.split("\t")[1]!.replace("refs/tags/", ""));

    expect(tagNames).toContain("octocat/lint@v1.0.0");
    expect(tagNames).toContain("octocat/lint@v1.1.0");
    expect(tagNames).toContain("octocat/lint@v1.2.3");
    expect(tagNames).toContain("octocat/lint@v2.0.0");
  });
});

describe.skipIf(!POSIX)("makeBareRepoWithAction", () => {
  test("creates a bare repo clonable at the declared tag", async () => {
    const work = await mkdtemp(join(tmpdir(), "aiactions-fixture-"));
    const bareRepo = await makeBareRepoWithAction({
      cwd: work,
      namespace: "octocat",
      name: "lint",
      tag: "v1.0.0",
      manifest: "name: lint\ndescription: lint things\nruns:\n  using: node\n  main: index.mjs\n",
      sources: { "index.mjs": "export default async () => {};\n" },
    });

    const cloneTarget = join(work, "clone");
    await pExecFile("git", [
      "clone",
      "--depth",
      "1",
      "--branch",
      "v1.0.0",
      `file://${bareRepo}`,
      cloneTarget,
    ]);

    const lsResult = await pExecFile("ls", [join(cloneTarget, "actions", "octocat", "lint")]);
    expect(lsResult.stdout).toContain("aiaction.yaml");
    expect(lsResult.stdout).toContain("index.mjs");
  });
});
