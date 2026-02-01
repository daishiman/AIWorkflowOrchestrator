---
id: TASK-8C-D
tier: 1
title: E2Eテスト - 権限ダイアログフロー
phase: 8
depends_on: [TASK-7D, TASK-8C-E]
parallel_with: [TASK-8C-A, TASK-8C-B, TASK-8C-C]
blocks: []
status: pending
priority: high
estimated_complexity: medium
tags: [test, e2e, playwright, permission]
---

# E2Eテスト - 権限ダイアログフロー

## 概要

権限確認ダイアログのE2Eテストを実装する（5ケース）。

## 入力

- TASK-7D: ChatPanel 統合
- TASK-8C-E: テストフィクスチャ

## 出力

- `apps/desktop/src/__tests__/skillPermission.e2e.ts`

## 実装詳細

```typescript
// apps/desktop/src/__tests__/skillPermission.e2e.ts

import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import { ElectronApplication, Page, _electron as electron } from "playwright";
import path from "path";

describe("Skill Permission Dialog E2E", () => {
  let electronApp: ElectronApplication;
  let page: Page;

  beforeAll(async () => {
    electronApp = await electron.launch({
      args: [path.join(__dirname, "../../dist/main/index.js")],
      env: {
        ...process.env,
        NODE_ENV: "test",
        TEST_SKILLS_DIR: path.join(__dirname, "__fixtures__/skills"),
      },
    });

    page = await electronApp.firstWindow();
    await page.waitForLoadState("domcontentloaded");
  });

  afterAll(async () => {
    await electronApp?.close();
  });

  beforeEach(async () => {
    // Import and select test skill
    await page.evaluate(async () => {
      await window.electronAPI?.skill?.import?.("test-skill");
    });

    await page.click('[aria-label="スキルを選択"]');
    await page.click('[role="option"]:has-text("test-skill")');
  });

  // 1. 権限ダイアログ表示
  it("should show permission dialog when tool requires approval", async () => {
    await page.fill('[data-testid="chat-input"]', "Run dangerous command");
    await page.press('[data-testid="chat-input"]', "Enter");

    const dialog = page.locator('text="権限の確認が必要です"');
    await expect(dialog).toBeVisible({ timeout: 10000 });
  });

  // 2. ツール情報表示
  it("should display tool info in permission dialog", async () => {
    await page.fill('[data-testid="chat-input"]', "Run dangerous command");
    await page.press('[data-testid="chat-input"]', "Enter");

    await page.waitForSelector('text="権限の確認が必要です"');

    await expect(page.locator('text="ツール:"')).toBeVisible();
    await expect(page.locator('text="引数:"')).toBeVisible();
  });

  // 3. 許可して続行
  it("should approve permission and continue execution", async () => {
    await page.fill('[data-testid="chat-input"]', "Run dangerous command");
    await page.press('[data-testid="chat-input"]', "Enter");

    await page.waitForSelector('text="権限の確認が必要です"');
    await page.click('button:has-text("許可")');

    // Dialog should close
    await page.waitForSelector('text="権限の確認が必要です"', {
      state: "hidden",
    });

    // Execution should continue
    await expect(page.locator('text="実行中"')).toBeVisible();
  });

  // 4. 拒否して停止
  it("should deny permission and stop execution", async () => {
    await page.fill('[data-testid="chat-input"]', "Run dangerous command");
    await page.press('[data-testid="chat-input"]', "Enter");

    await page.waitForSelector('text="権限の確認が必要です"');
    await page.click('button:has-text("拒否")');

    // Dialog should close
    await page.waitForSelector('text="権限の確認が必要です"', {
      state: "hidden",
    });

    // Execution should be cancelled/error
    await expect(page.locator('text="キャンセル"')).toBeVisible();
  });

  // 5. 選択記憶
  it("should remember choice when checkbox is checked", async () => {
    await page.fill('[data-testid="chat-input"]', "Run dangerous command");
    await page.press('[data-testid="chat-input"]', "Enter");

    await page.waitForSelector('text="権限の確認が必要です"');

    // Check remember checkbox
    await page.click('[type="checkbox"]');
    await page.click('button:has-text("許可")');

    // Run same command again
    await page.fill('[data-testid="chat-input"]', "Run dangerous command");
    await page.press('[data-testid="chat-input"]', "Enter");

    // Should not show permission dialog again
    await page.waitForTimeout(1000);
    await expect(page.locator('text="権限の確認が必要です"')).not.toBeVisible();
  });

  // タイムアウト処理
  it("should handle permission request timeout", async () => {
    await page.fill('[data-testid="chat-input"]', "Run dangerous command");
    await page.press('[data-testid="chat-input"]', "Enter");

    await page.waitForSelector('text="権限の確認が必要です"');

    // Wait for timeout (mock with shorter timeout in test)
    await page.waitForTimeout(5000);

    // Should show timeout message
    await expect(page.locator('text="タイムアウト"')).toBeVisible();
  });
});
```

## ファイル

| 操作 | パス                                                |
| ---- | --------------------------------------------------- |
| 作成 | `apps/desktop/src/__tests__/skillPermission.e2e.ts` |

## 完了条件

- [ ] 5件の権限ダイアログE2Eテストが実装されている
- [ ] 全テストが通過する
- [ ] 許可/拒否フローがテストされている
- [ ] 選択記憶機能がテストされている

## テストケース一覧

1. 権限ダイアログ表示
2. ツール情報表示
3. 許可して続行
4. 拒否して停止
5. 選択記憶
