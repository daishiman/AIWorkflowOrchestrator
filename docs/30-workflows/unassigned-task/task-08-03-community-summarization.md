# コミュニティ要約生成 - タスク指示書

## メタ情報

| 項目         | 内容                          |
| ------------ | ----------------------------- |
| タスクID     | CONV-08-03                    |
| タスク名     | コミュニティ要約生成          |
| 親タスク     | CONV-08 (Knowledge Graph構築) |
| 依存タスク   | CONV-08-02 (コミュニティ検出) |
| 規模         | 中                            |
| 見積もり工数 | 1日                           |
| ステータス   | 未実施                        |

---

## 1. 目的

検出されたコミュニティごとにLLMで要約を生成し、グローバルクエリへの回答に使用できる形式で保存する。要約の埋め込みも生成してセマンティック検索を可能にする。

---

## 2. 背景

### GraphRAGにおけるコミュニティ要約の役割

- グローバルクエリ（「全体のテーマは？」等）への回答
- VectorRAG単体では不可能なクエリタイプに対応
- 階層的な要約で詳細度を調整可能
- ベンチマークでVectorRAG単体比+24%の精度向上（81.67% vs 57.50%）

---

## 3. 成果物

- `packages/shared/src/services/graph/community-summarizer.ts`
- `packages/shared/src/services/graph/prompts/community-summary-prompt.ts`
- `packages/shared/src/services/graph/__tests__/community-summarizer.test.ts`

---

## 4. 入力

- コミュニティ情報（Community）
- コミュニティ内のエンティティ
- エンティティ間の関係
- 関連チャンクのコンテンツ

---

## 5. 出力

```typescript
// packages/shared/src/services/graph/types.ts（追加）
export interface CommunitySummary {
  communityId: CommunityId;
  level: number;
  summary: string;
  keywords: string[];
  mainEntities: string[];
  mainRelations: string[];
  sentiment?: "positive" | "negative" | "neutral";
  confidence: number;
  tokenCount: number;
  embedding?: number[];
  createdAt: Date;
}

export interface CommunitySummarizationOptions {
  /**
   * 要約の最大トークン数
   */
  maxSummaryTokens?: number;

  /**
   * キーワードの最大数
   */
  maxKeywords?: number;

  /**
   * 子コミュニティの要約を使用するか
   */
  useChildSummaries?: boolean;

  /**
   * 要約の埋め込みを生成するか
   */
  generateEmbedding?: boolean;

  /**
   * 並列処理の最大数
   */
  maxConcurrency?: number;

  /**
   * 要約プロンプトのスタイル
   */
  summaryStyle?: "detailed" | "concise" | "technical";
}

export interface CommunitySummarizationResult {
  summaries: CommunitySummary[];
  totalTokensUsed: number;
  processingTimeMs: number;
  failedCommunities: CommunityId[];
}
```

---

## 6. 実装仕様

### 6.1 コミュニティ要約インターフェース

```typescript
// packages/shared/src/services/graph/community-summarizer.ts
import type { Result } from "@/types/result";

export interface ICommunitySummarizer {
  /**
   * 単一コミュニティの要約を生成
   */
  summarize(
    community: Community,
    entities: StoredEntity[],
    relations: StoredRelation[],
    options?: CommunitySummarizationOptions,
  ): Promise<Result<CommunitySummary, Error>>;

  /**
   * 全コミュニティの要約を生成（階層順）
   */
  summarizeAll(
    communityStructure: CommunityStructure,
    options?: CommunitySummarizationOptions,
  ): Promise<Result<CommunitySummarizationResult, Error>>;

  /**
   * コミュニティ要約を検索
   */
  searchSummaries(
    query: string,
    options?: { level?: number; limit?: number },
  ): Promise<Result<CommunitySummary[], Error>>;

  /**
   * 要約を更新（グラフ変更時）
   */
  updateSummary(
    communityId: CommunityId,
  ): Promise<Result<CommunitySummary, Error>>;
}
```

### 6.2 要約プロンプト

```typescript
// packages/shared/src/services/graph/prompts/community-summary-prompt.ts
export function buildCommunitySummaryPrompt(
  entities: StoredEntity[],
  relations: StoredRelation[],
  childSummaries: CommunitySummary[],
  options: CommunitySummarizationOptions,
): string {
  const entityList = entities
    .slice(0, 20) // 上位20エンティティ
    .map((e) => `- ${e.name} (${e.type}): ${e.description ?? "説明なし"}`)
    .join("\n");

  const relationList = relations
    .slice(0, 30) // 上位30関係
    .map((r) => {
      const source = entities.find((e) => e.id === r.sourceEntityId)?.name;
      const target = entities.find((e) => e.id === r.targetEntityId)?.name;
      return `- ${source} → ${r.relationType} → ${target}`;
    })
    .join("\n");

  const childSummarySection =
    childSummaries.length > 0
      ? `\n子コミュニティの要約:\n${childSummaries.map((s) => `- ${s.summary}`).join("\n")}`
      : "";

  const styleGuide = {
    detailed: "詳細で包括的な要約を作成してください。",
    concise: "簡潔で要点を押さえた要約を作成してください。",
    technical: "技術的な観点から専門的な要約を作成してください。",
  }[options.summaryStyle ?? "concise"];

  return `以下のエンティティと関係のグループについて要約を作成してください。

${styleGuide}

エンティティ一覧:
${entityList}

関係一覧:
${relationList}
${childSummarySection}

JSON形式で出力してください:
{
  "summary": "グループの特徴を説明する要約文（${options.maxSummaryTokens ?? 200}トークン以内）",
  "keywords": ["キーワード1", "キーワード2", ...（最大${options.maxKeywords ?? 10}個）],
  "mainEntities": ["主要エンティティ1", "主要エンティティ2", ...（最大5個）],
  "mainRelations": ["主要関係1（AとBの関係）", ...（最大5個）],
  "sentiment": "positive/negative/neutral",
  "confidence": 0.0-1.0の信頼度
}

注意:
- 要約はグループ全体のテーマや特徴を表現
- キーワードは検索に使用されるため、具体的な用語を選択
- 主要エンティティ・関係はグループを代表するもの
- sentimentは内容の全体的な傾向`;
}
```

### 6.3 コミュニティ要約サービス

```typescript
export class CommunitySummarizer implements ICommunitySummarizer {
  private readonly defaultOptions: CommunitySummarizationOptions = {
    maxSummaryTokens: 200,
    maxKeywords: 10,
    useChildSummaries: true,
    generateEmbedding: true,
    maxConcurrency: 5,
    summaryStyle: "concise",
  };

  constructor(
    private readonly llmProvider: ILLMProvider,
    private readonly embeddingProvider: IEmbeddingProvider,
    private readonly graphStore: IKnowledgeGraphStore,
    private readonly communityRepository: CommunityRepository,
  ) {}

  async summarize(
    community: Community,
    entities: StoredEntity[],
    relations: StoredRelation[],
    options?: CommunitySummarizationOptions,
  ): Promise<Result<CommunitySummary, Error>> {
    const mergedOptions = { ...this.defaultOptions, ...options };
    const startTime = performance.now();

    try {
      // 子コミュニティの要約を取得
      let childSummaries: CommunitySummary[] = [];
      if (
        mergedOptions.useChildSummaries &&
        community.childCommunityIds.length > 0
      ) {
        const childResults = await Promise.all(
          community.childCommunityIds.map((id) =>
            this.communityRepository.getSummary(id),
          ),
        );
        childSummaries = childResults
          .filter((r) => r.success && r.data)
          .map((r) => r.data!);
      }

      // プロンプトを構築
      const prompt = buildCommunitySummaryPrompt(
        entities,
        relations,
        childSummaries,
        mergedOptions,
      );

      // LLMで要約生成
      const llmResponse = await this.llmProvider.generate(prompt, {
        maxTokens: mergedOptions.maxSummaryTokens! * 2,
        temperature: 0.3,
        responseFormat: "json",
      });

      if (!llmResponse.success) {
        return err(llmResponse.error);
      }

      // レスポンスをパース
      const parsed = this.parseResponse(llmResponse.data.text);
      if (!parsed.success) {
        return err(parsed.error);
      }

      // 埋め込みを生成
      let embedding: number[] | undefined;
      if (mergedOptions.generateEmbedding) {
        const embeddingResult = await this.embeddingProvider.embedSingle(
          parsed.data.summary,
        );
        if (embeddingResult.success) {
          embedding = embeddingResult.data;
        }
      }

      const summary: CommunitySummary = {
        communityId: community.id,
        level: community.level,
        summary: parsed.data.summary,
        keywords: parsed.data.keywords,
        mainEntities: parsed.data.mainEntities,
        mainRelations: parsed.data.mainRelations,
        sentiment: parsed.data.sentiment,
        confidence: parsed.data.confidence,
        tokenCount: this.estimateTokenCount(parsed.data.summary),
        embedding,
        createdAt: new Date(),
      };

      // DBに保存
      await this.communityRepository.updateSummary(community.id, summary);

      return ok(summary);
    } catch (error) {
      return err(
        error instanceof Error
          ? error
          : new Error("Failed to summarize community"),
      );
    }
  }

  async summarizeAll(
    communityStructure: CommunityStructure,
    options?: CommunitySummarizationOptions,
  ): Promise<Result<CommunitySummarizationResult, Error>> {
    const mergedOptions = { ...this.defaultOptions, ...options };
    const startTime = performance.now();

    const summaries: CommunitySummary[] = [];
    const failedCommunities: CommunityId[] = [];
    let totalTokensUsed = 0;

    // 階層の深い順に処理（子→親の順で要約）
    const sortedCommunities = [...communityStructure.communities].sort(
      (a, b) => b.level - a.level,
    );

    // 並列処理（concurrency制限付き）
    const chunks = this.chunkArray(
      sortedCommunities,
      mergedOptions.maxConcurrency!,
    );

    for (const chunk of chunks) {
      const results = await Promise.all(
        chunk.map(async (community) => {
          // エンティティと関係を取得
          const [entitiesResult, relationsResult] = await Promise.all([
            this.graphStore.findEntities({
              chunkIds: community.memberEntityIds as unknown as ChunkId[],
            }),
            this.getRelationsInCommunity(community),
          ]);

          if (!entitiesResult.success || !relationsResult.success) {
            return { community, error: new Error("Failed to load graph data") };
          }

          const result = await this.summarize(
            community,
            entitiesResult.data,
            relationsResult.data,
            mergedOptions,
          );

          return { community, result };
        }),
      );

      for (const { community, result, error } of results) {
        if (error || !result?.success) {
          failedCommunities.push(community.id);
        } else {
          summaries.push(result.data);
          totalTokensUsed += result.data.tokenCount;
        }
      }
    }

    return ok({
      summaries,
      totalTokensUsed,
      processingTimeMs: performance.now() - startTime,
      failedCommunities,
    });
  }

  async searchSummaries(
    query: string,
    options?: { level?: number; limit?: number },
  ): Promise<Result<CommunitySummary[], Error>> {
    const limit = options?.limit ?? 10;

    try {
      // クエリの埋め込みを生成
      const queryEmbedding = await this.embeddingProvider.embedSingle(query);
      if (!queryEmbedding.success) {
        return err(queryEmbedding.error);
      }

      // ベクトル類似検索
      const sql = `
        SELECT c.*, cs.summary, cs.keywords, cs.embedding
        FROM communities c
        JOIN community_summaries cs ON c.id = cs.community_id
        WHERE cs.embedding IS NOT NULL
        ${options?.level !== undefined ? `AND c.level = ${options.level}` : ""}
        ORDER BY vector_distance_cos(cs.embedding, ?) ASC
        LIMIT ?
      `;

      const results = await this.db.execute(sql, [
        JSON.stringify(queryEmbedding.data),
        limit,
      ]);

      return ok(results.rows.map(this.mapRowToSummary));
    } catch (error) {
      return err(
        error instanceof Error
          ? error
          : new Error("Failed to search summaries"),
      );
    }
  }

  async updateSummary(
    communityId: CommunityId,
  ): Promise<Result<CommunitySummary, Error>> {
    // コミュニティ情報を取得
    const community = await this.communityRepository.findById(communityId);
    if (!community.success || !community.data) {
      return err(new Error(`Community not found: ${communityId}`));
    }

    // エンティティと関係を取得
    const [entitiesResult, relationsResult] = await Promise.all([
      this.getCommunityEntities(community.data),
      this.getRelationsInCommunity(community.data),
    ]);

    if (!entitiesResult.success || !relationsResult.success) {
      return err(new Error("Failed to load graph data"));
    }

    return this.summarize(
      community.data,
      entitiesResult.data,
      relationsResult.data,
    );
  }

  private parseResponse(
    responseText: string,
  ): Result<
    Omit<
      CommunitySummary,
      "communityId" | "level" | "tokenCount" | "embedding" | "createdAt"
    >,
    Error
  > {
    try {
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        return err(new Error("No JSON found in response"));
      }

      const parsed = JSON.parse(jsonMatch[0]);

      return ok({
        summary: parsed.summary ?? "",
        keywords: parsed.keywords ?? [],
        mainEntities: parsed.mainEntities ?? [],
        mainRelations: parsed.mainRelations ?? [],
        sentiment: parsed.sentiment,
        confidence: parsed.confidence ?? 0.5,
      });
    } catch (error) {
      return err(
        error instanceof Error ? error : new Error("Failed to parse response"),
      );
    }
  }

  private async getRelationsInCommunity(
    community: Community,
  ): Promise<Result<StoredRelation[], Error>> {
    const relations: StoredRelation[] = [];
    const memberSet = new Set(community.memberEntityIds);

    for (const entityId of community.memberEntityIds) {
      const relationsResult = await this.graphStore.getRelations(entityId, {
        direction: "both",
      });

      if (relationsResult.success) {
        for (const relation of relationsResult.data) {
          // コミュニティ内の関係のみ
          if (
            memberSet.has(relation.sourceEntityId) &&
            memberSet.has(relation.targetEntityId)
          ) {
            // 重複チェック
            if (!relations.some((r) => r.id === relation.id)) {
              relations.push(relation);
            }
          }
        }
      }
    }

    return ok(relations);
  }

  private chunkArray<T>(array: T[], size: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }

  private estimateTokenCount(text: string): number {
    // 簡易的なトークン数推定（英語: 4文字≒1トークン、日本語: 1文字≒1トークン）
    return Math.ceil(text.length / 3);
  }
}
```

---

## 7. テストケース

```typescript
describe("CommunitySummarizer", () => {
  it("コミュニティの要約を生成できる", async () => {
    const summarizer = new CommunitySummarizer(
      mockLLM,
      mockEmbedding,
      mockGraphStore,
      mockCommunityRepo,
    );

    const result = await summarizer.summarize(
      mockCommunity,
      mockEntities,
      mockRelations,
    );

    expect(result.success).toBe(true);
    expect(result.data.summary.length).toBeGreaterThan(0);
    expect(result.data.keywords.length).toBeGreaterThan(0);
    expect(result.data.embedding).toBeDefined();
  });

  it("子コミュニティの要約を使用できる", async () => {
    const summarizer = new CommunitySummarizer(
      mockLLM,
      mockEmbedding,
      mockGraphStore,
      mockCommunityRepo,
    );

    const parentCommunity = {
      ...mockCommunity,
      childCommunityIds: ["child-1", "child-2"],
    };

    const result = await summarizer.summarize(
      parentCommunity,
      mockEntities,
      mockRelations,
      { useChildSummaries: true },
    );

    expect(result.success).toBe(true);
    // プロンプトに子コミュニティの要約が含まれる
  });

  it("全コミュニティの要約を生成できる", async () => {
    const summarizer = new CommunitySummarizer(
      mockLLM,
      mockEmbedding,
      mockGraphStore,
      mockCommunityRepo,
    );

    const result = await summarizer.summarizeAll(mockCommunityStructure);

    expect(result.success).toBe(true);
    expect(result.data.summaries.length).toBeGreaterThan(0);
    expect(result.data.failedCommunities.length).toBe(0);
  });

  it("要約をセマンティック検索できる", async () => {
    const summarizer = new CommunitySummarizer(
      mockLLM,
      mockEmbedding,
      mockGraphStore,
      mockCommunityRepo,
    );

    const result = await summarizer.searchSummaries("プログラミング言語", {
      limit: 5,
    });

    expect(result.success).toBe(true);
    expect(result.data.length).toBeLessThanOrEqual(5);
  });

  it("特定レベルのコミュニティのみ検索できる", async () => {
    const summarizer = new CommunitySummarizer(
      mockLLM,
      mockEmbedding,
      mockGraphStore,
      mockCommunityRepo,
    );

    const result = await summarizer.searchSummaries("テーマ", {
      level: 0,
      limit: 10,
    });

    expect(result.success).toBe(true);
    expect(result.data.every((s) => s.level === 0)).toBe(true);
  });
});
```

---

## 8. 完了条件

- [ ] `ICommunitySummarizer`インターフェースが定義済み
- [ ] `CommunitySummarizer`が実装済み
- [ ] 単一コミュニティの要約生成が動作する
- [ ] 子コミュニティの要約を使用した生成が動作する
- [ ] 全コミュニティの一括要約生成が動作する（階層順）
- [ ] 要約の埋め込み生成が動作する
- [ ] 要約のセマンティック検索が動作する
- [ ] レベル指定の検索が動作する
- [ ] 要約の更新が動作する
- [ ] 全テストがパス
- [ ] TypeScript型エラーなし
- [ ] ESLint警告なし
- [ ] JSDocコメントが記述されている

---

## 9. 次のタスク

- CONV-07-01: クエリ分類器実装

---

## 10. 参照情報

- CONV-04-05: Knowledge Graphテーブル（community_summariesテーブル）
- CONV-08-01: Knowledge Graphストア
- CONV-08-02: コミュニティ検出
- CONV-08: Knowledge Graph構築（親タスク）
- CONV-07: HybridRAG検索エンジン（利用先）

---

## 11. 要約スタイルガイドライン

| スタイル  | 用途                   | 特徴                       |
| --------- | ---------------------- | -------------------------- |
| detailed  | 詳細な分析が必要な場合 | 包括的、長め、網羅的       |
| concise   | 一般的な要約           | 要点を押さえた簡潔な内容   |
| technical | 技術文書向け           | 専門用語を使用、正確性重視 |

---

## 12. コスト最適化

### 要約生成のコスト

- 1コミュニティあたり約200-500トークン（プロンプト含む）
- 大規模グラフでは数百〜数千コミュニティ
- 並列処理でスループット向上

### 推奨設定

| グラフサイズ   | maxConcurrency | useChildSummaries |
| -------------- | -------------- | ----------------- |
| 小（<100）     | 10             | true              |
| 中（100-1000） | 5              | true              |
| 大（>1000）    | 3              | false（初回のみ） |
