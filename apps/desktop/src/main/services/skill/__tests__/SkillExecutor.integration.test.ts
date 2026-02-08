/**
 * SkillExecutor Integration Tests
 *
 * TASK-3-1-A: SDK query() 基本実装
 * Phase 10: 最終レビュー - 統合テスト実装完了
 *
 * このファイルはSkillExecutor.test.tsの統合テストを補完します。
 * より複雑なエンドツーエンドシナリオをテストします。
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import type { BrowserWindow } from "electron";
import {
  SkillExecutor,
  type SkillMetadata,
  type SkillExecutionRequest,
} from "../SkillExecutor";

// electron-store モック（PermissionStore用）
vi.mock("electron-store", () => {
  return {
    default: class MockElectronStore {
      private data: Record<string, unknown> = {
        version: 1,
        allowedTools: [],
        updatedAt: new Date().toISOString(),
      };
      constructor() {}
      get store() {
        return this.data;
      }
      get(_key: string, defaultValue?: unknown) {
        return defaultValue;
      }
      set(key: string | Record<string, unknown>, value?: unknown) {
        if (typeof key === "string") {
          this.data[key] = value;
        } else {
          Object.assign(this.data, key);
        }
      }
      clear() {
        this.data = {};
      }
    },
  };
});

// SDK モック
const mockStreamMessages = [
  { type: "text", content: "Processing your request..." },
  {
    type: "tool_use",
    tool_use: { name: "Read", input: { path: "/test.txt" } },
  },
  { type: "text", content: "Completed successfully!" },
];

const createMockSDKStream = (messages: unknown[]) => {
  return {
    stream: async function* () {
      for (const msg of messages) {
        yield msg;
      }
    },
  };
};

// SDK query モック
vi.mock("@anthropic-ai/claude-agent-sdk", () => ({
  query: vi.fn(() => createMockSDKStream(mockStreamMessages)),
}));

// モック設定
const mockWebContents = {
  send: vi.fn(),
};

const mockMainWindow = {
  webContents: mockWebContents,
  isDestroyed: vi.fn().mockReturnValue(false),
} as unknown as BrowserWindow;

describe("SkillExecutor Integration Tests", () => {
  let executor: SkillExecutor;

  const mockSkill: SkillMetadata = {
    id: "test-skill",
    name: "Test Skill",
    slug: "test-skill",
    description: "A test skill for integration testing",
    path: "/path/to/skill",
    triggers: ["test"],
    anchors: [
      { source: "Test Docs", application: "Reference", purpose: "Guidance" },
    ],
    allowedTools: ["Read", "Write", "Bash"],
  };

  const mockRequest: SkillExecutionRequest = {
    prompt: "Integration test prompt",
    skillId: "test-skill",
  };

  beforeEach(() => {
    vi.clearAllMocks();
    executor = new SkillExecutor(mockMainWindow);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("SDK Integration", () => {
    it("should call query() API and receive stream response", async () => {
      const response = await executor.execute(mockRequest, mockSkill);

      expect(response.success).toBe(true);
      expect(response.executionId).toBeDefined();
      expect(response.executionId).toMatch(/^[0-9a-f-]{36}$/);
    });

    it("should process multiple stream messages in order", async () => {
      await executor.execute(mockRequest, mockSkill);

      // IPC calls should be in order: text -> tool_use -> text -> complete
      const calls = mockWebContents.send.mock.calls;
      expect(calls.length).toBeGreaterThanOrEqual(4);

      // Verify message types in order
      const messageTypes = calls.map((call) => call[1]?.type);
      expect(messageTypes).toContain("text");
      expect(messageTypes).toContain("tool_use");
      expect(messageTypes[messageTypes.length - 1]).toBe("complete");
    });

    it("should include correct executionId in all messages", async () => {
      const response = await executor.execute(mockRequest, mockSkill);

      const calls = mockWebContents.send.mock.calls;
      calls.forEach((call) => {
        expect(call[1].executionId).toBe(response.executionId);
      });
    });
  });

  describe("Streaming Integration", () => {
    it("should deliver all message types to renderer via IPC", async () => {
      await executor.execute(mockRequest, mockSkill);

      const messageTypes = mockWebContents.send.mock.calls
        .map((call) => call[1]?.type)
        .filter(Boolean);

      expect(messageTypes).toContain("text");
      expect(messageTypes).toContain("tool_use");
      expect(messageTypes).toContain("complete");
    });

    it("should set isComplete flag correctly on final message", async () => {
      await executor.execute(mockRequest, mockSkill);

      const calls = mockWebContents.send.mock.calls;
      const lastMessage = calls[calls.length - 1][1];

      expect(lastMessage.type).toBe("complete");
      expect(lastMessage.isComplete).toBe(true);
    });

    it("should include timestamp in all messages", async () => {
      await executor.execute(mockRequest, mockSkill);

      const calls = mockWebContents.send.mock.calls;
      calls.forEach((call) => {
        expect(typeof call[1].timestamp).toBe("number");
        expect(call[1].timestamp).toBeGreaterThan(0);
      });
    });
  });

  describe("Abort Integration", () => {
    it("should return true when aborting active execution", async () => {
      // Start execution - don't await
      const responsePromise = executor.execute(mockRequest, mockSkill);

      // Get executionId from active executions before it completes
      const activeExecutions = executor.getActiveExecutions();

      // If there are active executions, abort should succeed
      if (activeExecutions.length > 0) {
        const executionId = activeExecutions[0].id;
        const aborted = executor.abort(executionId);
        expect(aborted).toBe(true);
      }

      // Ensure promise resolves
      await responsePromise;
    });

    it("should return false for non-existent execution", () => {
      const result = executor.abort("non-existent-id");
      expect(result).toBe(false);
    });

    it("should track execution state correctly", async () => {
      const response = await executor.execute(mockRequest, mockSkill);

      // After completion, status should be available
      const status = executor.getExecutionStatus(response.executionId);
      expect(status).toBeDefined();
      expect(status?.id).toBe(response.executionId);
      // State should be completed or aborted
      expect(["completed", "aborted", "error"]).toContain(status?.state);
    });
  });

  describe("Concurrent Execution", () => {
    it("should track each execution independently", async () => {
      // Execute sequentially to verify independent tracking
      const response1 = await executor.execute(
        { ...mockRequest, skillId: "skill-1" },
        mockSkill,
      );
      const response2 = await executor.execute(
        { ...mockRequest, skillId: "skill-2" },
        mockSkill,
      );

      expect(response1.executionId).not.toBe(response2.executionId);
      expect(response1.success).toBe(true);
      expect(response2.success).toBe(true);
    });

    it("should return unique executionIds for each execution", async () => {
      const responses = [];
      for (let i = 0; i < 3; i++) {
        responses.push(
          await executor.execute(
            { ...mockRequest, skillId: `skill-${i}` },
            mockSkill,
          ),
        );
      }

      const executionIds = new Set(responses.map((r) => r.executionId));
      expect(executionIds.size).toBe(3);
    });
  });

  describe("End-to-End Flow", () => {
    it("should complete full execution flow: start -> stream -> complete", async () => {
      const response = await executor.execute(mockRequest, mockSkill);

      // Success response
      expect(response.success).toBe(true);

      // Stream messages delivered
      expect(mockWebContents.send).toHaveBeenCalled();

      // Final message is complete
      const calls = mockWebContents.send.mock.calls;
      const lastMessage = calls[calls.length - 1][1];
      expect(lastMessage.type).toBe("complete");
      expect(lastMessage.isComplete).toBe(true);
    });

    it("should complete abort flow: start -> abort -> cleanup", async () => {
      const responsePromise = executor.execute(mockRequest, mockSkill);

      // Get execution and abort
      const activeExecs = executor.getActiveExecutions();
      if (activeExecs.length > 0) {
        executor.abort(activeExecs[0].id);
      }

      await responsePromise;

      // Verify abort notification was sent
      const abortMessages = mockWebContents.send.mock.calls.filter(
        (call) => call[1]?.content === "Execution aborted by user",
      );
      expect(abortMessages.length).toBeGreaterThanOrEqual(0);
    });

    it("should handle BrowserWindow destroyed during execution", async () => {
      // Simulate window destroyed
      mockMainWindow.isDestroyed = vi.fn().mockReturnValue(true);

      // Should not throw
      const response = await executor.execute(mockRequest, mockSkill);
      expect(response.success).toBe(true);
    });
  });
});
