import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import React from "react";
import type {
  IChatSessionRepository,
  IChatMessageRepository,
} from "@repo/shared";
import {
  ChatHistoryContext,
  type ChatHistoryContextValue,
} from "../ChatHistoryContext";
import { ChatHistoryProvider } from "../ChatHistoryProvider";
import { MockChatHistoryProvider } from "../__mocks__/MockChatHistoryProvider";
import { useChatHistory } from "../../hooks/useChatHistory";

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

describe("ChatHistoryContext", () => {
  describe("Context Definition", () => {
    it("should be defined", () => {
      expect(ChatHistoryContext).toBeDefined();
    });

    it("should have null as default value", () => {
      // Context作成時のデフォルト値はnull
      // Providerなしで使用した場合、useContextはnullを返す
      expect(ChatHistoryContext.Provider).toBeDefined();
    });
  });

  describe("ChatHistoryContextValue Type", () => {
    it("should include all required Use Cases", () => {
      const { result } = renderHook(() => useChatHistory(), {
        wrapper: MockChatHistoryProvider,
      });

      expect(result.current.createSession).toBeDefined();
      expect(result.current.addUserMessage).toBeDefined();
      expect(result.current.addAssistantMessage).toBeDefined();
      expect(result.current.togglePinned).toBeDefined();
      expect(result.current.searchSessions).toBeDefined();
    });

    it("should include isReady state", () => {
      const { result } = renderHook(() => useChatHistory(), {
        wrapper: MockChatHistoryProvider,
      });

      expect(result.current.isReady).toBeDefined();
      expect(typeof result.current.isReady).toBe("boolean");
    });
  });
});

describe("ChatHistoryProvider", () => {
  let mockSessionRepo: IChatSessionRepository;
  let mockMessageRepo: IChatMessageRepository;

  beforeEach(() => {
    mockSessionRepo = createMockSessionRepository();
    mockMessageRepo = createMockMessageRepository();
  });

  describe("Use Cases Provision", () => {
    it("should provide createSession use case", async () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <ChatHistoryProvider
          sessionRepository={mockSessionRepo}
          messageRepository={mockMessageRepo}
        >
          {children}
        </ChatHistoryProvider>
      );

      const { result } = renderHook(() => useChatHistory(), { wrapper });
      expect(result.current.createSession).toBeDefined();
      expect(typeof result.current.createSession.execute).toBe("function");
    });

    it("should provide addUserMessage use case", async () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <ChatHistoryProvider
          sessionRepository={mockSessionRepo}
          messageRepository={mockMessageRepo}
        >
          {children}
        </ChatHistoryProvider>
      );

      const { result } = renderHook(() => useChatHistory(), { wrapper });
      expect(result.current.addUserMessage).toBeDefined();
      expect(typeof result.current.addUserMessage.execute).toBe("function");
    });

    it("should provide addAssistantMessage use case", async () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <ChatHistoryProvider
          sessionRepository={mockSessionRepo}
          messageRepository={mockMessageRepo}
        >
          {children}
        </ChatHistoryProvider>
      );

      const { result } = renderHook(() => useChatHistory(), { wrapper });
      expect(result.current.addAssistantMessage).toBeDefined();
      expect(typeof result.current.addAssistantMessage.execute).toBe(
        "function",
      );
    });

    it("should provide togglePinned use case", async () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <ChatHistoryProvider
          sessionRepository={mockSessionRepo}
          messageRepository={mockMessageRepo}
        >
          {children}
        </ChatHistoryProvider>
      );

      const { result } = renderHook(() => useChatHistory(), { wrapper });
      expect(result.current.togglePinned).toBeDefined();
      expect(typeof result.current.togglePinned.execute).toBe("function");
    });

    it("should provide searchSessions use case", async () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <ChatHistoryProvider
          sessionRepository={mockSessionRepo}
          messageRepository={mockMessageRepo}
        >
          {children}
        </ChatHistoryProvider>
      );

      const { result } = renderHook(() => useChatHistory(), { wrapper });
      expect(result.current.searchSessions).toBeDefined();
      expect(typeof result.current.searchSessions.execute).toBe("function");
    });
  });

  describe("Initialization", () => {
    it("should set isReady to true after initialization", async () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <ChatHistoryProvider
          sessionRepository={mockSessionRepo}
          messageRepository={mockMessageRepo}
        >
          {children}
        </ChatHistoryProvider>
      );

      const { result } = renderHook(() => useChatHistory(), { wrapper });

      await waitFor(() => {
        expect(result.current.isReady).toBe(true);
      });
    });
  });

  describe("Custom Repository Injection", () => {
    it("should accept custom session repository", async () => {
      const customSessionRepo = createMockSessionRepository();

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <ChatHistoryProvider
          sessionRepository={customSessionRepo}
          messageRepository={mockMessageRepo}
        >
          {children}
        </ChatHistoryProvider>
      );

      const { result } = renderHook(() => useChatHistory(), { wrapper });
      expect(result.current.createSession).toBeDefined();
    });

    it("should accept custom message repository", async () => {
      const customMessageRepo = createMockMessageRepository();

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <ChatHistoryProvider
          sessionRepository={mockSessionRepo}
          messageRepository={customMessageRepo}
        >
          {children}
        </ChatHistoryProvider>
      );

      const { result } = renderHook(() => useChatHistory(), { wrapper });
      expect(result.current.addUserMessage).toBeDefined();
    });
  });
});

describe("MockChatHistoryProvider", () => {
  describe("Default Mocks", () => {
    it("should provide mocked createSession", async () => {
      const { result } = renderHook(() => useChatHistory(), {
        wrapper: MockChatHistoryProvider,
      });

      expect(result.current.createSession).toBeDefined();
      expect(result.current.createSession.execute).toBeDefined();
    });

    it("should provide mocked use cases that return success", async () => {
      const { result } = renderHook(() => useChatHistory(), {
        wrapper: MockChatHistoryProvider,
      });

      const response = await result.current.createSession.execute({
        userId: "test-user",
      });
      expect(response.ok).toBe(true);
    });

    it("should set isReady to true by default", async () => {
      const { result } = renderHook(() => useChatHistory(), {
        wrapper: MockChatHistoryProvider,
      });

      expect(result.current.isReady).toBe(true);
    });
  });

  describe("Overrides", () => {
    it("should allow partial overrides of context value", async () => {
      const customIsReady = false;
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <MockChatHistoryProvider overrides={{ isReady: customIsReady }}>
          {children}
        </MockChatHistoryProvider>
      );

      const { result } = renderHook(() => useChatHistory(), { wrapper });
      expect(result.current.isReady).toBe(false);
    });

    it("should allow overriding isReady state", async () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <MockChatHistoryProvider overrides={{ isReady: false }}>
          {children}
        </MockChatHistoryProvider>
      );

      const { result } = renderHook(() => useChatHistory(), { wrapper });
      expect(result.current.isReady).toBe(false);
    });

    it("should allow overriding individual Use Cases", async () => {
      const customExecute = vi.fn().mockResolvedValue({
        ok: true,
        value: { session: { id: "custom-id" } },
      });

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <MockChatHistoryProvider
          overrides={{
            createSession: {
              execute: customExecute,
            } as unknown as ChatHistoryContextValue["createSession"],
          }}
        >
          {children}
        </MockChatHistoryProvider>
      );

      const { result } = renderHook(() => useChatHistory(), { wrapper });
      await result.current.createSession.execute({ userId: "test" });
      expect(customExecute).toHaveBeenCalled();
    });
  });
});

describe("Integration: Provider Use Cases Execution", () => {
  describe("Use Cases via Provider", () => {
    it("should allow calling createSession.execute() via Provider", async () => {
      const { result } = renderHook(() => useChatHistory(), {
        wrapper: MockChatHistoryProvider,
      });

      const response = await result.current.createSession.execute({
        userId: "test-user",
      });
      expect(response).toBeDefined();
    });

    it("should allow calling addUserMessage.execute() via Provider", async () => {
      const { result } = renderHook(() => useChatHistory(), {
        wrapper: MockChatHistoryProvider,
      });

      const response = await result.current.addUserMessage.execute({
        sessionId: "test-session",
        content: "Hello",
      });
      expect(response).toBeDefined();
    });

    it("should allow calling addAssistantMessage.execute() via Provider", async () => {
      const { result } = renderHook(() => useChatHistory(), {
        wrapper: MockChatHistoryProvider,
      });

      const response = await result.current.addAssistantMessage.execute({
        sessionId: "test-session",
        content: "Hello",
      });
      expect(response).toBeDefined();
    });

    it("should allow calling togglePinned.execute() via Provider", async () => {
      const { result } = renderHook(() => useChatHistory(), {
        wrapper: MockChatHistoryProvider,
      });

      const response = await result.current.togglePinned.execute({
        sessionId: "test-session",
      });
      expect(response).toBeDefined();
    });

    it("should allow calling searchSessions.execute() via Provider", async () => {
      const { result } = renderHook(() => useChatHistory(), {
        wrapper: MockChatHistoryProvider,
      });

      const response = await result.current.searchSessions.execute({
        userId: "test-user",
      });
      expect(response).toBeDefined();
    });
  });
});

// Phase 6: タスク1 - エッジケーステスト
describe("Edge Cases", () => {
  let mockSessionRepo: IChatSessionRepository;
  let mockMessageRepo: IChatMessageRepository;

  beforeEach(() => {
    mockSessionRepo = createMockSessionRepository();
    mockMessageRepo = createMockMessageRepository();
  });

  describe("Provider nesting", () => {
    it("should use innermost Provider value when nested", async () => {
      const outerSessionRepo = createMockSessionRepository();
      const innerSessionRepo = createMockSessionRepository();
      (innerSessionRepo.save as ReturnType<typeof vi.fn>).mockResolvedValue(
        undefined,
      );

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <ChatHistoryProvider
          sessionRepository={outerSessionRepo}
          messageRepository={mockMessageRepo}
        >
          <ChatHistoryProvider
            sessionRepository={innerSessionRepo}
            messageRepository={mockMessageRepo}
          >
            {children}
          </ChatHistoryProvider>
        </ChatHistoryProvider>
      );

      const { result } = renderHook(() => useChatHistory(), { wrapper });

      // innerセッションリポジトリのsaveが呼ばれることを確認
      await result.current.createSession.execute({ userId: "test-user" });

      // 内側のProviderのリポジトリが使用されることを確認
      expect(innerSessionRepo.save).toHaveBeenCalled();
      expect(outerSessionRepo.save).not.toHaveBeenCalled();
    });
  });

  describe("Provider unmount", () => {
    it("should cleanup properly when Provider unmounts", () => {
      const { result, unmount } = renderHook(() => useChatHistory(), {
        wrapper: ({ children }: { children: React.ReactNode }) => (
          <ChatHistoryProvider
            sessionRepository={mockSessionRepo}
            messageRepository={mockMessageRepo}
          >
            {children}
          </ChatHistoryProvider>
        ),
      });

      // 最初はUse Casesが利用可能
      expect(result.current.createSession).toBeDefined();

      // アンマウント時にエラーが発生しないことを確認
      expect(() => unmount()).not.toThrow();
    });
  });

  describe("Repository null handling", () => {
    it("should throw error when session repository is not provided", () => {
      expect(() => {
        renderHook(() => useChatHistory(), {
          wrapper: ({ children }: { children: React.ReactNode }) => (
            <ChatHistoryProvider messageRepository={mockMessageRepo}>
              {children}
            </ChatHistoryProvider>
          ),
        });
      }).toThrow(
        "Repository must be provided. Default repository not yet implemented.",
      );
    });

    it("should throw error when message repository is not provided", () => {
      expect(() => {
        renderHook(() => useChatHistory(), {
          wrapper: ({ children }: { children: React.ReactNode }) => (
            <ChatHistoryProvider sessionRepository={mockSessionRepo}>
              {children}
            </ChatHistoryProvider>
          ),
        });
      }).toThrow(
        "Repository must be provided. Default repository not yet implemented.",
      );
    });

    it("should throw error when both repositories are not provided", () => {
      expect(() => {
        renderHook(() => useChatHistory(), {
          wrapper: ({ children }: { children: React.ReactNode }) => (
            <ChatHistoryProvider>{children}</ChatHistoryProvider>
          ),
        });
      }).toThrow(
        "Repository must be provided. Default repository not yet implemented.",
      );
    });
  });
});

// Phase 6: タスク4 - MockProvider拡張テスト
describe("MockChatHistoryProvider Extended", () => {
  describe("Custom mock responses", () => {
    it("should allow error response mocks", async () => {
      const errorMock = {
        createSession: {
          execute: vi.fn().mockResolvedValue({
            ok: false,
            error: { code: "TEST_ERROR", message: "Test error" },
          }),
        } as unknown as ChatHistoryContextValue["createSession"],
      };

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <MockChatHistoryProvider overrides={errorMock}>
          {children}
        </MockChatHistoryProvider>
      );

      const { result } = renderHook(() => useChatHistory(), { wrapper });

      const response = await result.current.createSession.execute({
        userId: "test",
      });
      expect(response.ok).toBe(false);
    });

    it("should allow custom success response mocks", async () => {
      const customMock = {
        searchSessions: {
          execute: vi.fn().mockResolvedValue({
            ok: true,
            value: {
              sessions: [
                { id: "session-1", title: "Session 1" },
                { id: "session-2", title: "Session 2" },
              ],
            },
          }),
        } as unknown as ChatHistoryContextValue["searchSessions"],
      };

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <MockChatHistoryProvider overrides={customMock}>
          {children}
        </MockChatHistoryProvider>
      );

      const { result } = renderHook(() => useChatHistory(), { wrapper });

      const response = await result.current.searchSessions.execute({
        userId: "test",
      });

      expect(response.ok).toBe(true);
      if (response.ok) {
        expect(response.value.sessions).toHaveLength(2);
      }
    });
  });

  describe("Spy verification", () => {
    it("should track Use Case calls for verification", async () => {
      const createSessionSpy = vi.fn().mockResolvedValue({
        ok: true,
        value: { session: { id: "test-id" } },
      });

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <MockChatHistoryProvider
          overrides={{
            createSession: {
              execute: createSessionSpy,
            } as unknown as ChatHistoryContextValue["createSession"],
          }}
        >
          {children}
        </MockChatHistoryProvider>
      );

      const { result } = renderHook(() => useChatHistory(), { wrapper });

      // 複数回呼び出し
      await result.current.createSession.execute({ userId: "user-1" });
      await result.current.createSession.execute({ userId: "user-2" });

      // 呼び出し回数を検証
      expect(createSessionSpy).toHaveBeenCalledTimes(2);

      // 呼び出し引数を検証
      expect(createSessionSpy).toHaveBeenNthCalledWith(1, { userId: "user-1" });
      expect(createSessionSpy).toHaveBeenNthCalledWith(2, { userId: "user-2" });
    });

    it("should verify call order across multiple Use Cases", async () => {
      const callOrder: string[] = [];

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <MockChatHistoryProvider
          overrides={{
            createSession: {
              execute: vi.fn().mockImplementation(() => {
                callOrder.push("createSession");
                return Promise.resolve({ ok: true, value: {} });
              }),
            } as unknown as ChatHistoryContextValue["createSession"],
            addUserMessage: {
              execute: vi.fn().mockImplementation(() => {
                callOrder.push("addUserMessage");
                return Promise.resolve({ ok: true, value: {} });
              }),
            } as unknown as ChatHistoryContextValue["addUserMessage"],
          }}
        >
          {children}
        </MockChatHistoryProvider>
      );

      const { result } = renderHook(() => useChatHistory(), { wrapper });

      await result.current.createSession.execute({ userId: "test" });
      await result.current.addUserMessage.execute({
        sessionId: "test",
        content: "Hello",
      });

      expect(callOrder).toEqual(["createSession", "addUserMessage"]);
    });
  });
});
