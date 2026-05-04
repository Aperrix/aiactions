# MS1.2 — Registry Fetch from Canonical URL — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement transparent, on-demand fetching of community-contributed actions from the canonical AIactions monorepo (`https://github.com/aperrix/aiactions`). When a workflow references `uses: <ns>/<name>@<ver>` and the action is absent from the local cache, the runtime clones the slice it needs via `git sparse-checkout`, materialises it under `~/.aiactions/actions/<ns>/<name>/<ver>/`, records the resolved SHA in `<cwd>/.aiactions/lock.yaml`, and proceeds with execution as in MS1.1.

**Architecture:** New module `packages/runtime/src/runner/uses/registry-fetch.ts` exporting three pure-ish helpers (`ensureCachedAction`, `fetchActionFromCanonical`, `appendLockfileEntry`). The resolver routes `RegistryRef` through `ensureCachedAction` before the existing manifest-loading path. Default `RunOptions.registryRoot` switches from `<cwd>/actions/` (the in-monorepo dogfood path) to `~/.aiactions/actions/` (the user-level cache + private registry). Tests sandbox `~/` via `HOME` override and replace the canonical URL with a local bare git repo (`file://...`) populated by a fixture helper.

**Tech Stack:** TypeScript (strict), Vite+ (`vp`) toolchain, Vitest (via `vite-plus/test`), `node:child_process.execFile` (no shell, per `engineering-principles.md`), `node:fs/promises`, `yaml` (already a workspace dep through `@aiactions/workflows`). All `@aiactions/*` packages are source-as-exports.

---

## Repo state at plan-write time

Branch: `feat/ms1-2-registry-fetch`, one commit already landed:

1. `fc6f4c4 docs(specs): MS1.2 registry fetch from canonical URL design`

Authoritative spec: `docs/superpowers/specs/2026-05-05-ms1-2-registry-fetch-design.md`. Read it before starting.

Decision-record memories (muninn vault `aiactions`):

- `01KQTFZ34E03CNF8ZSNWCCVTPK` — canonical URL `https://github.com/aperrix/aiactions/tree/main/actions/<ns>/<name>`.
- `01KQTFYRSQ465T64V9647WG571` — single-tier trust model (PR review = trust gate).
- `01KQT6XCNN2W830PQ1C7MM9XE1` — registry layout `actions/<ns>/<name>/`.

## File structure (target end-of-plan)

**Created:**

- `packages/runtime/src/runner/uses/registry-fetch.ts` — `ensureCachedAction`, `fetchActionFromCanonical`, `appendLockfileEntry`, related types.
- `packages/runtime/tests/runner-uses-registry-fetch-lockfile.test.ts` — unit tests for `appendLockfileEntry`.
- `packages/runtime/tests/runner-uses-registry-fetch-fetch.test.ts` — unit tests for `fetchActionFromCanonical` (uses bare-repo fixture).
- `packages/runtime/tests/runner-uses-registry-fetch.test.ts` — unit tests for `ensureCachedAction` (cache hit / miss).
- `packages/runtime/tests/fixtures/registry/make-bare-repo.ts` — test helper that creates a populated bare git repo at a temp path.
- `packages/runtime/tests/runner-uses-registry-integration.test.ts` — end-to-end through `runWorkflow`.

**Modified:**

- `packages/runtime/src/runner/uses/resolver.ts` — `resolveUsesRef` for `RegistryRef` now calls `ensureCachedAction`. Adds `cwd?: string` to `ResolverContext` for lockfile path.
- `packages/runtime/src/runner/uses/index.ts` — re-export the new module.
- `packages/runtime/src/runner/job.ts` — propagate `request.cwd` into the resolver context (was previously only used as default working dir).
- `packages/runtime/src/run-workflow.ts:159` — default `registryRoot` changes from `<cwd>/actions/` to `~/.aiactions/actions/`.
- `packages/runtime/tests/runner-uses.test.ts` — existing tests use `LocalRef` only, no behaviour change expected; verify suite still green.

**Out of scope (deferred to MS1.3+):**

- CLI `aiactions actions install <ref>` (full MS1.3 own milestone — scaffolds the CLI package).
- Lockfile read-back / SHA verification at run start.
- Cache GC / pruning command.
- SemVer constraint solving.
- Mirror / private registry override.
- Parallel-fetch deduplication (concurrent fetches of the same ref both run; rename race accepted).

## How to run tests

```bash
cd /home/aperrix/Documents/PROJECTS/aiactions/packages/runtime
vp test                                                         # all runtime tests
vp test runner-uses-registry-fetch-fetch                        # one file by substring
vp test runner-uses-registry-fetch -t "cache hit"               # one test by name
```

Full pre-commit gate from repo root: `vp run ready` (= `bun run gen:schemas && vp check && vp run -r test`).

## How to commit

You are on `feat/ms1-2-registry-fetch`. Conventional Commits, one commit per task on the branch (squash-merge at end of plan). Never `git clean -fd`. Never use `--no-verify`.

```bash
git add <files>
git commit -m "$(cat <<'EOF'
<type>(<scope>): <subject>

<optional body>

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

After every commit, run `mcp__codebase-memory-mcp__detect_changes(project: "home-aperrix-Documents-PROJECTS-aiactions", since: "HEAD~1")` per `.claude/rules/codebase-memory.md`.

---

## Task 1: Bare-repo fixture helper

**Files:**

- Create: `packages/runtime/tests/fixtures/registry/make-bare-repo.ts`
- Test: `packages/runtime/tests/fixtures/registry/make-bare-repo.test.ts` (smoke)

The fixture helper builds a real bare git repo in `tmpdir()` populated with one or more `actions/<ns>/<name>/aiaction.yaml` files at a given tag. Subsequent tasks point `fetchActionFromCanonical` at `file://<bare-repo-path>` to exercise the git plumbing end-to-end without touching the network.

- [ ] **Step 1: Write the smoke test for the fixture helper**

Create `packages/runtime/tests/fixtures/registry/make-bare-repo.test.ts`:

```typescript
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
      manifest:
        "name: lint\ndescription: lint things\nruns:\n  using: bun-module\n  main: index.mjs\n",
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
```

- [ ] **Step 2: Run the smoke test to verify it fails**

Run: `cd packages/runtime && vp test fixtures/registry/make-bare-repo`
Expected: FAIL with "Cannot find module './make-bare-repo.ts'".

- [ ] **Step 3: Implement the fixture helper**

Create `packages/runtime/tests/fixtures/registry/make-bare-repo.ts`:

```typescript
/**
 * Build a bare git repo on disk populated with `actions/<ns>/<name>/`
 * files and tagged at the supplied ref. Returns the absolute path to
 * the bare repo (suitable for `file://` URLs in `git clone`).
 *
 * Used by the registry-fetch tests to exercise the real git plumbing
 * without touching the network or `github.com`.
 */

import { execFile } from "node:child_process";
import { mkdir, mkdtemp, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { promisify } from "node:util";

const pExecFile = promisify(execFile);

/** Caller input for `makeBareRepoWithAction`. */
export interface MakeBareRepoOptions {
  /** Existing parent directory that holds the new fixture; the helper
   * creates `<cwd>/work-<random>/` and `<cwd>/repo.git/` underneath. */
  readonly cwd: string;
  /** `<ns>` segment of the action coordinate. */
  readonly namespace: string;
  /** `<name>` segment of the action coordinate. */
  readonly name: string;
  /** Git tag to point at the populated commit. Used as `--branch` in tests. */
  readonly tag: string;
  /** Contents of `actions/<ns>/<name>/aiaction.yaml`. */
  readonly manifest: string;
  /** Additional files inside `actions/<ns>/<name>/`, keyed by relative path. */
  readonly sources: Readonly<Record<string, string>>;
}

const run = async (cwd: string, ...args: string[]): Promise<void> => {
  await pExecFile("git", args, { cwd });
};

/**
 * Create a populated bare repo and return its absolute path.
 *
 * Layout produced (under `options.cwd`):
 * - `work-<random>/` — working tree used to author the commit.
 * - `repo.git/`      — bare repo to be cloned via `file://`.
 *
 * The bare repo has `uploadpack.allowFilter=true` set so that
 * `git clone --filter=blob:none ...` works against it locally.
 */
export async function makeBareRepoWithAction(options: MakeBareRepoOptions): Promise<string> {
  const work = await mkdtemp(join(options.cwd, "work-"));
  const actionDir = join(work, "actions", options.namespace, options.name);
  await mkdir(actionDir, { recursive: true });
  await writeFile(join(actionDir, "aiaction.yaml"), options.manifest, "utf8");
  for (const [rel, content] of Object.entries(options.sources)) {
    const target = join(actionDir, rel);
    await mkdir(join(target, ".."), { recursive: true });
    await writeFile(target, content, "utf8");
  }

  await run(work, "init", "-b", "main");
  await run(work, "config", "user.email", "fixture@aiactions.local");
  await run(work, "config", "user.name", "AIactions Fixture");
  await run(work, "add", ".");
  await run(work, "commit", "-m", `add ${options.namespace}/${options.name}`);
  await run(work, "tag", options.tag);

  const bareRepo = join(options.cwd, "repo.git");
  await pExecFile("git", ["clone", "--bare", work, bareRepo]);
  await pExecFile("git", ["-C", bareRepo, "config", "uploadpack.allowFilter", "true"]);

  return bareRepo;
}
```

Add a top-level `tmpdir` re-export for caller convenience? No — caller already uses `node:os.tmpdir()`. Skip.

- [ ] **Step 4: Run the smoke test to verify it passes**

Run: `cd packages/runtime && vp test fixtures/registry/make-bare-repo`
Expected: PASS (1 test).

- [ ] **Step 5: Commit**

```bash
git add packages/runtime/tests/fixtures/registry/
git commit -m "$(cat <<'EOF'
test(runtime): add bare-repo fixture helper for registry-fetch tests (MS1.2)

makeBareRepoWithAction builds a real bare git repo populated with an
actions/<ns>/<name>/ tree and tagged at the declared ref. Subsequent
registry-fetch tests use it to exercise the git sparse-checkout
plumbing end-to-end without network access or a github.com round-trip.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

After commit, run `mcp__codebase-memory-mcp__detect_changes(project: "home-aperrix-Documents-PROJECTS-aiactions", since: "HEAD~1")`.

---

## Task 2: `appendLockfileEntry`

**Files:**

- Create: `packages/runtime/src/runner/uses/registry-fetch.ts` (initial — only the lockfile helper for now)
- Test: `packages/runtime/tests/runner-uses-registry-fetch-lockfile.test.ts`

Pure-ish function. Reads `<cwd>/.aiactions/lock.yaml` if present, merges/overwrites the entry for `<ns>/<name>@<ver>`, writes back. No git, no network. TDD it standalone.

- [ ] **Step 1: Write failing tests for `appendLockfileEntry`**

Create `packages/runtime/tests/runner-uses-registry-fetch-lockfile.test.ts`:

```typescript
/**
 * Tests for `appendLockfileEntry` — atomic upsert into
 * <cwd>/.aiactions/lock.yaml. Pure I/O, no git involved.
 */

import { mkdtemp, readFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { describe, expect, test } from "vite-plus/test";

import { appendLockfileEntry } from "../src/runner/uses/registry-fetch.ts";

const POSIX = process.platform !== "win32";

describe.skipIf(!POSIX)("appendLockfileEntry", () => {
  test("creates the lockfile when missing", async () => {
    const cwd = await mkdtemp(join(tmpdir(), "aiactions-lockfile-"));
    await appendLockfileEntry({
      cwd,
      ref: { namespace: "aperrix", name: "lint", version: "v1.0.0" },
      resolvedSha: "0000000000000000000000000000000000000001",
      fetchedAt: new Date("2026-05-05T10:00:00.000Z"),
    });

    const content = await readFile(join(cwd, ".aiactions", "lock.yaml"), "utf8");
    expect(content).toContain("aperrix/lint@v1.0.0:");
    expect(content).toContain("resolved-sha: '0000000000000000000000000000000000000001'");
    expect(content).toContain("fetched-at: '2026-05-05T10:00:00.000Z'");
  });

  test("merges into an existing lockfile, preserving prior entries", async () => {
    const cwd = await mkdtemp(join(tmpdir(), "aiactions-lockfile-"));
    await appendLockfileEntry({
      cwd,
      ref: { namespace: "aperrix", name: "lint", version: "v1.0.0" },
      resolvedSha: "1111111111111111111111111111111111111111",
      fetchedAt: new Date("2026-05-05T10:00:00.000Z"),
    });
    await appendLockfileEntry({
      cwd,
      ref: { namespace: "octocat", name: "format", version: "main" },
      resolvedSha: "2222222222222222222222222222222222222222",
      fetchedAt: new Date("2026-05-05T10:01:00.000Z"),
    });

    const content = await readFile(join(cwd, ".aiactions", "lock.yaml"), "utf8");
    expect(content).toContain("aperrix/lint@v1.0.0:");
    expect(content).toContain("octocat/format@main:");
    expect(content).toContain("1111111111111111111111111111111111111111");
    expect(content).toContain("2222222222222222222222222222222222222222");
  });

  test("overwrites the entry for the same ref", async () => {
    const cwd = await mkdtemp(join(tmpdir(), "aiactions-lockfile-"));
    await appendLockfileEntry({
      cwd,
      ref: { namespace: "aperrix", name: "lint", version: "v1.0.0" },
      resolvedSha: "3333333333333333333333333333333333333333",
      fetchedAt: new Date("2026-05-05T10:00:00.000Z"),
    });
    await appendLockfileEntry({
      cwd,
      ref: { namespace: "aperrix", name: "lint", version: "v1.0.0" },
      resolvedSha: "4444444444444444444444444444444444444444",
      fetchedAt: new Date("2026-05-05T11:00:00.000Z"),
    });

    const content = await readFile(join(cwd, ".aiactions", "lock.yaml"), "utf8");
    expect(content).toContain("4444444444444444444444444444444444444444");
    expect(content).not.toContain("3333333333333333333333333333333333333333");
  });
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `cd packages/runtime && vp test runner-uses-registry-fetch-lockfile`
Expected: FAIL with "Cannot find module '../src/runner/uses/registry-fetch.ts'".

- [ ] **Step 3: Implement `appendLockfileEntry`**

Create `packages/runtime/src/runner/uses/registry-fetch.ts`:

```typescript
/**
 * Registry-fetch primitives — fetch an action from the canonical
 * AIactions monorepo via `git sparse-checkout`, cache it under
 * `~/.aiactions/actions/<ns>/<name>/<ver>/`, and record the resolved
 * SHA in `<cwd>/.aiactions/lock.yaml`.
 *
 * Public surface (built incrementally over MS1.2 plan tasks):
 * - `appendLockfileEntry` — write-only lockfile upsert (Task 2).
 * - `fetchActionFromCanonical` — the git plumbing (Task 3).
 * - `ensureCachedAction` — existence-first cache + delegating fetch (Task 4).
 */

import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";

import { parse as parseYaml, stringify as stringifyYaml } from "yaml";

/** Coordinate fragment shared by all entry points. */
export interface RegistryCoordinate {
  readonly namespace: string;
  readonly name: string;
  readonly version: string;
}

const lockfileRelativePath = (cwd: string): string => join(cwd, ".aiactions", "lock.yaml");

interface LockfileShape {
  actions?: Record<string, { "resolved-sha": string; "fetched-at": string }>;
}

/** Caller input for `appendLockfileEntry`. */
export interface AppendLockfileEntryRequest {
  /** Workflow working directory; lockfile lives at `<cwd>/.aiactions/lock.yaml`. */
  readonly cwd: string;
  /** Action coordinate. */
  readonly ref: RegistryCoordinate;
  /** Resolved git SHA (40 lowercase hex chars). */
  readonly resolvedSha: string;
  /** Timestamp recorded under `fetched-at`. */
  readonly fetchedAt: Date;
}

/**
 * Upsert an entry into `<cwd>/.aiactions/lock.yaml`. Creates the file
 * (and the parent `.aiactions/` directory) when missing. Existing
 * unrelated entries are preserved; an entry for the same ref is
 * overwritten.
 *
 * The serialised entry quotes the SHA and timestamp string-style to keep
 * YAML 1.2's number-coercion rules from biting later (`v1.0.0` could
 * otherwise be parsed as a float depending on the parser configuration).
 */
export async function appendLockfileEntry(request: AppendLockfileEntryRequest): Promise<void> {
  const path = lockfileRelativePath(request.cwd);
  const dir = dirname(path);
  await mkdir(dir, { recursive: true });

  let parsed: LockfileShape = {};
  try {
    const raw = await readFile(path, "utf8");
    parsed = (parseYaml(raw) as LockfileShape | null) ?? {};
  } catch (err) {
    const errno = (err as NodeJS.ErrnoException).code;
    if (errno !== "ENOENT") throw err;
  }

  const key = `${request.ref.namespace}/${request.ref.name}@${request.ref.version}`;
  const actions = parsed.actions ?? {};
  actions[key] = {
    "resolved-sha": request.resolvedSha,
    "fetched-at": request.fetchedAt.toISOString(),
  };

  const sortedActions: Record<string, { "resolved-sha": string; "fetched-at": string }> = {};
  for (const k of Object.keys(actions).sort()) {
    sortedActions[k] = actions[k]!;
  }

  const next: LockfileShape = { actions: sortedActions };
  const yamlOut = stringifyYaml(next, { defaultStringType: "QUOTE_SINGLE" });
  await writeFile(path, yamlOut, "utf8");
}
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `cd packages/runtime && vp test runner-uses-registry-fetch-lockfile`
Expected: PASS (3 tests).

- [ ] **Step 5: Run the full suite to confirm no regression**

Run: `cd packages/runtime && vp test`
Expected: all existing tests pass + 3 new.

- [ ] **Step 6: Commit**

```bash
git add packages/runtime/src/runner/uses/registry-fetch.ts \
        packages/runtime/tests/runner-uses-registry-fetch-lockfile.test.ts
git commit -m "$(cat <<'EOF'
feat(runtime): scaffold registry-fetch module + appendLockfileEntry (MS1.2)

Adds packages/runtime/src/runner/uses/registry-fetch.ts with the
write-only lockfile helper. The helper upserts entries into
<cwd>/.aiactions/lock.yaml, preserving prior entries and overwriting
the same ref's row. Keys are sorted alphabetically to keep diffs
minimal across runs.

Subsequent tasks add fetchActionFromCanonical and ensureCachedAction.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

After commit, run `mcp__codebase-memory-mcp__detect_changes`.

---

## Task 3: `fetchActionFromCanonical`

**Files:**

- Modify: `packages/runtime/src/runner/uses/registry-fetch.ts` (add the fetch function)
- Test: `packages/runtime/tests/runner-uses-registry-fetch-fetch.test.ts`

Performs the git sparse-checkout dance and atomically moves the materialised slice into the cache path. Returns the resolved SHA (40 hex chars).

- [ ] **Step 1: Write failing tests for `fetchActionFromCanonical`**

Create `packages/runtime/tests/runner-uses-registry-fetch-fetch.test.ts`:

```typescript
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
      tag: "v1.0.0",
      manifest:
        "name: lint\ndescription: lint things\nruns:\n  using: bun-module\n  main: index.mjs\n",
      sources: { "index.mjs": "export default async () => {};\n" },
    });

    const registryRoot = join(work, "registry");
    const sha = await fetchActionFromCanonical(
      { namespace: "octocat", name: "lint", version: "v1.0.0" },
      registryRoot,
      { canonicalUrl: `file://${bareRepo}`, tmpRoot: join(work, "tmp") },
    );

    expect(sha).toMatch(/^[0-9a-f]{40}$/);
    const manifestPath = join(registryRoot, "octocat", "lint", "v1.0.0", "aiaction.yaml");
    const manifest = await readFile(manifestPath, "utf8");
    expect(manifest).toContain("name: lint");
  });

  test("surfaces git stderr on unknown ref", async () => {
    const work = await mkdtemp(join(tmpdir(), "aiactions-fetch-"));
    const bareRepo = await makeBareRepoWithAction({
      cwd: work,
      namespace: "octocat",
      name: "lint",
      tag: "v1.0.0",
      manifest: "name: lint\ndescription: x\nruns:\n  using: bun-module\n  main: index.mjs\n",
      sources: { "index.mjs": "export default async () => {};\n" },
    });

    const registryRoot = join(work, "registry");
    await expect(
      fetchActionFromCanonical(
        { namespace: "octocat", name: "lint", version: "v9.9.9-does-not-exist" },
        registryRoot,
        { canonicalUrl: `file://${bareRepo}`, tmpRoot: join(work, "tmp") },
      ),
    ).rejects.toThrow(/v9\.9\.9-does-not-exist/);
  });

  test("does not leave a partial directory at the cache path on failure", async () => {
    const work = await mkdtemp(join(tmpdir(), "aiactions-fetch-"));
    const bareRepo = await makeBareRepoWithAction({
      cwd: work,
      namespace: "octocat",
      name: "lint",
      tag: "v1.0.0",
      manifest: "name: lint\ndescription: x\nruns:\n  using: bun-module\n  main: index.mjs\n",
      sources: { "index.mjs": "export default async () => {};\n" },
    });

    const registryRoot = join(work, "registry");
    await expect(
      fetchActionFromCanonical(
        { namespace: "octocat", name: "lint", version: "v9.9.9-does-not-exist" },
        registryRoot,
        { canonicalUrl: `file://${bareRepo}`, tmpRoot: join(work, "tmp") },
      ),
    ).rejects.toBeDefined();

    await expect(
      stat(join(registryRoot, "octocat", "lint", "v9.9.9-does-not-exist")),
    ).rejects.toMatchObject({ code: "ENOENT" });
  });
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `cd packages/runtime && vp test runner-uses-registry-fetch-fetch`
Expected: FAIL because `fetchActionFromCanonical` is not exported yet.

- [ ] **Step 3: Implement `fetchActionFromCanonical`**

Update the imports at the top of `packages/runtime/src/runner/uses/registry-fetch.ts` so the file looks like this (Task 2's import block is replaced; the rest of Task 2's code is preserved verbatim below the import block):

```typescript
import { execFile } from "node:child_process";
import { mkdir, mkdtemp, readFile, rename, rm, stat, writeFile } from "node:fs/promises";
import { tmpdir as osTmpdir } from "node:os";
import { dirname, join } from "node:path";
import { promisify } from "node:util";

import { parse as parseYaml, stringify as stringifyYaml } from "yaml";

import { ActionResolutionError } from "../../types/errors.ts";

const pExecFile = promisify(execFile);
```

Then append the new function after `appendLockfileEntry`:

```typescript
/** Optional knobs for `fetchActionFromCanonical`. */
export interface FetchActionFromCanonicalOptions {
  /** Override the canonical URL (tests inject `file://...`). Defaults
   * to `https://github.com/aperrix/aiactions`. */
  readonly canonicalUrl?: string;
  /** Parent directory used for the throwaway clone. Defaults to
   * `os.tmpdir()`. */
  readonly tmpRoot?: string;
}

const DEFAULT_CANONICAL_URL = "https://github.com/aperrix/aiactions";

/**
 * Clone a slice of the canonical monorepo, materialise the action under
 * `<registryRoot>/<ns>/<name>/<ver>/`, and return the resolved SHA.
 *
 * Behaviour:
 * - `git clone --filter=blob:none --sparse --depth 1 --branch <ver>` into a
 *   per-call tmp directory.
 * - `git sparse-checkout set actions/<ns>/<name>` to materialise only the
 *   target slice.
 * - Read SHA via `git rev-parse HEAD`.
 * - Atomically rename `<tmp>/actions/<ns>/<name>` → `<registryRoot>/<ns>/<name>/<ver>`.
 * - Best-effort `rm -rf <tmp>` on success and on failure.
 *
 * @throws {ActionResolutionError} when git fails (unknown ref, network
 *   unreachable, action path missing in the cloned slice).
 */
export async function fetchActionFromCanonical(
  ref: RegistryCoordinate,
  registryRoot: string,
  options: FetchActionFromCanonicalOptions = {},
): Promise<string> {
  const canonicalUrl = options.canonicalUrl ?? DEFAULT_CANONICAL_URL;
  const tmpRoot = options.tmpRoot ?? osTmpdir();
  await mkdir(tmpRoot, { recursive: true });
  const tmp = await mkdtemp(join(tmpRoot, "aiactions-fetch-"));
  const repoDir = join(tmp, "_repo");

  try {
    try {
      await pExecFile("git", [
        "clone",
        "--filter=blob:none",
        "--sparse",
        "--depth",
        "1",
        "--branch",
        ref.version,
        canonicalUrl,
        repoDir,
      ]);
    } catch (err) {
      const stderr = (err as { stderr?: string }).stderr ?? String(err);
      throw new ActionResolutionError(
        `git clone failed for '${ref.namespace}/${ref.name}@${ref.version}' from '${canonicalUrl}': ${stderr.trim()}`,
        { cause: err as Error },
      );
    }

    try {
      await pExecFile("git", [
        "-C",
        repoDir,
        "sparse-checkout",
        "set",
        `actions/${ref.namespace}/${ref.name}`,
      ]);
    } catch (err) {
      const stderr = (err as { stderr?: string }).stderr ?? String(err);
      throw new ActionResolutionError(
        `git sparse-checkout failed for '${ref.namespace}/${ref.name}@${ref.version}': ${stderr.trim()}`,
        { cause: err as Error },
      );
    }

    const sourceActionDir = join(repoDir, "actions", ref.namespace, ref.name);
    try {
      const s = await stat(sourceActionDir);
      if (!s.isDirectory()) {
        throw new ActionResolutionError(
          `action path 'actions/${ref.namespace}/${ref.name}' is not a directory at ref '${ref.version}'`,
        );
      }
    } catch (err) {
      const errno = (err as NodeJS.ErrnoException).code;
      if (errno === "ENOENT") {
        throw new ActionResolutionError(
          `action path 'actions/${ref.namespace}/${ref.name}' not found at ref '${ref.version}' under '${canonicalUrl}'`,
        );
      }
      throw err;
    }

    let revParse: { stdout: string };
    try {
      revParse = await pExecFile("git", ["-C", repoDir, "rev-parse", "HEAD"]);
    } catch (err) {
      const stderr = (err as { stderr?: string }).stderr ?? String(err);
      throw new ActionResolutionError(
        `git rev-parse HEAD failed after cloning '${ref.namespace}/${ref.name}@${ref.version}': ${stderr.trim()}`,
        { cause: err as Error },
      );
    }
    const resolvedSha = revParse.stdout.trim();

    const targetParent = join(registryRoot, ref.namespace, ref.name);
    await mkdir(targetParent, { recursive: true });
    const targetDir = join(targetParent, ref.version);
    await rename(sourceActionDir, targetDir);

    return resolvedSha;
  } finally {
    await rm(tmp, { recursive: true, force: true });
  }
}
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `cd packages/runtime && vp test runner-uses-registry-fetch-fetch`
Expected: PASS (3 tests).

- [ ] **Step 5: Run the full suite**

Run: `cd packages/runtime && vp test`
Expected: all green (existing + 3 new).

- [ ] **Step 6: Commit**

```bash
git add packages/runtime/src/runner/uses/registry-fetch.ts \
        packages/runtime/tests/runner-uses-registry-fetch-fetch.test.ts
git commit -m "$(cat <<'EOF'
feat(runtime): add fetchActionFromCanonical via git sparse-checkout (MS1.2)

Implements the registry-fetch core: clone --filter=blob:none --sparse
--depth 1 --branch <ver> from the canonical URL into a tmp dir,
sparse-checkout actions/<ns>/<name>, atomic rename into
<registryRoot>/<ns>/<name>/<ver>/. Returns the resolved SHA.

All git invocations go through execFileAsync (no shell). Failure paths
surface git's stderr verbatim wrapped in ActionResolutionError. The
tmp directory is removed on both success and failure paths so an
interrupted fetch never leaves partial state visible at the cache
path (atomic rename guarantees that final move is all-or-nothing).

Tests build a populated bare repo via makeBareRepoWithAction and use
file:// URLs to keep CI off the network.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

After commit, run `mcp__codebase-memory-mcp__detect_changes`.

---

## Task 4: `ensureCachedAction`

**Files:**

- Modify: `packages/runtime/src/runner/uses/registry-fetch.ts` (add the orchestrator)
- Test: `packages/runtime/tests/runner-uses-registry-fetch.test.ts`

`ensureCachedAction` orchestrates the existence-first cache lookup, delegates to `fetchActionFromCanonical` on miss, writes the lockfile entry on fetch.

- [ ] **Step 1: Write failing tests for `ensureCachedAction`**

Create `packages/runtime/tests/runner-uses-registry-fetch.test.ts`:

```typescript
/**
 * Tests for `ensureCachedAction` — orchestrates existence-first cache
 * + delegates to fetchActionFromCanonical on miss + writes the
 * lockfile entry post-fetch.
 */

import { mkdir, mkdtemp, readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { describe, expect, test } from "vite-plus/test";

import { ensureCachedAction } from "../src/runner/uses/registry-fetch.ts";

import { makeBareRepoWithAction } from "./fixtures/registry/make-bare-repo.ts";

const POSIX = process.platform !== "win32";

describe.skipIf(!POSIX)("ensureCachedAction", () => {
  test("returns the cache path immediately on hit, without fetching", async () => {
    const work = await mkdtemp(join(tmpdir(), "aiactions-ensure-"));
    const registryRoot = join(work, "registry");
    const cwd = join(work, "project");
    await mkdir(cwd, { recursive: true });

    const cachedDir = join(registryRoot, "user", "tool", "1.0.0");
    await mkdir(cachedDir, { recursive: true });
    await writeFile(
      join(cachedDir, "aiaction.yaml"),
      "name: tool\ndescription: x\nruns:\n  using: bun-module\n  main: index.mjs\n",
      "utf8",
    );

    const result = await ensureCachedAction(
      { namespace: "user", name: "tool", version: "1.0.0" },
      registryRoot,
      cwd,
      { canonicalUrl: "file:///does-not-exist", tmpRoot: join(work, "tmp") },
    );

    expect(result.dir).toBe(cachedDir);
    expect(result.fetched).toBe(false);
    expect(result.resolvedSha).toBeNull();
  });

  test("fetches on cache miss and writes the lockfile", async () => {
    const work = await mkdtemp(join(tmpdir(), "aiactions-ensure-"));
    const registryRoot = join(work, "registry");
    const cwd = join(work, "project");
    await mkdir(cwd, { recursive: true });

    const bareRepo = await makeBareRepoWithAction({
      cwd: work,
      namespace: "octocat",
      name: "lint",
      tag: "v1.0.0",
      manifest: "name: lint\ndescription: x\nruns:\n  using: bun-module\n  main: index.mjs\n",
      sources: { "index.mjs": "export default async () => {};\n" },
    });

    const result = await ensureCachedAction(
      { namespace: "octocat", name: "lint", version: "v1.0.0" },
      registryRoot,
      cwd,
      { canonicalUrl: `file://${bareRepo}`, tmpRoot: join(work, "tmp") },
    );

    expect(result.dir).toBe(join(registryRoot, "octocat", "lint", "v1.0.0"));
    expect(result.fetched).toBe(true);
    expect(result.resolvedSha).toMatch(/^[0-9a-f]{40}$/);

    const lock = await readFile(join(cwd, ".aiactions", "lock.yaml"), "utf8");
    expect(lock).toContain("octocat/lint@v1.0.0:");
    expect(lock).toContain(result.resolvedSha!);
  });

  test("does not overwrite an existing user-placed cache entry", async () => {
    const work = await mkdtemp(join(tmpdir(), "aiactions-ensure-"));
    const registryRoot = join(work, "registry");
    const cwd = join(work, "project");
    await mkdir(cwd, { recursive: true });

    const cachedDir = join(registryRoot, "myorg", "internal", "2.0.0");
    await mkdir(cachedDir, { recursive: true });
    await writeFile(
      join(cachedDir, "aiaction.yaml"),
      "name: internal\ndescription: user-private\nruns:\n  using: bun-module\n  main: index.mjs\n",
      "utf8",
    );
    await writeFile(join(cachedDir, "marker"), "user-placed\n", "utf8");

    await ensureCachedAction(
      { namespace: "myorg", name: "internal", version: "2.0.0" },
      registryRoot,
      cwd,
      { canonicalUrl: "file:///does-not-exist", tmpRoot: join(work, "tmp") },
    );

    const marker = await readFile(join(cachedDir, "marker"), "utf8");
    expect(marker.trim()).toBe("user-placed");
  });
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `cd packages/runtime && vp test runner-uses-registry-fetch -t "ensureCachedAction"`
Expected: FAIL because `ensureCachedAction` is not exported yet.

- [ ] **Step 3: Implement `ensureCachedAction`**

Add to `packages/runtime/src/runner/uses/registry-fetch.ts` after `fetchActionFromCanonical`:

```typescript
/** Result of `ensureCachedAction`. */
export interface EnsureCachedActionResult {
  /** Absolute path to `<registryRoot>/<ns>/<name>/<ver>/`. */
  readonly dir: string;
  /** Whether a fetch was performed (true) or the cache was already populated (false). */
  readonly fetched: boolean;
  /** Resolved git SHA when `fetched` is true; `null` otherwise. */
  readonly resolvedSha: string | null;
}

/** Optional knobs forwarded to `fetchActionFromCanonical` (test injection). */
export interface EnsureCachedActionOptions extends FetchActionFromCanonicalOptions {
  /** Clock injected for the lockfile timestamp. Defaults to `() => new Date()`. */
  readonly now?: () => Date;
}

/**
 * Existence-first cache lookup. If `<registryRoot>/<ns>/<name>/<ver>/`
 * exists, returns it as-is (no fetch, no lockfile write — the entry was
 * either user-placed or fetched on a prior run).
 *
 * On cache miss, delegates to `fetchActionFromCanonical`, then writes a
 * lockfile entry recording the resolved SHA and the wall-clock timestamp.
 *
 * @throws {ActionResolutionError} when the fetch path fails. The cache
 *   path is left untouched (atomic rename guarantee).
 */
export async function ensureCachedAction(
  ref: RegistryCoordinate,
  registryRoot: string,
  cwd: string,
  options: EnsureCachedActionOptions = {},
): Promise<EnsureCachedActionResult> {
  const targetDir = join(registryRoot, ref.namespace, ref.name, ref.version);

  try {
    const s = await stat(targetDir);
    if (s.isDirectory()) {
      return { dir: targetDir, fetched: false, resolvedSha: null };
    }
  } catch (err) {
    const errno = (err as NodeJS.ErrnoException).code;
    if (errno !== "ENOENT") throw err;
  }

  const resolvedSha = await fetchActionFromCanonical(ref, registryRoot, options);
  const fetchedAt = options.now ? options.now() : new Date();
  await appendLockfileEntry({ cwd, ref, resolvedSha, fetchedAt });

  return { dir: targetDir, fetched: true, resolvedSha };
}
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `cd packages/runtime && vp test runner-uses-registry-fetch`
Expected: PASS (the 3 new `ensureCachedAction` tests + the prior `fetchActionFromCanonical` and lockfile tests are unaffected).

- [ ] **Step 5: Commit**

```bash
git add packages/runtime/src/runner/uses/registry-fetch.ts \
        packages/runtime/tests/runner-uses-registry-fetch.test.ts
git commit -m "$(cat <<'EOF'
feat(runtime): orchestrate existence-first cache + lockfile (MS1.2)

ensureCachedAction returns the cache path immediately on hit (no
fetch, no lockfile write — the entry is either user-placed or was
fetched on a prior run) and delegates to fetchActionFromCanonical
on miss. After a successful fetch, the resolved SHA is recorded in
<cwd>/.aiactions/lock.yaml via appendLockfileEntry.

Existence-first preserves user-placed actions: a workflow author
can drop a private/draft action under the cache path with the same
<ns>/<name>/<ver>/ coordinate and the runtime will use it instead
of attempting to clone from the canonical URL.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

After commit, run `mcp__codebase-memory-mcp__detect_changes`.

---

## Task 5: Resolver wire-in

**Files:**

- Modify: `packages/runtime/src/runner/uses/resolver.ts:48-55, 80-86, 103-115`
- Modify: `packages/runtime/src/runner/uses/index.ts`
- Modify: `packages/runtime/src/runner/job.ts` (propagate `cwd` into resolver context)

The resolver currently calls `resolveRegistryDir` to compute the path and then `isDirectory` to assert existence. Replace those two steps with a call to `ensureCachedAction`.

- [ ] **Step 1: Add a failing integration test that exercises the wire-in via `runWorkflow`**

Create `packages/runtime/tests/runner-uses-registry-integration.test.ts`:

```typescript
/**
 * End-to-end test: a workflow using a registry ref triggers a fetch
 * from a local bare repo and the action runs successfully.
 */

import { mkdir, mkdtemp, readFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { workflowSchema } from "@aiactions/workflows";
import { describe, expect, test } from "vite-plus/test";

import { runWorkflow } from "../src/run-workflow.ts";

import { makeBareRepoWithAction } from "./fixtures/registry/make-bare-repo.ts";

const POSIX = process.platform !== "win32";
const parseWorkflow = (input: unknown) => workflowSchema.parse(input);

describe.skipIf(!POSIX)("runWorkflow — registry fetch end-to-end", () => {
  test("registry ref triggers fetch + caches + runs", async () => {
    const work = await mkdtemp(join(tmpdir(), "aiactions-int-"));
    const cwd = join(work, "project");
    await mkdir(cwd, { recursive: true });
    const registryRoot = join(work, "registry");

    const bareRepo = await makeBareRepoWithAction({
      cwd: work,
      namespace: "octocat",
      name: "echo",
      tag: "v1.0.0",
      manifest:
        "name: echo\ndescription: echo a value\ninputs:\n  message:\n    description: text to echo\noutputs:\n  echoed:\n    description: the same text\nruns:\n  using: bun-module\n  main: index.mjs\n",
      sources: {
        "index.mjs":
          "import { writeFileSync } from 'node:fs';\nexport default async ({ inputs, fd3 }) => { writeFileSync(fd3, JSON.stringify({ kind: 'output', name: 'echoed', value: inputs.message }) + '\\n'); };\n",
      },
    });

    const workflow = parseWorkflow({
      name: "registry-int",
      jobs: {
        one: {
          steps: [
            {
              id: "echoer",
              uses: "octocat/echo@v1.0.0",
              with: { message: "hello" },
            },
            {
              run: 'echo "received=${{ steps.echoer.outputs.echoed }}"',
            },
          ],
        },
      },
    });

    const result = await runWorkflow(workflow, {
      cwd,
      registryRoot,
      registryFetch: { canonicalUrl: `file://${bareRepo}`, tmpRoot: join(work, "tmp") },
    });

    expect(result.status).toBe("succeeded");
    expect(result.jobs.one?.steps[1]?.stdout).toContain("received=hello");

    const lock = await readFile(join(cwd, ".aiactions", "lock.yaml"), "utf8");
    expect(lock).toContain("octocat/echo@v1.0.0");
  });
});
```

This test references a `registryFetch` field on `RunOptions` that does not yet exist; the schema/type addition is part of Step 3.

- [ ] **Step 2: Run the test to verify it fails**

Run: `cd packages/runtime && vp test runner-uses-registry-integration`
Expected: FAIL — TypeScript will object to the unknown `registryFetch` field; even if cast away, the resolver still uses the old non-fetching path and will fail at the cache-miss directory check.

- [ ] **Step 3: Extend `RunOptions` and `JobRunRequest` to carry the fetch config**

Open `packages/runtime/src/types/options.ts`. Append a field to `RunOptions`:

```typescript
/** Optional knobs for the registry-fetch path. Tests inject
 *  `canonicalUrl: file://...` to keep CI off the network; production
 *  callers leave it unset and the fetcher targets the canonical URL. */
readonly registryFetch?: {
  readonly canonicalUrl?: string;
  readonly tmpRoot?: string;
};
```

(Insert it right after the existing `registryRoot` declaration.)

Open `packages/runtime/src/runner/job.ts`. Add the same shape to `JobRunRequest` (insert next to the existing `registryRoot` field):

```typescript
readonly registryFetch?: {
  readonly canonicalUrl?: string;
  readonly tmpRoot?: string;
};
```

Open `packages/runtime/src/run-workflow.ts`. In the `runJob({...})` call, thread the new field:

```typescript
const jobResult = await runJob({
  job,
  jobId,
  runId,
  cwd: options.cwd,
  workflowEnv,
  inputs,
  signal: options.signal,
  emit: onEvent,
  workflowFile: options.workflowFile,
  registryRoot: options.registryRoot ?? `${options.cwd.replace(/[\\/]+$/, "")}/actions`,
  bashAvailable,
  workflowDefaults: workflow.defaults?.run,
  ...(options.registryFetch !== undefined && { registryFetch: options.registryFetch }),
});
```

(The default for `registryRoot` is changed in Task 6 — leave it pointing at the old value for now to keep this task small.)

- [ ] **Step 4: Add `cwd` and the fetch config to `ResolverContext`, then route registry refs through `ensureCachedAction`**

Open `packages/runtime/src/runner/uses/resolver.ts`. Extend `ResolverContext`:

```typescript
export interface ResolverContext {
  readonly workflowFile?: string;
  readonly registryRoot?: string;
  /** Workflow working directory. Required when the resolver may need
   *  to write the lockfile (i.e. for registry refs). */
  readonly cwd?: string;
  /** Test-injection knobs forwarded to `ensureCachedAction`. */
  readonly registryFetch?: {
    readonly canonicalUrl?: string;
    readonly tmpRoot?: string;
  };
}
```

Replace the body of `resolveUsesRef` so the registry branch goes through `ensureCachedAction` and reads the manifest from the resulting `dir`:

```typescript
import { ensureCachedAction } from "./registry-fetch.ts";
// ... keep existing imports ...

export async function resolveUsesRef(ref: UsesRef, ctx: ResolverContext): Promise<ResolvedAction> {
  let dir: string;
  if (ref.kind === RefKind.local) {
    dir = resolveLocalDir(ref, ctx.workflowFile);
    if (!(await isDirectory(dir))) {
      throw new ActionResolutionError(`action directory not found for ref '${ref.raw}': ${dir}`);
    }
  } else {
    if (ctx.registryRoot === undefined) {
      throw new ActionResolutionError(
        `registry ref '${ref.raw}' requires options.registryRoot to be set`,
      );
    }
    if (ctx.cwd === undefined) {
      throw new ActionResolutionError(
        `registry ref '${ref.raw}' requires options.cwd to be set (for the lockfile path)`,
      );
    }
    const result = await ensureCachedAction(ref, ctx.registryRoot, ctx.cwd, ctx.registryFetch);
    dir = result.dir;
  }

  const manifestPath = join(dir, "aiaction.yaml");
  let manifest: ActionManifest;
  try {
    manifest = await parseActionManifest(manifestPath);
  } catch (err) {
    if (err instanceof WorkflowError) {
      throw new ActionManifestError(
        `failed to load manifest for ref '${ref.raw}': ${err.message}`,
        { cause: err },
      );
    }
    throw err;
  }

  if (manifest.runs.using !== "bun-module") {
    const using = manifest.runs.using as string;
    throw new RuntimeUnsupportedError(
      `runs.using '${using}' for ref '${ref.raw}' is not yet implemented (MS1.1 supports 'bun-module' only)`,
    );
  }

  return { manifest, dir };
}
```

Remove the now-dead `resolveRegistryDir` helper at the top of the file (lines that previously defined it).

Open `packages/runtime/src/runner/uses/index.ts` and add a re-export:

```typescript
export * from "./registry-fetch.ts";
```

- [ ] **Step 5: Update `runJob` to thread `cwd` + the fetch config into the resolver context**

Open `packages/runtime/src/runner/job.ts`. Inside `runJob`, locate the existing call:

```typescript
const resolved = await resolveUsesRef(step.uses, {
  workflowFile: request.workflowFile,
  registryRoot: request.registryRoot,
});
```

Replace it with:

```typescript
const resolved = await resolveUsesRef(step.uses, {
  workflowFile: request.workflowFile,
  registryRoot: request.registryRoot,
  cwd: request.cwd,
  ...(request.registryFetch !== undefined && { registryFetch: request.registryFetch }),
});
```

- [ ] **Step 6: Run the full integration test**

Run: `cd packages/runtime && vp test runner-uses-registry-integration`
Expected: PASS (1 new test).

- [ ] **Step 7: Run the full suite**

Run: `cd packages/runtime && vp test`
Expected: all green.

- [ ] **Step 8: Commit**

```bash
git add packages/runtime/src/types/options.ts \
        packages/runtime/src/run-workflow.ts \
        packages/runtime/src/runner/job.ts \
        packages/runtime/src/runner/uses/resolver.ts \
        packages/runtime/src/runner/uses/index.ts \
        packages/runtime/tests/runner-uses-registry-integration.test.ts
git commit -m "$(cat <<'EOF'
feat(runtime): wire ensureCachedAction into the resolver path (MS1.2)

resolveUsesRef for RegistryRef now goes through ensureCachedAction:
existence-first cache lookup, lazy fetch on miss, lockfile write
post-fetch. The path is computed inside ensureCachedAction; the dead
resolveRegistryDir helper is removed.

RunOptions and JobRunRequest gain an optional `registryFetch` field
(`{ canonicalUrl, tmpRoot }`) used by tests to point the fetcher at a
local bare repo. Production callers leave it unset and the fetcher
targets https://github.com/aperrix/aiactions.

ResolverContext gains `cwd` and `registryFetch` so the resolver can
write the lockfile and tests can inject the fetch URL without
modifying the public RunOptions surface beyond what end-users need.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

After commit, run `mcp__codebase-memory-mcp__detect_changes`.

---

## Task 6: Default `registryRoot` change

**Files:**

- Modify: `packages/runtime/src/run-workflow.ts:159`
- Modify: any existing test that depended on the old default

The current default `registryRoot` is `<cwd>/actions/` (the in-monorepo dogfood layout). Switch it to `~/.aiactions/actions/` (user-level cache + private registry).

- [ ] **Step 1: Confirm no existing test depends on the old default**

Run: `grep -rn 'registryRoot' packages/runtime/tests/ packages/runtime/src/`
Expected: every test that exercises a registry ref already supplies `registryRoot` explicitly. The integration test from Task 5 supplies it. The MS1.1 `runner-uses.test.ts` factories use `LocalRef` only and never read `registryRoot`. If grep surfaces a test that relies on the old default, add an explicit `registryRoot` argument to that test before continuing.

- [ ] **Step 2: Switch the default**

Open `packages/runtime/src/run-workflow.ts`. At the top, add the imports:

```typescript
import { homedir } from "node:os";
import { join } from "node:path";
```

(Skip whichever is already imported.)

Locate the `runJob` call and replace the `registryRoot` default:

```typescript
// before
registryRoot: options.registryRoot ?? `${options.cwd.replace(/[\\/]+$/, "")}/actions`,

// after
registryRoot: options.registryRoot ?? join(homedir(), ".aiactions", "actions"),
```

- [ ] **Step 3: Run the full suite**

Run: `cd packages/runtime && vp test`
Expected: all green. If anything fails because it relied on `<cwd>/actions/` being the default, supply an explicit `registryRoot` in that test and re-run.

- [ ] **Step 4: Run the recursive suite from repo root**

Run: `cd /home/aperrix/Documents/PROJECTS/aiactions && vp run -r test`
Expected: workflows + runtime suites all green.

- [ ] **Step 5: Commit**

```bash
git add packages/runtime/src/run-workflow.ts
git commit -m "$(cat <<'EOF'
feat(runtime): default registryRoot to ~/.aiactions/actions (MS1.2)

Switches the default registry root from <cwd>/actions/ (in-monorepo
dogfood layout) to <homedir>/.aiactions/actions/ (user-level cache +
private registry). Production callers no longer need to think about
where actions live; the fetcher populates the default location on
demand and user-private actions can be dropped under the same prefix.

Tests and dogfood workflows that need the old in-monorepo layout
continue to pass an explicit `registryRoot` via RunOptions.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

After commit, run `mcp__codebase-memory-mcp__detect_changes`.

---

## Task 7: Sandboxed integration test for the default lookup path

**Files:**

- Modify: `packages/runtime/tests/runner-uses-registry-integration.test.ts` (add a second test that exercises the default lookup path with `HOME` overridden)

We already exercised `RunOptions.registryRoot` override in Task 5. Now exercise the default code path: when no `registryRoot` is supplied, the runtime resolves to `~/.aiactions/actions/`. Sandbox `~/` via the `HOME` env var so the test does not pollute the developer's real home.

- [ ] **Step 1: Add the failing test**

Open `packages/runtime/tests/runner-uses-registry-integration.test.ts` and append:

```typescript
test("default registryRoot is ~/.aiactions/actions (HOME override)", async () => {
  const work = await mkdtemp(join(tmpdir(), "aiactions-int-default-"));
  const fakeHome = join(work, "home");
  await mkdir(fakeHome, { recursive: true });
  const cwd = join(work, "project");
  await mkdir(cwd, { recursive: true });

  const bareRepo = await makeBareRepoWithAction({
    cwd: work,
    namespace: "octocat",
    name: "noop",
    tag: "v1.0.0",
    manifest: "name: noop\ndescription: x\nruns:\n  using: bun-module\n  main: index.mjs\n",
    sources: { "index.mjs": "export default async () => {};\n" },
  });

  const previousHome = process.env.HOME;
  process.env.HOME = fakeHome;
  try {
    const workflow = parseWorkflow({
      name: "default-registry",
      jobs: {
        one: {
          steps: [
            {
              uses: "octocat/noop@v1.0.0",
            },
          ],
        },
      },
    });

    const result = await runWorkflow(workflow, {
      cwd,
      registryFetch: { canonicalUrl: `file://${bareRepo}`, tmpRoot: join(work, "tmp") },
    });

    expect(result.status).toBe("succeeded");
    const cachedManifest = await readFile(
      join(fakeHome, ".aiactions", "actions", "octocat", "noop", "v1.0.0", "aiaction.yaml"),
      "utf8",
    );
    expect(cachedManifest).toContain("name: noop");
  } finally {
    if (previousHome === undefined) delete process.env.HOME;
    else process.env.HOME = previousHome;
  }
});
```

- [ ] **Step 2: Run the test to verify it passes**

Run: `cd packages/runtime && vp test runner-uses-registry-integration -t "default registryRoot"`
Expected: PASS (1 new test). The default-`registryRoot` change in Task 6 already wires the homedir default; this test just exercises the path.

- [ ] **Step 3: Run the full suite**

Run: `cd packages/runtime && vp test`
Expected: all green.

- [ ] **Step 4: Commit**

```bash
git add packages/runtime/tests/runner-uses-registry-integration.test.ts
git commit -m "$(cat <<'EOF'
test(runtime): cover the default registryRoot lookup path (MS1.2)

Adds a second integration test that overrides HOME to a sandboxed
fake home, omits RunOptions.registryRoot, and asserts the fetcher
materialises the action under <fakeHome>/.aiactions/actions/. Locks
in the new default introduced in the prior commit.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

After commit, run `mcp__codebase-memory-mcp__detect_changes`.

---

## Task 8: full verification + squash-merge + memory close

**Files:**

- Run: `vp run ready`
- Squash-merge `feat/ms1-2-registry-fetch` onto `main`
- Update muninn vault `aiactions` with `ms1-2-shipped` memory

- [ ] **Step 1: Run the full pre-commit gate**

Run: `cd /home/aperrix/Documents/PROJECTS/aiactions && vp run ready`
Expected: PASS — `bun run gen:schemas && vp check && vp run -r test` all green.

- [ ] **Step 2: Confirm branch state vs main**

Run: `git log --oneline main..feat/ms1-2-registry-fetch`
Expected: 8 commits — 1 docs(specs), 1 test(runtime) for the fixture, 3 feat(runtime) for the helpers + wire-in, 1 feat(runtime) for the default change, 1 test(runtime) for the default-path coverage. (Plus this final task's commit if anything else is added.)

- [ ] **Step 3: Squash-merge onto main**

```bash
git checkout main
git merge --squash feat/ms1-2-registry-fetch
git commit -m "$(cat <<'EOF'
feat(runtime): registry fetch from canonical URL (MS1.2)

Fetches community-contributed actions on demand from the canonical
AIactions monorepo (https://github.com/aperrix/aiactions) via
`git clone --filter=blob:none --sparse --depth 1 --branch <ver>`,
caches them under ~/.aiactions/actions/<ns>/<name>/<ver>/, and
records the resolved SHA in <cwd>/.aiactions/lock.yaml. Existence-
first lookup means user-placed actions at the same coordinate are
preserved (cache + private registry cohabit under the same prefix).

Six locked decisions (see
docs/superpowers/specs/2026-05-05-ms1-2-registry-fetch-design.md):
- D1. Single user-level dir (cache + private cohabit, never overwrite).
- D2. Resolver lookup: RunOptions.registryRoot override → default.
- D3. Fetch via git sparse-checkout (--filter=blob:none --depth 1).
- D4. <ver> is opaque; verbatim to git --branch.
- D5. Write-only lockfile in v1; read-back deferred.
- D6. Errors surface verbatim — no silent fallback.

Tests sandbox ~/ via HOME override and replace the canonical URL
with a local bare git repo (file://) populated by a fixture helper.
CI runs entirely offline.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

- [ ] **Step 4: Run the recursive test suite from main**

Run: `vp run ready`
Expected: PASS.

- [ ] **Step 5: Refresh codebase-memory**

Run: `mcp__codebase-memory-mcp__detect_changes(project: "home-aperrix-Documents-PROJECTS-aiactions", since: "HEAD~1")`. If the report shows "significant structural drift" (more than ~10 files modified at the symbol level), follow up with `mcp__codebase-memory-mcp__index_repository(repo_path: "/home/aperrix/Documents/PROJECTS/aiactions", mode: "moderate")`.

- [ ] **Step 6: Persist the milestone-closing memory in MuninnDB**

Save a single atomic `decision`-typed memory in vault `aiactions`:

- `concept`: `ms1-2-shipped`
- `summary`: One sentence — what shipped, on what commit, on what date.
- `content`: Full breakdown — what shipped (existence-first cache, lazy fetch, write-only lockfile, default registryRoot homedir), key decisions D1–D6, tests added, open follow-ups for MS1.3 (CLI bootstrap + `aiactions actions install`).
- `tags`: `["ms1.2", "runtime", "registry", "fetch", "shipped"]`
- `entities`: list any new modules / files that future sessions will need to find (`registry-fetch.ts`, lockfile path, fixture helper).

Use `mcp__muninn__muninn_remember` with `vault: "aiactions"`.

- [ ] **Step 7: Verify branch is fully merged before deletion**

```bash
git diff main feat/ms1-2-registry-fetch
```

Expected: empty diff — content is identical (squash gives a different SHA but the same tree).

- [ ] **Step 8: Delete the feature branch**

If the diff above was empty, delete with `-D` (squash-merge produces a different commit SHA so `-d` will refuse):

```bash
git branch -D feat/ms1-2-registry-fetch
```

If the diff was non-empty, **stop and investigate** before forcing — the squash did not capture all the work.

---

## Final verification checklist

Before declaring the milestone shipped, confirm each of the following:

- [ ] `vp run ready` is green from a clean checkout of `main` after the squash-merge.
- [ ] `mcp__codebase-memory-mcp__detect_changes` for `home-aperrix-Documents-PROJECTS-aiactions` returns no unexpected drift.
- [ ] The design doc lives at `docs/superpowers/specs/2026-05-05-ms1-2-registry-fetch-design.md` and is referenced from the squash commit message.
- [ ] muninn vault `aiactions` contains `ms1-2-shipped` and references the squash-merge commit hash.
- [ ] A run of the integration tests with `--reporter=verbose` confirms both the override-path and the default-`registryRoot` path execute the fetcher.
- [ ] `~/.aiactions/actions/` is **not** present on the developer's machine after the test suite (HOME override sandbox prevents pollution).
