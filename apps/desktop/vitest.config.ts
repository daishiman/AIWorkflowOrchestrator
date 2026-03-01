import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";
import { resolve } from "path";
import { cpus, totalmem } from "os";

// 並列化設定
// 2026-02: フルスイートで OOM / timeout が発生したため、既定値を安定寄りに調整。
// 必要な場合は環境変数で上書き可能。
const CI_MAX_FORKS = 2;
const cpuCount = cpus().length;
const totalMemoryGb = Math.floor(totalmem() / 1024 / 1024 / 1024);
const defaultLocalForksByMemory =
  totalMemoryGb >= 48 ? 4 : totalMemoryGb >= 24 ? 3 : 2;
const LOCAL_MAX_FORKS = process.env.VITEST_MAX_FORKS
  ? parseInt(process.env.VITEST_MAX_FORKS, 10)
  : Math.max(1, Math.min(defaultLocalForksByMemory, Math.floor(cpuCount / 2)));
const LOCAL_MAX_OLD_SPACE_SIZE_MB = process.env.VITEST_MAX_OLD_SPACE_SIZE
  ? parseInt(process.env.VITEST_MAX_OLD_SPACE_SIZE, 10)
  : 6144;

// 既定はファイル間並列を無効化して安定性を優先。
// 明示的に true を指定した場合のみ有効化。
const enableFileParallelism = process.env.VITEST_FILE_PARALLELISM === "true";

export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  test: {
    globals: true,
    environment: "happy-dom",
    include: ["src/**/*.test.{ts,tsx}", "scripts/**/*.test.{ts,tsx}"],
    exclude: ["node_modules/", "out/", "dist/"],
    setupFiles: ["./src/test/setup.ts"],
    pool: "forks",
    poolOptions: {
      forks: {
        // CI/ローカルともにメモリと安定性を優先した並列数
        minForks: 1,
        maxForks: process.env.CI ? CI_MAX_FORKS : LOCAL_MAX_FORKS,
        // ローカル実行時のみワーカーヒープ上限を拡張し、終盤のOOMを抑制
        execArgv: process.env.CI
          ? []
          : [`--max-old-space-size=${LOCAL_MAX_OLD_SPACE_SIZE_MB}`],
        isolate: true,
      },
    },
    // 低並列時の待ち時間増加を考慮し、デフォルトを緩和
    testTimeout: 30000,
    hookTimeout: 30000,
    teardownTimeout: 10000,
    // CI環境のみ: authCallbackServer等のHTTPサーバーテストがワーカー終了時に
    // クリーンアップ不備で "Worker exited unexpectedly" を発生させる既知問題の回避。
    // ローカル開発では false（デフォルト）のままテストコード内の未処理エラーを検出する。
    // 根本修正: authCallbackServer.test.ts の stop() 競合解消（後続タスク対応）
    dangerouslyIgnoreUnhandledErrors: process.env.CI === "true",
    // 既定は false（安定優先）。必要時のみ環境変数で true 化。
    fileParallelism: enableFileParallelism,
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
        "scripts/long-running-test.mjs",
        "scripts/notarize.mjs",
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
      "@anthropic-ai/claude-agent-sdk": resolve(
        __dirname,
        "src/test/__mocks__/@anthropic-ai/claude-agent-sdk.ts",
      ),
    },
  },
});
