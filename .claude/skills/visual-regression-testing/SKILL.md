---
name: visual-regression-testing
description: |
  視覚的回帰テストの実装技術。

  📚 リソース参照:
  このスキルには以下のリソースが含まれています。
  必要に応じて該当するリソースを参照してください:

  - `.claude/skills/visual-regression-testing/resources/screenshot-strategies.md`: Screenshot Strategiesリソース
  - `.claude/skills/visual-regression-testing/resources/visual-testing-best-practices.md`: Visual Testing Best Practicesリソース

  - `.claude/skills/visual-regression-testing/templates/visual-test-template.ts`: Visual Testテンプレート

  - `.claude/skills/visual-regression-testing/scripts/update-baseline-screenshots.mjs`: Update Baseline Screenshotsスクリプト

version: 1.0.0
---

# Visual Regression Testing Skill

## 概要

視覚的回帰テストの実装技術。スクリーンショット比較、CSS アニメーション考慮、UI の一貫性検証を提供。

## 核心概念

### 1. スクリーンショット比較

```typescript
test("ホームページ表示", async ({ page }) => {
  await page.goto("/");

  // スクリーンショット撮影・比較
  await expect(page).toHaveScreenshot("homepage.png");
});

// 初回実行: ベースライン画像生成
// 2回目以降: 差分検出
```

### 2. 動的コンテンツの除外

```typescript
test("動的要素を除外", async ({ page }) => {
  await page.goto("/");

  // 特定要素を除外
  await expect(page).toHaveScreenshot({
    mask: [page.locator('[data-testid="dynamic-timestamp"]')],
  });
});
```

### 3. アニメーションの考慮

```typescript
test.beforeEach(async ({ page }) => {
  // CSSアニメーション無効化
  await page.addStyleTag({
    content: "* { transition: none !important; animation: none !important; }",
  });
});
```

## 実装パターン

### パターン 1: 全ページスクリーンショット

```typescript
test("フルページ", async ({ page }) => {
  await page.goto("/");

  await expect(page).toHaveScreenshot("full-page.png", {
    fullPage: true,
  });
});
```

### パターン 2: 要素単位スクリーンショット

```typescript
test("ヘッダーコンポーネント", async ({ page }) => {
  await page.goto("/");

  const header = page.getByRole("banner");
  await expect(header).toHaveScreenshot("header.png");
});
```

### パターン 3: レスポンシブデザイン検証

```typescript
import { devices } from "@playwright/test";

const viewports = [
  { name: "mobile", ...devices["iPhone 12"] },
  { name: "tablet", ...devices["iPad Pro"] },
  { name: "desktop", viewport: { width: 1920, height: 1080 } },
];

viewports.forEach(({ name, ...config }) => {
  test(`レスポンシブ - ${name}`, async ({ browser }) => {
    const context = await browser.newContext(config);
    const page = await context.newPage();

    await page.goto("/");
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
await page.waitForLoadState("networkidle");
await page.waitForSelector('[data-testid="loaded"]');
```

2. **許容範囲設定**:

```typescript
await expect(page).toHaveScreenshot({
  maxDiffPixels: 100, // 最大100ピクセルの差分許容
  threshold: 0.2, // 20%の差分許容
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
