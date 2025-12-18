/**
 * @file チャンク・埋め込み型定義
 * @module @repo/shared/types/rag/chunk/types
 * @description RAGパイプラインにおけるチャンキングと埋め込み生成に関する型定義
 *
 * 設計原則:
 * - すべてのフィールドにreadonly修飾子を適用（イミュータブル設計）
 * - Branded Typesによる型安全なID管理
 * - as constによる列挙型の不変性保証
 * - ミックスイン（Timestamped, WithMetadata）による共通機能の継承
 */

import type { ChunkId, EmbeddingId, FileId } from "../branded";
import type { Timestamped, WithMetadata } from "../interfaces";

// =============================================================================
// 列挙型（Enums as const）
// =============================================================================

/**
 * チャンキング戦略の列挙型
 *
 * 各戦略の特徴:
 * - FIXED_SIZE: 固定サイズで分割（最もシンプル）
 * - SEMANTIC: 意味的な境界で分割（文脈を保持）
 * - RECURSIVE: 再帰的に分割（バランスの良い分割）
 * - SENTENCE: 文単位で分割
 * - PARAGRAPH: 段落単位で分割
 * - MARKDOWN_HEADER: Markdownのヘッダーで分割
 * - CODE_BLOCK: コードブロック単位で分割
 */
export const ChunkingStrategies = {
  FIXED_SIZE: "fixed_size",
  SEMANTIC: "semantic",
  RECURSIVE: "recursive",
  SENTENCE: "sentence",
  PARAGRAPH: "paragraph",
  MARKDOWN_HEADER: "markdown_header",
  CODE_BLOCK: "code_block",
} as const;

/**
 * 埋め込みプロバイダーの列挙型
 *
 * 各プロバイダーの特徴:
 * - OPENAI: OpenAI APIを使用（text-embedding-3-small等）
 * - COHERE: Cohere APIを使用（embed-english-v3.0等）
 * - VOYAGE: Voyage AI APIを使用（voyage-2等）
 * - LOCAL: ローカルモデルを使用（all-MiniLM-L6-v2等）
 */
export const EmbeddingProviders = {
  OPENAI: "openai",
  COHERE: "cohere",
  VOYAGE: "voyage",
  LOCAL: "local",
} as const;

// =============================================================================
// 型エイリアス
// =============================================================================

/**
 * チャンキング戦略の型
 * ChunkingStrategiesの値から派生
 */
export type ChunkingStrategy =
  (typeof ChunkingStrategies)[keyof typeof ChunkingStrategies];

/**
 * 埋め込みプロバイダーの型
 * EmbeddingProvidersの値から派生
 */
export type EmbeddingProvider =
  (typeof EmbeddingProviders)[keyof typeof EmbeddingProviders];

// =============================================================================
// 基本インターフェース
// =============================================================================

/**
 * チャンクの位置情報
 *
 * 元ドキュメント内でのチャンクの位置を表す
 */
export interface ChunkPosition {
  /** チャンクのインデックス（0始まり） */
  readonly index: number;

  /** 開始行番号（1始まり） */
  readonly startLine: number;

  /** 終了行番号（1始まり、この行を含む） */
  readonly endLine: number;

  /** 開始文字位置（0始まり） */
  readonly startChar: number;

  /** 終了文字位置（0始まり、この位置を含む） */
  readonly endChar: number;

  /** 親ヘッダー（Markdownの場合）。ヘッダーがない場合はnull */
  readonly parentHeader: string | null;
}

/**
 * チャンク間のオーバーラップ情報
 *
 * 前後のチャンクとの重複を管理
 */
export interface ChunkOverlap {
  /** 前のチャンクのID。最初のチャンクの場合はnull */
  readonly prevChunkId: ChunkId | null;

  /** 次のチャンクのID。最後のチャンクの場合はnull */
  readonly nextChunkId: ChunkId | null;

  /** オーバーラップするトークン数 */
  readonly overlapTokens: number;
}

// =============================================================================
// エンティティインターフェース
// =============================================================================

/**
 * チャンクエンティティ
 *
 * 分割されたテキストの1単位を表す
 * Timestamped, WithMetadataを継承
 */
export interface ChunkEntity extends Timestamped, WithMetadata {
  /** チャンクの一意識別子 */
  readonly id: ChunkId;

  /** 元ファイルのID */
  readonly fileId: FileId;

  /** チャンクのテキスト内容 */
  readonly content: string;

  /**
   * コンテキスト付きのテキスト内容
   * 文脈情報を含めたテキスト（オプション）
   * nullの場合はcontentと同じ
   */
  readonly contextualContent: string | null;

  /** チャンクの位置情報 */
  readonly position: ChunkPosition;

  /** 使用したチャンキング戦略 */
  readonly strategy: ChunkingStrategy;

  /** トークン数 */
  readonly tokenCount: number;

  /** SHA-256ハッシュ（重複検出用、64文字の16進数文字列） */
  readonly hash: string;
}

/**
 * 埋め込みエンティティ
 *
 * チャンクに対して生成されたベクトル埋め込みを表す
 * Timestampedを継承（WithMetadataは継承しない - 設計上の判断）
 */
export interface EmbeddingEntity extends Timestamped {
  /** 埋め込みの一意識別子 */
  readonly id: EmbeddingId;

  /** 対応するチャンクのID */
  readonly chunkId: ChunkId;

  /** 埋め込みベクトル（Float32Array形式） */
  readonly vector: Float32Array;

  /** 使用したモデルのID */
  readonly modelId: string;

  /** ベクトルの次元数 */
  readonly dimensions: number;

  /** L2正規化後のマグニチュード（通常は1.0に近い値） */
  readonly normalizedMagnitude: number;
}

// =============================================================================
// 設定インターフェース
// =============================================================================

/**
 * 埋め込みモデル設定
 *
 * 埋め込みモデルのパラメータを定義
 */
export interface EmbeddingModelConfig {
  /** 埋め込みプロバイダー */
  readonly provider: EmbeddingProvider;

  /** モデルID（例: "text-embedding-3-small"） */
  readonly modelId: string;

  /** ベクトルの次元数 */
  readonly dimensions: number;

  /** 1チャンクあたりの最大トークン数 */
  readonly maxTokens: number;

  /** バッチ処理時の最大チャンク数 */
  readonly batchSize: number;
}

/**
 * チャンキング設定
 *
 * チャンキング処理のパラメータを定義
 */
export interface ChunkingConfig {
  /** チャンキング戦略 */
  readonly strategy: ChunkingStrategy;

  /** 目標チャンクサイズ（トークン数） */
  readonly targetSize: number;

  /** 最小チャンクサイズ（トークン数） */
  readonly minSize: number;

  /** 最大チャンクサイズ（トークン数） */
  readonly maxSize: number;

  /** オーバーラップサイズ（トークン数） */
  readonly overlapSize: number;

  /** 文・段落境界を尊重するか */
  readonly preserveBoundaries: boolean;

  /** コンテキスト情報を含めるか */
  readonly includeContext: boolean;
}

// =============================================================================
// 結果インターフェース
// =============================================================================

/**
 * チャンキング処理結果
 *
 * ファイルをチャンキングした結果を表す
 */
export interface ChunkingResult {
  /** 処理したファイルのID */
  readonly fileId: FileId;

  /** 生成されたチャンクの配列 */
  readonly chunks: ChunkEntity[];

  /** 全チャンクの合計トークン数 */
  readonly totalTokens: number;

  /** 平均チャンクサイズ（トークン数） */
  readonly averageChunkSize: number;

  /** 処理時間（ミリ秒） */
  readonly processingTime: number;
}

/**
 * 埋め込み生成結果
 *
 * 1つのチャンクに対する埋め込み生成結果を表す
 */
export interface EmbeddingGenerationResult {
  /** 対応するチャンクのID */
  readonly chunkId: ChunkId;

  /** 生成された埋め込みエンティティ */
  readonly embedding: EmbeddingEntity;

  /** 処理時間（ミリ秒） */
  readonly processingTime: number;

  /** 使用したトークン数 */
  readonly tokensUsed: number;
}
