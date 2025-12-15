# 埋め込みプロバイダー抽象化 - タスク指示書

## メタ情報

| 項目         | 内容                                    |
| ------------ | --------------------------------------- |
| タスクID     | CONV-06-02                              |
| タスク名     | 埋め込みプロバイダー抽象化              |
| 親タスク     | CONV-06 (埋め込み生成パイプライン)      |
| 依存タスク   | CONV-03-03 (チャンク・埋め込みスキーマ) |
| 規模         | 中                                      |
| 見積もり工数 | 1日                                     |
| ステータス   | 未実施                                  |

---

## 1. 目的

複数の埋め込みモデル（OpenAI, Voyage AI, Qwen3-Embedding, BGE-M3, EmbeddingGemma）を統一したインターフェースで利用できる抽象化レイヤーを実装する。バッチ処理、レート制限対応、フォールバック機能を含む。

---

## 2. 成果物

- `packages/shared/src/services/embedding/types.ts`
- `packages/shared/src/services/embedding/embedding-provider.ts`
- `packages/shared/src/services/embedding/providers/openai-provider.ts`
- `packages/shared/src/services/embedding/providers/voyage-provider.ts`
- `packages/shared/src/services/embedding/providers/local-provider.ts`
- `packages/shared/src/services/embedding/embedding-factory.ts`
- `packages/shared/src/services/embedding/__tests__/embedding-provider.test.ts`

---

## 3. 入力

- テキスト配列（チャンクコンテンツ）
- プロバイダー設定（APIキー、モデル名）
- バッチサイズ、リトライ設定

---

## 4. 出力

```typescript
// packages/shared/src/services/embedding/types.ts
import { z } from "zod";

export const embeddingProviderTypeSchema = z.enum([
  "openai",
  "voyage",
  "qwen3",
  "bge-m3",
  "embedding-gemma",
]);
export type EmbeddingProviderType = z.infer<typeof embeddingProviderTypeSchema>;

export const embeddingModelSchema = z.object({
  provider: embeddingProviderTypeSchema,
  modelId: z.string(),
  dimensions: z.number(),
  maxInputTokens: z.number(),
  supportsBatch: z.boolean(),
  isLocal: z.boolean(),
});
export type EmbeddingModel = z.infer<typeof embeddingModelSchema>;

export interface EmbeddingResult {
  embeddings: number[][];
  model: string;
  dimensions: number;
  usage: {
    totalTokens: number;
    promptTokens: number;
  };
  processingTimeMs: number;
}

export interface EmbeddingProviderConfig {
  apiKey?: string;
  baseUrl?: string;
  model: string;
  batchSize?: number;
  maxRetries?: number;
  retryDelayMs?: number;
  timeout?: number;
}

// 利用可能なモデル定義
export const EMBEDDING_MODELS: Record<string, EmbeddingModel> = {
  "openai:text-embedding-3-large": {
    provider: "openai",
    modelId: "text-embedding-3-large",
    dimensions: 3072,
    maxInputTokens: 8191,
    supportsBatch: true,
    isLocal: false,
  },
  "openai:text-embedding-3-small": {
    provider: "openai",
    modelId: "text-embedding-3-small",
    dimensions: 1536,
    maxInputTokens: 8191,
    supportsBatch: true,
    isLocal: false,
  },
  "voyage:voyage-3-large": {
    provider: "voyage",
    modelId: "voyage-3-large",
    dimensions: 1024,
    maxInputTokens: 32000,
    supportsBatch: true,
    isLocal: false,
  },
  "qwen3:qwen3-embedding-8b": {
    provider: "qwen3",
    modelId: "qwen3-embedding-8b",
    dimensions: 4096,
    maxInputTokens: 8192,
    supportsBatch: true,
    isLocal: true,
  },
  "bge:bge-m3": {
    provider: "bge-m3",
    modelId: "bge-m3",
    dimensions: 1024,
    maxInputTokens: 8192,
    supportsBatch: true,
    isLocal: true,
  },
  "google:embedding-gemma": {
    provider: "embedding-gemma",
    modelId: "embedding-gemma",
    dimensions: 768,
    maxInputTokens: 2048,
    supportsBatch: false,
    isLocal: true,
  },
};
```

---

## 5. 実装仕様

### 5.1 埋め込みプロバイダーインターフェース

```typescript
// packages/shared/src/services/embedding/embedding-provider.ts
import type { Result } from "@/types/result";

export interface IEmbeddingProvider {
  readonly model: EmbeddingModel;

  /**
   * テキスト配列の埋め込みを生成
   */
  embed(texts: string[]): Promise<Result<EmbeddingResult, Error>>;

  /**
   * 単一テキストの埋め込みを生成
   */
  embedSingle(text: string): Promise<Result<number[], Error>>;

  /**
   * バッチ処理対応の埋め込み生成（大量データ用）
   */
  embedBatch(
    texts: string[],
    options?: { onProgress?: (progress: number) => void },
  ): Promise<Result<EmbeddingResult, Error>>;

  /**
   * モデルの健全性チェック
   */
  healthCheck(): Promise<Result<boolean, Error>>;
}
```

### 5.2 基底プロバイダークラス

```typescript
// packages/shared/src/services/embedding/providers/base-provider.ts
export abstract class BaseEmbeddingProvider implements IEmbeddingProvider {
  abstract readonly model: EmbeddingModel;

  protected readonly config: EmbeddingProviderConfig;
  protected readonly batchSize: number;
  protected readonly maxRetries: number;
  protected readonly retryDelayMs: number;

  constructor(config: EmbeddingProviderConfig) {
    this.config = config;
    this.batchSize = config.batchSize ?? 100;
    this.maxRetries = config.maxRetries ?? 3;
    this.retryDelayMs = config.retryDelayMs ?? 1000;
  }

  abstract embed(texts: string[]): Promise<Result<EmbeddingResult, Error>>;

  async embedSingle(text: string): Promise<Result<number[], Error>> {
    const result = await this.embed([text]);
    if (!result.success) {
      return err(result.error);
    }
    return ok(result.data.embeddings[0]);
  }

  async embedBatch(
    texts: string[],
    options?: { onProgress?: (progress: number) => void },
  ): Promise<Result<EmbeddingResult, Error>> {
    const allEmbeddings: number[][] = [];
    let totalTokens = 0;
    const startTime = performance.now();

    const batches = this.createBatches(texts, this.batchSize);

    for (let i = 0; i < batches.length; i++) {
      const batch = batches[i];
      const result = await this.embedWithRetry(batch);

      if (!result.success) {
        return err(result.error);
      }

      allEmbeddings.push(...result.data.embeddings);
      totalTokens += result.data.usage.totalTokens;

      // 進捗報告
      options?.onProgress?.((i + 1) / batches.length);

      // レート制限対策: バッチ間にディレイを入れる
      if (i < batches.length - 1) {
        await this.delay(100);
      }
    }

    return ok({
      embeddings: allEmbeddings,
      model: this.model.modelId,
      dimensions: this.model.dimensions,
      usage: { totalTokens, promptTokens: totalTokens },
      processingTimeMs: performance.now() - startTime,
    });
  }

  protected async embedWithRetry(
    texts: string[],
  ): Promise<Result<EmbeddingResult, Error>> {
    let lastError: Error | null = null;

    for (let attempt = 0; attempt < this.maxRetries; attempt++) {
      const result = await this.embed(texts);

      if (result.success) {
        return result;
      }

      lastError = result.error;

      // 429エラー（レート制限）の場合は指数バックオフ
      if (this.isRateLimitError(result.error)) {
        const delay = this.retryDelayMs * Math.pow(2, attempt);
        await this.delay(delay);
      } else if (!this.isRetryableError(result.error)) {
        // リトライ不可のエラーは即座に返す
        return result;
      } else {
        await this.delay(this.retryDelayMs);
      }
    }

    return err(lastError ?? new Error("Max retries exceeded"));
  }

  abstract healthCheck(): Promise<Result<boolean, Error>>;

  protected createBatches<T>(items: T[], batchSize: number): T[][] {
    const batches: T[][] = [];
    for (let i = 0; i < items.length; i += batchSize) {
      batches.push(items.slice(i, i + batchSize));
    }
    return batches;
  }

  protected delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  protected isRateLimitError(error: Error): boolean {
    return (
      error.message.includes("429") || error.message.includes("rate limit")
    );
  }

  protected isRetryableError(error: Error): boolean {
    return (
      error.message.includes("500") ||
      error.message.includes("502") ||
      error.message.includes("503") ||
      error.message.includes("timeout")
    );
  }
}
```

### 5.3 OpenAIプロバイダー

```typescript
// packages/shared/src/services/embedding/providers/openai-provider.ts
import OpenAI from "openai";

export class OpenAIEmbeddingProvider extends BaseEmbeddingProvider {
  readonly model: EmbeddingModel;
  private readonly client: OpenAI;

  constructor(config: EmbeddingProviderConfig) {
    super(config);
    this.model = EMBEDDING_MODELS[`openai:${config.model}`];
    this.client = new OpenAI({
      apiKey: config.apiKey,
      baseURL: config.baseUrl,
      timeout: config.timeout ?? 30000,
    });
  }

  async embed(texts: string[]): Promise<Result<EmbeddingResult, Error>> {
    const startTime = performance.now();

    try {
      const response = await this.client.embeddings.create({
        model: this.config.model,
        input: texts,
      });

      const embeddings = response.data.map((d) => d.embedding);

      return ok({
        embeddings,
        model: this.config.model,
        dimensions: embeddings[0]?.length ?? this.model.dimensions,
        usage: {
          totalTokens: response.usage.total_tokens,
          promptTokens: response.usage.prompt_tokens,
        },
        processingTimeMs: performance.now() - startTime,
      });
    } catch (error) {
      return err(
        error instanceof Error ? error : new Error("OpenAI embedding failed"),
      );
    }
  }

  async healthCheck(): Promise<Result<boolean, Error>> {
    try {
      await this.client.embeddings.create({
        model: this.config.model,
        input: "health check",
      });
      return ok(true);
    } catch (error) {
      return err(
        error instanceof Error ? error : new Error("Health check failed"),
      );
    }
  }
}
```

### 5.4 Voyage AIプロバイダー

```typescript
// packages/shared/src/services/embedding/providers/voyage-provider.ts
export class VoyageEmbeddingProvider extends BaseEmbeddingProvider {
  readonly model: EmbeddingModel;
  private readonly baseUrl = "https://api.voyageai.com/v1";

  constructor(config: EmbeddingProviderConfig) {
    super(config);
    this.model = EMBEDDING_MODELS[`voyage:${config.model}`];
  }

  async embed(texts: string[]): Promise<Result<EmbeddingResult, Error>> {
    const startTime = performance.now();

    try {
      const response = await fetch(`${this.baseUrl}/embeddings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.config.apiKey}`,
        },
        body: JSON.stringify({
          model: this.config.model,
          input: texts,
        }),
      });

      if (!response.ok) {
        throw new Error(`Voyage API error: ${response.status}`);
      }

      const data = await response.json();
      const embeddings = data.data.map((d: any) => d.embedding);

      return ok({
        embeddings,
        model: this.config.model,
        dimensions: embeddings[0]?.length ?? this.model.dimensions,
        usage: {
          totalTokens: data.usage?.total_tokens ?? 0,
          promptTokens: data.usage?.prompt_tokens ?? 0,
        },
        processingTimeMs: performance.now() - startTime,
      });
    } catch (error) {
      return err(
        error instanceof Error ? error : new Error("Voyage embedding failed"),
      );
    }
  }

  async healthCheck(): Promise<Result<boolean, Error>> {
    const result = await this.embed(["health check"]);
    return result.success ? ok(true) : err(result.error);
  }
}
```

### 5.5 ローカルプロバイダー（Ollama経由）

```typescript
// packages/shared/src/services/embedding/providers/local-provider.ts
export class LocalEmbeddingProvider extends BaseEmbeddingProvider {
  readonly model: EmbeddingModel;
  private readonly baseUrl: string;

  constructor(config: EmbeddingProviderConfig) {
    super(config);
    this.model =
      EMBEDDING_MODELS[`qwen3:${config.model}`] ??
      EMBEDDING_MODELS[`bge:${config.model}`] ??
      EMBEDDING_MODELS[`google:${config.model}`];
    this.baseUrl = config.baseUrl ?? "http://localhost:11434";
  }

  async embed(texts: string[]): Promise<Result<EmbeddingResult, Error>> {
    const startTime = performance.now();
    const embeddings: number[][] = [];

    try {
      // Ollamaは1つずつ処理
      for (const text of texts) {
        const response = await fetch(`${this.baseUrl}/api/embeddings`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            model: this.config.model,
            prompt: text,
          }),
        });

        if (!response.ok) {
          throw new Error(`Ollama API error: ${response.status}`);
        }

        const data = await response.json();
        embeddings.push(data.embedding);
      }

      return ok({
        embeddings,
        model: this.config.model,
        dimensions: embeddings[0]?.length ?? this.model.dimensions,
        usage: { totalTokens: 0, promptTokens: 0 }, // ローカルはトークン数不明
        processingTimeMs: performance.now() - startTime,
      });
    } catch (error) {
      return err(
        error instanceof Error ? error : new Error("Local embedding failed"),
      );
    }
  }

  async healthCheck(): Promise<Result<boolean, Error>> {
    try {
      const response = await fetch(`${this.baseUrl}/api/tags`);
      return response.ok ? ok(true) : err(new Error("Ollama not available"));
    } catch {
      return err(new Error("Ollama connection failed"));
    }
  }
}
```

### 5.6 ファクトリー

```typescript
// packages/shared/src/services/embedding/embedding-factory.ts
export class EmbeddingProviderFactory {
  static create(
    type: EmbeddingProviderType,
    config: EmbeddingProviderConfig,
  ): IEmbeddingProvider {
    switch (type) {
      case "openai":
        return new OpenAIEmbeddingProvider(config);
      case "voyage":
        return new VoyageEmbeddingProvider(config);
      case "qwen3":
      case "bge-m3":
      case "embedding-gemma":
        return new LocalEmbeddingProvider(config);
      default:
        throw new Error(`Unknown provider type: ${type}`);
    }
  }

  static getAvailableModels(): EmbeddingModel[] {
    return Object.values(EMBEDDING_MODELS);
  }

  static getModelByKey(key: string): EmbeddingModel | undefined {
    return EMBEDDING_MODELS[key];
  }
}
```

---

## 6. テストケース

```typescript
describe("EmbeddingProviderFactory", () => {
  it("OpenAIプロバイダーを作成できる", () => {
    const provider = EmbeddingProviderFactory.create("openai", {
      apiKey: "test-key",
      model: "text-embedding-3-small",
    });
    expect(provider).toBeInstanceOf(OpenAIEmbeddingProvider);
  });
});

describe("OpenAIEmbeddingProvider", () => {
  it("テキストの埋め込みを生成できる", async () => {
    const provider = new OpenAIEmbeddingProvider({
      apiKey: process.env.OPENAI_API_KEY!,
      model: "text-embedding-3-small",
    });
    const result = await provider.embed(["Hello world"]);
    expect(result.success).toBe(true);
    expect(result.data.embeddings[0].length).toBe(1536);
  });

  it("バッチ処理が動作する", async () => {
    const provider = new OpenAIEmbeddingProvider({
      apiKey: process.env.OPENAI_API_KEY!,
      model: "text-embedding-3-small",
      batchSize: 10,
    });

    const texts = Array(25).fill("Test text");
    const result = await provider.embedBatch(texts);

    expect(result.success).toBe(true);
    expect(result.data.embeddings.length).toBe(25);
  });

  it("レート制限時にリトライする", async () => {
    // モックを使用してレート制限エラーをシミュレート
    const provider = new OpenAIEmbeddingProvider({
      apiKey: "test",
      model: "text-embedding-3-small",
      maxRetries: 3,
      retryDelayMs: 100,
    });

    // リトライ回数を確認
  });
});

describe("LocalEmbeddingProvider", () => {
  it("Ollama経由で埋め込みを生成できる", async () => {
    const provider = new LocalEmbeddingProvider({
      model: "qwen3-embedding-8b",
      baseUrl: "http://localhost:11434",
    });
    const result = await provider.embed(["Hello world"]);
    // ローカル環境でのみ動作
  });
});
```

---

## 7. 完了条件

- [ ] `IEmbeddingProvider`インターフェースが定義済み
- [ ] `BaseEmbeddingProvider`抽象クラスが実装済み
- [ ] `OpenAIEmbeddingProvider`が動作する
- [ ] `VoyageEmbeddingProvider`が動作する
- [ ] `LocalEmbeddingProvider`が動作する（Ollama対応）
- [ ] バッチ処理が動作する
- [ ] レート制限対応（指数バックオフ）が動作する
- [ ] リトライ機能が動作する
- [ ] `EmbeddingProviderFactory`が動作する
- [ ] 全テストがパス
- [ ] TypeScript型エラーなし
- [ ] ESLint警告なし
- [ ] JSDocコメントが記述されている

---

## 8. 次のタスク

- CONV-06-03: Contextual Retrieval実装

---

## 9. 参照情報

- CONV-03-03: チャンク・埋め込みスキーマ
- CONV-06: 埋め込み生成パイプライン（親タスク）
- [OpenAI Embeddings API](https://platform.openai.com/docs/guides/embeddings)
- [Voyage AI API](https://docs.voyageai.com/)
- [Ollama Embeddings](https://ollama.com/blog/embedding-models)

---

## 10. モデル選定ガイドライン

| 基準           | Qwen3-Embedding-8B   | Voyage 3-large  | OpenAI 3-large  | BGE-M3               | EmbeddingGemma     |
| -------------- | -------------------- | --------------- | --------------- | -------------------- | ------------------ |
| **精度**       | **最高（MTEB 1位）** | 最高            | 高              | 高                   | 中                 |
| **次元数**     | 4096                 | 1024            | 3072            | 1024                 | 768                |
| **速度**       | 中                   | 中              | 中              | 中                   | 高（オンデバイス） |
| **コスト**     | 無料（セルフホスト） | $0.06/1M tokens | $0.13/1M tokens | 無料（セルフホスト） | 無料（ローカル）   |
| **多言語**     | **最良（100+言語）** | 最良            | 良              | 良                   | 良                 |
| **オフライン** | 可能                 | 不可            | 不可            | 可能                 | 可能               |
