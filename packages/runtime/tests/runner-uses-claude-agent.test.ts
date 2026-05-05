/**
 * End-to-end test: runs the bundled `actions/claude/agent/dist/main.mjs`
 * through `executeUsesStep`, with the SDK's `query` stubbed at the
 * bundle level.
 *
 * Strategy: B — string-substitution on a temp copy of the bundle.
 *
 * The bundle (produced by tsdown/rolldown) inlines all deps and
 * scope-mangles everything. The SDK export `query` becomes the mangled
 * internal function `t7$` (the only occurrence of `function t7$({` in
 * the file). We copy `dist/main.mjs` to a temp dir, replace the entire
 * body of `function t7$({...})` with a minimal async generator that
 * yields a deterministic event sequence, and point the runtime at that
 * copy.
 *
 * Fragility caveats:
 * - The mangled name `t7$` is rolldown-assigned at build time and
 *   WILL change if the bundle is rebuilt. If this test starts failing
 *   with "stub pattern not found", run `grep -n 'function t7\\$'
 *   actions/claude/agent/dist/main.mjs` to find the new name, update
 *   STUB_PATTERN + STUB_REPLACEMENT below, and rebuild the dist.
 * - The substitution must be a semantically valid replacement: the
 *   original `t7$` returns an async-iterable queryInstance; our stub
 *   returns a plain async generator (which is also async-iterable) so
 *   `for await` in `run()` works identically.
 * - If the bundle structure changes significantly, switch to Strategy C
 *   (separate tsdown build with `external: ["@anthropic-ai/claude-agent-sdk"]`).
 *
 * Fake claude binary:
 * The action calls `resolveClaudeBinary()` before the first SDK call.
 * That function checks `AIACTIONS_CLAUDE_BIN` in env → `accessSync(X_OK)`.
 * We create a chmod-0755 shell stub and expose it via that env var.
 * The binary is never actually invoked.
 */

import { mkdirSync, mkdtempSync, readFileSync, writeFileSync, chmodSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { describe, expect, test } from "vite-plus/test";

import { executeUsesStep } from "../src/runner/uses/exec.ts";
import { resolveUsesRef } from "../src/runner/uses/resolver.ts";
import { RefKind } from "@aiactions/workflows";

const POSIX = process.platform !== "win32";

/** Absolute path to the committed bundle. */
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

/** Absolute path to the action package root (for aiaction.yaml). */
const ACTION_ROOT = join(import.meta.dirname, "..", "..", "..", "actions", "claude", "agent");

/**
 * The exact string that marks the start of the SDK's `query` function
 * in the bundle. Must match precisely one occurrence.
 *
 * Identified via: grep -n 'function t7\\$' dist/main.mjs
 */
const STUB_PATTERN = `function t7$({ prompt: $, options: X }) {
	if ((X?.resume || X?.continue) && X?.sessionStore) {
		let { queryInstance: Y, transport: z, abortController: G, processEnv: H } = yK({ ...X }, typeof $ === "string", void 0, !0), U = resolve(X.cwd ?? "."), K = X.sessionStore, V = X.loadTimeoutMs ?? 6e4, N = X.resume;
		return (async () => {
			if (!N) N = (await G4(K.listSessions(_6(U)), V, \`SessionStore.listSessions() timed out after \${V}ms\`)).slice().sort((B, F) => F.mtime - B.mtime)[0]?.sessionId;
			if (!N) return;
			return nA(K, N, U, X.env, X.loadTimeoutMs);
		})().then((w) => {
			if (w) z.updateResume(N), z.updateEnv({ CLAUDE_CONFIG_DIR: w }), H.CLAUDE_CONFIG_DIR = w, Y.addCleanupCallback(() => uc(z, w));
			if (!Y.isClosed()) z.spawn();
		}).catch((w) => {
			let B = c4(w);
			z.spawnAbort(B), Y.setError(B);
		}), gK(Y, z, $, G), Y;
	}
	let { queryInstance: J, transport: W, abortController: Q } = yK(X, typeof $ === "string");
	return gK(J, W, $, Q), J;
}`;

/**
 * Replacement: a minimal async generator that yields the deterministic
 * event sequence the test asserts on. Preserves the same function
 * signature so the surrounding scope references are satisfied (though
 * `$` / `X` are unused in the stub body).
 */
const STUB_REPLACEMENT = `function t7$({ prompt: $, options: X }) {
	// AIACTIONS_TEST_STUB — replaced by runner-uses-claude-agent.test.ts
	return (async function* () {
		yield { type: "assistant", message: { content: [{ type: "text", text: "Hi from fake." }] } };
		yield {
			type: "result",
			session_id: "sess-fake",
			is_error: false,
			subtype: "end_turn",
			stop_reason: "end_turn",
			usage: { input_tokens: 1, output_tokens: 1, total_tokens: 2 },
			total_cost_usd: 0,
			num_turns: 1,
		};
	})();
}`;

interface PreparedAction {
  readonly dir: string;
  readonly env: NodeJS.ProcessEnv;
}

/**
 * Build a temp directory containing a stubbed copy of the action:
 * 1. Create `<tmp>/actions/claude/agent/`
 * 2. Copy `aiaction.yaml` verbatim from the real action root.
 * 3. Patch `dist/main.mjs` (Strategy B substitution) and write as
 *    `main.mjs` directly in the action dir (manifest says `./dist/main.mjs`
 *    so we reproduce that sub-path).
 * 4. Create a fake `claude` stub binary (chmod 0755) and expose it via
 *    `AIACTIONS_CLAUDE_BIN`.
 */
function prepareFakeAction(): PreparedAction {
  const tmp = mkdtempSync(join(tmpdir(), "aiactions-claude-agent-e2e-"));

  // Action directory — mimics the layout used by resolveUsesRef (local ref)
  const actionDir = join(tmp, "actions", "claude", "agent");
  const distDir = join(actionDir, "dist");
  mkdirSync(distDir, { recursive: true });

  // Copy aiaction.yaml verbatim
  const manifest = readFileSync(join(ACTION_ROOT, "aiaction.yaml"), "utf8");
  writeFileSync(join(actionDir, "aiaction.yaml"), manifest, "utf8");

  // Patch the bundle
  const bundleSource = readFileSync(ACTION_DIST, "utf8");
  const occurrences = bundleSource.split(STUB_PATTERN).length - 1;
  if (occurrences !== 1) {
    throw new Error(
      `runner-uses-claude-agent.test: stub pattern found ${occurrences} times (expected exactly 1). ` +
        `The bundle was likely rebuilt and the mangled name changed. ` +
        `Run: grep -n 'function t7\\$' actions/claude/agent/dist/main.mjs`,
    );
  }
  const patchedBundle = bundleSource.replace(STUB_PATTERN, STUB_REPLACEMENT);
  writeFileSync(join(distDir, "main.mjs"), patchedBundle, "utf8");

  // Fake `claude` binary — just a shell that exits 0 (never actually invoked)
  const binDir = join(tmp, "bin");
  mkdirSync(binDir, { recursive: true });
  const fakeBin = join(binDir, "claude");
  writeFileSync(fakeBin, "#!/bin/sh\nexit 0\n", "utf8");
  chmodSync(fakeBin, 0o755);

  const env: NodeJS.ProcessEnv = {
    ...process.env,
    AIACTIONS_CLAUDE_BIN: fakeBin,
  };

  return { dir: actionDir, env };
}

(POSIX ? describe : describe.skip)("runtime → claude/agent (e2e)", () => {
  test("emits text + session_id + usage when SDK is stubbed", async () => {
    const { dir, env } = prepareFakeAction();

    // Use a local file:// ref so resolveUsesRef skips registry fetch
    const ref = {
      kind: RefKind.local as typeof RefKind.local,
      raw: `file://${dir}`,
      path: dir,
    };

    const resolved = await resolveUsesRef(ref, {});

    const result = await executeUsesStep({
      resolved,
      jobId: "j",
      stepIndex: 0,
      stepId: undefined,
      inputs: { prompt: "hi" },
      env,
    });

    expect(result.status).toBe("succeeded");
    expect(result.outputs["text"]).toBe("Hi from fake.");
    expect(result.outputs["session_id"]).toBe("sess-fake");
    expect(result.outputs["is_error"]).toBe("false");
    expect(JSON.parse(result.outputs["usage"] ?? "{}")).toMatchObject({
      input: 1,
      output: 1,
      total: 2,
    });
  }, 30_000);
});
