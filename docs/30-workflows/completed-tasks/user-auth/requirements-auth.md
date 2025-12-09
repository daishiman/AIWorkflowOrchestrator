# Supabase認証要件定義書

## 1. 概要

### 1.1 目的

Electronデスクトップアプリにおいて、Supabaseを使用したOAuth認証システムを実装し、ユーザーの識別とセキュアなセッション管理を実現する。

### 1.2 スコープ

- OAuth 2.0認証（Google, GitHub, Discord）
- Electron + Supabase統合（カスタムプロトコル）
- セッション管理とトークン永続化
- オフライン時の認証状態維持

### 1.3 スコープ外

- 管理者機能（不要と確認済み）
- Discord Bot連携（後で検討）
- パスワード認証（OAuthのみ）

---

## 2. 対応OAuthプロバイダー

### 2.1 プロバイダー一覧

| プロバイダー | 優先度 | 用途             | スコープ                  |
| ------------ | ------ | ---------------- | ------------------------- |
| **Google**   | 高     | 一般ユーザー向け | `email`, `profile`        |
| **GitHub**   | 高     | 開発者向け       | `read:user`, `user:email` |
| **Discord**  | 中     | コミュニティ連携 | `identify`, `email`       |

### 2.2 プロバイダー別設定要件

#### Google OAuth

```
Client ID: 環境変数 GOOGLE_CLIENT_ID
Client Secret: 環境変数 GOOGLE_CLIENT_SECRET
Redirect URI: aiworkflow://auth/callback
Scopes: openid, email, profile
```

#### GitHub OAuth

```
Client ID: 環境変数 GITHUB_CLIENT_ID
Client Secret: 環境変数 GITHUB_CLIENT_SECRET
Redirect URI: aiworkflow://auth/callback
Scopes: read:user, user:email
```

#### Discord OAuth

```
Client ID: 環境変数 DISCORD_CLIENT_ID
Client Secret: 環境変数 DISCORD_CLIENT_SECRET
Redirect URI: aiworkflow://auth/callback
Scopes: identify, email
```

### 2.3 取得するユーザー情報

| フィールド  | 必須 | Google  | GitHub     | Discord  |
| ----------- | ---- | ------- | ---------- | -------- |
| id          | Yes  | sub     | id         | id       |
| email       | Yes  | email   | email      | email    |
| displayName | No   | name    | name/login | username |
| avatarUrl   | No   | picture | avatar_url | avatar   |

---

## 3. 認証フロー

### 3.1 カスタムプロトコル認証フロー

Electronアプリでは、システムブラウザを使用したOAuthフローを採用する。

```
┌─────────────────┐     ┌──────────────┐     ┌─────────────┐
│  Electron App   │     │ System       │     │  Supabase   │
│  (Main Process) │     │ Browser      │     │  Auth       │
└────────┬────────┘     └──────┬───────┘     └──────┬──────┘
         │                     │                     │
         │ 1. Login button     │                     │
         │    clicked          │                     │
         │ ─────────────────── │                     │
         │                     │                     │
         │ 2. Open external    │                     │
         │    browser          │                     │
         │ ────────────────────►                     │
         │                     │                     │
         │                     │ 3. Redirect to      │
         │                     │    Supabase OAuth   │
         │                     │ ────────────────────►
         │                     │                     │
         │                     │ 4. User authenticates
         │                     │    with provider    │
         │                     │ ◄────────────────────
         │                     │                     │
         │                     │ 5. Supabase returns │
         │                     │    tokens via       │
         │                     │    redirect URL     │
         │                     │ ◄────────────────────
         │                     │                     │
         │ 6. Custom protocol  │                     │
         │    callback         │                     │
         │ ◄────────────────────                     │
         │    aiworkflow://    │                     │
         │    auth/callback    │                     │
         │                     │                     │
         │ 7. Extract tokens   │                     │
         │    and store        │                     │
         │ ─────────────────── │                     │
         │                     │                     │
```

### 3.2 フロー詳細

#### Step 1-2: 認証開始

```typescript
// Renderer Process
const handleLogin = async (provider: "google" | "github" | "discord") => {
  await window.electronAPI.auth.login(provider);
};

// Main Process
ipcMain.handle("auth:login", async (_, provider) => {
  const authUrl = getSupabaseOAuthUrl(provider);
  await shell.openExternal(authUrl);
});
```

#### Step 3-5: OAuth認証

Supabaseが各プロバイダーとの認証を仲介し、成功時にカスタムプロトコルURLにリダイレクト。

#### Step 6-7: コールバック処理

```typescript
// Main Process - カスタムプロトコル登録
app.setAsDefaultProtocolClient("aiworkflow");

// コールバック処理
app.on("open-url", async (event, url) => {
  event.preventDefault();
  if (url.startsWith("aiworkflow://auth/callback")) {
    const tokens = parseAuthCallback(url);
    await storeTokensSecurely(tokens);
    mainWindow.webContents.send("auth:state-changed", { authenticated: true });
  }
});
```

### 3.3 プラットフォーム別考慮事項

| プラットフォーム | カスタムプロトコル登録             | 注意点                          |
| ---------------- | ---------------------------------- | ------------------------------- |
| **macOS**        | `app.setAsDefaultProtocolClient()` | Info.plistにURL Schemes追加必要 |
| **Windows**      | `app.setAsDefaultProtocolClient()` | レジストリに自動登録            |
| **Linux**        | `app.setAsDefaultProtocolClient()` | .desktopファイル設定必要        |

---

## 4. セッション管理

### 4.1 トークン構成

| トークン          | 有効期限 | 用途                   | 保存場所           |
| ----------------- | -------- | ---------------------- | ------------------ |
| **Access Token**  | 1時間    | API認証                | メモリ（Renderer） |
| **Refresh Token** | 30日     | トークン更新           | SafeStorage        |
| **Session Info**  | -        | ユーザー情報キャッシュ | electron-store     |

### 4.2 トークンライフサイクル

```
┌─────────────────────────────────────────────────────────────┐
│                    Token Lifecycle                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────┐    ┌──────────────┐    ┌────────────────┐     │
│  │  Login  │───►│ Access Token │───►│ API Requests   │     │
│  └─────────┘    │ (memory)     │    └────────┬───────┘     │
│                 └──────┬───────┘             │              │
│                        │                     │              │
│                        │ expires             │ 401 error    │
│                        ▼                     ▼              │
│                 ┌──────────────┐    ┌────────────────┐     │
│                 │Refresh Token │───►│ Auto Refresh   │     │
│                 │(SafeStorage) │    └────────────────┘     │
│                 └──────────────┘                            │
│                        │                                    │
│                        │ expires                            │
│                        ▼                                    │
│                 ┌──────────────┐                            │
│                 │  Re-login    │                            │
│                 │  Required    │                            │
│                 └──────────────┘                            │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 4.3 セッション復元

アプリ起動時のセッション復元フロー：

```typescript
// アプリ起動時
async function restoreSession(): Promise<AuthState> {
  // 1. SafeStorageからRefresh Tokenを取得
  const refreshToken = await getSecureValue("refresh_token");

  if (!refreshToken) {
    return { authenticated: false };
  }

  try {
    // 2. Refresh Tokenを使用して新しいセッションを取得
    const { data, error } = await supabase.auth.setSession({
      access_token: "", // 不要
      refresh_token: refreshToken,
    });

    if (error) throw error;

    // 3. 新しいトークンを保存
    await storeTokensSecurely(data.session);

    return {
      authenticated: true,
      user: data.user,
    };
  } catch (error) {
    // 4. 失敗時はログアウト状態
    await clearTokens();
    return { authenticated: false };
  }
}
```

---

## 5. トークン永続化（SafeStorage）

### 5.1 保存データ

| キー                     | 値               | 暗号化              |
| ------------------------ | ---------------- | ------------------- |
| `supabase_refresh_token` | Refresh Token    | Yes (SafeStorage)   |
| `supabase_user_id`       | ユーザーID       | No (electron-store) |
| `supabase_provider`      | 認証プロバイダー | No (electron-store) |

### 5.2 SafeStorage実装

```typescript
// Main Process
import { safeStorage } from "electron";
import Store from "electron-store";

const secureStore = new Store({ name: "auth-secure" });

export async function storeRefreshToken(token: string): Promise<void> {
  if (safeStorage.isEncryptionAvailable()) {
    const encrypted = safeStorage.encryptString(token);
    secureStore.set("refresh_token", encrypted.toString("base64"));
  } else {
    // フォールバック（推奨しない）
    console.warn("SafeStorage not available, using fallback");
    secureStore.set("refresh_token_fallback", token);
  }
}

export async function getRefreshToken(): Promise<string | null> {
  const encrypted = secureStore.get("refresh_token") as string | undefined;

  if (!encrypted) return null;

  if (safeStorage.isEncryptionAvailable()) {
    const buffer = Buffer.from(encrypted, "base64");
    return safeStorage.decryptString(buffer);
  }

  return secureStore.get("refresh_token_fallback") as string | null;
}

export async function clearTokens(): Promise<void> {
  secureStore.delete("refresh_token");
  secureStore.delete("refresh_token_fallback");
}
```

### 5.3 セキュリティ考慮事項

- Access Tokenはメモリのみに保持（永続化しない）
- Refresh Tokenは必ずSafeStorageで暗号化
- SafeStorageが利用できない環境ではユーザーに警告
- ログアウト時は全トークンを確実に削除

---

## 6. オフライン対応

### 6.1 オフライン時の動作

| 状態                              | 動作                                     | UI表示                           |
| --------------------------------- | ---------------------------------------- | -------------------------------- |
| **認証済み + オフライン**         | ローカルキャッシュで動作継続             | 「オフラインモード」表示         |
| **未認証 + オフライン**           | 認証不可、ゲストモード                   | 「ログインにはネット接続が必要」 |
| **トークン期限切れ + オフライン** | キャッシュで動作、オンライン復帰時に更新 | 「オフラインモード」表示         |

### 6.2 オフライン検出

```typescript
// Renderer Process
const [isOnline, setIsOnline] = useState(navigator.onLine);

useEffect(() => {
  const handleOnline = () => setIsOnline(true);
  const handleOffline = () => setIsOnline(false);

  window.addEventListener("online", handleOnline);
  window.addEventListener("offline", handleOffline);

  return () => {
    window.removeEventListener("online", handleOnline);
    window.removeEventListener("offline", handleOffline);
  };
}, []);
```

### 6.3 オンライン復帰時の処理

```typescript
// オンライン復帰時
async function onNetworkRestore() {
  const currentSession = await supabase.auth.getSession();

  if (currentSession.data.session) {
    // セッションが有効な場合は何もしない
    return;
  }

  // Refresh Tokenで再認証を試行
  const refreshToken = await getRefreshToken();
  if (refreshToken) {
    await supabase.auth.refreshSession({ refresh_token: refreshToken });
  }
}
```

---

## 7. エラーハンドリング

### 7.1 エラー分類

| エラーコード               | 説明               | ユーザーへの表示           | 対処               |
| -------------------------- | ------------------ | -------------------------- | ------------------ |
| `auth/invalid-credentials` | 認証情報が無効     | 「認証に失敗しました」     | 再ログイン促進     |
| `auth/token-expired`       | トークン期限切れ   | 表示なし（自動更新）       | Refresh Token使用  |
| `auth/refresh-failed`      | 更新失敗           | 「再ログインが必要です」   | 再ログイン促進     |
| `auth/network-error`       | ネットワークエラー | 「ネットワーク接続を確認」 | オフラインモード   |
| `auth/provider-error`      | プロバイダーエラー | 「認証サービスに問題」     | 別プロバイダー提案 |

### 7.2 エラーハンドリング実装

```typescript
// 認証エラーハンドラー
async function handleAuthError(error: AuthError): Promise<void> {
  switch (error.code) {
    case "auth/token-expired":
      // 自動更新を試行
      await attemptTokenRefresh();
      break;

    case "auth/refresh-failed":
    case "auth/invalid-credentials":
      // 再ログインが必要
      await clearTokens();
      notifyUser("再ログインが必要です");
      break;

    case "auth/network-error":
      // オフラインモードに移行
      setOfflineMode(true);
      break;

    default:
      console.error("Unknown auth error:", error);
      notifyUser("認証エラーが発生しました");
  }
}
```

---

## 8. UI仕様

### 8.1 認証ボタン

未認証状態では、OAuthプロバイダーへの認証ボタンを表示する。

| 要素       | 表示テキスト                                   | 説明                         |
| ---------- | ---------------------------------------------- | ---------------------------- |
| **ボタン** | 「〇〇で続ける」                               | 新規登録・ログイン両方に対応 |
| **見出し** | 「アカウント登録・ログイン」                   | 目的を明確に表示             |
| **説明文** | 「アカウントを連携してデータを同期しましょう」 | 連携のメリットを説明         |

例:

- 「Googleで続ける」
- 「GitHubで続ける」
- 「Discordで続ける」

### 8.2 認証成功メッセージ

認証完了後、新規登録かログインかを判定してメッセージを表示する。

| 状態         | 判定条件                                     | 表示メッセージ                   | 表示色 |
| ------------ | -------------------------------------------- | -------------------------------- | ------ |
| **新規登録** | created_at と last_sign_in_at の差が30秒以内 | 「アカウント登録が完了しました」 | 緑色   |
| **ログイン** | created_at と last_sign_in_at の差が30秒超   | 「ログインしました」             | 青色   |

メッセージは5秒後に自動的に非表示になる。

### 8.3 連携済みプロバイダー表示

認証済み状態では、連携サービス一覧を表示する。

| 状態       | 表示                                                 | スタイル                   |
| ---------- | ---------------------------------------------------- | -------------------------- |
| **登録済** | プロバイダー名 + メールアドレス + 「登録済み」バッジ | 緑の枠線、チェックアイコン |
| **未連携** | プロバイダー名 + 「連携する」ボタン                  | デフォルトスタイル         |

---

## 9. 受け入れ基準

### 9.1 機能要件

- [ ] Google OAuth でログインできる
- [ ] GitHub OAuth でログインできる
- [ ] Discord OAuth でログインできる
- [ ] ログアウトできる
- [ ] アプリ再起動後もセッションが維持される
- [ ] トークン期限切れ時に自動更新される
- [ ] オフライン時も認証状態が維持される

### 9.2 非機能要件

- [ ] ログイン処理は30秒以内に完了する
- [ ] トークンはSafeStorageで暗号化保存される
- [ ] エラー時に適切なメッセージが表示される
- [ ] macOS, Windows, Linuxで動作する

### 9.3 セキュリティ要件

- [ ] Access TokenはRendererのメモリのみに保持
- [ ] Refresh TokenはSafeStorageで暗号化
- [ ] ログアウト時に全トークンが削除される
- [ ] カスタムプロトコルのコールバックが検証される

---

## 10. 環境変数

### 10.1 必要な環境変数

```bash
# Supabase
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Google OAuth（Supabaseで設定）
GOOGLE_CLIENT_ID=xxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=xxx

# GitHub OAuth（Supabaseで設定）
GITHUB_CLIENT_ID=xxx
GITHUB_CLIENT_SECRET=xxx

# Discord OAuth（Supabaseで設定）
DISCORD_CLIENT_ID=xxx
DISCORD_CLIENT_SECRET=xxx
```

### 10.2 Supabaseダッシュボード設定

1. Authentication > Providers で各プロバイダーを有効化
2. 各プロバイダーのClient ID/Secretを設定
3. Authentication > URL Configuration で Redirect URL を設定:
   - Site URL: `aiworkflow://`
   - Redirect URLs: `aiworkflow://auth/callback`

---

## 11. 参考資料

- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [Supabase + Electron Guide](https://bootstrapped.app/guide/how-to-use-supabase-with-electron-for-desktop-apps)
- [Electron Custom Protocol](https://www.electronjs.org/docs/latest/api/app#appsetasdefaultprotocolclientprotocol-path-args)
- [Electron SafeStorage API](https://www.electronjs.org/docs/latest/api/safe-storage)
