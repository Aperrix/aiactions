/**
 * Sanity test: confirm the committed `actions/claude/agent/dist/main.mjs`
 * bundle is ESM-loadable as a Node module and exports the `run` function
 * the loader expects. Catches the "rebuilt the bundle and broke its
 * shape" failure mode.
 *
 * Action behavior is covered exhaustively by
 * `actions/claude/agent/tests/main.test.ts` (8 integration tests with
 * the SDK mocked at module level). End-to-end FD3 protocol is covered
 * by `runner-uses-loader.test.ts` and `runner-uses-registry-integration.test.ts`
 * against fixture actions. This file just ensures the bundled artifact
 * itself stays loadable.
 */

import { join } from "node:path";

import { describe, expect, test } from "vite-plus/test";

const ACTION_DIST = join(
  import.meta.dirname,
  "..",
  "..",
  "..",
  "actions",
  "claude",
  "agent",
  "dist",
  "main.mjs",
);

describe("claude/agent dist bundle", () => {
  test("is ESM-loadable and exports `run`", async () => {
    const mod = (await import(ACTION_DIST)) as { run?: unknown };
    expect(typeof mod.run).toBe("function");
  });
});
