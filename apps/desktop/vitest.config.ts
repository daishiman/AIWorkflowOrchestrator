import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import { resolve } from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: "happy-dom",
    include: ["src/**/*.test.{ts,tsx}"],
    exclude: ["node_modules/", "out/", "dist/"],
    setupFiles: ["./src/test/setup.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      exclude: [
        "node_modules/",
        "out/",
        "dist/",
        "**/*.test.{ts,tsx}",
        "**/*.config.{ts,js}",
        "src/test/**",
      ],
    },
  },
  resolve: {
    alias: {
      "@": resolve(__dirname, "src"),
      "@renderer": resolve(__dirname, "src/renderer"),
      "@main": resolve(__dirname, "src/main"),
      "@repo/shared/schemas/auth": resolve(
        __dirname,
        "../../packages/shared/schemas/auth.ts",
      ),
      "@repo/shared/schemas": resolve(
        __dirname,
        "../../packages/shared/schemas/index.ts",
      ),
    },
  },
});
