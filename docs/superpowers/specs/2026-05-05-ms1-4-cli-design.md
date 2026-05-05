# MS1.4 — CLI Scaffold (`@aiactions/cli`, bin `aia`) — Design

**Date:** 2026-05-05
**Status:** Designed.
**Predecessor:** MS1.3 (`claude/agent@v1` shipped 2026-05-05, commit `2823281`).
**Successor:** MS1.5 (catalog + name resolution).

## Goal

Ship the first user-facing surface of AIactions: a published npm CLI
named `aia` that lets a developer manage the local actions cache without
touching internal runtime APIs. MS1.4 covers the scaffold (build, bin,
help, error handling, tests) plus three cache-management verbs:
`action install`, `action list`, `action uninstall`. Subsequent
milestones extend the CLI surface — see the roadmap in
`Decomposition` below.

## Non-goals

- **Catalog & name resolution** — `aia action install <name>` (short name,
  no namespace/version), `aia action install` with no arg + multi-select
  picker, and `aia action list` with installed-vs-available badges all
  depend on a published catalog. Deferred to MS1.5.
- **Local validation** — `aia action check <name>` and
  `aia workflow check <name>` parse local YAML against existing schemas
  but require workflow discovery + nicer error formatting. Deferred to
  MS1.6.
- **Workflow execution** — `aia workflow run <name>` and
  `aia workflow list` need workflow discovery + lockfile read-back +
  end-to-end runtime invocation. Deferred to MS1.7.
- **Garbage collection** — `aia action gc` (prune cache entries no
  longer referenced by any project lockfile) needs lockfile read-back.
  MS1.5+.
- **Bun launcher constraint** — the original launcher rule
  (`01KQS3R4HXF6J53VS53WQS1QY8`) was written assuming a Bun-native bin.
  MS1.4 adopts Node-only as the consumer prerequisite (memory
  `01KQWNWR83PE0CS6BCED12S9FE`), so the launcher is naturally safe. Bun
  detection for performance optimisation is out of scope here.

## Decomposition (full CLI roadmap)

| Milestone | Scope                                                             | Prerequisites                        |
| --------- | ----------------------------------------------------------------- | ------------------------------------ |
| **MS1.4** | Scaffold + `action install/list/uninstall` (cache-only)           | none                                 |
| MS1.5     | Catalog (`actions/index.json`) + name resolution + `action check` | catalog design                       |
| MS1.6     | `workflow check` (local validation)                               | workflow discovery                   |
| MS1.7     | `workflow list/run` (execution)                                   | lockfile read-back, error formatting |

Source: muninn `01KQWR6QJSZJN4PNVYQ79T5070`.

## Brainstorm decisions (Q1-Q7)

| #   | Question           | Decision                                                                       |
| --- | ------------------ | ------------------------------------------------------------------------------ |
| Q1  | Workspace location | `packages/cli/` (consumer-facing, parity with `runtime`/`workflows`)           |
| Q2  | Argv parser        | `citty` + `@clack/prompts` (router + interactive prompts)                      |
| Q3  | Runtime target     | Node-only (`engines.node >= 22.12.0`); Bun = dev only, optional perf detection |
| Q4  | Initial scope      | Triplet `install/list/uninstall`                                               |
| Q5  | Roadmap            | Decompose into MS1.4 → MS1.5 → MS1.6 → MS1.7                                   |
| Q6  | Bin name           | `aia` only (gh-style short single binary)                                      |
| Q7  | `uninstall` no-arg | `clack.multiselect` over local cache when TTY                                  |

Memories persisted: `01KQWNWR83PE0CS6BCED12S9FE` (Node-only),
`01KQWR6QJRJYN6XVXJY614KMS1` (bin name),
`01KQWR6QJRQKVZPAS0VRQHKDQE` (catalog approach),
`01KQWR6QJR2T1PSMAS9PEBC03H` (workflow discovery roots).

## Architecture & package layout

```
packages/cli/
├── package.json                  # @aiactions/cli, "bin": { "aia": "./dist/cli.mjs" }
├── tsconfig.json
├── vite.config.ts                # extends root, pack.exports, pack.dts.tsgo
├── src/
│   ├── cli.ts                    # entry — citty defineCommand(main), runMain
│   ├── commands/
│   │   ├── action/
│   │   │   ├── install.ts        # action install <ref>
│   │   │   ├── list.ts           # action list
│   │   │   ├── uninstall.ts      # action uninstall [<ref>]
│   │   │   └── index.ts          # citty parent command "action"
│   │   └── index.ts              # registers root subcommands
│   ├── lib/
│   │   ├── registry-root.ts      # resolveRegistryRoot() → ~/.aiactions/actions
│   │   ├── parse-registry-ref.ts # parses via usesRefSchema, narrows to RegistryRef
│   │   ├── walk-cache.ts         # depth-3 readdir → CachedEntry[]
│   │   ├── output.ts             # printers — human (clack) + JSON
│   │   ├── exit-codes.ts         # EXIT.{OK,RUNTIME,USAGE,NOT_FOUND,CONFLICT}
│   │   └── errors.ts             # CliError, UsageError, NotFoundError
│   └── (no programmatic index — tests import internal modules via workspace src)
├── bin/
│   └── aia.mjs                   # 1-line shebang shim importing dist/main.mjs
└── tests/
    ├── parse-registry-ref.test.ts
    ├── install.test.ts
    ├── list.test.ts
    ├── uninstall.test.ts
    ├── bin-integration.test.ts
    └── fixtures/                 # symlink/copy of runtime fixtures
```

### Dependencies

- `citty` (argv router)
- `@clack/prompts` (interactive UX)
- `@aiactions/runtime` (workspace:\*) — for `ensureCachedAction`,
  `RegistryCoordinate`
- `@aiactions/workflows` (workspace:\*) — for `usesRefSchema`,
  `RegistryRef`
- `zod` — transitive via workflows; not a direct dep

### Bin & build

- `package.json` declares `"bin": { "aia": "./bin/aia.mjs" }`. The shim
  is a committed 1-line `import "../dist/main.mjs"` with shebang
  `#!/usr/bin/env node` — keeps the bin contract independent from
  bundler shebang/chmod handling and works cross-platform under npm
  install (which generates Windows `.cmd` shims automatically).
- Build via `vp pack` (tsdown). Single entry `src/cli.ts` →
  `dist/main.mjs`. All workspace + npm deps bundled (`alwaysBundle`).
- Source-as-exports is **not** used — published tarball must run on
  Node consumers without a TS toolchain.
- `engines.node: ">=22.12.0"`. No `engines.bun`.

### Public API change in `@aiactions/runtime`

`ensureCachedAction` and supporting types must be promoted from internal
to public. Add to `packages/runtime/src/index.ts`:

```ts
export {
  ensureCachedAction,
  type RegistryCoordinate,
  type EnsureCachedActionResult,
  type EnsureCachedActionOptions,
} from "./runner/uses/registry-fetch.ts";
```

The lockfile internals (`appendLockfileEntry`,
`AppendLockfileEntryRequest`) and the lower-level `fetchActionFromCanonical`
remain internal.

## Commands & UX

### gh-inspired patterns

- Resource-verb invocation: `aia action install`.
- Human output by default; `--json` flag per-command for scripting.
- TTY-aware: `clack` prompts when `process.stdout.isTTY`, else
  non-interactive strict mode.
- Status icons via `clack.log.{success,error,info}` — suppressed when
  `--json`.
- Help layout grouped by core command:

  ```
  USAGE
    aia <command> <subcommand> [flags]

  CORE COMMANDS
    action install <ref>      Install action from registry
    action list               List installed actions
    action uninstall [<ref>]  Uninstall an action

  GLOBAL FLAGS
    --help, -h                Show help
    --version, -V             Show version
  ```

### `aia action install <ref> [--json]`

1. Parse `<ref>` via `usesRefSchema`. Narrow to `RegistryRef`. Local refs
   raise `UsageError` ("install only supports registry refs
   `<ns>/<name>@<ver>`"). Bad format raises `UsageError`.
2. Project to `RegistryCoordinate { namespace, name, version }`.
3. Resolve `registryRoot = ~/.aiactions/actions`, `cwd = process.cwd()`.
4. `clack.spinner` while awaiting `ensureCachedAction(...)` (skip if
   `--json` or non-TTY).
5. Cache hit (`fetched: false`) → `✓ already cached <ref>` (path in
   muted style). Exit 0.
6. Cache miss + fetch OK → `✓ installed <ref> (sha <resolvedSha>)`.
   Exit 0.
7. Fetch error → top-level handler surfaces, exit 1.
8. `--json` mode emits `{ref, dir, fetched, resolvedSha}` on stdout.

### `aia action list [--json]`

1. Walk `~/.aiactions/actions/<ns>/<name>/<ver>/` at depth 3.
2. Empty cache → `no cached actions` on stderr, exit 0.
3. Default human output: 4-column table (`NAMESPACE NAME VERSION PATH`)
   aligned via `padEnd`. No table library.
4. `--json` → array of `{namespace, name, version, dir}`.
5. No "installed badge" in MS1.4 (no catalog yet).

### `aia action uninstall [<ref>] [--yes] [--json]`

Behaviour matrix:

| Arg     | TTY | `--yes` | Action                                                                       |
| ------- | --- | ------- | ---------------------------------------------------------------------------- |
| `<ref>` | \*  | yes     | parse, verify, delete                                                        |
| `<ref>` | yes | no      | parse, verify, `clack.confirm`; reject = exit 0, accept = delete             |
| `<ref>` | no  | no      | `UsageError` "refusing destructive op without --yes"                         |
| absent  | yes | \*      | `multiselect` over cache, group `confirm` (skipped if `--yes`), delete picks |
| absent  | no  | \*      | `UsageError` "ref required in non-interactive mode"                          |

- Missing ref → `NotFoundError`, exit 4.
- Successful delete: `rm -rf <root>/<ns>/<name>/<ver>`. Prune empty
  parent (`<ns>/<name>/`, then `<ns>/`). Never touch `<root>` itself.
- Lockfile (`<cwd>/.aiactions/actions.lock.json`) is **not** modified —
  remains write-only in MS1.4. Garbage tracking lives in MS1.5+.
- `--json` mode: requires `<ref>(s)` + `--yes`; suppresses all
  interactivity. Missing either raises `UsageError`. Output:
  `{removed: [{ref, dir}, ...], skipped: []}`.
- `clack` cancel in interactive flows = exit 0 (user opt-out, not
  error).

## Data flow

```
shell argv
  ↓ #!/usr/bin/env node
node dist/cli.mjs
  ↓
src/cli.ts                                       runMain(mainCommand)
  ↓
src/commands/index.ts                            subCommands
  ↓
src/commands/action/<verb>.ts                    citty defineCommand
  ↓
src/lib/* helpers                                parse, resolve, walk
  ↓
@aiactions/runtime · ensureCachedAction          (install only)
  fs operations                                  (list, uninstall)
  ↓
src/lib/output.ts                                clack.log | JSON.stringify
  ↓
process.stdout / stderr / exitCode
```

### Side effects

- **Reads:** `~/.aiactions/actions/**`, `process.env.HOME`,
  `process.stdout.isTTY`.
- **Writes:**
  - `install` creates `<root>/<ns>/<name>/<ver>/` and appends to
    `<cwd>/.aiactions/actions.lock.json` (via `ensureCachedAction`).
  - `uninstall` removes `<root>/<ns>/<name>/<ver>` and prunes empty
    parents up to (but excluding) `<root>`.
  - `list` performs no writes.
- **Network:** `install` cache miss triggers `git fetch` via
  `fetchActionFromCanonical` (transparent, inside `ensureCachedAction`).
- **Lockfile read-back:** none in MS1.4.

### Determinism

Tests inject `process.env.HOME` (cache root isolation), force
`process.stdout.isTTY = false` (non-interactive deterministic mode),
and pass `now: () => new Date(0)` where lockfile timestamps matter.
No non-mocked network in unit tests; bin integration uses bare-repo
fixture only.

### Test/dev knob — `AIACTIONS_CANONICAL_URL`

The `install` command reads `process.env.AIACTIONS_CANONICAL_URL` and,
when set, passes it through to `ensureCachedAction` as
`options.canonicalUrl`. Used by bin integration tests to point at a
local bare-repo fixture without network. Undocumented in user-facing
help; the variable name is intentionally explicit so it is greppable.

## Error handling

### Exit codes

| Code | Symbol      | Trigger                                                                                            |
| ---- | ----------- | -------------------------------------------------------------------------------------------------- |
| 0    | `OK`        | success, or no-op (cache hit, empty list, user-cancel)                                             |
| 1    | `RUNTIME`   | runtime failure (network, fs IO, lockfile write)                                                   |
| 2    | `USAGE`     | bad argv, malformed ref, local ref for install, missing arg in non-TTY, missing `--yes` in non-TTY |
| 4    | `NOT_FOUND` | `uninstall <ref>` against absent cache entry                                                       |
| 5    | `CONFLICT`  | reserved for MS1.5 (`--no-overwrite`) — unused in MS1.4                                            |

### Error class hierarchy

```ts
// src/lib/errors.ts
export class CliError extends Error {
  constructor(
    public readonly code: number,
    message: string,
    public readonly cause?: unknown,
  ) {
    super(message);
    this.name = "CliError";
  }
}

export class UsageError extends CliError {
  constructor(message: string) {
    super(EXIT.USAGE, message);
  }
}

export class NotFoundError extends CliError {
  constructor(message: string) {
    super(EXIT.NOT_FOUND, message);
  }
}
```

### Top-level handler in `cli.ts`

```ts
try {
  await runMain(mainCommand);
} catch (err) {
  if (err instanceof CliError) {
    process.stderr.write(`✖ ${err.message}\n`);
    if (process.env.AIA_DEBUG && err.cause) {
      process.stderr.write(`${(err.cause as Error)?.stack ?? err.cause}\n`);
    }
    process.exit(err.code);
  }
  process.stderr.write(`✖ ${(err as Error).message}\n`);
  if (process.env.AIA_DEBUG) process.stderr.write(`${(err as Error).stack}\n`);
  process.exit(EXIT.RUNTIME);
}
```

- **No silent fallback.** Every exception becomes a non-zero exit.
- **Stack hidden by default.** Set `AIA_DEBUG=1` to see causes.

### `--json` and errors

Errors always go to stderr in plain text + non-zero exit. Stdout stays
either valid JSON or empty. No `{"error": ...}` envelope on stdout.

## Testing strategy

### Three layers

1. **Unit** — pure helpers (`parseRegistryRef`, `walkCache`,
   `resolveRegistryRoot` with `HOME` injection).
2. **Command unit** — each `defineCommand` invoked programmatically with
   mocked args, fs, network. Asserts on exit code, captured
   stdout/stderr, expected fs state.
3. **Bin integration** — spawn `node dist/cli.mjs` with isolated
   `HOME=<tmp>`, bare-repo fixture (`make-bare-repo.ts`), assert
   observable effects.

### TDD policy

Tests cover paths that can regress: argv parsing, exit codes, fs side
effects, JSON schema. Skip tautological assertions
(`expect(console.log).toHaveBeenCalledWith(literal)`).

### Common helpers

- `withTempHome()` — creates tmpdir, sets `process.env.HOME`, returns
  `{ home, cleanup }`.
- `runCli(args, env?)` — exec `node dist/cli.mjs ...args`, returns
  `{ exitCode, stdout, stderr }`. Requires prior `vp run -r build`.
- TTY mock — `tty.isatty(1) = false` by default in tests; for
  interactive tests, `vi.mock("@clack/prompts")`.
- `make-bare-repo.ts` — copy from
  `packages/runtime/tests/fixtures/registry/make-bare-repo.ts` (rule of
  three not yet met → no extraction to `@aiactions/test-fixtures` in
  MS1.4).

### Test files

| File                         | Coverage                                                                               |
| ---------------------------- | -------------------------------------------------------------------------------------- |
| `parse-registry-ref.test.ts` | valid registry ref, local ref rejection, bad format                                    |
| `install.test.ts`            | cache hit, cache miss with bare-repo, bad ref, `--json`, network error                 |
| `list.test.ts`               | empty cache, populated cache (table + JSON)                                            |
| `uninstall.test.ts`          | ref + `--yes`, ref absent, no-arg + non-TTY, no-arg + TTY (mocked multiselect), cancel |
| `bin-integration.test.ts`    | `aia --version`, end-to-end install with bare-repo                                     |

### Verification gate

- `vp test` from `packages/cli` — package tests pass.
- `vp run ready` from root — `check` + recursive `test` + recursive
  `build`, including the new package.
- CI runs `vp run ready` (existing pipeline).

## Open questions

None at design time. All decisions captured in muninn or above.

## Migration / rollback

- **Migration:** new package, no existing consumers. Runtime API change
  is additive (re-exports already-internal symbols). No migration
  required.
- **Rollback:** revert the squash-merge commit on `main`. Cache files
  in `~/.aiactions/actions/` produced by the CLI are byte-identical to
  what `ensureCachedAction` already produces from workflow runs — no
  data layout change.

## References

- MS1.2 design: `docs/superpowers/specs/2026-05-05-ms1-2-registry-fetch-design.md`
- MS1.3 (claude-agent action) design: `docs/superpowers/specs/2026-05-05-claude-agent-action-design.md`
- Memory `01KQWNWR83PE0CS6BCED12S9FE` — Node-only consumer prerequisite
- Memory `01KQWR6QJRJYN6XVXJY614KMS1` — bin name `aia`
- Memory `01KQWR6QJRQKVZPAS0VRQHKDQE` — catalog static `index.json`
- Memory `01KQWR6QJR2T1PSMAS9PEBC03H` — workflow discovery roots
- Memory `01KQWR6QJSZJN4PNVYQ79T5070` — MS1.4-1.7 roadmap
- Memory `01KQS3R4HXF6J53VS53WQS1QY8` — original launcher env-strip rule
  (superseded by `01KQWNWR83PE0CS6BCED12S9FE`)
- Memory `01KQTFZ34E03CNF8ZSNWCCVTPK` — canonical actions URL
