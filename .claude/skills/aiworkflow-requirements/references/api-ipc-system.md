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

- **Store**: Zustand chatSlice
- **状態**: currentProviderId（"openai" | "anthropic" | "google" | "xai"）、currentModelId
- **初期値**: OpenAI gpt-5.2-instant
- **切り替え**: リアルタイム（確認ダイアログなし）

### セキュリティ考慮事項

| 項目                       | 対策                                          |
| -------------------------- | --------------------------------------------- |
| APIキー保護                | Electron SafeStorageで暗号化保存              |
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

| チャネル               | 方向            | 用途                 | Payload                              |
| ---------------------- | --------------- | -------------------- | ------------------------------------ |
| `slide:sync-status`    | Main → Renderer | 同期状態通知         | `{ status: SyncStatus, direction: SyncDirection }` |
| `slide:sync-progress`  | Main → Renderer | 同期進捗通知         | `{ percent: number, message: string }` |
| `slide:reverse-sync`   | Renderer → Main | 逆同期手動トリガー   | `{ projectPath: string }`            |
| `slide:sync-error`     | Main → Renderer | 同期エラー通知       | `{ code: string, message: string }`  |
| `slide:watch-start`    | Renderer → Main | ファイル監視開始     | `{ projectPath: string }`            |
| `slide:watch-stop`     | Renderer → Main | ファイル監視停止     | `{ projectPath: string }`            |

### 型定義

#### 基本型

| 型名          | 種別 | 説明     | 取りうる値                                |
| ------------- | ---- | -------- | ----------------------------------------- |
| SyncStatus    | type | 同期状態 | `idle`, `syncing`, `synced`, `error`      |
| SyncDirection | type | 同期方向 | `forward`（順方向）, `reverse`（逆方向）  |

#### SyncErrorPayload インターフェース

同期エラー時に使用するペイロード構造。

| フィールド | 型      | 必須 | 説明                                                                              |
| ---------- | ------- | ---- | --------------------------------------------------------------------------------- |
| code       | string  | Yes  | エラーコード（`AGENT_ERROR`, `FILE_ERROR`, `TIMEOUT`, `VALIDATION_ERROR`のいずれか） |
| message    | string  | Yes  | 人間可読なエラーメッセージ                                                        |
| details    | unknown | No   | 追加の詳細情報（デバッグ用）                                                      |

### エラーコード

| コード             | 説明                       | 対処                           |
| ------------------ | -------------------------- | ------------------------------ |
| `AGENT_ERROR`      | Agent SDK呼び出し失敗      | API接続確認、リトライ          |
| `FILE_ERROR`       | ファイル読み書き失敗       | パーミッション確認             |
| `TIMEOUT`          | 同期タイムアウト（30秒）   | 処理の再試行                   |
| `VALIDATION_ERROR` | レスポンス形式不正         | Agent出力確認                  |

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

| チャネル          | メソッド | 引数                   | 戻り値                          | 公開先    |
| ----------------- | -------- | ---------------------- | ------------------------------- | --------- |
| `apiKey:save`     | invoke   | `{ provider, apiKey }` | `IPCResponse<void>`             | Renderer  |
| `apiKey:delete`   | invoke   | `{ provider }`         | `IPCResponse<void>`             | Renderer  |
| `apiKey:validate` | invoke   | `{ provider, apiKey }` | `IPCResponse<ValidationResult>` | Renderer  |
| `apiKey:list`     | invoke   | なし                   | `IPCResponse<ProviderStatus[]>` | Renderer  |
| `apiKey:get`      | invoke   | `{ provider }`         | `string \| null`                | Main Only |

**セキュリティ注意**: `apiKey:get` はRenderer Processに公開しない（Main Process内部使用のみ）

### Claude Agent SDK 認証キー管理 IPC チャネル（TASK-FIX-16-1）

Claude Agent SDK で使用する Anthropic API Key の管理 IPC チャネル。

**実装ファイル**:

- ハンドラー: `apps/desktop/src/main/ipc/authKeyHandlers.ts`
- サービス: `apps/desktop/src/main/services/auth/AuthKeyService.ts`
- チャンネル定義: `apps/desktop/src/preload/channels.ts`
- Preload API: `apps/desktop/src/preload/authKeyApi.ts`

| チャネル          | メソッド | 引数             | 戻り値                      | 公開先    |
| ----------------- | -------- | ---------------- | --------------------------- | --------- |
| `auth-key:set`    | invoke   | `{ key }`        | `AuthKeySetResponse`        | Renderer  |
| `auth-key:exists` | invoke   | なし             | `AuthKeyExistsResponse`     | Renderer  |
| `auth-key:validate` | invoke | `{ key }`        | `AuthKeyValidateResponse`   | Renderer  |
| `auth-key:delete` | invoke   | なし             | `AuthKeyDeleteResponse`     | Renderer  |
| (getKey)          | -        | -                | `string \| null`            | Main Only |

**型定義**:

| 型名                     | フィールド                  | 説明                     |
| ------------------------ | --------------------------- | ------------------------ |
| `AuthKeySetRequest`      | `key: string`               | API Key                  |
| `AuthKeySetResponse`     | `success: boolean, error?`  | 設定結果                 |
| `AuthKeyExistsResponse`  | `exists: boolean`           | キー存在確認             |
| `AuthKeyValidateRequest` | `key: string`               | 検証対象キー             |
| `AuthKeyValidateResponse`| `valid: boolean, error?`    | 検証結果                 |
| `AuthKeyDeleteResponse`  | `success: boolean, error?`  | 削除結果                 |

**`auth-key:exists` 判定契約（TASK-FIX-SKILL-AUTH-PREFLIGHT-GUARD-001）**:

| 項目 | 判定仕様 |
| --- | --- |
| 1次判定 | `AuthKeyService.hasKey()`（safeStorage 保存キー） |
| 2次判定 | `process.env.ANTHROPIC_API_KEY` が非空文字列か |
| 戻り値 | いずれかが true の場合 `{ exists: true }` |
| 目的 | Renderer preflight と Main 実行時判定の乖離を防止 |

### 実装状況（auth-key ライフサイクル）

| 実装項目 | ステータス | 関連タスク |
| --- | --- | --- |
| `registerAllIpcHandlers` で `registerAuthKeyHandlers` を起動時/再登録時に実行 | completed | TASK-FIX-AUTH-KEY-HANDLER-REGISTRATION-001 |
| `unregisterAllIpcHandlers` で `unregisterAuthKeyHandlers` を解除時に実行 | completed | TASK-FIX-AUTH-KEY-HANDLER-REGISTRATION-001 |

### 関連タスク

| タスクID | 概要 | ステータス |
| --- | --- | --- |
| TASK-FIX-SKILL-AUTH-PREFLIGHT-GUARD-001 | `auth-key:exists` 判定契約の env fallback 追加 | 完了 |
| TASK-FIX-AUTH-KEY-HANDLER-REGISTRATION-001 | auth-key 4チャネルの Main 登録漏れと解除連携を修正 | 完了 |

**セキュリティ設計**:

| 項目           | 対策                                              |
| -------------- | ------------------------------------------------- |
| 暗号化         | Electron safeStorage.encryptString()              |
| Renderer 分離  | getKey() は Renderer 非公開（Main Process のみ）  |
| IPC 検証       | withValidation() ラッパーで sender 検証           |
| フォーマット検証 | `sk-ant-api` プレフィックスパターン              |
| ログ出力       | キー値は一切ログに出力しない                      |

### Notification / HistorySearch IPC チャネル（TASK-UI-01-C）

Notification ドメインと HistorySearch ドメインの統合で追加したIPC契約。

**実装ファイル**:

- ハンドラー: `apps/desktop/src/main/ipc/notificationHandlers.ts`, `apps/desktop/src/main/ipc/historySearchHandlers.ts`
- 登録: `apps/desktop/src/main/ipc/index.ts`
- チャンネル定義: `apps/desktop/src/preload/channels.ts`
- Preload API: `apps/desktop/src/preload/index.ts`
- 型定義: `apps/desktop/src/preload/types.ts`

| チャネル | メソッド | 引数 | 戻り値 | 備考 |
| --- | --- | --- | --- | --- |
| `notification:get-history` | invoke | `{ limit?: number, offset?: number }` | `NotificationGetHistoryResponse` | sender検証必須 |
| `notification:mark-read` | invoke | `{ id: string }` | `NotificationMutationResponse` | 認証必須 |
| `notification:mark-all-read` | invoke | なし | `NotificationMutationResponse` | 認証必須 |
| `notification:clear` | invoke | `{ onlyRead?: boolean }` | `NotificationMutationResponse` | 認証必須 |
| `notification:new` | on | `NotificationHistoryItem` | event | Main -> Renderer |
| `history:search` | invoke | `HistorySearchRequest` | `HistorySearchResponse` | `query` 必須 |
| `history:get-stats` | invoke | なし | `HistorySearchStatsResponse` | 集計返却 |

**セキュリティ契約**:

| 項目 | 契約 |
| --- | --- |
| sender検証 | `event.sender === mainWindow.webContents` かつ URL を検証 |
| 更新系認証 | `notification:mark-read` / `mark-all-read` / `clear` は未認証時 `AUTH_REQUIRED` |
| 入力検証 | `notification id` と `history query` を必須化 |
| 公開境界 | `ALLOWED_INVOKE_CHANNELS` / `ALLOWED_ON_CHANNELS` に明示登録 |

### IPC エラーコード

| コード               | 説明                 | 対処                         |
| -------------------- | -------------------- | ---------------------------- |
| `INVALID_SENDER`     | 不正なリクエスト元   | DevTools等からの不正アクセス |
| `PROVIDER_NOT_FOUND` | 未対応プロバイダー   | サポート対象を確認           |
| `VALIDATION_FAILED`  | バリデーションエラー | 入力値を確認                 |
| `STORAGE_ERROR`      | ストレージ操作失敗   | safeStorage利用可否確認      |
| `NETWORK_ERROR`      | ネットワーク障害     | 接続状態を確認               |

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

| メソッド        | 説明                               | 戻り値                            |
| --------------- | ---------------------------------- | --------------------------------- |
| `extract()`     | 単一チャンクからエンティティ抽出   | `Result<ExtractionResult, Error>` |
| `extractBatch()`| 複数チャンクからバッチ抽出         | `Result<BatchExtractionResult, Error>` |
| `mergeEntities()`| 抽出結果のマージ（重複除去）      | `ExtractedEntity[]`               |

### EntityExtractionOptions

| オプション           | 型        | デフォルト | 説明                        |
| -------------------- | --------- | ---------- | --------------------------- |
| types                | string[]  | 全タイプ   | 抽出対象のエンティティタイプ |
| minConfidence        | number    | 0.5        | 最小信頼度閾値              |
| maxEntitiesPerChunk  | number    | 20         | チャンクあたり最大抽出数    |
| minNameLength        | number    | 2          | 最小名前長                  |
| generateDescriptions | boolean   | true       | 説明生成（LLMのみ）         |
| useLLM               | boolean   | true       | LLM使用フラグ               |

### エラーハンドリング

| エラークラス       | 説明                     | 対処                         |
| ------------------ | ------------------------ | ---------------------------- |
| `LLMProviderError` | LLM API呼び出し失敗      | ルールベースにフォールバック |
| `JsonParseError`   | LLMレスポンスのJSON不正  | ルールベースにフォールバック |
| `ValidationError`  | 入力バリデーション失敗   | エラーメッセージを返却       |

---

## 関連ドキュメント

- [APIエンドポイント概要](./api-endpoints.md)
- [認証・プロフィールIPC](./api-ipc-auth.md)
- [Agent Dashboard IPC](./api-ipc-agent.md)
- [RAGサービス群](./rag-services.md)

---

## 完了タスク

### TASK-UI-01-C-NOTIFICATION-HISTORY-DOMAIN（2026-03-05完了）

| 項目 | 内容 |
| --- | --- |
| タスクID | TASK-UI-01-C-NOTIFICATION-HISTORY-DOMAIN |
| 反映対象 | Notification / HistorySearch IPC契約 |
| 主要変更 | history 2チャネル + notification 5チャネルを追加し、sender検証・認証ゲート・入力検証を標準化 |
| 関連ドキュメント | `docs/30-workflows/completed-tasks/task-056c-notification-history-domain/outputs/phase-12/spec-update-summary.md` |

---

### TASK-FIX-AUTH-KEY-HANDLER-REGISTRATION-001（2026-03-05完了）

| 項目 | 内容 |
| --- | --- |
| タスクID | TASK-FIX-AUTH-KEY-HANDLER-REGISTRATION-001 |
| 反映対象 | auth-key IPC 登録/解除ライフサイクル |
| 主要変更 | `registerAllIpcHandlers`/`unregisterAllIpcHandlers` に auth-key ハンドラ接続を追加 |
| 検証 | `ipc-double-registration` と `authKeyHandlers` の回帰テスト、および Renderer preflight 関連テストが PASS |
| 関連ドキュメント | `docs/30-workflows/completed-tasks/01-TASK-FIX-AUTH-KEY-HANDLER-REGISTRATION-001/outputs/phase-12/spec-update-summary.md` |

#### 実装時の苦戦箇所と再発防止

| 項目 | 内容 |
| --- | --- |
| 苦戦箇所1 | `auth-key:*` 4チャネル自体は定義済みだったため、runtime 配線漏れが発見されにくかった |
| 原因 | ハンドラ実装の有無と `ipc/index.ts` の登録経路検証を分離して進めた |
| 対処 | `registerAllIpcHandlers` / `unregisterAllIpcHandlers` を対称更新し、再登録サイクルテストを追加 |
| 標準ルール | auth 系 IPC は「チャンネル定義・ハンドラ実装・register/unregister 配線・回帰テスト」の4点同時確認を必須化する |

#### 同種課題の簡潔解決チェック（5分）

| 項目 | 内容 |
| --- | --- |
| 症状 | `No handler registered` または `apps/desktop` の全量テストが `SIGTERM` で中断 |
| 最短対応 | 1) `register/unregister` 対称更新 2) `authKeyHandlers`/`ipc-double-registration` 回帰追加 3) 全量実行が不安定な場合は `vitest run <対象>` へ分割 4) `task-workflow` と `lessons-learned` へ同値転記 |
| 検証 | `pnpm --filter @repo/desktop test:run <対象テスト>` PASS + `pnpm --filter @repo/desktop typecheck` PASS |
| 反映先 | `api-ipc-system.md` / `task-workflow.md` / `lessons-learned.md` |

#### 関連未タスク

| タスクID | 概要 | 参照 |
| --- | --- | --- |
| UT-IMP-DESKTOP-TESTRUN-SIGTERM-FALLBACK-GUARD-001 | `apps/desktop test:run` の `SIGTERM` 中断時フォールバック（失敗ログ固定 + 分割実行 + 3仕様同期）を標準化 | `docs/30-workflows/completed-tasks/unassigned-task/task-imp-desktop-testrun-sigterm-fallback-guard-001.md` |

---

### TASK-FIX-SKILL-AUTH-PREFLIGHT-GUARD-001（2026-03-04完了）

| 項目 | 内容 |
| --- | --- |
| タスクID | TASK-FIX-SKILL-AUTH-PREFLIGHT-GUARD-001 |
| 反映対象 | `auth-key:exists` 判定契約 |
| 主要変更 | store キー有無に加え `ANTHROPIC_API_KEY` env fallback を仕様化 |
| 関連ドキュメント | `docs/30-workflows/TASK-FIX-SKILL-AUTH-PREFLIGHT-GUARD-001/outputs/phase-12/spec-update-summary.md` |

---

## 変更履歴

| バージョン | 日付       | 変更内容                                           |
| ---------- | ---------- | -------------------------------------------------- |
| v1.4.0     | 2026-03-05 | TASK-UI-01-C-NOTIFICATION-HISTORY-DOMAIN 反映: Notification/HistorySearch IPC（history 2 + notification 5）を追加。sender検証、更新系認証ゲート、入力検証、preload公開境界を契約化 |
| v1.5.2     | 2026-03-05 | `UT-IMP-DESKTOP-TESTRUN-SIGTERM-FALLBACK-GUARD-001` を関連未タスクへ登録。`apps/desktop test:run` の `SIGTERM` 中断時に「失敗ログ固定 + `vitest run <対象>` 分割実行 + 3仕様同期」を標準運用として追跡可能化 |
| v1.5.1     | 2026-03-05 | TASK-FIX-AUTH-KEY-HANDLER-REGISTRATION-001 追補: 「同種課題の簡潔解決チェック（5分）」を追加し、runtime 配線漏れと `SIGTERM` 中断時の分割回帰テスト運用を標準化 |
| v1.5.0     | 2026-03-05 | TASK-FIX-AUTH-KEY-HANDLER-REGISTRATION-001 追補: 完了タスク節へ「実装時の苦戦箇所と再発防止」を追加し、auth-key 既存チャネルで発生しやすい runtime 配線漏れの防止手順を明文化 |
| v1.4.0     | 2026-03-05 | TASK-FIX-AUTH-KEY-HANDLER-REGISTRATION-001 反映: auth-key ライフサイクル実装状況テーブルを追加し、`registerAllIpcHandlers` / `unregisterAllIpcHandlers` の接続責務を明文化。完了タスク台帳へ同タスクを追加 |
| v1.3.0     | 2026-03-04 | TASK-FIX-SKILL-AUTH-PREFLIGHT-GUARD-001 反映: `auth-key:exists` 判定契約に env fallback（`ANTHROPIC_API_KEY`）を追加。Renderer preflight と Main 実行時判定の整合方針を明文化 |
| v1.2.0     | 2026-02-08 | TASK-FIX-16-1: Claude Agent SDK認証キー管理IPCチャネル4種追加（auth-key:set/exists/validate/delete） |
| v1.1.0     | 2026-01-26 | spec-guidelines.md準拠: コードブロックを表形式に変換 |
| v1.0.0     | -          | 初版作成                                           |
