# RRF Fusion + Reranking - インターフェース定義

## メタ情報

| 項目       | 内容       |
| ---------- | ---------- |
| タスクID   | CONV-07-05 |
| フェーズ   | Phase 1    |
| 作成日     | 2026-01-13 |
| ステータス | 完了       |

---

## 1. 入力型定義

### 1.1 ResultSets（検索結果セット）

各検索戦略からの結果セットを格納するMap型。

```typescript
/**
 * 検索戦略ごとの結果セット
 * - key: 戦略名（"keyword" | "semantic" | "graph"）
 * - value: 検索結果配列
 */
type ResultSets = Map<"keyword" | "semantic" | "graph", SearchResult[]>;
```

### 1.2 SearchResult（個別検索結果）

各検索戦略から返される検索結果アイテム。

```typescript
/**
 * 検索結果アイテム（既存型）
 * 参照: packages/shared/src/types/rag/search/
 */
interface SearchResult {
  /** チャンク一意識別子 */
  chunkId: ChunkId;

  /** チャンクの本文コンテンツ */
  content: string;

  /** 検索スコア（戦略固有、0-1に正規化済み） */
  score: number;

  /** 検索元の戦略 */
  source: "keyword" | "semantic" | "graph";

  /** メタデータ（ファイル情報、位置情報等） */
  metadata: Record<string, unknown>;
}
```

### 1.3 SearchWeights（検索重み）

Query Classifierから提供される各戦略の重み。

```typescript
/**
 * 検索戦略の重み（合計1.0に制約）
 * 参照: packages/shared/src/services/search/types.ts
 */
interface SearchWeights {
  /** Keyword検索の重み（0-1） */
  keyword: number;

  /** Semantic検索の重み（0-1） */
  semantic: number;

  /** Graph検索の重み（0-1） */
  graph: number;
}
```

---

## 2. 出力型定義

### 2.1 FusedSearchResult（統合検索結果）

Fusionおよびリランキング後の検索結果。

```typescript
/**
 * 統合・リランキング済み検索結果
 */
interface FusedSearchResult {
  /** チャンク一意識別子 */
  chunkId: ChunkId;

  /** チャンクの本文コンテンツ */
  content: string;

  /** Fusion後のスコア（0-1に正規化） */
  fusedScore: number;

  /** リランキング後のスコア（オプション、0-1） */
  rerankedScore?: number;

  /**
   * 元の検索ソース情報
   * 複数戦略で出現した場合は複数エントリ
   */
  sources: Array<{
    /** 検索戦略 */
    strategy: "keyword" | "semantic" | "graph";

    /** 元の戦略内でのランク（1-indexed） */
    rank: number;

    /** 元の戦略でのスコア */
    score: number;
  }>;

  /** マージされたメタデータ */
  metadata: Record<string, unknown>;
}
```

---

## 3. Fusionインターフェース

### 3.1 IFusion（Fusion抽象インターフェース）

```typescript
/**
 * 検索結果統合のインターフェース
 */
interface IFusion {
  /**
   * 複数の検索結果を統合
   * @param resultSets 検索戦略ごとの結果セット
   * @param weights 各戦略の重み
   * @returns 統合後の検索結果（fusedScoreでソート済み）
   */
  fuse(
    resultSets: Map<string, SearchResult[]>,
    weights: SearchWeights,
  ): FusedSearchResult[];
}
```

### 3.2 RRFFusion

```typescript
/**
 * Reciprocal Rank Fusion (RRF) による検索結果統合
 *
 * RRFスコア計算式:
 * score(d) = Σ (weight_i / (k + rank_i(d)))
 *
 * @see https://plg.uwaterloo.ca/~gvcormac/cormacksigir09-rrf.pdf
 */
class RRFFusion implements IFusion {
  /**
   * RRFのkパラメータ
   * 大きいほどランキング差の影響が緩和される
   */
  private readonly k: number;

  /**
   * @param k RRFのkパラメータ（デフォルト: 60）
   */
  constructor(k?: number);

  /**
   * RRFアルゴリズムで検索結果を統合
   */
  fuse(
    resultSets: Map<string, SearchResult[]>,
    weights: SearchWeights,
  ): FusedSearchResult[];
}
```

### 3.3 WeightedScoreFusion

```typescript
/**
 * 重み付きスコア平均による検索結果統合
 *
 * 計算式:
 * fusedScore = Σ(score_i * weight_i) / Σ(weight_i)
 */
class WeightedScoreFusion implements IFusion {
  /**
   * 重み付きスコア平均で検索結果を統合
   */
  fuse(
    resultSets: Map<string, SearchResult[]>,
    weights: SearchWeights,
  ): FusedSearchResult[];
}
```

---

## 4. Rerankerインターフェース

### 4.1 IReranker

```typescript
/**
 * リランキングのインターフェース
 */
interface IReranker {
  /**
   * 検索結果をリランキング
   * @param query 検索クエリ
   * @param candidates 統合済み候補（FusedSearchResult[]）
   * @param limit 返却する最大件数
   * @returns リランキング後の結果（rerankedScoreでソート済み）
   */
  rerank(
    query: string,
    candidates: FusedSearchResult[],
    limit: number,
  ): Promise<Result<FusedSearchResult[], Error>>;
}
```

### 4.2 RerankerOptions

```typescript
/**
 * リランカーオプション
 */
interface RerankerOptions {
  /**
   * 候補数がlimit以下でも常にリランキングを実行するか
   * @default false
   */
  alwaysRerank?: boolean;

  /**
   * バッチサイズ（LLMReranker用）
   * @default 10
   */
  batchSize?: number;
}
```

### 4.3 LLMReranker

```typescript
/**
 * LLMベースのリランカー
 */
class LLMReranker implements IReranker {
  /**
   * @param llmClient LLMクライアント
   * @param options リランカーオプション
   */
  constructor(llmClient: ILLMClient, options?: RerankerOptions);

  rerank(
    query: string,
    candidates: FusedSearchResult[],
    limit: number,
  ): Promise<Result<FusedSearchResult[], Error>>;
}
```

### 4.4 CohereReranker

```typescript
/**
 * Cohere Rerank APIを使用したリランカー
 */
class CohereReranker implements IReranker {
  /**
   * @param apiKey Cohere APIキー
   * @param model 使用するモデル（デフォルト: "rerank-multilingual-v3.0"）
   */
  constructor(apiKey: string, model?: string);

  rerank(
    query: string,
    candidates: FusedSearchResult[],
    limit: number,
  ): Promise<Result<FusedSearchResult[], Error>>;
}
```

### 4.5 VoyageReranker

```typescript
/**
 * Voyage AI Rerank APIを使用したリランカー
 */
class VoyageReranker implements IReranker {
  /**
   * @param apiKey Voyage AI APIキー
   * @param model 使用するモデル（デフォルト: "rerank-2"）
   */
  constructor(apiKey: string, model?: string);

  rerank(
    query: string,
    candidates: FusedSearchResult[],
    limit: number,
  ): Promise<Result<FusedSearchResult[], Error>>;
}
```

### 4.6 NoOpReranker

```typescript
/**
 * No-Opリランカー（フォールバック用）
 * 順序を変更せずにlimitを適用
 */
class NoOpReranker implements IReranker {
  rerank(
    query: string,
    candidates: FusedSearchResult[],
    limit: number,
  ): Promise<Result<FusedSearchResult[], Error>>;
}
```

---

## 5. API レスポンス型

### 5.1 CohereRerankResponse

```typescript
/**
 * Cohere Rerank APIレスポンス
 */
interface CohereRerankResponse {
  results: Array<{
    /** 元の候補配列内のインデックス */
    index: number;

    /** 関連度スコア（0-1） */
    relevance_score: number;
  }>;
}
```

### 5.2 VoyageRerankResponse

```typescript
/**
 * Voyage AI Rerank APIレスポンス
 */
interface VoyageRerankResponse {
  data: Array<{
    /** 元の候補配列内のインデックス */
    index: number;

    /** 関連度スコア（0-1） */
    relevance_score: number;
  }>;
}
```

---

## 6. 外部API仕様

### 6.1 Cohere Rerank API

| 項目           | 仕様                                   |
| -------------- | -------------------------------------- |
| エンドポイント | `POST https://api.cohere.ai/v1/rerank` |
| 認証           | `Authorization: Bearer {API_KEY}`      |
| Content-Type   | `application/json`                     |

**リクエストボディ**:

```json
{
  "model": "rerank-multilingual-v3.0",
  "query": "検索クエリ",
  "documents": ["doc1 content", "doc2 content", ...],
  "top_n": 10,
  "return_documents": false
}
```

**レスポンス**:

```json
{
  "results": [
    { "index": 2, "relevance_score": 0.95 },
    { "index": 0, "relevance_score": 0.85 }
  ]
}
```

### 6.2 Voyage AI Rerank API

| 項目           | 仕様                                      |
| -------------- | ----------------------------------------- |
| エンドポイント | `POST https://api.voyageai.com/v1/rerank` |
| 認証           | `Authorization: Bearer {API_KEY}`         |
| Content-Type   | `application/json`                        |

**リクエストボディ**:

```json
{
  "model": "rerank-2",
  "query": "検索クエリ",
  "documents": ["doc1 content", "doc2 content", ...],
  "top_k": 10
}
```

**レスポンス**:

```json
{
  "data": [
    { "index": 1, "relevance_score": 0.92 },
    { "index": 0, "relevance_score": 0.88 }
  ]
}
```

---

## 7. ファイル配置

| 型/クラス           | ファイルパス                                                              |
| ------------------- | ------------------------------------------------------------------------- |
| FusedSearchResult   | `packages/shared/src/services/search/types.ts`                            |
| IFusion             | `packages/shared/src/services/search/fusion/types.ts`                     |
| RRFFusion           | `packages/shared/src/services/search/fusion/rrf-fusion.ts`                |
| WeightedScoreFusion | `packages/shared/src/services/search/fusion/rrf-fusion.ts`                |
| IReranker           | `packages/shared/src/services/search/reranking/types.ts`                  |
| LLMReranker         | `packages/shared/src/services/search/reranking/cross-encoder-reranker.ts` |
| CohereReranker      | `packages/shared/src/services/search/reranking/cross-encoder-reranker.ts` |
| VoyageReranker      | `packages/shared/src/services/search/reranking/cross-encoder-reranker.ts` |
| NoOpReranker        | `packages/shared/src/services/search/reranking/cross-encoder-reranker.ts` |

---

## 8. 依存型（既存）

| 型名          | 参照先                                         |
| ------------- | ---------------------------------------------- |
| ChunkId       | `packages/shared/src/types/branded.ts`         |
| Result        | `packages/shared/src/types/rag/result.ts`      |
| SearchWeights | `packages/shared/src/services/search/types.ts` |
| ILLMClient    | `packages/shared/src/services/llm/types.ts`    |

---

## 変更履歴

| 日付       | バージョン | 変更内容 |
| ---------- | ---------- | -------- |
| 2026-01-13 | 1.0.0      | 初版作成 |
