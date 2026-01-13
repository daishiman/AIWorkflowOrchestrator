# RRF Fusion + Reranking - クラス設計

## メタ情報

| 項目       | 内容       |
| ---------- | ---------- |
| タスクID   | CONV-07-05 |
| フェーズ   | Phase 2    |
| 作成日     | 2026-01-13 |
| ステータス | 完了       |

---

## 1. クラス図

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              Class Diagram                                   │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                        <<interface>>                                   │  │
│  │                       IFusionStrategy                                  │  │
│  ├───────────────────────────────────────────────────────────────────────┤  │
│  │  + fuse(resultSets: Map<string, SearchResult[]>,                      │  │
│  │         weights: SearchWeights): FusedSearchResult[]                  │  │
│  └───────────────────────────────────┬───────────────────────────────────┘  │
│                                      │                                       │
│            ┌─────────────────────────┴─────────────────────────┐            │
│            ▼                                                   ▼            │
│  ┌─────────────────────────────┐            ┌─────────────────────────────┐│
│  │       RRFFusion             │            │   WeightedScoreFusion       ││
│  ├─────────────────────────────┤            ├─────────────────────────────┤│
│  │ - k: number                 │            │                             ││
│  ├─────────────────────────────┤            ├─────────────────────────────┤│
│  │ + constructor(k?: number)   │            │ + fuse(...)                 ││
│  │ + fuse(...)                 │            │ - getWeight(...)            ││
│  │ - getWeight(...)            │            └─────────────────────────────┘│
│  │ - normalizeScore(...)       │                                           │
│  └─────────────────────────────┘                                           │
│                                                                              │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                        <<interface>>                                   │  │
│  │                         IReranker                                      │  │
│  ├───────────────────────────────────────────────────────────────────────┤  │
│  │  + rerank(query: string, candidates: FusedSearchResult[],             │  │
│  │           limit: number): Promise<Result<FusedSearchResult[], Error>> │  │
│  └───────────────────────────────────┬───────────────────────────────────┘  │
│                                      │                                       │
│     ┌──────────────┬─────────────────┼─────────────────┬──────────────┐     │
│     ▼              ▼                 ▼                 ▼              ▼     │
│ ┌─────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌───────┐ │
│ │ LLM     │  │  Cohere     │  │  Voyage     │  │   NoOp      │  │Future │ │
│ │ Reranker│  │  Reranker   │  │  Reranker   │  │  Reranker   │  │Reranker│ │
│ └─────────┘  └─────────────┘  └─────────────┘  └─────────────┘  └───────┘ │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Fusionクラス詳細

### 2.1 IFusionStrategy インターフェース

```typescript
/**
 * 検索結果統合戦略のインターフェース
 */
interface IFusionStrategy {
  /**
   * 複数の検索戦略からの結果を統合
   * @param resultSets 戦略名をキーとした検索結果のMap
   * @param weights 各戦略の重み
   * @returns 統合後の検索結果（fusedScoreでソート済み）
   */
  fuse(
    resultSets: Map<string, SearchResult[]>,
    weights: SearchWeights,
  ): FusedSearchResult[];
}
```

### 2.2 RRFFusion クラス

```typescript
/**
 * Reciprocal Rank Fusion (RRF) による検索結果統合
 *
 * RRFスコア計算式:
 * score(d) = Σ (weight_i / (k + rank_i(d)))
 *
 * @see https://plg.uwaterloo.ca/~gvcormac/cormacksigir09-rrf.pdf
 */
class RRFFusion implements IFusionStrategy {
  /**
   * RRFのkパラメータ
   * 大きいほどランキング差の影響が緩和される
   * @default 60
   */
  private readonly k: number;

  /**
   * コンストラクタ
   * @param k RRFのkパラメータ（デフォルト: 60）
   */
  constructor(k: number = 60) {
    this.k = k;
  }

  /**
   * RRFアルゴリズムで検索結果を統合
   * @param resultSets 検索戦略ごとの結果セット
   * @param weights 各戦略の重み
   * @returns 統合後の検索結果
   */
  fuse(
    resultSets: Map<string, SearchResult[]>,
    weights: SearchWeights,
  ): FusedSearchResult[] {
    // 実装詳細は Phase 5 で記述
  }

  /**
   * 戦略名から重みを取得
   * @param strategy 戦略名
   * @param weights 重み設定
   * @returns 対応する重み値
   */
  private getWeight(strategy: string, weights: SearchWeights): number {
    // 実装詳細は Phase 5 で記述
  }

  /**
   * RRFスコアを0-1に正規化
   * @param rrfScore 生のRRFスコア
   * @returns 正規化されたスコア（0-1）
   */
  private normalizeScore(rrfScore: number): number {
    // 理論最大値: 3 * (1 / (k + 1)) when all strategies rank #1
    const theoreticalMax = 3 / (this.k + 1);
    return Math.min(1, rrfScore / theoreticalMax);
  }
}
```

**クラス責務**:

| 責務         | 説明                                        |
| ------------ | ------------------------------------------- |
| スコア計算   | RRFアルゴリズムでスコアを計算               |
| 重複マージ   | 同一チャンクを1つにマージしソース情報を集約 |
| スコア正規化 | 0-1の範囲にスコアを正規化                   |
| ソート       | fusedScore降順でソート                      |

### 2.3 WeightedScoreFusion クラス

```typescript
/**
 * 重み付きスコア平均による検索結果統合
 *
 * 計算式:
 * fusedScore = Σ(score_i * weight_i) / Σ(weight_i)
 */
class WeightedScoreFusion implements IFusionStrategy {
  /**
   * 重み付きスコア平均で検索結果を統合
   * @param resultSets 検索戦略ごとの結果セット
   * @param weights 各戦略の重み
   * @returns 統合後の検索結果
   */
  fuse(
    resultSets: Map<string, SearchResult[]>,
    weights: SearchWeights,
  ): FusedSearchResult[] {
    // 実装詳細は Phase 5 で記述
  }

  /**
   * 戦略名から重みを取得
   * @param strategy 戦略名
   * @param weights 重み設定
   * @returns 対応する重み値
   */
  private getWeight(strategy: string, weights: SearchWeights): number {
    // 実装詳細は Phase 5 で記述
  }
}
```

**クラス責務**:

| 責務         | 説明                       |
| ------------ | -------------------------- |
| 加重平均計算 | スコアの重み付き平均を計算 |
| 重複マージ   | 同一チャンクを1つにマージ  |
| ソート       | fusedScore降順でソート     |

---

## 3. Rerankerクラス詳細

### 3.1 IReranker インターフェース

```typescript
/**
 * リランキングのインターフェース
 */
interface IReranker {
  /**
   * 検索結果をリランキング
   * @param query 検索クエリ
   * @param candidates 統合済み候補
   * @param limit 返却する最大件数
   * @returns リランキング後の結果
   */
  rerank(
    query: string,
    candidates: FusedSearchResult[],
    limit: number,
  ): Promise<Result<FusedSearchResult[], Error>>;
}
```

### 3.2 LLMReranker クラス

```typescript
/**
 * LLMベースのリランカー
 * バッチでLLMにスコアリングを依頼し、関連度を評価
 */
class LLMReranker implements IReranker {
  private readonly llmClient: ILLMClient;
  private readonly options: RerankerOptions;

  /**
   * コンストラクタ
   * @param llmClient LLMクライアント
   * @param options リランカーオプション
   */
  constructor(llmClient: ILLMClient, options: RerankerOptions = {}) {
    this.llmClient = llmClient;
    this.options = options;
  }

  /**
   * LLMでリランキング
   */
  async rerank(
    query: string,
    candidates: FusedSearchResult[],
    limit: number,
  ): Promise<Result<FusedSearchResult[], Error>> {
    // 実装詳細は Phase 5 で記述
  }

  /**
   * バッチでスコアリング
   */
  private async scoreBatch(
    query: string,
    candidates: FusedSearchResult[],
  ): Promise<Result<number[], Error>> {
    // 実装詳細は Phase 5 で記述
  }

  /**
   * スコアリング用プロンプトを構築
   */
  private buildScoringPrompt(
    query: string,
    candidates: FusedSearchResult[],
  ): string {
    // 実装詳細は Phase 5 で記述
  }

  /**
   * LLMレスポンスからスコアをパース
   */
  private parseScores(response: string, expectedCount: number): number[] {
    // 実装詳細は Phase 5 で記述
  }
}
```

**クラス責務**:

| 責務           | 説明                           |
| -------------- | ------------------------------ |
| バッチ処理     | 候補をバッチ単位でLLMに送信    |
| プロンプト構築 | スコアリング用プロンプトを生成 |
| スコアパース   | LLMレスポンスからスコアを抽出  |
| フォールバック | エラー時はfusedScoreで続行     |

### 3.3 CohereReranker クラス

```typescript
/**
 * Cohere Rerank APIを使用したリランカー
 */
class CohereReranker implements IReranker {
  private readonly apiKey: string;
  private readonly model: string;

  /**
   * コンストラクタ
   * @param apiKey Cohere APIキー
   * @param model 使用するモデル
   */
  constructor(apiKey: string, model: string = "rerank-multilingual-v3.0") {
    this.apiKey = apiKey;
    this.model = model;
  }

  /**
   * Cohere APIでリランキング
   */
  async rerank(
    query: string,
    candidates: FusedSearchResult[],
    limit: number,
  ): Promise<Result<FusedSearchResult[], Error>> {
    // 実装詳細は Phase 5 で記述
  }
}
```

**クラス責務**:

| 責務               | 説明                                     |
| ------------------ | ---------------------------------------- |
| API呼び出し        | Cohere Rerank APIを呼び出し              |
| レスポンス変換     | APIレスポンスをFusedSearchResult[]に変換 |
| エラーハンドリング | APIエラーをResult.errで返却              |

### 3.4 VoyageReranker クラス

```typescript
/**
 * Voyage AI Rerank APIを使用したリランカー
 */
class VoyageReranker implements IReranker {
  private readonly apiKey: string;
  private readonly model: string;

  /**
   * コンストラクタ
   * @param apiKey Voyage AI APIキー
   * @param model 使用するモデル
   */
  constructor(apiKey: string, model: string = "rerank-2") {
    this.apiKey = apiKey;
    this.model = model;
  }

  /**
   * Voyage APIでリランキング
   */
  async rerank(
    query: string,
    candidates: FusedSearchResult[],
    limit: number,
  ): Promise<Result<FusedSearchResult[], Error>> {
    // 実装詳細は Phase 5 で記述
  }
}
```

**クラス責務**:

| 責務               | 説明                                     |
| ------------------ | ---------------------------------------- |
| API呼び出し        | Voyage Rerank APIを呼び出し              |
| レスポンス変換     | APIレスポンスをFusedSearchResult[]に変換 |
| エラーハンドリング | APIエラーをResult.errで返却              |

### 3.5 NoOpReranker クラス

```typescript
/**
 * No-Opリランカー（フォールバック用）
 * 順序を変更せずにlimitを適用
 */
class NoOpReranker implements IReranker {
  /**
   * 何もせずにlimitを適用して返却
   */
  async rerank(
    _query: string,
    candidates: FusedSearchResult[],
    limit: number,
  ): Promise<Result<FusedSearchResult[], Error>> {
    return ok(candidates.slice(0, limit));
  }
}
```

**クラス責務**:

| 責務       | 説明                         |
| ---------- | ---------------------------- |
| パススルー | 順序を変更せずにそのまま返却 |
| limit適用  | 指定件数に切り詰め           |

---

## 4. 依存関係

### 4.1 外部依存

| 依存          | 用途               | パッケージ/モジュール                          |
| ------------- | ------------------ | ---------------------------------------------- |
| Result型      | エラーハンドリング | `packages/shared/src/types/rag/result.ts`      |
| ChunkId       | チャンク識別子     | `packages/shared/src/types/branded.ts`         |
| SearchResult  | 検索結果型         | `packages/shared/src/services/search/types.ts` |
| SearchWeights | 検索重み型         | `packages/shared/src/services/search/types.ts` |
| ILLMClient    | LLMクライアント    | `packages/shared/src/services/llm/types.ts`    |

### 4.2 内部依存

```
┌─────────────────────────────────────────────────────────┐
│                    Internal Dependencies                 │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  fusion/rrf-fusion.ts                                    │
│      ├─ imports types.ts (FusedSearchResult)            │
│      └─ imports ../types.ts (SearchWeights)             │
│                                                          │
│  reranking/cross-encoder-reranker.ts                    │
│      ├─ imports fusion/types.ts (FusedSearchResult)     │
│      ├─ imports ../types.ts (SearchWeights)             │
│      └─ imports @/types/result.ts (Result, ok, err)     │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

---

## 変更履歴

| 日付       | バージョン | 変更内容 |
| ---------- | ---------- | -------- |
| 2026-01-13 | 1.0.0      | 初版作成 |
