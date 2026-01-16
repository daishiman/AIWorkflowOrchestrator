/**
 * @file Knowledge Graph Service - Public API
 * @module @repo/shared/services/graph
 * @description
 * Knowledge Graphサービスの公開インターフェース。
 *
 * このモジュールは以下の機能を提供します:
 * - **Entity**: ナレッジグラフの頂点となるエンティティ（StoredEntity, ExtractedEntity）
 * - **Relation**: エンティティ間の関係性（StoredRelation, ExtractedRelation）
 * - **Graph**: グラフ構造とトラバーサル（GraphNode, GraphPath）
 * - **Community**: コミュニティ検出と要約（Community, CommunitySummary）
 * - **Query**: グラフ検索オプション（EntityQuery, TraversalOptions）
 *
 * @example
 * ```typescript
 * // 型のインポート
 * import type { Community, StoredEntity, CommunitySummary } from "@repo/shared/services/graph";
 *
 * // 値（enum, class, function）のインポート
 * import {
 *   CommunityErrorCode,
 *   CommunityDetectionError,
 *   normalizeEntityName
 * } from "@repo/shared/services/graph";
 *
 * // エンティティ名の正規化
 * const normalized = normalizeEntityName("TypeScript 5.x"); // "typescript 5x"
 *
 * // エラーハンドリング
 * throw new CommunityDetectionError("Detection failed", CommunityErrorCode.DETECTION_FAILED);
 * ```
 */

// =============================================================================
// Type Re-exports
// =============================================================================

/**
 * Entity関連型
 * - StoredEntity: DBに保存されたエンティティ
 * - ExtractedEntity: テキストから抽出されたエンティティ
 * - EntityMention: エンティティの出現箇所
 */
export type { StoredEntity, ExtractedEntity, EntityMention } from "./types";

/**
 * Relation関連型
 * - StoredRelation: DBに保存された関係
 * - ExtractedRelation: テキストから抽出された関係
 * - RelationEvidence: 関係の根拠情報
 */
export type {
  StoredRelation,
  ExtractedRelation,
  RelationEvidence,
} from "./types";

/**
 * Graph関連型
 * - GraphNode: グラフの頂点
 * - GraphEdge: グラフの辺
 * - GraphPath: グラフ上のパス
 * - GraphTraversalResult: トラバーサル結果
 * - GraphStats: グラフ統計情報
 */
export type {
  GraphNode,
  GraphPath,
  GraphTraversalResult,
  GraphStats,
  GraphEdge,
} from "./types";

/**
 * Community関連型
 * - Community: コミュニティ構造
 * - CommunitySummary: コミュニティの要約
 * - CommunityStructure: 階層的コミュニティ構造
 * - CommunityDetection*: 検出オプション・結果・統計
 * - CommunitySummarization*: 要約オプション・結果
 */
export type {
  Community,
  CommunitySummary,
  CommunityStructure,
  CommunityDetectionOptions,
  CommunityDetectionResult,
  CommunityDetectionStats,
  CommunitySummarizationOptions,
  CommunitySummarizationResult,
} from "./types";

/**
 * Query関連型
 * - EntityQuery: エンティティ検索クエリ
 * - TraversalOptions: グラフトラバーサルオプション
 * - RelationQueryOptions: 関係検索オプション
 */
export type {
  EntityQuery,
  TraversalOptions,
  RelationQueryOptions,
} from "./types";

// =============================================================================
// Value Re-exports (enum, class, function)
// =============================================================================

/**
 * Community検出関連
 * - CommunityErrorCode: エラーコード enum
 * - CommunityDetectionError: 検出エラー class
 */
export { CommunityErrorCode, CommunityDetectionError } from "./types";

/**
 * Community要約関連
 * - CommunitySummarizationErrorCode: エラーコード enum
 * - CommunitySummarizationError: 要約エラー class
 */
export {
  CommunitySummarizationErrorCode,
  CommunitySummarizationError,
} from "./types";

/**
 * ユーティリティ関数
 * - normalizeEntityName: エンティティ名の正規化（小文字化、特殊文字除去）
 */
export { normalizeEntityName } from "./types";
