/**
 * `validateWorkflow(workflow)` — re-runs `workflowSchema` on an
 * already-typed `Workflow` and returns the graph-invariant issues as a
 * structured array. Use this when a caller already has a `Workflow` value
 * (e.g. obtained through a different code path) and wants to re-verify
 * the graph shape without re-parsing YAML.
 *
 * The parser-level entry point `parseWorkflow` handles the same checks
 * during its `safeParse` pass and throws `WorkflowValidationError` on
 * graph violations; this function exists for callers that want a
 * non-throwing, list-style result.
 *
 * Contents:
 * - `validateWorkflow(workflow)` — pure; returns `ValidationIssue[]`.
 */

import { type Workflow, workflowSchema } from "../schema/workflow.ts";
import type { ValidationIssue } from "../types/errors.ts";
import { isTopologyIssue, topologyCodeOf } from "./topology-issue.ts";

/**
 * Re-validate an already-parsed workflow's graph invariants and return
 * any issues found as a list. Empty list means the graph is valid.
 *
 * Shape-level issues are intentionally filtered out: callers feeding a
 * pre-typed `Workflow` value should already have shape guarantees.
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
    if (!isTopologyIssue(i)) continue;
    const code = topologyCodeOf(i);
    issues.push({
      path: i.path.filter(
        (p): p is string | number => typeof p === "string" || typeof p === "number",
      ),
      message: i.message,
      code: code as ValidationIssue["code"],
    });
  }
  return issues;
}
