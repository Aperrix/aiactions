import { afterEach, beforeEach, describe, expect, it, vi } from "vite-plus/test";

import type { DiscoveredWorkflow, DiscoveryError, DiscoveryResult } from "@aiactions/discovery";
import { NotInGitRepoError } from "@aiactions/discovery";

import { writeListReceipt } from "../../../../src/commands/workflow/list/receipt.ts";

describe("workflow list — writeListReceipt", () => {
  let stdout = "";
  let stderr = "";

  beforeEach(() => {
    stdout = "";
    stderr = "";
    vi.spyOn(process.stdout, "write").mockImplementation(((chunk: unknown) => {
      stdout += String(chunk);
      return true;
    }) as typeof process.stdout.write);
    vi.spyOn(process.stderr, "write").mockImplementation(((chunk: unknown) => {
      stderr += String(chunk);
      return true;
    }) as typeof process.stderr.write);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  function makeWorkflow(overrides: Partial<DiscoveredWorkflow>): DiscoveredWorkflow {
    return {
      name: "greet",
      origin: "project",
      absolutePath: "/p/.aiactions/workflows/greet.yaml",
      // Cast to satisfy DiscoveredWorkflow's `workflow` field; receipt does not look at it.
      workflow: {} as DiscoveredWorkflow["workflow"],
      ...overrides,
    };
  }

  it("renders project + home workflows alphabetically (pretty)", () => {
    const result: DiscoveryResult = {
      workflows: [
        makeWorkflow({ name: "ci", absolutePath: "/p/.aiactions/workflows/ci.yaml" }),
        makeWorkflow({
          name: "deploy",
          origin: "home",
          absolutePath: "/h/.aiactions/workflows/deploy.yaml",
        }),
        makeWorkflow({ name: "greet" }),
      ],
      errors: [],
    };
    writeListReceipt(false, result);
    expect(stdout).toBe(
      [
        "ci  project  /p/.aiactions/workflows/ci.yaml",
        "deploy  home  /h/.aiactions/workflows/deploy.yaml",
        "greet  project  /p/.aiactions/workflows/greet.yaml",
      ].join("\n") + "\n",
    );
    expect(stderr).toBe("");
  });

  it("renders shadowed badge inline (pretty)", () => {
    const result: DiscoveryResult = {
      workflows: [
        makeWorkflow({
          name: "ci",
          absolutePath: "/p/.aiactions/workflows/ci.yaml",
          shadowed: {
            absolutePath: "/h/.aiactions/workflows/ci.yaml",
            origin: "home",
          },
        }),
      ],
      errors: [],
    };
    writeListReceipt(false, result);
    expect(stdout).toBe(
      "ci  project  /p/.aiactions/workflows/ci.yaml  [shadowed by home: /h/.aiactions/workflows/ci.yaml]\n",
    );
  });

  it("emits errors to stderr after a `--` separator (pretty)", () => {
    const err: DiscoveryError = {
      absolutePath: "/p/.aiactions/workflows/broken.yaml",
      origin: "project",
      kind: "schema_validation",
      message: "missing field",
    };
    const result: DiscoveryResult = {
      workflows: [makeWorkflow({})],
      errors: [err],
    };
    writeListReceipt(false, result);
    expect(stdout).toBe(
      ["greet  project  /p/.aiactions/workflows/greet.yaml", "--", ""].join("\n"),
    );
    expect(stderr).toBe("/p/.aiactions/workflows/broken.yaml: schema_validation: missing field\n");
  });

  it("emits a `no workflows found` notice on stderr when both lists are empty (pretty)", () => {
    writeListReceipt(false, { workflows: [], errors: [] });
    expect(stdout).toBe("");
    expect(stderr).toBe("no workflows found\n");
  });

  it("emits a JSON passthrough of DiscoveryResult", () => {
    const result: DiscoveryResult = {
      workflows: [makeWorkflow({})],
      errors: [],
    };
    writeListReceipt(true, result);
    expect(stderr).toBe("");
    const parsed = JSON.parse(stdout);
    expect(parsed.workflows).toHaveLength(1);
    expect(parsed.workflows[0].name).toBe("greet");
    expect(parsed.errors).toHaveLength(0);
  });

  it("NotInGitRepoError is an AIactionsError (sanity for cli.ts mapping)", () => {
    const err = new NotInGitRepoError("/tmp/x");
    expect(err.message).toContain("not in a git repository");
  });
});
