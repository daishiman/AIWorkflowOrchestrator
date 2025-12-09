# IPC設計書（認証・プロフィール）

## 1. 概要

### 1.1 目的

Electron Main Process と Renderer Process 間の通信（IPC）を設計し、認証・プロフィール機能の型安全な API を定義する。

### 1.2 設計原則

- **型安全性**: TypeScript の型定義で Request/Response を厳密に定義
- **セキュリティ**: IPC チャネルをホワイトリストで制限
- **一貫性**: 命名規則と構造を統一
- **エラーハンドリング**: 標準化されたエラーレスポンス形式

---

## 2. IPCチャネル定義

### 2.1 チャネル命名規則

```
{domain}:{action}
```

- **domain**: 機能ドメイン（auth, profile, settings, avatar）
- **action**: 操作名（login, logout, get, update, upload）

### 2.2 認証チャネル

| チャネル名           | 方向        | 説明                 |
| -------------------- | ----------- | -------------------- |
| `auth:login`         | Invoke      | OAuthログイン開始    |
| `auth:logout`        | Invoke      | ログアウト           |
| `auth:get-session`   | Invoke      | 現在のセッション取得 |
| `auth:refresh`       | Invoke      | トークン更新         |
| `auth:state-changed` | Event (M→R) | 認証状態変更通知     |
| `auth:check-online`  | Invoke      | オンライン状態確認   |

### 2.3 プロフィールチャネル

| チャネル名              | 方向   | 説明                     |
| ----------------------- | ------ | ------------------------ |
| `profile:get`           | Invoke | プロフィール取得         |
| `profile:update`        | Invoke | プロフィール更新         |
| `profile:get-providers` | Invoke | 連携プロバイダー一覧取得 |
| `profile:link-provider` | Invoke | 新しいプロバイダーを連携 |

### 2.4 アバターチャネル

| チャネル名            | 方向   | 説明                         |
| --------------------- | ------ | ---------------------------- |
| `avatar:upload`       | Invoke | アバター画像アップロード     |
| `avatar:use-provider` | Invoke | プロバイダーアバター使用     |
| `avatar:remove`       | Invoke | アバター削除（デフォルト化） |

### 2.5 設定チャネル

| チャネル名        | 方向   | 説明             |
| ----------------- | ------ | ---------------- |
| `settings:get`    | Invoke | ユーザー設定取得 |
| `settings:update` | Invoke | ユーザー設定更新 |

---

## 3. 型定義

### 3.1 基本型

```typescript
// packages/shared/types/ipc/common.ts

/**
 * IPC レスポンスの基本型
 */
export interface IPCResponse<T> {
  success: boolean;
  data?: T;
  error?: IPCError;
}

/**
 * IPC エラー型
 */
export interface IPCError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

/**
 * ページネーション型
 */
export interface Pagination {
  page: number;
  pageSize: number;
  total: number;
  hasNext: boolean;
}
```

### 3.2 認証関連型

```typescript
// packages/shared/types/ipc/auth.ts

import type { IPCResponse, IPCError } from "./common";

/**
 * OAuth プロバイダー
 */
export type OAuthProvider = "google" | "github" | "discord";

/**
 * 認証状態
 */
export interface AuthState {
  authenticated: boolean;
  user?: AuthUser;
  error?: string;
  isOffline?: boolean;
}

/**
 * 認証ユーザー情報
 */
export interface AuthUser {
  id: string;
  email: string;
  displayName: string | null;
  avatarUrl: string | null;
  provider: OAuthProvider;
  createdAt: string;
  lastSignInAt: string;
}

/**
 * セッション情報
 */
export interface Session {
  user: AuthUser;
  accessToken: string;
  expiresAt: number;
  isOffline: boolean;
}

// === Request/Response 型 ===

/**
 * auth:login
 */
export interface AuthLoginRequest {
  provider: OAuthProvider;
}
export type AuthLoginResponse = IPCResponse<void>;

/**
 * auth:logout
 */
export type AuthLogoutRequest = void;
export type AuthLogoutResponse = IPCResponse<void>;

/**
 * auth:get-session
 */
export type AuthGetSessionRequest = void;
export type AuthGetSessionResponse = IPCResponse<Session | null>;

/**
 * auth:refresh
 */
export type AuthRefreshRequest = void;
export type AuthRefreshResponse = IPCResponse<Session>;

/**
 * auth:check-online
 */
export type AuthCheckOnlineRequest = void;
export type AuthCheckOnlineResponse = IPCResponse<{ online: boolean }>;
```

### 3.3 プロフィール関連型

```typescript
// packages/shared/types/ipc/profile.ts

import type { IPCResponse } from "./common";
import type { OAuthProvider } from "./auth";

/**
 * ユーザープラン
 */
export type UserPlan = "free" | "pro" | "enterprise";

/**
 * ユーザープロフィール
 */
export interface UserProfile {
  id: string;
  displayName: string;
  email: string;
  avatarUrl: string | null;
  plan: UserPlan;
  createdAt: string;
  updatedAt: string;
}

/**
 * プロフィール更新可能フィールド
 */
export interface ProfileUpdateFields {
  displayName?: string;
  avatarUrl?: string | null;
}

/**
 * 連携プロバイダー情報
 */
export interface LinkedProvider {
  provider: OAuthProvider;
  providerId: string;
  email: string;
  displayName: string | null;
  avatarUrl: string | null;
  linkedAt: string;
}

// === Request/Response 型 ===

/**
 * profile:get
 */
export type ProfileGetRequest = void;
export type ProfileGetResponse = IPCResponse<UserProfile>;

/**
 * profile:update
 */
export interface ProfileUpdateRequest {
  updates: ProfileUpdateFields;
}
export type ProfileUpdateResponse = IPCResponse<UserProfile>;

/**
 * profile:get-providers
 */
export type ProfileGetProvidersRequest = void;
export type ProfileGetProvidersResponse = IPCResponse<LinkedProvider[]>;

/**
 * profile:link-provider
 */
export interface ProfileLinkProviderRequest {
  provider: OAuthProvider;
}
export type ProfileLinkProviderResponse = IPCResponse<LinkedProvider>;
```

### 3.4 アバター関連型

```typescript
// packages/shared/types/ipc/avatar.ts

import type { IPCResponse } from "./common";
import type { OAuthProvider } from "./auth";

/**
 * avatar:upload
 */
export interface AvatarUploadRequest {
  filePath: string;
}
export type AvatarUploadResponse = IPCResponse<{ avatarUrl: string }>;

/**
 * avatar:use-provider
 */
export interface AvatarUseProviderRequest {
  provider: OAuthProvider;
}
export type AvatarUseProviderResponse = IPCResponse<{ avatarUrl: string }>;

/**
 * avatar:remove
 */
export type AvatarRemoveRequest = void;
export type AvatarRemoveResponse = IPCResponse<void>;
```

### 3.5 設定関連型

```typescript
// packages/shared/types/ipc/settings.ts

import type { IPCResponse } from "./common";

/**
 * テーマモード
 */
export type ThemeMode = "light" | "dark" | "system";

/**
 * 言語設定
 */
export type Language = "ja" | "en";

/**
 * ユーザー設定
 */
export interface UserSettings {
  id: string;
  userId: string;
  themeMode: ThemeMode;
  language: Language;
  notificationsEnabled: boolean;
  autoSyncEnabled: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * 設定更新可能フィールド
 */
export interface SettingsUpdateFields {
  themeMode?: ThemeMode;
  language?: Language;
  notificationsEnabled?: boolean;
  autoSyncEnabled?: boolean;
}

// === Request/Response 型 ===

/**
 * settings:get
 */
export type SettingsGetRequest = void;
export type SettingsGetResponse = IPCResponse<UserSettings>;

/**
 * settings:update
 */
export interface SettingsUpdateRequest {
  updates: SettingsUpdateFields;
}
export type SettingsUpdateResponse = IPCResponse<UserSettings>;
```

---

## 4. IPCチャネル定数

```typescript
// apps/desktop/src/preload/channels.ts

/**
 * IPC チャネル定数
 */
export const IPC_CHANNELS = {
  // 認証
  AUTH_LOGIN: "auth:login",
  AUTH_LOGOUT: "auth:logout",
  AUTH_GET_SESSION: "auth:get-session",
  AUTH_REFRESH: "auth:refresh",
  AUTH_STATE_CHANGED: "auth:state-changed",
  AUTH_CHECK_ONLINE: "auth:check-online",

  // プロフィール
  PROFILE_GET: "profile:get",
  PROFILE_UPDATE: "profile:update",
  PROFILE_GET_PROVIDERS: "profile:get-providers",
  PROFILE_LINK_PROVIDER: "profile:link-provider",

  // アバター
  AVATAR_UPLOAD: "avatar:upload",
  AVATAR_USE_PROVIDER: "avatar:use-provider",
  AVATAR_REMOVE: "avatar:remove",

  // 設定
  SETTINGS_GET: "settings:get",
  SETTINGS_UPDATE: "settings:update",
} as const;

export type IPCChannel = (typeof IPC_CHANNELS)[keyof typeof IPC_CHANNELS];

/**
 * ホワイトリスト: Invoke チャネル
 */
export const ALLOWED_INVOKE_CHANNELS: readonly string[] = [
  IPC_CHANNELS.AUTH_LOGIN,
  IPC_CHANNELS.AUTH_LOGOUT,
  IPC_CHANNELS.AUTH_GET_SESSION,
  IPC_CHANNELS.AUTH_REFRESH,
  IPC_CHANNELS.AUTH_CHECK_ONLINE,
  IPC_CHANNELS.PROFILE_GET,
  IPC_CHANNELS.PROFILE_UPDATE,
  IPC_CHANNELS.PROFILE_GET_PROVIDERS,
  IPC_CHANNELS.PROFILE_LINK_PROVIDER,
  IPC_CHANNELS.AVATAR_UPLOAD,
  IPC_CHANNELS.AVATAR_USE_PROVIDER,
  IPC_CHANNELS.AVATAR_REMOVE,
  IPC_CHANNELS.SETTINGS_GET,
  IPC_CHANNELS.SETTINGS_UPDATE,
] as const;

/**
 * ホワイトリスト: Event チャネル（Main → Renderer）
 */
export const ALLOWED_EVENT_CHANNELS: readonly string[] = [
  IPC_CHANNELS.AUTH_STATE_CHANGED,
] as const;
```

---

## 5. Preload API実装

### 5.1 Preload Bridge

```typescript
// apps/desktop/src/preload/index.ts

import { contextBridge, ipcRenderer } from "electron";
import {
  IPC_CHANNELS,
  ALLOWED_INVOKE_CHANNELS,
  ALLOWED_EVENT_CHANNELS,
} from "./channels";

// 型インポート
import type {
  AuthState,
  Session,
  OAuthProvider,
} from "@repo/shared/types/ipc/auth";
import type {
  UserProfile,
  ProfileUpdateFields,
  LinkedProvider,
} from "@repo/shared/types/ipc/profile";
import type {
  UserSettings,
  SettingsUpdateFields,
} from "@repo/shared/types/ipc/settings";
import type { IPCResponse } from "@repo/shared/types/ipc/common";

/**
 * 安全な invoke ラッパー
 */
function safeInvoke<T>(channel: string, ...args: unknown[]): Promise<T> {
  if (!ALLOWED_INVOKE_CHANNELS.includes(channel)) {
    return Promise.reject(new Error(`Invalid IPC channel: ${channel}`));
  }
  return ipcRenderer.invoke(channel, ...args);
}

/**
 * 安全な on ラッパー
 */
function safeOn(
  channel: string,
  callback: (event: Electron.IpcRendererEvent, ...args: unknown[]) => void,
): () => void {
  if (!ALLOWED_EVENT_CHANNELS.includes(channel)) {
    throw new Error(`Invalid IPC channel: ${channel}`);
  }
  ipcRenderer.on(channel, callback);
  return () => ipcRenderer.removeListener(channel, callback);
}

/**
 * Renderer に公開する API
 */
export interface ElectronAPI {
  auth: AuthAPI;
  profile: ProfileAPI;
  avatar: AvatarAPI;
  settings: SettingsAPI;
}

export interface AuthAPI {
  login(provider: OAuthProvider): Promise<IPCResponse<void>>;
  logout(): Promise<IPCResponse<void>>;
  getSession(): Promise<IPCResponse<Session | null>>;
  refresh(): Promise<IPCResponse<Session>>;
  checkOnline(): Promise<IPCResponse<{ online: boolean }>>;
  onAuthStateChange(callback: (state: AuthState) => void): () => void;
}

export interface ProfileAPI {
  get(): Promise<IPCResponse<UserProfile>>;
  update(updates: ProfileUpdateFields): Promise<IPCResponse<UserProfile>>;
  getProviders(): Promise<IPCResponse<LinkedProvider[]>>;
  linkProvider(provider: OAuthProvider): Promise<IPCResponse<LinkedProvider>>;
}

export interface AvatarAPI {
  upload(filePath: string): Promise<IPCResponse<{ avatarUrl: string }>>;
  useProvider(
    provider: OAuthProvider,
  ): Promise<IPCResponse<{ avatarUrl: string }>>;
  remove(): Promise<IPCResponse<void>>;
}

export interface SettingsAPI {
  get(): Promise<IPCResponse<UserSettings>>;
  update(updates: SettingsUpdateFields): Promise<IPCResponse<UserSettings>>;
}

// contextBridge で公開
const api: ElectronAPI = {
  auth: {
    login: (provider) => safeInvoke(IPC_CHANNELS.AUTH_LOGIN, provider),
    logout: () => safeInvoke(IPC_CHANNELS.AUTH_LOGOUT),
    getSession: () => safeInvoke(IPC_CHANNELS.AUTH_GET_SESSION),
    refresh: () => safeInvoke(IPC_CHANNELS.AUTH_REFRESH),
    checkOnline: () => safeInvoke(IPC_CHANNELS.AUTH_CHECK_ONLINE),
    onAuthStateChange: (callback) => {
      return safeOn(IPC_CHANNELS.AUTH_STATE_CHANGED, (_, state) => {
        callback(state as AuthState);
      });
    },
  },

  profile: {
    get: () => safeInvoke(IPC_CHANNELS.PROFILE_GET),
    update: (updates) => safeInvoke(IPC_CHANNELS.PROFILE_UPDATE, updates),
    getProviders: () => safeInvoke(IPC_CHANNELS.PROFILE_GET_PROVIDERS),
    linkProvider: (provider) =>
      safeInvoke(IPC_CHANNELS.PROFILE_LINK_PROVIDER, provider),
  },

  avatar: {
    upload: (filePath) => safeInvoke(IPC_CHANNELS.AVATAR_UPLOAD, filePath),
    useProvider: (provider) =>
      safeInvoke(IPC_CHANNELS.AVATAR_USE_PROVIDER, provider),
    remove: () => safeInvoke(IPC_CHANNELS.AVATAR_REMOVE),
  },

  settings: {
    get: () => safeInvoke(IPC_CHANNELS.SETTINGS_GET),
    update: (updates) => safeInvoke(IPC_CHANNELS.SETTINGS_UPDATE, updates),
  },
};

contextBridge.exposeInMainWorld("electronAPI", api);
```

### 5.2 型定義（Window拡張）

```typescript
// apps/desktop/src/preload/types.ts

import type { ElectronAPI } from "./index";

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}

export {};
```

---

## 6. Main Process ハンドラー

### 6.1 認証ハンドラー

```typescript
// apps/desktop/src/main/ipc/authHandlers.ts

import { ipcMain, BrowserWindow } from "electron";
import { IPC_CHANNELS } from "../../preload/channels";
import { initiateOAuth } from "../services/auth/oauth";
import { restoreSession, logout } from "../services/auth/session";
import { getRefreshToken, clearTokens } from "../services/storage/secure";
import type { IPCResponse } from "@repo/shared/types/ipc/common";
import type {
  OAuthProvider,
  Session,
  AuthState,
} from "@repo/shared/types/ipc/auth";

/**
 * 認証関連 IPC ハンドラーを登録
 */
export function registerAuthHandlers(mainWindow: BrowserWindow): void {
  // auth:login - OAuthログイン開始
  ipcMain.handle(
    IPC_CHANNELS.AUTH_LOGIN,
    async (_, provider: OAuthProvider): Promise<IPCResponse<void>> => {
      try {
        await initiateOAuth(provider, mainWindow);
        return { success: true };
      } catch (error) {
        return {
          success: false,
          error: {
            code: "auth/login-failed",
            message: error instanceof Error ? error.message : "Login failed",
          },
        };
      }
    },
  );

  // auth:logout - ログアウト
  ipcMain.handle(
    IPC_CHANNELS.AUTH_LOGOUT,
    async (): Promise<IPCResponse<void>> => {
      try {
        await logout();
        await clearTokens();
        mainWindow.webContents.send(IPC_CHANNELS.AUTH_STATE_CHANGED, {
          authenticated: false,
        } as AuthState);
        return { success: true };
      } catch (error) {
        return {
          success: false,
          error: {
            code: "auth/logout-failed",
            message: error instanceof Error ? error.message : "Logout failed",
          },
        };
      }
    },
  );

  // auth:get-session - セッション取得
  ipcMain.handle(
    IPC_CHANNELS.AUTH_GET_SESSION,
    async (): Promise<IPCResponse<Session | null>> => {
      try {
        const result = await restoreSession();
        if (result.success && result.user) {
          return {
            success: true,
            data: {
              user: result.user,
              accessToken: "", // Main Process 内でのみ使用
              expiresAt: Date.now() + 3600000,
              isOffline: !navigator.onLine,
            },
          };
        }
        return { success: true, data: null };
      } catch (error) {
        return {
          success: false,
          error: {
            code: "auth/session-failed",
            message:
              error instanceof Error ? error.message : "Session restore failed",
          },
        };
      }
    },
  );

  // auth:refresh - トークン更新
  ipcMain.handle(
    IPC_CHANNELS.AUTH_REFRESH,
    async (): Promise<IPCResponse<Session>> => {
      try {
        const refreshToken = await getRefreshToken();
        if (!refreshToken) {
          throw new Error("No refresh token available");
        }
        const result = await restoreSession();
        if (!result.success || !result.user) {
          throw new Error("Token refresh failed");
        }
        return {
          success: true,
          data: {
            user: result.user,
            accessToken: "",
            expiresAt: Date.now() + 3600000,
            isOffline: false,
          },
        };
      } catch (error) {
        return {
          success: false,
          error: {
            code: "auth/refresh-failed",
            message:
              error instanceof Error ? error.message : "Token refresh failed",
          },
        };
      }
    },
  );

  // auth:check-online - オンライン状態確認
  ipcMain.handle(
    IPC_CHANNELS.AUTH_CHECK_ONLINE,
    async (): Promise<IPCResponse<{ online: boolean }>> => {
      // Main Process では net.isOnline() を使用
      const { net } = await import("electron");
      return {
        success: true,
        data: { online: net.isOnline() },
      };
    },
  );
}
```

### 6.2 プロフィールハンドラー

```typescript
// apps/desktop/src/main/ipc/profileHandlers.ts

import { ipcMain } from "electron";
import { IPC_CHANNELS } from "../../preload/channels";
import { supabase } from "../services/supabase";
import {
  getCachedProfile,
  updateCachedProfile,
} from "../services/storage/cache";
import type { IPCResponse } from "@repo/shared/types/ipc/common";
import type {
  UserProfile,
  ProfileUpdateFields,
  LinkedProvider,
} from "@repo/shared/types/ipc/profile";
import type { OAuthProvider } from "@repo/shared/types/ipc/auth";

/**
 * プロフィール関連 IPC ハンドラーを登録
 */
export function registerProfileHandlers(): void {
  // profile:get - プロフィール取得
  ipcMain.handle(
    IPC_CHANNELS.PROFILE_GET,
    async (): Promise<IPCResponse<UserProfile>> => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          // オフライン時はキャッシュを使用
          const cached = await getCachedProfile();
          if (cached) {
            return { success: true, data: cached };
          }
          throw new Error("Not authenticated");
        }

        const { data, error } = await supabase
          .from("user_profiles")
          .select("*")
          .eq("id", user.id)
          .single();

        if (error) throw error;

        const profile: UserProfile = {
          id: data.id,
          displayName: data.display_name,
          email: data.email,
          avatarUrl: data.avatar_url,
          plan: data.plan,
          createdAt: data.created_at,
          updatedAt: data.updated_at,
        };

        // キャッシュ更新
        await updateCachedProfile(profile);

        return { success: true, data: profile };
      } catch (error) {
        return {
          success: false,
          error: {
            code: "profile/get-failed",
            message:
              error instanceof Error ? error.message : "Failed to get profile",
          },
        };
      }
    },
  );

  // profile:update - プロフィール更新
  ipcMain.handle(
    IPC_CHANNELS.PROFILE_UPDATE,
    async (
      _,
      updates: ProfileUpdateFields,
    ): Promise<IPCResponse<UserProfile>> => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          throw new Error("Not authenticated");
        }

        // バリデーション
        if (updates.displayName !== undefined) {
          if (
            updates.displayName.length < 3 ||
            updates.displayName.length > 30
          ) {
            throw new Error("Display name must be 3-30 characters");
          }
        }

        const { data, error } = await supabase
          .from("user_profiles")
          .update({
            ...(updates.displayName && { display_name: updates.displayName }),
            ...(updates.avatarUrl !== undefined && {
              avatar_url: updates.avatarUrl,
            }),
            updated_at: new Date().toISOString(),
          })
          .eq("id", user.id)
          .select()
          .single();

        if (error) throw error;

        const profile: UserProfile = {
          id: data.id,
          displayName: data.display_name,
          email: data.email,
          avatarUrl: data.avatar_url,
          plan: data.plan,
          createdAt: data.created_at,
          updatedAt: data.updated_at,
        };

        // キャッシュ更新
        await updateCachedProfile(profile);

        return { success: true, data: profile };
      } catch (error) {
        return {
          success: false,
          error: {
            code: "profile/update-failed",
            message:
              error instanceof Error
                ? error.message
                : "Failed to update profile",
          },
        };
      }
    },
  );

  // profile:get-providers - 連携プロバイダー取得
  ipcMain.handle(
    IPC_CHANNELS.PROFILE_GET_PROVIDERS,
    async (): Promise<IPCResponse<LinkedProvider[]>> => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          throw new Error("Not authenticated");
        }

        const providers: LinkedProvider[] = (user.identities ?? []).map(
          (identity) => ({
            provider: identity.provider as OAuthProvider,
            providerId: identity.id,
            email: identity.identity_data?.email ?? "",
            displayName: identity.identity_data?.name ?? null,
            avatarUrl: identity.identity_data?.avatar_url ?? null,
            linkedAt: identity.created_at,
          }),
        );

        return { success: true, data: providers };
      } catch (error) {
        return {
          success: false,
          error: {
            code: "profile/providers-failed",
            message:
              error instanceof Error
                ? error.message
                : "Failed to get providers",
          },
        };
      }
    },
  );

  // profile:link-provider - 新しいプロバイダー連携
  ipcMain.handle(
    IPC_CHANNELS.PROFILE_LINK_PROVIDER,
    async (
      _,
      provider: OAuthProvider,
    ): Promise<IPCResponse<LinkedProvider>> => {
      try {
        // プロバイダー連携は OAuth フローを再実行
        // TODO: supabase.auth.linkIdentity() を実装
        throw new Error("Not implemented yet");
      } catch (error) {
        return {
          success: false,
          error: {
            code: "profile/link-failed",
            message:
              error instanceof Error
                ? error.message
                : "Failed to link provider",
          },
        };
      }
    },
  );
}
```

### 6.3 アバターハンドラー

```typescript
// apps/desktop/src/main/ipc/avatarHandlers.ts

import { ipcMain } from "electron";
import * as fs from "fs/promises";
import sharp from "sharp";
import { IPC_CHANNELS } from "../../preload/channels";
import { supabase } from "../services/supabase";
import type { IPCResponse } from "@repo/shared/types/ipc/common";
import type { OAuthProvider } from "@repo/shared/types/ipc/auth";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const AVATAR_SIZE = 256;
const ALLOWED_MIME_TYPES = [
  "image/png",
  "image/jpeg",
  "image/gif",
  "image/webp",
];

/**
 * アバター関連 IPC ハンドラーを登録
 */
export function registerAvatarHandlers(): void {
  // avatar:upload - アバターアップロード
  ipcMain.handle(
    IPC_CHANNELS.AVATAR_UPLOAD,
    async (
      _,
      filePath: string,
    ): Promise<IPCResponse<{ avatarUrl: string }>> => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          throw new Error("Not authenticated");
        }

        // 1. ファイル読み込み
        const fileBuffer = await fs.readFile(filePath);

        // 2. サイズ検証
        if (fileBuffer.length > MAX_FILE_SIZE) {
          throw new Error("File size exceeds 5MB limit");
        }

        // 3. 画像リサイズ
        const resizedBuffer = await sharp(fileBuffer)
          .resize(AVATAR_SIZE, AVATAR_SIZE, {
            fit: "cover",
            position: "center",
          })
          .webp({ quality: 80 })
          .toBuffer();

        // 4. Supabase Storage にアップロード
        const fileName = `${user.id}.webp`;
        const { error: uploadError } = await supabase.storage
          .from("avatars")
          .upload(fileName, resizedBuffer, {
            contentType: "image/webp",
            upsert: true,
          });

        if (uploadError) throw uploadError;

        // 5. 公開 URL 取得
        const { data: urlData } = supabase.storage
          .from("avatars")
          .getPublicUrl(fileName);

        // 6. プロフィール更新
        const { error: updateError } = await supabase
          .from("user_profiles")
          .update({
            avatar_url: urlData.publicUrl,
            updated_at: new Date().toISOString(),
          })
          .eq("id", user.id);

        if (updateError) throw updateError;

        return { success: true, data: { avatarUrl: urlData.publicUrl } };
      } catch (error) {
        return {
          success: false,
          error: {
            code: "avatar/upload-failed",
            message:
              error instanceof Error
                ? error.message
                : "Failed to upload avatar",
          },
        };
      }
    },
  );

  // avatar:use-provider - プロバイダーアバター使用
  ipcMain.handle(
    IPC_CHANNELS.AVATAR_USE_PROVIDER,
    async (
      _,
      provider: OAuthProvider,
    ): Promise<IPCResponse<{ avatarUrl: string }>> => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          throw new Error("Not authenticated");
        }

        // プロバイダー情報からアバター URL 取得
        const identity = user.identities?.find((i) => i.provider === provider);

        if (!identity?.identity_data?.avatar_url) {
          throw new Error(`No avatar available from ${provider}`);
        }

        const avatarUrl = identity.identity_data.avatar_url;

        // プロフィール更新
        const { error } = await supabase
          .from("user_profiles")
          .update({
            avatar_url: avatarUrl,
            updated_at: new Date().toISOString(),
          })
          .eq("id", user.id);

        if (error) throw error;

        return { success: true, data: { avatarUrl } };
      } catch (error) {
        return {
          success: false,
          error: {
            code: "avatar/use-provider-failed",
            message:
              error instanceof Error
                ? error.message
                : "Failed to use provider avatar",
          },
        };
      }
    },
  );

  // avatar:remove - アバター削除
  ipcMain.handle(
    IPC_CHANNELS.AVATAR_REMOVE,
    async (): Promise<IPCResponse<void>> => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          throw new Error("Not authenticated");
        }

        // Storage から削除
        await supabase.storage.from("avatars").remove([`${user.id}.webp`]);

        // プロフィール更新（null に設定）
        const { error } = await supabase
          .from("user_profiles")
          .update({
            avatar_url: null,
            updated_at: new Date().toISOString(),
          })
          .eq("id", user.id);

        if (error) throw error;

        return { success: true };
      } catch (error) {
        return {
          success: false,
          error: {
            code: "avatar/remove-failed",
            message:
              error instanceof Error
                ? error.message
                : "Failed to remove avatar",
          },
        };
      }
    },
  );
}
```

### 6.4 設定ハンドラー

```typescript
// apps/desktop/src/main/ipc/settingsHandlers.ts

import { ipcMain } from "electron";
import { IPC_CHANNELS } from "../../preload/channels";
import { tursoClient } from "../services/turso";
import { userSettings } from "@repo/shared/infrastructure/database/schema";
import { eq } from "drizzle-orm";
import type { IPCResponse } from "@repo/shared/types/ipc/common";
import type {
  UserSettings,
  SettingsUpdateFields,
} from "@repo/shared/types/ipc/settings";

/**
 * 設定関連 IPC ハンドラーを登録
 */
export function registerSettingsHandlers(): void {
  // settings:get - 設定取得
  ipcMain.handle(
    IPC_CHANNELS.SETTINGS_GET,
    async (): Promise<IPCResponse<UserSettings>> => {
      try {
        // ユーザー ID 取得（Supabase から）
        const { supabase } = await import("../services/supabase");
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          throw new Error("Not authenticated");
        }

        // Turso から設定取得
        const result = await tursoClient
          .select()
          .from(userSettings)
          .where(eq(userSettings.userId, user.id))
          .get();

        if (!result) {
          // デフォルト設定を作成
          const defaultSettings: UserSettings = {
            id: crypto.randomUUID(),
            userId: user.id,
            themeMode: "system",
            language: "ja",
            notificationsEnabled: true,
            autoSyncEnabled: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };

          await tursoClient.insert(userSettings).values({
            id: defaultSettings.id,
            userId: defaultSettings.userId,
            themeMode: defaultSettings.themeMode,
            language: defaultSettings.language,
            notificationsEnabled: defaultSettings.notificationsEnabled,
            autoSyncEnabled: defaultSettings.autoSyncEnabled,
          });

          return { success: true, data: defaultSettings };
        }

        return {
          success: true,
          data: {
            id: result.id,
            userId: result.userId,
            themeMode: result.themeMode as UserSettings["themeMode"],
            language: result.language as UserSettings["language"],
            notificationsEnabled: result.notificationsEnabled ?? true,
            autoSyncEnabled: result.autoSyncEnabled ?? true,
            createdAt: result.createdAt ?? "",
            updatedAt: result.updatedAt ?? "",
          },
        };
      } catch (error) {
        return {
          success: false,
          error: {
            code: "settings/get-failed",
            message:
              error instanceof Error ? error.message : "Failed to get settings",
          },
        };
      }
    },
  );

  // settings:update - 設定更新
  ipcMain.handle(
    IPC_CHANNELS.SETTINGS_UPDATE,
    async (
      _,
      updates: SettingsUpdateFields,
    ): Promise<IPCResponse<UserSettings>> => {
      try {
        const { supabase } = await import("../services/supabase");
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          throw new Error("Not authenticated");
        }

        // 更新実行
        await tursoClient
          .update(userSettings)
          .set({
            ...(updates.themeMode !== undefined && {
              themeMode: updates.themeMode,
            }),
            ...(updates.language !== undefined && {
              language: updates.language,
            }),
            ...(updates.notificationsEnabled !== undefined && {
              notificationsEnabled: updates.notificationsEnabled,
            }),
            ...(updates.autoSyncEnabled !== undefined && {
              autoSyncEnabled: updates.autoSyncEnabled,
            }),
            updatedAt: new Date().toISOString(),
          })
          .where(eq(userSettings.userId, user.id));

        // 更新後のデータを取得
        const result = await tursoClient
          .select()
          .from(userSettings)
          .where(eq(userSettings.userId, user.id))
          .get();

        if (!result) {
          throw new Error("Settings not found after update");
        }

        return {
          success: true,
          data: {
            id: result.id,
            userId: result.userId,
            themeMode: result.themeMode as UserSettings["themeMode"],
            language: result.language as UserSettings["language"],
            notificationsEnabled: result.notificationsEnabled ?? true,
            autoSyncEnabled: result.autoSyncEnabled ?? true,
            createdAt: result.createdAt ?? "",
            updatedAt: result.updatedAt ?? "",
          },
        };
      } catch (error) {
        return {
          success: false,
          error: {
            code: "settings/update-failed",
            message:
              error instanceof Error
                ? error.message
                : "Failed to update settings",
          },
        };
      }
    },
  );
}
```

---

## 7. Renderer側使用例

### 7.1 認証フック

```typescript
// apps/desktop/src/renderer/hooks/useAuth.ts

import { useCallback, useEffect } from "react";
import { create } from "zustand";
import type {
  AuthState,
  OAuthProvider,
  Session,
} from "@repo/shared/types/ipc/auth";

interface AuthStore {
  state: AuthState;
  session: Session | null;
  isLoading: boolean;
  setState: (state: AuthState) => void;
  setSession: (session: Session | null) => void;
  setLoading: (loading: boolean) => void;
}

const useAuthStore = create<AuthStore>((set) => ({
  state: { authenticated: false },
  session: null,
  isLoading: true,
  setState: (state) => set({ state }),
  setSession: (session) => set({ session }),
  setLoading: (isLoading) => set({ isLoading }),
}));

export function useAuth() {
  const { state, session, isLoading, setState, setSession, setLoading } =
    useAuthStore();

  // 初期化
  useEffect(() => {
    const initialize = async () => {
      const response = await window.electronAPI.auth.getSession();
      if (response.success && response.data) {
        setSession(response.data);
        setState({ authenticated: true, user: response.data.user });
      } else {
        setState({ authenticated: false });
      }
      setLoading(false);
    };

    initialize();

    // 認証状態変更をリッスン
    const unsubscribe = window.electronAPI.auth.onAuthStateChange(
      (newState) => {
        setState(newState);
        if (!newState.authenticated) {
          setSession(null);
        }
      },
    );

    return unsubscribe;
  }, [setState, setSession, setLoading]);

  // ログイン
  const login = useCallback(
    async (provider: OAuthProvider) => {
      setLoading(true);
      const response = await window.electronAPI.auth.login(provider);
      if (!response.success) {
        setLoading(false);
        throw new Error(response.error?.message ?? "Login failed");
      }
      // コールバックで状態が更新される
    },
    [setLoading],
  );

  // ログアウト
  const logout = useCallback(async () => {
    const response = await window.electronAPI.auth.logout();
    if (!response.success) {
      throw new Error(response.error?.message ?? "Logout failed");
    }
  }, []);

  return {
    state,
    session,
    isLoading,
    isAuthenticated: state.authenticated,
    user: state.user,
    login,
    logout,
  };
}
```

### 7.2 プロフィールフック

```typescript
// apps/desktop/src/renderer/hooks/useProfile.ts

import { useCallback, useState } from "react";
import type {
  UserProfile,
  ProfileUpdateFields,
  LinkedProvider,
} from "@repo/shared/types/ipc/profile";
import type { OAuthProvider } from "@repo/shared/types/ipc/auth";

export function useProfile() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [providers, setProviders] = useState<LinkedProvider[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // プロフィール取得
  const fetchProfile = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await window.electronAPI.profile.get();
      if (response.success && response.data) {
        setProfile(response.data);
      } else {
        throw new Error(response.error?.message ?? "Failed to fetch profile");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setIsLoading(false);
    }
  }, []);

  // プロフィール更新
  const updateProfile = useCallback(async (updates: ProfileUpdateFields) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await window.electronAPI.profile.update(updates);
      if (response.success && response.data) {
        setProfile(response.data);
        return response.data;
      } else {
        throw new Error(response.error?.message ?? "Failed to update profile");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 連携プロバイダー取得
  const fetchProviders = useCallback(async () => {
    try {
      const response = await window.electronAPI.profile.getProviders();
      if (response.success && response.data) {
        setProviders(response.data);
      }
    } catch (err) {
      console.error("Failed to fetch providers:", err);
    }
  }, []);

  // アバターアップロード
  const uploadAvatar = useCallback(
    async (filePath: string) => {
      setIsLoading(true);
      try {
        const response = await window.electronAPI.avatar.upload(filePath);
        if (response.success && response.data) {
          await fetchProfile(); // プロフィール再取得
          return response.data.avatarUrl;
        } else {
          throw new Error(response.error?.message ?? "Failed to upload avatar");
        }
      } finally {
        setIsLoading(false);
      }
    },
    [fetchProfile],
  );

  // プロバイダーアバター使用
  const useProviderAvatar = useCallback(
    async (provider: OAuthProvider) => {
      setIsLoading(true);
      try {
        const response = await window.electronAPI.avatar.useProvider(provider);
        if (response.success && response.data) {
          await fetchProfile();
          return response.data.avatarUrl;
        } else {
          throw new Error(
            response.error?.message ?? "Failed to use provider avatar",
          );
        }
      } finally {
        setIsLoading(false);
      }
    },
    [fetchProfile],
  );

  // アバター削除
  const removeAvatar = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await window.electronAPI.avatar.remove();
      if (response.success) {
        await fetchProfile();
      } else {
        throw new Error(response.error?.message ?? "Failed to remove avatar");
      }
    } finally {
      setIsLoading(false);
    }
  }, [fetchProfile]);

  return {
    profile,
    providers,
    isLoading,
    error,
    fetchProfile,
    updateProfile,
    fetchProviders,
    uploadAvatar,
    useProviderAvatar,
    removeAvatar,
  };
}
```

---

## 8. エラーコード一覧

| コード                       | 説明                         | 復旧可能 |
| ---------------------------- | ---------------------------- | -------- |
| `auth/login-failed`          | ログイン失敗                 | Yes      |
| `auth/logout-failed`         | ログアウト失敗               | Yes      |
| `auth/session-failed`        | セッション取得失敗           | Yes      |
| `auth/refresh-failed`        | トークン更新失敗             | No       |
| `profile/get-failed`         | プロフィール取得失敗         | Yes      |
| `profile/update-failed`      | プロフィール更新失敗         | Yes      |
| `profile/providers-failed`   | プロバイダー一覧取得失敗     | Yes      |
| `profile/link-failed`        | プロバイダー連携失敗         | Yes      |
| `avatar/upload-failed`       | アバターアップロード失敗     | Yes      |
| `avatar/use-provider-failed` | プロバイダーアバター使用失敗 | Yes      |
| `avatar/remove-failed`       | アバター削除失敗             | Yes      |
| `settings/get-failed`        | 設定取得失敗                 | Yes      |
| `settings/update-failed`     | 設定更新失敗                 | Yes      |

---

## 9. セキュリティ考慮事項

### 9.1 IPC チャネル制限

- **ホワイトリスト方式**: 許可されたチャネルのみ通信可能
- **Preload でのバリデーション**: 不正チャネルはエラー

### 9.2 入力バリデーション

- **Main Process でのバリデーション**: すべての入力を検証
- **型チェック**: TypeScript の型定義で安全性確保

### 9.3 エラー情報

- **機密情報の非露出**: エラーメッセージに内部情報を含めない
- **標準化されたエラーコード**: デバッグ可能かつ安全

---

## 10. 参考資料

- [Electron IPC](https://www.electronjs.org/docs/latest/tutorial/ipc)
- [Electron Context Isolation](https://www.electronjs.org/docs/latest/tutorial/context-isolation)
- [Electron Security](https://www.electronjs.org/docs/latest/tutorial/security)
