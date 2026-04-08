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
| `AI_INDEX`            | RAGドキュメントインデックス作成（legacy guidance stub） | AIIndexRequest | AIIndexResponse           | aiHandlers.ts:208-235 |

#### `AI_CHECK_CONNECTION` の運用方針（Task06 再監査: 2026-03-17）

- `AI_CHECK_CONNECTION` は**廃止完了ではなく legacy 互換として残置**する。
- 新規実装・新規UI導線の health check は `llm:check-health` を primary とする。
- 削除は `apps/desktop/src` の参照ゼロ確認と回帰テスト合格を満たした後に実施する。
- current runtime の戻り値は `success: true` / `status: "disconnected"` / `indexedDocuments: 0`。

#### `AI_INDEX` の運用方針（Task08 再監査: 2026-03-19）

- `AI_INDEX` は long-running index job の実実装ではなく、**legacy guidance stub** として残置する。
- request 形状は `AIIndexRequest = { folderPath: string; recursive?: boolean }` を保持する。
- current runtime の戻り値は `success: true` + `indexedCount: 0` + `skippedCount: 0` + `errors: string[]`。
- 排他制御・ジョブ管理・message template 標準化は follow-up（`UT-RAG-08-010`, `UT-RAG-08-011`）で扱う。

#### Community IPC の運用方針（Task08 再監査: 2026-03-19）

- `COMMUNITY_GET_ALL` / `COMMUNITY_GET_BY_LEVEL` / `COMMUNITY_GET_BY_ID` / `COMMUNITY_GET_MEMBERS` / `COMMUNITY_GET_SUMMARY` / `COMMUNITY_SEARCH` は current runtime では guidance-only。
- すべての response は `ok: false` + `error.code: "NOT_IN_SCOPE"` + guidance message を返す。
- Renderer / Preload / system spec の応答形は `CommunityResult<T>` に統一する。

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
  - `providerId` は `"openai" | "anthropic" | "google" | "xai" | "openrouter"` のみ許可（正本: `packages/shared/src/types/llm/schemas/provider-registry.ts` の PROVIDER_CONFIGS）
- **プロバイダーID正本**: `packages/shared/src/types/llm/schemas/provider-registry.ts` の `PROVIDER_CONFIGS` が SSoT。`LLMProviderIdSchema` と `inferProviderId` は PROVIDER_CONFIGS から自動導出される（UT-LLM-MOD-01-005 で確立）

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

## Skill Creator Workflow Interaction Bridge（TASK-SDK-04）

> 実装同期: 2026-03-27
> ステータス: `implemented-with-followups`

### 概要

Task04 では Skill Creator runtime workflow の canonical state を Renderer へ橋渡しするため、public `skill-creator:*` IPC を 2 invoke + 1 push で追加した。owner は `SkillCreatorWorkflowEngine` に固定し、Renderer は snapshot host として扱う。

### チャネル一覧

| チャネル | 方向 | 用途 | Request | Response / Payload |
| --- | --- | --- | --- | --- |
| `skill-creator:get-workflow-state` | Renderer → Main | current workflow snapshot 取得 | `{ planId: string }` | `SkillCreatorWorkflowUiSnapshot` |
| `skill-creator:submit-user-input` | Renderer → Main | user input 回答送信 | `SkillCreatorUserInputSubmission` | `SkillCreatorWorkflowUiSnapshot` |
| `skill-creator:get-governance` | Renderer → Main | governance payload 取得 | `{ phase: SkillCreatorGovernancePhase }` | `IpcResult<GovernanceUiPayload>` |
| `skill-creator:workflow-state-changed` | Main → Renderer | snapshot 更新 push | none | `SkillCreatorWorkflowUiSnapshot` |

### current contract

| 層 | ファイル | 契約 |
| --- | --- | --- |
| Shared | `packages/shared/src/types/skillCreator.ts` | `SkillCreatorWorkflowUiSnapshot` / `SkillCreatorUserInputSubmission` / `SkillCreatorGovernancePhase` / `GovernanceUiPayload` を SSoT にする。`SkillCreatorUserInputKind` は `single_select` / `multi_select` / `free_text` / `secret` / `confirm` の 5 種 |
| Main IPC | `apps/desktop/src/main/ipc/creatorHandlers.ts` | sender validation + payload validation 後に facade へ委譲し、`skill-creator:get-governance` で runtime governance payload を返す |
| Preload | `apps/desktop/src/preload/skill-creator-api.ts` | `safeInvoke` / `safeOn` で public surface を公開し、`getGovernancePayload()` を含む |
| Renderer | `apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx` | phase summary / question host / provenance summary / handoff card を snapshot 表示する |

`SkillCreatorUserInputSubmission` は kind ごとに使用フィールドを切り替える。`multi_select` では `selectedOptionIds: string[]` を使い、Renderer は request kind 切替時に stale selection を持ち越さないことを要件とする。

### known follow-up

| ID | 内容 |
| --- | --- |
| `TASK-SDK-04-U1` | `submitUserInput()` が回答を phase semantics へ反映するよう是正する |
| `TASK-SDK-04-U3` | Phase 11/12/13 の evidence / path sync を current facts へ再同期する |

### completed remediation

| ID | 完了日 | 内容 |
| --- | --- | --- |
| `TASK-SDK-04-U2` | 2026-03-28 | `SkillLifecyclePanel` execute flow が `approvedSkillSpec` snapshot を参照するよう是正し、`planId` と execute payload の canonical binding drift を解消 |

---

## Slide IPC API（スライド同期）

> **Task 09 再監査同期**: 2026-03-19
> **実装同期**: 2026-03-22（TASK-IMP-SLIDE-RUNTIME-ALIGNMENT-001, #1363）
> **ステータス**: `implemented`（12チャネル実装済み、`registerSlideIpcHandlers()` は Main IPC index に接続済み）

### 概要

slide surface の runtime/auth-mode alignment では、Reveal.js HTML と `structure.md` の同期、watch lifecycle、runtime handoff を 12 チャネル（invoke 6 + push 6）で扱う。

### 実装アンカー

| 層 | ファイル | 役割 |
| --- | --- | --- |
| Main IPC | `apps/desktop/src/main/slide/ipc-handlers.ts` | slide invoke channel 境界 |
| Main runtime | `apps/desktop/src/main/slide/skill-executor.ts` | RuntimeResolver 統合点 |
| Main sync | `apps/desktop/src/main/slide/sync-manager.ts` | sync status / reverse-sync authority |
| Renderer UI | `apps/desktop/src/renderer/slide/SlideWorkspace.tsx` | user-facing status / guidance surface |
| Shared types | `packages/shared/src/slide/types.ts` | SyncStatus / SyncDirection / SkillExecutionResult 拡張点 |

### invoke チャネル（Renderer → Main）

| チャネル | 用途 | Request | Response |
| --- | --- | --- | --- |
| `slide:executePhase` | slide phase 実行 | `{ phase, projectPath }` | `SlideResponse<SkillExecutionResult>` |
| `slide:watch-start` | watch 開始 | `{ projectPath }` | `SlideResponse<{ watching: true }>` |
| `slide:watch-stop` | watch 停止 | `{ projectPath }` | `SlideResponse<void>` |
| `slide:sync-status` | status 取得 | `{ projectPath }` | `SlideResponse<{ status: SyncStatus, direction?: SyncDirection, watching?: boolean }>` |
| `slide:reverse-sync` | manual reverse-sync | `{ projectPath }` | `SlideResponse<SkillExecutionResult>` |
| `slide:cancel` | 実行キャンセル | none | `SlideResponse<void>` |

### push チャネル（Main → Renderer）

| チャネル | 用途 | Payload |
| --- | --- | --- |
| `slide:sync-status-changed` | sync 状態変化 | `{ status: SyncStatus, direction?: SyncDirection, watching?: boolean }` |
| `slide:sync-progress` | sync 進捗 | `{ percent: number, message: string }` |
| `slide:sync-error` | sync エラー | `{ code: string, message: string }` |
| `slide:execution-progress` | phase 実行進捗 | `{ phase: SkillPhase, progress: number }` |
| `slide:structureChanged` | structure file 変化 | `{ projectPath: string, changedAt: string }` |
| `slide:watch-status` | watcher 状態 | `{ watching: boolean, projectPath: string }` |

### 型定義

| 型名 | 種別 | 取りうる値 / 概要 |
| --- | --- | --- |
| `SyncStatus` | type | `synced` / `out-of-sync` / `syncing` / `error` |
| `SyncDirection` | type | `forward` / `reverse` |
| `SlideUIStatus` | derived type | `synced` / `running` / `degraded` / `guidance` |

### drift 解消記録（2026-03-22, TASK-IMP-SLIDE-RUNTIME-ALIGNMENT-001, #1363）

| ID | 旧 drift | 正本契約 | 状態 |
| --- | --- | --- | --- |
| D1 | `slide:startWatching` | `slide:watch-start` | 解消済み |
| D2 | `slide:stopWatching` | `slide:watch-stop` | 解消済み |
| D3 | `slide:getSyncStatus` | `slide:sync-status` | 解消済み |
| D4 | `slide:manualSync` | `slide:reverse-sync` | 解消済み |
| D5 | `slide:syncStatusChanged` / `slide:executionProgress` | `slide:sync-status-changed` / `slide:execution-progress` | 解消済み |
| D6 | `registerSlideIpcHandlers()` 未登録 | Main IPC index へ登録済みであること | 解消済み（`registerAllIpcHandlers()` 内で `registerSlideIpcHandlers()` を呼び出し） |

### セキュリティ順序

slide invoke channel はすべて次の順序を守る。

1. `validateIpcSender`
2. P42 3段バリデーション（型 / 空文字列 / trim 後空文字列）
3. path traversal guard
4. business logic 委譲

### エラーコード

| コード | 説明 | 備考 |
| --- | --- | --- |
| `VALIDATION_ERROR` | sender / payload / path 検証失敗 | secret 非露出 |
| `AUTHENTICATION_ERROR` | API key 不足または handoff 必要 | `guidance` で回復導線を返す |
| `SYNC_ERROR` | reverse-sync / watcher / file IO 失敗 | Renderer では degraded surface に正規化する |
| `AGENT_ERROR` | runtime 実行失敗 | `code` と `message` を sanitize して返す |

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
> 完了タスク: TASK-FIX-CONVERSATION-DB-ROBUSTNESS-001（2026-03-19）

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

1. `app.whenReady()` 直後に `initializeConversationDatabase()` で DB を初期化する
2. DB パスは `app.getPath('userData')/conversations.db`（旧: `~/.claude/conversations.db`）
3. `pragma("journal_mode = WAL")` で WAL モード設定
4. `CONVERSATION_DB_SCHEMA` DDL で `chat_sessions` + `chat_messages` テーブル + 4インデックスを作成
5. `ConversationRepository(db)` を生成
6. `registerAllIpcHandlers(mainWindow, conversationDb)` に DI で注入し、`registerConversationHandlers(repository)` で7チャンネルを登録

**Factory 関数パターン**: DB 初期化ロジックは `ipc/index.ts` の `registerAllIpcHandlers` から分離し、`initializeConversationDatabase()` Factory 関数に集約する。

**DI パターン**: `registerAllIpcHandlers(mainWindow, conversationDb?)` の第2引数として DB インスタンスを外部注入する。DB 未注入（`undefined`）時はフォールバックハンドラが登録される。

### Graceful Degradation

DB 初期化失敗時は `conversationDb` が `null` となり、`registerConversationFallbackHandlers()` で全7チャンネルに `DB_NOT_AVAILABLE`（ERR_4006）フォールバックを登録。S30 パターン準拠。

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

**Runtime lane 補助導線での利用ルール（TASK-RT-04）**:

| 項目 | 仕様 |
| --- | --- |
| 対象 UI | `apps/desktop/src/renderer/components/skill/ApiKeySettingsPanel.tsx` |
| 使用チャネル | `auth-key:exists`, `auth-key:set`, `auth-key:delete` |
| 削除後再判定 | `auth-key:delete` 成功後に `auth-key:exists` を再実行し、`env-fallback` の場合は `configured` を維持する |
| 境界 | `apiKey:*`（provider key）とは統合せず、`auth-key:*` の責務を維持する |

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
| Runtime lane 補助導線 (`ApiKeySettingsPanel`) が `auth-key:*` を再利用                         | completed  | TASK-RT-04                                            |
| `apiKey:save` / `apiKey:delete` 後に `LLMAdapterFactory.clearInstance(provider)` を実行      | completed  | TASK-FIX-APIKEY-CHAT-TOOL-INTEGRATION-001            |
| `llm:set-selected-config` で Renderer 選択状態を Main 側 `ai.chat` 実行経路へ同期            | completed  | TASK-FIX-APIKEY-CHAT-TOOL-INTEGRATION-001            |


---

## 分割ファイル一覧

| ファイル | カテゴリ | 含まれるセクション |
| -------- | -------- | ------------------ |
| [api-ipc-system-skill-creator.md](api-ipc-system-skill-creator.md) | Skill Creator Runtime Public IPC（前半） | Skill Creator Runtime Public IPC（UT-IMP-RUNTIME-SKILL-CREATOR-IPC-WIRING-001）前半 |
| [api-ipc-system-skill-creator-part2.md](api-ipc-system-skill-creator-part2.md) | ChatPanel / Console Safety / AI Provider / External API（後半） | ChatPanel IPC、Advanced Console Safety、AIプロバイダーAPI連携、execute() 永続化統合、External API Support、IPC Handler Lifecycle |

