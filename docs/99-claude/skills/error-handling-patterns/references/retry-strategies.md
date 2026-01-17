# リトライ戦略

## 概要

リトライは一時的な障害から回復するための重要な戦略。適切な設定により、システムの回復力を高める。

## 指数バックオフ

### 基本原則

```
待機時間 = min(baseDelay × backoffMultiplier^attempt, maxDelay) ± jitter
```

### 推奨設定

| パラメータ        | 値    | 説明             |
| ----------------- | ----- | ---------------- |
| maxRetries        | 3     | 最大リトライ回数 |
| baseDelayMs       | 1000  | 初期待機時間(ms) |
| maxDelayMs        | 30000 | 最大待機時間(ms) |
| backoffMultiplier | 2     | バックオフ係数   |
| jitterPercent     | 20    | ジッター(%)      |

### 待機時間の例

| 試行  | 計算式     | 待機時間（ジッターなし） |
| ----- | ---------- | ------------------------ |
| 1回目 | 1000 × 2^0 | 1秒                      |
| 2回目 | 1000 × 2^1 | 2秒                      |
| 3回目 | 1000 × 2^2 | 4秒                      |

## ジッターの重要性

### なぜ必要か

- 同時リトライによるサーバー負荷集中を防止
- 「雷群効果」(Thundering Herd)の回避

### 実装方法

```typescript
const jitter = delay * (jitterPercent / 100);
const randomJitter = Math.random() * jitter * 2 - jitter;
const finalDelay = delay + randomJitter;
```

## リトライ可否の判定

### リトライすべきエラー

- 429 Too Many Requests
- 503 Service Unavailable
- 504 Gateway Timeout
- ネットワークタイムアウト
- 一時的なDB接続エラー

### リトライすべきでないエラー

- 400 Bad Request
- 401 Unauthorized
- 403 Forbidden
- 404 Not Found
- 409 Conflict
- 422 Unprocessable Entity

## 冪等性の確保

リトライを安全に行うには冪等性が必要:

1. **べき等キー**: リクエストに一意のキーを付与
2. **重複検知**: サーバー側で処理済みかチェック
3. **結果キャッシュ**: 同じリクエストには同じ結果を返す
