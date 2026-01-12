# Phase 2: クラス設計書

## 目的

VectorSearchStrategyのクラス構造、依存関係、データフローを設計する。

---

## 1. ISearchStrategy インターフェース定義

**新規作成**: `packages/shared/src/services/search/strategies/types.ts`

```typescript
import type { Result } from "@repo/shared/types/rag/result";
import type {
  SearchResultItem,
  SearchFilters,
  StrategyMetric,
} from "@repo/shared/types/rag/search/types";

/**
 * 検索戦略インターフェース
 * Keyword/Semantic/Graph検索の共通インターフェース
 */
export interface ISearchStrategy {
  /**
   * 戦略名（"keyword" | "semantic" | "graph"）
   */
  readonly name: string;

  /**
   * 検索を実行する
   *
   * @param query - 検索クエリテキスト
   * @param limit - 最大取得件数
   * @param filters - 検索フィルター（オプション）
   * @returns 検索結果アイテムの配列
   */
  search(
    query: string,
    limit: number,
    filters?: SearchFilters,
  ): Promise<Result<SearchResultItem[], Error>>;

  /**
   * 戦略のメトリクスを取得する
   */
  getMetrics(): StrategyMetric;
}
```

---

## 2. VectorSearchStrategy クラス設計

**ファイル**: `packages/shared/src/services/search/strategies/vector-search-strategy.ts`

### クラス図

```typescript
/**
 * ベクトル検索戦略
 * libSQLのDiskANNベクトルインデックスを使用したセマンティック検索
 */
export class VectorSearchStrategy implements ISearchStrategy {
  // ========================================
  // プロパティ
  // ========================================

  /** 戦略名 */
  readonly name = "semantic";

  /** 最後の検索メトリクス */
  private lastMetric: StrategyMetric = {
    enabled: true,
    resultCount: 0,
    processingTime: 0,
    topScore: 0,
  };

  // ========================================
  // コンストラクタ
  // ========================================

  constructor(
    private readonly db: LibSQLDatabase<Record<string, never>>,
    private readonly embeddingProvider: IEmbeddingProvider,
  ) {}

  // ========================================
  // パブリックメソッド
  // ========================================

  /**
   * ベクトル検索を実行
   */
  async search(
    query: string,
    limit: number,
    filters?: SearchFilters,
  ): Promise<Result<SearchResultItem[], Error>>;

  /**
   * メトリクスを取得
   */
  getMetrics(): StrategyMetric;

  // ========================================
  // プライベートメソッド
  // ========================================

  /**
   * クエリ埋め込みを生成
   */
  private async generateQueryEmbedding(
    query: string,
  ): Promise<Result<Float32Array, Error>>;

  /**
   * ベクトル検索を実行
   */
  private async executeVectorSearch(
    queryVector: Float32Array,
    limit: number,
    filters?: SearchFilters,
  ): Promise<VectorSearchResult[]>;

  /**
   * VectorSearchResult → SearchResultItem 変換
   */
  private toSearchResultItem(result: VectorSearchResult): SearchResultItem;

  /**
   * 入力バリデーション
   */
  private validateInput(query: string, limit: number): Result<void, Error>;
}
```

---

## 3. 依存関係図

```
┌─────────────────────────────────────────────────────────────────┐
│                    VectorSearchStrategy                          │
│                 implements ISearchStrategy                       │
└─────────────────────────┬───────────────────────────────────────┘
                          │
          ┌───────────────┼───────────────┐
          │               │               │
          ▼               ▼               ▼
┌─────────────────┐ ┌─────────────────┐ ┌─────────────────────────┐
│ IEmbeddingProvider│ │LibSQLDatabase│ │ searchByVector()      │
│                 │ │               │ │ (db/queries/vector-search)|
│ - embed()       │ │ - all()       │ │                         │
│ - dimensions    │ │               │ │ - VectorSearchResult    │
└─────────────────┘ └─────────────────┘ └─────────────────────────┘
                                                  │
                                                  ▼
                                        ┌─────────────────┐
                                        │ embeddings table│
                                        │ + chunks table  │
                                        └─────────────────┘
```

---

## 4. データフロー図

```
┌─────────────────────────────────────────────────────────────────────────┐
│                            search() メソッド                              │
└─────────────────────────────────────────────────────────────────────────┘
                                   │
                                   ▼
┌─────────────────────────────────────────────────────────────────────────┐
│ 1. 入力バリデーション                                                    │
│    - query: 1-1000文字                                                   │
│    - limit: 1-100                                                        │
└─────────────────────────────────────────────────────────────────────────┘
                                   │
                                   ▼
┌─────────────────────────────────────────────────────────────────────────┐
│ 2. クエリ埋め込み生成                                                    │
│    - IEmbeddingProvider.embed(query)                                    │
│    - number[] → Float32Array 変換                                        │
└─────────────────────────────────────────────────────────────────────────┘
                                   │
                                   ▼
┌─────────────────────────────────────────────────────────────────────────┐
│ 3. ベクトル検索実行                                                      │
│    - searchByVector(db, queryVector, options)                           │
│    - フィルター適用（fileIds, minSimilarity）                            │
└─────────────────────────────────────────────────────────────────────────┘
                                   │
                                   ▼
┌─────────────────────────────────────────────────────────────────────────┐
│ 4. 結果変換                                                              │
│    - VectorSearchResult[] → SearchResultItem[]                          │
│    - メトリクス更新                                                      │
└─────────────────────────────────────────────────────────────────────────┘
                                   │
                                   ▼
┌─────────────────────────────────────────────────────────────────────────┐
│ 5. Result<SearchResultItem[], Error> を返す                             │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 5. 型定義

### 依存する外部型

```typescript
// @repo/shared/db/queries/vector-search
import type {
  VectorSearchResult,
  VectorSearchOptions,
} from "@repo/shared/db/queries/vector-search";

// @repo/shared/services/embedding
import type { IEmbeddingProvider } from "@repo/shared/services/embedding/providers/interfaces";

// @repo/shared/types/rag/search
import type {
  SearchResultItem,
  SearchFilters,
  SearchResultContent,
  SearchResultSources,
  RelevanceScore,
  StrategyMetric,
} from "@repo/shared/types/rag/search/types";

// drizzle-orm
import type { LibSQLDatabase } from "drizzle-orm/libsql";
```

### 内部型定義

```typescript
/**
 * VectorSearchStrategy専用オプション
 */
export interface VectorSearchStrategyOptions {
  /** デフォルト類似度閾値（0.0-1.0） */
  defaultMinSimilarity?: number;
}

/**
 * VectorSearchStrategyの依存関係
 */
export interface VectorSearchStrategyDependencies {
  db: LibSQLDatabase<Record<string, never>>;
  embeddingProvider: IEmbeddingProvider;
  options?: VectorSearchStrategyOptions;
}
```

---

## 6. ファイル構成

```
packages/shared/src/services/search/strategies/
├── index.ts                          # エクスポート
├── types.ts                          # ISearchStrategy, 共通型
├── vector-search-strategy.ts         # VectorSearchStrategy
├── cached-vector-search-strategy.ts  # CachedVectorSearchStrategy
└── __tests__/
    ├── vector-search-strategy.test.ts
    ├── vector-search-strategy.integration.test.ts
    └── cached-vector-search-strategy.test.ts
```

---

## 7. 設計上の決定事項

| 項目               | 決定                            | 理由                 |
| ------------------ | ------------------------------- | -------------------- |
| 埋め込み生成       | embed()使用（embedBatchでない） | 単一クエリのため     |
| ベクトル検索       | searchByVector()を再利用        | 既存実装を活用       |
| フィルター         | SearchFiltersを使用             | 統一インターフェース |
| 結果変換           | 専用メソッドで変換              | テスタビリティ向上   |
| エラーハンドリング | Result型を使用                  | 例外を使わない設計   |

---

## まとめ

| 項目                 | 状態     | ファイル                             |
| -------------------- | -------- | ------------------------------------ |
| ISearchStrategy      | 新規定義 | strategies/types.ts                  |
| VectorSearchStrategy | 新規作成 | strategies/vector-search-strategy.ts |
| 依存関係             | 定義済み | IEmbeddingProvider, LibSQLDatabase   |
| データフロー         | 設計済み | search() → 変換 → 結果               |
