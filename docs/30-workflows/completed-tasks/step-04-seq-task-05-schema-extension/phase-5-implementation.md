# Phase 5: 実装 — 共有型スキーマ拡張検討

## メタ情報

| 項目      | 値                    |
| --------- | --------------------- |
| Phase番号 | 5                     |
| 機能名    | schema-extension      |
| タスクID  | TASK-LLM-MOD-05       |
| 作成日    | 2026-03-23            |
| 依存Phase | Phase 4（テスト作成） |

## 目的

`PROVIDER_CONFIGS` インライン型への `description?: string` 追加と各モデルへの説明文設定を実装し、Phase 4 で設計したテストを Green にする。

## 実行タスク

### Task 5-1: PROVIDER_CONFIGS 型への description 追加

**対象ファイル**: `apps/desktop/src/main/handlers/llm.ts`

**変更内容**: `PROVIDER_CONFIGS` の `models` 配列要素型に `description?: string` を追加する。

**変更箇所（L33-L42 の型定義部分）:**

```typescript
// 変更前
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

// 変更後
const PROVIDER_CONFIGS: Array<{
  id: LLMProviderId;
  name: string;
  models: Array<{
    id: string;
    name: string;
    description?: string;  // 追加: LLMModelSchema と整合
    contextWindow: number;
    isDefault: boolean;
  }>;
}> = [...]
```

### Task 5-2: 各モデルへの description 値設定

**対象ファイル**: `apps/desktop/src/main/handlers/llm.ts`

Phase 2 で決定した値をモデルエントリに追加する。

**OpenAI モデル:**

```typescript
{ id: "gpt-4o", name: "GPT-4o", description: "Most capable multimodal model", contextWindow: 128000, isDefault: true },
{ id: "gpt-4o-mini", name: "GPT-4o mini", description: "Fast and affordable GPT-4o", contextWindow: 128000, isDefault: false },
{ id: "gpt-4-turbo", name: "GPT-4 Turbo", description: "Powerful model with vision support", contextWindow: 128000, isDefault: false },
```

**Anthropic モデル:**

```typescript
{ id: "claude-3-5-sonnet-20241022", name: "Claude 3.5 Sonnet", description: "Best performance and speed balance", contextWindow: 200000, isDefault: true },
{ id: "claude-3-opus-20240229", name: "Claude 3 Opus", description: "Most powerful for complex tasks", contextWindow: 200000, isDefault: false },
{ id: "claude-3-haiku-20240307", name: "Claude 3 Haiku", description: "Fastest and most compact model", contextWindow: 200000, isDefault: false },
```

**Google モデル:**

```typescript
{ id: "gemini-1.5-pro", name: "Gemini 1.5 Pro", description: "Advanced reasoning, 2M context", contextWindow: 2097152, isDefault: true },
{ id: "gemini-1.5-flash", name: "Gemini 1.5 Flash", description: "Fast and versatile performance", contextWindow: 1048576, isDefault: false },
```

**xAI モデル:**

```typescript
{ id: "grok-beta", name: "Grok Beta", description: "Real-time knowledge with humor", contextWindow: 131072, isDefault: true },
```

**OpenRouter モデル:**

```typescript
{ id: "openai/gpt-4o", name: "GPT-4o (via OpenRouter)", description: "GPT-4o via OpenRouter", contextWindow: 128000, isDefault: true },
{ id: "anthropic/claude-3.5-sonnet", name: "Claude 3.5 Sonnet (via OpenRouter)", description: "Claude 3.5 Sonnet via OpenRouter", contextWindow: 200000, isDefault: false },
{ id: "google/gemini-pro-1.5", name: "Gemini 1.5 Pro (via OpenRouter)", description: "Gemini 1.5 Pro via OpenRouter", contextWindow: 2097152, isDefault: false },
{ id: "meta-llama/llama-3.1-405b-instruct", name: "Llama 3.1 405B (via OpenRouter)", description: "Llama 3.1 405B via OpenRouter", contextWindow: 131072, isDefault: false },
```

### Task 5-3: 型整合確認

実装後に TypeScript 型チェックを実行して、`PROVIDER_CONFIGS` の型が `LLMModel` 型と整合していることを確認する。

```bash
pnpm --filter @repo/desktop typecheck
pnpm --filter @repo/shared typecheck
```

`description?: string` は `z.string().optional()` の推論型 `string | undefined` と整合するため、型エラーは発生しない。

### Task 5-4: テスト実行（Green確認）

```bash
pnpm --filter @repo/desktop exec vitest run src/main/handlers/__tests__/llm.test.ts
pnpm --filter @repo/shared exec vitest run src/types/llm/schemas/__tests__/provider.test.ts
```

**期待される結果**: Phase 4 で実装したすべてのテストが PASS になること。

## 参照資料

| 資料                                                          | 用途                          |
| ------------------------------------------------------------- | ----------------------------- |
| `apps/desktop/src/main/handlers/llm.ts`                       | 変更対象ファイル（実装箇所）  |
| `packages/shared/src/types/llm/schemas/provider.ts` (L27-L44) | LLMModelSchema との整合確認   |
| Phase 4 テスト仕様書                                          | Green にすべきテストの確認    |
| Phase 2 設計書（description値一覧）                           | 設定する description 値の参照 |

## 成果物

| 成果物                      | パス                                    | 備考                          |
| --------------------------- | --------------------------------------- | ----------------------------- |
| PROVIDER_CONFIGS 型定義変更 | `apps/desktop/src/main/handlers/llm.ts` | `description?: string` を追加 |
| モデル description 値設定   | `apps/desktop/src/main/handlers/llm.ts` | 全13モデルエントリへの値追加  |

## 統合テスト連携

Phase 5 完了後に以下が満たされていること:

1. TS-B-01（description が handleGetProviders 経由で伝搬する）が PASS になった
2. TS-A 系テストはすべて PASS になった
3. 既存テスト（llm.test.ts の全テスト）が引き続き PASS であること

## 完了条件

- [ ] `PROVIDER_CONFIGS` のモデル配列要素型に `description?: string` を追加した
- [ ] 全13モデルエントリに `description` 値を設定した（空文字列を使わず、30文字以内の英語で記述）
- [ ] `pnpm --filter @repo/desktop typecheck` が PASS した
- [ ] Phase 4 の全テスト（TS-A-01〜A-04、TS-B-01、TS-B-02）が PASS した
- [ ] 既存テスト（`llm.test.ts`）が Phase 5 変更後も全件 PASS であることを確認した

## 次のPhase

[Phase 6: テスト拡充](./phase-6-test-expansion.md)
