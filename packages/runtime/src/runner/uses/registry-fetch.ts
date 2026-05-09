/**
 * Registry-fetch primitives — fetch an action from the canonical
 * AIactions monorepo via `git sparse-checkout`, cache it under
 * `~/.aiactions/actions/<ns>/<name>/<ver>/`, and record the resolved
 * SHA in `<cwd>/.aiactions/lock.json`.
 *
 * Public surface (built incrementally over MS1.2 plan tasks):
 * - `fetchActionFromCanonical` — the git plumbing (Task 3).
 * - `ensureCachedAction` — existence-first cache + delegating fetch (Task 4).
 */

import { execFile } from "node:child_process";
import { mkdir, mkdtemp, rename, rm, stat } from "node:fs/promises";
import { join } from "node:path";
import { promisify } from "node:util";

import { rcompare as semverRcompare } from "semver";

import { ActionResolutionError } from "../../types/errors.ts";
import { readLockfile, upsertLockfileEntry } from "../../lockfile.ts";

const pExecFile = promisify(execFile);

const EXACT_SEMVER_RE = /^\d+\.\d+\.\d+(?:-[\w.-]+)?$/u;
const MAJOR_ONLY_RE = /^\d+$/u;

/** Classification of a parsed version literal for resolution routing. */
export type VersionClass = "exact" | "major" | "branch";

/**
 * Classify a (post-parser-strip) version literal so the resolver knows
 * whether to fetch directly (`exact` or `branch`) or to first list the
 * canonical repo's tags and pick the highest matching major (`major`).
 */
export function classifyVersion(version: string): VersionClass {
  if (EXACT_SEMVER_RE.test(version)) return "exact";
  if (MAJOR_ONLY_RE.test(version)) return "major";
  return "branch";
}

/**
 * Resolve a major-prefix `ref.version` (e.g. `"1"`) to the highest
 * stable concrete semver published as a tag in the canonical repo.
 *
 * Pre-releases (`<X>.<Y>.<Z>-<suffix>`) are excluded from major-range
 * matching by design — users wanting one must pin the exact ref.
 *
 * @throws {ActionResolutionError} when `git ls-remote` fails, or no
 *   tag in the canonical repo matches the requested major.
 */
export async function resolveMajorRange(
  ref: RegistryCoordinate,
  canonicalUrl: string,
): Promise<{ resolvedVersion: string; resolvedSha: string }> {
  const major = parseInt(ref.version, 10);
  let stdout: string;
  try {
    ({ stdout } = await pExecFile("git", ["ls-remote", "--tags", canonicalUrl]));
  } catch (err) {
    const stderr = (err as { stderr?: string }).stderr ?? String(err);
    throw new ActionResolutionError(
      `failed to list tags for '${ref.namespace}/${ref.name}' at ${canonicalUrl}: ${stderr.trim()}`,
      { cause: err as Error },
    );
  }

  const TAG_PREFIX = `refs/tags/${ref.namespace}/${ref.name}@v`;
  const STABLE_SEMVER_RE = /^(\d+)\.(\d+)\.(\d+)$/u; // strict 3-segment, no pre-release

  const candidates: { version: string; sha: string }[] = [];
  for (const line of stdout.trim().split("\n")) {
    if (line.length === 0) continue;
    const [sha, fullRef] = line.split("\t");
    if (!sha || !fullRef) continue;
    if (!fullRef.startsWith(TAG_PREFIX)) continue;
    const versionPart = fullRef.slice(TAG_PREFIX.length).replace(/\^\{\}$/u, "");
    const m = STABLE_SEMVER_RE.exec(versionPart);
    if (!m) continue;
    if (parseInt(m[1]!, 10) !== major) continue;
    candidates.push({ version: versionPart, sha: sha.trim() });
  }

  if (candidates.length === 0) {
    throw new ActionResolutionError(
      `no published version of '${ref.namespace}/${ref.name}' matches major '^${major}.0.0' at ${canonicalUrl}`,
    );
  }

  candidates.sort((a, b) => semverRcompare(a.version, b.version));
  return { resolvedVersion: candidates[0]!.version, resolvedSha: candidates[0]!.sha };
}

/** Coordinate fragment shared by all entry points. */
export interface RegistryCoordinate {
  readonly namespace: string;
  readonly name: string;
  readonly version: string;
}

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
 * @throws {ActionResolutionError} when git fails (unknown ref, network
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
      await pExecFile("git", [
        "clone",
        "--filter=blob:none",
        "--sparse",
        "--depth",
        "1",
        "--branch",
        tag,
        canonicalUrl,
        repoDir,
      ]);
    } catch (err) {
      const stderr = (err as { stderr?: string }).stderr ?? String(err);
      throw new ActionResolutionError(
        `git clone failed for '${ref.namespace}/${ref.name}@${ref.version}' from '${canonicalUrl}': ${stderr.trim()}`,
        { cause: err as Error },
      );
    }

    try {
      await pExecFile("git", [
        "-C",
        repoDir,
        "sparse-checkout",
        "set",
        `actions/${ref.namespace}/${ref.name}`,
      ]);
    } catch (err) {
      const stderr = (err as { stderr?: string }).stderr ?? String(err);
      throw new ActionResolutionError(
        `git sparse-checkout failed for '${ref.namespace}/${ref.name}@${ref.version}': ${stderr.trim()}`,
        { cause: err as Error },
      );
    }

    const sourceActionDir = join(repoDir, "actions", ref.namespace, ref.name);
    try {
      const s = await stat(sourceActionDir);
      if (!s.isDirectory()) {
        throw new ActionResolutionError(
          `action path 'actions/${ref.namespace}/${ref.name}' is not a directory at ref '${ref.version}'`,
        );
      }
    } catch (err) {
      const errno = (err as NodeJS.ErrnoException).code;
      if (errno === "ENOENT") {
        throw new ActionResolutionError(
          `action path 'actions/${ref.namespace}/${ref.name}' not found at ref '${ref.version}' under '${canonicalUrl}'`,
        );
      }
      throw err;
    }

    let revParse: { stdout: string };
    try {
      revParse = await pExecFile("git", ["-C", repoDir, "rev-parse", "HEAD"]);
    } catch (err) {
      const stderr = (err as { stderr?: string }).stderr ?? String(err);
      throw new ActionResolutionError(
        `git rev-parse HEAD failed after cloning '${ref.namespace}/${ref.name}@${ref.version}': ${stderr.trim()}`,
        { cause: err as Error },
      );
    }
    const resolvedSha = revParse.stdout.trim();

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
 * @throws {ActionResolutionError} when any fetch or ls-remote step fails.
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
