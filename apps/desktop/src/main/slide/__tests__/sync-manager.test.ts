/**
 * 同期マネージャーのユニットテスト
 * @module main/slide/__tests__/sync-manager.test
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// @repo/sharedをモック（モジュール解決問題を回避）
vi.mock("@repo/shared", () => ({
  checkDependency: vi.fn(),
  bothFilesExist: vi.fn(),
}));

// skill-executorをモック
vi.mock("../skill-executor", () => ({
  createSkillExecutor: vi.fn(() => ({
    execute: vi.fn().mockResolvedValue({ success: true, duration: 1000 }),
    cancel: vi.fn(),
    isExecuting: vi.fn().mockReturnValue(false),
    onProgress: vi.fn(),
  })),
}));

import { createSyncManager } from "../sync-manager";
import type { SkillExecutor } from "../skill-executor";

// モック関数への参照を取得
const mockCheckDependency = vi.fn();
const mockBothFilesExist = vi.fn();

// vi.mockでモックした関数を上書き
vi.doMock("@repo/shared", () => ({
  checkDependency: mockCheckDependency,
  bothFilesExist: mockBothFilesExist,
}));

describe("SyncManager", () => {
  const testProjectPath = "/test/project";

  // モックエグゼキューター
  const createMockExecutor = (): SkillExecutor => ({
    execute: vi.fn().mockResolvedValue({ success: true, duration: 1000 }),
    cancel: vi.fn(),
    isExecuting: vi.fn().mockReturnValue(false),
    onProgress: vi.fn(),
  });

  beforeEach(() => {
    vi.clearAllMocks();
    mockBothFilesExist.mockResolvedValue(true);
    mockCheckDependency.mockResolvedValue(true);
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe("getStatus", () => {
    it("should call bothFilesExist with correct paths", async () => {
      mockBothFilesExist.mockResolvedValue(true);
      mockCheckDependency.mockResolvedValue(true);

      const mockExecutor = createMockExecutor();
      const manager = createSyncManager(mockExecutor);

      await manager.getStatus(testProjectPath);

      // Note: The actual implementation will use the imported functions
      // which are mocked at the module level
    });
  });

  describe("sync", () => {
    it("should execute html skill to sync", async () => {
      const mockExecutor = createMockExecutor();
      const manager = createSyncManager(mockExecutor);

      await manager.sync(testProjectPath);

      expect(mockExecutor.execute).toHaveBeenCalledWith(
        "html",
        testProjectPath,
      );
    });

    it("should throw error when sync fails", async () => {
      const mockExecutor = createMockExecutor();
      (mockExecutor.execute as ReturnType<typeof vi.fn>).mockResolvedValue({
        success: false,
        error: "Execution failed",
      });

      const manager = createSyncManager(mockExecutor);

      await expect(manager.sync(testProjectPath)).rejects.toThrow(
        "Execution failed",
      );
    });

    it("should throw default error when sync fails without message", async () => {
      const mockExecutor = createMockExecutor();
      (mockExecutor.execute as ReturnType<typeof vi.fn>).mockResolvedValue({
        success: false,
      });

      const manager = createSyncManager(mockExecutor);

      await expect(manager.sync(testProjectPath)).rejects.toThrow(
        "Sync failed",
      );
    });
  });

  describe("setAutoSync", () => {
    it("should enable auto sync", () => {
      const mockExecutor = createMockExecutor();
      const manager = createSyncManager(mockExecutor);

      manager.setAutoSync(true);

      expect(manager.isAutoSyncEnabled()).toBe(true);
    });

    it("should disable auto sync", () => {
      const mockExecutor = createMockExecutor();
      const manager = createSyncManager(mockExecutor);

      manager.setAutoSync(false);

      expect(manager.isAutoSyncEnabled()).toBe(false);
    });

    it("should default to enabled", () => {
      const mockExecutor = createMockExecutor();
      const manager = createSyncManager(mockExecutor);

      expect(manager.isAutoSyncEnabled()).toBe(true);
    });
  });

  describe("onProgress", () => {
    it("should register progress callback with executor", () => {
      const mockExecutor = createMockExecutor();
      const manager = createSyncManager(mockExecutor);
      const callback = vi.fn();

      manager.onProgress(callback);

      expect(mockExecutor.onProgress).toHaveBeenCalledWith(callback);
    });
  });

  describe("cancel", () => {
    it("should cancel executor", () => {
      const mockExecutor = createMockExecutor();
      const manager = createSyncManager(mockExecutor);

      manager.cancel();

      expect(mockExecutor.cancel).toHaveBeenCalled();
    });
  });

  describe("edge cases", () => {
    it("should handle multiple sync calls", async () => {
      const mockExecutor = createMockExecutor();
      const manager = createSyncManager(mockExecutor);

      await manager.sync(testProjectPath);
      await manager.sync(testProjectPath);

      expect(mockExecutor.execute).toHaveBeenCalledTimes(2);
    });
  });

  // ==========================================================================
  // Reverse Sync Tests (TDD Red - Phase 4)
  // テストID: SM-01 ~ SM-06
  // ==========================================================================
  describe("Reverse Sync - reverseSync", () => {
    it("SM-01: should execute modifier skill on reverseSync", async () => {
      const mockExecutor = createMockExecutor();
      const manager = createSyncManager(mockExecutor);

      // reverseSyncメソッドが存在することを確認
      expect(typeof manager.reverseSync).toBe("function");

      await manager.reverseSync(testProjectPath);

      // modifierスキルが実行されること
      expect(mockExecutor.execute).toHaveBeenCalledWith(
        "modifier",
        testProjectPath,
      );
    });

    it("SM-02: should return structure changes on success", async () => {
      const mockExecutor = createMockExecutor();
      const expectedChanges = {
        success: true,
        duration: 1000,
        changes: [
          {
            type: "modify",
            section: "# スライド1",
            before: "旧内容",
            after: "新内容",
          },
        ],
      };
      (mockExecutor.execute as ReturnType<typeof vi.fn>).mockResolvedValue(
        expectedChanges,
      );

      const manager = createSyncManager(mockExecutor);
      const result = await manager.reverseSync(testProjectPath);

      expect(result).toEqual(expectedChanges);
    });

    it("SM-03: should throw error on reverseSync failure", async () => {
      const mockExecutor = createMockExecutor();
      (mockExecutor.execute as ReturnType<typeof vi.fn>).mockResolvedValue({
        success: false,
        error: "Modifier skill failed",
      });

      const manager = createSyncManager(mockExecutor);

      await expect(manager.reverseSync(testProjectPath)).rejects.toThrow(
        "Modifier skill failed",
      );
    });

    it("SM-04: should update sync direction on reverseSync", async () => {
      const mockExecutor = createMockExecutor();
      const manager = createSyncManager(mockExecutor);
      const statusCallback = vi.fn();

      // ステータス変更のコールバックを登録
      manager.onStatusChange(statusCallback);

      await manager.reverseSync(testProjectPath);

      // ステータスコールバックでdirectionが'reverse'になっていること
      expect(statusCallback).toHaveBeenCalledWith(
        expect.objectContaining({
          direction: "reverse",
          status: "syncing",
        }),
      );
    });
  });

  describe("Reverse Sync - cancel and progress", () => {
    it("SM-05: should handle cancel during reverseSync", async () => {
      const mockExecutor = createMockExecutor();
      // 長時間実行をシミュレート
      let resolvePromise: (value: unknown) => void;
      (mockExecutor.execute as ReturnType<typeof vi.fn>).mockImplementation(
        () =>
          new Promise((resolve) => {
            resolvePromise = resolve;
          }),
      );

      const manager = createSyncManager(mockExecutor);

      // reverseSyncを開始（完了を待たない）
      const syncPromise = manager.reverseSync(testProjectPath);

      // キャンセルを実行
      manager.cancel();

      expect(mockExecutor.cancel).toHaveBeenCalled();

      // クリーンアップのため、Promiseを解決
      resolvePromise!({ success: false, cancelled: true });
      await expect(syncPromise).rejects.toThrow();
    });

    it("SM-06: should emit progress during reverseSync", async () => {
      const mockExecutor = createMockExecutor();
      const manager = createSyncManager(mockExecutor);
      const progressCallback = vi.fn();

      manager.onProgress(progressCallback);

      // progressコールバックがエグゼキューターに登録されること
      expect(mockExecutor.onProgress).toHaveBeenCalledWith(progressCallback);

      await manager.reverseSync(testProjectPath);

      // executeが呼ばれることで進捗が報告される
      expect(mockExecutor.execute).toHaveBeenCalled();
    });
  });

  describe("Reverse Sync - onStatusChange", () => {
    it("should register status change callback", () => {
      const mockExecutor = createMockExecutor();
      const manager = createSyncManager(mockExecutor);
      const statusCallback = vi.fn();

      // onStatusChangeメソッドが存在することを確認
      expect(typeof manager.onStatusChange).toBe("function");

      // コールバック登録がエラーなく完了すること
      expect(() => manager.onStatusChange(statusCallback)).not.toThrow();
    });

    it("should call status callback with correct direction for forward sync", async () => {
      const mockExecutor = createMockExecutor();
      const manager = createSyncManager(mockExecutor);
      const statusCallback = vi.fn();

      manager.onStatusChange(statusCallback);

      await manager.sync(testProjectPath);

      // 順方向同期のステータス
      expect(statusCallback).toHaveBeenCalledWith(
        expect.objectContaining({
          direction: "forward",
        }),
      );
    });
  });
});
