# Phase 2: 設計 — 共有型スキーマ拡張検討

## メタ情報

| 項目      | 値                  |
| --------- | ------------------- |
| Phase番号 | 2                   |
| 機能名    | schema-extension    |
| タスクID  | TASK-LLM-MOD-05     |
| 作成日    | 2026-03-23          |
| 依存Phase | Phase 1（要件定義） |

## 目的

Phase 1のギャップ分析を踏まえ、`packages/shared/src/types/llm/schemas/provider-registry.ts` の `PROVIDER_CONFIGS` に対して OpenRouter 4モデルの `description` 追加方針を設計する。

## 実行タスク

### Task 2-1: 変更設計

#### 変更対象: `packages/shared/src/types/llm/schemas/provider-registry.ts`

仕様書では `apps/desktop/src/main/handlers/llm.ts` を変更対象としていたが、実際には `PROVIDER_CONFIGS` は `provider-registry.ts` に定義されている。型定義（`ProviderModelEntry`）には既に `description?: string` があるため、**OpenRouter モデルへの値追加のみ**が必要。

#### OpenRouter モデルの description 値設計

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

### Task 2-2: データフロー確認

`description` フィールドが `PROVIDER_CONFIGS` → `handleGetProviders()` → IPC → Renderer まで透過的に伝達されることを確認する。

**データフロー:**

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

### Task 2-3: 非スコープの記録

以下はRenderer側での description 表示実装であり、本タスクのスコープ外とする:

- Renderer コンポーネント（`InlineModelSelector` 等）への description 表示追加
- UI デザインの変更
- ツールチップ/サブテキストの実装

これらは Phase 12 で未タスクとして記録する。

## 参照資料

| 資料                                                                  | 用途                             |
| --------------------------------------------------------------------- | -------------------------------- |
| `packages/shared/src/types/llm/schemas/provider-registry.ts` (L1-L80) | PROVIDER_CONFIGS定義の確認       |
| `packages/shared/src/types/llm/schemas/provider.ts` (L27-L44)         | LLMModelSchema・LLMModel型の確認 |
| Phase 1 要件定義                                                      | ギャップ分析結果の参照           |

## 成果物

| 成果物         | パス       | 備考                     |
| -------------- | ---------- | ------------------------ |
| Phase 2 設計書 | 本ファイル | 変更箇所・設計方針を記載 |

## 統合テスト連携

Phase 4 テスト作成で以下のテストケースを設計する:

1. `PROVIDER_CONFIGS` に `description` を追加した状態で `handleGetProviders()` を呼び出し、返却値に `description` が含まれることを確認するテスト
2. `LLMModelSchema.safeParse()` で `description` ありのモデルが正常にバリデーションされることの確認

## 完了条件

- [ ] `provider-registry.ts` をSSoTとする前提が明記された
- [ ] OpenRouter 4モデルの `description` 値が設計済みである
- [ ] `description` の伝搬パス（PROVIDER_CONFIGS → handleGetProviders → IPC → Renderer）が設計書に明記された
- [ ] スコープ外（Renderer表示実装）が明確に区別されている

## 次のPhase

[Phase 3: 設計レビュー](./phase-3-design-review.md)
