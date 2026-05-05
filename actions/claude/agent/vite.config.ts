import { defineConfig } from "vite-plus";

export default defineConfig({
  lint: {
    options: {
      typeAware: true,
      typeCheck: true,
    },
  },
  fmt: {},
  pack: {
    entry: { main: "src/main.ts" },
    format: "esm",
    outDir: "dist",
    outExtensions: () => ({ js: ".mjs" }),
    target: "node22",
    platform: "node",
    deps: { alwaysBundle: [/.*/] },
    clean: true,
    dts: false,
    shims: false,
  },
});
