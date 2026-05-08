import { registrySchema, type Registry, type RegistryEntry } from "@aiactions/workflows";
import { rcompare as semverRcompare } from "semver";

import { RegistryFetchError, RegistryValidationError } from "./errors.ts";

export const REGISTRY_URL_DEFAULT =
  "https://raw.githubusercontent.com/Aperrix/aiactions/main/actions/registry.json";

const FETCH_TIMEOUT_MS = 10_000;

export function resolveRegistryUrl(env: NodeJS.ProcessEnv): string {
  return env.AIACTIONS_REGISTRY_URL ?? REGISTRY_URL_DEFAULT;
}

export async function fetchRegistry(url?: string): Promise<Registry> {
  const target = url ?? resolveRegistryUrl(process.env);
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), FETCH_TIMEOUT_MS);

  let resp: Response;
  try {
    resp = await fetch(target, { signal: ctrl.signal });
  } catch (err) {
    throw new RegistryFetchError(
      `failed to fetch registry from ${target}: ${(err as Error).message}`,
      err,
    );
  } finally {
    clearTimeout(timer);
  }

  if (!resp.ok) {
    throw new RegistryFetchError(`registry fetch failed: ${target} returned HTTP ${resp.status}`);
  }

  const text = await resp.text();
  let raw: unknown;
  try {
    raw = JSON.parse(text);
  } catch (err) {
    throw new RegistryValidationError(
      `registry at ${target} is malformed JSON: ${(err as Error).message}`,
      err,
    );
  }

  const parsed = registrySchema.safeParse(raw);
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    throw new RegistryValidationError(
      `registry at ${target} failed validation: ${issue?.path.join(".")}: ${issue?.message}`,
      parsed.error,
    );
  }
  return parsed.data;
}

function parseVersionFromRef(ref: string): string {
  const at = ref.lastIndexOf("@");
  return ref.slice(at + 1);
}

function parseCoordFromRef(ref: string): { ns: string; name: string; version: string } {
  const at = ref.lastIndexOf("@");
  const ns = ref.slice(0, at).split("/")[0]!;
  const name = ref.slice(0, at).split("/")[1]!;
  return { ns, name, version: ref.slice(at + 1) };
}

export function resolveLatest(reg: Registry, ns: string, name: string): RegistryEntry | null {
  const candidates = reg.actions.filter((e) => {
    const c = parseCoordFromRef(e.ref);
    return c.ns === ns && c.name === name;
  });
  if (candidates.length === 0) return null;
  candidates.sort((a, b) => semverRcompare(parseVersionFromRef(a.ref), parseVersionFromRef(b.ref)));
  return candidates[0]!;
}

export function groupByCoord(reg: Registry): Map<string, RegistryEntry[]> {
  const out = new Map<string, RegistryEntry[]>();
  for (const e of reg.actions) {
    const c = parseCoordFromRef(e.ref);
    const key = `${c.ns}/${c.name}`;
    let bucket = out.get(key);
    if (!bucket) {
      bucket = [];
      out.set(key, bucket);
    }
    bucket.push(e);
  }
  for (const bucket of out.values()) {
    bucket.sort((a, b) => semverRcompare(parseVersionFromRef(a.ref), parseVersionFromRef(b.ref)));
  }
  return out;
}
