import { defineCommand } from "citty";

import { checkCommand } from "./check/command.ts";
import { listCommand } from "./list/command.ts";
import { runCommand } from "./run/command.ts";

export const workflowCommand = defineCommand({
  meta: {
    name: "workflow",
    description: "Discover and validate AIactions workflows from project + home roots",
  },
  subCommands: {
    check: checkCommand,
    list: listCommand,
    run: runCommand,
  },
});
