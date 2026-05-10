import { readdir } from "node:fs/promises";
import { isAbsolute, join, resolve } from "node:path";

import { defineCommand } from "citty";

import { checkManifest, type CheckResult } from "../../lib/check-manifest.ts";
import { NotFoundError, UsageError } from "../../_shared/cli-error.ts";
import { EXIT } from "../../_shared/exit-codes.ts";
import { formatIssue } from "../../lib/format-issues.ts";

const SKIP_SEGMENTS = new Set(["node_modules", ".git", "dist"]);

interface CheckJsonShape {
  readonly ok: boolean;
  readonly files: ReadonlyArray<{
    readonly path: string;
    readonly ok: boolean;
    readonly errors: ReadonlyArray<{ zodPath: string; message: string }>;
    readonly warnings: ReadonlyArray<{ zodPath: string; message: string }>;
  }>;
}

async function walkActionManifests(root: string): Promise<string[]> {
  const out: string[] = [];
  const entries = await readdir(root, { recursive: true, withFileTypes: true });
  for (const entry of entries) {
    if (!entry.isFile()) continue;
    if (entry.name !== "aiaction.yaml") continue;
    // entry.parentPath is set by Node 22 readdir on recursive walks.
    const parent = (entry as unknown as { parentPath?: string }).parentPath ?? root;
    const segments = parent.split(/[/\\]/);
    if (segments.some((s) => SKIP_SEGMENTS.has(s))) continue;
    out.push(join(parent, entry.name));
  }
  out.sort();
  return out;
}

function toJson(results: CheckResult[]): CheckJsonShape {
  return {
    ok: results.every((r) => r.ok),
    files: results.map((r) => ({
      path: r.path,
      ok: r.ok,
      errors: r.errors,
      warnings: r.warnings,
    })),
  };
}

function renderHuman(results: CheckResult[]): { stdout: string[]; stderr: string[] } {
  const stdout: string[] = [];
  const stderr: string[] = [];
  let valid = 0;
  let invalid = 0;
  for (const r of results) {
    const rel = r.path; // formatIssue handles per-line relativization
    if (r.ok) {
      stdout.push(`✓ ${rel} — manifest valid`);
      valid++;
    } else {
      stderr.push(`✗ ${rel} — ${r.errors.length} error${r.errors.length === 1 ? "" : "s"}`);
      for (const issue of r.errors) {
        stderr.push(`  ${formatIssue(issue, r.path)}`);
      }
      invalid++;
    }
  }
  if (results.length > 1) {
    stdout.push(`Summary: ${valid} valid, ${invalid} invalid`);
  }
  return { stdout, stderr };
}

export const checkCommand = defineCommand({
  meta: {
    name: "check",
    description: "Validate one or many aiaction.yaml manifests against actionManifestSchema",
  },
  args: {
    path: {
      type: "positional",
      description: "Path to a single aiaction.yaml",
      required: false,
    },
    all: {
      type: "boolean",
      description: "Validate every aiaction.yaml under the current directory",
      default: false,
    },
    json: {
      type: "boolean",
      description: "Emit machine-readable JSON instead of human output",
      default: false,
    },
  },
  async run({ args }) {
    const path = typeof args.path === "string" ? args.path : undefined;
    const all = args.all === true;
    const json = args.json === true;

    if (!path && !all) {
      throw new UsageError("expected exactly one of <path> or --all");
    }
    if (path && all) {
      throw new UsageError("<path> and --all are mutually exclusive");
    }

    const cwd = process.cwd();
    const targets: string[] = path
      ? [isAbsolute(path) ? path : resolve(cwd, path)]
      : await walkActionManifests(cwd);

    if (all && targets.length === 0) {
      throw new NotFoundError(`no aiaction.yaml found under ${cwd}`);
    }

    const results: CheckResult[] = [];
    for (const t of targets) {
      results.push(await checkManifest(t));
    }

    const allOk = results.every((r) => r.ok);

    if (json) {
      process.stdout.write(`${JSON.stringify(toJson(results))}\n`);
      if (!allOk) process.exit(EXIT.SCHEMA);
      return;
    }

    const { stdout, stderr } = renderHuman(results);
    for (const line of stdout) process.stdout.write(`${line}\n`);
    for (const line of stderr) process.stderr.write(`${line}\n`);
    if (!allOk) process.exit(EXIT.SCHEMA);
  },
});
