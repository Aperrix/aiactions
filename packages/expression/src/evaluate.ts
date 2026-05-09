/**
 * Minimal `${{ }}` expression evaluator. Resolves a string that may
 * contain interspersed literals and `${{ <body> }}` segments into a
 * fully substituted string.
 *
 * Body grammar (MS1.1):
 * - `<context>.<key>` — `env`, `inputs`. The named key must be
 *   defined in the corresponding context map.
 * - `steps.<step-id>.outputs.<output-key>` — looks up the output of a
 *   previously-completed step in the same job. Unknown step id =
 *   ExpressionError; known step but missing output = empty string
 *   (GHA-faithful, the GHA semantics are intentional for outputs:
 *   missing values often signal a step that conditionally emitted).
 *
 * Other forms (operators, function calls, quoted literals, nested
 * access) raise ExpressionError so the failure surface stays
 * predictable instead of silently resolving to undefined.
 *
 * Contents:
 * - `EvalContext` — the resolution data the caller hands in.
 * - `evaluateExpression(input, context)` — main entry point.
 */

import { ExpressionTokenKind, tokenizeExpression } from "@aiactions/schema";

import { ExpressionError } from "./errors.ts";

/** Per-step outputs accumulated by the runner. The evaluator only
 * needs the read shape; the runner owns the write shape. */
export interface StepOutputContext {
  readonly outputs: Readonly<Record<string, string>>;
}

/** Resolution context handed to `evaluateExpression`. */
export interface EvalContext {
  /** Effective environment for the current step (already merged by the
   * runner from workflow / job / step `env:` blocks). */
  readonly env: Readonly<Record<string, string>>;
  /** Workflow inputs, already coerced to string form. */
  readonly inputs: Readonly<Record<string, string>>;
  /** Per-step outputs, keyed by `step.id`. Steps without an `id` and
   * steps that have not run yet are absent from the map. */
  readonly steps?: Readonly<Record<string, StepOutputContext>>;
}

const TWO_PART_RE = /^([a-z]+)\.([A-Za-z_][A-Za-z0-9_-]*)$/;
const STEPS_RE = /^steps\.([A-Za-z_][A-Za-z0-9_-]*)\.outputs\.([A-Za-z_][A-Za-z0-9_-]*)$/;

const formatBodyError = (body: string): string =>
  `invalid expression body '${body}': supported forms are '<context>.<key>' (env, inputs) and 'steps.<id>.outputs.<key>'`;

/**
 * Evaluate a string that may contain `${{ ... }}` segments.
 *
 * @throws {ExpressionError} when the body's grammar does not
 *   match a supported form, the context is unknown, or a referenced
 *   step id is not declared in the workflow.
 */
export function evaluateExpression(input: string, context: EvalContext): string {
  const tokens = tokenizeExpression(input);
  let out = "";
  for (const token of tokens) {
    if (token.kind === ExpressionTokenKind.literal) {
      out += token.value;
      continue;
    }
    out += resolveBody(token.value, context);
  }
  return out;
}

const resolveBody = (body: string, context: EvalContext): string => {
  const stepsMatch = STEPS_RE.exec(body);
  if (stepsMatch) {
    const [, stepId, outputKey] = stepsMatch;
    if (stepId === undefined || outputKey === undefined) {
      throw new ExpressionError(formatBodyError(body));
    }
    const stepCtx = context.steps?.[stepId];
    if (stepCtx === undefined) {
      throw new ExpressionError(`unknown step id 'steps.${stepId}'`);
    }
    return stepCtx.outputs[outputKey] ?? "";
  }

  const twoPartMatch = TWO_PART_RE.exec(body);
  if (!twoPartMatch) {
    throw new ExpressionError(formatBodyError(body));
  }
  const [, ctxName, key] = twoPartMatch;
  if (ctxName === undefined || key === undefined) {
    throw new ExpressionError(formatBodyError(body));
  }

  if (ctxName === "env") {
    const value = context.env[key];
    if (value === undefined) {
      throw new ExpressionError(`env.${key} is not defined`);
    }
    return value;
  }
  if (ctxName === "inputs") {
    const value = context.inputs[key];
    if (value === undefined) {
      throw new ExpressionError(`inputs.${key} is not defined`);
    }
    return value;
  }
  throw new ExpressionError(
    `context '${ctxName}' is not supported (available: env, inputs, steps)`,
  );
};
