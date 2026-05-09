import { mkdtemp } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { describe, expect, test } from "vite-plus/test";

import { classifyVersion, resolveMajorRange } from "../src/resolve.ts";

import { makeBareRepoWithAction } from "./fixtures/registry/make-bare-repo.ts";

describe("classifyVersion", () => {
  test("recognises 3-segment all-digit semver as exact", () => {
    expect(classifyVersion("1.0.0")).toBe("exact");
    expect(classifyVersion("12.34.56")).toBe("exact");
  });

  test("recognises pre-release semver as exact", () => {
    expect(classifyVersion("1.0.0-beta")).toBe("exact");
    expect(classifyVersion("2.3.4-rc.1")).toBe("exact");
  });

  test("recognises bare digits as a major-prefix range", () => {
    expect(classifyVersion("1")).toBe("major");
    expect(classifyVersion("42")).toBe("major");
  });

  test("treats anything else as branch (literal git ref)", () => {
    expect(classifyVersion("main")).toBe("branch");
    expect(classifyVersion("abc1234")).toBe("branch");
    expect(classifyVersion("1.2")).toBe("branch"); // minor-prefix not yet supported
  });
});

const POSIX = process.platform !== "win32";

describe.skipIf(!POSIX)("resolveMajorRange", () => {
  const baseManifest = "name: lint\ndescription: x\nruns:\n  using: node\n  main: index.mjs\n";
  const baseSources = { "index.mjs": "export default async () => {};\n" };

  test("picks the highest stable patch under the requested major", async () => {
    const work = await mkdtemp(join(tmpdir(), "aia-resolve-"));
    const bareRepo = await makeBareRepoWithAction({
      cwd: work,
      namespace: "octocat",
      name: "lint",
      tag: "octocat/lint@v1.0.0",
      manifest: baseManifest,
      sources: baseSources,
      extraTags: ["octocat/lint@v1.1.0", "octocat/lint@v1.2.3", "octocat/lint@v2.0.0"],
    });

    const res = await resolveMajorRange(
      { namespace: "octocat", name: "lint", version: "1" },
      `file://${bareRepo}`,
    );
    expect(res.resolvedVersion).toBe("1.2.3");
    expect(res.resolvedSha).toMatch(/^[0-9a-f]{40}$/u);
  });

  test("skips pre-release tags when resolving major range", async () => {
    const work = await mkdtemp(join(tmpdir(), "aia-resolve-"));
    const bareRepo = await makeBareRepoWithAction({
      cwd: work,
      namespace: "octocat",
      name: "lint",
      tag: "octocat/lint@v1.0.0",
      manifest: baseManifest,
      sources: baseSources,
      extraTags: ["octocat/lint@v1.1.0", "octocat/lint@v1.2.0-beta.1"],
    });

    const res = await resolveMajorRange(
      { namespace: "octocat", name: "lint", version: "1" },
      `file://${bareRepo}`,
    );
    expect(res.resolvedVersion).toBe("1.1.0"); // 1.2.0-beta.1 ignored
  });

  test("throws when no published version matches the requested major", async () => {
    const work = await mkdtemp(join(tmpdir(), "aia-resolve-"));
    const bareRepo = await makeBareRepoWithAction({
      cwd: work,
      namespace: "octocat",
      name: "lint",
      tag: "octocat/lint@v2.0.0",
      manifest: baseManifest,
      sources: baseSources,
    });

    await expect(
      resolveMajorRange({ namespace: "octocat", name: "lint", version: "9" }, `file://${bareRepo}`),
    ).rejects.toThrow(/no published version of 'octocat\/lint' matches major '\^9\.0\.0'/u);
  });

  test("wraps git ls-remote stderr in ActionResolutionError", async () => {
    await expect(
      resolveMajorRange(
        { namespace: "octocat", name: "lint", version: "1" },
        "file:///does/not/exist/missing.git",
      ),
    ).rejects.toThrow(/failed to list tags for 'octocat\/lint'/u);
  });
});
