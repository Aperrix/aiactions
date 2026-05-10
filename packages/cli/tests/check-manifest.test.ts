import { resolve } from "node:path";

import { expect, test } from "vite-plus/test";

import { checkManifest, joinZodPath } from "../src/lib/check-manifest.ts";
import { NotFoundError } from "../src/_shared/cli-error.ts";

const FIXTURES = resolve(__dirname, "fixtures/manifests");

test("checkManifest returns ok=true for a schema-valid manifest", async () => {
  const result = await checkManifest(resolve(FIXTURES, "valid.yaml"));
  expect(result.ok).toBe(true);
  expect(result.errors).toEqual([]);
  expect(result.warnings).toEqual([]);
});

test("checkManifest returns ok=false with one zodPath-empty issue for malformed YAML", async () => {
  const result = await checkManifest(resolve(FIXTURES, "malformed.yaml"));
  expect(result.ok).toBe(false);
  expect(result.errors).toHaveLength(1);
  expect(result.errors[0]?.zodPath).toBe("");
  expect(result.errors[0]?.message).toMatch(/malformed YAML/i);
});

test("checkManifest reports one issue per zod issue with stable zodPaths", async () => {
  const result = await checkManifest(resolve(FIXTURES, "invalid-schema.yaml"));
  expect(result.ok).toBe(false);
  // The fixture violates schemaVersion, name regex, and runs.main regex.
  const paths = result.errors.map((e) => e.zodPath).sort();
  expect(paths).toContain("schemaVersion");
  expect(paths).toContain("name");
  expect(paths).toContain("runs.main");
});

test("checkManifest throws NotFoundError when file is missing", async () => {
  await expect(checkManifest(resolve(FIXTURES, "does-not-exist.yaml"))).rejects.toThrow(
    NotFoundError,
  );
});

test("joinZodPath dot-joins string segments and bracket-wraps numeric segments", () => {
  expect(joinZodPath(["runs", "main"])).toBe("runs.main");
  expect(joinZodPath(["inputs", "foo", "default"])).toBe("inputs.foo.default");
  expect(joinZodPath(["outputs", 0, "description"])).toBe("outputs[0].description");
  expect(joinZodPath([])).toBe("");
});
