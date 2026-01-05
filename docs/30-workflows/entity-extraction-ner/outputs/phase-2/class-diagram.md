# エンティティ抽出サービス - クラス図

## 1. クラス構造

```
┌─────────────────────────────────────────────────────────────┐
│                    <<interface>>                             │
│                   IEntityExtractor                           │
├─────────────────────────────────────────────────────────────┤
│ + extract(chunk, options): Promise<Result<...>>             │
│ + extractBatch(chunks, options): Promise<Result<...>>       │
│ + mergeEntities(results): ExtractedEntity[]                 │
└─────────────────────────────────────────────────────────────┘
                            △
                            │ implements
           ┌────────────────┴────────────────┐
           │                                 │
┌──────────┴──────────┐           ┌─────────┴─────────┐
│ LLMEntityExtractor  │           │RuleBasedExtractor │
├─────────────────────┤           ├───────────────────┤
│ - llmProvider       │           │ - patterns        │
│ - defaultOptions    │           │ - defaultOptions  │
├─────────────────────┤           ├───────────────────┤
│ + extract()         │           │ + extract()       │
│ + extractBatch()    │           │ + extractBatch()  │
│ + mergeEntities()   │           │ + mergeEntities() │
│ - buildPrompt()     │           │ - matchPatterns() │
│ - parseResponse()   │           └───────────────────┘
│ - filterEntities()  │
│ - findMentions()    │
└─────────────────────┘


┌─────────────────────────────────────────────────────────────┐
│                    <<interface>>                             │
│                    ILLMProvider                              │
├─────────────────────────────────────────────────────────────┤
│ + modelId: string                                           │
│ + generate(prompt, options): Promise<Result<...>>           │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. 詳細クラス定義

### 2.1 LLMEntityExtractor

```typescript
/**
 * LLMベースのエンティティ抽出器
 *
 * ILLMProviderを通じてLLMを呼び出し、テキストからエンティティを抽出。
 * JSONレスポンスをパースし、バリデーション・フィルタリングを行う。
 */
export class LLMEntityExtractor implements IEntityExtractor {
  /** デフォルトオプション */
  private readonly defaultOptions: Required<EntityExtractionOptions>;

  /**
   * コンストラクタ
   * @param llmProvider - LLMプロバイダー（依存注入）
   * @param options - 追加設定（リトライ回数等）
   */
  constructor(
    private readonly llmProvider: ILLMProvider,
    private readonly options?: { maxRetries?: number },
  ) {
    this.defaultOptions = {
      types: undefined as unknown as EntityType[],
      maxEntitiesPerChunk: 20,
      minConfidence: 0.5,
      minNameLength: 2,
      useLLM: true,
      generateDescriptions: true,
    };
  }

  // --- Public Methods ---

  async extract(
    chunk: Chunk,
    options?: EntityExtractionOptions,
  ): Promise<Result<EntityExtractionResult, EntityExtractionError>>;

  async extractBatch(
    chunks: Chunk[],
    options?: EntityExtractionOptions,
  ): Promise<Result<BatchEntityExtractionResult, EntityExtractionError>>;

  mergeEntities(results: EntityExtractionResult[]): ExtractedEntity[];

  // --- Private Methods ---

  private buildPrompt(
    chunk: Chunk,
    options: Required<EntityExtractionOptions>,
  ): string;

  private parseResponse(
    responseText: string,
  ): Result<ExtractedEntity[], ParseError>;

  private filterAndNormalize(
    entities: ExtractedEntity[],
    chunk: Chunk,
    options: Required<EntityExtractionOptions>,
  ): ExtractedEntity[];

  private findMentions(entityName: string, chunk: Chunk): EntityMention[];

  private normalizeEntityName(name: string): string;

  private escapeRegex(str: string): string;
}
```

### 2.2 RuleBasedEntityExtractor

```typescript
/**
 * ルールベースのエンティティ抽出器
 *
 * 正規表現パターンマッチングでエンティティを抽出。
 * LLM不可時のフォールバックとして機能。
 */
export class RuleBasedEntityExtractor implements IEntityExtractor {
  /** パターン定義（EntityType -> RegExp[]） */
  private readonly patterns: Map<EntityType, RegExp[]>;

  /** デフォルトオプション */
  private readonly defaultOptions: Required<EntityExtractionOptions>;

  constructor() {
    this.patterns = new Map([
      [
        "technology",
        [
          /\b(React|Vue|Angular|Next\.js|TypeScript|JavaScript|Python|Node\.js|Docker|Kubernetes)\b/gi,
        ],
      ],
      [
        "organization",
        [/\b(Google|Microsoft|Apple|Amazon|Meta|OpenAI|Anthropic)\b/gi],
      ],
      [
        "date",
        [/\b\d{4}[-/]\d{1,2}[-/]\d{1,2}\b/g, /\b\d{4}年\d{1,2}月\d{1,2}日\b/g],
      ],
    ]);
  }

  // --- Public Methods ---

  async extract(
    chunk: Chunk,
    options?: EntityExtractionOptions,
  ): Promise<Result<EntityExtractionResult, EntityExtractionError>>;

  async extractBatch(
    chunks: Chunk[],
    options?: EntityExtractionOptions,
  ): Promise<Result<BatchEntityExtractionResult, EntityExtractionError>>;

  mergeEntities(results: EntityExtractionResult[]): ExtractedEntity[];

  // --- Private Methods ---

  private matchPatterns(
    content: string,
    type: EntityType,
    patterns: RegExp[],
  ): ExtractedEntity[];

  private normalizeEntityName(name: string): string;
}
```

---

## 3. ユーティリティ関数 (utils.ts)

```typescript
/**
 * エンティティ名を正規化
 * - 小文字化
 * - 複数空白を単一空白に
 * - 前後の空白を除去
 */
export const normalizeEntityName = (name: string): string => {
  return name.toLowerCase().trim().replace(/\s+/g, " ");
};

/**
 * 正規表現用にエスケープ
 */
export const escapeRegex = (str: string): string => {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};

/**
 * デフォルトオプションとマージ
 */
export const mergeOptions = (
  options?: EntityExtractionOptions,
): Required<EntityExtractionOptions> => {
  return {
    types: options?.types ?? [],
    maxEntitiesPerChunk: options?.maxEntitiesPerChunk ?? 20,
    minConfidence: options?.minConfidence ?? 0.5,
    minNameLength: options?.minNameLength ?? 2,
    useLLM: options?.useLLM ?? true,
    generateDescriptions: options?.generateDescriptions ?? true,
  };
};
```

---

## 4. 型関係図

```
┌─────────────────────────────────────────────────────────────┐
│                    EntityExtractionOptions                   │
├─────────────────────────────────────────────────────────────┤
│ types?: EntityType[]                                        │
│ maxEntitiesPerChunk?: number                                │
│ minConfidence?: number                                      │
│ minNameLength?: number                                      │
│ useLLM?: boolean                                            │
│ generateDescriptions?: boolean                              │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼ uses
┌─────────────────────────────────────────────────────────────┐
│                      ExtractedEntity                         │
├─────────────────────────────────────────────────────────────┤
│ name: string                                                │
│ normalizedName: string                                      │
│ type: EntityType (from rag/graph/types)                     │
│ description?: string                                        │
│ aliases: string[]                                           │
│ mentions: EntityMention[]  ──────────────────┐              │
│ confidence: number                           │              │
│ attributes?: Record<string, unknown>         │              │
└──────────────────────────────────────────────┼──────────────┘
                                               │
                                               ▼
                            ┌─────────────────────────────────┐
                            │         EntityMention           │
                            ├─────────────────────────────────┤
                            │ chunkId: string                 │
                            │ startPosition: number           │
                            │ endPosition: number             │
                            │ context: string                 │
                            └─────────────────────────────────┘
```
