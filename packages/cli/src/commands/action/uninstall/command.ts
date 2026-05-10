import { defineCommand } from "citty";

import { runUninstallAction } from "./uninstall-action.ts";
import { writeUninstallReceipt } from "./receipt.ts";

export const uninstallCommand = defineCommand({
  meta: {
    name: "uninstall",
    description: "Remove cached actions; pick interactively when no ref given",
  },
  args: {
    ref: {
      type: "positional",
      description: "Registry coordinate '<ns>/<name>@<ver>' (omit for picker)",
      required: false,
    },
    yes: {
      type: "boolean",
      description: "Skip the confirmation prompt",
      default: false,
    },
    json: {
      type: "boolean",
      description: "Emit machine-readable JSON instead of human output",
      default: false,
    },
  },
  async run({ args }) {
    const json = args.json === true;
    const result = await runUninstallAction({
      ref: typeof args.ref === "string" ? args.ref : undefined,
      yes: args.yes === true,
      json,
    });
    writeUninstallReceipt(json, result);
  },
});
