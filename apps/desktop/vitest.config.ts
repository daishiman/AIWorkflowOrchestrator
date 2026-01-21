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
    pool: "forks",
    poolOptions: {
      forks: {
        maxForks: 2,
        isolate: true,
      },
    },
    testTimeout: 10000,
    teardownTimeout: 5000,
    fileParallelism: false,
    dangerouslyIgnoreUnhandledErrors: true,
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html", "lcov"],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 60,
        statements: 80,
      },
      exclude: [
        "node_modules/",
        "out/",
        "dist/",
        "**/*.test.{ts,tsx}",
        "**/*.config.{ts,js}",
        "**/*.spec.{ts,tsx}",
        "src/test/**",
        "e2e/**",
        "scripts/**",
        "src/main/index.ts",
        "src/main/updater.ts",
        "src/preload/index.ts",
        "src/preload/types.ts",
        "src/preload/types.d.ts",
        "src/renderer/main.tsx",
        "src/renderer/App.tsx",
        "src/main/ipc/__mocks__/**",
        "src/main/services/watcher/**",
        "**/index.ts", // エクスポート用ファイル
        "**/types.ts", // 型定義ファイル
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
      // Agent SDK integration - resolve to source files instead of dist
      "@repo/shared/agent": resolve(
        __dirname,
        "../../packages/shared/src/agent/index.ts",
      ),
      "@anthropic-ai/claude-agent-sdk": resolve(
        __dirname,
        "src/test/__mocks__/@anthropic-ai/claude-agent-sdk.ts",
      ),
    },
  },
});
