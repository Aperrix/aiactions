import { defineCommand } from "citty";

import { EXIT } from "../../../_shared/exit-codes.ts";
import { runCheckAction } from "./check-action.ts";
import { writeCheckReceipt } from "./receipt.ts";

export const checkCommand = defineCommand({
  meta: {
    name: "check",
    description: "Validate one or many aiaction.yaml manifests against actionManifestSchema",
  },
  args: {
    path: {
      type: "positional",
      description: "Path to a single aiaction.yaml",
      required: false,
    },
    all: {
      type: "boolean",
      description: "Validate every aiaction.yaml under the current directory",
      default: false,
    },
    json: {
      type: "boolean",
      description: "Emit machine-readable JSON instead of human output",
      default: false,
    },
  },
  async run({ args }) {
    const results = await runCheckAction({
      path: typeof args.path === "string" ? args.path : undefined,
      all: args.all === true,
    });
    writeCheckReceipt(args.json === true, results);
    if (!results.every((r) => r.ok)) process.exit(EXIT.SCHEMA);
  },
});
