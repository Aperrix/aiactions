/**
 * Integration tests for `run(ctx)`. Mocks the `query()` import from
 * `@anthropic-ai/claude-agent-sdk` to yield scripted event sequences,
 * captures the FD3 frames the action emits via the test ctx, and
 * asserts the final outputs.
 */

import { afterEach, beforeEach, describe, expect, test, vi } from "vite-plus/test";

vi.mock("@anthropic-ai/claude-agent-sdk", () => ({
  query: vi.fn(),
}));

import { query } from "@anthropic-ai/claude-agent-sdk";

import { run } from "../src/main.ts";
import type { ActionContext, LogLevel } from "../src/types.ts";

interface CapturedFrame {
  readonly kind: "output" | "log";
  readonly name?: string;
  readonly value?: string;
  readonly level?: LogLevel;
  readonly message?: string;
}

function makeCtx(inputs: Readonly<Record<string, string>>): {
  ctx: ActionContext;
  frames: CapturedFrame[];
  controller: AbortController;
} {
  const frames: CapturedFrame[] = [];
  const controller = new AbortController();
  // Use /usr/bin/true as a real executable we know exists on POSIX systems
  // — bin-resolver verifies executability via accessSync(X_OK).
  const env: NodeJS.ProcessEnv = { PATH: "", AIACTIONS_CLAUDE_BIN: "/usr/bin/true" };
  const ctx: ActionContext = {
    inputs,
    env,
    cwd: "/tmp",
    signal: controller.signal,
    emitOutput: (name, value) => {
      frames.push({ kind: "output", name, value });
    },
    log: (level, message) => {
      frames.push({ kind: "log", level, message });
    },
  };
  return { ctx, frames, controller };
}

async function* eventStream(seq: readonly unknown[]): AsyncGenerator<unknown> {
  for (const e of seq) yield e;
}

const baseResult = {
  type: "result" as const,
  session_id: "sess-1",
  is_error: false,
  subtype: "end_turn",
  stop_reason: "end_turn",
  usage: { input_tokens: 10, output_tokens: 5, total_tokens: 15 },
  total_cost_usd: 0.001,
  num_turns: 1,
};

beforeEach(() => {
  vi.mocked(query).mockReset();
});

afterEach(() => {
  vi.clearAllMocks();
});

describe("run", () => {
  test("emits text + session_id + usage on a happy-path run", async () => {
    vi.mocked(query).mockReturnValueOnce(
      eventStream([
        {
          type: "assistant",
          message: { content: [{ type: "text", text: "Hello world." }] },
        },
        baseResult,
      ]) as never,
    );

    const { ctx, frames } = makeCtx({ prompt: "say hi" });
    await run(ctx);

    const out = (n: string): string | undefined =>
      frames.find((f) => f.kind === "output" && f.name === n)?.value;
    expect(out("text")).toBe("Hello world.");
    expect(out("session_id")).toBe("sess-1");
    expect(out("is_error")).toBe("false");
    expect(out("stop_reason")).toBe("end_turn");
    const usage = JSON.parse(out("usage")!);
    expect(usage).toEqual({
      input: 10,
      output: 5,
      total: 15,
      cost_usd: 0.001,
      num_turns: 1,
      model_usage: {},
    });
  });

  test("logs tool_use blocks at debug level", async () => {
    vi.mocked(query).mockReturnValueOnce(
      eventStream([
        {
          type: "assistant",
          message: {
            content: [
              { type: "tool_use", name: "Read", input: { path: "src/main.ts" } },
              { type: "text", text: "ok." },
            ],
          },
        },
        baseResult,
      ]) as never,
    );
    const { ctx, frames } = makeCtx({ prompt: "do work" });
    await run(ctx);

    const debug = frames.filter((f) => f.kind === "log" && f.level === "debug");
    expect(debug.some((f) => f.message?.includes("[tool_use] Read"))).toBe(true);
  });

  test("warns when MCP servers fail to connect", async () => {
    vi.mocked(query).mockReturnValueOnce(
      eventStream([
        {
          type: "system",
          subtype: "init",
          mcp_servers: [
            { name: "fs", status: "connected" },
            { name: "git", status: "failed" },
          ],
        },
        baseResult,
      ]) as never,
    );
    const { ctx, frames } = makeCtx({ prompt: "p" });
    await run(ctx);

    const warns = frames.filter((f) => f.kind === "log" && f.level === "warn");
    expect(warns.some((f) => f.message?.includes("git(failed)"))).toBe(true);
  });

  test("throws when agent reports is_error and still emits outputs", async () => {
    vi.mocked(query).mockReturnValueOnce(
      eventStream([
        {
          ...baseResult,
          is_error: true,
          subtype: "tool_error",
          errors: ["tool failed"],
        },
      ]) as never,
    );
    const { ctx, frames } = makeCtx({ prompt: "p" });
    await expect(run(ctx)).rejects.toThrow(/agent reported error.*tool_error/);

    expect(frames.find((f) => f.kind === "output" && f.name === "is_error")?.value).toBe("true");
  });

  test("throws when the stream ends without a result event", async () => {
    vi.mocked(query).mockReturnValueOnce(eventStream([]) as never);
    const { ctx } = makeCtx({ prompt: "p" });
    await expect(run(ctx)).rejects.toThrow(/without a `result` event/);
  });

  test("emits partial outputs and resolves cleanly on signal abort", async () => {
    const { ctx, frames, controller } = makeCtx({ prompt: "p" });
    vi.mocked(query).mockImplementationOnce((() =>
      (async function* () {
        yield {
          type: "assistant",
          message: { content: [{ type: "text", text: "partial " }] },
        };
        controller.abort();
        yield {
          type: "assistant",
          message: { content: [{ type: "text", text: "should not arrive" }] },
        };
        yield baseResult;
      })()) as never);

    await expect(run(ctx)).resolves.toBeUndefined();

    const out = (n: string): string | undefined =>
      frames.find((f) => f.kind === "output" && f.name === n)?.value;
    expect(out("text")).toBe("partial ");
    expect(out("stop_reason")).toBe("aborted");
    expect(out("is_error")).toBe("false");
    expect(out("session_id")).toBe("");
  });

  test("passes the correct SDK options on a happy-path run", async () => {
    vi.mocked(query).mockReturnValueOnce(eventStream([baseResult]) as never);
    const { ctx } = makeCtx({
      prompt: "p",
      model: "claude-sonnet-4-6",
      permission_mode: "bypassPermissions",
      allowed_tools: "Read,Grep",
    });
    await run(ctx);

    const call = vi.mocked(query).mock.calls[0]?.[0];
    expect(call).toBeDefined();
    expect(call?.prompt).toBe("p");
    // Cast to a loose record because the SDK's Options shape is not in scope here.
    const opts = call?.options as Record<string, unknown>;
    expect(opts.model).toBe("claude-sonnet-4-6");
    expect(opts.permissionMode).toBe("bypassPermissions");
    expect(opts.allowDangerouslySkipPermissions).toBe(true);
    expect(opts.allowedTools).toEqual(["Read", "Grep"]);
    expect(opts.executable).toBe("node");
    expect(opts.pathToClaudeCodeExecutable).toBe("/usr/bin/true");
  });

  test("rejects with a friendly error when the binary cannot be resolved", async () => {
    const { ctx } = makeCtx({ prompt: "p" });
    // Override env to remove the fake-binary fallback.
    (ctx as { env: NodeJS.ProcessEnv }).env = { PATH: "/nonexistent" };
    await expect(run(ctx)).rejects.toThrow(/claude.*not found/);
    expect(query).not.toHaveBeenCalled();
  });
});
