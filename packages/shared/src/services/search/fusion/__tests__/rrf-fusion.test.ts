/**
 * @file RRF Fusion + WeightedScoreFusion ユニットテスト
 * @description CONV-07-05 Phase 4: TDD Red Phase
 */

import { describe, it, expect } from "vitest";
import { createChunkId } from "../../../../types/rag/branded";
import type { SearchWeights } from "../../types";

// テスト対象（未実装）
import { RRFFusion, WeightedScoreFusion } from "../rrf-fusion";
import type { SearchResult } from "../types";

// =============================================================================
// ヘルパー関数
// =============================================================================

/**
 * モック検索結果を生成
 */
function createMockResults(
  strategy: "keyword" | "semantic" | "graph",
  count: number,
  startScore = 0.9,
): SearchResult[] {
  return Array.from({ length: count }, (_, i) => ({
    chunkId: createChunkId(`${strategy}-chunk-${i}`),
    content: `Content from ${strategy} strategy, item ${i}`,
    score: startScore - i * 0.1,
    source: strategy,
    metadata: { strategy, rank: i + 1 },
  }));
}

// =============================================================================
// RRFFusion テスト
// =============================================================================

describe("RRFFusion", () => {
  describe("IFusionStrategyインターフェース実装", () => {
    it("IFusionStrategyインターフェースを実装している", () => {
      const fusion = new RRFFusion();
      expect(fusion.fuse).toBeDefined();
      expect(typeof fusion.fuse).toBe("function");
    });
  });

  describe("fuse()", () => {
    it("AC-001: 3つの検索結果を統合する", () => {
      // Given: 3つの検索戦略からの結果セット
      const fusion = new RRFFusion();
      const resultSets = new Map<string, SearchResult[]>([
        ["keyword", createMockResults("keyword", 5)],
        ["semantic", createMockResults("semantic", 5)],
        ["graph", createMockResults("graph", 5)],
      ]);
      const weights: SearchWeights = {
        keyword: 0.33,
        semantic: 0.33,
        graph: 0.34,
      };

      // When: Fusionを実行
      const fused = fusion.fuse(resultSets, weights);

      // Then: 統合された結果が返却される
      expect(fused.length).toBeGreaterThan(0);
      expect(fused[0].fusedScore).toBeDefined();
      // スコアが降順にソートされている
      for (let i = 1; i < fused.length; i++) {
        expect(fused[i - 1].fusedScore).toBeGreaterThanOrEqual(
          fused[i].fusedScore,
        );
      }
    });

    it("AC-002: 重みが正しく適用される", () => {
      // Given: 異なる重み設定
      const fusion = new RRFFusion();
      const resultSets = new Map<string, SearchResult[]>([
        ["keyword", createMockResults("keyword", 3)],
        ["semantic", createMockResults("semantic", 3)],
        ["graph", createMockResults("graph", 3)],
      ]);

      // graphを重視
      const graphHeavyWeights: SearchWeights = {
        keyword: 0.1,
        semantic: 0.1,
        graph: 0.8,
      };
      const graphHeavyFused = fusion.fuse(resultSets, graphHeavyWeights);

      // Then: graphの1位がトップに来やすい
      const topSource = graphHeavyFused[0].sources.find((s) => s.rank === 1);
      expect(topSource?.strategy).toBe("graph");
    });

    it("AC-003: 重複するチャンクが正しく統合される", () => {
      // Given: 同一チャンクが複数の戦略で出現
      const fusion = new RRFFusion();
      const sharedChunkId = createChunkId("shared-chunk");
      const sharedChunk: SearchResult = {
        chunkId: sharedChunkId,
        content: "Shared content",
        score: 0.9,
        source: "keyword",
        metadata: {},
      };

      const resultSets = new Map<string, SearchResult[]>([
        ["keyword", [sharedChunk, ...createMockResults("keyword", 2)]],
        [
          "semantic",
          [
            { ...sharedChunk, source: "semantic" as const },
            ...createMockResults("semantic", 2),
          ],
        ],
      ]);
      const weights: SearchWeights = { keyword: 0.5, semantic: 0.5, graph: 0 };

      // When: Fusionを実行
      const fused = fusion.fuse(resultSets, weights);

      // Then: 共有チャンクは1回だけ出現し、両方のソースが記録される
      const sharedResult = fused.find((r) => r.chunkId === sharedChunkId);
      expect(sharedResult).toBeDefined();
      expect(sharedResult!.sources.length).toBe(2);
      expect(sharedResult!.sources.map((s) => s.strategy)).toContain("keyword");
      expect(sharedResult!.sources.map((s) => s.strategy)).toContain(
        "semantic",
      );
    });

    it("AC-004: fusedScoreが0-1の範囲に正規化される", () => {
      // Given: 検索結果セット
      const fusion = new RRFFusion();
      const resultSets = new Map<string, SearchResult[]>([
        ["keyword", createMockResults("keyword", 10)],
        ["semantic", createMockResults("semantic", 10)],
        ["graph", createMockResults("graph", 10)],
      ]);
      const weights: SearchWeights = {
        keyword: 0.33,
        semantic: 0.33,
        graph: 0.34,
      };

      // When: Fusionを実行
      const fused = fusion.fuse(resultSets, weights);

      // Then: 全てのfusedScoreが0-1の範囲
      for (const result of fused) {
        expect(result.fusedScore).toBeGreaterThanOrEqual(0);
        expect(result.fusedScore).toBeLessThanOrEqual(1);
      }
    });

    it("AC-005: kパラメータがコンストラクタで設定可能", () => {
      // Given: 異なるkパラメータ
      const fusion30 = new RRFFusion(30);
      const fusion60 = new RRFFusion(60);

      const resultSets = new Map<string, SearchResult[]>([
        ["keyword", createMockResults("keyword", 5)],
      ]);
      const weights: SearchWeights = { keyword: 1, semantic: 0, graph: 0 };

      // When: Fusionを実行
      const fused30 = fusion30.fuse(resultSets, weights);
      const fused60 = fusion60.fuse(resultSets, weights);

      // Then: k=30の方がランキング差の影響が大きい（スコア差が大きくなる）
      expect(fused30[0].fusedScore).not.toBe(fused60[0].fusedScore);
    });

    it("空の結果セットを処理できる", () => {
      // Given: 空の結果セット
      const fusion = new RRFFusion();
      const resultSets = new Map<string, SearchResult[]>();
      const weights: SearchWeights = {
        keyword: 0.33,
        semantic: 0.33,
        graph: 0.34,
      };

      // When: Fusionを実行
      const fused = fusion.fuse(resultSets, weights);

      // Then: 空の配列が返却される
      expect(fused).toEqual([]);
    });

    it("単一戦略の結果を処理できる", () => {
      // Given: 単一戦略のみの結果
      const fusion = new RRFFusion();
      const resultSets = new Map<string, SearchResult[]>([
        ["keyword", createMockResults("keyword", 5)],
      ]);
      const weights: SearchWeights = { keyword: 1, semantic: 0, graph: 0 };

      // When: Fusionを実行
      const fused = fusion.fuse(resultSets, weights);

      // Then: 結果が返却される
      expect(fused.length).toBe(5);
      expect(fused.every((r) => r.sources[0].strategy === "keyword")).toBe(
        true,
      );
    });

    it("全戦略が空の結果でもエラーにならない", () => {
      // Given: 全戦略が空
      const fusion = new RRFFusion();
      const resultSets = new Map<string, SearchResult[]>([
        ["keyword", []],
        ["semantic", []],
        ["graph", []],
      ]);
      const weights: SearchWeights = {
        keyword: 0.33,
        semantic: 0.33,
        graph: 0.34,
      };

      // When: Fusionを実行
      const fused = fusion.fuse(resultSets, weights);

      // Then: 空の配列が返却される
      expect(fused).toEqual([]);
    });
  });
});

// =============================================================================
// WeightedScoreFusion テスト
// =============================================================================

describe("WeightedScoreFusion", () => {
  describe("IFusionStrategyインターフェース実装", () => {
    it("IFusionStrategyインターフェースを実装している", () => {
      const fusion = new WeightedScoreFusion();
      expect(fusion.fuse).toBeDefined();
      expect(typeof fusion.fuse).toBe("function");
    });
  });

  describe("fuse()", () => {
    it("AC-006: 加重平均スコアが正しく計算される", () => {
      // Given: 異なるスコアの結果
      const fusion = new WeightedScoreFusion();
      const resultSets = new Map<string, SearchResult[]>([
        [
          "keyword",
          [
            {
              chunkId: createChunkId("a"),
              content: "A",
              score: 1.0,
              source: "keyword" as const,
              metadata: {},
            },
          ],
        ],
        [
          "semantic",
          [
            {
              chunkId: createChunkId("b"),
              content: "B",
              score: 0.5,
              source: "semantic" as const,
              metadata: {},
            },
          ],
        ],
      ]);
      const weights: SearchWeights = { keyword: 0.6, semantic: 0.4, graph: 0 };

      // When: Fusionを実行
      const fused = fusion.fuse(resultSets, weights);

      // Then: 加重平均が計算される
      // chunk "a": score = 1.0 * 0.6 / 0.6 = 1.0
      // chunk "b": score = 0.5 * 0.4 / 0.4 = 0.5
      const resultA = fused.find((r) => r.chunkId === createChunkId("a"));
      const resultB = fused.find((r) => r.chunkId === createChunkId("b"));
      expect(resultA?.fusedScore).toBeCloseTo(1.0);
      expect(resultB?.fusedScore).toBeCloseTo(0.5);
    });

    it("AC-007: 重複チャンクのスコアが正しく統合される", () => {
      // Given: 同一チャンクが複数戦略で異なるスコア
      const fusion = new WeightedScoreFusion();
      const sharedChunkId = createChunkId("shared");
      const sharedChunk = {
        chunkId: sharedChunkId,
        content: "Shared",
        metadata: {},
      };

      const resultSets = new Map<string, SearchResult[]>([
        [
          "keyword",
          [{ ...sharedChunk, score: 0.8, source: "keyword" as const }],
        ],
        [
          "semantic",
          [{ ...sharedChunk, score: 0.6, source: "semantic" as const }],
        ],
      ]);
      const weights: SearchWeights = { keyword: 0.5, semantic: 0.5, graph: 0 };

      // When: Fusionを実行
      const fused = fusion.fuse(resultSets, weights);

      // Then: 重み付き平均が計算される
      const shared = fused.find((r) => r.chunkId === sharedChunkId);
      // (0.8 * 0.5 + 0.6 * 0.5) / (0.5 + 0.5) = 0.7
      expect(shared?.fusedScore).toBeCloseTo(0.7);
    });

    it("空の結果セットを処理できる", () => {
      // Given: 空の結果セット
      const fusion = new WeightedScoreFusion();
      const resultSets = new Map<string, SearchResult[]>();
      const weights: SearchWeights = {
        keyword: 0.33,
        semantic: 0.33,
        graph: 0.34,
      };

      // When: Fusionを実行
      const fused = fusion.fuse(resultSets, weights);

      // Then: 空の配列が返却される
      expect(fused).toEqual([]);
    });

    it("fusedScoreが降順にソートされる", () => {
      // Given: 複数の結果
      const fusion = new WeightedScoreFusion();
      const resultSets = new Map<string, SearchResult[]>([
        ["keyword", createMockResults("keyword", 5)],
      ]);
      const weights: SearchWeights = { keyword: 1, semantic: 0, graph: 0 };

      // When: Fusionを実行
      const fused = fusion.fuse(resultSets, weights);

      // Then: 降順ソート
      for (let i = 1; i < fused.length; i++) {
        expect(fused[i - 1].fusedScore).toBeGreaterThanOrEqual(
          fused[i].fusedScore,
        );
      }
    });
  });
});
