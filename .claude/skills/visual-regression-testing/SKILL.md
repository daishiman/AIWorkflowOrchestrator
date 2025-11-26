---
name: visual-regression-testing
description: |
  視覚的回帰テストの実装技術。
  スクリーンショット比較、CSSアニメーション考慮、UIの一貫性検証を提供します。

  専門分野:
  - スクリーンショット戦略: 全ページ、要素単位、レスポンシブ対応の撮影パターン
  - 動的コンテンツ対応: マスキング、要素除外、固定化技術
  - ベースライン管理: 基準画像の更新、バージョン管理、差分許容設定
  - レスポンシブテスト: 複数ビューポート、デバイスエミュレーション

  使用タイミング:
  - UIの視覚的一貫性を検証する必要がある時
  - レイアウト変更の影響確認が必要な時
  - クロスブラウザの表示確認が必要な時
  - スクリーンショット比較テストを実装する時
  - レスポンシブデザインを検証する時

  Use proactively when validating UI visual consistency, detecting layout regressions,
  or implementing screenshot comparison tests.
version: 1.0.0
---

# Visual Regression Testing Skill

## 概要

視覚的回帰テストの実装技術。スクリーンショット比較、CSSアニメーション考慮、UIの一貫性検証を提供。

## 核心概念

### 1. スクリーンショット比較

```typescript
test('ホームページ表示', async ({ page }) => {
  await page.goto('/');

  // スクリーンショット撮影・比較
  await expect(page).toHaveScreenshot('homepage.png');
});

// 初回実行: ベースライン画像生成
// 2回目以降: 差分検出
```

### 2. 動的コンテンツの除外

```typescript
test('動的要素を除外', async ({ page }) => {
  await page.goto('/');

  // 特定要素を除外
  await expect(page).toHaveScreenshot({
    mask: [page.locator('[data-testid="dynamic-timestamp"]')]
  });
});
```

### 3. アニメーションの考慮

```typescript
test.beforeEach(async ({ page }) => {
  // CSSアニメーション無効化
  await page.addStyleTag({
    content: '* { transition: none !important; animation: none !important; }'
  });
});
```

## 実装パターン

### パターン1: 全ページスクリーンショット

```typescript
test('フルページ', async ({ page }) => {
  await page.goto('/');

  await expect(page).toHaveScreenshot('full-page.png', {
    fullPage: true
  });
});
```

### パターン2: 要素単位スクリーンショット

```typescript
test('ヘッダーコンポーネント', async ({ page }) => {
  await page.goto('/');

  const header = page.getByRole('banner');
  await expect(header).toHaveScreenshot('header.png');
});
```

### パターン3: レスポンシブデザイン検証

```typescript
import { devices } from '@playwright/test';

const viewports = [
  { name: 'mobile', ...devices['iPhone 12'] },
  { name: 'tablet', ...devices['iPad Pro'] },
  { name: 'desktop', viewport: { width: 1920, height: 1080 } }
];

viewports.forEach(({ name, ...config }) => {
  test(`レスポンシブ - ${name}`, async ({ browser }) => {
    const context = await browser.newContext(config);
    const page = await context.newPage();

    await page.goto('/');
    await expect(page).toHaveScreenshot(`homepage-${name}.png`);

    await context.close();
  });
});
```

## ベストプラクティス

### DO（推奨）

1. **安定したスクリーンショット**:
```typescript
// アニメーション完了待機
await page.waitForLoadState('networkidle');
await page.waitForSelector('[data-testid="loaded"]');
```

2. **許容範囲設定**:
```typescript
await expect(page).toHaveScreenshot({
  maxDiffPixels: 100, // 最大100ピクセルの差分許容
  threshold: 0.2      // 20%の差分許容
});
```

### DON'T（非推奨）

1. **動的コンテンツを含めない**（時刻、ランダムデータ）
2. **アニメーション中にスクリーンショットを撮らない**

## 関連スキル

- **playwright-testing** (`.claude/skills/playwright-testing/SKILL.md`): 基本操作
- **flaky-test-prevention** (`.claude/skills/flaky-test-prevention/SKILL.md`): 安定性確保

## リソース

- [resources/screenshot-strategies.md](resources/screenshot-strategies.md) - スクリーンショット撮影戦略
- [resources/visual-testing-best-practices.md](resources/visual-testing-best-practices.md) - 視覚的回帰テストのベストプラクティス
- [scripts/update-baseline-screenshots.mjs](scripts/update-baseline-screenshots.mjs) - ベースライン画像更新スクリプト
- [templates/visual-test-template.ts](templates/visual-test-template.ts) - 視覚的回帰テストテンプレート
