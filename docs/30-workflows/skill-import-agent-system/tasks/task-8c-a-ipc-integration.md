---
id: TASK-8C-A
tier: 1
title: IPC統合テスト
phase: 8
depends_on: [TASK-4-1, TASK-4-2]
parallel_with: [TASK-8C-B, TASK-8C-C]
blocks: []
status: pending
priority: high
estimated_complexity: medium
tags: [test, integration-test, ipc]
---

# IPC統合テスト

## 概要

スキル機能のIPC通信に関する統合テストを実装する（12ケース）。

## 入力

- TASK-4-1: IPC チャネル定義
- TASK-4-2: IPC ハンドラー

## 出力

- `apps/desktop/src/main/ipc/__tests__/skillIpc.integration.ts`

## 実装詳細

```typescript
// apps/desktop/src/main/ipc/__tests__/skillIpc.integration.ts

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { ipcMain } from "electron";
import { setupSkillIpcHandlers } from "../skillHandlers";

// Mock electron
vi.mock("electron", () => ({
  ipcMain: {
    handle: vi.fn(),
    on: vi.fn(),
    removeHandler: vi.fn(),
    removeListener: vi.fn(),
  },
  BrowserWindow: {
    getFocusedWindow: vi.fn(() => ({
      webContents: { send: vi.fn() },
    })),
  },
}));

describe("Skill IPC Integration", () => {
  let handlers: Map<string, (...args: unknown[]) => unknown>;
  let mockScanner, mockStore, mockExecutor;

  beforeEach(() => {
    handlers = new Map();
    vi.mocked(ipcMain.handle).mockImplementation((channel, handler) => {
      handlers.set(channel, handler);
    });

    mockScanner = { scanAll: vi.fn(), parseSkill: vi.fn() };
    mockStore = {
      get: vi.fn(),
      add: vi.fn(),
      remove: vi.fn(),
      exists: vi.fn(),
    };
    mockExecutor = {
      execute: vi.fn(),
      abort: vi.fn(),
      handlePermissionResponse: vi.fn(),
    };

    setupSkillIpcHandlers(mockScanner, mockStore, mockExecutor);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  // 1. skill:list - スキル一覧取得
  describe("skill:list", () => {
    it("should return available skills from scanner", async () => {
      const mockSkills = [{ name: "skill-a" }, { name: "skill-b" }];
      vi.mocked(mockScanner.scanAll).mockResolvedValue(mockSkills);

      const handler = handlers.get("skill:list");
      const result = await handler!({});

      expect(result).toEqual(mockSkills);
      expect(mockScanner.scanAll).toHaveBeenCalled();
    });

    // 2. スキャンエラー処理
    it("should handle scanner errors", async () => {
      vi.mocked(mockScanner.scanAll).mockRejectedValue(
        new Error("Scan failed"),
      );
      const handler = handlers.get("skill:list");
      await expect(handler!({})).rejects.toThrow("Scan failed");
    });
  });

  // 3. skill:getImported - インポート済み取得
  describe("skill:getImported", () => {
    it("should return imported skills from store", async () => {
      const mockImported = [{ name: "imported-skill" }];
      vi.mocked(mockStore.get).mockReturnValue(mockImported);

      const handler = handlers.get("skill:getImported");
      const result = await handler!({});

      expect(result).toEqual(mockImported);
    });
  });

  // 4-6. skill:import
  describe("skill:import", () => {
    it("should import skill and return imported data", async () => {
      const skillMetadata = { name: "new-skill", description: "New" };
      vi.mocked(mockScanner.parseSkill).mockResolvedValue(skillMetadata);
      vi.mocked(mockStore.exists).mockReturnValue(false);

      const handler = handlers.get("skill:import");
      const result = await handler!({}, "new-skill");

      expect(result).toMatchObject({ name: "new-skill" });
      expect(mockStore.add).toHaveBeenCalled();
    });

    it("should throw error if skill already imported", async () => {
      vi.mocked(mockStore.exists).mockReturnValue(true);
      const handler = handlers.get("skill:import");
      await expect(handler!({}, "existing")).rejects.toThrow(
        /already imported/i,
      );
    });

    it("should throw error if skill not found", async () => {
      vi.mocked(mockScanner.parseSkill).mockResolvedValue(null);
      vi.mocked(mockStore.exists).mockReturnValue(false);
      const handler = handlers.get("skill:import");
      await expect(handler!({}, "nonexistent")).rejects.toThrow(/not found/i);
    });
  });

  // 7-8. skill:remove
  describe("skill:remove", () => {
    it("should remove skill from store", async () => {
      vi.mocked(mockStore.exists).mockReturnValue(true);
      const handler = handlers.get("skill:remove");
      await handler!({}, "skill-to-remove");
      expect(mockStore.remove).toHaveBeenCalledWith("skill-to-remove");
    });

    it("should throw error if skill not imported", async () => {
      vi.mocked(mockStore.exists).mockReturnValue(false);
      const handler = handlers.get("skill:remove");
      await expect(handler!({}, "not-imported")).rejects.toThrow(
        /not imported/i,
      );
    });
  });

  // 9. skill:execute
  describe("skill:execute", () => {
    it("should start execution and return execution ID", async () => {
      const mockResponse = { executionId: "exec-123" };
      vi.mocked(mockExecutor.execute).mockResolvedValue(mockResponse);

      const handler = handlers.get("skill:execute");
      const result = await handler!({}, { skillName: "test", prompt: "Test" });

      expect(result).toEqual(mockResponse);
    });
  });

  // 10. skill:abort
  describe("skill:abort", () => {
    it("should abort execution", async () => {
      vi.mocked(mockExecutor.abort).mockReturnValue(true);
      const handler = handlers.get("skill:abort");
      const result = await handler!({}, "exec-123");
      expect(result).toBe(true);
    });
  });

  // 11. skill:respondToPermission
  describe("skill:respondToPermission", () => {
    it("should forward permission response to executor", async () => {
      const handler = handlers.get("skill:respondToPermission");
      await handler!({}, { requestId: "req-123", approved: true });
      expect(mockExecutor.handlePermissionResponse).toHaveBeenCalledWith(
        "req-123",
        true,
        undefined,
      );
    });
  });

  // 12. skill:rescan
  describe("skill:rescan", () => {
    it("should trigger rescan and return updated list", async () => {
      const mockSkills = [{ name: "skill-a" }];
      vi.mocked(mockScanner.scanAll).mockResolvedValue(mockSkills);

      const handler = handlers.get("skill:rescan");
      const result = await handler!({});

      expect(result).toEqual(mockSkills);
    });
  });
});
```

## ファイル

| 操作 | パス                                                          |
| ---- | ------------------------------------------------------------- |
| 作成 | `apps/desktop/src/main/ipc/__tests__/skillIpc.integration.ts` |

## 完了条件

- [ ] 12件のIPCテストケースが実装されている
- [ ] 全テストが通過する
- [ ] カバレッジ90%以上

## テストケース一覧

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

## TASK-2Bからの改善提案

### IMP-002: SkillImportStore IPC統合テストの追加

| 項目   | 内容                                                                   |
| ------ | ---------------------------------------------------------------------- |
| 優先度 | 中                                                                     |
| 発見元 | TASK-2B Phase 11                                                       |
| 内容   | SkillImportStore の設定管理・権限管理・キャッシュ機能の IPC 統合テスト |

#### 追加テストケース

| #   | チャネル                 | テストケース         |
| --- | ------------------------ | -------------------- |
| 13  | skill:settings:get       | 設定取得成功         |
| 14  | skill:settings:get       | 存在しないスキル     |
| 15  | skill:settings:update    | 設定更新成功         |
| 16  | skill:settings:update    | バリデーションエラー |
| 17  | skill:permissions:get    | 権限取得成功         |
| 18  | skill:permissions:grant  | 権限付与成功         |
| 19  | skill:permissions:revoke | 権限取消成功         |
| 20  | skill:cache:get          | キャッシュ取得成功   |
| 21  | skill:cache:set          | キャッシュ設定成功   |
| 22  | skill:cache:invalidate   | キャッシュ無効化成功 |

#### 参照仕様

- [interfaces-agent-sdk.md - SkillImportStore（TASK-2B）](/.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk.md) - スキーマ・API仕様詳細
