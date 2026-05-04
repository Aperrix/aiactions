/**
 * Regenerates the JSON Schema files consumed by the IDE for `aiaction.yaml`
 * and AIactions workflow YAMLs.
 *
 * Source of truth = the Zod schemas in `@aiactions/workflows`. The
 * generated files are local-only artifacts (gitignored) and are emitted at
 * the repo root so VSCode's `yaml.schemas` setting can reference them with
 * a stable relative path.
 *
 * Note: `workflowSchema.superRefine` topology checks (cycle detection,
 * dangling needs) cannot be expressed in JSON Schema and are therefore
 * absent from the generated artifact. The runtime parser remains the
 * single source of truth for those invariants.
 */

import { writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { z } from "zod";

import { actionManifestSchema, workflowSchema } from "../packages/workflows/src/index.ts";

const ROOT = resolve(import.meta.dirname, "..");

const targets = [
  {
    file: "workflow-schema.json",
    schema: workflowSchema,
    id: "https://aiactions.dev/schemas/workflow-schema.json",
    title: "AIactions workflow",
  },
  {
    file: "manifest-schema.json",
    schema: actionManifestSchema,
    id: "https://aiactions.dev/schemas/manifest-schema.json",
    title: "AIactions action manifest (aiaction.yaml)",
  },
] as const;

for (const target of targets) {
  // `io: "input"` captures the shape authors actually write (matters for
  // schemas that coerce values via `.transform()`, e.g. `envValueSchema`).
  // `unrepresentable: "any"` keeps generation lossy-but-best-effort: any
  // construct that has no JSON Schema equivalent (transforms,
  // superRefine bodies) collapses to `{}` rather than throwing.
  const json = z.toJSONSchema(target.schema, {
    target: "draft-7",
    io: "input",
    unrepresentable: "any",
  });
  const out = { $id: target.id, title: target.title, ...json };
  const path = resolve(ROOT, target.file);
  writeFileSync(path, `${JSON.stringify(out, null, 2)}\n`);
  console.log(`wrote ${path}`);
}
