# Phase 5 active set 証跡

## canonical から導出した集合

| 区分      | ID                                  |
| --------- | ----------------------------------- |
| active    | `002 / 004 / 005 / 006 / 007 / 009` |
| completed | `001 / 003 / 008`                   |

## 根拠

| 根拠               | 内容                                                               |
| ------------------ | ------------------------------------------------------------------ |
| task-workflow      | 001/003/008 は取り消し線付き completed 行                          |
| physical placement | completed 指示書は `completed-tasks/`、継続UTは `unassigned-task/` |
| derived ledger     | ui-ux と detection が同集合へ同期済み                              |

## anomaly

| 項目                            | 扱い                                                         |
| ------------------------------- | ------------------------------------------------------------ |
| physical-only duplicate-ID 候補 | current active set に採用せず、Phase 9/12 の risk として記録 |
