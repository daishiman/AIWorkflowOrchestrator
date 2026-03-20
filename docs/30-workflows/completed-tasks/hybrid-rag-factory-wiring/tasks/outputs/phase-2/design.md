# Phase 2 設計サマリー - HybridRAGFactory.createFull/createLite 実配線

## メタ情報

| 項目       | 値              |
| ---------- | --------------- |
| タスクID   | `UT-RAG-08-002` |
| Phase      | `2 - 設計`      |
| 作成日     | 2026-03-20      |
| ステータス | COMPLETE        |

## 設計決定一覧

### DT-01: 選択肢A採用 - cragLlmClient / rerankerLlmClient 分離

shared `ILLMClient`（`../llm/types`）と CRAG `ILLMClient`（`./crag/types`）を import alias で分離する。

```typescript
import type { ILLMClient as RerankerLLMClient } from "../llm/types";
import type { ILLMClient as CragLLMClient, IWebSearcher } from "./crag/types";
```

選択肢B（統一型）は `RelevanceEvaluator` と `LLMReranker` の interface 差異を吸収できないため不採用。

### DT-02: FullHybridRAGConfig 型定義

`llmProvider` / `rerankerLlmClient` / `cragLlmClient` を追加した config 契約:

| プロパティ            | 型                                        | 必須 | 役割                    |
| --------------------- | ----------------------------------------- | ---- | ----------------------- |
| `db`                  | `LibSQLDatabase<Record<string, never>>`   | 必須 | keyword / vector DB     |
| `embeddingProvider`   | `IEmbeddingProvider`                      | 必須 | vector / graph strategy |
| `graphStore`          | `IKnowledgeGraphStore`                    | 必須 | graph strategy          |
| `llmProvider`         | `ILLMProvider`                            | 必須 | `LLMQueryClassifier` 用 |
| `rerankerType`        | `"cohere" \| "voyage" \| "llm" \| "none"` | 必須 | reranker 選択           |
| `rerankerLlmClient`   | `RerankerLLMClient`                       | 任意 | `LLMReranker` 用        |
| `cragLlmClient`       | `CragLLMClient`                           | 任意 | `RelevanceEvaluator` 用 |
| `communitySummarizer` | `ICommunitySummarizer`                    | 任意 | graph strategy optional |
| `webSearcher`         | `IWebSearcher`                            | 任意 | CRAG optional           |

`LiteHybridRAGConfig` は `db` / `embeddingProvider` / `graphStore` のみ。

### DT-03: createFull() 組み立て手順

1. `validateFullConfig(config)` でバリデーション
2. `classifier = new LLMQueryClassifier(config.llmProvider, new RuleBasedQueryClassifier())`
3. `keyword = new KeywordSearchStrategyAdapter(new KeywordSearchStrategy(config.db))`
4. `semantic = new VectorSearchStrategy(config.db, config.embeddingProvider)`
5. `graph = new GraphSearchStrategy(config.graphStore, config.embeddingProvider, config.communitySummarizer)`
6. `fusion = new RRFFusion(config.rrfK ?? 60)`
7. `reranker = createReranker(config)`
8. `crag = createCrag(config)`
9. `return new HybridRAGEngine(classifier, { keyword, semantic, graph }, fusion, reranker, crag)`

### DT-04: createLite() 組み立て手順

1. `classifier = new RuleBasedQueryClassifier()`
2. `keyword = new KeywordSearchStrategyAdapter(new KeywordSearchStrategy(config.db))`
3. `semantic = new VectorSearchStrategy(config.db, config.embeddingProvider)`
4. `graph = new GraphSearchStrategy(config.graphStore, config.embeddingProvider)`
5. `fusion = new RRFFusion()`
6. `reranker = new NoOpReranker()`
7. `crag = null`
8. `return new HybridRAGEngine(...)`

### DT-05: Reranker 選択ロジック（createReranker helper）

| `rerankerType` | 生成物                                          | 事前条件                 |
| -------------- | ----------------------------------------------- | ------------------------ |
| `"cohere"`     | `new CohereReranker(cohereApiKey, cohereModel)` | `cohereApiKey` 必須      |
| `"voyage"`     | `new VoyageReranker(voyageApiKey)`              | `voyageApiKey` 必須      |
| `"llm"`        | `new LLMReranker(rerankerLlmClient)`            | `rerankerLlmClient` 必須 |
| `"none"`       | `new NoOpReranker()`                            | なし                     |

## バリデーション設計（DT-07）

| 条件                                                     | エラーメッセージ                                                                    |
| -------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| `rerankerType === "cohere"` かつ `!cohereApiKey?.trim()` | `HybridRAGFactory.createFull(): cohereApiKey is required for rerankerType=cohere`   |
| `rerankerType === "voyage"` かつ `!voyageApiKey?.trim()` | `HybridRAGFactory.createFull(): voyageApiKey is required for rerankerType=voyage`   |
| `rerankerType === "llm"` かつ `!rerankerLlmClient`       | `HybridRAGFactory.createFull(): rerankerLlmClient is required for rerankerType=llm` |
| `enableCRAG === true` かつ `!cragLlmClient`              | `HybridRAGFactory.createFull(): cragLlmClient is required when enableCRAG=true`     |

## Keyword Adapter 設計（DT-03）

新規ファイル: `packages/shared/src/services/search/strategies/keyword-search-strategy-adapter.ts`

責務:

- `KeywordSearchStrategy` を内部保持
- `search(query, limit, filters)` を `SearchQuery` へ変換（`text`, `limit`, `fileIds`, `minRelevance`）
- `SearchResultItem[]` をそのまま返し、strategy 名は `"keyword"` とする

## 明示的に解決しない事項（follow-up）

- `HybridRAGEngine` の graph strategy への `queryType` 伝播未対応
- `KeywordSearchStrategy` 本体の public interface 改修
- `RelevanceEvaluator` と shared `ILLMClient` の統一
