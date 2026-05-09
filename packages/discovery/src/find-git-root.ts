/**
 * Walk up from `startDir` until a directory containing a `.git` entry is
 * found. The entry may be a directory (regular checkout) or a file (git
 * worktree — the file is a `gitdir:` pointer to the parent's git dir).
 *
 * Throws `NotInGitRepoError` if the filesystem root is reached with no
 * match. Other I/O errors propagate (e.g. `EACCES` on a directory along
 * the way).
 */

import { stat } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";

import { NotInGitRepoError } from "./errors.ts";

export async function findGitRoot(startDir: string): Promise<string> {
  const resolvedStart = resolve(startDir);
  let dir = resolvedStart;
  for (;;) {
    try {
      await stat(join(dir, ".git"));
      return dir;
    } catch (err) {
      const e = err as NodeJS.ErrnoException;
      if (e.code !== "ENOENT") throw err;
    }
    const parent = dirname(dir);
    if (parent === dir) throw new NotInGitRepoError(resolvedStart);
    dir = parent;
  }
}
