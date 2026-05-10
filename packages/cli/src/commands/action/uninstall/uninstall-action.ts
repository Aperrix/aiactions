import { readdir, rm, stat } from "node:fs/promises";
import { dirname, join } from "node:path";

import { resolveRegistryRoot } from "@aiactions/paths";
import { type CachedEntry, walkCache } from "@aiactions/registry";
import * as clack from "@clack/prompts";

import { NotFoundError, UsageError } from "../../../_shared/cli-error.ts";
import { isInteractive } from "../../../_shared/output.ts";
import { parseRegistryRef } from "../../../_shared/parse-registry-ref.ts";

export interface UninstallActionArgs {
  readonly ref: string | undefined;
  readonly yes: boolean;
  readonly json: boolean;
}

export interface UninstallReceiptEntry {
  readonly ref: string;
  readonly dir: string;
}

export interface UninstallActionResult {
  readonly removed: UninstallReceiptEntry[];
  readonly skipped: UninstallReceiptEntry[];
}

async function pathExists(p: string): Promise<boolean> {
  try {
    await stat(p);
    return true;
  } catch {
    return false;
  }
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

async function runInteractive(
  registryRoot: string,
  skipConfirm: boolean,
): Promise<UninstallReceiptEntry[]> {
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

  const removed: UninstallReceiptEntry[] = [];
  for (const pick of picks) {
    await removeAndPrune(pick.dir, registryRoot);
    removed.push({
      ref: `${pick.namespace}/${pick.name}@${pick.version}`,
      dir: pick.dir,
    });
  }
  return removed;
}

export async function runUninstallAction(
  args: UninstallActionArgs,
): Promise<UninstallActionResult> {
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
    return { removed, skipped: [] };
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
    if (clack.isCancel(ok) || ok === false) {
      return { removed: [], skipped: [{ ref: args.ref, dir }] };
    }
  }

  await removeAndPrune(dir, registryRoot);
  return { removed: [{ ref: args.ref, dir }], skipped: [] };
}
