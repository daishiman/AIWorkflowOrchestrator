/**
 * MessageList Component Tests
 *
 * TDD Red Phase: Tests for message list molecule component.
 *
 * @module @repo/desktop/renderer/components/conversation/__tests__/MessageList
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MessageList } from "../MessageList";
import type { Message } from "../../../../shared/types/conversation";

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
  {
    id: "msg-3",
    sessionId: "conv-1",
    role: "user",
    content: "Tell me about AI.",
    messageIndex: 2,
    timestamp: "2026-01-24T10:00:02Z",
    attachments: [],
    metadata: {},
  },
];

describe("MessageList", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("Rendering", () => {
    it("should render message list container", () => {
      render(<MessageList messages={mockMessages} />);

      expect(screen.getByRole("log")).toBeInTheDocument();
    });

    it("should render all messages", () => {
      render(<MessageList messages={mockMessages} />);

      expect(screen.getByText("Hello!")).toBeInTheDocument();
      expect(
        screen.getByText("Hi there! How can I help you?"),
      ).toBeInTheDocument();
      expect(screen.getByText("Tell me about AI.")).toBeInTheDocument();
    });

    it("should render messages in correct order", () => {
      render(<MessageList messages={mockMessages} />);

      const messageElements = screen.getAllByTestId(/^message-/);
      expect(messageElements).toHaveLength(3);
      expect(messageElements[0]).toHaveTextContent("Hello!");
      expect(messageElements[1]).toHaveTextContent(
        "Hi there! How can I help you?",
      );
      expect(messageElements[2]).toHaveTextContent("Tell me about AI.");
    });

    it("should render user messages with user styling", () => {
      render(<MessageList messages={mockMessages} />);

      const userMessages = screen.getAllByTestId("message-user");
      expect(userMessages).toHaveLength(2);
    });

    it("should render assistant messages with assistant styling", () => {
      render(<MessageList messages={mockMessages} />);

      const assistantMessages = screen.getAllByTestId("message-assistant");
      expect(assistantMessages).toHaveLength(1);
    });
  });

  describe("Empty State", () => {
    it("should show empty state when no messages", () => {
      render(<MessageList messages={[]} />);

      expect(
        screen.getByText(/メッセージがありません|no messages/i),
      ).toBeInTheDocument();
    });

    it("should render custom empty state component", () => {
      const CustomEmpty = () => <div>カスタム空状態</div>;

      render(<MessageList messages={[]} emptyComponent={<CustomEmpty />} />);

      expect(screen.getByText("カスタム空状態")).toBeInTheDocument();
    });
  });

  describe("Loading State", () => {
    it("should show loading skeleton when isLoading is true", () => {
      render(<MessageList messages={[]} isLoading={true} />);

      expect(
        screen.getByTestId("message-loading-skeleton"),
      ).toBeInTheDocument();
    });

    it("should show loading indicator for streaming message", () => {
      render(<MessageList messages={mockMessages} isStreaming={true} />);

      expect(screen.getByTestId("streaming-indicator")).toBeInTheDocument();
    });
  });

  describe("Auto Scroll", () => {
    it("should scroll to bottom when new message is added", async () => {
      const scrollIntoViewMock = vi.fn();
      Element.prototype.scrollIntoView = scrollIntoViewMock;

      const { rerender } = render(<MessageList messages={mockMessages} />);

      const newMessages = [
        ...mockMessages,
        {
          id: "msg-4",
          sessionId: "conv-1",
          role: "assistant" as const,
          content: "New message!",
          messageIndex: 3,
          timestamp: "2026-01-24T10:00:03Z",
          attachments: [],
          metadata: {},
        },
      ];

      rerender(<MessageList messages={newMessages} />);

      await waitFor(() => {
        expect(scrollIntoViewMock).toHaveBeenCalled();
      });
    });

    it("should not auto-scroll when user has scrolled up", () => {
      const scrollIntoViewMock = vi.fn();
      Element.prototype.scrollIntoView = scrollIntoViewMock;

      render(<MessageList messages={mockMessages} autoScroll={false} />);

      expect(scrollIntoViewMock).not.toHaveBeenCalled();
    });
  });

  describe("Virtualization", () => {
    it("should virtualize when message count exceeds threshold", () => {
      const manyMessages: Message[] = Array.from({ length: 100 }, (_, i) => ({
        id: `msg-${i}`,
        sessionId: "conv-1",
        role: i % 2 === 0 ? ("user" as const) : ("assistant" as const),
        content: `Message ${i}`,
        messageIndex: i,
        timestamp: new Date().toISOString(),
        attachments: [],
        metadata: {},
      }));

      render(<MessageList messages={manyMessages} virtualize={true} />);

      // With virtualization, not all items should be rendered
      const visibleMessages = screen.queryAllByTestId(/^message-/);
      expect(visibleMessages.length).toBeLessThan(100);
    });
  });

  describe("Accessibility", () => {
    it("should have correct ARIA role", () => {
      render(<MessageList messages={mockMessages} />);

      expect(screen.getByRole("log")).toBeInTheDocument();
    });

    it("should have aria-live attribute for new messages", () => {
      render(<MessageList messages={mockMessages} />);

      const messageList = screen.getByRole("log");
      expect(messageList).toHaveAttribute("aria-live", "polite");
    });

    it("should have accessible label", () => {
      render(<MessageList messages={mockMessages} />);

      const messageList = screen.getByRole("log");
      expect(messageList).toHaveAccessibleName();
    });

    it("should support keyboard navigation between messages", () => {
      render(<MessageList messages={mockMessages} />);

      const messageList = screen.getByRole("log");
      messageList.focus();

      // Verify the list handles keyboard events
      fireEvent.keyDown(messageList, { key: "ArrowDown" });
      // After pressing down, focus should move to the first message bubble
      const bubbles = screen.getAllByTestId("bubble");
      expect(bubbles[0]).toHaveFocus();
    });
  });

  describe("Error Display", () => {
    it("should display error message when error prop is provided", () => {
      render(
        <MessageList messages={mockMessages} error="Failed to load messages" />,
      );

      expect(screen.getByText("Failed to load messages")).toBeInTheDocument();
    });
  });

  describe("Timestamp Display", () => {
    it("should show timestamps when showTimestamps is true", () => {
      render(<MessageList messages={mockMessages} showTimestamps={true} />);

      // Check for time display
      expect(screen.getAllByTestId("message-timestamp")).toHaveLength(3);
    });

    it("should hide timestamps when showTimestamps is false", () => {
      render(<MessageList messages={mockMessages} showTimestamps={false} />);

      expect(screen.queryByTestId("message-timestamp")).not.toBeInTheDocument();
    });
  });

  describe("Message Grouping", () => {
    it("should group consecutive messages from same role", () => {
      const groupedMessages: Message[] = [
        { ...mockMessages[0] },
        {
          ...mockMessages[0],
          id: "msg-1b",
          content: "Another user message",
          messageIndex: 1,
        },
        { ...mockMessages[1], messageIndex: 2 },
      ];

      render(<MessageList messages={groupedMessages} groupMessages={true} />);

      const messageGroups = screen.getAllByTestId("message-group");
      expect(messageGroups).toHaveLength(2); // Two groups: user, assistant
    });
  });
});
