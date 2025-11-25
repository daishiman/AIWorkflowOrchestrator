# エンドポイント設計パターン

## 概要

RESTful APIのエンドポイント設計における命名規則、URLパターン、HTTPメソッドの適切な使用方法を説明します。

## URL設計原則

### 1. リソース中心の設計

```
# 良い例
GET /users
GET /users/{id}
POST /users
PUT /users/{id}
DELETE /users/{id}

# 悪い例
GET /getUsers
POST /createUser
POST /deleteUser
```

### 2. 複数形を使用

```
# 良い例
/users
/orders
/products

# 悪い例
/user
/order
/product
```

### 3. ネストは2階層まで

```
# 良い例
/users/{userId}/orders

# 悪い例（深すぎる）
/users/{userId}/orders/{orderId}/items/{itemId}/reviews
```

## HTTPメソッドの使い分け

| メソッド | 用途 | べき等性 | 安全性 |
|:---------|:-----|:--------:|:------:|
| GET | リソース取得 | ○ | ○ |
| POST | リソース作成 | × | × |
| PUT | リソース全体更新 | ○ | × |
| PATCH | リソース部分更新 | × | × |
| DELETE | リソース削除 | ○ | × |

## パスパラメータ vs クエリパラメータ

### パスパラメータ
リソースの識別に使用
```
GET /users/{userId}
GET /orders/{orderId}
```

### クエリパラメータ
フィルタリング、ソート、ページネーションに使用
```
GET /users?status=active
GET /users?sort=created_at&order=desc
GET /users?page=2&limit=20
```

## ページネーションパターン

### オフセットベース
```
GET /users?page=1&limit=20
```

レスポンス:
```json
{
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  }
}
```

### カーソルベース
```
GET /users?cursor=abc123&limit=20
```

レスポンス:
```json
{
  "data": [...],
  "pagination": {
    "nextCursor": "def456",
    "hasMore": true
  }
}
```

## フィルタリングパターン

```
# 単一フィルタ
GET /users?status=active

# 複数フィルタ
GET /users?status=active&role=admin

# 範囲フィルタ
GET /orders?created_after=2025-01-01&created_before=2025-12-31

# 検索
GET /users?search=john
```

## ソートパターン

```
# 単一ソート
GET /users?sort=created_at&order=desc

# 複数ソート
GET /users?sort=status,-created_at
```

## バージョニング

### URLパス方式（推奨）
```
/api/v1/users
/api/v2/users
```

### ヘッダー方式
```
Accept: application/vnd.example.v1+json
```

## アクション操作

リソースに対するアクションはサブリソースとして表現:

```
# 良い例
POST /orders/{id}/cancel
POST /users/{id}/activate

# 悪い例
POST /cancelOrder
POST /activateUser
```
