# [機能名] API エンドポイント仕様

> REST API / IPC エンドポイントの仕様定義
> カテゴリ: API設計
> 読み込み条件: [機能名] のエンドポイント実装時

---

## メタ情報

| 項目         | 内容                 |
| ------------ | -------------------- |
| バージョン   | 1.0.0                |
| 最終更新     | YYYY-MM-DD           |
| 実装ファイル | `path/to/handler.ts` |
| 関連仕様     | [link]               |

---

## 1. エンドポイント一覧

### 1.1 REST API

| メソッド | パス                 | 説明     | 認証 | レスポンス |
| -------- | -------------------- | -------- | ---- | ---------- |
| GET      | /api/v1/resource     | 一覧取得 | 必要 | 200/401    |
| GET      | /api/v1/resource/:id | 詳細取得 | 必要 | 200/404    |
| POST     | /api/v1/resource     | 新規作成 | 必要 | 201/400    |
| PATCH    | /api/v1/resource/:id | 更新     | 必要 | 200/404    |
| DELETE   | /api/v1/resource/:id | 削除     | 必要 | 204/404    |

### 1.2 IPC チャンネル（Electron）

| チャンネル名     | 方向            | 説明     |
| ---------------- | --------------- | -------- |
| resource:list    | Renderer → Main | 一覧取得 |
| resource:get     | Renderer → Main | 詳細取得 |
| resource:create  | Renderer → Main | 新規作成 |
| resource:update  | Renderer → Main | 更新     |
| resource:delete  | Renderer → Main | 削除     |
| resource:changed | Main → Renderer | 変更通知 |

---

## 2. リクエスト/レスポンス定義

### 2.1 一覧取得

**リクエスト**:

| パラメータ | 型     | 必須 | 説明                     |
| ---------- | ------ | ---- | ------------------------ |
| page       | number | -    | ページ番号（default: 1） |
| limit      | number | -    | 取得件数（default: 20）  |
| filter     | string | -    | フィルター条件           |

**レスポンス**:

```typescript
interface ListResponse<T> {
  success: true;
  data: {
    items: T[];
    total: number;
    page: number;
    limit: number;
  };
}
```

### 2.2 詳細取得

**リクエスト**:

| パラメータ | 型     | 必須 | 説明       |
| ---------- | ------ | ---- | ---------- |
| id         | string | ✓    | リソースID |

**レスポンス**:

```typescript
interface GetResponse<T> {
  success: true;
  data: T;
}
```

### 2.3 新規作成

**リクエストボディ**:

```typescript
interface CreateRequest {
  // フィールド定義
}
```

**レスポンス**:

```typescript
interface CreateResponse<T> {
  success: true;
  data: T;
}
```

### 2.4 更新

**リクエストボディ**:

```typescript
interface UpdateRequest {
  // フィールド定義（Partial）
}
```

### 2.5 削除

**レスポンス**:

```typescript
interface DeleteResponse {
  success: true;
  data: { deleted: true };
}
```

---

## 3. エラーレスポンス

| ステータス | エラーコード | 説明                 |
| ---------- | ------------ | -------------------- |
| 400        | ERR_3xxx     | バリデーションエラー |
| 401        | ERR_2006     | 認証エラー           |
| 403        | ERR_2007     | 認可エラー           |
| 404        | ERR_4001     | リソース不在         |
| 500        | ERR_1001     | サーバーエラー       |

```typescript
interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}
```

---

## 4. 実装ファイル

| 種別           | パス                           |
| -------------- | ------------------------------ |
| 型定義         | `packages/shared/src/types/`   |
| バリデーション | `packages/shared/src/schemas/` |
| ハンドラ       | `apps/*/src/api/`              |
| テスト         | `apps/*/src/api/__tests__/`    |

---

## 関連ドキュメント

| ドキュメント        | 説明               |
| ------------------- | ------------------ |
| interfaces-xxx.md   | 型定義詳細         |
| security-api-xxx.md | セキュリティ要件   |
| error-handling.md   | エラー処理パターン |

---

## 変更履歴

| 日付       | バージョン | 変更内容 |
| ---------- | ---------- | -------- |
| YYYY-MM-DD | 1.0.0      | 初版作成 |
