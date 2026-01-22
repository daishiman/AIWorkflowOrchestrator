# アーキテクチャ設計書 - エンティティ抽出サービス (NER)

## メタ情報

| 項目     | 内容                  |
| -------- | --------------------- |
| タスクID | CONV-06-04            |
| Phase    | 2                     |
| 作成日   | 2026-01-18            |
| 機能名   | entity-extraction-ner |

---

## 1. コンポーネント図

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         RAG Pipeline                                     │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌─────────────┐                                                        │
│  │  ChunkEntity │                                                        │
│  │  (Input)     │                                                        │
│  └──────┬──────┘                                                        │
│         │                                                                │
│         ▼                                                                │
│  ┌─────────────────────────────────────────────────────────────┐       │
│  │              IEntityExtractor                                │       │
│  │  ┌───────────────────────────────────────────────────────┐  │       │
│  │  │  extract(chunk, options?): Result<ExtractionResult>   │  │       │
│  │  │  extractBatch(chunks, options?): Result<BatchResult>  │  │       │
│  │  │  mergeEntities(results): ExtractedEntity[]            │  │       │
│  │  └───────────────────────────────────────────────────────┘  │       │
│  └─────────────────────────────────────────────────────────────┘       │
│         │                                                                │
│         │ implements                                                     │
│         │                                                                │
│  ┌──────┴──────────────────────────────────────────┐                   │
│  │                                                   │                   │
│  ▼                                                   ▼                   │
│  ┌─────────────────────────┐    ┌─────────────────────────────┐        │
│  │   LLMEntityExtractor    │    │  RuleBasedEntityExtractor   │        │
│  │                         │    │                             │        │
│  │  - 高精度抽出           │    │  - 高速抽出                 │        │
│  │  - 52タイプ分類         │    │  - パターンマッチ           │        │
│  │  - 説明・エイリアス生成 │    │  - フォールバック用         │        │
│  │                         │    │  - 外部依存なし             │        │
│  └───────────┬─────────────┘    └─────────────────────────────┘        │
│              │                                                          │
│              │ depends on                                               │
│              ▼                                                          │
│  ┌─────────────────────────┐                                           │
│  │      ILLMProvider       │                                           │
│  │                         │                                           │
│  │  - generate(prompt)     │                                           │
│  │  - modelId              │                                           │
│  └─────────────────────────┘                                           │
│                                                                          │
│         │                                                                │
│         ▼                                                                │
│  ┌─────────────────────────┐                                           │
│  │   ExtractedEntity[]     │                                           │
│  │   (Output)              │                                           │
│  └──────────┬──────────────┘                                           │
│             │                                                           │
│             ▼                                                           │
│  ┌─────────────────────────────────────────────────────┐               │
│  │           Persistence Layer                          │               │
│  │  ┌─────────────────┐    ┌─────────────────────────┐ │               │
│  │  │    entities     │    │    chunk_entities       │ │               │
│  │  │    テーブル     │◄───│    テーブル             │ │               │
│  │  └─────────────────┘    └─────────────────────────┘ │               │
│  └─────────────────────────────────────────────────────┘               │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 2. IEntityExtractor インターフェース設計

### 2.1 インターフェース定義

```typescript
import type { Result } from "neverthrow";
import type { ChunkId } from "../types/rag/branded";
import type { EntityType } from "../types/rag/graph/types";

/**
 * エンティティ抽出サービスの抽象インターフェース
 *
 * @description
 * チャンクからエンティティを抽出し、Knowledge Graphのノード候補を生成する。
 * LLMベース（高精度）とルールベース（高速）の2つの実装を想定。
 */
export interface IEntityExtractor {
  /**
   * 抽出器の識別名
   */
  readonly name: string;

  /**
   * 単一チャンクからエンティティを抽出
   *
   * @param chunk - 抽出対象のチャンク
   * @param options - 抽出オプション（省略可）
   * @returns 抽出結果またはエラー
   */
  extract(
    chunk: ChunkInput,
    options?: ExtractionOptions,
  ): Promise<Result<ExtractionResult, EntityExtractionError>>;

  /**
   * 複数チャンクからバッチ抽出
   *
   * @param chunks - 抽出対象のチャンク配列（最大100件）
   * @param options - 抽出オプション（省略可）
   * @returns バッチ抽出結果またはエラー
   */
  extractBatch(
    chunks: ChunkInput[],
    options?: ExtractionOptions,
  ): Promise<Result<BatchExtractionResult, EntityExtractionError>>;

  /**
   * 抽出結果のマージ・重複除去
   *
   * @param results - 抽出結果配列
   * @returns マージ後のエンティティ配列（正規化名でグループ化）
   */
  mergeEntities(results: ExtractionResult[]): ExtractedEntity[];
}
```

### 2.2 入力型

```typescript
/**
 * チャンク入力型
 */
export interface ChunkInput {
  /** チャンクID（UUID） */
  id: ChunkId;

  /** チャンク本文（1〜100,000文字） */
  content: string;

  /** コンテキスト情報（省略可） */
  context?: ChunkContext;
}

/**
 * チャンクコンテキスト
 */
export interface ChunkContext {
  /** ファイル名 */
  fileName?: string;

  /** 親見出し */
  parentHeader?: string;

  /** 前後チャンクの要約 */
  surroundingContext?: string;
}
```

---

## 3. LLMEntityExtractor クラス設計

### 3.1 クラス図

```
┌───────────────────────────────────────────────────────────────┐
│                    LLMEntityExtractor                          │
├───────────────────────────────────────────────────────────────┤
│ - llmProvider: ILLMProvider                                    │
│ - promptBuilder: EntityExtractionPromptBuilder                 │
│ - responseParser: LLMResponseParser                            │
│ - options: LLMExtractorConfig                                  │
├───────────────────────────────────────────────────────────────┤
│ + constructor(config: LLMExtractorConfig)                      │
│ + extract(chunk, options?): Promise<Result<ExtractionResult>>  │
│ + extractBatch(chunks, options?): Promise<Result<BatchResult>> │
│ + mergeEntities(results): ExtractedEntity[]                    │
│ - callLLM(prompt): Promise<Result<string, LLMError>>           │
│ - parseResponse(response): Result<ExtractedEntity[], Error>    │
│ - validateEntities(entities): ExtractedEntity[]                │
└───────────────────────────────────────────────────────────────┘
```

### 3.2 コンストラクタ設計

```typescript
interface LLMExtractorConfig {
  /** LLMプロバイダー（必須） */
  llmProvider: ILLMProvider;

  /** デフォルト抽出オプション */
  defaultOptions?: Partial<ExtractionOptions>;

  /** リトライ設定 */
  retryConfig?: RetryConfig;

  /** ログ設定 */
  logger?: ILogger;
}

interface RetryConfig {
  /** 最大リトライ回数（デフォルト: 3） */
  maxRetries: number;

  /** 初期待機時間（ミリ秒、デフォルト: 1000） */
  initialDelayMs: number;

  /** バックオフ係数（デフォルト: 2.0） */
  backoffFactor: number;

  /** 最大待機時間（ミリ秒、デフォルト: 30000） */
  maxDelayMs: number;
}
```

### 3.3 内部メソッド

| メソッド             | 責務                                             |
| -------------------- | ------------------------------------------------ |
| `callLLM()`          | LLMプロバイダーへの呼び出し（リトライ付き）      |
| `parseResponse()`    | JSON形式のLLMレスポンスをパース                  |
| `validateEntities()` | 抽出されたエンティティのバリデーション・フィルタ |
| `buildPrompt()`      | プロンプト構築（PromptBuilder委譲）              |

---

## 4. RuleBasedEntityExtractor クラス設計

### 4.1 クラス図

```
┌───────────────────────────────────────────────────────────────┐
│                  RuleBasedEntityExtractor                      │
├───────────────────────────────────────────────────────────────┤
│ - patterns: Map<EntityType, RegExp[]>                          │
│ - entityDictionary: Map<string, EntityType>                    │
│ - options: RuleBasedExtractorConfig                            │
├───────────────────────────────────────────────────────────────┤
│ + constructor(config?: RuleBasedExtractorConfig)               │
│ + extract(chunk, options?): Promise<Result<ExtractionResult>>  │
│ + extractBatch(chunks, options?): Promise<Result<BatchResult>> │
│ + mergeEntities(results): ExtractedEntity[]                    │
│ - matchPatterns(text): PatternMatch[]                          │
│ - lookupDictionary(text): DictionaryMatch[]                    │
│ - consolidateMatches(matches): ExtractedEntity[]               │
└───────────────────────────────────────────────────────────────┘
```

### 4.2 パターン定義

```typescript
interface RuleBasedExtractorConfig {
  /** カスタムパターン（追加） */
  customPatterns?: Map<EntityType, RegExp[]>;

  /** カスタム辞書（追加） */
  customDictionary?: Map<string, EntityType>;

  /** デフォルト信頼度 */
  defaultConfidence?: number;
}

// 組み込みパターン例
const BUILTIN_PATTERNS = {
  // 日付パターン
  date: [
    /\d{4}[-\/]\d{1,2}[-\/]\d{1,2}/g, // 2024-01-15, 2024/1/15
    /\d{4}年\d{1,2}月\d{1,2}日/g, // 2024年1月15日
  ],

  // プログラミング言語
  programming_language: [
    /\b(TypeScript|JavaScript|Python|Go|Rust|Java|C\+\+|C#|Ruby|PHP|Swift|Kotlin)\b/gi,
  ],

  // フレームワーク
  framework: [
    /\b(React|Vue|Angular|Next\.js|Nuxt|Express|Django|Rails|Spring|Laravel)\b/gi,
  ],

  // 組織名
  organization: [
    /\b(Google|Microsoft|Apple|Amazon|Meta|OpenAI|Anthropic|IBM|Oracle|SAP)\b/gi,
  ],
};
```

### 4.3 特性

| 特性           | 説明                                   |
| -------------- | -------------------------------------- |
| 外部依存なし   | LLM API不要、オフライン動作可能        |
| 高速           | ミリ秒単位で処理完了                   |
| 決定論的       | 同一入力に対して同一出力（テスト容易） |
| 拡張可能       | カスタムパターン・辞書の追加可能       |
| フォールバック | LLM障害時の代替として機能              |

---

## 5. 依存関係設計

### 5.1 ILLMProvider インターフェース

```typescript
/**
 * LLMプロバイダーの抽象インターフェース
 */
export interface ILLMProvider {
  /** プロバイダー名（"claude", "openai", "gemini"等） */
  readonly providerName: string;

  /** モデルID */
  readonly modelId: string;

  /**
   * テキスト生成
   *
   * @param prompt - プロンプト
   * @param options - 生成オプション
   * @returns 生成テキストまたはエラー
   */
  generate(
    prompt: string,
    options?: GenerateOptions,
  ): Promise<Result<string, LLMError>>;
}

interface GenerateOptions {
  /** 温度（0.0〜2.0、デフォルト: 0.1） */
  temperature?: number;

  /** 最大トークン数（デフォルト: 2000） */
  maxTokens?: number;

  /** タイムアウト（ミリ秒、デフォルト: 30000） */
  timeoutMs?: number;
}
```

### 5.2 依存性注入パターン

```typescript
// ファクトリ関数による生成
export function createLLMEntityExtractor(
  llmProvider: ILLMProvider,
  options?: Partial<LLMExtractorConfig>,
): LLMEntityExtractor {
  return new LLMEntityExtractor({
    llmProvider,
    defaultOptions: options?.defaultOptions,
    retryConfig: options?.retryConfig ?? DEFAULT_RETRY_CONFIG,
    logger: options?.logger,
  });
}

// テスト用モック
export function createMockLLMProvider(
  responses: Map<string, string>,
): ILLMProvider {
  return {
    providerName: "mock",
    modelId: "mock-model",
    async generate(prompt) {
      const response = responses.get(prompt);
      if (response) {
        return ok(response);
      }
      return err(new LLMError("Mock response not found", "MOCK_ERROR"));
    },
  };
}
```

### 5.3 リポジトリ連携

```typescript
/**
 * エンティティ永続化インターフェース
 */
export interface IEntityPersistence {
  /**
   * 抽出結果を永続化
   *
   * @param entities - 抽出されたエンティティ配列
   * @param chunkId - 抽出元チャンクID
   * @returns 永続化されたエンティティまたはエラー
   */
  persist(
    entities: ExtractedEntity[],
    chunkId: ChunkId,
  ): Promise<Result<EntityEntity[], PersistenceError>>;

  /**
   * 既存エンティティの検索（重複チェック用）
   *
   * @param normalizedName - 正規化名
   * @returns 既存エンティティまたはnull
   */
  findByNormalizedName(
    normalizedName: string,
  ): Promise<Result<EntityEntity | null, PersistenceError>>;
}
```

---

## 6. エラー処理設計

### 6.1 エラー型階層

```
EntityExtractionError (base)
├── LLMError
│   ├── LLMTimeoutError
│   ├── LLMRateLimitError
│   ├── LLMAuthenticationError
│   └── LLMResponseParseError
├── ValidationError
│   ├── InvalidChunkError
│   └── InvalidOptionsError
├── PatternMatchError
└── PersistenceError
```

### 6.2 エラー型定義

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
  }
}

export type EntityExtractionErrorCode =
  | "LLM_TIMEOUT"
  | "LLM_RATE_LIMIT"
  | "LLM_AUTHENTICATION"
  | "LLM_RESPONSE_PARSE"
  | "INVALID_CHUNK"
  | "INVALID_OPTIONS"
  | "PATTERN_MATCH"
  | "PERSISTENCE";
```

---

## 7. 統合ポイント

### 7.1 RAGパイプラインとの統合

```
┌─────────────────────────────────────────────────────────────────┐
│                     RAG Pipeline Integration                     │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Phase 1: Document Ingestion                                    │
│  ┌──────────┐    ┌──────────┐    ┌──────────┐                  │
│  │ Document │ -> │ Chunking │ -> │  Chunks  │                  │
│  └──────────┘    └──────────┘    └────┬─────┘                  │
│                                       │                         │
│  Phase 2: Embedding                   │                         │
│  ┌──────────────────────────────┐    │                         │
│  │ Embedding Provider           │<───┘                         │
│  └──────────────────────────────┘    │                         │
│                                       │                         │
│  Phase 3: Entity Extraction [★]      │                         │
│  ┌──────────────────────────────┐    │                         │
│  │ IEntityExtractor             │<───┘                         │
│  │ - LLMEntityExtractor         │                              │
│  │ - RuleBasedEntityExtractor   │                              │
│  └──────────────┬───────────────┘                              │
│                 │                                               │
│                 ▼                                               │
│  Phase 4: Relation Extraction                                   │
│  ┌──────────────────────────────┐                              │
│  │ IRelationExtractor           │                              │
│  └──────────────────────────────┘                              │
│                                                                  │
│  Phase 5: Community Detection                                   │
│  ┌──────────────────────────────┐                              │
│  │ ICommunityDetector           │                              │
│  └──────────────────────────────┘                              │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 7.2 Knowledge Graphストアとの統合

| 操作                 | 対応テーブル     | 処理内容                         |
| -------------------- | ---------------- | -------------------------------- |
| エンティティ保存     | `entities`       | UPSERT（正規化名で重複チェック） |
| チャンク関連付け保存 | `chunk_entities` | INSERT（複合主キー）             |

---

## 更新履歴

| 日付       | 更新内容 | 担当 |
| ---------- | -------- | ---- |
| 2026-01-18 | 初版作成 | AI   |
