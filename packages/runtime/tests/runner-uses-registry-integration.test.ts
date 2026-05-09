/**
 * End-to-end test: a workflow using a registry ref triggers a fetch
 * from a local bare repo and the action runs successfully.
 */

import { mkdir, mkdtemp, readFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { workflowSchema } from "@aiactions/schema";
import { describe, expect, test } from "vite-plus/test";

import { runWorkflow } from "../src/run-workflow.ts";

import { makeBareRepoWithAction } from "./fixtures/registry/make-bare-repo.ts";

const POSIX = process.platform !== "win32";
const parseWorkflow = (input: unknown) => workflowSchema.parse(input);

describe.skipIf(!POSIX)("runWorkflow — registry fetch end-to-end", () => {
  test("registry ref triggers fetch + caches + runs", async () => {
    const work = await mkdtemp(join(tmpdir(), "aiactions-int-"));
    const cwd = join(work, "project");
    await mkdir(cwd, { recursive: true });
    const registryRoot = join(work, "registry");

    const bareRepo = await makeBareRepoWithAction({
      cwd: work,
      namespace: "octocat",
      name: "echo",
      tag: "octocat/echo@v1.0.0",
      manifest:
        "schemaVersion: 1\nname: echo\ndescription: echo a value\ninputs:\n  message:\n    description: text to echo\noutputs:\n  echoed:\n    description: the same text\nruns:\n  using: node\n  main: ./index.mjs\n",
      sources: {
        "index.mjs":
          "export async function run(ctx) {\n  ctx.emitOutput('echoed', ctx.inputs.message ?? '');\n}\n",
      },
    });

    const workflow = parseWorkflow({
      name: "registry-int",
      jobs: {
        one: {
          steps: [
            {
              id: "echoer",
              uses: "octocat/echo@1.0.0",
              with: { message: "hello" },
            },
            {
              run: 'echo "received=${{ steps.echoer.outputs.echoed }}"',
            },
          ],
        },
      },
    });

    const result = await runWorkflow(workflow, {
      cwd,
      registryRoot,
      registryFetch: { canonicalUrl: `file://${bareRepo}`, tmpRoot: join(work, "tmp") },
    });

    expect(result.status).toBe("succeeded");
    expect(result.jobs.one?.steps[1]?.stdout).toContain("received=hello");

    const lock = await readFile(join(cwd, ".aiactions", "lock.json"), "utf8");
    expect(lock).toContain('"octocat/echo@1.0.0"');
  });

  test("default registryRoot is ~/.aiactions/actions (HOME override)", async () => {
    const work = await mkdtemp(join(tmpdir(), "aiactions-int-default-"));
    const fakeHome = join(work, "home");
    await mkdir(fakeHome, { recursive: true });
    const cwd = join(work, "project");
    await mkdir(cwd, { recursive: true });

    const bareRepo = await makeBareRepoWithAction({
      cwd: work,
      namespace: "octocat",
      name: "noop",
      tag: "octocat/noop@v1.0.0",
      manifest:
        "schemaVersion: 1\nname: noop\ndescription: x\nruns:\n  using: node\n  main: ./index.mjs\n",
      sources: { "index.mjs": "export async function run() {}\n" },
    });

    const previousHome = process.env.HOME;
    process.env.HOME = fakeHome;
    try {
      const workflow = parseWorkflow({
        name: "default-registry",
        jobs: {
          one: {
            steps: [
              {
                uses: "octocat/noop@1.0.0",
              },
            ],
          },
        },
      });

      const result = await runWorkflow(workflow, {
        cwd,
        registryFetch: { canonicalUrl: `file://${bareRepo}`, tmpRoot: join(work, "tmp") },
      });

      expect(result.status).toBe("succeeded");
      const cachedManifest = await readFile(
        join(fakeHome, ".aiactions", "actions", "octocat", "noop", "1.0.0", "aiaction.yaml"),
        "utf8",
      );
      expect(cachedManifest).toContain("name: noop");
    } finally {
      if (previousHome === undefined) delete process.env.HOME;
      else process.env.HOME = previousHome;
    }
  });
});
