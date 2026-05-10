import { relative } from "node:path";

export interface Issue {
  readonly zodPath: string;
  readonly message: string;
}

/**
 * Render one issue as a single CLI line.
 * Path is relativized to `process.cwd()` when the manifest sits inside
 * the cwd; otherwise the absolute path is preserved.
 */
export function formatIssue(issue: Issue, manifestPath: string): string {
  const rel = relative(process.cwd(), manifestPath);
  const display =
    rel.length > 0 && !rel.startsWith("..") && !rel.startsWith("/") ? rel : manifestPath;
  if (issue.zodPath.length === 0) {
    return `${display}: ${issue.message}`;
  }
  return `${display}: ${issue.zodPath}: ${issue.message}`;
}
