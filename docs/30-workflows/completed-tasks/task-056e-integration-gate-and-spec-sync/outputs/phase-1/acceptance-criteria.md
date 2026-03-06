# Phase 1 受け入れ基準

## 受け入れ基準一覧

| AC    | 条件                                                                       | 判定 |
| ----- | -------------------------------------------------------------------------- | ---- |
| AC-01 | A/B/C/D の正本パスと優先順位が固定されている                               | PASS |
| AC-02 | 5軸の判定観点が要件として定義されている                                    | PASS |
| AC-03 | PASS / MINOR / MAJOR の境界条件が検証可能な文章で定義されている            | PASS |
| AC-04 | `常時更新 / 条件付き更新 / 更新不要` の3区分が定義されている               | PASS |
| AC-05 | `TASK-UI-02` / `TASK-UI-03` / `TASK-UI-04A` の引き渡し項目が列挙されている | PASS |
| AC-06 | Renderer / Preload / Main / IPC / Documentation の層別要件が整理されている | PASS |
| AC-07 | path 混在検出が回帰対象として要件化されている                              | PASS |
| AC-08 | `spec_created` と未タスク検出の責務が要件化されている                      | PASS |
| AC-09 | outputs 配下への成果物出力義務が要件化されている                           | PASS |
| AC-10 | PR 自動作成を行わない境界が明記されている                                  | PASS |

## 判定閾値

| 判定  | 条件                                                                            |
| ----- | ------------------------------------------------------------------------------- |
| PASS  | 5軸すべてに証跡ソースがあり、3区分の同期対象と下流3タスクの解放条件が揃っている |
| MINOR | 軽微な表記ゆれや参照追記漏れはあるが、5軸・3区分・下流3件の意味が欠落していない |
| MAJOR | 上流正本の欠落、5軸の欠落、同期区分の欠落、下流 handoff 欠落のいずれかがある    |

## 検証コマンド

```bash
test -f docs/30-workflows/completed-tasks/task-056a-a-store-slice-baseline/index.md
test -f docs/30-workflows/skill-import-agent-system/tasks/completed-task/task-056a-b-ipc-contract-security.md
test -f docs/30-workflows/completed-tasks/task-056c-notification-history-domain/index.md
test -f docs/30-workflows/completed-tasks/task-056d-viewtype-routing-nav/index.md
rg -n "TASK-UI-02|TASK-UI-03|TASK-UI-04A" docs/30-workflows/completed-tasks/task-056e-integration-gate-and-spec-sync/outputs/phase-1
```
