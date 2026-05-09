/**
 * Anonymous PostHog telemetry for AIactions.
 *
 * Emits one event — `workflow_invoked` — each time a workflow starts. No PII,
 * no user identity. A random UUID is persisted to `<aiActionsHome>/telemetry-id`
 * so we can count distinct installs; `$process_person_profile: false` keeps
 * events in PostHog's anonymous tier (no person profile ever created).
 *
 * Configuration (env vars):
 *   - AIA_POSTHOG_API_KEY    — required to enable. Without it, telemetry is disabled.
 *   - AIA_POSTHOG_HOST       — defaults to https://us.i.posthog.com
 *
 * Opt-out (any one disables telemetry):
 *   - AIA_TELEMETRY_DISABLED=1
 *   - DO_NOT_TRACK=1                   (de facto standard)
 *   - AIA_POSTHOG_API_KEY unset
 *
 * Telemetry is enabled by default (opt-out) thanks to the embedded write-only
 * project key. Set any of the opt-out vars above to disable.
 *
 * All capture functions are fire-and-forget: telemetry errors are swallowed.
 * Capture must never crash AIactions.
 */

import { randomUUID } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import type { PostHog } from "posthog-node";

import { resolveAIActionsHome } from "./paths.ts";

/**
 * Embedded write-only PostHog project key for the AIactions project.
 * `phc_*` keys can ONLY write events, never read data — safe to ship in
 * source. Override with `AIA_POSTHOG_API_KEY` for self-hosted PostHog or
 * a different project.
 */
const EMBEDDED_POSTHOG_API_KEY: string | null = "phc_zcZn2KSAyDKJW8yjzJjKf8fNgDHq3NJdWP7MWMWeRhPY";

const DEFAULT_POSTHOG_HOST = "https://us.i.posthog.com";

/** Max length of fields sent to PostHog. Guards against unusually long values. */
const FIELD_MAX_LENGTH = 500;

const TELEMETRY_ID_FILENAME = "telemetry-id";

/** Subset of process.env relevant to telemetry. Tests inject custom values. */
export interface TelemetryEnv {
  apiKey?: string;
  host?: string;
  disabled?: boolean;
}

function readEnv(): TelemetryEnv {
  return {
    apiKey: process.env.AIA_POSTHOG_API_KEY ?? EMBEDDED_POSTHOG_API_KEY ?? undefined,
    host: process.env.AIA_POSTHOG_HOST,
    disabled: process.env.AIA_TELEMETRY_DISABLED === "1" || process.env.DO_NOT_TRACK === "1",
  };
}

/**
 * Whether telemetry is disabled. Returns `true` when any opt-out env var is
 * set or when no API key is configured (neither embedded nor via env).
 */
export function isTelemetryDisabled(env: TelemetryEnv = readEnv()): boolean {
  if (env.disabled === true) return true;
  if (env.apiKey === undefined || env.apiKey === "") return true;
  return false;
}

/**
 * Load or create a stable anonymous install UUID at `<aiActionsHome>/telemetry-id`.
 * If the file can't be read or written (permissions, disk full), a fresh UUID
 * is returned for this session — telemetry still works, just not correlated
 * across runs.
 *
 * Tests pass `homeDir` directly to bypass the global home resolution.
 */
export function getOrCreateTelemetryId(homeDir?: string): string {
  const home = homeDir ?? resolveAIActionsHome();
  const idPath = join(home, TELEMETRY_ID_FILENAME);
  try {
    if (existsSync(idPath)) {
      const existing = readFileSync(idPath, "utf8").trim();
      if (existing.length > 0) return existing;
    }
  } catch {
    // Read failed — fall through to write a fresh id.
  }

  const id = randomUUID();
  try {
    mkdirSync(home, { recursive: true });
    writeFileSync(idPath, id, "utf8");
  } catch {
    // Persist failed — return the in-memory id so this session still works.
  }
  return id;
}

let cachedClient: Promise<PostHog | null> | undefined;

async function initClient(env: TelemetryEnv): Promise<PostHog | null> {
  if (isTelemetryDisabled(env)) return null;
  if (env.apiKey === undefined || env.apiKey === "") return null;
  try {
    const mod = await import("posthog-node");
    const client = new mod.PostHog(env.apiKey, {
      host: env.host ?? DEFAULT_POSTHOG_HOST,
      flushAt: 20,
      flushInterval: 10000,
      disableGeoip: true,
    });
    return client;
  } catch {
    return null;
  }
}

async function getClient(): Promise<PostHog | null> {
  if (cachedClient === undefined) {
    cachedClient = initClient(readEnv());
  }
  return cachedClient;
}

/** Properties for the `workflow_invoked` event. */
export interface WorkflowInvokedProperties {
  workflowName: string;
  workflowDescription?: string;
  aiactionsVersion?: string;
}

function truncate(value: string, max: number): string {
  return value.length > max ? value.slice(0, max) : value;
}

/**
 * Fire-and-forget capture of a `workflow_invoked` event. Never throws,
 * never awaits — safe to call from hot paths.
 */
export function captureWorkflowInvoked(props: WorkflowInvokedProperties): void {
  if (isTelemetryDisabled()) return;
  void (async (): Promise<void> => {
    try {
      const client = await getClient();
      if (client === null) return;
      const description =
        props.workflowDescription !== undefined
          ? truncate(props.workflowDescription, FIELD_MAX_LENGTH)
          : undefined;
      client.capture({
        distinctId: getOrCreateTelemetryId(),
        event: "workflow_invoked",
        properties: {
          $process_person_profile: false,
          workflow_name: truncate(props.workflowName, FIELD_MAX_LENGTH),
          ...(description !== undefined ? { workflow_description: description } : {}),
          ...(props.aiactionsVersion !== undefined
            ? { aiactions_version: props.aiactionsVersion }
            : {}),
        },
      });
    } catch {
      // Swallow — capture must never crash the runtime.
    }
  })();
}

/**
 * Flush queued events and close the PostHog client. Call on process exit
 * (CLI command end) so buffered events aren't lost. Safe to call when
 * telemetry was never initialized.
 */
export async function shutdownTelemetry(): Promise<void> {
  if (cachedClient === undefined) return;
  try {
    const client = await cachedClient;
    if (client !== null) {
      await client.shutdown();
    }
  } catch {
    // Swallow — shutdown must never throw.
  } finally {
    cachedClient = undefined;
  }
}

/** Reset internal state for tests. NOT part of the public stable API. */
export function resetTelemetryForTests(): void {
  cachedClient = undefined;
}
