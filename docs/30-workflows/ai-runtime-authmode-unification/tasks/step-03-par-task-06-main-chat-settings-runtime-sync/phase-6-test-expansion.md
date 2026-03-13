# Phase 6: テスト拡充 - タスク仕様書

## メタ情報

| 項目       | 内容                                       |
| ---------- | ------------------------------------------ |
| Phase      | 6                                          |
| Phase名    | テスト拡充                                 |
| タスクID   | TASK-IMP-MAIN-CHAT-SETTINGS-AI-RUNTIME-001 |
| 前提Phase  | Phase 4（テスト作成）、Phase 5（実装）     |
| 後続Phase  | Phase 7（カバレッジ確認）                  |
| ステータス | not_started                                |
| 作成日     | 2026-03-13                                 |
| 機能名     | main-chat-settings-runtime-sync            |

## 目的

主要回帰に対する追加テスト方針を整理する。

## 実行タスク

- 回帰拡張: access capability 切替、provider 切替、prompt 保存、health failure のケースを追加する
- 境界拡張: Main authority 未同期、in-memory default、disabled UI のケースを追加する

## 参照資料

| 参照資料          | パス                                                            | 内容                                    |
| ----------------- | --------------------------------------------------------------- | --------------------------------------- |
| Phase 5（実装）   | `phase-5-implementation.md`                                     | 実装順序と変更境界を確認する            |
| ChatView          | `apps/desktop/src/renderer/views/ChatView/index.tsx`            | main chat UI の代表回帰を確認する       |
| LLMSelectorPanel  | `apps/desktop/src/renderer/components/llm/LLMSelectorPanel.tsx` | selector / health UI の回帰を確認する   |
| LLMAdapterFactory | `apps/desktop/src/main/adapters/llm/LLMAdapterFactory.ts`       | provider adapter 解決の回帰点を確認する |

## 統合テスト連携

access capability、selected config、system prompt、health / guidance の回帰を一体で広げる。

## 成果物

| 成果物   | パス                                 | 内容                         |
| -------- | ------------------------------------ | ---------------------------- |
| 回帰計画 | `outputs/phase-6/regression-plan.md` | 追加テストと優先度を整理する |

## 完了条件

- [ ] 切替・保存・失敗系の回帰ケースが整理されている

## 次のPhase

- [Phase 7（カバレッジ確認）](./phase-7-coverage-check.md) に進む
