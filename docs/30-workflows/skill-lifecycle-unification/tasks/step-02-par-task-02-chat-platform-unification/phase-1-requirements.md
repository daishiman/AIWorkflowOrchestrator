# Phase 1: 要件定義 - タスク仕様書

## 目的

会話基盤の統合対象、モード差分、共通化すべき契約を明確化し、Task03 が依存できる共通会話要件を定義する。

## 実行タスク

1. 現行 `ChatView` `chatSlice` `useStreamingChat` `WorkspaceView` の責務差分を整理する
2. `通常会話` `Workspace 会話` `Skill 作成/改善会話` の共通項と差分項を一覧化する
3. ストリーミング、履歴、文脈注入、途中停止/再開を共通要件として定義する
4. Task01 の画面責務に従った会話開始地点を整理する
5. Task03 に引き渡す API・状態の必須契約を定義する

## 参照資料

| 参照資料            | パス                                                                                                                                 | 説明                           |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------ |
| ChatView            | `apps/desktop/src/renderer/views/ChatView/index.tsx`                                                                                 | 現行通常チャット               |
| chatSlice           | `apps/desktop/src/renderer/store/slices/chatSlice.ts`                                                                                | 非ストリーミング中心の現行状態 |
| useStreamingChat    | `apps/desktop/src/renderer/hooks/useStreamingChat.ts`                                                                                | ストリーミング hook            |
| WorkspaceView       | `apps/desktop/src/renderer/views/WorkspaceView/index.tsx`                                                                            | プレースホルダ状態             |
| Workspace Chat 仕様 | `docs/30-workflows/skill-import-agent-system/tasks/task-00-unified-implementation-sequence/task-059a-ui-04b-workspace-chat-panel.md` | To-Be 要件                     |

### システム仕様（aiworkflow-requirements）

| 参照資料                | パス                                                                           | 内容               |
| ----------------------- | ------------------------------------------------------------------------------ | ------------------ |
| llm-streaming           | `.claude/skills/aiworkflow-requirements/references/llm-streaming.md`           | ストリーミング契約 |
| interfaces-chat-history | `.claude/skills/aiworkflow-requirements/references/interfaces-chat-history.md` | 履歴契約           |
| llm-workspace-chat-edit | `.claude/skills/aiworkflow-requirements/references/llm-workspace-chat-edit.md` | Workspace 文脈会話 |
| security-electron-ipc   | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`   | IPC 安全性         |

## 成果物

- `会話モード差分表`
- `共通チャット要件定義`
- `Task03 依存契約メモ`

## 完了条件

- [ ] 共通化対象とモード差分が分離されている
- [ ] ストリーミングと履歴の共通要件が定義されている
- [ ] Task03 に必要な会話基盤契約が列挙されている
