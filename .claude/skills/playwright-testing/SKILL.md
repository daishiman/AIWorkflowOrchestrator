---
name: playwright-testing
description: |
  Playwrightによるブラウザ自動化テストの実装技術。
  安定した待機戦略、適切なセレクタ選択、効率的なテスト設計を提供します。

  📚 リソース参照:
  このスキルには以下のリソースが含まれています。
  必要に応じて該当するリソースを参照してください:

  - `.claude/skills/playwright-testing/resources/playwright-best-practices.md`: Playwrightテスト設計のベストプラクティス（安定性、保守性、並列実行）
  - `.claude/skills/playwright-testing/resources/selector-strategies.md`: data-testid、Role-based、Label-basedセレクタの優先順位と使い分け
  - `.claude/skills/playwright-testing/resources/waiting-strategies.md`: 自動待機、明示的待機、条件ベース待機の使い分けとフレーキーテスト回避
  - `.claude/skills/playwright-testing/scripts/validate-test-structure.mjs`: Playwrightテストファイルの構造と命名規則を検証
  - `.claude/skills/playwright-testing/templates/test-template.ts`: Page Object Model、Fixture活用を含むPlaywrightテストのTypeScriptテンプレート

  専門分野:
  - セレクタ戦略: data-testid、Role-based、Label-basedの優先順位設計
  - 待機戦略: 自動待機、明示的待機、条件ベース待機パターン
  - テスト構造: Page Object Model、Fixture活用、並列実行最適化
  - ブラウザコンテキスト: 独立した環境管理、認証状態の再利用

  使用タイミング:
  - E2Eテストの実装が必要な時
  - ブラウザ自動化テストが求められる時
  - フレーキーテストの問題を解決する時
  - クロスブラウザテストが必要な時
  - Playwrightのセレクタ戦略を適用する時
  - テスト待機戦略の最適化が必要な時

  Use proactively when implementing E2E tests, troubleshooting flaky tests,
  or optimizing browser automation strategies.
version: 1.0.0
---

# Playwright Testing Skill

## 概要

Playwright によるブラウザ自動化テストの実装技術。安定した待機戦略、適切なセレクタ選択、効率的なテスト設計を提供します。

## 核心概念

### 1. Playwright の基本アーキテクチャ

Playwright は、Chromium、Firefox、WebKit を統一 API で制御できるブラウザ自動化ツールです。

**主要コンポーネント**:

- **Browser**: ブラウザインスタンス
- **Context**: 独立したブラウザセッション（Cookie、ストレージ分離）
- **Page**: 個別のタブまたはウィンドウ
- **Locator**: 要素を特定するためのセレクタ

### 2. 安定した待機戦略

**明示的待機の重要性**:

```typescript
// ❌ 悪い例: 固定時間待機
await page.waitForTimeout(5000);

// ✅ 良い例: 条件ベース待機
await page.waitForSelector('[data-testid="submit-button"]');
await page.waitForLoadState("networkidle");
```

**待機戦略の種類**:

1. **要素出現待機**: `waitForSelector()`
2. **ネットワークアイドル待機**: `waitForLoadState('networkidle')`
3. **条件待機**: `waitForFunction()`
4. **自動待機**: Locator API が自動的に待機

### 3. セレクタ戦略

**セレクタ優先順位**:

1. **data-testid 属性** (最優先):

```typescript
await page.locator('[data-testid="login-button"]').click();
```

2. **アクセシビリティセレクタ**:

```typescript
await page.getByRole("button", { name: "Submit" }).click();
await page.getByLabel("Email").fill("test@example.com");
```

3. **テキストベース**:

```typescript
await page.getByText("Login").click();
```

4. **CSS セレクタ** (最終手段):

```typescript
await page.locator(".btn-primary").click(); // 避けるべき
```

### 4. テスト構造とフック

**基本構造**:

```typescript
import { test, expect } from "@playwright/test";

test.describe("認証フロー", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("https://example.com");
  });

  test("正常ログイン", async ({ page }) => {
    // Given: 初期状態
    await page.getByLabel("Email").fill("user@example.com");
    await page.getByLabel("Password").fill("password123");

    // When: アクション
    await page.getByRole("button", { name: "Login" }).click();

    // Then: 検証
    await expect(page).toHaveURL("/dashboard");
    await expect(page.getByText("Welcome")).toBeVisible();
  });

  test.afterEach(async ({ page }) => {
    // クリーンアップ
  });
});
```

### 5. 並列実行とテスト分離

**テスト並列実行**:

```typescript
// playwright.config.ts
export default {
  workers: 4, // 並列実行数
  fullyParallel: true,
};
```

**テストコンテキスト分離**:

```typescript
test.use({
  storageState: "auth.json", // 認証状態の再利用
});
```

## 実装パターン

### パターン 1: Page Object Model (POM)

```typescript
// pages/LoginPage.ts
export class LoginPage {
  constructor(private page: Page) {}

  async goto() {
    await this.page.goto("/login");
  }

  async login(email: string, password: string) {
    await this.page.getByLabel("Email").fill(email);
    await this.page.getByLabel("Password").fill(password);
    await this.page.getByRole("button", { name: "Login" }).click();
  }

  async getErrorMessage() {
    return this.page.getByTestId("error-message").textContent();
  }
}

// tests/login.spec.ts
test("ログイン失敗時のエラー表示", async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.goto();
  await loginPage.login("invalid@example.com", "wrong");

  const error = await loginPage.getErrorMessage();
  expect(error).toContain("Invalid credentials");
});
```

### パターン 2: Fixture 活用

```typescript
// fixtures/testUser.ts
import { test as base } from "@playwright/test";

export const test = base.extend({
  authenticatedPage: async ({ page }, use) => {
    // セットアップ
    await page.goto("/login");
    await page.getByLabel("Email").fill("test@example.com");
    await page.getByLabel("Password").fill("password");
    await page.getByRole("button", { name: "Login" }).click();
    await page.waitForURL("/dashboard");

    // テストに渡す
    await use(page);

    // クリーンアップ
    await page.context().close();
  },
});

// tests/dashboard.spec.ts
test("ダッシュボード表示", async ({ authenticatedPage }) => {
  await expect(authenticatedPage.getByText("Dashboard")).toBeVisible();
});
```

### パターン 3: API 呼び出しとの連携

```typescript
test("APIとUIの統合テスト", async ({ page, request }) => {
  // APIでデータ準備
  const response = await request.post("/api/users", {
    data: { name: "Test User", email: "test@example.com" },
  });
  const user = await response.json();

  // UIで確認
  await page.goto("/users");
  await expect(page.getByText(user.name)).toBeVisible();
});
```

## 判断基準

### いつこのスキルを使うべきか

- [ ] ブラウザでのユーザーインタラクションをテストする必要がある
- [ ] クロスブラウザ互換性を検証する必要がある
- [ ] E2E テストの自動化が求められている
- [ ] 視覚的な検証（レンダリング確認）が必要

### いつ他の手段を使うべきか

- [ ] 単体テスト（Vitest 等で十分）
- [ ] API テスト（Supertest 等が適切）
- [ ] パフォーマンステスト（専門ツールを使用）

## ベストプラクティス

### DO（推奨）

1. **data-testid 属性を使用**:

```typescript
<button data-testid="submit-button">Submit</button>;

await page.locator('[data-testid="submit-button"]').click();
```

2. **自動待機を活用**:

```typescript
// Locator APIは自動的に要素が利用可能になるまで待機
await page.getByRole("button").click();
```

3. **明示的なアサーション**:

```typescript
await expect(page.getByText("Success")).toBeVisible();
await expect(page).toHaveURL("/dashboard");
```

4. **テスト独立性を保つ**:

```typescript
test.beforeEach(async ({ page }) => {
  // 各テストで初期状態をリセット
  await page.goto("/");
});
```

### DON'T（非推奨）

1. **固定時間待機を避ける**:

```typescript
// ❌
await page.waitForTimeout(3000);

// ✅
await page.waitForSelector('[data-testid="loaded"]');
```

2. **脆弱なセレクタを避ける**:

```typescript
// ❌
await page.locator(".btn.btn-primary.mt-3").click();

// ✅
await page.locator('[data-testid="submit-btn"]').click();
```

3. **過度な並列実行を避ける**:

```typescript
// workers: 50 は避ける（リソース枯渇）
```

## トラブルシューティング

### 問題 1: 要素が見つからない

**症状**: `TimeoutError: locator.click: Timeout 30000ms exceeded`

**解決策**:

```typescript
// デバッグ: 要素の存在確認
await page.screenshot({ path: "debug.png" });
console.log(await page.content()); // HTML確認

// 待機戦略の調整
await page.waitForLoadState("networkidle");
await page.waitForSelector('[data-testid="button"]', { state: "visible" });
```

### 問題 2: フレーキーテスト

**症状**: テストが時々失敗する

**解決策**:

```typescript
// リトライ設定
test.describe.configure({ retries: 2 });

// より安定した待機
await expect(page.getByText("Loaded")).toBeVisible({ timeout: 10000 });
```

### 問題 3: 並列実行時のデータ競合

**症状**: テストが干渉し合う

**解決策**:

```typescript
// テストごとに一意なデータ
const userId = `user-${Date.now()}`;

// または並列実行を無効化
test.describe.configure({ mode: "serial" });
```

## 関連スキル

- **test-data-management** (`.claude/skills/test-data-management/SKILL.md`): テストデータのセットアップとクリーンアップ
- **flaky-test-prevention** (`.claude/skills/flaky-test-prevention/SKILL.md`): テストの安定化技術
- **visual-regression-testing** (`.claude/skills/visual-regression-testing/SKILL.md`): 視覚的回帰テスト
- **api-mocking** (`.claude/skills/api-mocking/SKILL.md`): API モックとテスト環境構築

## リソース

- [resources/playwright-best-practices.md](resources/playwright-best-practices.md) - Playwright のベストプラクティス詳細
- [resources/selector-strategies.md](resources/selector-strategies.md) - セレクタ戦略の詳細ガイド
- [resources/waiting-strategies.md](resources/waiting-strategies.md) - 待機戦略の詳細
- [scripts/validate-test-structure.mjs](scripts/validate-test-structure.mjs) - テスト構造検証スクリプト
- [templates/test-template.ts](templates/test-template.ts) - テストテンプレート

## 参考文献

- Playwright 公式ドキュメント: https://playwright.dev/
- 『End-to-End Web Testing』 - ユーザーフロー中心のテスト設計
- 『Playwright 実践入門』 - フレーキーテスト防止技術
