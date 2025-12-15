# CONV-03-03: チャンク・埋め込みスキーマ定義

## 概要

| 項目     | 内容                                   |
| -------- | -------------------------------------- |
| タスクID | CONV-03-03                             |
| タスク名 | チャンク・埋め込みスキーマ定義         |
| 依存     | CONV-03-01                             |
| 規模     | 小                                     |
| 出力場所 | `packages/shared/src/types/rag/chunk/` |

## 目的

テキストチャンキングと埋め込みベクトル生成に関する型とZodスキーマを定義する。
CONV-06（埋め込み生成パイプライン）の基盤となる。

## 成果物

### 1. チャンク型定義

```typescript
// packages/shared/src/types/rag/chunk/types.ts

import type { FileId, ChunkId, EmbeddingId } from "../branded";
import type { Timestamped, WithMetadata } from "../interfaces";

/**
 * チャンキング戦略
 */
export const ChunkingStrategies = {
  FIXED_SIZE: "fixed_size", // 固定サイズ分割
  SEMANTIC: "semantic", // 意味的境界で分割
  RECURSIVE: "recursive", // 再帰的文字分割
  SENTENCE: "sentence", // 文単位分割
  PARAGRAPH: "paragraph", // 段落単位分割
  MARKDOWN_HEADER: "markdown_header", // Markdownヘッダー基準
  CODE_BLOCK: "code_block", // コードブロック単位
} as const;

export type ChunkingStrategy =
  (typeof ChunkingStrategies)[keyof typeof ChunkingStrategies];

/**
 * チャンクエンティティ
 */
export interface ChunkEntity extends Timestamped, WithMetadata {
  readonly id: ChunkId;
  readonly fileId: FileId;
  readonly content: string;
  readonly contextualContent: string | null; // Contextual Retrieval用
  readonly position: ChunkPosition;
  readonly strategy: ChunkingStrategy;
  readonly tokenCount: number;
  readonly hash: string; // 重複検出用
}

/**
 * チャンク位置情報
 */
export interface ChunkPosition {
  readonly index: number; // チャンク順序
  readonly startLine: number; // 開始行番号
  readonly endLine: number; // 終了行番号
  readonly startChar: number; // 開始文字位置
  readonly endChar: number; // 終了文字位置
  readonly parentHeader: string | null; // 親見出し
}

/**
 * チャンク間の関係（オーバーラップ）
 */
export interface ChunkOverlap {
  readonly prevChunkId: ChunkId | null;
  readonly nextChunkId: ChunkId | null;
  readonly overlapTokens: number;
}

/**
 * 埋め込みプロバイダー
 */
export const EmbeddingProviders = {
  OPENAI: "openai",
  COHERE: "cohere",
  VOYAGE: "voyage",
  LOCAL: "local", // Ollama等
} as const;

export type EmbeddingProvider =
  (typeof EmbeddingProviders)[keyof typeof EmbeddingProviders];

/**
 * 埋め込みモデル設定
 */
export interface EmbeddingModelConfig {
  readonly provider: EmbeddingProvider;
  readonly modelId: string;
  readonly dimensions: number;
  readonly maxTokens: number;
  readonly batchSize: number;
}

/**
 * 埋め込みエンティティ
 */
export interface EmbeddingEntity extends Timestamped {
  readonly id: EmbeddingId;
  readonly chunkId: ChunkId;
  readonly vector: Float32Array;
  readonly modelId: string;
  readonly dimensions: number;
  readonly normalizedMagnitude: number; // 正規化検証用
}

/**
 * チャンキング設定
 */
export interface ChunkingConfig {
  readonly strategy: ChunkingStrategy;
  readonly targetSize: number; // 目標トークン数
  readonly minSize: number; // 最小トークン数
  readonly maxSize: number; // 最大トークン数
  readonly overlapSize: number; // オーバーラップトークン数
  readonly preserveBoundaries: boolean; // 文/段落境界を保持
  readonly includeContext: boolean; // Contextual Retrieval使用
}

/**
 * チャンキング結果
 */
export interface ChunkingResult {
  readonly fileId: FileId;
  readonly chunks: ChunkEntity[];
  readonly totalTokens: number;
  readonly averageChunkSize: number;
  readonly processingTime: number; // ms
}

/**
 * 埋め込み生成結果
 */
export interface EmbeddingGenerationResult {
  readonly chunkId: ChunkId;
  readonly embedding: EmbeddingEntity;
  readonly processingTime: number; // ms
  readonly tokensUsed: number;
}
```

### 2. Zodスキーマ

```typescript
// packages/shared/src/types/rag/chunk/schemas.ts

import { z } from "zod";
import { uuidSchema, timestampedSchema, metadataSchema } from "../schemas";

/**
 * チャンキング戦略スキーマ
 */
export const chunkingStrategySchema = z.enum([
  "fixed_size",
  "semantic",
  "recursive",
  "sentence",
  "paragraph",
  "markdown_header",
  "code_block",
]);

/**
 * チャンク位置スキーマ
 */
export const chunkPositionSchema = z.object({
  index: z.number().int().min(0),
  startLine: z.number().int().min(1),
  endLine: z.number().int().min(1),
  startChar: z.number().int().min(0),
  endChar: z.number().int().min(0),
  parentHeader: z.string().nullable(),
});

/**
 * チャンクエンティティスキーマ
 */
export const chunkEntitySchema = z
  .object({
    id: uuidSchema,
    fileId: uuidSchema,
    content: z.string().min(1),
    contextualContent: z.string().nullable(),
    position: chunkPositionSchema,
    strategy: chunkingStrategySchema,
    tokenCount: z.number().int().min(1),
    hash: z.string().length(64),
    metadata: metadataSchema,
  })
  .merge(timestampedSchema);

/**
 * チャンクオーバーラップスキーマ
 */
export const chunkOverlapSchema = z.object({
  prevChunkId: uuidSchema.nullable(),
  nextChunkId: uuidSchema.nullable(),
  overlapTokens: z.number().int().min(0),
});

/**
 * 埋め込みプロバイダースキーマ
 */
export const embeddingProviderSchema = z.enum([
  "openai",
  "cohere",
  "voyage",
  "local",
]);

/**
 * 埋め込みモデル設定スキーマ
 */
export const embeddingModelConfigSchema = z.object({
  provider: embeddingProviderSchema,
  modelId: z.string().min(1),
  dimensions: z.number().int().min(64).max(4096),
  maxTokens: z.number().int().min(1).max(8192),
  batchSize: z.number().int().min(1).max(100),
});

/**
 * 埋め込みエンティティスキーマ
 * 注: vectorはFloat32Arrayのため、スキーマでは配列として扱う
 */
export const embeddingEntitySchema = z
  .object({
    id: uuidSchema,
    chunkId: uuidSchema,
    vector: z.array(z.number()).min(64).max(4096),
    modelId: z.string().min(1),
    dimensions: z.number().int().min(64).max(4096),
    normalizedMagnitude: z.number().min(0.99).max(1.01), // 正規化ベクトルは約1.0
  })
  .merge(timestampedSchema);

/**
 * チャンキング設定スキーマ
 */
export const chunkingConfigSchema = z
  .object({
    strategy: chunkingStrategySchema,
    targetSize: z.number().int().min(50).max(2000).default(512),
    minSize: z.number().int().min(10).max(1000).default(100),
    maxSize: z.number().int().min(100).max(4000).default(1024),
    overlapSize: z.number().int().min(0).max(500).default(50),
    preserveBoundaries: z.boolean().default(true),
    includeContext: z.boolean().default(true),
  })
  .refine(
    (config) =>
      config.minSize <= config.targetSize &&
      config.targetSize <= config.maxSize,
    { message: "minSize <= targetSize <= maxSize must hold" },
  );

/**
 * チャンキング結果スキーマ
 */
export const chunkingResultSchema = z.object({
  fileId: uuidSchema,
  chunks: z.array(chunkEntitySchema),
  totalTokens: z.number().int().min(0),
  averageChunkSize: z.number().min(0),
  processingTime: z.number().min(0),
});

/**
 * 埋め込み生成結果スキーマ
 */
export const embeddingGenerationResultSchema = z.object({
  chunkId: uuidSchema,
  embedding: embeddingEntitySchema,
  processingTime: z.number().min(0),
  tokensUsed: z.number().int().min(0),
});

/**
 * バッチ埋め込み入力スキーマ
 */
export const batchEmbeddingInputSchema = z.object({
  chunks: z
    .array(
      z.object({
        id: uuidSchema,
        content: z.string().min(1),
      }),
    )
    .min(1)
    .max(100),
  modelConfig: embeddingModelConfigSchema,
});
```

### 3. 埋め込みユーティリティ

```typescript
// packages/shared/src/types/rag/chunk/utils.ts

import type {
  EmbeddingEntity,
  EmbeddingModelConfig,
  ChunkingConfig,
} from "./types";
import { ChunkingStrategies, EmbeddingProviders } from "./types";

/**
 * デフォルトチャンキング設定
 */
export const defaultChunkingConfig: ChunkingConfig = {
  strategy: ChunkingStrategies.RECURSIVE,
  targetSize: 512,
  minSize: 100,
  maxSize: 1024,
  overlapSize: 50,
  preserveBoundaries: true,
  includeContext: true,
};

/**
 * デフォルト埋め込みモデル設定
 */
export const defaultEmbeddingModelConfigs: Record<
  string,
  EmbeddingModelConfig
> = {
  "text-embedding-3-small": {
    provider: EmbeddingProviders.OPENAI,
    modelId: "text-embedding-3-small",
    dimensions: 1536,
    maxTokens: 8191,
    batchSize: 100,
  },
  "text-embedding-3-large": {
    provider: EmbeddingProviders.OPENAI,
    modelId: "text-embedding-3-large",
    dimensions: 3072,
    maxTokens: 8191,
    batchSize: 100,
  },
  "embed-english-v3.0": {
    provider: EmbeddingProviders.COHERE,
    modelId: "embed-english-v3.0",
    dimensions: 1024,
    maxTokens: 512,
    batchSize: 96,
  },
  "voyage-large-2": {
    provider: EmbeddingProviders.VOYAGE,
    modelId: "voyage-large-2",
    dimensions: 1536,
    maxTokens: 16000,
    batchSize: 128,
  },
};

/**
 * ベクトル正規化
 */
export const normalizeVector = (vector: Float32Array): Float32Array => {
  const magnitude = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0));
  if (magnitude === 0) return vector;
  return new Float32Array(vector.map((val) => val / magnitude));
};

/**
 * ベクトル大きさ計算
 */
export const vectorMagnitude = (vector: Float32Array): number => {
  return Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0));
};

/**
 * コサイン類似度計算
 */
export const cosineSimilarity = (a: Float32Array, b: Float32Array): number => {
  if (a.length !== b.length) {
    throw new Error("Vector dimensions must match");
  }

  let dotProduct = 0;
  let magnitudeA = 0;
  let magnitudeB = 0;

  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    magnitudeA += a[i] * a[i];
    magnitudeB += b[i] * b[i];
  }

  const magnitude = Math.sqrt(magnitudeA) * Math.sqrt(magnitudeB);
  if (magnitude === 0) return 0;

  return dotProduct / magnitude;
};

/**
 * ユークリッド距離計算
 */
export const euclideanDistance = (a: Float32Array, b: Float32Array): number => {
  if (a.length !== b.length) {
    throw new Error("Vector dimensions must match");
  }

  let sum = 0;
  for (let i = 0; i < a.length; i++) {
    const diff = a[i] - b[i];
    sum += diff * diff;
  }

  return Math.sqrt(sum);
};

/**
 * 内積計算（正規化済みベクトル用）
 */
export const dotProduct = (a: Float32Array, b: Float32Array): number => {
  if (a.length !== b.length) {
    throw new Error("Vector dimensions must match");
  }

  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result += a[i] * b[i];
  }

  return result;
};

/**
 * Float32ArrayをBase64文字列に変換（ストレージ用）
 */
export const vectorToBase64 = (vector: Float32Array): string => {
  const buffer = Buffer.from(vector.buffer);
  return buffer.toString("base64");
};

/**
 * Base64文字列をFloat32Arrayに変換
 */
export const base64ToVector = (base64: string): Float32Array => {
  const buffer = Buffer.from(base64, "base64");
  return new Float32Array(
    buffer.buffer,
    buffer.byteOffset,
    buffer.byteLength / 4,
  );
};

/**
 * トークン数推定（簡易版）
 * 正確なカウントにはtiktokenなどを使用すること
 */
export const estimateTokenCount = (text: string): number => {
  // 英語: 約4文字 = 1トークン
  // 日本語: 約1.5文字 = 1トークン（より複雑）
  const englishChars = text.replace(/[^\x00-\x7F]/g, "").length;
  const nonEnglishChars = text.length - englishChars;

  return Math.ceil(englishChars / 4 + nonEnglishChars / 1.5);
};
```

### 4. バレルエクスポート

```typescript
// packages/shared/src/types/rag/chunk/index.ts

export * from "./types";
export * from "./schemas";
export * from "./utils";
```

## ディレクトリ構造

```
packages/shared/src/types/rag/chunk/
├── index.ts      # バレルエクスポート
├── types.ts      # 型定義
├── schemas.ts    # Zodスキーマ
└── utils.ts      # ユーティリティ関数
```

## 受け入れ条件

- [ ] `ChunkEntity`, `ChunkPosition` 型が定義されている
- [ ] `EmbeddingEntity`, `EmbeddingModelConfig` 型が定義されている
- [ ] チャンキング戦略の列挙型が定義されている
- [ ] 埋め込みプロバイダーの列挙型が定義されている
- [ ] 全型に対応するZodスキーマが定義されている
- [ ] ベクトル操作ユーティリティ（正規化、類似度計算等）が実装されている
- [ ] Base64変換ユーティリティが実装されている
- [ ] デフォルト設定が定義されている
- [ ] 単体テストが作成されている

## 依存関係

### このタスクが依存するもの

- CONV-03-01: 基本型・共通インターフェース定義

### このタスクに依存するもの

- CONV-04-03: content_chunks テーブル + FTS5
- CONV-06-01: チャンキング戦略実装
- CONV-06-02: 埋め込みプロバイダー抽象化
