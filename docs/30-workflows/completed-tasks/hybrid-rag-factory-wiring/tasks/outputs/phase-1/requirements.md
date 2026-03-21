# Phase 1 要件サマリー - HybridRAGFactory.createFull/createLite 実配線

## メタ情報

| 項目       | 値              |
| ---------- | --------------- |
| タスクID   | `UT-RAG-08-002` |
| Phase      | `1 - 要件定義`  |
| 作成日     | 2026-03-20      |
| ステータス | COMPLETE        |

## 機能要件一覧

| ID    | 要件                                                                                                                                                                                    |
| ----- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| FR-01 | `FullHybridRAGConfig` に `db` / `embeddingProvider` / `graphStore` / `llmProvider` / `rerankerLlmClient` / `cragLlmClient` / `communitySummarizer?` / `webSearcher?` を責務分離して持つ |
| FR-02 | `KeywordSearchStrategy` を直接 engine に渡さず、`ISearchStrategy` 準拠 adapter 経由で接続する                                                                                           |
| FR-03 | `createFull()` で query classification / reranker / CRAG の 3 LLM 系統を混同しない                                                                                                      |
| FR-04 | `createLite()` で `RuleBasedQueryClassifier` + adapter 経由 keyword + `NoOpReranker` + `crag=null` を使う                                                                               |
| FR-05 | placeholder 型（`IEmbeddingProvider` / `IKnowledgeGraphStore` / `ILLMClient` x2 / `DrizzleClient` / `IWebSearcher`）を契約再定義として置換する                                          |
| FR-06 | Phase 12 で `architecture-rag.md` / `rag-search-hybrid.md` / `rag-query-pipeline.md` / `task-workflow.md` / `lessons-learned-current.md` を same-wave sync する                         |

## 受入基準一覧

| ID    | 基準                                                                                                      |
| ----- | --------------------------------------------------------------------------------------------------------- |
| AC-01 | `FullHybridRAGConfig` に `llmProvider` / `rerankerLlmClient` / `cragLlmClient` の責務分離が反映されている |
| AC-02 | keyword adapter が `ISearchStrategy` 契約を満たす                                                         |
| AC-03 | `createFull()` と `createLite()` が `FACTORY_NOT_READY` を投げず engine を返す                            |
| AC-04 | placeholder 型と `@placeholder` コメントが削除されている                                                  |
| AC-05 | `cohere` / `voyage` / `llm` / `none` の 4 分岐が検証可能である                                            |
| AC-06 | `enableCRAG === true` 時のみ `CorrectiveRAG` を生成し、依存不足なら明示エラーになる                       |
| AC-07 | Phase 12 の same-wave sync 対象が仕様書に明記されている                                                   |

## 非機能要件サマリー

| ID     | 要件                                                                                                             |
| ------ | ---------------------------------------------------------------------------------------------------------------- |
| NFR-01 | `cohereApiKey` / `voyageApiKey` / `rerankerLlmClient` / `cragLlmClient` 不足は明示エラー（silent fallback 禁止） |
| NFR-02 | Lines 80% / Functions 80% / Branches 60% / Statements 65%                                                        |
| NFR-03 | factory 呼び出し元は interface を渡す（DIP 準拠）                                                                |
| NFR-04 | `HybridRAGEngine` の `queryType` 伝播改善は本 task スコープ外                                                    |

## 依存タスク確認結果

- `HybridRAGEngine` コンストラクタ契約: Phase 2 で整合確認済み
- `KeywordSearchStrategy` 非互換: adapter pattern で吸収（本 task スコープ内）
- `ILLMClient` 型二重定義（shared / crag）: import alias で分離（本 task スコープ内）
- graph `queryType` 伝播未対応: follow-up 化（UT-RAG-08-002-GRAPH-QUERYTYPE として記録）
