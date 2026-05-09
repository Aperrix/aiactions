/**
 * Build a bare git repo on disk populated with `actions/<ns>/<name>/`
 * files and tagged at the supplied ref. Returns the absolute path to
 * the bare repo (suitable for `file://` URLs in `git clone`).
 *
 * Used by the registry-fetch tests to exercise the real git plumbing
 * without touching the network or `github.com`.
 */

import { execFile } from "node:child_process";
import { mkdir, mkdtemp, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { promisify } from "node:util";

const pExecFile = promisify(execFile);

/** Caller input for `makeBareRepoWithAction`. */
export interface MakeBareRepoOptions {
  /** Existing parent directory that holds the new fixture; the helper
   * creates `<cwd>/work-<random>/` and `<cwd>/repo.git/` underneath. */
  readonly cwd: string;
  /** `<ns>` segment of the action coordinate. */
  readonly namespace: string;
  /** `<name>` segment of the action coordinate. */
  readonly name: string;
  /** Git tag to point at the populated commit. Used as `--branch` in tests. */
  readonly tag: string;
  /** Contents of `actions/<ns>/<name>/aiaction.yaml`. */
  readonly manifest: string;
  /** Additional files inside `actions/<ns>/<name>/`, keyed by relative path. */
  readonly sources: Readonly<Record<string, string>>;
  /** Extra tag names pointing at the same head, seeded after the primary tag. */
  readonly extraTags?: readonly string[];
}

const run = async (cwd: string, ...args: string[]): Promise<void> => {
  await pExecFile("git", args, { cwd });
};

/**
 * Create a populated bare repo and return its absolute path.
 *
 * Layout produced (under `options.cwd`):
 * - `work-<random>/` — working tree used to author the commit.
 * - `repo.git/`      — bare repo to be cloned via `file://`.
 *
 * The bare repo has `uploadpack.allowFilter=true` set so that
 * `git clone --filter=blob:none ...` works against it locally.
 */
export async function makeBareRepoWithAction(options: MakeBareRepoOptions): Promise<string> {
  const work = await mkdtemp(join(options.cwd, "work-"));
  const actionDir = join(work, "actions", options.namespace, options.name);
  await mkdir(actionDir, { recursive: true });
  await writeFile(join(actionDir, "aiaction.yaml"), options.manifest, "utf8");
  for (const [rel, content] of Object.entries(options.sources)) {
    const target = join(actionDir, rel);
    await mkdir(join(target, ".."), { recursive: true });
    await writeFile(target, content, "utf8");
  }

  await run(work, "init", "-b", "main");
  await run(work, "config", "user.email", "fixture@aiactions.local");
  await run(work, "config", "user.name", "AIactions Fixture");
  await run(work, "add", ".");
  await run(work, "commit", "-m", `add ${options.namespace}/${options.name}`);
  await run(work, "tag", options.tag);

  for (const extra of options.extraTags ?? []) {
    await run(work, "tag", extra);
  }

  const bareRepo = join(options.cwd, "repo.git");
  await pExecFile("git", ["clone", "--bare", work, bareRepo]);
  await pExecFile("git", ["-C", bareRepo, "config", "uploadpack.allowFilter", "true"]);

  return bareRepo;
}
