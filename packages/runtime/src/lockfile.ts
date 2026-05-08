import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { z } from "zod";

import type { RegistryCoordinate } from "./runner/uses/registry-fetch.ts";
import { LockfileVersionMismatch } from "./types/errors.ts";

const LOCKFILE_DIR = ".aiactions";
const LOCKFILE_FILE = "lock.json";
const CURRENT_VERSION = 2 as const;

/** A single pinned action entry. */
export interface LockfileEntry {
  readonly resolvedVersion: string;
  readonly resolvedSha: string;
}

/** The on-disk lockfile shape. */
export interface LockfileShape {
  readonly version: typeof CURRENT_VERSION;
  readonly actions: Record<string, LockfileEntry>;
}

/** Caller input for `upsertLockfileEntry`. */
export interface UpsertLockfileEntryRequest {
  readonly cwd: string;
  readonly ref: RegistryCoordinate;
  readonly resolvedVersion: string;
  readonly resolvedSha: string;
}

const lockfileEntrySchema = z
  .object({
    resolvedVersion: z.string().min(1),
    resolvedSha: z.string().min(1),
  })
  .strict();

const lockfileSchemaV2 = z
  .object({
    version: z.literal(CURRENT_VERSION),
    actions: z.record(z.string(), lockfileEntrySchema),
  })
  .strict();

const lockfilePath = (cwd: string): string => join(cwd, LOCKFILE_DIR, LOCKFILE_FILE);

const createEmpty = (): LockfileShape => ({ version: CURRENT_VERSION, actions: {} });

/**
 * Read `<cwd>/.aiactions/lock.json`. Returns an empty struct on any
 * recoverable parse error (missing file, malformed JSON, schema-shape
 * mismatch). Throws `LockfileVersionMismatch` when the file parses as
 * JSON but its `version` field disagrees with the current schema —
 * that's a meaningful upgrade event the caller should surface to the user.
 */
export async function readLockfile(cwd: string): Promise<LockfileShape> {
  const path = lockfilePath(cwd);
  let raw: string;
  try {
    raw = await readFile(path, "utf8");
  } catch (err) {
    const errno = err instanceof Error ? (err as NodeJS.ErrnoException).code : undefined;
    if (errno === "ENOENT") return createEmpty();
    throw err;
  }
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return createEmpty();
  }
  // Detect explicit version mismatch BEFORE the schema parse so we can
  // raise an actionable error instead of silently dropping the user's
  // pins. Other shape mismatches (missing fields, wrong types) keep
  // the soft-empty behaviour to recover from git merge conflict markers.
  if (
    typeof parsed === "object" &&
    parsed !== null &&
    "version" in parsed &&
    typeof (parsed as { version: unknown }).version === "number" &&
    (parsed as { version: number }).version !== CURRENT_VERSION
  ) {
    const got = (parsed as { version: number }).version;
    throw new LockfileVersionMismatch(
      `lockfile uses schema v${got}, expected v${CURRENT_VERSION}. Delete .aiactions/lock.json and re-run.`,
    );
  }
  const result = lockfileSchemaV2.safeParse(parsed);
  if (!result.success) return createEmpty();
  return result.data;
}

/**
 * Idempotent upsert. Reads the lockfile, sets/overwrites the entry for
 * the given ref, and writes the result back. Preserves all other entries.
 */
export async function upsertLockfileEntry(req: UpsertLockfileEntryRequest): Promise<void> {
  const lock = await readLockfile(req.cwd);
  const key = `${req.ref.namespace}/${req.ref.name}@${req.ref.version}`;
  const newActions: Record<string, LockfileEntry> = {
    ...lock.actions,
    [key]: { resolvedVersion: req.resolvedVersion, resolvedSha: req.resolvedSha },
  };
  await writeLockfile(req.cwd, { version: CURRENT_VERSION, actions: newActions });
}

/**
 * Write `<cwd>/.aiactions/lock.json` deterministically.
 *
 * - Creates the parent `.aiactions/` directory if missing.
 * - Sorts `actions` keys alphabetically.
 * - Emits 2-space-indented JSON with a trailing newline.
 *
 * Throws on any FS error (EACCES, EIO, disk full, …).
 */
export async function writeLockfile(cwd: string, lock: LockfileShape): Promise<void> {
  const path = lockfilePath(cwd);
  await mkdir(dirname(path), { recursive: true });

  const sortedActions: Record<string, LockfileEntry> = {};
  for (const key of Object.keys(lock.actions).sort()) {
    sortedActions[key] = lock.actions[key]!;
  }

  const sorted: LockfileShape = { version: lock.version, actions: sortedActions };
  const content = JSON.stringify(sorted, null, 2) + "\n";
  await writeFile(path, content, "utf8");
}
