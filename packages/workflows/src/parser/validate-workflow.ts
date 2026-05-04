/**
 * `validateWorkflow(workflow)` — re-runs `workflowSchema` on an
 * already-typed `Workflow` and returns the graph-invariant issues as a
 * structured array. Use this when a caller already has a `Workflow` value
 * (e.g. obtained through a different code path) and wants to re-verify
 * the graph shape without re-parsing YAML.
 *
 * The parser-level entry point `parseWorkflow` handles the same checks as
 * part of its `safeParse` pass and throws `WorkflowValidationError` on
 * graph violations; this function exists for callers that want a
 * non-throwing, list-style result.
 *
 * Contents:
 * - `validateWorkflow(workflow)` — pure; returns `ValidationIssue[]`.
 */

import { TOPOLOGY_ISSUE_KIND, type Workflow, workflowSchema } from "../schema/workflow.ts";
import type { ValidationIssue } from "../types/errors.ts";

interface IssueParams {
  readonly kind?: unknown;
}

/**
 * Re-validate an already-parsed workflow's graph invariants and return
 * any issues found as a list. Empty list means the workflow is valid.
 *
 * @param workflow - A `Workflow` value that has already passed shape
 *                    validation through `parseWorkflow` or another path.
 * @returns Array of `ValidationIssue`; empty if the graph is valid.
 */
export function validateWorkflow(workflow: Workflow): ValidationIssue[] {
  const result = workflowSchema.safeParse(workflow);
  if (result.success) return [];

  const issues: ValidationIssue[] = [];
  for (const i of result.error.issues) {
    if (i.code !== "custom") continue;
    const params = i.params as IssueParams | undefined;
    if (params?.kind !== TOPOLOGY_ISSUE_KIND) continue;
    issues.push({
      path: i.path.filter(
        (p): p is string | number => typeof p === "string" || typeof p === "number",
      ),
      message: i.message,
      code: TOPOLOGY_ISSUE_KIND,
    });
  }
  return issues;
}
