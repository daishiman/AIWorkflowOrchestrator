# Idempotency（冪等性）

## 概要

冪等性とは、同じ操作を複数回実行しても、1回実行した場合と同じ結果になる性質です。
ネットワーク障害やタイムアウト後のリトライを安全に行うために不可欠な概念です。

## HTTPメソッドと冪等性

| メソッド | 冪等 | 安全 | 説明                         |
| -------- | ---- | ---- | ---------------------------- |
| GET      | ✅   | ✅   | リソース取得（副作用なし）   |
| HEAD     | ✅   | ✅   | ヘッダーのみ取得             |
| OPTIONS  | ✅   | ✅   | サポートメソッド取得         |
| PUT      | ✅   | ❌   | リソースの完全置換           |
| DELETE   | ✅   | ❌   | リソース削除                 |
| POST     | ❌   | ❌   | リソース作成・アクション実行 |
| PATCH    | ❌   | ❌   | リソースの部分更新           |

### 冪等 vs 安全

- **安全（Safe）**: サーバー状態を変更しない（GETなど）
- **冪等（Idempotent）**: 複数回実行しても同じ結果

```
GET /users/123    → 常に同じユーザーを返す（安全かつ冪等）
PUT /users/123    → 常に同じ状態に更新（冪等だが安全ではない）
POST /users       → 毎回新しいユーザーを作成（冪等ではない）
```

## 冪等キーパターン

### 基本実装

```typescript
// クライアント側
const idempotencyKey = crypto.randomUUID();

const response = await fetch("/api/payments", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "Idempotency-Key": idempotencyKey,
  },
  body: JSON.stringify({
    amount: 1000,
    currency: "JPY",
  }),
});

// リトライ時も同じキーを使用
if (!response.ok && isRetryable(response.status)) {
  // 同じ idempotencyKey で再送
}
```

### サーバー側実装

```typescript
interface IdempotencyRecord {
  key: string;
  status: "processing" | "completed" | "failed";
  requestHash: string;
  response?: {
    statusCode: number;
    body: unknown;
    headers: Record<string, string>;
  };
  createdAt: Date;
  expiresAt: Date;
}

class IdempotencyService {
  private readonly store: Map<string, IdempotencyRecord> = new Map();
  private readonly ttl = 24 * 60 * 60 * 1000; // 24時間

  async execute<T>(
    key: string,
    requestHash: string,
    handler: () => Promise<T>,
  ): Promise<{ isNew: boolean; result: T }> {
    // 既存レコードをチェック
    const existing = this.store.get(key);

    if (existing) {
      // リクエスト内容が異なる場合はエラー
      if (existing.requestHash !== requestHash) {
        throw new ConflictError(
          "Idempotency key already used with different request",
        );
      }

      // 処理中の場合は待機
      if (existing.status === "processing") {
        throw new ConflictError("Request is already being processed");
      }

      // 完了済みの場合はキャッシュを返す
      if (existing.status === "completed" && existing.response) {
        return { isNew: false, result: existing.response.body as T };
      }
    }

    // 新規処理開始
    const record: IdempotencyRecord = {
      key,
      status: "processing",
      requestHash,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + this.ttl),
    };
    this.store.set(key, record);

    try {
      const result = await handler();

      // 成功を記録
      record.status = "completed";
      record.response = {
        statusCode: 200,
        body: result,
        headers: {},
      };

      return { isNew: true, result };
    } catch (error) {
      // 失敗を記録
      record.status = "failed";
      throw error;
    }
  }
}
```

### Express.js ミドルウェア

```typescript
import { Request, Response, NextFunction } from "express";
import crypto from "crypto";

const idempotencyService = new IdempotencyService();

function idempotencyMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const idempotencyKey = req.headers["idempotency-key"] as string | undefined;

  // POSTリクエストでキーが必須
  if (req.method === "POST" && !idempotencyKey) {
    res.status(400).json({
      error: {
        code: "IDEMPOTENCY_KEY_REQUIRED",
        message: "Idempotency-Key header is required for POST requests",
      },
    });
    return;
  }

  if (!idempotencyKey) {
    next();
    return;
  }

  // リクエストハッシュを生成
  const requestHash = crypto
    .createHash("sha256")
    .update(
      JSON.stringify({
        method: req.method,
        path: req.path,
        body: req.body,
      }),
    )
    .digest("hex");

  // コンテキストに保存
  req.idempotency = { key: idempotencyKey, requestHash };

  next();
}
```

## 冪等なAPI設計

### PUT vs POST

```typescript
// ❌ 非冪等：POSTで作成
POST /api/orders
{ "productId": "prod-123", "quantity": 1 }
// 2回送ると2つの注文ができる

// ✅ 冪等：クライアント生成IDでPUT
PUT /api/orders/order-abc-123
{ "productId": "prod-123", "quantity": 1 }
// 2回送っても1つの注文のみ
```

### 条件付きリクエスト

```typescript
// 楽観的ロック（ETag）
GET /api/users/123
→ ETag: "v1-hash"
{
  "name": "John"
}

PUT /api/users/123
If-Match: "v1-hash"
{
  "name": "John Updated"
}
→ 200 OK (成功)
→ 412 Precondition Failed (競合)
```

### 状態遷移の冪等化

```typescript
// ❌ 非冪等：増減操作
POST /api/accounts/123/deposit
{ "amount": 100 }
// 2回送ると200増える

// ✅ 冪等：絶対値設定
PUT /api/accounts/123/balance
{ "newBalance": 1100, "previousBalance": 1000 }
// 2回送っても結果は同じ

// ✅ 冪等：トランザクションID使用
POST /api/accounts/123/transactions
{
  "transactionId": "tx-unique-id",
  "type": "deposit",
  "amount": 100
}
// 同じtransactionIdは1回のみ処理
```

## データベース設計

### 一意制約による保護

```sql
-- 冪等キーテーブル
CREATE TABLE idempotency_keys (
  key TEXT PRIMARY KEY,
  request_hash TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'processing',
  response_status INTEGER,
  response_body TEXT,  -- JSON stored as TEXT
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  expires_at INTEGER NOT NULL,

  CHECK (status IN ('processing', 'completed', 'failed'))
);

-- 定期クリーンアップ
CREATE INDEX idx_idempotency_expires ON idempotency_keys(expires_at);

-- トランザクションID（業務レベル）
CREATE TABLE transactions (
  id TEXT PRIMARY KEY,  -- クライアント指定ID
  account_id TEXT NOT NULL,
  type TEXT NOT NULL,
  amount REAL NOT NULL,
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),

  UNIQUE(id)  -- 重複防止
);
```

### 楽観的ロック実装

```typescript
interface VersionedEntity {
  id: string;
  version: number;
  data: unknown;
}

async function updateWithOptimisticLock(
  id: string,
  expectedVersion: number,
  newData: unknown,
): Promise<VersionedEntity> {
  const result = await db.query(
    `
    UPDATE entities
    SET data = $1, version = version + 1
    WHERE id = $2 AND version = $3
    RETURNING *
  `,
    [newData, id, expectedVersion],
  );

  if (result.rowCount === 0) {
    throw new ConflictError("Entity was modified by another request");
  }

  return result.rows[0];
}
```

## キー生成戦略

### UUID v4

```typescript
// 最もシンプル - ランダム生成
const key = crypto.randomUUID();
// "550e8400-e29b-41d4-a716-446655440000"
```

### コンテンツベース

```typescript
// リクエスト内容からハッシュ生成
function generateIdempotencyKey(request: {
  userId: string;
  action: string;
  params: unknown;
}): string {
  const content = JSON.stringify(request);
  return crypto.createHash("sha256").update(content).digest("hex");
}
```

### 複合キー

```typescript
// ユーザー + タイムスタンプ + ランダム
function generateUserScopedKey(userId: string): string {
  const timestamp = Date.now().toString(36);
  const random = crypto.randomBytes(8).toString("hex");
  return `${userId}:${timestamp}:${random}`;
}
```

## チェックリスト

### 設計時

- [ ] どのエンドポイントに冪等性が必要か特定したか？
- [ ] 冪等キーの形式とTTLを決定したか？
- [ ] 競合時の動作を定義したか？

### 実装時

- [ ] 冪等キーのストレージを選択したか（Redis、DB）？
- [ ] 処理中状態のハンドリングを実装したか？
- [ ] リクエスト内容の整合性チェックを実装したか？

### 運用時

- [ ] 期限切れキーのクリーンアップが設定されているか？
- [ ] 冪等キーのヒット率をモニタリングしているか？
- [ ] ストレージ容量を監視しているか？

## アンチパターン

### ❌ 全エンドポイントに冪等キー

```typescript
// NG: GETにも冪等キーを要求
GET /api/users
Idempotency-Key: xxx  // 不要
```

### ❌ 短すぎるTTL

```typescript
// NG: 1分では短すぎる（リトライ間に合わない）
const ttl = 60 * 1000; // 1分
// → 最低24時間を推奨
```

### ❌ リクエスト内容チェックなし

```typescript
// NG: 同じキーで異なる内容を許可
POST /api/payments
Idempotency-Key: key-1
{ "amount": 100 }

POST /api/payments
Idempotency-Key: key-1
{ "amount": 200 }  // 異なる金額 - エラーにすべき
```

## 参考

- **RFC 9651**: The Idempotency-Key HTTP Header Field (Draft)
- **Stripe API**: Idempotent Requests
- **AWS API Gateway**: Idempotency Pattern
