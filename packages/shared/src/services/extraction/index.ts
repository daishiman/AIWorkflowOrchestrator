/**
 * エンティティ抽出サービス
 * @description NER機能のエクスポート
 */

// Types
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

export {
  MentionSchema,
  ExtractedEntitySchema,
  EntityExtractionOptionsSchema,
  ExtractionResultSchema,
  BatchExtractionResultSchema,
  LLMEntityResponseSchema,
  DEFAULT_EXTRACTION_OPTIONS,
} from "./types";

// Interfaces
export type {
  IEntityExtractor,
  ILLMProvider,
  LLMGenerateOptions,
  LLMGenerateResult,
} from "./interfaces";

// Implementations
export { LLMEntityExtractor } from "./entity-extractor";
export { RuleBasedEntityExtractor } from "./rule-based-extractor";

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

// Prompts
export {
  buildEntityExtractionPrompt,
  SYSTEM_PROMPT,
  ENTITY_TYPE_DESCRIPTIONS,
} from "./prompts/entity-extraction";
