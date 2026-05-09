import { describe, expect, test } from "vite-plus/test";

import { GitError } from "../src/errors.ts";
import { gitExec } from "../src/exec.ts";

describe("gitExec", () => {
  test("returns stdout and stderr on success", async () => {
    const result = await gitExec(["--version"]);

    expect(result.stdout.startsWith("git version ")).toBe(true);
    expect(result.stderr).toBe("");
  });

  test("respects cwd option", async () => {
    const result = await gitExec(["rev-parse", "--is-inside-work-tree"], { cwd: process.cwd() });

    expect(result.stdout.trim()).toBe("true");
  });

  test("throws GitError when git exits non-zero", async () => {
    await expect(gitExec(["this-is-not-a-real-subcommand"])).rejects.toBeInstanceOf(GitError);
  });

  test("GitError captures args, stderr, exit code, and cause", async () => {
    let captured: GitError | undefined;
    try {
      await gitExec(["this-is-not-a-real-subcommand"]);
    } catch (err) {
      captured = err as GitError;
    }

    expect(captured).toBeInstanceOf(GitError);
    expect(captured?.args).toEqual(["this-is-not-a-real-subcommand"]);
    expect(captured?.stderr.length).toBeGreaterThan(0);
    expect(typeof captured?.code).toBe("number");
    expect(captured?.cause).toBeInstanceOf(Error);
  });
});
