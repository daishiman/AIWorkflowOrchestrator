# Phase 6: テスト拡充 - タスク仕様書

## メタ情報

| 項目       | 内容                                         |
| ---------- | -------------------------------------------- |
| Phase      | 6                                            |
| Phase名    | テスト拡充                                   |
| タスクID   | TASK-IMP-WORKSPACE-CHAT-PANEL-AI-RUNTIME-001 |
| 前提Phase  | Phase 4（テスト作成）、Phase 5（実装）       |
| 後続Phase  | Phase 7（カバレッジ確認）                    |
| ステータス | not_started                                  |
| 作成日     | 2026-03-13                                   |
| 機能名     | workspace-chat-panel-runtime-alignment       |

## 目的

stream / context / conversation の回帰に対する追加テスト方針を整理する。

## 実行タスク

- 回帰拡張: stream 中断、file remove、mention 選択、unsupported capability のケースを追加する
- 境界拡張: selected config 未同期、conversation 未作成、stale stream のケースを追加する

## 参照資料

| 参照資料                | パス                                                                   | 内容                             |
| ----------------------- | ---------------------------------------------------------------------- | -------------------------------- |
| Phase 5（実装）         | `phase-5-implementation.md`                                            | 実装済み変更点を確認する         |
| WorkspaceChatPanel      | `apps/desktop/src/renderer/views/WorkspaceView/WorkspaceChatPanel.tsx` | UI 回帰対象を確認する            |
| conversation repository | `apps/desktop/src/main/repositories/conversationRepository.ts`         | 永続化回帰点を確認する           |
| llm handlers            | `apps/desktop/src/main/handlers/llm.ts`                                | stream / cancel 回帰点を確認する |

## 統合テスト連携

stream、context、conversation、unsupported capability guidance の回帰を一体で広げる。

## 成果物

| 成果物   | パス                                 | 内容                         |
| -------- | ------------------------------------ | ---------------------------- |
| 回帰計画 | `outputs/phase-6/regression-plan.md` | 追加テストと優先度を整理する |

## 完了条件

- [ ] stream / context / fail-fast の回帰ケースが整理されている

## 次のPhase

- [Phase 7（カバレッジ確認）](./phase-7-coverage-check.md) に進む
