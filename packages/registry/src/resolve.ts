/**
 * Registry resolve primitives — classify a version literal and resolve a
 * major-range to the highest stable concrete semver published as a tag in
 * the canonical repo via `git ls-remote`.
 *
 * Public surface:
 * - `RegistryCoordinate` — coordinate fragment shared by all entry points.
 * - `VersionClass` — classification of a parsed version literal.
 * - `classifyVersion` — route a version literal to a resolution strategy.
 * - `resolveMajorRange` — pick the highest stable patch under a major.
 */

import { lsRemoteTags } from "@aiactions/git";
import { rcompare as semverRcompare } from "semver";

import { RegistryResolveError } from "./errors.ts";

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
 * @throws {RegistryResolveError} when `git ls-remote` fails, or no
 *   tag in the canonical repo matches the requested major.
 */
export async function resolveMajorRange(
  ref: RegistryCoordinate,
  canonicalUrl: string,
): Promise<{ resolvedVersion: string; resolvedSha: string }> {
  const major = parseInt(ref.version, 10);
  let stdout: string;
  try {
    stdout = await lsRemoteTags(canonicalUrl);
  } catch (err) {
    const stderr = (err as { stderr?: string }).stderr ?? String(err);
    throw new RegistryResolveError(
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
    throw new RegistryResolveError(
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
