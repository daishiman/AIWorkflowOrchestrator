# Phase 8: リファクタリング - タスク仕様書

## メタ情報

| 項目       | 内容                                                              |
| ---------- | ----------------------------------------------------------------- |
| Phase      | 8                                                                 |
| Phase名    | リファクタリング                                                  |
| タスクID   | TASK-IMP-WORKSPACE-CHAT-PANEL-AI-RUNTIME-001                      |
| 前提Phase  | Phase 5（実装）、Phase 6（テスト拡充）、Phase 7（カバレッジ確認） |
| 後続Phase  | Phase 9（品質検証）                                               |
| ステータス | not_started                                                       |
| 作成日     | 2026-03-13                                                        |
| 機能名     | workspace-chat-panel-runtime-alignment                            |

## 目的

streaming / context / conversation の責務分離を保ちながら構造を整理する。

## 実行タスク

- state 整理: stream state と context state の重複責務を減らす
- helper 整理: mention / context / conversation helper の境界を整理する

## 参照資料

| 参照資料                   | パス                                                                                | 内容                              |
| -------------------------- | ----------------------------------------------------------------------------------- | --------------------------------- |
| Phase 1（要件定義）        | `phase-1-requirements.md`                                                           | authority 前提を確認する          |
| Phase 2（設計）            | `phase-2-design.md`                                                                 | 目標とする責務境界を確認する      |
| Phase 5（実装）            | `phase-5-implementation.md`                                                         | 実装済み責務分布を確認する        |
| Phase 6（テスト拡充）      | `phase-6-test-expansion.md`                                                         | 回帰対象の広がりを確認する        |
| Phase 7（カバレッジ確認）  | `phase-7-coverage-check.md`                                                         | coverage gap を確認する           |
| useWorkspaceChatController | `apps/desktop/src/renderer/views/WorkspaceView/hooks/useWorkspaceChatController.ts` | controller 責務を確認する         |
| conversation repository    | `apps/desktop/src/main/repositories/conversationRepository.ts`                      | conversation authority を確認する |

## 統合テスト連携

streaming、file context、conversation helper の責務分離を壊さないよう整理する。

## 成果物

| 成果物         | パス                               | 内容                       |
| -------------- | ---------------------------------- | -------------------------- |
| リファクタ計画 | `outputs/phase-8/refactor-plan.md` | 整理対象と非対象を明記する |

## 完了条件

- [ ] streaming / context / conversation の責務境界を壊さない整理方針が定義されている

## 次のPhase

- [Phase 9（品質検証）](./phase-9-quality-assurance.md) に進む
