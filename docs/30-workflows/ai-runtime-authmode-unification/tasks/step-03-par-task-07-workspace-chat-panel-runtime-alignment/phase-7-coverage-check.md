# Phase 7: カバレッジ確認 - タスク仕様書

## メタ情報

| 項目       | 内容                                                          |
| ---------- | ------------------------------------------------------------- |
| Phase      | 7                                                             |
| Phase名    | カバレッジ確認                                                |
| タスクID   | TASK-IMP-WORKSPACE-CHAT-PANEL-AI-RUNTIME-001                  |
| 前提Phase  | Phase 4（テスト作成）、Phase 5（実装）、Phase 6（テスト拡充） |
| 後続Phase  | Phase 8（リファクタリング）                                   |
| ステータス | not_started                                                   |
| 作成日     | 2026-03-13                                                    |
| 機能名     | workspace-chat-panel-runtime-alignment                        |

## 目的

streaming / mention / conversation の coverage 目標を確認する。

## 実行タスク

- 指標整理: Renderer / Main / IPC の coverage 対象を整理する
- 未達分析: critical path の未計測箇所を抽出する

## 参照資料

| 参照資料                   | パス                                                                                | 内容                                 |
| -------------------------- | ----------------------------------------------------------------------------------- | ------------------------------------ |
| Phase 5（実装）            | `phase-5-implementation.md`                                                         | coverage 対象の変更点を確認する      |
| Phase 6（テスト拡充）      | `phase-6-test-expansion.md`                                                         | 追加回帰ケースを確認する             |
| useWorkspaceChatController | `apps/desktop/src/renderer/views/WorkspaceView/hooks/useWorkspaceChatController.ts` | renderer 側 critical path を確認する |
| llm handlers               | `apps/desktop/src/main/handlers/llm.ts`                                             | Main 側 critical path を確認する     |

## 統合テスト連携

stream、cancel、selected files、conversation 保存の coverage gap を確認する。

## 成果物

| 成果物         | パス                               | 内容                            |
| -------------- | ---------------------------------- | ------------------------------- |
| カバレッジ計画 | `outputs/phase-7/coverage-plan.md` | coverage 目標と不足点を整理する |

## 完了条件

- [ ] critical path の未計測箇所が列挙されている

## 次のPhase

- [Phase 8（リファクタリング）](./phase-8-refactoring.md) に進む
