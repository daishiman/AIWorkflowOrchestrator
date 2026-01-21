# アーキテクチャ更新ドキュメント - エンティティ抽出サービス (NER)

## メタ情報

| 項目     | 内容                  |
| -------- | --------------------- |
| タスクID | CONV-06-04            |
| Phase    | 12                    |
| 作成日   | 2026-01-18            |
| 機能名   | entity-extraction-ner |

---

## 1. NERサービスのアーキテクチャ図

### 1.1 全体アーキテクチャ

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           RAG Pipeline                                       │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌─────────────┐                                                            │
│  │  Document   │                                                            │
│  │  Ingestion  │                                                            │
│  └──────┬──────┘                                                            │
│         │                                                                    │
│         ▼                                                                    │
│  ┌─────────────┐     ┌─────────────┐     ┌─────────────────────────────┐   │
│  │  Chunking   │────▶│  Embedding  │────▶│    Entity Extraction [★]   │   │
│  │  Service    │     │  Service    │     │         (NER)               │   │
│  └─────────────┘     └─────────────┘     └──────────────┬──────────────┘   │
│                                                          │                   │
│                                          ┌───────────────┼───────────────┐  │
│                                          │               │               │  │
│                                          ▼               ▼               │  │
│                               ┌─────────────────┐ ┌─────────────────┐   │  │
│                               │ LLMEntity       │ │ RuleBased       │   │  │
│                               │ Extractor       │ │ Extractor       │   │  │
│                               └────────┬────────┘ └────────┬────────┘   │  │
│                                        │                   │            │  │
│                                        └─────────┬─────────┘            │  │
│                                                  │                       │  │
│                                                  ▼                       │  │
│  ┌─────────────────────────────────────────────────────────────────────┐│  │
│  │                    ExtractedEntity[]                                 ││  │
│  └──────────────────────────────┬──────────────────────────────────────┘│  │
│                                 │                                        │  │
│         ┌───────────────────────┼───────────────────────┐               │  │
│         │                       │                       │               │  │
│         ▼                       ▼                       ▼               │  │
│  ┌─────────────────┐   ┌─────────────────┐   ┌─────────────────┐       │  │
│  │   Relation      │   │   Community     │   │   Knowledge     │       │  │
│  │   Extraction    │   │   Detection     │   │   Graph Store   │       │  │
│  └─────────────────┘   └─────────────────┘   └─────────────────┘       │  │
│                                                                          │  │
└──────────────────────────────────────────────────────────────────────────┘  │
```

### 1.2 NERサービス詳細

```
┌────────────────────────────────────────────────────────────────────────────┐
│                      Entity Extraction Service (NER)                        │
├────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌────────────────────────────────────────────────────────────────────┐   │
│  │                    IEntityExtractor (Interface)                     │   │
│  │  ┌────────────────────────────────────────────────────────────┐    │   │
│  │  │  extract(chunk, options?): Result<ExtractionResult, Error>  │    │   │
│  │  │  extractBatch(chunks, options?): Result<BatchResult, Error> │    │   │
│  │  │  mergeEntities(results): ExtractedEntity[]                  │    │   │
│  │  └────────────────────────────────────────────────────────────┘    │   │
│  └────────────────────────────────────────────────────────────────────┘   │
│                              │                                              │
│              ┌───────────────┴───────────────┐                             │
│              │ implements                    │ implements                   │
│              ▼                               ▼                              │
│  ┌──────────────────────────┐    ┌──────────────────────────┐             │
│  │   LLMEntityExtractor     │    │  RuleBasedExtractor      │             │
│  ├──────────────────────────┤    ├──────────────────────────┤             │
│  │ - llmProvider: ILLMProv  │    │ - patterns: Map<Type,Re> │             │
│  │ - promptBuilder          │    │ - dictionary: Map<s,Type>│             │
│  │ - responseParser         │    │ - normalizer             │             │
│  │ - fallbackExtractor?     │    │                          │             │
│  ├──────────────────────────┤    ├──────────────────────────┤             │
│  │ Capabilities:            │    │ Capabilities:            │             │
│  │ • 52 entity types        │    │ • Date patterns          │             │
│  │ • Context understanding  │    │ • Tech terms dictionary  │             │
│  │ • Description generation │    │ • Organization names     │             │
│  │ • Alias extraction       │    │ • Fast pattern matching  │             │
│  │ • Auto retry/fallback    │    │ • No external deps       │             │
│  └──────────────────────────┘    └──────────────────────────┘             │
│              │                                                              │
│              │ depends on                                                   │
│              ▼                                                              │
│  ┌──────────────────────────┐                                              │
│  │     ILLMProvider         │                                              │
│  │  (Dependency Injection)  │                                              │
│  └──────────────────────────┘                                              │
│                                                                             │
└────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. データフロー

### 2.1 単一チャンク抽出フロー

```
┌────────────┐
│   Chunk    │
│  (Input)   │
└─────┬──────┘
      │
      ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                         extract(chunk, options)                          │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  1. Validate Input                                                       │
│     ├── Check chunk.content (1-100,000 chars)                           │
│     └── Apply default options                                           │
│                                                                          │
│  2. Extract Entities                                                     │
│     ├── [LLM Path]                                                      │
│     │   ├── Build prompt (system + user)                                │
│     │   ├── Call LLM API                                                │
│     │   ├── Parse JSON response                                         │
│     │   └── Validate with Zod schema                                    │
│     │                                                                    │
│     └── [RuleBased Path]                                                │
│         ├── Match date patterns                                         │
│         ├── Match tech terms dictionary                                 │
│         └── Match organization patterns                                 │
│                                                                          │
│  3. Post-Process                                                         │
│     ├── Filter by minConfidence                                         │
│     ├── Limit by maxEntitiesPerChunk                                    │
│     ├── Calculate positions & mentions                                  │
│     └── Add extraction metadata                                         │
│                                                                          │
│  4. Return Result                                                        │
│     └── Result<ExtractionResult, Error>                                 │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
      │
      ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                          ExtractionResult                                │
├─────────────────────────────────────────────────────────────────────────┤
│  {                                                                       │
│    chunkId: "uuid",                                                      │
│    entities: [                                                           │
│      { name: "TypeScript", type: "programming_language", ... },         │
│      { name: "React", type: "framework", ... }                          │
│    ],                                                                    │
│    processingTimeMs: 1234,                                              │
│    modelUsed: "claude-3-sonnet" | "rule-based"                          │
│  }                                                                       │
└─────────────────────────────────────────────────────────────────────────┘
```

### 2.2 バッチ抽出フロー

```
┌────────────────────────────────────────┐
│           Chunk[] (1-100)              │
└─────────────────┬──────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                    extractBatch(chunks, options)                         │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  1. Validate Batch Size (1-100)                                         │
│                                                                          │
│  2. Parallel Execution (Promise.allSettled)                             │
│     ┌────────────────────────────────────────────────────┐              │
│     │  chunk[0] ──► extract() ──► Result<ExtractionResult>              │
│     │  chunk[1] ──► extract() ──► Result<ExtractionResult>              │
│     │  chunk[2] ──► extract() ──► Result<ExtractionResult>              │
│     │     ...                                                            │
│     │  chunk[n] ──► extract() ──► Result<ExtractionResult>              │
│     └────────────────────────────────────────────────────┘              │
│                                                                          │
│  3. Aggregate Results                                                    │
│     ├── Collect successful results                                      │
│     ├── Track failed chunk IDs                                          │
│     └── Calculate totals                                                │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                       BatchExtractionResult                              │
├─────────────────────────────────────────────────────────────────────────┤
│  {                                                                       │
│    results: ExtractionResult[],                                         │
│    totalEntities: 150,                                                  │
│    processingTimeMs: 5000                                               │
│  }                                                                       │
└─────────────────────────────────────────────────────────────────────────┘
```

### 2.3 マージフロー

```
┌────────────────────────────────────────┐
│       ExtractionResult[]               │
└─────────────────┬──────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                      mergeEntities(results)                              │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  Key: normalizedName (e.g., "typescript", "react")                      │
│                                                                          │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │  Input:                                                            │  │
│  │    Chunk 1: [TypeScript, React, Node.js]                          │  │
│  │    Chunk 2: [typescript, Vue, React]     ◄─ "typescript" duplicate │  │
│  │    Chunk 3: [TypeScript, Express, TS]    ◄─ "TS" as alias          │  │
│  │                                                                    │  │
│  │  Merge Logic:                                                      │  │
│  │    - Group by normalizedName                                      │  │
│  │    - Take max(confidence) for duplicates                          │  │
│  │    - Concatenate mentions array                                   │  │
│  │    - Union aliases set                                            │  │
│  │                                                                    │  │
│  │  Output:                                                           │  │
│  │    [TypeScript (aliases: [TS]), React, Node.js, Vue, Express]     │  │
│  └───────────────────────────────────────────────────────────────────┘  │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                      ExtractedEntity[] (deduplicated)                    │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 3. 他コンポーネントとの連携

### 3.1 上流コンポーネント（入力元）

| コンポーネント    | 連携内容                   | インターフェース   |
| ----------------- | -------------------------- | ------------------ |
| Chunking Service  | チャンク配列を提供         | `Chunk[]`          |
| Embedding Service | 埋め込み済みチャンクを提供 | `Chunk` (extended) |

### 3.2 下流コンポーネント（出力先）

| コンポーネント        | 連携内容                   | インターフェース      |
| --------------------- | -------------------------- | --------------------- |
| Relation Extraction   | エンティティ間関係を抽出   | `ExtractedEntity[]`   |
| Community Detection   | エンティティクラスタリング | `ExtractedEntity[]`   |
| Knowledge Graph Store | エンティティを永続化       | `EntityEntity` (DB型) |

### 3.3 外部依存

| 依存先             | 用途            | インジェクション方式 |
| ------------------ | --------------- | -------------------- |
| ILLMProvider       | LLM API呼び出し | コンストラクタDI     |
| ILogger (optional) | ログ出力        | コンストラクタDI     |

---

## 4. 拡張ポイント

### 4.1 新しいエンティティタイプの追加

```typescript
// 1. types.tsに新しいタイプを追加
export const EntityTypes = {
  // ... existing types
  NEW_TYPE: "new_type",
} as const;

// 2. RuleBasedExtractorにパターンを追加
const BUILTIN_PATTERNS = {
  // ... existing patterns
  new_type: [/\bpattern\b/gi],
};

// 3. LLMプロンプトのシステム指示を更新
// (新タイプの説明を追加)
```

### 4.2 新しい抽出器の実装

```typescript
// IEntityExtractorを実装
export class CustomEntityExtractor implements IEntityExtractor {
  async extract(
    chunk: Chunk,
    options?: EntityExtractionOptionsInput,
  ): Promise<Result<ExtractionResult, Error>> {
    // カスタム抽出ロジック
  }

  async extractBatch(
    chunks: Chunk[],
    options?: EntityExtractionOptionsInput,
  ): Promise<Result<BatchExtractionResult, Error>> {
    // バッチ処理ロジック
  }

  mergeEntities(results: ExtractionResult[]): ExtractedEntity[] {
    // マージロジック（デフォルト実装の再利用可）
  }
}
```

### 4.3 LLMプロバイダーの差し替え

```typescript
// 別のLLMプロバイダーを実装
export class OpenAIProvider implements ILLMProvider {
  readonly modelId = "gpt-4o";

  async generate(
    prompt: string,
    options?: LLMGenerateOptions,
  ): Promise<Result<LLMGenerateResult, Error>> {
    // OpenAI API呼び出し
  }
}

// 使用
const extractor = new LLMEntityExtractor(new OpenAIProvider());
```

---

## 5. ディレクトリ構成

```
packages/shared/src/services/extraction/
├── index.ts                      # Public exports
├── interfaces.ts                 # IEntityExtractor, ILLMProvider
├── types.ts                      # Zod schemas, types
├── llm-entity-extractor.ts       # LLM-based implementation
├── rule-based-entity-extractor.ts# Pattern-based implementation
├── utils/
│   ├── normalizer.ts             # Name normalization
│   ├── pattern-matcher.ts        # Regex utilities
│   └── prompt-builder.ts         # LLM prompt construction
└── __tests__/
    ├── fixtures/                 # Test data
    ├── llm-entity-extractor.test.ts
    ├── rule-based-extractor.test.ts
    ├── entity-extractor.integration.test.ts
    └── entity-extractor.performance.test.ts
```

---

## 更新履歴

| 日付       | 更新内容 | 担当 |
| ---------- | -------- | ---- |
| 2026-01-18 | 初版作成 | AI   |
