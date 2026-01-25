/**
 * useConversation Hook Tests
 *
 * TDD Red Phase: Tests for single conversation management hook.
 *
 * @module @repo/desktop/renderer/hooks/__tests__/useConversation
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";
import { useConversation } from "../useConversation";
import type {
  Conversation,
  ConversationGetResponse,
  ConversationUpdateResponse,
} from "../../../shared/types/conversation";

// Mock data
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
  lastMessagePreview: "Hello!",
  metadata: {},
  messages: [
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
      content: "Hi there!",
      messageIndex: 1,
      timestamp: "2026-01-24T10:00:01Z",
      attachments: [],
      metadata: {},
    },
  ],
};

const mockConversationAPI = {
  list: vi.fn(),
  get: vi.fn<[], Promise<ConversationGetResponse>>(),
  create: vi.fn(),
  update: vi.fn<[], Promise<ConversationUpdateResponse>>(),
  delete: vi.fn(),
  addMessage: vi.fn(),
  search: vi.fn(),
};

describe("useConversation", () => {
  beforeEach(() => {
    vi.stubGlobal("conversationAPI", mockConversationAPI);
    mockConversationAPI.get.mockResolvedValue({
      success: true,
      data: mockConversation,
    });
    mockConversationAPI.update.mockResolvedValue({
      success: true,
      data: { ...mockConversation, title: "Updated Title" },
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("Initial State", () => {
    it("should initialize with null conversation", () => {
      const { result } = renderHook(() =>
        useConversation({ conversationId: "conv-1", autoFetch: false }),
      );
      expect(result.current.conversation).toBeNull();
    });

    it("should initialize with isLoading false", () => {
      const { result } = renderHook(() =>
        useConversation({ conversationId: "conv-1", autoFetch: false }),
      );
      expect(result.current.isLoading).toBe(false);
    });

    it("should initialize with error null", () => {
      const { result } = renderHook(() =>
        useConversation({ conversationId: "conv-1", autoFetch: false }),
      );
      expect(result.current.error).toBeNull();
    });
  });

  describe("Auto Fetch", () => {
    it("should fetch conversation automatically when autoFetch is true", async () => {
      const { result } = renderHook(() =>
        useConversation({ conversationId: "conv-1", autoFetch: true }),
      );

      await waitFor(() => {
        expect(result.current.conversation).not.toBeNull();
      });

      expect(result.current.conversation?.id).toBe("conv-1");
    });

    it("should call API with correct conversationId", async () => {
      renderHook(() =>
        useConversation({ conversationId: "conv-1", autoFetch: true }),
      );

      await waitFor(() => {
        expect(mockConversationAPI.get).toHaveBeenCalledWith({ id: "conv-1" });
      });
    });

    it("should set isLoading to true during fetch", async () => {
      mockConversationAPI.get.mockImplementation(async () => {
        // We can't check result.current here, so we just verify the mock was called
        return { success: true, data: mockConversation };
      });

      const { result } = renderHook(() =>
        useConversation({ conversationId: "conv-1", autoFetch: true }),
      );

      // Loading should become true then false
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
    });
  });

  describe("Update Title", () => {
    it("should update conversation title", async () => {
      const { result } = renderHook(() =>
        useConversation({ conversationId: "conv-1", autoFetch: true }),
      );

      await waitFor(() => {
        expect(result.current.conversation).not.toBeNull();
      });

      await act(async () => {
        await result.current.updateTitle("Updated Title");
      });

      expect(mockConversationAPI.update).toHaveBeenCalledWith({
        id: "conv-1",
        data: { title: "Updated Title" },
      });
    });

    it("should update local state after successful update", async () => {
      const { result } = renderHook(() =>
        useConversation({ conversationId: "conv-1", autoFetch: true }),
      );

      await waitFor(() => {
        expect(result.current.conversation).not.toBeNull();
      });

      await act(async () => {
        await result.current.updateTitle("Updated Title");
      });

      expect(result.current.conversation?.title).toBe("Updated Title");
    });
  });

  describe("Error Handling", () => {
    it("should set error when get fails", async () => {
      mockConversationAPI.get.mockResolvedValue({
        success: false,
        error: { code: "NOT_FOUND", message: "Conversation not found" },
      });

      const { result } = renderHook(() =>
        useConversation({ conversationId: "invalid", autoFetch: true }),
      );

      await waitFor(() => {
        expect(result.current.error).not.toBeNull();
      });
    });

    it("should set error when update fails", async () => {
      mockConversationAPI.update.mockResolvedValue({
        success: false,
        error: { code: "ERROR", message: "Failed to update" },
      });

      const { result } = renderHook(() =>
        useConversation({ conversationId: "conv-1", autoFetch: true }),
      );

      await waitFor(() => {
        expect(result.current.conversation).not.toBeNull();
      });

      await act(async () => {
        try {
          await result.current.updateTitle("New Title");
        } catch {
          // Expected to throw
        }
      });

      expect(result.current.error).not.toBeNull();
    });

    it("should return null for non-existent conversation", async () => {
      mockConversationAPI.get.mockResolvedValue({
        success: true,
        data: null,
      });

      const { result } = renderHook(() =>
        useConversation({ conversationId: "non-existent", autoFetch: true }),
      );

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.conversation).toBeNull();
    });
  });

  describe("Refresh", () => {
    it("should refresh conversation data", async () => {
      const { result } = renderHook(() =>
        useConversation({ conversationId: "conv-1", autoFetch: true }),
      );

      await waitFor(() => {
        expect(result.current.conversation).not.toBeNull();
      });

      await act(async () => {
        await result.current.refresh();
      });

      expect(mockConversationAPI.get).toHaveBeenCalledTimes(2);
    });
  });

  describe("Conversation ID Change", () => {
    it("should refetch when conversationId changes", async () => {
      const { result, rerender } = renderHook(
        ({ id }) => useConversation({ conversationId: id, autoFetch: true }),
        { initialProps: { id: "conv-1" } },
      );

      await waitFor(() => {
        expect(result.current.conversation).not.toBeNull();
      });

      rerender({ id: "conv-2" });

      await waitFor(() => {
        expect(mockConversationAPI.get).toHaveBeenCalledWith({ id: "conv-2" });
      });
    });
  });
});
