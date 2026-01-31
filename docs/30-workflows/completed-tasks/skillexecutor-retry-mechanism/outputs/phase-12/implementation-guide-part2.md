# 実装ガイド Part 2: 技術者向け詳細

## アーキテクチャ

リトライ機構は SkillExecutor クラスの内部に実装されている。execute() メソッドから呼び出される `executeWithRetry()` プライベートメソッドが SDK の `query()` API をリトライ付きで実行する。

### 配置

| レイヤー         | コンポーネント         | 役割                                           |
| ---------------- | ---------------------- | ---------------------------------------------- |
| Main Process     | SkillExecutor          | リトライロジックの管理・実行                   |
| Main Process     | executeWithRetry()     | Exponential Backoff with Jitter によるリトライ |
| IPC              | skill:stream           | リトライイベントの Renderer 配信               |
| Renderer Process | useSkillExecution hook | リトライイベントの受信（将来対応）             |

### 実行フロー

1. `execute()` が `executeWithRetry()` を呼び出す
2. `executeWithRetry()` が `callSDKQuery()` を実行
3. エラー発生時に `isRetryableError()` で判定
4. リトライ可能な場合、`calculateBackoffDelay()` で待機時間を計算
5. `skill:stream` チャネルで retry イベントを送信
6. `sleep()` で待機（AbortSignal 対応）
7. ステップ 2 に戻る（最大 `maxRetries` 回まで）

---

## 型定義

### RetryableErrorType

リトライ可能なエラーの分類を表す。

| 値             | 説明                       |
| -------------- | -------------------------- |
| `network`      | ネットワークエラー         |
| `rate_limit`   | API レート制限（HTTP 429） |
| `server_error` | サーバーエラー（HTTP 5xx） |
| `timeout`      | タイムアウト               |

### RetryConfig

リトライ動作を制御する設定。

| プロパティ          | 型       | デフォルト値 | 説明                   |
| ------------------- | -------- | ------------ | ---------------------- |
| `maxRetries`        | `number` | `3`          | 最大リトライ回数       |
| `baseDelayMs`       | `number` | `1000`       | 基本待機時間（ミリ秒） |
| `maxDelayMs`        | `number` | `30000`      | 最大待機時間（ミリ秒） |
| `jitterFactor`      | `number` | `0.2`        | Jitter 範囲（0〜1）    |
| `backoffMultiplier` | `number` | `2`          | バックオフ倍率         |

### RetryableErrorResult

エラーのリトライ判定結果を表す。

| プロパティ     | 型                   | 必須 | 説明                                  |
| -------------- | -------------------- | ---- | ------------------------------------- |
| `retryable`    | `boolean`            | ✓    | リトライ可能かどうか                  |
| `errorType`    | `RetryableErrorType` | -    | エラータイプ（retryable=true 時のみ） |
| `retryAfterMs` | `number`             | -    | Retry-After ヘッダー値（ミリ秒換算）  |

### RetryMessageContent（ストリーミングイベント）

retry タイプのストリーミングメッセージの content フィールドに JSON 文字列として格納される。

| フィールド     | 型                   | 説明               |
| -------------- | -------------------- | ------------------ |
| `attempt`      | `number`             | リトライ試行回数   |
| `maxRetries`   | `number`             | 最大リトライ回数   |
| `delayMs`      | `number`             | 待機時間（ミリ秒） |
| `errorType`    | `RetryableErrorType` | エラータイプ       |
| `errorMessage` | `string`             | エラーメッセージ   |

### SkillExecutionRequest 拡張

既存の SkillExecutionRequest に `retryConfig` フィールドが追加された。

| プロパティ    | 型                     | 必須 | 説明                                               |
| ------------- | ---------------------- | ---- | -------------------------------------------------- |
| `retryConfig` | `Partial<RetryConfig>` | -    | リトライ設定（部分指定可能、未指定はデフォルト値） |

### SkillStreamMessageType 拡張

既存のメッセージタイプに `retry` が追加された。

| 値         | 説明                     |
| ---------- | ------------------------ |
| `text`     | テキストメッセージ       |
| `tool_use` | ツール使用               |
| `error`    | エラーメッセージ         |
| `complete` | 完了通知                 |
| `retry`    | リトライ通知（**新規**） |

---

## API リファレンス

### isRetryableError(error: unknown): RetryableErrorResult

エラーがリトライ対象かどうかを判定する。エクスポートされた関数。

**判定基準**:

| 条件                            | retryable | errorType      |
| ------------------------------- | --------- | -------------- |
| `null` / `undefined`            | `false`   | -              |
| 非オブジェクト型                | `false`   | -              |
| `AbortError`                    | `false`   | -              |
| ネットワークエラーコード        | `true`    | `network`      |
| HTTP 429                        | `true`    | `rate_limit`   |
| HTTP 500-599                    | `true`    | `server_error` |
| HTTP 400-499（429以外）         | `false`   | -              |
| `TimeoutError` / code `TIMEOUT` | `true`    | `timeout`      |
| その他                          | `false`   | -              |

### calculateBackoffDelay(attempt, config, retryAfterMs?): number

Exponential Backoff with Jitter でリトライ間隔を計算する。エクスポートされた関数。

**パラメータ**:

| パラメータ     | 型            | 説明                                   |
| -------------- | ------------- | -------------------------------------- |
| `attempt`      | `number`      | リトライ試行回数（0始まり）            |
| `config`       | `RetryConfig` | リトライ設定                           |
| `retryAfterMs` | `number?`     | Retry-After ヘッダー値（ミリ秒、任意） |

**計算ロジック**:

Retry-After ヘッダーが指定されている場合は `Math.min(Math.max(retryAfterMs, baseDelayMs), maxDelayMs)` を返す（MINOR-001 対応: maxDelayMs でキャップ）。

指定されていない場合は以下のロジックで計算する:

1. `exponentialDelay = baseDelayMs * backoffMultiplier^attempt`
2. `cappedDelay = min(maxDelayMs, exponentialDelay)`
3. `jitter = cappedDelay * random(-1, 1) * jitterFactor`
4. `result = max(0, cappedDelay + jitter)`

### executeWithRetry(executionId, request, skill, abortSignal): Promise

SkillExecutor のプライベートメソッド。SDK query() をリトライ付きで実行する。

**動作**:

1. `request.retryConfig` と `DEFAULT_RETRY_CONFIG` をマージ
2. 最大 `maxRetries + 1` 回（初回 + リトライ）ループ
3. 各ループで AbortSignal チェック → query() 実行 → 成功時 return
4. 失敗時: `isRetryableError()` で判定
5. 非リトライ: 即座にスロー
6. リトライ: `calculateBackoffDelay()` で待機計算 → retry イベント送信 → `sleep()` で待機
7. 最終試行失敗: 例外スロー

### sleep(ms, signal?): Promise<void>

AbortSignal 対応の待機関数。内部関数（非エクスポート）。

- `signal.aborted === true` の場合は即座に `AbortError` を reject
- 待機中に `signal.abort()` が呼ばれた場合、タイマーをクリアして `AbortError` を reject

---

## 定数

### DEFAULT_RETRY_CONFIG

エクスポートされたデフォルトリトライ設定。

| フィールド          | 値      |
| ------------------- | ------- |
| `maxRetries`        | `3`     |
| `baseDelayMs`       | `1000`  |
| `maxDelayMs`        | `30000` |
| `jitterFactor`      | `0.2`   |
| `backoffMultiplier` | `2`     |

### RETRYABLE_NETWORK_ERRORS

リトライ対象のネットワークエラーコード（内部定数）。

| エラーコード   | 説明                 |
| -------------- | -------------------- |
| `ECONNRESET`   | コネクションリセット |
| `ETIMEDOUT`    | 接続タイムアウト     |
| `ECONNREFUSED` | 接続拒否             |
| `ENOTFOUND`    | DNS 解決失敗         |
| `EAI_AGAIN`    | DNS 一時的失敗       |

---

## 使用例

### デフォルト設定でのスキル実行

SkillExecutionRequest に `retryConfig` を指定しない場合、DEFAULT_RETRY_CONFIG が使用される。

リクエスト:

| フィールド | 値           |
| ---------- | ------------ |
| `prompt`   | `"hello"`    |
| `skillId`  | `"my-skill"` |

この場合、エラー発生時に最大 3 回リトライし、初回 1 秒→2 秒→4 秒の待機時間（±20% ジッター）で再試行する。

### カスタム RetryConfig の設定

リクエストの `retryConfig` フィールドに部分的に設定を上書きできる。

カスタム設定例:

| フィールド    | 値                                     |
| ------------- | -------------------------------------- |
| `prompt`      | `"execute task"`                       |
| `skillId`     | `"heavy-task"`                         |
| `retryConfig` | `{ maxRetries: 5, baseDelayMs: 2000 }` |

未指定のフィールド（`maxDelayMs`, `jitterFactor`, `backoffMultiplier`）はデフォルト値が適用される。

### リトライ無効化

`maxRetries: 0` を指定するとリトライを無効にできる。

| フィールド    | 値                  |
| ------------- | ------------------- |
| `retryConfig` | `{ maxRetries: 0 }` |

---

## エラーハンドリング

### リトライ対象エラー一覧

| エラー種別         | HTTP ステータス  | リトライ | errorType      |
| ------------------ | ---------------- | -------- | -------------- |
| ネットワークエラー | -                | 可       | `network`      |
| レート制限         | 429              | 可       | `rate_limit`   |
| サーバーエラー     | 500-599          | 可       | `server_error` |
| タイムアウト       | -                | 可       | `timeout`      |
| クライアントエラー | 400-428, 430-499 | 不可     | -              |
| AbortError         | -                | 不可     | -              |
| null/undefined     | -                | 不可     | -              |

### Retry-After ヘッダー対応

HTTP 429 エラーの `Retry-After` ヘッダー（秒単位の数値）がパースされ、ミリ秒に変換される。`calculateBackoffDelay()` は Retry-After 値を優先し、`baseDelayMs` 以上 `maxDelayMs` 以下の範囲にクランプする。

---

## ストリーミングイベント

### skill:stream チャネル - retry イベント

リトライ発生時に IPC チャネル `skill:stream` を通じて Renderer Process に通知される。

**SkillStreamMessage 構造**:

| フィールド    | 値                       |
| ------------- | ------------------------ |
| `executionId` | 実行 ID（UUID）          |
| `id`          | メッセージ ID（UUID）    |
| `type`        | `"retry"`                |
| `content`     | JSON 文字列（下記参照）  |
| `timestamp`   | タイムスタンプ（ミリ秒） |
| `isComplete`  | `false`                  |

**content JSON フィールド**:

| フィールド     | 型       | 例                     |
| -------------- | -------- | ---------------------- |
| `attempt`      | `number` | `0`（1回目のリトライ） |
| `maxRetries`   | `number` | `3`                    |
| `delayMs`      | `number` | `1123`                 |
| `errorType`    | `string` | `"network"`            |
| `errorMessage` | `string` | `"connect ECONNRESET"` |

---

## 設定パラメータ一覧

| パラメータ          | 型       | デフォルト値 | 最小値 | 最大値 | 説明                   |
| ------------------- | -------- | ------------ | ------ | ------ | ---------------------- |
| `maxRetries`        | `number` | `3`          | `0`    | -      | 最大リトライ回数       |
| `baseDelayMs`       | `number` | `1000`       | -      | -      | 基本待機時間（ミリ秒） |
| `maxDelayMs`        | `number` | `30000`      | -      | -      | 最大待機時間（ミリ秒） |
| `jitterFactor`      | `number` | `0.2`        | `0`    | `1`    | Jitter 範囲            |
| `backoffMultiplier` | `number` | `2`          | -      | -      | バックオフ倍率         |

---

## テスト

### テストファイル

`apps/desktop/src/main/services/skill/__tests__/SkillExecutor.retry.test.ts`

### テストケース数

72 テストケース（9 describe ブロック）

### テストカテゴリ

| describe ブロック                | テスト数 | 内容                   |
| -------------------------------- | -------- | ---------------------- |
| isRetryableError                 | 14       | エラー判定ロジック     |
| calculateBackoffDelay            | 12       | バックオフ計算         |
| parseRetryAfterMs                | 6        | Retry-After パース     |
| DEFAULT_RETRY_CONFIG             | 5        | デフォルト設定値       |
| SkillExecutor.executeWithRetry   | 15       | リトライ実行フロー     |
| SkillExecutor retry streaming    | 7        | ストリーミングイベント |
| SkillExecutor retry abort        | 5        | abort 連携             |
| SkillExecutor retry config merge | 4        | 設定マージ             |
| SkillExecutor retry edge cases   | 4        | エッジケース           |

### 実行方法

テスト実行コマンド:

`npx vitest run src/main/services/skill/__tests__/SkillExecutor.retry.test.ts`

全テスト実行（既存テスト含む）:

`npx vitest run`
