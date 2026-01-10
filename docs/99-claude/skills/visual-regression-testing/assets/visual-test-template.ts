/**
 * 視覚的回帰テストテンプレート
 *
 * このテンプレートは、Playwright視覚的回帰テストの基本構造とベストプラクティスを提供します。
 *
 * 使用方法:
 * 1. このファイルをコピーして、プロジェクトのtests/visual/ディレクトリに配置
 * 2. {{変数}}を実際の値に置き換え
 * 3. 必要に応じてカスタマイズ
 */

import { test, expect, devices } from "@playwright/test";
// {{FIXTURE_IMPORT}} 例: import { test, expect } from '../fixtures/test-data-fixtures';

// ==============================================================================
// テストスイート: {{TEST_SUITE_NAME}} の視覚的回帰テスト
// ==============================================================================

test.describe("Visual: {{TEST_SUITE_NAME}}", () => {
  // このテストスイートに@visualタグを付与（フィルタリング用）
  test.use({ tag: "@visual" });

  // ----------------------------------------------------------------------------
  // 設定: タイムアウトとリトライ
  // ----------------------------------------------------------------------------

  test.setTimeout(60000); // 視覚的テストは時間がかかる場合がある

  test.describe.configure({
    retries: process.env.CI ? 2 : 0, // CI環境のみリトライ
  });

  // ----------------------------------------------------------------------------
  // 共通の前処理
  // ----------------------------------------------------------------------------

  test.beforeEach(async ({ page }) => {
    // ✅ ベストプラクティス: アニメーションを無効化
    await page.addStyleTag({
      content: `
        *, *::before, *::after {
          animation-duration: 0s !important;
          animation-delay: 0s !important;
          transition-duration: 0s !important;
          transition-delay: 0s !important;
        }
      `,
    });

    // {{ADDITIONAL_SETUP}}
    // 例: 時刻の固定化、データのSeeding
  });

  // ----------------------------------------------------------------------------
  // パターン1: 全ページスクリーンショット
  // ----------------------------------------------------------------------------

  test("{{PAGE_NAME}} - 全ページ", async ({ page }) => {
    await page.goto("{{PAGE_URL}}"); // 例: '/dashboard'

    // ✅ 推奨: ページの読み込み完了を待つ
    await page.waitForLoadState("networkidle");

    // 遅延読み込み画像がある場合
    await page.evaluate(async () => {
      const images = Array.from(
        document.querySelectorAll('img[loading="lazy"]'),
      );
      for (const img of images) {
        img.scrollIntoView();
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
    });

    // 全ページスクリーンショット
    await expect(page).toHaveScreenshot("{{PAGE_NAME}}-full-page.png", {
      fullPage: true,
      animations: "disabled",
    });
  });

  // ----------------------------------------------------------------------------
  // パターン2: ビューポートスクリーンショット
  // ----------------------------------------------------------------------------

  test("{{PAGE_NAME}} - ファーストビュー", async ({ page }) => {
    await page.goto("{{PAGE_URL}}");
    await page.waitForLoadState("networkidle");

    // ビューポート内のみのスクリーンショット
    await expect(page).toHaveScreenshot("{{PAGE_NAME}}-viewport.png", {
      fullPage: false, // デフォルト
      animations: "disabled",
    });
  });

  // ----------------------------------------------------------------------------
  // パターン3: 要素スクリーンショット
  // ----------------------------------------------------------------------------

  test("{{COMPONENT_NAME}} コンポーネント", async ({ page }) => {
    await page.goto("{{PAGE_URL}}");
    await page.waitForLoadState("networkidle");

    // 特定の要素のみスクリーンショット
    const component = page.locator('[data-testid="{{COMPONENT_ID}}"]');

    // 要素が表示されるまで待つ
    await expect(component).toBeVisible();

    await expect(component).toHaveScreenshot("{{COMPONENT_NAME}}.png", {
      animations: "disabled",
    });
  });

  // ----------------------------------------------------------------------------
  // パターン4: 動的コンテンツのマスキング
  // ----------------------------------------------------------------------------

  test("{{PAGE_NAME}} - 動的コンテンツをマスキング", async ({ page }) => {
    await page.goto("{{PAGE_URL}}");
    await page.waitForLoadState("networkidle");

    // ✅ ベストプラクティス: 動的コンテンツをマスキング
    await expect(page).toHaveScreenshot("{{PAGE_NAME}}-masked.png", {
      fullPage: true,
      animations: "disabled",
      mask: [
        // 時刻表示
        page.locator('[data-testid="current-time"]'),
        // ユーザーアバター
        page.locator(".user-avatar"),
        // リアルタイムグラフ
        page.locator('[data-testid="live-chart"]'),
        // {{ADDITIONAL_MASKS}}
      ],
    });
  });

  // ----------------------------------------------------------------------------
  // パターン5: レスポンシブデザインテスト
  // ----------------------------------------------------------------------------

  const viewports = [
    { name: "mobile", width: 375, height: 667 },
    { name: "tablet", width: 768, height: 1024 },
    { name: "desktop", width: 1920, height: 1080 },
  ];

  for (const viewport of viewports) {
    test(`{{PAGE_NAME}} - ${viewport.name}`, async ({ page }) => {
      await page.setViewportSize({
        width: viewport.width,
        height: viewport.height,
      });

      await page.goto("{{PAGE_URL}}");
      await page.waitForLoadState("networkidle");

      await expect(page).toHaveScreenshot(
        `{{PAGE_NAME}}-${viewport.name}.png`,
        {
          fullPage: true,
          animations: "disabled",
        },
      );
    });
  }

  // ----------------------------------------------------------------------------
  // パターン6: インタラクティブ状態のテスト
  // ----------------------------------------------------------------------------

  test("{{COMPONENT_NAME}} - ホバー状態", async ({ page }) => {
    await page.goto("{{PAGE_URL}}");

    const button = page.locator('[data-testid="{{BUTTON_ID}}"]');

    // ホバー状態にする
    await button.hover();

    // ホバー状態のスクリーンショット
    await expect(button).toHaveScreenshot("{{COMPONENT_NAME}}-hover.png", {
      animations: "disabled",
    });
  });

  test("{{COMPONENT_NAME}} - フォーカス状態", async ({ page }) => {
    await page.goto("{{PAGE_URL}}");

    const input = page.locator('[data-testid="{{INPUT_ID}}"]');

    // フォーカス状態にする
    await input.focus();

    await expect(input).toHaveScreenshot("{{COMPONENT_NAME}}-focus.png", {
      animations: "disabled",
    });
  });

  test("{{COMPONENT_NAME}} - アクティブ状態", async ({ page }) => {
    await page.goto("{{PAGE_URL}}");

    const button = page.locator('[data-testid="{{BUTTON_ID}}"]');

    // アクティブ状態にする（クリック中）
    await button.dispatchEvent("mousedown");

    await expect(button).toHaveScreenshot("{{COMPONENT_NAME}}-active.png", {
      animations: "disabled",
    });
  });

  // ----------------------------------------------------------------------------
  // パターン7: 時刻固定化
  // ----------------------------------------------------------------------------

  test("{{PAGE_NAME}} - 固定時刻", async ({ page }) => {
    // ✅ ベストプラクティス: 時刻を固定
    await page.addInitScript(() => {
      const mockDate = new Date("2024-01-01T12:00:00Z");

      // @ts-ignore
      Date = class extends Date {
        constructor(...args) {
          if (args.length === 0) {
            super(mockDate);
          } else {
            super(...args);
          }
        }

        static now() {
          return mockDate.getTime();
        }
      };
    });

    await page.goto("{{PAGE_URL}}");
    await page.waitForLoadState("networkidle");

    // 時刻が固定されているため、一貫したスクリーンショット
    await expect(page).toHaveScreenshot("{{PAGE_NAME}}-fixed-time.png", {
      fullPage: true,
      animations: "disabled",
    });
  });

  // ----------------------------------------------------------------------------
  // パターン8: カスタム閾値
  // ----------------------------------------------------------------------------

  test("{{COMPONENT_NAME}} - カスタム閾値", async ({ page }) => {
    await page.goto("{{PAGE_URL}}");

    const logo = page.locator('[data-testid="logo"]');

    // ロゴは厳格な閾値（ほぼ完全一致）
    await expect(logo).toHaveScreenshot("logo.png", {
      maxDiffPixels: 10, // 最大10ピクセルの差異
      threshold: 0.01, // 1%の差異まで許容
      animations: "disabled",
    });
  });

  test("{{COMPONENT_NAME}} - 緩い閾値", async ({ page }) => {
    await page.goto("{{PAGE_URL}}");

    const chart = page.locator('[data-testid="chart"]');

    // グラフは緩い閾値（多少の差異を許容）
    await expect(chart).toHaveScreenshot("chart.png", {
      maxDiffPixels: 500,
      threshold: 0.3, // 30%の差異まで許容
      animations: "disabled",
    });
  });

  // ----------------------------------------------------------------------------
  // パターン9: デバイスエミュレーション
  // ----------------------------------------------------------------------------

  const deviceTests = [
    { name: "iPhone 12", device: devices["iPhone 12"] },
    { name: "iPad Pro", device: devices["iPad Pro"] },
    { name: "Desktop Chrome", device: devices["Desktop Chrome"] },
  ];

  for (const { name, device } of deviceTests) {
    test.describe(`デバイス: ${name}`, () => {
      test.use(device);

      test("{{PAGE_NAME}}", async ({ page }) => {
        await page.goto("{{PAGE_URL}}");
        await page.waitForLoadState("networkidle");

        await expect(page).toHaveScreenshot(
          `{{PAGE_NAME}}-${name.replace(/\s+/g, "-").toLowerCase()}.png`,
          {
            fullPage: true,
            animations: "disabled",
          },
        );
      });
    });
  }

  // ----------------------------------------------------------------------------
  // パターン10: ダークモード
  // ----------------------------------------------------------------------------

  test("{{PAGE_NAME}} - ダークモード", async ({ page }) => {
    // ダークモードを有効化
    await page.emulateMedia({ colorScheme: "dark" });

    await page.goto("{{PAGE_URL}}");
    await page.waitForLoadState("networkidle");

    await expect(page).toHaveScreenshot("{{PAGE_NAME}}-dark.png", {
      fullPage: true,
      animations: "disabled",
    });
  });

  test("{{PAGE_NAME}} - ライトモード", async ({ page }) => {
    // ライトモードを有効化
    await page.emulateMedia({ colorScheme: "light" });

    await page.goto("{{PAGE_URL}}");
    await page.waitForLoadState("networkidle");

    await expect(page).toHaveScreenshot("{{PAGE_NAME}}-light.png", {
      fullPage: true,
      animations: "disabled",
    });
  });
});

// ==============================================================================
// ベストプラクティスチェックリスト
// ==============================================================================

/**
 * ✅ このテンプレートが適用しているベストプラクティス:
 *
 * 1. **アニメーション無効化**
 *    - beforeEachでCSSアニメーションを無効化
 *    - toHaveScreenshotオプションでも`animations: 'disabled'`
 *
 * 2. **適切な待機**
 *    - waitForLoadState('networkidle')でページ読み込み完了を待つ
 *    - 遅延読み込み画像の読み込みを待つ
 *
 * 3. **動的コンテンツのマスキング**
 *    - 時刻、ユーザーアバター、リアルタイムデータをマスク
 *
 * 4. **レスポンシブ対応**
 *    - 複数のビューポートでテスト
 *    - デバイスエミュレーションを使用
 *
 * 5. **時刻固定化**
 *    - addInitScriptでDateオブジェクトをモック
 *
 * 6. **適切な閾値**
 *    - コンポーネントごとに適切な閾値を設定
 *
 * 7. **インタラクティブ状態**
 *    - ホバー、フォーカス、アクティブ状態をテスト
 *
 * 8. **命名規則**
 *    - {page}-{device}-{state}.png形式で統一
 *
 * 9. **ダークモード対応**
 *    - colorSchemeでライト/ダークモードを切り替え
 *
 * 10. **@visualタグ**
 *     - test.use({ tag: '@visual' })でフィルタリング可能
 */

/**
 * ❌ このテンプレートが避けているアンチパターン:
 *
 * 1. **固定待機時間**
 *    - waitForTimeout → waitForLoadState
 *
 * 2. **動的コンテンツを含む**
 *    - 時刻、ランダムデータ → マスキングまたは固定化
 *
 * 3. **アニメーション含む**
 *    - アニメーション中のスクリーンショット → 無効化
 *
 * 4. **曖昧な命名**
 *    - screenshot1.png → page-desktop-default.png
 *
 * 5. **環境依存**
 *    - ローカル固有の設定 → 環境変数で制御
 */

/**
 * 使用例:
 *
 * ```bash
 * # すべての視覚的テストを実行
 * pnpm playwright test --grep @visual
 *
 * # 特定のテストファイルのみ実行
 * pnpm playwright test tests/visual/homepage.spec.ts
 *
 * # ベースラインを更新
 * pnpm playwright test --update-snapshots
 *
 * # UIモードで差分を確認
 * pnpm playwright test --ui
 * ```
 */
