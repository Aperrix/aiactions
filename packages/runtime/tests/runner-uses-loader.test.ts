/**
 * Smoke test for the action loader subprocess. Spawns the loader
 * directly with stdio: ["pipe", "pipe", "pipe", "pipe"] and asserts
 * that frames written to FD 3 reach the parent and that the exit code
 * matches the action's outcome.
 *
 * The integration with the rest of the runtime (resolver + exec +
 * job.ts) is exercised in slice f and slice g; this file only proves
 * that the loader stub itself works.
 *
 * POSIX-only — Windows FD 3 plumbing differs; a parallel test will
 * land if/when the runtime supports Windows.
 */

import { spawn } from "node:child_process";
import { join } from "node:path";

import { describe, expect, test } from "vite-plus/test";

import { ProtocolStreamParser, type ProtocolFrame } from "../src/runner/uses/protocol.ts";

const POSIX = process.platform !== "win32";
const LOADER = join(import.meta.dirname, "..", "src", "runner", "uses", "loader.mjs");
const FIXTURES = join(import.meta.dirname, "fixtures", "actions");

interface RunResult {
  readonly exitCode: number | null;
  readonly stdout: string;
  readonly stderr: string;
  readonly frames: ProtocolFrame[];
  readonly errors: string[];
}

const runLoader = async (
  actionMain: string,
  payload: { inputs?: Record<string, string> },
  options: { env?: Record<string, string> } = {},
): Promise<RunResult> =>
  new Promise<RunResult>((resolve, reject) => {
    const child = spawn(process.execPath, [LOADER], {
      env: { ...process.env, ...options.env, RUNNER_ACTION_MAIN: actionMain },
      stdio: ["pipe", "pipe", "pipe", "pipe"],
    });

    const frames: ProtocolFrame[] = [];
    const errors: string[] = [];
    const parser = new ProtocolStreamParser({
      onFrame: (f) => frames.push(f),
      onError: (e) => errors.push(e.message),
    });

    let stdout = "";
    let stderr = "";
    child.stdout?.setEncoding("utf-8").on("data", (c: string) => (stdout += c));
    child.stderr?.setEncoding("utf-8").on("data", (c: string) => (stderr += c));
    const fd3 = child.stdio[3];
    if (fd3 !== null && typeof fd3 === "object" && "setEncoding" in fd3) {
      fd3.setEncoding("utf-8");
      fd3.on("data", (chunk: string) => parser.push(chunk));
    }

    child.once("error", reject);
    child.once("close", (code) => {
      parser.end();
      resolve({ exitCode: code, stdout, stderr, frames, errors });
    });

    child.stdin?.write(JSON.stringify(payload));
    child.stdin?.end();
  });

describe.skipIf(!POSIX)("loader subprocess — happy path", () => {
  test("echo fixture emits the declared `echoed` output and exits 0", async () => {
    const result = await runLoader(join(FIXTURES, "echo", "index.mjs"), {
      inputs: { message: "world" },
    });
    expect(result.exitCode).toBe(0);
    expect(result.errors).toEqual([]);
    const outputs = result.frames.filter((f) => f.type === "output");
    expect(outputs).toHaveLength(1);
    expect(outputs).toContainEqual({ type: "output", name: "echoed", value: "world" });
    const logs = result.frames.filter((f) => f.type === "log");
    expect(logs).toHaveLength(1);
  });
});

describe.skipIf(!POSIX)("loader subprocess — failure paths", () => {
  test("crashing fixture writes an error frame and exits 1", async () => {
    const result = await runLoader(join(FIXTURES, "crashing", "index.mjs"), {});
    expect(result.exitCode).toBe(1);
    const errs = result.frames.filter((f) => f.type === "error");
    expect(errs).toHaveLength(1);
    expect(errs[0]?.type === "error" ? errs[0].message : "").toContain("crashing fixture");
  });

  test("missing RUNNER_ACTION_MAIN exits 1 with an error frame", async () => {
    const result = await runLoader("", {}, { env: { RUNNER_ACTION_MAIN: "" } });
    expect(result.exitCode).toBe(1);
    const errs = result.frames.filter((f) => f.type === "error");
    expect(errs.length).toBeGreaterThanOrEqual(1);
  });
});
