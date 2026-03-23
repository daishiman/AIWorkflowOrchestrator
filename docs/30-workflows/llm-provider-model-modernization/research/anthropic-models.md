# Anthropic 最新モデル・API仕様調査

> 調査日: 2026-03-23
> ソース: [Anthropic Models Overview](https://docs.anthropic.com/en/docs/about-claude/models/overview), [Migration Guide](https://docs.anthropic.com/en/docs/about-claude/models/migrating-to-claude-4), [Messages API](https://docs.anthropic.com/en/api/messages)

## 現在の定義（レガシー）

```typescript
// apps/desktop/src/main/handlers/llm.ts:64-83
models: [
  {
    id: "claude-3-5-sonnet-20241022",
    name: "Claude 3.5 Sonnet",
    contextWindow: 200000,
    isDefault: true,
  },
  {
    id: "claude-3-opus-20240229",
    name: "Claude 3 Opus",
    contextWindow: 200000,
    isDefault: false,
  },
  {
    id: "claude-3-haiku-20240307",
    name: "Claude 3 Haiku",
    contextWindow: 200000,
    isDefault: false,
  },
];
```

## 最新モデル一覧（2026-03 時点）

### Claude 4.6 世代（最新）

| モデルID            | 表示名            | Context Window    | 特徴                                           | 推奨用途                         |
| ------------------- | ----------------- | ----------------- | ---------------------------------------------- | -------------------------------- |
| `claude-sonnet-4-6` | Claude Sonnet 4.6 | 200,000 (1M beta) | コーディング・指示追従が大幅改善、コスト効率良 | デフォルト推奨。日常タスク全般   |
| `claude-opus-4-6`   | Claude Opus 4.6   | 200,000           | 最も高性能、複雑な推論・コーディング           | 複雑なタスク、高精度が必要な場合 |

### Claude 4.5 世代

| モデルID           | 表示名           | Context Window | 特徴                                             | 推奨用途               |
| ------------------ | ---------------- | -------------- | ------------------------------------------------ | ---------------------- |
| `claude-haiku-4-5` | Claude Haiku 4.5 | 200,000        | 最速、低コスト、Sonnet 4レベルのコーディング性能 | 高頻度・低コストタスク |

### 退役・非推奨モデル

| モデルID                     | ステータス   | 後継                |
| ---------------------------- | ------------ | ------------------- |
| `claude-3-5-sonnet-20241022` | **レガシー** | `claude-sonnet-4-6` |
| `claude-3-opus-20240229`     | **レガシー** | `claude-opus-4-6`   |
| `claude-3-haiku-20240307`    | **レガシー** | `claude-haiku-4-5`  |

### マイグレーションパス

```
claude-3-5-sonnet-20241022 → claude-sonnet-4-6
claude-3-opus-20240229     → claude-opus-4-6
claude-3-haiku-20240307    → claude-haiku-4-5
```

## API構成

### エンドポイント

```
POST https://api.anthropic.com/v1/messages
```

変更なし。

### 認証ヘッダー

```
x-api-key: ${apiKey}
anthropic-version: 2023-06-01
```

`anthropic-version` は **`2023-06-01` のまま変更不要**。2026年3月時点でも同じバージョンが最新。

### リクエストボディ

```json
{
  "model": "claude-sonnet-4-6",
  "system": "システムプロンプト",
  "messages": [{ "role": "user", "content": "Hello" }],
  "max_tokens": 4096,
  "temperature": 0.7,
  "stream": true
}
```

既存の `AnthropicAdapter.sendChat` / `streamChat` のリクエスト形式はそのまま使用可能。

### 新機能: Effort パラメータ

Opus 4.6 / Sonnet 4.6 では `effort` パラメータがサポートされ、推論の深さを制御可能:

- `low`: 高速、低コスト
- `medium`: バランス
- `high`: 深い推論
- `max`: 最大推論（トークン制限なし）

現時点では Adapter 側で対応不要（将来の改善タスク候補）。

## 既存 Adapter への影響

### AnthropicAdapter.ts

1. **ヘルスチェックモデル更新**: L207 `claude-3-haiku-20240307` → `claude-haiku-4-5`
2. **apiVersion**: `2023-06-01` のまま変更不要
3. **リクエスト・レスポンス形式**: 変更なし

```typescript
// 現在 (L207)
model: "claude-3-haiku-20240307", // 最安モデル

// 修正後
model: "claude-haiku-4-5", // 最安・最速モデル
```

## inferProviderId への影響

新モデルIDも `claude-` プレフィックスのため、変更不要。

```typescript
if (modelId.startsWith("claude-")) return "anthropic"; // そのまま動作する
```
