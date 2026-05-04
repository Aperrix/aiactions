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
 * than `"bun-module"` (forward-compatible guard for future runners).
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
   * as `<registryRoot>/<ns>/<name>/`. Required for `registry` refs. */
  readonly registryRoot?: string;
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

const resolveRegistryDir = (
  ref: Extract<UsesRef, { kind: "registry" }>,
  registryRoot: string | undefined,
): string => {
  if (registryRoot === undefined) {
    throw new ActionResolutionError(
      `registry ref '${ref.raw}' requires options.registryRoot to be set`,
    );
  }
  return resolvePath(registryRoot, ref.namespace, ref.name);
};

/**
 * Resolve a `UsesRef` to its on-disk directory + loaded manifest.
 *
 * @throws {ActionResolutionError} when the resolved directory does not
 *   exist, or when the caller did not supply the field needed for the
 *   ref kind (`workflowFile` for local, `registryRoot` for registry).
 * @throws {ActionManifestError} when `aiaction.yaml` cannot be loaded
 *   or fails schema validation.
 * @throws {RuntimeUnsupportedError} when `manifest.runs.using` is not
 *   one of the runners supported by the current milestone.
 */
export async function resolveUsesRef(ref: UsesRef, ctx: ResolverContext): Promise<ResolvedAction> {
  const dir =
    ref.kind === RefKind.local
      ? resolveLocalDir(ref, ctx.workflowFile)
      : resolveRegistryDir(ref, ctx.registryRoot);

  if (!(await isDirectory(dir))) {
    throw new ActionResolutionError(`action directory not found for ref '${ref.raw}': ${dir}`);
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

  // TODO MS1.2: exercise the bun-module guard once the runner literal union widens
  if (manifest.runs.using !== "bun-module") {
    // `using` narrows to `never` here because the schema currently locks
    // it to "bun-module"; the guard remains for forward-compat (MS1.2+
    // will widen the literal union). Cast to `string` for the message.
    const using = manifest.runs.using as string;
    throw new RuntimeUnsupportedError(
      `runs.using '${using}' for ref '${ref.raw}' is not yet implemented (MS1.1 supports 'bun-module' only)`,
    );
  }

  return { manifest, dir };
}
