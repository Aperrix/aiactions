import { expect, test } from "vite-plus/test";

import { registryEntrySchema, registrySchema } from "../src/index.ts";

test("valid registry parses", () => {
  const reg = registrySchema.parse({
    actions: [{ ref: "claude/agent@1.0.0", description: "Run a Claude agent loop" }],
  });
  expect(reg.actions).toHaveLength(1);
  expect(reg.actions[0].ref).toBe("claude/agent@1.0.0");
});

test("empty actions array is accepted", () => {
  const reg = registrySchema.parse({ actions: [] });
  expect(reg.actions).toEqual([]);
});

test("ref without @ rejected", () => {
  expect(() => registryEntrySchema.parse({ ref: "claude/agent", description: "x" })).toThrow();
});

test("ref without / rejected", () => {
  expect(() => registryEntrySchema.parse({ ref: "agent@1.0.0", description: "x" })).toThrow();
});

test("ref with uppercase rejected", () => {
  expect(() =>
    registryEntrySchema.parse({ ref: "Claude/agent@1.0.0", description: "x" }),
  ).toThrow();
});

test("ref with broken semver rejected", () => {
  expect(() => registryEntrySchema.parse({ ref: "claude/agent@1.0", description: "x" })).toThrow();
});

test("ref with pre-release accepted", () => {
  const e = registryEntrySchema.parse({ ref: "claude/agent@1.0.0-beta.1", description: "x" });
  expect(e.ref).toBe("claude/agent@1.0.0-beta.1");
});

test("empty description rejected", () => {
  expect(() => registryEntrySchema.parse({ ref: "claude/agent@1.0.0", description: "" })).toThrow();
});
