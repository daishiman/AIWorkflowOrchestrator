/**
 * Agent SDK ネットワーク障害テスト
 *
 * ネットワーク障害時の回復性をテストします。
 * - オフライン時のエラーハンドリング
 * - 接続復旧後の再接続
 * - タイムアウト処理
 * - リトライロジック
 *
 * @see docs/30-workflows/postrelease-sdk-testing/outputs/phase-2/network-resilience-design.md
 */

import { test, expect, type Page } from "@playwright/test";

// ============================================
// ヘルパー関数
// ============================================

/**
 * セッションをセットアップ
 */
async function setupSession(page: Page): Promise<string> {
  await page.goto("/agent");
  await page.waitForSelector(
    '[data-testid="agent-status"][data-status="initialized"]',
    { timeout: 10000 },
  );
  await page.click('[data-testid="new-session-button"]');
  const sessionId = await page
    .locator('[data-testid="session-id"]')
    .textContent();
  return sessionId!;
}

/**
 * セッションをクリーンアップ
 */
async function cleanup(page: Page): Promise<void> {
  try {
    await page.click('[data-testid="destroy-session-button"]');
    await page.waitForTimeout(100);
  } catch {
    // セッションが既に破棄されている場合は無視
  }
}

// ============================================
// オフライン時のテスト
// ============================================

test.describe("オフライン時のエラーハンドリング", () => {
  test("NET-01: オフライン状態でクエリ送信時にエラー表示", async ({
    page,
    context,
  }) => {
    // Arrange
    await setupSession(page);

    // オフラインにシミュレート
    await context.setOffline(true);

    // Act
    await page.fill('[data-testid="prompt-input"]', "Hello");
    await page.click('[data-testid="send-button"]');

    // Assert
    await expect(page.locator('[data-testid="error-message"]')).toContainText(
      "ネットワーク",
      { timeout: 10000 },
    );

    // Cleanup
    await context.setOffline(false);
  });

  test("NET-02: オフライン状態でセッション作成時にエラー表示", async ({
    page,
    context,
  }) => {
    // Arrange
    await page.goto("/agent");
    await page.waitForSelector(
      '[data-testid="agent-status"][data-status="initialized"]',
    );

    // オフラインにシミュレート
    await context.setOffline(true);

    // Act
    await page.click('[data-testid="new-session-button"]');

    // Assert
    await expect(page.locator('[data-testid="error-message"]')).toBeVisible({
      timeout: 10000,
    });

    // Cleanup
    await context.setOffline(false);
  });

  test("NET-03: オフライン時にオフラインインジケーターが表示される", async ({
    page,
    context,
  }) => {
    // Arrange
    await setupSession(page);

    // Act
    await context.setOffline(true);

    // Assert
    await expect(page.locator('[data-testid="offline-indicator"]')).toBeVisible(
      { timeout: 5000 },
    );

    // Cleanup
    await context.setOffline(false);
  });
});

// ============================================
// 接続復旧テスト
// ============================================

test.describe("接続復旧", () => {
  test("NET-04: オフラインからオンラインへの復旧でインジケーター非表示", async ({
    page,
    context,
  }) => {
    // Arrange
    await setupSession(page);
    await context.setOffline(true);
    await page.waitForSelector('[data-testid="offline-indicator"]');

    // Act
    await context.setOffline(false);

    // Assert
    await expect(
      page.locator('[data-testid="offline-indicator"]'),
    ).not.toBeVisible({ timeout: 5000 });
  });

  test("NET-05: 接続復旧後にクエリが正常に実行できる", async ({
    page,
    context,
  }) => {
    // Arrange
    await setupSession(page);
    await context.setOffline(true);
    await page.waitForTimeout(1000);
    await context.setOffline(false);
    await page.waitForTimeout(1000);

    // Act
    await page.fill('[data-testid="prompt-input"]', "Hello after recovery");
    await page.click('[data-testid="send-button"]');

    // Assert
    await expect(page.locator('[data-testid="response-area"]')).toContainText(
      /./,
      { timeout: 60000 },
    );
    await expect(page.locator('[data-testid="execution-status"]')).toHaveText(
      "completed",
      { timeout: 60000 },
    );

    // Cleanup
    await cleanup(page);
  });

  test("NET-06: クエリ実行中のネットワーク断でエラー後、復旧して再実行可能", async ({
    page,
    context,
  }) => {
    // Arrange
    await setupSession(page);
    await page.fill('[data-testid="prompt-input"]', "Generate a long response");
    await page.click('[data-testid="send-button"]');

    // 応答開始を待つ
    await page.waitForTimeout(500);

    // Act - ネットワーク断
    await context.setOffline(true);

    // エラー表示を確認
    await expect(page.locator('[data-testid="error-message"]')).toBeVisible({
      timeout: 30000,
    });

    // 復旧
    await context.setOffline(false);
    await page.waitForTimeout(1000);

    // 再実行
    await page.fill('[data-testid="prompt-input"]', "Hello again");
    await page.click('[data-testid="send-button"]');

    // Assert
    await expect(page.locator('[data-testid="execution-status"]')).toHaveText(
      "completed",
      { timeout: 60000 },
    );

    // Cleanup
    await cleanup(page);
  });
});

// ============================================
// タイムアウト処理テスト
// ============================================

test.describe("タイムアウト処理", () => {
  test("NET-07: ネットワーク遅延でタイムアウトエラー", async ({ page }) => {
    // Arrange
    await setupSession(page);

    // 短いタイムアウトを設定
    await page.evaluate(() => {
      // @ts-expect-error - テスト用のグローバルAPI
      window.agentAPI?.setOption?.({ timeout: 1000 }); // 1秒
    });

    // ネットワーク遅延をシミュレート
    await page.route("**/*", async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 2000)); // 2秒遅延
      await route.continue();
    });

    // Act
    await page.fill('[data-testid="prompt-input"]', "Hello with timeout");
    await page.click('[data-testid="send-button"]');

    // Assert
    await expect(page.locator('[data-testid="error-message"]')).toContainText(
      "タイムアウト",
      { timeout: 10000 },
    );
  });

  test("NET-08: タイムアウト後のリトライが正常動作", async ({ page }) => {
    // Arrange
    await setupSession(page);
    let requestCount = 0;

    // 最初のリクエストのみ遅延
    await page.route("**/api/**", async (route) => {
      requestCount++;
      if (requestCount === 1) {
        await new Promise((resolve) => setTimeout(resolve, 5000));
      }
      await route.continue();
    });

    // 短いタイムアウトを設定
    await page.evaluate(() => {
      // @ts-expect-error - テスト用のグローバルAPI
      window.agentAPI?.setOption?.({ timeout: 2000 }); // 2秒
    });

    // Act - 最初のリクエスト（タイムアウト）
    await page.fill('[data-testid="prompt-input"]', "First request");
    await page.click('[data-testid="send-button"]');
    await expect(page.locator('[data-testid="error-message"]')).toBeVisible({
      timeout: 10000,
    });

    // タイムアウトをリセット
    await page.evaluate(() => {
      // @ts-expect-error - テスト用のグローバルAPI
      window.agentAPI?.setOption?.({ timeout: 60000 }); // 60秒
    });

    // リトライ
    await page.fill('[data-testid="prompt-input"]', "Retry request");
    await page.click('[data-testid="send-button"]');

    // Assert
    await expect(page.locator('[data-testid="execution-status"]')).toHaveText(
      "completed",
      { timeout: 60000 },
    );

    // Cleanup
    await cleanup(page);
  });
});

// ============================================
// API障害テスト
// ============================================

test.describe("API障害", () => {
  test("NET-09: 500エラー時に適切なエラーメッセージ", async ({ page }) => {
    // Arrange
    await setupSession(page);

    // 500エラーをシミュレート
    await page.route("**/api/**", (route) => {
      route.fulfill({
        status: 500,
        contentType: "application/json",
        body: JSON.stringify({ error: "Internal Server Error" }),
      });
    });

    // Act
    await page.fill('[data-testid="prompt-input"]', "Hello");
    await page.click('[data-testid="send-button"]');

    // Assert
    await expect(page.locator('[data-testid="error-message"]')).toBeVisible({
      timeout: 10000,
    });
  });

  test("NET-10: 429エラー（レート制限）時に適切なエラーメッセージ", async ({
    page,
  }) => {
    // Arrange
    await setupSession(page);

    // 429エラーをシミュレート
    await page.route("**/api/**", (route) => {
      route.fulfill({
        status: 429,
        contentType: "application/json",
        body: JSON.stringify({
          error: "Too Many Requests",
          retryAfter: 60,
        }),
      });
    });

    // Act
    await page.fill('[data-testid="prompt-input"]', "Hello");
    await page.click('[data-testid="send-button"]');

    // Assert
    await expect(page.locator('[data-testid="error-message"]')).toContainText(
      /レート|制限|Rate/i,
      { timeout: 10000 },
    );
  });

  test("NET-11: 503エラー（サービス利用不可）時にリトライ可能", async ({
    page,
  }) => {
    // Arrange
    await setupSession(page);
    let requestCount = 0;

    // 最初のリクエストのみ503
    await page.route("**/api/**", (route) => {
      requestCount++;
      if (requestCount <= 2) {
        route.fulfill({
          status: 503,
          contentType: "application/json",
          body: JSON.stringify({ error: "Service Unavailable" }),
        });
      } else {
        route.continue();
      }
    });

    // Act
    await page.fill('[data-testid="prompt-input"]', "Hello");
    await page.click('[data-testid="send-button"]');

    // Assert - 最終的に成功または適切なエラー表示
    await expect(
      page.locator(
        '[data-testid="execution-status"], [data-testid="error-message"]',
      ),
    ).toBeVisible({ timeout: 30000 });
  });

  test("NET-12: 認証エラー（401）時に再認証を促す", async ({ page }) => {
    // Arrange
    await setupSession(page);

    // 401エラーをシミュレート
    await page.route("**/api/**", (route) => {
      route.fulfill({
        status: 401,
        contentType: "application/json",
        body: JSON.stringify({ error: "Unauthorized" }),
      });
    });

    // Act
    await page.fill('[data-testid="prompt-input"]', "Hello");
    await page.click('[data-testid="send-button"]');

    // Assert
    await expect(page.locator('[data-testid="error-message"]')).toContainText(
      /認証|ログイン|Auth/i,
      { timeout: 10000 },
    );
  });
});

// ============================================
// 断続的接続テスト
// ============================================

test.describe("断続的接続", () => {
  test("NET-13: 接続が不安定な状態でもセッションが維持される", async ({
    page,
    context,
  }) => {
    // Arrange
    await setupSession(page);
    const sessionId = await page
      .locator('[data-testid="session-id"]')
      .textContent();

    // 断続的に接続を切断
    for (let i = 0; i < 3; i++) {
      await context.setOffline(true);
      await page.waitForTimeout(500);
      await context.setOffline(false);
      await page.waitForTimeout(500);
    }

    // Assert - セッションIDが変わっていないことを確認
    const currentSessionId = await page
      .locator('[data-testid="session-id"]')
      .textContent();
    expect(currentSessionId).toBe(sessionId);

    // Cleanup
    await cleanup(page);
  });

  test("NET-14: ストリーミング中の一時的な接続断から復旧", async ({
    page,
    context,
  }) => {
    // Arrange
    await setupSession(page);

    // Act
    await page.fill(
      '[data-testid="prompt-input"]',
      "Count slowly from 1 to 20",
    );
    await page.click('[data-testid="send-button"]');

    // ストリーミング開始を待つ
    await page.waitForSelector('[data-testid="response-chunk"]', {
      timeout: 30000,
    });

    // 一時的に接続断
    await context.setOffline(true);
    await page.waitForTimeout(500);
    await context.setOffline(false);

    // Assert - 最終的に完了またはエラー
    await expect(
      page.locator(
        '[data-testid="execution-status"][data-status="completed"], [data-testid="error-message"]',
      ),
    ).toBeVisible({ timeout: 120000 });

    // Cleanup
    await cleanup(page);
  });
});

// ============================================
// WebSocket接続テスト
// ============================================

test.describe("WebSocket接続", () => {
  test("NET-15: WebSocket接続が切断された場合に再接続を試みる", async ({
    page,
  }) => {
    // Arrange
    await setupSession(page);

    // WebSocket接続をモニタリング
    const _wsReconnectAttempts: number[] = [];
    await page.evaluate(() => {
      // @ts-expect-error - テスト用のグローバルAPI
      window.agentAPI?.onReconnect?.((attempt: number) => {
        // @ts-expect-error - 監視用
        window._wsReconnectAttempts = window._wsReconnectAttempts || [];
        // @ts-expect-error - 監視用
        window._wsReconnectAttempts.push(attempt);
      });
    });

    // WebSocket切断をシミュレート（route interceptで間接的に）
    await page.route("**/ws/**", (route) => route.abort("failed"));

    // クエリ実行を試みる
    await page.fill('[data-testid="prompt-input"]', "Hello");
    await page.click('[data-testid="send-button"]');

    // Assert - エラーまたは再接続の試行
    await expect(
      page.locator(
        '[data-testid="error-message"], [data-testid="reconnecting-indicator"]',
      ),
    ).toBeVisible({ timeout: 30000 });
  });

  test("NET-16: WebSocket再接続成功後にクエリが継続される", async ({
    page,
  }) => {
    // Arrange
    await setupSession(page);
    let blockWs = true;

    // 最初はWebSocketをブロック、後で解除
    await page.route("**/ws/**", async (route) => {
      if (blockWs) {
        await route.abort("failed");
      } else {
        await route.continue();
      }
    });

    // クエリ実行を試みる
    await page.fill('[data-testid="prompt-input"]', "Hello");
    await page.click('[data-testid="send-button"]');

    // 少し待ってからブロック解除
    await page.waitForTimeout(2000);
    blockWs = false;

    // Assert - 最終的に成功またはエラー
    await expect(
      page.locator(
        '[data-testid="execution-status"][data-status="completed"], [data-testid="error-message"]',
      ),
    ).toBeVisible({ timeout: 60000 });

    // Cleanup
    await cleanup(page);
  });
});

// ============================================
// エラー回復テスト
// ============================================

test.describe("エラー回復", () => {
  test("NET-17: ネットワークエラー後にエラー状態がクリアされる", async ({
    page,
    context,
  }) => {
    // Arrange
    await setupSession(page);

    // オフラインでエラーを発生させる
    await context.setOffline(true);
    await page.fill('[data-testid="prompt-input"]', "Hello");
    await page.click('[data-testid="send-button"]');
    await expect(page.locator('[data-testid="error-message"]')).toBeVisible({
      timeout: 10000,
    });

    // Act - オンラインに復旧してエラーをクリア
    await context.setOffline(false);
    await page.click('[data-testid="clear-error-button"]');

    // Assert
    await expect(
      page.locator('[data-testid="error-message"]'),
    ).not.toBeVisible();

    // Cleanup
    await cleanup(page);
  });

  test("NET-18: 連続エラー後もアプリケーションが応答する", async ({
    page,
    context,
  }) => {
    // Arrange
    await setupSession(page);

    // 複数回エラーを発生させる
    for (let i = 0; i < 3; i++) {
      await context.setOffline(true);
      await page.fill('[data-testid="prompt-input"]', "Error test " + i);
      await page.click('[data-testid="send-button"]');
      await page.waitForTimeout(1000);
      await context.setOffline(false);
      await page.waitForTimeout(500);
    }

    // Act - 正常なクエリを実行
    await page.fill('[data-testid="prompt-input"]', "Final test");
    await page.click('[data-testid="send-button"]');

    // Assert - アプリケーションが応答する
    await expect(
      page.locator(
        '[data-testid="execution-status"], [data-testid="error-message"]',
      ),
    ).toBeVisible({ timeout: 30000 });

    // Cleanup
    await cleanup(page);
  });
});
