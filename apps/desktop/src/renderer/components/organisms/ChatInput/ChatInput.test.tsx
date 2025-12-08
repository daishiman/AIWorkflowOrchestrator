import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ChatInput } from "./index";

describe("ChatInput", () => {
  const defaultProps = {
    value: "",
    onChange: vi.fn(),
    onSend: vi.fn(),
  };

  describe("レンダリング", () => {
    it("入力フィールドをレンダリングする", () => {
      render(<ChatInput {...defaultProps} />);
      expect(
        screen.getByPlaceholderText("メッセージを入力..."),
      ).toBeInTheDocument();
    });

    it("送信ボタンをレンダリングする", () => {
      render(<ChatInput {...defaultProps} />);
      expect(screen.getByText("送信")).toBeInTheDocument();
    });

    it("入力フィールドにaria-labelを設定する", () => {
      render(<ChatInput {...defaultProps} />);
      expect(
        screen.getByLabelText("チャットメッセージ入力"),
      ).toBeInTheDocument();
    });

    it("送信ボタンにaria-labelを設定する", () => {
      render(<ChatInput {...defaultProps} />);
      expect(screen.getByLabelText("送信")).toBeInTheDocument();
    });
  });

  describe("インタラクション", () => {
    it("入力時にonChangeを呼び出す", async () => {
      const handleChange = vi.fn();
      render(<ChatInput {...defaultProps} onChange={handleChange} />);
      const input = screen.getByPlaceholderText("メッセージを入力...");
      await userEvent.type(input, "a");
      expect(handleChange).toHaveBeenCalledWith("a");
    });

    it("送信ボタンクリック時にonSendを呼び出す", () => {
      const handleSend = vi.fn();
      render(<ChatInput {...defaultProps} value="Hello" onSend={handleSend} />);
      fireEvent.click(screen.getByText("送信"));
      expect(handleSend).toHaveBeenCalledTimes(1);
    });

    it("Enterキーでの送信でonSendを呼び出す", () => {
      const handleSend = vi.fn();
      render(<ChatInput {...defaultProps} value="Hello" onSend={handleSend} />);
      const input = screen.getByPlaceholderText("メッセージを入力...");
      fireEvent.keyDown(input, { key: "Enter" });
      expect(handleSend).toHaveBeenCalledTimes(1);
    });

    it("空のメッセージでは送信しない", () => {
      const handleSend = vi.fn();
      render(<ChatInput {...defaultProps} value="" onSend={handleSend} />);
      fireEvent.click(screen.getByText("送信"));
      expect(handleSend).not.toHaveBeenCalled();
    });

    it("空白のみのメッセージでは送信しない", () => {
      const handleSend = vi.fn();
      render(<ChatInput {...defaultProps} value="   " onSend={handleSend} />);
      fireEvent.click(screen.getByText("送信"));
      expect(handleSend).not.toHaveBeenCalled();
    });
  });

  describe("送信状態", () => {
    it("sending=trueで入力フィールドを無効化する", () => {
      render(<ChatInput {...defaultProps} sending />);
      expect(screen.getByPlaceholderText("メッセージを入力...")).toBeDisabled();
    });

    it("sending=trueで送信ボタンを無効化する", () => {
      render(<ChatInput {...defaultProps} sending value="Test" />);
      expect(screen.getByLabelText("送信")).toBeDisabled();
    });

    it("sending=trueで送信しない", () => {
      const handleSend = vi.fn();
      render(
        <ChatInput
          {...defaultProps}
          value="Hello"
          sending
          onSend={handleSend}
        />,
      );
      fireEvent.click(screen.getByLabelText("送信"));
      expect(handleSend).not.toHaveBeenCalled();
    });

    it("sending=trueでローディング状態を表示する", () => {
      render(<ChatInput {...defaultProps} sending value="Test" />);
      expect(screen.getByLabelText("送信")).toHaveAttribute(
        "aria-busy",
        "true",
      );
    });
  });

  describe("無効状態", () => {
    it("disabled=trueで入力フィールドを無効化する", () => {
      render(<ChatInput {...defaultProps} disabled />);
      expect(screen.getByPlaceholderText("メッセージを入力...")).toBeDisabled();
    });

    it("disabled=trueで送信ボタンを無効化する", () => {
      render(<ChatInput {...defaultProps} disabled value="Test" />);
      expect(screen.getByLabelText("送信")).toBeDisabled();
    });

    it("disabled=trueで送信しない", () => {
      const handleSend = vi.fn();
      render(
        <ChatInput
          {...defaultProps}
          value="Hello"
          disabled
          onSend={handleSend}
        />,
      );
      fireEvent.click(screen.getByLabelText("送信"));
      expect(handleSend).not.toHaveBeenCalled();
    });
  });

  describe("送信ボタンの有効/無効", () => {
    it("valueが空の場合、送信ボタンを無効化する", () => {
      render(<ChatInput {...defaultProps} value="" />);
      expect(screen.getByLabelText("送信")).toBeDisabled();
    });

    it("valueがある場合、送信ボタンを有効化する", () => {
      render(<ChatInput {...defaultProps} value="Hello" />);
      expect(screen.getByLabelText("送信")).not.toBeDisabled();
    });
  });

  describe("className", () => {
    it("カスタムclassNameを追加する", () => {
      const { container } = render(
        <ChatInput {...defaultProps} className="custom-class" />,
      );
      expect(container.firstChild).toHaveClass("custom-class");
    });
  });

  describe("displayName", () => {
    it("displayNameが設定されている", () => {
      expect(ChatInput.displayName).toBe("ChatInput");
    });
  });
});
