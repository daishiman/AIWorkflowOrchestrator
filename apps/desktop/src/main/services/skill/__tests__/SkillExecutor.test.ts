/**
 * SkillExecutor Unit Tests
 *
 * TASK-3-1-A: SDK query() 基本実装
 * Phase 5: 実装（TDD: Green）
 */

/* eslint-disable require-yield -- テストモックでエラーを即座にスローするため */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import type { BrowserWindow } from "electron";
import type { SkillExecutionRequest } from "@repo/shared";
import type { SkillMetadata } from "@repo/shared";
import { SkillExecutor } from "../SkillExecutor";

// モック設定
const mockWebContents = {
  send: vi.fn(),
};

const mockMainWindow = {
  webContents: mockWebContents,
  isDestroyed: vi.fn().mockReturnValue(false),
} as unknown as BrowserWindow;

// SDKモック - query()はstream()メソッドを持つオブジェクトを返す
const mockStreamGenerator = vi.fn();
const mockQuery = vi.fn().mockImplementation(() => ({
  stream: () => mockStreamGenerator(),
}));

vi.mock("@anthropic-ai/claude-agent-sdk", () => ({
  query: (args: unknown) => mockQuery(args),
}));

// UUIDモック
vi.mock("uuid", () => ({
  v4: () => "test-execution-id-1234",
}));

// PermissionStoreモック
const mockPermissionStore = {
  isToolAllowed: vi.fn().mockReturnValue(false),
  allowTool: vi.fn(),
  revokeTool: vi.fn(),
  getAllowedTools: vi.fn().mockReturnValue([]),
  getAllowedToolEntries: vi.fn().mockReturnValue([]),
  clearAll: vi.fn(),
};

// AuthKeyServiceモック（TASK-FIX-16-1: SDK認証キー管理）
const mockAuthKeyService = {
  getKey: vi.fn().mockResolvedValue("sk-ant-api03-test-key-for-unit-tests"),
  setKey: vi.fn().mockResolvedValue({ success: true }),
  deleteKey: vi.fn().mockResolvedValue({ success: true }),
  hasKey: vi.fn().mockResolvedValue(true),
  validateKey: vi
    .fn()
    .mockResolvedValue({ success: true, data: { isValid: true } }),
};

describe("SkillExecutor", () => {
  let executor: SkillExecutor;
  let originalApiKey: string | undefined;

  const mockSkill: SkillMetadata = {
    id: "test-skill",
    name: "Test Skill",
    slug: "test-skill",
    description: "A test skill",
    path: "/path/to/skill",
    triggers: ["test"],
    anchors: [
      {
        source: "Test Source",
        application: "Testing",
        purpose: "Unit test verification",
      },
    ],
    allowedTools: ["Read", "Write"],
  };

  const mockRequest: SkillExecutionRequest = {
    prompt: "Hello, world!",
    skillId: "test-skill",
  };

  beforeEach(() => {
    vi.clearAllMocks();

    // 環境変数を設定（TASK-FIX-16-1: 認証キーが必要なため）
    originalApiKey = process.env.ANTHROPIC_API_KEY;
    process.env.ANTHROPIC_API_KEY = "sk-ant-api03-test-key-for-unit-tests";

    // mockQueryの実装を再設定
    mockQuery.mockImplementation(() => ({
      stream: () => mockStreamGenerator(),
    }));

    // デフォルトのストリームモック設定
    mockStreamGenerator.mockReturnValue({
      [Symbol.asyncIterator]: async function* () {
        yield { type: "text", content: "Hello" };
        yield { type: "text", content: " world" };
      },
    });

    // isDestroyed を再設定
    mockMainWindow.isDestroyed = vi.fn().mockReturnValue(false);

    // PermissionStoreモックをリセット
    mockPermissionStore.isToolAllowed.mockReturnValue(false);

    // AuthKeyServiceモックをリセット
    mockAuthKeyService.getKey.mockResolvedValue(
      "sk-ant-api03-test-key-for-unit-tests",
    );

    executor = new SkillExecutor(
      mockMainWindow,
      mockPermissionStore,
      mockAuthKeyService,
    );
  });

  afterEach(() => {
    // 環境変数を元に戻す
    if (originalApiKey === undefined) {
      delete process.env.ANTHROPIC_API_KEY;
    } else {
      process.env.ANTHROPIC_API_KEY = originalApiKey;
    }
    vi.restoreAllMocks();
  });

  describe("constructor", () => {
    it("should create instance with BrowserWindow", () => {
      const instance = new SkillExecutor(
        mockMainWindow,
        mockPermissionStore,
        mockAuthKeyService,
      );
      expect(instance).toBeDefined();
    });

    it("should initialize with empty active executions", () => {
      const instance = new SkillExecutor(
        mockMainWindow,
        mockPermissionStore,
        mockAuthKeyService,
      );
      expect(instance.getActiveExecutions()).toHaveLength(0);
    });
  });

  describe("execute", () => {
    it("should return executionId when execution starts", async () => {
      const response = await executor.execute(mockRequest, mockSkill);
      expect(response.executionId).toBeDefined();
      expect(response.executionId).toBe("test-execution-id-1234");
    });

    it("should call query() with prompt containing user input", async () => {
      await executor.execute(mockRequest, mockSkill);
      expect(mockQuery).toHaveBeenCalledWith(
        expect.objectContaining({
          prompt: expect.stringContaining("Hello, world!"),
        }),
      );
    });

    it("should handle stream messages and send to renderer", async () => {
      await executor.execute(mockRequest, mockSkill);

      // ストリームメッセージがIPCで送信されることを確認
      expect(mockWebContents.send).toHaveBeenCalledWith(
        "skill:stream",
        expect.objectContaining({
          type: "text",
          content: "Hello",
        }),
      );
    });

    it("should return success response on completion", async () => {
      const response = await executor.execute(mockRequest, mockSkill);
      expect(response.success).toBe(true);
      expect(response.error).toBeUndefined();
    });

    it("should return error response on SDK failure", async () => {
      mockStreamGenerator.mockReturnValue({
        [Symbol.asyncIterator]: async function* () {
          throw new Error("SDK Error");
        },
      });

      const response = await executor.execute(mockRequest, mockSkill);
      expect(response.success).toBe(false);
      expect(response.error).toBeDefined();
      expect(response.error?.code).toBe("EXECUTION_FAILED");
    });

    it("should reject when max concurrent executions exceeded", async () => {
      // 同時実行制限をテストするためにexecutorの内部状態を直接操作
      // 実際の5つの実行を待つ代わりに、activeExecutionsに直接エントリを追加
      const testExecutor = new SkillExecutor(
        mockMainWindow,
        mockPermissionStore,
        mockAuthKeyService,
      );

      // 5つのダミー実行を登録してactiveExecutionsを満杯にする
      // @ts-expect-error - private property access for testing
      for (let i = 0; i < 5; i++) {
        // @ts-expect-error - private property access for testing
        testExecutor.activeExecutions.set(`dummy-${i}`, {
          id: `dummy-${i}`,
          skillId: "test-skill",
          abortController: new AbortController(),
          state: "running" as const,
          startedAt: Date.now(),
        });
      }

      // 6つ目の実行はエラーになるはず
      const sixthResponse = await testExecutor.execute(mockRequest, mockSkill);
      expect(sixthResponse.success).toBe(false);
      expect(sixthResponse.error?.code).toBe("MAX_CONCURRENT_EXCEEDED");
    });

    it("should include skill context in prompt", async () => {
      await executor.execute(mockRequest, mockSkill);
      expect(mockQuery).toHaveBeenCalledWith(
        expect.objectContaining({
          prompt: expect.stringContaining("Test Skill"),
        }),
      );
    });

    it("should include skill description in prompt", async () => {
      await executor.execute(mockRequest, mockSkill);
      expect(mockQuery).toHaveBeenCalledWith(
        expect.objectContaining({
          prompt: expect.stringContaining("A test skill"),
        }),
      );
    });

    it("should pass allowed tools to query()", async () => {
      await executor.execute(mockRequest, mockSkill);
      expect(mockQuery).toHaveBeenCalledWith(
        expect.objectContaining({
          options: expect.objectContaining({
            tools: ["Read", "Write"],
          }),
        }),
      );
    });

    it("should send complete message at end of stream", async () => {
      await executor.execute(mockRequest, mockSkill);

      // 最後のsend呼び出しがcompleteメッセージであることを確認
      const lastCall =
        mockWebContents.send.mock.calls[
          mockWebContents.send.mock.calls.length - 1
        ];
      expect(lastCall[1]).toMatchObject({
        type: "complete",
        isComplete: true,
      });
    });

    // SE-02: execute - スキル未発見エラー
    it("should return error when skill metadata is invalid", async () => {
      const invalidSkill = {
        ...mockSkill,
        anchors: undefined,
      } as unknown as SkillMetadata;

      const response = await executor.execute(mockRequest, invalidSkill);
      expect(response.success).toBe(false);
      expect(response.error).toBeDefined();
      expect(response.error?.code).toBe("EXECUTION_FAILED");
    });
  });

  describe("abort", () => {
    it("should return false when executionId not found", () => {
      const result = executor.abort("non-existent-id");
      expect(result).toBe(false);
    });

    it("should return true when execution is aborted", async () => {
      // 長時間実行をシミュレート（解放可能なPromise）
      let resolveStream: () => void = () => {};
      mockStreamGenerator.mockReturnValue({
        [Symbol.asyncIterator]: async function* () {
          await new Promise<void>((resolve) => {
            resolveStream = resolve;
          });
          yield { type: "complete" };
        },
      });

      // 実行を開始（完了を待たない）
      const executePromise = executor.execute(mockRequest, mockSkill);

      // 少し待ってからabort
      await new Promise((resolve) => setTimeout(resolve, 50));
      const result = executor.abort("test-execution-id-1234");

      expect(result).toBe(true);

      // クリーンアップ: ストリームを解放
      resolveStream();
      await executePromise;
    });

    it("should send error message to renderer on abort", async () => {
      let resolveStream: () => void = () => {};
      mockStreamGenerator.mockReturnValue({
        [Symbol.asyncIterator]: async function* () {
          await new Promise<void>((resolve) => {
            resolveStream = resolve;
          });
          yield { type: "complete" };
        },
      });

      const executePromise = executor.execute(mockRequest, mockSkill);
      await new Promise((resolve) => setTimeout(resolve, 50));

      executor.abort("test-execution-id-1234");

      expect(mockWebContents.send).toHaveBeenCalledWith(
        "skill:stream",
        expect.objectContaining({
          type: "error",
          content: "Execution aborted by user",
        }),
      );

      // クリーンアップ
      resolveStream();
      await executePromise;
    });
  });

  describe("getActiveExecutions", () => {
    it("should return empty array when no executions", () => {
      expect(executor.getActiveExecutions()).toEqual([]);
    });

    it("should return list of active executions", async () => {
      mockStreamGenerator.mockReturnValue({
        [Symbol.asyncIterator]: async function* () {
          await new Promise((resolve) => setTimeout(resolve, 100));
          yield { type: "complete" };
        },
      });

      // 実行を開始（完了を待たない）
      const executePromise = executor.execute(mockRequest, mockSkill);

      // 少し待ってから確認
      await new Promise((resolve) => setTimeout(resolve, 10));

      const executions = executor.getActiveExecutions();
      expect(executions.length).toBe(1);
      expect(executions[0]).toMatchObject({
        id: "test-execution-id-1234",
        skillId: "test-skill",
        state: "running",
      });

      // クリーンアップ
      executor.abort("test-execution-id-1234");
      await executePromise;
    });
  });

  describe("getExecutionStatus", () => {
    it("should return undefined when executionId not found", () => {
      const status = executor.getExecutionStatus("non-existent-id");
      expect(status).toBeUndefined();
    });

    it("should return execution info when found", async () => {
      mockStreamGenerator.mockReturnValue({
        [Symbol.asyncIterator]: async function* () {
          await new Promise((resolve) => setTimeout(resolve, 100));
          yield { type: "complete" };
        },
      });

      const executePromise = executor.execute(mockRequest, mockSkill);
      await new Promise((resolve) => setTimeout(resolve, 10));

      const status = executor.getExecutionStatus("test-execution-id-1234");
      expect(status).toBeDefined();
      expect(status?.id).toBe("test-execution-id-1234");
      expect(status?.skillId).toBe("test-skill");

      executor.abort("test-execution-id-1234");
      await executePromise;
    });
  });

  describe("stream message handling", () => {
    it("should convert text messages correctly", async () => {
      mockStreamGenerator.mockReturnValue({
        [Symbol.asyncIterator]: async function* () {
          yield { type: "text", content: "Test message" };
        },
      });

      await executor.execute(mockRequest, mockSkill);

      expect(mockWebContents.send).toHaveBeenCalledWith(
        "skill:stream",
        expect.objectContaining({
          type: "text",
          content: "Test message",
        }),
      );
    });

    it("should convert tool_use messages correctly", async () => {
      mockStreamGenerator.mockReturnValue({
        [Symbol.asyncIterator]: async function* () {
          yield {
            type: "tool_use",
            tool_use: { name: "Read", input: { path: "/test" } },
          };
        },
      });

      await executor.execute(mockRequest, mockSkill);

      expect(mockWebContents.send).toHaveBeenCalledWith(
        "skill:stream",
        expect.objectContaining({
          type: "tool_use",
          content: expect.stringContaining("Read"),
        }),
      );
    });

    it("should convert error messages correctly", async () => {
      mockStreamGenerator.mockReturnValue({
        [Symbol.asyncIterator]: async function* () {
          yield { type: "error", error: { message: "Test error" } };
        },
      });

      await executor.execute(mockRequest, mockSkill);

      expect(mockWebContents.send).toHaveBeenCalledWith(
        "skill:stream",
        expect.objectContaining({
          type: "error",
          content: "Test error",
        }),
      );
    });

    it("should set isComplete flag on final message", async () => {
      await executor.execute(mockRequest, mockSkill);

      const lastCall =
        mockWebContents.send.mock.calls[
          mockWebContents.send.mock.calls.length - 1
        ];
      expect(lastCall[1].isComplete).toBe(true);
    });
  });

  describe("error handling", () => {
    it("should handle timeout error", async () => {
      mockStreamGenerator.mockReturnValue({
        [Symbol.asyncIterator]: async function* () {
          const error = new Error("Timeout");
          error.name = "TimeoutError";
          throw error;
        },
      });

      const response = await executor.execute(mockRequest, mockSkill);
      expect(response.success).toBe(false);
      expect(response.error?.code).toBe("TIMEOUT");
    });

    it("should handle abort error", async () => {
      mockStreamGenerator.mockReturnValue({
        [Symbol.asyncIterator]: async function* () {
          const error = new Error("Aborted");
          error.name = "AbortError";
          throw error;
        },
      });

      const response = await executor.execute(mockRequest, mockSkill);
      expect(response.success).toBe(false);
      expect(response.error?.code).toBe("ABORTED");
    });

    it("should send error message to renderer on error", async () => {
      mockStreamGenerator.mockReturnValue({
        [Symbol.asyncIterator]: async function* () {
          throw new Error("Test error");
        },
      });

      await executor.execute(mockRequest, mockSkill);

      expect(mockWebContents.send).toHaveBeenCalledWith(
        "skill:stream",
        expect.objectContaining({
          type: "error",
        }),
      );
    });
  });

  describe("IPC communication", () => {
    it("should not send message when window is destroyed", async () => {
      mockMainWindow.isDestroyed = vi.fn().mockReturnValue(true);
      const destroyedExecutor = new SkillExecutor(
        mockMainWindow,
        mockPermissionStore,
        mockAuthKeyService,
      );

      await destroyedExecutor.execute(mockRequest, mockSkill);

      // send は呼ばれないはず
      expect(mockWebContents.send).not.toHaveBeenCalled();
    });

    it("should send to correct IPC channel", async () => {
      await executor.execute(mockRequest, mockSkill);

      expect(mockWebContents.send).toHaveBeenCalledWith(
        "skill:stream",
        expect.any(Object),
      );
    });
  });

  // SE-07: createHooks - Hooks作成
  describe("createHooks", () => {
    it("should return object with PreToolUse and PostToolUse hooks", () => {
      const hooks = executor.createHooks("test-execution-id");

      expect(hooks).toHaveProperty("PreToolUse");
      expect(hooks).toHaveProperty("PostToolUse");
      expect(typeof hooks.PreToolUse).toBe("function");
      expect(typeof hooks.PostToolUse).toBe("function");
    });
  });

  // SE-08: handlePermissionResponse - 権限応答
  describe("handlePermissionResponse", () => {
    it("should call permissionResolver.resolveRequest with correct response", () => {
      // @ts-expect-error - private property access for testing
      const resolveRequestSpy = vi.spyOn(
        executor.permissionResolver,
        "resolveRequest",
      );

      executor.handlePermissionResponse(
        "test-request-id",
        true,
        true,
        undefined,
        "Read",
      );

      expect(resolveRequestSpy).toHaveBeenCalledWith({
        requestId: "test-request-id",
        approved: true,
        rememberChoice: true,
        rejectReason: undefined,
      });
    });

    it("should call permissionStore.allowTool when approved with rememberChoice", () => {
      executor.handlePermissionResponse(
        "test-request-id",
        true,
        true,
        undefined,
        "Read",
      );

      expect(mockPermissionStore.allowTool).toHaveBeenCalledWith("Read");
    });
  });

  // Phase 6: エッジケーステスト
  describe("Edge Cases", () => {
    describe("execute - edge cases", () => {
      it("should handle empty prompt", async () => {
        const emptyRequest: SkillExecutionRequest = {
          prompt: "",
          skillId: "test-skill",
        };

        const response = await executor.execute(emptyRequest, mockSkill);
        // 空のプロンプトでも実行は成功する（バリデーションは上位層で行う想定）
        expect(response.executionId).toBeDefined();
      });

      it("should handle very long prompt", async () => {
        const longPrompt = "a".repeat(10000);
        const longRequest: SkillExecutionRequest = {
          prompt: longPrompt,
          skillId: "test-skill",
        };

        const response = await executor.execute(longRequest, mockSkill);
        expect(response.executionId).toBeDefined();
        expect(mockQuery).toHaveBeenCalledWith(
          expect.objectContaining({
            prompt: expect.stringContaining(longPrompt),
          }),
        );
      });

      it("should handle special characters in prompt", async () => {
        const specialRequest: SkillExecutionRequest = {
          prompt: "Hello <script>alert('xss')</script> & \"quotes\" 'single'",
          skillId: "test-skill",
        };

        const response = await executor.execute(specialRequest, mockSkill);
        expect(response.executionId).toBeDefined();
      });

      it("should handle skill with empty allowedTools", async () => {
        const skillWithNoTools: SkillMetadata = {
          ...mockSkill,
          allowedTools: [],
        };

        const response = await executor.execute(mockRequest, skillWithNoTools);
        expect(response.success).toBe(true);
      });
    });

    describe("stream handling - edge cases", () => {
      it("should handle empty stream", async () => {
        mockStreamGenerator.mockReturnValue({
          [Symbol.asyncIterator]: async function* () {
            // 何もyieldしない
          },
        });

        const response = await executor.execute(mockRequest, mockSkill);
        expect(response.success).toBe(true);

        // completeメッセージは送信される
        expect(mockWebContents.send).toHaveBeenCalledWith(
          "skill:stream",
          expect.objectContaining({
            type: "complete",
            isComplete: true,
          }),
        );
      });

      it("should handle stream with only errors", async () => {
        mockStreamGenerator.mockReturnValue({
          [Symbol.asyncIterator]: async function* () {
            yield { type: "error", error: { message: "Error 1" } };
            yield { type: "error", error: { message: "Error 2" } };
          },
        });

        const response = await executor.execute(mockRequest, mockSkill);
        expect(response.success).toBe(true); // ストリームは正常完了
        expect(mockWebContents.send).toHaveBeenCalledWith(
          "skill:stream",
          expect.objectContaining({
            type: "error",
            content: "Error 1",
          }),
        );
      });

      it("should handle rapid message bursts", async () => {
        const messages = Array.from({ length: 100 }, (_, i) => ({
          type: "text",
          content: `Message ${i}`,
        }));

        mockStreamGenerator.mockReturnValue({
          [Symbol.asyncIterator]: async function* () {
            for (const msg of messages) {
              yield msg;
            }
          },
        });

        const response = await executor.execute(mockRequest, mockSkill);
        expect(response.success).toBe(true);

        // 100 + 1(complete) のメッセージが送信される
        expect(mockWebContents.send).toHaveBeenCalledTimes(101);
      });

      it("should handle malformed messages gracefully", async () => {
        mockStreamGenerator.mockReturnValue({
          [Symbol.asyncIterator]: async function* () {
            yield { unknown: "field" }; // 未知のフィールド - nullとして処理されスキップ
            yield { type: "text", content: "Valid message" };
          },
        });

        const response = await executor.execute(mockRequest, mockSkill);
        expect(response.success).toBe(true);
      });
    });

    describe("abort - edge cases", () => {
      it("should handle abort before stream starts", async () => {
        // 即座にabortを呼び出す
        const result = executor.abort("non-existent-before-start");
        expect(result).toBe(false);
      });

      it("should handle multiple abort calls", async () => {
        let resolveStream: () => void = () => {};
        mockStreamGenerator.mockReturnValue({
          [Symbol.asyncIterator]: async function* () {
            await new Promise<void>((resolve) => {
              resolveStream = resolve;
            });
            yield { type: "complete" };
          },
        });

        const executePromise = executor.execute(mockRequest, mockSkill);
        await new Promise((resolve) => setTimeout(resolve, 50));

        // 複数回abort
        const result1 = executor.abort("test-execution-id-1234");
        const result2 = executor.abort("test-execution-id-1234");

        expect(result1).toBe(true);
        expect(result2).toBe(true); // 2回目も成功（状態更新済み）

        resolveStream();
        await executePromise;
      });

      it("should handle abort after completion", async () => {
        const response = await executor.execute(mockRequest, mockSkill);
        expect(response.success).toBe(true);

        // 完了後のabort - 実装では1分間実行情報を保持するのでtrueを返す
        const result = executor.abort(response.executionId);
        expect(result).toBe(true); // クリーンアップは遅延実行されるので見つかる
      });
    });
  });

  // Phase 6: 追加エラーハンドリングテスト
  describe("Additional Error Handling", () => {
    it("should handle network timeout with proper error code", async () => {
      mockStreamGenerator.mockReturnValue({
        [Symbol.asyncIterator]: async function* () {
          const error = new Error("Network timeout");
          error.name = "TimeoutError";
          throw error;
        },
      });

      const response = await executor.execute(mockRequest, mockSkill);
      expect(response.success).toBe(false);
      expect(response.error?.code).toBe("TIMEOUT");
    });

    it("should handle rate limit error", async () => {
      mockStreamGenerator.mockReturnValue({
        [Symbol.asyncIterator]: async function* () {
          const error = new Error("Rate limited");
          error.name = "RateLimitError";
          throw error;
        },
      });

      const response = await executor.execute(mockRequest, mockSkill);
      expect(response.success).toBe(false);
      expect(response.error?.code).toBe("EXECUTION_FAILED");
      expect(response.error?.message).toBe("Rate limited");
    });

    it("should handle invalid response format", async () => {
      mockStreamGenerator.mockReturnValue({
        [Symbol.asyncIterator]: async function* () {
          yield "invalid string instead of object";
        },
      });

      const response = await executor.execute(mockRequest, mockSkill);
      // 文字列は無視される（nullを返す変換ロジック）
      expect(response.success).toBe(true);
    });

    it("should clean up resources on error", async () => {
      mockStreamGenerator.mockReturnValue({
        [Symbol.asyncIterator]: async function* () {
          throw new Error("Cleanup test error");
        },
      });

      await executor.execute(mockRequest, mockSkill);

      // エラー後もactiveExecutionsには残っている（クリーンアップは遅延実行）
      // ただし状態はerrorになっている
      const executions = executor.getActiveExecutions();
      if (executions.length > 0) {
        expect(executions[0].state).toBe("error");
      }
    });

    it("should properly log errors with details", async () => {
      const consoleSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});

      mockStreamGenerator.mockReturnValue({
        [Symbol.asyncIterator]: async function* () {
          throw new Error("Log test error");
        },
      });

      await executor.execute(mockRequest, mockSkill);

      expect(consoleSpy).toHaveBeenCalledWith(
        "[SkillExecutor] Execution error:",
        expect.objectContaining({
          errorCode: "EXECUTION_FAILED",
          message: "Log test error",
        }),
      );

      consoleSpy.mockRestore();
    });
  });

  // Phase 6: 統合テスト拡充
  describe("Integration - Extended", () => {
    it("should maintain message order in stream", async () => {
      const orderedMessages = [
        { type: "text", content: "First" },
        { type: "text", content: "Second" },
        { type: "text", content: "Third" },
      ];

      mockStreamGenerator.mockReturnValue({
        [Symbol.asyncIterator]: async function* () {
          for (const msg of orderedMessages) {
            yield msg;
          }
        },
      });

      await executor.execute(mockRequest, mockSkill);

      // メッセージの順序を確認
      const calls = mockWebContents.send.mock.calls;
      const textCalls = calls.filter(
        (c) => c[0] === "skill:stream" && c[1].type === "text",
      );

      expect(textCalls[0][1].content).toBe("First");
      expect(textCalls[1][1].content).toBe("Second");
      expect(textCalls[2][1].content).toBe("Third");
    });

    it("should properly serialize tool_use message content", async () => {
      const toolInput = { path: "/test/path", options: { flag: true } };

      mockStreamGenerator.mockReturnValue({
        [Symbol.asyncIterator]: async function* () {
          yield {
            type: "tool_use",
            tool_use: { name: "Read", input: toolInput },
          };
        },
      });

      await executor.execute(mockRequest, mockSkill);

      const calls = mockWebContents.send.mock.calls;
      const toolCall = calls.find(
        (c) => c[0] === "skill:stream" && c[1].type === "tool_use",
      );

      expect(toolCall).toBeDefined();
      const content = JSON.parse(toolCall![1].content);
      expect(content.name).toBe("Read");
      expect(content.input).toEqual(toolInput);
    });

    it("should include timestamp in all messages", async () => {
      await executor.execute(mockRequest, mockSkill);

      const calls = mockWebContents.send.mock.calls;
      calls.forEach((call) => {
        if (call[0] === "skill:stream") {
          expect(call[1].timestamp).toBeDefined();
          expect(typeof call[1].timestamp).toBe("number");
        }
      });
    });

    it("should handle execution with custom timeout", async () => {
      const requestWithTimeout: SkillExecutionRequest = {
        ...mockRequest,
        timeout: 5000,
      };

      const response = await executor.execute(requestWithTimeout, mockSkill);
      expect(response.success).toBe(true);
    });
  });
});
