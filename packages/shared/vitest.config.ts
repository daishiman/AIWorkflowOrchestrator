import { defineConfig } from "vitest/config";
import { cpus } from "os";

// 並列化設定（desktop と同じパターン）
// CI環境: GitHub Actionsランナー（2コア、8GB RAM）でのI/O待ち時間活用
// ローカル環境: CPUコア数に基づいて動的に設定
const CI_MAX_FORKS = 4;
const cpuCount = cpus().length;
const LOCAL_MAX_FORKS = process.env.VITEST_MAX_FORKS
  ? parseInt(process.env.VITEST_MAX_FORKS, 10)
  : Math.max(2, Math.min(8, Math.floor(cpuCount / 2)));

const enableFileParallelism = process.env.VITEST_FILE_PARALLELISM !== "false";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    include: ["**/*.test.ts"],
    pool: "forks",
    poolOptions: {
      forks: {
        minForks: 1,
        maxForks: process.env.CI ? CI_MAX_FORKS : LOCAL_MAX_FORKS,
        isolate: true,
      },
    },
    fileParallelism: enableFileParallelism,
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html", "lcov"],
      thresholds: {
        lines: 65,
        functions: 80,
        branches: 60,
        statements: 65,
      },
      exclude: [
        "node_modules/",
        "dist/",
        "**/*.test.ts",
        "**/__tests__/**",
        "**/index.ts", // 全バレルエクスポートファイルを除外

        // 設定ファイル（実行時コードなし）
        "vitest.config.ts",
        "drizzle.config.ts",

        // 純粋な型定義ファイル（実行時コードなし）
        "**/interfaces.ts",
        "core/interfaces/**",
        "shared/types/**",
        "src/types/**/*.ts",
        "!src/types/rag/**", // RAG型の実装ファイルは含める

        // スキーマ定義（Drizzle ORM - 実行コードなし）
        "src/db/schema/**",
        "infrastructure/database/schema/**",

        // 未実装/外部依存ファイル
        "infrastructure/auth/supabase-client.ts",
        "infrastructure/database/client.ts",
        "infrastructure/database/repositories/**",
        "src/db/migrate.ts",
        "src/repositories/**",
        "src/features/chat-history/**",
        "!src/features/chat-history/infrastructure/persistence/*.ts", // Drizzle Repositoryを含める

        // ユーティリティ（未テスト）
        "utils/**",

        // UIトークン定義（定数のみ）
        "ui/tokens/colors.ts",
        "ui/tokens/spacing.ts",
        "ui/tokens/typography.ts",
        "ui/tokens/effects.ts",

        // マニュアルテストファイル・ディレクトリ
        "**/*manual-test.ts",
        "**/manual-test/**",
        "**/__manual-tests__/**",
        "**/*verification.ts",

        // テストフィクスチャ・テストスクリプト
        "**/fixtures/**",
        "src/services/rag/**/*.ts", // RAGサービス（外部依存）
        "**/factory/**", // ファクトリー（未テスト）
        "**/provider/**", // プロバイダー（外部依存）
        "**/embedding-service.ts", // 外部依存サービス
        "**/scripts/**", // スクリプトファイル

        // 型定義ファイル
        "**/types.ts",
        "**/embedding.types.ts",
      ],
    },
  },
});
