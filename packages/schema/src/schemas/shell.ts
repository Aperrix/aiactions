/**
 * `${{ }}` expression tokenizer for AIactions workflow files. Splits an
 * input string into a sequence of literal and expression tokens. The
 * expression body is preserved verbatim (trimmed) — this module does NOT
 * parse the dotted-path syntax inside `${{ }}` and does NOT evaluate.
 *
 * Contents (expression section):
 * - `ExpressionTokenKind` const + type.
 * - `ExpressionToken` interface.
 * - `tokenizeExpression(input)` — main tokenizer; throws on malformed input.
 * - `containsExpression(input)` — cheap predicate.
 * - `expressionStringSchema` — Zod schema validating well-formedness.
 *
 * ---
 *
 * Zod schema for the `shell:` keyword on a step. The accepted shape is
 * GHA-faithful: either a built-in shell name (`bash | sh | pwsh | python
 * | cmd`) or a custom shell template string of the form
 * `<cmd> [opts] {0} [more_opts]`. When the author writes a template
 * verbatim — even if the first token matches a built-in name — the
 * runtime uses the template as-is and does not inject any default flags.
 *
 * Schema acceptance is broader than runtime support on purpose: the
 * runtime decides which shell it can actually drive on the current
 * platform.
 *
 * Contents (shell section):
 * - `BUILTIN_SHELLS` — readonly tuple of built-in shell names.
 * - `customShellTemplateRegex` — regex used by both schema and runtime
 *   to detect a template string.
 * - `shellSchema` — the union accepted at parse time.
 * - `Shell` — inferred output type (built-in name OR template string).
 */

import { z } from "zod";

// ---------------------------------------------------------------------------
// Expression tokenizer + schema
// ---------------------------------------------------------------------------

const OPEN = "${{";
const CLOSE = "}}";

/** Discriminator for `ExpressionToken`. */
export const ExpressionTokenKind = {
  literal: "literal",
  expression: "expression",
} as const;

export type ExpressionTokenKind = (typeof ExpressionTokenKind)[keyof typeof ExpressionTokenKind];

/**
 * One segment of a tokenized expression string.
 * - `literal`: `value` is the raw text outside any `${{ }}` block.
 * - `expression`: `value` is the trimmed body between `${{` and `}}`.
 */
export interface ExpressionToken {
  readonly kind: ExpressionTokenKind;
  readonly value: string;
}

/**
 * Tokenize an expression string into literal and expression segments.
 *
 * Empty input returns an empty array. Strings containing no `${{` return a
 * single `literal` token. Adjacent expressions and adjacent literals
 * remain separate tokens (no merging).
 *
 * Notes:
 * - Position offsets reported in error messages are UTF-16 code units
 *   (the same units `String.prototype.indexOf` works in). For inputs
 *   containing surrogate pairs, the column shown to the user may differ
 *   by 1 per surrogate pair.
 * - A stray `}}` outside any `${{ }}` block is treated as literal text
 *   (GHA-faithful) — it does not raise an unterminated error.
 *
 * @param input - The raw string to tokenize.
 * @returns Sequence of tokens, in source order.
 * @throws {Error} when `${{` has no matching `}}`, when a `${{ }}` body is
 *         empty after trimming, or when nesting is detected.
 *
 * @example
 * tokenizeExpression("echo ${{ env.X }} done");
 * // [
 * //   { kind: "literal",    value: "echo " },
 * //   { kind: "expression", value: "env.X" },
 * //   { kind: "literal",    value: " done" },
 * // ]
 */
export function tokenizeExpression(input: string): ExpressionToken[] {
  const tokens: ExpressionToken[] = [];
  if (input.length === 0) return tokens;

  let i = 0;
  while (i < input.length) {
    const open = input.indexOf(OPEN, i);
    if (open === -1) {
      tokens.push({ kind: ExpressionTokenKind.literal, value: input.slice(i) });
      break;
    }
    if (open > i) {
      tokens.push({ kind: ExpressionTokenKind.literal, value: input.slice(i, open) });
    }
    const bodyStart = open + OPEN.length;
    const close = input.indexOf(CLOSE, bodyStart);
    if (close === -1) {
      throw new Error(`unterminated '${OPEN}' at position ${open}`);
    }
    const body = input.slice(bodyStart, close);
    // Nested `${{` inside the body is rejected explicitly so authors get a
    // clearer error than "matched the wrong `}}`".
    if (body.includes(OPEN)) {
      throw new Error(`nested '${OPEN}' inside expression at position ${open}`);
    }
    const trimmed = body.trim();
    if (trimmed.length === 0) {
      throw new Error(`empty expression at position ${open}`);
    }
    tokens.push({ kind: ExpressionTokenKind.expression, value: trimmed });
    i = close + CLOSE.length;
  }
  return tokens;
}

/**
 * Cheap check for "may contain an expression". Useful as a fast-path guard
 * before calling `tokenizeExpression`.
 *
 * @param input - The string to inspect.
 * @returns `true` if `input` contains the `${{` opener at least once.
 */
export function containsExpression(input: string): boolean {
  return input.includes(OPEN);
}

/**
 * Zod schema for any string field that may contain `${{ }}` expressions.
 * Accepts any well-formed expression string (including pure literals) and
 * rejects malformed ones (unterminated, empty body, nested) with a clear
 * `custom`-coded issue.
 *
 * The schema does NOT validate the body of an expression — that belongs
 * to the evaluator (later milestone) which has the runtime context.
 */
export const expressionStringSchema = z.string().superRefine((value, ctx) => {
  try {
    tokenizeExpression(value);
  } catch (err) {
    ctx.addIssue({
      code: "custom",
      message: err instanceof Error ? err.message : "invalid expression string",
    });
  }
});

// ---------------------------------------------------------------------------
// Shell schema
// ---------------------------------------------------------------------------

/** Built-in shell names accepted as shorthand for the GHA-default invocation templates. */
export const BUILTIN_SHELLS = ["bash", "sh", "pwsh", "python", "cmd"] as const;

/**
 * Regex that matches a GHA-style custom shell template:
 * `<cmd> [opts] {0} [more_opts]`. The first whitespace-delimited token
 * is the command; `{0}` MUST appear and MUST be surrounded by
 * whitespace (so `perl{0}` is rejected — it would be ambiguous to
 * argv-tokenise). Multiplicity (exactly one `{0}`) is checked
 * separately via a `.refine(...)`.
 */
export const customShellTemplateRegex = /^\S+(\s+\S+)*\s+\{0\}(\s+\S+)*$/;

const customShellTemplateSchema = z
  .string()
  .regex(customShellTemplateRegex, "shell template must contain a {0} placeholder")
  .refine(
    (s) => (s.match(/\{0\}/g) ?? []).length === 1,
    "shell template must contain exactly one {0} placeholder",
  );

const builtinShellSchema = z.enum(BUILTIN_SHELLS);

/** Allowed values for `step.shell`: a built-in name or a custom template string. */
export const shellSchema = z.union([builtinShellSchema, customShellTemplateSchema]);

/** Inferred type — note that the union of `enum` and `string` collapses to `string` in TypeScript. */
export type Shell = z.infer<typeof shellSchema>;
