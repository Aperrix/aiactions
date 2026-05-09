/**
 * Public surface of the discovery module. Re-exports the three primitives
 * + the types + the error class. Consumers (`@aiactions/runtime`,
 * `@aiactions/cli`) should import from `@aiactions/workflows` (the package
 * root), not from this file directly.
 */

export type {
  DiscoveredWorkflow,
  DiscoveryError,
  DiscoveryErrorKind,
  DiscoveryResult,
  DirLoadResult,
  DiscoverOptions,
  WorkflowOrigin,
} from "./types.ts";

export { NotInGitRepoError } from "./errors.ts";

// Function exports — added by Task 2/3/4 once the implementations land:
export { findGitRoot } from "./find-git-root.ts";
export { loadWorkflowsFromDir } from "./load-from-dir.ts";
export { discoverWorkflows } from "./discover-workflows.ts";
