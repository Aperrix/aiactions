/**
 * Minimal `${{ }}` expression evaluator for MS1.0. Resolves a string
 * that may contain interspersed literals and `${{ <body> }}` segments
 * into a fully substituted string.
 *
 * Scope intentionally narrow:
 * - Body grammar = `<context>.<key>` exactly. Two contexts are
 *   supported: `env` and `inputs`. Every other context (`steps`,
 *   `github`, `matrix`, `secrets`, ...) is rejected with
 *   `ExpressionEvalError`. The runtime cannot make those contexts
 *   available in MS1.0 because the runner does not yet capture step
 *   outputs (MS1.x), nor model the GHA event payload (out of scope
 *   for a local runtime).
 * - No operators, no function calls, no quoted literals, no nested
 *   access (`env.A.B`). All of those raise `ExpressionEvalError` so
 *   the failure surface stays predictable instead of silently
 *   resolving to `undefined`.
 *
 * The wrapping `${{ }}` parsing is delegated to
 * `tokenizeExpression` from `@aiactions/workflows` — that module
 * already understands escapes, nesting and unterminated bodies.
 *
 * Contents:
 * - `EvalContext` — the resolution data the caller hands in.
 * - `evaluateExpression(input, context)` — main entry point.
 */

import { ExpressionTokenKind, tokenizeExpression } from "@aiactions/workflows";

import { ExpressionEvalError } from "../types/errors.ts";

/** Resolution context handed to `evaluateExpression`. */
export interface EvalContext {
  /** Effective environment for the current step (already merged by the
   * runner from workflow / job / step `env:` blocks). */
  readonly env: Readonly<Record<string, string>>;
  /** Workflow inputs, already coerced to string form. */
  readonly inputs: Readonly<Record<string, string>>;
}

/** Body grammar accepted by MS1.0: `<context>.<key>`, no nesting. */
const BODY_RE = /^([a-z]+)\.([A-Za-z_][A-Za-z0-9_]*)$/;

const supportedContexts = new Set(["env", "inputs"]);

const formatBodyError = (body: string): string =>
  `invalid expression body '${body}': MS1.0 only supports '<context>.<key>' (e.g. \${{ env.X }}, \${{ inputs.Y }})`;

/**
 * Evaluate a string that may contain `${{ ... }}` segments.
 *
 * @param input - Raw expression-string value. May be a pure literal
 *   (returned verbatim), a single `${{ <body> }}`, or a mix.
 * @param context - Resolution data: effective `env` and `inputs`
 *   maps.
 * @returns The string with every `${{ }}` segment replaced by the
 *   resolved value of its body. Literal segments are preserved
 *   verbatim.
 * @throws {ExpressionEvalError} when (a) the body's grammar does not
 *   match `<context>.<key>`, (b) the context is not one of `env` /
 *   `inputs`, or (c) the requested key does not exist in the
 *   provided context map.
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

/**
 * Resolve a single `${{ <body> }}` body. Validates the grammar,
 * narrows on the context name and reads the key. Errors are mapped
 * to `ExpressionEvalError` with messages naming the offending
 * fragment so the user can locate it in their YAML.
 */
const resolveBody = (body: string, context: EvalContext): string => {
  const match = BODY_RE.exec(body);
  if (!match) {
    throw new ExpressionEvalError(formatBodyError(body));
  }
  const [, ctxName, key] = match;
  // The regex guarantees both groups are present; assert for the type
  // narrower without adding a runtime branch.
  if (ctxName === undefined || key === undefined) {
    throw new ExpressionEvalError(formatBodyError(body));
  }
  if (!supportedContexts.has(ctxName)) {
    throw new ExpressionEvalError(
      `context '${ctxName}' is not supported in MS1.0 (available: env, inputs)`,
    );
  }
  if (ctxName === "env") {
    const value = context.env[key];
    if (value === undefined) {
      throw new ExpressionEvalError(`env.${key} is not defined`);
    }
    return value;
  }
  // ctxName === "inputs"
  const value = context.inputs[key];
  if (value === undefined) {
    throw new ExpressionEvalError(`inputs.${key} is not defined`);
  }
  return value;
};
