# `claude/agent`

Run a Claude Code agent loop as a workflow step.

`claude/agent` is the foundational [AIaction](https://github.com/aperrix/aiactions) wrapping
[`@anthropic-ai/claude-agent-sdk`](https://www.npmjs.com/package/@anthropic-ai/claude-agent-sdk).
Given a prompt, it spawns the agent in `cwd`, runs the tool-use loop, and
emits the final assistant text, session id, transcript, and usage as
step outputs.

## Prerequisites

- Node.js >= 22.12.0.
- The user must have the [Claude Code CLI](https://docs.anthropic.com/en/docs/claude-code/setup)
  installed and authenticated:

```bash
npm install -g @anthropic-ai/claude-code
claude login
```

Alternatively: set `ANTHROPIC_API_KEY` in the workflow environment
and the SDK will use it directly.

## Usage

```yaml
jobs:
  ask-claude:
    steps:
      - name: Plan the change
        id: plan
        uses: claude/agent@v1
        with:
          prompt: "Outline the steps to add a `--verbose` flag to the CLI."
          model: claude-sonnet-4-6
          max_turns: "10"
          allowed_tools: "Read,Grep,Glob"

      - name: Show the plan
        run: echo "${{ steps.plan.outputs.text }}"
```

## Inputs

| Name                             | Default                                    | Description                                                                                                                       |
| -------------------------------- | ------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------- |
| `prompt` _(required)_            | —                                          | The user prompt sent to the agent.                                                                                                |
| `model`                          | SDK default                                | Model id (e.g. `claude-sonnet-4-6`).                                                                                              |
| `cwd`                            | step's cwd                                 | Working directory the agent operates in.                                                                                          |
| `system_prompt`                  | `{"type":"preset","preset":"claude_code"}` | Custom string, or `{"type":"preset","preset":"claude_code","append":"…"}` JSON. Empty string disables the system prompt entirely. |
| `max_turns`                      | unset                                      | Maximum agent loop iterations.                                                                                                    |
| `allowed_tools`                  | `""` (= all)                               | CSV of tool names. Empty string leaves the SDK default (allow all).                                                               |
| `mcp_servers`                    | `""` (= none)                              | JSON object mapping server name to config.                                                                                        |
| `permission_mode`                | `bypassPermissions`                        | `default \| acceptEdits \| bypassPermissions \| plan`.                                                                            |
| `setting_sources`                | `project,user`                             | CSV; must include `project` to load `CLAUDE.md`.                                                                                  |
| `resume_session_id`              | —                                          | Resume an existing session id.                                                                                                    |
| `fallback_model`                 | —                                          | Used if the primary model is overloaded.                                                                                          |
| `max_budget_usd`                 | —                                          | Hard cost cap in USD.                                                                                                             |
| `path_to_claude_code_executable` | resolved from PATH                         | Override for the local `claude` binary. Also honoured via `AIACTIONS_CLAUDE_BIN` env var.                                         |

## Outputs

| Name          | Description                                                                                                                                                          |
| ------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `text`        | Concatenated assistant text from all `assistant.text` blocks.                                                                                                        |
| `session_id`  | Session id; pass back via `resume_session_id` in a later step.                                                                                                       |
| `stop_reason` | SDK stop reason: `end_turn`, `max_turns`, `error`, etc.                                                                                                              |
| `is_error`    | `"true"` or `"false"`.                                                                                                                                               |
| `usage`       | JSON string: `{"input":…,"output":…,"total":…,"cost_usd":…,"num_turns":…,"model_usage":…}`.                                                                          |
| `transcript`  | JSON array of every event chunk (assistant, tool_use, tool_result, system, rate_limit, result). Truncated to <1 MiB with a trailing `…[truncated]` marker if longer. |

## Auth

`claude/agent` does not handle authentication. The SDK reads the
local `claude` binary's existing login state (or `ANTHROPIC_API_KEY` if
set). Run `claude login` once per machine.

## How it works

The action is bundled as a single self-contained `dist/main.mjs` file
that is committed alongside the source. When the AIactions runtime
fetches the action via the canonical-URL registry, no `npm install`
step is needed; the bundle includes all JavaScript dependencies inlined.
The SDK's platform-specific `claude` binary is intentionally NOT
bundled — the action delegates to the user's local installation.
