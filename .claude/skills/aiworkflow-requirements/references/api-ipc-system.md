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

**セキュリティ設計**:

| 項目           | 対策                                              |
| -------------- | ------------------------------------------------- |
| 暗号化         | Electron safeStorage.encryptString()              |
| Renderer 分離  | getKey() は Renderer 非公開（Main Process のみ）  |
| IPC 検証       | withValidation() ラッパーで sender 検証           |
| フォーマット検証 | `sk-ant-api` プレフィックスパターン              |
| ログ出力       | キー値は一切ログに出力しない                      |

### 通知・履歴検索 IPC チャネル（TASK-UI-01-STORE-IPC-ARCHITECTURE）

UI基盤タスクで追加した通知・履歴検索の IPC 契約。`renderer -> preload -> main` の3層で同一チャンネル名を使用する。

**実装ファイル**:

- チャンネル定義: `apps/desktop/src/preload/channels.ts`
- ハンドラー: `apps/desktop/src/main/ipc/notificationHandlers.ts`, `apps/desktop/src/main/ipc/historySearchHandlers.ts`
- 登録: `apps/desktop/src/main/ipc/index.ts`
- Preload API: `apps/desktop/src/preload/api/notification-api.ts`
- 共有型: `packages/shared/src/types/history.ts`

#### チャンネル一覧

| チャネル | メソッド | 引数 | 戻り値 | 備考 |
| --- | --- | --- | --- | --- |
| `notification:get-history` | invoke | `{ limit?: number; offset?: number }` | `{ success, data?: { notifications, totalCount }, error? }` | 通知履歴取得 |
| `notification:mark-read` | invoke | `{ notificationId: string }` | `{ success, data?: { updated: boolean }, error? }` | 既読化 |
| `notification:mark-all-read` | invoke | なし | `{ success, data?: { updatedCount: number }, error? }` | 全件既読 |
| `notification:clear` | invoke | なし | `{ success, data?: { deletedCount: number }, error? }` | 履歴削除 |
| `notification:new` | on | `{ notification: Notification }` | Event push | Main -> Renderer のみ（購読は unsubscribe を返す） |
| `history:search` | invoke | `{ query, filter, limit, offset }` | `{ success, data?: { items, totalCount, hasMore }, error? }` | 履歴検索 |
| `history:get-stats` | invoke | なし | `{ success, data?: { chat, file, skill, total }, error? }` | 統計取得 |

#### 実装反映（TASK-UI-01-C / 2026-03-05）

| 観点 | 実装内容 | 実装ファイル |
| --- | --- | --- |
| Push配信の安全化 | `emitNotificationNew(mainWindow, notification)` を追加。`BrowserWindow` / `webContents` の破棄状態を先に検証し、不正状態では `false` を返して送信を抑止 | `apps/desktop/src/main/ipc/notificationHandlers.ts` |
| timestamp正規化 | `notification:new` 配信前に `timestamp` を ISO 8601 へ正規化（不正値は `new Date().toISOString()` へフォールバック） | `apps/desktop/src/main/ipc/notificationHandlers.ts` |
| API契約の往復整合 | Preload `notification.onNew()` は `callback` 登録時に unsubscribe 関数を返し、Renderer側の購読解除を可能にする | `apps/desktop/src/preload/api/notification-api.ts` |
| 主動作の委譲契約 | `notification:mark-all-read` / `notification:clear` の委譲を Main テストで固定化し、戻り値（`updatedCount`/`deletedCount`）を契約化 | `apps/desktop/src/main/ipc/__tests__/notificationHandlers.test.ts` |

#### 入力検証ルール

| 対象 | 検証 |
| --- | --- |
| `notificationId` | P42準拠（`typeof` -> 空文字 -> `trim()`） |
| `query` | `string` 型必須（空/空白は全件検索として許容） |
| `filter` | `all/chat/file/skill` の許可値 |
| sender | `validateIpcSender` による許可ウィンドウ検証 |

#### エラーハンドリング

- 送信元不正: `toIPCValidationError` を返却
- 実行時例外: `sanitizeErrorMessage(error, fallback)` で内部情報（パス/スタック/機密値）をマスク

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

### TASK-UI-01-STORE-IPC-ARCHITECTURE（2026-03-05完了）

| 項目 | 内容 |
| --- | --- |
| タスクID | TASK-UI-01-STORE-IPC-ARCHITECTURE |
| 反映対象 | `notification:*` / `history:search` / `history:get-stats` |
| 主要変更 | 新規IPC 7チャネル、Preload API追加、Main sender検証・入力検証・エラーサニタイズ適用 |
| 関連ドキュメント | `docs/30-workflows/completed-tasks/task-056-ui-01-store-ipc-architecture/outputs/phase-12/spec-update-summary.md` |

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
| v1.4.0     | 2026-03-05 | TASK-UI-01-STORE-IPC-ARCHITECTURE 反映: 通知IPC（`notification:get-history/mark-read/mark-all-read/clear/new`）と履歴検索IPC（`history:search/get-stats`）を追加。P42入力検証・sender検証・`sanitizeErrorMessage` 適用境界を明記 |
| v1.3.0     | 2026-03-04 | TASK-FIX-SKILL-AUTH-PREFLIGHT-GUARD-001 反映: `auth-key:exists` 判定契約に env fallback（`ANTHROPIC_API_KEY`）を追加。Renderer preflight と Main 実行時判定の整合方針を明文化 |
| v1.2.0     | 2026-02-08 | TASK-FIX-16-1: Claude Agent SDK認証キー管理IPCチャネル4種追加（auth-key:set/exists/validate/delete） |
| v1.1.0     | 2026-01-26 | spec-guidelines.md準拠: コードブロックを表形式に変換 |
| v1.0.0     | -          | 初版作成                                           |
