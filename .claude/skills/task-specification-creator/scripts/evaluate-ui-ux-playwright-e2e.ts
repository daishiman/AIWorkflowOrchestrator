import { test, expect, _electron as electron } from "@playwright/test";
import type { ElectronApplication, Page } from "@playwright/test";
import * as path from "path";
import type { SemanticTestResult } from "./evaluate-ui-ux-types";

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

// ===== TASK-RT-05 M11-1〜M11-4 テストスイート =====
test.describe("TASK-RT-05 multi_select Phase 11: 3層評価", () => {
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

  // M11-1: multi_select request 表示（層1 + 層2）
  test("M11-1: multi_select request を開く - 3層評価", async () => {
    // 層1: SEM-001
    await page.goto("/workflow"); // アプリ内パス（実装に合わせて調整）
    const semanticResult = await testSemanticLayer(page, '[role="checkbox"]');
    expect(semanticResult.ariaLabels.length).toBeGreaterThan(0);

    // 層2: VIS-001
    await testVisualLayer(page, "M11-1-multi-select-display");

    // 層3: AI UX 評価は evaluate-ui-ux.ts で別途実行
  });

  // M11-2: 2件選択して送信（層1 + 層2 + payload 検証）
  test("M11-2: 2件選択して送信する - 3層評価", async () => {
    const checkboxes = await page.locator('[role="checkbox"]').all();
    await checkboxes[0].click();
    await checkboxes[1].click();

    // 層1: SEM-006（aria-checked の状態反映）
    const checkedCount = await page
      .locator('[role="checkbox"][aria-checked="true"]')
      .count();
    expect(checkedCount).toBe(2);

    // 層2: VIS-002
    await testVisualLayer(page, "M11-2-checkbox-selected");

    // 送信
    await page.click('[data-testid="submit-button"]');

    // payload 検証（PAY-001）
    const lastPayload = await page.evaluate(
      () => (window as Record<string, unknown>).__lastSubmitPayload__,
    );
    expect(
      Array.isArray(
        (lastPayload as Record<string, unknown> | null)?.selectedOptionIds,
      ),
    ).toBe(true);
  });

  // M11-3: kind 切り替え（層1 + 層2）
  test("M11-3: kind を切り替える - 3層評価", async () => {
    await page.click('[data-testid="kind-switch"]');

    // 層1: SEM-007（切り替え後 aria-checked が全て false）
    const checkedBoxes = await page
      .locator('[role="checkbox"][aria-checked="true"]')
      .count();
    expect(checkedBoxes).toBe(0);

    // 層2: VIS-003
    await testVisualLayer(page, "M11-3-kind-switched");
  });

  // M11-4: 既存 4 kind の確認（層2）
  test("M11-4: 既存 4 kind を順に確認する - 3層評価", async () => {
    const kinds = ["single_select", "free_text", "secret", "confirm"];

    for (const kind of kinds) {
      await page.click(`[data-testid="kind-${kind}"]`);
      // 層2: VIS-004〜007
      await testVisualLayer(page, `M11-4-kind-${kind}`);
    }
  });
});
