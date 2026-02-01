---
id: TASK-8C-B
tier: 1
title: E2Eテスト - スキル選択フロー
phase: 8
depends_on: [TASK-7D, TASK-8C-E]
parallel_with: [TASK-8C-A, TASK-8C-C, TASK-8C-D]
blocks: []
status: pending
priority: high
estimated_complexity: medium
tags: [test, e2e, playwright]
---

# E2Eテスト - スキル選択フロー

## 概要

スキル選択UIのE2Eテストを実装する（4ケース）。

## 入力

- TASK-7D: ChatPanel 統合
- TASK-8C-E: テストフィクスチャ

## 出力

- `apps/desktop/src/__tests__/skillSelection.e2e.ts`

## 実装詳細

```typescript
// apps/desktop/src/__tests__/skillSelection.e2e.ts

import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import { ElectronApplication, Page, _electron as electron } from "playwright";
import path from "path";

describe("Skill Selection E2E", () => {
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
    // Reset state between tests
    await page.evaluate(() => {
      window.electronAPI?.skill?.resetForTesting?.();
    });
  });

  // 1. スキルセレクター表示
  it("should display skill selector in chat panel", async () => {
    const skillSelector = page.locator('[aria-label="スキルを選択"]');
    await expect(skillSelector).toBeVisible();
  });

  // 2. ドロップダウン開く
  it("should open dropdown and show available skills", async () => {
    await page.click('[aria-label="スキルを選択"]');

    const dropdown = page.locator('[role="listbox"]');
    await expect(dropdown).toBeVisible();

    // Should show "なし" option
    await expect(page.locator('text="なし"')).toBeVisible();
  });

  // 3. スキル選択
  it("should select a skill", async () => {
    await page.click('[aria-label="スキルを選択"]');
    await page.click('[role="option"]:has-text("test-skill")');

    // Selector should now show selected skill name
    const selector = page.locator('[aria-label="スキルを選択"]');
    await expect(selector).toContainText("test-skill");
  });

  // 4. スキル選択解除
  it("should deselect skill by clicking なし", async () => {
    // First select a skill
    await page.click('[aria-label="スキルを選択"]');
    await page.click('[role="option"]:has-text("test-skill")');

    // Then deselect
    await page.click('[aria-label="スキルを選択"]');
    await page.click('[role="option"]:has-text("なし")');

    const selector = page.locator('[aria-label="スキルを選択"]');
    await expect(selector).toContainText("なし");
  });

  // キーボードナビゲーション
  it("should support keyboard navigation", async () => {
    await page.click('[aria-label="スキルを選択"]');

    // Arrow down to navigate
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("ArrowDown");

    // Enter to select
    await page.keyboard.press("Enter");

    // Dropdown should close
    const dropdown = page.locator('[role="listbox"]');
    await expect(dropdown).not.toBeVisible();
  });

  // 外側クリックで閉じる
  it("should close dropdown when clicking outside", async () => {
    await page.click('[aria-label="スキルを選択"]');

    const dropdown = page.locator('[role="listbox"]');
    await expect(dropdown).toBeVisible();

    // Click outside
    await page.click("body", { position: { x: 10, y: 10 } });

    await expect(dropdown).not.toBeVisible();
  });
});
```

## ファイル

| 操作 | パス                                               |
| ---- | -------------------------------------------------- |
| 作成 | `apps/desktop/src/__tests__/skillSelection.e2e.ts` |

## 完了条件

- [ ] 4件のスキル選択E2Eテストが実装されている
- [ ] 全テストが通過する
- [ ] キーボードナビゲーションがテストされている
- [ ] ドロップダウンの開閉がテストされている

## テストケース一覧

1. スキルセレクター表示
2. ドロップダウン開く
3. スキル選択
4. スキル選択解除
