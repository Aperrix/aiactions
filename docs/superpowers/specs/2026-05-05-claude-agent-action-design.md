# Design — `claude/agent` (first public AIaction)

| Field         | Value                                               |
| ------------- | --------------------------------------------------- |
| Date          | 2026-05-05                                          |
| Author        | Aperrix + Claude (Opus 4.7)                         |
| Milestone tag | MS1.3                                               |
| Branch        | `feat/claude-agent-action`                          |
| Status        | Proposed — awaiting user review                     |
| Supersedes    | `ms1-3-cli-brainstorm-seed` (CLI scaffold deferred) |

## 1. Goal

Ship `claude/agent@v1`, the first public AIaction in the AIactions registry. The action is a thin wrapper over `@anthropic-ai/claude-agent-sdk`'s `query()` function. Given a prompt, it spawns a Claude Code agent loop in a workflow step and surfaces the final assistant text, session id, transcript, and usage metrics as step outputs.

## 2. Non-goals (v1)

- No agent **orchestration** primitives (multi-agent teams, plan→implement→review pipelines). Those compose at the workflow level by chaining multiple `claude/agent` steps, or arrive later as separate actions (`claude/team`, `claude/review`, …) once `using: "composite"` lands.
- No structured-output (`outputFormat: { type: 'json_schema' }`) support. Deferred to v1.x — opt-in input.
- No SDK callback surfaces (`canUseTool`, `hooks`, `agents`, `plugins`, `sandbox`, `enableFileCheckpointing`). Not portable through string-only YAML inputs.
- No bundling of the SDK's platform binaries. The action delegates to the user's local `claude` binary.
- No auth handling. The SDK reads the user's existing login state.
- No CLI scaffold (`@aiactions/cli` install command). Deferred to a later milestone.

## 3. Why now

- AIactions has all primitives required to host an action: `step.uses` execution + FD3 IPC (MS1.1), registry fetch from canonical URL (MS1.2). What's missing is **a real action to consume them**.
- Without a dogfoodable first-party action, AIactions cannot demonstrate its value proposition or catch real-world ergonomic issues in the manifest / IPC contracts.
- `claude/agent` is the foundational primitive every higher-level coding workflow will eventually depend on (planning, implementing, reviewing). Building it first unblocks every workflow downstream.

## 4. Background — what we are matching

### 4.1 Archon's `ClaudeProvider`

Reference implementation: `home-aperrix-Documents-PROJECTS-archon/packages/providers/src/claude/provider.ts`. Key surface verified in the index:

- `ClaudeProvider.sendQuery(prompt, cwd, resumeSessionId?, requestOptions?)` → `AsyncGenerator<MessageChunk>`.
- `buildBaseClaudeOptions` builds the SDK `Options` from request options + `assistantConfig` defaults.
- `streamClaudeMessages` normalizes raw SDK events into Archon `MessageChunk`s (`assistant`, `tool`, `tool_result`, `system`, `rate_limit`, `result`).
- `normalizeClaudeUsage` flattens `{input_tokens, output_tokens, total_tokens}`.

We are **not** porting this verbatim. We collapse the streaming generator into a single-shot step that emits final-state outputs at the end and incremental log frames during the run, because the AIactions runtime model is single-shot per `step.uses`.

### 4.2 SDK contract (`@anthropic-ai/claude-agent-sdk`)

Source: Context7 `/nothflare/claude-agent-sdk-docs`. Critical fields used:

| SDK Options field                 | Type                                                                   | Default                      | Notes                                                                                      |
| --------------------------------- | ---------------------------------------------------------------------- | ---------------------------- | ------------------------------------------------------------------------------------------ |
| `prompt`                          | `string`                                                               | —                            | Top-level argument to `query()`.                                                           |
| `model`                           | `string`                                                               | CLI default                  |                                                                                            |
| `cwd`                             | `string`                                                               | `process.cwd()`              |                                                                                            |
| `systemPrompt`                    | `string \| { type: 'preset'; preset: 'claude_code'; append?: string }` | undefined                    | Use the preset to inherit Claude Code's system prompt; pass a string to override entirely. |
| `maxTurns`                        | `number`                                                               | undefined                    |                                                                                            |
| `allowedTools`                    | `string[]`                                                             | all tools                    |                                                                                            |
| `mcpServers`                      | `Record<string, McpServerConfig>`                                      | `{}`                         |                                                                                            |
| `permissionMode`                  | `'default' \| 'acceptEdits' \| 'bypassPermissions' \| 'plan'`          | `'default'`                  |                                                                                            |
| `allowDangerouslySkipPermissions` | `boolean`                                                              | `false`                      | **Required `true` when `permissionMode === 'bypassPermissions'`.**                         |
| `settingSources`                  | `('project' \| 'user')[]`                                              | `[]`                         | Must include `'project'` to load `CLAUDE.md`.                                              |
| `resume`                          | `string`                                                               | undefined                    | Session id to resume.                                                                      |
| `forkSession`                     | `boolean`                                                              | `false`                      |                                                                                            |
| `fallbackModel`                   | `string`                                                               | undefined                    |                                                                                            |
| `maxBudgetUsd`                    | `number`                                                               | undefined                    |                                                                                            |
| `executable`                      | `'bun' \| 'deno' \| 'node'`                                            | auto-detect                  | **Pinned to `'node'`** by the action.                                                      |
| `pathToClaudeCodeExecutable`      | `string`                                                               | resolved from `node_modules` | **Set to user's local `claude` binary** by the action.                                     |
| `env`                             | `Dict<string>`                                                         | `process.env`                |                                                                                            |
| `abortController`                 | `AbortController`                                                      | new                          | Wired to `ctx.signal`.                                                                     |
| `stderr`                          | `(data: string) => void`                                               | undefined                    | Captured for logging.                                                                      |

Result event (last in stream) carries: `session_id`, `is_error`, `subtype`, `usage`, `total_cost_usd`, `stop_reason`, `num_turns`, `model_usage`, `errors`, `structured_output`.

### 4.3 AIactions runtime contract

Verified from `packages/runtime/src/runner/uses/loader.mjs` + `protocol.ts`:

- Loader reads `{ inputs }` JSON from stdin, all input values are strings.
- Action entry-point exports `async function run(ctx)`.
- `ctx = { inputs, env, cwd, signal, emitOutput(name, value), log(level, message) }`.
- `emitOutput(name, value)` writes one FD3 frame `{ type: "output", name, value }`. Both fields are strings.
- `log(level, message)` writes `{ type: "log", level, message }`. **Message is a string only — no `data` field.** Structured payloads must serialize into the message string.
- Throwing from `run` triggers the loader's catch → emits an `error` frame and exits 1.
- `ctx.signal` is aborted on SIGTERM. The action should `break` its loop cooperatively to allow partial-output emission before exit.
- Hard cap: each FD3 line is at most `PROTOCOL_MAX_LINE_BYTES = 1 MiB`.

## 5. Architecture overview

```
┌──────────────────────────────────────────────────┐
│ AIactions runtime (`packages/runtime`)           │
│  ┌─────────────────────────────────────────────┐ │
│  │ resolveUsesRef → ensureCachedAction (MS1.2) │ │
│  │ ↓                                           │ │
│  │ executeUsesStep (MS1.1, exec.ts)            │ │
│  │   - spawn(node loader.mjs)                  │ │
│  │   - stdin: { inputs }                       │ │
│  │   - FD3: outputs / logs / errors            │ │
│  └─────────────────────────────────────────────┘ │
└────────────────┬─────────────────────────────────┘
                 │
                 ▼
   ┌──────────────────────────────────────────┐
   │ actions/claude/agent/dist/main.mjs       │
   │  (bundled via tsdown — SDK inlined)      │
   │  ┌──────────────────────────────────────┐ │
   │  │ run(ctx):                            │ │
   │  │  1. parseInputs(ctx.inputs)          │ │
   │  │  2. resolveBinary(...) → claudePath  │ │
   │  │  3. query({ prompt, options })       │ │
   │  │  4. for-await events:                │ │
   │  │     - assistant text → ctx.log info  │ │
   │  │     - tool_use → ctx.log debug       │ │
   │  │     - rate_limit → ctx.log warn      │ │
   │  │     - result → save                  │ │
   │  │  5. ctx.emitOutput(text, …)          │ │
   │  └──────────────────────────────────────┘ │
   └──────────────────────────────────────────┘
                 │
                 ▼
        spawns user's local `claude` binary
        (auth state owned by the binary)
```

## 6. Manifest schema change — `using: "bun-module" → "node"`

Currently `packages/workflows/src/schema/action-manifest.ts:58`:

```ts
export const actionRunsSchema = z.strictObject({
  using: z.literal("bun-module").default("bun-module"),
  main: z.string().regex(/^\.\/(?!.*\.\.)(?!.*\\)[^\\]+\.m?js$/, …),
});
```

Rationale for renaming: AIactions never required Bun to _execute_ an action; the runtime spawns `process.execPath`. The "bun-module" literal misnames a node-compatible contract. Now that we explicitly forbid using Bun on the user's machine and add a real action, "node" is the honest label.

Change in this MS:

- `actionRunsSchema.using` → `z.literal("node").default("node")`.
- Regenerate `manifest-schema.json` via `vp run gen:schemas`.
- Update tests/fixtures referencing `bun-module` (`packages/runtime/tests/fixtures/registry/make-bare-repo.ts`, parser tests).
- The `actions/` directory is empty — **no migration needed**.

This is breaking, but pre-1.0 with zero external consumers. No deprecation window required.

## 7. Action package layout

```
actions/claude/agent/
├── aiaction.yaml            # manifest, runs.main: ./dist/main.mjs
├── package.json             # name: "@aiactions-public/claude-agent" (private workspace package)
├── package-lock.json        # npm lockfile (node-only, no bun.lock)
├── tsconfig.json            # extends workspace root
├── tsdown.config.ts         # bundle config (inline deps, target node22)
├── src/
│   ├── main.ts              # exports `async function run(ctx)`
│   ├── inputs.ts            # Zod schema for `with:` inputs
│   ├── bin-resolver.ts      # `which claude` / env override
│   ├── usage.ts             # buildUsage(result) → JSON-serializable
│   ├── transcript.ts        # capToOneMiB(json) — truncate w/ marker
│   └── types.ts             # UsageJson, TranscriptEntry
├── dist/
│   └── main.mjs             # bundled, self-contained ESM
├── tests/
│   ├── inputs.test.ts
│   ├── usage.test.ts
│   ├── transcript.test.ts
│   └── main.test.ts         # mocks the SDK's `query()`
└── README.md
```

The `actions/*/*` workspace pattern is already wired in the root `package.json`. The action becomes a private workspace package; `dist/` is **committed on `main`** so registry-fetch (sparse-checkout) lands directly runnable.

## 8. Manifest contract — `aiaction.yaml`

```yaml
schemaVersion: 1
name: agent
description: |
  Run a Claude Code agent loop via @anthropic-ai/claude-agent-sdk.
  Sends a prompt, executes the agent's tool-use loop in cwd, and
  emits the final assistant text + session id + transcript + usage
  as step outputs. Auth is delegated to the user's local `claude`
  binary (must already be logged in: `claude login`).

runs:
  using: node
  main: ./dist/main.mjs

inputs:
  prompt:
    description: User prompt sent to the agent.
    required: true
  model:
    description: Claude model id (e.g. claude-sonnet-4-6). Defaults to the SDK default.
  cwd:
    description: Working directory the agent operates in. Defaults to the step's cwd.
  system_prompt:
    description: |
      System prompt JSON. Either a string for a custom prompt, or
      `{"type":"preset","preset":"claude_code","append":"…"}` to inherit
      Claude Code's preset and optionally append guidance.
    default: '{"type":"preset","preset":"claude_code"}'
  max_turns:
    description: Maximum agent loop iterations. Unset by default.
  allowed_tools:
    description: |
      CSV of tool names to allow. Empty string = leave unset (the SDK
      default `allow all` then applies). Non-empty = parsed as `string[]`.
    default: ""
  mcp_servers:
    description: |
      MCP servers JSON, mapping server name → McpServerConfig.
      Empty string = no MCP.
    default: ""
  permission_mode:
    description: default | acceptEdits | bypassPermissions | plan
    default: "bypassPermissions"
  setting_sources:
    description: |
      CSV of setting sources to load. Must include `project` to load
      CLAUDE.md from cwd. SDK default is `[]`; we default to `project,user`
      to match Archon's behavior.
    default: "project,user"
  resume_session_id:
    description: Resume an existing session by id (chains across steps).
  fallback_model:
    description: Model used if primary returns 5xx / overloaded.
  max_budget_usd:
    description: Hard cap on session cost in USD.
  path_to_claude_code_executable:
    description: |
      Override path to the local `claude` binary. Defaults to PATH lookup
      (or `AIACTIONS_CLAUDE_BIN` env var if set).

outputs:
  text:
    description: Concatenated assistant text from all `assistant.text` blocks.
  session_id:
    description: Session id; pass as `resume_session_id` in a later step.
  stop_reason:
    description: SDK stop reason (e.g. end_turn, max_turns, error).
  is_error:
    description: '"true" | "false".'
  usage:
    description: |
      JSON string of {input, output, total, cost_usd, num_turns, model_usage}.
  transcript:
    description: |
      JSON string array of every event chunk (assistant, tool_use,
      tool_result, system, rate_limit, result). Truncated to <1 MiB
      with a trailing `…[truncated]` marker if longer.
```

## 9. `main.ts` data flow (target shape)

```ts
import { query } from "@anthropic-ai/claude-agent-sdk";
import { parseInputs } from "./inputs.ts";
import { resolveClaudeBinary } from "./bin-resolver.ts";
import { buildUsage } from "./usage.ts";
import { capToOneMiB } from "./transcript.ts";
import type { ActionContext, ActionInputs } from "./types.ts";

export async function run(ctx: ActionContext): Promise<void> {
  const inputs = parseInputs(ctx.inputs);
  const claudePath = resolveClaudeBinary(inputs.pathToClaudeCodeExecutable, ctx.env);

  const sdkOptions = {
    cwd: inputs.cwd ?? ctx.cwd,
    model: inputs.model,
    systemPrompt: inputs.systemPrompt,
    maxTurns: inputs.maxTurns,
    allowedTools: inputs.allowedTools,
    mcpServers: inputs.mcpServers,
    permissionMode: inputs.permissionMode,
    allowDangerouslySkipPermissions: inputs.permissionMode === "bypassPermissions",
    settingSources: inputs.settingSources,
    resume: inputs.resumeSessionId,
    fallbackModel: inputs.fallbackModel,
    maxBudgetUsd: inputs.maxBudgetUsd,
    pathToClaudeCodeExecutable: claudePath,
    executable: "node" as const,
    env: ctx.env,
    abortController: signalToController(ctx.signal),
    stderr: (data: string) => ctx.log("debug", `[stderr] ${data.trim()}`),
  };

  const transcript: unknown[] = [];
  let assistantText = "";
  let result: ResultEvent | undefined;

  for await (const event of query({ prompt: inputs.prompt, options: sdkOptions })) {
    if (ctx.signal.aborted) break;
    transcript.push(event);

    switch (event.type) {
      case "assistant":
        for (const block of event.message.content ?? []) {
          if (block.type === "text" && block.text) {
            assistantText += block.text;
            ctx.log("info", `[assistant] ${block.text}`);
          } else if (block.type === "tool_use") {
            ctx.log("debug", `[tool_use] ${block.name} ${JSON.stringify(block.input ?? {})}`);
          }
        }
        break;
      case "system":
        if (event.subtype === "init" && Array.isArray(event.mcp_servers)) {
          const failed = event.mcp_servers.filter((s) => s.status !== "connected");
          if (failed.length > 0) {
            ctx.log(
              "warn",
              `MCP server(s) failed to connect: ${failed.map((s) => `${s.name}(${s.status})`).join(", ")}`,
            );
          }
        }
        break;
      case "rate_limit_event":
        ctx.log("warn", `rate_limit: ${JSON.stringify(event.rate_limit_info ?? {})}`);
        break;
      case "result":
        result = event;
        break;
    }
  }

  if (!result) {
    throw new Error("agent stream ended without a `result` event");
  }

  ctx.emitOutput("text", assistantText);
  ctx.emitOutput("session_id", result.session_id ?? "");
  ctx.emitOutput("stop_reason", result.stop_reason ?? "");
  ctx.emitOutput("is_error", result.is_error ? "true" : "false");
  ctx.emitOutput("usage", JSON.stringify(buildUsage(result)));
  ctx.emitOutput("transcript", capToOneMiB(JSON.stringify(transcript)));

  if (result.is_error) {
    const subtype = result.subtype ?? "?";
    const errors = Array.isArray(result.errors) ? result.errors.join("; ") : "";
    throw new Error(`agent reported error (subtype=${subtype})${errors ? `: ${errors}` : ""}`);
  }
}
```

(Sketch — not final code. Real impl will follow this shape but may refine helper signatures. Each helper lives in its own file per file-header convention.)

Type sources used in the sketch:

- `ActionContext` and `ActionInputs` are declared in `./types.ts`. `ActionContext` mirrors the shape of the loader-provided `ctx` (see `packages/runtime/src/runner/uses/loader.mjs`).
- `ResultEvent` is imported from `@anthropic-ai/claude-agent-sdk`'s public types; it is the variant of the event union with `type: "result"`.
- `signalToController(signal)` is a tiny helper (in `main.ts` or a sibling) that returns an `AbortController` whose `.abort()` is wired to `signal.aborted` — the SDK expects an `AbortController`, the loader hands us an `AbortSignal`.

## 10. Binary resolution

```ts
// bin-resolver.ts
export function resolveClaudeBinary(
  inputOverride: string | undefined,
  env: NodeJS.ProcessEnv,
): string {
  const explicit = inputOverride || env.AIACTIONS_CLAUDE_BIN;
  if (explicit) return explicit;
  const onPath = whichSync("claude", env);
  if (onPath) return onPath;
  throw new Error(
    "`claude` binary not found. " +
      "Install Claude Code (https://docs.anthropic.com/en/docs/claude-code/setup) " +
      "and run `claude login`. Alternatively, set the input " +
      "`path_to_claude_code_executable` or env var `AIACTIONS_CLAUDE_BIN`.",
  );
}
```

`whichSync` is a tiny in-repo helper (no extra dependency) that scans `env.PATH` directories for an executable named `claude`. POSIX-first, Windows fallback (`.exe`/`.cmd`).

## 11. Auth & ToS-compliance

- AIactions does **not** read, store, or proxy any Anthropic credentials.
- Auth state is owned by the user's local `claude` binary (typically `~/.claude/auth` or equivalent — exact path is the binary's concern).
- The user must run `claude login` before invoking workflows that use `claude/agent`. Failure mode: the SDK call fails with a 401-equivalent; we surface the error verbatim.
- If the user prefers an API key, they set `ANTHROPIC_API_KEY` in the workflow / job / step `env:` block. The SDK respects it via `options.env`.
- This satisfies the AIactions hard constraint: "Auth delegated to the official Anthropic SDK." We don't even pass through the credential — it never enters AIactions code.

## 12. Error handling

| Scenario                            | Detection                                                | Action behavior                                                                                                                   | Runtime outcome                                                                  |
| ----------------------------------- | -------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| Invalid input (Zod fail)            | `parseInputs` throws                                     | Throw enriched message                                                                                                            | `error` frame, exit 1, `step.failed`.                                            |
| `claude` binary missing             | `resolveClaudeBinary` throws                             | Throw with install + login hint                                                                                                   | `step.failed` with friendly message.                                             |
| `query()` throws before first event | exception in iteration                                   | Bubble up                                                                                                                         | `step.failed`; runtime may retry at workflow level via future `retry:` (not v1). |
| `result.is_error === true`          | inspect final event                                      | Emit all outputs first, then throw                                                                                                | `step.failed`, but downstream steps can read `outputs.transcript` for diagnosis. |
| SIGTERM (timeout / abort)           | `ctx.signal.aborted` flips                               | `break` loop, emit partial outputs, exit 0 if no error                                                                            | `step.cancelled` propagates from runtime.                                        |
| Transcript >1 MiB                   | `capToOneMiB` truncates                                  | Append `…[truncated]`, log warn                                                                                                   | Output emitted with marker.                                                      |
| FD3 frame >1 MiB on `text`          | log message excessive                                    | Truncate large `assistant.text` blocks in log frames; full text still in `text` output (which itself is truncated only if >1 MiB) | `step.succeeded` with possibly truncated logs.                                   |
| MCP server fails to connect         | `system.init.mcp_servers` shows `status !== "connected"` | `ctx.log("warn", …)` and continue                                                                                                 | `step.succeeded` (best-effort, user warned).                                     |
| Rate limit                          | `rate_limit_event`                                       | `ctx.log("warn", …)` and continue                                                                                                 | `step.succeeded` (SDK manages backoff).                                          |

No retry loop in the action itself for v1. Archon's `MAX_SUBPROCESS_RETRIES`-with-backoff is **not ported**: workflow-level retry semantics belong in the runtime, not in every action that wraps a subprocess. Tracked as a future runtime feature.

## 13. Testing strategy

| Level                  | What is tested                                                              | How                                                                                                                                    |
| ---------------------- | --------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| Unit                   | `parseInputs` (Zod), `buildUsage`, `capToOneMiB`, `resolveClaudeBinary`     | `vp test` inside `actions/claude/agent`. No network, no SDK.                                                                           |
| Integration            | `run(ctx)` end-to-end with the SDK's `query()` mocked                       | Mock the module, yield scripted event sequences (assistant + tool_use + result variants, error variants). Assert FD3 outputs and logs. |
| End-to-end (runtime)   | Workflow `uses: claude/agent@v1` → loader spawns dist/main.mjs → mocked SDK | New test fixture in `packages/runtime/tests/`. Reuses the existing bare-repo registry fixture pattern. No real network.                |
| Smoke (manual, opt-in) | Real call with `claude-haiku-4-5` and trivial prompt, real binary           | Documented in the action's README. Runs only when `ANTHROPIC_SMOKE=1`.                                                                 |

**Avoid**: tautological tests of the SDK's own behavior. Test the **adaptation surface** (input parsing, output emission, transcript truncation, error mapping), not the SDK's internals.

## 14. Build & publish

- Action package uses **tsdown** to bundle `src/main.ts` → `dist/main.mjs`. Target `node22`. SDK + zod are **inlined** (not externalized) so the dist is self-contained on the user's filesystem.
- Build command: `vp pack` from inside `actions/claude/agent`, or workspace-recursive via `vp run -r build` from the root.
- `dist/main.mjs` is committed to `main`. Conventional commit prefix for build artifacts: `chore(claude/agent): rebuild dist`. release-please ignores `chore:` for version bumps.
- Versioning: action ref `claude/agent@v<MAJOR>.<MINOR>` (e.g. `claude/agent@v1`, `claude/agent@v1.0`, `claude/agent@v1.0.0` all resolve via the canonical URL convention from MS1.2).
- Future: GitHub Action that rebuilds `dist/` on every PR touching `actions/claude/agent/src/**` and commits `chore(claude/agent): rebuild dist`. Out of scope for v1 — manual builds via `vp pack` are acceptable initially.

## 15. Out of scope (deferred to v1.x or later)

- **Inputs not exposed v1**: `disallowed_tools`, `tools`, `additional_directories`, `fork_session`, `continue`, `output_format`, `betas`, `include_partial_messages`, `strict_mcp_config`, `max_thinking_tokens`. Adding any of these later is non-breaking.
- **Higher-level actions** (`claude/team`, `claude/plan`, `claude/review`, …). They will compose `claude/agent` either at workflow level (today) or via `using: "composite"` (future).
- **`using: "composite"`** runtime support (separate milestone).
- **Workflow-level `retry:` semantics** (separate milestone).
- **`@aiactions/cli` scaffold** (deferred from MS1.3).
- **Auto-rebuild GHA** for action `dist/` (post-v1 ergonomics).

## 16. Open questions

| #   | Question                                                                                                                           | Default if unanswered                                                                                                                                       |
| --- | ---------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| OQ1 | Should the action emit a structured `tool_calls` log channel separate from `info` text logs (e.g. via JSON-prefixed log messages)? | No — `debug`-level log frames with `[tool_use] <name> <input>` are sufficient for v1.                                                                       |
| OQ2 | Should `setting_sources` default change to `project,user` (Archon parity) or remain SDK default `[]`?                              | `project,user` — to load `CLAUDE.md` automatically, which is the dev-friendly behavior.                                                                     |
| OQ3 | Should `claude/agent` accept `system_prompt: ""` (empty string) as "no system prompt at all"?                                      | Yes — the action treats empty string as "use no system prompt" (passes `undefined` to SDK), distinct from omitted (which uses the action's default preset). |
| OQ4 | What naming convention for the action package's `name:` field in `package.json`?                                                   | `@aiactions-public/claude-agent` — reserved namespace for first-party public actions.                                                                       |
| OQ5 | Should we ship a sample workflow (`workflows/examples/claude-agent.yaml`) demonstrating usage?                                     | Yes — short example invoking `claude/agent@v1` with a trivial prompt and asserting `text` output.                                                           |

## 17. Acceptance criteria

For this milestone to be considered shipped:

1. **Schema rename** — `actionRunsSchema.using` is `"node"`; manifest-schema.json regenerated; tests updated.
2. **Action exists** at `actions/claude/agent/` with all source files, manifest, build config.
3. **`dist/main.mjs` is committed** and self-contained (loadable on a node22 install with zero npm install).
4. **Manifest validates** against the updated `actionManifestSchema`.
5. **Action runs end-to-end** in a runtime test with the SDK mocked.
6. **A real workflow** (`workflows/examples/claude-agent.yaml`) executes successfully on the maintainer's machine against `claude-haiku-4-5` (manual smoke).
7. **`vp run ready`** passes — typecheck + lint + recursive test + recursive build.
8. **README** at `actions/claude/agent/README.md` documents inputs/outputs, the `claude login` prerequisite, and a copy-pastable workflow snippet.
9. **PR** opened on `feat/claude-agent-action` with squash-merge into `main` once approved.

## 18. Sub-milestones (suggested decomposition for the implementation plan)

| Sub-MS      | Scope                                                                                                                                                                                                                               | Reversible?                   |
| ----------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------- |
| **MS1.3.0** | Manifest schema rename `bun-module → node`; regen JSON schema; update existing tests/fixtures.                                                                                                                                      | Yes — small, isolated change. |
| **MS1.3.1** | Scaffold `actions/claude/agent/` package: `aiaction.yaml`, `package.json`, `tsconfig.json`, `tsdown.config.ts`. Action does nothing useful yet.                                                                                     | Yes — pure scaffolding.       |
| **MS1.3.2** | `inputs.ts` (Zod) + `bin-resolver.ts` + unit tests.                                                                                                                                                                                 | Yes.                          |
| **MS1.3.3** | `usage.ts` + `transcript.ts` + unit tests.                                                                                                                                                                                          | Yes.                          |
| **MS1.3.4** | `main.ts` wired to `query()` with full event-stream handling. Integration tests at the **action package level** (mocks `@anthropic-ai/claude-agent-sdk` and asserts FD3 outputs).                                                   | Yes.                          |
| **MS1.3.5** | Build to `dist/main.mjs`; commit. Runtime **end-to-end test** at the `packages/runtime/tests/` level: full `uses:` path through `executeUsesStep` against the bundled `dist/main.mjs`, with the SDK mocked inside the action build. | Yes.                          |
| **MS1.3.6** | README + example workflow (`workflows/examples/claude-agent.yaml`); manual smoke run; final `vp run ready`; PR.                                                                                                                     | Yes — docs + final gate.      |

The plan document (next step in the workflow) will expand each sub-MS into ordered steps with checkpoints.
