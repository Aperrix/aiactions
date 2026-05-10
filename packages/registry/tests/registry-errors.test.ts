import { AIactionsError } from "@aiactions/schema";
import { expect, test } from "vite-plus/test";

import {
  RegistryError,
  RegistryFetchError,
  RegistryResolveError,
  RegistryValidationError,
} from "../src/errors.ts";

test("RegistryError extends AIactionsError (abstract)", () => {
  expect(() => Reflect.construct(RegistryError, ["x"])).toThrow();
});

test("RegistryFetchError is a RegistryError + AIactionsError", () => {
  const err = new RegistryFetchError("network down");
  expect(err).toBeInstanceOf(RegistryError);
  expect(err).toBeInstanceOf(AIactionsError);
  expect(err.name).toBe("RegistryFetchError");
  expect(err.message).toBe("network down");
});

test("RegistryResolveError is a RegistryError + AIactionsError", () => {
  const err = new RegistryResolveError("no matching tag");
  expect(err).toBeInstanceOf(RegistryError);
  expect(err).toBeInstanceOf(AIactionsError);
  expect(err.name).toBe("RegistryResolveError");
});

test("RegistryValidationError is a RegistryError + AIactionsError", () => {
  const cause = new Error("zod said no");
  const err = new RegistryValidationError("malformed registry", { cause });
  expect(err).toBeInstanceOf(RegistryError);
  expect(err).toBeInstanceOf(AIactionsError);
  expect(err.name).toBe("RegistryValidationError");
  expect(err.cause).toBe(cause);
});
