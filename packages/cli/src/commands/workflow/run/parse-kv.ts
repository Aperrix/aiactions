import { UsageError } from "../../../_shared/cli-error.ts";

/**
 * Parse a repeatable `--flag k=v` array into a `Record<string, string>`.
 *
 * @param pairs  Raw CLI values (e.g. `["branch=main", "debug=true"]`).
 * @param flag   Flag name used in the error message (e.g. `"--input"`).
 */
export function parseKv(pairs: ReadonlyArray<string>, flag: string): Record<string, string> {
  const result: Record<string, string> = {};
  for (const pair of pairs) {
    const eqIdx = pair.indexOf("=");
    if (eqIdx <= 0) {
      throw new UsageError(`invalid ${flag} value: ${JSON.stringify(pair)} — expected k=v`);
    }
    const key = pair.slice(0, eqIdx);
    const value = pair.slice(eqIdx + 1);
    result[key] = value;
  }
  return result;
}
