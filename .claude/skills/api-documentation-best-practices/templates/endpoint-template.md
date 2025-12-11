# [エンドポイント名]

## 概要

| 項目         | 値                                          |
| :----------- | :------------------------------------------ |
| **メソッド** | `GET` / `POST` / `PUT` / `PATCH` / `DELETE` |
| **パス**     | `/api/v1/resource/{id}`                     |
| **認証**     | Bearer Token / API Key / OAuth 2.0          |
| **権限**     | `read:resource` / `write:resource`          |

[エンドポイントの目的を1-2文で説明]

## リクエスト

### パスパラメータ

| パラメータ | 型     | 必須 | 説明                             |
| :--------- | :----- | :--: | :------------------------------- |
| `id`       | string |  ○   | リソースの一意識別子（UUID形式） |

### クエリパラメータ

| パラメータ | 型      | 必須 | デフォルト   | 説明                           |
| :--------- | :------ | :--: | :----------- | :----------------------------- |
| `page`     | integer |  -   | 1            | ページ番号                     |
| `limit`    | integer |  -   | 20           | 1ページあたりの件数（最大100） |
| `sort`     | string  |  -   | `created_at` | ソートフィールド               |
| `order`    | string  |  -   | `desc`       | ソート順序（`asc` / `desc`）   |

### リクエストヘッダー

| ヘッダー          | 値                 | 必須 | 説明                   |
| :---------------- | :----------------- | :--: | :--------------------- |
| `Authorization`   | `Bearer {token}`   |  ○   | アクセストークン       |
| `Content-Type`    | `application/json` |  ○   | リクエストボディの形式 |
| `Accept-Language` | `ja` / `en`        |  -   | レスポンス言語         |

### リクエストボディ

```json
{
  "name": "string",
  "description": "string",
  "settings": {
    "enabled": true,
    "config": {}
  }
}
```

| フィールド         | 型      | 必須 | 制約        | 説明       |
| :----------------- | :------ | :--: | :---------- | :--------- |
| `name`             | string  |  ○   | 1-100文字   | リソース名 |
| `description`      | string  |  -   | 最大500文字 | 説明       |
| `settings.enabled` | boolean |  -   | -           | 有効フラグ |
| `settings.config`  | object  |  -   | -           | 追加設定   |

## レスポンス

### 成功レスポンス

**200 OK** / **201 Created**

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "Sample Resource",
  "description": "説明文",
  "settings": {
    "enabled": true,
    "config": {}
  },
  "createdAt": "2025-01-15T10:30:00Z",
  "updatedAt": "2025-01-15T10:30:00Z"
}
```

| フィールド  | 型     | 説明                 |
| :---------- | :----- | :------------------- |
| `id`        | string | リソースID（UUID）   |
| `name`      | string | リソース名           |
| `createdAt` | string | 作成日時（ISO 8601） |
| `updatedAt` | string | 更新日時（ISO 8601） |

### 一覧レスポンス（ページネーション付き）

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

### エラーレスポンス

**400 Bad Request** - バリデーションエラー

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "入力値が不正です",
    "details": [
      {
        "field": "name",
        "message": "名前は必須です"
      }
    ]
  }
}
```

**401 Unauthorized** - 認証エラー

```json
{
  "error": {
    "code": "UNAUTHORIZED",
    "message": "認証が必要です"
  }
}
```

**404 Not Found** - リソース未検出

```json
{
  "error": {
    "code": "NOT_FOUND",
    "message": "指定されたリソースが見つかりません"
  }
}
```

## コード例

### cURL

```bash
curl -X GET "https://api.example.com/v1/resource/550e8400" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Accept: application/json"
```

### JavaScript (fetch)

```javascript
const response = await fetch("https://api.example.com/v1/resource/550e8400", {
  method: "GET",
  headers: {
    Authorization: `Bearer ${token}`,
    Accept: "application/json",
  },
});
const data = await response.json();
```

### Python (requests)

```python
import requests

response = requests.get(
    'https://api.example.com/v1/resource/550e8400',
    headers={
        'Authorization': f'Bearer {token}',
        'Accept': 'application/json'
    }
)
data = response.json()
```

## 注意事項

- レート制限: 100リクエスト/分
- 最大レスポンスサイズ: 10MB
- タイムアウト: 30秒

## 関連エンドポイント

- [GET /api/v1/resources](./list-resources.md) - 一覧取得
- [POST /api/v1/resources](./create-resource.md) - 新規作成
- [DELETE /api/v1/resources/{id}](./delete-resource.md) - 削除
