import { describe, expect, test } from "vite-plus/test";

import { createLogger, rootLogger } from "../src/logger.ts";

describe("rootLogger", () => {
  test("level is 'info' by default, 'debug' when AIA_DEBUG is set", () => {
    const expected = process.env.AIA_DEBUG ? "debug" : "info";
    expect(rootLogger.level).toBe(expected);
  });

  test("exposes the four standard log methods", () => {
    expect(typeof rootLogger.debug).toBe("function");
    expect(typeof rootLogger.info).toBe("function");
    expect(typeof rootLogger.warn).toBe("function");
    expect(typeof rootLogger.error).toBe("function");
  });
});

describe("createLogger", () => {
  test("returns the root logger when called without arguments", () => {
    expect(createLogger()).toBe(rootLogger);
  });

  test("returns a child logger with `module` binding when given a name", () => {
    const log = createLogger("test-mod");
    expect(log.bindings()).toEqual({ module: "test-mod" });
  });

  test("child logger inherits the root level", () => {
    const log = createLogger("test-mod");
    expect(log.level).toBe(rootLogger.level);
  });
});
