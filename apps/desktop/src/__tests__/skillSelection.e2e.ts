/**
 * @file Skill Selection E2E Tests
 * @description スキル選択フローのE2Eテスト
 * @task TASK-8C-B E2Eテスト - スキル選択フロー
 */

import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import { ElectronApplication, Page, _electron as electron } from "playwright";
import path from "path";

// ============================================
// Selectors
// ============================================

const selectors = {
  /** スキルセレクター（トリガーボタン） */
  skillSelector: '[role="combobox"][aria-haspopup="listbox"]',

  /** ドロップダウン */
  dropdown: '[role="listbox"]',

  /** 「なし」オプション */
  noneOption: '[role="option"]:has-text("なし（スキルを使用しない）")',

  /** オプション（動的） */
  option: (text: string) => `[role="option"]:has-text("${text}")`,

  /** ChatPanel */
  chatPanel: '[data-testid="chat-panel"]',
} as const;

// ============================================
// Helper Functions
// ============================================

/**
 * ドロップダウンを開く
 */
async function openDropdown(page: Page): Promise<void> {
  await page.click(selectors.skillSelector);
  await page.waitForSelector(selectors.dropdown, { state: "visible" });
}

/**
 * スキルを選択
 */
async function selectSkill(page: Page, skillName: string): Promise<void> {
  await openDropdown(page);
  await page.click(selectors.option(skillName));
}

/**
 * スキル選択を解除
 */
async function deselectSkill(page: Page): Promise<void> {
  await openDropdown(page);
  await page.click(selectors.noneOption);
}

// ============================================
// Test Suite
// ============================================

describe("Skill Selection E2E", () => {
  let electronApp: ElectronApplication;
  let page: Page;

  beforeAll(async () => {
    electronApp = await electron.launch({
      args: [path.join(__dirname, "../../dist/main/index.js")],
      env: {
        ...process.env,
        NODE_ENV: "test",
        TEST_SKILLS_DIR: path.join(__dirname, "__fixtures__/skills"),
      },
    });

    page = await electronApp.firstWindow();
    await page.waitForLoadState("domcontentloaded");
  }, 60000);

  afterAll(async () => {
    await electronApp?.close();
  });

  beforeEach(async () => {
    // テスト状態をリセット
    await page.evaluate(() => {
      window.electronAPI?.skill?.resetForTesting?.();
    });
    // UIの安定化待ち
    await page.waitForTimeout(100);
  });

  // ============================================
  // 基本表示テスト
  // ============================================

  describe("基本表示", () => {
    it("should display skill selector in chat panel", async () => {
      const skillSelector = page.locator(selectors.skillSelector);
      await expect(skillSelector).toBeVisible();
    });

    it("should open dropdown and show available skills", async () => {
      await page.click(selectors.skillSelector);

      const dropdown = page.locator(selectors.dropdown);
      await expect(dropdown).toBeVisible();

      // "なし" オプションが表示される
      const noneOption = page.locator(selectors.noneOption);
      await expect(noneOption).toBeVisible();
    });
  });

  // ============================================
  // スキル選択テスト
  // ============================================

  describe("スキル選択", () => {
    it("should select a skill", async () => {
      await selectSkill(page, "test-skill");

      const selector = page.locator(selectors.skillSelector);
      await expect(selector).toContainText("test-skill");
    });

    it("should deselect skill by clicking なし", async () => {
      // まずスキルを選択
      await selectSkill(page, "test-skill");

      // 選択解除
      await deselectSkill(page);

      const selector = page.locator(selectors.skillSelector);
      await expect(selector).toContainText("なし");
    });
  });

  // ============================================
  // キーボード操作テスト
  // ============================================

  describe("キーボード操作", () => {
    it("should support keyboard navigation", async () => {
      // フォーカスを設定してドロップダウンを開く
      await page.focus(selectors.skillSelector);
      await page.keyboard.press("ArrowDown");

      const dropdown = page.locator(selectors.dropdown);
      await expect(dropdown).toBeVisible();

      // Arrow downでナビゲート
      await page.keyboard.press("ArrowDown");
      await page.keyboard.press("ArrowDown");

      // Enterで選択
      await page.keyboard.press("Enter");

      // ドロップダウンが閉じる
      await expect(dropdown).not.toBeVisible();
    });

    it("should close dropdown when clicking outside", async () => {
      await openDropdown(page);

      const dropdown = page.locator(selectors.dropdown);
      await expect(dropdown).toBeVisible();

      // 外側をクリック
      await page.click("body", { position: { x: 10, y: 10 } });

      await expect(dropdown).not.toBeVisible();
    });
  });

  // ============================================
  // アクセシビリティテスト
  // ============================================

  describe("アクセシビリティ", () => {
    it("should have proper ARIA attributes", async () => {
      const selector = page.locator(selectors.skillSelector);

      // aria-haspopup
      await expect(selector).toHaveAttribute("aria-haspopup", "listbox");

      // aria-expanded（閉じた状態）
      await expect(selector).toHaveAttribute("aria-expanded", "false");

      // クリック後
      await selector.click();
      await expect(selector).toHaveAttribute("aria-expanded", "true");

      // aria-controls
      await expect(selector).toHaveAttribute("aria-controls", "skill-listbox");
    });

    it("should close dropdown on Escape key", async () => {
      await openDropdown(page);

      const dropdown = page.locator(selectors.dropdown);
      await expect(dropdown).toBeVisible();

      // Escapeで閉じる
      await page.keyboard.press("Escape");

      await expect(dropdown).not.toBeVisible();
    });
  });
});
