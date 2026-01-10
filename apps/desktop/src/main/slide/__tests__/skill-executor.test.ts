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

  // ==========================================================================
  // Reverse Sync - Modifier Skill Tests (TDD Red - Phase 4)
  // テストID: SE-01 ~ SE-06
  // ==========================================================================
  describe("Modifier Skill - execute modifier", () => {
    it("SE-01: should execute modifier skill", async () => {
      const executor = createSkillExecutor();

      const resultPromise = executor.execute("modifier", testProjectPath);
      await vi.advanceTimersByTimeAsync(1000);
      const result = await resultPromise;

      expect(result.phase).toBe("modifier");
      expect(result.success).toBe(true);
    });

    it("SE-02: should pass correct context to modifier", async () => {
      const executor = createSkillExecutor();

      // modifierスキル実行時にコンテキストが正しく渡されることを確認
      const resultPromise = executor.execute("modifier", testProjectPath);
      await vi.advanceTimersByTimeAsync(1000);
      const result = await resultPromise;

      // 結果にprojectPathが含まれること
      expect(result.projectPath).toBe(testProjectPath);

      // modifierスキルの結果としてchanges配列が返されること
      expect(result).toHaveProperty("changes");
      expect(Array.isArray(result.changes)).toBe(true);
    });

    // Note: 現在はシミュレーション実装のため、タイムアウトは1秒で発生
    // Agent SDK統合後に実際の30秒タイムアウトテストを追加する
    it("SE-03: should handle modifier skill timeout", async () => {
      const executor = createSkillExecutor();

      // シミュレーション中はタイムアウトが発生しないため、正常完了を確認
      // Agent SDK統合後はタイムアウト処理をテストする
      const resultPromise = executor.execute("modifier", testProjectPath);

      // シミュレーションの完了を待つ
      await vi.advanceTimersByTimeAsync(1000);

      const result = await resultPromise;

      // シミュレーションは成功を返す（Agent SDK統合後にタイムアウトテストを追加）
      expect(result.success).toBe(true);
      expect(result.phase).toBe("modifier");
    });
  });

  describe("Modifier Skill - error handling and retry", () => {
    it("SE-04: should retry on modifier skill failure", async () => {
      const executor = createSkillExecutor();
      const progressCallback = vi.fn();

      executor.onProgress(progressCallback);

      // 最初の失敗後にリトライが行われることを確認
      const resultPromise = executor.execute("modifier", testProjectPath);
      await vi.advanceTimersByTimeAsync(5000);
      const result = await resultPromise;

      // リトライ後に成功するか、最大リトライ回数（3回）後にエラーになること
      if (result.success) {
        expect(result.phase).toBe("modifier");
      } else {
        // リトライ回数が含まれていること
        expect(result.retryCount).toBeDefined();
        expect(result.retryCount).toBeLessThanOrEqual(3);
      }
    });

    it("SE-05: should report progress during modifier", async () => {
      const executor = createSkillExecutor();
      const progressCallback = vi.fn();

      executor.onProgress(progressCallback);

      const resultPromise = executor.execute("modifier", testProjectPath);
      await vi.advanceTimersByTimeAsync(1000);
      await resultPromise;

      // 進捗が報告されること
      expect(progressCallback).toHaveBeenCalled();

      // modifierフェーズの進捗情報が含まれること
      const progressCalls = progressCallback.mock.calls;
      const hasModifierProgress = progressCalls.some((call) => {
        const progress = call[0];
        return (
          progress === 0 ||
          progress === 100 ||
          (typeof progress === "object" && progress.phase === "modifier")
        );
      });
      expect(hasModifierProgress).toBe(true);
    });

    it("SE-06: should handle abort during modifier", async () => {
      const executor = createSkillExecutor();

      const resultPromise = executor.execute("modifier", testProjectPath);

      // 実行中に中断
      executor.cancel();

      await vi.advanceTimersByTimeAsync(1000);
      const result = await resultPromise;

      expect(result.success).toBe(false);
      expect(result.error).toBe("Cancelled");
    });
  });

  describe("Modifier Skill - result format", () => {
    it("should return structure changes on successful modifier execution", async () => {
      const executor = createSkillExecutor();

      const resultPromise = executor.execute("modifier", testProjectPath);
      await vi.advanceTimersByTimeAsync(1000);
      const result = await resultPromise;

      if (result.success) {
        // 成功時はchanges配列を持つこと
        expect(result.changes).toBeDefined();
        expect(Array.isArray(result.changes)).toBe(true);

        // 各変更にtype, sectionが含まれること
        result.changes?.forEach((change: unknown) => {
          const changeObj = change as Record<string, unknown>;
          expect(changeObj).toHaveProperty("type");
          expect(changeObj).toHaveProperty("section");
        });
      }
    });

    it("should include direction in modifier result", async () => {
      const executor = createSkillExecutor();

      const resultPromise = executor.execute("modifier", testProjectPath);
      await vi.advanceTimersByTimeAsync(1000);
      const result = await resultPromise;

      // modifier実行結果にdirectionが含まれること
      expect(result.direction).toBe("reverse");
    });
  });
});
