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
