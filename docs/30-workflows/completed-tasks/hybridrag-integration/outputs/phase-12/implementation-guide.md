# HybridRAG Engine 実装ガイド

## メタ情報

| 項目       | 内容                  |
| ---------- | --------------------- |
| バージョン | 1.0.0                 |
| 作成日     | 2026-01-17            |
| 機能名     | hybridrag-integration |
| 対象       | CONV-07-07            |

---

# Part 1: 概念的説明

## 1.1 HybridRAGとは

HybridRAG（ハイブリッドRAG）は、複数の検索戦略を組み合わせて最適な検索結果を提供する統合検索エンジンです。

### 従来のRAGの課題

従来のRAG（Retrieval-Augmented Generation）システムは、単一の検索方式に依存していました：

- **キーワード検索のみ**: 同義語や関連概念を見逃す
- **セマンティック検索のみ**: 正確なキーワードマッチを逃す
- **グラフ検索のみ**: 関係性のないドキュメントを見逃す

### HybridRAGの解決策

HybridRAGは3つの検索戦略を組み合わせ、それぞれの長所を活かします：

```
┌─────────────────────────────────────────────────────────┐
│                    ユーザークエリ                        │
└─────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────┐
│              Stage 1: クエリ分類                         │
│  クエリの特性を分析し、最適な検索戦略の重みを決定        │
└─────────────────────────────────────────────────────────┘
                            │
          ┌─────────────────┼─────────────────┐
          ▼                 ▼                 ▼
┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
│ キーワード検索  │ │ セマンティック  │ │  グラフ検索     │
│ (BM25ベース)    │ │ (ベクトル類似度)│ │ (関係性探索)    │
└─────────────────┘ └─────────────────┘ └─────────────────┘
          │                 │                 │
          └─────────────────┼─────────────────┘
                            ▼
┌─────────────────────────────────────────────────────────┐
│              Stage 3a: RRF Fusion                        │
│  3つの検索結果を統合し、重み付きスコアを計算             │
└─────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────┐
│              Stage 3b: Reranking                         │
│  クエリとの関連性を再評価し、結果を並び替え              │
└─────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────┐
│              Stage 4: CRAG (オプション)                  │
│  結果の品質を評価し、必要に応じて補正・拡張              │
└─────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────┐
│                    最終検索結果                          │
└─────────────────────────────────────────────────────────┘
```

## 1.2 4ステージパイプライン

### Stage 1: クエリ分類（Query Classification）

ユーザーのクエリを分析し、4つのタイプに分類します：

| クエリタイプ | 特徴                         | 例                       |
| ------------ | ---------------------------- | ------------------------ |
| local        | 具体的な情報を求める         | 「TypeScriptの型安全性」 |
| global       | 全体像や概要を求める         | 「プロジェクト構造は？」 |
| relationship | エンティティ間の関係を求める | 「AとBの関係は？」       |
| hybrid       | 複合的な情報を求める         | 「設計パターンの適用例」 |

### Stage 2: トリプル検索（Triple Search）

3つの検索戦略を**並列**で実行します：

1. **キーワード検索**: 正確なキーワードマッチング
2. **セマンティック検索**: 意味的類似度に基づく検索
3. **グラフ検索**: 知識グラフを使用した関係性検索

### Stage 3a: RRF Fusion

Reciprocal Rank Fusion（RRF）アルゴリズムで結果を統合します：

```
score = Σ(weight_i / (k + rank_i))
```

- 各検索戦略の重みはクエリタイプによって動的に決定
- k=60（定数）で安定したスコア計算

### Stage 3b: Reranking

クロスエンコーダーモデル等を使用して、クエリと結果の関連性を再評価します。

### Stage 4: CRAG（オプション）

Corrective RAG（CRAG）が結果の品質を評価し、必要に応じて：

- **CORRECT**: 高品質な結果をそのまま使用
- **REFINE**: 結果をフィルタリング
- **AUGMENT**: Web検索等で結果を補強

## 1.3 なぜ複数の検索を組み合わせるのか

### 相補性

各検索戦略には得意分野があります：

| 検索戦略       | 得意                   | 苦手                 |
| -------------- | ---------------------- | -------------------- |
| キーワード     | 正確なマッチ、専門用語 | 同義語、意味的類似   |
| セマンティック | 意味的類似、同義語     | 正確なキーワード     |
| グラフ         | 関係性、コンテキスト   | 孤立したドキュメント |

### フォールバック

1つの検索が失敗しても、他の検索で結果を補完できます。

---

# Part 2: 技術的詳細

## 2.1 APIリファレンス

### HybridRAGEngine

```typescript
class HybridRAGEngine {
  constructor(
    queryClassifier: IQueryClassifier,
    searchStrategies: {
      keyword: ISearchStrategy;
      semantic: ISearchStrategy;
      graph: ISearchStrategy;
    },
    fusion: IFusionStrategy,
    reranker: IReranker,
    crag: ICorrectiveRAG | null,
    options?: HybridRAGOptions,
  );

  search(
    query: string,
    limit?: number, // デフォルト: 10, 最大: 100
    filters?: SearchFilters,
    searchOptions?: SearchOptions,
  ): Promise<Result<HybridRAGResponse, Error>>;
}
```

### HybridRAGFactory

```typescript
class HybridRAGFactory {
  // フル機能版（依存モジュール実装後に有効化）
  static createFull(config: FullHybridRAGConfig): HybridRAGEngine;

  // 軽量版（依存モジュール実装後に有効化）
  static createLite(config: LiteHybridRAGConfig): HybridRAGEngine;

  // テスト用（現在使用可能）
  static createForTesting(mocks: TestMocks): HybridRAGEngine;
}
```

## 2.2 型定義

### HybridRAGResponse

```typescript
interface HybridRAGResponse {
  results: HybridRAGResult[];
  metadata: {
    queryType: QueryType; // "local" | "global" | "relationship" | "hybrid"
    searchWeights: SearchWeights; // { keyword, semantic, graph }
    pipelineStages: PipelineStageResult[];
    totalDuration: number; // ミリ秒
    cragAction?: RelevanceAction; // "CORRECT" | "REFINE" | "AUGMENT"
  };
  augmentedContext?: string; // CRAGによる補強コンテキスト
}
```

### HybridRAGResult

```typescript
interface HybridRAGResult {
  chunkId: ChunkId;
  content: string;
  score: number; // 0.0-1.0
  sources: Array<{
    strategy: "keyword" | "semantic" | "graph";
    rank: number;
    score: number;
  }>;
  metadata: Record<string, unknown>;
}
```

### SearchOptions

```typescript
interface SearchOptions {
  enableCRAG?: boolean; // CRAG有効化
  searchLimitMultiplier?: number; // 検索結果数倍率（デフォルト: 3）
  vectorThreshold?: number; // ベクトル検索閾値
  graphDepth?: number; // グラフ探索深度
}
```

## 2.3 使用例

### 基本的な使用法

```typescript
import { HybridRAGFactory } from "@repo/shared/services/search";

// テスト用エンジンの作成
const engine = HybridRAGFactory.createForTesting({
  queryClassifier: mockClassifier,
  keywordStrategy: mockKeyword,
  semanticStrategy: mockSemantic,
  graphStrategy: mockGraph,
});

// 検索実行
const result = await engine.search("TypeScriptの型安全性について", 10);

if (result.success) {
  console.log("結果:", result.data.results);
  console.log("クエリタイプ:", result.data.metadata.queryType);
  console.log("処理時間:", result.data.metadata.totalDuration, "ms");
} else {
  console.error("エラー:", result.error);
}
```

### CRAGを有効にした検索

```typescript
const result = await engine.search(
  "TypeScriptの型安全性について",
  10,
  undefined,
  { enableCRAG: true },
);

if (result.success && result.data.augmentedContext) {
  console.log("補強コンテキスト:", result.data.augmentedContext);
}
```

### フィルター付き検索

```typescript
const result = await engine.search("APIエンドポイント", 20, {
  fileTypes: ["ts", "tsx"],
  dateRange: {
    start: new Date("2024-01-01"),
    end: new Date("2024-12-31"),
  },
});
```

## 2.4 設定オプション

### HybridRAGOptions

| オプション        | 型      | デフォルト | 説明                     |
| ----------------- | ------- | ---------- | ------------------------ |
| defaultEnableCRAG | boolean | true       | CRAGをデフォルトで有効化 |
| timeout           | number  | undefined  | タイムアウト（ミリ秒）   |

### SearchWeights（クエリタイプ別）

| クエリタイプ | keyword | semantic | graph |
| ------------ | ------- | -------- | ----- |
| local        | 0.2     | 0.6      | 0.2   |
| global       | 0.1     | 0.3      | 0.6   |
| relationship | 0.1     | 0.2      | 0.7   |
| hybrid       | 0.33    | 0.33     | 0.34  |

## 2.5 エラーハンドリング

### Result型

```typescript
type Result<T, E = Error> = Ok<T> | Err<E>;

// 成功チェック
if (result.success) {
  // result.data にアクセス可能
}

// エラーチェック
if (!result.success) {
  // result.error にアクセス可能
}
```

### フォールバック動作

| シナリオ            | 動作                        |
| ------------------- | --------------------------- |
| 1つの検索戦略が失敗 | 残りの戦略の結果で続行      |
| 2つの検索戦略が失敗 | 残りの1戦略の結果で続行     |
| 全検索戦略が失敗    | エラーを返す                |
| Rerankingが失敗     | Fusion結果をそのまま使用    |
| CRAGが失敗          | Reranking結果をそのまま使用 |

## 2.6 パフォーマンスチューニング

### 推奨設定

| 用途             | searchLimitMultiplier | enableCRAG | 期待レイテンシ |
| ---------------- | --------------------- | ---------- | -------------- |
| リアルタイム検索 | 2                     | false      | < 300ms        |
| 高精度検索       | 5                     | true       | < 1000ms       |
| バッチ処理       | 10                    | true       | 制限なし       |

### パイプラインステージ別目標

| ステージ      | 目標レイテンシ                           |
| ------------- | ---------------------------------------- |
| Triple Search | < 200ms                                  |
| RRF Fusion    | < 10ms                                   |
| Reranking     | < 200ms                                  |
| CRAG          | < 300ms                                  |
| **合計**      | < 500ms (CRAG無効) / < 1000ms (CRAG有効) |

---

## 付録A: インターフェース一覧

### IQueryClassifier

```typescript
interface IQueryClassifier {
  classify(query: string): Promise<Result<QueryClassification, Error>>;
  getSearchWeights(queryType: QueryType): SearchWeights;
}
```

### ISearchStrategy

```typescript
interface ISearchStrategy {
  readonly name: string;
  search(
    query: string,
    limit: number,
    filters?: SearchFilters,
  ): Promise<Result<SearchResultItem[], Error>>;
  getMetrics(): StrategyMetric;
}
```

### IFusionStrategy

```typescript
interface IFusionStrategy {
  fuse(
    resultSets: Map<string, SearchResult[]>,
    weights: SearchWeights,
  ): FusedSearchResult[];
}
```

### IReranker

```typescript
interface IReranker {
  rerank(
    query: string,
    results: FusedSearchResult[],
    limit: number,
  ): Promise<RerankerResult>;
}
```

### ICorrectiveRAG

```typescript
interface ICorrectiveRAG {
  process(
    query: string,
    results: FusedSearchResult[],
  ): Promise<Result<CRAGResult, Error>>;
}
```
