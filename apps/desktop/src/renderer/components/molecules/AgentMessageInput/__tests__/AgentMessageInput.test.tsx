/**
 * AgentMessageInput コンポーネントテスト
 * TDD: Red Phase - 実装前にテストを作成
 */
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AgentMessageInput } from "../AgentMessageInput";

describe("AgentMessageInput", () => {
  const defaultProps = {
    value: "",
    onChange: vi.fn(),
    onSubmit: vi.fn(),
    disabled: false,
    placeholder: "メッセージを入力...",
  };

  describe("input behavior", () => {
    it("should update value on input", async () => {
      // Arrange
      const onChange = vi.fn();
      render(<AgentMessageInput {...defaultProps} onChange={onChange} />);
      const input = screen.getByRole("textbox");

      // Act
      await userEvent.type(input, "Hello");

      // Assert
      expect(onChange).toHaveBeenCalledWith("H");
      expect(onChange).toHaveBeenCalledWith("e");
      expect(onChange).toHaveBeenCalledWith("l");
      expect(onChange).toHaveBeenCalledWith("l");
      expect(onChange).toHaveBeenCalledWith("o");
    });

    it("should clear input after send", async () => {
      // Arrange
      const onSubmit = vi.fn();
      const onChange = vi.fn();
      render(
        <AgentMessageInput
          {...defaultProps}
          value="Hello"
          onChange={onChange}
          onSubmit={onSubmit}
        />,
      );
      const sendButton = screen.getByRole("button", { name: /送信/i });

      // Act
      await userEvent.click(sendButton);

      // Assert
      expect(onSubmit).toHaveBeenCalled();
      // onChange should be called with empty string after submit
      expect(onChange).toHaveBeenCalledWith("");
    });

    it("should disable when executing", () => {
      // Arrange & Act
      render(<AgentMessageInput {...defaultProps} disabled={true} />);

      // Assert
      expect(screen.getByRole("textbox")).toBeDisabled();
      expect(screen.getByRole("button", { name: /送信/i })).toBeDisabled();
    });
  });

  describe("send behavior", () => {
    it("should call onSubmit when button clicked", async () => {
      // Arrange
      const onSubmit = vi.fn();
      render(
        <AgentMessageInput
          {...defaultProps}
          value="Hello"
          onSubmit={onSubmit}
        />,
      );

      // Act
      await userEvent.click(screen.getByRole("button", { name: /送信/i }));

      // Assert
      expect(onSubmit).toHaveBeenCalledTimes(1);
    });

    it("should call onSubmit when Enter pressed", async () => {
      // Arrange
      const onSubmit = vi.fn();
      render(
        <AgentMessageInput
          {...defaultProps}
          value="Hello"
          onSubmit={onSubmit}
        />,
      );
      const input = screen.getByRole("textbox");

      // Act
      await userEvent.type(input, "{Enter}");

      // Assert
      expect(onSubmit).toHaveBeenCalledTimes(1);
    });

    it("should not send empty message", async () => {
      // Arrange
      const onSubmit = vi.fn();
      render(
        <AgentMessageInput {...defaultProps} value="" onSubmit={onSubmit} />,
      );

      // Act
      await userEvent.click(screen.getByRole("button", { name: /送信/i }));

      // Assert
      expect(onSubmit).not.toHaveBeenCalled();
    });

    it("should allow Shift+Enter for newline", async () => {
      // Arrange
      const onSubmit = vi.fn();
      const onChange = vi.fn();
      render(
        <AgentMessageInput
          {...defaultProps}
          value="Hello"
          onChange={onChange}
          onSubmit={onSubmit}
        />,
      );
      const input = screen.getByRole("textbox");

      // Act
      fireEvent.keyDown(input, { key: "Enter", shiftKey: true });

      // Assert
      expect(onSubmit).not.toHaveBeenCalled();
    });
  });

  describe("accessibility", () => {
    it("should have proper aria-label", () => {
      // Arrange & Act
      render(<AgentMessageInput {...defaultProps} />);

      // Assert
      expect(screen.getByRole("textbox")).toHaveAttribute(
        "aria-label",
        expect.stringContaining("メッセージ"),
      );
    });

    it("should have proper placeholder", () => {
      // Arrange & Act
      render(
        <AgentMessageInput
          {...defaultProps}
          placeholder="カスタムプレースホルダー"
        />,
      );

      // Assert
      expect(
        screen.getByPlaceholderText("カスタムプレースホルダー"),
      ).toBeInTheDocument();
    });
  });
});
