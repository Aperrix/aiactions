import { type RegistryRef, usesRefSchema } from "@aiactions/workflows";

import { UsageError } from "./errors.ts";

/**
 * Parse a CLI argv ref string into a `RegistryRef`. Wraps the
 * upstream `usesRefSchema` and narrows the result, rejecting local
 * refs (which the CLI does not install from disk).
 */
export function parseRegistryRef(input: string): RegistryRef {
  const result = usesRefSchema.safeParse(input);
  if (!result.success) {
    const message = result.error.issues[0]?.message ?? "invalid ref";
    throw new UsageError(`bad ref '${input}': ${message}`);
  }

  if (result.data.kind !== "registry") {
    throw new UsageError(`install only supports registry refs '<ns>/<name>@<ver>', got '${input}'`);
  }

  return result.data;
}
