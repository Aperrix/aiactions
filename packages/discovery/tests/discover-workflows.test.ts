/**
 * Tests for `discoverWorkflows`. The orchestrator composes findGitRoot +
 * two parallel loadWorkflowsFromDir calls. We test through the public
 * options test seam (cwd, homeDir) so no test ever touches the real
 * process.cwd() or os.homedir().
 *
 * Coverage: both empty, project-only, home-only, cross-root collision,
 * deterministic sort, NotInGitRepoError propagation, error aggregation,
 * and that cwd/homeDir options effectively override the defaults.
 */

import { afterEach, describe, expect, test } from "vite-plus/test";
import { rm } from "node:fs/promises";

import { discoverWorkflows } from "../src/discover-workflows.ts";
import { NotInGitRepoError } from "../src/errors.ts";
import {
  cycleYaml,
  makeFakeHome,
  makeFakeRepo,
  malformedYaml,
  validWorkflowYaml,
} from "./fixtures.ts";

const tmpDirsToClean: string[] = [];

afterEach(async () => {
  while (tmpDirsToClean.length > 0) {
    const dir = tmpDirsToClean.pop();
    if (dir !== undefined) await rm(dir, { recursive: true, force: true });
  }
});

describe("discoverWorkflows", () => {
  test("both layers empty (no .aiactions/workflows/ in either) returns no workflows, no errors", async () => {
    const repo = await makeFakeRepo();
    const home = await makeFakeHome();
    tmpDirsToClean.push(repo.root, home.home);

    const result = await discoverWorkflows({ cwd: repo.cwd, homeDir: home.home });

    expect(result.workflows).toEqual([]);
    expect(result.errors).toEqual([]);
  });

  test("project-only workflows are returned with origin 'project'", async () => {
    const repo = await makeFakeRepo({
      workflows: {
        "review.yaml": validWorkflowYaml("review"),
        "release.yml": validWorkflowYaml("release"),
      },
    });
    const home = await makeFakeHome();
    tmpDirsToClean.push(repo.root, home.home);

    const result = await discoverWorkflows({ cwd: repo.cwd, homeDir: home.home });

    expect(result.workflows.map((w) => ({ name: w.name, origin: w.origin }))).toEqual([
      { name: "release", origin: "project" },
      { name: "review", origin: "project" },
    ]);
    for (const w of result.workflows) {
      expect(w.shadowed).toBeUndefined();
    }
    expect(result.errors).toEqual([]);
  });

  test("home-only workflows are returned with origin 'home'", async () => {
    const repo = await makeFakeRepo();
    const home = await makeFakeHome({
      workflows: { "deploy.yaml": validWorkflowYaml("deploy") },
    });
    tmpDirsToClean.push(repo.root, home.home);

    const result = await discoverWorkflows({ cwd: repo.cwd, homeDir: home.home });

    expect(result.workflows).toHaveLength(1);
    expect(result.workflows[0].origin).toBe("home");
    expect(result.workflows[0].name).toBe("deploy");
    expect(result.workflows[0].shadowed).toBeUndefined();
  });

  test("project shadows home: collision sets `shadowed` to the home file's path/origin", async () => {
    const repo = await makeFakeRepo({
      workflows: { "review.yaml": validWorkflowYaml("review-from-project") },
    });
    const home = await makeFakeHome({
      workflows: { "review.yaml": validWorkflowYaml("review-from-home") },
    });
    tmpDirsToClean.push(repo.root, home.home);

    const result = await discoverWorkflows({ cwd: repo.cwd, homeDir: home.home });

    expect(result.workflows).toHaveLength(1);
    const [w] = result.workflows;
    expect(w.name).toBe("review");
    expect(w.origin).toBe("project");
    expect(w.workflow.name).toBe("review-from-project");
    expect(w.shadowed).toEqual({
      absolutePath: expect.stringContaining(home.workflowsDir),
      origin: "home",
    });
  });

  test("results are sorted by name regardless of filesystem enumeration order", async () => {
    const repo = await makeFakeRepo({
      workflows: {
        "zeta.yaml": validWorkflowYaml("zeta"),
        "alpha.yaml": validWorkflowYaml("alpha"),
        "mid.yaml": validWorkflowYaml("mid"),
      },
    });
    const home = await makeFakeHome({
      workflows: { "beta.yaml": validWorkflowYaml("beta") },
    });
    tmpDirsToClean.push(repo.root, home.home);

    const result = await discoverWorkflows({ cwd: repo.cwd, homeDir: home.home });

    expect(result.workflows.map((w) => w.name)).toEqual(["alpha", "beta", "mid", "zeta"]);
  });

  test("propagates NotInGitRepoError when cwd has no .git ancestor", async () => {
    const repo = await makeFakeRepo({ withGit: false });
    const home = await makeFakeHome();
    tmpDirsToClean.push(repo.root, home.home);

    await expect(discoverWorkflows({ cwd: repo.cwd, homeDir: home.home })).rejects.toBeInstanceOf(
      NotInGitRepoError,
    );
  });

  test("aggregates per-file errors from both layers", async () => {
    const repo = await makeFakeRepo({
      workflows: { "broken.yaml": malformedYaml() },
    });
    const home = await makeFakeHome({
      workflows: { "cyclic.yaml": cycleYaml() },
    });
    tmpDirsToClean.push(repo.root, home.home);

    const result = await discoverWorkflows({ cwd: repo.cwd, homeDir: home.home });

    expect(result.workflows).toEqual([]);
    expect(result.errors).toHaveLength(2);
    const kinds = result.errors.map((e) => e.kind).sort();
    expect(kinds).toEqual(["graph_validation", "yaml_parse"]);
    const origins = result.errors.map((e) => e.origin).sort();
    expect(origins).toEqual(["home", "project"]);
  });

  test("errors are emitted project-first, then home (documented contract)", async () => {
    const repo = await makeFakeRepo({
      workflows: { "project-broken.yaml": malformedYaml() },
    });
    const home = await makeFakeHome({
      workflows: { "home-broken.yaml": malformedYaml() },
    });
    tmpDirsToClean.push(repo.root, home.home);

    const result = await discoverWorkflows({ cwd: repo.cwd, homeDir: home.home });

    expect(result.workflows).toEqual([]);
    expect(result.errors).toHaveLength(2);
    // Order matters here — the JSDoc on discoverWorkflows documents
    // "project-first, then home" and consumers may rely on it for grouping.
    expect(result.errors[0].origin).toBe("project");
    expect(result.errors[0].absolutePath.endsWith("project-broken.yaml")).toBe(true);
    expect(result.errors[1].origin).toBe("home");
    expect(result.errors[1].absolutePath.endsWith("home-broken.yaml")).toBe(true);
  });

  test("homeDir option overrides os.homedir() — workflow loaded from a non-default home root", async () => {
    const repo = await makeFakeRepo();
    const customHome = await makeFakeHome({
      workflows: { "from-custom.yaml": validWorkflowYaml("from-custom") },
    });
    tmpDirsToClean.push(repo.root, customHome.home);

    const result = await discoverWorkflows({ cwd: repo.cwd, homeDir: customHome.home });

    expect(result.workflows.map((w) => w.name)).toEqual(["from-custom"]);
    expect(result.workflows[0].absolutePath.startsWith(customHome.home)).toBe(true);
  });

  test("cwd option overrides process.cwd() — discovery follows the explicit cwd", async () => {
    const repoA = await makeFakeRepo({
      workflows: { "a.yaml": validWorkflowYaml("a") },
    });
    const repoB = await makeFakeRepo({
      workflows: { "b.yaml": validWorkflowYaml("b") },
    });
    const home = await makeFakeHome();
    tmpDirsToClean.push(repoA.root, repoB.root, home.home);

    const result = await discoverWorkflows({ cwd: repoB.cwd, homeDir: home.home });

    expect(result.workflows.map((w) => w.name)).toEqual(["b"]);
    expect(result.workflows[0].absolutePath.startsWith(repoB.root)).toBe(true);
  });
});
