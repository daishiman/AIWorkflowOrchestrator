# 認証アーキテクチャ設計書

## 1. 概要

### 1.1 目的

Electron + Supabase + Turso を統合した認証・データ管理アーキテクチャを設計する。

### 1.2 設計原則

- **Clean Architecture**: レイヤー間の依存関係を制御
- **Security First**: Electronセキュリティベストプラクティス準拠
- **Offline First**: オフライン時も動作継続可能
- **Single Source of Truth**: 各データの正規の保存先を明確化

---

## 2. 全体アーキテクチャ

### 2.1 システム構成図

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           AIWorkflowOrchestrator                         │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌────────────────────────────────────────────────────────────────────┐ │
│  │                      Electron Application                          │ │
│  │                                                                    │ │
│  │  ┌─────────────────┐    IPC    ┌─────────────────────────────────┐│ │
│  │  │  Renderer       │◄─────────►│       Main Process              ││ │
│  │  │  Process        │           │                                 ││ │
│  │  │                 │           │  ┌─────────────────────────────┐││ │
│  │  │  ┌───────────┐  │           │  │    Auth Handlers            │││ │
│  │  │  │  React    │  │           │  │    - OAuth Flow             │││ │
│  │  │  │  + Zustand│  │           │  │    - Token Management       │││ │
│  │  │  └───────────┘  │           │  │    - Session Restore        │││ │
│  │  │                 │           │  └─────────────────────────────┘││ │
│  │  │  ┌───────────┐  │           │                                 ││ │
│  │  │  │ authSlice │  │           │  ┌─────────────────────────────┐││ │
│  │  │  │ (State)   │  │           │  │    Storage Services         │││ │
│  │  │  └───────────┘  │           │  │    - SafeStorage (tokens)   │││ │
│  │  │                 │           │  │    - electron-store (cache) │││ │
│  │  └─────────────────┘           │  └─────────────────────────────┘││ │
│  │                                │                                 ││ │
│  │                                │  ┌─────────────────────────────┐││ │
│  │                                │  │    DB Client (Turso)        │││ │
│  │                                │  │    - Embedded Replicas      │││ │
│  │                                │  │    - Local SQLite           │││ │
│  │                                │  └─────────────────────────────┘││ │
│  │                                └─────────────────────────────────┘│ │
│  └────────────────────────────────────────────────────────────────────┘ │
│                                      │                                   │
│                                      │ HTTPS                             │
│                                      ▼                                   │
│  ┌────────────────────────────────────────────────────────────────────┐ │
│  │                        External Services                           │ │
│  │                                                                    │ │
│  │  ┌──────────────┐   ┌──────────────┐   ┌──────────────┐           │ │
│  │  │   Supabase   │   │    Turso     │   │    OAuth     │           │ │
│  │  │              │   │              │   │   Providers  │           │ │
│  │  │  - Auth      │   │  - Business  │   │              │           │ │
│  │  │  - Profile   │   │    Data      │   │  - Google    │           │ │
│  │  │  - Storage   │   │  - Workflows │   │  - GitHub    │           │ │
│  │  │              │   │  - Logs      │   │  - Discord   │           │ │
│  │  └──────────────┘   └──────────────┘   └──────────────┘           │ │
│  └────────────────────────────────────────────────────────────────────┘ │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### 2.2 レイヤー構成

```
┌─────────────────────────────────────────────────────────────────────┐
│                         Presentation Layer                          │
│  (apps/desktop/src/renderer/)                                       │
│  - React Components (views/, components/)                           │
│  - Zustand Store (store/slices/)                                    │
│  - Custom Hooks (hooks/)                                            │
└───────────────────────────────────┬─────────────────────────────────┘
                                    │ IPC (Preload Bridge)
┌───────────────────────────────────▼─────────────────────────────────┐
│                         Application Layer                           │
│  (apps/desktop/src/main/ipc/)                                       │
│  - Auth Handlers (authHandlers.ts)                                  │
│  - Profile Handlers (profileHandlers.ts)                            │
│  - Store Handlers (storeHandlers.ts)                                │
└───────────────────────────────────┬─────────────────────────────────┘
                                    │
┌───────────────────────────────────▼─────────────────────────────────┐
│                         Infrastructure Layer                        │
│  (packages/shared/infrastructure/)                                  │
│  - Supabase Client (auth/supabase-client.ts)                        │
│  - Turso Client (database/client.ts)                                │
│  - Storage Services (storage/)                                      │
└───────────────────────────────────┬─────────────────────────────────┘
                                    │
┌───────────────────────────────────▼─────────────────────────────────┐
│                           Core Layer                                │
│  (packages/shared/core/)                                            │
│  - Entities (entities/user.ts)                                      │
│  - Interfaces (interfaces/auth.ts)                                  │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 3. プロセスモデル

### 3.1 Electron プロセス責務分離

| プロセス             | 責務                                         | セキュリティ設定                      |
| -------------------- | -------------------------------------------- | ------------------------------------- |
| **Main Process**     | OAuth処理、トークン管理、DB操作、ファイルI/O | Full Node.js API                      |
| **Preload Script**   | IPC Bridge、API公開                          | contextIsolation: true                |
| **Renderer Process** | UI表示、状態管理                             | nodeIntegration: false, sandbox: true |

### 3.2 Main Process 設計

```typescript
// apps/desktop/src/main/index.ts
import { app, BrowserWindow, ipcMain } from "electron";
import { registerAuthHandlers } from "./ipc/authHandlers";
import { registerProfileHandlers } from "./ipc/profileHandlers";
import { initializeSupabase } from "./services/supabase";
import { initializeTurso } from "./services/turso";

async function createWindow() {
  const mainWindow = new BrowserWindow({
    webPreferences: {
      preload: path.join(__dirname, "../preload/index.js"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });

  // カスタムプロトコル登録
  app.setAsDefaultProtocolClient("aiworkflow");

  return mainWindow;
}

async function bootstrap() {
  // サービス初期化
  await initializeSupabase();
  await initializeTurso();

  // IPC ハンドラー登録
  registerAuthHandlers(ipcMain);
  registerProfileHandlers(ipcMain);

  // ウィンドウ作成
  const mainWindow = await createWindow();

  // OAuth コールバック処理
  app.on("open-url", (event, url) => {
    event.preventDefault();
    handleOAuthCallback(url, mainWindow);
  });
}

app.whenReady().then(bootstrap);
```

### 3.3 Preload Script 設計

```typescript
// apps/desktop/src/preload/index.ts
import { contextBridge, ipcRenderer } from "electron";
import { IPC_CHANNELS } from "./channels";

// 型安全な API 定義
export interface AuthAPI {
  login: (provider: "google" | "github" | "discord") => Promise<void>;
  logout: () => Promise<void>;
  getSession: () => Promise<Session | null>;
  onAuthStateChange: (callback: (state: AuthState) => void) => () => void;
}

export interface ProfileAPI {
  getProfile: () => Promise<UserProfile | null>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<UserProfile>;
  uploadAvatar: (filePath: string) => Promise<string>;
}

// contextBridge で公開
contextBridge.exposeInMainWorld("electronAPI", {
  auth: {
    login: (provider) => ipcRenderer.invoke(IPC_CHANNELS.AUTH_LOGIN, provider),
    logout: () => ipcRenderer.invoke(IPC_CHANNELS.AUTH_LOGOUT),
    getSession: () => ipcRenderer.invoke(IPC_CHANNELS.AUTH_GET_SESSION),
    onAuthStateChange: (callback) => {
      const handler = (_, state) => callback(state);
      ipcRenderer.on(IPC_CHANNELS.AUTH_STATE_CHANGED, handler);
      return () =>
        ipcRenderer.removeListener(IPC_CHANNELS.AUTH_STATE_CHANGED, handler);
    },
  } satisfies AuthAPI,

  profile: {
    getProfile: () => ipcRenderer.invoke(IPC_CHANNELS.PROFILE_GET),
    updateProfile: (updates) =>
      ipcRenderer.invoke(IPC_CHANNELS.PROFILE_UPDATE, updates),
    uploadAvatar: (filePath) =>
      ipcRenderer.invoke(IPC_CHANNELS.AVATAR_UPLOAD, filePath),
  } satisfies ProfileAPI,
});
```

---

## 4. 認証フロー設計

### 4.1 OAuth 認証シーケンス

```
┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐
│ Renderer │     │  Main    │     │ Browser  │     │ Supabase │     │ Provider │
└────┬─────┘     └────┬─────┘     └────┬─────┘     └────┬─────┘     └────┬─────┘
     │                │                │                │                │
     │ 1. login()     │                │                │                │
     │ ──────────────►│                │                │                │
     │                │                │                │                │
     │                │ 2. Generate    │                │                │
     │                │    PKCE        │                │                │
     │                │ ───────────────►                │                │
     │                │                │                │                │
     │                │ 3. shell.openExternal()         │                │
     │                │ ───────────────────────────────►│                │
     │                │                │                │                │
     │                │                │ 4. Redirect to │                │
     │                │                │    Provider    │                │
     │                │                │ ───────────────────────────────►│
     │                │                │                │                │
     │                │                │                │ 5. User Auth   │
     │                │                │                │◄───────────────│
     │                │                │                │                │
     │                │                │ 6. Auth Code   │                │
     │                │                │◄───────────────│                │
     │                │                │                │                │
     │                │ 7. Custom Protocol Callback     │                │
     │                │◄───────────────│                │                │
     │                │ (aiworkflow://auth/callback)    │                │
     │                │                │                │                │
     │                │ 8. Exchange code for tokens     │                │
     │                │ ───────────────────────────────►│                │
     │                │                │                │                │
     │                │ 9. Tokens + User Info           │                │
     │                │◄───────────────────────────────│                │
     │                │                │                │                │
     │                │ 10. Store tokens (SafeStorage)  │                │
     │                │ ──────────────                  │                │
     │                │                │                │                │
     │ 11. onAuthStateChange           │                │                │
     │◄───────────────│                │                │                │
     │                │                │                │                │
```

### 4.2 PKCE フロー実装

```typescript
// apps/desktop/src/main/services/auth/oauth.ts
import crypto from "crypto";
import { shell } from "electron";

// PKCE Code Verifier 生成
function generateCodeVerifier(): string {
  return crypto.randomBytes(32).toString("base64url");
}

// PKCE Code Challenge 生成
function generateCodeChallenge(verifier: string): string {
  return crypto.createHash("sha256").update(verifier).digest("base64url");
}

// State 生成（CSRF対策）
function generateState(): string {
  return crypto.randomBytes(16).toString("hex");
}

// 保存用（コールバックで使用）
const pendingAuth: Map<string, { verifier: string; provider: string }> =
  new Map();

export async function initiateOAuth(
  provider: "google" | "github" | "discord",
): Promise<void> {
  const verifier = generateCodeVerifier();
  const challenge = generateCodeChallenge(verifier);
  const state = generateState();

  // 後で検証するために保存
  pendingAuth.set(state, { verifier, provider });

  // Supabase OAuth URL 構築
  const params = new URLSearchParams({
    provider,
    redirect_to: "aiworkflow://auth/callback",
    code_challenge: challenge,
    code_challenge_method: "S256",
    state,
  });

  const authUrl = `${process.env.SUPABASE_URL}/auth/v1/authorize?${params}`;

  // システムブラウザで開く
  await shell.openExternal(authUrl);
}
```

### 4.3 コールバック処理

```typescript
// apps/desktop/src/main/services/auth/callback.ts
import { BrowserWindow } from "electron";
import { supabase } from "../supabase";
import { storeTokens } from "../storage/secure";

export async function handleOAuthCallback(
  url: string,
  mainWindow: BrowserWindow,
): Promise<void> {
  const urlObj = new URL(url);
  const code = urlObj.searchParams.get("code");
  const state = urlObj.searchParams.get("state");
  const error = urlObj.searchParams.get("error");

  if (error) {
    mainWindow.webContents.send("auth:state-changed", {
      authenticated: false,
      error: urlObj.searchParams.get("error_description"),
    });
    return;
  }

  if (!code || !state) {
    mainWindow.webContents.send("auth:state-changed", {
      authenticated: false,
      error: "Invalid callback parameters",
    });
    return;
  }

  // State 検証
  const pending = pendingAuth.get(state);
  if (!pending) {
    mainWindow.webContents.send("auth:state-changed", {
      authenticated: false,
      error: "Invalid state parameter",
    });
    return;
  }

  pendingAuth.delete(state);

  try {
    // コードをトークンに交換
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) throw error;

    // トークンを安全に保存
    await storeTokens({
      accessToken: data.session.access_token,
      refreshToken: data.session.refresh_token,
    });

    // Renderer に通知
    mainWindow.webContents.send("auth:state-changed", {
      authenticated: true,
      user: data.user,
    });
  } catch (err) {
    mainWindow.webContents.send("auth:state-changed", {
      authenticated: false,
      error: err instanceof Error ? err.message : "Authentication failed",
    });
  }
}
```

---

## 5. トークン管理

### 5.1 トークンフロー

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         Token Management Flow                           │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌─────────────────┐                                                   │
│  │  OAuth Success  │                                                   │
│  └────────┬────────┘                                                   │
│           │                                                             │
│           ▼                                                             │
│  ┌─────────────────┐       ┌─────────────────┐                        │
│  │  Access Token   │       │  Refresh Token  │                        │
│  │  (1 hour)       │       │  (30 days)      │                        │
│  └────────┬────────┘       └────────┬────────┘                        │
│           │                         │                                   │
│           ▼                         ▼                                   │
│  ┌─────────────────┐       ┌─────────────────┐                        │
│  │  Memory         │       │  SafeStorage    │                        │
│  │  (authSlice)    │       │  (encrypted)    │                        │
│  └────────┬────────┘       └────────┬────────┘                        │
│           │                         │                                   │
│           │                         │                                   │
│           ▼                         ▼                                   │
│  ┌─────────────────────────────────────────────────────────────────┐  │
│  │                    Token Refresh Logic                          │  │
│  │                                                                 │  │
│  │  1. API Request with Access Token                              │  │
│  │  2. If 401 → Try Refresh Token                                 │  │
│  │  3. If Refresh Success → Update Access Token                   │  │
│  │  4. If Refresh Failed → Force Re-login                         │  │
│  │                                                                 │  │
│  └─────────────────────────────────────────────────────────────────┘  │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### 5.2 SafeStorage 実装

```typescript
// apps/desktop/src/main/services/storage/secure.ts
import { safeStorage } from "electron";
import Store from "electron-store";

interface SecureTokens {
  accessToken: string;
  refreshToken: string;
}

const store = new Store({ name: "auth-secure" });

export async function storeTokens(tokens: SecureTokens): Promise<void> {
  if (!safeStorage.isEncryptionAvailable()) {
    console.warn("SafeStorage encryption not available");
    // フォールバック処理（警告付き）
    store.set("tokens_fallback", tokens);
    return;
  }

  // Refresh Token のみ SafeStorage で暗号化
  const encryptedRefresh = safeStorage.encryptString(tokens.refreshToken);
  store.set("refresh_token", encryptedRefresh.toString("base64"));

  // Access Token はセッション中のみ使用（永続化しない）
  // Memory に保持し、Main Process 内でのみアクセス
}

export async function getRefreshToken(): Promise<string | null> {
  if (!safeStorage.isEncryptionAvailable()) {
    const fallback = store.get("tokens_fallback") as SecureTokens | undefined;
    return fallback?.refreshToken ?? null;
  }

  const encrypted = store.get("refresh_token") as string | undefined;
  if (!encrypted) return null;

  try {
    const buffer = Buffer.from(encrypted, "base64");
    return safeStorage.decryptString(buffer);
  } catch {
    return null;
  }
}

export async function clearTokens(): Promise<void> {
  store.delete("refresh_token");
  store.delete("tokens_fallback");
}
```

---

## 6. セッション復元

### 6.1 アプリ起動時フロー

```
┌─────────────────────────────────────────────────────────────────────────┐
│                       Session Restore Flow                              │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌─────────────┐                                                       │
│  │  App Start  │                                                       │
│  └──────┬──────┘                                                       │
│         │                                                               │
│         ▼                                                               │
│  ┌─────────────────────┐                                               │
│  │ Get Refresh Token   │                                               │
│  │ from SafeStorage    │                                               │
│  └──────────┬──────────┘                                               │
│             │                                                           │
│      ┌──────┴──────┐                                                   │
│      │             │                                                   │
│      ▼             ▼                                                   │
│   [Found]      [Not Found]                                             │
│      │             │                                                   │
│      │             ▼                                                   │
│      │      ┌─────────────┐                                           │
│      │      │ Show Login  │                                           │
│      │      │ Screen      │                                           │
│      │      └─────────────┘                                           │
│      │                                                                 │
│      ▼                                                                 │
│  ┌─────────────────────┐                                               │
│  │ Try Refresh Session │                                               │
│  │ with Supabase       │                                               │
│  └──────────┬──────────┘                                               │
│             │                                                           │
│      ┌──────┴──────┐                                                   │
│      │             │                                                   │
│      ▼             ▼                                                   │
│   [Success]     [Failed]                                               │
│      │             │                                                   │
│      │             ▼                                                   │
│      │      ┌─────────────────────┐                                   │
│      │      │ Clear Old Tokens    │                                   │
│      │      │ Show Login Screen   │                                   │
│      │      └─────────────────────┘                                   │
│      │                                                                 │
│      ▼                                                                 │
│  ┌─────────────────────┐                                               │
│  │ Store New Tokens    │                                               │
│  │ Load User Profile   │                                               │
│  │ Initialize App      │                                               │
│  └─────────────────────┘                                               │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### 6.2 実装

```typescript
// apps/desktop/src/main/services/auth/session.ts
import { supabase } from "../supabase";
import { getRefreshToken, storeTokens, clearTokens } from "../storage/secure";
import { getCachedProfile } from "../storage/cache";

export interface SessionRestoreResult {
  success: boolean;
  user?: User;
  profile?: UserProfile;
  error?: string;
}

export async function restoreSession(): Promise<SessionRestoreResult> {
  // 1. Refresh Token を取得
  const refreshToken = await getRefreshToken();

  if (!refreshToken) {
    return { success: false, error: "No refresh token found" };
  }

  try {
    // 2. Supabase でセッション復元を試行
    const { data, error } = await supabase.auth.setSession({
      access_token: "", // 不要（refresh_token のみ使用）
      refresh_token: refreshToken,
    });

    if (error) throw error;

    if (!data.session) {
      throw new Error("No session returned");
    }

    // 3. 新しいトークンを保存
    await storeTokens({
      accessToken: data.session.access_token,
      refreshToken: data.session.refresh_token,
    });

    // 4. プロフィールを取得
    const { data: profile } = await supabase
      .from("user_profiles")
      .select("*")
      .eq("id", data.user.id)
      .single();

    return {
      success: true,
      user: data.user,
      profile: profile ?? undefined,
    };
  } catch (error) {
    // 5. 失敗時はトークンをクリア
    await clearTokens();

    // オフライン時はキャッシュを使用
    if (!navigator.onLine) {
      const cachedProfile = await getCachedProfile();
      if (cachedProfile) {
        return {
          success: true,
          profile: cachedProfile,
          error: "Offline mode - using cached data",
        };
      }
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : "Session restore failed",
    };
  }
}
```

---

## 7. エラーハンドリング設計

### 7.1 エラー分類

```typescript
// packages/shared/core/errors/auth.ts
export class AuthError extends Error {
  constructor(
    message: string,
    public code: AuthErrorCode,
    public recoverable: boolean = true,
  ) {
    super(message);
    this.name = "AuthError";
  }
}

export enum AuthErrorCode {
  // 認証エラー
  INVALID_CREDENTIALS = "auth/invalid-credentials",
  TOKEN_EXPIRED = "auth/token-expired",
  REFRESH_FAILED = "auth/refresh-failed",
  SESSION_NOT_FOUND = "auth/session-not-found",

  // ネットワークエラー
  NETWORK_ERROR = "auth/network-error",
  TIMEOUT = "auth/timeout",

  // プロバイダーエラー
  PROVIDER_ERROR = "auth/provider-error",
  OAUTH_CANCELLED = "auth/oauth-cancelled",

  // セキュリティエラー
  INVALID_STATE = "auth/invalid-state",
  ENCRYPTION_UNAVAILABLE = "auth/encryption-unavailable",
}
```

### 7.2 エラーハンドリング戦略

| エラーコード     | 自動復旧 | ユーザーアクション   |
| ---------------- | -------- | -------------------- |
| `TOKEN_EXPIRED`  | Yes      | なし（自動更新）     |
| `REFRESH_FAILED` | No       | 再ログイン促す       |
| `NETWORK_ERROR`  | Partial  | オフラインモード移行 |
| `PROVIDER_ERROR` | No       | 別プロバイダー提案   |
| `INVALID_STATE`  | No       | 再ログイン促す       |

---

## 8. セキュリティ設計

### 8.1 Electron セキュリティ設定

```typescript
// apps/desktop/src/main/index.ts
const mainWindow = new BrowserWindow({
  webPreferences: {
    // セキュリティ設定
    contextIsolation: true, // 必須: Preload と Renderer の分離
    nodeIntegration: false, // 必須: Renderer で Node.js 無効化
    sandbox: true, // 推奨: サンドボックス有効化
    webSecurity: true, // 必須: 同一オリジンポリシー有効

    // Preload スクリプト
    preload: path.join(__dirname, "../preload/index.js"),
  },
});

// Content Security Policy
mainWindow.webContents.session.webRequest.onHeadersReceived(
  (details, callback) => {
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        "Content-Security-Policy": [
          "default-src 'self'",
          "script-src 'self'",
          "style-src 'self' 'unsafe-inline'",
          "img-src 'self' data: https:",
          "connect-src 'self' https://*.supabase.co https://*.turso.io",
        ].join("; "),
      },
    });
  },
);
```

### 8.2 IPC セキュリティ

```typescript
// apps/desktop/src/preload/channels.ts
// 許可された IPC チャネルのホワイトリスト
export const ALLOWED_CHANNELS = {
  invoke: [
    "auth:login",
    "auth:logout",
    "auth:get-session",
    "profile:get",
    "profile:update",
    "avatar:upload",
  ],
  on: ["auth:state-changed"],
} as const;

// Preload でチャネルを検証
contextBridge.exposeInMainWorld("electronAPI", {
  invoke: (channel: string, ...args: unknown[]) => {
    if (ALLOWED_CHANNELS.invoke.includes(channel as any)) {
      return ipcRenderer.invoke(channel, ...args);
    }
    throw new Error(`Invalid channel: ${channel}`);
  },
});
```

---

## 9. ディレクトリ構成

```
apps/desktop/
├── src/
│   ├── main/
│   │   ├── index.ts                    # エントリーポイント
│   │   ├── ipc/
│   │   │   ├── index.ts               # IPC ハンドラー登録
│   │   │   ├── authHandlers.ts        # 認証 IPC
│   │   │   ├── profileHandlers.ts     # プロフィール IPC
│   │   │   └── storeHandlers.ts       # ストレージ IPC
│   │   └── services/
│   │       ├── auth/
│   │       │   ├── oauth.ts           # OAuth フロー
│   │       │   ├── callback.ts        # コールバック処理
│   │       │   └── session.ts         # セッション管理
│   │       ├── storage/
│   │       │   ├── secure.ts          # SafeStorage
│   │       │   └── cache.ts           # キャッシュ
│   │       ├── supabase.ts            # Supabase クライアント
│   │       └── turso.ts               # Turso クライアント
│   │
│   ├── preload/
│   │   ├── index.ts                   # Preload エントリー
│   │   ├── channels.ts                # チャネル定義
│   │   └── types.ts                   # 型定義
│   │
│   └── renderer/
│       ├── store/
│       │   ├── slices/
│       │   │   └── authSlice.ts       # 認証状態管理
│       │   └── types.ts
│       ├── hooks/
│       │   └── useAuth.ts             # 認証フック
│       ├── views/
│       │   └── AuthView/
│       │       ├── index.tsx          # ログイン画面ビュー
│       │       └── AuthView.test.tsx  # テスト
│       └── components/
│           ├── AuthGuard/
│           │   ├── index.tsx          # 認証ガードHOC
│           │   ├── LoadingScreen.tsx  # ローディング画面
│           │   ├── types.ts           # 型定義
│           │   └── AuthGuard.test.tsx # テスト
│           ├── atoms/
│           │   └── ProviderIcon/
│           │       └── index.tsx      # OAuthプロバイダーアイコン
│           └── organisms/
│               └── AccountSection/
│                   ├── index.tsx      # アカウント設定セクション
│                   └── AccountSection.test.tsx

packages/shared/
├── core/
│   ├── entities/
│   │   └── user.ts                    # User エンティティ
│   ├── interfaces/
│   │   └── auth.ts                    # 認証インターフェース
│   └── errors/
│       └── auth.ts                    # 認証エラー
├── infrastructure/
│   ├── auth/
│   │   └── supabase-client.ts         # Supabase クライアント
│   └── database/
│       └── client.ts                  # Turso クライアント
└── types/
    └── auth.ts                        # 認証型定義
```

---

## 10. 参考資料

- [Electron Security](https://www.electronjs.org/docs/latest/tutorial/security)
- [Supabase Auth](https://supabase.com/docs/guides/auth)
- [OAuth 2.0 PKCE](https://oauth.net/2/pkce/)
- [Clean Architecture](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
