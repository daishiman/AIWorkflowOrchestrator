# Phase 1: IEmbeddingProvider 仕様確認

## 目的

埋め込み生成に使用するIEmbeddingProviderの仕様を確認し、VectorSearchStrategyとの連携要件を明確化する。

---

## 1. IEmbeddingProvider インターフェース

**ファイル**: `packages/shared/src/services/embedding/providers/interfaces.ts`

### インターフェース定義

```typescript
interface IEmbeddingProvider {
  readonly modelId: EmbeddingModelId;
  readonly providerName: ProviderName;
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
```

### プロパティ

| プロパティ   | 型               | 説明             |
| ------------ | ---------------- | ---------------- |
| modelId      | EmbeddingModelId | 埋め込みモデルID |
| providerName | ProviderName     | プロバイダー名   |
| dimensions   | number           | ベクトル次元数   |
| maxTokens    | number           | 最大トークン数   |

### メソッド

| メソッド      | 説明                         |
| ------------- | ---------------------------- |
| embed()       | 単一テキストの埋め込み生成   |
| embedBatch()  | 複数テキストのバッチ埋め込み |
| countTokens() | テキストのトークン数カウント |
| healthCheck() | プロバイダーのヘルスチェック |

---

## 2. EmbeddingResult 型

**ファイル**: `packages/shared/src/services/embedding/types/embedding.types.ts`

```typescript
interface EmbeddingResult {
  embedding: number[]; // 埋め込みベクトル
  tokenCount: number; // トークン数
  model: string; // 使用モデル
  processingTimeMs: number; // 処理時間（ミリ秒）
}
```

### 重要事項

- `embedding` は `number[]` 型で返される
- VectorSearchStrategyでは `Float32Array` に変換が必要
- 変換方法: `new Float32Array(result.embedding)`

---

## 3. 埋め込みモデル設定

### EmbeddingModelId

| ID      | モデル名               |
| ------- | ---------------------- |
| EMB-001 | Qwen3-Embedding-8B     |
| EMB-002 | text-embedding-3-large |
| EMB-003 | voyage-3-large         |
| EMB-004 | bge-m3                 |
| EMB-005 | embedding-gemma        |

### ProviderName

| プロバイダー | 説明              |
| ------------ | ----------------- |
| openai       | OpenAI API        |
| dashscope    | Alibaba DashScope |
| voyage       | Voyage AI         |
| huggingface  | HuggingFace       |
| local        | ローカルモデル    |

---

## 4. ベクトル次元数

サポートされる次元数（VectorIndexConfigより）:

| モデル                  | 次元数   |
| ----------------------- | -------- |
| text-embedding-3-small  | 1536     |
| text-embedding-3-large  | 3072     |
| embed-multilingual-v3.0 | 1024     |
| 汎用サポート範囲        | 512-4096 |

---

## 5. EmbedOptions / BatchEmbedOptions

### EmbedOptions

| オプション | 型                      | 説明                   |
| ---------- | ----------------------- | ---------------------- |
| dimensions | number \| undefined     | 次元数（可変モデル用） |
| retry      | RetryOptions            | リトライ設定           |
| timeout    | number \| undefined     | タイムアウト（ms）     |
| metadata   | Record<string, unknown> | メタデータ             |

### BatchEmbedOptions（追加オプション）

| オプション          | 型                                         | 説明               |
| ------------------- | ------------------------------------------ | ------------------ |
| batchSize           | number \| undefined                        | バッチサイズ       |
| concurrency         | number \| undefined                        | 並列度             |
| delayBetweenBatches | number \| undefined                        | バッチ間遅延（ms） |
| onProgress          | (processed: number, total: number) => void | 進捗コールバック   |

---

## 6. VectorSearchStrategyでの使用方法

### クエリ埋め込み生成

```typescript
async function generateQueryEmbedding(
  provider: IEmbeddingProvider,
  queryText: string,
): Promise<Float32Array> {
  const result = await provider.embed(queryText);
  return new Float32Array(result.embedding);
}
```

### エラーハンドリング要件

1. **タイムアウト処理**: デフォルト30秒、設定可能
2. **リトライ処理**: 指数バックオフ対応
3. **API障害時**: Result.err()でエラーを返す
4. **無効な入力**: バリデーションエラーを返す

### パフォーマンス考慮事項

- 埋め込み生成は1リクエストあたり100-500ms
- キャッシュ実装を推奨（CachedVectorSearchStrategy）
- バッチ処理は可能な限り使用

---

## 7. 統合テスト接続要件

### IEmbeddingProvider接続

```typescript
interface VectorSearchStrategyDeps {
  embeddingProvider: IEmbeddingProvider;
  db: LibSQLDatabase;
}
```

### エラーハンドリングフロー

```
1. クエリテキスト受信
2. IEmbeddingProvider.embed() 呼び出し
   ├── 成功: EmbeddingResult取得
   │   └── Float32Arrayに変換
   │       └── ベクトル検索実行
   └── 失敗: Result.err()を返す
       ├── タイムアウトエラー
       ├── APIエラー
       └── バリデーションエラー
```

---

## まとめ

| 項目                 | 状態     | 備考                           |
| -------------------- | -------- | ------------------------------ |
| IEmbeddingProvider   | 定義済み | interfaces.ts                  |
| EmbeddingResult      | 定義済み | embedding.types.ts             |
| embed()メソッド      | 使用可能 | 単一テキスト用                 |
| embedBatch()メソッド | 使用可能 | バッチ処理用（キャッシュ向け） |
| Float32Array変換     | 必要     | number[] → Float32Array        |

---

## 次のステップ

Phase 2で以下を設計:

1. VectorSearchStrategyのコンストラクタ設計（IEmbeddingProvider依存注入）
2. エラーハンドリング戦略
3. キャッシュ層の設計（CachedVectorSearchStrategy）
