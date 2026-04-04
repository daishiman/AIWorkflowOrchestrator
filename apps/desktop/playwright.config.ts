import { defineConfig, devices } from "@playwright/test";

const isCI = !!process.env.CI;

/**
 * Playwright E2E テスト設定
 *
 * CI/ローカルで自動的にタイムアウト・リトライ・ワーカー数を切り替える。
 * - CI: タイムアウト延長、リトライ2回、シリアル実行
 * - ローカル: 短タイムアウト、リトライなし、並列実行
 *
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: isCI,
  timeout: isCI ? 60_000 : 30_000,
  expect: { timeout: isCI ? 10_000 : 5_000 },
  retries: isCI ? 2 : 0,
  workers: isCI ? 1 : undefined,
  reporter: isCI ? [["github"], ["html", { open: "never" }]] : "html",

  // E2E環境用のグローバルセットアップ（認証モック初期化）
  globalSetup: "./e2e/global-setup.ts",

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
      testIgnore: "**/ui-ux/**",
    },
    {
      name: "ui-ux-layer1",
      testMatch: "**/e2e/ui-ux/layer1-semantic.spec.ts",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "ui-ux-layer2",
      testMatch: "**/e2e/ui-ux/layer2-visual.spec.ts",
      use: {
        ...devices["Desktop Chrome"],
        // Layer 2 の dark-mode 比較を OS テーマから切り離して安定化する
        colorScheme: "dark",
      },
      fullyParallel: false,
    },
  ],

  // Electron Renderer の開発サーバー（Vite）
  // NOTE: electron-vite devはElectronアプリを起動するが、
  // PlaywrightテストではRendererのみをテストするためviteを直接起動
  webServer: {
    command: "npx vite --config vite.e2e.config.ts",
    url: "http://localhost:5173",
    reuseExistingServer: !isCI,
    timeout: 120_000,
  },
});
