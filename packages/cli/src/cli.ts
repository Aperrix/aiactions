import { defineCommand, runMain } from "citty";

import { subCommands } from "./commands/index.ts";
import { CliError } from "./lib/errors.ts";
import { EXIT } from "./lib/exit-codes.ts";

const main = defineCommand({
  meta: {
    name: "aia",
    version: "0.0.0",
    description: "AIactions CLI",
  },
  subCommands,
});

try {
  await runMain(main);
} catch (err) {
  if (err instanceof CliError) {
    process.stderr.write(`✖ ${err.message}\n`);
    if (process.env.AIA_DEBUG && err.cause) {
      const cause = err.cause as Error;
      process.stderr.write(`${cause.stack ?? String(cause)}\n`);
    }
    process.exit(err.code);
  }
  const e = err as Error;
  process.stderr.write(`✖ ${e.message}\n`);
  if (process.env.AIA_DEBUG) {
    process.stderr.write(`${e.stack ?? ""}\n`);
  }
  process.exit(EXIT.RUNTIME);
}
