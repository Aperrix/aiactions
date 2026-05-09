# Phase 1 — `@aiactions/paths` Package Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create the `@aiactions/paths` package — XDG path resolution, env-var parsing, structured logger, telemetry bus — and migrate the existing `cli/lib/registry-root.ts` callers to consume it. No breaking change to public CLI behaviour.

**Architecture:** Phase 1 of the 6-phase architecture restructure documented in `docs/superpowers/specs/2026-05-09-architecture-restructure-design.md`. Standalone package, leaf in the dependency DAG (no internal deps), stdlib only. Adds `AIA_HOME`, `AIA_REGISTRY_ROOT`, `AIA_TMP_ROOT` env-var support; preserves the existing MS1.8.6 default for `tmpRoot` (`<registryRoot>/.tmp`).

**Tech Stack:** TypeScript (strict + verbatimModuleSyntax + isolatedModules), Vite+ test runner (`vite-plus/test`), zero runtime deps, ESM-only.

---

## File Structure

| File                                                  | Responsibility                                                                      |
| ----------------------------------------------------- | ----------------------------------------------------------------------------------- |
| `packages/paths/package.json`                         | Package manifest, ESM, no runtime deps                                              |
| `packages/paths/tsconfig.json`                        | TS config matching existing packages                                                |
| `packages/paths/vite.config.ts`                       | Vite+ test/lint config                                                              |
| `packages/paths/src/env.ts`                           | Parses `AIA_HOME`, `AIA_REGISTRY_ROOT`, `AIA_TMP_ROOT`, `AIA_DEBUG` from env source |
| `packages/paths/src/paths.ts`                         | `resolveRegistryRoot`, `resolveCacheRoot`, `resolveTmpRoot` + `HomeUnresolvedError` |
| `packages/paths/src/logger.ts`                        | `createLogger` — stderr sink, level filtering honors `AIA_DEBUG`                    |
| `packages/paths/src/telemetry-bus.ts`                 | `createTelemetryBus<EventMap>` — typed sync event dispatcher                        |
| `packages/paths/src/index.ts`                         | Public API barrel re-export                                                         |
| `packages/paths/tests/env.test.ts`                    | Tests `loadEnv` cases                                                               |
| `packages/paths/tests/paths.test.ts`                  | Tests three `resolve*` fns + `HomeUnresolvedError`                                  |
| `packages/paths/tests/logger.test.ts`                 | Tests level filtering + sink + meta serialization                                   |
| `packages/paths/tests/telemetry-bus.test.ts`          | Tests subscribe/emit/unsubscribe                                                    |
| **Modified files**                                    |                                                                                     |
| `packages/cli/package.json`                           | Adds `@aiactions/paths: workspace:*` dep                                            |
| `packages/cli/src/commands/action/install.ts:16,89`   | Replace `lib/registry-root.ts` import with `@aiactions/paths`                       |
| `packages/cli/src/commands/action/list.ts:6,107`      | Same                                                                                |
| `packages/cli/src/commands/action/uninstall.ts:10,41` | Same                                                                                |
| **Deleted files**                                     |                                                                                     |
| `packages/cli/src/lib/registry-root.ts`               | Logic moved to `@aiactions/paths`                                                   |
| `packages/cli/tests/registry-root.test.ts`            | Tests moved to `@aiactions/paths/tests/paths.test.ts`                               |

---

## Task 1: Bootstrap package skeleton

**Files:**

- Create: `packages/paths/package.json`
- Create: `packages/paths/tsconfig.json`
- Create: `packages/paths/vite.config.ts`
- Create: `packages/paths/src/index.ts` (empty placeholder)

- [ ] **Step 1: Create the package directory tree**

Run from repo root:

```bash
mkdir -p packages/paths/src packages/paths/tests
```

Verify:

```bash
ls packages/paths
```

Expected: `src  tests`.

- [ ] **Step 2: Write `packages/paths/package.json`**

```json
{
  "name": "@aiactions/paths",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "exports": {
    ".": "./src/index.ts",
    "./package.json": "./package.json"
  },
  "scripts": {
    "test": "vp test",
    "check": "vp check"
  }
}
```

No runtime `dependencies` block; the package is stdlib-only.

- [ ] **Step 3: Write `packages/paths/tsconfig.json`**

Copy the exact shape used by `packages/workflows/tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "esnext",
    "lib": ["es2023"],
    "moduleDetection": "force",
    "module": "nodenext",
    "moduleResolution": "nodenext",
    "resolveJsonModule": true,
    "types": ["node"],
    "strict": true,
    "noUnusedLocals": true,
    "declaration": true,
    "noEmit": true,
    "allowImportingTsExtensions": true,
    "esModuleInterop": true,
    "isolatedModules": true,
    "verbatimModuleSyntax": true,
    "skipLibCheck": true
  }
}
```

- [ ] **Step 4: Write `packages/paths/vite.config.ts`**

```ts
import { defineConfig } from "vite-plus";

export default defineConfig({
  lint: {
    options: {
      typeAware: true,
      typeCheck: true,
    },
  },
  fmt: {},
});
```

- [ ] **Step 5: Write empty `packages/paths/src/index.ts`**

```ts
// Public API barrel — populated by subsequent tasks.
export {};
```

- [ ] **Step 6: Register package in workspace**

Run from repo root:

```bash
vp install
```

Expected: bun resolves the new workspace package; `packages/paths/node_modules` symlinked. `vp install` exits 0.

- [ ] **Step 7: Verify the package compiles in isolation**

Run from `packages/paths`:

```bash
vp check
```

Expected: PASS (no source files yet, lint+check succeed on the empty tree).

- [ ] **Step 8: Commit**

```bash
git add packages/paths
git commit -m "$(cat <<'EOF'
feat(paths): scaffold @aiactions/paths package

Empty skeleton (package.json, tsconfig, vite.config, src/index.ts).
Subsequent commits implement env, paths, logger, telemetry-bus.

Refs: docs/superpowers/specs/2026-05-09-architecture-restructure-design.md
Refs: docs/superpowers/plans/2026-05-09-phase-1-paths-package.md

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 2: Implement `env.ts` (TDD)

**Files:**

- Create: `packages/paths/src/env.ts`
- Test: `packages/paths/tests/env.test.ts`

- [ ] **Step 1: Write the failing test**

Create `packages/paths/tests/env.test.ts`:

```ts
import { describe, expect, test } from "vite-plus/test";

import { loadEnv } from "../src/env.ts";

describe("loadEnv", () => {
  test("reads AIA_HOME when set", () => {
    const env = loadEnv({ source: { AIA_HOME: "/custom/home" } });
    expect(env.home).toBe("/custom/home");
  });

  test("falls back to HOME when AIA_HOME absent", () => {
    const env = loadEnv({ source: { HOME: "/sys/home" } });
    expect(env.home).toBe("/sys/home");
  });

  test("AIA_HOME takes precedence over HOME", () => {
    const env = loadEnv({ source: { AIA_HOME: "/aia", HOME: "/sys" } });
    expect(env.home).toBe("/aia");
  });

  test("home is empty string when neither AIA_HOME nor HOME set", () => {
    const env = loadEnv({ source: {} });
    expect(env.home).toBe("");
  });

  test("captures AIA_REGISTRY_ROOT when set", () => {
    const env = loadEnv({ source: { AIA_REGISTRY_ROOT: "/r" } });
    expect(env.registryRoot).toBe("/r");
  });

  test("registryRoot is undefined when AIA_REGISTRY_ROOT unset", () => {
    const env = loadEnv({ source: {} });
    expect(env.registryRoot).toBeUndefined();
  });

  test("captures AIA_TMP_ROOT when set", () => {
    const env = loadEnv({ source: { AIA_TMP_ROOT: "/t" } });
    expect(env.tmpRoot).toBe("/t");
  });

  test("debug is false when AIA_DEBUG unset", () => {
    const env = loadEnv({ source: {} });
    expect(env.debug).toBe(false);
  });

  test("debug is true when AIA_DEBUG truthy", () => {
    const env = loadEnv({ source: { AIA_DEBUG: "1" } });
    expect(env.debug).toBe(true);
  });

  test("debug is false when AIA_DEBUG empty string", () => {
    const env = loadEnv({ source: { AIA_DEBUG: "" } });
    expect(env.debug).toBe(false);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run from `packages/paths`:

```bash
vp test env
```

Expected: FAIL — `Cannot find module "../src/env.ts"` (or equivalent).

- [ ] **Step 3: Write minimal implementation**

Create `packages/paths/src/env.ts`:

```ts
/**
 * Environment-variable parsing for AIactions runtime configuration.
 *
 * Recognized vars:
 * - AIA_HOME           — overrides $HOME for path resolution
 * - AIA_REGISTRY_ROOT  — full path to the actions registry root
 * - AIA_TMP_ROOT       — full path to the tmp/staging dir
 * - AIA_DEBUG          — when truthy, enables debug logging
 */

export interface Env {
  /** Resolved home directory. AIA_HOME overrides $HOME. Empty string if neither set. */
  readonly home: string;
  /** Optional explicit registry root override (AIA_REGISTRY_ROOT). */
  readonly registryRoot?: string;
  /** Optional explicit tmp root override (AIA_TMP_ROOT). */
  readonly tmpRoot?: string;
  /** Debug logging enabled (AIA_DEBUG truthy). */
  readonly debug: boolean;
}

export interface LoadEnvOptions {
  /** Override the env source. Defaults to `process.env`. */
  readonly source?: NodeJS.ProcessEnv;
}

export function loadEnv(options: LoadEnvOptions = {}): Env {
  const env = options.source ?? process.env;
  const home = env.AIA_HOME ?? env.HOME ?? "";
  const registryRoot = env.AIA_REGISTRY_ROOT;
  const tmpRoot = env.AIA_TMP_ROOT;
  const debug = Boolean(env.AIA_DEBUG);
  return { home, registryRoot, tmpRoot, debug };
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run from `packages/paths`:

```bash
vp test env
```

Expected: PASS — 10 tests green.

- [ ] **Step 5: Commit**

```bash
git add packages/paths/src/env.ts packages/paths/tests/env.test.ts
git commit -m "$(cat <<'EOF'
feat(paths): add loadEnv for AIA_* env vars

Parses AIA_HOME (overrides HOME), AIA_REGISTRY_ROOT, AIA_TMP_ROOT,
AIA_DEBUG. Source injection enables deterministic tests.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 3: Implement `paths.ts` (TDD)

**Files:**

- Create: `packages/paths/src/paths.ts`
- Test: `packages/paths/tests/paths.test.ts`

- [ ] **Step 1: Write the failing test**

Create `packages/paths/tests/paths.test.ts`:

```ts
import { describe, expect, test } from "vite-plus/test";

import { loadEnv } from "../src/env.ts";
import {
  HomeUnresolvedError,
  resolveCacheRoot,
  resolveRegistryRoot,
  resolveTmpRoot,
} from "../src/paths.ts";

describe("resolveRegistryRoot", () => {
  test("returns AIA_REGISTRY_ROOT when set", () => {
    const env = loadEnv({ source: { AIA_REGISTRY_ROOT: "/explicit/root" } });
    expect(resolveRegistryRoot({ env })).toBe("/explicit/root");
  });

  test("returns <home>/.aiactions/actions when only home is set", () => {
    const env = loadEnv({ source: { HOME: "/h" } });
    expect(resolveRegistryRoot({ env })).toBe("/h/.aiactions/actions");
  });

  test("AIA_REGISTRY_ROOT wins over computed home path", () => {
    const env = loadEnv({ source: { HOME: "/h", AIA_REGISTRY_ROOT: "/explicit" } });
    expect(resolveRegistryRoot({ env })).toBe("/explicit");
  });

  test("throws HomeUnresolvedError when neither home nor AIA_REGISTRY_ROOT set", () => {
    const env = loadEnv({ source: {} });
    expect(() => resolveRegistryRoot({ env })).toThrow(HomeUnresolvedError);
  });

  test("AIA_HOME drives home resolution", () => {
    const env = loadEnv({ source: { AIA_HOME: "/aia" } });
    expect(resolveRegistryRoot({ env })).toBe("/aia/.aiactions/actions");
  });
});

describe("resolveCacheRoot", () => {
  test("returns <home>/.aiactions/cache", () => {
    const env = loadEnv({ source: { HOME: "/h" } });
    expect(resolveCacheRoot({ env })).toBe("/h/.aiactions/cache");
  });

  test("throws HomeUnresolvedError when home is empty", () => {
    const env = loadEnv({ source: {} });
    expect(() => resolveCacheRoot({ env })).toThrow(HomeUnresolvedError);
  });
});

describe("resolveTmpRoot", () => {
  test("returns AIA_TMP_ROOT when set", () => {
    const env = loadEnv({ source: { AIA_TMP_ROOT: "/explicit/tmp" } });
    expect(resolveTmpRoot({ env })).toBe("/explicit/tmp");
  });

  test("defaults to <registryRoot>/.tmp", () => {
    const env = loadEnv({ source: { HOME: "/h" } });
    expect(resolveTmpRoot({ env })).toBe("/h/.aiactions/actions/.tmp");
  });

  test("AIA_TMP_ROOT wins over computed default", () => {
    const env = loadEnv({ source: { HOME: "/h", AIA_TMP_ROOT: "/t" } });
    expect(resolveTmpRoot({ env })).toBe("/t");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run from `packages/paths`:

```bash
vp test paths
```

Expected: FAIL — `Cannot find module "../src/paths.ts"`.

- [ ] **Step 3: Write minimal implementation**

Create `packages/paths/src/paths.ts`:

```ts
import { join } from "node:path";

import { loadEnv, type Env } from "./env.ts";

export interface PathsResolveOptions {
  /** Override the loaded env. Defaults to `loadEnv()`. */
  readonly env?: Env;
}

/** Thrown when path resolution requires a home directory but none is set. */
export class HomeUnresolvedError extends Error {
  constructor() {
    super("No home directory: set $HOME or AIA_HOME");
    this.name = "HomeUnresolvedError";
  }
}

/**
 * Resolve `<home>/.aiactions/actions/`, the per-user actions cache.
 * AIA_REGISTRY_ROOT, when set, short-circuits the computation and is
 * returned verbatim.
 */
export function resolveRegistryRoot(options: PathsResolveOptions = {}): string {
  const env = options.env ?? loadEnv();
  if (env.registryRoot !== undefined && env.registryRoot !== "") {
    return env.registryRoot;
  }
  if (env.home === "") {
    throw new HomeUnresolvedError();
  }
  return join(env.home, ".aiactions", "actions");
}

/**
 * Resolve `<home>/.aiactions/cache/`, reserved for non-action caches
 * (HTTP responses, fetched archives) — currently unused by the runtime
 * but exposed so future consumers can opt in without a breaking change.
 */
export function resolveCacheRoot(options: PathsResolveOptions = {}): string {
  const env = options.env ?? loadEnv();
  if (env.home === "") {
    throw new HomeUnresolvedError();
  }
  return join(env.home, ".aiactions", "cache");
}

/**
 * Resolve `<registryRoot>/.tmp/`, the EXDEV-safe staging dir for
 * registry fetches (per the MS1.8.6 default). AIA_TMP_ROOT, when set,
 * short-circuits the computation.
 */
export function resolveTmpRoot(options: PathsResolveOptions = {}): string {
  const env = options.env ?? loadEnv();
  if (env.tmpRoot !== undefined && env.tmpRoot !== "") {
    return env.tmpRoot;
  }
  return join(resolveRegistryRoot({ env }), ".tmp");
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run from `packages/paths`:

```bash
vp test paths
```

Expected: PASS — 10 tests green.

- [ ] **Step 5: Commit**

```bash
git add packages/paths/src/paths.ts packages/paths/tests/paths.test.ts
git commit -m "$(cat <<'EOF'
feat(paths): add resolveRegistryRoot/resolveCacheRoot/resolveTmpRoot

Honors AIA_REGISTRY_ROOT and AIA_TMP_ROOT overrides. Defaults match
MS1.8.6 (<registryRoot>/.tmp). HomeUnresolvedError replaces the prior
generic Error from cli/lib/registry-root.ts.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 4: Implement `logger.ts` (TDD)

**Files:**

- Create: `packages/paths/src/logger.ts`
- Test: `packages/paths/tests/logger.test.ts`

- [ ] **Step 1: Write the failing test**

Create `packages/paths/tests/logger.test.ts`:

```ts
import { describe, expect, test } from "vite-plus/test";

import { createLogger } from "../src/logger.ts";

describe("createLogger", () => {
  test("emits info, warn, error at default level", () => {
    const lines: string[] = [];
    const logger = createLogger({ minLevel: "info", sink: (line) => lines.push(line) });

    logger.debug("a");
    logger.info("b");
    logger.warn("c");
    logger.error("d");

    expect(lines).toEqual(["[info] b\n", "[warn] c\n", "[error] d\n"]);
  });

  test("emits debug when minLevel is debug", () => {
    const lines: string[] = [];
    const logger = createLogger({ minLevel: "debug", sink: (line) => lines.push(line) });

    logger.debug("d");

    expect(lines).toEqual(["[debug] d\n"]);
  });

  test("filters debug when minLevel is info", () => {
    const lines: string[] = [];
    const logger = createLogger({ minLevel: "info", sink: (line) => lines.push(line) });

    logger.debug("d");

    expect(lines).toEqual([]);
  });

  test("appends meta as JSON when provided", () => {
    const lines: string[] = [];
    const logger = createLogger({ minLevel: "info", sink: (line) => lines.push(line) });

    logger.info("hello", { key: "value", n: 1 });

    expect(lines).toEqual([`[info] hello {"key":"value","n":1}\n`]);
  });

  test("omits meta when undefined", () => {
    const lines: string[] = [];
    const logger = createLogger({ minLevel: "info", sink: (line) => lines.push(line) });

    logger.info("hello");

    expect(lines).toEqual(["[info] hello\n"]);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run from `packages/paths`:

```bash
vp test logger
```

Expected: FAIL — `Cannot find module "../src/logger.ts"`.

- [ ] **Step 3: Write minimal implementation**

Create `packages/paths/src/logger.ts`:

```ts
/**
 * Structured logger writing one line per call to a sink (default: stderr).
 * Level filtering threshold defaults to `info`, or `debug` when AIA_DEBUG
 * is truthy in the loaded env.
 */

import { loadEnv } from "./env.ts";

export type LogLevel = "debug" | "info" | "warn" | "error";

export interface Logger {
  debug(msg: string, meta?: Record<string, unknown>): void;
  info(msg: string, meta?: Record<string, unknown>): void;
  warn(msg: string, meta?: Record<string, unknown>): void;
  error(msg: string, meta?: Record<string, unknown>): void;
}

export interface LoggerOptions {
  /** Override the threshold. Defaults to `debug` if AIA_DEBUG, else `info`. */
  readonly minLevel?: LogLevel;
  /** Override the sink. Defaults to `process.stderr.write`. */
  readonly sink?: (line: string) => void;
}

const ORDER: Record<LogLevel, number> = { debug: 0, info: 1, warn: 2, error: 3 };

export function createLogger(options: LoggerOptions = {}): Logger {
  const env = loadEnv();
  const minLevel: LogLevel = options.minLevel ?? (env.debug ? "debug" : "info");
  const sink =
    options.sink ??
    ((line: string) => {
      process.stderr.write(line);
    });

  const emit = (level: LogLevel, msg: string, meta?: Record<string, unknown>) => {
    if (ORDER[level] < ORDER[minLevel]) return;
    const metaPart = meta !== undefined ? ` ${JSON.stringify(meta)}` : "";
    sink(`[${level}] ${msg}${metaPart}\n`);
  };

  return {
    debug: (msg, meta) => emit("debug", msg, meta),
    info: (msg, meta) => emit("info", msg, meta),
    warn: (msg, meta) => emit("warn", msg, meta),
    error: (msg, meta) => emit("error", msg, meta),
  };
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run from `packages/paths`:

```bash
vp test logger
```

Expected: PASS — 5 tests green.

- [ ] **Step 5: Commit**

```bash
git add packages/paths/src/logger.ts packages/paths/tests/logger.test.ts
git commit -m "$(cat <<'EOF'
feat(paths): add createLogger with stderr sink and level filtering

Honors AIA_DEBUG via loadEnv (debug threshold) when minLevel not
provided. JSON-serializes optional meta map after the message. Sink
override enables tests without process.stderr indirection.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 5: Implement `telemetry-bus.ts` (TDD)

**Files:**

- Create: `packages/paths/src/telemetry-bus.ts`
- Test: `packages/paths/tests/telemetry-bus.test.ts`

- [ ] **Step 1: Write the failing test**

Create `packages/paths/tests/telemetry-bus.test.ts`:

```ts
import { describe, expect, test } from "vite-plus/test";

import { createTelemetryBus } from "../src/telemetry-bus.ts";

interface TestEvents {
  "registry.fetch.started": { ref: string };
  "registry.fetch.completed": { ref: string; durationMs: number };
}

describe("createTelemetryBus", () => {
  test("dispatches emitted events to subscribed handlers", () => {
    const bus = createTelemetryBus<TestEvents>();
    const received: Array<{ ref: string }> = [];

    bus.on("registry.fetch.started", (payload) => {
      received.push(payload);
    });

    bus.emit("registry.fetch.started", { ref: "claude/agent@v1" });

    expect(received).toEqual([{ ref: "claude/agent@v1" }]);
  });

  test("dispatches in registration order to multiple handlers", () => {
    const bus = createTelemetryBus<TestEvents>();
    const order: number[] = [];

    bus.on("registry.fetch.started", () => order.push(1));
    bus.on("registry.fetch.started", () => order.push(2));
    bus.on("registry.fetch.started", () => order.push(3));

    bus.emit("registry.fetch.started", { ref: "x" });

    expect(order).toEqual([1, 2, 3]);
  });

  test("emit on event with zero handlers is a no-op", () => {
    const bus = createTelemetryBus<TestEvents>();

    expect(() => bus.emit("registry.fetch.completed", { ref: "x", durationMs: 1 })).not.toThrow();
  });

  test("on() returns an unsubscribe function", () => {
    const bus = createTelemetryBus<TestEvents>();
    let calls = 0;

    const unsubscribe = bus.on("registry.fetch.started", () => {
      calls += 1;
    });

    bus.emit("registry.fetch.started", { ref: "x" });
    unsubscribe();
    bus.emit("registry.fetch.started", { ref: "y" });

    expect(calls).toBe(1);
  });

  test("handler errors propagate to the emitter (no swallowing)", () => {
    const bus = createTelemetryBus<TestEvents>();

    bus.on("registry.fetch.started", () => {
      throw new Error("handler failed");
    });

    expect(() => bus.emit("registry.fetch.started", { ref: "x" })).toThrow("handler failed");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run from `packages/paths`:

```bash
vp test telemetry-bus
```

Expected: FAIL — `Cannot find module "../src/telemetry-bus.ts"`.

- [ ] **Step 3: Write minimal implementation**

Create `packages/paths/src/telemetry-bus.ts`:

```ts
/**
 * Typed synchronous event bus. Subscribers register a handler with `on`;
 * publishers emit events with a typed payload.
 *
 * Dispatch is synchronous and ordered by registration. Errors thrown by a
 * handler propagate to the emitter — there is no swallowing or aggregation.
 */

export interface TelemetryBus<EventMap extends Record<string, unknown>> {
  on<K extends keyof EventMap>(event: K, handler: (payload: EventMap[K]) => void): () => void;
  emit<K extends keyof EventMap>(event: K, payload: EventMap[K]): void;
}

export function createTelemetryBus<
  EventMap extends Record<string, unknown>,
>(): TelemetryBus<EventMap> {
  const handlers = new Map<keyof EventMap, Set<(payload: EventMap[keyof EventMap]) => void>>();

  return {
    on(event, handler) {
      const set = handlers.get(event) ?? new Set();
      set.add(handler as (payload: EventMap[keyof EventMap]) => void);
      handlers.set(event, set);
      return () => {
        set.delete(handler as (payload: EventMap[keyof EventMap]) => void);
      };
    },
    emit(event, payload) {
      const set = handlers.get(event);
      if (set === undefined) return;
      for (const handler of set) {
        handler(payload);
      }
    },
  };
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run from `packages/paths`:

```bash
vp test telemetry-bus
```

Expected: PASS — 5 tests green.

- [ ] **Step 5: Commit**

```bash
git add packages/paths/src/telemetry-bus.ts packages/paths/tests/telemetry-bus.test.ts
git commit -m "$(cat <<'EOF'
feat(paths): add createTelemetryBus typed sync event dispatcher

Generic over an EventMap to keep payloads type-checked at on/emit
sites. Handler errors propagate (no swallowing) per
engineering-principles.md fail-fast rule. on() returns unsubscribe.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 6: Wire public API barrel

**Files:**

- Modify: `packages/paths/src/index.ts`

- [ ] **Step 1: Replace `index.ts` with the full barrel**

Edit `packages/paths/src/index.ts`:

```ts
export * from "./env.ts";
export * from "./paths.ts";
export * from "./logger.ts";
export * from "./telemetry-bus.ts";
```

- [ ] **Step 2: Verify the package builds clean**

Run from `packages/paths`:

```bash
vp check && vp test
```

Expected: lint PASS, type-check PASS, all 30 tests green.

- [ ] **Step 3: Commit**

```bash
git add packages/paths/src/index.ts
git commit -m "$(cat <<'EOF'
feat(paths): wire public API barrel

Re-exports env, paths, logger, telemetry-bus. Package is now
ready for consumers.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 7: Migrate CLI consumers — declare dep

**Files:**

- Modify: `packages/cli/package.json`

- [ ] **Step 1: Add `@aiactions/paths` to CLI's `dependencies`**

Open `packages/cli/package.json` and add `"@aiactions/paths": "workspace:*"` to the `dependencies` map (preserve alphabetical order if other entries follow that pattern; otherwise append). After the edit, the `dependencies` block should include the new entry.

- [ ] **Step 2: Re-resolve workspace symlinks**

Run from repo root:

```bash
vp install
```

Expected: bun reports the new dependency edge; `packages/cli/node_modules/@aiactions/paths` symlink created. Exit code 0.

- [ ] **Step 3: Smoke-check the import resolves**

Run from `packages/cli`:

```bash
vp check
```

Expected: lint+type-check still PASS (no source changes yet — only the workspace edge was added).

- [ ] **Step 4: Commit**

```bash
git add packages/cli/package.json
git commit -m "$(cat <<'EOF'
chore(cli): declare @aiactions/paths workspace dep

Prepares for the registry-root migration in the next commit.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 8: Migrate `cli/commands/action/install.ts`

**Files:**

- Modify: `packages/cli/src/commands/action/install.ts:16` (import) and `:89` (call site)

- [ ] **Step 1: Replace the import**

In `packages/cli/src/commands/action/install.ts`, replace line 16:

```ts
import { resolveRegistryRoot } from "../../lib/registry-root.ts";
```

with:

```ts
import { resolveRegistryRoot } from "@aiactions/paths";
```

- [ ] **Step 2: Verify the call site at :89 still type-checks**

The call `const registryRoot = resolveRegistryRoot();` is unchanged — the new function accepts the same zero-argument call (the `options.env` parameter is optional and defaults to `loadEnv()`).

- [ ] **Step 3: Run CLI checks**

Run from `packages/cli`:

```bash
vp check
```

Expected: lint+type-check PASS.

- [ ] **Step 4: Run install command's tests**

Run from `packages/cli`:

```bash
vp test install
```

Expected: PASS — existing install tests still green (no behaviour change).

- [ ] **Step 5: Do not commit yet**

We commit Tasks 8, 9, 10 together at the end of Task 10 (one atomic migration commit per the engineering-principles rollback-first thinking).

---

## Task 9: Migrate `cli/commands/action/list.ts`

**Files:**

- Modify: `packages/cli/src/commands/action/list.ts:6` (import) and `:107` (call site)

- [ ] **Step 1: Replace the import**

In `packages/cli/src/commands/action/list.ts`, replace line 6:

```ts
import { resolveRegistryRoot } from "../../lib/registry-root.ts";
```

with:

```ts
import { resolveRegistryRoot } from "@aiactions/paths";
```

- [ ] **Step 2: Verify the call site at :107 still type-checks**

The call `const registryRoot = resolveRegistryRoot();` is unchanged.

- [ ] **Step 3: Run CLI checks**

Run from `packages/cli`:

```bash
vp check && vp test list
```

Expected: lint+type-check PASS, list tests still green.

- [ ] **Step 4: Do not commit yet** — wait for Task 10.

---

## Task 10: Migrate `cli/commands/action/uninstall.ts` + delete legacy file

**Files:**

- Modify: `packages/cli/src/commands/action/uninstall.ts:10` (import)
- Delete: `packages/cli/src/lib/registry-root.ts`
- Delete: `packages/cli/tests/registry-root.test.ts`

- [ ] **Step 1: Replace the import in `uninstall.ts`**

In `packages/cli/src/commands/action/uninstall.ts`, replace line 10:

```ts
import { resolveRegistryRoot } from "../../lib/registry-root.ts";
```

with:

```ts
import { resolveRegistryRoot } from "@aiactions/paths";
```

- [ ] **Step 2: Delete the legacy source file**

```bash
rm packages/cli/src/lib/registry-root.ts
```

- [ ] **Step 3: Delete the legacy test file**

The `paths.test.ts` in `@aiactions/paths` already covers the same behaviour with broader cases. The CLI-side test is now redundant.

```bash
rm packages/cli/tests/registry-root.test.ts
```

- [ ] **Step 4: Run full CLI suite**

Run from `packages/cli`:

```bash
vp check && vp test
```

Expected: lint+type-check PASS. All CLI tests PASS (one fewer test file: registry-root.test.ts is gone).

- [ ] **Step 5: Commit the migration atomically**

```bash
git add packages/cli/src/commands/action/install.ts \
        packages/cli/src/commands/action/list.ts \
        packages/cli/src/commands/action/uninstall.ts \
        packages/cli/src/lib/registry-root.ts \
        packages/cli/tests/registry-root.test.ts
git commit -m "$(cat <<'EOF'
refactor(cli): consume resolveRegistryRoot from @aiactions/paths

Replaces three imports of cli/lib/registry-root.ts with the new
public API. Deletes the local helper and its test (coverage moved
to @aiactions/paths/tests/paths.test.ts with broader assertions on
AIA_HOME and AIA_REGISTRY_ROOT overrides).

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 11: Run repo-wide verification

**Files:** none modified.

- [ ] **Step 1: Run the full repo `ready` task**

Run from repo root:

```bash
vp run ready
```

Expected: PASS — gen:schemas + check + recursive build + recursive test all green.

- [ ] **Step 2: If anything fails, do NOT bypass**

Per `engineering-principles.md`: never `--no-verify`, never broaden lint exclusions to make a check pass. If a downstream consumer (runtime tests, agent action) failed because of an indirect import surprise, fix the consumer in a separate commit before considering Phase 1 done.

If everything passes, Phase 1 is complete; proceed to Task 12.

---

## Task 12: Detect codebase-memory drift + persist outcome in MuninnDB

**Files:** none.

- [ ] **Step 1: Sync the codebase index**

Call:

```
mcp__codebase-memory-mcp__detect_changes(
  project: "home-aperrix-Documents-PROJECTS-aiactions",
  since: "HEAD~9"
)
```

(Approximate range covering all Phase 1 commits — Task 1 through Task 11.)

If the response reports significant structural drift (new package added counts as drift), run a `moderate`-mode re-index:

```
mcp__codebase-memory-mcp__index_repository(
  repo_path: "/home/aperrix/Documents/PROJECTS/aiactions",
  mode: "moderate"
)
```

- [ ] **Step 2: Persist Phase 1 completion in MuninnDB**

Call:

```
mcp__muninn__muninn_remember(
  vault: "aiactions",
  concept: "phase-1-paths-shipped",
  type: "milestone",
  summary: "Phase 1 of architecture restructure shipped <date>: @aiactions/paths package created with env/paths/logger/telemetry-bus. cli/lib/registry-root.ts deleted; 3 callers migrated.",
  content: "Phase 1 of the 6-phase architecture restructure (spec: docs/superpowers/specs/2026-05-09-architecture-restructure-design.md) completed.\n\n## Shipped\n- @aiactions/paths v0.1.0 — leaf package, stdlib only\n- Public API: loadEnv, resolveRegistryRoot, resolveCacheRoot, resolveTmpRoot, HomeUnresolvedError, createLogger, createTelemetryBus\n- New env vars supported: AIA_HOME, AIA_REGISTRY_ROOT, AIA_TMP_ROOT (preserves existing AIA_DEBUG)\n- Defaults preserved: <home>/.aiactions/actions for registryRoot, <registryRoot>/.tmp for tmpRoot (MS1.8.6 EXDEV-safe)\n\n## Removed\n- packages/cli/src/lib/registry-root.ts (logic absorbed into @aiactions/paths)\n- packages/cli/tests/registry-root.test.ts (coverage moved with broader cases)\n\n## Migrated callers (3)\n- cli/src/commands/action/install.ts\n- cli/src/commands/action/list.ts\n- cli/src/commands/action/uninstall.ts\n\n## Next\n- Phase 2 — @aiactions/git package (cf. design spec section 12)",
  entities: [
    {name: "@aiactions/paths", type: "package"},
    {name: "AIactions", type: "project"}
  ],
  tags: ["phase-1", "architecture-restructure", "paths-package", "shipped"],
  relationships: [
    {target_id: "01KR6HWP8SW32S6HTTFWZADPZS", relation: "implements", weight: 1.0}
  ]
)
```

- [ ] **Step 3: Decide on PR strategy**

Per `collaboration.md`:

- Phase 1 touched only `packages/paths/*` and `packages/cli/*`. **Two components.** Therefore: **`git merge --no-ff`** when integrating into `main` (preserves the per-commit history so release-please routes scopes correctly).
- The branch is named `phase/1-paths-package` (or whatever the executor chose). Rebase on `main` first to flatten any drift.
- Pre-flush `vp fmt` on `main` before the merge to avoid the MS1.7 fmt-isolation trap.

If working directly on `main` (no feature branch), the per-commit Conventional Commit subjects already in place (Task 1, 2, 3, 4, 5, 6, 7, 10 each landed individually) provide the scope routing release-please needs — no special action required.

---

## Done

When Task 12 is complete, Phase 1 is done. The next plan to write is `2026-MM-DD-phase-2-git-package.md`, covering creation of `@aiactions/git`.
