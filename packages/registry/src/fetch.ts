/**
 * Registry fetch primitives — fetch an action from the canonical
 * AIactions monorepo via `git sparse-checkout`, cache it under
 * `~/.aiactions/actions/<ns>/<name>/<ver>/`, and record the resolved
 * SHA in `<cwd>/.aiactions/lock.json`.
 *
 * Public surface:
 * - `fetchActionFromCanonical` — the git plumbing (clone + sparse-checkout).
 * - `ensureCachedAction` — existence-first cache + delegating fetch.
 */

import { mkdir, mkdtemp, rename, rm, stat } from "node:fs/promises";
import { join } from "node:path";

import { cloneSparseShallow, revParseHead, sparseCheckoutSet } from "@aiactions/git";

import { RegistryFetchError } from "./errors.ts";
import { readLockfile, upsertLockfileEntry } from "./lockfile.ts";
import { type RegistryCoordinate, classifyVersion, resolveMajorRange } from "./resolve.ts";

/** Optional knobs for `fetchActionFromCanonical`. */
export interface FetchActionFromCanonicalOptions {
  /** Override the canonical URL (tests inject `file://...`). Defaults
   * to `https://github.com/aperrix/aiactions`. */
  readonly canonicalUrl?: string;
  /** Parent directory used for the throwaway clone. Defaults to
   * `<registryRoot>/.tmp/`, which guarantees the clone shares a
   * filesystem with the destination so the final `rename` stays
   * atomic and EXDEV-free. */
  readonly tmpRoot?: string;
}

const DEFAULT_CANONICAL_URL = "https://github.com/aperrix/aiactions";

/**
 * Clone a slice of the canonical monorepo, materialise the action under
 * `<registryRoot>/<ns>/<name>/<ver>/`, and return the resolved SHA.
 *
 * Behaviour:
 * - `git clone --filter=blob:none --sparse --depth 1 --branch <ver>` into a
 *   per-call tmp directory.
 * - `git sparse-checkout set actions/<ns>/<name>` to materialise only the
 *   target slice.
 * - Read SHA via `git rev-parse HEAD`.
 * - Atomically rename `<tmp>/actions/<ns>/<name>` → `<registryRoot>/<ns>/<name>/<ver>`.
 * - Best-effort `rm -rf <tmp>` on success and on failure.
 *
 * @throws {RegistryFetchError} when git fails (unknown ref, network
 *   unreachable, action path missing in the cloned slice).
 */
export async function fetchActionFromCanonical(
  ref: RegistryCoordinate,
  registryRoot: string,
  options: FetchActionFromCanonicalOptions = {},
): Promise<string> {
  const canonicalUrl = options.canonicalUrl ?? DEFAULT_CANONICAL_URL;
  const tmpRoot = options.tmpRoot ?? join(registryRoot, ".tmp");
  await mkdir(tmpRoot, { recursive: true });
  const tmp = await mkdtemp(join(tmpRoot, "aiactions-fetch-"));
  const repoDir = join(tmp, "_repo");
  const tag = `${ref.namespace}/${ref.name}@v${ref.version}`;

  try {
    try {
      await cloneSparseShallow({
        url: canonicalUrl,
        branch: tag,
        dest: repoDir,
        filter: "blob:none",
      });
    } catch (err) {
      const stderr = (err as { stderr?: string }).stderr ?? String(err);
      throw new RegistryFetchError(
        `git clone failed for '${ref.namespace}/${ref.name}@${ref.version}' from '${canonicalUrl}': ${stderr.trim()}`,
        { cause: err as Error },
      );
    }

    try {
      await sparseCheckoutSet(repoDir, [`actions/${ref.namespace}/${ref.name}`]);
    } catch (err) {
      const stderr = (err as { stderr?: string }).stderr ?? String(err);
      throw new RegistryFetchError(
        `git sparse-checkout failed for '${ref.namespace}/${ref.name}@${ref.version}': ${stderr.trim()}`,
        { cause: err as Error },
      );
    }

    const sourceActionDir = join(repoDir, "actions", ref.namespace, ref.name);
    try {
      const s = await stat(sourceActionDir);
      if (!s.isDirectory()) {
        throw new RegistryFetchError(
          `action path 'actions/${ref.namespace}/${ref.name}' is not a directory at ref '${ref.version}'`,
        );
      }
    } catch (err) {
      const errno = (err as NodeJS.ErrnoException).code;
      if (errno === "ENOENT") {
        throw new RegistryFetchError(
          `action path 'actions/${ref.namespace}/${ref.name}' not found at ref '${ref.version}' under '${canonicalUrl}'`,
        );
      }
      throw err;
    }

    let resolvedSha: string;
    try {
      resolvedSha = await revParseHead(repoDir);
    } catch (err) {
      const stderr = (err as { stderr?: string }).stderr ?? String(err);
      throw new RegistryFetchError(
        `git rev-parse HEAD failed after cloning '${ref.namespace}/${ref.name}@${ref.version}': ${stderr.trim()}`,
        { cause: err as Error },
      );
    }

    const targetParent = join(registryRoot, ref.namespace, ref.name);
    await mkdir(targetParent, { recursive: true });
    const targetDir = join(targetParent, ref.version);
    await rename(sourceActionDir, targetDir);

    return resolvedSha;
  } finally {
    await rm(tmp, { recursive: true, force: true });
  }
}

/** Result of `ensureCachedAction`. */
export interface EnsureCachedActionResult {
  /** Absolute path to `<registryRoot>/<ns>/<name>/<ver>/`. */
  readonly dir: string;
  /** Whether a fetch was performed (true) or the cache was already populated (false). */
  readonly fetched: boolean;
  /** Resolved git SHA when fetched; `null` on cache-hit without a lockfile pin. */
  readonly resolvedSha: string | null;
  /** The concrete semver that was used for the cache directory. For exact/branch
   * refs this equals `ref.version`; for major-range refs this is the picked patch. */
  readonly resolvedVersion: string;
}

/** Optional knobs forwarded to `fetchActionFromCanonical` (test injection). */
export interface EnsureCachedActionOptions extends FetchActionFromCanonicalOptions {
  /**
   * @deprecated Unused since MS1.8 — lockfile no longer records timestamps.
   * Field kept for one minor release for backward source compatibility.
   */
  readonly now?: () => Date;
}

/**
 * Existence-first cache lookup with major-range resolution.
 *
 * Resolution order:
 * 1. Lockfile pin present → use the pinned `resolvedVersion` for the cache
 *    directory; re-fetch on cache miss without hitting ls-remote again.
 * 2. No pin + version is major-only (e.g. `"1"`) → `resolveMajorRange` via
 *    `git ls-remote`, fetch the chosen concrete tag, write the lockfile pin.
 * 3. No pin + exact semver or branch → existing direct-fetch path; lockfile
 *    records the literal version as both `resolvedVersion` and key.
 *
 * @throws {RegistryFetchError} when any fetch step fails.
 * @throws {RegistryResolveError} when ls-remote fails or no matching major.
 */
export async function ensureCachedAction(
  ref: RegistryCoordinate,
  registryRoot: string,
  cwd: string,
  options: EnsureCachedActionOptions = {},
): Promise<EnsureCachedActionResult> {
  const canonicalUrl = options.canonicalUrl ?? DEFAULT_CANONICAL_URL;
  const lockKey = `${ref.namespace}/${ref.name}@${ref.version}`;
  const lock = await readLockfile(cwd);
  const lockEntry = lock.actions[lockKey];

  // Branch 1 — lockfile pin already exists. Use the pinned concrete
  // version for the cache directory; on miss, re-fetch with the pinned
  // version literal as the tag.
  if (lockEntry) {
    const pinnedDir = join(registryRoot, ref.namespace, ref.name, lockEntry.resolvedVersion);
    try {
      const s = await stat(pinnedDir);
      if (s.isDirectory()) {
        return {
          dir: pinnedDir,
          fetched: false,
          resolvedSha: lockEntry.resolvedSha,
          resolvedVersion: lockEntry.resolvedVersion,
        };
      }
    } catch (err) {
      const errno = (err as NodeJS.ErrnoException).code;
      if (errno !== "ENOENT") throw err;
    }
    await fetchActionFromCanonical(
      { ...ref, version: lockEntry.resolvedVersion },
      registryRoot,
      options,
    );
    return {
      dir: pinnedDir,
      fetched: true,
      resolvedSha: lockEntry.resolvedSha,
      resolvedVersion: lockEntry.resolvedVersion,
    };
  }

  // Branch 2 — no lockfile pin. Classify the version literal and route.
  const klass = classifyVersion(ref.version);
  if (klass === "major") {
    const resolved = await resolveMajorRange(ref, canonicalUrl);
    const cacheDir = join(registryRoot, ref.namespace, ref.name, resolved.resolvedVersion);
    try {
      const s = await stat(cacheDir);
      if (s.isDirectory()) {
        await upsertLockfileEntry({
          cwd,
          ref,
          resolvedVersion: resolved.resolvedVersion,
          resolvedSha: resolved.resolvedSha,
        });
        return {
          dir: cacheDir,
          fetched: false,
          resolvedSha: resolved.resolvedSha,
          resolvedVersion: resolved.resolvedVersion,
        };
      }
    } catch (err) {
      const errno = (err as NodeJS.ErrnoException).code;
      if (errno !== "ENOENT") throw err;
    }
    const fetchedSha = await fetchActionFromCanonical(
      { ...ref, version: resolved.resolvedVersion },
      registryRoot,
      options,
    );
    await upsertLockfileEntry({
      cwd,
      ref,
      resolvedVersion: resolved.resolvedVersion,
      resolvedSha: fetchedSha,
    });
    return {
      dir: cacheDir,
      fetched: true,
      resolvedSha: fetchedSha,
      resolvedVersion: resolved.resolvedVersion,
    };
  }

  // Exact + branch — pass through to the existing fetch path; resolved
  // version is just the literal the caller supplied.
  const targetDir = join(registryRoot, ref.namespace, ref.name, ref.version);
  try {
    const s = await stat(targetDir);
    if (s.isDirectory()) {
      return {
        dir: targetDir,
        fetched: false,
        resolvedSha: null,
        resolvedVersion: ref.version,
      };
    }
  } catch (err) {
    const errno = (err as NodeJS.ErrnoException).code;
    if (errno !== "ENOENT") throw err;
  }
  const resolvedSha = await fetchActionFromCanonical(ref, registryRoot, options);
  await upsertLockfileEntry({
    cwd,
    ref,
    resolvedVersion: ref.version,
    resolvedSha,
  });
  return {
    dir: targetDir,
    fetched: true,
    resolvedSha,
    resolvedVersion: ref.version,
  };
}
