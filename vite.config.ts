import { defineConfig } from "vite-plus";

export default defineConfig({
  fmt: { ignorePatterns: ["**/dist/**"] },
  lint: { ignorePatterns: ["**/dist/**"], options: { typeAware: true, typeCheck: true } },
  run: {
    cache: true,
  },
});
