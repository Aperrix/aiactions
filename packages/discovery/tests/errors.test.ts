import { describe, expect, it } from "vite-plus/test";

import { AIactionsError } from "@aiactions/schema";

import { NotInGitRepoError } from "../src/errors.ts";

describe("NotInGitRepoError", () => {
  it("extends AIactionsError", () => {
    const err = new NotInGitRepoError("/tmp/x");
    expect(err).toBeInstanceOf(AIactionsError);
  });

  it("still extends Error", () => {
    const err = new NotInGitRepoError("/tmp/x");
    expect(err).toBeInstanceOf(Error);
  });

  it("preserves the ENOTINGITREPO sentinel code", () => {
    const err = new NotInGitRepoError("/tmp/x");
    expect(err.code).toBe("ENOTINGITREPO");
  });

  it("preserves the startDir field and the rendered message", () => {
    const err = new NotInGitRepoError("/tmp/x");
    expect(err.startDir).toBe("/tmp/x");
    expect(err.message).toBe("not in a git repository: /tmp/x");
  });

  it("preserves the name property", () => {
    const err = new NotInGitRepoError("/tmp/x");
    expect(err.name).toBe("NotInGitRepoError");
  });
});
