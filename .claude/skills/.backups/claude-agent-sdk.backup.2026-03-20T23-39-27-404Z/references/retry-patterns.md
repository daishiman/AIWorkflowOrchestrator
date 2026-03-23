# リトライパターン リファレンス

SkillExecutorで実装されたExponential Backoff with Jitterリトライ機構のパターンガイド。

---

## パターン概要

| パターン                        | 用途                                   | 実装先                   |
| ------------------------------- | -------------------------------------- | ------------------------ |
| Exponential Backoff with Jitter | 一時的エラーからの自動回復             | SkillExecutor            |
| Retry-After Header対応          | APIレート制限の待機時間準拠            | calculateBackoffDelay    |
| AbortSignal連携リトライ         | ユーザー中断時の即座停止               | sleep + executeWithRetry |
| ストリーミング通知リトライ      | リトライ状態のUI表示                   | skill:stream retry       |

---

## Exponential Backoff with Jitter

### 計算式

待機時間 = min(baseDelayMs * backoffMultiplier^attempt, maxDelayMs) * (1 + random(-jitterFactor, +jitterFactor))

### デフォルト設定（DEFAULT_RETRY_CONFIG）

| パラメータ          | 値      | 説明                   |
| ------------------- | ------- | ---------------------- |
| `maxRetries`        | `3`     | 最大リトライ回数       |
| `baseDelayMs`       | `1000`  | 基本待機時間（ミリ秒） |
| `maxDelayMs`        | `30000` | 最大待機時間（ミリ秒） |
| `jitterFactor`      | `0.2`   | Jitter範囲（±20%）     |
| `backoffMultiplier` | `2`     | バックオフ倍率         |

### 待機時間の具体例

| リトライ回数 | 基本待機時間 | Jitter後範囲   |
| ------------ | ------------ | -------------- |
| 1回目        | 1000ms       | 800〜1200ms    |
| 2回目        | 2000ms       | 1600〜2400ms   |
| 3回目        | 4000ms       | 3200〜4800ms   |

---

## エラー分類（isRetryableError）

### リトライ対象

| エラー条件                                       | errorType      | 判定根拠                        |
| ------------------------------------------------ | -------------- | ------------------------------- |
| ECONNRESET, ETIMEDOUT, ECONNREFUSED等            | `network`      | ネットワークエラーコード一致    |
| HTTP 429                                         | `rate_limit`   | status === 429                  |
| HTTP 500〜599                                    | `server_error` | status >= 500 && status < 600   |
| TimeoutError / error.code === 'TIMEOUT'          | `timeout`      | エラー名またはコード一致        |

### リトライ非対象

| エラー条件         | 理由                       |
| ------------------ | -------------------------- |
| HTTP 400〜403      | クライアント側の問題       |
| HTTP 404           | リソース不存在             |
| ValidationError    | 入力修正が必要             |
| AuthenticationError| 認証情報の問題             |
| AbortError         | ユーザーによる明示的中断   |

---

## Retry-After ヘッダー対応

HTTP 429レスポンスの`Retry-After`ヘッダーをパースし、算出した待機時間と比較して大きい方を使用する。

### 処理フロー

1. レスポンスヘッダーから`Retry-After`を取得（秒単位の数値）
2. ミリ秒に変換（value * 1000）
3. `calculateBackoffDelay()`に`retryAfterMs`として渡す
4. `baseDelayMs`以上`maxDelayMs`以下の範囲にクランプ
5. Jitterは適用しない（Retry-After優先時）

### 制約

極端に大きいRetry-After値（例: 86400秒=24時間）は`maxDelayMs`（30秒）で制限される。

---

## AbortSignal連携

### リトライ待機中の中断

`sleep()`関数がAbortSignalを受け取り、待機中にsignalが発火した場合は即座にAbortErrorをスローする。

### 動作フロー

1. `executeWithRetry()`がAbortControllerのsignalを受け取る
2. リトライ待機中、`sleep(ms, signal)`にsignalを渡す
3. signal発火時: `sleep`のPromiseが即座にreject（AbortError）
4. `executeWithRetry()`がAbortErrorをキャッチし、リトライせず再スロー

---

## ストリーミング通知

リトライ発生時、IPCチャネル`skill:stream`経由で`retry`タイプのメッセージを送信する。

### メッセージ形式

| プロパティ    | 型       | 内容                                       |
| ------------- | -------- | ------------------------------------------ |
| `executionId` | `string` | 実行ID                                     |
| `type`        | `retry`  | SkillStreamMessageType                     |
| `content`     | `string` | リトライ情報（試行回数、待機時間、エラー） |
| `timestamp`   | `number` | タイムスタンプ                             |
| `isComplete`  | `false`  | リトライ中は未完了                         |

---

## 使用パターン

### デフォルト設定でのリトライ

SkillExecutionRequestの`retryConfig`を省略するとDEFAULT_RETRY_CONFIGが適用される。

### カスタム設定

SkillExecutionRequestの`retryConfig`にPartial<RetryConfig>を指定して個別パラメータを上書きする。

| ユースケース       | 推奨設定                                       |
| ------------------ | ---------------------------------------------- |
| 高速フィードバック | maxRetries:1, baseDelayMs:500                  |
| 長時間処理         | maxRetries:5, maxDelayMs:60000                 |
| リトライ無効化     | maxRetries:0                                   |
| 高信頼性           | maxRetries:5, jitterFactor:0.3                 |

### リトライ無効化

`retryConfig: { maxRetries: 0 }` を指定するとリトライは行わずエラーを即座にスローする。

---

## 実装ファイル

| ファイル        | パス                                                            | 説明                              |
| --------------- | --------------------------------------------------------------- | --------------------------------- |
| SkillExecutor   | `apps/desktop/src/main/services/skill/SkillExecutor.ts`         | executeWithRetry, isRetryableError |
| テスト          | `apps/desktop/src/main/services/skill/__tests__/SkillExecutor.retry.test.ts` | 72テストケース      |

---

## 関連ドキュメント

| ドキュメント                             | 説明                            |
| ---------------------------------------- | ------------------------------- |
| [error-handling.md](./error-handling.md)  | AbortSignal、タイムアウト       |
| [query-api.md](./query-api.md)           | query() API基本                 |
| [hooks-system.md](./hooks-system.md)     | Hooks内エラー処理               |
| [electron-ipc.md](./electron-ipc.md)     | IPC通信エラー                   |

### システム仕様参照

| ドキュメント                           | パス                                                                | 内容                         |
| -------------------------------------- | ------------------------------------------------------------------- | ---------------------------- |
| Executor仕様                           | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-executor.md` | 型定義・API・定数     |
| エラーハンドリング仕様                 | `.claude/skills/aiworkflow-requirements/references/error-handling.md` | リトライ戦略セクション       |
| 実装ガイド（概念）                     | `docs/30-workflows/skillexecutor-retry-mechanism/outputs/phase-12/implementation-guide-part1.md` | 中学生レベル説明 |
| 実装ガイド（技術）                     | `docs/30-workflows/skillexecutor-retry-mechanism/outputs/phase-12/implementation-guide-part2.md` | 詳細技術仕様     |
