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
- `providerId` / `modelId` は空文字・トリム後空文字を禁止
- 省略時は Main 側に同期済みの選択状態（`llm:set-selected-config`）を使用する
- request と Main 側選択状態がどちらも未設定の場合はエラーを返す（暗黙 fallback なし）

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
| data.lastSyncTime     | Date?                                    | 最終同期時刻（省略可） |

**運用方針（2026-03-17）**:

- `AICheckConnectionResponse` は legacy 互換のため保持する。
- 新規UI/新規実装の health check は `llm:check-health` を使用する。

#### AIIndexRequest

RAGドキュメントインデックス作成リクエスト型。

| フィールド | 型      | 必須 | 説明                         |
| ---------- | ------- | ---- | ---------------------------- |
| folderPath | string  | ✓    | インデックス対象フォルダパス |
| recursive  | boolean | -    | 再帰的検索フラグ             |

#### AIIndexResponse

インデックス作成結果の応答型。

| フィールド        | 型                        | 説明                           |
| ----------------- | ------------------------- | ------------------------------ |
| success           | boolean                   | 成功/失敗フラグ                |
| data.indexedCount | number                    | インデックス化されたファイル数 |
| data.skippedCount | number                    | スキップされたファイル数       |
| data.errors       | string[]                  | guidance / エラーメッセージ一覧 |

**運用方針（2026-03-19）**:

- `AI_INDEX` は current runtime では guidance-only stub。
- `indexedCount` / `skippedCount` は 0 固定、`errors` に利用不可理由を入れて返す。

#### CommunityResult<T>

Community IPC の preload 型。current runtime では guidance-only response の統一面としても使う。

| フィールド     | 型                               | 説明 |
| -------------- | -------------------------------- | ---- |
| ok             | boolean                          | 成功/失敗フラグ |
| value          | T                                | 成功時データ |
| error.code     | string                           | エラーコード |
| error.message  | string                           | 人間可読メッセージ |

**運用方針（2026-03-19）**:

- `communityHandlers.ts` は全 `COMMUNITY_*` で `ok: false` + `error.code = "NOT_IN_SCOPE"` を返す。
- `value` は成功時のみ存在し、guidance-only response では省略される。

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
| status      | connected/disconnected/error | ✓ | 接続状態     |
| latency     | number           | -    | レイテンシ（ms）   |
| checkedAt   | Date             | ✓    | チェック日時       |
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
| llm:check-health     | invoke   | `LLMProviderId`（preload） / `{ providerId }`（Main handler） | HealthCheckResult | ヘルスチェック実行 |
| llm:send-chat        | invoke   | LLMChatRequest   | LLMChatResponse         | チャット送信           |
| llm:stream-chat      | send/on  | LLMChatRequest   | LLMStreamChunk (連続)   | ストリーミングチャット |

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

## 完了タスク（TASK-IMP-MAIN-CHAT-SETTINGS-AI-RUNTIME-001）

> 完了日: 2026-03-17

| 変更項目 | ファイル | 内容 |
| -------- | -------- | ---- |
| GAP-02: `llm:check-health` catch ブロック修正 | `apps/desktop/src/main/handlers/llm.ts` | catch ブロックの `status: "error"` → `status: "disconnected"` に変更。`HealthCheckResultSchema` の enum（`connected \| disconnected \| error`）のうち、catch が返すべき値は `"disconnected"` が正しい（接続試行失敗を示す） |
| `handleSetSelectedConfig` バリデーション確認 | `apps/desktop/src/main/handlers/llm.ts` | `modelId` の trim バリデーションが既に実装済みであることを確認・記録 |
| `HealthCheckResultSchema` status 確認 | `packages/shared/src/types/llm/schemas/` | `status: "connected" \| "disconnected" \| "error"` の定義済みを確認。catch ブロックの `"disconnected"` 変更により enum との整合性が確保された |

**注意事項**:

- `status: "error"` は `HealthCheckResultSchema` の有効な値だが、**catch ブロック（ネットワーク到達不能時）** は `"disconnected"` を返すべき。`"error"` はアダプター内部の論理エラー（例: 認証失敗）に使用する
- 既存テスト `llm.test.ts` L231 が `status: "error"` を期待していたため、`"disconnected"` に修正が必要だった（GAP-02 の波及影響）

## 変更履歴

| Version | Date | Changes |
| --- | --- | --- |
| 1.2.0 | 2026-03-17 | TASK-IMP-MAIN-CHAT-SETTINGS-AI-RUNTIME-001 を反映: `llm:check-health` catch ブロックの `status: "error"` → `"disconnected"` 変更を記録 |
| 1.1.0 | 2026-03-11 | TASK-FIX-APIKEY-CHAT-TOOL-INTEGRATION-001 を反映: `AIChatRequest` に `providerId/modelId` を追加し、`llm:set-selected-config` と `AI_CHAT` の provider/model 解決順を明文化 |
| 1.0.0 | 2026-01-26 | 初版作成 |
