import { describe, expect, test } from "vite-plus/test";

import { createLogger } from "../src/logger.ts";

describe("createLogger", () => {
  test("emits info, warn, error at default level", () => {
    const lines: string[] = [];
    const logger = createLogger({ minLevel: "info", sink: (line) => lines.push(line) });

    logger.debug("a");
    logger.info("b");
    logger.warn("c");
    logger.error("d");

    expect(lines).toEqual(["[info] b\n", "[warn] c\n", "[error] d\n"]);
  });

  test("emits debug when minLevel is debug", () => {
    const lines: string[] = [];
    const logger = createLogger({ minLevel: "debug", sink: (line) => lines.push(line) });

    logger.debug("d");

    expect(lines).toEqual(["[debug] d\n"]);
  });

  test("filters debug when minLevel is info", () => {
    const lines: string[] = [];
    const logger = createLogger({ minLevel: "info", sink: (line) => lines.push(line) });

    logger.debug("d");

    expect(lines).toEqual([]);
  });

  test("appends meta as JSON when provided", () => {
    const lines: string[] = [];
    const logger = createLogger({ minLevel: "info", sink: (line) => lines.push(line) });

    logger.info("hello", { key: "value", n: 1 });

    expect(lines).toEqual([`[info] hello {"key":"value","n":1}\n`]);
  });

  test("omits meta when undefined", () => {
    const lines: string[] = [];
    const logger = createLogger({ minLevel: "info", sink: (line) => lines.push(line) });

    logger.info("hello");

    expect(lines).toEqual(["[info] hello\n"]);
  });
});
