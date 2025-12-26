# 埋め込みモデル要件定義書

**ドキュメントID**: REQ-EMB-001
**バージョン**: 1.0.0
**作成日**: 2025-12-26
**ステータス**: Draft

---

## 1. 概要

### 1.1 目的

本ドキュメントは、AIWorkflowOrchestratorにおける埋め込み（Embedding）モデルの統合要件を定義する。複数の埋め込みモデルに対応し、用途・コスト・精度に応じて動的に切り替えられるアーキテクチャを実現する。

### 1.2 スコープ

| 対象               | 説明                                                                     |
| ------------------ | ------------------------------------------------------------------------ |
| **含まれるもの**   | 埋め込みモデルの選定、API統合、バッチ処理、レート制限、コスト管理        |
| **含まれないもの** | ベクトルデータベースの選定（別ドキュメント）、検索アルゴリズムの実装詳細 |

### 1.3 用語定義

| 用語       | 定義                                                                 |
| ---------- | -------------------------------------------------------------------- |
| Embedding  | テキストを固定長の数値ベクトルに変換したもの                         |
| 次元数     | 埋め込みベクトルの要素数                                             |
| MTEB       | Massive Text Embedding Benchmark（埋め込みモデルの標準ベンチマーク） |
| バッチ処理 | 複数のテキストを一度にまとめて処理すること                           |
| レート制限 | API呼び出しの頻度制限                                                |
| バックオフ | レート制限時の待機・再試行戦略                                       |

---

## 2. 対応埋め込みモデル

### 2.1 モデル一覧

| ID      | モデル名               | プロバイダー        | 次元数 | 最大トークン | 優先度 |
| ------- | ---------------------- | ------------------- | ------ | ------------ | ------ |
| EMB-001 | Qwen3-Embedding-8B     | Alibaba Cloud       | 8192   | 8192         | Must   |
| EMB-002 | text-embedding-3-large | OpenAI              | 3072   | 8191         | Must   |
| EMB-003 | voyage-3-large         | Voyage AI           | 1024   | 32000        | Should |
| EMB-004 | bge-m3                 | BAAI (Hugging Face) | 1024   | 8192         | Should |
| EMB-005 | embedding-gemma        | Google              | 768    | 2048         | Could  |

### 2.2 モデル詳細仕様

#### 2.2.1 Qwen3-Embedding-8B (EMB-001)

| 属性             | 値                                            |
| ---------------- | --------------------------------------------- |
| **プロバイダー** | Alibaba Cloud / DashScope API                 |
| **次元数**       | 8192（可変: 512, 1024, 2048, 4096, 8192）     |
| **最大トークン** | 8192 tokens                                   |
| **ベンチマーク** | MTEB multilingual #1 (June 2025, score 70.58) |
| **言語サポート** | 多言語（日本語含む高精度）                    |
| **ライセンス**   | Apache 2.0（オープンウェイト）                |
| **ローカル実行** | 可能（VRAM 16GB以上推奨）                     |

**特徴**:

- 2025年6月時点でMTEB多言語ベンチマーク1位
- 次元数を動的に変更可能（Matryoshka表現対応）
- オープンウェイトのためローカル実行・ファインチューニング可能

#### 2.2.2 text-embedding-3-large (EMB-002)

| 属性             | 値                      |
| ---------------- | ----------------------- |
| **プロバイダー** | OpenAI                  |
| **次元数**       | 3072（可変: 256〜3072） |
| **最大トークン** | 8191 tokens             |
| **ベンチマーク** | MTEB average 64.6       |
| **API価格**      | $0.00013 / 1K tokens    |

**特徴**:

- 業界標準として広く採用
- 次元数のショートニング対応
- 安定したAPI品質とサポート

#### 2.2.3 voyage-3-large (EMB-003)

| 属性             | 値                                 |
| ---------------- | ---------------------------------- |
| **プロバイダー** | Voyage AI                          |
| **次元数**       | 1024                               |
| **最大トークン** | 32000 tokens                       |
| **ベンチマーク** | コード検索・法律ドメインで最高精度 |
| **API価格**      | $0.00012 / 1K tokens               |

**特徴**:

- 長文コンテキスト対応（32Kトークン）
- ドメイン特化モデル（コード、法律、金融）利用可能

#### 2.2.4 bge-m3 (EMB-004)

| 属性             | 値                       |
| ---------------- | ------------------------ |
| **プロバイダー** | BAAI（Hugging Face経由） |
| **次元数**       | 1024                     |
| **最大トークン** | 8192 tokens              |
| **ライセンス**   | MIT                      |
| **ローカル実行** | 可能（VRAM 8GB以上）     |

**特徴**:

- 完全オープンソース
- Dense/Sparse/ColBERTの3種類の埋め込み対応
- 100以上の言語に対応

#### 2.2.5 embedding-gemma (EMB-005)

| 属性             | 値                      |
| ---------------- | ----------------------- |
| **プロバイダー** | Google                  |
| **次元数**       | 768                     |
| **最大トークン** | 2048 tokens             |
| **ローカル実行** | 可能（軽量、CPU実行可） |

**特徴**:

- 軽量でオンデバイス実行に最適化
- オフライン対応

---

## 3. 機能要件

### 3.1 モデル選択機能 (FR-001)

**要件ID**: FR-001
**優先度**: Must

```gherkin
Scenario: ユーザーがモデルを明示的に指定
  Given 利用可能なモデル一覧が設定されている
  When ユーザーがモデルID "EMB-002" を指定する
  Then text-embedding-3-large が使用される

Scenario: フォールバック処理
  Given プライマリモデル "EMB-001" が設定されている
  And フォールバックモデル "EMB-002" が設定されている
  When プライマリモデルがエラーを返す
  Then フォールバックモデルで再試行される
```

### 3.2 テキスト埋め込み生成 (FR-002)

**要件ID**: FR-002
**優先度**: Must

```gherkin
Scenario: 単一テキストの埋め込み生成
  Given モデル "EMB-002" が選択されている
  When テキスト "Hello, world!" を埋め込み変換する
  Then 3072次元の浮動小数点配列が返される

Scenario: 最大トークン超過の処理
  Given モデル "EMB-002" が選択されている（最大8191トークン）
  When 10000トークンのテキストを埋め込み変換する
  Then テキストが8191トークンに切り詰められる
  And 警告ログが出力される
```

### 3.3 バッチ埋め込み生成 (FR-003)

**要件ID**: FR-003
**優先度**: Must

```gherkin
Scenario: 標準バッチ処理
  Given モデル "EMB-002" が選択されている
  When 100件のテキストをバッチ処理する
  Then 100件の埋め込みベクトルが返される

Scenario: バッチ内エラーのハンドリング
  Given モデル "EMB-002" が選択されている
  When 100件のうち1件が無効なテキスト
  Then 99件は正常に処理される
  And 1件はエラーとしてマークされる
```

---

## 4. 非機能要件

### 4.1 性能要件 (NFR-001)

| 要件ID    | 項目                     | 要件値             |
| --------- | ------------------------ | ------------------ |
| NFR-001-1 | 単一テキスト処理時間     | < 500ms (API)      |
| NFR-001-2 | バッチ処理スループット   | > 1000 texts/min   |
| NFR-001-3 | ローカルモデル処理時間   | < 100ms/text (GPU) |
| NFR-001-4 | メモリ使用量（ローカル） | < 8GB VRAM         |

### 4.2 可用性要件 (NFR-002)

| 要件ID    | 項目                 | 要件値 |
| --------- | -------------------- | ------ |
| NFR-002-1 | API可用性            | 99.9%  |
| NFR-002-2 | フェイルオーバー時間 | < 5秒  |

### 4.3 セキュリティ要件 (NFR-003)

| 要件ID    | 項目        | 要件値                                       |
| --------- | ----------- | -------------------------------------------- |
| NFR-003-1 | APIキー保護 | 環境変数またはシークレットマネージャーで管理 |
| NFR-003-2 | 通信暗号化  | HTTPS必須（TLS 1.2以上）                     |

---

## 5. バッチ処理仕様

### 5.1 バッチサイズ設定

| モデル                 | 推奨バッチサイズ | 最大バッチサイズ |
| ---------------------- | ---------------- | ---------------- |
| Qwen3-Embedding-8B     | 50               | 100              |
| text-embedding-3-large | 100              | 2048             |
| voyage-3-large         | 128              | 128              |
| bge-m3                 | 32               | 64               |
| embedding-gemma        | 16               | 32               |

### 5.2 並列処理設定

```typescript
interface BatchConfig {
  batchSize: number;
  concurrency: number;
  delayBetweenBatches: number;
  onProgress?: (processed: number, total: number) => void;
}

const defaultBatchConfig: Record<string, BatchConfig> = {
  "EMB-001": { batchSize: 50, concurrency: 3, delayBetweenBatches: 100 },
  "EMB-002": { batchSize: 100, concurrency: 5, delayBetweenBatches: 50 },
  "EMB-003": { batchSize: 128, concurrency: 4, delayBetweenBatches: 100 },
  "EMB-004": { batchSize: 32, concurrency: 2, delayBetweenBatches: 0 },
  "EMB-005": { batchSize: 16, concurrency: 1, delayBetweenBatches: 0 },
};
```

---

## 6. レート制限対応

### 6.1 プロバイダー別レート制限

| プロバイダー | リクエスト制限 | トークン制限  |
| ------------ | -------------- | ------------- |
| OpenAI       | 3,000 RPM      | 1,000,000 TPM |
| Voyage AI    | 300 RPM        | 1,000,000 TPM |
| DashScope    | 500 RPM        | 500,000 TPM   |
| ローカル     | 制限なし       | VRAM依存      |

### 6.2 リトライ戦略

```typescript
interface RetryConfig {
  maxRetries: number;
  initialDelayMs: number;
  maxDelayMs: number;
  backoffMultiplier: number;
  jitter: boolean;
}

const defaultRetryConfig: RetryConfig = {
  maxRetries: 5,
  initialDelayMs: 1000,
  maxDelayMs: 60000,
  backoffMultiplier: 2,
  jitter: true,
};
```

### 6.3 指数バックオフ

```typescript
function calculateDelay(attempt: number, config: RetryConfig): number {
  let delay =
    config.initialDelayMs * Math.pow(config.backoffMultiplier, attempt);
  delay = Math.min(delay, config.maxDelayMs);
  if (config.jitter) {
    delay *= 0.5 + Math.random();
  }
  return Math.floor(delay);
}
```

---

## 7. API統合仕様

### 7.1 共通インターフェース

```typescript
interface EmbeddingProvider {
  readonly modelId: string;
  readonly providerName: string;
  readonly dimensions: number;
  readonly maxTokens: number;

  embed(text: string, options?: EmbedOptions): Promise<EmbeddingResult>;
  embedBatch(
    texts: string[],
    options?: BatchEmbedOptions,
  ): Promise<BatchEmbeddingResult>;
  countTokens(text: string): number;
  healthCheck(): Promise<boolean>;
}

interface EmbeddingResult {
  embedding: number[];
  tokenCount: number;
  model: string;
  processingTimeMs: number;
}

interface BatchEmbeddingResult {
  embeddings: EmbeddingResult[];
  errors: Array<{ index: number; error: string }>;
  totalTokens: number;
  totalProcessingTimeMs: number;
}
```

### 7.2 環境変数

```bash
OPENAI_API_KEY=sk-...
VOYAGE_API_KEY=pa-...
DASHSCOPE_API_KEY=sk-...
LOCAL_MODEL_PATH=/models/bge-m3
LOCAL_MODEL_DEVICE=cuda
EMBEDDING_DEFAULT_MODEL=EMB-002
EMBEDDING_FALLBACK_MODEL=EMB-001
```

---

## 8. コスト試算

### 8.1 API料金体系

| モデル                     | 料金（1M tokens） |
| -------------------------- | ----------------- |
| text-embedding-3-large     | $0.13             |
| voyage-3-large             | $0.12             |
| Qwen3-Embedding (API)      | $0.10             |
| bge-m3 (ローカル)          | $0                |
| embedding-gemma (ローカル) | $0                |

### 8.2 月間コスト試算

#### シナリオA: 小規模（5M tokens/月）

| モデル                 | 月間コスト |
| ---------------------- | ---------- |
| text-embedding-3-large | $0.65      |
| voyage-3-large         | $0.60      |
| Qwen3-Embedding (API)  | $0.50      |

#### シナリオB: 中規模（80M tokens/月）

| モデル                 | 月間コスト |
| ---------------------- | ---------- |
| text-embedding-3-large | $10.40     |
| voyage-3-large         | $9.60      |
| Qwen3-Embedding (API)  | $8.00      |

#### シナリオC: 大規模（1B tokens/月）

| モデル                 | 月間コスト |
| ---------------------- | ---------- |
| text-embedding-3-large | $130       |
| voyage-3-large         | $120       |
| Qwen3-Embedding (API)  | $100       |

### 8.3 推奨構成

| 用途         | 推奨モデル       | 理由                      |
| ------------ | ---------------- | ------------------------- |
| 本番検索     | voyage-3-large   | 最高精度、32Kコンテキスト |
| 開発・テスト | bge-m3           | 無料、十分な精度          |
| 大量バッチ   | Qwen3 (ローカル) | 高精度、無料              |
| オフライン   | embedding-gemma  | 軽量、CPU実行可           |

---

## 9. 変更履歴

| バージョン | 日付       | 変更者 | 変更内容 |
| ---------- | ---------- | ------ | -------- |
| 1.0.0      | 2025-12-26 | AI     | 初版作成 |
