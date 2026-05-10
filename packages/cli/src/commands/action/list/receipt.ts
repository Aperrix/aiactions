import type { ListActionResult, ListRow } from "./list-actions.ts";

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

export function writeListReceipt(json: boolean, result: ListActionResult): void {
  if (json) {
    const out = {
      registry:
        result.fetchedAt !== null && result.registryUrl !== null
          ? { url: result.registryUrl, fetchedAt: result.fetchedAt }
          : null,
      registryError: result.registryError,
      entries: result.rows,
    };
    process.stdout.write(`${JSON.stringify(out)}\n`);
    return;
  }

  if (result.registryError) {
    process.stderr.write(
      `registry unreachable: ${result.registryError}; showing local cache only\n`,
    );
  }
  if (result.rows.length === 0) {
    process.stderr.write("no actions to list\n");
    return;
  }
  process.stdout.write(`${renderHuman(result.rows)}\n`);
}
