# Phase 9: 品質検証 - タスク仕様書

## メタ情報

| 項目       | 内容                                                                                           |
| ---------- | ---------------------------------------------------------------------------------------------- |
| Phase      | 9                                                                                              |
| Phase名    | 品質検証                                                                                       |
| タスクID   | TASK-IMP-WORKSPACE-CHAT-PANEL-AI-RUNTIME-001                                                   |
| 前提Phase  | Phase 5（実装）、Phase 6（テスト拡充）、Phase 7（カバレッジ確認）、Phase 8（リファクタリング） |
| 後続Phase  | Phase 10（最終レビュー）                                                                       |
| ステータス | not_started                                                                                    |
| 作成日     | 2026-03-13                                                                                     |
| 機能名     | workspace-chat-panel-runtime-alignment                                                         |

## 目的

workspace chat surface の UX / security / state 整合を確認する。

## 実行タスク

- 品質確認: stream UX、file context 表示、guidance、cancel 挙動の品質観点を確認する
- 欠陥整理: stale chunk、誤添付、誤成功表示の検出観点を整理する

## 参照資料

| 参照資料                   | パス                                                                                | 内容                                 |
| -------------------------- | ----------------------------------------------------------------------------------- | ------------------------------------ |
| Phase 5（実装）            | `phase-5-implementation.md`                                                         | 実配線後の品質観点を確認する         |
| WorkspaceChatPanel         | `apps/desktop/src/renderer/views/WorkspaceView/WorkspaceChatPanel.tsx`              | stream UX と guidance 表示を確認する |
| useWorkspaceChatController | `apps/desktop/src/renderer/views/WorkspaceView/hooks/useWorkspaceChatController.ts` | state drift 観点を確認する           |
| completed task 059a        | `docs/30-workflows/completed-tasks/task-059a-ui-04b-workspace-chat-panel/index.md`  | 既存 UI 正本との drift を確認する    |

## 統合テスト連携

stale chunk、誤添付、誤成功表示を横断観点で確認する。

## 成果物

| 成果物            | パス                              | 内容                         |
| ----------------- | --------------------------------- | ---------------------------- |
| QA チェックリスト | `outputs/phase-9/qa-checklist.md` | 品質観点と確認項目を整理する |

## 完了条件

- [ ] stale stream と誤 context 表示の検出観点が含まれている

## 次のPhase

- [Phase 10（最終レビュー）](./phase-10-final-review.md) に進む
