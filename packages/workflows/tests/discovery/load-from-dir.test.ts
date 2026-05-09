/**
 * Tests for `loadWorkflowsFromDir`. Each test owns its tmpdir lifecycle.
 *
 * Coverage targets (one or two `test` blocks each):
 *  - missing dir → empty result, no error
 *  - empty dir → empty result, no error
 *  - happy path: yaml + yml extension filter, hidden filter, subdir filter
 *  - symlink to valid file: loaded; broken symlink: io_error
 *  - error mapping: yaml_parse, schema_validation, graph_validation
 *  - within-root .yaml/.yml stem collision: .yaml wins, .yml dropped silently
 *  - origin propagation, stem extraction
 */

import { afterEach, describe, expect, test } from "vite-plus/test";
import { rm } from "node:fs/promises";
import { join } from "node:path";

import { loadWorkflowsFromDir } from "../../src/discovery/load-from-dir.ts";
import {
  cycleYaml,
  deleteFile,
  makeFakeRepo,
  makeSymlink,
  malformedYaml,
  schemaInvalidYaml,
  validWorkflowYaml,
} from "./fixtures.ts";

const tmpDirsToClean: string[] = [];

afterEach(async () => {
  while (tmpDirsToClean.length > 0) {
    const dir = tmpDirsToClean.pop();
    if (dir !== undefined) await rm(dir, { recursive: true, force: true });
  }
});

describe("loadWorkflowsFromDir", () => {
  test("ENOENT (missing directory) returns an empty result, no error", async () => {
    const repo = await makeFakeRepo(); // no workflows option → workflowsDir not created
    tmpDirsToClean.push(repo.root);

    const result = await loadWorkflowsFromDir(repo.workflowsDir, "project");

    expect(result.workflows).toEqual([]);
    expect(result.errors).toEqual([]);
  });

  test("empty directory returns an empty result, no error", async () => {
    const repo = await makeFakeRepo({ workflows: {} });
    tmpDirsToClean.push(repo.root);

    const result = await loadWorkflowsFromDir(repo.workflowsDir, "project");

    expect(result.workflows).toEqual([]);
    expect(result.errors).toEqual([]);
  });

  test("filters: keeps .yaml and .yml, skips hidden files and non-yaml extensions", async () => {
    const repo = await makeFakeRepo({
      workflows: {
        "review.yaml": validWorkflowYaml("review"),
        "release.yml": validWorkflowYaml("release"),
        ".draft.yaml": validWorkflowYaml("draft"),
        "notes.txt": "this is not yaml",
        "README.md": "# nope",
      },
    });
    tmpDirsToClean.push(repo.root);

    const result = await loadWorkflowsFromDir(repo.workflowsDir, "project");

    const names = result.workflows.map((w) => w.name).sort();
    expect(names).toEqual(["release", "review"]);
    expect(result.errors).toEqual([]);
  });

  test("subdirectories are skipped (no recursion)", async () => {
    const repo = await makeFakeRepo({
      workflows: { "release.yaml": validWorkflowYaml("release") },
    });
    // Sneak a workflow into a subdirectory that should not be discovered.
    const { mkdir, writeFile } = await import("node:fs/promises");
    await mkdir(join(repo.workflowsDir, "experimental"), { recursive: true });
    await writeFile(
      join(repo.workflowsDir, "experimental", "ghost.yaml"),
      validWorkflowYaml("ghost"),
      "utf8",
    );
    tmpDirsToClean.push(repo.root);

    const result = await loadWorkflowsFromDir(repo.workflowsDir, "project");

    expect(result.workflows.map((w) => w.name)).toEqual(["release"]);
    expect(result.errors).toEqual([]);
  });

  test("symlink resolving to a valid file is loaded normally", async () => {
    const repo = await makeFakeRepo({
      workflows: { "real.yaml": validWorkflowYaml("real") },
    });
    tmpDirsToClean.push(repo.root);
    const linkPath = join(repo.workflowsDir, "alias.yaml");
    await makeSymlink(linkPath, join(repo.workflowsDir, "real.yaml"));

    const result = await loadWorkflowsFromDir(repo.workflowsDir, "project");

    const names = result.workflows.map((w) => w.name).sort();
    expect(names).toEqual(["alias", "real"]);
    expect(result.errors).toEqual([]);
  });

  test("broken symlink (target missing) emits an io_error and discovery proceeds", async () => {
    const repo = await makeFakeRepo({
      workflows: {
        "real.yaml": validWorkflowYaml("real"),
        "victim.yaml": validWorkflowYaml("victim"),
      },
    });
    tmpDirsToClean.push(repo.root);
    const linkPath = join(repo.workflowsDir, "broken.yaml");
    await makeSymlink(linkPath, join(repo.workflowsDir, "victim.yaml"));
    await deleteFile(join(repo.workflowsDir, "victim.yaml"));

    const result = await loadWorkflowsFromDir(repo.workflowsDir, "project");

    expect(result.workflows.map((w) => w.name).sort()).toEqual(["real"]);
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0].kind).toBe("io_error");
    expect(result.errors[0].absolutePath).toBe(linkPath);
    expect(result.errors[0].origin).toBe("project");
  });

  test("malformed YAML produces a yaml_parse DiscoveryError; siblings still load", async () => {
    const repo = await makeFakeRepo({
      workflows: {
        "good.yaml": validWorkflowYaml("good"),
        "bad.yaml": malformedYaml(),
      },
    });
    tmpDirsToClean.push(repo.root);

    const result = await loadWorkflowsFromDir(repo.workflowsDir, "home");

    expect(result.workflows.map((w) => w.name)).toEqual(["good"]);
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0].kind).toBe("yaml_parse");
    expect(result.errors[0].origin).toBe("home");
  });

  test("schema-invalid YAML produces a schema_validation DiscoveryError", async () => {
    const repo = await makeFakeRepo({
      workflows: { "shape.yaml": schemaInvalidYaml() },
    });
    tmpDirsToClean.push(repo.root);

    const result = await loadWorkflowsFromDir(repo.workflowsDir, "project");

    expect(result.workflows).toEqual([]);
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0].kind).toBe("schema_validation");
  });

  test("graph-invalid YAML (cycle) produces a graph_validation DiscoveryError", async () => {
    const repo = await makeFakeRepo({
      workflows: { "cycle.yaml": cycleYaml() },
    });
    tmpDirsToClean.push(repo.root);

    const result = await loadWorkflowsFromDir(repo.workflowsDir, "project");

    expect(result.workflows).toEqual([]);
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0].kind).toBe("graph_validation");
  });

  test("within-root stem collision: .yaml wins, .yml is silently dropped", async () => {
    const repo = await makeFakeRepo({
      workflows: {
        "review.yaml": validWorkflowYaml("review-yaml"),
        "review.yml": validWorkflowYaml("review-yml"),
      },
    });
    tmpDirsToClean.push(repo.root);

    const result = await loadWorkflowsFromDir(repo.workflowsDir, "project");

    expect(result.workflows).toHaveLength(1);
    const [w] = result.workflows;
    expect(w.name).toBe("review");
    expect(w.absolutePath.endsWith("review.yaml")).toBe(true);
    expect(w.workflow.name).toBe("review-yaml");
    expect(result.errors).toEqual([]);
  });

  test("symlink whose target dir is unreadable surfaces the real error, not a 'broken symlink' message", async () => {
    const { chmod } = await import("node:fs/promises");
    const repo = await makeFakeRepo({
      workflows: { "real.yaml": validWorkflowYaml("real") },
    });
    tmpDirsToClean.push(repo.root);

    // Create a sub-directory containing the target, then chmod it 000 so the
    // symlink can be created (the link itself is in the parent dir) but
    // resolving it through the locked sub-directory fails with EACCES.
    const { mkdir, writeFile } = await import("node:fs/promises");
    const lockedDir = join(repo.workflowsDir, "locked");
    await mkdir(lockedDir, { recursive: true });
    await writeFile(join(lockedDir, "target.yaml"), validWorkflowYaml("locked"), "utf8");
    const linkPath = join(repo.workflowsDir, "via-locked.yaml");
    await makeSymlink(linkPath, join(lockedDir, "target.yaml"));
    await chmod(lockedDir, 0o000);
    try {
      const result = await loadWorkflowsFromDir(repo.workflowsDir, "project");

      // The valid sibling still loads.
      expect(result.workflows.map((w) => w.name).sort()).toEqual(["real"]);
      // The symlink-with-EACCES emits an io_error whose message is NOT
      // "broken symlink" — it is the actual EACCES message from stat.
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].kind).toBe("io_error");
      expect(result.errors[0].absolutePath).toBe(linkPath);
      expect(result.errors[0].message).not.toBe(`broken symlink: via-locked.yaml`);
      // EACCES messages from libuv typically include the word "permission".
      expect(result.errors[0].message.toLowerCase()).toContain("permission");
    } finally {
      // Restore permissions so afterEach cleanup can recurse.
      await chmod(lockedDir, 0o755);
    }
  });

  test("origin label is propagated to every loaded workflow; stems are extension-stripped", async () => {
    const repo = await makeFakeRepo({
      workflows: {
        "alpha.yaml": validWorkflowYaml("alpha"),
        "beta.yml": validWorkflowYaml("beta"),
      },
    });
    tmpDirsToClean.push(repo.root);

    const result = await loadWorkflowsFromDir(repo.workflowsDir, "home");

    for (const w of result.workflows) {
      expect(w.origin).toBe("home");
    }
    const names = result.workflows.map((w) => w.name).sort();
    expect(names).toEqual(["alpha", "beta"]);
  });
});
