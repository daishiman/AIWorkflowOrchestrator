# P50 チェック結果

作成日: 2026-04-15
タスクID: TASK-CI-FUTURE-002

## 調査対象ファイルの現状

### `.github/workflows/ci.yml`

| 確認項目                          | 現状                              |
| --------------------------------- | --------------------------------- |
| `test-web` ジョブの有無           | **存在しない**                    |
| `test-desktop` ジョブのシャード数 | **17シャード** (`shard: [1..17]`) |
| `typecheck` 並列数                | 1                                 |
| `test-shared` 並列数              | 1                                 |
| `e2e-desktop` 並列数              | 1                                 |
| **並列数合計**                    | **20**（上限ちょうど）            |

### `apps/backend/vitest.config.ts`（仕様書では `apps/web/vitest.config.ts`）

| 確認項目           | 現状                                                                                |
| ------------------ | ----------------------------------------------------------------------------------- |
| ファイルの存在     | **存在する**                                                                        |
| シャード対応設定   | **設定不要**（Vitest の `--shard` オプションは外部から指定、config への変更は不要） |
| テスト対象パターン | `src/**/*.test.ts`, `src/**/*.test.tsx`                                             |
| テストファイル数   | **1ファイル**（`src/__tests__/health.test.ts`）                                     |

## 重要: パッケージ名の乖離

| 項目          | 仕様書の記述                | 実際のコード                    |
| ------------- | --------------------------- | ------------------------------- |
| ディレクトリ  | `apps/web/`                 | `apps/backend/`                 |
| パッケージ名  | `@repo/web`                 | `@repo/backend`                 |
| vitest設定    | `apps/web/vitest.config.ts` | `apps/backend/vitest.config.ts` |
| CI フィルター | `--filter @repo/web`        | `--filter @repo/backend`        |

## P50 チェック判定

- **test-web ジョブ**: CI に存在しない（matrix なし）→ **追加対象**
- **test-desktop**: 17 シャードで実行中 → **15 シャードに削減対象**
- **apps/backend/vitest.config.ts**: 修正不要（Vitest 標準の `--shard` 引数のみで対応可能）

## 結論

P50 チェック PASS。現状の CI 構成を正確に把握し、受入基準（AC-1〜AC-6）の前提条件を確認した。
