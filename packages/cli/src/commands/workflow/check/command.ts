import { defineCommand } from "citty";

import { EXIT } from "../../../_shared/exit-codes.ts";
import { runCheckWorkflow } from "./check-workflow.ts";
import { writeCheckReceipt } from "./receipt.ts";

export const checkCommand = defineCommand({
  meta: {
    name: "check",
    description: "Validate one or many workflow YAML files against workflowSchema",
  },
  args: {
    path: {
      type: "positional",
      description: "Path to a single workflow YAML",
      required: false,
    },
    all: {
      type: "boolean",
      description: "Validate every discovered workflow (project + home)",
      default: false,
    },
    json: {
      type: "boolean",
      description: "Emit machine-readable JSON instead of human output",
      default: false,
    },
  },
  async run({ args }) {
    const results = await runCheckWorkflow({
      path: typeof args.path === "string" ? args.path : undefined,
      all: args.all === true,
    });
    writeCheckReceipt(args.json === true, results);
    if (!results.every((r) => r.ok)) process.exit(EXIT.SCHEMA);
  },
});
