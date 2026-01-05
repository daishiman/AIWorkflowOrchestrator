# チャンキングサービス設計書

## 文書情報

| 項目       | 内容                |
| ---------- | ------------------- |
| 文書ID     | DESIGN-CHUNKING-001 |
| バージョン | 1.0.0               |
| 作成日     | 2025-12-26          |
| 最終更新日 | 2025-12-26          |
| ステータス | Draft               |
| 作成者     | Logic Dev           |
| 関連文書   | REQ-CHUNKING-001    |

---

## 1. 概要

### 1.1 目的

Embedding Generation Pipelineにおけるチャンキングサービスのアーキテクチャを設計する。4種類のチャンキング戦略（fixed, sentence, semantic, hierarchical）とContextual Embeddings、Late Chunkingの先進的手法を実装するための設計を定義する。

### 1.2 設計原則

- **Clean Architecture**: ビジネスロジックとインフラストラクチャの分離
- **Strategy Pattern**: チャンキング戦略の切り替え可能性
- **SOLID原則**: 単一責任、開放閉鎖、依存性逆転
- **型安全性**: TypeScriptの型システムを活用した堅牢な実装

### 1.3 アーキテクチャ層

```
┌─────────────────────────────────────────────────┐
│           Presentation Layer (API)              │
│        /api/chunking, ChunkingController        │
└─────────────────────────────────────────────────┘
                       ↓
┌─────────────────────────────────────────────────┐
│          Application Layer (Service)            │
│              ChunkingService                    │
└─────────────────────────────────────────────────┘
                       ↓
┌─────────────────────────────────────────────────┐
│            Domain Layer (Core)                  │
│   IChunkingStrategy, ChunkingContext            │
│   FixedStrategy, SentenceStrategy,              │
│   SemanticStrategy, HierarchicalStrategy        │
└─────────────────────────────────────────────────┘
                       ↓
┌─────────────────────────────────────────────────┐
│        Infrastructure Layer (External)          │
│   Tokenizer, EmbeddingClient, LLMClient         │
└─────────────────────────────────────────────────┘
```

---

## 2. コア設計

### 2.1 型定義

#### 2.1.1 チャンキング戦略型

```typescript
/**
 * チャンキング戦略の種類
 */
export type ChunkingStrategy =
  | "fixed"
  | "sentence"
  | "semantic"
  | "hierarchical";

/**
 * ドキュメントタイプ
 */
export type DocumentType =
  | "markdown"
  | "text"
  | "html"
  | "pdf"
  | "code"
  | "json"
  | "api-spec"
  | "conversation"
  | "legal"
  | "academic";

/**
 * チャンク境界タイプ（Late Chunking用）
 */
export type ChunkBoundary = "sentence" | "token" | "semantic";

/**
 * プーリング戦略（Late Chunking用）
 */
export type PoolingStrategy = "mean" | "cls" | "attention";
```

#### 2.1.2 チャンキングオプション

```typescript
/**
 * 共通チャンキングオプション
 */
export interface BaseChunkingOptions {
  /** チャンクサイズ（トークン数） */
  chunkSize: number;
  /** オーバーラップサイズ（トークン数） */
  overlapSize?: number;
  /** オーバーラップ率（%） */
  overlapPercentage?: number;
  /** 最小チャンクサイズ */
  minChunkSize?: number;
}

/**
 * 固定サイズチャンキングオプション
 */
export interface FixedChunkingOptions extends BaseChunkingOptions {}

/**
 * 文単位チャンキングオプション
 */
export interface SentenceChunkingOptions extends BaseChunkingOptions {
  /** 目標チャンクサイズ */
  targetChunkSize: number;
  /** 最大チャンクサイズ */
  maxChunkSize: number;
  /** 文のオーバーラップ数 */
  sentenceOverlap: number;
  /** 文区切り文字 */
  sentenceDelimiters: string[];
  /** 段落境界を優先するか */
  preserveParagraphs: boolean;
}

/**
 * セマンティックチャンキングオプション
 */
export interface SemanticChunkingOptions extends BaseChunkingOptions {
  /** 目標チャンクサイズ */
  targetChunkSize: number;
  /** 最大チャンクサイズ */
  maxChunkSize: number;
  /** 文間類似度の閾値 */
  similarityThreshold: number;
  /** 類似度計算用埋め込みモデル */
  embeddingModel: string;
  /** 強制分割マーカー */
  breakPoints: string[];
}

/**
 * 階層チャンキングオプション
 */
export interface HierarchicalChunkingOptions extends BaseChunkingOptions {
  /** リーフチャンクの目標サイズ */
  targetChunkSize: number;
  /** 階層の最大深度 */
  maxDepth: number;
  /** 見出し検出パターン */
  headingPatterns: HeadingPattern;
  /** 親のコンテキストを継承するか */
  inheritParentContext: boolean;
  /** サマリーチャンクを作成するか */
  createSummaryChunks: boolean;
}

/**
 * Contextual Embeddingsオプション
 */
export interface ContextualEmbeddingsOptions {
  /** 有効化フラグ */
  enabled: boolean;
  /** コンテキストウィンドウサイズ（トークン数） */
  contextWindowSize: number;
  /** コンテキスト生成用プロンプトテンプレート */
  contextPromptTemplate: string;
  /** コンテキストの付与位置 */
  contextPosition: "prefix" | "suffix" | "both";
  /** コンテキストをキャッシュするか */
  cacheContext: boolean;
}

/**
 * Late Chunkingオプション
 */
export interface LateChunkingOptions {
  /** 有効化フラグ */
  enabled: boolean;
  /** 埋め込みモデル */
  embeddingModel: string;
  /** チャンク境界の決定方法 */
  chunkBoundaries: ChunkBoundary;
  /** 最大シーケンス長 */
  maxSequenceLength: number;
  /** プーリング戦略 */
  poolingStrategy: PoolingStrategy;
}

/**
 * 統合チャンキングオプション
 */
export type ChunkingOptions =
  | FixedChunkingOptions
  | SentenceChunkingOptions
  | SemanticChunkingOptions
  | HierarchicalChunkingOptions;
```

#### 2.1.3 入出力型

```typescript
/**
 * チャンキング入力
 */
export interface ChunkingInput {
  /** 処理対象テキスト */
  text: string;

  /** チャンキング戦略 */
  strategy: ChunkingStrategy;

  /** 戦略固有のオプション */
  options: ChunkingOptions;

  /** メタデータ */
  metadata?: {
    documentId: string;
    documentType?: DocumentType;
    sourceFile?: string;
  };

  /** 拡張オプション */
  advanced?: {
    contextualEmbeddings?: ContextualEmbeddingsOptions;
    lateChunking?: LateChunkingOptions;
  };
}

/**
 * チャンク位置情報
 */
export interface ChunkPosition {
  /** 開始位置（文字インデックス） */
  start: number;
  /** 終了位置（文字インデックス） */
  end: number;
}

/**
 * チャンクオーバーラップ情報
 */
export interface ChunkOverlap {
  /** 前のチャンクとの重複トークン数 */
  previous: number;
  /** 次のチャンクとの重複トークン数 */
  next: number;
}

/**
 * チャンクメタデータ
 */
export interface ChunkMetadata {
  /** 使用した戦略 */
  strategy: ChunkingStrategy;
  /** オーバーラップ情報 */
  overlap?: ChunkOverlap;
  /** 階層パス */
  hierarchyPath?: string[];
  /** コンテキスト情報 */
  context?: string;
  /** ドキュメントID */
  documentId?: string;
  /** チャンクインデックス */
  chunkIndex?: number;
}

/**
 * チャンク
 */
export interface Chunk {
  /** チャンクID */
  id: string;
  /** チャンク内容 */
  content: string;
  /** トークン数 */
  tokenCount: number;
  /** 位置情報 */
  position: ChunkPosition;
  /** メタデータ */
  metadata: ChunkMetadata;
}

/**
 * 階層チャンク
 */
export interface HierarchicalChunk extends Chunk {
  /** 階層レベル（0=ルート, 1=H1, 2=H2, ...） */
  level: number;
  /** 親チャンクID */
  parentId: string | null;
  /** 子チャンクID配列 */
  childIds: string[];
  /** 階層パス */
  path: string[];
  /** 見出し情報 */
  metadata: ChunkMetadata & {
    heading: string;
    position: number;
  };
}

/**
 * Contextualチャンク
 */
export interface ContextualChunk extends Chunk {
  /** 元のチャンク内容 */
  originalContent: string;
  /** 生成されたコンテキスト */
  context: string;
  /** コンテキスト化された内容 */
  contextualizedContent: string;
  /** コンテキストメタデータ */
  metadata: ChunkMetadata & {
    documentId: string;
    contextTokenCount: number;
    originalTokenCount: number;
  };
}

/**
 * チャンキング統計
 */
export interface ChunkingStatistics {
  /** 総チャンク数 */
  totalChunks: number;
  /** 平均チャンクサイズ */
  avgChunkSize: number;
  /** 最小チャンクサイズ */
  minChunkSize: number;
  /** 最大チャンクサイズ */
  maxChunkSize: number;
  /** 処理時間（ミリ秒） */
  processingTimeMs: number;
}

/**
 * チャンキング出力
 */
export interface ChunkingOutput {
  /** 生成されたチャンク */
  chunks: Chunk[];
  /** 処理統計 */
  statistics: ChunkingStatistics;
  /** 警告メッセージ */
  warnings?: string[];
}
```

---

### 2.2 インターフェース設計

#### 2.2.1 IChunkingStrategy インターフェース

```typescript
/**
 * チャンキング戦略インターフェース
 *
 * Strategy Patternの実装。各チャンキング戦略はこのインターフェースを実装する。
 */
export interface IChunkingStrategy {
  /**
   * 戦略名
   */
  readonly name: ChunkingStrategy;

  /**
   * テキストをチャンクに分割する
   *
   * @param text - 分割対象テキスト
   * @param options - チャンキングオプション
   * @returns チャンク配列
   * @throws {ChunkingError} チャンキング処理でエラーが発生した場合
   */
  chunk(text: string, options: ChunkingOptions): Promise<Chunk[]>;

  /**
   * オプションをバリデーションする
   *
   * @param options - チャンキングオプション
   * @throws {ValidationError} オプションが不正な場合
   */
  validateOptions(options: ChunkingOptions): void;

  /**
   * デフォルトオプションを取得する
   *
   * @returns デフォルトオプション
   */
  getDefaultOptions(): ChunkingOptions;
}
```

#### 2.2.2 ITokenizer インターフェース

```typescript
/**
 * トークナイザーインターフェース
 */
export interface ITokenizer {
  /**
   * テキストをトークンに分割する
   *
   * @param text - トークン化対象テキスト
   * @returns トークンID配列
   */
  encode(text: string): number[];

  /**
   * トークンIDをテキストに変換する
   *
   * @param tokens - トークンID配列
   * @returns テキスト
   */
  decode(tokens: number[]): string;

  /**
   * テキストのトークン数をカウントする
   *
   * @param text - カウント対象テキスト
   * @returns トークン数
   */
  countTokens(text: string): number;
}
```

#### 2.2.3 IEmbeddingClient インターフェース

```typescript
/**
 * 埋め込みクライアントインターフェース
 *
 * セマンティックチャンキングとLate Chunkingで使用
 */
export interface IEmbeddingClient {
  /**
   * テキストの埋め込みベクトルを生成する
   *
   * @param text - 埋め込み対象テキスト
   * @param model - 埋め込みモデル名
   * @returns 埋め込みベクトル
   */
  embed(text: string, model: string): Promise<number[]>;

  /**
   * 複数テキストの埋め込みベクトルをバッチ生成する
   *
   * @param texts - 埋め込み対象テキスト配列
   * @param model - 埋め込みモデル名
   * @returns 埋め込みベクトル配列
   */
  embedBatch(texts: string[], model: string): Promise<number[][]>;
}
```

#### 2.2.4 ILLMClient インターフェース

```typescript
/**
 * LLMクライアントインターフェース
 *
 * Contextual Embeddings生成で使用
 */
export interface ILLMClient {
  /**
   * プロンプトを送信して応答を取得する
   *
   * @param prompt - プロンプト
   * @param options - LLMオプション
   * @returns 応答テキスト
   */
  complete(prompt: string, options?: LLMOptions): Promise<string>;
}

export interface LLMOptions {
  /** 最大トークン数 */
  maxTokens?: number;
  /** 温度パラメータ */
  temperature?: number;
  /** タイムアウト（ミリ秒） */
  timeout?: number;
}
```

---

### 2.3 ChunkingServiceクラス設計

```typescript
/**
 * チャンキングサービス
 *
 * Application Layerのファサード。各チャンキング戦略を統合し、
 * Contextual EmbeddingsとLate Chunkingの処理を行う。
 */
export class ChunkingService {
  private strategies: Map<ChunkingStrategy, IChunkingStrategy>;
  private tokenizer: ITokenizer;
  private embeddingClient: IEmbeddingClient;
  private llmClient: ILLMClient;

  /**
   * コンストラクタ
   *
   * @param tokenizer - トークナイザー
   * @param embeddingClient - 埋め込みクライアント
   * @param llmClient - LLMクライアント
   */
  constructor(
    tokenizer: ITokenizer,
    embeddingClient: IEmbeddingClient,
    llmClient: ILLMClient,
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
    this.strategies.set(
      "semantic",
      new SemanticChunkingStrategy(this.tokenizer, this.embeddingClient),
    );
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

    // プロンプトを構築
    const prompt = options.contextPromptTemplate
      .replace(
        "{{WHOLE_DOCUMENT}}",
        this.truncateDocument(wholeDocument, options.contextWindowSize),
      )
      .replace("{{CHUNK_CONTENT}}", chunkContent);

    // LLMでコンテキスト生成
    const context = await this.llmClient.complete(prompt, {
      maxTokens: 200,
      temperature: 0.3,
      timeout: 60000,
    });

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
    // 1. 文書全体をトークナイズ
    const tokens = this.tokenizer.encode(text);

    // 2. 全トークンの埋め込みを生成
    const tokenEmbeddings = await this.getTokenEmbeddings(
      tokens,
      options.embeddingModel,
      options.maxSequenceLength,
    );

    // 3. チャンク境界位置を特定
    const boundaries = this.determineChunkBoundaries(
      chunks,
      text,
      options.chunkBoundaries,
    );

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
          embeddingDimension: chunkedEmbeddings[index].length,
        },
      },
    }));
  }

  /**
   * トークン埋め込みを取得する
   */
  private async getTokenEmbeddings(
    tokens: number[],
    model: string,
    maxSequenceLength: number,
  ): Promise<number[][]> {
    const embeddings: number[][] = [];

    // シーケンス長を超える場合は分割処理
    for (let i = 0; i < tokens.length; i += maxSequenceLength) {
      const segment = tokens.slice(i, i + maxSequenceLength);
      const segmentText = this.tokenizer.decode(segment);
      const embedding = await this.embeddingClient.embed(segmentText, model);
      embeddings.push(embedding);
    }

    return embeddings;
  }

  /**
   * チャンク境界を決定する
   */
  private determineChunkBoundaries(
    chunks: Chunk[],
    text: string,
    boundaryType: ChunkBoundary,
  ): number[] {
    return chunks.map((chunk) => chunk.position.end);
  }

  /**
   * トークン埋め込みをプーリングする
   */
  private poolTokenEmbeddings(
    tokenEmbeddings: number[][],
    boundaries: number[],
    strategy: PoolingStrategy,
  ): number[][] {
    // 簡略化：実際にはトークン位置に基づく適切なプーリング処理が必要
    return tokenEmbeddings;
  }

  /**
   * 統計を計算する
   */
  private calculateStatistics(
    chunks: Chunk[],
    processingTimeMs: number,
  ): ChunkingStatistics {
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
  private checkWarnings(chunks: Chunk[], options: ChunkingOptions): string[] {
    const warnings: string[] = [];

    const baseOptions = options as BaseChunkingOptions;
    const oversizedChunks = chunks.filter(
      (c) => c.tokenCount > baseOptions.chunkSize * 1.5,
    );

    if (oversizedChunks.length > 0) {
      warnings.push(
        `${oversizedChunks.length} chunk(s) exceed 150% of target size`,
      );
    }

    return warnings;
  }
}
```

---

## 3. チャンキング戦略実装

### 3.1 BaseChunkingStrategy抽象クラス

```typescript
/**
 * チャンキング戦略の基底クラス
 *
 * 共通処理を提供し、テンプレートメソッドパターンを実装
 */
export abstract class BaseChunkingStrategy implements IChunkingStrategy {
  protected tokenizer: ITokenizer;

  constructor(tokenizer: ITokenizer) {
    this.tokenizer = tokenizer;
  }

  abstract readonly name: ChunkingStrategy;

  abstract chunk(text: string, options: ChunkingOptions): Promise<Chunk[]>;

  abstract validateOptions(options: ChunkingOptions): void;

  abstract getDefaultOptions(): ChunkingOptions;

  /**
   * チャンクIDを生成する
   */
  protected generateChunkId(documentId: string, index: number): string {
    return `${documentId}-chunk-${index}`;
  }

  /**
   * オーバーラップサイズを計算する
   */
  protected calculateOverlapSize(
    chunkSize: number,
    overlapSize?: number,
    overlapPercentage?: number,
  ): number {
    if (overlapSize !== undefined) {
      return overlapSize;
    }

    if (overlapPercentage !== undefined) {
      return Math.floor(chunkSize * (overlapPercentage / 100));
    }

    return 0;
  }

  /**
   * チャンクを作成する
   */
  protected createChunk(
    id: string,
    content: string,
    position: ChunkPosition,
    metadata: ChunkMetadata,
  ): Chunk {
    return {
      id,
      content,
      tokenCount: this.tokenizer.countTokens(content),
      position,
      metadata,
    };
  }
}
```

---

### 3.2 FixedChunkingStrategy（固定サイズチャンキング）

```typescript
/**
 * 固定サイズチャンキング戦略
 *
 * アルゴリズム:
 * 1. テキストをトークナイズ
 * 2. chunkSizeごとにトークンを分割
 * 3. overlapSizeだけ前のチャンクと重複させる
 * 4. 最後のチャンクがminChunkSize未満なら前のチャンクに統合
 */
export class FixedChunkingStrategy extends BaseChunkingStrategy {
  readonly name: ChunkingStrategy = "fixed";

  async chunk(text: string, options: ChunkingOptions): Promise<Chunk[]> {
    const opts = options as FixedChunkingOptions;
    this.validateOptions(opts);

    const tokens = this.tokenizer.encode(text);
    const overlapSize = this.calculateOverlapSize(
      opts.chunkSize,
      opts.overlapSize,
      opts.overlapPercentage,
    );

    const chunks: Chunk[] = [];
    let currentPosition = 0;
    let chunkIndex = 0;

    while (currentPosition < tokens.length) {
      // チャンクのトークン範囲を決定
      const start = Math.max(0, currentPosition - overlapSize);
      const end = Math.min(tokens.length, currentPosition + opts.chunkSize);

      const chunkTokens = tokens.slice(start, end);
      const chunkText = this.tokenizer.decode(chunkTokens);

      // 最後のチャンクがminChunkSize未満かチェック
      if (
        end === tokens.length &&
        chunkTokens.length < (opts.minChunkSize || 50)
      ) {
        if (chunks.length > 0) {
          // 前のチャンクに統合
          const lastChunk = chunks[chunks.length - 1];
          const mergedTokens = tokens.slice(
            this.tokenizer.encode(lastChunk.content).length - overlapSize,
            end,
          );
          const mergedText = this.tokenizer.decode(mergedTokens);

          lastChunk.content = mergedText;
          lastChunk.tokenCount = mergedTokens.length;
          lastChunk.position.end = text.length;

          break;
        }
      }

      // チャンクを作成
      const chunk = this.createChunk(
        this.generateChunkId("doc", chunkIndex),
        chunkText,
        {
          start: this.getTextPosition(text, start),
          end: this.getTextPosition(text, end),
        },
        {
          strategy: this.name,
          overlap:
            chunkIndex > 0
              ? {
                  previous: overlapSize,
                  next: 0, // 次のチャンクで設定
                }
              : undefined,
        },
      );

      chunks.push(chunk);

      // 前のチャンクのnextオーバーラップを更新
      if (chunkIndex > 0 && chunks[chunkIndex - 1].metadata.overlap) {
        chunks[chunkIndex - 1].metadata.overlap!.next = overlapSize;
      }

      currentPosition += opts.chunkSize;
      chunkIndex++;
    }

    return chunks;
  }

  validateOptions(options: ChunkingOptions): void {
    const opts = options as FixedChunkingOptions;

    if (opts.chunkSize < 128 || opts.chunkSize > 8192) {
      throw new ValidationError("chunkSize must be between 128 and 8192");
    }

    if (opts.overlapSize !== undefined) {
      if (opts.overlapSize < 0 || opts.overlapSize > opts.chunkSize / 2) {
        throw new ValidationError(
          "overlapSize must be between 0 and chunkSize/2",
        );
      }
    }

    if (opts.overlapPercentage !== undefined) {
      if (opts.overlapPercentage < 0 || opts.overlapPercentage > 50) {
        throw new ValidationError("overlapPercentage must be between 0 and 50");
      }
    }
  }

  getDefaultOptions(): FixedChunkingOptions {
    return {
      chunkSize: 512,
      overlapSize: 64,
      minChunkSize: 50,
    };
  }

  /**
   * トークンインデックスからテキスト位置を取得
   */
  private getTextPosition(text: string, tokenIndex: number): number {
    // 簡略化: 実際にはトークンマッピングが必要
    return Math.floor(
      (tokenIndex / this.tokenizer.countTokens(text)) * text.length,
    );
  }
}
```

---

### 3.3 SentenceChunkingStrategy（文単位チャンキング）

```typescript
/**
 * 文単位チャンキング戦略
 *
 * アルゴリズム:
 * 1. テキストを文に分割
 * 2. targetChunkSizeに収まるように文をグループ化
 * 3. maxChunkSizeを超えないように調整
 * 4. sentenceOverlap分の文を重複させる
 */
export class SentenceChunkingStrategy extends BaseChunkingStrategy {
  readonly name: ChunkingStrategy = "sentence";

  async chunk(text: string, options: ChunkingOptions): Promise<Chunk[]> {
    const opts = options as SentenceChunkingOptions;
    this.validateOptions(opts);

    // 文に分割
    const sentences = this.splitIntoSentences(text, opts.sentenceDelimiters);

    const chunks: Chunk[] = [];
    let currentChunk: string[] = [];
    let currentTokenCount = 0;
    let chunkIndex = 0;

    for (let i = 0; i < sentences.length; i++) {
      const sentence = sentences[i];
      const sentenceTokenCount = this.tokenizer.countTokens(sentence);

      // 単一文がmaxChunkSizeを超える場合
      if (sentenceTokenCount > opts.maxChunkSize) {
        // 現在のチャンクを確定
        if (currentChunk.length > 0) {
          chunks.push(
            this.createChunkFromSentences(
              currentChunk,
              chunkIndex++,
              text,
              opts,
            ),
          );
          currentChunk = [];
          currentTokenCount = 0;
        }

        // 長い文を単独チャンクとして追加（警告付き）
        console.warn(
          `Sentence exceeds maxChunkSize: ${sentenceTokenCount} tokens`,
        );
        chunks.push(
          this.createChunkFromSentences([sentence], chunkIndex++, text, opts),
        );
        continue;
      }

      // targetChunkSizeを超える場合はチャンクを確定
      if (
        currentTokenCount + sentenceTokenCount > opts.targetChunkSize &&
        currentChunk.length > 0
      ) {
        chunks.push(
          this.createChunkFromSentences(currentChunk, chunkIndex++, text, opts),
        );

        // オーバーラップ分の文を保持
        if (opts.sentenceOverlap > 0) {
          currentChunk = currentChunk.slice(-opts.sentenceOverlap);
          currentTokenCount = currentChunk.reduce(
            (sum, s) => sum + this.tokenizer.countTokens(s),
            0,
          );
        } else {
          currentChunk = [];
          currentTokenCount = 0;
        }
      }

      currentChunk.push(sentence);
      currentTokenCount += sentenceTokenCount;
    }

    // 残りのチャンクを追加
    if (currentChunk.length > 0) {
      chunks.push(
        this.createChunkFromSentences(currentChunk, chunkIndex++, text, opts),
      );
    }

    return chunks;
  }

  /**
   * テキストを文に分割
   */
  private splitIntoSentences(text: string, delimiters: string[]): string[] {
    const delimiterPattern = delimiters
      .map((d) => this.escapeRegex(d))
      .join("|");
    const regex = new RegExp(`(.*?(?:${delimiterPattern}))`, "g");

    const sentences: string[] = [];
    let match;
    let lastIndex = 0;

    while ((match = regex.exec(text)) !== null) {
      sentences.push(match[1]);
      lastIndex = regex.lastIndex;
    }

    // 残りのテキスト
    if (lastIndex < text.length) {
      sentences.push(text.substring(lastIndex));
    }

    return sentences.filter((s) => s.trim().length > 0);
  }

  /**
   * 正規表現の特殊文字をエスケープ
   */
  private escapeRegex(str: string): string {
    return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }

  /**
   * 文配列からチャンクを作成
   */
  private createChunkFromSentences(
    sentences: string[],
    chunkIndex: number,
    originalText: string,
    options: SentenceChunkingOptions,
  ): Chunk {
    const content = sentences.join(" ");
    const start = originalText.indexOf(sentences[0]);
    const end = start + content.length;

    return this.createChunk(
      this.generateChunkId("doc", chunkIndex),
      content,
      { start, end },
      {
        strategy: this.name,
        overlap:
          chunkIndex > 0
            ? {
                previous: options.sentenceOverlap,
                next: 0,
              }
            : undefined,
      },
    );
  }

  validateOptions(options: ChunkingOptions): void {
    const opts = options as SentenceChunkingOptions;

    if (opts.targetChunkSize < 128 || opts.targetChunkSize > 4096) {
      throw new ValidationError("targetChunkSize must be between 128 and 4096");
    }

    if (opts.maxChunkSize < opts.targetChunkSize) {
      throw new ValidationError("maxChunkSize must be >= targetChunkSize");
    }

    if (opts.sentenceOverlap < 0 || opts.sentenceOverlap > 5) {
      throw new ValidationError("sentenceOverlap must be between 0 and 5");
    }
  }

  getDefaultOptions(): SentenceChunkingOptions {
    return {
      chunkSize: 512,
      targetChunkSize: 512,
      maxChunkSize: 768,
      sentenceOverlap: 1,
      sentenceDelimiters: [".", "!", "?", "。", "!", "?"],
      preserveParagraphs: true,
    };
  }
}
```

---

### 3.4 SemanticChunkingStrategy（セマンティックチャンキング）

```typescript
/**
 * セマンティックチャンキング戦略
 *
 * アルゴリズム:
 * 1. テキストを文に分割
 * 2. 各文の埋め込みベクトルを生成
 * 3. 連続する文間のコサイン類似度を計算
 * 4. 類似度がsimilarityThreshold以下の箇所で分割
 * 5. breakPointsで強制分割
 */
export class SemanticChunkingStrategy extends BaseChunkingStrategy {
  readonly name: ChunkingStrategy = "semantic";
  private embeddingClient: IEmbeddingClient;

  constructor(tokenizer: ITokenizer, embeddingClient: IEmbeddingClient) {
    super(tokenizer);
    this.embeddingClient = embeddingClient;
  }

  async chunk(text: string, options: ChunkingOptions): Promise<Chunk[]> {
    const opts = options as SemanticChunkingOptions;
    this.validateOptions(opts);

    // 文に分割
    const sentences = this.splitIntoSentences(text);

    // 強制分割ポイントを検出
    const breakPointIndices = this.findBreakPoints(sentences, opts.breakPoints);

    // 各文の埋め込みを生成
    const embeddings = await this.embeddingClient.embedBatch(
      sentences,
      opts.embeddingModel,
    );

    // 文間の類似度を計算
    const similarities = this.calculateSimilarities(embeddings);

    // 分割ポイントを決定
    const splitIndices = this.determineSplitPoints(
      similarities,
      opts.similarityThreshold,
      breakPointIndices,
    );

    // チャンクを構築
    const chunks = this.buildChunks(sentences, splitIndices, text, opts);

    return chunks;
  }

  /**
   * テキストを文に分割
   */
  private splitIntoSentences(text: string): string[] {
    const delimiters = [".", "!", "?", "。", "!", "?"];
    const delimiterPattern = delimiters.map((d) => `\\${d}`).join("|");
    const regex = new RegExp(`(.*?(?:${delimiterPattern}))`, "g");

    const sentences: string[] = [];
    let match;
    let lastIndex = 0;

    while ((match = regex.exec(text)) !== null) {
      sentences.push(match[1].trim());
      lastIndex = regex.lastIndex;
    }

    if (lastIndex < text.length) {
      sentences.push(text.substring(lastIndex).trim());
    }

    return sentences.filter((s) => s.length > 0);
  }

  /**
   * 強制分割ポイントを検出
   */
  private findBreakPoints(
    sentences: string[],
    breakPoints: string[],
  ): Set<number> {
    const indices = new Set<number>();

    sentences.forEach((sentence, index) => {
      for (const breakPoint of breakPoints) {
        if (sentence.includes(breakPoint)) {
          indices.add(index);
          break;
        }
      }
    });

    return indices;
  }

  /**
   * 埋め込みベクトル間のコサイン類似度を計算
   */
  private calculateSimilarities(embeddings: number[][]): number[] {
    const similarities: number[] = [];

    for (let i = 0; i < embeddings.length - 1; i++) {
      const similarity = this.cosineSimilarity(
        embeddings[i],
        embeddings[i + 1],
      );
      similarities.push(similarity);
    }

    return similarities;
  }

  /**
   * コサイン類似度を計算
   */
  private cosineSimilarity(vec1: number[], vec2: number[]): number {
    let dotProduct = 0;
    let norm1 = 0;
    let norm2 = 0;

    for (let i = 0; i < vec1.length; i++) {
      dotProduct += vec1[i] * vec2[i];
      norm1 += vec1[i] * vec1[i];
      norm2 += vec2[i] * vec2[i];
    }

    return dotProduct / (Math.sqrt(norm1) * Math.sqrt(norm2));
  }

  /**
   * 分割ポイントを決定
   */
  private determineSplitPoints(
    similarities: number[],
    threshold: number,
    breakPoints: Set<number>,
  ): number[] {
    const splitIndices: number[] = [0];

    for (let i = 0; i < similarities.length; i++) {
      if (similarities[i] < threshold || breakPoints.has(i)) {
        splitIndices.push(i + 1);
      }
    }

    return splitIndices;
  }

  /**
   * チャンクを構築
   */
  private buildChunks(
    sentences: string[],
    splitIndices: number[],
    originalText: string,
    options: SemanticChunkingOptions,
  ): Chunk[] {
    const chunks: Chunk[] = [];

    for (let i = 0; i < splitIndices.length; i++) {
      const start = splitIndices[i];
      const end =
        i < splitIndices.length - 1 ? splitIndices[i + 1] : sentences.length;

      const chunkSentences = sentences.slice(start, end);
      const content = chunkSentences.join(" ");

      // トークン数チェック
      const tokenCount = this.tokenizer.countTokens(content);
      if (tokenCount > options.maxChunkSize) {
        // maxChunkSizeを超える場合は再分割
        console.warn(
          `Semantic chunk exceeds maxChunkSize: ${tokenCount} tokens`,
        );
        // TODO: 再分割ロジック
      }

      const textStart = originalText.indexOf(chunkSentences[0]);
      const textEnd = textStart + content.length;

      chunks.push(
        this.createChunk(
          this.generateChunkId("doc", i),
          content,
          { start: textStart, end: textEnd },
          {
            strategy: this.name,
          },
        ),
      );
    }

    return chunks;
  }

  validateOptions(options: ChunkingOptions): void {
    const opts = options as SemanticChunkingOptions;

    if (opts.similarityThreshold < 0 || opts.similarityThreshold > 1) {
      throw new ValidationError("similarityThreshold must be between 0 and 1");
    }

    if (!opts.embeddingModel) {
      throw new ValidationError("embeddingModel is required");
    }
  }

  getDefaultOptions(): SemanticChunkingOptions {
    return {
      chunkSize: 512,
      targetChunkSize: 512,
      maxChunkSize: 1024,
      similarityThreshold: 0.7,
      embeddingModel: "text-embedding-3-small",
      breakPoints: ["##", "###", "---"],
    };
  }
}
```

---

### 3.5 HierarchicalChunkingStrategy（階層チャンキング）

```typescript
/**
 * 階層チャンキング戦略
 *
 * アルゴリズム:
 * 1. 見出し構造を解析（Markdown: #, ##, ###...）
 * 2. 見出しレベルに基づき階層ツリーを構築
 * 3. 各ノードをチャンクに変換
 * 4. inheritParentContextがtrueなら親の見出しを含める
 */
export class HierarchicalChunkingStrategy extends BaseChunkingStrategy {
  readonly name: ChunkingStrategy = "hierarchical";

  async chunk(text: string, options: ChunkingOptions): Promise<Chunk[]> {
    const opts = options as HierarchicalChunkingOptions;
    this.validateOptions(opts);

    // 見出しを抽出
    const headings = this.extractHeadings(text, opts.headingPatterns);

    // 階層ツリーを構築
    const tree = this.buildHierarchyTree(headings, text, opts.maxDepth);

    // ツリーをチャンクに変換
    const chunks = this.treeToChunks(tree, opts);

    return chunks;
  }

  /**
   * 見出しを抽出
   */
  private extractHeadings(text: string, patterns: HeadingPattern): Heading[] {
    const headings: Heading[] = [];

    // Markdown見出しパターン
    const markdownRegex = /^(#{1,6})\s+(.+)$/gm;
    let match;

    while ((match = markdownRegex.exec(text)) !== null) {
      const level = match[1].length;
      const title = match[2].trim();
      const position = match.index;

      headings.push({
        level,
        title,
        position,
        content: "",
      });
    }

    // 各見出しのコンテンツを抽出
    for (let i = 0; i < headings.length; i++) {
      const start = headings[i].position;
      const end =
        i < headings.length - 1 ? headings[i + 1].position : text.length;
      headings[i].content = text.substring(start, end).trim();
    }

    return headings;
  }

  /**
   * 階層ツリーを構築
   */
  private buildHierarchyTree(
    headings: Heading[],
    text: string,
    maxDepth: number,
  ): HierarchyNode {
    const root: HierarchyNode = {
      level: 0,
      title: "root",
      content: text,
      position: 0,
      children: [],
    };

    const stack: HierarchyNode[] = [root];

    for (const heading of headings) {
      const adjustedLevel = Math.min(heading.level, maxDepth);
      const node: HierarchyNode = {
        level: adjustedLevel,
        title: heading.title,
        content: heading.content,
        position: heading.position,
        children: [],
      };

      // 適切な親を見つける
      while (
        stack.length > 1 &&
        stack[stack.length - 1].level >= adjustedLevel
      ) {
        stack.pop();
      }

      const parent = stack[stack.length - 1];
      parent.children.push(node);
      stack.push(node);
    }

    return root;
  }

  /**
   * ツリーをチャンクに変換
   */
  private treeToChunks(
    root: HierarchyNode,
    options: HierarchicalChunkingOptions,
  ): HierarchicalChunk[] {
    const chunks: HierarchicalChunk[] = [];
    let chunkIndex = 0;

    const traverse = (
      node: HierarchyNode,
      path: string[],
      parentId: string | null,
    ) => {
      const currentPath = [...path, node.title];
      const chunkId = this.generateChunkId("doc", chunkIndex++);

      // ノードのコンテンツをチャンキング
      const nodeChunks = this.chunkNodeContent(
        node,
        chunkId,
        currentPath,
        parentId,
        options,
      );

      chunks.push(...nodeChunks);

      // 子ノードを再帰的に処理
      for (const child of node.children) {
        traverse(child, currentPath, chunkId);
      }
    };

    // ルートの子から開始
    for (const child of root.children) {
      traverse(child, [], null);
    }

    return chunks;
  }

  /**
   * ノードのコンテンツをチャンキング
   */
  private chunkNodeContent(
    node: HierarchyNode,
    chunkId: string,
    path: string[],
    parentId: string | null,
    options: HierarchicalChunkingOptions,
  ): HierarchicalChunk[] {
    const chunks: HierarchicalChunk[] = [];

    // コンテキストを含めるか
    let content = node.content;
    if (options.inheritParentContext && path.length > 1) {
      const context = path.slice(0, -1).join(" > ");
      content = `Context: ${context}\n\n${content}`;
    }

    const tokenCount = this.tokenizer.countTokens(content);

    // targetChunkSizeを超える場合は分割
    if (tokenCount > options.targetChunkSize) {
      // 段落または文で分割
      const subcontent = this.splitContent(content, options.targetChunkSize);

      subcontent.forEach((sub, index) => {
        chunks.push({
          id: `${chunkId}-${index}`,
          content: sub,
          tokenCount: this.tokenizer.countTokens(sub),
          position: {
            start: node.position,
            end: node.position + content.length,
          },
          level: node.level,
          parentId,
          childIds: [],
          path,
          metadata: {
            strategy: this.name,
            hierarchyPath: path,
            heading: node.title,
            position: node.position,
          },
        });
      });
    } else {
      chunks.push({
        id: chunkId,
        content,
        tokenCount,
        position: {
          start: node.position,
          end: node.position + content.length,
        },
        level: node.level,
        parentId,
        childIds: [],
        path,
        metadata: {
          strategy: this.name,
          hierarchyPath: path,
          heading: node.title,
          position: node.position,
        },
      });
    }

    return chunks;
  }

  /**
   * コンテンツを分割
   */
  private splitContent(content: string, targetSize: number): string[] {
    // 段落で分割
    const paragraphs = content.split(/\n\n+/);
    const chunks: string[] = [];
    let currentChunk = "";

    for (const para of paragraphs) {
      const combinedTokens = this.tokenizer.countTokens(
        currentChunk + "\n\n" + para,
      );

      if (combinedTokens > targetSize && currentChunk.length > 0) {
        chunks.push(currentChunk);
        currentChunk = para;
      } else {
        currentChunk = currentChunk ? `${currentChunk}\n\n${para}` : para;
      }
    }

    if (currentChunk) {
      chunks.push(currentChunk);
    }

    return chunks;
  }

  validateOptions(options: ChunkingOptions): void {
    const opts = options as HierarchicalChunkingOptions;

    if (opts.maxDepth < 1 || opts.maxDepth > 6) {
      throw new ValidationError("maxDepth must be between 1 and 6");
    }

    if (opts.targetChunkSize < 128 || opts.targetChunkSize > 4096) {
      throw new ValidationError("targetChunkSize must be between 128 and 4096");
    }
  }

  getDefaultOptions(): HierarchicalChunkingOptions {
    return {
      chunkSize: 512,
      targetChunkSize: 512,
      maxDepth: 3,
      headingPatterns: { type: "markdown" },
      inheritParentContext: true,
      createSummaryChunks: false,
    };
  }
}

/**
 * 見出し情報
 */
interface Heading {
  level: number;
  title: string;
  position: number;
  content: string;
}

/**
 * 階層ノード
 */
interface HierarchyNode {
  level: number;
  title: string;
  content: string;
  position: number;
  children: HierarchyNode[];
}

/**
 * 見出しパターン
 */
type HeadingPattern = {
  type: "markdown" | "html" | "custom";
  customPattern?: RegExp;
};
```

---

## 4. エラーハンドリング

### 4.1 エラークラス定義

```typescript
/**
 * チャンキングエラー基底クラス
 */
export class ChunkingError extends Error {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = "ChunkingError";
  }
}

/**
 * バリデーションエラー
 */
export class ValidationError extends ChunkingError {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = "ValidationError";
  }
}

/**
 * トークナイゼーションエラー
 */
export class TokenizationError extends ChunkingError {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = "TokenizationError";
  }
}

/**
 * 埋め込み生成エラー
 */
export class EmbeddingError extends ChunkingError {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = "EmbeddingError";
  }
}

/**
 * LLM APIエラー
 */
export class LLMError extends ChunkingError {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = "LLMError";
  }
}
```

### 4.2 エラーハンドリング戦略

```typescript
/**
 * エラーハンドラー
 */
export class ChunkingErrorHandler {
  /**
   * リトライ可能なエラーかチェック
   */
  static isRetryable(error: Error): boolean {
    if (error instanceof EmbeddingError || error instanceof LLMError) {
      return true;
    }

    // ネットワークエラー
    if (
      error.message.includes("ECONNRESET") ||
      error.message.includes("ETIMEDOUT")
    ) {
      return true;
    }

    return false;
  }

  /**
   * リトライ処理（指数バックオフ）
   */
  static async retry<T>(
    fn: () => Promise<T>,
    maxRetries: number = 3,
    baseDelay: number = 1000,
  ): Promise<T> {
    let lastError: Error;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error as Error;

        if (!this.isRetryable(lastError) || attempt === maxRetries - 1) {
          throw lastError;
        }

        const delay = baseDelay * Math.pow(2, attempt) * (0.5 + Math.random());
        await this.sleep(delay);
      }
    }

    throw lastError!;
  }

  private static sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
```

---

## 5. テスト戦略

### 5.1 ユニットテスト

```typescript
describe("FixedChunkingStrategy", () => {
  let strategy: FixedChunkingStrategy;
  let tokenizer: ITokenizer;

  beforeEach(() => {
    tokenizer = new MockTokenizer();
    strategy = new FixedChunkingStrategy(tokenizer);
  });

  describe("chunk", () => {
    it("should split text into fixed-size chunks", async () => {
      const text = "A".repeat(2000);
      const options: FixedChunkingOptions = {
        chunkSize: 512,
        overlapSize: 64,
        minChunkSize: 50,
      };

      const result = await strategy.chunk(text, options);

      expect(result.length).toBeGreaterThan(0);
      expect(result[0].tokenCount).toBeLessThanOrEqual(512);
    });

    it("should apply overlap between chunks", async () => {
      const text = "A".repeat(2000);
      const options: FixedChunkingOptions = {
        chunkSize: 512,
        overlapSize: 64,
        minChunkSize: 50,
      };

      const result = await strategy.chunk(text, options);

      expect(result[0].metadata.overlap?.next).toBe(64);
      expect(result[1].metadata.overlap?.previous).toBe(64);
    });

    it("should merge last chunk if below minChunkSize", async () => {
      const text = "A".repeat(600);
      const options: FixedChunkingOptions = {
        chunkSize: 512,
        overlapSize: 0,
        minChunkSize: 50,
      };

      const result = await strategy.chunk(text, options);

      // 最後のチャンクは前のチャンクに統合されるべき
      expect(result.length).toBe(1);
    });
  });

  describe("validateOptions", () => {
    it("should throw error for invalid chunkSize", () => {
      const options: FixedChunkingOptions = {
        chunkSize: 100, // 最小値128未満
        minChunkSize: 50,
      };

      expect(() => strategy.validateOptions(options)).toThrow(ValidationError);
    });
  });
});
```

### 5.2 統合テスト

```typescript
describe("ChunkingService Integration", () => {
  let service: ChunkingService;

  beforeEach(() => {
    const tokenizer = new TiktokenTokenizer();
    const embeddingClient = new OpenAIEmbeddingClient();
    const llmClient = new AnthropicLLMClient();

    service = new ChunkingService(tokenizer, embeddingClient, llmClient);
  });

  it("should apply contextual embeddings", async () => {
    const input: ChunkingInput = {
      text: "Test document. First chunk. Second chunk.",
      strategy: "fixed",
      options: {
        chunkSize: 10,
        minChunkSize: 5,
      },
      advanced: {
        contextualEmbeddings: {
          enabled: true,
          contextWindowSize: 4096,
          contextPromptTemplate: DEFAULT_CONTEXT_TEMPLATE,
          contextPosition: "prefix",
          cacheContext: true,
        },
      },
    };

    const result = await service.chunk(input);

    expect(result.chunks.length).toBeGreaterThan(0);
    expect((result.chunks[0] as ContextualChunk).context).toBeDefined();
  });
});
```

---

## 6. ファイル配置

```
packages/shared/src/
├── services/
│   └── chunking/
│       ├── ChunkingService.ts           # メインサービス
│       ├── strategies/
│       │   ├── IChunkingStrategy.ts     # 戦略インターフェース
│       │   ├── BaseChunkingStrategy.ts  # 基底クラス
│       │   ├── FixedChunkingStrategy.ts
│       │   ├── SentenceChunkingStrategy.ts
│       │   ├── SemanticChunkingStrategy.ts
│       │   └── HierarchicalChunkingStrategy.ts
│       ├── interfaces/
│       │   ├── ITokenizer.ts
│       │   ├── IEmbeddingClient.ts
│       │   └── ILLMClient.ts
│       ├── types/
│       │   ├── chunking.types.ts        # 全型定義
│       │   └── errors.ts                # エラークラス
│       └── utils/
│           ├── ChunkingErrorHandler.ts
│           └── ChunkingMetrics.ts       # メトリクス収集
└── __tests__/
    └── services/
        └── chunking/
            ├── FixedChunkingStrategy.test.ts
            ├── SentenceChunkingStrategy.test.ts
            ├── SemanticChunkingStrategy.test.ts
            ├── HierarchicalChunkingStrategy.test.ts
            └── ChunkingService.integration.test.ts
```

---

## 7. 変更履歴

| バージョン | 日付       | 変更者    | 変更内容 |
| ---------- | ---------- | --------- | -------- |
| 1.0.0      | 2025-12-26 | Logic Dev | 初版作成 |

---

## 8. 承認

| 役割       | 氏名      | 署名 | 日付       |
| ---------- | --------- | ---- | ---------- |
| 作成者     | Logic Dev | -    | 2025-12-26 |
| レビュワー | -         | -    | -          |
| 承認者     | -         | -    | -          |
