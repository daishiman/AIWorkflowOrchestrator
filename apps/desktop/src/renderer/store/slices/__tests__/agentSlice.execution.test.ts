/**
 * agentSlice 実行状態テスト
 * TDD: Red Phase - 実装前にテストを作成
 */
import { describe, it, expect, beforeEach } from "vitest";
import { createAgentSlice, type AgentSlice } from "../agentSlice";
import type { Skill } from "@repo/shared/types/skill";

// テスト用のモックスキル
const mockSkill: Skill = {
  id: "skill-1",
  name: "Test Skill",
  slug: "test-skill",
  description: "A test skill for unit testing",
  path: "/skills/test-skill",
  triggers: ["test", "unit"],
  anchors: [
    {
      source: "Clean Code",
      application: "TDD",
      purpose: "Testing",
    },
  ],
  category: "development",
  lastModified: new Date("2026-01-12T00:00:00Z"),
};

describe("agentSlice execution", () => {
  let store: AgentSlice;

  beforeEach(() => {
    // Zustandのset関数をモック
    const set = (
      partial:
        | Partial<AgentSlice>
        | ((state: AgentSlice) => Partial<AgentSlice>),
    ) => {
      if (typeof partial === "function") {
        Object.assign(store, partial(store));
      } else {
        Object.assign(store, partial);
      }
    };
    store = createAgentSlice(
      set as never,
      () => store as never,
      store as never,
    );
  });

  describe("startExecution", () => {
    it("should set status to executing", () => {
      // Arrange & Act
      store.startExecution?.(mockSkill, "exec-123");

      // Assert
      expect(store.executionState?.status).toBe("executing");
    });

    it("should set currentSkill", () => {
      // Arrange & Act
      store.startExecution?.(mockSkill, "exec-123");

      // Assert
      expect(store.executionState?.currentSkill).toEqual(mockSkill);
    });

    it("should set startedAt", () => {
      // Arrange
      const beforeStart = new Date();

      // Act
      store.startExecution?.(mockSkill, "exec-123");

      // Assert
      expect(store.executionState?.startedAt).toBeDefined();
      expect(store.executionState?.startedAt?.getTime()).toBeGreaterThanOrEqual(
        beforeStart.getTime(),
      );
    });

    it("should clear previous messages", () => {
      // Arrange - 事前にメッセージを追加
      store.executionState = {
        ...store.executionState,
        messages: [
          {
            id: "msg-1",
            role: "user",
            content: "Old message",
            timestamp: new Date(),
          },
        ],
      };

      // Act
      store.startExecution?.(mockSkill, "exec-123");

      // Assert
      expect(store.executionState?.messages).toEqual([]);
    });
  });

  describe("stopExecution", () => {
    it("should set status to cancelled", () => {
      // Arrange
      store.startExecution?.(mockSkill, "exec-123");

      // Act
      store.stopExecution?.();

      // Assert
      expect(store.executionState?.status).toBe("cancelled");
    });

    it("should clear currentStreamingContent", () => {
      // Arrange
      store.startExecution?.(mockSkill, "exec-123");
      store.appendStreamingContent?.("Streaming content...");

      // Act
      store.stopExecution?.();

      // Assert
      expect(store.executionState?.currentStreamingContent).toBe("");
    });
  });

  describe("addUserMessage", () => {
    it("should add user message to messages array", () => {
      // Arrange
      store.startExecution?.(mockSkill, "exec-123");

      // Act
      store.addUserMessage?.("Hello, agent!");

      // Assert
      expect(store.executionState?.messages).toHaveLength(1);
      expect(store.executionState?.messages[0].role).toBe("user");
      expect(store.executionState?.messages[0].content).toBe("Hello, agent!");
    });

    it("should set timestamp automatically", () => {
      // Arrange
      const beforeAdd = new Date();
      store.startExecution?.(mockSkill, "exec-123");

      // Act
      store.addUserMessage?.("Test message");

      // Assert
      const message = store.executionState?.messages[0];
      expect(message?.timestamp.getTime()).toBeGreaterThanOrEqual(
        beforeAdd.getTime(),
      );
    });
  });

  describe("addAssistantMessage", () => {
    it("should add assistant message to messages array", () => {
      // Arrange
      store.startExecution?.(mockSkill, "exec-123");

      // Act
      store.addAssistantMessage?.({ content: "Hello, user!" });

      // Assert
      expect(store.executionState?.messages).toHaveLength(1);
      expect(store.executionState?.messages[0].role).toBe("assistant");
      expect(store.executionState?.messages[0].content).toBe("Hello, user!");
    });
  });

  describe("appendStreamingContent", () => {
    it("should append content to currentStreamingContent", () => {
      // Arrange
      store.startExecution?.(mockSkill, "exec-123");

      // Act
      store.appendStreamingContent?.("Hello ");
      store.appendStreamingContent?.("World");

      // Assert
      expect(store.executionState?.currentStreamingContent).toBe("Hello World");
    });

    it("should set status to streaming", () => {
      // Arrange
      store.startExecution?.(mockSkill, "exec-123");

      // Act
      store.appendStreamingContent?.("Content");

      // Assert
      expect(store.executionState?.status).toBe("streaming");
    });
  });

  describe("finalizeStreamingMessage", () => {
    it("should create message from currentStreamingContent", () => {
      // Arrange
      store.startExecution?.(mockSkill, "exec-123");
      store.appendStreamingContent?.("Complete message content");

      // Act
      store.finalizeStreamingMessage?.();

      // Assert
      expect(store.executionState?.messages).toHaveLength(1);
      expect(store.executionState?.messages[0].content).toBe(
        "Complete message content",
      );
      expect(store.executionState?.messages[0].role).toBe("assistant");
    });

    it("should clear currentStreamingContent", () => {
      // Arrange
      store.startExecution?.(mockSkill, "exec-123");
      store.appendStreamingContent?.("Streaming content");

      // Act
      store.finalizeStreamingMessage?.();

      // Assert
      expect(store.executionState?.currentStreamingContent).toBe("");
    });

    it("should set isStreaming to false on message", () => {
      // Arrange
      store.startExecution?.(mockSkill, "exec-123");
      store.appendStreamingContent?.("Content");

      // Act
      store.finalizeStreamingMessage?.();

      // Assert
      expect(store.executionState?.messages[0].isStreaming).toBe(false);
    });
  });

  describe("setExecutionError", () => {
    it("should set error message", () => {
      // Arrange
      store.startExecution?.(mockSkill, "exec-123");

      // Act
      store.setExecutionError?.("Network error occurred");

      // Assert
      expect(store.executionState?.error).toBe("Network error occurred");
    });

    it("should set status to error", () => {
      // Arrange
      store.startExecution?.(mockSkill, "exec-123");

      // Act
      store.setExecutionError?.("Error message");

      // Assert
      expect(store.executionState?.status).toBe("error");
    });
  });

  describe("clearMessages", () => {
    it("should clear all messages", () => {
      // Arrange
      store.startExecution?.(mockSkill, "exec-123");
      store.addUserMessage?.("Message 1");
      store.addAssistantMessage?.({ content: "Message 2" });

      // Act
      store.clearMessages?.();

      // Assert
      expect(store.executionState?.messages).toEqual([]);
    });

    it("should reset status to idle", () => {
      // Arrange
      store.startExecution?.(mockSkill, "exec-123");

      // Act
      store.clearMessages?.();

      // Assert
      expect(store.executionState?.status).toBe("idle");
    });
  });

  describe("resetExecutionState", () => {
    it("should reset all execution state to initial values", () => {
      // Arrange
      store.startExecution?.(mockSkill, "exec-123");
      store.addUserMessage?.("Test");
      store.appendStreamingContent?.("Streaming");

      // Act
      store.resetExecutionState?.();

      // Assert
      expect(store.executionState?.status).toBe("idle");
      expect(store.executionState?.currentSkill).toBeNull();
      expect(store.executionState?.messages).toEqual([]);
      expect(store.executionState?.currentStreamingContent).toBe("");
      expect(store.executionState?.error).toBeNull();
      expect(store.executionState?.startedAt).toBeNull();
      expect(store.executionState?.completedAt).toBeNull();
    });
  });
});
