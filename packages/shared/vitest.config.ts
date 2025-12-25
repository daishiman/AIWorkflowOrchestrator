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
        "**/index.ts", // バレルエクスポートファイルを除外

        // 設定ファイル（実行時コードなし）
        "vitest.config.ts",
        "drizzle.config.ts",

        // 純粋な型定義ファイル（実行時コードなし）
        "**/interfaces.ts",
        "shared/types/**", // 型定義のみ
        "src/types/**/*.ts", // RAG型定義は実装済み
        "!src/types/rag/**", // RAG型は含める
        "core/interfaces/**", // インターフェース定義

        // スキーマ定義（Drizzle ORM - 実行コードなし）
        "src/db/schema/**",

        // IPC定義（定数定義のみ）
        "src/ipc/channels.ts",

        // 未実装/外部依存ファイル
        "infrastructure/auth/supabase-client.ts",
        "infrastructure/database/client.ts",
        "src/db/migrate.ts",

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
