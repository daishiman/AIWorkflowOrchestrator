# Phase 12 未タスク検出レポート - Chat Edit AI Runtime 有効化

## メタ情報

| 項目     | 内容                                                       |
| -------- | ---------------------------------------------------------- |
| タスクID | TASK-IMP-WORKSPACE-CHAT-EDIT-AI-RUNTIME-001                |
| Phase    | 12                                                         |
| 作成日   | 2026-03-14                                                 |
| 判定対象 | Phase 3 / 6 / 9 / 10 / 11 の指摘、設計残課題、運用ギャップ |

## 1. 判定基準

| 判定           | 基準                                       |
| -------------- | ------------------------------------------ |
| 未タスク化     | 本タスク範囲外で独立対応が必要             |
| 再評価クローズ | 本タスク内で実装済み、または追加タスク不要 |

## 2. 判定結果

### 再評価クローズ（1件）

| 課題                     | 判断理由                                                                                       |
| ------------------------ | ---------------------------------------------------------------------------------------------- |
| contextBridge 未使用問題 | `preload/index.ts` で `contextBridge.exposeInMainWorld("chatEditAPI", chatEditAPI)` を確認済み |

### 未タスク化（5件）

| タスクID                                        | 概要                                      | 優先度 | 指示書                                                                                                                                                            |
| ----------------------------------------------- | ----------------------------------------- | ------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| TASK-IMP-CHAT-EDIT-CUSTOM-INSTRUCTION-BUG-001   | custom command の `instruction` 展開保証  | 中     | `docs/30-workflows/completed-tasks/step-02-par-task-02-workspace-chat-edit-runtime-activation/unassigned-task/task-imp-chat-edit-custom-instruction-bug-001.md`   |
| TASK-IMP-CHAT-EDIT-CONTEXT-SIZE-ALIGNMENT-001   | context byte 上限と token 上限の整合      | 中     | `docs/30-workflows/completed-tasks/step-02-par-task-02-workspace-chat-edit-runtime-activation/unassigned-task/task-imp-chat-edit-context-size-alignment-001.md`   |
| TASK-IMP-CHAT-EDIT-CONCURRENT-REQUEST-GUARD-001 | `send-with-context` 同時実行ガード        | 低     | `docs/30-workflows/completed-tasks/step-02-par-task-02-workspace-chat-edit-runtime-activation/unassigned-task/task-imp-chat-edit-concurrent-request-guard-001.md` |
| TASK-IMP-CHAT-EDIT-CONTEXT-PATH-GUARD-001       | `contexts[*].filePath` workspace 境界検証 | 中     | `docs/30-workflows/completed-tasks/step-02-par-task-02-workspace-chat-edit-runtime-activation/unassigned-task/task-imp-chat-edit-context-path-guard-001.md`       |
| TASK-IMP-CHAT-EDIT-SCREENSHOT-AUTOMATION-001    | Electron 実体 capture 基盤への拡張        | 低     | `docs/30-workflows/completed-tasks/step-02-par-task-02-workspace-chat-edit-runtime-activation/unassigned-task/task-imp-chat-edit-screenshot-automation-001.md`    |

## 3. サマリー

| 指標           | 件数 |
| -------------- | ---- |
| 総検出課題数   | 6    |
| 未タスク化     | 5    |
| 再評価クローズ | 1    |

## 4. 次アクション

1. backlog へ5件を登録済み（`task-workflow-backlog.md`）。
2. system spec に follow-up 参照を追加する（`llm-workspace-chat-edit.md`, `workflow-ai-runtime-authmode-unification.md`）。
3. 次回 task 着手時に 5 指示書を起点に Phase 1 を開始する。
