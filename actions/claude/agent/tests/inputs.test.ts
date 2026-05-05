/**
 * Unit tests for `parseInputs`. Covers: required fields, optional
 * passthrough, CSV → array, JSON → object, system_prompt forms,
 * permission_mode default, error aggregation.
 */

import { describe, expect, test } from "vite-plus/test";

import { parseInputs } from "../src/inputs.ts";

const minimal = { prompt: "hi" } as const;

describe("parseInputs", () => {
  test("requires `prompt`", () => {
    expect(() => parseInputs({} as Readonly<Record<string, string>>)).toThrow(/prompt/);
  });

  test("returns minimal valid inputs with defaults applied", () => {
    const out = parseInputs(minimal);
    expect(out.prompt).toBe("hi");
    expect(out.permission_mode).toBe("bypassPermissions");
    expect(out.setting_sources).toEqual(["project", "user"]);
    expect(out.system_prompt).toEqual({ type: "preset", preset: "claude_code" });
    expect(out.allowed_tools).toBeUndefined();
    expect(out.max_turns).toBeUndefined();
  });

  test("parses allowed_tools CSV into a trimmed array", () => {
    const out = parseInputs({ ...minimal, allowed_tools: "Read, Grep ,Bash" });
    expect(out.allowed_tools).toEqual(["Read", "Grep", "Bash"]);
  });

  test("treats empty allowed_tools as unset", () => {
    const out = parseInputs({ ...minimal, allowed_tools: "" });
    expect(out.allowed_tools).toBeUndefined();
  });

  test("parses mcp_servers JSON into an object", () => {
    const out = parseInputs({
      ...minimal,
      mcp_servers: '{"fs": {"command": "fs-mcp-server"}}',
    });
    expect(out.mcp_servers).toEqual({ fs: { command: "fs-mcp-server" } });
  });

  test("rejects invalid mcp_servers JSON", () => {
    expect(() => parseInputs({ ...minimal, mcp_servers: "{not json" })).toThrow(
      /mcp_servers.*invalid JSON/,
    );
  });

  test("treats empty system_prompt string as `no system prompt at all`", () => {
    const out = parseInputs({ ...minimal, system_prompt: "" });
    expect(out.system_prompt).toBeUndefined();
  });

  test("accepts a custom string system_prompt", () => {
    const out = parseInputs({ ...minimal, system_prompt: "You are pedantic." });
    expect(out.system_prompt).toBe("You are pedantic.");
  });

  test("accepts the preset object form with an append clause", () => {
    const json = JSON.stringify({ type: "preset", preset: "claude_code", append: "extra" });
    const out = parseInputs({ ...minimal, system_prompt: json });
    expect(out.system_prompt).toEqual({ type: "preset", preset: "claude_code", append: "extra" });
  });

  test("rejects unknown permission_mode values", () => {
    expect(() => parseInputs({ ...minimal, permission_mode: "lol" })).toThrow(/permission_mode/);
  });

  test("parses max_turns and max_budget_usd as numbers", () => {
    const out = parseInputs({ ...minimal, max_turns: "5", max_budget_usd: "1.50" });
    expect(out.max_turns).toBe(5);
    expect(out.max_budget_usd).toBe(1.5);
  });

  test("rejects non-numeric max_turns", () => {
    expect(() => parseInputs({ ...minimal, max_turns: "five" })).toThrow(/not a finite number/);
  });

  test("aggregates multiple errors in a single message", () => {
    expect(() =>
      parseInputs({ prompt: "", max_turns: "x", permission_mode: "wat" } as Readonly<
        Record<string, string>
      >),
    ).toThrow(/prompt.*not a finite number.*permission_mode/s);
  });

  test("setting_sources rejects unknown values", () => {
    expect(() => parseInputs({ ...minimal, setting_sources: "project,registry,user,foo" })).toThrow(
      /setting_sources.*unknown.*registry.*foo/s,
    );
  });

  test("system_prompt object form rejects unknown preset values", () => {
    const json = JSON.stringify({ type: "preset", preset: "typo" });
    expect(() => parseInputs({ ...minimal, system_prompt: json })).toThrow(
      /preset.*claude_code.*typo/s,
    );
  });
});
