/**
 * `parseActionManifest(filePath)` — read an `aiaction.yaml` from disk,
 * validate against `actionManifestSchema`, return the typed manifest.
 *
 * Action manifests have no graph invariants — only shape — so failure
 * modes collapse to `WorkflowParseError` (I/O or YAML syntax) or
 * `WorkflowSchemaError` (shape violation).
 *
 * Contents:
 * - `parseActionManifest(filePath)` — the entry point.
 */

import { readFile } from "node:fs/promises";

import { parse as parseYaml } from "yaml";

import {
  type ActionManifest,
  WorkflowParseError,
  WorkflowSchemaError,
  actionManifestSchema,
} from "@aiactions/schema";

/**
 * Load and validate an `aiaction.yaml` file.
 *
 * @param filePath - Absolute or `process.cwd()`-relative path to the file.
 * @returns The parsed `ActionManifest`.
 * @throws {WorkflowParseError} when reading the file fails or the YAML
 *         content is malformed.
 * @throws {WorkflowSchemaError} when the YAML loads but does not match
 *         `actionManifestSchema`.
 */
export async function parseActionManifest(filePath: string): Promise<ActionManifest> {
  let raw: string;
  try {
    raw = await readFile(filePath, "utf-8");
  } catch (err) {
    throw new WorkflowParseError(`failed to read action manifest '${filePath}'`, { cause: err });
  }

  let parsed: unknown;
  try {
    parsed = parseYaml(raw);
  } catch (err) {
    throw new WorkflowParseError(`malformed YAML in '${filePath}'`, { cause: err });
  }

  const result = actionManifestSchema.safeParse(parsed);
  if (result.success) return result.data;

  throw new WorkflowSchemaError(
    `action manifest '${filePath}' failed schema validation: ${result.error.message}`,
    { cause: result.error },
  );
}
