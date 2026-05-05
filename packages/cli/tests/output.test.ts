import { expect, test } from "vite-plus/test";

import { formatTable, type TableColumn } from "../src/lib/output.ts";

test("formatTable aligns columns with padEnd", () => {
  const cols: TableColumn<{ a: string; b: string }>[] = [
    { header: "A", value: (r) => r.a },
    { header: "B", value: (r) => r.b },
  ];
  const rows = [
    { a: "foo", b: "1" },
    { a: "longer", b: "10" },
  ];
  const out = formatTable(rows, cols);
  const lines = out.split("\n");
  expect(lines).toHaveLength(3);
  expect(lines[0]).toBe("A       B ");
  expect(lines[1]).toBe("foo     1 ");
  expect(lines[2]).toBe("longer  10");
});

test("formatTable on empty input returns empty string", () => {
  const out = formatTable([], [{ header: "A", value: () => "" }]);
  expect(out).toBe("");
});
