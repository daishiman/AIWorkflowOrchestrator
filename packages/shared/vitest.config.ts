import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    include: ["**/*.test.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
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

        // IPC定義（定数定義のみ）
        "src/ipc/channels.ts",

        // 未実装/外部依存ファイル
        "infrastructure/auth/supabase-client.ts",
        "infrastructure/database/client.ts",
        "infrastructure/database/repositories/**",
        "src/db/migrate.ts",
        "src/repositories/**",
        "src/features/chat-history/**",

        // ユーティリティ（未テスト）
        "utils/**",

        // UIトークン定義（定数のみ）
        "ui/tokens/colors.ts",
        "ui/tokens/spacing.ts",
        "ui/tokens/typography.ts",
        "ui/tokens/effects.ts",

        // マニュアルテストファイル
        "**/*manual-test.ts",
        "**/*verification.ts",
      ],
    },
  },
});
