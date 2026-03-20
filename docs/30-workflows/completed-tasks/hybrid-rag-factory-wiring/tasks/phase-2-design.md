# Phase 2: 設計 - HybridRAGFactory.createFull/createLite 実配線

## メタ情報

| 項目          | 値                                                          |
| ------------- | ----------------------------------------------------------- |
| タスクID      | `UT-RAG-08-002`                                             |
| Phase         | `2 - 設計`                                                  |
| 前提Phase     | `Phase 1: 要件定義`                                         |
| 次Phase       | `Phase 3: 設計レビュー`                                     |
| 対象ファイル  | `packages/shared/src/services/search/hybrid-rag-factory.ts` |
| 作成日        | 2026-03-20                                                  |
| 前Phase成果物 | `outputs/phase-1/requirements.md`                           |

## 目的

adapter / config / validation / spec sync の責務境界を定め、Phase 5 実装が「何を変えるか」「何を変えないか」を曖昧さなく固定する。

## 実行タスク

- 契約設計: config 型と helper 境界を設計する
- adapter 設計: keyword bridge を単一責務で分離する
- 分岐設計: query classifier / reranker / CRAG の生成ロジックを分ける
- 制約記録: graph queryType limitation と API N/A を明示する

## 設計方針

1. `KeywordSearchStrategy` 非互換は adapter で吸収する。
2. LLM interface split は config 側で分離し、暗黙の兼用をしない。
3. factory は orchestration だけを持ち、strategy 本体の責務は広げない。
4. `HybridRAGEngine` の queryType 伝播改善は別 concern として follow-up 化する。

## 設計詳細

### DT-01: 型 import と alias 設計

```typescript
import type { LibSQLDatabase } from "drizzle-orm/libsql";
import type { IEmbeddingProvider } from "../embedding/providers/interfaces";
import type { ILLMProvider } from "../extraction/interfaces";
import type { IKnowledgeGraphStore } from "../graph/knowledge-graph-store";
import type { ICommunitySummarizer } from "../graph/interfaces/community-summarizer.interface";
import type { ILLMClient as RerankerLLMClient } from "../llm/types";
import type { ILLMClient as CragLLMClient, IWebSearcher } from "./crag/types";
```

- shared `ILLMClient` と CRAG `ILLMClient` は alias で衝突を避ける。
- `IEmbeddingProvider` は `EmbeddingResult` を返す前提で扱う。

### DT-02: config 契約

```typescript
export interface FullHybridRAGConfig {
  db: LibSQLDatabase<Record<string, never>>;
  embeddingProvider: IEmbeddingProvider;
  graphStore: IKnowledgeGraphStore;
  llmProvider: ILLMProvider;
  rerankerType: "cohere" | "voyage" | "llm" | "none";
  rerankerLlmClient?: RerankerLLMClient;
  cragLlmClient?: CragLLMClient;
  communitySummarizer?: ICommunitySummarizer;
  webSearcher?: IWebSearcher;
  cohereApiKey?: string;
  cohereModel?: string;
  voyageApiKey?: string;
  rerankerBatchSize?: number;
  rrfK?: number;
  enableCRAG?: boolean;
  enableWebSearch?: boolean;
  enableRefinement?: boolean;
  cragMaxEvaluate?: number;
  cragCorrectThreshold?: number;
  cragIncorrectThreshold?: number;
  ambiguousFilterThreshold?: number;
}
```

- `LiteHybridRAGConfig` は `db` / `embeddingProvider` / `graphStore` のみを持つ。
- caller が同一実体を複数 interface で渡すのは許容するが、factory 側で自動変換しない。

### DT-03: keyword adapter 設計

新規ファイル候補:

- `packages/shared/src/services/search/strategies/keyword-search-strategy-adapter.ts`

責務:

1. `KeywordSearchStrategy` を内部に保持する。
2. `search(query, limit, filters)` を `SearchQuery` へ変換する。
3. `SearchResultItem[]` をそのまま返し、strategy 名は `"keyword"` とする。

`SearchQuery` 変換ルール:

- `text = query`
- `limit = limit`
- `fileIds = filters?.fileIds`
- `minRelevance = filters?.minRelevance`

### DT-04: createFull() 組み立て

```text
1. validateFullConfig(config)
2. classifier = new LLMQueryClassifier(config.llmProvider, new RuleBasedQueryClassifier())
3. keyword = new KeywordSearchStrategyAdapter(new KeywordSearchStrategy(config.db))
4. semantic = new VectorSearchStrategy(config.db, config.embeddingProvider)
5. graph = new GraphSearchStrategy(config.graphStore, config.embeddingProvider, config.communitySummarizer)
6. fusion = new RRFFusion(config.rrfK ?? 60)
7. reranker = createReranker(config)
8. crag = createCrag(config)
9. return new HybridRAGEngine(classifier, { keyword, semantic, graph }, fusion, reranker, crag)
```

### DT-05: createLite() 組み立て

```text
1. classifier = new RuleBasedQueryClassifier()
2. keyword = new KeywordSearchStrategyAdapter(new KeywordSearchStrategy(config.db))
3. semantic = new VectorSearchStrategy(config.db, config.embeddingProvider)
4. graph = new GraphSearchStrategy(config.graphStore, config.embeddingProvider)
5. fusion = new RRFFusion()
6. reranker = new NoOpReranker()
7. crag = null
8. return new HybridRAGEngine(...)
```

### DT-06: helper 境界

| helper                  | 入力                  | 出力                     | 役割                                 |
| ----------------------- | --------------------- | ------------------------ | ------------------------------------ |
| `validateFullConfig`    | `FullHybridRAGConfig` | `void`                   | 必須依存チェック                     |
| `createKeywordStrategy` | `db`                  | `ISearchStrategy`        | adapter 経由の keyword strategy 生成 |
| `createReranker`        | `FullHybridRAGConfig` | `IReranker`              | reranker 4 分岐                      |
| `createCrag`            | `FullHybridRAGConfig` | `ICorrectiveRAG \| null` | CRAG 条件分岐                        |

### DT-07: validation 設計

| 条件                                                     | エラー                                                                              |
| -------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| `rerankerType === "cohere"` かつ `!cohereApiKey?.trim()` | `HybridRAGFactory.createFull(): cohereApiKey is required for rerankerType=cohere`   |
| `rerankerType === "voyage"` かつ `!voyageApiKey?.trim()` | `HybridRAGFactory.createFull(): voyageApiKey is required for rerankerType=voyage`   |
| `rerankerType === "llm"` かつ `!rerankerLlmClient`       | `HybridRAGFactory.createFull(): rerankerLlmClient is required for rerankerType=llm` |
| `enableCRAG === true` かつ `!cragLlmClient`              | `HybridRAGFactory.createFull(): cragLlmClient is required when enableCRAG=true`     |

### DT-08: 明示的に解決しない事項

- `HybridRAGEngine` が graph strategy へ `queryType` を渡さない制約
- `KeywordSearchStrategy` 本体の public interface 改修
- `RelevanceEvaluator` と shared `ILLMClient` の統一

これらは Phase 10 で `follow-up` 判定を行う。

## 参照資料

| 資料名              | パス / 場所                                                                         |
| ------------------- | ----------------------------------------------------------------------------------- |
| Phase 1 要件成果物  | `docs/30-workflows/hybrid-rag-factory-wiring/tasks/outputs/phase-1/requirements.md` |
| hybrid contract     | `.claude/skills/aiworkflow-requirements/references/rag-search-hybrid.md`            |
| graph contract      | `.claude/skills/aiworkflow-requirements/references/rag-search-graph.md`             |
| CRAG contract       | `.claude/skills/aiworkflow-requirements/references/rag-search-crag.md`              |
| search family index | `.claude/skills/aiworkflow-requirements/references/interfaces-rag-search.md`        |
| quality details     | `.claude/skills/aiworkflow-requirements/references/quality-requirements-details.md` |
| source code         | `packages/shared/src/services/search/*.ts`                                          |

## 実行手順

1. config 型と import alias を確定する
2. keyword adapter の責務を固定する
3. createFull / createLite / helper 境界を確定する
4. validation と follow-up 範囲を確定する

## 統合テスト連携

- adapter 経由の keyword search が engine の triple search に載ることを Phase 4 へ引き継ぐ。
- `enableCRAG` と `rerankerType` の分岐は Phase 4 の異常系テストへ引き継ぐ。

## 成果物

| 成果物         | パス                                                                                   |
| -------------- | -------------------------------------------------------------------------------------- |
| 設計書         | `docs/30-workflows/hybrid-rag-factory-wiring/tasks/outputs/phase-2/design.md`          |
| 契約マトリクス | `docs/30-workflows/hybrid-rag-factory-wiring/tasks/outputs/phase-2/contract-matrix.md` |

## 完了条件

- [ ] config 契約が 3 つの LLM 系統を区別している
- [ ] keyword adapter の責務が単一責務で定義されている
- [ ] `createFull()` / `createLite()` の組み立て手順が曖昧さなく記述されている
- [ ] follow-up 扱いの論点が明示されている

## 多角的チェック観点（AIが判断）

1. adapter を factory 内部クラスに閉じ込めるか別ファイルに出すか。
2. `communitySummarizer` を full config の optional にするか phase 10 follow-up に残すか。
3. error message が caller に足りる粒度になっているか。

## タスク100%実行確認【必須】

- [ ] 本仕様書の全セクションを読み通し、漏れがないことを確認した
- [ ] Phase 1 の要件を設計へ変換できていることを確認した
- [ ] Phase 3 へ渡す review 観点が揃っていることを確認した

## 次Phase

Phase 3: 設計レビュー → `phase-3-design-review.md`
