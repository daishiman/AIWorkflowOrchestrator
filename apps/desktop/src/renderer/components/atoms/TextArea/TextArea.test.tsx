import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TextArea } from "./index";

describe("TextArea", () => {
  const defaultProps = {
    value: "",
    onChange: vi.fn(),
  };

  describe("レンダリング", () => {
    it("textareaをレンダリングする", () => {
      render(<TextArea {...defaultProps} />);
      expect(screen.getByRole("textbox")).toBeInTheDocument();
    });

    it("placeholderを表示する", () => {
      render(<TextArea {...defaultProps} placeholder="Enter description..." />);
      expect(
        screen.getByPlaceholderText("Enter description..."),
      ).toBeInTheDocument();
    });

    it("valueを表示する", () => {
      render(<TextArea {...defaultProps} value="test content" />);
      expect(screen.getByDisplayValue("test content")).toBeInTheDocument();
    });

    it("デフォルトで4行を表示する", () => {
      render(<TextArea {...defaultProps} />);
      expect(screen.getByRole("textbox")).toHaveAttribute("rows", "4");
    });

    it("カスタム行数を設定できる", () => {
      render(<TextArea {...defaultProps} rows={8} />);
      expect(screen.getByRole("textbox")).toHaveAttribute("rows", "8");
    });
  });

  describe("インタラクション", () => {
    it("入力時にonChangeを呼び出す", async () => {
      const handleChange = vi.fn();
      render(<TextArea value="" onChange={handleChange} />);
      const textarea = screen.getByRole("textbox");
      await userEvent.type(textarea, "a");
      expect(handleChange).toHaveBeenCalledWith("a");
    });

    it("複数文字の入力で複数回onChangeを呼び出す", async () => {
      const handleChange = vi.fn();
      render(<TextArea value="" onChange={handleChange} />);
      const textarea = screen.getByRole("textbox");
      await userEvent.type(textarea, "abc");
      expect(handleChange).toHaveBeenCalledTimes(3);
    });
  });

  describe("状態", () => {
    it("disabled状態で入力できない", () => {
      render(<TextArea {...defaultProps} disabled />);
      expect(screen.getByRole("textbox")).toBeDisabled();
    });

    it("disabled状態でdisabledスタイルを適用する", () => {
      render(<TextArea {...defaultProps} disabled />);
      expect(screen.getByRole("textbox")).toHaveClass("opacity-50");
      expect(screen.getByRole("textbox")).toHaveClass("cursor-not-allowed");
    });
  });

  describe("リサイズ", () => {
    it("デフォルトでverticalリサイズ", () => {
      render(<TextArea {...defaultProps} />);
      expect(screen.getByRole("textbox")).toHaveClass("resize-y");
    });

    it("noneリサイズを設定できる", () => {
      render(<TextArea {...defaultProps} resize="none" />);
      expect(screen.getByRole("textbox")).toHaveClass("resize-none");
    });

    it("horizontalリサイズを設定できる", () => {
      render(<TextArea {...defaultProps} resize="horizontal" />);
      expect(screen.getByRole("textbox")).toHaveClass("resize-x");
    });

    it("bothリサイズを設定できる", () => {
      render(<TextArea {...defaultProps} resize="both" />);
      expect(screen.getByRole("textbox")).toHaveClass("resize");
    });
  });

  describe("フォントファミリー", () => {
    it("デフォルトでsansフォント（font-monoなし）", () => {
      render(<TextArea {...defaultProps} />);
      expect(screen.getByRole("textbox")).not.toHaveClass("font-mono");
    });

    it("monoフォントを設定できる", () => {
      render(<TextArea {...defaultProps} fontFamily="mono" />);
      expect(screen.getByRole("textbox")).toHaveClass("font-mono");
    });
  });

  describe("アクセシビリティ", () => {
    it("idを設定できる", () => {
      render(<TextArea {...defaultProps} id="my-textarea" />);
      expect(screen.getByRole("textbox")).toHaveAttribute("id", "my-textarea");
    });

    it("nameを設定できる", () => {
      render(<TextArea {...defaultProps} name="description" />);
      expect(screen.getByRole("textbox")).toHaveAttribute(
        "name",
        "description",
      );
    });

    it("aria-describedbyを設定できる", () => {
      render(<TextArea {...defaultProps} aria-describedby="help-text" />);
      expect(screen.getByRole("textbox")).toHaveAttribute(
        "aria-describedby",
        "help-text",
      );
    });

    it("フォーカス可能である", () => {
      render(<TextArea {...defaultProps} />);
      const textarea = screen.getByRole("textbox");
      textarea.focus();
      expect(document.activeElement).toBe(textarea);
    });
  });

  describe("className", () => {
    it("カスタムclassNameを追加する", () => {
      render(<TextArea {...defaultProps} className="custom-class" />);
      expect(screen.getByRole("textbox")).toHaveClass("custom-class");
    });
  });

  describe("ref", () => {
    it("refを正しく転送する", () => {
      const ref = vi.fn();
      render(<TextArea {...defaultProps} ref={ref} />);
      expect(ref).toHaveBeenCalled();
      expect(ref.mock.calls[0][0]).toBeInstanceOf(HTMLTextAreaElement);
    });
  });

  describe("displayName", () => {
    it("displayNameが設定されている", () => {
      expect(TextArea.displayName).toBe("TextArea");
    });
  });
});
