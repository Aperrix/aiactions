/**
 * Tests for `findGitRoot`. Asserts walk-up semantics, worktree (`.git` as
 * file) support, and the `NotInGitRepoError` failure mode.
 */

import { afterEach, describe, expect, test } from "vite-plus/test";
import { rm } from "node:fs/promises";

import { NotInGitRepoError } from "../../src/discovery/errors.ts";
import { findGitRoot } from "../../src/discovery/find-git-root.ts";
import { makeFakeRepo } from "./fixtures.ts";

const tmpDirsToClean: string[] = [];

afterEach(async () => {
  while (tmpDirsToClean.length > 0) {
    const dir = tmpDirsToClean.pop();
    if (dir !== undefined) {
      await rm(dir, { recursive: true, force: true });
    }
  }
});

describe("findGitRoot", () => {
  test("returns the repo root when .git is a directory at that root", async () => {
    const repo = await makeFakeRepo();
    tmpDirsToClean.push(repo.root);

    const result = await findGitRoot(repo.root);

    expect(result).toBe(repo.root);
  });

  test("returns the repo root when .git is a *file* (worktree case)", async () => {
    const repo = await makeFakeRepo({ gitAsFile: true });
    tmpDirsToClean.push(repo.root);

    const result = await findGitRoot(repo.root);

    expect(result).toBe(repo.root);
  });

  test("walks up from a sub-directory to find the repo root", async () => {
    const repo = await makeFakeRepo({ nestedCwd: ["a", "b", "c"] });
    tmpDirsToClean.push(repo.root);

    const result = await findGitRoot(repo.cwd);

    expect(result).toBe(repo.root);
  });

  test("throws NotInGitRepoError when no .git is found up to the filesystem root", async () => {
    const repo = await makeFakeRepo({ withGit: false });
    tmpDirsToClean.push(repo.root);

    await expect(findGitRoot(repo.root)).rejects.toBeInstanceOf(NotInGitRepoError);
  });

  test("NotInGitRepoError carries the startDir and a stable code", async () => {
    const repo = await makeFakeRepo({ withGit: false });
    tmpDirsToClean.push(repo.root);

    try {
      await findGitRoot(repo.root);
      throw new Error("expected findGitRoot to throw");
    } catch (err) {
      expect(err).toBeInstanceOf(NotInGitRepoError);
      const typed = err as NotInGitRepoError;
      expect(typed.code).toBe("ENOTINGITREPO");
      expect(typed.startDir).toBe(repo.root);
    }
  });

  test("NotInGitRepoError.startDir is resolved to an absolute path even when caller passes a relative path", async () => {
    const repo = await makeFakeRepo({ withGit: false });
    tmpDirsToClean.push(repo.root);

    const originalCwd = process.cwd();
    process.chdir(repo.root);
    try {
      await findGitRoot(".");
      throw new Error("expected findGitRoot to throw");
    } catch (err) {
      if (err instanceof NotInGitRepoError) {
        expect(err.startDir).toBe(repo.root);
      } else {
        throw err;
      }
    } finally {
      process.chdir(originalCwd);
    }
  });
});
