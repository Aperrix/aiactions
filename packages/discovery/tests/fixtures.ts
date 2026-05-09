/**
 * Test helpers for discovery tests. Each test that needs a fake repo or
 * fake home builds it in a unique tmpdir so tests stay isolated and the
 * checked-in fixtures tree never contains a `.git/` directory (which would
 * confuse the host repository).
 *
 * Cleanup is the test's responsibility — call `rm(tmpDir, { recursive: true })`
 * in an `afterEach` hook, or use `mkdtemp` inside a `try/finally`.
 */

import { mkdir, mkdtemp, symlink, unlink, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

/** Trivial valid workflow YAML. Parses, validates schema, validates graph. */
export const validWorkflowYaml = (name: string): string =>
  `name: ${name}
jobs:
  ping:
    steps:
      - run: echo PONG
`;

/** Workflow YAML that fails the YAML parser (unbalanced brackets). */
export const malformedYaml = (): string => `name: bad
jobs: { unbalanced
`;

/** Workflow YAML that parses + passes shape but fails graph validation (cycle). */
export const cycleYaml = (): string => `name: cycle
jobs:
  a:
    needs: [b]
    steps:
      - run: echo a
  b:
    needs: [a]
    steps:
      - run: echo b
`;

/** Workflow YAML that parses but fails the schema (steps + uses conflict on a step). */
export const schemaInvalidYaml = (): string => `name: bad-shape
jobs:
  ping:
    steps:
      - uses: ./action
        run: echo conflict
`;

export interface FakeRepoOptions {
  /** Map of filename → file contents under `<root>/.aiactions/workflows/`. */
  readonly workflows?: Readonly<Record<string, string>>;
  /** When true, also create `<root>/.git/` as a directory (default true). */
  readonly withGit?: boolean;
  /** When true, create `<root>/.git` as a *file* (worktree-style) instead of a directory. */
  readonly gitAsFile?: boolean;
  /** Optional sub-directory hierarchy under the repo root, returned as the cwd. */
  readonly nestedCwd?: ReadonlyArray<string>;
}

export interface FakeRepo {
  /** Repo root directory. */
  readonly root: string;
  /** The "current working directory" the test should pass to discoverWorkflows. */
  readonly cwd: string;
  /** Path to `<root>/.aiactions/workflows/` (whether or not it was populated). */
  readonly workflowsDir: string;
}

/** Build a self-contained fake repo under `os.tmpdir()`. */
export async function makeFakeRepo(opts: FakeRepoOptions = {}): Promise<FakeRepo> {
  const root = await mkdtemp(join(tmpdir(), "aiactions-disc-repo-"));
  const withGit = opts.withGit !== false;
  if (withGit) {
    if (opts.gitAsFile === true) {
      await writeFile(join(root, ".git"), "gitdir: /fake/worktree/.git/worktrees/x\n", "utf8");
    } else {
      await mkdir(join(root, ".git"), { recursive: true });
    }
  }
  const workflowsDir = join(root, ".aiactions", "workflows");
  if (opts.workflows !== undefined) {
    await mkdir(workflowsDir, { recursive: true });
    for (const [filename, contents] of Object.entries(opts.workflows)) {
      await writeFile(join(workflowsDir, filename), contents, "utf8");
    }
  }
  let cwd = root;
  if (opts.nestedCwd !== undefined) {
    cwd = join(root, ...opts.nestedCwd);
    await mkdir(cwd, { recursive: true });
  }
  return { root, cwd, workflowsDir };
}

export interface FakeHomeOptions {
  /** Map of filename → file contents under `<home>/.aiactions/workflows/`. */
  readonly workflows?: Readonly<Record<string, string>>;
}

export interface FakeHome {
  readonly home: string;
  readonly workflowsDir: string;
}

export async function makeFakeHome(opts: FakeHomeOptions = {}): Promise<FakeHome> {
  const home = await mkdtemp(join(tmpdir(), "aiactions-disc-home-"));
  const workflowsDir = join(home, ".aiactions", "workflows");
  if (opts.workflows !== undefined) {
    await mkdir(workflowsDir, { recursive: true });
    for (const [filename, contents] of Object.entries(opts.workflows)) {
      await writeFile(join(workflowsDir, filename), contents, "utf8");
    }
  }
  return { home, workflowsDir };
}

/** Create a symlink at `linkPath` → `target`. If target is missing, the link is "broken". */
export async function makeSymlink(linkPath: string, target: string): Promise<void> {
  await symlink(target, linkPath);
}

/** Remove a file (used by tests that want to break a previously-good symlink). */
export async function deleteFile(path: string): Promise<void> {
  await unlink(path);
}
