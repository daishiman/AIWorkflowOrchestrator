/**
 * WorkspaceSearchPage - ワークスペース検索パネルのページオブジェクト
 *
 * E2Eテストでのワークスペース検索操作を抽象化
 */

import type { Page, Locator } from "@playwright/test";

export class WorkspaceSearchPage {
  readonly page: Page;

  // パネル全体
  readonly panel: Locator;

  // 検索入力
  readonly searchInput: Locator;
  readonly replaceInput: Locator;
  readonly includePatternInput: Locator;
  readonly excludePatternInput: Locator;

  // ボタン類
  readonly searchButton: Locator;
  readonly replaceAllButton: Locator;
  readonly cancelButton: Locator;

  // 検索オプション
  readonly caseSensitiveButton: Locator;
  readonly regexButton: Locator;
  readonly wholeWordButton: Locator;

  // 結果表示
  readonly resultTree: Locator;
  readonly statusText: Locator;

  // 確認ダイアログ
  readonly confirmDialog: Locator;
  readonly confirmButton: Locator;
  readonly cancelConfirmButton: Locator;

  constructor(page: Page) {
    this.page = page;

    // パネルはrole="region"とaria-label="ワークスペース検索"で特定
    this.panel = page.locator(
      'div[role="region"][aria-label="ワークスペース検索"]',
    );

    // 入力フィールド
    this.searchInput = this.panel.locator('input[role="searchbox"]');
    this.replaceInput = this.panel.locator('input[placeholder="置換..."]');
    this.includePatternInput = this.panel.locator(
      'input[placeholder*="ファイルパターン"]',
    );
    this.excludePatternInput = this.panel.locator(
      'input[placeholder*="除外パターン"]',
    );

    // ボタン
    this.searchButton = this.panel.locator('button[aria-label="検索実行"]');
    this.replaceAllButton = this.panel.locator(
      'button[aria-label="すべて置換"]',
    );
    this.cancelButton = this.panel.locator('button[aria-label="キャンセル"]');

    // 検索オプションボタン
    this.caseSensitiveButton = this.panel.locator(
      'button[aria-label*="大文字"]',
    );
    this.regexButton = this.panel.locator('button[aria-label*="正規表現"]');
    this.wholeWordButton = this.panel.locator('button[aria-label*="単語"]');

    // 結果ツリー
    this.resultTree = this.panel.locator('div[role="tree"]');
    this.statusText = this.panel.locator('div[role="status"]');

    // 確認ダイアログ
    this.confirmDialog = page.locator('div[role="dialog"][aria-label="確認"]');
    this.confirmButton = this.confirmDialog.locator(
      'button[aria-label="置換実行"]',
    );
    this.cancelConfirmButton = this.confirmDialog.locator(
      'button[aria-label="キャンセル"]',
    );
  }

  /**
   * ワークスペース検索パネルを開く（Cmd+Shift+F / Ctrl+Shift+F）
   */
  async open(): Promise<void> {
    const modifier = process.platform === "darwin" ? "Meta" : "Control";
    await this.page.keyboard.press(`${modifier}+Shift+f`);
    await this.panel.waitFor({ state: "visible" });
  }

  /**
   * パネルを閉じる
   */
  async close(): Promise<void> {
    await this.page.keyboard.press("Escape");
    await this.panel.waitFor({ state: "hidden" });
  }

  /**
   * 検索を実行
   */
  async search(query: string): Promise<void> {
    await this.searchInput.fill(query);
    await this.page.keyboard.press("Enter");
    // 検索結果が表示されるのを待つ
    await this.page.waitForTimeout(500);
  }

  /**
   * フィルター付きで検索を実行
   */
  async searchWithFilters(
    query: string,
    include?: string,
    exclude?: string,
  ): Promise<void> {
    await this.searchInput.fill(query);

    if (include) {
      await this.includePatternInput.fill(include);
    }

    if (exclude) {
      await this.excludePatternInput.fill(exclude);
    }

    await this.page.keyboard.press("Enter");
    await this.page.waitForTimeout(500);
  }

  /**
   * 検索結果のファイル一覧を取得
   */
  async getResultFiles(): Promise<string[]> {
    const fileHeaders = this.resultTree.locator(
      '[data-file-result] button[role="treeitem"][aria-expanded]',
    );
    const count = await fileHeaders.count();

    const files: string[] = [];
    for (let i = 0; i < count; i++) {
      const text = await fileHeaders.nth(i).textContent();
      if (text) {
        // ファイル名部分を抽出
        const match = text.match(/^[▸▾]?\s*(.+?)\s+/);
        if (match) {
          files.push(match[1].trim());
        }
      }
    }

    return files;
  }

  /**
   * 総マッチ数を取得
   */
  async getTotalMatchCount(): Promise<number> {
    const text = await this.statusText.textContent();
    if (!text) return 0;

    // "X件の結果" 形式をパース
    const match = text.match(/(\d+)件の結果/);
    if (!match) return 0;

    return parseInt(match[1], 10);
  }

  /**
   * 特定の結果をクリック
   */
  async clickResult(filePath: string, line: number): Promise<void> {
    // ファイルを展開
    await this.expandFile(filePath);

    // 該当行をクリック
    const lineButton = this.resultTree.locator(
      `button[role="treeitem"]:has-text("${line}")`,
    );
    await lineButton.click();
  }

  /**
   * ファイルを展開
   */
  async expandFile(filePath: string): Promise<void> {
    const fileName = filePath.split("/").pop();
    const fileHeader = this.resultTree.locator(
      `button[role="treeitem"][aria-expanded="false"]:has-text("${fileName}")`,
    );

    if (await fileHeader.isVisible()) {
      await fileHeader.click();
    }
  }

  /**
   * ファイルを折りたたむ
   */
  async collapseFile(filePath: string): Promise<void> {
    const fileName = filePath.split("/").pop();
    const fileHeader = this.resultTree.locator(
      `button[role="treeitem"][aria-expanded="true"]:has-text("${fileName}")`,
    );

    if (await fileHeader.isVisible()) {
      await fileHeader.click();
    }
  }

  /**
   * パネルが表示されているか確認
   */
  async isVisible(): Promise<boolean> {
    return this.panel.isVisible();
  }

  /**
   * 検索中かどうか確認
   */
  async isSearching(): Promise<boolean> {
    const spinner = this.panel.locator('[role="progressbar"]');
    return spinner.isVisible();
  }

  /**
   * エラーメッセージが表示されているか確認
   */
  async hasError(): Promise<boolean> {
    const errorElement = this.panel.locator('[role="alert"]');
    return errorElement.isVisible();
  }

  /**
   * 全置換を実行（確認ダイアログあり）
   */
  async replaceAll(
    searchQuery: string,
    replaceText: string,
    confirm = true,
  ): Promise<void> {
    await this.search(searchQuery);
    await this.replaceInput.fill(replaceText);
    await this.replaceAllButton.click();

    // 確認ダイアログが表示されるのを待つ
    await this.confirmDialog.waitFor({ state: "visible" });

    if (confirm) {
      await this.confirmButton.click();
    } else {
      await this.cancelConfirmButton.click();
    }
  }
}
