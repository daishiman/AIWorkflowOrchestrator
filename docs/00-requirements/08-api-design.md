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

### 8.10.5 チャット履歴

チャットセッションとメッセージの管理、エクスポート機能を提供する。

| メソッド | パス                           | 説明                   | 認証 |
| -------- | ------------------------------ | ---------------------- | ---- |
| GET      | /api/v1/sessions               | セッション一覧取得     | 必要 |
| GET      | /api/v1/sessions/{id}          | セッション詳細取得     | 必要 |
| POST     | /api/v1/sessions               | セッション作成         | 必要 |
| PATCH    | /api/v1/sessions/{id}          | セッション更新         | 必要 |
| DELETE   | /api/v1/sessions/{id}          | セッション削除         | 必要 |
| GET      | /api/v1/sessions/{id}/messages | メッセージ一覧取得     | 必要 |
| POST     | /api/v1/sessions/{id}/messages | メッセージ追加         | 必要 |
| GET      | /api/v1/sessions/{id}/export   | セッションエクスポート | 必要 |
| POST     | /api/v1/sessions/export/batch  | 一括エクスポート       | 必要 |
| GET      | /api/v1/sessions/{id}/preview  | エクスポートプレビュー | 必要 |

**実装ファイル**:

| 種別        | パス                                                                  |
| ----------- | --------------------------------------------------------------------- |
| 型定義      | `packages/shared/src/types/chat-session.ts`                           |
| 型定義      | `packages/shared/src/types/chat-message.ts`                           |
| リポジトリ  | `packages/shared/src/repositories/chat-session-repository.ts`         |
| リポジトリ  | `packages/shared/src/repositories/chat-message-repository.ts`         |
| サービス    | `packages/shared/src/features/chat-history/chat-history-service.ts`   |
| IPCチャネル | `packages/shared/src/ipc/channels.ts`                                 |
| 詳細設計    | `docs/30-workflows/chat-history-persistence/api-design.md`            |
| OpenAPI仕様 | `docs/30-workflows/chat-history-persistence/openapi-chat-export.yaml` |

**デスクトップアプリUI実装**:

```
apps/desktop/src/
├── renderer/
│   └── views/
│       └── ChatHistoryView/
│           └── index.tsx           # チャット履歴詳細ビュー
└── components/
    └── chat/
        ├── index.ts                # コンポーネントエクスポート
        ├── types.ts                # チャットUI型定義
        ├── ChatHistoryList.tsx     # セッション一覧
        ├── ChatHistoryListItem.tsx # セッションアイテム
        ├── ChatHistoryListStates.tsx # 一覧状態コンポーネント
        ├── ChatHistorySearch.tsx   # 検索・フィルター
        ├── ChatHistoryExport.tsx   # エクスポートダイアログ
        ├── DeleteConfirmDialog.tsx # 削除確認ダイアログ
        └── chat-search-utils.ts    # 検索ユーティリティ
```

**ルーティング**:

| パス                       | コンポーネント  | 説明                   |
| -------------------------- | --------------- | ---------------------- |
| `/chat/history/:sessionId` | ChatHistoryView | セッション詳細表示     |
| `/chat/history`            | -（未実装）     | セッション一覧（TODO） |

**エクスポートAPI詳細**:

エクスポートエンドポイントは以下のクエリパラメータをサポート:

| パラメータ      | 型                   | 説明                                        |
| --------------- | -------------------- | ------------------------------------------- |
| format          | `markdown` \| `json` | エクスポート形式（デフォルト: markdown）    |
| range           | `all` \| `selected`  | エクスポート範囲（デフォルト: all）         |
| messageIds      | string[]             | 選択メッセージID（range=selected時必須）    |
| includeMetadata | boolean              | LLMメタデータを含めるか（デフォルト: true） |
| download        | boolean              | ファイルダウンロードモード                  |

**レスポンス形式**:

- Markdown形式: `Content-Type: text/markdown; charset=utf-8`
- JSON形式: `Content-Type: application/json; charset=utf-8`
- 一括エクスポート: `Content-Type: application/zip`

---

## 8.11 Desktop IPC API（認証・プロフィール）

### 8.11.1 認証 IPC チャネル

Electron Desktop アプリでは、IPC 通信で認証機能を提供する。

**実装ファイル**:

- ハンドラー: `apps/desktop/src/main/ipc/authHandlers.ts`
- チャンネル定義: `apps/desktop/src/preload/channels.ts`
- Preload公開: `apps/desktop/src/preload/index.ts`

**チャンネル一覧**:

| チャネル            | 用途                 | Request                       | Response                           | 実装箇所            | セキュリティ       |
| ------------------- | -------------------- | ----------------------------- | ---------------------------------- | ------------------- | ------------------ |
| `auth:login`        | OAuth ログイン開始   | `{ provider: OAuthProvider }` | `IPCResponse<void>`                | authHandlers.ts:77  | withValidation適用 |
| `auth:logout`       | ログアウト           | なし                          | `IPCResponse<void>`                | authHandlers.ts:145 | withValidation適用 |
| `auth:get-session`  | セッション取得       | なし                          | `IPCResponse<AuthSession>`         | authHandlers.ts:187 | withValidation適用 |
| `auth:refresh`      | トークンリフレッシュ | なし                          | `IPCResponse<AuthSession>`         | authHandlers.ts     | withValidation適用 |
| `auth:check-online` | オンライン状態確認   | なし                          | `IPCResponse<{ online: boolean }>` | authHandlers.ts     | withValidation適用 |

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

### 8.11.5 認証状態管理

**状態遷移**:

```
checking → authenticated: セッション復元成功
checking → unauthenticated: セッションなし
unauthenticated → authenticated: ログイン成功
authenticated → unauthenticated: ログアウト
```

**状態とUI表示の対応**:

| 状態            | AuthGuard表示内容 | 説明                   |
| --------------- | ----------------- | ---------------------- |
| checking        | LoadingScreen     | セッション確認中       |
| authenticated   | children          | 認証済み（メインUI）   |
| unauthenticated | AuthView          | 未認証（ログイン画面） |

**実装コンポーネント**:

| コンポーネント | ファイル                                     | 責務                   |
| -------------- | -------------------------------------------- | ---------------------- |
| AuthGuard      | `components/AuthGuard/index.tsx`             | 認証状態による表示制御 |
| useAuthState   | `components/AuthGuard/hooks/useAuthState.ts` | 認証状態取得フック     |
| getAuthState   | `components/AuthGuard/utils/getAuthState.ts` | 状態判定純粋関数       |
| LoadingScreen  | `components/AuthGuard/LoadingScreen.tsx`     | ローディング画面       |
| AuthView       | `views/AuthView/index.tsx`                   | ログイン画面           |

### 8.11.6 IPCセキュリティ実装

**withValidationラッパー**:

すべての認証関連IPCハンドラーは`withValidation`でラップされ、以下を検証:

1. webContentsに対応するBrowserWindowの存在確認
2. DevToolsからの呼び出し検出・拒否
3. 許可されたウィンドウリストとの照合

**実装ファイル**: `apps/desktop/src/main/infrastructure/security/ipc-validator.ts`

**チャンネルホワイトリスト**:

認証関連チャンネルは`channels.ts`で明示的に許可リストに登録:

```typescript
// apps/desktop/src/preload/channels.ts
export const ALLOWED_CHANNELS = {
  invoke: [
    IPC_CHANNELS.AUTH.LOGIN, // "auth:login"
    IPC_CHANNELS.AUTH.LOGOUT, // "auth:logout"
    IPC_CHANNELS.AUTH.GET_SESSION, // "auth:get-session"
    IPC_CHANNELS.AUTH.REFRESH, // "auth:refresh"
    IPC_CHANNELS.AUTH.CHECK_ONLINE, // "auth:check-online"
    // ...
  ],
  on: [
    IPC_CHANNELS.AUTH.STATE_CHANGED, // "auth:state-changed"
    // ...
  ],
} as const;
```

### 8.11.7 AI/チャット IPC チャネル

Electronデスクトップアプリでは、IPC通信でAIチャット機能とLLM選択機能を提供する。

**実装ファイル**:

- ハンドラー: `apps/desktop/src/main/ipc/aiHandlers.ts`
- チャンネル定義: `apps/desktop/src/preload/channels.ts`
- 型定義: `apps/desktop/src/preload/types.ts`

**チャンネル一覧**:

| チャネル              | 用途                            | Request        | Response                  | 実装箇所              |
| --------------------- | ------------------------------- | -------------- | ------------------------- | --------------------- |
| `AI_CHAT`             | LLMへのメッセージ送信と応答取得 | AIChatRequest  | AIChatResponse            | aiHandlers.ts:21-89   |
| `AI_CHECK_CONNECTION` | LLM/RAG接続状態確認             | なし           | AICheckConnectionResponse | aiHandlers.ts:93-112  |
| `AI_INDEX`            | RAGドキュメントインデックス作成 | AIIndexRequest | AIIndexResponse           | aiHandlers.ts:116-143 |

**型定義詳細**: 型定義は[コアインターフェース 6.9](./06-core-interfaces.md#69-llm-チャット関連型定義desktop-ipc)を参照。

**LLM選択状態管理**:

- **Store**: Zustand chatSlice
- **状態**: currentProviderId（"openai" | "anthropic" | "google" | "xai"）、currentModelId
- **初期値**: OpenAI gpt-5.2-instant
- **切り替え**: リアルタイム（確認ダイアログなし）

**対応LLMプロバイダー**:

| プロバイダー | モデル例                         | コンテキストウィンドウ |
| ------------ | -------------------------------- | ---------------------- |
| OpenAI       | gpt-5.2-instant, gpt-4           | 400K, 8K               |
| Anthropic    | claude-sonnet-4.5, claude-3-opus | 200K (1M beta), 200K   |
| Google       | gemini-3-flash, gemini-pro       | 1M, 32K                |
| xAI          | grok-4.1-fast, grok-1            | 2M, 8K                 |

**統合仕様**:

- LLM選択とシステムプロンプトは独立して設定可能
- メッセージ送信時、両方の設定を`AI_CHAT` IPCリクエストに含める
- プロバイダー/モデル切り替え時もシステムプロンプトは保持される
- 会話履歴は保持されるが、各モデルは独立して動作

**セキュリティ考慮事項**:

| 項目                       | 対策                                          |
| -------------------------- | --------------------------------------------- |
| APIキー保護                | Electron SafeStorageで暗号化保存              |
| プロンプトインジェクション | ローカルアプリのため影響限定的                |
| XSS攻撃                    | React自動エスケープ + IPC経由で文字列のみ送信 |
| レート制限対応             | プロバイダー側のレート制限エラーを通知        |

**参照**:

- 詳細仕様: [アーキテクチャ設計 5.8.7](./05-architecture.md#587-ipcチャネル設計チャットllm選択)
- 型定義: [コアインターフェース 6.9](./06-core-interfaces.md#69-llm-チャット関連型定義desktop-ipc)
- UI仕様: [UI/UX 16.19](./16-ui-ux-guidelines.md#1619-llm選択機能chat-llm-switching)

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

## 8.15 内部サービスAPI（RAG変換システム）

### 8.15.1 ConversionService API

RAG Conversion Systemは、HTTPエンドポイントとしてではなく、TypeScriptの内部サービスクラスとして実装されています。

**利用場所**: `packages/shared/src/services/conversion/`

**主要クラス**:

| クラス              | 責務                                       |
| ------------------- | ------------------------------------------ |
| `ConversionService` | 変換処理の統括、タイムアウト・同時実行制御 |
| `ConverterRegistry` | 利用可能なコンバーターの管理と選択         |
| `BaseConverter`     | 共通変換処理の抽象基底クラス               |

### 8.15.2 ConversionService メソッド

#### convert()

```typescript
async convert(
  input: ConverterInput,
  options?: ConverterOptions
): Promise<Result<ConverterOutput, RAGError>>
```

**機能**:

- 単一ファイルを変換
- 同時実行数チェック（デフォルト: 最大5件）
- タイムアウト管理（デフォルト: 60秒）
- 自動コンバーター選択

**パラメータ**:

- `input.fileId`: ファイルID（Branded型）
- `input.content`: ファイルコンテンツ（文字列またはBuffer）
- `input.mimeType`: MIMEタイプ
- `input.filePath`: ファイルパス（オプション）
- `options.maxContentLength`: 最大コンテンツ長（デフォルト: 100,000文字）
- `options.timeout`: タイムアウト時間（ミリ秒）

**戻り値**:

- 成功: `{ success: true, data: ConverterOutput }`
- 失敗: `{ success: false, error: RAGError }`

#### convertBatch()

```typescript
async convertBatch(
  inputs: ConverterInput[],
  options?: ConverterOptions
): Promise<BatchConversionResult[]>
```

**機能**:

- 複数ファイルを一括変換
- チャンク単位で処理（同時実行数制限）
- Promise.allSettled()で一部失敗を許容

**戻り値**:

- 各ファイルの変換結果（成功/失敗）の配列

#### canConvert()

```typescript
canConvert(input: ConverterInput): boolean
```

**機能**:

- 変換可能性を事前確認
- コンバーター検索のみ（変換は実行しない）

#### getSupportedMimeTypes()

```typescript
getSupportedMimeTypes(): string[]
```

**機能**:

- サポートしているMIMEタイプ一覧を取得

### 8.15.3 使用パターン

**パターン1: グローバルインスタンス使用**

```typescript
import { globalConversionService } from "@repo/shared/services/conversion";

const result = await globalConversionService.convert(input);
```

**パターン2: カスタム設定インスタンス**

```typescript
import { createConversionService } from "@repo/shared/services/conversion";

const service = createConversionService(customRegistry, {
  defaultTimeout: 30000,
  maxConcurrentConversions: 10,
});

const result = await service.convert(input);
```

### 8.15.4 エラーハンドリング

**エラーコード**:

| コード                | 説明               | 原因                                   |
| --------------------- | ------------------ | -------------------------------------- |
| `RESOURCE_EXHAUSTED`  | 同時実行数超過     | 最大同時実行数に到達                   |
| `TIMEOUT`             | タイムアウト       | 変換処理が指定時間内に完了しなかった   |
| `CONVERTER_NOT_FOUND` | コンバーター未検出 | 対応するコンバーターが登録されていない |
| `CONVERSION_FAILED`   | 変換失敗           | 個別コンバーターでのエラー             |

**Result型パターン**:

```typescript
const result = await service.convert(input);

if (result.success) {
  const { convertedContent, extractedMetadata } = result.data;
  // 成功時の処理
} else {
  const { code, message, context } = result.error;
  // エラー処理
  console.error(`[${code}] ${message}`, context);
}
```

### 8.15.5 性能特性

| 指標                       | 値     |
| -------------------------- | ------ |
| デフォルトタイムアウト     | 60秒   |
| 最大同時実行数             | 5件    |
| サポートMIMEタイプ         | 18種類 |
| 平均変換時間（小ファイル） | 3-50ms |
| 平均変換時間（Markdown）   | 400ms  |

---

## 8.16 チャンク検索API（RAG全文検索）

### 8.16.1 概要

FTS5全文検索機能を利用したチャンク検索APIの設計。将来的にREST APIまたはElectron IPCとして実装予定。

**実装状況**: データベース層（chunks-search.ts）のみ実装済み、API層は未実装

### 8.16.2 検索エンドポイント（将来実装）

#### キーワード検索

**エンドポイント**: `POST /api/v1/chunks/search/keyword`

**リクエストボディ**:

| フィールド      | 型     | 必須 | 説明                                    |
| --------------- | ------ | ---- | --------------------------------------- |
| query           | string | Yes  | 検索クエリ（複数キーワードOR検索）      |
| fileId          | string | No   | ファイルIDで絞り込み（ULID形式）        |
| limit           | number | No   | 取得件数（デフォルト: 10、最大: 100）   |
| offset          | number | No   | オフセット（デフォルト: 0）             |
| highlightTags   | object | No   | ハイライトタグ（開始/終了タグ）         |
| bm25ScaleFactor | number | No   | BM25スケールファクタ（デフォルト: 0.3） |

**レスポンス**:

| フィールド            | 型      | 説明                                 |
| --------------------- | ------- | ------------------------------------ |
| results               | array   | 検索結果配列                         |
| results[].id          | string  | チャンクID                           |
| results[].content     | string  | チャンク本文                         |
| results[].highlighted | string  | ハイライト適用済み本文（オプション） |
| results[].score       | number  | 関連度スコア（0.0 - 1.0）            |
| results[].fileId      | string  | 親ファイルID                         |
| results[].chunkIndex  | number  | ファイル内の順序                     |
| totalCount            | number  | 総ヒット数                           |
| hasMore               | boolean | 次ページの有無                       |

#### フレーズ検索

**エンドポイント**: `POST /api/v1/chunks/search/phrase`

**リクエストボディ**: キーワード検索と同じ（queryは完全一致フレーズ）

**動作**: 語順を保持した完全一致検索

#### NEAR検索（近接検索）

**エンドポイント**: `POST /api/v1/chunks/search/near`

**リクエストボディ**:

| フィールド   | 型       | 必須 | 説明                                |
| ------------ | -------- | ---- | ----------------------------------- |
| terms        | string[] | Yes  | 検索キーワード配列（2個以上）       |
| nearDistance | number   | No   | 近接距離（デフォルト: 5、最大: 50） |
| fileId       | string   | No   | ファイルIDで絞り込み                |
| limit        | number   | No   | 取得件数                            |
| offset       | number   | No   | オフセット                          |

**動作**: 指定距離内にすべてのキーワードが出現するチャンクを検索

### 8.16.3 性能目標

| 指標               | 目標値（10,000チャンク） | 備考             |
| ------------------ | ------------------------ | ---------------- |
| キーワード検索速度 | < 100ms                  | 95パーセンタイル |
| フレーズ検索速度   | < 100ms                  | 95パーセンタイル |
| NEAR検索速度       | < 150ms                  | 95パーセンタイル |
| 並行検索（10req）  | < 100ms（平均）          | スループット維持 |

### 8.16.4 使用例（データベース層）

現在実装済みのデータベース層APIの使用例：

```typescript
// キーワード検索
import { searchChunksByKeyword } from "@repo/shared/db/queries/chunks-search";

const results = await searchChunksByKeyword(db, {
  query: "TypeScript JavaScript",
  limit: 10,
  offset: 0,
});

// フレーズ検索
const phraseResults = await searchChunksByPhrase(db, {
  query: "typed superset",
  limit: 10,
});

// NEAR検索
const nearResults = await searchChunksByNear(db, ["JavaScript", "library"], {
  nearDistance: 5,
  limit: 10,
});
```

### 8.16.5 実装ステータス

| レイヤー       | 実装状況    | 備考                       |
| -------------- | ----------- | -------------------------- |
| データベース層 | ✅ 実装済み | `queries/chunks-search.ts` |
| サービス層     | 未実装      | 将来追加予定               |
| REST API層     | 未実装      | Next.js App Router         |
| Desktop IPC層  | 未実装      | Electron IPC               |

**参照実装**: `packages/shared/src/db/queries/chunks-search.ts`

---

## 8.17 Embedding Generation API

> **実装**: `packages/shared/src/services/embedding/`

### 8.17.1 主要インターフェース

#### ドキュメント埋め込み処理

**メソッド**: `EmbeddingPipeline.process()`

```typescript
process(
  input: PipelineInput,
  config?: PipelineConfig,
  onProgress?: (progress: PipelineProgress) => void
): Promise<PipelineOutput>
```

**入力パラメータ**:

| パラメータ                                | 型           | 説明                               |
| ----------------------------------------- | ------------ | ---------------------------------- |
| `input.documentId`                        | string       | ドキュメント識別子                 |
| `input.documentType`                      | DocumentType | markdown / code / text             |
| `input.text`                              | string       | ドキュメントテキスト               |
| `input.metadata`                          | object       | メタデータ（オプション）           |
| `config.chunking.strategy`                | string       | fixed / markdown / code / semantic |
| `config.chunking.options.chunkSize`       | number       | 512（デフォルト）                  |
| `config.embedding.modelId`                | string       | EMB-002等                          |
| `config.embedding.batchOptions.batchSize` | number       | 50（デフォルト）                   |
| `onProgress`                              | function     | 進捗コールバック                   |

**出力パラメータ**:

| フィールド              | 型         | 説明                   |
| ----------------------- | ---------- | ---------------------- |
| `documentId`            | string     | ドキュメントID         |
| `chunks`                | Chunk[]    | 生成されたチャンク配列 |
| `embeddings`            | number[][] | 埋め込みベクトル配列   |
| `chunksProcessed`       | number     | 処理されたチャンク数   |
| `embeddingsGenerated`   | number     | 生成された埋め込み数   |
| `duplicatesRemoved`     | number     | 重複排除数             |
| `cacheHits`             | number     | キャッシュヒット数     |
| `totalProcessingTimeMs` | number     | 総処理時間（ms）       |
| `stageTimings`          | object     | ステージ別処理時間     |

#### 単一埋め込み生成

**メソッド**: `EmbeddingService.embed()`

```typescript
embed(
  text: string,
  options?: EmbedOptions
): Promise<EmbeddingResult>
```

**入力パラメータ**:

| パラメータ        | 型           | 説明                 |
| ----------------- | ------------ | -------------------- |
| `text`            | string       | 埋め込み対象テキスト |
| `options.timeout` | number       | タイムアウト（ms）   |
| `options.retry`   | RetryOptions | リトライ設定         |

**出力パラメータ**:

| フィールド         | 型       | 説明             |
| ------------------ | -------- | ---------------- |
| `embedding`        | number[] | 埋め込みベクトル |
| `tokenCount`       | number   | トークン数       |
| `model`            | string   | 使用モデル       |
| `processingTimeMs` | number   | 処理時間（ms）   |

#### バッチ埋め込み生成

**メソッド**: `EmbeddingService.embedBatch()`

```typescript
embedBatch(
  texts: string[],
  options?: BatchEmbedOptions
): Promise<BatchEmbeddingResult>
```

**入力パラメータ**:

| パラメータ                    | 型       | 説明                           |
| ----------------------------- | -------- | ------------------------------ |
| `texts`                       | string[] | テキスト配列                   |
| `options.batchSize`           | number   | バッチサイズ（デフォルト: 50） |
| `options.concurrency`         | number   | 並列数（デフォルト: 2）        |
| `options.enableDeduplication` | boolean  | 重複排除（デフォルト: true）   |

**出力パラメータ**:

| フィールド         | 型         | 説明                 |
| ------------------ | ---------- | -------------------- |
| `embeddings`       | number[][] | 埋め込みベクトル配列 |
| `duplicatesRemoved | number     | 重複排除数           |
| `totalTimeMs`      | number     | 総処理時間（ms）     |

#### チャンク生成

**メソッド**: `ChunkingService.chunk()`

```typescript
chunk(
  document: Document,
  strategy: ChunkingStrategy,
  options?: ChunkingOptions
): Promise<Chunk[]>
```

**入力パラメータ**:

| パラメータ            | 型               | 説明                            |
| --------------------- | ---------------- | ------------------------------- |
| `document.id`         | string           | ドキュメントID                  |
| `document.type`       | DocumentType     | markdown / code / text          |
| `document.content`    | string           | ドキュメント本文                |
| `strategy`            | ChunkingStrategy | fixed / markdown / code / ...   |
| `options.chunkSize`   | number           | チャンクサイズ（デフォルト512） |
| `options.overlapSize` | number           | オーバーラップ（デフォルト50）  |

**出力パラメータ**:

| フィールド                | 型     | 説明                 |
| ------------------------- | ------ | -------------------- |
| `chunks[].content`        | string | チャンク本文         |
| `chunks[].metadata.index` | number | チャンクインデックス |
| `chunks[].metadata.type`  | string | チャンクタイプ       |
| `chunks[].size`           | number | サイズ（文字数）     |

### 8.17.2 エラーコード

| エラーコード              | 説明                         | HTTPステータス |
| ------------------------- | ---------------------------- | -------------- |
| `EMB_INVALID_INPUT`       | 入力パラメータが不正         | 400            |
| `EMB_PROVIDER_ERROR`      | プロバイダAPIエラー          | 502            |
| `EMB_CIRCUIT_OPEN`        | サーキットブレーカーが開状態 | 503            |
| `EMB_RATE_LIMIT_EXCEEDED` | レート制限超過               | 429            |
| `EMB_TIMEOUT`             | タイムアウト                 | 504            |
| `EMB_CACHE_ERROR`         | キャッシュエラー             | 500            |

### 8.17.3 性能指標

| 指標                         | 値      |
| ---------------------------- | ------- |
| 1000チャンク処理時間         | 2.17秒  |
| メモリ使用量（1000チャンク） | 8.9MB   |
| キャッシュヒット率           | 95%以上 |
| 重複排除率                   | 10-15%  |
| 差分更新高速化               | 4.34倍  |

---

## 関連ドキュメント

- [エラーハンドリング仕様](./07-error-handling.md)
- [コアインターフェース仕様](./06-core-interfaces.md)
- [セキュリティガイドライン](./17-security-guidelines.md)
- [デプロイメント](./12-deployment.md)
