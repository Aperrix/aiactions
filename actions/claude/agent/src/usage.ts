/**
 * Builds the `usage` JSON payload from a Claude Agent SDK `result`
 * event. Tolerant of missing fields — the SDK guarantees `usage`
 * exists but several sub-fields are optional and we default to 0.
 *
 * Shape mirrors what Archon's `normalizeClaudeUsage` produces, with
 * extras (`cost_usd`, `num_turns`, `model_usage`) folded in.
 *
 * Contents:
 * - `UsageJson` — output type.
 * - `buildUsage(resultEvent)` — main builder.
 */

interface RawUsage {
  readonly input_tokens?: number;
  readonly output_tokens?: number;
  readonly total_tokens?: number;
  readonly cache_read_input_tokens?: number;
  readonly cache_creation_input_tokens?: number;
}

interface RawResultEvent {
  readonly usage?: RawUsage;
  readonly total_cost_usd?: number;
  readonly num_turns?: number;
  readonly model_usage?: Readonly<Record<string, RawUsage>>;
}

/** JSON-serializable usage payload produced from an SDK `result` event. */
export interface UsageJson {
  readonly input: number;
  readonly output: number;
  readonly total: number;
  readonly cost_usd: number;
  readonly num_turns: number;
  readonly model_usage: Readonly<Record<string, RawUsage>>;
}

/**
 * Flatten an SDK `result` event into a {@link UsageJson} payload.
 * All numeric fields default to `0`; `total` falls back to `input + output`
 * when `total_tokens` is absent.
 */
export function buildUsage(result: RawResultEvent): UsageJson {
  const u = result.usage ?? {};
  const input = u.input_tokens ?? 0;
  const output = u.output_tokens ?? 0;
  const total = u.total_tokens ?? input + output;
  return {
    input,
    output,
    total,
    cost_usd: result.total_cost_usd ?? 0,
    num_turns: result.num_turns ?? 0,
    model_usage: result.model_usage ?? {},
  };
}
