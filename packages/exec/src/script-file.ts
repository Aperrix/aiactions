/**
 * Writes a step's `run:` body to a temporary script file that the
 * runtime can hand to a shell. Allocates a per-run subdirectory under
 * `os.tmpdir()` so concurrent runs do not race on filenames; on POSIX
 * that subdirectory is `chmod 700`-ed to keep peer users out (cosmetic
 * on Windows, which has no equivalent ACL by default).
 *
 * Files are NOT cleaned up automatically — the caller (job runner)
 * owns the lifecycle and unlinks each per-step file once the step has
 * exited. The returned `cleanup` is idempotent: a second call after a
 * successful unlink (e.g. from a try/finally and an abort signal)
 * silently ignores `ENOENT`.
 *
 * Contents:
 * - `ScriptFile` — `{ path, cleanup }`.
 * - `writeScript(body, runId, stepIndex, extension, platform)` — async
 *   factory.
 */

import { mkdir, unlink, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

/** Tmpfile handle returned by `writeScript`. */
export interface ScriptFile {
  /** Absolute path of the written script file. */
  readonly path: string;
  /** Best-effort, idempotent cleanup; ignores ENOENT. */
  readonly cleanup: () => Promise<void>;
}

/**
 * Write `body` to a tmpfile and return its path plus a cleanup hook.
 *
 * @param body - The shell script source (UTF-8). Not validated here —
 *   the schema layer guarantees it is non-empty and well-formed.
 * @param runId - Opaque per-run identifier; used as the tmp
 *   subdirectory name. Callers must produce a unique value per run
 *   (e.g. via `crypto.randomUUID()`) so concurrent runs do not collide.
 * @param stepIndex - Zero-based step index inside the run; used to
 *   disambiguate filenames within the same run.
 * @param extension - Filename suffix matching the shell's expectation
 *   (`.sh`, `.ps1`, `.cmd`).
 * @param platform - Target platform; on POSIX the parent directory is
 *   `chmod 700`-ed and the file is created with mode `0o600`.
 * @returns A `ScriptFile` with absolute `path` and an idempotent
 *   `cleanup` hook.
 */
export async function writeScript(
  body: string,
  runId: string,
  stepIndex: number,
  extension: string,
  platform: NodeJS.Platform,
): Promise<ScriptFile> {
  const dir = join(tmpdir(), `aiactions-${runId}`);
  // `mode: 0o700` is honored on POSIX and ignored by Node on Windows.
  await mkdir(dir, { recursive: true, mode: 0o700 });
  const path = join(dir, `step-${stepIndex}${extension}`);
  // `mode: 0o600` is honored on POSIX and ignored on Windows. We pass
  // it unconditionally to keep the call shape uniform across platforms.
  await writeFile(path, body, { encoding: "utf8", mode: 0o600 });
  void platform;
  const cleanup = async (): Promise<void> => {
    try {
      await unlink(path);
    } catch (err) {
      const errno = (err as NodeJS.ErrnoException).code;
      if (errno !== "ENOENT") throw err;
    }
  };
  return { path, cleanup };
}
