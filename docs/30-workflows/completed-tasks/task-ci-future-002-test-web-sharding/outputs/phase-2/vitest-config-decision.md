# vitest.config.ts 修正要否判断結果

作成日: 2026-04-15
タスクID: TASK-CI-FUTURE-002

## 判断結果

**`apps/backend/vitest.config.ts` の修正は不要。**

## 根拠

| 観点                         | 判断                                                                                             |
| ---------------------------- | ------------------------------------------------------------------------------------------------ |
| Vitest の `--shard` サポート | Vitest は `--shard=N/M` オプションを標準でサポート。`vitest.config.ts` への設定追加は不要。      |
| 現在の設定                   | `src/**/*.test.ts`, `src/**/*.test.tsx` をテスト対象として正しく設定済み。                       |
| シャード動作の仕組み         | `--shard=1/2` を渡すと Vitest がテストファイルリストをハッシュ分割して実行。config 変更不要。    |
| `apps/desktop` の前例        | `apps/desktop/vitest.config.ts` も `--shard` 専用設定なし。CI コマンドに引数追加するだけで動作。 |

## 変更スコープの確定

| ファイル                           | 変更要否     | 変更内容                                         |
| ---------------------------------- | ------------ | ------------------------------------------------ |
| `.github/workflows/ci.yml`         | **変更必要** | test-web ジョブ追加、test-desktop シャード数削減 |
| `apps/backend/vitest.config.ts`    | **変更不要** | 現状のまま                                       |
| `apps/desktop/vitest.config.ts`    | **変更不要** | 現状のまま                                       |
| `packages/shared/vitest.config.ts` | **変更不要** | 影響なし                                         |

## AC-6 への影響

本判断により、AC-6「変更が CI 設定ファイルのみに限定される」が完全に充足される。
変更ファイルは `.github/workflows/ci.yml` のみとなる。
