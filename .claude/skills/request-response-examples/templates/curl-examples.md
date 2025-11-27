# cURLサンプルテンプレート

## 変数定義

```bash
# 環境変数テンプレート
export API_BASE_URL="{{API_BASE_URL}}"
export API_KEY="{{API_KEY}}"
```

---

## 基本操作

### リソース一覧取得（LIST）

```bash
curl -X GET "${API_BASE_URL}/{{RESOURCE_NAME}}" \
  -H "Authorization: Bearer ${API_KEY}" \
  -H "Accept: application/json"
```

**クエリパラメータ付き:**

```bash
curl -X GET "${API_BASE_URL}/{{RESOURCE_NAME}}?limit=20&offset=0&status=active" \
  -H "Authorization: Bearer ${API_KEY}" \
  -H "Accept: application/json"
```

### リソース取得（GET）

```bash
curl -X GET "${API_BASE_URL}/{{RESOURCE_NAME}}/{{RESOURCE_ID}}" \
  -H "Authorization: Bearer ${API_KEY}" \
  -H "Accept: application/json"
```

### リソース作成（POST）

```bash
curl -X POST "${API_BASE_URL}/{{RESOURCE_NAME}}" \
  -H "Authorization: Bearer ${API_KEY}" \
  -H "Content-Type: application/json" \
  -d '{
    "{{FIELD_1}}": "{{VALUE_1}}",
    "{{FIELD_2}}": "{{VALUE_2}}"
  }'
```

### リソース更新（PUT）

```bash
curl -X PUT "${API_BASE_URL}/{{RESOURCE_NAME}}/{{RESOURCE_ID}}" \
  -H "Authorization: Bearer ${API_KEY}" \
  -H "Content-Type: application/json" \
  -d '{
    "{{FIELD_1}}": "{{UPDATED_VALUE_1}}",
    "{{FIELD_2}}": "{{UPDATED_VALUE_2}}"
  }'
```

### 部分更新（PATCH）

```bash
curl -X PATCH "${API_BASE_URL}/{{RESOURCE_NAME}}/{{RESOURCE_ID}}" \
  -H "Authorization: Bearer ${API_KEY}" \
  -H "Content-Type: application/json" \
  -d '{
    "{{FIELD_1}}": "{{UPDATED_VALUE_1}}"
  }'
```

### リソース削除（DELETE）

```bash
curl -X DELETE "${API_BASE_URL}/{{RESOURCE_NAME}}/{{RESOURCE_ID}}" \
  -H "Authorization: Bearer ${API_KEY}"
```

---

## 認証パターン

### Bearer Token

```bash
curl -X GET "${API_BASE_URL}/{{RESOURCE_NAME}}" \
  -H "Authorization: Bearer ${API_KEY}"
```

### API Key（ヘッダー）

```bash
curl -X GET "${API_BASE_URL}/{{RESOURCE_NAME}}" \
  -H "X-API-Key: ${API_KEY}"
```

### API Key（クエリ）

```bash
curl -X GET "${API_BASE_URL}/{{RESOURCE_NAME}}?api_key=${API_KEY}"
```

### Basic認証

```bash
curl -X GET "${API_BASE_URL}/{{RESOURCE_NAME}}" \
  -u "${USERNAME}:${PASSWORD}"
```

---

## ファイル操作

### ファイルアップロード

```bash
curl -X POST "${API_BASE_URL}/{{UPLOAD_ENDPOINT}}" \
  -H "Authorization: Bearer ${API_KEY}" \
  -F "file=@/path/to/{{FILENAME}}" \
  -F "description={{DESCRIPTION}}"
```

### ファイルダウンロード

```bash
curl -X GET "${API_BASE_URL}/{{DOWNLOAD_ENDPOINT}}/{{FILE_ID}}" \
  -H "Authorization: Bearer ${API_KEY}" \
  -o "{{OUTPUT_FILENAME}}"
```

---

## 高度なパターン

### ページネーション（カーソルベース）

```bash
# 最初のページ
curl -X GET "${API_BASE_URL}/{{RESOURCE_NAME}}?limit=20" \
  -H "Authorization: Bearer ${API_KEY}"

# 次のページ（カーソル使用）
curl -X GET "${API_BASE_URL}/{{RESOURCE_NAME}}?limit=20&cursor={{CURSOR}}" \
  -H "Authorization: Bearer ${API_KEY}"
```

### フィルタリング

```bash
curl -X GET "${API_BASE_URL}/{{RESOURCE_NAME}}?\
status=active&\
created_after=2025-01-01&\
sort=-created_at" \
  -H "Authorization: Bearer ${API_KEY}"
```

### フィールド選択

```bash
curl -X GET "${API_BASE_URL}/{{RESOURCE_NAME}}?fields=id,name,email" \
  -H "Authorization: Bearer ${API_KEY}"
```

### リレーション展開

```bash
curl -X GET "${API_BASE_URL}/{{RESOURCE_NAME}}/{{RESOURCE_ID}}?expand=customer,items" \
  -H "Authorization: Bearer ${API_KEY}"
```

---

## デバッグ用

### 詳細出力

```bash
curl -v -X GET "${API_BASE_URL}/{{RESOURCE_NAME}}" \
  -H "Authorization: Bearer ${API_KEY}"
```

### ステータスコードのみ

```bash
curl -s -o /dev/null -w "%{http_code}" \
  -X GET "${API_BASE_URL}/{{RESOURCE_NAME}}" \
  -H "Authorization: Bearer ${API_KEY}"
```

### レスポンスヘッダー付き

```bash
curl -i -X GET "${API_BASE_URL}/{{RESOURCE_NAME}}" \
  -H "Authorization: Bearer ${API_KEY}"
```

---

## 具体例（Users API）

### ユーザー一覧

```bash
curl -X GET "${API_BASE_URL}/users?limit=10&status=active" \
  -H "Authorization: Bearer ${API_KEY}" \
  -H "Accept: application/json"
```

### ユーザー作成

```bash
curl -X POST "${API_BASE_URL}/users" \
  -H "Authorization: Bearer ${API_KEY}" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "山田太郎",
    "email": "yamada@example.com",
    "role": "developer"
  }'
```

### ユーザー更新

```bash
curl -X PUT "${API_BASE_URL}/users/usr_abc123" \
  -H "Authorization: Bearer ${API_KEY}" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "山田次郎",
    "role": "admin"
  }'
```

### ユーザー削除

```bash
curl -X DELETE "${API_BASE_URL}/users/usr_abc123" \
  -H "Authorization: Bearer ${API_KEY}"
```
