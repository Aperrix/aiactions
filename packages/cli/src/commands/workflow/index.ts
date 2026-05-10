import { defineCommand } from "citty";

import { listCommand } from "./list/command.ts";

export const workflowCommand = defineCommand({
  meta: {
    name: "workflow",
    description: "Discover and validate AIactions workflows from project + home roots",
  },
  subCommands: {
    list: listCommand,
  },
});
