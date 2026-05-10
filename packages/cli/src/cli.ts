import { AIactionsError } from "@aiactions/schema";
import { type CommandDef, defineCommand, runCommand, showUsage } from "citty";

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

/**
 * Walk `cmd.subCommands` following positional segments in `rawArgs` and
 * return the deepest matching command together with its parent. Mirrors
 * citty's internal `resolveSubCommand` (not exported by the package) so
 * `aia <resource> <verb> --help` renders the verb's help screen, not its
 * `run()` body.
 */
async function resolveSubCommand(
  cmd: CommandDef,
  rawArgs: string[],
  parent?: CommandDef,
): Promise<[CommandDef, CommandDef | undefined]> {
  const subs = await (typeof cmd.subCommands === "function" ? cmd.subCommands() : cmd.subCommands);
  if (subs && Object.keys(subs).length > 0) {
    const idx = rawArgs.findIndex((arg) => !arg.startsWith("-"));
    const name = idx >= 0 ? rawArgs[idx] : undefined;
    const entry = name === undefined ? undefined : subs[name];
    const next = await (typeof entry === "function" ? entry() : entry);
    if (next) {
      return resolveSubCommand(next, rawArgs.slice(idx + 1), cmd);
    }
  }
  return [cmd, parent];
}

const rawArgs = process.argv.slice(2);
const firstArg = rawArgs[0];

try {
  if (rawArgs.length === 0) {
    await showUsage(main);
    process.exit(0);
  } else if (rawArgs.includes("--help") || rawArgs.includes("-h")) {
    const [resolved, parent] = await resolveSubCommand(main, rawArgs);
    await showUsage(resolved, parent);
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
