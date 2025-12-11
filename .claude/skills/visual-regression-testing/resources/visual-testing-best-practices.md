# 視覚的回帰テストのベストプラクティス

視覚的回帰テストは、UIの予期しない変更を検出する強力な手法ですが、適切に設計しないとメンテナンスコストが高くなります。
このリソースでは、効果的な視覚的回帰テストのベストプラクティスを解説します。

---

## 目次

1. [視覚的回帰テストの原則](#視覚的回帰テストの原則)
2. [テスト対象の選定](#テスト対象の選定)
3. [差分許容設定](#差分許容設定)
4. [ベースライン管理](#ベースライン管理)
5. [CI/CD統合](#cicd統合)
6. [メンテナンス戦略](#メンテナンス戦略)

---

## 視覚的回帰テストの原則

### 1. 意図的な変更のみを検出

視覚的回帰テストは、**意図しない変更**を検出するためのものです。

✅ **検出すべき変更**:

- CSSの意図しない変更
- レイアウト崩れ
- フォント、色、サイズの変更
- コンポーネントの欠落や位置ずれ

❌ **検出すべきでない変更**:

- 動的コンテンツ（時刻、ユーザー名、ランダムデータ）
- アニメーション中の状態
- 外部APIのデータ変動
- 環境依存の差異（OS、ブラウザバージョン）

---

### 2. 最小限のメンテナンス

視覚的回帰テストは、頻繁にベースラインを更新する必要があります。
メンテナンスコストを最小化するため、以下の原則に従ってください。

✅ **メンテナンスしやすいテスト**:

- 重要なページ/コンポーネントのみをテスト
- 動的コンテンツを適切にマスキング
- 意味のある命名規則
- 自動化されたベースライン更新プロセス

❌ **メンテナンスコストが高いテスト**:

- すべてのページを無条件にテスト
- 動的コンテンツを含む
- 曖昧な命名（screenshot1.png、screenshot2.png）
- 手動でのベースライン更新

---

### 3. 補完的なテスト戦略

視覚的回帰テストは、他のテストを補完するものです。

| テスト種類           | 目的                       | 視覚的回帰テストとの関係 |
| -------------------- | -------------------------- | ------------------------ |
| **ユニットテスト**   | ロジックの正確性           | 補完                     |
| **統合テスト**       | コンポーネント間の連携     | 補完                     |
| **E2Eテスト**        | ユーザーワークフローの動作 | 補完                     |
| **視覚的回帰テスト** | UIの見た目の一貫性         | メイン                   |

**推奨アプローチ**: E2Eテストの一部として視覚的回帰テストを実行。

---

## テスト対象の選定

### 優先順位付け

すべてのページをテストするのではなく、**ビジネス価値の高い部分**に集中します。

#### 高優先度（必須）

✅ **クリティカルなページ**:

- トップページ（ブランドイメージ）
- ログイン・登録ページ（ユーザー獲得）
- 決済ページ（収益）
- ダッシュボード（主要機能）

✅ **再利用可能なコンポーネント**:

- デザインシステムのコンポーネント
- 共通のヘッダー・フッター
- ボタン、フォーム要素
- モーダル、ドロップダウン

#### 中優先度（推奨）

⚠️ **重要だが変更頻度が低い**:

- 製品ページ
- ブログ記事ページ
- プロフィールページ
- 設定ページ

#### 低優先度（オプション）

🔵 **変更頻度が高い、または動的コンテンツが多い**:

- 管理画面（内部ツール）
- リアルタイムダッシュボード
- ユーザー生成コンテンツページ

---

### テスト粒度の選択

```typescript
// tests/visual/granularity.spec.ts
import { test, expect } from "@playwright/test";

// ❌ 粒度が細かすぎる（メンテナンスコスト高）
test.describe("ボタンコンポーネント - 細かすぎる", () => {
  test("プライマリボタン - デフォルト", async ({ page }) => {
    await page.goto("/components");
    await expect(
      page.locator('[data-testid="btn-primary"]'),
    ).toHaveScreenshot();
  });

  test("プライマリボタン - ホバー", async ({ page }) => {
    await page.goto("/components");
    const btn = page.locator('[data-testid="btn-primary"]');
    await btn.hover();
    await expect(btn).toHaveScreenshot();
  });

  test("プライマリボタン - アクティブ", async ({ page }) => {
    await page.goto("/components");
    const btn = page.locator('[data-testid="btn-primary"]');
    await btn.click();
    await expect(btn).toHaveScreenshot();
  });

  // さらに20個のテスト...
});

// ✅ 適切な粒度（バランス）
test.describe("ボタンコンポーネント - 適切", () => {
  test("すべてのボタンバリエーション", async ({ page }) => {
    await page.goto("/components/buttons");

    // Storybookのようなコンポーネントカタログページで
    // すべてのバリエーションを1枚のスクリーンショットで確認
    await expect(page).toHaveScreenshot("buttons-all-variants.png", {
      fullPage: true,
    });
  });
});
```

---

## 差分許容設定

### 許容閾値の設定

完全一致を求めると、わずかなレンダリング差異で失敗します。
適切な許容閾値を設定してください。

```typescript
// playwright.config.ts
export default defineConfig({
  expect: {
    toHaveScreenshot: {
      // ピクセル単位の差異を許容
      maxDiffPixels: 100, // 最大100ピクセルの差異

      // パーセンテージでの差異を許容
      threshold: 0.2, // 全体の20%までの差異を許容

      // アニメーションを無効化
      animations: "disabled",

      // アンチエイリアシングの差異を許容
      maxDiffPixelRatio: 0.01, // 1%のピクセル差異を許容
    },
  },
});
```

### テストごとの閾値調整

```typescript
// tests/visual/custom-threshold.spec.ts
import { test, expect } from "@playwright/test";

test("厳格な閾値（ロゴ）", async ({ page }) => {
  await page.goto("/");
  const logo = page.locator('[data-testid="logo"]');

  // ロゴは完全一致を要求
  await expect(logo).toHaveScreenshot("logo.png", {
    maxDiffPixels: 0,
    threshold: 0,
  });
});

test("緩い閾値（複雑なグラフ）", async ({ page }) => {
  await page.goto("/analytics");
  const chart = page.locator('[data-testid="chart"]');

  // グラフは多少の差異を許容
  await expect(chart).toHaveScreenshot("chart.png", {
    maxDiffPixels: 500,
    threshold: 0.5, // 50%の差異を許容
  });
});
```

---

## ベースライン管理

### ベースライン画像の保存場所

```
project/
├── tests/
│   └── visual/
│       ├── homepage.spec.ts
│       └── components.spec.ts
├── tests-results/          # テスト実行結果（git ignoreに含める）
└── playwright/
    └── screenshots/        # ベースライン画像（gitにコミット）
        ├── homepage-desktop.png
        ├── homepage-mobile.png
        └── components-buttons.png
```

### ベースライン更新のワークフロー

```bash
# ベースライン画像を更新
pnpm playwright test --update-snapshots

# 特定のテストのみ更新
pnpm playwright test visual/homepage.spec.ts --update-snapshots

# UIモードで差分を確認しながら更新
pnpm playwright test --ui
```

### Git管理

```gitignore
# .gitignore

# テスト結果は無視
tests-results/
playwright-report/

# ベースライン画像はコミット（重要）
!playwright/screenshots/

# 差分画像は無視
*-actual.png
*-diff.png
```

---

## CI/CD統合

### GitHub Actions設定例

```yaml
# .github/workflows/visual-regression.yml
name: Visual Regression Tests

on:
  pull_request:
    branches: [main]

jobs:
  visual-regression:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - uses: actions/setup-node@v3
        with:
          node-version: "20"

      - name: Install dependencies
        run: pnpm install

      - name: Install Playwright browsers
        run: pnpm playwright install --with-deps chromium

      - name: Run visual regression tests
        run: pnpm playwright test --grep @visual

      - name: Upload test results
        if: failure()
        uses: actions/upload-artifact@v3
        with:
          name: visual-regression-results
          path: |
            playwright-report/
            tests-results/
            **/*-actual.png
            **/*-diff.png
          retention-days: 30
```

### ベースライン更新のPR例

```yaml
# .github/workflows/update-baselines.yml
name: Update Visual Baselines

on:
  workflow_dispatch: # 手動トリガー

jobs:
  update-baselines:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - uses: actions/setup-node@v3
        with:
          node-version: "20"

      - name: Install dependencies
        run: pnpm install

      - name: Install Playwright browsers
        run: pnpm playwright install --with-deps chromium

      - name: Update screenshots
        run: pnpm playwright test --update-snapshots

      - name: Create Pull Request
        uses: peter-evans/create-pull-request@v5
        with:
          commit-message: "chore: update visual regression baselines"
          title: "Update Visual Regression Baselines"
          body: |
            This PR updates the visual regression test baselines.

            Please review the updated screenshots carefully.
          branch: update-visual-baselines
```

---

## メンテナンス戦略

### 定期的なレビュー

```typescript
// tests/visual/critical-pages.spec.ts
import { test, expect } from "@playwright/test";

/**
 * クリティカルページの視覚的回帰テスト
 *
 * レビュー頻度: 毎週
 * 最終更新: 2024-01-15
 * 担当: UI/UXチーム
 */
test.describe("クリティカルページ", () => {
  test("トップページ", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    await expect(page).toHaveScreenshot("homepage.png", {
      fullPage: true,
      animations: "disabled",
      // 動的コンテンツをマスキング
      mask: [
        page.locator('[data-testid="current-time"]'),
        page.locator('[data-testid="user-avatar"]'),
      ],
    });
  });
});
```

### 変更の影響範囲を明確化

```typescript
// tests/visual/component-library.spec.ts
import { test, expect } from "@playwright/test";

/**
 * デザインシステムコンポーネント
 *
 * 変更時の影響範囲:
 * - すべてのページ（ボタン、フォーム要素）
 * - ダッシュボード（カード、テーブル）
 *
 * 更新前の手順:
 * 1. デザインチームのレビュー
 * 2. 全ページのスクリーンショット確認
 * 3. ベースライン更新
 */
test.describe("デザインシステム", () => {
  test("すべてのコンポーネント", async ({ page }) => {
    await page.goto("/design-system");
    await expect(page).toHaveScreenshot("design-system.png", {
      fullPage: true,
    });
  });
});
```

---

## ベストプラクティスまとめ

### DO ✅

- **重要なページに集中**: すべてではなく、クリティカルなページのみ
- **動的コンテンツをマスキング**: 時刻、ユーザー名、ランダムデータ
- **適切な閾値設定**: 完全一致ではなく、許容可能な差異を設定
- **ベースライン管理**: Gitにコミット、定期的にレビュー
- **CI/CD統合**: PRごとに視覚的回帰テストを実行
- **命名規則**: `{page}-{device}-{state}.png`形式
- **ドキュメント化**: 変更時の影響範囲を明示

### DON'T ❌

- **すべてをテストしない**: メンテナンスコストが高くなる
- **動的コンテンツを含めない**: フレーキーテストの原因
- **差分を無視しない**: すべての差分を確認してから承認
- **ベースラインを安易に更新しない**: レビュープロセスを経る
- **環境依存を許容しない**: OSやブラウザバージョンを固定
- **アニメーションを含めない**: 常に`animations: 'disabled'`

---

## まとめ

効果的な視覚的回帰テストは、適切な対象選定、差分許容設定、ベースライン管理により実現されます。

**キーポイント**:

1. **選択と集中**: クリティカルなページ/コンポーネントのみ
2. **動的コンテンツ対策**: マスキング、固定化
3. **適切な閾値**: 完全一致ではなく、許容可能な差異
4. **ベースライン管理**: Git、定期レビュー、自動化
5. **CI/CD統合**: PRごとの自動実行、差分レポート

これらのベストプラクティスを適用することで、メンテナンス可能で効果的な視覚的回帰テストを構築できます。
