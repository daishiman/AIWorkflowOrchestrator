# Phase 1 Task 5: 要件定義書

## 1. 機能要件

### FR-RET-001: ネットワークエラー自動リトライ

- ECONNRESET, ETIMEDOUT, ECONNREFUSED, ENOTFOUND, EAI_AGAIN エラー発生時に自動リトライ
- 判定方法: error.code による判定

### FR-RET-002: API Rate Limit (429) リトライ

- HTTP 429 エラー発生時に自動リトライ
- Retry-After ヘッダーがある場合はヘッダー値を優先
- Retry-After がない場合は Exponential Backoff を適用

### FR-RET-003: サーバーエラー (5xx) リトライ

- HTTP 500, 502, 503, 504 等の 5xx エラー発生時に自動リトライ
- 判定方法: error.status >= 500 && error.status < 600

### FR-RET-004: タイムアウトリトライ

- TimeoutError またはエラーコード TIMEOUT 発生時に自動リトライ
- 判定方法: error.name === "TimeoutError" || error.code === "TIMEOUT"

### FR-RET-005: 設定可能なリトライパラメータ

- maxRetries: 最大リトライ回数（デフォルト: 3）
- baseDelayMs: 基本待機時間（デフォルト: 1000ms）
- maxDelayMs: 最大待機時間（デフォルト: 30000ms）
- jitterFactor: Jitter範囲（デフォルト: 0.2）
- backoffMultiplier: バックオフ倍率（デフォルト: 2）
- SkillExecutionRequest.retryConfig で個別設定可能

### FR-RET-006: Exponential Backoff with Jitter

- 待機時間計算: `baseDelayMs * Math.pow(backoffMultiplier, attempt)`
- Jitter適用: `delay * (1 + (Math.random() * 2 - 1) * jitterFactor)`
- maxDelayMs でキャップ
- Retry-After ヘッダー優先

### FR-RET-007: リトライ状態ストリーミング通知

- リトライ発生時に `skill:stream` チャネル経由で retry イベントを送信
- イベントデータ: attempt, maxRetries, delayMs, errorType, errorMessage

### FR-RET-008: abort() によるリトライキャンセル

- abort() 呼び出し時にリトライを即座に中止
- sleep() 中の abort → AbortError で中断
- リトライループ内で abortSignal.aborted を毎回チェック

### FR-RET-009: リトライ非対象エラーの即座失敗

- HTTP 400, 401, 403, 404: クライアントエラーはリトライしない
- AbortError: ユーザーキャンセルはリトライしない
- 不明なエラー: 安全のためリトライしない

---

## 2. 非機能要件

### NFR-RET-001: パフォーマンス

- sleep() はイベントループをブロックしない（setTimeout ベース）
- リトライ中もメインプロセスの応答性を維持する

### NFR-RET-002: 信頼性

- リトライ上限（maxRetries）を超えた場合は確実にエラーとして終了
- 無限リトライしない
- 最大総待機時間: ~7秒（デフォルト設定、Jitter最大時）

### NFR-RET-003: 可観測性

- リトライ発生時にコンソールログ出力
- ストリーミングイベントでUI通知
- エラーメッセージにリトライ試行回数情報を含む

### NFR-RET-004: セキュリティ

- リトライログに sensitive 情報（APIキー、トークン等）を含めない
- Retry-After ヘッダーの値は数値範囲を検証する

---

## 3. スコープ

### 含む

- isRetryableError() 関数の実装
- calculateBackoffDelay() 関数の実装
- executeWithRetry() メソッドの実装
- sleep() ユーティリティの実装
- RetryConfig 型の定義
- RetryableErrorType 型の定義
- RetryableErrorResult 型の定義
- RetryMessageContent 型の定義
- SkillStreamMessageType への "retry" 追加
- SkillExecutionRequest への retryConfig フィールド追加
- ユニットテスト（67+ ケース）

### 含まない

- リトライ設定のUI（設定画面）
- リトライ履歴の永続化（データベース保存）
- サーキットブレーカーパターン
- リトライ中のUI表示実装（型定義のみ）
- Renderer Process 側の変更
- 既存テストの変更

---

## 4. 受け入れ基準

| #     | 基準                                                            | 検証方法       |
| ----- | --------------------------------------------------------------- | -------------- |
| AC-01 | ネットワークエラー（5種）で自動リトライが発生する               | ユニットテスト |
| AC-02 | HTTP 429 で Retry-After ヘッダーに基づくリトライが発生する      | ユニットテスト |
| AC-03 | HTTP 5xx で自動リトライが発生する                               | ユニットテスト |
| AC-04 | maxRetries 回失敗後にエラーとして終了する                       | ユニットテスト |
| AC-05 | HTTP 4xx (400,401,403,404) ではリトライしない                   | ユニットテスト |
| AC-06 | abort() 呼び出しでリトライが即座に中止される                    | ユニットテスト |
| AC-07 | リトライごとに skill:retry ストリーミングイベントが送信される   | ユニットテスト |
| AC-08 | デフォルトの Exponential Backoff with Jitter が正しく計算される | ユニットテスト |
| AC-09 | カスタム RetryConfig で設定をオーバーライドできる               | ユニットテスト |
| AC-10 | 既存テスト（SkillExecutor.test.ts等）に影響がない               | テスト実行     |
| AC-11 | TypeScript strict モードでエラーなし                            | 型チェック     |
| AC-12 | テストカバレッジ Line 80%+, Branch 60%+, Function 80%+          | カバレッジ計測 |
