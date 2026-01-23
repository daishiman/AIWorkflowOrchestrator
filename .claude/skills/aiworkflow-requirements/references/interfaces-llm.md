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

## システムプロンプト LLM API統合

> **実装**: `apps/desktop/src/main/utils/buildMessages.ts`, `apps/desktop/src/main/ipc/llmConfigProvider.ts`
> **IPCハンドラー**: `apps/desktop/src/main/ipc/aiHandlers.ts`
> **詳細設計**: `docs/30-workflows/completed-tasks/system-prompt-llm-api/outputs/phase-12/implementation-guide.md`

### 概要

チャットUIからシステムプロンプト付きでLLM APIを呼び出す機能。既存のLLMAdapterFactoryを活用し、4つのプロバイダー（OpenAI、Anthropic、Google、xAI）でシステムプロンプトを適用したAPI呼び出しを実現。

### 型定義

#### SelectedLLMConfig

選択されたLLM設定の型定義。

| フィールド | 型            | 必須 | 説明             |
| ---------- | ------------- | ---- | ---------------- |
| providerId | LLMProviderId | ✓    | プロバイダーID   |
| modelId    | string        | ✓    | モデルID         |

### 関数シグネチャ

#### buildMessages

ユーザーメッセージとシステムプロンプトからLLMメッセージ配列を構築する。

```typescript
function buildMessages(
  userMessage: string,
  systemPrompt?: string
): LLMMessage[];
```

**動作仕様**:
- `systemPrompt`が存在し空白以外の文字を含む場合、`role: "system"`として最初に配置
- `userMessage`は常に`role: "user"`として追加
- 返却される配列は`[systemMessage?, userMessage]`の順序

#### getSelectedLLMConfig

選択されたLLM設定を取得する。

```typescript
async function getSelectedLLMConfig(): Promise<SelectedLLMConfig | null>;
```

**デフォルト値**:
- providerId: "openai"
- modelId: "gpt-4o"

### エラーハンドリング

LLMErrorを日本語メッセージに変換するヘルパー関数を提供。

| エラーコード            | 日本語メッセージ                                                       |
| ----------------------- | ---------------------------------------------------------------------- |
| API_KEY_MISSING         | APIキーが設定されていません。設定画面でAPIキーを登録してください。     |
| API_KEY_INVALID         | APIキーが無効です。正しいAPIキーを設定してください。                   |
| NETWORK_ERROR           | ネットワークエラーが発生しました。接続を確認してください。             |
| TIMEOUT                 | リクエストがタイムアウトしました。再度お試しください。                 |
| RATE_LIMIT              | レート制限に達しました。しばらく待ってから再度お試しください。         |
| CONTEXT_LENGTH_EXCEEDED | メッセージが長すぎます。短くして再度お試しください。                   |
| CONTENT_FILTER          | コンテンツフィルターによりブロックされました。                         |
| MODEL_NOT_FOUND         | 指定されたモデルが見つかりません。                                     |
| SERVICE_UNAVAILABLE     | サービスが一時的に利用できません。しばらく待ってから再度お試しください。|
| UNKNOWN                 | エラーが発生しました。                                                 |

### 品質メトリクス

- テストカバレッジ: Line 95%+, Branch 80%+, Function 100%
- 全54件の自動テスト成功（buildMessages: 24件、aiHandlers.llm: 30件）

---

## 完了タスク

### TASK-CHAT-SYSPROMPT-LLM-001（2026-01-23完了）

- システムプロンプトのLLM API統合
- buildMessages関数実装（36行）
- llmConfigProvider実装（53行）
- aiHandlers AI_CHATハンドラー更新
- テスト54件作成（全件PASS）
- 4プロバイダー対応（OpenAI、Anthropic、Google、xAI）

---

## 関連ドキュメント

- [アーキテクチャ設計](./05-architecture.md)
- [エラーハンドリング仕様](./07-error-handling.md)
- [プラグイン開発手順](./11-plugin-development.md)
- [ローカルエージェント仕様](./09-local-agent.md)
- [セキュリティガイドライン](./17-security-guidelines.md)
- [システムプロンプトLLM API統合 実装ガイド](../../../docs/30-workflows/completed-tasks/system-prompt-llm-api/outputs/phase-12/implementation-guide.md)
