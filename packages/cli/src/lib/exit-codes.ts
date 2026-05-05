/**
 * Process exit codes used by `aia`. Aligned with sysexits convention
 * (0 = OK, 2 = USAGE, 4 = data not found) plus a custom CONFLICT slot
 * reserved for future install/overwrite flows.
 */
export const EXIT = {
  OK: 0,
  RUNTIME: 1,
  USAGE: 2,
  NOT_FOUND: 4,
  CONFLICT: 5,
} as const;

export type ExitCode = (typeof EXIT)[keyof typeof EXIT];
