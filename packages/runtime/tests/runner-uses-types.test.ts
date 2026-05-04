/**
 * Smoke test for the public types and error classes added in MS1.1
 * slice b. Pure shape assertions — no behaviour exercised yet.
 */

import { describe, expect, test } from "vite-plus/test";

import {
  ActionManifestError,
  ActionProtocolError,
  ActionResolutionError,
  RuntimeError,
} from "../src/types/errors.ts";
import type { ActionContext } from "../src/runner/uses/index.ts";

describe("MS1.1 slice b — public surface", () => {
  test("each new error class extends RuntimeError and tags its name", () => {
    const cases = [
      new ActionResolutionError("a"),
      new ActionManifestError("b"),
      new ActionProtocolError("c"),
    ];
    for (const e of cases) {
      expect(e).toBeInstanceOf(RuntimeError);
      expect(e.name).toBe(e.constructor.name);
      expect(e.message.length).toBeGreaterThan(0);
    }
  });

  test("ActionContext is structurally usable as a parameter type", () => {
    // Compile-time only — if this file type-checks, the type is exported.
    const _accept = (_ctx: ActionContext): void => {};
    expect(typeof _accept).toBe("function");
  });
});
