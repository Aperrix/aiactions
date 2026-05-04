# MS1.2 — Registry Fetch from Canonical URL — Design

**Date:** 2026-05-05
**Status:** Designed.
**Predecessor:** MS1.1 (`step.uses:` execution shipped 2026-05-04, commit `dae9b6c`).
**Successor:** MS1.3 (CLI bootstrap with `aiactions actions install <ref>`).

## Goal

When a workflow step writes `uses: <ns>/<name>@<ver>`, the runtime should
locate the action transparently — first by checking a user-level cache,
then by fetching from the canonical AIactions monorepo when the cache is
cold. Workflows that depend on community-contributed actions become
runnable on a fresh machine without manual setup.

## Non-goals

- **CLI pre-fetch command** — split into MS1.3, which scaffolds the CLI
  package and exposes `aiactions actions install <ref>`.
- **Cache GC / pruning** — defer to a later milestone; the cache is
  append-only in v1, the user can `rm -rf` to reclaim space.
- **SemVer constraint solving** (`^1.x`, `~2.0`) — `<ver>` is opaque;
  whatever the author writes is passed verbatim to git.
- **Lockfile read-back enforcement** — write-only in v1. Reading and
  validating the resolved SHA is a follow-up.
- **Signature / checksum verification** — process-level trust (PR review
  on canonical monorepo, see memory `01KQTFYRSQ465T64V9647WG571`)
  remains the gate. Cryptographic verification is out of scope here.
- **Parallel-fetch deduplication** — two concurrent runs that both miss
  the same ref will fetch independently. Atomic rename prevents
  corruption; redundant work is acceptable until measured.
- **Mirror / private registry alternative** — workflows that need to
  bypass the canonical URL can pre-populate the cache directory or use
  the existing `LocalRef` form (`./...`, `file://...`).

## Decisions

### D1. Single user-level directory `~/.aiactions/actions/<ns>/<name>/<ver>/`

The cache and the user's private/shared actions live under the same
prefix. Existence-first lookup: if the directory exists, the runtime
uses it as-is and never fetches over it. This gives the user a single
place to drop their own actions (private fork, in-progress draft, vendored
copy) without a separate "user registry" concept.

Implications:

- A user who wants to override a public action does so by placing their
  variant at the same `<ns>/<name>/<ver>/` path. No flag, no config.
- The lockfile records the SHA we fetched, so a later `git rev-parse HEAD`
  inside a user-placed copy will simply not match — that is signal, not
  error, in v1 (read-back is deferred).
- To force a refetch, the user removes the directory.

### D2. Resolver lookup order

```
1. RunOptions.registryRoot (caller-supplied override)
2. ~/.aiactions/actions  (default)
```

The override exists for tests, integration fixtures, and dogfood
workflows that live inside the canonical monorepo (where actions are
checked into the same tree as the workflows). Production callers fall
through to the user-level default.

The current default is `<cwd>/actions/`, which made sense when every
workflow author was also the action author. With a public registry, the
user-level default is more honest about where actions actually live.

### D3. Fetch mechanism — git sparse-checkout

```
git clone --filter=blob:none --sparse --depth 1 --branch <ver> \
  https://github.com/aperrix/aiactions <tmp>/_repo
git -C <tmp>/_repo sparse-checkout set actions/<ns>/<name>
mv <tmp>/_repo/actions/<ns>/<name> <registryRoot>/<ns>/<name>/<ver>
rm -rf <tmp>/_repo
```

Why git over tarball or raw API:

- `--branch <ver>` accepts tags, branches, and SHAs uniformly. No
  separate API call to translate refs.
- `--filter=blob:none --sparse --depth 1` pulls a minimal slice; only
  the needed action's blobs are materialised after `sparse-checkout
set`.
- Git binary is a hard dependency on dev/CI machines already; we add no
  new constraint.
- Keeps the door open for SHA verification, signed tags, and
  attestation later — those features all assume a git-shaped fetch.

Atomic move (`mv` to final path) after the temp clone is complete
ensures partial fetches are never observed as cached.

### D4. `<ver>` is opaque

The schema parses `<ns>/<name>@<ver>` as three string fields. The
resolver passes `<ver>` to `git --branch` verbatim. This means:

- `aperrix/lint@v1.0.0` (tag) — works.
- `aperrix/lint@main` (branch) — works.
- `aperrix/lint@abc1234...` (SHA) — works.
- `aperrix/lint@^1.0.0` (constraint) — git rejects, surfaces as
  `ActionResolutionError`. SemVer constraint solving is deferred.

Branch refs are inherently mutable. Existence-first means a branch ref
is only fetched once and never updated until the user wipes the dir.
This is a feature, not a bug — reproducibility wins by default. Future
lockfile read-back will detect the inconsistency.

### D5. Lockfile is write-only in v1

After every successful fetch, the runtime appends an entry to
`<RunOptions.cwd>/.aiactions/lock.yaml` (the caller-supplied workflow
working directory, not the user's shell cwd):

```yaml
actions:
  <ns>/<name>@<ver>:
    resolved-sha: <40-char SHA>
    fetched-at: <ISO 8601 UTC timestamp>
```

The lockfile is gitted. Two reasons to write it now even without
read-back:

1. PR reviewers can audit what SHA was actually pulled at commit time.
2. Future read-back enforcement has a populated history to start from.

The lockfile is created if missing. Existing entries are overwritten
when a fetch resolves the same `<ref>` to a new SHA — which only
happens if the user wiped the cache, since existence-first prevents
re-fetch otherwise.

### D6. Errors surface, never paper over

- Cache miss + offline → `ActionResolutionError` with the failing git
  command's stderr. No silent retry, no fallback to a stale cache.
- Cache miss + ref unknown on remote → `ActionResolutionError` with
  git's "remote ref not found" message.
- Fetch interrupted mid-clone → tmpdir leaked but cache uncorrupted.
  Cleanup is best-effort; the next fetch re-creates the tmpdir.

## Architecture

New module `packages/runtime/src/runner/uses/registry-fetch.ts`:

- `ensureCachedAction(ref: RegistryRef, registryRoot: string): Promise<{ dir: string; resolvedSha: string | null }>`
  - Returns `{ dir }` immediately if `<registryRoot>/<ns>/<name>/<ver>/`
    already exists. `resolvedSha` is `null` in that case (we do not
    attempt to read it from the existing dir; that's read-back's job).
  - Otherwise calls `fetchActionFromCanonical(...)`, returns the
    materialised path and the resolved SHA.
- `fetchActionFromCanonical(ref, registryRoot, options): Promise<string>`
  - Performs the git sparse-checkout dance.
  - `options` shape: `{ canonicalUrl?: string; tmpRoot?: string; now?: () => Date }`.
    `canonicalUrl` defaults to `https://github.com/aperrix/aiactions`;
    tests inject a `file:///<tmpdir>/repo.git` to avoid the network.
    `tmpRoot` defaults to `os.tmpdir()`.
  - Returns the resolved SHA so the caller can write the lockfile.
- `appendLockfileEntry(cwd: string, ref, resolvedSha, fetchedAt): Promise<void>`
  - Reads existing `.aiactions/lock.yaml` if any, merges, writes back.

Modified files:

- `packages/runtime/src/runner/uses/resolver.ts` — `resolveUsesRef` for
  `RegistryRef` now calls `ensureCachedAction` first; the directory
  existence check that was inline becomes the cache-hit fast path.
- `packages/runtime/src/run-workflow.ts:159` — default `registryRoot`
  changes from `<cwd>/actions/` to `~/.aiactions/actions/`.
- `packages/runtime/src/runner/job.ts` — propagate `cwd` into the
  resolver context so the lockfile path is project-local
  (`JobRunRequest.cwd`, originally from `RunOptions.cwd`).

No schema changes. No new event kind in v1.

## Cache layout

```
~/.aiactions/actions/
├── aperrix/
│   └── lint/
│       └── v1.0.0/
│           ├── aiaction.yaml
│           └── ...sources...
└── octocat/
    └── format/
        └── main/
            ├── aiaction.yaml
            └── ...sources...
```

User-private actions live under the same tree, e.g.
`~/.aiactions/actions/myorg/internal-lint/2.0.0/`. The runtime treats
them indistinguishably from fetched actions — the `<ns>` namespace is
the user's coordinate, not a trust signal.

## Lockfile layout

`<cwd>/.aiactions/lock.yaml`:

```yaml
# Generated by AIactions. Commit this file.
actions:
  aperrix/lint@v1.0.0:
    resolved-sha: 0123456789abcdef0123456789abcdef01234567
    fetched-at: 2026-05-05T10:00:00.000Z
  octocat/format@main:
    resolved-sha: fedcba9876543210fedcba9876543210fedcba98
    fetched-at: 2026-05-05T10:01:00.000Z
```

YAML format chosen for parity with the rest of the project (`aiaction.yaml`,
workflow files). Sorting keys alphabetically by `<ns>/<name>@<ver>` keeps
diffs minimal.

## Tests outline

Unit (~8):

- `ensureCachedAction` cache hit (no fetch invoked).
- `ensureCachedAction` cache miss invokes fetch.
- `fetchActionFromCanonical` produces correct directory layout.
- Atomic move semantics — interrupt before final move leaves no
  partial dir at the cache path.
- Existence-first preserves user-placed action (does not re-fetch).
- `appendLockfileEntry` creates the file when missing.
- `appendLockfileEntry` merges into existing entries.
- Invalid ref → `ActionResolutionError` with git stderr surfaced.

Integration (~4):

- End-to-end through `runWorkflow` with a stubbed canonical URL
  (point at a local bare git repo via `file://`).
- Resolver `RunOptions.registryRoot` override preserves the in-repo
  layout for dogfood workflows.
- Default `registryRoot` resolves to `~/.aiactions/actions/` (sandbox
  via `HOME` override in the test).
- Lockfile gets written after a successful fetch.

Test plumbing:

- Spin up a local bare git repo in `tmpdir()` per test, populate with a
  miniature `actions/<ns>/<name>/aiaction.yaml`, point the fetcher at
  `file://<tmpdir>/repo.git` via an injectable `canonicalUrl` option.
- Sandbox `~/.aiactions` via `HOME` env override.
- Skip on Windows for v1 (POSIX-only path semantics; will revisit when
  Windows lands as a tier-1 platform).

## Backlog after MS1.2

- MS1.3 — CLI scaffold + `aiactions actions install <ref>` reusing
  `ensureCachedAction`. Probably also `aiactions actions list`,
  `aiactions actions remove`.
- MS1.x — Lockfile read-back: at run start, if lockfile says
  `<ns>/<name>@<ver> = SHA-X`, verify the cached dir's `git rev-parse
HEAD` matches; warn or error on mismatch (decide policy).
- MS1.x — Cache pruning command (`aiactions actions gc`).
- MS1.x — Mirror / private registry override
  (`AIACTIONS_REGISTRY_URL` env or per-workflow config).
- MS2.x — `@aiactions/core` SDK toolkit for action authors (analog of
  `actions/toolkit`).
- MS2.x — `aiactions/typescript-action` template repo for action
  authors (analog of `actions/typescript-action`).

## References

- Constraint memory: muninn `01KQT7X8NJ3VWQXTM752573296`
  (`run-step-gha-faithful-script-execution`) — orthogonal but related,
  ensures registry-fetched actions execute under the same shell parity.
- Trust memory: muninn `01KQTFYRSQ465T64V9647WG571`
  (trust-by-pr-review-not-runtime-gate). The PR-review gate is the
  reason the fetched action is considered safe to execute without an
  in-runtime trust tier.
- Canonical URL memory: muninn `01KQTFZ34E03CNF8ZSNWCCVTPK`
  (`actions-registry-canonical-url`).
- Registry layout memory: muninn `01KQT6XCNN2W830PQ1C7MM9XE1`
  (`shareable-actions-live-in-dedicated-monorepo`) — confirms
  `<cwd>/actions/<ns>/<name>/` layout used by dogfood workflows.
