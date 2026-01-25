/**
 * ConversationListPanel Component Tests
 *
 * TDD Red Phase: Tests for conversation list panel organism component.
 *
 * @module @repo/desktop/renderer/components/conversation/__tests__/ConversationListPanel
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { ConversationListPanel } from "../ConversationListPanel";
import type { ConversationSummary } from "../../../../shared/types/conversation";

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
    isPinned: true,
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

describe("ConversationListPanel", () => {
  const mockOnSelect = vi.fn();
  const mockOnCreate = vi.fn();
  const mockOnSearch = vi.fn();
  const mockOnLoadMore = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("Rendering", () => {
    it("should render the panel with correct structure", () => {
      render(
        <ConversationListPanel
          conversations={mockConversations}
          selectedId={null}
          isLoading={false}
          onSelect={mockOnSelect}
          onCreateNew={mockOnCreate}
        />,
      );

      expect(screen.getByRole("navigation")).toBeInTheDocument();
    });

    it("should render conversation list", () => {
      render(
        <ConversationListPanel
          conversations={mockConversations}
          selectedId={null}
          isLoading={false}
          onSelect={mockOnSelect}
          onCreateNew={mockOnCreate}
        />,
      );

      expect(screen.getByText("Test Conversation 1")).toBeInTheDocument();
      expect(screen.getByText("Test Conversation 2")).toBeInTheDocument();
    });

    it("should render search input", () => {
      render(
        <ConversationListPanel
          conversations={mockConversations}
          selectedId={null}
          isLoading={false}
          onSelect={mockOnSelect}
          onCreateNew={mockOnCreate}
          onSearch={mockOnSearch}
        />,
      );

      expect(screen.getByPlaceholderText(/検索|search/i)).toBeInTheDocument();
    });

    it("should render new conversation button", () => {
      render(
        <ConversationListPanel
          conversations={mockConversations}
          selectedId={null}
          isLoading={false}
          onSelect={mockOnSelect}
          onCreateNew={mockOnCreate}
        />,
      );

      expect(
        screen.getByRole("button", { name: /新規|new/i }),
      ).toBeInTheDocument();
    });

    it("should render empty state when no conversations", () => {
      render(
        <ConversationListPanel
          conversations={[]}
          selectedId={null}
          isLoading={false}
          onSelect={mockOnSelect}
          onCreateNew={mockOnCreate}
        />,
      );

      expect(
        screen.getByText(/会話がありません|no conversations/i),
      ).toBeInTheDocument();
    });
  });

  describe("Loading State", () => {
    it("should show loading skeleton when isLoading is true", () => {
      render(
        <ConversationListPanel
          conversations={[]}
          selectedId={null}
          isLoading={true}
          onSelect={mockOnSelect}
          onCreateNew={mockOnCreate}
        />,
      );

      expect(screen.getByTestId("loading-skeleton")).toBeInTheDocument();
    });

    it("should hide loading skeleton when isLoading is false", () => {
      render(
        <ConversationListPanel
          conversations={mockConversations}
          selectedId={null}
          isLoading={false}
          onSelect={mockOnSelect}
          onCreateNew={mockOnCreate}
        />,
      );

      expect(screen.queryByTestId("loading-skeleton")).not.toBeInTheDocument();
    });
  });

  describe("Selection", () => {
    it("should highlight selected conversation", () => {
      render(
        <ConversationListPanel
          conversations={mockConversations}
          selectedId="conv-1"
          isLoading={false}
          onSelect={mockOnSelect}
          onCreateNew={mockOnCreate}
        />,
      );

      const selectedItem = screen
        .getByText("Test Conversation 1")
        .closest("li");
      expect(selectedItem).toHaveAttribute("aria-selected", "true");
    });

    it("should call onSelect when conversation is clicked", () => {
      render(
        <ConversationListPanel
          conversations={mockConversations}
          selectedId={null}
          isLoading={false}
          onSelect={mockOnSelect}
          onCreateNew={mockOnCreate}
        />,
      );

      fireEvent.click(screen.getByText("Test Conversation 1"));
      expect(mockOnSelect).toHaveBeenCalledWith("conv-1");
    });
  });

  describe("Create New", () => {
    it("should call onCreateNew when new button is clicked", () => {
      render(
        <ConversationListPanel
          conversations={mockConversations}
          selectedId={null}
          isLoading={false}
          onSelect={mockOnSelect}
          onCreateNew={mockOnCreate}
        />,
      );

      fireEvent.click(screen.getByRole("button", { name: /新規|new/i }));
      expect(mockOnCreate).toHaveBeenCalled();
    });
  });

  describe("Search", () => {
    it("should call onSearch when search input changes", async () => {
      render(
        <ConversationListPanel
          conversations={mockConversations}
          selectedId={null}
          isLoading={false}
          onSelect={mockOnSelect}
          onCreateNew={mockOnCreate}
          onSearch={mockOnSearch}
        />,
      );

      const searchInput = screen.getByPlaceholderText(/検索|search/i);
      fireEvent.change(searchInput, { target: { value: "test" } });

      await waitFor(() => {
        expect(mockOnSearch).toHaveBeenCalledWith("test");
      });
    });
  });

  describe("Load More", () => {
    it("should show load more button when hasMore is true", () => {
      render(
        <ConversationListPanel
          conversations={mockConversations}
          selectedId={null}
          isLoading={false}
          hasMore={true}
          onSelect={mockOnSelect}
          onCreateNew={mockOnCreate}
          onLoadMore={mockOnLoadMore}
        />,
      );

      expect(
        screen.getByRole("button", { name: /もっと見る|load more/i }),
      ).toBeInTheDocument();
    });

    it("should call onLoadMore when load more button is clicked", () => {
      render(
        <ConversationListPanel
          conversations={mockConversations}
          selectedId={null}
          isLoading={false}
          hasMore={true}
          onSelect={mockOnSelect}
          onCreateNew={mockOnCreate}
          onLoadMore={mockOnLoadMore}
        />,
      );

      fireEvent.click(
        screen.getByRole("button", { name: /もっと見る|load more/i }),
      );
      expect(mockOnLoadMore).toHaveBeenCalled();
    });

    it("should hide load more button when hasMore is false", () => {
      render(
        <ConversationListPanel
          conversations={mockConversations}
          selectedId={null}
          isLoading={false}
          hasMore={false}
          onSelect={mockOnSelect}
          onCreateNew={mockOnCreate}
          onLoadMore={mockOnLoadMore}
        />,
      );

      expect(
        screen.queryByRole("button", { name: /もっと見る|load more/i }),
      ).not.toBeInTheDocument();
    });
  });

  describe("Accessibility", () => {
    it("should have correct ARIA attributes on list", () => {
      render(
        <ConversationListPanel
          conversations={mockConversations}
          selectedId={null}
          isLoading={false}
          onSelect={mockOnSelect}
          onCreateNew={mockOnCreate}
        />,
      );

      const list = screen.getByRole("listbox");
      expect(list).toHaveAttribute("aria-label");
    });

    it("should support keyboard navigation", () => {
      render(
        <ConversationListPanel
          conversations={mockConversations}
          selectedId="conv-1"
          isLoading={false}
          onSelect={mockOnSelect}
          onCreateNew={mockOnCreate}
        />,
      );

      const list = screen.getByRole("listbox");
      fireEvent.keyDown(list, { key: "ArrowDown" });

      expect(mockOnSelect).toHaveBeenCalledWith("conv-2");
    });
  });

  describe("Pinned Conversations", () => {
    it("should display pinned conversations first", () => {
      render(
        <ConversationListPanel
          conversations={mockConversations}
          selectedId={null}
          isLoading={false}
          onSelect={mockOnSelect}
          onCreateNew={mockOnCreate}
        />,
      );

      const items = screen.getAllByRole("option");
      // conv-1 is pinned, should be first
      expect(items[0]).toHaveTextContent("Test Conversation 1");
    });
  });
});
