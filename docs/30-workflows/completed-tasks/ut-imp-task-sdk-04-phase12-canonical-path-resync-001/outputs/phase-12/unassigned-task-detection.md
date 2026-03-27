# Unassigned Task Detection

## Summary

新規未タスクは追加しない。current facts として扱うのは `UT-SC-02-006` 吸収済み、`TASK-SDK-04-U1` / `TASK-SDK-04-U2` open、`TASK-SDK-04-U3` 相当 remediation の完了移管である。

## Current Mapping

| item             | status               | note                                                                        |
| ---------------- | -------------------- | --------------------------------------------------------------------------- |
| `UT-SC-02-006`   | absorbed             | handoff visible 化として current code wave に入っている                     |
| `TASK-SDK-04-U1` | open follow-up       | user input transition semantics を扱う                                      |
| `TASK-SDK-04-U2` | open follow-up       | plan and execute canonical binding を扱う                                   |
| `TASK-SDK-04-U3` | completed 2026-03-27 | Phase 12/13 evidence と canonical path resync は completed-tasks へ移管済み |

## Decision

| decision            | result              | note                                                                        |
| ------------------- | ------------------- | --------------------------------------------------------------------------- |
| new unassigned task | none                | open gap は `TASK-SDK-04-U1` / `TASK-SDK-04-U2` で説明できる                |
| duplicate follow-up | blocked             | `TASK-SDK-04-U3` と同じ責務の task は増やさず、完了移管済み task を参照する |
| completed judgement | keep `spec_created` | close-out current fact を戻す remediation だから                            |
