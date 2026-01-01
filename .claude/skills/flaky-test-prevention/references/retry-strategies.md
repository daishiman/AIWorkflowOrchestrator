# リトライ戦略

E2Eテストでは一時的なネットワーク障害やタイミング問題により、正常なコードでもテストが失敗することがあります。
このリソースでは、適切なリトライ戦略とその実装方法を解説します。

---

## 目次

1. [リトライの必要性](#リトライの必要性)
2. [Playwrightの自動リトライ](#playwrightの自動リトライ)
3. [カスタムリトライロジック](#カスタムリトライロジック)
4. [段階的バックオフ](#段階的バックオフ)
5. [リトライのベストプラクティス](#リトライのベストプラクティス)

---

## リトライの必要性

### リトライが必要なケース

✅ **一時的なネットワーク障害**: 接続タイムアウト、502エラー
✅ **非同期処理の遅延**: 予想より時間がかかる処理
✅ **外部サービスの一時的な不調**: CDN、認証サービス
✅ **CI環境の不安定性**: リソース制約、並列実行の競合

### リトライが不要なケース（根本原因を修正すべき）

❌ **コードのバグ**: リトライではなくバグ修正
❌ **設計の問題**: テストの設計を見直す
❌ **環境設定の誤り**: 環境変数、依存関係
❌ **非決定的なテスト**: リトライではなく決定的なテストに修正

---

## Playwrightの自動リトライ

### グローバル設定

```typescript
// playwright.config.ts
import { defineConfig } from "@playwright/test";

export default defineConfig({
  // すべてのテストで自動リトライを有効化
  retries: process.env.CI ? 2 : 0, // CI環境では2回リトライ

  // タイムアウト設定
  timeout: 30 * 1000, // テスト全体のタイムアウト: 30秒
  expect: {
    timeout: 5 * 1000, // expectのタイムアウト: 5秒
  },

  use: {
    // アクションのタイムアウト
    actionTimeout: 10 * 1000, // click, fill などのタイムアウト: 10秒

    // ナビゲーションのタイムアウト
    navigationTimeout: 30 * 1000, // goto, waitForNavigation などのタイムアウト: 30秒

    // トレース記録（リトライ時のみ）
    trace: "on-first-retry", // 最初のリトライ時にトレースを記録
    screenshot: "only-on-failure", // 失敗時のみスクリーンショット
    video: "retain-on-failure", // 失敗時のみビデオ保持
  },
});
```

**メリット**:

- 設定ファイルで一元管理
- CI環境とローカル環境で動作を切り替え
- トレース/スクリーンショットで失敗原因を分析

---

### テストレベルでのリトライ設定

```typescript
// tests/critical-flow.spec.ts
import { test, expect } from "@playwright/test";

// 特定のテストスイートでリトライ設定を上書き
test.describe("重要なワークフロー", () => {
  test.describe.configure({ retries: 3 }); // このスイートは3回リトライ

  test("決済フロー", async ({ page }) => {
    await page.goto("/checkout");
    await page.fill('input[name="card"]', "4242424242424242");
    await page.click('button:has-text("支払う")');
    await expect(page.locator(".success-message")).toBeVisible();
  });
});

// 個別のテストでリトライ設定
test("不安定なテスト", { retries: 5 }, async ({ page }) => {
  // このテストのみ5回リトライ
  await page.goto("/flaky-page");
  await expect(page.locator(".content")).toBeVisible();
});

// リトライを無効化
test("リトライ不要なテスト", { retries: 0 }, async ({ page }) => {
  await page.goto("/stable-page");
  await expect(page.locator(".title")).toContainText("Stable");
});
```

---

### リトライ情報の取得

```typescript
// tests/retry-aware.spec.ts
import { test, expect } from "@playwright/test";

test("リトライ回数を確認", async ({ page }, testInfo) => {
  console.log(`Current retry: ${testInfo.retry}`); // 現在のリトライ回数（0, 1, 2...）

  // リトライ時に異なる動作をする（通常は推奨しない）
  if (testInfo.retry > 0) {
    console.log("これはリトライ実行です");
    // 例: リトライ時はキャッシュをクリア
    await page.context().clearCookies();
  }

  await page.goto("/dashboard");
  await expect(page.locator(".data")).toBeVisible();
});
```

---

## カスタムリトライロジック

### Fixtureベースのリトライ

```typescript
// tests/fixtures/retry-fixtures.ts
import { test as base } from "@playwright/test";

type RetryFixtures = {
  retryableAction: <T>(
    action: () => Promise<T>,
    options?: { maxRetries?: number; delay?: number },
  ) => Promise<T>;
};

export const test = base.extend<RetryFixtures>({
  retryableAction: async ({}, use) => {
    const retryAction = async <T>(
      action: () => Promise<T>,
      options: { maxRetries?: number; delay?: number } = {},
    ): Promise<T> => {
      const maxRetries = options.maxRetries ?? 3;
      const delay = options.delay ?? 1000;
      let lastError: Error | undefined;

      for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
          return await action();
        } catch (error) {
          lastError = error as Error;
          console.log(`Attempt ${attempt}/${maxRetries} failed: ${error}`);

          if (attempt < maxRetries) {
            console.log(`Retrying in ${delay}ms...`);
            await new Promise((resolve) => setTimeout(resolve, delay));
          }
        }
      }

      throw new Error(
        `Action failed after ${maxRetries} retries: ${lastError?.message}`,
      );
    };

    await use(retryAction);
  },
});

export { expect } from "@playwright/test";
```

### 使用例

```typescript
// tests/api-integration.spec.ts
import { test, expect } from "./fixtures/retry-fixtures";

test("不安定なAPIエンドポイント", async ({ page, retryableAction }) => {
  await page.goto("/dashboard");

  // 不安定なボタンクリックをリトライ
  await retryableAction(
    async () => {
      const button = page.locator('button:has-text("データ更新")');
      await expect(button).toBeVisible({ timeout: 5000 });
      await button.click();
      await expect(page.locator(".success-toast")).toBeVisible({
        timeout: 3000,
      });
    },
    { maxRetries: 5, delay: 2000 },
  );

  await expect(page.locator(".updated-data")).toBeVisible();
});
```

---

### ポーリング戦略

一定間隔で条件をチェックし、条件が満たされるまで待機。

```typescript
// tests/helpers/polling.ts
export async function pollUntil<T>(
  action: () => Promise<T>,
  condition: (result: T) => boolean,
  options: {
    interval?: number;
    timeout?: number;
  } = {},
): Promise<T> {
  const interval = options.interval ?? 1000;
  const timeout = options.timeout ?? 30000;
  const startTime = Date.now();

  while (true) {
    try {
      const result = await action();
      if (condition(result)) {
        return result;
      }
    } catch (error) {
      // エラーは無視してリトライ
      console.log(`Polling attempt failed: ${error}`);
    }

    if (Date.now() - startTime > timeout) {
      throw new Error(`Polling timed out after ${timeout}ms`);
    }

    await new Promise((resolve) => setTimeout(resolve, interval));
  }
}
```

### 使用例

```typescript
// tests/async-processing.spec.ts
import { test, expect } from "@playwright/test";
import { pollUntil } from "./helpers/polling";

test("非同期ジョブの完了を待つ", async ({ page, request }) => {
  // ジョブを開始
  await page.goto("/jobs/new");
  await page.click('button:has-text("実行")');

  // ジョブIDを取得
  const jobId = await page.locator(".job-id").textContent();

  // ジョブの完了をポーリング
  const result = await pollUntil(
    async () => {
      const response = await request.get(`/api/jobs/${jobId}`);
      return response.json();
    },
    (data) => data.status === "completed",
    { interval: 2000, timeout: 60000 }, // 2秒ごと、最大60秒
  );

  expect(result.status).toBe("completed");
  await page.reload();
  await expect(page.locator(".job-result")).toContainText("成功");
});
```

---

## 段階的バックオフ

リトライ回数が増えるごとに待機時間を増やす戦略（Exponential Backoff）。

### 実装

```typescript
// tests/helpers/exponential-backoff.ts
export async function retryWithBackoff<T>(
  action: () => Promise<T>,
  options: {
    maxRetries?: number;
    initialDelay?: number;
    maxDelay?: number;
    factor?: number;
  } = {},
): Promise<T> {
  const maxRetries = options.maxRetries ?? 5;
  const initialDelay = options.initialDelay ?? 1000;
  const maxDelay = options.maxDelay ?? 30000;
  const factor = options.factor ?? 2;

  let delay = initialDelay;
  let lastError: Error | undefined;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await action();
    } catch (error) {
      lastError = error as Error;
      console.log(`Attempt ${attempt}/${maxRetries} failed: ${error}`);

      if (attempt < maxRetries) {
        // ジッター（ランダムな揺らぎ）を追加して、同時リトライの衝突を防ぐ
        const jitter = Math.random() * 0.3 * delay; // ±30%の揺らぎ
        const actualDelay = Math.min(delay + jitter, maxDelay);

        console.log(`Retrying in ${Math.round(actualDelay)}ms...`);
        await new Promise((resolve) => setTimeout(resolve, actualDelay));

        // 次回の待機時間を指数的に増やす
        delay = Math.min(delay * factor, maxDelay);
      }
    }
  }

  throw new Error(
    `Action failed after ${maxRetries} retries: ${lastError?.message}`,
  );
}
```

### 使用例

```typescript
// tests/rate-limited-api.spec.ts
import { test, expect } from "@playwright/test";
import { retryWithBackoff } from "./helpers/exponential-backoff";

test("レート制限のあるAPI", async ({ page, request }) => {
  await page.goto("/dashboard");

  // APIリクエストを段階的バックオフでリトライ
  const data = await retryWithBackoff(
    async () => {
      const response = await request.get("/api/rate-limited-endpoint");
      if (!response.ok()) {
        throw new Error(`HTTP ${response.status()}`);
      }
      return response.json();
    },
    {
      maxRetries: 5,
      initialDelay: 1000, // 1秒
      maxDelay: 16000, // 最大16秒
      factor: 2, // 1秒 → 2秒 → 4秒 → 8秒 → 16秒
    },
  );

  expect(data).toHaveProperty("items");
});
```

---

## リトライのベストプラクティス

### DO ✅

- **CI環境でのみリトライ**: ローカルではリトライなしでテスト安定性を確認
- **適切なタイムアウト**: 短すぎるタイムアウトはリトライを無駄にする
- **トレース記録**: `trace: 'on-first-retry'`で失敗原因を分析
- **段階的バックオフ**: ネットワークやレート制限の問題に対応
- **ジッター追加**: 同時リトライの衝突を防ぐ
- **リトライ回数の制限**: 無限リトライは避ける（最大5回程度）

### DON'T ❌

- **根本原因を無視**: リトライで隠さず、テストを修正
- **過度なリトライ**: 10回以上のリトライは設計に問題
- **固定待機時間**: `waitForTimeout`ではなく条件ベースの待機
- **リトライ依存のテスト**: リトライなしでも安定するテストを目指す
- **エラーの無視**: リトライ中のエラーログを確認し、パターンを分析

---

### リトライ vs 根本原因修正

| 症状                     | リトライ  | 根本原因修正              |
| ------------------------ | --------- | ------------------------- |
| 一時的なネットワーク障害 | ✅ 適切   | -                         |
| CI環境のリソース制約     | ✅ 適切   | -                         |
| テストの非決定性         | ❌ 不適切 | ✅ テストを決定的に修正   |
| 固定タイムアウト         | ❌ 不適切 | ✅ 条件ベースの待機に変更 |
| コードのバグ             | ❌ 不適切 | ✅ バグ修正               |
| 外部API依存              | ⚠️ 一時的 | ✅ モックを使用           |

---

### リトライ設定の推奨値

```typescript
// playwright.config.ts
export default defineConfig({
  // 環境別のリトライ設定
  retries: process.env.CI
    ? 2 // CI環境: 2回リトライ
    : process.env.STAGING
      ? 1 // ステージング: 1回リトライ
      : 0, // ローカル: リトライなし

  // タイムアウト設定
  timeout: 60 * 1000, // テスト全体: 60秒
  expect: {
    timeout: 10 * 1000, // expect: 10秒
  },

  use: {
    actionTimeout: 15 * 1000, // アクション: 15秒
    navigationTimeout: 30 * 1000, // ナビゲーション: 30秒

    // 失敗時の診断
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },
});
```

---

## まとめ

適切なリトライ戦略により、一時的な問題に対してテストを堅牢にできます。

**キーポイント**:

1. **Playwrightの自動リトライ**: CI環境で有効化
2. **カスタムリトライ**: 特定の操作に対してリトライロジックを実装
3. **段階的バックオフ**: ネットワーク問題やレート制限に対応
4. **トレース記録**: リトライ時の失敗原因を分析
5. **根本原因修正**: リトライで隠さず、テストを改善

リトライは**一時的な問題への対処**であり、**根本原因の修正**を優先すべきです。
