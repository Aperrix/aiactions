/**
 * Zod schema for `uses:` refs. AIactions only supports two ref kinds:
 * `registry` (resolved from the dedicated actions monorepo) and `local`
 * (path on disk, for action authoring + integration tests). Git URLs
 * (`git+<url>#<ref>`) are explicitly rejected to keep the resolver
 * surface small and supply-chain attestation tractable.
 *
 * Contents:
 * - `RefKind` const + type — discriminator (`registry | local`).
 * - `UsesRef` discriminated union — output of the schema.
 * - `usesRefSchema` — `z.string().transform()` that parses the raw ref into
 *   a `UsesRef` or fails with a clear `custom`-coded issue.
 */

import { z } from "zod";

/** Discriminator for parsed `uses:` refs. */
export const RefKind = {
  registry: "registry",
  local: "local",
} as const;

export type RefKind = (typeof RefKind)[keyof typeof RefKind];

/**
 * Parsed registry ref of the form `<namespace>/<name>@<version>`.
 * `version` is kept opaque at this layer — the resolver decides whether
 * it is a semver, tag, or branch.
 */
export interface RegistryRef {
  readonly kind: typeof RefKind.registry;
  readonly raw: string;
  readonly namespace: string;
  readonly name: string;
  readonly version: string;
}

/**
 * Parsed local ref of the form `./<rel>`, `../<rel>` or `file:///<abs>`.
 * `path` is the on-disk path with the `file://` scheme stripped (when
 * present) but otherwise unmodified — the resolver normalises it.
 */
export interface LocalRef {
  readonly kind: typeof RefKind.local;
  readonly raw: string;
  readonly path: string;
}

/** Parsed `uses:` ref, discriminated by `kind`. */
export type UsesRef = RegistryRef | LocalRef;

const REGISTRY_RE = /^([a-z][a-z0-9-]*)\/([a-z][a-z0-9-]*)@(.+)$/;
const FILE_SCHEME = "file://";

/**
 * Parse a raw `uses:` ref string into a `UsesRef`. Recognises the two
 * supported forms; rejects everything else (notably `git+...`) with an
 * explicit, anti-regression-friendly message.
 *
 * @throws Adds a `custom`-coded Zod issue for any unrecognised ref.
 */
export const usesRefSchema = z
  .string()
  .min(1)
  .transform((value, ctx): UsesRef => {
    if (value.startsWith("git+")) {
      ctx.addIssue({
        code: "custom",
        message:
          "git+ refs are not supported; use a registry ref ('<ns>/<name>@<ver>') or a local ref ('./...' / 'file:///...')",
      });
      return z.NEVER;
    }

    if (value.startsWith("./") || value.startsWith("../")) {
      return { kind: RefKind.local, raw: value, path: value };
    }

    if (value.startsWith(FILE_SCHEME)) {
      const path = value.slice(FILE_SCHEME.length);
      if (path.length === 0) {
        ctx.addIssue({
          code: "custom",
          message: "file:// ref must include an absolute path",
        });
        return z.NEVER;
      }
      return { kind: RefKind.local, raw: value, path };
    }

    const match = REGISTRY_RE.exec(value);
    if (match) {
      const [, namespace, name, version] = match;
      return {
        kind: RefKind.registry,
        raw: value,
        namespace: namespace ?? "",
        name: name ?? "",
        version: version ?? "",
      };
    }

    ctx.addIssue({
      code: "custom",
      message: `unrecognised uses ref '${value}' (expected '<ns>/<name>@<ver>' or './...' / '../...' / 'file:///...')`,
    });
    return z.NEVER;
  });
