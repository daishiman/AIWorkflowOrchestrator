# Playwright ベストプラクティス詳細

## テスト設計原則

### 1. テストの独立性

各テストは他のテストに依存せず、任意の順序で実行できる必要があります。

**実装例**:
```typescript
test.beforeEach(async ({ page }) => {
  // テストごとに初期状態をリセット
  await page.goto('/');
  await page.evaluate(() => localStorage.clear());
  await page.evaluate(() => sessionStorage.clear());
});
```

### 2. テストの原子性

一つのテストは一つの機能をテストします。

**良い例**:
```typescript
test('ログイン成功', async ({ page }) => {
  await page.goto('/login');
  await page.getByLabel('Email').fill('user@example.com');
  await page.getByLabel('Password').fill('password');
  await page.getByRole('button', { name: 'Login' }).click();

  await expect(page).toHaveURL('/dashboard');
});

test('ログイン失敗時のエラー表示', async ({ page }) => {
  await page.goto('/login');
  await page.getByLabel('Email').fill('invalid@example.com');
  await page.getByLabel('Password').fill('wrong');
  await page.getByRole('button', { name: 'Login' }).click();

  await expect(page.getByText('Invalid credentials')).toBeVisible();
});
```

**悪い例**:
```typescript
test('ログインフロー全体', async ({ page }) => {
  // ログイン成功、失敗、パスワードリセットを全部テスト
  // → 分割すべき
});
```

### 3. 明示的なアサーション

期待される結果を明確に記述します。

```typescript
// ✅ 良い例
await expect(page.getByTestId('welcome-message')).toHaveText('Welcome, John');
await expect(page.getByRole('button', { name: 'Submit' })).toBeEnabled();
await expect(page).toHaveURL(/\/dashboard/);

// ❌ 悪い例
const text = await page.textContent('[data-testid="welcome"]');
if (text !== 'Welcome, John') throw new Error('Wrong text');
```

## セレクタ戦略の詳細

### セレクタの優先順位

1. **Role-based selectors** (推奨):
```typescript
await page.getByRole('button', { name: 'Submit' });
await page.getByRole('textbox', { name: 'Email' });
await page.getByRole('checkbox', { name: 'Remember me' });
```

2. **Label-based selectors**:
```typescript
await page.getByLabel('Email address');
await page.getByLabel('Password');
```

3. **Test ID selectors**:
```typescript
await page.getByTestId('submit-button');
```

4. **Text-based selectors** (慎重に使用):
```typescript
await page.getByText('Click here'); // 翻訳で壊れる可能性
```

5. **CSS selectors** (最終手段):
```typescript
await page.locator('.btn-primary'); // 避けるべき
```

### セレクタの安定性

**安定したセレクタ**:
- UI変更に強い
- 意味的に明確
- 翻訳の影響を受けにくい

```typescript
// ✅ 安定
<button data-testid="submit-form">Submit</button>
await page.getByTestId('submit-form').click();

// ✅ 安定
<button role="button" aria-label="Submit form">Submit</button>
await page.getByRole('button', { name: 'Submit form' }).click();

// ❌ 不安定
<button class="btn btn-primary mt-3 px-4">Submit</button>
await page.locator('.btn.btn-primary.mt-3.px-4').click();
```

## 待機戦略の詳細

### 自動待機

Playwright の Locator API は自動的に要素が利用可能になるまで待機します。

```typescript
// 自動的に要素が表示されるまで待機
await page.getByRole('button').click();

// 自動的にテキストが表示されるまで待機
await expect(page.getByText('Success')).toBeVisible();
```

### 明示的待機

特定の条件を待つ必要がある場合:

```typescript
// ネットワークアイドル待機
await page.waitForLoadState('networkidle');

// 特定の要素が表示されるまで
await page.waitForSelector('[data-testid="loaded"]', { state: 'visible' });

// カスタム条件
await page.waitForFunction(() => {
  return document.querySelectorAll('.item').length > 5;
});

// 特定のURLになるまで
await page.waitForURL('**/dashboard');
```

### タイムアウト設定

```typescript
// グローバル設定
test.setTimeout(60000); // 60秒

// 個別操作のタイムアウト
await page.getByRole('button').click({ timeout: 10000 });
await expect(page.getByText('Loaded')).toBeVisible({ timeout: 15000 });
```

## 並列実行とテスト分離

### 並列実行の設定

```typescript
// playwright.config.ts
export default {
  workers: process.env.CI ? 2 : 4,
  fullyParallel: true,
  retries: process.env.CI ? 2 : 0,
};
```

### テストデータの分離

```typescript
// 各テストで一意なデータを使用
test('ユーザー登録', async ({ page }) => {
  const uniqueEmail = `user-${Date.now()}@example.com`;
  await page.goto('/register');
  await page.getByLabel('Email').fill(uniqueEmail);
  // ...
});
```

### ブラウザコンテキストの分離

```typescript
test('独立したブラウザコンテキスト', async ({ browser }) => {
  const context1 = await browser.newContext();
  const context2 = await browser.newContext();

  const page1 = await context1.newPage();
  const page2 = await context2.newPage();

  // 完全に独立した環境
  await page1.goto('/login');
  await page2.goto('/login');
});
```

## エラーハンドリング

### リトライ戦略

```typescript
// テストレベルでリトライ
test('不安定なテスト', async ({ page }) => {
  test.slow(); // タイムアウトを3倍に
  // ...
});

// describe単位でリトライ
test.describe('認証フロー', () => {
  test.describe.configure({ retries: 2 });

  test('ログイン', async ({ page }) => {
    // ...
  });
});
```

### デバッグ情報の収集

```typescript
test('エラー時のデバッグ', async ({ page }, testInfo) => {
  try {
    await page.goto('/');
    // テスト実行
  } catch (error) {
    // スクリーンショット保存
    await page.screenshot({
      path: `${testInfo.outputDir}/failure.png`,
      fullPage: true
    });

    // HTML保存
    const html = await page.content();
    await testInfo.attach('page-content', {
      body: html,
      contentType: 'text/html'
    });

    throw error;
  }
});
```

## パフォーマンス最適化

### ページ読み込みの最適化

```typescript
// 不要なリソースをブロック
await page.route('**/*.{png,jpg,jpeg}', route => route.abort());

// ネットワークアイドルを待たない
await page.goto('/', { waitUntil: 'domcontentloaded' });
```

### 認証状態の再利用

```typescript
// setup/auth.setup.ts
import { test as setup } from '@playwright/test';

setup('認証', async ({ page }) => {
  await page.goto('/login');
  await page.getByLabel('Email').fill('user@example.com');
  await page.getByLabel('Password').fill('password');
  await page.getByRole('button', { name: 'Login' }).click();

  // 認証状態を保存
  await page.context().storageState({ path: 'auth.json' });
});

// tests/dashboard.spec.ts
test.use({ storageState: 'auth.json' });

test('ダッシュボード', async ({ page }) => {
  // すでにログイン済み
  await page.goto('/dashboard');
});
```

## アクセシビリティテスト

```typescript
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('アクセシビリティチェック', async ({ page }) => {
  await page.goto('/');

  const results = await new AxeBuilder({ page }).analyze();

  expect(results.violations).toEqual([]);
});
```

## モバイルエミュレーション

```typescript
import { devices } from '@playwright/test';

test.use({
  ...devices['iPhone 12'],
});

test('モバイル表示', async ({ page }) => {
  await page.goto('/');

  // モバイルビューポートでの動作確認
  await expect(page.getByRole('button', { name: 'Menu' })).toBeVisible();
});
```

## CI/CD統合

### GitHub Actions設定例

```yaml
name: Playwright Tests

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18

      - name: Install dependencies
        run: pnpm ci

      - name: Install Playwright
        run: npx playwright install --with-deps

      - name: Run tests
        run: npx playwright test

      - uses: actions/upload-artifact@v3
        if: always()
        with:
          name: playwright-report
          path: playwright-report/
```

## まとめ

Playwrightのベストプラクティスは、テストの安定性、保守性、実行速度のバランスを取ることです。

**重要な原則**:
1. テストの独立性を保つ
2. 安定したセレクタを使用
3. 自動待機を活用
4. 明示的なアサーションを使用
5. 並列実行を最適化
6. デバッグ情報を適切に収集
