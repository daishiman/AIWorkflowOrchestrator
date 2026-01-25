/**
 * ConversationHeader Component Tests
 *
 * TDD Red Phase: Tests for conversation header molecule component.
 *
 * @module @repo/desktop/renderer/components/conversation/__tests__/ConversationHeader
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { ConversationHeader } from "../ConversationHeader";
import type { Conversation } from "../../../../shared/types/conversation";

// Mock data
const mockConversation: Conversation = {
  id: "conv-1",
  userId: "user-1",
  title: "Test Conversation",
  createdAt: "2026-01-24T10:00:00Z",
  updatedAt: "2026-01-24T10:00:00Z",
  messageCount: 5,
  isFavorite: false,
  isPinned: false,
  pinOrder: null,
  lastMessagePreview: "Hello!",
  metadata: {},
  messages: [],
};

describe("ConversationHeader", () => {
  const mockOnTitleUpdate = vi.fn();
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
        <ConversationHeader
          conversation={mockConversation}
          onTitleUpdate={mockOnTitleUpdate}
        />,
      );

      expect(screen.getByText("Test Conversation")).toBeInTheDocument();
    });

    it("should render as heading", () => {
      render(
        <ConversationHeader
          conversation={mockConversation}
          onTitleUpdate={mockOnTitleUpdate}
        />,
      );

      expect(screen.getByRole("heading", { level: 1 })).toBeInTheDocument();
    });

    it("should render message count", () => {
      render(
        <ConversationHeader
          conversation={mockConversation}
          onTitleUpdate={mockOnTitleUpdate}
        />,
      );

      expect(screen.getByText(/5/)).toBeInTheDocument();
    });

    it("should render action buttons", () => {
      render(
        <ConversationHeader
          conversation={mockConversation}
          onTitleUpdate={mockOnTitleUpdate}
          onFavoriteToggle={mockOnFavoriteToggle}
          onPinToggle={mockOnPinToggle}
          onDelete={mockOnDelete}
        />,
      );

      expect(
        screen.getByRole("button", { name: /お気に入り|favorite/i }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /ピン|pin/i }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /削除|delete/i }),
      ).toBeInTheDocument();
    });
  });

  describe("Title Editing", () => {
    it("should enable edit mode when title is clicked", async () => {
      render(
        <ConversationHeader
          conversation={mockConversation}
          onTitleUpdate={mockOnTitleUpdate}
          isEditable={true}
        />,
      );

      fireEvent.click(screen.getByText("Test Conversation"));

      await waitFor(() => {
        expect(screen.getByRole("textbox")).toBeInTheDocument();
      });
    });

    it("should show input with current title in edit mode", async () => {
      render(
        <ConversationHeader
          conversation={mockConversation}
          onTitleUpdate={mockOnTitleUpdate}
          isEditable={true}
        />,
      );

      fireEvent.click(screen.getByText("Test Conversation"));

      await waitFor(() => {
        expect(screen.getByRole("textbox")).toHaveValue("Test Conversation");
      });
    });

    it("should call onTitleUpdate when editing is completed", async () => {
      render(
        <ConversationHeader
          conversation={mockConversation}
          onTitleUpdate={mockOnTitleUpdate}
          isEditable={true}
        />,
      );

      fireEvent.click(screen.getByText("Test Conversation"));

      const input = screen.getByRole("textbox");
      fireEvent.change(input, { target: { value: "Updated Title" } });
      fireEvent.blur(input);

      await waitFor(() => {
        expect(mockOnTitleUpdate).toHaveBeenCalledWith("Updated Title");
      });
    });

    it("should save on Enter key press", async () => {
      render(
        <ConversationHeader
          conversation={mockConversation}
          onTitleUpdate={mockOnTitleUpdate}
          isEditable={true}
        />,
      );

      fireEvent.click(screen.getByText("Test Conversation"));

      const input = screen.getByRole("textbox");
      fireEvent.change(input, { target: { value: "Updated Title" } });
      fireEvent.keyDown(input, { key: "Enter" });

      expect(mockOnTitleUpdate).toHaveBeenCalledWith("Updated Title");
    });

    it("should cancel edit on Escape key press", async () => {
      render(
        <ConversationHeader
          conversation={mockConversation}
          onTitleUpdate={mockOnTitleUpdate}
          isEditable={true}
        />,
      );

      fireEvent.click(screen.getByText("Test Conversation"));

      const input = screen.getByRole("textbox");
      fireEvent.change(input, { target: { value: "Updated Title" } });
      fireEvent.keyDown(input, { key: "Escape" });

      await waitFor(() => {
        expect(screen.getByText("Test Conversation")).toBeInTheDocument();
      });
      expect(mockOnTitleUpdate).not.toHaveBeenCalled();
    });

    it("should not enable edit mode when isEditable is false", () => {
      render(
        <ConversationHeader
          conversation={mockConversation}
          onTitleUpdate={mockOnTitleUpdate}
          isEditable={false}
        />,
      );

      fireEvent.click(screen.getByText("Test Conversation"));

      expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
    });
  });

  describe("Action Buttons", () => {
    it("should call onFavoriteToggle when favorite button is clicked", () => {
      render(
        <ConversationHeader
          conversation={mockConversation}
          onTitleUpdate={mockOnTitleUpdate}
          onFavoriteToggle={mockOnFavoriteToggle}
        />,
      );

      fireEvent.click(
        screen.getByRole("button", { name: /お気に入り|favorite/i }),
      );
      expect(mockOnFavoriteToggle).toHaveBeenCalled();
    });

    it("should call onPinToggle when pin button is clicked", () => {
      render(
        <ConversationHeader
          conversation={mockConversation}
          onTitleUpdate={mockOnTitleUpdate}
          onPinToggle={mockOnPinToggle}
        />,
      );

      fireEvent.click(screen.getByRole("button", { name: /ピン|pin/i }));
      expect(mockOnPinToggle).toHaveBeenCalled();
    });

    it("should call onDelete when delete button is clicked", () => {
      render(
        <ConversationHeader
          conversation={mockConversation}
          onTitleUpdate={mockOnTitleUpdate}
          onDelete={mockOnDelete}
        />,
      );

      fireEvent.click(screen.getByRole("button", { name: /削除|delete/i }));
      expect(mockOnDelete).toHaveBeenCalled();
    });

    it("should show active state for favorite when isFavorite is true", () => {
      const favoriteConversation = { ...mockConversation, isFavorite: true };

      render(
        <ConversationHeader
          conversation={favoriteConversation}
          onTitleUpdate={mockOnTitleUpdate}
          onFavoriteToggle={mockOnFavoriteToggle}
        />,
      );

      const favoriteButton = screen.getByRole("button", {
        name: /お気に入り|favorite/i,
      });
      expect(favoriteButton).toHaveAttribute("aria-pressed", "true");
    });

    it("should show active state for pin when isPinned is true", () => {
      const pinnedConversation = { ...mockConversation, isPinned: true };

      render(
        <ConversationHeader
          conversation={pinnedConversation}
          onTitleUpdate={mockOnTitleUpdate}
          onPinToggle={mockOnPinToggle}
        />,
      );

      const pinButton = screen.getByRole("button", { name: /ピン|pin/i });
      expect(pinButton).toHaveAttribute("aria-pressed", "true");
    });
  });

  describe("Accessibility", () => {
    it("should have correct heading level", () => {
      render(
        <ConversationHeader
          conversation={mockConversation}
          onTitleUpdate={mockOnTitleUpdate}
        />,
      );

      expect(screen.getByRole("heading", { level: 1 })).toBeInTheDocument();
    });

    it("should have accessible button labels", () => {
      render(
        <ConversationHeader
          conversation={mockConversation}
          onTitleUpdate={mockOnTitleUpdate}
          onFavoriteToggle={mockOnFavoriteToggle}
          onPinToggle={mockOnPinToggle}
          onDelete={mockOnDelete}
        />,
      );

      expect(
        screen.getByRole("button", { name: /お気に入り|favorite/i }),
      ).toHaveAccessibleName();
      expect(
        screen.getByRole("button", { name: /ピン|pin/i }),
      ).toHaveAccessibleName();
      expect(
        screen.getByRole("button", { name: /削除|delete/i }),
      ).toHaveAccessibleName();
    });

    it("should focus input when entering edit mode", async () => {
      render(
        <ConversationHeader
          conversation={mockConversation}
          onTitleUpdate={mockOnTitleUpdate}
          isEditable={true}
        />,
      );

      fireEvent.click(screen.getByText("Test Conversation"));

      await waitFor(() => {
        expect(screen.getByRole("textbox")).toHaveFocus();
      });
    });
  });

  describe("Loading State", () => {
    it("should disable buttons when isUpdating is true", () => {
      render(
        <ConversationHeader
          conversation={mockConversation}
          onTitleUpdate={mockOnTitleUpdate}
          onFavoriteToggle={mockOnFavoriteToggle}
          isUpdating={true}
        />,
      );

      expect(
        screen.getByRole("button", { name: /お気に入り|favorite/i }),
      ).toBeDisabled();
    });

    it("should show loading indicator when isUpdating is true", () => {
      render(
        <ConversationHeader
          conversation={mockConversation}
          onTitleUpdate={mockOnTitleUpdate}
          isUpdating={true}
        />,
      );

      expect(screen.getByTestId("updating-indicator")).toBeInTheDocument();
    });
  });
});
