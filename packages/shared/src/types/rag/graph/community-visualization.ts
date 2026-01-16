/**
 * @file Community Visualization Types
 * @module @repo/shared/types/rag/graph/community-visualization
 * @description Community visualization UI用の型定義
 */

import type { CommunityId, EntityId, ChunkId, FileId } from "../branded";

// =============================================================================
// Community Types
// =============================================================================

/**
 * コミュニティ（可視化用）
 *
 * Leidenアルゴリズムで検出されたコミュニティの可視化用型
 */
export interface Community {
  /** コミュニティの一意識別子 */
  readonly id: CommunityId;

  /** 階層レベル（0: 最下層、1以上: 上位階層） */
  readonly level: number;

  /** コミュニティサイズ（メンバー数） */
  readonly size: number;

  /** メンバーエンティティIDリスト */
  readonly memberEntityIds: readonly EntityId[];

  /** 子コミュニティIDリスト */
  readonly childCommunityIds: readonly CommunityId[];

  /** 親コミュニティID（最上位階層の場合undefined） */
  readonly parentCommunityId?: CommunityId;

  /** 内部エッジ数 */
  readonly internalEdges: number;

  /** 外部エッジ数 */
  readonly externalEdges: number;

  /** モジュラリティスコア（0.0〜1.0） */
  readonly modularity: number;

  /** 作成日時 */
  readonly createdAt: Date;

  /** 更新日時 */
  readonly updatedAt: Date;
}

// =============================================================================
// Community Summary Types
// =============================================================================

/**
 * コミュニティサマリー
 *
 * LLMによって生成されたコミュニティの要約情報
 */
export interface CommunitySummary {
  /** コミュニティID */
  readonly communityId: CommunityId;

  /** 階層レベル */
  readonly level: number;

  /** サマリーテキスト */
  readonly summary: string;

  /** キーワードリスト */
  readonly keywords: readonly string[];

  /** 主要エンティティ名リスト */
  readonly mainEntities: readonly string[];

  /** 主要関係タイプリスト */
  readonly mainRelations: readonly string[];

  /** 感情分析結果 */
  readonly sentiment: "positive" | "negative" | "neutral";

  /** 信頼度スコア（0.0〜1.0） */
  readonly confidence: number;

  /** トークン数 */
  readonly tokenCount: number;

  /** 作成日時 */
  readonly createdAt: Date;
}

// =============================================================================
// Stored Entity Types
// =============================================================================

/**
 * 格納済みエンティティ
 *
 * データベースに格納されたエンティティの可視化用型
 */
export interface StoredEntity {
  /** エンティティの一意識別子 */
  readonly id: EntityId;

  /** エンティティ名 */
  readonly name: string;

  /** 正規化名（検索用） */
  readonly normalizedName?: string;

  /** エンティティタイプ */
  readonly type: string;

  /** エンティティの説明 */
  readonly description?: string | null;

  /** ソースドキュメントIDリスト */
  readonly sourceDocumentIds?: readonly FileId[];

  /** ソースチャンクIDリスト */
  readonly sourceChunkIds?: readonly ChunkId[];

  /** テキストユニット */
  readonly textUnit?: string | null;

  /** 抽出日時 */
  readonly extractedAt?: Date;

  /** 更新日時 */
  readonly updatedAt?: Date;

  /** メンション数 */
  readonly mentions?: number;
}
