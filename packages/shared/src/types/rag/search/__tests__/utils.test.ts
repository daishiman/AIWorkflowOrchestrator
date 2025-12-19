/**
 * CONV-03-05: Search Utility Functions Tests
 * ユーティリティ関数のテスト（TDD Red Phase）
 *
 * @module @repo/shared/types/rag/search/__tests__/utils
 */

import { describe, it, expect } from "vitest";
import {
  calculateRRFScore,
  normalizeScores,
  deduplicateResults,
  expandQuery,
  calculateCRAGScore,
  mergeSearchResults,
  sortByRelevance,
  filterByThreshold,
  InvalidWeightsError,
  EmptyRankedListsError,
  InvalidKValueError,
  InvalidThresholdError,
} from "../utils";

// ==================== calculateRRFScore Tests ====================

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

    it("Given: k=60, rank=1, weight=1.0, When: RRF計算, Then: 1/61に近い値", () => {
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

// ==================== normalizeScores Tests ====================

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

// ==================== deduplicateResults Tests ====================

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

// ==================== expandQuery Tests ====================

describe("expandQuery", () => {
  describe("境界値", () => {
    it("Given: 空クエリ, When: クエリ拡張, Then: expanded配列は空", () => {
      const result = expandQuery("", {
        maxExpansions: 5,
        includeSynonyms: true,
        includeRelated: true,
        language: "ja",
      });

      expect(result.original).toBe("");
      expect(result.expanded).toEqual([]);
      expect(result.metadata.synonymCount).toBe(0);
      expect(result.metadata.relatedCount).toBe(0);
    });

    it("Given: 拡張なし設定, When: クエリ拡張, Then: expanded配列は空", () => {
      const result = expandQuery("AI", {
        maxExpansions: 5,
        includeSynonyms: false,
        includeRelated: false,
        language: "en",
      });

      expect(result.original).toBe("AI");
      expect(result.expanded).toEqual([]);
    });

    it("Given: maxExpansions=0, When: クエリ拡張, Then: expanded配列は空", () => {
      const result = expandQuery("AI", {
        maxExpansions: 0,
        includeSynonyms: true,
        includeRelated: true,
        language: "en",
      });

      expect(result.original).toBe("AI");
      expect(result.expanded).toEqual([]);
    });
  });
});

// ==================== calculateCRAGScore Tests ====================

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

// ==================== mergeSearchResults Tests ====================

describe("mergeSearchResults", () => {
  it("Given: 複数ソースの結果, When: マージ, Then: 統合された結果を返す", () => {
    // SearchResultItem型のモックデータ作成（最小限のプロパティ）
    const set1 = [
      {
        id: "a",
        type: "chunk" as const,
        score: 0.8,
        relevance: {
          combined: 0.8,
          keyword: 0.7,
          semantic: 0.8,
          graph: 0.9,
          rerank: null,
          crag: null,
        },
        content: {
          text: "テキストA",
          summary: null,
          contextBefore: null,
          contextAfter: null,
        },
        highlights: [],
        sources: {
          chunkId: null,
          fileId: null,
          entityIds: [],
          communityId: null,
          relationIds: [],
        },
      },
    ];

    const set2 = [
      {
        id: "b",
        type: "chunk" as const,
        score: 0.6,
        relevance: {
          combined: 0.6,
          keyword: 0.5,
          semantic: 0.6,
          graph: 0.7,
          rerank: null,
          crag: null,
        },
        content: {
          text: "テキストB",
          summary: null,
          contextBefore: null,
          contextAfter: null,
        },
        highlights: [],
        sources: {
          chunkId: null,
          fileId: null,
          entityIds: [],
          communityId: null,
          relationIds: [],
        },
      },
    ];

    const result = mergeSearchResults([set1, set2]);

    expect(result).toHaveLength(2);
    expect(result[0].id).toBe("a"); // スコア降順
  });

  it("Given: minScoreオプション, When: マージ, Then: 閾値以上のみ返す", () => {
    const set1 = [
      {
        id: "a",
        type: "chunk" as const,
        score: 0.8,
        relevance: {
          combined: 0.8,
          keyword: 0.7,
          semantic: 0.8,
          graph: 0.9,
          rerank: null,
          crag: null,
        },
        content: {
          text: "テキストA",
          summary: null,
          contextBefore: null,
          contextAfter: null,
        },
        highlights: [],
        sources: {
          chunkId: null,
          fileId: null,
          entityIds: [],
          communityId: null,
          relationIds: [],
        },
      },
      {
        id: "b",
        type: "chunk" as const,
        score: 0.3,
        relevance: {
          combined: 0.3,
          keyword: 0.2,
          semantic: 0.3,
          graph: 0.4,
          rerank: null,
          crag: null,
        },
        content: {
          text: "テキストB",
          summary: null,
          contextBefore: null,
          contextAfter: null,
        },
        highlights: [],
        sources: {
          chunkId: null,
          fileId: null,
          entityIds: [],
          communityId: null,
          relationIds: [],
        },
      },
    ];

    const result = mergeSearchResults([set1], {
      deduplicationStrategy: "max_score",
      minScore: 0.5,
    });

    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("a");
  });

  it("Given: maxResultsオプション, When: マージ, Then: 上位N件のみ返す", () => {
    const set1 = [
      {
        id: "a",
        type: "chunk" as const,
        score: 0.8,
        relevance: {
          combined: 0.8,
          keyword: 0.7,
          semantic: 0.8,
          graph: 0.9,
          rerank: null,
          crag: null,
        },
        content: {
          text: "テキストA",
          summary: null,
          contextBefore: null,
          contextAfter: null,
        },
        highlights: [],
        sources: {
          chunkId: null,
          fileId: null,
          entityIds: [],
          communityId: null,
          relationIds: [],
        },
      },
      {
        id: "b",
        type: "chunk" as const,
        score: 0.6,
        relevance: {
          combined: 0.6,
          keyword: 0.5,
          semantic: 0.6,
          graph: 0.7,
          rerank: null,
          crag: null,
        },
        content: {
          text: "テキストB",
          summary: null,
          contextBefore: null,
          contextAfter: null,
        },
        highlights: [],
        sources: {
          chunkId: null,
          fileId: null,
          entityIds: [],
          communityId: null,
          relationIds: [],
        },
      },
      {
        id: "c",
        type: "chunk" as const,
        score: 0.4,
        relevance: {
          combined: 0.4,
          keyword: 0.3,
          semantic: 0.4,
          graph: 0.5,
          rerank: null,
          crag: null,
        },
        content: {
          text: "テキストC",
          summary: null,
          contextBefore: null,
          contextAfter: null,
        },
        highlights: [],
        sources: {
          chunkId: null,
          fileId: null,
          entityIds: [],
          communityId: null,
          relationIds: [],
        },
      },
    ];

    const result = mergeSearchResults([set1], {
      deduplicationStrategy: "max_score",
      maxResults: 2,
    });

    expect(result).toHaveLength(2);
    expect(result[0].id).toBe("a");
    expect(result[1].id).toBe("b");
  });

  it("Given: 空配列, When: マージ, Then: 空配列を返す", () => {
    const result = mergeSearchResults([]);
    expect(result).toEqual([]);
  });
});

// ==================== sortByRelevance Tests ====================

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

  it("Given: direction=asc, When: ソート, Then: スコア昇順", () => {
    const results = [
      { id: "a", score: 0.5 },
      { id: "b", score: 0.8 },
      { id: "c", score: 0.3 },
    ];

    const sorted = sortByRelevance(results, { direction: "asc" });

    expect(sorted[0].score).toBe(0.3);
    expect(sorted[1].score).toBe(0.5);
    expect(sorted[2].score).toBe(0.8);
  });

  it("Given: 同スコアとtieBreaker, When: ソート, Then: tieBreakerで決定", () => {
    const results = [
      { id: "a", score: 0.5 },
      { id: "b", score: 0.5 },
      { id: "c", score: 0.5 },
    ];

    const sorted = sortByRelevance(results, {
      direction: "desc",
      tieBreaker: (a, b) => a.id.localeCompare(b.id),
    });

    expect(sorted[0].id).toBe("a");
    expect(sorted[1].id).toBe("b");
    expect(sorted[2].id).toBe("c");
  });
});

// ==================== filterByThreshold Tests ====================

describe("filterByThreshold", () => {
  describe("境界値", () => {
    it("Given: 全て閾値以上, When: フィルタリング, Then: 入力と同じ", () => {
      const results = [
        { id: "a", score: 0.8 },
        { id: "b", score: 0.6 },
      ];
      const filtered = filterByThreshold(results, 0.5);
      expect(filtered).toEqual(results);
    });

    it("Given: 全て閾値未満, When: フィルタリング, Then: 空配列", () => {
      const results = [
        { id: "a", score: 0.3 },
        { id: "b", score: 0.2 },
      ];
      const filtered = filterByThreshold(results, 0.5);
      expect(filtered).toEqual([]);
    });

    it("Given: 境界値（等しい）, When: フィルタリング, Then: 含む", () => {
      const results = [{ id: "a", score: 0.5 }];
      const filtered = filterByThreshold(results, 0.5);
      expect(filtered).toEqual([{ id: "a", score: 0.5 }]);
    });

    it("Given: 閾値=0, When: フィルタリング, Then: 全て含む", () => {
      const results = [{ id: "a", score: 0.1 }];
      const filtered = filterByThreshold(results, 0.0);
      expect(filtered).toEqual(results);
    });

    it("Given: 閾値=1, When: フィルタリング, Then: 空配列", () => {
      const results = [{ id: "a", score: 0.9 }];
      const filtered = filterByThreshold(results, 1.0);
      expect(filtered).toEqual([]);
    });

    it("Given: 閾値範囲外, When: フィルタリング, Then: InvalidThresholdError", () => {
      expect(() => filterByThreshold([], 1.5)).toThrow(InvalidThresholdError);
    });
  });
});
