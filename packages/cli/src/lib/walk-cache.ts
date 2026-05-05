import { readdir, stat } from "node:fs/promises";
import { join } from "node:path";

export interface CachedEntry {
  readonly namespace: string;
  readonly name: string;
  readonly version: string;
  readonly dir: string;
}

/**
 * Walk `<root>/<ns>/<name>/<ver>` at fixed depth 3. Returns every
 * directory triple that exists. Missing root → `[]`. Files at any
 * level are ignored (only directories count as namespace/name/version
 * segments).
 */
export async function walkCache(root: string): Promise<CachedEntry[]> {
  let nsEntries: string[];
  try {
    nsEntries = await readdir(root);
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === "ENOENT") return [];
    throw err;
  }

  const entries: CachedEntry[] = [];
  for (const namespace of nsEntries) {
    const nsDir = join(root, namespace);
    if (!(await isDirectory(nsDir))) continue;

    const nameEntries = await readdir(nsDir);
    for (const name of nameEntries) {
      const nameDir = join(nsDir, name);
      if (!(await isDirectory(nameDir))) continue;

      const versionEntries = await readdir(nameDir);
      for (const version of versionEntries) {
        const dir = join(nameDir, version);
        if (!(await isDirectory(dir))) continue;
        entries.push({ namespace, name, version, dir });
      }
    }
  }
  return entries;
}

async function isDirectory(path: string): Promise<boolean> {
  try {
    return (await stat(path)).isDirectory();
  } catch {
    return false;
  }
}
