/**
 * Pure topology helpers for the job dependency graph. Used by
 * `workflowSchema`'s `superRefine` to surface dangling-need and cycle
 * issues without throwing, and by the runner (later milestone) to obtain
 * a valid execution order.
 *
 * Contents:
 * - `DepRecord` — canonical `(id, deps)` input shape.
 * - `findDanglingDeps(records)` — non-throwing detector of unknown deps.
 * - `findCycle(records)` — non-throwing detector; returns one cycle path.
 * - `topoSort(records)` — Kahn's algorithm; throws on cycle / dangling.
 *
 * ---
 *
 * Zod schema for the `defaults.run` block, accepted at both workflow
 * and job scope. Mirrors GHA's shape exactly: `shell` and
 * `working-directory` are the only fields. Authors write the kebab-case
 * key in YAML; we transform to camelCase on output to match the rest of
 * the parsed model.
 *
 * Contents:
 * - `runDefaultsSchema` — the inner `run:` object.
 * - `defaultsSchema` — the outer wrapper (`{ run?: ... }`).
 * - `RunDefaults`, `Defaults` — inferred output types.
 *
 * ---
 *
 * Zod schema for a workflow step. A step is either a `run:` (inline shell)
 * or a `uses:` (action invocation), enforced via a `superRefine` XOR check
 * (Zod's `discriminatedUnion` requires a literal discriminator, which we
 * lack — both forms share an unmarked base shape).
 *
 * YAML-side keys are kebab-case (`working-directory`, `timeout-minutes`)
 * to mirror GHA; the schema remaps them to camelCase on output via
 * `.transform()` so consumers can write `step.workingDirectory`.
 *
 * Contents:
 * - Field-level schemas: `stepIdSchema`, `stepNameSchema`, `ifSchema`,
 *   `workingDirectorySchema`, `timeoutMinutesSchema`, `withSchema`.
 * - `stepSchema` — top-level schema with XOR enforcement and remap.
 * - `Step` — inferred output type, camelCase keys.
 *
 * ---
 *
 * Zod schema for a workflow job. A job is either a list of `steps:` or a
 * job-level `uses:` invocation of a reusable workflow. Mutual exclusion
 * is enforced via `superRefine` (same pattern as `stepSchema`).
 *
 * Contents:
 * - `jobIdSchema` — kebab-case id; reused by `needs:` arrays and as the
 *   map key in `workflowSchema.jobs`.
 * - Field-level schemas: `jobNameSchema`, `jobNeedsSchema`,
 *   `jobOutputsSchema`.
 * - `jobSchema` — top-level schema with XOR enforcement.
 * - `Job` — inferred output type.
 *
 * ---
 *
 * Top-level workflow schema. Wires together env / job / inputs / outputs /
 * passthrough into a single document and enforces the cross-job graph
 * invariants (dangling needs, cycles) inside `superRefine`. Job id
 * uniqueness is delegated to the YAML parser (duplicate keys = parse error
 * upstream); per-job `steps:`/`uses:` XOR is enforced inside `jobSchema`.
 *
 * The `inputs:` and `outputs:` sections at the top level mirror GHA's
 * `on: workflow_call:` shape — they describe how a reusable workflow is
 * invoked. They are deliberately distinct from `aiaction.yaml`'s inputs /
 * outputs (different field constraints, different consumers).
 *
 * Contents:
 * - `workflowInputTypeSchema` — enum string|boolean|number for `inputs.*.type`.
 * - `workflowInputSchema` / `workflowOutputSchema`.
 * - `workflowInputsSchema` / `workflowOutputsSchema` — record wrappers.
 * - `passthroughSchema` — top-level allowlist for third-party `uses:` env.
 * - `workflowSchema` — the document; aggregates topology checks.
 * - `Workflow` — inferred output type.
 */

import { z } from "zod";

import { ValidationIssueCode } from "../types/errors.ts";
import { envNameSchema, envSchema } from "./env.ts";
import { usesRefSchema } from "./ref.ts";
import { expressionStringSchema, shellSchema } from "./shell.ts";

// -----------------------------------------------------------------------------
// Topology — was packages/workflows/src/schema/topology.ts
// -----------------------------------------------------------------------------

/** Canonical input shape for topology helpers. `id` must be globally unique. */
export interface DepRecord {
  readonly id: string;
  readonly deps: readonly string[];
}

/** One dangling-dep finding: `id` declares dep names not present in the graph. */
export interface DanglingDep {
  readonly id: string;
  readonly missing: readonly string[];
}

/**
 * Detect dangling `needs:`/`dependsOn:` references. Pure; never throws.
 *
 * @param records - Every node with its declared deps.
 * @returns One entry per node that has at least one missing dep.
 */
export function findDanglingDeps(records: readonly DepRecord[]): readonly DanglingDep[] {
  const known = new Set<string>(records.map((r) => r.id));
  const result: DanglingDep[] = [];
  for (const r of records) {
    const missing = r.deps.filter((d) => !known.has(d));
    if (missing.length > 0) {
      result.push({ id: r.id, missing });
    }
  }
  return result;
}

/**
 * Detect a cycle in the dep graph using a DFS with three-colour marks.
 * Returns the first cycle found as an ordered list of ids
 * (`[A, B, C, A]` for a cycle `A → B → C → A`), or `null` if the graph is
 * acyclic. Pure; never throws.
 *
 * Dangling deps are silently treated as terminal — call `findDanglingDeps`
 * separately when both classes of issue must be surfaced.
 *
 * @param records - Every node with its declared deps.
 * @returns The first cycle as `[…, start]`, or `null` if none.
 */
export function findCycle(records: readonly DepRecord[]): readonly string[] | null {
  const adj = new Map<string, readonly string[]>();
  for (const r of records) adj.set(r.id, r.deps);

  type Mark = "white" | "gray" | "black";
  const mark = new Map<string, Mark>();
  for (const id of adj.keys()) mark.set(id, "white");

  const stack: string[] = [];

  function visit(id: string): readonly string[] | null {
    mark.set(id, "gray");
    stack.push(id);
    for (const d of adj.get(id) ?? []) {
      if (!adj.has(d)) continue; // dangling — out of scope here
      const m = mark.get(d);
      if (m === "gray") {
        const start = stack.indexOf(d);
        return [...stack.slice(start), d];
      }
      if (m === "white") {
        const found = visit(d);
        if (found) return found;
      }
    }
    mark.set(id, "black");
    stack.pop();
    return null;
  }

  for (const id of adj.keys()) {
    if (mark.get(id) === "white") {
      const cycle = visit(id);
      if (cycle) return cycle;
    }
  }
  return null;
}

/**
 * Produce a topological order via Kahn's algorithm.
 *
 * @param records - Every node with its declared deps.
 * @returns Ids in an order such that every dep precedes its dependents.
 * @throws {Error} when a `deps` entry is unknown (dangling).
 * @throws {Error} when the graph contains a cycle.
 */
export function topoSort(records: readonly DepRecord[]): string[] {
  const inDegree = new Map<string, number>();
  const adj = new Map<string, string[]>();
  for (const r of records) {
    inDegree.set(r.id, 0);
    adj.set(r.id, []);
  }
  for (const r of records) {
    for (const d of r.deps) {
      if (!inDegree.has(d)) {
        throw new Error(`dangling dep '${d}' referenced by '${r.id}'`);
      }
      adj.get(d)!.push(r.id);
      inDegree.set(r.id, (inDegree.get(r.id) ?? 0) + 1);
    }
  }
  const queue: string[] = [];
  for (const [id, deg] of inDegree) {
    if (deg === 0) queue.push(id);
  }
  const result: string[] = [];
  while (queue.length > 0) {
    const id = queue.shift()!;
    result.push(id);
    for (const next of adj.get(id) ?? []) {
      const newDeg = (inDegree.get(next) ?? 0) - 1;
      inDegree.set(next, newDeg);
      if (newDeg === 0) queue.push(next);
    }
  }
  if (result.length !== records.length) {
    throw new Error("cycle detected in dep graph");
  }
  return result;
}

// -----------------------------------------------------------------------------
// Defaults — was packages/workflows/src/schema/defaults.ts
// -----------------------------------------------------------------------------

const baseRunDefaultsShape = z.strictObject({
  shell: shellSchema.optional(),
  "working-directory": expressionStringSchema.optional(),
});

/**
 * Inner `defaults.run` block. Remaps `working-directory` to camelCase on
 * output so consumers can read `defaults.run.workingDirectory` exactly
 * like `step.workingDirectory`.
 */
export const runDefaultsSchema = baseRunDefaultsShape.transform((d) => {
  const { "working-directory": workingDirectory, ...rest } = d;
  return {
    ...rest,
    ...(workingDirectory !== undefined && { workingDirectory }),
  };
});

/** Outer `defaults` wrapper. GHA only defines `defaults.run`; we mirror that. */
export const defaultsSchema = z.strictObject({
  run: runDefaultsSchema.optional(),
});

/** Inferred output type for the inner `run:` block. */
export type RunDefaults = z.infer<typeof runDefaultsSchema>;

/** Inferred output type for the outer `defaults` wrapper. */
export type Defaults = z.infer<typeof defaultsSchema>;

// -----------------------------------------------------------------------------
// Step — was packages/workflows/src/schema/step.ts
// -----------------------------------------------------------------------------

/** Step id: optional, kebab-case identifier when present. */
export const stepIdSchema = z
  .string()
  .regex(/^[a-z][a-z0-9-]*$/, "step id must be kebab-case (lowercase, digits, hyphens)");

/** Step display name: free-form, must contain at least one non-whitespace character. */
export const stepNameSchema = z
  .string()
  .regex(/\S/, "name must contain at least one non-whitespace character");

/**
 * `if:` condition. GHA-faithful permissive form: accepts boolean literals
 * and any well-formed expression string. Truthy/falsy decision is the
 * evaluator's job (later milestone).
 */
export const ifSchema = z.union([z.boolean(), expressionStringSchema]);

/** `working-directory:`: any well-formed expression string (path). */
export const workingDirectorySchema = expressionStringSchema;

/** `timeout-minutes:`: positive integer minutes. */
export const timeoutMinutesSchema = z.number().int().positive();

/** `with:`: free-form input map; values may interpolate expressions. */
export const withSchema = z.record(z.string().min(1), expressionStringSchema);

const baseStepShape = z.strictObject({
  id: stepIdSchema.optional(),
  name: stepNameSchema.optional(),
  if: ifSchema.optional(),
  env: envSchema.optional(),
  "working-directory": workingDirectorySchema.optional(),
  "timeout-minutes": timeoutMinutesSchema.optional(),
  shell: shellSchema.optional(),
  run: expressionStringSchema
    .refine((v) => /\S/.test(v), "run must contain at least one non-whitespace character")
    .optional(),
  uses: usesRefSchema.optional(),
  with: withSchema.optional(),
});

/**
 * Top-level step schema. Validates the strict-object shape, enforces the
 * `run:` / `uses:` XOR via `superRefine`, then remaps kebab-case keys to
 * camelCase via `.transform()`. The output is a single object shape with
 * `run` and `uses` both optional (post-XOR exactly one is defined);
 * consumers narrow on field presence (`step.run !== undefined`).
 */
export const stepSchema = baseStepShape
  .superRefine((step, ctx) => {
    const hasRun = step.run !== undefined;
    const hasUses = step.uses !== undefined;

    if (hasRun && hasUses) {
      ctx.addIssue({
        code: "custom",
        message: "step must declare either 'run:' or 'uses:', not both",
      });
    } else if (!hasRun && !hasUses) {
      ctx.addIssue({
        code: "custom",
        message: "step must declare either 'run:' or 'uses:'",
      });
    }

    if (hasRun && step.with !== undefined) {
      ctx.addIssue({
        code: "custom",
        message: "'with:' is only valid on 'uses:' steps",
        path: ["with"],
      });
    }

    if (hasUses && step.shell !== undefined) {
      ctx.addIssue({
        code: "custom",
        message: "'shell:' is only valid on 'run:' steps",
        path: ["shell"],
      });
    }
  })
  .transform((step) => {
    const {
      "working-directory": workingDirectory,
      "timeout-minutes": timeoutMinutes,
      ...rest
    } = step;
    return {
      ...rest,
      ...(workingDirectory !== undefined && { workingDirectory }),
      ...(timeoutMinutes !== undefined && { timeoutMinutes }),
    };
  });

/** Inferred output type with camelCase keys. */
export type Step = z.infer<typeof stepSchema>;

// -----------------------------------------------------------------------------
// Job — was packages/workflows/src/schema/job.ts
// -----------------------------------------------------------------------------

/** Job id: kebab-case identifier; doubles as the map key in `workflow.jobs`. */
export const jobIdSchema = z
  .string()
  .regex(/^[a-z][a-z0-9-]*$/, "job id must be kebab-case (lowercase, digits, hyphens)");

/** Job display name: free-form, must contain at least one non-whitespace character. */
export const jobNameSchema = z
  .string()
  .regex(/\S/, "name must contain at least one non-whitespace character");

/** `needs:` array; each entry must satisfy `jobIdSchema`. Empty array allowed (means no needs). */
export const jobNeedsSchema = z.array(jobIdSchema);

/**
 * `outputs:` — map from output name to expression string. Expression body
 * is preserved verbatim; resolution against `steps.<id>.outputs` happens
 * later in the evaluator.
 */
export const jobOutputsSchema = z.record(z.string().min(1), expressionStringSchema);

const baseJobShape = z.strictObject({
  name: jobNameSchema.optional(),
  needs: jobNeedsSchema.optional(),
  if: ifSchema.optional(),
  defaults: defaultsSchema.optional(),
  env: envSchema.optional(),
  outputs: jobOutputsSchema.optional(),
  steps: z.array(stepSchema).min(1).optional(),
  uses: usesRefSchema.optional(),
  with: withSchema.optional(),
});

/**
 * Top-level job schema. Validates the strict-object shape and enforces:
 * - exactly one of `steps:` / `uses:` (`run:`-style XOR);
 * - `with:` is only valid on `uses:` jobs.
 *
 * Returned shape is unmodified (no kebab fields at job level v1, so no
 * remap step is needed).
 */
export const jobSchema = baseJobShape.superRefine((job, ctx) => {
  const hasSteps = job.steps !== undefined;
  const hasUses = job.uses !== undefined;

  if (hasSteps && hasUses) {
    ctx.addIssue({
      code: "custom",
      message: "job must declare either 'steps:' or 'uses:', not both",
    });
  } else if (!hasSteps && !hasUses) {
    ctx.addIssue({
      code: "custom",
      message: "job must declare either 'steps:' or 'uses:'",
    });
  }

  if (hasSteps && job.with !== undefined) {
    ctx.addIssue({
      code: "custom",
      message: "'with:' is only valid on 'uses:' jobs",
      path: ["with"],
    });
  }
});

/** Inferred output type. */
export type Job = z.infer<typeof jobSchema>;

// -----------------------------------------------------------------------------
// Workflow — was packages/workflows/src/schema/workflow.ts
// -----------------------------------------------------------------------------

/** Allowed types for a `workflow_call` input. */
export const workflowInputTypeSchema = z.enum(["string", "boolean", "number"]);

export type WorkflowInputType = z.infer<typeof workflowInputTypeSchema>;

/** Schema for a single `workflow_call` input declaration. */
export const workflowInputSchema = z.strictObject({
  description: z.string().min(1).optional(),
  required: z.boolean().optional(),
  default: z.union([z.string(), z.boolean(), z.number()]).optional(),
  type: workflowInputTypeSchema,
});

/** Schema for a single `workflow_call` output declaration. */
export const workflowOutputSchema = z.strictObject({
  description: z.string().min(1).optional(),
  value: expressionStringSchema,
});

/** Map of input name → spec; keys are non-empty strings. */
export const workflowInputsSchema = z.record(z.string().min(1), workflowInputSchema);

/** Map of output name → spec; keys are non-empty strings. */
export const workflowOutputsSchema = z.record(z.string().min(1), workflowOutputSchema);

/**
 * Marker placed on Zod issues raised by `workflowSchema.superRefine`. The
 * parser uses it to discriminate graph-invariant violations (raise
 * `WorkflowValidationError`) from shape violations (raise
 * `WorkflowSchemaError`).
 */
export const TOPOLOGY_ISSUE_KIND = "topology" as const;

export type TopologyIssueKind = typeof TOPOLOGY_ISSUE_KIND;

/**
 * `passthrough:` allowlist for env vars that may flow from the runner
 * process into third-party `uses:` actions. Shape is validated at parse
 * time; enforcement happens in the runner (later milestone).
 */
export const passthroughSchema = z.array(envNameSchema);

const baseWorkflowShape = z.strictObject({
  name: z.string().regex(/\S/, "name must contain at least one non-whitespace character"),
  description: z
    .string()
    .regex(/\S/, "description must contain at least one non-whitespace character")
    .optional(),
  defaults: defaultsSchema.optional(),
  env: envSchema.optional(),
  passthrough: passthroughSchema.optional(),
  inputs: workflowInputsSchema.optional(),
  outputs: workflowOutputsSchema.optional(),
  jobs: z.record(jobIdSchema, jobSchema),
});

/**
 * Top-level workflow schema. Validates the shape, enforces `jobs` is
 * non-empty, and aggregates dependency-graph invariants in a single
 * `superRefine` pass.
 *
 * Ordering inside the refiner is load-bearing: dangling-need detection
 * runs first so that cycle detection only walks edges into nodes that
 * exist. A graph with both a dangling need and a cycle surfaces only the
 * dangling-need issue per pass.
 */
export const workflowSchema = baseWorkflowShape.superRefine((wf, ctx) => {
  const jobIds = Object.keys(wf.jobs);
  if (jobIds.length === 0) {
    ctx.addIssue({
      code: "custom",
      message: "'jobs' must declare at least one job",
      path: ["jobs"],
      params: { kind: TOPOLOGY_ISSUE_KIND, code: ValidationIssueCode.emptyJobs },
    });
    return;
  }

  const records: DepRecord[] = jobIds.map((id) => ({
    id,
    deps: wf.jobs[id]?.needs ?? [],
  }));

  const dangling = findDanglingDeps(records);
  if (dangling.length > 0) {
    for (const d of dangling) {
      for (const missing of d.missing) {
        ctx.addIssue({
          code: "custom",
          message: `job '${d.id}' has a dangling 'needs' reference to '${missing}'`,
          path: ["jobs", d.id, "needs"],
          params: { kind: TOPOLOGY_ISSUE_KIND, code: ValidationIssueCode.danglingNeed },
        });
      }
    }
    return; // Skip cycle check; would walk into ghost nodes.
  }

  const cycle = findCycle(records);
  if (cycle) {
    ctx.addIssue({
      code: "custom",
      message: `cycle detected in 'needs' graph: ${cycle.join(" → ")}`,
      path: ["jobs"],
      params: { kind: TOPOLOGY_ISSUE_KIND, code: ValidationIssueCode.cycleDetected },
    });
  }
});

/** Inferred output type. */
export type Workflow = z.infer<typeof workflowSchema>;
