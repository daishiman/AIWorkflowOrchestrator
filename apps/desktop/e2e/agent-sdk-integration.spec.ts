/**
 * Agent SDK 統合 E2E テスト
 *
 * Claude Agent SDKとの実際の接続をテストします。
 * - SDK初期化とセッション管理
 * - クエリ実行とストリーミング応答
 * - 権限確認ダイアログ
 * - エラーハンドリング
 *
 * @see docs/30-workflows/postrelease-sdk-testing/outputs/phase-2/e2e-test-scenarios.md
 */

import { test, expect, type Page } from "@playwright/test";

// ============================================
// ヘルパー関数
// ============================================

/**
 * セッションをセットアップする
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
 * セッション作成とクエリ送信
 */
async function createSessionAndSendQuery(
  page: Page,
  prompt: string,
): Promise<string> {
  const sessionId = await setupSession(page);
  await page.fill('[data-testid="prompt-input"]', prompt);
  await page.click('[data-testid="send-button"]');
  await page.waitForSelector(
    '[data-testid="execution-status"][data-status="completed"]',
    { timeout: 60000 },
  );
  return sessionId;
}

// ============================================
// SDK初期化テスト
// ============================================

test.describe("SDK初期化", () => {
  test("E2E-01: 認証済み環境で正常初期化", async ({ page }) => {
    // Arrange
    await page.goto("/agent");

    // Act
    await page.waitForSelector('[data-testid="agent-status"]', {
      timeout: 10000,
    });

    // Assert
    await expect(page.locator('[data-testid="agent-status"]')).toHaveText(
      "initialized",
    );
    await expect(
      page.locator('[data-testid="error-message"]'),
    ).not.toBeVisible();
  });

  test("E2E-09: 未認証時にエラー表示", async ({ page }) => {
    // Arrange - 認証トークンを無効化
    await page.goto("/agent");
    await page.evaluate(() => {
      window.localStorage.removeItem("claude-auth-token");
    });

    // Act
    await page.reload();
    await page.waitForLoadState("networkidle");

    // Assert
    await expect(page.locator('[data-testid="error-message"]')).toContainText(
      "認証",
    );
  });
});

// ============================================
// セッション管理テスト
// ============================================

test.describe("セッション管理", () => {
  test("E2E-02: 新規セッションIDを取得", async ({ page }) => {
    // Arrange
    await page.goto("/agent");
    await page.waitForSelector(
      '[data-testid="agent-status"][data-status="initialized"]',
    );

    // Act
    await page.click('[data-testid="new-session-button"]');

    // Assert
    const sessionId = await page
      .locator('[data-testid="session-id"]')
      .textContent();
    expect(sessionId).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/,
    );
  });

  test("E2E-05: セッション再開で会話履歴を保持", async ({ page }) => {
    // Arrange
    const sessionId = await createSessionAndSendQuery(page, "My name is Test");

    // ページリロード
    await page.reload();
    await page.waitForSelector(
      '[data-testid="agent-status"][data-status="initialized"]',
    );

    // Act
    await page.click(`[data-testid="session-${sessionId}"]`);
    await page.fill('[data-testid="prompt-input"]', "What is my name?");
    await page.click('[data-testid="send-button"]');

    // Assert
    await expect(page.locator('[data-testid="response-area"]')).toContainText(
      "Test",
    );
  });

  test("E2E-06: セッション破棄でセッションが無効化される", async ({ page }) => {
    // Arrange
    const sessionId = await setupSession(page);

    // Act
    await page.click('[data-testid="destroy-session-button"]');

    // Assert
    await expect(
      page.locator(`[data-testid="session-${sessionId}"]`),
    ).not.toBeVisible();
  });

  test("E2E-07: 最大10セッションまで管理可能", async ({ page }) => {
    // Arrange
    await page.goto("/agent");
    await page.waitForSelector(
      '[data-testid="agent-status"][data-status="initialized"]',
    );

    // Act
    const sessionIds: string[] = [];
    for (let i = 0; i < 10; i++) {
      await page.click('[data-testid="new-session-button"]');
      const id = await page.locator('[data-testid="session-id"]').textContent();
      sessionIds.push(id!);
    }

    // Assert
    expect(sessionIds.length).toBe(10);
    expect(new Set(sessionIds).size).toBe(10); // 全て異なるID
  });

  test("E2E-15: 11番目のセッション作成でエラー", async ({ page }) => {
    // Arrange
    await page.goto("/agent");
    await page.waitForSelector(
      '[data-testid="agent-status"][data-status="initialized"]',
    );

    for (let i = 0; i < 10; i++) {
      await page.click('[data-testid="new-session-button"]');
      await page.waitForSelector('[data-testid="session-id"]');
    }

    // Act
    await page.click('[data-testid="new-session-button"]');

    // Assert
    await expect(page.locator('[data-testid="error-message"]')).toContainText(
      "セッション数の上限",
    );
  });

  test("E2E-12: 期限切れセッションで適切なエラー表示", async ({ page }) => {
    // Arrange
    const expiredSessionId = "expired-session-id";

    // Act
    await page.goto(`/agent?session=${expiredSessionId}`);

    // Assert
    await expect(page.locator('[data-testid="error-message"]')).toContainText(
      "セッションが見つかりません",
    );
  });
});

// ============================================
// クエリ実行テスト
// ============================================

test.describe("クエリ実行", () => {
  test("E2E-03: プロンプト送信と応答受信", async ({ page }) => {
    // Arrange
    await setupSession(page);

    // Act
    await page.fill('[data-testid="prompt-input"]', "Hello, Claude!");
    await page.click('[data-testid="send-button"]');

    // Assert
    await expect(page.locator('[data-testid="response-area"]')).toContainText(
      /./,
      { timeout: 30000 },
    );
    await expect(page.locator('[data-testid="execution-status"]')).toHaveText(
      "completed",
    );
  });

  test("E2E-04: ストリーミング応答がリアルタイム表示", async ({ page }) => {
    // Arrange
    await setupSession(page);
    const responseArea = page.locator('[data-testid="response-area"]');
    const contents: string[] = [];

    // Act
    await page.fill('[data-testid="prompt-input"]', "Count from 1 to 5");
    await page.click('[data-testid="send-button"]');

    // ストリーミング中の内容を複数回キャプチャ
    for (let i = 0; i < 5; i++) {
      await page.waitForTimeout(200);
      contents.push((await responseArea.textContent()) || "");
    }

    // Assert - 内容が徐々に増えていることを確認
    const isStreaming = contents.some(
      (c, i) => i > 0 && c.length > contents[i - 1].length,
    );
    expect(isStreaming).toBe(true);
  });

  test("E2E-11: abort()でクエリ停止", async ({ page }) => {
    // Arrange
    await setupSession(page);

    // Act
    await page.fill(
      '[data-testid="prompt-input"]',
      "Generate a very long response",
    );
    await page.click('[data-testid="send-button"]');
    await page.waitForTimeout(500); // 応答開始を待つ
    await page.click('[data-testid="abort-button"]');

    // Assert
    await expect(page.locator('[data-testid="execution-status"]')).toHaveText(
      "cancelled",
    );
  });

  test("E2E-10: 設定時間超過でタイムアウトエラー", async ({ page }) => {
    // Arrange
    await setupSession(page);
    // 短いタイムアウトを設定
    await page.evaluate(() => {
      // @ts-expect-error - テスト用のグローバルAPI
      window.agentAPI?.setOption?.({ timeout: 1000 }); // 1秒
    });

    // Act
    await page.fill(
      '[data-testid="prompt-input"]',
      "Generate a very long response that takes time",
    );
    await page.click('[data-testid="send-button"]');

    // Assert
    await expect(page.locator('[data-testid="error-message"]')).toContainText(
      "タイムアウト",
      { timeout: 10000 },
    );
  });

  test("E2E-13: 空のプロンプトでバリデーションエラー", async ({ page }) => {
    // Arrange
    await setupSession(page);

    // Act - 空のまま送信
    await page.click('[data-testid="send-button"]');

    // Assert
    await expect(
      page.locator('[data-testid="validation-error"]'),
    ).toBeVisible();
  });

  test("E2E-14: 最大プロンプト長（100,000文字）の処理", async ({ page }) => {
    // Arrange
    await setupSession(page);
    const longPrompt = "a".repeat(100000);

    // Act
    await page.fill('[data-testid="prompt-input"]', longPrompt);
    await page.click('[data-testid="send-button"]');

    // Assert
    await expect(page.locator('[data-testid="execution-status"]')).toHaveText(
      "completed",
      { timeout: 120000 },
    );
  });

  test("E2E-16: 最大タイムアウト（300秒）設定が有効", async ({ page }) => {
    // Arrange
    await setupSession(page);
    await page.evaluate(() => {
      // @ts-expect-error - テスト用のグローバルAPI
      window.agentAPI?.setOption?.({ timeout: 300000 }); // 300秒
    });

    // Act & Assert
    const timeout = await page.evaluate(() => {
      // @ts-expect-error - テスト用のグローバルAPI
      return window.agentAPI?.getOption?.("timeout");
    });
    expect(timeout).toBe(300000);
  });
});

// ============================================
// 権限確認テスト
// ============================================

test.describe("権限確認", () => {
  test("E2E-08: PermissionDialogが表示される", async ({ page }) => {
    // Arrange
    await setupSession(page);

    // Act
    await page.fill(
      '[data-testid="prompt-input"]',
      "Create a file named test.txt",
    );
    await page.click('[data-testid="send-button"]');

    // Assert
    await expect(
      page.locator('[data-testid="permission-dialog"]'),
    ).toBeVisible();
    await expect(
      page.locator('[data-testid="permission-tool-name"]'),
    ).toContainText("Write");
  });

  test("権限許可操作が正常動作", async ({ page }) => {
    // Arrange
    await setupSession(page);
    await page.fill(
      '[data-testid="prompt-input"]',
      "Create a file named test.txt",
    );
    await page.click('[data-testid="send-button"]');
    await page.waitForSelector('[data-testid="permission-dialog"]');

    // Act
    await page.click('[data-testid="permission-allow-button"]');

    // Assert
    await expect(
      page.locator('[data-testid="permission-dialog"]'),
    ).not.toBeVisible();
    await expect(page.locator('[data-testid="execution-status"]')).toHaveText(
      "running",
    );
  });

  test("権限拒否操作が正常動作", async ({ page }) => {
    // Arrange
    await setupSession(page);
    await page.fill(
      '[data-testid="prompt-input"]',
      "Delete all files in directory",
    );
    await page.click('[data-testid="send-button"]');
    await page.waitForSelector('[data-testid="permission-dialog"]');

    // Act
    await page.click('[data-testid="permission-deny-button"]');

    // Assert
    await expect(
      page.locator('[data-testid="permission-dialog"]'),
    ).not.toBeVisible();
    await expect(page.locator('[data-testid="response-area"]')).toContainText(
      "拒否",
    );
  });
});

// ============================================
// エラーハンドリングテスト
// ============================================

test.describe("エラーハンドリング", () => {
  test("バリデーションエラーが適切に表示される", async ({ page }) => {
    // Arrange
    await setupSession(page);

    // Act - 不正な入力
    await page.fill('[data-testid="prompt-input"]', "");
    await page.click('[data-testid="send-button"]');

    // Assert
    await expect(
      page.locator('[data-testid="validation-error"]'),
    ).toBeVisible();
  });

  test("セッションエラーが適切に表示される", async ({ page }) => {
    // Arrange - 無効なセッションID
    await page.goto("/agent");
    await page.waitForSelector(
      '[data-testid="agent-status"][data-status="initialized"]',
    );

    // Act - 無効なセッションでクエリを試行
    await page.evaluate(() => {
      // @ts-expect-error - テスト用のグローバルAPI
      window.agentAPI?.setSessionId?.("invalid-session-id");
    });
    await page.fill('[data-testid="prompt-input"]', "Hello");
    await page.click('[data-testid="send-button"]');

    // Assert
    await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
  });

  test("ネットワークエラー時に適切なメッセージ表示", async ({ page }) => {
    // Arrange
    await setupSession(page);

    // ネットワークをオフラインにシミュレート
    await page.route("**/*", (route) => route.abort("failed"));

    // Act
    await page.fill('[data-testid="prompt-input"]', "Hello");
    await page.click('[data-testid="send-button"]');

    // Assert
    await expect(page.locator('[data-testid="error-message"]')).toContainText(
      "ネットワーク",
    );
  });
});
