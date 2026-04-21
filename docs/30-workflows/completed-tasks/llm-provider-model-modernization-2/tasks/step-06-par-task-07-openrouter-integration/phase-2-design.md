# Phase 2: 設計 -- OpenRouter プロバイダー統合

## メタ情報

| 項目      | 値                     |
| --------- | ---------------------- |
| Phase番号 | 2                      |
| 機能名    | openrouter-integration |
| タスクID  | TASK-LLM-MOD-07        |
| 作成日    | 2026-03-23             |
| 依存Phase | Phase 1（要件定義）    |

## 目的

Phase 1 の要件を踏まえ、OpenRouter プロバイダーを全レイヤーに統合するための具体的な変更設計を行う。

## 実行タスク

### Task 2-1: 型定義レイヤーの設計

#### 変更対象: `packages/shared/src/types/llm/schemas/provider.ts`

`LLMProviderIdSchema` の enum に `"openrouter"` を追加する。

**変更前:**

```typescript
export const LLMProviderIdSchema = z.enum([
  "openai",
  "anthropic",
  "google",
  "xai",
]);
```

**変更後:**

```typescript
export const LLMProviderIdSchema = z.enum([
  "openai",
  "anthropic",
  "google",
  "xai",
  "openrouter",
]);
```

**影響範囲**: `LLMProviderId` 型は `z.infer<typeof LLMProviderIdSchema>` で自動推論されるため、型定義は自動的に拡張される。下流の全ファイルで `"openrouter"` が有効な `LLMProviderId` として認識される。

### Task 2-2: ハンドラレイヤーの設計

#### 変更対象: `apps/desktop/src/main/handlers/llm.ts`

**2-2a: PROVIDER_CONFIGS に OpenRouter エントリ追加（L116-L145）**

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

**2-2b: `inferProviderId` に `/` 含みパターン追加**

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

**設計判断**: `/` を含むモデルIDは OpenRouter 固有の `provider/model` 形式であるため、他のプロバイダーのプレフィックスマッチ後に fallback として判定する。判定順序が重要で、既存プロバイダーのパターンが先にマッチすることを保証する。

**2-2c: `isValidProviderId` の統一**

```typescript
// 変更前: ハードコードされたリテラル配列
function isValidProviderId(id: unknown): id is LLMProviderId {
  return ["openai", "anthropic", "google", "xai"].includes(id as string);
}

// 変更後: LLMProviderIdSchema.safeParse に統一（二重管理解消）
function isValidProviderId(id: unknown): id is LLMProviderId {
  return LLMProviderIdSchema.safeParse(id).success;
}
```

### Task 2-3: セキュアストレージレイヤーの設計

#### 変更対象: `apps/desktop/src/main/services/secureStorage.ts`

`ALL_PROVIDERS` 配列に `"openrouter"` を追加する。

```typescript
// 変更前
const ALL_PROVIDERS: LLMProviderId[] = ["openai", "anthropic", "google", "xai"];

// 変更後
const ALL_PROVIDERS: LLMProviderId[] = [
  "openai",
  "anthropic",
  "google",
  "xai",
  "openrouter",
];
```

**影響範囲**: `clearAllApiKeys()` で全プロバイダーのキーを削除する際に OpenRouter のキーも対象になる。

### Task 2-4: アダプターファクトリレイヤーの設計

#### 変更対象: `apps/desktop/src/main/adapters/llm/LLMAdapterFactory.ts`

`OPENAI_COMPATIBLE_CONFIGS` に OpenRouter 設定を追加する。

```typescript
const OPENAI_COMPATIBLE_CONFIGS: Record<
  string,
  OpenAICompatibleProviderConfig
> = {
  openai: {
    providerId: "openai",
    defaultBaseUrl: "https://api.openai.com/v1",
  },
  xai: {
    providerId: "xai",
    defaultBaseUrl: "https://api.x.ai/v1",
  },
  openrouter: {
    providerId: "openrouter",
    defaultBaseUrl: "https://openrouter.ai/api/v1",
    extraHeaders: {
      "HTTP-Referer": "https://aiworkflow.app",
      "X-Title": "AIWorkflowOrchestrator",
    },
  },
};
```

**設計判断**: OpenRouter は OpenAI 互換 API を提供するため、`OpenAICompatibleAdapter` を再利用する。追加ヘッダー（`HTTP-Referer`, `X-Title`）は OpenRouter API の推奨仕様に準拠。`SUPPORTED_PROVIDER_IDS` にも `"openrouter"` を追加する。

### Task 2-5: 型リテラル統一の設計

#### 変更対象: `apps/desktop/src/main/ipc/aiHandlers.ts`, `apps/desktop/src/renderer/views/WorkspaceView/hooks/useWorkspaceChatController.ts`

ハードコードされた型リテラル（`"openai" | "anthropic" | "google" | "xai"`）を `LLMProviderId` 型に置換する。

```typescript
// 変更前
const providerId: "openai" | "anthropic" | "google" | "xai" = ...;

// 変更後
const providerId: LLMProviderId = ...;
```

**設計判断**: 新規プロバイダー追加時にハードコードリテラルの更新漏れを防止する。`LLMProviderId` は `LLMProviderIdSchema` から自動推論されるため、スキーマ変更のみで型が拡張される。

### Task 2-6: データフロー設計

OpenRouter の API キーが設定された場合のデータフロー:

```
SecureStorage.setApiKey("openrouter", "sk-or-...")
  |
  v
handleGetProviders()
  |-- PROVIDER_CONFIGS から "openrouter" エントリを取得
  |-- SecureStorage.getApiKey("openrouter") で API キー存在確認
  |-- isAvailable: true として LLMProvider に含める
  v
IPC: LLM_GET_PROVIDERS -> Renderer
  |
  v
InlineModelSelector で OpenRouter モデルが選択可能に
  |
  v
handleSendChat / handleStreamChat
  |-- inferProviderId("openai/gpt-4o") -> "openrouter"
  |-- LLMAdapterFactory.getAdapter("openrouter")
  |     -> OpenAICompatibleAdapter (baseUrl: openrouter.ai, extraHeaders 付き)
  |-- adapter.sendChat(request) / adapter.streamChat(request)
  v
OpenRouter API (https://openrouter.ai/api/v1/chat/completions)
```

## 参照資料

| 資料                                                      | 用途                         |
| --------------------------------------------------------- | ---------------------------- |
| `packages/shared/src/types/llm/schemas/provider.ts`       | LLMProviderIdSchema 現状確認 |
| `apps/desktop/src/main/handlers/llm.ts`                   | PROVIDER_CONFIGS 変更設計    |
| `apps/desktop/src/main/adapters/llm/LLMAdapterFactory.ts` | ファクトリ設定追加の設計     |
| `apps/desktop/src/main/services/secureStorage.ts`         | ALL_PROVIDERS 変更設計       |
| Phase 1 要件定義書                                        | 要件・受入基準の参照         |

## 成果物

| 成果物         | パス       | 備考                       |
| -------------- | ---------- | -------------------------- |
| Phase 2 設計書 | 本ファイル | 6 レイヤーの変更設計を記載 |

## 統合テスト連携

Phase 4 テスト作成で以下のテストケースを設計する:

1. `LLMProviderIdSchema.safeParse("openrouter")` が成功することの単体テスト
2. `PROVIDER_CONFIGS` に `"openrouter"` エントリが含まれることの確認テスト
3. `inferProviderId` の `/` 含みモデルIDテスト（正常系 + エッジケース）
4. `isValidProviderId("openrouter")` が `true` を返すテスト
5. `LLMAdapterFactory.getAdapter("openrouter")` が `OpenAICompatibleAdapter` を返すテスト
6. 既存プロバイダーへの回帰テスト

## 完了条件

- [ ] `LLMProviderIdSchema` への `"openrouter"` 追加設計が完了した
- [ ] `PROVIDER_CONFIGS` の OpenRouter エントリ（4 モデル）設計が完了した
- [ ] `inferProviderId` の `/` パターン追加設計が完了した（判定順序を明記）
- [ ] `isValidProviderId` の `LLMProviderIdSchema.safeParse` 統一設計が完了した
- [ ] `SecureStorage.ALL_PROVIDERS` への追加設計が完了した
- [ ] `LLMAdapterFactory` の `OPENAI_COMPATIBLE_CONFIGS` への OpenRouter 設定追加設計が完了した
- [ ] ハードコード型リテラルの `LLMProviderId` 統一設計が完了した
- [ ] データフロー（API キー設定 → プロバイダー取得 → チャット送信）が設計書に明記された

## 次のPhase

[Phase 3: 設計レビュー](./phase-3-design-review.md)
