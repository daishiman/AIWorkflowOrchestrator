# ディレクトリ構成設計書 - エンティティ抽出サービス (NER)

## メタ情報

| 項目     | 内容                  |
| -------- | --------------------- |
| タスクID | CONV-06-04            |
| Phase    | 2                     |
| 作成日   | 2026-01-18            |
| 機能名   | entity-extraction-ner |

---

## 1. 全体ディレクトリ構成

```
packages/shared/src/services/extraction/
├── index.ts                           # 公開エクスポート
├── types.ts                           # 型定義
├── errors.ts                          # エラー型定義
├── constants.ts                       # 定数定義
│
├── interfaces/
│   ├── index.ts                       # インターフェースエクスポート
│   ├── entity-extractor.interface.ts  # IEntityExtractor
│   └── llm-provider.interface.ts      # ILLMProvider
│
├── extractors/
│   ├── index.ts                       # 抽出器エクスポート
│   ├── llm-entity-extractor.ts        # LLMEntityExtractor
│   └── rule-based-entity-extractor.ts # RuleBasedEntityExtractor
│
├── prompts/
│   ├── index.ts                       # プロンプトエクスポート
│   ├── entity-extraction.prompt.ts    # システム/ユーザープロンプト
│   └── prompt-builder.ts              # プロンプトビルダー
│
├── parsers/
│   ├── index.ts                       # パーサーエクスポート
│   └── llm-response-parser.ts         # LLMレスポンスパーサー
│
├── utils/
│   ├── index.ts                       # ユーティリティエクスポート
│   ├── normalize.ts                   # 名前正規化
│   ├── mention-finder.ts              # メンション検出
│   ├── merge.ts                       # エンティティマージ
│   └── validation.ts                  # バリデーション
│
├── patterns/
│   ├── index.ts                       # パターンエクスポート
│   ├── builtin-patterns.ts            # 組み込みパターン定義
│   └── pattern-registry.ts            # パターンレジストリ
│
└── __tests__/
    ├── llm-entity-extractor.test.ts
    ├── rule-based-entity-extractor.test.ts
    ├── llm-response-parser.test.ts
    ├── normalize.test.ts
    ├── mention-finder.test.ts
    ├── merge.test.ts
    ├── validation.test.ts
    ├── builtin-patterns.test.ts
    ├── integration/
    │   ├── extraction-flow.test.ts    # 抽出フロー統合テスト
    │   └── persistence.test.ts        # 永続化統合テスト
    └── fixtures/
        ├── chunks.ts                  # テスト用チャンクデータ
        ├── entities.ts                # テスト用エンティティデータ
        └── llm-responses.ts           # テスト用LLMレスポンス
```

---

## 2. 各ファイルの詳細

### 2.1 ルートファイル

#### index.ts（公開エクスポート）

```typescript
// 型エクスポート
export type {
  IEntityExtractor,
  ILLMProvider,
  ChunkInput,
  ChunkContext,
  ExtractionOptions,
  ExtractionResult,
  BatchExtractionResult,
  ExtractedEntity,
  Mention,
  ExtractionMetrics,
  BatchSummary,
} from "./types";

// エラーエクスポート
export {
  EntityExtractionError,
  EntityExtractionErrorCodes,
  createLLMTimeoutError,
  createInvalidChunkError,
} from "./errors";

// 抽出器エクスポート
export { LLMEntityExtractor } from "./extractors/llm-entity-extractor";
export { RuleBasedEntityExtractor } from "./extractors/rule-based-entity-extractor";

// ファクトリ関数
export {
  createLLMEntityExtractor,
  createRuleBasedEntityExtractor,
} from "./extractors";

// ユーティリティ
export {
  normalizeEntityName,
  findMentionsInText,
  mergeExtractedEntities,
} from "./utils";
```

#### types.ts（型定義）

```typescript
/**
 * @file エンティティ抽出サービス型定義
 * @module @repo/shared/services/extraction/types
 */

import type { ChunkId } from "../../types/rag/branded";
import type { EntityType } from "../../types/rag/graph/types";

// ========================================
// Input Types
// ========================================

export interface ChunkInput {
  id: ChunkId;
  content: string;
  context?: ChunkContext;
}

export interface ChunkContext {
  fileName?: string;
  parentHeader?: string;
  surroundingContext?: string;
}

export interface ExtractionOptions {
  types?: EntityType[];
  minConfidence?: number;
  maxEntitiesPerChunk?: number;
  minNameLength?: number;
  generateDescriptions?: boolean;
  useLLM?: boolean;
  temperature?: number;
  maxTokens?: number;
  useContext?: boolean;
  extractAliases?: boolean;
}

// ========================================
// Output Types
// ========================================

export interface ExtractedEntity {
  name: string;
  normalizedName: string;
  type: EntityType;
  confidence: number;
  description?: string;
  aliases: string[];
  mentions: Mention[];
  source: ExtractionSource;
}

export interface Mention {
  chunkId: ChunkId;
  startPosition: number;
  endPosition: number;
  context: string;
}

export interface ExtractionSource {
  extractorType: "llm" | "rule-based";
  modelId?: string;
  patternName?: string;
}

export interface ExtractionResult {
  chunkId: ChunkId;
  entities: ExtractedEntity[];
  metrics: ExtractionMetrics;
}

export interface ExtractionMetrics {
  processingTimeMs: number;
  entityCount: number;
  extractorType: "llm" | "rule-based";
}

export interface BatchExtractionResult {
  results: ExtractionResult[];
  summary: BatchSummary;
}

export interface BatchSummary {
  totalChunks: number;
  successCount: number;
  failureCount: number;
  uniqueEntityCount: number;
  totalProcessingTimeMs: number;
  failedChunkIds?: ChunkId[];
}
```

#### errors.ts（エラー型定義）

```typescript
/**
 * @file エンティティ抽出エラー定義
 */

export const EntityExtractionErrorCodes = {
  LLM_TIMEOUT: "LLM_TIMEOUT",
  LLM_RATE_LIMIT: "LLM_RATE_LIMIT",
  LLM_AUTHENTICATION: "LLM_AUTHENTICATION",
  LLM_RESPONSE_PARSE: "LLM_RESPONSE_PARSE",
  LLM_UNKNOWN: "LLM_UNKNOWN",
  INVALID_CHUNK: "INVALID_CHUNK",
  INVALID_OPTIONS: "INVALID_OPTIONS",
  BATCH_SIZE_EXCEEDED: "BATCH_SIZE_EXCEEDED",
  PATTERN_MATCH: "PATTERN_MATCH",
  PERSISTENCE: "PERSISTENCE",
} as const;

export type EntityExtractionErrorCode =
  (typeof EntityExtractionErrorCodes)[keyof typeof EntityExtractionErrorCodes];

export class EntityExtractionError extends Error {
  constructor(
    message: string,
    public readonly code: EntityExtractionErrorCode,
    public readonly cause?: Error,
    public readonly context?: Record<string, unknown>,
  ) {
    super(message);
    this.name = "EntityExtractionError";
  }

  get isRetryable(): boolean {
    /* ... */
  }
  get isFallbackable(): boolean {
    /* ... */
  }
  toJSON(): Record<string, unknown> {
    /* ... */
  }
}

// ファクトリ関数
export function createLLMTimeoutError(
  timeoutMs: number,
  cause?: Error,
): EntityExtractionError;
export function createInvalidChunkError(
  reason: string,
  chunkId?: string,
): EntityExtractionError;
// ...
```

#### constants.ts（定数定義）

```typescript
/**
 * @file エンティティ抽出定数定義
 */

import type { ExtractionOptions } from "./types";
import { EntityTypes } from "../../types/rag/graph/types";

// デフォルトオプション
export const DEFAULT_EXTRACTION_OPTIONS: Required<ExtractionOptions> = {
  types: Object.values(EntityTypes),
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

// バッチ処理制限
export const MAX_BATCH_SIZE = 100;
export const BATCH_TIMEOUT_MS = 5 * 60 * 1000; // 5分

// LLM設定
export const LLM_TIMEOUT_MS = 30_000;
export const LLM_MAX_RETRIES = 3;
export const LLM_INITIAL_DELAY_MS = 1_000;
export const LLM_BACKOFF_FACTOR = 2.0;
export const LLM_MAX_DELAY_MS = 30_000;

// バリデーション
export const MIN_CHUNK_LENGTH = 1;
export const MAX_CHUNK_LENGTH = 100_000;
export const MIN_NAME_LENGTH = 1;
export const MAX_NAME_LENGTH = 255;
export const MAX_DESCRIPTION_LENGTH = 1000;
export const MAX_CONTEXT_LENGTH = 200;
```

---

### 2.2 interfaces/

#### entity-extractor.interface.ts

```typescript
/**
 * @file IEntityExtractor インターフェース
 */

import type { Result } from "neverthrow";
import type {
  ChunkInput,
  ExtractionOptions,
  ExtractionResult,
  BatchExtractionResult,
  ExtractedEntity,
} from "../types";
import type { EntityExtractionError } from "../errors";

export interface IEntityExtractor {
  readonly name: string;

  extract(
    chunk: ChunkInput,
    options?: ExtractionOptions,
  ): Promise<Result<ExtractionResult, EntityExtractionError>>;

  extractBatch(
    chunks: ChunkInput[],
    options?: ExtractionOptions,
  ): Promise<Result<BatchExtractionResult, EntityExtractionError>>;

  mergeEntities(results: ExtractionResult[]): ExtractedEntity[];
}
```

#### llm-provider.interface.ts

```typescript
/**
 * @file ILLMProvider インターフェース
 */

import type { Result } from "neverthrow";

export interface ILLMProvider {
  readonly providerName: string;
  readonly modelId: string;

  generate(
    prompt: string,
    options?: GenerateOptions,
  ): Promise<Result<string, LLMError>>;
}

export interface GenerateOptions {
  temperature?: number;
  maxTokens?: number;
  timeoutMs?: number;
}

export interface LLMError {
  code: string;
  message: string;
  retryable: boolean;
}
```

---

### 2.3 extractors/

#### llm-entity-extractor.ts

```typescript
/**
 * @file LLMEntityExtractor 実装
 */

import { ok, err } from "neverthrow";
import type { IEntityExtractor } from "../interfaces/entity-extractor.interface";
import type { ILLMProvider } from "../interfaces/llm-provider.interface";
import type {} from /* ... */ "../types";
import { buildPrompt } from "../prompts/prompt-builder";
import { parseLLMResponse } from "../parsers/llm-response-parser";
import { mergeExtractedEntities } from "../utils/merge";

export interface LLMExtractorConfig {
  llmProvider: ILLMProvider;
  defaultOptions?: Partial<ExtractionOptions>;
  retryConfig?: RetryConfig;
  logger?: ILogger;
}

export class LLMEntityExtractor implements IEntityExtractor {
  readonly name = "llm-entity-extractor";

  private readonly llmProvider: ILLMProvider;
  private readonly defaultOptions: Required<ExtractionOptions>;
  private readonly retryConfig: RetryConfig;
  private readonly logger?: ILogger;

  constructor(config: LLMExtractorConfig) {
    this.llmProvider = config.llmProvider;
    this.defaultOptions = {
      ...DEFAULT_EXTRACTION_OPTIONS,
      ...config.defaultOptions,
    };
    this.retryConfig = config.retryConfig ?? DEFAULT_RETRY_CONFIG;
    this.logger = config.logger;
  }

  async extract(chunk: ChunkInput, options?: ExtractionOptions) {
    /* ... */
  }
  async extractBatch(chunks: ChunkInput[], options?: ExtractionOptions) {
    /* ... */
  }
  mergeEntities(results: ExtractionResult[]) {
    /* ... */
  }

  private async callLLMWithRetry(prompt: string) {
    /* ... */
  }
}
```

#### rule-based-entity-extractor.ts

```typescript
/**
 * @file RuleBasedEntityExtractor 実装
 */

import { ok, err } from "neverthrow";
import type { IEntityExtractor } from "../interfaces/entity-extractor.interface";
import type {} from /* ... */ "../types";
import { BUILTIN_PATTERNS } from "../patterns/builtin-patterns";

export interface RuleBasedExtractorConfig {
  customPatterns?: Map<EntityType, RegExp[]>;
  customDictionary?: Map<string, EntityType>;
  defaultConfidence?: number;
}

export class RuleBasedEntityExtractor implements IEntityExtractor {
  readonly name = "rule-based-entity-extractor";

  private readonly patterns: Map<EntityType, RegExp[]>;
  private readonly dictionary: Map<string, EntityType>;
  private readonly defaultConfidence: number;

  constructor(config?: RuleBasedExtractorConfig) {
    this.patterns = new Map([
      ...BUILTIN_PATTERNS,
      ...(config?.customPatterns ?? []),
    ]);
    this.dictionary = config?.customDictionary ?? new Map();
    this.defaultConfidence = config?.defaultConfidence ?? 0.85;
  }

  async extract(chunk: ChunkInput, options?: ExtractionOptions) {
    /* ... */
  }
  async extractBatch(chunks: ChunkInput[], options?: ExtractionOptions) {
    /* ... */
  }
  mergeEntities(results: ExtractionResult[]) {
    /* ... */
  }

  private matchPatterns(text: string): PatternMatch[] {
    /* ... */
  }
  private lookupDictionary(text: string): DictionaryMatch[] {
    /* ... */
  }
}
```

---

### 2.4 prompts/

#### entity-extraction.prompt.ts

```typescript
/**
 * @file エンティティ抽出プロンプト定義
 */

export const ENTITY_EXTRACTION_SYSTEM_PROMPT = `
You are an expert Named Entity Recognition (NER) system.
Your task is to extract entities from the given text and classify them into predefined categories.

## Entity Types (52 categories in 10 groups):
...

## Output Format:
Return a JSON array of entities with: name, type, confidence, description, aliases, startPosition, endPosition

## Rules:
1. Extract only named entities, not generic nouns
2. Be conservative with confidence scores
...
`;

export const ENTITY_TYPES_DESCRIPTION = {
  person: "People's names (e.g., John Doe, 山田太郎)",
  organization: "Organizations, institutions (e.g., United Nations)",
  // ... 52タイプの説明
};
```

#### prompt-builder.ts

```typescript
/**
 * @file プロンプトビルダー
 */

import type { ChunkInput, ExtractionOptions } from "../types";
import { ENTITY_EXTRACTION_SYSTEM_PROMPT } from "./entity-extraction.prompt";

export function buildPrompt(
  chunk: ChunkInput,
  options: Required<ExtractionOptions>,
): { systemPrompt: string; userPrompt: string } {
  const systemPrompt = ENTITY_EXTRACTION_SYSTEM_PROMPT;
  const userPrompt = buildUserPrompt(chunk, options);
  return { systemPrompt, userPrompt };
}

function buildUserPrompt(
  chunk: ChunkInput,
  options: Required<ExtractionOptions>,
): string {
  // ...
}
```

---

### 2.5 utils/

#### normalize.ts

```typescript
/**
 * @file 名前正規化ユーティリティ
 */

export function normalizeEntityName(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/\s+/g, " ")
    .replace(/[^\w\s\-\.]/g, "")
    .replace(/\s/g, "_");
}
```

#### mention-finder.ts

```typescript
/**
 * @file メンション検出ユーティリティ
 */

import type { Mention } from "../types";
import { escapeRegex } from "./escape-regex";

export function findMentionsInText(
  text: string,
  entityName: string,
  chunkId: string,
  contextLength: number = 100,
): Mention[] {
  // ...
}
```

#### merge.ts

```typescript
/**
 * @file エンティティマージユーティリティ
 */

import type { ExtractedEntity, ExtractionResult } from "../types";

export function mergeExtractedEntities(
  results: ExtractionResult[],
): ExtractedEntity[] {
  // normalizedNameでグループ化してマージ
  // ...
}
```

---

### 2.6 **tests**/

#### テストファイル構成

| ファイル                              | テスト対象               |
| ------------------------------------- | ------------------------ |
| `llm-entity-extractor.test.ts`        | LLMEntityExtractor       |
| `rule-based-entity-extractor.test.ts` | RuleBasedEntityExtractor |
| `llm-response-parser.test.ts`         | LLMレスポンスパーサー    |
| `normalize.test.ts`                   | 名前正規化               |
| `mention-finder.test.ts`              | メンション検出           |
| `merge.test.ts`                       | エンティティマージ       |
| `validation.test.ts`                  | バリデーション           |
| `builtin-patterns.test.ts`            | 組み込みパターン         |
| `integration/extraction-flow.test.ts` | 抽出フロー統合テスト     |
| `integration/persistence.test.ts`     | 永続化統合テスト         |

#### fixtures/

```typescript
// fixtures/chunks.ts
export const TEST_CHUNKS = {
  simple: {
    id: "550e8400-e29b-41d4-a716-446655440000",
    content: "TypeScriptはMicrosoftが開発したプログラミング言語です。",
  },
  complex: {
    id: "550e8400-e29b-41d4-a716-446655440001",
    content: "React.jsとVue.jsは人気のフレームワークです...",
    context: { fileName: "tech-overview.md" },
  },
  // ...
};

// fixtures/entities.ts
export const EXPECTED_ENTITIES = {
  typescript: {
    name: "TypeScript",
    normalizedName: "typescript",
    type: "programming_language",
    confidence: 0.9,
  },
  // ...
};

// fixtures/llm-responses.ts
export const MOCK_LLM_RESPONSES = {
  simple: JSON.stringify([
    { name: "TypeScript", type: "programming_language", confidence: 0.9 },
    { name: "Microsoft", type: "organization", confidence: 0.95 },
  ]),
  // ...
};
```

---

## 3. ファイル命名規則

| 種別             | 命名規則                                  | 例                              |
| ---------------- | ----------------------------------------- | ------------------------------- |
| 実装ファイル     | kebab-case                                | `llm-entity-extractor.ts`       |
| テストファイル   | `{対象}.test.ts`                          | `llm-entity-extractor.test.ts`  |
| インターフェース | `{名前}.interface.ts`                     | `entity-extractor.interface.ts` |
| 型定義           | `types.ts`（単一）または`{名前}.types.ts` | `types.ts`                      |
| 定数             | `constants.ts`                            | `constants.ts`                  |
| プロンプト       | `{名前}.prompt.ts`                        | `entity-extraction.prompt.ts`   |

---

## 更新履歴

| 日付       | 更新内容 | 担当 |
| ---------- | -------- | ---- |
| 2026-01-18 | 初版作成 | AI   |
