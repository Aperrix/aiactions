import { discoverWorkflows } from "@aiactions/discovery";
import { parseWorkflow } from "@aiactions/parser";

import { UsageError } from "../../../_shared/cli-error.ts";

export interface CheckIssue {
  readonly kind: string;
  readonly message: string;
}

export interface CheckResult {
  readonly path: string;
  readonly ok: boolean;
  readonly errors: ReadonlyArray<CheckIssue>;
}

export interface CheckWorkflowArgs {
  readonly path: string | undefined;
  readonly all: boolean;
}

/**
 * Slice orchestrator for `aia workflow check`.
 *
 * Mutually exclusive modes:
 * - positional `<path>` → `parseWorkflow(path)`, rethrow on failure.
 * - `--all`             → `discoverWorkflows()`, project errors[] into CheckResult[].
 */
export async function runCheckWorkflow(args: CheckWorkflowArgs): Promise<CheckResult[]> {
  if (args.path === undefined && !args.all) {
    throw new UsageError("expected exactly one of <path> or --all");
  }
  if (args.path !== undefined && args.all) {
    throw new UsageError("<path> and --all are mutually exclusive");
  }

  if (args.path !== undefined) {
    // Single-file mode: rethrow Workflow*Error unchanged.
    // Errors bubble through cli.ts → EXIT_BY_BRICK_ERROR → EXIT.SCHEMA.
    await parseWorkflow(args.path);
    return [{ path: args.path, ok: true, errors: [] }];
  }

  // --all mode: map DiscoveryResult into CheckResult[].
  const discovery = await discoverWorkflows();
  const ok: CheckResult[] = discovery.workflows.map(
    (w): CheckResult => ({ path: w.absolutePath, ok: true, errors: [] }),
  );
  const failed: CheckResult[] = discovery.errors.map(
    (e): CheckResult => ({
      path: e.absolutePath,
      ok: false,
      errors: [{ kind: e.kind, message: e.message }],
    }),
  );
  // Stable order: ok rows first (sorted by absolutePath), failed rows next (also sorted).
  ok.sort((a, b) => a.path.localeCompare(b.path));
  failed.sort((a, b) => a.path.localeCompare(b.path));
  return [...ok, ...failed];
}
