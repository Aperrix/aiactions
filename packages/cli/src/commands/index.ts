import { actionCommand } from "./action/index.ts";
import { workflowCommand } from "./workflow/index.ts";

export const subCommands = {
  action: actionCommand,
  workflow: workflowCommand,
};
