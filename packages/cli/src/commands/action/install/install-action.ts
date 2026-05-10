import { captureActionInstalled, resolveRegistryRoot } from "@aiactions/paths";
import {
  type EnsureCachedActionOptions,
  ensureCachedAction,
  fetchRegistry,
  groupByCoord,
  resolveLatest,
  resolveRegistryUrl,
} from "@aiactions/registry";
import * as clack from "@clack/prompts";

import packageJson from "../../../../package.json" with { type: "json" };
import { CliError, NotFoundError, UsageError } from "../../../_shared/cli-error.ts";
import { EXIT } from "../../../_shared/exit-codes.ts";
import { isInteractive } from "../../../_shared/output.ts";
import { parseRegistryRef } from "../../../_shared/parse-registry-ref.ts";
import { parseShortRef } from "./parse-short-ref.ts";

export interface InstallActionArgs {
  readonly ref: string | undefined;
  readonly json: boolean;
}

export interface InstallReceiptEntry {
  readonly ref: string;
  readonly dir: string;
  readonly fetched: boolean;
  readonly resolvedVersion: string;
  readonly resolvedSha: string | null;
}

export interface InstallActionResult {
  readonly entries: InstallReceiptEntry[];
}

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
): Promise<InstallReceiptEntry> {
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

    return {
      ref: refLabel,
      dir: result.dir,
      fetched: result.fetched,
      resolvedVersion: result.resolvedVersion,
      resolvedSha: result.resolvedSha,
    };
  } catch (err) {
    spinner?.stop(`failed: ${refLabel}`, 1);
    throw new CliError(
      EXIT.RUNTIME,
      `install failed for ${refLabel}: ${(err as Error).message}`,
      err,
    );
  }
}

export async function runInstallAction(args: InstallActionArgs): Promise<InstallActionResult> {
  const registryRoot = resolveRegistryRoot();
  const interactive = isInteractive(args.json);
  const canonicalUrl = process.env.AIACTIONS_CANONICAL_URL;
  const baseOpts: InstallOpts = { registryRoot, canonicalUrl, interactive, json: args.json };
  const entries: InstallReceiptEntry[] = [];

  if (args.ref && args.ref.includes("@")) {
    const ref = parseRegistryRef(args.ref);
    entries.push(
      await installRef(
        args.ref,
        { namespace: ref.namespace, name: ref.name, version: ref.version },
        baseOpts,
      ),
    );
    return { entries };
  }

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
    entries.push(
      await installRef(
        entry.ref,
        { namespace: full.namespace, name: full.name, version: full.version },
        baseOpts,
      ),
    );
    return { entries };
  }

  if (!interactive) {
    throw new UsageError("interactive picker requires a TTY. Pass an explicit ref.");
  }
  const reg = await fetchRegistry(resolveRegistryUrl(process.env));
  const grouped = groupByCoord(reg);
  if (grouped.size === 0) {
    process.stderr.write("registry is empty\n");
    return { entries };
  }
  const options = Array.from(grouped.entries()).map(([_coord, refs]) => ({
    value: refs[0]!.ref,
    label: `${refs[0]!.ref}  — ${refs[0]!.description}`,
  }));
  const picked = await clack.multiselect({
    message: "select actions to install (latest version)",
    options,
    required: false,
  });
  if (clack.isCancel(picked) || !Array.isArray(picked) || picked.length === 0) {
    return { entries };
  }
  for (const refLabel of picked as string[]) {
    const ref = parseRegistryRef(refLabel);
    entries.push(
      await installRef(
        refLabel,
        { namespace: ref.namespace, name: ref.name, version: ref.version },
        baseOpts,
      ),
    );
  }
  return { entries };
}
