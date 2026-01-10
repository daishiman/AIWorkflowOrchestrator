/**
 * E2E Test Template (Playwright)
 *
 * 使用方法:
 * 1. FeatureName を実際の機能名に置換
 * 2. テストシナリオを実装
 */

import { test, expect, type Page } from "@playwright/test";

// Page Object Model
class FeatureNamePage {
  constructor(private page: Page) {}

  async goto() {
    await this.page.goto("/feature");
  }

  async getTitle() {
    return this.page.getByRole("heading", { level: 1 });
  }

  async clickButton(name: string) {
    await this.page.getByRole("button", { name }).click();
  }

  async fillForm(data: { name: string; email: string }) {
    await this.page.getByLabel("Name").fill(data.name);
    await this.page.getByLabel("Email").fill(data.email);
  }

  async submit() {
    await this.page.getByRole("button", { name: "Submit" }).click();
  }
}

test.describe("FeatureName", () => {
  let featurePage: FeatureNamePage;

  test.beforeEach(async ({ page }) => {
    featurePage = new FeatureNamePage(page);
    await featurePage.goto();
  });

  test("should display page title", async () => {
    await expect(featurePage.getTitle()).toBeVisible();
  });

  test("should complete user flow", async ({ page }) => {
    await featurePage.fillForm({
      name: "Test User",
      email: "test@example.com",
    });
    await featurePage.submit();
    await expect(page.getByText("Success")).toBeVisible();
  });

  test("should handle error state", async ({ page }) => {
    // エラー状態をシミュレート
    await page.route("**/api/submit", (route) => {
      route.fulfill({
        status: 500,
        body: JSON.stringify({ error: "Server Error" }),
      });
    });

    await featurePage.fillForm({
      name: "Test",
      email: "test@example.com",
    });
    await featurePage.submit();
    await expect(page.getByRole("alert")).toContainText("Error");
  });

  test("should be responsive", async ({ page }) => {
    // モバイルビューポート
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(featurePage.getTitle()).toBeVisible();

    // デスクトップビューポート
    await page.setViewportSize({ width: 1280, height: 720 });
    await expect(featurePage.getTitle()).toBeVisible();
  });

  test("visual regression", async ({ page }) => {
    // スクリーンショット比較
    await expect(page).toHaveScreenshot("feature-page.png");
  });
});
