# CONV-03-03: チャンク・埋め込みスキーマ定義 - Zodスキーマ設計書

**タスクID**: CONV-03-03 / T-01-2
**作成日**: 2025-12-18
**担当エージェント**: .claude/agents/schema-def.md
**ステータス**: 設計中

---

## 1. 設計概要

### 1.1 目的

types.tsで定義した全型に対応するZodスキーマを設計し、ランタイムバリデーションを実現する。
型安全性とランタイムバリデーションの両方を保証する。

### 1.2 設計方針

| 方針項目                 | 内容                                             |
| ------------------------ | ------------------------------------------------ |
| **厳密なバリデーション** | 数値範囲、文字列長、配列要素数等を厳格にチェック |
| **ユーザーフレンドリー** | エラーメッセージは日本語、具体的な修正方法を示唆 |
| **型推論**               | `z.infer<typeof schema>` で型定義と完全一致      |
| **デフォルト値**         | 合理的なデフォルト値を提供                       |
| **複合条件**             | refine関数で複雑な制約を検証                     |
| **CONV-03-01準拠**       | 既存スキーマのパターンを踏襲                     |

### 1.3 依存関係

**CONV-03-01からインポートするスキーマ**:

```typescript
import { z } from "zod";
import { uuidSchema, timestampedSchema, metadataSchema } from "../schemas";
```

**types.tsからインポートする型**（型推論検証用）:

```typescript
import type {
  ChunkingStrategy,
  EmbeddingProvider,
  // 他の型も必要に応じて
} from "./types";
```

---

## 2. 列挙型スキーマの設計

### 2.1 chunkingStrategySchema

#### 設計仕様

```typescript
/**
 * チャンキング戦略のバリデーションスキーマ
 *
 * 7種類の戦略をサポート:
 * - fixed_size: 固定サイズ分割
 * - semantic: 意味的境界分割
 * - recursive: 再帰的文字分割（LangChainデフォルト）
 * - sentence: 文単位分割
 * - paragraph: 段落単位分割
 * - markdown_header: Markdownヘッダー基準分割
 * - code_block: コードブロック単位分割
 *
 * @example
 * const strategy = chunkingStrategySchema.parse("recursive"); // OK
 * chunkingStrategySchema.parse("invalid"); // エラー
 */
export const chunkingStrategySchema = z.enum(
  [
    "fixed_size",
    "semantic",
    "recursive",
    "sentence",
    "paragraph",
    "markdown_header",
    "code_block",
  ],
  {
    errorMap: (issue, ctx) => {
      if (issue.code === z.ZodIssueCode.invalid_enum_value) {
        return {
          message: `チャンキング戦略は fixed_size, semantic, recursive, sentence, paragraph, markdown_header, code_block のいずれかである必要があります（入力値: ${ctx.data}）`,
        };
      }
      return { message: ctx.defaultError };
    },
  },
);

/** ChunkingStrategy型（スキーマから推論） */
export type ChunkingStrategySchema = z.infer<typeof chunkingStrategySchema>;
```

#### 設計上の決定事項

| 決定事項               | 理由                                             |
| ---------------------- | ------------------------------------------------ |
| z.enum使用             | 文字列リテラルの厳格な制約                       |
| errorMapカスタマイズ   | ユーザーフレンドリーなエラーメッセージ（日本語） |
| 入力値をエラーに含める | デバッグ容易性向上                               |
| 7つの値を全列挙        | types.tsのChunkingStrategiesと完全一致           |

#### 型推論の検証

```typescript
// 型推論が正しく動作することを確認
type Test = ChunkingStrategySchema;
// Test = "fixed_size" | "semantic" | "recursive" | ...

// types.tsのChunkingStrategyと一致
import type { ChunkingStrategy } from "./types";
type IsEqual = ChunkingStrategySchema extends ChunkingStrategy ? true : false;
// IsEqual = true
```

---

### 2.2 embeddingProviderSchema

#### 設計仕様

```typescript
/**
 * 埋め込みプロバイダーのバリデーションスキーマ
 *
 * 4種類のプロバイダーをサポート:
 * - openai: OpenAI（text-embedding-3シリーズ）
 * - cohere: Cohere（embed-english-v3.0等）
 * - voyage: Voyage AI（voyage-large-2等）
 * - local: ローカル環境（Ollama、nomic-embed-text等）
 *
 * @example
 * const provider = embeddingProviderSchema.parse("openai"); // OK
 * embeddingProviderSchema.parse("aws"); // エラー
 */
export const embeddingProviderSchema = z.enum(
  ["openai", "cohere", "voyage", "local"],
  {
    errorMap: (issue, ctx) => {
      if (issue.code === z.ZodIssueCode.invalid_enum_value) {
        return {
          message: `埋め込みプロバイダーは openai, cohere, voyage, local のいずれかである必要があります（入力値: ${ctx.data}）`,
        };
      }
      return { message: ctx.defaultError };
    },
  },
);

/** EmbeddingProvider型（スキーマから推論） */
export type EmbeddingProviderSchema = z.infer<typeof embeddingProviderSchema>;
```

#### 設計上の決定事項

| 決定事項                     | 理由                           |
| ---------------------------- | ------------------------------ |
| 4つのプロバイダー            | 要件書FR-02に基づく            |
| errorMapで具体的なメッセージ | どのプロバイダーが有効かを明示 |
| 小文字値                     | API識別子としての慣習          |

---

## 3. 基本インターフェーススキーマの設計

### 3.1 chunkPositionSchema

#### 設計仕様

```typescript
/**
 * チャンク位置情報のバリデーションスキーマ
 *
 * フィールド制約:
 * - index: 0以上の整数（チャンク順序）
 * - startLine: 1以上の整数（開始行番号、エディタ表示準拠）
 * - endLine: 1以上の整数（終了行番号）
 * - startChar: 0以上の整数（開始文字位置）
 * - endChar: 0以上の整数（終了文字位置）
 * - parentHeader: 文字列またはnull（Markdown見出し）
 *
 * @example
 * const position = chunkPositionSchema.parse({
 *   index: 0,
 *   startLine: 1,
 *   endLine: 10,
 *   startChar: 0,
 *   endChar: 500,
 *   parentHeader: "Introduction"
 * });
 */
export const chunkPositionSchema = z
  .object({
    index: z
      .number()
      .int({ message: "indexは整数である必要があります" })
      .min(0, { message: "indexは0以上である必要があります" }),

    startLine: z
      .number()
      .int({ message: "startLineは整数である必要があります" })
      .min(1, {
        message: "startLineは1以上である必要があります（行番号は1始まり）",
      }),

    endLine: z
      .number()
      .int({ message: "endLineは整数である必要があります" })
      .min(1, {
        message: "endLineは1以上である必要があります（行番号は1始まり）",
      }),

    startChar: z
      .number()
      .int({ message: "startCharは整数である必要があります" })
      .min(0, { message: "startCharは0以上である必要があります" }),

    endChar: z
      .number()
      .int({ message: "endCharは整数である必要があります" })
      .min(0, { message: "endCharは0以上である必要があります" }),

    parentHeader: z.string().nullable().describe("親見出し（Markdownの場合）"),
  })
  .refine((data) => data.endLine >= data.startLine, {
    message: "endLineはstartLine以上である必要があります",
    path: ["endLine"],
  })
  .refine((data) => data.endChar >= data.startChar, {
    message: "endCharはstartChar以上である必要があります",
    path: ["endChar"],
  });

/** ChunkPosition型（スキーマから推論） */
export type ChunkPositionSchema = z.infer<typeof chunkPositionSchema>;
```

#### 設計上の決定事項

| 決定事項               | 理由                                             |
| ---------------------- | ------------------------------------------------ |
| refineで複合条件検証   | endLine >= startLine、endChar >= startCharを保証 |
| pathオプション指定     | エラーが発生したフィールドを明示                 |
| 日本語エラーメッセージ | ユーザーフレンドリー、修正方法が明確             |
| 行番号は1始まり明示    | エディタ表示との一致を説明                       |

#### エラーメッセージ例

**境界値違反**:

```typescript
// index < 0
chunkPositionSchema.parse({ index: -1, ... })
// エラー: "indexは0以上である必要があります"

// startLine < 1
chunkPositionSchema.parse({ ..., startLine: 0, ... })
// エラー: "startLineは1以上である必要があります（行番号は1始まり）"
```

**複合条件違反**:

```typescript
// endLine < startLine
chunkPositionSchema.parse({ ..., startLine: 10, endLine: 5, ... })
// エラー: "endLineはstartLine以上である必要があります"
```

---

### 3.2 chunkOverlapSchema

#### 設計仕様

```typescript
/**
 * チャンク間のオーバーラップのバリデーションスキーマ
 *
 * フィールド制約:
 * - prevChunkId: UUID形式またはnull
 * - nextChunkId: UUID形式またはnull
 * - overlapTokens: 0以上の整数
 *
 * @example
 * const overlap = chunkOverlapSchema.parse({
 *   prevChunkId: "550e8400-e29b-41d4-a716-446655440000",
 *   nextChunkId: null,
 *   overlapTokens: 50
 * });
 */
export const chunkOverlapSchema = z.object({
  prevChunkId: uuidSchema.nullable().describe("前のチャンクのID"),

  nextChunkId: uuidSchema.nullable().describe("次のチャンクのID"),

  overlapTokens: z
    .number()
    .int({ message: "overlapTokensは整数である必要があります" })
    .min(0, { message: "overlapTokensは0以上である必要があります" }),
});

/** ChunkOverlap型（スキーマから推論） */
export type ChunkOverlapSchema = z.infer<typeof chunkOverlapSchema>;
```

#### 設計上の決定事項

| 決定事項              | 理由                               |
| --------------------- | ---------------------------------- |
| uuidSchema.nullable() | 既存のuuidSchemaを再利用、null許可 |
| describe()使用        | スキーマの意図を文書化             |
| overlapTokens >= 0    | 負の値は無意味                     |

---

### 3.3 chunkEntitySchema

#### 設計仕様

```typescript
/**
 * チャンクエンティティのバリデーションスキーマ
 *
 * フィールド制約:
 * - id, fileId: UUID形式必須
 * - content: 最小1文字以上（空チャンク禁止）
 * - contextualContent: 文字列またはnull
 * - position: chunkPositionSchemaに準拠
 * - strategy: chunkingStrategySchemaに準拠
 * - tokenCount: 1以上の整数
 * - hash: SHA-256形式（64文字の16進数）
 * - metadata: 任意のキー・値ペア
 * - createdAt, updatedAt: 日付型
 *
 * @example
 * const chunk = chunkEntitySchema.parse({
 *   id: "550e8400-e29b-41d4-a716-446655440000",
 *   fileId: "660e8400-e29b-41d4-a716-446655440000",
 *   content: "This is a chunk",
 *   contextualContent: null,
 *   position: { index: 0, startLine: 1, ... },
 *   strategy: "recursive",
 *   tokenCount: 10,
 *   hash: "a".repeat(64),
 *   metadata: {},
 *   createdAt: new Date(),
 *   updatedAt: new Date()
 * });
 */
export const chunkEntitySchema = z
  .object({
    id: uuidSchema.describe("チャンクの一意識別子"),

    fileId: uuidSchema.describe("元ファイルのID"),

    content: z
      .string()
      .min(1, { message: "チャンク本文は1文字以上である必要があります" })
      .describe("チャンク本文"),

    contextualContent: z
      .string()
      .nullable()
      .describe("Contextual Retrieval用の文脈付きコンテンツ"),

    position: chunkPositionSchema.describe("チャンク位置情報"),

    strategy: chunkingStrategySchema.describe("使用したチャンキング戦略"),

    tokenCount: z
      .number()
      .int({ message: "tokenCountは整数である必要があります" })
      .min(1, { message: "tokenCountは1以上である必要があります" })
      .describe("トークン数"),

    hash: z
      .string()
      .length(64, {
        message: "hashはSHA-256形式（64文字）である必要があります",
      })
      .regex(/^[0-9a-f]{64}$/, {
        message: "hashは16進数文字列（0-9, a-f）である必要があります",
      })
      .describe("重複検出用ハッシュ値（SHA-256）"),

    metadata: metadataSchema.describe("任意のメタデータ"),
  })
  .merge(timestampedSchema);

/** ChunkEntity型（スキーマから推論） */
export type ChunkEntitySchema = z.infer<typeof chunkEntitySchema>;
```

#### 設計上の決定事項

| 決定事項                       | 理由                                               |
| ------------------------------ | -------------------------------------------------- |
| hash検証を厳格化               | length(64) + regex(/^[0-9a-f]{64}$/)の二重チェック |
| timestampedSchemaをmerge       | CONV-03-01のパターンを踏襲                         |
| describe()で全フィールド文書化 | スキーマの自己文書化                               |
| content.min(1)                 | 空チャンクを禁止                                   |

#### エラーメッセージ例

**content空文字**:

```typescript
chunkEntitySchema.parse({ ..., content: "", ... })
// エラー: "チャンク本文は1文字以上である必要があります"
```

**hash長さ違反**:

```typescript
chunkEntitySchema.parse({ ..., hash: "abc", ... })
// エラー: "hashはSHA-256形式（64文字）である必要があります"
```

**hash形式違反**:

```typescript
chunkEntitySchema.parse({ ..., hash: "g".repeat(64), ... })
// エラー: "hashは16進数文字列（0-9, a-f）である必要があります"
```

---

## 4. 設定スキーマの設計

### 4.1 embeddingModelConfigSchema

#### 設計仕様

```typescript
/**
 * 埋め込みモデル設定のバリデーションスキーマ
 *
 * フィールド制約:
 * - provider: openai, cohere, voyage, local のいずれか
 * - modelId: 1文字以上の文字列
 * - dimensions: 64〜4096の整数（主要プロバイダーの対応範囲）
 * - maxTokens: 1〜8192の整数（OpenAIの上限を考慮）
 * - batchSize: 1〜100の整数（レート制限を考慮）
 *
 * @example
 * const config = embeddingModelConfigSchema.parse({
 *   provider: "openai",
 *   modelId: "text-embedding-3-small",
 *   dimensions: 1536,
 *   maxTokens: 8191,
 *   batchSize: 100
 * });
 */
export const embeddingModelConfigSchema = z.object({
  provider: embeddingProviderSchema.describe("埋め込みプロバイダー"),

  modelId: z
    .string()
    .min(1, { message: "modelIdは1文字以上である必要があります" })
    .describe("プロバイダー固有のモデル識別子"),

  dimensions: z
    .number()
    .int({ message: "dimensionsは整数である必要があります" })
    .min(64, { message: "dimensionsは64以上である必要があります" })
    .max(4096, { message: "dimensionsは4096以下である必要があります" })
    .describe("ベクトル次元数（64〜4096）"),

  maxTokens: z
    .number()
    .int({ message: "maxTokensは整数である必要があります" })
    .min(1, { message: "maxTokensは1以上である必要があります" })
    .max(8192, { message: "maxTokensは8192以下である必要があります" })
    .describe("モデルが1度に処理できる最大トークン数"),

  batchSize: z
    .number()
    .int({ message: "batchSizeは整数である必要があります" })
    .min(1, { message: "batchSizeは1以上である必要があります" })
    .max(100, { message: "batchSizeは100以下である必要があります" })
    .describe("1回のAPI呼び出しで処理できるチャンク数"),
});

/** EmbeddingModelConfig型（スキーマから推論） */
export type EmbeddingModelConfigSchema = z.infer<
  typeof embeddingModelConfigSchema
>;
```

#### 設計上の決定事項

| 決定事項                 | 理由                               |
| ------------------------ | ---------------------------------- |
| dimensions範囲: 64〜4096 | 主要プロバイダーの実用範囲をカバー |
| maxTokens範囲: 1〜8192   | OpenAIの8191トークンを上限         |
| batchSize範囲: 1〜100    | レート制限対策、安全なバッチ処理   |

#### 境界値のバリデーション

**正常系（境界値）**:

```typescript
// dimensions = 64（最小値）
embeddingModelConfigSchema.parse({ ..., dimensions: 64, ... }) // OK

// dimensions = 4096（最大値）
embeddingModelConfigSchema.parse({ ..., dimensions: 4096, ... }) // OK
```

**異常系（境界値違反）**:

```typescript
// dimensions < 64
embeddingModelConfigSchema.parse({ ..., dimensions: 63, ... })
// エラー: "dimensionsは64以上である必要があります"

// dimensions > 4096
embeddingModelConfigSchema.parse({ ..., dimensions: 5000, ... })
// エラー: "dimensionsは4096以下である必要があります"
```

---

### 4.2 chunkingConfigSchema（複合条件制約付き）

#### 設計仕様

```typescript
/**
 * チャンキング設定のバリデーションスキーマ
 *
 * フィールド制約:
 * - strategy: チャンキング戦略（7種類）
 * - targetSize: 50〜2000の整数（デフォルト: 512）
 * - minSize: 10〜1000の整数（デフォルト: 100）
 * - maxSize: 100〜4000の整数（デフォルト: 1024）
 * - overlapSize: 0〜500の整数（デフォルト: 50）
 * - preserveBoundaries: boolean（デフォルト: true）
 * - includeContext: boolean（デフォルト: true）
 *
 * 複合条件制約:
 * - minSize <= targetSize <= maxSize が成立すること
 *
 * @example
 * // デフォルト値を使用
 * const config1 = chunkingConfigSchema.parse({ strategy: "recursive" });
 * // config1.targetSize === 512
 *
 * // カスタム値を指定
 * const config2 = chunkingConfigSchema.parse({
 *   strategy: "fixed_size",
 *   targetSize: 500,
 *   minSize: 200,
 *   maxSize: 800
 * });
 */
export const chunkingConfigSchema = z
  .object({
    strategy: chunkingStrategySchema.describe("チャンキング戦略"),

    targetSize: z
      .number()
      .int({ message: "targetSizeは整数である必要があります" })
      .min(50, { message: "targetSizeは50以上である必要があります" })
      .max(2000, { message: "targetSizeは2000以下である必要があります" })
      .default(512)
      .describe("目標トークン数（デフォルト: 512）"),

    minSize: z
      .number()
      .int({ message: "minSizeは整数である必要があります" })
      .min(10, { message: "minSizeは10以上である必要があります" })
      .max(1000, { message: "minSizeは1000以下である必要があります" })
      .default(100)
      .describe("最小トークン数（デフォルト: 100）"),

    maxSize: z
      .number()
      .int({ message: "maxSizeは整数である必要があります" })
      .min(100, { message: "maxSizeは100以上である必要があります" })
      .max(4000, { message: "maxSizeは4000以下である必要があります" })
      .default(1024)
      .describe("最大トークン数（デフォルト: 1024）"),

    overlapSize: z
      .number()
      .int({ message: "overlapSizeは整数である必要があります" })
      .min(0, { message: "overlapSizeは0以上である必要があります" })
      .max(500, { message: "overlapSizeは500以下である必要があります" })
      .default(50)
      .describe("オーバーラップトークン数（デフォルト: 50）"),

    preserveBoundaries: z
      .boolean()
      .default(true)
      .describe("文/段落境界を保持するか（デフォルト: true）"),

    includeContext: z
      .boolean()
      .default(true)
      .describe("Contextual Retrievalを使用するか（デフォルト: true）"),
  })
  .refine((config) => config.minSize <= config.targetSize, {
    message:
      "minSizeはtargetSize以下である必要があります（minSize: {minSize}, targetSize: {targetSize}）",
    path: ["minSize"],
  })
  .refine((config) => config.targetSize <= config.maxSize, {
    message:
      "targetSizeはmaxSize以下である必要があります（targetSize: {targetSize}, maxSize: {maxSize}）",
    path: ["targetSize"],
  });

/** ChunkingConfig型（スキーマから推論） */
export type ChunkingConfigSchema = z.infer<typeof chunkingConfigSchema>;
```

#### 設計上の決定事項

| 決定事項                     | 理由                                                                           |
| ---------------------------- | ------------------------------------------------------------------------------ |
| 2つのrefineで分離            | エラーメッセージを具体的に（minSize/targetSize違反 vs targetSize/maxSize違反） |
| pathオプション指定           | エラーが発生したフィールドを明示                                               |
| default()で全フィールド      | 部分的な設定を可能に                                                           |
| エラーメッセージに値を含める | デバッグ容易性向上（実際の値を表示）                                           |

#### 複合条件バリデーションの動作

**正常系**:

```typescript
// デフォルト値（100 <= 512 <= 1024）
const config1 = chunkingConfigSchema.parse({ strategy: "recursive" });
// OK

// カスタム値（200 <= 500 <= 800）
const config2 = chunkingConfigSchema.parse({
  strategy: "fixed_size",
  targetSize: 500,
  minSize: 200,
  maxSize: 800,
});
// OK
```

**異常系（minSize > targetSize）**:

```typescript
chunkingConfigSchema.parse({
  strategy: "recursive",
  targetSize: 100,
  minSize: 200,
  maxSize: 500,
});
// エラー: "minSizeはtargetSize以下である必要があります（minSize: 200, targetSize: 100）"
// path: ["minSize"]
```

**異常系（targetSize > maxSize）**:

```typescript
chunkingConfigSchema.parse({
  strategy: "recursive",
  targetSize: 1500,
  minSize: 100,
  maxSize: 1000,
});
// エラー: "targetSizeはmaxSize以下である必要があります（targetSize: 1500, maxSize: 1000）"
// path: ["targetSize"]
```

#### 注意: エラーメッセージでの値展開

Zodのrefineでは、テンプレート文字列での値展開は標準サポートされていないため、代替案を検討:

**代替案1（推奨）**: エラーメッセージを動的生成

```typescript
.refine((config) => config.minSize <= config.targetSize, {
  message: (config) =>
    `minSizeはtargetSize以下である必要があります（minSize: ${config.minSize}, targetSize: ${config.targetSize}）`,
  path: ["minSize"],
})
```

**代替案2**: 静的メッセージ

```typescript
.refine((config) => config.minSize <= config.targetSize, {
  message: "minSizeはtargetSize以下である必要があります",
  path: ["minSize"],
})
```

**設計判断**: Zod v3.xのAPIを確認し、動的生成が可能であれば代替案1、不可能であれば代替案2を採用。

---

## 5. エンティティスキーマの設計

### 5.1 embeddingEntitySchema

#### 設計仕様

```typescript
/**
 * 埋め込みエンティティのバリデーションスキーマ
 *
 * フィールド制約:
 * - id, chunkId: UUID形式必須
 * - vector: 64〜4096要素の数値配列（Float32Arrayの代替）
 * - modelId: 1文字以上の文字列
 * - dimensions: 64〜4096の整数（vector.lengthと一致すること）
 * - normalizedMagnitude: 0.99〜1.01の数値（L2正規化後の大きさ）
 * - createdAt, updatedAt: 日付型
 *
 * 注意:
 * - TypeScript上はvector: Float32Arrayだが、Zodではz.array(z.number())として扱う
 * - dimensions と vector.length の整合性はrefineで検証
 *
 * @example
 * const embedding = embeddingEntitySchema.parse({
 *   id: "550e8400-e29b-41d4-a716-446655440000",
 *   chunkId: "660e8400-e29b-41d4-a716-446655440000",
 *   vector: [0.1, 0.2, 0.3, ...], // 配列として扱う
 *   modelId: "text-embedding-3-small",
 *   dimensions: 1536,
 *   normalizedMagnitude: 1.0,
 *   createdAt: new Date(),
 *   updatedAt: new Date()
 * });
 */
export const embeddingEntitySchema = z
  .object({
    id: uuidSchema.describe("埋め込みの一意識別子"),

    chunkId: uuidSchema.describe("元チャンクのID"),

    vector: z
      .array(z.number())
      .min(64, {
        message: "ベクトルは最低64次元である必要があります",
      })
      .max(4096, {
        message: "ベクトルは最大4096次元である必要があります",
      })
      .describe("埋め込みベクトル（Float32Arrayの配列表現）"),

    modelId: z
      .string()
      .min(1, { message: "modelIdは1文字以上である必要があります" })
      .describe("使用した埋め込みモデルのID"),

    dimensions: z
      .number()
      .int({ message: "dimensionsは整数である必要があります" })
      .min(64, { message: "dimensionsは64以上である必要があります" })
      .max(4096, { message: "dimensionsは4096以下である必要があります" })
      .describe("ベクトルの次元数"),

    normalizedMagnitude: z
      .number()
      .min(0.99, {
        message:
          "normalizedMagnitudeは0.99以上である必要があります（正規化後のベクトルは大きさ約1.0）",
      })
      .max(1.01, {
        message:
          "normalizedMagnitudeは1.01以下である必要があります（正規化後のベクトルは大きさ約1.0）",
      })
      .describe("正規化検証用の大きさ（L2正規化後は約1.0）"),
  })
  .merge(timestampedSchema)
  .refine((data) => data.vector.length === data.dimensions, {
    message: "vectorの要素数とdimensionsフィールドは一致する必要があります",
    path: ["dimensions"],
  });

/** EmbeddingEntity型（スキーマから推論） */
export type EmbeddingEntitySchema = z.infer<typeof embeddingEntitySchema>;
```

#### 設計上の決定事項

| 決定事項                            | 理由                                             |
| ----------------------------------- | ------------------------------------------------ |
| vectorをz.array(z.number())         | Float32Arrayは直接サポートされないため配列で代替 |
| refineでdimensions整合性検証        | vector.length === dimensions を保証              |
| normalizedMagnitude範囲: 0.99〜1.01 | 浮動小数点演算の誤差を考慮                       |

#### Float32Array型とZodスキーマの変換

**TypeScript型**:

```typescript
interface EmbeddingEntity {
  vector: Float32Array; // TypeScript上
}
```

**Zodスキーマ**:

```typescript
const schema = z.object({
  vector: z.array(z.number()), // Zod上
});
```

**ランタイム変換**:

```typescript
// バリデーション前（Float32Array → Array）
const input = {
  vector: Array.from(new Float32Array([0.1, 0.2, 0.3])),
  // ...
};
const validated = embeddingEntitySchema.parse(input);

// バリデーション後（Array → Float32Array）
const entity: EmbeddingEntity = {
  ...validated,
  vector: new Float32Array(validated.vector),
};
```

---

### 5.2 chunkingResultSchema

#### 設計仕様

```typescript
/**
 * チャンキング結果のバリデーションスキーマ
 *
 * フィールド制約:
 * - fileId: UUID形式必須
 * - chunks: ChunkEntityの配列
 * - totalTokens: 0以上の整数
 * - averageChunkSize: 0以上の数値
 * - processingTime: 0以上の数値（ミリ秒）
 *
 * @example
 * const result = chunkingResultSchema.parse({
 *   fileId: "550e8400-e29b-41d4-a716-446655440000",
 *   chunks: [chunk1, chunk2, ...],
 *   totalTokens: 1000,
 *   averageChunkSize: 333.3,
 *   processingTime: 150.5
 * });
 */
export const chunkingResultSchema = z.object({
  fileId: uuidSchema.describe("チャンキング対象のファイルID"),

  chunks: z
    .array(chunkEntitySchema)
    .describe("生成されたチャンクの配列（position.indexの昇順）"),

  totalTokens: z
    .number()
    .int({ message: "totalTokensは整数である必要があります" })
    .min(0, { message: "totalTokensは0以上である必要があります" })
    .describe("元ファイル全体のトークン数"),

  averageChunkSize: z
    .number()
    .min(0, { message: "averageChunkSizeは0以上である必要があります" })
    .describe("平均チャンクサイズ（totalTokens / chunks.length）"),

  processingTime: z
    .number()
    .min(0, { message: "processingTimeは0以上である必要があります" })
    .describe("チャンキング処理時間（ミリ秒）"),
});

/** ChunkingResult型（スキーマから推論） */
export type ChunkingResultSchema = z.infer<typeof chunkingResultSchema>;
```

#### 設計上の決定事項

| 決定事項                          | 理由                     |
| --------------------------------- | ------------------------ |
| chunks配列でchunkEntitySchema使用 | ネストしたバリデーション |
| averageChunkSizeは整数でない      | 平均値のため小数を許可   |
| processingTimeは整数でない        | ミリ秒の精度を保持       |

---

### 5.3 embeddingGenerationResultSchema

#### 設計仕様

```typescript
/**
 * 埋め込み生成結果のバリデーションスキーマ
 *
 * フィールド制約:
 * - chunkId: UUID形式必須
 * - embedding: embeddingEntitySchemaに準拠
 * - processingTime: 0以上の数値（ミリ秒）
 * - tokensUsed: 0以上の整数（プロバイダーの課金基準）
 *
 * @example
 * const result = embeddingGenerationResultSchema.parse({
 *   chunkId: "550e8400-e29b-41d4-a716-446655440000",
 *   embedding: embeddingEntity,
 *   processingTime: 250.3,
 *   tokensUsed: 10
 * });
 */
export const embeddingGenerationResultSchema = z.object({
  chunkId: uuidSchema.describe("埋め込み生成対象のチャンクID"),

  embedding: embeddingEntitySchema.describe("生成された埋め込みエンティティ"),

  processingTime: z
    .number()
    .min(0, { message: "processingTimeは0以上である必要があります" })
    .describe("API呼び出しを含む総処理時間（ミリ秒）"),

  tokensUsed: z
    .number()
    .int({ message: "tokensUsedは整数である必要があります" })
    .min(0, { message: "tokensUsedは0以上である必要があります" })
    .describe("プロバイダーが報告した使用トークン数"),
});

/** EmbeddingGenerationResult型（スキーマから推論） */
export type EmbeddingGenerationResultSchema = z.infer<
  typeof embeddingGenerationResultSchema
>;
```

---

## 6. バッチ処理スキーマの設計

### 6.1 batchEmbeddingInputSchema

#### 設計仕様

```typescript
/**
 * バッチ埋め込み入力のバリデーションスキーマ
 *
 * フィールド制約:
 * - chunks: 1〜100件の配列（各要素にid、content必須）
 * - modelConfig: embeddingModelConfigSchemaに準拠
 *
 * バッチサイズ制限の根拠:
 * - OpenAI: 最大100件/リクエスト（公式制限）
 * - レート制限対策: 安全マージンを考慮
 *
 * @example
 * const input = batchEmbeddingInputSchema.parse({
 *   chunks: [
 *     { id: "550e8400-...", content: "chunk 1" },
 *     { id: "660e8400-...", content: "chunk 2" }
 *   ],
 *   modelConfig: {
 *     provider: "openai",
 *     modelId: "text-embedding-3-small",
 *     dimensions: 1536,
 *     maxTokens: 8191,
 *     batchSize: 100
 *   }
 * });
 */
export const batchEmbeddingInputSchema = z.object({
  chunks: z
    .array(
      z.object({
        id: uuidSchema.describe("チャンクID"),
        content: z
          .string()
          .min(1, { message: "チャンク本文は1文字以上である必要があります" })
          .describe("チャンク本文"),
      }),
    )
    .min(1, { message: "chunksは最低1件必要です" })
    .max(100, {
      message: "chunksは最大100件までです（プロバイダーのレート制限を考慮）",
    })
    .describe("バッチ処理対象のチャンク"),

  modelConfig:
    embeddingModelConfigSchema.describe("使用する埋め込みモデルの設定"),
});

/** BatchEmbeddingInput型（スキーマから推論） */
export type BatchEmbeddingInputSchema = z.infer<
  typeof batchEmbeddingInputSchema
>;
```

#### 設計上の決定事項

| 決定事項                 | 理由                                         |
| ------------------------ | -------------------------------------------- |
| chunks配列の範囲: 1〜100 | OpenAIの公式制限、他プロバイダーも同様の範囲 |
| 簡略化されたchunks型     | idとcontentのみ（ChunkEntity全体は不要）     |
| ネストしたobject定義     | 型安全性を保ちつつ、不要なフィールドを除外   |

---

## 7. スキーマのインポート・エクスポート構成

### 7.1 schemas.tsの完全な構造

```typescript
/**
 * @file チャンク・埋め込みZodスキーマ定義
 * @module @repo/shared/types/rag/chunk/schemas
 * @description types.tsの型に対応するランタイムバリデーション
 */

// =============================================================================
// インポート
// =============================================================================
import { z } from "zod";
import { uuidSchema, timestampedSchema, metadataSchema } from "../schemas";

// 型推論検証用（オプション）
import type { ChunkingStrategy, EmbeddingProvider } from "./types";

// =============================================================================
// 列挙型スキーマ
// =============================================================================
export const chunkingStrategySchema = z.enum([
  /* ... */
]);
export const embeddingProviderSchema = z.enum([
  /* ... */
]);

// =============================================================================
// 基本インターフェーススキーマ
// =============================================================================
export const chunkPositionSchema = z
  .object({
    /* ... */
  })
  .refine(/* ... */);
export const chunkOverlapSchema = z.object({
  /* ... */
});

// =============================================================================
// 設定スキーマ
// =============================================================================
export const embeddingModelConfigSchema = z.object({
  /* ... */
});
export const chunkingConfigSchema = z
  .object({
    /* ... */
  })
  .refine(/* ... */);

// =============================================================================
// エンティティスキーマ
// =============================================================================
export const chunkEntitySchema = z
  .object({
    /* ... */
  })
  .merge(timestampedSchema);
export const embeddingEntitySchema = z
  .object({
    /* ... */
  })
  .merge(timestampedSchema)
  .refine(/* ... */);

// =============================================================================
// 結果スキーマ
// =============================================================================
export const chunkingResultSchema = z.object({
  /* ... */
});
export const embeddingGenerationResultSchema = z.object({
  /* ... */
});
export const batchEmbeddingInputSchema = z.object({
  /* ... */
});

// =============================================================================
// 型推論エクスポート
// =============================================================================
export type ChunkingStrategySchema = z.infer<typeof chunkingStrategySchema>;
export type EmbeddingProviderSchema = z.infer<typeof embeddingProviderSchema>;
export type ChunkPositionSchema = z.infer<typeof chunkPositionSchema>;
export type ChunkOverlapSchema = z.infer<typeof chunkOverlapSchema>;
export type EmbeddingModelConfigSchema = z.infer<
  typeof embeddingModelConfigSchema
>;
export type ChunkingConfigSchema = z.infer<typeof chunkingConfigSchema>;
export type ChunkEntitySchema = z.infer<typeof chunkEntitySchema>;
export type EmbeddingEntitySchema = z.infer<typeof embeddingEntitySchema>;
export type ChunkingResultSchema = z.infer<typeof chunkingResultSchema>;
export type EmbeddingGenerationResultSchema = z.infer<
  typeof embeddingGenerationResultSchema
>;
export type BatchEmbeddingInputSchema = z.infer<
  typeof batchEmbeddingInputSchema
>;
```

### 7.2 スキーマ定義順序

スキーマ間の依存関係に基づく定義順序:

1. **列挙型スキーマ**（依存なし）
   - chunkingStrategySchema
   - embeddingProviderSchema

2. **基本インターフェーススキーマ**（列挙型に依存）
   - chunkPositionSchema
   - chunkOverlapSchema

3. **設定スキーマ**（列挙型に依存）
   - embeddingModelConfigSchema
   - chunkingConfigSchema

4. **エンティティスキーマ**（基本インターフェース・設定に依存）
   - chunkEntitySchema（chunkPositionSchema、chunkingStrategySchemaに依存）
   - embeddingEntitySchema（embeddingProviderSchemaに依存）

5. **結果スキーマ**（エンティティに依存）
   - chunkingResultSchema（chunkEntitySchemaに依存）
   - embeddingGenerationResultSchema（embeddingEntitySchemaに依存）
   - batchEmbeddingInputSchema（embeddingModelConfigSchemaに依存）

---

## 8. エラーメッセージ設計

### 8.1 エラーメッセージの原則

| 原則               | 説明                   | 例                                 |
| ------------------ | ---------------------- | ---------------------------------- |
| **具体性**         | 何が問題かを明確に     | "indexは0以上である必要があります" |
| **修正方法の示唆** | どう直せば良いかを示す | "行番号は1始まり"                  |
| **文脈情報**       | 入力値や期待値を含める | "入力値: -1"                       |
| **日本語**         | 日本人開発者への配慮   | 英語メッセージは避ける             |
| **丁寧語**         | 親しみやすさ           | "である必要があります"             |

### 8.2 エラーメッセージカタログ

| スキーマ                  | エラーケース               | メッセージ                                                                                                                                               |
| ------------------------- | -------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| chunkingStrategySchema    | 不正な値                   | "チャンキング戦略は fixed_size, semantic, recursive, sentence, paragraph, markdown_header, code_block のいずれかである必要があります（入力値: {value}）" |
| chunkPositionSchema       | index < 0                  | "indexは0以上である必要があります"                                                                                                                       |
| chunkPositionSchema       | startLine < 1              | "startLineは1以上である必要があります（行番号は1始まり）"                                                                                                |
| chunkPositionSchema       | endLine < startLine        | "endLineはstartLine以上である必要があります"                                                                                                             |
| chunkEntitySchema         | content空文字              | "チャンク本文は1文字以上である必要があります"                                                                                                            |
| chunkEntitySchema         | hash長さ違反               | "hashはSHA-256形式（64文字）である必要があります"                                                                                                        |
| chunkingConfigSchema      | minSize > targetSize       | "minSizeはtargetSize以下である必要があります"                                                                                                            |
| embeddingEntitySchema     | vector.length ≠ dimensions | "vectorの要素数とdimensionsフィールドは一致する必要があります"                                                                                           |
| embeddingEntitySchema     | normalizedMagnitude範囲外  | "normalizedMagnitudeは0.99以上である必要があります（正規化後のベクトルは大きさ約1.0）"                                                                   |
| batchEmbeddingInputSchema | chunks配列空               | "chunksは最低1件必要です"                                                                                                                                |
| batchEmbeddingInputSchema | chunks > 100               | "chunksは最大100件までです（プロバイダーのレート制限を考慮）"                                                                                            |

---

## 9. 型推論とTypeScriptの統合

### 9.1 スキーマから型への推論

**目的**: schemas.tsで定義したスキーマから型を推論し、types.tsの型と一致することを検証

**パターン**:

```typescript
// スキーマ定義
export const chunkEntitySchema = z.object({
  /* ... */
});

// 型推論
export type ChunkEntitySchema = z.infer<typeof chunkEntitySchema>;

// types.tsの型との比較（テストで検証）
import type { ChunkEntity } from "./types";
type IsEqual = ChunkEntitySchema extends ChunkEntity ? true : false;
```

**期待される結果**: IsEqual = true（一部フィールドは除く - vectorのFloat32Array vs number[]）

---

### 9.2 型とスキーマの差異

**Float32Array vs number[]**:

| ファイル   | 型                            | 理由                             |
| ---------- | ----------------------------- | -------------------------------- |
| types.ts   | `vector: Float32Array`        | TypeScript上の型、パフォーマンス |
| schemas.ts | `vector: z.array(z.number())` | Zodの制約、Float32Array非対応    |

**実装時の注意**:

```typescript
// バリデーション時は配列として扱う
const validated = embeddingEntitySchema.parse({
  vector: [0.1, 0.2, 0.3], // number[]
  // ...
});

// 実際のエンティティではFloat32Arrayに変換
const entity: EmbeddingEntity = {
  ...validated,
  vector: new Float32Array(validated.vector), // Float32Array
};
```

---

## 10. デフォルト値の設計

### 10.1 デフォルト値を持つスキーマ

| スキーマ             | フィールド         | デフォルト値 |
| -------------------- | ------------------ | ------------ |
| chunkingConfigSchema | targetSize         | 512          |
| chunkingConfigSchema | minSize            | 100          |
| chunkingConfigSchema | maxSize            | 1024         |
| chunkingConfigSchema | overlapSize        | 50           |
| chunkingConfigSchema | preserveBoundaries | true         |
| chunkingConfigSchema | includeContext     | true         |

### 10.2 部分的な入力の許可

**例**: strategyのみ指定、他はデフォルト値

```typescript
const config = chunkingConfigSchema.parse({
  strategy: "recursive",
  // targetSize: 512（デフォルト）
  // minSize: 100（デフォルト）
  // maxSize: 1024（デフォルト）
  // overlapSize: 50（デフォルト）
  // preserveBoundaries: true（デフォルト）
  // includeContext: true（デフォルト）
});

console.log(config.targetSize); // 512
console.log(config.preserveBoundaries); // true
```

---

## 11. セキュリティ・サニタイゼーション

### 11.1 入力サニタイゼーション対象フィールド

| フィールド        | 脅威                     | 対策                                          |
| ----------------- | ------------------------ | --------------------------------------------- |
| content           | XSS（HTMLコンテキスト）  | Zodスキーマでは対策不要（表示時にエスケープ） |
| contextualContent | XSS（HTMLコンテキスト）  | Zodスキーマでは対策不要（表示時にエスケープ） |
| parentHeader      | XSS（HTMLコンテキスト）  | Zodスキーマでは対策不要（表示時にエスケープ） |
| modelId           | コマンドインジェクション | 英数字・ハイフン・アンダースコアのみ許可      |

### 11.2 modelIdのサニタイゼーション強化（オプション）

**強化版スキーマ**:

```typescript
modelId: z
  .string()
  .min(1, { message: "modelIdは1文字以上である必要があります" })
  .regex(/^[a-zA-Z0-9_-]+$/, {
    message: "modelIdは英数字、ハイフン、アンダースコアのみ使用可能です",
  })
  .describe("プロバイダー固有のモデル識別子"),
```

**設計判断**: 一部プロバイダーでドット(.)を使用する可能性があるため、緩い制約を採用

```typescript
// 緩い制約（推奨）
.regex(/^[a-zA-Z0-9_.-]+$/, ...)
```

---

## 12. パフォーマンス最適化

### 12.1 スキーマのプリコンパイル

**問題**: Zodスキーマのバリデーションはランタイムコストがある

**対策**: スキーマを定数として定義し、モジュールロード時に1度だけ構築

```typescript
// ✅ 推奨: トップレベルで定義
export const chunkEntitySchema = z.object({
  /* ... */
});

// ❌ 非推奨: 関数内で毎回構築
function validateChunk(data: unknown) {
  const schema = z.object({
    /* ... */
  }); // 毎回構築される
  return schema.parse(data);
}
```

### 12.2 ネストしたスキーマの再利用

**問題**: chunkEntitySchemaがchunkPositionSchemaに依存

**対策**: chunkPositionSchemaを事前定義し、参照する

```typescript
// ✅ 推奨: 事前定義して再利用
export const chunkPositionSchema = z.object({
  /* ... */
});
export const chunkEntitySchema = z.object({
  position: chunkPositionSchema, // 参照
  // ...
});

// ❌ 非推奨: インライン定義
export const chunkEntitySchema = z.object({
  position: z.object({
    /* ... */
  }), // 重複定義
});
```

---

## 13. テスト戦略（Phase 3で使用）

### 13.1 テストケース分類

| カテゴリ             | テストケース数（目安） | 例                                        |
| -------------------- | ---------------------- | ----------------------------------------- |
| **正常系**           | 各スキーマ×2 = 22件    | 正常値、境界値（最小・最大）              |
| **異常系**           | 各制約×2 = 40件        | 範囲外、型違い、null/undefined            |
| **複合条件**         | 4件                    | minSize > targetSize、endLine < startLine |
| **エラーメッセージ** | 11件                   | 各エラーメッセージが期待通りか            |

**総テストケース数（schemas.test.ts）**: 約50件

### 13.2 境界値テスト一覧

| スキーマ                   | フィールド          | 境界値（正常） | 境界値（異常） |
| -------------------------- | ------------------- | -------------- | -------------- |
| chunkPositionSchema        | index               | 0              | -1             |
| chunkPositionSchema        | startLine           | 1              | 0              |
| embeddingModelConfigSchema | dimensions          | 64, 4096       | 63, 4097       |
| embeddingModelConfigSchema | maxTokens           | 1, 8192        | 0, 8193        |
| embeddingModelConfigSchema | batchSize           | 1, 100         | 0, 101         |
| chunkingConfigSchema       | targetSize          | 50, 2000       | 49, 2001       |
| embeddingEntitySchema      | normalizedMagnitude | 0.99, 1.01     | 0.98, 1.02     |
| batchEmbeddingInputSchema  | chunks配列          | 1件, 100件     | 0件, 101件     |

---

## 14. Zod v3.x機能の活用

### 14.1 使用するZod機能

| 機能              | 用途                         | 使用箇所                                        |
| ----------------- | ---------------------------- | ----------------------------------------------- |
| `z.object()`      | オブジェクトスキーマ         | 全インターフェース                              |
| `z.enum()`        | 列挙型                       | chunkingStrategySchema、embeddingProviderSchema |
| `z.string()`      | 文字列                       | content、modelId等                              |
| `z.number()`      | 数値                         | dimensions、tokenCount等                        |
| `.int()`          | 整数制約                     | tokenCount、dimensions等                        |
| `.min()/.max()`   | 範囲制約                     | 全数値フィールド                                |
| `.length()`       | 文字列長                     | hash（64文字固定）                              |
| `.regex()`        | 正規表現                     | hash（16進数）                                  |
| `.nullable()`     | null許可                     | contextualContent、parentHeader等               |
| `.optional()`     | undefined許可                | （本タスクでは使用しない）                      |
| `.default()`      | デフォルト値                 | chunkingConfigSchemaの全フィールド              |
| `.merge()`        | スキーマ結合                 | timestampedSchemaの統合                         |
| `.refine()`       | カスタム検証                 | 複合条件、整合性チェック                        |
| `.describe()`     | 文書化                       | 全フィールド                                    |
| `errorMap`        | エラーメッセージカスタマイズ | 列挙型                                          |
| `z.coerce.date()` | 型強制                       | （CONV-03-01で定義済み）                        |
| `z.array()`       | 配列                         | vector、chunks等                                |

### 14.2 使用しない機能（本タスクでは不要）

| 機能                    | 理由                     |
| ----------------------- | ------------------------ |
| `.transform()`          | 型定義タスクでは変換不要 |
| `.preprocess()`         | 前処理不要               |
| `.lazy()`               | 循環参照なし             |
| `.discriminatedUnion()` | 判別可能なユニオン型なし |
| `.pipe()`               | パイプライン処理不要     |

---

## 15. 受け入れ基準との対応

要件書 `task-step00-01-acceptance-criteria.md` の受け入れ基準との対応:

| 受け入れ基準 | 対応するスキーマ           | 実装内容                               |
| ------------ | -------------------------- | -------------------------------------- |
| AC-07        | chunkingStrategySchema     | z.enum、errorMapカスタマイズ           |
| AC-08        | chunkPositionSchema        | min制約、refineで複合条件              |
| AC-09        | chunkEntitySchema          | 全フィールド、timestampedSchemaをmerge |
| AC-10        | chunkingConfigSchema       | refineで複合条件、デフォルト値         |
| AC-11        | embeddingModelConfigSchema | 範囲制約（64〜4096等）                 |
| AC-12        | embeddingEntitySchema      | vector配列、refineで整合性             |
| AC-13        | batchEmbeddingInputSchema  | 配列範囲（1〜100）                     |
| AC-23        | 全スキーマ                 | 11個のスキーマで全型カバー             |

---

## 16. 設計検証チェックリスト

### 16.1 網羅性

- [x] ChunkingStrategy → chunkingStrategySchema
- [x] EmbeddingProvider → embeddingProviderSchema
- [x] ChunkPosition → chunkPositionSchema
- [x] ChunkOverlap → chunkOverlapSchema
- [x] EmbeddingModelConfig → embeddingModelConfigSchema
- [x] ChunkingConfig → chunkingConfigSchema
- [x] ChunkEntity → chunkEntitySchema
- [x] EmbeddingEntity → embeddingEntitySchema
- [x] ChunkingResult → chunkingResultSchema
- [x] EmbeddingGenerationResult → embeddingGenerationResultSchema
- [x] BatchEmbeddingInput → batchEmbeddingInputSchema

**スキーマカバレッジ**: 100%（全11型に対応）

### 16.2 品質基準

- [x] 全スキーマに日本語エラーメッセージ
- [x] 全数値フィールドに範囲制約（min/max）
- [x] 全整数フィールドに.int()制約
- [x] 複合条件はrefineで検証
- [x] デフォルト値が合理的
- [x] describe()で全フィールド文書化
- [x] CONV-03-01のスキーマパターンを踏襲

### 16.3 CONV-03-01との整合性

- [x] uuidSchema、timestampedSchema、metadataSchemaを再利用
- [x] エラーメッセージスタイルが一致（日本語、丁寧語）
- [x] スキーマ構造が一致（object、merge、refine）

---

## 17. 実装時の注意事項

### 17.1 refineのエラーメッセージでの値展開

Zod v3.xのrefineでは、messageフィールドが文字列のみサポートされる可能性がある。

**確認が必要な点**:

```typescript
.refine((config) => config.minSize <= config.targetSize, {
  // ❌ Zod v3.xで動作しない可能性
  message: `minSizeはtargetSize以下である必要があります（minSize: ${config.minSize}, targetSize: ${config.targetSize}）`,
})

// ✅ 動的生成が不可能な場合の代替案
.refine((config) => config.minSize <= config.targetSize, {
  message: "minSizeはtargetSize以下である必要があります",
  path: ["minSize"],
})
```

**設計判断**: 実装フェーズ（T-04-2）で実際のZod APIを確認し、可能であれば値を含める。

---

### 17.2 z.coerce.date()の使用

CONV-03-01では `z.coerce.date()` を使用しているが、本タスクでは:

- `timestampedSchema` をmergeするため、直接使用しない
- CONV-03-01の実装をそのまま活用

---

### 17.3 循環依存の回避

**問題**: chunkingResultSchemaがchunkEntitySchemaに依存し、chunkEntitySchemaがchunkPositionSchemaに依存

**対策**: 定義順序を依存関係に従う（前述の「7.2 スキーマ定義順序」参照）

```typescript
// ✅ 正しい順序
const chunkPositionSchema = z.object({
  /* ... */
});
const chunkEntitySchema = z.object({ position: chunkPositionSchema /* ... */ });
const chunkingResultSchema = z.object({
  chunks: z.array(chunkEntitySchema) /* ... */,
});

// ❌ 間違った順序（chunkEntitySchemaが未定義）
const chunkingResultSchema = z.object({
  chunks: z.array(chunkEntitySchema) /* ... */,
});
const chunkEntitySchema = z.object({
  /* ... */
}); // エラー!
```

---

## 18. スキーマの使用例

### 18.1 バリデーション

**正常系**:

```typescript
import { chunkEntitySchema } from "@repo/shared/types/rag/chunk/schemas";

const data = {
  id: "550e8400-e29b-41d4-a716-446655440000",
  fileId: "660e8400-e29b-41d4-a716-446655440000",
  content: "This is a chunk",
  contextualContent: null,
  position: {
    index: 0,
    startLine: 1,
    endLine: 10,
    startChar: 0,
    endChar: 500,
    parentHeader: null,
  },
  strategy: "recursive",
  tokenCount: 10,
  hash: "a".repeat(64),
  metadata: {},
  createdAt: new Date(),
  updatedAt: new Date(),
};

const validatedChunk = chunkEntitySchema.parse(data);
// 成功: ChunkEntitySchemaとして型推論される
```

**異常系（エラーハンドリング）**:

```typescript
try {
  const data = { content: "" /* ... */ }; // content空文字
  chunkEntitySchema.parse(data);
} catch (error) {
  if (error instanceof z.ZodError) {
    console.error(error.issues);
    // [
    //   {
    //     code: "too_small",
    //     minimum: 1,
    //     path: ["content"],
    //     message: "チャンク本文は1文字以上である必要があります"
    //   }
    // ]
  }
}
```

---

### 18.2 部分バリデーション（.partial()）

**ユースケース**: 更新時に一部フィールドのみバリデーション

```typescript
const updateSchema = chunkEntitySchema.partial();

const partialData = {
  content: "Updated content",
  updatedAt: new Date(),
};

const validated = updateSchema.parse(partialData);
// OK（他のフィールドは不要）
```

---

### 18.3 型ガード関数

**ユースケース**: unknown型のデータを型安全にチェック

```typescript
import type { ChunkEntity } from "./types";

export const isChunkEntity = (data: unknown): data is ChunkEntity => {
  const result = chunkEntitySchema.safeParse(data);
  return result.success;
};

// 使用例
function processChunk(data: unknown) {
  if (isChunkEntity(data)) {
    // data は ChunkEntity 型として扱える
    console.log(data.content);
  } else {
    console.error("Invalid chunk data");
  }
}
```

---

## 19. Phase 3（テスト作成）への引き継ぎ

### 19.1 必要なテストケース

**schemas.test.ts で作成するテスト**:

1. **列挙型スキーマ**（各2件 × 2 = 4件）
   - 正常系: 全有効値
   - 異常系: 不正な値

2. **基本インターフェース**（各6件 × 2 = 12件）
   - 正常系: 正常値、境界値
   - 異常系: 範囲外、型違い
   - 複合条件: refineの検証

3. **設定スキーマ**（各8件 × 2 = 16件）
   - 正常系: デフォルト値、カスタム値、境界値
   - 異常系: 範囲外、複合条件違反

4. **エンティティスキーマ**（各6件 × 2 = 12件）
   - 正常系: 全フィールド正常、timestamped統合
   - 異常系: 必須フィールド欠損、制約違反

5. **結果スキーマ**（各4件 × 3 = 12件）
   - 正常系: ネストしたスキーマ
   - 異常系: ネスト内の制約違反

**合計**: 約56件

### 19.2 テストデータの準備

**ファクトリ関数の検討**:

```typescript
// テストデータ生成ヘルパー
export const createValidChunkEntity = (
  overrides?: Partial<ChunkEntity>,
): ChunkEntity => ({
  id: generateChunkId(),
  fileId: generateFileId(),
  content: "Test chunk content",
  contextualContent: null,
  position: {
    index: 0,
    startLine: 1,
    endLine: 10,
    startChar: 0,
    endChar: 500,
    parentHeader: null,
  },
  strategy: ChunkingStrategies.RECURSIVE,
  tokenCount: 10,
  hash: "a".repeat(64),
  metadata: {},
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});
```

---

## 20. 完了条件の確認

- [x] chunkingStrategySchema、chunkPositionSchema、chunkEntitySchema等の設計完了
- [x] embeddingProviderSchema、embeddingModelConfigSchema、embeddingEntitySchema等の設計完了
- [x] chunkingConfigSchemaにrefineによる複合条件バリデーションが含まれる
- [x] 全スキーマがデフォルト値を適切に設定している（chunkingConfigSchemaのみ）
- [x] エラーメッセージがユーザーフレンドリーである（日本語、具体的）
- [x] Zodスキーマカバレッジ100%（全11型に対応）
- [x] CONV-03-01のスキーマパターンを踏襲
- [x] セキュリティ考慮（modelIdのサニタイゼーション）
- [x] パフォーマンス考慮（スキーマのプリコンパイル）

---

## 21. Phase 2（設計レビューゲート）への準備

本設計書はPhase 2で以下のエージェントによってレビューされる:

- **.claude/agents/arch-police.md**: CONV-03-01との整合性、スキーマ構造の一貫性
- **.claude/agents/schema-def.md**: Zodスキーマの厳密性、型推論の正確性
- **.claude/agents/logic-dev.md**: 複合条件制約の妥当性、境界値の合理性

想定されるレビュー指摘:

- [ ] refineのエラーメッセージで値展開が可能か（Zod APIの確認必要）
- [ ] modelIdのregex制約が厳しすぎないか（ドット等の許可）
- [ ] normalizedMagnitudeの範囲（0.99〜1.01）が適切か
- [ ] batchSizeの上限（100）が各プロバイダーで妥当か

設計時点での判断:

- **値展開**: 実装時に確認、動的生成不可ならば静的メッセージを採用
- **modelIdのregex**: `/^[a-zA-Z0-9_.-]+$/` で緩めに設定
- **normalizedMagnitude**: 0.99〜1.01で妥当（浮動小数点誤差を考慮）
- **batchSize上限**: 100で妥当（OpenAIの公式制限）

---

## 22. 変更履歴

| 日付       | バージョン | 変更内容 | 変更者      |
| ---------- | ---------- | -------- | ----------- |
| 2025-12-18 | 1.0.0      | 初版作成 | .claude/agents/schema-def.md |
