/**
 * Unit tests for `resolveClaudeBinary`. Covers: input override wins,
 * env fallback, PATH lookup, missing-binary error message.
 */

import { chmodSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { describe, expect, test } from "vite-plus/test";

import { resolveClaudeBinary } from "../src/bin-resolver.ts";

function makeFakeBinary(name: string): string {
  const dir = mkdtempSync(join(tmpdir(), "aiactions-bin-"));
  const path = join(dir, name);
  writeFileSync(path, "#!/usr/bin/env sh\nexit 0\n");
  chmodSync(path, 0o755);
  return path;
}

describe("resolveClaudeBinary", () => {
  test("returns the explicit input override when provided", () => {
    const fake = makeFakeBinary("claude");
    const result = resolveClaudeBinary(fake, { PATH: "" });
    expect(result).toBe(fake);
  });

  test("falls back to AIACTIONS_CLAUDE_BIN env when input is empty", () => {
    const fake = makeFakeBinary("claude");
    const result = resolveClaudeBinary(undefined, { PATH: "", AIACTIONS_CLAUDE_BIN: fake });
    expect(result).toBe(fake);
  });

  test("falls back to PATH lookup when neither input nor env is set", () => {
    const fake = makeFakeBinary("claude");
    const dir = fake.slice(0, fake.lastIndexOf("/"));
    const result = resolveClaudeBinary(undefined, { PATH: dir });
    expect(result).toBe(fake);
  });

  test("throws a friendly error when nothing is resolvable", () => {
    expect(() => resolveClaudeBinary(undefined, { PATH: "/nonexistent" })).toThrow(
      /claude.*not found/,
    );
  });

  test("treats empty-string input override as unset", () => {
    const fake = makeFakeBinary("claude");
    const result = resolveClaudeBinary("", { PATH: "", AIACTIONS_CLAUDE_BIN: fake });
    expect(result).toBe(fake);
  });

  test("throws when explicit input override points to a missing path", () => {
    expect(() => resolveClaudeBinary("/definitely/not/here", { PATH: "" })).toThrow(
      /not accessible at '\/definitely\/not\/here'/,
    );
  });

  test("throws when AIACTIONS_CLAUDE_BIN points to a non-executable file", () => {
    const dir = mkdtempSync(join(tmpdir(), "aiactions-bin-"));
    const path = join(dir, "fake");
    writeFileSync(path, ""); // not chmod'd → not executable
    expect(() => resolveClaudeBinary(undefined, { PATH: "", AIACTIONS_CLAUDE_BIN: path })).toThrow(
      /not accessible/,
    );
  });

  test("error message identifies the source (input vs env) of the bad path", () => {
    expect(() => resolveClaudeBinary("/nope/input", { PATH: "" })).toThrow(
      /path_to_claude_code_executable/,
    );
    expect(() =>
      resolveClaudeBinary(undefined, { PATH: "", AIACTIONS_CLAUDE_BIN: "/nope/env" }),
    ).toThrow(/AIACTIONS_CLAUDE_BIN/);
  });
});
