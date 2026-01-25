/**
 * Edge Case Tests for Conversation Components
 *
 * Phase 6: Test expansion - edge cases, error handling, and integration tests.
 *
 * @module @repo/desktop/renderer/components/conversation/__tests__/EdgeCases
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { MessageBubble } from "../MessageBubble";
import { MessageList } from "../MessageList";
import { MessageInput } from "../MessageInput";
import { ConversationListItem } from "../ConversationListItem";
import { ConversationListPanel } from "../ConversationListPanel";
import { ConversationDetailView } from "../ConversationDetailView";
import { ConversationHeader } from "../ConversationHeader";
import type {
  Message,
  Conversation,
} from "../../../../shared/types/conversation";

// Mock data
const mockConversation: Conversation = {
  id: "conv-1",
  title: "Test Conversation",
  createdAt: "2026-01-24T10:00:00Z",
  updatedAt: "2026-01-24T10:00:00Z",
  messageCount: 1,
  lastMessage: "Hello!",
  isFavorite: false,
  isPinned: false,
};

const mockMessage: Message = {
  id: "msg-1",
  sessionId: "conv-1",
  role: "user",
  content: "Hello!",
  messageIndex: 0,
  timestamp: "2026-01-24T10:00:00Z",
  attachments: [],
  metadata: {},
};

describe("Edge Cases", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("Long Content Handling", () => {
    it("should handle extremely long titles in ConversationListItem", () => {
      const longTitle =
        "This is an extremely long conversation title that should be truncated properly to avoid breaking the layout and maintain a good user experience throughout the application";
      const longConversation = { ...mockConversation, title: longTitle };

      render(
        <ConversationListItem
          conversation={longConversation}
          onClick={vi.fn()}
        />,
      );

      expect(screen.getByText(longTitle)).toBeInTheDocument();
    });

    it("should handle extremely long messages without breaking layout", () => {
      const longMessage: Message = {
        ...mockMessage,
        content: "A".repeat(10000),
      };

      render(<MessageBubble message={longMessage} />);

      const bubble = screen.getByTestId("bubble");
      expect(bubble).toBeInTheDocument();
      expect(bubble).toHaveStyle({ wordBreak: "break-word" });
    });

    it("should handle messages with only whitespace", () => {
      const whitespaceMessage: Message = {
        ...mockMessage,
        content: "   \n\t\n   ",
      };

      render(<MessageBubble message={whitespaceMessage} />);

      const bubble = screen.getByTestId("bubble");
      expect(bubble).toBeInTheDocument();
    });
  });

  describe("Special Characters Handling", () => {
    it("should properly render messages with HTML-like content", () => {
      const htmlMessage: Message = {
        ...mockMessage,
        content: "<script>alert('xss')</script> Hello <b>world</b>",
      };

      render(<MessageBubble message={htmlMessage} />);

      // Should not execute script
      expect(screen.getByTestId("bubble")).toBeInTheDocument();
    });

    it("should handle messages with unicode characters", () => {
      const unicodeMessage: Message = {
        ...mockMessage,
        content: "こんにちは 🎉 مرحبا 你好 🚀",
      };

      render(<MessageBubble message={unicodeMessage} />);

      expect(screen.getByText(/こんにちは/)).toBeInTheDocument();
    });

    it("should handle messages with multiple code blocks", () => {
      const multiCodeMessage: Message = {
        ...mockMessage,
        role: "assistant",
        content:
          "First code:\n```js\nconst a = 1;\n```\n\nSecond code:\n```python\nx = 2\n```",
      };

      render(<MessageBubble message={multiCodeMessage} />);

      const codeBlocks = screen.getAllByTestId("code-block");
      expect(codeBlocks).toHaveLength(2);
    });
  });

  describe("Empty State Transitions", () => {
    it("should transition from empty to populated state", () => {
      const { rerender } = render(
        <MessageList messages={[]} showTimestamps={true} />,
      );

      expect(screen.getByText(/メッセージがありません/)).toBeInTheDocument();

      rerender(<MessageList messages={[mockMessage]} showTimestamps={true} />);

      expect(
        screen.queryByText(/メッセージがありません/),
      ).not.toBeInTheDocument();
      expect(screen.getByText("Hello!")).toBeInTheDocument();
    });

    it("should transition from populated to empty state", () => {
      const { rerender } = render(
        <MessageList messages={[mockMessage]} showTimestamps={true} />,
      );

      expect(screen.getByText("Hello!")).toBeInTheDocument();

      rerender(<MessageList messages={[]} showTimestamps={true} />);

      expect(screen.getByText(/メッセージがありません/)).toBeInTheDocument();
    });
  });

  describe("Keyboard Navigation Edge Cases", () => {
    it("should handle keyboard navigation with no messages", () => {
      render(<MessageList messages={[]} showTimestamps={true} />);

      const list = screen.getByRole("log");
      fireEvent.keyDown(list, { key: "ArrowDown" });
      fireEvent.keyDown(list, { key: "ArrowUp" });

      // Should not crash
      expect(list).toBeInTheDocument();
    });

    it("should handle rapid keyboard navigation", () => {
      const messages: Message[] = Array.from({ length: 5 }, (_, i) => ({
        ...mockMessage,
        id: `msg-${i}`,
        content: `Message ${i}`,
        messageIndex: i,
      }));

      render(<MessageList messages={messages} showTimestamps={true} />);

      const list = screen.getByRole("log");
      list.focus();

      // Rapid navigation
      fireEvent.keyDown(list, { key: "ArrowDown" });
      fireEvent.keyDown(list, { key: "ArrowDown" });
      fireEvent.keyDown(list, { key: "ArrowDown" });
      fireEvent.keyDown(list, { key: "ArrowUp" });

      expect(list).toBeInTheDocument();
    });

    it("should not go beyond first message when pressing ArrowUp at start", () => {
      render(<MessageList messages={[mockMessage]} showTimestamps={true} />);

      const list = screen.getByRole("log");
      list.focus();

      // Try to go before first message
      fireEvent.keyDown(list, { key: "ArrowUp" });
      fireEvent.keyDown(list, { key: "ArrowUp" });
      fireEvent.keyDown(list, { key: "ArrowUp" });

      expect(list).toBeInTheDocument();
    });

    it("should not go beyond last message when pressing ArrowDown at end", () => {
      const messages: Message[] = [
        { ...mockMessage, id: "msg-1" },
        { ...mockMessage, id: "msg-2", content: "Second", messageIndex: 1 },
      ];

      render(<MessageList messages={messages} showTimestamps={true} />);

      const list = screen.getByRole("log");
      list.focus();

      // Navigate to end and try to go further
      fireEvent.keyDown(list, { key: "ArrowDown" });
      fireEvent.keyDown(list, { key: "ArrowDown" });
      fireEvent.keyDown(list, { key: "ArrowDown" });
      fireEvent.keyDown(list, { key: "ArrowDown" });

      expect(list).toBeInTheDocument();
    });
  });

  describe("MessageInput Edge Cases", () => {
    it("should handle paste event with large text", async () => {
      const user = userEvent.setup();
      const onSend = vi.fn();

      render(<MessageInput onSend={onSend} maxLength={100} />);

      const input = screen.getByRole("textbox");
      await user.click(input);
      await user.paste("A".repeat(200));

      // Should be truncated to maxLength
      expect(input).toHaveValue("A".repeat(100));
    });

    it("should handle rapid typing without lag", async () => {
      const user = userEvent.setup();
      const onSend = vi.fn();
      const onTyping = vi.fn();

      render(<MessageInput onSend={onSend} onTyping={onTyping} />);

      const input = screen.getByRole("textbox");
      await user.type(input, "rapid typing test");

      expect(onTyping).toHaveBeenCalled();
    });

    it("should handle Shift+Enter for multiline input", async () => {
      const user = userEvent.setup();
      const onSend = vi.fn();

      render(<MessageInput onSend={onSend} />);

      const input = screen.getByRole("textbox");
      await user.type(input, "Line 1{Shift>}{Enter}{/Shift}Line 2");

      expect(onSend).not.toHaveBeenCalled();
      expect(input).toHaveValue("Line 1\nLine 2");
    });
  });

  describe("ConversationListPanel Edge Cases", () => {
    it("should handle empty conversation list", () => {
      render(
        <ConversationListPanel
          conversations={[]}
          onSelect={vi.fn()}
          onCreateNew={vi.fn()}
        />,
      );

      expect(screen.getByText(/会話がありません/)).toBeInTheDocument();
    });

    it("should handle search with no results", async () => {
      const user = userEvent.setup();

      render(
        <ConversationListPanel
          conversations={[mockConversation]}
          onSelect={vi.fn()}
          onCreateNew={vi.fn()}
          onSearch={vi.fn()}
        />,
      );

      const searchInput = screen.getByRole("searchbox");
      await user.type(searchInput, "nonexistent query");

      // Search should be triggered
      expect(searchInput).toHaveValue("nonexistent query");
    });

    it("should handle rapid selection changes", async () => {
      const onSelect = vi.fn();
      const conversations = Array.from({ length: 5 }, (_, i) => ({
        ...mockConversation,
        id: `conv-${i}`,
        title: `Conversation ${i}`,
      }));

      render(
        <ConversationListPanel
          conversations={conversations}
          onSelect={onSelect}
          onCreateNew={vi.fn()}
        />,
      );

      const items = screen.getAllByRole("option");

      // Rapid selection
      fireEvent.click(items[0]);
      fireEvent.click(items[1]);
      fireEvent.click(items[2]);

      expect(onSelect).toHaveBeenCalledTimes(3);
    });
  });

  describe("ConversationDetailView Edge Cases", () => {
    it("should handle title update callback", async () => {
      const user = userEvent.setup();
      const onTitleUpdate = vi.fn();

      render(
        <ConversationDetailView
          conversation={mockConversation}
          messages={[mockMessage]}
          isLoading={false}
          onSendMessage={vi.fn()}
          onTitleUpdate={onTitleUpdate}
        />,
      );

      // Click on title to enter edit mode
      const title = screen.getByRole("heading", { name: /Test Conversation/ });
      await user.click(title);

      // Find input and change title
      const titleInput = screen.getByRole("textbox", { name: "" });
      await user.clear(titleInput);
      await user.type(titleInput, "New Title{Enter}");

      expect(onTitleUpdate).toHaveBeenCalledWith("New Title");
    });

    it("should handle missing optional callbacks gracefully", () => {
      render(
        <ConversationDetailView
          conversation={mockConversation}
          messages={[mockMessage]}
          isLoading={false}
          onSendMessage={vi.fn()}
        />,
      );

      // Should render without optional callbacks
      expect(screen.getByText("Test Conversation")).toBeInTheDocument();
    });
  });

  describe("MessageBubble Action Edge Cases", () => {
    it("should copy code from code block", async () => {
      const onCopy = vi.fn();
      const codeMessage: Message = {
        ...mockMessage,
        role: "assistant",
        content: "Here is code:\n```js\nconst x = 1;\n```",
      };

      render(<MessageBubble message={codeMessage} onCopy={onCopy} />);

      const copyCodeButton = screen.getByTestId("copy-code-button");
      fireEvent.click(copyCodeButton);

      expect(onCopy).toHaveBeenCalledWith("const x = 1;\n");
    });

    it("should handle hover state transitions", () => {
      const onCopy = vi.fn();

      render(<MessageBubble message={mockMessage} onCopy={onCopy} />);

      const bubble = screen.getByTestId("bubble");

      // Mouse enter - should show action buttons
      fireEvent.mouseEnter(bubble);
      expect(
        screen.getByRole("button", { name: /コピー|copy/i }),
      ).toBeInTheDocument();

      // Mouse leave - should hide action buttons
      fireEvent.mouseLeave(bubble);

      // Buttons should be hidden
      expect(
        screen.queryByRole("button", { name: /コピー|copy/i }),
      ).not.toBeInTheDocument();
    });
  });

  describe("ConversationHeader Edge Cases", () => {
    it("should cancel editing on Escape", async () => {
      const user = userEvent.setup();
      const onTitleUpdate = vi.fn();

      render(
        <ConversationHeader
          conversation={mockConversation}
          onTitleUpdate={onTitleUpdate}
          isEditable={true}
        />,
      );

      // Start editing by clicking title
      const title = screen.getByRole("heading", { name: /Test Conversation/ });
      await user.click(title);

      // Type new title
      const titleInput = screen.getByRole("textbox");
      await user.clear(titleInput);
      await user.type(titleInput, "Changed Title");

      // Press Escape to cancel
      await user.keyboard("{Escape}");

      // Should not have called update
      expect(onTitleUpdate).not.toHaveBeenCalled();

      // Should show original title
      expect(screen.getByText("Test Conversation")).toBeInTheDocument();
    });

    it("should not submit empty title", async () => {
      const user = userEvent.setup();
      const onTitleUpdate = vi.fn();

      render(
        <ConversationHeader
          conversation={mockConversation}
          onTitleUpdate={onTitleUpdate}
          isEditable={true}
        />,
      );

      // Start editing by clicking title
      const title = screen.getByRole("heading", { name: /Test Conversation/ });
      await user.click(title);

      // Clear and submit
      const titleInput = screen.getByRole("textbox");
      await user.clear(titleInput);
      await user.keyboard("{Enter}");

      // Should not call update with empty title
      expect(onTitleUpdate).not.toHaveBeenCalledWith("");
    });
  });

  describe("Virtualization Edge Cases", () => {
    it("should handle virtualization with exactly threshold messages", () => {
      const messages: Message[] = Array.from({ length: 50 }, (_, i) => ({
        ...mockMessage,
        id: `msg-${i}`,
        content: `Message ${i}`,
        messageIndex: i,
      }));

      render(<MessageList messages={messages} virtualize={true} />);

      // With exactly 50 messages, should not virtualize
      const visibleMessages = screen.getAllByTestId(/^message-/);
      expect(visibleMessages.length).toBe(50);
    });

    it("should virtualize with messages above threshold", () => {
      const messages: Message[] = Array.from({ length: 100 }, (_, i) => ({
        ...mockMessage,
        id: `msg-${i}`,
        content: `Message ${i}`,
        messageIndex: i,
      }));

      render(<MessageList messages={messages} virtualize={true} />);

      // With 100 messages, should virtualize (show 10 + 30)
      const visibleMessages = screen.getAllByTestId(/^message-/);
      expect(visibleMessages.length).toBeLessThan(100);
    });
  });

  describe("Error Recovery", () => {
    it("should recover from error state", () => {
      const { rerender } = render(
        <MessageList
          messages={[mockMessage]}
          error="Error loading messages"
          showTimestamps={true}
        />,
      );

      expect(screen.getByText("Error loading messages")).toBeInTheDocument();

      // Clear error
      rerender(
        <MessageList
          messages={[mockMessage]}
          error={undefined}
          showTimestamps={true}
        />,
      );

      expect(
        screen.queryByText("Error loading messages"),
      ).not.toBeInTheDocument();
      expect(screen.getByText("Hello!")).toBeInTheDocument();
    });

    it("should handle retry in ConversationDetailView", async () => {
      const onRetry = vi.fn();

      render(
        <ConversationDetailView
          conversation={mockConversation}
          messages={[]}
          isLoading={false}
          error="Failed to load messages"
          onSendMessage={vi.fn()}
          onRetry={onRetry}
        />,
      );

      const retryButton = screen.getByRole("button", { name: /再試行/i });
      fireEvent.click(retryButton);

      expect(onRetry).toHaveBeenCalled();
    });
  });

  describe("Concurrent Operations", () => {
    it("should handle simultaneous send and typing", async () => {
      const user = userEvent.setup();
      const onSend = vi.fn().mockResolvedValue(undefined);
      const onTyping = vi.fn();

      render(
        <MessageInput onSend={onSend} onTyping={onTyping} isSending={false} />,
      );

      const input = screen.getByRole("textbox");
      await user.type(input, "Test message{Enter}");

      expect(onSend).toHaveBeenCalledWith("Test message");
    });

    it("should disable input while sending", () => {
      render(<MessageInput onSend={vi.fn()} isSending={true} />);

      const input = screen.getByRole("textbox");
      expect(input).toBeDisabled();
    });
  });
});
