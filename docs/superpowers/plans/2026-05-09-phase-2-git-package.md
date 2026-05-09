# Phase 2 — `@aiactions/git` Package Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create `@aiactions/git` — single-responsibility wrapper around the four `git` invocations the runtime currently issues — and migrate `packages/runtime/src/runner/uses/registry-fetch.ts` to consume it. No public-API breaking change to runtime; behavioural parity preserved.

**Architecture:** Phase 2 of the 6-phase architecture restructure documented in `docs/superpowers/specs/2026-05-09-architecture-restructure-design.md` (section 7.8). Standalone leaf package (no internal deps), stdlib only. The four primitives chosen (`gitExec`, `cloneSparseShallow`, `sparseCheckoutSet`, `lsRemoteTags`, `revParseHead`) reflect actual usage today; spec-listed `createWorktree`/`removeWorktree`/`fetchTag`/`listBranches`/`cloneRepo` are deferred per YAGNI until a real consumer arrives (likely Phase X — `@aiactions/isolation`).

**Tech Stack:** TypeScript (strict + verbatimModuleSyntax + isolatedModules), `node:child_process` only, Vite+ test runner, ESM-only.

---

## File Structure

| File | Responsibility |
|---|---|
| `packages/git/package.json` | Package manifest, ESM, no runtime deps |
| `packages/git/tsconfig.json` | TS config matching existing packages |
| `packages/git/vite.config.ts` | Vite+ test/lint config |
| `packages/git/src/exec.ts` | `gitExec(args, opts)` — low-level wrapper around `execFile("git", ...)`. Source of all `GitError` instances. |
| `packages/git/src/repo.ts` | `cloneSparseShallow`, `sparseCheckoutSet`, `lsRemoteTags`, `revParseHead` — high-level helpers reflecting real usage |
| `packages/git/src/errors.ts` | `GitError` class — wraps a failed `git` invocation with `args`, `stderr`, `code`, `cause` |
| `packages/git/src/index.ts` | Public API barrel re-export |
| `packages/git/tests/exec.test.ts` | Tests `gitExec` happy path, error path, `GitError` shape |
| `packages/git/tests/repo.test.ts` | Tests four helpers using a bare-repo fixture |
| `packages/git/tests/fixtures/make-bare-repo.ts` | Local copy of the bare-repo fixture used in runtime tests (will not delete the existing copies in `runtime/tests/` and `cli/tests/` — those migrate in a later phase) |
| **Modified files** | |
| `packages/runtime/package.json` | Adds `@aiactions/git: workspace:*` dep |
| `packages/runtime/src/runner/uses/registry-fetch.ts` | Replaces 4 `pExecFile("git", ...)` calls with `@aiactions/git` helpers. Drops `import { execFile } from "node:child_process"` and the local `pExecFile = promisify(execFile)` declaration. |

No deletions in this phase.

---

## Task 1: Bootstrap package skeleton

**Files:**
- Create: `packages/git/package.json`
- Create: `packages/git/tsconfig.json`
- Create: `packages/git/vite.config.ts`
- Create: `packages/git/src/index.ts` (empty placeholder)

- [ ] **Step 1: Create directory tree**

```bash
mkdir -p packages/git/src packages/git/tests/fixtures
```

- [ ] **Step 2: Write `packages/git/package.json`**

```json
{
  "name": "@aiactions/git",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "exports": {
    ".": "./src/index.ts",
    "./package.json": "./package.json"
  },
  "scripts": {
    "test": "vp test",
    "check": "vp check"
  }
}
```

- [ ] **Step 3: Write `packages/git/tsconfig.json`** (identical to `packages/paths/tsconfig.json`)

```json
{
  "compilerOptions": {
    "target": "esnext",
    "lib": ["es2023"],
    "moduleDetection": "force",
    "module": "nodenext",
    "moduleResolution": "nodenext",
    "resolveJsonModule": true,
    "types": ["node"],
    "strict": true,
    "noUnusedLocals": true,
    "declaration": true,
    "noEmit": true,
    "allowImportingTsExtensions": true,
    "esModuleInterop": true,
    "isolatedModules": true,
    "verbatimModuleSyntax": true,
    "skipLibCheck": true
  }
}
```

- [ ] **Step 4: Write `packages/git/vite.config.ts`**

```ts
import { defineConfig } from "vite-plus";

export default defineConfig({
  lint: {
    options: {
      typeAware: true,
      typeCheck: true,
    },
  },
  fmt: {},
});
```

- [ ] **Step 5: Write empty `packages/git/src/index.ts`**

```ts
// Public API barrel — populated by subsequent tasks.
export {};
```

- [ ] **Step 6: Register package in workspace**

```bash
vp install --ignore-scripts
```

(`--ignore-scripts` skips the project-root postinstall — `lefthook install` fails inside worktrees because of `core.hooksPath` shared with the parent repo. The bun install itself still completes.)

NOTE — bun-isolated worktree quirk: per-package `node_modules/@types/node` symlinks may not be created. After `vp install`, fix any missing or stale ones across the four affected packages:

```bash
for pkg in cli runtime workflows paths git; do
  mkdir -p packages/$pkg/node_modules/@types
  ln -sf ../../../../node_modules/.bun/@types+node@22.19.17/node_modules/@types/node packages/$pkg/node_modules/@types/node
done
```

(Adjust the version `@22.19.17` if a different version is in `node_modules/.bun/`.)

- [ ] **Step 7: Verify the package compiles in isolation**

```bash
cd packages/git && vp check
```

Expected: PASS.

- [ ] **Step 8: Commit**

```bash
git add packages/git
git commit -m "$(cat <<'EOF'
feat(git): scaffold @aiactions/git package

Empty skeleton (package.json, tsconfig, vite.config, src/index.ts).
Subsequent commits implement exec, repo helpers, errors.

Refs: docs/superpowers/specs/2026-05-09-architecture-restructure-design.md
Refs: docs/superpowers/plans/2026-05-09-phase-2-git-package.md

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 2: Implement `errors.ts` + `exec.ts` (TDD)

The two files ship together because `gitExec` raises `GitError` directly — a separate task for `errors.ts` would force a placeholder export that has no consumer.

**Files:**
- Create: `packages/git/src/errors.ts`
- Create: `packages/git/src/exec.ts`
- Test: `packages/git/tests/exec.test.ts`

- [ ] **Step 1: Write the failing test**

Create `packages/git/tests/exec.test.ts`:

```ts
import { describe, expect, test } from "vite-plus/test";

import { GitError } from "../src/errors.ts";
import { gitExec } from "../src/exec.ts";

describe("gitExec", () => {
  test("returns stdout and stderr on success", async () => {
    const result = await gitExec(["--version"]);

    expect(result.stdout.startsWith("git version ")).toBe(true);
    expect(result.stderr).toBe("");
  });

  test("respects cwd option", async () => {
    const result = await gitExec(["rev-parse", "--is-inside-work-tree"], { cwd: process.cwd() });

    expect(result.stdout.trim()).toBe("true");
  });

  test("throws GitError when git exits non-zero", async () => {
    await expect(gitExec(["this-is-not-a-real-subcommand"])).rejects.toBeInstanceOf(GitError);
  });

  test("GitError captures args, stderr, exit code, and cause", async () => {
    let captured: GitError | undefined;
    try {
      await gitExec(["this-is-not-a-real-subcommand"]);
    } catch (err) {
      captured = err as GitError;
    }

    expect(captured).toBeInstanceOf(GitError);
    expect(captured?.args).toEqual(["this-is-not-a-real-subcommand"]);
    expect(captured?.stderr.length).toBeGreaterThan(0);
    expect(typeof captured?.code).toBe("number");
    expect(captured?.cause).toBeInstanceOf(Error);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
cd packages/git && vp test exec
```

Expected: FAIL — `Cannot find module "../src/errors.ts"` or `Cannot find module "../src/exec.ts"`.

- [ ] **Step 3: Write `packages/git/src/errors.ts`**

```ts
/** Thrown when a `git` invocation exits non-zero. Captures the failed
 * command's args, captured stderr, exit code, and the original error
 * (chained via `cause` for stack-trace continuity). */
export class GitError extends Error {
  readonly args: readonly string[];
  readonly stderr: string;
  readonly code: number;

  constructor(message: string, init: { args: readonly string[]; stderr: string; code: number; cause: Error }) {
    super(message, { cause: init.cause });
    this.name = "GitError";
    this.args = init.args;
    this.stderr = init.stderr;
    this.code = init.code;
  }
}
```

- [ ] **Step 4: Write `packages/git/src/exec.ts`**

```ts
/**
 * Low-level `git` invocation. All higher-level helpers in this package
 * funnel through `gitExec`; consumers wanting raw access can call it
 * directly when no helper exists.
 *
 * Captures stdout/stderr in memory. `git` is invoked via `execFile`
 * (argv array, no shell) for safety against argument injection.
 */

import { execFile } from "node:child_process";
import { promisify } from "node:util";

import { GitError } from "./errors.ts";

const pExecFile = promisify(execFile);

export interface GitExecOptions {
  /** Working directory for the spawned process. Defaults to current cwd. */
  readonly cwd?: string;
}

export interface GitExecResult {
  readonly stdout: string;
  readonly stderr: string;
}

export async function gitExec(args: readonly string[], options: GitExecOptions = {}): Promise<GitExecResult> {
  try {
    const result = await pExecFile("git", args, options.cwd !== undefined ? { cwd: options.cwd } : {});
    return { stdout: result.stdout.toString(), stderr: result.stderr.toString() };
  } catch (err) {
    const e = err as Error & { stderr?: string | Buffer; code?: number };
    const stderr = e.stderr !== undefined ? e.stderr.toString() : "";
    const code = typeof e.code === "number" ? e.code : 1;
    throw new GitError(`git ${args.join(" ")} exited ${code}: ${stderr.trim()}`, {
      args,
      stderr,
      code,
      cause: e,
    });
  }
}
```

- [ ] **Step 5: Run tests to verify they pass**

```bash
cd packages/git && vp test exec
```

Expected: PASS — 4 tests green.

- [ ] **Step 6: Commit**

```bash
git add packages/git/src/errors.ts packages/git/src/exec.ts packages/git/tests/exec.test.ts
git commit -m "$(cat <<'EOF'
feat(git): add gitExec + GitError

Low-level wrapper around execFile("git", ...). Captures stdout/stderr.
Raises typed GitError on non-zero exit with args, stderr, exit code,
and chained cause.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 3: Add bare-repo fixture (test infrastructure)

Copy the existing fixture into the git package so its tests run independently. Existing copies in `runtime/tests/fixtures/registry/` and `cli/tests/fixtures/` stay — DRY rule of three is satisfied at three but a generalised location belongs to a later phase.

**Files:**
- Create: `packages/git/tests/fixtures/make-bare-repo.ts`

- [ ] **Step 1: Copy the fixture**

The source-of-truth is `packages/runtime/tests/fixtures/registry/make-bare-repo.ts`. Copy it byte-for-byte into `packages/git/tests/fixtures/make-bare-repo.ts`.

```bash
cp packages/runtime/tests/fixtures/registry/make-bare-repo.ts packages/git/tests/fixtures/make-bare-repo.ts
```

- [ ] **Step 2: Verify lint clean**

```bash
cd packages/git && vp check
```

Expected: PASS. The fixture imports `node:child_process`, `node:fs/promises`, `node:path`, `node:util` — all stdlib, no extra deps.

- [ ] **Step 3: Commit**

```bash
git add packages/git/tests/fixtures/make-bare-repo.ts
git commit -m "$(cat <<'EOF'
test(git): vendor make-bare-repo fixture

Copied from packages/runtime/tests/fixtures/registry/make-bare-repo.ts
verbatim. Keeps the git package's tests self-contained. The other two
copies (runtime, cli) remain — a single source of truth is a later
cleanup once all consumers exist.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 4: Implement `repo.ts` (TDD)

Four high-level helpers reflecting actual usage in `registry-fetch.ts`. Each delegates to `gitExec`.

**Files:**
- Create: `packages/git/src/repo.ts`
- Test: `packages/git/tests/repo.test.ts`

- [ ] **Step 1: Write the failing test**

Create `packages/git/tests/repo.test.ts`:

```ts
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
```

- [ ] **Step 2: Run test to verify it fails**

```bash
cd packages/git && vp test repo
```

Expected: FAIL — `Cannot find module "../src/repo.ts"`.

- [ ] **Step 3: Write minimal implementation**

Create `packages/git/src/repo.ts`:

```ts
/**
 * Higher-level helpers wrapping common git operations. Each delegates
 * to `gitExec` and surfaces typed `GitError` on failure.
 *
 * The set is deliberately minimal — it covers exactly what the runtime
 * already does today (`registry-fetch.ts`). New helpers should be added
 * only when a real consumer arrives (YAGNI).
 */

import { gitExec } from "./exec.ts";

export interface CloneSparseShallowOptions {
  /** Remote URL (`file://...` for tests, `https://...` for prod). */
  readonly url: string;
  /** Tag or branch to check out. Passed to `git clone --branch`. */
  readonly branch: string;
  /** Local destination directory (must not already exist). */
  readonly dest: string;
  /** Optional `--filter` value (e.g. `"blob:none"`). */
  readonly filter?: string;
}

/**
 * `git clone --filter=<filter> --sparse --depth 1 --branch <branch> <url> <dest>`.
 * Throws `GitError` on failure.
 */
export async function cloneSparseShallow(options: CloneSparseShallowOptions): Promise<void> {
  const args: string[] = ["clone"];
  if (options.filter !== undefined) {
    args.push(`--filter=${options.filter}`);
  }
  args.push("--sparse", "--depth", "1", "--branch", options.branch, options.url, options.dest);
  await gitExec(args);
}

/**
 * `git -C <repoDir> sparse-checkout set <paths...>`. Throws `GitError`
 * on failure.
 */
export async function sparseCheckoutSet(repoDir: string, paths: readonly string[]): Promise<void> {
  await gitExec(["-C", repoDir, "sparse-checkout", "set", ...paths]);
}

/**
 * `git ls-remote --tags <url>`. Returns the raw tab-separated stdout —
 * caller parses tag refs from it. Throws `GitError` on failure.
 */
export async function lsRemoteTags(url: string): Promise<string> {
  const { stdout } = await gitExec(["ls-remote", "--tags", url]);
  return stdout;
}

/**
 * `git -C <repoDir> rev-parse HEAD`. Returns the resolved SHA, trimmed.
 * Throws `GitError` on failure.
 */
export async function revParseHead(repoDir: string): Promise<string> {
  const { stdout } = await gitExec(["-C", repoDir, "rev-parse", "HEAD"]);
  return stdout.trim();
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
cd packages/git && vp test repo
```

Expected: PASS — 6 tests green.

- [ ] **Step 5: Commit**

```bash
git add packages/git/src/repo.ts packages/git/tests/repo.test.ts
git commit -m "$(cat <<'EOF'
feat(git): add cloneSparseShallow, sparseCheckoutSet, lsRemoteTags, revParseHead

Four high-level helpers wrapping the four git invocations the runtime
makes today. Each delegates to gitExec and surfaces GitError on
failure. Tests use the bare-repo fixture vendored in Task 3.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 5: Wire public API barrel

**Files:**
- Modify: `packages/git/src/index.ts`

- [ ] **Step 1: Replace `index.ts` with the full barrel**

```ts
export * from "./errors.ts";
export * from "./exec.ts";
export * from "./repo.ts";
```

- [ ] **Step 2: Verify package builds clean**

```bash
cd packages/git && vp check && vp test
```

Expected: lint+type-check PASS, all 10 tests green (4 exec + 6 repo).

- [ ] **Step 3: Commit**

```bash
git add packages/git/src/index.ts
git commit -m "$(cat <<'EOF'
feat(git): wire public API barrel

Re-exports errors, exec, repo. Package ready for consumers.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 6: Declare `@aiactions/git` as a runtime dep

**Files:**
- Modify: `packages/runtime/package.json`

- [ ] **Step 1: Add the dep**

Open `packages/runtime/package.json`. Add `"@aiactions/git": "workspace:*"` to the `dependencies` map (preserve alphabetical order).

- [ ] **Step 2: Re-resolve workspace symlinks**

```bash
vp install --ignore-scripts
```

NOTE: re-run the `@types/node` symlink fix from Task 1 step 6 if any per-package symlink got cleared.

- [ ] **Step 3: Smoke-check the import resolves**

```bash
cd packages/runtime && vp check
```

Expected: PASS (no source changes yet).

- [ ] **Step 4: Commit**

```bash
git add packages/runtime/package.json
git commit -m "$(cat <<'EOF'
chore(runtime): declare @aiactions/git workspace dep

Prepares for the registry-fetch migration in the next commit.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 7: Migrate `registry-fetch.ts` to consume `@aiactions/git`

**File:**
- Modify: `packages/runtime/src/runner/uses/registry-fetch.ts`

The four `pExecFile("git", ...)` invocations live at lines ~58, ~144, ~164, ~199 (line numbers may shift slightly between commits — anchor on the surrounding context). Each is replaced with the corresponding `@aiactions/git` helper.

- [ ] **Step 1: Replace the imports**

At the top of `registry-fetch.ts`, drop the `child_process` + `promisify` imports and the `pExecFile` declaration. Add the `@aiactions/git` import.

Remove:

```ts
import { execFile } from "node:child_process";
// ... (other imports may still be needed)
import { promisify } from "node:util";

const pExecFile = promisify(execFile);
```

Add (alongside the existing imports):

```ts
import { cloneSparseShallow, lsRemoteTags, revParseHead, sparseCheckoutSet, GitError } from "@aiactions/git";
```

- [ ] **Step 2: Replace `git ls-remote --tags` (line ~58)**

Find:

```ts
({ stdout } = await pExecFile("git", ["ls-remote", "--tags", canonicalUrl]));
```

Replace with:

```ts
stdout = await lsRemoteTags(canonicalUrl);
```

The surrounding `try/catch` already maps the failure into `ActionResolutionError` — keep it. The `err` will now be a `GitError`; `(err as { stderr?: string }).stderr` keeps working because `GitError.stderr` is `string`.

- [ ] **Step 3: Replace `git clone --filter=blob:none --sparse --depth 1 --branch <tag>` (line ~144)**

Find:

```ts
await pExecFile("git", [
  "clone",
  "--filter=blob:none",
  "--sparse",
  "--depth",
  "1",
  "--branch",
  tag,
  canonicalUrl,
  repoDir,
]);
```

Replace with:

```ts
await cloneSparseShallow({
  url: canonicalUrl,
  branch: tag,
  dest: repoDir,
  filter: "blob:none",
});
```

The surrounding `try/catch` mapping into `ActionResolutionError` stays. `(err as { stderr?: string }).stderr` keeps working.

- [ ] **Step 4: Replace `git -C <repoDir> sparse-checkout set <path>` (line ~164)**

Find:

```ts
await pExecFile("git", [
  "-C",
  repoDir,
  "sparse-checkout",
  "set",
  `actions/${ref.namespace}/${ref.name}`,
]);
```

Replace with:

```ts
await sparseCheckoutSet(repoDir, [`actions/${ref.namespace}/${ref.name}`]);
```

Surrounding `try/catch` stays.

- [ ] **Step 5: Replace `git -C <repoDir> rev-parse HEAD` (line ~199)**

Find:

```ts
revParse = await pExecFile("git", ["-C", repoDir, "rev-parse", "HEAD"]);
```

Replace with:

```ts
revParse = { stdout: await revParseHead(repoDir), stderr: "" };
```

(Wrapping into the `{ stdout, stderr }` shape because the next line probably reads `revParse.stdout.trim()`. If the consumer code uses just the SHA, simplify to `const sha = await revParseHead(repoDir);` and adapt the next line accordingly. **Read the surrounding 5 lines first** to choose the cleanest swap.)

If the surrounding code expects the trimmed SHA directly, the cleaner shape is:

```ts
const headSha = await revParseHead(repoDir);
```

…and any later `revParse.stdout.trim()` becomes just `headSha`.

- [ ] **Step 6: Run tests**

```bash
cd packages/runtime && vp check && vp test
```

Expected: PASS — all runtime tests green. Pay special attention to:
- `tests/runner-uses-registry-fetch.test.ts` — exercises the four migrated calls.
- `tests/runner-uses-registry-fetch-fetch.test.ts` — tests the clone/sparse-checkout/rename sequence.
- `tests/runner-uses-registry-integration.test.ts` — full registry fetch happy path.

If any test fails, stop and report. Do not commit until they pass.

- [ ] **Step 7: Commit**

```bash
git add packages/runtime/src/runner/uses/registry-fetch.ts
git commit -m "$(cat <<'EOF'
refactor(runtime): consume @aiactions/git in registry-fetch

Replaces 4 pExecFile("git", ...) calls with the corresponding helpers
from @aiactions/git (lsRemoteTags, cloneSparseShallow,
sparseCheckoutSet, revParseHead). Drops the local execFile import and
pExecFile declaration. Behaviour preserved; existing
ActionResolutionError mapping unchanged.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 8: Run repo-wide verification

- [ ] **Step 1: Run `aiactions#ready`**

```bash
vp run aiactions#ready
```

Expected: PASS — gen:schemas + check + recursive build + recursive test all green.

If `aiactions#ready` fails on a pre-existing fmt drift in any docs file, apply `vp fmt <path>` to the offending files and commit the result as a separate `style(fmt):` commit per the `collaboration.md` MS1.7 lesson. Do NOT mix the fmt-fix into a feature commit.

If `aiactions#ready` fails on a real error (lint, type, test), STOP and report — do not bypass.

- [ ] **Step 2: Confirm no orphan `pExecFile("git", ...)` invocations remain**

```bash
grep -rn 'pExecFile("git"\|execFile("git"' packages/runtime/src packages/cli/src packages/workflows/src packages/paths/src 2>/dev/null
```

Expected: empty output. If any remain, they are out of scope for Phase 2 — flag them in the final report but do not migrate in this branch.

The bare-repo fixtures (`packages/runtime/tests/fixtures/registry/make-bare-repo.ts` and `packages/cli/tests/fixtures/make-bare-repo.ts`) DO contain `git` invocations — those are test fixtures, not runtime code, and they migrate when the cli/runtime test fixtures are reorganised (later phase).

---

## Task 9: detect_changes + persist phase-2-shipped + decide PR strategy

- [ ] **Step 1: Sync the codebase index**

Call:

```
mcp__codebase-memory-mcp__detect_changes(
  project: "home-aperrix-Documents-PROJECTS-aiactions",
  since: "HEAD~9"
)
```

If the response reports significant structural drift (new package added counts as drift), run a `moderate`-mode re-index:

```
mcp__codebase-memory-mcp__index_repository(
  repo_path: "/home/aperrix/Documents/PROJECTS/aiactions",
  mode: "moderate"
)
```

- [ ] **Step 2: Persist Phase-2 completion in MuninnDB**

Call `mcp__muninn__muninn_remember` with `vault: "aiactions"`, `concept: "phase-2-git-shipped"`, `type: "milestone"`. Content must enumerate:
- `@aiactions/git` v0.1.0 — leaf package, stdlib only
- Public API: `gitExec`, `cloneSparseShallow`, `sparseCheckoutSet`, `lsRemoteTags`, `revParseHead`, `GitError`
- Migrated caller: `packages/runtime/src/runner/uses/registry-fetch.ts` (4 invocations).
- Deferred from spec: `cloneRepo`, `fetchTag`, `listBranches`, `createWorktree`, `removeWorktree` — added when a real consumer arrives.
- Link to memory `01KR6HWP8SW32S6HTTFWZADPZS` (architecture decision) via `relation: "implements"`.

- [ ] **Step 3: Decide PR strategy**

Per `collaboration.md`:

- Phase 2 touched only `packages/git/*` (new) + `packages/runtime/*` (modified). **Two components.** Therefore: **`git merge --no-ff`** when integrating into `main` (preserves the per-commit history so release-please routes scopes correctly).
- Branch: whatever the executor chose (e.g. `worktree-phase+2-git-package`). Rebase on `main` first if `main` has moved.
- Pre-flush `vp fmt` on `main` before the merge to avoid the MS1.7 fmt-isolation trap.

If working in a worktree, exit with `ExitWorktree({ action: "remove", discard_changes: true })` after the merge — the worktree's branch is fully reachable from `main` via the merge commit.

---

## Done

When Task 9 is complete, Phase 2 is done. The next plan to write is `2026-MM-DD-phase-3-workflows-split.md`, covering the split of `@aiactions/workflows` into `@aiactions/schema` + `@aiactions/parser` + `@aiactions/discovery` (BREAKING — major bump).
