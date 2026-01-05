/**
 * @file Knowledge Graph型定義
 * @module @repo/shared/types/rag/graph/types
 * @description GraphRAGのEntity、Relation、Community等の型定義（DDD準拠）
 */

import type { EntityId, RelationId, CommunityId, ChunkId } from "../branded";
import type { Timestamped, WithMetadata } from "../interfaces";

// =============================================================================
// 列挙型（Enum）
// =============================================================================

/**
 * エンティティタイプ（52種類）
 *
 * Knowledge Graphのノード（エンティティ）の種類を定義。
 * 10のカテゴリに分類され、多様なドメイン（ビジネス、技術、ドキュメント等）に対応。
 */
export const EntityTypes = {
  // 1. 人物・組織カテゴリ (4種類)
  PERSON: "person",
  ORGANIZATION: "organization",
  ROLE: "role",
  TEAM: "team",

  // 2. 場所・時間カテゴリ (3種類)
  LOCATION: "location",
  DATE: "date",
  EVENT: "event",

  // 3. ビジネス・経営カテゴリ (9種類)
  COMPANY: "company",
  PRODUCT: "product",
  SERVICE: "service",
  BRAND: "brand",
  STRATEGY: "strategy",
  METRIC: "metric",
  BUSINESS_PROCESS: "business_process",
  MARKET: "market",
  CUSTOMER: "customer",

  // 4. 技術全般カテゴリ (5種類)
  TECHNOLOGY: "technology",
  TOOL: "tool",
  METHOD: "method",
  STANDARD: "standard",
  PROTOCOL: "protocol",

  // 5. コード・ソフトウェアカテゴリ (7種類)
  PROGRAMMING_LANGUAGE: "programming_language",
  FRAMEWORK: "framework",
  LIBRARY: "library",
  API: "api",
  FUNCTION: "function",
  CLASS: "class",
  MODULE: "module",

  // 6. 抽象概念カテゴリ (5種類)
  CONCEPT: "concept",
  THEORY: "theory",
  PRINCIPLE: "principle",
  PATTERN: "pattern",
  MODEL: "model",

  // 7. ドキュメント構造カテゴリ (5種類)
  DOCUMENT: "document",
  CHAPTER: "chapter",
  SECTION: "section",
  PARAGRAPH: "paragraph",
  HEADING: "heading",

  // 8. ドキュメント要素カテゴリ (9種類)
  KEYWORD: "keyword",
  SUMMARY: "summary",
  FIGURE: "figure",
  TABLE: "table",
  LIST: "list",
  QUOTE: "quote",
  CODE_SNIPPET: "code_snippet",
  FORMULA: "formula",
  EXAMPLE: "example",

  // 9. メディアカテゴリ (4種類)
  IMAGE: "image",
  VIDEO: "video",
  AUDIO: "audio",
  DIAGRAM: "diagram",

  // 10. その他カテゴリ (1種類)
  OTHER: "other",
} as const;

/**
 * EntityType型
 * EntityTypesオブジェクトの値のUnion型（Literal型）
 */
export type EntityType = (typeof EntityTypes)[keyof typeof EntityTypes];

/**
 * 関係タイプ（23種類）
 *
 * Knowledge Graphのエッジ（関係）の種類を定義。
 * 5のカテゴリに分類され、汎用関係から技術的関係まで対応。
 */
export const RelationTypes = {
  // 汎用関係 (4種類)
  RELATED_TO: "related_to",
  PART_OF: "part_of",
  HAS_PART: "has_part",
  BELONGS_TO: "belongs_to",

  // 時間的関係 (3種類)
  PRECEDED_BY: "preceded_by",
  FOLLOWED_BY: "followed_by",
  CONCURRENT_WITH: "concurrent_with",

  // 技術的関係 (7種類)
  USES: "uses",
  USED_BY: "used_by",
  IMPLEMENTS: "implements",
  EXTENDS: "extends",
  DEPENDS_ON: "depends_on",
  CALLS: "calls",
  IMPORTS: "imports",

  // 階層関係 (2種類)
  PARENT_OF: "parent_of",
  CHILD_OF: "child_of",

  // 参照関係 (4種類)
  REFERENCES: "references",
  REFERENCED_BY: "referenced_by",
  DEFINES: "defines",
  DEFINED_BY: "defined_by",

  // 人物関係 (3種類)
  AUTHORED_BY: "authored_by",
  WORKS_FOR: "works_for",
  COLLABORATES_WITH: "collaborates_with",
} as const;

/**
 * RelationType型
 * RelationTypesオブジェクトの値のUnion型（Literal型）
 */
export type RelationType = (typeof RelationTypes)[keyof typeof RelationTypes];

// =============================================================================
// Entity型
// =============================================================================

/**
 * エンティティエンティティ（DDD: Entity）
 *
 * Knowledge Graphのノード（頂点）を表現。
 * IDによって同一性が保証され、属性（importance, embedding等）が時間経過で変化しうる。
 *
 * @example
 * const entity: EntityEntity = {
 *   id: generateEntityId(),
 *   name: "React",
 *   normalizedName: "react",
 *   type: EntityTypes.FRAMEWORK,
 *   description: "A JavaScript library for building user interfaces",
 *   aliases: ["React.js", "ReactJS"],
 *   embedding: new Float32Array(1536).fill(0.1),
 *   importance: 0.95,
 *   metadata: { category: "frontend" },
 *   createdAt: new Date(),
 *   updatedAt: new Date(),
 * };
 */
export interface EntityEntity extends Timestamped, WithMetadata {
  /** エンティティの一意識別子（UUID v4） */
  readonly id: EntityId;

  /** エンティティ名（1〜255文字） */
  readonly name: string;

  /** 正規化名（検索用、小文字・空白統一・特殊文字除去） */
  readonly normalizedName: string;

  /** エンティティタイプ（48種類のいずれか） */
  readonly type: EntityType;

  /** エンティティの説明（最大1000文字、省略可） */
  readonly description: string | null;

  /** 別名リスト（各1〜255文字、空配列可） */
  readonly aliases: readonly string[];

  /** 埋め込みベクトル（次元数はAI APIに依存、未生成の場合null） */
  readonly embedding: Float32Array | null;

  /** 重要度スコア（0.0〜1.0、PageRankベース） */
  readonly importance: number;
}

/**
 * 関係エンティティ（DDD: Entity）
 *
 * Knowledge Graphのエッジ（辺）を表現。
 * IDによって同一性が保証され、weight（関係の強さ）が時間経過で変化しうる。
 *
 * @example
 * const relation: RelationEntity = {
 *   id: generateRelationId(),
 *   sourceId: reactEntityId,
 *   targetId: javascriptEntityId,
 *   type: RelationTypes.USES,
 *   description: "React is built on top of JavaScript",
 *   weight: 0.8,
 *   bidirectional: false,
 *   evidence: [
 *     {
 *       chunkId: chunkId1,
 *       excerpt: "React uses JavaScript for...",
 *       confidence: 0.9,
 *     },
 *   ],
 *   metadata: {},
 *   createdAt: new Date(),
 *   updatedAt: new Date(),
 * };
 */
export interface RelationEntity extends Timestamped, WithMetadata {
  /** 関係の一意識別子（UUID v4） */
  readonly id: RelationId;

  /** 関係の始点エンティティID */
  readonly sourceId: EntityId;

  /** 関係の終点エンティティID */
  readonly targetId: EntityId;

  /** 関係タイプ（23種類のいずれか） */
  readonly type: RelationType;

  /** 関係の説明（最大500文字、省略可） */
  readonly description: string | null;

  /** 関係の強さ（0.0〜1.0、evidence数と信頼度から計算） */
  readonly weight: number;

  /** 双方向関係か（例: "related_to"はtrue、"uses"はfalse） */
  readonly bidirectional: boolean;

  /** 関係の証拠（出典チャンク）リスト（最低1件） */
  readonly evidence: readonly RelationEvidence[];
}

/**
 * コミュニティエンティティ（DDD: Entity）
 *
 * 意味的に関連するエンティティのクラスター（Leidenアルゴリズムで自動生成）。
 * IDによって同一性が保証され、memberCount, summaryが時間経過で変化しうる。
 *
 * WithMetadataを継承しない（自動生成のため、カスタムメタデータ不要）。
 *
 * @example
 * const community: CommunityEntity = {
 *   id: generateCommunityId(),
 *   level: 0,
 *   parentId: null,
 *   name: "Frontend Frameworks",
 *   summary: "A community of frontend JavaScript frameworks...",
 *   memberEntityIds: [reactId, vueId, angularId],
 *   memberCount: 3,
 *   embedding: new Float32Array(1536).fill(0.2),
 *   createdAt: new Date(),
 *   updatedAt: new Date(),
 * };
 */
export interface CommunityEntity extends Timestamped {
  /** コミュニティの一意識別子（UUID v4） */
  readonly id: CommunityId;

  /** 階層レベル（0: 最下層、1以上: 上位階層） */
  readonly level: number;

  /** 親コミュニティID（level > 0の場合必須、level = 0ならnull） */
  readonly parentId: CommunityId | null;

  /** コミュニティ名（1〜255文字、自動生成または手動命名） */
  readonly name: string;

  /** コミュニティサマリー（最大2000文字、LLM生成） */
  readonly summary: string;

  /** メンバーエンティティIDリスト（最低1件） */
  readonly memberEntityIds: readonly EntityId[];

  /** メンバー数（memberEntityIds.length、正の整数） */
  readonly memberCount: number;

  /** コミュニティ埋め込み（メンバーの平均、省略可） */
  readonly embedding: Float32Array | null;
}

// =============================================================================
// Value Object型
// =============================================================================

/**
 * エンティティメンション（DDD: Value Object）
 *
 * エンティティの文書内出現位置を記録。
 * IDを持たず、属性値のみで等価性を判定する不変オブジェクト。
 *
 * @example
 * const mention: EntityMention = {
 *   startChar: 0,
 *   endChar: 5,
 *   surfaceForm: "React",
 * };
 */
export interface EntityMention {
  /** 開始文字位置（0以上） */
  readonly startChar: number;

  /** 終了文字位置（startCharより大きい） */
  readonly endChar: number;

  /** 表層形（文書中の実際の表記、1文字以上） */
  readonly surfaceForm: string;
}

/**
 * 関係の証拠（DDD: Value Object）
 *
 * 関係が抽出された文書箇所を記録（トレーサビリティ、信頼度評価用）。
 * IDを持たず、属性値のみで等価性を判定する不変オブジェクト。
 *
 * @example
 * const evidence: RelationEvidence = {
 *   chunkId: chunkId1,
 *   excerpt: "React is a JavaScript library for building UIs",
 *   confidence: 0.9,
 * };
 */
export interface RelationEvidence {
  /** 証拠となる文書チャンクのID */
  readonly chunkId: ChunkId;

  /** 証拠テキスト抜粋（1〜500文字） */
  readonly excerpt: string;

  /** 信頼度（0.0〜1.0） */
  readonly confidence: number;
}

/**
 * グラフ統計情報（DDD: Value Object）
 *
 * Knowledge Graph全体のメトリクス（健全性監視、パフォーマンス分析用）。
 * IDを持たず、計算結果の集合を表す不変オブジェクト。
 *
 * @example
 * const stats: GraphStatistics = {
 *   entityCount: 1000,
 *   relationCount: 5000,
 *   communityCount: 50,
 *   averageDegree: 10.0,
 *   density: 0.005,
 *   connectedComponents: 3,
 * };
 */
export interface GraphStatistics {
  /** エンティティ数（非負整数） */
  readonly entityCount: number;

  /** 関係数（非負整数） */
  readonly relationCount: number;

  /** コミュニティ数（非負整数） */
  readonly communityCount: number;

  /** 平均次数（0.0以上） */
  readonly averageDegree: number;

  /** グラフ密度（0.0〜1.0） */
  readonly density: number;

  /** 連結成分数（非負整数） */
  readonly connectedComponents: number;
}

// =============================================================================
// 関連型
// =============================================================================

/**
 * チャンク-エンティティ関連（DDD: 関連型）
 *
 * 文書チャンクとエンティティの多対多関連を表現（中間テーブル的存在）。
 * エンティティ出現頻度分析、コンテキスト抽出に使用。
 *
 * @example
 * const relation: ChunkEntityRelation = {
 *   chunkId: chunkId1,
 *   entityId: reactEntityId,
 *   mentionCount: 3,
 *   positions: [
 *     { startChar: 0, endChar: 5, surfaceForm: "React" },
 *     { startChar: 100, endChar: 105, surfaceForm: "React" },
 *     { startChar: 200, endChar: 208, surfaceForm: "React.js" },
 *   ],
 * };
 */
export interface ChunkEntityRelation {
  /** 文書チャンクID */
  readonly chunkId: ChunkId;

  /** エンティティID */
  readonly entityId: EntityId;

  /** メンション数（1以上） */
  readonly mentionCount: number;

  /** エンティティ出現位置リスト（positions.length === mentionCount） */
  readonly positions: readonly EntityMention[];
}
