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

**セキュリティ設計**:

| 項目           | 対策                                              |
| -------------- | ------------------------------------------------- |
| 暗号化         | Electron safeStorage.encryptString()              |
| Renderer 分離  | getKey() は Renderer 非公開（Main Process のみ）  |
| IPC 検証       | withValidation() ラッパーで sender 検証           |
| フォーマット検証 | `sk-ant-api` プレフィックスパターン              |
| ログ出力       | キー値は一切ログに出力しない                      |

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

## 変更履歴

| バージョン | 日付       | 変更内容                                           |
| ---------- | ---------- | -------------------------------------------------- |
| v1.2.0     | 2026-02-08 | TASK-FIX-16-1: Claude Agent SDK認証キー管理IPCチャネル4種追加（auth-key:set/exists/validate/delete） |
| v1.1.0     | 2026-01-26 | spec-guidelines.md準拠: コードブロックを表形式に変換 |
| v1.0.0     | -          | 初版作成                                           |
