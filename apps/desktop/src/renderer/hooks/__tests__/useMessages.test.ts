/**
 * useMessages Hook Tests
 *
 * TDD Red Phase: Tests for message management hook.
 *
 * @module @repo/desktop/renderer/hooks/__tests__/useMessages
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";
import { useMessages } from "../useMessages";
import type {
  Message,
  Conversation,
  ConversationGetResponse,
  ConversationAddMessageResponse,
} from "../../../shared/types/conversation";

// Mock data
const mockMessages: Message[] = [
  {
    id: "msg-1",
    sessionId: "conv-1",
    role: "user",
    content: "Hello!",
    messageIndex: 0,
    timestamp: "2026-01-24T10:00:00Z",
    attachments: [],
    metadata: {},
  },
  {
    id: "msg-2",
    sessionId: "conv-1",
    role: "assistant",
    content: "Hi there! How can I help you?",
    messageIndex: 1,
    timestamp: "2026-01-24T10:00:01Z",
    attachments: [],
    metadata: {},
  },
];

const mockConversation: Conversation = {
  id: "conv-1",
  userId: "user-1",
  title: "Test Conversation",
  createdAt: "2026-01-24T10:00:00Z",
  updatedAt: "2026-01-24T10:00:00Z",
  messageCount: 2,
  isFavorite: false,
  isPinned: false,
  pinOrder: null,
  lastMessagePreview: "Hi there!",
  metadata: {},
  messages: mockMessages,
};

const mockNewMessage: Message = {
  id: "msg-3",
  sessionId: "conv-1",
  role: "user",
  content: "How are you?",
  messageIndex: 2,
  timestamp: "2026-01-24T10:00:02Z",
  attachments: [],
  metadata: {},
};

const mockConversationAPI = {
  list: vi.fn(),
  get: vi.fn<[], Promise<ConversationGetResponse>>(),
  create: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
  addMessage: vi.fn<[], Promise<ConversationAddMessageResponse>>(),
  search: vi.fn(),
};

describe("useMessages", () => {
  beforeEach(() => {
    vi.stubGlobal("conversationAPI", mockConversationAPI);
    mockConversationAPI.get.mockResolvedValue({
      success: true,
      data: mockConversation,
    });
    mockConversationAPI.addMessage.mockResolvedValue({
      success: true,
      data: mockNewMessage,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("Initial State", () => {
    it("should initialize with empty messages array", () => {
      const { result } = renderHook(() =>
        useMessages({ conversationId: "conv-1", userId: "user-1" }),
      );
      // Messages will be empty until loaded
      expect(result.current.messages).toBeDefined();
    });

    it("should initialize with isLoading true (fetching)", () => {
      const { result } = renderHook(() =>
        useMessages({ conversationId: "conv-1", userId: "user-1" }),
      );
      expect(result.current.isLoading).toBe(true);
    });

    it("should initialize with isSending false", () => {
      const { result } = renderHook(() =>
        useMessages({ conversationId: "conv-1", userId: "user-1" }),
      );
      expect(result.current.isSending).toBe(false);
    });

    it("should initialize with error null", () => {
      const { result } = renderHook(() =>
        useMessages({ conversationId: "conv-1", userId: "user-1" }),
      );
      expect(result.current.error).toBeNull();
    });
  });

  describe("Message Loading", () => {
    it("should load messages from conversation", async () => {
      const { result } = renderHook(() =>
        useMessages({ conversationId: "conv-1", userId: "user-1" }),
      );

      await waitFor(() => {
        expect(result.current.messages).toHaveLength(2);
      });
    });

    it("should set isLoading to false after loading", async () => {
      const { result } = renderHook(() =>
        useMessages({ conversationId: "conv-1", userId: "user-1" }),
      );

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
    });
  });

  describe("Add Message", () => {
    it("should add a user message", async () => {
      const { result } = renderHook(() =>
        useMessages({ conversationId: "conv-1", userId: "user-1" }),
      );

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      let newMsg: Message | undefined;
      await act(async () => {
        newMsg = await result.current.addMessage("How are you?");
      });

      expect(newMsg).toBeDefined();
      expect(newMsg?.content).toBe("How are you?");
    });

    it("should call API with correct parameters", async () => {
      const { result } = renderHook(() =>
        useMessages({ conversationId: "conv-1", userId: "user-1" }),
      );

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.addMessage("How are you?");
      });

      expect(mockConversationAPI.addMessage).toHaveBeenCalledWith({
        sessionId: "conv-1",
        message: expect.objectContaining({
          role: "user",
          content: "How are you?",
        }),
      });
    });

    it("should set isSending to true during send", async () => {
      let resolveSend: () => void;
      const sendPromise = new Promise<void>((resolve) => {
        resolveSend = resolve;
      });

      mockConversationAPI.addMessage.mockImplementation(async () => {
        await sendPromise;
        return { success: true, data: mockNewMessage };
      });

      const { result } = renderHook(() =>
        useMessages({ conversationId: "conv-1", userId: "user-1" }),
      );

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Start sending but don't await
      let sendingDuringSend = false;
      act(() => {
        result.current.addMessage("How are you?");
      });

      // Check isSending while promise is pending
      await waitFor(() => {
        sendingDuringSend = result.current.isSending;
        expect(result.current.isSending).toBe(true);
      });

      // Resolve and complete
      await act(async () => {
        resolveSend!();
        await new Promise((r) => setTimeout(r, 0));
      });

      expect(sendingDuringSend).toBe(true);
    });

    it("should add message to local state after successful send", async () => {
      const { result } = renderHook(() =>
        useMessages({ conversationId: "conv-1", userId: "user-1" }),
      );

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const initialLength = result.current.messages.length;

      await act(async () => {
        await result.current.addMessage("How are you?");
      });

      expect(result.current.messages.length).toBeGreaterThan(initialLength);
    });

    it("should add assistant message with role specified", async () => {
      const assistantMessage: Message = {
        ...mockNewMessage,
        id: "msg-4",
        role: "assistant",
        content: "I am doing well!",
      };
      mockConversationAPI.addMessage.mockResolvedValue({
        success: true,
        data: assistantMessage,
      });

      const { result } = renderHook(() =>
        useMessages({ conversationId: "conv-1", userId: "user-1" }),
      );

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.addMessage("I am doing well!", "assistant");
      });

      expect(mockConversationAPI.addMessage).toHaveBeenCalledWith({
        sessionId: "conv-1",
        message: expect.objectContaining({
          role: "assistant",
        }),
      });
    });
  });

  describe("Optimistic Update", () => {
    it("should append message optimistically", async () => {
      const { result } = renderHook(() =>
        useMessages({ conversationId: "conv-1", userId: "user-1" }),
      );

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const optimisticMessage: Message = {
        id: "temp-msg",
        sessionId: "conv-1",
        role: "user",
        content: "Optimistic message",
        messageIndex: 99,
        timestamp: new Date().toISOString(),
        attachments: [],
        metadata: {},
      };

      act(() => {
        result.current.appendMessageOptimistic(optimisticMessage);
      });

      expect(
        result.current.messages.find((m) => m.id === "temp-msg"),
      ).toBeDefined();
    });
  });

  describe("Error Handling", () => {
    it("should set error when addMessage fails", async () => {
      mockConversationAPI.addMessage.mockResolvedValue({
        success: false,
        error: { code: "ERROR", message: "Failed to add message" },
      });

      const { result } = renderHook(() =>
        useMessages({ conversationId: "conv-1", userId: "user-1" }),
      );

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        try {
          await result.current.addMessage("Test");
        } catch {
          // Expected to throw
        }
      });

      expect(result.current.error).not.toBeNull();
    });

    it("should set error when loading fails", async () => {
      mockConversationAPI.get.mockResolvedValue({
        success: false,
        error: { code: "ERROR", message: "Failed to load" },
      });

      const { result } = renderHook(() =>
        useMessages({ conversationId: "conv-1", userId: "user-1" }),
      );

      await waitFor(() => {
        expect(result.current.error).not.toBeNull();
      });
    });
  });

  describe("Conversation ID Change", () => {
    it("should reload messages when conversationId changes", async () => {
      const { result, rerender } = renderHook(
        ({ id }) => useMessages({ conversationId: id, userId: "user-1" }),
        { initialProps: { id: "conv-1" } },
      );

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      rerender({ id: "conv-2" });

      await waitFor(() => {
        expect(mockConversationAPI.get).toHaveBeenCalledWith({ id: "conv-2" });
      });
    });
  });
});
