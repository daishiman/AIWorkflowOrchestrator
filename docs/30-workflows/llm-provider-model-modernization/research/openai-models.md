# OpenAI 最新モデル・API仕様調査

> 調査日: 2026-03-23
> ソース: [OpenAI Models](https://developers.openai.com/api/docs/models), [GPT-4.1](https://platform.openai.com/docs/models/gpt-4.1), [o4-mini](https://platform.openai.com/docs/models/o4-mini)

## 現在の定義（レガシー）

```typescript
// apps/desktop/src/main/handlers/llm.ts:46-59
models: [
  { id: "gpt-4o", name: "GPT-4o", contextWindow: 128000, isDefault: true },
  {
    id: "gpt-4o-mini",
    name: "GPT-4o mini",
    contextWindow: 128000,
    isDefault: false,
  },
  {
    id: "gpt-4-turbo",
    name: "GPT-4 Turbo",
    contextWindow: 128000,
    isDefault: false,
  },
];
```

## 最新モデル一覧（2026-03 時点）

### GPT-4.1 ファミリー

| モデルID       | 表示名       | Context Window | 特徴                                         | 推奨用途                                   |
| -------------- | ------------ | -------------- | -------------------------------------------- | ------------------------------------------ |
| `gpt-4.1`      | GPT-4.1      | 1,000,000      | コーディング・指示追従に特化、1Mコンテキスト | デフォルト推奨。日常的なコーディングタスク |
| `gpt-4.1-mini` | GPT-4.1 Mini | 1,000,000      | バランスの取れたコスト・性能                 | コスト重視の一般タスク                     |
| `gpt-4.1-nano` | GPT-4.1 Nano | 1,000,000      | 最速・最低コスト                             | 高頻度・軽量タスク                         |

### o-Series（推論モデル）

| モデルID  | 表示名  | Context Window | 特徴                                 | 推奨用途                   |
| --------- | ------- | -------------- | ------------------------------------ | -------------------------- |
| `o3`      | o3      | 200,000        | 数学・科学・コーディングの高度な推論 | 複雑な推論が必要なタスク   |
| `o4-mini` | o4-mini | 200,000        | 高速推論、ハイスループット向け       | コスト効率の良い推論タスク |

### 退役・非推奨モデル

| モデルID      | ステータス                                             | 備考                 |
| ------------- | ------------------------------------------------------ | -------------------- |
| `gpt-4o`      | **APIのみ利用可、ChatGPTからは退役予定（2026-04-03）** | 後継: `gpt-4.1`      |
| `gpt-4o-mini` | **退役予定**                                           | 後継: `gpt-4.1-mini` |
| `gpt-4-turbo` | **レガシー**                                           | 後継: `gpt-4.1`      |

## API構成

### エンドポイント

```
POST https://api.openai.com/v1/chat/completions
```

変更なし。既存の `OpenAIAdapter` の `baseUrl` はそのまま使用可能。

### 認証ヘッダー

```
Authorization: Bearer ${apiKey}
```

変更なし。

### リクエストボディ

```json
{
  "model": "gpt-4.1",
  "messages": [...],
  "temperature": 0.7,
  "max_tokens": 4096,
  "stream": true
}
```

既存の `OpenAIAdapter.sendChat` / `streamChat` のリクエスト形式はそのまま使用可能。

### o-Series の注意点

- o3/o4-mini は推論モデルのため、`temperature` パラメータが無効化される場合がある
- `max_tokens` の代わりに `max_completion_tokens` が推奨される可能性がある
- レスポンスに `reasoning_content` フィールドが追加される場合がある

## inferProviderId への影響

```typescript
// 現在: gpt- プレフィックスのみ
if (modelId.startsWith("gpt-")) return "openai";

// 修正: o3/o4 プレフィックスを追加
if (
  modelId.startsWith("gpt-") ||
  modelId.startsWith("o3") ||
  modelId.startsWith("o4")
)
  return "openai";
```

## 既存 Adapter への影響

- `OpenAIAdapter.ts`: リクエスト・レスポンス形式に変更なし。モデルIDを変えるだけで動作する
- o-Series 使用時の `temperature` / `max_tokens` の挙動差異は後段の改善タスクで対応可能
