/**
 * Filesystem cache walker for actions installed under
 * `<registryRoot>/<ns>/<name>/<version>/`. Used by `aia action list`
 * and `aia action uninstall` to enumerate cached entries without
 * round-tripping the registry index.
 *
 * Public surface:
 * - `CachedEntry` — `{ namespace, name, version, dir }` triple.
 * - `walkCache(root)` — fixed-depth-3 walk; missing root → `[]`.
 */

import { readdir, stat } from "node:fs/promises";
import { join } from "node:path";

export interface CachedEntry {
  readonly namespace: string;
  readonly name: string;
  readonly version: string;
  readonly dir: string;
}

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
