import type { UninstallActionResult } from "./uninstall-action.ts";

export function writeUninstallReceipt(json: boolean, result: UninstallActionResult): void {
  if (json) {
    process.stdout.write(
      `${JSON.stringify({ removed: result.removed, skipped: result.skipped })}\n`,
    );
    return;
  }
  for (const r of result.removed) {
    process.stderr.write(`✓ removed ${r.ref}\n`);
  }
}
