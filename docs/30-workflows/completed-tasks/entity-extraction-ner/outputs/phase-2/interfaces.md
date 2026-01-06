# エンティティ抽出サービス - インターフェース設計書

## 1. IEntityExtractor インターフェース

```typescript
/**
 * エンティティ抽出サービスのインターフェース
 *
 * LLMベースとルールベースの実装で共通のインターフェースを提供。
 * Strategy Patternにより実装を切り替え可能。
 */
export interface IEntityExtractor {
  /**
   * 単一チャンクからエンティティを抽出
   *
   * @param chunk - 抽出対象のチャンク
   * @param options - 抽出オプション
   * @returns 抽出結果またはエラー
   */
  extract(
    chunk: Chunk,
    options?: EntityExtractionOptions,
  ): Promise<Result<EntityExtractionResult, EntityExtractionError>>;

  /**
   * 複数チャンクからバッチ抽出
   *
   * @param chunks - 抽出対象のチャンク配列
   * @param options - 抽出オプション
   * @returns バッチ抽出結果またはエラー
   */
  extractBatch(
    chunks: Chunk[],
    options?: EntityExtractionOptions,
  ): Promise<Result<BatchEntityExtractionResult, EntityExtractionError>>;

  /**
   * 複数の抽出結果からエンティティをマージ
   * 同一エンティティの重複を除去し、メンション情報を集約
   *
   * @param results - マージ対象の抽出結果配列
   * @returns マージされたエンティティ配列
   */
  mergeEntities(results: EntityExtractionResult[]): ExtractedEntity[];
}
```

---

## 2. ILLMProvider インターフェース (外部依存)

```typescript
/**
 * LLMプロバイダーのインターフェース
 * テスト時にモック可能とするために抽象化
 */
export interface ILLMProvider {
  /** モデルID */
  readonly modelId: string;

  /**
   * LLMにテキスト生成を依頼
   *
   * @param prompt - 入力プロンプト
   * @param options - 生成オプション
   * @returns 生成結果またはエラー
   */
  generate(
    prompt: string,
    options?: LLMGenerateOptions,
  ): Promise<Result<LLMGenerateResult, Error>>;
}

export interface LLMGenerateOptions {
  maxTokens?: number;
  temperature?: number;
  responseFormat?: "text" | "json";
}

export interface LLMGenerateResult {
  text: string;
  tokensUsed: number;
}
```

---

## 3. 型定義 (types.ts)

### 3.1 EntityExtractionOptions

```typescript
import { z } from "zod";
import { EntityType, entityTypeSchema } from "@/types/rag/graph/types";

/**
 * エンティティ抽出オプションのZodスキーマ
 */
export const entityExtractionOptionsSchema = z.object({
  /** 抽出するエンティティタイプ（省略時は全タイプ） */
  types: z.array(entityTypeSchema).optional(),

  /** 1チャンクあたりの最大エンティティ数 */
  maxEntitiesPerChunk: z.number().int().min(1).max(100).default(20),

  /** 最小信頼度スコア（これ未満は除外） */
  minConfidence: z.number().min(0).max(1).default(0.5),

  /** エンティティ名の最小文字数 */
  minNameLength: z.number().int().min(1).default(2),

  /** LLMを使用するか（falseの場合はルールベース） */
  useLLM: z.boolean().default(true),

  /** エンティティの説明を生成するか */
  generateDescriptions: z.boolean().default(true),
});

export type EntityExtractionOptions = z.infer<
  typeof entityExtractionOptionsSchema
>;
```

### 3.2 ExtractedEntity

```typescript
/**
 * 抽出されたエンティティのZodスキーマ
 */
export const extractedEntitySchema = z.object({
  /** エンティティ名（表記通り） */
  name: z.string().min(1).max(255),

  /** 正規化された名前（小文字、空白統一、特殊文字除去） */
  normalizedName: z.string().min(1).max(255),

  /** エンティティタイプ（52種類） */
  type: entityTypeSchema,

  /** エンティティの説明（オプション） */
  description: z.string().max(500).optional(),

  /** エイリアス（別名）リスト */
  aliases: z.array(z.string().min(1).max(255)).default([]),

  /** メンション（出現位置）情報 */
  mentions: z.array(
    z.object({
      chunkId: z.string(),
      startPosition: z.number().int().min(0),
      endPosition: z.number().int().min(0),
      context: z.string().max(200),
    }),
  ),

  /** 信頼度スコア（0.0〜1.0） */
  confidence: z.number().min(0).max(1),

  /** 追加属性（拡張用） */
  attributes: z.record(z.unknown()).optional(),
});

export type ExtractedEntity = z.infer<typeof extractedEntitySchema>;
```

### 3.3 EntityMention

```typescript
/**
 * エンティティメンション（出現位置）のZodスキーマ
 */
export const entityMentionSchema = z.object({
  /** 出現チャンクID */
  chunkId: z.string(),

  /** 開始位置（文字インデックス） */
  startPosition: z.number().int().min(0),

  /** 終了位置（文字インデックス） */
  endPosition: z.number().int().min(0),

  /** 周辺コンテキスト（前後50文字程度） */
  context: z.string().max(200),
});

export type EntityMention = z.infer<typeof entityMentionSchema>;
```

### 3.4 EntityExtractionResult

```typescript
/**
 * 単一チャンクの抽出結果のZodスキーマ
 */
export const entityExtractionResultSchema = z.object({
  /** 抽出されたエンティティ配列 */
  entities: z.array(extractedEntitySchema),

  /** 処理対象チャンクID */
  chunkId: z.string(),

  /** 処理時間（ミリ秒） */
  processingTimeMs: z.number().min(0),

  /** 使用モデル */
  modelUsed: z.string(),
});

export type EntityExtractionResult = z.infer<
  typeof entityExtractionResultSchema
>;
```

### 3.5 BatchEntityExtractionResult

```typescript
/**
 * バッチ抽出結果のZodスキーマ
 */
export const batchEntityExtractionResultSchema = z.object({
  /** 各チャンクの抽出結果 */
  results: z.array(entityExtractionResultSchema),

  /** 総エンティティ数（重複含む） */
  totalEntities: z.number().int().min(0),

  /** ユニークエンティティ数（マージ後） */
  uniqueEntities: z.number().int().min(0),

  /** 総処理時間（ミリ秒） */
  processingTimeMs: z.number().min(0),
});

export type BatchEntityExtractionResult = z.infer<
  typeof batchEntityExtractionResultSchema
>;
```

---

## 4. エラー定義 (errors.ts)

```typescript
/**
 * エンティティ抽出エラーの基底クラス
 */
export class EntityExtractionError extends Error {
  constructor(
    message: string,
    public readonly code: EntityExtractionErrorCode,
    public readonly cause?: Error,
  ) {
    super(message);
    this.name = "EntityExtractionError";
  }
}

export type EntityExtractionErrorCode =
  | "LLM_ERROR" // LLM呼び出しエラー
  | "PARSE_ERROR" // レスポンスパースエラー
  | "VALIDATION_ERROR" // バリデーションエラー
  | "TIMEOUT_ERROR" // タイムアウト
  | "UNKNOWN_ERROR"; // 不明なエラー

/**
 * LLMエラー
 */
export class LLMError extends EntityExtractionError {
  constructor(message: string, cause?: Error) {
    super(message, "LLM_ERROR", cause);
    this.name = "LLMError";
  }
}

/**
 * パースエラー
 */
export class ParseError extends EntityExtractionError {
  constructor(message: string, cause?: Error) {
    super(message, "PARSE_ERROR", cause);
    this.name = "ParseError";
  }
}

/**
 * バリデーションエラー
 */
export class ValidationError extends EntityExtractionError {
  constructor(message: string, cause?: Error) {
    super(message, "VALIDATION_ERROR", cause);
    this.name = "ValidationError";
  }
}
```

---

## 5. プロンプト定義 (prompts/entity-extraction.ts)

```typescript
/**
 * エンティティ抽出用のプロンプトを生成
 */
export const buildEntityExtractionPrompt = (
  content: string,
  options: EntityExtractionOptions,
): string => {
  const typesHint = options.types
    ? `抽出するエンティティタイプ: ${options.types.join(", ")}`
    : "全てのタイプのエンティティを抽出";

  return `以下のテキストから重要なエンティティを抽出してください。

${typesHint}

エンティティタイプの定義:
- person: 人物名
- organization: 組織・会社・団体
- location: 場所・地名
- concept: 概念・理論・手法
- technology: 技術・ツール・フレームワーク
- event: イベント・出来事
- document: 文書・規格・仕様
- product: 製品・サービス
- date: 日付・時間
- その他多数（52種類）

テキスト:
"""
${content}
"""

JSON形式で出力してください:
{
  "entities": [
    {
      "name": "エンティティ名（表記通り）",
      "normalizedName": "正規化された名前",
      "type": "エンティティタイプ",
      "description": "${options.generateDescriptions ? "簡潔な説明（20-50文字）" : "null"}",
      "aliases": ["別名1", "別名2"],
      "confidence": 0.0-1.0の信頼度
    }
  ]
}

注意:
- 最大${options.maxEntitiesPerChunk ?? 20}個のエンティティを抽出
- 一般的すぎる単語（"システム", "データ"等）は除外
- 固有名詞や専門用語を優先
- 信頼度は文脈からの明確さに基づいて設定`;
};
```
