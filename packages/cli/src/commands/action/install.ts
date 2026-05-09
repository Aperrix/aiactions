import { captureActionInstalled, resolveRegistryRoot } from "@aiactions/paths";
import { ensureCachedAction, type EnsureCachedActionOptions } from "@aiactions/registry";
import * as clack from "@clack/prompts";
import { defineCommand } from "citty";

import packageJson from "../../../package.json" with { type: "json" };
import { CliError, NotFoundError, UsageError } from "../../lib/errors.ts";
import { EXIT } from "../../lib/exit-codes.ts";
import { isInteractive } from "../../lib/output.ts";
import { parseRegistryRef } from "../../lib/parse-registry-ref.ts";
import { parseShortRef } from "../../lib/parse-short-ref.ts";
import {
  fetchRegistry,
  groupByCoord,
  resolveLatest,
  resolveRegistryUrl,
} from "../../lib/registry.ts";

interface InstallOpts {
  readonly registryRoot: string;
  readonly canonicalUrl: string | undefined;
  readonly interactive: boolean;
  readonly json: boolean;
}

async function installRef(
  refLabel: string,
  ref: { namespace: string; name: string; version: string },
  opts: InstallOpts,
): Promise<void> {
  const ensureOpts: EnsureCachedActionOptions = opts.canonicalUrl
    ? { canonicalUrl: opts.canonicalUrl }
    : {};

  let spinner: ReturnType<typeof clack.spinner> | undefined;
  if (opts.interactive) {
    spinner = clack.spinner();
    spinner.start(`fetching ${refLabel}`);
  }

  try {
    const result = await ensureCachedAction(ref, opts.registryRoot, process.cwd(), ensureOpts);
    spinner?.stop(result.fetched ? `installed ${refLabel}` : `already cached ${refLabel}`);

    captureActionInstalled({
      namespace: ref.namespace,
      name: ref.name,
      version: ref.version,
      ...(result.resolvedVersion !== ref.version
        ? { resolvedVersion: result.resolvedVersion }
        : {}),
      source: opts.canonicalUrl !== undefined ? "custom" : "canonical",
      aiactionsVersion: packageJson.version,
    });

    if (opts.json) {
      process.stdout.write(
        `${JSON.stringify({
          ref: refLabel,
          dir: result.dir,
          fetched: result.fetched,
          resolvedVersion: result.resolvedVersion,
          resolvedSha: result.resolvedSha,
        })}\n`,
      );
    } else if (!opts.interactive) {
      const tail =
        result.resolvedVersion !== ref.version ? ` (resolved as ${result.resolvedVersion})` : "";
      process.stderr.write(
        `${result.fetched ? "✓ installed" : "✓ already cached"} ${refLabel}${tail}\n`,
      );
    }
  } catch (err) {
    spinner?.stop(`failed: ${refLabel}`, 1);
    throw new CliError(
      EXIT.RUNTIME,
      `install failed for ${refLabel}: ${(err as Error).message}`,
      err,
    );
  }
}

export const installCommand = defineCommand({
  meta: {
    name: "install",
    description: "Install one or more actions from the registry into the local cache",
  },
  args: {
    ref: {
      type: "positional",
      description: "Registry coordinate '<ns>/<name>' or '<ns>/<name>@<ver>' (omit for picker)",
      required: false,
    },
    json: {
      type: "boolean",
      description: "Emit machine-readable JSON instead of human output",
      default: false,
    },
  },
  async run({ args }) {
    const registryRoot = resolveRegistryRoot();
    const interactive = isInteractive(args.json);
    const canonicalUrl = process.env.AIACTIONS_CANONICAL_URL;
    const baseOpts: InstallOpts = { registryRoot, canonicalUrl, interactive, json: args.json };

    // Flow A — explicit '<ns>/<name>@<ver>'
    if (args.ref && args.ref.includes("@")) {
      const ref = parseRegistryRef(args.ref);
      await installRef(
        args.ref,
        { namespace: ref.namespace, name: ref.name, version: ref.version },
        baseOpts,
      );
      return;
    }

    // Flow B — short '<ns>/<name>'
    if (args.ref) {
      const short = parseShortRef(args.ref);
      const reg = await fetchRegistry(resolveRegistryUrl(process.env));
      const entry = resolveLatest(reg, short.ns, short.name);
      if (!entry) {
        throw new NotFoundError(
          `no action '${short.ns}/${short.name}' in registry. Run 'aia action list' to see available actions.`,
        );
      }
      const full = parseRegistryRef(entry.ref);
      await installRef(
        entry.ref,
        { namespace: full.namespace, name: full.name, version: full.version },
        baseOpts,
      );
      return;
    }

    // Flow C — no arg → picker
    if (!interactive) {
      throw new UsageError("interactive picker requires a TTY. Pass an explicit ref.");
    }
    const reg = await fetchRegistry(resolveRegistryUrl(process.env));
    const grouped = groupByCoord(reg);
    if (grouped.size === 0) {
      process.stderr.write("registry is empty\n");
      return;
    }
    const options = Array.from(grouped.entries()).map(([_coord, entries]) => ({
      value: entries[0]!.ref,
      label: `${entries[0]!.ref}  — ${entries[0]!.description}`,
    }));
    const picked = await clack.multiselect({
      message: "select actions to install (latest version)",
      options,
      required: false,
    });
    if (clack.isCancel(picked) || !Array.isArray(picked) || picked.length === 0) {
      return;
    }
    for (const refLabel of picked as string[]) {
      const ref = parseRegistryRef(refLabel);
      await installRef(
        refLabel,
        { namespace: ref.namespace, name: ref.name, version: ref.version },
        baseOpts,
      );
    }
  },
});
