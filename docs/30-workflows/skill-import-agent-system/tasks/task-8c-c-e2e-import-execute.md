---
id: TASK-8C-C
tier: 1
title: E2Eテスト - インポート・実行フロー
phase: 8
depends_on: [TASK-7D]
parallel_with: [TASK-8C-A, TASK-8C-B, TASK-8C-D]
blocks: []
status: pending
priority: high
estimated_complexity: medium
tags: [test, e2e, playwright]
---

# E2Eテスト - インポート・実行フロー

## 概要

スキルインポートと実行のE2Eテストを実装する（6ケース）。

## 入力

- TASK-7D: ChatPanel 統合
- TASK-8C-E: テストフィクスチャ

## 出力

- `apps/desktop/src/__tests__/skillImportExecution.e2e.ts`

## 実装詳細

```typescript
// apps/desktop/src/__tests__/skillImportExecution.e2e.ts

import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import { ElectronApplication, Page, _electron as electron } from "playwright";
import path from "path";

describe("Skill Import & Execution E2E", () => {
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
    await page.evaluate(() => {
      window.electronAPI?.skill?.resetForTesting?.();
    });
  });

  describe("Skill Import Flow", () => {
    // 1. インポートダイアログ表示
    it("should open import dialog for unimported skill", async () => {
      await page.click('[aria-label="スキルを選択"]');
      await page.click('[data-testid="import-skill-button"]');

      const dialog = page.locator('text="スキルをインポート"');
      await expect(dialog).toBeVisible();
    });

    // 2. スキル詳細表示
    it("should display skill details in import dialog", async () => {
      await page.click('[aria-label="スキルを選択"]');
      await page.click('[data-testid="import-skill-button"]');

      await expect(page.locator('text="許可ツール"')).toBeVisible();
      await expect(page.locator('text="サブエージェント"')).toBeVisible();
    });

    // 3. インポート実行
    it("should import skill and add to imported list", async () => {
      await page.click('[aria-label="スキルを選択"]');
      await page.click('[data-testid="import-skill-button"]');
      await page.click('button:has-text("インポート")');

      // Wait for dialog to close
      await page.waitForSelector('text="スキルをインポート"', {
        state: "hidden",
      });

      // Check skill is now in imported section
      await page.click('[aria-label="スキルを選択"]');
      await expect(page.locator('text="インポート済み"')).toBeVisible();
    });
  });

  describe("Skill Execution Flow", () => {
    beforeEach(async () => {
      // Import test skill
      await page.evaluate(async () => {
        await window.electronAPI?.skill?.import?.("test-skill");
      });
    });

    // 4. ストリーミング表示
    it("should show streaming view when executing", async () => {
      // Select skill
      await page.click('[aria-label="スキルを選択"]');
      await page.click('[role="option"]:has-text("test-skill")');

      // Type prompt and submit
      await page.fill('[data-testid="chat-input"]', "Test prompt");
      await page.press('[data-testid="chat-input"]', "Enter");

      // Streaming view should appear
      const streamingView = page.locator(
        '[data-testid="skill-streaming-view"]',
      );
      await expect(streamingView).toBeVisible();
    });

    // 5. 停止ボタン表示
    it("should display abort button while executing", async () => {
      await page.click('[aria-label="スキルを選択"]');
      await page.click('[role="option"]:has-text("test-skill")');

      await page.fill('[data-testid="chat-input"]', "Test prompt");
      await page.press('[data-testid="chat-input"]', "Enter");

      const abortButton = page.locator('button:has-text("停止")');
      await expect(abortButton).toBeVisible();
    });

    // 6. 実行中止
    it("should abort execution when stop button clicked", async () => {
      await page.click('[aria-label="スキルを選択"]');
      await page.click('[role="option"]:has-text("test-skill")');

      await page.fill('[data-testid="chat-input"]', "Test prompt");
      await page.press('[data-testid="chat-input"]', "Enter");

      await page.click('button:has-text("停止")');

      // Status should change to cancelled
      await expect(page.locator('text="キャンセル"')).toBeVisible();
    });
  });

  describe("Rescan Flow", () => {
    // 再スキャン
    it("should rescan skills when rescan button clicked", async () => {
      await page.click('[aria-label="スキルを選択"]');
      await page.click('button:has-text("再スキャン")');

      // Should show scanning state
      await expect(page.locator('text="スキャン中"')).toBeVisible();

      // Wait for scan to complete
      await page.waitForSelector('text="スキャン中"', { state: "hidden" });

      // Skills should be updated
      await expect(page.locator('[role="listbox"]')).toBeVisible();
    });
  });
});
```

## ファイル

| 操作 | パス                                                     |
| ---- | -------------------------------------------------------- |
| 作成 | `apps/desktop/src/__tests__/skillImportExecution.e2e.ts` |

## 完了条件

- [ ] 6件のインポート・実行E2Eテストが実装されている
- [ ] 全テストが通過する
- [ ] インポートフローがテストされている
- [ ] 実行フローがテストされている

## テストケース一覧

1. インポートダイアログ表示
2. スキル詳細表示
3. インポート実行
4. ストリーミング表示
5. 停止ボタン表示
6. 実行中止
