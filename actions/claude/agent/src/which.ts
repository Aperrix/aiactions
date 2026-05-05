/**
 * Tiny `which`-equivalent — scans `env.PATH` directories for an
 * executable. POSIX-first; Windows fallback walks PATHEXT.
 *
 * Avoids a dependency on `node-which` or similar. The implementation
 * is sync (called once at boot) and uses only `node:fs` and `node:path`.
 *
 * Contents:
 * - `whichSync(name, env)` — returns the absolute path or `null`.
 */

import { accessSync, constants as FS } from "node:fs";
import { delimiter, isAbsolute, join } from "node:path";

/**
 * Scan `env.PATH` for `name` and return the absolute path, or `null`
 * if not found. Handles absolute paths directly and Windows PATHEXT.
 */
export function whichSync(name: string, env: NodeJS.ProcessEnv): string | null {
  if (isAbsolute(name)) {
    return isExecutable(name) ? name : null;
  }

  const path = env.PATH ?? "";
  if (path.length === 0) return null;

  const isWindows = process.platform === "win32";
  const pathExt = isWindows ? (env.PATHEXT ?? ".COM;.EXE;.BAT;.CMD").split(";") : [""];

  for (const dir of path.split(delimiter)) {
    if (dir.length === 0) continue;
    for (const ext of pathExt) {
      const candidate = join(dir, `${name}${ext}`);
      if (isExecutable(candidate)) return candidate;
    }
  }
  return null;
}

function isExecutable(file: string): boolean {
  try {
    accessSync(file, FS.X_OK);
    return true;
  } catch {
    return false;
  }
}
