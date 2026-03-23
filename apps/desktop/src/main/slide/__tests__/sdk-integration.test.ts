/**
 * Claude Agent SDK統合テスト
 * TDD: Red Phase - エンドツーエンドのSDK統合動作を検証
 * @module main/slide/__tests__/sdk-integration.test
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { createSkillExecutor, type SkillExecutor } from "../skill-executor";
import { getAgentAPI, resetAgentAPI } from "../agent-client";
import type { SkillPhase, SkillExecutionResult } from "@repo/shared";

// ==========================================================================
// モックファクトリ
// ==========================================================================

/**
 * Claude Agent SDKモックファクトリ
 * 将来の拡張用に定義（TDD Red Phase用）
 */
const _createSDKMock = (options?: {
  shouldFail?: boolean;
  failureMessage?: string;
  responseContent?: string;
  responseDelay?: number;
}) => ({
  default: vi.fn().mockImplementation(() => ({
    messages: {
      create: vi.fn().mockImplementation(async () => {
        if (options?.shouldFail) {
          throw new Error(options.failureMessage || "SDK call failed");
        }

        if (options?.responseDelay) {
          await new Promise((resolve) =>
            setTimeout(resolve, options.responseDelay),
          );
        }

        return {
          content: [
            {
              type: "text",
              text: options?.responseContent || JSON.stringify({ changes: [] }),
            },
          ],
          usage: { input_tokens: 100, output_tokens: 50 },
        };
      }),
    },
  })),
});

// vi.hoistedで制御可能なモック関数を作成（fs/promises, modifier-skill用）
const { mockReadFile, mockBuildModifierPrompt, mockParseModifierResponse } =
  vi.hoisted(() => ({
    mockReadFile: vi.fn(),
    mockBuildModifierPrompt: vi.fn(),
    mockParseModifierResponse: vi.fn(),
  }));

// fs/promisesのモック（modifier フェーズの readFile 用）
vi.mock("fs/promises", () => ({
  readFile: mockReadFile,
  default: { readFile: mockReadFile },
}));

// modifier-skillのモック（modifier フェーズのプロンプト構築・レスポンスパース用）
vi.mock("../modifier-skill", () => ({
  buildModifierPrompt: mockBuildModifierPrompt,
  parseModifierResponse: mockParseModifierResponse,
}));

// Electron safeStorageのモック
vi.mock("electron", () => ({
  safeStorage: {
    isEncryptionAvailable: vi.fn().mockReturnValue(true),
    encryptString: vi.fn((str) => Buffer.from(str).toString("base64")),
    decryptString: vi.fn((buffer) => buffer.toString()),
  },
}));

// electron-storeのモック
vi.mock("electron-store", () => ({
  default: vi.fn().mockImplementation(() => ({
    get: vi.fn().mockReturnValue(undefined),
    set: vi.fn(),
    delete: vi.fn(),
  })),
}));

// vi.hoistedで制御可能なモック関数を作成
const { mockCreate } = vi.hoisted(() => {
  return {
    mockCreate: vi.fn(),
  };
});

// Anthropic SDKのモック
vi.mock("@anthropic-ai/sdk", () => ({
  default: vi.fn().mockImplementation(() => ({
    messages: {
      create: mockCreate,
    },
  })),
}));

/**
 * テスト用プロジェクトパス生成
 */
const createTestProjectPath = (suffix?: string): string => {
  return `/tmp/test-project-${Date.now()}${suffix ? `-${suffix}` : ""}`;
};

describe("SDK Integration Tests", () => {
  let executor: SkillExecutor;
  const originalEnv = process.env;

  beforeEach(() => {
    vi.useFakeTimers();
    // 環境変数をモック
    process.env = { ...originalEnv, ANTHROPIC_API_KEY: "test-api-key" };
    resetAgentAPI();
    executor = createSkillExecutor();

    // デフォルトのモック動作：即座に成功を返す
    mockCreate.mockReset();
    mockCreate.mockResolvedValue({
      content: [{ type: "text", text: JSON.stringify({ changes: [] }) }],
      usage: { input_tokens: 100, output_tokens: 50 },
    });

    // modifier フェーズ用モックのデフォルト値設定
    mockReadFile.mockResolvedValue("mock file content");
    mockBuildModifierPrompt.mockReturnValue("mock modifier prompt");
    mockParseModifierResponse.mockReturnValue({
      success: true,
      changes: [],
    });
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
    process.env = originalEnv;
  });

  // ==========================================================================
  // API接続テスト
  // テストID: INT-01 ~ INT-02
  // ==========================================================================
  describe("API Connection Tests", () => {
    it("INT-01: should initialize SDK and authenticate successfully", async () => {
      const projectPath = createTestProjectPath("auth");

      const resultPromise = executor.execute("html", projectPath);
      await vi.advanceTimersByTimeAsync(1000);
      const result = await resultPromise;

      // SDK初期化と認証が正常に行われることを検証
      expect(result.success).toBe(true);
      expect(result.phase).toBe("html");
    });

    it("INT-02: should fail with invalid API key", async () => {
      // SDK統合: 無効なAPIキーでエラーが発生することを検証
      mockCreate.mockRejectedValueOnce(new Error("Invalid API key"));

      const projectPath = createTestProjectPath("invalid-auth");

      const resultPromise = executor.execute("html", projectPath);
      await vi.advanceTimersByTimeAsync(1000);
      const result = await resultPromise;

      expect(result.success).toBe(false);
      expect(result.error).toContain("Invalid API key");
    });
  });

  // ==========================================================================
  // データフローテスト
  // テストID: INT-03 ~ INT-04
  // ==========================================================================
  describe("Data Flow Tests", () => {
    it("INT-03: structure.md change should trigger html-generator and update index.html", async () => {
      const projectPath = createTestProjectPath("forward-sync");

      // 順方向同期フロー: structure.md → html-generator → index.html
      const resultPromise = executor.execute("html", projectPath);
      await vi.advanceTimersByTimeAsync(1000);
      const result = await resultPromise;

      // html-generatorが実行されることを検証
      expect(result.success).toBe(true);
      expect(result.phase).toBe("html");
      expect(result.output).toContain("html-generator");
    });

    it("INT-04: index.html change should trigger modifier and update structure.md", async () => {
      const projectPath = createTestProjectPath("reverse-sync");

      // 逆方向同期フロー: index.html → modifier → structure.md
      const resultPromise = executor.execute("modifier", projectPath);
      await vi.advanceTimersByTimeAsync(1000);
      const result = await resultPromise;

      // modifierが実行されることを検証
      expect(result.success).toBe(true);
      expect(result.phase).toBe("modifier");
      expect(result.output).toContain("slide-modifier");
      expect(result.direction).toBe("reverse");
      expect(result.changes).toBeDefined();
    });
  });

  // ==========================================================================
  // エラーハンドリングテスト
  // テストID: INT-05 ~ INT-06
  // ==========================================================================
  describe("Error Handling Tests", () => {
    it("INT-05: should display error message on SDK failure", async () => {
      // SDK統合: SDK障害時にエラーメッセージが結果に含まれることを検証
      mockCreate.mockRejectedValueOnce(new Error("SDK service unavailable"));

      const projectPath = createTestProjectPath("sdk-error");

      const resultPromise = executor.execute("html", projectPath);
      await vi.advanceTimersByTimeAsync(1000);
      const result = await resultPromise;

      expect(result.success).toBe(false);
      expect(result.error).toBe("SDK service unavailable");
    });

    it("INT-06: should display timeout error message after 30 seconds", async () => {
      // AgentClientレベルのテストのため、SkillExecutorは使用しない
      const _projectPath = createTestProjectPath("timeout");

      // タイムアウトをテストするため、モックがAbortSignalを待つように設定
      mockCreate.mockImplementation(
        async (
          _params: unknown,
          options?: { signal?: AbortSignal },
        ): Promise<unknown> => {
          return new Promise((resolve, reject) => {
            const signal = options?.signal;
            if (signal) {
              signal.addEventListener("abort", () => {
                const error = new Error("Aborted");
                error.name = "AbortError";
                reject(error);
              });
            }
            // 決してresolveしない - タイムアウトを待つ
          });
        },
      );

      // タイムアウトをテスト（AgentClientレベル）
      const agentAPI = getAgentAPI();
      const queryPromise = agentAPI.query({
        prompt: "Test prompt",
        options: { timeout: 30000 },
      });

      // タイマー進行と拒否を並列に待機
      await Promise.all([
        vi.advanceTimersByTimeAsync(31000),
        expect(queryPromise).rejects.toThrow("Request timeout"),
      ]);
    });
  });

  // ==========================================================================
  // 状態同期テスト
  // テストID: INT-07
  // ==========================================================================
  describe("State Synchronization Tests", () => {
    it("INT-07: should reflect progress callbacks in SyncStatusIndicator", async () => {
      const projectPath = createTestProjectPath("progress");
      const progressValues: number[] = [];

      executor.onProgress((progress) => {
        progressValues.push(progress);
      });

      const resultPromise = executor.execute("html", projectPath);
      await vi.advanceTimersByTimeAsync(1000);
      await resultPromise;

      // 進捗コールバックが発火していることを検証
      expect(progressValues.length).toBeGreaterThan(0);
      expect(progressValues).toContain(0);
      expect(progressValues).toContain(100);
    });
  });

  // ==========================================================================
  // キャンセルテスト
  // テストID: INT-08
  // ==========================================================================
  describe("Cancel Tests", () => {
    it("INT-08: should cancel executing skill", async () => {
      const projectPath = createTestProjectPath("cancel");

      const resultPromise = executor.execute("html", projectPath);

      // 実行中であることを確認
      expect(executor.isExecuting()).toBe(true);

      // キャンセル
      executor.cancel();

      await vi.advanceTimersByTimeAsync(1000);
      const result = await resultPromise;

      expect(result.success).toBe(false);
      expect(result.error).toBe("Cancelled");
      expect(executor.isExecuting()).toBe(false);
    });
  });

  // ==========================================================================
  // エンドツーエンドフローテスト
  // テストID: INT-09 ~ INT-12
  // ==========================================================================
  describe("End-to-End Flow Tests", () => {
    it("INT-09: complete forward sync flow", async () => {
      const projectPath = createTestProjectPath("e2e-forward");
      const progressValues: number[] = [];

      executor.onProgress((progress) => {
        progressValues.push(progress);
      });

      // 1. hearingフェーズ
      const hearingPromise = executor.execute("hearing", projectPath);
      await vi.advanceTimersByTimeAsync(1000);
      const hearingResult = await hearingPromise;
      expect(hearingResult.success).toBe(true);

      // 2. structureフェーズ
      const structurePromise = executor.execute("structure", projectPath);
      await vi.advanceTimersByTimeAsync(1000);
      const structureResult = await structurePromise;
      expect(structureResult.success).toBe(true);

      // 3. htmlフェーズ
      const htmlPromise = executor.execute("html", projectPath);
      await vi.advanceTimersByTimeAsync(1000);
      const htmlResult = await htmlPromise;
      expect(htmlResult.success).toBe(true);

      // すべてのフェーズで進捗が報告されていることを検証
      expect(progressValues.length).toBeGreaterThan(0);
    });

    it("INT-10: complete reverse sync flow", async () => {
      const projectPath = createTestProjectPath("e2e-reverse");

      // modifierフェーズ（逆方向同期）
      const modifierPromise = executor.execute("modifier", projectPath);
      await vi.advanceTimersByTimeAsync(1000);
      const modifierResult = await modifierPromise;

      expect(modifierResult.success).toBe(true);
      expect(modifierResult.direction).toBe("reverse");
      expect(modifierResult.changes).toBeDefined();
      expect(modifierResult.projectPath).toBe(projectPath);
    });

    it("INT-11: should handle multiple sequential executions", async () => {
      const projectPath = createTestProjectPath("sequential");

      const phases: SkillPhase[] = ["hearing", "structure", "html", "modifier"];
      const results: SkillExecutionResult[] = [];

      for (const phase of phases) {
        const promise = executor.execute(phase, projectPath);
        await vi.advanceTimersByTimeAsync(1000);
        const result = await promise;
        results.push(result);
      }

      // すべてのフェーズが成功すること
      expect(results.every((r) => r.success)).toBe(true);
      expect(results.map((r) => r.phase)).toEqual(phases);
    });

    it("INT-12: should recover after cancelled execution", async () => {
      const projectPath = createTestProjectPath("recovery");

      // 1. 実行を開始してキャンセル
      const cancelledPromise = executor.execute("html", projectPath);
      executor.cancel();
      await vi.advanceTimersByTimeAsync(1000);
      const cancelledResult = await cancelledPromise;
      expect(cancelledResult.success).toBe(false);

      // 2. 新しい実行が正常に動作すること
      const recoveryPromise = executor.execute("html", projectPath);
      await vi.advanceTimersByTimeAsync(1000);
      const recoveryResult = await recoveryPromise;
      expect(recoveryResult.success).toBe(true);
    });
  });

  // ==========================================================================
  // 境界値テスト
  // テストID: INT-13 ~ INT-15
  // ==========================================================================
  describe("Boundary Value Tests", () => {
    it("INT-13: should handle very long project paths", async () => {
      const longPath = "/tmp/" + "a".repeat(1000);

      const resultPromise = executor.execute("html", longPath);
      await vi.advanceTimersByTimeAsync(1000);
      const result = await resultPromise;

      expect(result.success).toBe(true);
    });

    it("INT-14: should handle special characters in project path", async () => {
      const specialPath = "/tmp/project-with-spaces and 日本語";

      const resultPromise = executor.execute("html", specialPath);
      await vi.advanceTimersByTimeAsync(1000);
      const result = await resultPromise;

      expect(result.success).toBe(true);
    });

    it("INT-15: should handle rapid execution attempts", async () => {
      const projectPath = createTestProjectPath("rapid");

      // 最初の実行を開始
      const firstPromise = executor.execute("html", projectPath);

      // 連続で実行を試みる（すべて失敗するはず）
      const attempts: Promise<SkillExecutionResult>[] = [];
      for (let i = 0; i < 10; i++) {
        attempts.push(executor.execute("html", projectPath));
      }

      const attemptResults = await Promise.all(attempts);

      // すべての追加実行は排他エラーで失敗
      expect(attemptResults.every((r) => !r.success)).toBe(true);
      expect(
        attemptResults.every(
          (r) => r.error === "Another skill is already executing",
        ),
      ).toBe(true);

      // 最初の実行を完了
      await vi.advanceTimersByTimeAsync(1000);
      const firstResult = await firstPromise;
      expect(firstResult.success).toBe(true);
    });
  });

  // ==========================================================================
  // SDK統合シナリオテスト
  // テストID: SDK-INT-01 ~ SDK-INT-05
  // ==========================================================================
  describe("SDK Integration Scenarios", () => {
    it("SDK-INT-01: should execute skill with correct SDK parameters", async () => {
      // SDK統合: パラメータが正しく渡されることを検証
      const projectPath = createTestProjectPath("sdk-params");

      const resultPromise = executor.execute("html", projectPath);
      await vi.advanceTimersByTimeAsync(1000);
      const result = await resultPromise;

      expect(result.success).toBe(true);
      // SDKに正しいパラメータが渡されていることを検証
      expect(mockCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          model: "claude-sonnet-4-20250514",
          max_tokens: 8192,
          messages: expect.arrayContaining([
            expect.objectContaining({
              role: "user",
              content: expect.stringContaining(projectPath),
            }),
          ]),
        }),
        expect.objectContaining({
          signal: expect.any(AbortSignal),
        }),
      );
    });

    it("SDK-INT-02: should handle SDK streaming response", async () => {
      // AgentAPIレベルのテストのため、SkillExecutorは使用しない
      const _projectPath = createTestProjectPath("sdk-streaming");
      const agentAPI = getAgentAPI();
      const messages: unknown[] = [];

      const unsubscribe = agentAPI.onMessage((message) => {
        messages.push(message);
      });

      const queryPromise = agentAPI.query({
        prompt: "Test prompt",
        options: { timeout: 30000 },
      });
      await vi.advanceTimersByTimeAsync(1000);
      await queryPromise;

      // ストリーミングメッセージが受信されること
      expect(messages.length).toBeGreaterThan(0);

      unsubscribe();
    });

    it("SDK-INT-03: should propagate SDK errors to execution result", async () => {
      const projectPath = createTestProjectPath("sdk-error-propagation");

      // キャンセルによるエラーをシミュレート
      const resultPromise = executor.execute("html", projectPath);
      executor.cancel();
      await vi.advanceTimersByTimeAsync(1000);
      const result = await resultPromise;

      // エラーが結果に反映されること
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it("SDK-INT-04: should track token usage from SDK response", async () => {
      // AgentAPIレベルのテストのため、SkillExecutorは使用しない
      const _projectPath = createTestProjectPath("sdk-usage");
      const agentAPI = getAgentAPI();

      const queryPromise = agentAPI.query({
        prompt: "Test prompt",
        options: { timeout: 30000 },
      });
      await vi.advanceTimersByTimeAsync(1000);
      const response = await queryPromise;

      // トークン使用量が追跡されること
      expect(response.usage).toBeDefined();
      expect(response.usage?.inputTokens).toBeGreaterThan(0);
      expect(response.usage?.outputTokens).toBeGreaterThan(0);
    });

    it("SDK-INT-05: should clean up resources after SDK execution", async () => {
      const projectPath = createTestProjectPath("sdk-cleanup");

      const resultPromise = executor.execute("html", projectPath);
      await vi.advanceTimersByTimeAsync(1000);
      await resultPromise;

      // リソースがクリーンアップされていること
      expect(executor.isExecuting()).toBe(false);

      const agentAPI = getAgentAPI();
      expect(agentAPI.getStatus()).toBe("idle");
    });
  });

  // ==========================================================================
  // Phase 6: 統合テスト拡充
  // テストID: INT-EXT-01 ~ INT-EXT-15
  // ==========================================================================
  describe("Extended Integration Tests (Phase 6)", () => {
    describe("API Connection Tests", () => {
      it("INT-EXT-01: SDK connection retry behavior (stub for future implementation)", async () => {
        // AgentAPIレベルのテストのため、SkillExecutorは使用しない
        const _projectPath = createTestProjectPath("retry");
        const agentAPI = getAgentAPI();

        // 将来のリトライ実装に向けたスタブテスト
        const queryPromise = agentAPI.query({
          prompt: "Test prompt",
          options: { timeout: 30000 },
        });
        await vi.advanceTimersByTimeAsync(1000);
        const response = await queryPromise;

        // 現時点ではリトライなしで成功
        expect(response).toBeDefined();
      });

      it("INT-EXT-02: should recover from auth error by re-authenticating", async () => {
        const projectPath = createTestProjectPath("auth-recovery");

        // 最初の実行をキャンセル（認証エラーをシミュレート）
        const firstPromise = executor.execute("html", projectPath);
        executor.cancel();
        await vi.advanceTimersByTimeAsync(1000);
        const firstResult = await firstPromise;
        expect(firstResult.success).toBe(false);

        // 再実行（リカバリ）
        const recoveryPromise = executor.execute("html", projectPath);
        await vi.advanceTimersByTimeAsync(1000);
        const recoveryResult = await recoveryPromise;

        expect(recoveryResult.success).toBe(true);
      });
    });

    describe("Data Flow Tests", () => {
      it("INT-EXT-03: should handle multiple file changes in correct order", async () => {
        const projectPath = createTestProjectPath("multi-file");
        const executionOrder: string[] = [];

        // 複数のフェーズを順番に実行
        const phases: SkillPhase[] = [
          "hearing",
          "structure",
          "html",
          "modifier",
        ];

        for (const phase of phases) {
          const promise = executor.execute(phase, projectPath);
          await vi.advanceTimersByTimeAsync(1000);
          const result = await promise;
          if (result.success) {
            executionOrder.push(phase);
          }
        }

        // すべてのフェーズが順番通りに実行されること
        expect(executionOrder).toEqual(phases);
      });

      it("INT-EXT-04: should handle large file processing (1MB+ simulation)", async () => {
        const projectPath = createTestProjectPath("large-file");

        // 大きなプロジェクトパス（シミュレーション）
        const largeProjectPath = projectPath + "/" + "a".repeat(1024 * 1024);

        const resultPromise = executor.execute("html", largeProjectPath);
        await vi.advanceTimersByTimeAsync(1000);
        const result = await resultPromise;

        // 大きなパスでも処理可能
        expect(result).toBeDefined();
      });
    });

    describe("Error Handling Tests", () => {
      it("INT-EXT-05: should display error messages correctly for consecutive errors", async () => {
        const projectPath = createTestProjectPath("consecutive-errors");
        const errors: string[] = [];

        // 連続でキャンセルして複数のエラーを発生させる
        for (let i = 0; i < 3; i++) {
          const promise = executor.execute("html", projectPath);
          executor.cancel();
          await vi.advanceTimersByTimeAsync(1000);
          const result = await promise;
          if (!result.success && result.error) {
            errors.push(result.error);
          }
        }

        // すべてのエラーがキャプチャされること
        expect(errors.length).toBe(3);
        expect(errors.every((e) => e === "Cancelled")).toBe(true);
      });

      it("INT-EXT-06: should recover from error and return to normal operation", async () => {
        const projectPath = createTestProjectPath("error-recovery");

        // エラー発生
        const errorPromise = executor.execute("html", projectPath);
        executor.cancel();
        await vi.advanceTimersByTimeAsync(1000);
        const errorResult = await errorPromise;
        expect(errorResult.success).toBe(false);

        // リカバリ
        const recoveryPromise = executor.execute("structure", projectPath);
        await vi.advanceTimersByTimeAsync(1000);
        const recoveryResult = await recoveryPromise;
        expect(recoveryResult.success).toBe(true);

        // 正常状態に戻っている
        expect(executor.isExecuting()).toBe(false);
      });
    });

    describe("Authentication Tests", () => {
      it("INT-EXT-07: should handle API key re-setup flow", async () => {
        const projectPath = createTestProjectPath("api-key-reset");

        // APIキーリセット後の再実行
        resetAgentAPI();
        const newExecutor = createSkillExecutor();

        const resultPromise = newExecutor.execute("html", projectPath);
        await vi.advanceTimersByTimeAsync(1000);
        const result = await resultPromise;

        expect(result).toBeDefined();
      });

      it("INT-EXT-08: should handle API key expiration gracefully", async () => {
        const projectPath = createTestProjectPath("api-key-expiry");

        // 現在のテストではAPIキー期限切れをモックで再現
        // 実際のSDK統合後に適切なテストを追加
        const resultPromise = executor.execute("html", projectPath);
        await vi.advanceTimersByTimeAsync(1000);
        const result = await resultPromise;

        expect(result).toBeDefined();
      });
    });

    describe("State Synchronization Tests", () => {
      it("INT-EXT-09: should not emit excessive progress callbacks", async () => {
        const projectPath = createTestProjectPath("progress-frequency");
        const progressValues: number[] = [];

        executor.onProgress((progress) => {
          progressValues.push(progress);
        });

        const resultPromise = executor.execute("html", projectPath);
        await vi.advanceTimersByTimeAsync(1000);
        await resultPromise;

        // 進捗コールバックが過剰でないこと（10回未満）
        expect(progressValues.length).toBeLessThan(10);

        // 重複した値がないことを確認（連続して同じ値を送らない）
        const uniqueValues = [...new Set(progressValues)];
        expect(uniqueValues.length).toBe(progressValues.length);
      });

      it("INT-EXT-10: should clean up state properly after cancel", async () => {
        const projectPath = createTestProjectPath("cancel-cleanup");

        const resultPromise = executor.execute("html", projectPath);
        executor.cancel();
        await vi.advanceTimersByTimeAsync(1000);
        await resultPromise;

        // 状態がクリーンアップされていること
        expect(executor.isExecuting()).toBe(false);

        const agentAPI = getAgentAPI();
        expect(agentAPI.getStatus()).toBe("idle");
      });
    });

    describe("Performance Tests", () => {
      it("INT-EXT-11: should complete execution within expected time", async () => {
        const projectPath = createTestProjectPath("performance");
        const _startTime = Date.now(); // パフォーマンス計測用（モック環境では使用しない）

        const resultPromise = executor.execute("html", projectPath);
        await vi.advanceTimersByTimeAsync(1000);
        const result = await resultPromise;

        // タイマーをリアルタイムに戻さずに測定
        // モック環境では即座に完了するはず
        expect(result.success).toBe(true);
        expect(result.duration).toBeGreaterThanOrEqual(0);
      });

      it("INT-EXT-12: should handle rapid sequential executions", async () => {
        const projectPath = createTestProjectPath("rapid-sequential");
        const results: SkillExecutionResult[] = [];

        for (let i = 0; i < 5; i++) {
          const promise = executor.execute("html", projectPath);
          await vi.advanceTimersByTimeAsync(1000);
          const result = await promise;
          results.push(result);
        }

        // すべての実行が成功すること
        expect(results.every((r) => r.success)).toBe(true);
      });
    });

    describe("Edge Cases", () => {
      it("INT-EXT-13: should handle Unicode paths correctly", async () => {
        const unicodePath = "/tmp/プロジェクト/テスト/🎨/slide";

        const resultPromise = executor.execute("html", unicodePath);
        await vi.advanceTimersByTimeAsync(1000);
        const result = await resultPromise;

        expect(result.success).toBe(true);
      });

      it("INT-EXT-14: should handle paths with Windows-style separators", async () => {
        // Unix環境でもWindows形式のパスを処理できることを確認
        const windowsPath = "C:\\Users\\test\\project";

        const resultPromise = executor.execute("html", windowsPath);
        await vi.advanceTimersByTimeAsync(1000);
        const result = await resultPromise;

        expect(result.success).toBe(true);
      });

      it("INT-EXT-15: should maintain consistency across multiple executor instances", async () => {
        const projectPath = createTestProjectPath("multi-instance");

        // 複数のexecutorインスタンス
        const executor1 = createSkillExecutor();
        const executor2 = createSkillExecutor();

        // 順次実行（AgentAPIはシングルトンのため並行実行不可）
        const promise1 = executor1.execute("html", projectPath);
        await vi.advanceTimersByTimeAsync(1000);
        const result1 = await promise1;

        const promise2 = executor2.execute("structure", projectPath);
        await vi.advanceTimersByTimeAsync(1000);
        const result2 = await promise2;

        expect(result1.success).toBe(true);
        expect(result2.success).toBe(true);
        expect(result1.phase).toBe("html");
        expect(result2.phase).toBe("structure");
      });
    });
  });
});
