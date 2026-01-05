/**
 * @file ファイル変換基盤 - バレルエクスポート
 * @module @repo/shared/services/conversion
 * @description 変換基盤モジュールの公開APIを統一エクスポート
 */

// =============================================================================
// 型定義
// =============================================================================

export type {
  // 入出力型
  ConverterInput,
  ConverterOutput,
  ConverterOptions,
  ConverterMetadata,
  ExtractedMetadata,
  // インターフェース
  IConverter,
  // バッチ変換型
  BatchConversionResult,
  BatchConversionSummary,
  // サービス設定型
  ConversionServiceOptions,
  ConversionServiceSettings,
} from "./types";

// =============================================================================
// 定数
// =============================================================================

export { DEFAULT_CONVERTER_OPTIONS } from "./types";

// =============================================================================
// 型ガード関数
// =============================================================================

export { isTextContent, isBinaryContent } from "./types";

// =============================================================================
// ヘルパー関数
// =============================================================================

export { mergeConverterOptions } from "./types";

// =============================================================================
// ファクトリ関数
// =============================================================================

export { createConverterInput, createConverterOutput } from "./types";

// =============================================================================
// 抽象クラス
// =============================================================================

export { BaseConverter } from "./base-converter";

// =============================================================================
// レジストリ
// =============================================================================

export {
  ConverterRegistry,
  globalConverterRegistry,
  initializeGlobalRegistry,
  createTestRegistry,
} from "./converter-registry";

// =============================================================================
// サービス
// =============================================================================

export {
  ConversionService,
  globalConversionService,
  createConversionService,
  summarizeBatchResults,
} from "./conversion-service";

// =============================================================================
// ユーティリティ
// =============================================================================

export { MetadataExtractor } from "./metadata-extractor";
