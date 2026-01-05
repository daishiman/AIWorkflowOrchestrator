/**
 * チャンキングサービス
 *
 * @description チャンキング戦略を統合し、Contextual EmbeddingsとLate Chunkingを適用
 */

import { FixedChunkingStrategy } from "./strategies/fixed-chunking-strategy";
import { SentenceChunkingStrategy } from "./strategies/sentence-chunking-strategy";
import { SemanticChunkingStrategy } from "./strategies/semantic-chunking-strategy";
import { HierarchicalChunkingStrategy } from "./strategies/hierarchical-chunking-strategy";
import { ChunkingError, ValidationError } from "./errors";
import type {
  IChunkingStrategy,
  ITokenizer,
  IEmbeddingClient,
  ILLMClient,
} from "./interfaces";
import type {
  ChunkingStrategy,
  ChunkingInput,
  ChunkingOutput,
  ChunkingStatistics,
  Chunk,
  ContextualChunk,
  ContextualEmbeddingsOptions,
  LateChunkingOptions,
  BaseChunkingOptions,
} from "./types";

/**
 * デフォルトのコンテキストプロンプトテンプレート
 */
const DEFAULT_CONTEXT_TEMPLATE = `<document>
{{WHOLE_DOCUMENT}}
</document>

Here is the chunk we want to situate within the whole document:

<chunk>
{{CHUNK_CONTENT}}
</chunk>

Please give a short succinct context to situate this chunk within the overall document for the purposes of improving search retrieval of the chunk. Answer only with the succinct context and nothing else.`;

/**
 * チャンキングサービス
 *
 * Application Layerのファサード。各チャンキング戦略を統合し、
 * Contextual EmbeddingsとLate Chunkingの処理を行う。
 */
export class ChunkingService {
  private strategies: Map<ChunkingStrategy, IChunkingStrategy>;
  private tokenizer: ITokenizer;
  private embeddingClient?: IEmbeddingClient;
  private llmClient?: ILLMClient;

  /**
   * コンストラクタ
   *
   * @param tokenizer - トークナイザー
   * @param embeddingClient - 埋め込みクライアント（セマンティックチャンキング用、オプション）
   * @param llmClient - LLMクライアント（Contextual Embeddings用、オプション）
   */
  constructor(
    tokenizer: ITokenizer,
    embeddingClient?: IEmbeddingClient,
    llmClient?: ILLMClient,
  ) {
    this.tokenizer = tokenizer;
    this.embeddingClient = embeddingClient;
    this.llmClient = llmClient;
    this.strategies = new Map();
    this.registerStrategies();
  }

  /**
   * 各チャンキング戦略を登録する
   */
  private registerStrategies(): void {
    this.strategies.set("fixed", new FixedChunkingStrategy(this.tokenizer));
    this.strategies.set(
      "sentence",
      new SentenceChunkingStrategy(this.tokenizer),
    );

    if (this.embeddingClient) {
      this.strategies.set(
        "semantic",
        new SemanticChunkingStrategy(this.tokenizer, this.embeddingClient),
      );
    }

    this.strategies.set(
      "hierarchical",
      new HierarchicalChunkingStrategy(this.tokenizer),
    );
  }

  /**
   * テキストをチャンクに分割する
   *
   * @param input - チャンキング入力
   * @returns チャンキング出力
   */
  async chunk(input: ChunkingInput): Promise<ChunkingOutput> {
    const startTime = Date.now();

    try {
      // バリデーション
      this.validateInput(input);

      // 戦略を取得
      const strategy = this.getStrategy(input.strategy);

      // 基本チャンキング実行
      let chunks = await strategy.chunk(input.text, input.options);

      // Contextual Embeddings適用
      if (input.advanced?.contextualEmbeddings?.enabled) {
        chunks = await this.applyContextualEmbeddings(
          chunks,
          input.text,
          input.advanced.contextualEmbeddings,
        );
      }

      // Late Chunking適用
      if (input.advanced?.lateChunking?.enabled) {
        chunks = await this.applyLateChunking(
          input.text,
          chunks,
          input.advanced.lateChunking,
        );
      }

      // 統計計算
      const statistics = this.calculateStatistics(
        chunks,
        Date.now() - startTime,
      );

      // 警告チェック
      const warnings = this.checkWarnings(chunks, input.options);

      return {
        chunks,
        statistics,
        warnings: warnings.length > 0 ? warnings : undefined,
      };
    } catch (error) {
      if (error instanceof ValidationError || error instanceof ChunkingError) {
        throw error;
      }
      throw new ChunkingError(
        `Chunking failed: ${error instanceof Error ? error.message : String(error)}`,
        { cause: error },
      );
    }
  }

  /**
   * ストリーミングチャンキング
   *
   * 大規模テキスト向けのメモリ効率的な処理
   *
   * @param input - チャンキング入力
   * @returns チャンクのAsync Iterator
   */
  async *chunkStream(input: ChunkingInput): AsyncIterableIterator<Chunk> {
    this.validateInput(input);
    const strategy = this.getStrategy(input.strategy);

    // ストリーミング対応戦略の場合
    if (
      "chunkStream" in strategy &&
      typeof strategy.chunkStream === "function"
    ) {
      yield* strategy.chunkStream(input.text, input.options);
    } else {
      // 非対応の場合は通常のチャンキング結果をストリーム化
      const chunks = await strategy.chunk(input.text, input.options);
      for (const chunk of chunks) {
        yield chunk;
      }
    }
  }

  /**
   * 利用可能な戦略を取得
   */
  getAvailableStrategies(): ChunkingStrategy[] {
    return Array.from(this.strategies.keys());
  }

  /**
   * 戦略のデフォルトオプションを取得
   */
  getDefaultOptions(strategyName: ChunkingStrategy) {
    const strategy = this.strategies.get(strategyName);
    if (!strategy) {
      throw new ChunkingError(`Strategy not found: ${strategyName}`);
    }
    return strategy.getDefaultOptions();
  }

  /**
   * 入力をバリデーションする
   */
  private validateInput(input: ChunkingInput): void {
    if (!input.text || input.text.trim().length === 0) {
      throw new ValidationError("Text cannot be empty");
    }

    if (!this.strategies.has(input.strategy)) {
      throw new ValidationError(`Invalid strategy: ${input.strategy}`);
    }

    const strategy = this.strategies.get(input.strategy)!;
    strategy.validateOptions(input.options);
  }

  /**
   * チャンキング戦略を取得する
   */
  private getStrategy(strategyName: ChunkingStrategy): IChunkingStrategy {
    const strategy = this.strategies.get(strategyName);
    if (!strategy) {
      throw new ChunkingError(`Strategy not found: ${strategyName}`);
    }
    return strategy;
  }

  /**
   * Contextual Embeddingsを適用する
   */
  private async applyContextualEmbeddings(
    chunks: Chunk[],
    wholeDocument: string,
    options: ContextualEmbeddingsOptions,
  ): Promise<ContextualChunk[]> {
    if (!this.llmClient) {
      throw new ChunkingError(
        "LLM client is required for Contextual Embeddings",
      );
    }

    const contextualChunks: ContextualChunk[] = [];

    // 文書レベルのコンテキストをキャッシュ
    let cachedDocumentContext: string | null = null;

    for (const chunk of chunks) {
      // コンテキスト生成
      const context = await this.generateContext(
        chunk.content,
        wholeDocument,
        options,
        cachedDocumentContext,
      );

      if (options.cacheContext && !cachedDocumentContext) {
        cachedDocumentContext = context;
      }

      // コンテキスト化されたコンテンツを生成
      const contextualizedContent = this.combineContextAndContent(
        context,
        chunk.content,
        options.contextPosition,
      );

      const contextTokenCount = this.tokenizer.countTokens(context);

      contextualChunks.push({
        ...chunk,
        originalContent: chunk.content,
        context,
        contextualizedContent,
        metadata: {
          ...chunk.metadata,
          documentId: chunk.metadata.documentId || "",
          contextTokenCount,
          originalTokenCount: chunk.tokenCount,
          context,
        },
      });
    }

    return contextualChunks;
  }

  /**
   * コンテキストを生成する
   */
  private async generateContext(
    chunkContent: string,
    wholeDocument: string,
    options: ContextualEmbeddingsOptions,
    cachedContext: string | null,
  ): Promise<string> {
    if (cachedContext) {
      return cachedContext;
    }

    if (!this.llmClient) {
      throw new ChunkingError("LLM client is required for context generation");
    }

    // プロンプトを構築
    const template = options.contextPromptTemplate || DEFAULT_CONTEXT_TEMPLATE;
    const prompt = template
      .replace(
        "{{WHOLE_DOCUMENT}}",
        this.truncateDocument(wholeDocument, options.contextWindowSize),
      )
      .replace("{{CHUNK_CONTENT}}", chunkContent);

    // LLMでコンテキスト生成
    const context = await this.llmClient.generate(prompt);

    return context.trim();
  }

  /**
   * 文書を切り詰める
   */
  private truncateDocument(document: string, maxTokens: number): string {
    const tokens = this.tokenizer.encode(document);
    if (tokens.length <= maxTokens) {
      return document;
    }

    const truncatedTokens = tokens.slice(0, maxTokens);
    return this.tokenizer.decode(truncatedTokens);
  }

  /**
   * コンテキストとコンテンツを結合する
   */
  private combineContextAndContent(
    context: string,
    content: string,
    position: "prefix" | "suffix" | "both",
  ): string {
    switch (position) {
      case "prefix":
        return `${context}\n\n${content}`;
      case "suffix":
        return `${content}\n\n${context}`;
      case "both":
        return `${context}\n\n${content}\n\n${context}`;
    }
  }

  /**
   * Late Chunkingを適用する
   */
  private async applyLateChunking(
    text: string,
    chunks: Chunk[],
    options: LateChunkingOptions,
  ): Promise<Chunk[]> {
    if (!this.embeddingClient) {
      throw new ChunkingError("Embedding client is required for Late Chunking");
    }

    // 1. 文書全体をトークナイズ
    const tokens = this.tokenizer.encode(text);

    // 2. 全トークンの埋め込みを生成
    const tokenEmbeddings = await this.getTokenEmbeddings(
      tokens,
      options.maxSequenceLength,
    );

    // 3. チャンク境界位置を特定
    const boundaries = this.determineChunkBoundaries(chunks);

    // 4. 境界に基づきトークン埋め込みをグループ化してプーリング
    const chunkedEmbeddings = this.poolTokenEmbeddings(
      tokenEmbeddings,
      boundaries,
      options.poolingStrategy,
    );

    // 5. 埋め込みをチャンクに付与（実際の埋め込みベクトルは別途保存）
    return chunks.map((chunk, index) => ({
      ...chunk,
      metadata: {
        ...chunk.metadata,
        lateChunking: {
          applied: true,
          embeddingDimension: chunkedEmbeddings[index]?.length ?? 0,
        },
      },
    }));
  }

  /**
   * トークン埋め込みを取得する
   */
  private async getTokenEmbeddings(
    tokens: number[],
    maxSequenceLength: number,
  ): Promise<number[][]> {
    if (!this.embeddingClient) {
      throw new ChunkingError("Embedding client is required");
    }

    const embeddings: number[][] = [];

    // シーケンス長を超える場合は分割処理
    for (let i = 0; i < tokens.length; i += maxSequenceLength) {
      const segment = tokens.slice(i, i + maxSequenceLength);
      const segmentText = this.tokenizer.decode(segment);
      const embedding = await this.embeddingClient.embed(segmentText);
      embeddings.push(embedding);
    }

    return embeddings;
  }

  /**
   * チャンク境界を決定する
   */
  private determineChunkBoundaries(chunks: Chunk[]): number[] {
    return chunks.map((chunk) => chunk.position.end);
  }

  /**
   * トークン埋め込みをプーリングする
   */
  private poolTokenEmbeddings(
    tokenEmbeddings: number[][],
    boundaries: number[],
    strategy: "mean" | "cls" | "attention",
  ): number[][] {
    // 簡略化実装: 各セグメントの埋め込みをそのまま返す
    // 実際にはトークン位置に基づく適切なプーリング処理が必要
    if (strategy === "mean") {
      // Mean pooling: すべてのトークンの平均
      return tokenEmbeddings;
    } else if (strategy === "cls") {
      // CLS pooling: 最初のトークンを使用
      return tokenEmbeddings;
    } else {
      // Attention pooling: アテンション重み付き平均
      return tokenEmbeddings;
    }
  }

  /**
   * 統計を計算する
   */
  private calculateStatistics(
    chunks: Chunk[],
    processingTimeMs: number,
  ): ChunkingStatistics {
    if (chunks.length === 0) {
      return {
        totalChunks: 0,
        avgChunkSize: 0,
        minChunkSize: 0,
        maxChunkSize: 0,
        processingTimeMs,
      };
    }

    const tokenCounts = chunks.map((c) => c.tokenCount);

    return {
      totalChunks: chunks.length,
      avgChunkSize: tokenCounts.reduce((a, b) => a + b, 0) / chunks.length,
      minChunkSize: Math.min(...tokenCounts),
      maxChunkSize: Math.max(...tokenCounts),
      processingTimeMs,
    };
  }

  /**
   * 警告をチェックする
   */
  private checkWarnings(
    chunks: Chunk[],
    options: BaseChunkingOptions,
  ): string[] {
    const warnings: string[] = [];

    const chunkSize = options.chunkSize || 512;
    const oversizedChunks = chunks.filter(
      (c) => c.tokenCount > chunkSize * 1.5,
    );

    if (oversizedChunks.length > 0) {
      warnings.push(
        `${oversizedChunks.length} chunk(s) exceed 150% of target size`,
      );
    }

    return warnings;
  }
}
