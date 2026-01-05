/**
 * @file Knowledge Graph Zodスキーマ定義
 * @module @repo/shared/types/rag/graph/schemas
 * @description GraphRAGのEntity、Relation、Community等のランタイムバリデーション用Zodスキーマ
 */

import { z } from "zod";
import type { EntityId, RelationId, CommunityId, ChunkId } from "../branded";

// =============================================================================
// 定数定義
// =============================================================================

/**
 * 有効なembedding次元配列
 * OpenAI, Cohere, Sentence Transformers等の一般的なモデルの次元数に対応
 */
const VALID_EMBEDDING_DIMENSIONS: readonly number[] = [512, 768, 1024, 1536];

// =============================================================================
// 基本スキーマ（共通部品）
// =============================================================================

/**
 * タイムスタンプスキーマ
 * Timestampedインターフェースのバリデーション
 */
export const timestampedSchema = z.object({
  createdAt: z.date(),
  updatedAt: z.date(),
});

/**
 * メタデータスキーマ
 * WithMetadataインターフェースのバリデーション
 */
export const metadataSchema = z.object({
  metadata: z.record(z.string(), z.unknown()),
});

// =============================================================================
// 列挙型スキーマ（Enum）
// =============================================================================

/**
 * エンティティタイプスキーマ（52種類）
 *
 * Knowledge Graphのノード（エンティティ）の種類を定義。
 * 10のカテゴリに分類され、多様なドメインに対応。
 */
export const entityTypeSchema = z.enum([
  // 1. 人物・組織カテゴリ (4種類)
  "person",
  "organization",
  "role",
  "team",

  // 2. 場所・時間カテゴリ (3種類)
  "location",
  "date",
  "event",

  // 3. ビジネス・経営カテゴリ (9種類)
  "company",
  "product",
  "service",
  "brand",
  "strategy",
  "metric",
  "business_process",
  "market",
  "customer",

  // 4. 技術全般カテゴリ (5種類)
  "technology",
  "tool",
  "method",
  "standard",
  "protocol",

  // 5. コード・ソフトウェアカテゴリ (7種類)
  "programming_language",
  "framework",
  "library",
  "api",
  "function",
  "class",
  "module",

  // 6. 抽象概念カテゴリ (5種類)
  "concept",
  "theory",
  "principle",
  "pattern",
  "model",

  // 7. ドキュメント構造カテゴリ (5種類)
  "document",
  "chapter",
  "section",
  "paragraph",
  "heading",

  // 8. ドキュメント要素カテゴリ (9種類)
  "keyword",
  "summary",
  "figure",
  "table",
  "list",
  "quote",
  "code_snippet",
  "formula",
  "example",

  // 9. メディアカテゴリ (4種類)
  "image",
  "video",
  "audio",
  "diagram",

  // 10. その他カテゴリ (1種類)
  "other",
]);

/**
 * 関係タイプスキーマ（23種類）
 *
 * Knowledge Graphのエッジ（関係）の種類を定義。
 * 5のカテゴリに分類。
 */
export const relationTypeSchema = z.enum([
  // 汎用関係 (4種類)
  "related_to",
  "part_of",
  "has_part",
  "belongs_to",

  // 時間的関係 (3種類)
  "preceded_by",
  "followed_by",
  "concurrent_with",

  // 技術的関係 (7種類)
  "uses",
  "used_by",
  "implements",
  "extends",
  "depends_on",
  "calls",
  "imports",

  // 階層関係 (2種類)
  "parent_of",
  "child_of",

  // 参照関係 (4種類)
  "references",
  "referenced_by",
  "defines",
  "defined_by",

  // 人物関係 (3種類)
  "authored_by",
  "works_for",
  "collaborates_with",
]);

// =============================================================================
// Value Objectスキーマ
// =============================================================================

/**
 * エンティティメンションスキーマ
 * エンティティの文書内出現位置を表現
 */
export const entityMentionSchema = z
  .object({
    startChar: z.number().int().nonnegative(), // 0以上の整数
    endChar: z.number().int().nonnegative(), // 0以上の整数
    surfaceForm: z.string().min(1), // 1文字以上
  })
  .refine((data) => data.endChar > data.startChar, {
    message: "endChar must be greater than startChar",
    path: ["endChar"],
  });

/**
 * 関係の証拠スキーマ
 * 関係の出典チャンクを表現
 */
export const relationEvidenceSchema = z.object({
  chunkId: z.string().uuid() as unknown as z.ZodType<ChunkId>, // UUID形式
  excerpt: z.string().min(1).max(500), // 1〜500文字
  confidence: z.number().min(0).max(1), // 0.0〜1.0
});

/**
 * グラフ統計情報スキーマ
 * Knowledge Graph全体の統計を表現
 */
export const graphStatisticsSchema = z.object({
  entityCount: z.number().int().nonnegative(), // 0以上の整数
  relationCount: z.number().int().nonnegative(), // 0以上の整数
  communityCount: z.number().int().nonnegative(), // 0以上の整数
  averageDegree: z.number().nonnegative(), // 0以上の実数
  density: z.number().min(0).max(1), // 0.0〜1.0
  connectedComponents: z.number().int().positive(), // 1以上の整数
});

// =============================================================================
// Entityスキーマ
// =============================================================================

/**
 * エンティティエンティティスキーマ
 * Knowledge Graphのノード（頂点）を表現
 */
export const entityEntitySchema = z
  .object({
    id: z.string().uuid() as unknown as z.ZodType<EntityId>,
    name: z.string().min(1).max(255),
    normalizedName: z.string().min(1).max(255),
    type: entityTypeSchema,
    description: z.string().max(1000).nullable(),
    aliases: z.array(z.string().min(1).max(255)),
    embedding: z.array(z.number()).nullable(),
    importance: z.number().min(0).max(1),
    metadata: z.record(z.string(), z.unknown()),
    createdAt: z.date(),
    updatedAt: z.date(),
  })
  .refine((data) => data.embedding === null || data.embedding.length > 0, {
    message: "embedding must be null or non-empty array",
    path: ["embedding"],
  })
  .refine(
    (data) => {
      // embedding次元数チェック
      if (data.embedding === null) return true;
      return VALID_EMBEDDING_DIMENSIONS.includes(data.embedding.length);
    },
    {
      message: `embedding dimension must be one of [${VALID_EMBEDDING_DIMENSIONS.join(", ")}]`,
      path: ["embedding"],
    },
  );

/**
 * 関係エンティティスキーマ
 * Knowledge Graphのエッジ（辺）を表現
 */
export const relationEntitySchema = z
  .object({
    id: z.string().uuid() as unknown as z.ZodType<RelationId>,
    sourceId: z.string().uuid() as unknown as z.ZodType<EntityId>,
    targetId: z.string().uuid() as unknown as z.ZodType<EntityId>,
    type: relationTypeSchema,
    description: z.string().max(500).nullable(),
    weight: z.number().min(0).max(1),
    bidirectional: z.boolean(),
    evidence: z.array(relationEvidenceSchema).min(1),
    metadata: z.record(z.string(), z.unknown()),
    createdAt: z.date(),
    updatedAt: z.date(),
  })
  .refine((data) => data.sourceId !== data.targetId, {
    message: "sourceId and targetId must be different (self-loops not allowed)",
    path: ["targetId"],
  });

/**
 * コミュニティエンティティスキーマ
 * Knowledge Graphのクラスター（意味的に関連するエンティティ群）を表現
 *
 * Note: CommunityEntityはWithMetadataを継承しない（自動生成データのためメタデータ不要）
 */
export const communityEntitySchema = z
  .object({
    id: z.string().uuid() as unknown as z.ZodType<CommunityId>,
    level: z.number().int().nonnegative(),
    parentId: z
      .string()
      .uuid()
      .nullable() as unknown as z.ZodType<CommunityId | null>,
    name: z.string().min(1).max(255),
    summary: z.string().max(2000),
    memberEntityIds: z
      .array(z.string().uuid() as unknown as z.ZodType<EntityId>)
      .min(1),
    memberCount: z.number().int().positive(),
    embedding: z.array(z.number()).nullable(),
    createdAt: z.date(),
    updatedAt: z.date(),
  })
  .refine((data) => data.memberEntityIds.length === data.memberCount, {
    message: "memberCount must equal the length of memberEntityIds",
    path: ["memberCount"],
  })
  .refine(
    (data) => (data.level === 0 && data.parentId === null) || data.level > 0,
    {
      message: "level 0 communities must have parentId = null",
      path: ["parentId"],
    },
  )
  .refine((data) => data.embedding === null || data.embedding.length > 0, {
    message: "embedding must be null or non-empty array",
    path: ["embedding"],
  })
  .refine(
    (data) => {
      // embedding次元数チェック（entityと同じ次元）
      if (data.embedding === null) return true;
      return VALID_EMBEDDING_DIMENSIONS.includes(data.embedding.length);
    },
    {
      message: `embedding dimension must be one of [${VALID_EMBEDDING_DIMENSIONS.join(", ")}]`,
      path: ["embedding"],
    },
  );

// =============================================================================
// 関連型スキーマ
// =============================================================================

/**
 * チャンク-エンティティ関連スキーマ
 * 文書チャンクとエンティティの多対多関連を表現
 */
export const chunkEntityRelationSchema = z
  .object({
    chunkId: z.string().uuid() as unknown as z.ZodType<ChunkId>,
    entityId: z.string().uuid() as unknown as z.ZodType<EntityId>,
    mentionCount: z.number().int().positive(),
    positions: z.array(entityMentionSchema).min(1),
  })
  .refine((data) => data.positions.length === data.mentionCount, {
    message: "mentionCount must equal the length of positions",
    path: ["mentionCount"],
  });

// =============================================================================
// 型推論
// =============================================================================

/** entityEntitySchemaから推論される型 */
export type InferredEntityEntity = z.infer<typeof entityEntitySchema>;

/** relationEntitySchemaから推論される型 */
export type InferredRelationEntity = z.infer<typeof relationEntitySchema>;

/** communityEntitySchemaから推論される型 */
export type InferredCommunityEntity = z.infer<typeof communityEntitySchema>;

/** entityMentionSchemaから推論される型 */
export type InferredEntityMention = z.infer<typeof entityMentionSchema>;

/** relationEvidenceSchemaから推論される型 */
export type InferredRelationEvidence = z.infer<typeof relationEvidenceSchema>;

/** graphStatisticsSchemaから推論される型 */
export type InferredGraphStatistics = z.infer<typeof graphStatisticsSchema>;

/** chunkEntityRelationSchemaから推論される型 */
export type InferredChunkEntityRelation = z.infer<
  typeof chunkEntityRelationSchema
>;
