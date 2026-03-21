/**
 * @file HybridRAGFactory テスト
 * @description UT-RAG-08-002 Phase 4: ファクトリの組み立てロジック検証
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import type { IQueryClassifier } from "../types";
import type { ISearchStrategy } from "../strategies/types";
import type { IFusionStrategy } from "../fusion/types";
import type { IReranker } from "../reranking/types";
import type { ICorrectiveRAG } from "../crag/types";

// ========================================
// 具象クラスをモック化
// ========================================

vi.mock("../rule-based-query-classifier", () => ({
  RuleBasedQueryClassifier: vi.fn(),
}));

vi.mock("../llm-query-classifier", () => ({
  LLMQueryClassifier: vi.fn(),
}));

vi.mock("../strategies/vector-search-strategy", () => ({
  VectorSearchStrategy: vi.fn(),
}));

vi.mock("../strategies/graph-search-strategy", () => ({
  GraphSearchStrategy: vi.fn(),
}));

vi.mock("../reranking/cross-encoder-reranker", () => ({
  CohereReranker: vi.fn(),
  VoyageReranker: vi.fn(),
  LLMReranker: vi.fn(),
  NoOpReranker: vi.fn(),
}));

vi.mock("../crag/corrective-rag", () => ({
  CorrectiveRAG: vi.fn(),
}));

vi.mock("../crag/relevance-evaluator", () => ({
  RelevanceEvaluator: vi.fn(),
}));

vi.mock("../fusion/rrf-fusion", () => ({
  RRFFusion: vi.fn(),
}));

vi.mock("../hybrid-rag-engine", () => ({
  HybridRAGEngine: vi.fn(),
}));

// ========================================
// モックされたクラスのimport
// ========================================

import { RuleBasedQueryClassifier } from "../rule-based-query-classifier";
import { LLMQueryClassifier } from "../llm-query-classifier";
import { VectorSearchStrategy } from "../strategies/vector-search-strategy";
import { GraphSearchStrategy } from "../strategies/graph-search-strategy";
import { KeywordSearchStrategyAdapter } from "../strategies/keyword-search-strategy-adapter";
import {
  CohereReranker,
  VoyageReranker,
  LLMReranker,
  NoOpReranker,
} from "../reranking/cross-encoder-reranker";
import { CorrectiveRAG } from "../crag/corrective-rag";
import { RelevanceEvaluator } from "../crag/relevance-evaluator";
import { RRFFusion } from "../fusion/rrf-fusion";
import { HybridRAGEngine } from "../hybrid-rag-engine";
import {
  HybridRAGFactory,
  type FullHybridRAGConfig,
  type LiteHybridRAGConfig,
  type TestMocks,
} from "../hybrid-rag-factory";

const CREATE_FULL_ERROR_PREFIX = "HybridRAGFactory.createFull():";

// ========================================
// テストヘルパー
// ========================================

function createBaseFullConfig(
  overrides: Partial<FullHybridRAGConfig> = {},
): FullHybridRAGConfig {
  return {
    db: {} as FullHybridRAGConfig["db"],
    embeddingProvider: {
      embed: vi.fn(),
      embedBatch: vi.fn(),
    } as unknown as FullHybridRAGConfig["embeddingProvider"],
    graphStore: {} as FullHybridRAGConfig["graphStore"],
    llmProvider: {} as FullHybridRAGConfig["llmProvider"],
    rerankerType: "none",
    ...overrides,
  };
}

function createBaseLiteConfig(
  overrides: Partial<LiteHybridRAGConfig> = {},
): LiteHybridRAGConfig {
  return {
    db: {} as LiteHybridRAGConfig["db"],
    embeddingProvider: {
      embed: vi.fn(),
      embedBatch: vi.fn(),
    } as unknown as LiteHybridRAGConfig["embeddingProvider"],
    graphStore: {} as LiteHybridRAGConfig["graphStore"],
    ...overrides,
  };
}

// ========================================
// テスト
// ========================================

describe("HybridRAGFactory", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // -------------------------------------------
  // createFull() 正常系
  // -------------------------------------------
  describe("createFull()", () => {
    describe("rerankerType バリエーション", () => {
      it("rerankerType: 'none' で NoOpReranker を使用する", () => {
        const config = createBaseFullConfig({ rerankerType: "none" });
        HybridRAGFactory.createFull(config);

        expect(NoOpReranker).toHaveBeenCalledOnce();
        expect(CohereReranker).not.toHaveBeenCalled();
        expect(VoyageReranker).not.toHaveBeenCalled();
        expect(LLMReranker).not.toHaveBeenCalled();
      });

      it("rerankerType: 'cohere' で CohereReranker を使用する", () => {
        const config = createBaseFullConfig({
          rerankerType: "cohere",
          cohereApiKey: "test-cohere-key",
          cohereModel: "rerank-english-v3.0",
        });
        HybridRAGFactory.createFull(config);

        expect(CohereReranker).toHaveBeenCalledWith("test-cohere-key", {
          model: "rerank-english-v3.0",
        });
      });

      it("rerankerType: 'voyage' で VoyageReranker を使用する", () => {
        const config = createBaseFullConfig({
          rerankerType: "voyage",
          voyageApiKey: "test-voyage-key",
        });
        HybridRAGFactory.createFull(config);

        expect(VoyageReranker).toHaveBeenCalledWith("test-voyage-key", {});
      });

      it("rerankerType: 'llm' で LLMReranker を使用する", () => {
        const mockRerankerLlmClient = { complete: vi.fn() };
        const config = createBaseFullConfig({
          rerankerType: "llm",
          rerankerLlmClient:
            mockRerankerLlmClient as unknown as FullHybridRAGConfig["rerankerLlmClient"],
          rerankerBatchSize: 5,
        });
        HybridRAGFactory.createFull(config);

        expect(LLMReranker).toHaveBeenCalledWith(mockRerankerLlmClient, {
          batchSize: 5,
        });
      });
    });

    describe("CRAG設定", () => {
      it("enableCRAG: true で CorrectiveRAG を生成する", () => {
        const mockCragLlmClient = { complete: vi.fn() };
        const config = createBaseFullConfig({
          enableCRAG: true,
          cragLlmClient:
            mockCragLlmClient as unknown as FullHybridRAGConfig["cragLlmClient"],
          cragMaxEvaluate: 3,
          cragCorrectThreshold: 0.8,
          cragIncorrectThreshold: 0.3,
        });
        HybridRAGFactory.createFull(config);

        expect(RelevanceEvaluator).toHaveBeenCalledWith(mockCragLlmClient, {
          maxEvaluate: 3,
          correctThreshold: 0.8,
          incorrectThreshold: 0.3,
        });
        expect(CorrectiveRAG).toHaveBeenCalledOnce();
      });

      it("enableCRAG: false (デフォルト) で CRAG を null にする", () => {
        const config = createBaseFullConfig({ enableCRAG: false });
        HybridRAGFactory.createFull(config);

        expect(RelevanceEvaluator).not.toHaveBeenCalled();
        expect(CorrectiveRAG).not.toHaveBeenCalled();
        // HybridRAGEngine のコンストラクタ引数の crag が null
        expect(HybridRAGEngine).toHaveBeenCalledWith(
          expect.anything(), // queryClassifier
          expect.anything(), // strategies
          expect.anything(), // fusion
          expect.anything(), // reranker
          null, // crag
          expect.anything(), // options
        );
      });
    });

    describe("コンポーネント組み立て", () => {
      it("LLMQueryClassifier + RuleBasedQueryClassifier(fallback) を生成する", () => {
        const config = createBaseFullConfig();
        HybridRAGFactory.createFull(config);

        expect(RuleBasedQueryClassifier).toHaveBeenCalledOnce();
        expect(LLMQueryClassifier).toHaveBeenCalledWith(
          config.llmProvider,
          expect.any(Object), // RuleBasedQueryClassifier instance
        );
      });

      it("VectorSearchStrategy と GraphSearchStrategy を生成する", () => {
        const config = createBaseFullConfig();
        HybridRAGFactory.createFull(config);

        expect(VectorSearchStrategy).toHaveBeenCalledWith(
          config.db,
          config.embeddingProvider,
        );
        expect(GraphSearchStrategy).toHaveBeenCalledWith(
          config.graphStore,
          config.embeddingProvider,
          undefined, // communitySummarizer (optional)
        );
      });

      it("RRFFusion を生成する", () => {
        const config = createBaseFullConfig({ rrfK: 30 });
        HybridRAGFactory.createFull(config);

        expect(RRFFusion).toHaveBeenCalledWith(30);
      });

      it("HybridRAGEngine に全コンポーネントを渡す", () => {
        const config = createBaseFullConfig();
        HybridRAGFactory.createFull(config);

        expect(HybridRAGEngine).toHaveBeenCalledWith(
          expect.anything(), // queryClassifier
          expect.objectContaining({
            keyword: expect.anything(),
            semantic: expect.anything(),
            graph: expect.anything(),
          }),
          expect.anything(), // fusion
          expect.anything(), // reranker
          null, // crag (enableCRAG default=false)
          expect.anything(), // options
        );
      });
    });
  });

  // -------------------------------------------
  // createFull() エラー系
  // -------------------------------------------
  describe("createFull() バリデーション", () => {
    it("rerankerType: 'cohere' で cohereApiKey 未指定はエラー", () => {
      const config = createBaseFullConfig({ rerankerType: "cohere" });
      expect(() => HybridRAGFactory.createFull(config)).toThrow(
        `${CREATE_FULL_ERROR_PREFIX} cohereApiKey is required when rerankerType is 'cohere'`,
      );
    });

    it("rerankerType: 'cohere' で cohereApiKey が空白のみはエラー (P42)", () => {
      const config = createBaseFullConfig({
        rerankerType: "cohere",
        cohereApiKey: "   ",
      });
      expect(() => HybridRAGFactory.createFull(config)).toThrow(
        `${CREATE_FULL_ERROR_PREFIX} cohereApiKey is required when rerankerType is 'cohere'`,
      );
    });

    it("rerankerType: 'voyage' で voyageApiKey 未指定はエラー", () => {
      const config = createBaseFullConfig({ rerankerType: "voyage" });
      expect(() => HybridRAGFactory.createFull(config)).toThrow(
        `${CREATE_FULL_ERROR_PREFIX} voyageApiKey is required when rerankerType is 'voyage'`,
      );
    });

    it("rerankerType: 'voyage' で voyageApiKey が空白のみはエラー (P42)", () => {
      const config = createBaseFullConfig({
        rerankerType: "voyage",
        voyageApiKey: "   ",
      });
      expect(() => HybridRAGFactory.createFull(config)).toThrow(
        `${CREATE_FULL_ERROR_PREFIX} voyageApiKey is required when rerankerType is 'voyage'`,
      );
    });

    it("rerankerType: 'llm' で rerankerLlmClient 未指定はエラー", () => {
      const config = createBaseFullConfig({ rerankerType: "llm" });
      expect(() => HybridRAGFactory.createFull(config)).toThrow(
        `${CREATE_FULL_ERROR_PREFIX} rerankerLlmClient is required when rerankerType is 'llm'`,
      );
    });

    it("enableCRAG: true で cragLlmClient 未指定はエラー", () => {
      const config = createBaseFullConfig({ enableCRAG: true });
      expect(() => HybridRAGFactory.createFull(config)).toThrow(
        `${CREATE_FULL_ERROR_PREFIX} cragLlmClient is required when enableCRAG is true`,
      );
    });
  });

  // -------------------------------------------
  // createLite()
  // -------------------------------------------
  describe("createLite()", () => {
    it("RuleBasedQueryClassifier を使用する", () => {
      const config = createBaseLiteConfig();
      HybridRAGFactory.createLite(config);

      expect(RuleBasedQueryClassifier).toHaveBeenCalledOnce();
      expect(LLMQueryClassifier).not.toHaveBeenCalled();
    });

    it("NoOpReranker を使用する", () => {
      const config = createBaseLiteConfig();
      HybridRAGFactory.createLite(config);

      expect(NoOpReranker).toHaveBeenCalledOnce();
    });

    it("CRAG は null で渡す", () => {
      const config = createBaseLiteConfig();
      HybridRAGFactory.createLite(config);

      expect(HybridRAGEngine).toHaveBeenCalledWith(
        expect.anything(),
        expect.anything(),
        expect.anything(),
        expect.anything(),
        null, // crag
        expect.anything(),
      );
    });

    it("VectorSearchStrategy と GraphSearchStrategy を生成する", () => {
      const config = createBaseLiteConfig();
      HybridRAGFactory.createLite(config);

      expect(VectorSearchStrategy).toHaveBeenCalledWith(
        config.db,
        config.embeddingProvider,
      );
      expect(GraphSearchStrategy).toHaveBeenCalledWith(
        config.graphStore,
        config.embeddingProvider,
      );
    });
  });

  // -------------------------------------------
  // createForTesting() 後方互換
  // -------------------------------------------
  describe("createForTesting()", () => {
    it("モックを注入してHybridRAGEngineを生成する (後方互換)", () => {
      const mockQueryClassifier = {} as IQueryClassifier;
      const mockKeyword = {} as ISearchStrategy;
      const mockSemantic = {} as ISearchStrategy;
      const mockGraph = {} as ISearchStrategy;
      const mockFusion = {} as IFusionStrategy;
      const mockReranker = {} as IReranker;
      const mockCrag = {} as ICorrectiveRAG;

      const mocks: TestMocks = {
        queryClassifier: mockQueryClassifier,
        keywordStrategy: mockKeyword,
        semanticStrategy: mockSemantic,
        graphStrategy: mockGraph,
        fusion: mockFusion,
        reranker: mockReranker,
        crag: mockCrag,
        options: { defaultEnableCRAG: true },
      };

      const _engine = HybridRAGFactory.createForTesting(mocks);

      // createForTesting は直接 HybridRAGEngine を new するため、
      // HybridRAGEngine のモックが呼ばれる
      expect(HybridRAGEngine).toHaveBeenCalledWith(
        mockQueryClassifier,
        {
          keyword: mockKeyword,
          semantic: mockSemantic,
          graph: mockGraph,
        },
        mockFusion,
        mockReranker,
        mockCrag,
        { defaultEnableCRAG: true },
      );
    });

    it("オプション省略時にデフォルトのfusion/rerankerを使用する", () => {
      const mocks: TestMocks = {
        queryClassifier: {} as IQueryClassifier,
        keywordStrategy: {} as ISearchStrategy,
        semanticStrategy: {} as ISearchStrategy,
        graphStrategy: {} as ISearchStrategy,
      };

      HybridRAGFactory.createForTesting(mocks);

      // RRFFusion と NoOpReranker のインスタンスが使われる
      expect(HybridRAGEngine).toHaveBeenCalledWith(
        expect.anything(),
        expect.anything(),
        expect.any(Object), // RRFFusion instance
        expect.any(Object), // NoOpReranker instance
        null, // crag default
        {}, // options default
      );
    });
  });

  // -------------------------------------------
  // Phase 6: テスト拡充 (ETC-01 ~ ETC-10)
  // -------------------------------------------
  describe("createFull() -- 拡充", () => {
    it("ETC-01: CRAGオプションがCorrectiveRAGに渡される", () => {
      const mockCragLlmClient = { complete: vi.fn() };
      const config = createBaseFullConfig({
        enableCRAG: true,
        cragLlmClient:
          mockCragLlmClient as unknown as FullHybridRAGConfig["cragLlmClient"],
        cragMaxEvaluate: 3,
        cragCorrectThreshold: 0.8,
        cragIncorrectThreshold: 0.3,
        ambiguousFilterThreshold: 0.5,
        enableWebSearch: true,
        enableRefinement: true,
      });
      HybridRAGFactory.createFull(config);

      expect(RelevanceEvaluator).toHaveBeenCalledWith(mockCragLlmClient, {
        maxEvaluate: 3,
        correctThreshold: 0.8,
        incorrectThreshold: 0.3,
      });
      expect(CorrectiveRAG).toHaveBeenCalledWith(
        expect.anything(), // evaluator instance
        null, // webSearcher not provided
        {
          enableWebSearch: true,
          enableRefinement: true,
          ambiguousFilterThreshold: 0.5,
        },
      );
    });

    it("ETC-02: enableCRAG: false 明示指定でCRAGなし", () => {
      const config = createBaseFullConfig({ enableCRAG: false });
      HybridRAGFactory.createFull(config);

      expect(RelevanceEvaluator).not.toHaveBeenCalled();
      expect(CorrectiveRAG).not.toHaveBeenCalled();
      expect(HybridRAGEngine).toHaveBeenCalledWith(
        expect.anything(),
        expect.anything(),
        expect.anything(),
        expect.anything(),
        null,
        expect.anything(),
      );
    });

    it("ETC-03: cohereModel が CohereReranker に渡される", () => {
      const config = createBaseFullConfig({
        rerankerType: "cohere",
        cohereApiKey: "test-key",
        cohereModel: "rerank-v3",
      });
      HybridRAGFactory.createFull(config);

      expect(CohereReranker).toHaveBeenCalledWith("test-key", {
        model: "rerank-v3",
      });
    });

    it("ETC-04: rerankerBatchSize が LLMReranker に渡される", () => {
      const mockLlmClient = { complete: vi.fn() };
      const config = createBaseFullConfig({
        rerankerType: "llm",
        rerankerLlmClient:
          mockLlmClient as unknown as FullHybridRAGConfig["rerankerLlmClient"],
        rerankerBatchSize: 5,
      });
      HybridRAGFactory.createFull(config);

      expect(LLMReranker).toHaveBeenCalledWith(mockLlmClient, {
        batchSize: 5,
      });
    });

    it("ETC-05: バリデーション優先順序 - cohereApiKeyエラーが先に検出される", () => {
      // cohereApiKey 未指定 + enableCRAG: true + cragLlmClient 未指定
      // cohereApiKey のバリデーションが先に実行される
      const config = createBaseFullConfig({
        rerankerType: "cohere",
        enableCRAG: true,
        // cohereApiKey 未指定
        // cragLlmClient 未指定
      });
      expect(() => HybridRAGFactory.createFull(config)).toThrow(/cohereApiKey/);
    });

    it("ETC-05b: バリデーション優先順序 - voyageApiKeyがcragLlmClientより先", () => {
      const config = createBaseFullConfig({
        rerankerType: "voyage",
        enableCRAG: true,
        // voyageApiKey 未指定
        // cragLlmClient 未指定
      });
      expect(() => HybridRAGFactory.createFull(config)).toThrow(/voyageApiKey/);
    });

    it("ETC-05c: バリデーション優先順序 - rerankerLlmClientがcragLlmClientより先", () => {
      const config = createBaseFullConfig({
        rerankerType: "llm",
        enableCRAG: true,
        // rerankerLlmClient 未指定
        // cragLlmClient 未指定
      });
      expect(() => HybridRAGFactory.createFull(config)).toThrow(
        `${CREATE_FULL_ERROR_PREFIX} rerankerLlmClient is required when rerankerType is 'llm'`,
      );
    });

    it("CRAG enableCRAG未指定(undefined)でCRAGなし", () => {
      const config = createBaseFullConfig();
      // enableCRAG は undefined (未指定)
      HybridRAGFactory.createFull(config);

      expect(CorrectiveRAG).not.toHaveBeenCalled();
    });

    it("webSearcher が指定された場合 CorrectiveRAG に渡される", () => {
      const mockWebSearcher = { search: vi.fn() };
      const mockCragLlmClient = { complete: vi.fn() };
      const config = createBaseFullConfig({
        enableCRAG: true,
        cragLlmClient:
          mockCragLlmClient as unknown as FullHybridRAGConfig["cragLlmClient"],
        webSearcher:
          mockWebSearcher as unknown as FullHybridRAGConfig["webSearcher"],
      });
      HybridRAGFactory.createFull(config);

      expect(CorrectiveRAG).toHaveBeenCalledWith(
        expect.anything(), // evaluator
        mockWebSearcher, // webSearcher passed through
        expect.anything(), // options
      );
    });

    it("communitySummarizer が GraphSearchStrategy に渡される", () => {
      const mockSummarizer = { summarize: vi.fn() };
      const config = createBaseFullConfig({
        communitySummarizer:
          mockSummarizer as unknown as FullHybridRAGConfig["communitySummarizer"],
      });
      HybridRAGFactory.createFull(config);

      expect(GraphSearchStrategy).toHaveBeenCalledWith(
        config.graphStore,
        config.embeddingProvider,
        mockSummarizer,
      );
    });

    it("rrfK 未指定時にデフォルト値60が使用される", () => {
      const config = createBaseFullConfig();
      HybridRAGFactory.createFull(config);

      expect(RRFFusion).toHaveBeenCalledWith(60);
    });

    it("cohere cohereModel 未指定時に undefined が渡される", () => {
      const config = createBaseFullConfig({
        rerankerType: "cohere",
        cohereApiKey: "key",
        // cohereModel 未指定
      });
      HybridRAGFactory.createFull(config);

      expect(CohereReranker).toHaveBeenCalledWith("key", {
        model: undefined,
      });
    });

    it("llm rerankerBatchSize 未指定時に undefined が渡される", () => {
      const mockLlmClient = { complete: vi.fn() };
      const config = createBaseFullConfig({
        rerankerType: "llm",
        rerankerLlmClient:
          mockLlmClient as unknown as FullHybridRAGConfig["rerankerLlmClient"],
        // rerankerBatchSize 未指定
      });
      HybridRAGFactory.createFull(config);

      expect(LLMReranker).toHaveBeenCalledWith(mockLlmClient, {
        batchSize: undefined,
      });
    });
  });

  describe("createLite() -- 拡充", () => {
    it("ETC-06: LLM関連コンポーネントを使用しない", () => {
      const config = createBaseLiteConfig();
      HybridRAGFactory.createLite(config);

      // LLM 関連が呼ばれないことを検証
      expect(LLMQueryClassifier).not.toHaveBeenCalled();
      expect(CohereReranker).not.toHaveBeenCalled();
      expect(VoyageReranker).not.toHaveBeenCalled();
      expect(LLMReranker).not.toHaveBeenCalled();
      expect(CorrectiveRAG).not.toHaveBeenCalled();
      expect(RelevanceEvaluator).not.toHaveBeenCalled();

      // RuleBasedQueryClassifier + NoOpReranker のみ
      expect(RuleBasedQueryClassifier).toHaveBeenCalledOnce();
      expect(NoOpReranker).toHaveBeenCalledOnce();
    });

    it("createLite() は RRFFusion をデフォルト引数で生成する", () => {
      const config = createBaseLiteConfig();
      HybridRAGFactory.createLite(config);

      expect(RRFFusion).toHaveBeenCalledWith();
    });

    it("createLite() は GraphSearchStrategy に communitySummarizer を渡さない", () => {
      const config = createBaseLiteConfig();
      HybridRAGFactory.createLite(config);

      expect(GraphSearchStrategy).toHaveBeenCalledWith(
        config.graphStore,
        config.embeddingProvider,
      );
    });
  });

  describe("createForTesting() -- 拡充", () => {
    it("ETC-07: オプション省略時にRRFFusion(デフォルト) + NoOpReranker + crag:null + options:{} で生成される", () => {
      const mocks: TestMocks = {
        queryClassifier: {} as IQueryClassifier,
        keywordStrategy: {} as ISearchStrategy,
        semanticStrategy: {} as ISearchStrategy,
        graphStrategy: {} as ISearchStrategy,
      };

      HybridRAGFactory.createForTesting(mocks);

      expect(HybridRAGEngine).toHaveBeenCalledWith(
        mocks.queryClassifier,
        {
          keyword: mocks.keywordStrategy,
          semantic: mocks.semanticStrategy,
          graph: mocks.graphStrategy,
        },
        expect.any(Object), // RRFFusion instance
        expect.any(Object), // NoOpReranker instance
        null,
        {},
      );
    });

    it("ETC-08: カスタム fusion / reranker / crag が全て渡される", () => {
      const mockFusion = {} as IFusionStrategy;
      const mockReranker = {} as IReranker;
      const mockCrag = {} as ICorrectiveRAG;

      const mocks: TestMocks = {
        queryClassifier: {} as IQueryClassifier,
        keywordStrategy: {} as ISearchStrategy,
        semanticStrategy: {} as ISearchStrategy,
        graphStrategy: {} as ISearchStrategy,
        fusion: mockFusion,
        reranker: mockReranker,
        crag: mockCrag,
        options: { defaultEnableCRAG: true },
      };

      HybridRAGFactory.createForTesting(mocks);

      expect(HybridRAGEngine).toHaveBeenCalledWith(
        mocks.queryClassifier,
        {
          keyword: mocks.keywordStrategy,
          semantic: mocks.semanticStrategy,
          graph: mocks.graphStrategy,
        },
        mockFusion,
        mockReranker,
        mockCrag,
        { defaultEnableCRAG: true },
      );
    });
  });

  describe("limitation 回帰ガード", () => {
    // ETC-09: graph queryType limitation
    // HybridRAGEngine は search() 呼び出し時に queryType を個別の strategy に渡さない。
    // GraphSearchStrategy.search(query, limit, filters) のシグネチャには queryType がない。
    // これは既知制限であり、Phase 12 で未タスクとして記録する。
    it("ETC-09: GraphSearchStrategy は queryType を受け取らない (既知制限の回帰ガード)", () => {
      const config = createBaseFullConfig();
      HybridRAGFactory.createFull(config);

      // GraphSearchStrategy のコンストラクタ引数に queryType が含まれないことを確認
      const graphCalls = vi.mocked(GraphSearchStrategy).mock.calls;
      expect(graphCalls).toHaveLength(1);
      // コンストラクタ引数: (graphStore, embeddingProvider, communitySummarizer?)
      // queryType は渡されない
      expect(graphCalls[0]).toHaveLength(3); // graphStore, embeddingProvider, communitySummarizer(undefined)
    });
  });

  describe("adapter", () => {
    // ETC-10: KeywordSearchStrategyAdapter
    // Factory が KeywordSearchStrategy を KeywordSearchStrategyAdapter でラップしていることを
    // vi.mock の呼び出し順序で検証する。adapter は vi.mock でモック化済み。
    it("ETC-10: createFull() が KeywordSearchStrategyAdapter を使用する", () => {
      const config = createBaseFullConfig();
      HybridRAGFactory.createFull(config);

      // HybridRAGEngine に渡される strategies.keyword が存在することを確認
      const engineCalls = vi.mocked(HybridRAGEngine).mock.calls;
      expect(engineCalls).toHaveLength(1);
      const strategies = engineCalls[0][1] as {
        keyword: unknown;
        semantic: unknown;
        graph: unknown;
      };
      expect(strategies.keyword).toBeInstanceOf(KeywordSearchStrategyAdapter);
      expect(strategies.semantic).toBeDefined();
      expect(strategies.graph).toBeDefined();
    });

    it("ETC-10b: createLite() も KeywordSearchStrategyAdapter を使用する", () => {
      const config = createBaseLiteConfig();
      HybridRAGFactory.createLite(config);

      const engineCalls = vi.mocked(HybridRAGEngine).mock.calls;
      expect(engineCalls).toHaveLength(1);
      const strategies = engineCalls[0][1] as {
        keyword: unknown;
        semantic: unknown;
        graph: unknown;
      };
      expect(strategies.keyword).toBeInstanceOf(KeywordSearchStrategyAdapter);
      expect(strategies.semantic).toBeDefined();
      expect(strategies.graph).toBeDefined();
    });
  });
});
