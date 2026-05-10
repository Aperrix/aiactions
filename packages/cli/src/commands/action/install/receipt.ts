import { isInteractive } from "../../../_shared/output.ts";
import type { InstallActionResult, InstallReceiptEntry } from "./install-action.ts";

function emitJsonOne(entry: InstallReceiptEntry): void {
  process.stdout.write(
    `${JSON.stringify({
      ref: entry.ref,
      dir: entry.dir,
      fetched: entry.fetched,
      resolvedVersion: entry.resolvedVersion,
      resolvedSha: entry.resolvedSha,
    })}\n`,
  );
}

function emitHumanOne(entry: InstallReceiptEntry, requestedVersion?: string): void {
  const tail =
    requestedVersion !== undefined && entry.resolvedVersion !== requestedVersion
      ? ` (resolved as ${entry.resolvedVersion})`
      : "";
  process.stderr.write(
    `${entry.fetched ? "✓ installed" : "✓ already cached"} ${entry.ref}${tail}\n`,
  );
}

export function writeInstallReceipt(json: boolean, result: InstallActionResult): void {
  const interactive = isInteractive(json);
  if (json) {
    for (const entry of result.entries) emitJsonOne(entry);
    return;
  }
  if (interactive) {
    return;
  }
  for (const entry of result.entries) emitHumanOne(entry);
}
