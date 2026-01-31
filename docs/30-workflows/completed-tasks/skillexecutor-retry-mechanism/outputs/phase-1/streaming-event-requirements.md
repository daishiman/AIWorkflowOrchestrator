# Phase 1 Task 4: ストリーミングイベント要件書

## 概要

リトライ発生時にUI側にリトライ状態を通知するためのストリーミングイベント `skill:retry` の要件を定義する。

---

## 既存ストリーミングメッセージ

### SkillExecutor.ts ローカル定義

| type       | 用途               |
| ---------- | ------------------ |
| "text"     | テキストメッセージ |
| "tool_use" | ツール使用通知     |
| "error"    | エラー通知         |
| "complete" | 完了通知           |

### packages/shared/src/types/skill.ts 定義

| type          | 用途                   |
| ------------- | ---------------------- |
| "assistant"   | アシスタントメッセージ |
| "tool_use"    | ツール使用通知         |
| "tool_result" | ツール結果通知         |
| "status"      | ステータス通知         |
| "error"       | エラー通知             |

---

## 新規イベント: "retry"

### イベントデータ

| フィールド   | 型                 | 必須 | 説明                                                                |
| ------------ | ------------------ | ---- | ------------------------------------------------------------------- |
| attempt      | number             | 必須 | 現在のリトライ試行回数（0始まり）                                   |
| maxRetries   | number             | 必須 | 最大リトライ回数                                                    |
| delayMs      | number             | 必須 | 次回リトライまでの待機時間（ミリ秒）                                |
| errorType    | RetryableErrorType | 必須 | エラー分類（"network" / "rate_limit" / "server_error" / "timeout"） |
| errorMessage | string             | 必須 | リトライ理由となったエラーメッセージ                                |

### RetryableErrorType

| 値             | 説明               | 対応エラー                                                |
| -------------- | ------------------ | --------------------------------------------------------- |
| "network"      | ネットワークエラー | ECONNRESET, ETIMEDOUT, ECONNREFUSED, ENOTFOUND, EAI_AGAIN |
| "rate_limit"   | レートリミット     | HTTP 429                                                  |
| "server_error" | サーバーエラー     | HTTP 5xx                                                  |
| "timeout"      | タイムアウト       | TimeoutError, TIMEOUT                                     |

### 送信タイミング

1. query() API呼び出しでリトライ対象エラーが発生
2. リトライ回数が上限に達していない
3. AbortSignalがabortされていない
4. **retryイベント送信** ← このタイミング
5. calculateBackoffDelay()で待機時間を算出
6. sleep(delay, abortSignal)で待機
7. 次の試行を開始

### 送信チャネル

- IPC チャネル: `skill:stream`（既存チャネルを共有）
- 送信メソッド: `sendStream()` を使用

---

## UI表示要件（スコープ外、参考情報）

リトライイベント受信時のUI表示イメージ:

- 「リトライ中 (1/3): ネットワークエラー - 2秒後に再試行します」
- プログレスインジケーター表示
- キャンセルボタンでabort()呼び出し

**注**: UI実装は本タスクのスコープ外。型定義とイベント送信のみ実装する。

---

## IPC通信フロー

```
Main Process                    Renderer Process
    │                               │
    ├── query() API 呼び出し        │
    │   └── エラー発生              │
    ├── isRetryableError() 判定     │
    ├── retryイベント送信  ────────►│ skill:stream (type: "retry")
    ├── sleep(delay, signal)        │
    ├── query() API 再試行          │
    │   └── 成功                    │
    ├── ストリーミング処理          │
    ├── 完了通知送信  ─────────────►│ skill:stream (type: "complete")
    │                               │
```
