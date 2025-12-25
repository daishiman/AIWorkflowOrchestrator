import { defineConfig, devices } from "@playwright/test";

/**
 * Playwright E2E テスト設定
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: "html",

  // E2E環境用のグローバルセットアップ（認証モック初期化）
  globalSetup: require.resolve("./e2e/global-setup"),

  use: {
    // Electron アプリのテスト用 base URL（5173が使用中の場合5174）
    baseURL: process.env.PLAYWRIGHT_BASE_URL || "http://localhost:5173",
    trace: "on-first-retry",
    screenshot: "only-on-failure",

    // E2E環境フラグを設定
    storageState: "./e2e/.auth/user.json",
  },

  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],

  // Electron Renderer の開発サーバー（Vite）
  // NOTE: electron-vite devはElectronアプリを起動するが、
  // PlaywrightテストではRendererのみをテストするためviteを直接起動
  webServer: {
    command: "npx vite --config vite.e2e.config.ts",
    url: "http://localhost:5173",
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
});
