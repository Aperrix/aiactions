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
