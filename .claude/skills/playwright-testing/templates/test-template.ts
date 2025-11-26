import { test, expect } from '@playwright/test';

/**
 * テストテンプレート
 *
 * このテンプレートは、Playwrightテストの基本構造を提供します。
 * 必要に応じてカスタマイズしてください。
 */

test.describe('{{feature-name}}', () => {
  // セットアップ: 各テスト実行前に実行
  test.beforeEach(async ({ page }) => {
    // ページ遷移
    await page.goto('/{{route}}');

    // 必要に応じて認証状態をセットアップ
    // await page.context().addCookies([...]);

    // 必要に応じて初期データをセットアップ
    // await page.evaluate(() => localStorage.setItem('key', 'value'));
  });

  // クリーンアップ: 各テスト実行後に実行
  test.afterEach(async ({ page }) => {
    // 必要に応じてクリーンアップ処理
    // await page.evaluate(() => localStorage.clear());
  });

  test('{{test-scenario-1}}', async ({ page }) => {
    // Given: 前提条件
    // テストの初期状態を設定
    await page.getByLabel('{{input-label}}').fill('{{input-value}}');

    // When: アクション
    // テスト対象の操作を実行
    await page.getByRole('button', { name: '{{button-name}}' }).click();

    // Then: 検証
    // 期待される結果を検証
    await expect(page).toHaveURL(/\/{{expected-url}}/);
    await expect(page.getByText('{{success-message}}')).toBeVisible();
  });

  test('{{test-scenario-2}} - エラーケース', async ({ page }) => {
    // Given: エラー条件
    await page.getByLabel('{{input-label}}').fill('{{invalid-value}}');

    // When: アクション
    await page.getByRole('button', { name: '{{button-name}}' }).click();

    // Then: エラー検証
    await expect(page.getByTestId('error-message')).toBeVisible();
    await expect(page.getByTestId('error-message')).toHaveText('{{error-text}}');
  });

  test('{{test-scenario-3}} - API統合', async ({ page, request }) => {
    // API呼び出しを待機
    const responsePromise = page.waitForResponse('**/api/{{endpoint}}');

    // アクション
    await page.getByRole('button', { name: '{{action}}' }).click();

    // レスポンス検証
    const response = await responsePromise;
    expect(response.status()).toBe(200);

    // UI更新検証
    await expect(page.getByRole('listitem')).toHaveCount({{expected-count}});
  });

  test('{{test-scenario-4}} - 動的コンテンツ', async ({ page }) => {
    // 初期状態
    const initialCount = await page.getByRole('{{role}}').count();

    // アクション
    await page.getByRole('button', { name: '{{load-more}}' }).click();

    // 新しいコンテンツが追加されるまで待機
    await page.waitForFunction(
      count => document.querySelectorAll('[data-testid="{{item-testid}}"]').length > count,
      initialCount
    );

    // 検証
    const newCount = await page.getByRole('{{role}}').count();
    expect(newCount).toBeGreaterThan(initialCount);
  });

  test('{{test-scenario-5}} - フォーム送信', async ({ page }) => {
    // フォーム入力
    await page.getByLabel('{{field-1}}').fill('{{value-1}}');
    await page.getByLabel('{{field-2}}').fill('{{value-2}}');
    await page.getByLabel('{{field-3}}').check(); // チェックボックス

    // 送信とナビゲーション待機
    await Promise.all([
      page.waitForURL('**/{{success-url}}'),
      page.getByRole('button', { name: 'Submit' }).click()
    ]);

    // 成功確認
    await expect(page.getByRole('heading', { name: '{{success-heading}}' })).toBeVisible();
  });

  test('{{test-scenario-6}} - モーダル操作', async ({ page }) => {
    // モーダルを開く
    await page.getByRole('button', { name: '{{open-modal}}' }).click();

    // モーダル表示確認
    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(page.getByRole('heading', { name: '{{modal-title}}' })).toBeVisible();

    // モーダル内での操作
    await page.getByLabel('{{modal-input}}').fill('{{value}}');
    await page.getByRole('button', { name: 'Confirm' }).click();

    // モーダルが閉じることを確認
    await expect(page.getByRole('dialog')).toBeHidden();

    // 結果確認
    await expect(page.getByText('{{result-message}}')).toBeVisible();
  });

  test('{{test-scenario-7}} - ファイルアップロード', async ({ page }) => {
    // ファイル選択
    const fileInput = page.getByLabel('{{file-input-label}}');
    await fileInput.setInputFiles('{{test-file-path}}');

    // アップロード開始とレスポンス待機
    const uploadPromise = page.waitForResponse('**/api/upload');
    await page.getByRole('button', { name: 'Upload' }).click();

    // アップロード完了確認
    const response = await uploadPromise;
    expect(response.status()).toBe(200);

    // 成功メッセージ確認
    await expect(page.getByText('Upload successful')).toBeVisible();
  });

  test('{{test-scenario-8}} - ページネーション', async ({ page }) => {
    // 初期ページ確認
    await expect(page.getByTestId('page-indicator')).toHaveText('Page 1');

    // 次ページへ
    await page.getByRole('button', { name: 'Next' }).click();

    // ページ更新確認
    await expect(page.getByTestId('page-indicator')).toHaveText('Page 2');

    // URLパラメータ確認
    await expect(page).toHaveURL(/page=2/);

    // 前ページへ
    await page.getByRole('button', { name: 'Previous' }).click();

    // 元のページに戻ることを確認
    await expect(page.getByTestId('page-indicator')).toHaveText('Page 1');
  });

  test('{{test-scenario-9}} - 検索機能', async ({ page }) => {
    // 検索入力
    const searchInput = page.getByRole('searchbox');
    await searchInput.fill('{{search-term}}');

    // 検索実行とAPI呼び出し待機
    const searchPromise = page.waitForResponse('**/api/search?q={{search-term}}');
    await page.getByRole('button', { name: 'Search' }).click();

    // 結果読み込み確認
    await searchPromise;

    // 結果表示確認
    const results = page.getByTestId('search-result');
    await expect(results).toHaveCount({{expected-result-count}});

    // 結果内容確認
    await expect(results.first()).toContainText('{{expected-text}}');
  });

  test('{{test-scenario-10}} - アクセシビリティ', async ({ page }) => {
    // キーボードナビゲーション
    await page.keyboard.press('Tab');
    await expect(page.getByRole('button', { name: '{{first-focusable}}' })).toBeFocused();

    // Enterキーで操作
    await page.keyboard.press('Enter');

    // 結果確認
    await expect(page.getByRole('dialog')).toBeVisible();

    // Escapeキーで閉じる
    await page.keyboard.press('Escape');

    // モーダルが閉じることを確認
    await expect(page.getByRole('dialog')).toBeHidden();
  });
});

/**
 * 並列実行設定
 * テストが独立している場合、並列実行で高速化
 */
// test.describe.configure({ mode: 'parallel' });

/**
 * リトライ設定
 * 不安定なテストに対してリトライを設定
 */
// test.describe.configure({ retries: 2 });

/**
 * タイムアウト設定
 * 長時間かかるテスト用
 */
// test.setTimeout(60000); // 60秒
