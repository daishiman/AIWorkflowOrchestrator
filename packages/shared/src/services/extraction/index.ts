/**
 * エンティティ・関係抽出サービス
 * @description NER/RE機能のエクスポート
 */

// Entity Types
export type {
  EntityType,
  Mention,
  ExtractedEntity,
  EntityExtractionOptions,
  EntityExtractionOptionsInput,
  ExtractionResult,
  BatchExtractionResult,
  LLMEntityResponse,
} from "./types";

// Relation Types (CONV-06-05)
export type {
  RelationType,
  RelationEvidence,
  ExtractedRelation,
  RelationExtractionOptions,
  RelationExtractionOptionsInput,
  RelationExtractionResult,
  BatchRelationExtractionResult,
  LLMRelationResponse,
} from "./types";

// Entity Schemas
export {
  MentionSchema,
  ExtractedEntitySchema,
  EntityExtractionOptionsSchema,
  ExtractionResultSchema,
  BatchExtractionResultSchema,
  LLMEntityResponseSchema,
  DEFAULT_EXTRACTION_OPTIONS,
} from "./types";

// Relation Schemas (CONV-06-05)
export {
  RelationTypes,
  RelationTypeSchema,
  RelationEvidenceSchema,
  ExtractedRelationSchema,
  RelationExtractionOptionsSchema,
  RelationExtractionResultSchema,
  BatchRelationExtractionResultSchema,
  LLMRelationResponseSchema,
  DEFAULT_RELATION_EXTRACTION_OPTIONS,
  BIDIRECTIONAL_RELATION_TYPES,
} from "./types";

// Interfaces
export type {
  IEntityExtractor,
  IRelationExtractor,
  ILLMProvider,
  LLMGenerateOptions,
  LLMGenerateResult,
} from "./interfaces";

// Entity Implementations
export { LLMEntityExtractor } from "./entity-extractor";
export { RuleBasedEntityExtractor } from "./rule-based-extractor";

// Relation Implementations (CONV-06-05)
export { LLMRelationExtractor } from "./relation-extractor";

// Errors
export {
  EntityExtractionError,
  LLMProviderError,
  JsonParseError,
  ValidationError,
  TimeoutError,
  EmptyInputError,
} from "./errors";

// Utils
export {
  normalizeEntityName,
  escapeRegex,
  mergeOptions,
  findMentionsInText,
  deduplicateEntities,
} from "./utils";

// Entity Prompts
export {
  buildEntityExtractionPrompt,
  SYSTEM_PROMPT,
  ENTITY_TYPE_DESCRIPTIONS,
} from "./prompts/entity-extraction";

// Relation Prompts (CONV-06-05)
export {
  buildRelationExtractionPrompt,
  RELATION_SYSTEM_PROMPT,
  RELATION_TYPE_DESCRIPTIONS,
} from "./prompts/relation-extraction";
