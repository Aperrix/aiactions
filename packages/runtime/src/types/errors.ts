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
  constructor(message: string) {
    super(message);
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
