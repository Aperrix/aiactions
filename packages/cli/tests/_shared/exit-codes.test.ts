import { describe, expect, it } from "vite-plus/test";

import { JobError, OrchestrationError, StepError } from "@aiactions/core";
import { NotInGitRepoError } from "@aiactions/discovery";
import {
  RegistryFetchError,
  RegistryResolveError,
  RegistryValidationError,
} from "@aiactions/registry";
import {
  WorkflowParseError,
  WorkflowSchemaError,
  WorkflowValidationError,
} from "@aiactions/schema";

import { EXIT, EXIT_BY_BRICK_ERROR } from "../../src/_shared/exit-codes.ts";

describe("EXIT_BY_BRICK_ERROR", () => {
  it("maps registry errors to EXIT.REGISTRY", () => {
    expect(EXIT_BY_BRICK_ERROR.get(RegistryFetchError)).toBe(EXIT.REGISTRY);
    expect(EXIT_BY_BRICK_ERROR.get(RegistryResolveError)).toBe(EXIT.REGISTRY);
    expect(EXIT_BY_BRICK_ERROR.get(RegistryValidationError)).toBe(EXIT.REGISTRY);
  });

  it("maps workflow parse/schema/validation errors to EXIT.SCHEMA", () => {
    expect(EXIT_BY_BRICK_ERROR.get(WorkflowParseError)).toBe(EXIT.SCHEMA);
    expect(EXIT_BY_BRICK_ERROR.get(WorkflowSchemaError)).toBe(EXIT.SCHEMA);
    expect(EXIT_BY_BRICK_ERROR.get(WorkflowValidationError)).toBe(EXIT.SCHEMA);
  });

  it("maps NotInGitRepoError to EXIT.USAGE", () => {
    expect(EXIT_BY_BRICK_ERROR.get(NotInGitRepoError)).toBe(EXIT.USAGE);
  });

  it("maps runtime errors to EXIT.RUNTIME", () => {
    expect(EXIT_BY_BRICK_ERROR.get(JobError)).toBe(EXIT.RUNTIME);
    expect(EXIT_BY_BRICK_ERROR.get(StepError)).toBe(EXIT.RUNTIME);
    expect(EXIT_BY_BRICK_ERROR.get(OrchestrationError)).toBe(EXIT.RUNTIME);
  });
});

describe("EXIT.RUN_FAILED", () => {
  it("is the dedicated exit code for a workflow whose status is failed", () => {
    expect(EXIT.RUN_FAILED).toBe(8);
  });
});
