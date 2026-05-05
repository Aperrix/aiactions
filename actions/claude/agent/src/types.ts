/**
 * Local mirror of the runtime-provided action context. The shape is
 * dictated by `packages/runtime/src/runner/uses/loader.mjs:84-103`.
 *
 * Kept narrow on purpose: only the fields the action actually consumes.
 *
 * Contents:
 * - `LogLevel` — log severity enum.
 * - `ActionContext` — what the loader passes to `run(ctx)`.
 */

export type LogLevel = "debug" | "info" | "warn" | "error";

export interface ActionContext {
  readonly inputs: Readonly<Record<string, string>>;
  readonly env: NodeJS.ProcessEnv;
  readonly cwd: string;
  readonly signal: AbortSignal;
  emitOutput(name: string, value: string): void;
  log(level: LogLevel, message: string): void;
}
