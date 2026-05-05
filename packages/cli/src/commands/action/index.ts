import { defineCommand } from "citty";

import { installCommand } from "./install.ts";
import { listCommand } from "./list.ts";
import { uninstallCommand } from "./uninstall.ts";

export const actionCommand = defineCommand({
  meta: {
    name: "action",
    description: "Manage AIactions actions cached locally",
  },
  subCommands: {
    install: installCommand,
    list: listCommand,
    uninstall: uninstallCommand,
  },
});
