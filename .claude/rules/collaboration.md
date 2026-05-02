# Collaboration protocol

How Claude and the user work together on AIactions.

## Language

- **Code, identifiers, comments, commit messages, documentation and changelog entries: English.**
- **Discussion between Claude and the user: French.**
- Artifacts stay in English even when the surrounding discussion is in French.

## Autonomy level — checkpoint at every step

Default autonomy is **checkpoint at every step**. Claude must obtain explicit user approval before moving from one phase to the next. Required gates, in order:

1. **Brainstorm** the approach — what problem, what options, what trade-offs. → user validates direction.
2. **Plan** the implementation in writing. → user validates the plan.
3. **Implement** the code. → user reviews the diff.
4. **Tests**, written only where they add genuine value (see TDD policy below). → user reviews the tests.
5. **Commit & squash-merge**. → user validates the commit message and the merge timing.

**Never skip or batch phases without the user's explicit green light for the session.** Batching is opt-in per session, not a default.

## Brainstorming and verification are mandatory

Because AIactions draws heavily on Archon:

- **Never cite Archon's behavior from memory.** Always verify via `codebase-memory-mcp` on project `home-aperrix-Documents-PROJECTS-archon` (see `codebase-memory.md`).
- **Archon's docs can be stale.** Trust the code, not the docs. When the two disagree, the code wins.
- Distinguish the underlying _concept_ from Archon's current _implementation_. Port concepts after auditing; never port problematic implementations verbatim (see engineering principles).

## TDD — value over dogma

Write tests when they catch real failure modes or freeze behavior that matters. Writing tests just to tick a TDD checkbox — tautological assertions, tests coupled to implementation details — is explicitly unwanted. Judge every test on merit: would a reviewer miss the failure it catches?

## Branching — feature branches + squash merge

- **One branch (ideally one `git worktree`) per task or conversation.**
- **Rebase the branch on `main`** before merging when `main` has moved on.
- **Squash merge on `main`** — exactly one commit per feature, keeping history linear and the tree clean.
- This pairs with `release-please` (which parses `main`'s commit history) and with the worktree guidance in `engineering-principles.md`.

## Commits — Conventional Commits

Required format so that `release-please` can generate changelogs automatically: https://www.conventionalcommits.org/

```
<type>(<scope>)!?: <subject>

[optional body]

[optional footer(s), e.g. BREAKING CHANGE: …, Refs: #123]
```

- `<type>` ∈ `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`, `revert`.
- `<scope>` = package or area (e.g. `core`, `cli`, `git`). Optional but recommended in a monorepo.
- Trailing `!` or a `BREAKING CHANGE:` footer marks a breaking change.
- Subject: imperative, present tense, lowercase, no trailing period.

**The squash-merge commit message itself must be a valid Conventional Commit** — `release-please` parses `main`'s history, not intermediate branch commits.

## Releases — release-please (automated)

Release pipeline: [`release-please`](https://github.com/googleapis/release-please) running as a GitHub Action.

- Opens and maintains a `chore: release` PR that accumulates pending changes inferred from Conventional Commits on `main`.
- Merging the release PR triggers: tag creation, `CHANGELOG.md` regeneration, and (optionally) package publish.
- **Do not hand-edit `CHANGELOG.md`** — it is generated.
