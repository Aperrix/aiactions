# Phase 6 — CLI workflow slices (`aia workflow list` + `aia workflow check`)

**Status**: Design (locked through brainstorm 2026-05-10)
**Predecessor**: Phase 5 (`docs/superpowers/specs/2026-05-10-phase-5-cli-vertical-slices-design.md`)
**Successor**: Phase 6.5 — `aia workflow run` (out-of-scope here)

## 1. Goal

Add the first two of the three planned `workflow` slices to `@aiactions/cli`, completing the read-only / validation half of the workflow CLI surface:

- `aia workflow list` — enumerate workflows discovered through `@aiactions/discovery` (project + home layers).
- `aia workflow check` — validate one or many workflow YAML files against `workflowSchema` (shape + graph invariants).

The third slice — `aia workflow run` — is deferred to a separate phase (6.5) because its design surface is materially larger (CLI args for inputs/env/cwd, `RuntimeEvent` stream rendering, `RunResult` → exit-code mapping, abort/signal handling) and warrants its own brainstorm.

## 2. Non-goals

- No `aia workflow run` support (phase 6.5).
- No new `_shared/` extractions in the CLI package — rule-of-three not met for any of the helpers introduced here.
- No `--strict` / warning treatment for `workflow check` — `validateWorkflow` does not produce warnings today (YAGNI).
- No origin-filter flags (`--project-only` / `--home-only`) for `workflow list` — YAGNI.

## 3. Constraints

- ESM-only, Bun workspace, strict TypeScript, no `any`.
- Must compose with existing brick packages — no inlining of discovery / parser logic.
- All AIactions errors must surface through the existing `CliError` / `AIactionsError` / `EXIT_BY_BRICK_ERROR` plumbing in `cli/_shared/`.
- Multi-component PR (touches `@aiactions/discovery` + `@aiactions/cli`) → merged with `git merge --no-ff` per `collaboration.md`.

## 4. Architecture

### 4.1 File layout

```
packages/cli/src/commands/workflow/
  index.ts                       # exports workflowCommand (citty)
  list/
    command.ts                   # citty defineCommand
    list-workflows.ts            # slice orchestration → DiscoveryResult passthrough
    receipt.ts                   # JSON / pretty writer
  check/
    command.ts                   # citty defineCommand
    check-workflow.ts            # slice orchestration (positional vs --all)
    receipt.ts                   # JSON / pretty writer
```

`commands/workflow/` is parallel to `commands/action/`; no shared parent module.

### 4.2 Top-level wiring

`packages/cli/src/commands/index.ts`:

```ts
import { actionCommand } from "./action/index.ts";
import { workflowCommand } from "./workflow/index.ts";

export const subCommands = {
  action: actionCommand,
  workflow: workflowCommand,
};
```

### 4.3 Internal package dependencies

`@aiactions/cli` gains workspace deps on:

- `@aiactions/discovery` (already present? verify in Plan; it was not consumed by phase 5)
- `@aiactions/parser` (already present)
- `@aiactions/schema` (already present)

No dep on `@aiactions/core` in this phase.

`@aiactions/discovery` gains a workspace dep on `@aiactions/schema` (likely already present for the `Workflow` type re-exports — verify in Plan).

### 4.4 Sharing rule

No new `_shared/` extraction. Each slice owns its `CheckResult`-style local types. The existing `_shared/`:
- `cli-error.ts` — reused for `UsageError`.
- `exit-codes.ts` — extended (see §6).
- `output.ts` (table renderer) — not reused; pretty output is per-slice line-rendering.

If a third slice (`run` in phase 6.5) needs the same render helpers, extraction will trigger then.

## 5. Slices

### 5.1 `aia workflow list`

#### 5.1.1 citty args

```ts
{
  json: { type: "boolean", default: false, description: "Emit JSON instead of pretty output" }
}
```

No positional, no other flag. `cwd` and `homeDir` are sourced from `process.cwd()` / `os.homedir()` via `discoverWorkflows()` defaults — not exposed on the CLI surface.

#### 5.1.2 Data flow

```
aia workflow list [--json]
        │
        ▼
list/command.ts (citty entry)
        │ args → opts
        ▼
list/list-workflows.ts
        │
        └── discoverWorkflows()  → DiscoveryResult { workflows[], errors[] }
        │
        ▼
list/receipt.ts (writeListReceipt)
        ├── --json → stdout: JSON.stringify(DiscoveryResult)
        └── pretty → renderHuman(workflows, errors) → stdout / stderr
```

#### 5.1.3 Pretty output

Rules:
- One workflow per line, alphabetical by `name` (already sorted by `discoverWorkflows`).
- Format: `<name>  <origin>  <absolutePath>[  [shadowed by <origin>: <absolutePath>]]`
- After workflows, if `errors.length > 0`: a `--` separator line, then one line per error to **stderr**: `<absolutePath>: <kind>: <message>`.
- Empty case (`workflows.length === 0 && errors.length === 0`): write `no workflows found\n` to **stderr**, exit 0.

Example:
```
greet            project   /home/u/proj/.aiactions/workflows/greet.yaml
ci               project   /home/u/proj/.aiactions/workflows/ci.yaml  [shadowed by home: /home/u/.aiactions/workflows/ci.yaml]
deploy           home      /home/u/.aiactions/workflows/deploy.yaml
--
/home/u/proj/.aiactions/workflows/broken.yaml: schema_validation: <message>
```

#### 5.1.4 JSON shape

Direct passthrough of `DiscoveryResult`. `shadowed` field is **omitted** when absent (idiomatic JS) — not serialized as `null`.

```json
{
  "workflows": [
    {"name": "greet", "origin": "project", "absolutePath": "/.../greet.yaml"},
    {"name": "ci", "origin": "project", "absolutePath": "/.../ci.yaml",
     "shadowed": {"absolutePath": "/.../ci.yaml", "origin": "home"}}
  ],
  "errors": [
    {"absolutePath": "/.../broken.yaml", "origin": "project",
     "kind": "schema_validation", "message": "..."}
  ]
}
```

#### 5.1.5 Exit codes

- Always **0** when discovery returns. Aggregated `errors[]` are informational; `check` is the verb that fails on validation problems.
- `NotInGitRepoError` from `findGitRoot` (post-§6.1 promotion to `AIactionsError`) bubbles to `cli.ts`, which maps it via `EXIT_BY_BRICK_ERROR` to `EXIT.USAGE` (2). User-facing message: `not in a git repository: <startDir>`.

### 5.2 `aia workflow check`

#### 5.2.1 citty args

Mirror `action check` exactly:

```ts
{
  path: { type: "positional", required: false, description: "Path to a single workflow YAML" },
  all:  { type: "boolean",    default: false,  description: "Validate every discovered workflow" },
  json: { type: "boolean",    default: false,  description: "Emit JSON instead of pretty output" }
}
```

The two modes are mutually exclusive:
- `aia workflow check <path>` → single-file mode, calls `parseWorkflow(path)` directly.
- `aia workflow check --all` → discovery mode, calls `discoverWorkflows()`.
- No args → `UsageError("specify <path> or --all")` → exit `USAGE` (2).
- Both args → `UsageError("--all conflicts with <path>")` → exit `USAGE` (2).

Argument-validation logic lives in the slice orchestrator (`check-workflow.ts`), not in `command.ts` — the orchestrator is the seam tested directly in unit tests.

#### 5.2.2 Single-file mode (`<path>`)

```
aia workflow check <path>
        │
        ▼
parseWorkflow(<path>)
        │
        ├─ ok → CheckResult[] = [{path, ok: true, errors: []}]
        │       writeCheckReceipt(json, results) → exit OK
        │
        └─ throws WorkflowParseError|SchemaError|ValidationError
                ▲ rethrown unchanged → bubble to cli.ts top-level
                  → EXIT_BY_BRICK_ERROR → EXIT.SCHEMA (7)
```

Rationale for **rethrow** rather than capture-then-render: a single file produces a single error. The `AIactionsError` message is already the right user-facing message; wrapping into a `CheckResult` only to render it back adds noise. Diverges from `action check` (which captures), but `action check` deals with multi-file walks where capture is necessary to avoid early termination.

#### 5.2.3 `--all` mode

```
aia workflow check --all
        │
        ▼
discoverWorkflows()  → DiscoveryResult { workflows[], errors[] }
        │
        ▼
results: CheckResult[] = [
  ...workflows.map(w → ({path: w.absolutePath, ok: true,  errors: []})),
  ...errors.map   (e → ({path: e.absolutePath, ok: false, errors: [{kind: e.kind, message: e.message}]})),
]
        │
        ▼
writeCheckReceipt(json, results)
        │
        └── if any !r.ok → process.exit(EXIT.SCHEMA)
```

`NotInGitRepoError` from `discoverWorkflows()` bubbles unchanged → `EXIT.USAGE` (2).

#### 5.2.4 `CheckResult` shape

Slice-local type (in `check-workflow.ts`):

```ts
export interface CheckResult {
  readonly path: string;
  readonly ok: boolean;
  readonly errors: ReadonlyArray<{ kind: string; message: string }>;
}
```

`kind` values:
- `--all` mode: re-uses `DiscoveryErrorKind` literal values: `"yaml_parse" | "schema_validation" | "graph_validation" | "io_error"`.
- Single-file mode never reaches this shape with `ok: false` (rethrown).

No `warnings[]` field. If a future schema introduces warnings, the field is added then.

#### 5.2.5 Pretty output

```
✓ /home/u/proj/.aiactions/workflows/greet.yaml
✗ /home/u/proj/.aiactions/workflows/broken.yaml
    schema_validation: <message>
    schema_validation: <message-2>

2 file(s) checked — 1 ok, 1 failed
```

`✓` / `✗` to **stdout**, error indent lines to **stdout** (one block per file), final summary line to **stdout**.

#### 5.2.6 JSON shape

```json
{
  "ok": false,
  "files": [
    {"path": "/.../greet.yaml", "ok": true,  "errors": []},
    {"path": "/.../broken.yaml", "ok": false,
     "errors": [{"kind": "schema_validation", "message": "..."}]}
  ]
}
```

#### 5.2.7 Exit codes

- All `ok` → `EXIT.OK` (0).
- Any `!ok` → `EXIT.SCHEMA` (7), set explicitly via `process.exit(EXIT.SCHEMA)` in `command.ts` after `writeCheckReceipt` returns. Mirrors `action check`.
- `WorkflowParseError|SchemaError|ValidationError` rethrown from single-file mode → bubble → `EXIT_BY_BRICK_ERROR` → `EXIT.SCHEMA`.
- `NotInGitRepoError` from `--all` → bubble → `EXIT_BY_BRICK_ERROR` → `EXIT.USAGE`.
- `UsageError` from arg validation → bubble → `EXIT.USAGE`.

## 6. Error class extensions

Two preparatory changes upstream of the slices.

### 6.1 Promote `NotInGitRepoError` (E1)

`packages/discovery/src/errors.ts`:

Before:
```ts
export class NotInGitRepoError extends Error {
  readonly code = "ENOTINGITREPO" as const;
  constructor(public readonly startDir: string) {
    super(`not in a git repository: ${startDir}`);
    this.name = "NotInGitRepoError";
  }
}
```

After:
```ts
import { AIactionsError } from "@aiactions/schema";

export class NotInGitRepoError extends AIactionsError {
  readonly code = "ENOTINGITREPO" as const;
  constructor(public readonly startDir: string) {
    super(`not in a git repository: ${startDir}`);
    this.name = "NotInGitRepoError";
  }
}
```

Impact:
- Public surface unchanged (constructor signature, fields, `name`, `code`).
- Existing `instanceof NotInGitRepoError` checks pass.
- Existing `instanceof Error` checks pass (`AIactionsError extends Error`).
- New: `instanceof AIactionsError` returns `true` — required for the CLI top-level handler.

`packages/discovery/package.json` must depend on `@aiactions/schema` (workspace). Verify during Plan; almost certainly already present.

Conv-Commit (first commit of phase 6 worktree): `feat(discovery): NotInGitRepoError extends AIactionsError`.

### 6.2 Extend `EXIT_BY_BRICK_ERROR`

`packages/cli/src/_shared/exit-codes.ts`:

```ts
import {
  RegistryFetchError,
  RegistryResolveError,
  RegistryValidationError,
} from "@aiactions/registry";
import { NotInGitRepoError } from "@aiactions/discovery";
import {
  WorkflowParseError,
  WorkflowSchemaError,
  WorkflowValidationError,
} from "@aiactions/schema";

// `any[]` is the idiomatic constructor-args type in TypeScript; the map is a
// constructor-identity lookup (`err.constructor`), the signature is never invoked.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const EXIT_BY_BRICK_ERROR: ReadonlyMap<
  abstract new (...args: any[]) => AIactionsError,
  ExitCode
> = new Map([
  [RegistryFetchError,        EXIT.REGISTRY],
  [RegistryResolveError,      EXIT.REGISTRY],
  [RegistryValidationError,   EXIT.REGISTRY],

  [WorkflowParseError,        EXIT.SCHEMA],
  [WorkflowSchemaError,       EXIT.SCHEMA],
  [WorkflowValidationError,   EXIT.SCHEMA],

  [NotInGitRepoError,         EXIT.USAGE],
]);
```

Map key type relaxed from `new (message: string, options?: ErrorOptions) => AIactionsError` to `abstract new (...args: any[]) => AIactionsError` (decision F1) — `NotInGitRepoError`'s `(startDir: string)` constructor signature is incompatible with the strict shape, and the table is a constructor-identity lookup, not a factory. The `cli.ts` top-level handler still uses `err.constructor` lookup, which type-checks under the relaxed key.

`packages/cli/package.json` must depend on `@aiactions/discovery` (workspace) — likely **not** present today (phase 5 did not consume it). Adding the dep is part of the same commit.

Conv-Commit: `feat(cli): map workflow + discovery errors to exit codes`.

## 7. Tests

### 7.1 `packages/discovery/tests/errors.test.ts` (new or extended)

- `expect(new NotInGitRepoError("/x")).toBeInstanceOf(AIactionsError)` — locks the §6.1 contract.
- `expect(new NotInGitRepoError("/x")).toBeInstanceOf(Error)` — confirms inheritance chain unbroken.
- `expect(new NotInGitRepoError("/x").code).toBe("ENOTINGITREPO")` — confirms field unchanged.

### 7.2 `packages/cli/tests/_shared/exit-codes.test.ts` (extended)

- `EXIT_BY_BRICK_ERROR.get(WorkflowParseError) === EXIT.SCHEMA`
- `EXIT_BY_BRICK_ERROR.get(WorkflowSchemaError) === EXIT.SCHEMA`
- `EXIT_BY_BRICK_ERROR.get(WorkflowValidationError) === EXIT.SCHEMA`
- `EXIT_BY_BRICK_ERROR.get(NotInGitRepoError) === EXIT.USAGE`

### 7.3 `packages/cli/tests/commands/workflow/list.test.ts` (new)

5 unit tests on `runListWorkflow` (or equivalent slice orchestrator) + receipt:

1. Happy path — project + home layers populated, JSON and pretty output snapshots.
2. Shadowed — project shadows home, badge inline + JSON `shadowed` field.
3. Errors — one yaml malformed in project layer, list still renders, error line on stderr.
4. Empty — no workflows, no errors → stderr `no workflows found`, exit 0.
5. `NotInGitRepoError` — tmp dir outside any git repo, exits `EXIT.USAGE`.

### 7.4 `packages/cli/tests/commands/workflow/check.test.ts` (new)

9 unit tests:

1. Positional happy path — valid yaml → exit OK + receipt vert.
2. Positional yaml malformed — `WorkflowParseError` rethrow → exit `SCHEMA`.
3. Positional file not found — `WorkflowParseError` rethrow → exit `SCHEMA`.
4. Positional schema invalid — `WorkflowSchemaError` rethrow → exit `SCHEMA`.
5. Positional graph cycle — `WorkflowValidationError` rethrow → exit `SCHEMA`.
6. `--all` happy path — 2 valid workflows → exit `OK`.
7. `--all` mixed — 1 valid + 1 broken → exit `SCHEMA`, receipt lists both.
8. `--all` outside git — `NotInGitRepoError` → exit `USAGE`.
9. No args / both args — `UsageError` → exit `USAGE`.

### 7.5 Test style

Unit-style: import the slice orchestrator (`runListWorkflow`, `runCheckWorkflow`) and the receipt writer; capture stdout/stderr via spies. No spawn-the-binary tests in this phase — the verification gate (§9) covers binary smoke.

## 8. Branching + merge strategy

- Worktree: `worktree-phase-6-cli-workflow-slices` at `../aiactions-phase-6`.
- Multi-component (touches `@aiactions/discovery` + `@aiactions/cli`) → **`git merge --no-ff`** on `main`. Squash is forbidden by `collaboration.md` for multi-component PRs (release-please routes per-commit).
- Pre-flush `vp fmt` on `main` first to avoid formatting drift contaminating the no-ff range (lesson MS1.7).

Commits, in order:

1. `feat(discovery): NotInGitRepoError extends AIactionsError`
2. `feat(cli): map workflow + discovery errors to exit codes`
3. `feat(cli): add workflow command scaffold` (citty `workflowCommand`, `commands/workflow/index.ts`, wire into `commands/index.ts`)
4. `feat(cli): vertical-slice workflow list`
5. `feat(cli): vertical-slice workflow check`

Each commit must keep `vp run ready` green.

## 9. Verification gate

After commit 5, before merge:

```
vp run ready
```

then post-build smoke:

```
vp run -r build
node packages/cli/bin/aia.mjs workflow --help
node packages/cli/bin/aia.mjs workflow list --help
node packages/cli/bin/aia.mjs workflow check --help
node packages/cli/bin/aia.mjs workflow list
node packages/cli/bin/aia.mjs workflow list --json
```

In a tmp dir outside any git repo:

```
cd /tmp && node /path/to/aia.mjs workflow list
# expect: stderr "✖ not in a git repository: /tmp", exit code 2
```

## 10. Out-of-scope follow-ups

- **Phase 6.5** — `aia workflow run`. Args: positional `<name>` (resolved via discovery) or `--file <path>`; `--input k=v` (repeatable); `--env k=v` (repeatable); `--cwd`; `--json` for machine-readable lifecycle; signal forwarding for `Ctrl-C`. Exit code derived from `RunResult.status`.
- Promote `RunnerError` / `JobError` / `StepError` / `OrchestrationError` into `EXIT_BY_BRICK_ERROR` — defer to phase 6.5 when `run` actually surfaces them.
- `workflow check --strict` — defer until `validateWorkflow` produces warnings.
- Origin filters on `workflow list` (`--project-only` / `--home-only`) — YAGNI.
- JSON-Schema export inside the CLI — already covered by `vp run gen:schemas`, no need to duplicate.

## 11. References

- Phase 5 spec: `docs/superpowers/specs/2026-05-10-phase-5-cli-vertical-slices-design.md`.
- Phase 5 plan: `docs/superpowers/plans/2026-05-10-phase-5-cli-vertical-slices.md`.
- Architecture restructure: `docs/superpowers/specs/2026-05-09-architecture-restructure-design.md` (§7 file-layout target, §8 slice rule).
- Collaboration protocol: `.claude/rules/collaboration.md`.
- `@aiactions/discovery` public surface: `packages/discovery/src/index.ts`.
- `@aiactions/parser` public surface: `packages/parser/src/index.ts`.
