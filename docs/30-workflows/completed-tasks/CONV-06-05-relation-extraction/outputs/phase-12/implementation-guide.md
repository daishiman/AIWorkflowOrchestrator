# 関係抽出サービス（Relation Extractor）実装ガイド

## 概要

CONV-06-05: 関係抽出サービスの実装ガイド。
このドキュメントは、エンティティ間の関係を抽出するサービスの設計と実装について説明します。

---

# Part 1: 概念的な説明（中学生にもわかる版）

## 関係抽出って何？

想像してみてください。あなたが図書館で本を整理しているとします。

本棚には「太宰治」という作家の本と「人間失格」という小説があります。
この2つの間には「太宰治が人間失格を書いた」という**関係**がありますよね。

**関係抽出**とは、文章を読んで、こうした「誰が」「何を」「どうした」という
つながり（関係）を自動的に見つけ出す技術です。

```
文章: 「太宰治は1948年に人間失格を執筆した」

見つかる関係:
  太宰治 ──────created_by──────> 人間失格
    (作者)                        (作品)
```

## なぜ必要なの？

### 検索がもっと賢くなる

普通の検索:

```
「太宰治」で検索 → 太宰治という文字が含まれるページだけ表示
```

関係抽出を使った検索:

```
「太宰治」で検索 → 太宰治の作品、影響を受けた作家、関連する時代背景も表示
```

### 知識をつなげる

```
               ┌─────────────────┐
               │   人間失格      │
               └────────┬────────┘
                        │ created_by
                        ↓
┌─────────────┐  ┌─────────────┐  ┌─────────────┐
│  津軽       │←─│   太宰治    │─→│  斜陽       │
│  (作品)     │  │  (作家)     │  │  (作品)     │
└─────────────┘  └──────┬──────┘  └─────────────┘
                        │ influenced_by
                        ↓
               ┌─────────────────┐
               │   芥川龍之介    │
               └─────────────────┘
```

このように、バラバラな情報が「知識のネットワーク」として
つながっていきます。これを**ナレッジグラフ**と呼びます。

## どうやって関係を見つけるの？

### ステップ1: エンティティを見つける（前工程）

まず、文章の中から「人」「場所」「物」などの重要な言葉を見つけます。
これは別のサービス（エンティティ抽出）が担当します。

```
入力: 「マイクロソフトはワシントン州に本社がある」

エンティティ:
  - マイクロソフト（組織）
  - ワシントン州（場所）
```

### ステップ2: 関係を見つける（このサービス）

見つかったエンティティの間に、どんな関係があるかを判定します。

```
入力:
  - エンティティ: マイクロソフト、ワシントン州
  - 文章: 「マイクロソフトはワシントン州に本社がある」

出力:
  マイクロソフト ──located_in──> ワシントン州
  (確信度: 0.95)
```

### ステップ3: AI（LLM）に聞く

人間が関係を判断するように、AI（大規模言語モデル）に
「この2つの間にはどんな関係がある？」と質問します。

```
┌─────────────────────────────────────────────────────┐
│ [質問]                                              │
│ 以下の文章とエンティティから関係を抽出してください  │
│                                                     │
│ 文章: マイクロソフトはワシントン州に本社がある      │
│ エンティティ: マイクロソフト、ワシントン州          │
│                                                     │
│ [AIの回答]                                          │
│ {                                                   │
│   "source": "マイクロソフト",                       │
│   "target": "ワシントン州",                         │
│   "relation": "located_in",                         │
│   "confidence": 0.95                                │
│ }                                                   │
└─────────────────────────────────────────────────────┘
```

## 15種類の関係タイプ

| タイプ            | 日本語       | 例                               |
| ----------------- | ------------ | -------------------------------- |
| belongs_to        | 所属している | 「山田さんはA社に所属」          |
| related_to        | 関連している | 「AIは機械学習に関連」           |
| causes            | 原因になる   | 「バグがエラーの原因」           |
| depends_on        | 依存している | 「ReactはJavaScriptに依存」      |
| created_by        | 作られた     | 「TypeScriptはMicrosoftが作成」  |
| uses              | 使っている   | 「Next.jsはReactを使用」         |
| part_of           | 一部である   | 「章は本の一部」                 |
| located_in        | 場所にある   | 「Googleはカリフォルニアにある」 |
| succeeds          | 後継である   | 「Python 3はPython 2の後継」     |
| precedes          | 先行している | 「HTMLはHTML5より前」            |
| competes_with     | 競合している | 「ReactはVueと競合」             |
| collaborates_with | 協力している | 「OpenAIはMicrosoftと協力」      |
| implements        | 実装している | 「ExpressはHTTPサーバーを実装」  |
| extends           | 拡張している | 「TypeScriptはJavaScriptを拡張」 |
| other             | その他       | 分類が難しい関係                 |

---

# Part 2: 技術的な詳細（開発者向け）

## 全体アーキテクチャ

```
┌─────────────────────────────────────────────────────────────────┐
│                     ExtractionPipeline                          │
│  ┌─────────────────┐    ┌─────────────────┐                    │
│  │ EntityExtractor │───>│ RelationExtractor│                    │
│  │   (前工程)      │    │   (このサービス) │                    │
│  └────────┬────────┘    └────────┬────────┘                    │
│           │                      │                              │
│           ↓                      ↓                              │
│  ┌─────────────────┐    ┌─────────────────┐                    │
│  │  EntityRepo     │    │  RelationRepo   │                    │
│  │  (永続化層)     │    │  (永続化層)     │                    │
│  └─────────────────┘    └─────────────────┘                    │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ↓
              ┌───────────────────────────────┐
              │         LLM Provider          │
              │  (OpenAI / Anthropic / etc.)  │
              └───────────────────────────────┘
```

### レイヤー構造

```
┌────────────────────────────────────────────────────┐
│             Application Layer (Use Cases)          │
│  - ExtractionPipeline                              │
│  - RelationExtractionUseCase                       │
├────────────────────────────────────────────────────┤
│             Domain Layer (Business Logic)          │
│  - IRelationExtractor (Interface)                  │
│  - ExtractedRelation (Entity)                      │
│  - RelationType (Value Object)                     │
├────────────────────────────────────────────────────┤
│          Infrastructure Layer (External)           │
│  - LLMRelationExtractor (Implementation)           │
│  - RelationRepository (Persistence)                │
│  - OpenAIProvider / AnthropicProvider              │
└────────────────────────────────────────────────────┘
```

## インターフェース設計

### IRelationExtractor（リレーション・エクストラクター）

関係抽出の抽象インターフェース。依存関係逆転の原則（DIP）に従い、
上位層はこのインターフェースにのみ依存する。

```typescript
// packages/shared/src/services/extraction/interfaces.ts

/**
 * IRelationExtractor
 * 関係抽出サービスのインターフェース
 *
 * なぜインターフェース？
 * - LLMプロバイダーを切り替え可能にする（OpenAI, Anthropic, etc.）
 * - テスト時にモックに差し替え可能にする
 * - 将来的にルールベース抽出も同じインターフェースで提供可能
 */
export interface IRelationExtractor {
  /**
   * 単一チャンクから関係を抽出
   *
   * @param chunk - 対象のコンテンツチャンク
   * @param entities - チャンク内のエンティティ一覧
   * @param options - 抽出オプション
   * @returns 抽出結果（Result型でエラーハンドリング）
   */
  extract(
    chunk: ContentChunk,
    entities: ExtractedEntity[],
    options?: RelationExtractionOptions,
  ): Promise<Result<RelationExtractionResult, Error>>;

  /**
   * 複数チャンクを一括処理
   *
   * なぜバッチ処理？
   * - LLM APIコール数を削減（コスト最適化）
   * - 並列処理による高速化
   * - チャンク間の関係も検出可能
   */
  extractBatch(
    chunks: ContentChunk[],
    entitiesByChunk: Map<ChunkId, ExtractedEntity[]>,
    options?: RelationExtractionOptions,
  ): Promise<Result<BatchRelationExtractionResult, Error>>;

  /**
   * 重複した関係をマージ
   *
   * なぜマージが必要？
   * - 複数チャンクで同じ関係が検出される可能性
   * - 信頼度スコアの統合
   * - エビデンスの集約
   */
  mergeRelations(results: RelationExtractionResult[]): ExtractedRelation[];
}
```

### 型設計

```typescript
// packages/shared/src/services/extraction/types.ts

import { z } from "zod";

/**
 * RelationType - 関係タイプの列挙型
 *
 * 15種類の関係タイプを定義。これらは一般的な知識グラフで使われる
 * 関係タイプをカバーしている。
 */
export const relationTypeSchema = z.enum([
  "belongs_to", // 所属関係（人→組織）
  "related_to", // 一般的な関連
  "causes", // 因果関係
  "depends_on", // 依存関係（技術的依存）
  "created_by", // 作成者関係
  "uses", // 使用関係
  "part_of", // 部分-全体関係
  "located_in", // 位置関係
  "succeeds", // 後継関係
  "precedes", // 先行関係
  "competes_with", // 競合関係
  "collaborates_with", // 協力関係
  "implements", // 実装関係
  "extends", // 拡張関係
  "other", // その他（分類困難）
]);

export type RelationType = z.infer<typeof relationTypeSchema>;

/**
 * ExtractedRelation - 抽出された関係
 *
 * なぜこの構造？
 * - sourceEntity/targetEntity: 方向を持つ関係を表現
 * - evidence: 根拠となるテキストを保持（説明可能性）
 * - confidence: 確信度でフィルタリング可能に
 * - bidirectional: 双方向関係のフラグ
 */
export const extractedRelationSchema = z.object({
  // 関係の起点エンティティ
  sourceEntity: z.string(),

  // 関係の終点エンティティ
  targetEntity: z.string(),

  // 関係タイプ
  relationType: relationTypeSchema,

  // 関係の説明（任意）
  description: z.string().optional(),

  // エビデンス（根拠となるテキスト）
  evidence: z.array(
    z.object({
      chunkId: z.string(), // 出典チャンクID
      text: z.string(), // 根拠テキスト
      startPosition: z.number(), // 開始位置
      endPosition: z.number(), // 終了位置
    }),
  ),

  // 確信度（0.0〜1.0）
  confidence: z.number().min(0).max(1),

  // 双方向関係フラグ（例: "collaborates_with"）
  bidirectional: z.boolean().default(false),

  // カスタム属性（拡張用）
  attributes: z.record(z.unknown()).optional(),
});

export type ExtractedRelation = z.infer<typeof extractedRelationSchema>;

/**
 * RelationExtractionOptions - 抽出オプション
 */
export interface RelationExtractionOptions {
  // 最小確信度スコア（これ以下は除外）
  minConfidence?: number;

  // 抽出する関係タイプの制限
  allowedRelationTypes?: RelationType[];

  // LLMの温度パラメータ
  temperature?: number;

  // 最大トークン数
  maxTokens?: number;
}

/**
 * RelationExtractionResult - 抽出結果
 */
export interface RelationExtractionResult {
  chunkId: ChunkId;
  relations: ExtractedRelation[];
  metadata: {
    processingTimeMs: number;
    modelUsed: string;
    tokenCount: {
      input: number;
      output: number;
    };
  };
}
```

## 実装パターン

### LLMRelationExtractor

````typescript
// packages/shared/src/services/extraction/relation-extractor.ts

import { Result, ok, err } from "neverthrow";
import type { IRelationExtractor, ILLMProvider } from "./interfaces";
import { extractedRelationSchema } from "./types";

/**
 * LLMRelationExtractor
 * LLMを使用した関係抽出の実装
 *
 * 設計意図:
 * - ILLMProviderに依存（具象クラスには依存しない）
 * - Result型でエラーを明示的に扱う
 * - Zodでランタイムバリデーション
 */
export class LLMRelationExtractor implements IRelationExtractor {
  constructor(
    private readonly llmProvider: ILLMProvider,
    private readonly promptTemplate: RelationPromptTemplate,
  ) {}

  async extract(
    chunk: ContentChunk,
    entities: ExtractedEntity[],
    options?: RelationExtractionOptions,
  ): Promise<Result<RelationExtractionResult, Error>> {
    const startTime = Date.now();

    // エンティティが2つ未満なら関係は存在しない
    if (entities.length < 2) {
      return ok({
        chunkId: chunk.id,
        relations: [],
        metadata: {
          processingTimeMs: Date.now() - startTime,
          modelUsed: this.llmProvider.modelId,
          tokenCount: { input: 0, output: 0 },
        },
      });
    }

    // プロンプト生成
    const prompt = this.promptTemplate.build({
      text: chunk.content,
      entities: entities.map((e) => ({
        name: e.name,
        type: e.type,
      })),
    });

    // LLM呼び出し
    const llmResult = await this.llmProvider.complete(prompt, {
      temperature: options?.temperature ?? 0.1,
      maxTokens: options?.maxTokens ?? 2000,
    });

    if (llmResult.isErr()) {
      return err(llmResult.error);
    }

    // JSON解析とバリデーション
    const parseResult = this.parseAndValidate(llmResult.value.content);
    if (parseResult.isErr()) {
      return err(parseResult.error);
    }

    // 確信度フィルタリング
    const filteredRelations = parseResult.value.filter(
      (r) => r.confidence >= (options?.minConfidence ?? 0.5),
    );

    return ok({
      chunkId: chunk.id,
      relations: filteredRelations,
      metadata: {
        processingTimeMs: Date.now() - startTime,
        modelUsed: this.llmProvider.modelId,
        tokenCount: llmResult.value.usage,
      },
    });
  }

  /**
   * LLM応答のパースとバリデーション
   */
  private parseAndValidate(
    content: string,
  ): Result<ExtractedRelation[], Error> {
    try {
      // JSONブロックを抽出
      const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/);
      const jsonStr = jsonMatch ? jsonMatch[1] : content;

      const parsed = JSON.parse(jsonStr);
      const relations = Array.isArray(parsed) ? parsed : parsed.relations;

      // Zodでバリデーション
      const validated = relations.map((r: unknown) =>
        extractedRelationSchema.parse(r),
      );

      return ok(validated);
    } catch (error) {
      return err(new Error(`Failed to parse LLM response: ${error}`));
    }
  }

  // ... extractBatch, mergeRelations の実装
}
````

## エラーハンドリング

```typescript
// packages/shared/src/services/extraction/errors.ts

/**
 * RelationExtractionError
 * 関係抽出固有のエラー型
 *
 * なぜカスタムエラー？
 * - エラーの種類を明確に分類
 * - エラーハンドリングを容易に
 * - デバッグ情報を保持
 */
export class RelationExtractionError extends Error {
  constructor(
    message: string,
    public readonly code: RelationExtractionErrorCode,
    public readonly cause?: Error,
  ) {
    super(message);
    this.name = "RelationExtractionError";
  }
}

export enum RelationExtractionErrorCode {
  /** LLM API呼び出し失敗 */
  LLM_API_ERROR = "LLM_API_ERROR",

  /** LLM応答のパース失敗 */
  PARSE_ERROR = "PARSE_ERROR",

  /** バリデーション失敗 */
  VALIDATION_ERROR = "VALIDATION_ERROR",

  /** タイムアウト */
  TIMEOUT = "TIMEOUT",

  /** レート制限 */
  RATE_LIMITED = "RATE_LIMITED",
}
```

## テスト戦略

### ユニットテスト

```typescript
// packages/shared/src/services/extraction/__tests__/relation-extractor.test.ts

describe("LLMRelationExtractor", () => {
  describe("extract", () => {
    it("should return empty relations when entities < 2", async () => {
      // Arrange
      const extractor = new LLMRelationExtractor(mockLLMProvider, template);
      const chunk = createMockChunk("Some text");
      const entities = [createMockEntity("Entity1")];

      // Act
      const result = await extractor.extract(chunk, entities);

      // Assert
      expect(result.isOk()).toBe(true);
      expect(result._unsafeUnwrap().relations).toHaveLength(0);
    });

    it("should extract relations from valid LLM response", async () => {
      // Arrange
      mockLLMProvider.complete.mockResolvedValue(
        ok({
          content: JSON.stringify([
            {
              sourceEntity: "TypeScript",
              targetEntity: "JavaScript",
              relationType: "extends",
              confidence: 0.95,
              evidence: [{ chunkId: "1", text: "..." }],
            },
          ]),
          usage: { input: 100, output: 50 },
        }),
      );

      // Act
      const result = await extractor.extract(chunk, entities);

      // Assert
      expect(result.isOk()).toBe(true);
      expect(result._unsafeUnwrap().relations).toHaveLength(1);
      expect(result._unsafeUnwrap().relations[0].relationType).toBe("extends");
    });
  });
});
```

---

## 用語集

| 用語            | 読み方             | 意味                                         |
| --------------- | ------------------ | -------------------------------------------- |
| Entity          | エンティティ       | 文章中の「人」「場所」「物」などの重要な要素 |
| Relation        | リレーション       | エンティティ間のつながり・関係               |
| Extraction      | エクストラクション | 抽出すること                                 |
| Chunk           | チャンク           | 文章を分割した単位                           |
| Confidence      | コンフィデンス     | 確信度（0〜1の値）                           |
| Evidence        | エビデンス         | 根拠・証拠となるテキスト                     |
| Knowledge Graph | ナレッジグラフ     | 知識をグラフ構造で表現したもの               |
| LLM             | エルエルエム       | 大規模言語モデル（GPT, Claude等）            |
| DIP             | ディップ           | 依存関係逆転の原則                           |
| Zod             | ゾッド             | TypeScriptのバリデーションライブラリ         |
| Result型        | リザルトがた       | 成功/失敗を型で表現する手法                  |

---

## 参照ドキュメント

- Phase 1: 要件定義 → `outputs/phase-1/requirements-definition.md`
- Phase 2: 設計 → `outputs/phase-2/architecture-design.md`
- エンティティ抽出 → `packages/shared/src/services/extraction/entity-extractor.ts`
- システム仕様 → `.claude/skills/aiworkflow-requirements/references/entity-relation-schema.md`
