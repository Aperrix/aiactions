/**
 * Unit tests for `capToOneMiB`. Covers: pass-through under cap,
 * truncation marker over cap, multi-byte safety.
 */

import { describe, expect, test } from "vite-plus/test";

import { capToOneMiB } from "../src/transcript.ts";

describe("capToOneMiB", () => {
  test("returns the input unchanged when under the cap", () => {
    const small = JSON.stringify({ ok: "yes" });
    expect(capToOneMiB(small)).toBe(small);
  });

  test("truncates and appends the marker when over the cap", () => {
    const big = "x".repeat(2 * 1024 * 1024);
    const out = capToOneMiB(big);
    expect(out.endsWith("…[truncated]")).toBe(true);
    expect(Buffer.byteLength(out, "utf8")).toBeLessThanOrEqual(1024 * 1024 - 4096);
  });

  test("handles multi-byte characters at the truncation boundary", () => {
    const big = "é".repeat(2 * 1024 * 1024);
    const out = capToOneMiB(big);
    expect(out.endsWith("…[truncated]")).toBe(true);
    expect(Buffer.byteLength(out, "utf8")).toBeLessThanOrEqual(1024 * 1024 - 4096);
  });
});
