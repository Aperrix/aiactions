/**
 * Load every `*.yaml` or `*.yml` file from one directory, parse each via
 * `parseWorkflow`, and return both the successes and the per-file failures.
 *
 * - Hidden files (`.foo.yaml`) are skipped silently.
 * - Subdirectories are skipped silently — discovery is flat per spec D2.
 * - Within-root stem collisions (`review.yaml` + `review.yml`) resolve in
 *   favour of `.yaml`; the `.yml` is silently dropped (spec D3).
 * - Broken symlinks pointing at would-be-yaml targets emit an `io_error`
 *   record (spec D5).
 * - Missing directory (ENOENT on `readdir`) is a non-event: empty result.
 *   Other directory-level errors propagate to the caller.
 */

import type { Dirent } from "node:fs";
import { readdir, stat } from "node:fs/promises";
import { join } from "node:path";

import {
  WorkflowParseError,
  WorkflowSchemaError,
  WorkflowValidationError,
} from "../types/errors.ts";
import { parseWorkflow } from "../parser/parse-workflow.ts";
import type { DirLoadResult, DiscoveredWorkflow, DiscoveryError, WorkflowOrigin } from "./types.ts";

interface Candidate {
  readonly stem: string;
  readonly ext: ".yaml" | ".yml";
  readonly absolutePath: string;
}

const YAML_FILENAME_RE = /^(.+)\.(yaml|yml)$/;

export async function loadWorkflowsFromDir(
  dir: string,
  origin: WorkflowOrigin,
): Promise<DirLoadResult> {
  let entries: Dirent[];
  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch (err) {
    const e = err as NodeJS.ErrnoException;
    if (e.code === "ENOENT") return { workflows: [], errors: [] };
    throw err;
  }

  // Pass 1 — classify candidates and capture broken-symlink errors.
  const winners = new Map<string, Candidate>();
  const errors: DiscoveryError[] = [];

  for (const entry of entries) {
    if (entry.name.startsWith(".")) continue;
    const m = YAML_FILENAME_RE.exec(entry.name);
    if (m === null) continue;
    const stem = m[1] as string;
    const extLower = m[2] as string;
    const ext = extLower === "yaml" ? ".yaml" : ".yml";
    const absolutePath = join(dir, entry.name);

    if (entry.isSymbolicLink()) {
      // Resolve the symlink target. A truly broken link (target missing or
      // path-component-not-a-dir) emits an io_error with kind "broken
      // symlink"; any OTHER stat failure (permissions, I/O) propagates
      // with its real message so the user sees the actual problem rather
      // than a misleading "broken symlink" diagnostic.
      let targetIsFile = false;
      try {
        const s = await stat(absolutePath);
        targetIsFile = s.isFile();
      } catch (err) {
        const e = err as NodeJS.ErrnoException;
        if (e.code === "ENOENT" || e.code === "ENOTDIR") {
          // ENOENT: the target path does not exist.
          // ENOTDIR: a component in the target path is not a directory.
          // Either way the symlink cannot be followed — fall through to
          // broken-symlink classification.
        } else {
          errors.push({
            absolutePath,
            origin,
            kind: "io_error",
            message: e.message,
            cause: err,
          });
          continue;
        }
      }
      if (!targetIsFile) {
        errors.push({
          absolutePath,
          origin,
          kind: "io_error",
          message: `broken symlink: ${entry.name}`,
        });
        continue;
      }
      // Fall through — treat a valid symlink-to-file as a regular file.
    } else if (!entry.isFile()) {
      continue;
    }

    const existing = winners.get(stem);
    if (existing === undefined) {
      winners.set(stem, { stem, ext, absolutePath });
      continue;
    }
    // Within-root stem collision: .yaml beats .yml. Drop loser silently.
    if (existing.ext === ".yml" && ext === ".yaml") {
      winners.set(stem, { stem, ext, absolutePath });
    }
  }

  // Pass 2 — parse winners. Per-file errors are non-blocking.
  const workflows: Array<Omit<DiscoveredWorkflow, "shadowed">> = [];
  for (const c of winners.values()) {
    try {
      const workflow = await parseWorkflow(c.absolutePath);
      workflows.push({ name: c.stem, origin, absolutePath: c.absolutePath, workflow });
    } catch (err) {
      errors.push(toDiscoveryError(err, c.absolutePath, origin));
    }
  }

  return { workflows, errors };
}

function toDiscoveryError(
  err: unknown,
  absolutePath: string,
  origin: WorkflowOrigin,
): DiscoveryError {
  if (err instanceof WorkflowParseError) {
    return { absolutePath, origin, kind: "yaml_parse", message: err.message, cause: err };
  }
  if (err instanceof WorkflowSchemaError) {
    return { absolutePath, origin, kind: "schema_validation", message: err.message, cause: err };
  }
  if (err instanceof WorkflowValidationError) {
    return { absolutePath, origin, kind: "graph_validation", message: err.message, cause: err };
  }
  const message = err instanceof Error ? err.message : String(err);
  return { absolutePath, origin, kind: "io_error", message, cause: err };
}
