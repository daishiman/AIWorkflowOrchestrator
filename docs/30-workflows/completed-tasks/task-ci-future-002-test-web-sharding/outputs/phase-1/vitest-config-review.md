# vitest.config.ts 確認結果

作成日: 2026-04-15
タスクID: TASK-CI-FUTURE-002

## 確認対象

- ファイルパス: `apps/backend/vitest.config.ts`
- パッケージ: `@repo/backend`

## 設定内容

```typescript
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import { resolve } from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "node",
    include: ["src/**/*.test.ts", "src/**/*.test.tsx"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      exclude: ["node_modules/", ".next/", "**/*.config.*"],
    },
  },
  resolve: {
    alias: {
      "@": resolve(__dirname, "./src"),
    },
  },
});
```

## シャード化への影響評価

| 項目                           | 評価                                                     |
| ------------------------------ | -------------------------------------------------------- |
| `--shard` オプションのサポート | **対応済み**（Vitest は標準で `--shard=N/M` をサポート） |
| シャード専用の設定追加要否     | **不要**（`vitest.config.ts` への変更は不要）            |
| `pool` 設定                    | 未設定（デフォルト: Vitest が自動選択）                  |
| `fileParallelism` 設定         | 未設定（デフォルト値を使用）                             |
| カバレッジの閾値設定           | 未設定（デフォルト: 閾値なし）                           |

## 結論

`apps/backend/vitest.config.ts` は**修正不要**。

Vitest の `--shard=N/M` オプションは設定ファイルへの追加なしにコマンドライン引数のみで動作する。
CI の vitest 実行コマンドに `--shard=${{ matrix.shard }}/2` を追加するだけで対応可能。

## apps/desktop との比較

| 項目         | apps/desktop/vitest.config.ts | apps/backend/vitest.config.ts |
| ------------ | ----------------------------- | ----------------------------- |
| pool         | forks（明示）                 | 未設定（デフォルト）          |
| maxForks     | CI: 3、ローカル: 動的         | 未設定                        |
| シャード対応 | `--shard` コマンド引数で対応  | `--shard` コマンド引数で対応  |
| 修正要否     | 不要                          | **不要**                      |
