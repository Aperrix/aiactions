/**
 * Root of the AIactions error hierarchy. `AIactionsError` is the abstract
 * base that every typed error in the system extends; concrete subclasses
 * live in the package that raises them (`ExpressionError` in
 * `@aiactions/expression`, `ExecError` in `@aiactions/exec`,
 * `RegistryError` + `RegistryFetchError`/`RegistryResolveError` in
 * `@aiactions/registry`, `RunnerError` + `JobError`/`StepError`/
 * `OrchestrationError` in `@aiactions/core`). The CLI catches
 * `AIactionsError` at the outermost boundary and maps the concrete
 * subclass to an exit code via the `EXIT` table — see spec section 10.1.
 *
 * The schema-side hierarchy below covers errors raised before any
 * process is spawned: parse, schema, and graph-invariant validation
 * failures. They carry a stable `code` field for programmatic
 * discrimination plus an optional `cause` for chaining.
 *
 * Contents:
 * - `AIactionsError` abstract base — parent of every typed error in AIactions.
 * - `WorkflowErrorCode` const + type — enum of known workflow error codes.
 * - `ValidationIssueCode` const + type — enum of graph-invariant codes.
 * - `ValidationIssue` interface — per-issue payload from graph validation.
 * - `WorkflowError` base class — extends `AIactionsError`.
 * - `WorkflowParseError` — file I/O or YAML syntax failure.
 * - `WorkflowSchemaError` — Zod schema (shape) failure.
 * - `WorkflowValidationError` — graph-invariant violation.
 */

/**
 * Abstract base class for every typed error raised inside AIactions
 * packages. Concrete subclasses live in the package that produces them
 * (`ExpressionError` in `@aiactions/expression`, `ExecError` in
 * `@aiactions/exec`, `RegistryError` in `@aiactions/registry`, etc.).
 *
 * Per spec section 10, the CLI catches `AIactionsError` at the outermost
 * boundary and maps the concrete subclass to an exit code via the
 * `EXIT` table — direct `instanceof` on a subclass is allowed inside a
 * brick that needs to enrich error context.
 */
export abstract class AIactionsError extends Error {
  override readonly name: string;
  constructor(message: string, options?: ErrorOptions) {
    if (new.target === AIactionsError) {
      throw new Error("AIactionsError is abstract; instantiate a concrete subclass");
    }
    super(message, options);
    this.name = new.target.name;
  }
}

/** Stable, programmatic discriminator for workflow errors. */
export const WorkflowErrorCode = {
  parse: "WORKFLOW_PARSE_ERROR",
  schema: "WORKFLOW_SCHEMA_ERROR",
  validation: "WORKFLOW_VALIDATION_ERROR",
} as const;

export type WorkflowErrorCode = (typeof WorkflowErrorCode)[keyof typeof WorkflowErrorCode];

/**
 * Stable, programmatic codes for graph-invariant violations carried in a
 * `ValidationIssue.code`. Useful to `switch` on the issue without parsing
 * the message.
 */
export const ValidationIssueCode = {
  cycleDetected: "CYCLE_DETECTED",
  danglingNeed: "DANGLING_NEED",
  emptyJobs: "EMPTY_JOBS",
} as const;

export type ValidationIssueCode = (typeof ValidationIssueCode)[keyof typeof ValidationIssueCode];

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
  /**
   * Stable invariant tag from `ValidationIssueCode` (e.g. `"CYCLE_DETECTED"`,
   * `"DANGLING_NEED"`, `"EMPTY_JOBS"`). Falls back to `"TOPOLOGY"` as a
   * safe default if a future check forgets to set its specific code.
   */
  readonly code: ValidationIssueCode | "TOPOLOGY";
}

/**
 * Base class for every error thrown by `@aiactions/workflows`.
 *
 * @param message - Human-facing one-line description.
 * @param code - Stable, programmatic discriminator from `WorkflowErrorCode`.
 * @param options - Standard `ErrorOptions` (currently only `cause`).
 */
export class WorkflowError extends AIactionsError {
  readonly code: WorkflowErrorCode;

  constructor(message: string, code: WorkflowErrorCode, options?: { cause?: unknown }) {
    super(message, options);
    this.code = code;
  }
}

/**
 * File I/O or YAML syntax failure on a workflow / action manifest file.
 * Always wraps the underlying `NodeJS.ErrnoException` or `YAMLParseError`
 * via the `cause` option.
 */
export class WorkflowParseError extends WorkflowError {
  constructor(message: string, options?: { cause?: unknown }) {
    super(message, WorkflowErrorCode.parse, options);
  }
}

/**
 * Zod schema validation failure: the YAML loaded successfully but the
 * resulting value does not conform to the expected shape (missing required
 * field, type mismatch, invalid enum value, …). Always wraps the
 * underlying `ZodError` via the `cause` option.
 */
export class WorkflowSchemaError extends WorkflowError {
  constructor(message: string, options?: { cause?: unknown }) {
    super(message, WorkflowErrorCode.schema, options);
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
    this.issues = issues;
  }
}
