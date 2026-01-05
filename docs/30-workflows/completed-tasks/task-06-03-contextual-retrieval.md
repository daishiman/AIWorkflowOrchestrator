# Contextual Retrieval 実装 - タスク指示書

## メタ情報

| 項目         | 内容                               |
| ------------ | ---------------------------------- |
| タスクID     | CONV-06-03                         |
| タスク名     | Contextual Retrieval 実装          |
| 親タスク     | CONV-06 (埋め込み生成パイプライン) |
| 依存タスク   | CONV-06-01, CONV-06-02             |
| 規模         | 中                                 |
| 見積もり工数 | 1日                                |
| ステータス   | 未実施                             |

---

## 1. 目的

Anthropicの研究に基づくContextual Retrievalを実装する。各チャンクにドキュメント全体のコンテキストを付与することで、検索精度を最大67%向上させる。

---

## 2. 背景

### Anthropic Contextual Retrieval研究

従来のチャンキングでは、個々のチャンクがドキュメント全体のコンテキストを失う問題がある。Contextual Retrievalは、各チャンクに50-100トークンのコンテキスト情報を付与することで、この問題を解決する。

#### 効果（検索失敗率の削減）

| 手法                         | 失敗率削減 | 失敗率      |
| ---------------------------- | ---------- | ----------- |
| Contextual Embeddings のみ   | 35%        | 5.7% → 3.7% |
| Contextual Embeddings + BM25 | 49%        | 5.7% → 2.9% |
| **+ Reranking（推奨）**      | **67%**    | 5.7% → 1.9% |

---

## 3. 成果物

- `packages/shared/src/services/contextual/contextual-chunking-service.ts`
- `packages/shared/src/services/contextual/context-generator.ts`
- `packages/shared/src/services/contextual/types.ts`
- `packages/shared/src/services/contextual/__tests__/contextual-chunking-service.test.ts`

---

## 4. 入力

- ドキュメント全体のコンテンツ
- 通常のチャンク配列
- LLMプロバイダー設定

---

## 5. 出力

```typescript
// packages/shared/src/services/contextual/types.ts
import { z } from "zod";
import type { ContentChunk } from "../chunking/types";

export interface ContextualChunk extends ContentChunk {
  /**
   * コンテキスト情報（50-100トークン）
   * ドキュメント内の位置と内容を説明
   */
  contextualHeader: string;

  /**
   * 元のチャンクコンテンツ
   */
  originalContent: string;

  /**
   * 埋め込み用コンテンツ（contextualHeader + originalContent）
   */
  embeddingContent: string;

  /**
   * コンテキスト生成に使用したトークン数
   */
  contextTokens: number;
}

export interface ContextGenerationOptions {
  /**
   * コンテキストの最大トークン数（デフォルト: 100）
   */
  maxContextTokens: number;

  /**
   * ドキュメントタイトルを含めるか
   */
  includeTitle: boolean;

  /**
   * 周辺セクションの見出しを含めるか
   */
  includeHeadings: boolean;

  /**
   * LLM生成を使用するか（falseの場合はルールベース）
   */
  useLLM: boolean;

  /**
   * プロンプトキャッシングを使用するか
   */
  usePromptCaching: boolean;
}

export interface ContextualChunkingResult {
  chunks: ContextualChunk[];
  totalTokens: number;
  contextGenerationTokens: number;
  processingTimeMs: number;
  llmCost?: number;
}
```

---

## 6. 実装仕様

### 6.1 コンテキスト生成サービス

```typescript
// packages/shared/src/services/contextual/context-generator.ts
import type { Result } from "@/types/result";
import type { ILLMProvider } from "@/services/llm/types";

export interface IContextGenerator {
  /**
   * チャンクのコンテキストを生成
   */
  generateContext(
    document: string,
    documentTitle: string,
    chunk: ContentChunk,
    options: ContextGenerationOptions,
  ): Promise<Result<string, Error>>;

  /**
   * バッチでコンテキストを生成
   */
  generateContextBatch(
    document: string,
    documentTitle: string,
    chunks: ContentChunk[],
    options: ContextGenerationOptions,
  ): Promise<Result<string[], Error>>;
}

export class LLMContextGenerator implements IContextGenerator {
  constructor(private readonly llmProvider: ILLMProvider) {}

  async generateContext(
    document: string,
    documentTitle: string,
    chunk: ContentChunk,
    options: ContextGenerationOptions,
  ): Promise<Result<string, Error>> {
    const prompt = this.buildPrompt(document, documentTitle, chunk);

    try {
      const response = await this.llmProvider.generate(prompt, {
        maxTokens: options.maxContextTokens,
        cachePrefix: options.usePromptCaching ? document : undefined,
      });

      if (!response.success) {
        return err(response.error);
      }

      return ok(response.data.text.trim());
    } catch (error) {
      return err(
        error instanceof Error ? error : new Error("Context generation failed"),
      );
    }
  }

  async generateContextBatch(
    document: string,
    documentTitle: string,
    chunks: ContentChunk[],
    options: ContextGenerationOptions,
  ): Promise<Result<string[], Error>> {
    const contexts: string[] = [];

    // プロンプトキャッシング: 同じドキュメントに対して複数のチャンクを処理
    for (const chunk of chunks) {
      const result = await this.generateContext(
        document,
        documentTitle,
        chunk,
        options,
      );

      if (!result.success) {
        // エラーの場合はルールベースにフォールバック
        const fallback = this.generateRuleBasedContext(
          documentTitle,
          chunk,
          options,
        );
        contexts.push(fallback);
      } else {
        contexts.push(result.data);
      }
    }

    return ok(contexts);
  }

  private buildPrompt(
    document: string,
    documentTitle: string,
    chunk: ContentChunk,
  ): string {
    return `<document title="${documentTitle}">
${document}
</document>

上記のドキュメント内に以下のチャンクがあります。
このチャンクがドキュメント内のどの位置にあり、何について述べているかを簡潔に説明してください（50-100トークン以内）。
説明は「このチャンクは...」で始めてください。

<chunk>
${chunk.content}
</chunk>

コンテキスト説明:`;
  }

  private generateRuleBasedContext(
    documentTitle: string,
    chunk: ContentChunk,
    options: ContextGenerationOptions,
  ): string {
    const parts: string[] = [];

    if (options.includeTitle && documentTitle) {
      parts.push(`ドキュメント「${documentTitle}」より。`);
    }

    if (options.includeHeadings && chunk.metadata.headings?.length) {
      parts.push(`セクション: ${chunk.metadata.headings.join(" > ")}。`);
    }

    parts.push(`チャンク ${chunk.index + 1}。`);

    return parts.join(" ");
  }
}

/**
 * ルールベースのコンテキスト生成（LLMを使用しない）
 */
export class RuleBasedContextGenerator implements IContextGenerator {
  async generateContext(
    document: string,
    documentTitle: string,
    chunk: ContentChunk,
    options: ContextGenerationOptions,
  ): Promise<Result<string, Error>> {
    const context = this.buildContext(documentTitle, chunk, options);
    return ok(context);
  }

  async generateContextBatch(
    document: string,
    documentTitle: string,
    chunks: ContentChunk[],
    options: ContextGenerationOptions,
  ): Promise<Result<string[], Error>> {
    const contexts = chunks.map((chunk) =>
      this.buildContext(documentTitle, chunk, options),
    );
    return ok(contexts);
  }

  private buildContext(
    documentTitle: string,
    chunk: ContentChunk,
    options: ContextGenerationOptions,
  ): string {
    const parts: string[] = [];

    // ドキュメントタイトル
    if (options.includeTitle && documentTitle) {
      parts.push(
        `このチャンクは「${documentTitle}」というドキュメントからの抜粋です。`,
      );
    }

    // セクション見出し
    if (options.includeHeadings && chunk.metadata.headings?.length) {
      const headingPath = chunk.metadata.headings.join(" > ");
      parts.push(`「${headingPath}」セクションに属しています。`);
    }

    // 位置情報
    parts.push(`ドキュメント内の${chunk.index + 1}番目のチャンクです。`);

    // コードブロックの場合
    if (chunk.metadata.isCodeBlock && chunk.metadata.language) {
      parts.push(`${chunk.metadata.language}のコードを含んでいます。`);
    }

    return parts.join(" ");
  }
}
```

### 6.2 Contextual Chunkingサービス

```typescript
// packages/shared/src/services/contextual/contextual-chunking-service.ts
export interface IContextualChunkingService {
  /**
   * チャンクにコンテキストを付与
   */
  addContext(
    document: string,
    documentTitle: string,
    chunks: ContentChunk[],
    options?: Partial<ContextGenerationOptions>,
  ): Promise<Result<ContextualChunkingResult, Error>>;
}

export class ContextualChunkingService implements IContextualChunkingService {
  private readonly defaultOptions: ContextGenerationOptions = {
    maxContextTokens: 100,
    includeTitle: true,
    includeHeadings: true,
    useLLM: true,
    usePromptCaching: true,
  };

  constructor(
    private readonly contextGenerator: IContextGenerator,
    private readonly tokenizer: ITokenizer,
  ) {}

  async addContext(
    document: string,
    documentTitle: string,
    chunks: ContentChunk[],
    options?: Partial<ContextGenerationOptions>,
  ): Promise<Result<ContextualChunkingResult, Error>> {
    const startTime = performance.now();
    const mergedOptions = { ...this.defaultOptions, ...options };

    // コンテキストを生成
    const contextsResult = await this.contextGenerator.generateContextBatch(
      document,
      documentTitle,
      chunks,
      mergedOptions,
    );

    if (!contextsResult.success) {
      return err(contextsResult.error);
    }

    const contexts = contextsResult.data;
    let totalContextTokens = 0;

    // ContextualChunkを作成
    const contextualChunks: ContextualChunk[] = chunks.map((chunk, index) => {
      const contextualHeader = contexts[index];
      const contextTokens = this.tokenizer.encode(contextualHeader).length;
      totalContextTokens += contextTokens;

      const embeddingContent = `${contextualHeader}\n\n${chunk.content}`;

      return {
        ...chunk,
        contextualHeader,
        originalContent: chunk.content,
        embeddingContent,
        contextTokens,
        // トークン数を更新
        tokenCount: chunk.tokenCount + contextTokens,
      };
    });

    const totalTokens = contextualChunks.reduce(
      (sum, chunk) => sum + chunk.tokenCount,
      0,
    );

    return ok({
      chunks: contextualChunks,
      totalTokens,
      contextGenerationTokens: totalContextTokens,
      processingTimeMs: performance.now() - startTime,
      llmCost: mergedOptions.useLLM
        ? this.estimateLLMCost(document.length, chunks.length)
        : 0,
    });
  }

  /**
   * LLMコストを推定（Claude prompt caching使用時）
   * $1.02 / 100万ドキュメントトークン
   */
  private estimateLLMCost(documentTokens: number, chunkCount: number): number {
    const ratePerMillionTokens = 1.02;
    // キャッシュ使用時: 最初のリクエストのみフルプライス、以降は90%オフ
    const firstRequestTokens = documentTokens;
    const cachedRequestTokens = documentTokens * (chunkCount - 1) * 0.1;
    const totalTokens = firstRequestTokens + cachedRequestTokens;

    return (totalTokens / 1_000_000) * ratePerMillionTokens;
  }
}
```

### 6.3 統合パイプライン

```typescript
// packages/shared/src/services/embedding/embedding-pipeline.ts
export class EmbeddingPipeline {
  constructor(
    private readonly chunkingService: IChunkingService,
    private readonly contextualService: IContextualChunkingService,
    private readonly embeddingProvider: IEmbeddingProvider,
    private readonly chunkRepository: ChunkRepository,
  ) {}

  async process(
    conversion: ConversionResult,
    options: {
      chunking: ChunkingOptions;
      contextual?: Partial<ContextGenerationOptions>;
      useContextual?: boolean;
    },
  ): Promise<Result<EmbeddingPipelineResult, Error>> {
    const startTime = performance.now();

    // 1. チャンキング
    const chunkingResult = await this.chunkingService.chunk(
      conversion.content.plainText,
      conversion.id,
      options.chunking,
    );

    if (!chunkingResult.success) {
      return err(chunkingResult.error);
    }

    let chunksForEmbedding: ContentChunk[] = chunkingResult.data.chunks;
    let contextualResult: ContextualChunkingResult | undefined;

    // 2. Contextual Retrieval（オプション）
    if (options.useContextual !== false) {
      contextualResult = await this.contextualService.addContext(
        conversion.content.plainText,
        conversion.metadata?.title ?? conversion.fileName,
        chunkingResult.data.chunks,
        options.contextual,
      );

      if (contextualResult.success) {
        // embeddingContentを使用
        chunksForEmbedding = contextualResult.data.chunks.map((chunk) => ({
          ...chunk,
          content: chunk.embeddingContent,
        }));
      }
    }

    // 3. 埋め込み生成
    const textsForEmbedding = chunksForEmbedding.map((c) => c.content);
    const embeddingResult = await this.embeddingProvider.embedBatch(
      textsForEmbedding,
      {
        onProgress: (progress) => {
          console.log(`Embedding progress: ${(progress * 100).toFixed(1)}%`);
        },
      },
    );

    if (!embeddingResult.success) {
      return err(embeddingResult.error);
    }

    // 4. DB保存
    const chunksWithEmbeddings = chunkingResult.data.chunks.map(
      (chunk, index) => ({
        ...chunk,
        embedding: embeddingResult.data.embeddings[index],
        contextualHeader:
          contextualResult?.data?.chunks[index]?.contextualHeader,
      }),
    );

    await this.chunkRepository.bulkInsert(chunksWithEmbeddings);

    return ok({
      chunkCount: chunksWithEmbeddings.length,
      totalTokens: chunkingResult.data.totalTokens,
      embeddingDimensions: embeddingResult.data.dimensions,
      processingTimeMs: performance.now() - startTime,
      contextualCost: contextualResult?.data?.llmCost,
    });
  }
}
```

---

## 7. テストケース

```typescript
describe("ContextualChunkingService", () => {
  describe("addContext with LLM", () => {
    it("LLMでコンテキストを生成できる", async () => {
      const service = new ContextualChunkingService(
        new LLMContextGenerator(mockLLMProvider),
        mockTokenizer,
      );

      const result = await service.addContext(
        "This is a long document about TypeScript...",
        "TypeScript Guide",
        [mockChunk],
      );

      expect(result.success).toBe(true);
      expect(result.data.chunks[0].contextualHeader).toContain("このチャンク");
    });

    it("LLMエラー時にルールベースにフォールバックする", async () => {
      const failingLLM = {
        generate: vi.fn().mockResolvedValue(err(new Error("API error"))),
      };
      const service = new ContextualChunkingService(
        new LLMContextGenerator(failingLLM as any),
        mockTokenizer,
      );

      const result = await service.addContext("Document content", "Title", [
        mockChunk,
      ]);

      expect(result.success).toBe(true);
      // ルールベースのコンテキストが生成されている
      expect(result.data.chunks[0].contextualHeader).toBeTruthy();
    });
  });

  describe("addContext with RuleBased", () => {
    it("ルールベースでコンテキストを生成できる", async () => {
      const service = new ContextualChunkingService(
        new RuleBasedContextGenerator(),
        mockTokenizer,
      );

      const result = await service.addContext(
        "Document content",
        "My Document",
        [mockChunkWithHeadings],
        { useLLM: false },
      );

      expect(result.success).toBe(true);
      expect(result.data.chunks[0].contextualHeader).toContain("My Document");
      expect(result.data.chunks[0].contextualHeader).toContain("セクション");
    });
  });

  describe("embeddingContent", () => {
    it("contextualHeader + originalContentが結合される", async () => {
      const service = new ContextualChunkingService(
        new RuleBasedContextGenerator(),
        mockTokenizer,
      );

      const result = await service.addContext("Document content", "Title", [
        { ...mockChunk, content: "Original chunk content" },
      ]);

      expect(result.success).toBe(true);
      const chunk = result.data.chunks[0];
      expect(chunk.embeddingContent).toContain(chunk.contextualHeader);
      expect(chunk.embeddingContent).toContain("Original chunk content");
    });
  });
});
```

---

## 8. 完了条件

- [ ] `IContextGenerator`インターフェースが定義済み
- [ ] `LLMContextGenerator`が実装済み
- [ ] `RuleBasedContextGenerator`が実装済み
- [ ] `ContextualChunkingService`が実装済み
- [ ] LLMでコンテキスト生成が動作する
- [ ] LLMエラー時のフォールバックが動作する
- [ ] ルールベースのコンテキスト生成が動作する
- [ ] embeddingContentが正しく生成される
- [ ] コスト推定が動作する
- [ ] 全テストがパス
- [ ] TypeScript型エラーなし
- [ ] ESLint警告なし
- [ ] JSDocコメントが記述されている

---

## 9. 次のタスク

- CONV-06-04: エンティティ抽出サービス (NER)

---

## 10. 参照情報

- CONV-06-01: チャンキング戦略
- CONV-06-02: 埋め込みプロバイダー
- CONV-06: 埋め込み生成パイプライン（親タスク）
- [Anthropic Contextual Retrieval](https://www.anthropic.com/news/contextual-retrieval)

---

## 11. コスト最適化

### Claude Prompt Caching

- キャッシュ使用時のコスト: **$1.02 / 100万ドキュメントトークン**
- 200,000トークン未満のナレッジベースはRAG不要（全文プロンプト可能）

### 推奨設定

| シナリオ             | useLLM | コスト   | 精度   |
| -------------------- | ------ | -------- | ------ |
| 高精度が必要         | true   | $1.02/1M | 最高   |
| コスト重視           | false  | 無料     | 中     |
| 小規模ナレッジベース | -      | -        | 全文可 |
