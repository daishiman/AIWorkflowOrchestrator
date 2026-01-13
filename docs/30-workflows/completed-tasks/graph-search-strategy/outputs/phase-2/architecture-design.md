# GraphSearchStrategy アーキテクチャ設計書

> Phase 2 成果物
> 作成日: 2026-01-13
> 機能名: graph-search-strategy

---

## 概要

GraphSearchStrategyは、HybridRAGのTriple Searchにおける3つ目の検索戦略として、Knowledge Graphを活用した検索機能を提供する。ISearchStrategyインターフェースに準拠し、Constructor Injectionパターンで依存サービスを注入する。

---

## アーキテクチャ図

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                            Application Layer                                  │
│                      (HybridSearchService, GraphRAGQueryService)              │
└──────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│                         GraphSearchStrategy                                   │
│                     implements ISearchStrategy                                │
│                                                                               │
│  ┌─────────────────────────────────────────────────────────────────────────┐ │
│  │  Public Interface                                                        │ │
│  │  ┌──────────────────┐ ┌──────────────────┐ ┌────────────────────────┐   │ │
│  │  │ name: "graph"    │ │ search()         │ │ getMetrics()           │   │ │
│  │  └──────────────────┘ └──────────────────┘ └────────────────────────┘   │ │
│  └─────────────────────────────────────────────────────────────────────────┘ │
│                                                                               │
│  ┌─────────────────────────────────────────────────────────────────────────┐ │
│  │  Search Methods (private)                                                │ │
│  │  ┌──────────────────┐ ┌──────────────────┐ ┌────────────────────────┐   │ │
│  │  │ localSearch()    │ │ globalSearch()   │ │ relationshipSearch()   │   │ │
│  │  └──────────────────┘ └──────────────────┘ └────────────────────────┘   │ │
│  └─────────────────────────────────────────────────────────────────────────┘ │
│                                                                               │
│  ┌─────────────────────────────────────────────────────────────────────────┐ │
│  │  Utility Methods (private)                                               │ │
│  │  ┌──────────────────────────┐ ┌─────────────────────────────────────┐   │ │
│  │  │ extractQueryEntities()   │ │ getEntityChunks()                   │   │ │
│  │  └──────────────────────────┘ └─────────────────────────────────────┘   │ │
│  │  ┌──────────────────────────┐ ┌─────────────────────────────────────┐   │ │
│  │  │ calculateLocalScore()    │ │ calculatePathScore()                │   │ │
│  │  └──────────────────────────┘ └─────────────────────────────────────┘   │ │
│  │  ┌──────────────────────────┐ ┌─────────────────────────────────────┐   │ │
│  │  │ validateInput()          │ │ toSearchResultItem()                │   │ │
│  │  └──────────────────────────┘ └─────────────────────────────────────┘   │ │
│  └─────────────────────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────────────────┘
             │                         │                        │
             │                         │                        │
             ▼                         ▼                        ▼
┌────────────────────┐   ┌────────────────────┐   ┌────────────────────────┐
│ IEmbeddingProvider │   │IKnowledgeGraphStore│   │ ICommunitySummarizer   │
│    (Required)      │   │     (Required)     │   │     (Optional)         │
│                    │   │                    │   │                        │
│  - embed()         │   │ - findSimilar      │   │ - searchSummaries()    │
│                    │   │   Entities()       │   │                        │
│                    │   │ - traverse()       │   │                        │
│                    │   │ - findShortestPath │   │                        │
│                    │   │ - getRelationsBy   │   │                        │
│                    │   │   Entity()         │   │                        │
└────────────────────┘   └────────────────────┘   └────────────────────────┘
             │                         │                        │
             ▼                         ▼                        ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│                           Infrastructure Layer                                │
│                    (SQLite/libSQL, Embedding API, LLM API)                   │
└──────────────────────────────────────────────────────────────────────────────┘
```

---

## クラス設計

### GraphSearchStrategy

```typescript
/**
 * グラフ検索戦略
 * Knowledge Graphを活用した検索機能を提供
 *
 * @implements ISearchStrategy
 */
export class GraphSearchStrategy implements ISearchStrategy {
  // ========================================
  // Properties
  // ========================================

  /** 戦略名（ISearchStrategy準拠） */
  readonly name = "graph";

  /** 最後の検索メトリクス */
  private lastMetric: StrategyMetric;

  // ========================================
  // Constructor
  // ========================================

  constructor(
    private readonly graphStore: IKnowledgeGraphStore,
    private readonly embeddingProvider: IEmbeddingProvider,
    private readonly communitySummarizer?: ICommunitySummarizer
  );

  // ========================================
  // Public Methods (ISearchStrategy)
  // ========================================

  /**
   * グラフ検索を実行
   * queryTypeに応じてlocal/global/relationshipSearchを呼び分ける
   */
  async search(
    query: string,
    limit: number,
    filters?: SearchFilters,
    options?: GraphSearchOptions
  ): Promise<Result<SearchResultItem[], Error>>;

  /**
   * 検索メトリクスを取得
   */
  getMetrics(): StrategyMetric;

  // ========================================
  // Private Search Methods
  // ========================================

  /**
   * ローカル検索（エンティティベース）
   */
  private async localSearch(
    query: string,
    limit: number,
    filters?: SearchFilters,
    options?: GraphSearchOptions
  ): Promise<Result<SearchResultItem[], Error>>;

  /**
   * グローバル検索（コミュニティサマリベース）
   */
  private async globalSearch(
    query: string,
    limit: number,
    filters?: SearchFilters,
    options?: GraphSearchOptions
  ): Promise<Result<SearchResultItem[], Error>>;

  /**
   * 関係検索（パスベース）
   */
  private async relationshipSearch(
    query: string,
    limit: number,
    filters?: SearchFilters,
    options?: GraphSearchOptions
  ): Promise<Result<SearchResultItem[], Error>>;

  // ========================================
  // Private Utility Methods
  // ========================================

  private validateInput(query: string, limit: number): Result<void, Error>;
  private async generateQueryEmbedding(query: string): Promise<Result<Float32Array, Error>>;
  private async extractQueryEntities(query: string, threshold: number): Promise<Result<EntityMatch[], Error>>;
  private async getEntityChunks(entityId: EntityId, filters?: SearchFilters): Promise<Result<ChunkInfo[], Error>>;
  private calculateLocalScore(entitySimilarity: number, chunkRelevance: number): number;
  private calculateGlobalScore(summarySimilarity: number): number;
  private calculatePathScore(pathDistance: number, chunkRelevance: number): number;
  private toSearchResultItem(item: GraphSearchResultInternal): SearchResultItem;
}
```

---

## 依存関係（DI設計）

### Constructor Injection

```typescript
// 依存インターフェース
interface Dependencies {
  graphStore: IKnowledgeGraphStore; // Required
  embeddingProvider: IEmbeddingProvider; // Required
  communitySummarizer?: ICommunitySummarizer; // Optional
}

// インスタンス化
const strategy = new GraphSearchStrategy(
  graphStore, // IKnowledgeGraphStore実装
  embeddingProvider, // IEmbeddingProvider実装
  communitySummarizer, // ICommunitySummarizer実装（オプション）
);
```

### 依存関係図

```
GraphSearchStrategy
       │
       ├──── [Required] IKnowledgeGraphStore
       │           │
       │           ├── findSimilarEntities(embedding, limit, threshold)
       │           ├── traverse(startId, options)
       │           ├── findShortestPath(fromId, toId)
       │           └── getRelationsByEntity(entityId)
       │
       ├──── [Required] IEmbeddingProvider
       │           │
       │           └── embed(text): { embedding: number[] }
       │
       └──── [Optional] ICommunitySummarizer
                   │
                   └── searchSummaries(query, options): CommunitySummary[]
```

---

## 設計パターン

### 1. Strategy Pattern

ISearchStrategyインターフェースを実装し、HybridSearchServiceで他の検索戦略と統一的に扱えるようにする。

```typescript
// HybridSearchService
class HybridSearchService {
  constructor(
    private strategies: ISearchStrategy[], // [keyword, semantic, graph]
  ) {}

  async search(query: string): Promise<SearchResult[]> {
    const results = await Promise.all(
      this.strategies.map((s) => s.search(query, limit, filters)),
    );
    return this.mergeWithRRF(results);
  }
}
```

### 2. Template Method Pattern

search()メソッドが共通フローを定義し、具体的な検索ロジックはサブメソッドに委譲。

```typescript
async search(query, limit, filters, options): Promise<Result<SearchResultItem[], Error>> {
  // 1. Validation (共通)
  const validation = this.validateInput(query, limit);
  if (validation.isErr()) return validation;

  // 2. Query Type Dispatch (Template)
  const queryType = options?.queryType ?? "local";
  switch (queryType) {
    case "local":
      return this.localSearch(query, limit, filters, options);
    case "global":
      return this.globalSearch(query, limit, filters, options);
    case "relationship":
      return this.relationshipSearch(query, limit, filters, options);
  }
}
```

### 3. Null Object Pattern

CommunitySummarizerがnullの場合、globalSearchはlocalSearchにフォールバック。

```typescript
private async globalSearch(...): Promise<Result<SearchResultItem[], Error>> {
  // CommunitySummarizerがない場合はlocalSearchにフォールバック
  if (!this.communitySummarizer) {
    return this.localSearch(query, limit, filters, options);
  }
  // ...
}
```

---

## エラーハンドリング設計

### Result型の使用

```typescript
// 成功時
return ok(results);

// エラー時
return err(
  new GraphSearchError("Entity not found", { code: "ENTITY_NOT_FOUND" }),
);
```

### エラー分類

| エラー種別      | エラーコード      | 対処         |
| --------------- | ----------------- | ------------ |
| ValidationError | VALIDATION_ERROR  | err()で返却  |
| EmbeddingError  | EMBEDDING_FAILED  | err()で返却  |
| GraphStoreError | GRAPH_STORE_ERROR | err()で返却  |
| SummarizerError | SUMMARIZER_ERROR  | err()で返却  |
| NoResultsFound  | -                 | ok([])で返却 |
| TimeoutError    | TIMEOUT           | err()で返却  |

---

## テスト設計考慮

### モック戦略

```typescript
// テスト用モック
const mockGraphStore: IKnowledgeGraphStore = {
  findSimilarEntities: vi.fn().mockResolvedValue(ok([...])),
  traverse: vi.fn().mockResolvedValue(ok({...})),
  findShortestPath: vi.fn().mockResolvedValue(ok([...])),
  getRelationsByEntity: vi.fn().mockResolvedValue(ok([...])),
};

const mockEmbeddingProvider: IEmbeddingProvider = {
  embed: vi.fn().mockResolvedValue({ embedding: [...] }),
};

const mockCommunitySummarizer: ICommunitySummarizer = {
  searchSummaries: vi.fn().mockResolvedValue(ok([...])),
};
```

---

## 変更履歴

| 日付       | 変更内容                |
| ---------- | ----------------------- |
| 2026-01-13 | 初版作成（Phase 2完了） |
