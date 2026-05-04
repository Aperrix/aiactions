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
 */

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
