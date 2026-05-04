/**
 * Zod schema for the `defaults.run` block, accepted at both workflow
 * and job scope. Mirrors GHA's shape exactly: `shell` and
 * `working-directory` are the only fields. Authors write the kebab-case
 * key in YAML; we transform to camelCase on output to match the rest of
 * the parsed model.
 *
 * Contents:
 * - `runDefaultsSchema` — the inner `run:` object.
 * - `defaultsSchema` — the outer wrapper (`{ run?: ... }`).
 * - `RunDefaults`, `Defaults` — inferred output types.
 */

import { z } from "zod";

import { expressionStringSchema } from "./expression.ts";
import { shellSchema } from "./shell.ts";

const baseRunDefaultsShape = z.strictObject({
  shell: shellSchema.optional(),
  "working-directory": expressionStringSchema.optional(),
});

/**
 * Inner `defaults.run` block. Remaps `working-directory` to camelCase on
 * output so consumers can read `defaults.run.workingDirectory` exactly
 * like `step.workingDirectory`.
 */
export const runDefaultsSchema = baseRunDefaultsShape.transform((d) => {
  const { "working-directory": workingDirectory, ...rest } = d;
  return {
    ...rest,
    ...(workingDirectory !== undefined && { workingDirectory }),
  };
});

/** Outer `defaults` wrapper. GHA only defines `defaults.run`; we mirror that. */
export const defaultsSchema = z.strictObject({
  run: runDefaultsSchema.optional(),
});

/** Inferred output type for the inner `run:` block. */
export type RunDefaults = z.infer<typeof runDefaultsSchema>;

/** Inferred output type for the outer `defaults` wrapper. */
export type Defaults = z.infer<typeof defaultsSchema>;
