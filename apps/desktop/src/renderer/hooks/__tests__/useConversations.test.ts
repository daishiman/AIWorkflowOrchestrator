/**
 * useConversations Hook Tests
 *
 * TDD Red Phase: Tests for conversation list management hook.
 *
 * @module @repo/desktop/renderer/hooks/__tests__/useConversations
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";
import { useConversations } from "../useConversations";
import type {
  ConversationSummary,
  Conversation,
  ConversationListResponse,
  ConversationCreateResponse,
  ConversationDeleteResponse,
  ConversationSearchResponse,
} from "../../../shared/types/conversation";

// Mock data
const mockConversations: ConversationSummary[] = [
  {
    id: "conv-1",
    title: "Test Conversation 1",
    createdAt: "2026-01-24T10:00:00Z",
    updatedAt: "2026-01-24T10:00:00Z",
    messageCount: 5,
    lastMessagePreview: "Hello, world!",
    isFavorite: false,
    isPinned: false,
  },
  {
    id: "conv-2",
    title: "Test Conversation 2",
    createdAt: "2026-01-24T11:00:00Z",
    updatedAt: "2026-01-24T11:00:00Z",
    messageCount: 3,
    lastMessagePreview: "How are you?",
    isFavorite: true,
    isPinned: false,
  },
];

const mockConversationAPI = {
  list: vi.fn<[], Promise<ConversationListResponse>>(),
  get: vi.fn(),
  create: vi.fn<[], Promise<ConversationCreateResponse>>(),
  update: vi.fn(),
  delete: vi.fn<[], Promise<ConversationDeleteResponse>>(),
  addMessage: vi.fn(),
  search: vi.fn<[], Promise<ConversationSearchResponse>>(),
};

describe("useConversations", () => {
  beforeEach(() => {
    vi.stubGlobal("conversationAPI", mockConversationAPI);
    mockConversationAPI.list.mockResolvedValue({
      success: true,
      data: mockConversations,
    });
    mockConversationAPI.create.mockResolvedValue({
      success: true,
      data: {
        id: "new-conv",
        userId: "user-1",
        title: "New Conversation",
        createdAt: "2026-01-24T12:00:00Z",
        updatedAt: "2026-01-24T12:00:00Z",
        messageCount: 0,
        isFavorite: false,
        isPinned: false,
        pinOrder: null,
        lastMessagePreview: null,
        metadata: {},
        messages: [],
      } as Conversation,
    });
    mockConversationAPI.delete.mockResolvedValue({
      success: true,
      data: { deleted: true },
    });
    mockConversationAPI.search.mockResolvedValue({
      success: true,
      data: [mockConversations[0]],
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("Initial State", () => {
    it("should initialize with empty conversations array", () => {
      const { result } = renderHook(() =>
        useConversations({ userId: "user-1", autoFetch: false }),
      );
      expect(result.current.conversations).toEqual([]);
    });

    it("should initialize with isLoading false", () => {
      const { result } = renderHook(() =>
        useConversations({ userId: "user-1", autoFetch: false }),
      );
      expect(result.current.isLoading).toBe(false);
    });

    it("should initialize with error null", () => {
      const { result } = renderHook(() =>
        useConversations({ userId: "user-1", autoFetch: false }),
      );
      expect(result.current.error).toBeNull();
    });

    it("should initialize with hasMore true", () => {
      const { result } = renderHook(() =>
        useConversations({ userId: "user-1", autoFetch: false }),
      );
      expect(result.current.hasMore).toBe(true);
    });
  });

  describe("Auto Fetch", () => {
    it("should fetch conversations automatically when autoFetch is true", async () => {
      const { result } = renderHook(() =>
        useConversations({ userId: "user-1", autoFetch: true }),
      );

      await waitFor(() => {
        expect(result.current.conversations).toHaveLength(2);
      });
    });

    it("should call API with correct userId", async () => {
      renderHook(() =>
        useConversations({ userId: "test-user", autoFetch: true }),
      );

      await waitFor(() => {
        expect(mockConversationAPI.list).toHaveBeenCalledWith(
          expect.objectContaining({ userId: "test-user" }),
        );
      });
    });
  });

  describe("Pagination", () => {
    it("should fetch with default limit of 20", async () => {
      renderHook(() => useConversations({ userId: "user-1", autoFetch: true }));

      await waitFor(() => {
        expect(mockConversationAPI.list).toHaveBeenCalledWith(
          expect.objectContaining({ limit: 20 }),
        );
      });
    });

    it("should fetch with custom limit", async () => {
      renderHook(() =>
        useConversations({ userId: "user-1", limit: 10, autoFetch: true }),
      );

      await waitFor(() => {
        expect(mockConversationAPI.list).toHaveBeenCalledWith(
          expect.objectContaining({ limit: 10 }),
        );
      });
    });

    it("should load more conversations when loadMore is called", async () => {
      // Use limit: 2 to ensure hasMore=true after first fetch
      const { result } = renderHook(() =>
        useConversations({ userId: "user-1", limit: 2, autoFetch: true }),
      );

      await waitFor(() => {
        expect(result.current.conversations).toHaveLength(2);
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.loadMore();
      });

      expect(mockConversationAPI.list).toHaveBeenCalledTimes(2);
    });

    it("should set hasMore to false when fewer items than limit are returned", async () => {
      mockConversationAPI.list.mockResolvedValue({
        success: true,
        data: [mockConversations[0]],
      });

      const { result } = renderHook(() =>
        useConversations({ userId: "user-1", limit: 20, autoFetch: true }),
      );

      await waitFor(() => {
        expect(result.current.hasMore).toBe(false);
      });
    });
  });

  describe("Search", () => {
    it("should search conversations with query", async () => {
      const { result } = renderHook(() =>
        useConversations({ userId: "user-1", autoFetch: false }),
      );

      await act(async () => {
        await result.current.search("test");
      });

      expect(mockConversationAPI.search).toHaveBeenCalledWith(
        expect.objectContaining({ query: "test" }),
      );
    });

    it("should update conversations with search results", async () => {
      const { result } = renderHook(() =>
        useConversations({ userId: "user-1", autoFetch: false }),
      );

      await act(async () => {
        await result.current.search("test");
      });

      expect(result.current.conversations).toHaveLength(1);
    });

    it("should set isSearching to true during search", async () => {
      let resolveSearch: () => void;
      const searchPromise = new Promise<void>((resolve) => {
        resolveSearch = resolve;
      });

      mockConversationAPI.search.mockImplementation(async () => {
        await searchPromise;
        return { success: true, data: [] };
      });

      const { result } = renderHook(() =>
        useConversations({ userId: "user-1", autoFetch: false }),
      );

      // Start search but don't await
      let searchingDuringCall = false;
      act(() => {
        result.current.search("test");
      });

      // Check isSearching while promise is pending
      await waitFor(() => {
        searchingDuringCall = result.current.isSearching;
        expect(result.current.isSearching).toBe(true);
      });

      // Resolve and complete
      await act(async () => {
        resolveSearch!();
        await new Promise((r) => setTimeout(r, 0));
      });

      expect(searchingDuringCall).toBe(true);
    });

    it("should clear search and refetch when clearSearch is called", async () => {
      const { result } = renderHook(() =>
        useConversations({ userId: "user-1", autoFetch: false }),
      );

      await act(async () => {
        await result.current.search("test");
      });

      await act(async () => {
        result.current.clearSearch();
      });

      await waitFor(() => {
        expect(mockConversationAPI.list).toHaveBeenCalled();
      });
    });
  });

  describe("Create Conversation", () => {
    it("should create a new conversation", async () => {
      const { result } = renderHook(() =>
        useConversations({ userId: "user-1", autoFetch: false }),
      );

      let newConv: Conversation | undefined;
      await act(async () => {
        newConv = await result.current.create("New Conversation");
      });

      expect(newConv).toBeDefined();
      expect(newConv?.title).toBe("New Conversation");
    });

    it("should call API with correct parameters", async () => {
      const { result } = renderHook(() =>
        useConversations({ userId: "user-1", autoFetch: false }),
      );

      await act(async () => {
        await result.current.create("New Conversation", "First message");
      });

      expect(mockConversationAPI.create).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: "user-1",
          title: "New Conversation",
        }),
      );
    });
  });

  describe("Delete Conversation", () => {
    it("should delete a conversation", async () => {
      const { result } = renderHook(() =>
        useConversations({ userId: "user-1", autoFetch: true }),
      );

      await waitFor(() => {
        expect(result.current.conversations).toHaveLength(2);
      });

      await act(async () => {
        await result.current.deleteConversation("conv-1");
      });

      expect(mockConversationAPI.delete).toHaveBeenCalledWith({ id: "conv-1" });
    });

    it("should remove conversation from list after deletion", async () => {
      const { result } = renderHook(() =>
        useConversations({ userId: "user-1", autoFetch: true }),
      );

      await waitFor(() => {
        expect(result.current.conversations).toHaveLength(2);
      });

      await act(async () => {
        await result.current.deleteConversation("conv-1");
      });

      expect(
        result.current.conversations.find((c) => c.id === "conv-1"),
      ).toBeUndefined();
    });
  });

  describe("Error Handling", () => {
    it("should set error when list fails", async () => {
      mockConversationAPI.list.mockResolvedValue({
        success: false,
        error: { code: "ERROR", message: "Failed to fetch" },
      });

      const { result } = renderHook(() =>
        useConversations({ userId: "user-1", autoFetch: true }),
      );

      await waitFor(() => {
        expect(result.current.error).not.toBeNull();
      });
    });

    it("should set error when create fails", async () => {
      mockConversationAPI.create.mockResolvedValue({
        success: false,
        error: { code: "ERROR", message: "Failed to create" },
      });

      const { result } = renderHook(() =>
        useConversations({ userId: "user-1", autoFetch: false }),
      );

      await act(async () => {
        try {
          await result.current.create("Test");
        } catch {
          // Expected to throw
        }
      });

      expect(result.current.error).not.toBeNull();
    });
  });

  describe("Refresh", () => {
    it("should refresh conversation list", async () => {
      const { result } = renderHook(() =>
        useConversations({ userId: "user-1", autoFetch: true }),
      );

      await waitFor(() => {
        expect(result.current.conversations).toHaveLength(2);
      });

      await act(async () => {
        await result.current.refresh();
      });

      expect(mockConversationAPI.list).toHaveBeenCalledTimes(2);
    });
  });
});
