/**
 * MessageBubble Component Tests
 *
 * TDD Red Phase: Tests for message bubble atom component.
 *
 * @module @repo/desktop/renderer/components/conversation/__tests__/MessageBubble
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MessageBubble } from "../MessageBubble";
import type { Message } from "../../../../shared/types/conversation";

// Mock data
const mockUserMessage: Message = {
  id: "msg-1",
  sessionId: "conv-1",
  role: "user",
  content: "Hello, how are you?",
  messageIndex: 0,
  timestamp: "2026-01-24T10:00:00Z",
  attachments: [],
  metadata: {},
};

const mockAssistantMessage: Message = {
  id: "msg-2",
  sessionId: "conv-1",
  role: "assistant",
  content: "I am doing well, thank you for asking!",
  messageIndex: 1,
  timestamp: "2026-01-24T10:00:01Z",
  attachments: [],
  metadata: {},
};

const mockMessageWithCode: Message = {
  id: "msg-3",
  sessionId: "conv-1",
  role: "assistant",
  content:
    "Here is some code:\n```javascript\nconst hello = 'world';\nconsole.log(hello);\n```",
  messageIndex: 2,
  timestamp: "2026-01-24T10:00:02Z",
  attachments: [],
  metadata: {},
};

const mockMessageWithAttachment: Message = {
  id: "msg-4",
  sessionId: "conv-1",
  role: "user",
  content: "Check this image",
  messageIndex: 3,
  timestamp: "2026-01-24T10:00:03Z",
  attachments: [
    {
      id: "att-1",
      type: "image",
      url: "https://example.com/image.png",
      name: "screenshot.png",
    },
  ],
  metadata: {},
};

describe("MessageBubble", () => {
  const mockOnCopy = vi.fn();
  const mockOnEdit = vi.fn();
  const mockOnDelete = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("Rendering", () => {
    it("should render message content", () => {
      render(<MessageBubble message={mockUserMessage} />);

      expect(screen.getByText("Hello, how are you?")).toBeInTheDocument();
    });

    it("should render user message with user styling", () => {
      render(<MessageBubble message={mockUserMessage} />);

      const bubble = screen.getByTestId("bubble");
      expect(bubble).toHaveClass("user");
    });

    it("should render assistant message with assistant styling", () => {
      render(<MessageBubble message={mockAssistantMessage} />);

      const bubble = screen.getByTestId("bubble");
      expect(bubble).toHaveClass("assistant");
    });

    it("should render timestamp", () => {
      render(<MessageBubble message={mockUserMessage} showTimestamp={true} />);

      expect(screen.getByTestId("message-timestamp")).toBeInTheDocument();
    });

    it("should not render timestamp when showTimestamp is false", () => {
      render(<MessageBubble message={mockUserMessage} showTimestamp={false} />);

      expect(screen.queryByTestId("message-timestamp")).not.toBeInTheDocument();
    });
  });

  describe("Markdown Rendering", () => {
    it("should render markdown content", () => {
      const markdownMessage: Message = {
        ...mockAssistantMessage,
        content: "**Bold** and *italic* text",
      };

      render(<MessageBubble message={markdownMessage} />);

      expect(screen.getByText("Bold")).toBeInTheDocument();
      expect(screen.getByText("italic")).toBeInTheDocument();
    });

    it("should render code blocks with syntax highlighting", () => {
      render(<MessageBubble message={mockMessageWithCode} />);

      expect(screen.getByTestId("code-block")).toBeInTheDocument();
    });

    it("should render inline code", () => {
      const inlineCodeMessage: Message = {
        ...mockAssistantMessage,
        content: "Use `console.log()` for debugging",
      };

      render(<MessageBubble message={inlineCodeMessage} />);

      expect(screen.getByText("console.log()")).toBeInTheDocument();
    });

    it("should render links", () => {
      const linkMessage: Message = {
        ...mockAssistantMessage,
        content: "Check out [this link](https://example.com)",
      };

      render(<MessageBubble message={linkMessage} />);

      const link = screen.getByRole("link");
      expect(link).toHaveAttribute("href", "https://example.com");
    });
  });

  describe("Attachments", () => {
    it("should render image attachment", () => {
      render(<MessageBubble message={mockMessageWithAttachment} />);

      expect(screen.getByRole("img")).toBeInTheDocument();
    });

    it("should render attachment thumbnail", () => {
      render(<MessageBubble message={mockMessageWithAttachment} />);

      const image = screen.getByRole("img");
      expect(image).toHaveAttribute("src", "https://example.com/image.png");
    });

    it("should show attachment name", () => {
      render(<MessageBubble message={mockMessageWithAttachment} />);

      expect(screen.getByText("screenshot.png")).toBeInTheDocument();
    });
  });

  describe("Actions", () => {
    it("should show action buttons on hover", () => {
      render(
        <MessageBubble
          message={mockUserMessage}
          onCopy={mockOnCopy}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />,
      );

      const bubble = screen.getByTestId("bubble");
      fireEvent.mouseEnter(bubble);

      expect(
        screen.getByRole("button", { name: /コピー|copy/i }),
      ).toBeInTheDocument();
    });

    it("should call onCopy when copy button is clicked", () => {
      render(<MessageBubble message={mockUserMessage} onCopy={mockOnCopy} />);

      const bubble = screen.getByTestId("bubble");
      fireEvent.mouseEnter(bubble);

      fireEvent.click(screen.getByRole("button", { name: /コピー|copy/i }));
      expect(mockOnCopy).toHaveBeenCalledWith("Hello, how are you?");
    });

    it("should call onEdit when edit button is clicked", () => {
      render(<MessageBubble message={mockUserMessage} onEdit={mockOnEdit} />);

      const bubble = screen.getByTestId("bubble");
      fireEvent.mouseEnter(bubble);

      fireEvent.click(screen.getByRole("button", { name: /編集|edit/i }));
      expect(mockOnEdit).toHaveBeenCalledWith(mockUserMessage);
    });

    it("should call onDelete when delete button is clicked", () => {
      render(
        <MessageBubble message={mockUserMessage} onDelete={mockOnDelete} />,
      );

      const bubble = screen.getByTestId("bubble");
      fireEvent.mouseEnter(bubble);

      fireEvent.click(screen.getByRole("button", { name: /削除|delete/i }));
      expect(mockOnDelete).toHaveBeenCalledWith(mockUserMessage.id);
    });

    it("should show copy button for code blocks", () => {
      render(
        <MessageBubble message={mockMessageWithCode} onCopy={mockOnCopy} />,
      );

      expect(screen.getByTestId("copy-code-button")).toBeInTheDocument();
    });
  });

  describe("Streaming State", () => {
    it("should show typing indicator when isStreaming is true", () => {
      render(
        <MessageBubble message={mockAssistantMessage} isStreaming={true} />,
      );

      expect(screen.getByTestId("typing-indicator")).toBeInTheDocument();
    });

    it("should apply streaming styles when isStreaming is true", () => {
      render(
        <MessageBubble message={mockAssistantMessage} isStreaming={true} />,
      );

      const bubble = screen.getByTestId("bubble");
      expect(bubble).toHaveClass("streaming");
    });
  });

  describe("Error State", () => {
    it("should show error styling when isError is true", () => {
      render(<MessageBubble message={mockUserMessage} isError={true} />);

      const bubble = screen.getByTestId("bubble");
      expect(bubble).toHaveClass("error");
    });

    it("should show retry button when isError is true", () => {
      const mockOnRetry = vi.fn();

      render(
        <MessageBubble
          message={mockUserMessage}
          isError={true}
          onRetry={mockOnRetry}
        />,
      );

      expect(
        screen.getByRole("button", { name: /再試行|retry/i }),
      ).toBeInTheDocument();
    });

    it("should call onRetry when retry button is clicked", () => {
      const mockOnRetry = vi.fn();

      render(
        <MessageBubble
          message={mockUserMessage}
          isError={true}
          onRetry={mockOnRetry}
        />,
      );

      fireEvent.click(screen.getByRole("button", { name: /再試行|retry/i }));
      expect(mockOnRetry).toHaveBeenCalledWith(mockUserMessage);
    });
  });

  describe("Accessibility", () => {
    it("should have correct ARIA attributes", () => {
      render(<MessageBubble message={mockUserMessage} />);

      const bubble = screen.getByTestId("bubble");
      expect(bubble).toHaveAttribute("role", "article");
    });

    it("should have accessible label indicating message role", () => {
      render(<MessageBubble message={mockUserMessage} />);

      const bubble = screen.getByTestId("bubble");
      expect(bubble).toHaveAccessibleName();
    });

    it("should be focusable", () => {
      render(<MessageBubble message={mockUserMessage} />);

      const bubble = screen.getByTestId("bubble");
      expect(bubble).toHaveAttribute("tabIndex", "0");
    });

    it("should announce streaming state to screen readers", () => {
      render(
        <MessageBubble message={mockAssistantMessage} isStreaming={true} />,
      );

      expect(screen.getByRole("status")).toBeInTheDocument();
    });
  });

  describe("Long Content", () => {
    it("should handle long content gracefully", () => {
      const longMessage: Message = {
        ...mockAssistantMessage,
        content: "A".repeat(10000),
      };

      render(<MessageBubble message={longMessage} />);

      expect(screen.getByTestId("bubble")).toBeInTheDocument();
    });

    it("should not break layout with very long words", () => {
      const longWordMessage: Message = {
        ...mockAssistantMessage,
        content: "Supercalifragilisticexpialidocious".repeat(50),
      };

      render(<MessageBubble message={longWordMessage} />);

      const bubble = screen.getByTestId("bubble");
      expect(bubble).toHaveStyle({ wordBreak: "break-word" });
    });
  });
});
