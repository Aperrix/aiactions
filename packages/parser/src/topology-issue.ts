/**
 * Internal helper for the parser layer to recognise Zod issues raised by
 * `workflowSchema.superRefine` and route them to `WorkflowValidationError`.
 *
 * Topology issues carry `params: { kind: "topology", code?: ValidationIssueCode }`
 * — the marker is set explicitly in `workflowSchema` so the parser can
 * partition mixed shape + graph errors without re-running the schema.
 *
 * Contents:
 * - `IssueParams` — shape of the optional `params` field on `ZodIssue`.
 * - `isTopologyIssue(issue)` — type-guard returning `true` only for
 *   issues raised by the workflow's topology pass.
 * - `topologyCodeOf(issue)` — extracts the specific code (e.g.
 *   `"CYCLE_DETECTED"`) from a topology issue.
 * - `partitionIssues(issues)` — splits a flat issue list into shape and
 *   topology buckets.
 */

import type { $ZodIssue } from "zod/v4/core";

import { TOPOLOGY_ISSUE_KIND, ValidationIssueCode } from "@aiactions/schema";

/** Shape of the optional `params` field on `$ZodIssue` for topology markers. */
export interface IssueParams {
  readonly kind?: unknown;
  readonly code?: unknown;
}

/**
 * Type-guard for issues that originate from the workflow topology pass.
 *
 * @param issue - Any Zod issue.
 * @returns `true` when the issue carries the topology marker placed by
 *          `workflowSchema.superRefine`.
 */
export function isTopologyIssue(issue: $ZodIssue): boolean {
  if (issue.code !== "custom") return false;
  const params = (issue as { params?: IssueParams }).params;
  return params?.kind === TOPOLOGY_ISSUE_KIND;
}

/**
 * Extract the specific topology code (`CYCLE_DETECTED`, `DANGLING_NEED`,
 * `EMPTY_JOBS`) from a topology issue's `params.code`. Falls back to a
 * generic placeholder if a future topology check forgets to set one.
 *
 * @param issue - A Zod issue that has already passed `isTopologyIssue`.
 * @returns The specific code string, or `"TOPOLOGY"` as a safe default.
 */
export function topologyCodeOf(issue: $ZodIssue): string {
  const params = (issue as { params?: IssueParams }).params;
  if (typeof params?.code === "string") return params.code;
  return "TOPOLOGY";
}

/** Result of `partitionIssues`. */
export interface PartitionedIssues {
  readonly shape: readonly $ZodIssue[];
  readonly topology: readonly $ZodIssue[];
}

/**
 * Split a flat Zod issue list into shape and topology buckets. Used by
 * the parser to route an aggregate failure to the correct error class
 * (or to surface the precedence rule when both classes are present).
 */
export function partitionIssues(issues: readonly $ZodIssue[]): PartitionedIssues {
  const shape: $ZodIssue[] = [];
  const topology: $ZodIssue[] = [];
  for (const issue of issues) {
    if (isTopologyIssue(issue)) topology.push(issue);
    else shape.push(issue);
  }
  return { shape, topology };
}

// Internal re-export to avoid an unused-import lint when callers only
// need the constant via this module.
export { ValidationIssueCode };
