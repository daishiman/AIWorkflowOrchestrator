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
        "**/index.ts", // バレルエクスポートファイルを除外
        // 純粋な型定義ファイル（実行時コードなし）
        "**/interfaces.ts",
      ],
    },
  },
});
