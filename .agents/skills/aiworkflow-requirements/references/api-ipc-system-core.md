# システムIPC・AIプロバイダーAPI連携 / core specification

> 親仕様書: [api-ipc-system.md](api-ipc-system.md)
> 役割: core specification

## AI/チャット IPC チャネル

Electronデスクトップアプリでは、IPC通信でAIチャット機能とLLM選択機能を提供する。

**実装ファイル**:

- ハンドラー: `apps/desktop/src/main/ipc/aiHandlers.ts`
- チャンネル定義: `apps/desktop/src/preload/channels.ts`
- 型定義: `apps/desktop/src/preload/types.ts`

### チャンネル一覧

| チャネル              | 用途                            | Request        | Response                  | 実装箇所              |
| --------------------- | ------------------------------- | -------------- | ------------------------- | --------------------- |
| `AI_CHAT`             | LLMへのメッセージ送信と応答取得 | AIChatRequest  | AIChatResponse            | aiHandlers.ts:21-182  |
| `AI_CHECK_CONNECTION` | legacy互換の接続状態確認        | なし           | AICheckConnectionResponse | aiHandlers.ts:184-204 |
| `AI_INDEX`            | RAGドキュメントインデックス作成 | AIIndexRequest | AIIndexResponse           | aiHandlers.ts:208-235 |

#### `AI_CHECK_CONNECTION` の運用方針（Task06 再監査: 2026-03-17）

- `AI_CHECK_CONNECTION` は**廃止完了ではなく legacy 互換として残置**する。
- 新規実装・新規UI導線の health check は `llm:check-health` を primary とする。
- 削除は `apps/desktop/src` の参照ゼロ確認と回帰テスト合格を満たした後に実施する。

### LLM選択状態管理

- **Store**: Zustand `llmSlice`（`selectedProviderId` / `selectedModelId`）+ `chatSlice`
- **同期チャネル**: `llm:set-selected-config`（Renderer の選択状態を Main へ同期）
- **AI_CHAT request 優先順位**:
  1. `AIChatRequest.providerId` + `AIChatRequest.modelId`（両方指定時のみ有効）
  2. Main 側の選択状態（`setSelectedLLMConfig` で保持）
- **未選択時の挙動**:
  - Main 側選択状態が未設定の場合はエラーを返し、暗黙 default fallback は行わない
- **バリデーション**:
  - `providerId` / `modelId` は片方のみ指定を禁止
  - `providerId` / `modelId` は空文字・トリム後空文字を禁止
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

## Conversation IPC API（会話履歴永続化）

> 完了タスク: TASK-FIX-CONVERSATION-IPC-HANDLER-REGISTRATION（2026-03-16）

### チャンネル一覧

| チャンネル | 用途 | Request | Response |
| --- | --- | --- | --- |
| `conversation:list` | 会話一覧取得 | `{ userId, limit?, offset? }` | `PaginatedResult<ConversationSummary>` |
| `conversation:get` | 会話詳細取得 | `{ id }` | `Conversation \| null` |
| `conversation:create` | 会話作成 | `{ userId, title }` | `Conversation` |
| `conversation:update` | 会話更新 | `{ id, title?, isFavorite?, isPinned? }` | `Conversation` |
| `conversation:delete` | 会話削除 | `{ id }` | `void` |
| `conversation:addMessage` | メッセージ追加 | `{ sessionId, message: { role, content } }` | `Message` |
| `conversation:search` | 会話検索 | `{ userId, query }` | `ConversationSummary[]` |

### DB 初期化フロー

1. `better-sqlite3` で `~/.claude/conversations.db` を開く
2. `pragma("journal_mode = WAL")` で WAL モード設定
3. `CONVERSATION_DB_SCHEMA` DDL で `chat_sessions` + `chat_messages` テーブル + 4インデックスを作成
4. `ConversationRepository(db)` を生成
5. `registerConversationHandlers(repository)` で7チャンネルを登録

### Graceful Degradation

DB 初期化失敗時は `registerConversationFallbackHandlers()` で全7チャンネルに `DB_NOT_AVAILABLE` フォールバックを登録。S30 パターン準拠。

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

### 完了タスク（TASK-IMP-MAIN-CHAT-SETTINGS-AI-RUNTIME-001）

> 完了日: 2026-03-17

| 変更項目 | ファイル | 内容 |
| -------- | -------- | ---- |
| GAP-01: AI_CHAT P42バリデーション追加 | `apps/desktop/src/main/ipc/aiHandlers.ts` | `providerId`/`modelId` に P42 準拠3段バリデーション（`typeof` → `=== ""` → `.trim() === ""`）を追加 |
| GAP-03: DEFAULT_CONFIG fallback 廃止 | `apps/desktop/src/main/ipc/llmConfigProvider.ts` | `?? DEFAULT_CONFIG` フォールバックを廃止。`getSelectedLLMConfig()` が `null` を返すように変更。呼び出し元（`aiHandlers.ts`）には既に null チェックが存在していた |
| AI_CHECK_CONNECTION 存廃方針確定 | `apps/desktop/src/main/ipc/aiHandlers.ts` | legacy 互換として残置。新規実装は `llm:check-health` を primary とする方針を明文化 |

**テストファイル（新規5件）**:

| テストファイル | テスト数 | 対象 |
| -------------- | -------- | ---- |
| `aiHandlers.runtime-sync.test.ts` | 8 | AI_CHAT バリデーション / provider 解決順 |
| `llm.runtime-sync.test.ts` | 12 | `handleCheckHealth` disconnected 返却 / `handleSetSelectedConfig` バリデーション |
| `llmConfigProvider.runtime-sync.test.ts` | 4 | `getSelectedLLMConfig()` null 返却 |
| `authKeyHandlers.runtime-sync.test.ts` | 9 | auth-key IPC バリデーション |
| `apiKeyHandlers.runtime-sync.test.ts` | 12 | apiKey IPC バリデーション |

### 関連タスク

| タスクID                                             | 概要                                                                              | ステータス |
| ---------------------------------------------------- | --------------------------------------------------------------------------------- | ---------- |
| TASK-IMP-MAIN-CHAT-SETTINGS-AI-RUNTIME-001           | Main/Chat/Settings Runtime 同期（GAP-01〜03 修正）                                | 完了       |
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
