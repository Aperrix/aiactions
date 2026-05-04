/**
 * Action loader — subprocess entry-point that runs an action's
 * `manifest.runs.main` module and pipes its outputs / logs / errors
 * back to the parent over FD 3.
 *
 * Shipped as `.mjs` (not `.ts`) so any `process.execPath` can run it
 * directly without an experimental flag or transpile step.
 *
 * Boot sequence:
 * 1. Read the JSON payload from stdin (`{ inputs }`).
 * 2. Build an action context whose `emitOutput` / `log` write to FD 3
 *    via `node:fs.writeSync` (synchronous so ordering survives exit).
 * 3. `await import(process.env.RUNNER_ACTION_MAIN)` then await
 *    `mod.run(ctx)`.
 * 4. On thrown error: write an `error` frame to FD 3 and exit 1.
 * 5. On success: exit 0.
 *
 * Cancellation: a SIGTERM handler aborts the loader's own
 * AbortController. Actions can listen on ctx.signal to bail out
 * cooperatively before the parent escalates to SIGKILL.
 *
 * This file is the subprocess entry-point — never imported by the
 * parent runtime. Side-effects in module top-level are intentional.
 */

import { writeSync } from "node:fs";
import { stdin } from "node:process";

const FD_OUTPUT = 3;

/**
 * Write a single protocol frame to FD 3 as a newline-terminated JSON
 * line. Frame schema must match the parent's `protocol.ts` definitions.
 *
 * @param {{ type: "output", name: string, value: string }
 *        | { type: "log", level: "debug"|"info"|"warn"|"error", message: string }
 *        | { type: "error", message: string, stack?: string }} frame
 */
const writeFrame = (frame) => {
  writeSync(FD_OUTPUT, `${JSON.stringify(frame)}\n`);
};

/**
 * Read stdin to EOF and parse it as `{ inputs: Record<string, string> }`.
 *
 * @returns {Promise<{ inputs: Record<string, string> }>}
 */
const readStdinJson = async () => {
  let raw = "";
  stdin.setEncoding("utf-8");
  for await (const chunk of stdin) {
    raw += chunk;
  }
  const parsed = raw.length === 0 ? {} : JSON.parse(raw);
  if (parsed === null || typeof parsed !== "object") {
    throw new Error("loader: stdin JSON must be an object");
  }
  const inputs = parsed.inputs;
  if (
    inputs !== undefined &&
    (inputs === null || typeof inputs !== "object" || Array.isArray(inputs))
  ) {
    throw new Error("loader: stdin payload `inputs` must be an object");
  }
  /** @type {Record<string, string>} */
  const cleanInputs = {};
  if (inputs !== undefined) {
    for (const [k, v] of Object.entries(inputs)) {
      if (typeof v !== "string") {
        throw new Error(`loader: input '${k}' must be a string`);
      }
      cleanInputs[k] = v;
    }
  }
  return { inputs: cleanInputs };
};

/**
 * Construct the per-invocation action context.
 *
 * @param {Record<string, string>} inputs
 * @param {AbortController} controller
 */
const buildContext = (inputs, controller) => ({
  inputs,
  env: process.env,
  cwd: process.cwd(),
  signal: controller.signal,
  /**
   * @param {string} name
   * @param {string} value
   */
  emitOutput(name, value) {
    writeFrame({ type: "output", name, value });
  },
  /**
   * @param {"debug"|"info"|"warn"|"error"} level
   * @param {string} message
   */
  log(level, message) {
    writeFrame({ type: "log", level, message });
  },
});

const main = async () => {
  const mainPath = process.env.RUNNER_ACTION_MAIN;
  if (mainPath === undefined || mainPath.length === 0) {
    throw new Error("loader: RUNNER_ACTION_MAIN env var is required");
  }

  const controller = new AbortController();
  const onSigTerm = () => {
    controller.abort();
  };
  process.on("SIGTERM", onSigTerm);

  const { inputs } = await readStdinJson();
  const ctx = buildContext(inputs, controller);

  const mod = await import(mainPath);
  if (mod === null || typeof mod !== "object") {
    throw new Error(`loader: '${mainPath}' did not export an object module`);
  }
  const runFn = mod.run;
  if (typeof runFn !== "function") {
    throw new Error(`loader: '${mainPath}' must export an async \`run(ctx)\` function`);
  }

  await runFn(ctx);
  process.off("SIGTERM", onSigTerm);
};

main().then(
  () => {
    process.exit(0);
  },
  (err) => {
    const frame =
      err instanceof Error
        ? {
            type: "error",
            message: err.message,
            ...(err.stack !== undefined && { stack: err.stack }),
          }
        : { type: "error", message: String(err) };
    try {
      writeFrame(frame);
    } catch {
      // FD 3 may already be closed; nothing useful we can do.
    }
    process.exit(1);
  },
);
