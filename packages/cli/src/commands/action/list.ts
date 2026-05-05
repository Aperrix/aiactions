import { defineCommand } from "citty";

import { formatTable } from "../../lib/output.ts";
import { resolveRegistryRoot } from "../../lib/registry-root.ts";
import { walkCache } from "../../lib/walk-cache.ts";

export const listCommand = defineCommand({
  meta: {
    name: "list",
    description: "List actions in the local cache",
  },
  args: {
    json: {
      type: "boolean",
      description: "Emit machine-readable JSON instead of a table",
      default: false,
    },
  },
  async run({ args }) {
    const registryRoot = resolveRegistryRoot();
    const entries = await walkCache(registryRoot);

    if (args.json) {
      process.stdout.write(`${JSON.stringify(entries)}\n`);
      return;
    }

    if (entries.length === 0) {
      process.stderr.write("no cached actions\n");
      return;
    }

    const table = formatTable(entries, [
      { header: "NAMESPACE", value: (e) => e.namespace },
      { header: "NAME", value: (e) => e.name },
      { header: "VERSION", value: (e) => e.version },
      { header: "PATH", value: (e) => e.dir },
    ]);
    process.stdout.write(`${table}\n`);
  },
});
