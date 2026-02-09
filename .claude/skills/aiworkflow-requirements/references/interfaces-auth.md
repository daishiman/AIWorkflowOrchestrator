# 認証・プロフィール インターフェース仕様

> 本ドキュメントは統合システム設計仕様書の一部です。
> 管理: .claude/skills/aiworkflow-requirements/

---

## 認証・プロフィール型定義

Desktop アプリの認証機能で使用する型定義。

### AuthUser

認証済みユーザーの基本情報。

| フィールド   | 型             | 説明                    |
| ------------ | -------------- | ----------------------- |
| id           | string         | ユーザーID              |
| email        | string \| null | メールアドレス          |
| displayName  | string \| null | 表示名                  |
| avatarUrl    | string \| null | アバターURL             |
| createdAt    | string         | 作成日時（ISO8601）     |
| lastSignInAt | string         | 最終ログイン（ISO8601） |

### UserProfile

ユーザープロフィール詳細情報。

| フィールド  | 型                              | 説明                |
| ----------- | ------------------------------- | ------------------- |
| id          | string                          | ユーザーID          |
| displayName | string                          | 表示名              |
| email       | string                          | メールアドレス      |
| avatarUrl   | string \| null                  | アバターURL         |
| plan        | "free" \| "pro" \| "enterprise" | プラン種別          |
| createdAt   | string                          | 作成日時（ISO8601） |
| updatedAt   | string                          | 更新日時（ISO8601） |

### ExtendedUserProfile

ユーザープロフィール拡張情報（通知設定等を含む）。

| フィールド           | 型                   | 説明                       |
| -------------------- | -------------------- | -------------------------- |
| id                   | string               | ユーザーID                 |
| displayName          | string               | 表示名                     |
| email                | string               | メールアドレス             |
| avatarUrl            | string \| null       | アバターURL                |
| plan                 | string               | プラン種別                 |
| createdAt            | string               | 作成日時（ISO8601）        |
| updatedAt            | string               | 更新日時（ISO8601）        |
| timezone             | string               | タイムゾーン（IANA形式）   |
| locale               | string               | ロケール（ja, en等）       |
| notificationSettings | NotificationSettings | 通知設定                   |
| preferences          | object               | ユーザー設定（将来拡張用） |

### NotificationSettings

通知設定オブジェクト。

| フィールド       | 型      | 説明                       |
| ---------------- | ------- | -------------------------- |
| email            | boolean | メール通知を受け取る       |
| desktop          | boolean | デスクトップ通知を表示     |
| sound            | boolean | 通知時に音を鳴らす         |
| workflowComplete | boolean | ワークフロー完了時に通知   |
| workflowError    | boolean | ワークフローエラー時に通知 |

**デフォルト値**: すべて `true`

### OAuthProvider

対応する OAuth プロバイダー。

| 値      | 説明          |
| ------- | ------------- |
| google  | Google OAuth  |
| github  | GitHub OAuth  |
| discord | Discord OAuth |

### SupabaseIdentity

Supabase Auth が返す identity オブジェクト。OAuth プロバイダーごとに identity_data のキー名が異なる。

| フィールド    | 型                                     | 説明                   |
| ------------- | -------------------------------------- | ---------------------- |
| id            | string                                 | Identity ID            |
| provider      | string                                 | プロバイダー名         |
| identity_data | SupabaseIdentityData \| undefined      | プロバイダー固有データ |
| created_at    | string                                 | 作成日時（ISO8601）    |

#### SupabaseIdentityData

| フィールド | 型             | 説明                               |
| ---------- | -------------- | ---------------------------------- |
| email      | string \| undefined | メールアドレス                |
| name       | string \| undefined | 表示名                        |
| avatar_url | string \| undefined | アバターURL（GitHub, Discord） |
| picture    | string \| undefined | アバターURL（Google）          |

> **プロバイダー別アバターURLキー名**
> - Google: `picture`
> - GitHub: `avatar_url`
> - Discord: `avatar_url`

**実装場所**: `packages/shared/types/auth.ts`

---

### LinkedProvider

連携済みプロバイダー情報。

| フィールド | 型             | 説明                 |
| ---------- | -------------- | -------------------- |
| id         | string         | Identity ID          |
| provider   | string         | プロバイダー名       |
| email      | string \| null | プロバイダーのメール |
| name       | string \| null | プロバイダーの名前   |
| avatarUrl  | string \| null | アバターURL          |
| linkedAt   | string         | 連携日時（ISO8601）  |

### AuthGuardState

認証ガードの状態を表す Discriminated Union。

| status          | 追加フィールド | 説明     |
| --------------- | -------------- | -------- |
| checking        | -              | 確認中   |
| authenticated   | user: AuthUser | 認証済み |
| unauthenticated | -              | 未認証   |

### AuthErrorCode

認証エラーコード。

| コード                | 説明                   |
| --------------------- | ---------------------- |
| NETWORK_ERROR         | ネットワーク接続エラー |
| AUTH_FAILED           | 認証失敗               |
| TIMEOUT               | タイムアウト           |
| SESSION_EXPIRED       | セッション期限切れ     |
| PROVIDER_ERROR        | プロバイダーエラー     |
| PROFILE_UPDATE_FAILED | プロフィール更新失敗   |
| LINK_PROVIDER_FAILED  | アカウント連携失敗     |
| DATABASE_ERROR        | データベースエラー     |
| UNKNOWN               | 未分類エラー           |

**実装場所**: `packages/shared/types/auth.ts`, `apps/desktop/src/renderer/components/AuthGuard/types.ts`

### AUTH_ERROR_CODES（OAuth拡張）

TASK-FIX-GOOGLE-LOGIN-001で追加されたOAuth認証エラーコード。

| コード                            | 値                                     | 説明                           |
| --------------------------------- | -------------------------------------- | ------------------------------ |
| AUTH_NOT_CONFIGURED               | `auth/not-configured`                  | Supabaseが設定されていない     |
| OAUTH_ACCESS_DENIED               | `auth/oauth-access-denied`             | ユーザーが認証をキャンセル     |
| OAUTH_SERVER_ERROR                | `auth/oauth-server-error`              | 認証サーバーエラー             |
| OAUTH_TEMPORARILY_UNAVAILABLE     | `auth/oauth-temporarily-unavailable`   | 認証サーバー一時利用不可       |
| OAUTH_INVALID_REQUEST             | `auth/oauth-invalid-request`           | 認証リクエストが不正           |
| OAUTH_UNAUTHORIZED_CLIENT         | `auth/oauth-unauthorized-client`       | クライアントが許可されていない |
| OAUTH_UNSUPPORTED_RESPONSE_TYPE   | `auth/oauth-unsupported-response-type` | サポートされていない認証タイプ |
| OAUTH_INVALID_SCOPE               | `auth/oauth-invalid-scope`             | 無効な認証スコープ             |
| OAUTH_UNKNOWN_ERROR               | `auth/oauth-unknown-error`             | 未知の認証エラー               |

**実装場所**: `packages/shared/types/auth.ts`

### AuthSession

認証セッション情報。

| フィールド            | 型             | 説明                                     |
| --------------------- | -------------- | ---------------------------------------- |
| user                  | AuthUser       | 認証済みユーザー情報                     |
| accessToken           | string         | アクセストークン                         |
| refreshToken          | string         | リフレッシュトークン                     |
| expiresAt             | number         | トークン有効期限（UNIXタイムスタンプ）   |
| isOffline             | boolean        | オフラインモードフラグ                   |
| refreshTokenExpiresAt | number \| undefined | リフレッシュトークン有効期限（7日後） |

**実装場所**: `packages/shared/types/auth.ts`

### TokenRefreshCallbacks（TASK-AUTH-SESSION-REFRESH-001）

セッションリフレッシュ時のコールバックインターフェース。Callback DIパターンにより、スケジューラーは「いつ実行するか」のみに責務を限定。

| フィールド | 型                                        | 説明                                   |
| ---------- | ----------------------------------------- | -------------------------------------- |
| onRefresh  | () => Promise\<number \| null\>           | リフレッシュ実行。新expiresAt(ms)を返す |
| onFailure  | (error: Error) => void                    | 全リトライ失敗時のコールバック         |
| onSuccess  | (newExpiresAt: number) => void \| undefined | リフレッシュ成功時（オプション）       |

**実装場所**: `apps/desktop/src/main/services/tokenRefreshScheduler.ts`

### TokenRefreshConfig（TASK-AUTH-SESSION-REFRESH-001）

スケジューラー設定。

| フィールド            | 型     | デフォルト | 説明                                   |
| --------------------- | ------ | ---------- | -------------------------------------- |
| refreshBeforeExpiryMs | number | 300000     | 有効期限の何ms前にリフレッシュ         |
| maxRetries            | number | 3          | 最大リトライ回数                       |
| retryBaseIntervalMs   | number | 1000       | リトライ基本間隔（指数バックオフ基準） |

**実装場所**: `apps/desktop/src/main/services/tokenRefreshScheduler.ts`

### AuthState

Zustand認証状態。

| フィールド            | 型                 | 説明                                     |
| --------------------- | ------------------ | ---------------------------------------- |
| isAuthenticated       | boolean            | 認証済みフラグ                           |
| isLoading             | boolean            | ローディング状態                         |
| user                  | AuthUser \| null   | ユーザー情報                             |
| error                 | string \| null     | エラーメッセージ                         |
| errorCode             | string \| undefined | エラーコード（AUTH_ERROR_CODES値）       |

**実装場所**: `apps/desktop/src/renderer/store/slices/authSlice.ts`

### SupabaseIdentity

Supabase Auth から取得するプロバイダー識別情報。

| フィールド    | 型                   | 説明                   |
| ------------- | -------------------- | ---------------------- |
| id            | string               | Identity ID            |
| provider      | string               | プロバイダー名         |
| identity_data | SupabaseIdentityData | プロバイダー固有データ |
| created_at    | string               | 作成日時（ISO8601）    |

#### SupabaseIdentityData

プロバイダー固有のユーザー情報。

| フィールド | 型             | 説明                                    |
| ---------- | -------------- | --------------------------------------- |
| email      | string         | プロバイダーのメール                    |
| name       | string         | プロバイダーの名前                      |
| avatar_url | string \| null | アバターURL（GitHub/Discord）           |
| picture    | string \| null | アバターURL（Google）※AUTH-UI-004で追加 |

**プロバイダー別アバターURLキー名**:

| プロバイダー | キー名       |
| ------------ | ------------ |
| Google       | `picture`    |
| GitHub       | `avatar_url` |
| Discord      | `avatar_url` |

**実装場所**: `packages/shared/types/auth.ts`

---

## 完了タスク

### AUTH-UI-004: Googleアバター取得修正（2026-02-04完了）

| 項目         | 内容                                           |
| ------------ | ---------------------------------------------- |
| タスクID     | AUTH-UI-004                                    |
| ステータス   | **完了**                                       |
| テスト数     | 1265（自動テスト）+ 5（手動テスト項目）        |
| 発見課題     | 0件                                            |
| ドキュメント | `docs/30-workflows/AUTH-UI-004-google-avatar/` |

### TASK-FIX-GOOGLE-LOGIN-001: Googleログイン修正（2026-02-05完了）

| 項目         | 内容                                                  |
| ------------ | ----------------------------------------------------- |
| タスクID     | TASK-FIX-GOOGLE-LOGIN-001                             |
| ステータス   | **完了**                                              |
| Phase        | Phase 1-12完了                                        |
| テスト数     | 約50件（oauth-error-handler, authSlice.listener等）   |
| ドキュメント | `docs/30-workflows/TASK-FIX-GOOGLE-LOGIN-001/`        |

#### 修正内容

### TASK-AUTH-MODE-SELECTION-001: 認証方式選択機能（2026-02-09完了）

| 項目         | 内容                                                  |
| ------------ | ----------------------------------------------------- |
| タスクID     | TASK-AUTH-MODE-SELECTION-001                          |
| ステータス   | **完了**                                              |
| Phase        | Phase 1-12完了                                        |
| テスト数     | 86件（AuthModeService, SubscriptionAuthProvider等）   |
| ドキュメント | `docs/30-workflows/TASK-AUTH-MODE-SELECTION-001/`     |

#### 実装内容

| 機能                        | 説明                                                   |
| --------------------------- | ------------------------------------------------------ |
| 認証方式選択UI              | サブスクリプション/APIキー認証の切り替えUI             |
| AuthModeService             | 認証方式の永続化・管理サービス                         |
| SubscriptionAuthProvider    | Claude Code CLIトークン取得（macOS Keychain経由）      |
| IPCハンドラ                 | auth-mode:get/set/status/validate チャンネル           |
| authModeSlice               | Zustand状態管理（P5防止パターン適用）                  |

#### 新規ファイル

| ファイル                                                  | 内容                               |
| --------------------------------------------------------- | ---------------------------------- |
| `packages/shared/src/types/auth-mode.ts`                  | 共有型定義（AuthMode等）           |
| `apps/desktop/src/main/services/auth/AuthModeService.ts`  | 認証方式管理サービス               |
| `apps/desktop/src/main/services/auth/SubscriptionAuthProvider.ts` | CLIトークン取得          |
| `apps/desktop/src/main/ipc/authModeHandlers.ts`           | IPCハンドラ                        |
| `apps/desktop/src/renderer/store/slices/authModeSlice.ts` | Zustand slice                      |
| `apps/desktop/src/renderer/components/settings/AuthModeSelector/index.tsx` | UIコンポーネント |

#### 修正内容

| 問題 | 修正内容                                                            |
| ---- | ------------------------------------------------------------------- |
| 1    | OAuthコールバックのerrorパラメータ検出（parseOAuthError関数追加）   |
| 2    | Supabase未設定時エラー（AUTH_NOT_CONFIGUREDコード追加）             |
| 3    | セッション管理（refreshTokenExpiresAtフィールド追加）               |
| 4    | リスナー二重登録防止（authListenerRegisteredフラグ追加）            |

#### 新規ファイル

| ファイル                                            | 内容                               |
| --------------------------------------------------- | ---------------------------------- |
| `apps/desktop/src/main/auth/oauth-error-handler.ts` | OAuthエラーパース・マッピング関数  |

#### 関数追加

| 関数名                         | 説明                                   |
| ------------------------------ | -------------------------------------- |
| `parseOAuthError()`            | URLからOAuthエラーパラメータを抽出     |
| `mapOAuthErrorToMessage()`     | エラーコードを日本語メッセージに変換   |
| `calculateRefreshTokenExpiry()`| リフレッシュトークン有効期限計算       |
| `waitForSession()`             | ポーリングベースのセッション待機       |
| `resetAuthListenerFlag()`      | テスト用リスナーフラグリセット         |

#### 変更内容

- SupabaseIdentity型にpictureプロパティを追加
- toLinkedProvider関数にフォールバック処理を実装（avatar_url → picture）

---

## ワークスペース型定義

Desktop アプリの複数フォルダ管理機能で使用する型定義。

### Workspace

ワークスペースの状態を表す型。

| フィールド         | 型             | 説明                       |
| ------------------ | -------------- | -------------------------- |
| id                 | WorkspaceId    | ワークスペースID（固定値） |
| folders            | FolderEntry[]  | 登録フォルダ一覧           |
| lastSelectedFileId | FileId \| null | 最後に選択したファイルID   |
| createdAt          | Date           | 作成日時                   |
| updatedAt          | Date           | 更新日時                   |

### FolderEntry

登録フォルダのエントリ。

| フィールド    | 型            | 説明                 |
| ------------- | ------------- | -------------------- |
| id            | FolderId      | フォルダID（UUID）   |
| path          | FolderPath    | 絶対パス             |
| displayName   | string        | 表示名（フォルダ名） |
| isExpanded    | boolean       | 展開状態             |
| expandedPaths | Set\<string\> | 展開サブフォルダパス |
| addedAt       | Date          | 追加日時             |

### Branded Types

型安全性を高めるためのブランド型。

| 型名        | ベース型 | 説明                                |
| ----------- | -------- | ----------------------------------- |
| WorkspaceId | string   | ワークスペースID（"default"固定）   |
| FolderId    | string   | フォルダID（UUID形式）              |
| FolderPath  | string   | フォルダパス（絶対パス、"/"で開始） |
| FileId      | string   | ファイルID（UUID形式）              |
| FilePath    | string   | ファイルパス（絶対パス、"/"で開始） |

### セキュリティ制約

| 制約             | 実装                               |
| ---------------- | ---------------------------------- |
| パストラバーサル | ".." を含むパスは拒否              |
| 絶対パス         | "/" で開始しないパスは拒否         |
| パス正規化       | 連続スラッシュ・末尾スラッシュ除去 |
| ファイルサイズ   | 10MB 上限                          |

**実装場所**: `apps/desktop/src/renderer/store/types/workspace.ts`, `apps/desktop/src/main/ipc/validation.ts`

---

## 変更履歴

| Version    | Date           | Changes                                                                                 |
| ---------- | -------------- | --------------------------------------------------------------------------------------- |
| **1.4.0**  | **2026-02-09** | TASK-AUTH-MODE-SELECTION-001: AuthMode型・AuthModeService・SubscriptionAuthProvider・authModeSlice追加（認証方式選択機能） |
| **1.3.0**  | **2026-02-06** | TASK-AUTH-SESSION-REFRESH-001: TokenRefreshCallbacks/TokenRefreshConfig型定義追加（Callback DIパターン、スケジューラー設定） |
| **1.2.0**  | **2026-02-05** | TASK-FIX-GOOGLE-LOGIN-001完了: AUTH_ERROR_CODES拡張(9コード)、AuthSession/AuthState型拡張、OAuthエラーハンドリング |
| 1.1.0      | 2026-02-04     | AUTH-UI-004完了: SupabaseIdentity型にpictureプロパティ追加、完了タスクセクション追加    |
| 1.0.0      | 2026-01-15     | 初版作成: 認証・プロフィール・ワークスペース型定義                                       |
