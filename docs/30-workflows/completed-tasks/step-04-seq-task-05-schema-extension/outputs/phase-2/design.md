# Phase 2: 設計 — 共有型スキーマ拡張

## 変更設計

### 変更対象: `packages/shared/src/types/llm/schemas/provider-registry.ts`

仕様書では `apps/desktop/src/main/handlers/llm.ts` を変更対象としていたが、実際には `PROVIDER_CONFIGS` は `provider-registry.ts` に定義されている。型定義（`ProviderModelEntry`）には既に `description?: string` があるため、**OpenRouter モデルへの値追加のみ**が必要。

### OpenRouter モデルの description 値設計

| モデルID                           | description                      |
| ---------------------------------- | -------------------------------- |
| openai/gpt-4o                      | GPT-4o via OpenRouter            |
| anthropic/claude-3.5-sonnet        | Claude 3.5 Sonnet via OpenRouter |
| google/gemini-pro-1.5              | Gemini 1.5 Pro via OpenRouter    |
| meta-llama/llama-3.1-405b-instruct | Llama 3.1 405B via OpenRouter    |

**設計方針:**

- 30文字以内の英語で記述
- 他プロバイダーの description と整合する命名パターン
- 空文字列は使用しない

## データフロー確認

```
PROVIDER_CONFIGS (provider-registry.ts)
  ↓ @repo/shared から export → llm.ts で import
handleGetProviders() (llm.ts:90-106)
  models: [...config.models]  ← description をスプレッドコピーで含む
  ↓ LLMProvider[] として返却
IPC: LLM_GET_PROVIDERS
  ↓ contextBridge 経由
Renderer (InlineModelSelector等)
  model.description を参照可能
```

## 非スコープ

- Renderer コンポーネントでの description 表示実装
- UI デザイン変更
- ツールチップ/サブテキスト実装
  → Phase 12 で未タスクとして記録する
