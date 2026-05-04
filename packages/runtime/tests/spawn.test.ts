/**
 * Tests for `spawnShell` — process invocation, stdio capture, exit-code
 * surfacing, abort/timeout handling, and ENOENT propagation.
 *
 * Strategy: write a real script via `writeScript`, resolve a shell
 * invocation via `getShellInvocation`, and run `spawnShell` against
 * it. The tests therefore exercise the full process-model layer end
 * to end.
 *
 * POSIX-only — the tests skip on Windows because the dev environment
 * is Linux/macOS. Windows shell behaviour is exercised by integration
 * tests run on a Windows host (deferred until CI matrix lands).
 *
 * Contents:
 * - `echo` succeeds with exit 0 and captured stdout.
 * - `exit 1` surfaces exit code 1, `killed: false`, `timedOut: false`.
 * - stderr is captured separately from stdout.
 * - Timeout escalates to a kill: `killed: true`, `timedOut: true`,
 *   `exitCode: null`.
 * - Pre-aborted signal kills before the process completes.
 * - ENOENT on the binary rejects the promise.
 */

import { randomUUID } from "node:crypto";

import { describe, expect, test } from "vite-plus/test";

import { getShellInvocation } from "../src/exec/shell-spec.ts";
import { writeScript } from "../src/exec/script-file.ts";
import { spawnShell } from "../src/exec/spawn.ts";

const isWindows = process.platform === "win32";

const runStep = async (
  body: string,
  options: {
    timeoutMs?: number;
    signal?: AbortSignal;
    onStdout?: (chunk: string) => void;
  } = {},
) => {
  const runId = randomUUID();
  const inv = getShellInvocation(undefined, "<placeholder>", process.platform, true);
  const handle = await writeScript(body, runId, 0, inv.extension, process.platform);
  try {
    const concrete = getShellInvocation(undefined, handle.path, process.platform, true);
    return await spawnShell({
      bin: concrete.bin,
      args: concrete.args,
      cwd: process.cwd(),
      env: process.env,
      timeoutMs: options.timeoutMs,
      signal: options.signal,
      onStdout: options.onStdout,
    });
  } finally {
    await handle.cleanup();
  }
};

describe.skipIf(isWindows)("spawnShell — POSIX shell execution", () => {
  test("echo succeeds with exit 0 and captures stdout", async () => {
    const result = await runStep('echo "hello"\n');
    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain("hello");
    expect(result.killed).toBe(false);
    expect(result.timedOut).toBe(false);
  });

  test("exit 1 surfaces a non-zero exit code without killing", async () => {
    const result = await runStep("exit 1\n");
    expect(result.exitCode).toBe(1);
    expect(result.killed).toBe(false);
    expect(result.timedOut).toBe(false);
  });

  test("stderr is captured separately from stdout", async () => {
    const result = await runStep("echo out\necho err 1>&2\n");
    expect(result.stdout).toContain("out");
    expect(result.stderr).toContain("err");
  });

  test("onStdout is invoked synchronously per chunk", async () => {
    const chunks: string[] = [];
    const result = await runStep("echo streamed\n", { onStdout: (c) => chunks.push(c) });
    expect(result.exitCode).toBe(0);
    expect(chunks.join("")).toContain("streamed");
  });

  test("timeoutMs kills the process and reports timedOut", async () => {
    const result = await runStep("sleep 5\n", { timeoutMs: 100 });
    expect(result.killed).toBe(true);
    expect(result.timedOut).toBe(true);
    expect(result.exitCode).toBeNull();
  });

  test("a pre-aborted signal kills the process immediately", async () => {
    const ac = new AbortController();
    ac.abort();
    const result = await runStep("sleep 5\n", { signal: ac.signal });
    expect(result.killed).toBe(true);
    expect(result.timedOut).toBe(false);
    expect(result.exitCode).toBeNull();
  });

  test("ENOENT on the binary rejects the promise", async () => {
    await expect(
      spawnShell({
        bin: "definitely-not-a-real-binary-xyz",
        args: [],
        cwd: process.cwd(),
        env: process.env,
      }),
    ).rejects.toMatchObject({ code: "ENOENT" });
  });
});
