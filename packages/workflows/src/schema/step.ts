/**
 * Zod schema for a workflow step. A step is either a `run:` (inline shell)
 * or a `uses:` (action invocation), enforced via a `superRefine` XOR check
 * (Zod's `discriminatedUnion` requires a literal discriminator, which we
 * lack — both forms share an unmarked base shape).
 *
 * YAML-side keys are kebab-case (`working-directory`, `timeout-minutes`)
 * to mirror GHA; the schema remaps them to camelCase on output via
 * `.transform()` so consumers can write `step.workingDirectory`.
 *
 * Contents:
 * - Field-level schemas: `stepIdSchema`, `stepNameSchema`, `ifSchema`,
 *   `workingDirectorySchema`, `timeoutMinutesSchema`, `withSchema`.
 * - `stepSchema` — top-level schema with XOR enforcement and remap.
 * - `Step` — inferred output type, camelCase keys.
 */

import { z } from "zod";

import { envSchema } from "./env.ts";
import { expressionStringSchema } from "./expression.ts";
import { usesRefSchema } from "./ref.ts";

/** Step id: optional, kebab-case identifier when present. */
export const stepIdSchema = z
  .string()
  .regex(/^[a-z][a-z0-9-]*$/, "step id must be kebab-case (lowercase, digits, hyphens)");

/** Step display name: free-form non-empty string. */
export const stepNameSchema = z.string().min(1);

/**
 * `if:` condition. GHA-faithful permissive form: accepts boolean literals
 * and any well-formed expression string. Truthy/falsy decision is the
 * evaluator's job (later milestone).
 */
export const ifSchema = z.union([z.boolean(), expressionStringSchema]);

/** `working-directory:`: any well-formed expression string (path). */
export const workingDirectorySchema = expressionStringSchema;

/** `timeout-minutes:`: positive integer minutes. */
export const timeoutMinutesSchema = z.number().int().positive();

/** `with:`: free-form input map; values may interpolate expressions. */
export const withSchema = z.record(z.string().min(1), expressionStringSchema);

const baseStepShape = z.strictObject({
  id: stepIdSchema.optional(),
  name: stepNameSchema.optional(),
  if: ifSchema.optional(),
  env: envSchema.optional(),
  "working-directory": workingDirectorySchema.optional(),
  "timeout-minutes": timeoutMinutesSchema.optional(),
  run: expressionStringSchema.optional(),
  uses: usesRefSchema.optional(),
  with: withSchema.optional(),
});

/**
 * Top-level step schema. Validates the strict-object shape, enforces the
 * `run:` / `uses:` XOR via `superRefine`, then remaps kebab-case keys to
 * camelCase via `.transform()`.
 *
 * Output type is the union of two narrow shapes (one with `run`, one with
 * `uses`); consumers can discriminate on field presence.
 */
export const stepSchema = baseStepShape
  .superRefine((step, ctx) => {
    const hasRun = step.run !== undefined;
    const hasUses = step.uses !== undefined;

    if (hasRun && hasUses) {
      ctx.addIssue({
        code: "custom",
        message: "step must declare either 'run:' or 'uses:', not both",
      });
    } else if (!hasRun && !hasUses) {
      ctx.addIssue({
        code: "custom",
        message: "step must declare either 'run:' or 'uses:'",
      });
    }

    if (hasRun && step.with !== undefined) {
      ctx.addIssue({
        code: "custom",
        message: "'with:' is only valid on 'uses:' steps",
        path: ["with"],
      });
    }
  })
  .transform((step) => {
    const {
      "working-directory": workingDirectory,
      "timeout-minutes": timeoutMinutes,
      ...rest
    } = step;
    return {
      ...rest,
      ...(workingDirectory !== undefined && { workingDirectory }),
      ...(timeoutMinutes !== undefined && { timeoutMinutes }),
    };
  });

/** Inferred output type with camelCase keys. */
export type Step = z.infer<typeof stepSchema>;
