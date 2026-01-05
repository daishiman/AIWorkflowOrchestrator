import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SystemPromptTextArea } from "./index";

describe("SystemPromptTextArea", () => {
  const defaultProps = {
    value: "",
    onChange: vi.fn(),
    maxLength: 4000,
  };

  describe("レンダリング", () => {
    it("textareaをレンダリングする", () => {
      render(<SystemPromptTextArea {...defaultProps} />);
      expect(screen.getByRole("textbox")).toBeInTheDocument();
    });

    it("placeholderを表示する", () => {
      render(
        <SystemPromptTextArea
          {...defaultProps}
          placeholder="システムプロンプトを入力..."
        />,
      );
      expect(
        screen.getByPlaceholderText("システムプロンプトを入力..."),
      ).toBeInTheDocument();
    });

    it("valueを表示する", () => {
      render(<SystemPromptTextArea {...defaultProps} value="test value" />);
      expect(screen.getByDisplayValue("test value")).toBeInTheDocument();
    });

    it("aria-describedbyを設定する", () => {
      render(<SystemPromptTextArea {...defaultProps} />);
      expect(screen.getByRole("textbox")).toHaveAttribute(
        "aria-describedby",
        "character-counter",
      );
    });
  });

  describe("インタラクション", () => {
    it("入力時にonChangeを呼び出す", async () => {
      const handleChange = vi.fn();
      render(
        <SystemPromptTextArea {...defaultProps} onChange={handleChange} />,
      );
      const textarea = screen.getByRole("textbox");
      await userEvent.type(textarea, "a");
      expect(handleChange).toHaveBeenCalledWith("a");
    });

    it("複数行入力をサポートする", async () => {
      const handleChange = vi.fn();
      render(
        <SystemPromptTextArea {...defaultProps} onChange={handleChange} />,
      );
      const textarea = screen.getByRole("textbox");
      await userEvent.type(textarea, "line1{Enter}line2");
      expect(handleChange).toHaveBeenCalled();
    });

    it("Tabキーでインデントを挿入する", () => {
      const handleChange = vi.fn();
      render(
        <SystemPromptTextArea {...defaultProps} onChange={handleChange} />,
      );
      const textarea = screen.getByRole("textbox");
      fireEvent.keyDown(textarea, { key: "Tab" });
      expect(handleChange).toHaveBeenCalled();
    });
  });

  describe("文字数制限", () => {
    it("maxLength属性を設定する", () => {
      render(<SystemPromptTextArea {...defaultProps} />);
      expect(screen.getByRole("textbox")).toHaveAttribute("maxLength", "4000");
    });

    it("最大文字数を超える入力を防ぐ", async () => {
      const handleChange = vi.fn();
      render(
        <SystemPromptTextArea
          {...defaultProps}
          maxLength={10}
          onChange={handleChange}
        />,
      );
      const textarea = screen.getByRole("textbox") as HTMLTextAreaElement;

      // maxLength属性により、ブラウザが自動的に制限を適用
      expect(textarea.maxLength).toBe(10);
    });

    it("最大文字数到達時に視覚的フィードバックを提供する", () => {
      const longText = "a".repeat(4000);
      render(<SystemPromptTextArea {...defaultProps} value={longText} />);
      const textarea = screen.getByRole("textbox");
      expect(textarea).toHaveClass("border-red-400");
    });
  });

  describe("状態", () => {
    it("disabled状態で入力できない", () => {
      render(<SystemPromptTextArea {...defaultProps} disabled />);
      expect(screen.getByRole("textbox")).toBeDisabled();
    });

    it("通常状態で入力できる", () => {
      render(<SystemPromptTextArea {...defaultProps} />);
      expect(screen.getByRole("textbox")).not.toBeDisabled();
    });
  });

  describe("スタイリング", () => {
    it("デフォルトスタイルを適用する", () => {
      render(<SystemPromptTextArea {...defaultProps} />);
      const textarea = screen.getByRole("textbox");
      expect(textarea).toHaveClass("bg-black/20");
      expect(textarea).toHaveClass("border-white/10");
    });

    it("フォーカス時のスタイルを適用する", () => {
      render(<SystemPromptTextArea {...defaultProps} />);
      const textarea = screen.getByRole("textbox");
      fireEvent.focus(textarea);
      expect(textarea).toHaveClass("border-[var(--status-primary)]");
    });

    it("カスタムclassNameを適用する", () => {
      render(
        <SystemPromptTextArea {...defaultProps} className="custom-class" />,
      );
      const textarea = screen.getByRole("textbox");
      expect(textarea).toHaveClass("custom-class");
    });
  });

  describe("自動リサイズ", () => {
    it("最小高さを120pxに設定する", () => {
      render(<SystemPromptTextArea {...defaultProps} />);
      const textarea = screen.getByRole("textbox");
      expect(textarea).toHaveStyle({ minHeight: "120px" });
    });

    it("最大高さを300pxに設定する", () => {
      render(<SystemPromptTextArea {...defaultProps} />);
      const textarea = screen.getByRole("textbox");
      expect(textarea).toHaveStyle({ maxHeight: "300px" });
    });

    it("縦リサイズを許可する", () => {
      render(<SystemPromptTextArea {...defaultProps} />);
      const textarea = screen.getByRole("textbox");
      expect(textarea).toHaveStyle({ resize: "vertical" });
    });
  });

  describe("アクセシビリティ", () => {
    it("aria-labelを設定する", () => {
      render(<SystemPromptTextArea {...defaultProps} />);
      expect(
        screen.getByLabelText("システムプロンプト入力"),
      ).toBeInTheDocument();
    });

    it("aria-requiredを設定しない（任意入力）", () => {
      render(<SystemPromptTextArea {...defaultProps} />);
      expect(screen.getByRole("textbox")).not.toHaveAttribute("aria-required");
    });

    it("aria-invalidを設定する（エラー時）", () => {
      const longText = "a".repeat(4001);
      render(<SystemPromptTextArea {...defaultProps} value={longText} />);
      expect(screen.getByRole("textbox")).toHaveAttribute(
        "aria-invalid",
        "true",
      );
    });
  });
});
