import type { CheckResult } from "./check-manifest.ts";
import { formatIssue } from "./format-issues.ts";

interface CheckJsonShape {
  readonly ok: boolean;
  readonly files: ReadonlyArray<{
    readonly path: string;
    readonly ok: boolean;
    readonly errors: ReadonlyArray<{ zodPath: string; message: string }>;
    readonly warnings: ReadonlyArray<{ zodPath: string; message: string }>;
  }>;
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
    const rel = r.path;
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

export function writeCheckReceipt(json: boolean, results: CheckResult[]): void {
  if (json) {
    process.stdout.write(`${JSON.stringify(toJson(results))}\n`);
    return;
  }
  const { stdout, stderr } = renderHuman(results);
  for (const line of stdout) process.stdout.write(`${line}\n`);
  for (const line of stderr) process.stderr.write(`${line}\n`);
}
