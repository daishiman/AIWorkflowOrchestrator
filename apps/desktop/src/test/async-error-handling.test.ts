/**
 * 非同期エラーハンドリング検証テスト
 *
 * TASK-FIX-10-1: dangerouslyIgnoreUnhandledErrors 削除後に
 * テスト内の非同期エラーが適切に処理されていることを検証する。
 */

import { describe, it, expect, vi, afterEach } from "vitest";

describe("Async Error Handling Patterns", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("Promise rejection handling", () => {
    it("should catch rejected promises with expect().rejects", async () => {
      const failingFn = async (): Promise<string> => {
        throw new Error("async error");
      };

      await expect(failingFn()).rejects.toThrow("async error");
    });

    it("should handle mockRejectedValue correctly", async () => {
      const mockFn = vi.fn().mockRejectedValue(new Error("mock rejection"));

      await expect(mockFn()).rejects.toThrow("mock rejection");
    });

    it("should handle mockRejectedValueOnce correctly", async () => {
      const mockFn = vi
        .fn()
        .mockRejectedValueOnce(new Error("first rejection"))
        .mockResolvedValueOnce("success");

      await expect(mockFn()).rejects.toThrow("first rejection");
      await expect(mockFn()).resolves.toBe("success");
    });
  });

  describe("afterEach cleanup patterns", () => {
    it("should complete async cleanup in afterEach", async () => {
      const cleanupFn = vi.fn().mockResolvedValue(undefined);

      // 非同期処理を実行
      await cleanupFn();

      expect(cleanupFn).toHaveBeenCalled();
    });

    it("should restore mocks without leaving pending operations", () => {
      const spy = vi.spyOn(console, "log").mockImplementation(() => {});

      console.log("test");

      expect(spy).toHaveBeenCalledWith("test");
      // afterEach の vi.restoreAllMocks() で自動的にクリーンアップされる
    });
  });

  describe("Timer-based async handling", () => {
    it("should handle timer cleanup without unhandled errors", () => {
      vi.useFakeTimers();

      const callback = vi.fn();
      const timerId = setTimeout(callback, 1000);

      vi.advanceTimersByTime(1000);
      expect(callback).toHaveBeenCalledOnce();

      clearTimeout(timerId);
      vi.useRealTimers();
    });

    it("should handle interval cleanup correctly", () => {
      vi.useFakeTimers();

      const callback = vi.fn();
      const intervalId = setInterval(callback, 100);

      vi.advanceTimersByTime(350);
      expect(callback).toHaveBeenCalledTimes(3);

      clearInterval(intervalId);
      vi.useRealTimers();
    });
  });

  describe("Error boundary patterns", () => {
    it("should handle try-catch in async functions", async () => {
      const riskyFn = async (): Promise<string> => {
        throw new Error("risky operation failed");
      };

      let caughtError: Error | null = null;
      try {
        await riskyFn();
      } catch (error) {
        caughtError = error as Error;
      }

      expect(caughtError).toBeInstanceOf(Error);
      expect(caughtError?.message).toBe("risky operation failed");
    });
  });
});
