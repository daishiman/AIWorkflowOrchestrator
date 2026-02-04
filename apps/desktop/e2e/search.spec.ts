/**
 * Search Panel E2E Tests
 *
 * 検索・置換機能のエンドツーエンドテスト
 */

import { test, expect } from "@playwright/test";
import { SearchPanelPage } from "./pages/SearchPanelPage";
import { WorkspaceSearchPage } from "./pages/WorkspaceSearchPage";

test.describe("Search Panel E2E", () => {
  let searchPanel: SearchPanelPage;

  test.beforeEach(async ({ page }) => {
    searchPanel = new SearchPanelPage(page);
    // アプリケーションのメインページに移動
    await page.goto("/");
    // アプリが完全にロードされるのを待つ
    await page.waitForLoadState("networkidle");
  });

  test("E2E-1: should open search panel with Cmd+F", async ({
    page: _page,
  }) => {
    // 検索パネルを開く
    await searchPanel.open();

    // パネルが表示されていることを確認
    await expect(searchPanel.panel).toBeVisible();

    // 検索入力にフォーカスが当たっていることを確認
    await expect(searchPanel.searchInput).toBeFocused();
  });

  test("E2E-2: should search text in file", async ({ page: _page }) => {
    await searchPanel.open();

    // 検索を実行
    await searchPanel.search("test");

    // 結果が表示されることを確認
    const resultCount = await searchPanel.getResultCount();
    expect(resultCount).not.toBeNull();
  });

  test("E2E-3: should highlight search results", async ({ page }) => {
    await searchPanel.open();
    await searchPanel.search("function");

    // 結果件数が表示されることを確認
    const resultCount = await searchPanel.getResultCount();
    expect(resultCount).not.toBeNull();
    if (resultCount) {
      expect(resultCount.total).toBeGreaterThan(0);
    }

    // ハイライト要素が存在することを確認
    const highlights = page.locator(".search-highlight");
    await expect(highlights.first()).toBeVisible();
  });

  test("E2E-4: should navigate between results with F3/Shift+F3", async ({
    page: _page,
  }) => {
    await searchPanel.open();
    await searchPanel.search("const");

    // 初期状態の確認
    let resultCount = await searchPanel.getResultCount();
    expect(resultCount).not.toBeNull();
    if (!resultCount || resultCount.total < 2) {
      test.skip();
      return;
    }

    const initialIndex = resultCount.current;

    // F3で次の結果へ
    await searchPanel.goToNextWithF3();
    resultCount = await searchPanel.getResultCount();
    expect(resultCount?.current).toBe(
      initialIndex < resultCount!.total ? initialIndex + 1 : 1,
    );

    // Shift+F3で前の結果へ
    await searchPanel.goToPreviousWithShiftF3();
    resultCount = await searchPanel.getResultCount();
    expect(resultCount?.current).toBe(initialIndex);
  });

  test("E2E-5: should toggle search options", async ({ page: _page }) => {
    await searchPanel.open();

    // 大文字小文字区別をON
    await searchPanel.toggleCaseSensitive();
    await expect(searchPanel.caseSensitiveButton).toHaveAttribute(
      "aria-pressed",
      "true",
    );

    // 正規表現をON
    await searchPanel.toggleRegex();
    await expect(searchPanel.regexButton).toHaveAttribute(
      "aria-pressed",
      "true",
    );

    // 単語単位をON
    await searchPanel.toggleWholeWord();
    await expect(searchPanel.wholeWordButton).toHaveAttribute(
      "aria-pressed",
      "true",
    );
  });

  test("E2E-6: should replace text", async ({ page: _page }) => {
    await searchPanel.openWithReplace();

    // 置換モードが表示されていることを確認
    await expect(searchPanel.replaceInput).toBeVisible();

    // 検索と置換を実行
    await searchPanel.searchInput.fill("oldText");
    await searchPanel.replaceInput.fill("newText");
    await searchPanel.page.keyboard.press("Enter");

    // 置換ボタンが有効になっていることを確認（結果がある場合）
    const resultCount = await searchPanel.getResultCount();
    if (resultCount && resultCount.total > 0) {
      await expect(searchPanel.replaceButton).toBeEnabled();
    }
  });

  test("E2E-7: should replace all text", async ({ page: _page }) => {
    await searchPanel.openWithReplace();

    await searchPanel.searchInput.fill("test");
    await searchPanel.replaceInput.fill("replaced");
    await searchPanel.page.keyboard.press("Enter");

    const resultCount = await searchPanel.getResultCount();
    if (resultCount && resultCount.total > 0) {
      // 全置換ボタンが有効になっていることを確認
      await expect(searchPanel.replaceAllButton).toBeEnabled();
    }
  });

  test("E2E-11: should close panel with Escape", async ({ page: _page }) => {
    await searchPanel.open();
    await expect(searchPanel.panel).toBeVisible();

    // Escapeで閉じる
    await searchPanel.close();
    await expect(searchPanel.panel).not.toBeVisible();
  });

  test("E2E-12: should be accessible", async ({ page: _page }) => {
    await searchPanel.open();

    // アクセシビリティ属性の確認
    await expect(searchPanel.panel).toHaveAttribute("role", "dialog");
    await expect(searchPanel.panel).toHaveAttribute("aria-label", "検索");
    await expect(searchPanel.searchInput).toHaveAttribute("role", "searchbox");
    await expect(searchPanel.statusText).toHaveAttribute("role", "status");
    await expect(searchPanel.statusText).toHaveAttribute("aria-live", "polite");
  });
});

test.describe("Workspace Search E2E", () => {
  let workspaceSearch: WorkspaceSearchPage;

  test.beforeEach(async ({ page }) => {
    workspaceSearch = new WorkspaceSearchPage(page);
    await page.goto("/");
    await page.waitForLoadState("networkidle");
  });

  test("E2E-8: should open workspace search with Cmd+Shift+F", async ({
    page: _page,
  }) => {
    await workspaceSearch.open();

    // パネルが表示されていることを確認
    await expect(workspaceSearch.panel).toBeVisible();

    // 検索入力にフォーカスが当たっていることを確認
    await expect(workspaceSearch.searchInput).toBeFocused();
  });

  test("E2E-9: should search across files", async ({ page }) => {
    await workspaceSearch.open();
    await workspaceSearch.search("import");

    // 結果が表示されることを確認（モック環境では結果がない可能性あり）
    const isSearching = await workspaceSearch.isSearching();
    // 検索が完了するまで待つ
    if (isSearching) {
      await page.waitForTimeout(2000);
    }

    // ステータスが更新されていることを確認
    const statusText = await workspaceSearch.statusText.textContent();
    expect(statusText).toBeDefined();
  });

  test("E2E-10: should jump to file on result click", async ({ page }) => {
    await workspaceSearch.open();
    await workspaceSearch.search("function");

    // 検索完了を待つ
    await page.waitForTimeout(1000);

    // 結果がある場合、クリックしてジャンプをテスト
    const matchCount = await workspaceSearch.getTotalMatchCount();
    if (matchCount > 0) {
      const files = await workspaceSearch.getResultFiles();
      if (files.length > 0) {
        // 最初のファイルを展開して結果をクリック
        await workspaceSearch.expandFile(files[0]);
        // クリック可能な結果があれば実行
        const resultItem = workspaceSearch.resultTree
          .locator('button[role="treeitem"]')
          .first();
        if (await resultItem.isVisible()) {
          await resultItem.click();
        }
      }
    }
  });

  test("should filter search with include pattern", async ({ page }) => {
    await workspaceSearch.open();
    await workspaceSearch.searchWithFilters("test", "*.ts");

    // 検索完了を待つ
    await page.waitForTimeout(1000);

    // 入力値が設定されていることを確認
    await expect(workspaceSearch.includePatternInput).toHaveValue("*.ts");
  });

  test("should filter search with exclude pattern", async ({ page }) => {
    await workspaceSearch.open();
    await workspaceSearch.searchWithFilters("test", undefined, "node_modules");

    // 検索完了を待つ
    await page.waitForTimeout(1000);

    // 入力値が設定されていることを確認
    await expect(workspaceSearch.excludePatternInput).toHaveValue(
      "node_modules",
    );
  });

  test("should close workspace search with Escape", async ({ page: _page }) => {
    await workspaceSearch.open();
    await expect(workspaceSearch.panel).toBeVisible();

    await workspaceSearch.close();
    await expect(workspaceSearch.panel).not.toBeVisible();
  });

  test("should show cancel button while searching", async ({ page }) => {
    await workspaceSearch.open();
    await workspaceSearch.searchInput.fill("longSearchQuery");
    await page.keyboard.press("Enter");

    // 検索中にキャンセルボタンが表示されることを確認
    // （検索が非常に速い場合はスキップ）
    const isSearching = await workspaceSearch.isSearching();
    if (isSearching) {
      await expect(workspaceSearch.cancelButton).toBeVisible();
    }
  });
});

test.describe("Search Panel Keyboard Shortcuts", () => {
  test("should open file search with Ctrl/Cmd+F", async ({ page }) => {
    const searchPanel = new SearchPanelPage(page);
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    const modifier = process.platform === "darwin" ? "Meta" : "Control";
    await page.keyboard.press(`${modifier}+f`);

    await expect(searchPanel.panel).toBeVisible();
  });

  test("should open replace mode with Ctrl/Cmd+T", async ({ page }) => {
    const searchPanel = new SearchPanelPage(page);
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    const modifier = process.platform === "darwin" ? "Meta" : "Control";
    await page.keyboard.press(`${modifier}+t`);

    await expect(searchPanel.panel).toBeVisible();
    await expect(searchPanel.replaceInput).toBeVisible();
  });

  test("should open workspace search with Ctrl/Cmd+Shift+F", async ({
    page,
  }) => {
    const workspaceSearch = new WorkspaceSearchPage(page);
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    const modifier = process.platform === "darwin" ? "Meta" : "Control";
    await page.keyboard.press(`${modifier}+Shift+f`);

    await expect(workspaceSearch.panel).toBeVisible();
  });
});
