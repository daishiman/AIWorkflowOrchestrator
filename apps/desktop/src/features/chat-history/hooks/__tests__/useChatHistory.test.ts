import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook } from "@testing-library/react";
import React from "react";
import type {
  IChatSessionRepository,
  IChatMessageRepository,
} from "@repo/shared";
import { useChatHistory } from "../useChatHistory";
import { MockChatHistoryProvider } from "../../context/__mocks__/MockChatHistoryProvider";
import { ChatHistoryProvider } from "../../context/ChatHistoryProvider";

// モックリポジトリの作成
function createMockSessionRepository(): IChatSessionRepository {
  return {
    findById: vi.fn(),
    findByUserId: vi.fn(),
    findPinned: vi.fn(),
    search: vi.fn(),
    save: vi.fn(),
    delete: vi.fn(),
    exists: vi.fn(),
    countPinned: vi.fn(),
  };
}

function createMockMessageRepository(): IChatMessageRepository {
  return {
    findById: vi.fn(),
    findBySessionId: vi.fn(),
    findLatestBySessionId: vi.fn(),
    countBySessionId: vi.fn(),
    save: vi.fn(),
    saveMany: vi.fn(),
    delete: vi.fn(),
    deleteBySessionId: vi.fn(),
  };
}

describe("useChatHistory", () => {
  describe("Within Provider", () => {
    it("should return context value when used within Provider", () => {
      const { result } = renderHook(() => useChatHistory(), {
        wrapper: MockChatHistoryProvider,
      });

      expect(result.current).toBeDefined();
    });

    it("should return all Use Cases", () => {
      const { result } = renderHook(() => useChatHistory(), {
        wrapper: MockChatHistoryProvider,
      });

      expect(result.current.createSession).toBeDefined();
      expect(result.current.addUserMessage).toBeDefined();
      expect(result.current.addAssistantMessage).toBeDefined();
      expect(result.current.togglePinned).toBeDefined();
      expect(result.current.searchSessions).toBeDefined();
    });

    it("should return isReady state", () => {
      const { result } = renderHook(() => useChatHistory(), {
        wrapper: MockChatHistoryProvider,
      });

      expect(typeof result.current.isReady).toBe("boolean");
    });

    it("should return createSession use case", () => {
      const { result } = renderHook(() => useChatHistory(), {
        wrapper: MockChatHistoryProvider,
      });

      expect(result.current.createSession).toBeDefined();
      expect(typeof result.current.createSession.execute).toBe("function");
    });

    it("should return addUserMessage use case", () => {
      const { result } = renderHook(() => useChatHistory(), {
        wrapper: MockChatHistoryProvider,
      });

      expect(result.current.addUserMessage).toBeDefined();
      expect(typeof result.current.addUserMessage.execute).toBe("function");
    });

    it("should return addAssistantMessage use case", () => {
      const { result } = renderHook(() => useChatHistory(), {
        wrapper: MockChatHistoryProvider,
      });

      expect(result.current.addAssistantMessage).toBeDefined();
      expect(typeof result.current.addAssistantMessage.execute).toBe(
        "function",
      );
    });

    it("should return togglePinned use case", () => {
      const { result } = renderHook(() => useChatHistory(), {
        wrapper: MockChatHistoryProvider,
      });

      expect(result.current.togglePinned).toBeDefined();
      expect(typeof result.current.togglePinned.execute).toBe("function");
    });

    it("should return searchSessions use case", () => {
      const { result } = renderHook(() => useChatHistory(), {
        wrapper: MockChatHistoryProvider,
      });

      expect(result.current.searchSessions).toBeDefined();
      expect(typeof result.current.searchSessions.execute).toBe("function");
    });
  });

  describe("Outside Provider", () => {
    it("should throw error when used outside Provider", () => {
      expect(() => {
        renderHook(() => useChatHistory());
      }).toThrow();
    });

    it("should throw error with descriptive message", () => {
      expect(() => {
        renderHook(() => useChatHistory());
      }).toThrow("useChatHistory must be used within a ChatHistoryProvider");
    });
  });
});

describe("useChatHistoryFactory", () => {
  let mockSessionRepo: IChatSessionRepository;
  let mockMessageRepo: IChatMessageRepository;

  beforeEach(() => {
    mockSessionRepo = createMockSessionRepository();
    mockMessageRepo = createMockMessageRepository();
  });

  describe("Use Cases Creation", () => {
    it("should create all Use Cases with given repositories", () => {
      const wrapper = ({ children }: { children: React.ReactNode }) =>
        React.createElement(
          ChatHistoryProvider,
          {
            sessionRepository: mockSessionRepo,
            messageRepository: mockMessageRepo,
          },
          children,
        );

      const { result } = renderHook(() => useChatHistory(), { wrapper });

      expect(result.current.createSession).toBeDefined();
      expect(result.current.addUserMessage).toBeDefined();
      expect(result.current.addAssistantMessage).toBeDefined();
      expect(result.current.togglePinned).toBeDefined();
      expect(result.current.searchSessions).toBeDefined();
    });

    it("should memoize Use Cases", () => {
      const wrapper = ({ children }: { children: React.ReactNode }) =>
        React.createElement(
          ChatHistoryProvider,
          {
            sessionRepository: mockSessionRepo,
            messageRepository: mockMessageRepo,
          },
          children,
        );

      const { result, rerender } = renderHook(() => useChatHistory(), {
        wrapper,
      });

      const firstCreateSession = result.current.createSession;
      rerender();
      const secondCreateSession = result.current.createSession;

      // 同じインスタンスであることを確認（メモ化されている）
      expect(firstCreateSession).toBe(secondCreateSession);
    });
  });
});

// Phase 6: タスク2 - 異常系テスト追加
describe("Error Handling", () => {
  describe("Provider not found", () => {
    it("should throw specific error message", () => {
      expect(() => renderHook(() => useChatHistory())).toThrow(
        "useChatHistory must be used within a ChatHistoryProvider",
      );
    });

    it("should throw Error type", () => {
      expect(() => renderHook(() => useChatHistory())).toThrow(Error);
    });
  });

  describe("Use Case execution errors", () => {
    it("should propagate error from createSession", async () => {
      const errorMock = {
        createSession: {
          execute: vi.fn().mockResolvedValue({
            ok: false,
            error: { code: "SESSION_ERROR", message: "Failed to create" },
          }),
        },
      };

      const { result } = renderHook(() => useChatHistory(), {
        wrapper: ({ children }: { children: React.ReactNode }) =>
          React.createElement(
            MockChatHistoryProvider,
            { overrides: errorMock },
            children,
          ),
      });

      const response = await result.current.createSession.execute({
        userId: "test-user",
      });

      expect(response.ok).toBe(false);
      if (!response.ok) {
        expect(response.error.code).toBe("SESSION_ERROR");
      }
    });

    it("should propagate error from addUserMessage", async () => {
      const errorMock = {
        addUserMessage: {
          execute: vi.fn().mockResolvedValue({
            ok: false,
            error: { code: "MESSAGE_ERROR", message: "Failed to add message" },
          }),
        },
      };

      const { result } = renderHook(() => useChatHistory(), {
        wrapper: ({ children }: { children: React.ReactNode }) =>
          React.createElement(
            MockChatHistoryProvider,
            { overrides: errorMock },
            children,
          ),
      });

      const response = await result.current.addUserMessage.execute({
        sessionId: "test-session",
        content: "Hello",
      });

      expect(response.ok).toBe(false);
      if (!response.ok) {
        expect(response.error.code).toBe("MESSAGE_ERROR");
      }
    });

    it("should propagate error from addAssistantMessage", async () => {
      const errorMock = {
        addAssistantMessage: {
          execute: vi.fn().mockResolvedValue({
            ok: false,
            error: { code: "ASSISTANT_ERROR", message: "Failed to add" },
          }),
        },
      };

      const { result } = renderHook(() => useChatHistory(), {
        wrapper: ({ children }: { children: React.ReactNode }) =>
          React.createElement(
            MockChatHistoryProvider,
            { overrides: errorMock },
            children,
          ),
      });

      const response = await result.current.addAssistantMessage.execute({
        sessionId: "test-session",
        content: "Response",
      });

      expect(response.ok).toBe(false);
      if (!response.ok) {
        expect(response.error.code).toBe("ASSISTANT_ERROR");
      }
    });

    it("should propagate error from togglePinned", async () => {
      const errorMock = {
        togglePinned: {
          execute: vi.fn().mockResolvedValue({
            ok: false,
            error: { code: "PIN_ERROR", message: "Failed to toggle" },
          }),
        },
      };

      const { result } = renderHook(() => useChatHistory(), {
        wrapper: ({ children }: { children: React.ReactNode }) =>
          React.createElement(
            MockChatHistoryProvider,
            { overrides: errorMock },
            children,
          ),
      });

      const response = await result.current.togglePinned.execute({
        sessionId: "test-session",
      });

      expect(response.ok).toBe(false);
      if (!response.ok) {
        expect(response.error.code).toBe("PIN_ERROR");
      }
    });

    it("should propagate error from searchSessions", async () => {
      const errorMock = {
        searchSessions: {
          execute: vi.fn().mockResolvedValue({
            ok: false,
            error: { code: "SEARCH_ERROR", message: "Failed to search" },
          }),
        },
      };

      const { result } = renderHook(() => useChatHistory(), {
        wrapper: ({ children }: { children: React.ReactNode }) =>
          React.createElement(
            MockChatHistoryProvider,
            { overrides: errorMock },
            children,
          ),
      });

      const response = await result.current.searchSessions.execute({
        userId: "test-user",
      });

      expect(response.ok).toBe(false);
      if (!response.ok) {
        expect(response.error.code).toBe("SEARCH_ERROR");
      }
    });
  });

  describe("Async error handling", () => {
    it("should handle rejected promises in Use Case execution", async () => {
      const rejectedMock = {
        createSession: {
          execute: vi.fn().mockRejectedValue(new Error("Network error")),
        },
      };

      const { result } = renderHook(() => useChatHistory(), {
        wrapper: ({ children }: { children: React.ReactNode }) =>
          React.createElement(
            MockChatHistoryProvider,
            { overrides: rejectedMock },
            children,
          ),
      });

      await expect(
        result.current.createSession.execute({ userId: "test" }),
      ).rejects.toThrow("Network error");
    });
  });
});
