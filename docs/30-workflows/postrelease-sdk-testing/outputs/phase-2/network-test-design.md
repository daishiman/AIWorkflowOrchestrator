# Phase 2: ネットワーク障害テスト設計書

## メタ情報

| 項目     | 内容                  |
| -------- | --------------------- |
| タスクID | AGENT-005-POSTRELEASE |
| Phase    | 2                     |
| 作成日   | 2026-01-12            |

---

## 1. テスト概要

### 1.1 目的

ネットワーク障害発生時のエラーハンドリングと復旧動作を検証する。

### 1.2 テストシナリオ

| シナリオ         | 検証内容                     |
| ---------------- | ---------------------------- |
| ネットワーク切断 | クエリ中の切断でエラー表示   |
| ネットワーク復旧 | 復旧後のセッション再開       |
| タイムアウト     | 設定時間でのタイムアウト発生 |
| 間欠的な接続     | 不安定な接続での動作         |

---

## 2. テストファイル構成

```
apps/desktop/e2e/agent-network-resilience.spec.ts
├── describe('ネットワーク切断')
│   ├── test('クエリ中の切断でエラー表示')
│   ├── test('セッション情報の保持')
│   └── test('オフライン表示')
├── describe('ネットワーク復旧')
│   ├── test('復旧検出')
│   ├── test('セッション再開')
│   └── test('クエリ再実行')
├── describe('タイムアウト')
│   ├── test('デフォルトタイムアウト')
│   └── test('カスタムタイムアウト')
└── describe('間欠的接続')
    └── test('不安定接続での動作')
```

---

## 3. ネットワークシミュレーション実装

### 3.1 Playwrightのネットワーク制御

```typescript
import { test, expect, Page, Route } from "@playwright/test";

// ネットワーク切断をシミュレート
async function simulateOffline(page: Page): Promise<void> {
  await page.route("**/*", (route: Route) =>
    route.abort("internetdisconnected"),
  );
}

// ネットワーク復旧をシミュレート
async function simulateOnline(page: Page): Promise<void> {
  await page.unroute("**/*");
}

// 遅延をシミュレート
async function simulateLatency(page: Page, latencyMs: number): Promise<void> {
  await page.route("**/*", async (route: Route) => {
    await new Promise((resolve) => setTimeout(resolve, latencyMs));
    await route.continue();
  });
}

// タイムアウトをシミュレート（レスポンスなし）
async function simulateTimeout(page: Page): Promise<void> {
  await page.route("**/api/**", (route: Route) => {
    // レスポンスを返さない（タイムアウトを発生させる）
  });
}
```

### 3.2 Electronプロセス側のネットワーク制御

```typescript
// Electronのネットワーク状態をシミュレート
async function setElectronOnlineStatus(
  page: Page,
  online: boolean,
): Promise<void> {
  await page.evaluate((isOnline) => {
    // Electron の navigator.onLine をオーバーライド
    Object.defineProperty(navigator, "onLine", {
      writable: true,
      value: isOnline,
    });

    // オンライン/オフラインイベントを発火
    window.dispatchEvent(new Event(isOnline ? "online" : "offline"));
  }, online);
}
```

---

## 4. テストシナリオ実装

### 4.1 ネットワーク切断テスト

```typescript
test.describe("ネットワーク切断", () => {
  test("クエリ中の切断でエラー表示", async ({ page }) => {
    // Arrange
    await setupSession(page);
    await page.fill('[data-testid="prompt-input"]', "Hello, Claude!");

    // Act
    await page.click('[data-testid="send-button"]');
    await page.waitForTimeout(500); // クエリ開始を待つ

    // ネットワーク切断
    await simulateOffline(page);
    await setElectronOnlineStatus(page, false);

    // Assert
    await expect(page.locator('[data-testid="error-message"]')).toContainText(
      "ネットワーク接続が切断されました",
      { timeout: 10000 },
    );
  });

  test("セッション情報の保持", async ({ page }) => {
    // Arrange
    const sessionId = await setupSession(page);

    // Act
    await simulateOffline(page);
    await setElectronOnlineStatus(page, false);
    await page.waitForTimeout(1000);

    // Assert - セッションIDが保持されていること
    await expect(page.locator('[data-testid="session-id"]')).toHaveText(
      sessionId,
    );
  });

  test("オフライン表示", async ({ page }) => {
    // Arrange
    await setupSession(page);

    // Act
    await simulateOffline(page);
    await setElectronOnlineStatus(page, false);

    // Assert
    await expect(page.locator('[data-testid="connection-status"]')).toHaveText(
      "オフライン",
    );
    await expect(
      page.locator('[data-testid="offline-indicator"]'),
    ).toBeVisible();
  });
});
```

### 4.2 ネットワーク復旧テスト

```typescript
test.describe("ネットワーク復旧", () => {
  test("復旧検出", async ({ page }) => {
    // Arrange
    await setupSession(page);
    await simulateOffline(page);
    await setElectronOnlineStatus(page, false);
    await page.waitForTimeout(1000);

    // Act
    await simulateOnline(page);
    await setElectronOnlineStatus(page, true);

    // Assert
    await expect(page.locator('[data-testid="connection-status"]')).toHaveText(
      "オンライン",
      { timeout: 10000 },
    );
  });

  test("セッション再開", async ({ page }) => {
    // Arrange
    const sessionId = await createSessionAndSendQuery(page, "My name is Test");
    await simulateOffline(page);
    await setElectronOnlineStatus(page, false);
    await page.waitForTimeout(1000);

    // Act
    await simulateOnline(page);
    await setElectronOnlineStatus(page, true);
    await page.waitForTimeout(1000);

    // セッションを再開して会話継続
    await page.fill('[data-testid="prompt-input"]', "What is my name?");
    await page.click('[data-testid="send-button"]');

    // Assert - 会話履歴が保持されていること
    await expect(page.locator('[data-testid="response-area"]')).toContainText(
      "Test",
      { timeout: 30000 },
    );
  });

  test("クエリ再実行", async ({ page }) => {
    // Arrange
    await setupSession(page);
    await simulateOffline(page);
    await setElectronOnlineStatus(page, false);
    await page.waitForTimeout(1000);

    // Act
    await simulateOnline(page);
    await setElectronOnlineStatus(page, true);
    await page.fill('[data-testid="prompt-input"]', "Hello after recovery");
    await page.click('[data-testid="send-button"]');

    // Assert
    await expect(page.locator('[data-testid="execution-status"]')).toHaveText(
      "completed",
      { timeout: 30000 },
    );
  });
});
```

### 4.3 タイムアウトテスト

```typescript
test.describe("タイムアウト", () => {
  test("デフォルトタイムアウト - 30秒", async ({ page }) => {
    // Arrange
    await setupSession(page);

    // 応答を遅延させる
    await page.route("**/api/**", async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 35000));
      await route.continue();
    });

    // Act
    await page.fill('[data-testid="prompt-input"]', "Test query");
    await page.click('[data-testid="send-button"]');

    // Assert
    await expect(page.locator('[data-testid="error-message"]')).toContainText(
      "タイムアウト",
      { timeout: 35000 },
    );
  });

  test("カスタムタイムアウト - 5秒", async ({ page }) => {
    // Arrange
    await setupSession(page);
    await page.evaluate(() => {
      window.agentAPI.setOption({ timeout: 5000 });
    });

    // 応答を遅延させる
    await page.route("**/api/**", async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 10000));
      await route.continue();
    });

    // Act
    await page.fill('[data-testid="prompt-input"]', "Test query");
    await page.click('[data-testid="send-button"]');

    // Assert
    await expect(page.locator('[data-testid="error-message"]')).toContainText(
      "タイムアウト",
      { timeout: 10000 },
    );
  });
});
```

### 4.4 間欠的接続テスト

```typescript
test.describe("間欠的接続", () => {
  test("不安定接続での動作", async ({ page }) => {
    // Arrange
    await setupSession(page);

    // 50%の確率でリクエスト失敗
    let requestCount = 0;
    await page.route("**/api/**", (route) => {
      requestCount++;
      if (requestCount % 2 === 0) {
        route.abort("connectionfailed");
      } else {
        route.continue();
      }
    });

    // Act - 複数回クエリ実行
    const results: boolean[] = [];
    for (let i = 0; i < 5; i++) {
      await page.fill('[data-testid="prompt-input"]', `Query ${i}`);
      await page.click('[data-testid="send-button"]');

      try {
        await page.waitForSelector(
          '[data-testid="execution-status"][data-status="completed"]',
          { timeout: 10000 },
        );
        results.push(true);
      } catch {
        results.push(false);
        // エラーをクリア
        await page.click('[data-testid="clear-error-button"]');
      }
      await page.waitForTimeout(500);
    }

    // Assert - 一部は成功すること
    const successCount = results.filter((r) => r).length;
    expect(successCount).toBeGreaterThan(0);
  });
});
```

---

## 5. エラーメッセージ検証

### 5.1 期待されるエラーメッセージ

| 状況             | エラーメッセージ                       | エラーコード          |
| ---------------- | -------------------------------------- | --------------------- |
| ネットワーク切断 | 「ネットワーク接続が切断されました」   | NETWORK_DISCONNECTED  |
| タイムアウト     | 「応答がタイムアウトしました（XX秒）」 | TIMEOUT               |
| 接続失敗         | 「サーバーに接続できませんでした」     | CONNECTION_FAILED     |
| DNS解決失敗      | 「サーバーが見つかりません」           | DNS_RESOLUTION_FAILED |

### 5.2 エラーメッセージテスト

```typescript
test("エラーメッセージが適切に表示される", async ({ page }) => {
  await setupSession(page);

  // ネットワーク切断
  await simulateOffline(page);
  await page.fill('[data-testid="prompt-input"]', "Test");
  await page.click('[data-testid="send-button"]');

  // エラーメッセージの内容を検証
  const errorMessage = await page
    .locator('[data-testid="error-message"]')
    .textContent();
  expect(errorMessage).toContain("ネットワーク");

  // エラーコードの検証
  const errorCode = await page
    .locator('[data-testid="error-code"]')
    .textContent();
  expect(["NETWORK_DISCONNECTED", "CONNECTION_FAILED"]).toContain(errorCode);
});
```

---

## 6. 復旧シナリオ

### 6.1 自動復旧

| シナリオ   | 期待動作                           |
| ---------- | ---------------------------------- |
| 一時的切断 | 自動リトライなし、手動再実行を促す |
| SDK再接続  | SDK内部で自動再接続を試行          |

### 6.2 手動復旧

| 操作           | 期待動作                  |
| -------------- | ------------------------- |
| 再実行ボタン   | 最後のクエリを再送信      |
| セッション再開 | resumeSession()で会話継続 |
| 新規セッション | 新しいセッションで再開    |

---

## 7. 実行方法

```bash
# ネットワーク障害テスト実行
pnpm --filter @repo/desktop test:e2e:network

# 特定テストのみ
pnpm --filter @repo/desktop test:e2e:network -- --grep "ネットワーク切断"
```

---

## 変更履歴

| 日付       | 変更者 | 内容     |
| ---------- | ------ | -------- |
| 2026-01-12 | Claude | 初版作成 |
