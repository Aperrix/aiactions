/**
 * Tests for executeUsesStep — the parent-side spawn + IPC
 * orchestrator. Exercises the four end-to-end paths through real
 * subprocesses: success, action throw, abort mid-run, and timeout.
 *
 * POSIX-only.
 */

import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { describe, expect, test } from "vite-plus/test";

import { parseActionManifest } from "@aiactions/workflows";

import { executeUsesStep } from "../src/runner/uses/exec.ts";

const POSIX = process.platform !== "win32";
const FIXTURES = join(import.meta.dirname, "fixtures", "actions");

const loadResolved = async (name: string) => {
  const dir = join(FIXTURES, name);
  const manifest = await parseActionManifest(join(dir, "aiaction.yaml"));
  return { manifest, dir };
};

describe.skipIf(!POSIX)("executeUsesStep — happy path", () => {
  test("echo fixture returns succeeded with the emitted outputs", async () => {
    const resolved = await loadResolved("echo");
    const result = await executeUsesStep({
      resolved,
      inputs: { message: "hi" },
      env: process.env as Record<string, string>,
      jobId: "j",
      stepIndex: 0,
      stepId: "s",
    });
    expect(result.status).toBe("succeeded");
    expect(result.exitCode).toBe(0);
    expect(result.outputs).toEqual({ echoed: "hi" });
  });

  test("two-outputs fixture returns both outputs", async () => {
    const resolved = await loadResolved("two-outputs");
    const result = await executeUsesStep({
      resolved,
      inputs: {},
      env: process.env as Record<string, string>,
      jobId: "j",
      stepIndex: 0,
      stepId: undefined,
    });
    expect(result.status).toBe("succeeded");
    expect(result.outputs).toEqual({ first: "alpha", second: "beta" });
  });
});

describe.skipIf(!POSIX)("executeUsesStep — failure path", () => {
  test("crashing fixture returns failed with capturedError populated", async () => {
    const resolved = await loadResolved("crashing");
    const result = await executeUsesStep({
      resolved,
      inputs: {},
      env: process.env as Record<string, string>,
      jobId: "j",
      stepIndex: 0,
      stepId: undefined,
    });
    expect(result.status).toBe("failed");
    expect(result.exitCode).toBe(1);
    expect(result.capturedError?.message).toContain("crashing fixture");
  });
});

describe.skipIf(!POSIX)("executeUsesStep — abort", () => {
  test("aborting mid-run kills the child and returns failed", async () => {
    const dir = await mkdtemp(join(tmpdir(), "aia-exec-abort-"));
    try {
      const sentinel = join(dir, "sentinel");
      const resolved = await loadResolved("slow");
      const ac = new AbortController();
      const promise = executeUsesStep({
        resolved,
        inputs: {},
        env: { ...process.env, SLOW_FIXTURE_SENTINEL: sentinel } as Record<string, string>,
        jobId: "j",
        stepIndex: 0,
        stepId: undefined,
        signal: ac.signal,
      });
      setTimeout(() => ac.abort(), 250);
      const result = await promise;
      expect(result.status).toBe("failed");
      expect(result.exitCode).toBeNull();
      // The slow fixture writes the sentinel when SIGTERM arrives; if it
      // got SIGKILL straight away the file may be missing. Either is OK.
      try {
        const content = await readFile(sentinel, "utf-8");
        expect(content).toBe("aborted");
      } catch {
        // sentinel missing == process was hard-killed before it ran
        // its abort handler. Acceptable.
      }
    } finally {
      await rm(dir, { recursive: true, force: true });
    }
  });
});

describe.skipIf(!POSIX)("executeUsesStep — timeout", () => {
  test("timeoutMs kills the child and returns failed", async () => {
    const resolved = await loadResolved("slow");
    const result = await executeUsesStep({
      resolved,
      inputs: {},
      env: process.env as Record<string, string>,
      jobId: "j",
      stepIndex: 0,
      stepId: undefined,
      timeoutMs: 200,
    });
    expect(result.status).toBe("failed");
    expect(result.exitCode).toBeNull();
  });
});
