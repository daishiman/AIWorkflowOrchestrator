# HybridRAG統合 - インターフェース設計書

## メタ情報

| 項目       | 内容          |
| ---------- | ------------- |
| タスクID   | CONV-07-07    |
| タスク名   | HybridRAG統合 |
| Phase      | 2             |
| 作成日     | 2026-01-17    |
| ステータス | 完了          |

---

## 1. 出力型定義

### 1.1 HybridRAGResponse

検索の最終レスポンス型。

```typescript
/**
 * HybridRAG検索のレスポンス
 */
export interface HybridRAGResponse {
  /** 最終検索結果 */
  results: HybridRAGResult[];

  /** パイプライン実行メタデータ */
  metadata: {
    /** クエリタイプ（local/global/relationship/hybrid） */
    queryType: QueryType;

    /** 検索戦略の重み */
    searchWeights: SearchWeights;

    /** 各パイプラインステージの実行結果 */
    pipelineStages: PipelineStageResult[];

    /** 全体の処理時間（ミリ秒） */
    totalDuration: number;

    /** CRAGの評価アクション（オプション） */
    cragAction?: "correct" | "incorrect" | "ambiguous";
  };

  /** 拡張コンテキスト（CRAGによるWeb検索結果等） */
  augmentedContext?: string;
}
```

### 1.2 HybridRAGResult

個別の検索結果アイテム。

```typescript
/**
 * 検索結果アイテム
 */
export interface HybridRAGResult {
  /** チャンクID */
  chunkId: ChunkId;

  /** コンテンツ本文 */
  content: string;

  /** 総合スコア（0.0-1.0） */
  score: number;

  /** ソース情報（どの検索戦略から来たか） */
  sources: Array<{
    /** 検索戦略 */
    strategy: "keyword" | "semantic" | "graph";
    /** 元のランク順位 */
    rank: number;
    /** 元のスコア */
    score: number;
  }>;

  /** メタデータ */
  metadata: Record<string, unknown>;
}
```

### 1.3 PipelineStageResult

各パイプラインステージの実行結果。

```typescript
/**
 * パイプラインステージの実行結果
 */
export interface PipelineStageResult {
  /** ステージ名 */
  stage:
    | "query_classification"
    | "triple_search"
    | "rrf_fusion"
    | "reranking"
    | "crag";

  /** 実行時間（ミリ秒） */
  duration: number;

  /** 入力件数 */
  inputCount: number;

  /** 出力件数 */
  outputCount: number;
}
```

---

## 2. 入力型定義

### 2.1 SearchOptions

検索オプション。

```typescript
/**
 * HybridRAG検索オプション
 */
export interface SearchOptions {
  /**
   * CRAGを有効にするか
   * @default undefined (Engineの設定に従う)
   */
  enableCRAG?: boolean;

  /**
   * 各検索戦略の結果数倍率
   * 最終結果数 × 倍率 = 各戦略の取得数
   * @default 3
   */
  searchLimitMultiplier?: number;

  /**
   * ベクトル検索の類似度閾値
   * @default undefined (戦略のデフォルトに従う)
   */
  vectorThreshold?: number;

  /**
   * グラフ検索のトラバーサル深度
   * @default undefined (戦略のデフォルトに従う)
   */
  graphDepth?: number;
}
```

### 2.2 SearchFilters

検索フィルター（既存型を使用）。

```typescript
/**
 * 検索フィルター（既存インターフェース）
 * packages/shared/src/services/search/types.tsで定義
 */
export interface SearchFilters {
  /** ファイルIDフィルタ */
  fileIds?: FileId[];

  /** ファイルタイプフィルタ */
  fileTypes?: string[];

  /** ワークスペースIDフィルタ */
  workspaceIds?: WorkspaceId[];

  /** 日付範囲フィルタ */
  dateRange?: {
    from?: Date;
    to?: Date;
  };
}
```

### 2.3 HybridRAGOptions

HybridRAGEngineのオプション。

```typescript
/**
 * HybridRAGEngineの設定オプション
 */
export interface HybridRAGOptions {
  /**
   * デフォルトでCRAGを有効にするか
   * @default true (cragが設定されている場合)
   */
  defaultEnableCRAG?: boolean;

  /**
   * タイムアウト（ミリ秒）
   * @default undefined (タイムアウトなし)
   */
  timeout?: number;
}
```

---

## 3. コンストラクタインターフェース

### 3.1 HybridRAGEngine Constructor

```typescript
/**
 * HybridRAGEngine コンストラクタ
 */
constructor(
  /** クエリ分類器 */
  private readonly queryClassifier: QueryClassifier,

  /** 検索戦略 */
  private readonly searchStrategies: {
    keyword: ISearchStrategy;
    semantic: ISearchStrategy;
    graph: ISearchStrategy;
  },

  /** RRF Fusion */
  private readonly fusion: RRFFusion,

  /** リランカー */
  private readonly reranker: IReranker,

  /** Corrective RAG（オプション） */
  private readonly crag: CorrectiveRAG | null,

  /** エンジンオプション */
  private readonly options: HybridRAGOptions = {}
)
```

---

## 4. メソッドインターフェース

### 4.1 search()

メインの検索メソッド。

```typescript
/**
 * HybridRAG検索を実行
 *
 * @param query - 検索クエリ文字列
 * @param limit - 最大結果数（デフォルト: 10）
 * @param filters - 検索フィルター（オプション）
 * @param searchOptions - 検索オプション（オプション）
 * @returns 検索結果またはエラー
 */
async search(
  query: string,
  limit?: number,
  filters?: SearchFilters,
  searchOptions?: SearchOptions
): Promise<Result<HybridRAGResponse, Error>>
```

**戻り値の型**:

- 成功時: `{ success: true, data: HybridRAGResponse }`
- 失敗時: `{ success: false, error: Error }`

---

## 5. 依存インターフェース

### 5.1 QueryClassifier

```typescript
interface QueryClassifier {
  /**
   * クエリを分類
   * @param query - 検索クエリ
   * @returns 分類結果（queryType, weights）
   */
  classify(query: string): Promise<
    Result<
      {
        queryType: QueryType;
        weights: SearchWeights;
      },
      Error
    >
  >;
}

type QueryType = "local" | "global" | "relationship" | "hybrid";

interface SearchWeights {
  keyword: number; // 0.0-1.0
  semantic: number; // 0.0-1.0
  graph: number; // 0.0-1.0
  // 合計 = 1.0
}
```

### 5.2 ISearchStrategy

```typescript
interface ISearchStrategy {
  /** 戦略名 */
  readonly name: string;

  /**
   * 検索を実行
   * @param query - 検索クエリ
   * @param limit - 最大結果数
   * @param filters - フィルター
   * @param options - 追加オプション
   */
  search(
    query: string,
    limit: number,
    filters?: SearchFilters,
    options?: Record<string, unknown>,
  ): Promise<Result<SearchResultItem[], Error>>;
}
```

### 5.3 RRFFusion

```typescript
interface RRFFusion {
  /**
   * 検索結果を統合
   * @param resultSets - 各戦略の検索結果
   * @param weights - 検索重み
   */
  fuse(
    resultSets: Map<string, SearchResult[]>,
    weights: SearchWeights,
  ): FusedSearchResult[];
}

interface FusedSearchResult {
  chunkId: ChunkId;
  content: string;
  fusedScore: number;
  rerankedScore?: number;
  sources: Array<{
    strategy: string;
    rank: number;
    score: number;
  }>;
  metadata: Record<string, unknown>;
}
```

### 5.4 IReranker

```typescript
interface IReranker {
  /**
   * 再ランキングを実行
   * @param query - 検索クエリ
   * @param results - 統合済み検索結果
   * @param limit - 最大結果数
   */
  rerank(
    query: string,
    results: FusedSearchResult[],
    limit: number,
  ): Promise<Result<FusedSearchResult[], Error>>;
}
```

### 5.5 CorrectiveRAG

```typescript
interface CorrectiveRAG {
  /**
   * 検索結果を評価・補正
   * @param query - 検索クエリ
   * @param results - リランキング済み検索結果
   */
  process(
    query: string,
    results: FusedSearchResult[],
  ): Promise<Result<CRAGResult, Error>>;
}

interface CRAGResult {
  results: FusedSearchResult[];
  evaluation: {
    relevanceScore: number;
    action: "correct" | "incorrect" | "ambiguous";
    corrections: CorrectionAction[];
  };
  augmentedContext?: string;
}
```

---

## 6. 統合ポイントの契約定義

| 統合ポイント              | 入力                                   | 出力                                  |
| ------------------------- | -------------------------------------- | ------------------------------------- |
| QueryClassifier → Engine  | `query: string`                        | `Result<{queryType, weights}, Error>` |
| Engine → SearchStrategies | `query, limit, filters, options`       | `Result<SearchResultItem[], Error>`   |
| SearchStrategies → Fusion | `Map<string, SearchResult[]>, weights` | `FusedSearchResult[]`                 |
| Fusion → Reranker         | `query, FusedSearchResult[], limit`    | `Result<FusedSearchResult[], Error>`  |
| Reranker → CRAG           | `query, FusedSearchResult[]`           | `Result<CRAGResult, Error>`           |

---

## 7. 型エクスポート一覧

```typescript
// packages/shared/src/services/search/index.ts に追加

// HybridRAG Engine
export {
  HybridRAGEngine,
  type HybridRAGOptions,
  type SearchOptions,
  type HybridRAGResponse,
  type HybridRAGResult,
  type PipelineStageResult,
} from "./hybrid-rag-engine";

// HybridRAG Factory
export {
  HybridRAGFactory,
  type FullHybridRAGConfig,
  type LiteHybridRAGConfig,
  type TestMocks,
} from "./hybrid-rag-factory";
```

---

## 8. 変更履歴

| 日付       | 版  | 変更内容 |
| ---------- | --- | -------- |
| 2026-01-17 | 1.0 | 初版作成 |
