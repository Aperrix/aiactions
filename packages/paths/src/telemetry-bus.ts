/**
 * Typed synchronous event bus. Subscribers register a handler with `on`;
 * publishers emit events with a typed payload.
 *
 * Dispatch is synchronous and ordered by registration. Errors thrown by a
 * handler propagate to the emitter — there is no swallowing or aggregation.
 */

export interface TelemetryBus<EventMap extends object> {
  on<K extends keyof EventMap>(event: K, handler: (payload: EventMap[K]) => void): () => void;
  emit<K extends keyof EventMap>(event: K, payload: EventMap[K]): void;
}

export function createTelemetryBus<EventMap extends object>(): TelemetryBus<EventMap> {
  const handlers = new Map<keyof EventMap, Set<(payload: EventMap[keyof EventMap]) => void>>();

  return {
    on(event, handler) {
      let set = handlers.get(event);
      if (set === undefined) {
        set = new Set();
        handlers.set(event, set);
      }
      set.add(handler as (payload: EventMap[keyof EventMap]) => void);
      return () => {
        set.delete(handler as (payload: EventMap[keyof EventMap]) => void);
      };
    },
    emit(event, payload) {
      const set = handlers.get(event);
      if (set === undefined) return;
      for (const handler of set) {
        handler(payload);
      }
    },
  };
}
