# Phase 2: E2Eテストシナリオ設計書

## メタ情報

| 項目     | 内容                  |
| -------- | --------------------- |
| タスクID | AGENT-005-POSTRELEASE |
| Phase    | 2                     |
| 作成日   | 2026-01-12            |

---

## 1. テストファイル構成

```
apps/desktop/e2e/agent-sdk-integration.spec.ts
├── describe('SDK初期化')
│   ├── test('正常初期化')
│   └── test('認証エラー')
├── describe('セッション管理')
│   ├── test('セッション作成')
│   ├── test('セッション再開')
│   ├── test('セッション破棄')
│   └── test('複数セッション')
├── describe('クエリ実行')
│   ├── test('正常クエリ')
│   ├── test('ストリーミング応答')
│   ├── test('クエリ中断')
│   └── test('タイムアウト')
├── describe('権限確認')
│   ├── test('許可ダイアログ表示')
│   ├── test('許可操作')
│   └── test('拒否操作')
└── describe('エラーハンドリング')
    ├── test('バリデーションエラー')
    └── test('セッションエラー')
```

---

## 2. 正常系シナリオ

### 2.1 SDK初期化テスト (E2E-01)

```typescript
test("SDK初期化 - 認証済み環境で正常初期化", async ({ page }) => {
  // Arrange
  await page.goto("/agent");

  // Act
  await page.waitForSelector('[data-testid="agent-status"]');

  // Assert
  await expect(page.locator('[data-testid="agent-status"]')).toHaveText(
    "initialized",
  );
});
```

**検証ポイント**:

- AgentStatusが'initialized'になること
- エラーメッセージが表示されないこと
- 1000ms以内に初期化完了すること

### 2.2 セッション作成テスト (E2E-02)

```typescript
test("セッション作成 - 新規セッションIDを取得", async ({ page }) => {
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
```

**検証ポイント**:

- UUID形式のセッションIDが返ること
- 200ms以内にセッション作成完了すること

### 2.3 クエリ実行テスト (E2E-03)

```typescript
test("クエリ実行 - プロンプト送信と応答受信", async ({ page }) => {
  // Arrange
  await setupSession(page);

  // Act
  await page.fill('[data-testid="prompt-input"]', "Hello, Claude!");
  await page.click('[data-testid="send-button"]');

  // Assert
  await expect(page.locator('[data-testid="response-area"]')).toContainText(
    /./,
  ); // 何らかの応答があること
  await expect(page.locator('[data-testid="execution-status"]')).toHaveText(
    "completed",
  );
});
```

**検証ポイント**:

- 応答が受信されること
- ステータスが'completed'になること
- エラーが発生しないこと

### 2.4 ストリーミング応答テスト (E2E-04)

```typescript
test("ストリーミング応答 - リアルタイム表示", async ({ page }) => {
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

  // Assert
  // 内容が徐々に増えていることを確認
  const isStreaming = contents.some(
    (c, i) => i > 0 && c.length > contents[i - 1].length,
  );
  expect(isStreaming).toBe(true);
});
```

**検証ポイント**:

- 応答が段階的に表示されること
- onMessageコールバックが複数回呼ばれること
- 最終的にisComplete=trueになること

### 2.5 セッション再開テスト (E2E-05)

```typescript
test("セッション再開 - 会話履歴を保持", async ({ page }) => {
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
```

**検証ポイント**:

- セッションIDで既存セッションを再開できること
- 会話履歴が保持されていること

### 2.6 セッション破棄テスト (E2E-06)

```typescript
test("セッション破棄 - セッションが無効化される", async ({ page }) => {
  // Arrange
  const sessionId = await createSession(page);

  // Act
  await page.click('[data-testid="destroy-session-button"]');

  // Assert
  await expect(
    page.locator(`[data-testid="session-${sessionId}"]`),
  ).not.toBeVisible();
});
```

### 2.7 複数セッション管理テスト (E2E-07)

```typescript
test("複数セッション - 最大10セッションまで管理可能", async ({ page }) => {
  // Arrange & Act
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
```

### 2.8 ツール使用権限確認テスト (E2E-08)

```typescript
test("権限確認 - PermissionDialogが表示される", async ({ page }) => {
  // Arrange
  await setupSession(page);

  // Act
  await page.fill(
    '[data-testid="prompt-input"]',
    "Create a file named test.txt",
  );
  await page.click('[data-testid="send-button"]');

  // Assert
  await expect(page.locator('[data-testid="permission-dialog"]')).toBeVisible();
  await expect(
    page.locator('[data-testid="permission-tool-name"]'),
  ).toContainText("Write");
});
```

---

## 3. 異常系シナリオ

### 3.1 認証エラーテスト (E2E-09)

```typescript
test("認証エラー - 未認証時にエラー表示", async ({ page }) => {
  // Arrange
  // 認証トークンを無効化する処理（テスト用）
  await page.evaluate(() => {
    window.localStorage.removeItem("claude-auth-token");
  });

  // Act
  await page.goto("/agent");

  // Assert
  await expect(page.locator('[data-testid="error-message"]')).toContainText(
    "認証に失敗しました",
  );
});
```

### 3.2 タイムアウトテスト (E2E-10)

```typescript
test("タイムアウト - 設定時間超過でエラー", async ({ page }) => {
  // Arrange
  await setupSession(page);
  // 短いタイムアウトを設定
  await page.evaluate(() => {
    window.agentAPI.setOption({ timeout: 1000 }); // 1秒
  });

  // Act
  await page.fill(
    '[data-testid="prompt-input"]',
    "Generate a very long response",
  );
  await page.click('[data-testid="send-button"]');

  // Assert
  await expect(page.locator('[data-testid="error-message"]')).toContainText(
    "タイムアウト",
    { timeout: 5000 },
  );
});
```

### 3.3 中断テスト (E2E-11)

```typescript
test("中断 - abort()でクエリ停止", async ({ page }) => {
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
```

### 3.4 セッション期限切れテスト (E2E-12)

```typescript
test("セッション期限切れ - 適切なエラー表示", async ({ page }) => {
  // Arrange
  // 期限切れセッションをシミュレート
  const expiredSessionId = "expired-session-id";

  // Act
  await page.goto(`/agent?session=${expiredSessionId}`);

  // Assert
  await expect(page.locator('[data-testid="error-message"]')).toContainText(
    "セッションが見つかりません",
  );
});
```

### 3.5 バリデーションエラーテスト (E2E-13)

```typescript
test("バリデーションエラー - 空のプロンプトでエラー", async ({ page }) => {
  // Arrange
  await setupSession(page);

  // Act
  await page.click('[data-testid="send-button"]'); // 空のまま送信

  // Assert
  await expect(page.locator('[data-testid="validation-error"]')).toBeVisible();
});
```

---

## 4. 境界値シナリオ

### 4.1 最大プロンプト長テスト (E2E-14)

```typescript
test("最大プロンプト長 - 100,000文字のプロンプト処理", async ({ page }) => {
  // Arrange
  await setupSession(page);
  const longPrompt = "a".repeat(100000);

  // Act
  await page.fill('[data-testid="prompt-input"]', longPrompt);
  await page.click('[data-testid="send-button"]');

  // Assert
  await expect(page.locator('[data-testid="execution-status"]')).toHaveText(
    "completed",
    { timeout: 60000 },
  );
});
```

### 4.2 最大セッション数テスト (E2E-15)

```typescript
test("最大セッション数 - 11番目のセッション作成でエラー", async ({ page }) => {
  // Arrange
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
```

### 4.3 最大タイムアウトテスト (E2E-16)

```typescript
test("最大タイムアウト - 300秒設定が有効", async ({ page }) => {
  // Arrange
  await setupSession(page);
  await page.evaluate(() => {
    window.agentAPI.setOption({ timeout: 300000 }); // 300秒
  });

  // Act & Assert
  // 設定が正常に適用されることを確認
  const timeout = await page.evaluate(() =>
    window.agentAPI.getOption("timeout"),
  );
  expect(timeout).toBe(300000);
});
```

---

## 5. ヘルパー関数

```typescript
// test-helpers.ts
async function setupSession(page: Page): Promise<string> {
  await page.goto("/agent");
  await page.waitForSelector(
    '[data-testid="agent-status"][data-status="initialized"]',
  );
  await page.click('[data-testid="new-session-button"]');
  const sessionId = await page
    .locator('[data-testid="session-id"]')
    .textContent();
  return sessionId!;
}

async function createSessionAndSendQuery(
  page: Page,
  prompt: string,
): Promise<string> {
  const sessionId = await setupSession(page);
  await page.fill('[data-testid="prompt-input"]', prompt);
  await page.click('[data-testid="send-button"]');
  await page.waitForSelector(
    '[data-testid="execution-status"][data-status="completed"]',
  );
  return sessionId;
}
```

---

## 変更履歴

| 日付       | 変更者 | 内容     |
| ---------- | ------ | -------- |
| 2026-01-12 | Claude | 初版作成 |
