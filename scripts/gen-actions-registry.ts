/**
 * Walks `actions/<ns>/<name>/`, reads each action's `package.json` for
 * the public ref + description, validates `aiaction.yaml` against the
 * shared manifest schema, and emits a sorted JSON registry.
 *
 * Pure function `emitRegistry()` is what the unit tests target; the
 * `import.meta.main` block is the CLI entry that writes the file.
 */

import { readdir, readFile, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";

import { actionManifestSchema } from "@aiactions/workflows";
import { parse as parseYaml } from "yaml";

export interface RegistryEntry {
  readonly ref: string;
  readonly description: string;
}

export interface Registry {
  readonly actions: RegistryEntry[];
}

interface PackageJson {
  readonly name: string;
  readonly version: string;
  readonly description?: string;
}

export async function emitRegistry(actionsDir: string): Promise<Registry> {
  const entries: RegistryEntry[] = [];

  let namespaces: { name: string; isDirectory(): boolean }[];
  try {
    namespaces = await readdir(actionsDir, { withFileTypes: true });
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === "ENOENT") return { actions: [] };
    throw err;
  }

  for (const ns of namespaces) {
    if (!ns.isDirectory()) continue;
    const names = await readdir(join(actionsDir, ns.name), { withFileTypes: true });
    for (const name of names) {
      if (!name.isDirectory()) continue;
      const dir = join(actionsDir, ns.name, name.name);

      const pkgRaw = await readFile(join(dir, "package.json"), "utf8");
      const pkg = JSON.parse(pkgRaw) as PackageJson;

      const yamlRaw = await readFile(join(dir, "aiaction.yaml"), "utf8");
      actionManifestSchema.parse(parseYaml(yamlRaw));

      const expectedName = `@${ns.name}/${name.name}`;
      if (pkg.name !== expectedName) {
        throw new Error(`${dir}/package.json name '${pkg.name}' must equal '${expectedName}'`);
      }
      if (!pkg.description) {
        throw new Error(`${dir}/package.json must have a description`);
      }

      entries.push({
        ref: `${ns.name}/${name.name}@${pkg.version}`,
        description: pkg.description,
      });
    }
  }

  entries.sort((a, b) => a.ref.localeCompare(b.ref));
  return { actions: entries };
}

const ROOT = resolve(import.meta.dirname, "..");
const ACTIONS_DIR = resolve(ROOT, "actions");

if (import.meta.main) {
  const registry = await emitRegistry(ACTIONS_DIR);
  const out = `${JSON.stringify(registry, null, 2)}\n`;
  await writeFile(join(ACTIONS_DIR, "registry.json"), out);
  console.log(`wrote ${join(ACTIONS_DIR, "registry.json")} (${registry.actions.length} actions)`);
}
