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

const SETTING_SOURCES = ["project", "user"] as const;
type SettingSource = (typeof SETTING_SOURCES)[number];

const settingSources = z
  .string()
  .optional()
  .transform((v, ctx): SettingSource[] | undefined => {
    const raw = v && NON_EMPTY(v) ? v : "project,user";
    const parts = raw
      .split(",")
      .map((s) => s.trim())
      .filter(NON_EMPTY);
    const unknown = parts.filter((p): p is string => !SETTING_SOURCES.includes(p as SettingSource));
    if (unknown.length > 0) {
      const list = unknown.map((u) => `'${u}'`).join(", ");
      ctx.addIssue({
        code: "custom",
        message: `setting_sources contains unknown values: ${list}. Allowed: ${SETTING_SOURCES.join(", ")}`,
      });
      return z.NEVER;
    }
    return parts as SettingSource[];
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
    let parsed: unknown;
    try {
      parsed = JSON.parse(v);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      ctx.addIssue({ code: "custom", message: `system_prompt: invalid JSON (${msg})` });
      return z.NEVER;
    }
    if (parsed === null || typeof parsed !== "object" || !("type" in parsed)) {
      ctx.addIssue({
        code: "custom",
        message:
          "system_prompt: object form must be `{ type: 'preset', preset: 'claude_code', append?: string }`",
      });
      return z.NEVER;
    }
    const obj = parsed as { type: unknown; preset?: unknown; append?: unknown };
    if (obj.type !== "preset") {
      ctx.addIssue({
        code: "custom",
        message:
          "system_prompt: object form must be `{ type: 'preset', preset: 'claude_code', append?: string }`",
      });
      return z.NEVER;
    }
    if (obj.preset !== "claude_code") {
      ctx.addIssue({
        code: "custom",
        message: `system_prompt: object form's \`preset\` must be "claude_code" (got '${String(obj.preset)}')`,
      });
      return z.NEVER;
    }
    return parsed as SystemPromptObject;
  });

export const inputsSchema = z.object({
  prompt: z.string().min(1, "prompt is required"),
  model: optionalNonEmpty,
  cwd: optionalNonEmpty,
  system_prompt: systemPrompt,
  max_turns: optionalNumber,
  allowed_tools: optionalCsv,
  mcp_servers: z
    .string()
    .optional()
    .transform((v, ctx): Record<string, unknown> | undefined => {
      if (!v || !NON_EMPTY(v)) return undefined;
      let parsed: unknown;
      try {
        parsed = JSON.parse(v);
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        ctx.addIssue({ code: "custom", message: `mcp_servers: invalid JSON (${msg})` });
        return z.NEVER;
      }
      if (parsed === null || typeof parsed !== "object" || Array.isArray(parsed)) {
        ctx.addIssue({ code: "custom", message: "mcp_servers: must be a JSON object" });
        return z.NEVER;
      }
      const record = parsed as Record<string, unknown>;
      const stdioNames = Object.entries(record)
        .filter(
          ([, cfg]) =>
            cfg !== null &&
            typeof cfg === "object" &&
            (cfg as Record<string, unknown>).type === "stdio",
        )
        .map(([name]) => name);
      if (stdioNames.length > 0) {
        ctx.addIssue({
          code: "custom",
          message:
            `mcp_servers: stdio entries are not allowed (unsafe subprocess spawn vector): ` +
            stdioNames.map((n) => `'${n}'`).join(", ") +
            `. Use a network-type MCP server (sse, http) instead.`,
        });
        return z.NEVER;
      }
      return record;
    }),
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
