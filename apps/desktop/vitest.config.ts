import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import { resolve } from "path";
import { cpus } from "os";

// 並列化設定
// CI環境: GitHub Actionsランナー（2コア、8GB RAM）でのI/O待ち時間活用
// ローカル環境: CPUコア数に基づいて動的に設定
const CI_MAX_FORKS = 4;
// ローカルではCPUコア数の半分を使用（最低2、最大8）
// 環境変数 VITEST_MAX_FORKS で上書き可能
const cpuCount = cpus().length;
const LOCAL_MAX_FORKS = process.env.VITEST_MAX_FORKS
  ? parseInt(process.env.VITEST_MAX_FORKS, 10)
  : Math.max(2, Math.min(8, Math.floor(cpuCount / 2)));

// ローカルでも並列実行を有効化（メモリ16GB以上推奨）
// 環境変数 VITEST_FILE_PARALLELISM=false で無効化可能
const enableFileParallelism = process.env.VITEST_FILE_PARALLELISM !== "false";

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
        // CI環境では4並列、ローカルでは2並列
        maxForks: process.env.CI ? CI_MAX_FORKS : LOCAL_MAX_FORKS,
        isolate: true,
      },
    },
    testTimeout: 10000,
    teardownTimeout: 5000,
    // CI環境・ローカル環境ともにファイル間並列化を有効化
    // メモリ不足時は環境変数 VITEST_FILE_PARALLELISM=false で無効化可能
    fileParallelism: enableFileParallelism,
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
      "@repo/shared/constants": resolve(
        __dirname,
        "../../packages/shared/src/constants/index.ts",
      ),
      "@repo/shared/src/ipc/channels": resolve(
        __dirname,
        "../../packages/shared/src/ipc/channels.ts",
      ),
      "@anthropic-ai/claude-agent-sdk": resolve(
        __dirname,
        "src/test/__mocks__/@anthropic-ai/claude-agent-sdk.ts",
      ),
    },
  },
});
