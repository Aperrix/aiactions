# AIactions — Architecture Restructure (Design)

**Date:** 2026-05-09
**Status:** Approved (brainstorm)
**Supersedes:** package layout established in MS1.4 → MS1.9
**Related decisions:** `aiactions-architecture-10-packages-validated`, `archon-core-fourre-tout-anti-pattern`, `integration-surfaces-narrowed-2026-05-09` (MuninnDB vault `aiactions`)

## 1. Context

The MS1.9 milestone — adding `aia workflow list/run/check` commands — was paused mid-flight because the existing 3-package layout (`@aiactions/workflows`, `@aiactions/runtime`, `@aiactions/cli`) was no longer producing maintainable code. Symptoms surfaced during work:

- **CLI bloat.** `packages/cli` had 44 files, ~1,005 src LOC for 4 commands (`action install/list/check/uninstall`). Each command added new files in `commands/action/<verb>.ts` plus 1-3 helpers in `cli/src/lib/*.ts`. The `lib/` folder had grown to 10 small files (16-96 LOC each).
- **Schema fragmentation.** `packages/workflows/src/schema/` had 11 files (`action-manifest.ts`, `defaults.ts`, `env.ts`, `expression.ts`, `job.ts`, `ref.ts`, `registry.ts`, `shell.ts`, `step.ts`, `topology.ts`, `workflow.ts`) without a clear cohesion principle.
- **Mixed concerns in runtime.** `runtime/src/runner/uses/` mixed pure logic (resolver, classifier) with I/O (registry-fetch, loader, protocol).
- **Boundary leakage.** Domain logic that should have lived in `runtime` was reimplemented in `cli/src/lib/` (`parse-registry-ref`, `parse-short-ref`, `registry`, `registry-root`, `walk-cache`, `check-manifest`) because `runtime` did not expose the necessary API.
- **Horizontal coupling.** Adding a new CLI command consistently required edits in `cli` and `runtime` — never one alone.

The user flagged on 2026-05-09 that the architecture had become incomprehensible. Concurrent reading of recent articles convinced the user that:

1. CLI tools beat MCP servers for AI-agent integration on token consumption and reliability — the planned "AIactions-as-MCP-server" surface is dropped.
2. ACP surface is dropped on the same blast radius (CLI is canonical machine-readable surface; JSON receipts already exist).

These two scope reductions narrow the integration surfaces from four (CLI / Skills / MCP / ACP) to two (CLI / Skills) and remove any reason to keep code generic for non-CLI consumers.

## 2. Goals

1. **Single-responsibility packages.** Each package has a one-line role description and a stable public API.
2. **80% CLI-only feature additions.** Adding a typical new command modifies only the CLI package; core orchestrations are touched only for new stateful workflows.
3. **Thin core.** `@aiactions/core` contains _only_ orchestrators (~6 src files target). It never holds schemas, parsers, I/O, or registry logic. Anti-pattern reference: Archon's `packages/core/` mixes db/config/handlers/operations/orchestrator (~30 files) — explicitly avoided.
4. **Conventional TS/Node naming.** No DDD-isms (`domain/`, `ports/`, `adapters/`, `use-cases/`); no suffix patterns (`*.adapter.ts`, `*.port.ts`). Package names express role, not pattern.
5. **Bisectable migration.** Six phases, each shippable independently as a `--no-ff` PR.

## 3. Non-goals

- AIactions-as-MCP-server surface — dropped.
- ACP surface — dropped.
- `apps/website` — created when a docs site is needed.
- `@aiactions/isolation` — created when parallel-agent jobs require worktree management.
- Database persistence — the lockfile (`.aiactions/lock.json`) is sufficient for current scope.

## 4. Methodology

The architecture combines three perspectives:

- **Hexagonal in spirit.** Domain logic is insulated from I/O — but expressed through package boundaries (each brick is its own package with a clean exported API), not through `domain/ports/adapters/` folders inside a single monolith. This avoids the DDD jargon while keeping the testability and swap-ability that hexagonal provides.
- **Vertical slice for the CLI.** Each `(resource, verb)` pair (e.g. `action install`, `workflow run`) is a single folder owning command definition, orchestration, and receipt formatting. Cross-slice sharing only via `_shared/` (truly cross-cutting) or via brick package APIs.
- **Functional cohesion as arbiter.** When a boundary decision is ambiguous, the rule is: code that _changes together_ belongs together (Constantine, 1979).

External references consulted: monorepo.tools (Nrwl/Nx), Vertical Slice Architecture (Bogard), Bounded Context (Fowler), Clean Architecture (Martin), Turborepo structuring guide. Methodologies explicitly rejected for AIactions: layered/Clean Architecture (over-ceremony for use-case heterogeneity), DDD bounded context (single domain — workflow execution), Nx 4-type model (no UI / data-access / state-mgmt to organize), Pipeline-stage packages (would force every command to traverse 5-7 packages).

## 5. Package layout

### 5.1. Final list

| #   | Package                 | Role                                                               | Est. src files |
| --- | ----------------------- | ------------------------------------------------------------------ | -------------- |
| 1   | `@aiactions/schema`     | zod schemas (workflow, action manifest, ref, registry, env, shell) | 6              |
| 2   | `@aiactions/parser`     | YAML → AST + semantic validation                                   | 4              |
| 3   | `@aiactions/discovery`  | find workflow files (project + home roots)                         | 4              |
| 4   | `@aiactions/registry`   | fetch + cache + version-resolve + lockfile                         | 6              |
| 5   | `@aiactions/expression` | `${{ ... }}` evaluation (pure)                                     | 2              |
| 6   | `@aiactions/exec`       | spawn shell + uses-loader.mjs                                      | 4              |
| 7   | `@aiactions/paths`      | XDG paths (`~/.aiactions/`) + env + logger + telemetry-bus         | 4-5            |
| 8   | `@aiactions/git`        | git operations (branch, exec, repo, types, worktree)               | 5              |
| 9   | `@aiactions/core`       | orchestrators only — runner state machine + install-pipeline       | 5-6            |
| 10  | `@aiactions/cli`        | bin `aia` + vertical slices per `(resource, verb)`                 | ~25            |

Plus, outside `packages/`:

- `actions/` — first-party actions (currently `actions/claude/agent`). Each action is its own package; consumed only via the `uses:` protocol.
- `apps/` — created when needed.

### 5.2. Disappearing packages

- `@aiactions/workflows` (currently 1.0.1) — splits into `schema` + `parser` + `discovery`. Major bump on workflows tracker; package deleted at end of phase 3.
- `@aiactions/runtime` (currently 3.0.1) — splits into `expression` + `exec` + `registry` + `core`. Major bump on runtime tracker; package deleted at end of phase 4.

### 5.3. Inspired by Archon

Two patterns imported from Archon (`/home/aperrix/Documents/PROJECTS/archon`):

- `paths` package — Archon centralizes `archon-paths`, `env-loader`, `telemetry`, `logger`, `update-check`, `bundled-build`, `strip-cwd-env` in a focused platform-services package. AIactions adopts the pattern with a tighter scope (no telemetry export until needed; no update-check yet).
- `git` package — Archon's `branch.ts`, `exec.ts`, `repo.ts`, `types.ts`, `worktree.ts` provide a clean SRP wrapper. `engineering-principles.md` already mandates `@aiactions/git` for git operations; this formalizes it.

Anti-pattern explicitly rejected: Archon's `packages/core/` contains `db/` (10 SQLite persistence files), `config/`, `handlers/`, `operations/`, `orchestrator/` — ~30 files mixing persistence + orchestration + IO + config. AIactions `@aiactions/core` is capped at orchestrators only.

## 6. Dependency graph (DAG)

```
schema    paths    git    expression    exec        ← leaves (no internal deps)
   ▲        ▲      ▲           ▲         ▲
   │        │      │           │         │
parser ────┘                   │         │
   ▲                           │         │
   │                           │         │
discovery                      │         │
   ▲                           │         │
   │                           │         │
registry ──── paths, git ──────┼─────────┤
   ▲                           │         │
   │                           │         │
core ──── schema, parser, registry, expression, exec, paths, git
   ▲
   │
cli ──── any internal package, plus actions/* loaded at runtime
```

Strict rules:

- **Leaves**: `schema`, `paths`, `git`, `expression`, `exec` have **no internal package dependencies**. Their only deps are stdlib + npm.
- **`parser` → `schema`** only.
- **`discovery` → `parser`, `schema`** only (loads files, parses them with parser).
- **`registry` → `schema`, `paths`, `git`** (schemas for refs; paths for cache root; git for clone/fetch).
- **`core` → `schema`, `parser`, `registry`, `expression`, `exec`, `paths`, `git`**. Core does **NOT** import `discovery` (discovery is a user-facing operation, not a runner primitive). Core does **NOT** import `cli`.
- **`cli` → any internal package**.
- **`actions/*` → independent**. Each first-party action is a self-contained package; consumed by the runner via the `uses:` protocol, not via direct imports.

The DAG is enforced through `package.json.dependencies` (workspace:\*) and a global `oxlint` `no-restricted-imports` rule that bans cross-package imports outside the declared edges.

## 7. Per-package detail

### 7.1. `@aiactions/schema`

- **Role.** Source of truth for the data model — every other package consumes its types and validators.
- **Public API (representative).** `WorkflowSchema`, `ActionManifestSchema`, `RegistryRefSchema`, `EnvSchema`, `ShellSchema`, `RunStatus`, `Workflow`, `ActionManifest`, `RegistryRef`, base error class `AIactionsError`.
- **Internal layout.**
  ```
  src/
    schemas/
      workflow.ts          # Workflow + Job + Step zod schemas
      action-manifest.ts   # ActionManifest schema
      ref.ts               # RegistryRef + parsing helpers
      registry.ts          # registry.json schema
      env.ts               # env block schema
      shell.ts             # shell + step + expression schemas (consolidated)
    errors/
      base.ts              # AIactionsError abstract class
    types/
      run.ts               # Run, RunStatus discriminated union
      events.ts            # WorkflowEvent union
    index.ts
  ```
- **Internal deps.** None.
- **External deps.** `zod`.

### 7.2. `@aiactions/parser`

- **Role.** Convert YAML/JSON text into typed `Workflow` / `ActionManifest` ASTs and run semantic validations beyond what zod alone can express (DAG cycles, ref consistency).
- **Public API.** `parseWorkflow(yaml: string): Workflow`, `parseAction(yaml: string): ActionManifest`, `validateWorkflow(ast: Workflow): Issue[]`, `Issue`, `ParseError extends AIactionsError`, `ValidationError extends AIactionsError`.
- **Internal layout.**
  ```
  src/
    parse-workflow.ts
    parse-action.ts
    validate-workflow.ts
    validate-topology.ts
    issue.ts
    errors.ts
    index.ts
  ```
- **Internal deps.** `@aiactions/schema`.
- **External deps.** `yaml`.

### 7.3. `@aiactions/discovery`

- **Role.** Find workflow files on disk (project root + home root). Apply per-file error tolerance per the discovery design (`docs/superpowers/specs/2026-05-09-workflow-discovery-roots-design.md`).
- **Public API.** `discoverWorkflows(opts): DiscoveryResult`, `loadWorkflowsFromDir(dir): WorkflowFile[]`, `findGitRoot(cwd: string): string | null`.
- **Internal layout.**
  ```
  src/
    discover-workflows.ts
    load-from-dir.ts
    find-git-root.ts
    types.ts
    errors.ts
    index.ts
  ```
- **Internal deps.** `@aiactions/parser`, `@aiactions/schema`.
- **External deps.** stdlib only.

### 7.4. `@aiactions/registry`

- **Role.** Acquire and persist actions on the developer's machine. Owns the action cache (`<registryRoot>/actions/<ns>/<name>/<version>/`), the lockfile (`.aiactions/lock.json`), and version resolution (exact / range / sha — current `classifyVersion` + `resolveMajorRange` lifted in here).
- **Public API.** `installAction(ref): InstallResult`, `listActions(): InstalledAction[]`, `uninstallAction(ref): void`, `resolveRef(ref): ResolvedRef`, `readLockfile(path): Lockfile`, `writeLockfile(path, lock): void`, `RegistryError`, `RegistryFetchError`, `RegistryResolveError`.
- **Internal layout.**
  ```
  src/
    install.ts
    list.ts
    uninstall.ts
    resolve.ts                # resolveRef + classifyVersion + resolveMajorRange
    fetch.ts                  # current registry-fetch.ts logic (uses git package)
    lockfile.ts               # current runtime/lockfile.ts logic
    errors.ts
    index.ts
  ```
- **Internal deps.** `@aiactions/schema`, `@aiactions/paths`, `@aiactions/git`.
- **External deps.** `semver`.

### 7.5. `@aiactions/expression`

- **Role.** Pure evaluation of GitHub-Actions-style `${{ ... }}` expressions.
- **Public API.** `evaluate(expr: string, ctx: Context): unknown`, `Context`, `ExpressionError`.
- **Internal layout.**
  ```
  src/
    evaluate.ts
    context.ts
    errors.ts
    index.ts
  ```
- **Internal deps.** `@aiactions/schema` (for Context type).
- **External deps.** none (current `runtime/eval/expression.ts` is dependency-free).

### 7.6. `@aiactions/exec`

- **Role.** Spawn primitives — running shell commands and Node-based action loaders.
- **Public API.** `spawnShell(spec): SpawnResult`, `spawnUses(loader, args): SpawnResult`, `ExecError`. Includes the `uses-loader.mjs` boot script.
- **Internal layout.**
  ```
  src/
    spawn-shell.ts
    spawn-uses.ts
    script-file.ts            # current runtime/exec/script-file.ts
    shell-spec.ts             # current runtime/exec/shell-spec.ts (pure parts)
    uses-loader.mjs
    errors.ts
    index.ts
  ```
- **Internal deps.** `@aiactions/schema`.
- **External deps.** stdlib only (`node:child_process`).

### 7.7. `@aiactions/paths`

- **Role.** XDG path resolution, environment-variable parsing, structured logger, telemetry event bus. The "platform-services" layer.
- **Public API.** `resolveAIActionsHome(): string`, `resolveRegistryRoot(): string`, `resolveCacheRoot(): string`, `resolveTmpRoot(): string`, `loadEnv(): Env`, `createLogger(module?: string): Logger`, `rootLogger: Logger`, `createEventBus<EventMap>(): EventBus<EventMap>`, `captureWorkflowInvoked(props)`, `captureActionInstalled(props)`, `shutdownTelemetry()`, `isTelemetryDisabled()`, `getOrCreateTelemetryId()`. Env parsing covers `AIA_HOME`, `AIA_REGISTRY_ROOT`, `AIA_TMP_ROOT`, `AIA_DEBUG`. Telemetry env vars (read directly): `AIA_POSTHOG_API_KEY`, `AIA_POSTHOG_HOST`, `AIA_TELEMETRY_DISABLED`, `DO_NOT_TRACK`.
- **Internal layout.**
  ```
  src/
    paths.ts
    env.ts
    logger.ts
    event-bus.ts
    telemetry.ts
    index.ts
  ```
- **Internal deps.** None.
- **External deps.** `pino`, `pino-pretty` (structured logger), `posthog-node` (anonymous outbound analytics). Stdlib otherwise. Pino-pretty runs as a destination stream so the logger survives `tsdown` single-file bundling.
- **Telemetry policy.** Enabled by default (opt-out). The AIactions project's write-only `phc_*` PostHog key is embedded in `telemetry.ts`; `phc_*` keys can only write events, never read data, and are safe to ship in source. End users can opt out via `AIA_TELEMETRY_DISABLED=1` or `DO_NOT_TRACK=1`, or override the project via `AIA_POSTHOG_API_KEY` (e.g. for self-hosted PostHog). Anonymous UUID at `<aiActionsHome>/telemetry-id`. Events emitted today: `workflow_invoked` (workflow name + truncated description + aiactions version), `action_installed` (action namespace/name/version + resolved version + canonical-or-custom source + aiactions version). `$process_person_profile: false` keeps events in PostHog's anonymous tier (no person profile ever created).

### 7.8. `@aiactions/git`

- **Role.** SRP wrapper around git commands. All git invocations in AIactions go through this package; direct `execFileAsync(['git', ...])` calls outside this package are forbidden.
- **Public API.** `cloneRepo(opts)`, `fetchTag(opts)`, `listBranches(repoDir)`, `createWorktree(opts)`, `removeWorktree(opts)`, `gitExec(args, opts)`, `GitError`.
- **Internal layout.**
  ```
  src/
    repo.ts
    branch.ts
    worktree.ts
    exec.ts
    types.ts
    errors.ts
    index.ts
  ```
- **Internal deps.** None.
- **External deps.** stdlib only (`node:child_process`).

### 7.9. `@aiactions/core`

- **Role.** Stateful orchestrators that compose multiple bricks. Currently two: workflow runner (state machine + step execution) and install-pipeline (registry fetch + parser validate + lockfile write).
- **Public API.** `runWorkflow(workflow, opts): Run`, `installPipeline(ref): InstallResult`, `RunnerError`, `JobError`, `StepError`.
- **Internal layout.**
  ```
  src/
    run-workflow.ts
    runner/
      job-graph.ts
      run-step.ts
      run-uses.ts
    install-pipeline.ts
    errors.ts
    index.ts
  ```
- **Internal deps.** `@aiactions/schema`, `@aiactions/parser`, `@aiactions/registry`, `@aiactions/expression`, `@aiactions/exec`, `@aiactions/paths`, `@aiactions/git`.
- **External deps.** none.

### 7.10. `@aiactions/cli`

- **Role.** The `aia` binary. Translates argv to brick or core calls; formats results as JSON receipts or human-readable output.
- **Internal layout.**
  ```
  packages/cli/
    bin/aia.mjs                 # bin entry — unchanged
    src/
      cli.ts                    # citty root command
      commands/
        action/
          index.ts              # citty subCommands aggregator
          install/
            command.ts          # citty defineCommand
            install-action.ts   # slice-local orchestration
            receipt.ts          # JSON output shape
          list/
            command.ts
            list-actions.ts
            receipt.ts
          check/
            command.ts
            check-action.ts
            receipt.ts
          uninstall/
            command.ts
            uninstall-action.ts
            receipt.ts
        workflow/
          index.ts
          list/
            command.ts
            list-workflows.ts
            receipt.ts
          run/
            command.ts
            run-workflow.ts
            receipt.ts
          check/
            command.ts
            check-workflow.ts
            receipt.ts
      _shared/
        exit-codes.ts
        cli-error.ts
        output.ts
  ```
- **Internal deps.** `@aiactions/core`, `@aiactions/registry`, `@aiactions/discovery`, `@aiactions/parser`, `@aiactions/schema`, `@aiactions/paths`. `_shared/` contains _only_ truly cross-cutting CLI concerns: `exit-codes.ts`, `cli-error.ts` (wraps `AIactionsError` with an exit code), `output.ts` (JSON / pretty writer).
- **External deps.** `citty`, `@clack/prompts` (existing).

## 8. CLI vertical slices — slice rule

A slice is a `(resource, verb)` pair: `action install`, `action list`, `action check`, `action uninstall`, `workflow list`, `workflow run`, `workflow check`. Seven slices total at the end of phase 6.

**Sharing rule.** Cross-slice sharing inside the CLI package is allowed only through `_shared/`. Code shared across two slices stays duplicated until the rule of three (three independent occurrences) triggers extraction. When extraction happens, the destination is:

- A brick package, if the logic is domain (parsing, validation, formatting issues) — preferred.
- `_shared/`, if the logic is CLI-specific cross-cutting (exit codes, base error class, output writer) — acceptable fallback.

This preserves the slice independence Bogard's vertical-slice architecture relies on: minimize coupling between slices, maximize coupling in a slice.

## 9. Data flow — `aia workflow run my-workflow`

```
$ aia workflow run my-workflow
        │
        ▼
cli/commands/workflow/run/command.ts          (citty entry)
        │ argv → opts
        ▼
cli/commands/workflow/run/run-workflow.ts     (slice orchestration)
        │
        ├── discovery.findGitRoot(cwd)               → projectRoot
        ├── discovery.discoverWorkflows({projectRoot})
        ├── fs.readFile(workflowPath)                → yaml string
        ├── parser.parseWorkflow(yaml)               → Workflow AST
        ├── core.runWorkflow(ast, opts)              → Run result
        │       │
        │       ├── jobGraph(AST) → ordered jobs
        │       ├── for each job/step:
        │       │     │
        │       │     ├── if `run:` step:
        │       │     │     ├── expression.evaluate(${{...}}, ctx)
        │       │     │     └── exec.spawnShell(spec)
        │       │     │
        │       │     └── if `uses:` step:
        │       │           ├── registry.resolveRef(ref)
        │       │           ├── registry.installAction(ref)
        │       │           │     └── git.cloneRepo(...)
        │       │           └── exec.spawnUses(loader, args)
        │       │
        │       └── paths.telemetryBus.emit(WorkflowEvent)
        │
        └── cli/commands/workflow/run/receipt.ts     (format → stdout)
```

## 10. Error handling

### 10.1. Hierarchy

```
AIactionsError                         # @aiactions/schema (abstract base)
  ├── ValidationError                  # @aiactions/parser
  ├── ParseError                       # @aiactions/parser
  ├── DiscoveryError                   # @aiactions/discovery
  ├── RegistryError                    # @aiactions/registry
  │     ├── RegistryFetchError
  │     └── RegistryResolveError
  ├── ExpressionError                  # @aiactions/expression
  ├── ExecError                        # @aiactions/exec
  ├── GitError                         # @aiactions/git
  └── RunnerError                      # @aiactions/core
        ├── JobError
        └── StepError

CliError                               # cli/_shared/ — wraps any AIactionsError + exit code
```

### 10.2. Propagation rules

- Each package raises only its own typed errors (or `AIactionsError` re-exported from `schema`).
- No `try/catch` swallows or re-wraps without enriching context. If a package needs to add context, it throws a new typed error with `cause: originalError` (Node 22 native cause propagation).
- Errors flow upward unchanged through `core` and out to the CLI slice.
- The CLI slice catches at the outermost boundary, maps `AIactionsError.constructor` → exit code via the `EXIT` table in `cli/_shared/exit-codes.ts`, and prints with `cli/_shared/output.ts`.
- `paths.telemetryBus` also emits on error for future observability hooks.

### 10.3. Exit code mapping (initial)

| Error class                      | Exit code                     |
| -------------------------------- | ----------------------------- |
| `ValidationError` / `ParseError` | 2 (`EXIT.INVALID_INPUT`)      |
| `DiscoveryError`                 | 3 (`EXIT.NOT_FOUND`)          |
| `RegistryFetchError`             | 4 (`EXIT.NETWORK`)            |
| `RegistryResolveError`           | 5 (`EXIT.UNRESOLVABLE`)       |
| `ExecError` / `RunnerError`      | 6 (`EXIT.RUNTIME`)            |
| `GitError`                       | 7 (`EXIT.GIT`)                |
| Other `Error` (non-typed)        | 99 (`EXIT.RUNTIME` — unknown) |

Existing `EXIT` constants from `packages/cli/src/lib/exit-codes.ts` are preserved as-is to avoid breaking script consumers.

## 11. Testing strategy

| Package      | Test scope                                                                   | Mocking policy                              |
| ------------ | ---------------------------------------------------------------------------- | ------------------------------------------- |
| `schema`     | zod parsing edge cases, required vs optional, defaults                       | none                                        |
| `parser`     | YAML → AST, malformed YAML, schema mismatches, topology cycles               | none                                        |
| `discovery`  | fs walk, git-root finding, project-shadows-home, broken symlinks             | tmpdir fixtures                             |
| `registry`   | version resolution (exact/range/sha), fetch flow, lockfile read/write        | bare-repo fixtures (real git)               |
| `expression` | literals, ctx access, operators, error cases                                 | none                                        |
| `exec`       | spawn semantics, env passing, stdio capture, exit codes                      | real child processes against simple scripts |
| `paths`      | XDG resolution, env override, logger emit, telemetry bus subscribe           | env-var manipulation                        |
| `git`        | branch ops, worktree create/remove, repo init                                | bare-repo fixtures                          |
| `core`       | runner orchestration with **real bricks** — integration of bricks under test | bare-repo for registry; tmpdir for fs       |
| `cli`        | end-to-end via `runCli()` fixture; JSON receipts validated                   | full integration                            |

**Principle:** no over-mocking. Bricks pure (`schema`, `parser`, `expression`) test their API directly. Bricks I/O (`registry`, `exec`, `git`) use real fixtures (bare repos, tmpdirs). `core` tests orchestration with the real bricks under it. `cli` tests user experience by spawning `aia`. This aligns with the `collaboration.md` TDD policy: tests catch real failure modes, not implementation details.

## 12. Migration plan (6 phases)

Each phase is a single PR. Per-phase strategy: `--no-ff` merge to preserve per-commit Conventional Commit history (release-please routes per-component bumps correctly). Pre-flush `vp fmt` on `main` before each phase to avoid the MS1.7 fmt-only-drift trap.

| Phase | Change                                                                                                                                                                 | Breaking?                                        | release-please impact                                           |
| ----- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------ | --------------------------------------------------------------- |
| **1** | Create `@aiactions/paths`. Move `cli/lib/registry-root.ts` and runtime env helpers into it. Add new logger + telemetry-bus modules.                                    | No                                               | New package at v0.1.0; runtime + cli get a `dependencies` entry |
| **2** | Create `@aiactions/git`. Extract git operations from `runtime/runner/uses/registry-fetch.ts` and any other ad-hoc `execFileAsync(['git', ...])` calls.                 | No                                               | New package at v0.1.0                                           |
| **3** | Split `@aiactions/workflows` → `@aiactions/schema` + `@aiactions/parser` + `@aiactions/discovery`. Update consumers (`runtime`, `cli`). Delete `@aiactions/workflows`. | **Yes** — `feat(workflows)!:` major              | Three new packages at v1.0.0; `@aiactions/workflows` removed    |
| **4** | Split `@aiactions/runtime` → `@aiactions/expression` + `@aiactions/exec` + `@aiactions/registry` + `@aiactions/core`. Update CLI. Delete `@aiactions/runtime`.         | **Yes** — `feat(runtime)!:` major                | Four new packages at v1.0.0; `@aiactions/runtime` removed       |
| **5** | Refactor `@aiactions/cli` into vertical slices per `(resource, verb)`. Move `cli/lib/*` content to bricks (already migrated in phase 4 for most) or `_shared/`.        | No (internal restructure; CLI surface unchanged) | CLI minor bump                                                  |
| **6** | Add `aia workflow list/run/check` commands consuming the new bricks. Resumes the original MS1.9 work.                                                                  | No                                               | CLI minor bump                                                  |

**Rollback path.** Each phase is independently revertable. Phases 1, 2, 5, 6 are pure additions or internal restructures. Phases 3 and 4 are reversible by `git revert` because deleted packages are reconstructable from history; consumers regress to the previous workspace dep declarations.

## 13. Enforcement

- **DAG.** Workspace `dependencies` declarations make cycles impossible. Any cycle attempt fails `bun install` / `vp install`.
- **Cross-package import bans.** Global `oxlint` rule via `vite.config.ts`'s lint config: `no-restricted-imports` blocks `@aiactions/discovery` from `packages/core/`, blocks `@aiactions/cli/*` from any non-cli package, etc. Lint failures break `vp run ready`.
- **Naming convention.** No `*.adapter.ts`, `*.port.ts`, `domain/`, `ports/`, `adapters/`, `use-cases/` strings in `packages/*/src/**`. Enforced by review (no automated check — too loose to be lintable cleanly).
- **No node:fs in pure bricks.** `oxlint` rule scoped to `packages/{schema,parser,expression}/src/**` bans `node:fs`, `node:child_process`, `node:net`, `node:http` imports.

## 14. Dropped from previous roadmap

- AIactions-as-MCP-server surface (one of four originally planned: CLI / Skills / MCP / ACP).
- ACP surface.

Both decisions persisted in MuninnDB memory `integration-surfaces-narrowed-2026-05-09`. The unaffected `mcp_servers` input on `claude/agent` is an Anthropic SDK passthrough — different concept, retained.

## 15. Open questions

None at design time. All tradeoffs (workspace ceremony cost vs modularity, breaking-major vs in-place rename, six phases vs single big-bang) were debated during brainstorm and locked by user 2026-05-09.

## 16. References

### External

- [monorepo.tools](https://monorepo.tools/) — Nrwl/Nx, 2025. Polyrepo tax, AI-agent benefits, well-defined relationships.
- [Vertical Slice Architecture](https://www.jimmybogard.com/vertical-slice-architecture/) — Jimmy Bogard. Couple along axis of change.
- [Bounded Context](https://martinfowler.com/bliki/BoundedContext.html) — Martin Fowler. Why ubiquitous-language boundaries matter (here: rejected for AIactions, single domain).
- [The Clean Architecture](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html) — Robert C. Martin. Concentric dependency rule (here: rejected as monolithic).
- [Turborepo — Structuring a repository](https://turborepo.com/docs/crafting-your-repository/structuring-a-repository) — Vercel. `apps/` + `packages/` convention.
- [Nx — Folder Structure](https://nx.dev/concepts/decisions/folder-structure), [Project Size](https://nx.dev/concepts/decisions/project-size), [Project Dependency Rules](https://nx.dev/concepts/decisions/project-dependency-rules) — Nrwl. Library types, separation criteria.

### Internal

- `.claude/rules/collaboration.md` — checkpoint protocol, multi-component merge rule, fmt-isolation rule.
- `.claude/rules/engineering-principles.md` — type safety, git as first-class, KISS, YAGNI, DRY rule of three, SRP/ISP, no autonomous lifecycle mutation.
- `.claude/rules/codebase-memory.md` — graph-first discovery, cross-project Archon reasoning.
- `.claude/rules/muninn.md` — vault `aiactions`, atomic memories, decision persistence.
- `.claude/rules/viteplus.md` — toolchain commands.
- `docs/superpowers/specs/2026-05-09-workflow-discovery-roots-design.md` — discovery semantics already shipped, retained.

### MuninnDB memories

- `aiactions-architecture-10-packages-validated` — this decision (root memory).
- `archon-core-fourre-tout-anti-pattern` — Archon `core/` analysis, lesson.
- `integration-surfaces-narrowed-2026-05-09` — MCP + ACP dropped, prerequisite.
- `ms1-4-to-1-7-cli-roadmap (evolved) (evolved)` — historical CLI milestone sequencing, now superseded by phase 5/6.

### Codebase index

- Project `home-aperrix-Documents-PROJECTS-aiactions` (CWD).
- Project `home-aperrix-Documents-PROJECTS-archon` (reference; `packages/{adapters,cli,core,docs-web,git,isolation,paths,providers,server,web,workflows}` analyzed 2026-05-09).
