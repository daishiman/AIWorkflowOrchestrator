# Archive / Current Split

## 配置方針

| 種別                      | パス                                                                                                         | 役割                                                    |
| ------------------------- | ------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------- |
| phase12-complete workflow | `docs/30-workflows/completed-tasks/step-02-par-task-02-chat-platform-unification-phase12-complete-20260312/` | 2026-03-12 current HEAD に対する Phase 12 完了 snapshot |
| prior attempt archive     | `docs/30-workflows/completed-tasks/step-02-par-task-02-chat-platform-unification/`                           | 2026-03-11 時点の prior attempt 比較資料                |
| downstream compare        | `docs/30-workflows/completed-tasks/step-02-par-task-03-skill-creator-execute-improve-integration/`           | Task03 の handoff 前提確認                              |

## split を維持する理由

1. current HEAD では general / workspace の transport が再び分離している。
2. archive には苦戦箇所と prior output が残っており、削除すると downstream 参照が切れる。
3. phase12-complete workflow 側で contract layer と証跡を作り直した事実を残す必要がある。

## このターンの判断

- archive は削除しない。
- phase12-complete workflow には Phase 1-12 の `outputs/` を固定する。
- system spec は「archive 比較資料」「phase12-complete 実装正本」「残課題 follow-up」を同時に記録する。
