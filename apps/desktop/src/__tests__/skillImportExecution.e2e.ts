/**
 * @file skillImportExecution.e2e.ts
 * @description スキルインポートと実行のE2Eテスト
 * @feature skill-import-agent-system
 * @task TASK-8C-C E2Eテスト - インポート・実行フロー
 *
 * テストケース:
 * - TC-1: インポートダイアログ表示
 * - TC-2: スキル詳細表示
 * - TC-3: インポート実行
 * - TC-4: ストリーミング表示
 * - TC-5: 停止ボタン表示
 * - TC-6: 実行中止
 * - TC-7: 再スキャン実行
 * - TC-8: 無効スキルは表示されない
 * - TC-9: インポート済みスキルの再選択
 */

import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import { ElectronApplication, Page, _electron as electron } from "playwright";
import path from "path";

// ============================================
// Types
// ============================================

declare global {
  interface Window {
    electronAPI?: {
      skill?: {
        import?: (skillName: string) => Promise<void>;
        resetForTesting?: () => void;
      };
    };
  }
}

// ============================================
// Constants
// ============================================

/** テスト用タイムアウト設定 */
const TIMEOUTS = {
  /** ダイアログ表示待機 */
  dialog: 5000,
  /** スキャン完了待機 */
  scan: 10000,
  /** 実行状態変化待機 */
  execution: 5000,
} as const;

/** 使用するセレクタ定義 */
const SELECTORS = {
  // SkillSelector
  skillCombobox: "role=combobox",
  skillListbox: "role=listbox",
  skillOption: (name: string) => `role=option >> text="${name}"`,
  skillOptionByText: (text: string) => `role=option:has-text("${text}")`,
  rescanButton: '[aria-label="再スキャン"]',
  scanningText: 'text="スキャン中..."',
  importedSection: 'text="インポート済み"',
  availableSection: 'text="利用可能なスキル"',
  noneOption: 'text="なし（スキルを使用しない）"',

  // SkillImportDialog
  importDialogTitle: 'text="スキルをインポート"',
  allowedToolsSection: 'text="許可ツール"',
  subagentSection: "text=/サブエージェント/",
  importButton: 'button:has-text("インポート")',

  // SkillStreamingView
  streamingView: '[data-testid="skill-streaming-view"]',
  abortButton: '[data-testid="abort-button"]',
  cancelledStatus: 'text="キャンセル"',

  // ChatInput
  chatInput: '[data-testid="chat-input"]',
} as const;

// ============================================
// Helper Functions
// ============================================

/**
 * スキル選択UIを開く
 */
async function openSkillSelector(page: Page): Promise<void> {
  await page.click(SELECTORS.skillCombobox);
}

/**
 * 未インポートスキルを選択してインポートダイアログを開く
 */
async function openImportDialog(page: Page, skillName: string): Promise<void> {
  await openSkillSelector(page);
  await page.click(SELECTORS.skillOption(skillName));
  await page.waitForSelector(SELECTORS.importDialogTitle, {
    timeout: TIMEOUTS.dialog,
  });
}

/**
 * スキルをAPI経由でインポート
 */
async function importSkillViaAPI(page: Page, skillName: string): Promise<void> {
  await page.evaluate(async (name) => {
    await window.electronAPI?.skill?.import?.(name);
  }, skillName);
}

/**
 * スキルを実行開始
 */
async function startSkillExecution(page: Page, prompt: string): Promise<void> {
  await page.fill(SELECTORS.chatInput, prompt);
  await page.press(SELECTORS.chatInput, "Enter");
}

/**
 * テスト間の状態リセット
 */
async function resetForTesting(page: Page): Promise<void> {
  await page.evaluate(() => {
    window.electronAPI?.skill?.resetForTesting?.();
  });
}

// ============================================
// Test Suite
// ============================================

describe("Skill Import & Execution E2E", () => {
  let electronApp: ElectronApplication;
  let page: Page;

  // ----------------------------------------
  // Setup / Teardown
  // ----------------------------------------

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
  });

  afterAll(async () => {
    await electronApp?.close();
  });

  beforeEach(async () => {
    // Reset skill state between tests
    await resetForTesting(page);
  });

  // ============================================
  // Skill Import Flow
  // ============================================

  describe("Skill Import Flow", () => {
    /**
     * TC-1: インポートダイアログ表示
     * 未インポートスキル選択時にダイアログが表示される
     */
    it("should open import dialog for unimported skill", async () => {
      // Open skill selector and select unimported skill
      await openSkillSelector(page);
      await page.click(SELECTORS.skillOption("test-skill"));

      // Import dialog should appear
      const dialog = page.locator(SELECTORS.importDialogTitle);
      await expect(dialog).toBeVisible();
    });

    /**
     * TC-2: スキル詳細表示
     * インポートダイアログ内で許可ツールとサブエージェントが表示される
     */
    it("should display skill details in import dialog", async () => {
      // Open import dialog
      await openImportDialog(page, "test-skill");

      // Check for allowed tools section
      await expect(page.locator(SELECTORS.allowedToolsSection)).toBeVisible();

      // Check for subagent section (matches partial text)
      await expect(page.locator(SELECTORS.subagentSection)).toBeVisible();
    });

    /**
     * TC-3: インポート実行
     * インポート完了後、スキルがインポート済みセクションに追加される
     */
    it("should import skill and add to imported list", async () => {
      // Open import dialog
      await openImportDialog(page, "test-skill");

      // Click import button
      await page.click(SELECTORS.importButton);

      // Wait for dialog to close
      await page.waitForSelector(SELECTORS.importDialogTitle, {
        state: "hidden",
        timeout: TIMEOUTS.dialog,
      });

      // Open skill selector again
      await openSkillSelector(page);

      // Check skill is now in imported section
      await expect(page.locator(SELECTORS.importedSection)).toBeVisible();
    });
  });

  // ============================================
  // Skill Execution Flow
  // ============================================

  describe("Skill Execution Flow", () => {
    beforeEach(async () => {
      // Import test skill programmatically before each execution test
      await importSkillViaAPI(page, "test-skill");
    });

    /**
     * TC-4: ストリーミング表示
     * スキル実行中にストリーミングビューが表示される
     */
    it("should show streaming view when executing", async () => {
      // Select imported skill
      await openSkillSelector(page);
      await page.click(SELECTORS.skillOption("test-skill"));

      // Start execution
      await startSkillExecution(page, "Test prompt");

      // Streaming view should appear
      const streamingView = page.locator(SELECTORS.streamingView);
      await expect(streamingView).toBeVisible({ timeout: TIMEOUTS.execution });
    });

    /**
     * TC-5: 停止ボタン表示
     * 実行中に停止ボタンが表示される
     */
    it("should display abort button while executing", async () => {
      // Select skill
      await openSkillSelector(page);
      await page.click(SELECTORS.skillOption("test-skill"));

      // Start execution
      await startSkillExecution(page, "Test prompt");

      // Abort button should be visible
      const abortButton = page.locator(SELECTORS.abortButton);
      await expect(abortButton).toBeVisible({ timeout: TIMEOUTS.execution });
    });

    /**
     * TC-6: 実行中止
     * 停止ボタン押下後、キャンセル状態になる
     */
    it("should abort execution when stop button clicked", async () => {
      // Select skill
      await openSkillSelector(page);
      await page.click(SELECTORS.skillOption("test-skill"));

      // Start execution
      await startSkillExecution(page, "Test prompt");

      // Wait for abort button and click
      await page.waitForSelector(SELECTORS.abortButton, {
        timeout: TIMEOUTS.execution,
      });
      await page.click(SELECTORS.abortButton);

      // Status should change to cancelled
      await expect(page.locator(SELECTORS.cancelledStatus)).toBeVisible({
        timeout: TIMEOUTS.execution,
      });
    });
  });

  // ============================================
  // Rescan Flow
  // ============================================

  describe("Rescan Flow", () => {
    /**
     * TC-7: 再スキャン実行
     * 再スキャンボタン押下でスキル一覧が更新される
     */
    it("should rescan skills when rescan button clicked", async () => {
      // Open skill selector
      await openSkillSelector(page);

      // Click rescan button
      await page.click(SELECTORS.rescanButton);

      // Should show scanning state
      await expect(page.locator(SELECTORS.scanningText)).toBeVisible();

      // Wait for scan to complete
      await page.waitForSelector(SELECTORS.scanningText, {
        state: "hidden",
        timeout: TIMEOUTS.scan,
      });

      // Skill list should be visible and updated
      await expect(page.locator(SELECTORS.skillListbox)).toBeVisible();
    });
  });

  // ============================================
  // Edge Cases
  // ============================================

  describe("Edge Cases", () => {
    /**
     * TC-8: 無効スキルは表示されない
     * invalid-skill（SKILL.mdなし）はスキル一覧に表示されない
     */
    it("should not display invalid skills in the list", async () => {
      // Open skill selector
      await openSkillSelector(page);

      // Wait for listbox to be visible
      await expect(page.locator(SELECTORS.skillListbox)).toBeVisible();

      // invalid-skill should not be visible
      const invalidSkill = page.locator(
        SELECTORS.skillOptionByText("invalid-skill"),
      );
      await expect(invalidSkill).not.toBeVisible();

      // Valid skills should be visible
      const testSkill = page.locator(SELECTORS.skillOptionByText("test-skill"));
      await expect(testSkill).toBeVisible();
    });

    /**
     * TC-9: インポート済みスキルの再選択
     * インポート済みスキルを選択するとダイアログなしで選択される
     */
    it("should select imported skill without showing import dialog", async () => {
      // First, import test-skill
      await importSkillViaAPI(page, "test-skill");

      // Open skill selector
      await openSkillSelector(page);

      // Wait for imported section
      await expect(page.locator(SELECTORS.importedSection)).toBeVisible();

      // Click on imported skill
      await page.click(SELECTORS.skillOption("test-skill"));

      // Import dialog should NOT appear
      const dialog = page.locator(SELECTORS.importDialogTitle);
      await expect(dialog).not.toBeVisible();

      // Skill should be selected (combobox shows the skill name)
      const combobox = page.locator(SELECTORS.skillCombobox);
      await expect(combobox).toContainText("test-skill");
    });
  });
});
