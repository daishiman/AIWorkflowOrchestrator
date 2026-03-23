# xAI 最新モデル・API仕様調査

> 調査日: 2026-03-23
> ソース: [xAI Models and Pricing](https://docs.x.ai/developers/models), [Grok 3](https://docs.x.ai/developers/models/grok-3), [Release Notes](https://docs.x.ai/developers/release-notes)

## 現在の定義（レガシー）

```typescript
// apps/desktop/src/main/handlers/llm.ts:104-114
models: [
  {
    id: "grok-beta",
    name: "Grok Beta",
    contextWindow: 131072,
    isDefault: true,
  },
];
```

## 最新モデル一覧（2026-03 時点）

### Grok 3 ファミリー（推奨）

| モデルID      | 表示名      | Context Window | 特徴                                                | 推奨用途                       |
| ------------- | ----------- | -------------- | --------------------------------------------------- | ------------------------------ |
| `grok-3`      | Grok 3      | 131,072        | フラグシップモデル、推論・コーディング              | デフォルト推奨。一般的なタスク |
| `grok-3-mini` | Grok 3 Mini | 131,072        | コスト効率の良い推論モデル、`reasoning_effort` 対応 | コスト重視のタスク             |

### Grok 4 ファミリー（最新だが注意点あり）

| モデルID | 表示名 | Context Window | 特徴                               | 注意                                                       |
| -------- | ------ | -------------- | ---------------------------------- | ---------------------------------------------------------- |
| `grok-4` | Grok 4 | 不明           | 推論専用モデル（非推論モードなし） | `reasoning_effort` 未サポート、`grok-3` からの移行時に注意 |

Grok 4 は推論専用モデルのため、一般的なチャット用途には Grok 3 の方が適切。PROVIDER_CONFIGS には Grok 3 ファミリーを推奨。

### 退役・非推奨モデル

| モデルID    | ステータス   | 後継     |
| ----------- | ------------ | -------- |
| `grok-beta` | **レガシー** | `grok-3` |

## API構成

### エンドポイント

```
POST https://api.x.ai/v1/chat/completions
GET  https://api.x.ai/v1/models
```

変更なし。OpenAI互換のまま。

### 認証ヘッダー

```
Authorization: Bearer ${apiKey}
```

変更なし。

### リクエストボディ（OpenAI互換）

```json
{
  "model": "grok-3",
  "messages": [
    { "role": "system", "content": "You are a helpful assistant." },
    { "role": "user", "content": "Hello" }
  ],
  "temperature": 0.7,
  "max_tokens": 4096,
  "stream": true
}
```

既存の `xAIAdapter.sendChat` / `streamChat` のリクエスト形式はそのまま使用可能。

### モデルエイリアス規則

xAI はモデルエイリアスを提供:

- `grok-3` → 最新安定版にエイリアス
- `grok-3-latest` → 最新版にエイリアス（プレビュー含む）
- `grok-3-<date>` → 特定日のバージョンに固定

PROVIDER_CONFIGS ではエイリアス（`grok-3`）を使用することで自動的に最新安定版が利用される。

## 既存 Adapter への影響

### xAIAdapter.ts

- **変更不要**。リクエスト・レスポンス形式に変更なし
- モデルIDを `grok-beta` → `grok-3` に変更するだけで動作する
- `baseUrl`（`https://api.x.ai/v1`）も変更不要

## inferProviderId への影響

新モデルIDも `grok-` プレフィックスのため、変更不要。

```typescript
if (modelId.startsWith("grok-")) return "xai"; // そのまま動作する
```
