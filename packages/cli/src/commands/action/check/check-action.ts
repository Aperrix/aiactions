import { readdir } from "node:fs/promises";
import { isAbsolute, join, resolve } from "node:path";

import { NotFoundError, UsageError } from "../../../_shared/cli-error.ts";
import { checkManifest, type CheckResult } from "./check-manifest.ts";

const SKIP_SEGMENTS = new Set(["node_modules", ".git", "dist"]);

async function walkActionManifests(root: string): Promise<string[]> {
  const out: string[] = [];
  const entries = await readdir(root, { recursive: true, withFileTypes: true });
  for (const entry of entries) {
    if (!entry.isFile()) continue;
    if (entry.name !== "aiaction.yaml") continue;
    const parent = (entry as unknown as { parentPath?: string }).parentPath ?? root;
    const segments = parent.split(/[/\\]/);
    if (segments.some((s) => SKIP_SEGMENTS.has(s))) continue;
    out.push(join(parent, entry.name));
  }
  out.sort();
  return out;
}

export interface CheckActionArgs {
  readonly path: string | undefined;
  readonly all: boolean;
}

export async function runCheckAction(args: CheckActionArgs): Promise<CheckResult[]> {
  if (!args.path && !args.all) {
    throw new UsageError("expected exactly one of <path> or --all");
  }
  if (args.path && args.all) {
    throw new UsageError("<path> and --all are mutually exclusive");
  }

  const cwd = process.cwd();
  const targets: string[] = args.path
    ? [isAbsolute(args.path) ? args.path : resolve(cwd, args.path)]
    : await walkActionManifests(cwd);

  if (args.all && targets.length === 0) {
    throw new NotFoundError(`no aiaction.yaml found under ${cwd}`);
  }

  const results: CheckResult[] = [];
  for (const t of targets) {
    results.push(await checkManifest(t));
  }
  return results;
}
