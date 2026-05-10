import { parseActionManifest } from "@aiactions/parser";
import { WorkflowParseError, WorkflowSchemaError } from "@aiactions/schema";
import type { ZodError } from "zod";

import { NotFoundError } from "../../../_shared/cli-error.ts";
import type { Issue } from "./format-issues.ts";

export type { Issue } from "./format-issues.ts";

export interface CheckResult {
  readonly path: string;
  readonly ok: boolean;
  readonly errors: Issue[];
  readonly warnings: Issue[];
}

/**
 * Convert a zod `issue.path` (`PropertyKey[]`) into the canonical CLI
 * form: dot-joined for object keys, `[N]`-wrapped for array indices.
 * `joinZodPath(["outputs", 0, "description"])` → `"outputs[0].description"`.
 * Symbol segments — extremely rare in practice — fall through to
 * `String(seg)` so we never throw on the rendering path.
 */
export function joinZodPath(segments: ReadonlyArray<PropertyKey>): string {
  let out = "";
  for (const seg of segments) {
    if (typeof seg === "number") {
      out += `[${seg}]`;
    } else if (out.length === 0) {
      out = String(seg);
    } else {
      out += `.${String(seg)}`;
    }
  }
  return out;
}

function isENOENT(cause: unknown): boolean {
  return (cause as NodeJS.ErrnoException | undefined)?.code === "ENOENT";
}

/**
 * Validate a single `aiaction.yaml`. Schema-only (no `fs.stat` on
 * referenced relative paths). Never throws for schema or YAML errors —
 * they are returned in `errors`. ENOENT bubbles up as `NotFoundError`
 * because it maps to a different exit code (`EXIT.NOT_FOUND`).
 */
export async function checkManifest(path: string): Promise<CheckResult> {
  try {
    await parseActionManifest(path);
    return { path, ok: true, errors: [], warnings: [] };
  } catch (err) {
    if (err instanceof WorkflowSchemaError) {
      // err.cause is always the ZodError — WorkflowSchemaError contract.
      const zodErr = err.cause as ZodError;
      const errors: Issue[] = zodErr.issues.map((i) => ({
        zodPath: joinZodPath(i.path),
        message: i.message,
      }));
      return { path, ok: false, errors, warnings: [] };
    }
    if (err instanceof WorkflowParseError) {
      if (isENOENT(err.cause)) {
        throw new NotFoundError(`manifest not found: ${path}`);
      }
      return {
        path,
        ok: false,
        errors: [{ zodPath: "", message: err.message }],
        warnings: [],
      };
    }
    throw err;
  }
}
