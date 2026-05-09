/**
 * `@aiactions/exec` error class. Raised when:
 * - a shell value cannot be resolved (unsupported shell, malformed
 *   custom template missing `{0}`),
 * - the FD3 line-delimited protocol receives an invalid frame (bad
 *   JSON, unknown type, oversize line, partial-line-at-EOF),
 * - the uses-loader subprocess emits a malformed payload.
 *
 * Folds the previous runtime `RuntimeUnsupportedError` (from shell-spec)
 * and `ActionProtocolError` into a single concrete class extending
 * `AIactionsError`.
 */

import { AIactionsError } from "@aiactions/schema";

export class ExecError extends AIactionsError {}
