/**
 * Zod schema for `aiaction.yaml`. Mirrors GHA's `action.yml` shape closely
 * (input names, output names, `runs.main`) but keeps the filename
 * distinct (`aiaction.yaml`) to avoid collisions when a project ships
 * both AIactions and GHA workflows in the same repository.
 *
 * Action `inputs:` and `outputs:` are deliberately distinct from a
 * workflow's `workflow_call` `inputs:` / `outputs:`:
 * - action inputs follow GHA's action-input shape (no `type:` — values
 *   reach the executor as strings, who parses them as needed);
 * - action outputs declare only `description:` (the executor emits values
 *   at runtime via `ctx.emitOutput()`).
 *
 * Contents:
 * - `actionInputSchema` / `actionInputsSchema`.
 * - `actionOutputSchema` / `actionOutputsSchema`.
 * - `actionRunsSchema` (with optional `using: "bun-module"`).
 * - `actionManifestSchema` — the document.
 * - `ActionManifest` — inferred output type.
 */

import { z } from "zod";

/** A single action input declaration. Strings only (GHA-faithful). */
export const actionInputSchema = z.strictObject({
  description: z.string().min(1).optional(),
  required: z.boolean().optional(),
  default: z.string().optional(),
});

/** Map of input name → spec; keys are non-empty strings. */
export const actionInputsSchema = z.record(z.string().min(1), actionInputSchema);

/**
 * A single action output declaration. Only carries documentation; values
 * are produced at runtime by the executor through `ctx.emitOutput()`.
 */
export const actionOutputSchema = z.strictObject({
  description: z.string().min(1).optional(),
});

/** Map of output name → spec; keys are non-empty strings. */
export const actionOutputsSchema = z.record(z.string().min(1), actionOutputSchema);

/**
 * `runs:` block. `using:` is optional and currently restricted to
 * `"bun-module"`; the field is preserved as a discriminator slot so
 * future runtime kinds (Python, Docker, composite) can extend the enum
 * without a breaking schema change. When omitted, the value defaults to
 * `"bun-module"` on output so downstream consumers always see a
 * concrete runtime kind.
 *
 * `main:` must be a forward-slash, double-dot-free relative path with
 * a `.mjs` or `.js` suffix. Backslashes and `..` segments are rejected
 * to keep the resolver from having to clean up authoring footguns.
 */
export const actionRunsSchema = z.strictObject({
  using: z.literal("bun-module").default("bun-module"),
  main: z
    .string()
    .regex(
      /^\.\/(?!.*\.\.)(?!.*\\)[^\\]+\.m?js$/,
      "runs.main must be a './...'-relative .mjs/.js path with no '..' segments or backslashes",
    ),
});

/**
 * Top-level `aiaction.yaml` schema. `schemaVersion` pins the contract;
 * `name` is the kebab-case identifier used in the `<ns>/<name>@<ver>`
 * registry ref.
 */
export const actionManifestSchema = z.strictObject({
  schemaVersion: z.literal(1),
  name: z.string().regex(/^[a-z][a-z0-9-]*$/, "action name must be kebab-case"),
  description: z.string().min(1),
  runs: actionRunsSchema,
  inputs: actionInputsSchema.optional(),
  outputs: actionOutputsSchema.optional(),
});

/** Inferred output type. */
export type ActionManifest = z.infer<typeof actionManifestSchema>;
