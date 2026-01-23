---
id: TASK-8C
tier: 1
title: 統合テスト
phase: 8
depends_on: [TASK-4-1, TASK-4-2, TASK-5-1, TASK-7D]
parallel_with: [TASK-8A, TASK-8B]
blocks: []
status: pending
priority: high
estimated_complexity: large
tags: [test, integration-test, e2e, ipc]
---

# 統合テスト

## 概要

IPC通信、実行フローの統合テスト・E2Eテストを実装する。

## 入力

- TASK-4-1: IPC チャネル定義
- TASK-4-2: IPC ハンドラー
- TASK-5-1: Preload API
- TASK-7D: ChatPanel 統合

## 出力

- IPC 統合テスト
- E2E テスト
- 全テスト通過

## 実装詳細

### IPC 統合テスト

```typescript
// apps/desktop/src/main/ipc/__tests__/skillIpc.integration.ts

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { ipcMain, ipcRenderer } from "electron";
import { setupSkillIpcHandlers } from "../skillHandlers";
import { SkillScanner } from "../../services/skill/SkillScanner";
import { SkillImportStore } from "../../services/skill/SkillImportStore";
import { SkillExecutor } from "../../services/skill/SkillExecutor";

// Mock electron
vi.mock("electron", () => ({
  ipcMain: {
    handle: vi.fn(),
    on: vi.fn(),
    removeHandler: vi.fn(),
    removeListener: vi.fn(),
  },
  ipcRenderer: {
    invoke: vi.fn(),
    on: vi.fn(),
    removeListener: vi.fn(),
  },
  BrowserWindow: {
    getFocusedWindow: vi.fn(() => ({
      webContents: {
        send: vi.fn(),
      },
    })),
  },
}));

describe("Skill IPC Integration", () => {
  let handlers: Map<string, (...args: unknown[]) => unknown>;
  let mockScanner: SkillScanner;
  let mockStore: SkillImportStore;
  let mockExecutor: SkillExecutor;

  beforeEach(() => {
    handlers = new Map();

    // Capture registered handlers
    vi.mocked(ipcMain.handle).mockImplementation((channel, handler) => {
      handlers.set(channel, handler);
    });

    mockScanner = {
      scanAll: vi.fn(),
      parseSkill: vi.fn(),
    } as unknown as SkillScanner;

    mockStore = {
      get: vi.fn(),
      add: vi.fn(),
      remove: vi.fn(),
      exists: vi.fn(),
    } as unknown as SkillImportStore;

    mockExecutor = {
      execute: vi.fn(),
      abort: vi.fn(),
      handlePermissionResponse: vi.fn(),
    } as unknown as SkillExecutor;

    setupSkillIpcHandlers(mockScanner, mockStore, mockExecutor);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("skill:list", () => {
    it("should return available skills from scanner", async () => {
      const mockSkills = [
        { name: "skill-a", description: "Skill A" },
        { name: "skill-b", description: "Skill B" },
      ];
      vi.mocked(mockScanner.scanAll).mockResolvedValue(mockSkills);

      const handler = handlers.get("skill:list");
      const result = await handler!({} as Electron.IpcMainInvokeEvent);

      expect(result).toEqual(mockSkills);
      expect(mockScanner.scanAll).toHaveBeenCalled();
    });

    it("should handle scanner errors", async () => {
      vi.mocked(mockScanner.scanAll).mockRejectedValue(
        new Error("Scan failed"),
      );

      const handler = handlers.get("skill:list");

      await expect(handler!({} as Electron.IpcMainInvokeEvent)).rejects.toThrow(
        "Scan failed",
      );
    });
  });

  describe("skill:getImported", () => {
    it("should return imported skills from store", async () => {
      const mockImported = [{ name: "imported-skill", importedAt: Date.now() }];
      vi.mocked(mockStore.get).mockReturnValue(mockImported);

      const handler = handlers.get("skill:getImported");
      const result = await handler!({} as Electron.IpcMainInvokeEvent);

      expect(result).toEqual(mockImported);
    });
  });

  describe("skill:import", () => {
    it("should import skill and return imported data", async () => {
      const skillMetadata = {
        name: "new-skill",
        description: "New skill",
        agents: [],
        references: [],
      };
      vi.mocked(mockScanner.parseSkill).mockResolvedValue(skillMetadata);
      vi.mocked(mockStore.exists).mockReturnValue(false);
      vi.mocked(mockStore.add).mockReturnValue(undefined);

      const handler = handlers.get("skill:import");
      const result = await handler!(
        {} as Electron.IpcMainInvokeEvent,
        "new-skill",
      );

      expect(result).toMatchObject({
        name: "new-skill",
        importedAt: expect.any(Number),
      });
      expect(mockStore.add).toHaveBeenCalled();
    });

    it("should throw error if skill already imported", async () => {
      vi.mocked(mockStore.exists).mockReturnValue(true);

      const handler = handlers.get("skill:import");

      await expect(
        handler!({} as Electron.IpcMainInvokeEvent, "existing-skill"),
      ).rejects.toThrow(/already imported/i);
    });

    it("should throw error if skill not found", async () => {
      vi.mocked(mockScanner.parseSkill).mockResolvedValue(null);
      vi.mocked(mockStore.exists).mockReturnValue(false);

      const handler = handlers.get("skill:import");

      await expect(
        handler!({} as Electron.IpcMainInvokeEvent, "non-existent"),
      ).rejects.toThrow(/not found/i);
    });
  });

  describe("skill:remove", () => {
    it("should remove skill from store", async () => {
      vi.mocked(mockStore.exists).mockReturnValue(true);

      const handler = handlers.get("skill:remove");
      await handler!({} as Electron.IpcMainInvokeEvent, "skill-to-remove");

      expect(mockStore.remove).toHaveBeenCalledWith("skill-to-remove");
    });

    it("should throw error if skill not imported", async () => {
      vi.mocked(mockStore.exists).mockReturnValue(false);

      const handler = handlers.get("skill:remove");

      await expect(
        handler!({} as Electron.IpcMainInvokeEvent, "not-imported"),
      ).rejects.toThrow(/not imported/i);
    });
  });

  describe("skill:execute", () => {
    it("should start execution and return execution ID", async () => {
      const mockResponse = { executionId: "exec-123" };
      vi.mocked(mockExecutor.execute).mockResolvedValue(mockResponse);

      const handler = handlers.get("skill:execute");
      const result = await handler!({} as Electron.IpcMainInvokeEvent, {
        skillName: "test-skill",
        prompt: "Test prompt",
      });

      expect(result).toEqual(mockResponse);
      expect(mockExecutor.execute).toHaveBeenCalledWith(
        { skillName: "test-skill", prompt: "Test prompt" },
        expect.any(Function),
      );
    });
  });

  describe("skill:abort", () => {
    it("should abort execution", async () => {
      vi.mocked(mockExecutor.abort).mockReturnValue(true);

      const handler = handlers.get("skill:abort");
      const result = await handler!(
        {} as Electron.IpcMainInvokeEvent,
        "exec-123",
      );

      expect(result).toBe(true);
      expect(mockExecutor.abort).toHaveBeenCalledWith("exec-123");
    });
  });

  describe("skill:respondToPermission", () => {
    it("should forward permission response to executor", async () => {
      const handler = handlers.get("skill:respondToPermission");
      await handler!({} as Electron.IpcMainInvokeEvent, {
        requestId: "req-123",
        approved: true,
        rememberChoice: false,
      });

      expect(mockExecutor.handlePermissionResponse).toHaveBeenCalledWith(
        "req-123",
        true,
        false,
      );
    });
  });
});
```

### E2E テスト

```typescript
// apps/desktop/src/__tests__/skillExecution.e2e.ts

import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import { ElectronApplication, Page, _electron as electron } from "playwright";
import path from "path";

describe("Skill Execution E2E", () => {
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
      window.electronAPI.skill.resetForTesting?.();
    });
  });

  describe("Skill Selection Flow", () => {
    it("should display skill selector in chat panel", async () => {
      const skillSelector = page.locator('[aria-label="スキルを選択"]');
      await expect(skillSelector).toBeVisible();
    });

    it("should open dropdown and show available skills", async () => {
      await page.click('[aria-label="スキルを選択"]');

      const dropdown = page.locator('[role="listbox"]');
      await expect(dropdown).toBeVisible();

      // Should show "なし" option
      await expect(page.locator('text="なし"')).toBeVisible();
    });

    it("should select a skill", async () => {
      await page.click('[aria-label="スキルを選択"]');
      await page.click('[role="option"]:has-text("test-skill")');

      // Selector should now show selected skill name
      const selector = page.locator('[aria-label="スキルを選択"]');
      await expect(selector).toContainText("test-skill");
    });

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
  });

  describe("Skill Import Flow", () => {
    it("should open import dialog for unimported skill", async () => {
      await page.click('[aria-label="スキルを選択"]');

      // Click import button for available skill
      await page.click('[data-testid="import-skill-button"]');

      // Import dialog should be visible
      const dialog = page.locator('text="スキルをインポート"');
      await expect(dialog).toBeVisible();
    });

    it("should display skill details in import dialog", async () => {
      await page.click('[aria-label="スキルを選択"]');
      await page.click('[data-testid="import-skill-button"]');

      // Check for skill details
      await expect(page.locator('text="許可ツール"')).toBeVisible();
      await expect(page.locator('text="サブエージェント"')).toBeVisible();
    });

    it("should import skill and add to imported list", async () => {
      await page.click('[aria-label="スキルを選択"]');
      await page.click('[data-testid="import-skill-button"]');

      // Click import button
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
      // Ensure test skill is imported and selected
      await page.evaluate(() => {
        // Setup test state
      });
    });

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

    it("should display abort button while executing", async () => {
      await page.click('[aria-label="スキルを選択"]');
      await page.click('[role="option"]:has-text("test-skill")');

      await page.fill('[data-testid="chat-input"]', "Test prompt");
      await page.press('[data-testid="chat-input"]', "Enter");

      const abortButton = page.locator('button:has-text("停止")');
      await expect(abortButton).toBeVisible();
    });

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

  describe("Permission Dialog Flow", () => {
    it("should show permission dialog when tool requires approval", async () => {
      // Select skill and execute with command that needs permission
      await page.click('[aria-label="スキルを選択"]');
      await page.click('[role="option"]:has-text("test-skill")');

      await page.fill('[data-testid="chat-input"]', "Run dangerous command");
      await page.press('[data-testid="chat-input"]', "Enter");

      // Permission dialog should appear
      const dialog = page.locator('text="権限の確認が必要です"');
      await expect(dialog).toBeVisible({ timeout: 10000 });
    });

    it("should display tool info in permission dialog", async () => {
      await page.click('[aria-label="スキルを選択"]');
      await page.click('[role="option"]:has-text("test-skill")');

      await page.fill('[data-testid="chat-input"]', "Run dangerous command");
      await page.press('[data-testid="chat-input"]', "Enter");

      await page.waitForSelector('text="権限の確認が必要です"');

      // Check for tool info
      await expect(page.locator('text="ツール:"')).toBeVisible();
      await expect(page.locator('text="引数:"')).toBeVisible();
    });

    it("should approve permission and continue execution", async () => {
      await page.click('[aria-label="スキルを選択"]');
      await page.click('[role="option"]:has-text("test-skill")');

      await page.fill('[data-testid="chat-input"]', "Run dangerous command");
      await page.press('[data-testid="chat-input"]', "Enter");

      await page.waitForSelector('text="権限の確認が必要です"');

      // Click approve
      await page.click('button:has-text("許可")');

      // Dialog should close
      await page.waitForSelector('text="権限の確認が必要です"', {
        state: "hidden",
      });

      // Execution should continue
      await expect(page.locator('text="実行中"')).toBeVisible();
    });

    it("should deny permission and stop execution", async () => {
      await page.click('[aria-label="スキルを選択"]');
      await page.click('[role="option"]:has-text("test-skill")');

      await page.fill('[data-testid="chat-input"]', "Run dangerous command");
      await page.press('[data-testid="chat-input"]', "Enter");

      await page.waitForSelector('text="権限の確認が必要です"');

      // Click deny
      await page.click('button:has-text("拒否")');

      // Dialog should close
      await page.waitForSelector('text="権限の確認が必要です"', {
        state: "hidden",
      });

      // Execution should be cancelled/error
      await expect(page.locator('text="キャンセル"')).toBeVisible();
    });

    it("should remember choice when checkbox is checked", async () => {
      await page.click('[aria-label="スキルを選択"]');
      await page.click('[role="option"]:has-text("test-skill")');

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
      await expect(
        page.locator('text="権限の確認が必要です"'),
      ).not.toBeVisible();
    });
  });

  describe("Rescan Flow", () => {
    it("should rescan skills when rescan button clicked", async () => {
      await page.click('[aria-label="スキルを選択"]');

      // Click rescan button
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

### テストフィクスチャ

```typescript
// apps/desktop/src/__tests__/__fixtures__/skills/test-skill/SKILL.md

// フィクスチャファイルを以下のように配置:
// __fixtures__/
//   skills/
//     test-skill/
//       SKILL.md
//       agents/
//         test-agent.md
//       references/
//         test-ref.md
```

## ファイル

| 操作 | パス                                                                             |
| ---- | -------------------------------------------------------------------------------- |
| 作成 | `apps/desktop/src/main/ipc/__tests__/skillIpc.integration.ts`                    |
| 作成 | `apps/desktop/src/__tests__/skillExecution.e2e.ts`                               |
| 作成 | `apps/desktop/src/__tests__/__fixtures__/skills/test-skill/SKILL.md`             |
| 作成 | `apps/desktop/src/__tests__/__fixtures__/skills/test-skill/agents/test-agent.md` |

## 依存パッケージ

- `vitest` - テストフレームワーク（既存）
- `playwright` - E2Eテスト（既存）
- `@playwright/test` - Playwright テストランナー

## 完了条件

- [ ] IPC 統合テストが全て通過する
- [ ] E2E テストが全て通過する
- [ ] テストフィクスチャが作成されている
- [ ] CI/CD でテストが実行される

## テストケース一覧

### IPC 統合テスト (12ケース)

1. skill:list - スキル一覧取得
2. skill:list - スキャンエラー処理
3. skill:getImported - インポート済み取得
4. skill:import - スキルインポート成功
5. skill:import - 既存スキルエラー
6. skill:import - 存在しないスキルエラー
7. skill:remove - スキル削除成功
8. skill:remove - 未インポートスキルエラー
9. skill:execute - 実行開始
10. skill:abort - 実行中止
11. skill:respondToPermission - 権限応答転送
12. skill:rescan - 再スキャン

### E2E テスト (16ケース)

#### Skill Selection Flow (4ケース)

1. スキルセレクター表示
2. ドロップダウン開く
3. スキル選択
4. スキル選択解除

#### Skill Import Flow (3ケース)

5. インポートダイアログ表示
6. スキル詳細表示
7. インポート実行

#### Skill Execution Flow (3ケース)

8. ストリーミング表示
9. 停止ボタン表示
10. 実行中止

#### Permission Dialog Flow (5ケース)

11. 権限ダイアログ表示
12. ツール情報表示
13. 許可して続行
14. 拒否して停止
15. 選択記憶

#### Rescan Flow (1ケース)

16. 再スキャン実行

## 参考資料

- [Playwright ドキュメント](https://playwright.dev/)
- [Electron テストガイド](https://www.electronjs.org/docs/latest/tutorial/automated-testing)
- 既存E2Eテスト: `apps/desktop/e2e/`
