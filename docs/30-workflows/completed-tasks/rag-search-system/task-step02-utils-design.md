# CONV-03-05: ユーティリティ関数設計書

**バージョン**: 1.0.0
**作成日**: 2025-12-18
**最終更新**: 2025-12-18
**作成者**: Logic Developer Agent
**前提ドキュメント**: task-step01-requirements.md

---

## 1. 概要

### 1.1 目的

本ドキュメントは、HybridRAG検索エンジンで使用するユーティリティ関数の設計仕様を定義する。
すべての関数は純粋関数として設計し、単体テストが容易な構造とする。

### 1.2 設計原則

| 原則                      | 説明                                                 |
| ------------------------- | ---------------------------------------------------- |
| **Pure Function**         | 同じ入力に対して常に同じ出力を返し、副作用を持たない |
| **Single Responsibility** | 各関数は1つの責務のみを持つ                          |
| **Type Safety**           | 戻り値の型を厳密に定義し、any型を使用しない          |
| **Immutability**          | 入力データを変更せず、新しいデータを返す             |
| **Fail Fast**             | 不正な入力は早期にエラーを発生させる                 |

---

## 2. ディレクトリ構造

```
packages/shared/src/types/rag/search/
├── index.ts      # バレルエクスポート
├── types.ts      # 型定義
├── schemas.ts    # Zodスキーマ
└── utils.ts      # ユーティリティ関数 ← 本設計書の対象
```

---

## 3. 関数設計

### 3.1 calculateRRFScore（RRFスコア計算）

#### 概要

Reciprocal Rank Fusion（RRF）アルゴリズムを使用して、複数の検索戦略からの結果を統合スコアで融合する。

#### アルゴリズム

```
RRF(d) = Σ weight_i × (1 / (k + rank_i(d)))
```

- `d`: ドキュメント
- `k`: スムージング定数（デフォルト: 60）
- `rank_i(d)`: 戦略iにおけるドキュメントdのランク（1始まり）
- `weight_i`: 戦略iの重み

#### シグネチャ

```typescript
/**
 * 複数検索戦略の結果をRRFアルゴリズムで融合する
 *
 * @param rankedLists - 各戦略からのランク付きリスト
 * @param weights - 戦略ごとの重み（合計1.0）
 * @param k - RRF定数（デフォルト: 60）
 * @returns 統合スコア付きの結果リスト（スコア降順）
 * @throws InvalidWeightsError - 重みの合計が1.0でない場合
 * @throws EmptyRankedListsError - 全てのリストが空の場合
 *
 * @example
 * const result = calculateRRFScore({
 *   keyword: [{ id: 'a', rank: 1 }, { id: 'b', rank: 2 }],
 *   semantic: [{ id: 'b', rank: 1 }, { id: 'a', rank: 2 }],
 *   graph: [{ id: 'a', rank: 1 }, { id: 'c', rank: 2 }]
 * }, { keyword: 0.35, semantic: 0.35, graph: 0.30 });
 */
function calculateRRFScore(
  rankedLists: RankedLists,
  weights: SearchWeights,
  k?: number,
): RRFResult[];
```

#### 入力型

```typescript
interface RankedItem {
  readonly id: string;
  readonly rank: number; // 1始まり
  readonly originalScore?: number;
}

interface RankedLists {
  readonly keyword: readonly RankedItem[];
  readonly semantic: readonly RankedItem[];
  readonly graph: readonly RankedItem[];
}
```

#### 出力型

```typescript
interface RRFResult {
  readonly id: string;
  readonly rrfScore: number;
  readonly scoreBreakdown: {
    readonly keyword: number;
    readonly semantic: number;
    readonly graph: number;
  };
}
```

#### 計算例

| 入力                          | k=60                      |
| ----------------------------- | ------------------------- |
| keyword: rank=1, weight=0.35  | 0.35 × 1/(60+1) = 0.00574 |
| semantic: rank=2, weight=0.35 | 0.35 × 1/(60+2) = 0.00565 |
| graph: rank=1, weight=0.30    | 0.30 × 1/(60+1) = 0.00492 |
| **合計 RRF スコア**           | **0.01631**               |

#### 境界値・エッジケース

| ケース             | 入力                                                    | 期待出力                                    |
| ------------------ | ------------------------------------------------------- | ------------------------------------------- |
| 空のリスト（一部） | keyword: [], semantic: [{id:'a', rank:1}], graph: []    | [{ id: 'a', rrfScore: 0.00565 }]            |
| 全リスト空         | keyword: [], semantic: [], graph: []                    | Error: EmptyRankedListsError                |
| k=0                | k=0, rank=1                                             | Error: InvalidKValueError (k >= 1 required) |
| 重み合計 != 1.0    | weights: {keyword:0.5, semantic:0.5, graph:0.5}         | Error: InvalidWeightsError                  |
| 同一IDが複数戦略に | keyword: [{id:'a',rank:1}], semantic: [{id:'a',rank:1}] | 両方のスコアを加算                          |

#### TDDテストケース

```typescript
describe("calculateRRFScore", () => {
  describe("正常系", () => {
    it("Given: 3戦略の結果がある, When: 標準的な重みでRRF計算, Then: スコア降順で結果が返る", () => {
      // Arrange
      const rankedLists = {
        keyword: [
          { id: "a", rank: 1 },
          { id: "b", rank: 2 },
        ],
        semantic: [
          { id: "b", rank: 1 },
          { id: "a", rank: 2 },
        ],
        graph: [
          { id: "a", rank: 1 },
          { id: "c", rank: 2 },
        ],
      };
      const weights = { keyword: 0.35, semantic: 0.35, graph: 0.3 };

      // Act
      const result = calculateRRFScore(rankedLists, weights);

      // Assert
      expect(result[0].id).toBe("a"); // 最高スコア
      expect(result).toHaveLength(3); // a, b, c
    });

    it("Given: k=60, rank=1, weight=0.35, When: RRF計算, Then: 0.00574に近い値", () => {
      const result = calculateRRFScore(
        { keyword: [{ id: "a", rank: 1 }], semantic: [], graph: [] },
        { keyword: 1.0, semantic: 0, graph: 0 },
        60,
      );
      expect(result[0].rrfScore).toBeCloseTo(1 / 61, 5);
    });
  });

  describe("境界値", () => {
    it("Given: 一部の戦略が空, When: RRF計算, Then: 空でない戦略のみでスコア計算", () => {
      const rankedLists = {
        keyword: [],
        semantic: [{ id: "a", rank: 1 }],
        graph: [],
      };
      const weights = { keyword: 0.35, semantic: 0.35, graph: 0.3 };

      const result = calculateRRFScore(rankedLists, weights);
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe("a");
    });

    it("Given: 全ての戦略が空, When: RRF計算, Then: EmptyRankedListsError", () => {
      expect(() =>
        calculateRRFScore(
          { keyword: [], semantic: [], graph: [] },
          { keyword: 0.35, semantic: 0.35, graph: 0.3 },
        ),
      ).toThrow(EmptyRankedListsError);
    });
  });

  describe("エラー系", () => {
    it("Given: 重みの合計が1.0でない, When: RRF計算, Then: InvalidWeightsError", () => {
      expect(() =>
        calculateRRFScore(
          { keyword: [{ id: "a", rank: 1 }], semantic: [], graph: [] },
          { keyword: 0.5, semantic: 0.5, graph: 0.5 },
        ),
      ).toThrow(InvalidWeightsError);
    });

    it("Given: k=0, When: RRF計算, Then: InvalidKValueError", () => {
      expect(() =>
        calculateRRFScore(
          { keyword: [{ id: "a", rank: 1 }], semantic: [], graph: [] },
          { keyword: 1.0, semantic: 0, graph: 0 },
          0,
        ),
      ).toThrow(InvalidKValueError);
    });
  });
});
```

---

### 3.2 normalizeScores（スコア正規化）

#### 概要

スコアをMin-Max正規化により0.0〜1.0の範囲に変換する。

#### アルゴリズム

```
normalized(x) = (x - min) / (max - min)
```

- `x`: 正規化対象のスコア
- `min`: 配列内の最小値
- `max`: 配列内の最大値

#### シグネチャ

```typescript
/**
 * スコアを0.0-1.0の範囲に正規化する
 *
 * @param scores - 正規化対象のスコア配列
 * @returns 正規化されたスコア配列（元の順序を維持）
 *
 * @example
 * normalizeScores([0.2, 0.8, 0.5]) // [0.0, 1.0, 0.5]
 * normalizeScores([]) // []
 * normalizeScores([0.5]) // [1.0] (単一要素は最大値)
 * normalizeScores([0.5, 0.5]) // [0.5, 0.5] (全て同値は元の値)
 */
function normalizeScores(scores: readonly number[]): number[];
```

#### 境界値・エッジケース

| ケース      | 入力            | 期待出力                    |
| ----------- | --------------- | --------------------------- |
| 空配列      | []              | []                          |
| 単一要素    | [0.5]           | [1.0]                       |
| 全て同値    | [0.5, 0.5, 0.5] | [0.5, 0.5, 0.5]（変更なし） |
| 既に0-1範囲 | [0.0, 0.5, 1.0] | [0.0, 0.5, 1.0]             |
| 負の値含む  | [-1, 0, 1]      | [0.0, 0.5, 1.0]             |
| 範囲外の値  | [0, 50, 100]    | [0.0, 0.5, 1.0]             |

#### TDDテストケース

```typescript
describe("normalizeScores", () => {
  describe("正常系", () => {
    it("Given: スコア配列[0.2, 0.8, 0.5], When: 正規化, Then: [0.0, 1.0, 0.5]", () => {
      const result = normalizeScores([0.2, 0.8, 0.5]);
      expect(result).toEqual([0.0, 1.0, 0.5]);
    });

    it("Given: 順序を維持, When: 正規化, Then: 元の順序を保持", () => {
      const result = normalizeScores([0.8, 0.2, 0.5]);
      expect(result[0]).toBeGreaterThan(result[1]); // 0.8 -> 1.0, 0.2 -> 0.0
    });
  });

  describe("境界値", () => {
    it("Given: 空配列, When: 正規化, Then: 空配列を返す", () => {
      expect(normalizeScores([])).toEqual([]);
    });

    it("Given: 単一要素, When: 正規化, Then: [1.0]を返す", () => {
      expect(normalizeScores([0.5])).toEqual([1.0]);
    });

    it("Given: 全て同値, When: 正規化, Then: 元の値を維持", () => {
      expect(normalizeScores([0.5, 0.5, 0.5])).toEqual([0.5, 0.5, 0.5]);
    });

    it("Given: 負の値を含む, When: 正規化, Then: 0-1に正規化", () => {
      expect(normalizeScores([-1, 0, 1])).toEqual([0.0, 0.5, 1.0]);
    });
  });
});
```

---

### 3.3 deduplicateResults（重複排除）

#### 概要

複数の検索戦略から同じIDを持つ結果が返った場合、指定された戦略で1つにまとめる。

#### シグネチャ

```typescript
/**
 * 重複する検索結果を排除する
 *
 * @param results - 重複を含む可能性のある結果配列
 * @param strategy - 重複時の処理戦略
 * @returns 重複排除後の結果配列（スコア降順）
 *
 * @example
 * deduplicateResults([
 *   { id: 'a', score: 0.8 },
 *   { id: 'a', score: 0.6 },
 *   { id: 'b', score: 0.7 }
 * ], 'max_score');
 * // [{ id: 'a', score: 0.8 }, { id: 'b', score: 0.7 }]
 */
function deduplicateResults<
  T extends { readonly id: string; readonly score: number },
>(results: readonly T[], strategy: DeduplicationStrategy): T[];

type DeduplicationStrategy = "max_score" | "sum_score" | "first" | "last";
```

#### 戦略の説明

| 戦略        | 説明                     | ユースケース             |
| ----------- | ------------------------ | ------------------------ |
| `max_score` | 最大スコアを採用         | 一般的な検索結果の統合   |
| `sum_score` | スコアを合計             | 複数ソースでの一致を重視 |
| `first`     | 最初に出現したものを採用 | 元の順序を尊重           |
| `last`      | 最後に出現したものを採用 | 最新のスコアを優先       |

#### 境界値・エッジケース

| ケース     | 入力                                                            | 戦略      | 期待出力              |
| ---------- | --------------------------------------------------------------- | --------- | --------------------- |
| 重複なし   | [{id:'a', score:0.8}, {id:'b', score:0.6}]                      | max_score | 入力と同じ            |
| 全て同一ID | [{id:'a', score:0.8}, {id:'a', score:0.6}, {id:'a', score:0.4}] | max_score | [{id:'a', score:0.8}] |
| 空配列     | []                                                              | max_score | []                    |
| sum_score  | [{id:'a', score:0.3}, {id:'a', score:0.4}]                      | sum_score | [{id:'a', score:0.7}] |

#### TDDテストケース

```typescript
describe("deduplicateResults", () => {
  describe("max_score戦略", () => {
    it("Given: 同一IDが複数, When: max_score戦略, Then: 最大スコアを採用", () => {
      const results = [
        { id: "a", score: 0.8 },
        { id: "a", score: 0.6 },
        { id: "b", score: 0.7 },
      ];

      const result = deduplicateResults(results, "max_score");

      expect(result).toHaveLength(2);
      expect(result.find((r) => r.id === "a")?.score).toBe(0.8);
    });
  });

  describe("sum_score戦略", () => {
    it("Given: 同一IDが複数, When: sum_score戦略, Then: スコアを合計", () => {
      const results = [
        { id: "a", score: 0.3 },
        { id: "a", score: 0.4 },
      ];

      const result = deduplicateResults(results, "sum_score");

      expect(result).toHaveLength(1);
      expect(result[0].score).toBeCloseTo(0.7);
    });
  });

  describe("境界値", () => {
    it("Given: 空配列, When: 重複排除, Then: 空配列を返す", () => {
      expect(deduplicateResults([], "max_score")).toEqual([]);
    });

    it("Given: 重複なし, When: 重複排除, Then: 元の配列と同じ", () => {
      const results = [
        { id: "a", score: 0.8 },
        { id: "b", score: 0.6 },
      ];
      expect(deduplicateResults(results, "max_score")).toEqual(results);
    });
  });
});
```

---

### 3.4 expandQuery（クエリ拡張）

#### 概要

元のクエリに同義語、関連語を追加して検索精度を向上させる。

#### シグネチャ

```typescript
/**
 * クエリを拡張する（同義語・関連語の追加）
 *
 * @param query - 元のクエリ文字列
 * @param config - 拡張設定
 * @returns 拡張されたクエリ配列
 *
 * @example
 * expandQuery("機械学習", { maxExpansions: 3 });
 * // ["機械学習", "ML", "machine learning"]
 */
function expandQuery(
  query: string,
  config: QueryExpansionConfig,
): ExpandedQuery;

interface QueryExpansionConfig {
  readonly maxExpansions: number; // 最大拡張数（デフォルト: 5）
  readonly includeSynonyms: boolean; // 同義語を含む（デフォルト: true）
  readonly includeRelated: boolean; // 関連語を含む（デフォルト: true）
  readonly language: "ja" | "en"; // 言語
}

interface ExpandedQuery {
  readonly original: string;
  readonly expanded: readonly string[];
  readonly metadata: {
    readonly synonymCount: number;
    readonly relatedCount: number;
  };
}
```

#### 境界値・エッジケース

| ケース          | 入力                                                    | 期待出力                                        |
| --------------- | ------------------------------------------------------- | ----------------------------------------------- |
| 空クエリ        | ""                                                      | { original: "", expanded: [], metadata: {...} } |
| 拡張なし設定    | query="AI", includeSynonyms=false, includeRelated=false | { original: "AI", expanded: [], ... }           |
| maxExpansions=0 | query="AI", maxExpansions=0                             | { original: "AI", expanded: [], ... }           |

---

### 3.5 calculateCRAGScore（CRAGスコア計算）

#### 概要

CRAG（Corrective RAG）アルゴリズムに基づき、検索結果の品質を評価する。

#### シグネチャ

```typescript
/**
 * CRAG評価スコアを計算する
 *
 * @param relevanceScore - 関連度スコア（0.0-1.0）
 * @param confidenceScore - 信頼度スコア（0.0-1.0）
 * @returns CRAG評価結果
 *
 * @example
 * calculateCRAGScore(0.85, 0.90);
 * // { relevance: "correct", confidence: 0.90, needsWebSearch: false, refinedQuery: null }
 */
function calculateCRAGScore(
  relevanceScore: number,
  confidenceScore: number,
): CRAGScore;
```

#### 判定ロジック

| 関連度スコア  | 判定結果    | needsWebSearch |
| ------------- | ----------- | -------------- |
| >= 0.7        | "correct"   | false          |
| <= 0.3        | "incorrect" | true           |
| 0.3 < x < 0.7 | "ambiguous" | true           |

#### TDDテストケース

```typescript
describe("calculateCRAGScore", () => {
  describe("判定ロジック", () => {
    it("Given: relevanceScore=0.8, When: CRAG評価, Then: correct判定", () => {
      const result = calculateCRAGScore(0.8, 0.9);
      expect(result.relevance).toBe("correct");
      expect(result.needsWebSearch).toBe(false);
    });

    it("Given: relevanceScore=0.2, When: CRAG評価, Then: incorrect判定", () => {
      const result = calculateCRAGScore(0.2, 0.9);
      expect(result.relevance).toBe("incorrect");
      expect(result.needsWebSearch).toBe(true);
    });

    it("Given: relevanceScore=0.5, When: CRAG評価, Then: ambiguous判定", () => {
      const result = calculateCRAGScore(0.5, 0.9);
      expect(result.relevance).toBe("ambiguous");
      expect(result.needsWebSearch).toBe(true);
    });
  });

  describe("境界値", () => {
    it("Given: relevanceScore=0.7（境界）, When: CRAG評価, Then: correct判定", () => {
      const result = calculateCRAGScore(0.7, 0.9);
      expect(result.relevance).toBe("correct");
    });

    it("Given: relevanceScore=0.3（境界）, When: CRAG評価, Then: incorrect判定", () => {
      const result = calculateCRAGScore(0.3, 0.9);
      expect(result.relevance).toBe("incorrect");
    });
  });
});
```

---

### 3.6 mergeSearchResults（検索結果マージ）

#### 概要

複数ソースからの検索結果を統合し、重複を排除した結果リストを返す。

#### シグネチャ

```typescript
/**
 * 複数ソースからの検索結果をマージする
 *
 * @param resultSets - 複数の検索結果セット
 * @param config - マージ設定
 * @returns マージされた検索結果（スコア降順）
 */
function mergeSearchResults(
  resultSets: readonly SearchResultItem[][],
  config?: MergeConfig,
): SearchResultItem[];

interface MergeConfig {
  readonly deduplicationStrategy: DeduplicationStrategy;
  readonly maxResults?: number;
  readonly minScore?: number;
}
```

---

### 3.7 sortByRelevance（関連度順ソート）

#### 概要

検索結果を関連度スコアの降順でソートする。

#### シグネチャ

```typescript
/**
 * 検索結果を関連度順にソートする
 *
 * @param results - ソート対象の結果配列
 * @param options - ソートオプション
 * @returns ソート済みの結果配列（新しい配列）
 */
function sortByRelevance<T extends { readonly score: number }>(
  results: readonly T[],
  options?: SortOptions,
): T[];

interface SortOptions {
  readonly direction: "asc" | "desc"; // デフォルト: 'desc'
  readonly tieBreaker?: (a: T, b: T) => number; // 同スコア時の比較関数
}
```

#### TDDテストケース

```typescript
describe("sortByRelevance", () => {
  it("Given: 未ソートの結果, When: ソート, Then: スコア降順", () => {
    const results = [
      { id: "a", score: 0.5 },
      { id: "b", score: 0.8 },
      { id: "c", score: 0.3 },
    ];

    const sorted = sortByRelevance(results);

    expect(sorted[0].score).toBe(0.8);
    expect(sorted[1].score).toBe(0.5);
    expect(sorted[2].score).toBe(0.3);
  });

  it("Given: 結果配列, When: ソート, Then: 元の配列は変更されない（純粋関数）", () => {
    const original = [
      { id: "a", score: 0.5 },
      { id: "b", score: 0.8 },
    ];
    const originalCopy = [...original];

    sortByRelevance(original);

    expect(original).toEqual(originalCopy);
  });
});
```

---

### 3.8 filterByThreshold（閾値フィルタリング）

#### 概要

指定した閾値未満のスコアを持つ結果を除外する。

#### シグネチャ

```typescript
/**
 * 閾値以下のスコアを持つ結果をフィルタリングする
 *
 * @param results - フィルタリング対象の結果配列
 * @param threshold - 最小スコア閾値（0.0-1.0）
 * @returns フィルタリング後の結果配列
 * @throws InvalidThresholdError - 閾値が0.0-1.0の範囲外の場合
 */
function filterByThreshold<T extends { readonly score: number }>(
  results: readonly T[],
  threshold: number,
): T[];
```

#### 境界値・エッジケース

| ケース           | 入力                       | 閾値 | 期待出力                     |
| ---------------- | -------------------------- | ---- | ---------------------------- |
| 全て閾値以上     | [{score:0.8}, {score:0.6}] | 0.5  | 入力と同じ                   |
| 全て閾値未満     | [{score:0.3}, {score:0.2}] | 0.5  | []                           |
| 境界値（等しい） | [{score:0.5}]              | 0.5  | [{score:0.5}]（含む）        |
| 閾値=0           | [{score:0.1}]              | 0.0  | 入力と同じ                   |
| 閾値=1           | [{score:0.9}]              | 1.0  | []                           |
| 閾値範囲外       | []                         | 1.5  | Error: InvalidThresholdError |

---

## 4. エラー型定義

```typescript
/**
 * ユーティリティ関数のベースエラークラス
 */
export class SearchUtilsError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly details?: Record<string, unknown>,
  ) {
    super(message);
    this.name = "SearchUtilsError";
  }
}

export class InvalidWeightsError extends SearchUtilsError {
  constructor(weights: SearchWeights) {
    super("検索重みの合計は1.0である必要があります", "INVALID_WEIGHTS", {
      weights,
      sum: weights.keyword + weights.semantic + weights.graph,
    });
    this.name = "InvalidWeightsError";
  }
}

export class EmptyRankedListsError extends SearchUtilsError {
  constructor() {
    super("すべての検索戦略の結果が空です", "EMPTY_RANKED_LISTS");
    this.name = "EmptyRankedListsError";
  }
}

export class InvalidKValueError extends SearchUtilsError {
  constructor(k: number) {
    super("RRF定数kは1以上である必要があります", "INVALID_K_VALUE", { k });
    this.name = "InvalidKValueError";
  }
}

export class InvalidThresholdError extends SearchUtilsError {
  constructor(threshold: number) {
    super("閾値は0.0〜1.0の範囲である必要があります", "INVALID_THRESHOLD", {
      threshold,
    });
    this.name = "InvalidThresholdError";
  }
}
```

---

## 5. 純粋関数設計チェックリスト

各関数が以下の基準を満たすことを確認:

| 関数名             | 副作用なし | 入力不変 | 同一入力同一出力 | 外部依存なし |
| ------------------ | :--------: | :------: | :--------------: | :----------: |
| calculateRRFScore  |     ✓      |    ✓     |        ✓         |      ✓       |
| normalizeScores    |     ✓      |    ✓     |        ✓         |      ✓       |
| deduplicateResults |     ✓      |    ✓     |        ✓         |      ✓       |
| expandQuery        |     ✓      |    ✓     |        ✓※        |      △※      |
| calculateCRAGScore |     ✓      |    ✓     |        ✓         |      ✓       |
| mergeSearchResults |     ✓      |    ✓     |        ✓         |      ✓       |
| sortByRelevance    |     ✓      |    ✓     |        ✓         |      ✓       |
| filterByThreshold  |     ✓      |    ✓     |        ✓         |      ✓       |

※ expandQuery は同義語辞書への依存があるため、辞書を引数で受け取る設計とする

---

## 6. 実装ファイル構成

```typescript
// packages/shared/src/types/rag/search/utils.ts

// 型のインポート
import type { SearchWeights, CRAGScore, SearchResultItem } from "./types";

// エラークラスのエクスポート
export {
  SearchUtilsError,
  InvalidWeightsError,
  EmptyRankedListsError,
  InvalidKValueError,
  InvalidThresholdError,
} from "./errors";

// 関数のエクスポート
export { calculateRRFScore } from "./utils/rrf";
export { normalizeScores } from "./utils/normalize";
export { deduplicateResults } from "./utils/deduplicate";
export { expandQuery } from "./utils/expand";
export { calculateCRAGScore } from "./utils/crag";
export { mergeSearchResults } from "./utils/merge";
export { sortByRelevance } from "./utils/sort";
export { filterByThreshold } from "./utils/filter";
```

---

## 7. 完了条件チェックリスト

| #   | 条件                                         | 状態 |
| --- | -------------------------------------------- | ---- |
| 1   | calculateRRFScore関数の仕様が設計されている  | ✓    |
| 2   | normalizeScores関数の仕様が設計されている    | ✓    |
| 3   | deduplicateResults関数の仕様が設計されている | ✓    |
| 4   | 各関数の境界値・エッジケースが明記されている | ✓    |
| 5   | 純粋関数として設計されている                 | ✓    |
| 6   | TDDテストケースが設計されている              | ✓    |
| 7   | エラー型が定義されている                     | ✓    |

---

## 付録: 変更履歴

| バージョン | 日付       | 変更者                | 変更内容 |
| ---------- | ---------- | --------------------- | -------- |
| 1.0.0      | 2025-12-18 | Logic Developer Agent | 初版作成 |
