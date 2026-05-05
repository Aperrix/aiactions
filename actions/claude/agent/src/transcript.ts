/**
 * Caps a JSON-serialized transcript at <1 MiB so it fits in a single
 * FD3 protocol frame (parent-side limit defined in
 * `packages/runtime/src/runner/uses/protocol.ts:58`).
 *
 * Strategy: if the input fits, return it verbatim. Otherwise truncate
 * to MAX_BYTES minus a small marker and append `…[truncated]`. The
 * truncated string is no longer valid JSON, but downstream consumers
 * read it as an opaque string with a sentinel suffix.
 *
 * Contents:
 * - `MAX_BYTES` — cap (slightly under 1 MiB to leave room for framing).
 * - `capToOneMiB(json)` — main entry.
 */

/** Byte cap: 1 MiB minus 4 KiB headroom for the FD3 JSON envelope. */
export const MAX_BYTES = 1024 * 1024 - 4096;

const MARKER = "…[truncated]";

/**
 * Return `json` unchanged if it fits within {@link MAX_BYTES}, otherwise
 * truncate at a multi-byte-safe character boundary and append the
 * `…[truncated]` sentinel.
 */
export function capToOneMiB(json: string): string {
  const byteLength = Buffer.byteLength(json, "utf8");
  if (byteLength <= MAX_BYTES) return json;
  const markerBytes = Buffer.byteLength(MARKER, "utf8");
  const target = MAX_BYTES - markerBytes;
  // Write the string into a Buffer truncated at `target` bytes, then
  // decode back to a string. `Buffer.write` stops at the byte boundary
  // without splitting a multi-byte sequence, so the result is always
  // valid UTF-8 and the operation is O(n) in one pass — no while loop.
  const buf = Buffer.allocUnsafe(target);
  const written = buf.write(json, 0, target, "utf8");
  const cut = buf.toString("utf8", 0, written);
  return `${cut}${MARKER}`;
}
