import { UsageError } from "../_shared/cli-error.ts";

const SHORT_REF_RE = /^([a-z][a-z0-9-]*)\/([a-z][a-z0-9-]*)$/u;

export interface ShortRef {
  readonly ns: string;
  readonly name: string;
}

export function parseShortRef(input: string): ShortRef {
  const m = SHORT_REF_RE.exec(input);
  if (!m) {
    throw new UsageError(`expected '<ns>/<name>' or '<ns>/<name>@<ver>', got '${input}'`);
  }
  return { ns: m[1]!, name: m[2]! };
}
