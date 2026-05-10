import type { JobResult, RunResult, RuntimeEvent } from "@aiactions/schema";
import { afterEach, beforeEach, describe, expect, it, vi } from "vite-plus/test";

import { makeReceipt } from "../../../../src/commands/workflow/run/receipt.ts";

let stdout = "";
let stderr = "";

beforeEach(() => {
  stdout = "";
  stderr = "";
  vi.spyOn(process.stdout, "write").mockImplementation(((chunk: unknown) => {
    stdout += String(chunk);
    return true;
  }) as typeof process.stdout.write);
  vi.spyOn(process.stderr, "write").mockImplementation(((chunk: unknown) => {
    stderr += String(chunk);
    return true;
  }) as typeof process.stderr.write);
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("Receipt — pretty mode", () => {
  it("renders workflow-started on stderr", () => {
    const r = makeReceipt(false);
    r.emit({ kind: "workflow-started", at: 0 });
    expect(stderr).toContain("▶ Workflow run @");
    expect(stdout).toBe("");
  });

  it("renders job-started / job-finished succeeded on stderr with duration", () => {
    const r = makeReceipt(false);
    r.emit({ kind: "job-started", at: 100, jobId: "hello" });
    r.emit({ kind: "job-finished", at: 130, jobId: "hello", status: "succeeded" });
    expect(stderr).toContain("▶ Job hello");
    expect(stderr).toContain("✓ Job hello (30ms)");
    expect(stdout).toBe("");
  });

  it("renders job-finished failed with ✗", () => {
    const r = makeReceipt(false);
    r.emit({ kind: "job-started", at: 100, jobId: "x" });
    r.emit({ kind: "job-finished", at: 110, jobId: "x", status: "failed" });
    expect(stderr).toContain("✗ Job x (10ms)");
  });

  it("renders job-skipped with ▼ + reason on stderr", () => {
    const r = makeReceipt(false);
    r.emit({ kind: "job-skipped", at: 0, jobId: "x", reason: "needs failed" });
    expect(stderr).toContain("▼ Job x skipped — needs failed");
  });

  it("renders step-started on stderr (uses stepId when present)", () => {
    const r = makeReceipt(false);
    r.emit({ kind: "step-started", at: 0, jobId: "j", stepIndex: 0, stepId: "say-hi" });
    expect(stderr).toContain("▶ Step say-hi");
  });

  it("renders step-started on stderr (falls back to stepIndex when stepId is undefined)", () => {
    const r = makeReceipt(false);
    r.emit({ kind: "step-started", at: 0, jobId: "j", stepIndex: 2, stepId: undefined });
    expect(stderr).toContain("▶ Step #2");
  });

  it("renders step-finished succeeded with duration + exit code", () => {
    const r = makeReceipt(false);
    r.emit({ kind: "step-started", at: 0, jobId: "j", stepIndex: 0, stepId: "s" });
    r.emit({
      kind: "step-finished",
      at: 50,
      jobId: "j",
      stepIndex: 0,
      stepId: "s",
      status: "succeeded",
      exitCode: 0,
    });
    expect(stderr).toContain("✓ Step s (50ms, exit 0)");
  });

  it("renders step-finished failed with ✗", () => {
    const r = makeReceipt(false);
    r.emit({ kind: "step-started", at: 0, jobId: "j", stepIndex: 0, stepId: "s" });
    r.emit({
      kind: "step-finished",
      at: 80,
      jobId: "j",
      stepIndex: 0,
      stepId: "s",
      status: "failed",
      exitCode: 1,
    });
    expect(stderr).toContain("✗ Step s (80ms, exit 1)");
  });

  it("forwards step-stdout chunks verbatim to stdout (no decoration)", () => {
    const r = makeReceipt(false);
    r.emit({ kind: "step-stdout", at: 0, jobId: "j", stepIndex: 0, chunk: "hi\n" });
    expect(stdout).toBe("hi\n");
  });

  it("forwards step-stderr chunks verbatim to stderr (no decoration)", () => {
    const r = makeReceipt(false);
    r.emit({ kind: "step-stderr", at: 0, jobId: "j", stepIndex: 0, chunk: "boom\n" });
    expect(stderr).toBe("boom\n");
  });

  it("renders workflow-finished succeeded summary on stderr", () => {
    const r = makeReceipt(false);
    r.emit({ kind: "workflow-finished", at: 0, status: "succeeded" });
    expect(stderr).toContain("✓ Run succeeded");
  });

  it("finalize(succeeded) — already emitted via workflow-finished, summary line uses jobs count + duration", () => {
    const r = makeReceipt(false);
    const result: RunResult = {
      status: "succeeded",
      jobs: { hello: makeJob("succeeded") },
      startedAt: 0,
      finishedAt: 100,
    };
    r.finalize(result, false);
    expect(stderr).toContain("✓ Run succeeded — 1 job in 100ms");
  });

  it("finalize(failed) — counts failed jobs in the summary", () => {
    const r = makeReceipt(false);
    const result: RunResult = {
      status: "failed",
      jobs: {
        a: makeJob("succeeded"),
        b: makeJob("failed"),
      },
      startedAt: 0,
      finishedAt: 200,
    };
    r.finalize(result, false);
    expect(stderr).toContain("✗ Run failed — 2 jobs (1 failed)");
  });

  it("finalize(cancelled=true) — overrides with cancelled summary", () => {
    const r = makeReceipt(false);
    const result: RunResult = {
      status: "succeeded",
      jobs: { a: makeJob("skipped"), b: makeJob("skipped") },
      startedAt: 0,
      finishedAt: 100,
    };
    r.finalize(result, true);
    expect(stderr).toContain("▼ Cancelled — 2 jobs skipped");
  });
});

describe("Receipt — JSON mode", () => {
  it("emits NDJSON for every event on stdout, nothing on stderr", () => {
    const r = makeReceipt(true);
    const events: RuntimeEvent[] = [
      { kind: "workflow-started", at: 0 },
      { kind: "job-started", at: 1, jobId: "hello" },
      { kind: "step-stdout", at: 2, jobId: "hello", stepIndex: 0, chunk: "hi\n" },
      { kind: "workflow-finished", at: 3, status: "succeeded" },
    ];
    for (const e of events) r.emit(e);
    expect(stderr).toBe("");
    const lines = stdout.trim().split("\n");
    expect(lines).toHaveLength(4);
    expect(JSON.parse(lines[0]!).kind).toBe("workflow-started");
    expect(JSON.parse(lines[2]!).chunk).toBe("hi\n");
    expect(JSON.parse(lines[3]!).status).toBe("succeeded");
  });

  it("finalize is a no-op in JSON mode (workflow-finished already emitted)", () => {
    const r = makeReceipt(true);
    const result: RunResult = {
      status: "succeeded",
      jobs: { hello: makeJob("succeeded") },
      startedAt: 0,
      finishedAt: 10,
    };
    r.finalize(result, false);
    expect(stdout).toBe("");
    expect(stderr).toBe("");
  });
});

function makeJob(status: "succeeded" | "failed" | "skipped"): JobResult {
  return {
    status,
    steps: [],
    outputs: {},
    startedAt: 0,
    finishedAt: 0,
  };
}
