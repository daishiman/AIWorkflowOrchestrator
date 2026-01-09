/**
 * ファイルウォッチャーのユニットテスト
 * @module main/slide/__tests__/file-watcher.test
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// MockWatcherクラスを先に定義
class MockWatcher {
  private events: Map<string, Array<(...args: unknown[]) => void>> = new Map();
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

// chokidarをモック
const mockWatchInstance = new MockWatcher();
vi.mock("chokidar", () => ({
  default: {
    watch: vi.fn(() => mockWatchInstance),
  },
  watch: vi.fn(() => mockWatchInstance),
}));

import chokidar from "chokidar";
import { createSlideWatcher } from "../file-watcher";

describe("SlideWatcher", () => {
  const testProjectPath = "/test/project";

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe("createSlideWatcher", () => {
    it("should create watcher with correct project path", () => {
      const watcher = createSlideWatcher(testProjectPath);

      expect(watcher.projectPath).toBe(testProjectPath);
      expect(watcher.watcher).toBeNull();
    });
  });

  describe("start", () => {
    it("should start watching structure.md", () => {
      const watcher = createSlideWatcher(testProjectPath);

      watcher.start();

      expect(chokidar.watch).toHaveBeenCalledWith(
        `${testProjectPath}/structure.md`,
        expect.objectContaining({
          persistent: true,
          ignoreInitial: true,
        }),
      );
      expect(watcher.watcher).not.toBeNull();
    });
  });

  describe("stop", () => {
    it("should close watcher and set to null", () => {
      const watcher = createSlideWatcher(testProjectPath);
      watcher.start();
      const internalWatcher = watcher.watcher;

      watcher.stop();

      expect(internalWatcher?.close).toHaveBeenCalled();
      expect(watcher.watcher).toBeNull();
    });

    it("should handle stop when not started", () => {
      const watcher = createSlideWatcher(testProjectPath);

      // Should not throw
      expect(() => watcher.stop()).not.toThrow();
    });
  });

  describe("onStructureChange", () => {
    it("should register callback and call on change event", () => {
      const watcher = createSlideWatcher(testProjectPath);
      const callback = vi.fn();

      watcher.onStructureChange(callback);
      watcher.start();

      // Emit change event
      mockWatchInstance.emit("change", "/test/project/structure.md");

      expect(callback).toHaveBeenCalledWith("/test/project/structure.md");
    });

    it("should call multiple registered callbacks", () => {
      const watcher = createSlideWatcher(testProjectPath);
      const callback1 = vi.fn();
      const callback2 = vi.fn();

      watcher.onStructureChange(callback1);
      watcher.onStructureChange(callback2);
      watcher.start();

      mockWatchInstance.emit("change", "/test/project/structure.md");

      expect(callback1).toHaveBeenCalled();
      expect(callback2).toHaveBeenCalled();
    });
  });

  describe("markAsSkillChange (infinite loop prevention)", () => {
    it("should ignore skill-originated changes within TTL", () => {
      const watcher = createSlideWatcher(testProjectPath);
      const callback = vi.fn();

      watcher.onStructureChange(callback);
      watcher.start();

      // Mark as skill change
      watcher.markAsSkillChange("/test/project/structure.md", "html");

      // Emit change event immediately (within 1000ms TTL)
      mockWatchInstance.emit("change", "/test/project/structure.md");

      expect(callback).not.toHaveBeenCalled();
    });

    it("should process user changes after TTL expires", () => {
      const watcher = createSlideWatcher(testProjectPath);
      const callback = vi.fn();

      watcher.onStructureChange(callback);
      watcher.start();

      // Mark as skill change
      watcher.markAsSkillChange("/test/project/structure.md", "html");

      // Advance past TTL (1000ms)
      vi.advanceTimersByTime(1001);

      // Emit change event after TTL
      mockWatchInstance.emit("change", "/test/project/structure.md");

      expect(callback).toHaveBeenCalledWith("/test/project/structure.md");
    });

    it("should process user changes for unmarked files", () => {
      const watcher = createSlideWatcher(testProjectPath);
      const callback = vi.fn();

      watcher.onStructureChange(callback);
      watcher.start();

      // Mark different file
      watcher.markAsSkillChange("/other/structure.md", "html");

      // Emit change for test project
      mockWatchInstance.emit("change", "/test/project/structure.md");

      expect(callback).toHaveBeenCalled();
    });
  });

  describe("clearChangeContext", () => {
    it("should clear change context allowing immediate callback", () => {
      const watcher = createSlideWatcher(testProjectPath);
      const callback = vi.fn();

      watcher.onStructureChange(callback);
      watcher.start();

      // Mark as skill change then clear
      watcher.markAsSkillChange("/test/project/structure.md", "html");
      watcher.clearChangeContext("/test/project/structure.md");

      // Emit change event
      mockWatchInstance.emit("change", "/test/project/structure.md");

      expect(callback).toHaveBeenCalled();
    });
  });

  describe("edge cases", () => {
    it("should handle rapid successive changes", () => {
      const watcher = createSlideWatcher(testProjectPath);
      const callback = vi.fn();

      watcher.onStructureChange(callback);
      watcher.start();

      // Emit 10 rapid changes
      for (let i = 0; i < 10; i++) {
        mockWatchInstance.emit("change", "/test/project/structure.md");
      }

      expect(callback).toHaveBeenCalledTimes(10);
    });

    it("should handle different skill phases", () => {
      const watcher = createSlideWatcher(testProjectPath);
      const callback = vi.fn();

      watcher.onStructureChange(callback);
      watcher.start();

      const phases = ["hearing", "structure", "html", "modifier"] as const;

      phases.forEach((phase) => {
        watcher.markAsSkillChange("/test/project/structure.md", phase);
        mockWatchInstance.emit("change", "/test/project/structure.md");
      });

      // All changes should be ignored as skill changes
      expect(callback).not.toHaveBeenCalled();
    });
  });
});
