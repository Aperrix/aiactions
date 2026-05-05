/**
 * Action entry-point: called by the AIactions runtime loader after it
 * has read `{ inputs }` from stdin and built `ctx`. Drives the Claude
 * Agent SDK's `query()` to completion, surfaces incremental progress
 * via `ctx.log`, and emits final outputs via `ctx.emitOutput`.
 *
 * Throws on terminal errors (missing binary, SDK error, agent reported
 * is_error). The loader catches the throw and emits an error frame.
 *
 * Contents:
 * - `run(ctx)` — entry-point exported to the loader.
 * - Local helpers (event dispatch, abort wiring) inlined.
 */

import { type Options, query } from "@anthropic-ai/claude-agent-sdk";

import { resolveClaudeBinary } from "./bin-resolver.ts";
import { parseInputs, type ParsedInputs } from "./inputs.ts";
import { capToOneMiB } from "./transcript.ts";
import type { ActionContext } from "./types.ts";
import { buildUsage } from "./usage.ts";

interface AssistantBlockText {
  readonly type: "text";
  readonly text: string;
}
interface AssistantBlockToolUse {
  readonly type: "tool_use";
  readonly name: string;
  readonly input?: unknown;
}
type AssistantBlock = AssistantBlockText | AssistantBlockToolUse | { readonly type: string };

interface AssistantEvent {
  readonly type: "assistant";
  readonly message: { readonly content?: readonly AssistantBlock[] };
}
interface SystemEvent {
  readonly type: "system";
  readonly subtype?: string;
  readonly mcp_servers?: readonly { readonly name: string; readonly status: string }[];
}
interface RateLimitEvent {
  readonly type: "rate_limit_event";
  readonly rate_limit_info?: Readonly<Record<string, unknown>>;
}
interface ResultEvent {
  readonly type: "result";
  readonly session_id?: string;
  readonly is_error?: boolean;
  readonly subtype?: string;
  readonly stop_reason?: string | null;
  readonly errors?: readonly string[];
  readonly usage?: {
    readonly input_tokens?: number;
    readonly output_tokens?: number;
    readonly total_tokens?: number;
  };
  readonly total_cost_usd?: number;
  readonly num_turns?: number;
  readonly model_usage?: Readonly<
    Record<string, { readonly input_tokens?: number; readonly output_tokens?: number }>
  >;
}
type SdkEvent =
  | AssistantEvent
  | SystemEvent
  | RateLimitEvent
  | ResultEvent
  | { readonly type: string };

/**
 * Drive the Claude Agent SDK's `query()` to completion, log
 * incremental progress via `ctx.log`, and emit final outputs via
 * `ctx.emitOutput`. Throws on terminal errors.
 *
 * @param ctx - Loader-provided action context.
 */
export async function run(ctx: ActionContext): Promise<void> {
  const inputs = parseInputs(ctx.inputs);
  const claudePath = resolveClaudeBinary(inputs.path_to_claude_code_executable, ctx.env);
  const controller = signalToController(ctx.signal);

  const sdkOptions = buildSdkOptions(inputs, ctx, claudePath, controller);

  const transcript: SdkEvent[] = [];
  let assistantText = "";
  let result: ResultEvent | undefined;

  try {
    const events = query({ prompt: inputs.prompt, options: sdkOptions });
    for await (const event of events as AsyncIterable<SdkEvent>) {
      if (ctx.signal.aborted) break;
      transcript.push(event);

      if (event.type === "assistant") {
        const e = event as AssistantEvent;
        for (const block of e.message.content ?? []) {
          if (block.type === "text") {
            const text = (block as AssistantBlockText).text;
            if (text.length > 0) {
              assistantText += text;
              ctx.log("info", `[assistant] ${text}`);
            }
          } else if (block.type === "tool_use") {
            const tu = block as AssistantBlockToolUse;
            ctx.log("debug", `[tool_use] ${tu.name} ${JSON.stringify(tu.input ?? {})}`);
          }
        }
      } else if (event.type === "system") {
        const e = event as SystemEvent;
        if (e.subtype === "init" && Array.isArray(e.mcp_servers)) {
          const failed = e.mcp_servers.filter((s) => s.status !== "connected");
          if (failed.length > 0) {
            const list = failed.map((s) => `${s.name}(${s.status})`).join(", ");
            ctx.log("warn", `MCP server(s) failed to connect: ${list}`);
          }
        }
      } else if (event.type === "rate_limit_event") {
        const e = event as RateLimitEvent;
        ctx.log("warn", `rate_limit: ${JSON.stringify(e.rate_limit_info ?? {})}`);
      } else if (event.type === "result") {
        result = event as ResultEvent;
      }
    }
  } finally {
    // Always emit whatever we have, even on abort/throw, so the user
    // can inspect `outputs.transcript` for diagnosis.
    //
    // Spec §12: SIGTERM / abort → break loop, emit partial outputs,
    // exit 0 if no error. When the loop exited because the signal was
    // aborted but we never saw a `result` event, synthesize the output
    // markers so the loader emits a clean step.completed frame.
    if (result !== undefined) {
      ctx.emitOutput("text", assistantText);
      ctx.emitOutput("session_id", result.session_id ?? "");
      ctx.emitOutput("stop_reason", result.stop_reason ?? "");
      ctx.emitOutput("is_error", result.is_error ? "true" : "false");
      ctx.emitOutput("usage", JSON.stringify(buildUsage(result)));
      ctx.emitOutput("transcript", capToOneMiB(JSON.stringify(transcript)));
    } else if (ctx.signal.aborted) {
      ctx.emitOutput("text", assistantText);
      ctx.emitOutput("session_id", "");
      ctx.emitOutput("stop_reason", "aborted");
      ctx.emitOutput("is_error", "false");
      ctx.emitOutput("usage", JSON.stringify(buildUsage({})));
      ctx.emitOutput("transcript", capToOneMiB(JSON.stringify(transcript)));
    }
  }

  if (!result) {
    if (ctx.signal.aborted) return;
    throw new Error("agent stream ended without a `result` event");
  }
  if (result.is_error) {
    const subtype = result.subtype ?? "?";
    const errs = Array.isArray(result.errors) ? result.errors.join("; ") : "";
    throw new Error(`agent reported error (subtype=${subtype})${errs ? `: ${errs}` : ""}`);
  }
}

function signalToController(signal: AbortSignal): AbortController {
  const controller = new AbortController();
  if (signal.aborted) {
    controller.abort();
  } else {
    signal.addEventListener("abort", () => controller.abort(), { once: true });
  }
  return controller;
}

function buildSdkOptions(
  inputs: ParsedInputs,
  ctx: ActionContext,
  claudePath: string,
  controller: AbortController,
): Options {
  const options: Options = {
    cwd: inputs.cwd ?? ctx.cwd,
    permissionMode: inputs.permission_mode,
    allowDangerouslySkipPermissions: inputs.permission_mode === "bypassPermissions",
    settingSources: inputs.setting_sources,
    pathToClaudeCodeExecutable: claudePath,
    executable: "node",
    env: ctx.env,
    abortController: controller,
    stderr: (data: string) => {
      const trimmed = data.trim();
      if (trimmed.length > 0) ctx.log("debug", `[stderr] ${trimmed}`);
    },
  };
  if (inputs.model !== undefined) options.model = inputs.model;
  if (inputs.system_prompt !== undefined) options.systemPrompt = inputs.system_prompt;
  if (inputs.max_turns !== undefined) options.maxTurns = inputs.max_turns;
  if (inputs.allowed_tools !== undefined) options.allowedTools = inputs.allowed_tools;
  // `mcp_servers` is parsed as `Record<string, unknown>` because the SDK's
  // `McpServerConfig` is a discriminated union we don't statically validate
  // at parse time — the SDK's own runtime validation owns that.
  if (inputs.mcp_servers !== undefined) {
    options.mcpServers = inputs.mcp_servers as Options["mcpServers"];
  }
  if (inputs.resume_session_id !== undefined) options.resume = inputs.resume_session_id;
  if (inputs.fallback_model !== undefined) options.fallbackModel = inputs.fallback_model;
  if (inputs.max_budget_usd !== undefined) options.maxBudgetUsd = inputs.max_budget_usd;
  return options;
}
