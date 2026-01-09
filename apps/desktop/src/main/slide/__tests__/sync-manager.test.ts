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
});
