# Phase 1 Task 2: リトライ対象エラー一覧

## リトライ対象エラー（retryable: true）

### 1. ネットワークエラー (errorType: "network")

| エラーコード | 説明                 | 判定方法                      |
| ------------ | -------------------- | ----------------------------- |
| ECONNRESET   | 接続がリセットされた | error.code === "ECONNRESET"   |
| ETIMEDOUT    | 接続がタイムアウト   | error.code === "ETIMEDOUT"    |
| ECONNREFUSED | 接続が拒否された     | error.code === "ECONNREFUSED" |
| ENOTFOUND    | DNS解決失敗          | error.code === "ENOTFOUND"    |
| EAI_AGAIN    | DNS一時的失敗        | error.code === "EAI_AGAIN"    |

### 2. レートリミット (errorType: "rate_limit")

| HTTPステータス | 説明              | 判定方法             | 追加情報                                  |
| -------------- | ----------------- | -------------------- | ----------------------------------------- |
| 429            | Too Many Requests | error.status === 429 | Retry-AfterヘッダーからretryAfterMsを算出 |

**Retry-After対応**:

- 秒数形式: `Retry-After: 30` → retryAfterMs = 30000
- HTTP日付形式: `Retry-After: Wed, 21 Oct 2015 07:28:00 GMT` → 差分を算出
- ヘッダーなし: デフォルトのExponential Backoffを適用

### 3. サーバーエラー (errorType: "server_error")

| HTTPステータス | 説明                  | 判定方法                                  |
| -------------- | --------------------- | ----------------------------------------- |
| 500            | Internal Server Error | error.status >= 500 && error.status < 600 |
| 502            | Bad Gateway           | 同上                                      |
| 503            | Service Unavailable   | 同上                                      |
| 504            | Gateway Timeout       | 同上                                      |

### 4. タイムアウト (errorType: "timeout")

| 条件           | 判定方法                      |
| -------------- | ----------------------------- |
| TimeoutError   | error.name === "TimeoutError" |
| TIMEOUT コード | error.code === "TIMEOUT"      |

---

## リトライ非対象エラー（retryable: false）

### クライアントエラー

| HTTPステータス | 説明         | 理由                                |
| -------------- | ------------ | ----------------------------------- |
| 400            | Bad Request  | リクエスト不正 - 再送しても同じ結果 |
| 401            | Unauthorized | 認証エラー - 認証情報の修正が必要   |
| 403            | Forbidden    | 権限エラー - 権限付与が必要         |
| 404            | Not Found    | リソース不在 - リソース作成が必要   |

### 意図的キャンセル

| エラー     | 判定方法                    | 理由                           |
| ---------- | --------------------------- | ------------------------------ |
| AbortError | error.name === "AbortError" | ユーザーによる意図的キャンセル |

### 同時実行上限

| エラー                  | 判定方法                | 理由                          |
| ----------------------- | ----------------------- | ----------------------------- |
| MAX_CONCURRENT_EXCEEDED | SkillExecutionErrorCode | execute()呼び出し前に判定済み |

### その他

| 条件                               | 理由                     |
| ---------------------------------- | ------------------------ |
| エラーオブジェクトがnull/undefined | 判定不可                 |
| エラーオブジェクトが文字列         | 構造化されていないエラー |
| 不明なエラー                       | 安全のためリトライしない |

---

## 既存 isRetryable() との関係

| 項目        | 既存 isRetryable()           | 新 isRetryableError()                                     |
| ----------- | ---------------------------- | --------------------------------------------------------- |
| 判定方法    | メッセージ文字列マッチ       | エラーコード・HTTPステータスベース                        |
| 返却型      | boolean                      | RetryableErrorResult (retryable, errorType, retryAfterMs) |
| 対応範囲    | network, timeout, econnreset | 全5分類                                                   |
| Retry-After | 非対応                       | 対応                                                      |

**方針**: 既存の isRetryable() はそのまま維持し、新しい isRetryableError() を追加する。既存メソッドは categorizeError() と組み合わせて使われているため、後方互換性を保つ。
