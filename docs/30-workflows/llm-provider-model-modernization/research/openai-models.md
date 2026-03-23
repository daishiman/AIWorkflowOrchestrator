# OpenAI 最新モデル・API仕様調査

> 調査日: 2026-03-23
> ソース: [OpenAI Models](https://platform.openai.com/docs/models), [GPT-5.4](https://platform.openai.com/docs/models/gpt-5.4), [OpenAI API Reference](https://platform.openai.com/docs/api-reference/chat)

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

### GPT-5.4 ファミリー（推奨・最新）

| モデルID       | 表示名       | Context Window | 特徴                                                         | 推奨用途                                   |
| -------------- | ------------ | -------------- | ------------------------------------------------------------ | ------------------------------------------ |
| `gpt-5.4`      | GPT-5.4      | 1,050,000      | フラグシップ。複雑な推論・コーディング、コンピュータ利用内蔵 | デフォルト推奨。日常的なコーディングタスク |
| `gpt-5.4-pro`  | GPT-5.4 Pro  | 1,050,000      | より多くのcompute使用。reasoning.effort: medium/high/xhigh   | 高度な推論が必要なタスク                   |
| `gpt-5.4-mini` | GPT-5.4 Mini | 1,050,000      | 高速・効率的                                                 | 大量ワークロード、コスト重視               |
| `gpt-5.4-nano` | GPT-5.4 Nano | 1,050,000      | 最速・最低コスト                                             | 分類・データ抽出・高頻度軽量タスク         |

### GPT-4.1 ファミリー（引き続き利用可能）

| モデルID       | 表示名       | Context Window | 特徴                         | 推奨用途               |
| -------------- | ------------ | -------------- | ---------------------------- | ---------------------- |
| `gpt-4.1`      | GPT-4.1      | 1,000,000      | コーディング・指示追従に特化 | 一般コーディングタスク |
| `gpt-4.1-mini` | GPT-4.1 Mini | 1,000,000      | バランスの取れたコスト・性能 | コスト重視の一般タスク |
| `gpt-4.1-nano` | GPT-4.1 Nano | 1,000,000      | 最速・最低コスト             | 高頻度・軽量タスク     |

### o-Series（推論モデル・APIでは引き続き利用可能）

| モデルID  | 表示名  | Context Window | 特徴                                 | 推奨用途                   |
| --------- | ------- | -------------- | ------------------------------------ | -------------------------- |
| `o3`      | o3      | 200,000        | 数学・科学・コーディングの高度な推論 | 複雑な推論が必要なタスク   |
| `o4-mini` | o4-mini | 200,000        | 高速推論、ハイスループット向け       | コスト効率の良い推論タスク |

> 注意: o3/o4-mini は 2026年2月にChatGPTから退役済み。ただしAPIでは引き続き利用可能。

### 退役・非推奨モデル

| モデルID      | ステータス                                      | 備考                 |
| ------------- | ----------------------------------------------- | -------------------- |
| `gpt-5.2`     | **廃止予定（2026-06-05）**                      | 後継: `gpt-5.4`      |
| `gpt-4.1`     | **ChatGPTから退役済み（APIは利用可）**          | 後継: `gpt-5.4`      |
| `o3`          | **ChatGPTから退役済み（2026-02）、APIは利用可** | 後継: `gpt-5.4-pro`  |
| `o4-mini`     | **ChatGPTから退役済み（2026-02）、APIは利用可** | 後継: `gpt-5.4-mini` |
| `gpt-4o`      | **APIのみ利用可、ChatGPTからは退役済み**        | 後継: `gpt-5.4`      |
| `gpt-4o-mini` | **退役済み**                                    | 後継: `gpt-5.4-mini` |
| `gpt-4-turbo` | **レガシー**                                    | 後継: `gpt-5.4`      |

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
  "model": "gpt-5.4",
  "messages": [...],
  "temperature": 0.7,
  "max_tokens": 4096,
  "stream": true
}
```

既存の `OpenAIAdapter.sendChat` / `streamChat` のリクエスト形式はそのまま使用可能。

### GPT-5.4 の新機能・注意点

- **reasoning.effort**: `none`（デフォルト）/ `low` / `medium` / `high` / `xhigh`
- **compaction 対応**: 長いコンテキストの自動圧縮をサポート
- **コンピュータ利用機能内蔵**: 追加設定なしで利用可能
- **gpt-5.4-pro の reasoning.effort**: `medium` / `high` / `xhigh` のみ有効

### o-Series の注意点

- o3/o4-mini は推論モデルのため、`temperature` パラメータが無効化される場合がある
- `max_tokens` の代わりに `max_completion_tokens` が推奨される可能性がある
- レスポンスに `reasoning_content` フィールドが追加される場合がある

## 推奨モデル構成（PROVIDER_CONFIGS）

ユーザーが用途に応じて選択できるよう、速度/コスト/精度の3軸で4モデルを構成する。

| ティア       | モデルID       | 表示名       | Context Window | 速度 | コスト | 精度 | デフォルト  | 用途                                     |
| ------------ | -------------- | ------------ | -------------- | ---- | ------ | ---- | ----------- | ---------------------------------------- |
| Speed        | `gpt-5.4-nano` | GPT-5.4 Nano | 1,050,000      | S    | S      | B    | -           | 分類・データ抽出・高頻度軽量タスク       |
| Balanced     | `gpt-5.4-mini` | GPT-5.4 Mini | 1,050,000      | A    | A      | A    | -           | 大量ワークロード・コスト効率重視         |
| Flagship     | `gpt-5.4`      | GPT-5.4      | 1,050,000      | A    | B      | A    | **default** | 複雑な推論・コーディング・日常タスク全般 |
| Max Accuracy | `gpt-5.4-pro`  | GPT-5.4 Pro  | 1,050,000      | B    | C      | S    | -           | 最高精度の推論（reasoning.effort対応）   |

> 評価凡例: S = 最高 / A = 高 / B = 中 / C = 低

### PROVIDER_CONFIGS 実装コード

```typescript
{
  id: "openai",
  name: "OpenAI",
  baseUrl: "https://api.openai.com/v1",
  models: [
    {
      id: "gpt-5.4-nano",
      name: "GPT-5.4 Nano",
      contextWindow: 1050000,
      isDefault: false,
    },
    {
      id: "gpt-5.4-mini",
      name: "GPT-5.4 Mini",
      contextWindow: 1050000,
      isDefault: false,
    },
    {
      id: "gpt-5.4",
      name: "GPT-5.4",
      contextWindow: 1050000,
      isDefault: true,
    },
    {
      id: "gpt-5.4-pro",
      name: "GPT-5.4 Pro",
      contextWindow: 1050000,
      isDefault: false,
    },
  ],
}
```

### 選択ガイド

- **「とにかく速く・安く」**: `gpt-5.4-nano` -- 分類タスク、データ抽出、バリデーション等の高頻度処理に最適
- **「コストと品質のバランス」**: `gpt-5.4-mini` -- 大量リクエストを処理する必要があるがある程度の品質も求める場合
- **「標準的なタスク全般」**: `gpt-5.4` (default) -- コーディング補助、文章生成、一般的な推論タスク
- **「最高精度が必要」**: `gpt-5.4-pro` -- `reasoning.effort` で推論の深さを制御可能。研究・分析・複雑なコード生成

## inferProviderId への影響

```typescript
// 現在: gpt- プレフィックスのみ
if (modelId.startsWith("gpt-")) return "openai";

// 修正: o3/o4 プレフィックスを追加（APIでは引き続き利用可能なため）
if (
  modelId.startsWith("gpt-") ||
  modelId.startsWith("o3") ||
  modelId.startsWith("o4")
)
  return "openai";
```

## 既存 Adapter への影響

- `OpenAIAdapter.ts`: リクエスト・レスポンス形式に変更なし。モデルIDを変えるだけで動作する
- GPT-5.4 の `reasoning.effort` パラメータは後段の改善タスクで対応可能
- o-Series 使用時の `temperature` / `max_tokens` の挙動差異は後段の改善タスクで対応可能
