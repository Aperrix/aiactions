import type { CheckResult } from "./check-workflow.ts";

interface CheckJsonShape {
  readonly ok: boolean;
  readonly files: ReadonlyArray<CheckResult>;
}

function toJson(results: ReadonlyArray<CheckResult>): CheckJsonShape {
  return {
    ok: results.every((r) => r.ok),
    files: results,
  };
}

function renderHuman(results: ReadonlyArray<CheckResult>): string {
  const lines: string[] = [];
  let okCount = 0;
  let failCount = 0;
  for (const r of results) {
    if (r.ok) {
      lines.push(`✓ ${r.path}`);
      okCount++;
    } else {
      lines.push(`✗ ${r.path}`);
      for (const issue of r.errors) {
        lines.push(`    ${issue.kind}: ${issue.message}`);
      }
      failCount++;
    }
  }
  if (results.length > 1) {
    lines.push("");
    lines.push(`${results.length} file(s) checked — ${okCount} ok, ${failCount} failed`);
  }
  return lines.join("\n");
}

export function writeCheckReceipt(json: boolean, results: ReadonlyArray<CheckResult>): void {
  if (json) {
    process.stdout.write(`${JSON.stringify(toJson(results))}\n`);
    return;
  }
  process.stdout.write(`${renderHuman(results)}\n`);
}
