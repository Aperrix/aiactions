import { expect, test } from "vite-plus/test";

import {
  CliError,
  NotFoundError,
  RegistryFetchError,
  RegistryValidationError,
  UsageError,
} from "../src/lib/errors.ts";
import { EXIT } from "../src/lib/exit-codes.ts";

test("EXIT codes are stable integers", () => {
  expect(EXIT.OK).toBe(0);
  expect(EXIT.RUNTIME).toBe(1);
  expect(EXIT.USAGE).toBe(2);
  expect(EXIT.NOT_FOUND).toBe(4);
  expect(EXIT.CONFLICT).toBe(5);
});

test("CliError carries code, message, and optional cause", () => {
  const cause = new Error("boom");
  const err = new CliError(EXIT.RUNTIME, "kapow", cause);
  expect(err.code).toBe(EXIT.RUNTIME);
  expect(err.message).toBe("kapow");
  expect(err.cause).toBe(cause);
  expect(err.name).toBe("CliError");
});

test("UsageError forces EXIT.USAGE code", () => {
  const err = new UsageError("bad arg");
  expect(err.code).toBe(EXIT.USAGE);
  expect(err).toBeInstanceOf(CliError);
});

test("NotFoundError forces EXIT.NOT_FOUND code", () => {
  const err = new NotFoundError("missing");
  expect(err.code).toBe(EXIT.NOT_FOUND);
  expect(err).toBeInstanceOf(CliError);
});

test("RegistryFetchError carries EXIT.REGISTRY", () => {
  const err = new RegistryFetchError("network down");
  expect(err.code).toBe(EXIT.REGISTRY);
  expect(err.name).toBe("RegistryFetchError");
});

test("RegistryValidationError carries EXIT.REGISTRY", () => {
  const err = new RegistryValidationError("zod said no");
  expect(err.code).toBe(EXIT.REGISTRY);
  expect(err.name).toBe("RegistryValidationError");
});
