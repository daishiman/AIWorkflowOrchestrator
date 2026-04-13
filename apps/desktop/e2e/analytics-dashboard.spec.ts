/**
 * @file analytics-dashboard.spec.ts
 * @description Analytics ダッシュボード E2E テスト
 * @task UT-W3-ANALYTICS-DASHBOARD-001
 *
 * T4-08: 設定画面に analytics-dashboard-panel が存在すること
 */

import { test, expect } from "@playwright/test";
import { injectOnboardingStoreMock } from "./helpers/wizard-tracking-stub";

test.describe("Analytics ダッシュボード", () => {
  test("T4-08: 設定画面に analytics-dashboard-panel が表示されること", async ({
    page,
  }) => {
    await injectOnboardingStoreMock(page, {
      hasCompleted: true,
    });

    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // 設定画面へ遷移
    await page.locator('button[data-view-id="settings"]').first().click();
    await page.waitForSelector('[data-testid="settings-view"]');

    // analytics-dashboard-panel の存在確認
    const panel = page.getByTestId("analytics-dashboard-panel");
    await expect(panel).toBeVisible({ timeout: 10_000 });
  });
});
