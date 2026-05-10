import type { RunResult, RuntimeEvent } from "@aiactions/schema";

export interface Receipt {
  /** Render a single runtime event. Synchronous (matches `RunOptions.onEvent`). */
  readonly emit: (event: RuntimeEvent) => void;
  /** Final summary line. Must be called once after the run completes. */
  readonly finalize: (result: RunResult, cancelled: boolean) => void;
}

export function makeReceipt(json: boolean): Receipt {
  if (json) return makeJsonReceipt();
  return makePrettyReceipt();
}

function makeJsonReceipt(): Receipt {
  return {
    emit(event) {
      process.stdout.write(`${JSON.stringify(event)}\n`);
    },
    finalize() {
      // No-op: `workflow-finished` was already emitted as the last event.
    },
  };
}

interface JobStartTimes {
  [jobId: string]: number;
}

interface StepStartTimes {
  [stepKey: string]: number;
}

function stepKey(jobId: string, stepIndex: number): string {
  return `${jobId}#${stepIndex}`;
}

function makePrettyReceipt(): Receipt {
  const jobStartedAt: JobStartTimes = {};
  const stepStartedAt: StepStartTimes = {};

  const writeStderr = (line: string): void => {
    process.stderr.write(`${line}\n`);
  };

  return {
    emit(event) {
      switch (event.kind) {
        case "workflow-started":
          writeStderr(`▶ Workflow run @ ${new Date(event.at).toISOString()}`);
          return;
        case "workflow-finished":
          writeStderr(`✓ Run ${event.status}`);
          return;
        case "job-started":
          jobStartedAt[event.jobId] = event.at;
          writeStderr(`  ▶ Job ${event.jobId}`);
          return;
        case "job-finished": {
          const start = jobStartedAt[event.jobId] ?? event.at;
          const duration = event.at - start;
          const marker = event.status === "succeeded" ? "✓" : "✗";
          writeStderr(`  ${marker} Job ${event.jobId} (${duration}ms)`);
          return;
        }
        case "job-skipped":
          writeStderr(`  ▼ Job ${event.jobId} skipped — ${event.reason}`);
          return;
        case "step-started": {
          stepStartedAt[stepKey(event.jobId, event.stepIndex)] = event.at;
          const label = event.stepId ?? `#${event.stepIndex}`;
          writeStderr(`    ▶ Step ${label}`);
          return;
        }
        case "step-finished": {
          const key = stepKey(event.jobId, event.stepIndex);
          const start = stepStartedAt[key] ?? event.at;
          const duration = event.at - start;
          const marker = event.status === "succeeded" ? "✓" : "✗";
          const label = event.stepId ?? `#${event.stepIndex}`;
          writeStderr(`    ${marker} Step ${label} (${duration}ms, exit ${event.exitCode ?? "?"})`);
          return;
        }
        case "step-skipped": {
          const label = event.stepId ?? `#${event.stepIndex}`;
          writeStderr(`    ▼ Step ${label} skipped — ${event.reason}`);
          return;
        }
        case "step-stdout":
          process.stdout.write(event.chunk);
          return;
        case "step-stderr":
          process.stderr.write(event.chunk);
          return;
      }
    },
    finalize(result, cancelled) {
      const totalJobs = Object.keys(result.jobs).length;
      const duration = result.finishedAt - result.startedAt;
      if (cancelled) {
        const skipped = Object.values(result.jobs).filter((j) => j.status === "skipped").length;
        writeStderr(`▼ Cancelled — ${skipped} jobs skipped`);
        return;
      }
      if (result.status === "failed") {
        const failed = Object.values(result.jobs).filter((j) => j.status === "failed").length;
        writeStderr(
          `✗ Run failed — ${totalJobs} ${totalJobs === 1 ? "job" : "jobs"} (${failed} failed)`,
        );
        return;
      }
      writeStderr(
        `✓ Run succeeded — ${totalJobs} ${totalJobs === 1 ? "job" : "jobs"} in ${duration}ms`,
      );
    },
  };
}
