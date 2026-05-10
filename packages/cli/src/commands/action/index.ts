import { defineCommand } from "citty";

import { checkCommand } from "./check/command.ts";
import { installCommand } from "./install/command.ts";
import { listCommand } from "./list.ts";
import { uninstallCommand } from "./uninstall.ts";

export const actionCommand = defineCommand({
  meta: {
    name: "action",
    description: "Manage AIactions actions cached locally",
  },
  subCommands: {
    check: checkCommand,
    install: installCommand,
    list: listCommand,
    uninstall: uninstallCommand,
  },
});
