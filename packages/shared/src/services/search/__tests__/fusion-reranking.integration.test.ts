/**
 * @file Fusion + Reranking 統合テスト
 * @description CONV-07-05 Phase 4: TDD Red Phase - 統合テストシナリオ
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { createChunkId } from "../../../types/rag/branded";
import { err } from "../../../types/rag/result";
import type { SearchWeights } from "../types";

// テスト対象（未実装）
import { RRFFusion, WeightedScoreFusion } from "../fusion/rrf-fusion";
import {
  LLMReranker,
  CohereReranker,
  NoOpReranker,
} from "../reranking/cross-encoder-reranker";
import type { SearchResult } from "../fusion/types";

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

/**
 * 共有チャンクを含む検索結果を生成
 */
function createResultsWithSharedChunks(): Map<string, SearchResult[]> {
  const sharedChunkId = createChunkId("shared-chunk");

  return new Map([
    [
      "keyword",
      [
        {
          chunkId: sharedChunkId,
          content: "Shared content",
          score: 0.9,
          source: "keyword" as const,
          metadata: {},
        },
        ...createMockResults("keyword", 2),
      ],
    ],
    [
      "semantic",
      [
        {
          chunkId: sharedChunkId,
          content: "Shared content",
          score: 0.85,
          source: "semantic" as const,
          metadata: {},
        },
        ...createMockResults("semantic", 2),
      ],
    ],
    [
      "graph",
      [
        {
          chunkId: sharedChunkId,
          content: "Shared content",
          score: 0.8,
          source: "graph" as const,
          metadata: {},
        },
        ...createMockResults("graph", 2),
      ],
    ],
  ]);
}

// =============================================================================
// API接続テスト
// =============================================================================

describe("Fusion + Reranking 統合テスト", () => {
  describe("API接続テスト", () => {
    it("RRFFusionがSearchResultを受け取り、FusedSearchResultを返す", () => {
      // Given: 検索結果
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

      // Then: FusedSearchResultの形式で返却される
      expect(fused.length).toBeGreaterThan(0);
      expect(fused[0]).toHaveProperty("chunkId");
      expect(fused[0]).toHaveProperty("content");
      expect(fused[0]).toHaveProperty("fusedScore");
      expect(fused[0]).toHaveProperty("sources");
      expect(fused[0]).toHaveProperty("metadata");
    });

    it("RerankerがFusedSearchResultを受け取り、リランク済み結果を返す", async () => {
      // Given: Fusionの結果
      const fusion = new RRFFusion();
      const resultSets = new Map<string, SearchResult[]>([
        ["keyword", createMockResults("keyword", 5)],
      ]);
      const weights: SearchWeights = { keyword: 1, semantic: 0, graph: 0 };
      const fused = fusion.fuse(resultSets, weights);

      // NoOpRerankerでテスト
      const reranker = new NoOpReranker();

      // When: リランキングを実行
      const result = await reranker.rerank("test query", fused, 3);

      // Then: リランク済み結果が返却される
      expect(result.success).toBe(true);
      expect(result.data.length).toBeLessThanOrEqual(3);
      expect(result.data[0]).toHaveProperty("rerankedScore");
    });
  });

  // =============================================================================
  // データフローテスト
  // =============================================================================

  describe("データフローテスト", () => {
    it("3戦略 → Fusion → Reranking の完全フローが動作する", async () => {
      // Given: 3戦略の検索結果
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

      // When: Fusion → Reranking
      const fusion = new RRFFusion();
      const fused = fusion.fuse(resultSets, weights);

      const reranker = new NoOpReranker();
      const result = await reranker.rerank("test query", fused, 5);

      // Then: 完全なフローが成功
      expect(result.success).toBe(true);
      expect(result.data.length).toBe(5);
      expect(result.data.every((r) => r.fusedScore !== undefined)).toBe(true);
      expect(result.data.every((r) => r.rerankedScore !== undefined)).toBe(
        true,
      );
    });

    it("重複チャンクがフロー全体で正しく処理される", async () => {
      // Given: 重複チャンクを含む検索結果
      const resultSets = createResultsWithSharedChunks();
      const weights: SearchWeights = {
        keyword: 0.33,
        semantic: 0.33,
        graph: 0.34,
      };

      // When: Fusion → Reranking
      const fusion = new RRFFusion();
      const fused = fusion.fuse(resultSets, weights);

      // Then: 共有チャンクが1回のみ出現し、全ソースが記録される
      const sharedChunk = fused.find(
        (r) => r.chunkId === createChunkId("shared-chunk"),
      );
      expect(sharedChunk).toBeDefined();
      expect(sharedChunk!.sources.length).toBe(3); // keyword, semantic, graph

      // Reranking後も整合性が保たれる
      const reranker = new NoOpReranker();
      const result = await reranker.rerank("test query", fused, 10);

      const sharedChunkAfterRerank = result.data.find(
        (r) => r.chunkId === createChunkId("shared-chunk"),
      );
      expect(sharedChunkAfterRerank).toBeDefined();
      expect(sharedChunkAfterRerank!.sources.length).toBe(3);
    });

    it("WeightedScoreFusion + NoOpReranker の組み合わせが動作する", async () => {
      // Given: 検索結果
      const resultSets = new Map<string, SearchResult[]>([
        ["keyword", createMockResults("keyword", 5)],
        ["semantic", createMockResults("semantic", 5)],
      ]);
      const weights: SearchWeights = { keyword: 0.5, semantic: 0.5, graph: 0 };

      // When: WeightedScoreFusion → NoOpReranker
      const fusion = new WeightedScoreFusion();
      const fused = fusion.fuse(resultSets, weights);

      const reranker = new NoOpReranker();
      const result = await reranker.rerank("test query", fused, 5);

      // Then: 成功
      expect(result.success).toBe(true);
      expect(result.data.length).toBeLessThanOrEqual(5);
    });
  });

  // =============================================================================
  // エラーハンドリングテスト
  // =============================================================================

  describe("エラーハンドリングテスト", () => {
    beforeEach(() => {
      vi.clearAllMocks();
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    it("Reranker失敗時にFusionスコアでフォールバック", async () => {
      // Given: エラーを返すLLMReranker
      const mockLLM = {
        complete: vi.fn().mockResolvedValue(err(new Error("API Error"))),
      };
      const reranker = new LLMReranker(mockLLM as any);

      const fusion = new RRFFusion();
      const resultSets = new Map<string, SearchResult[]>([
        ["keyword", createMockResults("keyword", 10)],
      ]);
      const weights: SearchWeights = { keyword: 1, semantic: 0, graph: 0 };
      const fused = fusion.fuse(resultSets, weights);

      // When: リランキングを実行（失敗する）
      const result = await reranker.rerank("test query", fused, 5);

      // Then: フォールバックで成功し、fusedScore順で返却される
      expect(result.success).toBe(true);
      expect(result.data.length).toBe(5);
      // fusedScore順（元の順序が維持される）
      for (let i = 1; i < result.data.length; i++) {
        expect(result.data[i - 1].fusedScore).toBeGreaterThanOrEqual(
          result.data[i].fusedScore,
        );
      }
    });

    it("空の検索結果でもエラーにならない", async () => {
      // Given: 空の検索結果
      const fusion = new RRFFusion();
      const resultSets = new Map<string, SearchResult[]>();
      const weights: SearchWeights = {
        keyword: 0.33,
        semantic: 0.33,
        graph: 0.34,
      };

      // When: Fusion → Reranking
      const fused = fusion.fuse(resultSets, weights);

      const reranker = new NoOpReranker();
      const result = await reranker.rerank("test query", fused, 5);

      // Then: エラーなく空の結果が返却される
      expect(fused).toEqual([]);
      expect(result.success).toBe(true);
      expect(result.data).toEqual([]);
    });

    it("CohereReranker失敗時のフォールバックチェーン", async () => {
      // Given: 失敗するCohereReranker
      vi.spyOn(global, "fetch").mockResolvedValue({
        ok: false,
        status: 500,
        statusText: "Internal Server Error",
        json: () => Promise.resolve({ error: "Server error" }),
      } as Response);

      const fusion = new RRFFusion();
      const resultSets = new Map<string, SearchResult[]>([
        ["keyword", createMockResults("keyword", 5)],
      ]);
      const weights: SearchWeights = { keyword: 1, semantic: 0, graph: 0 };
      const fused = fusion.fuse(resultSets, weights);

      // When: CohereRerankerが失敗
      const cohereReranker = new CohereReranker("test-api-key");
      const cohereResult = await cohereReranker.rerank("test query", fused, 3);

      // CohereReranker失敗後、NoOpRerankerにフォールバック
      let finalResult;
      if (!cohereResult.success) {
        const fallbackReranker = new NoOpReranker();
        finalResult = await fallbackReranker.rerank("test query", fused, 3);
      } else {
        finalResult = cohereResult;
      }

      // Then: フォールバックで成功
      expect(finalResult.success).toBe(true);
      expect(finalResult.data.length).toBe(3);
    });
  });

  // =============================================================================
  // 認証連携テスト
  // =============================================================================

  describe("認証連携テスト", () => {
    beforeEach(() => {
      vi.clearAllMocks();
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    it("有効なAPIキーで正常に動作する", async () => {
      // Given: 有効なAPIキー
      const reranker = new CohereReranker("valid-api-key");
      const fusion = new RRFFusion();
      const resultSets = new Map<string, SearchResult[]>([
        ["keyword", createMockResults("keyword", 5)],
      ]);
      const weights: SearchWeights = { keyword: 1, semantic: 0, graph: 0 };
      const fused = fusion.fuse(resultSets, weights);

      vi.spyOn(global, "fetch").mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve({
            results: [
              { index: 0, relevance_score: 0.95 },
              { index: 1, relevance_score: 0.85 },
            ],
          }),
      } as Response);

      // When: リランキングを実行
      const result = await reranker.rerank("test query", fused, 2);

      // Then: 成功
      expect(result.success).toBe(true);
    });

    it("無効なAPIキーでエラーハンドリングされる", async () => {
      // Given: 無効なAPIキー
      const reranker = new CohereReranker("invalid-api-key");
      const fusion = new RRFFusion();
      const resultSets = new Map<string, SearchResult[]>([
        ["keyword", createMockResults("keyword", 5)],
      ]);
      const weights: SearchWeights = { keyword: 1, semantic: 0, graph: 0 };
      const fused = fusion.fuse(resultSets, weights);

      vi.spyOn(global, "fetch").mockResolvedValue({
        ok: false,
        status: 401,
        statusText: "Unauthorized",
        json: () => Promise.resolve({ error: "Invalid API key" }),
      } as Response);

      // When: リランキングを実行
      const result = await reranker.rerank("test query", fused, 2);

      // Then: エラーが返却される
      expect(result.success).toBe(false);
    });

    it("APIキー期限切れ時にフォールバックが動作する", async () => {
      // Given: 期限切れのAPIキー（401エラー）
      vi.spyOn(global, "fetch").mockResolvedValue({
        ok: false,
        status: 401,
        statusText: "Unauthorized",
        json: () => Promise.resolve({ error: "Token expired" }),
      } as Response);

      const fusion = new RRFFusion();
      const resultSets = new Map<string, SearchResult[]>([
        ["keyword", createMockResults("keyword", 5)],
      ]);
      const weights: SearchWeights = { keyword: 1, semantic: 0, graph: 0 };
      const fused = fusion.fuse(resultSets, weights);

      // When: CohereRerankerが失敗
      const cohereReranker = new CohereReranker("expired-api-key");
      const cohereResult = await cohereReranker.rerank("test query", fused, 3);

      // フォールバック
      let finalResult;
      if (!cohereResult.success) {
        const fallbackReranker = new NoOpReranker();
        finalResult = await fallbackReranker.rerank("test query", fused, 3);
      } else {
        finalResult = cohereResult;
      }

      // Then: フォールバックで成功
      expect(finalResult.success).toBe(true);
    });
  });

  // =============================================================================
  // 状態同期テスト
  // =============================================================================

  describe("状態同期テスト", () => {
    it("結果の一貫性が保たれる（同一入力で同一出力）", () => {
      // Given: 同一の検索結果
      const resultSets = new Map<string, SearchResult[]>([
        ["keyword", createMockResults("keyword", 5)],
        ["semantic", createMockResults("semantic", 5)],
      ]);
      const weights: SearchWeights = { keyword: 0.5, semantic: 0.5, graph: 0 };

      // When: 2回Fusionを実行
      const fusion = new RRFFusion();
      const fused1 = fusion.fuse(resultSets, weights);
      const fused2 = fusion.fuse(resultSets, weights);

      // Then: 同一の結果
      expect(fused1.length).toBe(fused2.length);
      for (let i = 0; i < fused1.length; i++) {
        expect(fused1[i].chunkId).toBe(fused2[i].chunkId);
        expect(fused1[i].fusedScore).toBe(fused2[i].fusedScore);
      }
    });

    it("異なるFusion戦略で異なる結果が得られる", () => {
      // Given: 同一の検索結果
      const resultSets = new Map<string, SearchResult[]>([
        ["keyword", createMockResults("keyword", 5)],
        ["semantic", createMockResults("semantic", 5)],
      ]);
      const weights: SearchWeights = { keyword: 0.5, semantic: 0.5, graph: 0 };

      // When: 異なるFusion戦略で実行
      const rrfFusion = new RRFFusion();
      const weightedFusion = new WeightedScoreFusion();
      const rrfFused = rrfFusion.fuse(resultSets, weights);
      const weightedFused = weightedFusion.fuse(resultSets, weights);

      // Then: 異なる結果（少なくとも順序やスコアが異なる）
      // 完全に同一の結果になる可能性は低い
      expect(rrfFused.length).toBe(weightedFused.length);
      // スコア計算方式が異なるため、通常は異なるスコアになる
      const rrfScores = rrfFused.map((r) => r.fusedScore);
      const weightedScores = weightedFused.map((r) => r.fusedScore);
      expect(rrfScores).not.toEqual(weightedScores);
    });
  });
});
