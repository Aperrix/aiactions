import { createServer, type Server } from "node:http";
import { afterEach, beforeEach as _beforeEach, expect, test } from "vite-plus/test";

import {
  fetchRegistry,
  groupByCoord,
  REGISTRY_URL_DEFAULT,
  resolveLatest,
  resolveRegistryUrl,
} from "../src/index-fetch.ts";

let server: Server;
let baseUrl: string;

function startServer(
  handler: (
    req: import("node:http").IncomingMessage,
    res: import("node:http").ServerResponse,
  ) => void,
): Promise<{ url: string; server: Server }> {
  return new Promise((resolve) => {
    const s = createServer(handler);
    s.listen(0, "127.0.0.1", () => {
      const addr = s.address();
      if (addr === null || typeof addr === "string") {
        throw new Error("unexpected server address");
      }
      resolve({ url: `http://127.0.0.1:${addr.port}/registry.json`, server: s });
    });
  });
}

afterEach(async () => {
  if (server) await new Promise<void>((r) => server.close(() => r()));
});

test("resolveRegistryUrl returns default when env unset", () => {
  expect(resolveRegistryUrl({})).toBe(REGISTRY_URL_DEFAULT);
});

test("resolveRegistryUrl honors AIACTIONS_REGISTRY_URL", () => {
  expect(resolveRegistryUrl({ AIACTIONS_REGISTRY_URL: "https://example.test/r.json" })).toBe(
    "https://example.test/r.json",
  );
});

test("fetchRegistry parses valid JSON", async () => {
  const valid = JSON.stringify({
    actions: [{ ref: "claude/agent@1.0.0", description: "Agent loop" }],
  });
  ({ url: baseUrl, server } = await startServer((_req, res) => {
    res.writeHead(200, { "content-type": "application/json" });
    res.end(valid);
  }));
  const reg = await fetchRegistry(baseUrl);
  expect(reg.actions).toHaveLength(1);
});

test("fetchRegistry throws RegistryFetchError on 500", async () => {
  ({ url: baseUrl, server } = await startServer((_req, res) => {
    res.writeHead(500);
    res.end("boom");
  }));
  await expect(fetchRegistry(baseUrl)).rejects.toThrow(/registry/);
});

test("fetchRegistry throws RegistryValidationError on malformed JSON", async () => {
  ({ url: baseUrl, server } = await startServer((_req, res) => {
    res.writeHead(200);
    res.end("{not json");
  }));
  await expect(fetchRegistry(baseUrl)).rejects.toThrow(/malformed|invalid|JSON/i);
});

test("fetchRegistry throws RegistryValidationError on Zod-invalid shape", async () => {
  ({ url: baseUrl, server } = await startServer((_req, res) => {
    res.writeHead(200);
    res.end(JSON.stringify({ actions: [{ ref: "no-version", description: "x" }] }));
  }));
  await expect(fetchRegistry(baseUrl)).rejects.toThrow();
});

test("resolveLatest returns highest semver among multiple versions", () => {
  const reg = {
    actions: [
      { ref: "foo/bar@1.0.0", description: "x" },
      { ref: "foo/bar@2.1.0", description: "x" },
      { ref: "foo/bar@2.0.0", description: "x" },
    ],
  };
  expect(resolveLatest(reg, "foo", "bar")?.ref).toBe("foo/bar@2.1.0");
});

test("resolveLatest returns null when coord absent", () => {
  const reg = { actions: [{ ref: "foo/bar@1.0.0", description: "x" }] };
  expect(resolveLatest(reg, "baz", "qux")).toBeNull();
});

test("resolveLatest treats pre-release as lower than stable", () => {
  const reg = {
    actions: [
      { ref: "foo/bar@1.0.0-beta.1", description: "x" },
      { ref: "foo/bar@1.0.0", description: "x" },
    ],
  };
  expect(resolveLatest(reg, "foo", "bar")?.ref).toBe("foo/bar@1.0.0");
});

test("groupByCoord groups by '<ns>/<name>' with versions sorted desc", () => {
  const reg = {
    actions: [
      { ref: "a/b@1.0.0", description: "x" },
      { ref: "a/b@2.0.0", description: "x" },
      { ref: "c/d@0.1.0", description: "x" },
    ],
  };
  const map = groupByCoord(reg);
  expect(map.get("a/b")?.map((e) => e.ref)).toEqual(["a/b@2.0.0", "a/b@1.0.0"]);
  expect(map.get("c/d")?.map((e) => e.ref)).toEqual(["c/d@0.1.0"]);
});
