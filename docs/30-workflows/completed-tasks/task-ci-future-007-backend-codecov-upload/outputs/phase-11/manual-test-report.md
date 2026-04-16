# Phase 11 手動テストレポート

## メタ情報

| 項目       | 値                 |
| ---------- | ------------------ |
| Phase      | 11                 |
| タスクID   | TASK-CI-FUTURE-007 |
| タスク種別 | NON_VISUAL         |
| 作成日     | 2026-04-16         |

## 実行サマリー

| シナリオ              | コマンド                                                                                          | 結果                                   |
| --------------------- | ------------------------------------------------------------------------------------------------- | -------------------------------------- |
| shard 1/2 coverage    | `VITEST_SHARDED_COVERAGE=true pnpm --filter @repo/backend exec vitest run --shard=1/2 --coverage` | exit 0, tests 5 passed, duration 3.83s |
| shard 2/2 coverage    | `VITEST_SHARDED_COVERAGE=true pnpm --filter @repo/backend exec vitest run --shard=2/2 --coverage` | exit 0, no tests, duration 939ms       |
| shard 1/2 no coverage | `pnpm --filter @repo/backend exec vitest run --shard=1/2`                                         | exit 0, tests 5 passed, duration 4.31s |
| shard 2/2 no coverage | `pnpm --filter @repo/backend exec vitest run --shard=2/2`                                         | exit 0, no tests, duration 451ms       |

## 静的 workflow 確認

- `.github/workflows/ci.yml` で `github.event_name == 'push' && github.ref == 'refs/heads/main'` のときだけ backend coverage を収集することを確認した
- `actions/download-artifact` は `merge-multiple` を使わず、`coverage/backend` 配下で backend artifact を分離して保持することを確認した
- `codecov.yml` に `backend` flag を追加済みであることを確認した

## 生成物

- `apps/backend/coverage/coverage-final.json`
- `apps/backend/coverage/lcov.info`

## 判定

NON_VISUAL のためスクリーンショットは不要。
代替証跡として CLI 実行結果、coverage ファイル、workflow 条件の静的確認を残した。
