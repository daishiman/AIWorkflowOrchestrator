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

Phase 1のギャップ分析を踏まえ、`PROVIDER_CONFIGS` インライン型への `description` フィールド追加と、description値の設定方針を設計する。

## 実行タスク

### Task 2-1: 変更設計

#### 変更対象: `apps/desktop/src/main/handlers/llm.ts`

`PROVIDER_CONFIGS` の配列要素型に `description?: string` を追加する。

**変更前の型定義（L33-L42）:**

```typescript
const PROVIDER_CONFIGS: Array<{
  id: LLMProviderId;
  name: string;
  models: Array<{
    id: string;
    name: string;
    contextWindow: number;
    isDefault: boolean;
  }>;
}> = [...]
```

**変更後の型定義:**

```typescript
const PROVIDER_CONFIGS: Array<{
  id: LLMProviderId;
  name: string;
  models: Array<{
    id: string;
    name: string;
    description?: string;  // 追加
    contextWindow: number;
    isDefault: boolean;
  }>;
}> = [...]
```

#### 変更対象: 各モデルエントリへの description 値追加

`PROVIDER_CONFIGS` 内の各モデルに `description` フィールドを追加する（英語の短い説明文）。

**追加する値の方針:**

- 30文字以内の英語で記述する
- モデルの特徴・用途を簡潔に表現する
- 省略可能なため、全モデルに追加するが空文字列は使用しない

**設定値一覧:**

| プロバイダー | モデルID                           | description                          |
| ------------ | ---------------------------------- | ------------------------------------ |
| openai       | gpt-4o                             | "Most capable multimodal model"      |
| openai       | gpt-4o-mini                        | "Fast and affordable GPT-4o"         |
| openai       | gpt-4-turbo                        | "Powerful model with vision support" |
| anthropic    | claude-3-5-sonnet-20241022         | "Best performance and speed balance" |
| anthropic    | claude-3-opus-20240229             | "Most powerful for complex tasks"    |
| anthropic    | claude-3-haiku-20240307            | "Fastest and most compact model"     |
| google       | gemini-1.5-pro                     | "Advanced reasoning, 2M context"     |
| google       | gemini-1.5-flash                   | "Fast and versatile performance"     |
| xai          | grok-beta                          | "Real-time knowledge with humor"     |
| openrouter   | openai/gpt-4o                      | "GPT-4o via OpenRouter"              |
| openrouter   | anthropic/claude-3.5-sonnet        | "Claude 3.5 Sonnet via OpenRouter"   |
| openrouter   | google/gemini-pro-1.5              | "Gemini 1.5 Pro via OpenRouter"      |
| openrouter   | meta-llama/llama-3.1-405b-instruct | "Llama 3.1 405B via OpenRouter"      |

### Task 2-2: データフロー確認

`description` フィールドが `PROVIDER_CONFIGS` → `handleGetProviders()` → IPC → Renderer まで透過的に伝達されることを確認する。

**データフロー:**

```
PROVIDER_CONFIGS（llm.ts内オブジェクト）
  ↓ config.models をそのまま展開
handleGetProviders()
  models: config.models  ← description を含む
  ↓ LLMProvider[] として返却
IPC: LLM_GET_PROVIDERS
  ↓ contextBridge 経由
Renderer（InlineModelSelectorなど）
  model.description を参照可能
```

**注意点:**

- `handleGetProviders()` は `models: config.models` として直接代入しているため、`PROVIDER_CONFIGS` に `description` を追加すれば自動的に伝搬する
- `LLMModelSchema` には既に `description: z.string().optional()` が存在するため、スキーマバリデーションは変更不要
- `LLMProvider` 型は `LLMProviderSchema` から推論されており、`models` 配列は `LLMModelSchema` の配列として型定義されている

### Task 2-3: 非スコープの記録

以下はRenderer側での description 表示実装であり、本タスクのスコープ外とする:

- Renderer コンポーネント（`InlineModelSelector` 等）への description 表示追加
- UI デザインの変更
- ツールチップ/サブテキストの実装

これらは Phase 12 Task 4 で未タスクとして記録する。

## 参照資料

| 資料                                                          | 用途                             |
| ------------------------------------------------------------- | -------------------------------- |
| `apps/desktop/src/main/handlers/llm.ts` (L33-L146)            | PROVIDER_CONFIGS定義の確認       |
| `packages/shared/src/types/llm/schemas/provider.ts` (L27-L44) | LLMModelSchema・LLMModel型の確認 |
| Phase 1 要件定義                                              | ギャップ分析結果の参照           |

## 成果物

| 成果物         | パス       | 備考                     |
| -------------- | ---------- | ------------------------ |
| Phase 2 設計書 | 本ファイル | 変更箇所・設計方針を記載 |

## 統合テスト連携

Phase 4 テスト作成で以下のテストケースを設計する:

1. `PROVIDER_CONFIGS` に `description` を追加した状態で `handleGetProviders()` を呼び出し、返却値に `description` が含まれることを確認するテスト
2. `LLMModelSchema.safeParse()` で `description` ありのモデルが正常にバリデーションされることの確認（既存 TS-002-02 が該当）

## 完了条件

- [ ] `PROVIDER_CONFIGS` インライン型への `description?: string` 追加設計が完了した
- [ ] 各モデルに設定する `description` 値が決定した（上記テーブル参照）
- [ ] `description` の伝搬パス（PROVIDER_CONFIGS → handleGetProviders → IPC → Renderer）が設計書に明記された
- [ ] スコープ外（Renderer表示実装）が明確に区別されている
- [ ] IPC ハンドラ登録関数の引数型がインターフェース依存であること（DIP違反なし）を確認した

## 次のPhase

[Phase 3: 設計レビュー](./phase-3-design-review.md)
