# Phase 12 成果物: 未タスク検出レポート

## Summary

新規未タスクは 0 件。`node scripts/verify-ipc-4layer.cjs` が示す 20 件の残件は、いずれも既存の completed / follow-up task family に既に formalize されているか、既存仕様で current facts として追跡されている。

## 検出結果

| cluster                       | channels                                                                                                                                                                                                                                                                 | current status | existing formalization path                                                                                                                                                                                                         | decision         |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------- |
| Chat export / file I/O        | `chat:exportSession`, `fs:writeFile`, `fs:readFile`                                                                                                                                                                                                                      | code drift     | `docs/30-workflows/completed-tasks/chat-history-persistence/` / `docs/30-workflows/completed-tasks/task-3-1-c-permission-request/`                                                                                                  | 新規未タスクなし |
| Skill Creator session runtime | `skill-creator:start-session`, `skill-creator:question-received`, `skill-creator:answer`, `skill-creator:session-complete`, `skill-creator:session-error`, `skill-creator:external-api-config-required`, `skill-creator:api-configured`, `skill-creator:api-test-result` | code drift     | `docs/30-workflows/completed-tasks/step-01-seq-task-01-sdk-session-bridge/` / `docs/30-workflows/completed-tasks/TASK-P0-06-conversational-interview-ui/` / `docs/30-workflows/unassigned-task/TASK-RT-04-api-key-management-ui.md` | 新規未タスクなし |
| Auth OAuth                    | `auth:start-oauth-flow`, `auth:test-callback`                                                                                                                                                                                                                            | code drift     | `docs/30-workflows/completed-tasks/auth-callback-urlscheme/` / `docs/30-workflows/completed-tasks/user-auth/ipc-design.md`                                                                                                          | 新規未タスクなし |
| Settings                      | `settings:get`, `settings:update`                                                                                                                                                                                                                                        | code drift     | `docs/30-workflows/completed-tasks/user-auth/ipc-design.md` / `docs/30-workflows/completed-tasks/TASK-8C-A/`                                                                                                                        | 新規未タスクなし |
| Agent dashboard               | `agent:get-skills`, `agent:get-skill-detail`, `agent:execute`, `agent:permission-respond`                                                                                                                                                                                | code drift     | `docs/30-workflows/completed-tasks/agent-dashboard-foundation/` / `docs/30-workflows/completed-tasks/task-agent-03-skill-management-backend.md` / `docs/30-workflows/completed-tasks/TASK-3-1-D-permission-dialog-ui/`              | 新規未タスクなし |

## Why no new unassigned task was created

1. いずれの missing channel も、既存の task family で仕様化済みである。
2. 今回の phase 12 は docs-only close-out であり、既存 task family への参照整理が主目的である。
3. 新規 task spec を起こすよりも、既存仕様との対応関係を current fact として残す方が重複が少ない。

## formalize path

- 既存 task family に紐づくため、新規 `docs/30-workflows/unassigned-task/` 指示書は作成しない。
- 将来、別の code drift が追加で見つかった場合は `docs/30-workflows/unassigned-task/` を canonical path として使う。
- 必要時のみ `task-workflow` 系の台帳へ登録する。

## current fact note

- `verify-ipc-4layer` の残件は docs 上では既存 family に紐づくが、実コードでは未解消のまま残っている
- そのため、今回の phase 12 では「新規未タスク 0 件」とし、実装 follow-up は既存 family で追跡する
