# Agent SDK Executor 仕様

> 本ドキュメントは interfaces-agent-sdk.md の分割ファイルです。
> 親ファイル: interfaces-agent-sdk.md
> 管理: .claude/skills/aiworkflow-requirements/

---

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
| 1 | `registerSkillHandlers(mainWindow, skillService)` | `main/index.ts` |
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

## PermissionResolver 型定義（TASK-3-2）

スキル実行時の権限確認を管理するコンポーネント。ユーザーが許可/拒否するまで処理を待機し、タイムアウト・AbortSignal によるキャンセルをサポート。

### 概要

| 項目         | 内容                                                         |
| ------------ | ------------------------------------------------------------ |
| 実装ファイル | `apps/desktop/src/main/services/skill/PermissionResolver.ts` |
| 依存型       | `SkillPermissionRequest`, `SkillPermissionResponse`          |
| 使用元       | `SkillExecutor`, IPC Handlers                                |

### アーキテクチャ

PermissionResolverは、Main Process内でSkillExecutorと連携し、Renderer ProcessのPermissionDialogを介してユーザーの権限確認を行う。

#### コンポーネント間の関係

| プロセス         | コンポーネント       | 役割                                   |
| ---------------- | -------------------- | -------------------------------------- |
| Main Process     | SkillExecutor        | 権限確認が必要なツール使用を検出       |
| Main Process     | PermissionResolver   | 権限応答の待機・解決を管理             |
| Main Process     | IPC Handler          | Rendererからの応答を受信しresolve呼出  |
| Renderer Process | PermissionDialog     | ユーザーに許可/拒否を確認するUI        |

#### 通信フロー概要

SkillExecutorがPermissionResolverのwaitForResponseを呼び出すと、IPC経由でRendererのPermissionDialogにリクエストが送信される。ユーザーが許可または拒否を選択すると、その応答がIPC Handlerを通じてPermissionResolverのresolveRequestに渡され、待機中のPromiseが解決される。

### フロー

権限確認は以下の8ステップで実行される。

| ステップ | 実行者           | アクション                                               |
| -------- | ---------------- | -------------------------------------------------------- |
| 1        | SkillExecutor    | 権限確認が必要なツール使用を検出                         |
| 2        | SkillExecutor    | PermissionResolver.waitForResponse(requestId) を呼び出し |
| 3        | Main Process     | IPC で Renderer に SkillPermissionRequest を送信         |
| 4        | Renderer         | PermissionDialog でユーザーに確認                        |
| 5        | ユーザー         | 許可/拒否を選択                                          |
| 6        | Renderer         | IPC で SkillPermissionResponse を Main に返送            |
| 7        | IPC Handler      | PermissionResolver.resolveRequest(response) を呼び出し   |
| 8        | SkillExecutor    | waitForResponse の Promise が解決、処理続行              |

### PermissionResolver クラス

| メソッド          | シグネチャ                                                       | 説明                     |
| ----------------- | ---------------------------------------------------------------- | ------------------------ |
| `waitForResponse` | `(requestId: string, signal?: AbortSignal) => Promise<Response>` | 権限応答を待機           |
| `resolveRequest`  | `(response: SkillPermissionResponse) => void`                    | リクエストを解決         |
| `cancelRequest`   | `(requestId: string, reason?: string) => void`                   | リクエストをキャンセル   |
| `cancelAll`       | `() => void`                                                     | 全リクエストをキャンセル |
| `pendingCount`    | `number` (getter)                                                | 待機中リクエスト数       |

### コンストラクタ

| パラメータ       | 型     | デフォルト | 説明                       |
| ---------------- | ------ | ---------- | -------------------------- |
| `defaultTimeout` | number | 300000     | タイムアウト時間（ミリ秒） |

### 設定定数

| 定数                 | 値       | 説明                         |
| -------------------- | -------- | ---------------------------- |
| `DEFAULT_TIMEOUT_MS` | `300000` | デフォルトタイムアウト (5分) |

### エラーメッセージ

| キー            | メッセージ                                  | 発生条件                 |
| --------------- | ------------------------------------------- | ------------------------ |
| `TIMEOUT`       | `Permission request timed out: {requestId}` | タイムアウト発生時       |
| `ABORTED`       | `Permission request aborted: {requestId}`   | AbortSignal 発火時       |
| `CANCELLED`     | `Permission request cancelled: {requestId}` | cancelRequest 呼び出し時 |
| `CANCELLED_ALL` | `All permission requests cancelled`         | cancelAll 呼び出し時     |

### 注意事項

| 項目                 | 説明                                              |
| -------------------- | ------------------------------------------------- |
| タイムアウト         | 設定時間経過後は Error がスローされる             |
| AbortSignal          | キャンセル時は即座に Error で reject              |
| 存在しない requestId | resolveRequest/cancelRequest はエラーを投げない   |
| メモリリーク防止     | 全てのケースでタイマーがクリアされる              |
| 並行処理             | 複数リクエストを同時に管理可能（Map による O(1)） |

---

## SkillExecutor IPC統合（TASK-3-2）

TASK-3-1-Aで実装したSkillExecutorの実行結果を、Renderer Processにリアルタイムでストリーミング表示するためのIPC統合。

### 概要

| 項目         | 内容                                                        |
| ------------ | ----------------------------------------------------------- |
| タスクID     | TASK-3-2                                                    |
| 完了日       | 2026-01-25                                                  |
| ステータス   | **完了**                                                    |
| テスト数     | 138件（37 + 38 + 40 + 23）                                  |
| ドキュメント | `docs/30-workflows/TASK-3-2-skillexecutor-ipc-integration/` |

### Preload API（window.electronAPI.skill）

| メソッド             | シグネチャ                                        | 用途                               |
| -------------------- | ------------------------------------------------- | ---------------------------------- |
| `execute`            | `(request) => Promise<SkillExecutionResponse>`    | スキル実行開始、executionIdを返す  |
| `onStream`           | `(callback) => () => void`                        | ストリームメッセージのリスナー登録 |
| `abort`              | `(executionId) => Promise<boolean>`               | 実行中のスキルを中断               |
| `getExecutionStatus` | `(executionId) => Promise<ExecutionInfo \| null>` | 実行状態を照会                     |

### IPCチャンネル

| チャンネル         | 方向            | 用途                 |
| ------------------ | --------------- | -------------------- |
| `skill:execute`    | Renderer → Main | 実行開始             |
| `skill:stream`     | Main → Renderer | メッセージストリーム |
| `skill:abort`      | Renderer → Main | 実行中断             |
| `skill:get-status` | Renderer → Main | ステータス照会       |

### React Hook（useSkillExecution）

| プロパティ    | 型                                      | 説明           |
| ------------- | --------------------------------------- | -------------- |
| `messages`    | `SkillStreamMessage[]`                  | メッセージ一覧 |
| `status`      | `ExecutionStatus`                       | 実行状態       |
| `executionId` | `string \| null`                        | 実行ID         |
| `error`       | `SkillExecutionError \| null`           | エラー         |
| `isAborting`  | `boolean`                               | 中断中フラグ   |
| `execute`     | `(prompt) => Promise<Response \| null>` | 実行関数       |
| `abort`       | `() => Promise<void>`                   | 中断関数       |
| `reset`       | `() => void`                            | リセット関数   |

### UIコンポーネント（SkillStreamDisplay）

| Prop             | 型                 | 説明                       |
| ---------------- | ------------------ | -------------------------- |
| `skillId`        | `string`           | 実行対象スキルID           |
| `initialPrompt`  | `string?`          | 初期プロンプト             |
| `autoExecute`    | `boolean?`         | 自動実行フラグ             |
| `onComplete`     | `() => void`       | 完了コールバック           |
| `onError`        | `(error) => void`  | エラーコールバック         |
| `onStatusChange` | `(status) => void` | ステータス変更コールバック |
| `height`         | `string \| number` | 高さ                       |
| `className`      | `string?`          | カスタムクラス             |

### 実装ファイル

| ファイル                                                                | 行数 | 用途             |
| ----------------------------------------------------------------------- | ---- | ---------------- |
| `apps/desktop/src/preload/skill-api.ts`                                 | 101  | Preload API      |
| `apps/desktop/src/renderer/hooks/useSkillExecution.ts`                  | 198  | React Hook       |
| `apps/desktop/src/renderer/components/AgentView/SkillStreamDisplay.tsx` | 223  | UIコンポーネント |

### テストカバレッジ

| メトリクス  | 達成値  |
| ----------- | ------- |
| Line        | 95.09%  |
| Branch      | 88.46%  |
| Function    | 100%    |
| Total Index | 283.55% |

---

## 完了タスク

### タスク: TASK-FIX-11-1-SDK-TEST-ENABLEMENT SDK統合テスト有効化（2026-02-13完了）

| 項目         | 内容                                                        |
| ------------ | ----------------------------------------------------------- |
| タスクID     | TASK-FIX-11-1-SDK-TEST-ENABLEMENT                          |
| 完了日       | 2026-02-13                                                  |
| ステータス   | **完了**                                                    |
| テスト数     | TODO有効化17件（3ファイル）+ 既存回帰全PASS                |
| 発見課題     | 0件                                                         |
| ドキュメント | `docs/30-workflows/sdk-test-enablement/`                   |

#### 変更内容

| 変更ファイル | 変更内容 |
| ------------ | -------- |
| `apps/desktop/src/main/slide/__tests__/agent-client.test.ts` | AC-06, SDK-AC-01〜06, SDK-AC-09〜10 のTODOを実テスト化。`mockRejectedValueOnce` と Fake Timers を導入 |
| `apps/desktop/src/main/slide/__tests__/sdk-integration.test.ts` | INT-02, INT-05, SDK-INT-01 のTODOを実テスト化。APIキー無効・SDK障害をモック検証 |
| `apps/desktop/src/main/slide/__tests__/skill-executor.test.ts` | SDK-SE-05, SDK-SE-13, SDK-SE-14 を有効化。`beforeEach` でモック再初期化しP9を回避 |

#### 仕様化したテストパターン

- `mockRejectedValueOnce` を優先し、テスト間のモック汚染を防止
- `vi.clearAllMocks()` だけでなく `mockReset` とデフォルト実装再設定を併用
- 30秒タイムアウトは `Promise.all([advanceTimersByTimeAsync, rejects])` で決定論的に検証

#### 実装上の課題と教訓

| 課題 | 詳細 | 解決策 |
|------|------|--------|
| Phase 12 Step 1-A/1-D誤判定 | テスト変更のみのためドキュメント更新を初回で「該当なし」と誤判定 | Step 1-A（LOGS/SKILL更新）と Step 1-D（index再生成）を必須として再実行 |
| 未タスク検出の誤検知 | `detect-unassigned-tasks.js` の raw 検出が仕様書本文の TODO 文言を多数検出 | 実装ディレクトリ優先スキャン + raw結果の手動精査で「候補」と「確定」を分離 |
| Vitestモック状態リーク | `vi.clearAllMocks()` のみでは実装が残り後続テストに影響 | `beforeEach` でデフォルト実装を再設定し、失敗系は `mockRejectedValueOnce` を使用 |

#### 成果物

| 成果物 | パス |
| ------ | ---- |
| 実装ガイド | `docs/30-workflows/sdk-test-enablement/outputs/phase-12/implementation-guide.md` |
| ドキュメント更新履歴 | `docs/30-workflows/sdk-test-enablement/outputs/phase-12/documentation-changelog.md` |
| 未タスク検出レポート | `docs/30-workflows/sdk-test-enablement/outputs/phase-12/unassigned-task-detection.md` |

---

### タスク: SDK型安全統合 - as any除去（2026-02-12完了）

| 項目         | 内容                                                       |
| ------------ | ---------------------------------------------------------- |
| タスクID     | TASK-9B-I-SDK-FORMAL-INTEGRATION                           |
| 完了日       | 2026-02-12                                                 |
| ステータス   | **完了**                                                   |
| テスト数     | 13（SDK型安全テスト）+ 既存278件全PASS                     |
| 発見課題     | 1件（UT-9B-I-001）                                        |
| ドキュメント | `docs/30-workflows/completed-tasks/sdk-formal-integration/`                |

#### 変更内容

| 変更項目                       | 変更前                                              | 変更後                                                         |
| ------------------------------ | --------------------------------------------------- | -------------------------------------------------------------- |
| SDK import                     | `(await import(...)) as any`                        | 型安全な `import` + 実型参照                                   |
| SDK Options: apiKey             | `apiKey: string`                                    | `env: { ANTHROPIC_API_KEY: string }`                           |
| SDK Options: signal             | `signal: AbortSignal`                               | `abortController: AbortController`                             |
| SDK Query 戻り値               | `conversation.stream()` で AsyncIterable 取得       | `conversation` を直接 AsyncIterable として利用                  |
| SDKQueryOptions: permissionMode | ローカル定義                                        | SDK 実型（`@anthropic-ai/claude-agent-sdk`）に準拠             |

#### callSDKQuery 型安全化仕様

`SkillExecutor.callSDKQuery()` は以下の型安全なマッピングで SDK を呼び出す。

| SDK Options パラメータ     | マッピング元                            | 説明                                      |
| ------------------------- | --------------------------------------- | ----------------------------------------- |
| `prompt`                  | `callSDKQuery` の第1引数（独立パラメータ） | 実行プロンプト                            |
| `env.ANTHROPIC_API_KEY`   | `getApiKey()` 経由で取得（独立パラメータ） | 環境変数形式でAPI Keyを渡す               |
| `abortController`         | `new AbortController()`                | AbortController インスタンスを直接渡す    |
| `options.permissionMode`  | SDK 実型の PermissionMode              | 型安全な権限モード指定                    |
| `tools`                   | `SDKQueryOptions.tools`                | ツール一覧（Read, Edit, Bash, Glob, Grep）|

#### テスト結果サマリー

| カテゴリ                          | テスト数 | PASS | FAIL |
| --------------------------------- | -------- | ---- | ---- |
| SDK Options マッピング            | 6        | 6    | 0    |
| AbortController 統合              | 4        | 4    | 0    |
| permissionMode 型検証             | 4        | 4    | 0    |
| AsyncIterable 戻り値処理          | 4        | 4    | 0    |

#### 成果物

| 成果物                    | パス                                                                                       |
| ------------------------- | ------------------------------------------------------------------------------------------ |
| SkillExecutor.ts修正      | `apps/desktop/src/main/services/skill/SkillExecutor.ts`                                    |
| SDK型安全テスト           | `apps/desktop/src/main/services/skill/__tests__/SkillExecutor.sdk-types.test.ts`           |

#### 実装上の課題と教訓

| 課題 | 詳細 | 解決策 |
|------|------|--------|
| TypeScript モジュール解決 | `node_modules` 実型がカスタム `declare module` を上書きし、カスタム `.d.ts` の `PermissionMode`（`auto`/`ask`/`deny`）が無視されゴースト型化 | SDK インストール後はカスタム `.d.ts` を削除する（UT-9B-I-001 で対応予定） |
| SDK パラメータ発見 | `env: { ANTHROPIC_API_KEY }`, `abortController` が公式ドキュメントに明記されておらず発見に時間を要した | 型定義ファイル（`node_modules/@anthropic-ai/claude-agent-sdk/dist/index.d.ts`）を直接参照して全パラメータを把握 |
| PermissionMode 値の不一致 | カスタム型（`auto`/`ask`/`deny`）vs SDK 実型（`default`/`acceptEdits`/`bypassPermissions`/`plan`/`delegate`/`dontAsk`）で値セットが完全に異なる | SDK 実型に統一し、仕様書の PermissionMode 定義を全更新 |
| テスト数乖離 | Phase 4（テスト設計）想定 18 件 vs Phase 5（実装）実績 13 件。設計時に想定していた重複テストケースを実装時に統合 | Phase 12 で `grep -c "it(" *.test.ts` により実測値で仕様書を修正 |
| 未タスク配置ディレクトリ間違い（P3再発） | UT-9B-I-001 の指示書を `tasks/` 直下に配置したが、正しくは `tasks/unassigned-task/` 配下 | P3 チェックリスト（①指示書 → ②残課題テーブル → ③関連仕様書リンク）を再確認して修正 |

**参照**: [architecture-implementation-patterns.md#S11](./architecture-implementation-patterns.md)（TypeScript モジュール解決）、[architecture-implementation-patterns.md#S12](./architecture-implementation-patterns.md)（SDK API パラメータの把握）

#### 関連未タスク

| タスクID     | タスク名                                       | 優先度 | 指示書                                                                                           |
| ------------ | ---------------------------------------------- | ------ | ------------------------------------------------------------------------------------------------ |
| UT-9B-I-001  | カスタム型宣言ファイルと SDK 実型の共存整理     | 低     | `docs/30-workflows/completed-tasks/sdk-formal-integration/outputs/phase-12/ut-9b-i-001-custom-declare-module-cleanup.md` |

---

### タスク: SkillExecutor リトライ機構実装（2026-01-31完了）

| 項目         | 内容                                                       |
| ------------ | ---------------------------------------------------------- |
| タスクID     | TASK-SKILL-RETRY-001                                       |
| 完了日       | 2026-01-31                                                 |
| ステータス   | **完了**                                                   |
| テスト数     | 72（自動テスト）+ 12（手動テスト項目）                     |
| 発見課題     | 0件                                                        |
| ドキュメント | `docs/30-workflows/skillexecutor-retry-mechanism/`         |

#### テスト結果サマリー

| カテゴリ                     | テスト数 | PASS | FAIL |
| ---------------------------- | -------- | ---- | ---- |
| リトライ基本機能             | 15       | 15   | 0    |
| エラー分類                   | 12       | 12   | 0    |
| バックオフ計算               | 10       | 10   | 0    |
| Retry-After対応              | 8        | 8    | 0    |
| abort連携                    | 8        | 8    | 0    |
| ストリーミング通知           | 7        | 7    | 0    |
| エッジケース                 | 6        | 6    | 0    |
| 並行実行                     | 3        | 3    | 0    |
| 手動テスト（executeWithRetry）| 12      | 12   | 0    |

#### 成果物

| 成果物                    | パス                                                                                       |
| ------------------------- | ------------------------------------------------------------------------------------------ |
| テスト結果レポート        | `docs/30-workflows/skillexecutor-retry-mechanism/outputs/phase-11/manual-test-results.md`  |
| 実装ガイド（初学者向け）  | `docs/30-workflows/skillexecutor-retry-mechanism/outputs/phase-12/implementation-guide-part1.md` |
| 実装ガイド（技術者向け）  | `docs/30-workflows/skillexecutor-retry-mechanism/outputs/phase-12/implementation-guide-part2.md` |

---

### タスク: スキル管理モジュール単体テスト（2026-02-02完了）

| 項目         | 内容                                                       |
| ------------ | ---------------------------------------------------------- |
| タスクID     | TASK-8A                                                    |
| 完了日       | 2026-02-02                                                 |
| ステータス   | **完了**                                                   |
| テスト数     | 231（SkillExecutor: 52, PermissionResolver: 43, 他3モジュール: 136） |
| 発見課題     | 1件（task-skillscanner-file-deletion-race: P3 - SkillScanner SKILL.md削除中レース） |
| ドキュメント | `docs/30-workflows/TASK-8A/`                               |

#### テスト結果サマリー（SkillExecutor + PermissionResolver）

| カテゴリ                          | テスト数 | PASS | FAIL |
| --------------------------------- | -------- | ---- | ---- |
| SkillExecutor - execute           | 15       | 15   | 0    |
| SkillExecutor - abort             | 8        | 8    | 0    |
| SkillExecutor - stream handling   | 10       | 10   | 0    |
| SkillExecutor - createHooks       | 1        | 1    | 0    |
| SkillExecutor - handlePermission  | 2        | 2    | 0    |
| SkillExecutor - Edge Cases        | 16       | 16   | 0    |
| PermissionResolver - waitForResponse | 12    | 12   | 0    |
| PermissionResolver - cancelRequest   | 8     | 8    | 0    |
| PermissionResolver - cancelAll       | 8     | 8    | 0    |
| PermissionResolver - Edge Cases      | 15    | 15   | 0    |

#### 成果物

| 成果物             | パス                                                                    |
| ------------------ | ----------------------------------------------------------------------- |
| 実装ガイド         | `docs/30-workflows/TASK-8A/outputs/phase-12/implementation-guide.md`    |
| カバレッジレポート | `docs/30-workflows/TASK-8A/outputs/phase-7/coverage-report.md`          |

---

## 関連ドキュメント

| ドキュメント                        | 説明                       |
| ----------------------------------- | -------------------------- |
| interfaces-agent-sdk.md             | 親ファイル（インデックス） |
| interfaces-agent-sdk-integration.md | 統合機能仕様               |
| interfaces-agent-sdk-history.md     | 完了タスク履歴             |
| [SDKテスト有効化 実装ガイド](../../../docs/30-workflows/sdk-test-enablement/outputs/phase-12/implementation-guide.md) | TASK-FIX-11-1 のテスト実装パターン |
| [実装ガイドPart1](../../../docs/30-workflows/skillexecutor-retry-mechanism/outputs/phase-12/implementation-guide-part1.md) | リトライ機構 初学者向け概念説明 |
| [実装ガイドPart2](../../../docs/30-workflows/skillexecutor-retry-mechanism/outputs/phase-12/implementation-guide-part2.md) | リトライ機構 技術者向け詳細 |

---

## 変更履歴

| 日付       | バージョン | 変更内容                                                   |
| ---------- | ---------- | ---------------------------------------------------------- |
| 2026-02-13 | 1.7.1      | TASK-FIX-11-1-SDK-TEST-ENABLEMENT: 「実装上の課題と教訓」追記（Step 1-A/1-D誤判定、未タスクraw誤検知、Vitestモック再初期化） |
| 2026-02-13 | 1.7.0      | TASK-FIX-11-1-SDK-TEST-ENABLEMENT: 完了タスク追加（SDK統合テスト17件有効化、P9対策モック再初期化、タイムアウト検証パターン） |
| 2026-02-12 | 1.6.1      | TASK-9B-I-SDK-FORMAL-INTEGRATION: 完了タスクセクションに「実装上の課題と教訓」サブセクション追加（TypeScriptモジュール解決、SDKパラメータ発見、PermissionMode不一致、テスト数乖離、P3再発） |
| 2026-02-12 | 1.6.0      | TASK-9B-I-SDK-FORMAL-INTEGRATION: callSDKQuery型安全化仕様追加、SDK Optionsマッピング（env.ANTHROPIC_API_KEY, abortController）、完了タスク追加 |
| 2026-02-11 | 1.5.0      | TASK-FIX-7-1: SkillService統合セクション追加、型変換パターン（Skill→SkillMetadata）追加 |
| 2026-02-08 | 1.4.0      | TASK-FIX-16-1: AuthKeyService統合（AUTHENTICATION_ERROR追加、DI対応、キー取得フロー追加） |
| 2026-02-02 | 1.3.0      | TASK-8A: SkillExecutor/PermissionResolver単体テスト95テスト全PASS、完了タスク追加 |
| 2026-01-31 | 1.2.0      | TASK-SKILL-RETRY-001: リトライ機構の型・API・定数追加      |
| 2026-01-26 | 1.1.0      | spec-guidelines.md準拠: コードブロックを表形式・文章に変換 |
| 2026-01-26 | 1.0.0      | interfaces-agent-sdk.mdから分割                            |
