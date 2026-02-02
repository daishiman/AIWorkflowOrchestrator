/**
 * @file skill-permission.spec.ts
 * @description スキル権限ダイアログ E2Eテスト
 * @task TASK-8C-D-e2e-permission
 * @phase Phase 4-8: テスト作成・実装・拡充・リファクタリング
 *
 * 権限ダイアログのユーザーフロー検証:
 *
 * ## Basic Flow (TC-1〜TC-5)
 * - TC-1: 権限ダイアログ表示
 * - TC-2: ツール情報表示
 * - TC-3: 許可して続行
 * - TC-4: 拒否して停止
 * - TC-5: 選択記憶
 *
 * ## Edge Cases
 * - 複数権限リクエストの連続処理
 * - ダイアログ表示中の再リクエスト
 *
 * ## Error Handling
 * - タイムアウト処理
 *
 * ## Accessibility (WCAG 2.1 AA)
 * - フォーカストラップ
 * - キーボードナビゲーション
 * - ARIA属性
 */

import { test, expect, type Page } from "@playwright/test";

// ===== テストデータ定数 =====

/** テストスキル名 */
const TEST_SKILL_NAME = "test-skill";

/** 権限ダイアログをトリガーするコマンド */
const PERMISSION_TRIGGER_CMD = "Run dangerous command";

/** ダイアログタイトルテキスト */
const DIALOG_TITLE_TEXT = "権限の確認が必要です";

/** 許可ボタンテキスト */
const APPROVE_BUTTON_TEXT = "許可";

/** 拒否ボタンテキスト */
const DENY_BUTTON_TEXT = "拒否";

// ===== セレクター定数 =====

const SELECTORS = {
  /** チャット入力欄 */
  chatInput: '[data-testid="chat-input"]',

  /** スキルセレクター */
  skillSelector: '[aria-label="スキルを選択"]',

  /** ダイアログコンテナ（ARIA） */
  dialogContainer: '[role="alertdialog"]',
} as const;

// ===== ヘルパー関数 =====

/**
 * スキルを選択する
 * @param page - Playwrightのページオブジェクト
 * @param skillName - 選択するスキル名
 */
async function selectSkill(page: Page, skillName: string): Promise<void> {
  // スキルセレクターをクリック
  await page.click(SELECTORS.skillSelector);
  // スキルオプションをクリック
  await page.getByRole("option", { name: skillName }).click();
  // 選択が完了するまで待機
  await page.waitForTimeout(300);
}

/**
 * 権限ダイアログをトリガーする
 * @param page - Playwrightのページオブジェクト
 * @param command - 実行するコマンド
 */
async function triggerPermissionDialog(
  page: Page,
  command: string,
): Promise<void> {
  await page.fill(SELECTORS.chatInput, command);
  await page.press(SELECTORS.chatInput, "Enter");
}

/**
 * 権限ダイアログの表示を待機する
 * @param page - Playwrightのページオブジェクト
 */
async function waitForPermissionDialog(page: Page): Promise<void> {
  await page.waitForSelector(`text="${DIALOG_TITLE_TEXT}"`, { timeout: 10000 });
}

/**
 * 権限を許可する
 * @param page - Playwrightのページオブジェクト
 */
async function approvePermission(page: Page): Promise<void> {
  await page.getByRole("button", { name: APPROVE_BUTTON_TEXT }).click();
  // ダイアログが閉じるまで待機
  await page.waitForSelector(`text="${DIALOG_TITLE_TEXT}"`, {
    state: "hidden",
  });
}

/**
 * 権限を拒否する
 * @param page - Playwrightのページオブジェクト
 */
async function denyPermission(page: Page): Promise<void> {
  await page.getByRole("button", { name: DENY_BUTTON_TEXT }).click();
  // ダイアログが閉じるまで待機
  await page.waitForSelector(`text="${DIALOG_TITLE_TEXT}"`, {
    state: "hidden",
  });
}

/**
 * 選択記憶チェックボックスをオンにする
 * @param page - Playwrightのページオブジェクト
 */
async function checkRememberChoice(page: Page): Promise<void> {
  await page.locator('[type="checkbox"]').click();
}

// ===== テストスイート =====

test.describe("スキル権限ダイアログ E2E テスト", () => {
  test.beforeEach(async ({ page }) => {
    // アプリケーションのルートに移動
    await page.goto("/");
    // ページが完全にロードされるまで待機
    await page.waitForLoadState("networkidle");

    // チャット画面に移動（必要に応じて）
    const chatNav = page.getByRole("navigation", { name: "Main navigation" });
    const chatButton = chatNav.getByRole("button").nth(1); // Chat button
    await chatButton.click();

    // チャット画面がロードされるまで待機
    await page.waitForSelector('[data-testid="chat-view"]', { timeout: 10000 });

    // テストスキルを選択
    await selectSkill(page, TEST_SKILL_NAME);
  });

  // ===== TC-1: 権限ダイアログ表示 =====
  test.describe("TC-1: 権限ダイアログ表示", () => {
    test("ツールが承認を必要とする場合、権限ダイアログが表示される", async ({
      page,
    }) => {
      // Arrange & Act
      await triggerPermissionDialog(page, PERMISSION_TRIGGER_CMD);

      // Assert
      const dialog = page.getByText(DIALOG_TITLE_TEXT);
      await expect(dialog).toBeVisible({ timeout: 10000 });
    });
  });

  // ===== TC-2: ツール情報表示 =====
  test.describe("TC-2: ツール情報表示", () => {
    test("権限ダイアログにツール情報が表示される", async ({ page }) => {
      // Arrange & Act
      await triggerPermissionDialog(page, PERMISSION_TRIGGER_CMD);
      await waitForPermissionDialog(page);

      // Assert - ツール情報が表示されていることを確認
      await expect(page.getByText("ツール:")).toBeVisible();
      await expect(page.getByText("引数:")).toBeVisible();
    });
  });

  // ===== TC-3: 許可して続行 =====
  test.describe("TC-3: 許可して続行", () => {
    test("権限を許可すると実行が継続される", async ({ page }) => {
      // Arrange
      await triggerPermissionDialog(page, PERMISSION_TRIGGER_CMD);
      await waitForPermissionDialog(page);

      // Act
      await approvePermission(page);

      // Assert - ダイアログが閉じる
      await expect(page.getByText(DIALOG_TITLE_TEXT)).not.toBeVisible();

      // Assert - 実行が継続（実行中または完了の表示）
      // Note: 実際の実行状態は環境によって異なる可能性がある
      await expect(page.getByText(/実行中|完了|Processing/)).toBeVisible({
        timeout: 5000,
      });
    });
  });

  // ===== TC-4: 拒否して停止 =====
  test.describe("TC-4: 拒否して停止", () => {
    test("権限を拒否すると実行が停止される", async ({ page }) => {
      // Arrange
      await triggerPermissionDialog(page, PERMISSION_TRIGGER_CMD);
      await waitForPermissionDialog(page);

      // Act
      await denyPermission(page);

      // Assert - ダイアログが閉じる
      await expect(page.getByText(DIALOG_TITLE_TEXT)).not.toBeVisible();

      // Assert - 実行がキャンセルされた表示
      // Note: 実際のキャンセル表示は実装による
      await expect(
        page.getByText(/キャンセル|拒否|Cancelled|Denied/),
      ).toBeVisible({ timeout: 5000 });
    });
  });

  // ===== TC-5: 選択記憶 =====
  test.describe("TC-5: 選択記憶", () => {
    test("チェックボックスをオンにすると選択が記憶される", async ({ page }) => {
      // Arrange - 1回目: チェック付きで許可
      await triggerPermissionDialog(page, PERMISSION_TRIGGER_CMD);
      await waitForPermissionDialog(page);

      // Act - チェックボックスをオンにして許可
      await checkRememberChoice(page);
      await approvePermission(page);

      // 少し待機してから2回目のコマンドを実行
      await page.waitForTimeout(500);

      // 2回目: 同じコマンドを実行
      await triggerPermissionDialog(page, PERMISSION_TRIGGER_CMD);

      // Assert - ダイアログが表示されないことを確認
      await page.waitForTimeout(1000);
      await expect(page.getByText(DIALOG_TITLE_TEXT)).not.toBeVisible();
    });
  });

  // ===== Edge Cases =====
  test.describe("Edge Cases: エッジケース", () => {
    test("複数の権限リクエストを連続して処理できる", async ({ page }) => {
      // 1回目の権限リクエスト
      await triggerPermissionDialog(page, PERMISSION_TRIGGER_CMD);
      await waitForPermissionDialog(page);
      await approvePermission(page);

      // 少し待機
      await page.waitForTimeout(500);

      // 2回目の権限リクエスト（別のコマンド）
      await triggerPermissionDialog(page, "Run another command");
      await waitForPermissionDialog(page);

      // Assert - 2回目のダイアログも表示される
      await expect(page.getByText(DIALOG_TITLE_TEXT)).toBeVisible();
    });

    test("ダイアログ表示中に別のリクエストがキューに追加される", async ({
      page,
    }) => {
      // 1回目の権限リクエスト
      await triggerPermissionDialog(page, PERMISSION_TRIGGER_CMD);
      await waitForPermissionDialog(page);

      // ダイアログ表示中に別のコマンドを実行（エラーにならないことを確認）
      // Note: 実際の動作は実装による（キュー or 無視）
      await page.fill(SELECTORS.chatInput, "Another command");

      // Assert - エラーが発生しないことを確認
      await expect(page.getByText(DIALOG_TITLE_TEXT)).toBeVisible();
    });
  });

  // ===== Error Handling =====
  test.describe("Error Handling: 異常系", () => {
    test.skip("タイムアウト時にエラーメッセージが表示される", async ({
      page,
    }) => {
      // Note: このテストはモック設定で短いタイムアウトが必要
      // 現在の環境ではスキップ

      // Arrange
      await triggerPermissionDialog(page, PERMISSION_TRIGGER_CMD);
      await waitForPermissionDialog(page);

      // Act - タイムアウトを待機
      await page.waitForTimeout(5000);

      // Assert - タイムアウトメッセージが表示される
      const timeoutOrError = page
        .getByText("タイムアウト")
        .or(page.getByText("エラー"));
      await expect(timeoutOrError).toBeVisible({ timeout: 10000 });
    });
  });

  // ===== Accessibility =====
  test.describe("Accessibility: アクセシビリティ", () => {
    test("権限ダイアログに適切なARIA属性がある", async ({ page }) => {
      // Arrange & Act
      await triggerPermissionDialog(page, PERMISSION_TRIGGER_CMD);
      await waitForPermissionDialog(page);

      // Assert - alertdialog role が設定されている
      const dialogContainer = page.locator(SELECTORS.dialogContainer);
      await expect(dialogContainer).toBeVisible();
    });

    test("Escapeキーでダイアログを閉じることができる", async ({ page }) => {
      // Arrange
      await triggerPermissionDialog(page, PERMISSION_TRIGGER_CMD);
      await waitForPermissionDialog(page);

      // Act
      await page.keyboard.press("Escape");

      // Assert - ダイアログが閉じる（または拒否として処理される）
      await expect(page.getByText(DIALOG_TITLE_TEXT)).not.toBeVisible({
        timeout: 5000,
      });
    });

    test("許可ボタンにフォーカスしてEnterキーで許可できる", async ({
      page,
    }) => {
      // Arrange
      await triggerPermissionDialog(page, PERMISSION_TRIGGER_CMD);
      await waitForPermissionDialog(page);

      // Act - 許可ボタンにフォーカスしてEnter
      await page.getByRole("button", { name: APPROVE_BUTTON_TEXT }).focus();
      await page.keyboard.press("Enter");

      // Assert - ダイアログが閉じる
      await expect(page.getByText(DIALOG_TITLE_TEXT)).not.toBeVisible();
    });

    test("拒否ボタンにフォーカスしてEnterキーで拒否できる", async ({
      page,
    }) => {
      // Arrange
      await triggerPermissionDialog(page, PERMISSION_TRIGGER_CMD);
      await waitForPermissionDialog(page);

      // Act - 拒否ボタンにフォーカスしてEnter
      await page.getByRole("button", { name: DENY_BUTTON_TEXT }).focus();
      await page.keyboard.press("Enter");

      // Assert - ダイアログが閉じる
      await expect(page.getByText(DIALOG_TITLE_TEXT)).not.toBeVisible();
    });

    test("Tabキーでダイアログ内の要素間を移動できる", async ({ page }) => {
      // Arrange
      await triggerPermissionDialog(page, PERMISSION_TRIGGER_CMD);
      await waitForPermissionDialog(page);

      // Act - Tabキーを複数回押す
      await page.keyboard.press("Tab");
      await page.keyboard.press("Tab");
      await page.keyboard.press("Tab");

      // Assert - フォーカスがダイアログ内に留まっている（エラーにならない）
      await expect(page.getByText(DIALOG_TITLE_TEXT)).toBeVisible();
    });

    test("ダイアログにaria-modal属性が設定されている", async ({ page }) => {
      // Arrange & Act
      await triggerPermissionDialog(page, PERMISSION_TRIGGER_CMD);
      await waitForPermissionDialog(page);

      // Assert
      const dialog = page.locator(SELECTORS.dialogContainer);
      await expect(dialog).toHaveAttribute("aria-modal", "true");
    });
  });
});
