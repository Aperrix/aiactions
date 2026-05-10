import { stat } from "node:fs/promises";
import { isAbsolute, resolve } from "node:path";

import { runWorkflow } from "@aiactions/core";
import type { RunResult } from "@aiactions/schema";

import { UsageError } from "../../../_shared/cli-error.ts";
import { parseKv } from "./parse-kv.ts";
import { makeReceipt } from "./receipt.ts";
import { resolveWorkflow } from "./resolve-workflow.ts";

export interface RunRunArgs {
  /** Discovered workflow name. */
  readonly name: string | undefined;
  /** Direct workflow file path. */
  readonly file: string | undefined;
  /** Repeatable `--input k=v`. Always an array (orchestrator-supplied). */
  readonly input: ReadonlyArray<string>;
  /** Repeatable `--env k=v`. Always an array. */
  readonly env: ReadonlyArray<string>;
  /** `--cwd` flag value, or `undefined` to default to `process.cwd()`. */
  readonly cwd: string | undefined;
  /** `--json` flag. */
  readonly json: boolean;
  /** Cancellation signal forwarded from `command.ts`. Mutated externally. */
  readonly signal?: AbortSignal;
}

export interface RunRunResult {
  readonly result: RunResult;
  readonly cancelled: boolean;
  readonly workflowAbsolutePath: string;
}

/**
 * Slice orchestrator for `aia workflow run`. Validates argv, resolves
 * the workflow source (name vs file), parses `--input` / `--env`,
 * validates `--cwd`, then invokes `runWorkflow()` with a receipt-backed
 * event sink.
 *
 * The "RunRun" prefix is intentional: the slice's verb is "run" and the
 * orchestrator runs that verb's command, mirroring phase-6's
 * `runListWorkflow` / `runCheckWorkflow` naming convention.
 */
export async function runRunWorkflow(args: RunRunArgs): Promise<RunRunResult> {
  // 1. Argument validation.
  if (args.name === undefined && args.file === undefined) {
    throw new UsageError("expected <name> or --file");
  }
  if (args.name !== undefined && args.file !== undefined) {
    throw new UsageError("<name> and --file are mutually exclusive");
  }

  const inputs = parseKv(args.input, "--input");
  const env = parseKv(args.env, "--env");

  // 2. Resolve cwd.
  const rawCwd = args.cwd ?? process.cwd();
  const cwd = isAbsolute(rawCwd) ? rawCwd : resolve(process.cwd(), rawCwd);
  try {
    const stats = await stat(cwd);
    if (!stats.isDirectory()) {
      throw new UsageError(`cwd does not exist: ${cwd}`);
    }
  } catch (err) {
    if (err instanceof UsageError) throw err;
    throw new UsageError(`cwd does not exist: ${cwd}`);
  }

  // 3. Resolve the workflow source.
  const { workflow, absolutePath } = await resolveWorkflow({
    file: args.file,
    name: args.name,
    cwd,
  });

  // 4. Run.
  const receipt = makeReceipt(args.json);
  const result = await runWorkflow(workflow, {
    inputs,
    env,
    cwd,
    workflowFile: absolutePath,
    onEvent: (event) => receipt.emit(event),
    ...(args.signal !== undefined && { signal: args.signal }),
  });

  const cancelled = args.signal?.aborted === true;
  receipt.finalize(result, cancelled);

  return { result, cancelled, workflowAbsolutePath: absolutePath };
}
