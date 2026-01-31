# Phase 1 Task 3: エラーハンドリング仕様 整合性確認レポート

## 参照仕様

- `.claude/skills/aiworkflow-requirements/references/error-handling.md`

---

## リトライ戦略の整合性確認

### 基本設定の比較

| 設定項目         | error-handling.md 仕様 | SkillExecutor実装予定                           | 整合性 |
| ---------------- | ---------------------- | ----------------------------------------------- | ------ |
| 最大リトライ回数 | 3回                    | 3回（DEFAULT_RETRY_CONFIG.maxRetries）          | OK     |
| 初期待機時間     | 1000ms                 | 1000ms（DEFAULT_RETRY_CONFIG.baseDelayMs）      | OK     |
| バックオフ係数   | 2                      | 2（DEFAULT_RETRY_CONFIG.backoffMultiplier）     | OK     |
| 最大待機時間     | 30000ms                | 30000ms（DEFAULT_RETRY_CONFIG.maxDelayMs）      | OK     |
| ジッター         | ±20%                   | ±20%（DEFAULT_RETRY_CONFIG.jitterFactor = 0.2） | OK     |

### 待機時間計算の比較

| リトライ回数      | error-handling.md | SkillExecutor計算                           | 整合性 |
| ----------------- | ----------------- | ------------------------------------------- | ------ |
| 1回目 (attempt=0) | 800-1200ms        | baseDelayMs _ 2^0 _ (1 ± 0.2) = 800-1200ms  | OK     |
| 2回目 (attempt=1) | 1600-2400ms       | baseDelayMs _ 2^1 _ (1 ± 0.2) = 1600-2400ms | OK     |
| 3回目 (attempt=2) | 3200-4800ms       | baseDelayMs _ 2^2 _ (1 ± 0.2) = 3200-4800ms | OK     |

---

## リトライ対象判定の整合性

### リトライする（retryable: true）

| error-handling.md 仕様 | SkillExecutor 対応                      | 整合性              |
| ---------------------- | --------------------------------------- | ------------------- |
| HTTP 429               | errorType: "rate_limit"                 | OK                  |
| HTTP 500-503           | errorType: "server_error" (500-599全体) | 拡張対応（504含む） |
| ネットワークエラー     | errorType: "network" (5種のコード)      | OK                  |
| タイムアウト           | errorType: "timeout"                    | OK                  |

### リトライしない（retryable: false）

| error-handling.md 仕様 | SkillExecutor 対応 | 整合性 |
| ---------------------- | ------------------ | ------ |
| HTTP 400-403           | 明示的に除外       | OK     |
| HTTP 404               | 明示的に除外       | OK     |
| バリデーションエラー   | retryable: false   | OK     |
| ビジネスエラー         | retryable: false   | OK     |

---

## SkillExecutor固有の調整

### 調整不要な項目

1. **リトライ回数**: 仕様通り3回で適切
2. **バックオフ計算**: 仕様通りの Exponential Backoff with Jitter
3. **最大待機時間**: 仕様通り30秒で適切

### SkillExecutor固有の追加要件

1. **Retry-Afterヘッダー優先**: HTTP 429のRetry-Afterヘッダーがある場合、計算値よりもヘッダー値を優先する。`Math.max(retryAfterMs, baseDelayMs)` で最低でもbaseDelayMsは確保。
2. **AbortSignal連携**: リトライ中のsleep()にAbortSignalを渡し、abort()時に即座にリトライを中止する。
3. **ストリーミング通知**: リトライ発生時にRendererにretryイベントを送信する。
4. **設定可能なRetryConfig**: SkillExecutionRequestにoptionalなretryConfigを追加し、デフォルト値をオーバーライド可能にする。

---

## サーキットブレーカーとの関係

- error-handling.md でサーキットブレーカーは「将来対応」と記載されている
- 本タスクのスコープ外（リトライ機構のみ実装）
- 将来のサーキットブレーカー実装時にリトライ機構と連携する設計は可能だが、現時点では不要

---

## 結論

error-handling.md の仕様との整合性は完全に確保されている。SkillExecutor固有の追加要件（Retry-After、AbortSignal、ストリーミング通知、設定可能なRetryConfig）は仕様の拡張であり、矛盾はない。
