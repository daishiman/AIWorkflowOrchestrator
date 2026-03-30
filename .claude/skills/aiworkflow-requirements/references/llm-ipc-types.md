# LLM IPC型定義・Multi-LLM Provider

> 本ドキュメントは統合システム設計仕様書の一部です。
> 管理: `.claude/skills/aiworkflow-requirements/`
> 親ドキュメント: [interfaces-llm.md](./interfaces-llm.md)

---

## 概要

LLM 関連の current contract は、shared schema と Main/Renderer の境界で次のように分担する。

| レイヤー           | 正本                                                         | 役割                                                                             |
| ------------------ | ------------------------------------------------------------ | -------------------------------------------------------------------------------- |
| provider catalog   | `packages/shared/src/types/llm/schemas/provider-registry.ts` | provider / model 一覧、`PROVIDER_IDS`、`inferProviderId()` の正本                |
| runtime validation | `packages/shared/src/types/llm/schemas/provider.ts`          | `LLMProviderIdSchema` / `LLMProviderSchema` / `LLMModelSchema`                   |
| Main IPC           | `apps/desktop/src/main/handlers/llm.ts`                      | `llm:get-providers` / `llm:set-selected-config` / `llm:check-health` / chat 実行 |
| preload API        | `apps/desktop/src/preload/types.ts`                          | Renderer から見える `window.electronAPI.llm.*` 契約                              |
| selection state    | `apps/desktop/src/renderer/store/slices/llmSlice.ts`         | 選択状態、persist、health 表示                                                   |

`PROVIDER_CONFIGS` が provider catalog の唯一の正本であり、`LLMProviderIdSchema` と `inferProviderId()` はそこから自動追従する。

---

## LLM チャット関連型定義（Desktop IPC）

### AIChatRequest

Renderer から Main に渡す簡易チャット request（`apps/desktop/src/preload/types.ts`）。

| フィールド       | 型              | 必須 | 説明               |
| ---------------- | --------------- | ---- | ------------------ |
| `message`        | `string`        | ✓    | ユーザーメッセージ |
| `systemPrompt`   | `string`        | -    | システムプロンプト |
| `ragEnabled`     | `boolean`       | -    | RAG 有効化フラグ   |
| `conversationId` | `string`        | -    | 会話継続用 ID      |
| `providerId`     | `LLMProviderId` | -    | 明示 provider 指定 |
| `modelId`        | `string`        | -    | 明示 model 指定    |

補足:

- `providerId` と `modelId` はセット指定を前提とする
- request 側未指定時は `llm:set-selected-config` で同期済みの Main state を使う
- どちらにも値がない場合は暗黙 fallback せずエラーとする

### AIChatResponse

| フィールド            | 型         | 説明                                  |
| --------------------- | ---------- | ------------------------------------- |
| `success`             | `boolean`  | 成功/失敗                             |
| `data.message`        | `string`   | 応答本文                              |
| `data.conversationId` | `string`   | 会話 ID                               |
| `data.ragSources`     | `string[]` | RAG 参照元                            |
| `error`               | `string`   | error code または user-facing message |

### AICheckConnectionResponse

legacy 接続確認 surface。新規 UI は `llm:check-health` を primary とする。

| フィールド              | 型                                         | 説明             |
| ----------------------- | ------------------------------------------ | ---------------- |
| `success`               | `boolean`                                  | 成功/失敗        |
| `data.status`           | `"connected" \| "disconnected" \| "error"` | 接続状態         |
| `data.indexedDocuments` | `number`                                   | index 済み文書数 |
| `data.lastSyncTime`     | `Date?`                                    | 最終同期時刻     |

### AIIndexResponse / CommunityResult

- `AI_INDEX` は current runtime では guidance-only stub
- `CommunityResult<T>` は `ok/value/error` を持つ共通 IPC surface

---

## Provider Registry SSoT

### current canonical facts

```text
provider-registry.ts
  PROVIDER_CONFIGS
    -> PROVIDER_IDS
    -> inferProviderId()
provider.ts
  LLMProviderIdSchema = z.enum(PROVIDER_IDS)
llm.ts
  handleGetProviders() が PROVIDER_CONFIGS を参照
```

### shared provider catalog 型

| 型                    | フィールド                                                 |
| --------------------- | ---------------------------------------------------------- |
| `ProviderConfigEntry` | `id`, `name`, `modelPrefixes`, `specialMatcher?`, `models` |
| `ProviderModelEntry`  | `id`, `name`, `contextWindow`, `isDefault`, `description?` |
| `ProviderIdUnion`     | `(typeof PROVIDER_CONFIGS)[number]["id"]`                  |

### 導出ルール

| 項目                       | current behavior                                   |
| -------------------------- | -------------------------------------------------- |
| `PROVIDER_IDS`             | `PROVIDER_CONFIGS.map((p) => p.id)` 由来の tuple   |
| `LLMProviderIdSchema`      | `z.enum(PROVIDER_IDS)`                             |
| `inferProviderId(modelId)` | `specialMatcher` を先、`modelPrefixes` を後に評価  |
| OpenRouter 判定            | `modelId.includes("/")` を `specialMatcher` で処理 |

### current provider set

| providerId   | 表示名     | 代表モデル                                         | 補足                                 |
| ------------ | ---------- | -------------------------------------------------- | ------------------------------------ |
| `openai`     | OpenAI     | `gpt-5.4`, `o3`                                    | `gpt-`, `o3`, `o4` prefix で推定     |
| `anthropic`  | Anthropic  | `claude-sonnet-4-6`, `claude-haiku-4-5`            | `claude-` prefix                     |
| `google`     | Google     | `gemini-3-flash-preview`, `gemini-3.1-pro-preview` | `gemini-` prefix                     |
| `xai`        | xAI        | `grok-4-1-fast-non-reasoning`, `grok-3-mini`       | `grok-` prefix                       |
| `openrouter` | OpenRouter | `openai/gpt-4o`, `anthropic/claude-3.5-sonnet`     | slash formを `specialMatcher` で判定 |

---

## Renderer / Main surface 型

### LLMProviderSchema

current public surface は次の 5 フィールドのみ。

| フィールド    | 型              | 必須 | 説明                         |
| ------------- | --------------- | ---- | ---------------------------- |
| `id`          | `LLMProviderId` | ✓    | provider ID                  |
| `name`        | `string`        | ✓    | 表示名                       |
| `icon`        | `string`        | -    | URL 文字列。未設定可         |
| `isAvailable` | `boolean`       | ✓    | API key 有無ベースの利用可否 |
| `models`      | `LLMModel[]`    | ✓    | 利用可能モデル一覧           |

### LLMModelSchema

| フィールド      | 型        | 必須 | 説明             |
| --------------- | --------- | ---- | ---------------- |
| `id`            | `string`  | ✓    | model ID         |
| `name`          | `string`  | ✓    | 表示名           |
| `description`   | `string`  | -    | 補足説明         |
| `contextWindow` | `number`  | -    | token 上限の目安 |
| `isDefault`     | `boolean` | ✓    | default model か |

明示的に current surface から外れているもの:

- `iconUrl`
- `apiKeyConfigured`
- `maxTokens`

---

## バリデーション関数

| 関数名                  | 説明                            |
| ----------------------- | ------------------------------- |
| `validateChatRequest`   | `LLMChatRequestSchema.parse()`  |
| `validateChatResponse`  | `LLMChatResponseSchema.parse()` |
| `validateIPCRequest`    | `IPCChatRequestSchema.parse()`  |
| `validateError`         | `LLMErrorSchema.parse()`        |
| `safeParseChatResponse` | response を安全に parse         |

関連 schema:

- `LLMChatRequestSchema`
- `LLMChatResponseSchema`
- `LLMErrorSchema`
- `HealthCheckResultSchema`

---

## IPC通信

### preload surface

`apps/desktop/src/preload/types.ts`

| チャンネル / API          | 入力                      | 出力                                            | 説明                            |
| ------------------------- | ------------------------- | ----------------------------------------------- | ------------------------------- |
| `llm.getProviders()`      | なし                      | `Promise<LLMProvider[]>`                        | provider 一覧取得               |
| `llm.setSelectedConfig()` | `{ providerId, modelId }` | `Promise<{ success: boolean; error?: string }>` | Renderer 選択状態を Main へ同期 |
| `llm.checkHealth()`       | `providerId`              | `Promise<HealthCheckResult>`                    | 接続確認                        |
| `llm.sendChat()`          | `LLMChatRequest`          | `Promise<LLMChatResponse>`                      | 非 stream chat                  |
| `llm.streamChat()`        | `LLMChatRequest`          | `Promise<{ requestId: string }>`                | stream 開始                     |
| `llm.cancelStream()`      | `requestId`               | `Promise<{ success: boolean }>`                 | stream 中断                     |

### Main handler facts

| handler                       | current behavior                                                                                |
| ----------------------------- | ----------------------------------------------------------------------------------------------- |
| `handleGetProviders()`        | `PROVIDER_CONFIGS` を走査し、`SecureStorage.getApiKey(config.id)` から `isAvailable` を決定する |
| `handleGetProviders()` models | `readonly` catalog を `[...config.models]` で mutable `LLMProvider[]` surface に橋渡しする      |
| `handleSetSelectedConfig()`   | providerId 妥当性と `modelId.trim()` を検証する                                                 |
| `handleCheckHealth()`         | 失敗時は `status: "disconnected"` を返す                                                        |
| `handleSendChat()`            | `request.providerId ?? inferProviderId(request.modelId)` で provider を決定する                 |

### provider / model 解決順

| 優先順位 | 条件                                        | 使用値                    |
| -------- | ------------------------------------------- | ------------------------- |
| 1        | request に `providerId` と `modelId` がある | request 指定値            |
| 2        | request 側未指定                            | Main 側の同期済み選択状態 |
| 3        | どちらも未設定                              | エラー                    |

---

## UIアンカー

| コンポーネント        | 役割             |
| --------------------- | ---------------- |
| `ProviderSelector`    | provider 選択    |
| `ModelSelector`       | model 選択       |
| `HealthIndicator`     | health 表示      |
| `LLMSelectorPanel`    | フルパネル UI    |
| `InlineModelSelector` | compact selector |

---

## 関連ドキュメント

- [interfaces-llm.md](./interfaces-llm.md)
- [ui-ux-llm-selector.md](./ui-ux-llm-selector.md)
- [llm-streaming.md](./llm-streaming.md)

---

## 変更履歴

| Version | Date       | Changes                                                                                                                                                                                                                                            |
| ------- | ---------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1.5.0   | 2026-03-30 | TASK-LLM-MOD-05 を反映: `description?` フィールドを全 19 モデルに追加（`ProviderModelEntry` / `LLMModelSchema`）。ワークフロー配置を `step-04-seq-task-05-schema-extension/` へ再編。未タスク `TASK-LLM-MOD-05-RENDERER-DESC-DISPLAY` を formalize |
| 1.4.0   | 2026-03-25 | UT-LLM-MOD-01-005 を反映: `provider-registry.ts` を SSoT として明記し、5 provider / `LLMProviderSchema` current fields / `handleGetProviders()` の実装事実へ同期                                                                                   |
| 1.3.0   | 2026-03-24 | TASK-LLM-MOD-03 を反映: GoogleAdapter system_instruction / `v1beta` 反映                                                                                                                                                                           |
| 1.2.0   | 2026-03-17 | `llm:check-health` catch の `disconnected` 返却を反映                                                                                                                                                                                              |
| 1.1.0   | 2026-03-11 | `providerId/modelId` 指定と `llm:set-selected-config` を反映                                                                                                                                                                                       |
| 1.0.0   | 2026-01-26 | 初版作成                                                                                                                                                                                                                                           |
