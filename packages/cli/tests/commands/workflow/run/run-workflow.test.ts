import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { afterEach, beforeEach, describe, expect, it } from "vite-plus/test";

import { UsageError } from "../../../../src/_shared/cli-error.ts";
import { runRunWorkflow } from "../../../../src/commands/workflow/run/run-workflow.ts";

const VALID_WORKFLOW = `
name: greet
jobs:
  hello:
    steps:
      - name: say-hi
        run: echo "hi"
`.trimStart();

let dir: string;

beforeEach(async () => {
  dir = await mkdtemp(join(tmpdir(), "phase6.5-runRun-"));
});

afterEach(async () => {
  await rm(dir, { recursive: true, force: true });
});

describe("runRunWorkflow — argument validation", () => {
  it("throws UsageError when neither name nor file is given", async () => {
    await expect(
      runRunWorkflow({
        name: undefined,
        file: undefined,
        input: [],
        env: [],
        cwd: undefined,
        json: false,
      }),
    ).rejects.toBeInstanceOf(UsageError);
  });

  it("throws UsageError when both name and file are given", async () => {
    await expect(
      runRunWorkflow({
        name: "greet",
        file: "/x.yaml",
        input: [],
        env: [],
        cwd: undefined,
        json: false,
      }),
    ).rejects.toThrow(/mutually exclusive/);
  });

  it("throws UsageError when --input is malformed", async () => {
    const file = join(dir, "greet.yaml");
    await writeFile(file, VALID_WORKFLOW, "utf-8");
    await expect(
      runRunWorkflow({
        name: undefined,
        file,
        input: ["broken"],
        env: [],
        cwd: dir,
        json: false,
      }),
    ).rejects.toThrow(/invalid --input/);
  });

  it("throws UsageError when --env is malformed", async () => {
    const file = join(dir, "greet.yaml");
    await writeFile(file, VALID_WORKFLOW, "utf-8");
    await expect(
      runRunWorkflow({
        name: undefined,
        file,
        input: [],
        env: ["bad"],
        cwd: dir,
        json: false,
      }),
    ).rejects.toThrow(/invalid --env/);
  });

  it("throws UsageError when --cwd does not exist", async () => {
    const file = join(dir, "greet.yaml");
    await writeFile(file, VALID_WORKFLOW, "utf-8");
    await expect(
      runRunWorkflow({
        name: undefined,
        file,
        input: [],
        env: [],
        cwd: join(dir, "does-not-exist"),
        json: false,
      }),
    ).rejects.toThrow(/cwd does not exist/);
  });
});

describe("runRunWorkflow — happy path", () => {
  it("runs a valid workflow via --file and returns RunResult.status === 'succeeded'", async () => {
    const file = join(dir, "greet.yaml");
    await writeFile(file, VALID_WORKFLOW, "utf-8");
    const out = await runRunWorkflow({
      name: undefined,
      file,
      input: [],
      env: [],
      cwd: dir,
      json: false,
    });
    expect(out.cancelled).toBe(false);
    expect(out.result.status).toBe("succeeded");
    expect(Object.keys(out.result.jobs)).toEqual(["hello"]);
    expect(out.workflowAbsolutePath).toBe(file);
  });
});
