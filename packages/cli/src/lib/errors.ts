import { EXIT, type ExitCode } from "./exit-codes.ts";

/**
 * Base error type carrying a process exit code. The top-level CLI
 * handler maps `code` to `process.exit()` and surfaces `cause` only
 * when AIA_DEBUG is set.
 */
export class CliError extends Error {
  public readonly code: ExitCode;
  public override readonly cause?: unknown;

  constructor(code: ExitCode, message: string, cause?: unknown) {
    super(message);
    this.name = "CliError";
    this.code = code;
    this.cause = cause;
  }
}

/** Thrown for malformed argv, refused destructive ops in non-TTY, etc. */
export class UsageError extends CliError {
  constructor(message: string) {
    super(EXIT.USAGE, message);
    this.name = "UsageError";
  }
}

/** Thrown when a referenced cache entry does not exist on disk. */
export class NotFoundError extends CliError {
  constructor(message: string) {
    super(EXIT.NOT_FOUND, message);
    this.name = "NotFoundError";
  }
}

/** Thrown when the registry HTTP fetch fails (network, non-2xx, timeout). */
export class RegistryFetchError extends CliError {
  constructor(message: string, cause?: unknown) {
    super(EXIT.REGISTRY, message, cause);
    this.name = "RegistryFetchError";
  }
}

/** Thrown when the fetched registry JSON is malformed or fails Zod validation. */
export class RegistryValidationError extends CliError {
  constructor(message: string, cause?: unknown) {
    super(EXIT.REGISTRY, message, cause);
    this.name = "RegistryValidationError";
  }
}
