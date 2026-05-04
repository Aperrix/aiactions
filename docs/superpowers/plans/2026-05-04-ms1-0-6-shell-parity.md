# MS1.0.6 — Shell Parity — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Bring AIactions `run:` step execution to full GHA parity on script-execution semantics: support `shell: python`, custom shell template strings (`<cmd> [opts] {0} [more]`), `bash → sh` fallback when `bash` is absent on PATH, and `defaults.run.{shell,working-directory}` inheritance at workflow and job scope.

**Architecture:** No new modules in the runtime. Three existing schema files (`shell.ts`, `workflow.ts`, `job.ts`) gain new shapes; one new schema file (`defaults.ts`) wraps the `defaults.run` block reused by workflow and job. One existing runtime file (`shell-spec.ts`) absorbs all shell-resolution changes via two new helpers (`parseCustomShellTemplate`, `probeBashAvailability`). Job runner (`job.ts`) gains an inheritance-chain resolution for the effective shell and the effective working directory before each `run:` step.

**Tech Stack:** TypeScript (strict), Zod (already used in `@aiactions/workflows`), `node:child_process.execFile` for the `bash` PATH probe, Vite+ (`vp`) toolchain, Vitest (via `vite-plus/test`). All `@aiactions/*` packages are source-as-exports (no build step).

---

## Repo state at plan-write time

`main` is clean at `dae9b6c feat(runtime): execute step.uses via subprocess with FD3 IPC (MS1.1)`.

Decision-record memory: `01KQT7X8NJ3VWQXTM752573296` (muninn vault `aiactions`, type `constraint`, concept `run-step-gha-faithful-script-execution`).

This plan is executed on a fresh feature branch:

```bash
git checkout -b feat/ms1-0-6-shell-parity
```

## File structure (target end-of-plan)

**Created:**

- `packages/workflows/src/schema/defaults.ts` — `runDefaultsSchema`, `defaultsSchema`.
- `packages/workflows/tests/schema-shell-custom.test.ts`
- `packages/workflows/tests/schema-defaults.test.ts`
- `packages/runtime/tests/exec-shell-spec-python.test.ts`
- `packages/runtime/tests/exec-shell-spec-fallback.test.ts`
- `packages/runtime/tests/exec-shell-spec-custom.test.ts`
- `packages/runtime/tests/runner-job-defaults-shell.test.ts`
- `packages/runtime/tests/runner-job-defaults-workdir.test.ts`
- `docs/superpowers/specs/2026-05-04-ms1-0-6-shell-parity-design.md` — design notes (light).

**Modified:**

- `packages/workflows/src/schema/shell.ts` — accept custom shell template string in addition to enum; export `BUILTIN_SHELLS` constant.
- `packages/workflows/src/schema/workflow.ts` — add `defaults: defaultsSchema.optional()` to `baseWorkflowShape`.
- `packages/workflows/src/schema/job.ts` — add `defaults: defaultsSchema.optional()` to `baseJobShape`.
- `packages/workflows/src/index.ts` — re-export `Defaults`, `RunDefaults`.
- `packages/runtime/src/exec/shell-spec.ts` — drop `python` throw; route custom templates through new parser; add `bashAvailable` parameter to `getShellInvocation`; add `probeBashAvailability` and `parseCustomShellTemplate` exports.
- `packages/runtime/src/exec/script-file.ts` — clarify in JSDoc that an empty extension is allowed.
- `packages/runtime/src/runner/job.ts` — extend `JobRunRequest` with `workflowDefaults` field; resolve `effectiveShell` and `effectiveWorkingDirectory` per step from the inheritance chain (step → job.defaults.run → workflow.defaults.run); thread `bashAvailable` into `getShellInvocation` calls.
- `packages/runtime/src/run-workflow.ts` — pass `workflow.defaults?.run` into `runJob`; probe `bash` once per `runWorkflow` invocation and pass `bashAvailable` down the call chain.

**Out of scope:**

- Workflow-level `defaults` other than `run` (GHA only defines `defaults.run`).
- Composite-action defaults inheritance (composite actions land in MS1.2+).
- Windows `bash → sh` fallback (Windows uses Git-for-Windows bash; separate concern).
- Renaming or restructuring the `getShellInvocation` API beyond the `bashAvailable` parameter.

## How to run tests

```bash
cd /home/aperrix/Documents/PROJECTS/aiactions/packages/runtime
vp test                                          # all runtime tests
vp test exec-shell-spec-python                   # one file by substring
vp test exec-shell-spec-python -t "exit code"    # one test by name

cd /home/aperrix/Documents/PROJECTS/aiactions/packages/workflows
vp test schema-shell-custom
```

Full pre-commit gate: `vp run ready` from repo root (`vp check && vp run -r test && vp run -r build`).

## How to commit

You are on `feat/ms1-0-6-shell-parity`. Conventional Commits, normal commits per task on the branch (squash-merge at end of plan). Never `git clean -fd`. Never use `--no-verify` to skip hooks.

```bash
git add <files>
git commit -m "$(cat <<'EOF'
<type>(<scope>): <subject>

<optional body>

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

After every commit, run `mcp__codebase-memory-mcp__detect_changes(project: "home-aperrix-Documents-PROJECTS-aiactions", since: "HEAD~1")` per `.claude/rules/codebase-memory.md`.

---

## Task 1: G1 — `shell: python` support

**Files:**

- Modify: `packages/runtime/src/exec/shell-spec.ts:69-118` (`getShellInvocation`)
- Test: `packages/runtime/tests/exec-shell-spec-python.test.ts` (new)

Replace the `RuntimeUnsupportedError("shell: python is not yet supported")` with a real `python {0}` invocation. Per GHA, no extension is appended. Failure semantics rely on Python's own behaviour: an uncaught exception triggers a non-zero exit, which the spawn layer maps to a failed step.

- [ ] **Step 1: Write the failing unit test for the python branch**

Create `packages/runtime/tests/exec-shell-spec-python.test.ts`:

```typescript
/**
 * Unit tests for `shell: python` in `getShellInvocation`. Asserts the
 * GHA-faithful invocation shape — `python {0}`, no extension. Failure
 * semantics (Python exception → non-zero exit → failed step) are
 * exercised by the higher-level runner tests.
 */

import { describe, expect, test } from "vite-plus/test";

import { getShellInvocation } from "../src/exec/shell-spec.ts";

describe("getShellInvocation - shell: python", () => {
  test("returns python invocation with no extension on linux", () => {
    const inv = getShellInvocation("python", "/tmp/aiactions-run/step-0", "linux", true);
    expect(inv.bin).toBe("python");
    expect(inv.args).toEqual(["/tmp/aiactions-run/step-0"]);
    expect(inv.extension).toBe("");
  });

  test("returns python invocation with no extension on darwin", () => {
    const inv = getShellInvocation("python", "/tmp/aiactions-run/step-0", "darwin", true);
    expect(inv.bin).toBe("python");
    expect(inv.args).toEqual(["/tmp/aiactions-run/step-0"]);
    expect(inv.extension).toBe("");
  });

  test("returns python invocation with no extension on win32", () => {
    const inv = getShellInvocation("python", "C:\\tmp\\step-0", "win32", true);
    expect(inv.bin).toBe("python");
    expect(inv.args).toEqual(["C:\\tmp\\step-0"]);
    expect(inv.extension).toBe("");
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `cd packages/runtime && vp test exec-shell-spec-python`
Expected: FAIL with `RuntimeUnsupportedError: shell: python is not yet supported (deferred past MS1.0)`.

- [ ] **Step 3: Implement the python branch in `getShellInvocation`**

Open `packages/runtime/src/exec/shell-spec.ts`. The current file rejects python at lines 74-76. Replace those three lines so the python case returns a real invocation.

The function signature also needs to gain the `bashAvailable` parameter that Task 2 will use; add it now as a no-op to keep this task small and avoid a second signature change. The `bashAvailable` parameter is unused in this task's branches (only the `undefined`/POSIX path uses it; that branch is updated in Task 2).

Replace the function body so it reads (full function, end-to-end):

```typescript
export function getShellInvocation(
  shell: Shell | undefined,
  scriptPath: string,
  platform: NodeJS.Platform,
  bashAvailable: boolean,
): ShellInvocation {
  if (shell === "sh" && platform === "win32") {
    throw new RuntimeUnsupportedError("shell: sh is not available on Windows");
  }
  if (shell === "cmd" && platform !== "win32") {
    throw new RuntimeUnsupportedError("shell: cmd is only available on Windows");
  }

  if (shell === "bash") {
    return {
      bin: "bash",
      args: ["--noprofile", "--norc", "-e", "-o", "pipefail", scriptPath],
      extension: ".sh",
    };
  }
  if (shell === "sh") {
    return { bin: "sh", args: ["-e", scriptPath], extension: ".sh" };
  }
  if (shell === "pwsh") {
    return {
      bin: "pwsh",
      args: ["-command", `. '${scriptPath}'`],
      extension: ".ps1",
    };
  }
  if (shell === "python") {
    return { bin: "python", args: [scriptPath], extension: "" };
  }
  if (shell === "cmd") {
    return {
      bin: process.env.ComSpec ?? "cmd.exe",
      args: ["/D", "/E:ON", "/V:OFF", "/S", "/C", `CALL "${scriptPath}"`],
      extension: ".cmd",
    };
  }

  // shell === undefined: platform default. The bash → sh fallback is
  // wired up in Task 2; for now, POSIX always returns bash.
  void bashAvailable;
  if (platform === "win32") {
    return {
      bin: "pwsh",
      args: ["-command", `. '${scriptPath}'`],
      extension: ".ps1",
    };
  }
  return { bin: "bash", args: ["-e", scriptPath], extension: ".sh" };
}
```

Update the JSDoc above the function (already explains the contract; keep the existing prose, just remove the line claiming python is deferred).

- [ ] **Step 4: Update existing call sites for the new signature**

`getShellInvocation` is called in two places in `packages/runtime/src/runner/job.ts` (search for `getShellInvocation(`). Both are inside the `run:` branch. They currently pass three arguments; add a fourth — for now pass `true` (bash assumed available) so the test does not regress; Task 2 replaces the literal with a real probe.

Locate `runJob` in `packages/runtime/src/runner/job.ts`. Change:

```typescript
const placeholder = getShellInvocation(step.shell, "<placeholder>", process.platform);
```

to:

```typescript
const placeholder = getShellInvocation(step.shell, "<placeholder>", process.platform, true);
```

And:

```typescript
const concrete = getShellInvocation(step.shell, handle.path, process.platform);
```

to:

```typescript
const concrete = getShellInvocation(step.shell, handle.path, process.platform, true);
```

- [ ] **Step 5: Run the new test to verify it passes**

Run: `cd packages/runtime && vp test exec-shell-spec-python`
Expected: 3 tests PASS.

- [ ] **Step 6: Run the full runtime test suite to verify no regression**

Run: `cd packages/runtime && vp test`
Expected: all existing tests still PASS (123 + 3 new = 126).

- [ ] **Step 7: Add a runtime test for `shell: python`**

Append to `packages/runtime/tests/run-workflow.test.ts` a new test that runs a one-step `python` workflow (the file already imports `runWorkflow` and defines `parseWorkflow = (input: unknown) => workflowSchema.parse(input)`). The test must skip itself if `python` is not on PATH so it does not fail on minimal CI images.

Add at the top of the file (after the existing `parseWorkflow` helper, near the top imports):

```typescript
import { execFile } from "node:child_process";
import { promisify } from "node:util";

const pExecFile = promisify(execFile);

async function pythonAvailable(): Promise<boolean> {
  try {
    await pExecFile("python", ["--version"]);
    return true;
  } catch {
    return false;
  }
}
```

Then append a new `describe.skipIf(!POSIX)` block at the end of the file:

```typescript
describe.skipIf(!POSIX)("runWorkflow — shell: python", () => {
  test("runs the script and reports succeeded", async () => {
    if (!(await pythonAvailable())) return; // skip on machines without `python`

    const workflow = parseWorkflow({
      name: "python-smoke",
      jobs: {
        one: {
          steps: [
            {
              shell: "python",
              run: 'import sys\nprint("hello-from-python")\nsys.exit(0)\n',
            },
          ],
        },
      },
    });
    const result = await runWorkflow(workflow, { cwd: process.cwd() });
    expect(result.status).toBe("succeeded");
    expect(result.jobs.one?.steps[0]?.stdout).toContain("hello-from-python");
  });
});
```

Run: `cd packages/runtime && vp test run-workflow -t "shell: python"`
Expected: PASS (or silently skip if `python` is not installed).

- [ ] **Step 8: Commit**

```bash
git add packages/runtime/src/exec/shell-spec.ts \
        packages/runtime/src/runner/job.ts \
        packages/runtime/tests/exec-shell-spec-python.test.ts \
        packages/runtime/tests/run-workflow.test.ts
git commit -m "$(cat <<'EOF'
feat(runtime): support shell: python in run: steps (MS1.0.6 G1)

Replaces the RuntimeUnsupportedError thrown when a step declares
shell: python with the real GHA-faithful invocation `python {0}`. No
extension is appended (matching GHA). Adds a `bashAvailable`
parameter to `getShellInvocation` ahead of Task 2 (sh fallback);
existing call sites pass `true` for now.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

After commit, run the codebase-memory refresh:

```bash
mcp__codebase-memory-mcp__detect_changes project="home-aperrix-Documents-PROJECTS-aiactions" since="HEAD~1"
```

---

## Task 2: G3 — `bash → sh` POSIX fallback

**Files:**

- Modify: `packages/runtime/src/exec/shell-spec.ts:109-118` (`getShellInvocation` POSIX-default branch); add `probeBashAvailability` export
- Modify: `packages/runtime/src/runner/job.ts` (`getShellInvocation` call sites — replace literal `true`)
- Modify: `packages/runtime/src/run-workflow.ts` — probe once per run, thread into `runJob`
- Test: `packages/runtime/tests/exec-shell-spec-fallback.test.ts` (new)

GHA: when `shell:` is unspecified on a POSIX runner and `bash` is not on PATH, the runner falls back to `sh -e {0}`. Today AIactions always returns `bash -e {0}` for the POSIX-default branch.

We add a `probeBashAvailability(): Promise<boolean>` helper that runs `bash --version` once. The result is cached per `runWorkflow` invocation (probe runs at the top of `runWorkflow` and is threaded into every `runJob` call).

- [ ] **Step 1: Write failing tests for the fallback path**

Create `packages/runtime/tests/exec-shell-spec-fallback.test.ts`:

```typescript
/**
 * Unit tests for the POSIX bash → sh fallback in `getShellInvocation`.
 * The probe itself (`probeBashAvailability`) is exercised separately;
 * here we only assert that the parameter routes through correctly.
 */

import { describe, expect, test } from "vite-plus/test";

import { getShellInvocation, probeBashAvailability } from "../src/exec/shell-spec.ts";

describe("getShellInvocation - POSIX default with bashAvailable", () => {
  test("uses bash when shell is unspecified and bash is available on linux", () => {
    const inv = getShellInvocation(undefined, "/tmp/x", "linux", true);
    expect(inv.bin).toBe("bash");
    expect(inv.args).toEqual(["-e", "/tmp/x"]);
    expect(inv.extension).toBe(".sh");
  });

  test("falls back to sh when bash is unavailable on linux", () => {
    const inv = getShellInvocation(undefined, "/tmp/x", "linux", false);
    expect(inv.bin).toBe("sh");
    expect(inv.args).toEqual(["-e", "/tmp/x"]);
    expect(inv.extension).toBe(".sh");
  });

  test("falls back to sh when bash is unavailable on darwin", () => {
    const inv = getShellInvocation(undefined, "/tmp/x", "darwin", false);
    expect(inv.bin).toBe("sh");
    expect(inv.args).toEqual(["-e", "/tmp/x"]);
    expect(inv.extension).toBe(".sh");
  });

  test("uses pwsh on win32 regardless of bashAvailable", () => {
    const a = getShellInvocation(undefined, "C:\\x", "win32", true);
    const b = getShellInvocation(undefined, "C:\\x", "win32", false);
    expect(a.bin).toBe("pwsh");
    expect(b.bin).toBe("pwsh");
  });

  test("explicit shell: bash ignores bashAvailable", () => {
    // Author asked for bash; we honour the request and let spawn fail
    // with ENOENT if bash truly is missing.
    const inv = getShellInvocation("bash", "/tmp/x", "linux", false);
    expect(inv.bin).toBe("bash");
  });
});

describe("probeBashAvailability", () => {
  test("returns a boolean", async () => {
    const result = await probeBashAvailability();
    expect(typeof result).toBe("boolean");
  });
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `cd packages/runtime && vp test exec-shell-spec-fallback`
Expected: FAIL — `probeBashAvailability` is not exported and the second test fails because the POSIX-default branch ignores `bashAvailable`.

- [ ] **Step 3: Implement `probeBashAvailability` and the fallback branch**

In `packages/runtime/src/exec/shell-spec.ts`, add at the top (after imports):

```typescript
import { execFile } from "node:child_process";
import { promisify } from "node:util";

const pExecFile = promisify(execFile);

/**
 * Probes whether `bash` is reachable on PATH by running `bash --version`.
 * Returns `false` on any spawn error (typically `ENOENT`). Callers should
 * memoise the result for the duration of a single workflow run; the cost
 * is one process spawn (~10 ms) and the answer cannot change inside a run.
 */
export async function probeBashAvailability(): Promise<boolean> {
  try {
    await pExecFile("bash", ["--version"]);
    return true;
  } catch {
    return false;
  }
}
```

Then update the POSIX-default branch at the bottom of `getShellInvocation` to use `bashAvailable`:

```typescript
  // shell === undefined: platform default.
  if (platform === "win32") {
    return {
      bin: "pwsh",
      args: ["-command", `. '${scriptPath}'`],
      extension: ".ps1",
    };
  }
  if (bashAvailable) {
    return { bin: "bash", args: ["-e", scriptPath], extension: ".sh" };
  }
  return { bin: "sh", args: ["-e", scriptPath], extension: ".sh" };
}
```

Drop the `void bashAvailable;` line that Task 1 added as a placeholder.

- [ ] **Step 4: Probe once per run in `runWorkflow` and thread into `runJob`**

Open `packages/runtime/src/run-workflow.ts`. Locate the `runWorkflow` function. Near the top of the body, after the workflow has been parsed, probe bash once:

```typescript
const bashAvailable = await probeBashAvailability();
```

Import `probeBashAvailability` from `./exec/shell-spec.ts`.

Then thread `bashAvailable` into every `runJob` call (the file currently has one or two such calls). Add `bashAvailable` to the `JobRunRequest` interface in `packages/runtime/src/runner/job.ts`:

```typescript
export interface JobRunRequest {
  // ... existing fields ...
  bashAvailable: boolean;
}
```

Inside `runJob`, replace the two literal `true` arguments to `getShellInvocation` (added in Task 1) with `request.bashAvailable`:

```typescript
const placeholder = getShellInvocation(
  step.shell,
  "<placeholder>",
  process.platform,
  request.bashAvailable,
);
// ...
const concrete = getShellInvocation(
  step.shell,
  handle.path,
  process.platform,
  request.bashAvailable,
);
```

- [ ] **Step 5: Run the new tests**

Run: `cd packages/runtime && vp test exec-shell-spec-fallback`
Expected: PASS (6/6).

- [ ] **Step 6: Run the full suite**

Run: `cd packages/runtime && vp test`
Expected: PASS — existing tests do not regress; 6 new tests added.

- [ ] **Step 7: Commit**

```bash
git add packages/runtime/src/exec/shell-spec.ts \
        packages/runtime/src/run-workflow.ts \
        packages/runtime/src/runner/job.ts \
        packages/runtime/tests/exec-shell-spec-fallback.test.ts
git commit -m "$(cat <<'EOF'
feat(runtime): fall back to sh when bash absent on POSIX (MS1.0.6 G3)

Adds `probeBashAvailability` (bash --version probe), called once per
runWorkflow invocation and threaded into runJob via the new
JobRunRequest.bashAvailable field. When `shell:` is unspecified on
POSIX and bash is not on PATH, getShellInvocation now returns
`sh -e {0}` instead of always returning `bash -e {0}`. Matches
GHA's "Linux/macOS unspecified" row in the shell defaults table.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

After commit, run `mcp__codebase-memory-mcp__detect_changes` as before.

---

## Task 3: G2 — custom shell template support (schema + runtime)

**Files:**

- Modify: `packages/workflows/src/schema/shell.ts` — accept enum or template string; export `BUILTIN_SHELLS` + `customShellTemplateRegex`
- Modify: `packages/runtime/src/exec/shell-spec.ts` — route custom templates through new `parseCustomShellTemplate`
- Test: `packages/workflows/tests/schema-shell-custom.test.ts` (new)
- Test: `packages/runtime/tests/exec-shell-spec-custom.test.ts` (new)

GHA accepts `shell: <cmd> [opts] {0} [more_opts]`. First whitespace-delimited token is the binary; runtime substitutes the script path at `{0}`. The escape hatch is intentional — `shell: bash {0}` means "run bash without the default `--noprofile --norc -eo pipefail` flags". When the user writes a custom template, the runtime must use it verbatim, even if the first token matches a built-in shell name.

- [ ] **Step 1: Write failing schema tests for the custom template**

Create `packages/workflows/tests/schema-shell-custom.test.ts`:

```typescript
/**
 * Schema-level tests for shell:: custom template strings. The runtime
 * tests in packages/runtime/tests/exec-shell-spec-custom.test.ts
 * exercise the parsing and execution paths.
 */

import { describe, expect, test } from "vite-plus/test";

import { shellSchema } from "../src/schema/shell.ts";

describe("shellSchema - built-in enum values", () => {
  test.each(["bash", "sh", "pwsh", "python", "cmd"])("accepts %s", (s) => {
    expect(shellSchema.parse(s)).toBe(s);
  });
});

describe("shellSchema - custom template strings", () => {
  test.each([
    "perl {0}",
    "node {0}",
    "python -u {0}",
    "bash -x {0} arg1 arg2",
    "bash {0}", // GHA escape hatch — drops fail-fast flags
    "/usr/bin/env python3 {0}",
  ])("accepts %s", (s) => {
    expect(shellSchema.parse(s)).toBe(s);
  });

  test.each([
    "perl", // no {0}
    "{0}", // no command
    "  {0}", // whitespace before {0} but no command
    "perl {1}", // wrong placeholder
    "perl {0} {0}", // duplicate placeholder; we only allow one
    "", // empty
    "perl{0}", // no whitespace before {0}
  ])("rejects %s", (s) => {
    expect(() => shellSchema.parse(s)).toThrow();
  });
});
```

- [ ] **Step 2: Run the schema tests to verify they fail**

Run: `cd packages/workflows && vp test schema-shell-custom`
Expected: FAIL — every "accepts custom" case throws because the schema is currently a closed enum.

- [ ] **Step 3: Update `shellSchema` to accept the union**

Replace the body of `packages/workflows/src/schema/shell.ts` so it reads:

```typescript
/**
 * Zod schema for the `shell:` keyword on a step. The accepted shape is
 * GHA-faithful: either a built-in shell name (`bash | sh | pwsh | python
 * | cmd`) or a custom shell template string of the form
 * `<cmd> [opts] {0} [more_opts]`. When the author writes a template
 * verbatim — even if the first token matches a built-in name — the
 * runtime uses the template as-is and does not inject any default flags.
 *
 * Schema acceptance is broader than runtime support on purpose: the
 * runtime decides which shell it can actually drive on the current
 * platform.
 *
 * Contents:
 * - `BUILTIN_SHELLS` — readonly tuple of built-in shell names.
 * - `customShellTemplateRegex` — regex used by both schema and runtime
 *   to detect a template string.
 * - `shellSchema` — the union accepted at parse time.
 * - `Shell` — inferred output type (built-in name OR template string).
 */

import { z } from "zod";

/** Built-in shell names accepted as shorthand for the GHA-default invocation templates. */
export const BUILTIN_SHELLS = ["bash", "sh", "pwsh", "python", "cmd"] as const;

/**
 * Regex that matches a GHA-style custom shell template:
 * `<cmd> [opts] {0} [more_opts]`. The first whitespace-delimited token
 * is the command; `{0}` MUST appear exactly once and MUST be surrounded
 * by whitespace (so `perl{0}` is rejected — it would be ambiguous to
 * argv-tokenise).
 */
export const customShellTemplateRegex = /^\S+(\s+\S+)*\s+\{0\}(\s+\S+)*$/;

const customShellTemplateSchema = z
  .string()
  .regex(customShellTemplateRegex, "shell template must contain a {0} placeholder")
  .refine(
    (s) => (s.match(/\{0\}/g) ?? []).length === 1,
    "shell template must contain exactly one {0} placeholder",
  );

const builtinShellSchema = z.enum(BUILTIN_SHELLS);

/** Allowed values for `step.shell`: a built-in name or a custom template string. */
export const shellSchema = z.union([builtinShellSchema, customShellTemplateSchema]);

/** Inferred type — note that the union of `enum` and `string` collapses to `string` in TypeScript. */
export type Shell = z.infer<typeof shellSchema>;
```

- [ ] **Step 4: Re-run the schema tests**

Run: `cd packages/workflows && vp test schema-shell-custom`
Expected: PASS.

- [ ] **Step 5: Verify the workflows package as a whole still type-checks**

Run: `cd packages/workflows && vp check && vp test`
Expected: PASS (no type-check regression — `Shell` is now wider but every consumer treats it as a string, which is compatible).

- [ ] **Step 6: Write failing runtime tests for `parseCustomShellTemplate` and the routing**

Create `packages/runtime/tests/exec-shell-spec-custom.test.ts`:

```typescript
/**
 * Unit tests for the custom shell template path in `getShellInvocation`
 * and for `parseCustomShellTemplate`. End-to-end execution of a custom
 * shell is covered by an additional smoke test in e2e.test.ts (Step 9).
 */

import { describe, expect, test } from "vite-plus/test";

import { getShellInvocation, parseCustomShellTemplate } from "../src/exec/shell-spec.ts";

describe("parseCustomShellTemplate", () => {
  test("simple template with no extra args", () => {
    expect(parseCustomShellTemplate("perl {0}")).toEqual({
      bin: "perl",
      preArgs: [],
      postArgs: [],
    });
  });

  test("template with pre-args only", () => {
    expect(parseCustomShellTemplate("python -u {0}")).toEqual({
      bin: "python",
      preArgs: ["-u"],
      postArgs: [],
    });
  });

  test("template with post-args only", () => {
    expect(parseCustomShellTemplate("python {0} -m foo")).toEqual({
      bin: "python",
      preArgs: [],
      postArgs: ["-m", "foo"],
    });
  });

  test("template with both pre- and post-args", () => {
    expect(parseCustomShellTemplate("bash -x {0} arg1 arg2")).toEqual({
      bin: "bash",
      preArgs: ["-x"],
      postArgs: ["arg1", "arg2"],
    });
  });

  test("absolute-path command", () => {
    expect(parseCustomShellTemplate("/usr/bin/env python3 {0}")).toEqual({
      bin: "/usr/bin/env",
      preArgs: ["python3"],
      postArgs: [],
    });
  });
});

describe("getShellInvocation - custom shell template", () => {
  test("returns the parsed template with scriptPath substituted", () => {
    const inv = getShellInvocation("perl {0}", "/tmp/x", "linux", true);
    expect(inv.bin).toBe("perl");
    expect(inv.args).toEqual(["/tmp/x"]);
    expect(inv.extension).toBe("");
  });

  test("custom `bash {0}` does NOT inject --noprofile / -eo pipefail", () => {
    // Author asked for bare bash; GHA contract is verbatim execution.
    const inv = getShellInvocation("bash {0}", "/tmp/x", "linux", true);
    expect(inv.bin).toBe("bash");
    expect(inv.args).toEqual(["/tmp/x"]);
  });

  test("template with extra args wraps scriptPath in correct position", () => {
    const inv = getShellInvocation("bash -x {0} arg1", "/tmp/x", "linux", true);
    expect(inv.bin).toBe("bash");
    expect(inv.args).toEqual(["-x", "/tmp/x", "arg1"]);
  });
});
```

- [ ] **Step 7: Run the runtime tests to verify they fail**

Run: `cd packages/runtime && vp test exec-shell-spec-custom`
Expected: FAIL — `parseCustomShellTemplate` is not exported and the custom template path falls into the `bash` case (since `bash {0}` happens to start with "bash").

- [ ] **Step 8: Implement `parseCustomShellTemplate` and the routing**

In `packages/runtime/src/exec/shell-spec.ts`, import the regex and tuple from the workflows package (or duplicate them locally — see note below) and add the parser. The runtime package already depends on `@aiactions/workflows`, so import works:

```typescript
import { BUILTIN_SHELLS, customShellTemplateRegex, type Shell } from "@aiactions/workflows";
```

Replace the existing `import type { Shell } from ...` line with the new combined import. Then add the parser:

```typescript
/** Result of parsing a custom GHA shell template string. */
export interface ParsedCustomShellTemplate {
  /** First whitespace-delimited token of the template. */
  readonly bin: string;
  /** Tokens between `bin` and `{0}`. */
  readonly preArgs: readonly string[];
  /** Tokens after `{0}`. */
  readonly postArgs: readonly string[];
}

/**
 * Parse a GHA shell template string of the form
 * `<cmd> [opts] {0} [more_opts]` into its components. The schema layer
 * has already validated the regex shape; this function trusts that and
 * tokenises by whitespace.
 *
 * @throws {RuntimeError} if `{0}` is not present (defensive — should be
 *   blocked at the schema layer).
 */
export function parseCustomShellTemplate(template: string): ParsedCustomShellTemplate {
  const tokens = template.trim().split(/\s+/);
  const placeholderIdx = tokens.indexOf("{0}");
  if (placeholderIdx === -1) {
    // Defensive — the schema regex enforces presence of `{0}`.
    throw new RuntimeUnsupportedError(`shell template missing {0}: ${template}`);
  }
  const bin = tokens[0]!;
  const preArgs = tokens.slice(1, placeholderIdx);
  const postArgs = tokens.slice(placeholderIdx + 1);
  return { bin, preArgs, postArgs };
}
```

Then update `getShellInvocation` to detect and route custom templates first, before the built-in cases:

```typescript
export function getShellInvocation(
  shell: Shell | undefined,
  scriptPath: string,
  platform: NodeJS.Platform,
  bashAvailable: boolean,
): ShellInvocation {
  // Custom template: any non-builtin string that matches the template regex.
  if (typeof shell === "string" && !(BUILTIN_SHELLS as readonly string[]).includes(shell)) {
    if (!customShellTemplateRegex.test(shell)) {
      throw new RuntimeUnsupportedError(
        `shell value is neither a built-in nor a valid template: ${shell}`,
      );
    }
    const parsed = parseCustomShellTemplate(shell);
    return {
      bin: parsed.bin,
      args: [...parsed.preArgs, scriptPath, ...parsed.postArgs],
      extension: "",
    };
  }

  // ... existing built-in branches unchanged ...
}
```

The `Shell` type is now `z.infer<typeof shellSchema>` which is `string` (the union collapses), so the parameter type stays as `Shell | undefined` and the existing built-in checks (`shell === "bash"`, etc.) keep working.

- [ ] **Step 9: Add a runtime smoke test for the custom template**

Append to `packages/runtime/tests/run-workflow.test.ts` a new `describe.skipIf(!POSIX)` block:

```typescript
describe.skipIf(!POSIX)("runWorkflow — custom shell template", () => {
  test("`bash {0}` runs verbatim (no fail-fast injection)", async () => {
    const workflow = parseWorkflow({
      name: "custom-bash-smoke",
      jobs: {
        one: {
          steps: [
            {
              shell: "bash {0}",
              run: "echo before\nfalse\necho after\n",
            },
          ],
        },
      },
    });
    const result = await runWorkflow(workflow, { cwd: process.cwd() });
    // With `set -e`, the `false` would have aborted the script and
    // `echo after` would not have run. With bare bash, the script runs
    // to the end and exits with the last command's status (echo after
    // returns 0).
    expect(result.status).toBe("succeeded");
    const stdout = result.jobs.one?.steps[0]?.stdout ?? "";
    expect(stdout).toContain("before");
    expect(stdout).toContain("after");
  });
});
```

- [ ] **Step 10: Run the runtime tests**

Run: `cd packages/runtime && vp test exec-shell-spec-custom && vp test run-workflow -t "custom shell"`
Expected: PASS.

- [ ] **Step 11: Run the full suite (workflows + runtime)**

Run: `vp run -r test` from repo root.
Expected: PASS across all packages.

- [ ] **Step 12: Commit**

```bash
git add packages/workflows/src/schema/shell.ts \
        packages/workflows/tests/schema-shell-custom.test.ts \
        packages/runtime/src/exec/shell-spec.ts \
        packages/runtime/tests/exec-shell-spec-custom.test.ts \
        packages/runtime/tests/run-workflow.test.ts
git commit -m "$(cat <<'EOF'
feat(workflows,runtime): support custom shell templates (MS1.0.6 G2)

shell: now accepts either a built-in name (bash|sh|pwsh|python|cmd)
or a GHA-style template string `<cmd> [opts] {0} [more_opts]`. The
schema enforces a single {0} placeholder; the runtime parses the
template at execution time and substitutes the script path. When the
author writes a template, no default flags are injected — even
`shell: "bash {0}"` runs bare bash without --noprofile / -eo pipefail
(GHA-faithful escape hatch).

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

After commit, run `mcp__codebase-memory-mcp__detect_changes`.

---

## Task 4: `defaults.run` schema (workflow + job scope)

**Files:**

- Create: `packages/workflows/src/schema/defaults.ts`
- Modify: `packages/workflows/src/schema/workflow.ts:71-79` — add `defaults` to `baseWorkflowShape`
- Modify: `packages/workflows/src/schema/job.ts:42-50` — add `defaults` to `baseJobShape`
- Modify: `packages/workflows/src/index.ts` — re-export new types
- Test: `packages/workflows/tests/schema-defaults.test.ts` (new)

GHA exposes `defaults.run.{shell,working-directory}` at workflow scope and `jobs.<id>.defaults.run.{shell,working-directory}` at job scope. We mirror this exactly.

- [ ] **Step 1: Write failing schema tests**

Create `packages/workflows/tests/schema-defaults.test.ts`. The tests parse plain JS objects via `workflowSchema.safeParse` (mirroring the pattern in the existing `schema-workflow.test.ts`). The kebab-case input field `working-directory` is remapped to `workingDirectory` on output by `runDefaultsSchema.transform(...)`.

```typescript
/**
 * Tests for the `defaults.run.{shell,working-directory}` block at
 * workflow and job scope. Inheritance/precedence is enforced by the
 * runtime; the schema only validates shape.
 */

import { describe, expect, test } from "vite-plus/test";

import { workflowSchema } from "../src/schema/workflow.ts";

const minimalSteps = [{ run: "echo hi" }];

describe("workflow.defaults.run", () => {
  test("accepts shell + working-directory at workflow scope", () => {
    const result = workflowSchema.safeParse({
      name: "defaults-test",
      defaults: {
        run: {
          shell: "python",
          "working-directory": "./scripts",
        },
      },
      jobs: { one: { steps: minimalSteps } },
    });
    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.data.defaults?.run?.shell).toBe("python");
    expect(result.data.defaults?.run?.workingDirectory).toBe("./scripts");
  });

  test("accepts custom shell template at workflow scope", () => {
    const result = workflowSchema.safeParse({
      name: "defaults-test",
      defaults: { run: { shell: "perl {0}" } },
      jobs: { one: { steps: minimalSteps } },
    });
    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.data.defaults?.run?.shell).toBe("perl {0}");
  });

  test("accepts an empty defaults.run block", () => {
    const result = workflowSchema.safeParse({
      name: "defaults-test",
      defaults: { run: {} },
      jobs: { one: { steps: minimalSteps } },
    });
    expect(result.success).toBe(true);
  });

  test("rejects unknown keys under defaults.run", () => {
    const result = workflowSchema.safeParse({
      name: "defaults-test",
      defaults: { run: { bogus: "value" } },
      jobs: { one: { steps: minimalSteps } },
    });
    expect(result.success).toBe(false);
  });

  test("rejects unknown keys under defaults", () => {
    const result = workflowSchema.safeParse({
      name: "defaults-test",
      defaults: { notrun: { shell: "bash" } },
      jobs: { one: { steps: minimalSteps } },
    });
    expect(result.success).toBe(false);
  });
});

describe("job.defaults.run", () => {
  test("accepts shell + working-directory at job scope", () => {
    const result = workflowSchema.safeParse({
      name: "defaults-test",
      jobs: {
        one: {
          defaults: {
            run: {
              shell: "python",
              "working-directory": "./scripts",
            },
          },
          steps: [{ run: 'print("hi")' }],
        },
      },
    });
    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.data.jobs.one?.defaults?.run?.shell).toBe("python");
    expect(result.data.jobs.one?.defaults?.run?.workingDirectory).toBe("./scripts");
  });

  test("accepts both workflow- and job-level defaults", () => {
    const result = workflowSchema.safeParse({
      name: "defaults-test",
      defaults: { run: { shell: "bash" } },
      jobs: {
        one: {
          defaults: { run: { shell: "python" } },
          steps: [{ run: 'print("hi")' }],
        },
      },
    });
    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.data.defaults?.run?.shell).toBe("bash");
    expect(result.data.jobs.one?.defaults?.run?.shell).toBe("python");
  });
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `cd packages/workflows && vp test schema-defaults`
Expected: FAIL — `defaults` is rejected as an unknown key by `strictObject`.

- [ ] **Step 3: Create `packages/workflows/src/schema/defaults.ts`**

```typescript
/**
 * Zod schema for the `defaults.run` block, accepted at both workflow
 * and job scope. Mirrors GHA's shape exactly: `shell` and
 * `working-directory` are the only fields. Authors write the kebab-case
 * key in YAML; we transform to camelCase on output to match the rest of
 * the parsed model.
 *
 * Contents:
 * - `runDefaultsSchema` — the inner `run:` object.
 * - `defaultsSchema` — the outer wrapper (`{ run?: ... }`).
 * - `RunDefaults`, `Defaults` — inferred output types.
 */

import { z } from "zod";

import { expressionStringSchema } from "./expression.ts";
import { shellSchema } from "./shell.ts";

const baseRunDefaultsShape = z.strictObject({
  shell: shellSchema.optional(),
  "working-directory": expressionStringSchema.optional(),
});

/**
 * Inner `defaults.run` block. Remaps `working-directory` to camelCase on
 * output so consumers can read `defaults.run.workingDirectory` exactly
 * like `step.workingDirectory`.
 */
export const runDefaultsSchema = baseRunDefaultsShape.transform((d) => {
  const { "working-directory": workingDirectory, ...rest } = d;
  return {
    ...rest,
    ...(workingDirectory !== undefined && { workingDirectory }),
  };
});

/** Outer `defaults` wrapper. GHA only defines `defaults.run`; we mirror that. */
export const defaultsSchema = z.strictObject({
  run: runDefaultsSchema.optional(),
});

/** Inferred output type for the inner `run:` block. */
export type RunDefaults = z.infer<typeof runDefaultsSchema>;

/** Inferred output type for the outer `defaults` wrapper. */
export type Defaults = z.infer<typeof defaultsSchema>;
```

- [ ] **Step 4: Wire `defaults` into `workflowSchema`**

Edit `packages/workflows/src/schema/workflow.ts`. Add the import:

```typescript
import { defaultsSchema } from "./defaults.ts";
```

Add the field to `baseWorkflowShape`:

```typescript
const baseWorkflowShape = z.strictObject({
  name: z.string().regex(/\S/, "name must contain at least one non-whitespace character"),
  description: z
    .string()
    .regex(/\S/, "description must contain at least one non-whitespace character")
    .optional(),
  defaults: defaultsSchema.optional(),
  env: envSchema.optional(),
  passthrough: passthroughSchema.optional(),
  inputs: workflowInputsSchema.optional(),
  outputs: workflowOutputsSchema.optional(),
  jobs: z.record(jobIdSchema, jobSchema),
});
```

- [ ] **Step 5: Wire `defaults` into `jobSchema`**

Edit `packages/workflows/src/schema/job.ts`. Add the import:

```typescript
import { defaultsSchema } from "./defaults.ts";
```

Add the field to `baseJobShape`:

```typescript
const baseJobShape = z.strictObject({
  name: jobNameSchema.optional(),
  needs: jobNeedsSchema.optional(),
  if: ifSchema.optional(),
  defaults: defaultsSchema.optional(),
  env: envSchema.optional(),
  outputs: jobOutputsSchema.optional(),
  steps: z.array(stepSchema).min(1).optional(),
  uses: usesRefSchema.optional(),
  with: withSchema.optional(),
});
```

- [ ] **Step 6: Re-export the new types**

Edit `packages/workflows/src/index.ts` to add a barrel re-export. The file currently uses `export *` for every schema module; follow that convention by adding the line right after the other schema re-exports:

```typescript
export * from "./schema/defaults.ts";
```

(Place it adjacent to the other `export * from "./schema/..."` lines so the file stays grouped.)

- [ ] **Step 7: Run the schema tests**

Run: `cd packages/workflows && vp test schema-defaults`
Expected: PASS.

- [ ] **Step 8: Run the full workflows test suite + type-check**

Run: `cd packages/workflows && vp check && vp test`
Expected: PASS.

- [ ] **Step 9: Commit**

```bash
git add packages/workflows/src/schema/defaults.ts \
        packages/workflows/src/schema/workflow.ts \
        packages/workflows/src/schema/job.ts \
        packages/workflows/src/index.ts \
        packages/workflows/tests/schema-defaults.test.ts
git commit -m "$(cat <<'EOF'
feat(workflows): accept defaults.run at workflow and job scope (MS1.0.6)

Adds an optional `defaults.run.{shell,working-directory}` block to
both workflowSchema and jobSchema. GHA-faithful: only `defaults.run`
is recognised (no other defaults keys); unknown keys are rejected by
strictObject. The kebab-case `working-directory` field is remapped to
camelCase on output to match the rest of the parsed model.

Inheritance and precedence (step → job.defaults.run →
workflow.defaults.run) is enforced by the runtime in a follow-up
commit.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

After commit, run `mcp__codebase-memory-mcp__detect_changes`.

---

## Task 5: runtime — `effectiveShell` and `effectiveWorkingDirectory` resolution

**Files:**

- Modify: `packages/runtime/src/runner/job.ts` — add `workflowDefaults: RunDefaults | undefined` field on `JobRunRequest`; resolve effective shell + working-dir per `run:` step
- Modify: `packages/runtime/src/run-workflow.ts` — pass `workflow.defaults?.run` into `runJob`
- Test: `packages/runtime/tests/runner-job-defaults-shell.test.ts` (new)
- Test: `packages/runtime/tests/runner-job-defaults-workdir.test.ts` (new)

Precedence (most specific wins):

```
effectiveShell            = step.shell            ?? job.defaults?.run?.shell            ?? workflowDefaults?.shell
effectiveWorkingDirectory = step.workingDirectory ?? job.defaults?.run?.workingDirectory ?? workflowDefaults?.workingDirectory
```

`defaults.run.*` only applies to `run:` steps — `uses:` steps continue to ignore `working-directory:` (GHA-faithful).

- [ ] **Step 1: Write failing test for effective shell resolution**

Create `packages/runtime/tests/runner-job-defaults-shell.test.ts`. Tests are skipped if `python` is not on PATH (the precedence cases use it as a marker shell because its output is unmistakeable):

```typescript
/**
 * Tests for the step-level / job-level / workflow-level shell
 * inheritance chain. Each test asserts that the runtime spawns the
 * correct binary by inspecting the resolved invocation through a
 * minimal `runWorkflow` call.
 */

import { execFile } from "node:child_process";
import { promisify } from "node:util";

import { workflowSchema } from "@aiactions/workflows";
import { describe, expect, test } from "vite-plus/test";

import { runWorkflow } from "../src/run-workflow.ts";

const POSIX = process.platform !== "win32";
const parseWorkflow = (input: unknown) => workflowSchema.parse(input);
const pExecFile = promisify(execFile);
async function pythonAvailable(): Promise<boolean> {
  try {
    await pExecFile("python", ["--version"]);
    return true;
  } catch {
    return false;
  }
}

describe.skipIf(!POSIX)("runWorkflow — effective shell from defaults chain", () => {
  test("step.shell wins over job.defaults.run.shell over workflow.defaults.run.shell", async () => {
    if (!(await pythonAvailable())) return;
    const workflow = parseWorkflow({
      name: "precedence",
      defaults: { run: { shell: "sh" } },
      jobs: {
        one: {
          defaults: { run: { shell: "bash" } },
          steps: [{ shell: "python", run: 'print("from-python")' }],
        },
      },
    });
    const r = await runWorkflow(workflow, { cwd: process.cwd() });
    expect(r.status).toBe("succeeded");
    expect(r.jobs.one?.steps[0]?.stdout).toContain("from-python");
  });

  test("job.defaults.run.shell wins when step.shell unset", async () => {
    if (!(await pythonAvailable())) return;
    const workflow = parseWorkflow({
      name: "precedence",
      defaults: { run: { shell: "sh" } },
      jobs: {
        one: {
          defaults: { run: { shell: "python" } },
          steps: [{ run: 'print("from-job-default")' }],
        },
      },
    });
    const r = await runWorkflow(workflow, { cwd: process.cwd() });
    expect(r.status).toBe("succeeded");
    expect(r.jobs.one?.steps[0]?.stdout).toContain("from-job-default");
  });

  test("workflow.defaults.run.shell wins when step + job both unset", async () => {
    if (!(await pythonAvailable())) return;
    const workflow = parseWorkflow({
      name: "precedence",
      defaults: { run: { shell: "python" } },
      jobs: {
        one: { steps: [{ run: 'print("from-workflow-default")' }] },
      },
    });
    const r = await runWorkflow(workflow, { cwd: process.cwd() });
    expect(r.status).toBe("succeeded");
    expect(r.jobs.one?.steps[0]?.stdout).toContain("from-workflow-default");
  });

  test("no defaults anywhere falls back to platform default (bash on POSIX)", async () => {
    const workflow = parseWorkflow({
      name: "no-defaults",
      jobs: {
        one: { steps: [{ run: "echo from-bash-default" }] },
      },
    });
    const r = await runWorkflow(workflow, { cwd: process.cwd() });
    expect(r.status).toBe("succeeded");
    expect(r.jobs.one?.steps[0]?.stdout).toContain("from-bash-default");
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `cd packages/runtime && vp test runner-job-defaults-shell`
Expected: FAIL — the runtime ignores `defaults.run.shell` today, so the python-default cases either run as bash and crash on `print(...)` syntax, or report the wrong stdout.

- [ ] **Step 3: Extend `JobRunRequest` and resolve effective shell**

Open `packages/runtime/src/runner/job.ts`. Add the import:

```typescript
import type { RunDefaults } from "@aiactions/workflows";
```

Add the field on `JobRunRequest` (insert near `bashAvailable`):

```typescript
export interface JobRunRequest {
  // ... existing fields ...
  workflowDefaults: RunDefaults | undefined;
  bashAvailable: boolean;
}
```

Inside `runJob`, in the `run:` branch (the section after `if (step.run === undefined)`), compute the effective shell _before_ calling `getShellInvocation`. Replace the existing two `getShellInvocation(step.shell, ...)` calls with `getShellInvocation(effectiveShell, ...)`:

```typescript
const effectiveShell =
  step.shell ?? request.job.defaults?.run?.shell ?? request.workflowDefaults?.shell;

const placeholder = getShellInvocation(
  effectiveShell,
  "<placeholder>",
  process.platform,
  request.bashAvailable,
);
const handle = await writeScript(
  runBody,
  request.runId,
  i,
  placeholder.extension,
  process.platform,
);
const concrete = getShellInvocation(
  effectiveShell,
  handle.path,
  process.platform,
  request.bashAvailable,
);
```

- [ ] **Step 4: Pass `workflowDefaults` from `runWorkflow` into `runJob`**

Open `packages/runtime/src/run-workflow.ts`. Locate the call(s) to `runJob`. In the constructed `JobRunRequest`, add:

```typescript
workflowDefaults: workflow.defaults?.run,
```

The `workflow` symbol here is the parsed `Workflow` value (the file already imports `Workflow` from `@aiactions/workflows`).

- [ ] **Step 5: Run the new test**

Run: `cd packages/runtime && vp test runner-job-defaults-shell`
Expected: PASS (some tests may still skip if `python` is not on PATH — confirm a failing case rather than a skip if all four "from-python" / "from-job-default" / "from-workflow-default" lines are missing).

- [ ] **Step 6: Write failing test for effective working directory**

Create `packages/runtime/tests/runner-job-defaults-workdir.test.ts`:

```typescript
/**
 * Tests for `defaults.run.working-directory` inheritance. Mirrors the
 * shell precedence test. We use `pwd` to verify the effective cwd of
 * the spawned process. Skipped on Windows because `pwd` is a POSIX
 * shell builtin.
 */

import { mkdir, mkdtemp } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { workflowSchema } from "@aiactions/workflows";
import { describe, expect, test } from "vite-plus/test";

import { runWorkflow } from "../src/run-workflow.ts";

const POSIX = process.platform !== "win32";
const parseWorkflow = (input: unknown) => workflowSchema.parse(input);

async function makeFixture(): Promise<{ root: string; sub: string }> {
  const root = await mkdtemp(join(tmpdir(), "aiactions-workdir-"));
  const sub = join(root, "scripts");
  await mkdir(sub, { recursive: true });
  return { root, sub };
}

describe.skipIf(!POSIX)("runWorkflow — effective working-directory from defaults chain", () => {
  test("step.working-directory wins over job over workflow", async () => {
    const { root, sub } = await makeFixture();
    const workflow = parseWorkflow({
      name: "precedence",
      defaults: { run: { "working-directory": "/nonexistent" } },
      jobs: {
        one: {
          defaults: { run: { "working-directory": "/also-nope" } },
          steps: [{ "working-directory": sub, run: "pwd" }],
        },
      },
    });
    const r = await runWorkflow(workflow, { cwd: root });
    expect(r.status).toBe("succeeded");
    expect(r.jobs.one?.steps[0]?.stdout.trim()).toBe(sub);
  });

  test("job.defaults.run.working-directory wins when step unset", async () => {
    const { root, sub } = await makeFixture();
    const workflow = parseWorkflow({
      name: "precedence",
      jobs: {
        one: {
          defaults: { run: { "working-directory": sub } },
          steps: [{ run: "pwd" }],
        },
      },
    });
    const r = await runWorkflow(workflow, { cwd: root });
    expect(r.status).toBe("succeeded");
    expect(r.jobs.one?.steps[0]?.stdout.trim()).toBe(sub);
  });

  test("workflow.defaults.run.working-directory wins when step + job unset", async () => {
    const { root, sub } = await makeFixture();
    const workflow = parseWorkflow({
      name: "precedence",
      defaults: { run: { "working-directory": sub } },
      jobs: {
        one: { steps: [{ run: "pwd" }] },
      },
    });
    const r = await runWorkflow(workflow, { cwd: root });
    expect(r.status).toBe("succeeded");
    expect(r.jobs.one?.steps[0]?.stdout.trim()).toBe(sub);
  });

  test("no defaults anywhere uses runWorkflow's cwd", async () => {
    const { root } = await makeFixture();
    const workflow = parseWorkflow({
      name: "no-defaults",
      jobs: {
        one: { steps: [{ run: "pwd" }] },
      },
    });
    const r = await runWorkflow(workflow, { cwd: root });
    expect(r.status).toBe("succeeded");
    expect(r.jobs.one?.steps[0]?.stdout.trim()).toBe(root);
  });
});
```

- [ ] **Step 7: Run the working-dir test to verify it fails**

Run: `cd packages/runtime && vp test runner-job-defaults-workdir`
Expected: FAIL on the `job.defaults.run.workingDirectory` and `workflow.defaults.run.workingDirectory` cases — runtime currently only consults `step.workingDirectory`.

- [ ] **Step 8: Resolve effective working-directory in `runJob`**

In `packages/runtime/src/runner/job.ts`, inside the `run:` branch, replace the existing `stepWorkingDir` block with the inheritance-aware version:

```typescript
const rawWorkingDir =
  step.workingDirectory ??
  request.job.defaults?.run?.workingDirectory ??
  request.workflowDefaults?.workingDirectory;

const stepWorkingDir =
  rawWorkingDir !== undefined ? evaluateExpression(rawWorkingDir, fullCtx) : undefined;
const stepCwd =
  stepWorkingDir !== undefined ? resolvePath(request.cwd, stepWorkingDir) : request.cwd;
```

- [ ] **Step 9: Run the working-dir test**

Run: `cd packages/runtime && vp test runner-job-defaults-workdir`
Expected: PASS.

- [ ] **Step 10: Run the full runtime suite**

Run: `cd packages/runtime && vp test`
Expected: PASS — all 4 new defaults-shell tests + 4 new defaults-workdir tests on top of the prior suite.

- [ ] **Step 11: Commit**

```bash
git add packages/runtime/src/runner/job.ts \
        packages/runtime/src/run-workflow.ts \
        packages/runtime/tests/runner-job-defaults-shell.test.ts \
        packages/runtime/tests/runner-job-defaults-workdir.test.ts
git commit -m "$(cat <<'EOF'
feat(runtime): apply defaults.run inheritance for shell + workdir (MS1.0.6)

Adds JobRunRequest.workflowDefaults and resolves the effective shell
and effective working directory of every run: step from the
inheritance chain (step → job.defaults.run → workflow.defaults.run).
GHA-faithful precedence: most specific wins. uses: steps continue to
ignore working-directory (defaults.run only governs run: steps).

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

After commit, run `mcp__codebase-memory-mcp__detect_changes`.

---

## Task 6: design doc, JSON schema regen, full verification, memory update

**Files:**

- Create: `docs/superpowers/specs/2026-05-04-ms1-0-6-shell-parity-design.md`
- Run: `vp run gen:schemas` (regenerates `tools/json-schemas/workflow-schema.json` from Zod)
- Run: `vp run ready`
- Update: muninn vault `aiactions` — close the milestone with a summary memory

- [ ] **Step 1: Write the design doc**

Create `docs/superpowers/specs/2026-05-04-ms1-0-6-shell-parity-design.md`:

```markdown
# MS1.0.6 — Shell Parity — Design

**Date:** 2026-05-04
**Status:** Implemented (squash-merged as `<commit-sha>` on main).
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
that lost its python toolchain.

### D5. Schema-runtime split for custom templates

The schema validates the `<cmd> [...] {0} [...]` shape via a regex.
The runtime parses the same regex into `{ bin, preArgs, postArgs }`
before spawn. We do not parse at the schema layer because the parsed
shape is a runtime concern and putting it in the schema would force
all downstream consumers (e.g. JSON Schema generation) to know about
it.

## Implications for downstream milestones

- MS1.2 (trust-tier env curation) needs to gate custom shell templates
  for third-party `uses:` actions — a malicious action could declare
  `shell: rm {0}` and have the loader execute it. This plan does NOT
  add that gate; MS1.2 owns the policy decision.
```

- [ ] **Step 2: Regenerate the JSON Schema artefacts**

Run: `vp run gen:schemas` from repo root.
Expected: `tools/json-schemas/workflow-schema.json` (and any other generated artefact) is regenerated. The diff should show:

- `defaults` added to the workflow root.
- `defaults` added inside each job.
- `shell` field becomes an `anyOf` of the enum and the regex string.

If the diff shape is unexpected, stop and inspect the generator (likely under `tools/json-schemas/`) before continuing.

- [ ] **Step 3: Run the full pre-commit gate**

Run: `vp run ready` from repo root.
Expected: PASS — `vp check && vp run -r test && vp run -r build` all green.

- [ ] **Step 4: Commit the design doc + regenerated schemas**

```bash
git add docs/superpowers/specs/2026-05-04-ms1-0-6-shell-parity-design.md \
        tools/json-schemas/
git commit -m "$(cat <<'EOF'
docs(specs): MS1.0.6 shell parity design + regenerate JSON schemas

Closes MS1.0.6. The design notes record the four locked decisions
(custom templates as escape hatch, defaults.run governs run: only,
bash probe is per-run, python literal — not python3) and the schema
layer/runtime split for template parsing. JSON Schema artefacts are
regenerated from the updated Zod sources.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

- [ ] **Step 5: Squash-merge into `main`**

Open a PR or run the squash-merge directly per project convention:

```bash
git checkout main
git merge --squash feat/ms1-0-6-shell-parity
git commit -m "$(cat <<'EOF'
feat(runtime): GHA-faithful shell parity (MS1.0.6)

Brings run: step execution to full GHA parity:
- shell: python now executes (`python {0}`).
- Custom shell templates (`<cmd> [opts] {0} [more]`) accepted at the
  schema level and parsed at runtime; verbatim execution gives
  authors a documented escape hatch from default flags.
- POSIX bash → sh fallback when bash is absent on PATH (probed once
  per runWorkflow).
- defaults.run.{shell,working-directory} inheritance at workflow and
  job scope; precedence step → job → workflow.

Closes MS1.0.6. Reference: docs/superpowers/specs/2026-05-04-ms1-0-6-shell-parity-design.md

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

- [ ] **Step 6: Refresh the codebase-memory index**

Run:

```
mcp__codebase-memory-mcp__detect_changes(project: "home-aperrix-Documents-PROJECTS-aiactions", since: "HEAD~1")
```

If the report shows "significant structural drift" (more than ~10 files modified), follow up with:

```
mcp__codebase-memory-mcp__index_repository(repo_path: "/home/aperrix/Documents/PROJECTS/aiactions", mode: "moderate")
```

- [ ] **Step 7: Persist the milestone-closing memory in MuninnDB**

Save a single atomic `decision`-typed memory in vault `aiactions`:

- `concept`: `ms1-0-6-shipped`
- `summary`: One sentence — what shipped, on what commit, on what date.
- `content`: Full breakdown — what shipped (per gap), key decisions (D1-D5 from the design doc), tests added (counts), open follow-ups for MS1.2.
- `tags`: `["ms1.0.6", "runtime", "workflows", "shell", "shipped"]`
- `entities`: list any new modules / files that future sessions will need to find.

Use `mcp__muninn__muninn_remember` (vault `"aiactions"`).

- [ ] **Step 8: Delete the feature branch**

```bash
git branch -d feat/ms1-0-6-shell-parity
```

(`-d` refuses to delete an unmerged branch — if it complains, the squash-merge did not happen; investigate before forcing.)

---

## Final verification checklist

Before declaring the milestone shipped, confirm each of the following:

- [ ] `vp run ready` is green from a clean checkout of `main` after the squash-merge.
- [ ] `mcp__codebase-memory-mcp__detect_changes` for `home-aperrix-Documents-PROJECTS-aiactions` returns no unexpected drift.
- [ ] The new design doc is in `docs/superpowers/specs/`, not in `docs/superpowers/plans/`.
- [ ] `tools/json-schemas/workflow-schema.json` reflects the new `defaults` blocks and the relaxed `shell` field.
- [ ] muninn vault `aiactions` contains `ms1-0-6-shipped` and references the squash-merge commit hash.
- [ ] `python` smoke test in `e2e.test.ts` either passes or skips cleanly when `python` is missing.
