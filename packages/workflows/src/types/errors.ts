/**
 * Workflow error hierarchy. All errors thrown by `@aiactions/workflows`
 * extend `WorkflowError`, which carries a stable `code` field for
 * programmatic discrimination + an optional `cause` for chaining.
 *
 * Contents:
 * - `WorkflowErrorCode` const + type — enum of known error codes.
 * - `ValidationIssue` interface — per-issue payload from graph validation.
 * - `WorkflowError` base class.
 * - `WorkflowParseError` — file I/O or YAML syntax failure.
 * - `WorkflowSchemaError` — Zod schema (shape) failure.
 * - `WorkflowValidationError` — graph-invariant violation.
 */

/** Stable, programmatic discriminator for workflow errors. */
export const WorkflowErrorCode = {
  parse: "WORKFLOW_PARSE_ERROR",
  schema: "WORKFLOW_SCHEMA_ERROR",
  validation: "WORKFLOW_VALIDATION_ERROR",
} as const;

export type WorkflowErrorCode = (typeof WorkflowErrorCode)[keyof typeof WorkflowErrorCode];

/**
 * One graph-validation problem found in a workflow document.
 *
 * @see WorkflowValidationError — collection of these.
 */
export interface ValidationIssue {
  /** Key path inside the workflow file, deepest segment last. */
  readonly path: readonly (string | number)[];
  /** Human-facing one-line message, English, lowercase first letter. */
  readonly message: string;
  /** Stable invariant tag, e.g. `"CYCLE_DETECTED"`, `"DANGLING_NEED"`. */
  readonly code: string;
}

/**
 * Base class for every error thrown by `@aiactions/workflows`.
 *
 * @param message - Human-facing one-line description.
 * @param code - Stable, programmatic discriminator from `WorkflowErrorCode`.
 * @param options - Standard `ErrorOptions` (currently only `cause`).
 */
export class WorkflowError extends Error {
  readonly code: WorkflowErrorCode;

  constructor(message: string, code: WorkflowErrorCode, options?: { cause?: unknown }) {
    super(message, options);
    this.name = "WorkflowError";
    this.code = code;
  }
}

/**
 * File I/O or YAML syntax failure on a workflow / action manifest file.
 *
 * @throws Always wraps the underlying `NodeJS.ErrnoException` or
 *         `YAMLParseError` in `cause`.
 */
export class WorkflowParseError extends WorkflowError {
  constructor(message: string, options?: { cause?: unknown }) {
    super(message, WorkflowErrorCode.parse, options);
    this.name = "WorkflowParseError";
  }
}

/**
 * Zod schema validation failure: the YAML loaded successfully but the
 * resulting value does not conform to the expected shape (missing required
 * field, type mismatch, invalid enum value, …).
 *
 * @throws Always wraps the underlying `ZodError` in `cause`.
 */
export class WorkflowSchemaError extends WorkflowError {
  constructor(message: string, options?: { cause?: unknown }) {
    super(message, WorkflowErrorCode.schema, options);
    this.name = "WorkflowSchemaError";
  }
}

/**
 * Graph-invariant violation. The workflow shape is correct but one or more
 * cross-node relations break (cycle in `needs:`, dangling `needs:` target,
 * duplicate id, `steps:` / `uses:` mutual exclusion violation, etc.).
 * Carries every issue found in the same pass — does not short-circuit.
 */
export class WorkflowValidationError extends WorkflowError {
  readonly issues: readonly ValidationIssue[];

  constructor(message: string, issues: readonly ValidationIssue[], options?: { cause?: unknown }) {
    super(message, WorkflowErrorCode.validation, options);
    this.name = "WorkflowValidationError";
    this.issues = issues;
  }
}
