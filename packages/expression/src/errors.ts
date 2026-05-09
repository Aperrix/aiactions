/**
 * `@aiactions/expression` error class. Raised when the minimal `${{ }}`
 * evaluator cannot resolve a body (unsupported context, undefined
 * variable, malformed grammar). Extends `AIactionsError` so the CLI's
 * outermost handler can map it to a typed exit code.
 */

import { AIactionsError } from "@aiactions/schema";

export class ExpressionError extends AIactionsError {}
