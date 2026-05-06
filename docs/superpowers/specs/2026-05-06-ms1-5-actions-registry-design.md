# MS1.5 — Actions Registry Backend — Design

**Date:** 2026-05-06
**Status:** Designed.
**Predecessor:** MS1.4 (`@aiactions/cli` shipped 2026-05-06, commit `6417215`).
**Successor:** MS1.6 (frontend CLI consumes registry).

## Goal

Stand up the public **actions registry** for `aperrix/aiactions`: a static
`actions/registry.json` file that lists every published action with its
canonical ref and a short description. The file is regenerated on every
commit that touches `actions/`, kept honest by a CI backstop, and feeds
the CLI (in MS1.6) for short-name install + multi-select pickers +
list-with-installed-badge.

In addition, this milestone introduces **release-please**-driven
versioning across all releasable artifacts (actions and packages alike),
locks in a per-action git tag scheme `<ns>/<name>@v<version>`, and
refactors `fetchActionFromCanonical` to construct that tag from the
parsed registry coordinate.

## Non-goals

- **Frontend CLI consumption** — `aia action install <name>` (short
  name), no-arg multi-select picker, `aia action list` with
  `[installed]` badge. All deferred to MS1.6.
- **`aia action check`** — local manifest validation. Independent of
  this milestone, deferred to MS1.7.
- **Workflow surface** — `aia workflow check/list/run`. Deferred to
  MS1.8 / MS1.9.
- **Composite actions** — the sharing mechanism for "complete
  workflows". Concept locked (memory `01KQX5SWHFNPH73A40BK125GND`),
  mechanics deferred to a dedicated brainstorm.
- **Multi-version registry entries** — registry exposes one entry per
  action at the latest released version. Older versions remain
  installable via explicit ref but do not appear in the picker.
- **Consumer-side cache strategy** — when MS1.6 lands, it will pick a
  fetch/cache policy for `registry.json` (TTL vs always-fresh).

## Brainstorm decisions

| #   | Question                  | Decision                                                                                                                                       |
| --- | ------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| Q1  | Scope decomposition       | Decompose: MS1.5 backend / MS1.6 frontend CLI / MS1.7 `action check`                                                                           |
| Q2  | Registry schema           | `{ actions: [{ ref, description }] }` — ref + description, nothing else                                                                        |
| Q3  | Emitter location          | `scripts/gen-actions-registry.ts` (parity with `gen-schemas.ts`)                                                                               |
| Q4  | Stale-prevention strategy | lefthook pre-commit (`stage_fixed: true`) + CI PR backstop                                                                                     |
| Q5  | Manifest reader           | `package.json.name` / `description` / `version` as canonical metadata; aiaction.yaml keeps `name` + `description` for runtime contract         |
| Q6  | Version source            | `package.json.version` (release-please bumps it). Registry ref omits the `v` prefix; tag uses it                                               |
| Q7  | Tag pattern               | `<ns>/<name>@v<version>` (e.g. `claude/agent@v1.0.0`); release-please introduced now                                                           |
| Q8  | release-please scope      | Tracks **both** actions and packages — 4 components initially (`@aiactions/runtime`, `@aiactions/workflows`, `@aiactions/cli`, `claude/agent`) |

References:

- Roadmap: muninn `01KQX6GV6EZR3C2H33KX1R70CY` (evolved from `01KQWR6QJSZJN4PNVYQ79T5070`).
- Catalog path locked: muninn `01KQX5SEVY8YT3VAZ6T0SNR21M` (evolved from `01KQWR6QJRQKVZPAS0VRQHKDQE`).
- Workflows local-only (no registry): muninn `01KQX5SWHFNPH73A40BK125GND`.
- MS1.4 shipped: muninn `01KQX44NTJ305DT41V1DZM9ZMV`.

## Architecture & file layout

```
.github/workflows/
├── release-please.yml              # NEW — googleapis/release-please-action@v4
└── registry-check.yml              # NEW — PR backstop: regen + git diff --exit-code

actions/
├── claude/agent/
│   ├── package.json                # MODIFIED — name → @claude/agent, +description, version → 1.0.0
│   ├── aiaction.yaml               # unchanged (keeps name + description)
│   └── ...
└── registry.json                   # NEW — emitted by scripts/gen-actions-registry.ts

scripts/
├── gen-schemas.ts                  # existing
└── gen-actions-registry.ts         # NEW — emitter

packages/runtime/src/runner/uses/
└── registry-fetch.ts               # MODIFIED — build tag from coord

# repo root
├── lefthook.yml                    # NEW — pre-commit hook
├── release-please-config.json      # NEW
├── .release-please-manifest.json   # NEW — initial versions for 4 components
└── package.json                    # MODIFIED — postinstall extended with `lefthook install`
```

## Components

### `release-please-config.json`

```jsonc
{
  "$schema": "https://raw.githubusercontent.com/googleapis/release-please/main/schemas/config.json",
  "release-type": "node",
  "tag-separator": "@",
  "include-component-in-tag": true,
  "bootstrap-sha": "6417215d52c04a8bbd632d49a6d83ac8ce8b32dc",
  "packages": {
    "packages/runtime": { "component": "@aiactions/runtime" },
    "packages/workflows": { "component": "@aiactions/workflows" },
    "packages/cli": { "component": "@aiactions/cli" },
    "actions/claude/agent": { "component": "claude/agent" },
  },
  "plugins": ["node-workspace"],
}
```

Tags emitted by release-please:

- `@aiactions/runtime@v0.1.0`
- `@aiactions/workflows@v0.1.0`
- `@aiactions/cli@v0.1.0`
- `claude/agent@v1.0.0`

### `.release-please-manifest.json`

```json
{
  "packages/runtime": "0.0.0",
  "packages/workflows": "0.0.0",
  "packages/cli": "0.0.0",
  "actions/claude/agent": "1.0.0"
}
```

`claude/agent` starts at `1.0.0` to acknowledge the version that
shipped at MS1.3 (legacy tag `v1`). Other components start at `0.0.0`
so the first release-please run computes bumps from
Conventional-Commit history since `bootstrap-sha`.

### `lefthook.yml`

```yaml
pre-commit:
  parallel: true
  jobs:
    - name: regenerate-actions-registry
      glob: "actions/**"
      run: bun run scripts/gen-actions-registry.ts
      stage_fixed: true
```

`stage_fixed: true` is the lefthook option that re-stages files
modified by the command — no explicit `git add` needed. The hook fires
only when staged paths match `actions/**`.

### `scripts/gen-actions-registry.ts`

Refactored as a pure exported function plus a thin `main()` for CLI
use; the export is what tests target.

```ts
import { readdir, readFile, writeFile } from "node:fs/promises";
import { resolve, join } from "node:path";

import { parse as parseYaml } from "yaml";
import { actionManifestSchema } from "@aiactions/workflows";

export interface RegistryEntry {
  readonly ref: string;
  readonly description: string;
}

export interface Registry {
  readonly actions: RegistryEntry[];
}

export async function emitRegistry(actionsDir: string): Promise<Registry> {
  const entries: RegistryEntry[] = [];
  const namespaces = await readdir(actionsDir, { withFileTypes: true });
  for (const ns of namespaces) {
    if (!ns.isDirectory()) continue;
    const names = await readdir(join(actionsDir, ns.name), { withFileTypes: true });
    for (const name of names) {
      if (!name.isDirectory()) continue;
      const dir = join(actionsDir, ns.name, name.name);
      const pkgRaw = await readFile(join(dir, "package.json"), "utf8");
      const pkg = JSON.parse(pkgRaw) as { name: string; version: string; description?: string };
      const yamlRaw = await readFile(join(dir, "aiaction.yaml"), "utf8");
      actionManifestSchema.parse(parseYaml(yamlRaw));
      const expected = `@${ns.name}/${name.name}`;
      if (pkg.name !== expected) {
        throw new Error(`${dir}/package.json name '${pkg.name}' must equal '${expected}'`);
      }
      if (!pkg.description) {
        throw new Error(`${dir}/package.json must have a description`);
      }
      entries.push({
        ref: `${ns.name}/${name.name}@${pkg.version}`,
        description: pkg.description,
      });
    }
  }
  entries.sort((a, b) => a.ref.localeCompare(b.ref));
  return { actions: entries };
}

const ROOT = resolve(import.meta.dirname, "..");
const ACTIONS_DIR = resolve(ROOT, "actions");

if (import.meta.main) {
  const registry = await emitRegistry(ACTIONS_DIR);
  const out = `${JSON.stringify(registry, null, 2)}\n`;
  await writeFile(join(ACTIONS_DIR, "registry.json"), out);
  console.log(`wrote ${join(ACTIONS_DIR, "registry.json")} (${registry.actions.length} actions)`);
}
```

### `.github/workflows/release-please.yml`

```yaml
name: release-please
on:
  push:
    branches: [main]
permissions:
  contents: write
  pull-requests: write
jobs:
  release-please:
    runs-on: ubuntu-latest
    steps:
      - uses: googleapis/release-please-action@v4
        with:
          token: ${{ secrets.GITHUB_TOKEN }}
          config-file: release-please-config.json
          manifest-file: .release-please-manifest.json
```

### `.github/workflows/registry-check.yml`

```yaml
name: registry-check
on:
  pull_request:
    paths:
      - "actions/**"
      - "scripts/gen-actions-registry.ts"
jobs:
  verify:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: voidzero-dev/setup-vp@v1
      - run: vp install
      - run: bun run scripts/gen-actions-registry.ts
      - run: git diff --exit-code actions/registry.json
```

### Refactor `fetchActionFromCanonical`

Existing implementation passes `<version>` raw as `--branch` to `git
clone`. Change: build the tag from the parsed coordinate.

```ts
// Before
const tag = ref.version;

// After
const tag = `${ref.namespace}/${ref.name}@v${ref.version}`;
```

Public API of `ensureCachedAction` is unchanged: callers pass
`version: "1.0.0"` (without `v`); the runtime adds the `v` only when
constructing the git tag.

### Migration of `claude/agent` (one-shot pre-MS1.5)

1. Rename `actions/claude/agent/package.json.name`:
   `@aiactions-public/claude-agent` → `@claude/agent`.
2. Add `description` to `actions/claude/agent/package.json` (text
   sourced from `aiaction.yaml` description field).
3. Bump `actions/claude/agent/package.json.version` from `0.0.0` to
   `1.0.0`.
4. Re-tag: `git tag claude/agent@v1.0.0 <ms1.3-commit-sha>` then
   `git push --tags`. Keep the legacy `v1` tag for backward
   compatibility — do not force-delete it.
5. Update every `@aiactions-public/claude-agent` reference (tests,
   docs, fixtures) to `@claude/agent`.

## Data flow

### Author edits an action (Flow A)

```
git add actions/claude/agent/...
git commit -m "feat(claude/agent): ..."
  ↓
lefthook pre-commit fires (glob actions/**)
  ↓
bun run scripts/gen-actions-registry.ts
  ↓
walks actions/<ns>/<name>/, reads pkg.json + validates aiaction.yaml
  ↓
emits actions/registry.json (sorted by ref)
  ↓
lefthook stage_fixed: re-stages actions/registry.json
  ↓
commit succeeds with registry updated
```

### PR review (Flow B)

```
PR opened/updated touching actions/** or scripts/gen-actions-registry.ts
  ↓
GH Action registry-check.yml triggers
  ↓
checkout → vp install → run emitter → git diff --exit-code
  ↓
exit 0 → check pass; non-zero → check fail (registry stale)
```

### release-please (Flow C)

```
Conventional commit on main: "feat(cli): foo" / "fix(claude/agent): bar"
  ↓
release-please.yml triggers on push to main
  ↓
release-please-action computes bumps per component (filter by commit scope)
  ↓
opens/updates "chore: release" PR with version bumps + CHANGELOG entries
  ↓
human merges release PR
  ↓
release-please-action creates tags (claude/agent@v1.1.0, @aiactions/cli@v0.2.0, ...)
  ↓
release-please.yml triggers again post-merge, creates GitHub Releases
```

### Consumer install (Flow D — preview, MS1.6+)

```
$ aia action install claude/agent@1.0.0
  ↓
parseRegistryRef → coord {ns: claude, name: agent, version: "1.0.0"}
  ↓
ensureCachedAction(coord, root, cwd)
  ↓
fetchActionFromCanonical builds tag = "claude/agent@v1.0.0"
  ↓
git clone --filter=blob:none --depth=1 --branch claude/agent@v1.0.0 https://github.com/aperrix/aiactions
  ↓
sparse-checkout actions/claude/agent
  ↓
move into ~/.aiactions/actions/claude/agent/1.0.0/
  ↓
return resolvedSha + cache dir
```

MS1.5 ships only Flows A + B + C plus the runtime tag-construction
refactor (the "builds tag" step in D). Flow D end-to-end consumption
of `registry.json` lands in MS1.6.

### Determinism

- Emitter is pure — input = filesystem state, output = stable JSON
  sorted by `ref`. Idempotent.
- `git diff --exit-code` is byte-exact comparison.
- release-please is deterministic for a given commit history.

## Error handling

### Emitter

- Manifest invalid (Zod throws) → exit 1, surfaces parse error.
- `package.json` missing → unhandled `ENOENT`, exit 1.
- `package.json.name ≠ @<ns>/<name>` → explicit throw with both names.
- `package.json.description` missing → explicit throw.
- Unknown directory entries (files at the `actions/<ns>/` level) →
  silently filtered via `isDirectory()`.

No silent fallback. Every error becomes a non-zero exit (engineering
principle: fail fast).

### Lefthook

- Emitter exit non-zero → lefthook returns non-zero → commit aborts.
- Bypass via `--no-verify` → CI backstop catches stale registry on PR.
- Lefthook not installed (contributor missed `vp install`
  postinstall) → CI backstop catches the same way.

### CI registry-check

- Non-empty diff → fails with message
  `"registry.json out of sync; run 'bun run scripts/gen-actions-registry.ts' and re-commit"`.
- Emitter throws → fails with stderr surfaced.
- Path filter avoids running on PRs that don't touch the relevant files.

### release-please

- First run uses `bootstrap-sha = 6417215` (MS1.4 commit) to bound
  history.
- claude/agent already shipped → bootstrap manifest pins it at
  `1.0.0`; release-please sees the matching tag and skips re-release.
- Multi-component PRs (e.g. `feat(cli)` + `feat(runtime)`) → release
  PR groups bumps by component scope (Conventional Commits).
- Legacy `v1` tag is kept as an alias and is never used by post-MS1.5
  code paths.

### Refactor `fetchActionFromCanonical`

- Existing tests pass `version: "v1.0.0"` (with `v`) — refactor adds
  `v` itself, so those tests must update to `version: "1.0.0"`.
  Bare-repo fixture's `tag` argument updates to
  `<ns>/<name>@v<version>` matching the new construction.
- CLI tests `packages/cli/tests/install.test.ts` and
  `bin-integration.test.ts` update their fixture's `tag` argument and
  the install ref string accordingly.

### Rollback

- `git revert` of the squash MS1.5 commit restores MS1.4 state.
- Legacy `v1` tag remains; CLI MS1.4 callers (if any pinned to `v1`)
  keep working.
- New `claude/agent@v1.0.0` tag becomes orphan but is harmless.
- `actions/registry.json` is removed by the revert.

## Testing strategy

### Three layers

1. **Emitter unit** — tests against a tmpdir fixture filesystem.
2. **Runtime regression** — existing `runner-uses-registry-fetch.test.ts`
   and CLI install tests update to new tag format.
3. **CI smoke** — manual verification on the merge PR.

### Emitter unit (`scripts/gen-actions-registry.test.ts`)

Test cases:

- Empty `actions/` → `{ actions: [] }`.
- Single valid action → 1 entry with correct ref + description.
- Multiple actions → entries sorted lexicographic by `ref`.
- Invalid manifest → throws.
- Mismatched package name → throws.
- Missing description → throws.
- Idempotent: run twice, output identical.

Setup: each test crafts a tmpdir with the minimum set of
`actions/<ns>/<name>/{package.json,aiaction.yaml}` files and calls
`emitRegistry(tmpdir)` directly.

### Runtime regression

- `packages/runtime/tests/runner-uses-registry-fetch.test.ts`: update
  `makeBareRepoWithAction` calls to use `tag: "<ns>/<name>@v<ver>"`
  format and `version` argument without the `v`. Verify
  `result.dir = <root>/<ns>/<name>/<version>` (no `v` in cache path).
- `packages/cli/tests/install.test.ts` and `bin-integration.test.ts`:
  same fixture and ref updates.

Add one new runtime test: tag construction is exactly
`${ns}/${name}@v${version}` (string-level assertion to lock format).

### CI workflow smoke (manual, post-merge)

1. Lefthook smoke: locally edit `actions/claude/agent/aiaction.yaml`,
   commit, verify `actions/registry.json` is re-staged automatically
   in the same commit.
2. CI backstop smoke: open a PR that modifies `actions/` without
   running the emitter; verify `registry-check` fails. Push a fix;
   verify it passes.
3. release-please smoke: after merging the MS1.5 PR, verify
   release-please opens a `chore: release` PR with sensible bumps and
   the expected tag preview.

### TDD policy

- Tests for emitter (real logic that can regress).
- Tests for `fetchActionFromCanonical` refactor (existing, just
  updated).
- No tests for lefthook config, CI YAML, or release-please config —
  external declarative tools, validated by smoke run.

### Verification gate

- `vp run ready` (workspace check + recursive build + recursive test)
  green, including emitter unit tests and runtime regression.
- `bun run scripts/gen-actions-registry.ts` succeeds locally and is
  idempotent (run twice → same output).
- `git diff --exit-code actions/registry.json` clean post-run
  (simulates CI backstop locally).
- First merge to `main` opens a release-please PR — confirms config.

## Open questions

- **release-please exact tag format.** The release-please default tag
  template is `<component>-v<version>`. With `tag-separator: "@"` it
  should become `<component>@v<version>`, matching our desired
  `<ns>/<name>@v<version>` once components are named with `/`. If the
  resolved release-please version refuses `/` in component names or
  produces a different format, the implementation phase adds a small
  CI bridge step (post-release tag alias) so the public-facing tag is
  always exactly `<ns>/<name>@v<version>`. Validate against the
  installed release-please version during MS1.5 implementation.
- **First release-please run after migration.** With `claude/agent`
  pinned at `1.0.0` in the manifest and the matching tag pre-created
  by hand, the first release PR should propose bumps for the three
  package components only. Confirm by inspecting the opened PR before
  approving it.

## Migration / rollback

- **Migration:** `claude/agent` rename + re-tag is a one-shot,
  documented in the migration step list above. Tests update to match.
- **Rollback:** `git revert` of the MS1.5 squash commit restores
  MS1.4 state; orphan `claude/agent@v1.0.0` tag is harmless and can
  be deleted manually if desired. Legacy `v1` tag stays untouched
  throughout.

## References

- MS1.4 design spec: `docs/superpowers/specs/2026-05-05-ms1-4-cli-design.md`
- MS1.4 implementation plan: `docs/superpowers/plans/2026-05-05-ms1-4-cli-scaffold.md`
- Memory `01KQX6GV6EZR3C2H33KX1R70CY` — full CLI roadmap (MS1.5 → MS1.9)
- Memory `01KQX5SEVY8YT3VAZ6T0SNR21M` — `actions/registry.json` location locked
- Memory `01KQX5SWHFNPH73A40BK125GND` — no workflows registry; composite actions
- Memory `01KQX44NTJ305DT41V1DZM9ZMV` — MS1.4 shipped
- Memory `01KQX2AFT3D8G4DQF4HQX99J2W` — Vitest + citty/consola gotcha
