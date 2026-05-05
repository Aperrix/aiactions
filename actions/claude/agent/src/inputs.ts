/**
 * Parses raw string-only YAML inputs (as delivered by the runtime
 * loader) into a typed `ParsedInputs` object suitable for building
 * Claude Agent SDK options.
 *
 * Why Zod and not plain manual parsing: each input has independent
 * coercion rules (CSV-to-array, JSON-to-object, optional-passthrough);
 * Zod centralizes that logic in one schema and produces a single
 * aggregated error message on failure.
 *
 * Contents:
 * - `parseInputs(rawInputs)` — main entry-point.
 * - `ParsedInputs` — inferred output type.
 * - Internal field schemas (CSV, JSON, etc).
 */

import { z } from "zod";

const NON_EMPTY = (v: string): boolean => v.length > 0;

const optionalNonEmpty = z
  .string()
  .optional()
  .transform((v) => (v && NON_EMPTY(v) ? v : undefined));

const optionalNumber = z
  .string()
  .optional()
  .transform((v, ctx) => {
    if (!v || !NON_EMPTY(v)) return undefined;
    const n = Number(v);
    if (!Number.isFinite(n)) {
      ctx.addIssue({ code: "custom", message: `not a finite number: '${v}'` });
      return z.NEVER;
    }
    return n;
  });

const optionalCsv = z
  .string()
  .optional()
  .transform((v) => {
    if (!v || !NON_EMPTY(v)) return undefined;
    return v
      .split(",")
      .map((s) => s.trim())
      .filter(NON_EMPTY);
  });

const optionalJson = <T>(label: string) =>
  z
    .string()
    .optional()
    .transform((v, ctx): T | undefined => {
      if (!v || !NON_EMPTY(v)) return undefined;
      try {
        return JSON.parse(v) as T;
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        ctx.addIssue({ code: "custom", message: `${label}: invalid JSON (${msg})` });
        return z.NEVER;
      }
    });

const PERMISSION_MODES = ["default", "acceptEdits", "bypassPermissions", "plan"] as const;
type PermissionMode = (typeof PERMISSION_MODES)[number];

const permissionMode = z
  .string()
  .optional()
  .transform((v, ctx): PermissionMode => {
    const candidate = v && NON_EMPTY(v) ? v : "bypassPermissions";
    if (!PERMISSION_MODES.includes(candidate as PermissionMode)) {
      ctx.addIssue({
        code: "custom",
        message: `permission_mode must be one of: ${PERMISSION_MODES.join(", ")} (got '${candidate}')`,
      });
      return z.NEVER;
    }
    return candidate as PermissionMode;
  });

const settingSources = z
  .string()
  .optional()
  .transform((v): ("project" | "user")[] | undefined => {
    const raw = v && NON_EMPTY(v) ? v : "project,user";
    const parts = raw
      .split(",")
      .map((s) => s.trim())
      .filter(NON_EMPTY);
    return parts.filter((p): p is "project" | "user" => p === "project" || p === "user");
  });

interface SystemPromptObject {
  readonly type: "preset";
  readonly preset: "claude_code";
  readonly append?: string;
}

const systemPrompt = z
  .string()
  .optional()
  .transform((v, ctx): string | SystemPromptObject | undefined => {
    if (v === undefined) return { type: "preset", preset: "claude_code" };
    if (v.length === 0) return undefined;
    if (!v.startsWith("{")) return v;
    try {
      const parsed = JSON.parse(v) as unknown;
      if (
        parsed !== null &&
        typeof parsed === "object" &&
        "type" in parsed &&
        (parsed as { type: unknown }).type === "preset"
      ) {
        return parsed as SystemPromptObject;
      }
      ctx.addIssue({
        code: "custom",
        message:
          "system_prompt: object form must be `{ type: 'preset', preset: 'claude_code', append?: string }`",
      });
      return z.NEVER;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      ctx.addIssue({ code: "custom", message: `system_prompt: invalid JSON (${msg})` });
      return z.NEVER;
    }
  });

export const inputsSchema = z.object({
  prompt: z.string().min(1, "prompt is required"),
  model: optionalNonEmpty,
  cwd: optionalNonEmpty,
  system_prompt: systemPrompt,
  max_turns: optionalNumber,
  allowed_tools: optionalCsv,
  mcp_servers: optionalJson<Record<string, unknown>>("mcp_servers"),
  permission_mode: permissionMode,
  setting_sources: settingSources,
  resume_session_id: optionalNonEmpty,
  fallback_model: optionalNonEmpty,
  max_budget_usd: optionalNumber,
  path_to_claude_code_executable: optionalNonEmpty,
});

export type ParsedInputs = z.infer<typeof inputsSchema>;

/**
 * Parse raw string-only action inputs into a typed `ParsedInputs` object.
 *
 * @param raw - Record of string inputs as delivered by the runtime loader.
 * @returns Validated and coerced inputs.
 * @throws {Error} With aggregated issue messages when validation fails.
 */
export function parseInputs(raw: Readonly<Record<string, string>>): ParsedInputs {
  const result = inputsSchema.safeParse(raw);
  if (result.success) return result.data;
  const issues = result.error.issues.map((i) => `  - ${i.path.join(".")}: ${i.message}`).join("\n");
  throw new Error(`invalid action inputs:\n${issues}`);
}
