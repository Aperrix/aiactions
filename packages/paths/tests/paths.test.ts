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
