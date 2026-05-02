# Engineering principles

These are implementation constraints, not slogans. Apply them by default when designing features, reviewing code, or proposing changes. When a principle conflicts with a user instruction, the user wins — but flag the tension.

## Type safety (CRITICAL)

- **Strict TypeScript configuration is enforced.** Packages compile with `strict: true`, `noUnusedLocals`, `verbatimModuleSyntax`, `isolatedModules`. Never relax these to make code compile.
- **All functions must have complete type annotations.** Public APIs especially — rely on inference only for trivially-typed locals.
- **No `any` types without explicit justification.** Prefer `unknown` + narrowing. If `any` is truly needed (interop, third-party types), leave a single-line comment stating why.
- **Interfaces for all major abstractions.** Adapters, providers, stores, and any cross-module seam must go through an interface — not a concrete class. This keeps the SRP/ISP principles below enforceable.

## Git as a first-class citizen

Git is the source of truth for state transitions, not a persistence afterthought. Let it do what it's good at.

- **Delegate to git.** Conflicts, uncommitted changes, branch management — let git enforce the invariants. Do not reimplement them.
- **Surface git errors to users for actionable issues** (merge conflicts, uncommitted work). Do not swallow them or paper over with retries.
- **Handle _expected_ failure cases gracefully** — e.g. missing directories during cleanup — without masking unexpected ones.
- **Trust git's natural guardrails.** If git refuses to remove a worktree with uncommitted changes, that refusal is the feature; don't bypass it.
- **Use `@aiactions/git` functions for git operations.** When calling git directly, use `execFileAsync` (argv array, no shell) — never `exec` with a concatenated string (command-injection risk).
- **Worktrees enable parallel development per conversation** without branch conflicts. Favor worktrees over branch-swapping in a shared checkout.
- **Workspaces automatically sync with origin before worktree creation** to ensure latest code.
- **NEVER run `git clean -fd`** — it permanently deletes untracked files, including the user's in-progress work. Use `git checkout .` (or targeted `git restore`) to discard tracked changes; leave untracked files alone unless the user explicitly asks.

## KISS — Keep It Simple, Stupid

- Prefer straightforward control flow over clever meta-programming.
- Prefer explicit branches and typed interfaces over hidden dynamic behavior.
- Keep error paths obvious and localized.

## YAGNI — You Aren't Gonna Need It

- Do not add config keys, interface methods, feature flags, or workflow branches without a concrete accepted use case.
- Do not introduce speculative abstractions without at least one current caller.
- Keep unsupported paths explicit (error out) rather than adding partial fake support.

## DRY + Rule of Three

- Duplicate small, local logic when it preserves clarity.
- Extract shared utilities only after the same pattern appears at least three times **and** has stabilized.
- When extracting, preserve module boundaries and avoid hidden coupling.

## SRP + ISP — Single Responsibility + Interface Segregation

- Keep each module and package focused on one concern.
- Extend behavior by implementing existing narrow interfaces (e.g. `IPlatformAdapter`, `IAgentProvider`, `IDatabase`, `IWorkflowStore`) whenever possible.
- Avoid fat interfaces and "god modules" that mix policy, transport, and storage.
- Do not add unrelated methods to an existing interface — define a new one.

## Fail Fast + Explicit Errors

Silent fallback in agent runtimes can create unsafe or costly behavior.

- Prefer throwing early with a clear error for unsupported or unsafe states — never silently swallow errors.
- Never silently broaden permissions or capabilities.
- Document fallback behavior with a comment when a fallback is intentional and safe; otherwise throw.

## No autonomous lifecycle mutation across process boundaries

When a process cannot reliably distinguish "actively running elsewhere" from "orphaned by a crash" — typically because the work was started by a different process or input source (CLI, adapter, webhook, web UI, cron) — **it must not autonomously mark that work as failed/cancelled/abandoned based on a timer or staleness guess**.

- Surface the ambiguous state to the user and provide a one-click action.
- Heuristics for recoverable operations (retry backoff, subprocess timeouts, hygiene cleanup of _terminal-status_ data) remain appropriate; the rule is about destructive mutation of _non-terminal_ state owned by an unknowable other party.

Context: this principle is a direct lesson from Archon (reference: Archon issue #1216 and the CLI orphan-cleanup precedent at `packages/cli/src/cli.ts:256-258` in the Archon repo). AIactions must not repeat the pattern.

## Determinism + Reproducibility

- Prefer reproducible commands and locked dependency behavior in CI-sensitive paths.
- Keep tests deterministic — no flaky timing or network dependence without guardrails.
- Ensure local validation commands map directly to CI expectations. For AIactions the canonical local gate is `vp run ready` (= `vp check` + recursive `test` + recursive `build`); CI should run the same.

## Reversibility + Rollback-first thinking

- Keep changes easy to revert: small scope, clear blast radius.
- For risky changes, define the rollback path **before** merging.
- Avoid mixed mega-patches that block safe rollback.
