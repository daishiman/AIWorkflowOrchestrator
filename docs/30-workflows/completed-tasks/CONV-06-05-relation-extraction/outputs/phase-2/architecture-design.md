# アーキテクチャ設計書 - 関係抽出サービス

## 概要

| 項目       | 内容                          |
| ---------- | ----------------------------- |
| 機能ID     | CONV-06-05                    |
| 機能名     | 関係抽出サービス              |
| 作成日     | 2026-01-07                    |
| バージョン | 1.0                           |
| 参照スキル | clean-architecture-principles |
|            | interface-segregation         |
|            | type-safety-patterns          |
|            | zod-validation                |

---

## 1. レイヤー設計（Clean Architecture）

### 1.1 依存関係図

```
┌──────────────────────────────────────────────────────────┐
│                     Framework Layer                       │
│  - LLM API (Claude, OpenAI)                              │
│  - Database (Repository impl)                            │
└─────────────────────┬────────────────────────────────────┘
                      │ depends on
                      ▼
┌──────────────────────────────────────────────────────────┐
│                 Interface Adapters Layer                  │
│  - LLMRelationExtractor (implements IRelationExtractor)  │
│  - RelationPromptBuilder                                 │
│  - RelationResponseParser                                │
└─────────────────────┬────────────────────────────────────┘
                      │ depends on
                      ▼
┌──────────────────────────────────────────────────────────┐
│                     Use Cases Layer                       │
│  - ExtractionPipeline                                    │
│  - RelationExtractionUseCase                             │
└─────────────────────┬────────────────────────────────────┘
                      │ depends on
                      ▼
┌──────────────────────────────────────────────────────────┐
│                     Entities Layer                        │
│  - IRelationExtractor (interface)                        │
│  - ExtractedRelation (type)                              │
│  - RelationType (enum)                                   │
│  - RelationEvidence (type)                               │
└──────────────────────────────────────────────────────────┘
```

### 1.2 依存関係ルール

| ルール | 説明                                     |
| ------ | ---------------------------------------- |
| 外→内  | 外側のレイヤーは内側に依存可能           |
| 内→外  | 内側は外側に依存不可（依存性逆転を使用） |
| 抽象化 | Entities層で抽象インターフェースを定義   |
| 実装   | Framework/Adapters層で具象クラスを実装   |

### 1.3 依存性逆転の適用

```typescript
// Entities層: 抽象インターフェース定義
// packages/shared/src/services/extraction/interfaces.ts
export interface IRelationExtractor {
  extract(...): Promise<Result<RelationExtractionResult, Error>>;
  extractBatch(...): Promise<Result<BatchRelationExtractionResult, Error>>;
  mergeRelations(...): ExtractedRelation[];
}

// Interface Adapters層: 具象クラス実装
// packages/shared/src/services/extraction/relation-extractor.ts
export class LLMRelationExtractor implements IRelationExtractor {
  constructor(private readonly llmProvider: ILLMProvider) {}
  // 実装...
}
```

---

## 2. インターフェース設計（ISP適用）

### 2.1 IRelationExtractor インターフェース

```typescript
/**
 * 関係抽出インターフェース
 * @description Strategy Pattern for different extraction methods
 */
export interface IRelationExtractor {
  /**
   * 単一チャンクとエンティティから関係を抽出
   * @param chunk 対象チャンク
   * @param entities チャンクから抽出されたエンティティ
   * @param options 抽出オプション（任意）
   * @returns 関係抽出結果またはエラー
   */
  extract(
    chunk: Chunk,
    entities: ExtractedEntity[],
    options?: RelationExtractionOptionsInput,
  ): Promise<Result<RelationExtractionResult, Error>>;

  /**
   * 複数チャンクから一括で関係を抽出
   * @param chunks 対象チャンク配列
   * @param entitiesByChunk チャンクIDをキーとしたエンティティマップ
   * @param options 抽出オプション（任意）
   * @returns バッチ抽出結果またはエラー
   */
  extractBatch(
    chunks: Chunk[],
    entitiesByChunk: Map<string, ExtractedEntity[]>,
    options?: RelationExtractionOptionsInput,
  ): Promise<Result<BatchRelationExtractionResult, Error>>;

  /**
   * 複数の抽出結果から関係をマージ
   * @description 同一のsource-target-typeを持つ関係を統合
   * @param results マージ対象の抽出結果配列
   * @returns マージ済みの関係配列
   */
  mergeRelations(results: RelationExtractionResult[]): ExtractedRelation[];
}
```

### 2.2 責務分離の検討

#### IEntityExtractor との比較

| 機能         | IEntityExtractor        | IRelationExtractor               |
| ------------ | ----------------------- | -------------------------------- |
| extract      | チャンク → エンティティ | チャンク+エンティティ → 関係     |
| extractBatch | 複数チャンク            | 複数チャンク+エンティティマップ  |
| merge        | エンティティマージ      | 関係マージ（エビデンス集約含む） |

#### ISP原則の適用判断

**結論**: 単一インターフェースで適切

**理由**:

1. メソッド数が3つで肥大化していない
2. すべてのメソッドは「関係抽出」という単一責務
3. クライアント（ExtractionPipeline）は全メソッドを使用
4. 役割ベースの分離（IExtractable, IMergeable）は過剰

---

## 3. 型設計（Type Safety Patterns）

### 3.1 RelationType 列挙型

```typescript
/**
 * 15種類の関係タイプ
 * @description ナレッジグラフで使用する関係の分類
 */
export const RelationTypes = {
  /** 所属関係: A belongs_to B */
  BELONGS_TO: "belongs_to",
  /** 一般的な関連: A related_to B */
  RELATED_TO: "related_to",
  /** 因果関係: A causes B */
  CAUSES: "causes",
  /** 依存関係: A depends_on B */
  DEPENDS_ON: "depends_on",
  /** 作成者: A created_by B */
  CREATED_BY: "created_by",
  /** 使用関係: A uses B */
  USES: "uses",
  /** 部分-全体: A part_of B */
  PART_OF: "part_of",
  /** 位置関係: A located_in B */
  LOCATED_IN: "located_in",
  /** 後継: A succeeds B */
  SUCCEEDS: "succeeds",
  /** 先行: A precedes B */
  PRECEDES: "precedes",
  /** 競合関係: A competes_with B */
  COMPETES_WITH: "competes_with",
  /** 協力関係: A collaborates_with B */
  COLLABORATES_WITH: "collaborates_with",
  /** 実装: A implements B */
  IMPLEMENTS: "implements",
  /** 拡張: A extends B */
  EXTENDS: "extends",
  /** その他: 分類困難な関係 */
  OTHER: "other",
} as const;

export type RelationType = (typeof RelationTypes)[keyof typeof RelationTypes];
```

### 3.2 RelationEvidence 型

```typescript
/**
 * 関係のエビデンス（証拠）
 * @description 関係を示すテキストと位置情報
 */
export interface RelationEvidence {
  /** エビデンスが含まれるチャンクID */
  chunkId: string;
  /** 関係を示す原文テキスト */
  text: string;
  /** テキスト開始位置 */
  startPosition: number;
  /** テキスト終了位置 */
  endPosition: number;
}
```

### 3.3 ExtractedRelation 型

```typescript
/**
 * 抽出された関係
 * @description エンティティ間の関係とメタデータ
 */
export interface ExtractedRelation {
  /** 関係の起点エンティティ名（正規化済み） */
  sourceEntity: string;
  /** 関係の終点エンティティ名（正規化済み） */
  targetEntity: string;
  /** 関係タイプ */
  relationType: RelationType;
  /** 関係の説明（任意） */
  description?: string;
  /** 関係を示すエビデンス配列 */
  evidence: RelationEvidence[];
  /** 信頼度スコア (0.0-1.0) */
  confidence: number;
  /** 双方向関係フラグ */
  bidirectional: boolean;
  /** 追加属性（任意） */
  attributes?: Record<string, unknown>;
}
```

### 3.4 RelationExtractionOptions 型

```typescript
/**
 * 関係抽出オプション
 * @description 抽出処理のカスタマイズ設定
 */
export interface RelationExtractionOptions {
  /** 抽出する関係タイプの制限（指定時のみ抽出） */
  types?: RelationType[];
  /** 最小信頼度閾値 (0.0-1.0) */
  minConfidence: number;
  /** チャンクあたりの最大関係数 */
  maxRelationsPerChunk: number;
  /** エビデンス抽出を有効化 */
  extractEvidence: boolean;
  /** 双方向関係の検出を有効化 */
  detectBidirectional: boolean;
  /** LLM使用フラグ */
  useLLM: boolean;
  /** 最大リトライ回数 */
  maxRetries: number;
}
```

### 3.5 結果型

```typescript
/**
 * 単一チャンクの関係抽出結果
 */
export interface RelationExtractionResult {
  /** 抽出された関係配列 */
  relations: ExtractedRelation[];
  /** 処理対象チャンクID */
  chunkId: string;
  /** 処理時間（ミリ秒） */
  processingTimeMs: number;
  /** 使用したモデルID */
  modelUsed: string;
}

/**
 * バッチ関係抽出結果
 */
export interface BatchRelationExtractionResult {
  /** 各チャンクの抽出結果 */
  results: RelationExtractionResult[];
  /** 抽出された総関係数（マージ前） */
  totalRelations: number;
  /** 重複除去後の関係数 */
  uniqueRelations: number;
  /** 総処理時間（ミリ秒） */
  processingTimeMs: number;
}
```

---

## 4. Zodスキーマ設計

### 4.1 RelationType スキーマ

```typescript
import { z } from "zod";

/**
 * 関係タイプZodスキーマ
 * @description LLM応答のバリデーション用
 */
export const RelationTypeSchema = z.enum([
  "belongs_to",
  "related_to",
  "causes",
  "depends_on",
  "created_by",
  "uses",
  "part_of",
  "located_in",
  "succeeds",
  "precedes",
  "competes_with",
  "collaborates_with",
  "implements",
  "extends",
  "other",
]);
```

### 4.2 RelationEvidence スキーマ

```typescript
/**
 * エビデンスZodスキーマ
 */
export const RelationEvidenceSchema = z.object({
  chunkId: z.string().min(1),
  text: z.string().min(1).max(500),
  startPosition: z.number().int().nonnegative(),
  endPosition: z.number().int().nonnegative(),
});

export type RelationEvidence = z.infer<typeof RelationEvidenceSchema>;
```

### 4.3 ExtractedRelation スキーマ

```typescript
/**
 * 抽出関係Zodスキーマ
 */
export const ExtractedRelationSchema = z.object({
  sourceEntity: z.string().min(1),
  targetEntity: z.string().min(1),
  relationType: RelationTypeSchema,
  description: z.string().max(500).optional(),
  evidence: z.array(RelationEvidenceSchema).default([]),
  confidence: z.number().min(0).max(1),
  bidirectional: z.boolean().default(false),
  attributes: z.record(z.string(), z.unknown()).optional(),
});

export type ExtractedRelation = z.infer<typeof ExtractedRelationSchema>;
```

### 4.4 RelationExtractionOptions スキーマ

```typescript
/**
 * 抽出オプションZodスキーマ
 * @description デフォルト値付きバリデーション
 */
export const RelationExtractionOptionsSchema = z.object({
  types: z.array(RelationTypeSchema).optional(),
  minConfidence: z.number().min(0).max(1).default(0.5),
  maxRelationsPerChunk: z.number().int().positive().default(30),
  extractEvidence: z.boolean().default(true),
  detectBidirectional: z.boolean().default(true),
  useLLM: z.boolean().default(true),
  maxRetries: z.number().int().nonnegative().default(3),
});

/** 入力型（部分的指定可能） */
export type RelationExtractionOptionsInput = z.input<
  typeof RelationExtractionOptionsSchema
>;

/** 出力型（デフォルト適用後） */
export type RelationExtractionOptions = z.infer<
  typeof RelationExtractionOptionsSchema
>;
```

### 4.5 結果スキーマ

```typescript
/**
 * 関係抽出結果Zodスキーマ
 */
export const RelationExtractionResultSchema = z.object({
  relations: z.array(ExtractedRelationSchema),
  chunkId: z.string(),
  processingTimeMs: z.number().nonnegative(),
  modelUsed: z.string(),
});

export type RelationExtractionResult = z.infer<
  typeof RelationExtractionResultSchema
>;

/**
 * バッチ抽出結果Zodスキーマ
 */
export const BatchRelationExtractionResultSchema = z.object({
  results: z.array(RelationExtractionResultSchema),
  totalRelations: z.number().int().nonnegative(),
  uniqueRelations: z.number().int().nonnegative(),
  processingTimeMs: z.number().nonnegative(),
});

export type BatchRelationExtractionResult = z.infer<
  typeof BatchRelationExtractionResultSchema
>;
```

### 4.6 LLM応答スキーマ（内部使用）

```typescript
/**
 * LLM応答パースZodスキーマ
 * @description LLMからの非正規化応答をバリデーション
 */
export const LLMRelationResponseSchema = z.object({
  relations: z.array(
    z.object({
      sourceEntity: z.string(),
      targetEntity: z.string(),
      relationType: z.string(),
      description: z.string().optional(),
      confidence: z.number().optional(),
      bidirectional: z.boolean().optional(),
      evidence: z
        .object({
          text: z.string(),
          startPosition: z.number().optional(),
          endPosition: z.number().optional(),
        })
        .optional(),
    }),
  ),
});

export type LLMRelationResponse = z.infer<typeof LLMRelationResponseSchema>;
```

---

## 5. デフォルト値定義

```typescript
/**
 * デフォルト抽出オプション
 */
export const DEFAULT_RELATION_EXTRACTION_OPTIONS: Required<
  Omit<RelationExtractionOptions, "types">
> = {
  minConfidence: 0.5,
  maxRelationsPerChunk: 30,
  extractEvidence: true,
  detectBidirectional: true,
  useLLM: true,
  maxRetries: 3,
};

/**
 * 双方向関係タイプ
 * @description これらのタイプはデフォルトでbidirectional=true
 */
export const BIDIRECTIONAL_RELATION_TYPES: RelationType[] = [
  "related_to",
  "competes_with",
  "collaborates_with",
];
```

---

## 6. 統合設計

### 6.1 ExtractionPipelineとの連携

```typescript
interface ExtractionPipelineFlow {
  // Step 1: チャンク受け取り
  input: Chunk[];

  // Step 2: エンティティ抽出
  entityExtraction: {
    extractor: IEntityExtractor;
    result: BatchExtractionResult;
  };

  // Step 3: エンティティマップ作成
  entityMapping: Map<string, ExtractedEntity[]>;

  // Step 4: 関係抽出
  relationExtraction: {
    extractor: IRelationExtractor;
    result: BatchRelationExtractionResult;
  };

  // Step 5: マージ・正規化
  merge: {
    entities: ExtractedEntity[];
    relations: ExtractedRelation[];
  };

  // Step 6: DB保存
  persistence: {
    entityRepository: IEntityRepository;
    relationRepository: IRelationRepository;
  };
}
```

### 6.2 ILLMProviderとの連携

```typescript
// LLMRelationExtractorの依存性注入
class LLMRelationExtractor implements IRelationExtractor {
  constructor(
    private readonly llmProvider: ILLMProvider,
    private readonly promptBuilder: RelationPromptBuilder,
  ) {}

  async extract(
    chunk: Chunk,
    entities: ExtractedEntity[],
    options?: RelationExtractionOptionsInput,
  ): Promise<Result<RelationExtractionResult, Error>> {
    // 1. オプションのデフォルト適用
    const opts = RelationExtractionOptionsSchema.parse(options ?? {});

    // 2. プロンプト構築
    const prompt = this.promptBuilder.build(chunk, entities, opts);

    // 3. LLM呼び出し
    const llmResult = await this.llmProvider.generate(prompt, {
      responseFormat: "json",
    });

    // 4. 応答パース・バリデーション
    // 5. 結果変換・返却
  }
}
```

---

## 7. ファイル構成

### 7.1 追加・変更ファイル

| ファイル                                                             | 変更内容                 |
| -------------------------------------------------------------------- | ------------------------ |
| `packages/shared/src/services/extraction/types.ts`                   | 関係抽出型・スキーマ追加 |
| `packages/shared/src/services/extraction/interfaces.ts`              | IRelationExtractor追加   |
| `packages/shared/src/services/extraction/relation-extractor.ts`      | LLMRelationExtractor実装 |
| `packages/shared/src/services/extraction/prompts/relation-prompt.ts` | プロンプトテンプレート   |

### 7.2 型エクスポート

```typescript
// packages/shared/src/services/extraction/index.ts
export type {
  RelationType,
  RelationEvidence,
  ExtractedRelation,
  RelationExtractionOptions,
  RelationExtractionOptionsInput,
  RelationExtractionResult,
  BatchRelationExtractionResult,
} from "./types";

export {
  RelationTypes,
  RelationTypeSchema,
  RelationEvidenceSchema,
  ExtractedRelationSchema,
  RelationExtractionOptionsSchema,
  RelationExtractionResultSchema,
  BatchRelationExtractionResultSchema,
  DEFAULT_RELATION_EXTRACTION_OPTIONS,
  BIDIRECTIONAL_RELATION_TYPES,
} from "./types";

export type { IRelationExtractor } from "./interfaces";
export { LLMRelationExtractor } from "./relation-extractor";
```

---

## 8. 設計レビューチェックリスト

### 8.1 Clean Architecture

- [x] 依存関係が外→内になっている
- [x] Entities層で抽象インターフェースを定義
- [x] Framework依存がInterface Adapters層に局所化
- [x] 依存性逆転でLLMProvider注入

### 8.2 インターフェース分離原則

- [x] インターフェースが単一責務（関係抽出）
- [x] メソッド数が適切（3メソッド）
- [x] クライアントが全メソッドを使用
- [x] 過剰な分離を回避

### 8.3 型安全性

- [x] strict modeで動作
- [x] any型を使用していない
- [x] 型推論を活用（z.infer）
- [x] オプション型と必須型を分離

### 8.4 Zodバリデーション

- [x] ランタイムバリデーションスキーマ定義
- [x] デフォルト値を.default()で設定
- [x] LLM応答パース用スキーマ定義
- [x] 入力型と出力型を分離

---

## 9. Phase 2 実行記録

### 使用スキル

- clean-architecture-principles: success
- interface-segregation: success
- type-safety-patterns: success
- zod-validation: success

### 発見事項

- **良かった点**: 既存のIEntityExtractorパターンを参考にすることで一貫した設計が可能
- **問題点**: aiworkflow-requirementsの参照資料（entity-relation-schema.md等）が未作成
- **改善提案**: aiworkflow-requirementsスキルの参照資料を整備

### 次Phaseへの引き継ぎ事項

- Phase 3（設計レビュー）でアーキテクチャ設計の妥当性を検証
- 型定義とZodスキーマのファイル配置をPhase 5で実装

---

## 承認

| 役割         | 氏名 | 日付       | 承認 |
| ------------ | ---- | ---------- | ---- |
| 技術リード   |      | 2026-01-07 | [ ]  |
| アーキテクト |      | 2026-01-07 | [ ]  |
