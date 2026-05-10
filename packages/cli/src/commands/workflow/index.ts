import { defineCommand } from "citty";

export const workflowCommand = defineCommand({
  meta: {
    name: "workflow",
    description: "Discover and validate AIactions workflows from project + home roots",
  },
  subCommands: {},
});
