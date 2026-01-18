/**
 * @file HybridRAGFactory実装
 * @description CONV-07-07: HybridRAG統合 - ファクトリクラス
 *
 * NOTE: このファクトリは依存モジュールが完成した後に完全実装される。
 * 現在はテスト用のcreateForTesting()メソッドのみ完全動作する。
 * createFull()とcreateLite()は将来の依存モジュール統合時に有効化される。
 */

import type { IQueryClassifier } from "./types";
import type { IFusionStrategy } from "./fusion/types";
import type { IReranker } from "./reranking/types";
import type { ICorrectiveRAG } from "./crag/types";
import type { ISearchStrategy } from "./strategies/types";
import { HybridRAGEngine, type HybridRAGOptions } from "./hybrid-rag-engine";
import { RRFFusion } from "./fusion/rrf-fusion";
import { NoOpReranker } from "./reranking/cross-encoder-reranker";

// =============================================================================
// プレースホルダー型定義（依存モジュール完成後に実際の型にリプレース）
// =============================================================================

/**
 * Embeddingプロバイダーインターフェース（プレースホルダー）
 * @placeholder 依存モジュール完成後に@repo/shared/services/embedding/typesに置換
 */
interface IEmbeddingProvider {
  embed(text: string): Promise<number[]>;
  embedBatch(texts: string[]): Promise<number[][]>;
}

/**
 * KnowledgeGraphストアインターフェース（プレースホルダー）
 * @placeholder 依存モジュール完成後に@repo/shared/services/knowledge-graph/typesに置換
 */
interface IKnowledgeGraphStore {
  query(query: string, limit?: number): Promise<unknown[]>;
}

/**
 * LLMクライアントインターフェース（プレースホルダー）
 * @placeholder 依存モジュール完成後に@repo/shared/services/llm/typesに置換
 */
interface ILLMClient {
  complete(
    prompt: string,
    options?: unknown,
  ): Promise<{ success: boolean; data?: string; error?: Error }>;
}

/**
 * Drizzle DBクライアント型（プレースホルダー）
 * @placeholder 依存モジュール完成後に@repo/shared/db/clientに置換
 */
type DrizzleClient = unknown;

/**
 * Web検索インターフェース（プレースホルダー）
 * @placeholder 依存モジュール完成後に実際の型に置換
 */
interface IWebSearcher {
  search(query: string, limit?: number): Promise<unknown[]>;
}

// =============================================================================
// 型定義
// =============================================================================

/**
 * フル機能エンジンの設定
 */
export interface FullHybridRAGConfig {
  // 必須: データベース・プロバイダー
  db: DrizzleClient;
  embeddingProvider: IEmbeddingProvider;
  graphStore: IKnowledgeGraphStore;
  llmClient: ILLMClient;

  // Reranker設定
  rerankerType: "cohere" | "voyage" | "llm" | "none";
  cohereApiKey?: string;
  cohereModel?: string;
  voyageApiKey?: string;
  rerankerBatchSize?: number;

  // RRF設定
  rrfK?: number;

  // CRAG設定
  enableCRAG?: boolean;
  cragMaxEvaluate?: number;
  cragCorrectThreshold?: number;
  cragIncorrectThreshold?: number;
  ambiguousFilterThreshold?: number;

  // Web検索設定
  webSearcher?: IWebSearcher;
  enableWebSearch?: boolean;
  enableRefinement?: boolean;
}

/**
 * 軽量版エンジンの設定
 */
export interface LiteHybridRAGConfig {
  // 必須: データベース・プロバイダー
  db: DrizzleClient;
  embeddingProvider: IEmbeddingProvider;
  graphStore: IKnowledgeGraphStore;
}

/**
 * テスト用モック設定
 */
export interface TestMocks {
  // 必須: 主要コンポーネントのモック
  queryClassifier: IQueryClassifier;
  keywordStrategy: ISearchStrategy;
  semanticStrategy: ISearchStrategy;
  graphStrategy: ISearchStrategy;

  // オプション: その他コンポーネント
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
 *
 * @note createFull()とcreateLite()は依存モジュールが完成した後に実装される。
 *       現在はcreateForTesting()のみ完全動作する。
 */
export class HybridRAGFactory {
  /**
   * フル機能エンジンを生成
   *
   * @param _config - フル機能エンジンの設定
   * @returns HybridRAGEngineインスタンス
   * @throws 依存モジュールが未実装のためエラー
   *
   * @todo 依存モジュール完成後に実装
   * - LLMQueryClassifier
   * - KeywordSearchStrategy
   * - VectorSearchStrategy
   * - GraphSearchStrategy
   * - CohereReranker, VoyageReranker, LLMReranker
   * - CorrectiveRAG, RelevanceEvaluator
   */
  static createFull(_config: FullHybridRAGConfig): HybridRAGEngine {
    throw new Error(
      "createFull() is not yet implemented. " +
        "Dependent modules (LLMQueryClassifier, VectorSearchStrategy, etc.) are required. " +
        "Use createForTesting() with mocks for now.",
    );
  }

  /**
   * 軽量版エンジンを生成
   *
   * @param _config - 軽量版エンジンの設定
   * @returns HybridRAGEngineインスタンス
   * @throws 依存モジュールが未実装のためエラー
   *
   * @todo 依存モジュール完成後に実装
   * - RuleBasedQueryClassifier
   * - KeywordSearchStrategy
   * - VectorSearchStrategy
   * - GraphSearchStrategy
   */
  static createLite(_config: LiteHybridRAGConfig): HybridRAGEngine {
    throw new Error(
      "createLite() is not yet implemented. " +
        "Dependent modules (VectorSearchStrategy, GraphSearchStrategy, etc.) are required. " +
        "Use createForTesting() with mocks for now.",
    );
  }

  /**
   * テスト用エンジンを生成
   *
   * @param mocks - テスト用モック設定
   * @returns HybridRAGEngineインスタンス
   *
   * @example
   * ```typescript
   * const engine = HybridRAGFactory.createForTesting({
   *   queryClassifier: mockQueryClassifier,
   *   keywordStrategy: mockKeywordStrategy,
   *   semanticStrategy: mockSemanticStrategy,
   *   graphStrategy: mockGraphStrategy,
   * });
   *
   * const result = await engine.search("query", 10);
   * ```
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
}
