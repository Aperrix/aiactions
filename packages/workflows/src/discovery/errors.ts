/**
 * Discovery error classes. Raised by `findGitRoot` (and propagated through
 * `discoverWorkflows`) when no `.git` ancestor exists.
 *
 * Per-file parse/schema/validation failures are NOT thrown — they are
 * captured in `DiscoveryError` records on `DiscoveryResult.errors`.
 */

/** Thrown when `findGitRoot` reaches the filesystem root without finding `.git`. */
export class NotInGitRepoError extends Error {
  readonly code = "ENOTINGITREPO" as const;
  constructor(public readonly startDir: string) {
    super(`not in a git repository: ${startDir}`);
    this.name = "NotInGitRepoError";
  }
}
