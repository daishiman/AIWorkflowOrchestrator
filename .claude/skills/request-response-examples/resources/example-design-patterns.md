# リクエスト・レスポンス例 設計パターン

## 効果的な例の原則

### 1. 即座に実行可能
- コピー＆ペーストで動作するコード
- 必要な環境変数・認証情報を明示
- プレースホルダーは明確に区別

### 2. 段階的複雑性
- 最小限の例から開始
- オプション機能を徐々に追加
- 完全な例は最後に

### 3. 現実的なデータ
- ダミーデータでも意味のある値
- 実際のユースケースを反映
- 日付・IDは現実的な形式

---

## cURLリクエスト例

### 基本パターン

```bash
# シンプルなGET
curl -X GET "https://api.example.com/v1/users" \
  -H "Authorization: Bearer YOUR_API_KEY"

# クエリパラメータ付き
curl -X GET "https://api.example.com/v1/users?limit=10&offset=0" \
  -H "Authorization: Bearer YOUR_API_KEY"

# JSONボディ付きPOST
curl -X POST "https://api.example.com/v1/users" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "山田太郎",
    "email": "yamada@example.com"
  }'

# ファイルアップロード
curl -X POST "https://api.example.com/v1/files" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -F "file=@/path/to/document.pdf" \
  -F "description=契約書"
```

### 環境変数使用パターン

```bash
# 環境変数を設定
export API_BASE_URL="https://api.example.com/v1"
export API_KEY="your_api_key_here"

# 環境変数を使用したリクエスト
curl -X GET "${API_BASE_URL}/users" \
  -H "Authorization: Bearer ${API_KEY}"
```

---

## HTTPリクエスト（生フォーマット）

### GET リクエスト

```http
GET /v1/users?status=active&limit=20 HTTP/1.1
Host: api.example.com
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
Accept: application/json
```

### POST リクエスト

```http
POST /v1/users HTTP/1.1
Host: api.example.com
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
Content-Type: application/json
Content-Length: 78

{
  "name": "山田太郎",
  "email": "yamada@example.com",
  "role": "developer"
}
```

---

## 成功レスポンス例

### 単一リソース（200 OK）

```json
{
  "id": "usr_abc123def456",
  "name": "山田太郎",
  "email": "yamada@example.com",
  "role": "developer",
  "created_at": "2025-01-15T09:30:00Z",
  "updated_at": "2025-01-15T09:30:00Z"
}
```

### リソース作成（201 Created）

```http
HTTP/1.1 201 Created
Location: https://api.example.com/v1/users/usr_abc123def456
Content-Type: application/json

{
  "id": "usr_abc123def456",
  "name": "山田太郎",
  "email": "yamada@example.com",
  "created_at": "2025-01-15T09:30:00Z"
}
```

### ページネーション付きリスト

```json
{
  "data": [
    {
      "id": "usr_abc123",
      "name": "山田太郎",
      "email": "yamada@example.com"
    },
    {
      "id": "usr_def456",
      "name": "佐藤花子",
      "email": "sato@example.com"
    }
  ],
  "pagination": {
    "total": 150,
    "limit": 20,
    "offset": 0,
    "has_more": true
  },
  "links": {
    "self": "/v1/users?limit=20&offset=0",
    "next": "/v1/users?limit=20&offset=20",
    "last": "/v1/users?limit=20&offset=140"
  }
}
```

### カーソルベースページネーション

```json
{
  "data": [...],
  "cursor": {
    "next": "eyJpZCI6InVzcl94eXo3ODkiLCJjcmVhdGVkX2F0IjoiMjAyNS0wMS0xNSJ9",
    "previous": null,
    "has_more": true
  }
}
```

### 削除成功（204 No Content）

```http
HTTP/1.1 204 No Content
```

---

## ネストしたリソース表現

### 展開されたリレーション

```json
{
  "id": "ord_abc123",
  "status": "processing",
  "customer": {
    "id": "cus_xyz789",
    "name": "山田太郎",
    "email": "yamada@example.com"
  },
  "items": [
    {
      "id": "itm_001",
      "product": {
        "id": "prd_laptop01",
        "name": "ノートPC Pro",
        "price": 150000
      },
      "quantity": 1
    }
  ],
  "total": 150000,
  "created_at": "2025-01-15T10:00:00Z"
}
```

### ID参照のみ（軽量版）

```json
{
  "id": "ord_abc123",
  "status": "processing",
  "customer_id": "cus_xyz789",
  "item_ids": ["itm_001", "itm_002"],
  "total": 150000
}
```

### expandパラメータ使用

```bash
# デフォルト（ID参照のみ）
curl "https://api.example.com/v1/orders/ord_abc123"

# リレーション展開
curl "https://api.example.com/v1/orders/ord_abc123?expand=customer,items.product"
```

---

## フィールド選択

### fieldsパラメータ

```bash
# 必要なフィールドのみ取得
curl "https://api.example.com/v1/users?fields=id,name,email"
```

レスポンス:

```json
{
  "data": [
    {"id": "usr_abc123", "name": "山田太郎", "email": "yamada@example.com"},
    {"id": "usr_def456", "name": "佐藤花子", "email": "sato@example.com"}
  ]
}
```

---

## 条件付きリクエスト

### ETag使用

リクエスト:

```http
GET /v1/users/usr_abc123 HTTP/1.1
Host: api.example.com
If-None-Match: "a1b2c3d4e5f6"
```

キャッシュヒット時:

```http
HTTP/1.1 304 Not Modified
ETag: "a1b2c3d4e5f6"
```

### Last-Modified使用

リクエスト:

```http
GET /v1/users/usr_abc123 HTTP/1.1
Host: api.example.com
If-Modified-Since: Wed, 15 Jan 2025 09:30:00 GMT
```

---

## 実行例の表示形式

### リクエスト/レスポンス対比

**リクエスト:**

```bash
curl -X POST "https://api.example.com/v1/users" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"name": "新規ユーザー", "email": "new@example.com"}'
```

**レスポンス (201 Created):**

```json
{
  "id": "usr_new123",
  "name": "新規ユーザー",
  "email": "new@example.com",
  "created_at": "2025-01-15T10:30:00Z"
}
```

### 複数言語対応

<details>
<summary>JavaScript (fetch)</summary>

```javascript
const response = await fetch('https://api.example.com/v1/users', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    name: '新規ユーザー',
    email: 'new@example.com'
  })
});

const user = await response.json();
console.log(user.id);
```

</details>

<details>
<summary>Python (requests)</summary>

```python
import requests

response = requests.post(
    'https://api.example.com/v1/users',
    headers={'Authorization': 'Bearer YOUR_API_KEY'},
    json={
        'name': '新規ユーザー',
        'email': 'new@example.com'
    }
)

user = response.json()
print(user['id'])
```

</details>

---

## チェックリスト

### リクエスト例
- [ ] 認証ヘッダーが含まれている
- [ ] Content-Typeが適切
- [ ] プレースホルダーが明示的
- [ ] 環境変数バージョンも提供
- [ ] コピー＆ペーストで動作

### レスポンス例
- [ ] 現実的なデータ値
- [ ] 日付形式が一貫
- [ ] ID形式がプレフィックス付き
- [ ] ネスト構造が明確
- [ ] ページネーションがある場合は完全な構造
