/**
 * @file GraphRAGクエリサービス 統合テスト
 * @description Phase 4: TDD Red - GraphRAGQueryServiceの統合テスト
 * CONV-08-04: コミュニティ要約統合
 *
 * 統合テストカテゴリ:
 * - API接続テスト: ICommunitySummarizer接続確認
 * - データフローテスト: クエリ→埋め込み→検索→回答の往復
 * - エラーハンドリング: コミュニティ検索失敗時のフォールバック
 * - 状態同期テスト: 複数クエリの並行処理
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { GraphRAGQueryService } from "../graphrag-query-service";
import type { ICommunitySummarizer } from "../../graph/interfaces/community-summarizer.interface";
import type { IQueryClassifier, QueryType, SearchWeights } from "../types";
import type { ILLMProvider } from "../../extraction/interfaces";
import type { IEmbeddingProvider } from "../../embedding/providers/interfaces";
import type { CommunityId } from "../../../types/rag/branded";
import type { CommunitySummary } from "../../graph/types";
import { ok, err } from "../../../types/rag/result";

// Branded Type Creator
const createCommunityId = (id: string): CommunityId => id as CommunityId;

// 統合テスト用モックデータ
const createMockSummaries = (count: number): CommunitySummary[] => {
  return Array.from({ length: count }, (_, i) => ({
    communityId: createCommunityId(`comm-${i + 1}`),
    level: i % 3,
    summary: `コミュニティ ${i + 1} の要約テキスト`,
    keywords: [`keyword-${i}`, "common"],
    mainEntities: [`entity-${i}`],
    mainRelations: [`relation-${i}`],
    sentiment: "neutral" as const,
    confidence: 0.5 + (i % 5) * 0.1,
    tokenCount: 100,
    embedding: [0.1, 0.2, 0.3],
    createdAt: new Date(),
  }));
};

describe("GraphRAGQueryService Integration", () => {
  let mockCommunitySummarizer: ICommunitySummarizer;
  let mockQueryClassifier: IQueryClassifier;
  let mockEmbeddingProvider: IEmbeddingProvider;
  let mockLLMProvider: ILLMProvider;
  let service: GraphRAGQueryService;

  beforeEach(() => {
    // 統合テスト用モック設定
    mockCommunitySummarizer = {
      searchSummaries: vi.fn().mockResolvedValue(ok(createMockSummaries(5))),
      summarize: vi.fn(),
      summarizeAll: vi.fn(),
      updateSummary: vi.fn(),
    };

    mockQueryClassifier = {
      classify: vi.fn().mockResolvedValue(
        ok({
          type: "global" as QueryType,
          confidence: 0.85,
          extractedEntities: ["テスト"],
          keywords: ["テスト", "クエリ"],
          intent: "情報を取得したい",
        }),
      ),
      getSearchWeights: vi.fn().mockReturnValue({
        keyword: 0.2,
        semantic: 0.3,
        graph: 0.5,
      } as SearchWeights),
    };

    mockEmbeddingProvider = {
      modelId: "integration-test-embedding" as any,
      providerName: "test" as any,
      dimensions: 1536,
      maxTokens: 8000,
      embed: vi.fn().mockResolvedValue({
        embedding: Array.from({ length: 1536 }, () => Math.random()),
        tokenCount: 10,
      }),
      embedBatch: vi.fn(),
      countTokens: vi.fn().mockReturnValue(10),
      healthCheck: vi.fn().mockResolvedValue(true),
    };

    mockLLMProvider = {
      modelId: "integration-test-llm",
      generate: vi.fn().mockResolvedValue(
        ok({
          text: "これは統合テスト用の回答です。コミュニティ要約を参考にして回答を生成しました。",
          tokensUsed: 100,
        }),
      ),
    };

    service = new GraphRAGQueryService({
      queryClassifier: mockQueryClassifier,
      communitySummarizer: mockCommunitySummarizer,
      embeddingProvider: mockEmbeddingProvider,
      llmProvider: mockLLMProvider,
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("API接続テスト", () => {
    it("ICommunitySummarizer.searchSummaries が正しく呼び出される", async () => {
      // Arrange
      const query = "テストクエリ";

      // Act
      await service.query(query);

      // Assert
      expect(mockCommunitySummarizer.searchSummaries).toHaveBeenCalledTimes(1);
      expect(mockCommunitySummarizer.searchSummaries).toHaveBeenCalledWith(
        query,
        expect.any(Object),
      );
    });

    it("IQueryClassifier.classify が正しく呼び出される", async () => {
      // Arrange
      const query = "テストクエリ";

      // Act
      await service.query(query);

      // Assert
      expect(mockQueryClassifier.classify).toHaveBeenCalledTimes(1);
      expect(mockQueryClassifier.classify).toHaveBeenCalledWith(query);
    });

    it("ILLMProvider.generate が正しく呼び出される", async () => {
      // Arrange
      const query = "テストクエリ";

      // Act
      await service.query(query);

      // Assert
      expect(mockLLMProvider.generate).toHaveBeenCalledTimes(1);
      expect(mockLLMProvider.generate).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(Object),
      );
    });
  });

  describe("データフローテスト: クエリ→分類→検索→回答", () => {
    it("E2E: コミュニティ要約を含む回答が生成される", async () => {
      // Arrange
      const query = "システム設計のベストプラクティスについて";

      // Act
      const result = await service.query(query);

      // Assert
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.answer).toBeDefined();
        expect(result.data.answer.length).toBeGreaterThan(0);
        expect(result.data.communitySummaries).toHaveLength(5);
        expect(result.data.metadata.queryType).toBe("global");
        expect(result.data.metadata.processingTimeMs).toBeGreaterThanOrEqual(0);
      }
    });

    it("E2E: 分類結果に応じた検索オプションが適用される", async () => {
      // Arrange
      const query = "ReactとVueの違いは？";
      vi.mocked(mockQueryClassifier.classify).mockResolvedValue(
        ok({
          type: "relationship" as QueryType,
          confidence: 0.9,
          extractedEntities: ["React", "Vue"],
          keywords: ["React", "Vue", "違い"],
          intent: "比較したい",
          relationHint: "comparison",
        }),
      );

      // Act
      const result = await service.query(query);

      // Assert
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.metadata.queryType).toBe("relationship");
      }
    });

    it("E2E: オプション指定が全コンポーネントに伝播される", async () => {
      // Arrange
      const query = "テストクエリ";
      const options = {
        limit: 3,
        communityLevel: 1,
        confidenceThreshold: 0.7,
      };

      // Act
      await service.query(query, options);

      // Assert
      expect(mockCommunitySummarizer.searchSummaries).toHaveBeenCalledWith(
        query,
        expect.objectContaining({
          limit: 3,
          level: 1,
        }),
      );
    });
  });

  describe("エラーハンドリングテスト", () => {
    it("コミュニティ検索失敗時、フォールバックで回答生成が完了する", async () => {
      // Arrange
      const query = "テストクエリ";
      vi.mocked(mockCommunitySummarizer.searchSummaries).mockResolvedValue(
        err(new Error("Database connection failed")),
      );

      // Act
      const result = await service.query(query);

      // Assert
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.communitySummaries).toHaveLength(0);
        expect(result.data.metadata.searchStrategy.fallbackOccurred).toBe(true);
        expect(result.data.answer).toBeDefined();
      }
    });

    it("クエリ分類失敗時、hybridタイプで処理継続される", async () => {
      // Arrange
      const query = "テストクエリ";
      vi.mocked(mockQueryClassifier.classify).mockResolvedValue(
        err(new Error("Classification service unavailable")),
      );

      // Act
      const result = await service.query(query);

      // Assert
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.metadata.queryType).toBe("hybrid");
        expect(result.data.answer).toBeDefined();
      }
    });

    it("LLM生成失敗時、適切なエラーが返される", async () => {
      // Arrange
      const query = "テストクエリ";
      vi.mocked(mockLLMProvider.generate).mockResolvedValue(
        err(new Error("Rate limit exceeded")),
      );

      // Act
      const result = await service.query(query);

      // Assert
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe("LLM_GENERATION_FAILED");
        expect(result.error.message).toContain("Rate limit exceeded");
      }
    });
  });

  describe("状態同期テスト", () => {
    it("複数クエリの並行処理が正しく動作する", async () => {
      // Arrange
      const queries = ["クエリ1", "クエリ2", "クエリ3"];

      // Act
      const results = await Promise.all(queries.map((q) => service.query(q)));

      // Assert
      expect(results).toHaveLength(3);
      results.forEach((result) => {
        expect(result.success).toBe(true);
      });
      expect(mockCommunitySummarizer.searchSummaries).toHaveBeenCalledTimes(3);
      expect(mockLLMProvider.generate).toHaveBeenCalledTimes(3);
    });

    it("各クエリが独立したコンテキストで処理される", async () => {
      // Arrange
      const query1 = "クエリ1";
      const query2 = "クエリ2";

      vi.mocked(mockCommunitySummarizer.searchSummaries)
        .mockResolvedValueOnce(ok(createMockSummaries(3)))
        .mockResolvedValueOnce(ok(createMockSummaries(1)));

      // Act
      const [result1, result2] = await Promise.all([
        service.query(query1),
        service.query(query2),
      ]);

      // Assert
      expect(result1.success).toBe(true);
      expect(result2.success).toBe(true);
      if (result1.success && result2.success) {
        expect(result1.data.communitySummaries).toHaveLength(3);
        expect(result2.data.communitySummaries).toHaveLength(1);
      }
    });
  });

  describe("パフォーマンステスト", () => {
    it("検索レイテンシが許容範囲内である", async () => {
      // Arrange
      const query = "パフォーマンステストクエリ";
      const startTime = performance.now();

      // Act
      await service.query(query, { limit: 10 });

      // Assert
      const elapsed = performance.now() - startTime;
      // モック使用のため実際のレイテンシは低いが、テスト構造を確認
      expect(elapsed).toBeLessThan(1000); // 1秒以内
    });
  });

  describe("受け入れ基準検証", () => {
    it("AC01: 関連コミュニティが存在するクエリで要約がコンテキストに含まれる", async () => {
      // Arrange
      const query = "機械学習について教えて";
      vi.mocked(mockCommunitySummarizer.searchSummaries).mockResolvedValue(
        ok(createMockSummaries(3)),
      );

      // Act
      const result = await service.query(query);

      // Assert
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.communitySummaries.length).toBeGreaterThan(0);
        expect(result.data.metadata.searchStrategy.usedCommunitySummary).toBe(
          true,
        );
      }
    });

    it("AC02: 関連コミュニティがないクエリで通常回答生成", async () => {
      // Arrange
      const query = "完全にランダムなトピック";
      vi.mocked(mockCommunitySummarizer.searchSummaries).mockResolvedValue(
        ok([]),
      );

      // Act
      const result = await service.query(query);

      // Assert
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.communitySummaries).toHaveLength(0);
        expect(result.data.answer).toBeDefined();
      }
    });

    it("AC03: communityLevel指定で該当レベルのみ検索", async () => {
      // Arrange
      const query = "テストクエリ";
      const options = { communityLevel: 2 };

      // Act
      await service.query(query, options);

      // Assert
      expect(mockCommunitySummarizer.searchSummaries).toHaveBeenCalledWith(
        query,
        expect.objectContaining({ level: 2 }),
      );
    });

    it("AC05: confidenceThreshold指定で閾値未満が除外される", async () => {
      // Arrange
      const query = "テストクエリ";
      const summaries = [
        { ...createMockSummaries(1)[0], confidence: 0.9 },
        {
          ...createMockSummaries(1)[0],
          communityId: createCommunityId("low"),
          confidence: 0.3,
        },
      ];
      vi.mocked(mockCommunitySummarizer.searchSummaries).mockResolvedValue(
        ok(summaries),
      );
      const options = { confidenceThreshold: 0.5 };

      // Act
      const result = await service.query(query, options);

      // Assert
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.communitySummaries).toHaveLength(1);
        expect(result.data.communitySummaries[0].confidence).toBe(0.9);
      }
    });

    it("AC06: limit指定で結果数が制限される", async () => {
      // Arrange
      const query = "テストクエリ";
      const options = { limit: 5 };

      // Act
      await service.query(query, options);

      // Assert
      expect(mockCommunitySummarizer.searchSummaries).toHaveBeenCalledWith(
        query,
        expect.objectContaining({ limit: 5 }),
      );
    });

    it("AC07: enableCommunitySummary=false でスキップされる", async () => {
      // Arrange
      const query = "テストクエリ";
      const options = { enableCommunitySummary: false };

      // Act
      const result = await service.query(query, options);

      // Assert
      expect(mockCommunitySummarizer.searchSummaries).not.toHaveBeenCalled();
      expect(result.success).toBe(true);
    });

    it("AC08: 空クエリでバリデーションエラー", async () => {
      // Arrange
      const query = "";

      // Act
      const result = await service.query(query);

      // Assert
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe("INVALID_QUERY");
      }
    });

    it("AC09: 無効なオプション値でバリデーションエラー", async () => {
      // Arrange
      const query = "テストクエリ";
      const options = { limit: 100 }; // max は 20

      // Act
      const result = await service.query(query, options);

      // Assert
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe("INVALID_QUERY");
      }
    });
  });
});
