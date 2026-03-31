# Phase 1: 要件定義 — 現状調査・ギャップ分析結果

## Task 1-1: 現状調査結果

### LLMModelSchema の状態

- `packages/shared/src/types/llm/schemas/provider.ts:30` に `description: z.string().optional()` が **定義済み**
- `LLMModel` 型（推論型）に `description?: string` が含まれる

### PROVIDER_CONFIGS の状態

- **注意**: 仕様書の想定とは異なり、`PROVIDER_CONFIGS` は `apps/desktop/src/main/handlers/llm.ts` ではなく `packages/shared/src/types/llm/schemas/provider-registry.ts` に定義されている
- `ProviderModelEntry` インターフェース（L17-23）に `description?: string` が **定義済み**
- `PROVIDER_CONFIGS` は `as const satisfies readonly ProviderConfigEntry[]` で定義されており、型安全性が確保されている

### 各プロバイダーの description 設定状況

| プロバイダー | モデル数 | description設定状況                     |
| ------------ | -------- | --------------------------------------- |
| openai       | 6        | ✅ 全モデルに設定済み                   |
| anthropic    | 3        | ✅ 全モデルに設定済み                   |
| google       | 3        | ✅ 全モデルに設定済み                   |
| xai          | 3        | ✅ 全モデルに設定済み                   |
| openrouter   | 4        | ❌ 未設定（description フィールドなし） |

### IPC経由の伝搬確認

- `handleGetProviders()` (llm.ts:90-106) は `models: [...config.models]` でスプレッドコピーしている
- `PROVIDER_CONFIGS` に `description` があれば自動的にIPC経由で伝搬される
- `LLMProviderSchema` の `models` は `z.array(LLMModelSchema).min(1)` — `LLMModelSchema` に `description` が定義済みのためバリデーション通過

## Task 1-2: ギャップ分析

| 項目                                          | 状態                | 対応               |
| --------------------------------------------- | ------------------- | ------------------ |
| `LLMModelSchema` の `description`             | ✅ 定義済み         | 変更不要           |
| `ProviderModelEntry` の `description`         | ✅ 定義済み         | 変更不要           |
| OpenAI/Anthropic/Google/xAI の description 値 | ✅ 設定済み         | 変更不要           |
| OpenRouter の description 値                  | ❌ 未設定           | **追加必要**       |
| テスト（TS-A系 description バリデーション）   | ❌ 未作成           | **追加必要**       |
| テスト（TS-B系 description 伝搬確認）         | △ T-05 で部分カバー | **追加テスト必要** |

## Task 1-3: 要件定義

### スコープ

- スキーマ変更: **不要**（`LLMModelSchema` に `description` 定義済み）
- 型定義変更: **不要**（`ProviderModelEntry` に `description` 定義済み）
- 値の追加: **OpenRouter 4モデル** に `description` を追加
- テスト追加: TS-A-01~A-04（スキーマテスト）、TS-B-01~B-02（伝搬テスト）
- Renderer表示: **スコープ外**（未タスク化候補）

### 受入基準

- OpenRouter 全4モデルに `description` が設定されている
- `PROVIDER_CONFIGS` → `handleGetProviders()` → IPC で `description` が透過的に伝搬する
- TS-A, TS-B テストが全件 PASS
