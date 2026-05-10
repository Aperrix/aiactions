import { AIactionsError } from "@aiactions/schema";
import { defineCommand, runCommand, showUsage } from "citty";

import packageJson from "../package.json" with { type: "json" };
import { subCommands } from "./commands/index.ts";
import { CliError } from "./_shared/cli-error.ts";
import { EXIT, EXIT_BY_BRICK_ERROR } from "./_shared/exit-codes.ts";

const VERSION = packageJson.version;

const main = defineCommand({
  meta: {
    name: "aia",
    version: VERSION,
    description: "AIactions CLI",
  },
  subCommands,
});

const rawArgs = process.argv.slice(2);
const firstArg = rawArgs[0];

try {
  if (rawArgs.length === 0 || firstArg === "--help" || firstArg === "-h") {
    await showUsage(main);
    process.exit(0);
  } else if (firstArg === "--version") {
    process.stdout.write(`${VERSION}\n`);
    process.exit(0);
  } else {
    await runCommand(main, { rawArgs });
  }
} catch (err) {
  if (err instanceof CliError) {
    process.stderr.write(`✖ ${err.message}\n`);
    if (process.env.AIA_DEBUG && err.cause) {
      const cause = err.cause as Error;
      process.stderr.write(`${cause.stack ?? String(cause)}\n`);
    }
    process.exit(err.code);
  }
  if (err instanceof AIactionsError) {
    process.stderr.write(`✖ ${err.message}\n`);
    if (process.env.AIA_DEBUG && err.cause) {
      const cause = err.cause as Error;
      process.stderr.write(`${cause.stack ?? String(cause)}\n`);
    }
    const ctor = err.constructor as new (message: string, options?: ErrorOptions) => AIactionsError;
    process.exit(EXIT_BY_BRICK_ERROR.get(ctor) ?? EXIT.RUNTIME);
  }
  const e = err as Error;
  process.stderr.write(`✖ ${e.message}\n`);
  if (process.env.AIA_DEBUG) {
    process.stderr.write(`${e.stack ?? ""}\n`);
  }
  process.exit(EXIT.RUNTIME);
}
