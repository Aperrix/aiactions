import { expect, test } from "vite-plus/test";

import { CliError, NotFoundError, UsageError } from "../../src/_shared/cli-error.ts";
import { EXIT } from "../../src/_shared/exit-codes.ts";

test("CliError carries explicit code + cause", () => {
  const cause = new Error("inner");
  const err = new CliError(EXIT.RUNTIME, "boom", cause);
  expect(err.name).toBe("CliError");
  expect(err.code).toBe(EXIT.RUNTIME);
  expect(err.cause).toBe(cause);
});

test("UsageError carries EXIT.USAGE", () => {
  const err = new UsageError("bad argv");
  expect(err.code).toBe(EXIT.USAGE);
  expect(err.name).toBe("UsageError");
});

test("NotFoundError carries EXIT.NOT_FOUND", () => {
  const err = new NotFoundError("missing");
  expect(err.code).toBe(EXIT.NOT_FOUND);
  expect(err.name).toBe("NotFoundError");
});
