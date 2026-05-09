# Workflow discovery roots — Design

**Date:** 2026-05-09
**Status:** Designed; implementation pending in a follow-up branch (MS1.9 prerequisite).
**Driver:** muninn `01KR52YB7CJ3S1HSPB3FXJ6W9E` (`next-session-resume-post-ms1.8.5`)
— flagged as action item #2 ("Brainstorm `workflow-discovery-roots`") and a hard
prerequisite for MS1.9 (`aia workflow check`).

## Goal

Define which directories AIactions discovers workflow YAML files from, with what
identity, override, and error semantics, so that downstream commands —
`aia workflow check` (MS1.9) and `aia workflow list/run` (MS1.10) — share one
canonical discovery API.

The result is a public API in `@aiactions/workflows`:

```ts
discoverWorkflows(opts?: { cwd?: string; homeDir?: string }): Promise<DiscoveryResult>
loadWorkflowsFromDir(dir: string, origin: WorkflowOrigin): Promise<DirLoadResult>
findGitRoot(startDir: string): Promise<string>
```

## Non-goals

- **Bundled default workflows shipped with `@aiactions/cli`.** Considered
  (option C in the roots question) and rejected as YAGNI: no curated workflow
  exists yet, and Archon shows that wiring `isBinaryBuild()` into discovery
  permanently couples distribution mode to discovery (`discoverWorkflows`
  cyclomatic complexity 23). Reopen later if and when AIactions ships a
  blessed default set.
- **Recursive walk into subdirectories.** Discovery roots are flat. A
  `<workflowsDir>/experimental/foo.yaml` is silently ignored — same posture as
  GitHub Actions (`.github/workflows/` is flat). Avoids depth caps, name
  collisions across sub-trees, and accidental traversal into `node_modules` if
  a future change ever moves discovery roots up.
- **Filename-based naming convention** (e.g. Archon's `archon-*.yaml`). Adds
  migration debt without a concrete payoff. The directory itself
  (`<root>/.aiactions/workflows/`) is enough scope discrimination; identity
  comes from the filename stem.
- **Workflow source abstraction interface** (e.g. `IWorkflowSource`). The
  implementation has exactly one concrete source today (filesystem); designing
  for a future remote source before it exists is the same anti-pattern that
  produced Archon's `IPlatformAdapter` proliferation. The day a second source
  is needed, refactor — the API surface is small.
- **Configuration knobs for the discovery roots themselves.** No env var, no
  CLI flag, no config file overrides for the root paths. Roots are wired in
  the code; the only test seam is `DiscoverOptions.{cwd,homeDir}`.
- **Symlink-to-symlink chasing or directory symlinks.** Standard Node
  `Dirent.isFile()` semantics apply; broken symlinks emit an `io_error`
  per-file and discovery proceeds.

## Decisions

### D1. Two roots: project + home

Workflows are discovered from two locations, in this order of resolution:

1. **Project root** — `<repoRoot>/.aiactions/workflows/`, where `<repoRoot>` is
   the first ancestor directory of `cwd` containing a `.git` entry (file or
   directory; both are valid since git worktrees use a `.git` _file_).
2. **Home root** — `<homeDir>/.aiactions/workflows/`, where `<homeDir>` is
   `os.homedir()` (overridable via `DiscoverOptions.homeDir` for tests).

The project layer enables repo-scoped workflows under version control. The
home layer enables per-user workflows shared across repos (the concrete use
case: a developer's review or release workflow they want available everywhere
without copy-pasting). Bundled defaults are explicitly excluded (see
non-goals).

This is a deliberate departure from GitHub Actions, which has a single
repo-scoped root. The cross-project sharing case is real for a tool aimed at
developer workflows, and the cost is one extra `loadWorkflowsFromDir` call.

### D2. Flat layout, `*.yaml` ∨ `*.yml`, filename = identity

Inside each root, AIactions reads files matching `*.yaml` or `*.yml` directly
(no subdirectory descent). The filename **stem** is the workflow's identity:

```
.aiactions/workflows/review.yaml   → name = "review"
.aiactions/workflows/release.yml   → name = "release"
.aiactions/workflows/.draft.yaml   → ignored (hidden file)
.aiactions/workflows/notes.txt     → ignored (extension mismatch)
.aiactions/workflows/sub/foo.yaml  → ignored (subdirectory)
```

Filtering rules, in order:

1. `entry.isFile()` must be true. Subdirectories, sockets, broken symlinks
   resolved as non-files are skipped silently — except the broken-symlink case
   (D5).
2. Filename must not start with `.` (skip hidden files).
3. Filename must end in `.yaml` or `.yml` (case-sensitive — POSIX convention).

A workflow is identified by its stem regardless of extension: `review.yaml`
and `review.yml` both produce `name: "review"`.

### D3. Project shadows home; same-name collisions emit `shadowed`

When the same `name` appears in both layers, the **project layer wins**. The
home-layer file is preserved as a `shadowed: { absolutePath, origin }` field
on the resulting `DiscoveredWorkflow`, so consumers can render an explanation
to the user.

```
project: review.yaml  ┐
                      ├─→ DiscoveredWorkflow { name: "review", origin: "project",
home:    review.yaml  ┘                       shadowed: { absolutePath: ".../home/review.yaml",
                                                          origin: "home" } }
```

A second collision case lives **inside one root**: if both `review.yaml` and
`review.yml` exist in the same directory, `.yaml` wins and `.yml` is
**silently dropped** — no `shadowed` entry, no `DiscoveryError`. Within-root
duplicate filenames are treated as an authoring slip rather than a
first-class override mechanism: the user is in a directory they fully
control, and surfacing the dropped file as a shadow note would be noise.
`shadowed` is reserved for the genuinely useful cross-root case
(project hides home).

`@aiactions/workflows` itself does not log shadow events. The `shadowed` field
is the entire signal — the CLI is the renderer (Q3 design revision in section
3 of the brainstorm: SRP forbids libs from doing console I/O).

### D4. Per-file errors are non-blocking; `discoveryResult.errors` aggregates them

A malformed YAML, a schema-invalid workflow, or a graph-invalid workflow does
**not** abort discovery. The faulty file produces a `DiscoveryError` recorded
in `errors[]`; sibling files in both layers are still loaded.

```ts
type DiscoveryErrorKind = "yaml_parse" | "schema_validation" | "graph_validation" | "io_error";
```

`yaml_parse` / `schema_validation` / `graph_validation` map directly to the
three error classes already thrown by `parseWorkflow`
(`WorkflowParseError`, `WorkflowSchemaError`, `WorkflowValidationError`).
`io_error` covers the residual: broken symlink, permission errors on
individual files, etc.

`discoverWorkflows` only throws on:

- `NotInGitRepoError` from `findGitRoot` — repo-resolution failure is
  structural, not per-file.
- Directory-level access errors that are not `ENOENT` (e.g. `EACCES` on
  `<repoRoot>/.aiactions/workflows/`). `ENOENT` on a root directory is
  silently treated as an empty layer; everything else propagates.

### D5. Broken symlinks emit an `io_error`

A `.yaml`-suffixed entry whose `Dirent.isSymbolicLink()` is true and
`Dirent.isFile()` is false (target missing or unreadable) produces a
`DiscoveryError { kind: "io_error" }`. Surfaced rather than silently skipped
because:

- The user explicitly placed the symlink, so failure is actionable.
- Cost is one branch in `loadWorkflowsFromDir`.

Symlinks resolving to a valid file are loaded normally (no special casing).

### D6. Project root resolution: walk up to first `.git`

`findGitRoot(startDir)` walks ancestor directories until it finds an entry
named `.git` (file _or_ directory; worktrees use a `.git` file pointing at a
parent's git dir). It throws `NotInGitRepoError` if it reaches the filesystem
root without finding one.

This anchors AIactions' "project" concept to git, consistent with the
project's "git as a first-class citizen" engineering principle. The choice
also matches GHA's _de facto_ convention — `.github/workflows/` is positioned
relative to the repo root, which is the git root. A non-git AIactions setup
is rejected with a clear error rather than silently falling back to `cwd`,
because nearly every downstream feature (releases, PR creation, branch
hygiene) presupposes git.

### D7. Module placement: `@aiactions/workflows`

The new code lives in `packages/workflows/src/discovery/`, alongside
`parser/` and `schema/`. Discovery is a "filesystem → `Workflow[]`"
transformation — same conceptual layer as parser. `@aiactions/runtime` and
`@aiactions/cli` consume the discovery API; neither owns it.

```
packages/workflows/src/
  discovery/
    discover-workflows.ts      # discoverWorkflows() — orchestrator
    load-from-dir.ts           # loadWorkflowsFromDir()
    find-git-root.ts           # findGitRoot()
    types.ts                   # WorkflowOrigin, DiscoveryResult, DirLoadResult,
                               # DiscoveredWorkflow, DiscoveryError, DiscoveryErrorKind
    errors.ts                  # NotInGitRepoError
    index.ts                   # re-exports
  parser/                      # unchanged
  schema/                      # unchanged
  index.ts                     # adds re-export "./discovery"
```

No new dependencies. `node:fs/promises`, `node:path`, `node:os` are sufficient.

### D8. Tiered API surface (option B from brainstorm)

Three exports, each independently testable, each with one responsibility:

```ts
export async function findGitRoot(startDir: string): Promise<string>;

export async function loadWorkflowsFromDir(
  dir: string,
  origin: WorkflowOrigin,
): Promise<DirLoadResult>;

export interface DiscoverOptions {
  readonly cwd?: string; // default process.cwd()
  readonly homeDir?: string; // default os.homedir() — test seam
}
export async function discoverWorkflows(opts?: DiscoverOptions): Promise<DiscoveryResult>;
```

Plus the supporting types and the `NotInGitRepoError` class. See section
"API surface" below for the full type definitions.

The `IWorkflowSource` abstraction (option C) was rejected as premature
generalisation — it would build the indirection before a second concrete
source exists, mirroring an Archon anti-pattern.

## API surface

```ts
// packages/workflows/src/discovery/types.ts

export type WorkflowOrigin = "project" | "home";

export interface DiscoveredWorkflow {
  readonly name: string; // filename stem
  readonly origin: WorkflowOrigin;
  readonly absolutePath: string;
  readonly workflow: Workflow; // parsed + validated
  readonly shadowed?: {
    readonly absolutePath: string;
    readonly origin: WorkflowOrigin;
  };
}

export type DiscoveryErrorKind =
  | "yaml_parse"
  | "schema_validation"
  | "graph_validation"
  | "io_error";

export interface DiscoveryError {
  readonly absolutePath: string;
  readonly origin: WorkflowOrigin;
  readonly kind: DiscoveryErrorKind;
  readonly message: string;
  readonly cause?: unknown;
}

export interface DirLoadResult {
  readonly workflows: ReadonlyArray<Omit<DiscoveredWorkflow, "shadowed">>;
  readonly errors: ReadonlyArray<DiscoveryError>;
}

export interface DiscoveryResult {
  readonly workflows: ReadonlyArray<DiscoveredWorkflow>;
  readonly errors: ReadonlyArray<DiscoveryError>;
}
```

```ts
// packages/workflows/src/discovery/errors.ts

export class NotInGitRepoError extends Error {
  readonly code = "ENOTINGITREPO" as const;
  constructor(public readonly startDir: string) {
    super(`not in a git repository: ${startDir}`);
  }
}
```

## Discovery algorithm

```ts
// find-git-root.ts (sketch)
async function findGitRoot(startDir: string): Promise<string> {
  let dir = resolve(startDir);
  for (;;) {
    try {
      const s = await stat(join(dir, ".git"));
      if (s.isDirectory() || s.isFile()) return dir;
    } catch (err) {
      if ((err as NodeJS.ErrnoException).code !== "ENOENT") throw err;
    }
    const parent = dirname(dir);
    if (parent === dir) throw new NotInGitRepoError(startDir);
    dir = parent;
  }
}
```

```ts
// load-from-dir.ts (sketch)
async function loadWorkflowsFromDir(dir: string, origin: WorkflowOrigin): Promise<DirLoadResult> {
  let entries: Dirent[];
  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch (err) {
    const e = err as NodeJS.ErrnoException;
    if (e.code === "ENOENT") return { workflows: [], errors: [] };
    throw err;
  }

  // Pass 1 — classify entries into candidates / errors / skipped, with an
  // explicit "winner per stem" map so within-root .yaml ∨ .yml collisions are
  // resolved before any parsing happens.
  type Candidate = { stem: string; ext: ".yaml" | ".yml"; absolutePath: string };
  const winners = new Map<string, Candidate>();
  const errors: DiscoveryError[] = [];

  for (const entry of entries) {
    if (entry.name.startsWith(".")) continue;
    const m = /^(.+)\.(yaml|yml)$/.exec(entry.name); // case-sensitive (POSIX)
    if (!m) continue;
    const [, stem, extLower] = m;
    const ext = (extLower === "yaml" ? ".yaml" : ".yml") as ".yaml" | ".yml";
    const absolutePath = join(dir, entry.name);

    if (entry.isSymbolicLink() && !entry.isFile()) {
      errors.push({
        absolutePath,
        origin,
        kind: "io_error",
        message: `broken symlink: ${entry.name}`,
      });
      continue;
    }
    if (!entry.isFile()) continue;

    const existing = winners.get(stem);
    if (existing === undefined) {
      winners.set(stem, { stem, ext, absolutePath });
      continue;
    }
    // Within-root stem collision: .yaml beats .yml. Loser stays unparsed and
    // surfaces in `shadowed` of the winner (post-merge by the orchestrator).
    if (existing.ext === ".yml" && ext === ".yaml") {
      winners.set(stem, { stem, ext, absolutePath });
    }
    // else: existing is .yaml or same-extension duplicate — keep existing.
  }

  // Pass 2 — parse winners; per-file errors are non-blocking.
  const workflows: Array<Omit<DiscoveredWorkflow, "shadowed">> = [];
  for (const c of winners.values()) {
    try {
      const workflow = await parseWorkflow(c.absolutePath);
      workflows.push({ name: c.stem, origin, absolutePath: c.absolutePath, workflow });
    } catch (err) {
      errors.push(toDiscoveryError(err, c.absolutePath, origin));
    }
  }

  return { workflows, errors };
}
```

Within-root collision contract: stem-collision in the same root — `.yaml`
wins, `.yml` is silently dropped before `parseWorkflow` is even called. The
two-pass shape (classify, then parse) keeps that decision out of the parser
and avoids charging the cost of parsing a file that will be discarded.

```ts
// discover-workflows.ts (sketch)
async function discoverWorkflows(opts?: DiscoverOptions): Promise<DiscoveryResult> {
  const cwd = opts?.cwd ?? process.cwd();
  const home = opts?.homeDir ?? homedir();

  const projectRoot = await findGitRoot(cwd); // throws NotInGitRepoError

  const [projectLayer, homeLayer] = await Promise.all([
    loadWorkflowsFromDir(join(projectRoot, ".aiactions", "workflows"), "project"),
    loadWorkflowsFromDir(join(home, ".aiactions", "workflows"), "home"),
  ]);

  const byName = new Map<string, DiscoveredWorkflow>();
  for (const w of homeLayer.workflows) byName.set(w.name, { ...w });
  for (const w of projectLayer.workflows) {
    const homeShadow = byName.get(w.name);
    byName.set(w.name, {
      ...w,
      shadowed:
        homeShadow !== undefined
          ? { absolutePath: homeShadow.absolutePath, origin: "home" }
          : undefined,
    });
  }

  return {
    workflows: [...byName.values()].sort((a, b) => a.name.localeCompare(b.name)),
    errors: [...projectLayer.errors, ...homeLayer.errors],
  };
}
```

Key invariants:

- **Determinism.** The result is sorted by `name` regardless of filesystem
  enumeration order. Two `discoverWorkflows()` calls against the same FS
  return identical arrays.
- **No I/O logging in the library.** Shadow events are exposed as data; the
  CLI renders them.
- **Parallel I/O across layers.** `Promise.all` on the two layers — they are
  independent.
- **Type safety.** Public API has no `any`, no implicit `unknown`. All
  exported types are `readonly` shapes.

## Edge-case matrix

| Scenario                                       | Behaviour                                                       |
| ---------------------------------------------- | --------------------------------------------------------------- |
| Caller not in a git repo                       | `throw NotInGitRepoError(startDir)`                             |
| `<repoRoot>/.aiactions/workflows/` absent      | empty project layer, no error                                   |
| `~/.aiactions/workflows/` absent               | empty home layer, no error                                      |
| Both layers absent                             | `{ workflows: [], errors: [] }`                                 |
| Layer dir present but unreadable (`EACCES`)    | error propagates from `loadWorkflowsFromDir` (fail-fast)        |
| Per-file YAML parse failure                    | `DiscoveryError { kind: "yaml_parse" }`, siblings still loaded  |
| Per-file schema failure                        | `DiscoveryError { kind: "schema_validation" }`                  |
| Per-file graph failure (cycle, dangling needs) | `DiscoveryError { kind: "graph_validation" }`                   |
| Symlink → valid file                           | loaded normally                                                 |
| Symlink → broken target                        | `DiscoveryError { kind: "io_error" }`                           |
| Hidden file (`.draft.yaml`)                    | skipped silently                                                |
| Subdirectory (`experimental/foo.yaml`)         | skipped silently                                                |
| Project + home same name                       | project wins, `shadowed` populated with home file's path/origin |
| Same root: `review.yaml` + `review.yml`        | `.yaml` wins, `.yml` silently dropped (no error, no shadowed)   |
| Non-ASCII filename                             | accepted; stem extraction is byte-faithful                      |

## Testing strategy

Tests live in `packages/workflows/tests/discovery/`. Vitest. All tests use
`DiscoverOptions.{cwd,homeDir}` to avoid touching the real `process.cwd()` or
`os.homedir()` — the test seam is mandatory, not optional.

Fixture trees under `packages/workflows/tests/fixtures/discovery/`:

```
fake-repos/
  minimal/              # has .git/, .aiactions/workflows/{review.yaml,release.yml}
    .git/
    .aiactions/workflows/...
  nested/sub/sub/       # findGitRoot walk-up test
  no-git/               # NotInGitRepoError test
  with-collisions/      # within-root .yaml/.yml stem collision
  with-broken-symlink/  # io_error test
  with-malformed-yaml/  # yaml_parse test

fake-homes/
  empty/                # ~/.aiactions/workflows absent
  with-review/          # ~/.aiactions/workflows/review.yaml present
```

Test files (one per primitive):

- `find-git-root.test.ts` — directory case, file case (worktree),
  walk-up, `NotInGitRepoError` at FS root, `instanceof` + `code` assertion.
- `load-from-dir.test.ts` — empty result on `ENOENT`; propagation on
  non-`ENOENT` (`EACCES`-like); extension filter; hidden filter;
  subdirectory filter; valid symlink; broken symlink → `io_error`;
  `yaml_parse` / `schema_validation` / `graph_validation` mapping;
  within-root `.yaml`/`.yml` collision; `origin` propagation; stem
  extraction.
- `discover-workflows.test.ts` — both empty; project-only; home-only;
  cross-root collision (`shadowed` populated); deterministic sort;
  `NotInGitRepoError` propagation; error aggregation across layers;
  `cwd` and `homeDir` test seams effectively override defaults.

Coverage is judged by merit, not percentage. Tests that would only assert
implementation details (e.g. "`Promise.all` is used", "`os.homedir()` is
called") are explicitly excluded.

`vp run ready` is the local gate before commit (= `vp check` + recursive
`test` + recursive `build`); CI mirrors it.

## Implications for downstream milestones

- **MS1.9 (`aia workflow check`)** consumes `discoverWorkflows`. The CLI
  command renders `result.errors` per `ValidationIssue`-style output (reuse
  `formatIssue` from `packages/cli/src/lib/format-issues.ts`). It also emits
  the shadow notes by walking `result.workflows[].shadowed`. New CLI exit
  code: `EXIT.NOT_IN_GIT_REPO`. Schema-failure exit code (`EXIT.SCHEMA`) is
  reused when `errors` is non-empty.
- **MS1.10 (`aia workflow list/run`)** consumes the same API. `list` prints
  `<name>  <origin>  <absolutePath>` (and `(shadows <home-path>)` when
  applicable). `run <name>` resolves the entry by name from
  `result.workflows`.
- **`@aiactions/runtime` smoke driver** is unaffected — the smoke driver
  calls `parseWorkflow` directly on a known path. Discovery is layered above
  the runtime, not below it.
- **Release shape**: pure addition to `@aiactions/workflows`. Conventional
  Commit `feat(workflows): add discoverWorkflows + loadWorkflowsFromDir +
findGitRoot`. release-please routes to `@aiactions/workflows` minor bump.
  No workspace-dep ripple expected at this stage (CLI/runtime adopt the API
  in MS1.9/1.10, which carry their own bumps).
