import { describe, expect, test } from "vite-plus/test";

import { classifyVersion } from "../src/runner/uses/registry-fetch.ts";

describe("classifyVersion", () => {
  test("recognises 3-segment all-digit semver as exact", () => {
    expect(classifyVersion("1.0.0")).toBe("exact");
    expect(classifyVersion("12.34.56")).toBe("exact");
  });

  test("recognises pre-release semver as exact", () => {
    expect(classifyVersion("1.0.0-beta")).toBe("exact");
    expect(classifyVersion("2.3.4-rc.1")).toBe("exact");
  });

  test("recognises bare digits as a major-prefix range", () => {
    expect(classifyVersion("1")).toBe("major");
    expect(classifyVersion("42")).toBe("major");
  });

  test("treats anything else as branch (literal git ref)", () => {
    expect(classifyVersion("main")).toBe("branch");
    expect(classifyVersion("abc1234")).toBe("branch");
    expect(classifyVersion("1.2")).toBe("branch"); // minor-prefix not yet supported
  });
});
