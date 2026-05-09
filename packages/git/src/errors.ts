/** Thrown when a `git` invocation exits non-zero. Captures the failed
 * command's args, captured stderr, exit code, and the original error
 * (chained via `cause` for stack-trace continuity). */
export class GitError extends Error {
  readonly args: readonly string[];
  readonly stderr: string;
  readonly code: number;

  constructor(
    message: string,
    init: { args: readonly string[]; stderr: string; code: number; cause: Error },
  ) {
    super(message, { cause: init.cause });
    this.name = "GitError";
    this.args = init.args;
    this.stderr = init.stderr;
    this.code = init.code;
  }
}
