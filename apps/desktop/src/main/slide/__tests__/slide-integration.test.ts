/**
 * スライド機能の統合テスト
 * 複数モジュール間の連携を検証する
 * @module main/slide/__tests__/slide-integration.test
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// vi.hoisted で変数を定義してモック内で使用可能にする
const { mockWatchInstance, mockCheckDependency, mockBothFilesExist } =
  vi.hoisted(() => {
    // MockWatcherクラスをhoisted内で定義
    class HoistedMockWatcher {
      private events: Map<string, Array<(...args: unknown[]) => void>> =
        new Map();
      close = vi.fn();

      on(event: string, handler: (...args: unknown[]) => void): this {
        if (!this.events.has(event)) {
          this.events.set(event, []);
        }
        this.events.get(event)!.push(handler);
        return this;
      }

      emit(event: string, ...args: unknown[]): boolean {
        const handlers = this.events.get(event);
        if (handlers) {
          handlers.forEach((handler) => handler(...args));
          return true;
        }
        return false;
      }
    }

    return {
      mockWatchInstance: new HoistedMockWatcher(),
      mockCheckDependency: vi.fn(),
      mockBothFilesExist: vi.fn(),
    };
  });

// chokidarをモック
vi.mock("chokidar", () => ({
  default: {
    watch: vi.fn(() => mockWatchInstance),
  },
  watch: vi.fn(() => mockWatchInstance),
}));

// @repo/sharedをモック
vi.mock("@repo/shared", () => ({
  checkDependency: mockCheckDependency,
  bothFilesExist: mockBothFilesExist,
}));

import chokidar from "chokidar";
import { createSlideWatcher } from "../file-watcher";
import { createSkillExecutor } from "../skill-executor";
import { createSyncManager } from "../sync-manager";

describe("Slide Integration Tests", () => {
  const testProjectPath = "/test/project";

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    mockBothFilesExist.mockResolvedValue(true);
    mockCheckDependency.mockResolvedValue(true);
    // chokidarのモックを再設定
    vi.mocked(chokidar.watch).mockReturnValue(mockWatchInstance as never);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.resetAllMocks();
  });

  describe("File Watcher + Skill Executor Integration", () => {
    it("should prevent infinite loop when skill execution triggers file change", async () => {
      // Setup
      const watcher = createSlideWatcher(testProjectPath);
      const changeCallback = vi.fn();

      watcher.onStructureChange(changeCallback);
      watcher.start();

      // Mark file as skill change (simulating skill execution)
      watcher.markAsSkillChange(`${testProjectPath}/structure.md`, "html");

      // Trigger file change event (would happen after skill writes to file)
      mockWatchInstance.emit("change", `${testProjectPath}/structure.md`);

      // Callback should NOT be called (infinite loop prevented)
      expect(changeCallback).not.toHaveBeenCalled();

      // Cleanup
      watcher.stop();
    });

    it("should process user changes after TTL expires", async () => {
      // Setup
      const watcher = createSlideWatcher(testProjectPath);
      const changeCallback = vi.fn();

      watcher.onStructureChange(changeCallback);
      watcher.start();

      // Mark as skill change
      watcher.markAsSkillChange(`${testProjectPath}/structure.md`, "html");

      // Advance past TTL (1000ms)
      vi.advanceTimersByTime(1001);

      // Trigger file change
      mockWatchInstance.emit("change", `${testProjectPath}/structure.md`);

      // Callback SHOULD be called (TTL expired)
      expect(changeCallback).toHaveBeenCalled();

      // Cleanup
      watcher.stop();
    });
  });

  describe("Skill Executor + Sync Manager Integration", () => {
    it("should sync files via html skill execution", async () => {
      // Setup
      const executor = createSkillExecutor();
      const syncManager = createSyncManager(executor);
      const progressCallback = vi.fn();

      syncManager.onProgress(progressCallback);

      // Execute sync
      const syncPromise = syncManager.sync(testProjectPath);

      // Advance timers to complete execution
      await vi.advanceTimersByTimeAsync(1000);

      await syncPromise;

      // Progress should have been reported
      expect(progressCallback).toHaveBeenCalled();
    });

    it("should cancel sync operation", async () => {
      // Setup
      const executor = createSkillExecutor();
      const syncManager = createSyncManager(executor);

      // Start sync
      const syncPromise = syncManager.sync(testProjectPath);

      // Cancel immediately
      syncManager.cancel();

      // Set up rejection handler BEFORE advancing timers to prevent unhandled rejection
      const assertion = expect(syncPromise).rejects.toThrow("Cancelled");

      // Advance timers
      await vi.advanceTimersByTimeAsync(1000);

      // Wait for assertion to complete
      await assertion;
    });
  });

  describe("Full Integration Flow", () => {
    it("should handle complete workflow: watch -> detect -> sync -> prevent loop", async () => {
      // Setup components
      const watcher = createSlideWatcher(testProjectPath);
      const executor = createSkillExecutor();
      const syncManager = createSyncManager(executor);

      let syncTriggered = false;
      let loopDetected = false;

      // Setup watcher to detect changes
      watcher.onStructureChange(async (filePath) => {
        // If this callback fires after sync, it's a loop
        if (syncTriggered) {
          loopDetected = true;
          return;
        }

        // Check sync status
        mockCheckDependency.mockResolvedValue(false);

        syncTriggered = true;

        // Mark file before skill execution
        watcher.markAsSkillChange(filePath, "html");

        // Execute sync
        const syncPromise = syncManager.sync(testProjectPath);
        await vi.advanceTimersByTimeAsync(1000);
        await syncPromise;

        // After sync completes, file system would emit change event
        // This simulates the watcher detecting the change
        mockWatchInstance.emit("change", filePath);
      });

      watcher.start();

      // Simulate initial user change
      mockWatchInstance.emit("change", `${testProjectPath}/structure.md`);

      // Verify no infinite loop occurred
      expect(loopDetected).toBe(false);

      // Cleanup
      watcher.stop();
    });

    it("should support multiple sequential skill executions", async () => {
      const executor = createSkillExecutor();
      const phases = ["hearing", "structure", "html", "modifier"] as const;

      for (const phase of phases) {
        const resultPromise = executor.execute(phase, testProjectPath);
        await vi.advanceTimersByTimeAsync(1000);
        const result = await resultPromise;

        expect(result.success).toBe(true);
        expect(result.phase).toBe(phase);
      }
    });

    it("should handle rapid successive user changes", async () => {
      const watcher = createSlideWatcher(testProjectPath);
      const changeCount = { value: 0 };

      watcher.onStructureChange(() => {
        changeCount.value += 1;
      });

      watcher.start();

      // Simulate rapid changes
      for (let i = 0; i < 5; i++) {
        mockWatchInstance.emit("change", `${testProjectPath}/structure.md`);
      }

      // All changes should be detected
      expect(changeCount.value).toBe(5);

      watcher.stop();
    });
  });
});
