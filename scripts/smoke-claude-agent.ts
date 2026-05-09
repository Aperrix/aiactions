/**
 * Smoke driver for the claude/agent@v1 action.
 *
 * Drives runWorkflow() end-to-end against a minimal aiaction.yaml using the
 * real claude/agent runner; prints the typed RuntimeEvent stream so we can
 * eyeball the wire shape after runtime / registry / lockfile changes.
 *
 * Run with: bun scripts/smoke-claude-agent.ts
 */

import { runWorkflow } from "../packages/core/src/index.ts";
import { parseWorkflow } from "../packages/parser/src/index.ts";
import type { RuntimeEvent, StepResult } from "../packages/schema/src/index.ts";
import { dirname, join } from "node:path";

const REPO_ROOT = dirname(import.meta.dirname);
const WORKFLOW_FILE = join(REPO_ROOT, "workflows/examples/claude-agent.yaml");

function summariseEvent(event: RuntimeEvent): void {
  switch (event.kind) {
    case "workflow-started":
      console.log(`[workflow-started] at=${event.at}`);
      break;
    case "workflow-finished":
      console.log(`[workflow-finished] status=${event.status}`);
      break;
    case "job-started":
      console.log(`[job-started] job=${event.jobId}`);
      break;
    case "job-finished":
      console.log(`[job-finished] job=${event.jobId} status=${event.status}`);
      break;
    case "job-skipped":
      console.log(`[job-skipped] job=${event.jobId} reason=${event.reason}`);
      break;
    case "step-started":
      console.log(
        `[step-started] job=${event.jobId} step=${event.stepIndex} id=${event.stepId ?? "(none)"}`,
      );
      break;
    case "step-finished":
      console.log(
        `[step-finished] job=${event.jobId} step=${event.stepIndex} id=${event.stepId ?? "(none)"} status=${event.status} exit=${event.exitCode}`,
      );
      break;
    case "step-skipped":
      console.log(
        `[step-skipped] job=${event.jobId} step=${event.stepIndex} reason=${event.reason}`,
      );
      break;
    case "step-stdout":
      process.stdout.write(`[step-stdout] ${event.chunk}`);
      break;
    case "step-stderr":
      process.stderr.write(`[step-stderr] ${event.chunk}`);
      break;
    default: {
      // forward-compat guard
      const e = event as { kind: string };
      console.log(`[${e.kind}]`);
    }
  }
}

async function main(): Promise<void> {
  console.log("=== AIactions smoke test: claude/agent@v1 ===");
  console.log(`Workflow: ${WORKFLOW_FILE}`);
  console.log(`Cache:    ~/.aiactions/actions/claude/agent/v1`);
  console.log();

  const workflow = await parseWorkflow(WORKFLOW_FILE);
  console.log(
    `Parsed workflow: "${workflow.name}", jobs: ${Object.keys(workflow.jobs).join(", ")}`,
  );
  console.log();

  const result = await runWorkflow(workflow, {
    cwd: REPO_ROOT,
    workflowFile: WORKFLOW_FILE,
    onEvent: summariseEvent,
  });

  console.log();
  console.log("=== RunResult ===");
  console.log(JSON.stringify(result, null, 2));

  // Extract outputs from the smoke job
  const smokeJob = result.jobs["smoke"];
  if (smokeJob) {
    const askStep = smokeJob.steps.find((s: StepResult) => s.id === "ask");
    console.log();
    console.log("=== Step outputs (ask) ===");
    if (askStep) {
      // Outputs live in the step stdout as FD3 IPC; they're also in job outputs
      console.log("job outputs:", JSON.stringify(smokeJob.outputs, null, 2));
    } else {
      console.log("step 'ask' not found in results");
    }
  }

  process.exit(result.status === "succeeded" ? 0 : 1);
}

main().catch((err: unknown) => {
  console.error("SMOKE DRIVER FATAL:", err);
  process.exit(1);
});
