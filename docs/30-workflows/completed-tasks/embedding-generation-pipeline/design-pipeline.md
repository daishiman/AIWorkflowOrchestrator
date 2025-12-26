# パイプライン統合設計書

## 文書情報

| 項目       | 内容                                      |
| ---------- | ----------------------------------------- |
| 文書ID     | DESIGN-PIPELINE-001                       |
| バージョン | 1.0.0                                     |
| 作成日     | 2025-12-26                                |
| 最終更新日 | 2025-12-26                                |
| ステータス | Draft                                     |
| 作成者     | Pipeline Architect                        |
| 関連文書   | DESIGN-CHUNKING-001, DESIGN-EMBEDDING-001 |

---

## 1. 概要

### 1.1 目的

チャンキングサービスと埋め込みプロバイダーを統合し、完全なEmbedding Generation Pipelineを実現する。ドキュメントからベクトル埋め込みまでのエンドツーエンドの処理フローを設計する。

### 1.2 パイプラインフロー

```
┌──────────────┐
│   Document   │
│   (Input)    │
└──────┬───────┘
       │
       ▼
┌──────────────────────────────────────┐
│     Document Preprocessor            │
│  (Text extraction, normalization)    │
└──────────────┬───────────────────────┘
               │
               ▼
┌──────────────────────────────────────┐
│      Chunking Service                │
│  (4 strategies: fixed, sentence,     │
│   semantic, hierarchical)            │
│  + Contextual Embeddings             │
│  + Late Chunking                     │
└──────────────┬───────────────────────┘
               │
               ▼ (Chunks[])
┌──────────────────────────────────────┐
│     Embedding Service                │
│  (5 providers: OpenAI, Qwen3,        │
│   Voyage, BGE-M3, embedding-gemma)   │
│  + Batch processing                  │
│  + Fallback chain                    │
└──────────────┬───────────────────────┘
               │
               ▼ (Embeddings[])
┌──────────────────────────────────────┐
│     Vector DB Writer                 │
│  (Batch insert, deduplication)       │
└──────────────┬───────────────────────┘
               │
               ▼
┌──────────────────────────────────────┐
│    Metadata Store                    │
│  (Document metadata, chunks,         │
│   embeddings, indexing)              │
└──────────────────────────────────────┘
```

### 1.3 設計原則

- **Pipeline Pattern**: ステージ間の疎結合
- **Backpressure**: 下流の処理速度に応じた流量制御
- **Observability**: 各ステージのメトリクス収集
- **Fault Tolerance**: 障害からの回復と再開

---

## 2. コア設計

### 2.1 型定義

```typescript
/**
 * パイプライン入力
 */
export interface PipelineInput {
  /** ドキュメントID */
  documentId: string;
  /** ドキュメントタイプ */
  documentType: DocumentType;
  /** テキストコンテンツ */
  text: string;
  /** メタデータ */
  metadata?: {
    sourceFile?: string;
    author?: string;
    createdAt?: Date;
    tags?: string[];
    [key: string]: unknown;
  };
}

/**
 * パイプライン設定
 */
export interface PipelineConfig {
  /** チャンキング設定 */
  chunking: {
    strategy: ChunkingStrategy;
    options: ChunkingOptions;
    contextualEmbeddings?: ContextualEmbeddingsOptions;
    lateChunking?: LateChunkingOptions;
  };

  /** 埋め込み設定 */
  embedding: {
    modelId: EmbeddingModelId;
    fallbackChain?: EmbeddingModelId[];
    options?: EmbedOptions;
    batchOptions?: BatchEmbedOptions;
  };

  /** パイプライン制御設定 */
  pipeline: {
    /** バッチサイズ */
    batchSize?: number;
    /** 並列度 */
    concurrency?: number;
    /** バックプレッシャー閾値 */
    backpressureThreshold?: number;
    /** リトライ設定 */
    retry?: RetryOptions;
  };

  /** 永続化設定 */
  persistence: {
    /** ベクトルDB接続設定 */
    vectorDb: VectorDbConfig;
    /** メタデータストア設定 */
    metadataStore: MetadataStoreConfig;
    /** 重複排除設定 */
    deduplication?: DeduplicationConfig;
  };
}

/**
 * パイプライン出力
 */
export interface PipelineOutput {
  /** ドキュメントID */
  documentId: string;
  /** 処理されたチャンク数 */
  chunksProcessed: number;
  /** 生成された埋め込み数 */
  embeddingsGenerated: number;
  /** 処理時間（ミリ秒） */
  totalProcessingTimeMs: number;
  /** ステージ別処理時間 */
  stageTimings: {
    preprocessing: number;
    chunking: number;
    embedding: number;
    persistence: number;
  };
  /** エラー情報 */
  errors?: Array<{
    stage: string;
    error: string;
    chunkIndex?: number;
  }>;
  /** 警告情報 */
  warnings?: string[];
}

/**
 * パイプライン進捗情報
 */
export interface PipelineProgress {
  /** 現在のステージ */
  currentStage: "preprocessing" | "chunking" | "embedding" | "persistence";
  /** 進捗率（0-100） */
  progressPercentage: number;
  /** 処理済みチャンク数 */
  chunksProcessed: number;
  /** 総チャンク数 */
  totalChunks: number;
  /** 経過時間（ミリ秒） */
  elapsedTimeMs: number;
  /** 推定残り時間（ミリ秒） */
  estimatedRemainingMs?: number;
}

/**
 * ベクトルDB設定
 */
export interface VectorDbConfig {
  /** DB種類 */
  type: "qdrant" | "weaviate" | "pinecone" | "milvus";
  /** 接続URL */
  url: string;
  /** APIキー */
  apiKey?: string;
  /** コレクション名 */
  collectionName: string;
  /** バッチサイズ */
  batchSize?: number;
}

/**
 * メタデータストア設定
 */
export interface MetadataStoreConfig {
  /** ストア種類 */
  type: "postgresql" | "mongodb" | "sqlite";
  /** 接続URL */
  url: string;
  /** テーブル/コレクション名 */
  tableName: string;
}

/**
 * 重複排除設定
 */
export interface DeduplicationConfig {
  /** 有効化フラグ */
  enabled: boolean;
  /** 重複判定方法 */
  method: "content-hash" | "embedding-similarity";
  /** 類似度閾値（embedding-similarity用） */
  similarityThreshold?: number;
}
```

---

### 2.2 EmbeddingPipelineサービス

```typescript
/**
 * 埋め込み生成パイプライン
 *
 * ドキュメント→チャンク→埋め込み→ベクトルDB保存の統合フロー
 */
export class EmbeddingPipeline {
  private chunkingService: ChunkingService;
  private embeddingService: EmbeddingService;
  private vectorDbWriter: IVectorDbWriter;
  private metadataStore: IMetadataStore;
  private metricsCollector: MetricsCollector;

  constructor(
    chunkingService: ChunkingService,
    embeddingService: EmbeddingService,
    vectorDbWriter: IVectorDbWriter,
    metadataStore: IMetadataStore,
    metricsCollector: MetricsCollector,
  ) {
    this.chunkingService = chunkingService;
    this.embeddingService = embeddingService;
    this.vectorDbWriter = vectorDbWriter;
    this.metadataStore = metadataStore;
    this.metricsCollector = metricsCollector;
  }

  /**
   * パイプライン実行
   */
  async process(
    input: PipelineInput,
    config: PipelineConfig,
    onProgress?: (progress: PipelineProgress) => void,
  ): Promise<PipelineOutput> {
    const startTime = Date.now();
    const stageTimings = {
      preprocessing: 0,
      chunking: 0,
      embedding: 0,
      persistence: 0,
    };
    const errors: Array<{ stage: string; error: string; chunkIndex?: number }> =
      [];
    const warnings: string[] = [];

    try {
      // Stage 1: Preprocessing
      const preprocessingStart = Date.now();
      const preprocessedText = await this.preprocess(input);
      stageTimings.preprocessing = Date.now() - preprocessingStart;

      onProgress?.({
        currentStage: "preprocessing",
        progressPercentage: 10,
        chunksProcessed: 0,
        totalChunks: 0,
        elapsedTimeMs: Date.now() - startTime,
      });

      // Stage 2: Chunking
      const chunkingStart = Date.now();
      const chunkingResult = await this.chunkingService.chunk({
        text: preprocessedText,
        strategy: config.chunking.strategy,
        options: config.chunking.options,
        metadata: {
          documentId: input.documentId,
          documentType: input.documentType,
          sourceFile: input.metadata?.sourceFile,
        },
        advanced: {
          contextualEmbeddings: config.chunking.contextualEmbeddings,
          lateChunking: config.chunking.lateChunking,
        },
      });

      const chunks = chunkingResult.chunks;
      stageTimings.chunking = Date.now() - chunkingStart;

      if (chunkingResult.warnings) {
        warnings.push(...chunkingResult.warnings);
      }

      onProgress?.({
        currentStage: "chunking",
        progressPercentage: 30,
        chunksProcessed: 0,
        totalChunks: chunks.length,
        elapsedTimeMs: Date.now() - startTime,
      });

      // Stage 3: Embedding
      const embeddingStart = Date.now();
      const embeddings: EmbeddingResult[] = [];
      const chunkTexts = chunks.map((c) => c.content);

      // バッチ埋め込み生成
      const embeddingResult = await this.embeddingService.embedBatch(
        chunkTexts,
        config.embedding.modelId,
        {
          ...config.embedding.batchOptions,
          onProgress: (processed, total) => {
            const embeddingProgress = 30 + (processed / total) * 40;
            onProgress?.({
              currentStage: "embedding",
              progressPercentage: embeddingProgress,
              chunksProcessed: processed,
              totalChunks: total,
              elapsedTimeMs: Date.now() - startTime,
            });
          },
        },
      );

      embeddings.push(...embeddingResult.embeddings);
      stageTimings.embedding = Date.now() - embeddingStart;

      // エラー情報を収集
      if (embeddingResult.errors.length > 0) {
        for (const err of embeddingResult.errors) {
          errors.push({
            stage: "embedding",
            error: err.error,
            chunkIndex: err.index,
          });
        }
      }

      onProgress?.({
        currentStage: "embedding",
        progressPercentage: 70,
        chunksProcessed: chunks.length,
        totalChunks: chunks.length,
        elapsedTimeMs: Date.now() - startTime,
      });

      // Stage 4: Persistence
      const persistenceStart = Date.now();

      // 重複排除
      const { chunks: deduplicatedChunks, embeddings: deduplicatedEmbeddings } =
        await this.deduplicate(
          chunks,
          embeddings,
          config.persistence.deduplication,
        );

      // ベクトルDB書き込み
      await this.vectorDbWriter.batchInsert(
        deduplicatedChunks,
        deduplicatedEmbeddings,
        {
          collectionName: config.persistence.vectorDb.collectionName,
          batchSize: config.persistence.vectorDb.batchSize,
        },
      );

      // メタデータストア書き込み
      await this.metadataStore.saveDocument({
        documentId: input.documentId,
        documentType: input.documentType,
        metadata: input.metadata,
        chunks: deduplicatedChunks,
        embeddings: deduplicatedEmbeddings,
        createdAt: new Date(),
      });

      stageTimings.persistence = Date.now() - persistenceStart;

      onProgress?.({
        currentStage: "persistence",
        progressPercentage: 100,
        chunksProcessed: chunks.length,
        totalChunks: chunks.length,
        elapsedTimeMs: Date.now() - startTime,
      });

      // メトリクス記録
      this.metricsCollector.recordPipelineRun({
        documentId: input.documentId,
        chunksProcessed: chunks.length,
        embeddingsGenerated: embeddings.length,
        totalProcessingTimeMs: Date.now() - startTime,
        stageTimings,
        success: errors.length === 0,
      });

      return {
        documentId: input.documentId,
        chunksProcessed: chunks.length,
        embeddingsGenerated: embeddings.length,
        totalProcessingTimeMs: Date.now() - startTime,
        stageTimings,
        errors: errors.length > 0 ? errors : undefined,
        warnings: warnings.length > 0 ? warnings : undefined,
      };
    } catch (error) {
      // パイプライン全体のエラー
      this.metricsCollector.recordPipelineRun({
        documentId: input.documentId,
        chunksProcessed: 0,
        embeddingsGenerated: 0,
        totalProcessingTimeMs: Date.now() - startTime,
        stageTimings,
        success: false,
        error: error instanceof Error ? error.message : String(error),
      });

      throw new PipelineError(
        `Pipeline failed for document ${input.documentId}: ${error instanceof Error ? error.message : String(error)}`,
        { cause: error },
      );
    }
  }

  /**
   * ストリーミングパイプライン実行
   *
   * 大規模ドキュメント向けのメモリ効率的な処理
   */
  async *processStream(
    input: PipelineInput,
    config: PipelineConfig,
  ): AsyncIterableIterator<ChunkWithEmbedding> {
    const preprocessedText = await this.preprocess(input);

    // ストリーミングチャンキング
    const chunkStream = this.chunkingService.chunkStream({
      text: preprocessedText,
      strategy: config.chunking.strategy,
      options: config.chunking.options,
      metadata: {
        documentId: input.documentId,
        documentType: input.documentType,
      },
    });

    // チャンクごとに処理
    for await (const chunk of chunkStream) {
      try {
        // 埋め込み生成
        const embedding = await this.embeddingService.embed(
          chunk.content,
          config.embedding.modelId,
          config.embedding.options,
        );

        // ベクトルDB書き込み
        await this.vectorDbWriter.insert(chunk, embedding, {
          collectionName: config.persistence.vectorDb.collectionName,
        });

        yield {
          chunk,
          embedding,
        };
      } catch (error) {
        console.error(`Failed to process chunk ${chunk.id}:`, error);
        // 個別チャンクのエラーは継続
        continue;
      }
    }
  }

  /**
   * バッチドキュメント処理
   */
  async processBatch(
    inputs: PipelineInput[],
    config: PipelineConfig,
    options?: {
      concurrency?: number;
      onProgress?: (processed: number, total: number) => void;
    },
  ): Promise<PipelineOutput[]> {
    const concurrency = options?.concurrency || 4;
    const results: PipelineOutput[] = [];
    let processedCount = 0;

    // 並列度制御
    const executing: Promise<void>[] = [];

    for (const input of inputs) {
      const p = this.process(input, config)
        .then((result) => {
          results.push(result);
          processedCount++;
          options?.onProgress?.(processedCount, inputs.length);
        })
        .catch((error) => {
          console.error(
            `Failed to process document ${input.documentId}:`,
            error,
          );
          // 個別ドキュメントのエラーは継続
        })
        .finally(() => {
          executing.splice(executing.indexOf(p), 1);
        });

      executing.push(p);

      if (executing.length >= concurrency) {
        await Promise.race(executing);
      }
    }

    await Promise.all(executing);

    return results;
  }

  /**
   * 前処理
   */
  private async preprocess(input: PipelineInput): Promise<string> {
    let text = input.text;

    // テキスト正規化
    text = text.trim();

    // 連続する空白を削除
    text = text.replace(/\s+/g, " ");

    // 制御文字を削除
    text = text.replace(/[\x00-\x1F\x7F]/g, "");

    return text;
  }

  /**
   * 重複排除
   */
  private async deduplicate(
    chunks: Chunk[],
    embeddings: EmbeddingResult[],
    config?: DeduplicationConfig,
  ): Promise<{ chunks: Chunk[]; embeddings: EmbeddingResult[] }> {
    if (!config?.enabled) {
      return { chunks, embeddings };
    }

    if (config.method === "content-hash") {
      return this.deduplicateByContentHash(chunks, embeddings);
    } else if (config.method === "embedding-similarity") {
      return this.deduplicateByEmbeddingSimilarity(
        chunks,
        embeddings,
        config.similarityThreshold || 0.95,
      );
    }

    return { chunks, embeddings };
  }

  /**
   * コンテンツハッシュによる重複排除
   */
  private async deduplicateByContentHash(
    chunks: Chunk[],
    embeddings: EmbeddingResult[],
  ): Promise<{ chunks: Chunk[]; embeddings: EmbeddingResult[] }> {
    const seen = new Set<string>();
    const deduplicatedChunks: Chunk[] = [];
    const deduplicatedEmbeddings: EmbeddingResult[] = [];

    for (let i = 0; i < chunks.length; i++) {
      const hash = this.hashContent(chunks[i].content);

      if (!seen.has(hash)) {
        seen.add(hash);
        deduplicatedChunks.push(chunks[i]);
        deduplicatedEmbeddings.push(embeddings[i]);
      }
    }

    return { chunks: deduplicatedChunks, embeddings: deduplicatedEmbeddings };
  }

  /**
   * 埋め込み類似度による重複排除
   */
  private async deduplicateByEmbeddingSimilarity(
    chunks: Chunk[],
    embeddings: EmbeddingResult[],
    threshold: number,
  ): Promise<{ chunks: Chunk[]; embeddings: EmbeddingResult[] }> {
    const deduplicatedChunks: Chunk[] = [];
    const deduplicatedEmbeddings: EmbeddingResult[] = [];

    for (let i = 0; i < chunks.length; i++) {
      let isDuplicate = false;

      for (let j = 0; j < deduplicatedEmbeddings.length; j++) {
        const similarity = this.cosineSimilarity(
          embeddings[i].embedding,
          deduplicatedEmbeddings[j].embedding,
        );

        if (similarity >= threshold) {
          isDuplicate = true;
          break;
        }
      }

      if (!isDuplicate) {
        deduplicatedChunks.push(chunks[i]);
        deduplicatedEmbeddings.push(embeddings[i]);
      }
    }

    return { chunks: deduplicatedChunks, embeddings: deduplicatedEmbeddings };
  }

  /**
   * コンテンツハッシュ計算
   */
  private hashContent(content: string): string {
    // SHA-256ハッシュ（簡略化）
    return content; // TODO: 実際のハッシュ実装
  }

  /**
   * コサイン類似度計算
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
}

/**
 * チャンク+埋め込み
 */
export interface ChunkWithEmbedding {
  chunk: Chunk;
  embedding: EmbeddingResult;
}
```

---

## 3. ベクトルDB統合

### 3.1 IVectorDbWriter インターフェース

```typescript
/**
 * ベクトルDBライターインターフェース
 */
export interface IVectorDbWriter {
  /**
   * 単一チャンクを挿入
   */
  insert(
    chunk: Chunk,
    embedding: EmbeddingResult,
    options: VectorDbInsertOptions,
  ): Promise<void>;

  /**
   * バッチ挿入
   */
  batchInsert(
    chunks: Chunk[],
    embeddings: EmbeddingResult[],
    options: VectorDbBatchInsertOptions,
  ): Promise<void>;

  /**
   * 検索
   */
  search(
    queryEmbedding: number[],
    options: VectorDbSearchOptions,
  ): Promise<VectorDbSearchResult[]>;

  /**
   * 削除
   */
  delete(documentId: string): Promise<void>;
}

export interface VectorDbInsertOptions {
  collectionName: string;
}

export interface VectorDbBatchInsertOptions {
  collectionName: string;
  batchSize?: number;
}

export interface VectorDbSearchOptions {
  collectionName: string;
  limit?: number;
  filter?: Record<string, unknown>;
}

export interface VectorDbSearchResult {
  chunkId: string;
  score: number;
  chunk: Chunk;
}
```

---

### 3.2 QdrantVectorDbWriter 実装

```typescript
/**
 * Qdrant ベクトルDBライター
 */
export class QdrantVectorDbWriter implements IVectorDbWriter {
  private client: QdrantClient;

  constructor(config: VectorDbConfig) {
    this.client = new QdrantClient({
      url: config.url,
      apiKey: config.apiKey,
    });
  }

  async insert(
    chunk: Chunk,
    embedding: EmbeddingResult,
    options: VectorDbInsertOptions,
  ): Promise<void> {
    await this.client.upsert(options.collectionName, {
      points: [
        {
          id: chunk.id,
          vector: embedding.embedding,
          payload: {
            content: chunk.content,
            tokenCount: chunk.tokenCount,
            position: chunk.position,
            metadata: chunk.metadata,
          },
        },
      ],
    });
  }

  async batchInsert(
    chunks: Chunk[],
    embeddings: EmbeddingResult[],
    options: VectorDbBatchInsertOptions,
  ): Promise<void> {
    const batchSize = options.batchSize || 100;

    for (let i = 0; i < chunks.length; i += batchSize) {
      const batchChunks = chunks.slice(i, i + batchSize);
      const batchEmbeddings = embeddings.slice(i, i + batchSize);

      const points = batchChunks.map((chunk, index) => ({
        id: chunk.id,
        vector: batchEmbeddings[index].embedding,
        payload: {
          content: chunk.content,
          tokenCount: chunk.tokenCount,
          position: chunk.position,
          metadata: chunk.metadata,
        },
      }));

      await this.client.upsert(options.collectionName, { points });
    }
  }

  async search(
    queryEmbedding: number[],
    options: VectorDbSearchOptions,
  ): Promise<VectorDbSearchResult[]> {
    const results = await this.client.search(options.collectionName, {
      vector: queryEmbedding,
      limit: options.limit || 10,
      filter: options.filter,
    });

    return results.map((result) => ({
      chunkId: String(result.id),
      score: result.score,
      chunk: result.payload as Chunk,
    }));
  }

  async delete(documentId: string): Promise<void> {
    // ドキュメントIDでフィルタリングして削除
    await this.client.delete("documents", {
      filter: {
        must: [{ key: "metadata.documentId", match: { value: documentId } }],
      },
    });
  }
}
```

---

## 4. メタデータストア統合

### 4.1 IMetadataStore インターフェース

```typescript
/**
 * メタデータストアインターフェース
 */
export interface IMetadataStore {
  /**
   * ドキュメントを保存
   */
  saveDocument(doc: DocumentRecord): Promise<void>;

  /**
   * ドキュメントを取得
   */
  getDocument(documentId: string): Promise<DocumentRecord | null>;

  /**
   * ドキュメントを削除
   */
  deleteDocument(documentId: string): Promise<void>;

  /**
   * ドキュメント一覧を取得
   */
  listDocuments(
    options?: ListDocumentsOptions,
  ): Promise<{ documents: DocumentRecord[]; total: number }>;
}

export interface DocumentRecord {
  documentId: string;
  documentType: DocumentType;
  metadata?: Record<string, unknown>;
  chunks: Chunk[];
  embeddings: EmbeddingResult[];
  createdAt: Date;
  updatedAt?: Date;
}

export interface ListDocumentsOptions {
  limit?: number;
  offset?: number;
  filter?: Record<string, unknown>;
  sort?: { field: string; order: "asc" | "desc" };
}
```

---

### 4.2 PostgresMetadataStore 実装

```typescript
/**
 * PostgreSQL メタデータストア
 */
export class PostgresMetadataStore implements IMetadataStore {
  private pool: Pool;

  constructor(config: MetadataStoreConfig) {
    this.pool = new Pool({
      connectionString: config.url,
    });

    this.initializeSchema();
  }

  private async initializeSchema(): Promise<void> {
    await this.pool.query(`
      CREATE TABLE IF NOT EXISTS ${this.tableName} (
        document_id VARCHAR(255) PRIMARY KEY,
        document_type VARCHAR(50) NOT NULL,
        metadata JSONB,
        chunks JSONB NOT NULL,
        embeddings JSONB NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP
      )
    `);

    await this.pool.query(`
      CREATE INDEX IF NOT EXISTS idx_document_type
      ON ${this.tableName}(document_type)
    `);

    await this.pool.query(`
      CREATE INDEX IF NOT EXISTS idx_created_at
      ON ${this.tableName}(created_at DESC)
    `);
  }

  async saveDocument(doc: DocumentRecord): Promise<void> {
    await this.pool.query(
      `
      INSERT INTO ${this.tableName}
      (document_id, document_type, metadata, chunks, embeddings, created_at)
      VALUES ($1, $2, $3, $4, $5, $6)
      ON CONFLICT (document_id)
      DO UPDATE SET
        metadata = $3,
        chunks = $4,
        embeddings = $5,
        updated_at = NOW()
      `,
      [
        doc.documentId,
        doc.documentType,
        JSON.stringify(doc.metadata),
        JSON.stringify(doc.chunks),
        JSON.stringify(doc.embeddings),
        doc.createdAt,
      ],
    );
  }

  async getDocument(documentId: string): Promise<DocumentRecord | null> {
    const result = await this.pool.query(
      `SELECT * FROM ${this.tableName} WHERE document_id = $1`,
      [documentId],
    );

    if (result.rows.length === 0) {
      return null;
    }

    const row = result.rows[0];
    return {
      documentId: row.document_id,
      documentType: row.document_type,
      metadata: row.metadata,
      chunks: row.chunks,
      embeddings: row.embeddings,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  async deleteDocument(documentId: string): Promise<void> {
    await this.pool.query(
      `DELETE FROM ${this.tableName} WHERE document_id = $1`,
      [documentId],
    );
  }

  async listDocuments(
    options?: ListDocumentsOptions,
  ): Promise<{ documents: DocumentRecord[]; total: number }> {
    const limit = options?.limit || 100;
    const offset = options?.offset || 0;

    // 総数取得
    const countResult = await this.pool.query(
      `SELECT COUNT(*) FROM ${this.tableName}`,
    );
    const total = parseInt(countResult.rows[0].count);

    // ドキュメント取得
    const result = await this.pool.query(
      `SELECT * FROM ${this.tableName} ORDER BY created_at DESC LIMIT $1 OFFSET $2`,
      [limit, offset],
    );

    const documents = result.rows.map((row) => ({
      documentId: row.document_id,
      documentType: row.document_type,
      metadata: row.metadata,
      chunks: row.chunks,
      embeddings: row.embeddings,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }));

    return { documents, total };
  }

  private get tableName(): string {
    return "embedding_documents";
  }
}
```

---

## 5. エラーハンドリングと再開

### 5.1 チェックポイント機能

```typescript
/**
 * パイプラインチェックポイント
 */
export interface PipelineCheckpoint {
  documentId: string;
  stage: "preprocessing" | "chunking" | "embedding" | "persistence";
  processedChunks: number;
  totalChunks: number;
  timestamp: Date;
  data?: {
    chunks?: Chunk[];
    embeddings?: EmbeddingResult[];
  };
}

/**
 * チェックポイントマネージャー
 */
export class CheckpointManager {
  private checkpoints: Map<string, PipelineCheckpoint>;

  constructor() {
    this.checkpoints = new Map();
  }

  /**
   * チェックポイントを保存
   */
  save(checkpoint: PipelineCheckpoint): void {
    this.checkpoints.set(checkpoint.documentId, checkpoint);
  }

  /**
   * チェックポイントを取得
   */
  get(documentId: string): PipelineCheckpoint | null {
    return this.checkpoints.get(documentId) || null;
  }

  /**
   * チェックポイントを削除
   */
  delete(documentId: string): void {
    this.checkpoints.delete(documentId);
  }

  /**
   * パイプラインを再開
   */
  async resume(
    pipeline: EmbeddingPipeline,
    documentId: string,
    config: PipelineConfig,
  ): Promise<PipelineOutput> {
    const checkpoint = this.get(documentId);

    if (!checkpoint) {
      throw new Error(`No checkpoint found for document ${documentId}`);
    }

    // チェックポイントのステージから再開
    // TODO: 実装
    throw new Error("Resume not implemented");
  }
}
```

---

## 6. パフォーマンス最適化

### 6.1 バックプレッシャー制御

```typescript
/**
 * バックプレッシャーコントローラー
 */
export class BackpressureController {
  private queue: Chunk[];
  private processing: number;
  private maxConcurrency: number;
  private threshold: number;

  constructor(maxConcurrency: number = 10, threshold: number = 100) {
    this.queue = [];
    this.processing = 0;
    this.maxConcurrency = maxConcurrency;
    this.threshold = threshold;
  }

  /**
   * チャンクを追加
   */
  async enqueue(chunk: Chunk): Promise<void> {
    this.queue.push(chunk);

    // 閾値を超えたら待機
    while (this.queue.length > this.threshold) {
      await this.sleep(100);
    }
  }

  /**
   * 次のチャンクを取得
   */
  async dequeue(): Promise<Chunk | null> {
    while (this.processing >= this.maxConcurrency) {
      await this.sleep(10);
    }

    return this.queue.shift() || null;
  }

  /**
   * 処理中カウントを増やす
   */
  incrementProcessing(): void {
    this.processing++;
  }

  /**
   * 処理中カウントを減らす
   */
  decrementProcessing(): void {
    this.processing--;
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
```

---

## 7. モニタリングとメトリクス

### 7.1 PipelineMetricsCollector

```typescript
/**
 * パイプラインメトリクス収集
 */
export class PipelineMetricsCollector {
  private metrics: {
    pipelineRuns: Array<{
      documentId: string;
      chunksProcessed: number;
      embeddingsGenerated: number;
      totalProcessingTimeMs: number;
      stageTimings: {
        preprocessing: number;
        chunking: number;
        embedding: number;
        persistence: number;
      };
      success: boolean;
      error?: string;
      timestamp: number;
    }>;
  };

  constructor() {
    this.metrics = { pipelineRuns: [] };
  }

  /**
   * パイプライン実行メトリクスを記録
   */
  recordPipelineRun(metric: {
    documentId: string;
    chunksProcessed: number;
    embeddingsGenerated: number;
    totalProcessingTimeMs: number;
    stageTimings: {
      preprocessing: number;
      chunking: number;
      embedding: number;
      persistence: number;
    };
    success: boolean;
    error?: string;
  }): void {
    this.metrics.pipelineRuns.push({
      ...metric,
      timestamp: Date.now(),
    });
  }

  /**
   * 統計を取得
   */
  getStatistics(): {
    totalRuns: number;
    successRate: number;
    avgProcessingTime: number;
    avgChunksPerDocument: number;
    stageBreakdown: {
      preprocessing: number;
      chunking: number;
      embedding: number;
      persistence: number;
    };
  } {
    const runs = this.metrics.pipelineRuns;
    const successfulRuns = runs.filter((r) => r.success);

    const avgProcessingTime =
      runs.reduce((sum, r) => sum + r.totalProcessingTimeMs, 0) / runs.length;

    const avgChunksPerDocument =
      runs.reduce((sum, r) => sum + r.chunksProcessed, 0) / runs.length;

    // ステージ別平均処理時間
    const stageBreakdown = {
      preprocessing:
        runs.reduce((sum, r) => sum + r.stageTimings.preprocessing, 0) /
        runs.length,
      chunking:
        runs.reduce((sum, r) => sum + r.stageTimings.chunking, 0) / runs.length,
      embedding:
        runs.reduce((sum, r) => sum + r.stageTimings.embedding, 0) /
        runs.length,
      persistence:
        runs.reduce((sum, r) => sum + r.stageTimings.persistence, 0) /
        runs.length,
    };

    return {
      totalRuns: runs.length,
      successRate: successfulRuns.length / runs.length,
      avgProcessingTime,
      avgChunksPerDocument,
      stageBreakdown,
    };
  }

  /**
   * Prometheus形式でエクスポート
   */
  exportPrometheus(): string {
    const stats = this.getStatistics();

    return `
# HELP pipeline_total_runs Total number of pipeline runs
# TYPE pipeline_total_runs counter
pipeline_total_runs ${stats.totalRuns}

# HELP pipeline_success_rate Pipeline success rate
# TYPE pipeline_success_rate gauge
pipeline_success_rate ${stats.successRate}

# HELP pipeline_avg_processing_time_ms Average processing time in milliseconds
# TYPE pipeline_avg_processing_time_ms gauge
pipeline_avg_processing_time_ms ${stats.avgProcessingTime}

# HELP pipeline_avg_chunks_per_document Average chunks per document
# TYPE pipeline_avg_chunks_per_document gauge
pipeline_avg_chunks_per_document ${stats.avgChunksPerDocument}
    `.trim();
  }
}
```

---

## 8. トランザクション管理

### 8.1 トランザクション戦略

パイプライン処理における一貫性を保証するためのトランザクション管理設計。

```typescript
/**
 * パイプライントランザクションマネージャー
 *
 * ベクトルDBとメタデータストアの両方への書き込みを一貫性を持って管理
 */
export class PipelineTransactionManager {
  private vectorDbWriter: IVectorDbWriter;
  private metadataStore: IMetadataStore;

  constructor(vectorDbWriter: IVectorDbWriter, metadataStore: IMetadataStore) {
    this.vectorDbWriter = vectorDbWriter;
    this.metadataStore = metadataStore;
  }

  /**
   * トランザクション内でパイプライン永続化を実行
   *
   * Sagaパターンを採用：失敗時は補償トランザクションでロールバック
   */
  async executeWithTransaction(
    documentId: string,
    chunks: Chunk[],
    embeddings: EmbeddingResult[],
    metadata: DocumentRecord,
  ): Promise<TransactionResult> {
    const transactionId = this.generateTransactionId();

    try {
      // Step 1: ベクトルDB書き込み（冪等性を保証）
      await this.vectorDbWriter.batchInsert(chunks, embeddings, {
        collectionName: metadata.documentType,
        transactionId,
      });

      // Step 2: メタデータストア書き込み
      await this.metadataStore.saveDocument({
        ...metadata,
        transactionId,
        status: "completed",
      });

      return {
        transactionId,
        success: true,
        stage: "completed",
      };
    } catch (error) {
      // 補償トランザクション：ベクトルDBからロールバック
      await this.compensate(documentId, transactionId);

      return {
        transactionId,
        success: false,
        stage: this.determineFailedStage(error),
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  /**
   * 補償トランザクション
   */
  private async compensate(
    documentId: string,
    transactionId: string,
  ): Promise<void> {
    try {
      // ベクトルDBから削除
      await this.vectorDbWriter.delete(documentId);

      // メタデータストアをpending/failed状態に更新
      await this.metadataStore.updateStatus(documentId, "rolled_back");
    } catch (compensationError) {
      // 補償トランザクション失敗：手動介入が必要
      console.error(
        `Compensation failed for transaction ${transactionId}:`,
        compensationError,
      );
      throw new TransactionError(`Compensation failed: ${compensationError}`, {
        transactionId,
        requiresManualIntervention: true,
      });
    }
  }

  private generateTransactionId(): string {
    return `txn-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private determineFailedStage(error: unknown): string {
    if (error instanceof VectorDbError) return "vectordb";
    if (error instanceof MetadataStoreError) return "metadata";
    return "unknown";
  }
}

/**
 * トランザクション結果
 */
export interface TransactionResult {
  transactionId: string;
  success: boolean;
  stage: string;
  error?: string;
}
```

### 8.2 冪等性保証

```typescript
/**
 * 冪等性キー管理
 *
 * 同一ドキュメントの再処理時に重複書き込みを防止
 */
export class IdempotencyManager {
  private cache: Map<string, IdempotencyRecord>;
  private metadataStore: IMetadataStore;

  constructor(metadataStore: IMetadataStore) {
    this.cache = new Map();
    this.metadataStore = metadataStore;
  }

  /**
   * 冪等性キーを生成
   */
  generateIdempotencyKey(
    documentId: string,
    contentHash: string,
    config: PipelineConfig,
  ): string {
    const configHash = this.hashConfig(config);
    return `${documentId}:${contentHash}:${configHash}`;
  }

  /**
   * 処理済みかチェック
   */
  async isAlreadyProcessed(idempotencyKey: string): Promise<boolean> {
    // キャッシュチェック
    if (this.cache.has(idempotencyKey)) {
      return true;
    }

    // メタデータストアチェック
    const record = await this.metadataStore.getByIdempotencyKey(idempotencyKey);
    if (record && record.status === "completed") {
      this.cache.set(idempotencyKey, record);
      return true;
    }

    return false;
  }

  /**
   * 処理完了を記録
   */
  async markAsProcessed(
    idempotencyKey: string,
    result: PipelineOutput,
  ): Promise<void> {
    const record: IdempotencyRecord = {
      idempotencyKey,
      status: "completed",
      result,
      processedAt: new Date(),
    };

    this.cache.set(idempotencyKey, record);
    await this.metadataStore.saveIdempotencyRecord(record);
  }

  private hashConfig(config: PipelineConfig): string {
    // 設定のハッシュを生成
    return JSON.stringify(config)
      .split("")
      .reduce((a, b) => ((a << 5) - a + b.charCodeAt(0)) | 0, 0)
      .toString(16);
  }
}

interface IdempotencyRecord {
  idempotencyKey: string;
  status: "pending" | "completed" | "failed";
  result?: PipelineOutput;
  processedAt: Date;
}
```

---

## 9. 差分更新（変更検知・再処理）

### 9.1 変更検知機能

```typescript
/**
 * ドキュメント変更検知
 */
export class DocumentChangeDetector {
  private metadataStore: IMetadataStore;

  constructor(metadataStore: IMetadataStore) {
    this.metadataStore = metadataStore;
  }

  /**
   * ドキュメントの変更を検知
   */
  async detectChanges(
    documentId: string,
    newContent: string,
    newMetadata?: Record<string, unknown>,
  ): Promise<ChangeDetectionResult> {
    const existingDoc = await this.metadataStore.getDocument(documentId);

    if (!existingDoc) {
      return {
        changeType: "new",
        documentId,
        needsReprocessing: true,
        changedSections: [],
      };
    }

    // コンテンツハッシュ比較
    const newHash = this.hashContent(newContent);
    const existingHash = existingDoc.metadata?.contentHash;

    if (newHash === existingHash) {
      // メタデータのみの変更チェック
      if (this.metadataChanged(existingDoc.metadata, newMetadata)) {
        return {
          changeType: "metadata_only",
          documentId,
          needsReprocessing: false, // 埋め込み再生成は不要
          changedSections: [],
        };
      }

      return {
        changeType: "none",
        documentId,
        needsReprocessing: false,
        changedSections: [],
      };
    }

    // 詳細な差分分析
    const changedSections = await this.analyzeContentChanges(
      existingDoc,
      newContent,
    );

    return {
      changeType: "content",
      documentId,
      needsReprocessing: true,
      changedSections,
      // 増分更新が可能かどうか
      supportsIncrementalUpdate:
        changedSections.length < existingDoc.chunks.length / 2,
    };
  }

  /**
   * コンテンツの変更箇所を分析
   */
  private async analyzeContentChanges(
    existingDoc: DocumentRecord,
    newContent: string,
  ): Promise<ChangedSection[]> {
    const changedSections: ChangedSection[] = [];

    // 既存チャンクと新コンテンツを比較
    for (const chunk of existingDoc.chunks) {
      if (!newContent.includes(chunk.content)) {
        changedSections.push({
          chunkId: chunk.id,
          changeType: "modified_or_deleted",
          originalContent: chunk.content,
        });
      }
    }

    return changedSections;
  }

  private hashContent(content: string): string {
    // SHA-256ハッシュ（簡略化）
    let hash = 0;
    for (let i = 0; i < content.length; i++) {
      const char = content.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash;
    }
    return hash.toString(16);
  }

  private metadataChanged(
    existing?: Record<string, unknown>,
    newMeta?: Record<string, unknown>,
  ): boolean {
    return JSON.stringify(existing) !== JSON.stringify(newMeta);
  }
}

interface ChangeDetectionResult {
  changeType: "new" | "content" | "metadata_only" | "none";
  documentId: string;
  needsReprocessing: boolean;
  changedSections: ChangedSection[];
  supportsIncrementalUpdate?: boolean;
}

interface ChangedSection {
  chunkId: string;
  changeType: "modified_or_deleted" | "added";
  originalContent?: string;
  newContent?: string;
}
```

### 9.2 増分更新処理

```typescript
/**
 * 増分更新パイプライン
 *
 * 変更があったセクションのみを再処理
 */
export class IncrementalUpdatePipeline {
  private pipeline: EmbeddingPipeline;
  private changeDetector: DocumentChangeDetector;
  private vectorDbWriter: IVectorDbWriter;
  private metadataStore: IMetadataStore;

  constructor(
    pipeline: EmbeddingPipeline,
    changeDetector: DocumentChangeDetector,
    vectorDbWriter: IVectorDbWriter,
    metadataStore: IMetadataStore,
  ) {
    this.pipeline = pipeline;
    this.changeDetector = changeDetector;
    this.vectorDbWriter = vectorDbWriter;
    this.metadataStore = metadataStore;
  }

  /**
   * 増分更新を実行
   */
  async processIncremental(
    input: PipelineInput,
    config: PipelineConfig,
  ): Promise<IncrementalUpdateResult> {
    const startTime = Date.now();

    // 変更検知
    const changeResult = await this.changeDetector.detectChanges(
      input.documentId,
      input.text,
      input.metadata,
    );

    if (changeResult.changeType === "none") {
      return {
        documentId: input.documentId,
        updateType: "skipped",
        reason: "No changes detected",
        processingTimeMs: Date.now() - startTime,
      };
    }

    if (changeResult.changeType === "metadata_only") {
      // メタデータのみ更新
      await this.metadataStore.updateMetadata(
        input.documentId,
        input.metadata || {},
      );

      return {
        documentId: input.documentId,
        updateType: "metadata_only",
        processingTimeMs: Date.now() - startTime,
      };
    }

    // 増分更新が可能な場合
    if (changeResult.supportsIncrementalUpdate) {
      return await this.processIncrementalUpdate(
        input,
        config,
        changeResult,
        startTime,
      );
    }

    // 全体再処理
    const result = await this.pipeline.process(input, config);

    return {
      documentId: input.documentId,
      updateType: "full_reprocess",
      pipelineResult: result,
      processingTimeMs: Date.now() - startTime,
    };
  }

  /**
   * 増分更新処理（変更チャンクのみ）
   */
  private async processIncrementalUpdate(
    input: PipelineInput,
    config: PipelineConfig,
    changeResult: ChangeDetectionResult,
    startTime: number,
  ): Promise<IncrementalUpdateResult> {
    // 変更されたチャンクを削除
    for (const section of changeResult.changedSections) {
      await this.vectorDbWriter.deleteChunk(section.chunkId);
    }

    // 新しいコンテンツで再チャンキング・埋め込み
    const result = await this.pipeline.process(input, config);

    return {
      documentId: input.documentId,
      updateType: "incremental",
      chunksUpdated: changeResult.changedSections.length,
      chunksAdded: result.chunksProcessed - changeResult.changedSections.length,
      pipelineResult: result,
      processingTimeMs: Date.now() - startTime,
    };
  }
}

interface IncrementalUpdateResult {
  documentId: string;
  updateType: "skipped" | "metadata_only" | "incremental" | "full_reprocess";
  reason?: string;
  chunksUpdated?: number;
  chunksAdded?: number;
  pipelineResult?: PipelineOutput;
  processingTimeMs: number;
}
```

### 9.3 バッチ差分更新

```typescript
/**
 * バッチ差分更新ジョブ
 *
 * 定期実行で複数ドキュメントの変更を検知・更新
 */
export class BatchIncrementalUpdateJob {
  private incrementalPipeline: IncrementalUpdatePipeline;
  private documentSource: IDocumentSource;
  private metricsCollector: PipelineMetricsCollector;

  constructor(
    incrementalPipeline: IncrementalUpdatePipeline,
    documentSource: IDocumentSource,
    metricsCollector: PipelineMetricsCollector,
  ) {
    this.incrementalPipeline = incrementalPipeline;
    this.documentSource = documentSource;
    this.metricsCollector = metricsCollector;
  }

  /**
   * バッチ差分更新を実行
   */
  async execute(
    config: PipelineConfig,
    options?: BatchUpdateOptions,
  ): Promise<BatchUpdateResult> {
    const startTime = Date.now();
    const results: IncrementalUpdateResult[] = [];
    const errors: Array<{ documentId: string; error: string }> = [];

    // 更新対象ドキュメントを取得
    const documents = await this.documentSource.getModifiedDocuments(
      options?.since || new Date(Date.now() - 24 * 60 * 60 * 1000), // デフォルト24時間
    );

    const concurrency = options?.concurrency || 4;
    const executing: Promise<void>[] = [];

    for (const doc of documents) {
      const p = this.incrementalPipeline
        .processIncremental(doc, config)
        .then((result) => {
          results.push(result);
        })
        .catch((error) => {
          errors.push({
            documentId: doc.documentId,
            error: error instanceof Error ? error.message : String(error),
          });
        })
        .finally(() => {
          executing.splice(executing.indexOf(p), 1);
        });

      executing.push(p);

      if (executing.length >= concurrency) {
        await Promise.race(executing);
      }
    }

    await Promise.all(executing);

    const summary = this.summarizeResults(results);

    return {
      totalDocuments: documents.length,
      skipped: summary.skipped,
      metadataOnly: summary.metadataOnly,
      incremental: summary.incremental,
      fullReprocess: summary.fullReprocess,
      errors,
      processingTimeMs: Date.now() - startTime,
    };
  }

  private summarizeResults(results: IncrementalUpdateResult[]): {
    skipped: number;
    metadataOnly: number;
    incremental: number;
    fullReprocess: number;
  } {
    return {
      skipped: results.filter((r) => r.updateType === "skipped").length,
      metadataOnly: results.filter((r) => r.updateType === "metadata_only")
        .length,
      incremental: results.filter((r) => r.updateType === "incremental").length,
      fullReprocess: results.filter((r) => r.updateType === "full_reprocess")
        .length,
    };
  }
}

interface BatchUpdateOptions {
  since?: Date;
  concurrency?: number;
  dryRun?: boolean;
}

interface BatchUpdateResult {
  totalDocuments: number;
  skipped: number;
  metadataOnly: number;
  incremental: number;
  fullReprocess: number;
  errors: Array<{ documentId: string; error: string }>;
  processingTimeMs: number;
}
```

---

## 10. ファイル配置

```
packages/shared/src/
├── services/
│   └── pipeline/
│       ├── EmbeddingPipeline.ts             # メインパイプライン
│       ├── vectordb/
│       │   ├── IVectorDbWriter.ts           # ベクトルDBインターフェース
│       │   ├── QdrantVectorDbWriter.ts
│       │   ├── WeaviateVectorDbWriter.ts
│       │   └── PineconeVectorDbWriter.ts
│       ├── metadata/
│       │   ├── IMetadataStore.ts            # メタデータストアインターフェース
│       │   ├── PostgresMetadataStore.ts
│       │   └── MongoDbMetadataStore.ts
│       ├── utils/
│       │   ├── CheckpointManager.ts         # チェックポイント管理
│       │   ├── BackpressureController.ts    # バックプレッシャー制御
│       │   └── PipelineMetricsCollector.ts  # メトリクス収集
│       └── types/
│           ├── pipeline.types.ts            # パイプライン型定義
│           └── errors.ts                    # エラークラス
└── __tests__/
    └── services/
        └── pipeline/
            ├── EmbeddingPipeline.test.ts
            ├── QdrantVectorDbWriter.test.ts
            ├── PostgresMetadataStore.test.ts
            └── EmbeddingPipeline.integration.test.ts
```

---

## 9. テスト戦略

### 9.1 統合テスト

```typescript
describe("EmbeddingPipeline Integration", () => {
  let pipeline: EmbeddingPipeline;

  beforeEach(async () => {
    const chunkingService = new ChunkingService(
      new TiktokenTokenizer(),
      new OpenAIEmbeddingClient(),
      new AnthropicLLMClient()
    );

    const embeddingService = new EmbeddingService(
      [
        new OpenAIEmbeddingProvider(...)
      ],
      ["EMB-002"],
      new MetricsCollector()
    );

    const vectorDbWriter = new QdrantVectorDbWriter({
      url: "http://localhost:6333",
      collectionName: "test-collection"
    });

    const metadataStore = new PostgresMetadataStore({
      type: "postgresql",
      url: "postgresql://localhost:5432/test",
      tableName: "test_documents"
    });

    pipeline = new EmbeddingPipeline(
      chunkingService,
      embeddingService,
      vectorDbWriter,
      metadataStore,
      new PipelineMetricsCollector()
    );
  });

  it("should process document end-to-end", async () => {
    const input: PipelineInput = {
      documentId: "doc-001",
      documentType: "markdown",
      text: "# Test Document\n\nThis is a test document with multiple paragraphs.\n\nAnother paragraph here."
    };

    const config: PipelineConfig = {
      chunking: {
        strategy: "hierarchical",
        options: {
          chunkSize: 512,
          targetChunkSize: 512,
          maxDepth: 3,
          headingPatterns: { type: "markdown" },
          inheritParentContext: true,
          createSummaryChunks: false
        }
      },
      embedding: {
        modelId: "EMB-002"
      },
      pipeline: {
        batchSize: 100,
        concurrency: 4
      },
      persistence: {
        vectorDb: {
          type: "qdrant",
          url: "http://localhost:6333",
          collectionName: "test-collection"
        },
        metadataStore: {
          type: "postgresql",
          url: "postgresql://localhost:5432/test",
          tableName: "test_documents"
        }
      }
    };

    const result = await pipeline.process(input, config);

    expect(result.chunksProcessed).toBeGreaterThan(0);
    expect(result.embeddingsGenerated).toBe(result.chunksProcessed);
    expect(result.errors).toBeUndefined();
  });
});
```

---

## 10. 変更履歴

| バージョン | 日付       | 変更者             | 変更内容 |
| ---------- | ---------- | ------------------ | -------- |
| 1.0.0      | 2025-12-26 | Pipeline Architect | 初版作成 |

---

## 11. 承認

| 役割       | 氏名               | 署名 | 日付       |
| ---------- | ------------------ | ---- | ---------- |
| 作成者     | Pipeline Architect | -    | 2025-12-26 |
| レビュワー | -                  | -    | -          |
| 承認者     | -                  | -    | -          |
