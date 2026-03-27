# Phase 2 Shared Contract Sync Plan

## 判定結果

| レイヤ                | 判定   | 根拠                                                                                  |
| --------------------- | ------ | ------------------------------------------------------------------------------------- |
| `packages/shared`     | no-op  | Agent / Skill の public response 型は既存 shared transport で維持できた               |
| preload               | no-op  | channel 名・API 名・payload shape に差分がない                                        |
| public IPC doc        | no-op  | external contract より main process 内部 DI / consumer 変更が主だった                 |
| runtime workflow docs | update | implementation close-out と backlog/completed ledger を current fact に戻す必要がある |

## no-op の具体根拠

- `registerAgentExecutionHandlers()` と `registerSkillHandlers()` のシグネチャ変更は main process 内の登録点に閉じている。
- renderer が受け取る handoff / error / execution response の shape は既存 shared type を継続利用した。
- `RuntimePolicyResolver` 自体は main process service であり、preload export の新規追加対象ではない。

## sync 対象

1. `workflow-ai-runtime-execution-responsibility-realignment.md`
2. `task-workflow-backlog.md`
3. `task-workflow-completed.md`
4. mirror `.agents/...` の同名ファイル

## carry-over

- `AI_CHECK_CONNECTION` cleanup の着手時に `api-ipc-system-core.md` / preload docs を再判定する。
- deprecated `RuntimeResolver` 削除時に slide / chat-edit lane の shared narrative を再判定する。
