# 詳細設計書 - エンティティ抽出サービス (NER)

## メタ情報

| 項目     | 内容                  |
| -------- | --------------------- |
| タスクID | CONV-06-04            |
| Phase    | 2                     |
| 作成日   | 2026-01-18            |
| 機能名   | entity-extraction-ner |

---

## 1. IEntityExtractor メソッド詳細仕様

### 1.1 extract() メソッド

#### シグネチャ

```typescript
extract(
  chunk: ChunkInput,
  options?: ExtractionOptions,
): Promise<Result<ExtractionResult, EntityExtractionError>>
```

#### 入力仕様

| パラメータ | 型                | 必須 | 説明             |
| ---------- | ----------------- | ---- | ---------------- |
| chunk      | ChunkInput        | Yes  | 抽出対象チャンク |
| options    | ExtractionOptions | No   | 抽出オプション   |

#### 出力仕様

```typescript
interface ExtractionResult {
  /** 抽出元チャンクID */
  chunkId: ChunkId;

  /** 抽出されたエンティティ配列 */
  entities: ExtractedEntity[];

  /** 抽出メトリクス */
  metrics: ExtractionMetrics;
}
```

#### 処理フロー

1. 入力バリデーション
2. オプションのデフォルト値適用
3. エンティティ抽出（LLM or ルールベース）
4. 結果のフィルタリング（minConfidence, maxEntitiesPerChunk）
5. メトリクス計算
6. Result型でラップして返却

#### エラーケース

| エラーコード       | 条件                          | 対処                     |
| ------------------ | ----------------------------- | ------------------------ |
| INVALID_CHUNK      | chunk.contentが空または長すぎ | エラー返却               |
| LLM_TIMEOUT        | LLM呼び出しがタイムアウト     | リトライ後フォールバック |
| LLM_RATE_LIMIT     | レート制限超過                | 待機後リトライ           |
| LLM_RESPONSE_PARSE | JSONパース失敗                | 空結果返却               |

---

### 1.2 extractBatch() メソッド

#### シグネチャ

```typescript
extractBatch(
  chunks: ChunkInput[],
  options?: ExtractionOptions,
): Promise<Result<BatchExtractionResult, EntityExtractionError>>
```

#### 入力仕様

| パラメータ | 型                | 必須 | 説明                        |
| ---------- | ----------------- | ---- | --------------------------- |
| chunks     | ChunkInput[]      | Yes  | 抽出対象チャンク配列(1-100) |
| options    | ExtractionOptions | No   | 抽出オプション              |

#### 出力仕様

```typescript
interface BatchExtractionResult {
  /** 各チャンクの抽出結果 */
  results: ExtractionResult[];

  /** バッチ処理サマリー */
  summary: BatchSummary;
}

interface BatchSummary {
  /** 処理したチャンク数 */
  totalChunks: number;

  /** 成功したチャンク数 */
  successCount: number;

  /** 失敗したチャンク数 */
  failureCount: number;

  /** 抽出されたユニークエンティティ数 */
  uniqueEntityCount: number;

  /** 合計処理時間（ミリ秒） */
  totalProcessingTimeMs: number;

  /** 失敗したチャンクID（あれば） */
  failedChunkIds?: ChunkId[];
}
```

#### 処理フロー

1. バッチサイズ検証（1-100）
2. Promise.allSettledで並列実行
3. 成功/失敗の集計
4. BatchSummaryの構築
5. Result型でラップして返却

---

### 1.3 mergeEntities() メソッド

#### シグネチャ

```typescript
mergeEntities(results: ExtractionResult[]): ExtractedEntity[]
```

#### マージロジック

```typescript
// 正規化名でグループ化してマージ
function mergeEntities(results: ExtractionResult[]): ExtractedEntity[] {
  const entityMap = new Map<string, ExtractedEntity>();

  for (const result of results) {
    for (const entity of result.entities) {
      const existing = entityMap.get(entity.normalizedName);

      if (existing) {
        // マージ: confidence最大値、mentions結合、aliases結合
        entityMap.set(entity.normalizedName, {
          ...existing,
          confidence: Math.max(existing.confidence, entity.confidence),
          mentions: [...existing.mentions, ...entity.mentions],
          aliases: [...new Set([...existing.aliases, ...entity.aliases])],
        });
      } else {
        entityMap.set(entity.normalizedName, entity);
      }
    }
  }

  return Array.from(entityMap.values());
}
```

---

## 2. ExtractionOptions 型詳細設計

### 2.1 完全な型定義

```typescript
/**
 * エンティティ抽出オプション
 */
export interface ExtractionOptions {
  /**
   * 抽出対象のエンティティタイプ
   * @default 全52タイプ
   */
  types?: EntityType[];

  /**
   * 最小信頼度閾値
   * @default 0.5
   * @range 0.0 - 1.0
   */
  minConfidence?: number;

  /**
   * チャンクあたり最大抽出数
   * @default 20
   * @range 1 - 100
   */
  maxEntitiesPerChunk?: number;

  /**
   * 最小エンティティ名長
   * @default 2
   * @range 1 - 50
   */
  minNameLength?: number;

  /**
   * 説明生成フラグ（LLMのみ有効）
   * @default true
   */
  generateDescriptions?: boolean;

  /**
   * LLM使用フラグ
   * @default true
   */
  useLLM?: boolean;

  /**
   * LLM温度パラメータ
   * @default 0.1
   * @range 0.0 - 2.0
   */
  temperature?: number;

  /**
   * LLM最大トークン数
   * @default 2000
   * @range 100 - 4000
   */
  maxTokens?: number;

  /**
   * コンテキスト情報を使用するか
   * @default true
   */
  useContext?: boolean;

  /**
   * エイリアス抽出を有効化
   * @default true
   */
  extractAliases?: boolean;
}
```

### 2.2 デフォルト値定数

```typescript
export const DEFAULT_EXTRACTION_OPTIONS: Required<ExtractionOptions> = {
  types: Object.values(EntityTypes) as EntityType[],
  minConfidence: 0.5,
  maxEntitiesPerChunk: 20,
  minNameLength: 2,
  generateDescriptions: true,
  useLLM: true,
  temperature: 0.1,
  maxTokens: 2000,
  useContext: true,
  extractAliases: true,
};
```

### 2.3 Zodスキーマ

```typescript
import { z } from "zod";

export const extractionOptionsSchema = z.object({
  types: z
    .array(
      z.enum([
        /* 52 EntityTypes */
      ]),
    )
    .optional(),
  minConfidence: z.number().min(0).max(1).optional(),
  maxEntitiesPerChunk: z.number().int().min(1).max(100).optional(),
  minNameLength: z.number().int().min(1).max(50).optional(),
  generateDescriptions: z.boolean().optional(),
  useLLM: z.boolean().optional(),
  temperature: z.number().min(0).max(2).optional(),
  maxTokens: z.number().int().min(100).max(4000).optional(),
  useContext: z.boolean().optional(),
  extractAliases: z.boolean().optional(),
});
```

---

## 3. ExtractedEntity 型詳細設計

### 3.1 完全な型定義

```typescript
/**
 * 抽出されたエンティティ
 */
export interface ExtractedEntity {
  /**
   * エンティティ名（原形）
   * @length 1 - 255
   */
  name: string;

  /**
   * 正規化名（小文字・空白正規化）
   * 重複検出・マージのキーとして使用
   */
  normalizedName: string;

  /**
   * エンティティタイプ
   */
  type: EntityType;

  /**
   * 信頼度スコア
   * @range 0.0 - 1.0
   */
  confidence: number;

  /**
   * エンティティの説明（LLM生成時のみ）
   * @maxLength 1000
   */
  description?: string;

  /**
   * 別名・エイリアス
   */
  aliases: string[];

  /**
   * テキスト内出現情報
   */
  mentions: Mention[];

  /**
   * 抽出元情報
   */
  source: ExtractionSource;
}

/**
 * 出現情報
 */
export interface Mention {
  /**
   * 出現チャンクID
   */
  chunkId: ChunkId;

  /**
   * 開始位置（文字オフセット）
   * @min 0
   */
  startPosition: number;

  /**
   * 終了位置（文字オフセット）
   * @min startPosition + 1
   */
  endPosition: number;

  /**
   * 前後コンテキスト
   * @maxLength 200
   */
  context: string;
}

/**
 * 抽出元情報
 */
export interface ExtractionSource {
  /**
   * 抽出方式
   */
  extractorType: "llm" | "rule-based";

  /**
   * 使用したモデル（LLMの場合）
   */
  modelId?: string;

  /**
   * マッチしたパターン名（ルールベースの場合）
   */
  patternName?: string;
}
```

### 3.2 Zodスキーマ

```typescript
export const mentionSchema = z
  .object({
    chunkId: z.string().uuid(),
    startPosition: z.number().int().nonnegative(),
    endPosition: z.number().int().positive(),
    context: z.string().max(200),
  })
  .refine((data) => data.endPosition > data.startPosition, {
    message: "endPosition must be greater than startPosition",
  });

export const extractedEntitySchema = z.object({
  name: z.string().min(1).max(255),
  normalizedName: z.string().min(1).max(255),
  type: entityTypeSchema,
  confidence: z.number().min(0).max(1),
  description: z.string().max(1000).optional(),
  aliases: z.array(z.string().min(1).max(255)),
  mentions: z.array(mentionSchema).min(1),
  source: z.object({
    extractorType: z.enum(["llm", "rule-based"]),
    modelId: z.string().optional(),
    patternName: z.string().optional(),
  }),
});
```

---

## 4. EntityExtractionError 型設計

### 4.1 エラーコード定義

```typescript
export const EntityExtractionErrorCodes = {
  // LLMエラー
  LLM_TIMEOUT: "LLM_TIMEOUT",
  LLM_RATE_LIMIT: "LLM_RATE_LIMIT",
  LLM_AUTHENTICATION: "LLM_AUTHENTICATION",
  LLM_RESPONSE_PARSE: "LLM_RESPONSE_PARSE",
  LLM_UNKNOWN: "LLM_UNKNOWN",

  // バリデーションエラー
  INVALID_CHUNK: "INVALID_CHUNK",
  INVALID_OPTIONS: "INVALID_OPTIONS",
  BATCH_SIZE_EXCEEDED: "BATCH_SIZE_EXCEEDED",

  // パターンマッチエラー
  PATTERN_MATCH: "PATTERN_MATCH",

  // 永続化エラー
  PERSISTENCE: "PERSISTENCE",
} as const;

export type EntityExtractionErrorCode =
  (typeof EntityExtractionErrorCodes)[keyof typeof EntityExtractionErrorCodes];
```

### 4.2 エラークラス定義

```typescript
export class EntityExtractionError extends Error {
  constructor(
    message: string,
    public readonly code: EntityExtractionErrorCode,
    public readonly cause?: Error,
    public readonly context?: Record<string, unknown>,
  ) {
    super(message);
    this.name = "EntityExtractionError";

    // Error.captureStackTrace対応
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, EntityExtractionError);
    }
  }

  /**
   * リトライ可能かどうか
   */
  get isRetryable(): boolean {
    return [
      EntityExtractionErrorCodes.LLM_TIMEOUT,
      EntityExtractionErrorCodes.LLM_RATE_LIMIT,
      EntityExtractionErrorCodes.LLM_UNKNOWN,
    ].includes(this.code);
  }

  /**
   * フォールバック可能かどうか
   */
  get isFallbackable(): boolean {
    return this.code.startsWith("LLM_");
  }

  /**
   * JSON形式に変換
   */
  toJSON(): Record<string, unknown> {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      context: this.context,
      cause: this.cause?.message,
    };
  }
}
```

### 4.3 エラーファクトリ関数

```typescript
export function createLLMTimeoutError(
  timeoutMs: number,
  cause?: Error,
): EntityExtractionError {
  return new EntityExtractionError(
    `LLM request timed out after ${timeoutMs}ms`,
    EntityExtractionErrorCodes.LLM_TIMEOUT,
    cause,
    { timeoutMs },
  );
}

export function createInvalidChunkError(
  reason: string,
  chunkId?: ChunkId,
): EntityExtractionError {
  return new EntityExtractionError(
    `Invalid chunk: ${reason}`,
    EntityExtractionErrorCodes.INVALID_CHUNK,
    undefined,
    { chunkId, reason },
  );
}
```

---

## 5. LLMプロンプト設計

### 5.1 システムプロンプト

```typescript
export const ENTITY_EXTRACTION_SYSTEM_PROMPT = `You are an expert Named Entity Recognition (NER) system.
Your task is to extract entities from the given text and classify them into predefined categories.

## Entity Types (52 categories in 10 groups):

### 1. People & Organizations
- person: People's names (e.g., John Doe, 山田太郎)
- organization: Organizations, institutions (e.g., United Nations)
- role: Job titles, roles (e.g., CEO, Engineer)
- team: Teams, groups (e.g., Engineering Team)

### 2. Location & Time
- location: Places, addresses (e.g., Tokyo, Silicon Valley)
- date: Dates, time periods (e.g., 2024-01-15, Q1 2024)
- event: Events, conferences (e.g., Google I/O, AWS re:Invent)

### 3. Business & Management
- company: Companies, corporations (e.g., Google, Microsoft)
- product: Products (e.g., iPhone, Windows)
- service: Services (e.g., AWS, Google Cloud)
- brand: Brands (e.g., Nike, Apple)
- strategy: Business strategies (e.g., digital transformation)
- metric: Business metrics (e.g., ROI, KPI)
- business_process: Business processes (e.g., supply chain)
- market: Markets (e.g., semiconductor market)
- customer: Customer segments (e.g., enterprise customers)

### 4. Technology General
- technology: Technologies (e.g., machine learning, blockchain)
- tool: Tools (e.g., Docker, Git)
- method: Methods, techniques (e.g., Agile, Scrum)
- standard: Standards (e.g., ISO 27001, GDPR)
- protocol: Protocols (e.g., HTTP, TCP/IP)

### 5. Code & Software
- programming_language: Languages (e.g., TypeScript, Python)
- framework: Frameworks (e.g., React, Django)
- library: Libraries (e.g., lodash, numpy)
- api: APIs (e.g., REST API, GraphQL)
- function: Functions (e.g., map(), reduce())
- class: Classes (e.g., UserService, Repository)
- module: Modules (e.g., @react/core)

### 6. Abstract Concepts
- concept: Concepts (e.g., dependency injection)
- theory: Theories (e.g., information theory)
- principle: Principles (e.g., SOLID, DRY)
- pattern: Design patterns (e.g., Singleton, Observer)
- model: Models (e.g., MVC, MVVM)

### 7. Document Structure
- document, chapter, section, paragraph, heading

### 8. Document Elements
- keyword, summary, figure, table, list, quote, code_snippet, formula, example

### 9. Media
- image, video, audio, diagram

### 10. Other
- other: Entities that don't fit other categories

## Output Format:
Return a JSON array of entities. Each entity must have:
- name: Original entity name as it appears in text
- type: One of the 52 entity types above
- confidence: Confidence score (0.0-1.0)
- description: Brief description (if generateDescriptions is true)
- aliases: Alternative names or abbreviations
- startPosition: Character offset where entity starts
- endPosition: Character offset where entity ends

## Rules:
1. Extract only named entities, not generic nouns
2. Be conservative with confidence scores
3. Prefer specific types over "other"
4. Include aliases when apparent (e.g., "TypeScript" -> ["TS"])
5. Return empty array if no entities found
`;
```

### 5.2 ユーザープロンプトテンプレート

```typescript
export function buildUserPrompt(
  chunk: ChunkInput,
  options: Required<ExtractionOptions>,
): string {
  const contextSection =
    options.useContext && chunk.context
      ? `\n\n## Context:
File: ${chunk.context.fileName ?? "unknown"}
Parent Header: ${chunk.context.parentHeader ?? "none"}
Surrounding: ${chunk.context.surroundingContext ?? "none"}`
      : "";

  const typeFilter =
    options.types.length < 52
      ? `\n\n## Allowed Types:
Only extract entities of these types: ${options.types.join(", ")}`
      : "";

  return `## Text to analyze:
${chunk.content}
${contextSection}
${typeFilter}

## Options:
- Generate descriptions: ${options.generateDescriptions}
- Extract aliases: ${options.extractAliases}
- Minimum confidence: ${options.minConfidence}
- Maximum entities: ${options.maxEntitiesPerChunk}

Return the entities as a JSON array:`;
}
```

### 5.3 レスポンスパーサー

````typescript
export function parseLLMResponse(
  response: string,
  chunkId: ChunkId,
): Result<ExtractedEntity[], EntityExtractionError> {
  try {
    // JSONブロックを抽出（```json ... ``` または直接JSON）
    const jsonMatch =
      response.match(/```json\s*([\s\S]*?)\s*```/) ??
      response.match(/\[[\s\S]*\]/);

    if (!jsonMatch) {
      return err(
        new EntityExtractionError(
          "No JSON array found in LLM response",
          EntityExtractionErrorCodes.LLM_RESPONSE_PARSE,
          undefined,
          { response: response.slice(0, 500) },
        ),
      );
    }

    const jsonStr = jsonMatch[1] ?? jsonMatch[0];
    const parsed = JSON.parse(jsonStr);

    // Zodでバリデーション
    const validated = z.array(extractedEntitySchema).safeParse(parsed);

    if (!validated.success) {
      return err(
        new EntityExtractionError(
          `Invalid entity format: ${validated.error.message}`,
          EntityExtractionErrorCodes.LLM_RESPONSE_PARSE,
          undefined,
          { zodError: validated.error.format() },
        ),
      );
    }

    // チャンクIDとソース情報を追加
    const entities = validated.data.map((e) => ({
      ...e,
      mentions: e.mentions.map((m) => ({ ...m, chunkId })),
      source: { extractorType: "llm" as const },
    }));

    return ok(entities);
  } catch (error) {
    return err(
      new EntityExtractionError(
        `Failed to parse LLM response: ${error instanceof Error ? error.message : "unknown"}`,
        EntityExtractionErrorCodes.LLM_RESPONSE_PARSE,
        error instanceof Error ? error : undefined,
        { response: response.slice(0, 500) },
      ),
    );
  }
}
````

---

## 6. ユーティリティ関数設計

### 6.1 名前正規化

```typescript
/**
 * エンティティ名を正規化
 *
 * @param name - 元のエンティティ名
 * @returns 正規化された名前
 */
export function normalizeEntityName(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/\s+/g, " ") // 連続空白を単一空白に
    .replace(/[^\w\s\-\.]/g, "") // 特殊文字を除去（ハイフン、ドットは保持）
    .replace(/\s/g, "_"); // 空白をアンダースコアに
}

// 例:
// "React.js" -> "react.js"
// "Type Script" -> "type_script"
// "GPT-4" -> "gpt-4"
```

### 6.2 メンション検出

```typescript
/**
 * テキスト内でエンティティの出現位置を検出
 *
 * @param text - 検索対象テキスト
 * @param entityName - 検索するエンティティ名
 * @param contextLength - 前後コンテキストの長さ
 * @returns 出現情報配列
 */
export function findMentionsInText(
  text: string,
  entityName: string,
  contextLength: number = 100,
): Omit<Mention, "chunkId">[] {
  const mentions: Omit<Mention, "chunkId">[] = [];
  const regex = new RegExp(escapeRegex(entityName), "gi");

  let match: RegExpExecArray | null;
  while ((match = regex.exec(text)) !== null) {
    const startPosition = match.index;
    const endPosition = startPosition + match[0].length;

    // 前後コンテキストを抽出
    const contextStart = Math.max(0, startPosition - contextLength / 2);
    const contextEnd = Math.min(text.length, endPosition + contextLength / 2);
    const context = text.slice(contextStart, contextEnd);

    mentions.push({
      startPosition,
      endPosition,
      context,
    });
  }

  return mentions;
}
```

### 6.3 正規表現エスケープ

```typescript
/**
 * 正規表現の特殊文字をエスケープ
 */
export function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
```

---

## 更新履歴

| 日付       | 更新内容 | 担当 |
| ---------- | -------- | ---- |
| 2026-01-18 | 初版作成 | AI   |
