/**
 * チャンキングサービスの型定義
 *
 * @description Embedding Generation Pipelineで使用するチャンキング関連の型を定義
 */

/**
 * チャンキング戦略の種類
 */
export type ChunkingStrategy =
  | "fixed"
  | "sentence"
  | "semantic"
  | "hierarchical";

/**
 * ドキュメントタイプ
 */
export type DocumentType =
  | "markdown"
  | "text"
  | "html"
  | "pdf"
  | "code"
  | "json"
  | "api-spec"
  | "conversation"
  | "legal"
  | "academic";

/**
 * チャンク境界タイプ（Late Chunking用）
 */
export type ChunkBoundary = "sentence" | "token" | "semantic";

/**
 * プーリング戦略（Late Chunking用）
 */
export type PoolingStrategy = "mean" | "cls" | "attention";

/**
 * 共通チャンキングオプション
 */
export interface BaseChunkingOptions {
  /** チャンクサイズ（トークン数） */
  chunkSize: number;
  /** オーバーラップサイズ（トークン数） */
  overlapSize?: number;
  /** オーバーラップ率（%） */
  overlapPercentage?: number;
  /** 最小チャンクサイズ */
  minChunkSize?: number;
}

/**
 * 固定サイズチャンキングオプション
 */
export interface FixedChunkingOptions extends BaseChunkingOptions {}

/**
 * 文単位チャンキングオプション
 */
export interface SentenceChunkingOptions extends BaseChunkingOptions {
  /** 目標チャンクサイズ */
  targetChunkSize: number;
  /** 最大チャンクサイズ */
  maxChunkSize: number;
  /** 文のオーバーラップ数 */
  sentenceOverlap: number;
  /** 文区切り文字 */
  sentenceDelimiters: string[];
  /** 段落境界を優先するか */
  preserveParagraphs: boolean;
}

/**
 * セマンティックチャンキングオプション
 */
export interface SemanticChunkingOptions extends BaseChunkingOptions {
  /** 目標チャンクサイズ */
  targetChunkSize: number;
  /** 最大チャンクサイズ */
  maxChunkSize: number;
  /** 文間類似度の閾値 */
  similarityThreshold: number;
  /** 類似度計算用埋め込みモデル */
  embeddingModel: string;
  /** 強制分割マーカー */
  breakPoints: string[];
}

/**
 * 見出しパターン
 */
export type HeadingPattern = {
  type: "markdown" | "html" | "custom";
  customPattern?: RegExp;
};

/**
 * 階層チャンキングオプション
 */
export interface HierarchicalChunkingOptions extends BaseChunkingOptions {
  /** リーフチャンクの目標サイズ */
  targetChunkSize: number;
  /** 階層の最大深度 */
  maxDepth: number;
  /** 見出し検出パターン */
  headingPatterns: HeadingPattern;
  /** 親のコンテキストを継承するか */
  inheritParentContext: boolean;
  /** サマリーチャンクを作成するか */
  createSummaryChunks: boolean;
}

/**
 * Contextual Embeddingsオプション
 */
export interface ContextualEmbeddingsOptions {
  /** 有効化フラグ */
  enabled: boolean;
  /** コンテキストウィンドウサイズ（トークン数） */
  contextWindowSize: number;
  /** コンテキスト生成用プロンプトテンプレート */
  contextPromptTemplate: string;
  /** コンテキストの付与位置 */
  contextPosition: "prefix" | "suffix" | "both";
  /** コンテキストをキャッシュするか */
  cacheContext: boolean;
}

/**
 * Late Chunkingオプション
 */
export interface LateChunkingOptions {
  /** 有効化フラグ */
  enabled: boolean;
  /** 埋め込みモデル */
  embeddingModel: string;
  /** チャンク境界の決定方法 */
  chunkBoundaries: ChunkBoundary;
  /** 最大シーケンス長 */
  maxSequenceLength: number;
  /** プーリング戦略 */
  poolingStrategy: PoolingStrategy;
}

/**
 * 統合チャンキングオプション
 */
export type ChunkingOptions =
  | FixedChunkingOptions
  | SentenceChunkingOptions
  | SemanticChunkingOptions
  | HierarchicalChunkingOptions;

/**
 * チャンキング入力
 */
export interface ChunkingInput {
  /** 処理対象テキスト */
  text: string;

  /** チャンキング戦略 */
  strategy: ChunkingStrategy;

  /** 戦略固有のオプション */
  options: ChunkingOptions;

  /** メタデータ */
  metadata?: {
    documentId: string;
    documentType?: DocumentType;
    sourceFile?: string;
  };

  /** 拡張オプション */
  advanced?: {
    contextualEmbeddings?: ContextualEmbeddingsOptions;
    lateChunking?: LateChunkingOptions;
  };
}

/**
 * チャンク位置情報
 */
export interface ChunkPosition {
  /** 開始位置（文字インデックス） */
  start: number;
  /** 終了位置（文字インデックス） */
  end: number;
}

/**
 * チャンクオーバーラップ情報
 */
export interface ChunkOverlap {
  /** 前のチャンクとの重複トークン数 */
  previous: number;
  /** 次のチャンクとの重複トークン数 */
  next: number;
}

/**
 * チャンクメタデータ
 */
export interface ChunkMetadata {
  /** 使用した戦略 */
  strategy: ChunkingStrategy;
  /** オーバーラップ情報 */
  overlap?: ChunkOverlap;
  /** 階層パス */
  hierarchyPath?: string[];
  /** コンテキスト情報 */
  context?: string;
  /** ドキュメントID */
  documentId?: string;
  /** チャンクインデックス */
  chunkIndex?: number;
  /** Late Chunkingメタデータ */
  lateChunking?: {
    applied: boolean;
    embeddingDimension: number;
  };
  /** 階層チャンキング用メタデータ */
  heading?: string;
  position?: number;
  /** Contextual Embeddings用メタデータ */
  contextTokenCount?: number;
  originalTokenCount?: number;
}

/**
 * チャンク
 */
export interface Chunk {
  /** チャンクID */
  id: string;
  /** チャンク内容 */
  content: string;
  /** トークン数 */
  tokenCount: number;
  /** 位置情報 */
  position: ChunkPosition;
  /** メタデータ */
  metadata: ChunkMetadata;
}

/**
 * 階層チャンク
 */
export interface HierarchicalChunk extends Chunk {
  /** 階層レベル（0=ルート, 1=H1, 2=H2, ...） */
  level: number;
  /** 親チャンクID */
  parentId: string | null;
  /** 子チャンクID配列 */
  childIds: string[];
  /** 階層パス */
  path: string[];
}

/**
 * Contextualチャンク
 */
export interface ContextualChunk extends Chunk {
  /** 元のチャンク内容 */
  originalContent: string;
  /** 生成されたコンテキスト */
  context: string;
  /** コンテキスト化された内容 */
  contextualizedContent: string;
}

/**
 * チャンキング統計
 */
export interface ChunkingStatistics {
  /** 総チャンク数 */
  totalChunks: number;
  /** 平均チャンクサイズ */
  avgChunkSize: number;
  /** 最小チャンクサイズ */
  minChunkSize: number;
  /** 最大チャンクサイズ */
  maxChunkSize: number;
  /** 処理時間（ミリ秒） */
  processingTimeMs: number;
}

/**
 * チャンキング出力
 */
export interface ChunkingOutput {
  /** 生成されたチャンク */
  chunks: Chunk[];
  /** 処理統計 */
  statistics: ChunkingStatistics;
  /** 警告メッセージ */
  warnings?: string[];
}
