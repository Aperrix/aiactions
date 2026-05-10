# Phase 5 — CLI vertical slices design

**Date:** 2026-05-10
**Author:** Aperrix + Claude (pair)
**Parent spec:** [`2026-05-09-architecture-restructure-design.md`](./2026-05-09-architecture-restructure-design.md) — §7.10, §8, §10, §13.
**Status:** Approved
**Predecessor phases:** 1 (paths), 2 (git), 3 (workflows split), 4 (runtime split). All shipped.

## 1. Context

The architecture restructure master spec (2026-05-09) sequenced six phases. Phases 1–4 created the brick packages (`paths`, `git`, `schema`/`parser`/`discovery`, `expression`/`exec`/`registry`/`core`) and deleted the catch-all `runtime` package. The CLI was updated to consume the new bricks but kept the legacy `cli/lib/*` flat helper layout from the pre-restructure era.

Phase 5 finishes the CLI side of the restructure: convert `packages/cli/src/commands/action/<verb>.ts` flat handlers into vertical slices per `(resource, verb)`, hoist the truly cross-cutting helpers into `cli/_shared/`, and migrate the helpers that traffic in domain primitives (Registry index fetch, FS cache walk) to `@aiactions/registry`.

After phase 5, every CLI slice owns its full vertical (citty entry → orchestration → receipt formatter). Phase 6 (`aia workflow list/run/check`) then drops in as four new slices without touching existing files.

## 2. Goals

- Replace flat `commands/action/<verb>.ts` handlers with one folder per `(resource, verb)` containing `command.ts`, `<verb>-<resource>.ts`, `receipt.ts`.
- Delete `packages/cli/src/lib/`. Migrate every file to its correct home (slice / `_shared/` / brick).
- Eliminate the `RegistryFetchError` duplication between `cli/lib/errors.ts` and `@aiactions/registry/errors.ts`.
- Add the missing `RegistryValidationError` to `@aiactions/registry/errors.ts`.
- Move the registry-index fetch and cache walker helpers to `@aiactions/registry` (additive, non-breaking).
- Mirror the new src tree under `packages/cli/tests/` (flat-mirror layout — Q1=B).
- Land everything in one multi-component PR with `--no-ff` merge (Q2=A2).
- No breaking change to the CLI public surface (`aia` argv, JSON receipt shape, exit codes, env vars).

## 3. Non-goals

- Adding `aia workflow ...` slices — that is phase 6.
- Reworking the JSON receipt schemas — only structural extraction into `receipt.ts` modules; on-the-wire shape is preserved verbatim.
- Adding new exit codes or renaming existing `EXIT.*` constants — script consumers depend on them.
- Refactoring the parser/discovery/registry brick public APIs — only additive surface changes in `@aiactions/registry`.
- Touching `bin/aia.mjs` (single-line shebang + dist re-export, already correct).

## 4. Target layout

### 4.1. `packages/cli/`

```
packages/cli/
  bin/aia.mjs                       # unchanged
  src/
    cli.ts                          # citty root — unchanged structure
    commands/
      index.ts                      # subCommands aggregator (action; workflow added in phase 6)
      action/
        index.ts                    # action subCommands aggregator
        check/
          command.ts                # citty defineCommand (argv parse + flags)
          check-action.ts           # orchestration (calls parser, collects issues)
          receipt.ts                # JSON + pretty output writers
          check-manifest.ts         # slice-local: multi-issue manifest checker
          format-issues.ts          # slice-local: per-line issue formatter
        install/
          command.ts
          install-action.ts
          receipt.ts
          parse-short-ref.ts        # slice-local: argv short-ref parser
        list/
          command.ts
          list-actions.ts
          receipt.ts
        uninstall/
          command.ts
          uninstall-action.ts
          receipt.ts
    _shared/
      cli-error.ts                  # CliError, UsageError, NotFoundError
      exit-codes.ts                 # EXIT table — preserved verbatim
      output.ts                     # isInteractive, formatTable, JSON/pretty writer
      parse-registry-ref.ts         # argv RegistryRef parser (used by install + uninstall)
  tests/
    bin-integration.test.ts         # E2E spawning aia
    fixtures/                       # shared test helpers — unchanged
    _shared/
      cli-error.test.ts             # CliError / UsageError / NotFoundError
      output.test.ts
      parse-registry-ref.test.ts
    commands/action/
      check/
        check.test.ts
        check-manifest.test.ts
        format-issues.test.ts
      install/
        install.test.ts
        install-registry.test.ts
        parse-short-ref.test.ts
      list/
        list-registry.test.ts
      uninstall/
        uninstall.test.ts
```

### 4.2. `packages/registry/` (additive)

```
packages/registry/src/
  errors.ts                         # + RegistryValidationError (extends RegistryError)
  fetch.ts                          # unchanged (action git fetch)
  resolve.ts                        # unchanged
  lockfile.ts                       # unchanged
  index-fetch.ts                    # NEW — registry.json HTTP fetch + parsing
  cache.ts                          # NEW — walkCache + CachedEntry
  index.ts                          # + re-export ./index-fetch ./cache

packages/registry/tests/
  registry-index.test.ts            # NEW — moved from cli/tests/registry.test.ts
  cache.test.ts                     # NEW — moved from cli/tests/walk-cache.test.ts
  registry-errors.test.ts           # NEW — RegistryValidationError + ensures error hierarchy is intact
```

`@aiactions/registry` public surface gains six exports: `fetchRegistry`, `groupByCoord`, `resolveRegistryUrl`, `resolveLatest`, `REGISTRY_URL_DEFAULT` (from `index-fetch.ts`), `walkCache`, `CachedEntry` (from `cache.ts`), `RegistryValidationError` (from `errors.ts`). All additive — existing consumers (`@aiactions/core`, `@aiactions/cli`) keep working unchanged.

## 5. Migration map — `cli/lib/*` → destination

| Source                        | Destination                                                                       | Rationale                                                                                                       |
| ----------------------------- | --------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| `lib/errors.ts` (3 classes)   | `_shared/cli-error.ts` — keeps `CliError`, `UsageError`, `NotFoundError`          | CLI-cross-cutting non-domain errors. No equivalent in any brick.                                                |
| `lib/errors.ts` (2 classes)   | **Deleted.** `RegistryFetchError`/`RegistryValidationError` consumed from brick   | Eliminates dup with `@aiactions/registry/errors.ts`. `RegistryValidationError` added to brick.                  |
| `lib/exit-codes.ts`           | `_shared/exit-codes.ts` — verbatim                                                | `EXIT.*` constants are part of the script-consumer contract; preserved as-is.                                   |
| `lib/output.ts`               | `_shared/output.ts` — verbatim                                                    | CLI-cross-cutting writer (TTY detection + table formatting). Used by 2+ slices.                                 |
| `lib/parse-registry-ref.ts`   | `_shared/parse-registry-ref.ts` — verbatim                                        | Argv parser, CLI-specific. Used by install + uninstall (2 slices). Stays cross-slice but inside CLI.            |
| `lib/parse-short-ref.ts`      | `commands/action/install/parse-short-ref.ts`                                      | Used by install only. Slice-local.                                                                              |
| `lib/registry.ts`             | `@aiactions/registry/index-fetch.ts` (NEW)                                        | Registry-index domain code (fetch, parse, group, resolveLatest). Distinct from brick's existing action-fetch.   |
| `lib/walk-cache.ts`           | `@aiactions/registry/cache.ts` (NEW)                                              | Cache-layout FS walker — registry-domain. Used by list + uninstall.                                             |
| `lib/format-issues.ts`        | `commands/action/check/format-issues.ts`                                          | Used by check only. Slice-local.                                                                                |
| `lib/check-manifest.ts`       | `commands/action/check/check-manifest.ts`                                         | Multi-issue display wrapper over `parseActionManifest`. Distinct semantics from brick. Used by check only.      |

## 6. Slice file conventions

Each `(resource, verb)` slice contains exactly three named files plus zero-or-more slice-local helpers:

- **`command.ts`** — `defineCommand({ ... })` from citty. Owns argv schema, flag descriptions, and the thin `run({ args, ... })` body that delegates to `<verb>-<resource>.ts`. No business logic.
- **`<verb>-<resource>.ts`** — the orchestration layer: invokes brick APIs (`@aiactions/registry.fetchRegistry(...)`, `@aiactions/parser.parseActionManifest(...)`, etc.), assembles the result struct, and hands it to the receipt module. No I/O on stdout/stderr.
- **`receipt.ts`** — given the result struct, emits JSON to stdout (`process.stdout.write(JSON.stringify(...) + "\n")`) when `--json` is set, or pretty output otherwise. Owns the on-the-wire receipt shape. Errors flow up through the orchestrator; only `_shared/cli-error.ts` reaches the top-level catch in `cli.ts`.

Slice-local helpers (e.g. `parse-short-ref.ts`, `format-issues.ts`, `check-manifest.ts`) live next to the three core files. They have no rule about naming; they exist when, and only when, the verb needs them. Cross-slice extraction follows the rule of three (master spec §8): two slices duplicate, three slices extract — destination is a brick (preferred) or `_shared/` (fallback).

## 7. Error-handling consolidation

Phase 4 already aligned every brick on `AIactionsError` (master spec §10.1). Phase 5 finishes the picture for the CLI:

```
AIactionsError                          # @aiactions/schema (abstract)
  ├── WorkflowParseError                # @aiactions/schema (re-used by parser)
  ├── WorkflowSchemaError
  ├── WorkflowValidationError
  ├── DiscoveryError                    # @aiactions/discovery
  ├── RegistryError                     # @aiactions/registry (abstract)
  │     ├── RegistryFetchError
  │     ├── RegistryResolveError
  │     └── RegistryValidationError     # NEW in phase 5
  ├── ExpressionError                   # @aiactions/expression
  ├── ExecError                         # @aiactions/exec
  ├── GitError                          # @aiactions/git
  └── RunnerError                       # @aiactions/core
        ├── JobError
        └── StepError

CliError                                # cli/_shared/cli-error.ts — non-domain
  ├── UsageError
  └── NotFoundError
```

The CLI top-level `try { ... } catch (err) { ... }` in `cli.ts` keeps its current structure but uses an extended decision tree:

1. `err instanceof CliError` → exit with `err.code`, print message.
2. `err instanceof AIactionsError` → look up the constructor in the `EXIT_BY_BRICK_ERROR` table in `_shared/exit-codes.ts` (additive table; existing `EXIT.*` constants unchanged), exit with that code.
3. otherwise → `EXIT.RUNTIME` (99).

`EXIT_BY_BRICK_ERROR` table (uses **only** the existing `EXIT.*` constants — `OK / RUNTIME / USAGE / NOT_FOUND / CONFLICT / REGISTRY / SCHEMA`; no new codes added in phase 5):

| Constructor                              | Exit code         |
| ---------------------------------------- | ----------------- |
| `WorkflowParseError`                     | `EXIT.SCHEMA`     |
| `WorkflowSchemaError`                    | `EXIT.SCHEMA`     |
| `WorkflowValidationError`                | `EXIT.SCHEMA`     |
| `DiscoveryError`                         | `EXIT.NOT_FOUND`  |
| `RegistryFetchError`                     | `EXIT.REGISTRY`   |
| `RegistryResolveError`                   | `EXIT.REGISTRY`   |
| `RegistryValidationError`                | `EXIT.REGISTRY`   |
| `ExpressionError`                        | `EXIT.RUNTIME`    |
| `ExecError`                              | `EXIT.RUNTIME`    |
| `GitError`                               | `EXIT.RUNTIME`    |
| `RunnerError` / `JobError` / `StepError` | `EXIT.RUNTIME`    |

Adding finer-grained codes (e.g. dedicated `EXIT.GIT`, splitting `SCHEMA` vs `USAGE` for parse vs validation) is deferred to a separate follow-up to keep phase 5 strictly internal-restructure.

The table preserves observable behavior: `aia action install` against an unreachable registry kept exiting `EXIT.REGISTRY` before phase 5 (CLI's `RegistryFetchError` carried it directly) and continues to exit `EXIT.REGISTRY` after phase 5 (table maps brick's `RegistryFetchError` to it). End-user contract unchanged.

## 8. Branching, merge, and versioning

- **Worktree:** `worktree-phase-5-cli-vertical-slices` (consistent with phases 1–4).
- **Internal commits:** Conventional Commits, scoped per package (`refactor(cli): ...`, `feat(registry): add index-fetch module`, `feat(registry): add cache module`, `refactor(cli)!?: ...` if any subtle break — none anticipated). All commit messages must be valid Conv-Commits because phase 5 lands as `--no-ff`.
- **Merge strategy:** `git merge --no-ff` on `main`. Per `collaboration.md`, multi-component PRs (cli + registry) take `--no-ff` so release-please can route per-component bumps from individual commits.
- **release-please result (expected):** `@aiactions/registry` minor bump (1.0.0 → 1.1.0, additive surface), `@aiactions/cli` minor bump (1.2.1 → 1.3.0, internal restructure preserving public surface). No breaking change tag anywhere. Override only if release-please path-attributes a stray `feat(cli)` to registry — in which case follow the MS1.7 lesson (collaboration.md §isolate-fmt-only) and pin manifest manually.

## 9. Testing strategy

- **Existing tests preserve behavior.** Tests from `packages/cli/tests/{check,check-manifest,format-issues,install,install-registry,list-registry,output,parse-registry-ref,parse-short-ref,uninstall}.test.ts` port verbatim — only the file path changes (per the §4.1 tree).
- **`errors.test.ts` splits.** `CliError` / `UsageError` / `NotFoundError` cases stay in CLI as `tests/_shared/cli-error.test.ts`. `RegistryFetchError` / `RegistryValidationError` cases move to `packages/registry/tests/registry-errors.test.ts` and re-target the brick exports (the brick versions extend `RegistryError`, not `CliError`, so the assertion that they carry an exit code is dropped — the new contract is "they extend `AIactionsError` and the CLI maps them via the table in §7").
- **`registry.test.ts` and `walk-cache.test.ts`** move to `packages/registry/tests/{registry-index,cache}.test.ts` and re-target the brick exports.
- **`bin-integration.test.ts` stays as-is.** It spawns `aia` and asserts on stdout/stderr/exit code. Receipt shape and error mapping are preserved → tests must keep passing without modification. **This is the canary for "no breaking change."**
- **Imports updated.** Tests in `_shared/` and `commands/action/<verb>/` adjust their `import` paths to the new locations. Tests moved to `packages/registry/tests/` import from the brick's new public exports (`fetchRegistry`, `walkCache`, `RegistryValidationError`).
- **No new tests required.** This is a refactor, not a feature. The rule from `collaboration.md` is "tests catch real failure modes" — the existing 13 test files already cover the surface; adding more would be tautological.

## 10. Anti-duplication audit (verification gate)

Before merging, run:

```sh
grep -rn 'fetchRegistry\|REGISTRY_URL_DEFAULT\|resolveRegistryUrl\|groupByCoord\|resolveLatest' packages/ --include='*.ts' | grep -v dist | grep -v node_modules
grep -rn 'walkCache\|CachedEntry'                packages/ --include='*.ts' | grep -v dist | grep -v node_modules
grep -rn 'RegistryFetchError\|RegistryValidationError' packages/ --include='*.ts' | grep -v dist | grep -v node_modules
```

Expected outcome: each symbol appears in exactly one source-of-truth `.ts` file under `packages/registry/src/`, plus consumer imports under `packages/cli/src/` and any test file. Zero entries under `packages/cli/src/lib/` (the entire folder is gone). Any other appearance is a regression and must be resolved before merge.

## 11. Out-of-scope follow-ups

- Phase 6 (`aia workflow list/run/check`) — the next planned phase. Drops 3 new slices into `commands/workflow/`. Does not touch phase 5 output.
- Adding `joinZodPath` (currently exported from `check-manifest.ts`) to `_shared/` — defer until a second slice consumes it.
- Tightening the `EXIT_BY_BRICK_ERROR` table types so a new brick error forces an exhaustive update — defer; manageable as a small typed lookup until ≥10 entries.

## 12. References

- Master spec: [`2026-05-09-architecture-restructure-design.md`](./2026-05-09-architecture-restructure-design.md) §7.10, §8, §10, §13.
- Collaboration protocol: [`.claude/rules/collaboration.md`](../../../.claude/rules/collaboration.md) — multi-component merge, lessons MS1.5 / MS1.7.
- Engineering principles: [`.claude/rules/engineering-principles.md`](../../../.claude/rules/engineering-principles.md) — SRP/ISP, fail-fast, no autonomous lifecycle mutation.
- Vertical Slice Architecture (Bogard) — couple along axis of change.
- Predecessor phase 4 plan: [`2026-05-09-phase-4-runtime-split.md`](../plans/2026-05-09-phase-4-runtime-split.md).
