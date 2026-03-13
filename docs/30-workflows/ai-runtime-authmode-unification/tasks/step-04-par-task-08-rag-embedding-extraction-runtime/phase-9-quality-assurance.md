# Phase 9: 品質検証 - タスク仕様書

## メタ情報

| 項目       | 内容                                                                                           |
| ---------- | ---------------------------------------------------------------------------------------------- |
| Phase      | 9                                                                                              |
| Phase名    | 品質検証                                                                                       |
| タスクID   | TASK-IMP-RAG-EMBEDDING-EXTRACTION-AI-RUNTIME-001                                               |
| 前提Phase  | Phase 5（実装）、Phase 6（テスト拡充）、Phase 7（カバレッジ確認）、Phase 8（リファクタリング） |
| 後続Phase  | Phase 10（最終レビュー）                                                                       |
| ステータス | not_started                                                                                    |
| 作成日     | 2026-03-13                                                                                     |
| 機能名     | rag-embedding-extraction-runtime                                                               |

## 目的

backend AI surface の guidance / fail-fast / state 整合を確認する。

## 実行タスク

- 品質確認: job 状態、guidance、capability 表示、mock 排除の品質観点を確認する
- 欠陥整理: silent fallback、誤成功表示、partial failure の検出観点を整理する

## 参照資料

| 参照資料          | パス                                                       | 内容                                             |
| ----------------- | ---------------------------------------------------------- | ------------------------------------------------ |
| Phase 5（実装）   | `phase-5-implementation.md`                                | 実配線後の品質観点を確認する                     |
| aiHandlers        | `apps/desktop/src/main/ipc/aiHandlers.ts`                  | job 状態と guidance 表示を確認する               |
| communityHandlers | `apps/desktop/src/main/ipc/communityHandlers.ts`           | community summary quality を確認する             |
| hybrid-rag-engine | `packages/shared/src/services/search/hybrid-rag-engine.ts` | silent fallback / partial failure 観点を確認する |

## 統合テスト連携

silent fallback、誤成功表示、partial failure を横断観点で確認する。

## 成果物

| 成果物            | パス                              | 内容                         |
| ----------------- | --------------------------------- | ---------------------------- |
| QA チェックリスト | `outputs/phase-9/qa-checklist.md` | 品質観点と確認項目を整理する |

## 完了条件

- [ ] silent fallback と誤成功表示の検出観点が含まれている

## 次のPhase

- [Phase 10（最終レビュー）](./phase-10-final-review.md) に進む
