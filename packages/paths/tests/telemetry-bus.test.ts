import { describe, expect, test } from "vite-plus/test";

import { createTelemetryBus } from "../src/telemetry-bus.ts";

interface TestEvents {
  "registry.fetch.started": { ref: string };
  "registry.fetch.completed": { ref: string; durationMs: number };
}

describe("createTelemetryBus", () => {
  test("dispatches emitted events to subscribed handlers", () => {
    const bus = createTelemetryBus<TestEvents>();
    const received: Array<{ ref: string }> = [];

    bus.on("registry.fetch.started", (payload) => {
      received.push(payload);
    });

    bus.emit("registry.fetch.started", { ref: "claude/agent@v1" });

    expect(received).toEqual([{ ref: "claude/agent@v1" }]);
  });

  test("dispatches in registration order to multiple handlers", () => {
    const bus = createTelemetryBus<TestEvents>();
    const order: number[] = [];

    bus.on("registry.fetch.started", () => order.push(1));
    bus.on("registry.fetch.started", () => order.push(2));
    bus.on("registry.fetch.started", () => order.push(3));

    bus.emit("registry.fetch.started", { ref: "x" });

    expect(order).toEqual([1, 2, 3]);
  });

  test("emit on event with zero handlers is a no-op", () => {
    const bus = createTelemetryBus<TestEvents>();

    expect(() => bus.emit("registry.fetch.completed", { ref: "x", durationMs: 1 })).not.toThrow();
  });

  test("on() returns an unsubscribe function", () => {
    const bus = createTelemetryBus<TestEvents>();
    let calls = 0;

    const unsubscribe = bus.on("registry.fetch.started", () => {
      calls += 1;
    });

    bus.emit("registry.fetch.started", { ref: "x" });
    unsubscribe();
    bus.emit("registry.fetch.started", { ref: "y" });

    expect(calls).toBe(1);
  });

  test("handler errors propagate to the emitter (no swallowing)", () => {
    const bus = createTelemetryBus<TestEvents>();

    bus.on("registry.fetch.started", () => {
      throw new Error("handler failed");
    });

    expect(() => bus.emit("registry.fetch.started", { ref: "x" })).toThrow("handler failed");
  });
});
