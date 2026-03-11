# システムIPC・AIプロバイダーAPI連携

> 本ドキュメントは統合システム設計仕様書の一部です。
> 管理: .claude/skills/aiworkflow-requirements/
>
> **親ドキュメント**: [api-endpoints.md](./api-endpoints.md)

---

## AI/チャット IPC チャネル

Electronデスクトップアプリでは、IPC通信でAIチャット機能とLLM選択機能を提供する。

**実装ファイル**:

- ハンドラー: `apps/desktop/src/main/ipc/aiHandlers.ts`
- チャンネル定義: `apps/desktop/src/preload/channels.ts`
- 型定義: `apps/desktop/src/preload/types.ts`

### チャンネル一覧

| チャネル              | 用途                            | Request        | Response                  | 実装箇所              |
| --------------------- | ------------------------------- | -------------- | ------------------------- | --------------------- |
| `AI_CHAT`             | LLMへのメッセージ送信と応答取得 | AIChatRequest  | AIChatResponse            | aiHandlers.ts:21-89   |
| `AI_CHECK_CONNECTION` | LLM/RAG接続状態確認             | なし           | AICheckConnectionResponse | aiHandlers.ts:93-112  |
| `AI_INDEX`            | RAGドキュメントインデックス作成 | AIIndexRequest | AIIndexResponse           | aiHandlers.ts:116-143 |

### LLM選択状態管理

- **Store**: Zustand `llmSlice`（`selectedProviderId` / `selectedModelId`）+ `chatSlice`
- **同期チャネル**: `llm:set-selected-config`（Renderer の選択状態を Main へ同期）
- **AI_CHAT request 優先順位**:
  1. `AIChatRequest.providerId` + `AIChatRequest.modelId`（両方指定時のみ有効）
  2. Main 側の選択状態（`setSelectedLLMConfig` で保持）
- **バリデーション**:
  - `providerId` / `modelId` は片方のみ指定を禁止
  - `providerId` は `"openai" | "anthropic" | "google" | "xai"` のみ許可

#### LLM選択同期 IPC

| チャネル                   | メソッド | 引数                               | 戻り値                              | 公開先   |
| -------------------------- | -------- | ---------------------------------- | ----------------------------------- | -------- |
| `llm:set-selected-config`  | invoke   | `{ providerId, modelId }`          | `{ success: boolean, error?: string }` | Renderer |

### セキュリティ考慮事項

| 項目                       | 対策                                          |
| -------------------------- | --------------------------------------------- |
| APIキー保護                | `api-keys` ストアを単一正本化し、safeStorage 暗号化 + `SecureStorage` facade で参照 |
| プロンプトインジェクション | ローカルアプリのため影響限定的                |
| XSS攻撃                    | React自動エスケープ + IPC経由で文字列のみ送信 |
| レート制限対応             | プロバイダー側のレート制限エラーを通知        |

---

## Slide IPC API（スライド同期）

### 概要

スライドプレゼンテーション機能における双方向同期のIPCチャンネル。Reveal.js HTML（index.html）とstructure.md間の同期状態を管理する。

**実装ファイル**:

- ハンドラー: `apps/desktop/src/main/slide/sync-manager.ts`
- ファイル監視: `apps/desktop/src/main/slide/file-watcher.ts`
- スキル実行: `apps/desktop/src/main/slide/skill-executor.ts`
- 型定義: `packages/shared/src/slide/types.ts`

### チャンネル一覧

| チャネル              | 方向            | 用途               | Payload                                            |
| --------------------- | --------------- | ------------------ | -------------------------------------------------- |
| `slide:sync-status`   | Main → Renderer | 同期状態通知       | `{ status: SyncStatus, direction: SyncDirection }` |
| `slide:sync-progress` | Main → Renderer | 同期進捗通知       | `{ percent: number, message: string }`             |
| `slide:reverse-sync`  | Renderer → Main | 逆同期手動トリガー | `{ projectPath: string }`                          |
| `slide:sync-error`    | Main → Renderer | 同期エラー通知     | `{ code: string, message: string }`                |
| `slide:watch-start`   | Renderer → Main | ファイル監視開始   | `{ projectPath: string }`                          |
| `slide:watch-stop`    | Renderer → Main | ファイル監視停止   | `{ projectPath: string }`                          |

### 型定義

#### 基本型

| 型名          | 種別 | 説明     | 取りうる値                               |
| ------------- | ---- | -------- | ---------------------------------------- |
| SyncStatus    | type | 同期状態 | `idle`, `syncing`, `synced`, `error`     |
| SyncDirection | type | 同期方向 | `forward`（順方向）, `reverse`（逆方向） |

#### SyncErrorPayload インターフェース

同期エラー時に使用するペイロード構造。

| フィールド | 型      | 必須 | 説明                                                                                 |
| ---------- | ------- | ---- | ------------------------------------------------------------------------------------ |
| code       | string  | Yes  | エラーコード（`AGENT_ERROR`, `FILE_ERROR`, `TIMEOUT`, `VALIDATION_ERROR`のいずれか） |
| message    | string  | Yes  | 人間可読なエラーメッセージ                                                           |
| details    | unknown | No   | 追加の詳細情報（デバッグ用）                                                         |

### エラーコード

| コード             | 説明                     | 対処                  |
| ------------------ | ------------------------ | --------------------- |
| `AGENT_ERROR`      | Agent SDK呼び出し失敗    | API接続確認、リトライ |
| `FILE_ERROR`       | ファイル読み書き失敗     | パーミッション確認    |
| `TIMEOUT`          | 同期タイムアウト（30秒） | 処理の再試行          |
| `VALIDATION_ERROR` | レスポンス形式不正       | Agent出力確認         |

---

## Workspace File Watch IPC API（TASK-UI-04A）

### 概要

workspace layout 04A では、selected file の preview と status bar を最新化するために file watch IPC を使う。

**実装ファイル**:

- ハンドラー: `apps/desktop/src/main/ipc/fileHandlers.ts`
- チャンネル定義: `apps/desktop/src/preload/channels.ts`
- 型定義: `apps/desktop/src/preload/types.ts`

### チャンネル一覧

| チャネル | 方向 | 用途 | Payload |
| --- | --- | --- | --- |
| `file:watch-start` | Renderer → Main | selected file の監視開始 | `{ watchPath: string }` |
| `file:watch-stop` | Renderer → Main | watch 停止 | `watchId: string` |
| `file:changed` | Main → Renderer | file change 通知 | `{ watchId, eventType, filePath, timestamp }` |

### 運用契約

| 項目 | 契約 |
| --- | --- |
| watch scope | selected file のみ |
| watch start response | `{ success: boolean, watchId?: string, error?: string }` |
| push 受信後 | Renderer は path 一致時のみ `file.read` を再実行 |
| cleanup | file switch / unmount で `file:watch-stop` を必ず実行 |

### Workspace preview read 契約（TASK-UI-04C）

04C では preview / quick search のために新規 IPC を追加せず、04A の watch 契約と既存 `file:read` を再利用する。

| 項目 | 契約 |
| --- | --- |
| reuse channel | `file:read` |
| new channel | なし |
| timeout | Renderer が `Promise.race` で 5秒 timeout を適用する |
| retry | timeout / read failure 時は 1秒間隔で最大3回 retry する |
| watch integration | `file:changed` の path 一致時だけ preview 再読込を行う |
| quick search source | `workspaceSlice` 由来の file tree を flatten し、Renderer local search のみで解決する |

---

## Electron IPC API設計

デスクトップアプリでは、Renderer Process と Main Process 間の通信に IPC（Inter-Process Communication）を使用する。

### IPC設計原則

| 原則                   | 説明                                     |
| ---------------------- | ---------------------------------------- |
| contextIsolation       | Preloadスクリプトでのみ通信APIを公開     |
| チャネルホワイトリスト | 許可されたチャネルのみ通信可能           |
| sender検証             | withValidation()でリクエスト元を検証     |
| 型安全性               | 全チャネルに対してTypeScript型定義を適用 |

### APIキー管理 IPC チャネル

| チャネル          | メソッド | 引数                   | 戻り値                            | 公開先    |
| ----------------- | -------- | ---------------------- | --------------------------------- | --------- |
| `apiKey:save`     | invoke   | `{ provider, apiKey }` | `IPCResponse<void>`               | Renderer  |
| `apiKey:delete`   | invoke   | `{ provider }`         | `IPCResponse<void>`               | Renderer  |
| `apiKey:validate` | invoke   | `{ provider, apiKey }` | `IPCResponse<ValidationResult>`   | Renderer  |
| `apiKey:list`     | invoke   | なし                   | `IPCResponse<ProviderListResult>` | Renderer  |
| `apiKey:get`      | invoke   | `{ provider }`         | `string \| null`                  | Main Only |

**セキュリティ注意**: `apiKey:get` はRenderer Processに公開しない（Main Process内部使用のみ）

`ProviderListResult`:

| フィールド        | 型                 | 説明                                |
| ----------------- | ------------------ | ----------------------------------- |
| `providers`       | `ProviderStatus[]` | プロバイダー状態一覧（shape検証後） |
| `registeredCount` | `number`           | `status === "registered"` 件数      |
| `totalCount`      | `number`           | `providers.length`                  |

#### apiKey:list レスポンス詳細（TASK-FIX-SETTINGS-APIKEY-CONTRACT-GUARD-001）

`IPCResponse<T>` 構造:

| フィールド | 型                                  | 必須 | 説明                                   |
| ---------- | ----------------------------------- | ---- | -------------------------------------- |
| `success`  | `boolean`                           | Yes  | 操作成功フラグ                         |
| `data`     | `T`                                 | No   | 成功時のデータ（`ProviderListResult`） |
| `error`    | `{ code: string; message: string }` | No   | 失敗時のエラー詳細                     |

`ProviderStatus` 構造:

| フィールド        | 型                   | 説明                                                        |
| ----------------- | -------------------- | ----------------------------------------------------------- |
| `provider`        | `AIProvider`         | `"openai"` / `"anthropic"` / `"google"` / `"xai"`           |
| `displayName`     | `string`             | プロバイダー表示名                                          |
| `status`          | `RegistrationStatus` | `"registered"` / `"not_registered"` / `"validation_failed"` |
| `lastValidatedAt` | `string \| null`     | 最終検証日時（ISO 8601）                                    |

#### Main側バリデーション（GAP-05）

apiKeyHandlers.ts において、サービス層のレスポンスを正規化してから Renderer に返す。

| ステップ          | 処理                                                                  | 目的                                          |
| ----------------- | --------------------------------------------------------------------- | --------------------------------------------- |
| 1. 配列ガード     | `Array.isArray(result?.providers) ? result.providers : []`            | サービス層が非配列を返した場合の防御          |
| 2. 件数算出       | `providers.filter(p => p?.status === "registered").length`            | null-safe なフィルタで registeredCount を算出 |
| 3. レスポンス構築 | `{ success: true, data: { providers, registeredCount, totalCount } }` | `IPCResponse<ProviderListResult>` 契約に準拠  |

#### Renderer側 normalizeProviders（P49準拠）

Renderer コンポーネント（ApiKeysSection）が IPC レスポンスを受け取った後、要素レベルの shape 検証を実施する。`as` キャストは使用せず、`in` 演算子で実行時にプロパティ存在を検証する。

フィルタ条件（全て AND）:

- `item != null`
- `typeof item === "object"`
- `"provider" in item && typeof item.provider === "string"`
- `"status" in item && typeof item.status === "string"`

詳細: [ui-ux-settings.md#normalizeProviders フィルタ仕様](./ui-ux-settings.md#normalizeproviders-フィルタ仕様)

### Claude Agent SDK 認証キー管理 IPC チャネル（TASK-FIX-16-1）

Claude Agent SDK で使用する Anthropic API Key の管理 IPC チャネル。

**実装ファイル**:

- ハンドラー: `apps/desktop/src/main/ipc/authKeyHandlers.ts`
- サービス: `apps/desktop/src/main/services/auth/AuthKeyService.ts`
- チャンネル定義: `apps/desktop/src/preload/channels.ts`
- Preload API: `apps/desktop/src/preload/authKeyApi.ts`

| チャネル            | メソッド | 引数      | 戻り値                    | 公開先    |
| ------------------- | -------- | --------- | ------------------------- | --------- |
| `auth-key:set`      | invoke   | `{ key }` | `AuthKeySetResponse`      | Renderer  |
| `auth-key:exists`   | invoke   | なし      | `AuthKeyExistsResponse`   | Renderer  |
| `auth-key:validate` | invoke   | `{ key }` | `AuthKeyValidateResponse` | Renderer  |
| `auth-key:delete`   | invoke   | なし      | `AuthKeyDeleteResponse`   | Renderer  |
| (getKey)            | -        | -         | `string \| null`          | Main Only |

**型定義**:

| 型名                      | フィールド                 | 説明         |
| ------------------------- | -------------------------- | ------------ |
| `AuthKeySetRequest`       | `key: string`              | API Key      |
| `AuthKeySetResponse`      | `success: boolean, error?` | 設定結果     |
| `AuthKeyExistsResponse`   | `exists: boolean, source?: "saved" \| "env-fallback" \| "not-set"` | キー存在確認 |
| `AuthKeyValidateRequest`  | `key: string`              | 検証対象キー |
| `AuthKeyValidateResponse` | `valid: boolean, error?`   | 検証結果     |
| `AuthKeyDeleteResponse`   | `success: boolean, error?` | 削除結果     |

**`auth-key:exists` 判定契約（TASK-FIX-SKILL-AUTH-PREFLIGHT-GUARD-001）**:

| 項目            | 判定仕様                                                                 |
| --------------- | ------------------------------------------------------------------------ |
| 1次判定         | `AuthKeyService.getKey()` で解決したキーを評価                           |
| 2次判定         | `process.env.ANTHROPIC_API_KEY`（trim後）との一致を確認                  |
| `source=saved`  | 保存済みキーが有効で、env fallback と同一値でない                        |
| `source=env-fallback` | 解決キーが env key と一致（保存キー未設定時の fallback 含む）      |
| `source=not-set` | キー未設定、または exists 判定でエラー                                   |
| 目的            | Renderer preflight と Main 実行時判定の乖離を防止し、UI の状態表示を安定化 |

### 実装状況（auth-key ライフサイクル）

| 実装項目                                                                                  | ステータス | 関連タスク                                           |
| ----------------------------------------------------------------------------------------- | ---------- | ---------------------------------------------------- |
| `registerAllIpcHandlers` で `registerAuthKeyHandlers` を起動時/再登録時に実行             | completed  | TASK-FIX-AUTH-KEY-HANDLER-REGISTRATION-001           |
| `unregisterAllIpcHandlers` で `unregisterAuthKeyHandlers` を解除時に実行                  | completed  | TASK-FIX-AUTH-KEY-HANDLER-REGISTRATION-001           |
| `registerAllIpcHandlers` で `AuthKeyService` を単一生成し、`registerSkillHandlers` と共有 | completed  | TASK-FIX-SKILL-EXECUTOR-AUTHKEY-DI-001               |
| `registerSkillHandlers` が `authKeyService` を `SkillExecutor` へ DI する                 | completed  | TASK-FIX-SKILL-EXECUTOR-AUTHKEY-DI-001               |
| `PROFILE_UNLINK_PROVIDER` 成功通知で `AUTH_STATE_CHANGED.user` を `AuthUser` 形状へ統一   | completed  | TASK-INVESTIGATE-ELECTRON-SANDBOX-ITERABLE-ERROR-001 |
| Renderer `linkedProviders` を契約崩れ時に正規化し `is not iterable` を回避                | completed  | TASK-INVESTIGATE-ELECTRON-SANDBOX-ITERABLE-ERROR-001 |
| `registerAllIpcHandlers` で各 `registerXxxHandlers` を `safeRegister` で個別 try-catch 化 | completed  | TASK-FIX-IPC-HANDLER-GRACEFUL-DEGRADATION-001        |
| `registerAllIpcHandlers` が `IpcHandlerRegistrationResult` を返却（成功/失敗カウント）    | completed  | TASK-FIX-IPC-HANDLER-GRACEFUL-DEGRADATION-001        |
| `auth-key:exists` が `source`（saved/env-fallback/not-set）を返却                            | completed  | TASK-FIX-APIKEY-CHAT-TOOL-INTEGRATION-001            |
| `apiKey:save` / `apiKey:delete` 後に `LLMAdapterFactory.clearInstance(provider)` を実行      | completed  | TASK-FIX-APIKEY-CHAT-TOOL-INTEGRATION-001            |
| `llm:set-selected-config` で Renderer 選択状態を Main 側 `ai.chat` 実行経路へ同期            | completed  | TASK-FIX-APIKEY-CHAT-TOOL-INTEGRATION-001            |

### 関連タスク

| タスクID                                             | 概要                                                                              | ステータス |
| ---------------------------------------------------- | --------------------------------------------------------------------------------- | ---------- |
| TASK-FIX-SKILL-EXECUTOR-AUTHKEY-DI-001               | SkillExecutor への AuthKeyService 注入経路を単一路化                              | 完了       |
| TASK-FIX-SKILL-AUTH-PREFLIGHT-GUARD-001              | `auth-key:exists` 判定契約の env fallback 追加                                    | 完了       |
| TASK-FIX-AUTH-KEY-HANDLER-REGISTRATION-001           | auth-key 4チャネルの Main 登録漏れと解除連携を修正                                | 完了       |
| TASK-INVESTIGATE-ELECTRON-SANDBOX-ITERABLE-ERROR-001 | OAuth後の `AUTH_STATE_CHANGED` / `linkedProviders` 契約整合で iterable 障害を分離 | 完了       |
| TASK-FIX-IPC-HANDLER-GRACEFUL-DEGRADATION-001        | `registerAllIpcHandlers` に Graceful Degradation（個別 try-catch + 失敗記録）を追加 | 完了       |

**セキュリティ設計**:

| 項目             | 対策                                             |
| ---------------- | ------------------------------------------------ |
| 暗号化           | Electron safeStorage.encryptString()             |
| Renderer 分離    | getKey() は Renderer 非公開（Main Process のみ） |
| IPC 検証         | withValidation() ラッパーで sender 検証          |
| フォーマット検証 | `sk-ant-api` プレフィックスパターン              |
| ログ出力         | キー値は一切ログに出力しない                     |

### Notification / HistorySearch IPC チャネル（TASK-UI-01-C）

Notification ドメインと HistorySearch ドメインの統合で追加したIPC契約。

**実装ファイル**:

- ハンドラー: `apps/desktop/src/main/ipc/notificationHandlers.ts`, `apps/desktop/src/main/ipc/historySearchHandlers.ts`
- 登録: `apps/desktop/src/main/ipc/index.ts`
- チャンネル定義: `apps/desktop/src/preload/channels.ts`
- Preload API: `apps/desktop/src/preload/index.ts`
- 型定義: `apps/desktop/src/preload/types.ts`

| チャネル                     | メソッド | 引数                                  | 戻り値                           | 備考             |
| ---------------------------- | -------- | ------------------------------------- | -------------------------------- | ---------------- |
| `notification:get-history`   | invoke   | `{ limit?: number, offset?: number }` | `NotificationGetHistoryResponse` | sender検証必須   |
| `notification:mark-read`     | invoke   | `{ notificationId: string }`          | `NotificationMutationResponse`   | 認証必須         |
| `notification:mark-all-read` | invoke   | なし                                  | `NotificationMutationResponse`   | 認証必須         |
| `notification:delete`        | invoke   | `{ notificationId: string }`          | `NotificationMutationResponse`   | 認証必須         |
| `notification:clear`         | invoke   | `{ onlyRead?: boolean }`              | `NotificationMutationResponse`   | 認証必須         |
| `notification:new`           | on       | `NotificationHistoryItem`             | event                            | Main -> Renderer |
| `history:search`             | invoke   | `HistorySearchRequest`                | `HistorySearchResponse`          | `query` は空文字許容、trim 正規化 |
| `history:get-stats`          | invoke   | なし                                  | `HistorySearchStatsResponse`     | sender検証 + 集計返却 |

**セキュリティ契約**:

| 項目       | 契約                                                                            |
| ---------- | ------------------------------------------------------------------------------- |
| sender検証 | `event.sender === mainWindow.webContents` かつ URL を検証                       |
| 更新系認証 | `notification:mark-read` / `mark-all-read` / `delete` / `clear` は未認証時 `AUTH_REQUIRED` |
| 入力検証   | `notificationId` と `history query/filter/limit/offset` を検証                  |
| 公開境界   | `ALLOWED_INVOKE_CHANNELS` / `ALLOWED_ON_CHANNELS` に明示登録                    |

### HistorySearch handler detail（TASK-UI-06 追補）

| 項目 | 契約 |
| --- | --- |
| `query` | `string` 以外は `VALIDATION_ERROR`。空文字と空白のみは `\"\"` へ正規化して全件検索として扱う |
| `filter` | `all` / `chat` / `file` / `skill` 以外は `VALIDATION_ERROR` |
| `limit` | 不正値は `30` へ fallback |
| `offset` | 不正値は `0` へ fallback |
| error sanitize | handler 内で `sanitizeErrorMessage()` を通し、生の例外文字列をそのまま Renderer へ出さない |

### IPC エラーコード

| コード               | 説明                 | 対処                         |
| -------------------- | -------------------- | ---------------------------- |
| `INVALID_SENDER`     | 不正なリクエスト元   | DevTools等からの不正アクセス |
| `PROVIDER_NOT_FOUND` | 未対応プロバイダー   | サポート対象を確認           |
| `VALIDATION_FAILED`  | バリデーションエラー | 入力値を確認                 |
| `STORAGE_ERROR`      | ストレージ操作失敗   | safeStorage利用可否確認      |
| `NETWORK_ERROR`      | ネットワーク障害     | 接続状態を確認               |

### Renderer 側 Response Shape Fallback パターン（2026-03-07追加）

Renderer コンポーネントが IPC レスポンスを受け取る際、Preload 層の contextBridge 公開が部分的に失敗するケースに備え、3段階の防御パターンを適用する。

**標準パターン: 3段階防御**

| 段階                  | 防御内容                                                               | コード例                                                                           |
| --------------------- | ---------------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| 1. API存在確認        | `window.electronAPI?.namespace` で namespace レベルの存在を確認        | `const api = window.electronAPI?.apiKey;`                                          |
| 2. メソッド存在確認   | `api?.method` でメソッドレベルの存在を確認し、不在時は warn + fallback | `if (!api?.list) { console.warn(...); return; }`                                   |
| 3. レスポンス形状検証 | `Array.isArray(result.data.items)` で iterable 安全性を検証            | `const items = Array.isArray(result.data.providers) ? result.data.providers : [];` |

**適用箇所**: ApiKeysSection loadProviders
**関連タスク**: 09-TASK-FIX-SETTINGS-PRELOAD-SANDBOX-ITERABLE-GUARD-001

---

## AIプロバイダーAPI連携

### 対応プロバイダー

| プロバイダー | API ベースURL                                  | 認証方式         |
| ------------ | ---------------------------------------------- | ---------------- |
| OpenAI       | `https://api.openai.com/v1`                    | Bearer Token     |
| Anthropic    | `https://api.anthropic.com/v1`                 | x-api-key Header |
| Google AI    | `https://generativelanguage.googleapis.com/v1` | Query Parameter  |
| xAI          | `https://api.x.ai/v1`                          | Bearer Token     |

### APIキー検証エンドポイント

| プロバイダー | メソッド | エンドポイント         | 検証方法                     |
| ------------ | -------- | ---------------------- | ---------------------------- |
| OpenAI       | GET      | `/models`              | モデル一覧取得成功で有効判定 |
| Anthropic    | POST     | `/messages`            | 最小リクエスト送信で認証確認 |
| Google AI    | GET      | `/models?key={apiKey}` | モデル一覧取得成功で有効判定 |
| xAI          | GET      | `/models`              | モデル一覧取得成功で有効判定 |

### HTTPステータスと検証結果マッピング

| HTTPステータス | 検証結果        | 意味                               |
| -------------- | --------------- | ---------------------------------- |
| 200-299        | `valid`         | APIキー有効                        |
| 401            | `invalid`       | 認証失敗（キー無効または期限切れ） |
| 403            | `invalid`       | アクセス拒否                       |
| 429            | `valid`         | レートリミット（認証は成功）       |
| 500-504        | `network_error` | サーバーエラー                     |
| タイムアウト   | `timeout`       | 接続タイムアウト（10秒）           |

---

## エンティティ抽出サービス (NER)

### 概要

チャンクからエンティティを抽出する内部サービス。現在はElectronアプリ内部で使用され、外部REST APIは未公開。

**実装場所**: `packages/shared/src/services/extraction/`

### IEntityExtractor インターフェース

| メソッド          | 説明                             | 戻り値                                 |
| ----------------- | -------------------------------- | -------------------------------------- |
| `extract()`       | 単一チャンクからエンティティ抽出 | `Result<ExtractionResult, Error>`      |
| `extractBatch()`  | 複数チャンクからバッチ抽出       | `Result<BatchExtractionResult, Error>` |
| `mergeEntities()` | 抽出結果のマージ（重複除去）     | `ExtractedEntity[]`                    |

### EntityExtractionOptions

| オプション           | 型       | デフォルト | 説明                         |
| -------------------- | -------- | ---------- | ---------------------------- |
| types                | string[] | 全タイプ   | 抽出対象のエンティティタイプ |
| minConfidence        | number   | 0.5        | 最小信頼度閾値               |
| maxEntitiesPerChunk  | number   | 20         | チャンクあたり最大抽出数     |
| minNameLength        | number   | 2          | 最小名前長                   |
| generateDescriptions | boolean  | true       | 説明生成（LLMのみ）          |
| useLLM               | boolean  | true       | LLM使用フラグ                |

### エラーハンドリング

| エラークラス       | 説明                    | 対処                         |
| ------------------ | ----------------------- | ---------------------------- |
| `LLMProviderError` | LLM API呼び出し失敗     | ルールベースにフォールバック |
| `JsonParseError`   | LLMレスポンスのJSON不正 | ルールベースにフォールバック |
| `ValidationError`  | 入力バリデーション失敗  | エラーメッセージを返却       |

---

## 関連ドキュメント

- [APIエンドポイント概要](./api-endpoints.md)
- [認証・プロフィールIPC](./api-ipc-auth.md)
- [Agent Dashboard IPC](./api-ipc-agent.md)
- [RAGサービス群](./rag-services.md)

---

## 完了タスク

### TASK-FIX-IPC-HANDLER-GRACEFUL-DEGRADATION-001（2026-03-08完了）

| 項目             | 内容                                                                                                                                                                                                |
| ---------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| タスクID         | TASK-FIX-IPC-HANDLER-GRACEFUL-DEGRADATION-001                                                                                                                                                       |
| 反映対象         | `registerAllIpcHandlers` の Graceful Degradation                                                                                                                                                    |
| 主要変更         | `safeRegister()` ヘルパーで各ハンドラ登録を個別 try-catch 化。`IpcHandlerRegistrationResult`（`successCount`/`failureCount`/`failures`）を戻り値として返却。エラーコード 4001（Infrastructure Error） |
| 検証             | 個別失敗テスト + 全成功テスト + 戻り値検証テスト PASS                                                                                                                                              |
| 関連ドキュメント | `docs/30-workflows/completed-tasks/10-TASK-FIX-IPC-HANDLER-GRACEFUL-DEGRADATION-001/outputs/`                                                                                                                       |

#### Graceful Degradation 実装パターン詳細

**型定義**:

| 型名                            | 目的               | フィールド                                                                                  |
| ------------------------------- | ------------------ | ------------------------------------------------------------------------------------------- |
| `HandlerRegistrationFailure`    | 個別登録失敗の記録 | `handlerName: string`, `errorMessage: string`, `errorCode: number` (4001 = Infrastructure Error) |
| `IpcHandlerRegistrationResult`  | 全体の登録結果     | `successCount: number`, `failureCount: number`, `failures: HandlerRegistrationFailure[]`    |

**内部ヘルパー関数**:

| 関数名                              | 公開範囲                          | 目的                                                                                       |
| ----------------------------------- | --------------------------------- | ------------------------------------------------------------------------------------------ |
| `safeRegister(name, fn)`            | 非公開（index.ts内部）            | 個別ハンドラ登録を try-catch でラップ。失敗時は `HandlerRegistrationFailure` を返却         |
| `sanitizeRegistrationErrorMessage(msg)` | 非公開                        | エラーメッセージからユーザーホームディレクトリパスを `~` にマスク（NFR-02）                 |
| `escapeRegExp(str)`                 | 非公開                            | 正規表現メタ文字をエスケープ                                                               |
| `track()`                           | 非公開クロージャ                  | `registerAllIpcHandlers` 内で `safeRegister` の成功/失敗を自動カウント                     |

**ハンドラグループと登録パターン**:

| グループ                             | ハンドラ数 | 登録方式                  | 備考                                                                |
| ------------------------------------ | ---------- | ------------------------- | ------------------------------------------------------------------- |
| 独立ハンドラ（File, Store, Dashboard 等） | 11    | `track()` 経由 `safeRegister` | 依存関係なし                                                        |
| mainWindow 依存（Agent, ChatEdit）   | 2          | `track()` 経由 `safeRegister` | BrowserWindow 引数必要                                              |
| ThemeWatcher                         | 1          | 個別 try-catch            | 戻り値（unsubscribe）のキャプチャが必要なため `safeRegister` 不適合 |
| Supabase 条件付き                    | 1          | 条件分岐 + `track()`     | `getSupabaseClient()` 存在時のみ                                    |
| 複合サービス（Skill, History, Auth 等） | ~15     | `track()` 経由 `safeRegister` | サービスインスタンス共有                                            |

#### 実装時の苦戦箇所と再発防止

| 項目      | 内容                                                                                                                                                         |
| --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 苦戦箇所1 | `setupThemeWatcher` は `safeRegister` パターンに適合しない。戻り値（unsubscribe 関数）のキャプチャが必要なため、個別 try-catch で処理する必要がある            |
| 苦戦箇所2 | `track()` クロージャで成功カウントを自動管理しないと、手動カウント漏れが発生する。成功/失敗を一元管理するクロージャパターンが必須                              |
| 苦戦箇所3 | `os.homedir()` のパスには正規表現メタ文字（`\`、`.` 等）が含まれる可能性があり、`escapeRegExp` による事前エスケープが必須。未エスケープだと sanitize が誤動作する |
| 苦戦箇所4 | `unregisterAllIpcHandlers` は変更不要。`ipcMain.removeHandler()` は未登録チャネルでも安全に動作するため、Graceful Degradation の対称修正は不要               |
| 標準ルール | 戻り値キャプチャが必要なハンドラは `safeRegister` 対象外とし、個別 try-catch で処理する。カウント管理はクロージャで一元化し、手動カウントを禁止する             |

#### 関連未タスク（TASK-FIX-IPC-HANDLER-GRACEFUL-DEGRADATION-001 から派生）

| タスクID | 概要 | 優先度 | 指示書パス |
|---|---|---|---|
| UT-FIX-AGENT-HANDLERS-VITE-RESOLVE-001 | agentHandlers.test.ts 16テスト失敗（Vite resolvePackageEntry エラー）修正 | 高 | `docs/30-workflows/completed-tasks/10-TASK-FIX-IPC-HANDLER-GRACEFUL-DEGRADATION-001/unassigned-task/task-fix-agent-handlers-vite-resolve.md` |
| UT-IMP-IPC-ERROR-SANITIZE-COMMON-001 | sanitizeErrorMessage の IPC ハンドラ横断共通化 | 中 | `docs/30-workflows/completed-tasks/10-TASK-FIX-IPC-HANDLER-GRACEFUL-DEGRADATION-001/unassigned-task/task-ipc-error-sanitize-common.md` |

---

### TASK-FIX-SETTINGS-APIKEY-CONTRACT-GUARD-001（2026-03-08完了）

| 項目             | 内容                                                                                                                                                                                       |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| タスクID         | TASK-FIX-SETTINGS-APIKEY-CONTRACT-GUARD-001                                                                                                                                                |
| 反映対象         | `apiKey:list` の契約防御と providers 正規化                                                                                                                                                |
| 主要変更         | Main 側で `Array.isArray(result?.providers)` によりレスポンスを検証し `ProviderListResult` へ正規化。Renderer 側で要素 shape フィルタ（`provider/status` 必須、P49準拠 `in` 演算子）を追加 |
| 仕様拡充         | `apiKey:list` レスポンス詳細（IPCResponse/ProviderStatus 構造）、Main側バリデーション（GAP-05）、Renderer側 normalizeProviders 仕様を追記                                                  |
| 検証             | `apiKeyHandlers.list` 7件 + `profileHandlers.identities` 6件 + `ApiKeysSection` 46件、計59件 PASS                                                                                          |
| 画面証跡         | `docs/30-workflows/06-TASK-FIX-SETTINGS-APIKEY-CONTRACT-GUARD-001/outputs/phase-11/screenshots/TC-11-01..03`                                                                               |
| 関連ドキュメント | `docs/30-workflows/06-TASK-FIX-SETTINGS-APIKEY-CONTRACT-GUARD-001/outputs/phase-12/documentation-changelog.md`                                                                             |

### TASK-FIX-APIKEY-CHAT-TOOL-INTEGRATION-001（2026-03-11完了）

| 項目             | 内容                                                                                                                                                   |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| タスクID         | TASK-FIX-APIKEY-CHAT-TOOL-INTEGRATION-001                                                                                                             |
| 反映対象         | `ai.chat` 実行経路と Settings APIキー管理・AuthKey 状態表示の契約整合                                                                                 |
| 主要変更         | `AI_CHAT` に `providerId/modelId` の request 優先ルートを追加（片指定禁止）。`llm:set-selected-config` を追加し Renderer 選択状態を Main に同期      |
| 追加変更         | `SecureStorage` を `api-keys` 単一正本に収束。`apiKey:save/delete` で LLM adapter cache をクリア                                                     |
| auth-key契約     | `auth-key:exists` へ `source` を追加し、`saved` / `env-fallback` / `not-set` を明示                                                                   |
| 検証             | `llm.test.ts` / `aiHandlers.llm.test.ts` / `authKeyHandlers.test.ts` / `channels.test.ts` / `AuthKeySection.test.tsx` / `SettingsView.test.tsx` PASS |
| 画面証跡         | `docs/30-workflows/api-key-chat-tool-integration-alignment/outputs/phase-11/screenshots/TC-11-01..03`                                               |
| 関連ドキュメント | `docs/30-workflows/api-key-chat-tool-integration-alignment/outputs/phase-12/spec-update-summary.md`                                                 |

#### 関連改善タスク

| 未タスクID | 概要 | 優先度 | タスク仕様書 |
| --- | --- | --- | --- |
| ~~UT-IMP-APIKEY-CHAT-TRIPLE-SYNC-GUARD-001~~ | ~~`apiKey:save/delete` の cache clear、`llm:set-selected-config` の Main 同期、`auth-key:exists.source` の Settings 表示を単一回帰マトリクスで guard する~~ **完了: 2026-03-11** | ~~中~~ | `docs/30-workflows/completed-tasks/task-imp-apikey-chat-triple-sync-guard-001.md` |

### TASK-FIX-SKILL-EXECUTOR-AUTHKEY-DI-001（2026-03-05完了）

| 項目             | 内容                                                                                                                                                       |
| ---------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| タスクID         | TASK-FIX-SKILL-EXECUTOR-AUTHKEY-DI-001                                                                                                                     |
| 反映対象         | AuthKeyService 生成/注入ライフサイクル                                                                                                                     |
| 主要変更         | `registerAllIpcHandlers` で `AuthKeyService` を単一生成し、`registerSkillHandlers` へ第3引数として注入。`registerAuthKeyHandlers` と同一インスタンスを共有 |
| 検証             | `ipc-double-registration` で第3引数注入と同一インスタンス共有を検証。関連回帰148 tests PASS                                                                |
| 関連ドキュメント | `docs/30-workflows/02-TASK-FIX-SKILL-EXECUTOR-AUTHKEY-DI-001/outputs/phase-12/spec-update-summary.md`                                                      |

---

### TASK-UI-01-C-NOTIFICATION-HISTORY-DOMAIN（2026-03-05完了）

| 項目             | 内容                                                                                                              |
| ---------------- | ----------------------------------------------------------------------------------------------------------------- |
| タスクID         | TASK-UI-01-C-NOTIFICATION-HISTORY-DOMAIN                                                                          |
| 反映対象         | Notification / HistorySearch IPC契約                                                                              |
| 主要変更         | history 2チャネル + notification 5チャネルを追加し、sender検証・認証ゲート・入力検証を標準化                      |
| 関連ドキュメント | `docs/30-workflows/completed-tasks/task-056c-notification-history-domain/outputs/phase-12/spec-update-summary.md` |

---

### TASK-FIX-AUTH-KEY-HANDLER-REGISTRATION-001（2026-03-05完了）

| 項目             | 内容                                                                                                                      |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------- |
| タスクID         | TASK-FIX-AUTH-KEY-HANDLER-REGISTRATION-001                                                                                |
| 反映対象         | auth-key IPC 登録/解除ライフサイクル                                                                                      |
| 主要変更         | `registerAllIpcHandlers`/`unregisterAllIpcHandlers` に auth-key ハンドラ接続を追加                                        |
| 検証             | `ipc-double-registration` と `authKeyHandlers` の回帰テスト、および Renderer preflight 関連テストが PASS                  |
| 関連ドキュメント | `docs/30-workflows/completed-tasks/01-TASK-FIX-AUTH-KEY-HANDLER-REGISTRATION-001/outputs/phase-12/spec-update-summary.md` |

#### 実装時の苦戦箇所と再発防止

| 項目       | 内容                                                                                                          |
| ---------- | ------------------------------------------------------------------------------------------------------------- |
| 苦戦箇所1  | `auth-key:*` 4チャネル自体は定義済みだったため、runtime 配線漏れが発見されにくかった                          |
| 原因       | ハンドラ実装の有無と `ipc/index.ts` の登録経路検証を分離して進めた                                            |
| 対処       | `registerAllIpcHandlers` / `unregisterAllIpcHandlers` を対称更新し、再登録サイクルテストを追加                |
| 標準ルール | auth 系 IPC は「チャンネル定義・ハンドラ実装・register/unregister 配線・回帰テスト」の4点同時確認を必須化する |

#### 同種課題の簡潔解決チェック（5分）

| 項目     | 内容                                                                                                                                                                                                |
| -------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 症状     | `No handler registered` または `apps/desktop` の全量テストが `SIGTERM` で中断                                                                                                                       |
| 最短対応 | 1) `register/unregister` 対称更新 2) `authKeyHandlers`/`ipc-double-registration` 回帰追加 3) 全量実行が不安定な場合は `vitest run <対象>` へ分割 4) `task-workflow` と `lessons-learned` へ同値転記 |
| 検証     | `pnpm --filter @repo/desktop test:run <対象テスト>` PASS + `pnpm --filter @repo/desktop typecheck` PASS                                                                                             |
| 反映先   | `api-ipc-system.md` / `task-workflow.md` / `lessons-learned.md`                                                                                                                                     |

#### 関連未タスク

| タスクID                                          | 概要                                                                                                     | 参照                                                                                                       |
| ------------------------------------------------- | -------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| UT-IMP-DESKTOP-TESTRUN-SIGTERM-FALLBACK-GUARD-001 | `apps/desktop test:run` の `SIGTERM` 中断時フォールバック（失敗ログ固定 + 分割実行 + 3仕様同期）を標準化 | `docs/30-workflows/completed-tasks/unassigned-task/task-imp-desktop-testrun-sigterm-fallback-guard-001.md` |

---

### TASK-INVESTIGATE-ELECTRON-SANDBOX-ITERABLE-ERROR-001（2026-03-05完了）

| 項目             | 内容                                                                                                                  |
| ---------------- | --------------------------------------------------------------------------------------------------------------------- |
| タスクID         | TASK-INVESTIGATE-ELECTRON-SANDBOX-ITERABLE-ERROR-001                                                                  |
| 反映対象         | `AUTH_STATE_CHANGED` payload整合 / `linkedProviders` ランタイム防御                                                   |
| 主要変更         | `PROFILE_UNLINK_PROVIDER` の通知時に `toAuthUser` を適用し、Renderer `authSlice` へ `normalizeLinkedProviders` を導入 |
| 契約影響         | なし（既存IPCチャネル、request/response定義は不変）                                                                   |
| 関連ドキュメント | `docs/30-workflows/04-TASK-INVESTIGATE-ELECTRON-SANDBOX-ITERABLE-ERROR-001/outputs/phase-12/spec-update-summary.md`   |

#### 実装時の苦戦箇所と再発防止

| 項目       | 内容                                                                                                                                    |
| ---------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| 苦戦箇所1  | `PROFILE_UNLINK_PROVIDER` 通知時の `AUTH_STATE_CHANGED.user` が profile shape のまま混入し、Renderer 側で iterable 系例外を誘発しやすい |
| 原因       | Main 通知経路の shape 正規化と Renderer 側の配列防御が片側実装になりやすい                                                              |
| 対処       | Main は `toAuthUser` を必須化し、Renderer は `normalizeLinkedProviders` を導入して契約崩れを吸収                                        |
| 標準ルール | 認証契約修正は Main/Renderer の片側のみで完了扱いにしない（送信正規化 + 受信防御を同時適用）                                            |

| 項目       | 内容                                                                                      |
| ---------- | ----------------------------------------------------------------------------------------- |
| 苦戦箇所2  | 契約修正中心タスクで UI証跡を省略しやすく、Phase 11 の要求水準とずれやすい                |
| 原因       | 「非視覚修正=NON_VISUALのみ可」という運用慣性で、ユーザー追加要求への昇格を見落としやすい |
| 対処       | TC-11-UI-01〜03 の実画面証跡を再取得し、coverage validator 3/3 を証跡化                   |
| 標準ルール | ユーザーが画面検証を求めた時点で `NON_VISUAL` 運用を `SCREENSHOT` へ切り替える            |

#### 同種課題の5分解決カード（IPC契約境界）

| 項目       | 内容                                                                                                                                                                                                 |
| ---------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 症状       | `AUTH_STATE_CHANGED` 通知後に Renderer で `is not iterable` が発生する                                                                                                                               |
| 根本原因   | Main通知 shape と Renderer受信 shape の契約境界が揃っていない                                                                                                                                        |
| 最短5手順  | 1) Main通知 payload を `AuthUser` 形状へ正規化 2) Renderer で `linkedProviders` を正規化 3) Main/Renderer/UI の対象回帰を明示実行 4) UI要求時は `SCREENSHOT` 昇格で証跡を再取得 5) 3仕様書へ同値転記 |
| 検証ゲート | `typecheck` PASS、対象テスト PASS（3 files / 169 tests）、`validate-phase11-screenshot-coverage` PASS（3/3）、`verify-all-specs` PASS                                                                |
| 同期先3点  | `references/api-ipc-system.md` / `references/task-workflow.md` / `references/lessons-learned.md`                                                                                                     |

#### 関連未タスク

| タスクID                                                            | 概要                                                                                               | 参照                                                                                                         | ステータス |
| ------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ | ---------- |
| UT-IMP-PHASE12-TASK-INVESTIGATE-FIVE-MINUTE-CARD-SYNC-VALIDATOR-001 | 5分解決カードの3仕様書同期（存在/順序/検証ゲート）を機械検証し、契約系タスクの再利用性を安定化する | `docs/30-workflows/completed-tasks/task-imp-phase12-task-investigate-five-minute-card-sync-validator-001.md` | 未実施     |

---

### TASK-FIX-SKILL-AUTH-PREFLIGHT-GUARD-001（2026-03-04完了）

| 項目             | 内容                                                                                                |
| ---------------- | --------------------------------------------------------------------------------------------------- |
| タスクID         | TASK-FIX-SKILL-AUTH-PREFLIGHT-GUARD-001                                                             |
| 反映対象         | `auth-key:exists` 判定契約                                                                          |
| 主要変更         | store キー有無に加え `ANTHROPIC_API_KEY` env fallback を仕様化                                      |
| 関連ドキュメント | `docs/30-workflows/TASK-FIX-SKILL-AUTH-PREFLIGHT-GUARD-001/outputs/phase-12/spec-update-summary.md` |

---

## 変更履歴

| バージョン | 日付       | 変更内容                                                                                                                                                                                                                                  |
| ---------- | ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| v1.8.7     | 2026-03-11 | TASK-UI-04C-WORKSPACE-PREVIEW を反映: 04C では新規 IPC を追加せず `file:read` を再利用し、Renderer 側 `Promise.race` timeout（5秒）+ 3回 retry、`file:changed` path 一致時の preview 再読込、QuickSearch の Renderer-only search を契約化 |
| v1.8.6     | 2026-03-11 | UT-IMP-APIKEY-CHAT-TRIPLE-SYNC-GUARD-001 の完了移管を反映。関連改善タスクの参照先を `docs/30-workflows/completed-tasks/task-imp-apikey-chat-triple-sync-guard-001.md` へ更新し、Phase 12完了後の配置整合を task-workflow と揃えた |
| v1.8.5     | 2026-03-11 | UT-IMP-APIKEY-CHAT-TRIPLE-SYNC-GUARD-001 を関連未タスクへ登録。`cache clear` / Main 同期 / `source` 表示の 3 契約を単一回帰マトリクスで guard する改善導線を追加し、APIキー連動系の再発初動を短縮 |
| v1.8.4     | 2026-03-11 | TASK-FIX-APIKEY-CHAT-TOOL-INTEGRATION-001 を反映: `AI_CHAT` の provider/model 明示指定ルート、`llm:set-selected-config`、`auth-key:exists.source`、`apiKey:save/delete` 後の adapter cache clear、`SecureStorage` の単一正本化を同期 |
| v1.8.3     | 2026-03-11 | TASK-UI-08-NOTIFICATION-CENTER を反映: Notification IPC に `notification:delete` を追加し、`mark-read` / `delete` の引数名を `notificationId` に統一。058e の個別削除 UI と sender 検証契約を同期 |
| v1.8.2     | 2026-03-10 | TASK-UI-04A-WORKSPACE-LAYOUT を反映: `file:watch-start` / `file:watch-stop` / `file:changed` の workspace file watch API を追加し、selected file 単位の watch 契約と cleanup 条件を明文化 |
| v1.8.1     | 2026-03-08 | TASK-FIX-IPC-HANDLER-GRACEFUL-DEGRADATION-001 追補: 完了タスク節へ「Graceful Degradation 実装パターン詳細」（型定義・内部ヘルパー関数・ハンドラグループ登録パターン）と「実装時の苦戦箇所と再発防止」を追加 |
| v1.8.0     | 2026-03-08 | TASK-FIX-IPC-HANDLER-GRACEFUL-DEGRADATION-001 反映: `registerAllIpcHandlers` の Graceful Degradation（`safeRegister` + `IpcHandlerRegistrationResult` 戻り値）を実装状況テーブル・関連タスク・完了タスクへ追加 |
| v1.7.0     | 2026-03-08 | TASK-FIX-SETTINGS-APIKEY-CONTRACT-GUARD-001 仕様拡充: `apiKey:list` レスポンス詳細（IPCResponse/ProviderStatus 構造）、Main側バリデーション（GAP-05）、Renderer側 normalizeProviders（P49準拠）を追記。完了タスク日付を 2026-03-08 に更新 |
| v1.6.1     | 2026-03-07 | TASK-FIX-SETTINGS-APIKEY-CONTRACT-GUARD-001 反映: `apiKey:list` 戻り値を `IPCResponse<ProviderListResult>` へ更新し、Main/Renderer 双方の providers 形状防御と画面証跡（TC-11-01..03）を完了タスクへ同期                                  |
| v1.6.0     | 2026-03-07 | 09-TASK-FIX-SETTINGS-PRELOAD-SANDBOX-ITERABLE-GUARD-001 反映: Renderer側 Response Shape Fallback パターン（3段階防御）を追加。ApiKeysSection loadProviders での適用を明文化                                                               |
| v1.5.7     | 2026-03-06 | completed 移管済み未タスクリンクを是正。`UT-IMP-PHASE12-TASK-INVESTIGATE-FIVE-MINUTE-CARD-SYNC-VALIDATOR-001` の参照先を `completed-tasks/` 実体へ更新し、`verify-unassigned-links` での false missing を防止                             |
| v1.5.3     | 2026-03-05 | TASK-FIX-SKILL-EXECUTOR-AUTHKEY-DI-001 反映: auth-key ライフサイクル実装状況へ「単一生成 + SkillExecutor注入」2項目を追加。関連タスク/完了タスク台帳を同期                                                                                |
| v1.5.6     | 2026-03-06 | UT-IMP-PHASE12-TASK-INVESTIGATE-FIVE-MINUTE-CARD-SYNC-VALIDATOR-001 を関連未タスクへ登録。5分解決カードの3仕様書同期を機械検証する改善タスクを明示し、契約系タスクの再発防止導線を追加                                                    |
| v1.5.5     | 2026-03-06 | TASK-INVESTIGATE-ELECTRON-SANDBOX-ITERABLE-ERROR-001 追補2: 「同種課題の5分解決カード（IPC契約境界）」を追加し、症状/根本原因/最短5手順/検証ゲート/同期先3点を固定して再利用性を向上                                                      |
| v1.5.4     | 2026-03-06 | TASK-INVESTIGATE-ELECTRON-SANDBOX-ITERABLE-ERROR-001 追補: 当該タスク節に「実装時の苦戦箇所と再発防止」を追加し、`AUTH_STATE_CHANGED.user` shape 正規化と `NON_VISUAL`→`SCREENSHOT` 昇格ルールを標準化                                    |
| v1.5.3     | 2026-03-05 | TASK-INVESTIGATE-ELECTRON-SANDBOX-ITERABLE-ERROR-001 反映: `PROFILE_UNLINK_PROVIDER` 成功通知の `AUTH_STATE_CHANGED.user` を `AuthUser` 形状へ統一し、Renderer `linkedProviders` 防御（正規化）を実装状況/関連タスク/完了タスクへ同期     |
| v1.4.0     | 2026-03-05 | TASK-UI-01-C-NOTIFICATION-HISTORY-DOMAIN 反映: Notification/HistorySearch IPC（history 2 + notification 5）を追加。sender検証、更新系認証ゲート、入力検証、preload公開境界を契約化                                                        |
| v1.5.2     | 2026-03-05 | `UT-IMP-DESKTOP-TESTRUN-SIGTERM-FALLBACK-GUARD-001` を関連未タスクへ登録。`apps/desktop test:run` の `SIGTERM` 中断時に「失敗ログ固定 + `vitest run <対象>` 分割実行 + 3仕様同期」を標準運用として追跡可能化                              |
| v1.5.1     | 2026-03-05 | TASK-FIX-AUTH-KEY-HANDLER-REGISTRATION-001 追補: 「同種課題の簡潔解決チェック（5分）」を追加し、runtime 配線漏れと `SIGTERM` 中断時の分割回帰テスト運用を標準化                                                                           |
| v1.5.0     | 2026-03-05 | TASK-FIX-AUTH-KEY-HANDLER-REGISTRATION-001 追補: 完了タスク節へ「実装時の苦戦箇所と再発防止」を追加し、auth-key 既存チャネルで発生しやすい runtime 配線漏れの防止手順を明文化                                                             |
| v1.4.0     | 2026-03-05 | TASK-FIX-AUTH-KEY-HANDLER-REGISTRATION-001 反映: auth-key ライフサイクル実装状況テーブルを追加し、`registerAllIpcHandlers` / `unregisterAllIpcHandlers` の接続責務を明文化。完了タスク台帳へ同タスクを追加                                |
| v1.3.0     | 2026-03-04 | TASK-FIX-SKILL-AUTH-PREFLIGHT-GUARD-001 反映: `auth-key:exists` 判定契約に env fallback（`ANTHROPIC_API_KEY`）を追加。Renderer preflight と Main 実行時判定の整合方針を明文化                                                             |
| v1.2.0     | 2026-02-08 | TASK-FIX-16-1: Claude Agent SDK認証キー管理IPCチャネル4種追加（auth-key:set/exists/validate/delete）                                                                                                                                      |
| v1.1.0     | 2026-01-26 | spec-guidelines.md準拠: コードブロックを表形式に変換                                                                                                                                                                                      |
| v1.0.0     | -          | 初版作成                                                                                                                                                                                                                                  |
