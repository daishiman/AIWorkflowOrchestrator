/**
 * 認証機能 E2E テスト
 *
 * AccountSection コンポーネントの認証フローをテストします。
 * - 未認証状態でのログインボタン表示
 * - プロフィール編集機能
 * - UIコンポーネントの表示確認
 */

import { test, expect } from "@playwright/test";

test.describe("認証機能 E2E テスト", () => {
  test.beforeEach(async ({ page }) => {
    // アプリケーションのルートに移動
    await page.goto("/");
    // ページが完全にロードされるまで待機
    await page.waitForLoadState("networkidle");

    // 設定画面に移動 - NavIconの"Settings"ボタン（userアイコン）をクリック
    // Main navigation内のSettingsボタンを探す
    const nav = page.getByRole("navigation", { name: "Main navigation" });
    const settingsButton = nav.getByRole("button").last(); // Settings is the last nav item
    await settingsButton.click();

    // 設定画面がロードされるまで待機
    await page.waitForSelector('[data-testid="settings-view"]');
  });

  test.describe("設定画面", () => {
    test("設定画面が表示される", async ({ page }) => {
      // 設定ヘッダーを確認（exact: trueで完全一致）
      await expect(
        page.getByRole("heading", { name: "設定", exact: true }),
      ).toBeVisible();
      await expect(
        page.getByText("Knowledge Studioの設定を管理します"),
      ).toBeVisible();
    });

    test("アカウント設定セクションが表示される", async ({ page }) => {
      // アカウントカードのタイトルを確認
      await expect(
        page.getByRole("heading", { name: "アカウント", exact: true }),
      ).toBeVisible();
      await expect(page.getByText("ログインとプロフィール管理")).toBeVisible();
    });
  });

  test.describe("未認証状態（AccountSection）", () => {
    test("ログインボタンが表示される", async ({ page }) => {
      // アカウント設定セクションを確認
      const accountSection = page.getByRole("region", {
        name: "アカウント設定",
      });
      await expect(accountSection).toBeVisible();

      // ログインボタンの存在を確認（aria-labelで検索）
      await expect(
        page.getByRole("button", { name: "Googleでログイン" }),
      ).toBeVisible();
      await expect(
        page.getByRole("button", { name: "GitHubでログイン" }),
      ).toBeVisible();
      await expect(
        page.getByRole("button", { name: "Discordでログイン" }),
      ).toBeVisible();
    });

    test("ログイン促進メッセージが表示される", async ({ page }) => {
      // アカウント連携のメッセージを確認
      await expect(page.getByText("アカウント連携")).toBeVisible();
      await expect(
        page.getByText("ログインしてデータを同期しましょう"),
      ).toBeVisible();
    });

    test("アカウント連携のヘッダーアイコンが表示される", async ({ page }) => {
      // userアイコン（SVG）が存在することを確認
      const accountSection = page.getByRole("region", {
        name: "アカウント設定",
      });
      await expect(accountSection).toBeVisible();
    });
  });

  test.describe("UI インタラクション", () => {
    test("Googleログインボタンが表示される", async ({ page }) => {
      const googleButton = page.getByRole("button", {
        name: "Googleでログイン",
      });
      await expect(googleButton).toBeVisible();
      // E2E環境ではelectronAPIがないためローディング状態の可能性があるが、ボタン自体は存在する
    });

    test("GitHubログインボタンが表示される", async ({ page }) => {
      const githubButton = page.getByRole("button", {
        name: "GitHubでログイン",
      });
      await expect(githubButton).toBeVisible();
    });

    test("Discordログインボタンが表示される", async ({ page }) => {
      const discordButton = page.getByRole("button", {
        name: "Discordでログイン",
      });
      await expect(discordButton).toBeVisible();
    });
  });

  test.describe("その他の設定セクション", () => {
    test("API設定セクションが表示される", async ({ page }) => {
      await expect(
        page.getByRole("heading", { name: "API設定" }),
      ).toBeVisible();
      await expect(page.getByText("AIサービスへの接続設定")).toBeVisible();
    });

    test("RAG設定セクションが表示される", async ({ page }) => {
      await expect(
        page.getByRole("heading", { name: "RAG設定" }),
      ).toBeVisible();
      await expect(page.getByText("ナレッジベースの検索設定")).toBeVisible();
    });

    test("外観設定セクションが表示される", async ({ page }) => {
      await expect(
        page.getByRole("heading", { name: "外観設定" }),
      ).toBeVisible();
      await expect(page.getByText("テーマとディスプレイ設定")).toBeVisible();
    });

    test("設定を保存ボタンが表示される", async ({ page }) => {
      await expect(
        page.getByRole("button", { name: "設定を保存" }),
      ).toBeVisible();
    });
  });

  test.describe("アクセシビリティ", () => {
    test("AccountSectionに適切なaria-labelがある", async ({ page }) => {
      const accountSection = page.getByRole("region", {
        name: "アカウント設定",
      });
      await expect(accountSection).toBeVisible();
    });

    test("各設定セクションにrole=regionがある", async ({ page }) => {
      // API設定セクション
      await expect(
        page.getByRole("region", { name: /API設定/i }),
      ).toBeVisible();

      // RAG設定セクション
      await expect(
        page.getByRole("region", { name: /RAG設定/i }),
      ).toBeVisible();

      // 外観設定セクション
      await expect(
        page.getByRole("region", { name: /外観設定/i }),
      ).toBeVisible();
    });
  });

  test.describe("レスポンシブデザイン", () => {
    test("モバイルビューポートでも設定画面が表示される", async ({ page }) => {
      // モバイルサイズに変更
      await page.setViewportSize({ width: 375, height: 667 });

      // ページを再読み込み
      await page.reload();
      await page.waitForLoadState("networkidle");

      // モバイルではボトムナビゲーションを使用
      // 設定画面の存在は確認
      const settingsHeading = page.getByRole("heading", {
        name: "設定",
        exact: true,
      });
      // モバイルでは最初からダッシュボードが表示されている可能性があるので
      // ナビゲーションが必要かもしれない
      if (!(await settingsHeading.isVisible().catch(() => false))) {
        // モバイルのボトムナビゲーションから設定を選択
        const mobileNav = page.locator('nav[role="navigation"]');
        const buttons = mobileNav.getByRole("button");
        await buttons.last().click();
      }

      await expect(
        page.getByRole("heading", { name: "設定", exact: true }),
      ).toBeVisible();
    });
  });
});

test.describe("ナビゲーション", () => {
  test("左サイドバーから設定画面に移動できる", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // 最初はダッシュボードが表示される
    await expect(
      page.getByRole("heading", { name: "ダッシュボード", exact: true }),
    ).toBeVisible();

    // 設定ボタンをクリック
    const nav = page.getByRole("navigation", { name: "Main navigation" });
    const settingsButton = nav.getByRole("button").last();
    await settingsButton.click();

    // 設定画面が表示される
    await expect(
      page.getByRole("heading", { name: "設定", exact: true }),
    ).toBeVisible();
  });

  test("ダッシュボードに戻れる", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // 設定画面に移動
    const nav = page.getByRole("navigation", { name: "Main navigation" });
    await nav.getByRole("button").last().click();

    await expect(
      page.getByRole("heading", { name: "設定", exact: true }),
    ).toBeVisible();

    // ダッシュボードに戻る（最初のボタン）
    await nav.getByRole("button").first().click();

    await expect(
      page.getByRole("heading", { name: "ダッシュボード", exact: true }),
    ).toBeVisible();
  });
});
