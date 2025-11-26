/**
 * 安定性を考慮したテストテンプレート
 *
 * このテンプレートは、フレーキーテストを防止するためのベストプラクティスを適用した
 * Playwright E2Eテストの基本構造を提供します。
 *
 * 使用方法:
 * 1. このファイルをコピーして、プロジェクトのtests/ディレクトリに配置
 * 2. {{変数}}を実際の値に置き換え
 * 3. 必要に応じてカスタマイズ
 */

import { test, expect } from '@playwright/test';
// {{FIXTURE_IMPORT}} 例: import { test, expect } from './fixtures/test-data-fixtures';

// ==============================================================================
// テストスイート: {{TEST_SUITE_NAME}}
// ==============================================================================

test.describe('{{TEST_SUITE_NAME}}', () => {
  // ----------------------------------------------------------------------------
  // 設定: リトライとタイムアウト
  // ----------------------------------------------------------------------------

  // このテストスイート全体のリトライ設定
  // ローカル: 0回、CI: 2回
  test.describe.configure({
    retries: process.env.CI ? 2 : 0,
  });

  // タイムアウト設定（必要に応じて調整）
  test.setTimeout(60000); // 60秒

  // ----------------------------------------------------------------------------
  // 前処理: テストデータのセットアップ
  // ----------------------------------------------------------------------------

  test.beforeEach(async ({ page /* , apiSeeder, uniqueGen */ }) => {
    // ✅ ベストプラクティス: 各テストで独立したデータセットを作成

    // 例: 一意のテストユーザーを作成
    // const email = uniqueGen.email('testuser@example.com');
    // const user = await apiSeeder.createUser({
    //   email,
    //   name: uniqueGen.name('Test User'),
    // });

    // ✅ ベストプラクティス: 決定的な初期状態を確保
    // await page.goto('{{BASE_URL}}'); // 例: '/dashboard'

    // ❌ 避けるべき: 固定のタイムアウト
    // await page.waitForTimeout(3000);

    // ✅ 推奨: 条件ベースの待機
    // await expect(page.locator('.loading')).not.toBeVisible();
  });

  // ----------------------------------------------------------------------------
  // 後処理: クリーンアップ
  // ----------------------------------------------------------------------------

  test.afterEach(async ({ /* apiSeeder */ }) => {
    // ✅ ベストプラクティス: テストデータを確実にクリーンアップ
    // クリーンアップはFixtureで自動化されている場合は不要
  });

  // ----------------------------------------------------------------------------
  // テストケース1: {{TEST_CASE_1_NAME}}
  // ----------------------------------------------------------------------------

  test('{{TEST_CASE_1_NAME}}', async ({ page /* , testUser, testProject */ }) => {
    // ✅ ベストプラクティス: テストの意図を明確にする
    // このテストは、{{TEST_CASE_1_DESCRIPTION}}を検証します

    // ステップ1: {{STEP_1_DESCRIPTION}}
    // ✅ 推奨: 安定したセレクターを使用（data-testid、role、labelなど）
    // await page.click('[data-testid="{{ELEMENT_ID}}"]');

    // ❌ 避けるべき: 脆弱なセレクター（CSSクラス、nth-child）
    // await page.click('.btn.btn-primary >> nth=2');

    // ステップ2: {{STEP_2_DESCRIPTION}}
    // ✅ 推奨: Playwrightの自動待機を活用
    // await expect(page.locator('[data-testid="{{RESULT_ELEMENT}}"]')).toBeVisible();

    // ❌ 避けるべき: 固定のタイムアウト
    // await page.waitForTimeout(2000);
    // const element = await page.locator('.result');

    // ステップ3: {{STEP_3_DESCRIPTION}}
    // ✅ 推奨: 明示的なアサーション
    // const resultText = await page.locator('[data-testid="result"]').textContent();
    // expect(resultText).toBe('{{EXPECTED_VALUE}}');

    // ❌ 避けるべき: 曖昧なアサーション
    // expect(resultText).toBeTruthy();
  });

  // ----------------------------------------------------------------------------
  // テストケース2: 非同期処理の待機パターン
  // ----------------------------------------------------------------------------

  test('非同期処理の待機', async ({ page }) => {
    // ✅ パターン1: APIレスポンスを待つ
    const responsePromise = page.waitForResponse(
      (response) =>
        response.url().includes('/api/{{ENDPOINT}}') && response.status() === 200
    );

    // アクションを実行
    await page.click('[data-testid="fetch-data-button"]');

    // レスポンスを待つ
    const response = await responsePromise;
    const data = await response.json();

    // レスポンスデータを検証
    expect(data).toHaveProperty('{{EXPECTED_PROPERTY}}');

    // ✅ パターン2: ネットワークアイドルを待つ
    await page.goto('/{{PAGE}}', { waitUntil: 'networkidle' });

    // ✅ パターン3: 特定の要素が表示されるまで待つ
    await expect(page.locator('[data-testid="loaded-content"]')).toBeVisible({
      timeout: 30000,
    });
  });

  // ----------------------------------------------------------------------------
  // テストケース3: フォーム入力と送信
  // ----------------------------------------------------------------------------

  test('フォーム入力と送信', async ({ page /* , uniqueGen */ }) => {
    await page.goto('/{{FORM_PAGE}}');

    // ✅ ベストプラクティス: 一意のデータを使用
    // const uniqueValue = uniqueGen.name('Test Value');

    // フォーム入力
    // await page.fill('[data-testid="input-field"]', uniqueValue);

    // ✅ 推奨: 入力が正しく反映されたことを確認
    // await expect(page.locator('[data-testid="input-field"]')).toHaveValue(uniqueValue);

    // フォーム送信
    // await page.click('[data-testid="submit-button"]');

    // ✅ 推奨: 送信後の状態を検証
    // await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
    // await expect(page.locator('[data-testid="success-message"]')).toContainText(
    //   '{{SUCCESS_MESSAGE}}'
    // );
  });

  // ----------------------------------------------------------------------------
  // テストケース4: 外部API依存のモック
  // ----------------------------------------------------------------------------

  test('外部API依存のモック', async ({ page, context }) => {
    // ✅ ベストプラクティス: 外部APIをモック
    await context.route('**/api/external/**', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: '{{MOCKED_DATA}}',
        }),
      });
    });

    await page.goto('/{{PAGE_WITH_EXTERNAL_API}}');

    // モックされたデータが表示されることを確認
    await expect(page.locator('[data-testid="external-data"]')).toContainText(
      '{{MOCKED_DATA}}'
    );
  });

  // ----------------------------------------------------------------------------
  // テストケース5: アニメーション・トランジション
  // ----------------------------------------------------------------------------

  test('アニメーション・トランジション', async ({ page }) => {
    await page.goto('/{{PAGE_WITH_ANIMATION}}');

    // モーダルを開く
    await page.click('[data-testid="open-modal-button"]');

    // ✅ 推奨: 要素が表示され、かつ操作可能になるまで待つ
    const closeButton = page.locator('[data-testid="modal-close-button"]');
    await expect(closeButton).toBeVisible();
    await expect(closeButton).toBeEnabled();

    // 安全にクリック
    await closeButton.click();

    // モーダルが閉じたことを確認
    await expect(page.locator('[data-testid="modal"]')).not.toBeVisible();
  });

  // ----------------------------------------------------------------------------
  // テストケース6: 並列実行対応
  // ----------------------------------------------------------------------------

  test('並列実行対応テスト1', async ({ page /* , uniqueGen */ }, testInfo) => {
    // ✅ ベストプラクティス: Worker IDを使用してデータを分離
    const workerId = testInfo.parallelIndex;
    console.log(`Running on worker ${workerId}`);

    // 一意のデータを作成
    // const uniqueData = `data_w${workerId}_${Date.now()}`;

    // テスト実行...
  });

  test('並列実行対応テスト2', async ({ page /* , uniqueGen */ }, testInfo) => {
    // このテストは並列実行されても、独立したデータセットを使用
    const workerId = testInfo.parallelIndex;
    console.log(`Running on worker ${workerId}`);

    // 一意のデータを作成
    // const uniqueData = `data_w${workerId}_${Date.now()}`;

    // テスト実行...
  });

  // ----------------------------------------------------------------------------
  // テストケース7: エラーハンドリング
  // ----------------------------------------------------------------------------

  test('エラーハンドリング', async ({ page }) => {
    await page.goto('/{{PAGE}}');

    // ✅ 推奨: エラー状態を明示的に検証
    await page.click('[data-testid="trigger-error-button"]');

    // エラーメッセージが表示されることを確認
    await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
    await expect(page.locator('[data-testid="error-message"]')).toContainText(
      '{{EXPECTED_ERROR_MESSAGE}}'
    );

    // エラー後の状態を検証
    await expect(page.locator('[data-testid="submit-button"]')).toBeDisabled();
  });

  // ----------------------------------------------------------------------------
  // テストケース8: リトライが必要なケース
  // ----------------------------------------------------------------------------

  test(
    '一時的なネットワーク障害を想定したテスト',
    {
      retries: 3, // このテストのみ3回リトライ
    },
    async ({ page }) => {
      // 不安定な外部サービスに依存するテスト
      await page.goto('/{{PAGE_WITH_EXTERNAL_SERVICE}}');

      // ✅ 推奨: 長めのタイムアウトを設定
      await expect(page.locator('[data-testid="external-content"]')).toBeVisible({
        timeout: 60000, // 60秒
      });
    }
  );
});

// ==============================================================================
// ベストプラクティスチェックリスト
// ==============================================================================

/**
 * ✅ このテンプレートが適用しているベストプラクティス:
 *
 * 1. **テスト独立性**
 *    - beforeEachで各テストに独立したデータセットを作成
 *    - afterEachでクリーンアップ（またはFixtureで自動化）
 *
 * 2. **決定的なテスト**
 *    - 一意のメールアドレス、名前、IDを使用
 *    - 固定のタイムアウトを避け、条件ベースの待機を使用
 *
 * 3. **安定したセレクター**
 *    - data-testid、role、label属性を優先
 *    - CSSクラスやnth-childに依存しない
 *
 * 4. **適切な待機**
 *    - Playwrightの自動待機を活用
 *    - waitForResponse、waitForSelector、networkidleを使用
 *
 * 5. **外部依存の分離**
 *    - 外部APIをモック
 *    - context.route()でリクエストをインターセプト
 *
 * 6. **並列実行対応**
 *    - Worker IDを使用してデータを分離
 *    - 共有リソースに依存しない
 *
 * 7. **適切なリトライ**
 *    - CI環境でのみリトライを有効化
 *    - 一時的な問題に対してのみリトライ
 *
 * 8. **明示的なアサーション**
 *    - toBeVisible(), toContainText(), toHaveValue()など
 *    - 曖昧なアサーション（toBeTruthy()）を避ける
 */

/**
 * ❌ このテンプレートが避けているアンチパターン:
 *
 * 1. **固定のタイムアウト**
 *    - waitForTimeout(3000) → expect().toBeVisible()
 *
 * 2. **脆弱なセレクター**
 *    - .btn.btn-primary >> nth=2 → [data-testid="submit-button"]
 *
 * 3. **現在時刻への依存**
 *    - new Date() → 明示的に日時を設定
 *
 * 4. **外部APIへの直接依存**
 *    - 実際のAPIコール → context.route()でモック
 *
 * 5. **非決定的なデータ**
 *    - testuser@test.com → uniqueGen.email('testuser@test.com')
 *
 * 6. **グローバル状態への依存**
 *    - 共有データ → 各テストで独立したデータセット
 *
 * 7. **過度なリトライ**
 *    - retries: 10 → retries: 2（CI環境のみ）
 */
