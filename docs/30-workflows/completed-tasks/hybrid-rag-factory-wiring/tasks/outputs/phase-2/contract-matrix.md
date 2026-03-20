# Phase 2 契約マトリクス - HybridRAGFactory

## 対象

`HybridRAGFactory.createFull()` / `createLite()` の配線契約を、依存ポートごとに整理する。

| concern               | factory 入力                                              | 配線先                                                               | 契約状態               |
| --------------------- | --------------------------------------------------------- | -------------------------------------------------------------------- | ---------------------- |
| Query classification  | `llmProvider: ILLMProvider`                               | `LLMQueryClassifier`                                                 | 実装済み               |
| Keyword search bridge | `db`                                                      | `KeywordSearchStrategyAdapter(new KeywordSearchStrategy(db))`        | 実装済み               |
| Semantic search       | `db`, `embeddingProvider`                                 | `VectorSearchStrategy`                                               | 実装済み               |
| Graph search          | `graphStore`, `embeddingProvider`, `communitySummarizer?` | `GraphSearchStrategy`                                                | 実装済み               |
| Reranker split        | `rerankerType`, API key or `rerankerLlmClient`            | `CohereReranker` / `VoyageReranker` / `LLMReranker` / `NoOpReranker` | 実装済み               |
| CRAG split            | `enableCRAG`, `cragLlmClient`, `webSearcher?`             | `RelevanceEvaluator` + `CorrectiveRAG`                               | 実装済み               |
| Known limitation      | engine からの `queryType`                                 | `GraphSearchStrategy`                                                | 未伝播。follow-up 管理 |
