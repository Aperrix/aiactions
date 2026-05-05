/**
 * `resolveUsesRef(ref, ctx)` — turn a parsed `UsesRef` into a concrete
 * on-disk action: the absolute directory and the loaded `ActionManifest`.
 *
 * Resolution rules (MS1.1):
 * - `local` ref starting with `./` or `../` → resolved against the
 *   parent directory of `ctx.workflowFile`.
 * - `local` ref starting with `file://` → already absolute (the schema
 *   stripped the scheme); used as-is after normalisation.
 * - `registry` ref `<ns>/<name>@<ver>` → resolved as
 *   `<ctx.registryRoot>/<ns>/<name>`. The `<ver>` segment is parsed by
 *   the schema but IGNORED here; multi-version selection is deferred
 *   to MS1.2.
 *
 * Loads `aiaction.yaml` via `parseActionManifest` shipped by
 * `@aiactions/workflows`. Throws `ActionResolutionError` if the
 * directory does not exist, `ActionManifestError` if the manifest is
 * missing, unreadable, malformed, or fails schema validation, and
 * `RuntimeUnsupportedError` if `manifest.runs.using` is anything other
 * than `"node"` (forward-compatible guard for future runners).
 */

import { stat } from "node:fs/promises";
import { dirname, isAbsolute, join, resolve as resolvePath } from "node:path";

import {
  type ActionManifest,
  type UsesRef,
  parseActionManifest,
  RefKind,
  WorkflowError,
} from "@aiactions/workflows";

import {
  ActionManifestError,
  ActionResolutionError,
  RuntimeUnsupportedError,
} from "../../types/errors.ts";
import { ensureCachedAction } from "./registry-fetch.ts";

/** Output of `resolveUsesRef`. */
export interface ResolvedAction {
  /** Loaded `aiaction.yaml`. */
  readonly manifest: ActionManifest;
  /** Absolute directory containing the manifest. */
  readonly dir: string;
}

/** Caller input for `resolveUsesRef`. */
export interface ResolverContext {
  /** Absolute path to the workflow file. May be unset when no `local`
   * refs are used; `local` resolution then throws `ActionResolutionError`. */
  readonly workflowFile?: string;
  /** Absolute path to the directory under which registry refs resolve
   * as `<registryRoot>/<ns>/<name>/<ver>/`. Required for `registry` refs. */
  readonly registryRoot?: string;
  /** Workflow working directory. Required when the resolver may need
   * to write the lockfile (i.e. for registry refs). */
  readonly cwd?: string;
  /** Test-injection knobs forwarded to `ensureCachedAction`. */
  readonly registryFetch?: {
    readonly canonicalUrl?: string;
    readonly tmpRoot?: string;
  };
}

const isDirectory = async (path: string): Promise<boolean> => {
  try {
    const s = await stat(path);
    return s.isDirectory();
  } catch {
    return false;
  }
};

const resolveLocalDir = (
  ref: Extract<UsesRef, { kind: "local" }>,
  workflowFile: string | undefined,
): string => {
  if (isAbsolute(ref.path)) return resolvePath(ref.path);
  if (workflowFile === undefined) {
    throw new ActionResolutionError(
      `local ref '${ref.raw}' requires options.workflowFile to be set`,
    );
  }
  return resolvePath(dirname(workflowFile), ref.path);
};

/**
 * Resolve a `UsesRef` to its on-disk directory + loaded manifest.
 *
 * @throws {ActionResolutionError} when the resolved directory does not
 *   exist, or when the caller did not supply the field needed for the
 *   ref kind (`workflowFile` for local, `registryRoot` + `cwd` for
 *   registry).
 * @throws {ActionManifestError} when `aiaction.yaml` cannot be loaded
 *   or fails schema validation.
 * @throws {RuntimeUnsupportedError} when `manifest.runs.using` is not
 *   one of the runners supported by the current milestone.
 */
export async function resolveUsesRef(ref: UsesRef, ctx: ResolverContext): Promise<ResolvedAction> {
  let dir: string;
  if (ref.kind === RefKind.local) {
    dir = resolveLocalDir(ref, ctx.workflowFile);
    if (!(await isDirectory(dir))) {
      throw new ActionResolutionError(`action directory not found for ref '${ref.raw}': ${dir}`);
    }
  } else {
    if (ctx.registryRoot === undefined) {
      throw new ActionResolutionError(
        `registry ref '${ref.raw}' requires options.registryRoot to be set`,
      );
    }
    if (ctx.cwd === undefined) {
      throw new ActionResolutionError(
        `registry ref '${ref.raw}' requires options.cwd to be set (for the lockfile path)`,
      );
    }
    const result = await ensureCachedAction(ref, ctx.registryRoot, ctx.cwd, ctx.registryFetch);
    dir = result.dir;
  }

  const manifestPath = join(dir, "aiaction.yaml");
  let manifest: ActionManifest;
  try {
    manifest = await parseActionManifest(manifestPath);
  } catch (err) {
    if (err instanceof WorkflowError) {
      throw new ActionManifestError(
        `failed to load manifest for ref '${ref.raw}': ${err.message}`,
        { cause: err },
      );
    }
    throw err;
  }

  // The schema currently restricts `runs.using` to "node"; this
  // guard remains for forward-compat (composite/Docker/Python runners
  // could widen the enum in a later milestone).
  if (manifest.runs.using !== "node") {
    const using = String(manifest.runs.using);
    throw new RuntimeUnsupportedError(
      `runs.using '${using}' for ref '${ref.raw}' is not yet implemented (currently 'node' only)`,
    );
  }

  return { manifest, dir };
}
