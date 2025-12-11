# REST API 設計原則

> 本ドキュメントは統合システム設計仕様書の一部です。
> マスタードキュメント: [master_system_design.md](./master_system_design.md)

---

## 8.1 API 設計方針

### 8.1.1 RESTful 原則の適用

| 原則                 | 説明                                                         |
| -------------------- | ------------------------------------------------------------ |
| リソース指向         | URLはリソースを表現する（動詞ではなく名詞を使用）            |
| HTTPメソッド         | GET（取得）、POST（作成）、PUT/PATCH（更新）、DELETE（削除） |
| ステートレス         | 各リクエストは独立、セッション情報をサーバーに保持しない     |
| 統一インターフェース | 一貫したレスポンス形式、エラーハンドリング                   |

### 8.1.2 個人開発における設計指針

| 指針           | 説明                                                                |
| -------------- | ------------------------------------------------------------------- |
| シンプルさ優先 | 過度な抽象化を避け、理解しやすいAPIを設計する                       |
| 段階的拡張     | MVP時点では必要最小限のエンドポイントから開始する                   |
| 内部利用前提   | 公開APIではないため、厳密なバージョニングよりも迅速な改善を優先する |
| 型安全性       | ZodスキーマによるリクエストバリデーションとTypeScript型生成         |

---

## 8.2 APIバージョニング

| 項目                 | 説明                                   |
| -------------------- | -------------------------------------- |
| 方式                 | URLパスベース（/api/v1/...）           |
| バージョンアップ基準 | 破壊的変更がある場合のみv2に移行       |
| 後方互換性           | 個人開発のため、必要に応じて柔軟に対応 |

---

## 8.3 HTTPステータスコード

### 8.3.1 成功レスポンス

| コード         | 説明             | 用途                                                |
| -------------- | ---------------- | --------------------------------------------------- |
| 200 OK         | リソース取得成功 | GET、PATCHの成功                                    |
| 201 Created    | リソース作成成功 | POSTの成功（Locationヘッダーで新リソースURLを返す） |
| 204 No Content | 処理成功         | DELETEの成功（レスポンスボディなし）                |

### 8.3.2 クライアントエラー（4xx）

| コード                   | 説明                 | 用途                                     |
| ------------------------ | -------------------- | ---------------------------------------- |
| 400 Bad Request          | リクエスト形式不正   | JSON構文エラー、必須フィールド欠落       |
| 401 Unauthorized         | 認証失敗             | 認証情報なし、無効なトークン             |
| 403 Forbidden            | 権限不足             | 認証済みだがリソースへのアクセス権がない |
| 404 Not Found            | リソース不存在       | 指定IDのリソースが見つからない           |
| 409 Conflict             | リソース競合         | 重複作成、楽観的ロック失敗               |
| 422 Unprocessable Entity | バリデーションエラー | Zodスキーマ検証失敗、ビジネスルール違反  |
| 429 Too Many Requests    | レート制限超過       | Retry-Afterヘッダーで待機時間を通知      |

### 8.3.3 サーバーエラー（5xx）

| コード                    | 説明                     | 用途                         |
| ------------------------- | ------------------------ | ---------------------------- |
| 500 Internal Server Error | サーバー内部エラー       | 予期しないエラー             |
| 502 Bad Gateway           | 上流サービスエラー       | AI API障害、外部サービス障害 |
| 503 Service Unavailable   | 一時的なサービス停止     | メンテナンス、過負荷         |
| 504 Gateway Timeout       | 上流サービスタイムアウト | AI API遅延                   |

---

## 8.4 リクエスト/レスポンス形式

### 8.4.1 共通リクエストヘッダー

| ヘッダー      | 説明                            | 必須                   |
| ------------- | ------------------------------- | ---------------------- |
| Content-Type  | application/json; charset=utf-8 | POST/PATCH時           |
| Authorization | Bearer トークン形式             | 認証必須エンドポイント |
| X-Request-ID  | リクエスト追跡ID                | 推奨（ログ追跡用）     |
| X-Agent-Key   | Local Agent認証キー             | Agent API              |

### 8.4.2 成功レスポンス形式

| フィールド | 型      | 説明                                  |
| ---------- | ------- | ------------------------------------- |
| success    | boolean | 常にtrue                              |
| data       | object  | リソースデータまたはデータ配列        |
| meta       | object  | メタデータ（request_id、timestamp等） |
| pagination | object  | ページネーション情報（一覧取得時）    |

### 8.4.3 エラーレスポンス形式

[エラーハンドリング仕様](./07-error-handling.md) を参照。

---

## 8.5 ページネーション

### 8.5.1 クエリパラメータ

| パラメータ | 説明                  | デフォルト | 最大値 |
| ---------- | --------------------- | ---------- | ------ |
| page       | ページ番号（1始まり） | 1          | -      |
| limit      | 1ページあたりの件数   | 20         | 100    |

### 8.5.2 レスポンス形式

| フィールド             | 型      | 説明                |
| ---------------------- | ------- | ------------------- |
| pagination.page        | number  | 現在のページ番号    |
| pagination.limit       | number  | 1ページあたりの件数 |
| pagination.total       | number  | 総件数              |
| pagination.total_pages | number  | 総ページ数          |
| pagination.has_next    | boolean | 次ページの有無      |
| pagination.has_prev    | boolean | 前ページの有無      |

---

## 8.6 フィルタリング・ソート

### 8.6.1 フィルタリング

| パラメータ        | 説明                     | 例                                 |
| ----------------- | ------------------------ | ---------------------------------- |
| filter[field]     | フィールドによるフィルタ | filter[status]=COMPLETED           |
| filter[field][op] | 演算子指定               | filter[created_at][gte]=2024-01-01 |

**対応演算子**:

| 演算子 | 説明                 |
| ------ | -------------------- |
| eq     | 等しい（デフォルト） |
| ne     | 等しくない           |
| gt     | より大きい           |
| gte    | 以上                 |
| lt     | より小さい           |
| lte    | 以下                 |
| like   | 部分一致             |

### 8.6.2 ソート

| パラメータ | 説明             | 例                          |
| ---------- | ---------------- | --------------------------- |
| sort       | ソートフィールド | sort=created_at（昇順）     |
| sort       | 降順指定         | sort=-created_at（先頭に-） |
| sort       | 複数ソート       | sort=-created_at,type       |

---

## 8.7 認証・認可

### 8.7.1 認証方式

| 方式         | 用途                  | ヘッダー                      |
| ------------ | --------------------- | ----------------------------- |
| Bearer Token | Web UI、Discord OAuth | Authorization: Bearer {token} |
| API Key      | Local Agent           | X-Agent-Key: {key}            |

### 8.7.2 認可レベル

| レベル        | 説明                         | 例                             |
| ------------- | ---------------------------- | ------------------------------ |
| Public        | 認証不要                     | ヘルスチェック                 |
| Authenticated | 認証必須、自分のリソースのみ | ワークフロー操作               |
| Agent         | Local Agent専用              | ファイル同期、ワークフロー実行 |

### 8.7.3 エンドポイント別認証要件

| エンドポイント          | 認証 | 認可レベル    |
| ----------------------- | ---- | ------------- |
| GET /api/health         | 不要 | Public        |
| POST /api/v1/workflows  | 必要 | Authenticated |
| POST /api/v1/agent/sync | 必要 | Agent         |

---

## 8.8 レート制限

### 8.8.1 レスポンスヘッダー

| ヘッダー              | 説明                           |
| --------------------- | ------------------------------ |
| X-RateLimit-Limit     | 制限値（リクエスト/分）        |
| X-RateLimit-Remaining | 残り回数                       |
| X-RateLimit-Reset     | リセット時刻（Unix timestamp） |
| Retry-After           | 429エラー時の待機秒数          |

### 8.8.2 制限値

| 対象      | 制限値 | 単位                   |
| --------- | ------ | ---------------------- |
| 一般API   | 100    | リクエスト/分/IP       |
| 認証API   | 10     | リクエスト/分/IP       |
| AI処理API | 10     | リクエスト/分/ユーザー |
| Agent API | 60     | リクエスト/分/Agent    |

---

## 8.9 CORS設定

| 設定項目                         | 開発環境                                               | 本番環境         |
| -------------------------------- | ------------------------------------------------------ | ---------------- |
| Access-Control-Allow-Origin      | localhost:\*                                           | 本番ドメインのみ |
| Access-Control-Allow-Methods     | GET, POST, PATCH, DELETE, OPTIONS                      | 同左             |
| Access-Control-Allow-Headers     | Authorization, Content-Type, X-Request-ID, X-Agent-Key | 同左             |
| Access-Control-Allow-Credentials | true                                                   | true             |

---

## 8.10 エンドポイント一覧

### 8.10.1 ワークフロー管理

| メソッド | パス                          | 説明                   | 認証 |
| -------- | ----------------------------- | ---------------------- | ---- |
| POST     | /api/v1/workflows             | ワークフロー作成       | 必要 |
| GET      | /api/v1/workflows             | ワークフロー一覧取得   | 必要 |
| GET      | /api/v1/workflows/{id}        | ワークフロー詳細取得   | 必要 |
| PATCH    | /api/v1/workflows/{id}        | ワークフロー更新       | 必要 |
| DELETE   | /api/v1/workflows/{id}        | ワークフロー削除       | 必要 |
| POST     | /api/v1/workflows/{id}/retry  | ワークフローリトライ   | 必要 |
| POST     | /api/v1/workflows/{id}/cancel | ワークフローキャンセル | 必要 |

### 8.10.2 Local Agent API

| メソッド | パス                    | 説明                 | 認証  |
| -------- | ----------------------- | -------------------- | ----- |
| POST     | /api/v1/agent/sync      | ファイル同期         | Agent |
| POST     | /api/v1/agent/execute   | ワークフロー実行     | Agent |
| GET      | /api/v1/agent/status    | エージェント状態確認 | Agent |
| POST     | /api/v1/agent/heartbeat | ハートビート         | Agent |

### 8.10.3 ユーザー設定

| メソッド | パス                  | 説明             | 認証 |
| -------- | --------------------- | ---------------- | ---- |
| GET      | /api/v1/settings      | ユーザー設定取得 | 必要 |
| PATCH    | /api/v1/settings      | ユーザー設定更新 | 必要 |
| GET      | /api/v1/api-keys      | APIキー一覧取得  | 必要 |
| POST     | /api/v1/api-keys      | APIキー登録      | 必要 |
| DELETE   | /api/v1/api-keys/{id} | APIキー削除      | 必要 |

### 8.10.4 システム

| メソッド | パス           | 説明           | 認証 |
| -------- | -------------- | -------------- | ---- |
| GET      | /api/health    | ヘルスチェック | 不要 |
| GET      | /api/v1/status | 詳細ステータス | 必要 |

---

## 8.11 Desktop IPC API（認証・プロフィール）

### 8.11.1 認証 IPC チャネル

Electron Desktop アプリでは、IPC 通信で認証機能を提供する。

| チャネル            | 用途                 | Request                       | Response                           |
| ------------------- | -------------------- | ----------------------------- | ---------------------------------- |
| `auth:login`        | OAuth ログイン開始   | `{ provider: OAuthProvider }` | `IPCResponse<void>`                |
| `auth:logout`       | ログアウト           | なし                          | `IPCResponse<void>`                |
| `auth:get-session`  | セッション取得       | なし                          | `IPCResponse<AuthSession>`         |
| `auth:refresh`      | トークンリフレッシュ | なし                          | `IPCResponse<AuthSession>`         |
| `auth:check-online` | オンライン状態確認   | なし                          | `IPCResponse<{ online: boolean }>` |

### 8.11.2 プロフィール IPC チャネル

| チャネル                | 用途                 | Request                            | Response                        |
| ----------------------- | -------------------- | ---------------------------------- | ------------------------------- |
| `profile:get`           | プロフィール取得     | なし                               | `IPCResponse<UserProfile>`      |
| `profile:update`        | プロフィール更新     | `{ updates: ProfileUpdateFields }` | `IPCResponse<UserProfile>`      |
| `profile:get-providers` | 連携プロバイダー一覧 | なし                               | `IPCResponse<LinkedProvider[]>` |
| `profile:link-provider` | 新規プロバイダー連携 | `{ provider: OAuthProvider }`      | `IPCResponse<LinkedProvider>`   |

### 8.11.3 イベントチャネル（Main → Renderer）

| チャネル             | 用途             | Payload                                           |
| -------------------- | ---------------- | ------------------------------------------------- |
| `auth:state-changed` | 認証状態変更通知 | `{ authenticated: boolean; tokens?: AuthTokens }` |

### 8.11.4 型定義

```typescript
type OAuthProvider = "google" | "github" | "discord";

interface AuthSession {
  user: AuthUser;
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
  isOffline: boolean;
}

interface UserProfile {
  id: string;
  displayName: string;
  email: string;
  avatarUrl: string | null;
  plan: "free" | "pro" | "enterprise";
  createdAt: string;
  updatedAt: string;
}

interface LinkedProvider {
  provider: OAuthProvider;
  providerId: string;
  email: string | null;
  displayName: string | null;
  avatarUrl: string | null;
  linkedAt: string;
}

interface IPCResponse<T> {
  success: boolean;
  data?: T;
  error?: { code: string; message: string };
}
```

---

## 8.12 エンドポイント命名規則

### 8.12.1 命名パターン

| パターン     | 例                           | 説明             |
| ------------ | ---------------------------- | ---------------- |
| コレクション | /api/v1/workflows            | 複数形を使用     |
| 個別リソース | /api/v1/workflows/{id}       | ID指定           |
| サブリソース | /api/v1/workflows/{id}/steps | 親子関係         |
| アクション   | /api/v1/workflows/{id}/retry | 動詞が必要な操作 |

### 8.12.2 禁止パターン

| パターン                 | 理由              | 正しい例               |
| ------------------------ | ----------------- | ---------------------- |
| /api/v1/getWorkflows     | URLに動詞を含める | /api/v1/workflows      |
| /api/v1/workflow         | 単数形を使用      | /api/v1/workflows      |
| /api/v1/workflows/create | POSTで十分        | POST /api/v1/workflows |

---

## 8.13 Electron IPC API設計

デスクトップアプリでは、Renderer Process と Main Process 間の通信に IPC（Inter-Process Communication）を使用する。

### 8.13.1 IPC設計原則

| 原則                   | 説明                                     |
| ---------------------- | ---------------------------------------- |
| contextIsolation       | Preloadスクリプトでのみ通信APIを公開     |
| チャネルホワイトリスト | 許可されたチャネルのみ通信可能           |
| sender検証             | withValidation()でリクエスト元を検証     |
| 型安全性               | 全チャネルに対してTypeScript型定義を適用 |

### 8.13.2 APIキー管理 IPC チャネル

| チャネル          | メソッド | 引数                   | 戻り値                          | 公開先    |
| ----------------- | -------- | ---------------------- | ------------------------------- | --------- |
| `apiKey:save`     | invoke   | `{ provider, apiKey }` | `IPCResponse<void>`             | Renderer  |
| `apiKey:delete`   | invoke   | `{ provider }`         | `IPCResponse<void>`             | Renderer  |
| `apiKey:validate` | invoke   | `{ provider, apiKey }` | `IPCResponse<ValidationResult>` | Renderer  |
| `apiKey:list`     | invoke   | なし                   | `IPCResponse<ProviderStatus[]>` | Renderer  |
| `apiKey:get`      | invoke   | `{ provider }`         | `string \| null`                | Main Only |

**セキュリティ注意**: `apiKey:get` はRenderer Processに公開しない（Main Process内部使用のみ）

### 8.13.3 認証 IPC チャネル

| チャネル             | メソッド | 引数                           | 戻り値                        |
| -------------------- | -------- | ------------------------------ | ----------------------------- |
| `auth:sign-in`       | invoke   | `{ provider }`                 | `IPCResponse<AuthResult>`     |
| `auth:sign-out`      | invoke   | なし                           | `IPCResponse<void>`           |
| `auth:get-session`   | invoke   | なし                           | `IPCResponse<Session>`        |
| `auth:link-provider` | invoke   | `{ provider }`                 | `IPCResponse<LinkedProvider>` |
| `profile:get`        | invoke   | なし                           | `IPCResponse<UserProfile>`    |
| `profile:update`     | invoke   | `{ displayName?, avatarUrl? }` | `IPCResponse<UserProfile>`    |
| `profile:delete`     | invoke   | `{ confirmEmail }`             | `IPCResponse<void>`           |

### 8.13.4 プロフィール設定 IPC チャネル

| チャネル                       | メソッド | 引数                       | 戻り値                             |
| ------------------------------ | -------- | -------------------------- | ---------------------------------- |
| `profile:update-notifications` | invoke   | `{ notificationSettings }` | `IPCResponse<ExtendedUserProfile>` |
| `profile:export`               | invoke   | なし                       | `ProfileExportResponse`            |
| `profile:import`               | invoke   | `{ filePath }`             | `ProfileImportResponse`            |

**通知設定オブジェクト**:

```typescript
interface NotificationSettings {
  email: boolean; // メール通知
  desktop: boolean; // デスクトップ通知
  sound: boolean; // 通知音
  workflowComplete: boolean; // ワークフロー完了通知
  workflowError: boolean; // ワークフローエラー通知
}
```

**エクスポートデータ形式**:

```typescript
interface ProfileExportData {
  version: "1.0";
  exportedAt: string; // ISO 8601
  displayName: string;
  timezone: string; // IANA タイムゾーン
  locale: string; // ja, en など
  notificationSettings: NotificationSettings;
  preferences: Record<string, unknown>;
  linkedProviders?: LinkedProvider[]; // 連携プロバイダー一覧
  accountCreatedAt?: string;
  plan?: string;
}
```

**セキュリティ注意**: エクスポートデータには email, avatarUrl, id, APIキーを含めない

### 8.13.5 IPCレスポンス形式

```
成功時:
{
  success: true,
  data: <T>
}

失敗時:
{
  success: false,
  error: {
    code: "ERROR_CODE",
    message: "エラーメッセージ"
  }
}
```

### 8.13.6 IPC エラーコード

| コード               | 説明                 | 対処                         |
| -------------------- | -------------------- | ---------------------------- |
| `INVALID_SENDER`     | 不正なリクエスト元   | DevTools等からの不正アクセス |
| `PROVIDER_NOT_FOUND` | 未対応プロバイダー   | サポート対象を確認           |
| `VALIDATION_FAILED`  | バリデーションエラー | 入力値を確認                 |
| `STORAGE_ERROR`      | ストレージ操作失敗   | safeStorage利用可否確認      |
| `NETWORK_ERROR`      | ネットワーク障害     | 接続状態を確認               |

---

## 8.14 AIプロバイダーAPI連携

### 8.14.1 対応プロバイダー

| プロバイダー | API ベースURL                                  | 認証方式         |
| ------------ | ---------------------------------------------- | ---------------- |
| OpenAI       | `https://api.openai.com/v1`                    | Bearer Token     |
| Anthropic    | `https://api.anthropic.com/v1`                 | x-api-key Header |
| Google AI    | `https://generativelanguage.googleapis.com/v1` | Query Parameter  |
| xAI          | `https://api.x.ai/v1`                          | Bearer Token     |

### 8.14.2 APIキー検証エンドポイント

| プロバイダー | メソッド | エンドポイント         | 検証方法                     |
| ------------ | -------- | ---------------------- | ---------------------------- |
| OpenAI       | GET      | `/models`              | モデル一覧取得成功で有効判定 |
| Anthropic    | POST     | `/messages`            | 最小リクエスト送信で認証確認 |
| Google AI    | GET      | `/models?key={apiKey}` | モデル一覧取得成功で有効判定 |
| xAI          | GET      | `/models`              | モデル一覧取得成功で有効判定 |

### 8.14.3 HTTPステータスと検証結果マッピング

| HTTPステータス | 検証結果        | 意味                               |
| -------------- | --------------- | ---------------------------------- |
| 200-299        | `valid`         | APIキー有効                        |
| 401            | `invalid`       | 認証失敗（キー無効または期限切れ） |
| 403            | `invalid`       | アクセス拒否                       |
| 429            | `valid`         | レートリミット（認証は成功）       |
| 500-504        | `network_error` | サーバーエラー                     |
| タイムアウト   | `timeout`       | 接続タイムアウト（10秒）           |

---

## 関連ドキュメント

- [エラーハンドリング仕様](./07-error-handling.md)
- [コアインターフェース仕様](./06-core-interfaces.md)
- [セキュリティガイドライン](./17-security-guidelines.md)
- [デプロイメント](./12-deployment.md)
