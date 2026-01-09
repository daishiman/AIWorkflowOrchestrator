/**
 * スキル実行器のユニットテスト
 * @module main/slide/__tests__/skill-executor.test
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { createSkillExecutor } from "../skill-executor";

describe("SkillExecutor", () => {
  const testProjectPath = "/test/project";

  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe("createSkillExecutor", () => {
    it("should create executor with isExecuting false", () => {
      const executor = createSkillExecutor();

      expect(executor.isExecuting()).toBe(false);
    });
  });

  describe("execute", () => {
    it("should execute hearing phase successfully", async () => {
      const executor = createSkillExecutor();

      const resultPromise = executor.execute("hearing", testProjectPath);
      await vi.advanceTimersByTimeAsync(1000);
      const result = await resultPromise;

      expect(result.phase).toBe("hearing");
      expect(result.success).toBe(true);
      expect(result.duration).toBeGreaterThan(0);
    });

    it("should execute structure phase successfully", async () => {
      const executor = createSkillExecutor();

      const resultPromise = executor.execute("structure", testProjectPath);
      await vi.advanceTimersByTimeAsync(1000);
      const result = await resultPromise;

      expect(result.phase).toBe("structure");
      expect(result.success).toBe(true);
    });

    it("should execute html phase successfully", async () => {
      const executor = createSkillExecutor();

      const resultPromise = executor.execute("html", testProjectPath);
      await vi.advanceTimersByTimeAsync(1000);
      const result = await resultPromise;

      expect(result.phase).toBe("html");
      expect(result.success).toBe(true);
    });

    it("should execute modifier phase successfully", async () => {
      const executor = createSkillExecutor();

      const resultPromise = executor.execute("modifier", testProjectPath);
      await vi.advanceTimersByTimeAsync(1000);
      const result = await resultPromise;

      expect(result.phase).toBe("modifier");
      expect(result.success).toBe(true);
    });

    it("should set isExecuting to true during execution", async () => {
      const executor = createSkillExecutor();

      const resultPromise = executor.execute("hearing", testProjectPath);

      expect(executor.isExecuting()).toBe(true);

      await vi.advanceTimersByTimeAsync(1000);
      await resultPromise;

      expect(executor.isExecuting()).toBe(false);
    });

    it("should prevent concurrent executions", async () => {
      const executor = createSkillExecutor();

      // Start first execution
      const firstPromise = executor.execute("hearing", testProjectPath);

      // Try to start second execution
      const secondResult = await executor.execute("structure", testProjectPath);

      // Second should fail immediately
      expect(secondResult.success).toBe(false);
      expect(secondResult.error).toBe("Another skill is already executing");

      // Complete first execution
      await vi.advanceTimersByTimeAsync(1000);
      const firstResult = await firstPromise;

      expect(firstResult.success).toBe(true);
    });
  });

  describe("cancel", () => {
    it("should cancel execution in progress", async () => {
      const executor = createSkillExecutor();

      const resultPromise = executor.execute("hearing", testProjectPath);

      // Cancel before completion
      executor.cancel();

      await vi.advanceTimersByTimeAsync(1000);
      const result = await resultPromise;

      expect(result.success).toBe(false);
      expect(result.error).toBe("Cancelled");
    });

    it("should allow new execution after cancel", async () => {
      const executor = createSkillExecutor();

      // Start and cancel first execution
      const firstPromise = executor.execute("hearing", testProjectPath);
      executor.cancel();
      await vi.advanceTimersByTimeAsync(1000);
      await firstPromise;

      // Start new execution
      const secondPromise = executor.execute("structure", testProjectPath);
      await vi.advanceTimersByTimeAsync(1000);
      const secondResult = await secondPromise;

      expect(secondResult.success).toBe(true);
    });
  });

  describe("onProgress", () => {
    it("should emit progress updates during execution", async () => {
      const executor = createSkillExecutor();
      const progressCallback = vi.fn();

      executor.onProgress(progressCallback);

      const resultPromise = executor.execute("hearing", testProjectPath);
      await vi.advanceTimersByTimeAsync(1000);
      await resultPromise;

      // Should have received progress updates
      expect(progressCallback).toHaveBeenCalled();
      const calls = progressCallback.mock.calls.map((call) => call[0]);
      expect(calls).toContain(0);
      expect(calls).toContain(100);
    });

    it("should support multiple progress callbacks", async () => {
      const executor = createSkillExecutor();
      const callback1 = vi.fn();
      const callback2 = vi.fn();

      executor.onProgress(callback1);
      executor.onProgress(callback2);

      const resultPromise = executor.execute("hearing", testProjectPath);
      await vi.advanceTimersByTimeAsync(1000);
      await resultPromise;

      expect(callback1).toHaveBeenCalled();
      expect(callback2).toHaveBeenCalled();
    });
  });

  describe("edge cases", () => {
    it("should handle rapid cancel and restart", async () => {
      const executor = createSkillExecutor();

      // Start, cancel, restart multiple times
      for (let i = 0; i < 5; i++) {
        const promise = executor.execute("hearing", testProjectPath);
        executor.cancel();
        await vi.advanceTimersByTimeAsync(1000);
        const result = await promise;
        expect(result.success).toBe(false);
      }

      // Final execution should work
      const finalPromise = executor.execute("hearing", testProjectPath);
      await vi.advanceTimersByTimeAsync(1000);
      const finalResult = await finalPromise;

      expect(finalResult.success).toBe(true);
    });

    it("should report correct duration even on cancel", async () => {
      const executor = createSkillExecutor();

      const resultPromise = executor.execute("hearing", testProjectPath);

      // Wait some time then cancel
      await vi.advanceTimersByTimeAsync(500);
      executor.cancel();

      await vi.advanceTimersByTimeAsync(500);
      const result = await resultPromise;

      expect(result.duration).toBeGreaterThan(0);
    });
  });
});
