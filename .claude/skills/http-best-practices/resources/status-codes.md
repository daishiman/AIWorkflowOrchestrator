# HTTP Status Codes（HTTPステータスコード）

## 概要

HTTPステータスコードはサーバーからクライアントへの処理結果を伝える重要な仕組みです。
適切なステータスコードの選択は、APIの使いやすさとデバッグ効率に直結します。

## ステータスコードカテゴリ

| 範囲 | カテゴリ           | 説明                               |
| ---- | ------------------ | ---------------------------------- |
| 1xx  | 情報               | リクエスト処理中（ほぼ使用しない） |
| 2xx  | 成功               | リクエスト正常完了                 |
| 3xx  | リダイレクト       | 追加アクションが必要               |
| 4xx  | クライアントエラー | リクエストに問題                   |
| 5xx  | サーバーエラー     | サーバー側で問題                   |

## 2xx 成功系

### 200 OK

最も一般的な成功レスポンス。ボディにデータを含む場合に使用。

```typescript
// GET - リソース取得
GET /api/users/123
→ 200 OK
{
  "id": "123",
  "name": "John Doe",
  "email": "john@example.com"
}

// PUT - リソース更新
PUT /api/users/123
→ 200 OK
{
  "id": "123",
  "name": "John Updated",
  "updatedAt": "2024-01-15T10:30:00Z"
}
```

### 201 Created

新規リソース作成成功時。Locationヘッダーでリソースの場所を示す。

```typescript
POST /api/users
{
  "name": "New User",
  "email": "new@example.com"
}

→ 201 Created
Location: /api/users/456
{
  "id": "456",
  "name": "New User",
  "createdAt": "2024-01-15T10:30:00Z"
}
```

### 202 Accepted

非同期処理の受付完了時。処理状況を確認するURLを提供。

```typescript
POST /api/reports/generate
{
  "type": "monthly",
  "period": "2024-01"
}

→ 202 Accepted
{
  "jobId": "job-789",
  "status": "pending",
  "statusUrl": "/api/jobs/job-789",
  "estimatedCompletion": "2024-01-15T10:35:00Z"
}
```

### 204 No Content

成功したがレスポンスボディなし。DELETE成功時に使用。

```typescript
DELETE /api/users/123

→ 204 No Content
(ボディなし)
```

## 4xx クライアントエラー

### 400 Bad Request

リクエストの構文エラー、不正なJSON、必須フィールド欠落。

```typescript
POST /api/users
{
  "email": "not-an-email"  // 不正な形式
}

→ 400 Bad Request
{
  "error": {
    "code": "INVALID_REQUEST",
    "message": "Request validation failed",
    "details": [
      {
        "field": "email",
        "code": "INVALID_FORMAT",
        "message": "Invalid email format"
      },
      {
        "field": "name",
        "code": "REQUIRED",
        "message": "Name is required"
      }
    ]
  }
}
```

### 401 Unauthorized

認証が必要、または認証情報が無効。

```typescript
GET /api/protected-resource
Authorization: Bearer invalid-token

→ 401 Unauthorized
WWW-Authenticate: Bearer realm="api", error="invalid_token"
{
  "error": {
    "code": "AUTHENTICATION_FAILED",
    "message": "Invalid or expired token"
  }
}
```

### 403 Forbidden

認証済みだが、権限がない。

```typescript
DELETE /api/admin/users/123
Authorization: Bearer valid-user-token  // 管理者権限なし

→ 403 Forbidden
{
  "error": {
    "code": "ACCESS_DENIED",
    "message": "Admin role required for this operation"
  }
}
```

### 404 Not Found

リソースが存在しない。

```typescript
GET /api/users/nonexistent-id

→ 404 Not Found
{
  "error": {
    "code": "RESOURCE_NOT_FOUND",
    "message": "User not found",
    "resourceType": "User",
    "resourceId": "nonexistent-id"
  }
}
```

### 409 Conflict

リソースの競合。楽観ロック失敗、一意制約違反など。

```typescript
// 楽観ロック失敗
PUT /api/users/123
If-Match: "etag-old-version"
{
  "name": "Updated Name"
}

→ 409 Conflict
{
  "error": {
    "code": "CONCURRENT_MODIFICATION",
    "message": "Resource was modified by another request",
    "currentETag": "etag-new-version"
  }
}

// 一意制約違反
POST /api/users
{
  "email": "existing@example.com"
}

→ 409 Conflict
{
  "error": {
    "code": "DUPLICATE_RESOURCE",
    "message": "User with this email already exists",
    "conflictingField": "email"
  }
}
```

### 422 Unprocessable Entity

構文は正しいがビジネスロジックエラー。

```typescript
POST /api/orders
{
  "productId": "prod-123",
  "quantity": 100
}

→ 422 Unprocessable Entity
{
  "error": {
    "code": "BUSINESS_RULE_VIOLATION",
    "message": "Insufficient stock",
    "details": {
      "availableStock": 50,
      "requestedQuantity": 100
    }
  }
}
```

### 429 Too Many Requests

レート制限超過。

```typescript
GET /api/data

→ 429 Too Many Requests
Retry-After: 60
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 0
X-RateLimit-Reset: 1705312800
{
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Too many requests",
    "retryAfter": 60
  }
}
```

## 5xx サーバーエラー

### 500 Internal Server Error

予期しないサーバーエラー。詳細は隠す。

```typescript
GET /api/data

→ 500 Internal Server Error
{
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "An unexpected error occurred",
    "requestId": "req-abc-123"  // デバッグ用
  }
}

// サーバーログには詳細を記録
// {
//   requestId: "req-abc-123",
//   stack: "Error: Database connection failed\n    at ...",
//   context: { userId: "123", endpoint: "/api/data" }
// }
```

### 502 Bad Gateway

上流サービスからの無効なレスポンス。

```typescript
→ 502 Bad Gateway
{
  "error": {
    "code": "UPSTREAM_ERROR",
    "message": "Invalid response from upstream service",
    "requestId": "req-def-456"
  }
}
```

### 503 Service Unavailable

サービスが一時的に利用不可。メンテナンス、過負荷など。

```typescript
→ 503 Service Unavailable
Retry-After: 300
{
  "error": {
    "code": "SERVICE_UNAVAILABLE",
    "message": "Service temporarily unavailable",
    "retryAfter": 300,
    "reason": "scheduled_maintenance"
  }
}
```

### 504 Gateway Timeout

上流サービスからの応答タイムアウト。

```typescript
→ 504 Gateway Timeout
{
  "error": {
    "code": "UPSTREAM_TIMEOUT",
    "message": "Upstream service timed out",
    "requestId": "req-ghi-789"
  }
}
```

## エラーレスポンス設計

### 統一フォーマット

```typescript
interface ErrorResponse {
  error: {
    // 必須フィールド
    code: string; // 機械可読コード
    message: string; // 人間可読メッセージ

    // オプションフィールド
    details?: unknown[]; // 詳細情報（バリデーションエラーなど）
    requestId?: string; // デバッグ用リクエストID
    retryAfter?: number; // リトライ待機秒数
    documentationUrl?: string; // 関連ドキュメント
  };
}
```

### エラーコード設計

```typescript
// カテゴリ別プレフィックス
const ErrorCodes = {
  // 認証・認可
  AUTH_INVALID_CREDENTIALS: "AUTH_001",
  AUTH_TOKEN_EXPIRED: "AUTH_002",
  AUTH_INSUFFICIENT_PERMISSIONS: "AUTH_003",

  // バリデーション
  VALIDATION_REQUIRED_FIELD: "VAL_001",
  VALIDATION_INVALID_FORMAT: "VAL_002",
  VALIDATION_OUT_OF_RANGE: "VAL_003",

  // ビジネスロジック
  BUSINESS_INSUFFICIENT_STOCK: "BIZ_001",
  BUSINESS_DUPLICATE_ORDER: "BIZ_002",

  // システム
  SYSTEM_INTERNAL_ERROR: "SYS_001",
  SYSTEM_UPSTREAM_ERROR: "SYS_002",
  SYSTEM_RATE_LIMITED: "SYS_003",
} as const;
```

## 実装パターン

### Express.js エラーハンドラー

```typescript
import { Request, Response, NextFunction } from "express";

class AppError extends Error {
  constructor(
    public statusCode: number,
    public code: string,
    message: string,
    public details?: unknown,
  ) {
    super(message);
  }
}

function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction,
): void {
  const requestId = req.headers["x-request-id"] || generateRequestId();

  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      error: {
        code: err.code,
        message: err.message,
        details: err.details,
        requestId,
      },
    });
  } else {
    // 予期しないエラー
    console.error({ requestId, error: err });

    res.status(500).json({
      error: {
        code: "INTERNAL_ERROR",
        message: "An unexpected error occurred",
        requestId,
      },
    });
  }
}
```

## チェックリスト

### 設計時

- [ ] 各エンドポイントに想定されるステータスコードをドキュメント化しているか？
- [ ] エラーレスポンスの形式が統一されているか？
- [ ] エラーコードが一意で識別可能か？

### 実装時

- [ ] 適切なステータスコードを使用しているか（200で全部返していないか）？
- [ ] 5xxエラーで詳細を隠し、ログに記録しているか？
- [ ] リクエストIDを含めているか？

### 運用時

- [ ] ステータスコード別のメトリクスを収集しているか？
- [ ] 4xx/5xxエラー率にアラートを設定しているか？
- [ ] エラーログの保持期間は適切か？

## 参考

- **RFC 9110**: HTTP Semantics (Status Codes)
- **MDN Web Docs**: HTTP response status codes
