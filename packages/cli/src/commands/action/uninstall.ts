import { readdir, rm, stat } from "node:fs/promises";
import { dirname, join } from "node:path";

import * as clack from "@clack/prompts";
import { defineCommand } from "citty";

import { NotFoundError, UsageError } from "../../lib/errors.ts";
import { isInteractive } from "../../lib/output.ts";
import { parseRegistryRef } from "../../lib/parse-registry-ref.ts";
import { resolveRegistryRoot } from "../../lib/registry-root.ts";
import { type CachedEntry, walkCache } from "../../lib/walk-cache.ts";

interface RemovalReceipt {
  readonly ref: string;
  readonly dir: string;
}

export const uninstallCommand = defineCommand({
  meta: {
    name: "uninstall",
    description: "Remove cached actions; pick interactively when no ref given",
  },
  args: {
    ref: {
      type: "positional",
      description: "Registry coordinate '<ns>/<name>@<ver>' (omit for picker)",
      required: false,
    },
    yes: {
      type: "boolean",
      description: "Skip the confirmation prompt",
      default: false,
    },
    json: {
      type: "boolean",
      description: "Emit machine-readable JSON instead of human output",
      default: false,
    },
  },
  async run({ args }) {
    const registryRoot = resolveRegistryRoot();
    const interactive = isInteractive(args.json);

    if (!args.ref) {
      if (args.json) {
        throw new UsageError(
          "--json mode requires <ref> + --yes; multi-select is not available in JSON mode",
        );
      }
      if (!interactive) {
        throw new UsageError("<ref> required in non-interactive mode (no TTY)");
      }
      const removed = await runInteractive(registryRoot, args.yes);
      emitHumanRemoval(removed);
      return;
    }

    const ref = parseRegistryRef(args.ref);
    const dir = join(registryRoot, ref.namespace, ref.name, ref.version);

    if (!(await pathExists(dir))) {
      throw new NotFoundError(`not in cache: ${args.ref}`);
    }

    if (!args.yes) {
      if (!interactive) {
        throw new UsageError("refusing destructive op without --yes (non-interactive)");
      }
      const ok = await clack.confirm({ message: `remove ${args.ref}?` });
      if (clack.isCancel(ok) || ok === false) return;
    }

    await removeAndPrune(dir, registryRoot);

    if (args.json) {
      process.stdout.write(
        `${JSON.stringify({ removed: [{ ref: args.ref, dir }], skipped: [] })}\n`,
      );
    } else {
      emitHumanRemoval([{ ref: args.ref, dir }]);
    }
  },
});

async function runInteractive(
  registryRoot: string,
  skipConfirm: boolean,
): Promise<RemovalReceipt[]> {
  const entries = await walkCache(registryRoot);
  if (entries.length === 0) {
    process.stderr.write("no cached actions\n");
    return [];
  }

  const picks = await clack.multiselect<CachedEntry>({
    message: "select actions to remove",
    options: entries.map((e) => ({
      label: `${e.namespace}/${e.name}@${e.version}`,
      value: e,
    })),
    required: false,
  });

  if (clack.isCancel(picks) || picks.length === 0) return [];

  if (!skipConfirm) {
    const ok = await clack.confirm({
      message: `remove ${picks.length} ${picks.length === 1 ? "entry" : "entries"}?`,
    });
    if (clack.isCancel(ok) || ok === false) return [];
  }

  const removed: RemovalReceipt[] = [];
  for (const pick of picks) {
    await removeAndPrune(pick.dir, registryRoot);
    removed.push({
      ref: `${pick.namespace}/${pick.name}@${pick.version}`,
      dir: pick.dir,
    });
  }
  return removed;
}

async function removeAndPrune(dir: string, root: string): Promise<void> {
  await rm(dir, { recursive: true, force: true });
  let parent = dirname(dir);
  while (parent !== root && parent.startsWith(root)) {
    let siblings: string[];
    try {
      siblings = await readdir(parent);
    } catch {
      break;
    }
    if (siblings.length > 0) break;
    await rm(parent, { recursive: true, force: true });
    parent = dirname(parent);
  }
}

async function pathExists(p: string): Promise<boolean> {
  try {
    await stat(p);
    return true;
  } catch {
    return false;
  }
}

function emitHumanRemoval(removed: RemovalReceipt[]): void {
  for (const r of removed) {
    process.stderr.write(`✓ removed ${r.ref}\n`);
  }
}
