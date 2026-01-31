# Phase 2 Task 2: エラー判定ロジック設計書

## RetryableErrorType型

```typescript
/** リトライ可能なエラーの分類 */
export type RetryableErrorType =
  | "network"
  | "rate_limit"
  | "server_error"
  | "timeout";
```

## RetryableErrorResult型

```typescript
/** リトライ判定結果 */
export interface RetryableErrorResult {
  retryable: boolean;
  errorType?: RetryableErrorType;
  retryAfterMs?: number;
}
```

## isRetryableError() 関数設計

```typescript
/**
 * エラーがリトライ対象かどうかを判定する
 * @param error - 判定対象のエラー
 * @returns リトライ判定結果
 */
export function isRetryableError(error: unknown): RetryableErrorResult;
```

### 判定フロー

```
isRetryableError(error)
├── error が null/undefined → { retryable: false }
├── error が Error でない → { retryable: false }
├── error.name === "AbortError" → { retryable: false }
├── error.code in RETRYABLE_NETWORK_ERRORS → { retryable: true, errorType: "network" }
├── error.status === 429 → { retryable: true, errorType: "rate_limit", retryAfterMs: parseRetryAfter(error) }
├── error.status >= 500 && < 600 → { retryable: true, errorType: "server_error" }
├── error.name === "TimeoutError" || error.code === "TIMEOUT" → { retryable: true, errorType: "timeout" }
└── その他 → { retryable: false }
```

### RETRYABLE_NETWORK_ERRORS 定数

```typescript
const RETRYABLE_NETWORK_ERRORS = [
  "ECONNRESET",
  "ETIMEDOUT",
  "ECONNREFUSED",
  "ENOTFOUND",
  "EAI_AGAIN",
] as const;
```

### Retry-Afterヘッダーパース

```typescript
function parseRetryAfterMs(error: unknown): number | undefined;
```

- error.headers?.["retry-after"] を取得
- 数値文字列の場合: 秒数 × 1000 でミリ秒変換
- HTTP日付形式の場合: Date.parse() で差分算出（本実装では簡易的に数値パースのみ）
- パース失敗: undefined を返す

## 既存メソッドとの関係

- **categorizeError()**: 既存のまま維持（ErrorCategory型を返す）
- **isRetryable()**: 既存のまま維持（boolean型を返す）
- **isRetryableError()**: 新規追加（RetryableErrorResult型を返す）
- 既存メソッドに影響なし
