/**
 * Tests for `resolveUsesRef` — the ref → on-disk action resolver.
 *
 * Covers: relative local refs anchored at the workflow file's parent
 * dir, `file://` absolute local refs, registry refs anchored at
 * `registryRoot`, and the failure modes (`OrchestrationError`
 * for missing dirs and missing manifests).
 */

import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { afterEach, describe, expect, test } from "vite-plus/test";

import { usesRefSchema, WorkflowError } from "@aiactions/schema";

import { RegistryFetchError } from "@aiactions/registry";

import { resolveUsesRef } from "../src/runner/resolve-uses.ts";
import { OrchestrationError } from "../src/errors.ts";

const FIXTURES = join(import.meta.dirname, "fixtures", "actions");

const parseRef = (raw: string) => usesRefSchema.parse(raw);

let dirsToCleanup: string[] = [];

afterEach(async () => {
  await Promise.all(dirsToCleanup.map((d) => rm(d, { recursive: true, force: true })));
  dirsToCleanup = [];
});

describe("resolveUsesRef — local refs", () => {
  test("resolves a relative ref against the workflow file's parent dir", async () => {
    const ref = parseRef("./fixtures/actions/echo");
    const fakeWorkflow = join(import.meta.dirname, "fake.yaml");
    const result = await resolveUsesRef(ref, {
      workflowFile: fakeWorkflow,
      registryRoot: "/unused",
    });
    expect(result.dir).toBe(join(import.meta.dirname, "fixtures/actions/echo"));
    expect(result.manifest.name).toBe("echo");
  });

  test("resolves a file:// ref as an absolute path", async () => {
    const abs = join(FIXTURES, "echo");
    const ref = parseRef(`file://${abs}`);
    const result = await resolveUsesRef(ref, {
      workflowFile: "/dev/null/no-such.yaml",
      registryRoot: "/unused",
    });
    expect(result.dir).toBe(abs);
    expect(result.manifest.name).toBe("echo");
  });

  test("missing local dir surfaces OrchestrationError", async () => {
    const ref = parseRef("./nope/missing");
    await expect(
      resolveUsesRef(ref, {
        workflowFile: join(import.meta.dirname, "fake.yaml"),
        registryRoot: "/unused",
      }),
    ).rejects.toThrow(OrchestrationError);
  });
});

describe("resolveUsesRef — registry refs", () => {
  test("resolves <ns>/<name>@<ver> against registryRoot/<ns>/<name>/<ver>", async () => {
    const root = await mkdtemp(join(tmpdir(), "aia-reg-"));
    dirsToCleanup.push(root);
    const cwd = await mkdtemp(join(tmpdir(), "aia-reg-cwd-"));
    dirsToCleanup.push(cwd);
    const actionDir = join(root, "core", "lint", "1.2.3");
    await mkdir(actionDir, { recursive: true });
    await writeFile(
      join(actionDir, "aiaction.yaml"),
      [
        "schemaVersion: 1",
        "name: lint",
        "description: lint fixture",
        "runs:",
        "  using: node",
        "  main: ./index.mjs",
      ].join("\n"),
      "utf-8",
    );

    const ref = parseRef("core/lint@1.2.3");
    const result = await resolveUsesRef(ref, {
      workflowFile: "/dev/null/no-such.yaml",
      registryRoot: root,
      cwd,
    });
    expect(result.dir).toBe(actionDir);
    expect(result.manifest.name).toBe("lint");
    expect(ref.kind === "registry" ? ref.version : "").toBe("1.2.3");
  });

  test("missing registry entry surfaces OrchestrationError when fetch fails", async () => {
    const root = await mkdtemp(join(tmpdir(), "aia-reg-empty-"));
    dirsToCleanup.push(root);
    const cwd = await mkdtemp(join(tmpdir(), "aia-reg-cwd-"));
    dirsToCleanup.push(cwd);
    const tmp = await mkdtemp(join(tmpdir(), "aia-reg-tmp-"));
    dirsToCleanup.push(tmp);
    const ref = parseRef("nope/missing@0.0.0");
    await expect(
      resolveUsesRef(ref, {
        workflowFile: "/dev/null/no-such.yaml",
        registryRoot: root,
        cwd,
        registryFetch: { canonicalUrl: "file:///does-not-exist", tmpRoot: tmp },
      }),
    ).rejects.toThrow(RegistryFetchError);
  });
});

describe("resolveUsesRef — manifest failure modes", () => {
  test("missing aiaction.yaml surfaces OrchestrationError with cause chain", async () => {
    const tmp = await mkdtemp(join(tmpdir(), "aia-mf-"));
    dirsToCleanup.push(tmp);
    const ref = parseRef(`file://${tmp}`);
    const promise = resolveUsesRef(ref, {
      workflowFile: "/dev/null/no-such.yaml",
      registryRoot: "/unused",
    });
    await expect(promise).rejects.toThrow(OrchestrationError);
    await expect(promise).rejects.toMatchObject({ cause: expect.any(WorkflowError) });
  });
});
