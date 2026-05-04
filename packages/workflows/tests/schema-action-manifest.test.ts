/**
 * Tests for `actionManifestSchema` — minimal + maximal manifests, the
 * optional `runs.using` slot, the `runs.main` path regex, and the
 * action-input / action-output shapes (deliberately distinct from
 * workflow_call inputs/outputs).
 *
 * Contents:
 * - minimal happy path.
 * - full happy path with inputs + outputs.
 * - `runs.using` optional with single allowed value.
 * - `runs.main` path constraints.
 * - action input shape rejects `type:` and `value:` fields.
 * - action output shape rejects `type:` and `value:` fields.
 * - `name` regex.
 */

import { describe, expect, test } from "vite-plus/test";

import { actionManifestSchema } from "../src/schema/action-manifest.ts";

describe("actionManifestSchema — happy paths", () => {
  test("accepts minimal manifest", () => {
    const result = actionManifestSchema.safeParse({
      schemaVersion: 1,
      name: "lint",
      description: "Lint the codebase.",
      runs: { main: "./dist/index.mjs" },
    });
    expect(result.success).toBe(true);
  });

  test("accepts full manifest with inputs, outputs, and runs.using", () => {
    const result = actionManifestSchema.safeParse({
      schemaVersion: 1,
      name: "claude-agent",
      description: "Run Claude as a workflow node.",
      runs: { using: "bun-module", main: "./dist/index.mjs" },
      inputs: {
        prompt: { description: "the prompt", required: true },
        model: { description: "model id", default: "claude-sonnet-4-6" },
      },
      outputs: {
        finalText: { description: "the assistant's final text" },
      },
    });
    expect(result.success).toBe(true);
  });
});

describe("actionManifestSchema — runs.using", () => {
  test("is optional and defaults to bun-module on output", () => {
    const result = actionManifestSchema.safeParse({
      schemaVersion: 1,
      name: "lint",
      description: "Lint.",
      runs: { main: "./dist/index.mjs" },
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.runs.using).toBe("bun-module");
    }
  });

  test("rejects unknown using values", () => {
    const result = actionManifestSchema.safeParse({
      schemaVersion: 1,
      name: "lint",
      description: "Lint.",
      runs: { using: "node20", main: "./dist/index.mjs" },
    });
    expect(result.success).toBe(false);
  });
});

describe("actionManifestSchema — runs.main path", () => {
  test("accepts relative .mjs", () => {
    const result = actionManifestSchema.safeParse({
      schemaVersion: 1,
      name: "x",
      description: "x.",
      runs: { main: "./dist/index.mjs" },
    });
    expect(result.success).toBe(true);
  });

  test("accepts relative .js", () => {
    const result = actionManifestSchema.safeParse({
      schemaVersion: 1,
      name: "x",
      description: "x.",
      runs: { main: "./dist/index.js" },
    });
    expect(result.success).toBe(true);
  });

  test("rejects absolute paths", () => {
    const result = actionManifestSchema.safeParse({
      schemaVersion: 1,
      name: "x",
      description: "x.",
      runs: { main: "/abs/path/index.mjs" },
    });
    expect(result.success).toBe(false);
  });

  test("rejects non-js extensions", () => {
    const result = actionManifestSchema.safeParse({
      schemaVersion: 1,
      name: "x",
      description: "x.",
      runs: { main: "./dist/index.ts" },
    });
    expect(result.success).toBe(false);
  });

  test("rejects relative path without leading ./", () => {
    const result = actionManifestSchema.safeParse({
      schemaVersion: 1,
      name: "x",
      description: "x.",
      runs: { main: "dist/index.mjs" },
    });
    expect(result.success).toBe(false);
  });

  test("rejects '..' segments hidden inside the path", () => {
    const result = actionManifestSchema.safeParse({
      schemaVersion: 1,
      name: "x",
      description: "x.",
      runs: { main: "./..\\..\\evil.mjs" },
    });
    expect(result.success).toBe(false);
  });

  test("rejects backslashes in the path", () => {
    const result = actionManifestSchema.safeParse({
      schemaVersion: 1,
      name: "x",
      description: "x.",
      runs: { main: "./dist\\index.mjs" },
    });
    expect(result.success).toBe(false);
  });
});

describe("actionManifestSchema — input / output shape (vs workflow_call)", () => {
  test("rejects `type:` field on action inputs (workflow_call has it; action does not)", () => {
    const result = actionManifestSchema.safeParse({
      schemaVersion: 1,
      name: "x",
      description: "x.",
      runs: { main: "./dist/index.mjs" },
      inputs: { foo: { type: "string" } },
    });
    expect(result.success).toBe(false);
  });

  test("rejects `value:` field on action outputs (workflow_call has it; action does not)", () => {
    const result = actionManifestSchema.safeParse({
      schemaVersion: 1,
      name: "x",
      description: "x.",
      runs: { main: "./dist/index.mjs" },
      outputs: { foo: { value: "${{ steps.x.outputs.y }}" } },
    });
    expect(result.success).toBe(false);
  });

  test("accepts action input default as a plain string", () => {
    const result = actionManifestSchema.safeParse({
      schemaVersion: 1,
      name: "x",
      description: "x.",
      runs: { main: "./dist/index.mjs" },
      inputs: { foo: { default: "bar" } },
    });
    expect(result.success).toBe(true);
  });
});

describe("actionManifestSchema — name and schemaVersion", () => {
  test("rejects schemaVersion other than 1", () => {
    const result = actionManifestSchema.safeParse({
      schemaVersion: 2,
      name: "x",
      description: "x.",
      runs: { main: "./dist/index.mjs" },
    });
    expect(result.success).toBe(false);
  });

  test("rejects uppercase or non-kebab name", () => {
    expect(
      actionManifestSchema.safeParse({
        schemaVersion: 1,
        name: "Lint",
        description: "x.",
        runs: { main: "./dist/index.mjs" },
      }).success,
    ).toBe(false);
    expect(
      actionManifestSchema.safeParse({
        schemaVersion: 1,
        name: "lint_step",
        description: "x.",
        runs: { main: "./dist/index.mjs" },
      }).success,
    ).toBe(false);
  });

  test("rejects empty description", () => {
    const result = actionManifestSchema.safeParse({
      schemaVersion: 1,
      name: "x",
      description: "",
      runs: { main: "./dist/index.mjs" },
    });
    expect(result.success).toBe(false);
  });
});
