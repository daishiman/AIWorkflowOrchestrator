# OpenRouter 最新モデル・API仕様調査

> 調査日: 2026-03-23
> ソース: [OpenRouter Documentation](https://openrouter.ai/docs), [OpenRouter Models API](https://openrouter.ai/api/v1/models), [OpenRouter Pricing](https://openrouter.ai/models)

## 概要

OpenRouter は 300+ モデル・60+ プロバイダーを単一のOpenAI互換APIで提供するプロキシサービス。`baseUrl` を変更するだけで既存のOpenAI互換 Adapter がそのまま利用できる。

## 現在の定義

```typescript
// apps/desktop/src/main/handlers/llm.ts（OpenRouterは既存のPROVIDER_CONFIGSに存在）
// 現在の設定を確認の上、必要に応じて更新
```

## API構成

### エンドポイント

```
POST https://openrouter.ai/api/v1/chat/completions
GET  https://openrouter.ai/api/v1/models
```

OpenAI互換。`baseUrl` を `https://openrouter.ai/api/v1` に変更するだけで動作。

### 認証ヘッダー

```
Authorization: Bearer ${apiKey}
HTTP-Referer: ${appUrl}   // 任意だが推奨（ランキングに使用される）
X-Title: ${appName}       // 任意（ダッシュボードでの表示名）
```

### リクエストボディ（OpenAI互換）

```json
{
  "model": "anthropic/claude-sonnet-4-6",
  "messages": [
    { "role": "system", "content": "You are a helpful assistant." },
    { "role": "user", "content": "Hello" }
  ],
  "temperature": 0.7,
  "max_tokens": 4096,
  "stream": true
}
```

## モデルID体系

OpenRouter のモデルIDは `{provider}/{model}` 形式:

| OpenRouter モデルID                 | 対応プロバイダー | 対応モデル             |
| ----------------------------------- | ---------------- | ---------------------- |
| `openai/gpt-5.4`                    | OpenAI           | GPT-5.4                |
| `anthropic/claude-sonnet-4-6`       | Anthropic        | Claude Sonnet 4.6      |
| `google/gemini-3-flash-preview`     | Google           | Gemini 3 Flash Preview |
| `x-ai/grok-4-1-fast`                | xAI              | Grok 4.1 Fast          |
| `meta-llama/llama-3.3-70b-instruct` | Meta             | Llama 3.3 70B          |
| `mistralai/mistral-large-2411`      | Mistral          | Mistral Large          |
| `deepseek/deepseek-chat`            | DeepSeek         | DeepSeek Chat          |

## バリアント（モデルID サフィックス）

OpenRouter は同一モデルに複数のルーティングバリアントを提供:

| バリアント  | 説明                                                 | 例                                     |
| ----------- | ---------------------------------------------------- | -------------------------------------- |
| `:free`     | 無料ティア（レート制限あり）                         | `google/gemini-3-flash-preview:free`   |
| `:thinking` | 推論モードを強制有効化                               | `anthropic/claude-opus-4-6:thinking`   |
| `:nitro`    | 高速ルーティング（Throughput優先、高速プロバイダー） | `openai/gpt-5.4:nitro`                 |
| `:floor`    | 最低コストルーティング                               | `openai/gpt-5.4:floor`                 |
| `:exacto`   | 特定プロバイダーへの固定ルーティング                 | `openai/gpt-5.4:exacto`                |
| `:extended` | 拡張コンテキストウィンドウ（対応モデルのみ）         | `anthropic/claude-sonnet-4-6:extended` |

## プラグイン機能

OpenRouter はリクエストボディに `plugins` フィールドを追加することで拡張機能を利用可能:

```json
{
  "model": "openai/gpt-5.4",
  "messages": [...],
  "plugins": [
    { "id": "web-search" },
    { "id": "pdf-reader" },
    { "id": "response-healing" }
  ]
}
```

| プラグインID       | 説明                                                |
| ------------------ | --------------------------------------------------- |
| `web-search`       | リアルタイムWeb検索（検索結果をコンテキストに注入） |
| `pdf-reader`       | PDF処理（URLまたはBase64エンコード）                |
| `response-healing` | 不正なJSONレスポンスの自動修復                      |

## Models API（動的モデル取得）

OpenRouter は全利用可能モデルのメタデータをAPIで取得可能:

```typescript
// 動的モデル一覧取得
const response = await fetch("https://openrouter.ai/api/v1/models", {
  headers: { Authorization: `Bearer ${apiKey}` },
});
const { data } = await response.json();
// data: Array<{ id, name, context_length, pricing, ... }>
```

レスポンス例:

```json
{
  "data": [
    {
      "id": "anthropic/claude-sonnet-4-6",
      "name": "Anthropic: Claude Sonnet 4.6",
      "context_length": 200000,
      "pricing": {
        "prompt": "0.000003",
        "completion": "0.000015"
      }
    }
  ]
}
```

## 推奨モデル構成（PROVIDER_CONFIGS）

OpenRouter は300+モデルを動的に提供するため、PROVIDER_CONFIGS には `openrouter/auto`（自動選択）と各プロバイダーの代表モデルを最小限に定義する。動的モデル取得は将来の改善タスク候補。

| ティア        | モデルID                             | 表示名                                | Context Window | 速度 | コスト | 精度 | デフォルト  | 用途                                         |
| ------------- | ------------------------------------ | ------------------------------------- | -------------- | ---- | ------ | ---- | ----------- | -------------------------------------------- |
| Auto          | `openrouter/auto`                    | Auto (Router selects best model)      | -              | -    | -      | -    | **default** | OpenRouterが最適モデルを自動選択             |
| Speed (Free)  | `google/gemini-3-flash-preview:free` | Gemini 3 Flash (Free, via OpenRouter) | 1,048,576      | S    | S      | A    | -           | 無料枠で高速処理                             |
| Balanced      | `anthropic/claude-sonnet-4-6`        | Claude Sonnet 4.6 (via OpenRouter)    | 200,000        | A    | A      | A    | -           | 日常タスク全般                               |
| Max Accuracy  | `openai/gpt-5.4`                     | GPT-5.4 (via OpenRouter)              | 1,050,000      | A    | B      | A    | -           | 複雑な推論・コーディング                     |
| Large Context | `x-ai/grok-4-1-fast`                 | Grok 4.1 Fast (via OpenRouter)        | 2,000,000      | A    | B      | A    | -           | 2Mコンテキストが必要な大規模ドキュメント処理 |

> 評価凡例: S = 最高 / A = 高 / B = 中 / C = 低
> `openrouter/auto` はリクエスト内容に基づきOpenRouterが最適なモデルを自動選択する。ユーザーが特定モデルを選びたい場合は他の選択肢を使用する。

### PROVIDER_CONFIGS 実装コード

```typescript
{
  id: "openrouter",
  name: "OpenRouter",
  baseUrl: "https://openrouter.ai/api/v1",
  models: [
    {
      id: "openrouter/auto",
      name: "Auto (Router selects best model)",
      contextWindow: 200000,
      isDefault: true,
    },
    {
      id: "google/gemini-3-flash-preview:free",
      name: "Gemini 3 Flash (Free, via OpenRouter)",
      contextWindow: 1048576,
      isDefault: false,
    },
    {
      id: "anthropic/claude-sonnet-4-6",
      name: "Claude Sonnet 4.6 (via OpenRouter)",
      contextWindow: 200000,
      isDefault: false,
    },
    {
      id: "openai/gpt-5.4",
      name: "GPT-5.4 (via OpenRouter)",
      contextWindow: 1050000,
      isDefault: false,
    },
    {
      id: "x-ai/grok-4-1-fast",
      name: "Grok 4.1 Fast (via OpenRouter)",
      contextWindow: 2000000,
      isDefault: false,
    },
  ],
}
```

### 選択ガイド

- **「おまかせ」**: `openrouter/auto` (default) -- OpenRouterがリクエスト内容に基づき最適モデルを自動選択。迷ったらこれ
- **「無料で試したい」**: `google/gemini-3-flash-preview:free` -- 無料枠で高速処理。プロトタイプやテスト用途に最適
- **「安定した品質」**: `anthropic/claude-sonnet-4-6` -- 日常タスク全般に信頼性の高い選択肢
- **「最高性能が必要」**: `openai/gpt-5.4` -- 1Mコンテキスト、複雑な推論・コーディングに対応
- **「超大規模コンテキスト」**: `x-ai/grok-4-1-fast` -- 2Mコンテキストで大規模ドキュメント・コードベースの処理に強い

### 動的モデル取得（将来の改善タスク候補）

Models API を定期的に呼び出してモデル一覧をキャッシュし、UIに動的表示する。実装コストが高いため未タスク化を推奨。

## 既存 Adapter への影響

### OpenRouterAdapter.ts（または OpenAIAdapter の baseUrl 変更）

OpenRouter は OpenAI 互換のため、既存の `OpenAIAdapter` を `baseUrl` のみ変更して流用可能:

```typescript
// 既存 OpenAIAdapter の設定を流用
constructor(config?: { baseUrl?: string; apiKey?: string }) {
  this.baseUrl = config?.baseUrl ?? "https://openrouter.ai/api/v1";
  // 以降は OpenAIAdapter と同一
}
```

追加ヘッダー（`HTTP-Referer`, `X-Title`）が必要な場合のみ専用 Adapter の作成を検討。

## inferProviderId への影響

OpenRouter 経由のモデルIDは `{provider}/` プレフィックスを持つため、専用ルールが必要:

```typescript
// OpenRouter モデルは provider/model 形式
if (modelId.includes("/")) return "openrouter";

// または OpenRouter に対応するプレフィックス一覧でチェック
const openrouterPrefixes = [
  "anthropic/",
  "openai/",
  "google/",
  "x-ai/",
  "meta-llama/",
  "mistralai/",
  "deepseek/",
];
if (openrouterPrefixes.some((p) => modelId.startsWith(p))) return "openrouter";
```
