# 設定ガイド - エンティティ抽出サービス (NER)

## メタ情報

| 項目     | 内容                  |
| -------- | --------------------- |
| タスクID | CONV-06-04            |
| Phase    | 12                    |
| 作成日   | 2026-01-18            |
| 機能名   | entity-extraction-ner |

---

## 1. 環境変数一覧

### 1.1 LLM関連

| 環境変数           | 説明                      | デフォルト        | 必須  |
| ------------------ | ------------------------- | ----------------- | ----- |
| `LLM_PROVIDER`     | LLMプロバイダー種別       | `anthropic`       | No    |
| `LLM_MODEL_ID`     | 使用するモデルID          | `claude-3-sonnet` | No    |
| `LLM_API_KEY`      | LLM API キー              | -                 | Yes\* |
| `LLM_API_BASE_URL` | APIベースURL（カスタム）  | プロバイダー依存  | No    |
| `LLM_TIMEOUT_MS`   | APIタイムアウト（ミリ秒） | `30000`           | No    |
| `LLM_MAX_RETRIES`  | リトライ回数              | `3`               | No    |

\*RuleBasedExtractorのみ使用する場合は不要

### 1.2 抽出設定

| 環境変数                     | 説明                             | デフォルト | 必須 |
| ---------------------------- | -------------------------------- | ---------- | ---- |
| `NER_MIN_CONFIDENCE`         | 最小信頼度閾値                   | `0.5`      | No   |
| `NER_MAX_ENTITIES_PER_CHUNK` | チャンクあたり最大エンティティ数 | `20`       | No   |
| `NER_MIN_NAME_LENGTH`        | 最小エンティティ名長             | `2`        | No   |
| `NER_USE_LLM`                | LLM使用フラグ                    | `true`     | No   |
| `NER_GENERATE_DESCRIPTIONS`  | 説明文生成フラグ                 | `true`     | No   |

### 1.3 バッチ処理

| 環境変数                | 説明               | デフォルト | 必須 |
| ----------------------- | ------------------ | ---------- | ---- |
| `NER_BATCH_SIZE`        | バッチサイズ上限   | `100`      | No   |
| `NER_BATCH_CONCURRENCY` | 並列実行数         | `10`       | No   |
| `NER_BATCH_TIMEOUT_MS`  | バッチタイムアウト | `60000`    | No   |

### 1.4 ロギング

| 環境変数              | 説明               | デフォルト | 必須 |
| --------------------- | ------------------ | ---------- | ---- |
| `NER_LOG_LEVEL`       | ログレベル         | `info`     | No   |
| `NER_LOG_PERFORMANCE` | パフォーマンスログ | `false`    | No   |

---

## 2. LLMプロバイダー設定

### 2.1 Anthropic (Claude)

```typescript
// 環境変数
LLM_PROVIDER=anthropic
LLM_MODEL_ID=claude-3-sonnet-20240229
LLM_API_KEY=sk-ant-...

// プログラム設定
const provider = new AnthropicProvider({
  apiKey: process.env.LLM_API_KEY,
  modelId: process.env.LLM_MODEL_ID || "claude-3-sonnet-20240229",
});
```

**対応モデル**:

- `claude-3-opus-20240229` - 最高精度
- `claude-3-sonnet-20240229` - バランス（推奨）
- `claude-3-haiku-20240307` - 高速・低コスト

### 2.2 OpenAI (GPT)

```typescript
// 環境変数
LLM_PROVIDER=openai
LLM_MODEL_ID=gpt-4o
LLM_API_KEY=sk-...

// プログラム設定
const provider = new OpenAIProvider({
  apiKey: process.env.LLM_API_KEY,
  modelId: process.env.LLM_MODEL_ID || "gpt-4o",
});
```

**対応モデル**:

- `gpt-4o` - 最新・推奨
- `gpt-4-turbo` - 高精度
- `gpt-3.5-turbo` - 高速・低コスト

### 2.3 ローカルLLM (Ollama)

```typescript
// 環境変数
LLM_PROVIDER=ollama
LLM_MODEL_ID=llama3.1:8b
LLM_API_BASE_URL=http://localhost:11434

// プログラム設定
const provider = new OllamaProvider({
  baseUrl: process.env.LLM_API_BASE_URL || "http://localhost:11434",
  modelId: process.env.LLM_MODEL_ID || "llama3.1:8b",
});
```

**推奨モデル**:

- `llama3.1:8b` - 軽量・高速
- `llama3.1:70b` - 高精度
- `mistral:7b` - バランス

---

## 3. パフォーマンスチューニング

### 3.1 LLMコスト最適化

| 設定項目            | 低コスト設定   | バランス設定    | 高精度設定    |
| ------------------- | -------------- | --------------- | ------------- |
| `LLM_MODEL_ID`      | claude-3-haiku | claude-3-sonnet | claude-3-opus |
| `NER_USE_LLM`       | `false`\*      | `true`          | `true`        |
| `NER_MAX_ENTITIES`  | `10`           | `20`            | `50`          |
| `NER_GENERATE_DESC` | `false`        | `true`          | `true`        |

\*RuleBasedのみ使用

### 3.2 スループット最適化

```typescript
// 高スループット設定
const options = {
  // バッチサイズを大きく
  batchSize: 100,

  // 並列数を増加（APIレート制限に注意）
  concurrency: 20,

  // 説明文生成をオフ（トークン節約）
  generateDescriptions: false,

  // 信頼度閾値を上げて結果を絞る
  minConfidence: 0.7,
};
```

### 3.3 レイテンシ最適化

```typescript
// 低レイテンシ設定
const options = {
  // RuleBasedを優先使用
  useLLM: false,

  // 小さいバッチサイズ
  batchSize: 10,

  // タイムアウトを短く
  timeoutMs: 5000,
};
```

### 3.4 メモリ使用量最適化

| 状況                 | 推奨設定                               |
| -------------------- | -------------------------------------- |
| 大量ドキュメント処理 | バッチサイズ50以下、ストリーミング処理 |
| 長いテキスト         | チャンクサイズ小さめ、逐次処理         |
| メモリ制約環境       | RuleBasedのみ、結果即時永続化          |

---

## 4. トラブルシューティング

### 4.1 よくあるエラーと対処

#### LLM_TIMEOUT

```
Error: LLM request timed out after 30000ms
Code: LLM_TIMEOUT
```

**原因**:

- LLM APIの応答が遅い
- ネットワーク遅延
- 入力テキストが長すぎる

**対処**:

```typescript
// タイムアウトを延長
const extractor = new LLMEntityExtractor(provider, {
  timeoutMs: 60000, // 60秒に延長
});

// または入力を分割
const smallerChunks = splitLargeChunk(chunk, 5000); // 5000文字以下に分割
```

#### LLM_RATE_LIMIT

```
Error: Rate limit exceeded
Code: LLM_RATE_LIMIT
```

**原因**:

- APIレート制限に達した
- 並列リクエストが多すぎる

**対処**:

```typescript
// 並列数を減らす
const options = {
  concurrency: 5, // デフォルト10から減らす
};

// リトライ設定を調整
const extractor = new LLMEntityExtractor(provider, {
  maxRetries: 5,
  retryDelayMs: 2000, // 初期待機を長く
});
```

#### LLM_RESPONSE_PARSE

```
Error: Failed to parse LLM response
Code: LLM_RESPONSE_PARSE
```

**原因**:

- LLMが不正なJSONを返した
- スキーマ不一致

**対処**:

```typescript
// フォールバックを有効化
const extractor = new LLMEntityExtractor(provider, {
  fallbackExtractor: new RuleBasedEntityExtractor(),
});

// または温度を下げる
const options = {
  temperature: 0.0, // 決定論的に
};
```

#### INVALID_CHUNK

```
Error: Invalid chunk: empty content
Code: INVALID_CHUNK
```

**原因**:

- 空のチャンクが渡された
- チャンクコンテンツが長すぎる（100,000文字超過）

**対処**:

```typescript
// 入力検証を追加
if (!chunk.content || chunk.content.length === 0) {
  // 空チャンクはスキップ
  continue;
}

if (chunk.content.length > 100000) {
  // 長すぎる場合は分割
  chunks = splitChunk(chunk, 50000);
}
```

### 4.2 デバッグログの有効化

```typescript
// 環境変数
NER_LOG_LEVEL = debug;
NER_LOG_PERFORMANCE = true;

// または実行時設定
const extractor = new LLMEntityExtractor(provider, {
  logger: {
    level: "debug",
    logPrompts: true, // プロンプトをログ出力
    logResponses: true, // レスポンスをログ出力
  },
});
```

### 4.3 診断コマンド

```bash
# 接続テスト
pnpm --filter @repo/shared test:integration -- --grep "LLM connection"

# パフォーマンステスト
pnpm --filter @repo/shared test:perf

# 特定テスト実行
pnpm --filter @repo/shared test -- extraction/__tests__/llm-entity-extractor.test.ts
```

---

## 5. 本番環境チェックリスト

### 5.1 必須設定

- [ ] `LLM_API_KEY` が設定されている
- [ ] API キーが適切な権限を持っている
- [ ] ネットワークからLLM APIにアクセス可能

### 5.2 推奨設定

- [ ] `LLM_TIMEOUT_MS` を環境に合わせて調整
- [ ] `NER_BATCH_CONCURRENCY` をレート制限に合わせて設定
- [ ] フォールバック用 `RuleBasedExtractor` を有効化
- [ ] エラー監視・アラートを設定

### 5.3 セキュリティ

- [ ] APIキーは環境変数またはシークレットマネージャーで管理
- [ ] APIキーをログに出力しない設定
- [ ] 本番環境では `NER_LOG_LEVEL=info` 以上

---

## 6. 設定例

### 6.1 開発環境

```bash
# .env.development
LLM_PROVIDER=anthropic
LLM_MODEL_ID=claude-3-haiku-20240307
LLM_API_KEY=sk-ant-dev-...
LLM_TIMEOUT_MS=10000

NER_MIN_CONFIDENCE=0.3
NER_LOG_LEVEL=debug
NER_LOG_PERFORMANCE=true
```

### 6.2 本番環境

```bash
# .env.production
LLM_PROVIDER=anthropic
LLM_MODEL_ID=claude-3-sonnet-20240229
LLM_API_KEY=${LLM_API_KEY}  # シークレットから取得
LLM_TIMEOUT_MS=30000
LLM_MAX_RETRIES=3

NER_MIN_CONFIDENCE=0.5
NER_BATCH_CONCURRENCY=10
NER_LOG_LEVEL=info
NER_LOG_PERFORMANCE=false
```

### 6.3 コスト重視環境

```bash
# .env.cost-optimized
LLM_PROVIDER=anthropic
LLM_MODEL_ID=claude-3-haiku-20240307

NER_USE_LLM=true
NER_GENERATE_DESCRIPTIONS=false
NER_MAX_ENTITIES_PER_CHUNK=10
NER_MIN_CONFIDENCE=0.7
```

---

## 更新履歴

| 日付       | 更新内容 | 担当 |
| ---------- | -------- | ---- |
| 2026-01-18 | 初版作成 | AI   |
