# Desktop IPC API（認証・プロフィール）

> 本ドキュメントは統合システム設計仕様書の一部です。
> 管理: .claude/skills/aiworkflow-requirements/
>
> **親ドキュメント**: [api-endpoints.md](./api-endpoints.md)

---

## 認証 IPC チャネル

Electron Desktop アプリでは、IPC 通信で認証機能を提供する。

**実装ファイル**:

- ハンドラー: `apps/desktop/src/main/ipc/authHandlers.ts`
- チャンネル定義: `apps/desktop/src/preload/channels.ts`
- Preload公開: `apps/desktop/src/preload/index.ts`

### チャンネル一覧

| チャネル            | 用途                 | Request                       | Response                           | 実装箇所            | セキュリティ       |
| ------------------- | -------------------- | ----------------------------- | ---------------------------------- | ------------------- | ------------------ |
| `auth:login`        | OAuth ログイン開始   | `{ provider: OAuthProvider }` | `IPCResponse<void>`                | authHandlers.ts:77  | withValidation適用 |
| `auth:logout`       | ログアウト           | なし                          | `IPCResponse<void>`                | authHandlers.ts:145 | withValidation適用 |
| `auth:get-session`  | セッション取得       | なし                          | `IPCResponse<AuthSession>`         | authHandlers.ts:187 | withValidation適用 |
| `auth:refresh`      | トークンリフレッシュ | なし                          | `IPCResponse<AuthSession>`         | authHandlers.ts     | withValidation適用 |
| `auth:check-online` | オンライン状態確認   | なし                          | `IPCResponse<{ online: boolean }>` | authHandlers.ts     | withValidation適用 |

---

## プロフィール IPC チャネル

| チャネル                | 用途                 | Request                            | Response                        |
| ----------------------- | -------------------- | ---------------------------------- | ------------------------------- |
| `profile:get`           | プロフィール取得     | なし                               | `IPCResponse<UserProfile>`      |
| `profile:update`        | プロフィール更新     | `{ updates: ProfileUpdateFields }` | `IPCResponse<UserProfile>`      |
| `profile:get-providers` | 連携プロバイダー一覧 | なし                               | `IPCResponse<LinkedProvider[]>` |
| `profile:link-provider` | 新規プロバイダー連携 | `{ provider: OAuthProvider }`      | `IPCResponse<LinkedProvider>`   |

---

## イベントチャネル（Main → Renderer）

| チャネル             | 用途             | Payload                                                                                   |
| -------------------- | ---------------- | ----------------------------------------------------------------------------------------- |
| `auth:state-changed` | 認証状態変更通知 | `{ authenticated: boolean; tokens?: AuthTokens; error?: string; errorCode?: string }` |

**Payload詳細（TASK-FIX-GOOGLE-LOGIN-001で拡張）**:

| フィールド    | 型                  | 説明                                         |
| ------------- | ------------------- | -------------------------------------------- |
| authenticated | boolean             | 認証状態                                     |
| tokens        | AuthTokens \| undefined | 認証トークン情報                           |
| error         | string \| undefined | エラーメッセージ（日本語）                   |
| errorCode     | string \| undefined | エラーコード（AUTH_ERROR_CODES値）           |

---

## 型定義

### OAuthProvider

対応するOAuth認証プロバイダーの列挙型。許可値は「google」「github」「discord」の3種類。

### AuthSession

認証セッション情報を表すインターフェース。

| フィールド            | 型                   | 説明                                     |
| --------------------- | -------------------- | ---------------------------------------- |
| user                  | AuthUser             | 認証済みユーザー情報                     |
| accessToken           | string               | アクセストークン                         |
| refreshToken          | string               | リフレッシュトークン                     |
| expiresAt             | number               | トークン有効期限（UNIXタイムスタンプ）   |
| isOffline             | boolean              | オフラインモードフラグ                   |
| refreshTokenExpiresAt | number \| undefined  | リフレッシュトークン有効期限（7日後）    |

### UserProfile

ユーザープロフィール情報を表すインターフェース。

| フィールド  | 型                             | 説明                     |
| ----------- | ------------------------------ | ------------------------ |
| id          | string                         | ユーザー一意識別子       |
| displayName | string                         | 表示名                   |
| email       | string                         | メールアドレス           |
| avatarUrl   | string または null             | アバター画像URL          |
| plan        | "free" / "pro" / "enterprise"  | 契約プラン               |
| createdAt   | string                         | アカウント作成日時       |
| updatedAt   | string                         | 最終更新日時             |

### LinkedProvider

連携済みプロバイダー情報を表すインターフェース。

| フィールド  | 型                 | 説明                       |
| ----------- | ------------------ | -------------------------- |
| provider    | OAuthProvider      | プロバイダー種別           |
| providerId  | string             | プロバイダー側のユーザーID |
| email       | string または null | プロバイダーのメール       |
| displayName | string または null | プロバイダーの表示名       |
| avatarUrl   | string または null | プロバイダーのアバターURL  |
| linkedAt    | string             | 連携日時                   |

### IPCResponse

IPC通信の共通レスポンス型。ジェネリクス型Tでデータ型を指定。

| フィールド | 型                                  | 説明                     |
| ---------- | ----------------------------------- | ------------------------ |
| success    | boolean                             | 処理成功フラグ           |
| data       | T（オプション）                     | 成功時のレスポンスデータ |
| error      | { code: string; message: string }（オプション） | エラー情報   |

---

## 認証状態管理

### 状態遷移

| 遷移元          | 遷移先          | トリガー条件     |
| --------------- | --------------- | ---------------- |
| checking        | authenticated   | セッション復元成功 |
| checking        | unauthenticated | セッションなし     |
| unauthenticated | authenticated   | ログイン成功       |
| authenticated   | unauthenticated | ログアウト         |

### 状態とUI表示の対応

| 状態            | AuthGuard表示内容 | 説明                   |
| --------------- | ----------------- | ---------------------- |
| checking        | LoadingScreen     | セッション確認中       |
| authenticated   | children          | 認証済み（メインUI）   |
| unauthenticated | AuthView          | 未認証（ログイン画面） |

### 実装コンポーネント

| コンポーネント | ファイル                                     | 責務                   |
| -------------- | -------------------------------------------- | ---------------------- |
| AuthGuard      | `components/AuthGuard/index.tsx`             | 認証状態による表示制御 |
| useAuthState   | `components/AuthGuard/hooks/useAuthState.ts` | 認証状態取得フック     |
| getAuthState   | `components/AuthGuard/utils/getAuthState.ts` | 状態判定純粋関数       |
| LoadingScreen  | `components/AuthGuard/LoadingScreen.tsx`     | ローディング画面       |
| AuthView       | `views/AuthView/index.tsx`                   | ログイン画面           |

---

## IPCセキュリティ実装

### withValidationラッパー

すべての認証関連IPCハンドラーは`withValidation`でラップされ、以下を検証:

1. webContentsに対応するBrowserWindowの存在確認
2. DevToolsからの呼び出し検出・拒否
3. 許可されたウィンドウリストとの照合

**実装ファイル**: `apps/desktop/src/main/infrastructure/security/ipc-validator.ts`

### チャンネルホワイトリスト

認証関連チャンネルは`apps/desktop/src/preload/channels.ts`で明示的に許可リストに登録される。

**許可リスト構成（ALLOWED_CHANNELS）**:

| 種別   | 用途                     | 登録チャンネル                                                                 |
| ------ | ------------------------ | ------------------------------------------------------------------------------ |
| invoke | Renderer→Main 呼び出し用 | auth:login, auth:logout, auth:get-session, auth:refresh, auth:check-online 等 |
| on     | Main→Renderer イベント用 | auth:state-changed 等                                                          |

このホワイトリストに登録されていないチャンネルへのアクセスはPreloadスクリプトでブロックされる。

---

## 関連ドキュメント

- [APIエンドポイント概要](./api-endpoints.md)
- [Agent Dashboard IPC](./api-ipc-agent.md)
- [システムIPC・プロバイダーAPI](./api-ipc-system.md)

---

## 変更履歴

| バージョン | 日付       | 変更内容                                                                |
| ---------- | ---------- | ----------------------------------------------------------------------- |
| v1.2.0     | 2026-02-05 | TASK-FIX-GOOGLE-LOGIN-001: AuthSessionにrefreshTokenExpiresAt追加、auth:state-changedにerror/errorCode追加 |
| v1.1.0     | 2026-01-26 | spec-guidelines.md準拠: コードブロックを表形式・文章に変換              |
| v1.0.0     | -          | 初版作成                                                                |
