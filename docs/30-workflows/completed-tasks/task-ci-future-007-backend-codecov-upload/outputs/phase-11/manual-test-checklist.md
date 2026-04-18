# Phase 11 手動テストチェックリスト

## メタ情報

| 項目       | 値                 |
| ---------- | ------------------ |
| Phase      | 11                 |
| タスクID   | TASK-CI-FUTURE-007 |
| タスク種別 | NON_VISUAL         |
| 作成日     | 2026-04-16         |

## チェック項目

| ID     | 確認内容                                        | 証跡 / コマンド                                                                                     | 判定 |
| ------ | ----------------------------------------------- | --------------------------------------------------------------------------------------------------- | ---- |
| M-11-1 | shard 1/2 の coverage 実行が成功する            | `VITEST_SHARDED_COVERAGE=true pnpm --filter @repo/backend exec vitest run --shard=1/2 --coverage`   | PASS |
| M-11-2 | shard 2/2 の coverage 実行が成功する            | `VITEST_SHARDED_COVERAGE=true pnpm --filter @repo/backend exec vitest run --shard=2/2 --coverage`   | PASS |
| M-11-3 | main push 以外の実行で coverage が生成されない  | `pnpm --filter @repo/backend exec vitest run --shard=1/2`                                           | PASS |
| M-11-4 | `apps/backend/coverage/` に report が生成される | `find apps/backend/coverage -type f`                                                                | PASS |
| M-11-5 | CI main push で `backend` フラグが使われる      | `grep -n "github.event_name == 'push' && github.ref == 'refs/heads/main'" .github/workflows/ci.yml` | PASS |
| M-11-6 | CI main push 以外で coverage がスキップされる   | `grep -n "backend-coverage\|flags: backend\|directory: coverage/backend" .github/workflows/ci.yml`  | PASS |

## 判定基準

- すべてのチェック項目が PASS であれば Phase 11 完了
- ひとつでも FAIL があれば Phase 10 / 9 の内容を参照して再確認する
