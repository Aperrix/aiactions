import { defineCommand } from "citty";
import { rcompare as semverRcompare } from "semver";

import type { Registry } from "@aiactions/workflows";
import { fetchRegistry, groupByCoord, resolveRegistryUrl } from "../../lib/registry.ts";
import { resolveRegistryRoot } from "../../lib/registry-root.ts";
import { walkCache, type CachedEntry } from "../../lib/walk-cache.ts";

interface ListRow {
  readonly coord: string;
  readonly latestRegistry: string | null;
  readonly installedVersions: string[];
  readonly description: string | null;
  readonly localOnly: boolean;
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

function renderHuman(rows: ListRow[]): string {
  const lines: string[] = [];
  for (const r of rows) {
    if (r.localOnly) continue;
    const head = `${r.coord}@${r.latestRegistry}`;
    const desc = r.description ? `  — ${r.description}` : "";
    let badge = "";
    if (r.installedVersions.length > 0) {
      const matchesLatest = r.installedVersions.includes(r.latestRegistry!);
      if (matchesLatest) {
        badge = "  [installed]";
      } else {
        badge = `  [installed, registry has @${r.latestRegistry}, cache has @${r.installedVersions[0]}]`;
      }
    }
    lines.push(`${head}${desc}${badge}`);
  }
  const localOnly = rows.filter((r) => r.localOnly);
  if (localOnly.length > 0) {
    lines.push("");
    lines.push("Local only:");
    for (const r of localOnly) {
      for (const v of r.installedVersions) {
        lines.push(`  ${r.coord}@${v}`);
      }
    }
  }
  return lines.join("\n");
}

export const listCommand = defineCommand({
  meta: {
    name: "list",
    description:
      "List actions from the registry, with installed/outdated badges from the local cache",
  },
  args: {
    json: {
      type: "boolean",
      description: "Emit machine-readable JSON instead of human output",
      default: false,
    },
  },
  async run({ args }) {
    const registryRoot = resolveRegistryRoot();
    const cached = await walkCache(registryRoot);

    let reg: Registry | null = null;
    let registryError: string | null = null;
    let registryUrl: string | null = null;
    try {
      registryUrl = resolveRegistryUrl(process.env);
      reg = await fetchRegistry(registryUrl);
    } catch (err) {
      registryError = (err as Error).message;
    }

    const rows = buildRows(reg, cached);

    if (args.json) {
      const out = {
        registry: reg ? { url: registryUrl, fetchedAt: new Date().toISOString() } : null,
        registryError,
        entries: rows,
      };
      process.stdout.write(`${JSON.stringify(out)}\n`);
      return;
    }

    if (registryError) {
      process.stderr.write(`registry unreachable: ${registryError}; showing local cache only\n`);
    }

    if (rows.length === 0) {
      process.stderr.write("no actions to list\n");
      return;
    }
    process.stdout.write(`${renderHuman(rows)}\n`);
  },
});
