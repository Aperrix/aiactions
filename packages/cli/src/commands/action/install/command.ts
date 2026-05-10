import { defineCommand } from "citty";

import { runInstallAction } from "./install-action.ts";
import { writeInstallReceipt } from "./receipt.ts";

export const installCommand = defineCommand({
  meta: {
    name: "install",
    description: "Install one or more actions from the registry into the local cache",
  },
  args: {
    ref: {
      type: "positional",
      description: "Registry coordinate '<ns>/<name>' or '<ns>/<name>@<ver>' (omit for picker)",
      required: false,
    },
    json: {
      type: "boolean",
      description: "Emit machine-readable JSON instead of human output",
      default: false,
    },
  },
  async run({ args }) {
    const json = args.json === true;
    const ref = typeof args.ref === "string" ? args.ref : undefined;
    const result = await runInstallAction({ ref, json });
    writeInstallReceipt(json, result);
  },
});
