# エンティティ抽出サービス (NER) - タスク指示書

## メタ情報

| 項目         | 内容                                    |
| ------------ | --------------------------------------- |
| タスクID     | CONV-06-04                              |
| タスク名     | エンティティ抽出サービス (NER)          |
| 親タスク     | CONV-06 (埋め込み生成パイプライン)      |
| 依存タスク   | CONV-03-04 (エンティティ・関係スキーマ) |
| 規模         | 中                                      |
| 見積もり工数 | 1日                                     |
| ステータス   | 未実施                                  |

---

## 1. 目的

ドキュメントチャンクから重要なエンティティ（人物、組織、概念、技術等）を抽出するサービスを実装する。Knowledge Graph構築の基盤となる。

---

## 2. 成果物

- `packages/shared/src/services/extraction/entity-extractor.ts`
- `packages/shared/src/services/extraction/types.ts`
- `packages/shared/src/services/extraction/prompts/entity-extraction-prompt.ts`
- `packages/shared/src/services/extraction/__tests__/entity-extractor.test.ts`

---

## 3. 入力

- ドキュメントチャンク（ContentChunk）
- 抽出オプション（エンティティタイプ、最大数）
- LLMプロバイダー設定

---

## 4. 出力

```typescript
// packages/shared/src/services/extraction/types.ts
import { z } from "zod";
import type { EntityId, ChunkId } from "@/types/branded";

export const entityTypeSchema = z.enum([
  "person",
  "organization",
  "location",
  "concept",
  "technology",
  "event",
  "document",
  "product",
  "date",
  "other",
]);
export type EntityType = z.infer<typeof entityTypeSchema>;

export const extractedEntitySchema = z.object({
  name: z.string().min(1),
  normalizedName: z.string().min(1),
  type: entityTypeSchema,
  description: z.string().optional(),
  aliases: z.array(z.string()).default([]),
  mentions: z.array(
    z.object({
      chunkId: z.string(),
      startPosition: z.number(),
      endPosition: z.number(),
      context: z.string(), // 周辺テキスト（前後50文字程度）
    }),
  ),
  confidence: z.number().min(0).max(1),
  attributes: z.record(z.unknown()).optional(),
});

export type ExtractedEntity = z.infer<typeof extractedEntitySchema>;

export interface EntityExtractionOptions {
  /**
   * 抽出するエンティティタイプ（指定しない場合は全タイプ）
   */
  types?: EntityType[];

  /**
   * 1チャンクあたりの最大エンティティ数
   */
  maxEntitiesPerChunk?: number;

  /**
   * 最小信頼度スコア（これ未満は除外）
   */
  minConfidence?: number;

  /**
   * エンティティ名の最小文字数
   */
  minNameLength?: number;

  /**
   * LLMを使用するか（falseの場合はルールベース）
   */
  useLLM?: boolean;

  /**
   * エンティティの説明を生成するか
   */
  generateDescriptions?: boolean;
}

export interface EntityExtractionResult {
  entities: ExtractedEntity[];
  chunkId: ChunkId;
  processingTimeMs: number;
  modelUsed: string;
}

export interface BatchEntityExtractionResult {
  results: EntityExtractionResult[];
  totalEntities: number;
  uniqueEntities: number;
  processingTimeMs: number;
}
```

---

## 5. 実装仕様

### 5.1 エンティティ抽出インターフェース

```typescript
// packages/shared/src/services/extraction/entity-extractor.ts
import type { Result } from "@/types/result";
import type { ContentChunk } from "../chunking/types";

export interface IEntityExtractor {
  /**
   * 単一チャンクからエンティティを抽出
   */
  extract(
    chunk: ContentChunk,
    options?: EntityExtractionOptions,
  ): Promise<Result<EntityExtractionResult, Error>>;

  /**
   * 複数チャンクからバッチ抽出
   */
  extractBatch(
    chunks: ContentChunk[],
    options?: EntityExtractionOptions,
  ): Promise<Result<BatchEntityExtractionResult, Error>>;

  /**
   * 抽出結果をマージ（重複エンティティの統合）
   */
  mergeEntities(results: EntityExtractionResult[]): ExtractedEntity[];
}
```

### 5.2 LLMベースのエンティティ抽出

```typescript
export class LLMEntityExtractor implements IEntityExtractor {
  private readonly defaultOptions: EntityExtractionOptions = {
    maxEntitiesPerChunk: 20,
    minConfidence: 0.5,
    minNameLength: 2,
    useLLM: true,
    generateDescriptions: true,
  };

  constructor(
    private readonly llmProvider: ILLMProvider,
    private readonly entityRepository?: EntityRepository,
  ) {}

  async extract(
    chunk: ContentChunk,
    options?: EntityExtractionOptions,
  ): Promise<Result<EntityExtractionResult, Error>> {
    const startTime = performance.now();
    const mergedOptions = { ...this.defaultOptions, ...options };

    const prompt = this.buildExtractionPrompt(chunk, mergedOptions);

    try {
      const response = await this.llmProvider.generate(prompt, {
        maxTokens: 2000,
        temperature: 0.1, // 低温度で一貫性を確保
        responseFormat: "json",
      });

      if (!response.success) {
        return err(response.error);
      }

      const parsed = this.parseResponse(response.data.text);
      if (!parsed.success) {
        return err(parsed.error);
      }

      // フィルタリングと正規化
      const filteredEntities = this.filterAndNormalize(
        parsed.data,
        chunk,
        mergedOptions,
      );

      return ok({
        entities: filteredEntities,
        chunkId: chunk.id,
        processingTimeMs: performance.now() - startTime,
        modelUsed: this.llmProvider.modelId,
      });
    } catch (error) {
      return err(
        error instanceof Error ? error : new Error("Entity extraction failed"),
      );
    }
  }

  async extractBatch(
    chunks: ContentChunk[],
    options?: EntityExtractionOptions,
  ): Promise<Result<BatchEntityExtractionResult, Error>> {
    const startTime = performance.now();
    const results: EntityExtractionResult[] = [];

    for (const chunk of chunks) {
      const result = await this.extract(chunk, options);
      if (result.success) {
        results.push(result.data);
      }
      // エラーの場合はスキップして継続
    }

    const allEntities = results.flatMap((r) => r.entities);
    const uniqueEntities = this.mergeEntities(results);

    return ok({
      results,
      totalEntities: allEntities.length,
      uniqueEntities: uniqueEntities.length,
      processingTimeMs: performance.now() - startTime,
    });
  }

  mergeEntities(results: EntityExtractionResult[]): ExtractedEntity[] {
    const entityMap = new Map<string, ExtractedEntity>();

    for (const result of results) {
      for (const entity of result.entities) {
        const key = entity.normalizedName.toLowerCase();

        if (entityMap.has(key)) {
          // 既存のエンティティにメンションを追加
          const existing = entityMap.get(key)!;
          existing.mentions.push(...entity.mentions);

          // 信頼度は最大値を採用
          existing.confidence = Math.max(
            existing.confidence,
            entity.confidence,
          );

          // エイリアスをマージ
          const allAliases = new Set([
            ...existing.aliases,
            ...entity.aliases,
            entity.name,
          ]);
          existing.aliases = Array.from(allAliases).filter(
            (a) => a !== existing.name,
          );

          // 説明は長い方を採用
          if (
            entity.description &&
            (!existing.description ||
              entity.description.length > existing.description.length)
          ) {
            existing.description = entity.description;
          }
        } else {
          entityMap.set(key, { ...entity });
        }
      }
    }

    return Array.from(entityMap.values());
  }

  private buildExtractionPrompt(
    chunk: ContentChunk,
    options: EntityExtractionOptions,
  ): string {
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
- other: その他

テキスト:
"""
${chunk.content}
"""

JSON形式で出力してください:
{
  "entities": [
    {
      "name": "エンティティ名（表記通り）",
      "normalizedName": "正規化された名前（英語の場合は小文字、日本語の場合はそのまま）",
      "type": "エンティティタイプ",
      "description": "簡潔な説明（${options.generateDescriptions ? "20-50文字" : "省略可"}）",
      "aliases": ["別名1", "別名2"],
      "confidence": 0.0-1.0の信頼度
    }
  ]
}

注意:
- 最大${options.maxEntitiesPerChunk}個のエンティティを抽出
- 一般的すぎる単語（"システム", "データ"等）は除外
- 固有名詞や専門用語を優先
- 信頼度は文脈からの明確さに基づいて設定`;
  }

  private parseResponse(
    responseText: string,
  ): Result<ExtractedEntity[], Error> {
    try {
      // JSONブロックを抽出
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        return err(new Error("No JSON found in response"));
      }

      const parsed = JSON.parse(jsonMatch[0]);
      const entities = parsed.entities || [];

      // Zodでバリデーション
      const validated = entities.map((e: unknown) =>
        extractedEntitySchema.safeParse({
          ...e,
          mentions: [], // パース時点ではメンションは空
        }),
      );

      const validEntities = validated
        .filter((v: any) => v.success)
        .map((v: any) => v.data);

      return ok(validEntities);
    } catch (error) {
      return err(
        error instanceof Error ? error : new Error("Failed to parse response"),
      );
    }
  }

  private filterAndNormalize(
    entities: ExtractedEntity[],
    chunk: ContentChunk,
    options: EntityExtractionOptions,
  ): ExtractedEntity[] {
    return entities
      .filter((e) => {
        // 最小信頼度
        if (e.confidence < (options.minConfidence ?? 0.5)) return false;

        // 最小名前長
        if (e.name.length < (options.minNameLength ?? 2)) return false;

        // タイプフィルタ
        if (options.types && !options.types.includes(e.type)) return false;

        return true;
      })
      .map((e) => ({
        ...e,
        // メンション情報を追加
        mentions: this.findMentions(e.name, chunk),
      }))
      .slice(0, options.maxEntitiesPerChunk);
  }

  private findMentions(
    entityName: string,
    chunk: ContentChunk,
  ): ExtractedEntity["mentions"] {
    const mentions: ExtractedEntity["mentions"] = [];
    const content = chunk.content;
    const regex = new RegExp(this.escapeRegex(entityName), "gi");

    let match;
    while ((match = regex.exec(content)) !== null) {
      const start = match.index;
      const end = start + match[0].length;

      // 周辺コンテキストを取得（前後50文字）
      const contextStart = Math.max(0, start - 50);
      const contextEnd = Math.min(content.length, end + 50);
      const context = content.slice(contextStart, contextEnd);

      mentions.push({
        chunkId: chunk.id,
        startPosition: start,
        endPosition: end,
        context,
      });
    }

    return mentions;
  }

  private escapeRegex(str: string): string {
    return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }
}
```

### 5.3 ルールベースのエンティティ抽出（フォールバック用）

```typescript
export class RuleBasedEntityExtractor implements IEntityExtractor {
  // 簡易的なパターンマッチングベースの抽出
  private readonly patterns: Map<EntityType, RegExp[]> = new Map([
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

  async extract(
    chunk: ContentChunk,
    options?: EntityExtractionOptions,
  ): Promise<Result<EntityExtractionResult, Error>> {
    const startTime = performance.now();
    const entities: ExtractedEntity[] = [];

    for (const [type, patterns] of this.patterns) {
      if (options?.types && !options.types.includes(type)) continue;

      for (const pattern of patterns) {
        const matches = chunk.content.matchAll(pattern);
        for (const match of matches) {
          const name = match[0];
          const existing = entities.find(
            (e) => e.normalizedName.toLowerCase() === name.toLowerCase(),
          );

          if (!existing) {
            entities.push({
              name,
              normalizedName: name.toLowerCase(),
              type,
              aliases: [],
              mentions: [
                {
                  chunkId: chunk.id,
                  startPosition: match.index ?? 0,
                  endPosition: (match.index ?? 0) + name.length,
                  context: chunk.content.slice(
                    Math.max(0, (match.index ?? 0) - 50),
                    (match.index ?? 0) + name.length + 50,
                  ),
                },
              ],
              confidence: 0.8,
            });
          }
        }
      }
    }

    return ok({
      entities: entities.slice(0, options?.maxEntitiesPerChunk ?? 20),
      chunkId: chunk.id,
      processingTimeMs: performance.now() - startTime,
      modelUsed: "rule-based",
    });
  }

  async extractBatch(
    chunks: ContentChunk[],
    options?: EntityExtractionOptions,
  ): Promise<Result<BatchEntityExtractionResult, Error>> {
    // LLMEntityExtractorと同じ実装
  }

  mergeEntities(results: EntityExtractionResult[]): ExtractedEntity[] {
    // LLMEntityExtractorと同じ実装
  }
}
```

---

## 6. テストケース

```typescript
describe("LLMEntityExtractor", () => {
  it("テキストからエンティティを抽出できる", async () => {
    const extractor = new LLMEntityExtractor(mockLLMProvider);
    const result = await extractor.extract({
      id: "chunk-1" as ChunkId,
      content: "TypeScriptはMicrosoftが開発したプログラミング言語です。",
      // ...
    });

    expect(result.success).toBe(true);
    expect(result.data.entities.length).toBeGreaterThan(0);
    expect(result.data.entities.some((e) => e.name === "TypeScript")).toBe(
      true,
    );
    expect(result.data.entities.some((e) => e.name === "Microsoft")).toBe(true);
  });

  it("指定タイプのみ抽出できる", async () => {
    const extractor = new LLMEntityExtractor(mockLLMProvider);
    const result = await extractor.extract(mockChunk, {
      types: ["technology"],
    });

    expect(result.success).toBe(true);
    expect(result.data.entities.every((e) => e.type === "technology")).toBe(
      true,
    );
  });

  it("信頼度でフィルタリングできる", async () => {
    const extractor = new LLMEntityExtractor(mockLLMProvider);
    const result = await extractor.extract(mockChunk, {
      minConfidence: 0.8,
    });

    expect(result.success).toBe(true);
    expect(result.data.entities.every((e) => e.confidence >= 0.8)).toBe(true);
  });

  it("重複エンティティをマージできる", async () => {
    const extractor = new LLMEntityExtractor(mockLLMProvider);
    const results: EntityExtractionResult[] = [
      {
        entities: [
          {
            name: "TypeScript",
            normalizedName: "typescript",
            type: "technology",
            mentions: [{ chunkId: "1" }],
            confidence: 0.9,
            aliases: [],
          },
        ],
        chunkId: "chunk-1" as ChunkId,
        processingTimeMs: 100,
        modelUsed: "test",
      },
      {
        entities: [
          {
            name: "typescript",
            normalizedName: "typescript",
            type: "technology",
            mentions: [{ chunkId: "2" }],
            confidence: 0.8,
            aliases: ["TS"],
          },
        ],
        chunkId: "chunk-2" as ChunkId,
        processingTimeMs: 100,
        modelUsed: "test",
      },
    ];

    const merged = extractor.mergeEntities(results);

    expect(merged.length).toBe(1);
    expect(merged[0].mentions.length).toBe(2);
    expect(merged[0].confidence).toBe(0.9); // 最大値
    expect(merged[0].aliases).toContain("TS");
  });
});

describe("RuleBasedEntityExtractor", () => {
  it("パターンマッチングでエンティティを抽出できる", async () => {
    const extractor = new RuleBasedEntityExtractor();
    const result = await extractor.extract({
      id: "chunk-1" as ChunkId,
      content: "ReactとVueはJavaScriptフレームワークです。",
      // ...
    });

    expect(result.success).toBe(true);
    expect(result.data.entities.some((e) => e.name === "React")).toBe(true);
    expect(result.data.entities.some((e) => e.name === "Vue")).toBe(true);
  });
});
```

---

## 7. 完了条件

- [ ] `IEntityExtractor`インターフェースが定義済み
- [ ] `LLMEntityExtractor`が実装済み
- [ ] `RuleBasedEntityExtractor`が実装済み（フォールバック用）
- [ ] 単一チャンクからの抽出が動作する
- [ ] バッチ抽出が動作する
- [ ] エンティティタイプでのフィルタリングが動作する
- [ ] 信頼度でのフィルタリングが動作する
- [ ] 重複エンティティのマージが動作する
- [ ] メンション情報の抽出が動作する
- [ ] 全テストがパス
- [ ] TypeScript型エラーなし
- [ ] ESLint警告なし
- [ ] JSDocコメントが記述されている

---

## 8. 次のタスク

- CONV-06-05: 関係抽出サービス

---

## 9. 参照情報

- CONV-03-04: エンティティ・関係スキーマ
- CONV-06: 埋め込み生成パイプライン（親タスク）
- CONV-08: Knowledge Graph構築（利用先）

---

## 10. エンティティタイプ定義

| タイプ       | 説明             | 例                           |
| ------------ | ---------------- | ---------------------------- |
| person       | 人物名           | "Linus Torvalds"             |
| organization | 組織・会社・団体 | "Microsoft", "OpenAI"        |
| location     | 場所・地名       | "東京", "Silicon Valley"     |
| concept      | 概念・理論・手法 | "機械学習", "アジャイル開発" |
| technology   | 技術・ツール     | "TypeScript", "Docker"       |
| event        | イベント・出来事 | "WWDC 2024"                  |
| document     | 文書・規格       | "RFC 7231", "ES2024"         |
| product      | 製品・サービス   | "iPhone", "AWS Lambda"       |
| date         | 日付・時間       | "2024-01-15"                 |
| other        | その他           | 分類困難なエンティティ       |
