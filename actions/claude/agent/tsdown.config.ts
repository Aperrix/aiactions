import { defineConfig } from "tsdown";

export default defineConfig({
  entry: { main: "src/main.ts" },
  format: "esm",
  outDir: "dist",
  outExtensions: () => ({ js: ".mjs" }),
  target: "node22",
  platform: "node",
  noExternal: [/.*/], // inline ALL deps (zod, @anthropic-ai/claude-agent-sdk)
  clean: true,
  dts: false, // dist is for runtime, not for downstream type imports
  shims: false,
});
