/**
 * Unit tests for `resolveClaudeBinary`. Covers: input override wins,
 * env fallback, PATH lookup, missing-binary error message, unsafe-path
 * rejection, and symlink canonicalization.
 */

import { chmodSync, mkdtempSync, symlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { describe, expect, test } from "vite-plus/test";

import { resolveClaudeBinary } from "../src/bin-resolver.ts";

/**
 * Create a fake executable binary under a caller-supplied directory.
 * The directory must already exist.
 */
function makeFakeBinaryIn(dir: string, name: string): string {
  const path = join(dir, name);
  writeFileSync(path, "#!/usr/bin/env sh\nexit 0\n");
  chmodSync(path, 0o755);
  return path;
}

/**
 * Create a safe (non-tmp) writable directory for test binaries.
 * Uses /run/user/<uid> which is user-owned and not world-writable.
 * Falls back to a subdir of the repo if /run/user is unavailable.
 */
function makeSafeDir(): string {
  const uid = process.getuid?.() ?? 1000;
  const base = `/run/user/${uid}`;
  try {
    const dir = mkdtempSync(join(base, "aiactions-bin-"));
    return dir;
  } catch {
    // Fallback: use a subdir of /var/run if writable, else throw
    const fallback = mkdtempSync(join("/var/run", "aiactions-bin-"));
    return fallback;
  }
}

describe("resolveClaudeBinary", () => {
  test("returns the explicit input override when provided", () => {
    const dir = makeSafeDir();
    const fake = makeFakeBinaryIn(dir, "claude");
    const result = resolveClaudeBinary(fake, { PATH: "" });
    // realpathSync resolves the path; on a safe dir it should equal the input
    expect(result).toBe(fake);
  });

  test("falls back to AIACTIONS_CLAUDE_BIN env when input is empty", () => {
    const dir = makeSafeDir();
    const fake = makeFakeBinaryIn(dir, "claude");
    const result = resolveClaudeBinary(undefined, { PATH: "", AIACTIONS_CLAUDE_BIN: fake });
    expect(result).toBe(fake);
  });

  test("falls back to PATH lookup when neither input nor env is set", () => {
    // PATH lookup is not subject to the unsafe-path check, so tmpdir is fine here.
    const tmpDir = mkdtempSync(join(tmpdir(), "aiactions-bin-"));
    const fake = makeFakeBinaryIn(tmpDir, "claude");
    const result = resolveClaudeBinary(undefined, { PATH: tmpDir });
    expect(result).toBe(fake);
  });

  test("throws a friendly error when nothing is resolvable", () => {
    expect(() => resolveClaudeBinary(undefined, { PATH: "/nonexistent" })).toThrow(
      /claude.*not found/,
    );
  });

  test("treats empty-string input override as unset", () => {
    const dir = makeSafeDir();
    const fake = makeFakeBinaryIn(dir, "claude");
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

  test("rejects explicit override under /tmp", () => {
    const tmpDir = mkdtempSync(join(tmpdir(), "aiactions-unsafe-"));
    const fake = makeFakeBinaryIn(tmpDir, "claude");
    expect(() => resolveClaudeBinary(fake, { PATH: "" })).toThrow(/unsafe path/i);
  });

  test("rejects override whose symlink resolves into /tmp", () => {
    // Real binary lives under /tmp
    const tmpDir = mkdtempSync(join(tmpdir(), "aiactions-unsafe-inner-"));
    const inner = makeFakeBinaryIn(tmpDir, "claude-real");

    // Symlink lives in a safe dir but points into /tmp
    const safeDir = makeSafeDir();
    const link = join(safeDir, "claude-link");
    symlinkSync(inner, link);

    expect(() => resolveClaudeBinary(link, { PATH: "" })).toThrow(/unsafe path/i);
  });
});
