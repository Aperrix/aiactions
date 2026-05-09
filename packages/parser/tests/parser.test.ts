/**
 * Tests for `parseWorkflow` and `parseActionManifest`. Drives the full
 * load-then-validate pipeline against on-disk fixtures and asserts that
 * each failure mode raises the correct error class.
 *
 * Contents:
 * - `parseWorkflow` happy paths: minimal-run, multi-job-needs, reusable.
 * - `parseWorkflow` error mapping:
 *   - missing file → `WorkflowParseError`.
 *   - malformed YAML → `WorkflowParseError`.
 *   - shape violation (steps + uses conflict) → `WorkflowSchemaError`.
 *   - graph violation (cycle, dangling needs) → `WorkflowValidationError`.
 * - `parseActionManifest` happy path + missing file.
 */

import { describe, expect, test } from "vite-plus/test";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";

import { parseActionManifest } from "../src/parse-action.ts";
import { parseWorkflow } from "../src/parse-workflow.ts";
import {
  WorkflowParseError,
  WorkflowSchemaError,
  WorkflowValidationError,
} from "@aiactions/schema";

const FIXTURES = resolve(import.meta.dirname, "fixtures");
const wfFixture = (name: string): string => resolve(FIXTURES, "workflows", name);
const actionFixture = (name: string): string => resolve(FIXTURES, "actions", name, "aiaction.yaml");

describe("parseWorkflow — happy paths", () => {
  test("loads minimal-run.yaml", async () => {
    const wf = await parseWorkflow(wfFixture("minimal-run.yaml"));
    expect(wf.name).toBe("minimal-run");
    expect(Object.keys(wf.jobs)).toEqual(["lint"]);
  });

  test("loads multi-job-needs.yaml with env, passthrough, outputs and needs", async () => {
    const wf = await parseWorkflow(wfFixture("multi-job-needs.yaml"));
    expect(wf.name).toBe("multi-job-needs");
    expect(wf.env).toEqual({ COMMON: "shared" });
    expect(wf.passthrough).toEqual(["PATH", "HOME"]);
    expect(wf.jobs.test?.needs).toEqual(["build"]);
    expect(wf.jobs.build?.outputs?.artifact).toBe("${{ steps.compile.outputs.artifact }}");
  });

  test("loads reusable-workflow.yaml with workflow_call inputs and outputs", async () => {
    const wf = await parseWorkflow(wfFixture("reusable-workflow.yaml"));
    expect(wf.name).toBe("reusable-workflow");
    expect(wf.inputs?.target?.type).toBe("string");
    expect(wf.inputs?.target?.required).toBe(true);
    expect(wf.outputs?.url?.value).toBe("${{ jobs.deploy.outputs.url }}");
  });
});

describe("parseWorkflow — error mapping", () => {
  test("throws WorkflowParseError when file is missing", async () => {
    await expect(parseWorkflow(wfFixture("does-not-exist.yaml"))).rejects.toBeInstanceOf(
      WorkflowParseError,
    );
  });

  test("throws WorkflowParseError on malformed YAML", async () => {
    await expect(parseWorkflow(wfFixture("invalid-malformed.txt"))).rejects.toBeInstanceOf(
      WorkflowParseError,
    );
  });

  test("throws WorkflowSchemaError on shape violation (steps + uses conflict)", async () => {
    await expect(
      parseWorkflow(wfFixture("invalid-steps-uses-conflict.yaml")),
    ).rejects.toBeInstanceOf(WorkflowSchemaError);
  });

  test("throws WorkflowValidationError on cycle in needs graph", async () => {
    await expect(parseWorkflow(wfFixture("invalid-cycle.yaml"))).rejects.toBeInstanceOf(
      WorkflowValidationError,
    );
  });

  test("throws WorkflowValidationError on dangling needs", async () => {
    await expect(parseWorkflow(wfFixture("invalid-dangling-needs.yaml"))).rejects.toBeInstanceOf(
      WorkflowValidationError,
    );
  });

  test("WorkflowValidationError exposes the issue list", async () => {
    try {
      await parseWorkflow(wfFixture("invalid-cycle.yaml"));
      throw new Error("expected throw");
    } catch (err) {
      expect(err).toBeInstanceOf(WorkflowValidationError);
      if (err instanceof WorkflowValidationError) {
        expect(err.issues.length).toBeGreaterThan(0);
        expect(err.issues[0]?.message).toMatch(/cycle/);
        expect(err.issues[0]?.code).toBe("CYCLE_DETECTED");
      }
    }
  });

  test("WorkflowValidationError surfaces specific codes (DANGLING_NEED)", async () => {
    try {
      await parseWorkflow(wfFixture("invalid-dangling-needs.yaml"));
      throw new Error("expected throw");
    } catch (err) {
      expect(err).toBeInstanceOf(WorkflowValidationError);
      if (err instanceof WorkflowValidationError) {
        expect(err.issues.every((i) => i.code === "DANGLING_NEED")).toBe(true);
      }
    }
  });

  test("mixed shape + topology → WorkflowSchemaError takes precedence (topology issues stay on cause)", async () => {
    const dir = await mkdtemp(join(tmpdir(), "wf-mixed-"));
    const yamlPath = join(dir, "mixed.yaml");
    await writeFile(
      yamlPath,
      `name: ""
jobs:
  a:
    needs: [ghost]
    steps:
      - run: echo a
`,
      "utf-8",
    );
    try {
      await parseWorkflow(yamlPath);
      throw new Error("expected throw");
    } catch (err) {
      expect(err).toBeInstanceOf(WorkflowSchemaError);
      if (err instanceof WorkflowSchemaError) {
        expect(err.message).toMatch(/and \d+ graph issue/);
      }
    } finally {
      await rm(dir, { recursive: true, force: true });
    }
  });
});

describe("parseActionManifest", () => {
  test("loads echo action manifest", async () => {
    const manifest = await parseActionManifest(actionFixture("echo"));
    expect(manifest.schemaVersion).toBe(1);
    expect(manifest.name).toBe("echo");
    expect(manifest.runs.using).toBe("node");
    expect(manifest.runs.main).toBe("./dist/index.mjs");
    expect(manifest.inputs?.message?.required).toBe(true);
    expect(manifest.outputs?.echoed?.description).toBe("the same message, echoed");
  });

  test("throws WorkflowParseError when file is missing", async () => {
    await expect(parseActionManifest(actionFixture("ghost"))).rejects.toBeInstanceOf(
      WorkflowParseError,
    );
  });
});
