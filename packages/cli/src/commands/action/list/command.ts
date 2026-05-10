import { defineCommand } from "citty";

import { runListAction } from "./list-actions.ts";
import { writeListReceipt } from "./receipt.ts";

export const listCommand = defineCommand({
  meta: {
    name: "list",
    description:
      "List actions from the registry, with installed/outdated badges from the local cache",
  },
  args: {
    json: {
      type: "boolean",
      description: "Emit machine-readable JSON instead of human output",
      default: false,
    },
  },
  async run({ args }) {
    const result = await runListAction();
    writeListReceipt(args.json === true, result);
  },
});
