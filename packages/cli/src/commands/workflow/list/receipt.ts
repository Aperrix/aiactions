import type { DiscoveredWorkflow, DiscoveryError, DiscoveryResult } from "@aiactions/discovery";

function renderWorkflowLine(w: DiscoveredWorkflow): string {
  const head = `${w.name}  ${w.origin}  ${w.absolutePath}`;
  if (w.shadowed === undefined) return head;
  return `${head}  [shadowed by ${w.shadowed.origin}: ${w.shadowed.absolutePath}]`;
}

function renderErrorLine(e: DiscoveryError): string {
  return `${e.absolutePath}: ${e.kind}: ${e.message}`;
}

export function writeListReceipt(json: boolean, result: DiscoveryResult): void {
  if (json) {
    process.stdout.write(`${JSON.stringify(result)}\n`);
    return;
  }

  if (result.workflows.length === 0 && result.errors.length === 0) {
    process.stderr.write("no workflows found\n");
    return;
  }

  for (const w of result.workflows) {
    process.stdout.write(`${renderWorkflowLine(w)}\n`);
  }
  if (result.errors.length > 0) {
    process.stdout.write("--\n");
    for (const e of result.errors) {
      process.stderr.write(`${renderErrorLine(e)}\n`);
    }
  }
}
