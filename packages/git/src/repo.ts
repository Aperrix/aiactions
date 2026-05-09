/**
 * Higher-level helpers wrapping common git operations. Each delegates
 * to `gitExec` and surfaces typed `GitError` on failure.
 *
 * The set is deliberately minimal — it covers exactly what the runtime
 * already does today (`registry-fetch.ts`). New helpers should be added
 * only when a real consumer arrives (YAGNI).
 */

import { gitExec } from "./exec.ts";

export interface CloneSparseShallowOptions {
  /** Remote URL (`file://...` for tests, `https://...` for prod). */
  readonly url: string;
  /** Tag or branch to check out. Passed to `git clone --branch`. */
  readonly branch: string;
  /** Local destination directory (must not already exist). */
  readonly dest: string;
  /** Optional `--filter` value (e.g. `"blob:none"`). */
  readonly filter?: string;
}

/**
 * `git clone --filter=<filter> --sparse --depth 1 --branch <branch> <url> <dest>`.
 * Throws `GitError` on failure.
 */
export async function cloneSparseShallow(options: CloneSparseShallowOptions): Promise<void> {
  const args: string[] = ["clone"];
  if (options.filter !== undefined) {
    args.push(`--filter=${options.filter}`);
  }
  args.push("--sparse", "--depth", "1", "--branch", options.branch, options.url, options.dest);
  await gitExec(args);
}

/**
 * `git -C <repoDir> sparse-checkout set <paths...>`. Throws `GitError`
 * on failure.
 */
export async function sparseCheckoutSet(repoDir: string, paths: readonly string[]): Promise<void> {
  await gitExec(["-C", repoDir, "sparse-checkout", "set", ...paths]);
}

/**
 * `git ls-remote --tags <url>`. Returns the raw tab-separated stdout —
 * caller parses tag refs from it. Throws `GitError` on failure.
 */
export async function lsRemoteTags(url: string): Promise<string> {
  const { stdout } = await gitExec(["ls-remote", "--tags", url]);
  return stdout;
}

/**
 * `git -C <repoDir> rev-parse HEAD`. Returns the resolved SHA, trimmed.
 * Throws `GitError` on failure.
 */
export async function revParseHead(repoDir: string): Promise<string> {
  const { stdout } = await gitExec(["-C", repoDir, "rev-parse", "HEAD"]);
  return stdout.trim();
}
