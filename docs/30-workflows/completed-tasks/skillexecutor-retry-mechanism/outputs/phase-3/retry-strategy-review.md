# Phase 3 Task 2: リトライ戦略レビュー結果

## Exponential Backoff 計算結果検算

| attempt | baseDelay \* 2^attempt | cappedDelay (max=30000) | Jitter最小 (×0.8) | Jitter最大 (×1.2) |
| ------- | ---------------------- | ----------------------- | ----------------- | ----------------- |
| 0       | 1000 \* 1 = 1000ms     | 1000ms                  | 800ms             | 1200ms            |
| 1       | 1000 \* 2 = 2000ms     | 2000ms                  | 1600ms            | 2400ms            |
| 2       | 1000 \* 4 = 4000ms     | 4000ms                  | 3200ms            | 4800ms            |

**検算結果**: 正しい。仕様 (error-handling.md) と一致。

## 最悪ケースの総待機時間

- 3回リトライ時の最大待機時間合計: 1200 + 2400 + 4800 = **8,400ms**
- 3回リトライ時の最小待機時間合計: 800 + 1600 + 3200 = **5,600ms**
- 平均待機時間: 1000 + 2000 + 4000 = **7,000ms**

**判定**: 適切。最悪でも約8.4秒で完了し、ユーザー体験を著しく損なわない。

## Retry-Afterヘッダー対応の検証

- Retry-After指定時: `Math.max(retryAfterMs, baseDelayMs)` → baseDelayMs以上を保証
- Retry-Afterが非常に大きい場合: maxDelayMsでキャップされない設計
  - **MINOR指摘**: Retry-After値が極端に大きい場合（例: 86400秒=24時間）の対応が未検討
  - **対応**: 実装時にRetry-Afterの上限値を設ける（maxDelayMsまたは別途上限定数）

## 無限リトライ防止策

- maxRetries (デフォルト3) で上限制御: OK
- attempt >= maxRetries で必ず throw: OK
- リトライループ外に fallback throw あり: OK

**判定**: 無限リトライは発生しない。

## abort()によるリトライ即座中止

- ループ先頭で abortSignal.aborted チェック: OK
- sleep() に AbortSignal 渡し: OK
- callSDKQuery() にも AbortSignal 渡し: OK

**判定**: abort()呼び出し時に最大限速やかにリトライが中止される。

## 総合判定

| 観点             | 結果  | 備考                           |
| ---------------- | ----- | ------------------------------ |
| 計算正確性       | OK    | 仕様と一致                     |
| 最悪ケース       | OK    | 8.4秒以内                      |
| Retry-After      | MINOR | 極端な値への対応を実装時に検討 |
| 無限リトライ防止 | OK    | maxRetriesで制御               |
| abort連携        | OK    | 3箇所でチェック                |
