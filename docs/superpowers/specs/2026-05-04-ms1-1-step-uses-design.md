# MS1.1 — `step.uses:` execution

**Status**: design
**Date**: 2026-05-04
**Author**: Aperrix + Claude (pair-design)
**Predecessors**: MS1.0 (`run:` executor), MS1.0.5 (`if:` expression strings)
**Successor**: MS1.2 (multi-version registry resolution + trust-tier env curation)

## Goal

Wire `step.uses:` execution into the `@aiactions/runtime` job runner. Replace the `RuntimeUnsupportedError` thrown at `packages/runtime/src/runner/job.ts:197` with a real subprocess-based executor that resolves a `UsesRef`, spawns the action's main module in a child process, captures outputs over a dedicated IPC channel, and feeds outputs back into expression evaluation for downstream steps.

## Non-goals (MS1.1)

- **Multi-version registry resolution.** `@<ver>` in `RegistryRef` is parsed but ignored at resolution time. Single canonical version per action on disk. Multi-version selection deferred to MS1.2.
- **Trust-tier env curation.** All `uses:` steps receive the same env as `run:` steps (tier-1 baseline). Strict empty-allowlist for third-party `uses:` and `SSH_AUTH_SOCK` hard-block deferred to MS1.2.
- **Non-`bun-module` runners.** `manifest.runs.using` other than `"bun-module"` (e.g. `node-module`, `composite`, `docker`) → `RuntimeUnsupportedError`.
- **Output schema enforcement.** Outputs emitted that are not declared in `manifest.outputs` log a warning but do not fail the step.
- **Caching.** Resolution is filesystem-only; no installation, no download, no cache directory.

## Locked decisions (do not re-debate)

- **Ref grammar**: `registry | local` (no git refs). Shipped in `packages/workflows/src/schema/ref.ts`.
- **Layout**: `actions/<ns>/<name>/` (namespaced, GHA-faithful). Workspace pattern in root `package.json` to be patched from `actions/*` to `actions/*/*`.
- **Process model**: subprocess + IPC (FD 3). In-process `await import()` rejected because the next milestone introduces AI-provider actions (Claude, Codex) — long-running LLM calls with heavy SDK dependencies that benefit from process isolation, native abort signal handling, and crash containment.
- **Action manifest schema**: `aiaction.yaml` already shipped in `@aiactions/workflows/src/schema/action-manifest.ts`. Reused as-is.
- **`working-directory`** on a `uses:` step: ignored (GHA-faithful, action always runs from its own dir).
- **Default registry root**: `<repo-root>/actions/`, overridable via `RunOptions.registryRoot`.

## Architecture

New module under `packages/runtime/src/runner/uses/`:

```
packages/runtime/src/runner/uses/
  resolver.ts        # Ref → { manifest, dir }
  context.ts         # ActionContext type + builder
  loader.ts          # Subprocess entry-point script
  exec.ts            # spawn + stdio orchestration (called from job.ts)
  protocol.ts        # FD3 line-delimited JSON encoding/parsing
  index.ts           # barrel
```

### Boundaries

- `resolver.ts` knows nothing about subprocesses or IPC.
- `protocol.ts` knows nothing about spawn or filesystem.
- `loader.ts` runs in the child process; cannot import runtime types beyond a small shared protocol module.
- `exec.ts` is the only file that calls `child_process.spawn`.

## Components

### 1. `resolver.ts`

```typescript
interface ResolvedAction {
  readonly manifest: ActionManifest;
  readonly dir: string;
}

interface ResolverContext {
  readonly workflowFile: string;
  readonly registryRoot: string;
}

resolveUsesRef(ref: UsesRef, ctx: ResolverContext): Promise<ResolvedAction>
```

- `LocalRef` (`./...` or `file:///...`) → `path.resolve(path.dirname(ctx.workflowFile), ref.path)`.
- `RegistryRef` → `path.join(ctx.registryRoot, ref.namespace, ref.name)`. `ref.version` parsed but unused (MS1.2).
- Loads `aiaction.yaml` via shipped `parseActionManifest`. Throws:
  - `ActionResolutionError` if the directory does not exist.
  - `ActionManifestError` if `aiaction.yaml` is missing or malformed.
  - `RuntimeUnsupportedError` if `manifest.runs.using !== "bun-module"`.

### 2. `context.ts`

```typescript
interface ActionContext {
  readonly inputs: Record<string, string>;
  readonly env: Record<string, string>;
  readonly cwd: string;
  readonly signal: AbortSignal;
  emitOutput(name: string, value: string): void;
  log(level: "debug" | "info" | "warn" | "error", message: string): void;
}
```

Type-only on the parent side. The actual builder lives in `loader.ts` because the `ActionContext` is constructed inside the child process.

### 3. `loader.ts`

Subprocess entry-point. Run as `process.execPath loader.js`. Booted with:

- `RUNNER_ACTION_MAIN` env: absolute path to `manifest.runs.main` (resolved against the action's dir).
- stdin: a single JSON line with `{ inputs: Record<string, string> }`.
- FD 3: write-end pipe for emitted outputs / logs / errors (line-delimited JSON, one record per line).

Boot sequence:

1. Read stdin until EOF, parse JSON payload.
2. Build `AbortController` listening on a dedicated SIGTERM handler.
3. Build `ActionContext` with `emitOutput` / `log` writing to FD 3.
4. `await import(process.env.RUNNER_ACTION_MAIN!)` then `await mod.run(ctx)`.
5. Catch any thrown error → write `{ type: "error", message, stack }` to FD 3 → `process.exit(1)`.
6. On success → flush FD 3 → `process.exit(0)`.

Constraint: works under both Bun and Node. Plain ESM dynamic `import()` only. No Bun-specific APIs.

### 4. `exec.ts`

```typescript
interface UsesExecRequest {
  readonly resolved: ResolvedAction;
  readonly inputs: Record<string, string>;
  readonly env: Record<string, string>;
  readonly signal: AbortSignal;
  readonly timeoutMs?: number;
  readonly emit?: (event: RuntimeEvent) => void;
  readonly stepIndex: number;
  readonly stepId?: string;
  readonly jobId: string;
}

interface UsesExecResult {
  readonly exitCode: number | null;
  readonly status: RunStatus;
  readonly outputs: Record<string, string>;
  readonly stdout: string;
  readonly stderr: string;
  readonly capturedError?: { message: string; stack?: string };
}

executeUsesStep(request: UsesExecRequest): Promise<UsesExecResult>
```

Spawns the loader with:

- `argv`: `[process.execPath, loaderPath]`.
- `env`: `{ ...request.env, RUNNER_ACTION_MAIN: <absolute main path> }`.
- `cwd`: `request.resolved.dir` (GHA-faithful).
- `stdio`: `["pipe", "pipe", "pipe", "pipe"]` (FD 3 supplémentaire).
- `detached: true` on POSIX (process-group leader; reuses pattern from memory `process-group-kill-on-posix-spawn`).

Writes the inputs payload to stdin, closes stdin, then:

- Streams stdout / stderr via `step-stdout` / `step-stderr` events.
- Streams FD 3 through `protocol.parseStream` → routes `output` / `log` / `error` records.
- On `signal.aborted` → `process.kill(-pid, "SIGTERM")` then `SIGKILL` after grace.
- On `timeoutMs` exceeded → same kill cascade, status `failed` with timeout cause.

### 5. `protocol.ts`

Line-delimited JSON over FD 3. Frame schema:

```typescript
type Frame =
  | { type: "output"; name: string; value: string }
  | { type: "log"; level: "debug" | "info" | "warn" | "error"; message: string }
  | { type: "error"; message: string; stack?: string };
```

Streaming parser:

- Line-buffered. Splits on `\n`.
- Max line size: 1 MiB. Above → `ActionProtocolError` (fail-fast, prevents OOM if action floods).
- Partial line at EOF → drop + emit a `runtime-warning` event. Run survives.
- Invalid JSON line → `ActionProtocolError` per line; line dropped, run survives, event emitted.
- Unknown `type` → `ActionProtocolError` per line; line dropped, run survives, event emitted.

### 6. `job.ts` modifications

At `packages/runtime/src/runner/job.ts:197` (the throw site):

```typescript
if (step.uses !== undefined) {
  const ref = step.uses; // already typed UsesRef after schema parsing
  const resolved = await resolveUsesRef(ref, {
    workflowFile: request.workflowFile,
    registryRoot: request.registryRoot,
  });
  const inputs = interpolateInputMap(step.with ?? {}, fullCtx);
  const result = await executeUsesStep({
    resolved,
    inputs,
    env: fullEnv,
    signal: request.signal,
    timeoutMs: step.timeoutMinutes !== undefined ? step.timeoutMinutes * 60_000 : undefined,
    emit,
    stepIndex: i,
    stepId: step.id,
    jobId: request.jobId,
  });
  // map result -> StepResult, push into stepResults
  // record outputs into stepOutputsByStepId[step.id] if step.id !== undefined
  // emit step-completed
  continue;
}
```

`runJob` accumulates `stepOutputsByStepId: Map<string, Record<string, string>>` across the loop and threads it into the `EvalContext` for subsequent steps.

### 7. Expression evaluator extension

`packages/workflows/src/schema/expression.ts`:

```typescript
interface EvalContext {
  readonly env: Record<string, string>;
  readonly inputs: Record<string, string>;
  readonly steps?: Record<string, { outputs: Record<string, string> }>;
}
```

New lookup path: `steps.<id>.outputs.<key>`.

- Step id never declared in workflow → `ExpressionError` (`unknown step id: <id>`). Fail-fast wins ergonomics. Divergence from GHA is intentional and documented (typo of step id is almost always a bug; GHA's silent empty-string is a footgun).
- Step id declared but step skipped/failed → output absent → empty string (GHA-faithful).
- Output key absent in declared, succeeded step → empty string.

## Data flow

Run of a single `uses:` step:

```
job.ts step loop, step i, step.uses defined:
  resolveUsesRef(usesRef, { workflowFile, registryRoot })
    → { manifest, dir }            // throws ActionResolutionError / ActionManifestError
  build inputs   = interpolate(step.with, fullCtx)
  build env      = { ...workflowJobEnv, ...stepEnv }    // tier-1 baseline (= run: env)
  build cwd      = resolved.dir                          // GHA-faithful
  build signal   = request.signal
  executeUsesStep(...)
    spawn(execPath, [loaderPath], { env, cwd, stdio:[pipe,pipe,pipe,pipe], detached })
    child stdin  ← JSON({ inputs })
    child FD3    → protocol.parseStream
                     ├─ "output" → outputs[name] = value     (last write wins)
                     ├─ "log"    → emit step-log event
                     └─ "error"  → capturedError = { ... }
    child stdout/stderr → captured + emit step-stdout/step-stderr events
    child close → { exitCode, outputs, capturedError? }
  push StepResult; if step.id then stepOutputsByStepId[step.id] = outputs
  emit step-completed
```

Loader inside the child:

```
loader boot:
  read stdin (single JSON line) → { inputs }
  build ctx = {
    inputs,
    env: process.env,
    cwd: process.cwd(),
    signal: AbortSignal (wired to SIGTERM handler),
    emitOutput(n,v) → write FD3 line { type:"output", name:n, value:v }
    log(lvl,msg)    → write FD3 line { type:"log", level:lvl, message:msg }
  }
  try {
    mod = await import(process.env.RUNNER_ACTION_MAIN)
    await mod.run(ctx)
  } catch (e) {
    write FD3 { type:"error", message: e.message, stack: e.stack }
    flush FD3
    exit(1)
  }
  flush FD3
  exit(0)
```

## Error handling

New errors in `packages/runtime/src/errors.ts`:

```typescript
class ActionResolutionError extends RuntimeError {} // ref → dir failed
class ActionManifestError extends RuntimeError {} // aiaction.yaml malformed
class ActionProtocolError extends RuntimeError {} // FD3 invalid frame
class ActionExecutionError extends RuntimeError {} // child non-zero exit OR error frame
```

| Failure                                            | Class                                        | Step status           | Job status  |
| -------------------------------------------------- | -------------------------------------------- | --------------------- | ----------- |
| `RegistryRef` namespace+name dir absent            | `ActionResolutionError`                      | `failed`              | propagates  |
| `LocalRef` path absent                             | `ActionResolutionError`                      | `failed`              | propagates  |
| `aiaction.yaml` parse fail                         | `ActionManifestError`                        | `failed`              | propagates  |
| `manifest.runs.using !== "bun-module"`             | `RuntimeUnsupportedError`                    | `failed`              | propagates  |
| `manifest.runs.main` import throws                 | `ActionExecutionError` (with error frame)    | `failed`              | propagates  |
| Action `run()` throws                              | `ActionExecutionError` (with error frame)    | `failed`              | propagates  |
| Child crashes hard (segfault, OOM, no error frame) | `ActionExecutionError` (with `exitCode`)     | `failed`              | propagates  |
| FD3 invalid JSON / unknown type / line >1 MiB      | `ActionProtocolError` (logged, line dropped) | `succeeded` if exit 0 | —           |
| Run aborted mid-action                             | process-group SIGTERM → SIGKILL escalation   | `cancelled`           | `cancelled` |
| Action exceeds `timeoutMinutes`                    | timeout kill via existing primitive          | `failed`              | propagates  |

No silent swallowing. Any unexpected error is rethrown (engineering principle "fail-fast").

## Testing

New test files in `packages/runtime/tests/`:

```
runner-uses-resolver.test.ts        # unit
runner-uses-protocol.test.ts        # unit
runner-uses.test.ts                  # integration end-to-end
runner-outputs-eval.test.ts          # unit
```

Fixtures in `packages/runtime/tests/fixtures/actions/` (mirrors `packages/workflows/tests/fixtures/actions/echo/`):

```
echo/aiaction.yaml + echo/index.js              # input → output
crashing/aiaction.yaml + crashing/index.js      # action throws
slow/aiaction.yaml + slow/index.js              # action sleeps; tests abort + timeout
two-outputs/aiaction.yaml + two-outputs/index.js
```

### Resolver unit tests

- `LocalRef` relative resolved against workflow dir.
- `LocalRef` `file:///abs/path` resolved as-is.
- `RegistryRef` resolved to `<registryRoot>/<ns>/<name>`.
- Directory absent → `ActionResolutionError`.
- Manifest absent → `ActionManifestError`.
- Manifest with `runs.using = "node-module"` → `RuntimeUnsupportedError`.

### Protocol unit tests

- Valid `output` / `log` / `error` frames.
- Multiple frames in one chunk (line buffering correctness).
- Frame split across two chunks (partial line correctness).
- Invalid JSON line → `ActionProtocolError`, run survives.
- Line size > 1 MiB → `ActionProtocolError`.
- Partial line at EOF → warning event emitted, run survives.

### Integration end-to-end tests

- 1 job, 2 steps: step `s1` `uses: ./fixtures/actions/echo` with `with: { msg: "hi" }`, step `s2` `run: echo "${{ steps.s1.outputs.echoed }}"`. Assert `s2`'s captured stdout contains "hi".
- Step using `crashing` action → step `failed`, job `failed`, error message captured.
- Step using `slow` action with abort triggered after step start → step `cancelled`, child receives SIGTERM (verified via fixture writing a sentinel file on SIGTERM).
- Step using `slow` action with `timeoutMinutes` exceeded → step `failed` with timeout cause.

### Expression evaluator unit tests

- `${{ steps.s1.outputs.foo }}` with `s1` having emitted `foo=bar` → `"bar"`.
- Unknown step id → `ExpressionError`.
- Known step id but output absent → `""`.
- Known step id but step failed → `""`.

### Test policy

- No mocks for spawn or FD3. Real subprocess, real pipes (project rule: integration tests must hit real systems, not mocks).
- Fixtures deterministic. No timing-based assertions beyond timeout / abort tests, and those use sentinel files rather than wall-clock waits.
- Cross-runtime: tests must pass under both Bun (`vp test`) and a Node-only execution path. To verify: a single integration test parameterized over `process.execPath` candidates.

## Implementation slicing

Suggested squash-merge boundaries (each is one feature branch):

- **a — Workspace pattern fix.** Patch root `package.json` workspace pattern from `actions/*` to `actions/*/*`. One-liner; independent of every other slice and ships first to unblock fixture creation.
- **b — Errors + types + `JobRunRequest` extension.** Add `ActionResolutionError`, `ActionManifestError`, `ActionProtocolError`, `ActionExecutionError`. Add `ActionContext` type. Extend `JobRunRequest` (in `packages/runtime/src/runner/job.ts`) with `workflowFile: string` and `registryRoot: string` (default value computed in `runWorkflow`). No behaviour change yet beyond the new fields being threaded through.
- **c — Resolver.** `resolveUsesRef` + unit tests.
- **d — Protocol.** `parseStream` + unit tests.
- **e — Loader.** Subprocess entry-point + a smoke test that runs it standalone with a hand-crafted action fixture.
- **f — Exec.** `executeUsesStep` + unit-ish tests for spawn behaviour with the smoke fixture.
- **g — Wire-in.** Replace `job.ts:197` throw with the new path. Thread `stepOutputsByStepId`. Extend `EvalContext.steps`. Extend `evaluateExpression`. End-to-end integration tests.

Slice **a** ships independently. Slices **b**–**f** ship behind the still-throwing `step.uses !== undefined` guard at `job.ts:197`; the guard remains in place because each slice adds machinery without wiring it into the runner. Slice **g** removes the guard and activates the path.

## Open questions for impl

- Cross-runtime CI: confirm whether `vp test` runs only under Bun or also under Node. If Bun-only, document the cross-runtime guarantee as best-effort and add a manual Node smoke test rather than parameterizing CI.
- `runtime-warning` event kind: verify whether the `RuntimeEvent` union already has a "warning" kind for non-fatal protocol misbehaviour. If not, add it as part of slice **b**.
- Memory `shareable-actions-live-in-dedicated-monorepo` (id `01KQS7P6Q1QYF5M0NA7AC2F2D7`) is now stale: the registry is colocated in the AIactions repo under `actions/`, not in a separate dedicated monorepo. Update via `muninn_evolve` at session close.

## Risks

- **Loader path discovery**. The loader script must be locatable from the runtime package at runtime (post-build). Plan: ship it as a regular ESM file under `packages/runtime/src/runner/uses/loader.ts`, ensure `vp pack` / source-as-exports model includes it, derive its absolute path via `import.meta.url` at spawn time.
- **FD 3 portability**. Linux + macOS support FD 3 cleanly. Windows requires named pipes or alternative approach. MS1.1 targets Linux/macOS native (per MS1.0 baseline); Windows path documented as best-effort, may degrade to stdout-with-sentinel if FD 3 proves unworkable. Tracked as MS1.x follow-up if Windows becomes a priority.
- **Output collision with `with:` interpolation**. `step.with` values may themselves contain `${{ steps.X.outputs.Y }}` references. The interpolation must run with the up-to-date `EvalContext.steps` of the current job. Verified by integration test "two steps, second consumes first's output via `with:`".
