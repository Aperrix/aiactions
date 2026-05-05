import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

export interface TempHome {
  readonly home: string;
  readonly registryRoot: string;
  cleanup(): Promise<void>;
}

/**
 * Create a tmpdir, return it as `home`, plus the conventional
 * `<home>/.aiactions/actions` derivative for direct fs writes.
 * Caller is responsible for invoking `cleanup()` (e.g. in `afterEach`).
 */
export async function makeTempHome(): Promise<TempHome> {
  const home = await mkdtemp(join(tmpdir(), "aia-cli-"));
  return {
    home,
    registryRoot: join(home, ".aiactions", "actions"),
    cleanup: () => rm(home, { recursive: true, force: true }),
  };
}
