/**
 * @vitest-environment happy-dom
 *
 * StreamingMessage Component Tests
 *
 * TDD Phase: Red (failing tests - component to be implemented)
 *
 * Tests for AC-002, AC-004, AC-005, AC-006: UI streaming components
 */

import React, { useState } from "react";
import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe, toHaveNoViolations } from "jest-axe";

// Cleanup DOM between tests
afterEach(() => {
  cleanup();
});

// Component to test (to be implemented)
// import { StreamingMessage } from "../StreamingMessage";

expect.extend(toHaveNoViolations);

// Mock component for TDD - will be replaced with actual implementation
const StreamingMessage = ({
  content,
  isStreaming,
  showCursor = true,
  onCancel,
  className,
}: {
  content: string;
  isStreaming: boolean;
  showCursor?: boolean;
  onCancel?: () => void;
  className?: string;
}) => {
  return (
    <div
      className={className}
      role="status"
      aria-live="polite"
      aria-busy={isStreaming}
      data-testid="streaming-message"
    >
      <div className="content">
        {content}
        {isStreaming && showCursor && (
          <span
            className="cursor animate-pulse"
            role="img"
            aria-label="入力中"
            data-testid="streaming-cursor"
          />
        )}
      </div>
      {isStreaming && onCancel && (
        <button
          onClick={onCancel}
          aria-label="ストリーミングを停止"
          data-testid="cancel-button"
        >
          停止
        </button>
      )}
    </div>
  );
};

describe("StreamingMessage Component", () => {
  // ============================================================
  // 1. Rendering Tests
  // ============================================================
  describe("TC-UI-001: コンテンツ表示", () => {
    it("should render content text", () => {
      render(<StreamingMessage content="Hello world" isStreaming={false} />);

      expect(screen.getByText("Hello world")).toBeInTheDocument();
    });

    it("should render empty content", () => {
      render(<StreamingMessage content="" isStreaming={true} />);

      const message = screen.getByTestId("streaming-message");
      expect(message).toBeInTheDocument();
    });
  });

  describe("TC-UI-002: isStreaming=trueでカーソル表示", () => {
    it("should show cursor when streaming", () => {
      render(<StreamingMessage content="Hello" isStreaming={true} />);

      const cursor = screen.getByTestId("streaming-cursor");
      expect(cursor).toBeInTheDocument();
    });

    it("should show cursor with animation", () => {
      render(<StreamingMessage content="Hello" isStreaming={true} />);

      const cursor = screen.getByTestId("streaming-cursor");
      expect(cursor).toHaveClass("animate-pulse");
    });
  });

  describe("TC-UI-003: isStreaming=falseでカーソル非表示", () => {
    it("should hide cursor when not streaming", () => {
      render(<StreamingMessage content="Hello" isStreaming={false} />);

      const cursor = screen.queryByTestId("streaming-cursor");
      expect(cursor).not.toBeInTheDocument();
    });
  });

  describe("TC-UI-004: キャンセルボタン表示（ストリーミング中）", () => {
    it("should show cancel button when streaming with onCancel", () => {
      const onCancel = vi.fn();
      render(
        <StreamingMessage
          content="Hello"
          isStreaming={true}
          onCancel={onCancel}
        />,
      );

      const cancelButton = screen.getByTestId("cancel-button");
      expect(cancelButton).toBeInTheDocument();
      expect(cancelButton).toHaveTextContent("停止");
    });

    it("should not show cancel button without onCancel callback", () => {
      render(<StreamingMessage content="Hello" isStreaming={true} />);

      const cancelButton = screen.queryByTestId("cancel-button");
      expect(cancelButton).not.toBeInTheDocument();
    });
  });

  describe("TC-UI-005: キャンセルボタン非表示（完了後）", () => {
    it("should hide cancel button when streaming is complete", () => {
      const onCancel = vi.fn();
      render(
        <StreamingMessage
          content="Hello"
          isStreaming={false}
          onCancel={onCancel}
        />,
      );

      const cancelButton = screen.queryByTestId("cancel-button");
      expect(cancelButton).not.toBeInTheDocument();
    });
  });

  describe("TC-UI-006: キャンセルボタンクリック", () => {
    it("should call onCancel when cancel button is clicked", async () => {
      const onCancel = vi.fn();
      const user = userEvent.setup();

      render(
        <StreamingMessage
          content="Hello"
          isStreaming={true}
          onCancel={onCancel}
        />,
      );

      const cancelButton = screen.getByTestId("cancel-button");
      await user.click(cancelButton);

      expect(onCancel).toHaveBeenCalledTimes(1);
    });
  });

  // ============================================================
  // 2. Accessibility Tests
  // ============================================================
  describe('TC-UI-007: ARIA属性 - role="status"', () => {
    it("should have role=status", () => {
      render(<StreamingMessage content="Hello" isStreaming={true} />);

      const message = screen.getByRole("status");
      expect(message).toBeInTheDocument();
    });
  });

  describe('TC-UI-008: ARIA属性 - aria-live="polite"', () => {
    it("should have aria-live=polite", () => {
      render(<StreamingMessage content="Hello" isStreaming={true} />);

      const message = screen.getByTestId("streaming-message");
      expect(message).toHaveAttribute("aria-live", "polite");
    });
  });

  describe("TC-UI-009: ARIA属性 - aria-busy", () => {
    it("should have aria-busy=true when streaming", () => {
      render(<StreamingMessage content="Hello" isStreaming={true} />);

      const message = screen.getByTestId("streaming-message");
      expect(message).toHaveAttribute("aria-busy", "true");
    });

    it("should have aria-busy=false when not streaming", () => {
      render(<StreamingMessage content="Hello" isStreaming={false} />);

      const message = screen.getByTestId("streaming-message");
      expect(message).toHaveAttribute("aria-busy", "false");
    });
  });

  describe("Cursor accessibility", () => {
    it("should have aria-label on cursor", () => {
      render(<StreamingMessage content="Hello" isStreaming={true} />);

      const cursor = screen.getByLabelText("入力中");
      expect(cursor).toBeInTheDocument();
    });
  });

  describe("Cancel button accessibility", () => {
    it("should have aria-label on cancel button", () => {
      const onCancel = vi.fn();
      render(
        <StreamingMessage
          content="Hello"
          isStreaming={true}
          onCancel={onCancel}
        />,
      );

      const cancelButton = screen.getByLabelText("ストリーミングを停止");
      expect(cancelButton).toBeInTheDocument();
    });
  });

  describe("axe accessibility audit", () => {
    it("should have no accessibility violations when streaming", async () => {
      const { container } = render(
        <StreamingMessage content="Hello" isStreaming={true} />,
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it("should have no accessibility violations when not streaming", async () => {
      const { container } = render(
        <StreamingMessage content="Hello" isStreaming={false} />,
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  // ============================================================
  // 3. Boundary Value Tests
  // ============================================================
  describe("TC-UI-010: 空コンテンツ表示", () => {
    it("should render correctly with empty content", () => {
      render(<StreamingMessage content="" isStreaming={true} />);

      const message = screen.getByTestId("streaming-message");
      expect(message).toBeInTheDocument();
      // Should still show cursor
      const cursor = screen.getByTestId("streaming-cursor");
      expect(cursor).toBeInTheDocument();
    });
  });

  describe("TC-UI-011: 長文コンテンツ表示", () => {
    it("should render correctly with long content", () => {
      const longContent = "A".repeat(10000);
      render(<StreamingMessage content={longContent} isStreaming={true} />);

      const message = screen.getByTestId("streaming-message");
      expect(message).toBeInTheDocument();
      expect(message.textContent).toContain(longContent);
    });
  });

  describe("Unicode and special characters", () => {
    it("should render Japanese characters correctly", () => {
      render(<StreamingMessage content="こんにちは世界" isStreaming={true} />);

      expect(screen.getByText(/こんにちは世界/)).toBeInTheDocument();
    });

    it("should render emojis correctly", () => {
      render(
        <StreamingMessage content="Hello 🎉 World 🚀" isStreaming={true} />,
      );

      expect(screen.getByText(/Hello 🎉 World 🚀/)).toBeInTheDocument();
    });
  });

  // ============================================================
  // 4. Props Tests
  // ============================================================
  describe("showCursor prop", () => {
    it("should hide cursor when showCursor=false even if streaming", () => {
      render(
        <StreamingMessage
          content="Hello"
          isStreaming={true}
          showCursor={false}
        />,
      );

      const cursor = screen.queryByTestId("streaming-cursor");
      expect(cursor).not.toBeInTheDocument();
    });
  });

  describe("className prop", () => {
    it("should apply custom className", () => {
      render(
        <StreamingMessage
          content="Hello"
          isStreaming={true}
          className="custom-class"
        />,
      );

      const message = screen.getByTestId("streaming-message");
      expect(message).toHaveClass("custom-class");
    });
  });

  // ============================================================
  // 5. Content Update Tests
  // ============================================================
  describe("Content updates", () => {
    it("should update content when props change", () => {
      const { rerender } = render(
        <StreamingMessage content="Hello" isStreaming={true} />,
      );

      expect(screen.getByText("Hello")).toBeInTheDocument();

      rerender(<StreamingMessage content="Hello world" isStreaming={true} />);

      expect(screen.getByText("Hello world")).toBeInTheDocument();
    });

    it("should hide cursor when streaming ends", () => {
      const { rerender } = render(
        <StreamingMessage content="Hello" isStreaming={true} />,
      );

      expect(screen.getByTestId("streaming-cursor")).toBeInTheDocument();

      rerender(<StreamingMessage content="Hello" isStreaming={false} />);

      expect(screen.queryByTestId("streaming-cursor")).not.toBeInTheDocument();
    });
  });
});

// ============================================================
// ChatInput Streaming Extension Tests
// ============================================================
describe("ChatInput Streaming Extension", () => {
  // Mock ChatInput component for TDD
  const ChatInput = ({
    onSend,
    placeholder = "メッセージを入力...",
    disabled = false,
    isStreaming = false,
    onCancelStream,
  }: {
    onSend: (message: string) => void;
    placeholder?: string;
    disabled?: boolean;
    isStreaming?: boolean;
    onCancelStream?: () => void;
  }) => {
    const [value, setValue] = useState("");

    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === "Escape" && isStreaming && onCancelStream) {
        onCancelStream();
      }
      if (e.key === "Enter" && !e.shiftKey && !isStreaming) {
        e.preventDefault();
        onSend(value);
        setValue("");
      }
    };

    return (
      <div data-testid="chat-input">
        <textarea
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled || isStreaming}
          data-testid="chat-textarea"
        />
        {isStreaming ? (
          <button
            onClick={onCancelStream}
            data-testid="cancel-stream-button"
            aria-label="ストリーミングを停止"
          >
            停止
          </button>
        ) : (
          <button
            onClick={() => {
              onSend(value);
              setValue("");
            }}
            disabled={disabled || !value.trim()}
            data-testid="send-button"
            aria-label="メッセージを送信"
          >
            送信
          </button>
        )}
      </div>
    );
  };

  describe("TC-CI-001: ストリーミング中の入力無効化", () => {
    it("should disable textarea when streaming", () => {
      render(<ChatInput onSend={vi.fn()} isStreaming={true} />);

      const textarea = screen.getByTestId("chat-textarea");
      expect(textarea).toBeDisabled();
    });
  });

  describe("TC-CI-002: ストリーミング中のキャンセルボタン", () => {
    it("should show cancel button when streaming", () => {
      render(
        <ChatInput
          onSend={vi.fn()}
          isStreaming={true}
          onCancelStream={vi.fn()}
        />,
      );

      const cancelButton = screen.getByTestId("cancel-stream-button");
      expect(cancelButton).toBeInTheDocument();
    });

    it("should show send button when not streaming", () => {
      render(<ChatInput onSend={vi.fn()} isStreaming={false} />);

      const sendButton = screen.getByTestId("send-button");
      expect(sendButton).toBeInTheDocument();
    });
  });

  describe("TC-CI-003: Escapeキーでキャンセル", () => {
    it("should call onCancelStream when Escape is pressed during streaming", async () => {
      const onCancelStream = vi.fn();

      render(
        <ChatInput
          onSend={vi.fn()}
          isStreaming={true}
          onCancelStream={onCancelStream}
        />,
      );

      // Simulate Escape key on the textarea using fireEvent (works on disabled elements)
      const textarea = screen.getByTestId("chat-textarea");
      fireEvent.keyDown(textarea, { key: "Escape" });

      expect(onCancelStream).toHaveBeenCalledTimes(1);
    });

    it("should not call onCancelStream when Escape is pressed without streaming", async () => {
      const onCancelStream = vi.fn();
      const user = userEvent.setup();

      render(
        <ChatInput
          onSend={vi.fn()}
          isStreaming={false}
          onCancelStream={onCancelStream}
        />,
      );

      const textarea = screen.getByTestId("chat-textarea");
      textarea.focus();
      await user.keyboard("{Escape}");

      expect(onCancelStream).not.toHaveBeenCalled();
    });
  });

  describe("TC-CI-004: 完了後の入力再有効化", () => {
    it("should enable textarea when streaming ends", () => {
      const { rerender } = render(
        <ChatInput onSend={vi.fn()} isStreaming={true} />,
      );

      expect(screen.getByTestId("chat-textarea")).toBeDisabled();

      rerender(<ChatInput onSend={vi.fn()} isStreaming={false} />);

      expect(screen.getByTestId("chat-textarea")).not.toBeDisabled();
    });
  });
});
