# Phase 2 設計書 — TASK-LLM-MOD-01

## 型定義設計（description?: string 追加）

変更対象: `apps/desktop/src/main/handlers/llm.ts` L33〜L41

`models` 配列要素に `description?: string` を追加する。他のフィールドは変更しない。

```typescript
const PROVIDER_CONFIGS: Array<{
  id: LLMProviderId;
  name: string;
  models: Array<{
    id: string;
    name: string;
    contextWindow: number;
    isDefault: boolean;
    description?: string;  // 追加
  }>;
}> = [...]
```

## 4プロバイダーのモデル一覧

### OpenAI（差し替え）

```typescript
{
  id: "openai",
  name: "OpenAI",
  models: [
    {
      id: "gpt-5.4",
      name: "GPT-5.4",
      contextWindow: 1050000,
      isDefault: true,
      description: "OpenAI最新フラッグシップモデル。コンテキストウィンドウ1.05M tokens",
    },
    {
      id: "gpt-5.4-mini",
      name: "GPT-5.4 mini",
      contextWindow: 1050000,
      isDefault: false,
      description: "GPT-5.4の軽量版。高速・低コスト",
    },
    {
      id: "gpt-5.4-nano",
      name: "GPT-5.4 nano",
      contextWindow: 1050000,
      isDefault: false,
      description: "GPT-5.4の超軽量版。最速・最低コスト",
    },
    {
      id: "gpt-5.4-pro",
      name: "GPT-5.4 Pro",
      contextWindow: 1050000,
      isDefault: false,
      description: "GPT-5.4の高性能版。複雑なタスク向け",
    },
    {
      id: "o3",
      name: "o3",
      contextWindow: 200000,
      isDefault: false,
      description: "高度な推論タスク向け。思考連鎖を内部実行",
    },
    {
      id: "o4-mini",
      name: "o4-mini",
      contextWindow: 200000,
      isDefault: false,
      description: "o4シリーズの軽量推論モデル",
    },
  ],
}
```

### Anthropic（差し替え）

```typescript
{
  id: "anthropic",
  name: "Anthropic",
  models: [
    {
      id: "claude-sonnet-4-6",
      name: "Claude Sonnet 4.6",
      contextWindow: 200000,
      isDefault: true,
      description: "Anthropicの最新バランスモデル。高性能・高速",
    },
    {
      id: "claude-opus-4-6",
      name: "Claude Opus 4.6",
      contextWindow: 200000,
      isDefault: false,
      description: "Anthropicの最高性能モデル。複雑なタスク向け",
    },
    {
      id: "claude-haiku-4-5",
      name: "Claude Haiku 4.5",
      contextWindow: 200000,
      isDefault: false,
      description: "Anthropicの高速軽量モデル。シンプルなタスク向け",
    },
  ],
}
```

### Google（差し替え）

速度重視/バランス/精度重視の3モデル構成:

```typescript
{
  id: "google",
  name: "Google",
  models: [
    {
      id: "gemini-3.1-flash-lite-preview",
      name: "Gemini 3.1 Flash-Lite",
      contextWindow: 1048576,
      isDefault: false,
      description: "Google最速・最低コストモデル（速度重視）",
    },
    {
      id: "gemini-3-flash-preview",
      name: "Gemini 3 Flash",
      contextWindow: 1048576,
      isDefault: true,
      description: "Google高速バランスモデル。1Mトークンコンテキスト対応（Gemini 2.5は2026年6月廃止予定）",
    },
    {
      id: "gemini-3.1-pro-preview",
      name: "Gemini 3.1 Pro",
      contextWindow: 1048576,
      isDefault: false,
      description: "Google最高性能モデル。複雑な推論・長文対応（精度重視）",
    },
  ],
}
```

### xAI（差し替え）

速度重視/バランス/精度重視の3モデル構成:

```typescript
{
  id: "xai",
  name: "xAI",
  models: [
    {
      id: "grok-3-mini",
      name: "Grok 3 Mini",
      contextWindow: 131072,
      isDefault: false,
      description: "Grok 3の軽量版。高速・低コスト（速度重視）",
    },
    {
      id: "grok-4-1-fast-non-reasoning",
      name: "Grok 4.1 Fast",
      contextWindow: 2097152,
      isDefault: true,
      description: "xAI最新高速モデル（非推論）。2Mトークンコンテキスト対応（バランス）",
    },
    {
      id: "grok-4-1-fast-reasoning",
      name: "Grok 4.1 Fast Reasoning",
      contextWindow: 2097152,
      isDefault: false,
      description: "xAI最新高速推論モデル。2Mトークンコンテキスト対応（精度重視）",
    },
  ],
}
```

### OpenRouter（変更なし）

既存の定義をそのまま維持する。

## inferProviderId 変更不要の判断根拠

現行実装（`apps/desktop/src/main/handlers/llm.ts` L453〜L466）はすでに `o3`/`o4` プレフィックスを含んでいる:

```typescript
function inferProviderId(modelId: string): LLMProviderId | null {
  if (
    modelId.startsWith("gpt-") ||
    modelId.startsWith("o3") ||
    modelId.startsWith("o4")
  )
    return "openai";
  if (modelId.startsWith("claude-")) return "anthropic";
  if (modelId.startsWith("gemini-")) return "google";
  if (modelId.startsWith("grok-")) return "xai";
  if (modelId.includes("/")) return "openrouter";
  return null;
}
```

新モデル `o3`, `o4-mini` はそれぞれ `o3`/`o4` プレフィックスを持つため、既存のパターンマッチで正しく `openai` に解決される。要件 R-07 は既存実装で既に満たされており、`inferProviderId` への変更は不要。

## 変更ファイル一覧（llm.ts 1ファイルのみ）

| ファイルパス                            | 変更種別 | 変更内容                                   |
| --------------------------------------- | -------- | ------------------------------------------ |
| `apps/desktop/src/main/handlers/llm.ts` | 更新     | PROVIDER_CONFIGS の型定義 + データ差し替え |

変更しないファイル（本タスクのスコープ外）:

- `apps/desktop/src/main/handlers/__tests__/llm.test.ts`（Task04 で対応）
- `packages/shared/src/types/llm/schemas.ts`
- `apps/desktop/src/preload/types.ts`

## モデル数比較テーブル（13→19）

| プロバイダー | 現行モデル数 | 変更後モデル数 | 差分 | 構成方針                              |
| ------------ | ------------ | -------------- | ---- | ------------------------------------- |
| OpenAI       | 3            | 6              | +3   | gpt-5.4系4モデル + o3/o4-mini 2モデル |
| Anthropic    | 3            | 3              | 0    | 速度重視/バランス/精度重視            |
| Google       | 2            | 3              | +1   | 速度重視/バランス/精度重視            |
| xAI          | 1            | 3              | +2   | 速度重視/バランス/精度重視            |
| OpenRouter   | 4            | 4              | 0    | 変更なし                              |
| 合計         | 13           | 19             | +6   |                                       |
