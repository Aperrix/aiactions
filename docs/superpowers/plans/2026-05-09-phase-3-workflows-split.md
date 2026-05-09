# Phase 3 — Split `@aiactions/workflows` Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Split `@aiactions/workflows` into three new leaf-or-near-leaf packages — `@aiactions/schema`, `@aiactions/parser`, `@aiactions/discovery` — consolidate the 11 schema files into 6 per spec section 7.1, migrate consumers (`@aiactions/runtime`, `@aiactions/cli`, `scripts/gen-schemas.ts`), and delete `@aiactions/workflows`. **BREAKING** — `feat(workflows)!:` major; release-please bumps schema/parser/discovery to `1.0.0` and removes the workflows tracker.

**Architecture:** Phase 3 of the 6-phase architecture restructure (`docs/superpowers/specs/2026-05-09-architecture-restructure-design.md`, sections 7.1, 7.2, 7.3, 12). Three new packages take over the workflows scope:

- `@aiactions/schema` — leaf, zod schemas + workflow domain types + workflow-error classes. 6 consolidated schema files (was 11) plus `types/errors.ts`.
- `@aiactions/parser` — depends on `@aiactions/schema`. YAML → AST + topology validation.
- `@aiactions/discovery` — depends on `@aiactions/parser` + `@aiactions/schema`. Find workflow files on disk.

**Tech Stack:** TypeScript (strict + verbatimModuleSyntax + isolatedModules), `zod`, `yaml`, Vite+ test runner, ESM-only.

---

## Schema Consolidation Map (11 → 6 files)

| Target consolidated file     | Source files merged                                                  | Internal exports preserved                                                                                                                                                                                                                                                                                    |
| ---------------------------- | -------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `schemas/workflow.ts`        | `workflow.ts` + `job.ts` + `step.ts` + `defaults.ts` + `topology.ts` | `workflowSchema`, `Workflow`, `jobSchema`, `Job`, `jobIdSchema`, `jobNameSchema`, `jobNeedsSchema`, `jobOutputsSchema`, `stepSchema`, `Step`, `ifSchema`, `withSchema`, `runDefaultsSchema`, `defaultsSchema`, `RunDefaults`, `Defaults`, `findCycle`, `findDanglingDeps`, `DepRecord`, `TOPOLOGY_ISSUE_KIND` |
| `schemas/shell.ts`           | `shell.ts` + `expression.ts`                                         | `shellSchema`, plus `ExpressionTokenKind`, `ExpressionToken`, `tokenizeExpression`, `containsExpression`, `expressionStringSchema`                                                                                                                                                                            |
| `schemas/action-manifest.ts` | `action-manifest.ts` (alone)                                         | `actionInputSchema`, `actionInputsSchema`, `actionOutputSchema`, `actionOutputsSchema`, `actionRunsSchema`, `actionManifestSchema`, `ActionManifest`                                                                                                                                                          |
| `schemas/ref.ts`             | `ref.ts` (alone)                                                     | `RefKind`, `RegistryRef`, `LocalRef`, `UsesRef`, `usesRefSchema`                                                                                                                                                                                                                                              |
| `schemas/registry.ts`        | `registry.ts` (alone)                                                | `registryEntrySchema`, all current registry exports                                                                                                                                                                                                                                                           |
| `schemas/env.ts`             | `env.ts` (alone)                                                     | `envNameSchema`, `envValueSchema`, `envSchema`, `Env`                                                                                                                                                                                                                                                         |

`types/errors.ts` (`WorkflowParseError`, `WorkflowSchemaError`, `ValidationIssueCode`, `ValidationIssue`) preserved verbatim in `@aiactions/schema/src/types/errors.ts`. The phase-4 introduction of an `AIactionsError` hierarchy is out of scope here — this phase only relocates.

## Test Consolidation Map (13 → 9 test files)

Schema tests live in `packages/workflows/tests/`. Phase 3 consolidates schema-related tests in lockstep with their source files:

| Target test file (in `@aiactions/schema/tests/`) | Source test files merged                                                                                                         |
| ------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------- |
| `tests/schema-workflow.test.ts`                  | `schema-workflow.test.ts` + `schema-job.test.ts` + `schema-step.test.ts` + `schema-defaults.test.ts` + `schema-topology.test.ts` |
| `tests/schema-shell.test.ts`                     | `schema-shell-custom.test.ts` + `schema-expression.test.ts`                                                                      |
| `tests/schema-action-manifest.test.ts`           | `schema-action-manifest.test.ts` (rename to drop `schema-` prefix optional — keep `schema-` for grep stability across phases)    |
| `tests/schema-ref.test.ts`                       | `schema-ref.test.ts`                                                                                                             |
| `tests/schema-registry.test.ts`                  | `schema-registry.test.ts`                                                                                                        |
| `tests/schema-env.test.ts`                       | `schema-env.test.ts`                                                                                                             |

Parser/discovery tests retain their existing 1:1 mapping (`parser.test.ts`, `validator.test.ts` in `@aiactions/parser/tests/`; `discovery/discover-workflows.test.ts`, `discovery/find-git-root.test.ts`, `discovery/load-from-dir.test.ts`, `discovery/fixtures.ts` in `@aiactions/discovery/tests/`).

## Internal Dependency Updates

After the split, internal imports change as follows:

| File location                                | Old import path               | New import path     |
| -------------------------------------------- | ----------------------------- | ------------------- |
| `parser/*.ts` (in `@aiactions/parser`)       | `../schema/<file>.ts`         | `@aiactions/schema` |
| `parser/*.ts` (in `@aiactions/parser`)       | `../types/errors.ts`          | `@aiactions/schema` |
| `discovery/*.ts` (in `@aiactions/discovery`) | `../parser/parse-workflow.ts` | `@aiactions/parser` |
| `discovery/types.ts`                         | `../schema/workflow.ts`       | `@aiactions/schema` |

Within `@aiactions/schema` itself, internal cross-imports (e.g. `defaults.ts` → `expression.ts`) collapse because both types now live in the same consolidated file (`workflow.ts` and `shell.ts` respectively).

## Consumer Migration Map

| Consumer                    | Old import surface                                                                          | New import surface                                                             |
| --------------------------- | ------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| `@aiactions/runtime`        | `@aiactions/workflows`                                                                      | `@aiactions/schema` (for schemas + types) + `@aiactions/parser` (if it parses) |
| `@aiactions/cli`            | `@aiactions/workflows` (`parseActionManifest`, `WorkflowParseError`, `WorkflowSchemaError`) | `@aiactions/parser` (parseActionManifest) + `@aiactions/schema` (errors)       |
| `scripts/gen-schemas.ts`    | `../packages/workflows/src/index.ts` (`actionManifestSchema`, `workflowSchema`)             | `../packages/schema/src/index.ts`                                              |
| Root `package.json` devDeps | `@aiactions/workflows: workspace:*`                                                         | `@aiactions/schema: workspace:*` (gen-schemas needs schemas at install time)   |

`@aiactions/runtime` package.json: dep `@aiactions/workflows` → `@aiactions/schema` + `@aiactions/parser` (multiple deps replace the single one).
`@aiactions/cli` package.json: dep `@aiactions/workflows` → `@aiactions/schema` + `@aiactions/parser`.

## File Structure (target)

```
packages/schema/
  package.json
  tsconfig.json
  vite.config.ts
  src/
    schemas/
      workflow.ts              # was: workflow + job + step + defaults + topology
      shell.ts                 # was: shell + expression
      action-manifest.ts
      ref.ts
      registry.ts
      env.ts
    types/
      errors.ts                # WorkflowParseError, WorkflowSchemaError, ValidationIssueCode, ValidationIssue
    index.ts
  tests/
    schema-workflow.test.ts    # consolidates 5 source test files
    schema-shell.test.ts       # consolidates 2
    schema-action-manifest.test.ts
    schema-ref.test.ts
    schema-registry.test.ts
    schema-env.test.ts

packages/parser/
  package.json                 # depends on @aiactions/schema
  tsconfig.json
  vite.config.ts
  src/
    parse-workflow.ts
    parse-action.ts
    validate-workflow.ts
    topology-issue.ts
    index.ts
  tests/
    parser.test.ts
    validator.test.ts

packages/discovery/
  package.json                 # depends on @aiactions/parser + @aiactions/schema
  tsconfig.json
  vite.config.ts
  src/
    discover-workflows.ts
    find-git-root.ts
    load-from-dir.ts
    types.ts
    errors.ts
    index.ts
  tests/
    discover-workflows.test.ts
    find-git-root.test.ts
    load-from-dir.test.ts
    fixtures.ts
```

`packages/workflows/` is **deleted** at task 14.

---

## Task 1: Bootstrap `@aiactions/schema`, `@aiactions/parser`, `@aiactions/discovery` skeletons

**Files (create):**

- `packages/schema/{package.json,tsconfig.json,vite.config.ts,src/index.ts}`
- `packages/parser/{package.json,tsconfig.json,vite.config.ts,src/index.ts}`
- `packages/discovery/{package.json,tsconfig.json,vite.config.ts,src/index.ts}`

- [ ] **Step 1: Create directory trees**

```bash
mkdir -p packages/schema/src/schemas packages/schema/src/types packages/schema/tests
mkdir -p packages/parser/src packages/parser/tests
mkdir -p packages/discovery/src packages/discovery/tests
```

- [ ] **Step 2: Write the three `package.json` files**

`packages/schema/package.json`:

```json
{
  "name": "@aiactions/schema",
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
    "zod": "^4.4.3"
  }
}
```

`packages/parser/package.json`:

```json
{
  "name": "@aiactions/parser",
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
    "@aiactions/schema": "workspace:*",
    "yaml": "^2.8.4",
    "zod": "^4.4.3"
  }
}
```

`packages/discovery/package.json`:

```json
{
  "name": "@aiactions/discovery",
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
    "@aiactions/parser": "workspace:*",
    "@aiactions/schema": "workspace:*"
  }
}
```

- [ ] **Step 3: Write the three `tsconfig.json` files** — each identical to `packages/paths/tsconfig.json`. Reuse byte-for-byte.

- [ ] **Step 4: Write the three `vite.config.ts` files** — each identical to `packages/paths/vite.config.ts`. Reuse byte-for-byte.

- [ ] **Step 5: Write the three empty `src/index.ts` placeholders**

Each file:

```ts
// Public API barrel — populated by subsequent tasks.
export {};
```

- [ ] **Step 6: Register packages in workspace**

```bash
vp install --ignore-scripts
```

After install, fix `@types/node` symlinks across all 8 packages:

```bash
for pkg in cli runtime workflows paths git schema parser discovery; do
  mkdir -p packages/$pkg/node_modules/@types
  ln -sf ../../../../node_modules/.bun/@types+node@22.19.17/node_modules/@types/node packages/$pkg/node_modules/@types/node
done
```

- [ ] **Step 7: Verify all three skeletons compile**

```bash
cd packages/schema && vp check && cd ../parser && vp check && cd ../discovery && vp check
```

Expected: PASS for all three (empty trees).

- [ ] **Step 8: Commit**

```bash
git add packages/schema packages/parser packages/discovery
git commit -m "$(cat <<'EOF'
feat(schema,parser,discovery): scaffold three new packages

Empty skeletons for the workflows split. Subsequent commits migrate
schemas, parsers, and discovery from @aiactions/workflows.

Refs: docs/superpowers/specs/2026-05-09-architecture-restructure-design.md
Refs: docs/superpowers/plans/2026-05-09-phase-3-workflows-split.md

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 2: Migrate schema source to `@aiactions/schema` (consolidate 11 → 6)

**Files (create in `@aiactions/schema/src/schemas/`):** `workflow.ts`, `shell.ts`, `action-manifest.ts`, `ref.ts`, `registry.ts`, `env.ts`. Plus `types/errors.ts`.

**Source content** lives in `packages/workflows/src/schema/*.ts` and `packages/workflows/src/types/errors.ts`. The implementer reads each source, merges per the consolidation map, and resolves internal imports.

- [ ] **Step 1: Migrate the standalone schemas (5 files unchanged in scope)**

For each of `action-manifest`, `ref`, `registry`, `env`:

```bash
cp packages/workflows/src/schema/<name>.ts packages/schema/src/schemas/<name>.ts
```

Then in the copied file, update internal imports:

- `from "./expression.ts"` → `from "./shell.ts"` (expression now lives in shell.ts)
- `from "./shell.ts"` → `from "./shell.ts"` (unchanged)
- Other `./<name>.ts` imports stay as-is (sibling files).

The `env.ts` file imports `expressionStringSchema from "./expression.ts"` → must change to `from "./shell.ts"`.

- [ ] **Step 2: Migrate `types/errors.ts`**

```bash
cp packages/workflows/src/types/errors.ts packages/schema/src/types/errors.ts
```

No content changes (the file is self-contained).

- [ ] **Step 3: Create the consolidated `schemas/shell.ts`**

Read `packages/workflows/src/schema/shell.ts` and `packages/workflows/src/schema/expression.ts`. Create `packages/schema/src/schemas/shell.ts` with the concatenated content:

1. Combine the two file-header JSDocs into one block describing both purposes.
2. Merge the imports section (deduplicate `import { z } from "zod"`).
3. Place `expression.ts` content first (because `shell.ts`'s schema may reference `expressionStringSchema`).
4. Place `shell.ts` content second.
5. Preserve every export from both files.
6. No internal imports between them — they're now in the same file. Remove any `from "./expression.ts"` references inside the merged content.

- [ ] **Step 4: Create the consolidated `schemas/workflow.ts`**

Read `workflow.ts`, `job.ts`, `step.ts`, `defaults.ts`, `topology.ts` from `packages/workflows/src/schema/`. Create `packages/schema/src/schemas/workflow.ts` with the concatenated content:

1. Combine all five file-header JSDocs into one section-divided block.
2. Merge imports — deduplicate `import { z } from "zod"`. Preserve only the imports referencing files OUTSIDE the consolidation (i.e. `from "./env.ts"`, `from "./ref.ts"`, `from "./shell.ts"` (for expression), `from "../types/errors.ts"`).
3. Order the contents bottom-up so each definition precedes its consumers:
   - First: `topology.ts` content (`findCycle`, `findDanglingDeps`, `DepRecord`, `TOPOLOGY_ISSUE_KIND`).
   - Then: `defaults.ts` content (`runDefaultsSchema`, `defaultsSchema`, types).
   - Then: `step.ts` content (`stepSchema`, `Step`, `ifSchema`, `withSchema`).
   - Then: `job.ts` content (`jobSchema`, `Job`, `jobIdSchema`, etc.).
   - Last: `workflow.ts` content (`workflowSchema`, `Workflow`).
4. Remove any `from "./<sibling>.ts"` imports that now reference content within the merged file.
5. The `from "./expression.ts"` references in `defaults.ts`/`step.ts`/`job.ts`/`workflow.ts` now become `from "./shell.ts"` (since expression moved into shell.ts).

- [ ] **Step 5: Verify the schema package type-checks**

```bash
cd packages/schema && vp check
```

Expected: PASS. If lint/type errors appear, the consolidation has broken an import chain — fix before proceeding.

- [ ] **Step 6: Commit**

```bash
git add packages/schema/src
git commit -m "$(cat <<'EOF'
feat(schema): migrate workflow schemas (consolidate 11 to 6 files)

Moves zod schemas + workflow domain types + workflow-error classes from
@aiactions/workflows into the new @aiactions/schema package.

Consolidation per spec section 7.1:
- schemas/workflow.ts ← workflow + job + step + defaults + topology
- schemas/shell.ts    ← shell + expression
- schemas/{action-manifest,ref,registry,env}.ts unchanged in scope
- types/errors.ts     unchanged

Internal expression imports inside the consolidated workflow.ts now
resolve from shell.ts (expression merged there). All public exports
preserved verbatim.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 3: Migrate schema tests to `@aiactions/schema` (consolidate 13 → 6)

**Files (create in `@aiactions/schema/tests/`):** 6 test files mirroring the consolidated source structure.

- [ ] **Step 1: Migrate the standalone test files (4 files)**

For each of `schema-action-manifest`, `schema-ref`, `schema-registry`, `schema-env`:

```bash
cp packages/workflows/tests/<name>.test.ts packages/schema/tests/<name>.test.ts
```

Then in each copied file, update import paths:

- `from "../src/schema/<file>.ts"` → `from "../src/schemas/<file>.ts"`
- `from "../src/types/errors.ts"` → `from "../src/types/errors.ts"` (unchanged)

- [ ] **Step 2: Create the consolidated `tests/schema-shell.test.ts`**

Read `packages/workflows/tests/schema-shell-custom.test.ts` and `packages/workflows/tests/schema-expression.test.ts`. Create `packages/schema/tests/schema-shell.test.ts`:

1. Merge import sections (deduplicate `import { describe, expect, test } from "vite-plus/test"`).
2. Update imports: `from "../src/schema/shell.ts"` and `from "../src/schema/expression.ts"` both become `from "../src/schemas/shell.ts"`.
3. Concatenate both test bodies, keeping their separate `describe(...)` blocks (no merging at the describe level).
4. Total expected tests: 18 (shell-custom) + 18 (expression) = **36**.

- [ ] **Step 3: Create the consolidated `tests/schema-workflow.test.ts`**

Read `schema-workflow.test.ts`, `schema-job.test.ts`, `schema-step.test.ts`, `schema-defaults.test.ts`, `schema-topology.test.ts`. Create one consolidated file:

1. Merge import sections.
2. Update imports: every `from "../src/schema/<file>.ts"` becomes `from "../src/schemas/workflow.ts"`.
3. Concatenate test bodies, preserving each file's `describe(...)` block.
4. Total expected tests: 17 (workflow) + 15 (job) + 26 (step) + 7 (defaults) + 16 (topology) = **81**.

- [ ] **Step 4: Run schema tests**

```bash
cd packages/schema && vp test
```

Expected: 36 + 81 + 17 + 21 + 8 + 14 = **177 tests passing across 6 files**.

If a test fails: an export was renamed during consolidation. Compare against original imports.

- [ ] **Step 5: Wire the schema barrel**

Edit `packages/schema/src/index.ts`:

```ts
export * from "./schemas/shell.ts";
export * from "./schemas/env.ts";
export * from "./schemas/ref.ts";
export * from "./schemas/registry.ts";
export * from "./schemas/action-manifest.ts";
export * from "./schemas/workflow.ts";
export * from "./types/errors.ts";
```

Order matters for export-\* conflict resolution if any (none expected).

- [ ] **Step 6: Verify**

```bash
cd packages/schema && vp check && vp test
```

Expected: lint+type-check PASS, 177 tests green.

- [ ] **Step 7: Commit**

```bash
git add packages/schema/tests packages/schema/src/index.ts
git commit -m "$(cat <<'EOF'
test(schema): migrate schema tests (consolidate 13 to 6 files)

Mirrors the source consolidation in tests/. All 177 schema tests pass
against the new @aiactions/schema package; barrel re-exports the full
public API.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 4: Migrate `@aiactions/parser` source + tests

**Files (in `packages/parser/`):**

- `src/parse-workflow.ts`, `src/parse-action.ts`, `src/validate-workflow.ts`, `src/topology-issue.ts`, `src/index.ts`
- `tests/parser.test.ts`, `tests/validator.test.ts`

- [ ] **Step 1: Migrate parser source files**

```bash
cp packages/workflows/src/parser/parse-workflow.ts packages/parser/src/parse-workflow.ts
cp packages/workflows/src/parser/parse-action.ts packages/parser/src/parse-action.ts
cp packages/workflows/src/parser/validate-workflow.ts packages/parser/src/validate-workflow.ts
cp packages/workflows/src/parser/topology-issue.ts packages/parser/src/topology-issue.ts
```

In each copied file, update internal imports per the dependency map:

- `from "../schema/workflow.ts"` → `from "@aiactions/schema"`
- `from "../schema/action-manifest.ts"` → `from "@aiactions/schema"`
- `from "../types/errors.ts"` → `from "@aiactions/schema"`
- `from "./topology-issue.ts"` → `from "./topology-issue.ts"` (unchanged — still sibling)
- `from "./parse-workflow.ts"` → `from "./parse-workflow.ts"` (unchanged)

Note: `topology-issue.ts` imports `TOPOLOGY_ISSUE_KIND from "../schema/workflow.ts"` and `ValidationIssueCode from "../types/errors.ts"`. Both become `from "@aiactions/schema"`.

- [ ] **Step 2: Wire parser barrel**

Edit `packages/parser/src/index.ts`:

```ts
export * from "./parse-workflow.ts";
export * from "./parse-action.ts";
export * from "./validate-workflow.ts";
```

`topology-issue.ts` is internal — not re-exported.

- [ ] **Step 3: Migrate parser tests**

```bash
cp packages/workflows/tests/parser.test.ts packages/parser/tests/parser.test.ts
cp packages/workflows/tests/validator.test.ts packages/parser/tests/validator.test.ts
```

In each test file, update imports:

- `from "../src/parser/<file>.ts"` → `from "../src/<file>.ts"`
- `from "../src/schema/<file>.ts"` → `from "@aiactions/schema"`
- `from "../src/types/errors.ts"` → `from "@aiactions/schema"`

- [ ] **Step 4: Verify**

```bash
cd packages/parser && vp check && vp test
```

Expected: lint+type-check PASS, **13 (parser) + 4 (validator) = 17 tests** green.

- [ ] **Step 5: Commit**

```bash
git add packages/parser
git commit -m "$(cat <<'EOF'
feat(parser): migrate workflow parser + topology validator

Moves parse-workflow, parse-action, validate-workflow, and the internal
topology-issue helper from @aiactions/workflows into @aiactions/parser.

Internal imports rewired: schema lookups now resolve from
@aiactions/schema. Public surface preserved verbatim — parseWorkflow,
parseAction, validateWorkflow.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 5: Migrate `@aiactions/discovery` source + tests

**Files (in `packages/discovery/`):**

- `src/discover-workflows.ts`, `src/find-git-root.ts`, `src/load-from-dir.ts`, `src/types.ts`, `src/errors.ts`, `src/index.ts`
- `tests/discover-workflows.test.ts`, `tests/find-git-root.test.ts`, `tests/load-from-dir.test.ts`, `tests/fixtures.ts`

- [ ] **Step 1: Migrate discovery source**

```bash
cp packages/workflows/src/discovery/discover-workflows.ts packages/discovery/src/
cp packages/workflows/src/discovery/find-git-root.ts packages/discovery/src/
cp packages/workflows/src/discovery/load-from-dir.ts packages/discovery/src/
cp packages/workflows/src/discovery/types.ts packages/discovery/src/
cp packages/workflows/src/discovery/errors.ts packages/discovery/src/
cp packages/workflows/src/discovery/index.ts packages/discovery/src/
```

In each copied file, update imports:

- `from "../parser/parse-workflow.ts"` → `from "@aiactions/parser"`
- `from "../schema/workflow.ts"` → `from "@aiactions/schema"`
- Sibling `./*.ts` imports (`./find-git-root.ts`, `./load-from-dir.ts`, `./types.ts`, `./errors.ts`) stay as-is.

The existing `discovery/index.ts` already re-exports — verify it points to relative paths (no `../`).

- [ ] **Step 2: Migrate discovery tests + fixtures**

```bash
cp packages/workflows/tests/discovery/discover-workflows.test.ts packages/discovery/tests/
cp packages/workflows/tests/discovery/find-git-root.test.ts packages/discovery/tests/
cp packages/workflows/tests/discovery/load-from-dir.test.ts packages/discovery/tests/
cp packages/workflows/tests/discovery/fixtures.ts packages/discovery/tests/
```

In each test file, update imports:

- `from "../../src/discovery/<file>.ts"` → `from "../src/<file>.ts"`
- `from "../../src/schema/<file>.ts"` → `from "@aiactions/schema"`

- [ ] **Step 3: Wire discovery barrel**

Edit `packages/discovery/src/index.ts` to re-export the public surface (already approximately correct from the original — verify it does `export * from` the source files at the new flat layout, not the old `./<dir>/<file>.ts`):

```ts
export * from "./discover-workflows.ts";
export * from "./find-git-root.ts";
export * from "./load-from-dir.ts";
export * from "./types.ts";
export * from "./errors.ts";
```

- [ ] **Step 4: Verify**

```bash
cd packages/discovery && vp check && vp test
```

Expected: lint+type-check PASS. Tests: 10 (discover-workflows) + 6 (find-git-root) + 12 (load-from-dir) = **28 tests** green.

- [ ] **Step 5: Commit**

```bash
git add packages/discovery
git commit -m "$(cat <<'EOF'
feat(discovery): migrate workflow discovery API

Moves discoverWorkflows, findGitRoot, loadWorkflowsFromDir from
@aiactions/workflows/discovery/ into the new @aiactions/discovery
package as a flat src/ layout.

Internal imports rewired: parser lookup goes through @aiactions/parser,
schema types through @aiactions/schema.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 6: Migrate `@aiactions/runtime` consumer

**File:** `packages/runtime/package.json` + every runtime source/test file that imports from `@aiactions/workflows`.

- [ ] **Step 1: Find every workflows reference in runtime**

```bash
grep -rn '@aiactions/workflows' packages/runtime/src packages/runtime/tests
```

For each match, identify whether the imported symbol belongs to `@aiactions/schema` (schemas, types, error classes) or `@aiactions/parser` (parseWorkflow, parseAction, validateWorkflow).

- [ ] **Step 2: Update `packages/runtime/package.json`**

Replace the `@aiactions/workflows` dep with two entries (preserve alphabetical order):

```diff
   "dependencies": {
     "@aiactions/git": "workspace:*",
-    "@aiactions/workflows": "workspace:*",
+    "@aiactions/parser": "workspace:*",
+    "@aiactions/schema": "workspace:*",
     "semver": "^7.8.0",
     "zod": "^4.4.3"
   },
```

- [ ] **Step 3: Update each runtime source/test file**

Replace each `from "@aiactions/workflows"` with the appropriate target package per the mapping in step 1. Multi-import lines may need to split:

```ts
// before:
import { parseWorkflow, workflowSchema, WorkflowParseError } from "@aiactions/workflows";

// after:
import { parseWorkflow } from "@aiactions/parser";
import { workflowSchema, WorkflowParseError } from "@aiactions/schema";
```

- [ ] **Step 4: Re-resolve workspace symlinks**

```bash
vp install --ignore-scripts
```

Re-fix `@types/node` symlinks per Task 1 step 6 if necessary.

- [ ] **Step 5: Verify**

```bash
cd packages/runtime && vp check && vp test
```

Expected: PASS. All runtime tests still green.

- [ ] **Step 6: Commit**

```bash
git add packages/runtime
git commit -m "$(cat <<'EOF'
refactor(runtime): consume @aiactions/schema + @aiactions/parser

Replaces the @aiactions/workflows dep with the two split packages.
Imports updated across runtime source + tests; behaviour unchanged.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 7: Migrate `@aiactions/cli` consumer

Same shape as Task 6, against `packages/cli/`.

- [ ] **Step 1: Find every workflows reference in cli**

```bash
grep -rn '@aiactions/workflows' packages/cli/src packages/cli/tests
```

Expected matches in `packages/cli/src/lib/check-manifest.ts` (`parseActionManifest`, `WorkflowParseError`, `WorkflowSchemaError`) and possibly elsewhere — list all and route each to schema or parser.

- [ ] **Step 2: Update `packages/cli/package.json`**

```diff
   "dependencies": {
     "@aiactions/paths": "workspace:*",
+    "@aiactions/parser": "workspace:*",
     "@aiactions/runtime": "workspace:*",
-    "@aiactions/workflows": "workspace:*",
+    "@aiactions/schema": "workspace:*",
     ...
   },
```

- [ ] **Step 3: Update each cli source/test file**

Same import-rewrite logic as runtime. Split multi-imports as needed.

- [ ] **Step 4: Re-resolve + verify**

```bash
vp install --ignore-scripts
cd packages/cli && vp check && vp test
```

Expected: PASS, all 79+1 skipped CLI tests still green.

- [ ] **Step 5: Commit**

```bash
git add packages/cli
git commit -m "$(cat <<'EOF'
refactor(cli): consume @aiactions/schema + @aiactions/parser

Replaces the @aiactions/workflows dep with the two split packages.
Imports updated across cli source + tests; CLI surface unchanged.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 8: Update `scripts/gen-schemas.ts` + root `package.json`

**Files:**

- `scripts/gen-schemas.ts`
- `package.json` (root)
- `bun.lock` (auto-updates)

- [ ] **Step 1: Update `scripts/gen-schemas.ts`**

Find the line:

```ts
import { actionManifestSchema, workflowSchema } from "../packages/workflows/src/index.ts";
```

Replace with:

```ts
import { actionManifestSchema, workflowSchema } from "../packages/schema/src/index.ts";
```

- [ ] **Step 2: Update root `package.json`**

```diff
   "devDependencies": {
-    "@aiactions/workflows": "workspace:*",
+    "@aiactions/schema": "workspace:*",
     "lefthook": "^2.1.6",
     ...
   },
```

- [ ] **Step 3: Re-resolve**

```bash
vp install --ignore-scripts
```

- [ ] **Step 4: Verify gen-schemas still produces output**

```bash
bun run scripts/gen-schemas.ts
ls -la workflow-schema.json manifest-schema.json
```

Expected: both JSON files written successfully.

- [ ] **Step 5: Commit**

```bash
git add scripts/gen-schemas.ts package.json bun.lock
git commit -m "$(cat <<'EOF'
chore(deps): retarget gen-schemas + root devDeps to @aiactions/schema

Repoints scripts/gen-schemas.ts and the root devDep from the deprecated
@aiactions/workflows to @aiactions/schema. Lockfile sync follows.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 9: Delete `@aiactions/workflows`

**File:** `packages/workflows/` (entire directory).

- [ ] **Step 1: Verify zero residual references**

```bash
grep -rn '@aiactions/workflows' --exclude-dir=node_modules --exclude=bun.lock --exclude-dir=.git . 2>/dev/null
```

Expected output:

- `bun.lock` references (still present until next `vp install`).
- `docs/superpowers/...` mentions in plan/spec history (acceptable — historical docs).
- `.changeset/...` or `CHANGELOG.md` references (if any — acceptable).
- **NO references in `packages/*/src/` or `packages/*/tests/` or `scripts/`.**

If any source references remain, stop and report — Tasks 6/7/8 missed something.

- [ ] **Step 2: Delete the package directory**

```bash
git rm -r packages/workflows
```

- [ ] **Step 3: Re-resolve workspaces**

```bash
vp install --ignore-scripts
```

`bun.lock` auto-updates to drop the workflows entry.

- [ ] **Step 4: Verify the workspace is consistent**

```bash
ls packages/  # should show: cli git parser paths runtime schema discovery (no workflows)
```

- [ ] **Step 5: Commit**

```bash
git add bun.lock
git commit -m "$(cat <<'EOF'
feat(workflows)!: delete @aiactions/workflows package

The workflows package is fully replaced by the three split packages
@aiactions/schema, @aiactions/parser, and @aiactions/discovery (phase 3
of the architecture restructure). All consumers (runtime, cli, root,
gen-schemas) were retargeted in prior commits.

BREAKING CHANGE: @aiactions/workflows no longer exists. Consumers must
import from @aiactions/schema (zod schemas, types, errors),
@aiactions/parser (parseWorkflow, parseAction, validateWorkflow), or
@aiactions/discovery (discoverWorkflows, findGitRoot, loadWorkflowsFromDir).

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

If any docs/\* files modified, commit separately:

```bash
git add docs/superpowers
git commit -m "$(cat <<'EOF'
style(fmt): apply oxfmt to phase-3 docs drift

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
cd packages/schema && vp test 2>&1 | grep 'Tests'
cd ../parser && vp test 2>&1 | grep 'Tests'
cd ../discovery && vp test 2>&1 | grep 'Tests'
```

Expected:

- schema: 177 tests across 6 files
- parser: 17 tests across 2 files
- discovery: 28 tests across 3 files

Total preserved from workflows: 222 tests.

---

## Task 11: detect_changes + persist phase-3-shipped + decide PR strategy

- [ ] **Step 1: Sync the codebase index**

```
mcp__codebase-memory-mcp__detect_changes(
  project: "home-aperrix-Documents-PROJECTS-aiactions",
  since: "HEAD~10"
)
```

(Approximate — adjust to span every Phase-3 commit.)

If significant drift (3 new packages added counts as drift), run `moderate` re-index:

```
mcp__codebase-memory-mcp__index_repository(
  repo_path: "/home/aperrix/Documents/PROJECTS/aiactions",
  mode: "moderate"
)
```

- [ ] **Step 2: Persist Phase-3 completion in MuninnDB**

Call `mcp__muninn__muninn_remember` with `vault: "aiactions"`, `concept: "phase-3-workflows-split-shipped"`, `type: "milestone"`. Content must include:

- Three new packages at v1.0.0 with their internal layouts and exports.
- `@aiactions/workflows` deletion (`feat(workflows)!:`).
- Schema consolidation 11 → 6 source files + 13 → 6 test files.
- Total preserved tests across new packages: 222.
- Consumer migrations: runtime + cli + scripts/gen-schemas + root package.json.
- Link to memory `01KR6HWP8SW32S6HTTFWZADPZS` (architecture decision) via `relation: "implements"`.
- Link to memory `01KR6QKGB5Q152WDBYD6BW6KEE` (phase-2 git shipped) via `relation: "preceded_by"`.

- [ ] **Step 3: Decide PR strategy**

Per `.claude/rules/collaboration.md`:

- Phase 3 touched many components: 3 new packages (`schema`, `parser`, `discovery`), 2 modified consumers (`runtime`, `cli`), 1 deleted package (`workflows`), root `package.json`, `scripts/`. **Multi-component.** Therefore: **`git merge --no-ff`** when integrating into `main`. release-please reads each per-commit Conventional Commit and routes:
  - 3× `feat(<new-package>)` → schema/parser/discovery first releases at 1.0.0.
  - `feat(workflows)!:` deletion → workflows tracker removed (release-please should drop the package from manifest when the dir is gone; verify in the next release PR).
  - 2× `refactor(<consumer>)` → patch bumps for runtime + cli (no behaviour change).
  - 1× `chore(deps)` → no version impact.
  - 1× `style(fmt)` → no version impact.

- Branch is named per worktree (e.g. `worktree-phase+3-workflows-split`). Rebase on `main` first if `main` has moved.

- Pre-flush `vp fmt` on `main` before the merge to avoid the MS1.7 fmt-isolation trap.

- After merge: `ExitWorktree({ action: "remove", discard_changes: true })` — all branch commits are reachable from `main` via the merge commit.

---

## Done

When Task 11 is complete, Phase 3 is done. The next plan to write is `2026-MM-DD-phase-4-runtime-split.md`, covering the split of `@aiactions/runtime` into `@aiactions/expression` + `@aiactions/exec` + `@aiactions/registry` + `@aiactions/core` (BREAKING again — major bump tracker for runtime).
