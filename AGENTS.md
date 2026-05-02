# AGENTS.md

This file provides guidance to AI agents when working with code in this repository.

## Collaboration protocol

How we work together: discussion in French, code/commits/docs in English, **checkpoint at every step** (brainstorm → plan → impl → tests → commit), feature branches + squash merge, Conventional Commits + release-please. Full protocol:

@.claude/rules/collaboration.md

## Engineering principles

Default implementation constraints for this project — **type safety (strict TS, no `any`, interfaces on every seam)**, **git as first-class citizen (never `git clean -fd`; use `@aiactions/git` or `execFileAsync`)**, KISS, YAGNI, DRY (rule of three), SRP + ISP, fail-fast errors, no autonomous lifecycle mutation across process boundaries (lesson from Archon #1216), determinism, reversibility. Full definitions in:

@.claude/rules/engineering-principles.md

## Codebase knowledge graph

Both the AIactions codebase (CWD) and the Archon reference codebase are indexed in **codebase-memory-mcp**. Ground every code answer and design decision in the graph — not in memory or assumption. For the discovery protocol, cross-project reasoning, and index-freshness rules, read:

@.claude/rules/codebase-memory.md

## Persistent memory

This project uses **MuninnDB** for cross-session memory, under the dedicated vault **`aiactions`** (never `default`). For vault rules, what to persist, and recall strategy, read:

@.claude/rules/muninn.md

## Toolchain

This project uses **Vite+** (`vp`) as the unified toolchain and task runner. For commands, conventions, and pitfalls, read:

@.claude/rules/viteplus.md

Quick reference for this repo:

- `vp run ready` — full verification before committing
- `vp run dev` — starts `apps/website` (does not exist yet — will fail)
- `vp test` from inside a package for single-package tests

## Architecture

Bun workspaces: `packages/*` (libraries — currently only `utils`, a template), `apps/*`, `tools/*` (the last two not yet created).

Each package has its own `vite.config.ts` extending root config. Packages use `pack.dts.tsgo` (TypeScript Native Preview for `.d.ts`) and `pack.exports: true` (auto-generated `exports` map). All packages are ESM-only, publish `dist/*.mjs`.

Versions for `vite`, `vitest`, `vite-plus` are pinned centrally via the root `catalog:` field. `vite` resolves to `@voidzero-dev/vite-plus-core`, `vitest` to `@voidzero-dev/vite-plus-test`.

Formatting: OXC is the default VSCode formatter, configured via `oxc.fmt.configPath` → `vite.config.ts`. Format-on-save and `source.fixAll.oxc` are enabled.

## Project-specific instructions

### What AIactions is

AIactions is a **workflow engine for AI coding agents**. Development processes — planning, implementation, validation, code review, PR creation — are defined as **YAML workflows** and run reliably across projects.

Analogy: Dockerfiles did it for infrastructure, GitHub Actions did it for CI/CD — AIactions does it for AI coding workflows. Think _n8n, but for software development_.

### Inspiration and positioning vs Archon

The project is strongly inspired by [coleam00/Archon](https://github.com/coleam00/Archon), but it is **not a fork** — AIactions is greenfield. Archon has undergone a recent major rewrite and consequently carries legacy code and debatable architectural/technical choices. As a greenfield project, AIactions must **identify those mistakes and avoid reproducing them**. When referencing Archon for ideas, distinguish the underlying concept from the current implementation and do not port problematic patterns verbatim.

### Hard constraints

- **Local-only at runtime.** The _runtime_ of AIactions runs entirely on the developer's machine — no hosted backend, no multi-tenant SaaS, no remote proxying of model calls. This is a product constraint. **It does NOT forbid external infrastructure around the project** (GitHub Actions, CI/CD, hosted docs, release automation, package registries, etc.) — those are fair game and in fact encouraged when they serve the dev workflow.
- **Auth delegated to the official Anthropic SDK.** AIactions must never implement its own Anthropic auth layer, proxy credentials, or replay requests server-side. This is a direct response to one of Archon's key issues: **it is not ToS-compliant with Anthropic**. AIactions must be ToS-compliant by construction — if a design proposal would touch auth or proxy model calls, stop and flag it.
