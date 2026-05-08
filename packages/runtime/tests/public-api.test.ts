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
  const coord = {
    namespace: "test",
    name: "noop",
    version: "v1",
  } satisfies runtime.RegistryCoordinate;
  const opts = {} satisfies runtime.EnsureCachedActionOptions;
  const res = {
    dir: "/tmp/x",
    fetched: false,
    resolvedSha: null,
    resolvedVersion: "1.0.0",
  } satisfies runtime.EnsureCachedActionResult;

  expect(coord.namespace).toBe("test");
  expect(opts).toEqual({});
  expect(res.fetched).toBe(false);
});
