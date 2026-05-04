/**
 * Runtime error hierarchy. `RuntimeError` is the abstract base used to
 * tag every error raised from inside `runWorkflow`; concrete subclasses
 * indicate which layer raised the error so callers can `instanceof`-narrow
 * at the boundary.
 *
 * Distinct from `WorkflowError` shipped by `@aiactions/workflows`: those
 * are raised before a process is ever spawned (parse / schema / topology),
 * while these are raised during execution.
 *
 * Contents:
 * - `RuntimeError` — abstract base.
 * - `RuntimeUnsupportedError` — feature accepted by the schema but not
 *   yet implemented in the current milestone.
 * - `StepFailedError` — non-zero exit translated into a hard error when
 *   no `continue-on-error` semantics apply (MS1.0 always treats non-zero
 *   as fatal).
 * - `ExpressionEvalError` — minimal MS1.0 evaluator could not resolve
 *   an `${{ }}` expression (unsupported context, undefined variable).
 */

/** Abstract base for every runtime-side error. */
export abstract class RuntimeError extends Error {
  override readonly name: string;
  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = new.target.name;
  }
}

/** Raised when a workflow uses a feature that is accepted by the schema
 * but not yet implemented by the runtime (e.g. `pwsh` shell, `${{ steps.x.outputs.y }}`,
 * `uses:` execution). The message must name the unsupported feature. */
export class RuntimeUnsupportedError extends RuntimeError {}

/** Raised when a step exits non-zero and the runner cannot recover. */
export class StepFailedError extends RuntimeError {}

/** Raised when the minimal MS1.0 expression evaluator cannot resolve an
 * `${{ }}` body (unknown context, undefined variable, unsupported operator). */
export class ExpressionEvalError extends RuntimeError {}

/**
 * Raised when a `uses:` ref cannot be resolved to an on-disk action
 * directory (registry namespace+name not found, local path absent, etc.).
 * The message must name the offending ref.
 */
export class ActionResolutionError extends RuntimeError {}

/**
 * Raised when an action's `aiaction.yaml` is missing, unreadable, malformed,
 * or fails schema validation. Wraps the underlying `WorkflowParseError` /
 * `WorkflowSchemaError` via `cause` when available.
 */
export class ActionManifestError extends RuntimeError {}

/**
 * Raised when the FD3 output protocol receives a frame that is invalid
 * JSON, exceeds the 1 MiB line cap, or carries an unknown `type`. The
 * runtime logs the offending line, drops it, and continues — but the
 * error is still constructed so the run can surface it via a warning
 * event when one becomes available.
 */
export class ActionProtocolError extends RuntimeError {}
