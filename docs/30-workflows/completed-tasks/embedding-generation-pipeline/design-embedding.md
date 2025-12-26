# 埋め込みプロバイダー設計書

## 文書情報

| 項目       | 内容                 |
| ---------- | -------------------- |
| 文書ID     | DESIGN-EMBEDDING-001 |
| バージョン | 1.0.0                |
| 作成日     | 2025-12-26           |
| 最終更新日 | 2025-12-26           |
| ステータス | Draft                |
| 作成者     | Gateway Dev          |
| 関連文書   | REQ-EMB-001          |

---

## 1. 概要

### 1.1 目的

AIWorkflowOrchestratorにおける埋め込み（Embedding）モデルの統合アーキテクチャを設計する。複数の埋め込みモデルプロバイダー（OpenAI、Qwen3、Voyage、BGE-M3、embedding-gemma）に対応し、用途・コスト・精度に応じて動的に切り替えられる拡張可能な設計を実現する。

### 1.2 設計原則

- **Adapter Pattern**: 各プロバイダーの差異を吸収
- **Factory Pattern**: プロバイダーの動的生成
- **Circuit Breaker Pattern**: 障害時の自動フェイルオーバー
- **Rate Limiting**: API呼び出しの制御
- **Retry with Exponential Backoff**: 一時的エラーからの回復

### 1.3 アーキテクチャ層

```
┌─────────────────────────────────────────────────┐
│              Application Layer                  │
│              EmbeddingService                   │
│    (Facade + Fallback Chain + Metrics)         │
└─────────────────────────────────────────────────┘
                       ↓
┌─────────────────────────────────────────────────┐
│              Domain Layer                       │
│          IEmbeddingProvider (Interface)         │
│        BaseEmbeddingProvider (Abstract)         │
└─────────────────────────────────────────────────┘
                       ↓
┌─────────────────────────────────────────────────┐
│         Infrastructure Layer (Providers)        │
│  OpenAIProvider | Qwen3Provider | VoyageProvider│
│     BGE-M3Provider | EmbeddingGemmaProvider     │
└─────────────────────────────────────────────────┘
                       ↓
┌─────────────────────────────────────────────────┐
│          Cross-Cutting Concerns                 │
│  RateLimiter | CircuitBreaker | RetryHandler   │
│         MetricsCollector | Logger               │
└─────────────────────────────────────────────────┘
```

---

## 2. コア設計

### 2.1 型定義

```typescript
/**
 * 埋め込みモデルID
 */
export type EmbeddingModelId =
  | "EMB-001" // Qwen3-Embedding-8B
  | "EMB-002" // text-embedding-3-large
  | "EMB-003" // voyage-3-large
  | "EMB-004" // bge-m3
  | "EMB-005"; // embedding-gemma

/**
 * プロバイダー名
 */
export type ProviderName =
  | "openai"
  | "dashscope"
  | "voyage"
  | "huggingface"
  | "local";

/**
 * 埋め込みオプション
 */
export interface EmbedOptions {
  /** 次元数（可変モデル用） */
  dimensions?: number;
  /** リトライ設定 */
  retry?: RetryOptions;
  /** タイムアウト（ミリ秒） */
  timeout?: number;
  /** メタデータ */
  metadata?: Record<string, unknown>;
}

/**
 * バッチ埋め込みオプション
 */
export interface BatchEmbedOptions extends EmbedOptions {
  /** バッチサイズ */
  batchSize?: number;
  /** 並列度 */
  concurrency?: number;
  /** バッチ間の遅延（ミリ秒） */
  delayBetweenBatches?: number;
  /** 進捗コールバック */
  onProgress?: (processed: number, total: number) => void;
}

/**
 * リトライオプション
 */
export interface RetryOptions {
  /** 最大リトライ回数 */
  maxRetries: number;
  /** 初期遅延（ミリ秒） */
  initialDelayMs: number;
  /** 最大遅延（ミリ秒） */
  maxDelayMs: number;
  /** バックオフ乗数 */
  backoffMultiplier: number;
  /** ジッター有効化 */
  jitter: boolean;
}

/**
 * 埋め込み結果
 */
export interface EmbeddingResult {
  /** 埋め込みベクトル */
  embedding: number[];
  /** トークン数 */
  tokenCount: number;
  /** 使用モデル */
  model: string;
  /** 処理時間（ミリ秒） */
  processingTimeMs: number;
}

/**
 * バッチ埋め込み結果
 */
export interface BatchEmbeddingResult {
  /** 埋め込み配列 */
  embeddings: EmbeddingResult[];
  /** エラー情報 */
  errors: Array<{ index: number; error: string }>;
  /** 総トークン数 */
  totalTokens: number;
  /** 総処理時間（ミリ秒） */
  totalProcessingTimeMs: number;
}

/**
 * レート制限設定
 */
export interface RateLimitConfig {
  /** リクエスト/分 */
  requestsPerMinute: number;
  /** トークン/分 */
  tokensPerMinute: number;
}

/**
 * Circuit Breaker設定
 */
export interface CircuitBreakerConfig {
  /** エラー閾値 */
  errorThreshold: number;
  /** タイムアウト（ミリ秒） */
  timeout: number;
  /** リセット時間（ミリ秒） */
  resetTimeout: number;
}
```

---

### 2.2 IEmbeddingProvider インターフェース

```typescript
/**
 * 埋め込みプロバイダーインターフェース
 *
 * すべての埋め込みプロバイダーはこのインターフェースを実装する
 */
export interface IEmbeddingProvider {
  /**
   * モデルID
   */
  readonly modelId: EmbeddingModelId;

  /**
   * プロバイダー名
   */
  readonly providerName: ProviderName;

  /**
   * 埋め込みベクトルの次元数
   */
  readonly dimensions: number;

  /**
   * 最大トークン数
   */
  readonly maxTokens: number;

  /**
   * テキストの埋め込みベクトルを生成する
   *
   * @param text - 埋め込み対象テキスト
   * @param options - 埋め込みオプション
   * @returns 埋め込み結果
   * @throws {EmbeddingError} 埋め込み生成でエラーが発生した場合
   */
  embed(text: string, options?: EmbedOptions): Promise<EmbeddingResult>;

  /**
   * 複数テキストの埋め込みベクトルをバッチ生成する
   *
   * @param texts - 埋め込み対象テキスト配列
   * @param options - バッチ埋め込みオプション
   * @returns バッチ埋め込み結果
   * @throws {EmbeddingError} 埋め込み生成でエラーが発生した場合
   */
  embedBatch(
    texts: string[],
    options?: BatchEmbedOptions,
  ): Promise<BatchEmbeddingResult>;

  /**
   * テキストのトークン数をカウントする
   *
   * @param text - カウント対象テキスト
   * @returns トークン数
   */
  countTokens(text: string): number;

  /**
   * ヘルスチェックを実行する
   *
   * @returns ヘルスチェック成功時true
   */
  healthCheck(): Promise<boolean>;
}
```

---

### 2.3 BaseEmbeddingProvider 抽象クラス

```typescript
/**
 * 埋め込みプロバイダー基底クラス
 *
 * 共通機能を提供し、テンプレートメソッドパターンを実装
 */
export abstract class BaseEmbeddingProvider implements IEmbeddingProvider {
  abstract readonly modelId: EmbeddingModelId;
  abstract readonly providerName: ProviderName;
  abstract readonly dimensions: number;
  abstract readonly maxTokens: number;

  protected rateLimiter: RateLimiter;
  protected circuitBreaker: CircuitBreaker;
  protected retryHandler: RetryHandler;
  protected metricsCollector: MetricsCollector;

  constructor(
    protected config: ProviderConfig,
    rateLimiter: RateLimiter,
    circuitBreaker: CircuitBreaker,
    retryHandler: RetryHandler,
    metricsCollector: MetricsCollector,
  ) {
    this.rateLimiter = rateLimiter;
    this.circuitBreaker = circuitBreaker;
    this.retryHandler = retryHandler;
    this.metricsCollector = metricsCollector;
  }

  /**
   * 埋め込み生成（テンプレートメソッド）
   */
  async embed(text: string, options?: EmbedOptions): Promise<EmbeddingResult> {
    const startTime = Date.now();

    try {
      // トークン数カウント
      const tokenCount = this.countTokens(text);

      // 最大トークン数チェック
      if (tokenCount > this.maxTokens) {
        throw new EmbeddingError(
          `Text exceeds max tokens: ${tokenCount} > ${this.maxTokens}`,
        );
      }

      // レート制限チェック
      await this.rateLimiter.acquire(1, tokenCount);

      // Circuit Breakerで保護された実行
      const embedding = await this.circuitBreaker.execute(() =>
        this.retryHandler.retry(
          () => this.embedInternal(text, options),
          options?.retry,
        ),
      );

      const processingTimeMs = Date.now() - startTime;

      // メトリクス記録
      this.metricsCollector.recordEmbedding({
        modelId: this.modelId,
        tokenCount,
        processingTimeMs,
        success: true,
      });

      return {
        embedding,
        tokenCount,
        model: String(this.modelId),
        processingTimeMs,
      };
    } catch (error) {
      const processingTimeMs = Date.now() - startTime;

      // エラーメトリクス記録
      this.metricsCollector.recordEmbedding({
        modelId: this.modelId,
        tokenCount: 0,
        processingTimeMs,
        success: false,
        error: error instanceof Error ? error.message : String(error),
      });

      throw new EmbeddingError(
        `Embedding failed for model ${this.modelId}: ${error instanceof Error ? error.message : String(error)}`,
        { cause: error },
      );
    }
  }

  /**
   * バッチ埋め込み生成
   */
  async embedBatch(
    texts: string[],
    options?: BatchEmbedOptions,
  ): Promise<BatchEmbeddingResult> {
    const startTime = Date.now();
    const batchSize = options?.batchSize || this.getDefaultBatchSize();
    const concurrency = options?.concurrency || this.getDefaultConcurrency();
    const delayMs = options?.delayBetweenBatches || 0;

    const embeddings: EmbeddingResult[] = [];
    const errors: Array<{ index: number; error: string }> = [];
    let processedCount = 0;

    // バッチに分割
    const batches: string[][] = [];
    for (let i = 0; i < texts.length; i += batchSize) {
      batches.push(texts.slice(i, i + batchSize));
    }

    // 並列実行
    const batchPromises = batches.map(async (batch, batchIndex) => {
      // バッチ間の遅延
      if (batchIndex > 0 && delayMs > 0) {
        await this.sleep(delayMs);
      }

      // バッチ内の並列処理
      const batchResults = await Promise.allSettled(
        batch.map((text, indexInBatch) =>
          this.embed(text, options).then((result) => ({
            globalIndex: batchIndex * batchSize + indexInBatch,
            result,
          })),
        ),
      );

      // 結果の集約
      for (const outcome of batchResults) {
        if (outcome.status === "fulfilled") {
          embeddings[outcome.value.globalIndex] = outcome.value.result;
        } else {
          const globalIndex =
            batchIndex * batchSize + batchResults.indexOf(outcome);
          errors.push({
            index: globalIndex,
            error:
              outcome.reason instanceof Error
                ? outcome.reason.message
                : String(outcome.reason),
          });
        }
      }

      processedCount += batch.length;
      options?.onProgress?.(processedCount, texts.length);
    });

    // 並列度制御
    await this.executeWithConcurrency(batchPromises, concurrency);

    const totalTokens = embeddings.reduce(
      (sum, emb) => sum + (emb?.tokenCount || 0),
      0,
    );
    const totalProcessingTimeMs = Date.now() - startTime;

    return {
      embeddings,
      errors,
      totalTokens,
      totalProcessingTimeMs,
    };
  }

  /**
   * 内部埋め込み生成（サブクラスで実装）
   */
  protected abstract embedInternal(
    text: string,
    options?: EmbedOptions,
  ): Promise<number[]>;

  /**
   * トークン数カウント（サブクラスで実装）
   */
  abstract countTokens(text: string): number;

  /**
   * ヘルスチェック
   */
  async healthCheck(): Promise<boolean> {
    try {
      const testText = "health check";
      await this.embed(testText, { timeout: 5000 });
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * デフォルトバッチサイズを取得
   */
  protected abstract getDefaultBatchSize(): number;

  /**
   * デフォルト並列度を取得
   */
  protected abstract getDefaultConcurrency(): number;

  /**
   * 並列度制御付き実行
   */
  private async executeWithConcurrency<T>(
    promises: Promise<T>[],
    concurrency: number,
  ): Promise<void> {
    const executing: Promise<void>[] = [];

    for (const promise of promises) {
      const p = promise.then(() => {
        executing.splice(executing.indexOf(p), 1);
      });

      executing.push(p);

      if (executing.length >= concurrency) {
        await Promise.race(executing);
      }
    }

    await Promise.all(executing);
  }

  /**
   * スリープ
   */
  protected sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

/**
 * プロバイダー設定
 */
export interface ProviderConfig {
  apiKey?: string;
  apiEndpoint?: string;
  timeout?: number;
  modelPath?: string; // ローカルモデル用
  device?: "cuda" | "cpu" | "mps"; // ローカルモデル用
}
```

---

## 3. プロバイダー実装

### 3.1 OpenAIEmbeddingProvider

```typescript
/**
 * OpenAI埋め込みプロバイダー
 *
 * text-embedding-3-large / text-embedding-3-small に対応
 */
export class OpenAIEmbeddingProvider extends BaseEmbeddingProvider {
  readonly modelId: EmbeddingModelId = "EMB-002";
  readonly providerName: ProviderName = "openai";
  readonly dimensions: number = 3072;
  readonly maxTokens: number = 8191;

  private client: OpenAI;

  constructor(
    config: ProviderConfig,
    rateLimiter: RateLimiter,
    circuitBreaker: CircuitBreaker,
    retryHandler: RetryHandler,
    metricsCollector: MetricsCollector,
  ) {
    super(config, rateLimiter, circuitBreaker, retryHandler, metricsCollector);

    this.client = new OpenAI({
      apiKey: config.apiKey || process.env.OPENAI_API_KEY,
    });
  }

  protected async embedInternal(
    text: string,
    options?: EmbedOptions,
  ): Promise<number[]> {
    const response = await this.client.embeddings.create({
      model: "text-embedding-3-large",
      input: text,
      dimensions: options?.dimensions || this.dimensions,
    });

    return response.data[0].embedding;
  }

  countTokens(text: string): number {
    // tiktoken を使用
    const encoder = encoding_for_model("text-embedding-3-large");
    const tokens = encoder.encode(text);
    encoder.free();
    return tokens.length;
  }

  protected getDefaultBatchSize(): number {
    return 100;
  }

  protected getDefaultConcurrency(): number {
    return 5;
  }
}
```

---

### 3.2 Qwen3EmbeddingProvider

```typescript
/**
 * Qwen3埋め込みプロバイダー
 *
 * DashScope API経由でQwen3-Embedding-8Bを使用
 */
export class Qwen3EmbeddingProvider extends BaseEmbeddingProvider {
  readonly modelId: EmbeddingModelId = "EMB-001";
  readonly providerName: ProviderName = "dashscope";
  readonly dimensions: number = 8192;
  readonly maxTokens: number = 8192;

  private apiKey: string;
  private apiEndpoint: string;

  constructor(
    config: ProviderConfig,
    rateLimiter: RateLimiter,
    circuitBreaker: CircuitBreaker,
    retryHandler: RetryHandler,
    metricsCollector: MetricsCollector,
  ) {
    super(config, rateLimiter, circuitBreaker, retryHandler, metricsCollector);

    this.apiKey = config.apiKey || process.env.DASHSCOPE_API_KEY || "";
    this.apiEndpoint =
      config.apiEndpoint ||
      "https://dashscope.aliyuncs.com/api/v1/services/embeddings/text-embedding/text-embedding";
  }

  protected async embedInternal(
    text: string,
    options?: EmbedOptions,
  ): Promise<number[]> {
    const response = await fetch(this.apiEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: "qwen3-embedding-8b",
        input: {
          texts: [text],
        },
        parameters: {
          dimension: options?.dimensions || this.dimensions,
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`DashScope API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.output.embeddings[0].embedding;
  }

  countTokens(text: string): number {
    // Qwen3のトークナイザーを使用（簡略化）
    return Math.ceil(text.length / 4);
  }

  protected getDefaultBatchSize(): number {
    return 50;
  }

  protected getDefaultConcurrency(): number {
    return 3;
  }
}
```

---

### 3.3 VoyageEmbeddingProvider

```typescript
/**
 * Voyage埋め込みプロバイダー
 *
 * voyage-3-large に対応
 */
export class VoyageEmbeddingProvider extends BaseEmbeddingProvider {
  readonly modelId: EmbeddingModelId = "EMB-003";
  readonly providerName: ProviderName = "voyage";
  readonly dimensions: number = 1024;
  readonly maxTokens: number = 32000;

  private apiKey: string;
  private apiEndpoint: string;

  constructor(
    config: ProviderConfig,
    rateLimiter: RateLimiter,
    circuitBreaker: CircuitBreaker,
    retryHandler: RetryHandler,
    metricsCollector: MetricsCollector,
  ) {
    super(config, rateLimiter, circuitBreaker, retryHandler, metricsCollector);

    this.apiKey = config.apiKey || process.env.VOYAGE_API_KEY || "";
    this.apiEndpoint =
      config.apiEndpoint || "https://api.voyageai.com/v1/embeddings";
  }

  protected async embedInternal(
    text: string,
    options?: EmbedOptions,
  ): Promise<number[]> {
    const response = await fetch(this.apiEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: "voyage-3-large",
        input: text,
        input_type: "document",
      }),
    });

    if (!response.ok) {
      throw new Error(`Voyage API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.data[0].embedding;
  }

  countTokens(text: string): number {
    // Voyage独自のトークナイザー（簡略化）
    return Math.ceil(text.length / 4);
  }

  protected getDefaultBatchSize(): number {
    return 128;
  }

  protected getDefaultConcurrency(): number {
    return 4;
  }
}
```

---

### 3.4 BGE-M3Provider（ローカル）

```typescript
/**
 * BGE-M3埋め込みプロバイダー
 *
 * Hugging Face Transformersでローカル実行
 */
export class BGEM3Provider extends BaseEmbeddingProvider {
  readonly modelId: EmbeddingModelId = "EMB-004";
  readonly providerName: ProviderName = "local";
  readonly dimensions: number = 1024;
  readonly maxTokens: number = 8192;

  private model: any; // HuggingFaceモデル
  private tokenizer: any;

  constructor(
    config: ProviderConfig,
    rateLimiter: RateLimiter,
    circuitBreaker: CircuitBreaker,
    retryHandler: RetryHandler,
    metricsCollector: MetricsCollector,
  ) {
    super(config, rateLimiter, circuitBreaker, retryHandler, metricsCollector);

    this.initializeModel(config);
  }

  private async initializeModel(config: ProviderConfig): Promise<void> {
    // モデルとトークナイザーの初期化
    const { AutoTokenizer, AutoModel } = await import("@xenova/transformers");

    this.tokenizer = await AutoTokenizer.from_pretrained("BAAI/bge-m3");
    this.model = await AutoModel.from_pretrained("BAAI/bge-m3");

    if (config.device === "cuda") {
      // CUDA対応（将来実装）
    }
  }

  protected async embedInternal(
    text: string,
    options?: EmbedOptions,
  ): Promise<number[]> {
    // トークナイズ
    const inputs = await this.tokenizer(text, {
      padding: true,
      truncation: true,
      max_length: this.maxTokens,
    });

    // モデル実行
    const outputs = await this.model(inputs);

    // Mean pooling
    const embedding = this.meanPooling(
      outputs.last_hidden_state,
      inputs.attention_mask,
    );

    return Array.from(embedding);
  }

  /**
   * Mean pooling実装
   */
  private meanPooling(lastHiddenState: any, attentionMask: any): Float32Array {
    // 簡略化実装
    const embedding = new Float32Array(this.dimensions);
    // TODO: 実際のpooling処理
    return embedding;
  }

  countTokens(text: string): number {
    const tokens = this.tokenizer.encode(text);
    return tokens.length;
  }

  protected getDefaultBatchSize(): number {
    return 32;
  }

  protected getDefaultConcurrency(): number {
    return 2;
  }
}
```

---

### 3.5 EmbeddingGemmaProvider（ローカル）

```typescript
/**
 * embedding-gemma埋め込みプロバイダー
 *
 * Google embedding-gemmaをローカル実行（軽量・オンデバイス）
 */
export class EmbeddingGemmaProvider extends BaseEmbeddingProvider {
  readonly modelId: EmbeddingModelId = "EMB-005";
  readonly providerName: ProviderName = "local";
  readonly dimensions: number = 768;
  readonly maxTokens: number = 2048;

  private model: any;
  private tokenizer: any;

  constructor(
    config: ProviderConfig,
    rateLimiter: RateLimiter,
    circuitBreaker: CircuitBreaker,
    retryHandler: RetryHandler,
    metricsCollector: MetricsCollector,
  ) {
    super(config, rateLimiter, circuitBreaker, retryHandler, metricsCollector);

    this.initializeModel(config);
  }

  private async initializeModel(config: ProviderConfig): Promise<void> {
    const { AutoTokenizer, AutoModel } = await import("@xenova/transformers");

    this.tokenizer = await AutoTokenizer.from_pretrained(
      "google/embedding-gemma",
    );
    this.model = await AutoModel.from_pretrained("google/embedding-gemma");
  }

  protected async embedInternal(
    text: string,
    options?: EmbedOptions,
  ): Promise<number[]> {
    const inputs = await this.tokenizer(text, {
      padding: true,
      truncation: true,
      max_length: this.maxTokens,
    });

    const outputs = await this.model(inputs);
    const embedding = outputs.last_hidden_state.mean(1);

    return Array.from(embedding);
  }

  countTokens(text: string): number {
    const tokens = this.tokenizer.encode(text);
    return tokens.length;
  }

  protected getDefaultBatchSize(): number {
    return 16;
  }

  protected getDefaultConcurrency(): number {
    return 1;
  }
}
```

---

## 4. Cross-Cutting Concerns

### 4.1 RateLimiter（レート制限）

```typescript
/**
 * レート制限クラス
 *
 * Token Bucket Algorithmを使用
 */
export class RateLimiter {
  private requestTokens: number;
  private tokenTokens: number;
  private requestCapacity: number;
  private tokenCapacity: number;
  private lastRefill: number;

  constructor(private config: RateLimitConfig) {
    this.requestCapacity = config.requestsPerMinute;
    this.tokenCapacity = config.tokensPerMinute;
    this.requestTokens = this.requestCapacity;
    this.tokenTokens = this.tokenCapacity;
    this.lastRefill = Date.now();
  }

  /**
   * トークンを取得（待機を含む）
   */
  async acquire(requests: number, tokens: number): Promise<void> {
    while (true) {
      this.refill();

      if (this.requestTokens >= requests && this.tokenTokens >= tokens) {
        this.requestTokens -= requests;
        this.tokenTokens -= tokens;
        return;
      }

      // 待機時間を計算
      const waitTime = this.calculateWaitTime(requests, tokens);
      await this.sleep(waitTime);
    }
  }

  /**
   * トークンを補充
   */
  private refill(): void {
    const now = Date.now();
    const elapsedMs = now - this.lastRefill;
    const elapsedMinutes = elapsedMs / 60000;

    this.requestTokens = Math.min(
      this.requestCapacity,
      this.requestTokens + this.requestCapacity * elapsedMinutes,
    );

    this.tokenTokens = Math.min(
      this.tokenCapacity,
      this.tokenTokens + this.tokenCapacity * elapsedMinutes,
    );

    this.lastRefill = now;
  }

  /**
   * 待機時間を計算
   */
  private calculateWaitTime(requests: number, tokens: number): number {
    const requestWait =
      ((requests - this.requestTokens) / this.requestCapacity) * 60000;
    const tokenWait =
      ((tokens - this.tokenTokens) / this.tokenCapacity) * 60000;

    return Math.max(requestWait, tokenWait, 100); // 最低100ms
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
```

---

### 4.2 CircuitBreaker（サーキットブレーカー）

```typescript
/**
 * サーキットブレーカー
 *
 * 障害検出時に自動的に回路を開く
 */
export class CircuitBreaker {
  private state: "CLOSED" | "OPEN" | "HALF_OPEN" = "CLOSED";
  private failureCount: number = 0;
  private lastFailureTime: number = 0;

  constructor(private config: CircuitBreakerConfig) {}

  /**
   * 保護された実行
   */
  async execute<T>(fn: () => Promise<T>): Promise<T> {
    if (this.state === "OPEN") {
      if (Date.now() - this.lastFailureTime > this.config.resetTimeout) {
        this.state = "HALF_OPEN";
      } else {
        throw new EmbeddingError("Circuit breaker is OPEN");
      }
    }

    try {
      const result = await fn();

      if (this.state === "HALF_OPEN") {
        this.state = "CLOSED";
        this.failureCount = 0;
      }

      return result;
    } catch (error) {
      this.failureCount++;
      this.lastFailureTime = Date.now();

      if (this.failureCount >= this.config.errorThreshold) {
        this.state = "OPEN";
      }

      throw error;
    }
  }

  /**
   * 状態を取得
   */
  getState(): "CLOSED" | "OPEN" | "HALF_OPEN" {
    return this.state;
  }

  /**
   * リセット
   */
  reset(): void {
    this.state = "CLOSED";
    this.failureCount = 0;
    this.lastFailureTime = 0;
  }
}
```

---

### 4.3 RetryHandler（リトライハンドラー）

```typescript
/**
 * リトライハンドラー
 *
 * 指数バックオフでリトライを実行
 */
export class RetryHandler {
  constructor(private defaultConfig: RetryOptions) {}

  /**
   * リトライ実行
   */
  async retry<T>(
    fn: () => Promise<T>,
    customConfig?: Partial<RetryOptions>,
  ): Promise<T> {
    const config: RetryOptions = {
      ...this.defaultConfig,
      ...customConfig,
    };

    let lastError: Error;

    for (let attempt = 0; attempt < config.maxRetries; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error as Error;

        if (!this.isRetryable(lastError) || attempt === config.maxRetries - 1) {
          throw lastError;
        }

        const delay = this.calculateDelay(attempt, config);
        await this.sleep(delay);
      }
    }

    throw lastError!;
  }

  /**
   * リトライ可能なエラーかチェック
   */
  private isRetryable(error: Error): boolean {
    // タイムアウト、ネットワークエラー、レート制限
    return (
      error.message.includes("timeout") ||
      error.message.includes("ECONNRESET") ||
      error.message.includes("ETIMEDOUT") ||
      error.message.includes("rate limit") ||
      error.message.includes("429")
    );
  }

  /**
   * 遅延時間を計算（指数バックオフ + ジッター）
   */
  private calculateDelay(attempt: number, config: RetryOptions): number {
    let delay =
      config.initialDelayMs * Math.pow(config.backoffMultiplier, attempt);

    delay = Math.min(delay, config.maxDelayMs);

    if (config.jitter) {
      delay *= 0.5 + Math.random();
    }

    return Math.floor(delay);
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
```

---

## 5. EmbeddingService（Facade）

```typescript
/**
 * 埋め込みサービス
 *
 * Application Layerのファサード。プロバイダーの選択、フォールバック、メトリクス収集を行う
 */
export class EmbeddingService {
  private providers: Map<EmbeddingModelId, IEmbeddingProvider>;
  private fallbackChain: EmbeddingModelId[];
  private metricsCollector: MetricsCollector;

  constructor(
    providers: IEmbeddingProvider[],
    fallbackChain: EmbeddingModelId[],
    metricsCollector: MetricsCollector,
  ) {
    this.providers = new Map(providers.map((p) => [p.modelId, p]));
    this.fallbackChain = fallbackChain;
    this.metricsCollector = metricsCollector;
  }

  /**
   * 埋め込み生成
   */
  async embed(
    text: string,
    modelId?: EmbeddingModelId,
    options?: EmbedOptions,
  ): Promise<EmbeddingResult> {
    const targetModel = modelId || this.fallbackChain[0];
    const provider = this.getProvider(targetModel);

    try {
      return await provider.embed(text, options);
    } catch (error) {
      // フォールバック試行
      return await this.fallback(text, targetModel, options, error);
    }
  }

  /**
   * バッチ埋め込み生成
   */
  async embedBatch(
    texts: string[],
    modelId?: EmbeddingModelId,
    options?: BatchEmbedOptions,
  ): Promise<BatchEmbeddingResult> {
    const targetModel = modelId || this.fallbackChain[0];
    const provider = this.getProvider(targetModel);

    return await provider.embedBatch(texts, options);
  }

  /**
   * フォールバック処理
   */
  private async fallback(
    text: string,
    failedModel: EmbeddingModelId,
    options?: EmbedOptions,
    originalError?: unknown,
  ): Promise<EmbeddingResult> {
    const fallbackModels = this.fallbackChain.filter(
      (id) => id !== failedModel,
    );

    for (const modelId of fallbackModels) {
      try {
        const provider = this.getProvider(modelId);
        const result = await provider.embed(text, options);

        // フォールバック成功をログ
        console.warn(
          `Fallback to ${modelId} succeeded after ${failedModel} failed`,
        );

        return result;
      } catch (error) {
        continue;
      }
    }

    throw new EmbeddingError(
      `All embedding providers failed. Original error: ${originalError instanceof Error ? originalError.message : String(originalError)}`,
    );
  }

  /**
   * プロバイダーを取得
   */
  private getProvider(modelId: EmbeddingModelId): IEmbeddingProvider {
    const provider = this.providers.get(modelId);
    if (!provider) {
      throw new EmbeddingError(`Provider not found for model: ${modelId}`);
    }
    return provider;
  }

  /**
   * ヘルスチェック（全プロバイダー）
   */
  async healthCheckAll(): Promise<Map<EmbeddingModelId, boolean>> {
    const results = new Map<EmbeddingModelId, boolean>();

    for (const [modelId, provider] of this.providers) {
      results.set(modelId, await provider.healthCheck());
    }

    return results;
  }
}
```

---

## 6. Factory Pattern

```typescript
/**
 * 埋め込みプロバイダーファクトリー
 */
export class EmbeddingProviderFactory {
  /**
   * プロバイダーを生成
   */
  static createProvider(
    modelId: EmbeddingModelId,
    config: ProviderConfig,
    rateLimiter: RateLimiter,
    circuitBreaker: CircuitBreaker,
    retryHandler: RetryHandler,
    metricsCollector: MetricsCollector,
  ): IEmbeddingProvider {
    switch (modelId) {
      case "EMB-001":
        return new Qwen3EmbeddingProvider(
          config,
          rateLimiter,
          circuitBreaker,
          retryHandler,
          metricsCollector,
        );
      case "EMB-002":
        return new OpenAIEmbeddingProvider(
          config,
          rateLimiter,
          circuitBreaker,
          retryHandler,
          metricsCollector,
        );
      case "EMB-003":
        return new VoyageEmbeddingProvider(
          config,
          rateLimiter,
          circuitBreaker,
          retryHandler,
          metricsCollector,
        );
      case "EMB-004":
        return new BGEM3Provider(
          config,
          rateLimiter,
          circuitBreaker,
          retryHandler,
          metricsCollector,
        );
      case "EMB-005":
        return new EmbeddingGemmaProvider(
          config,
          rateLimiter,
          circuitBreaker,
          retryHandler,
          metricsCollector,
        );
      default:
        throw new Error(`Unknown model ID: ${modelId}`);
    }
  }

  /**
   * レート制限設定を取得
   */
  static getRateLimitConfig(modelId: EmbeddingModelId): RateLimitConfig {
    const configs: Record<EmbeddingModelId, RateLimitConfig> = {
      "EMB-001": { requestsPerMinute: 500, tokensPerMinute: 500000 },
      "EMB-002": { requestsPerMinute: 3000, tokensPerMinute: 1000000 },
      "EMB-003": { requestsPerMinute: 300, tokensPerMinute: 1000000 },
      "EMB-004": { requestsPerMinute: Infinity, tokensPerMinute: Infinity },
      "EMB-005": { requestsPerMinute: Infinity, tokensPerMinute: Infinity },
    };

    return configs[modelId];
  }
}
```

---

## 7. メトリクス収集

```typescript
/**
 * メトリクス収集
 */
export class MetricsCollector {
  private metrics: {
    embeddings: Array<{
      modelId: EmbeddingModelId;
      tokenCount: number;
      processingTimeMs: number;
      success: boolean;
      timestamp: number;
      error?: string;
    }>;
  };

  constructor() {
    this.metrics = { embeddings: [] };
  }

  /**
   * 埋め込みメトリクスを記録
   */
  recordEmbedding(metric: {
    modelId: EmbeddingModelId;
    tokenCount: number;
    processingTimeMs: number;
    success: boolean;
    error?: string;
  }): void {
    this.metrics.embeddings.push({
      ...metric,
      timestamp: Date.now(),
    });
  }

  /**
   * 統計を取得
   */
  getStatistics(): {
    totalRequests: number;
    successRate: number;
    avgProcessingTime: number;
    totalTokens: number;
  } {
    const embeddings = this.metrics.embeddings;

    return {
      totalRequests: embeddings.length,
      successRate:
        embeddings.filter((e) => e.success).length / embeddings.length,
      avgProcessingTime:
        embeddings.reduce((sum, e) => sum + e.processingTimeMs, 0) /
        embeddings.length,
      totalTokens: embeddings.reduce((sum, e) => sum + e.tokenCount, 0),
    };
  }
}
```

---

## 8. ファイル配置

```
packages/shared/src/
├── services/
│   └── embedding/
│       ├── EmbeddingService.ts              # メインサービス（Facade）
│       ├── providers/
│       │   ├── IEmbeddingProvider.ts        # プロバイダーインターフェース
│       │   ├── BaseEmbeddingProvider.ts     # 基底クラス
│       │   ├── OpenAIEmbeddingProvider.ts
│       │   ├── Qwen3EmbeddingProvider.ts
│       │   ├── VoyageEmbeddingProvider.ts
│       │   ├── BGEM3Provider.ts
│       │   └── EmbeddingGemmaProvider.ts
│       ├── factory/
│       │   └── EmbeddingProviderFactory.ts  # ファクトリー
│       ├── utils/
│       │   ├── RateLimiter.ts               # レート制限
│       │   ├── CircuitBreaker.ts            # サーキットブレーカー
│       │   ├── RetryHandler.ts              # リトライハンドラー
│       │   └── MetricsCollector.ts          # メトリクス収集
│       └── types/
│           ├── embedding.types.ts           # 全型定義
│           └── errors.ts                    # エラークラス
└── __tests__/
    └── services/
        └── embedding/
            ├── OpenAIEmbeddingProvider.test.ts
            ├── Qwen3EmbeddingProvider.test.ts
            ├── RateLimiter.test.ts
            ├── CircuitBreaker.test.ts
            ├── RetryHandler.test.ts
            └── EmbeddingService.integration.test.ts
```

---

## 9. テスト戦略

### 9.1 ユニットテスト

```typescript
describe("RateLimiter", () => {
  it("should limit requests per minute", async () => {
    const limiter = new RateLimiter({
      requestsPerMinute: 10,
      tokensPerMinute: 1000,
    });

    const start = Date.now();

    // 11リクエストを送信（10を超える）
    for (let i = 0; i < 11; i++) {
      await limiter.acquire(1, 100);
    }

    const elapsed = Date.now() - start;

    // 11リクエスト目は待機が発生するはず（6秒以上）
    expect(elapsed).toBeGreaterThan(6000);
  });
});

describe("CircuitBreaker", () => {
  it("should open circuit after error threshold", async () => {
    const breaker = new CircuitBreaker({
      errorThreshold: 3,
      timeout: 1000,
      resetTimeout: 5000,
    });

    const failingFn = async () => {
      throw new Error("API Error");
    };

    // 3回失敗
    for (let i = 0; i < 3; i++) {
      await expect(breaker.execute(failingFn)).rejects.toThrow();
    }

    // 回路が開いているはず
    expect(breaker.getState()).toBe("OPEN");

    // 次の呼び出しは即座に失敗
    await expect(breaker.execute(failingFn)).rejects.toThrow(
      "Circuit breaker is OPEN",
    );
  });
});
```

### 9.2 統合テスト

```typescript
describe("EmbeddingService Integration", () => {
  let service: EmbeddingService;

  beforeEach(() => {
    const providers = [
      EmbeddingProviderFactory.createProvider("EMB-002", {...}, ...),
      EmbeddingProviderFactory.createProvider("EMB-001", {...}, ...)
    ];

    service = new EmbeddingService(
      providers,
      ["EMB-002", "EMB-001"],
      new MetricsCollector()
    );
  });

  it("should generate embedding", async () => {
    const result = await service.embed("Test text");

    expect(result.embedding).toHaveLength(3072);
    expect(result.tokenCount).toBeGreaterThan(0);
  });

  it("should fallback to secondary provider", async () => {
    // プライマリプロバイダーを障害状態にする（モック）

    const result = await service.embed("Test text");

    // フォールバックで成功するはず
    expect(result.model).toBe("EMB-001");
  });
});
```

---

## 10. 変更履歴

| バージョン | 日付       | 変更者      | 変更内容 |
| ---------- | ---------- | ----------- | -------- |
| 1.0.0      | 2025-12-26 | Gateway Dev | 初版作成 |

---

## 11. 承認

| 役割       | 氏名        | 署名 | 日付       |
| ---------- | ----------- | ---- | ---------- |
| 作成者     | Gateway Dev | -    | 2025-12-26 |
| レビュワー | -           | -    | -          |
| 承認者     | -           | -    | -          |
