# LLM・Embedding インターフェース仕様

> 本ドキュメントは統合システム設計仕様書の一部です。
> 管理: .claude/skills/aiworkflow-requirements/

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

### バリデーション関数

| 関数名                  | 説明                               |
| ----------------------- | ---------------------------------- |
| validateChatRequest     | リクエストを検証（エラー時throw）  |
| validateChatResponse    | レスポンスを検証（エラー時throw）  |
| safeParseChatRequest    | リクエストを安全にパース           |
| safeParseChatResponse   | レスポンスを安全にパース           |

### IPC通信

| チャンネル           | メソッド | 入力             | 出力                    | 説明                   |
| -------------------- | -------- | ---------------- | ----------------------- | ---------------------- |
| llm:get-providers    | invoke   | なし             | LLMProvider[]           | プロバイダー一覧取得   |
| llm:check-health     | invoke   | LLMProviderId    | HealthCheckResult       | ヘルスチェック実行     |
| llm:send-chat        | invoke   | LLMChatRequest   | LLMChatResponse         | チャット送信           |
| llm:stream-chat      | send/on  | LLMChatRequest   | LLMStreamChunk (連続)   | ストリーミングチャット |

### LLMアダプター実装

> **実装**: `apps/desktop/src/main/adapters/llm/`
> **IPCハンドラー**: `apps/desktop/src/main/handlers/llm.ts`
> **UIコンポーネント**: `apps/desktop/src/renderer/components/llm/`
> **詳細ガイド**: `docs/30-workflows/llm-ui-ipc-adapter-implementation/outputs/phase-12/implementation-guide.md`

#### 対応プロバイダー

| プロバイダー | アダプター | 主要モデル |
| ------------ | ---------- | ---------- |
| OpenAI | OpenAIAdapter | GPT-4o, GPT-4-turbo, GPT-3.5-turbo |
| Anthropic | AnthropicAdapter | Claude 3.5 Sonnet, Claude 3 Opus, Claude 3 Haiku |
| Google | GoogleAdapter | Gemini 1.5 Pro, Gemini 2.0 Flash |
| xAI | xAIAdapter | Grok-2, Grok-2-mini |

#### UIコンポーネント

| コンポーネント | 責務 | パス |
| -------------- | ---- | ---- |
| ProviderSelector | プロバイダー選択UI | `components/llm/ProviderSelector.tsx` |
| ModelSelector | モデル選択UI | `components/llm/ModelSelector.tsx` |
| HealthIndicator | 接続状態インジケーター | `components/llm/HealthIndicator.tsx` |
| LLMSelectorPanel | 統合パネル | `components/llm/LLMSelectorPanel.tsx` |

#### アーキテクチャパターン

- **Adapterパターン**: 各プロバイダーのAPIを統一インターフェースに変換
- **Factoryパターン**: プロバイダーIDからアダプターインスタンスを生成
- **Template Methodパターン**: BaseLLMAdapterで共通処理（リトライ、エラーハンドリング）を実装

### 品質メトリクス

- テストカバレッジ: 99.25% (Statement)、90.56% (Branch)
- 全360件の自動テスト成功

---

## LLM ストリーミングレスポンス仕様

> **実装**: `apps/desktop/src/main/adapters/llm/`
> **UIコンポーネント**: `apps/desktop/src/renderer/components/chat/StreamingMessage.tsx`
> **テスト**: `apps/desktop/src/main/adapters/llm/__tests__/streaming.test.ts`
> **詳細ガイド**: `docs/30-workflows/llm-streaming-response/outputs/phase-12/implementation-guide.md`

### 概要

LLMからの応答をServer-Sent Events (SSE) 形式でリアルタイムに受信・表示する機能。従来の一括レスポンスと比較して、ユーザー体験を大幅に向上させる。

### 型定義

#### StreamChunk

ストリーミングチャンクの型定義。

| フィールド | 型                              | 必須 | 説明                           |
| ---------- | ------------------------------- | ---- | ------------------------------ |
| type       | "content" \| "error" \| "done"  | ✓    | チャンクタイプ                 |
| content    | string                          | -    | テキストコンテンツ（type=content時） |
| error      | LLMError                        | -    | エラー情報（type=error時）     |

#### StreamingState

ストリーミング状態の型定義。

| フィールド    | 型      | 説明                       |
| ------------- | ------- | -------------------------- |
| isStreaming   | boolean | ストリーミング中フラグ     |
| streamId      | string  | ストリームID               |
| accumulatedContent | string | 累積コンテンツ        |
| abortController | AbortController | キャンセル用コントローラー |

### SSEフロー

```
Renderer Process                 Main Process                    Provider API
      │                               │                               │
      │──llm:stream-chat (request)───>│                               │
      │                               │──HTTP POST (stream=true)─────>│
      │                               │<──SSE: data: {"delta":...}────│
      │<──llm:stream-chunk (chunk)────│                               │
      │                               │<──SSE: data: {"delta":...}────│
      │<──llm:stream-chunk (chunk)────│                               │
      │                               │<──SSE: data: [DONE]───────────│
      │<──llm:stream-done─────────────│                               │
      │                               │                               │
```

### プロバイダー別SSE解析

| プロバイダー | 形式                                           | 終了シグナル |
| ------------ | ---------------------------------------------- | ------------ |
| OpenAI       | `data: {"choices":[{"delta":{"content":"..."}}]}` | `data: [DONE]` |
| Anthropic    | `event: content_block_delta\ndata: {"delta":{"text":"..."}}` | `event: message_stop` |
| Google       | `data: {"candidates":[{"content":{"parts":[{"text":"..."}]}}]}` | 接続終了 |
| xAI          | OpenAI互換形式                                 | `data: [DONE]` |

### キャンセル機構

#### AbortController統合

```typescript
// Renderer側
const abortController = new AbortController();
window.api.llm.streamChat(request, { signal: abortController.signal });

// キャンセル実行
abortController.abort();
```

#### キャンセルトリガー

| トリガー           | アクション                     |
| ------------------ | ------------------------------ |
| キャンセルボタン   | `onCancel()` → `abort()`       |
| Escapeキー         | キーイベント → `abort()`       |
| コンポーネント破棄 | useEffect cleanup → `abort()`  |
| 新規メッセージ送信 | 前のストリームを自動キャンセル |

### UIコンポーネント

#### StreamingMessage

ストリーミングメッセージ表示コンポーネント。

| Props        | 型         | 必須 | 説明                     |
| ------------ | ---------- | ---- | ------------------------ |
| content      | string     | ✓    | 表示コンテンツ           |
| isStreaming  | boolean    | ✓    | ストリーミング状態       |
| onCancel     | () => void | -    | キャンセルコールバック   |

#### アクセシビリティ

| 属性               | 値               | 目的                       |
| ------------------ | ---------------- | -------------------------- |
| role               | "status"         | 動的コンテンツの通知       |
| aria-live          | "polite"         | スクリーンリーダー対応     |
| aria-busy          | {isStreaming}    | 処理中状態の明示           |
| cursor aria-label  | "入力中"         | カーソルの意味を伝達       |
| button aria-label  | "応答をキャンセル" | キャンセルボタンの説明   |

### エラーハンドリング

| エラーコード          | ストリーミング時の動作       | リトライ |
| --------------------- | ---------------------------- | -------- |
| NETWORK_ERROR         | 接続切断、累積コンテンツ保持 | 可能     |
| TIMEOUT               | タイムアウト表示             | 可能     |
| RATE_LIMIT            | 待機時間表示、自動リトライ   | 可能     |
| API_KEY_INVALID       | エラー表示、設定画面誘導     | 不可     |
| CONTENT_FILTER        | フィルター通知               | 不可     |
| SERVICE_UNAVAILABLE   | サービス状態確認誘導         | 可能     |

### テストカバレッジ

| カテゴリ              | テスト数 | カバレッジ |
| --------------------- | -------- | ---------- |
| SSE解析               | 23       | Branch ~77% |
| キャンセル処理        | 21       | Branch ~80% |
| UIコンポーネント      | 31       | Branch ~75% |
| 統合テスト            | 54       | - |
| **合計**              | **129**  | **全PASS** |

---

#### ChatMessage

チャットメッセージ型。

| フィールド  | 型                    | 説明                           |
| ----------- | --------------------- | ------------------------------ |
| id          | string                | メッセージID                   |
| role        | "user" \| "assistant" | メッセージ送信者               |
| content     | string                | メッセージ内容                 |
| timestamp   | Date                  | 送信日時                       |
| isStreaming | boolean               | ストリーミング中フラグ（任意） |

#### RagConnectionStatus

RAG接続状態型。connected（接続済み）、disconnected（切断）、error（エラー）の3つの状態を持つ。

### 型安全性の保証

- すべての型はTypeScriptで厳密に定義
- IPC通信時の型チェックはPreload層で実施
- ランタイムバリデーションは不要（型システムで保証）

---

## Embedding Generation 型定義

> **実装**: `packages/shared/src/services/embedding/`, `packages/shared/src/services/chunking/`
> **詳細設計**: `docs/30-workflows/embedding-generation-pipeline/`

### プロバイダーインターフェース

#### IEmbeddingProvider

Embedding生成プロバイダーの共通インターフェース。モデルID、プロバイダー名、次元数、最大トークン数をプロパティとして持ち、単一テキストの埋め込み生成（embed）、バッチ処理（embedBatch）、トークン数カウント（countTokens）、ヘルスチェック（healthCheck）のメソッドを提供する。

**実装例**:

- OpenAIEmbeddingProvider: text-embedding-3-small（1536次元）
- Qwen3EmbeddingProvider: qwen3-embedding（768次元）

#### ChunkingStrategy

テキストをチャンクに分割する戦略インターフェース。chunk()メソッドでテキストとオプションを受け取り、チャンク配列を返す。

**実装例**:

- MarkdownChunkingStrategy: セクション単位でチャンク
- CodeChunkingStrategy: クラス/関数単位でチャンク
- FixedSizeChunkingStrategy: 固定トークン数でチャンク
- SemanticChunkingStrategy: 意味的境界でチャンク

### データ型

#### Chunk

チャンクデータ型。ID、コンテンツ、トークン数、位置情報（start/end）、メタデータ（documentId、sectionTitle、chunkIndex等）を持つ。

#### EmbeddingResult

単一埋め込み生成の結果型。埋め込みベクトル（number配列）、トークン数、モデル名、処理時間（ミリ秒）を含む。

#### BatchEmbeddingResult

バッチ埋め込み生成の結果型。埋め込み結果配列、エラー配列（インデックスとエラーメッセージ）、合計トークン数、合計処理時間を含む。

### 設定型

#### PipelineConfig

パイプライン設定型。チャンキング設定（戦略とオプション）、埋め込み設定（モデルID、フォールバックチェーン、オプション、バッチオプション）、重複排除設定を含む。

#### ChunkingOptions

チャンキングオプション型。チャンクサイズ（デフォルト: 512）、オーバーラップ（デフォルト: 50）、最小チャンクサイズ（デフォルト: 100）、改行保持フラグを含む。

#### BatchEmbedOptions

バッチ埋め込みオプション型。バッチサイズ（デフォルト: 50）、並行実行数（デフォルト: 2）、バッチ間遅延（ミリ秒）、進捗コールバックを含む。

#### DeduplicationConfig

重複排除設定型。有効化フラグ、方法（hash/similarity/both）、類似度閾値（デフォルト: 0.95）を含む。

### 出力型

#### PipelineOutput

パイプライン出力型。ドキュメントID、チャンク配列、埋め込み配列、処理済みチャンク数、生成済み埋め込み数、削除済み重複数、キャッシュヒット数、合計処理時間、ステージ別タイミングを含む。

#### StageTimings

ステージ別処理時間型。前処理、チャンキング、埋め込み、重複排除、ストレージの各ステージの処理時間（ミリ秒）を含む。

### 信頼性設定型

#### RetryOptions

リトライオプション型。最大リトライ回数（デフォルト: 3）、初期遅延（デフォルト: 1000ms）、最大遅延（デフォルト: 30000ms）、バックオフ乗数（デフォルト: 2）、ジッター有効化フラグ（デフォルト: true）を含む。

#### RateLimitConfig

レート制限設定型。1分あたりリクエスト数、1分あたりトークン数を含む。

#### CircuitBreakerConfig

サーキットブレーカー設定型。失敗閾値（デフォルト: 5）、成功閾値（デフォルト: 2）、タイムアウト（デフォルト: 60000ms）を含む。

### メトリクス型

#### EmbeddingMetric

埋め込み生成メトリクス型。モデルID、トークン数、処理時間、成功フラグ、エラーメッセージ（任意）を含む。

#### PipelineMetric

パイプラインメトリクス型。ドキュメントID、処理済みチャンク数、生成済み埋め込み数、削除済み重複数、キャッシュヒット数、合計処理時間、成功フラグ、エラー（任意）、タイムスタンプを含む。

### エラー型

#### EmbeddingError

埋め込み生成基底エラークラス。メッセージとオプションを受け取る。

**派生エラー**:

- ProviderError: プロバイダー固有のエラー
- RateLimitError: レート制限エラー
- TimeoutError: タイムアウトエラー
- TokenLimitError: トークン制限超過エラー
- CircuitBreakerError: サーキットブレーカーエラー

#### PipelineError

パイプライン基底エラークラス。ステージ情報と原因エラーを含む。

**派生エラー**:

- PreprocessingError: 前処理エラー
- ChunkingError: チャンキングエラー
- EmbeddingStageError: 埋め込み生成エラー
- DeduplicationError: 重複排除エラー

### 列挙型

#### DocumentType

ドキュメントタイプ列挙型。markdown、code、text、jsonの4つの値を持つ。

#### ChunkingStrategy（列挙型）

チャンキング戦略列挙型。fixed（固定サイズ）、markdown（Markdown構造）、code（コード構造）、semantic（意味的境界）の4つの値を持つ。

#### EmbeddingModelId

埋め込みモデルID列挙型。EMB-001（OpenAI text-embedding-3-small）、EMB-002（Qwen3 embedding）、またはカスタムモデル名（string）を持つ。

#### ProviderName

プロバイダー名列挙型。openai、qwen3、またはカスタムプロバイダー名（string）を持つ。

#### PipelineStage

パイプラインステージ列挙型。preprocessing（前処理）、chunking（チャンキング）、embedding（埋め込み生成）、deduplication（重複排除）、storage（ストレージ保存）の5つの値を持つ。

#### CircuitState

サーキットブレーカー状態列挙型。CLOSED（正常）、OPEN（遮断）、HALF_OPEN（半開）の3つの状態を持つ。

**品質メトリクス**:

- テストカバレッジ: 91.39% (Statement)、87.13% (Branch)、86.79% (Function)
- 全104件の自動テスト成功
- 全14件の手動テスト成功

---

## Workspace Chat Edit サービスインターフェース

> **実装**: `apps/desktop/src/main/services/chat-edit/`
> **IPCハンドラー**: `apps/desktop/src/main/ipc/chatEditHandlers.ts`
> **テスト**: `apps/desktop/src/main/services/chat-edit/__tests__/`
> **詳細ガイド**: `docs/30-workflows/workspace-chat-edit-main-process/outputs/phase-12/implementation-guide.md`

### 概要

AIによるコード編集支援機能のMain Process側サービス。ファイルI/O、コンテキスト構築、LLM統合を担当する。

### FileService

ファイル読み書きと言語検出を担当するサービス。

#### インターフェース

```typescript
interface IFileService {
  readFile(filePath: string): Promise<FileReadResult>;
  writeFile(
    filePath: string,
    content: string,
    options?: FileWriteOptions
  ): Promise<FileWriteResult>;
  detectLanguage(filePath: string): string;
  createBackup(filePath: string): Promise<string>;
}
```

#### 型定義

| 型名             | 説明                               |
| ---------------- | ---------------------------------- |
| FileReadResult   | ファイル読み取り結果（success/error/content/language/fileSize） |
| FileWriteResult  | ファイル書き込み結果（success/error/backupPath） |
| FileWriteOptions | 書き込みオプション（createBackup） |
| FileReadError    | 読み取りエラー（code/message）     |
| FileWriteError   | 書き込みエラー（code/message）     |

#### エラーコード

| コード            | 説明                       | Retryable |
| ----------------- | -------------------------- | --------- |
| FILE_NOT_FOUND    | ファイルが存在しない       | No        |
| TOO_LARGE         | ファイルサイズ超過（10MB） | No        |
| PERMISSION_DENIED | 読み書き権限なし           | No        |
| INVALID_PATH      | 無効なパス・パストラバーサル検出 | No   |

#### 定数

| 定数名        | 値     | 説明             |
| ------------- | ------ | ---------------- |
| MAX_FILE_SIZE | 10MB   | ファイルサイズ上限 |

### ContextBuilder

LLM向けコンテキスト文字列の構築を担当するサービス。

#### インターフェース

```typescript
interface IContextBuilder {
  build(contexts: FileContextInput[]): string;
  calculateSize(contexts: FileContextInput[]): number;
  validateSize(contexts: FileContextInput[]): boolean;
}
```

#### 型定義

| 型名             | 説明                               |
| ---------------- | ---------------------------------- |
| FileContextInput | ファイルコンテキスト入力（filePath/content/selection/language） |

#### 定数

| 定数名           | 値     | 説明                   |
| ---------------- | ------ | ---------------------- |
| MAX_CONTEXT_SIZE | 100KB  | コンテキストサイズ上限 |
| MAX_FILE_CONTEXTS| 10     | 最大添付ファイル数     |

#### コンテキスト出力形式

```markdown
## ファイル: path/to/file.ts
言語: typescript
行数: 100

### 選択範囲（10-20行目）
```typescript
// 選択されたコード
```

### 全体コンテンツ
```typescript
// ファイル全体
```
```

### ChatEditService

LLM統合のFacadeサービス。プロンプト構築とレスポンス解析を担当。

#### インターフェース

```typescript
interface IChatEditService {
  sendWithContext(
    request: SendWithContextRequest
  ): Promise<SendWithContextResponse>;
  buildPrompt(command: EditCommand, context: string): string;
  parseResponse(
    response: string,
    command: EditCommand,
    originalContent: string,
    filePath: string
  ): GeneratedResult;
}
```

#### 型定義

| 型名                    | 説明                               |
| ----------------------- | ---------------------------------- |
| SendWithContextRequest  | リクエスト（contexts/command/message/options） |
| SendWithContextResponse | レスポンス（success/result/error） |
| EditCommand             | 編集コマンド（type/targetContextId/instruction） |
| GeneratedResult         | 生成結果（id/originalContent/generatedContent/diffHunks/status） |
| DiffHunk                | 差分ハンク（oldStart/oldLines/newStart/newLines/lines） |

#### EditCommand.type

| 値            | 説明                     |
| ------------- | ------------------------ |
| continue      | コードの続きを生成       |
| refactor      | リファクタリング         |
| generate-test | テストコード生成         |
| add-comment   | コメント追加             |
| custom        | カスタム指示（instruction使用） |

#### エラーコード

| コード            | 説明                       | Retryable |
| ----------------- | -------------------------- | --------- |
| CONTEXT_TOO_LARGE | コンテキストサイズ超過     | No        |
| INVALID_COMMAND   | 無効なコマンドタイプ       | No        |
| LLM_ERROR         | LLM APIエラー              | Yes       |
| TIMEOUT           | タイムアウト               | Yes       |
| RATE_LIMIT        | レート制限                 | Yes       |

### IPCチャンネル

| チャネル                    | 方向            | Request                        | Response                    |
| --------------------------- | --------------- | ------------------------------ | --------------------------- |
| `chat-edit:read-file`       | Renderer → Main | `{ filePath: string }`         | `IPCResponse<FileReadResult>` |
| `chat-edit:write-file`      | Renderer → Main | `{ filePath, content }`        | `IPCResponse<FileWriteResult>` |
| `chat-edit:get-selection`   | Renderer → Main | なし                           | `IPCResponse<TextSelection>` |
| `chat-edit:send-with-context` | Renderer → Main | `SendWithContextRequest`     | `IPCResponse<GeneratedResult>` |

### セキュリティ

#### IPC Sender検証

すべてのハンドラで`validateIpcSender`を使用してリクエスト元を検証。

```typescript
const validation = validateIpcSender(
  event.sender,
  event.senderFrame,
  "chat-edit:read-file"
);
if (!validation.valid) {
  throw toIPCValidationError(validation);
}
```

#### パストラバーサル防止

```typescript
import { detectTraversal, validateFilePath } from "./utils/PathValidator";

if (detectTraversal(filePath)) {
  return { success: false, error: { code: "INVALID_PATH", message: "Path traversal detected" } };
}
```

### ディレクトリ構成

```
apps/desktop/src/main/services/chat-edit/
├── __tests__/
│   ├── ChatEditService.test.ts
│   ├── ChatEditService.edge.test.ts
│   ├── ContextBuilder.test.ts
│   ├── ContextBuilder.edge.test.ts
│   ├── FileService.test.ts
│   ├── FileService.edge.test.ts
│   └── integration.test.ts
├── utils/
│   ├── PathValidator.ts
│   ├── ErrorMapper.ts
│   └── index.ts
├── ChatEditService.ts
├── ContextBuilder.ts
├── FileService.ts
├── prompts.ts
├── types.ts
└── index.ts
```

### 品質メトリクス

| 指標              | 値       |
| ----------------- | -------- |
| Line Coverage     | 92.55%   |
| Branch Coverage   | 92.85%   |
| 自動テスト        | 164件    |
| 手動テスト項目    | 23件     |

---

## 完了タスク

### Workspace Chat Edit Main Process（TASK-WCE-MAIN-001）- 2026-01-25完了

| 項目         | 内容                                                           |
| ------------ | -------------------------------------------------------------- |
| タスクID     | TASK-WCE-MAIN-001                                              |
| Issue        | #469                                                           |
| 完了日       | 2026-01-25                                                     |
| ステータス   | **完了**                                                       |
| 実装内容     | FileService, ContextBuilder, ChatEditService, chatEditHandlers |
| テスト数     | 164（自動）+ 23（手動検証項目）                                |
| カバレッジ   | Line 92.55%, Branch 92.85%                                     |
| ドキュメント | `docs/30-workflows/workspace-chat-edit-main-process/`          |

#### 成果物

| 成果物             | パス                                                                                      |
| ------------------ | ----------------------------------------------------------------------------------------- |
| 実装ガイド         | `docs/30-workflows/workspace-chat-edit-main-process/outputs/phase-12/implementation-guide.md` |
| テスト結果レポート | `docs/30-workflows/workspace-chat-edit-main-process/outputs/phase-11/manual-test-result.md`   |
| QAレポート         | `docs/30-workflows/workspace-chat-edit-main-process/outputs/phase-9/qa-report.md`             |

---

**タスク: LLMストリーミングレスポンス（UT-LLM-STREAM-001）** - 2026-01-24完了

| 項目         | 内容                                                                                          |
| ------------ | --------------------------------------------------------------------------------------------- |
| タスクID     | UT-LLM-STREAM-001                                                                             |
| 完了日       | 2026-01-24                                                                                    |
| ステータス   | **完了**                                                                                      |
| テスト数     | 129（自動テスト）+ 19（手動テスト項目）                                                       |
| 発見課題     | 0件（Critical/Major/Minor）、2件（Info）                                                      |
| ドキュメント | `docs/30-workflows/llm-streaming-response/`                                                   |

**テスト結果サマリー**

| カテゴリ           | テスト数 | PASS | FAIL |
| ------------------ | -------- | ---- | ---- |
| 機能テスト         | 4        | 4    | 0    |
| エラーハンドリング | 3        | 3    | 0    |
| キャンセル         | 2        | 2    | 0    |
| UIコンポーネント   | 5        | 5    | 0    |
| アクセシビリティ   | 5        | 5    | 0    |

**成果物**

| 成果物             | パス                                                                                   |
| ------------------ | -------------------------------------------------------------------------------------- |
| テスト結果レポート | `docs/30-workflows/llm-streaming-response/outputs/phase-11/manual-test-result.md`      |
| 発見課題リスト     | `docs/30-workflows/llm-streaming-response/outputs/phase-11/discovered-issues.md`       |
| 実装ガイド         | `docs/30-workflows/llm-streaming-response/outputs/phase-12/implementation-guide.md`    |

### UT-LLM-HISTORY-001（2026-01-24完了）

| 項目         | 内容                                                                                      |
| ------------ | ----------------------------------------------------------------------------------------- |
| タスクID     | UT-LLM-HISTORY-001                                                                        |
| 完了日       | 2026-01-24                                                                                |
| ステータス   | **完了**                                                                                  |
| テスト数     | 114（自動テスト）+ 12（手動テスト項目）                                                   |
| 発見課題     | 4件（全てスコープ外のUI実装タスク）                                                       |
| ドキュメント | `docs/30-workflows/llm-conversation-history-persistence/`                                 |

#### 実装サマリー

| 成果物                    | 行数 | テスト数 |
| ------------------------- | ---- | -------- |
| ConversationRepository    | 457  | 75       |
| conversationHandlers IPC  | 243  | 39       |
| 共有型定義 conversation.ts| 234  | 0        |
| IPCチャンネル channels.ts | +20  | 0        |

#### テスト結果サマリー

| カテゴリ           | テスト数 | PASS | FAIL |
| ------------------ | -------- | ---- | ---- |
| Repository層       | 75       | 75   | 0    |
| IPC Handlers層     | 39       | 39   | 0    |
| カバレッジ         | Line 100% | Branch 100% | Function 100% |

#### 成果物

| 成果物             | パス                                                                                                |
| ------------------ | --------------------------------------------------------------------------------------------------- |
| 要件定義           | `docs/30-workflows/llm-conversation-history-persistence/outputs/phase-1/requirements.md`            |
| テスト結果レポート | `docs/30-workflows/llm-conversation-history-persistence/outputs/phase-11/manual-test-result.md`     |
| 発見課題リスト     | `docs/30-workflows/llm-conversation-history-persistence/outputs/phase-11/discovered-issues.md`      |
| 実装ガイド         | `docs/30-workflows/llm-conversation-history-persistence/outputs/phase-12/implementation-guide.md`   |

#### 関連IPCチャンネル

| チャンネル               | 方向          | 説明                 |
| ------------------------ | ------------- | -------------------- |
| `conversation:create`    | Renderer→Main | 会話作成             |
| `conversation:get`       | Renderer→Main | 会話取得             |
| `conversation:list`      | Renderer→Main | 一覧取得（ページネーション対応） |
| `conversation:update`    | Renderer→Main | 会話更新             |
| `conversation:delete`    | Renderer→Main | 会話削除             |
| `conversation:addMessage`| Renderer→Main | メッセージ追加       |
| `conversation:search`    | Renderer→Main | キーワード検索       |

---

## 関連ドキュメント

- [アーキテクチャ設計](./05-architecture.md)
- [エラーハンドリング仕様](./07-error-handling.md)
- [プラグイン開発手順](./11-plugin-development.md)
- [ローカルエージェント仕様](./09-local-agent.md)
- [セキュリティガイドライン](./17-security-guidelines.md)
- [LLMストリーミングレスポンス実装ガイド](../../../docs/30-workflows/llm-streaming-response/outputs/phase-12/implementation-guide.md)
- [システムプロンプトLLM API統合 実装ガイド](../../../docs/30-workflows/completed-tasks/system-prompt-llm-api/outputs/phase-12/implementation-guide.md)
- [会話履歴永続化 実装ガイド](../../../docs/30-workflows/llm-conversation-history-persistence/outputs/phase-12/implementation-guide.md)

---

## 変更履歴

| Version | Date       | Changes                                                                                |
| ------- | ---------- | -------------------------------------------------------------------------------------- |
| 1.2.0   | 2026-01-25 | Workspace Chat Edit サービスインターフェース追加（FileService, ContextBuilder, ChatEditService） |
| 1.1.0   | 2026-01-24 | LLMストリーミングレスポンス仕様セクション追加（SSEフロー、型定義、キャンセル機構、アクセシビリティ） |
| 1.0.0   | 2026-01-24 | LLMストリーミングレスポンス完了（手動テスト19項目全PASS、自動テスト129件全PASS、発見課題0件） |
