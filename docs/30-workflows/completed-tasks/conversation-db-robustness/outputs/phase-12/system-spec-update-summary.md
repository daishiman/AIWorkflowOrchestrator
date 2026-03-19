# System Spec Update Summary

- Task ID: TASK-FIX-CONVERSATION-DB-ROBUSTNESS-001
- Workflow: docs/30-workflows/completed-tasks/conversation-db-robustness/
- Phase: 12
- Updated on: 2026-03-19
- Status: completed

## 1. 実施概要

Conversation DB の堅牢化実装に合わせて、システム仕様書側の正本を実装実態へ同期した。
今回の同期対象は、永続化初期化、Main Process lifecycle、IPC 登録と graceful degradation、未タスク導線、再発防止知見である。

## 2. 実装と同期した主要仕様

| 観点             | 実装内容                                                                    | 反映先                                                           |
| ---------------- | --------------------------------------------------------------------------- | ---------------------------------------------------------------- |
| DB 初期化        | app.getPath("userData") 配下へ DB を配置し、module-level singleton で初期化 | aiworkflow-requirements/references/api-ipc-system-core.md ほか   |
| Lifecycle        | app.whenReady() で初期化、will-quit で close、activate で再利用             | aiworkflow-requirements/references/arch-ipc-persistence.md ほか  |
| IPC DI           | registerAllIpcHandlers(mainWindow, conversationDb) で注入                   | aiworkflow-requirements/references/arch-ipc-persistence.md       |
| Failure handling | DB 初期化失敗時でも fallback handler で DB_NOT_AVAILABLE を返却             | aiworkflow-requirements/references/security-electron-ipc-core.md |
| 継続改善         | ABI rebuild / schema versioning / legacy path migration を未タスク化        | task-workflow-backlog.md と docs/30-workflows/unassigned-task/   |

## 3. 今回の実装で苦戦した箇所

### 3.1 初期化成功と登録成功の混同

DB を開けたことと、IPC 全体が安全に登録できたことは同じではない。  
今回は conversation:search を含めた横断確認が必要であり、初期化成功だけを成功扱いしない運用知見を残した。

### 3.2 graceful degradation の責務境界

失敗時に握りつぶすのではなく、Renderer に診断可能な DB_NOT_AVAILABLE を返す必要があった。  
そのため、DB 実体の有無と handler registration の成否を分離して整理した。

### 3.3 旧パス資産との整合

従来の ~/.claude/conversations.db 前提から、Electron 標準の userData 配下へ寄せる際に、既存資産の扱いと移行責務が残課題として顕在化した。  
これを未タスクとして formalize し、今回タスクのスコープ外とした。

## 4. 更新した正本ドキュメント

- .claude/skills/aiworkflow-requirements/references/arch-ipc-persistence.md
- .claude/skills/aiworkflow-requirements/references/api-ipc-system-core.md
- .claude/skills/aiworkflow-requirements/references/security-electron-ipc-core.md
- .claude/skills/aiworkflow-requirements/references/architecture-overview-core.md
- .claude/skills/aiworkflow-requirements/references/task-workflow-backlog.md
- .claude/skills/aiworkflow-requirements/references/task-workflow-completed-ipc-graceful-degradation-lifecycle.md
- .claude/skills/aiworkflow-requirements/references/lessons-learned-current.md
- .claude/skills/aiworkflow-requirements/LOGS.md

## 5. 反映判断

| 項目                     | 判定 | 理由                                                         |
| ------------------------ | ---- | ------------------------------------------------------------ |
| 実装内容の記述           | 完了 | 初期化・Lifecycle・DI・fallback を仕様書へ反映済み           |
| 苦戦箇所の記述           | 完了 | lessons learned / completed workflow に整理                  |
| 追加インターフェース反映 | 完了 | registerAllIpcHandlers と conversation DB 初期化フローを同期 |
| 残課題の切り出し         | 完了 | 3件を未タスク化して unassigned-task/ へ配置                  |

## 6. 補足

互換性のため spec-update-summary.md は残すが、正本はこの system-spec-update-summary.md とする。
