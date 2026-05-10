# Phase 5 — CLI vertical slices implementation plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Convert `packages/cli` from flat `commands/action/<verb>.ts` handlers + horizontal `cli/lib/*` helpers into vertical slices per `(resource, verb)` plus a `_shared/` folder, while migrating registry-domain helpers to `@aiactions/registry`. No breaking change to the CLI public surface.

**Architecture:** Each `(resource, verb)` slice lives at `commands/<resource>/<verb>/{command.ts, <verb>-<resource>.ts, receipt.ts}`. Cross-cutting CLI concerns (errors, exit codes, output writers, argv ref parser) move to `_shared/`. Registry-index fetch + cache walker move to `@aiactions/registry` as additive modules. The `RegistryFetchError` duplication between CLI and brick is collapsed onto the brick's class.

**Tech stack:** Bun workspaces, Vite+ (`vp`), TypeScript strict, citty (CLI framework), `@clack/prompts`, Vitest, oxfmt/oxlint.

**Spec:** [`docs/superpowers/specs/2026-05-10-phase-5-cli-vertical-slices-design.md`](../specs/2026-05-10-phase-5-cli-vertical-slices-design.md).

---

## Conventions used in this plan

- Every code block is the **complete** content of the file unless explicitly framed as a `diff` or `Edit`.
- Every step ends with a runnable command and the expected outcome.
- Each task ends with one Conventional Commit. The branch will be `--no-ff`-merged into `main` at the end (Q2=A2 from the spec).
- "Verify" lines mean: run the command, confirm the expected output, then proceed. Do not commit if verification fails — diagnose first.

## Pre-flight

Confirm you are at `/home/aperrix/Documents/PROJECTS/aiactions`, on `main`, with HEAD at `09c87cb` (the `docs(specs)` commit) or later. Working tree may have a pre-existing modification on `packages/paths/package.json` — leave it untouched.

```bash
git rev-parse HEAD
git status -s
```

---

## Task 0: Create the worktree

**Files:** none modified inside the existing checkout.

- [ ] **Step 1: Sync `main` with origin to ensure latest.**

```bash
git fetch origin
git status
```
Expected: `Your branch is up to date with 'origin/main'`.

- [ ] **Step 2: Create worktree off `main`.**

```bash
git worktree add ../aiactions-phase-5 -b worktree-phase-5-cli-vertical-slices main
cd ../aiactions-phase-5
pwd
```
Expected: working in `/home/aperrix/Documents/PROJECTS/aiactions-phase-5` on branch `worktree-phase-5-cli-vertical-slices`.

- [ ] **Step 3: Install workspaces.**

```bash
vp install
```
Expected: dependency tree resolves; no errors.

- [ ] **Step 4: Baseline `vp run ready`.**

```bash
vp run ready
```
Expected: green. If red, stop — phase 5 must start from green.

(No commit at this task — only worktree state.)

---

## Task 1: Add `RegistryValidationError` to `@aiactions/registry`

**Files:**
- Modify: `packages/registry/src/errors.ts` (add one class).
- Create: `packages/registry/tests/registry-errors.test.ts`.

- [ ] **Step 1: Extend brick errors.**

Open `packages/registry/src/errors.ts`. Replace the file content with:

```ts
/**
 * `@aiactions/registry` error hierarchy.
 *
 * - `RegistryError` — abstract base for the package.
 * - `RegistryFetchError` — git clone, sparse-checkout, rev-parse, or
 *   destination filesystem operations failed; or registry-index HTTP fetch
 *   failed (network, non-2xx, timeout).
 * - `RegistryResolveError` — `git ls-remote` failed or no published tag
 *   matches the requested major-range.
 * - `RegistryValidationError` — registry index JSON is malformed or
 *   fails Zod validation against `registrySchema`.
 *
 * Folds the previous runtime `LockfileVersionMismatch` (lockfile-side)
 * and `ActionResolutionError` (registry-fetch-side) into this hierarchy
 * per spec section 10.1.
 */

import { AIactionsError } from "@aiactions/schema";

export abstract class RegistryError extends AIactionsError {}

export class RegistryFetchError extends RegistryError {}

export class RegistryResolveError extends RegistryError {}

export class RegistryValidationError extends RegistryError {}
```

- [ ] **Step 2: Write the brick error test.**

Create `packages/registry/tests/registry-errors.test.ts` with:

```ts
import { AIactionsError } from "@aiactions/schema";
import { expect, test } from "vite-plus/test";

import {
  RegistryError,
  RegistryFetchError,
  RegistryResolveError,
  RegistryValidationError,
} from "../src/errors.ts";

test("RegistryError extends AIactionsError (abstract)", () => {
  expect(() => Reflect.construct(RegistryError, ["x"])).toThrow();
});

test("RegistryFetchError is a RegistryError + AIactionsError", () => {
  const err = new RegistryFetchError("network down");
  expect(err).toBeInstanceOf(RegistryError);
  expect(err).toBeInstanceOf(AIactionsError);
  expect(err.name).toBe("RegistryFetchError");
  expect(err.message).toBe("network down");
});

test("RegistryResolveError is a RegistryError + AIactionsError", () => {
  const err = new RegistryResolveError("no matching tag");
  expect(err).toBeInstanceOf(RegistryError);
  expect(err).toBeInstanceOf(AIactionsError);
  expect(err.name).toBe("RegistryResolveError");
});

test("RegistryValidationError is a RegistryError + AIactionsError", () => {
  const cause = new Error("zod said no");
  const err = new RegistryValidationError("malformed registry", { cause });
  expect(err).toBeInstanceOf(RegistryError);
  expect(err).toBeInstanceOf(AIactionsError);
  expect(err.name).toBe("RegistryValidationError");
  expect(err.cause).toBe(cause);
});
```

- [ ] **Step 3: Run brick tests.**

```bash
vp test -F packages/registry
```
Expected: all tests pass, including the new `registry-errors.test.ts` file.

- [ ] **Step 4: Run full ready.**

```bash
vp run ready
```
Expected: green.

- [ ] **Step 5: Commit.**

```bash
git add packages/registry/src/errors.ts packages/registry/tests/registry-errors.test.ts
git commit -m "feat(registry): add RegistryValidationError"
```

---

## Task 2: Add the `index-fetch` module to `@aiactions/registry`

**Files:**
- Create: `packages/registry/src/index-fetch.ts`.
- Modify: `packages/registry/src/index.ts` (add re-export).
- Move: `packages/cli/tests/registry.test.ts` → `packages/registry/tests/registry-index.test.ts` and rewire imports.

- [ ] **Step 1: Create the new brick module.**

Write `packages/registry/src/index-fetch.ts`:

```ts
/**
 * Registry-index fetch primitives — load and validate the
 * `registry.json` document that lists every published action coordinate.
 *
 * Distinct from `fetch.ts` which fetches a *single action's git tree*
 * via sparse-checkout; this module deals with the registry index over
 * plain HTTP.
 *
 * Public surface:
 * - `REGISTRY_URL_DEFAULT` — canonical raw GitHub URL.
 * - `resolveRegistryUrl(env)` — pick `AIACTIONS_REGISTRY_URL` or default.
 * - `fetchRegistry(url?)` — HTTP fetch + Zod validate.
 * - `resolveLatest(reg, ns, name)` — pick the highest semver entry.
 * - `groupByCoord(reg)` — group entries by `<ns>/<name>` key.
 */

import { type Registry, type RegistryEntry, registrySchema } from "@aiactions/schema";
import { rcompare as semverRcompare } from "semver";

import { RegistryFetchError, RegistryValidationError } from "./errors.ts";

export const REGISTRY_URL_DEFAULT =
  "https://raw.githubusercontent.com/Aperrix/aiactions/main/actions/registry.json";

const FETCH_TIMEOUT_MS = 10_000;

export function resolveRegistryUrl(env: NodeJS.ProcessEnv): string {
  return env.AIACTIONS_REGISTRY_URL ?? REGISTRY_URL_DEFAULT;
}

export async function fetchRegistry(url?: string): Promise<Registry> {
  const target = url ?? resolveRegistryUrl(process.env);
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), FETCH_TIMEOUT_MS);

  let resp: Response;
  try {
    resp = await fetch(target, { signal: ctrl.signal });
  } catch (err) {
    throw new RegistryFetchError(`failed to fetch registry from ${target}: ${(err as Error).message}`, {
      cause: err,
    });
  } finally {
    clearTimeout(timer);
  }

  if (!resp.ok) {
    throw new RegistryFetchError(`registry fetch failed: ${target} returned HTTP ${resp.status}`);
  }

  const text = await resp.text();
  let raw: unknown;
  try {
    raw = JSON.parse(text);
  } catch (err) {
    throw new RegistryValidationError(
      `registry at ${target} is malformed JSON: ${(err as Error).message}`,
      { cause: err },
    );
  }

  const parsed = registrySchema.safeParse(raw);
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    throw new RegistryValidationError(
      `registry at ${target} failed validation: ${issue?.path.join(".")}: ${issue?.message}`,
      { cause: parsed.error },
    );
  }
  return parsed.data;
}

function parseVersionFromRef(ref: string): string {
  const at = ref.lastIndexOf("@");
  return ref.slice(at + 1);
}

function parseCoordFromRef(ref: string): { ns: string; name: string; version: string } {
  const at = ref.lastIndexOf("@");
  const ns = ref.slice(0, at).split("/")[0]!;
  const name = ref.slice(0, at).split("/")[1]!;
  return { ns, name, version: ref.slice(at + 1) };
}

export function resolveLatest(reg: Registry, ns: string, name: string): RegistryEntry | null {
  const candidates = reg.actions.filter((e) => {
    const c = parseCoordFromRef(e.ref);
    return c.ns === ns && c.name === name;
  });
  if (candidates.length === 0) return null;
  candidates.sort((a, b) => semverRcompare(parseVersionFromRef(a.ref), parseVersionFromRef(b.ref)));
  return candidates[0]!;
}

export function groupByCoord(reg: Registry): Map<string, RegistryEntry[]> {
  const out = new Map<string, RegistryEntry[]>();
  for (const e of reg.actions) {
    const c = parseCoordFromRef(e.ref);
    const key = `${c.ns}/${c.name}`;
    let bucket = out.get(key);
    if (!bucket) {
      bucket = [];
      out.set(key, bucket);
    }
    bucket.push(e);
  }
  for (const bucket of out.values()) {
    bucket.sort((a, b) => semverRcompare(parseVersionFromRef(a.ref), parseVersionFromRef(b.ref)));
  }
  return out;
}
```

> **Diff vs the old `cli/lib/registry.ts`:** errors are now imported from `./errors.ts` (brick) and use `{ cause }` option (matching `AIactionsError` constructor signature). The signature `RegistryFetchError(message, cause)` from CLI's old class is replaced by `RegistryFetchError(message, { cause })`. Behavior is identical.

- [ ] **Step 2: Add to brick barrel.**

Edit `packages/registry/src/index.ts`. Replace its content with:

```ts
export * from "./fetch.ts";
export * from "./resolve.ts";
export * from "./lockfile.ts";
export * from "./errors.ts";
export * from "./index-fetch.ts";
```

- [ ] **Step 3: Add the brick package's runtime dep.**

The new module imports `semver` and `@aiactions/schema`. Verify they exist:

```bash
grep -E '"semver"|"@aiactions/schema"' packages/registry/package.json
```

If `semver` is missing, add it:

```bash
cd packages/registry
vp add semver@catalog:
vp add -D @types/semver@catalog:
cd -
```

(If both are catalog'd, copy their version strings from `packages/cli/package.json`.)

- [ ] **Step 4: Move and rewire the index-fetch test.**

Move file:

```bash
git mv packages/cli/tests/registry.test.ts packages/registry/tests/registry-index.test.ts
```

Open `packages/registry/tests/registry-index.test.ts`. Replace the import header:

```ts
} from "../src/lib/registry.ts";
```
with:
```ts
} from "../src/index-fetch.ts";
```

And replace any reference to CLI's old error classes — the test currently imports `RegistryFetchError`/`RegistryValidationError` from `../src/lib/errors.ts`; rewire those imports to `../src/errors.ts`. Concretely, ensure the test file's imports look like:

```ts
import { fetchRegistry, REGISTRY_URL_DEFAULT, resolveRegistryUrl, groupByCoord, resolveLatest } from "../src/index-fetch.ts";
import { RegistryFetchError, RegistryValidationError } from "../src/errors.ts";
```

Then audit assertions — the brick errors carry `{ cause }` not a positional `cause`. Tests that read `err.cause` continue to work; tests that pass `cause` positionally to construct an error must be updated to `{ cause }`. None of the original CLI tests construct these classes — they assert on errors thrown by `fetchRegistry`. No changes beyond imports needed.

- [ ] **Step 5: Run the brick test.**

```bash
vp test -F packages/registry
```
Expected: `registry-index.test.ts` passes.

- [ ] **Step 6: Run full ready.**

The CLI still imports `fetchRegistry` from `cli/lib/registry.ts`, so CLI tests continue to pass through the legacy path. Whole monorepo:

```bash
vp run ready
```
Expected: green.

- [ ] **Step 7: Commit.**

```bash
git add packages/registry/src/index-fetch.ts packages/registry/src/index.ts packages/registry/tests/registry-index.test.ts packages/registry/package.json packages/cli/tests/registry.test.ts
git commit -m "feat(registry): add index-fetch module for registry.json"
```

> Note: The `git mv` produces both a deletion (CLI test file) and an addition (registry test file) — both must be staged.

---

## Task 3: Add the `cache` module to `@aiactions/registry`

**Files:**
- Create: `packages/registry/src/cache.ts`.
- Modify: `packages/registry/src/index.ts` (add re-export).
- Move: `packages/cli/tests/walk-cache.test.ts` → `packages/registry/tests/cache.test.ts` and rewire imports.

- [ ] **Step 1: Create the brick cache module.**

Write `packages/registry/src/cache.ts`:

```ts
/**
 * Filesystem cache walker for actions installed under
 * `<registryRoot>/<ns>/<name>/<version>/`. Used by `aia action list`
 * and `aia action uninstall` to enumerate cached entries without
 * round-tripping the registry index.
 *
 * Public surface:
 * - `CachedEntry` — `{ namespace, name, version, dir }` triple.
 * - `walkCache(root)` — fixed-depth-3 walk; missing root → `[]`.
 */

import { readdir, stat } from "node:fs/promises";
import { join } from "node:path";

export interface CachedEntry {
  readonly namespace: string;
  readonly name: string;
  readonly version: string;
  readonly dir: string;
}

export async function walkCache(root: string): Promise<CachedEntry[]> {
  let nsEntries: string[];
  try {
    nsEntries = await readdir(root);
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === "ENOENT") return [];
    throw err;
  }

  const entries: CachedEntry[] = [];
  for (const namespace of nsEntries) {
    const nsDir = join(root, namespace);
    if (!(await isDirectory(nsDir))) continue;

    const nameEntries = await readdir(nsDir);
    for (const name of nameEntries) {
      const nameDir = join(nsDir, name);
      if (!(await isDirectory(nameDir))) continue;

      const versionEntries = await readdir(nameDir);
      for (const version of versionEntries) {
        const dir = join(nameDir, version);
        if (!(await isDirectory(dir))) continue;
        entries.push({ namespace, name, version, dir });
      }
    }
  }
  return entries;
}

async function isDirectory(path: string): Promise<boolean> {
  try {
    return (await stat(path)).isDirectory();
  } catch {
    return false;
  }
}
```

- [ ] **Step 2: Add to brick barrel.**

Edit `packages/registry/src/index.ts`. Append the export:

```ts
export * from "./fetch.ts";
export * from "./resolve.ts";
export * from "./lockfile.ts";
export * from "./errors.ts";
export * from "./index-fetch.ts";
export * from "./cache.ts";
```

- [ ] **Step 3: Move and rewire the cache test.**

```bash
git mv packages/cli/tests/walk-cache.test.ts packages/registry/tests/cache.test.ts
```

Open `packages/registry/tests/cache.test.ts`. Replace the source import:

```ts
import { walkCache } from "../src/lib/walk-cache.ts";
```
with:
```ts
import { walkCache } from "../src/cache.ts";
```

Same for any `import { type CachedEntry } from "../src/lib/walk-cache.ts"` line — point it at `../src/cache.ts`.

- [ ] **Step 4: Run the brick test.**

```bash
vp test -F packages/registry
```
Expected: `cache.test.ts` passes.

- [ ] **Step 5: Run full ready.**

```bash
vp run ready
```
Expected: green.

- [ ] **Step 6: Commit.**

```bash
git add packages/registry/src/cache.ts packages/registry/src/index.ts packages/registry/tests/cache.test.ts packages/cli/tests/walk-cache.test.ts
git commit -m "feat(registry): add cache module"
```

---

## Task 4: Introduce `cli/_shared/` and consume brick errors

**Files:**
- Move: `cli/lib/exit-codes.ts` → `cli/_shared/exit-codes.ts`.
- Create: `cli/_shared/cli-error.ts` (replaces `cli/lib/errors.ts`, keeps only non-domain classes).
- Move: `cli/lib/output.ts` → `cli/_shared/output.ts`.
- Move: `cli/lib/parse-registry-ref.ts` → `cli/_shared/parse-registry-ref.ts`.
- Modify: `cli/src/cli.ts` (import paths).
- Modify: `cli/src/commands/action/{check,install,list,uninstall}.ts` (import paths).
- Modify: `cli/src/lib/{registry.ts,parse-short-ref.ts,check-manifest.ts}` (import paths to errors).
- Move: `cli/tests/errors.test.ts` → `cli/tests/_shared/cli-error.test.ts` (keeps only `CliError` / `UsageError` / `NotFoundError` cases — drop the brick-error cases).
- Move: `cli/tests/output.test.ts` → `cli/tests/_shared/output.test.ts`.
- Move: `cli/tests/parse-registry-ref.test.ts` → `cli/tests/_shared/parse-registry-ref.test.ts`.

- [ ] **Step 1: Create the new `cli-error.ts`.**

```bash
mkdir -p packages/cli/src/_shared packages/cli/tests/_shared
```

Write `packages/cli/src/_shared/cli-error.ts`:

```ts
import { EXIT, type ExitCode } from "./exit-codes.ts";

/**
 * Base error type carrying a process exit code. The top-level CLI
 * handler maps `code` to `process.exit()` and surfaces `cause` only
 * when AIA_DEBUG is set.
 *
 * Domain errors (`RegistryError`, `WorkflowError`, …) are NOT subclasses
 * of `CliError` — they extend `AIactionsError` and live in their own
 * brick package. The CLI maps the domain-error constructor to an exit
 * code via the `EXIT_BY_BRICK_ERROR` table below.
 */
export class CliError extends Error {
  public readonly code: ExitCode;
  public override readonly cause?: unknown;

  constructor(code: ExitCode, message: string, cause?: unknown) {
    super(message);
    this.name = "CliError";
    this.code = code;
    this.cause = cause;
  }
}

/** Thrown for malformed argv, refused destructive ops in non-TTY, etc. */
export class UsageError extends CliError {
  constructor(message: string) {
    super(EXIT.USAGE, message);
    this.name = "UsageError";
  }
}

/** Thrown when a referenced cache entry does not exist on disk. */
export class NotFoundError extends CliError {
  constructor(message: string) {
    super(EXIT.NOT_FOUND, message);
    this.name = "NotFoundError";
  }
}
```

- [ ] **Step 2: Move and rewire the unchanged files into `_shared/`.**

```bash
git mv packages/cli/src/lib/exit-codes.ts packages/cli/src/_shared/exit-codes.ts
git mv packages/cli/src/lib/output.ts     packages/cli/src/_shared/output.ts
git mv packages/cli/src/lib/parse-registry-ref.ts packages/cli/src/_shared/parse-registry-ref.ts
```

Open `packages/cli/src/_shared/parse-registry-ref.ts`. Update the relative import to `cli-error.ts`:

```ts
import { UsageError } from "./cli-error.ts";
```

Open `packages/cli/src/lib/parse-short-ref.ts`. Update its import:

```ts
import { UsageError } from "../_shared/cli-error.ts";
```

Open `packages/cli/src/lib/check-manifest.ts`. Update its import:

```ts
import { NotFoundError } from "../_shared/cli-error.ts";
```

Open `packages/cli/src/lib/registry.ts`. Update its imports — the brick error names are now used:

```ts
import { RegistryFetchError, RegistryValidationError } from "@aiactions/registry";
```

…and adjust the constructor call sites: replace `new RegistryFetchError(msg, err)` with `new RegistryFetchError(msg, { cause: err })` (and same for `RegistryValidationError`). Keep the rest of the file unchanged for now — the symbol moves to brick in Task 7 once consumers are rewired, but the imports already point at the brick.

- [ ] **Step 3: Delete `packages/cli/src/lib/errors.ts`.**

```bash
rm packages/cli/src/lib/errors.ts
```

- [ ] **Step 4: Update CLI consumers' import paths.**

Edit `packages/cli/src/cli.ts`. Replace the two import lines:

```ts
import { CliError } from "./_shared/cli-error.ts";
import { EXIT } from "./_shared/exit-codes.ts";
```

Edit `packages/cli/src/commands/action/check.ts`. Replace its import block:

```ts
import { checkManifest, type CheckResult } from "../../lib/check-manifest.ts";
import { NotFoundError, UsageError } from "../../_shared/cli-error.ts";
import { EXIT } from "../../_shared/exit-codes.ts";
import { formatIssue } from "../../lib/format-issues.ts";
```

Edit `packages/cli/src/commands/action/install.ts`. Replace its import block:

```ts
import { CliError, NotFoundError, UsageError } from "../../_shared/cli-error.ts";
import { EXIT } from "../../_shared/exit-codes.ts";
import { isInteractive } from "../../_shared/output.ts";
import { parseRegistryRef } from "../../_shared/parse-registry-ref.ts";
import { parseShortRef } from "../../lib/parse-short-ref.ts";
import {
  fetchRegistry,
  groupByCoord,
  resolveLatest,
  resolveRegistryUrl,
} from "../../lib/registry.ts";
```

Edit `packages/cli/src/commands/action/list.ts`. Replace its imports:

```ts
import { fetchRegistry, groupByCoord, resolveRegistryUrl } from "../../lib/registry.ts";
import { walkCache, type CachedEntry } from "../../lib/walk-cache.ts";
```

(no errors imported by `list.ts` — leave as-is for the rest)

Edit `packages/cli/src/commands/action/uninstall.ts`. Replace its imports:

```ts
import { NotFoundError, UsageError } from "../../_shared/cli-error.ts";
import { isInteractive } from "../../_shared/output.ts";
import { parseRegistryRef } from "../../_shared/parse-registry-ref.ts";
import { type CachedEntry, walkCache } from "../../lib/walk-cache.ts";
```

- [ ] **Step 5: Move the three test files.**

```bash
git mv packages/cli/tests/errors.test.ts            packages/cli/tests/_shared/cli-error.test.ts
git mv packages/cli/tests/output.test.ts            packages/cli/tests/_shared/output.test.ts
git mv packages/cli/tests/parse-registry-ref.test.ts packages/cli/tests/_shared/parse-registry-ref.test.ts
```

- [ ] **Step 6: Trim `cli-error.test.ts`.**

Open `packages/cli/tests/_shared/cli-error.test.ts`. Replace its content with only the `CliError` / `UsageError` / `NotFoundError` assertions (drop the `RegistryFetchError` and `RegistryValidationError` blocks — they live in the brick now):

```ts
import { expect, test } from "vite-plus/test";

import {
  CliError,
  NotFoundError,
  UsageError,
} from "../../src/_shared/cli-error.ts";
import { EXIT } from "../../src/_shared/exit-codes.ts";

test("CliError carries explicit code + cause", () => {
  const cause = new Error("inner");
  const err = new CliError(EXIT.RUNTIME, "boom", cause);
  expect(err.name).toBe("CliError");
  expect(err.code).toBe(EXIT.RUNTIME);
  expect(err.cause).toBe(cause);
});

test("UsageError carries EXIT.USAGE", () => {
  const err = new UsageError("bad argv");
  expect(err.code).toBe(EXIT.USAGE);
  expect(err.name).toBe("UsageError");
});

test("NotFoundError carries EXIT.NOT_FOUND", () => {
  const err = new NotFoundError("missing");
  expect(err.code).toBe(EXIT.NOT_FOUND);
  expect(err.name).toBe("NotFoundError");
});
```

- [ ] **Step 7: Update import paths in the moved test files.**

Open `packages/cli/tests/_shared/output.test.ts`. Replace the source import:

```ts
import { formatTable, type TableColumn } from "../../src/_shared/output.ts";
```

(if any other helper from `output.ts` is imported, point it at `../../src/_shared/output.ts` too)

Open `packages/cli/tests/_shared/parse-registry-ref.test.ts`. Replace the source import:

```ts
import { parseRegistryRef } from "../../src/_shared/parse-registry-ref.ts";
```

- [ ] **Step 8: Update other test files that imported from `cli/src/lib/errors.ts`.**

Search and rewire:

```bash
grep -rln 'src/lib/errors' packages/cli/tests
```
Expected output (after step 6): two files — `check.test.ts`, `install.test.ts`, `uninstall.test.ts`. Open each and rewrite the import to:

```ts
import { ... } from "../src/_shared/cli-error.ts";
```

Also rewire `EXIT` imports — anywhere that currently reads `from "../src/lib/exit-codes.ts"` becomes `from "../src/_shared/exit-codes.ts"`.

- [ ] **Step 9: Run `vp run ready`.**

```bash
vp run ready
```
Expected: green. If `oxlint` complains about unused imports, fix the offending file.

- [ ] **Step 10: Commit.**

```bash
git add -A packages/cli/src/_shared packages/cli/src/cli.ts packages/cli/src/commands packages/cli/src/lib packages/cli/tests
git commit -m "refactor(cli): introduce _shared/ folder, consume brick errors"
```

---

## Task 5: Vertical-slice `commands/action/check`

**Files:**
- Create: `packages/cli/src/commands/action/check/command.ts`, `check-action.ts`, `receipt.ts`.
- Move: `cli/src/lib/check-manifest.ts` → `cli/src/commands/action/check/check-manifest.ts`.
- Move: `cli/src/lib/format-issues.ts` → `cli/src/commands/action/check/format-issues.ts`.
- Delete: `cli/src/commands/action/check.ts`.
- Modify: `cli/src/commands/action/index.ts` (import path).

- [ ] **Step 1: Create the slice folder and move local helpers.**

```bash
mkdir -p packages/cli/src/commands/action/check
git mv packages/cli/src/lib/check-manifest.ts packages/cli/src/commands/action/check/check-manifest.ts
git mv packages/cli/src/lib/format-issues.ts  packages/cli/src/commands/action/check/format-issues.ts
```

Open `packages/cli/src/commands/action/check/check-manifest.ts`. Rewire its imports:

```ts
import { parseActionManifest } from "@aiactions/parser";
import { WorkflowParseError, WorkflowSchemaError } from "@aiactions/schema";
import type { ZodError } from "zod";

import { NotFoundError } from "../../../_shared/cli-error.ts";
import type { Issue } from "./format-issues.ts";

export type { Issue } from "./format-issues.ts";
```

(rest of the file unchanged)

`format-issues.ts` has no relative imports — moving it is path-only; no edits.

- [ ] **Step 2: Write `check-action.ts` (orchestration).**

`packages/cli/src/commands/action/check/check-action.ts`:

```ts
import { readdir } from "node:fs/promises";
import { isAbsolute, join, resolve } from "node:path";

import { NotFoundError, UsageError } from "../../../_shared/cli-error.ts";
import { checkManifest, type CheckResult } from "./check-manifest.ts";

const SKIP_SEGMENTS = new Set(["node_modules", ".git", "dist"]);

async function walkActionManifests(root: string): Promise<string[]> {
  const out: string[] = [];
  const entries = await readdir(root, { recursive: true, withFileTypes: true });
  for (const entry of entries) {
    if (!entry.isFile()) continue;
    if (entry.name !== "aiaction.yaml") continue;
    const parent = (entry as unknown as { parentPath?: string }).parentPath ?? root;
    const segments = parent.split(/[/\\]/);
    if (segments.some((s) => SKIP_SEGMENTS.has(s))) continue;
    out.push(join(parent, entry.name));
  }
  out.sort();
  return out;
}

export interface CheckActionArgs {
  readonly path: string | undefined;
  readonly all: boolean;
}

export async function runCheckAction(args: CheckActionArgs): Promise<CheckResult[]> {
  if (!args.path && !args.all) {
    throw new UsageError("expected exactly one of <path> or --all");
  }
  if (args.path && args.all) {
    throw new UsageError("<path> and --all are mutually exclusive");
  }

  const cwd = process.cwd();
  const targets: string[] = args.path
    ? [isAbsolute(args.path) ? args.path : resolve(cwd, args.path)]
    : await walkActionManifests(cwd);

  if (args.all && targets.length === 0) {
    throw new NotFoundError(`no aiaction.yaml found under ${cwd}`);
  }

  const results: CheckResult[] = [];
  for (const t of targets) {
    results.push(await checkManifest(t));
  }
  return results;
}
```

- [ ] **Step 3: Write `receipt.ts` (output formatter).**

`packages/cli/src/commands/action/check/receipt.ts`:

```ts
import type { CheckResult } from "./check-manifest.ts";
import { formatIssue } from "./format-issues.ts";

interface CheckJsonShape {
  readonly ok: boolean;
  readonly files: ReadonlyArray<{
    readonly path: string;
    readonly ok: boolean;
    readonly errors: ReadonlyArray<{ zodPath: string; message: string }>;
    readonly warnings: ReadonlyArray<{ zodPath: string; message: string }>;
  }>;
}

function toJson(results: CheckResult[]): CheckJsonShape {
  return {
    ok: results.every((r) => r.ok),
    files: results.map((r) => ({
      path: r.path,
      ok: r.ok,
      errors: r.errors,
      warnings: r.warnings,
    })),
  };
}

function renderHuman(results: CheckResult[]): { stdout: string[]; stderr: string[] } {
  const stdout: string[] = [];
  const stderr: string[] = [];
  let valid = 0;
  let invalid = 0;
  for (const r of results) {
    const rel = r.path;
    if (r.ok) {
      stdout.push(`✓ ${rel} — manifest valid`);
      valid++;
    } else {
      stderr.push(`✗ ${rel} — ${r.errors.length} error${r.errors.length === 1 ? "" : "s"}`);
      for (const issue of r.errors) {
        stderr.push(`  ${formatIssue(issue, r.path)}`);
      }
      invalid++;
    }
  }
  if (results.length > 1) {
    stdout.push(`Summary: ${valid} valid, ${invalid} invalid`);
  }
  return { stdout, stderr };
}

export function writeCheckReceipt(json: boolean, results: CheckResult[]): void {
  if (json) {
    process.stdout.write(`${JSON.stringify(toJson(results))}\n`);
    return;
  }
  const { stdout, stderr } = renderHuman(results);
  for (const line of stdout) process.stdout.write(`${line}\n`);
  for (const line of stderr) process.stderr.write(`${line}\n`);
}
```

- [ ] **Step 4: Write `command.ts` (citty entry).**

`packages/cli/src/commands/action/check/command.ts`:

```ts
import { defineCommand } from "citty";

import { EXIT } from "../../../_shared/exit-codes.ts";
import { runCheckAction } from "./check-action.ts";
import { writeCheckReceipt } from "./receipt.ts";

export const checkCommand = defineCommand({
  meta: {
    name: "check",
    description: "Validate one or many aiaction.yaml manifests against actionManifestSchema",
  },
  args: {
    path: {
      type: "positional",
      description: "Path to a single aiaction.yaml",
      required: false,
    },
    all: {
      type: "boolean",
      description: "Validate every aiaction.yaml under the current directory",
      default: false,
    },
    json: {
      type: "boolean",
      description: "Emit machine-readable JSON instead of human output",
      default: false,
    },
  },
  async run({ args }) {
    const results = await runCheckAction({
      path: typeof args.path === "string" ? args.path : undefined,
      all: args.all === true,
    });
    writeCheckReceipt(args.json === true, results);
    if (!results.every((r) => r.ok)) process.exit(EXIT.SCHEMA);
  },
});
```

- [ ] **Step 5: Delete the old monolithic verb file.**

```bash
rm packages/cli/src/commands/action/check.ts
```

- [ ] **Step 6: Update the resource aggregator.**

Open `packages/cli/src/commands/action/index.ts`. Replace the `check` import:

```ts
import { checkCommand } from "./check/command.ts";
```

(leave install/list/uninstall imports untouched until their slices land)

- [ ] **Step 7: Move the slice's tests.**

```bash
mkdir -p packages/cli/tests/commands/action/check
git mv packages/cli/tests/check.test.ts          packages/cli/tests/commands/action/check/check.test.ts
git mv packages/cli/tests/check-manifest.test.ts packages/cli/tests/commands/action/check/check-manifest.test.ts
git mv packages/cli/tests/format-issues.test.ts  packages/cli/tests/commands/action/check/format-issues.test.ts
```

Open each test file and update its imports. The import-rewrite recipe:
- `"../src/commands/action/check.ts"` → `"../../../../src/commands/action/check/command.ts"` (and import the symbol named `checkCommand`)
- `"../src/lib/check-manifest.ts"` → `"../../../../src/commands/action/check/check-manifest.ts"`
- `"../src/lib/format-issues.ts"` → `"../../../../src/commands/action/check/format-issues.ts"`
- `"../src/lib/errors.ts"` → `"../../../../src/_shared/cli-error.ts"`
- `"../src/lib/exit-codes.ts"` → `"../../../../src/_shared/exit-codes.ts"`

(four-level `../../../..` because the new test path is 4 levels deep under `tests/`.)

- [ ] **Step 8: Run `vp run ready`.**

```bash
vp run ready
```
Expected: green. The check slice's three tests still pass.

- [ ] **Step 9: Commit.**

```bash
git add -A packages/cli/src/commands/action packages/cli/src/lib packages/cli/tests
git commit -m "refactor(cli): vertical-slice action check"
```

---

## Task 6: Vertical-slice `commands/action/install`

**Files:**
- Create: `packages/cli/src/commands/action/install/{command.ts, install-action.ts, receipt.ts}`.
- Move: `cli/src/lib/parse-short-ref.ts` → `cli/src/commands/action/install/parse-short-ref.ts`.
- Delete: `cli/src/commands/action/install.ts`.
- Modify: `cli/src/commands/action/index.ts` (import path).
- Move tests: `tests/install.test.ts`, `tests/install-registry.test.ts`, `tests/parse-short-ref.test.ts` → `tests/commands/action/install/*.test.ts` (rewire imports).

- [ ] **Step 1: Create slice folder and move slice-local helper.**

```bash
mkdir -p packages/cli/src/commands/action/install
git mv packages/cli/src/lib/parse-short-ref.ts packages/cli/src/commands/action/install/parse-short-ref.ts
```

Open `packages/cli/src/commands/action/install/parse-short-ref.ts`. Update the relative import:

```ts
import { UsageError } from "../../../_shared/cli-error.ts";
```

- [ ] **Step 2: Write `install-action.ts` (orchestration).**

`packages/cli/src/commands/action/install/install-action.ts`:

```ts
import { captureActionInstalled, resolveRegistryRoot } from "@aiactions/paths";
import {
  type EnsureCachedActionOptions,
  ensureCachedAction,
  fetchRegistry,
  groupByCoord,
  resolveLatest,
  resolveRegistryUrl,
} from "@aiactions/registry";
import * as clack from "@clack/prompts";

import packageJson from "../../../../package.json" with { type: "json" };
import { CliError, NotFoundError, UsageError } from "../../../_shared/cli-error.ts";
import { EXIT } from "../../../_shared/exit-codes.ts";
import { isInteractive } from "../../../_shared/output.ts";
import { parseRegistryRef } from "../../../_shared/parse-registry-ref.ts";
import { parseShortRef } from "./parse-short-ref.ts";

export interface InstallActionArgs {
  readonly ref: string | undefined;
  readonly json: boolean;
}

export interface InstallReceiptEntry {
  readonly ref: string;
  readonly dir: string;
  readonly fetched: boolean;
  readonly resolvedVersion: string;
  readonly resolvedSha: string;
}

export interface InstallActionResult {
  readonly entries: InstallReceiptEntry[];
}

interface InstallOpts {
  readonly registryRoot: string;
  readonly canonicalUrl: string | undefined;
  readonly interactive: boolean;
  readonly json: boolean;
}

async function installRef(
  refLabel: string,
  ref: { namespace: string; name: string; version: string },
  opts: InstallOpts,
): Promise<InstallReceiptEntry> {
  const ensureOpts: EnsureCachedActionOptions = opts.canonicalUrl
    ? { canonicalUrl: opts.canonicalUrl }
    : {};

  let spinner: ReturnType<typeof clack.spinner> | undefined;
  if (opts.interactive) {
    spinner = clack.spinner();
    spinner.start(`fetching ${refLabel}`);
  }

  try {
    const result = await ensureCachedAction(ref, opts.registryRoot, process.cwd(), ensureOpts);
    spinner?.stop(result.fetched ? `installed ${refLabel}` : `already cached ${refLabel}`);

    captureActionInstalled({
      namespace: ref.namespace,
      name: ref.name,
      version: ref.version,
      ...(result.resolvedVersion !== ref.version
        ? { resolvedVersion: result.resolvedVersion }
        : {}),
      source: opts.canonicalUrl !== undefined ? "custom" : "canonical",
      aiactionsVersion: packageJson.version,
    });

    return {
      ref: refLabel,
      dir: result.dir,
      fetched: result.fetched,
      resolvedVersion: result.resolvedVersion,
      resolvedSha: result.resolvedSha,
    };
  } catch (err) {
    spinner?.stop(`failed: ${refLabel}`, 1);
    throw new CliError(
      EXIT.RUNTIME,
      `install failed for ${refLabel}: ${(err as Error).message}`,
      err,
    );
  }
}

export async function runInstallAction(args: InstallActionArgs): Promise<InstallActionResult> {
  const registryRoot = resolveRegistryRoot();
  const interactive = isInteractive(args.json);
  const canonicalUrl = process.env.AIACTIONS_CANONICAL_URL;
  const baseOpts: InstallOpts = { registryRoot, canonicalUrl, interactive, json: args.json };
  const entries: InstallReceiptEntry[] = [];

  if (args.ref && args.ref.includes("@")) {
    const ref = parseRegistryRef(args.ref);
    entries.push(
      await installRef(
        args.ref,
        { namespace: ref.namespace, name: ref.name, version: ref.version },
        baseOpts,
      ),
    );
    return { entries };
  }

  if (args.ref) {
    const short = parseShortRef(args.ref);
    const reg = await fetchRegistry(resolveRegistryUrl(process.env));
    const entry = resolveLatest(reg, short.ns, short.name);
    if (!entry) {
      throw new NotFoundError(
        `no action '${short.ns}/${short.name}' in registry. Run 'aia action list' to see available actions.`,
      );
    }
    const full = parseRegistryRef(entry.ref);
    entries.push(
      await installRef(
        entry.ref,
        { namespace: full.namespace, name: full.name, version: full.version },
        baseOpts,
      ),
    );
    return { entries };
  }

  if (!interactive) {
    throw new UsageError("interactive picker requires a TTY. Pass an explicit ref.");
  }
  const reg = await fetchRegistry(resolveRegistryUrl(process.env));
  const grouped = groupByCoord(reg);
  if (grouped.size === 0) {
    process.stderr.write("registry is empty\n");
    return { entries };
  }
  const options = Array.from(grouped.entries()).map(([_coord, refs]) => ({
    value: refs[0]!.ref,
    label: `${refs[0]!.ref}  — ${refs[0]!.description}`,
  }));
  const picked = await clack.multiselect({
    message: "select actions to install (latest version)",
    options,
    required: false,
  });
  if (clack.isCancel(picked) || !Array.isArray(picked) || picked.length === 0) {
    return { entries };
  }
  for (const refLabel of picked as string[]) {
    const ref = parseRegistryRef(refLabel);
    entries.push(
      await installRef(
        refLabel,
        { namespace: ref.namespace, name: ref.name, version: ref.version },
        baseOpts,
      ),
    );
  }
  return { entries };
}
```

- [ ] **Step 3: Write `receipt.ts`.**

`packages/cli/src/commands/action/install/receipt.ts`:

```ts
import { isInteractive } from "../../../_shared/output.ts";
import type { InstallActionResult, InstallReceiptEntry } from "./install-action.ts";

function emitJsonOne(entry: InstallReceiptEntry): void {
  process.stdout.write(
    `${JSON.stringify({
      ref: entry.ref,
      dir: entry.dir,
      fetched: entry.fetched,
      resolvedVersion: entry.resolvedVersion,
      resolvedSha: entry.resolvedSha,
    })}\n`,
  );
}

function emitHumanOne(entry: InstallReceiptEntry, requestedVersion?: string): void {
  const tail =
    requestedVersion !== undefined && entry.resolvedVersion !== requestedVersion
      ? ` (resolved as ${entry.resolvedVersion})`
      : "";
  process.stderr.write(
    `${entry.fetched ? "✓ installed" : "✓ already cached"} ${entry.ref}${tail}\n`,
  );
}

export function writeInstallReceipt(json: boolean, result: InstallActionResult): void {
  const interactive = isInteractive(json);
  if (json) {
    for (const entry of result.entries) emitJsonOne(entry);
    return;
  }
  if (interactive) {
    // Spinner output already covered the human channel — nothing extra to print.
    return;
  }
  for (const entry of result.entries) emitHumanOne(entry);
}
```

> Note: the legacy `install.ts` mixed receipt emission into `installRef()` (inline JSON write or `stderr` "already cached" line). The new receipt module handles both paths uniformly. JSON output preserves the original on-the-wire shape verbatim.

- [ ] **Step 4: Write `command.ts`.**

`packages/cli/src/commands/action/install/command.ts`:

```ts
import { defineCommand } from "citty";

import { runInstallAction } from "./install-action.ts";
import { writeInstallReceipt } from "./receipt.ts";

export const installCommand = defineCommand({
  meta: {
    name: "install",
    description: "Install one or more actions from the registry into the local cache",
  },
  args: {
    ref: {
      type: "positional",
      description: "Registry coordinate '<ns>/<name>' or '<ns>/<name>@<ver>' (omit for picker)",
      required: false,
    },
    json: {
      type: "boolean",
      description: "Emit machine-readable JSON instead of human output",
      default: false,
    },
  },
  async run({ args }) {
    const json = args.json === true;
    const ref = typeof args.ref === "string" ? args.ref : undefined;
    const result = await runInstallAction({ ref, json });
    writeInstallReceipt(json, result);
  },
});
```

- [ ] **Step 5: Delete the legacy verb file.**

```bash
rm packages/cli/src/commands/action/install.ts
```

- [ ] **Step 6: Update the resource aggregator.**

Open `packages/cli/src/commands/action/index.ts`. Replace the `install` import:

```ts
import { installCommand } from "./install/command.ts";
```

- [ ] **Step 7: Move and rewire tests.**

```bash
mkdir -p packages/cli/tests/commands/action/install
git mv packages/cli/tests/install.test.ts          packages/cli/tests/commands/action/install/install.test.ts
git mv packages/cli/tests/install-registry.test.ts packages/cli/tests/commands/action/install/install-registry.test.ts
git mv packages/cli/tests/parse-short-ref.test.ts  packages/cli/tests/commands/action/install/parse-short-ref.test.ts
```

For each moved test, rewrite its imports per the recipe:
- `"../src/commands/action/install.ts"` → `"../../../../src/commands/action/install/command.ts"` (symbol = `installCommand`)
- `"../src/lib/parse-short-ref.ts"` → `"../../../../src/commands/action/install/parse-short-ref.ts"`
- `"../src/lib/registry.ts"` → `"@aiactions/registry"` (test now consumes brick exports)
- `"../src/lib/errors.ts"` → `"../../../../src/_shared/cli-error.ts"`
- Relative paths to `package.json` need to be updated to `"../../../../package.json"` (one extra hop).

If a test references the brick's `RegistryFetchError` or `RegistryValidationError`, import them directly from `@aiactions/registry`.

- [ ] **Step 8: Run `vp run ready`.**

```bash
vp run ready
```
Expected: green.

- [ ] **Step 9: Commit.**

```bash
git add -A packages/cli/src/commands/action packages/cli/src/lib packages/cli/tests
git commit -m "refactor(cli): vertical-slice action install"
```

---

## Task 7: Vertical-slice `commands/action/list`

**Files:**
- Create: `packages/cli/src/commands/action/list/{command.ts, list-actions.ts, receipt.ts}`.
- Delete: `cli/src/commands/action/list.ts`.
- Modify: `cli/src/commands/action/index.ts`.
- Move test: `tests/list-registry.test.ts` → `tests/commands/action/list/list-registry.test.ts`.

- [ ] **Step 1: Create slice folder.**

```bash
mkdir -p packages/cli/src/commands/action/list
```

- [ ] **Step 2: Write `list-actions.ts`.**

`packages/cli/src/commands/action/list/list-actions.ts`:

```ts
import { resolveRegistryRoot } from "@aiactions/paths";
import {
  type CachedEntry,
  fetchRegistry,
  groupByCoord,
  resolveRegistryUrl,
  walkCache,
} from "@aiactions/registry";
import type { Registry } from "@aiactions/schema";
import { rcompare as semverRcompare } from "semver";

export interface ListRow {
  readonly coord: string;
  readonly latestRegistry: string | null;
  readonly installedVersions: string[];
  readonly description: string | null;
  readonly localOnly: boolean;
}

export interface ListActionResult {
  readonly registryUrl: string | null;
  readonly registryError: string | null;
  readonly fetchedAt: string | null;
  readonly rows: ListRow[];
}

function refVersion(ref: string): string {
  return ref.slice(ref.lastIndexOf("@") + 1);
}

function buildRows(reg: Registry | null, cached: CachedEntry[]): ListRow[] {
  const cachedByCoord = new Map<string, string[]>();
  for (const c of cached) {
    const key = `${c.namespace}/${c.name}`;
    const versions = cachedByCoord.get(key) ?? [];
    versions.push(c.version);
    cachedByCoord.set(key, versions);
  }
  for (const v of cachedByCoord.values()) v.sort(semverRcompare);

  const rows: ListRow[] = [];
  const seen = new Set<string>();

  if (reg) {
    const grouped = groupByCoord(reg);
    for (const [coord, entries] of grouped.entries()) {
      const latest = entries[0]!;
      const installed = cachedByCoord.get(coord) ?? [];
      rows.push({
        coord,
        latestRegistry: refVersion(latest.ref),
        installedVersions: installed,
        description: latest.description,
        localOnly: false,
      });
      seen.add(coord);
    }
  }
  for (const [coord, versions] of cachedByCoord.entries()) {
    if (seen.has(coord)) continue;
    rows.push({
      coord,
      latestRegistry: null,
      installedVersions: versions,
      description: null,
      localOnly: true,
    });
  }
  rows.sort((a, b) => a.coord.localeCompare(b.coord));
  return rows;
}

export async function runListAction(): Promise<ListActionResult> {
  const registryRoot = resolveRegistryRoot();
  const cached = await walkCache(registryRoot);

  let reg: Registry | null = null;
  let registryError: string | null = null;
  let registryUrl: string | null = null;
  let fetchedAt: string | null = null;
  try {
    registryUrl = resolveRegistryUrl(process.env);
    reg = await fetchRegistry(registryUrl);
    fetchedAt = new Date().toISOString();
  } catch (err) {
    registryError = (err as Error).message;
  }

  const rows = buildRows(reg, cached);
  return { registryUrl, registryError, fetchedAt, rows };
}
```

- [ ] **Step 3: Write `receipt.ts`.**

`packages/cli/src/commands/action/list/receipt.ts`:

```ts
import type { ListActionResult, ListRow } from "./list-actions.ts";

function renderHuman(rows: ListRow[]): string {
  const lines: string[] = [];
  for (const r of rows) {
    if (r.localOnly) continue;
    const head = `${r.coord}@${r.latestRegistry}`;
    const desc = r.description ? `  — ${r.description}` : "";
    let badge = "";
    if (r.installedVersions.length > 0) {
      const matchesLatest = r.installedVersions.includes(r.latestRegistry!);
      if (matchesLatest) {
        badge = "  [installed]";
      } else {
        badge = `  [installed, registry has @${r.latestRegistry}, cache has @${r.installedVersions[0]}]`;
      }
    }
    lines.push(`${head}${desc}${badge}`);
  }
  const localOnly = rows.filter((r) => r.localOnly);
  if (localOnly.length > 0) {
    lines.push("");
    lines.push("Local only:");
    for (const r of localOnly) {
      for (const v of r.installedVersions) {
        lines.push(`  ${r.coord}@${v}`);
      }
    }
  }
  return lines.join("\n");
}

export function writeListReceipt(json: boolean, result: ListActionResult): void {
  if (json) {
    const out = {
      registry: result.registryUrl
        ? { url: result.registryUrl, fetchedAt: result.fetchedAt }
        : null,
      registryError: result.registryError,
      entries: result.rows,
    };
    process.stdout.write(`${JSON.stringify(out)}\n`);
    return;
  }

  if (result.registryError) {
    process.stderr.write(
      `registry unreachable: ${result.registryError}; showing local cache only\n`,
    );
  }
  if (result.rows.length === 0) {
    process.stderr.write("no actions to list\n");
    return;
  }
  process.stdout.write(`${renderHuman(result.rows)}\n`);
}
```

- [ ] **Step 4: Write `command.ts`.**

`packages/cli/src/commands/action/list/command.ts`:

```ts
import { defineCommand } from "citty";

import { runListAction } from "./list-actions.ts";
import { writeListReceipt } from "./receipt.ts";

export const listCommand = defineCommand({
  meta: {
    name: "list",
    description:
      "List actions from the registry, with installed/outdated badges from the local cache",
  },
  args: {
    json: {
      type: "boolean",
      description: "Emit machine-readable JSON instead of human output",
      default: false,
    },
  },
  async run({ args }) {
    const result = await runListAction();
    writeListReceipt(args.json === true, result);
  },
});
```

- [ ] **Step 5: Delete the old verb file.**

```bash
rm packages/cli/src/commands/action/list.ts
```

- [ ] **Step 6: Update the resource aggregator.**

Open `packages/cli/src/commands/action/index.ts`. Replace the `list` import:

```ts
import { listCommand } from "./list/command.ts";
```

- [ ] **Step 7: Move and rewire the test.**

```bash
mkdir -p packages/cli/tests/commands/action/list
git mv packages/cli/tests/list-registry.test.ts packages/cli/tests/commands/action/list/list-registry.test.ts
```

Rewire imports in that test file:
- `"../src/commands/action/list.ts"` → `"../../../../src/commands/action/list/command.ts"` (symbol = `listCommand`)
- `"../src/lib/registry.ts"` → `"@aiactions/registry"`
- `"../src/lib/walk-cache.ts"` → `"@aiactions/registry"`

- [ ] **Step 8: Run `vp run ready`.**

```bash
vp run ready
```
Expected: green.

- [ ] **Step 9: Commit.**

```bash
git add -A packages/cli/src/commands/action packages/cli/tests
git commit -m "refactor(cli): vertical-slice action list"
```

---

## Task 8: Vertical-slice `commands/action/uninstall`

**Files:**
- Create: `packages/cli/src/commands/action/uninstall/{command.ts, uninstall-action.ts, receipt.ts}`.
- Delete: `cli/src/commands/action/uninstall.ts`.
- Modify: `cli/src/commands/action/index.ts`.
- Move test: `tests/uninstall.test.ts` → `tests/commands/action/uninstall/uninstall.test.ts`.

- [ ] **Step 1: Create slice folder.**

```bash
mkdir -p packages/cli/src/commands/action/uninstall
```

- [ ] **Step 2: Write `uninstall-action.ts`.**

`packages/cli/src/commands/action/uninstall/uninstall-action.ts`:

```ts
import { readdir, rm, stat } from "node:fs/promises";
import { dirname, join } from "node:path";

import { resolveRegistryRoot } from "@aiactions/paths";
import { type CachedEntry, walkCache } from "@aiactions/registry";
import * as clack from "@clack/prompts";

import { NotFoundError, UsageError } from "../../../_shared/cli-error.ts";
import { isInteractive } from "../../../_shared/output.ts";
import { parseRegistryRef } from "../../../_shared/parse-registry-ref.ts";

export interface UninstallActionArgs {
  readonly ref: string | undefined;
  readonly yes: boolean;
  readonly json: boolean;
}

export interface UninstallReceiptEntry {
  readonly ref: string;
  readonly dir: string;
}

export interface UninstallActionResult {
  readonly removed: UninstallReceiptEntry[];
  readonly skipped: UninstallReceiptEntry[];
}

async function pathExists(p: string): Promise<boolean> {
  try {
    await stat(p);
    return true;
  } catch {
    return false;
  }
}

async function removeAndPrune(dir: string, root: string): Promise<void> {
  await rm(dir, { recursive: true, force: true });
  let parent = dirname(dir);
  while (parent !== root && parent.startsWith(root)) {
    let siblings: string[];
    try {
      siblings = await readdir(parent);
    } catch {
      break;
    }
    if (siblings.length > 0) break;
    await rm(parent, { recursive: true, force: true });
    parent = dirname(parent);
  }
}

async function runInteractive(
  registryRoot: string,
  skipConfirm: boolean,
): Promise<UninstallReceiptEntry[]> {
  const entries = await walkCache(registryRoot);
  if (entries.length === 0) {
    process.stderr.write("no cached actions\n");
    return [];
  }

  const picks = await clack.multiselect<CachedEntry>({
    message: "select actions to remove",
    options: entries.map((e) => ({
      label: `${e.namespace}/${e.name}@${e.version}`,
      value: e,
    })),
    required: false,
  });

  if (clack.isCancel(picks) || picks.length === 0) return [];

  if (!skipConfirm) {
    const ok = await clack.confirm({
      message: `remove ${picks.length} ${picks.length === 1 ? "entry" : "entries"}?`,
    });
    if (clack.isCancel(ok) || ok === false) return [];
  }

  const removed: UninstallReceiptEntry[] = [];
  for (const pick of picks) {
    await removeAndPrune(pick.dir, registryRoot);
    removed.push({
      ref: `${pick.namespace}/${pick.name}@${pick.version}`,
      dir: pick.dir,
    });
  }
  return removed;
}

export async function runUninstallAction(
  args: UninstallActionArgs,
): Promise<UninstallActionResult> {
  const registryRoot = resolveRegistryRoot();
  const interactive = isInteractive(args.json);

  if (!args.ref) {
    if (args.json) {
      throw new UsageError(
        "--json mode requires <ref> + --yes; multi-select is not available in JSON mode",
      );
    }
    if (!interactive) {
      throw new UsageError("<ref> required in non-interactive mode (no TTY)");
    }
    const removed = await runInteractive(registryRoot, args.yes);
    return { removed, skipped: [] };
  }

  const ref = parseRegistryRef(args.ref);
  const dir = join(registryRoot, ref.namespace, ref.name, ref.version);

  if (!(await pathExists(dir))) {
    throw new NotFoundError(`not in cache: ${args.ref}`);
  }

  if (!args.yes) {
    if (!interactive) {
      throw new UsageError("refusing destructive op without --yes (non-interactive)");
    }
    const ok = await clack.confirm({ message: `remove ${args.ref}?` });
    if (clack.isCancel(ok) || ok === false) {
      return { removed: [], skipped: [{ ref: args.ref, dir }] };
    }
  }

  await removeAndPrune(dir, registryRoot);
  return { removed: [{ ref: args.ref, dir }], skipped: [] };
}
```

- [ ] **Step 3: Write `receipt.ts`.**

`packages/cli/src/commands/action/uninstall/receipt.ts`:

```ts
import type { UninstallActionResult } from "./uninstall-action.ts";

export function writeUninstallReceipt(json: boolean, result: UninstallActionResult): void {
  if (json) {
    process.stdout.write(
      `${JSON.stringify({ removed: result.removed, skipped: result.skipped })}\n`,
    );
    return;
  }
  for (const r of result.removed) {
    process.stderr.write(`✓ removed ${r.ref}\n`);
  }
}
```

- [ ] **Step 4: Write `command.ts`.**

`packages/cli/src/commands/action/uninstall/command.ts`:

```ts
import { defineCommand } from "citty";

import { runUninstallAction } from "./uninstall-action.ts";
import { writeUninstallReceipt } from "./receipt.ts";

export const uninstallCommand = defineCommand({
  meta: {
    name: "uninstall",
    description: "Remove cached actions; pick interactively when no ref given",
  },
  args: {
    ref: {
      type: "positional",
      description: "Registry coordinate '<ns>/<name>@<ver>' (omit for picker)",
      required: false,
    },
    yes: {
      type: "boolean",
      description: "Skip the confirmation prompt",
      default: false,
    },
    json: {
      type: "boolean",
      description: "Emit machine-readable JSON instead of human output",
      default: false,
    },
  },
  async run({ args }) {
    const json = args.json === true;
    const result = await runUninstallAction({
      ref: typeof args.ref === "string" ? args.ref : undefined,
      yes: args.yes === true,
      json,
    });
    writeUninstallReceipt(json, result);
  },
});
```

- [ ] **Step 5: Delete the old verb file.**

```bash
rm packages/cli/src/commands/action/uninstall.ts
```

- [ ] **Step 6: Update the resource aggregator.**

Open `packages/cli/src/commands/action/index.ts`. Replace the `uninstall` import:

```ts
import { uninstallCommand } from "./uninstall/command.ts";
```

- [ ] **Step 7: Move and rewire the test.**

```bash
mkdir -p packages/cli/tests/commands/action/uninstall
git mv packages/cli/tests/uninstall.test.ts packages/cli/tests/commands/action/uninstall/uninstall.test.ts
```

Rewire imports per the recipe:
- `"../src/commands/action/uninstall.ts"` → `"../../../../src/commands/action/uninstall/command.ts"` (symbol = `uninstallCommand`)
- `"../src/lib/walk-cache.ts"` → `"@aiactions/registry"`
- `"../src/lib/errors.ts"` → `"../../../../src/_shared/cli-error.ts"`

- [ ] **Step 8: Run `vp run ready`.**

```bash
vp run ready
```
Expected: green. All four slices now exist.

- [ ] **Step 9: Commit.**

```bash
git add -A packages/cli/src/commands/action packages/cli/tests
git commit -m "refactor(cli): vertical-slice action uninstall"
```

---

## Task 9: Delete the legacy `cli/src/lib/`

**Files:**
- Delete: `packages/cli/src/lib/` entirely (registry.ts, walk-cache.ts).

After Task 8, the only files left under `cli/src/lib/` are `registry.ts` and `walk-cache.ts` — both are now unused (consumers were rewired to `@aiactions/registry` in Tasks 6–8).

- [ ] **Step 1: Confirm the folder is unused.**

```bash
grep -rn 'src/lib/' packages/cli/src packages/cli/tests --include='*.ts'
```
Expected: empty output. If any consumer remains, fix it before deleting.

- [ ] **Step 2: Delete the folder.**

```bash
rm -r packages/cli/src/lib
ls packages/cli/src
```
Expected: `src` lists `_shared`, `cli.ts`, `commands`. No `lib`.

- [ ] **Step 3: Run `vp run ready`.**

```bash
vp run ready
```
Expected: green.

- [ ] **Step 4: Commit.**

```bash
git add -A packages/cli/src
git commit -m "refactor(cli): delete legacy cli/src/lib"
```

---

## Task 10: Mirror tests tree under `cli/tests/`

After Tasks 4–8 the test files have been moved under `tests/_shared/` and `tests/commands/action/<verb>/`. The only remaining flat test files are `tests/bin-integration.test.ts` (E2E — must stay flat at the top level) and the `tests/fixtures/` directory (shared helpers — must stay flat at the top level).

- [ ] **Step 1: Confirm the tree matches §4.1 of the spec.**

```bash
find packages/cli/tests -type f | sort
```

Expected output:

```
packages/cli/tests/_shared/cli-error.test.ts
packages/cli/tests/_shared/output.test.ts
packages/cli/tests/_shared/parse-registry-ref.test.ts
packages/cli/tests/bin-integration.test.ts
packages/cli/tests/commands/action/check/check-manifest.test.ts
packages/cli/tests/commands/action/check/check.test.ts
packages/cli/tests/commands/action/check/format-issues.test.ts
packages/cli/tests/commands/action/install/install-registry.test.ts
packages/cli/tests/commands/action/install/install.test.ts
packages/cli/tests/commands/action/install/parse-short-ref.test.ts
packages/cli/tests/commands/action/list/list-registry.test.ts
packages/cli/tests/commands/action/uninstall/uninstall.test.ts
packages/cli/tests/fixtures/make-bare-repo.ts
packages/cli/tests/fixtures/manifests/invalid-schema.yaml
packages/cli/tests/fixtures/manifests/malformed.yaml
packages/cli/tests/fixtures/manifests/valid.yaml
packages/cli/tests/fixtures/registry-server.ts
packages/cli/tests/fixtures/run-cli.ts
packages/cli/tests/fixtures/with-temp-home.ts
```

If any test file is missing or in the wrong place, restore from `git status` / `git mv` and re-run.

- [ ] **Step 2: Verify nothing remains at top-level that should be nested.**

```bash
ls packages/cli/tests/*.ts
```
Expected: only `bin-integration.test.ts` (single file).

- [ ] **Step 3: Run `vp test -F packages/cli`.**

```bash
vp test -F packages/cli
```
Expected: every test passes — same count as before phase 5 (minus the two relocated to brick).

(No commit at this task — the moves were committed alongside each slice in Tasks 4–8. This task is the verification gate.)

---

## Task 11: Anti-duplication grep gate + full verification

- [ ] **Step 1: Symbol uniqueness (registry-domain).**

```bash
grep -rn 'fetchRegistry\|REGISTRY_URL_DEFAULT\|resolveRegistryUrl\|groupByCoord\|resolveLatest' packages/ --include='*.ts' | grep -v dist | grep -v node_modules
```
Expected: every match falls under `packages/registry/src/index-fetch.ts` (definitions) or test/consumer files importing from `@aiactions/registry`. Zero matches under `packages/cli/src/lib/` (which no longer exists). Zero matches under any `cli/src/` file other than the test relics that import the brick names.

- [ ] **Step 2: Symbol uniqueness (cache).**

```bash
grep -rn 'walkCache\|CachedEntry' packages/ --include='*.ts' | grep -v dist | grep -v node_modules
```
Expected: definition only in `packages/registry/src/cache.ts`; consumers in `packages/cli/src/commands/action/{list,uninstall}/` import from `@aiactions/registry`.

- [ ] **Step 3: Error-class uniqueness.**

```bash
grep -rn 'class RegistryFetchError\|class RegistryValidationError\|class RegistryResolveError\|class RegistryError' packages/ --include='*.ts' | grep -v dist | grep -v node_modules
```
Expected: four definitions only, all in `packages/registry/src/errors.ts`.

- [ ] **Step 4: `cli/src/lib` uniqueness.**

```bash
grep -rn 'cli/src/lib\|src/lib/' packages/cli --include='*.ts'
```
Expected: empty output.

- [ ] **Step 5: Full `vp run ready`.**

```bash
vp run ready
```
Expected: green across the entire monorepo.

- [ ] **Step 6: Smoke-test the binary.**

Build then run:

```bash
vp run -r build
node packages/cli/bin/aia.mjs --help
node packages/cli/bin/aia.mjs action --help
node packages/cli/bin/aia.mjs action check --help
node packages/cli/bin/aia.mjs action install --help
node packages/cli/bin/aia.mjs action list --help
node packages/cli/bin/aia.mjs action uninstall --help
```
Expected: every help screen renders. Subcommand list under `aia action` shows `check, install, list, uninstall` exactly as before. `aia --version` prints the same version as `packages/cli/package.json`.

(No commit at this task — it is a verification gate. If anything fails, fix it on a focused commit before moving on.)

---

## Task 12: Merge `--no-ff` to `main` (USER APPROVAL REQUIRED)

> **STOP — DO NOT EXECUTE without explicit user approval.** Merging into `main` is a hard-to-reverse operation. Surface the merge plan, the squash diff, and the per-component bumps release-please will infer; wait for the user to say "go" before running `git merge`.

- [ ] **Step 1: Surface the per-component commit list.**

From the worktree directory (`/home/aperrix/Documents/PROJECTS/aiactions-phase-5`):

```bash
git log --oneline main..HEAD
```
Expected output (~10 commits): `feat(registry): add RegistryValidationError`, `feat(registry): add index-fetch module …`, `feat(registry): add cache module`, `refactor(cli): introduce _shared/ folder, consume brick errors`, `refactor(cli): vertical-slice action check`, `refactor(cli): vertical-slice action install`, `refactor(cli): vertical-slice action list`, `refactor(cli): vertical-slice action uninstall`, `refactor(cli): delete legacy cli/src/lib`. (Order may differ; commit count may vary if a fix-up was needed.)

- [ ] **Step 2: Switch to `main` (in the original checkout).**

```bash
cd /home/aperrix/Documents/PROJECTS/aiactions
git checkout main
git pull --ff-only
```
Expected: `main` is up-to-date with origin.

- [ ] **Step 3: Merge `--no-ff` (after explicit user approval).**

```bash
git merge --no-ff worktree-phase-5-cli-vertical-slices -m "Merge phase-5: vertical-slice CLI per (resource, verb) + migrate registry-domain helpers to @aiactions/registry"
git log --oneline -5
```
Expected: a single merge commit on `main` with all the per-component commits visible underneath via `git log`.

- [ ] **Step 4: Push to origin (after second user approval).**

```bash
git push origin main
```
Expected: pushed.

- [ ] **Step 5: Cleanup the worktree.**

```bash
git worktree remove ../aiactions-phase-5
git branch -d worktree-phase-5-cli-vertical-slices
```
Expected: worktree directory is gone; branch is deleted (the merge commit on `main` keeps history).

- [ ] **Step 6: Trigger codebase-memory re-index.**

```bash
mcp__codebase-memory-mcp__detect_changes project="home-aperrix-Documents-PROJECTS-aiactions" since="HEAD~10"
```
If structural drift is reported, re-index in `moderate` mode.

- [ ] **Step 7: Persist phase-5 result in MuninnDB.**

Use `muninn_remember` with `vault: "aiactions"` and concept `phase-5-cli-vertical-slices-shipped` summarizing: branch, merge commit hash, files moved, version bumps released, and the next planned phase (`phase-6` adds `aia workflow list/run/check`).

---

## Self-review summary

Cross-checking this plan against the spec:

- **§4.1 layout** → covered by Tasks 4–8 (each slice + `_shared/`).
- **§4.2 brick additions** → covered by Tasks 1–3 (`RegistryValidationError`, `index-fetch.ts`, `cache.ts`).
- **§5 migration map** → every cell of the table maps to a step in Tasks 4–8.
- **§6 slice file conventions** → enforced by the structure of Tasks 5–8 (each defines `command.ts`, `<verb>-<resource>.ts`, `receipt.ts` plus slice-local helpers).
- **§7 error-handling consolidation** → Tasks 1 (brick error class) + 4 (CLI `_shared/cli-error.ts` + import-rewire). The `EXIT_BY_BRICK_ERROR` table mentioned in the spec is a logical structure that lives inside `cli.ts` — no new code path is required for phase 5 because the existing `try { … } catch (err)` in `cli.ts` already handles `CliError`. **Note:** the spec proposes building a richer mapping in `_shared/exit-codes.ts`. This plan keeps `cli.ts`'s catch logic identical to today (CLI errors map directly via their `code`; brick errors fall through to `EXIT.RUNTIME`). If the user wants the `EXIT_BY_BRICK_ERROR` lookup wired in this phase, add a follow-up step in Task 4 — see footnote.
- **§8 branching** → Task 0 worktree, per-task commits with valid Conv-Commits, Task 12 `--no-ff` merge.
- **§9 testing** → Tasks 1, 2, 3 (brick tests added/moved). Tasks 4–8 (CLI tests moved + import-rewired). Task 10 verification.
- **§10 anti-dup** → Task 11.

**Footnote — `EXIT_BY_BRICK_ERROR` wiring (optional in-phase):** if you want the spec's table operationalized this phase, add a Task 4.5 that:
1. Adds an `EXIT_BY_BRICK_ERROR: ReadonlyMap<typeof AIactionsError, ExitCode>` table to `_shared/exit-codes.ts`.
2. Modifies `cli.ts`'s catch to: `if (err instanceof AIactionsError) process.exit(EXIT_BY_BRICK_ERROR.get(err.constructor) ?? EXIT.RUNTIME);` before the generic `instanceof Error` branch.
3. Adds a unit test asserting each known brick error class maps to its expected exit code.

Without that step, brick errors thrown in CLI handlers will exit with code `1` (current default). End-user-visible only when a domain error reaches the top-level catch — most CLI handlers already wrap brick errors into `CliError` with the right exit code at call sites, so the end-state today is mostly equivalent. Recommend deferring this wiring to a follow-up unless we discover a regression in Task 11's smoke test.

---

## Plan complete

Plan saved at `docs/superpowers/plans/2026-05-10-phase-5-cli-vertical-slices.md`.
