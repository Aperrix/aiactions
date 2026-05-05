# MS1.4 — CLI Scaffold Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Scaffold `@aiactions/cli` (bin `aia`) and ship three cache-management verbs — `aia action install`, `aia action list`, `aia action uninstall` — wrapping `ensureCachedAction` from `@aiactions/runtime` and respecting the gh-style UX defined in the MS1.4 design spec.

**Architecture:** New workspace package `packages/cli/`. Single bundled entry `dist/main.mjs` produced by `vp pack`. Cross-platform bin via committed shim `bin/aia.mjs`. Argv routing through citty; interactive prompts through `@clack/prompts`. Public runtime API extended to expose `ensureCachedAction` + `RegistryCoordinate`.

**Tech Stack:** TypeScript (strict), Vite+ (vp pack via tsdown), citty 0.1.x, @clack/prompts 0.7.x, Vitest (via `vite-plus/test`), Node >= 22.12.0.

**Spec:** `docs/superpowers/specs/2026-05-05-ms1-4-cli-design.md`

**Branch:** `feat/ms1-4-cli-scaffold` (already created, spec already committed at `f3a1954`).

---

## File structure

| Action | Path                                            | Responsibility                                                       |
| ------ | ----------------------------------------------- | -------------------------------------------------------------------- |
| Modify | `packages/runtime/src/index.ts`                 | Re-export `ensureCachedAction` + types as public API                 |
| Create | `packages/cli/package.json`                     | Workspace package manifest, bin entry, deps                          |
| Create | `packages/cli/tsconfig.json`                    | TS strict config extending root                                      |
| Create | `packages/cli/vite.config.ts`                   | `vp pack` + lint config                                              |
| Create | `packages/cli/bin/aia.mjs`                      | Shebang shim importing `dist/main.mjs`                               |
| Create | `packages/cli/src/cli.ts`                       | citty `defineCommand(main)` + `runMain` + top-level error handler    |
| Create | `packages/cli/src/lib/exit-codes.ts`            | `EXIT.{OK,RUNTIME,USAGE,NOT_FOUND,CONFLICT}` constants               |
| Create | `packages/cli/src/lib/errors.ts`                | `CliError`, `UsageError`, `NotFoundError` classes                    |
| Create | `packages/cli/src/lib/parse-registry-ref.ts`    | Wraps `usesRefSchema`, narrows to `RegistryRef`, throws `UsageError` |
| Create | `packages/cli/src/lib/registry-root.ts`         | `resolveRegistryRoot()` → `~/.aiactions/actions`                     |
| Create | `packages/cli/src/lib/walk-cache.ts`            | Depth-3 readdir → `CachedEntry[]`                                    |
| Create | `packages/cli/src/lib/output.ts`                | Human / JSON printers; spinner helper                                |
| Create | `packages/cli/src/commands/index.ts`            | Aggregates root subcommand map                                       |
| Create | `packages/cli/src/commands/action/index.ts`     | citty parent command "action"                                        |
| Create | `packages/cli/src/commands/action/install.ts`   | `aia action install <ref>`                                           |
| Create | `packages/cli/src/commands/action/list.ts`      | `aia action list`                                                    |
| Create | `packages/cli/src/commands/action/uninstall.ts` | `aia action uninstall [<ref>]`                                       |
| Create | `packages/cli/tests/parse-registry-ref.test.ts` | Unit tests for ref parsing                                           |
| Create | `packages/cli/tests/walk-cache.test.ts`         | Unit tests for cache walker                                          |
| Create | `packages/cli/tests/registry-root.test.ts`      | Unit tests for HOME resolution                                       |
| Create | `packages/cli/tests/errors.test.ts`             | Unit tests for error class shape                                     |
| Create | `packages/cli/tests/install.test.ts`            | Command-unit tests for install                                       |
| Create | `packages/cli/tests/list.test.ts`               | Command-unit tests for list                                          |
| Create | `packages/cli/tests/uninstall.test.ts`          | Command-unit tests for uninstall                                     |
| Create | `packages/cli/tests/bin-integration.test.ts`    | End-to-end spawn tests                                               |
| Create | `packages/cli/tests/fixtures/make-bare-repo.ts` | Copy of runtime fixture                                              |
| Create | `packages/cli/tests/fixtures/with-temp-home.ts` | Tmpdir + HOME injection helper                                       |
| Create | `packages/cli/tests/fixtures/run-cli.ts`        | Spawn helper for bin integration                                     |

---

## Task 1: Promote `ensureCachedAction` to public runtime API

**Why:** CLI imports from `@aiactions/runtime` package boundary, not internal source paths. Promotion is additive — no behavioural change, just expanded re-export surface.

**Files:**

- Modify: `packages/runtime/src/index.ts`
- Test: `packages/runtime/tests/public-api.test.ts` (new)

- [ ] **Step 1: Write the failing test**

Create `packages/runtime/tests/public-api.test.ts`:

```ts
/**
 * Locks the @aiactions/runtime public API surface. Catches accidental
 * removal of symbols that downstream packages (e.g. @aiactions/cli)
 * depend on.
 */

import { expect, test } from "vite-plus/test";

import * as runtime from "../src/index.ts";

test("ensureCachedAction is exported from @aiactions/runtime", () => {
  expect(typeof runtime.ensureCachedAction).toBe("function");
});

test("RegistryCoordinate, EnsureCachedActionOptions, EnsureCachedActionResult are type-exported", () => {
  // Compile-only check: if these names are missing from src/index.ts, tsc fails.
  type _Coord = runtime.RegistryCoordinate;
  type _Opts = runtime.EnsureCachedActionOptions;
  type _Res = runtime.EnsureCachedActionResult;
  expect(true).toBe(true);
});
```

- [ ] **Step 2: Run test, verify it fails**

```bash
cd packages/runtime && vp test public-api
```

Expected: FAIL — `ensureCachedAction` is undefined (not yet exported).

- [ ] **Step 3: Add re-exports to runtime index**

Edit `packages/runtime/src/index.ts`. Append:

```ts
export {
  ensureCachedAction,
  type RegistryCoordinate,
  type EnsureCachedActionResult,
  type EnsureCachedActionOptions,
} from "./runner/uses/registry-fetch.ts";
```

- [ ] **Step 4: Run tests, verify they pass**

```bash
cd packages/runtime && vp test public-api
```

Expected: PASS (2/2).

- [ ] **Step 5: Verify whole runtime still green**

```bash
cd packages/runtime && vp test && vp check
```

Expected: all tests pass; tsc + oxlint clean.

- [ ] **Step 6: Commit**

```bash
git add packages/runtime/src/index.ts packages/runtime/tests/public-api.test.ts
git commit -m "$(cat <<'EOF'
feat(runtime): promote ensureCachedAction to public API

CLI consumers (starting with @aiactions/cli in MS1.4) need to import
the registry cache resolver through the package boundary rather than
internal source paths. Add a public-api test to lock the surface.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 2: Scaffold `@aiactions/cli` package

**Why:** Establish the workspace package shell so subsequent tasks have a place to land code. Includes minimal stub source so `vp check` / `vp test` succeed on an empty package.

**Files:**

- Create: `packages/cli/package.json`
- Create: `packages/cli/tsconfig.json`
- Create: `packages/cli/vite.config.ts`
- Create: `packages/cli/bin/aia.mjs`
- Create: `packages/cli/src/cli.ts` (stub)

- [ ] **Step 1: Create `packages/cli/package.json`**

```json
{
  "name": "@aiactions/cli",
  "version": "0.0.0",
  "private": true,
  "type": "module",
  "bin": {
    "aia": "./bin/aia.mjs"
  },
  "scripts": {
    "test": "vp test",
    "check": "vp check",
    "build": "vp pack"
  },
  "dependencies": {
    "@aiactions/runtime": "workspace:*",
    "@aiactions/workflows": "workspace:*",
    "@clack/prompts": "^0.10.1",
    "citty": "^0.1.6"
  },
  "devDependencies": {
    "@types/node": "^22.12.0"
  },
  "engines": {
    "node": ">=22.12.0"
  }
}
```

- [ ] **Step 2: Create `packages/cli/tsconfig.json`**

Mirror the runtime package's tsconfig (verified at design time — packages do not extend the root tsconfig in this monorepo, they inline the full strict config):

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

- [ ] **Step 3: Create `packages/cli/vite.config.ts`**

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
  pack: {
    entry: { main: "src/cli.ts" },
    format: "esm",
    outDir: "dist",
    outExtensions: () => ({ js: ".mjs" }),
    target: "node22",
    platform: "node",
    deps: { alwaysBundle: [/.*/] },
    clean: true,
    dts: false,
    shims: false,
  },
});
```

- [ ] **Step 4: Create `packages/cli/bin/aia.mjs`**

```js
#!/usr/bin/env node
import "../dist/main.mjs";
```

Then make executable:

```bash
chmod +x packages/cli/bin/aia.mjs
```

- [ ] **Step 5: Create `packages/cli/src/cli.ts` stub**

```ts
/**
 * Entry point for `aia`. Filled in by Task 8.
 */

export {};
```

- [ ] **Step 6: Install dependencies**

```bash
vp install
```

Expected: `citty`, `@clack/prompts` resolved; workspace deps linked.

- [ ] **Step 7: Verify package check + build pass**

```bash
cd packages/cli && vp check && vp pack
```

Expected: tsc clean; `dist/main.mjs` produced (empty bundle is fine for stub).

- [ ] **Step 8: Verify root `vp run ready` still passes**

```bash
vp run ready
```

Expected: green across the workspace including the new package.

- [ ] **Step 9: Commit**

```bash
git add packages/cli/
git commit -m "$(cat <<'EOF'
feat(cli): scaffold @aiactions/cli package

Create empty workspace package with bin shim, tsdown pack config, and
a stub entry. Dependencies wired but no commands yet — those land in
Tasks 8–11.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 3: Exit codes + error class hierarchy

**Why:** Centralised exit codes and typed error classes are the single seam through which command handlers signal failure to the top-level handler. Defined first so subsequent tasks can throw them.

**Files:**

- Create: `packages/cli/src/lib/exit-codes.ts`
- Create: `packages/cli/src/lib/errors.ts`
- Create: `packages/cli/tests/errors.test.ts`

- [ ] **Step 1: Write the failing test**

Create `packages/cli/tests/errors.test.ts`:

```ts
import { expect, test } from "vite-plus/test";

import { EXIT } from "../src/lib/exit-codes.ts";
import { CliError, NotFoundError, UsageError } from "../src/lib/errors.ts";

test("EXIT codes are stable integers", () => {
  expect(EXIT.OK).toBe(0);
  expect(EXIT.RUNTIME).toBe(1);
  expect(EXIT.USAGE).toBe(2);
  expect(EXIT.NOT_FOUND).toBe(4);
  expect(EXIT.CONFLICT).toBe(5);
});

test("CliError carries code, message, and optional cause", () => {
  const cause = new Error("boom");
  const err = new CliError(EXIT.RUNTIME, "kapow", cause);
  expect(err.code).toBe(EXIT.RUNTIME);
  expect(err.message).toBe("kapow");
  expect(err.cause).toBe(cause);
  expect(err.name).toBe("CliError");
});

test("UsageError forces EXIT.USAGE code", () => {
  const err = new UsageError("bad arg");
  expect(err.code).toBe(EXIT.USAGE);
  expect(err).toBeInstanceOf(CliError);
});

test("NotFoundError forces EXIT.NOT_FOUND code", () => {
  const err = new NotFoundError("missing");
  expect(err.code).toBe(EXIT.NOT_FOUND);
  expect(err).toBeInstanceOf(CliError);
});
```

- [ ] **Step 2: Run test, verify it fails**

```bash
cd packages/cli && vp test errors
```

Expected: FAIL — modules not yet created.

- [ ] **Step 3: Implement `exit-codes.ts`**

Create `packages/cli/src/lib/exit-codes.ts`:

```ts
/**
 * Process exit codes used by `aia`. Aligned with sysexits convention
 * (0 = OK, 2 = USAGE, 4 = data not found) plus a custom CONFLICT slot
 * reserved for future install/overwrite flows.
 */
export const EXIT = {
  OK: 0,
  RUNTIME: 1,
  USAGE: 2,
  NOT_FOUND: 4,
  CONFLICT: 5,
} as const;

export type ExitCode = (typeof EXIT)[keyof typeof EXIT];
```

- [ ] **Step 4: Implement `errors.ts`**

Create `packages/cli/src/lib/errors.ts`:

```ts
import { EXIT, type ExitCode } from "./exit-codes.ts";

/**
 * Base error type carrying a process exit code. The top-level CLI
 * handler maps `code` to `process.exit()` and surfaces `cause` only
 * when AIA_DEBUG is set.
 */
export class CliError extends Error {
  public readonly code: ExitCode;
  public readonly cause?: unknown;

  constructor(code: ExitCode, message: string, cause?: unknown) {
    super(message);
    this.name = "CliError";
    this.code = code;
    this.cause = cause;
  }
}

/** Thrown for malformed argv, refused destructive ops in non-TTY, etc. */
export class UsageError extends CliError {
  constructor(message: string) {
    super(EXIT.USAGE, message);
    this.name = "UsageError";
  }
}

/** Thrown when a referenced cache entry does not exist on disk. */
export class NotFoundError extends CliError {
  constructor(message: string) {
    super(EXIT.NOT_FOUND, message);
    this.name = "NotFoundError";
  }
}
```

- [ ] **Step 5: Run tests, verify they pass**

```bash
cd packages/cli && vp test errors
```

Expected: 4/4 PASS.

- [ ] **Step 6: Commit**

```bash
git add packages/cli/src/lib/exit-codes.ts packages/cli/src/lib/errors.ts packages/cli/tests/errors.test.ts
git commit -m "$(cat <<'EOF'
feat(cli): add exit codes and CliError hierarchy

Define EXIT.{OK,RUNTIME,USAGE,NOT_FOUND,CONFLICT} and the error
classes (CliError base + UsageError/NotFoundError) that command
handlers use to signal failure to the top-level handler.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 4: `parseRegistryRef` helper

**Why:** Single source of truth for "is this argv a usable `<ns>/<name>@<ver>` registry ref?" — wraps `usesRefSchema` from `@aiactions/workflows`, narrows to `RegistryRef`, rejects local refs (CLI does not install from disk).

**Files:**

- Create: `packages/cli/src/lib/parse-registry-ref.ts`
- Create: `packages/cli/tests/parse-registry-ref.test.ts`

- [ ] **Step 1: Write the failing test**

Create `packages/cli/tests/parse-registry-ref.test.ts`:

```ts
import { expect, test } from "vite-plus/test";

import { UsageError } from "../src/lib/errors.ts";
import { parseRegistryRef } from "../src/lib/parse-registry-ref.ts";

test("parses a well-formed registry ref", () => {
  const ref = parseRegistryRef("claude/agent@v1");
  expect(ref).toEqual({
    kind: "registry",
    raw: "claude/agent@v1",
    namespace: "claude",
    name: "agent",
    version: "v1",
  });
});

test("rejects local relative refs with UsageError", () => {
  expect(() => parseRegistryRef("./actions/lint")).toThrow(UsageError);
  expect(() => parseRegistryRef("./actions/lint")).toThrow(/install only supports registry refs/);
});

test("rejects file:// refs with UsageError", () => {
  expect(() => parseRegistryRef("file:///tmp/foo")).toThrow(UsageError);
});

test("rejects malformed refs with UsageError", () => {
  expect(() => parseRegistryRef("garbage")).toThrow(UsageError);
  expect(() => parseRegistryRef("foo/bar")).toThrow(UsageError);
  expect(() => parseRegistryRef("foo@v1")).toThrow(UsageError);
});

test("rejects empty string with UsageError", () => {
  expect(() => parseRegistryRef("")).toThrow(UsageError);
});
```

- [ ] **Step 2: Run test, verify it fails**

```bash
cd packages/cli && vp test parse-registry-ref
```

Expected: FAIL — module not created.

- [ ] **Step 3: Implement `parse-registry-ref.ts`**

Create `packages/cli/src/lib/parse-registry-ref.ts`:

```ts
import { type RegistryRef, usesRefSchema } from "@aiactions/workflows";

import { UsageError } from "./errors.ts";

/**
 * Parse a CLI argv ref string into a `RegistryRef`. Wraps the
 * upstream `usesRefSchema` and narrows the result, rejecting local
 * refs (which the CLI does not install from disk).
 */
export function parseRegistryRef(input: string): RegistryRef {
  const result = usesRefSchema.safeParse(input);
  if (!result.success) {
    const message = result.error.issues[0]?.message ?? "invalid ref";
    throw new UsageError(`bad ref '${input}': ${message}`);
  }

  if (result.data.kind !== "registry") {
    throw new UsageError(`install only supports registry refs '<ns>/<name>@<ver>', got '${input}'`);
  }

  return result.data;
}
```

- [ ] **Step 4: Run tests, verify they pass**

```bash
cd packages/cli && vp test parse-registry-ref
```

Expected: 5/5 PASS.

- [ ] **Step 5: Commit**

```bash
git add packages/cli/src/lib/parse-registry-ref.ts packages/cli/tests/parse-registry-ref.test.ts
git commit -m "$(cat <<'EOF'
feat(cli): add parseRegistryRef helper

Wraps usesRefSchema from @aiactions/workflows and narrows the parsed
union to RegistryRef. Local and file:// refs raise UsageError because
the CLI installs only from the canonical registry, not from disk.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 5: `resolveRegistryRoot` helper

**Why:** Centralise the cache root path so tests can override `HOME` and production stays at `~/.aiactions/actions`. Future MS may add `--registry-root` flag — single helper makes that change one-line.

**Files:**

- Create: `packages/cli/src/lib/registry-root.ts`
- Create: `packages/cli/tests/registry-root.test.ts`

- [ ] **Step 1: Write the failing test**

Create `packages/cli/tests/registry-root.test.ts`:

```ts
import { join } from "node:path";

import { expect, test } from "vite-plus/test";

import { resolveRegistryRoot } from "../src/lib/registry-root.ts";

test("resolveRegistryRoot honours injected HOME", () => {
  const root = resolveRegistryRoot({ home: "/tmp/fake-home" });
  expect(root).toBe(join("/tmp/fake-home", ".aiactions", "actions"));
});

test("resolveRegistryRoot falls back to process.env.HOME", () => {
  const original = process.env.HOME;
  process.env.HOME = "/tmp/env-home";
  try {
    const root = resolveRegistryRoot();
    expect(root).toBe(join("/tmp/env-home", ".aiactions", "actions"));
  } finally {
    process.env.HOME = original;
  }
});

test("resolveRegistryRoot throws when HOME is unset and no override", () => {
  const original = process.env.HOME;
  delete process.env.HOME;
  try {
    expect(() => resolveRegistryRoot()).toThrow(/HOME is not set/);
  } finally {
    if (original !== undefined) process.env.HOME = original;
  }
});
```

- [ ] **Step 2: Run test, verify it fails**

```bash
cd packages/cli && vp test registry-root
```

Expected: FAIL — module not created.

- [ ] **Step 3: Implement `registry-root.ts`**

Create `packages/cli/src/lib/registry-root.ts`:

```ts
import { join } from "node:path";

export interface ResolveRegistryRootOptions {
  /** Override `HOME` resolution. Tests inject a tmpdir; prod leaves unset. */
  readonly home?: string;
}

/**
 * Resolve the user-level actions cache root: `<HOME>/.aiactions/actions`.
 * Throws if `HOME` is not set and no override is provided.
 */
export function resolveRegistryRoot(options: ResolveRegistryRootOptions = {}): string {
  const home = options.home ?? process.env.HOME;
  if (!home) {
    throw new Error("HOME is not set; cannot locate ~/.aiactions/actions cache root");
  }
  return join(home, ".aiactions", "actions");
}
```

- [ ] **Step 4: Run tests, verify they pass**

```bash
cd packages/cli && vp test registry-root
```

Expected: 3/3 PASS.

- [ ] **Step 5: Commit**

```bash
git add packages/cli/src/lib/registry-root.ts packages/cli/tests/registry-root.test.ts
git commit -m "$(cat <<'EOF'
feat(cli): add resolveRegistryRoot helper

Single seam for the actions cache root. Honours an injected home for
tests, falls back to process.env.HOME, throws if unset.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 6: `walkCache` helper

**Why:** `aia action list` and `aia action uninstall` (no-arg interactive mode) both need to enumerate cache entries at depth 3 (`<root>/<ns>/<name>/<ver>`). Single helper keeps logic out of command handlers.

**Files:**

- Create: `packages/cli/src/lib/walk-cache.ts`
- Create: `packages/cli/tests/walk-cache.test.ts`
- Create: `packages/cli/tests/fixtures/with-temp-home.ts`

- [ ] **Step 1: Create the temp-home test helper**

Create `packages/cli/tests/fixtures/with-temp-home.ts`:

```ts
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

export interface TempHome {
  readonly home: string;
  readonly registryRoot: string;
  cleanup(): Promise<void>;
}

/**
 * Create a tmpdir, return it as `home`, plus the conventional
 * `<home>/.aiactions/actions` derivative for direct fs writes.
 * Caller is responsible for invoking `cleanup()` (e.g. in `afterEach`).
 */
export async function makeTempHome(): Promise<TempHome> {
  const home = await mkdtemp(join(tmpdir(), "aia-cli-"));
  return {
    home,
    registryRoot: join(home, ".aiactions", "actions"),
    cleanup: () => rm(home, { recursive: true, force: true }),
  };
}
```

- [ ] **Step 2: Write the failing test**

Create `packages/cli/tests/walk-cache.test.ts`:

```ts
import { mkdir } from "node:fs/promises";
import { join } from "node:path";

import { afterEach, beforeEach, expect, test } from "vite-plus/test";

import { walkCache } from "../src/lib/walk-cache.ts";
import { makeTempHome, type TempHome } from "./fixtures/with-temp-home.ts";

let env: TempHome;

beforeEach(async () => {
  env = await makeTempHome();
});

afterEach(async () => {
  await env.cleanup();
});

test("returns empty array when registry root is missing", async () => {
  const entries = await walkCache(env.registryRoot);
  expect(entries).toEqual([]);
});

test("returns empty array when registry root exists but is empty", async () => {
  await mkdir(env.registryRoot, { recursive: true });
  const entries = await walkCache(env.registryRoot);
  expect(entries).toEqual([]);
});

test("enumerates all <ns>/<name>/<ver> entries", async () => {
  await mkdir(join(env.registryRoot, "claude", "agent", "v1"), { recursive: true });
  await mkdir(join(env.registryRoot, "claude", "agent", "v2"), { recursive: true });
  await mkdir(join(env.registryRoot, "openai", "review", "v1"), { recursive: true });

  const entries = await walkCache(env.registryRoot);
  expect(entries).toHaveLength(3);
  expect(entries).toContainEqual({
    namespace: "claude",
    name: "agent",
    version: "v1",
    dir: join(env.registryRoot, "claude", "agent", "v1"),
  });
  expect(entries).toContainEqual({
    namespace: "claude",
    name: "agent",
    version: "v2",
    dir: join(env.registryRoot, "claude", "agent", "v2"),
  });
  expect(entries).toContainEqual({
    namespace: "openai",
    name: "review",
    version: "v1",
    dir: join(env.registryRoot, "openai", "review", "v1"),
  });
});

test("ignores files at any level (only directories count)", async () => {
  await mkdir(join(env.registryRoot, "claude", "agent", "v1"), { recursive: true });
  // a stray file at <ns>/<name>/ level — should not be returned as a version
  const { writeFile } = await import("node:fs/promises");
  await writeFile(join(env.registryRoot, "claude", "agent", "stray.txt"), "");

  const entries = await walkCache(env.registryRoot);
  expect(entries).toHaveLength(1);
  expect(entries[0]?.version).toBe("v1");
});
```

- [ ] **Step 3: Run test, verify it fails**

```bash
cd packages/cli && vp test walk-cache
```

Expected: FAIL — `walkCache` not implemented.

- [ ] **Step 4: Implement `walk-cache.ts`**

Create `packages/cli/src/lib/walk-cache.ts`:

```ts
import { readdir, stat } from "node:fs/promises";
import { join } from "node:path";

export interface CachedEntry {
  readonly namespace: string;
  readonly name: string;
  readonly version: string;
  readonly dir: string;
}

/**
 * Walk `<root>/<ns>/<name>/<ver>` at fixed depth 3. Returns every
 * directory triple that exists. Missing root → `[]`. Files at any
 * level are ignored (only directories count as namespace/name/version
 * segments).
 */
export async function walkCache(root: string): Promise<CachedEntry[]> {
  let nsEntries: string[];
  try {
    nsEntries = await readdir(root);
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === "ENOENT") return [];
    throw err;
  }

  const entries: CachedEntry[] = [];
  for (const namespace of nsEntries) {
    const nsDir = join(root, namespace);
    if (!(await isDirectory(nsDir))) continue;

    const nameEntries = await readdir(nsDir);
    for (const name of nameEntries) {
      const nameDir = join(nsDir, name);
      if (!(await isDirectory(nameDir))) continue;

      const versionEntries = await readdir(nameDir);
      for (const version of versionEntries) {
        const dir = join(nameDir, version);
        if (!(await isDirectory(dir))) continue;
        entries.push({ namespace, name, version, dir });
      }
    }
  }
  return entries;
}

async function isDirectory(path: string): Promise<boolean> {
  try {
    return (await stat(path)).isDirectory();
  } catch {
    return false;
  }
}
```

- [ ] **Step 5: Run tests, verify they pass**

```bash
cd packages/cli && vp test walk-cache
```

Expected: 4/4 PASS.

- [ ] **Step 6: Commit**

```bash
git add packages/cli/src/lib/walk-cache.ts packages/cli/tests/walk-cache.test.ts packages/cli/tests/fixtures/with-temp-home.ts
git commit -m "$(cat <<'EOF'
feat(cli): add walkCache helper + temp-home fixture

walkCache enumerates <root>/<ns>/<name>/<ver> at depth 3, ignoring
files. Used by `aia action list` and the no-arg multi-select flow of
`aia action uninstall`. The temp-home fixture isolates tests from the
real ~/.aiactions/actions cache.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 7: Output helpers (printers + spinner)

**Why:** Centralise human-vs-JSON output formatting so commands stay focused on logic, not presentation. Includes a TTY-degrading spinner that no-ops when `--json` or non-interactive.

**Files:**

- Create: `packages/cli/src/lib/output.ts`
- Create: `packages/cli/tests/output.test.ts`

- [ ] **Step 1: Write the failing test**

Create `packages/cli/tests/output.test.ts`:

```ts
import { expect, test } from "vite-plus/test";

import { formatTable, type TableColumn } from "../src/lib/output.ts";

test("formatTable aligns columns with padEnd", () => {
  const cols: TableColumn<{ a: string; b: string }>[] = [
    { header: "A", value: (r) => r.a },
    { header: "B", value: (r) => r.b },
  ];
  const rows = [
    { a: "foo", b: "1" },
    { a: "longer", b: "10" },
  ];
  const out = formatTable(rows, cols);
  const lines = out.split("\n");
  expect(lines).toHaveLength(3);
  expect(lines[0]).toBe("A       B ");
  expect(lines[1]).toBe("foo     1 ");
  expect(lines[2]).toBe("longer  10");
});

test("formatTable on empty input returns empty string", () => {
  const out = formatTable([], [{ header: "A", value: () => "" }]);
  expect(out).toBe("");
});
```

- [ ] **Step 2: Run test, verify it fails**

```bash
cd packages/cli && vp test output
```

Expected: FAIL — module not created.

- [ ] **Step 3: Implement `output.ts`**

Create `packages/cli/src/lib/output.ts`:

```ts
export interface TableColumn<T> {
  readonly header: string;
  readonly value: (row: T) => string;
}

/**
 * Render `rows` as a left-aligned table with two-space gutters between
 * columns. Returns the empty string when `rows` is empty (callers
 * decide what to show in that case).
 */
export function formatTable<T>(rows: T[], cols: TableColumn<T>[]): string {
  if (rows.length === 0) return "";
  const widths = cols.map((col) =>
    Math.max(col.header.length, ...rows.map((r) => col.value(r).length)),
  );
  const sep = "  ";

  const renderRow = (cells: string[]): string =>
    cells
      .map((cell, i) => cell.padEnd(widths[i] ?? 0))
      .join(sep)
      .replace(/\s+$/u, (trail) => trail.slice(0, -sep.length));

  const lines = [
    renderRow(cols.map((col) => col.header)),
    ...rows.map((row) => renderRow(cols.map((col) => col.value(row)))),
  ];
  return lines.join("\n");
}

/**
 * Returns true when interactive prompts/spinners should be shown:
 * stdout is a TTY *and* the command was not invoked with --json.
 */
export function isInteractive(json: boolean): boolean {
  return !json && Boolean(process.stdout.isTTY);
}
```

- [ ] **Step 4: Run tests, verify they pass**

```bash
cd packages/cli && vp test output
```

Expected: 2/2 PASS.

- [ ] **Step 5: Commit**

```bash
git add packages/cli/src/lib/output.ts packages/cli/tests/output.test.ts
git commit -m "$(cat <<'EOF'
feat(cli): add formatTable + isInteractive helpers

Pure formatters: a padEnd-based two-space-gutter table renderer for
list output, and an isInteractive predicate that gates clack prompts
on TTY + !--json.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 8: `cli.ts` entry + top-level handler + `--version`

**Why:** Establish the citty entrypoint and the catch-all error handler before adding any verb. The smallest end-to-end check is `aia --version`, which exercises argv parsing → run → exit without touching the cache.

**Files:**

- Modify: `packages/cli/src/cli.ts` (replaces stub)
- Create: `packages/cli/src/commands/index.ts`
- Create: `packages/cli/tests/fixtures/run-cli.ts`
- Create: `packages/cli/tests/bin-integration.test.ts`

- [ ] **Step 1: Create the run-cli test fixture**

Create `packages/cli/tests/fixtures/run-cli.ts`:

```ts
import { execFile } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { promisify } from "node:util";

const pExecFile = promisify(execFile);

const BIN = resolve(dirname(fileURLToPath(import.meta.url)), "../../bin/aia.mjs");

export interface CliRunResult {
  readonly exitCode: number;
  readonly stdout: string;
  readonly stderr: string;
}

/**
 * Spawn the built CLI as a child process. Requires `vp pack` to have
 * produced `dist/main.mjs` first (run-cli is for bin integration
 * tests, not unit tests).
 */
export async function runCli(args: string[], env: NodeJS.ProcessEnv = {}): Promise<CliRunResult> {
  try {
    const { stdout, stderr } = await pExecFile("node", [BIN, ...args], {
      env: { ...process.env, ...env },
    });
    return { exitCode: 0, stdout, stderr };
  } catch (err) {
    const e = err as NodeJS.ErrnoException & {
      code?: number;
      stdout?: string;
      stderr?: string;
    };
    return {
      exitCode: typeof e.code === "number" ? e.code : 1,
      stdout: e.stdout ?? "",
      stderr: e.stderr ?? "",
    };
  }
}
```

- [ ] **Step 2: Write the failing bin integration test**

Create `packages/cli/tests/bin-integration.test.ts`:

```ts
import { expect, test } from "vite-plus/test";

import { runCli } from "./fixtures/run-cli.ts";

test("aia --version prints the package version", async () => {
  const result = await runCli(["--version"]);
  expect(result.exitCode).toBe(0);
  expect(result.stdout.trim()).toBe("0.0.0");
});

test("aia --help prints USAGE block", async () => {
  const result = await runCli(["--help"]);
  expect(result.exitCode).toBe(0);
  expect(result.stdout).toContain("USAGE");
  expect(result.stdout).toContain("aia");
});

test("aia with no args exits non-zero with usage hint", async () => {
  const result = await runCli([]);
  expect(result.exitCode).not.toBe(0);
  expect(result.stderr + result.stdout).toMatch(/USAGE|help/i);
});
```

- [ ] **Step 3: Run test, verify it fails**

```bash
cd packages/cli && vp pack && vp test bin-integration
```

Expected: FAIL — entry still a stub, no version output.

- [ ] **Step 4: Implement `commands/index.ts`**

Create `packages/cli/src/commands/index.ts`:

```ts
import { defineCommand } from "citty";

/**
 * Root subcommand registry. Filled in as verb groups land
 * (action: Task 9–11; workflow: MS1.6+).
 */
export const subCommands = {
  // action: defineCommand(...) — Task 9
} as Record<string, ReturnType<typeof defineCommand>>;
```

- [ ] **Step 5: Implement `cli.ts`**

Replace `packages/cli/src/cli.ts`:

```ts
import { defineCommand, runMain } from "citty";

import { subCommands } from "./commands/index.ts";
import { CliError } from "./lib/errors.ts";
import { EXIT } from "./lib/exit-codes.ts";

const main = defineCommand({
  meta: {
    name: "aia",
    version: "0.0.0",
    description: "AIactions CLI",
  },
  subCommands,
});

try {
  await runMain(main);
} catch (err) {
  if (err instanceof CliError) {
    process.stderr.write(`✖ ${err.message}\n`);
    if (process.env.AIA_DEBUG && err.cause) {
      const cause = err.cause as Error;
      process.stderr.write(`${cause.stack ?? String(cause)}\n`);
    }
    process.exit(err.code);
  }
  const e = err as Error;
  process.stderr.write(`✖ ${e.message}\n`);
  if (process.env.AIA_DEBUG) {
    process.stderr.write(`${e.stack ?? ""}\n`);
  }
  process.exit(EXIT.RUNTIME);
}
```

- [ ] **Step 6: Build then run tests**

```bash
cd packages/cli && vp pack && vp test bin-integration
```

Expected: 3/3 PASS (`--version` returns `0.0.0`, `--help` shows USAGE, no-arg fails non-zero).

- [ ] **Step 7: Verify root vp run ready**

```bash
vp run ready
```

Expected: green.

- [ ] **Step 8: Commit**

```bash
git add packages/cli/src/cli.ts packages/cli/src/commands/index.ts packages/cli/tests/bin-integration.test.ts packages/cli/tests/fixtures/run-cli.ts
git commit -m "$(cat <<'EOF'
feat(cli): wire citty entrypoint with top-level error handler

Replace the stub entry with a citty defineCommand+runMain pair backed
by the empty subCommands map. Every uncaught exception is mapped to a
typed exit code via CliError; AIA_DEBUG=1 surfaces stacks. Add bin
integration tests covering --version, --help, and no-arg usage.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 9: `action install <ref>` command

**Why:** First real verb. Wraps `ensureCachedAction` with citty argv parsing, TTY-aware spinner, JSON mode, and the `AIACTIONS_CANONICAL_URL` test/dev knob.

**Files:**

- Create: `packages/cli/src/commands/action/install.ts`
- Create: `packages/cli/src/commands/action/index.ts`
- Modify: `packages/cli/src/commands/index.ts` (register `action`)
- Create: `packages/cli/tests/fixtures/make-bare-repo.ts` (copy)
- Create: `packages/cli/tests/install.test.ts`

- [ ] **Step 1: Copy the bare-repo fixture**

```bash
cp packages/runtime/tests/fixtures/registry/make-bare-repo.ts packages/cli/tests/fixtures/make-bare-repo.ts
```

(No edits needed — the file is self-contained and uses only Node stdlib.)

- [ ] **Step 2: Write the failing tests**

Create `packages/cli/tests/install.test.ts`:

```ts
import { mkdir, readdir } from "node:fs/promises";
import { join } from "node:path";

import { afterEach, beforeEach, expect, test, vi } from "vite-plus/test";

import { installCommand } from "../src/commands/action/install.ts";
import { UsageError } from "../src/lib/errors.ts";
import { makeBareRepoWithAction } from "./fixtures/make-bare-repo.ts";
import { makeTempHome, type TempHome } from "./fixtures/with-temp-home.ts";

let env: TempHome;

beforeEach(async () => {
  env = await makeTempHome();
});

afterEach(async () => {
  await env.cleanup();
});

test("rejects malformed ref with UsageError", async () => {
  await expect(
    installCommand.run!({
      args: { ref: "garbage", json: false } as never,
      cmd: installCommand,
      data: undefined,
      rawArgs: [],
    }),
  ).rejects.toThrow(UsageError);
});

test("rejects local ref with UsageError", async () => {
  await expect(
    installCommand.run!({
      args: { ref: "./local", json: false } as never,
      cmd: installCommand,
      data: undefined,
      rawArgs: [],
    }),
  ).rejects.toThrow(/install only supports registry refs/);
});

test("end-to-end: cache miss → fetch from bare repo → cache populated", async () => {
  const bareRepo = await makeBareRepoWithAction({
    cwd: env.home,
    namespace: "test",
    name: "noop",
    version: "v1",
    files: { "action.yml": "name: noop\nruns: { using: noop }\n" },
  });

  process.env.HOME = env.home;
  process.env.AIACTIONS_CANONICAL_URL = `file://${bareRepo}`;
  // Force non-TTY so no spinner output pollutes captures.
  Object.defineProperty(process.stdout, "isTTY", { value: false, configurable: true });

  const stdoutChunks: string[] = [];
  const stderrChunks: string[] = [];
  const stdoutSpy = vi.spyOn(process.stdout, "write").mockImplementation((c) => {
    stdoutChunks.push(String(c));
    return true;
  });
  const stderrSpy = vi.spyOn(process.stderr, "write").mockImplementation((c) => {
    stderrChunks.push(String(c));
    return true;
  });

  try {
    await installCommand.run!({
      args: { ref: "test/noop@v1", json: true } as never,
      cmd: installCommand,
      data: undefined,
      rawArgs: [],
    });
  } finally {
    stdoutSpy.mockRestore();
    stderrSpy.mockRestore();
    delete process.env.AIACTIONS_CANONICAL_URL;
  }

  // JSON mode emits a single JSON object on stdout
  const out = JSON.parse(stdoutChunks.join(""));
  expect(out.ref).toBe("test/noop@v1");
  expect(out.fetched).toBe(true);
  expect(out.dir).toBe(join(env.registryRoot, "test", "noop", "v1"));
  expect(typeof out.resolvedSha).toBe("string");

  // Cache populated on disk
  const versions = await readdir(join(env.registryRoot, "test", "noop"));
  expect(versions).toEqual(["v1"]);
});

test("cache hit short-circuits — fetched: false", async () => {
  // Pre-populate cache without touching network/git
  const dir = join(env.registryRoot, "test", "preinstalled", "v1");
  await mkdir(dir, { recursive: true });

  process.env.HOME = env.home;
  Object.defineProperty(process.stdout, "isTTY", { value: false, configurable: true });

  const stdoutChunks: string[] = [];
  const stdoutSpy = vi.spyOn(process.stdout, "write").mockImplementation((c) => {
    stdoutChunks.push(String(c));
    return true;
  });

  try {
    await installCommand.run!({
      args: { ref: "test/preinstalled@v1", json: true } as never,
      cmd: installCommand,
      data: undefined,
      rawArgs: [],
    });
  } finally {
    stdoutSpy.mockRestore();
  }

  const out = JSON.parse(stdoutChunks.join(""));
  expect(out.fetched).toBe(false);
  expect(out.resolvedSha).toBeNull();
});
```

- [ ] **Step 3: Run tests, verify they fail**

```bash
cd packages/cli && vp test install
```

Expected: FAIL — `installCommand` not exported.

- [ ] **Step 4: Implement `install.ts`**

Create `packages/cli/src/commands/action/install.ts`:

```ts
import { ensureCachedAction } from "@aiactions/runtime";
import * as clack from "@clack/prompts";
import { defineCommand } from "citty";

import { CliError } from "../../lib/errors.ts";
import { EXIT } from "../../lib/exit-codes.ts";
import { isInteractive } from "../../lib/output.ts";
import { parseRegistryRef } from "../../lib/parse-registry-ref.ts";
import { resolveRegistryRoot } from "../../lib/registry-root.ts";

export const installCommand = defineCommand({
  meta: {
    name: "install",
    description: "Install an action from the registry into the local cache",
  },
  args: {
    ref: {
      type: "positional",
      description: "Registry coordinate '<ns>/<name>@<ver>'",
      required: true,
    },
    json: {
      type: "boolean",
      description: "Emit machine-readable JSON instead of human output",
      default: false,
    },
  },
  async run({ args }) {
    const ref = parseRegistryRef(args.ref);
    const registryRoot = resolveRegistryRoot();
    const interactive = isInteractive(args.json);

    const canonicalUrl = process.env.AIACTIONS_CANONICAL_URL;
    const options = canonicalUrl ? { canonicalUrl } : {};

    let spinner: ReturnType<typeof clack.spinner> | undefined;
    if (interactive) {
      spinner = clack.spinner();
      spinner.start(`fetching ${args.ref}`);
    }

    try {
      const result = await ensureCachedAction(
        { namespace: ref.namespace, name: ref.name, version: ref.version },
        registryRoot,
        process.cwd(),
        options,
      );
      spinner?.stop(result.fetched ? `installed ${args.ref}` : `already cached ${args.ref}`);

      if (args.json) {
        process.stdout.write(
          `${JSON.stringify({
            ref: args.ref,
            dir: result.dir,
            fetched: result.fetched,
            resolvedSha: result.resolvedSha,
          })}\n`,
        );
      } else if (!interactive) {
        // Non-TTY, non-JSON: emit a single status line on stderr
        process.stderr.write(
          `${result.fetched ? "✓ installed" : "✓ already cached"} ${args.ref}\n`,
        );
      }
    } catch (err) {
      spinner?.stop(`failed: ${args.ref}`, 1);
      throw new CliError(
        EXIT.RUNTIME,
        `install failed for ${args.ref}: ${(err as Error).message}`,
        err,
      );
    }
  },
});
```

- [ ] **Step 5: Implement `commands/action/index.ts`**

Create `packages/cli/src/commands/action/index.ts`:

```ts
import { defineCommand } from "citty";

import { installCommand } from "./install.ts";

export const actionCommand = defineCommand({
  meta: {
    name: "action",
    description: "Manage AIactions actions cached locally",
  },
  subCommands: {
    install: installCommand,
    // list: Task 10
    // uninstall: Task 11
  },
});
```

- [ ] **Step 6: Register `action` in root subcommands**

Replace `packages/cli/src/commands/index.ts`:

```ts
import { actionCommand } from "./action/index.ts";

export const subCommands = {
  action: actionCommand,
};
```

- [ ] **Step 7: Run tests, verify they pass**

```bash
cd packages/cli && vp test install
```

Expected: 4/4 PASS.

- [ ] **Step 8: Verify build still works**

```bash
cd packages/cli && vp pack && vp test bin-integration
```

Expected: bundle rebuilt; bin integration tests still 3/3 PASS.

- [ ] **Step 9: Commit**

```bash
git add packages/cli/src/commands/ packages/cli/tests/install.test.ts packages/cli/tests/fixtures/make-bare-repo.ts
git commit -m "$(cat <<'EOF'
feat(cli): add `aia action install <ref>`

First real verb. Wraps ensureCachedAction with citty arg parsing,
clack spinner gated on TTY, and a JSON mode for scripting. Tests
cover the happy path against a local bare-repo fixture, cache-hit
short-circuit, and ref parsing failures. The
AIACTIONS_CANONICAL_URL env var lets bin integration tests point at
the fixture without network.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 10: `action list` command

**Why:** Read-only verb. Walks the cache and prints either a 4-column table or a JSON array. Empty cache emits a stderr note and exits 0.

**Files:**

- Create: `packages/cli/src/commands/action/list.ts`
- Modify: `packages/cli/src/commands/action/index.ts` (register `list`)
- Create: `packages/cli/tests/list.test.ts`

- [ ] **Step 1: Write the failing tests**

Create `packages/cli/tests/list.test.ts`:

```ts
import { mkdir } from "node:fs/promises";
import { join } from "node:path";

import { afterEach, beforeEach, expect, test, vi } from "vite-plus/test";

import { listCommand } from "../src/commands/action/list.ts";
import { makeTempHome, type TempHome } from "./fixtures/with-temp-home.ts";

let env: TempHome;

beforeEach(async () => {
  env = await makeTempHome();
  process.env.HOME = env.home;
  Object.defineProperty(process.stdout, "isTTY", { value: false, configurable: true });
});

afterEach(async () => {
  await env.cleanup();
});

test("empty cache → stderr note, no stdout, exit 0", async () => {
  const stdoutChunks: string[] = [];
  const stderrChunks: string[] = [];
  const stdoutSpy = vi.spyOn(process.stdout, "write").mockImplementation((c) => {
    stdoutChunks.push(String(c));
    return true;
  });
  const stderrSpy = vi.spyOn(process.stderr, "write").mockImplementation((c) => {
    stderrChunks.push(String(c));
    return true;
  });

  try {
    await listCommand.run!({
      args: { json: false } as never,
      cmd: listCommand,
      data: undefined,
      rawArgs: [],
    });
  } finally {
    stdoutSpy.mockRestore();
    stderrSpy.mockRestore();
  }

  expect(stdoutChunks.join("")).toBe("");
  expect(stderrChunks.join("")).toContain("no cached actions");
});

test("populated cache → table on stdout with header + rows", async () => {
  await mkdir(join(env.registryRoot, "claude", "agent", "v1"), { recursive: true });
  await mkdir(join(env.registryRoot, "openai", "review", "v2"), { recursive: true });

  const stdoutChunks: string[] = [];
  const stdoutSpy = vi.spyOn(process.stdout, "write").mockImplementation((c) => {
    stdoutChunks.push(String(c));
    return true;
  });

  try {
    await listCommand.run!({
      args: { json: false } as never,
      cmd: listCommand,
      data: undefined,
      rawArgs: [],
    });
  } finally {
    stdoutSpy.mockRestore();
  }

  const out = stdoutChunks.join("");
  expect(out).toContain("NAMESPACE");
  expect(out).toContain("NAME");
  expect(out).toContain("VERSION");
  expect(out).toContain("PATH");
  expect(out).toContain("claude");
  expect(out).toContain("agent");
  expect(out).toContain("v1");
  expect(out).toContain("openai");
  expect(out).toContain("review");
  expect(out).toContain("v2");
});

test("--json on populated cache → JSON array of entries", async () => {
  await mkdir(join(env.registryRoot, "claude", "agent", "v1"), { recursive: true });

  const stdoutChunks: string[] = [];
  const stdoutSpy = vi.spyOn(process.stdout, "write").mockImplementation((c) => {
    stdoutChunks.push(String(c));
    return true;
  });

  try {
    await listCommand.run!({
      args: { json: true } as never,
      cmd: listCommand,
      data: undefined,
      rawArgs: [],
    });
  } finally {
    stdoutSpy.mockRestore();
  }

  const out = JSON.parse(stdoutChunks.join(""));
  expect(out).toEqual([
    {
      namespace: "claude",
      name: "agent",
      version: "v1",
      dir: join(env.registryRoot, "claude", "agent", "v1"),
    },
  ]);
});

test("--json on empty cache → JSON empty array", async () => {
  const stdoutChunks: string[] = [];
  const stdoutSpy = vi.spyOn(process.stdout, "write").mockImplementation((c) => {
    stdoutChunks.push(String(c));
    return true;
  });

  try {
    await listCommand.run!({
      args: { json: true } as never,
      cmd: listCommand,
      data: undefined,
      rawArgs: [],
    });
  } finally {
    stdoutSpy.mockRestore();
  }

  expect(JSON.parse(stdoutChunks.join(""))).toEqual([]);
});
```

- [ ] **Step 2: Run tests, verify they fail**

```bash
cd packages/cli && vp test list
```

Expected: FAIL — `listCommand` not implemented.

- [ ] **Step 3: Implement `list.ts`**

Create `packages/cli/src/commands/action/list.ts`:

```ts
import { defineCommand } from "citty";

import { formatTable } from "../../lib/output.ts";
import { resolveRegistryRoot } from "../../lib/registry-root.ts";
import { walkCache } from "../../lib/walk-cache.ts";

export const listCommand = defineCommand({
  meta: {
    name: "list",
    description: "List actions in the local cache",
  },
  args: {
    json: {
      type: "boolean",
      description: "Emit machine-readable JSON instead of a table",
      default: false,
    },
  },
  async run({ args }) {
    const registryRoot = resolveRegistryRoot();
    const entries = await walkCache(registryRoot);

    if (args.json) {
      process.stdout.write(`${JSON.stringify(entries)}\n`);
      return;
    }

    if (entries.length === 0) {
      process.stderr.write("no cached actions\n");
      return;
    }

    const table = formatTable(entries, [
      { header: "NAMESPACE", value: (e) => e.namespace },
      { header: "NAME", value: (e) => e.name },
      { header: "VERSION", value: (e) => e.version },
      { header: "PATH", value: (e) => e.dir },
    ]);
    process.stdout.write(`${table}\n`);
  },
});
```

- [ ] **Step 4: Register `list` in `commands/action/index.ts`**

Replace `packages/cli/src/commands/action/index.ts`:

```ts
import { defineCommand } from "citty";

import { installCommand } from "./install.ts";
import { listCommand } from "./list.ts";

export const actionCommand = defineCommand({
  meta: {
    name: "action",
    description: "Manage AIactions actions cached locally",
  },
  subCommands: {
    install: installCommand,
    list: listCommand,
    // uninstall: Task 11
  },
});
```

- [ ] **Step 5: Run tests, verify they pass**

```bash
cd packages/cli && vp test list
```

Expected: 4/4 PASS.

- [ ] **Step 6: Commit**

```bash
git add packages/cli/src/commands/action/list.ts packages/cli/src/commands/action/index.ts packages/cli/tests/list.test.ts
git commit -m "$(cat <<'EOF'
feat(cli): add `aia action list`

Read-only verb. Walks ~/.aiactions/actions/<ns>/<name>/<ver> and
emits either a four-column padded table or a JSON array. Empty cache
prints a stderr note and exits 0 — no error, just nothing to list.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 11: `action uninstall [<ref>]` command

**Why:** Last verb. Two modes: explicit ref (single removal) and no-arg interactive (multi-select picker over the cache). Non-TTY without `--yes` is refused to stop accidental destruction in CI/scripts.

**Files:**

- Create: `packages/cli/src/commands/action/uninstall.ts`
- Modify: `packages/cli/src/commands/action/index.ts` (register `uninstall`)
- Create: `packages/cli/tests/uninstall.test.ts`

- [ ] **Step 1: Write the failing tests**

Create `packages/cli/tests/uninstall.test.ts`:

```ts
import { mkdir, stat } from "node:fs/promises";
import { join } from "node:path";

import { afterEach, beforeEach, expect, test, vi } from "vite-plus/test";

import { uninstallCommand } from "../src/commands/action/uninstall.ts";
import { NotFoundError, UsageError } from "../src/lib/errors.ts";
import { makeTempHome, type TempHome } from "./fixtures/with-temp-home.ts";

let env: TempHome;

beforeEach(async () => {
  env = await makeTempHome();
  process.env.HOME = env.home;
  Object.defineProperty(process.stdout, "isTTY", { value: false, configurable: true });
});

afterEach(async () => {
  await env.cleanup();
});

async function pre(ns: string, name: string, ver: string): Promise<string> {
  const dir = join(env.registryRoot, ns, name, ver);
  await mkdir(dir, { recursive: true });
  return dir;
}

async function exists(p: string): Promise<boolean> {
  try {
    await stat(p);
    return true;
  } catch {
    return false;
  }
}

test("ref + --yes → removes entry and prunes empty parents", async () => {
  await pre("claude", "agent", "v1");
  await uninstallCommand.run!({
    args: { ref: "claude/agent@v1", yes: true, json: false } as never,
    cmd: uninstallCommand,
    data: undefined,
    rawArgs: [],
  });
  expect(await exists(join(env.registryRoot, "claude", "agent", "v1"))).toBe(false);
  expect(await exists(join(env.registryRoot, "claude", "agent"))).toBe(false);
  expect(await exists(join(env.registryRoot, "claude"))).toBe(false);
});

test("ref + --yes preserves sibling versions", async () => {
  await pre("claude", "agent", "v1");
  await pre("claude", "agent", "v2");
  await uninstallCommand.run!({
    args: { ref: "claude/agent@v1", yes: true, json: false } as never,
    cmd: uninstallCommand,
    data: undefined,
    rawArgs: [],
  });
  expect(await exists(join(env.registryRoot, "claude", "agent", "v1"))).toBe(false);
  expect(await exists(join(env.registryRoot, "claude", "agent", "v2"))).toBe(true);
});

test("ref absent → NotFoundError", async () => {
  await expect(
    uninstallCommand.run!({
      args: { ref: "ghost/missing@v1", yes: true, json: false } as never,
      cmd: uninstallCommand,
      data: undefined,
      rawArgs: [],
    }),
  ).rejects.toThrow(NotFoundError);
});

test("malformed ref → UsageError", async () => {
  await expect(
    uninstallCommand.run!({
      args: { ref: "garbage", yes: true, json: false } as never,
      cmd: uninstallCommand,
      data: undefined,
      rawArgs: [],
    }),
  ).rejects.toThrow(UsageError);
});

test("no-arg + non-TTY → UsageError (refuse destructive op)", async () => {
  await pre("claude", "agent", "v1");
  await expect(
    uninstallCommand.run!({
      args: { ref: "", yes: false, json: false } as never,
      cmd: uninstallCommand,
      data: undefined,
      rawArgs: [],
    }),
  ).rejects.toThrow(UsageError);
});

test("ref + non-TTY + no --yes → UsageError", async () => {
  await pre("claude", "agent", "v1");
  await expect(
    uninstallCommand.run!({
      args: { ref: "claude/agent@v1", yes: false, json: false } as never,
      cmd: uninstallCommand,
      data: undefined,
      rawArgs: [],
    }),
  ).rejects.toThrow(/refusing destructive op/);
});

test("--json without ref → UsageError", async () => {
  await expect(
    uninstallCommand.run!({
      args: { ref: "", yes: true, json: true } as never,
      cmd: uninstallCommand,
      data: undefined,
      rawArgs: [],
    }),
  ).rejects.toThrow(UsageError);
});

test("ref + --yes + --json → emits JSON receipt", async () => {
  const dir = await pre("claude", "agent", "v1");
  const stdoutChunks: string[] = [];
  const stdoutSpy = vi.spyOn(process.stdout, "write").mockImplementation((c) => {
    stdoutChunks.push(String(c));
    return true;
  });
  try {
    await uninstallCommand.run!({
      args: { ref: "claude/agent@v1", yes: true, json: true } as never,
      cmd: uninstallCommand,
      data: undefined,
      rawArgs: [],
    });
  } finally {
    stdoutSpy.mockRestore();
  }
  const out = JSON.parse(stdoutChunks.join(""));
  expect(out).toEqual({
    removed: [{ ref: "claude/agent@v1", dir }],
    skipped: [],
  });
});

test("no-arg + TTY + mocked multiselect → batch removal", async () => {
  await pre("claude", "agent", "v1");
  await pre("openai", "review", "v1");

  // Force TTY
  Object.defineProperty(process.stdout, "isTTY", { value: true, configurable: true });

  // Mock clack module — multiselect returns first entry; confirm returns true
  vi.doMock("@clack/prompts", async (importOriginal) => {
    const original = (await importOriginal()) as Record<string, unknown>;
    return {
      ...original,
      multiselect: vi.fn(async (opts: { options: { value: { dir: string } }[] }) => [
        opts.options[0]!.value,
      ]),
      confirm: vi.fn(async () => true),
      isCancel: vi.fn(() => false),
    };
  });

  // Re-import the command after mocking so it picks up the mocked clack
  const { uninstallCommand: mocked } = await import("../src/commands/action/uninstall.ts");

  await mocked.run!({
    args: { ref: "", yes: false, json: false } as never,
    cmd: mocked,
    data: undefined,
    rawArgs: [],
  });

  // First mkdir was claude/agent/v1 — that's the value the mocked multiselect returned.
  // (Pick order matches walkCache return order; either claude or openai may come first
  // depending on readdir order, but with only "claude" and "openai" namespaces, claude
  // sorts first lexicographically.)
  const { stat } = await import("node:fs/promises");
  let claudeGone = false;
  try {
    await stat(join(env.registryRoot, "claude", "agent", "v1"));
  } catch {
    claudeGone = true;
  }
  expect(claudeGone).toBe(true);
  // openai entry untouched
  await stat(join(env.registryRoot, "openai", "review", "v1"));

  vi.doUnmock("@clack/prompts");
  Object.defineProperty(process.stdout, "isTTY", { value: false, configurable: true });
});
```

- [ ] **Step 2: Run tests, verify they fail**

```bash
cd packages/cli && vp test uninstall
```

Expected: FAIL — `uninstallCommand` not implemented.

- [ ] **Step 3: Implement `uninstall.ts`**

Create `packages/cli/src/commands/action/uninstall.ts`:

```ts
import { readdir, rm, stat } from "node:fs/promises";
import { dirname, join } from "node:path";

import * as clack from "@clack/prompts";
import { defineCommand } from "citty";

import { NotFoundError, UsageError } from "../../lib/errors.ts";
import { isInteractive } from "../../lib/output.ts";
import { parseRegistryRef } from "../../lib/parse-registry-ref.ts";
import { resolveRegistryRoot } from "../../lib/registry-root.ts";
import { walkCache, type CachedEntry } from "../../lib/walk-cache.ts";

interface RemovalReceipt {
  readonly ref: string;
  readonly dir: string;
}

export const uninstallCommand = defineCommand({
  meta: {
    name: "uninstall",
    description: "Remove cached actions; pick interactively when no ref given",
  },
  args: {
    ref: {
      type: "positional",
      description: "Registry coordinate '<ns>/<name>@<ver>' (omit for picker)",
      required: false,
    },
    yes: {
      type: "boolean",
      description: "Skip the confirmation prompt",
      default: false,
    },
    json: {
      type: "boolean",
      description: "Emit machine-readable JSON instead of human output",
      default: false,
    },
  },
  async run({ args }) {
    const registryRoot = resolveRegistryRoot();
    const interactive = isInteractive(args.json);

    if (!args.ref) {
      // No-arg flow: requires TTY + --json off. Picks via multi-select.
      if (args.json) {
        throw new UsageError(
          "--json mode requires <ref> + --yes; multi-select is not available in JSON mode",
        );
      }
      if (!interactive) {
        throw new UsageError("<ref> required in non-interactive mode (no TTY)");
      }
      const removed = await runInteractive(registryRoot, args.yes);
      emitHumanRemoval(removed, []);
      return;
    }

    // Explicit ref
    const ref = parseRegistryRef(args.ref);
    const dir = join(registryRoot, ref.namespace, ref.name, ref.version);

    if (!(await pathExists(dir))) {
      throw new NotFoundError(`not in cache: ${args.ref}`);
    }

    if (!args.yes) {
      if (!interactive) {
        throw new UsageError("refusing destructive op without --yes (non-interactive)");
      }
      const ok = await clack.confirm({ message: `remove ${args.ref}?` });
      if (clack.isCancel(ok) || ok === false) return;
    }

    await removeAndPrune(dir, registryRoot);

    if (args.json) {
      process.stdout.write(
        `${JSON.stringify({ removed: [{ ref: args.ref, dir }], skipped: [] })}\n`,
      );
    } else {
      emitHumanRemoval([{ ref: args.ref, dir }], []);
    }
  },
});

async function runInteractive(
  registryRoot: string,
  skipConfirm: boolean,
): Promise<RemovalReceipt[]> {
  const entries = await walkCache(registryRoot);
  if (entries.length === 0) {
    process.stderr.write("no cached actions\n");
    return [];
  }

  const picks = await clack.multiselect<CachedEntry>({
    message: "select actions to remove",
    options: entries.map((e) => ({
      label: `${e.namespace}/${e.name}@${e.version}`,
      value: e,
    })),
    required: false,
  });

  if (clack.isCancel(picks) || picks.length === 0) return [];

  if (!skipConfirm) {
    const ok = await clack.confirm({
      message: `remove ${picks.length} ${picks.length === 1 ? "entry" : "entries"}?`,
    });
    if (clack.isCancel(ok) || ok === false) return [];
  }

  const removed: RemovalReceipt[] = [];
  for (const pick of picks) {
    await removeAndPrune(pick.dir, registryRoot);
    removed.push({
      ref: `${pick.namespace}/${pick.name}@${pick.version}`,
      dir: pick.dir,
    });
  }
  return removed;
}

async function removeAndPrune(dir: string, root: string): Promise<void> {
  await rm(dir, { recursive: true, force: true });
  // Walk up while parent is empty and still inside <root>
  let parent = dirname(dir);
  while (parent !== root && parent.startsWith(root)) {
    let siblings: string[];
    try {
      siblings = await readdir(parent);
    } catch {
      break;
    }
    if (siblings.length > 0) break;
    await rm(parent, { recursive: true, force: true });
    parent = dirname(parent);
  }
}

async function pathExists(p: string): Promise<boolean> {
  try {
    await stat(p);
    return true;
  } catch {
    return false;
  }
}

function emitHumanRemoval(removed: RemovalReceipt[], _skipped: RemovalReceipt[]): void {
  for (const r of removed) {
    process.stderr.write(`✓ removed ${r.ref}\n`);
  }
}
```

- [ ] **Step 4: Register `uninstall` in `commands/action/index.ts`**

Replace `packages/cli/src/commands/action/index.ts`:

```ts
import { defineCommand } from "citty";

import { installCommand } from "./install.ts";
import { listCommand } from "./list.ts";
import { uninstallCommand } from "./uninstall.ts";

export const actionCommand = defineCommand({
  meta: {
    name: "action",
    description: "Manage AIactions actions cached locally",
  },
  subCommands: {
    install: installCommand,
    list: listCommand,
    uninstall: uninstallCommand,
  },
});
```

- [ ] **Step 5: Run tests, verify they pass**

```bash
cd packages/cli && vp test uninstall
```

Expected: 8/8 PASS.

- [ ] **Step 6: Commit**

```bash
git add packages/cli/src/commands/action/uninstall.ts packages/cli/src/commands/action/index.ts packages/cli/tests/uninstall.test.ts
git commit -m "$(cat <<'EOF'
feat(cli): add `aia action uninstall [<ref>]`

Final MS1.4 verb. Two modes: explicit ref (parse, confirm if TTY,
delete, prune empty parents) and no-arg interactive (clack
multi-select over the cache). Non-TTY without --yes is rejected with
UsageError to stop scripts/CI from destroying entries by accident.
JSON mode requires both ref and --yes; the multi-select picker is
unavailable there.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 12: Bin integration end-to-end install

**Why:** Tasks 8–11 cover command-unit behaviour; this final test exercises the full binary spawn path with a real bare-repo fixture, locking the AIACTIONS_CANONICAL_URL knob and confirming the bundled CLI matches in-process expectations.

**Files:**

- Modify: `packages/cli/tests/bin-integration.test.ts`

- [ ] **Step 1: Append the e2e test**

Append to `packages/cli/tests/bin-integration.test.ts`:

```ts
import { readdir } from "node:fs/promises";
import { join } from "node:path";

import { afterEach, beforeEach } from "vite-plus/test";

import { makeBareRepoWithAction } from "./fixtures/make-bare-repo.ts";
import { makeTempHome, type TempHome } from "./fixtures/with-temp-home.ts";

let env: TempHome;

beforeEach(async () => {
  env = await makeTempHome();
});

afterEach(async () => {
  await env.cleanup();
});

test("aia action install end-to-end populates the cache", async () => {
  const bareRepo = await makeBareRepoWithAction({
    cwd: env.home,
    namespace: "test",
    name: "smoke",
    version: "v1",
    files: { "action.yml": "name: smoke\nruns: { using: noop }\n" },
  });

  const result = await runCli(["action", "install", "test/smoke@v1", "--json"], {
    HOME: env.home,
    AIACTIONS_CANONICAL_URL: `file://${bareRepo}`,
  });

  expect(result.exitCode).toBe(0);
  const out = JSON.parse(result.stdout);
  expect(out.ref).toBe("test/smoke@v1");
  expect(out.fetched).toBe(true);

  const versions = await readdir(join(env.registryRoot, "test", "smoke"));
  expect(versions).toEqual(["v1"]);
});

test("aia action list end-to-end on populated cache", async () => {
  const bareRepo = await makeBareRepoWithAction({
    cwd: env.home,
    namespace: "test",
    name: "smoke",
    version: "v1",
    files: { "action.yml": "name: smoke\nruns: { using: noop }\n" },
  });

  await runCli(["action", "install", "test/smoke@v1", "--json"], {
    HOME: env.home,
    AIACTIONS_CANONICAL_URL: `file://${bareRepo}`,
  });

  const result = await runCli(["action", "list", "--json"], { HOME: env.home });
  expect(result.exitCode).toBe(0);
  const out = JSON.parse(result.stdout);
  expect(out).toHaveLength(1);
  expect(out[0]).toMatchObject({
    namespace: "test",
    name: "smoke",
    version: "v1",
  });
});

test("aia action uninstall end-to-end with --yes", async () => {
  const bareRepo = await makeBareRepoWithAction({
    cwd: env.home,
    namespace: "test",
    name: "smoke",
    version: "v1",
    files: { "action.yml": "name: smoke\nruns: { using: noop }\n" },
  });

  await runCli(["action", "install", "test/smoke@v1", "--json"], {
    HOME: env.home,
    AIACTIONS_CANONICAL_URL: `file://${bareRepo}`,
  });

  const result = await runCli(["action", "uninstall", "test/smoke@v1", "--yes", "--json"], {
    HOME: env.home,
  });
  expect(result.exitCode).toBe(0);
  const out = JSON.parse(result.stdout);
  expect(out.removed).toHaveLength(1);
  expect(out.removed[0].ref).toBe("test/smoke@v1");

  // Cache should be empty
  const listResult = await runCli(["action", "list", "--json"], { HOME: env.home });
  expect(JSON.parse(listResult.stdout)).toEqual([]);
});
```

- [ ] **Step 2: Build the CLI bundle**

```bash
cd packages/cli && vp pack
```

Expected: `dist/main.mjs` produced.

- [ ] **Step 3: Run bin integration tests, verify all pass**

```bash
cd packages/cli && vp test bin-integration
```

Expected: 6/6 PASS (3 original + 3 new e2e).

- [ ] **Step 4: Commit**

```bash
git add packages/cli/tests/bin-integration.test.ts
git commit -m "$(cat <<'EOF'
test(cli): add end-to-end bin integration tests for action verbs

Spawn the bundled CLI as a child process and exercise install, list,
and uninstall against a local bare-repo fixture. Locks the
AIACTIONS_CANONICAL_URL knob and confirms the bundle matches the
in-process command-unit behaviour.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 13: Final verification gate

**Why:** Run the canonical local + CI gate after the package is feature-complete to catch any cross-package fallout. Includes a small project-hygiene fix: the root `ready` script today omits the recursive build step, so it disagrees with `CLAUDE.md` (which documents `ready` as `check + recursive test + recursive build`). Fix the script alongside the verification run.

**Files:**

- Modify: `package.json` (root) — extend `ready` script to include `vp run -r build`

- [ ] **Step 1: Patch the root `ready` script**

Open `package.json` (root). Change:

```json
"ready": "bun run gen:schemas && vp check && vp run -r test"
```

to:

```json
"ready": "bun run gen:schemas && vp check && vp run -r test && vp run -r build"
```

- [ ] **Step 2: Run the full gate**

```bash
vp run ready
```

Expected: green — `gen:schemas` clean, `vp check` (workspace-wide tsc + oxlint) clean, recursive `vp test` clean, recursive `vp build` clean (including the new `@aiactions/cli` package's `vp pack`).

If any failure surfaces, fix in place (do not bypass), commit a follow-up `fix(cli): ...` per Conventional Commits, and re-run.

- [ ] **Step 3: Commit the script fix**

```bash
git add package.json
git commit -m "$(cat <<'EOF'
chore(toolchain): include recursive build in `vp run ready`

Aligns the root `ready` script with the documented contract in
CLAUDE.md (`ready` = check + recursive test + recursive build) and
ensures the gate exercises every package's `vp pack` output before
merge.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

- [ ] **Step 4: Push the branch (after user approval)**

This is a checkpoint — do NOT push unprompted. Surface the branch state to the user with `git log --oneline feat/ms1-4-cli-scaffold` and ask for permission to push and open the PR.

---

## Self-review

**Spec coverage:**

| Spec section                              | Implementation task                                                         |
| ----------------------------------------- | --------------------------------------------------------------------------- |
| Goal — three cache-management verbs       | Tasks 9, 10, 11                                                             |
| Public API change in `@aiactions/runtime` | Task 1                                                                      |
| Architecture & layout                     | Task 2 (scaffold) + Tasks 3-11 (files)                                      |
| `aia action install` behaviour            | Task 9                                                                      |
| `aia action list` behaviour               | Task 10                                                                     |
| `aia action uninstall` behaviour matrix   | Task 11                                                                     |
| Data flow                                 | Tasks 8 (entry+handler), 9-11 (per-verb)                                    |
| Exit codes + error class hierarchy        | Task 3                                                                      |
| Top-level handler                         | Task 8                                                                      |
| `--json` modes                            | Tasks 9, 10, 11 (per-verb)                                                  |
| TTY-degradation                           | Task 7 (`isInteractive`) + Task 11 (interactive paths)                      |
| `AIACTIONS_CANONICAL_URL` knob            | Task 9 (read), Tasks 9 + 12 (test usage)                                    |
| Three-layer testing strategy              | Unit (Tasks 3-7), Command unit (Tasks 9-11), Bin integration (Tasks 8 + 12) |
| Verification gate                         | Task 13                                                                     |

No spec section is left unimplemented.

**Placeholder scan:** None — every step shows full file contents or exact lines to add.

**Type consistency:** `RegistryRef` (workflows), `RegistryCoordinate` (runtime), `CachedEntry` (cli walk-cache), `RemovalReceipt` (cli uninstall) — all distinct, used consistently. `EXIT.{...}` codes referenced identically across `cli.ts`, `errors.ts`, and command handlers. `installCommand`/`listCommand`/`uninstallCommand` exports all match their `subCommands` registration in `commands/action/index.ts`.

**Open notes for executor:**

1. The dependency versions (`citty ^0.1.6`, `@clack/prompts ^0.10.1`) are current at design time (2026-05-05). `vp install` may resolve newer minors; if a major bump breaks the `defineCommand`/`runMain` API, pin to the version listed. citty's `run` callback context shape (`{ args, cmd, data, rawArgs }`) and `defineCommand`'s `args` schema may evolve — verify against the resolved version before debugging.
2. The `formatTable` `replace(/\s+$/u, ...)` trick trims trailing padding on the last column only; the test in Task 7 locks the exact whitespace shape.
3. `make-bare-repo.ts` is copied (not imported) per the rule-of-three. If MS1.5+ adds another consumer, extract to a shared `@aiactions/test-fixtures` package.
4. The `vi.spyOn(process.stdout, "write").mockImplementation(...)` pattern is verbose — if it appears in three or more test files, factor a helper into `tests/fixtures/`.
