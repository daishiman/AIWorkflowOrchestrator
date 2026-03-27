# Unassigned Task Detection

## Summary

新規未タスクを 3 件検出した。`UT-SC-02-006` の handoff visible 化は current code で概ね吸収済みだが、実装レビューで見つかった runtime semantics / plan binding / evidence drift は別タスクとして formalize する。

## SF-03 4パターン確認

| パターン                              | 判定 | note                                                                                            |
| ------------------------------------- | ---- | ----------------------------------------------------------------------------------------------- |
| current gap が index / phase に未反映 | あり | user input transition semantics と Phase 11/12 evidence が stale                                |
| dependency boundary 漏れ              | あり | `plan_review` / `verification_review` 回答の phase 遷移責務が formalize 不足                    |
| system spec と task spec の齟齬       | あり | Step 2 を N/A としていたが、実際は shared / IPC / preload / renderer の current fact 更新が必要 |
| backlog item の再発                   | あり | `UT-SC-02-006` 吸収後も別原因の 3 gap が残った                                                  |

## Existing Backlog Mapping

| item             | status               | note                                                                |
| ---------------- | -------------------- | ------------------------------------------------------------------- |
| `UT-SC-02-006`   | historically covered | `executePlan()` handoff visible 化として本 wave では主 gap ではない |
| `TASK-SDK-04-U1` | new                  | user input 回答が phase 遷移へ反映されない                          |
| `TASK-SDK-04-U2` | new                  | `planId` と execute payload の canonical binding drift              |
| `TASK-SDK-04-U3` | new                  | Phase 11/12/13 の evidence / path sync 不足                         |

## Ledger / Backlog Decision

| 対象                                          | 判定 | 根拠                                                                      |
| --------------------------------------------- | ---- | ------------------------------------------------------------------------- |
| `docs/30-workflows/unassigned-task/` 新規作成 | 必要 | `TASK-SDK-04-U1` / `U2` / `U3` を formalize した                          |
| `UT-SC-02-006` の再 formalize                 | 不要 | 既存 handoff UI gap と今回の 3 件は責務が異なるため、再利用せず分離した   |
| `task-workflow-backlog.md` 追記               | 必要 | Phase 12 review で検出した新規 3 件を backlog 正本へ追加する              |
| completed ledger 更新                         | 実施 | current workflow は `spec_created` を維持しつつ、follow-up 導線を補強した |

## New Unassigned Tasks

| task_id          | spec_path                                                                                       | 要点                                                              |
| ---------------- | ----------------------------------------------------------------------------------------------- | ----------------------------------------------------------------- |
| `TASK-SDK-04-U1` | `docs/30-workflows/unassigned-task/task-imp-task-sdk-04-user-input-transition-semantics-001.md` | `submitUserInput()` が回答を phase semantics へ反映する           |
| `TASK-SDK-04-U2` | `docs/30-workflows/unassigned-task/task-imp-task-sdk-04-plan-execute-canonical-binding-001.md`  | plan review 後も canonical plan 内容だけで execute する           |
| `TASK-SDK-04-U3` | `docs/30-workflows/unassigned-task/task-imp-task-sdk-04-phase12-canonical-path-resync-001.md`   | Phase 11/12/13 evidence と canonical path を current facts へ戻す |
