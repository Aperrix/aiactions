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
