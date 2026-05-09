/**
 * Smoke test for the public types and error classes in @aiactions/exec.
 * Pure shape assertions — no behaviour exercised yet.
 */

import { describe, expect, test } from "vite-plus/test";

import { AIactionsError } from "@aiactions/schema";

import { ExecError } from "../src/errors.ts";
import type { ActionContext } from "../src/index.ts";

describe("@aiactions/exec — public surface", () => {
  test("ExecError extends AIactionsError and tags its name", () => {
    const cases = [new ExecError("c")];
    for (const e of cases) {
      expect(e).toBeInstanceOf(AIactionsError);
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
