import { describe, expect, test } from "vite-plus/test";

import { AIactionsError } from "../src/index.ts";

describe("AIactionsError", () => {
  test("is abstract and not directly constructible", () => {
    expect(() => new (AIactionsError as unknown as new (m: string) => AIactionsError)("x")).toThrow(
      /AIactionsError is abstract/u,
    );
  });

  test("subclass carries its constructor name", () => {
    class MySubclass extends AIactionsError {}
    const e = new MySubclass("boom");
    expect(e.name).toBe("MySubclass");
    expect(e.message).toBe("boom");
    expect(e instanceof AIactionsError).toBe(true);
    expect(e instanceof Error).toBe(true);
  });

  test("preserves cause", () => {
    class S extends AIactionsError {}
    const cause = new Error("root");
    const e = new S("wrapped", { cause });
    expect(e.cause).toBe(cause);
  });
});
