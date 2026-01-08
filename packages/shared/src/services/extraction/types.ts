/**
 * エンティティ抽出サービスの型定義
 * @description Zodスキーマによる型安全な定義
 */

import { z } from "zod";
import { EntityTypes as EntityTypeObj } from "../../types/rag/graph/types";

// =============================================================================
// Entity Types (既存のEntityTypesを再利用)
// =============================================================================

/** エンティティタイプの値配列 */
const EntityTypeValues = Object.values(EntityTypeObj) as [string, ...string[]];

/** エンティティタイプ型 */
export type EntityType = (typeof EntityTypeObj)[keyof typeof EntityTypeObj];

// =============================================================================
// Mention Schema & Type
// =============================================================================

export const MentionSchema = z.object({
  chunkId: z.string(),
  startPosition: z.number().int().nonnegative(),
  endPosition: z.number().int().nonnegative(),
  context: z.string().max(200),
});

export type Mention = z.infer<typeof MentionSchema>;

// =============================================================================
// Extracted Entity Schema & Type
// =============================================================================

export const ExtractedEntitySchema = z.object({
  name: z.string().min(1),
  normalizedName: z.string().min(1),
  type: z.enum(EntityTypeValues),
  confidence: z.number().min(0).max(1),
  description: z.string().optional(),
  aliases: z.array(z.string()).default([]),
  mentions: z.array(MentionSchema).default([]),
  attributes: z.record(z.string(), z.unknown()).optional(),
});

export type ExtractedEntity = z.infer<typeof ExtractedEntitySchema>;

// =============================================================================
// Entity Extraction Options Schema & Type
// =============================================================================

export const EntityExtractionOptionsSchema = z.object({
  types: z.array(z.enum(EntityTypeValues)).optional(),
  minConfidence: z.number().min(0).max(1).default(0.5),
  maxEntitiesPerChunk: z.number().int().positive().default(20),
  minNameLength: z.number().int().positive().default(2),
  generateDescriptions: z.boolean().default(true),
  useLLM: z.boolean().default(true),
  maxRetries: z.number().int().nonnegative().default(3),
});

/** EntityExtractionOptions 入力型（部分的指定可能） */
export type EntityExtractionOptionsInput = z.input<
  typeof EntityExtractionOptionsSchema
>;

/** EntityExtractionOptions 出力型（デフォルト適用後） */
export type EntityExtractionOptions = z.infer<
  typeof EntityExtractionOptionsSchema
>;

// =============================================================================
// Extraction Result Schema & Type
// =============================================================================

export const ExtractionResultSchema = z.object({
  entities: z.array(ExtractedEntitySchema),
  chunkId: z.string(),
  processingTimeMs: z.number().nonnegative(),
  modelUsed: z.string(),
});

export type ExtractionResult = z.infer<typeof ExtractionResultSchema>;

// =============================================================================
// Batch Extraction Result Schema & Type
// =============================================================================

export const BatchExtractionResultSchema = z.object({
  results: z.array(ExtractionResultSchema),
  totalEntities: z.number().int().nonnegative(),
  processingTimeMs: z.number().nonnegative(),
});

export type BatchExtractionResult = z.infer<typeof BatchExtractionResultSchema>;

// =============================================================================
// LLM Response Schema (internal)
// =============================================================================

export const LLMEntityResponseSchema = z.object({
  entities: z.array(
    z.object({
      name: z.string(),
      normalizedName: z.string().optional(),
      type: z.string(),
      confidence: z.number().optional(),
      description: z.string().optional(),
      aliases: z.array(z.string()).optional(),
    }),
  ),
});

export type LLMEntityResponse = z.infer<typeof LLMEntityResponseSchema>;

// =============================================================================
// Default Options
// =============================================================================

export const DEFAULT_EXTRACTION_OPTIONS: Required<
  Omit<EntityExtractionOptions, "types">
> = {
  minConfidence: 0.5,
  maxEntitiesPerChunk: 20,
  minNameLength: 2,
  generateDescriptions: true,
  useLLM: true,
  maxRetries: 3,
};

// =============================================================================
// Relation Types (CONV-06-05)
// =============================================================================

/**
 * 15種類の関係タイプ
 * @description ナレッジグラフで使用する関係の分類
 */
export const RelationTypes = {
  /** 所属関係: A belongs_to B */
  BELONGS_TO: "belongs_to",
  /** 一般的な関連: A related_to B */
  RELATED_TO: "related_to",
  /** 因果関係: A causes B */
  CAUSES: "causes",
  /** 依存関係: A depends_on B */
  DEPENDS_ON: "depends_on",
  /** 作成者: A created_by B */
  CREATED_BY: "created_by",
  /** 使用関係: A uses B */
  USES: "uses",
  /** 部分-全体: A part_of B */
  PART_OF: "part_of",
  /** 位置関係: A located_in B */
  LOCATED_IN: "located_in",
  /** 後継: A succeeds B */
  SUCCEEDS: "succeeds",
  /** 先行: A precedes B */
  PRECEDES: "precedes",
  /** 競合関係: A competes_with B */
  COMPETES_WITH: "competes_with",
  /** 協力関係: A collaborates_with B */
  COLLABORATES_WITH: "collaborates_with",
  /** 実装: A implements B */
  IMPLEMENTS: "implements",
  /** 拡張: A extends B */
  EXTENDS: "extends",
  /** その他: 分類困難な関係 */
  OTHER: "other",
} as const;

export type RelationType = (typeof RelationTypes)[keyof typeof RelationTypes];

// =============================================================================
// Relation Type Schema
// =============================================================================

export const RelationTypeSchema = z.enum([
  "belongs_to",
  "related_to",
  "causes",
  "depends_on",
  "created_by",
  "uses",
  "part_of",
  "located_in",
  "succeeds",
  "precedes",
  "competes_with",
  "collaborates_with",
  "implements",
  "extends",
  "other",
]);

// =============================================================================
// Relation Evidence Schema & Type
// =============================================================================

export const RelationEvidenceSchema = z.object({
  chunkId: z.string().min(1),
  text: z.string().min(1).max(500),
  startPosition: z.number().int().nonnegative(),
  endPosition: z.number().int().nonnegative(),
});

export type RelationEvidence = z.infer<typeof RelationEvidenceSchema>;

// =============================================================================
// Extracted Relation Schema & Type
// =============================================================================

export const ExtractedRelationSchema = z.object({
  sourceEntity: z.string().min(1),
  targetEntity: z.string().min(1),
  relationType: RelationTypeSchema,
  description: z.string().max(500).optional(),
  evidence: z.array(RelationEvidenceSchema).default([]),
  confidence: z.number().min(0).max(1),
  bidirectional: z.boolean().default(false),
  attributes: z.record(z.string(), z.unknown()).optional(),
});

export type ExtractedRelation = z.infer<typeof ExtractedRelationSchema>;

// =============================================================================
// Relation Extraction Options Schema & Type
// =============================================================================

export const RelationExtractionOptionsSchema = z.object({
  types: z.array(RelationTypeSchema).optional(),
  minConfidence: z.number().min(0).max(1).default(0.5),
  maxRelationsPerChunk: z.number().int().positive().default(30),
  extractEvidence: z.boolean().default(true),
  detectBidirectional: z.boolean().default(true),
  useLLM: z.boolean().default(true),
  maxRetries: z.number().int().nonnegative().default(3),
});

/** RelationExtractionOptions 入力型（部分的指定可能） */
export type RelationExtractionOptionsInput = z.input<
  typeof RelationExtractionOptionsSchema
>;

/** RelationExtractionOptions 出力型（デフォルト適用後） */
export type RelationExtractionOptions = z.infer<
  typeof RelationExtractionOptionsSchema
>;

// =============================================================================
// Relation Extraction Result Schema & Type
// =============================================================================

export const RelationExtractionResultSchema = z.object({
  relations: z.array(ExtractedRelationSchema),
  chunkId: z.string(),
  processingTimeMs: z.number().nonnegative(),
  modelUsed: z.string(),
});

export type RelationExtractionResult = z.infer<
  typeof RelationExtractionResultSchema
>;

// =============================================================================
// Batch Relation Extraction Result Schema & Type
// =============================================================================

export const BatchRelationExtractionResultSchema = z.object({
  results: z.array(RelationExtractionResultSchema),
  totalRelations: z.number().int().nonnegative(),
  uniqueRelations: z.number().int().nonnegative(),
  processingTimeMs: z.number().nonnegative(),
});

export type BatchRelationExtractionResult = z.infer<
  typeof BatchRelationExtractionResultSchema
>;

// =============================================================================
// LLM Relation Response Schema (internal)
// =============================================================================

export const LLMRelationResponseSchema = z.object({
  relations: z.array(
    z.object({
      sourceEntity: z.string(),
      targetEntity: z.string(),
      relationType: z.string(),
      description: z.string().optional(),
      confidence: z.number().optional(),
      bidirectional: z.boolean().optional(),
      evidence: z
        .object({
          text: z.string(),
          startPosition: z.number().optional(),
          endPosition: z.number().optional(),
        })
        .optional(),
    }),
  ),
});

export type LLMRelationResponse = z.infer<typeof LLMRelationResponseSchema>;

// =============================================================================
// Default Relation Extraction Options
// =============================================================================

export const DEFAULT_RELATION_EXTRACTION_OPTIONS: Required<
  Omit<RelationExtractionOptions, "types">
> = {
  minConfidence: 0.5,
  maxRelationsPerChunk: 30,
  extractEvidence: true,
  detectBidirectional: true,
  useLLM: true,
  maxRetries: 3,
};

/**
 * 双方向関係タイプ
 * @description これらのタイプはデフォルトでbidirectional=true
 */
export const BIDIRECTIONAL_RELATION_TYPES: RelationType[] = [
  "related_to",
  "competes_with",
  "collaborates_with",
];
