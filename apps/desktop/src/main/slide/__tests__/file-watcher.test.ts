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
    it("should start watching structure.md and index.html", () => {
      const watcher = createSlideWatcher(testProjectPath);

      watcher.start();

      // structure.mdとindex.html両方を監視
      expect(chokidar.watch).toHaveBeenCalledWith(
        expect.arrayContaining([
          `${testProjectPath}/structure.md`,
          `${testProjectPath}/index.html`,
        ]),
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

  // ==========================================================================
  // Reverse Sync Tests (TDD Red - Phase 4)
  // テストID: FW-01 ~ FW-06
  // ==========================================================================
  describe("Reverse Sync - onHtmlChange", () => {
    it("FW-01: should watch index.html in addition to structure.md", () => {
      const watcher = createSlideWatcher(testProjectPath);

      watcher.start();

      // index.htmlも監視対象に含まれていることを確認
      expect(chokidar.watch).toHaveBeenCalledWith(
        expect.arrayContaining([
          `${testProjectPath}/structure.md`,
          `${testProjectPath}/index.html`,
        ]),
        expect.any(Object),
      );
    });

    it("FW-02: should call onHtmlChange callback on html change", () => {
      const watcher = createSlideWatcher(testProjectPath);
      const htmlCallback = vi.fn();

      // onHtmlChangeメソッドが存在することを確認
      expect(typeof watcher.onHtmlChange).toBe("function");

      watcher.onHtmlChange(htmlCallback);
      watcher.start();

      // HTML変更イベントを発火
      mockWatchInstance.emit("change", "/test/project/index.html");

      expect(htmlCallback).toHaveBeenCalledWith("/test/project/index.html");
    });

    it("FW-03: should ignore html skill-originated changes", () => {
      const watcher = createSlideWatcher(testProjectPath);
      const htmlCallback = vi.fn();

      watcher.onHtmlChange(htmlCallback);
      watcher.start();

      // HTMLスキル起因の変更としてマーク
      watcher.markAsSkillChange("/test/project/index.html", "html");

      // HTML変更イベントを発火（TTL内）
      mockWatchInstance.emit("change", "/test/project/index.html");

      // スキル起因の変更は無視される
      expect(htmlCallback).not.toHaveBeenCalled();
    });
  });

  describe("Reverse Sync - bidirectional loop prevention", () => {
    it("FW-04: should ignore modifier skill-originated changes", () => {
      const watcher = createSlideWatcher(testProjectPath);
      const structureCallback = vi.fn();

      watcher.onStructureChange(structureCallback);
      watcher.start();

      // Modifierスキル起因の変更としてマーク
      watcher.markAsSkillChange("/test/project/structure.md", "modifier");

      // structure.md変更イベントを発火
      mockWatchInstance.emit("change", "/test/project/structure.md");

      // Modifierスキル起因の変更は無視される
      expect(structureCallback).not.toHaveBeenCalled();
    });

    it("FW-05: should process html changes after TTL", () => {
      const watcher = createSlideWatcher(testProjectPath);
      const htmlCallback = vi.fn();

      watcher.onHtmlChange(htmlCallback);
      watcher.start();

      // HTMLスキル起因の変更としてマーク
      watcher.markAsSkillChange("/test/project/index.html", "html");

      // TTL経過（1000ms以上）
      vi.advanceTimersByTime(1001);

      // HTML変更イベントを発火
      mockWatchInstance.emit("change", "/test/project/index.html");

      // TTL経過後はコールバックが呼ばれる
      expect(htmlCallback).toHaveBeenCalledWith("/test/project/index.html");
    });

    it("FW-06: should handle bidirectional loop prevention", () => {
      const watcher = createSlideWatcher(testProjectPath);
      const structureCallback = vi.fn();
      const htmlCallback = vi.fn();

      watcher.onStructureChange(structureCallback);
      watcher.onHtmlChange(htmlCallback);
      watcher.start();

      // シナリオ: structure.md変更 → html更新 → html変更検知
      // html更新をHTMLスキル起因としてマーク
      watcher.markAsSkillChange("/test/project/index.html", "html");

      // 直後のhtml変更は無視される（無限ループ防止）
      mockWatchInstance.emit("change", "/test/project/index.html");
      expect(htmlCallback).not.toHaveBeenCalled();

      // シナリオ: html変更 → structure更新 → structure変更検知
      // structure更新をModifierスキル起因としてマーク
      watcher.markAsSkillChange("/test/project/structure.md", "modifier");

      // 直後のstructure変更は無視される（無限ループ防止）
      mockWatchInstance.emit("change", "/test/project/structure.md");
      expect(structureCallback).not.toHaveBeenCalled();
    });
  });
});
