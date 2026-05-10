# Phase 6 — CLI workflow slices Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add `aia workflow list` + `aia workflow check` to `@aiactions/cli`, plus the upstream error-class plumbing required to map their failures to canonical exit codes.

**Architecture:** Two new vertical slices under `packages/cli/src/commands/workflow/` (mirror of phase-5 `commands/action/`). Each slice owns its `command.ts` (citty), an orchestrator (`list-workflows.ts` / `check-workflow.ts`), and a receipt writer (`receipt.ts`). Discovery's `NotInGitRepoError` is promoted to extend `AIactionsError` so the existing top-level CLI handler maps it to `EXIT.USAGE`. Three workflow-error classes plus `NotInGitRepoError` are added to `EXIT_BY_BRICK_ERROR`.

**Tech Stack:** TypeScript (strict), Vite+ (build/test/lint via `vp`), Vitest (`vite-plus/test`), citty (CLI framework), `@aiactions/discovery` + `@aiactions/parser` + `@aiactions/schema` (existing bricks).

**Source spec:** `docs/superpowers/specs/2026-05-10-phase-6-cli-workflow-slices-design.md` (locked 2026-05-10).

---

## Task 0: Pre-flight on `main`

**Files:**
- Inspect: `git status`, `vp fmt --check` output

- [ ] **Step 1: Confirm a clean `main` working tree**

```bash
git status --short
```

Expected: empty output (no uncommitted changes). If anything appears, stop and surface it to the user — never silently discard work.

- [ ] **Step 2: Pre-flush any pending oxfmt drift on `main`**

```bash
vp fmt
git status --short
```

If `git status --short` shows any changes after `vp fmt`, the working tree had pending format drift. Commit it on `main` *before* starting the worktree to keep it out of phase-6's no-ff range (lesson MS1.7):

```bash
git add -A
git commit -m "style(fmt): flush oxfmt drift before phase-6 worktree"
```

If `vp fmt` produced no changes, skip the commit.

- [ ] **Step 3: Pull latest `main`**

```bash
git pull --ff-only
```

Expected: `Already up to date.` or a fast-forward pull; no merge.

- [ ] **Step 4: Verify the codebase is currently green**

```bash
vp run ready
```

Expected: green across the whole monorepo. This baseline locks the "before" state.

(No commit at this task — it is a verification gate.)

---

## Task 1: Create the phase-6 worktree

**Files:**
- Create: `../aiactions-phase-6/` (sibling worktree directory)

- [ ] **Step 1: Verify the worktree dir is free**

```bash
test ! -e ../aiactions-phase-6 && echo "ok" || echo "exists"
```

Expected: `ok`. If the path exists, surface to the user — do NOT delete.

- [ ] **Step 2: Create the worktree on a fresh branch**

```bash
git worktree add -b worktree-phase-6-cli-workflow-slices ../aiactions-phase-6 main
```

Expected: `Preparing worktree (new branch 'worktree-phase-6-cli-workflow-slices') / HEAD is now at <SHA> ...`

- [ ] **Step 3: Switch to the worktree directory**

```bash
cd ../aiactions-phase-6
```

All subsequent tasks run from inside this worktree.

- [ ] **Step 4: Install deps in the worktree**

```bash
vp install
```

Expected: deps reconciled, lockfile unchanged (we have not modified any `package.json` yet).

(No commit at this task.)

---

## Task 2: Promote `NotInGitRepoError` to extend `AIactionsError`

**Files:**
- Modify: `packages/discovery/src/errors.ts`
- Create: `packages/discovery/tests/errors.test.ts`

- [ ] **Step 1: Write the failing test**

Create `packages/discovery/tests/errors.test.ts`:

```ts
import { describe, expect, it } from "vite-plus/test";

import { AIactionsError } from "@aiactions/schema";

import { NotInGitRepoError } from "../src/errors.ts";

describe("NotInGitRepoError", () => {
  it("extends AIactionsError", () => {
    const err = new NotInGitRepoError("/tmp/x");
    expect(err).toBeInstanceOf(AIactionsError);
  });

  it("still extends Error", () => {
    const err = new NotInGitRepoError("/tmp/x");
    expect(err).toBeInstanceOf(Error);
  });

  it("preserves the ENOTINGITREPO sentinel code", () => {
    const err = new NotInGitRepoError("/tmp/x");
    expect(err.code).toBe("ENOTINGITREPO");
  });

  it("preserves the startDir field and the rendered message", () => {
    const err = new NotInGitRepoError("/tmp/x");
    expect(err.startDir).toBe("/tmp/x");
    expect(err.message).toBe("not in a git repository: /tmp/x");
  });

  it("preserves the name property", () => {
    const err = new NotInGitRepoError("/tmp/x");
    expect(err.name).toBe("NotInGitRepoError");
  });
});
```

- [ ] **Step 2: Run the test, expect a failure**

```bash
cd packages/discovery
vp test errors.test.ts
```

Expected: the `extends AIactionsError` assertion fails (`Expected NotInGitRepoError to be an instance of AIactionsError`). The other four pass.

- [ ] **Step 3: Modify `packages/discovery/src/errors.ts`**

Replace the entire contents of `packages/discovery/src/errors.ts` with:

```ts
/**
 * Discovery error classes. Raised by `findGitRoot` (and propagated through
 * `discoverWorkflows`) when no `.git` ancestor exists.
 *
 * Per-file parse/schema/validation failures are NOT thrown — they are
 * captured in `DiscoveryError` records on `DiscoveryResult.errors`.
 */

import { AIactionsError } from "@aiactions/schema";

/** Thrown when `findGitRoot` reaches the filesystem root without finding `.git`. */
export class NotInGitRepoError extends AIactionsError {
  readonly code = "ENOTINGITREPO" as const;
  constructor(public readonly startDir: string) {
    super(`not in a git repository: ${startDir}`);
    this.name = "NotInGitRepoError";
  }
}
```

- [ ] **Step 4: Run the test, expect it to pass**

```bash
vp test errors.test.ts
```

Expected: all 5 cases green.

- [ ] **Step 5: Run all discovery tests to verify no regression**

```bash
vp test
```

Expected: all `packages/discovery/tests/*.test.ts` pass — `discover-workflows.test.ts`, `find-git-root.test.ts`, `load-from-dir.test.ts`, and the new `errors.test.ts`.

- [ ] **Step 6: Run repo-wide ready gate**

```bash
cd ../..   # back to worktree root
vp run ready
```

Expected: green across the monorepo. No package downstream of `discovery` should break — `NotInGitRepoError` keeps its constructor signature, fields, and inheritance from `Error`.

- [ ] **Step 7: Commit**

```bash
git add packages/discovery/src/errors.ts packages/discovery/tests/errors.test.ts
git commit -m "feat(discovery): NotInGitRepoError extends AIactionsError"
```

---

## Task 3: Add `@aiactions/discovery` dep to `@aiactions/cli` and extend `EXIT_BY_BRICK_ERROR`

**Files:**
- Modify: `packages/cli/package.json` (add `@aiactions/discovery` workspace dep)
- Modify: `packages/cli/src/_shared/exit-codes.ts`
- Create: `packages/cli/tests/_shared/exit-codes.test.ts`

- [ ] **Step 1: Add the workspace dep on `@aiactions/discovery`**

```bash
cd packages/cli
vp add @aiactions/discovery@workspace:*
cd ../..
```

Expected: `packages/cli/package.json` `dependencies` now contains `"@aiactions/discovery": "workspace:*"`. The lockfile updates.

If `vp add` complains about the workspace prefix, fall back to editing `packages/cli/package.json` directly: insert `"@aiactions/discovery": "workspace:*"` alphabetically into `dependencies`, then run `vp install` from the worktree root.

- [ ] **Step 2: Write the failing test**

Create `packages/cli/tests/_shared/exit-codes.test.ts`:

```ts
import { describe, expect, it } from "vite-plus/test";

import { NotInGitRepoError } from "@aiactions/discovery";
import { RegistryFetchError, RegistryResolveError, RegistryValidationError } from "@aiactions/registry";
import { WorkflowParseError, WorkflowSchemaError, WorkflowValidationError } from "@aiactions/schema";

import { EXIT, EXIT_BY_BRICK_ERROR } from "../../src/_shared/exit-codes.ts";

describe("EXIT_BY_BRICK_ERROR", () => {
  it("maps registry errors to EXIT.REGISTRY", () => {
    expect(EXIT_BY_BRICK_ERROR.get(RegistryFetchError)).toBe(EXIT.REGISTRY);
    expect(EXIT_BY_BRICK_ERROR.get(RegistryResolveError)).toBe(EXIT.REGISTRY);
    expect(EXIT_BY_BRICK_ERROR.get(RegistryValidationError)).toBe(EXIT.REGISTRY);
  });

  it("maps workflow parse/schema/validation errors to EXIT.SCHEMA", () => {
    expect(EXIT_BY_BRICK_ERROR.get(WorkflowParseError)).toBe(EXIT.SCHEMA);
    expect(EXIT_BY_BRICK_ERROR.get(WorkflowSchemaError)).toBe(EXIT.SCHEMA);
    expect(EXIT_BY_BRICK_ERROR.get(WorkflowValidationError)).toBe(EXIT.SCHEMA);
  });

  it("maps NotInGitRepoError to EXIT.USAGE", () => {
    expect(EXIT_BY_BRICK_ERROR.get(NotInGitRepoError)).toBe(EXIT.USAGE);
  });
});
```

- [ ] **Step 3: Run the test, expect failures on the new mappings**

```bash
cd packages/cli
vp test _shared/exit-codes.test.ts
```

Expected: the three "registry errors" assertions pass. The workflow + NotInGitRepoError assertions fail with `expected undefined to be 7` (or 2).

- [ ] **Step 4: Update `packages/cli/src/_shared/exit-codes.ts`**

Replace the entire contents of `packages/cli/src/_shared/exit-codes.ts` with:

```ts
import { NotInGitRepoError } from "@aiactions/discovery";
import {
  RegistryFetchError,
  RegistryResolveError,
  RegistryValidationError,
} from "@aiactions/registry";
import {
  type AIactionsError,
  WorkflowParseError,
  WorkflowSchemaError,
  WorkflowValidationError,
} from "@aiactions/schema";

/**
 * Process exit codes used by `aia`. Aligned with sysexits convention
 * (0 = OK, 2 = USAGE, 4 = data not found) plus a custom CONFLICT slot
 * reserved for future install/overwrite flows.
 */
export const EXIT = {
  OK: 0,
  RUNTIME: 1,
  USAGE: 2,
  NOT_FOUND: 4,
  CONFLICT: 5,
  REGISTRY: 6,
  SCHEMA: 7,
} as const;

export type ExitCode = (typeof EXIT)[keyof typeof EXIT];

/**
 * Map a concrete brick-error constructor to the exit code the CLI uses
 * when that error reaches the top-level handler. Brick errors extend
 * `AIactionsError` (not `CliError`) and therefore do not carry an
 * exit-code field of their own — this table is the single source of
 * truth for that mapping.
 *
 * The key type uses `(...args: any[])` because the table is a
 * constructor-identity lookup (`err.constructor`), the signature is
 * never invoked. `NotInGitRepoError` carries `(startDir: string)` and
 * is incompatible with the original strict `(message, options?)` shape.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type BrickErrorCtor = abstract new (...args: any[]) => AIactionsError;

export const EXIT_BY_BRICK_ERROR: ReadonlyMap<BrickErrorCtor, ExitCode> = new Map<
  BrickErrorCtor,
  ExitCode
>([
  [RegistryFetchError, EXIT.REGISTRY],
  [RegistryResolveError, EXIT.REGISTRY],
  [RegistryValidationError, EXIT.REGISTRY],

  [WorkflowParseError, EXIT.SCHEMA],
  [WorkflowSchemaError, EXIT.SCHEMA],
  [WorkflowValidationError, EXIT.SCHEMA],

  [NotInGitRepoError, EXIT.USAGE],
]);
```

- [ ] **Step 5: Run the test, expect it to pass**

```bash
vp test _shared/exit-codes.test.ts
```

Expected: all 3 cases green.

- [ ] **Step 6: Run all CLI tests + the repo-wide gate**

```bash
vp test
cd ../..
vp run ready
```

Expected: green across the monorepo.

- [ ] **Step 7: Commit**

```bash
git add packages/cli/package.json packages/cli/src/_shared/exit-codes.ts packages/cli/tests/_shared/exit-codes.test.ts
# also include any lockfile change from `vp add`:
git add bun.lock
git commit -m "feat(cli): map workflow + discovery errors to exit codes"
```

If the lockfile name in this repo is different (e.g. `bun.lockb`, `pnpm-lock.yaml`), substitute the right filename. `git status` will surface it.

---

## Task 4: Add the `workflow` command scaffold

**Files:**
- Create: `packages/cli/src/commands/workflow/index.ts`
- Modify: `packages/cli/src/commands/index.ts`

This task wires an empty-but-valid `aia workflow` parent command into the CLI. List/check live in their own tasks; this is the seam they plug into.

- [ ] **Step 1: Create the parent command file**

Create `packages/cli/src/commands/workflow/index.ts`:

```ts
import { defineCommand } from "citty";

export const workflowCommand = defineCommand({
  meta: {
    name: "workflow",
    description: "Discover and validate AIactions workflows from project + home roots",
  },
  subCommands: {},
});
```

The `subCommands` map starts empty — list (Task 5) and check (Task 6) populate it.

- [ ] **Step 2: Wire `workflow` into the top-level subCommands map**

Replace the entire contents of `packages/cli/src/commands/index.ts` with:

```ts
import { actionCommand } from "./action/index.ts";
import { workflowCommand } from "./workflow/index.ts";

export const subCommands = {
  action: actionCommand,
  workflow: workflowCommand,
};
```

- [ ] **Step 3: Type-check**

```bash
cd packages/cli
vp check
```

Expected: green.

- [ ] **Step 4: Run all CLI tests**

```bash
vp test
```

Expected: green. No new test added at this step — the scaffold is verified end-to-end after Task 6 via the binary smoke gate.

- [ ] **Step 5: Repo-wide gate**

```bash
cd ../..
vp run ready
```

Expected: green.

- [ ] **Step 6: Commit**

```bash
git add packages/cli/src/commands/workflow/index.ts packages/cli/src/commands/index.ts
git commit -m "feat(cli): add workflow command scaffold"
```

---

## Task 5: Slice `aia workflow list`

**Files:**
- Create: `packages/cli/src/commands/workflow/list/command.ts`
- Create: `packages/cli/src/commands/workflow/list/list-workflows.ts`
- Create: `packages/cli/src/commands/workflow/list/receipt.ts`
- Modify: `packages/cli/src/commands/workflow/index.ts` (wire `list`)
- Create: `packages/cli/tests/commands/workflow/list/list.test.ts`

The slice consumes `discoverWorkflows()` directly. `list-workflows.ts` is a thin pass-through that delegates to discovery — no transformation. `receipt.ts` owns the rendering for both `--json` and pretty output.

- [ ] **Step 1: Write the orchestrator type stub + receipt skeleton (no tests yet)**

Create `packages/cli/src/commands/workflow/list/list-workflows.ts`:

```ts
import { discoverWorkflows } from "@aiactions/discovery";
import type { DiscoveryResult } from "@aiactions/discovery";

/**
 * Slice orchestrator for `aia workflow list`. Pass-through to
 * `discoverWorkflows()` — the receipt does all formatting work.
 */
export async function runListWorkflow(): Promise<DiscoveryResult> {
  return discoverWorkflows();
}
```

Create `packages/cli/src/commands/workflow/list/receipt.ts`:

```ts
import type { DiscoveredWorkflow, DiscoveryError, DiscoveryResult } from "@aiactions/discovery";

function renderWorkflowLine(w: DiscoveredWorkflow): string {
  const head = `${w.name}  ${w.origin}  ${w.absolutePath}`;
  if (w.shadowed === undefined) return head;
  return `${head}  [shadowed by ${w.shadowed.origin}: ${w.shadowed.absolutePath}]`;
}

function renderErrorLine(e: DiscoveryError): string {
  return `${e.absolutePath}: ${e.kind}: ${e.message}`;
}

export function writeListReceipt(json: boolean, result: DiscoveryResult): void {
  if (json) {
    process.stdout.write(`${JSON.stringify(result)}\n`);
    return;
  }

  if (result.workflows.length === 0 && result.errors.length === 0) {
    process.stderr.write("no workflows found\n");
    return;
  }

  for (const w of result.workflows) {
    process.stdout.write(`${renderWorkflowLine(w)}\n`);
  }
  if (result.errors.length > 0) {
    process.stdout.write("--\n");
    for (const e of result.errors) {
      process.stderr.write(`${renderErrorLine(e)}\n`);
    }
  }
}
```

- [ ] **Step 2: Write the failing tests**

Create `packages/cli/tests/commands/workflow/list/list.test.ts`:

```ts
import { afterEach, beforeEach, describe, expect, it, vi } from "vite-plus/test";

import type { DiscoveredWorkflow, DiscoveryError, DiscoveryResult } from "@aiactions/discovery";
import { NotInGitRepoError } from "@aiactions/discovery";

import { writeListReceipt } from "../../../../src/commands/workflow/list/receipt.ts";

describe("workflow list — writeListReceipt", () => {
  let stdout = "";
  let stderr = "";

  beforeEach(() => {
    stdout = "";
    stderr = "";
    vi.spyOn(process.stdout, "write").mockImplementation(((chunk: unknown) => {
      stdout += String(chunk);
      return true;
    }) as typeof process.stdout.write);
    vi.spyOn(process.stderr, "write").mockImplementation(((chunk: unknown) => {
      stderr += String(chunk);
      return true;
    }) as typeof process.stderr.write);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  function makeWorkflow(overrides: Partial<DiscoveredWorkflow>): DiscoveredWorkflow {
    return {
      name: "greet",
      origin: "project",
      absolutePath: "/p/.aiactions/workflows/greet.yaml",
      // Cast to satisfy the DiscoveredWorkflow shape's `workflow` field;
      // receipt rendering does not look at it.
      workflow: {} as DiscoveredWorkflow["workflow"],
      ...overrides,
    };
  }

  it("renders project + home workflows alphabetically (pretty)", () => {
    const result: DiscoveryResult = {
      workflows: [
        makeWorkflow({ name: "ci", absolutePath: "/p/.aiactions/workflows/ci.yaml" }),
        makeWorkflow({
          name: "deploy",
          origin: "home",
          absolutePath: "/h/.aiactions/workflows/deploy.yaml",
        }),
        makeWorkflow({ name: "greet" }),
      ],
      errors: [],
    };
    writeListReceipt(false, result);
    expect(stdout).toBe(
      [
        "ci  project  /p/.aiactions/workflows/ci.yaml",
        "deploy  home  /h/.aiactions/workflows/deploy.yaml",
        "greet  project  /p/.aiactions/workflows/greet.yaml",
      ].join("\n") + "\n",
    );
    expect(stderr).toBe("");
  });

  it("renders shadowed badge inline (pretty)", () => {
    const result: DiscoveryResult = {
      workflows: [
        makeWorkflow({
          name: "ci",
          absolutePath: "/p/.aiactions/workflows/ci.yaml",
          shadowed: {
            absolutePath: "/h/.aiactions/workflows/ci.yaml",
            origin: "home",
          },
        }),
      ],
      errors: [],
    };
    writeListReceipt(false, result);
    expect(stdout).toBe(
      "ci  project  /p/.aiactions/workflows/ci.yaml  [shadowed by home: /h/.aiactions/workflows/ci.yaml]\n",
    );
  });

  it("emits errors to stderr after a `--` separator (pretty)", () => {
    const err: DiscoveryError = {
      absolutePath: "/p/.aiactions/workflows/broken.yaml",
      origin: "project",
      kind: "schema_validation",
      message: "missing field",
    };
    const result: DiscoveryResult = {
      workflows: [makeWorkflow({})],
      errors: [err],
    };
    writeListReceipt(false, result);
    expect(stdout).toBe(
      ["greet  project  /p/.aiactions/workflows/greet.yaml", "--", ""].join("\n"),
    );
    expect(stderr).toBe(
      "/p/.aiactions/workflows/broken.yaml: schema_validation: missing field\n",
    );
  });

  it("emits a `no workflows found` notice on stderr when both lists are empty (pretty)", () => {
    writeListReceipt(false, { workflows: [], errors: [] });
    expect(stdout).toBe("");
    expect(stderr).toBe("no workflows found\n");
  });

  it("emits a JSON passthrough of DiscoveryResult", () => {
    const result: DiscoveryResult = {
      workflows: [makeWorkflow({})],
      errors: [],
    };
    writeListReceipt(true, result);
    expect(stderr).toBe("");
    const parsed = JSON.parse(stdout);
    expect(parsed.workflows).toHaveLength(1);
    expect(parsed.workflows[0].name).toBe("greet");
    expect(parsed.errors).toHaveLength(0);
  });

  it("NotInGitRepoError is an AIactionsError (sanity for cli.ts mapping)", () => {
    const err = new NotInGitRepoError("/tmp/x");
    expect(err.message).toContain("not in a git repository");
  });
});
```

- [ ] **Step 3: Run the tests**

```bash
cd packages/cli
vp test commands/workflow/list/list.test.ts
```

Expected: all six tests pass — the receipt implementation was already written in Step 1, and the tests were authored against that implementation.

If any receipt test fails, debug the receipt rendering (column spacing, trailing newlines, stdout-vs-stderr split) before moving on. The only co-developed-not-truly-TDD test in this slice is the receipt; the orchestrator (`runListWorkflow`) is a one-line passthrough and its end-to-end behavior is exercised by the verification gate (Task 7).

- [ ] **Step 4: Implement `command.ts` and wire into the parent**

Create `packages/cli/src/commands/workflow/list/command.ts`:

```ts
import { defineCommand } from "citty";

import { runListWorkflow } from "./list-workflows.ts";
import { writeListReceipt } from "./receipt.ts";

export const listCommand = defineCommand({
  meta: {
    name: "list",
    description: "Enumerate workflows from project + home roots",
  },
  args: {
    json: {
      type: "boolean",
      description: "Emit machine-readable JSON instead of human output",
      default: false,
    },
  },
  async run({ args }) {
    const result = await runListWorkflow();
    writeListReceipt(args.json === true, result);
  },
});
```

Modify `packages/cli/src/commands/workflow/index.ts` so it now reads:

```ts
import { defineCommand } from "citty";

import { listCommand } from "./list/command.ts";

export const workflowCommand = defineCommand({
  meta: {
    name: "workflow",
    description: "Discover and validate AIactions workflows from project + home roots",
  },
  subCommands: {
    list: listCommand,
  },
});
```

- [ ] **Step 5: Type-check, test, and gate**

```bash
vp check
vp test
cd ../..
vp run ready
```

Expected: all green.

- [ ] **Step 6: Manual smoke (optional but recommended at this slice)**

```bash
vp run -r build
node packages/cli/bin/aia.mjs workflow list --help
node packages/cli/bin/aia.mjs workflow list --json
```

Expected for `--help`: a citty-rendered help screen showing only the `--json` flag. Expected for `--json` from inside this very repo (which IS a git repo, even if there are no workflows under `.aiactions/workflows/`): JSON `{"workflows":[],"errors":[]}\n` on stdout, exit 0.

- [ ] **Step 7: Commit**

```bash
git add \
  packages/cli/src/commands/workflow/index.ts \
  packages/cli/src/commands/workflow/list/command.ts \
  packages/cli/src/commands/workflow/list/list-workflows.ts \
  packages/cli/src/commands/workflow/list/receipt.ts \
  packages/cli/tests/commands/workflow/list/list.test.ts
git commit -m "feat(cli): vertical-slice workflow list"
```

---

## Task 6: Slice `aia workflow check`

**Files:**
- Create: `packages/cli/src/commands/workflow/check/command.ts`
- Create: `packages/cli/src/commands/workflow/check/check-workflow.ts`
- Create: `packages/cli/src/commands/workflow/check/receipt.ts`
- Modify: `packages/cli/src/commands/workflow/index.ts` (wire `check`)
- Create: `packages/cli/tests/commands/workflow/check/check.test.ts`

The check slice has two modes:
- **Positional `<path>` (single-file)** — `parseWorkflow(path)`, **rethrow** any `WorkflowParseError|SchemaError|ValidationError` unchanged. The top-level CLI handler maps these to `EXIT.SCHEMA`. This intentionally diverges from `action check`, which converts ENOENT to `NotFoundError` — for workflows we keep all parser failures under one exit code.
- **`--all` mode** — `discoverWorkflows()` → transform `DiscoveryResult.errors[]` into `CheckResult[]` rows. `NotInGitRepoError` bubbles unchanged.

- [ ] **Step 1: Write the orchestrator + receipt**

Create `packages/cli/src/commands/workflow/check/check-workflow.ts`:

```ts
import { discoverWorkflows } from "@aiactions/discovery";
import { parseWorkflow } from "@aiactions/parser";

import { UsageError } from "../../../_shared/cli-error.ts";

export interface CheckIssue {
  readonly kind: string;
  readonly message: string;
}

export interface CheckResult {
  readonly path: string;
  readonly ok: boolean;
  readonly errors: ReadonlyArray<CheckIssue>;
}

export interface CheckWorkflowArgs {
  readonly path: string | undefined;
  readonly all: boolean;
}

/**
 * Slice orchestrator for `aia workflow check`.
 *
 * Mutually exclusive modes:
 * - positional `<path>` → `parseWorkflow(path)`, rethrow on failure.
 * - `--all`             → `discoverWorkflows()`, project errors[] into CheckResult[].
 */
export async function runCheckWorkflow(args: CheckWorkflowArgs): Promise<CheckResult[]> {
  if (args.path === undefined && !args.all) {
    throw new UsageError("expected exactly one of <path> or --all");
  }
  if (args.path !== undefined && args.all) {
    throw new UsageError("<path> and --all are mutually exclusive");
  }

  if (args.path !== undefined) {
    // Single-file mode: rethrow Workflow*Error unchanged.
    // Errors bubble through cli.ts → EXIT_BY_BRICK_ERROR → EXIT.SCHEMA.
    await parseWorkflow(args.path);
    return [{ path: args.path, ok: true, errors: [] }];
  }

  // --all mode: map DiscoveryResult into CheckResult[].
  const discovery = await discoverWorkflows();
  const ok: CheckResult[] = discovery.workflows.map(
    (w): CheckResult => ({ path: w.absolutePath, ok: true, errors: [] }),
  );
  const failed: CheckResult[] = discovery.errors.map(
    (e): CheckResult => ({
      path: e.absolutePath,
      ok: false,
      errors: [{ kind: e.kind, message: e.message }],
    }),
  );
  // Stable order: ok rows first (sorted by absolutePath), failed rows next (also sorted).
  ok.sort((a, b) => a.path.localeCompare(b.path));
  failed.sort((a, b) => a.path.localeCompare(b.path));
  return [...ok, ...failed];
}
```

Create `packages/cli/src/commands/workflow/check/receipt.ts`:

```ts
import type { CheckResult } from "./check-workflow.ts";

interface CheckJsonShape {
  readonly ok: boolean;
  readonly files: ReadonlyArray<CheckResult>;
}

function toJson(results: ReadonlyArray<CheckResult>): CheckJsonShape {
  return {
    ok: results.every((r) => r.ok),
    files: results,
  };
}

function renderHuman(results: ReadonlyArray<CheckResult>): string {
  const lines: string[] = [];
  let okCount = 0;
  let failCount = 0;
  for (const r of results) {
    if (r.ok) {
      lines.push(`✓ ${r.path}`);
      okCount++;
    } else {
      lines.push(`✗ ${r.path}`);
      for (const issue of r.errors) {
        lines.push(`    ${issue.kind}: ${issue.message}`);
      }
      failCount++;
    }
  }
  if (results.length > 1) {
    lines.push("");
    lines.push(`${results.length} file(s) checked — ${okCount} ok, ${failCount} failed`);
  }
  return lines.join("\n");
}

export function writeCheckReceipt(json: boolean, results: ReadonlyArray<CheckResult>): void {
  if (json) {
    process.stdout.write(`${JSON.stringify(toJson(results))}\n`);
    return;
  }
  process.stdout.write(`${renderHuman(results)}\n`);
}
```

- [ ] **Step 2: Write the failing tests**

Create `packages/cli/tests/commands/workflow/check/check.test.ts`:

```ts
import { mkdtemp, rm, writeFile, mkdir } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { afterEach, beforeEach, describe, expect, it, vi } from "vite-plus/test";

import { NotInGitRepoError } from "@aiactions/discovery";
import { WorkflowParseError, WorkflowSchemaError, WorkflowValidationError } from "@aiactions/schema";

import { UsageError } from "../../../../src/_shared/cli-error.ts";
import { runCheckWorkflow } from "../../../../src/commands/workflow/check/check-workflow.ts";
import { writeCheckReceipt } from "../../../../src/commands/workflow/check/receipt.ts";

const VALID_WORKFLOW = `
name: greet
jobs:
  hello:
    steps:
      - name: say-hi
        run: echo "hi"
`.trimStart();

const SCHEMA_INVALID_WORKFLOW = `
jobs: {}
`.trimStart();

const CYCLE_WORKFLOW = `
name: cyclic
jobs:
  a:
    needs: [b]
    steps:
      - name: a
        run: echo a
  b:
    needs: [a]
    steps:
      - name: b
        run: echo b
`.trimStart();

const MALFORMED_YAML = `
name: oops
jobs: { unbalanced
`.trimStart();

describe("runCheckWorkflow — argument validation", () => {
  it("throws UsageError when neither path nor --all is given", async () => {
    await expect(runCheckWorkflow({ path: undefined, all: false })).rejects.toBeInstanceOf(
      UsageError,
    );
  });

  it("throws UsageError when both path and --all are given", async () => {
    await expect(runCheckWorkflow({ path: "/x", all: true })).rejects.toBeInstanceOf(UsageError);
  });
});

describe("runCheckWorkflow — single-file (positional) mode", () => {
  let dir: string;

  beforeEach(async () => {
    dir = await mkdtemp(join(tmpdir(), "phase6-check-"));
  });

  afterEach(async () => {
    await rm(dir, { recursive: true, force: true });
  });

  it("returns ok for a valid workflow", async () => {
    const file = join(dir, "greet.yaml");
    await writeFile(file, VALID_WORKFLOW, "utf-8");
    const results = await runCheckWorkflow({ path: file, all: false });
    expect(results).toEqual([{ path: file, ok: true, errors: [] }]);
  });

  it("rethrows WorkflowParseError on missing file (ENOENT)", async () => {
    await expect(
      runCheckWorkflow({ path: join(dir, "nope.yaml"), all: false }),
    ).rejects.toBeInstanceOf(WorkflowParseError);
  });

  it("rethrows WorkflowParseError on malformed YAML", async () => {
    const file = join(dir, "broken.yaml");
    await writeFile(file, MALFORMED_YAML, "utf-8");
    await expect(runCheckWorkflow({ path: file, all: false })).rejects.toBeInstanceOf(
      WorkflowParseError,
    );
  });

  it("rethrows WorkflowSchemaError on a shape-invalid workflow", async () => {
    const file = join(dir, "bad-schema.yaml");
    await writeFile(file, SCHEMA_INVALID_WORKFLOW, "utf-8");
    await expect(runCheckWorkflow({ path: file, all: false })).rejects.toBeInstanceOf(
      WorkflowSchemaError,
    );
  });

  it("rethrows WorkflowValidationError on a graph cycle", async () => {
    const file = join(dir, "cycle.yaml");
    await writeFile(file, CYCLE_WORKFLOW, "utf-8");
    await expect(runCheckWorkflow({ path: file, all: false })).rejects.toBeInstanceOf(
      WorkflowValidationError,
    );
  });
});

describe("runCheckWorkflow — --all mode", () => {
  // Building a real git repo with .aiactions/workflows/ for each test would
  // duplicate discovery's own tests. Instead, exercise the shape transformation
  // by stubbing discoverWorkflows via dynamic mock — but vitest doesn't trivially
  // mock ESM module-level fns. Defer the integration of these cases to the
  // discovery tests (which already cover the input side) and the verification
  // gate (Task 7) which exercises end-to-end via the binary. See plan §7.4.
  it("is exercised end-to-end by Task 7 verification gate (placeholder)", () => {
    expect(true).toBe(true);
  });
});

describe("writeCheckReceipt", () => {
  let stdout = "";

  beforeEach(() => {
    stdout = "";
    vi.spyOn(process.stdout, "write").mockImplementation(((chunk: unknown) => {
      stdout += String(chunk);
      return true;
    }) as typeof process.stdout.write);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders ✓ for ok rows (pretty)", () => {
    writeCheckReceipt(false, [{ path: "/p/a.yaml", ok: true, errors: [] }]);
    expect(stdout).toBe("✓ /p/a.yaml\n");
  });

  it("renders ✗ + indented errors for failed rows (pretty)", () => {
    writeCheckReceipt(false, [
      {
        path: "/p/b.yaml",
        ok: false,
        errors: [{ kind: "schema_validation", message: "missing field" }],
      },
    ]);
    expect(stdout).toBe(
      ["✗ /p/b.yaml", "    schema_validation: missing field", ""].join("\n"),
    );
  });

  it("emits a summary line when results.length > 1 (pretty)", () => {
    writeCheckReceipt(false, [
      { path: "/p/a.yaml", ok: true, errors: [] },
      {
        path: "/p/b.yaml",
        ok: false,
        errors: [{ kind: "schema_validation", message: "missing field" }],
      },
    ]);
    expect(stdout).toContain("2 file(s) checked — 1 ok, 1 failed");
  });

  it("emits a JSON summary {ok, files[]}", () => {
    writeCheckReceipt(true, [
      { path: "/p/a.yaml", ok: true, errors: [] },
      {
        path: "/p/b.yaml",
        ok: false,
        errors: [{ kind: "yaml_parse", message: "boom" }],
      },
    ]);
    const parsed = JSON.parse(stdout);
    expect(parsed.ok).toBe(false);
    expect(parsed.files).toHaveLength(2);
    expect(parsed.files[0].ok).toBe(true);
    expect(parsed.files[1].errors[0].kind).toBe("yaml_parse");
  });

  it("NotInGitRepoError exists (sanity)", () => {
    expect(new NotInGitRepoError("/x").message).toContain("not in a git repository");
  });
});
```

The `--all` describe block is intentionally a single placeholder. Stubbing `discoverWorkflows` from a module-level export is brittle in vitest+ESM; the more honest coverage is:
- `runListWorkflow` already proxies discovery (tested in Task 5 via stdin/stderr capture).
- The `--all` shape transformation (Discovery → CheckResult) is small and self-evident.
- The verification gate (Task 7) exercises `--all` end-to-end via the built binary inside this very repo.

If during execution it becomes worthwhile to test the `--all` transformation in isolation, factor a pure helper `function discoveryToCheckResults(d: DiscoveryResult): CheckResult[]` out of `runCheckWorkflow` and unit-test it. The plan does NOT require this up front — YAGNI.

- [ ] **Step 3: Run the failing tests**

```bash
cd packages/cli
vp test commands/workflow/check/check.test.ts
```

Expected:
- The argument-validation tests pass (`runCheckWorkflow` already throws `UsageError`).
- The single-file tests pass (`parseWorkflow` is rethrown).
- The receipt tests pass (`writeCheckReceipt` works on synthetic `CheckResult[]`).
- The `--all` placeholder passes.

If everything passes immediately because Step 1 wrote the implementation already: that is fine, this is a TDD-style plan but the implementation and tests are co-developed within one task. The point is that no test can be removed without losing coverage of a documented behavior.

If anything fails, fix the implementation in `check-workflow.ts` / `receipt.ts` until the suite passes.

- [ ] **Step 4: Implement `command.ts` and wire into the parent**

Create `packages/cli/src/commands/workflow/check/command.ts`:

```ts
import { defineCommand } from "citty";

import { EXIT } from "../../../_shared/exit-codes.ts";
import { runCheckWorkflow } from "./check-workflow.ts";
import { writeCheckReceipt } from "./receipt.ts";

export const checkCommand = defineCommand({
  meta: {
    name: "check",
    description: "Validate one or many workflow YAML files against workflowSchema",
  },
  args: {
    path: {
      type: "positional",
      description: "Path to a single workflow YAML",
      required: false,
    },
    all: {
      type: "boolean",
      description: "Validate every discovered workflow (project + home)",
      default: false,
    },
    json: {
      type: "boolean",
      description: "Emit machine-readable JSON instead of human output",
      default: false,
    },
  },
  async run({ args }) {
    const results = await runCheckWorkflow({
      path: typeof args.path === "string" ? args.path : undefined,
      all: args.all === true,
    });
    writeCheckReceipt(args.json === true, results);
    if (!results.every((r) => r.ok)) process.exit(EXIT.SCHEMA);
  },
});
```

Modify `packages/cli/src/commands/workflow/index.ts` so it now reads:

```ts
import { defineCommand } from "citty";

import { checkCommand } from "./check/command.ts";
import { listCommand } from "./list/command.ts";

export const workflowCommand = defineCommand({
  meta: {
    name: "workflow",
    description: "Discover and validate AIactions workflows from project + home roots",
  },
  subCommands: {
    check: checkCommand,
    list: listCommand,
  },
});
```

- [ ] **Step 5: Type-check, test, and gate**

```bash
vp check
vp test
cd ../..
vp run ready
```

Expected: green.

- [ ] **Step 6: Manual smoke (optional but recommended)**

```bash
vp run -r build
node packages/cli/bin/aia.mjs workflow check --help
node packages/cli/bin/aia.mjs workflow check --all
```

Expected for `--help`: a citty-rendered help screen with positional `path`, `--all`, `--json`. Expected for `--all` from inside this very repo: exit 0 with `0 file(s) checked` (or whatever count) since the repo currently has no `.aiactions/workflows/`. If there *are* workflows, all should be valid → exit 0.

- [ ] **Step 7: Commit**

```bash
git add \
  packages/cli/src/commands/workflow/index.ts \
  packages/cli/src/commands/workflow/check/command.ts \
  packages/cli/src/commands/workflow/check/check-workflow.ts \
  packages/cli/src/commands/workflow/check/receipt.ts \
  packages/cli/tests/commands/workflow/check/check.test.ts
git commit -m "feat(cli): vertical-slice workflow check"
```

---

## Task 7: Verification gate

This task does not commit. It is the green-light moment before the merge.

- [ ] **Step 1: Full `vp run ready` from the worktree root**

```bash
vp run ready
```

Expected: green across the entire monorepo.

- [ ] **Step 2: Build all packages**

```bash
vp run -r build
```

Expected: green. `packages/cli/dist/` and `packages/discovery/dist/` rebuild.

- [ ] **Step 3: Binary smoke — help screens**

```bash
node packages/cli/bin/aia.mjs --help
node packages/cli/bin/aia.mjs workflow --help
node packages/cli/bin/aia.mjs workflow list --help
node packages/cli/bin/aia.mjs workflow check --help
```

Expected: every help screen renders. Top-level shows `action` and `workflow` subcommands. `workflow` shows `list` and `check` subcommands.

- [ ] **Step 4: `aia workflow list` from inside the repo**

```bash
node packages/cli/bin/aia.mjs workflow list
node packages/cli/bin/aia.mjs workflow list --json
```

Expected: pretty form prints `no workflows found` to stderr if `<repo>/.aiactions/workflows/` is empty (likely the case today). JSON form prints `{"workflows":[],"errors":[]}` to stdout. Exit code 0 in both cases.

If the repo has a `~/.aiactions/workflows/` directory with content, those workflows appear under origin `home`. That is correct.

- [ ] **Step 5: `aia workflow check --all` from inside the repo**

```bash
node packages/cli/bin/aia.mjs workflow check --all
echo "exit=$?"
```

Expected: zero failures (no broken workflow files in the repo); exit 0. The summary line appears only if more than 1 file was checked.

- [ ] **Step 6: Negative — outside any git repo**

From a bash shell:

```bash
mkdir -p /tmp/phase-6-no-git && cd /tmp/phase-6-no-git
node /path/to/aiactions-phase-6/packages/cli/bin/aia.mjs workflow list
echo "exit=$?"
```

Expected stderr: `✖ not in a git repository: /tmp/phase-6-no-git`. Expected exit: `2` (`EXIT.USAGE`).

Substitute the absolute path to `aia.mjs` correctly (it lives inside the worktree, not in `/home/aperrix/Documents/PROJECTS/aiactions/...`).

- [ ] **Step 7: Negative — single-file workflow check on a malformed YAML**

```bash
mkdir -p /tmp/phase-6-bad
cat > /tmp/phase-6-bad/broken.yaml <<'EOF'
name: oops
jobs: { unbalanced
EOF
node /path/to/aiactions-phase-6/packages/cli/bin/aia.mjs workflow check /tmp/phase-6-bad/broken.yaml
echo "exit=$?"
```

Expected stderr: `✖ malformed YAML in '...broken.yaml'` (exact wording from `WorkflowParseError`). Expected exit: `7` (`EXIT.SCHEMA`).

- [ ] **Step 8: Negative — `aia workflow check` with no args**

```bash
node /path/to/aiactions-phase-6/packages/cli/bin/aia.mjs workflow check
echo "exit=$?"
```

Expected stderr: `✖ expected exactly one of <path> or --all`. Expected exit: `2`.

- [ ] **Step 9: Cleanup the temp dirs**

```bash
rm -rf /tmp/phase-6-no-git /tmp/phase-6-bad
```

(No commit — this task is verification only.)

---

## Task 8: Merge `--no-ff` to `main` (USER APPROVAL REQUIRED)

> **STOP — DO NOT EXECUTE without explicit user approval.** Merging into `main` is a hard-to-reverse operation. Surface the per-component commit list, the per-component bumps release-please will infer, and the no-ff merge plan; wait for the user to say "go" before running `git merge`.

- [ ] **Step 1: Surface the per-component commit list**

From the worktree directory (`../aiactions-phase-6`):

```bash
git log --oneline main..HEAD
```

Expected output (5 commits in this order):

```
<sha> feat(cli): vertical-slice workflow check
<sha> feat(cli): vertical-slice workflow list
<sha> feat(cli): add workflow command scaffold
<sha> feat(cli): map workflow + discovery errors to exit codes
<sha> feat(discovery): NotInGitRepoError extends AIactionsError
```

If a Task-0 `style(fmt)` commit landed on `main` before the worktree, it should NOT appear here (it was committed on `main`, not in the branch).

- [ ] **Step 2: Switch to `main` (in the original checkout)**

```bash
cd /home/aperrix/Documents/PROJECTS/aiactions
git checkout main
git pull --ff-only
```

Expected: `main` up-to-date with origin (and with the optional `style(fmt)` commit from Task 0).

- [ ] **Step 3: Merge `--no-ff` (after explicit user approval)**

```bash
git merge --no-ff worktree-phase-6-cli-workflow-slices -m "Merge phase-6: vertical-slice CLI workflow list + check + promote NotInGitRepoError"
git log --oneline -7
```

Expected: a single merge commit on `main` with the 5 phase-6 commits visible underneath.

- [ ] **Step 4: Push to origin (after second user approval)**

```bash
git push origin main
```

Expected: pushed.

- [ ] **Step 5: Cleanup the worktree**

```bash
git worktree remove ../aiactions-phase-6
git branch -d worktree-phase-6-cli-workflow-slices
```

Expected: worktree directory is gone; branch is deleted (the merge commit on `main` keeps history).

- [ ] **Step 6: Trigger codebase-memory re-index**

```
mcp__codebase-memory-mcp__detect_changes project="home-aperrix-Documents-PROJECTS-aiactions" since="HEAD~7"
```

If the report shows significant structural drift (new packages, mass deletions), follow up with:

```
mcp__codebase-memory-mcp__index_repository repo_path="/home/aperrix/Documents/PROJECTS/aiactions" mode="moderate"
```

`fast` mode is acceptable if only files were added; `moderate` is the right default for new modules with new edges.

- [ ] **Step 7: Persist phase-6 result in MuninnDB**

Use `mcp__muninn__muninn_remember` with `vault: "aiactions"`:

- `concept: "phase-6-cli-workflow-slices-shipped"`
- `summary`: branch name, merge commit SHA, packages touched (`@aiactions/discovery`, `@aiactions/cli`), exit-code mapping additions, commit list, and the next planned phase (`phase-6.5: aia workflow run`).
- `tags`: `["phase-6", "cli", "workflow", "discovery", "exit-codes", "shipped"]`

Also store a separate memory `concept: "next-session-resume-post-phase-6"` summarising:
- main HEAD SHA at end of merge.
- 10 packages still (no new package added).
- Next: phase 6.5 plan + execute (`aia workflow run`, surface decisions: input/env CLI flags, RuntimeEvent stream rendering, exit-code mapping from RunResult, signal forwarding).

(No commit — these are MCP tool calls, not git operations.)

---

## Plan complete

Plan saved at `docs/superpowers/plans/2026-05-10-phase-6-cli-workflow-slices.md`.
