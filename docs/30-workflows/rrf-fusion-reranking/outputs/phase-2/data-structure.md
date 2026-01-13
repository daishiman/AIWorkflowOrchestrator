# RRF Fusion + Reranking - データ構造設計

## メタ情報

| 項目       | 内容       |
| ---------- | ---------- |
| タスクID   | CONV-07-05 |
| フェーズ   | Phase 2    |
| 作成日     | 2026-01-13 |
| ステータス | 完了       |

---

## 1. 主要データ型

### 1.1 FusedSearchResult

統合・リランキング済み検索結果の型定義。

```typescript
/**
 * 統合・リランキング済み検索結果
 */
interface FusedSearchResult {
  /**
   * チャンク一意識別子
   * @example "chunk_abc123"
   */
  chunkId: ChunkId;

  /**
   * チャンクの本文コンテンツ
   */
  content: string;

  /**
   * Fusion後のスコア（0-1に正規化）
   * RRFまたはWeightedScoreで計算
   */
  fusedScore: number;

  /**
   * リランキング後のスコア（オプション）
   * リランキング実行時のみ設定
   */
  rerankedScore?: number;

  /**
   * 元の検索ソース情報
   * 複数戦略で出現した場合は複数エントリ
   */
  sources: Array<{
    /**
     * 検索戦略
     */
    strategy: "keyword" | "semantic" | "graph";

    /**
     * 元の戦略内でのランク（1-indexed）
     */
    rank: number;

    /**
     * 元の戦略でのスコア
     */
    score: number;
  }>;

  /**
   * マージされたメタデータ
   * 各戦略からのメタデータを統合
   */
  metadata: Record<string, unknown>;
}
```

**フィールド詳細**:

| フィールド    | 型           | 必須 | 説明                           |
| ------------- | ------------ | ---- | ------------------------------ |
| chunkId       | ChunkId      | Yes  | チャンク識別子                 |
| content       | string       | Yes  | チャンク本文                   |
| fusedScore    | number       | Yes  | 統合スコア（0-1）              |
| rerankedScore | number       | No   | リランクスコア（0-1）          |
| sources       | SourceInfo[] | Yes  | ソース情報配列（1件以上）      |
| metadata      | Record       | Yes  | メタデータ（空オブジェクト可） |

### 1.2 SearchResult（入力型・既存）

各検索戦略からの入力となる検索結果。

```typescript
/**
 * 検索結果アイテム（既存型）
 * 参照: packages/shared/src/services/search/types.ts
 */
interface SearchResult {
  /**
   * チャンク一意識別子
   */
  chunkId: ChunkId;

  /**
   * チャンクの本文コンテンツ
   */
  content: string;

  /**
   * 検索スコア（戦略固有、通常0-1に正規化済み）
   */
  score: number;

  /**
   * 検索元の戦略
   */
  source: "keyword" | "semantic" | "graph";

  /**
   * メタデータ（ファイル情報、位置情報等）
   */
  metadata: Record<string, unknown>;
}
```

### 1.3 SearchWeights（入力型・既存）

Query Classifierから提供される各戦略の重み。

```typescript
/**
 * 検索戦略の重み
 * 参照: packages/shared/src/services/search/types.ts
 */
interface SearchWeights {
  /**
   * Keyword検索の重み（0-1）
   */
  keyword: number;

  /**
   * Semantic検索の重み（0-1）
   */
  semantic: number;

  /**
   * Graph検索の重み（0-1）
   */
  graph: number;
}
```

**制約**:

- `keyword + semantic + graph = 1.0`（合計が1.0）
- 各値は `0 <= value <= 1`

---

## 2. オプション型

### 2.1 RerankerOptions

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

**デフォルト値**:

| オプション   | デフォルト | 説明                          |
| ------------ | ---------- | ----------------------------- |
| alwaysRerank | false      | 候補数<=limit時のスキップ制御 |
| batchSize    | 10         | LLMへの1回あたりの送信件数    |

### 2.2 RRFFusionOptions（将来拡張用）

```typescript
/**
 * RRFFusion設定オプション（将来拡張用）
 */
interface RRFFusionOptions {
  /**
   * RRFのkパラメータ
   * @default 60
   */
  k?: number;

  /**
   * スコアの正規化を行うか
   * @default true
   */
  normalizeScores?: boolean;
}
```

---

## 3. 外部APIレスポンス型

### 3.1 CohereRerankResponse

```typescript
/**
 * Cohere Rerank APIレスポンス
 */
interface CohereRerankResponse {
  /**
   * リランキング結果
   */
  results: Array<{
    /**
     * 元の候補配列内のインデックス（0-indexed）
     */
    index: number;

    /**
     * 関連度スコア（0-1）
     */
    relevance_score: number;
  }>;
}
```

**レスポンス例**:

```json
{
  "results": [
    { "index": 2, "relevance_score": 0.95 },
    { "index": 0, "relevance_score": 0.85 },
    { "index": 1, "relevance_score": 0.75 }
  ]
}
```

### 3.2 VoyageRerankResponse

```typescript
/**
 * Voyage AI Rerank APIレスポンス
 */
interface VoyageRerankResponse {
  /**
   * リランキング結果
   */
  data: Array<{
    /**
     * 元の候補配列内のインデックス（0-indexed）
     */
    index: number;

    /**
     * 関連度スコア（0-1）
     */
    relevance_score: number;
  }>;
}
```

**レスポンス例**:

```json
{
  "data": [
    { "index": 1, "relevance_score": 0.92 },
    { "index": 0, "relevance_score": 0.88 }
  ]
}
```

---

## 4. 内部データ構造

### 4.1 RRF計算用中間データ

```typescript
/**
 * RRFスコア計算用の中間データ構造
 * Map<chunkId, IntermediateResult>として使用
 */
interface RRFIntermediateResult {
  chunkId: ChunkId;
  content: string;
  rrfScore: number; // 累積RRFスコア
  sources: Array<{
    strategy: string;
    rank: number;
    score: number;
  }>;
  metadata: Record<string, unknown>;
}
```

### 4.2 WeightedScore計算用中間データ

```typescript
/**
 * WeightedScore計算用の中間データ構造
 */
interface WeightedIntermediateResult {
  chunkId: ChunkId;
  content: string;
  weightedScore: number; // 累積重み付きスコア
  totalWeight: number; // 累積重み
  sources: Array<{
    strategy: string;
    rank: number;
    score: number;
  }>;
  metadata: Record<string, unknown>;
}
```

---

## 5. データ変換フロー

### 5.1 Fusion変換

```
入力:
  Map<string, SearchResult[]>
    - "keyword"  → SearchResult[]
    - "semantic" → SearchResult[]
    - "graph"    → SearchResult[]

中間:
  Map<ChunkId, IntermediateResult>
    - 重複チャンクをマージ
    - ソース情報を集約
    - スコアを累積

出力:
  FusedSearchResult[]
    - ソート済み
    - 正規化済み
```

### 5.2 Reranking変換

```
入力:
  FusedSearchResult[] (fusedScore設定済み)

処理:
  1. 外部APIまたはLLMでスコアリング
  2. rerankedScoreを設定
  3. rerankedScoreでソート
  4. limit件に切り詰め

出力:
  FusedSearchResult[] (rerankedScore設定済み)
```

---

## 6. Zodバリデーションスキーマ

### 6.1 FusedSearchResultスキーマ

```typescript
import { z } from "zod";

const SourceInfoSchema = z.object({
  strategy: z.enum(["keyword", "semantic", "graph"]),
  rank: z.number().int().positive(),
  score: z.number().min(0).max(1),
});

const FusedSearchResultSchema = z.object({
  chunkId: z.string().min(1),
  content: z.string(),
  fusedScore: z.number().min(0).max(1),
  rerankedScore: z.number().min(0).max(1).optional(),
  sources: z.array(SourceInfoSchema).min(1),
  metadata: z.record(z.unknown()),
});
```

### 6.2 SearchWeightsスキーマ

```typescript
const SearchWeightsSchema = z
  .object({
    keyword: z.number().min(0).max(1),
    semantic: z.number().min(0).max(1),
    graph: z.number().min(0).max(1),
  })
  .refine(
    (data) => Math.abs(data.keyword + data.semantic + data.graph - 1) < 0.001,
    { message: "Weights must sum to 1.0" },
  );
```

---

## 7. メモリレイアウト

### 7.1 典型的なデータサイズ

| データ構造        | 典型的サイズ | 備考                       |
| ----------------- | ------------ | -------------------------- |
| SearchResult      | 2-10 KB      | content長に依存            |
| FusedSearchResult | 3-15 KB      | sources数に依存            |
| ResultSets (入力) | 60-300 KB    | 各戦略20件×3戦略           |
| 中間Map           | 20-100 KB    | マージ後のユニーク数に依存 |
| 最終結果          | 30-150 KB    | limit件数に依存            |

### 7.2 メモリ最適化戦略

| 戦略             | 説明                                      |
| ---------------- | ----------------------------------------- |
| インプレース操作 | 可能な限り新規オブジェクトの生成を避ける  |
| 参照の共有       | content文字列は参照をコピーし重複を避ける |
| 早期切り詰め     | ソート後、limit件のみを処理対象とする     |

---

## 変更履歴

| 日付       | バージョン | 変更内容 |
| ---------- | ---------- | -------- |
| 2026-01-13 | 1.0.0      | 初版作成 |
