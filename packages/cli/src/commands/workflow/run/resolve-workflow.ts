import { isAbsolute, resolve } from "node:path";

import { discoverWorkflows } from "@aiactions/discovery";
import { parseWorkflow } from "@aiactions/parser";
import type { Workflow } from "@aiactions/schema";

import { UsageError } from "../../../_shared/cli-error.ts";

export interface ResolveArgs {
  /** Absolute or cwd-relative path to a workflow YAML. */
  readonly file: string | undefined;
  /** Discovered workflow name (looked up via `discoverWorkflows`). */
  readonly name: string | undefined;
  /** Resolved working directory used as the relative-path anchor and the
   *  discovery cwd. */
  readonly cwd: string;
}

export interface ResolvedWorkflow {
  readonly workflow: Workflow;
  /** Absolute path of the resolved workflow file (used as
   *  `runWorkflow`'s `workflowFile` for local `uses:` resolution). */
  readonly absolutePath: string;
}

/**
 * Dispatch between the `--file <path>` and positional `<name>` modes.
 *
 * - `--file` calls `parseWorkflow(absolutePath)` directly. Errors
 *   (`WorkflowParseError`, `WorkflowSchemaError`, `WorkflowValidationError`)
 *   bubble unchanged → mapped to `EXIT.SCHEMA` by `cli.ts`.
 * - `<name>` calls `discoverWorkflows({ cwd })`, looks up the workflow
 *   by name, returns its already-parsed AST. Miss → `UsageError`.
 *
 * Argument validation (no name + no file, or both) is the orchestrator's
 * responsibility, not this helper's.
 */
export async function resolveWorkflow(args: ResolveArgs): Promise<ResolvedWorkflow> {
  if (args.file !== undefined) {
    const absolutePath = isAbsolute(args.file) ? args.file : resolve(args.cwd, args.file);
    const workflow = await parseWorkflow(absolutePath);
    return { workflow, absolutePath };
  }

  // args.name !== undefined here; the orchestrator already validated this.
  const result = await discoverWorkflows({ cwd: args.cwd });
  const found = result.workflows.find((w) => w.name === args.name);
  if (found === undefined) {
    throw new UsageError(
      `workflow not found: ${args.name ?? "<undefined>"}. Run \`aia workflow list\` to see available.`,
    );
  }
  return { workflow: found.workflow, absolutePath: found.absolutePath };
}
