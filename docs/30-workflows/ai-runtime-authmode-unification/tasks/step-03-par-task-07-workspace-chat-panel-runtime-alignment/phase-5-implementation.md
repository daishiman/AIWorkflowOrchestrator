# Phase 5: 実装 - タスク仕様書

## メタ情報

| 項目       | 内容                                                                                 |
| ---------- | ------------------------------------------------------------------------------------ |
| Phase      | 5                                                                                    |
| Phase名    | 実装                                                                                 |
| タスクID   | TASK-IMP-WORKSPACE-CHAT-PANEL-AI-RUNTIME-001                                         |
| 前提Phase  | Phase 1（要件定義）、Phase 2（設計）、Phase 3（設計レビュー）、Phase 4（テスト作成） |
| 後続Phase  | Phase 6（テスト拡充）                                                                |
| ステータス | not_started                                                                          |
| 作成日     | 2026-03-13                                                                           |
| 機能名     | workspace-chat-panel-runtime-alignment                                               |

## 目的

実装順序と変更境界を具体化する。

## 実行タスク

- Main 側整理: stream / cancel / selected config authority の変更順序を定義する
- Renderer 側整理: panel / controller / mention / conversation の変更順序を定義する
- 失敗系整理: file read failure / stream failure / unsupported capability の反映順序を定義する

## 参照資料

| 参照資料                   | パス                                                                                | 内容                              |
| -------------------------- | ----------------------------------------------------------------------------------- | --------------------------------- |
| Phase 2（設計）            | `phase-2-design.md`                                                                 | 変更順序の前提を確認する          |
| Phase 4（テスト作成）      | `phase-4-test-creation.md`                                                          | 実装前の test matrix を確認する   |
| WorkspaceChatPanel         | `apps/desktop/src/renderer/views/WorkspaceView/WorkspaceChatPanel.tsx`              | renderer 側変更点を確認する       |
| useWorkspaceChatController | `apps/desktop/src/renderer/views/WorkspaceView/hooks/useWorkspaceChatController.ts` | controller handoff を確認する     |
| llm handlers               | `apps/desktop/src/main/handlers/llm.ts`                                             | Main authority の変更点を確認する |

## 統合テスト連携

streaming、context、conversation、unsupported capability guidance の変更順序を integration 想定で固定する。

## 成果物

| 成果物   | パス                                     | 内容                                           |
| -------- | ---------------------------------------- | ---------------------------------------------- |
| 実装計画 | `outputs/phase-5/implementation-plan.md` | 変更順序、影響範囲、ロールバック観点を整理する |

## 完了条件

- [ ] Main / Renderer / IPC の変更順序が定義されている

## 次のPhase

- [Phase 6（テスト拡充）](./phase-6-test-expansion.md) に進む
