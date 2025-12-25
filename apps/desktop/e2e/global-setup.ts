/**
 * Playwright グローバルセットアップ
 *
 * E2Eテスト実行前に認証状態をモックします。
 */

import { chromium, FullConfig } from "@playwright/test";

async function globalSetup(config: FullConfig) {
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  // ベースURLに移動
  const baseURL = config.projects[0]?.use?.baseURL || "http://localhost:5173";
  await page.goto(baseURL);

  // ElectronAPIのモックを注入
  await page.addInitScript(() => {
    // window.electronAPIをモック
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).electronAPI = {
      auth: {
        getSession: async () => ({
          user: {
            id: "e2e-test-user",
            email: "e2e@test.com",
            user_metadata: { full_name: "E2E Test User" },
          },
          session: {
            access_token: "mock-e2e-access-token",
            refresh_token: "mock-e2e-refresh-token",
            expires_at: Date.now() + 3600000,
          },
        }),
        login: async (provider: string) => {
          console.log("[E2E Mock] Login called with provider:", provider);
          return { success: true };
        },
        logout: async () => {
          console.log("[E2E Mock] Logout called");
          return { success: true };
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        onAuthStateChanged: (callback: any) => {
          console.log("[E2E Mock] onAuthStateChanged registered");
          // 即座に認証済み状態を通知
          setTimeout(() => {
            callback({
              authenticated: true,
              user: {
                id: "e2e-test-user",
                email: "e2e@test.com",
                user_metadata: { full_name: "E2E Test User" },
              },
            });
          }, 100);
          return () => {};
        },
      },
      file: {
        selectFiles: async () => [],
        selectFolder: async () => null,
      },
      chatHistory: {
        getSessions: async () => [],
        getMessages: async () => [],
        saveSession: async () => ({ success: true }),
        saveMessage: async () => ({ success: true }),
        deleteSession: async () => ({ success: true }),
      },
    };
  });

  // 認証状態をlocalStorageに保存（バックアップ）
  await page.evaluate(() => {
    const mockAuthState = {
      isAuthenticated: true,
      isLoading: false,
      user: {
        id: "e2e-test-user",
        email: "e2e@test.com",
        user_metadata: { full_name: "E2E Test User" },
      },
      session: {
        access_token: "mock-e2e-access-token",
        refresh_token: "mock-e2e-refresh-token",
        expires_at: Date.now() + 3600000,
      },
    };

    window.localStorage.setItem("auth-storage", JSON.stringify(mockAuthState));
  });

  // ストレージ状態を保存
  await context.storageState({ path: "e2e/.auth/user.json" });

  await context.close();
  await browser.close();
}

export default globalSetup;
