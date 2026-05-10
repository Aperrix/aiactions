import { resolve } from "node:path";

import { expect, test } from "vite-plus/test";

import { formatIssue } from "../../../../src/commands/action/check/format-issues.ts";

test("formatIssue prints '<rel>: <zodPath>: <message>' when zodPath set", () => {
  const abs = resolve(process.cwd(), "actions/foo/aiaction.yaml");
  const line = formatIssue({ zodPath: "runs.main", message: "must start with './'" }, abs);
  expect(line).toBe("actions/foo/aiaction.yaml: runs.main: must start with './'");
});

test("formatIssue prints '<rel>: <message>' when zodPath empty", () => {
  const abs = resolve(process.cwd(), "actions/foo/aiaction.yaml");
  const line = formatIssue({ zodPath: "", message: "malformed YAML in '...'" }, abs);
  expect(line).toBe("actions/foo/aiaction.yaml: malformed YAML in '...'");
});

test("formatIssue keeps absolute path when target is outside cwd", () => {
  const abs = "/absolute/elsewhere/aiaction.yaml";
  const line = formatIssue({ zodPath: "name", message: "required" }, abs);
  expect(line).toBe("/absolute/elsewhere/aiaction.yaml: name: required");
});
