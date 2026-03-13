# Agent SDK Executor 仕様 / core specification

> 親仕様書: [interfaces-agent-sdk-executor.md](interfaces-agent-sdk-executor.md)
> 役割: core specification

## 概要

SkillExecutor、PermissionResolverに関する型定義とAPI仕様。
実行エンジン・権限確認機能の実装時に参照する。

---

## SkillService 統合（TASK-FIX-7-1）

> **実装完了**: 2026-02-11（TASK-FIX-7-1）
> **参照**: [arch-electron-services.md](./arch-electron-services.md) SkillService Facade API

### 概要

SkillExecutor は SkillService を通じて呼び出される。SkillService は Facade パターンでスキル管理機能を提供し、実行処理を SkillExecutor に委譲する。

### 統合アーキテクチャ

| コンポーネント | 責務 | 呼び出し関係 |
|---------------|------|-------------|
| SkillService | スキル管理 Facade（スキャン、インポート、実行） | → SkillExecutor |
| SkillExecutor | スキル実行エンジン | → Claude Agent SDK |
| skillHandlers | IPC ハンドラー登録、DI 設定 | → SkillService, SkillExecutor |

### Setter Injection パターン

SkillExecutor は `BrowserWindow` を必要とするため、ハンドラー登録時に遅延生成され、`setSkillExecutor()` で SkillService に注入される。

#### 初期化フロー

| ステップ | 処理 | 実装ファイル |
|----------|------|-------------|
| 1 | `registerSkillHandlers(mainWindow, skillService, authKeyService)` | `main/ipc/index.ts` |
| 2 | `new SkillExecutor(mainWindow, permissionStore, authKeyService)` | `skillHandlers.ts` |
| 3 | `skillService.setSkillExecutor(executor)` | `skillHandlers.ts` |
| 4 | IPC ハンドラー登録（`skill:execute` 等） | `skillHandlers.ts` |

#### SkillService API（実行関連）

| メソッド | 引数 | 戻り値 | 説明 |
|----------|------|--------|------|
| `setSkillExecutor` | `executor: SkillExecutor` | `void` | SkillExecutor を設定 |
| `executeSkill` | `skillId: string, params?: ExecuteParams` | `Promise<SkillExecutionResponse>` | SkillExecutor.execute() に委譲 |

### 設計根拠

| 観点 | 説明 |
|------|------|
| 遅延初期化 | SkillExecutor は mainWindow を必要とするため、アプリ起動後に生成 |
| 単一責務 | SkillService はスキル管理、SkillExecutor は実行ロジックに責務を分離 |
| テスタビリティ | SkillExecutor をモックに差し替え可能（DI パターン） |
| Facade 統一 | 外部からは SkillService のみを参照、内部実装を隠蔽 |

### 型変換パターン（Skill → SkillMetadata）

IPC ハンドラーとSkillExecutor間で型が異なるため、明示的な変換が必要。

#### 問題背景

| レイヤー | 使用型 | 説明 |
|----------|--------|------|
| IPC ハンドラー / Store | `Skill` | UI 向け型（インポート済みスキル） |
| SkillExecutor | `SkillMetadata` | SDK 実行向け型（詳細メタデータ） |

#### 型プロパティの対応関係

| Skill プロパティ | SkillMetadata プロパティ | 変換内容 |
|-----------------|-------------------------|----------|
| id | name | スキル識別子（Skill.id → SkillMetadata.name） |
| name | name | スキル名（同一フィールド、用途が異なる） |
| description | description | 説明文（直接マッピング） |
| path | path | ファイルパス（直接マッピング） |
| - | version | デフォルト値 "1.0.0"（Skill に存在しない） |
| - | author | デフォルト値 "unknown"（Skill に存在しない） |

#### 変換実装パターン

| 要素 | 実装 |
|------|------|
| 変換場所 | `SkillService.executeSkill()` 内部 |
| 変換関数 | インライン変換（専用関数不要の小規模変換） |
| デフォルト値 | version: "1.0.0", author: "unknown" |

#### 注意事項

| 項目 | 説明 |
|------|------|
| 型安全性 | 変換時は必須プロパティの存在を事前確認 |
| デフォルト値 | 未設定プロパティには適切なデフォルト値を設定 |
| 将来の互換性 | 型定義変更時は変換ロジックも更新が必要 |

---

## SkillExecutor 型定義（TASK-3-1-A）

Claude Agent SDK の `query()` API を使用してスキルを実行し、ストリーミングレスポンスを Renderer Process に配信する実行エンジン。

### 概要

| 項目           | 内容                                                    |
| -------------- | ------------------------------------------------------- |
| 実装ファイル   | `apps/desktop/src/main/services/skill/SkillExecutor.ts` |
| 型定義         | `packages/shared/src/types/skill-execution.ts`          |
| IPC チャンネル | `skill:stream` (Main → Renderer)                        |
| SDK 依存       | `@anthropic-ai/claude-agent-sdk`                        |
| 認証依存       | `IAuthKeyService` (DI via constructor) TASK-FIX-16-1    |

### アーキテクチャ

SkillExecutorは、Main ProcessとRenderer Process間でIPCを介してストリーミング通信を行う。

#### プロセス間通信構造

| レイヤー         | コンポーネント       | 役割                                   |
| ---------------- | -------------------- | -------------------------------------- |
| Renderer Process | React UI             | ユーザーインターフェース               |
| Renderer Process | onSkillStream        | ストリームリスナー                     |
| IPC              | skill:stream         | Main → Renderer へのメッセージ配信     |
| Main Process     | SkillExecutor        | スキル実行管理（execute, abort等）     |
| Main Process     | Claude Agent SDK     | query().stream() によるAPI呼び出し     |

#### データフロー

1. Renderer ProcessのReact UIがスキル実行をリクエスト
2. Main ProcessのSkillExecutorがClaude Agent SDKを呼び出し
3. SDKからのストリーミングレスポンスをIPC経由でRendererに配信
4. React UIのonSkillStreamリスナーがメッセージを受信・表示

### 型定義

#### ExecutionState

実行状態を表す列挙型。

| 値          | 説明         |
| ----------- | ------------ |
| `pending`   | 実行待ち     |
| `running`   | 実行中       |
| `completed` | 完了         |
| `aborted`   | ユーザー中断 |
| `error`     | エラー発生   |

#### SkillExecutionRequest

スキル実行リクエスト（Renderer → Main）。

| プロパティ  | 型       | 必須 | 説明                       |
| ----------- | -------- | ---- | -------------------------- |
| `prompt`      | `string`               | ✓    | 実行プロンプト                               |
| `skillId`     | `string`               | ✓    | スキルID                                     |
| `timeout`     | `number`               | -    | タイムアウト (ms)                            |
| `sessionId`   | `string`               | -    | セッションID（会話継続用）                   |
| `retryConfig` | `Partial<RetryConfig>` | -    | リトライ設定（部分指定可能、デフォルト値あり） |

#### SkillExecutionResponse

スキル実行レスポンス（Main → Renderer）。

| プロパティ    | 型                    | 必須 | 説明                 |
| ------------- | --------------------- | ---- | -------------------- |
| `executionId` | `string`              | ✓    | 実行ID（UUID）       |
| `success`     | `boolean`             | ✓    | 成功/失敗フラグ      |
| `error`       | `SkillExecutionError` | -    | エラー情報（失敗時） |

#### SkillStreamMessage

ストリーミングメッセージ（Main → Renderer）。

| プロパティ    | 型                       | 必須 | 説明                 |
| ------------- | ------------------------ | ---- | -------------------- |
| `executionId` | `string`                 | ✓    | 実行ID               |
| `id`          | `string`                 | ✓    | メッセージID（UUID） |
| `type`        | `SkillStreamMessageType` | ✓    | メッセージ種別       |
| `content`     | `string`                 | ✓    | メッセージ内容       |
| `timestamp`   | `number`                 | ✓    | タイムスタンプ       |
| `isComplete`  | `boolean`                | ✓    | 完了フラグ           |

#### SkillStreamMessageType

| 値         | 説明               |
| ---------- | ------------------ |
| `text`     | テキストメッセージ |
| `tool_use` | ツール使用         |
| `error`    | エラーメッセージ   |
| `complete` | 完了通知           |
| `retry`    | リトライ通知       |

#### SkillExecutionError

| プロパティ | 型                        | 必須 | 説明             |
| ---------- | ------------------------- | ---- | ---------------- |
| `code`     | `SkillExecutionErrorCode` | ✓    | エラーコード     |
| `message`  | `string`                  | ✓    | エラーメッセージ |
| `details`  | `unknown`                 | -    | 詳細情報         |

#### SkillExecutionErrorCode

| コード                    | 説明                                         |
| ------------------------- | -------------------------------------------- |
| `MAX_CONCURRENT_EXCEEDED` | 同時実行数超過                               |
| `ABORTED`                 | ユーザーによる中断                           |
| `TIMEOUT`                 | タイムアウト                                 |
| `EXECUTION_FAILED`        | 実行失敗                                     |
| `AUTHENTICATION_ERROR`    | 認証エラー（API Key 未設定・無効）TASK-FIX-16-1 |

#### ExecutionInfo

実行情報（状態確認用）。

| プロパティ    | 型               | 必須 | 説明               |
| ------------- | ---------------- | ---- | ------------------ |
| `id`          | `string`         | ✓    | 実行ID             |
| `skillId`     | `string`         | ✓    | スキルID           |
| `state`       | `ExecutionState` | ✓    | 実行状態           |
| `startedAt`   | `number`         | ✓    | 開始タイムスタンプ |
| `completedAt` | `number`         | -    | 完了タイムスタンプ |

### API リファレンス

#### SkillExecutor クラス

| メソッド              | シグネチャ                                            | 説明               |
| --------------------- | ----------------------------------------------------- | ------------------ |
| `execute`             | `(request, skill) => Promise<SkillExecutionResponse>` | スキル実行         |
| `abort`               | `(executionId: string) => boolean`                    | 実行中断           |
| `getActiveExecutions` | `() => ExecutionInfo[]`                               | アクティブ実行一覧 |
| `getExecutionStatus`  | `(executionId: string) => ExecutionInfo \| undefined` | 実行状態取得       |

### IPC チャンネル（SkillExecutor）

| チャンネル     | 方向            | 説明               |
| -------------- | --------------- | ------------------ |
| `skill:stream` | Main → Renderer | ストリーミング配信 |

### 設定定数

| 定数                        | 値      | 説明                         |
| --------------------------- | ------- | ---------------------------- |
| `DEFAULT_TOOLS`             | 5ツール | Read, Edit, Bash, Glob, Grep |
| `DEFAULT_TIMEOUT_MS`        | `30000` | デフォルトタイムアウト (ms)  |
| `MAX_CONCURRENT_EXECUTIONS` | `5`     | 最大同時実行数               |
| `HISTORY_RETENTION_MS`      | `60000` | 履歴保持期間 (ms)            |

### AuthKeyService 統合（TASK-FIX-16-1）

SkillExecutor は Claude Agent SDK の `query()` 呼び出し時に、Anthropic API Key を `IAuthKeyService` 経由で取得する。

| 項目             | 内容                                                      |
| ---------------- | --------------------------------------------------------- |
| DI パラメータ    | `constructor(mainWindow, permissionStore?, authKeyService?)` |
| キー取得優先順位 | 1. AuthKeyService.getKey() 2. ANTHROPIC_API_KEY 環境変数  |
| キー未設定時     | `AUTHENTICATION_ERROR` エラーをスロー                     |

### IAuthKeyService インターフェース

認証キー管理サービスの抽象インターフェース。DI により SkillExecutor に注入される。

| メソッド       | シグネチャ                                      | 説明                                       |
| -------------- | ----------------------------------------------- | ------------------------------------------ |
| `setKey`       | `(apiKey: string) => Promise<void>`             | キーを暗号化して保存                       |
| `getKey`       | `() => Promise<string \| null>`                 | キーを復号して取得（Main Process のみ）    |
| `deleteKey`    | `() => Promise<void>`                           | キーを削除                                 |
| `hasKey`       | `() => Promise<boolean>`                        | キー存在確認                               |
| `validateKey`  | `(key?: string) => Promise<AuthKeyValidationResult>` | Anthropic API でキーを検証            |

### AuthKeyValidationResult 型

| プロパティ | 型                                           | 必須 | 説明                     |
| ---------- | -------------------------------------------- | ---- | ------------------------ |
| `valid`    | `boolean`                                    | ✓    | キーが有効かどうか       |
| `error`    | `AuthKeyValidationError`                     | -    | エラー詳細（失敗時のみ） |

### AuthKeyValidationError 型

| プロパティ | 型                      | 必須 | 説明                 |
| ---------- | ----------------------- | ---- | -------------------- |
| `code`     | `AuthKeyErrorCode`      | ✓    | エラーコード         |
| `message`  | `string`                | ✓    | エラーメッセージ     |

### AuthKeyErrorCode

| コード                   | 説明                          |
| ------------------------ | ----------------------------- |
| `AUTH_KEY_NOT_SET`       | 認証キー未設定                |
| `AUTH_KEY_INVALID`       | 認証キー無効                  |
| `VALIDATION_FAILED`      | バリデーションエラー          |
| `NETWORK_ERROR`          | ネットワークエラー            |
| `ENCRYPTION_UNAVAILABLE` | safeStorage 暗号化不可        |
| `STORAGE_ERROR`          | ストレージエラー              |

**SkillExecutor コンストラクタ**:

| パラメータ        | 型                 | 必須 | 説明                            |
| ----------------- | ------------------ | ---- | ------------------------------- |
| `mainWindow`      | `BrowserWindow`    | ✓    | メインウィンドウ                |
| `permissionStore` | `IPermissionStore` | -    | 権限永続化ストア                |
| `authKeyService`  | `IAuthKeyService`  | -    | 認証キー管理サービス（DI）      |

**キー取得フロー**:

1. `authKeyService.getKey()` を呼び出し
2. キーが取得できた場合 → SDK に渡す
3. キーが null の場合 → `process.env.ANTHROPIC_API_KEY` をフォールバック
4. 環境変数も未設定の場合 → `AUTHENTICATION_ERROR` をスロー

### AuthKeyService DI配線契約（TASK-FIX-SKILL-EXECUTOR-AUTHKEY-DI-001）

`SkillExecutor` への `AuthKeyService` 注入経路を Main composition root で単一路化し、preflight と実行時判定の不一致を防止する。

| 項目 | 契約 |
| --- | --- |
| 生成責務 | `registerAllIpcHandlers` が `AuthKeyService` を1回だけ生成する |
| 注入責務 | `registerSkillHandlers(mainWindow, skillService, authKeyService)` で同一インスタンスを渡す |
| 実行責務 | `new SkillExecutor(mainWindow, undefined, authKeyService)` で DI する |
| 一貫性 | `registerAuthKeyHandlers` / `registerSkillHandlers` は同一 `authKeyService` を共有する |
| 後方互換 | `registerSkillHandlers` の第3引数は optional とし、既存2引数呼び出しを維持する |

---

## リトライ機構（TASK-SKILL-RETRY-001）

SkillExecutorにExponential Backoff with Jitterパターンのリトライ機構を追加。一時的なエラーからの自動回復を実現する。

### 概要

| 項目           | 内容                                                    |
| -------------- | ------------------------------------------------------- |
| タスクID       | TASK-SKILL-RETRY-001                                    |
| 完了日         | 2026-01-31                                              |
| ステータス     | **完了**                                                |
| テスト数       | 72件                                                    |
| 実装ファイル   | `apps/desktop/src/main/services/skill/SkillExecutor.ts` |

### リトライ関連型定義

#### RetryableErrorType

リトライ可能なエラーの分類。

| 値             | 説明                       |
| -------------- | -------------------------- |
| `network`      | ネットワークエラー         |
| `rate_limit`   | API レート制限（HTTP 429） |
| `server_error` | サーバーエラー（HTTP 5xx） |
| `timeout`      | タイムアウト               |

#### RetryConfig

リトライ動作を制御する設定インターフェース。

| プロパティ          | 型       | デフォルト値 | 説明                   |
| ------------------- | -------- | ------------ | ---------------------- |
| `maxRetries`        | `number` | `3`          | 最大リトライ回数       |
| `baseDelayMs`       | `number` | `1000`       | 基本待機時間（ミリ秒） |
| `maxDelayMs`        | `number` | `30000`      | 最大待機時間（ミリ秒） |
| `jitterFactor`      | `number` | `0.2`        | Jitter範囲（0〜1）     |
| `backoffMultiplier` | `number` | `2`          | バックオフ倍率         |

#### RetryableErrorResult

エラーのリトライ判定結果。

| プロパティ     | 型                   | 必須 | 説明                                  |
| -------------- | -------------------- | ---- | ------------------------------------- |
| `retryable`    | `boolean`            | ✓    | リトライ可能かどうか                  |
| `errorType`    | `RetryableErrorType` | -    | エラータイプ（retryable=true時のみ）  |
| `retryAfterMs` | `number`             | -    | Retry-Afterヘッダー値（ミリ秒換算）  |

### リトライ関連API

| 関数                    | シグネチャ                                                              | エクスポート | 説明                           |
| ----------------------- | ----------------------------------------------------------------------- | ------------ | ------------------------------ |
| `isRetryableError`      | `(error: unknown) => RetryableErrorResult`                              | ✓            | エラーのリトライ可否判定       |
| `calculateBackoffDelay` | `(attempt: number, config: RetryConfig, retryAfterMs?: number) => number` | ✓          | バックオフ待機時間計算         |
| `executeWithRetry`      | private メソッド                                                         | -            | リトライ付きSDK query()実行   |
| `sleep`                 | `(ms: number, signal?: AbortSignal) => Promise<void>`                   | -            | AbortSignal対応の待機          |

### リトライ関連定数

| 定数                        | 値                                                        | エクスポート | 説明                     |
| --------------------------- | --------------------------------------------------------- | ------------ | ------------------------ |
| `DEFAULT_RETRY_CONFIG`      | maxRetries:3, baseDelayMs:1000, maxDelayMs:30000, jitterFactor:0.2, backoffMultiplier:2 | ✓ | デフォルトリトライ設定 |
| `RETRYABLE_NETWORK_ERRORS`  | ECONNRESET, ETIMEDOUT, ECONNREFUSED, ENOTFOUND, EAI_AGAIN | -           | リトライ対象ネットワークエラーコード |

---

