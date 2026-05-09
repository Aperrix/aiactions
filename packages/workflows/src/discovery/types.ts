/**
 * Public types for workflow discovery. The discovery API turns one or more
 * filesystem roots into typed Workflow objects with origin badges and
 * collision metadata.
 *
 * The orchestrator entry point is `discoverWorkflows` (see
 * ./discover-workflows.ts). Lower-level primitives are `loadWorkflowsFromDir`
 * (./load-from-dir.ts) and `findGitRoot` (./find-git-root.ts).
 */

import type { Workflow } from "../schema/workflow.ts";

/** Where a discovered workflow was loaded from. */
export type WorkflowOrigin = "project" | "home";

/**
 * One workflow loaded from one root. The `name` is the filename stem
 * (no extension). When the same `name` exists in both roots, the project
 * layer wins and `shadowed` carries the home file's path/origin.
 *
 * Within-root `.yaml`/`.yml` collisions are resolved before this type is
 * produced — `.yaml` wins, `.yml` is silently dropped, no `shadowed` is
 * populated for the within-root case (see spec D3).
 */
export interface DiscoveredWorkflow {
  readonly name: string;
  readonly origin: WorkflowOrigin;
  readonly absolutePath: string;
  readonly workflow: Workflow;
  readonly shadowed?: {
    readonly absolutePath: string;
    readonly origin: WorkflowOrigin;
  };
}

/** Discriminator for per-file failures captured during discovery. */
export type DiscoveryErrorKind =
  | "yaml_parse"
  | "schema_validation"
  | "graph_validation"
  | "io_error";

/** A per-file failure. Discovery never throws on these — it aggregates. */
export interface DiscoveryError {
  readonly absolutePath: string;
  readonly origin: WorkflowOrigin;
  readonly kind: DiscoveryErrorKind;
  readonly message: string;
  readonly cause?: unknown;
}

/** Result of loading one root directory. `shadowed` is computed by the orchestrator, not at this layer. */
export interface DirLoadResult {
  readonly workflows: ReadonlyArray<Omit<DiscoveredWorkflow, "shadowed">>;
  readonly errors: ReadonlyArray<DiscoveryError>;
}

/** Result of `discoverWorkflows`. */
export interface DiscoveryResult {
  readonly workflows: ReadonlyArray<DiscoveredWorkflow>;
  readonly errors: ReadonlyArray<DiscoveryError>;
}

/** Optional overrides for `discoverWorkflows`. Both default to live process state. */
export interface DiscoverOptions {
  /** Defaults to `process.cwd()`. */
  readonly cwd?: string;
  /** Defaults to `os.homedir()`. The test seam — production callers omit it. */
  readonly homeDir?: string;
}
