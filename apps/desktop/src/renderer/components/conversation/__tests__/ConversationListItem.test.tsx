/**
 * ConversationListItem Component Tests
 *
 * TDD Red Phase: Tests for conversation list item molecule component.
 *
 * @module @repo/desktop/renderer/components/conversation/__tests__/ConversationListItem
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ConversationListItem } from "../ConversationListItem";
import type { ConversationSummary } from "../../../../shared/types/conversation";

// Mock data
const mockConversation: ConversationSummary = {
  id: "conv-1",
  title: "Test Conversation",
  createdAt: "2026-01-24T10:00:00Z",
  updatedAt: "2026-01-24T10:30:00Z",
  messageCount: 5,
  lastMessagePreview: "Hello, this is a preview message...",
  isFavorite: false,
  isPinned: false,
};

const mockFavoriteConversation: ConversationSummary = {
  ...mockConversation,
  id: "conv-2",
  isFavorite: true,
};

const mockPinnedConversation: ConversationSummary = {
  ...mockConversation,
  id: "conv-3",
  isPinned: true,
};

describe("ConversationListItem", () => {
  const mockOnClick = vi.fn();
  const mockOnFavoriteToggle = vi.fn();
  const mockOnPinToggle = vi.fn();
  const mockOnDelete = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("Rendering", () => {
    it("should render conversation title", () => {
      render(
        <ConversationListItem
          conversation={mockConversation}
          isSelected={false}
          onClick={mockOnClick}
        />,
      );

      expect(screen.getByText("Test Conversation")).toBeInTheDocument();
    });

    it("should render last message preview", () => {
      render(
        <ConversationListItem
          conversation={mockConversation}
          isSelected={false}
          onClick={mockOnClick}
        />,
      );

      expect(
        screen.getByText("Hello, this is a preview message..."),
      ).toBeInTheDocument();
    });

    it("should render message count", () => {
      render(
        <ConversationListItem
          conversation={mockConversation}
          isSelected={false}
          onClick={mockOnClick}
        />,
      );

      expect(screen.getByText("5")).toBeInTheDocument();
    });

    it("should render formatted date", () => {
      render(
        <ConversationListItem
          conversation={mockConversation}
          isSelected={false}
          onClick={mockOnClick}
        />,
      );

      // Should display relative time or formatted date
      expect(screen.getByText(/2026|今日|yesterday/i)).toBeInTheDocument();
    });

    it("should render favorite indicator when isFavorite is true", () => {
      render(
        <ConversationListItem
          conversation={mockFavoriteConversation}
          isSelected={false}
          onClick={mockOnClick}
        />,
      );

      expect(screen.getByTestId("favorite-indicator")).toBeInTheDocument();
    });

    it("should render pin indicator when isPinned is true", () => {
      render(
        <ConversationListItem
          conversation={mockPinnedConversation}
          isSelected={false}
          onClick={mockOnClick}
        />,
      );

      expect(screen.getByTestId("pin-indicator")).toBeInTheDocument();
    });

    it("should not render favorite indicator when isFavorite is false", () => {
      render(
        <ConversationListItem
          conversation={mockConversation}
          isSelected={false}
          onClick={mockOnClick}
        />,
      );

      expect(
        screen.queryByTestId("favorite-indicator"),
      ).not.toBeInTheDocument();
    });
  });

  describe("Selection State", () => {
    it("should apply selected styles when isSelected is true", () => {
      render(
        <ConversationListItem
          conversation={mockConversation}
          isSelected={true}
          onClick={mockOnClick}
        />,
      );

      const item = screen.getByRole("option");
      expect(item).toHaveAttribute("aria-selected", "true");
    });

    it("should not apply selected styles when isSelected is false", () => {
      render(
        <ConversationListItem
          conversation={mockConversation}
          isSelected={false}
          onClick={mockOnClick}
        />,
      );

      const item = screen.getByRole("option");
      expect(item).toHaveAttribute("aria-selected", "false");
    });
  });

  describe("Interactions", () => {
    it("should call onClick when item is clicked", () => {
      render(
        <ConversationListItem
          conversation={mockConversation}
          isSelected={false}
          onClick={mockOnClick}
        />,
      );

      fireEvent.click(screen.getByRole("option"));
      expect(mockOnClick).toHaveBeenCalledWith("conv-1");
    });

    it("should call onClick when Enter key is pressed", () => {
      render(
        <ConversationListItem
          conversation={mockConversation}
          isSelected={false}
          onClick={mockOnClick}
        />,
      );

      fireEvent.keyDown(screen.getByRole("option"), { key: "Enter" });
      expect(mockOnClick).toHaveBeenCalledWith("conv-1");
    });

    it("should call onFavoriteToggle when favorite button is clicked", () => {
      render(
        <ConversationListItem
          conversation={mockConversation}
          isSelected={false}
          onClick={mockOnClick}
          onFavoriteToggle={mockOnFavoriteToggle}
        />,
      );

      const favoriteButton = screen.getByRole("button", {
        name: /お気に入り|favorite/i,
      });
      fireEvent.click(favoriteButton);
      expect(mockOnFavoriteToggle).toHaveBeenCalledWith("conv-1");
    });

    it("should call onPinToggle when pin button is clicked", () => {
      render(
        <ConversationListItem
          conversation={mockConversation}
          isSelected={false}
          onClick={mockOnClick}
          onPinToggle={mockOnPinToggle}
        />,
      );

      const pinButton = screen.getByRole("button", { name: /ピン|pin/i });
      fireEvent.click(pinButton);
      expect(mockOnPinToggle).toHaveBeenCalledWith("conv-1");
    });

    it("should call onDelete when delete button is clicked", () => {
      render(
        <ConversationListItem
          conversation={mockConversation}
          isSelected={false}
          onClick={mockOnClick}
          onDelete={mockOnDelete}
        />,
      );

      const deleteButton = screen.getByRole("button", { name: /削除|delete/i });
      fireEvent.click(deleteButton);
      expect(mockOnDelete).toHaveBeenCalledWith("conv-1");
    });

    it("should stop propagation when action buttons are clicked", () => {
      render(
        <ConversationListItem
          conversation={mockConversation}
          isSelected={false}
          onClick={mockOnClick}
          onDelete={mockOnDelete}
        />,
      );

      const deleteButton = screen.getByRole("button", { name: /削除|delete/i });
      fireEvent.click(deleteButton);

      // onClick should NOT be called when delete button is clicked
      expect(mockOnClick).not.toHaveBeenCalled();
    });
  });

  describe("Accessibility", () => {
    it("should have correct role", () => {
      render(
        <ConversationListItem
          conversation={mockConversation}
          isSelected={false}
          onClick={mockOnClick}
        />,
      );

      expect(screen.getByRole("option")).toBeInTheDocument();
    });

    it("should be focusable", () => {
      render(
        <ConversationListItem
          conversation={mockConversation}
          isSelected={false}
          onClick={mockOnClick}
        />,
      );

      const item = screen.getByRole("option");
      expect(item).toHaveAttribute("tabIndex", "0");
    });

    it("should have accessible label", () => {
      render(
        <ConversationListItem
          conversation={mockConversation}
          isSelected={false}
          onClick={mockOnClick}
        />,
      );

      const item = screen.getByRole("option");
      expect(item).toHaveAccessibleName();
    });
  });

  describe("Empty State", () => {
    it("should handle null lastMessagePreview", () => {
      const conversationWithoutPreview: ConversationSummary = {
        ...mockConversation,
        lastMessagePreview: null,
      };

      render(
        <ConversationListItem
          conversation={conversationWithoutPreview}
          isSelected={false}
          onClick={mockOnClick}
        />,
      );

      expect(screen.getByText("Test Conversation")).toBeInTheDocument();
    });
  });
});
