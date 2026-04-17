# Phase 11 CI 実行時間計測

## メタ情報

| 項目       | 値                 |
| ---------- | ------------------ |
| Phase      | 11                 |
| タスクID   | TASK-CI-FUTURE-007 |
| タスク種別 | NON_VISUAL         |
| 作成日     | 2026-04-16         |

## 計測結果

| 項目                  | コマンド                                                                                          | 測定値 | 備考           |
| --------------------- | ------------------------------------------------------------------------------------------------- | ------ | -------------- |
| shard 1/2 coverage    | `VITEST_SHARDED_COVERAGE=true pnpm --filter @repo/backend exec vitest run --shard=1/2 --coverage` | 3.83s  | tests 5 passed |
| shard 2/2 coverage    | `VITEST_SHARDED_COVERAGE=true pnpm --filter @repo/backend exec vitest run --shard=2/2 --coverage` | 939ms  | no tests       |
| shard 1/2 no coverage | `pnpm --filter @repo/backend exec vitest run --shard=1/2`                                         | 4.31s  | tests 5 passed |
| shard 2/2 no coverage | `pnpm --filter @repo/backend exec vitest run --shard=2/2`                                         | 451ms  | no tests       |

## 補足

- `coverage` あり実行では `coverage-final.json` と `lcov.info` を生成済み
- `coverage` なし実行では coverage ディレクトリは生成されない
