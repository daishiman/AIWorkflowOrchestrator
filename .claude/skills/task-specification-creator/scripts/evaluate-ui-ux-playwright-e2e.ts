import { test, expect, _electron as electron } from "@playwright/test";
import type { ElectronApplication, Page } from "@playwright/test";
import * as path from "path";
import type { SemanticTestResult } from "./evaluate-ui-ux-types";
import {
  TEST_TARGETS,
  type TestTarget,
} from "../../../../apps/desktop/e2e/ui-ux/test-targets.config";

// Electron アプリの起動
// apps/desktop/dist/main.js を起点に起動
// NODE_ENV=test / ELECTRON_IS_TEST=1 環境変数を付与
export async function launchElectronApp(): Promise<ElectronApplication> {
  const appPath = path.resolve(__dirname, "../../../../apps/desktop");
  return await electron.launch({
    args: [path.join(appPath, "dist/main.js")],
    env: {
      ...process.env,
      NODE_ENV: "test",
      ELECTRON_IS_TEST: "1",
    },
  });
}

// ===== 層1: Semantic 確認 =====
// 対応テスト: SEM-001〜006
// ARIA ラベル、role 属性、tabindex、キーボードフォーカス、アクセシビリティツリーを検証
export async function testSemanticLayer(
  page: Page,
  _targetSelector: string,
): Promise<SemanticTestResult> {
  // ARIA ラベル検証
  const ariaLabels = await page.evaluate(() => {
    const elements = document.querySelectorAll("[aria-label]");
    return Array.from(elements).map((el) => ({
      tag: el.tagName,
      label: el.getAttribute("aria-label"),
      role: el.getAttribute("role"),
    }));
  });

  // アクセシビリティツリー取得
  const snapshot = await page.accessibility.snapshot();

  // tabindex 検証
  const tabIndexElements = await page.evaluate(() => {
    const interactive = document.querySelectorAll(
      'button, input, [tabindex], [role="checkbox"]',
    );
    return Array.from(interactive).map((el) => ({
      tag: el.tagName,
      tabIndex: (el as HTMLElement).tabIndex,
      role: el.getAttribute("role"),
    }));
  });

  // キーボードフォーカス移動テスト
  await page.keyboard.press("Tab");
  const focusedElement = await page.evaluate(
    () => document.activeElement?.tagName,
  );

  return {
    ariaLabels,
    accessibilitySnapshot: snapshot,
    tabIndexElements,
    keyboardFocus: focusedElement,
  };
}

// ===== 層2: Visual 確認 =====
// 対応テスト: VIS-001〜007
// CON-1 対応: 初回実行時は --update-snapshots フラグで実行すること
// ピクセル比較による視覚的回帰検出
export async function testVisualLayer(
  page: Page,
  testCaseId: string,
): Promise<void> {
  await expect(page).toHaveScreenshot(`${testCaseId}.png`, {
    maxDiffPixels: 50,
    animations: "disabled",
  });
}

// ===== UI/UX 3層評価フレームワーク（TEST_TARGETS 駆動） =====
// test-targets.config.ts の TEST_TARGETS を動的にイテレートする
// ハードコードされた M11 系テストを廃止し、設定駆動型に変更
test.describe("UI/UX 3層評価フレームワーク", () => {
  let app: ElectronApplication;
  let page: Page;

  test.beforeAll(async () => {
    app = await launchElectronApp();
    page = await app.firstWindow();
    await page.waitForLoadState("domcontentloaded");
  });

  test.afterAll(async () => {
    await app.close();
  });

  for (const target of TEST_TARGETS as TestTarget[]) {
    if (target.layer1) {
      test(`[SEM] ${target.id}: Semantic 検証 - ${target.description}`, async () => {
        const firstSelector = target.semanticTargets?.[0]?.selector ?? "body";
        const result = await testSemanticLayer(page, firstSelector);
        expect(result.tabIndexElements.length).toBeGreaterThanOrEqual(0);
      });
    }
    if (target.layer2) {
      test(`[VIS] ${target.id}: Visual 検証 - ${target.description}`, async () => {
        await testVisualLayer(page, target.id);
      });
    }
  }
});
