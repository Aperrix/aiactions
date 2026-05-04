/**
 * Tests for the pure topology helpers: dangling-dep detection, cycle
 * detection, and Kahn topological sort.
 *
 * Contents:
 * - `findDanglingDeps`: empty, none, single, multiple.
 * - `findCycle`: acyclic, two-node cycle, three-node cycle, self-loop.
 * - `topoSort`: linear, diamond, throws on cycle, throws on dangling.
 */

import { describe, expect, test } from "vite-plus/test";

import { type DepRecord, findCycle, findDanglingDeps, topoSort } from "../src/schema/topology.ts";

describe("findDanglingDeps", () => {
  test("returns empty array for an empty graph", () => {
    expect(findDanglingDeps([])).toEqual([]);
  });

  test("returns empty array when no deps are dangling", () => {
    const records: DepRecord[] = [
      { id: "a", deps: [] },
      { id: "b", deps: ["a"] },
    ];
    expect(findDanglingDeps(records)).toEqual([]);
  });

  test("returns a single entry for a single dangling dep", () => {
    const records: DepRecord[] = [{ id: "a", deps: ["ghost"] }];
    expect(findDanglingDeps(records)).toEqual([{ id: "a", missing: ["ghost"] }]);
  });

  test("collects multiple missing deps per node", () => {
    const records: DepRecord[] = [
      { id: "a", deps: ["x", "y", "z"] },
      { id: "x", deps: [] },
    ];
    expect(findDanglingDeps(records)).toEqual([{ id: "a", missing: ["y", "z"] }]);
  });

  test("collects dangling deps across multiple nodes", () => {
    const records: DepRecord[] = [
      { id: "a", deps: ["ghost1"] },
      { id: "b", deps: ["ghost2"] },
    ];
    const found = findDanglingDeps(records);
    expect(found).toHaveLength(2);
    expect(found).toContainEqual({ id: "a", missing: ["ghost1"] });
    expect(found).toContainEqual({ id: "b", missing: ["ghost2"] });
  });
});

describe("findCycle", () => {
  test("returns null for an empty graph", () => {
    expect(findCycle([])).toBeNull();
  });

  test("returns null for an acyclic linear graph", () => {
    const records: DepRecord[] = [
      { id: "a", deps: [] },
      { id: "b", deps: ["a"] },
      { id: "c", deps: ["b"] },
    ];
    expect(findCycle(records)).toBeNull();
  });

  test("detects a two-node cycle", () => {
    const records: DepRecord[] = [
      { id: "a", deps: ["b"] },
      { id: "b", deps: ["a"] },
    ];
    const cycle = findCycle(records);
    expect(cycle).not.toBeNull();
    if (cycle) {
      expect(cycle).toContain("a");
      expect(cycle).toContain("b");
      expect(cycle[0]).toBe(cycle[cycle.length - 1]);
    }
  });

  test("detects a three-node cycle", () => {
    const records: DepRecord[] = [
      { id: "a", deps: ["b"] },
      { id: "b", deps: ["c"] },
      { id: "c", deps: ["a"] },
    ];
    const cycle = findCycle(records);
    expect(cycle).not.toBeNull();
    if (cycle) {
      expect(cycle.length).toBeGreaterThanOrEqual(3);
      expect(cycle[0]).toBe(cycle[cycle.length - 1]);
    }
  });

  test("detects a self-loop as a cycle", () => {
    const records: DepRecord[] = [{ id: "a", deps: ["a"] }];
    const cycle = findCycle(records);
    expect(cycle).not.toBeNull();
  });

  test("ignores dangling deps when looking for cycles", () => {
    const records: DepRecord[] = [
      { id: "a", deps: ["ghost", "b"] },
      { id: "b", deps: [] },
    ];
    expect(findCycle(records)).toBeNull();
  });
});

describe("topoSort", () => {
  test("returns empty array for an empty graph", () => {
    expect(topoSort([])).toEqual([]);
  });

  test("orders a linear chain so that deps precede dependents", () => {
    const records: DepRecord[] = [
      { id: "c", deps: ["b"] },
      { id: "b", deps: ["a"] },
      { id: "a", deps: [] },
    ];
    const order = topoSort(records);
    expect(order.indexOf("a")).toBeLessThan(order.indexOf("b"));
    expect(order.indexOf("b")).toBeLessThan(order.indexOf("c"));
  });

  test("orders a diamond DAG so that the root precedes both branches and both precede the leaf", () => {
    const records: DepRecord[] = [
      { id: "root", deps: [] },
      { id: "left", deps: ["root"] },
      { id: "right", deps: ["root"] },
      { id: "leaf", deps: ["left", "right"] },
    ];
    const order = topoSort(records);
    expect(order.indexOf("root")).toBeLessThan(order.indexOf("left"));
    expect(order.indexOf("root")).toBeLessThan(order.indexOf("right"));
    expect(order.indexOf("left")).toBeLessThan(order.indexOf("leaf"));
    expect(order.indexOf("right")).toBeLessThan(order.indexOf("leaf"));
  });

  test("throws when a dep is unknown (dangling)", () => {
    const records: DepRecord[] = [{ id: "a", deps: ["ghost"] }];
    expect(() => topoSort(records)).toThrowError(/dangling dep/);
  });

  test("throws when the graph contains a cycle", () => {
    const records: DepRecord[] = [
      { id: "a", deps: ["b"] },
      { id: "b", deps: ["a"] },
    ];
    expect(() => topoSort(records)).toThrowError(/cycle/);
  });
});
