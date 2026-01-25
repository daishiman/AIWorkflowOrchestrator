/**
 * MessageInput Component Tests
 *
 * TDD Red Phase: Tests for message input molecule component.
 *
 * @module @repo/desktop/renderer/components/conversation/__tests__/MessageInput
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MessageInput } from "../MessageInput";

describe("MessageInput", () => {
  const mockOnSend = vi.fn();
  const mockOnAttach = vi.fn();
  const mockOnTyping = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("Rendering", () => {
    it("should render text input", () => {
      render(<MessageInput onSend={mockOnSend} />);

      expect(screen.getByRole("textbox")).toBeInTheDocument();
    });

    it("should render with placeholder text", () => {
      render(<MessageInput onSend={mockOnSend} />);

      expect(
        screen.getByPlaceholderText(/メッセージを入力|type a message/i),
      ).toBeInTheDocument();
    });

    it("should render send button", () => {
      render(<MessageInput onSend={mockOnSend} />);

      expect(
        screen.getByRole("button", { name: /送信|send/i }),
      ).toBeInTheDocument();
    });

    it("should render with custom placeholder", () => {
      render(<MessageInput onSend={mockOnSend} placeholder="質問を入力..." />);

      expect(screen.getByPlaceholderText("質問を入力...")).toBeInTheDocument();
    });

    it("should render attach button when onAttach is provided", () => {
      render(<MessageInput onSend={mockOnSend} onAttach={mockOnAttach} />);

      expect(
        screen.getByRole("button", { name: /添付|attach/i }),
      ).toBeInTheDocument();
    });
  });

  describe("Input Behavior", () => {
    it("should update value when typing", async () => {
      const user = userEvent.setup();
      render(<MessageInput onSend={mockOnSend} />);

      const input = screen.getByRole("textbox");
      await user.type(input, "Hello world");

      expect(input).toHaveValue("Hello world");
    });

    it("should clear input after sending", async () => {
      const user = userEvent.setup();
      render(<MessageInput onSend={mockOnSend} />);

      const input = screen.getByRole("textbox");
      await user.type(input, "Hello world");
      await user.click(screen.getByRole("button", { name: /送信|send/i }));

      expect(input).toHaveValue("");
    });

    it("should call onTyping when input changes", async () => {
      const user = userEvent.setup();
      render(<MessageInput onSend={mockOnSend} onTyping={mockOnTyping} />);

      const input = screen.getByRole("textbox");
      await user.type(input, "H");

      expect(mockOnTyping).toHaveBeenCalled();
    });
  });

  describe("Send Message", () => {
    it("should call onSend when send button is clicked", async () => {
      const user = userEvent.setup();
      render(<MessageInput onSend={mockOnSend} />);

      const input = screen.getByRole("textbox");
      await user.type(input, "Hello world");
      await user.click(screen.getByRole("button", { name: /送信|send/i }));

      expect(mockOnSend).toHaveBeenCalledWith("Hello world");
    });

    it("should call onSend when Enter is pressed", async () => {
      const user = userEvent.setup();
      render(<MessageInput onSend={mockOnSend} />);

      const input = screen.getByRole("textbox");
      await user.type(input, "Hello world{Enter}");

      expect(mockOnSend).toHaveBeenCalledWith("Hello world");
    });

    it("should insert newline when Shift+Enter is pressed", async () => {
      const user = userEvent.setup();
      render(<MessageInput onSend={mockOnSend} />);

      const input = screen.getByRole("textbox");
      await user.type(input, "Line 1{Shift>}{Enter}{/Shift}Line 2");

      expect(input).toHaveValue("Line 1\nLine 2");
      expect(mockOnSend).not.toHaveBeenCalled();
    });

    it("should not send empty message", async () => {
      const user = userEvent.setup();
      render(<MessageInput onSend={mockOnSend} />);

      await user.click(screen.getByRole("button", { name: /送信|send/i }));

      expect(mockOnSend).not.toHaveBeenCalled();
    });

    it("should not send whitespace-only message", async () => {
      const user = userEvent.setup();
      render(<MessageInput onSend={mockOnSend} />);

      const input = screen.getByRole("textbox");
      await user.type(input, "   ");
      await user.click(screen.getByRole("button", { name: /送信|send/i }));

      expect(mockOnSend).not.toHaveBeenCalled();
    });

    it("should trim whitespace from message", async () => {
      const user = userEvent.setup();
      render(<MessageInput onSend={mockOnSend} />);

      const input = screen.getByRole("textbox");
      await user.type(input, "  Hello world  ");
      await user.click(screen.getByRole("button", { name: /送信|send/i }));

      expect(mockOnSend).toHaveBeenCalledWith("Hello world");
    });
  });

  describe("Disabled State", () => {
    it("should disable input when disabled prop is true", () => {
      render(<MessageInput onSend={mockOnSend} disabled={true} />);

      expect(screen.getByRole("textbox")).toBeDisabled();
    });

    it("should disable send button when disabled prop is true", () => {
      render(<MessageInput onSend={mockOnSend} disabled={true} />);

      expect(screen.getByRole("button", { name: /送信|send/i })).toBeDisabled();
    });

    it("should disable send button when input is empty", () => {
      render(<MessageInput onSend={mockOnSend} />);

      expect(screen.getByRole("button", { name: /送信|send/i })).toBeDisabled();
    });

    it("should enable send button when input has content", async () => {
      const user = userEvent.setup();
      render(<MessageInput onSend={mockOnSend} />);

      const input = screen.getByRole("textbox");
      await user.type(input, "Hello");

      expect(
        screen.getByRole("button", { name: /送信|send/i }),
      ).not.toBeDisabled();
    });
  });

  describe("Loading State", () => {
    it("should show loading indicator when isSending is true", () => {
      render(<MessageInput onSend={mockOnSend} isSending={true} />);

      expect(screen.getByTestId("sending-indicator")).toBeInTheDocument();
    });

    it("should disable input when isSending is true", () => {
      render(<MessageInput onSend={mockOnSend} isSending={true} />);

      expect(screen.getByRole("textbox")).toBeDisabled();
    });

    it("should disable send button when isSending is true", () => {
      render(<MessageInput onSend={mockOnSend} isSending={true} />);

      expect(screen.getByRole("button", { name: /送信|send/i })).toBeDisabled();
    });
  });

  describe("Character Limit", () => {
    it("should show character count when near limit", async () => {
      const user = userEvent.setup();
      render(<MessageInput onSend={mockOnSend} maxLength={100} />);

      const input = screen.getByRole("textbox");
      await user.type(input, "A".repeat(90));

      expect(screen.getByTestId("character-count")).toBeInTheDocument();
    });

    it("should show warning when at limit", async () => {
      const user = userEvent.setup();
      render(<MessageInput onSend={mockOnSend} maxLength={100} />);

      const input = screen.getByRole("textbox");
      await user.type(input, "A".repeat(100));

      expect(screen.getByTestId("character-count")).toHaveClass("warning");
    });

    it("should prevent typing beyond limit", async () => {
      const user = userEvent.setup();
      render(<MessageInput onSend={mockOnSend} maxLength={10} />);

      const input = screen.getByRole("textbox");
      await user.type(input, "ABCDEFGHIJKLMN");

      expect(input).toHaveValue("ABCDEFGHIJ"); // Only first 10 chars
    });
  });

  describe("Attachment", () => {
    it("should call onAttach when attach button is clicked", async () => {
      const user = userEvent.setup();
      render(<MessageInput onSend={mockOnSend} onAttach={mockOnAttach} />);

      await user.click(screen.getByRole("button", { name: /添付|attach/i }));

      expect(mockOnAttach).toHaveBeenCalled();
    });

    it("should display attachment preview when file is attached", () => {
      const mockFile = new File(["test"], "test.png", { type: "image/png" });

      render(
        <MessageInput
          onSend={mockOnSend}
          onAttach={mockOnAttach}
          attachments={[mockFile]}
        />,
      );

      expect(screen.getByTestId("attachment-preview")).toBeInTheDocument();
    });

    it("should allow removing attachment", async () => {
      const user = userEvent.setup();
      const mockOnRemoveAttachment = vi.fn();
      const mockFile = new File(["test"], "test.png", { type: "image/png" });

      render(
        <MessageInput
          onSend={mockOnSend}
          onAttach={mockOnAttach}
          attachments={[mockFile]}
          onRemoveAttachment={mockOnRemoveAttachment}
        />,
      );

      await user.click(screen.getByRole("button", { name: /削除|remove/i }));

      expect(mockOnRemoveAttachment).toHaveBeenCalledWith(0);
    });
  });

  describe("Auto-resize", () => {
    it("should auto-resize textarea as content grows", async () => {
      const user = userEvent.setup();
      render(<MessageInput onSend={mockOnSend} autoResize={true} />);

      const input = screen.getByRole("textbox");
      const initialHeight = input.scrollHeight;

      await user.type(input, "Line 1\nLine 2\nLine 3\nLine 4");

      expect(input.scrollHeight).toBeGreaterThanOrEqual(initialHeight);
    });

    it("should respect maxRows constraint", async () => {
      const user = userEvent.setup();
      render(
        <MessageInput onSend={mockOnSend} autoResize={true} maxRows={3} />,
      );

      const input = screen.getByRole("textbox") as HTMLTextAreaElement;
      await user.type(input, "Line 1\nLine 2\nLine 3\nLine 4\nLine 5");

      // Should have maxHeight set to limit expansion
      expect(input.style.maxHeight).toBeTruthy();
      expect(input.style.maxHeight).toMatch(/\d+px/);
    });
  });

  describe("Accessibility", () => {
    it("should have accessible label", () => {
      render(<MessageInput onSend={mockOnSend} />);

      expect(screen.getByRole("textbox")).toHaveAccessibleName();
    });

    it("should be focusable", () => {
      render(<MessageInput onSend={mockOnSend} />);

      const input = screen.getByRole("textbox");
      expect(input).not.toHaveAttribute("tabIndex", "-1");
    });

    it("should announce sending state to screen readers", () => {
      render(<MessageInput onSend={mockOnSend} isSending={true} />);

      expect(screen.getByRole("status")).toBeInTheDocument();
    });

    it("should have aria-describedby for character count", async () => {
      const user = userEvent.setup();
      render(<MessageInput onSend={mockOnSend} maxLength={100} />);

      const input = screen.getByRole("textbox");
      await user.type(input, "A".repeat(90));

      expect(input).toHaveAttribute("aria-describedby");
    });
  });

  describe("Focus Management", () => {
    it("should focus input on mount when autoFocus is true", () => {
      render(<MessageInput onSend={mockOnSend} autoFocus={true} />);

      expect(screen.getByRole("textbox")).toHaveFocus();
    });

    it("should refocus input after sending", async () => {
      const user = userEvent.setup();
      render(<MessageInput onSend={mockOnSend} />);

      const input = screen.getByRole("textbox");
      await user.type(input, "Hello");
      await user.click(screen.getByRole("button", { name: /送信|send/i }));

      expect(input).toHaveFocus();
    });
  });
});
