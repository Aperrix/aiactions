/**
 * Zod schema for the `shell:` keyword on a step. The set of allowed values
 * is GHA-faithful and intentionally hard-enumerated — custom shell command
 * lines (GHA's `shell: <prog> args {0}`) are NOT supported in v1.
 *
 * Schema acceptance is broader than runtime support on purpose: the
 * runtime decides which shell it can actually drive on the current
 * platform. Authoring `shell: pwsh` on a fixture written for a future
 * runtime should not require a schema bump once that runtime ships.
 *
 * Contents:
 * - `shellSchema` — `bash | sh | pwsh | python | cmd`.
 * - `Shell` — inferred output type.
 */

import { z } from "zod";

/** Allowed values for `step.shell`. Custom shell command lines are not yet supported. */
export const shellSchema = z.enum(["bash", "sh", "pwsh", "python", "cmd"]);

/** Inferred type. */
export type Shell = z.infer<typeof shellSchema>;
