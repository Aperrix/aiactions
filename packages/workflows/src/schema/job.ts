/**
 * Zod schema for a workflow job. A job is either a list of `steps:` or a
 * job-level `uses:` invocation of a reusable workflow. Mutual exclusion
 * is enforced via `superRefine` (same pattern as `stepSchema`).
 *
 * Contents:
 * - `jobIdSchema` — kebab-case id; reused by `needs:` arrays and as the
 *   map key in `workflowSchema.jobs`.
 * - Field-level schemas: `jobNameSchema`, `jobNeedsSchema`,
 *   `jobOutputsSchema`.
 * - `jobSchema` — top-level schema with XOR enforcement.
 * - `Job` — inferred output type.
 */

import { z } from "zod";

import { envSchema } from "./env.ts";
import { expressionStringSchema } from "./expression.ts";
import { usesRefSchema } from "./ref.ts";
import { ifSchema, stepSchema, withSchema } from "./step.ts";

/** Job id: kebab-case identifier; doubles as the map key in `workflow.jobs`. */
export const jobIdSchema = z
  .string()
  .regex(/^[a-z][a-z0-9-]*$/, "job id must be kebab-case (lowercase, digits, hyphens)");

/** Job display name: free-form, must contain at least one non-whitespace character. */
export const jobNameSchema = z
  .string()
  .regex(/\S/, "name must contain at least one non-whitespace character");

/** `needs:` array; each entry must satisfy `jobIdSchema`. Empty array allowed (means no needs). */
export const jobNeedsSchema = z.array(jobIdSchema);

/**
 * `outputs:` — map from output name to expression string. Expression body
 * is preserved verbatim; resolution against `steps.<id>.outputs` happens
 * later in the evaluator.
 */
export const jobOutputsSchema = z.record(z.string().min(1), expressionStringSchema);

const baseJobShape = z.strictObject({
  name: jobNameSchema.optional(),
  needs: jobNeedsSchema.optional(),
  if: ifSchema.optional(),
  env: envSchema.optional(),
  outputs: jobOutputsSchema.optional(),
  steps: z.array(stepSchema).min(1).optional(),
  uses: usesRefSchema.optional(),
  with: withSchema.optional(),
});

/**
 * Top-level job schema. Validates the strict-object shape and enforces:
 * - exactly one of `steps:` / `uses:` (`run:`-style XOR);
 * - `with:` is only valid on `uses:` jobs.
 *
 * Returned shape is unmodified (no kebab fields at job level v1, so no
 * remap step is needed).
 */
export const jobSchema = baseJobShape.superRefine((job, ctx) => {
  const hasSteps = job.steps !== undefined;
  const hasUses = job.uses !== undefined;

  if (hasSteps && hasUses) {
    ctx.addIssue({
      code: "custom",
      message: "job must declare either 'steps:' or 'uses:', not both",
    });
  } else if (!hasSteps && !hasUses) {
    ctx.addIssue({
      code: "custom",
      message: "job must declare either 'steps:' or 'uses:'",
    });
  }

  if (hasSteps && job.with !== undefined) {
    ctx.addIssue({
      code: "custom",
      message: "'with:' is only valid on 'uses:' jobs",
      path: ["with"],
    });
  }
});

/** Inferred output type. */
export type Job = z.infer<typeof jobSchema>;
