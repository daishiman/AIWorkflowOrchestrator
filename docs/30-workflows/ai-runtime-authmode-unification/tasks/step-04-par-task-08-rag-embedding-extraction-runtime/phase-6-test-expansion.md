# Phase 6: テスト拡充 - タスク仕様書

## メタ情報

| 項目       | 内容                                             |
| ---------- | ------------------------------------------------ |
| Phase      | 6                                                |
| Phase名    | テスト拡充                                       |
| タスクID   | TASK-IMP-RAG-EMBEDDING-EXTRACTION-AI-RUNTIME-001 |
| 前提Phase  | Phase 4（テスト作成）、Phase 5（実装）           |
| 後続Phase  | Phase 7（カバレッジ確認）                        |
| ステータス | not_started                                      |
| 作成日     | 2026-03-13                                       |
| 機能名     | rag-embedding-extraction-runtime                 |

## 目的

backend AI surface の回帰に対する追加テスト方針を整理する。

## 実行タスク

- 回帰拡張: job retry、provider failure、unsupported capability、mock 排除のケースを追加する
- 境界拡張: long-running job、partial failure、graph summary fallback のケースを追加する

## 参照資料

| 参照資料             | パス                                                          | 内容                           |
| -------------------- | ------------------------------------------------------------- | ------------------------------ |
| Phase 5（実装）      | `phase-5-implementation.md`                                   | 実装済み変更点を確認する       |
| embedding-service    | `packages/shared/src/services/embedding/embedding-service.ts` | embedding 回帰点を確認する     |
| community-summarizer | `packages/shared/src/services/graph/community-summarizer.ts`  | graph summary 回帰点を確認する |
| hybrid-rag-engine    | `packages/shared/src/services/search/hybrid-rag-engine.ts`    | rerank / CRAG 回帰点を確認する |

## 統合テスト連携

job retry、partial failure、guidance、mock 排除の回帰を一体で広げる。

## 成果物

| 成果物   | パス                                 | 内容                         |
| -------- | ------------------------------------ | ---------------------------- |
| 回帰計画 | `outputs/phase-6/regression-plan.md` | 追加テストと優先度を整理する |

## 完了条件

- [ ] index / embedding / extraction / graph summary / guidance の回帰ケースが整理されている

## 次のPhase

- [Phase 7（カバレッジ確認）](./phase-7-coverage-check.md) に進む
