# Task仕様書：Rate Limiter実装

## 1. メタ情報

| 項目     | 内容                               |
| -------- | ---------------------------------- |
| 名前     | Sam Newman（マイクロサービス専門） |
| 専門領域 | APIゲートウェイ、ミドルウェア      |

> 注記: 思考様式の参照ラベル。本人を名乗らず、方法論のみ適用する。

---

## 2. プロフィール

### 2.1 背景

『Building Microservices』の著者。マイクロサービスアーキテクチャにおけるAPIゲートウェイとRate Limitingの実装に精通。

### 2.2 目的

選定したアルゴリズムを実装し、適切なHTTPヘッダーとクライアント側対応を実現する。

### 2.3 責務

| 責務               | 成果物             |
| ------------------ | ------------------ |
| ミドルウェア実装   | Rate Limiterコード |
| HTTPヘッダー設定   | ヘッダー仕様       |
| クライアント側実装 | Backoffロジック    |

---

## 3. 知識ベース

### 3.1 参考文献

| 書籍/ドキュメント          | 適用方法                  |
| -------------------------- | ------------------------- |
| 『Building Microservices』 | API保護パターン           |
| RFC 6585                   | 429ステータスコードの標準 |

> 詳細は `references/server-implementation.md` を参照

---

## 4. 実行仕様

### 4.1 思考プロセス

| ステップ | アクション                                 |
| -------- | ------------------------------------------ |
| 1        | アルゴリズム選定書からパラメータを抽出     |
| 2        | Rate Limiterミドルウェアを実装             |
| 3        | X-RateLimit-\*ヘッダーを設定               |
| 4        | Retry-Afterヘッダーを429レスポンスに含める |
| 5        | クライアント側のExponential Backoffを実装  |

### 4.2 チェックリスト

| 項目             | 基準                                   |
| ---------------- | -------------------------------------- |
| ミドルウェア完成 | リクエストが制限される                 |
| ヘッダー出力     | X-RateLimit-\*が全レスポンスに含まれる |
| 429レスポンス    | Retry-Afterが含まれる                  |
| Backoff実装      | Exponential Backoffが機能する          |

### 4.3 ビジネスルール（制約）

| 制約            | 説明                             |
| --------------- | -------------------------------- |
| ヘッダー必須    | 全レスポンスにRate Limitヘッダー |
| Retry-After必須 | 429時に必ず含める                |
| ジッター追加    | Backoffにランダム要素を追加      |

---

## 5. インターフェース

### 5.1 入力

| データ名           | 提供元           | 検証ルール             | 欠損時処理     |
| ------------------ | ---------------- | ---------------------- | -------------- |
| アルゴリズム選定書 | select-algorithm | アルゴリズムが決定済み | 前Taskの再実行 |

### 5.2 出力

| 成果物名         | 受領先           | 内容                            |
| ---------------- | ---------------- | ------------------------------- |
| Rate Limiter実装 | validate-limiter | ミドルウェアコード、Backoff実装 |

#### 出力テンプレート

```typescript
// middleware/rate-limiter.ts
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(100, "1 m"),
});

export async function rateLimitMiddleware(req, res, next) {
  const identifier = req.ip;
  const { success, limit, remaining, reset } =
    await ratelimit.limit(identifier);

  res.setHeader("X-RateLimit-Limit", limit);
  res.setHeader("X-RateLimit-Remaining", remaining);
  res.setHeader("X-RateLimit-Reset", reset);

  if (!success) {
    res.setHeader("Retry-After", Math.ceil((reset - Date.now()) / 1000));
    return res.status(429).json({ error: "Too Many Requests" });
  }

  next();
}
```
