# Unassigned Task Detection

## Summary

当初は 3 件の follow-up を検出した。2026-03-27 の close-out 再同期で `TASK-SDK-04-U3` は完了移管済みとなり、open set は `TASK-SDK-04-U1` / `TASK-SDK-04-U2` の 2 件である。`UT-SC-02-006` の handoff visible 化は current code で概ね吸収済みであり、残差分は runtime semantics と plan binding に集約された。

## SF-03 4パターン確認

| パターン                              | 判定 | note                                                                                            |
| ------------------------------------- | ---- | ----------------------------------------------------------------------------------------------- |
| current gap が index / phase に未反映 | あり | user input transition semantics と Phase 11/12 evidence が stale                                |
| dependency boundary 漏れ              | あり | `plan_review` / `verification_review` 回答の phase 遷移責務が formalize 不足                    |
| system spec と task spec の齟齬       | あり | Step 2 を N/A としていたが、実際は shared / IPC / preload / renderer の current fact 更新が必要 |
| backlog item の再発                   | あり | `UT-SC-02-006` 吸収後も別原因の 3 gap が残った                                                  |

## Existing Backlog Mapping

| item             | status               | note                                                                 |
| ---------------- | -------------------- | -------------------------------------------------------------------- |
| `UT-SC-02-006`   | historically covered | `executePlan()` handoff visible 化として本 wave では主 gap ではない  |
| `TASK-SDK-04-U1` | open                 | user input 回答が phase 遷移へ反映されない                           |
| `TASK-SDK-04-U2` | open                 | `planId` と execute payload の canonical binding drift               |
| `TASK-SDK-04-U3` | completed 2026-03-27 | Phase 11/12/13 の evidence / path sync は current facts へ再同期済み |

## Ledger / Backlog Decision

| 対象                                                          | 判定 | 根拠                                                                    |
| ------------------------------------------------------------- | ---- | ----------------------------------------------------------------------- |
| `docs/30-workflows/unassigned-task/` 新規作成                 | 必要 | `TASK-SDK-04-U1` / `U2` を open follow-up として formalize した         |
| `docs/30-workflows/completed-tasks/unassigned-task/` への移管 | 実施 | `TASK-SDK-04-U3` は close-out evidence/path sync 完了として移管した     |
| `UT-SC-02-006` の再 formalize                                 | 不要 | 既存 handoff UI gap と今回の 3 件は責務が異なるため、再利用せず分離した |
| `task-workflow-backlog.md` 追記                               | 実施 | open follow-up 2 件を backlog 正本へ維持し、U3 は完了扱いへ更新した     |
| completed ledger 更新                                         | 実施 | current workflow は `spec_created` を維持しつつ、U3 完了記録を追加した  |

## New Unassigned Tasks

| task_id          | status | spec_path                                                                                                     | 要点                                                                |
| ---------------- | ------ | ------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------- |
| `TASK-SDK-04-U1` | open   | `docs/30-workflows/unassigned-task/task-imp-task-sdk-04-user-input-transition-semantics-001.md`               | `submitUserInput()` が回答を phase semantics へ反映する             |
| `TASK-SDK-04-U2` | open   | `docs/30-workflows/unassigned-task/task-imp-task-sdk-04-plan-execute-canonical-binding-001.md`                | plan review 後も canonical plan 内容だけで execute する             |
| `TASK-SDK-04-U3` | done   | `docs/30-workflows/completed-tasks/unassigned-task/task-imp-task-sdk-04-phase12-canonical-path-resync-001.md` | Phase 11/12/13 evidence と canonical path の stale facts を解消した |
