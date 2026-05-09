/**
 * Zod schema for the `env:` map. A flat `Record<envName, value>` used at
 * workflow / job / step level to override or extend the env passed to
 * subprocesses. Values may interpolate `${{ }}` expressions.
 *
 * Contents:
 * - `envNameSchema` — validates a single env variable name (POSIX identifier).
 * - `envValueSchema` — coerces numbers / booleans to string + validates
 *   well-formedness as an `${{ }}` expression string.
 * - `envSchema` — the full map; inferred type `Env`.
 *
 * Note: the `passthrough:` allowlist (trust-tier model for third-party
 * `uses:` actions) is a separate workflow-level field and is NOT part of
 * `env:`. It will be added when the workflow schema is wired up.
 */

import { z } from "zod";

import { expressionStringSchema } from "./shell.ts";

/**
 * POSIX-style identifier regex for env variable names. Accepts ASCII
 * letters, digits and underscore; the first character must not be a digit.
 */
export const envNameSchema = z
  .string()
  .regex(/^[A-Za-z_][A-Za-z0-9_]*$/, "env name must match POSIX identifier");

/**
 * Schema for a single env value. Coerces numbers and booleans to their
 * string form (matches GHA's implicit YAML-to-string convention so
 * `PORT: 3000` and `DEBUG: true` parse without quoting), then validates
 * the result as a well-formed `${{ }}` expression string.
 *
 * Coercion table (input → string output):
 * - `string`     → unchanged
 * - `number`     → `String(n)` (uses JS default; floats with magnitude
 *                  beyond ±1e21 acquire scientific notation)
 * - `boolean`    → `"true"` / `"false"`
 * - `null` / `undefined` / `object` / `array` → rejected at type check
 *                  before coercion runs
 */
export const envValueSchema = z
  .union([z.string(), z.number(), z.boolean()])
  .transform((value) => String(value))
  .pipe(expressionStringSchema);

/**
 * Schema for the full `env:` map. Keys must be valid POSIX identifiers,
 * values are coerced strings that may interpolate `${{ }}` expressions.
 */
export const envSchema = z.record(envNameSchema, envValueSchema);

/** Inferred type: `Record<string, string>` after coercion. */
export type Env = z.infer<typeof envSchema>;
