/**
 * Registry-fetch primitives — fetch an action from the canonical
 * AIactions monorepo via `git sparse-checkout`, cache it under
 * `~/.aiactions/actions/<ns>/<name>/<ver>/`, and record the resolved
 * SHA in `<cwd>/.aiactions/lock.yaml`.
 *
 * Public surface (built incrementally over MS1.2 plan tasks):
 * - `appendLockfileEntry` — write-only lockfile upsert (Task 2).
 * - `fetchActionFromCanonical` — the git plumbing (Task 3).
 * - `ensureCachedAction` — existence-first cache + delegating fetch (Task 4).
 */

import { execFile } from "node:child_process";
import { mkdir, mkdtemp, readFile, rename, rm, stat, writeFile } from "node:fs/promises";
import { tmpdir as osTmpdir } from "node:os";
import { dirname, join } from "node:path";
import { promisify } from "node:util";

import { parse as parseYaml, stringify as stringifyYaml } from "yaml";

import { ActionResolutionError } from "../../types/errors.ts";

const pExecFile = promisify(execFile);

/** Coordinate fragment shared by all entry points. */
export interface RegistryCoordinate {
  readonly namespace: string;
  readonly name: string;
  readonly version: string;
}

const lockfileRelativePath = (cwd: string): string => join(cwd, ".aiactions", "lock.yaml");

interface LockfileShape {
  actions?: Record<string, { "resolved-sha": string; "fetched-at": string }>;
}

/** Caller input for `appendLockfileEntry`. */
export interface AppendLockfileEntryRequest {
  /** Workflow working directory; lockfile lives at `<cwd>/.aiactions/lock.yaml`. */
  readonly cwd: string;
  /** Action coordinate. */
  readonly ref: RegistryCoordinate;
  /** Resolved git SHA (40 lowercase hex chars). */
  readonly resolvedSha: string;
  /** Timestamp recorded under `fetched-at`. */
  readonly fetchedAt: Date;
}

/**
 * Upsert an entry into `<cwd>/.aiactions/lock.yaml`. Creates the file
 * (and the parent `.aiactions/` directory) when missing. Existing
 * unrelated entries are preserved; an entry for the same ref is
 * overwritten.
 *
 * The serialised entry quotes the SHA and timestamp string-style to keep
 * YAML 1.2's number-coercion rules from biting later.
 */
export async function appendLockfileEntry(request: AppendLockfileEntryRequest): Promise<void> {
  const path = lockfileRelativePath(request.cwd);
  const dir = dirname(path);
  await mkdir(dir, { recursive: true });

  let parsed: LockfileShape = {};
  try {
    const raw = await readFile(path, "utf8");
    parsed = (parseYaml(raw) as LockfileShape | null) ?? {};
  } catch (err) {
    const errno = (err as NodeJS.ErrnoException).code;
    if (errno !== "ENOENT") throw err;
  }

  const key = `${request.ref.namespace}/${request.ref.name}@${request.ref.version}`;
  const actions = parsed.actions ?? {};
  actions[key] = {
    "resolved-sha": request.resolvedSha,
    "fetched-at": request.fetchedAt.toISOString(),
  };

  const sortedActions: Record<string, { "resolved-sha": string; "fetched-at": string }> = {};
  for (const k of Object.keys(actions).sort()) {
    sortedActions[k] = actions[k]!;
  }

  const next: LockfileShape = { actions: sortedActions };
  const yamlOut = stringifyYaml(next, {
    defaultStringType: "QUOTE_SINGLE",
    defaultKeyType: "PLAIN",
  });
  await writeFile(path, yamlOut, "utf8");
}

/** Optional knobs for `fetchActionFromCanonical`. */
export interface FetchActionFromCanonicalOptions {
  /** Override the canonical URL (tests inject `file://...`). Defaults
   * to `https://github.com/aperrix/aiactions`. */
  readonly canonicalUrl?: string;
  /** Parent directory used for the throwaway clone. Defaults to
   * `os.tmpdir()`. */
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
  const tmpRoot = options.tmpRoot ?? osTmpdir();
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
  /** Resolved git SHA when `fetched` is true; `null` otherwise. */
  readonly resolvedSha: string | null;
}

/** Optional knobs forwarded to `fetchActionFromCanonical` (test injection). */
export interface EnsureCachedActionOptions extends FetchActionFromCanonicalOptions {
  /** Clock injected for the lockfile timestamp. Defaults to `() => new Date()`. */
  readonly now?: () => Date;
}

/**
 * Existence-first cache lookup. If `<registryRoot>/<ns>/<name>/<ver>/`
 * exists, returns it as-is (no fetch, no lockfile write — the entry was
 * either user-placed or fetched on a prior run).
 *
 * On cache miss, delegates to `fetchActionFromCanonical`, then writes a
 * lockfile entry recording the resolved SHA and the wall-clock timestamp.
 *
 * @throws {ActionResolutionError} when the fetch path fails. The cache
 *   path is left untouched (atomic rename guarantee).
 */
export async function ensureCachedAction(
  ref: RegistryCoordinate,
  registryRoot: string,
  cwd: string,
  options: EnsureCachedActionOptions = {},
): Promise<EnsureCachedActionResult> {
  const targetDir = join(registryRoot, ref.namespace, ref.name, ref.version);

  try {
    const s = await stat(targetDir);
    if (s.isDirectory()) {
      return { dir: targetDir, fetched: false, resolvedSha: null };
    }
  } catch (err) {
    const errno = (err as NodeJS.ErrnoException).code;
    if (errno !== "ENOENT") throw err;
  }

  const resolvedSha = await fetchActionFromCanonical(ref, registryRoot, options);
  const fetchedAt = options.now ? options.now() : new Date();
  await appendLockfileEntry({ cwd, ref, resolvedSha, fetchedAt });

  return { dir: targetDir, fetched: true, resolvedSha };
}
