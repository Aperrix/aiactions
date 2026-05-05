import { ensureCachedAction, type EnsureCachedActionOptions } from "@aiactions/runtime";
import * as clack from "@clack/prompts";
import { defineCommand } from "citty";

import { CliError } from "../../lib/errors.ts";
import { EXIT } from "../../lib/exit-codes.ts";
import { isInteractive } from "../../lib/output.ts";
import { parseRegistryRef } from "../../lib/parse-registry-ref.ts";
import { resolveRegistryRoot } from "../../lib/registry-root.ts";

export const installCommand = defineCommand({
  meta: {
    name: "install",
    description: "Install an action from the registry into the local cache",
  },
  args: {
    ref: {
      type: "positional",
      description: "Registry coordinate '<ns>/<name>@<ver>'",
      required: true,
    },
    json: {
      type: "boolean",
      description: "Emit machine-readable JSON instead of human output",
      default: false,
    },
  },
  async run({ args }) {
    const ref = parseRegistryRef(args.ref);
    const registryRoot = resolveRegistryRoot();
    const interactive = isInteractive(args.json);

    const canonicalUrl = process.env.AIACTIONS_CANONICAL_URL;
    const options: EnsureCachedActionOptions = canonicalUrl ? { canonicalUrl } : {};

    let spinner: ReturnType<typeof clack.spinner> | undefined;
    if (interactive) {
      spinner = clack.spinner();
      spinner.start(`fetching ${args.ref}`);
    }

    try {
      const result = await ensureCachedAction(
        { namespace: ref.namespace, name: ref.name, version: ref.version },
        registryRoot,
        process.cwd(),
        options,
      );
      spinner?.stop(result.fetched ? `installed ${args.ref}` : `already cached ${args.ref}`);

      if (args.json) {
        process.stdout.write(
          `${JSON.stringify({
            ref: args.ref,
            dir: result.dir,
            fetched: result.fetched,
            resolvedSha: result.resolvedSha,
          })}\n`,
        );
      } else if (!interactive) {
        process.stderr.write(
          `${result.fetched ? "✓ installed" : "✓ already cached"} ${args.ref}\n`,
        );
      }
    } catch (err) {
      spinner?.stop(`failed: ${args.ref}`, 1);
      throw new CliError(
        EXIT.RUNTIME,
        `install failed for ${args.ref}: ${(err as Error).message}`,
        err,
      );
    }
  },
});
