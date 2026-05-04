/**
 * Zod schema for the `shell:` keyword on a step. The accepted shape is
 * GHA-faithful: either a built-in shell name (`bash | sh | pwsh | python
 * | cmd`) or a custom shell template string of the form
 * `<cmd> [opts] {0} [more_opts]`. When the author writes a template
 * verbatim — even if the first token matches a built-in name — the
 * runtime uses the template as-is and does not inject any default flags.
 *
 * Schema acceptance is broader than runtime support on purpose: the
 * runtime decides which shell it can actually drive on the current
 * platform.
 *
 * Contents:
 * - `BUILTIN_SHELLS` — readonly tuple of built-in shell names.
 * - `customShellTemplateRegex` — regex used by both schema and runtime
 *   to detect a template string.
 * - `shellSchema` — the union accepted at parse time.
 * - `Shell` — inferred output type (built-in name OR template string).
 */

import { z } from "zod";

/** Built-in shell names accepted as shorthand for the GHA-default invocation templates. */
export const BUILTIN_SHELLS = ["bash", "sh", "pwsh", "python", "cmd"] as const;

/**
 * Regex that matches a GHA-style custom shell template:
 * `<cmd> [opts] {0} [more_opts]`. The first whitespace-delimited token
 * is the command; `{0}` MUST appear and MUST be surrounded by
 * whitespace (so `perl{0}` is rejected — it would be ambiguous to
 * argv-tokenise). Multiplicity (exactly one `{0}`) is checked
 * separately via a `.refine(...)`.
 */
export const customShellTemplateRegex = /^\S+(\s+\S+)*\s+\{0\}(\s+\S+)*$/;

const customShellTemplateSchema = z
  .string()
  .regex(customShellTemplateRegex, "shell template must contain a {0} placeholder")
  .refine(
    (s) => (s.match(/\{0\}/g) ?? []).length === 1,
    "shell template must contain exactly one {0} placeholder",
  );

const builtinShellSchema = z.enum(BUILTIN_SHELLS);

/** Allowed values for `step.shell`: a built-in name or a custom template string. */
export const shellSchema = z.union([builtinShellSchema, customShellTemplateSchema]);

/** Inferred type — note that the union of `enum` and `string` collapses to `string` in TypeScript. */
export type Shell = z.infer<typeof shellSchema>;
