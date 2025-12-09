# authSlice状態構造設計書

## 概要

| 項目           | 内容                       |
| -------------- | -------------------------- |
| ドキュメントID | DES-STATE                  |
| 対象タスク     | T-01-4: 状態構造設計       |
| 作成日         | 2025-12-09                 |
| ステータス     | 完了                       |
| 要件定義書     | spec-state-minimization.md |

## 設計目的

Renderer Processで保持する認証状態からトークン情報を排除し、XSS攻撃によるトークン漏洩リスクを軽減する。Main Processでのみトークンを管理し、Rendererには最小限の状態のみを渡す設計とする。

## 現状のコード構造

```typescript
// apps/desktop/src/renderer/store/slices/authSlice.ts
export interface AuthSlice {
  // State
  isAuthenticated: boolean;
  isLoading: boolean;
  authUser: AuthUser | null;
  session: AuthSession | null; // ⚠️ トークン情報を含む
  profile: UserProfile | null;
  linkedProviders: LinkedProvider[];
  isOffline: boolean;
  authError: string | null;
  // ...
}
```

```typescript
// apps/desktop/src/preload/types.ts
export interface AuthSession {
  user: AuthUser;
  accessToken: string; // ⚠️ 機密情報
  refreshToken: string; // ⚠️ 機密情報
  expiresAt: number;
  isOffline: boolean;
}
```

### 問題点

1. `session`プロパティに`accessToken`と`refreshToken`が含まれている
2. Renderer DevToolsでトークンが閲覧可能
3. XSS攻撃でトークンが窃取される可能性
4. Main Processからの`AUTH_STATE_CHANGED`イベントでトークンを送信している

## ファイル構成

変更が必要なファイル:

```
apps/desktop/src/
├── main/
│   ├── index.ts                     # AUTH_STATE_CHANGEDの変更
│   └── ipc/
│       └── authHandlers.ts          # セッション取得レスポンスの変更
├── preload/
│   └── types.ts                     # 型定義の変更
└── renderer/
    └── store/
        └── slices/
            └── authSlice.ts         # 状態構造の変更

packages/shared/
└── types/
    └── auth.ts                      # 共通型の変更
```

## 新しい型定義

### Renderer用のセッション情報（トークンなし）

```typescript
// packages/shared/types/auth.ts

/**
 * Renderer Process用セッション情報（トークンなし）
 * XSS対策として、トークンは含めない
 */
export interface RendererSession {
  user: AuthUser;
  expiresAt: number;
  isOffline: boolean;
}

/**
 * Main Process内部用セッション情報（トークンあり）
 * Main Process内でのみ使用し、IPCで送信しない
 */
export interface MainProcessSession {
  user: AuthUser;
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
  isOffline: boolean;
}

/**
 * AuthSession型のエイリアス
 * @deprecated RendererSessionを使用してください
 */
export type AuthSession = RendererSession;
```

### 認証状態変更イベント（トークンなし）

```typescript
// packages/shared/types/auth.ts

/**
 * 認証状態変更イベントペイロード（トークンなし）
 */
export interface AuthStateChangedPayload {
  authenticated: boolean;
  user?: AuthUser;
  expiresAt?: number;
  isOffline?: boolean;
  error?: string;
}
```

### preload/types.ts の変更

```typescript
// apps/desktop/src/preload/types.ts

// Before
export interface AuthSession {
  user: AuthUser;
  accessToken: string; // 削除
  refreshToken: string; // 削除
  expiresAt: number;
  isOffline: boolean;
}

export interface AuthState {
  authenticated: boolean;
  user?: AuthUser;
  tokens?: {
    // 削除
    accessToken: string;
    refreshToken: string;
  };
  error?: string;
  isOffline?: boolean;
}

// After
export interface AuthSession {
  user: AuthUser;
  expiresAt: number;
  isOffline: boolean;
  // ❌ accessToken は含めない
  // ❌ refreshToken は含めない
}

export interface AuthState {
  authenticated: boolean;
  user?: AuthUser;
  expiresAt?: number;
  isOffline?: boolean;
  error?: string;
  // ❌ tokens は含めない
}
```

## 新しい状態構造

### authSlice.ts の変更

```typescript
// apps/desktop/src/renderer/store/slices/authSlice.ts

export interface AuthSlice {
  // State (トークンなし)
  isAuthenticated: boolean;
  isLoading: boolean;
  authUser: AuthUser | null;
  // session: AuthSession | null;  // 削除または変更
  sessionExpiresAt: number | null; // 有効期限のみ保持
  profile: UserProfile | null;
  linkedProviders: LinkedProvider[];
  isOffline: boolean;
  authError: string | null;

  // Actions
  login: (provider: OAuthProvider) => Promise<void>;
  logout: () => Promise<void>;
  initializeAuth: () => Promise<void>;
  refreshSession: () => Promise<void>;
  updateProfile: (updates: {
    displayName?: string;
    avatarUrl?: string | null;
  }) => Promise<void>;
  fetchProfile: () => Promise<void>;
  fetchLinkedProviders: () => Promise<void>;
  linkProvider: (provider: OAuthProvider) => Promise<void>;
  setAuthError: (error: string | null) => void;
  clearAuth: () => void;
}
```

### 状態変更の詳細

| 変更前    | 変更後             | 理由                       |
| --------- | ------------------ | -------------------------- |
| `session` | 削除               | トークン情報を含むため     |
| -         | `sessionExpiresAt` | セッション有効期限のみ保持 |

## Main Processとの連携フロー

### 変更前のフロー

```
Main Process                          Renderer Process
     │                                      │
     │ AUTH_STATE_CHANGED                   │
     │ {                                    │
     │   authenticated: true,               │
     │   user: {...},                       │
     │   tokens: {                          │
     │     accessToken: "xxx",   ⚠️ 機密    │
     │     refreshToken: "yyy"  ⚠️ 機密    │
     │   }                                  │
     │ }                                    │
     ├─────────────────────────────────────►│
     │                                      │ → session に保存
```

### 変更後のフロー

```
Main Process                          Renderer Process
     │                                      │
     │ AUTH_STATE_CHANGED                   │
     │ {                                    │
     │   authenticated: true,               │
     │   user: {...},                       │
     │   expiresAt: 1234567890,            │
     │   isOffline: false                   │
     │   // ❌ tokens なし                  │
     │ }                                    │
     ├─────────────────────────────────────►│
     │                                      │ → authUser, sessionExpiresAt に保存
```

## 実装詳細

### Main Process: handleAuthCallback の変更

```typescript
// apps/desktop/src/main/index.ts

async function handleAuthCallback(url: string): Promise<void> {
  // ... 既存のトークン取得処理 ...

  // リフレッシュトークンをSecureStorageに保存
  const secureStorage = createSecureStorage();
  await secureStorage.storeRefreshToken(refreshToken);

  // ユーザー情報を変換
  const user = toAuthUser(data.session.user);

  // Renderer に認証データを送信（トークンなし）
  mainWindowRef.webContents.send(IPC_CHANNELS.AUTH_STATE_CHANGED, {
    authenticated: true,
    user,
    expiresAt: data.session.expires_at,
    isOffline: false,
    // ❌ tokens は送信しない
  });
}
```

### Main Process: authHandlers.ts の変更

```typescript
// apps/desktop/src/main/ipc/authHandlers.ts

// auth:get-session - セッション取得
ipcMain.handle(
  IPC_CHANNELS.AUTH_GET_SESSION,
  async (): Promise<IPCResponse<RendererSession | null>> => {
    // ... 既存のセッション取得処理 ...

    return {
      success: true,
      data: {
        user,
        expiresAt: data.session.expires_at ?? Date.now() / 1000 + 3600,
        isOffline: !isOnline,
        // ❌ accessToken は返さない
        // ❌ refreshToken は返さない
      },
    };
  },
);

// auth:refresh - トークン更新
ipcMain.handle(
  IPC_CHANNELS.AUTH_REFRESH,
  async (): Promise<IPCResponse<RendererSession>> => {
    // ... 既存のリフレッシュ処理 ...

    // Main Process内でトークンを保存
    await secureStorage.storeRefreshToken(data.session.refresh_token);

    return {
      success: true,
      data: {
        user,
        expiresAt: data.session.expires_at ?? Date.now() / 1000 + 3600,
        isOffline: false,
        // ❌ accessToken は返さない
        // ❌ refreshToken は返さない
      },
    };
  },
);
```

### Renderer Process: authSlice.ts の変更

```typescript
// apps/desktop/src/renderer/store/slices/authSlice.ts

export const createAuthSlice: StateCreator<AuthSlice, [], [], AuthSlice> = (
  set,
  get,
) => ({
  // Initial state
  isAuthenticated: false,
  isLoading: true,
  authUser: null,
  // session: null,  // 削除
  sessionExpiresAt: null, // 追加
  profile: null,
  linkedProviders: [],
  isOffline: false,
  authError: null,

  // initializeAuth の変更
  initializeAuth: async () => {
    // ... 既存のセッション取得処理 ...

    if (response.success && response.data) {
      set({
        isAuthenticated: true,
        authUser: response.data.user,
        // session: response.data,  // 削除
        sessionExpiresAt: response.data.expiresAt, // 追加
        isOffline: response.data.isOffline,
        isLoading: false,
      });
    }

    // onAuthStateChanged の変更
    if (window.electronAPI.auth.onAuthStateChanged) {
      window.electronAPI.auth.onAuthStateChanged(async (state) => {
        if (state.authenticated && state.user) {
          set({
            isAuthenticated: true,
            authUser: state.user,
            sessionExpiresAt: state.expiresAt ?? null,
            isOffline: state.isOffline ?? false,
            isLoading: false,
          });
          get().fetchProfile();
          get().fetchLinkedProviders();
        } else {
          get().clearAuth();
        }
      });
    }
  },

  // refreshSession の変更
  refreshSession: async () => {
    const response = await window.electronAPI.auth.refresh();

    if (response.success && response.data) {
      set({
        // session: response.data,  // 削除
        sessionExpiresAt: response.data.expiresAt, // 追加
        authUser: response.data.user,
        isOffline: response.data.isOffline,
      });
    }
  },

  // clearAuth の変更
  clearAuth: () => {
    set({
      isAuthenticated: false,
      isLoading: false,
      authUser: null,
      // session: null,  // 削除
      sessionExpiresAt: null, // 追加
      profile: null,
      linkedProviders: [],
      authError: null,
    });
  },
});
```

## 後方互換性

### 移行パス

1. **Phase 1**: 型定義の変更
   - `RendererSession` 型を追加
   - `AuthSession` を `RendererSession` のエイリアスに
   - `AuthState` から `tokens` を削除

2. **Phase 2**: Main Process の変更
   - IPC レスポンスからトークンを除去
   - `AUTH_STATE_CHANGED` イベントからトークンを除去

3. **Phase 3**: Renderer Process の変更
   - `authSlice` から `session` を削除
   - `sessionExpiresAt` を追加
   - トークン参照箇所を修正

### 影響を受けるコード

| ファイル                             | 変更内容                      |
| ------------------------------------ | ----------------------------- |
| `preload/types.ts`                   | AuthSession, AuthState の変更 |
| `packages/shared/types/auth.ts`      | RendererSession 追加          |
| `main/index.ts`                      | handleAuthCallback の変更     |
| `main/ipc/authHandlers.ts`           | IPCレスポンスの変更           |
| `renderer/store/slices/authSlice.ts` | 状態構造の変更                |

### トークン参照の削除

現在 `session.accessToken` を参照している箇所を検索:

```typescript
// 検索パターン
// - session.accessToken
// - session?.accessToken
// - response.data.accessToken
// - state.tokens
```

これらの参照は Main Process からの API 呼び出しに変更する。

## テスト戦略

### テストケース

| テストID  | シナリオ                                | 期待結果                |
| --------- | --------------------------------------- | ----------------------- |
| STATE-T01 | authSlice状態にaccessTokenが含まれない  | プロパティが存在しない  |
| STATE-T02 | authSlice状態にrefreshTokenが含まれない | プロパティが存在しない  |
| STATE-T03 | 認証成功後の状態                        | authUser のみ設定される |
| STATE-T04 | ログアウト後の状態                      | 状態がクリアされる      |
| STATE-T05 | sessionExpiresAtが正しく設定される      | 有効期限が保持される    |

### テストコード例

```typescript
// apps/desktop/src/renderer/store/slices/authSlice.test.ts
import { describe, it, expect, vi, beforeEach } from "vitest";
import { createAuthSlice } from "./authSlice";

describe("authSlice", () => {
  describe("状態構造", () => {
    it("sessionプロパティが存在しない", () => {
      const state = createAuthSlice(vi.fn(), vi.fn(), vi.fn());
      expect("session" in state).toBe(false);
    });

    it("sessionExpiresAtプロパティが存在する", () => {
      const state = createAuthSlice(vi.fn(), vi.fn(), vi.fn());
      expect("sessionExpiresAt" in state).toBe(true);
      expect(state.sessionExpiresAt).toBeNull();
    });
  });

  describe("認証成功時", () => {
    it("authUserのみが設定され、トークン情報は含まれない", async () => {
      // Mock setup
      const mockUser = {
        id: "123",
        email: "test@example.com",
        displayName: "Test User",
        avatarUrl: null,
        provider: "google" as const,
        createdAt: "2024-01-01",
        lastSignInAt: "2024-01-01",
      };

      window.electronAPI = {
        auth: {
          getSession: vi.fn().mockResolvedValue({
            success: true,
            data: {
              user: mockUser,
              expiresAt: 1234567890,
              isOffline: false,
              // ❌ accessToken なし
              // ❌ refreshToken なし
            },
          }),
          checkOnline: vi.fn().mockResolvedValue({ data: { online: true } }),
          onAuthStateChanged: vi.fn(),
        },
      } as never;

      let currentState = {};
      const set = (newState: Record<string, unknown>) => {
        currentState = { ...currentState, ...newState };
      };
      const get = () => currentState;

      const slice = createAuthSlice(set as never, get as never, {} as never);
      await slice.initializeAuth();

      expect(currentState).toHaveProperty("authUser", mockUser);
      expect(currentState).toHaveProperty("sessionExpiresAt", 1234567890);
      expect(currentState).not.toHaveProperty("session");
      expect(Object.keys(currentState)).not.toContain("accessToken");
      expect(Object.keys(currentState)).not.toContain("refreshToken");
    });
  });

  describe("clearAuth", () => {
    it("全ての認証状態がクリアされる", () => {
      let currentState: Record<string, unknown> = {
        isAuthenticated: true,
        authUser: { id: "123" },
        sessionExpiresAt: 1234567890,
      };
      const set = (newState: Record<string, unknown>) => {
        currentState = { ...currentState, ...newState };
      };

      const slice = createAuthSlice(
        set as never,
        (() => currentState) as never,
        {} as never,
      );
      slice.clearAuth();

      expect(currentState).toMatchObject({
        isAuthenticated: false,
        authUser: null,
        sessionExpiresAt: null,
      });
    });
  });
});
```

## セキュリティ考慮事項

### 達成されるセキュリティ効果

| 効果                          | 説明                                       |
| ----------------------------- | ------------------------------------------ |
| XSS攻撃によるトークン窃取防止 | Rendererにトークンが存在しないため窃取不可 |
| DevToolsでのトークン閲覧防止  | 状態にトークンが含まれないため閲覧不可     |
| メモリダンプ対策              | Rendererメモリにトークンが存在しない       |

### 残存するリスク

| リスク                 | 対策                            |
| ---------------------- | ------------------------------- |
| Main Processへの攻撃   | OSレベルのセキュリティに依存    |
| SecureStorage への攻撃 | keytar によるOSキーチェーン保護 |

## 完了条件

- [x] 新しいAuthState型が定義されている
- [x] sessionプロパティからのトークン除去方法が設計されている
- [x] Main Processとの連携フローが設計されている
- [x] 後方互換性の考慮が記述されている

## 関連ドキュメント

- `docs/30-workflows/login-only-auth/spec-state-minimization.md` - 状態最小化要件定義
- `apps/desktop/src/renderer/store/slices/authSlice.ts` - 現在の実装
- `apps/desktop/src/preload/types.ts` - IPC型定義
- `apps/desktop/src/main/ipc/authHandlers.ts` - 認証IPCハンドラー
