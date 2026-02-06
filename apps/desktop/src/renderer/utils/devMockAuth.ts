/**
 * 開発環境用認証モック
 *
 * Worktree環境やE2Eテスト環境で、毎回OAuth認証を行わずに
 * 自動的にモックユーザーでログインする機能を提供します。
 *
 * @module utils/devMockAuth
 */

/// <reference types="vite/client" />

import type { AuthUser, OAuthProvider } from "../../preload/types";

/**
 * 開発モードの判定
 *
 * 以下の条件でtrueを返す：
 * 1. NODE_ENV === 'development'
 * 2. ElectronAPIが利用できない（E2E環境）
 * 3. URLに ?skipAuth=true が含まれる（手動バイパス）
 */
export function isDevMode(): boolean {
  // 本番環境では常にfalse
  if (import.meta.env.PROD) {
    return false;
  }

  // E2E環境フラグ
  if (import.meta.env.VITE_E2E_MODE === "true") {
    return true;
  }

  // ElectronAPIが利用できない = E2E/ブラウザ環境
  if (typeof window !== "undefined" && !window.electronAPI) {
    return true;
  }

  // URLパラメータでの明示的なバイパス
  if (
    typeof window !== "undefined" &&
    window.location.search.includes("skipAuth=true")
  ) {
    return true;
  }

  // localStorage に開発モードフラグがある場合
  if (typeof window !== "undefined") {
    const devFlag = window.localStorage.getItem("dev-skip-auth");
    if (devFlag === "true") {
      return true;
    }
  }

  return false;
}

/**
 * モックユーザーデータ（AuthUser互換）
 */
export type MockUser = AuthUser;

/**
 * モックセッションデータ
 */
export interface MockSession {
  access_token: string;
  refresh_token: string;
  expires_at: number;
}

/**
 * デフォルトのモックユーザー
 *
 * NOTE: 認証機能が復活するまで、実際のユーザー情報を使用
 * 実際のユーザーID: 34d1ff23-db41-4201-9ede-4ba55b6ea202
 */
export const DEFAULT_MOCK_USER: MockUser = {
  id: "34d1ff23-db41-4201-9ede-4ba55b6ea202",
  email: "daishimanju@gmail.com",
  displayName: "Daishi Manju",
  avatarUrl: null,
  provider: "google" as OAuthProvider,
  createdAt: new Date().toISOString(),
  lastSignInAt: new Date().toISOString(),
};

/**
 * デフォルトのモックセッション
 */
export function createMockSession(): MockSession {
  return {
    access_token: "mock-dev-access-token",
    refresh_token: "mock-dev-refresh-token",
    expires_at: Date.now() + 24 * 60 * 60 * 1000, // 24時間後
  };
}

/**
 * モックユーザーとセッションを取得
 *
 * localStorage から保存されたモックデータを読み込むか、
 * デフォルト値を返します。
 */
export function getMockAuthData(): {
  user: MockUser;
  session: MockSession;
} {
  if (typeof window === "undefined") {
    return {
      user: DEFAULT_MOCK_USER,
      session: createMockSession(),
    };
  }

  // localStorage からカスタムモックデータを読み込み
  try {
    const savedUser = window.localStorage.getItem("dev-mock-user");
    const savedSession = window.localStorage.getItem("dev-mock-session");

    if (savedUser && savedSession) {
      return {
        user: JSON.parse(savedUser),
        session: JSON.parse(savedSession),
      };
    }
  } catch (error) {
    console.warn("[DevMockAuth] Failed to load saved mock data:", error);
  }

  // デフォルト値を返す
  return {
    user: DEFAULT_MOCK_USER,
    session: createMockSession(),
  };
}

/**
 * モックデータを localStorage に保存
 *
 * 次回起動時にも同じモックデータを使用できます。
 */
export function saveMockAuthData(user: MockUser, session: MockSession): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.setItem("dev-mock-user", JSON.stringify(user));
    window.localStorage.setItem("dev-mock-session", JSON.stringify(session));
    console.log("[DevMockAuth] Mock data saved to localStorage");
  } catch (error) {
    console.error("[DevMockAuth] Failed to save mock data:", error);
  }
}

/**
 * 開発モードフラグをlocalStorageに保存/削除
 *
 * @param enabled - true: 次回起動時も開発モード / false: 通常モード
 */
export function setDevModeFlag(enabled: boolean): void {
  if (typeof window === "undefined") {
    return;
  }

  if (enabled) {
    window.localStorage.setItem("dev-skip-auth", "true");
    console.log("[DevMockAuth] Dev mode enabled");
  } else {
    window.localStorage.removeItem("dev-skip-auth");
    console.log("[DevMockAuth] Dev mode disabled");
  }
}

/**
 * 開発モードの状態をコンソールに表示
 */
export function logDevModeStatus(): void {
  if (!isDevMode()) {
    return;
  }

  const mockData = getMockAuthData();

  console.group("[DevMockAuth] Development Mode Active");
  console.log("🔧 Authentication is bypassed");
  console.log("👤 Mock User:", mockData.user);
  console.log("🔑 Mock Session:", {
    access_token: mockData.session.access_token,
    expires_at: new Date(mockData.session.expires_at).toLocaleString(),
  });
  console.log(
    "💡 To disable: run `localStorage.removeItem('dev-skip-auth')` and reload",
  );
  console.groupEnd();
}
