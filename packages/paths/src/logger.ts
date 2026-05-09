/**
 * Structured logger built on Pino.
 *
 * - Pretty-printed when stdout is a TTY and NODE_ENV !== 'production'.
 * - NDJSON otherwise (piped, redirected, or production).
 * - Threshold defaults to 'info', escalating to 'debug' when AIA_DEBUG is truthy.
 *
 * Pino-pretty runs as a destination stream (not a worker-thread transport)
 * so the logger keeps working when the CLI is bundled to a single file via
 * tsdown. Worker-thread transports rely on `require.resolve('pino-pretty')`
 * at runtime, which fails inside bundled artefacts.
 */

import pino from "pino";
import type { Logger } from "pino";
import pretty from "pino-pretty";

import { loadEnv } from "./env.ts";

export type { Logger } from "pino";

function buildRoot(): Logger {
  const env = loadEnv();
  const level = env.debug ? "debug" : "info";
  const usePretty = process.stdout.isTTY && process.env.NODE_ENV !== "production";

  if (usePretty) {
    try {
      const stream = pretty({
        colorize: true,
        levelFirst: true,
        translateTime: "SYS:standard",
        ignore: "pid,hostname",
      });
      return pino({ level }, stream);
    } catch (err) {
      // pino-pretty failed to initialize (broken TTY descriptor or
      // incompatible runtime). Fall back to NDJSON so logging keeps
      // working instead of crashing the entire process at module import.
      console.warn(
        `[logger] pino-pretty failed to initialize, falling back to JSON output: ${(err as Error).message}`,
      );
    }
  }

  return pino({ level });
}

/**
 * Root Pino logger instance. Configured once at module load — level
 * read from AIA_DEBUG, formatter chosen from TTY + NODE_ENV.
 */
export const rootLogger: Logger = buildRoot();

/**
 * Get a logger bound to a module namespace. Without `module`, returns
 * the root logger. With it, returns a Pino child with `{ module }`
 * binding included in every log line.
 */
export function createLogger(module?: string): Logger {
  return module !== undefined ? rootLogger.child({ module }) : rootLogger;
}
