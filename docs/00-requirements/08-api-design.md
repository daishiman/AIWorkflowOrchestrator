# REST API 設計原則 (API Design Principles)

> 本ドキュメントは統合システム設計仕様書の一部です。
> マスタードキュメント: [master_system_design.md](./master_system_design.md)

## 8.1 API 設計方針

### RESTful 原則の適用

| 原則 | 説明 |
|------|------|
| リソース指向 | URL はリソースを表現（動詞ではなく名詞） |
| HTTPメソッド | GET（取得）、POST（作成）、PUT/PATCH（更新）、DELETE（削除） |
| ステートレス | 各リクエストは独立、セッション情報をサーバーに保持しない |
| 統一インターフェース | 一貫したレスポンス形式、エラーハンドリング |

---

## 8.2 APIバージョニング

| 項目 | 説明 |
|------|------|
| 方式 | URL パスベース（`/api/v1/...`、`/api/v2/...`） |
| 後方互換性 | マイナーバージョンアップでは既存エンドポイントを維持 |
| 非推奨化 | Deprecated ヘッダーで警告、最低6ヶ月のサポート期間 |
| ドキュメント | バージョンごとの変更履歴を明記 |

---

## 8.3 HTTPステータスコード

### 成功レスポンス

| コード | 説明 | 用途 |
|--------|------|------|
| 200 OK | リソース取得成功 | GET |
| 201 Created | リソース作成成功 | POST（Location ヘッダーで新リソース URL を返す） |
| 204 No Content | 更新/削除成功 | PUT/DELETE（レスポンスボディなし） |

### クライアントエラー（4xx）

| コード | 説明 | 用途 |
|--------|------|------|
| 400 Bad Request | リクエスト形式不正 | バリデーションエラー |
| 401 Unauthorized | 認証失敗 | 認証情報なし/無効 |
| 403 Forbidden | 認証済みだが権限不足 | アクセス拒否 |
| 404 Not Found | リソースが存在しない | 存在しないID |
| 409 Conflict | リソースの競合 | 重複作成 |
| 422 Unprocessable Entity | バリデーションエラー | 詳細エラー情報付き |
| 429 Too Many Requests | レート制限超過 | リトライ要求 |

### サーバーエラー（5xx）

| コード | 説明 | 用途 |
|--------|------|------|
| 500 Internal Server Error | サーバー内部エラー | 予期しないエラー |
| 502 Bad Gateway | 上流サービスエラー | AI API障害 |
| 503 Service Unavailable | 一時的なサービス停止 | メンテナンス |
| 504 Gateway Timeout | 上流サービスタイムアウト | AI API遅延 |

---

## 8.4 リクエスト/レスポンス形式

### 共通ヘッダー

| ヘッダー | 説明 |
|----------|------|
| Content-Type | `application/json; charset=utf-8` |
| Authorization | `Bearer <token>` 形式 |
| X-Request-ID | リクエスト追跡ID（クライアントが生成、またはサーバーが自動付与） |
| Accept-Language | `ja`, `en` 等（多言語対応） |

### 成功レスポンス形式

| フィールド | 型 | 説明 |
|-----------|-----|------|
| `success` | boolean | 成功フラグ（true） |
| `data` | object | リソースデータ |
| `meta` | object | メタデータ（オプション、request_id, timestamp等） |

### エラーレスポンス形式

[エラーハンドリング仕様](./07-error-handling.md) を参照。

---

## 8.5 ページネーション

### クエリパラメータ

| パラメータ | 説明 | デフォルト |
|-----------|------|----------|
| `page` | ページ番号（1始まり） | 1 |
| `limit` | 1ページあたりの件数 | 20（最大100） |
| `offset` | オフセット方式の場合（`page` の代替） | 0 |

### レスポンス形式

| フィールド | 説明 |
|-----------|------|
| `pagination.page` | 現在のページ番号 |
| `pagination.limit` | 1ページあたりの件数 |
| `pagination.total` | 総件数 |
| `pagination.total_pages` | 総ページ数 |
| `pagination.has_next` | 次ページの有無 |
| `pagination.has_prev` | 前ページの有無 |

---

## 8.6 フィルタリング・ソート

### クエリパラメータ

| パラメータ | 説明 | 例 |
|-----------|------|-----|
| `filter[field]` | フィールドでフィルタ | `filter[status]=COMPLETED` |
| `sort` | ソートフィールド | `sort=created_at`、降順は `-created_at` |
| `fields` | 取得フィールドの選択 | `fields=id,type,status` |

---

## 8.7 認証・認可

### 認証方式

| 項目 | 説明 |
|------|------|
| 方式 | Bearer Token（`Authorization: Bearer <token>`） |
| API キー管理 | 環境変数で保持、リクエストヘッダーで送信 |
| トークン有効期限 | 実装に応じて設定（JWT の場合は exp クレーム） |

### 認可レベル

| レベル | 説明 |
|--------|------|
| Public | 認証不要（ヘルスチェック等） |
| Authenticated | 認証必須、リソース所有者のみアクセス可 |
| Admin | 管理者権限必須 |

---

## 8.8 レート制限

### ヘッダー

| ヘッダー | 説明 |
|----------|------|
| `X-RateLimit-Limit` | 制限値 |
| `X-RateLimit-Remaining` | 残り回数 |
| `X-RateLimit-Reset` | リセット時刻（Unix timestamp） |

### 制限レベル

| レベル | 説明 |
|--------|------|
| グローバル | IP ごと、時間ウィンドウごとの総リクエスト数 |
| エンドポイント別 | 負荷の高いエンドポイントは個別制限 |
| ユーザー別 | 認証済みユーザーごとの制限 |

---

## 8.9 CORS設定

| 設定項目 | 値 |
|----------|-----|
| `Access-Control-Allow-Origin` | 許可するオリジン |
| `Access-Control-Allow-Methods` | GET, POST, PUT, DELETE, OPTIONS |
| `Access-Control-Allow-Headers` | Authorization, Content-Type, X-Request-ID |
| `Access-Control-Max-Age` | プリフライトリクエストのキャッシュ時間 |

---

## 8.10 エンドポイント命名規則

### RESTful 命名パターン

| パターン | 例 |
|----------|-----|
| コレクション | `/api/v1/workflows`（複数形） |
| 個別リソース | `/api/v1/workflows/{id}` |
| サブリソース | `/api/v1/workflows/{id}/executions` |
| アクション | `/api/v1/workflows/{id}/retry`（動詞が必要な場合） |

### 禁止パターン

| パターン | 理由 |
|----------|------|
| `/api/v1/getWorkflows` | 動詞を含める |
| `/api/v1/workflow` | 単数形 |

---

## 8.11 具体的なエンドポイント例

### ワークフロー管理

| メソッド | パス | 説明 |
|---------|------|------|
| POST | `/api/v1/workflows` | ワークフロー作成 |
| GET | `/api/v1/workflows/{id}` | ワークフロー取得 |
| GET | `/api/v1/workflows` | ワークフロー一覧 |
| PATCH | `/api/v1/workflows/{id}` | ワークフロー更新 |
| DELETE | `/api/v1/workflows/{id}` | ワークフロー削除 |

### ファイル操作

| メソッド | パス | 説明 |
|---------|------|------|
| POST | `/api/v1/files/upload` | ファイルアップロード |
| GET | `/api/v1/files/{id}/download` | ファイルダウンロード |

### ヘルスチェック

| メソッド | パス | 説明 |
|---------|------|------|
| GET | `/api/health` | システムヘルスチェック（認証不要） |
| GET | `/api/v1/status` | 詳細ステータス（認証必要） |

---

## 関連ドキュメント

- [エラーハンドリング仕様](./07-error-handling.md)
- [コアインターフェース仕様](./06-core-interfaces.md)
- [デプロイメント](./12-deployment.md)
