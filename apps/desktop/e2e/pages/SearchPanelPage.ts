/**
 * SearchPanelPage - ファイル内検索パネルのページオブジェクト
 *
 * E2Eテストでの検索パネル操作を抽象化
 */

import type { Page, Locator } from "@playwright/test";

export class SearchPanelPage {
  readonly page: Page;

  // パネル全体
  readonly panel: Locator;

  // 検索入力
  readonly searchInput: Locator;
  readonly replaceInput: Locator;

  // ボタン類
  readonly searchButton: Locator;
  readonly prevButton: Locator;
  readonly nextButton: Locator;
  readonly closeButton: Locator;
  readonly replaceButton: Locator;
  readonly replaceAllButton: Locator;
  readonly toggleReplaceButton: Locator;

  // 検索オプション
  readonly caseSensitiveButton: Locator;
  readonly regexButton: Locator;
  readonly wholeWordButton: Locator;

  // ステータス表示
  readonly statusText: Locator;

  constructor(page: Page) {
    this.page = page;

    // パネルはrole="dialog"とaria-label="検索"で特定
    this.panel = page.locator('div[role="dialog"][aria-label="検索"]');

    // 入力フィールド
    this.searchInput = this.panel.locator('input[role="searchbox"]');
    this.replaceInput = this.panel.locator('input[placeholder="置換..."]');

    // ボタン
    this.searchButton = this.panel.locator('button[aria-label="検索実行"]');
    this.prevButton = this.panel.locator('button[aria-label="前の結果"]');
    this.nextButton = this.panel.locator('button[aria-label="次の結果"]');
    this.closeButton = this.panel.locator('button[aria-label="閉じる"]');
    this.replaceButton = this.panel.locator('button[aria-label="置換"]');
    this.replaceAllButton = this.panel.locator(
      'button[aria-label="すべて置換"]',
    );
    this.toggleReplaceButton = this.panel.locator(
      'button[aria-label*="置換を"]',
    );

    // 検索オプションボタン
    this.caseSensitiveButton = this.panel.locator(
      'button[aria-label*="大文字"]',
    );
    this.regexButton = this.panel.locator('button[aria-label*="正規表現"]');
    this.wholeWordButton = this.panel.locator('button[aria-label*="単語"]');

    // ステータス
    this.statusText = this.panel.locator('div[role="status"]');
  }

  /**
   * 検索パネルを開く（Cmd+F / Ctrl+F）
   */
  async open(): Promise<void> {
    const modifier = process.platform === "darwin" ? "Meta" : "Control";
    await this.page.keyboard.press(`${modifier}+f`);
    await this.panel.waitFor({ state: "visible" });
  }

  /**
   * 置換モードで検索パネルを開く（Cmd+T / Ctrl+T）
   */
  async openWithReplace(): Promise<void> {
    const modifier = process.platform === "darwin" ? "Meta" : "Control";
    await this.page.keyboard.press(`${modifier}+t`);
    await this.panel.waitFor({ state: "visible" });
  }

  /**
   * 検索パネルを閉じる
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
    // 検索結果が更新されるのを待つ
    await this.page.waitForTimeout(100);
  }

  /**
   * 置換を実行（単一）
   */
  async replace(searchQuery: string, replaceText: string): Promise<void> {
    await this.searchInput.fill(searchQuery);
    await this.page.keyboard.press("Enter");
    await this.replaceInput.fill(replaceText);
    await this.replaceButton.click();
  }

  /**
   * 全置換を実行
   */
  async replaceAll(searchQuery: string, replaceText: string): Promise<void> {
    await this.searchInput.fill(searchQuery);
    await this.page.keyboard.press("Enter");
    await this.replaceInput.fill(replaceText);
    await this.replaceAllButton.click();
  }

  /**
   * 次の検索結果へ移動
   */
  async goToNext(): Promise<void> {
    await this.nextButton.click();
  }

  /**
   * 前の検索結果へ移動
   */
  async goToPrevious(): Promise<void> {
    await this.prevButton.click();
  }

  /**
   * F3で次の結果へ移動
   */
  async goToNextWithF3(): Promise<void> {
    await this.page.keyboard.press("F3");
  }

  /**
   * Shift+F3で前の結果へ移動
   */
  async goToPreviousWithShiftF3(): Promise<void> {
    await this.page.keyboard.press("Shift+F3");
  }

  /**
   * 大文字小文字区別を切り替え
   */
  async toggleCaseSensitive(): Promise<void> {
    await this.caseSensitiveButton.click();
  }

  /**
   * 正規表現モードを切り替え
   */
  async toggleRegex(): Promise<void> {
    await this.regexButton.click();
  }

  /**
   * 単語単位検索を切り替え
   */
  async toggleWholeWord(): Promise<void> {
    await this.wholeWordButton.click();
  }

  /**
   * 検索結果件数を取得
   * @returns { current: number, total: number } または null
   */
  async getResultCount(): Promise<{ current: number; total: number } | null> {
    const text = await this.statusText.textContent();
    if (!text) return null;

    // "X/Y" 形式をパース
    const match = text.match(/(\d+)\/(\d+)/);
    if (!match) return null;

    return {
      current: parseInt(match[1], 10),
      total: parseInt(match[2], 10),
    };
  }

  /**
   * パネルが表示されているか確認
   */
  async isVisible(): Promise<boolean> {
    return this.panel.isVisible();
  }

  /**
   * エラーメッセージが表示されているか確認
   */
  async hasError(): Promise<boolean> {
    const errorElement = this.panel.locator(".text-red-400");
    return errorElement.isVisible();
  }

  /**
   * 置換モードが表示されているか確認
   */
  async isReplaceModeVisible(): Promise<boolean> {
    return this.replaceInput.isVisible();
  }
}
