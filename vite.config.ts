import { defineConfig } from "vite-plus";

export default defineConfig({
  fmt: { ignorePatterns: ["**/dist/**", "**/tests/fixtures/manifests/**"] },
  lint: { ignorePatterns: ["**/dist/**"], options: { typeAware: true, typeCheck: true } },
  run: {
    cache: true,
  },
});
