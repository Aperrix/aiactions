export interface TableColumn<T> {
  readonly header: string;
  readonly value: (row: T) => string;
}

/**
 * Render `rows` as a left-aligned table with two-space gutters between
 * columns. Returns the empty string when `rows` is empty (callers
 * decide what to show in that case).
 */
export function formatTable<T>(rows: T[], cols: TableColumn<T>[]): string {
  if (rows.length === 0) return "";
  const widths = cols.map((col) =>
    Math.max(col.header.length, ...rows.map((r) => col.value(r).length)),
  );
  const sep = "  ";

  const renderRow = (cells: string[]): string =>
    cells.map((cell, i) => cell.padEnd(widths[i] ?? 0)).join(sep);

  const lines = [
    renderRow(cols.map((col) => col.header)),
    ...rows.map((row) => renderRow(cols.map((col) => col.value(row)))),
  ];
  return lines.join("\n");
}

/**
 * Returns true when interactive prompts/spinners should be shown:
 * stdout is a TTY *and* the command was not invoked with --json.
 */
export function isInteractive(json: boolean): boolean {
  return !json && Boolean(process.stdout.isTTY);
}
