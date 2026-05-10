import { resolveRegistryRoot } from "@aiactions/paths";
import {
  type CachedEntry,
  fetchRegistry,
  groupByCoord,
  resolveRegistryUrl,
  walkCache,
} from "@aiactions/registry";
import type { Registry } from "@aiactions/schema";
import { rcompare as semverRcompare } from "semver";

export interface ListRow {
  readonly coord: string;
  readonly latestRegistry: string | null;
  readonly installedVersions: string[];
  readonly description: string | null;
  readonly localOnly: boolean;
}

export interface ListActionResult {
  readonly registryUrl: string | null;
  readonly registryError: string | null;
  readonly fetchedAt: string | null;
  readonly rows: ListRow[];
}

function refVersion(ref: string): string {
  return ref.slice(ref.lastIndexOf("@") + 1);
}

function buildRows(reg: Registry | null, cached: CachedEntry[]): ListRow[] {
  const cachedByCoord = new Map<string, string[]>();
  for (const c of cached) {
    const key = `${c.namespace}/${c.name}`;
    const versions = cachedByCoord.get(key) ?? [];
    versions.push(c.version);
    cachedByCoord.set(key, versions);
  }
  for (const v of cachedByCoord.values()) v.sort(semverRcompare);

  const rows: ListRow[] = [];
  const seen = new Set<string>();

  if (reg) {
    const grouped = groupByCoord(reg);
    for (const [coord, entries] of grouped.entries()) {
      const latest = entries[0]!;
      const installed = cachedByCoord.get(coord) ?? [];
      rows.push({
        coord,
        latestRegistry: refVersion(latest.ref),
        installedVersions: installed,
        description: latest.description,
        localOnly: false,
      });
      seen.add(coord);
    }
  }
  for (const [coord, versions] of cachedByCoord.entries()) {
    if (seen.has(coord)) continue;
    rows.push({
      coord,
      latestRegistry: null,
      installedVersions: versions,
      description: null,
      localOnly: true,
    });
  }
  rows.sort((a, b) => a.coord.localeCompare(b.coord));
  return rows;
}

export async function runListAction(): Promise<ListActionResult> {
  const registryRoot = resolveRegistryRoot();
  const cached = await walkCache(registryRoot);

  let reg: Registry | null = null;
  let registryError: string | null = null;
  let registryUrl: string | null = null;
  let fetchedAt: string | null = null;
  try {
    registryUrl = resolveRegistryUrl(process.env);
    reg = await fetchRegistry(registryUrl);
    fetchedAt = new Date().toISOString();
  } catch (err) {
    registryError = (err as Error).message;
  }

  const rows = buildRows(reg, cached);
  return { registryUrl, registryError, fetchedAt, rows };
}
