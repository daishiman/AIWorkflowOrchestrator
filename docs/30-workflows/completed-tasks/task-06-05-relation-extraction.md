# 関係抽出サービス - タスク指示書

## メタ情報

| 項目         | 内容                               |
| ------------ | ---------------------------------- |
| タスクID     | CONV-06-05                         |
| タスク名     | 関係抽出サービス                   |
| 親タスク     | CONV-06 (埋め込み生成パイプライン) |
| 依存タスク   | CONV-06-04 (エンティティ抽出)      |
| 規模         | 中                                 |
| 見積もり工数 | 1日                                |
| ステータス   | 未実施                             |

---

## 1. 目的

抽出されたエンティティ間の関係性を識別し、Knowledge Graphのエッジを構築するサービスを実装する。

---

## 2. 成果物

- `packages/shared/src/services/extraction/relation-extractor.ts`
- `packages/shared/src/services/extraction/prompts/relation-extraction-prompt.ts`
- `packages/shared/src/services/extraction/__tests__/relation-extractor.test.ts`

---

## 3. 入力

- ドキュメントチャンク（ContentChunk）
- 抽出済みエンティティリスト（ExtractedEntity[]）
- 関係抽出オプション

---

## 4. 出力

```typescript
// packages/shared/src/services/extraction/types.ts（追加）
import { z } from "zod";

export const relationTypeSchema = z.enum([
  "belongs_to", // 所属関係
  "related_to", // 関連
  "causes", // 因果関係
  "depends_on", // 依存関係
  "created_by", // 作成者
  "uses", // 使用関係
  "part_of", // 部分-全体
  "located_in", // 位置関係
  "succeeds", // 継承・後継
  "precedes", // 先行
  "competes_with", // 競合
  "collaborates_with", // 協力
  "implements", // 実装
  "extends", // 拡張
  "other", // その他
]);
export type RelationType = z.infer<typeof relationTypeSchema>;

export const extractedRelationSchema = z.object({
  sourceEntity: z.string(), // 正規化されたエンティティ名
  targetEntity: z.string(), // 正規化されたエンティティ名
  relationType: relationTypeSchema,
  description: z.string().optional(),
  evidence: z.array(
    z.object({
      chunkId: z.string(),
      text: z.string(), // 関係を示すテキスト
      startPosition: z.number(),
      endPosition: z.number(),
    }),
  ),
  confidence: z.number().min(0).max(1),
  bidirectional: z.boolean().default(false),
  attributes: z.record(z.unknown()).optional(),
});

export type ExtractedRelation = z.infer<typeof extractedRelationSchema>;

export interface RelationExtractionOptions {
  /**
   * 抽出する関係タイプ（指定しない場合は全タイプ）
   */
  types?: RelationType[];

  /**
   * 1チャンクあたりの最大関係数
   */
  maxRelationsPerChunk?: number;

  /**
   * 最小信頼度スコア
   */
  minConfidence?: number;

  /**
   * 同一エンティティ間の複数関係を許可するか
   */
  allowMultipleRelations?: boolean;

  /**
   * LLMを使用するか
   */
  useLLM?: boolean;
}

export interface RelationExtractionResult {
  relations: ExtractedRelation[];
  chunkId: ChunkId;
  entityCount: number;
  processingTimeMs: number;
  modelUsed: string;
}

export interface BatchRelationExtractionResult {
  results: RelationExtractionResult[];
  totalRelations: number;
  uniqueRelations: number;
  processingTimeMs: number;
}
```

---

## 5. 実装仕様

### 5.1 関係抽出インターフェース

```typescript
// packages/shared/src/services/extraction/relation-extractor.ts
import type { Result } from "@/types/result";
import type { ContentChunk } from "../chunking/types";

export interface IRelationExtractor {
  /**
   * チャンクとエンティティから関係を抽出
   */
  extract(
    chunk: ContentChunk,
    entities: ExtractedEntity[],
    options?: RelationExtractionOptions,
  ): Promise<Result<RelationExtractionResult, Error>>;

  /**
   * バッチ抽出
   */
  extractBatch(
    chunks: ContentChunk[],
    entitiesByChunk: Map<ChunkId, ExtractedEntity[]>,
    options?: RelationExtractionOptions,
  ): Promise<Result<BatchRelationExtractionResult, Error>>;

  /**
   * 関係のマージ（重複の統合）
   */
  mergeRelations(results: RelationExtractionResult[]): ExtractedRelation[];
}
```

### 5.2 LLMベースの関係抽出

```typescript
export class LLMRelationExtractor implements IRelationExtractor {
  private readonly defaultOptions: RelationExtractionOptions = {
    maxRelationsPerChunk: 30,
    minConfidence: 0.5,
    allowMultipleRelations: true,
    useLLM: true,
  };

  constructor(private readonly llmProvider: ILLMProvider) {}

  async extract(
    chunk: ContentChunk,
    entities: ExtractedEntity[],
    options?: RelationExtractionOptions,
  ): Promise<Result<RelationExtractionResult, Error>> {
    const startTime = performance.now();
    const mergedOptions = { ...this.defaultOptions, ...options };

    // エンティティが2つ未満の場合は関係なし
    if (entities.length < 2) {
      return ok({
        relations: [],
        chunkId: chunk.id,
        entityCount: entities.length,
        processingTimeMs: performance.now() - startTime,
        modelUsed: this.llmProvider.modelId,
      });
    }

    const prompt = this.buildExtractionPrompt(chunk, entities, mergedOptions);

    try {
      const response = await this.llmProvider.generate(prompt, {
        maxTokens: 3000,
        temperature: 0.1,
        responseFormat: "json",
      });

      if (!response.success) {
        return err(response.error);
      }

      const parsed = this.parseResponse(response.data.text, chunk);
      if (!parsed.success) {
        return err(parsed.error);
      }

      // フィルタリングとバリデーション
      const validRelations = this.filterAndValidate(
        parsed.data,
        entities,
        mergedOptions,
      );

      return ok({
        relations: validRelations,
        chunkId: chunk.id,
        entityCount: entities.length,
        processingTimeMs: performance.now() - startTime,
        modelUsed: this.llmProvider.modelId,
      });
    } catch (error) {
      return err(
        error instanceof Error
          ? error
          : new Error("Relation extraction failed"),
      );
    }
  }

  async extractBatch(
    chunks: ContentChunk[],
    entitiesByChunk: Map<ChunkId, ExtractedEntity[]>,
    options?: RelationExtractionOptions,
  ): Promise<Result<BatchRelationExtractionResult, Error>> {
    const startTime = performance.now();
    const results: RelationExtractionResult[] = [];

    for (const chunk of chunks) {
      const entities = entitiesByChunk.get(chunk.id) ?? [];
      const result = await this.extract(chunk, entities, options);

      if (result.success) {
        results.push(result.data);
      }
    }

    const allRelations = results.flatMap((r) => r.relations);
    const uniqueRelations = this.mergeRelations(results);

    return ok({
      results,
      totalRelations: allRelations.length,
      uniqueRelations: uniqueRelations.length,
      processingTimeMs: performance.now() - startTime,
    });
  }

  mergeRelations(results: RelationExtractionResult[]): ExtractedRelation[] {
    const relationMap = new Map<string, ExtractedRelation>();

    for (const result of results) {
      for (const relation of result.relations) {
        // キーを作成（source-target-type）
        const key = this.getRelationKey(relation);

        if (relationMap.has(key)) {
          // 既存の関係にエビデンスを追加
          const existing = relationMap.get(key)!;
          existing.evidence.push(...relation.evidence);

          // 信頼度は最大値を採用
          existing.confidence = Math.max(
            existing.confidence,
            relation.confidence,
          );

          // 説明は長い方を採用
          if (
            relation.description &&
            (!existing.description ||
              relation.description.length > existing.description.length)
          ) {
            existing.description = relation.description;
          }
        } else {
          relationMap.set(key, { ...relation });
        }
      }
    }

    return Array.from(relationMap.values());
  }

  private getRelationKey(relation: ExtractedRelation): string {
    // 双方向関係の場合はソート
    if (relation.bidirectional) {
      const sorted = [relation.sourceEntity, relation.targetEntity].sort();
      return `${sorted[0]}-${sorted[1]}-${relation.relationType}`;
    }
    return `${relation.sourceEntity}-${relation.targetEntity}-${relation.relationType}`;
  }

  private buildExtractionPrompt(
    chunk: ContentChunk,
    entities: ExtractedEntity[],
    options: RelationExtractionOptions,
  ): string {
    const entityList = entities
      .map((e) => `- ${e.name} (${e.type})`)
      .join("\n");

    const typesHint = options.types
      ? `抽出する関係タイプ: ${options.types.join(", ")}`
      : "全ての関係タイプを抽出";

    return `以下のテキストとエンティティリストから、エンティティ間の関係を抽出してください。

${typesHint}

関係タイプの定義:
- belongs_to: 所属関係（AはBに所属）
- related_to: 一般的な関連
- causes: 因果関係（AがBを引き起こす）
- depends_on: 依存関係（AはBに依存）
- created_by: 作成者（AはBによって作成）
- uses: 使用関係（AはBを使用）
- part_of: 部分-全体（AはBの一部）
- located_in: 位置関係（AはBに位置）
- succeeds: 後継（AはBの後継）
- precedes: 先行（AはBに先行）
- competes_with: 競合関係
- collaborates_with: 協力関係
- implements: 実装（AはBを実装）
- extends: 拡張（AはBを拡張）
- other: その他

エンティティリスト:
${entityList}

テキスト:
"""
${chunk.content}
"""

JSON形式で出力してください:
{
  "relations": [
    {
      "sourceEntity": "エンティティ名（正規化）",
      "targetEntity": "エンティティ名（正規化）",
      "relationType": "関係タイプ",
      "description": "関係の説明（20-50文字）",
      "evidenceText": "関係を示すテキスト（原文から抽出）",
      "confidence": 0.0-1.0の信頼度,
      "bidirectional": true/false
    }
  ]
}

注意:
- 最大${options.maxRelationsPerChunk}個の関係を抽出
- テキストに明示的または暗示的に示されている関係のみ
- 推測による関係は低い信頼度で
- evidenceTextは原文から直接引用`;
  }

  private parseResponse(
    responseText: string,
    chunk: ContentChunk,
  ): Result<ExtractedRelation[], Error> {
    try {
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        return err(new Error("No JSON found in response"));
      }

      const parsed = JSON.parse(jsonMatch[0]);
      const relations = parsed.relations || [];

      const extractedRelations: ExtractedRelation[] = relations.map(
        (r: any) => ({
          sourceEntity: r.sourceEntity?.toLowerCase() ?? "",
          targetEntity: r.targetEntity?.toLowerCase() ?? "",
          relationType: r.relationType ?? "related_to",
          description: r.description,
          evidence: r.evidenceText
            ? [
                {
                  chunkId: chunk.id,
                  text: r.evidenceText,
                  startPosition: chunk.content.indexOf(r.evidenceText),
                  endPosition:
                    chunk.content.indexOf(r.evidenceText) +
                    r.evidenceText.length,
                },
              ]
            : [],
          confidence: r.confidence ?? 0.5,
          bidirectional: r.bidirectional ?? false,
        }),
      );

      return ok(extractedRelations);
    } catch (error) {
      return err(
        error instanceof Error ? error : new Error("Failed to parse response"),
      );
    }
  }

  private filterAndValidate(
    relations: ExtractedRelation[],
    entities: ExtractedEntity[],
    options: RelationExtractionOptions,
  ): ExtractedRelation[] {
    const entityNames = new Set(
      entities.map((e) => e.normalizedName.toLowerCase()),
    );

    return relations
      .filter((r) => {
        // エンティティが存在するか
        if (
          !entityNames.has(r.sourceEntity) ||
          !entityNames.has(r.targetEntity)
        ) {
          return false;
        }

        // 自己参照を除外
        if (r.sourceEntity === r.targetEntity) {
          return false;
        }

        // 最小信頼度
        if (r.confidence < (options.minConfidence ?? 0.5)) {
          return false;
        }

        // タイプフィルタ
        if (options.types && !options.types.includes(r.relationType)) {
          return false;
        }

        return true;
      })
      .slice(0, options.maxRelationsPerChunk);
  }
}
```

### 5.3 グラフ構築との統合

```typescript
// packages/shared/src/services/extraction/extraction-pipeline.ts
export class ExtractionPipeline {
  constructor(
    private readonly entityExtractor: IEntityExtractor,
    private readonly relationExtractor: IRelationExtractor,
    private readonly entityRepository: EntityRepository,
    private readonly relationRepository: RelationRepository,
  ) {}

  async process(
    chunks: ContentChunk[],
    options?: {
      entity?: EntityExtractionOptions;
      relation?: RelationExtractionOptions;
    },
  ): Promise<Result<ExtractionPipelineResult, Error>> {
    const startTime = performance.now();

    // 1. エンティティ抽出
    const entityResult = await this.entityExtractor.extractBatch(
      chunks,
      options?.entity,
    );

    if (!entityResult.success) {
      return err(entityResult.error);
    }

    // 2. チャンクごとのエンティティマップを作成
    const entitiesByChunk = new Map<ChunkId, ExtractedEntity[]>();
    for (const result of entityResult.data.results) {
      entitiesByChunk.set(result.chunkId, result.entities);
    }

    // 3. 関係抽出
    const relationResult = await this.relationExtractor.extractBatch(
      chunks,
      entitiesByChunk,
      options?.relation,
    );

    if (!relationResult.success) {
      return err(relationResult.error);
    }

    // 4. マージと正規化
    const mergedEntities = this.entityExtractor.mergeEntities(
      entityResult.data.results,
    );
    const mergedRelations = this.relationExtractor.mergeRelations(
      relationResult.data.results,
    );

    // 5. DB保存
    await this.entityRepository.bulkUpsert(mergedEntities);
    await this.relationRepository.bulkUpsert(mergedRelations);

    return ok({
      entities: mergedEntities,
      relations: mergedRelations,
      processingTimeMs: performance.now() - startTime,
    });
  }
}
```

---

## 6. テストケース

```typescript
describe("LLMRelationExtractor", () => {
  it("エンティティ間の関係を抽出できる", async () => {
    const extractor = new LLMRelationExtractor(mockLLMProvider);
    const entities: ExtractedEntity[] = [
      { name: "TypeScript", normalizedName: "typescript", type: "technology", ... },
      { name: "Microsoft", normalizedName: "microsoft", type: "organization", ... },
    ];

    const result = await extractor.extract(
      {
        id: "chunk-1" as ChunkId,
        content: "TypeScriptはMicrosoftによって開発されたプログラミング言語です。",
      },
      entities
    );

    expect(result.success).toBe(true);
    expect(result.data.relations.length).toBeGreaterThan(0);
    expect(result.data.relations[0].relationType).toBe("created_by");
  });

  it("エンティティが2つ未満の場合は空を返す", async () => {
    const extractor = new LLMRelationExtractor(mockLLMProvider);
    const result = await extractor.extract(mockChunk, [mockEntity]);

    expect(result.success).toBe(true);
    expect(result.data.relations.length).toBe(0);
  });

  it("指定タイプのみ抽出できる", async () => {
    const extractor = new LLMRelationExtractor(mockLLMProvider);
    const result = await extractor.extract(mockChunk, mockEntities, {
      types: ["uses", "depends_on"],
    });

    expect(result.success).toBe(true);
    expect(
      result.data.relations.every((r) =>
        ["uses", "depends_on"].includes(r.relationType)
      )
    ).toBe(true);
  });

  it("重複関係をマージできる", async () => {
    const extractor = new LLMRelationExtractor(mockLLMProvider);
    const results: RelationExtractionResult[] = [
      {
        relations: [{
          sourceEntity: "typescript",
          targetEntity: "microsoft",
          relationType: "created_by",
          evidence: [{ chunkId: "1", text: "...", startPosition: 0, endPosition: 10 }],
          confidence: 0.9,
          bidirectional: false,
        }],
        chunkId: "chunk-1" as ChunkId,
        entityCount: 2,
        processingTimeMs: 100,
        modelUsed: "test",
      },
      {
        relations: [{
          sourceEntity: "typescript",
          targetEntity: "microsoft",
          relationType: "created_by",
          evidence: [{ chunkId: "2", text: "...", startPosition: 0, endPosition: 10 }],
          confidence: 0.8,
          bidirectional: false,
        }],
        chunkId: "chunk-2" as ChunkId,
        entityCount: 2,
        processingTimeMs: 100,
        modelUsed: "test",
      },
    ];

    const merged = extractor.mergeRelations(results);

    expect(merged.length).toBe(1);
    expect(merged[0].evidence.length).toBe(2);
    expect(merged[0].confidence).toBe(0.9);
  });
});

describe("ExtractionPipeline", () => {
  it("エンティティと関係を一括抽出できる", async () => {
    const pipeline = new ExtractionPipeline(
      mockEntityExtractor,
      mockRelationExtractor,
      mockEntityRepo,
      mockRelationRepo
    );

    const result = await pipeline.process(mockChunks);

    expect(result.success).toBe(true);
    expect(result.data.entities.length).toBeGreaterThan(0);
    expect(result.data.relations.length).toBeGreaterThan(0);
    expect(mockEntityRepo.bulkUpsert).toHaveBeenCalled();
    expect(mockRelationRepo.bulkUpsert).toHaveBeenCalled();
  });
});
```

---

## 7. 完了条件

- [ ] `IRelationExtractor`インターフェースが定義済み
- [ ] `LLMRelationExtractor`が実装済み
- [ ] 単一チャンクからの関係抽出が動作する
- [ ] バッチ抽出が動作する
- [ ] 関係タイプでのフィルタリングが動作する
- [ ] 信頼度でのフィルタリングが動作する
- [ ] 重複関係のマージが動作する
- [ ] エビデンス情報の抽出が動作する
- [ ] `ExtractionPipeline`による統合処理が動作する
- [ ] 全テストがパス
- [ ] TypeScript型エラーなし
- [ ] ESLint警告なし
- [ ] JSDocコメントが記述されている

---

## 8. 次のタスク

- CONV-08-01: Knowledge Graph ストア実装

---

## 9. 参照情報

- CONV-03-04: エンティティ・関係スキーマ
- CONV-06-04: エンティティ抽出サービス
- CONV-06: 埋め込み生成パイプライン（親タスク）
- CONV-08: Knowledge Graph構築（利用先）

---

## 10. 関係タイプ定義

| タイプ            | 説明         | 例                                   |
| ----------------- | ------------ | ------------------------------------ |
| belongs_to        | 所属関係     | "John belongs_to Microsoft"          |
| related_to        | 一般的な関連 | "AI related_to Machine Learning"     |
| causes            | 因果関係     | "Bug causes Error"                   |
| depends_on        | 依存関係     | "React depends_on JavaScript"        |
| created_by        | 作成者       | "TypeScript created_by Microsoft"    |
| uses              | 使用関係     | "Next.js uses React"                 |
| part_of           | 部分-全体    | "Chapter part_of Book"               |
| located_in        | 位置関係     | "Google located_in California"       |
| succeeds          | 後継         | "Python 3 succeeds Python 2"         |
| precedes          | 先行         | "HTML precedes HTML5"                |
| competes_with     | 競合関係     | "React competes_with Vue"            |
| collaborates_with | 協力関係     | "OpenAI collaborates_with Microsoft" |
| implements        | 実装         | "Express implements HTTP server"     |
| extends           | 拡張         | "TypeScript extends JavaScript"      |
| other             | その他       | 分類困難な関係                       |
