# Phase 4 — Split `@aiactions/runtime` Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Split `@aiactions/runtime` into four new packages — `@aiactions/expression` (leaf), `@aiactions/exec` (leaf), `@aiactions/registry`, and `@aiactions/core` (composer) — introduce the `AIactionsError` hierarchy in `@aiactions/schema`, migrate consumers (`@aiactions/cli`), and delete `@aiactions/runtime`. **BREAKING** — `feat(runtime)!:` major; release-please bumps expression/exec/registry/core to `1.0.0` and removes the runtime tracker.

**Architecture:** Phase 4 of the 6-phase architecture restructure (`docs/superpowers/specs/2026-05-09-architecture-restructure-design.md`, sections 7.4–7.6, 7.9, 10, 12). Four new packages take over the runtime scope:

- `@aiactions/expression` — leaf, pure `${{ ... }}` evaluator. 1 src file + errors.
- `@aiactions/exec` — leaf, spawn primitives + `uses-loader.mjs` + FD3 protocol. 7 src files + 1 .mjs + errors.
- `@aiactions/registry` — depends on `@aiactions/schema` + `@aiactions/paths` + `@aiactions/git`. Lockfile + fetch + version resolve. 3 src files + errors.
- `@aiactions/core` — depends on schema + parser + registry + expression + exec + paths + git. Stateful orchestrators (`runWorkflow`, `runJob`, `resolveUsesRef`). 4 src files + errors.

**Tech Stack:** TypeScript (strict + verbatimModuleSyntax + isolatedModules), `semver`, Vite+ test runner, ESM-only.

**Worktree:** This plan assumes execution from a fresh git worktree named `worktree-phase+4-runtime-split` (per phase-3 precedent). Create it before Task 1 via `superpowers:using-git-worktrees` if not already done.

---

## Source-to-Package Map (runtime → 4 new packages)

| Current file (in `packages/runtime/src/`) | Target package          | Target file                                    |
| ----------------------------------------- | ----------------------- | ---------------------------------------------- |
| `eval/expression.ts`                      | `@aiactions/expression` | `src/evaluate.ts`                              |
| `exec/spawn.ts`                           | `@aiactions/exec`       | `src/spawn-shell.ts`                           |
| `exec/shell-spec.ts`                      | `@aiactions/exec`       | `src/shell-spec.ts`                            |
| `exec/script-file.ts`                     | `@aiactions/exec`       | `src/script-file.ts`                           |
| `runner/uses/exec.ts`                     | `@aiactions/exec`       | `src/spawn-uses.ts`                            |
| `runner/uses/protocol.ts`                 | `@aiactions/exec`       | `src/protocol.ts`                              |
| `runner/uses/context.ts`                  | `@aiactions/exec`       | `src/context.ts`                               |
| `runner/uses/loader.mjs`                  | `@aiactions/exec`       | `src/loader.mjs`                               |
| `lockfile.ts`                             | `@aiactions/registry`   | `src/lockfile.ts`                              |
| `runner/uses/registry-fetch.ts` (split)   | `@aiactions/registry`   | `src/fetch.ts` + `src/resolve.ts`              |
| `run-workflow.ts`                         | `@aiactions/core`       | `src/run-workflow.ts`                          |
| `runner/job.ts`                           | `@aiactions/core`       | `src/runner/run-job.ts`                        |
| `runner/uses/resolver.ts`                 | `@aiactions/core`       | `src/runner/resolve-uses.ts`                   |
| `types/options.ts`                        | `@aiactions/core`       | `src/run-options.ts`                           |
| `types/run.ts`                            | `@aiactions/schema`     | `src/types/run.ts` (additive — see Task 3)     |
| `types/events.ts`                         | `@aiactions/schema`     | `src/types/events.ts` (additive — see Task 3)  |
| `types/errors.ts`                         | distributed             | per-package `src/errors.ts` (rename — Task 2+) |
| `index.ts`                                | (deleted)               | each new package owns its own `src/index.ts`   |

`packages/runtime/` is **deleted** at task 9.

## Error Class Rename Map

Per spec section 10.1, runtime errors are reorganised into the `AIactionsError` hierarchy. `AIactionsError` itself lives in `@aiactions/schema`; subclasses live with the package that raises them.

| Current class (in `runtime/types/errors.ts`)    | Target class           | Target package          | Notes                                                                                                    |
| ----------------------------------------------- | ---------------------- | ----------------------- | -------------------------------------------------------------------------------------------------------- |
| (new)                                           | `AIactionsError`       | `@aiactions/schema`     | Abstract base — every typed error in the system extends this.                                            |
| `ExpressionEvalError`                           | `ExpressionError`      | `@aiactions/expression` | Rename only.                                                                                             |
| `RuntimeUnsupportedError` (raised by `exec/`)   | `ExecError`            | `@aiactions/exec`       | Folded — was raised by `shell-spec.ts` for unsupported shell + missing `{0}`.                            |
| `ActionProtocolError`                           | `ExecError`            | `@aiactions/exec`       | Folded — was raised by `protocol.ts` + `runner/uses/exec.ts`.                                            |
| `LockfileVersionMismatch`                       | `RegistryError`        | `@aiactions/registry`   | Single concrete subclass of `RegistryError` for lockfile-version drift.                                  |
| `ActionResolutionError` (registry-fetch-side)   | `RegistryFetchError`   | `@aiactions/registry`   | Clone, sparse-checkout, rev-parse, dir-not-found-after-fetch failures.                                   |
| (split)                                         | `RegistryResolveError` | `@aiactions/registry`   | `ls-remote` failure + no matching major-range tag.                                                       |
| `RuntimeUnsupportedError` (raised by `runner/`) | `RunnerError`          | `@aiactions/core`       | Folded — was raised by `runner/job.ts` (run/uses missing) and `runner/uses/resolver.ts` (non-node).      |
| `ActionResolutionError` (resolver-side)         | `RunnerError`          | `@aiactions/core`       | Folded — was raised by `runner/uses/resolver.ts` (workflowFile/registryRoot/cwd missing, dir not found). |
| `ActionManifestError`                           | `RunnerError`          | `@aiactions/core`       | Folded — wraps `WorkflowParseError`/`WorkflowSchemaError` from `parser`.                                 |
| `StepFailedError`                               | (deleted — unused)     | —                       | Declared but never thrown anywhere. YAGNI.                                                               |

`JobError` is declared in spec 10.1 but no current call site needs it; defined as a `RunnerError` subclass for future use, exported from `@aiactions/core`.

## Test Migration Map (26 files → 4 packages)

| Current test file (in `packages/runtime/tests/`) | Target package            |
| ------------------------------------------------ | ------------------------- |
| `expression.test.ts`                             | `@aiactions/expression`   |
| `exec-shell-spec-custom.test.ts`                 | `@aiactions/exec`         |
| `exec-shell-spec-fallback.test.ts`               | `@aiactions/exec`         |
| `exec-shell-spec-python.test.ts`                 | `@aiactions/exec`         |
| `script-file.test.ts`                            | `@aiactions/exec`         |
| `shell-spec.test.ts`                             | `@aiactions/exec`         |
| `spawn.test.ts`                                  | `@aiactions/exec`         |
| `runner-uses-exec.test.ts`                       | `@aiactions/exec`         |
| `runner-uses-loader.test.ts`                     | `@aiactions/exec`         |
| `runner-uses-protocol.test.ts`                   | `@aiactions/exec`         |
| `runner-uses-types.test.ts`                      | `@aiactions/exec`         |
| `lockfile.test.ts`                               | `@aiactions/registry`     |
| `runner-uses-registry-fetch.test.ts`             | `@aiactions/registry`     |
| `runner-uses-registry-fetch-fetch.test.ts`       | `@aiactions/registry`     |
| `runner-uses-registry-integration.test.ts`       | `@aiactions/registry`     |
| `runner-uses-resolve-range.test.ts`              | `@aiactions/registry`     |
| `run-workflow.test.ts`                           | `@aiactions/core`         |
| `runner-job.test.ts`                             | `@aiactions/core`         |
| `runner-job-defaults-shell.test.ts`              | `@aiactions/core`         |
| `runner-job-defaults-workdir.test.ts`            | `@aiactions/core`         |
| `runner-outputs-eval.test.ts`                    | `@aiactions/core`         |
| `runner-uses.test.ts`                            | `@aiactions/core`         |
| `runner-uses-resolver.test.ts`                   | `@aiactions/core`         |
| `runner-uses-claude-agent.test.ts`               | `@aiactions/core`         |
| `e2e.test.ts`                                    | `@aiactions/core`         |
| `public-api.test.ts`                             | (drop — runtime-specific) |
| `fixtures/`                                      | distribute as needed      |

## Internal Dependency Updates (after split)

| File location                                      | Old import path                                                   | New import path                                                                       |
| -------------------------------------------------- | ----------------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| `expression/src/evaluate.ts`                       | `../types/errors.ts`                                              | `./errors.ts`                                                                         |
| `expression/src/evaluate.ts`                       | `@aiactions/schema` (`tokenizeExpression`)                        | `@aiactions/schema` (unchanged)                                                       |
| `exec/src/shell-spec.ts`                           | `../types/errors.ts`                                              | `./errors.ts`                                                                         |
| `exec/src/spawn-uses.ts`                           | `../../types/errors.ts`, `../../types/events.ts`                  | `./errors.ts`, `@aiactions/schema`                                                    |
| `exec/src/protocol.ts`                             | `../../types/errors.ts`, `./context.ts`                           | `./errors.ts`, `./context.ts`                                                         |
| `registry/src/fetch.ts`, `registry/src/resolve.ts` | `@aiactions/git`, `../../types/errors.ts`                         | `@aiactions/git` (unchanged), `./errors.ts`                                           |
| `registry/src/lockfile.ts`                         | `./runner/uses/registry-fetch.ts` (`RegistryCoordinate`)          | `./resolve.ts` (RegistryCoordinate moves with resolve)                                |
| `core/src/run-workflow.ts`                         | `./eval/expression.ts`, `./exec/shell-spec.ts`, `./runner/job.ts` | `@aiactions/expression`, `@aiactions/exec`, `./runner/run-job.ts`                     |
| `core/src/runner/run-job.ts`                       | many — see Task 7                                                 | mix of `@aiactions/expression`, `@aiactions/exec`, `./resolve-uses.ts`, `./errors.ts` |
| `core/src/runner/resolve-uses.ts`                  | `@aiactions/parser`, `@aiactions/schema`, `./registry-fetch.ts`   | `@aiactions/parser`, `@aiactions/schema`, `@aiactions/registry`                       |

## Consumer Migration Map

| Consumer                                        | Old import surface                                                       | New import surface                                                        |
| ----------------------------------------------- | ------------------------------------------------------------------------ | ------------------------------------------------------------------------- |
| `@aiactions/cli` (`commands/action/install.ts`) | `@aiactions/runtime` (`ensureCachedAction`, `EnsureCachedActionOptions`) | `@aiactions/registry` (`ensureCachedAction`, `EnsureCachedActionOptions`) |
| Root `package.json` devDeps                     | (none referencing `@aiactions/runtime`)                                  | (no change)                                                               |

`@aiactions/cli` `package.json`: dep `@aiactions/runtime` → `@aiactions/registry` (single dep replaces single dep).

`runWorkflow` is currently exported by `@aiactions/runtime/index.ts` but **has no in-repo consumer** today (the `aia workflow run` command is part of phase 6, MS1.9). It is preserved as the public API of `@aiactions/core` for phase 6.

## File Structure (target)

```
packages/expression/
  package.json                 # depends on @aiactions/schema
  tsconfig.json
  vite.config.ts
  src/
    evaluate.ts
    errors.ts                  # ExpressionError extends AIactionsError
    index.ts
  tests/
    evaluate.test.ts           # was: expression.test.ts

packages/exec/
  package.json                 # depends on @aiactions/schema
  tsconfig.json
  vite.config.ts
  src/
    spawn-shell.ts             # was: runtime/exec/spawn.ts
    shell-spec.ts              # was: runtime/exec/shell-spec.ts
    script-file.ts             # was: runtime/exec/script-file.ts
    spawn-uses.ts              # was: runtime/runner/uses/exec.ts
    protocol.ts                # was: runtime/runner/uses/protocol.ts
    context.ts                 # was: runtime/runner/uses/context.ts
    loader.mjs                 # was: runtime/runner/uses/loader.mjs
    errors.ts                  # ExecError extends AIactionsError
    index.ts
  tests/                       # 10 test files (see migration map)

packages/registry/
  package.json                 # depends on @aiactions/schema + @aiactions/paths + @aiactions/git
  tsconfig.json
  vite.config.ts
  src/
    fetch.ts                   # part of: runtime/runner/uses/registry-fetch.ts
    resolve.ts                 # part of: registry-fetch.ts (classifyVersion + resolveMajorRange + RegistryCoordinate)
    lockfile.ts                # was: runtime/lockfile.ts
    errors.ts                  # RegistryError + RegistryFetchError + RegistryResolveError
    index.ts
  tests/                       # 5 test files (see migration map)

packages/core/
  package.json                 # depends on schema + parser + registry + expression + exec + paths + git
  tsconfig.json
  vite.config.ts
  src/
    run-workflow.ts            # was: runtime/run-workflow.ts
    run-options.ts             # was: runtime/types/options.ts
    runner/
      run-job.ts               # was: runtime/runner/job.ts
      resolve-uses.ts          # was: runtime/runner/uses/resolver.ts
    errors.ts                  # RunnerError + JobError + StepError
    index.ts
  tests/                       # 9 test files (see migration map)
```

`packages/runtime/` is **deleted** at task 9.

---

## Task 1: Bootstrap `@aiactions/expression`, `@aiactions/exec`, `@aiactions/registry`, `@aiactions/core` skeletons

**Files (create):**

- `packages/expression/{package.json,tsconfig.json,vite.config.ts,src/index.ts,src/errors.ts}`
- `packages/exec/{package.json,tsconfig.json,vite.config.ts,src/index.ts,src/errors.ts}`
- `packages/registry/{package.json,tsconfig.json,vite.config.ts,src/index.ts,src/errors.ts}`
- `packages/core/{package.json,tsconfig.json,vite.config.ts,src/index.ts,src/errors.ts}`

- [ ] **Step 1: Create directory trees**

```bash
mkdir -p packages/expression/src packages/expression/tests
mkdir -p packages/exec/src packages/exec/tests
mkdir -p packages/registry/src packages/registry/tests
mkdir -p packages/core/src/runner packages/core/tests
```

- [ ] **Step 2: Write the four `package.json` files**

`packages/expression/package.json`:

```json
{
  "name": "@aiactions/expression",
  "version": "1.0.0",
  "private": true,
  "type": "module",
  "exports": {
    ".": "./src/index.ts",
    "./package.json": "./package.json"
  },
  "scripts": {
    "test": "vp test",
    "check": "vp check"
  },
  "dependencies": {
    "@aiactions/schema": "workspace:*"
  }
}
```

`packages/exec/package.json`:

```json
{
  "name": "@aiactions/exec",
  "version": "1.0.0",
  "private": true,
  "type": "module",
  "exports": {
    ".": "./src/index.ts",
    "./package.json": "./package.json"
  },
  "scripts": {
    "test": "vp test",
    "check": "vp check"
  },
  "dependencies": {
    "@aiactions/schema": "workspace:*"
  }
}
```

`packages/registry/package.json`:

```json
{
  "name": "@aiactions/registry",
  "version": "1.0.0",
  "private": true,
  "type": "module",
  "exports": {
    ".": "./src/index.ts",
    "./package.json": "./package.json"
  },
  "scripts": {
    "test": "vp test",
    "check": "vp check"
  },
  "dependencies": {
    "@aiactions/git": "workspace:*",
    "@aiactions/paths": "workspace:*",
    "@aiactions/schema": "workspace:*",
    "semver": "^7.8.0",
    "zod": "^4.4.3"
  },
  "devDependencies": {
    "@types/semver": "^7.7.1"
  }
}
```

`packages/core/package.json`:

```json
{
  "name": "@aiactions/core",
  "version": "1.0.0",
  "private": true,
  "type": "module",
  "exports": {
    ".": "./src/index.ts",
    "./package.json": "./package.json"
  },
  "scripts": {
    "test": "vp test",
    "check": "vp check"
  },
  "dependencies": {
    "@aiactions/exec": "workspace:*",
    "@aiactions/expression": "workspace:*",
    "@aiactions/git": "workspace:*",
    "@aiactions/parser": "workspace:*",
    "@aiactions/paths": "workspace:*",
    "@aiactions/registry": "workspace:*",
    "@aiactions/schema": "workspace:*"
  }
}
```

- [ ] **Step 3: Write the four `tsconfig.json` files** — each identical to `packages/paths/tsconfig.json`. Reuse byte-for-byte.

- [ ] **Step 4: Write the four `vite.config.ts` files** — each identical to `packages/paths/vite.config.ts`. Reuse byte-for-byte.

- [ ] **Step 5: Write the four empty `src/index.ts` placeholders**

Each file:

```ts
// Public API barrel — populated by subsequent tasks.
export {};
```

- [ ] **Step 6: Write the four empty `src/errors.ts` placeholders**

Each file:

```ts
// Per-package error classes — populated by subsequent tasks.
export {};
```

- [ ] **Step 7: Register packages in workspace**

```bash
vp install --ignore-scripts
```

After install, fix `@types/node` symlinks across every package:

```bash
for pkg in cli core discovery exec expression git parser paths registry runtime schema; do
  mkdir -p packages/$pkg/node_modules/@types
  ln -sf ../../../../node_modules/.bun/@types+node@22.19.17/node_modules/@types/node packages/$pkg/node_modules/@types/node
done
```

- [ ] **Step 8: Verify all four skeletons compile**

```bash
cd packages/expression && vp check && cd ../exec && vp check && cd ../registry && vp check && cd ../core && vp check
```

Expected: PASS for all four (empty trees).

- [ ] **Step 9: Commit**

```bash
git add packages/expression packages/exec packages/registry packages/core bun.lock package.json
git commit -m "$(cat <<'EOF'
feat(expression,exec,registry,core): scaffold four new packages

Empty skeletons for the runtime split. Subsequent commits migrate
expression evaluator, exec primitives, registry, and orchestrator code
out of @aiactions/runtime.

Refs: docs/superpowers/specs/2026-05-09-architecture-restructure-design.md
Refs: docs/superpowers/plans/2026-05-09-phase-4-runtime-split.md

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 2: Add `AIactionsError` abstract base in `@aiactions/schema`

**Files:**

- Modify: `packages/schema/src/types/errors.ts`
- Modify: `packages/schema/src/index.ts`
- Test: `packages/schema/tests/errors.test.ts`

- [ ] **Step 1: Write the failing test**

Create `packages/schema/tests/errors.test.ts`:

```ts
import { describe, expect, test } from "vite-plus/test";

import { AIactionsError } from "../src/index.ts";

describe("AIactionsError", () => {
  test("is abstract and not directly constructible", () => {
    expect(() => new (AIactionsError as new (m: string) => AIactionsError)("x")).toThrow(
      /AIactionsError is abstract/u,
    );
  });

  test("subclass carries its constructor name", () => {
    class MySubclass extends AIactionsError {}
    const e = new MySubclass("boom");
    expect(e.name).toBe("MySubclass");
    expect(e.message).toBe("boom");
    expect(e instanceof AIactionsError).toBe(true);
    expect(e instanceof Error).toBe(true);
  });

  test("preserves cause", () => {
    class S extends AIactionsError {}
    const cause = new Error("root");
    const e = new S("wrapped", { cause });
    expect(e.cause).toBe(cause);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
cd packages/schema && vp test errors.test.ts
```

Expected: FAIL with import error (`AIactionsError` not exported).

- [ ] **Step 3: Add `AIactionsError` to `packages/schema/src/types/errors.ts`**

Insert at the **top** of the existing file (above all current `WorkflowParseError`/`WorkflowSchemaError`/`ValidationIssue` definitions):

```ts
/**
 * Abstract base class for every typed error raised inside AIactions
 * packages. Concrete subclasses live in the package that produces them
 * (`ExpressionError` in `@aiactions/expression`, `ExecError` in
 * `@aiactions/exec`, `RegistryError` in `@aiactions/registry`, etc.).
 *
 * Per spec section 10, the CLI catches `AIactionsError` at the outermost
 * boundary and maps the concrete subclass to an exit code via the
 * `EXIT` table — direct `instanceof` on a subclass is allowed inside a
 * brick that needs to enrich error context.
 */
export abstract class AIactionsError extends Error {
  override readonly name: string;
  constructor(message: string, options?: ErrorOptions) {
    if (new.target === AIactionsError) {
      throw new Error("AIactionsError is abstract; instantiate a concrete subclass");
    }
    super(message, options);
    this.name = new.target.name;
  }
}
```

Then update the existing schema-side error classes to extend `AIactionsError` instead of `Error` directly. Read `packages/schema/src/types/errors.ts` and find each `extends Error` for `WorkflowError` (or whichever is the schema's existing abstract base — phase 3 introduced one). Re-parent its hierarchy to `AIactionsError`.

If phase 3 already shipped a `WorkflowError` abstract base, declare `AIactionsError` first and `WorkflowError` becomes `WorkflowError extends AIactionsError`.

- [ ] **Step 4: Re-export `AIactionsError` from the schema barrel**

Edit `packages/schema/src/index.ts`. Make sure the existing `export * from "./types/errors.ts"` line is present (it should be — phase 3 wired it). If `errors.ts` does a default export, switch to `export { AIactionsError, ... } from "./types/errors.ts"` to enumerate the exposed names. The intent is `AIactionsError` available as `@aiactions/schema` import.

- [ ] **Step 5: Run test to verify it passes + run full schema suite**

```bash
cd packages/schema && vp test
```

Expected: PASS for the new errors test + all existing schema tests still green.

- [ ] **Step 6: Commit**

```bash
git add packages/schema
git commit -m "$(cat <<'EOF'
feat(schema): add AIactionsError abstract base

Introduces the AIactionsError abstract base class as the parent of every
typed error produced by AIactions packages, per spec section 10.1.
Existing schema-side errors (WorkflowParseError, WorkflowSchemaError) are
re-parented through their abstract base so they remain
instanceof-AIactionsError. Subsequent commits add concrete subclasses in
each new runtime-split package.

Refs: docs/superpowers/specs/2026-05-09-architecture-restructure-design.md (section 10.1)

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 3: Migrate `types/run.ts` and `types/events.ts` from runtime → schema

**Files:**

- Create: `packages/schema/src/types/run.ts`
- Create: `packages/schema/src/types/events.ts`
- Modify: `packages/schema/src/index.ts`
- Modify: `packages/runtime/src/types/run.ts` (re-export shim)
- Modify: `packages/runtime/src/types/events.ts` (re-export shim)

This task is **additive** — runtime still re-exports from its own paths until task 9 deletes the package. The shim avoids breaking runtime tests during phase-4 mid-flight.

- [ ] **Step 1: Migrate `runtime/types/run.ts` content into schema**

```bash
cp packages/runtime/src/types/run.ts packages/schema/src/types/run.ts
```

The file is self-contained — no imports. Verify by inspection: `RunStatus`, `StepResult`, `JobResult`, `RunResult` types only.

- [ ] **Step 2: Migrate `runtime/types/events.ts` content into schema**

```bash
cp packages/runtime/src/types/events.ts packages/schema/src/types/events.ts
```

The file's only import is `import type { RunStatus } from "./run.ts"` — that resolves locally inside `schema/types/`. No edit needed.

- [ ] **Step 3: Re-export from schema barrel**

Edit `packages/schema/src/index.ts` to add:

```ts
export * from "./types/run.ts";
export * from "./types/events.ts";
```

(Or extend the existing `export * from "./types/errors.ts"` block to enumerate all three.)

- [ ] **Step 4: Replace runtime files with re-export shims**

Overwrite `packages/runtime/src/types/run.ts`:

```ts
// MOVED to @aiactions/schema. Shim retained only to avoid breaking
// runtime's own internal imports during phase 4 of the architecture
// restructure. Deleted at end of phase 4.
export * from "@aiactions/schema";
```

Overwrite `packages/runtime/src/types/events.ts`:

```ts
// MOVED to @aiactions/schema. Shim retained only to avoid breaking
// runtime's own internal imports during phase 4. Deleted at end of phase 4.
export * from "@aiactions/schema";
```

These shims are intentionally over-broad (`export *`) — runtime is being deleted in task 9; the shim's only job is to keep runtime's internal `from "./types/run.ts"` imports compiling.

- [ ] **Step 5: Verify schema + runtime still type-check + tests pass**

```bash
cd packages/schema && vp check && vp test
cd ../runtime && vp check && vp test
```

Expected: PASS for both.

- [ ] **Step 6: Commit**

```bash
git add packages/schema packages/runtime
git commit -m "$(cat <<'EOF'
feat(schema): migrate RunStatus + RuntimeEvent types from runtime

Moves RunStatus, StepResult, JobResult, RunResult (was runtime/types/run.ts)
and the full RuntimeEvent union (was runtime/types/events.ts) into
@aiactions/schema. Runtime keeps short re-export shims pointing at the
schema package so its internal imports stay green until the runtime
package is deleted at the end of phase 4.

Refs: docs/superpowers/specs/2026-05-09-architecture-restructure-design.md (section 7.1)

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 4: Migrate `@aiactions/expression` source + tests

**Files:**

- Create: `packages/expression/src/{evaluate.ts, errors.ts, index.ts}`
- Create: `packages/expression/tests/evaluate.test.ts`

- [ ] **Step 1: Write `packages/expression/src/errors.ts`**

```ts
/**
 * `@aiactions/expression` error class. Raised when the minimal `${{ }}`
 * evaluator cannot resolve a body (unsupported context, undefined
 * variable, malformed grammar). Extends `AIactionsError` so the CLI's
 * outermost handler can map it to a typed exit code.
 */

import { AIactionsError } from "@aiactions/schema";

export class ExpressionError extends AIactionsError {}
```

- [ ] **Step 2: Migrate `eval/expression.ts` → `expression/src/evaluate.ts`**

```bash
cp packages/runtime/src/eval/expression.ts packages/expression/src/evaluate.ts
```

In the copied file, update imports:

- `from "../types/errors.ts"` → `from "./errors.ts"`
- `import { ExpressionEvalError }` → `import { ExpressionError }` (rename usage everywhere in this file)
- `from "@aiactions/schema"` (`tokenizeExpression`, `ExpressionTokenKind`) — unchanged.

Two `throw new ExpressionEvalError(...)` sites become `throw new ExpressionError(...)`.

- [ ] **Step 3: Wire `expression/src/index.ts`**

```ts
export * from "./evaluate.ts";
export * from "./errors.ts";
```

- [ ] **Step 4: Migrate the test**

```bash
cp packages/runtime/tests/expression.test.ts packages/expression/tests/evaluate.test.ts
```

In the copied file, update imports:

- `from "../src/eval/expression.ts"` → `from "../src/evaluate.ts"`
- `from "../src/types/errors.ts"` (`ExpressionEvalError`) → `from "../src/errors.ts"` (`ExpressionError`); rename usage
- `from "@aiactions/runtime"` (if any) → drop; use the local relative import

If the test references `ExpressionEvalError` by name (in `expect(...).toThrow(ExpressionEvalError)`), rename to `ExpressionError`.

- [ ] **Step 5: Verify**

```bash
cd packages/expression && vp check && vp test
```

Expected: lint+type-check PASS, all expression tests green (count from existing `expression.test.ts` — verify after migration).

- [ ] **Step 6: Commit**

```bash
git add packages/expression
git commit -m "$(cat <<'EOF'
feat(expression): migrate ${{ }} evaluator from runtime

Moves runtime/eval/expression.ts into the new @aiactions/expression
package as src/evaluate.ts. Renames ExpressionEvalError →
ExpressionError extending AIactionsError per spec section 10.1.
Public API (evaluateExpression, EvalContext, StepOutputContext,
ExpressionError) preserved; only the error class name changed.

Test (was tests/expression.test.ts) renamed to evaluate.test.ts and
retargeted at the new import paths.

Refs: docs/superpowers/specs/2026-05-09-architecture-restructure-design.md (section 7.5)

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 5: Migrate `@aiactions/exec` source + tests

**Files (in `packages/exec/`):**

- `src/spawn-shell.ts` (was `runtime/exec/spawn.ts`)
- `src/shell-spec.ts` (was `runtime/exec/shell-spec.ts`)
- `src/script-file.ts` (was `runtime/exec/script-file.ts`)
- `src/spawn-uses.ts` (was `runtime/runner/uses/exec.ts`)
- `src/protocol.ts` (was `runtime/runner/uses/protocol.ts`)
- `src/context.ts` (was `runtime/runner/uses/context.ts`)
- `src/loader.mjs` (was `runtime/runner/uses/loader.mjs`)
- `src/errors.ts`
- `src/index.ts`
- `tests/`: 10 files (see migration map)

- [ ] **Step 1: Write `packages/exec/src/errors.ts`**

```ts
/**
 * `@aiactions/exec` error class. Raised when:
 * - a shell value cannot be resolved (unsupported shell, malformed
 *   custom template missing `{0}`),
 * - the FD3 line-delimited protocol receives an invalid frame (bad
 *   JSON, unknown type, oversize line, partial-line-at-EOF),
 * - the uses-loader subprocess emits a malformed payload.
 *
 * Folds the previous runtime `RuntimeUnsupportedError` (from shell-spec)
 * and `ActionProtocolError` into a single concrete class extending
 * `AIactionsError`.
 */

import { AIactionsError } from "@aiactions/schema";

export class ExecError extends AIactionsError {}
```

- [ ] **Step 2: Migrate the seven exec source files**

```bash
cp packages/runtime/src/exec/spawn.ts packages/exec/src/spawn-shell.ts
cp packages/runtime/src/exec/shell-spec.ts packages/exec/src/shell-spec.ts
cp packages/runtime/src/exec/script-file.ts packages/exec/src/script-file.ts
cp packages/runtime/src/runner/uses/exec.ts packages/exec/src/spawn-uses.ts
cp packages/runtime/src/runner/uses/protocol.ts packages/exec/src/protocol.ts
cp packages/runtime/src/runner/uses/context.ts packages/exec/src/context.ts
cp packages/runtime/src/runner/uses/loader.mjs packages/exec/src/loader.mjs
```

In each copied file, update imports:

- `from "../types/errors.ts"` (in `shell-spec.ts`): import `ExecError` from `./errors.ts`. Rename usage `RuntimeUnsupportedError` → `ExecError`.
- `from "../../types/errors.ts"` (in `spawn-uses.ts`, `protocol.ts`): import `ExecError` from `./errors.ts`. Rename `ActionProtocolError` → `ExecError`.
- `from "../../types/events.ts"` (in `spawn-uses.ts`): use `from "@aiactions/schema"`.
- `from "../../types/run.ts"` (in `spawn-uses.ts`): use `from "@aiactions/schema"`.
- `from "./resolver.ts"` (in `spawn-uses.ts`, the `ResolvedAction` type): see step 3 — this is the trickiest cross-package edge.
- `from "./context.ts"` (in `protocol.ts`): unchanged (still local).
- `from "@aiactions/schema"` (`BUILTIN_SHELLS`, `customShellTemplateRegex`, `Shell` in `shell-spec.ts`): unchanged.

`spawn-shell.ts` (was `spawn.ts`): no imports from `runtime/types/*`. Pure stdlib + local. No changes needed beyond the rename.

`script-file.ts`: no imports from `runtime/types/*`. Pure stdlib. No changes needed.

`context.ts`: pure type file, no imports. No changes needed.

`loader.mjs`: pure JS, runs in subprocess, no `runtime/types/*` imports. No changes needed.

- [ ] **Step 3: Re-host the `ResolvedAction` type**

`spawn-uses.ts` imports `ResolvedAction` from `./resolver.ts` (which lives in `runtime/runner/uses/resolver.ts` and is migrating to `@aiactions/core` in task 7). To break this cycle:

The `ResolvedAction` type is a pure data shape (`{ manifest: ActionManifest, dir: string }`) — it belongs in **the package that consumes it**. Since `@aiactions/exec` is the leaf and `@aiactions/core` composes both `exec` and the resolver, `ResolvedAction` lives in `@aiactions/exec/src/spawn-uses.ts` itself.

Edit `packages/exec/src/spawn-uses.ts`:

- Replace `import type { ResolvedAction } from "./resolver.ts";` with a local declaration at the top of the file:

```ts
import type { ActionManifest } from "@aiactions/schema";

/**
 * The shape `spawn-uses` needs to spawn a `uses:` action: the loaded
 * manifest plus the absolute directory the action lives in. The
 * resolver in `@aiactions/core` constructs values of this type and
 * passes them in.
 */
export interface ResolvedAction {
  readonly manifest: ActionManifest;
  readonly dir: string;
}
```

This preserves the type's value (consumed by `request.resolved`) while breaking the cycle with the resolver.

- [ ] **Step 4: Wire `exec/src/index.ts`**

```ts
export * from "./spawn-shell.ts";
export * from "./shell-spec.ts";
export * from "./script-file.ts";
export * from "./spawn-uses.ts";
export * from "./protocol.ts";
export * from "./context.ts";
export * from "./errors.ts";
```

`loader.mjs` is **not re-exported** — it is a subprocess entry point loaded by absolute path (`fileURLToPath(new URL("./loader.mjs", import.meta.url))` inside `spawn-uses.ts`).

- [ ] **Step 5: Verify the URL-to-loader resolution still works**

The `LOADER_URL` constant in `spawn-uses.ts` resolves `./loader.mjs` relative to its own module. After the move, `spawn-uses.ts` and `loader.mjs` are siblings inside `packages/exec/src/` — same shape as before. No change needed.

But: `vite-plus` build / `vp test` must serve `loader.mjs` alongside the compiled output. `packages/runtime` already does this (it works today). The new `packages/exec` inherits the same `vite.config.ts` template from `packages/paths` (Task 1 step 4) which has no special handling. **Verify after the test run** that `runner-uses-loader.test.ts` (migrated below) still spawns the loader successfully — if it fails with `ENOENT loader.mjs`, add a `viteStaticCopy`-like rule to `exec/vite.config.ts` to copy `loader.mjs` into `dist/`.

(Empirically: tests run against source `.ts` directly via Vite+ during `vp test`, so `import.meta.url` resolves to the source path and the sibling `.mjs` is reachable. Production builds use `tsdown`; the `loader.mjs` is co-located in `src/` and copied to `dist/` by tsdown. Verify in step 7 below.)

- [ ] **Step 6: Migrate exec tests (10 files)**

```bash
cp packages/runtime/tests/exec-shell-spec-custom.test.ts packages/exec/tests/
cp packages/runtime/tests/exec-shell-spec-fallback.test.ts packages/exec/tests/
cp packages/runtime/tests/exec-shell-spec-python.test.ts packages/exec/tests/
cp packages/runtime/tests/script-file.test.ts packages/exec/tests/
cp packages/runtime/tests/shell-spec.test.ts packages/exec/tests/
cp packages/runtime/tests/spawn.test.ts packages/exec/tests/
cp packages/runtime/tests/runner-uses-exec.test.ts packages/exec/tests/spawn-uses.test.ts
cp packages/runtime/tests/runner-uses-loader.test.ts packages/exec/tests/loader.test.ts
cp packages/runtime/tests/runner-uses-protocol.test.ts packages/exec/tests/protocol.test.ts
cp packages/runtime/tests/runner-uses-types.test.ts packages/exec/tests/context.test.ts
```

(Renames: `runner-uses-*` → drop the `runner-uses-` prefix to mirror the new flat layout.)

In each test, update import paths:

- `from "../src/exec/spawn.ts"` → `from "../src/spawn-shell.ts"`
- `from "../src/exec/shell-spec.ts"` → `from "../src/shell-spec.ts"`
- `from "../src/exec/script-file.ts"` → `from "../src/script-file.ts"`
- `from "../src/runner/uses/exec.ts"` → `from "../src/spawn-uses.ts"`
- `from "../src/runner/uses/protocol.ts"` → `from "../src/protocol.ts"`
- `from "../src/runner/uses/context.ts"` → `from "../src/context.ts"`
- `from "../src/types/errors.ts"` (`RuntimeUnsupportedError`, `ActionProtocolError`) → `from "../src/errors.ts"` (`ExecError`)
- `from "@aiactions/runtime"` (if any) → `from "../src/index.ts"` for own-package symbols, or `from "@aiactions/schema"` for types
- Update any `instanceof RuntimeUnsupportedError` / `instanceof ActionProtocolError` references to `instanceof ExecError`. Update any `expect(...).toThrow(RuntimeUnsupportedError)` / `expect(...).toThrow(ActionProtocolError)` likewise.

Some tests assert on the error class name (`expect(err.name).toBe("ActionProtocolError")`). Update those expectations to `"ExecError"`. Test the actual constraint (the message regex / surface) still holds.

- [ ] **Step 7: Verify**

```bash
cd packages/exec && vp check && vp test
```

Expected: lint+type-check PASS, all 10 test files green. If `loader.test.ts` fails with `ENOENT`, debug by inspecting `packages/exec/dist/` after `vp test` — if `loader.mjs` is missing, add `assetsInclude: ["**/*.mjs"]` (or equivalent) to `packages/exec/vite.config.ts` and re-run.

- [ ] **Step 8: Commit**

```bash
git add packages/exec
git commit -m "$(cat <<'EOF'
feat(exec): migrate spawn primitives + uses-loader from runtime

Moves runtime/exec/* (spawn, shell-spec, script-file) and
runtime/runner/uses/* (exec→spawn-uses, protocol, context, loader.mjs)
into the new @aiactions/exec package as a flat src/ layout.

Folds RuntimeUnsupportedError (raised by shell-spec) and
ActionProtocolError (raised by protocol+spawn-uses) into a single
ExecError extending AIactionsError per spec section 10.1.

ResolvedAction type lifted into spawn-uses.ts so exec stays leaf-only;
the resolver in @aiactions/core constructs values of this type and
passes them in.

Tests (10 files) migrated with the prefix-rename runner-uses-* →
flat layout.

Refs: docs/superpowers/specs/2026-05-09-architecture-restructure-design.md (section 7.6)

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 6: Migrate `@aiactions/registry` source + tests

**Files (in `packages/registry/`):**

- `src/lockfile.ts` (was `runtime/lockfile.ts`)
- `src/fetch.ts` (part of `runtime/runner/uses/registry-fetch.ts`)
- `src/resolve.ts` (part of `runtime/runner/uses/registry-fetch.ts` — `RegistryCoordinate`, `classifyVersion`, `resolveMajorRange`)
- `src/errors.ts`
- `src/index.ts`
- `tests/`: 5 files (see migration map)

- [ ] **Step 1: Write `packages/registry/src/errors.ts`**

```ts
/**
 * `@aiactions/registry` error hierarchy.
 *
 * - `RegistryError` — abstract base for the package.
 * - `RegistryFetchError` — git clone, sparse-checkout, rev-parse, or
 *   destination filesystem operations failed.
 * - `RegistryResolveError` — `git ls-remote` failed or no published tag
 *   matches the requested major-range.
 *
 * Folds the previous runtime `LockfileVersionMismatch` (lockfile-side)
 * and `ActionResolutionError` (registry-fetch-side) into this hierarchy
 * per spec section 10.1.
 */

import { AIactionsError } from "@aiactions/schema";

export abstract class RegistryError extends AIactionsError {}

export class RegistryFetchError extends RegistryError {}

export class RegistryResolveError extends RegistryError {}
```

`LockfileVersionMismatch` (a single, narrow case) is folded into `RegistryFetchError` because the user's actionable response (delete `.aiactions/lock.json`) is the same shape as a fetch-side recovery.

- [ ] **Step 2: Migrate `runtime/lockfile.ts` → `registry/src/lockfile.ts`**

```bash
cp packages/runtime/src/lockfile.ts packages/registry/src/lockfile.ts
```

In the copied file, update imports:

- `from "./runner/uses/registry-fetch.ts"` (`RegistryCoordinate`) → `from "./resolve.ts"` (the type moves alongside `classifyVersion` — see step 3).
- `from "./types/errors.ts"` (`LockfileVersionMismatch`) → `from "./errors.ts"` (`RegistryFetchError`); rename usage.

Single throw site: replace `throw new LockfileVersionMismatch(...)` with `throw new RegistryFetchError(...)`. Message text unchanged.

- [ ] **Step 3: Split `runtime/runner/uses/registry-fetch.ts` into `fetch.ts` + `resolve.ts`**

`registry-fetch.ts` is ~360 LOC mixing two cleanly-separable concerns:

- **resolve** (≤ ~90 LOC): `RegistryCoordinate` type, `classifyVersion`, `resolveMajorRange`, `VersionClass` type, the `EXACT_SEMVER_RE`/`MAJOR_ONLY_RE` constants. These are **pure or read-only git** (`ls-remote`).
- **fetch** (~270 LOC): `fetchActionFromCanonical`, `ensureCachedAction`, `EnsureCachedActionResult`, `EnsureCachedActionOptions`, `FetchActionFromCanonicalOptions`, `DEFAULT_CANONICAL_URL`. These mutate the cache + lockfile.

Create `packages/registry/src/resolve.ts`:

1. Copy in **only** the resolve-side content from `registry-fetch.ts`:
   - `RegistryCoordinate` interface
   - `VersionClass` type
   - `EXACT_SEMVER_RE`, `MAJOR_ONLY_RE` constants
   - `classifyVersion` function (exported)
   - `resolveMajorRange` function (exported) + the `STABLE_SEMVER_RE` constant local to it
2. Update imports:
   - `from "../../types/errors.ts"` (`ActionResolutionError`) → `from "./errors.ts"` (`RegistryResolveError`); rename throw sites.
   - `from "@aiactions/git"` (`lsRemoteTags`) — unchanged.
   - `import { rcompare as semverRcompare } from "semver"` — unchanged.

Create `packages/registry/src/fetch.ts`:

1. Copy in **only** the fetch-side content from `registry-fetch.ts`:
   - `FetchActionFromCanonicalOptions` interface
   - `DEFAULT_CANONICAL_URL` constant
   - `fetchActionFromCanonical` function
   - `EnsureCachedActionResult` interface
   - `EnsureCachedActionOptions` interface
   - `ensureCachedAction` function
2. Update imports:
   - `from "../../types/errors.ts"` (`ActionResolutionError`) → `from "./errors.ts"` (`RegistryFetchError` for clone/sparse/rev-parse/dir failures, `RegistryResolveError` for the route through `resolveMajorRange`).
   - `from "@aiactions/git"` (`cloneSparseShallow`, `sparseCheckoutSet`, `revParseHead`) — unchanged.
   - `from "../../lockfile.ts"` (`readLockfile`, `upsertLockfileEntry`) → `from "./lockfile.ts"`.
   - **Add** `import { type RegistryCoordinate, classifyVersion, resolveMajorRange } from "./resolve.ts";` — these come from the sibling.

Throw-site mapping in `fetch.ts`:

- `git clone failed for ...` → `RegistryFetchError`
- `git sparse-checkout failed ...` → `RegistryFetchError`
- `action path ... is not a directory` → `RegistryFetchError`
- `action path ... not found at ref ...` → `RegistryFetchError`
- `git rev-parse HEAD failed ...` → `RegistryFetchError`

Throw-site mapping in `resolve.ts`:

- `failed to list tags ...` → `RegistryResolveError`
- `no published version ... matches major ...` → `RegistryResolveError`

- [ ] **Step 4: Wire `registry/src/index.ts`**

```ts
export * from "./fetch.ts";
export * from "./resolve.ts";
export * from "./lockfile.ts";
export * from "./errors.ts";
```

- [ ] **Step 5: Migrate registry tests (5 files)**

```bash
cp packages/runtime/tests/lockfile.test.ts packages/registry/tests/
cp packages/runtime/tests/runner-uses-registry-fetch.test.ts packages/registry/tests/fetch.test.ts
cp packages/runtime/tests/runner-uses-registry-fetch-fetch.test.ts packages/registry/tests/fetch-direct.test.ts
cp packages/runtime/tests/runner-uses-registry-integration.test.ts packages/registry/tests/integration.test.ts
cp packages/runtime/tests/runner-uses-resolve-range.test.ts packages/registry/tests/resolve.test.ts
```

In each test, update import paths:

- `from "../src/lockfile.ts"` → `from "../src/lockfile.ts"` (unchanged — same flat layout)
- `from "../src/runner/uses/registry-fetch.ts"` → split: items belonging to `fetch.ts` come from `from "../src/fetch.ts"`; items belonging to `resolve.ts` (`classifyVersion`, `resolveMajorRange`, `RegistryCoordinate`, `VersionClass`) come from `from "../src/resolve.ts"`.
- `from "../src/types/errors.ts"` (`ActionResolutionError`, `LockfileVersionMismatch`) → `from "../src/errors.ts"` (`RegistryFetchError`, `RegistryResolveError`); rename usage.
- `from "@aiactions/runtime"` (if any) → `from "../src/index.ts"` for own-package symbols.

Update `instanceof` / `toThrow` assertions to the new class names per the throw-site mapping in step 3.

- [ ] **Step 6: Verify**

```bash
cd packages/registry && vp check && vp test
```

Expected: lint+type-check PASS, all 5 test files green.

- [ ] **Step 7: Commit**

```bash
git add packages/registry
git commit -m "$(cat <<'EOF'
feat(registry): migrate lockfile + fetch + resolve from runtime

Moves runtime/lockfile.ts and runtime/runner/uses/registry-fetch.ts
(split into fetch.ts + resolve.ts) into the new @aiactions/registry
package.

Splits the old single-file 360-LOC registry-fetch.ts at its natural
seam: resolve.ts owns RegistryCoordinate + classifyVersion +
resolveMajorRange (pure / read-only git); fetch.ts owns
fetchActionFromCanonical + ensureCachedAction (cache-mutating).

Folds the previous LockfileVersionMismatch + ActionResolutionError
classes into the new RegistryError hierarchy per spec section 10.1:
RegistryError abstract base, RegistryFetchError + RegistryResolveError
concrete subclasses.

Tests (5 files) migrated with the runner-uses-registry-* → flat
naming.

Refs: docs/superpowers/specs/2026-05-09-architecture-restructure-design.md (section 7.4)

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 7: Migrate `@aiactions/core` source + tests

**Files (in `packages/core/`):**

- `src/run-workflow.ts` (was `runtime/run-workflow.ts`)
- `src/run-options.ts` (was `runtime/types/options.ts`)
- `src/runner/run-job.ts` (was `runtime/runner/job.ts`)
- `src/runner/resolve-uses.ts` (was `runtime/runner/uses/resolver.ts`)
- `src/errors.ts`
- `src/index.ts`
- `tests/`: 9 files (see migration map)

- [ ] **Step 1: Write `packages/core/src/errors.ts`**

```ts
/**
 * `@aiactions/core` error hierarchy.
 *
 * - `RunnerError` — abstract base for orchestrator-side failures.
 * - `JobError` — declared but currently unused; reserved for
 *   future job-level failure modes (cancellation distinct from
 *   downstream-skip, partial-job failure, etc.).
 * - `StepError` — currently unused (the runner returns `status: "failed"`
 *   instead of throwing). Reserved for future use.
 *
 * Folds the previous runtime `RuntimeUnsupportedError` (raised by
 * runner/job and runner/uses/resolver), `ActionResolutionError` (raised
 * by resolver), and `ActionManifestError` (raised by resolver) into
 * `RunnerError`, per spec section 10.1.
 */

import { AIactionsError } from "@aiactions/schema";

export abstract class RunnerError extends AIactionsError {}

export class JobError extends RunnerError {}

export class StepError extends RunnerError {}

/**
 * Concrete `RunnerError` for any orchestrator-side failure that is not
 * job- or step-scoped (missing workflow file, manifest validation
 * failure, unsupported runtime feature). The narrowest possible
 * subclass for callers that want to filter on category.
 */
export class OrchestrationError extends RunnerError {}
```

(`OrchestrationError` is a concrete sink so the runner can throw something extending the abstract `RunnerError` base. Spec section 10.1 lists `RunnerError` as a single class — the abstract+concrete split keeps spec semantics while letting `instanceof RunnerError` still narrow correctly.)

- [ ] **Step 2: Migrate `runtime/run-workflow.ts` → `core/src/run-workflow.ts`**

```bash
cp packages/runtime/src/run-workflow.ts packages/core/src/run-workflow.ts
```

Update imports:

- `from "./eval/expression.ts"` (`evaluateExpression`, `EvalContext`) → `from "@aiactions/expression"`.
- `from "./exec/shell-spec.ts"` (`probeBashAvailability`) → `from "@aiactions/exec"`.
- `from "./runner/job.ts"` (`runJob`) → `from "./runner/run-job.ts"`.
- `from "./types/options.ts"` (`RunOptions`, `WorkflowInputValue`) → `from "./run-options.ts"`.
- `from "./types/run.ts"` (`JobResult`, `RunResult`, `RunStatus`) → `from "@aiactions/schema"`.
- `from "@aiactions/schema"` (`topoSort`, `DepRecord`, `Workflow`) — unchanged.

- [ ] **Step 3: Migrate `runtime/types/options.ts` → `core/src/run-options.ts`**

```bash
cp packages/runtime/src/types/options.ts packages/core/src/run-options.ts
```

Update imports:

- `from "./events.ts"` (`RuntimeEvent`) → `from "@aiactions/schema"`.

- [ ] **Step 4: Migrate `runtime/runner/job.ts` → `core/src/runner/run-job.ts`**

```bash
cp packages/runtime/src/runner/job.ts packages/core/src/runner/run-job.ts
```

Update imports (this is the busiest set):

- `from "../eval/expression.ts"` (`evaluateExpression`, `EvalContext`, `StepOutputContext`) → `from "@aiactions/expression"`.
- `from "../exec/script-file.ts"` (`writeScript`) → `from "@aiactions/exec"`.
- `from "../exec/shell-spec.ts"` (`getShellInvocation`) → `from "@aiactions/exec"`.
- `from "../exec/spawn.ts"` (`spawnShell`) → `from "@aiactions/exec"`.
- `from "./uses/resolver.ts"` (`resolveUsesRef`) → `from "./resolve-uses.ts"`.
- `from "./uses/exec.ts"` (`executeUsesStep`) → `from "@aiactions/exec"`.
- `from "../types/errors.ts"` (`RuntimeUnsupportedError`) → `from "../errors.ts"` (`OrchestrationError`); rename throw sites.
- `from "../types/events.ts"` (`RuntimeEvent`) → `from "@aiactions/schema"`.
- `from "../types/run.ts"` (`JobResult`, `RunStatus`, `StepResult`) → `from "@aiactions/schema"`.
- `from "@aiactions/schema"` (`Job`, `RunDefaults`, `Step`) — unchanged.

Throw sites in `run-job.ts` raising `RuntimeUnsupportedError`:

- "job-level 'uses:' (reusable workflows) is not yet implemented" → `OrchestrationError`
- "step #N has neither 'run' nor 'uses' — schema invariant violated" → `OrchestrationError`

- [ ] **Step 5: Migrate `runtime/runner/uses/resolver.ts` → `core/src/runner/resolve-uses.ts`**

```bash
cp packages/runtime/src/runner/uses/resolver.ts packages/core/src/runner/resolve-uses.ts
```

Update imports:

- `from "@aiactions/parser"` (`parseActionManifest`) — unchanged.
- `from "@aiactions/schema"` (`ActionManifest`, `RefKind`, `UsesRef`, `WorkflowError`) — unchanged.
- `from "../../types/errors.ts"` (`ActionManifestError`, `ActionResolutionError`, `RuntimeUnsupportedError`) → `from "../errors.ts"` (`OrchestrationError`); rename throw sites.
- `from "./registry-fetch.ts"` (`ensureCachedAction`) → `from "@aiactions/registry"`.

The `ResolvedAction` interface declared at the top of this file is **deleted** — `@aiactions/exec/spawn-uses.ts` owns the canonical `ResolvedAction` type now (Task 5 step 3). Replace with:

```ts
import type { ResolvedAction } from "@aiactions/exec";
```

The function signature `resolveUsesRef(...): Promise<ResolvedAction>` keeps using the imported type.

Throw sites in `resolve-uses.ts` (all currently `RuntimeUnsupportedError` / `ActionResolutionError` / `ActionManifestError`):

- `local ref ... requires options.workflowFile` → `OrchestrationError`
- `action directory not found for ref ...` → `OrchestrationError`
- `registry ref ... requires options.registryRoot` → `OrchestrationError`
- `registry ref ... requires options.cwd` → `OrchestrationError`
- `failed to load manifest for ref ...` → `OrchestrationError` (preserve `cause` chain)
- `runs.using ... is not yet implemented` → `OrchestrationError`

- [ ] **Step 6: Wire `core/src/index.ts`**

```ts
export * from "./run-workflow.ts";
export * from "./run-options.ts";
export * from "./runner/run-job.ts";
export * from "./runner/resolve-uses.ts";
export * from "./errors.ts";
```

- [ ] **Step 7: Migrate core tests (9 files)**

```bash
cp packages/runtime/tests/run-workflow.test.ts packages/core/tests/
cp packages/runtime/tests/runner-job.test.ts packages/core/tests/
cp packages/runtime/tests/runner-job-defaults-shell.test.ts packages/core/tests/
cp packages/runtime/tests/runner-job-defaults-workdir.test.ts packages/core/tests/
cp packages/runtime/tests/runner-outputs-eval.test.ts packages/core/tests/
cp packages/runtime/tests/runner-uses.test.ts packages/core/tests/
cp packages/runtime/tests/runner-uses-resolver.test.ts packages/core/tests/resolve-uses.test.ts
cp packages/runtime/tests/runner-uses-claude-agent.test.ts packages/core/tests/
cp packages/runtime/tests/e2e.test.ts packages/core/tests/
```

Migrate the test fixtures directory:

```bash
cp -R packages/runtime/tests/fixtures packages/core/tests/fixtures
```

In each test, update import paths:

- `from "../src/run-workflow.ts"` → `from "../src/run-workflow.ts"` (unchanged after rename)
- `from "../src/runner/job.ts"` → `from "../src/runner/run-job.ts"`
- `from "../src/runner/uses/resolver.ts"` → `from "../src/runner/resolve-uses.ts"`
- `from "../src/types/options.ts"` → `from "../src/run-options.ts"`
- `from "../src/types/errors.ts"` (`RuntimeUnsupportedError`, `ActionResolutionError`, `ActionManifestError`) → `from "../src/errors.ts"` (`OrchestrationError`); rename usage
- `from "../src/types/run.ts"` → `from "@aiactions/schema"`
- `from "../src/types/events.ts"` → `from "@aiactions/schema"`
- `from "../src/eval/expression.ts"` → `from "@aiactions/expression"`
- `from "../src/exec/*"` → `from "@aiactions/exec"`
- `from "../src/runner/uses/exec.ts"` (`executeUsesStep`) → `from "@aiactions/exec"`
- `from "../src/runner/uses/protocol.ts"` → `from "@aiactions/exec"`
- `from "../src/runner/uses/registry-fetch.ts"` → `from "@aiactions/registry"`
- `from "../src/lockfile.ts"` → `from "@aiactions/registry"`
- `from "@aiactions/runtime"` → `from "../src/index.ts"` for own-package symbols, or the new package import for foreign symbols.

Update `instanceof` and `toThrow` assertions per the rename map.

Fixtures referencing path `../runtime/...` should be updated if any do; most of `packages/runtime/tests/fixtures/` is YAML/scripts that load by relative path — verify after migration that fixture loading still resolves under `packages/core/tests/fixtures/`.

- [ ] **Step 8: Verify**

```bash
cd packages/core && vp check && vp test
```

Expected: lint+type-check PASS, all 9 test files green. The core tests are integration-style (real bricks), so missing wiring will surface here loudly.

- [ ] **Step 9: Commit**

```bash
git add packages/core
git commit -m "$(cat <<'EOF'
feat(core): migrate orchestrators (runWorkflow + runJob + resolveUsesRef) from runtime

Moves runtime/run-workflow.ts, runtime/runner/job.ts (→ runner/run-job.ts),
runtime/runner/uses/resolver.ts (→ runner/resolve-uses.ts), and
runtime/types/options.ts (→ run-options.ts) into the new @aiactions/core
package. Public API (runWorkflow, runJob, resolveUsesRef, RunOptions,
WorkflowInputValue) preserved.

Folds RuntimeUnsupportedError + ActionResolutionError +
ActionManifestError into RunnerError + OrchestrationError per spec
section 10.1. JobError + StepError declared as RunnerError subclasses
for future use.

Internal imports rewired to consume @aiactions/expression (eval),
@aiactions/exec (shell + uses primitives), @aiactions/registry
(lockfile + fetch + resolve).

Tests (9 files + fixtures) migrated and rewired at the new layouts.

Refs: docs/superpowers/specs/2026-05-09-architecture-restructure-design.md (section 7.9)

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 8: Retarget `@aiactions/cli` consumer

**File:** `packages/cli/package.json` + `packages/cli/src/commands/action/install.ts`.

- [ ] **Step 1: Find every runtime reference in cli**

```bash
grep -rn '@aiactions/runtime' packages/cli/src packages/cli/tests
```

Expected: a single match in `packages/cli/src/commands/action/install.ts` importing `ensureCachedAction` and `EnsureCachedActionOptions`.

If additional matches surface, repeat the source-to-package mapping for each.

- [ ] **Step 2: Update `packages/cli/package.json`**

Replace the `@aiactions/runtime` dep with `@aiactions/registry`:

```diff
   "dependencies": {
     "@aiactions/parser": "workspace:*",
     "@aiactions/paths": "workspace:*",
-    "@aiactions/runtime": "workspace:*",
+    "@aiactions/registry": "workspace:*",
     "@aiactions/schema": "workspace:*",
     ...
   },
```

(Keep alphabetical order.)

- [ ] **Step 3: Update `packages/cli/src/commands/action/install.ts`**

```diff
-import { ensureCachedAction, type EnsureCachedActionOptions } from "@aiactions/runtime";
+import { ensureCachedAction, type EnsureCachedActionOptions } from "@aiactions/registry";
```

- [ ] **Step 4: Re-resolve workspace symlinks**

```bash
vp install --ignore-scripts
```

Re-fix `@types/node` symlinks per Task 1 step 7 if necessary.

- [ ] **Step 5: Verify**

```bash
cd packages/cli && vp check && vp test
```

Expected: PASS. All CLI tests still green (count should match phase-3 tail figure).

- [ ] **Step 6: Commit**

```bash
git add packages/cli
git commit -m "$(cat <<'EOF'
refactor(cli): consume @aiactions/registry

Replaces the @aiactions/runtime dep with @aiactions/registry. Imports
updated in commands/action/install.ts; CLI surface unchanged.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 9: Delete `@aiactions/runtime`

**File:** `packages/runtime/` (entire directory).

- [ ] **Step 1: Verify zero residual references**

```bash
grep -rn '@aiactions/runtime' --exclude-dir=node_modules --exclude=bun.lock --exclude-dir=.git . 2>/dev/null
```

Expected output:

- `bun.lock` references (still present until next `vp install`).
- `docs/superpowers/...` mentions in plan/spec history (acceptable — historical docs).
- `.changeset/...` or `CHANGELOG.md` references (if any — acceptable).
- **NO references in `packages/*/src/` or `packages/*/tests/` or `scripts/`.**

If any source references remain, stop and report — Tasks 4/5/6/7/8 missed something.

- [ ] **Step 2: Delete the package directory**

```bash
git rm -r packages/runtime
```

- [ ] **Step 3: Re-resolve workspaces**

```bash
vp install --ignore-scripts
```

`bun.lock` auto-updates to drop the runtime entry.

- [ ] **Step 4: Verify the workspace is consistent**

```bash
ls packages/  # should show: cli core discovery exec expression git parser paths registry schema (no runtime)
```

10 packages total — matches the spec's final list.

- [ ] **Step 5: Commit**

```bash
git add bun.lock
git commit -m "$(cat <<'EOF'
feat(runtime)!: delete @aiactions/runtime package

The runtime package is fully replaced by the four split packages
@aiactions/expression, @aiactions/exec, @aiactions/registry, and
@aiactions/core (phase 4 of the architecture restructure). All
consumers (cli) were retargeted in prior commits.

BREAKING CHANGE: @aiactions/runtime no longer exists. Consumers must
import from @aiactions/expression (evaluateExpression, ExpressionError),
@aiactions/exec (spawnShell, spawnUses, ExecError, ResolvedAction),
@aiactions/registry (ensureCachedAction, classifyVersion, lockfile API,
RegistryError + subclasses), or @aiactions/core (runWorkflow, runJob,
resolveUsesRef, RunOptions, RunnerError + subclasses).

Refs: docs/superpowers/specs/2026-05-09-architecture-restructure-design.md

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 10: Run repo-wide verification

- [ ] **Step 1: Apply any docs fmt drift**

The architecture spec doc and earlier phase plans contain Conventional-Commit fragments that oxfmt may want to reflow. Pre-flush before running ready:

```bash
vp fmt docs --write
git status --short  # check for modifications
```

If any `docs/*` files modified, commit separately:

```bash
git add docs/superpowers
git commit -m "$(cat <<'EOF'
style(fmt): apply oxfmt to phase-4 docs drift

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

- [ ] **Step 2: Run `aiactions#ready`**

```bash
vp run aiactions#ready
```

Expected: PASS — gen:schemas + check + recursive build + recursive test all green.

If any failure that's NOT pre-existing (env-loader-style fmt drift, missing symlinks): STOP and report. Do not bypass.

- [ ] **Step 3: Sanity-check the per-package test counts**

After ready passes, verify each new package contributed expected test counts:

```bash
cd packages/expression && vp test 2>&1 | grep 'Tests'
cd ../exec && vp test 2>&1 | grep 'Tests'
cd ../registry && vp test 2>&1 | grep 'Tests'
cd ../core && vp test 2>&1 | grep 'Tests'
```

Expected (anchor against pre-phase totals after migration):

- expression: ~tests-from-expression.test.ts
- exec: ~tests-from-10-files
- registry: ~tests-from-5-files
- core: ~tests-from-9-files (integration-heavy)

Total preserved from runtime: should equal the pre-phase runtime test count minus the dropped `public-api.test.ts` (`@aiactions/runtime`-specific surface check, no longer relevant).

If total drops by more than the public-api count, a test was lost in migration — diff `packages/runtime/tests/` (from git history) against the migrated set.

---

## Task 11: detect_changes + persist phase-4-shipped + decide PR strategy

- [ ] **Step 1: Sync the codebase index**

```
mcp__codebase-memory-mcp__detect_changes(
  project: "home-aperrix-Documents-PROJECTS-aiactions",
  since: "HEAD~12"
)
```

(Approximate — adjust to span every Phase-4 commit.)

If significant drift (4 new packages added counts as drift), run `moderate` re-index:

```
mcp__codebase-memory-mcp__index_repository(
  repo_path: "/home/aperrix/Documents/PROJECTS/aiactions",
  mode: "moderate"
)
```

- [ ] **Step 2: Persist Phase-4 completion in MuninnDB**

Call `mcp__muninn__muninn_remember` with `vault: "aiactions"`, `concept: "phase-4-runtime-split-shipped"`, `type: "milestone"`. Content must include:

- Four new packages at v1.0.0 with their internal layouts and exports.
- `@aiactions/runtime` deletion (`feat(runtime)!:`).
- AIactionsError abstract base introduced in `@aiactions/schema`; per-package subclasses landed (ExpressionError, ExecError, RegistryError + RegistryFetchError + RegistryResolveError, RunnerError + JobError + StepError + OrchestrationError).
- Total preserved tests across new packages: <count from Task 10 step 3>.
- Consumer migrations: cli (single import in `commands/action/install.ts`).
- Link to memory `01KR6HWP8SW32S6HTTFWZADPZS` (architecture decision) via `relation: "implements"`.
- Link to memory `01KR75RVMQXFTZCVYQJ7FSQN8A` (phase-3 shipped) via `relation: "preceded_by"`.

- [ ] **Step 3: Decide PR strategy**

Per `.claude/rules/collaboration.md`:

- Phase 4 touched many components: 4 new packages (`expression`, `exec`, `registry`, `core`), 1 modified package (`schema` — AIactionsError + types/run + types/events additive), 1 modified consumer (`cli`), 1 deleted package (`runtime`), root `package.json` (dep retargeting from devDeps if applicable). **Multi-component.** Therefore: **`git merge --no-ff`** when integrating into `main`. release-please reads each per-commit Conventional Commit and routes:
  - 4× `feat(<new-package>)` → expression/exec/registry/core first releases at 1.0.0.
  - 1× `feat(schema)` (AIactionsError + types migration) → schema minor bump (1.0.0 → 1.1.0).
  - `feat(runtime)!:` deletion → runtime tracker removed (release-please should drop the package from manifest when the dir is gone; verify in the next release PR).
  - 1× `refactor(cli)` → patch bump for cli (no behaviour change).
  - 1× `style(fmt)` → no version impact.

- Branch is named per worktree (`worktree-phase+4-runtime-split`). Rebase on `main` first if `main` has moved.

- Pre-flush `vp fmt` on `main` before the merge to avoid the MS1.7 fmt-isolation trap.

- After merge: `ExitWorktree({ action: "remove", discard_changes: true })` — all branch commits are reachable from `main` via the merge commit.

---

## Done

When Task 11 is complete, Phase 4 is done. The 10-package brick layout from the architecture spec is fully realised. The next plan to write is `2026-MM-DD-phase-5-cli-vertical-slices.md`, covering the `@aiactions/cli` refactor into `(resource, verb)` vertical slices (no breaking change; CLI surface unchanged).
