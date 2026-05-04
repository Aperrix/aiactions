# MS1.0.6 — Shell Parity — Design

**Date:** 2026-05-04
**Status:** Implemented on `feat/ms1-0-6-shell-parity` (squash-merged onto `main` at the end of the milestone).
**Constraint:** muninn `01KQT7X8NJ3VWQXTM752573296` (`run-step-gha-faithful-script-execution`).

## Goal

Bring the AIactions `run:` step to full parity with GitHub Actions on
script-execution semantics. Authors should be able to write workflows
that mix `bash`, `sh`, `pwsh`, `python`, `cmd`, and arbitrary custom
shells (via `<cmd> [opts] {0} [more]` templates), with `defaults.run`
inheritance at workflow and job scope.

## Non-goals

- Workflow-level `defaults` keys other than `run` — GHA does not define any.
- Composite-action defaults — composite actions are MS1.2+.
- Alternate Windows shells (Git-for-Windows bash is fine, but the
  `bash → sh` fallback is POSIX-only here).

## Decisions

### D1. Custom shell template strings are GHA-faithful escape hatches

When the author writes `shell: <cmd> [opts] {0} [more]`, the runtime
substitutes the script path at `{0}` and runs the binary verbatim — no
default flags injected, even if the first token matches a built-in
shell name. `shell: bash {0}` is therefore explicitly different from
`shell: bash`: the former drops `--noprofile --norc -eo pipefail`. This
matches GHA's documented behaviour and gives authors a way to override
the fail-fast defaults.

### D2. `defaults.run.*` only governs `run:` steps

`uses:` steps continue to ignore `working-directory` (an action runs in
its own directory, GHA-faithful). `defaults.run.shell` is meaningless
on `uses:` steps and is silently unused. The schema does not enforce
this — it just doesn't apply.

### D3. `bash → sh` fallback is probed once per `runWorkflow`

The probe (`bash --version`) costs one process spawn (~10 ms). Caching
within a workflow is safe: PATH does not change inside a run. The
probe result is threaded into every `runJob` invocation via
`JobRunRequest.bashAvailable`. Tests inject `false` directly to
exercise the fallback path deterministically without touching PATH.

### D4. `python` invocation uses literal `python`, not `python3`

GHA's documented template is `python {0}`. We mirror it. On systems
where `python` is not symlinked to `python3`, the spawn fails with
`ENOENT` and the step fails — same outcome as on a GHA-hosted runner
that lost its python toolchain. The runtime smoke test for
`shell: python` skips itself if `python` is not on PATH so it does not
fail on minimal CI images.

### D5. Schema-runtime split for custom templates

The schema validates the `<cmd> [...] {0} [...]` shape via a regex
(`customShellTemplateRegex`) plus a multiplicity refine (exactly one
`{0}`). The runtime parses the same regex into
`{ bin, preArgs, postArgs }` before spawn. We do not parse at the
schema layer because the parsed shape is a runtime concern and putting
it in the schema would force all downstream consumers (e.g. JSON
Schema generation) to know about it.

## Implications for downstream milestones

- MS1.2 (trust-tier env curation) needs to gate custom shell templates
  for third-party `uses:` actions — a malicious action could declare
  `shell: rm {0}` and have the loader execute it. This plan does NOT
  add that gate; MS1.2 owns the policy decision.
- `defaults.run` now flows through `JobRunRequest.workflowDefaults`.
  Future job-level features (e.g. matrix, concurrency) should read
  from the same field rather than reaching back into the workflow
  document — keeps `runJob`'s contract self-contained.
