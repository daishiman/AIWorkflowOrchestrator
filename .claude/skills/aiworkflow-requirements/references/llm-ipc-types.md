# LLM IPC型定義・Multi-LLM Provider

> 本ドキュメントは統合システム設計仕様書の一部です。
> 管理: .claude/skills/aiworkflow-requirements/
>
> **親ドキュメント**: [interfaces-llm.md](./interfaces-llm.md)

---

## LLM チャット関連型定義（Desktop IPC）

### 概要

Electronデスクトップアプリでは、Renderer ProcessからMain ProcessへのIPC通信でLLMチャット機能を提供する。型定義は共通インターフェースとして実装される。

**実装ファイル**:

- `apps/desktop/src/preload/types.ts` - IPC型定義
- `apps/desktop/src/renderer/store/types.ts` - Store型定義

### IPC 型定義

#### AIChatRequest

LLMへのメッセージ送信リクエスト型。

| フィールド     | 型      | 必須 | 説明                                   |
| -------------- | ------- | ---- | -------------------------------------- |
| message        | string  | ✓    | ユーザーメッセージ                     |
| systemPrompt   | string  | -    | システムプロンプト（AIの振る舞い指定） |
| ragEnabled     | boolean | ✓    | RAG機能有効化フラグ                    |
| conversationId | string  | -    | 会話ID（既存会話の続きの場合に指定）   |
| providerId     | LLMProviderId | - | 送信時に明示的に使用するプロバイダーID |
| modelId        | string  | -    | 送信時に明示的に使用するモデルID       |

**補足**:

- `providerId` と `modelId` はセット指定のみ有効（片方のみはエラー）
- 省略時は Main 側に同期済みの選択状態（`llm:set-selected-config`）を使用する

#### AIChatResponse

LLMからの応答型。

| フィールド          | 型       | 説明                                |
| ------------------- | -------- | ----------------------------------- |
| success             | boolean  | 成功/失敗フラグ                     |
| data.message        | string   | AI応答メッセージ                    |
| data.conversationId | string   | 会話ID                              |
| data.ragSources     | string[] | RAG参照元ファイルパス（任意）       |
| error               | string   | エラーメッセージ（success=false時） |

#### AICheckConnectionResponse

AI/RAG接続状態確認の応答型。

| フィールド            | 型                                       | 説明                   |
| --------------------- | ---------------------------------------- | ---------------------- |
| success               | boolean                                  | 成功/失敗フラグ        |
| data.status           | "connected" \| "disconnected" \| "error" | 接続状態               |
| data.indexedDocuments | number                                   | インデックス済み文書数 |
| data.lastSyncTime     | Date                                     | 最終同期時刻           |

#### AIIndexRequest

RAGドキュメントインデックス作成リクエスト型。

| フィールド | 型      | 必須 | 説明                         |
| ---------- | ------- | ---- | ---------------------------- |
| folderPath | string  | ✓    | インデックス対象フォルダパス |
| recursive  | boolean | ✓    | 再帰的検索フラグ             |

#### AIIndexResponse

インデックス作成結果の応答型。

| フィールド        | 型                        | 説明                           |
| ----------------- | ------------------------- | ------------------------------ |
| success           | boolean                   | 成功/失敗フラグ                |
| data.indexedCount | number                    | インデックス化されたファイル数 |
| data.skippedCount | number                    | スキップされたファイル数       |
| data.errors       | Array<{filePath, reason}> | エラー発生ファイル             |

### Store 型定義

#### LLMProvider

LLMプロバイダー情報型。

| フィールド | 型            | 説明                     |
| ---------- | ------------- | ------------------------ |
| id         | LLMProviderId | プロバイダーID（Enum型） |
| name       | string        | プロバイダー名（表示用） |
| models     | LLMModel[]    | 利用可能なモデル一覧     |

#### LLMModel

LLMモデル情報型。

| フィールド | 型     | 説明               |
| ---------- | ------ | ------------------ |
| id         | string | モデルID           |
| name       | string | モデル名（表示用） |

#### LLMProviderId

プロバイダーID列挙型。OpenAI、Anthropic、Google、xAIの4つの値を持つ。

### Task02 設計で前提にする Renderer チャット状態（current HEAD）

Task02 を再設計する時点の current HEAD では、Renderer 側チャット状態は以下の契約に分かれている。

| 契約 | 実装場所 | 内容 |
| --- | --- | --- |
| `ChatMessage` | `apps/desktop/src/renderer/store/types.ts` | `id` / `role` / `content` / `timestamp` / `isStreaming` を持つ general chat message |
| `StreamingError` | `apps/desktop/src/renderer/store/slices/chatSlice.ts` | `code` / `message` / `retryable` を持つ stream UI error |
| `streamChat()` | `apps/desktop/src/preload/index.ts` | `Promise<{ requestId: string }>` を返し、Renderer は requestId を state/ref に保持する |
| `cancelStream(requestId)` | `apps/desktop/src/preload/index.ts` | `{ success: boolean }` を返し、Main 側 AbortController を停止する |
| 設計ギャップ | current HEAD | `ChatMode` / `modeSessionIds` / session overlay は未実装であり、Task02 で導入するなら renderer types と state ownership を先に正本化する |

---

## Multi-LLM Provider Switching 型定義

> **実装**: `packages/shared/src/types/llm/schemas/`
> **状態管理**: `apps/desktop/src/renderer/store/slices/llmSlice.ts`
> **詳細設計**: `docs/30-workflows/chat-multi-llm-switching/outputs/phase-12/implementation-guide.md`

### 概要

チャット内でLLMプロバイダー・モデルを動的に切り替える機能の型定義。Zodスキーマによる型安全性とランタイムバリデーションを提供。

### Zodスキーマ型定義

#### LLMProviderSchema

LLMプロバイダーの完全な型定義。

| フィールド       | 型             | 必須 | 説明                     |
| ---------------- | -------------- | ---- | ------------------------ |
| id               | LLMProviderId  | ✓    | プロバイダーID           |
| name             | string         | ✓    | プロバイダー名（表示用） |
| description      | string         | -    | 説明文                   |
| iconUrl          | string         | -    | アイコンURL              |
| models           | LLMModel[]     | ✓    | 利用可能なモデル一覧     |
| isAvailable      | boolean        | ✓    | 利用可能フラグ           |
| apiKeyConfigured | boolean        | ✓    | APIキー設定済みフラグ    |

#### LLMModelSchema

LLMモデル情報の型定義。

| フィールド  | 型      | 必須 | 説明                 |
| ----------- | ------- | ---- | -------------------- |
| id          | string  | ✓    | モデルID             |
| name        | string  | ✓    | モデル名（表示用）   |
| description | string  | -    | 説明文               |
| maxTokens   | number  | ✓    | 最大トークン数       |
| isDefault   | boolean | ✓    | デフォルトモデルか   |

#### LLMChatRequestSchema

チャットリクエストの型定義。

| フィールド   | 型           | 必須 | 説明                        |
| ------------ | ------------ | ---- | --------------------------- |
| messages     | LLMMessage[] | ✓    | メッセージ配列              |
| modelId      | string       | ✓    | 使用するモデルID            |
| systemPrompt | string       | -    | システムプロンプト          |
| temperature  | number       | -    | 温度パラメータ（0-2）       |
| maxTokens    | number       | -    | 最大出力トークン数          |
| stream       | boolean      | -    | ストリーミング有効フラグ    |

#### LLMChatResponseSchema

チャットレスポンスの型定義（Discriminated Union）。

**成功時**:
| フィールド | 型              | 説明           |
| ---------- | --------------- | -------------- |
| success    | true (literal)  | 成功フラグ     |
| data       | LLMResponseData | レスポンスデータ |

**失敗時**:
| フィールド | 型              | 説明       |
| ---------- | --------------- | ---------- |
| success    | false (literal) | 失敗フラグ |
| error      | LLMError        | エラー情報 |

#### LLMErrorSchema

エラー情報の型定義。

| フィールド   | 型           | 必須 | 説明                   |
| ------------ | ------------ | ---- | ---------------------- |
| code         | LLMErrorCode | ✓    | エラーコード           |
| message      | string       | ✓    | エラーメッセージ       |
| details      | Record       | -    | 追加詳細情報           |
| retryable    | boolean      | ✓    | リトライ可能か         |
| retryAfterMs | number       | -    | リトライ待機時間（ms） |

#### LLMErrorCode

エラーコード列挙型。API_KEY_MISSING、API_KEY_INVALID、NETWORK_ERROR、TIMEOUT、RATE_LIMIT、CONTEXT_LENGTH_EXCEEDED、CONTENT_FILTER、MODEL_NOT_FOUND、SERVICE_UNAVAILABLE、UNKNOWNの10種類。

#### HealthCheckResultSchema

ヘルスチェック結果の型定義。

| フィールド  | 型               | 必須 | 説明               |
| ----------- | ---------------- | ---- | ------------------ |
| providerId  | LLMProviderId    | ✓    | プロバイダーID     |
| status      | healthy/degraded/unhealthy | ✓ | 接続状態     |
| latencyMs   | number           | -    | レイテンシ（ms）   |
| checkedAt   | string (ISO8601) | ✓    | チェック日時       |
| errorMessage| string           | -    | エラーメッセージ   |

---

## バリデーション関数

| 関数名                  | 説明                               |
| ----------------------- | ---------------------------------- |
| validateChatRequest     | リクエストを検証（エラー時throw）  |
| validateChatResponse    | レスポンスを検証（エラー時throw）  |
| safeParseChatRequest    | リクエストを安全にパース           |
| safeParseChatResponse   | レスポンスを安全にパース           |

---

## IPC通信

| チャンネル           | メソッド | 入力             | 出力                    | 説明                   |
| -------------------- | -------- | ---------------- | ----------------------- | ---------------------- |
| llm:get-providers    | invoke   | なし             | LLMProvider[]           | プロバイダー一覧取得   |
| llm:set-selected-config | invoke | `{ providerId, modelId }` | `{ success: boolean, error?: string }` | Renderer選択状態をMainへ同期 |
| llm:check-health     | invoke   | LLMProviderId    | HealthCheckResult       | ヘルスチェック実行     |
| llm:send-chat        | invoke   | LLMChatRequest   | LLMChatResponse         | チャット送信           |
| llm:stream-chat      | send/on  | LLMChatRequest   | LLMStreamChunk (連続)   | ストリーミングチャット |
| llm:stream-cancel    | invoke   | `{ requestId: string }` | `{ success: boolean }` | 進行中ストリームの abort |

### AI_CHAT の provider/model 解決順

| 優先順位 | 条件 | 使用値 |
| --- | --- | --- |
| 1 | `AIChatRequest.providerId` と `modelId` が両方ある | request 指定値を使用 |
| 2 | request 側指定なし | Main 側選択状態（`setSelectedLLMConfig`）を使用 |
| 3 | どちらも未設定 | エラー（LLM未選択）を返却 |

### LLMSetSelectedConfigRequest

| フィールド | 型 | 必須 | 説明 |
| --- | --- | --- | --- |
| providerId | LLMProviderId | ✓ | 選択中プロバイダー |
| modelId | string | ✓ | 選択中モデル |

### LLMSetSelectedConfigResponse

| フィールド | 型 | 説明 |
| --- | --- | --- |
| success | boolean | 同期成功フラグ |
| error | string | 同期失敗時メッセージ |

---

## LLMアダプター実装

> **実装**: `apps/desktop/src/main/adapters/llm/`
> **IPCハンドラー**: `apps/desktop/src/main/handlers/llm.ts`
> **UIコンポーネント**: `apps/desktop/src/renderer/components/llm/`
> **詳細ガイド**: `docs/30-workflows/llm-ui-ipc-adapter-implementation/outputs/phase-12/implementation-guide.md`

### 対応プロバイダー

| プロバイダー | アダプター | 主要モデル |
| ------------ | ---------- | ---------- |
| OpenAI | OpenAIAdapter | GPT-4o, GPT-4-turbo, GPT-3.5-turbo |
| Anthropic | AnthropicAdapter | Claude 3.5 Sonnet, Claude 3 Opus, Claude 3 Haiku |
| Google | GoogleAdapter | Gemini 1.5 Pro, Gemini 2.0 Flash |
| xAI | xAIAdapter | Grok-2, Grok-2-mini |

### UIコンポーネント

| コンポーネント | 責務 | パス |
| -------------- | ---- | ---- |
| ProviderSelector | プロバイダー選択UI | `components/llm/ProviderSelector.tsx` |
| ModelSelector | モデル選択UI | `components/llm/ModelSelector.tsx` |
| HealthIndicator | 接続状態インジケーター | `components/llm/HealthIndicator.tsx` |
| LLMSelectorPanel | 統合パネル | `components/llm/LLMSelectorPanel.tsx` |

### アーキテクチャパターン

- **Adapterパターン**: 各プロバイダーのAPIを統一インターフェースに変換
- **Factoryパターン**: プロバイダーIDからアダプターインスタンスを生成
- **Template Methodパターン**: BaseLLMAdapterで共通処理（リトライ、エラーハンドリング）を実装

### 品質メトリクス

- テストカバレッジ: 99.25% (Statement)、90.56% (Branch)
- 全360件の自動テスト成功

---

## 関連ドキュメント

- [LLMインターフェース概要](./interfaces-llm.md)
- [LLMストリーミング仕様](./llm-streaming.md)
- [Embedding Generation仕様](./llm-embedding.md)

---

## 変更履歴

| Version | Date | Changes |
| --- | --- | --- |
| 1.2.0 | 2026-03-12 | TASK-SKILL-LIFECYCLE-02 の抽出導線を復帰。current HEAD の Renderer chat state、`llm:stream-cancel`、requestId 契約を追記 |
| 1.1.0 | 2026-03-11 | TASK-FIX-APIKEY-CHAT-TOOL-INTEGRATION-001 を反映: `AIChatRequest` に `providerId/modelId` を追加し、`llm:set-selected-config` と `AI_CHAT` の provider/model 解決順を明文化 |
| 1.0.0 | 2026-01-26 | 初版作成 |
