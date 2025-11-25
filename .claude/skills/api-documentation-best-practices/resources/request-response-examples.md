# リクエスト/レスポンス例

## 概要

実際に使用できる具体的なリクエスト/レスポンス例の作成方法です。コピペで動作するサンプルを提供することで、API利用者の理解を促進します。

## 成功ケースの記述

### リソース作成（POST）

**リクエスト**:
```http
POST /api/v1/users HTTP/1.1
Host: api.example.com
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "role": "user"
}
```

**レスポンス（201 Created）**:
```http
HTTP/1.1 201 Created
Content-Type: application/json
Location: /api/v1/users/550e8400-e29b-41d4-a716-446655440000

{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "John Doe",
  "email": "john@example.com",
  "role": "user",
  "createdAt": "2025-01-15T10:30:00Z",
  "updatedAt": "2025-01-15T10:30:00Z"
}
```

### リソース取得（GET）

**リクエスト**:
```http
GET /api/v1/users/550e8400-e29b-41d4-a716-446655440000 HTTP/1.1
Host: api.example.com
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

**レスポンス（200 OK）**:
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "John Doe",
  "email": "john@example.com",
  "role": "user",
  "createdAt": "2025-01-15T10:30:00Z",
  "updatedAt": "2025-01-15T10:30:00Z"
}
```

### 一覧取得（GET with pagination）

**リクエスト**:
```http
GET /api/v1/users?page=1&limit=10&status=active HTTP/1.1
Host: api.example.com
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

**レスポンス（200 OK）**:
```json
{
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "name": "John Doe",
      "email": "john@example.com"
    },
    {
      "id": "550e8400-e29b-41d4-a716-446655440001",
      "name": "Jane Smith",
      "email": "jane@example.com"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 42,
    "totalPages": 5
  }
}
```

## エラーケースの記述

### バリデーションエラー（400）

**リクエスト**:
```json
{
  "name": "",
  "email": "invalid-email"
}
```

**レスポンス（400 Bad Request）**:
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "入力値が不正です",
    "details": [
      {
        "field": "name",
        "message": "名前は必須です"
      },
      {
        "field": "email",
        "message": "有効なメールアドレス形式で入力してください"
      }
    ]
  }
}
```

### 認証エラー（401）

**レスポンス（401 Unauthorized）**:
```json
{
  "error": {
    "code": "UNAUTHORIZED",
    "message": "認証が必要です"
  }
}
```

### リソース未検出（404）

**レスポンス（404 Not Found）**:
```json
{
  "error": {
    "code": "NOT_FOUND",
    "message": "指定されたユーザーが見つかりません",
    "details": {
      "resourceType": "User",
      "resourceId": "550e8400-e29b-41d4-a716-446655440000"
    }
  }
}
```

### サーバーエラー（500）

**レスポンス（500 Internal Server Error）**:
```json
{
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "サーバーエラーが発生しました",
    "requestId": "req_abc123xyz"
  }
}
```

## cURLコマンド例

### POST
```bash
curl -X POST https://api.example.com/v1/users \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com"
  }'
```

### GET
```bash
curl -X GET "https://api.example.com/v1/users?page=1&limit=10" \
  -H "Authorization: Bearer $TOKEN"
```

### DELETE
```bash
curl -X DELETE https://api.example.com/v1/users/550e8400 \
  -H "Authorization: Bearer $TOKEN"
```
