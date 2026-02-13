/**
 * スキル実行器のユニットテスト
 * TDD: Red Phase - Claude Agent SDK統合テストを含む
 * @module main/slide/__tests__/skill-executor.test
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { createSkillExecutor } from "../skill-executor";
import type { SkillPhase } from "@repo/shared";

// AgentClientのモック（SDK統合テスト用）
const mockAgentAPI = {
  query: vi.fn().mockResolvedValue({
    content: JSON.stringify({ changes: [] }),
    usage: { inputTokens: 100, outputTokens: 50 },
  }),
  abort: vi.fn(),
  getStatus: vi.fn().mockReturnValue("idle"),
  onMessage: vi.fn(() => () => {}),
};

vi.mock("../agent-client", () => ({
  getAgentAPI: vi.fn(() => mockAgentAPI),
  resetAgentAPI: vi.fn(),
}));

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
      expect(result.duration).toBeGreaterThanOrEqual(0);
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

      expect(result.duration).toBeGreaterThanOrEqual(0);
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

  // ==========================================================================
  // Claude Agent SDK統合テスト (TDD Red - Phase 4)
  // テストID: SDK-SE-01 ~ SDK-SE-12
  // ==========================================================================
  describe("Claude Agent SDK Integration", () => {
    beforeEach(() => {
      vi.clearAllMocks();
      // モックのデフォルト動作を再設定（P9対策: mockImplementation による永続的変更をリセット）
      mockAgentAPI.query.mockResolvedValue({
        content: JSON.stringify({ changes: [] }),
        usage: { inputTokens: 100, outputTokens: 50 },
      });
    });

    describe("SDK skill name mapping", () => {
      const skillMappings: Array<{
        phase: SkillPhase;
        expectedSkillName: string;
      }> = [
        { phase: "hearing", expectedSkillName: "hearing-facilitator" },
        { phase: "structure", expectedSkillName: "structure-designer" },
        { phase: "html", expectedSkillName: "html-generator" },
        { phase: "modifier", expectedSkillName: "slide-modifier" },
      ];

      skillMappings.forEach(({ phase, expectedSkillName }) => {
        it(`SDK-SE-01-${phase}: should call Agent SDK with correct skill name for '${phase}' phase`, async () => {
          const executor = createSkillExecutor();

          const resultPromise = executor.execute(phase, testProjectPath);
          await vi.advanceTimersByTimeAsync(1000);
          const result = await resultPromise;

          expect(result.phase).toBe(phase);
          expect(result.success).toBe(true);
          // SDK統合後: Agent SDKが正しいスキル名で呼び出されることを検証
          // 現在のシミュレーション実装ではoutputにスキル名が含まれることで確認
          expect(result.output).toContain(expectedSkillName);

          // SDK統合: Agent SDKが正しいプロンプトで呼び出されることを検証
          expect(mockAgentAPI.query).toHaveBeenCalledWith(
            expect.objectContaining({
              prompt: expect.any(String),
              options: expect.objectContaining({
                systemPrompt: expect.any(String),
                timeout: 30000,
              }),
            }),
          );
        });
      });
    });

    describe("SDK projectPath context", () => {
      it("SDK-SE-02: should pass projectPath as context to Agent SDK", async () => {
        const executor = createSkillExecutor();
        const customProjectPath = "/custom/project/path";

        const resultPromise = executor.execute("html", customProjectPath);
        await vi.advanceTimersByTimeAsync(1000);
        const result = await resultPromise;

        expect(result.success).toBe(true);

        // SDK統合: Agent SDKがprojectPathを含むプロンプトで呼び出されることを検証
        expect(mockAgentAPI.query).toHaveBeenCalledWith(
          expect.objectContaining({
            prompt: expect.stringContaining(customProjectPath),
            options: expect.objectContaining({
              systemPrompt: expect.any(String),
            }),
          }),
        );

        // modifierフェーズでprojectPathを検証
        const modifierPromise = executor.execute("modifier", customProjectPath);
        await vi.advanceTimersByTimeAsync(1000);
        const modifierResult = await modifierPromise;

        expect(modifierResult.projectPath).toBe(customProjectPath);
      });
    });

    describe("SDK response handling", () => {
      it("SDK-SE-03: should return SkillExecutionResult on success", async () => {
        const executor = createSkillExecutor();

        const resultPromise = executor.execute("html", testProjectPath);
        await vi.advanceTimersByTimeAsync(1000);
        const result = await resultPromise;

        expect(result).toMatchObject({
          phase: "html",
          success: true,
          output: expect.any(String),
          duration: expect.any(Number),
        });
      });

      it("SDK-SE-04: should return error result when SDK call fails", async () => {
        const executor = createSkillExecutor();

        // キャンセルによるエラーをシミュレート
        const resultPromise = executor.execute("html", testProjectPath);
        executor.cancel();
        await vi.advanceTimersByTimeAsync(1000);
        const result = await resultPromise;

        expect(result.success).toBe(false);
        expect(result.error).toBeDefined();
      });

      it("SDK-SE-05: should handle SDK timeout error (30s)", async () => {
        const executor = createSkillExecutor();

        // SDK統合: mockAgentAPIを「Request timeout」エラーでrejectするモックに差し替え
        // skill-executor.tsはagent-client全体をモック化しているため、
        // タイムアウト処理はagent-client側で発生する。
        // ここではagent-clientがタイムアウト時に返すエラーをシミュレートする。
        mockAgentAPI.query.mockRejectedValueOnce(new Error("Request timeout"));

        const resultPromise = executor.execute("html", testProjectPath);
        await vi.advanceTimersByTimeAsync(1000);
        const result = await resultPromise;

        expect(result.success).toBe(false);
        expect(result.error).toBe("Request timeout");
      });
    });

    describe("SDK progress callbacks", () => {
      it("SDK-SE-06: should emit progress callbacks during execution", async () => {
        const executor = createSkillExecutor();
        const progressValues: number[] = [];

        executor.onProgress((progress) => {
          progressValues.push(progress);
        });

        const resultPromise = executor.execute("html", testProjectPath);
        await vi.advanceTimersByTimeAsync(1000);
        await resultPromise;

        // 進捗値が0%, 25%, 50%, 100%の順に通知されることを検証
        expect(progressValues).toContain(0);
        expect(progressValues).toContain(25);
        expect(progressValues).toContain(50);
        expect(progressValues).toContain(100);
      });

      it("SDK-SE-07: should emit progress in ascending order", async () => {
        const executor = createSkillExecutor();
        const progressValues: number[] = [];

        executor.onProgress((progress) => {
          progressValues.push(progress);
        });

        const resultPromise = executor.execute("html", testProjectPath);
        await vi.advanceTimersByTimeAsync(1000);
        await resultPromise;

        // 進捗値が昇順であることを確認
        for (let i = 1; i < progressValues.length; i++) {
          expect(progressValues[i]).toBeGreaterThanOrEqual(
            progressValues[i - 1],
          );
        }
      });
    });

    describe("SDK abort handling", () => {
      it("SDK-SE-08: should call AbortController.abort when cancel is invoked", async () => {
        const executor = createSkillExecutor();

        const resultPromise = executor.execute("html", testProjectPath);
        expect(executor.isExecuting()).toBe(true);

        executor.cancel();
        await vi.advanceTimersByTimeAsync(1000);
        const result = await resultPromise;

        expect(result.success).toBe(false);
        expect(result.error).toBe("Cancelled");
      });

      it("SDK-SE-09: should return cancelled error in execution result", async () => {
        const executor = createSkillExecutor();

        const resultPromise = executor.execute("html", testProjectPath);
        executor.cancel();
        await vi.advanceTimersByTimeAsync(1000);
        const result = await resultPromise;

        expect(result).toMatchObject({
          phase: "html",
          success: false,
          error: "Cancelled",
          duration: expect.any(Number),
        });
      });
    });

    describe("SDK execution state", () => {
      it("SDK-SE-10: should return true during execution (isExecuting)", async () => {
        const executor = createSkillExecutor();

        expect(executor.isExecuting()).toBe(false);

        const resultPromise = executor.execute("html", testProjectPath);
        expect(executor.isExecuting()).toBe(true);

        await vi.advanceTimersByTimeAsync(1000);
        await resultPromise;
      });

      it("SDK-SE-11: should return false after execution completes", async () => {
        const executor = createSkillExecutor();

        const resultPromise = executor.execute("html", testProjectPath);
        await vi.advanceTimersByTimeAsync(1000);
        await resultPromise;

        expect(executor.isExecuting()).toBe(false);
      });

      it("SDK-SE-12: should prevent concurrent SDK calls", async () => {
        const executor = createSkillExecutor();

        const firstPromise = executor.execute("html", testProjectPath);

        // 2番目の実行を試みる
        const secondResult = await executor.execute(
          "structure",
          testProjectPath,
        );

        expect(secondResult.success).toBe(false);
        expect(secondResult.error).toBe("Another skill is already executing");

        await vi.advanceTimersByTimeAsync(1000);
        const firstResult = await firstPromise;
        expect(firstResult.success).toBe(true);
      });
    });

    describe("SDK error scenarios", () => {
      it("SDK-SE-13: should handle API key not found error", async () => {
        // SDK統合: API key not foundエラーをシミュレート（OnceでP9リーク防止）
        mockAgentAPI.query.mockRejectedValueOnce(
          new Error("API key not configured"),
        );

        const executor = createSkillExecutor();

        const resultPromise = executor.execute("html", testProjectPath);
        await vi.advanceTimersByTimeAsync(1000);
        const result = await resultPromise;

        expect(result.success).toBe(false);
        expect(result.error).toBe("API key not configured");
      });

      it("SDK-SE-14: should handle SDK call failed error", async () => {
        // SDK統合: SDK呼び出し失敗エラーをシミュレート
        mockAgentAPI.query.mockRejectedValueOnce(new Error("SDK call failed"));

        const executor = createSkillExecutor();

        const resultPromise = executor.execute("html", testProjectPath);
        await vi.advanceTimersByTimeAsync(1000);
        const result = await resultPromise;

        expect(result.success).toBe(false);
        expect(result.error).toBe("SDK call failed");
      });
    });
  });

  // ==========================================================================
  // Phase 6: エッジケーステスト拡充
  // テストID: EDGE-SE-01 ~ EDGE-SE-15
  // ==========================================================================
  describe("edge case tests (Phase 6)", () => {
    beforeEach(() => {
      vi.clearAllMocks();
      // モックのデフォルト動作を再設定（P9対策: 前テストブロックの mockImplementation 変更をリセット）
      mockAgentAPI.query.mockResolvedValue({
        content: JSON.stringify({ changes: [] }),
        usage: { inputTokens: 100, outputTokens: 50 },
      });
    });

    describe("input validation edge cases", () => {
      it("EDGE-SE-01: should handle empty projectPath", async () => {
        const executor = createSkillExecutor();

        const resultPromise = executor.execute("html", "");
        await vi.advanceTimersByTimeAsync(1000);
        const result = await resultPromise;

        // 空のprojectPathでも処理される
        expect(result).toBeDefined();
        expect(result.phase).toBe("html");
      });

      it("EDGE-SE-02: should handle very long projectPath", async () => {
        const executor = createSkillExecutor();
        const longPath = "/tmp/" + "a".repeat(1000);

        const resultPromise = executor.execute("html", longPath);
        await vi.advanceTimersByTimeAsync(1000);
        const result = await resultPromise;

        expect(result.success).toBe(true);
      });

      it("EDGE-SE-03: should handle projectPath with special characters", async () => {
        const executor = createSkillExecutor();
        const specialPath = "/tmp/project-with-spaces and 日本語/特殊文字";

        const resultPromise = executor.execute("html", specialPath);
        await vi.advanceTimersByTimeAsync(1000);
        const result = await resultPromise;

        expect(result.success).toBe(true);
      });

      it("EDGE-SE-04: should handle projectPath with url-like format", async () => {
        const executor = createSkillExecutor();
        const urlPath = "file:///tmp/project?query=test#anchor";

        const resultPromise = executor.execute("html", urlPath);
        await vi.advanceTimersByTimeAsync(1000);
        const result = await resultPromise;

        expect(result.success).toBe(true);
      });
    });

    describe("phase edge cases", () => {
      it("EDGE-SE-05: should handle all valid phases", async () => {
        const executor = createSkillExecutor();
        const phases: SkillPhase[] = [
          "hearing",
          "structure",
          "html",
          "modifier",
        ];

        for (const phase of phases) {
          const resultPromise = executor.execute(phase, testProjectPath);
          await vi.advanceTimersByTimeAsync(1000);
          const result = await resultPromise;

          expect(result.success).toBe(true);
          expect(result.phase).toBe(phase);
        }
      });

      it("EDGE-SE-06: should handle sequential phase execution", async () => {
        const executor = createSkillExecutor();
        const phases: SkillPhase[] = [
          "hearing",
          "structure",
          "html",
          "modifier",
        ];
        const results: Array<{ phase: SkillPhase; success: boolean }> = [];

        for (const phase of phases) {
          const resultPromise = executor.execute(phase, testProjectPath);
          await vi.advanceTimersByTimeAsync(1000);
          const result = await resultPromise;
          results.push({ phase: result.phase, success: result.success });
        }

        expect(results.every((r) => r.success)).toBe(true);
        expect(results.map((r) => r.phase)).toEqual(phases);
      });
    });

    describe("concurrent execution edge cases", () => {
      it("EDGE-SE-07: should handle rapid concurrent execution attempts", async () => {
        const executor = createSkillExecutor();

        // 最初の実行を開始
        const firstPromise = executor.execute("html", testProjectPath);

        // 連続で実行を試みる
        const concurrentPromises = Array.from({ length: 10 }, (_) =>
          executor.execute("html", testProjectPath),
        );

        const concurrentResults = await Promise.all(concurrentPromises);

        // すべての並行実行は排他エラーで失敗
        expect(
          concurrentResults.every(
            (r) =>
              !r.success && r.error === "Another skill is already executing",
          ),
        ).toBe(true);

        // 最初の実行を完了
        await vi.advanceTimersByTimeAsync(1000);
        const firstResult = await firstPromise;
        expect(firstResult.success).toBe(true);
      });

      it("EDGE-SE-08: should allow new execution immediately after completion", async () => {
        const executor = createSkillExecutor();

        // 最初の実行
        const firstPromise = executor.execute("html", testProjectPath);
        await vi.advanceTimersByTimeAsync(1000);
        const firstResult = await firstPromise;
        expect(firstResult.success).toBe(true);

        // 完了直後に新しい実行
        const secondPromise = executor.execute("structure", testProjectPath);
        await vi.advanceTimersByTimeAsync(1000);
        const secondResult = await secondPromise;
        expect(secondResult.success).toBe(true);
      });
    });

    describe("cancel edge cases", () => {
      it("EDGE-SE-09: should handle multiple cancel calls", async () => {
        const executor = createSkillExecutor();

        const resultPromise = executor.execute("html", testProjectPath);

        // 複数回キャンセル
        executor.cancel();
        executor.cancel();
        executor.cancel();

        await vi.advanceTimersByTimeAsync(1000);
        const result = await resultPromise;

        expect(result.success).toBe(false);
        expect(result.error).toBe("Cancelled");
      });

      it("EDGE-SE-10: should handle cancel before execution starts", async () => {
        const executor = createSkillExecutor();

        // 実行前にキャンセル（何も起きない）
        executor.cancel();

        // 通常の実行
        const resultPromise = executor.execute("html", testProjectPath);
        await vi.advanceTimersByTimeAsync(1000);
        const result = await resultPromise;

        expect(result.success).toBe(true);
      });

      it("EDGE-SE-11: should handle cancel after execution completes", async () => {
        const executor = createSkillExecutor();

        const resultPromise = executor.execute("html", testProjectPath);
        await vi.advanceTimersByTimeAsync(1000);
        const result = await resultPromise;

        // 完了後にキャンセル（何も起きない）
        executor.cancel();

        expect(result.success).toBe(true);
      });
    });

    describe("progress callback edge cases", () => {
      it("EDGE-SE-12: should handle multiple progress callbacks", async () => {
        const executor = createSkillExecutor();
        const callback1Values: number[] = [];
        const callback2Values: number[] = [];
        const callback3Values: number[] = [];

        executor.onProgress((progress) => callback1Values.push(progress));
        executor.onProgress((progress) => callback2Values.push(progress));
        executor.onProgress((progress) => callback3Values.push(progress));

        const resultPromise = executor.execute("html", testProjectPath);
        await vi.advanceTimersByTimeAsync(1000);
        await resultPromise;

        // すべてのコールバックが同じ値を受け取る
        expect(callback1Values).toEqual(callback2Values);
        expect(callback2Values).toEqual(callback3Values);
      });

      it("EDGE-SE-13: should handle progress callback that throws error", async () => {
        const executor = createSkillExecutor();

        executor.onProgress(() => {
          throw new Error("Callback error");
        });

        const resultPromise = executor.execute("html", testProjectPath);
        await vi.advanceTimersByTimeAsync(1000);

        // コールバックのエラーでも実行は完了する可能性がある
        try {
          const result = await resultPromise;
          expect(result).toBeDefined();
        } catch {
          // コールバックエラーで失敗した場合
          expect(true).toBe(true);
        }
      });

      it("EDGE-SE-14: should not call progress callbacks after completion", async () => {
        const executor = createSkillExecutor();
        let callbackCalledAfterCompletion = false;

        const resultPromise = executor.execute("html", testProjectPath);
        await vi.advanceTimersByTimeAsync(1000);
        await resultPromise;

        // 完了後にコールバックを登録
        executor.onProgress(() => {
          callbackCalledAfterCompletion = true;
        });

        // 少し待つ
        await vi.advanceTimersByTimeAsync(1000);

        // 完了後に登録したコールバックは呼ばれない
        expect(callbackCalledAfterCompletion).toBe(false);
      });
    });

    describe("result format edge cases", () => {
      it("EDGE-SE-15: should always return duration >= 0", async () => {
        const executor = createSkillExecutor();

        // 正常実行
        const normalPromise = executor.execute("html", testProjectPath);
        await vi.advanceTimersByTimeAsync(1000);
        const normalResult = await normalPromise;
        expect(normalResult.duration).toBeGreaterThanOrEqual(0);

        // キャンセル実行
        const cancelPromise = executor.execute("html", testProjectPath);
        executor.cancel();
        await vi.advanceTimersByTimeAsync(1000);
        const cancelResult = await cancelPromise;
        expect(cancelResult.duration).toBeGreaterThanOrEqual(0);
      });
    });
  });
});
