# Phase 4: テスト作成 - タスク仕様書

## メタ情報

| 項目       | 内容                                                          |
| ---------- | ------------------------------------------------------------- |
| Phase      | 4                                                             |
| Phase名    | テスト作成                                                    |
| タスクID   | TASK-IMP-RAG-EMBEDDING-EXTRACTION-AI-RUNTIME-001              |
| 前提Phase  | Phase 1（要件定義）、Phase 2（設計）、Phase 3（設計レビュー） |
| 後続Phase  | Phase 5（実装）                                               |
| ステータス | not_started                                                   |
| 作成日     | 2026-03-13                                                    |
| 機能名     | rag-embedding-extraction-runtime                              |

## 目的

index / embedding / extraction / graph summary の回帰テスト仕様を作る。

## 実行タスク

- テスト観点整理: capability matrix、guidance、job 状態、mock 排除、rate limit / timeout のケースを整理する
- ケース作成: Main / shared service / IPC の層ごとにケースを定義する

## 参照資料

| 参照資料                | パス                                                       | 内容                                                      |
| ----------------------- | ---------------------------------------------------------- | --------------------------------------------------------- |
| Phase 1（要件定義）     | `phase-1-requirements.md`                                  | capability 前提を確認する                                 |
| Phase 2（設計）         | `phase-2-design.md`                                        | テスト対象の責務境界を確認する                            |
| Phase 3（設計レビュー） | `phase-3-design-review.md`                                 | レビューで確定した観点を確認する                          |
| aiHandlers              | `apps/desktop/src/main/ipc/aiHandlers.ts`                  | `AI_CHECK_CONNECTION` / `AI_INDEX` の主要ケースを確認する |
| hybrid-rag-engine       | `packages/shared/src/services/search/hybrid-rag-engine.ts` | backend AI pipeline の主要ケースを確認する                |

## 統合テスト連携

AI_INDEX、embedding、GraphRAG、HybridRAG、CRAG、reranking を 1 つの test matrix にまとめる。

## 成果物

| 成果物           | パス                             | 内容                           |
| ---------------- | -------------------------------- | ------------------------------ |
| テストマトリクス | `outputs/phase-4/test-matrix.md` | 主要ケースと責務境界を整理する |

## 完了条件

- [ ] 主要ケースが index / embedding / extraction / graph summary / guidance を含んでいる

## 次のPhase

- [Phase 5（実装）](./phase-5-implementation.md) に進む
