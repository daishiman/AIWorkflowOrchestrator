# Phase 5: 実装（実施済み） -- OpenRouter プロバイダー統合

## メタ情報

| 項目       | 値                     |
| ---------- | ---------------------- |
| Phase番号  | 5                      |
| 機能名     | openrouter-integration |
| タスクID   | TASK-LLM-MOD-07        |
| 作成日     | 2026-03-23             |
| ステータス | 実施済み               |
| 依存Phase  | Phase 4（テスト作成）  |

## 目的

Phase 2 で設計した 6 ファイルの変更を実装し、Phase 4 で設計したテストを Green にする。

## 実行タスク（実施済み記録）

### Task 5-1: 型定義の変更（完了）

**対象ファイル**: `packages/shared/src/types/llm/schemas/provider.ts`

`LLMProviderIdSchema` に `"openrouter"` を追加した:

```typescript
export const LLMProviderIdSchema = z.enum([
  "openai",
  "anthropic",
  "google",
  "xai",
  "openrouter",
]);
```

### Task 5-2: PROVIDER_CONFIGS への OpenRouter エントリ追加（完了）

**対象ファイル**: `apps/desktop/src/main/handlers/llm.ts`

`PROVIDER_CONFIGS` 配列の末尾に OpenRouter エントリ（4 モデル）を追加した:

```typescript
{
  id: "openrouter",
  name: "OpenRouter",
  models: [
    {
      id: "openai/gpt-4o",
      name: "GPT-4o (via OpenRouter)",
      contextWindow: 128000,
      isDefault: true,
    },
    {
      id: "anthropic/claude-3.5-sonnet",
      name: "Claude 3.5 Sonnet (via OpenRouter)",
      contextWindow: 200000,
      isDefault: false,
    },
    {
      id: "google/gemini-pro-1.5",
      name: "Gemini 1.5 Pro (via OpenRouter)",
      contextWindow: 2097152,
      isDefault: false,
    },
    {
      id: "meta-llama/llama-3.1-405b-instruct",
      name: "Llama 3.1 405B (via OpenRouter)",
      contextWindow: 131072,
      isDefault: false,
    },
  ],
},
```

### Task 5-3: inferProviderId の更新（完了）

**対象ファイル**: `apps/desktop/src/main/handlers/llm.ts`

`inferProviderId` 関数に `/` 含みパターンを追加した。既存プレフィックスマッチの後、`return null` の直前に配置:

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
  // OpenRouterのモデルIDは "provider/model" 形式
  if (modelId.includes("/")) return "openrouter";
  return null;
}
```

**判定順序のポイント**: 既存プレフィックスマッチ（`gpt-`, `claude-`, `gemini-`, `grok-`）が `/` パターンより先に評価されるため、直接プロバイダーのモデルID（例: `gpt-4o`）がOpenRouterに誤判定されることはない。

### Task 5-4: isValidProviderId の統一（完了）

**対象ファイル**: `apps/desktop/src/main/handlers/llm.ts`

`isValidProviderId` 関数をハードコード配列から `LLMProviderIdSchema.safeParse` に統一した:

```typescript
function isValidProviderId(id: unknown): id is LLMProviderId {
  return LLMProviderIdSchema.safeParse(id).success;
}
```

**変更の意義**: 二重管理（ハードコード配列 + Zod スキーマ）を解消し、Single Source of Truth を実現した。

### Task 5-5: SecureStorage の更新（完了）

**対象ファイル**: `apps/desktop/src/main/services/secureStorage.ts`

`ALL_PROVIDERS` 配列に `"openrouter"` を追加した:

```typescript
const ALL_PROVIDERS: LLMProviderId[] = [
  "openai",
  "anthropic",
  "google",
  "xai",
  "openrouter",
];
```

### Task 5-6: LLMAdapterFactory の更新（完了）

**対象ファイル**: `apps/desktop/src/main/adapters/llm/LLMAdapterFactory.ts`

`OPENAI_COMPATIBLE_CONFIGS` に OpenRouter 設定を追加した:

```typescript
openrouter: {
  providerId: "openrouter",
  defaultBaseUrl: "https://openrouter.ai/api/v1",
  extraHeaders: {
    "HTTP-Referer": "https://aiworkflow.app",
    "X-Title": "AIWorkflowOrchestrator",
  },
},
```

`SUPPORTED_PROVIDER_IDS` に `"openrouter"` を追加した。

### Task 5-7: ハードコード型リテラルの統一（完了）

**対象ファイル**:

- `apps/desktop/src/main/ipc/aiHandlers.ts`
- `apps/desktop/src/renderer/views/WorkspaceView/hooks/useWorkspaceChatController.ts`

ハードコードされた `"openai" | "anthropic" | "google" | "xai"` を `LLMProviderId` 型に置換した。`import type { LLMProviderId } from "@repo/shared/types/llm/schemas"` を追加した。

### Task 5-8: 型整合確認（完了）

```bash
pnpm --filter @repo/shared typecheck   # 0 エラー
pnpm --filter @repo/desktop typecheck  # 0 エラー
```

AC-06 達成を確認した。

### Task 5-9: テスト実行（Green 確認済み）

Phase 4 で設計した全テスト（TS-A 〜 TS-E）が PASS であることを確認した。

## 参照資料

| 資料                                                                                | 用途                       |
| ----------------------------------------------------------------------------------- | -------------------------- |
| `packages/shared/src/types/llm/schemas/provider.ts`                                 | 変更対象（型定義）         |
| `apps/desktop/src/main/handlers/llm.ts`                                             | 変更対象（ハンドラ）       |
| `apps/desktop/src/main/services/secureStorage.ts`                                   | 変更対象（ストレージ）     |
| `apps/desktop/src/main/adapters/llm/LLMAdapterFactory.ts`                           | 変更対象（ファクトリ）     |
| `apps/desktop/src/main/ipc/aiHandlers.ts`                                           | 変更対象（型統一）         |
| `apps/desktop/src/renderer/views/WorkspaceView/hooks/useWorkspaceChatController.ts` | 変更対象（型統一）         |
| Phase 2 設計書                                                                      | 設計の参照                 |
| Phase 4 テスト仕様書                                                                | Green にすべきテストの確認 |

## 成果物

| 成果物         | パス                                                                                | 備考                                                   |
| -------------- | ----------------------------------------------------------------------------------- | ------------------------------------------------------ |
| 型定義変更     | `packages/shared/src/types/llm/schemas/provider.ts`                                 | `"openrouter"` 追加                                    |
| ハンドラ変更   | `apps/desktop/src/main/handlers/llm.ts`                                             | PROVIDER_CONFIGS + inferProviderId + isValidProviderId |
| ストレージ変更 | `apps/desktop/src/main/services/secureStorage.ts`                                   | ALL_PROVIDERS 追加                                     |
| ファクトリ変更 | `apps/desktop/src/main/adapters/llm/LLMAdapterFactory.ts`                           | OPENAI_COMPATIBLE_CONFIGS + SUPPORTED_PROVIDER_IDS     |
| 型統一変更     | `apps/desktop/src/main/ipc/aiHandlers.ts`                                           | LLMProviderId 型統一                                   |
| 型統一変更     | `apps/desktop/src/renderer/views/WorkspaceView/hooks/useWorkspaceChatController.ts` | LLMProviderId 型統一                                   |

## 完了条件

- [x] Task 5-1: `LLMProviderIdSchema` に `"openrouter"` を追加した
- [x] Task 5-2: `PROVIDER_CONFIGS` に OpenRouter エントリ（4 モデル）を追加した
- [x] Task 5-3: `inferProviderId` に `/` 含みパターンを追加した
- [x] Task 5-4: `isValidProviderId` を `LLMProviderIdSchema.safeParse` に統一した
- [x] Task 5-5: `ALL_PROVIDERS` に `"openrouter"` を追加した
- [x] Task 5-6: `OPENAI_COMPATIBLE_CONFIGS` と `SUPPORTED_PROVIDER_IDS` に OpenRouter を追加した
- [x] Task 5-7: ハードコード型リテラルを `LLMProviderId` 型に統一した
- [x] Task 5-8: `pnpm typecheck` が PASS した（AC-06）
- [x] Task 5-9: Phase 4 の全テスト（TS-A 〜 TS-E）が PASS した

## 次のPhase

[Phase 6: テスト拡充](./phase-6-test-expansion.md)
