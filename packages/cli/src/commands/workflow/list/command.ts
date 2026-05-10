import { defineCommand } from "citty";

import { runListWorkflow } from "./list-workflows.ts";
import { writeListReceipt } from "./receipt.ts";

export const listCommand = defineCommand({
  meta: {
    name: "list",
    description: "Enumerate workflows from project + home roots",
  },
  args: {
    json: {
      type: "boolean",
      description: "Emit machine-readable JSON instead of human output",
      default: false,
    },
  },
  async run({ args }) {
    const result = await runListWorkflow();
    writeListReceipt(args.json === true, result);
  },
});
