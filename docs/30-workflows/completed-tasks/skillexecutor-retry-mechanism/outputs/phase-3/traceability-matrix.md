# Phase 3 Task 1: トレーサビリティマトリクス

## 要件-設計カバレッジ

| 要件ID     | 要件内容                        | 設計書                                                         | カバー状態 |
| ---------- | ------------------------------- | -------------------------------------------------------------- | ---------- |
| FR-RET-001 | ネットワークエラー自動リトライ  | error-classification-design.md (RETRYABLE_NETWORK_ERRORS)      | COVERED    |
| FR-RET-002 | API Rate Limit (429) リトライ   | error-classification-design.md (status=429, parseRetryAfterMs) | COVERED    |
| FR-RET-003 | サーバーエラー (5xx) リトライ   | error-classification-design.md (status>=500)                   | COVERED    |
| FR-RET-004 | タイムアウトリトライ            | error-classification-design.md (TimeoutError/TIMEOUT)          | COVERED    |
| FR-RET-005 | 設定可能なリトライパラメータ    | retry-config-design.md (RetryConfig, Partial)                  | COVERED    |
| FR-RET-006 | Exponential Backoff with Jitter | backoff-algorithm-design.md (calculateBackoffDelay)            | COVERED    |
| FR-RET-007 | リトライ状態ストリーミング通知  | streaming-event-design.md (type: "retry")                      | COVERED    |
| FR-RET-008 | abort()によるリトライキャンセル | execute-with-retry-design.md (AbortSignal連携)                 | COVERED    |
| FR-RET-009 | 非リトライエラーの即座失敗      | error-classification-design.md (retryable: false)              | COVERED    |

**結果**: 全9要件が設計でカバーされている。未カバー要件なし。
