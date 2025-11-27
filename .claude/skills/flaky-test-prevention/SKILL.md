---
name: flaky-test-prevention
description: |
    フレーキー（不安定）なテストを防止する技術。
    非決定性の排除、リトライロジック、安定性向上パターンを提供します。
    専門分野:
    - 非決定性排除: 時刻依存、ランダム性、外部API依存の制御とモック化
    - リトライロジック: 自動リトライ、カスタムリトライ、段階的バックオフ設計
    - 待機戦略最適化: 固定時間待機禁止、条件ベース待機パターン
    - デバッグ容易性: 失敗時の診断情報自動収集（スクリーンショット、トレース）
    使用タイミング:
    - テストが時々失敗する時
    - テスト実行結果が不安定な時
    - 並列実行時の問題が発生する時
    - 固定時間待機を排除する必要がある時
    - 非決定的要素（時刻、ランダム性）を制御する時
    Use proactively when tests exhibit intermittent failures, implementing retry logic,
    or eliminating non-deterministic test behavior.

  📚 リソース参照:
  このスキルには以下のリソースが含まれています。
  必要に応じて該当するリソースを参照してください:

  - `.claude/skills/flaky-test-prevention/resources/non-determinism-patterns.md`: 時刻依存・ランダム性・外部API依存の非決定的要素の制御パターン
  - `.claude/skills/flaky-test-prevention/resources/retry-strategies.md`: 自動リトライ・段階的バックオフ・カスタムリトライロジックの設計
  - `.claude/skills/flaky-test-prevention/resources/stability-checklist.md`: テスト安定性確認チェックリストと診断ガイド
  - `.claude/skills/flaky-test-prevention/templates/stable-test-template.ts`: 安定性を考慮したテスト実装テンプレート
  - `.claude/skills/flaky-test-prevention/scripts/detect-flaky-tests.mjs`: フレーキーテスト検出スクリプト

version: 1.0.0
---

# Flaky Test Prevention Skill

## 概要

フレーキー（不安定）なテストを防止する技術。非決定性の排除、リトライロジック、安定性向上パターンを提供。

## 核心概念

### 1. 非決定性の排除

**原因**: 時刻依存、ランダム性、外部 API

**解決策**:

```typescript
// ❌ 非決定的
const now = new Date();

// ✅ 決定的（モック化）
test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    Date.now = () => 1609459200000; // 固定
  });
});

// ランダム性の固定
await page.addInitScript(() => {
  Math.random = () => 0.5; // 固定
});
```

### 2. リトライロジック

```typescript
// テストレベルリトライ
test.describe.configure({ retries: 2 });

// 個別操作リトライ
await expect(async () => {
  const response = await page.request.get("/api/status");
  expect(response.status()).toBe(200);
}).toPass({ timeout: 10000, intervals: [1000, 2000, 5000] });
```

### 3. 適切な待機

```typescript
// ❌ 固定待機（フレーキーの原因）
await page.waitForTimeout(3000);

// ✅ 条件ベース待機
await page.waitForSelector('[data-testid="loaded"]');
await expect(page.getByText("Ready")).toBeVisible();
```

## 実装パターン

### パターン 1: 安定性確保パターン

```typescript
test("安定したテスト", async ({ page }) => {
  // ページロード待機
  await page.goto("/", { waitUntil: "networkidle" });

  // 要素の安定性確認
  await page.waitForSelector('[data-testid="button"]', {
    state: "visible",
    timeout: 5000,
  });

  // アクション実行
  await page.getByTestId("button").click();

  // 結果待機
  await expect(page.getByText("Success")).toBeVisible({ timeout: 10000 });
});
```

### パターン 2: 外部依存の分離

```typescript
test.beforeEach(async ({ context }) => {
  // 外部APIをモック
  await context.route("**/api.external.com/**", (route) => {
    route.fulfill({
      status: 200,
      body: JSON.stringify({ data: "mocked" }),
    });
  });
});
```

### パターン 3: アニメーション無効化

```typescript
// playwright.config.ts
export default {
  use: {
    // CSSアニメーション無効化
    launchOptions: {
      args: ["--disable-animations"],
    },
  },
};

// またはCSS注入
test.beforeEach(async ({ page }) => {
  await page.addStyleTag({
    content: "* { transition: none !important; animation: none !important; }",
  });
});
```

## ベストプラクティス

### DO（推奨）

1. **自動リトライ使用**:

```typescript
test.describe.configure({ retries: process.env.CI ? 2 : 0 });
```

2. **非決定性の排除**:

```typescript
// 時刻固定
await page.clock.install({ time: new Date("2024-01-01") });

// ランダム性排除
await page.addInitScript(() => {
  Math.random = () => 0.5;
});
```

3. **デバッグ情報収集**:

```typescript
test.afterEach(async ({ page }, testInfo) => {
  if (testInfo.status !== "passed") {
    await page.screenshot({ path: `failure-${testInfo.title}.png` });
  }
});
```

### DON'T（非推奨）

1. **固定時間待機を使用しない**
2. **外部 API に直接依存しない**
3. **アニメーションを無視しない**

## 関連スキル

- **playwright-testing** (`.claude/skills/playwright-testing/SKILL.md`): 基本操作
- **test-data-management** (`.claude/skills/test-data-management/SKILL.md`): データ分離
- **api-mocking** (`.claude/skills/api-mocking/SKILL.md`): 外部依存排除

## リソース

- [resources/non-determinism-patterns.md](resources/non-determinism-patterns.md) - 非決定性のパターンと対処法
- [resources/retry-strategies.md](resources/retry-strategies.md) - リトライロジックの詳細パターン
- [resources/stability-checklist.md](resources/stability-checklist.md) - テスト安定性チェックリスト
- [scripts/detect-flaky-tests.mjs](scripts/detect-flaky-tests.mjs) - フレーキーテスト検出スクリプト
- [templates/stable-test-template.ts](templates/stable-test-template.ts) - 安定性を考慮したテストテンプレート
