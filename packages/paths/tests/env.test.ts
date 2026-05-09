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
