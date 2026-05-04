/**
 * Top-level workflow schema. Wires together env / job / inputs / outputs /
 * passthrough into a single document and enforces the cross-job graph
 * invariants (dangling needs, cycles) inside `superRefine`. Job id
 * uniqueness is delegated to the YAML parser (duplicate keys = parse error
 * upstream); per-job `steps:`/`uses:` XOR is enforced inside `jobSchema`.
 *
 * The `inputs:` and `outputs:` sections at the top level mirror GHA's
 * `on: workflow_call:` shape — they describe how a reusable workflow is
 * invoked. They are deliberately distinct from `aiaction.yaml`'s inputs /
 * outputs (different field constraints, different consumers).
 *
 * Contents:
 * - `workflowInputTypeSchema` — enum string|boolean|number for `inputs.*.type`.
 * - `workflowInputSchema` / `workflowOutputSchema`.
 * - `workflowInputsSchema` / `workflowOutputsSchema` — record wrappers.
 * - `passthroughSchema` — top-level allowlist for third-party `uses:` env.
 * - `workflowSchema` — the document; aggregates topology checks.
 * - `Workflow` — inferred output type.
 */

import { z } from "zod";

import { ValidationIssueCode } from "../types/errors.ts";
import { envNameSchema, envSchema } from "./env.ts";
import { expressionStringSchema } from "./expression.ts";
import { jobIdSchema, jobSchema } from "./job.ts";
import { type DepRecord, findCycle, findDanglingDeps } from "./topology.ts";

/** Allowed types for a `workflow_call` input. */
export const workflowInputTypeSchema = z.enum(["string", "boolean", "number"]);

export type WorkflowInputType = z.infer<typeof workflowInputTypeSchema>;

/** Schema for a single `workflow_call` input declaration. */
export const workflowInputSchema = z.strictObject({
  description: z.string().min(1).optional(),
  required: z.boolean().optional(),
  default: z.union([z.string(), z.boolean(), z.number()]).optional(),
  type: workflowInputTypeSchema,
});

/** Schema for a single `workflow_call` output declaration. */
export const workflowOutputSchema = z.strictObject({
  description: z.string().min(1).optional(),
  value: expressionStringSchema,
});

/** Map of input name → spec; keys are non-empty strings. */
export const workflowInputsSchema = z.record(z.string().min(1), workflowInputSchema);

/** Map of output name → spec; keys are non-empty strings. */
export const workflowOutputsSchema = z.record(z.string().min(1), workflowOutputSchema);

/**
 * Marker placed on Zod issues raised by `workflowSchema.superRefine`. The
 * parser uses it to discriminate graph-invariant violations (raise
 * `WorkflowValidationError`) from shape violations (raise
 * `WorkflowSchemaError`).
 */
export const TOPOLOGY_ISSUE_KIND = "topology" as const;

export type TopologyIssueKind = typeof TOPOLOGY_ISSUE_KIND;

/**
 * `passthrough:` allowlist for env vars that may flow from the runner
 * process into third-party `uses:` actions. Shape is validated at parse
 * time; enforcement happens in the runner (later milestone).
 */
export const passthroughSchema = z.array(envNameSchema);

const baseWorkflowShape = z.strictObject({
  name: z.string().regex(/\S/, "name must contain at least one non-whitespace character"),
  description: z
    .string()
    .regex(/\S/, "description must contain at least one non-whitespace character")
    .optional(),
  env: envSchema.optional(),
  passthrough: passthroughSchema.optional(),
  inputs: workflowInputsSchema.optional(),
  outputs: workflowOutputsSchema.optional(),
  jobs: z.record(jobIdSchema, jobSchema),
});

/**
 * Top-level workflow schema. Validates the shape, enforces `jobs` is
 * non-empty, and aggregates dependency-graph invariants in a single
 * `superRefine` pass.
 *
 * Ordering inside the refiner is load-bearing: dangling-need detection
 * runs first so that cycle detection only walks edges into nodes that
 * exist. A graph with both a dangling need and a cycle surfaces only the
 * dangling-need issue per pass.
 */
export const workflowSchema = baseWorkflowShape.superRefine((wf, ctx) => {
  const jobIds = Object.keys(wf.jobs);
  if (jobIds.length === 0) {
    ctx.addIssue({
      code: "custom",
      message: "'jobs' must declare at least one job",
      path: ["jobs"],
      params: { kind: TOPOLOGY_ISSUE_KIND, code: ValidationIssueCode.emptyJobs },
    });
    return;
  }

  const records: DepRecord[] = jobIds.map((id) => ({
    id,
    deps: wf.jobs[id]?.needs ?? [],
  }));

  const dangling = findDanglingDeps(records);
  if (dangling.length > 0) {
    for (const d of dangling) {
      for (const missing of d.missing) {
        ctx.addIssue({
          code: "custom",
          message: `job '${d.id}' has a dangling 'needs' reference to '${missing}'`,
          path: ["jobs", d.id, "needs"],
          params: { kind: TOPOLOGY_ISSUE_KIND, code: ValidationIssueCode.danglingNeed },
        });
      }
    }
    return; // Skip cycle check; would walk into ghost nodes.
  }

  const cycle = findCycle(records);
  if (cycle) {
    ctx.addIssue({
      code: "custom",
      message: `cycle detected in 'needs' graph: ${cycle.join(" → ")}`,
      path: ["jobs"],
      params: { kind: TOPOLOGY_ISSUE_KIND, code: ValidationIssueCode.cycleDetected },
    });
  }
});

/** Inferred output type. */
export type Workflow = z.infer<typeof workflowSchema>;
