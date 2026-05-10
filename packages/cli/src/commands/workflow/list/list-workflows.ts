import { discoverWorkflows } from "@aiactions/discovery";
import type { DiscoveryResult } from "@aiactions/discovery";

/**
 * Slice orchestrator for `aia workflow list`. Pass-through to
 * `discoverWorkflows()` — the receipt does all formatting work.
 */
export async function runListWorkflow(): Promise<DiscoveryResult> {
  return discoverWorkflows();
}
