/**
 * `parseWorkflow(filePath)` — read a workflow YAML from disk, validate
 * against `workflowSchema`, and return the typed `Workflow`.
 *
 * Errors are split into three classes via the topology marker placed on
 * graph-invariant issues:
 * - `WorkflowParseError` — file I/O or YAML syntax failure.
 * - `WorkflowSchemaError` — Zod shape failure (missing field, type
 *   mismatch, malformed `${{ }}`, kebab key violation, …).
 * - `WorkflowValidationError` — graph-invariant violation (cycle, dangling
 *   need, empty `jobs`).
 *
 * Precedence rule: when a workflow has BOTH shape and topology issues
 * (e.g. an empty `name:` and a dangling `needs:` reference), the parser
 * raises `WorkflowSchemaError`. The topology issues remain accessible via
 * `error.cause` (the underlying `ZodError`); the user fixes the shape
 * first, then re-runs to surface the graph errors.
 *
 * Contents:
 * - `parseWorkflow(filePath)` — the entry point.
 */

import { readFile } from "node:fs/promises";

import { parse as parseYaml } from "yaml";

import { type Workflow, workflowSchema } from "../schema/workflow.ts";
import {
  type ValidationIssue,
  WorkflowParseError,
  WorkflowSchemaError,
  WorkflowValidationError,
} from "../types/errors.ts";
import { partitionIssues, topologyCodeOf } from "./topology-issue.ts";

/**
 * Load and validate a workflow YAML file.
 *
 * @param filePath - Absolute or `process.cwd()`-relative path to the file.
 * @returns The parsed and graph-validated `Workflow`.
 * @throws {WorkflowParseError} when reading the file fails or the YAML
 *         content is malformed.
 * @throws {WorkflowSchemaError} when the YAML loads but does not match
 *         `workflowSchema`. Takes precedence over topology issues when
 *         both classes co-exist; the topology issues remain on `cause`.
 * @throws {WorkflowValidationError} when the shape is correct but a
 *         graph invariant (cycle, dangling need, empty jobs) is violated.
 */
export async function parseWorkflow(filePath: string): Promise<Workflow> {
  let raw: string;
  try {
    raw = await readFile(filePath, "utf-8");
  } catch (err) {
    throw new WorkflowParseError(`failed to read workflow file '${filePath}'`, { cause: err });
  }

  let parsed: unknown;
  try {
    parsed = parseYaml(raw);
  } catch (err) {
    throw new WorkflowParseError(`malformed YAML in '${filePath}'`, { cause: err });
  }

  const result = workflowSchema.safeParse(parsed);
  if (result.success) return result.data;

  const { shape, topology } = partitionIssues(result.error.issues);

  if (shape.length > 0) {
    const extra = topology.length > 0 ? ` (and ${topology.length} graph issue(s) on cause)` : "";
    throw new WorkflowSchemaError(
      `workflow '${filePath}' failed schema validation: ${result.error.message}${extra}`,
      { cause: result.error },
    );
  }

  const validationIssues: ValidationIssue[] = topology.map((i) => {
    const code = topologyCodeOf(i);
    return {
      path: i.path.filter(
        (p): p is string | number => typeof p === "string" || typeof p === "number",
      ),
      message: i.message,
      code: code as ValidationIssue["code"],
    };
  });
  throw new WorkflowValidationError(
    `workflow '${filePath}' failed graph validation`,
    validationIssues,
    { cause: result.error },
  );
}
