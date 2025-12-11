/**
 * Workspace Manager E2E Tests
 *
 * 手動テストの自動化バージョン
 * Phase 8: T-08-1 手動テスト検証
 */
import { test, expect } from "@playwright/test";

test.describe("Workspace Manager", () => {
  test.beforeEach(async ({ page }) => {
    // エディタービューに移動
    await page.goto("/");
    // エディタータブをクリック（存在する場合）
    const editorTab = page.locator('[data-testid="nav-editor"]');
    if (await editorTab.isVisible()) {
      await editorTab.click();
    }
  });

  test.describe("No.1: フォルダ追加", () => {
    test("「フォルダを追加」ボタンが表示される", async ({ page }) => {
      const addButton = page.locator('[data-testid="add-folder-btn"]');
      await expect(addButton).toBeVisible();
    });

    test("空状態でフォルダ追加ボタンが表示される", async ({ page }) => {
      const emptyState = page.locator('[data-testid="workspace-empty"]');
      // 空状態または追加ボタンが表示される
      const addButton = page.locator('[data-testid="add-folder-btn"]');
      const isEmptyVisible = await emptyState.isVisible().catch(() => false);
      const isAddVisible = await addButton.isVisible().catch(() => false);
      expect(isEmptyVisible || isAddVisible).toBeTruthy();
    });
  });

  test.describe("No.3: ファイル表示", () => {
    test("ワークスペースサイドバーが表示される", async ({ page }) => {
      const sidebar = page.locator('[data-testid="workspace-sidebar"]');
      await expect(sidebar).toBeVisible();
    });

    test("エディタービューが表示される", async ({ page }) => {
      const editorView = page.locator('[data-testid="editor-view"]');
      await expect(editorView).toBeVisible();
    });
  });

  test.describe("No.6: キーボード操作", () => {
    test("追加ボタンがフォーカス可能", async ({ page }) => {
      const addButton = page.locator('[data-testid="add-folder-btn"]');
      await addButton.focus();
      await expect(addButton).toBeFocused();
    });
  });

  test.describe("No.7: レスポンシブ", () => {
    test("狭いウィンドウでもサイドバーが表示される", async ({ page }) => {
      await page.setViewportSize({ width: 800, height: 600 });
      const sidebar = page.locator('[data-testid="workspace-sidebar"]');
      await expect(sidebar).toBeVisible();
    });

    test("広いウィンドウでレイアウトが崩れない", async ({ page }) => {
      await page.setViewportSize({ width: 1920, height: 1080 });
      const editorView = page.locator('[data-testid="editor-view"]');
      await expect(editorView).toBeVisible();
    });
  });

  test.describe("UI Components", () => {
    test("ワークスペースヘッダーが表示される", async ({ page }) => {
      const header = page.locator(".workspace-header");
      await expect(header).toBeVisible();
    });

    test("aria-label属性が設定されている", async ({ page }) => {
      const sidebar = page.locator('[aria-label="ワークスペースサイドバー"]');
      await expect(sidebar).toBeVisible();
    });
  });
});
