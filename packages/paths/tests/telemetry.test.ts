import { afterEach, describe, expect, test } from "vite-plus/test";
import { existsSync, readFileSync } from "node:fs";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

import {
  captureWorkflowInvoked,
  getOrCreateTelemetryId,
  isTelemetryDisabled,
  resetTelemetryForTests,
} from "../src/telemetry.ts";

const tmpDirs: string[] = [];

afterEach(async () => {
  while (tmpDirs.length > 0) {
    const dir = tmpDirs.pop();
    if (dir !== undefined) {
      await rm(dir, { recursive: true, force: true });
    }
  }
  resetTelemetryForTests();
});

describe("isTelemetryDisabled", () => {
  test("returns true when `disabled` flag is true (AIA_TELEMETRY_DISABLED or DO_NOT_TRACK)", () => {
    expect(isTelemetryDisabled({ disabled: true, apiKey: "phc_x" })).toBe(true);
  });

  test("returns true when API key is missing", () => {
    expect(isTelemetryDisabled({ disabled: false })).toBe(true);
  });

  test("returns true when API key is the empty string", () => {
    expect(isTelemetryDisabled({ disabled: false, apiKey: "" })).toBe(true);
  });

  test("returns false when API key is set and not opted out", () => {
    expect(isTelemetryDisabled({ disabled: false, apiKey: "phc_x" })).toBe(false);
  });
});

describe("getOrCreateTelemetryId", () => {
  test("creates a UUID file at <home>/telemetry-id", async () => {
    const home = await mkdtemp(join(tmpdir(), "aia-telem-"));
    tmpDirs.push(home);

    const id = getOrCreateTelemetryId(home);

    expect(id).toMatch(/^[0-9a-f-]{36}$/);
    expect(existsSync(join(home, "telemetry-id"))).toBe(true);
    expect(readFileSync(join(home, "telemetry-id"), "utf8").trim()).toBe(id);
  });

  test("re-reads the existing UUID on subsequent calls", async () => {
    const home = await mkdtemp(join(tmpdir(), "aia-telem-"));
    tmpDirs.push(home);

    const id1 = getOrCreateTelemetryId(home);
    const id2 = getOrCreateTelemetryId(home);

    expect(id1).toBe(id2);
  });

  test("creates the home directory if it does not exist", async () => {
    const parent = await mkdtemp(join(tmpdir(), "aia-telem-parent-"));
    tmpDirs.push(parent);
    const home = join(parent, "nested", "aiactions-home");

    const id = getOrCreateTelemetryId(home);

    expect(id).toMatch(/^[0-9a-f-]{36}$/);
    expect(existsSync(join(home, "telemetry-id"))).toBe(true);
  });
});

describe("captureWorkflowInvoked", () => {
  test("never throws when telemetry is disabled (no env opt-in)", () => {
    expect(() => captureWorkflowInvoked({ workflowName: "test" })).not.toThrow();
  });

  test("never throws on synchronous portion when telemetry-disabled is set", () => {
    process.env.AIA_TELEMETRY_DISABLED = "1";
    try {
      expect(() => captureWorkflowInvoked({ workflowName: "test" })).not.toThrow();
    } finally {
      delete process.env.AIA_TELEMETRY_DISABLED;
    }
  });
});
