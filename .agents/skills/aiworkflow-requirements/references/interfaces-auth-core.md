# 認証・プロフィール インターフェース仕様 / core specification

> 親仕様書: [interfaces-auth.md](interfaces-auth.md)
> 役割: core specification

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

### PROFILE_ERROR_CODES

Profile IPC のエラーコード。Supabase 未設定 fallback では `NOT_CONFIGURED` を返す。

| コード                         | 値                         | 説明                           |
| ------------------------------ | -------------------------- | ------------------------------ |
| PROFILE_ERROR_CODES.NOT_CONFIGURED | `profile/not-configured` | Supabase が設定されていない    |

**実装場所**: `packages/shared/types/auth.ts`

### AVATAR_ERROR_CODES

Avatar IPC のエラーコード。Supabase 未設定 fallback では `NOT_CONFIGURED` を返す。

| コード                        | 値                        | 説明                        |
| ----------------------------- | ------------------------- | --------------------------- |
| AVATAR_ERROR_CODES.NOT_CONFIGURED | `avatar/not-configured` | Supabase が設定されていない |

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

## ExecutionCapability 型定義（TASK-IMP-EXECUTION-RESPONSIBILITY-CONTRACT-FOUNDATION-001）

`packages/shared/src/types/execution-capability.ts` に定義された実行責任契約の型群。

### AccessCapability

AI 実行経路の能力状態を表す4値型。`chatSlice.ts` から re-export で後方互換性を維持。

| 値 | 説明 |
| --- | --- |
| `"integratedRuntime"` | integrated AI runtime が利用可能 |
| `"terminalSurface"` | terminal surface のみ利用可能 |
| `"both"` | integrated と terminal の両方が利用可能 |
| `"none"` | どの経路も利用不可 |

**実装場所**: `packages/shared/src/types/execution-capability.ts`
**re-export**: `apps/desktop/src/renderer/store/slices/chatSlice.ts`

### UiState

UI 表示状態を表す3値型。

| 値 | 説明 |
| --- | --- |
| `"ready"` | 実行可能状態 |
| `"blocked"` | ブロック状態（理由を BlockedInfo で提供） |
| `"unavailable"` | 利用不可状態 |

### BlockedInfo

ブロック状態の詳細情報。

| フィールド | 型 | 説明 |
| --- | --- | --- |
| reason | string | ブロック理由 |
| action | string \| undefined | ユーザーに促すアクション |

### CtaContract

CTA（Call to Action）契約。

| フィールド | 型 | 説明 |
| --- | --- | --- |
| primary | CtaItem | 主要 CTA（1件のみ） |
| secondary | CtaItem \| undefined | 副次 CTA（省略可） |

**制約**: `none` 能力では実行 CTA を DOM に含めない（assertNoPrimaryCta で強制）。

### ExecutionCapabilityStatus

能力解決の結果を包含するメインDTO。

| フィールド | 型 | 説明 |
| --- | --- | --- |
| capability | AccessCapability | 解決された能力値 |
| uiState | UiState | UI 表示状態 |
| blockedInfo | BlockedInfo \| undefined | ブロック状態の詳細 |
| cta | CtaContract | CTA 契約 |

### 解決関数

| 関数名 | 説明 |
| --- | --- |
| `resolveCapability(input)` | AccessCapabilityInput から AccessCapability を解決 |
| `resolveUiState(capability, context)` | capability と CapabilityContext から UiState を解決 |
| `resolveCtaContract(capability, input)` | capability から CtaContract を解決 |
| `assertNoSilentFallback(capability)` | silent fallback を禁止するアサーション |
| `assertNoPrimaryCta(capability)` | none 能力での primary CTA を禁止するアサーション |

**実装場所**: `packages/shared/src/types/execution-capability.ts`

### AuthModeStatus DTO 拡張フィールド（TASK-IMP-EXECUTION-RESPONSIBILITY-CONTRACT-FOUNDATION-001）

`packages/shared/src/types/auth-mode.ts` の `AuthModeStatus` に以下の optional フィールドが追加された。

| フィールド | 型 | 説明 |
| --- | --- | --- |
| capability | AccessCapability \| undefined | 解決済み能力値 |
| uiState | UiState \| undefined | 解決済み UI 状態 |
| blockedReason | string \| undefined | ブロック理由（uiState === "blocked" 時） |
| blockedAction | string \| undefined | ブロック解除アクション（uiState === "blocked" 時） |

**関連タスク**: TASK-IMP-EXECUTION-RESPONSIBILITY-CONTRACT-FOUNDATION-001 / Task01 完了（2026-03-20）

---

## HealthPolicy 統一インターフェース（TASK-IMP-HEALTH-POLICY-UNIFICATION-001）

`packages/shared/src/types/health-policy.ts` に定義された接続状態判定の統一ポリシー。37ファイルに分散していた health check ロジックを集約する。

### HealthStatus

総合ヘルスステータスを表す4値型。

| 値 | 説明 |
| --- | --- |
| `"healthy"` | 接続正常 |
| `"degraded"` | 接続可能だが品質低下（レート制限・API key 劣化） |
| `"unhealthy"` | 接続不可（切断・エラー） |
| `"unknown"` | ヘルスチェック未実施 |

### HealthPolicy

統一ポリシーインターフェース。RuntimePolicyResolver（Main Process）と mainlineAccess（Renderer）が共通消費する。

| フィールド | 型 | 説明 |
| --- | --- | --- |
| isConnectionAvailable | boolean | 接続が利用可能か |
| isDegraded | boolean | 品質低下状態か |
| isRateLimited | boolean | レート制限中か |
| healthStatus | HealthStatus | 総合ステータス |
| lastCheckedAt | Date \| null | 最終チェック日時 |
| errorDetail | string \| undefined | エラー詳細（unhealthy 時） |

### HealthPolicyInput

resolveHealthPolicy() への入力。

| フィールド | 型 | 説明 |
| --- | --- | --- |
| connectionStatus | `"connected" \| "disconnected" \| "error"` | 接続状態 |
| isApiKeyValid | boolean | API key 有効性（将来拡張用、現在未使用） |
| apiKeyDegraded | boolean | API key 劣化状態 |
| isRateLimited | boolean | レート制限中か |
| lastHealthCheck | HealthCheckResult \| null | 最終ヘルスチェック結果 |

### resolveHealthPolicy()

HealthPolicyInput から HealthPolicy を導出する純粋関数。優先度順の5段階ルール:

| 優先度 | 条件 | 結果 | isConnectionAvailable | isDegraded |
| --- | --- | --- | --- | --- |
| 1 | lastHealthCheck === null | unknown | false | false |
| 2 | connectionStatus === "disconnected" \| "error" | unhealthy | false | false |
| 3 | isRateLimited === true | degraded | true | true |
| 4 | apiKeyDegraded === true | degraded | true | true |
| 5 | それ以外 | healthy | true | false |

**実装場所**: `packages/shared/src/types/health-policy.ts`
**re-export**: `packages/shared/src/types/index.ts` L193-199

### @deprecated 移行パス

`ExecutionCapabilityInput.apiKeyDegraded` は `@deprecated v0.8.0` マーク済み。移行先: `HealthPolicy.isDegraded`

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

