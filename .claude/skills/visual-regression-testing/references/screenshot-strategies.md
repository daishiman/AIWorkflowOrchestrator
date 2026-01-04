# スクリーンショット撮影戦略

視覚的回帰テストの成功は、適切なスクリーンショット撮影戦略に依存します。
このリソースでは、Playwrightで使用可能なスクリーンショット撮影戦略とベストプラクティスを解説します。

---

## 目次

1. [スクリーンショット撮影の種類](#スクリーンショット撮影の種類)
2. [全ページスクリーンショット](#全ページスクリーンショット)
3. [要素単位のスクリーンショット](#要素単位のスクリーンショット)
4. [レスポンシブデザイン対応](#レスポンシブデザイン対応)
5. [動的コンテンツの扱い](#動的コンテンツの扱い)
6. [ベストプラクティス](#ベストプラクティス)

---

## スクリーンショット撮影の種類

### 1. フルページスクリーンショット

ページ全体をスクロールして、1枚の画像として保存。

```typescript
// tests/visual/full-page.spec.ts
import { test, expect } from "@playwright/test";

test("トップページの全体表示", async ({ page }) => {
  await page.goto("/");

  // ページ全体のスクリーンショット
  await expect(page).toHaveScreenshot("homepage-full.png", {
    fullPage: true, // スクロール領域を含む全体
  });
});
```

**用途**:

- ランディングページ
- 長いコンテンツページ
- スクロール可能なリスト

**メリット**: ページ全体の変更を検出
**デメリット**: ファイルサイズが大きい、比較に時間がかかる

---

### 2. ビューポートスクリーンショット

現在表示されている領域のみを撮影。

```typescript
// tests/visual/viewport.spec.ts
import { test, expect } from "@playwright/test";

test("ダッシュボードのファーストビュー", async ({ page }) => {
  await page.goto("/dashboard");

  // ビューポート内のみのスクリーンショット
  await expect(page).toHaveScreenshot("dashboard-viewport.png", {
    fullPage: false, // デフォルト
  });
});
```

**用途**:

- ファーストビュー（above the fold）
- 固定高さのコンテンツ
- モーダル、ドロップダウン

**メリット**: 高速、ファイルサイズが小さい
**デメリット**: スクロール領域は含まれない

---

### 3. 要素スクリーンショット

特定の要素のみを撮影。

```typescript
// tests/visual/element.spec.ts
import { test, expect } from "@playwright/test";

test("ナビゲーションバーの表示", async ({ page }) => {
  await page.goto("/");

  const navbar = page.locator('[data-testid="navbar"]');

  // 要素のみのスクリーンショット
  await expect(navbar).toHaveScreenshot("navbar.png");
});
```

**用途**:

- ヘッダー、フッター
- カード、ボタン
- グラフ、チャート

**メリット**: 精密な比較、ノイズが少ない
**デメリット**: 要素の配置変更は検出できない

---

## 全ページスクリーンショット

### 基本的な実装

```typescript
// tests/visual/landing-page.spec.ts
import { test, expect } from "@playwright/test";

test.describe("ランディングページの視覚的回帰テスト", () => {
  test("デスクトップ表示", async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto("/");

    // ページの読み込み完了を待つ
    await page.waitForLoadState("networkidle");

    // 全ページスクリーンショット
    await expect(page).toHaveScreenshot("landing-page-desktop.png", {
      fullPage: true,
      animations: "disabled", // アニメーションを無効化
    });
  });

  test("モバイル表示", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    await expect(page).toHaveScreenshot("landing-page-mobile.png", {
      fullPage: true,
      animations: "disabled",
    });
  });
});
```

---

### スクロール領域の処理

```typescript
// tests/visual/long-page.spec.ts
import { test, expect } from "@playwright/test";

test("長いコンテンツページ", async ({ page }) => {
  await page.goto("/blog/long-article");

  // 画像の遅延読み込みを待つ
  await page.waitForLoadState("networkidle");

  // すべての画像が読み込まれるまで待つ
  await page.evaluate(async () => {
    const images = Array.from(document.querySelectorAll("img"));
    await Promise.all(
      images.map((img) => {
        if (img.complete) return;
        return new Promise((resolve) => {
          img.addEventListener("load", resolve);
          img.addEventListener("error", resolve);
        });
      }),
    );
  });

  // 全ページスクリーンショット
  await expect(page).toHaveScreenshot("long-article.png", {
    fullPage: true,
    animations: "disabled",
  });
});
```

---

## 要素単位のスクリーンショット

### コンポーネントの視覚的テスト

```typescript
// tests/visual/components.spec.ts
import { test, expect } from "@playwright/test";

test.describe("UIコンポーネントの視覚的テスト", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/components");
  });

  test("プライマリボタン", async ({ page }) => {
    const button = page.locator('[data-testid="primary-button"]');
    await expect(button).toHaveScreenshot("button-primary.png");
  });

  test("プライマリボタン（ホバー状態）", async ({ page }) => {
    const button = page.locator('[data-testid="primary-button"]');

    // ホバー状態にする
    await button.hover();

    await expect(button).toHaveScreenshot("button-primary-hover.png");
  });

  test("プライマリボタン（無効状態）", async ({ page }) => {
    const button = page.locator('[data-testid="primary-button-disabled"]');
    await expect(button).toHaveScreenshot("button-primary-disabled.png");
  });

  test("カードコンポーネント", async ({ page }) => {
    const card = page.locator('[data-testid="product-card"]').first();
    await expect(card).toHaveScreenshot("card-product.png");
  });
});
```

---

### マスキング（部分的な除外）

動的な部分をマスキングして、静的な部分のみを比較。

```typescript
// tests/visual/masked-content.spec.ts
import { test, expect } from "@playwright/test";

test("動的コンテンツを含むページ", async ({ page }) => {
  await page.goto("/dashboard");

  // 動的な部分（時刻、グラフ）をマスキング
  await expect(page).toHaveScreenshot("dashboard-masked.png", {
    mask: [
      page.locator('[data-testid="current-time"]'), // 時刻表示
      page.locator('[data-testid="live-chart"]'), // リアルタイムグラフ
      page.locator(".avatar"), // ユーザーアバター（変わる可能性）
    ],
  });
});
```

---

## レスポンシブデザイン対応

### 複数デバイスでのテスト

```typescript
// tests/visual/responsive.spec.ts
import { test, expect, devices } from "@playwright/test";

const viewports = [
  { name: "mobile", ...devices["iPhone 12"] },
  { name: "tablet", ...devices["iPad Pro"] },
  { name: "desktop", viewport: { width: 1920, height: 1080 } },
];

for (const device of viewports) {
  test.describe(`レスポンシブデザイン - ${device.name}`, () => {
    test.use(device);

    test("トップページ", async ({ page }) => {
      await page.goto("/");
      await page.waitForLoadState("networkidle");

      await expect(page).toHaveScreenshot(`homepage-${device.name}.png`, {
        fullPage: true,
        animations: "disabled",
      });
    });

    test("製品ページ", async ({ page }) => {
      await page.goto("/products");
      await page.waitForLoadState("networkidle");

      await expect(page).toHaveScreenshot(`products-${device.name}.png`, {
        fullPage: true,
        animations: "disabled",
      });
    });
  });
}
```

---

### ブレークポイントでのテスト

```typescript
// tests/visual/breakpoints.spec.ts
import { test, expect } from "@playwright/test";

const breakpoints = [
  { name: "xs", width: 375, height: 667 }, // モバイル
  { name: "sm", width: 640, height: 800 }, // 小型タブレット
  { name: "md", width: 768, height: 1024 }, // タブレット
  { name: "lg", width: 1024, height: 768 }, // 小型デスクトップ
  { name: "xl", width: 1280, height: 1024 }, // デスクトップ
  { name: "2xl", width: 1920, height: 1080 }, // 大型デスクトップ
];

test.describe("ブレークポイントごとの視覚的テスト", () => {
  for (const bp of breakpoints) {
    test(`${bp.name} (${bp.width}x${bp.height})`, async ({ page }) => {
      await page.setViewportSize({ width: bp.width, height: bp.height });
      await page.goto("/responsive-page");
      await page.waitForLoadState("networkidle");

      await expect(page).toHaveScreenshot(`responsive-${bp.name}.png`, {
        fullPage: true,
        animations: "disabled",
      });
    });
  }
});
```

---

## 動的コンテンツの扱い

### 1. アニメーションの無効化

```typescript
// tests/visual/animations.spec.ts
import { test, expect } from "@playwright/test";

test("アニメーションを無効化", async ({ page }) => {
  await page.goto("/animated-page");

  // CSSアニメーションを無効化
  await page.addStyleTag({
    content: `
      *, *::before, *::after {
        animation-duration: 0s !important;
        transition-duration: 0s !important;
      }
    `,
  });

  await expect(page).toHaveScreenshot("no-animations.png", {
    animations: "disabled", // Playwrightの設定でも無効化
  });
});
```

---

### 2. 動的な時刻の固定化

```typescript
// tests/visual/time-fixed.spec.ts
import { test, expect } from "@playwright/test";

test("固定された時刻でスクリーンショット", async ({ page }) => {
  // 時刻を固定（2024-01-01 12:00:00 UTC）
  await page.addInitScript(() => {
    const mockDate = new Date("2024-01-01T12:00:00Z");
    // @ts-ignore
    Date = class extends Date {
      constructor(...args) {
        if (args.length === 0) {
          super(mockDate);
        } else {
          super(...args);
        }
      }

      static now() {
        return mockDate.getTime();
      }
    };
  });

  await page.goto("/dashboard");

  // 時刻表示が固定されているため、一貫したスクリーンショット
  await expect(page).toHaveScreenshot("dashboard-fixed-time.png");
});
```

---

### 3. 画像の遅延読み込み

```typescript
// tests/visual/lazy-images.spec.ts
import { test, expect } from "@playwright/test";

test("遅延読み込み画像を含むページ", async ({ page }) => {
  await page.goto("/gallery");

  // すべての画像にスクロール（遅延読み込みをトリガー）
  await page.evaluate(async () => {
    const images = Array.from(document.querySelectorAll('img[loading="lazy"]'));
    for (const img of images) {
      img.scrollIntoView();
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
  });

  // すべての画像が読み込まれるまで待つ
  await page.waitForLoadState("networkidle");

  await expect(page).toHaveScreenshot("gallery-all-images.png", {
    fullPage: true,
  });
});
```

---

## ベストプラクティス

### DO ✅

- **安定した状態で撮影**: `waitForLoadState('networkidle')`を使用
- **アニメーションを無効化**: `animations: 'disabled'`を設定
- **動的コンテンツをマスキング**: 時刻、ランダムデータは`mask`オプションで除外
- **一貫したビューポート**: デバイスごとに固定サイズを使用
- **命名規則を統一**: `{page}-{device}-{state}.png`形式
- **意味のある差分**: 本質的な変更のみを検出するようマスキング

### DON'T ❌

- **動的コンテンツを含めない**: 時刻、ランダムデータはマスキング
- **アニメーション中に撮影しない**: アニメーションを無効化または完了を待つ
- **複数の変更を1つのテストに**: 変更箇所を特定しやすくするため分割
- **過度に細かいスクリーンショット**: 保守コストが高くなる
- **CI環境での差異を無視**: OSやブラウザバージョンによる差異を考慮

---

### スクリーンショット最適化

```typescript
// playwright.config.ts
export default defineConfig({
  use: {
    screenshot: "only-on-failure", // 失敗時のみスクリーンショット保存

    // 視覚的回帰テスト用の設定
    viewport: { width: 1280, height: 720 },
    deviceScaleFactor: 1, // Retinaディスプレイでも1倍
  },

  expect: {
    toHaveScreenshot: {
      maxDiffPixels: 100, // 最大100ピクセルの差異を許容
      threshold: 0.2, // 20%の差異を許容
      animations: "disabled", // アニメーション無効化
    },
  },
});
```

---

## まとめ

適切なスクリーンショット撮影戦略により、効果的な視覚的回帰テストを実現できます。

**キーポイント**:

1. **撮影範囲**: 全ページ、ビューポート、要素のいずれかを適切に選択
2. **レスポンシブ対応**: 主要なブレークポイントでテスト
3. **動的コンテンツ**: マスキング、固定化、無効化で対処
4. **安定性**: アニメーション無効化、ネットワークアイドル待機
5. **最適化**: 許容差分、命名規則、保存戦略

これらの戦略を組み合わせて、プロジェクトに最適な視覚的回帰テストを構築してください。
