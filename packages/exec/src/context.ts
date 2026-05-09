/**
 * `ActionContext` — the shape of the object passed to every `uses:`
 * action's exported `run(ctx)` function. Lives in the parent process
 * as a type only; the concrete instance is constructed inside the
 * loader subprocess (see `loader.mjs`).
 *
 * Contents:
 * - `LogLevel` — log frame discriminator.
 * - `ActionContext` — public action-author surface.
 */

/** Log severity carried by `ctx.log(level, message)`. */
export type LogLevel = "debug" | "info" | "warn" | "error";

/**
 * The per-invocation context handed to an action's `run()` entry point.
 *
 * Authors should treat fields as opaque. The loader builds this object;
 * the parent process never sees the same instance.
 */
export interface ActionContext {
  /** Resolved input map: `step.with` after expression interpolation. */
  readonly inputs: Readonly<Record<string, string>>;
  /** Curated environment for the child process. MS1.1 = same env as
   * `run:` steps (tier-1 baseline); trust-tier curation lands in MS1.2. */
  readonly env: Readonly<Record<string, string>>;
  /** Working directory of the action — the action's own dir on disk. */
  readonly cwd: string;
  /** Cancellation token. Aborts when the parent run is aborted; actions
   * SHOULD honor it for any long-running work. */
  readonly signal: AbortSignal;
  /** Emit a named output. Last write wins. The output name SHOULD match
   * a key in `manifest.outputs`; emitting an undeclared output produces
   * a warning but does not fail the step. */
  emitOutput(name: string, value: string): void;
  /** Log a structured message back to the parent runtime. */
  log(level: LogLevel, message: string): void;
}
