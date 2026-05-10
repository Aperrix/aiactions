import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { afterEach, beforeEach, describe, expect, it, vi } from "vite-plus/test";

import { NotInGitRepoError } from "@aiactions/discovery";
import {
  WorkflowParseError,
  WorkflowSchemaError,
  WorkflowValidationError,
} from "@aiactions/schema";

import { UsageError } from "../../../../src/_shared/cli-error.ts";
import { runCheckWorkflow } from "../../../../src/commands/workflow/check/check-workflow.ts";
import { writeCheckReceipt } from "../../../../src/commands/workflow/check/receipt.ts";

const VALID_WORKFLOW = `
name: greet
jobs:
  hello:
    steps:
      - name: say-hi
        run: echo "hi"
`.trimStart();

// Shape violation: a step with both run: and uses: triggers WorkflowSchemaError.
// (jobs: {} would trigger WorkflowValidationError via the emptyJobs topology check.)
const SCHEMA_INVALID_WORKFLOW = `
name: bad-step
jobs:
  hello:
    steps:
      - name: conflict
        run: echo hi
        uses: ./some-action
`.trimStart();

const CYCLE_WORKFLOW = `
name: cyclic
jobs:
  a:
    needs: [b]
    steps:
      - name: a
        run: echo a
  b:
    needs: [a]
    steps:
      - name: b
        run: echo b
`.trimStart();

const MALFORMED_YAML = `
name: oops
jobs: { unbalanced
`.trimStart();

describe("runCheckWorkflow — argument validation", () => {
  it("throws UsageError when neither path nor --all is given", async () => {
    await expect(runCheckWorkflow({ path: undefined, all: false })).rejects.toBeInstanceOf(
      UsageError,
    );
  });

  it("throws UsageError when both path and --all are given", async () => {
    await expect(runCheckWorkflow({ path: "/x", all: true })).rejects.toBeInstanceOf(UsageError);
  });
});

describe("runCheckWorkflow — single-file (positional) mode", () => {
  let dir: string;

  beforeEach(async () => {
    dir = await mkdtemp(join(tmpdir(), "phase6-check-"));
  });

  afterEach(async () => {
    await rm(dir, { recursive: true, force: true });
  });

  it("returns ok for a valid workflow", async () => {
    const file = join(dir, "greet.yaml");
    await writeFile(file, VALID_WORKFLOW, "utf-8");
    const results = await runCheckWorkflow({ path: file, all: false });
    expect(results).toEqual([{ path: file, ok: true, errors: [] }]);
  });

  it("rethrows WorkflowParseError on missing file (ENOENT)", async () => {
    await expect(
      runCheckWorkflow({ path: join(dir, "nope.yaml"), all: false }),
    ).rejects.toBeInstanceOf(WorkflowParseError);
  });

  it("rethrows WorkflowParseError on malformed YAML", async () => {
    const file = join(dir, "broken.yaml");
    await writeFile(file, MALFORMED_YAML, "utf-8");
    await expect(runCheckWorkflow({ path: file, all: false })).rejects.toBeInstanceOf(
      WorkflowParseError,
    );
  });

  it("rethrows WorkflowSchemaError on a shape-invalid workflow (run + uses conflict)", async () => {
    const file = join(dir, "bad-schema.yaml");
    await writeFile(file, SCHEMA_INVALID_WORKFLOW, "utf-8");
    await expect(runCheckWorkflow({ path: file, all: false })).rejects.toBeInstanceOf(
      WorkflowSchemaError,
    );
  });

  it("rethrows WorkflowValidationError on a graph cycle", async () => {
    const file = join(dir, "cycle.yaml");
    await writeFile(file, CYCLE_WORKFLOW, "utf-8");
    await expect(runCheckWorkflow({ path: file, all: false })).rejects.toBeInstanceOf(
      WorkflowValidationError,
    );
  });
});

describe("writeCheckReceipt", () => {
  let stdout = "";

  beforeEach(() => {
    stdout = "";
    vi.spyOn(process.stdout, "write").mockImplementation(((chunk: unknown) => {
      stdout += String(chunk);
      return true;
    }) as typeof process.stdout.write);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders ✓ for ok rows (pretty)", () => {
    writeCheckReceipt(false, [{ path: "/p/a.yaml", ok: true, errors: [] }]);
    expect(stdout).toBe("✓ /p/a.yaml\n");
  });

  it("renders ✗ + indented errors for failed rows (pretty)", () => {
    writeCheckReceipt(false, [
      {
        path: "/p/b.yaml",
        ok: false,
        errors: [{ kind: "schema_validation", message: "missing field" }],
      },
    ]);
    expect(stdout).toBe(["✗ /p/b.yaml", "    schema_validation: missing field", ""].join("\n"));
  });

  it("emits a summary line when results.length > 1 (pretty)", () => {
    writeCheckReceipt(false, [
      { path: "/p/a.yaml", ok: true, errors: [] },
      {
        path: "/p/b.yaml",
        ok: false,
        errors: [{ kind: "schema_validation", message: "missing field" }],
      },
    ]);
    expect(stdout).toContain("2 file(s) checked — 1 ok, 1 failed");
  });

  it("emits a JSON summary {ok, files[]}", () => {
    writeCheckReceipt(true, [
      { path: "/p/a.yaml", ok: true, errors: [] },
      {
        path: "/p/b.yaml",
        ok: false,
        errors: [{ kind: "yaml_parse", message: "boom" }],
      },
    ]);
    const parsed = JSON.parse(stdout);
    expect(parsed.ok).toBe(false);
    expect(parsed.files).toHaveLength(2);
    expect(parsed.files[0].ok).toBe(true);
    expect(parsed.files[1].errors[0].kind).toBe("yaml_parse");
  });

  it("NotInGitRepoError exists (sanity)", () => {
    expect(new NotInGitRepoError("/x").message).toContain("not in a git repository");
  });
});
