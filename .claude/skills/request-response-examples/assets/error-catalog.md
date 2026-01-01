# エラーカタログテンプレート

## エラーカタログ: {{API_NAME}}

**最終更新**: {{LAST_UPDATED}}
**APIバージョン**: {{API_VERSION}}

---

## 概要

このドキュメントは {{API_NAME}} で発生する可能性のある
すべてのエラーコードとその対処方法を説明します。

---

## エラーレスポンス形式

すべてのエラーは [RFC 7807](https://tools.ietf.org/html/rfc7807)
Problem Details 形式で返されます。

```json
{
  "type": "https://api.example.com/errors/{error-type}",
  "title": "エラータイトル",
  "status": 400,
  "detail": "詳細なエラーメッセージ",
  "instance": "/v1/resource/id",
  "code": "ERROR_CODE",
  "request_id": "req_xxxxx"
}
```

---

## 認証エラー (AUTH\_\*)

### AUTH_TOKEN_MISSING

| 項目           | 内容                                    |
| -------------- | --------------------------------------- |
| HTTPステータス | 401 Unauthorized                        |
| 発生条件       | Authorizationヘッダーが欠落             |
| 対処法         | リクエストにAuthorizationヘッダーを追加 |

**レスポンス例:**

```json
{
  "type": "https://api.example.com/errors/unauthorized",
  "title": "Unauthorized",
  "status": 401,
  "detail": "認証トークンが必要です",
  "code": "AUTH_TOKEN_MISSING"
}
```

**対処コード:**

```javascript
// ❌ 間違い
fetch("/api/users");

// ✅ 正しい
fetch("/api/users", {
  headers: { Authorization: `Bearer ${token}` },
});
```

---

### AUTH_TOKEN_INVALID

| 項目           | 内容                       |
| -------------- | -------------------------- |
| HTTPステータス | 401 Unauthorized           |
| 発生条件       | トークン形式が不正         |
| 対処法         | トークン形式を確認、再発行 |

**レスポンス例:**

```json
{
  "type": "https://api.example.com/errors/unauthorized",
  "title": "Unauthorized",
  "status": 401,
  "detail": "認証トークンの形式が不正です",
  "code": "AUTH_TOKEN_INVALID"
}
```

---

### AUTH_TOKEN_EXPIRED

| 項目           | 内容                           |
| -------------- | ------------------------------ |
| HTTPステータス | 401 Unauthorized               |
| 発生条件       | トークンの有効期限切れ         |
| 対処法         | トークンを更新して再リクエスト |
| リトライ可能   | ✅ （トークン更新後）          |

**レスポンス例:**

```json
{
  "type": "https://api.example.com/errors/unauthorized",
  "title": "Unauthorized",
  "status": 401,
  "detail": "認証トークンの有効期限が切れています",
  "code": "AUTH_TOKEN_EXPIRED",
  "expired_at": "2025-01-15T10:00:00Z"
}
```

---

## 権限エラー (PERMISSION\_\*)

### PERMISSION_DENIED

| 項目           | 内容                           |
| -------------- | ------------------------------ |
| HTTPステータス | 403 Forbidden                  |
| 発生条件       | リソースへのアクセス権限がない |
| 対処法         | 管理者に権限付与を依頼         |

**レスポンス例:**

```json
{
  "type": "https://api.example.com/errors/forbidden",
  "title": "Forbidden",
  "status": 403,
  "detail": "このリソースへのアクセス権限がありません",
  "code": "PERMISSION_DENIED",
  "required_permission": "admin:users:write",
  "current_permissions": ["user:read"]
}
```

---

## バリデーションエラー (VALIDATION\_\*)

### VALIDATION_REQUIRED

| 項目           | 内容                     |
| -------------- | ------------------------ |
| HTTPステータス | 422 Unprocessable Entity |
| 発生条件       | 必須フィールドが欠落     |
| 対処法         | 必須フィールドを追加     |

**レスポンス例:**

```json
{
  "type": "https://api.example.com/errors/validation-error",
  "title": "Validation Error",
  "status": 422,
  "detail": "必須フィールドが欠落しています",
  "code": "VALIDATION_REQUIRED",
  "errors": [
    {
      "field": "email",
      "code": "REQUIRED",
      "message": "emailは必須です"
    }
  ]
}
```

---

### VALIDATION_INVALID_FORMAT

| 項目           | 内容                     |
| -------------- | ------------------------ |
| HTTPステータス | 422 Unprocessable Entity |
| 発生条件       | フィールド形式が不正     |
| 対処法         | 正しい形式で値を指定     |

**レスポンス例:**

```json
{
  "type": "https://api.example.com/errors/validation-error",
  "title": "Validation Error",
  "status": 422,
  "detail": "入力形式が不正です",
  "code": "VALIDATION_INVALID_FORMAT",
  "errors": [
    {
      "field": "email",
      "code": "INVALID_FORMAT",
      "message": "有効なメールアドレス形式ではありません",
      "value": "not-an-email",
      "expected_format": "user@example.com"
    }
  ]
}
```

---

### VALIDATION_OUT_OF_RANGE

| 項目           | 内容                     |
| -------------- | ------------------------ |
| HTTPステータス | 422 Unprocessable Entity |
| 発生条件       | 値が許容範囲外           |
| 対処法         | 許容範囲内の値を指定     |

**レスポンス例:**

```json
{
  "type": "https://api.example.com/errors/validation-error",
  "title": "Validation Error",
  "status": 422,
  "detail": "値が許容範囲外です",
  "code": "VALIDATION_OUT_OF_RANGE",
  "errors": [
    {
      "field": "age",
      "code": "OUT_OF_RANGE",
      "message": "ageは0〜150の範囲で指定してください",
      "value": 200,
      "constraints": { "min": 0, "max": 150 }
    }
  ]
}
```

---

## リソースエラー (RESOURCE\_\*)

### RESOURCE_NOT_FOUND

| 項目           | 内容                           |
| -------------- | ------------------------------ |
| HTTPステータス | 404 Not Found                  |
| 発生条件       | 指定されたリソースが存在しない |
| 対処法         | リソースIDを確認               |

**レスポンス例:**

```json
{
  "type": "https://api.example.com/errors/not-found",
  "title": "Not Found",
  "status": 404,
  "detail": "指定されたユーザーが見つかりません",
  "code": "RESOURCE_NOT_FOUND",
  "resource_type": "user",
  "resource_id": "usr_nonexistent"
}
```

---

### RESOURCE_ALREADY_EXISTS

| 項目           | 内容                                 |
| -------------- | ------------------------------------ |
| HTTPステータス | 409 Conflict                         |
| 発生条件       | 同一リソースが既に存在               |
| 対処法         | 既存リソースを更新するか別の値を使用 |

**レスポンス例:**

```json
{
  "type": "https://api.example.com/errors/conflict",
  "title": "Conflict",
  "status": 409,
  "detail": "このメールアドレスは既に登録されています",
  "code": "RESOURCE_ALREADY_EXISTS",
  "conflicting_field": "email",
  "existing_resource": "/v1/users/usr_existing"
}
```

---

## レート制限エラー (RATE\_\*)

### RATE_LIMIT_EXCEEDED

| 項目           | 内容                  |
| -------------- | --------------------- |
| HTTPステータス | 429 Too Many Requests |
| 発生条件       | リクエスト制限を超過  |
| 対処法         | Retry-After後に再試行 |
| リトライ可能   | ✅                    |

**レスポンス例:**

```json
{
  "type": "https://api.example.com/errors/rate-limit-exceeded",
  "title": "Too Many Requests",
  "status": 429,
  "detail": "リクエスト制限を超えました",
  "code": "RATE_LIMIT_EXCEEDED",
  "retry_after": 60,
  "limit": 100,
  "remaining": 0,
  "reset_at": "2025-01-15T10:31:00Z"
}
```

**レスポンスヘッダー:**

```http
Retry-After: 60
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 0
X-RateLimit-Reset: 1736935860
```

---

## サーバーエラー (INTERNAL\_\*)

### INTERNAL_SERVER_ERROR

| 項目           | 内容                                               |
| -------------- | -------------------------------------------------- |
| HTTPステータス | 500 Internal Server Error                          |
| 発生条件       | 予期しないサーバーエラー                           |
| 対処法         | 時間をおいて再試行、問題が続く場合はサポートに連絡 |
| リトライ可能   | ✅（指数バックオフ推奨）                           |

**レスポンス例:**

```json
{
  "type": "https://api.example.com/errors/internal-error",
  "title": "Internal Server Error",
  "status": 500,
  "detail": "予期しないエラーが発生しました",
  "code": "INTERNAL_SERVER_ERROR",
  "request_id": "req_abc123def456"
}
```

---

## エラーコード一覧

| コード                    | ステータス | 説明               | リトライ |
| ------------------------- | ---------- | ------------------ | -------- |
| AUTH_TOKEN_MISSING        | 401        | トークン欠落       | ❌       |
| AUTH_TOKEN_INVALID        | 401        | トークン不正       | ❌       |
| AUTH_TOKEN_EXPIRED        | 401        | トークン期限切れ   | ⚠️       |
| PERMISSION_DENIED         | 403        | 権限不足           | ❌       |
| VALIDATION_REQUIRED       | 422        | 必須フィールド欠落 | ❌       |
| VALIDATION_INVALID_FORMAT | 422        | 形式不正           | ❌       |
| VALIDATION_OUT_OF_RANGE   | 422        | 範囲外             | ❌       |
| RESOURCE_NOT_FOUND        | 404        | リソース不存在     | ❌       |
| RESOURCE_ALREADY_EXISTS   | 409        | リソース重複       | ❌       |
| RATE_LIMIT_EXCEEDED       | 429        | レート制限超過     | ✅       |
| INTERNAL_SERVER_ERROR     | 500        | サーバーエラー     | ✅       |

---

## サポート

エラーが解決しない場合は、以下の情報と共にサポートにお問い合わせください：

- `request_id`
- エラーレスポンス全文
- リクエスト内容（機密情報は除く）
- 発生日時

**連絡先**: {{SUPPORT_EMAIL}}
