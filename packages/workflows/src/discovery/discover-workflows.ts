/**
 * Orchestrates workflow discovery across the project root and the home
 * root. Resolves the project root via findGitRoot (which throws
 * NotInGitRepoError if no .git ancestor exists), loads both layers in
 * parallel, and merges them with project shadowing home.
 *
 * The library does NOT log shadow events — they are exposed as data
 * via the `shadowed` field on each DiscoveredWorkflow. CLI consumers
 * are responsible for rendering them.
 */

import { homedir } from "node:os";
import { join } from "node:path";

import { findGitRoot } from "./find-git-root.ts";
import { loadWorkflowsFromDir } from "./load-from-dir.ts";
import type { DiscoverOptions, DiscoveredWorkflow, DiscoveryResult } from "./types.ts";

const WORKFLOWS_SUBPATH = [".aiactions", "workflows"] as const;

/**
 * Orchestrates workflow discovery across the project root and the home
 * root.
 *
 * - Resolves the project root via `findGitRoot`, walking up from `cwd`
 *   to the first `.git` ancestor. Throws `NotInGitRepoError` (with the
 *   resolved start path) if no `.git` is found up to the filesystem root.
 * - Loads `<projectRoot>/.aiactions/workflows/` and
 *   `<homeDir>/.aiactions/workflows/` in parallel via `loadWorkflowsFromDir`.
 *   A missing directory in either layer is treated as empty (no error
 *   surfaces); other directory-level failures (e.g. EACCES on the
 *   directory itself) propagate.
 * - Merges with project shadowing home: when a workflow `name` exists in
 *   both layers, the project entry wins and its `shadowed` field carries
 *   the home file's `absolutePath` and `origin: "home"`. Within-root
 *   collisions (`.yaml` vs `.yml`) are already resolved inside
 *   `loadWorkflowsFromDir` and do NOT surface in `shadowed`.
 *
 * The library does NOT log shadow events. They are exposed as data via
 * the `shadowed` field; CLI consumers render them.
 *
 * The returned `workflows` array is sorted alphabetically by `name`
 * (locale-compare, deterministic for ASCII identifiers).
 * The returned `errors` array is project-first, then home — no
 * additional sort.
 */
export async function discoverWorkflows(opts?: DiscoverOptions): Promise<DiscoveryResult> {
  const cwd = opts?.cwd ?? process.cwd();
  const home = opts?.homeDir ?? homedir();

  const projectRoot = await findGitRoot(cwd);

  const projectDir = join(projectRoot, ...WORKFLOWS_SUBPATH);
  const homeWorkflowsDir = join(home, ...WORKFLOWS_SUBPATH);

  const [projectLayer, homeLayer] = await Promise.all([
    loadWorkflowsFromDir(projectDir, "project"),
    loadWorkflowsFromDir(homeWorkflowsDir, "home"),
  ]);

  const byName = new Map<string, DiscoveredWorkflow>();
  for (const w of homeLayer.workflows) {
    byName.set(w.name, w);
  }
  for (const w of projectLayer.workflows) {
    const homeShadow = byName.get(w.name);
    byName.set(w.name, {
      ...w,
      shadowed:
        homeShadow !== undefined
          ? { absolutePath: homeShadow.absolutePath, origin: "home" }
          : undefined,
    });
  }

  return {
    workflows: [...byName.values()].sort((a, b) => a.name.localeCompare(b.name)),
    // Errors: project layer first, then home. No name-based sort — preserves
    // the order in which each layer surfaced them, which already matches the
    // filesystem enumeration order within each layer.
    errors: [...projectLayer.errors, ...homeLayer.errors],
  };
}
