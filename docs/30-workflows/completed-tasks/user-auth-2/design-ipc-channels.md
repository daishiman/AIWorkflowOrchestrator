# IPCチャネル設計書

## メタ情報

| 項目       | 内容       |
| ---------- | ---------- |
| タスクID   | T-01-2     |
| 参照元     | T-01-1     |
| 作成日     | 2025-12-09 |
| ステータス | 完了       |

---

## 1. 概要

### 1.1 目的

Main/Renderer間のIPC通信インターフェースを定義する。Electronのセキュリティモデルに従い、contextBridge経由の安全な通信を設計する。

### 1.2 設計方針

- **ホワイトリスト方式**: 許可されたチャネルのみ通信可能
- **型安全性**: すべてのリクエスト/レスポンスに型定義
- **最小権限**: Renderer processはトークンにアクセス不可

---

## 2. 認証チャネル（auth:\*）

### 2.1 チャネル定義

| チャネル名           | 方向            | 説明                         |
| -------------------- | --------------- | ---------------------------- |
| `auth:login`         | Renderer → Main | OAuthログイン開始            |
| `auth:logout`        | Renderer → Main | ログアウト                   |
| `auth:get-session`   | Renderer → Main | セッション取得               |
| `auth:refresh`       | Renderer → Main | トークンリフレッシュ         |
| `auth:check-online`  | Renderer → Main | オンライン状態確認           |
| `auth:state-changed` | Main → Renderer | 認証状態変更通知（イベント） |

### 2.2 リクエスト/レスポンス型

#### auth:login

```typescript
// Request
interface AuthLoginRequest {
  provider: OAuthProvider; // "google" | "github" | "discord"
}

// Response
interface AuthLoginResponse {
  success: boolean;
  error?: {
    code: string;
    message: string;
  };
}
```

#### auth:logout

```typescript
// Request: なし

// Response
interface AuthLogoutResponse {
  success: boolean;
  error?: {
    code: string;
    message: string;
  };
}
```

#### auth:get-session

```typescript
// Request: なし

// Response
interface AuthGetSessionResponse {
  success: boolean;
  data?: AuthSession | null;
  error?: {
    code: string;
    message: string;
  };
}
```

#### auth:refresh

```typescript
// Request: なし

// Response
interface AuthRefreshResponse {
  success: boolean;
  data?: AuthSession;
  error?: {
    code: string;
    message: string;
  };
}
```

#### auth:check-online

```typescript
// Request: なし

// Response
interface AuthCheckOnlineResponse {
  success: boolean;
  data?: {
    online: boolean;
  };
  error?: {
    code: string;
    message: string;
  };
}
```

#### auth:state-changed (イベント)

```typescript
// Event payload
interface AuthState {
  authenticated: boolean;
  user?: AuthUser;
  error?: string;
  isOffline?: boolean;
}
```

---

## 3. プロフィールチャネル（profile:\*）

### 3.1 チャネル定義

| チャネル名              | 方向            | 説明                     |
| ----------------------- | --------------- | ------------------------ |
| `profile:get`           | Renderer → Main | プロフィール取得         |
| `profile:update`        | Renderer → Main | プロフィール更新         |
| `profile:get-providers` | Renderer → Main | 連携プロバイダー一覧取得 |
| `profile:link-provider` | Renderer → Main | プロバイダー連携         |

### 3.2 リクエスト/レスポンス型

#### profile:get

```typescript
// Request: なし

// Response
interface ProfileGetResponse {
  success: boolean;
  data?: UserProfile;
  error?: {
    code: string;
    message: string;
  };
}
```

#### profile:update

```typescript
// Request
interface ProfileUpdateRequest {
  updates: {
    displayName?: string;
    avatarUrl?: string | null;
  };
}

// Response
interface ProfileUpdateResponse {
  success: boolean;
  data?: UserProfile;
  error?: {
    code: string;
    message: string;
  };
}
```

#### profile:get-providers

```typescript
// Request: なし

// Response
interface ProfileGetProvidersResponse {
  success: boolean;
  data?: LinkedProvider[];
  error?: {
    code: string;
    message: string;
  };
}
```

#### profile:link-provider

```typescript
// Request
interface ProfileLinkProviderRequest {
  provider: OAuthProvider;
}

// Response
interface ProfileLinkProviderResponse {
  success: boolean;
  data?: LinkedProvider;
  error?: {
    code: string;
    message: string;
  };
}
```

---

## 4. アバターチャネル（avatar:\*）

### 4.1 チャネル定義

| チャネル名            | 方向            | 説明                     |
| --------------------- | --------------- | ------------------------ |
| `avatar:upload`       | Renderer → Main | アバター画像アップロード |
| `avatar:use-provider` | Renderer → Main | プロバイダーアバター使用 |
| `avatar:remove`       | Renderer → Main | アバター削除             |

### 4.2 リクエスト/レスポンス型

#### avatar:upload

```typescript
// Request
interface AvatarUploadRequest {
  // ファイル選択ダイアログを開く
  // Main processでファイル処理
}

// Response
interface AvatarUploadResponse {
  success: boolean;
  data?: {
    avatarUrl: string; // ローカルファイルパス
  };
  error?: {
    code: string;
    message: string;
  };
}
```

#### avatar:use-provider

```typescript
// Request
interface AvatarUseProviderRequest {
  provider: OAuthProvider;
}

// Response
interface AvatarUseProviderResponse {
  success: boolean;
  data?: {
    avatarUrl: string;
  };
  error?: {
    code: string;
    message: string;
  };
}
```

#### avatar:remove

```typescript
// Request: なし

// Response
interface AvatarRemoveResponse {
  success: boolean;
  error?: {
    code: string;
    message: string;
  };
}
```

---

## 5. セキュリティ設計

### 5.1 ホワイトリスト

```typescript
// invoke可能なチャネル
export const ALLOWED_INVOKE_CHANNELS = [
  // Auth
  "auth:login",
  "auth:logout",
  "auth:get-session",
  "auth:refresh",
  "auth:check-online",
  // Profile
  "profile:get",
  "profile:update",
  "profile:get-providers",
  "profile:link-provider",
  // Avatar
  "avatar:upload",
  "avatar:use-provider",
  "avatar:remove",
];

// on可能なチャネル（イベント受信）
export const ALLOWED_ON_CHANNELS = ["auth:state-changed"];
```

### 5.2 バリデーション

- すべてのリクエストはMain processでバリデーション
- 不正なプロバイダー名は`auth/invalid-provider`エラー
- 不正な表示名は`profile/validation-failed`エラー

---

## 6. エラーレスポンス形式

```typescript
interface IPCError {
  code: string; // エラーコード（例: "auth/login-failed"）
  message: string; // ユーザー向けメッセージ
  details?: Record<string, unknown>; // デバッグ情報（開発時のみ）
}

interface IPCResponse<T> {
  success: boolean;
  data?: T;
  error?: IPCError;
}
```

---

## 7. 実装ファイル

| 成果物            | パス                                           |
| ----------------- | ---------------------------------------------- |
| チャネル定義      | `apps/desktop/src/preload/channels.ts`         |
| 型定義            | `apps/desktop/src/preload/types.ts`            |
| Preloadスクリプト | `apps/desktop/src/preload/index.ts`            |
| Authハンドラー    | `apps/desktop/src/main/ipc/authHandlers.ts`    |
| Profileハンドラー | `apps/desktop/src/main/ipc/profileHandlers.ts` |

---

## 8. 完了条件

- [x] IPCチャネル名が定義されている（auth:_, profile:_, avatar:\*）
- [x] リクエスト/レスポンス型が定義されている
- [x] エラーレスポンス形式が定義されている
- [x] ホワイトリストが設定されている
- [x] contextBridge経由でAPIが公開されている
