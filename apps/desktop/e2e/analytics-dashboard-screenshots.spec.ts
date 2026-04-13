/**
 * @file analytics-dashboard-screenshots.spec.ts
 * @description Phase 11 手動テスト検証用スクリーンショット撮影
 * @task UT-W3-ANALYTICS-DASHBOARD-001
 */

import { test, expect, type Page } from "@playwright/test";
import fs from "node:fs/promises";
import path from "node:path";
import { injectOnboardingStoreMock } from "./helpers/wizard-tracking-stub";

const screenshotDir = path.resolve(
  process.cwd(),
  "../../docs/30-workflows/ut-w3-analytics-dashboard-001/outputs/phase-11/screenshots",
);

type ScreenshotScenario = {
  name: string;
  filename: string;
  analyticsOptOut: boolean;
  devMode: boolean;
  captureTarget: "panel" | "diagnostic";
};

const scenarios: ScreenshotScenario[] = [
  {
    name: "SC-01: 設定画面の analytics ダッシュボード（通常状態）",
    filename: "analytics-panel-default.png",
    analyticsOptOut: false,
    devMode: true,
    captureTarget: "panel",
  },
  {
    name: "SC-02: analytics-dashboard-panel のオプトアウト ON 状態",
    filename: "analytics-panel-opted-out-on.png",
    analyticsOptOut: true,
    devMode: true,
    captureTarget: "panel",
  },
  {
    name: "SC-03: analytics-dashboard-panel のオプトアウト OFF 状態",
    filename: "analytics-panel-opted-out-off.png",
    analyticsOptOut: false,
    devMode: true,
    captureTarget: "panel",
  },
  {
    name: "SC-04: 開発モードの診断ブロック",
    filename: "analytics-diagnostic-block-dev.png",
    analyticsOptOut: false,
    devMode: true,
    captureTarget: "diagnostic",
  },
  {
    name: "SC-05: 本番モードの診断ブロック非表示",
    filename: "analytics-diagnostic-block-prod-hidden.png",
    analyticsOptOut: false,
    devMode: false,
    captureTarget: "panel",
  },
];

async function openAnalyticsDashboard(
  page: Page,
  scenario: ScreenshotScenario,
) {
  await injectOnboardingStoreMock(page, {
    hasCompleted: true,
    storeValues: {
      analyticsOptOut: scenario.analyticsOptOut,
    },
  });

  await page.addInitScript((devMode: boolean) => {
    const runtimeWindow = window as Window & {
      __analyticsDashboardDevMode?: boolean;
    };
    runtimeWindow.__analyticsDashboardDevMode = devMode;
  }, scenario.devMode);

  await page.goto("/");
  await page.waitForLoadState("networkidle");
  await page.locator('button[data-view-id="settings"]').first().click();
  await page.waitForSelector('[data-testid="settings-view"]');

  const panel = page.getByTestId("analytics-dashboard-panel");
  await expect(panel).toBeVisible({ timeout: 10_000 });
  await panel.scrollIntoViewIfNeeded();

  return panel;
}

test.describe("Analytics ダッシュボード Phase11 スクリーンショット", () => {
  test.beforeAll(async () => {
    await fs.mkdir(screenshotDir, { recursive: true });
  });

  for (const scenario of scenarios) {
    test(scenario.name, async ({ page }) => {
      const panel = await openAnalyticsDashboard(page, scenario);

      if (scenario.captureTarget === "diagnostic") {
        const diagnosticBlock = panel.getByTestId("event-log-viewer");
        await expect(diagnosticBlock).toBeVisible({ timeout: 10_000 });
        await diagnosticBlock.scrollIntoViewIfNeeded();
        await diagnosticBlock.screenshot({
          path: path.join(screenshotDir, scenario.filename),
        });
        return;
      }

      await panel.screenshot({
        path: path.join(screenshotDir, scenario.filename),
        animations: "disabled",
      });
    });
  }
});
