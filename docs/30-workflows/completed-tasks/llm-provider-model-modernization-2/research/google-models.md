# Google Gemini 最新モデル・API仕様調査

> 調査日: 2026-03-23
> ソース: [Gemini Models](https://ai.google.dev/gemini-api/docs/models), [Gemini 3 Flash Preview](https://ai.google.dev/gemini-api/docs/models/gemini-3-flash), [Gemini 3.1 Pro Preview](https://ai.google.dev/gemini-api/docs/models/gemini-3-1-pro), [API Versions](https://ai.google.dev/gemini-api/docs/api-versions)

## 現在の定義（レガシー）

```typescript
// apps/desktop/src/main/handlers/llm.ts:88-101
models: [
  {
    id: "gemini-1.5-pro",
    name: "Gemini 1.5 Pro",
    contextWindow: 2097152,
    isDefault: true,
  },
  {
    id: "gemini-1.5-flash",
    name: "Gemini 1.5 Flash",
    contextWindow: 1048576,
    isDefault: false,
  },
];
```

## 最新モデル一覧（2026-03 時点）

### Gemini 3 ファミリー（最新・プレビュー）

| モデルID                        | 表示名                          | Context Window | 価格 (per 1M tokens: input/output) | 特徴                                   | 推奨用途                             |
| ------------------------------- | ------------------------------- | -------------- | ---------------------------------- | -------------------------------------- | ------------------------------------ |
| `gemini-3-flash-preview`        | Gemini 3 Flash (Preview)        | 1,048,576      | $0.50 / $3.00                      | 高速・高性能、thinking対応、無料枠あり | デフォルト推奨（プレビューだが安定） |
| `gemini-3.1-pro-preview`        | Gemini 3.1 Pro (Preview)        | 未公開         | 未公開                             | 最新推論モデル、最高精度               | 複雑な推論・コードリポジトリ解析     |
| `gemini-3.1-flash-lite-preview` | Gemini 3.1 Flash Lite (Preview) | 未公開         | 最低コスト                         | 最もコスト効率が良い                   | 分類・簡易データ抽出・超低レイテンシ |

> 注意: Gemini 3 シリーズはPreviewステータス。本番利用は各プロジェクトのリスク判断による。

### Gemini 2.5 ファミリー（GA・廃止予定）

| モデルID                | 表示名                | Context Window | 特徴                                           | 廃止予定   |
| ----------------------- | --------------------- | -------------- | ---------------------------------------------- | ---------- |
| `gemini-2.5-flash`      | Gemini 2.5 Flash      | 1,048,576      | コスト効率良好。thinking対応、エージェント向け | 2026-06-17 |
| `gemini-2.5-pro`        | Gemini 2.5 Pro        | 1,048,576      | 高度な推論。テキスト・コード・メディア横断     | 2026-06-17 |
| `gemini-2.5-flash-lite` | Gemini 2.5 Flash-Lite | 1,048,576      | 最もコスト効率が良い軽量版                     | 2026-06-17 |

> 重要: Gemini 2.5 シリーズは **2026-06-17 に廃止予定**。早期に Gemini 3 への移行を推奨。

### 退役・非推奨モデル

| モデルID               | ステータス                                 | 後継                     |
| ---------------------- | ------------------------------------------ | ------------------------ |
| `gemini-1.5-pro`       | **レガシー**（2026-06 廃止予定）           | `gemini-3.1-pro-preview` |
| `gemini-1.5-flash`     | **レガシー**（2026-06 廃止予定）           | `gemini-3-flash-preview` |
| `gemini-2.0-flash-001` | **既存顧客のみ**（2026-03-06以降新規不可） | `gemini-3-flash-preview` |
| `gemini-2.5-flash`     | **廃止予定（2026-06-17）**                 | `gemini-3-flash-preview` |
| `gemini-2.5-pro`       | **廃止予定（2026-06-17）**                 | `gemini-3.1-pro-preview` |

## API構成

### エンドポイント

```
# 現在の実装（v1）
POST https://generativelanguage.googleapis.com/v1/models/{model}:generateContent?key=${apiKey}
POST https://generativelanguage.googleapis.com/v1/models/{model}:streamGenerateContent?key=${apiKey}&alt=sse

# v1beta（system_instruction 対応・新機能アクセス）
POST https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key=${apiKey}
POST https://generativelanguage.googleapis.com/v1beta/models/{model}:streamGenerateContent?key=${apiKey}&alt=sse
```

### 認証

```
?key=${apiKey}
```

クエリパラメータによるAPI キー認証。変更なし。

### 現在のリクエストボディ（v1）

```json
{
  "contents": [
    {
      "role": "user",
      "parts": [{ "text": "System: You are a helpful assistant." }]
    },
    { "role": "user", "parts": [{ "text": "Hello" }] }
  ],
  "generationConfig": {
    "temperature": 0.7,
    "maxOutputTokens": 4096
  }
}
```

現在は `user` ロールに `"System: ..."` を埋め込むワークアラウンドを使用。

### 改善後のリクエストボディ（v1beta / system_instruction 対応）

```json
{
  "system_instruction": {
    "parts": [{ "text": "You are a helpful assistant." }]
  },
  "contents": [{ "role": "user", "parts": [{ "text": "Hello" }] }],
  "generationConfig": {
    "temperature": 0.7,
    "maxOutputTokens": 4096,
    "thinking_level": "medium"
  }
}
```

`system_instruction` は Gemini 2.5 / Gemini 3 以降でサポートされている正式なフィールド。

### Gemini 3 の新機能・注意点

- **`thinking_level` パラメータ**: `minimal` / `low` / `medium` / `high` で推論の深さを制御
- **Thought Signatures**: 推論過程のトレーサビリティ向上
- **Computer Use**: コンピュータ操作機能（APIから利用可能）
- **`system_instruction`**: Gemini 3 でも引き続きサポート
- **無料枠**: `gemini-3-flash-preview` に無料利用枠あり

## 推奨モデル構成（PROVIDER_CONFIGS）

ユーザーが用途に応じて選択できるよう、速度/コスト/精度の3軸で3モデルを構成する。

| ティア       | モデルID                        | 表示名                          | Context Window | 速度 | コスト | 精度 | デフォルト  | 用途                                   |
| ------------ | ------------------------------- | ------------------------------- | -------------- | ---- | ------ | ---- | ----------- | -------------------------------------- |
| Speed        | `gemini-3.1-flash-lite-preview` | Gemini 3.1 Flash Lite (Preview) | 未公開         | S    | S      | B    | -           | 分類・簡易データ抽出・超低レイテンシ   |
| Balanced     | `gemini-3-flash-preview`        | Gemini 3 Flash (Preview)        | 1,048,576      | A    | A      | A    | **default** | 高速・高性能、thinking対応、無料枠あり |
| Max Accuracy | `gemini-3.1-pro-preview`        | Gemini 3.1 Pro (Preview)        | 未公開         | B    | C      | S    | -           | 複雑な推論・コードリポジトリ解析       |

> 評価凡例: S = 最高 / A = 高 / B = 中 / C = 低
> 注意: Gemini 3 シリーズは全てPreviewステータス。本番利用は各プロジェクトのリスク判断による。

### PROVIDER_CONFIGS 実装コード

```typescript
{
  id: "google",
  name: "Google",
  baseUrl: "https://generativelanguage.googleapis.com/v1beta",
  models: [
    {
      id: "gemini-3.1-flash-lite-preview",
      name: "Gemini 3.1 Flash Lite (Preview)",
      contextWindow: 1048576,
      isDefault: false,
    },
    {
      id: "gemini-3-flash-preview",
      name: "Gemini 3 Flash (Preview)",
      contextWindow: 1048576,
      isDefault: true,
    },
    {
      id: "gemini-3.1-pro-preview",
      name: "Gemini 3.1 Pro (Preview)",
      contextWindow: 1048576,
      isDefault: false,
    },
  ],
}
```

### 選択ガイド

- **「とにかく速く・安く」**: `gemini-3.1-flash-lite-preview` -- 最もコスト効率が良い軽量モデル。分類・簡易データ抽出に最適
- **「標準的なタスク全般」**: `gemini-3-flash-preview` (default) -- 1Mコンテキスト、thinking対応、無料枠あり。大規模処理に強い
- **「最高精度が必要」**: `gemini-3.1-pro-preview` -- 最新推論モデル。`thinking_level` パラメータで推論の深さを制御可能

## 既存 Adapter への影響

### GoogleAdapter.ts — 必要な変更

1. **APIバージョン**: `v1` → `v1beta` への変更を検討
   - Gemini 3 の新機能（`thinking_level` 等）は `v1beta` 経由でのみアクセス可能
   - 安全策: `v1beta` を使用
2. **`formatContents` メソッド**: `system_instruction` フィールドを使用し、systemPrompt を `contents` から分離
3. **`sendChat` / `streamChat`**: リクエストボディに `system_instruction` を追加

### 影響範囲

```typescript
// 現在の GoogleAdapter.ts
constructor() {
  this.baseUrl = config?.baseUrl ?? "https://generativelanguage.googleapis.com/v1";
  //                                                                            ^^^ ここを v1beta に変更検討
}

// formatContents() の変更
// 現在: systemPrompt を user ロールに埋め込み
// 改善: systemPrompt を system_instruction フィールドに移動
```

### v1 vs v1beta のトレードオフ

| 項目               | v1（現在）                          | v1beta（改善案）                     |
| ------------------ | ----------------------------------- | ------------------------------------ |
| 安定性             | GA。Breaking change なし            | ベータ。Breaking change の可能性あり |
| system_instruction | Gemini 2.5 以降で使用可能（要確認） | 確実に使用可能                       |
| thinking_level     | 未サポート                          | サポート                             |
| 新機能             | 安定機能のみ                        | 最新機能にアクセス可能               |

## inferProviderId への影響

新モデルIDも `gemini-` プレフィックスのため、変更不要。

```typescript
if (modelId.startsWith("gemini-")) return "google"; // そのまま動作する
```
