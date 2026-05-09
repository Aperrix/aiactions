# Workflow Discovery Roots Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement workflow discovery for AIactions in `@aiactions/workflows` — three new public functions (`findGitRoot`, `loadWorkflowsFromDir`, `discoverWorkflows`) that turn `<repoRoot>/.aiactions/workflows/` and `~/.aiactions/workflows/` into typed `DiscoveredWorkflow` objects with origin badges and cross-root shadow detection.

**Architecture:** New module `packages/workflows/src/discovery/`. One file per public function plus a types module. Pure functions, no class hierarchies. The orchestrator (`discoverWorkflows`) composes the two filesystem-loading primitives with `Promise.all`. Project layer shadows home layer; per-file errors are non-blocking and aggregated in `DiscoveryResult.errors`.

**Tech Stack:** TypeScript (strict), Node 22 (`fs/promises`, `node:path`, `node:os`), Vite+ for build/test/lint, Vitest API via `vite-plus/test`. No new dependencies.

**Reference spec:** `docs/superpowers/specs/2026-05-09-workflow-discovery-roots-design.md` (commit `59e5942`). All decisions D1–D8 and the edge-case matrix are authoritative — this plan implements them verbatim.

---

## File Structure

### Files to create

| Path | Responsibility |
|------|----------------|
| `packages/workflows/src/discovery/types.ts` | All public types: `WorkflowOrigin`, `DiscoveredWorkflow`, `DiscoveryError`, `DiscoveryErrorKind`, `DirLoadResult`, `DiscoveryResult`, `DiscoverOptions`. |
| `packages/workflows/src/discovery/errors.ts` | `NotInGitRepoError` class. |
| `packages/workflows/src/discovery/find-git-root.ts` | `findGitRoot(startDir)` — walk-up to first `.git/`. |
| `packages/workflows/src/discovery/load-from-dir.ts` | `loadWorkflowsFromDir(dir, origin)` — flat-list one root, classify, parse. Also internal `toDiscoveryError` helper. |
| `packages/workflows/src/discovery/discover-workflows.ts` | `discoverWorkflows(opts)` — orchestrator: resolve project root, load both layers in parallel, merge with shadow tracking, sort. |
| `packages/workflows/src/discovery/index.ts` | Re-export everything public from the four files above. |
| `packages/workflows/tests/discovery/fixtures.ts` | Test helpers: `makeFakeRepo`, `makeFakeHome`, `validWorkflowYaml`, `malformedYaml`, `cycleYaml`. Builds tmpdir trees at test runtime. |
| `packages/workflows/tests/discovery/find-git-root.test.ts` | Tests for `findGitRoot`. |
| `packages/workflows/tests/discovery/load-from-dir.test.ts` | Tests for `loadWorkflowsFromDir`. |
| `packages/workflows/tests/discovery/discover-workflows.test.ts` | Tests for `discoverWorkflows`. |

### Files to modify

| Path | Change |
|------|--------|
| `packages/workflows/src/index.ts` | Add `export * from "./discovery/index.ts";` (single line, at the bottom of the existing exports list). |

### Files NOT touched

- `packages/workflows/package.json` — no new deps, no version bump (release-please manages).
- `packages/workflows/src/parser/*` — unchanged.
- `packages/workflows/src/schema/*` — unchanged.
- `packages/workflows/src/types/errors.ts` — unchanged.
- `packages/runtime/*`, `packages/cli/*` — out of scope for this plan; they consume the new API in MS1.9/1.10.

---

## Conventions reminder for the implementer

- **Imports use explicit `.ts` extension** (`verbatimModuleSyntax: true`). Example: `import { parseWorkflow } from "../parser/parse-workflow.ts";`. Don't omit the extension.
- **Test imports come from `vite-plus/test`**, not `vitest`. Example: `import { describe, expect, test } from "vite-plus/test";`.
- **Strict TypeScript.** No `any` (use `unknown` and narrow). Add `readonly` to interface fields. Prefer `as const` over enums.
- **Verification gate:** run `vp run ready` from repo root before any commit. It runs `vp check` (type + lint) recursively, then `vp test` recursively, then `vp build` recursively. If a step fails, do not commit — fix and retry.
- **No backwards-compat shims.** This is greenfield code; if a name is wrong, rename it cleanly.
- **`node:fs/promises` over `node:fs`.** `Dirent.isFile()` and friends require the `withFileTypes: true` option on `readdir`.
- **Determinism:** sort the orchestrator's final array by `name` with `localeCompare` — never trust `readdir`'s enumeration order.

---

## Task 1: Scaffold module + types + errors

**Files:**
- Create: `packages/workflows/src/discovery/types.ts`
- Create: `packages/workflows/src/discovery/errors.ts`
- Create: `packages/workflows/src/discovery/index.ts`
- Modify: `packages/workflows/src/index.ts`

This task introduces no behaviour — only the type surface and the public re-export. Establishing the types first lets all later tasks reference them by name.

- [ ] **Step 1: Create `types.ts`**

Write the file `packages/workflows/src/discovery/types.ts`:

```ts
/**
 * Public types for workflow discovery. The discovery API turns one or more
 * filesystem roots into typed Workflow objects with origin badges and
 * collision metadata.
 *
 * The orchestrator entry point is `discoverWorkflows` (see
 * ./discover-workflows.ts). Lower-level primitives are `loadWorkflowsFromDir`
 * (./load-from-dir.ts) and `findGitRoot` (./find-git-root.ts).
 */

import type { Workflow } from "../schema/workflow.ts";

/** Where a discovered workflow was loaded from. */
export type WorkflowOrigin = "project" | "home";

/**
 * One workflow loaded from one root. The `name` is the filename stem
 * (no extension). When the same `name` exists in both roots, the project
 * layer wins and `shadowed` carries the home file's path/origin.
 *
 * Within-root `.yaml`/`.yml` collisions are resolved before this type is
 * produced — `.yaml` wins, `.yml` is silently dropped, no `shadowed` is
 * populated for the within-root case (see spec D3).
 */
export interface DiscoveredWorkflow {
  readonly name: string;
  readonly origin: WorkflowOrigin;
  readonly absolutePath: string;
  readonly workflow: Workflow;
  readonly shadowed?: {
    readonly absolutePath: string;
    readonly origin: WorkflowOrigin;
  };
}

/** Discriminator for per-file failures captured during discovery. */
export type DiscoveryErrorKind =
  | "yaml_parse"
  | "schema_validation"
  | "graph_validation"
  | "io_error";

/** A per-file failure. Discovery never throws on these — it aggregates. */
export interface DiscoveryError {
  readonly absolutePath: string;
  readonly origin: WorkflowOrigin;
  readonly kind: DiscoveryErrorKind;
  readonly message: string;
  readonly cause?: unknown;
}

/** Result of loading one root directory. `shadowed` is computed by the orchestrator, not at this layer. */
export interface DirLoadResult {
  readonly workflows: ReadonlyArray<Omit<DiscoveredWorkflow, "shadowed">>;
  readonly errors: ReadonlyArray<DiscoveryError>;
}

/** Result of `discoverWorkflows`. */
export interface DiscoveryResult {
  readonly workflows: ReadonlyArray<DiscoveredWorkflow>;
  readonly errors: ReadonlyArray<DiscoveryError>;
}

/** Optional overrides for `discoverWorkflows`. Both default to live process state. */
export interface DiscoverOptions {
  /** Defaults to `process.cwd()`. */
  readonly cwd?: string;
  /** Defaults to `os.homedir()`. The test seam — production callers omit it. */
  readonly homeDir?: string;
}
```

- [ ] **Step 2: Create `errors.ts`**

Write the file `packages/workflows/src/discovery/errors.ts`:

```ts
/**
 * Discovery error classes. Raised by `findGitRoot` (and propagated through
 * `discoverWorkflows`) when no `.git` ancestor exists.
 *
 * Per-file parse/schema/validation failures are NOT thrown — they are
 * captured in `DiscoveryError` records on `DiscoveryResult.errors`.
 */

/** Thrown when `findGitRoot` reaches the filesystem root without finding `.git`. */
export class NotInGitRepoError extends Error {
  readonly code = "ENOTINGITREPO" as const;
  constructor(public readonly startDir: string) {
    super(`not in a git repository: ${startDir}`);
    this.name = "NotInGitRepoError";
  }
}
```

- [ ] **Step 3: Create the discovery module's `index.ts`**

Write the file `packages/workflows/src/discovery/index.ts`. The function exports referenced in step 3 don't exist yet — they will be added in tasks 2-4. The lines below stay commented out for this task, then get uncommented as their files land.

```ts
/**
 * Public surface of the discovery module. Re-exports the three primitives
 * + the types + the error class. Consumers (`@aiactions/runtime`,
 * `@aiactions/cli`) should import from `@aiactions/workflows` (the package
 * root), not from this file directly.
 */

export type {
  DiscoveredWorkflow,
  DiscoveryError,
  DiscoveryErrorKind,
  DiscoveryResult,
  DirLoadResult,
  DiscoverOptions,
  WorkflowOrigin,
} from "./types.ts";

export { NotInGitRepoError } from "./errors.ts";

// Function exports — added by Task 2/3/4 once the implementations land:
// export { findGitRoot } from "./find-git-root.ts";
// export { loadWorkflowsFromDir } from "./load-from-dir.ts";
// export { discoverWorkflows } from "./discover-workflows.ts";
```

- [ ] **Step 4: Wire the new module into the package root**

Modify `packages/workflows/src/index.ts`. Append one line at the bottom of the existing `export *` block:

```ts
export * from "./discovery/index.ts";
```

The full file should now end with:

```ts
export * from "./types/errors.ts";
export * from "./discovery/index.ts";
```

- [ ] **Step 5: Verify the type-only scaffold compiles**

Run from the repo root:

```bash
vp -F @aiactions/workflows check
```

Expected: exit 0, no errors. If `vp -F` is unfamiliar, the equivalent `cd packages/workflows && vp check` works too.

- [ ] **Step 6: Commit**

```bash
git add packages/workflows/src/discovery/types.ts \
        packages/workflows/src/discovery/errors.ts \
        packages/workflows/src/discovery/index.ts \
        packages/workflows/src/index.ts

git commit -m "feat(workflows): scaffold discovery module types and errors

Types-only addition for the workflow-discovery feature. Public surface:
WorkflowOrigin, DiscoveredWorkflow, DiscoveryError, DiscoveryErrorKind,
DirLoadResult, DiscoveryResult, DiscoverOptions, NotInGitRepoError.

Function exports (findGitRoot, loadWorkflowsFromDir, discoverWorkflows)
land in subsequent commits. Implements decisions D7+D8 of the spec.

Refs: docs/superpowers/specs/2026-05-09-workflow-discovery-roots-design.md
"
```

---

## Task 2: `findGitRoot` (TDD)

**Files:**
- Create: `packages/workflows/src/discovery/find-git-root.ts`
- Create: `packages/workflows/tests/discovery/fixtures.ts`
- Create: `packages/workflows/tests/discovery/find-git-root.test.ts`
- Modify: `packages/workflows/src/discovery/index.ts` (uncomment one line)

### Sub-task 2a: Test helper

- [ ] **Step 1: Create the fixtures helper**

Write the file `packages/workflows/tests/discovery/fixtures.ts`:

```ts
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
on: workflow_call
jobs:
  ping:
    runs-on: local
    steps:
      - run: echo PONG
`;

/** Workflow YAML that fails the YAML parser (unbalanced brackets). */
export const malformedYaml = (): string => `name: bad
on: { unbalanced
`;

/** Workflow YAML that parses + passes shape but fails graph validation (cycle). */
export const cycleYaml = (): string => `name: cycle
on: workflow_call
jobs:
  a:
    runs-on: local
    needs: [b]
    steps:
      - run: echo a
  b:
    runs-on: local
    needs: [a]
    steps:
      - run: echo b
`;

/** Workflow YAML that parses but fails the schema (steps + uses conflict on a step). */
export const schemaInvalidYaml = (): string => `name: bad-shape
on: workflow_call
jobs:
  ping:
    runs-on: local
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
```

- [ ] **Step 2: Verify the helper compiles**

Run from the repo root:

```bash
vp -F @aiactions/workflows check
```

Expected: exit 0.

### Sub-task 2b: `findGitRoot` TDD cycle 1 — `.git` directory case

- [ ] **Step 3: Write the failing test**

Create `packages/workflows/tests/discovery/find-git-root.test.ts`:

```ts
/**
 * Tests for `findGitRoot`. Asserts walk-up semantics, worktree (`.git` as
 * file) support, and the `NotInGitRepoError` failure mode.
 */

import { afterEach, describe, expect, test } from "vite-plus/test";
import { rm } from "node:fs/promises";

import { NotInGitRepoError } from "../../src/discovery/errors.ts";
import { findGitRoot } from "../../src/discovery/find-git-root.ts";
import { makeFakeRepo } from "./fixtures.ts";

const tmpDirsToClean: string[] = [];

afterEach(async () => {
  while (tmpDirsToClean.length > 0) {
    const dir = tmpDirsToClean.pop();
    if (dir !== undefined) {
      await rm(dir, { recursive: true, force: true });
    }
  }
});

describe("findGitRoot", () => {
  test("returns the repo root when .git is a directory at that root", async () => {
    const repo = await makeFakeRepo();
    tmpDirsToClean.push(repo.root);

    const result = await findGitRoot(repo.root);

    expect(result).toBe(repo.root);
  });
});
```

- [ ] **Step 4: Run the test and confirm it fails for the right reason**

```bash
cd packages/workflows && vp test discovery/find-git-root
```

Expected: failure with `Cannot find module '../../src/discovery/find-git-root.ts'` (the impl file does not exist yet).

- [ ] **Step 5: Implement `findGitRoot`**

Write the file `packages/workflows/src/discovery/find-git-root.ts`:

```ts
/**
 * Walk up from `startDir` until a directory containing a `.git` entry is
 * found. The entry may be a directory (regular checkout) or a file (git
 * worktree — the file is a `gitdir:` pointer to the parent's git dir).
 *
 * Throws `NotInGitRepoError` if the filesystem root is reached with no
 * match. Other I/O errors propagate (e.g. `EACCES` on a directory along
 * the way).
 */

import { stat } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";

import { NotInGitRepoError } from "./errors.ts";

export async function findGitRoot(startDir: string): Promise<string> {
  let dir = resolve(startDir);
  for (;;) {
    try {
      const s = await stat(join(dir, ".git"));
      if (s.isDirectory() || s.isFile()) return dir;
    } catch (err) {
      const e = err as NodeJS.ErrnoException;
      if (e.code !== "ENOENT") throw err;
    }
    const parent = dirname(dir);
    if (parent === dir) throw new NotInGitRepoError(startDir);
    dir = parent;
  }
}
```

- [ ] **Step 6: Run the test and confirm it passes**

```bash
cd packages/workflows && vp test discovery/find-git-root
```

Expected: 1 passed.

### Sub-task 2c: TDD cycle 2 — `.git` as file (worktree)

- [ ] **Step 7: Add the failing test**

Append inside the `describe("findGitRoot", ...)` block in `find-git-root.test.ts`:

```ts
  test("returns the repo root when .git is a *file* (worktree case)", async () => {
    const repo = await makeFakeRepo({ gitAsFile: true });
    tmpDirsToClean.push(repo.root);

    const result = await findGitRoot(repo.root);

    expect(result).toBe(repo.root);
  });
```

- [ ] **Step 8: Run the test, confirm it passes immediately**

```bash
cd packages/workflows && vp test discovery/find-git-root
```

Expected: 2 passed. The file-vs-directory branch in the implementation already handles this — the test simply locks the contract.

### Sub-task 2d: TDD cycle 3 — walk-up from a sub-directory

- [ ] **Step 9: Add the failing test**

Append inside the same `describe` block:

```ts
  test("walks up from a sub-directory to find the repo root", async () => {
    const repo = await makeFakeRepo({ nestedCwd: ["a", "b", "c"] });
    tmpDirsToClean.push(repo.root);

    const result = await findGitRoot(repo.cwd);

    expect(result).toBe(repo.root);
  });
```

- [ ] **Step 10: Run, confirm passes**

```bash
cd packages/workflows && vp test discovery/find-git-root
```

Expected: 3 passed.

### Sub-task 2e: TDD cycle 4 — `NotInGitRepoError`

- [ ] **Step 11: Add the failing test**

Append inside the same `describe` block:

```ts
  test("throws NotInGitRepoError when no .git is found up to the filesystem root", async () => {
    const repo = await makeFakeRepo({ withGit: false });
    tmpDirsToClean.push(repo.root);

    await expect(findGitRoot(repo.root)).rejects.toBeInstanceOf(NotInGitRepoError);
  });

  test("NotInGitRepoError carries the startDir and a stable code", async () => {
    const repo = await makeFakeRepo({ withGit: false });
    tmpDirsToClean.push(repo.root);

    try {
      await findGitRoot(repo.root);
      throw new Error("expected findGitRoot to throw");
    } catch (err) {
      expect(err).toBeInstanceOf(NotInGitRepoError);
      const typed = err as NotInGitRepoError;
      expect(typed.code).toBe("ENOTINGITREPO");
      expect(typed.startDir).toBe(repo.root);
    }
  });
```

- [ ] **Step 12: Run, confirm passes**

```bash
cd packages/workflows && vp test discovery/find-git-root
```

Expected: 5 passed.

### Sub-task 2f: Wire export + commit

- [ ] **Step 13: Uncomment the `findGitRoot` re-export in `discovery/index.ts`**

Change the line:

```ts
// export { findGitRoot } from "./find-git-root.ts";
```

to:

```ts
export { findGitRoot } from "./find-git-root.ts";
```

Leave the other two function exports commented out — they land in tasks 3 and 4.

- [ ] **Step 14: Run the local verification gate**

```bash
vp run ready
```

Expected: type-check + lint + recursive test + recursive build all green.

- [ ] **Step 15: Commit**

```bash
git add packages/workflows/src/discovery/find-git-root.ts \
        packages/workflows/src/discovery/index.ts \
        packages/workflows/tests/discovery/fixtures.ts \
        packages/workflows/tests/discovery/find-git-root.test.ts

git commit -m "feat(workflows): add findGitRoot with worktree-aware walk-up

Walks ancestor directories from startDir until it finds a .git entry
(directory or file — supports git worktrees). Throws NotInGitRepoError
with a stable ENOTINGITREPO code when the filesystem root is reached.

Anchors AIactions' project-root concept to git per the engineering
principle 'git as a first-class citizen'. Implements spec D6.

Refs: docs/superpowers/specs/2026-05-09-workflow-discovery-roots-design.md
"
```

---

## Task 3: `loadWorkflowsFromDir` (TDD)

**Files:**
- Create: `packages/workflows/src/discovery/load-from-dir.ts`
- Create: `packages/workflows/tests/discovery/load-from-dir.test.ts`
- Modify: `packages/workflows/src/discovery/index.ts` (uncomment one line)

### Sub-task 3a: Cycle 1 — ENOENT directory yields empty result

- [ ] **Step 1: Create the test file with the first failing test**

Create `packages/workflows/tests/discovery/load-from-dir.test.ts`:

```ts
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
});
```

- [ ] **Step 2: Run, confirm it fails for the missing module**

```bash
cd packages/workflows && vp test discovery/load-from-dir
```

Expected: failure `Cannot find module '../../src/discovery/load-from-dir.ts'`.

- [ ] **Step 3: Create the minimal implementation that handles ENOENT**

Write the file `packages/workflows/src/discovery/load-from-dir.ts`:

```ts
/**
 * Load every `*.yaml` or `*.yml` file from one directory, parse each via
 * `parseWorkflow`, and return both the successes and the per-file failures.
 *
 * - Hidden files (`.foo.yaml`) are skipped silently.
 * - Subdirectories are skipped silently — discovery is flat per spec D2.
 * - Within-root stem collisions (`review.yaml` + `review.yml`) resolve in
 *   favour of `.yaml`; the `.yml` is silently dropped (spec D3).
 * - Broken symlinks pointing at would-be-yaml targets emit an `io_error`
 *   record (spec D5).
 * - Missing directory (ENOENT on `readdir`) is a non-event: empty result.
 *   Other directory-level errors propagate to the caller.
 */

import type { Dirent } from "node:fs";
import { readdir } from "node:fs/promises";
import { join } from "node:path";

import {
  WorkflowParseError,
  WorkflowSchemaError,
  WorkflowValidationError,
} from "../types/errors.ts";
import { parseWorkflow } from "../parser/parse-workflow.ts";
import type {
  DirLoadResult,
  DiscoveredWorkflow,
  DiscoveryError,
  WorkflowOrigin,
} from "./types.ts";

interface Candidate {
  readonly stem: string;
  readonly ext: ".yaml" | ".yml";
  readonly absolutePath: string;
}

const YAML_FILENAME_RE = /^(.+)\.(yaml|yml)$/;

export async function loadWorkflowsFromDir(
  dir: string,
  origin: WorkflowOrigin,
): Promise<DirLoadResult> {
  let entries: Dirent[];
  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch (err) {
    const e = err as NodeJS.ErrnoException;
    if (e.code === "ENOENT") return { workflows: [], errors: [] };
    throw err;
  }

  // Pass 1 — classify candidates and capture broken-symlink errors.
  const winners = new Map<string, Candidate>();
  const errors: DiscoveryError[] = [];

  for (const entry of entries) {
    if (entry.name.startsWith(".")) continue;
    const m = YAML_FILENAME_RE.exec(entry.name);
    if (m === null) continue;
    const stem = m[1] as string;
    const extLower = m[2] as string;
    const ext = extLower === "yaml" ? ".yaml" : ".yml";
    const absolutePath = join(dir, entry.name);

    if (entry.isSymbolicLink() && !entry.isFile()) {
      errors.push({
        absolutePath,
        origin,
        kind: "io_error",
        message: `broken symlink: ${entry.name}`,
      });
      continue;
    }
    if (!entry.isFile()) continue;

    const existing = winners.get(stem);
    if (existing === undefined) {
      winners.set(stem, { stem, ext, absolutePath });
      continue;
    }
    // Within-root stem collision: .yaml beats .yml. Drop loser silently.
    if (existing.ext === ".yml" && ext === ".yaml") {
      winners.set(stem, { stem, ext, absolutePath });
    }
  }

  // Pass 2 — parse winners. Per-file errors are non-blocking.
  const workflows: Array<Omit<DiscoveredWorkflow, "shadowed">> = [];
  for (const c of winners.values()) {
    try {
      const workflow = await parseWorkflow(c.absolutePath);
      workflows.push({ name: c.stem, origin, absolutePath: c.absolutePath, workflow });
    } catch (err) {
      errors.push(toDiscoveryError(err, c.absolutePath, origin));
    }
  }

  return { workflows, errors };
}

function toDiscoveryError(err: unknown, absolutePath: string, origin: WorkflowOrigin): DiscoveryError {
  if (err instanceof WorkflowParseError) {
    return { absolutePath, origin, kind: "yaml_parse", message: err.message, cause: err };
  }
  if (err instanceof WorkflowSchemaError) {
    return { absolutePath, origin, kind: "schema_validation", message: err.message, cause: err };
  }
  if (err instanceof WorkflowValidationError) {
    return { absolutePath, origin, kind: "graph_validation", message: err.message, cause: err };
  }
  const message = err instanceof Error ? err.message : String(err);
  return { absolutePath, origin, kind: "io_error", message, cause: err };
}
```

- [ ] **Step 4: Run the test, confirm it passes**

```bash
cd packages/workflows && vp test discovery/load-from-dir
```

Expected: 1 passed.

### Sub-task 3b: Cycle 2 — empty directory

- [ ] **Step 5: Add the test**

Append inside the `describe("loadWorkflowsFromDir", ...)` block:

```ts
  test("empty directory returns an empty result, no error", async () => {
    const repo = await makeFakeRepo({ workflows: {} });
    tmpDirsToClean.push(repo.root);

    const result = await loadWorkflowsFromDir(repo.workflowsDir, "project");

    expect(result.workflows).toEqual([]);
    expect(result.errors).toEqual([]);
  });
```

- [ ] **Step 6: Run, confirm passes**

```bash
cd packages/workflows && vp test discovery/load-from-dir
```

Expected: 2 passed.

### Sub-task 3c: Cycle 3 — extension and visibility filters

- [ ] **Step 7: Add the test**

Append inside the same `describe`:

```ts
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
```

- [ ] **Step 8: Run, confirm passes**

```bash
cd packages/workflows && vp test discovery/load-from-dir
```

Expected: 3 passed.

### Sub-task 3d: Cycle 4 — subdirectories ignored

- [ ] **Step 9: Add the test**

Append inside the same `describe`:

```ts
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
```

- [ ] **Step 10: Run, confirm passes**

```bash
cd packages/workflows && vp test discovery/load-from-dir
```

Expected: 4 passed.

### Sub-task 3e: Cycle 5 — symlinks (valid + broken)

- [ ] **Step 11: Add the tests**

Append inside the same `describe`:

```ts
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
```

- [ ] **Step 12: Run, confirm passes**

```bash
cd packages/workflows && vp test discovery/load-from-dir
```

Expected: 6 passed.

### Sub-task 3f: Cycle 6 — error mapping

- [ ] **Step 13: Add the tests**

Append inside the same `describe`:

```ts
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
```

- [ ] **Step 14: Run, confirm passes**

```bash
cd packages/workflows && vp test discovery/load-from-dir
```

Expected: 9 passed.

### Sub-task 3g: Cycle 7 — within-root `.yaml` vs `.yml` collision

- [ ] **Step 15: Add the test**

Append inside the same `describe`:

```ts
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
```

- [ ] **Step 16: Run, confirm passes**

```bash
cd packages/workflows && vp test discovery/load-from-dir
```

Expected: 10 passed.

### Sub-task 3h: Cycle 8 — origin propagation + stem extraction

- [ ] **Step 17: Add the test**

Append inside the same `describe`:

```ts
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
```

- [ ] **Step 18: Run, confirm passes**

```bash
cd packages/workflows && vp test discovery/load-from-dir
```

Expected: 11 passed.

### Sub-task 3i: Wire export + commit

- [ ] **Step 19: Uncomment the `loadWorkflowsFromDir` re-export in `discovery/index.ts`**

Change:

```ts
// export { loadWorkflowsFromDir } from "./load-from-dir.ts";
```

to:

```ts
export { loadWorkflowsFromDir } from "./load-from-dir.ts";
```

- [ ] **Step 20: Run the local verification gate**

```bash
vp run ready
```

Expected: green.

- [ ] **Step 21: Commit**

```bash
git add packages/workflows/src/discovery/load-from-dir.ts \
        packages/workflows/src/discovery/index.ts \
        packages/workflows/tests/discovery/load-from-dir.test.ts

git commit -m "feat(workflows): add loadWorkflowsFromDir primitive

Two-pass directory loader: classify entries (skip hidden/subdir/
non-yaml), resolve within-root .yaml/.yml stem collisions in favour of
.yaml, then parse winners via parseWorkflow. Per-file errors are
non-blocking and mapped onto DiscoveryErrorKind. Broken symlinks emit
io_error. Missing directory yields empty result.

Implements spec D2 + D3 (within-root rule) + D4 + D5.

Refs: docs/superpowers/specs/2026-05-09-workflow-discovery-roots-design.md
"
```

---

## Task 4: `discoverWorkflows` orchestrator (TDD)

**Files:**
- Create: `packages/workflows/src/discovery/discover-workflows.ts`
- Create: `packages/workflows/tests/discovery/discover-workflows.test.ts`
- Modify: `packages/workflows/src/discovery/index.ts` (uncomment one line)

### Sub-task 4a: Cycle 1 — both layers empty

- [ ] **Step 1: Create the test file with the first failing test**

Create `packages/workflows/tests/discovery/discover-workflows.test.ts`:

```ts
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

import { discoverWorkflows } from "../../src/discovery/discover-workflows.ts";
import { NotInGitRepoError } from "../../src/discovery/errors.ts";
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
});
```

- [ ] **Step 2: Run, confirm it fails for the missing module**

```bash
cd packages/workflows && vp test discovery/discover-workflows
```

Expected: failure `Cannot find module '../../src/discovery/discover-workflows.ts'`.

- [ ] **Step 3: Implement `discoverWorkflows`**

Write the file `packages/workflows/src/discovery/discover-workflows.ts`:

```ts
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
import type {
  DiscoverOptions,
  DiscoveredWorkflow,
  DiscoveryResult,
} from "./types.ts";

const WORKFLOWS_SUBPATH = [".aiactions", "workflows"] as const;

export async function discoverWorkflows(opts?: DiscoverOptions): Promise<DiscoveryResult> {
  const cwd = opts?.cwd ?? process.cwd();
  const home = opts?.homeDir ?? homedir();

  const projectRoot = await findGitRoot(cwd);

  const projectDir = join(projectRoot, ...WORKFLOWS_SUBPATH);
  const homeDir = join(home, ...WORKFLOWS_SUBPATH);

  const [projectLayer, homeLayer] = await Promise.all([
    loadWorkflowsFromDir(projectDir, "project"),
    loadWorkflowsFromDir(homeDir, "home"),
  ]);

  const byName = new Map<string, DiscoveredWorkflow>();
  for (const w of homeLayer.workflows) {
    byName.set(w.name, { ...w });
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
    errors: [...projectLayer.errors, ...homeLayer.errors],
  };
}
```

- [ ] **Step 4: Run, confirm passes**

```bash
cd packages/workflows && vp test discovery/discover-workflows
```

Expected: 1 passed.

### Sub-task 4b: Cycle 2 — project-only workflows

- [ ] **Step 5: Add the test**

Append inside the `describe("discoverWorkflows", ...)` block:

```ts
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
```

- [ ] **Step 6: Run, confirm passes**

```bash
cd packages/workflows && vp test discovery/discover-workflows
```

Expected: 2 passed.

### Sub-task 4c: Cycle 3 — home-only workflows

- [ ] **Step 7: Add the test**

Append inside the same `describe`:

```ts
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
```

- [ ] **Step 8: Run, confirm passes**

```bash
cd packages/workflows && vp test discovery/discover-workflows
```

Expected: 3 passed.

### Sub-task 4d: Cycle 4 — cross-root collision

- [ ] **Step 9: Add the test**

Append inside the same `describe`:

```ts
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
```

- [ ] **Step 10: Run, confirm passes**

```bash
cd packages/workflows && vp test discovery/discover-workflows
```

Expected: 4 passed.

### Sub-task 4e: Cycle 5 — deterministic sort

- [ ] **Step 11: Add the test**

Append inside the same `describe`:

```ts
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
```

- [ ] **Step 12: Run, confirm passes**

```bash
cd packages/workflows && vp test discovery/discover-workflows
```

Expected: 5 passed.

### Sub-task 4f: Cycle 6 — `NotInGitRepoError` propagation

- [ ] **Step 13: Add the test**

Append inside the same `describe`:

```ts
  test("propagates NotInGitRepoError when cwd has no .git ancestor", async () => {
    const repo = await makeFakeRepo({ withGit: false });
    const home = await makeFakeHome();
    tmpDirsToClean.push(repo.root, home.home);

    await expect(
      discoverWorkflows({ cwd: repo.cwd, homeDir: home.home }),
    ).rejects.toBeInstanceOf(NotInGitRepoError);
  });
```

- [ ] **Step 14: Run, confirm passes**

```bash
cd packages/workflows && vp test discovery/discover-workflows
```

Expected: 6 passed.

### Sub-task 4g: Cycle 7 — error aggregation

- [ ] **Step 15: Add the test**

Append inside the same `describe`:

```ts
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
```

- [ ] **Step 16: Run, confirm passes**

```bash
cd packages/workflows && vp test discovery/discover-workflows
```

Expected: 7 passed.

### Sub-task 4h: Cycle 8 — `cwd` and `homeDir` are real test seams

- [ ] **Step 17: Add the test**

Append inside the same `describe`:

```ts
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
```

- [ ] **Step 18: Run, confirm passes**

```bash
cd packages/workflows && vp test discovery/discover-workflows
```

Expected: 9 passed.

### Sub-task 4i: Wire export + verification + commit

- [ ] **Step 19: Uncomment the `discoverWorkflows` re-export in `discovery/index.ts`**

Change:

```ts
// export { discoverWorkflows } from "./discover-workflows.ts";
```

to:

```ts
export { discoverWorkflows } from "./discover-workflows.ts";
```

- [ ] **Step 20: Run the local verification gate**

```bash
vp run ready
```

Expected: type-check + lint + recursive test + recursive build all green. This is the final gate before commit on this task.

- [ ] **Step 21: Commit**

```bash
git add packages/workflows/src/discovery/discover-workflows.ts \
        packages/workflows/src/discovery/index.ts \
        packages/workflows/tests/discovery/discover-workflows.test.ts

git commit -m "feat(workflows): add discoverWorkflows orchestrator

Resolves the project root via findGitRoot, loads <projectRoot>/.aiactions/
workflows/ and <homeDir>/.aiactions/workflows/ in parallel, and merges them
with project shadowing home. Cross-root collisions populate `shadowed` on
the surviving DiscoveredWorkflow; the library does not log — consumers
render. Final array is sorted alphabetically by name for determinism.

cwd and homeDir options on DiscoverOptions are the test seams; production
callers omit both. Implements spec D1 + D3 (cross-root rule) + D7 + D8.

Refs: docs/superpowers/specs/2026-05-09-workflow-discovery-roots-design.md
"
```

---

## Task 5: Final integration check + push

**Files:**
- No new files in this task. The full feature is now committed across tasks 1–4.

This task verifies the full surface compiles, the public API resolves through `@aiactions/workflows`, every test in the package passes, and nothing in the wider workspace regressed.

- [ ] **Step 1: Confirm the public re-exports resolve from outside the package**

Run from the repo root:

```bash
node --experimental-strip-types --eval 'import("@aiactions/workflows").then((m) => { console.log(typeof m.discoverWorkflows, typeof m.loadWorkflowsFromDir, typeof m.findGitRoot, typeof m.NotInGitRepoError); })'
```

Expected output: `function function function function`. The four public values are wired through `packages/workflows/src/index.ts` and reachable via the package name.

If that command is awkward in the host shell, the equivalent test exists implicitly: `vp run ready` exercises every workspace package, which includes type-checking the workflows package's exports.

- [ ] **Step 2: Run the full local verification gate one more time**

```bash
vp run ready
```

Expected: green across `vp check`, recursive `vp test`, recursive `vp build`. This is the same gate CI runs.

- [ ] **Step 3: Push the branch**

If the implementation has been done on a feature branch (`feat/workflow-discovery-roots` or similar):

```bash
git push -u origin HEAD
```

If, by contrast, the user's instructions for this round were "commit straight to main" (consistent with how the spec doc landed at `59e5942`), then the four commits from tasks 1-4 are already on main and only `git push origin main` is required.

The merge strategy depends on the scope of the branch:

- **Single-component PR** — only `packages/workflows/*` changed → squash-merge.
- **Multi-component PR** — additionally touches `packages/cli/*` or `packages/runtime/*` (NOT in scope for this plan; would happen in MS1.9/1.10) → `git merge --no-ff` per the collaboration protocol.

This plan stays single-component, so squash-merge is the right strategy if a PR is opened.

- [ ] **Step 4: Update muninn after merge**

Once the change is on `main`, persist a short atomic memory in vault `aiactions`:

```ts
// pseudo-call — the implementer runs this through the muninn MCP
muninn_remember({
  vault: "aiactions",
  concept: "workflow-discovery-implemented",
  type: "event",
  summary: "Workflow discovery shipped on <DATE> as <COMMITS or PR#>. Public API: discoverWorkflows + loadWorkflowsFromDir + findGitRoot in @aiactions/workflows.",
  content: "<short paragraph noting commit SHAs and that the spec at docs/superpowers/specs/2026-05-09-workflow-discovery-roots-design.md is now implemented; downstream MS1.9/1.10 consumers can adopt the API>",
  tags: ["workflow-discovery", "ms1.9", "shipped"],
});
```

- [ ] **Step 5: Run codebase-memory `detect_changes` to refresh the graph**

The repository ships with a PostToolUse hook that surfaces this reminder; running it explicitly is fine.

```bash
# Run via the codebase-memory-mcp tool; the literal command is shown for clarity.
mcp__codebase-memory-mcp__detect_changes \
  project="home-aperrix-Documents-PROJECTS-aiactions" \
  since="HEAD~5"
```

If the report shows significant structural drift (it should, since we added a new module with three exported functions and several types), follow up with:

```bash
mcp__codebase-memory-mcp__index_repository \
  repo_path="/home/aperrix/Documents/PROJECTS/aiactions" \
  mode="moderate"
```

`moderate` re-indexes structural + semantic edges without the full embedding refresh, which is sufficient for a feature of this size.

---

## Self-review (already completed by the plan author)

- **Spec coverage.** Every decision D1–D8 maps to a task: D1 + D7 + D8 (Task 1 + Task 4 wire-up), D2 (Task 3 sub-tasks 3c, 3d, 3h), D3 within-root (Task 3 sub-task 3g), D3 cross-root (Task 4 sub-task 4d), D4 (Task 3 sub-task 3f + Task 4 sub-task 4g), D5 (Task 3 sub-task 3e), D6 (Task 2 in full).
- **Placeholder scan.** No `TBD`, `TODO`, `implement later`, `add appropriate error handling`, or "similar to Task N" placeholders. Every step contains the actual code or shell command to run.
- **Type consistency.** `WorkflowOrigin`, `DiscoveredWorkflow`, `DirLoadResult`, `DiscoveryError`, `DiscoveryResult`, `DiscoverOptions`, `NotInGitRepoError`, `findGitRoot`, `loadWorkflowsFromDir`, `discoverWorkflows` — names are stable across all tasks. Function signatures match between the implementation steps and the test expectations.
- **TDD discipline.** Every behaviour is introduced via the red-green pattern (write test → run, confirm fail → minimal impl → run, confirm pass → commit at sub-task or task boundary).
- **Test seams.** No test touches `process.cwd()` or `os.homedir()`; both are overridden via `DiscoverOptions` in every `discoverWorkflows` test.
