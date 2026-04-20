# TASK-SC-07-IPC-CANCEL: legacy unassigned note

| 項目       | 値                                   |
| ---------- | ------------------------------------ |
| タスクID   | TASK-SC-07-IPC-CANCEL                |
| ステータス | superseded                           |
| 置換先     | TASK-SW-CANCEL-001 / 002 / 003 / 004 |
| 更新日     | 2026-04-20                           |

## 状態

このメモは `useCancelGeneration.ts` が未実装だった時点の旧未タスク票であり、現在の current fact とは一致しない。IPC 送信自体は `TASK-SW-CANCEL-001`〜`004` の cancel chain で実装・検証済みのため、新規作業起票には使わない。

## 現在の扱い

- IPC 送信の未実装課題としては **closed / superseded**
- 残る follow-up は `TASK-SW-CANCEL-004-ipc-e2e-cancel-integration` に集約
