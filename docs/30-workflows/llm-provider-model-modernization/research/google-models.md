# Google Gemini 最新モデル・API仕様調査

> 調査日: 2026-03-23
> ソース: [Gemini Models](https://ai.google.dev/gemini-api/docs/models), [Gemini 2.5 Flash](https://ai.google.dev/gemini-api/docs/models/gemini-2.5-flash), [Gemini 2.5 Pro](https://docs.cloud.google.com/vertex-ai/generative-ai/docs/models/gemini/2-5-pro), [API Versions](https://ai.google.dev/gemini-api/docs/api-versions)

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

### Gemini 2.5 ファミリー（GA）

| モデルID                | 表示名                | Context Window | 特徴                                                 | 推奨用途                                 |
| ----------------------- | --------------------- | -------------- | ---------------------------------------------------- | ---------------------------------------- |
| `gemini-2.5-flash`      | Gemini 2.5 Flash      | 1,048,576      | 最もコスト効率が良い。thinking対応、エージェント向け | デフォルト推奨。大規模処理・低レイテンシ |
| `gemini-2.5-pro`        | Gemini 2.5 Pro        | 1,048,576      | 最も高度な推論。テキスト・コード・メディア横断       | 複雑な推論、コードリポジトリ解析         |
| `gemini-2.5-flash-lite` | Gemini 2.5 Flash-Lite | 1,048,576      | 最もコスト効率が良い軽量版                           | 分類・簡易データ抽出・超低レイテンシ     |

### 退役・非推奨モデル

| モデルID               | ステータス                                 | 後継               |
| ---------------------- | ------------------------------------------ | ------------------ |
| `gemini-1.5-pro`       | **レガシー**（2026-06 廃止予定）           | `gemini-2.5-pro`   |
| `gemini-1.5-flash`     | **レガシー**（2026-06 廃止予定）           | `gemini-2.5-flash` |
| `gemini-2.0-flash-001` | **既存顧客のみ**（2026-03-06以降新規不可） | `gemini-2.5-flash` |

### 次世代（プレビュー）

| モデルID                 | 表示名         | ステータス |
| ------------------------ | -------------- | ---------- |
| `gemini-3-flash-preview` | Gemini 3 Flash | Preview    |
| `gemini-3.1-pro-preview` | Gemini 3.1 Pro | Preview    |

プレビューモデルは本番利用非推奨のため、PROVIDER_CONFIGS には含めない。

## API構成

### エンドポイント

```
# 現在の実装（v1）
POST https://generativelanguage.googleapis.com/v1/models/{model}:generateContent?key=${apiKey}
POST https://generativelanguage.googleapis.com/v1/models/{model}:streamGenerateContent?key=${apiKey}&alt=sse

# v1beta（system_instruction 対応）
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
    "maxOutputTokens": 4096
  }
}
```

`system_instruction` は Gemini 2.5 以降でサポートされている正式なフィールド。

## 既存 Adapter への影響

### GoogleAdapter.ts — 必要な変更

1. **APIバージョン**: `v1` → `v1beta` への変更を検討
   - `v1` でも `system_instruction` が使えるか要確認（Gemini 2.5 GA で v1 にも追加された可能性あり）
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
| 新機能             | 安定機能のみ                        | 最新機能にアクセス可能               |

## inferProviderId への影響

新モデルIDも `gemini-` プレフィックスのため、変更不要。

```typescript
if (modelId.startsWith("gemini-")) return "google"; // そのまま動作する
```
