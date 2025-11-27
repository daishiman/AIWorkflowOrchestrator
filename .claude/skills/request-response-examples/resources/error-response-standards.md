# エラーレスポンス標準ガイド

## RFC 7807 Problem Details

### 標準構造

```json
{
  "type": "https://api.example.com/errors/validation-error",
  "title": "Validation Error",
  "status": 400,
  "detail": "リクエストボディのバリデーションに失敗しました",
  "instance": "/v1/users"
}
```

### 拡張フィールド

```json
{
  "type": "https://api.example.com/errors/validation-error",
  "title": "Validation Error",
  "status": 400,
  "detail": "リクエストボディのバリデーションに失敗しました",
  "instance": "/v1/users",
  "errors": [
    {
      "field": "email",
      "code": "INVALID_FORMAT",
      "message": "有効なメールアドレス形式ではありません"
    },
    {
      "field": "name",
      "code": "REQUIRED",
      "message": "名前は必須です"
    }
  ],
  "request_id": "req_abc123def456",
  "timestamp": "2025-01-15T10:30:00Z"
}
```

---

## HTTPステータスコード別エラー

### 400 Bad Request

**用途**: クライアントのリクエストが不正

```json
{
  "type": "https://api.example.com/errors/bad-request",
  "title": "Bad Request",
  "status": 400,
  "detail": "リクエストボディのJSONパースに失敗しました",
  "instance": "/v1/users",
  "request_id": "req_abc123"
}
```

### 401 Unauthorized

**用途**: 認証が必要または失敗

```json
{
  "type": "https://api.example.com/errors/unauthorized",
  "title": "Unauthorized",
  "status": 401,
  "detail": "認証トークンが無効または期限切れです",
  "instance": "/v1/users",
  "code": "TOKEN_EXPIRED",
  "help_url": "https://docs.example.com/authentication"
}
```

### 403 Forbidden

**用途**: 認証済みだが権限不足

```json
{
  "type": "https://api.example.com/errors/forbidden",
  "title": "Forbidden",
  "status": 403,
  "detail": "このリソースへのアクセス権限がありません",
  "instance": "/v1/admin/users",
  "required_permission": "admin:users:read",
  "current_permissions": ["user:read", "user:write"]
}
```

### 404 Not Found

**用途**: リソースが存在しない

```json
{
  "type": "https://api.example.com/errors/not-found",
  "title": "Not Found",
  "status": 404,
  "detail": "指定されたユーザーが見つかりません",
  "instance": "/v1/users/usr_nonexistent",
  "resource_type": "user",
  "resource_id": "usr_nonexistent"
}
```

### 409 Conflict

**用途**: リソースの競合

```json
{
  "type": "https://api.example.com/errors/conflict",
  "title": "Conflict",
  "status": 409,
  "detail": "このメールアドレスは既に登録されています",
  "instance": "/v1/users",
  "conflicting_field": "email",
  "existing_resource": "/v1/users/usr_existing123"
}
```

### 422 Unprocessable Entity

**用途**: バリデーションエラー

```json
{
  "type": "https://api.example.com/errors/validation-error",
  "title": "Validation Error",
  "status": 422,
  "detail": "入力データのバリデーションに失敗しました",
  "instance": "/v1/users",
  "errors": [
    {
      "field": "email",
      "code": "INVALID_FORMAT",
      "message": "有効なメールアドレス形式ではありません",
      "value": "invalid-email"
    },
    {
      "field": "age",
      "code": "OUT_OF_RANGE",
      "message": "年齢は0〜150の範囲で指定してください",
      "value": 200,
      "constraints": {"min": 0, "max": 150}
    }
  ]
}
```

### 429 Too Many Requests

**用途**: レート制限

```json
{
  "type": "https://api.example.com/errors/rate-limit-exceeded",
  "title": "Too Many Requests",
  "status": 429,
  "detail": "リクエスト制限を超えました。しばらく待ってから再試行してください",
  "instance": "/v1/users",
  "retry_after": 60,
  "limit": 100,
  "remaining": 0,
  "reset_at": "2025-01-15T10:31:00Z"
}
```

HTTPヘッダー:

```http
HTTP/1.1 429 Too Many Requests
Retry-After: 60
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 0
X-RateLimit-Reset: 1736935860
```

### 500 Internal Server Error

**用途**: サーバー側エラー

```json
{
  "type": "https://api.example.com/errors/internal-error",
  "title": "Internal Server Error",
  "status": 500,
  "detail": "予期しないエラーが発生しました。問題が続く場合はサポートにお問い合わせください",
  "instance": "/v1/users",
  "request_id": "req_abc123def456",
  "support_url": "https://support.example.com"
}
```

### 503 Service Unavailable

**用途**: サービス一時停止

```json
{
  "type": "https://api.example.com/errors/service-unavailable",
  "title": "Service Unavailable",
  "status": 503,
  "detail": "サービスは現在メンテナンス中です",
  "instance": "/v1/users",
  "retry_after": 1800,
  "maintenance_end": "2025-01-15T12:00:00Z",
  "status_page": "https://status.example.com"
}
```

---

## エラーコード体系

### 命名規則

```
{CATEGORY}_{SPECIFIC_ERROR}

例:
AUTH_TOKEN_EXPIRED
AUTH_INVALID_CREDENTIALS
VALIDATION_REQUIRED_FIELD
VALIDATION_INVALID_FORMAT
RESOURCE_NOT_FOUND
RESOURCE_ALREADY_EXISTS
RATE_LIMIT_EXCEEDED
PAYMENT_DECLINED
```

### カテゴリ一覧

| カテゴリ | 説明 | 例 |
|---------|------|-----|
| AUTH | 認証・認可 | AUTH_TOKEN_EXPIRED |
| VALIDATION | 入力検証 | VALIDATION_REQUIRED |
| RESOURCE | リソース操作 | RESOURCE_NOT_FOUND |
| RATE | レート制限 | RATE_LIMIT_EXCEEDED |
| PAYMENT | 決済関連 | PAYMENT_DECLINED |
| EXTERNAL | 外部サービス | EXTERNAL_SERVICE_ERROR |
| INTERNAL | 内部エラー | INTERNAL_DATABASE_ERROR |

---

## リトライ可能性

### リトライ可能なエラー

```json
{
  "type": "https://api.example.com/errors/service-unavailable",
  "status": 503,
  "retryable": true,
  "retry_after": 30,
  "max_retries": 3
}
```

### リトライ不可能なエラー

```json
{
  "type": "https://api.example.com/errors/validation-error",
  "status": 422,
  "retryable": false,
  "detail": "リクエストを修正してから再試行してください"
}
```

### リトライ判定表

| ステータス | リトライ可能 | 条件 |
|-----------|-------------|------|
| 400 | ❌ | リクエスト修正が必要 |
| 401 | ⚠️ | トークン更新後に可能 |
| 403 | ❌ | 権限変更が必要 |
| 404 | ❌ | リソースが存在しない |
| 409 | ⚠️ | 競合解決後に可能 |
| 422 | ❌ | 入力修正が必要 |
| 429 | ✅ | Retry-After後に可能 |
| 500 | ✅ | 指数バックオフで再試行 |
| 502 | ✅ | 一時的な接続問題 |
| 503 | ✅ | Retry-After後に可能 |
| 504 | ✅ | タイムアウト、再試行可能 |

---

## 多言語対応

### Accept-Language使用

リクエスト:

```http
GET /v1/users/invalid HTTP/1.1
Accept-Language: ja
```

レスポンス:

```json
{
  "type": "https://api.example.com/errors/not-found",
  "title": "リソースが見つかりません",
  "status": 404,
  "detail": "指定されたユーザーは存在しません",
  "locale": "ja"
}
```

### エラーコードベース

```json
{
  "code": "RESOURCE_NOT_FOUND",
  "messages": {
    "en": "The specified user does not exist",
    "ja": "指定されたユーザーは存在しません"
  }
}
```

---

## 実装例（TypeScript）

```typescript
// types/error.ts
interface ProblemDetails {
  type: string;
  title: string;
  status: number;
  detail: string;
  instance: string;
  // 拡張フィールド
  code?: string;
  errors?: ValidationError[];
  request_id?: string;
  timestamp?: string;
  retryable?: boolean;
  retry_after?: number;
}

interface ValidationError {
  field: string;
  code: string;
  message: string;
  value?: unknown;
  constraints?: Record<string, unknown>;
}

// lib/errors.ts
export function createValidationError(
  instance: string,
  errors: ValidationError[]
): ProblemDetails {
  return {
    type: 'https://api.example.com/errors/validation-error',
    title: 'Validation Error',
    status: 422,
    detail: `${errors.length}件のバリデーションエラーがあります`,
    instance,
    errors,
    request_id: generateRequestId(),
    timestamp: new Date().toISOString(),
    retryable: false
  };
}

export function createNotFoundError(
  instance: string,
  resourceType: string,
  resourceId: string
): ProblemDetails {
  return {
    type: 'https://api.example.com/errors/not-found',
    title: 'Not Found',
    status: 404,
    detail: `指定された${resourceType}が見つかりません`,
    instance,
    code: 'RESOURCE_NOT_FOUND',
    request_id: generateRequestId(),
    timestamp: new Date().toISOString(),
    retryable: false
  };
}
```

---

## チェックリスト

### エラーレスポンス設計
- [ ] RFC 7807形式に準拠
- [ ] HTTPステータスコードが適切
- [ ] エラーコードが体系的
- [ ] リトライ可能性が明示
- [ ] request_idが含まれる

### ドキュメント化
- [ ] 全エラーコードを列挙
- [ ] 各エラーの対処法を記載
- [ ] サンプルレスポンスを提供
- [ ] 多言語対応を説明
