/**
 * Public surface of the @aiactions/discovery package. Re-exports the three
 * primitives + the types + the error class.
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

export { findGitRoot } from "./find-git-root.ts";
export { loadWorkflowsFromDir } from "./load-from-dir.ts";
export { discoverWorkflows } from "./discover-workflows.ts";
