import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { afterEach, beforeEach, describe, expect, it } from "vite-plus/test";

import { WorkflowParseError } from "@aiactions/schema";

import { UsageError } from "../../../../src/_shared/cli-error.ts";
import { resolveWorkflow } from "../../../../src/commands/workflow/run/resolve-workflow.ts";

const VALID_WORKFLOW = `
name: greet
jobs:
  hello:
    steps:
      - name: say-hi
        run: echo "hi"
`.trimStart();

describe("resolveWorkflow — --file mode", () => {
  let dir: string;

  beforeEach(async () => {
    dir = await mkdtemp(join(tmpdir(), "phase6.5-resolve-"));
  });

  afterEach(async () => {
    await rm(dir, { recursive: true, force: true });
  });

  it("parses a valid workflow YAML and returns absolutePath", async () => {
    const file = join(dir, "greet.yaml");
    await writeFile(file, VALID_WORKFLOW, "utf-8");
    const result = await resolveWorkflow({ file, name: undefined, cwd: dir });
    expect(result.absolutePath).toBe(file);
    expect(result.workflow.jobs).toHaveProperty("hello");
  });

  it("rethrows WorkflowParseError on missing file", async () => {
    await expect(
      resolveWorkflow({ file: join(dir, "nope.yaml"), name: undefined, cwd: dir }),
    ).rejects.toBeInstanceOf(WorkflowParseError);
  });
});

describe("resolveWorkflow — <name> mode (discovery)", () => {
  let projectRoot: string;
  let homeDir: string;

  beforeEach(async () => {
    projectRoot = await mkdtemp(join(tmpdir(), "phase6.5-discover-proj-"));
    homeDir = await mkdtemp(join(tmpdir(), "phase6.5-discover-home-"));
    // Make projectRoot a git repo so findGitRoot succeeds.
    await mkdir(join(projectRoot, ".git"), { recursive: true });
    await mkdir(join(projectRoot, ".aiactions", "workflows"), { recursive: true });
    await writeFile(
      join(projectRoot, ".aiactions", "workflows", "greet.yaml"),
      VALID_WORKFLOW,
      "utf-8",
    );
  });

  afterEach(async () => {
    await rm(projectRoot, { recursive: true, force: true });
    await rm(homeDir, { recursive: true, force: true });
  });

  it("returns the discovered workflow when name matches", async () => {
    // Override HOME so discovery's home layer points at the empty homeDir.
    const originalHome = process.env.HOME;
    process.env.HOME = homeDir;
    try {
      const result = await resolveWorkflow({
        file: undefined,
        name: "greet",
        cwd: projectRoot,
      });
      expect(result.absolutePath).toBe(join(projectRoot, ".aiactions", "workflows", "greet.yaml"));
      expect(result.workflow.jobs).toHaveProperty("hello");
    } finally {
      process.env.HOME = originalHome;
    }
  });

  it("throws UsageError when name is not discovered", async () => {
    const originalHome = process.env.HOME;
    process.env.HOME = homeDir;
    try {
      await expect(
        resolveWorkflow({ file: undefined, name: "nonexistent", cwd: projectRoot }),
      ).rejects.toThrow(UsageError);
      await expect(
        resolveWorkflow({ file: undefined, name: "nonexistent", cwd: projectRoot }),
      ).rejects.toThrow(/workflow not found: nonexistent/);
    } finally {
      process.env.HOME = originalHome;
    }
  });
});
