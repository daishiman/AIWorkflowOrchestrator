import { test, expect } from "@playwright/test";
import fs from "node:fs/promises";
import path from "node:path";

const workflowRoot =
  "docs/30-workflows/08-TASK-IMP-SETTINGS-INTEGRATION-REGRESSION-COVERAGE-001";
const screenshotDir = path.resolve(
  process.cwd(),
  "..",
  "..",
  workflowRoot,
  "outputs/phase-11/screenshots",
);

test.describe("Settings Integration Regression Screenshots", () => {
  test.beforeAll(async () => {
    await fs.mkdir(screenshotDir, { recursive: true });
  });

  test("TC-11-03: Settings shell 全体表示", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    await page.locator('button[data-view-id="settings"]').first().click();
    await page.waitForSelector('[data-testid="settings-view"]');

    await expect(
      page.getByRole("heading", { name: "設定", exact: true }),
    ).toBeVisible();

    await page.screenshot({
      path: path.join(screenshotDir, "TC-11-03-settings-shell.png"),
      fullPage: true,
    });
  });

  test("TC-11-04: AuthMode APIキー切替状態", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    await page.locator('button[data-view-id="settings"]').first().click();
    await page.waitForSelector('[data-testid="settings-view"]');

    const apiKeyRadio = page.getByRole("radio", { name: "APIキー" });
    await apiKeyRadio.click();

    await page.screenshot({
      path: path.join(screenshotDir, "TC-11-04-authmode-apikey.png"),
      fullPage: true,
    });
  });
});
