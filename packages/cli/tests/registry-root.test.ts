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
