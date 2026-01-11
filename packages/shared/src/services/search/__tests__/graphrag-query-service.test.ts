/**
 * @file GraphRAGクエリサービス ユニットテスト
 * @description Phase 4: TDD Red - GraphRAGQueryServiceのテスト
 * CONV-08-04: コミュニティ要約統合
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
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

// モックデータ
const mockCommunitySummary: CommunitySummary = {
  communityId: createCommunityId("comm-1"),
  level: 0,
  summary: "機械学習とデータ分析に関するコミュニティ要約",
  keywords: ["機械学習", "AI", "データ分析"],
  mainEntities: ["TensorFlow", "PyTorch"],
  mainRelations: ["使用される", "比較される"],
  sentiment: "neutral",
  confidence: 0.9,
  tokenCount: 100,
  embedding: [0.1, 0.2, 0.3],
  createdAt: new Date(),
};

const mockLowConfidenceSummary: CommunitySummary = {
  ...mockCommunitySummary,
  communityId: createCommunityId("comm-2"),
  confidence: 0.3,
};

describe("GraphRAGQueryService", () => {
  let mockCommunitySummarizer: ICommunitySummarizer;
  let mockQueryClassifier: IQueryClassifier;
  let mockEmbeddingProvider: IEmbeddingProvider;
  let mockLLMProvider: ILLMProvider;
  let service: GraphRAGQueryService;

  beforeEach(() => {
    // ICommunitySummarizer モック
    mockCommunitySummarizer = {
      searchSummaries: vi.fn(),
      summarize: vi.fn(),
      summarizeAll: vi.fn(),
      updateSummary: vi.fn(),
    };

    // IQueryClassifier モック
    mockQueryClassifier = {
      classify: vi.fn().mockResolvedValue(
        ok({
          type: "global" as QueryType,
          confidence: 0.8,
          extractedEntities: [],
          keywords: [],
          intent: "全体概要を知りたい",
        }),
      ),
      getSearchWeights: vi.fn().mockReturnValue({
        keyword: 0.2,
        semantic: 0.3,
        graph: 0.5,
      } as SearchWeights),
    };

    // IEmbeddingProvider モック
    mockEmbeddingProvider = {
      modelId: "test-embedding-model" as any,
      providerName: "test" as any,
      dimensions: 1536,
      maxTokens: 8000,
      embed: vi.fn().mockResolvedValue({
        embedding: [0.1, 0.2, 0.3],
        tokenCount: 10,
      }),
      embedBatch: vi.fn(),
      countTokens: vi.fn().mockReturnValue(10),
      healthCheck: vi.fn().mockResolvedValue(true),
    };

    // ILLMProvider モック
    mockLLMProvider = {
      modelId: "test-llm-model",
      generate: vi.fn().mockResolvedValue(
        ok({
          text: "機械学習は人工知能の一分野であり、データから学習するアルゴリズムを研究する分野です。",
          tokensUsed: 50,
        }),
      ),
    };

    // サービスインスタンス生成
    service = new GraphRAGQueryService({
      queryClassifier: mockQueryClassifier,
      communitySummarizer: mockCommunitySummarizer,
      embeddingProvider: mockEmbeddingProvider,
      llmProvider: mockLLMProvider,
    });
  });

  describe("query", () => {
    describe("正常系", () => {
      it("関連コミュニティ要約が存在する場合、回答にコンテキストが含まれる", async () => {
        // Arrange
        const query = "機械学習とデータ分析について教えて";
        vi.mocked(mockCommunitySummarizer.searchSummaries).mockResolvedValue(
          ok([mockCommunitySummary]),
        );

        // Act
        const result = await service.query(query);

        // Assert
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.communitySummaries).toHaveLength(1);
          expect(result.data.communitySummaries[0].communityId).toBe("comm-1");
          expect(result.data.answer).toBeDefined();
          expect(result.data.answer.length).toBeGreaterThan(0);
        }
      });

      it("関連コミュニティがない場合、フォールバックで回答生成される", async () => {
        // Arrange
        const query = "存在しないトピックについて";
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
          expect(result.data.metadata.searchStrategy.usedCommunitySummary).toBe(
            false,
          );
        }
      });

      it("階層レベル指定で検索が実行される", async () => {
        // Arrange
        const query = "テストクエリ";
        const options = { communityLevel: 1 };
        vi.mocked(mockCommunitySummarizer.searchSummaries).mockResolvedValue(
          ok([]),
        );

        // Act
        await service.query(query, options);

        // Assert
        expect(mockCommunitySummarizer.searchSummaries).toHaveBeenCalledWith(
          query,
          expect.objectContaining({ level: 1 }),
        );
      });

      it("confidence閾値によるフィルタリングが機能する", async () => {
        // Arrange
        const query = "テストクエリ";
        vi.mocked(mockCommunitySummarizer.searchSummaries).mockResolvedValue(
          ok([mockCommunitySummary, mockLowConfidenceSummary]),
        );
        const options = { confidenceThreshold: 0.5 };

        // Act
        const result = await service.query(query, options);

        // Assert
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.communitySummaries).toHaveLength(1);
          expect(
            result.data.communitySummaries[0].confidence,
          ).toBeGreaterThanOrEqual(0.5);
        }
      });

      it("limit指定で検索結果数が制限される", async () => {
        // Arrange
        const query = "テストクエリ";
        const options = { limit: 3 };
        vi.mocked(mockCommunitySummarizer.searchSummaries).mockResolvedValue(
          ok([]),
        );

        // Act
        await service.query(query, options);

        // Assert
        expect(mockCommunitySummarizer.searchSummaries).toHaveBeenCalledWith(
          query,
          expect.objectContaining({ limit: 3 }),
        );
      });

      it("enableCommunitySummary=false の場合、コミュニティ検索がスキップされる", async () => {
        // Arrange
        const query = "テストクエリ";
        const options = { enableCommunitySummary: false };

        // Act
        const result = await service.query(query, options);

        // Assert
        expect(mockCommunitySummarizer.searchSummaries).not.toHaveBeenCalled();
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.communitySummaries).toHaveLength(0);
          expect(result.data.metadata.communitySummarySearchExecuted).toBe(
            false,
          );
        }
      });

      it("クエリタイプがmetadataに含まれる", async () => {
        // Arrange
        const query = "グローバルな概要を教えて";
        vi.mocked(mockCommunitySummarizer.searchSummaries).mockResolvedValue(
          ok([]),
        );

        // Act
        const result = await service.query(query);

        // Assert
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.metadata.queryType).toBe("global");
        }
      });

      it("処理時間がmetadataに含まれる", async () => {
        // Arrange
        const query = "テストクエリ";
        vi.mocked(mockCommunitySummarizer.searchSummaries).mockResolvedValue(
          ok([]),
        );

        // Act
        const result = await service.query(query);

        // Assert
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.metadata.processingTimeMs).toBeGreaterThanOrEqual(
            0,
          );
        }
      });
    });

    describe("異常系", () => {
      it("クエリが空の場合、バリデーションエラーを返す", async () => {
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

      it("クエリが長すぎる場合、バリデーションエラーを返す", async () => {
        // Arrange
        const query = "a".repeat(10001);

        // Act
        const result = await service.query(query);

        // Assert
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.code).toBe("INVALID_QUERY");
        }
      });

      it("limitが範囲外の場合、バリデーションエラーを返す", async () => {
        // Arrange
        const query = "テストクエリ";
        const options = { limit: -1 };

        // Act
        const result = await service.query(query, options);

        // Assert
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.code).toBe("INVALID_QUERY");
        }
      });

      it("confidenceThresholdが範囲外の場合、バリデーションエラーを返す", async () => {
        // Arrange
        const query = "テストクエリ";
        const options = { confidenceThreshold: 1.5 };

        // Act
        const result = await service.query(query, options);

        // Assert
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.code).toBe("INVALID_QUERY");
        }
      });

      it("コミュニティ検索エラー時、フォールバックで処理継続", async () => {
        // Arrange
        const query = "テストクエリ";
        vi.mocked(mockCommunitySummarizer.searchSummaries).mockResolvedValue(
          err(new Error("Search failed")),
        );

        // Act
        const result = await service.query(query);

        // Assert
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.communitySummaries).toHaveLength(0);
          expect(result.data.metadata.searchStrategy.fallbackOccurred).toBe(
            true,
          );
        }
      });

      it("LLM生成エラー時、エラーを返す", async () => {
        // Arrange
        const query = "テストクエリ";
        vi.mocked(mockCommunitySummarizer.searchSummaries).mockResolvedValue(
          ok([]),
        );
        vi.mocked(mockLLMProvider.generate).mockResolvedValue(
          err(new Error("LLM failed")),
        );

        // Act
        const result = await service.query(query);

        // Assert
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.code).toBe("LLM_GENERATION_FAILED");
        }
      });

      it("クエリ分類エラー時、hybridタイプでフォールバック", async () => {
        // Arrange
        const query = "テストクエリ";
        vi.mocked(mockQueryClassifier.classify).mockResolvedValue(
          err(new Error("Classification failed")),
        );
        vi.mocked(mockCommunitySummarizer.searchSummaries).mockResolvedValue(
          ok([]),
        );

        // Act
        const result = await service.query(query);

        // Assert
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.metadata.queryType).toBe("hybrid");
        }
      });
    });

    describe("境界値テスト", () => {
      it("limit=1の場合、1件のみ検索される", async () => {
        // Arrange
        const query = "テストクエリ";
        const options = { limit: 1 };
        vi.mocked(mockCommunitySummarizer.searchSummaries).mockResolvedValue(
          ok([]),
        );

        // Act
        await service.query(query, options);

        // Assert
        expect(mockCommunitySummarizer.searchSummaries).toHaveBeenCalledWith(
          query,
          expect.objectContaining({ limit: 1 }),
        );
      });

      it("limit=20（最大値）の場合、正常に処理される", async () => {
        // Arrange
        const query = "テストクエリ";
        const options = { limit: 20 };
        vi.mocked(mockCommunitySummarizer.searchSummaries).mockResolvedValue(
          ok([]),
        );

        // Act
        const result = await service.query(query, options);

        // Assert
        expect(result.success).toBe(true);
        expect(mockCommunitySummarizer.searchSummaries).toHaveBeenCalledWith(
          query,
          expect.objectContaining({ limit: 20 }),
        );
      });

      it("confidenceThreshold=0の場合、全ての要約が含まれる", async () => {
        // Arrange
        const query = "テストクエリ";
        vi.mocked(mockCommunitySummarizer.searchSummaries).mockResolvedValue(
          ok([mockCommunitySummary, mockLowConfidenceSummary]),
        );
        const options = { confidenceThreshold: 0 };

        // Act
        const result = await service.query(query, options);

        // Assert
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.communitySummaries).toHaveLength(2);
        }
      });

      it("confidenceThreshold=1の場合、confidence=1のみ含まれる", async () => {
        // Arrange
        const query = "テストクエリ";
        const perfectConfidenceSummary: CommunitySummary = {
          ...mockCommunitySummary,
          communityId: createCommunityId("comm-perfect"),
          confidence: 1.0,
        };
        vi.mocked(mockCommunitySummarizer.searchSummaries).mockResolvedValue(
          ok([mockCommunitySummary, perfectConfidenceSummary]),
        );
        const options = { confidenceThreshold: 1 };

        // Act
        const result = await service.query(query, options);

        // Assert
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.communitySummaries).toHaveLength(1);
          expect(result.data.communitySummaries[0].confidence).toBe(1.0);
        }
      });

      it("communityLevel=0の場合、レベル0のみ検索される", async () => {
        // Arrange
        const query = "テストクエリ";
        const options = { communityLevel: 0 };
        vi.mocked(mockCommunitySummarizer.searchSummaries).mockResolvedValue(
          ok([]),
        );

        // Act
        await service.query(query, options);

        // Assert
        expect(mockCommunitySummarizer.searchSummaries).toHaveBeenCalledWith(
          query,
          expect.objectContaining({ level: 0 }),
        );
      });

      it("communityLevel=5（最大値）の場合、正常に処理される", async () => {
        // Arrange
        const query = "テストクエリ";
        const options = { communityLevel: 5 };
        vi.mocked(mockCommunitySummarizer.searchSummaries).mockResolvedValue(
          ok([]),
        );

        // Act
        const result = await service.query(query, options);

        // Assert
        expect(result.success).toBe(true);
        expect(mockCommunitySummarizer.searchSummaries).toHaveBeenCalledWith(
          query,
          expect.objectContaining({ level: 5 }),
        );
      });
    });

    describe("空・nullケーステスト", () => {
      it("クエリが空白のみの場合、バリデーションエラー", async () => {
        // Arrange
        const query = "   ";

        // Act
        const result = await service.query(query);

        // Assert
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.code).toBe("INVALID_QUERY");
        }
      });

      it("undefinedオプションの場合、デフォルト値が適用される", async () => {
        // Arrange
        const query = "テストクエリ";
        vi.mocked(mockCommunitySummarizer.searchSummaries).mockResolvedValue(
          ok([]),
        );

        // Act
        const result = await service.query(query, undefined);

        // Assert
        expect(result.success).toBe(true);
        expect(mockCommunitySummarizer.searchSummaries).toHaveBeenCalledWith(
          query,
          expect.objectContaining({ limit: 10 }),
        );
      });

      it("空オブジェクトオプションの場合、デフォルト値が適用される", async () => {
        // Arrange
        const query = "テストクエリ";
        vi.mocked(mockCommunitySummarizer.searchSummaries).mockResolvedValue(
          ok([]),
        );

        // Act
        const result = await service.query(query, {});

        // Assert
        expect(result.success).toBe(true);
        expect(mockCommunitySummarizer.searchSummaries).toHaveBeenCalledWith(
          query,
          expect.objectContaining({ limit: 10 }),
        );
      });
    });
  });
});
