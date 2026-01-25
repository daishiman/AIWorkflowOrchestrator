/**
 * ConversationDetailView Component Tests
 *
 * TDD Red Phase: Tests for conversation detail view organism component.
 *
 * @module @repo/desktop/renderer/components/conversation/__tests__/ConversationDetailView
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { ConversationDetailView } from "../ConversationDetailView";
import type {
  Conversation,
  Message,
} from "../../../../shared/types/conversation";

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

describe("ConversationDetailView", () => {
  const mockOnSendMessage = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("Rendering", () => {
    it("should render the detail view with correct structure", () => {
      render(
        <ConversationDetailView
          conversation={mockConversation}
          messages={mockMessages}
          isLoading={false}
          onSendMessage={mockOnSendMessage}
        />,
      );

      expect(screen.getByRole("main")).toBeInTheDocument();
    });

    it("should render conversation header", () => {
      render(
        <ConversationDetailView
          conversation={mockConversation}
          messages={mockMessages}
          isLoading={false}
          onSendMessage={mockOnSendMessage}
        />,
      );

      expect(screen.getByText("Test Conversation")).toBeInTheDocument();
    });

    it("should render message list", () => {
      render(
        <ConversationDetailView
          conversation={mockConversation}
          messages={mockMessages}
          isLoading={false}
          onSendMessage={mockOnSendMessage}
        />,
      );

      expect(screen.getByText("Hello!")).toBeInTheDocument();
      expect(
        screen.getByText("Hi there! How can I help you?"),
      ).toBeInTheDocument();
    });

    it("should render message input", () => {
      render(
        <ConversationDetailView
          conversation={mockConversation}
          messages={mockMessages}
          isLoading={false}
          onSendMessage={mockOnSendMessage}
        />,
      );

      expect(
        screen.getByPlaceholderText(/メッセージ|message/i),
      ).toBeInTheDocument();
    });
  });

  describe("Loading State", () => {
    it("should show loading skeleton when isLoading is true", () => {
      render(
        <ConversationDetailView
          conversation={null}
          messages={[]}
          isLoading={true}
          onSendMessage={mockOnSendMessage}
        />,
      );

      expect(screen.getByTestId("loading-skeleton")).toBeInTheDocument();
    });

    it("should hide loading skeleton when isLoading is false", () => {
      render(
        <ConversationDetailView
          conversation={mockConversation}
          messages={mockMessages}
          isLoading={false}
          onSendMessage={mockOnSendMessage}
        />,
      );

      expect(screen.queryByTestId("loading-skeleton")).not.toBeInTheDocument();
    });
  });

  describe("Empty State", () => {
    it("should show empty state when no conversation is selected", () => {
      render(
        <ConversationDetailView
          conversation={null}
          messages={[]}
          isLoading={false}
          onSendMessage={mockOnSendMessage}
        />,
      );

      expect(
        screen.getByText(/会話を選択|select a conversation/i),
      ).toBeInTheDocument();
    });

    it("should show empty message state when conversation has no messages", () => {
      const emptyConversation: Conversation = {
        ...mockConversation,
        messages: [],
        messageCount: 0,
      };

      render(
        <ConversationDetailView
          conversation={emptyConversation}
          messages={[]}
          isLoading={false}
          onSendMessage={mockOnSendMessage}
        />,
      );

      expect(
        screen.getByText(/メッセージがありません|no messages/i),
      ).toBeInTheDocument();
    });
  });

  describe("Error State", () => {
    it("should display error message when error prop is provided", () => {
      render(
        <ConversationDetailView
          conversation={mockConversation}
          messages={mockMessages}
          isLoading={false}
          error="Failed to load messages"
          onSendMessage={mockOnSendMessage}
        />,
      );

      expect(screen.getByText("Failed to load messages")).toBeInTheDocument();
    });

    it("should show retry button when error occurs", () => {
      const mockOnRetry = vi.fn();

      render(
        <ConversationDetailView
          conversation={mockConversation}
          messages={mockMessages}
          isLoading={false}
          error="Failed to load messages"
          onSendMessage={mockOnSendMessage}
          onRetry={mockOnRetry}
        />,
      );

      expect(
        screen.getByRole("button", { name: /再試行|retry/i }),
      ).toBeInTheDocument();
    });
  });

  describe("Sending State", () => {
    it("should disable input when isSending is true", () => {
      render(
        <ConversationDetailView
          conversation={mockConversation}
          messages={mockMessages}
          isLoading={false}
          isSending={true}
          onSendMessage={mockOnSendMessage}
        />,
      );

      expect(screen.getByPlaceholderText(/メッセージ|message/i)).toBeDisabled();
    });

    it("should show sending indicator when isSending is true", () => {
      render(
        <ConversationDetailView
          conversation={mockConversation}
          messages={mockMessages}
          isLoading={false}
          isSending={true}
          onSendMessage={mockOnSendMessage}
        />,
      );

      expect(screen.getByTestId("sending-indicator")).toBeInTheDocument();
    });
  });

  describe("Accessibility", () => {
    it("should have correct landmark roles", () => {
      render(
        <ConversationDetailView
          conversation={mockConversation}
          messages={mockMessages}
          isLoading={false}
          onSendMessage={mockOnSendMessage}
        />,
      );

      expect(screen.getByRole("main")).toBeInTheDocument();
      expect(screen.getByRole("log")).toBeInTheDocument(); // Message list
    });

    it("should have accessible heading", () => {
      render(
        <ConversationDetailView
          conversation={mockConversation}
          messages={mockMessages}
          isLoading={false}
          onSendMessage={mockOnSendMessage}
        />,
      );

      expect(screen.getByRole("heading")).toHaveTextContent(
        "Test Conversation",
      );
    });

    it("should announce new messages to screen readers", () => {
      render(
        <ConversationDetailView
          conversation={mockConversation}
          messages={mockMessages}
          isLoading={false}
          onSendMessage={mockOnSendMessage}
        />,
      );

      const messageList = screen.getByRole("log");
      expect(messageList).toHaveAttribute("aria-live", "polite");
    });
  });

  describe("Layout", () => {
    it("should have sticky header", () => {
      render(
        <ConversationDetailView
          conversation={mockConversation}
          messages={mockMessages}
          isLoading={false}
          onSendMessage={mockOnSendMessage}
        />,
      );

      const header = screen.getByTestId("conversation-header");
      expect(header).toHaveClass("sticky");
    });

    it("should have sticky input at bottom", () => {
      render(
        <ConversationDetailView
          conversation={mockConversation}
          messages={mockMessages}
          isLoading={false}
          onSendMessage={mockOnSendMessage}
        />,
      );

      const input = screen.getByTestId("message-input-container");
      expect(input).toHaveClass("sticky");
    });
  });
});
