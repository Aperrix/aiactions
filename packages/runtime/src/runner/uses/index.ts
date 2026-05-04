/**
 * Barrel for the `step.uses:` executor module. Re-exports the public
 * surface of the `uses/` directory so the rest of the runtime can pull
 * a single import path. Implementation files live as siblings:
 * - `resolver.ts` — ref → on-disk action.
 * - `context.ts` — `ActionContext` type.
 * - `loader.mjs` — subprocess entry-point script.
 * - `exec.ts` — spawn + IPC orchestration.
 * - `protocol.ts` — FD3 line-delimited JSON parser/encoder.
 */

export * from "./context.ts";
export * from "./resolver.ts";
export * from "./protocol.ts";
export * from "./exec.ts";
