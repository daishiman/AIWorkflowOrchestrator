/**
 * @file HybridRAGFactory実装
 * @description CONV-07-07: HybridRAG統合 - ファクトリクラス
 *
 * 設定に基づいて適切なコンポーネントを組み立て、HybridRAGEngineインスタンスを生成する。
 */

import type { IQueryClassifier } from "./types";
import type { IFusionStrategy } from "./fusion/types";
import type { IReranker } from "./reranking/types";
import type { ICorrectiveRAG, IWebSearcher, CRAGOptions } from "./crag/types";
import type { ILLMClient as CragLLMClient } from "./crag/types";
import type { ISearchStrategy } from "./strategies/types";
import type { LibSQLDatabase } from "drizzle-orm/libsql";
import type { IEmbeddingProvider } from "../embedding/providers/interfaces";
import type { IKnowledgeGraphStore } from "../graph/knowledge-graph-store";
import type { ILLMClient as RerankerLLMClient } from "../llm/types";
import type { ILLMProvider } from "../extraction/interfaces";
import type { ICommunitySummarizer } from "../graph/interfaces/community-summarizer.interface";
import { HybridRAGEngine, type HybridRAGOptions } from "./hybrid-rag-engine";
import { RRFFusion } from "./fusion/rrf-fusion";
import {
  NoOpReranker,
  CohereReranker,
  VoyageReranker,
  LLMReranker,
} from "./reranking/cross-encoder-reranker";
import { RuleBasedQueryClassifier } from "./rule-based-query-classifier";
import { LLMQueryClassifier } from "./llm-query-classifier";
import { VectorSearchStrategy } from "./strategies/vector-search-strategy";
import { GraphSearchStrategy } from "./strategies/graph-search-strategy";
import { KeywordSearchStrategyAdapter } from "./strategies/keyword-search-strategy-adapter";
import { KeywordSearchStrategy } from "./keyword-search-strategy";
import { CorrectiveRAG } from "./crag/corrective-rag";
import { RelevanceEvaluator } from "./crag/relevance-evaluator";

// =============================================================================
// 型定義
// =============================================================================

/**
 * フル機能エンジンの設定
 */
export interface FullHybridRAGConfig {
  // 必須: データベース・プロバイダー
  db: LibSQLDatabase<Record<string, never>>;
  embeddingProvider: IEmbeddingProvider;
  graphStore: IKnowledgeGraphStore;
  llmProvider: ILLMProvider;

  // Reranker設定
  rerankerType: "cohere" | "voyage" | "llm" | "none";
  cohereApiKey?: string;
  cohereModel?: string;
  voyageApiKey?: string;
  rerankerLlmClient?: RerankerLLMClient;
  rerankerBatchSize?: number;

  // RRF設定
  rrfK?: number;

  // CRAG設定
  enableCRAG?: boolean;
  cragLlmClient?: CragLLMClient;
  cragMaxEvaluate?: number;
  cragCorrectThreshold?: number;
  cragIncorrectThreshold?: number;
  ambiguousFilterThreshold?: number;

  // Web検索設定
  webSearcher?: IWebSearcher;
  enableWebSearch?: boolean;
  enableRefinement?: boolean;

  // GraphSearch追加設定
  communitySummarizer?: ICommunitySummarizer;
}

/**
 * 軽量版エンジンの設定
 */
export interface LiteHybridRAGConfig {
  db: LibSQLDatabase<Record<string, never>>;
  embeddingProvider: IEmbeddingProvider;
  graphStore: IKnowledgeGraphStore;
}

/**
 * テスト用モック設定
 */
export interface TestMocks {
  queryClassifier: IQueryClassifier;
  keywordStrategy: ISearchStrategy;
  semanticStrategy: ISearchStrategy;
  graphStrategy: ISearchStrategy;
  fusion?: IFusionStrategy;
  reranker?: IReranker;
  crag?: ICorrectiveRAG;
  options?: HybridRAGOptions;
}

// =============================================================================
// HybridRAGFactory
// =============================================================================

/**
 * HybridRAGEngineのファクトリクラス
 *
 * @description
 * 設定に基づいて適切なコンポーネントを組み立て、HybridRAGEngineインスタンスを生成する。
 * 3種類のエンジン生成メソッドを提供:
 * - createFull: フル機能エンジン（LLMベースQueryClassifier、選択可能なReranker、CRAG）
 * - createLite: 軽量版エンジン（ルールベースQueryClassifier、NoOpReranker、CRAG無効）
 * - createForTesting: テスト用エンジン（モック注入可能）
 */
export class HybridRAGFactory {
  private static readonly CREATE_FULL_ERROR_PREFIX =
    "HybridRAGFactory.createFull():";
  /**
   * フル機能エンジンを生成
   */
  static createFull(config: FullHybridRAGConfig): HybridRAGEngine {
    HybridRAGFactory.validateFullConfig(config);

    const fallbackClassifier = new RuleBasedQueryClassifier();
    const queryClassifier = new LLMQueryClassifier(
      config.llmProvider,
      fallbackClassifier,
    );

    const keyword = new KeywordSearchStrategyAdapter(
      new KeywordSearchStrategy(config.db),
    );
    const semantic = new VectorSearchStrategy(
      config.db,
      config.embeddingProvider,
    );
    const graph = new GraphSearchStrategy(
      config.graphStore,
      config.embeddingProvider,
      config.communitySummarizer,
    );

    const fusion = new RRFFusion(config.rrfK ?? 60);
    const reranker = HybridRAGFactory.createReranker(config);
    const crag = HybridRAGFactory.createCRAG(config);

    return new HybridRAGEngine(
      queryClassifier,
      { keyword, semantic, graph },
      fusion,
      reranker,
      crag,
      {},
    );
  }

  /**
   * 軽量版エンジンを生成
   */
  static createLite(config: LiteHybridRAGConfig): HybridRAGEngine {
    const queryClassifier = new RuleBasedQueryClassifier();

    const keyword = new KeywordSearchStrategyAdapter(
      new KeywordSearchStrategy(config.db),
    );
    const semantic = new VectorSearchStrategy(
      config.db,
      config.embeddingProvider,
    );
    const graph = new GraphSearchStrategy(
      config.graphStore,
      config.embeddingProvider,
    );

    const fusion = new RRFFusion();
    const reranker = new NoOpReranker();

    return new HybridRAGEngine(
      queryClassifier,
      { keyword, semantic, graph },
      fusion,
      reranker,
      null,
      {},
    );
  }

  /**
   * テスト用エンジンを生成
   */
  static createForTesting(mocks: TestMocks): HybridRAGEngine {
    return new HybridRAGEngine(
      mocks.queryClassifier,
      {
        keyword: mocks.keywordStrategy,
        semantic: mocks.semanticStrategy,
        graph: mocks.graphStrategy,
      },
      mocks.fusion ?? new RRFFusion(),
      mocks.reranker ?? new NoOpReranker(),
      mocks.crag ?? null,
      mocks.options ?? {},
    );
  }

  // ===========================================================================
  // Private helpers
  // ===========================================================================

  private static validateFullConfig(config: FullHybridRAGConfig): void {
    if (
      config.rerankerType === "cohere" &&
      (!config.cohereApiKey || config.cohereApiKey.trim() === "")
    ) {
      throw new Error(
        `${HybridRAGFactory.CREATE_FULL_ERROR_PREFIX} cohereApiKey is required when rerankerType is 'cohere'`,
      );
    }

    if (
      config.rerankerType === "voyage" &&
      (!config.voyageApiKey || config.voyageApiKey.trim() === "")
    ) {
      throw new Error(
        `${HybridRAGFactory.CREATE_FULL_ERROR_PREFIX} voyageApiKey is required when rerankerType is 'voyage'`,
      );
    }

    if (config.rerankerType === "llm" && !config.rerankerLlmClient) {
      throw new Error(
        `${HybridRAGFactory.CREATE_FULL_ERROR_PREFIX} rerankerLlmClient is required when rerankerType is 'llm'`,
      );
    }

    if (config.enableCRAG && !config.cragLlmClient) {
      throw new Error(
        `${HybridRAGFactory.CREATE_FULL_ERROR_PREFIX} cragLlmClient is required when enableCRAG is true`,
      );
    }
  }

  private static createReranker(config: FullHybridRAGConfig): IReranker {
    switch (config.rerankerType) {
      case "cohere":
        return new CohereReranker(config.cohereApiKey!, {
          model: config.cohereModel,
        });
      case "voyage":
        return new VoyageReranker(config.voyageApiKey!, {});
      case "llm":
        return new LLMReranker(config.rerankerLlmClient!, {
          batchSize: config.rerankerBatchSize,
        });
      case "none":
      default:
        return new NoOpReranker();
    }
  }

  private static createCRAG(
    config: FullHybridRAGConfig,
  ): ICorrectiveRAG | null {
    if (!config.enableCRAG) {
      return null;
    }

    const evaluator = new RelevanceEvaluator(config.cragLlmClient!, {
      maxEvaluate: config.cragMaxEvaluate,
      correctThreshold: config.cragCorrectThreshold,
      incorrectThreshold: config.cragIncorrectThreshold,
    });

    const cragOptions: CRAGOptions = {
      enableWebSearch: config.enableWebSearch,
      enableRefinement: config.enableRefinement,
      ambiguousFilterThreshold: config.ambiguousFilterThreshold,
    };

    return new CorrectiveRAG(
      evaluator,
      config.webSearcher ?? null,
      cragOptions,
    );
  }
}
