import { spawn } from "node:child_process";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";

const BIN = resolve(process.cwd(), "bin/aia.mjs");

export interface CliRunResult {
  readonly exitCode: number;
  readonly stdout: string;
  readonly stderr: string;
}

/**
 * Spawn the built CLI as a child process and capture its stdio via
 * shell redirection to temporary files. Direct `pipe`-based capture is
 * unreliable under Vitest because consola/citty write asynchronously
 * just before the process ends and the parent never sees the buffered
 * data; redirecting through the kernel sidesteps that race.
 *
 * Requires `vp pack` to have produced `dist/main.mjs` first.
 */
export interface RunCliOptions {
  /** Override the spawned child's working directory. Defaults to a fresh
   * tmpdir so the CLI's lockfile writes never pollute the test cwd. */
  readonly cwd?: string;
}

export async function runCli(
  args: string[],
  env: NodeJS.ProcessEnv = {},
  options: RunCliOptions = {},
): Promise<CliRunResult> {
  const work = await mkdtemp(join(tmpdir(), "aia-runcli-"));
  const outPath = join(work, "stdout");
  const errPath = join(work, "stderr");
  const cwd = options.cwd ?? work;

  // Use minimal env (PATH + HOME only) so the spawned CLI runs under
  // vanilla Node. Vitest workers set NODE_ENV=test, NODE_OPTIONS, VITEST=true,
  // and a handful of internal `VITEST_*` / `VITE_*` markers; consola (citty's
  // logger) silences its output when it sees `NODE_ENV=test`, producing empty
  // stdout even though the CLI ran successfully.
  const baseEnv: NodeJS.ProcessEnv = {
    PATH: process.env.PATH,
    HOME: process.env.HOME,
    // Disable PostHog telemetry in tests — prevents real outbound HTTP from
    // the embedded write-only key during CI runs and keeps assertions
    // deterministic. Tests that exercise telemetry behaviour explicitly
    // override this in their per-call env.
    AIA_TELEMETRY_DISABLED: "1",
  };

  const argv = [BIN, ...args].map((a) => `'${a.replaceAll("'", "'\\''")}'`).join(" ");
  const cmd = `node ${argv} >${outPath} 2>${errPath}`;

  try {
    const exitCode = await new Promise<number>((resolveCode, rejectCode) => {
      const child = spawn("sh", ["-c", cmd], {
        env: { ...baseEnv, ...env },
        stdio: "ignore",
        cwd,
      });
      child.on("error", (err) => rejectCode(err));
      child.on("close", (code) => resolveCode(code ?? 0));
    });
    const [stdout, stderr] = await Promise.all([
      readFile(outPath, "utf8"),
      readFile(errPath, "utf8"),
    ]);
    return { exitCode, stdout, stderr };
  } finally {
    await rm(work, { recursive: true, force: true });
  }
}
