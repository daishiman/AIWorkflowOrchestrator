# ユーザー認証・プロフィール管理 - 機能要件定義書

## 概要

### 目的

ユーザープロフィールの管理とGoogle/GitHub OAuth連携を実装する。

### 背景

現在のUserProfileはデフォルト値のみで、永続化やOAuth連携機能がない。ユーザーが自分のプロフィールを管理し、外部サービスと連携できる機能が必要。

### スコープ

- ユーザープロフィールの編集・永続化
- Google OAuth連携
- GitHub OAuth連携
- アバター画像の管理

---

## 機能要件

### FR-UA-001: ユーザープロフィール管理

#### 説明

ユーザーの基本情報を管理・永続化する。

#### 受け入れ基準

- [ ] 表示名を編集できる
- [ ] メールアドレスを編集できる
- [ ] アバター画像を設定できる（ローカルファイル or URL）
- [ ] プロフィール情報は永続化される
- [ ] OAuth連携時にプロフィールが自動同期される（オプション）

#### データモデル

```typescript
interface UserProfile {
  id: string; // ユーザーID（UUID）
  displayName: string; // 表示名
  email: string; // メールアドレス
  avatarUrl: string | null; // アバターURL
  avatarLocal: string | null; // ローカルアバターパス
  plan: "free" | "pro" | "enterprise";
  createdAt: Date;
  updatedAt: Date;
}

interface UserAuth {
  isAuthenticated: boolean;
  providers: AuthProvider[]; // 連携済みプロバイダー
}

interface AuthProvider {
  type: "google" | "github";
  id: string; // プロバイダーユーザーID
  email: string;
  displayName: string;
  avatarUrl: string | null;
  accessToken: string; // 暗号化保存
  refreshToken?: string; // 暗号化保存
  expiresAt?: Date;
  connectedAt: Date;
}
```

---

### FR-UA-002: Google OAuth連携

#### 説明

Googleアカウントとの連携を実装する。

#### 受け入れ基準

- [ ] 「Googleでログイン」ボタンで認証フローを開始できる
- [ ] システムブラウザでGoogle認証画面が開く
- [ ] 認証成功後、アプリにリダイレクトされる
- [ ] Googleプロフィール情報（名前、メール、アバター）を取得できる
- [ ] 連携を解除できる
- [ ] リフレッシュトークンで自動更新される

#### OAuth設定

```typescript
const GOOGLE_OAUTH_CONFIG = {
  clientId: process.env.GOOGLE_CLIENT_ID,
  // clientSecretはデスクトップアプリでは使用しない（PKCE使用）
  redirectUri: "http://localhost:PORT/auth/google/callback",
  scopes: ["openid", "profile", "email"],
  authorizationEndpoint: "https://accounts.google.com/o/oauth2/v2/auth",
  tokenEndpoint: "https://oauth2.googleapis.com/token",
  userInfoEndpoint: "https://www.googleapis.com/oauth2/v3/userinfo",
};
```

---

### FR-UA-003: GitHub OAuth連携

#### 説明

GitHubアカウントとの連携を実装する。

#### 受け入れ基準

- [ ] 「GitHubでログイン」ボタンで認証フローを開始できる
- [ ] システムブラウザでGitHub認証画面が開く
- [ ] 認証成功後、アプリにリダイレクトされる
- [ ] GitHubプロフィール情報（名前、メール、アバター）を取得できる
- [ ] 連携を解除できる

#### OAuth設定

```typescript
const GITHUB_OAUTH_CONFIG = {
  clientId: process.env.GITHUB_CLIENT_ID,
  clientSecret: process.env.GITHUB_CLIENT_SECRET, // 暗号化保存
  redirectUri: "http://localhost:PORT/auth/github/callback",
  scopes: ["read:user", "user:email"],
  authorizationEndpoint: "https://github.com/login/oauth/authorize",
  tokenEndpoint: "https://github.com/login/oauth/access_token",
  userInfoEndpoint: "https://api.github.com/user",
};
```

---

### FR-UA-004: アバター管理

#### 説明

ユーザーアバター画像を管理する。

#### 受け入れ基準

- [ ] ローカルファイルからアバターをアップロードできる
- [ ] 画像は自動リサイズされる（128x128px）
- [ ] サポート形式: PNG, JPG, GIF, WebP
- [ ] OAuth連携プロバイダーのアバターを使用できる
- [ ] アバターを削除できる（デフォルトアイコンに戻る）

#### ファイル仕様

- 最大ファイルサイズ: 5MB
- 保存先: `userData/avatars/`
- ファイル名: `{userId}.{ext}`

---

### FR-UA-005: セッション管理

#### 説明

認証セッションを管理する。

#### 受け入れ基準

- [ ] アプリ起動時に前回のセッションが復元される
- [ ] OAuth連携解除時に関連トークンが削除される
- [ ] トークン期限切れ時に自動リフレッシュされる（Google）
- [ ] リフレッシュ失敗時に再認証を促す

---

## 非機能要件

### NFR-UA-001: セキュリティ

- OAuth認証はPKCE (Proof Key for Code Exchange) を使用
- アクセストークン・リフレッシュトークンはsafeStorageで暗号化保存
- 認証コードはワンタイム使用
- state パラメータでCSRF対策

### NFR-UA-002: プライバシー

- 最小限のスコープのみ要求
- ユーザーの明示的な同意なしにデータを送信しない
- 連携解除時にすべての関連データを削除

### NFR-UA-003: パフォーマンス

- OAuth認証フロー: 30秒以内（ユーザー操作時間除く）
- プロフィール保存: 100ms以内
- アバターリサイズ: 500ms以内

---

## UI/UX要件

### 設定画面レイアウト

```
┌─────────────────────────────────────────────────┐
│ アカウント設定                                   │
│ プロフィールと連携サービスを管理します           │
├─────────────────────────────────────────────────┤
│                                                  │
│ プロフィール                                     │
│ ┌─────┐                                          │
│ │ 👤  │  [画像を変更]                            │
│ └─────┘                                          │
│                                                  │
│ 表示名                                           │
│ ┌─────────────────────────────────────────────┐ │
│ │ ユーザー名                                  │ │
│ └─────────────────────────────────────────────┘ │
│                                                  │
│ メールアドレス                                   │
│ ┌─────────────────────────────────────────────┐ │
│ │ user@example.com                            │ │
│ └─────────────────────────────────────────────┘ │
│                                                  │
│ ─────────────────────────────────────────────── │
│                                                  │
│ 連携サービス                                     │
│                                                  │
│ Google                           [🔗 連携する]  │
│ Googleアカウントと連携してプロフィールを同期     │
│                                                  │
│ GitHub                           [🔗 連携する]  │
│ GitHubアカウントと連携                           │
│                                                  │
│ ─────────────────────────────────────────────── │
│                                                  │
│ 連携済みサービス                                 │
│                                                  │
│ 🟢 Google: user@gmail.com       [連携解除]      │
│    連携日: 2024/01/15                            │
│                                                  │
└─────────────────────────────────────────────────┘
```

### OAuth認証フロー（ユーザー視点）

1. 「連携する」ボタンをクリック
2. システムブラウザでGoogle/GitHub認証画面が開く
3. ユーザーが認証・許可
4. ブラウザが自動的に閉じる（またはアプリに戻るよう案内）
5. アプリに戻ると連携完了、プロフィールが更新されている

---

## IPCチャネル定義

```typescript
const USER_AUTH_CHANNELS = {
  // プロフィール操作
  PROFILE_GET: "user:profile:get",
  PROFILE_UPDATE: "user:profile:update",
  PROFILE_DELETE: "user:profile:delete",

  // アバター操作
  AVATAR_UPLOAD: "user:avatar:upload",
  AVATAR_DELETE: "user:avatar:delete",

  // OAuth操作
  OAUTH_START: "user:oauth:start", // 認証フロー開始
  OAUTH_CALLBACK: "user:oauth:callback", // コールバック処理
  OAUTH_DISCONNECT: "user:oauth:disconnect", // 連携解除
  OAUTH_REFRESH: "user:oauth:refresh", // トークンリフレッシュ

  // 認証状態
  AUTH_GET_STATE: "user:auth:getState",
} as const;

// リクエスト/レスポンス型
interface OAuthStartRequest {
  provider: "google" | "github";
}

interface OAuthStartResponse {
  success: boolean;
  authUrl?: string;
  error?: string;
}

interface ProfileUpdateRequest {
  displayName?: string;
  email?: string;
}
```

---

## ユースケース

### UC-UA-001: プロフィールを編集する

1. ユーザーが設定画面の「アカウント」セクションを開く
2. 表示名/メールアドレスを編集
3. 変更内容が自動保存される
4. 成功通知が表示される

### UC-UA-002: Googleアカウントと連携する

1. ユーザーが「Google: 連携する」ボタンをクリック
2. システムブラウザでGoogle認証画面が開く
3. ユーザーがGoogleアカウントを選択
4. 許可スコープを確認し「許可」をクリック
5. ブラウザが閉じる/アプリに戻る案内が表示される
6. アプリに戻ると連携完了
7. Googleのプロフィール情報が取得・表示される
8. 「連携済みサービス」にGoogleが追加される

### UC-UA-003: 連携を解除する

1. ユーザーが「連携解除」ボタンをクリック
2. 確認ダイアログ表示
3. 「解除」を選択
4. 連携が解除され、トークンが削除される
5. 「連携済みサービス」から削除される

### UC-UA-004: アバターを変更する

1. ユーザーが「画像を変更」ボタンをクリック
2. ファイル選択ダイアログが開く
3. 画像ファイルを選択
4. 画像がリサイズされて保存される
5. アバターが更新される

---

## セキュリティ考慮事項

### OAuth認証のセキュリティ

1. **PKCE (Proof Key for Code Exchange)**
   - デスクトップアプリではclient_secretを安全に保存できないためPKCEを使用
   - code_verifier: 暗号学的にランダムな文字列
   - code_challenge: code_verifierのSHA256ハッシュ

2. **State パラメータ**
   - CSRF対策として一意のstate値を生成
   - コールバック時に検証

3. **ローカルサーバー**
   - 認証コールバック用にローカルHTTPサーバーを一時起動
   - ランダムポートを使用
   - 認証完了後に即座にシャットダウン

### トークン管理

- アクセストークン: 短期（1時間程度）
- リフレッシュトークン: 長期、safeStorageで暗号化保存
- トークン期限切れ時: 自動リフレッシュ or 再認証促進

---

## 依存関係

### 既存コンポーネント

- `SettingsSlice` - 現在の設定状態管理（拡張が必要）
- `SettingsView` - 設定画面（アカウントセクション追加）
- `storeHandlers` - safeStorage操作

### 新規コンポーネント

- `UserProfile` - プロフィール編集（molecule）
- `OAuthButtons` - OAuth連携ボタン（molecule）
- `ConnectedServices` - 連携済みサービス一覧（molecule）
- `AvatarUploader` - アバターアップロード（molecule）
- `userSlice` - ユーザー状態管理（store slice）
- `authHandlers` - IPCハンドラー（main process）
- `oauthServer` - ローカル認証サーバー（main process）

### 外部依存

- Google OAuth 2.0 API
- GitHub OAuth API
- `electron` - shell.openExternal（システムブラウザ起動）
