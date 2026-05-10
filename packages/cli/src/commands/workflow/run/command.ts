import { defineCommand } from "citty";

import { EXIT } from "../../../_shared/exit-codes.ts";
import { runRunWorkflow } from "./run-workflow.ts";

function toArray(value: string | string[] | undefined): string[] {
  if (value === undefined) return [];
  if (Array.isArray(value)) return value;
  return [value];
}

export const runCommand = defineCommand({
  meta: {
    name: "run",
    description: "Run a workflow on the local machine",
  },
  args: {
    name: {
      type: "positional",
      description: "Discovered workflow name (looked up via discoverWorkflows())",
      required: false,
    },
    file: {
      type: "string",
      description: "Path to a workflow YAML file (overrides discovery)",
      required: false,
      valueHint: "<path>",
    },
    input: {
      type: "string",
      description: "Workflow input k=v (repeatable). Example: --input branch=main",
      required: false,
      alias: "i",
      valueHint: "<k=v>",
    },
    env: {
      type: "string",
      description: "Extra env var k=v layered above workflow.env (repeatable)",
      required: false,
      alias: "e",
      valueHint: "<k=v>",
    },
    cwd: {
      type: "string",
      description: "Working directory (default: process.cwd())",
      required: false,
      valueHint: "<path>",
    },
    json: {
      type: "boolean",
      description: "Emit NDJSON event stream on stdout instead of pretty output",
      default: false,
    },
  },
  async run({ args }) {
    const ac = new AbortController();
    const onSignal = (): void => {
      process.stderr.write("\n^C cancelling…\n");
      ac.abort();
    };
    process.on("SIGINT", onSignal);
    process.on("SIGTERM", onSignal);

    try {
      const { result, cancelled } = await runRunWorkflow({
        name: typeof args.name === "string" ? args.name : undefined,
        file: typeof args.file === "string" ? args.file : undefined,
        // citty types `string` flags as `string` only, but mri returns `string[]`
        // for repeated flags. Cast to handle both shapes safely.
        input: toArray(args.input as string | string[] | undefined),
        env: toArray(args.env as string | string[] | undefined),
        cwd: typeof args.cwd === "string" ? args.cwd : undefined,
        json: args.json === true,
        signal: ac.signal,
      });

      if (cancelled) process.exit(130);
      if (result.status === "failed") process.exit(EXIT.RUN_FAILED);
      // succeeded or skipped → fall-through, default exit 0.
    } finally {
      process.off("SIGINT", onSignal);
      process.off("SIGTERM", onSignal);
    }
  },
});
