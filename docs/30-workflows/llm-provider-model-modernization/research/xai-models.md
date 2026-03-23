# xAI 最新モデル・API仕様調査

> 調査日: 2026-03-23
> ソース: [xAI Models and Pricing](https://docs.x.ai/developers/models), [Grok 4.1](https://docs.x.ai/developers/models/grok-4-1), [Release Notes](https://docs.x.ai/developers/release-notes), [LMArena Text Arena](https://lmarena.ai)

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

### Grok 4.1 ファミリー（最新・推奨）

| モデルID                      | 表示名                        | Context Window | 特徴                                          | 推奨用途                         |
| ----------------------------- | ----------------------------- | -------------- | --------------------------------------------- | -------------------------------- |
| `grok-4-1-fast-reasoning`     | Grok 4.1 Fast (Reasoning)     | 2,000,000      | 推論モード、LMArena Text Arena #1（Elo 1483） | 複雑な推論・高精度タスク         |
| `grok-4-1-fast-non-reasoning` | Grok 4.1 Fast (Non-Reasoning) | 2,000,000      | 非推論モード、低レイテンシ                    | デフォルト推奨。一般チャット     |
| `grok-4-1-fast`               | Grok 4.1 Fast                 | 2,000,000      | `grok-4-1-fast-non-reasoning` のエイリアス    | 一般タスク（エイリアス使用推奨） |

> Grok 4.1 のハリネーション率は Grok 4 の約半分。LMArena Text Arena で首位（Elo 1483）。

### Grok 4 ファミリー（推論専用）

| モデルID | 表示名 | Context Window | 特徴                   | 注意                          |
| -------- | ------ | -------------- | ---------------------- | ----------------------------- |
| `grok-4` | Grok 4 | 不明           | 推論専用モデル、高精度 | `reasoning_effort` 未サポート |

> 注意: Grok 4 は推論専用モデルのため非推論モードなし。`reasoning_effort` パラメータ未サポート。一般チャット用途には Grok 4.1 ファミリーを推奨。

### Grok 3 ファミリー（引き続き利用可能）

| モデルID      | 表示名      | Context Window | 特徴                                                | 推奨用途                   |
| ------------- | ----------- | -------------- | --------------------------------------------------- | -------------------------- |
| `grok-3`      | Grok 3      | 131,072        | フラグシップモデル、推論・コーディング              | 安定版として引き続き利用可 |
| `grok-3-mini` | Grok 3 Mini | 131,072        | コスト効率の良い推論モデル、`reasoning_effort` 対応 | コスト重視のタスク         |

### 退役・非推奨モデル

| モデルID    | ステータス   | 後継            |
| ----------- | ------------ | --------------- |
| `grok-beta` | **レガシー** | `grok-4-1-fast` |

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
  "model": "grok-4-1-fast",
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

### Grok 4.1 の注意点

- `grok-4-1-fast-reasoning` は推論モードのため `temperature` が無効化される場合がある
- Grok 4 は `reasoning_effort` パラメータ未サポート（Grok 3 Mini とは異なる）
- 2Mコンテキストウィンドウ（Grok 3 の約15倍）

### モデルエイリアス規則

xAI はモデルエイリアスを提供:

- `grok-4-1-fast` → `grok-4-1-fast-non-reasoning` のエイリアス
- `grok-3` → 最新安定版にエイリアス
- `grok-3-latest` → 最新版にエイリアス（プレビュー含む）
- `grok-3-<date>` → 特定日のバージョンに固定

PROVIDER_CONFIGS ではエイリアス（`grok-4-1-fast`）を使用することで自動的に最新安定版が利用される。

## 推奨モデル構成（PROVIDER_CONFIGS）

ユーザーが用途に応じて選択できるよう、速度/コスト/精度の3軸で3モデルを構成する。

| ティア       | モデルID                      | 表示名                        | Context Window | 速度 | コスト | 精度 | デフォルト  | 用途                                                          |
| ------------ | ----------------------------- | ----------------------------- | -------------- | ---- | ------ | ---- | ----------- | ------------------------------------------------------------- |
| Speed        | `grok-3-mini`                 | Grok 3 Mini                   | 131,072        | S    | S      | B    | -           | コスト効率重視、reasoning_effort対応                          |
| Balanced     | `grok-4-1-fast-non-reasoning` | Grok 4.1 Fast (Non-Reasoning) | 2,000,000      | A    | A      | A    | **default** | 低レイテンシ・一般チャット・2Mコンテキスト                    |
| Max Accuracy | `grok-4-1-fast-reasoning`     | Grok 4.1 Fast (Reasoning)     | 2,000,000      | B    | B      | S    | -           | 推論モード・LMArena Text Arena #1（Elo 1483）・2Mコンテキスト |

> 評価凡例: S = 最高 / A = 高 / B = 中 / C = 低

### PROVIDER_CONFIGS 実装コード

```typescript
{
  id: "xai",
  name: "xAI",
  baseUrl: "https://api.x.ai/v1",
  models: [
    {
      id: "grok-3-mini",
      name: "Grok 3 Mini",
      contextWindow: 131072,
      isDefault: false,
    },
    {
      id: "grok-4-1-fast-non-reasoning",
      name: "Grok 4.1 Fast (Non-Reasoning)",
      contextWindow: 2000000,
      isDefault: true,
    },
    {
      id: "grok-4-1-fast-reasoning",
      name: "Grok 4.1 Fast (Reasoning)",
      contextWindow: 2000000,
      isDefault: false,
    },
  ],
}
```

### 選択ガイド

- **「とにかく速く・安く」**: `grok-3-mini` -- `reasoning_effort` パラメータ対応。コスト効率の良い推論モデル
- **「標準的なタスク全般」**: `grok-4-1-fast-non-reasoning` (default) -- 非推論モードで低レイテンシ。2Mコンテキストで大規模ドキュメント処理に強い
- **「最高精度が必要」**: `grok-4-1-fast-reasoning` -- 推論モード有効。LMArena Text Arena 首位（Elo 1483）。ハリネーション率はGrok 4の約半分

## 既存 Adapter への影響

### xAIAdapter.ts

- **変更不要**。リクエスト・レスポンス形式に変更なし
- モデルIDを `grok-beta` → `grok-4-1-fast` に変更するだけで動作する
- `baseUrl`（`https://api.x.ai/v1`）も変更不要

## inferProviderId への影響

新モデルIDも `grok-` プレフィックスのため、変更不要。

```typescript
if (modelId.startsWith("grok-")) return "xai"; // そのまま動作する
```
