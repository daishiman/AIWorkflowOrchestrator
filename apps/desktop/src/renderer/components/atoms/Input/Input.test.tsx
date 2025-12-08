import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Input } from "./index";

describe("Input", () => {
  const defaultProps = {
    value: "",
    onChange: vi.fn(),
  };

  describe("レンダリング", () => {
    it("inputをレンダリングする", () => {
      render(<Input {...defaultProps} />);
      expect(screen.getByRole("textbox")).toBeInTheDocument();
    });

    it("placeholderを表示する", () => {
      render(<Input {...defaultProps} placeholder="Enter text..." />);
      expect(screen.getByPlaceholderText("Enter text...")).toBeInTheDocument();
    });

    it("valueを表示する", () => {
      render(<Input {...defaultProps} value="test value" />);
      expect(screen.getByDisplayValue("test value")).toBeInTheDocument();
    });

    it("デフォルトでtext typeを持つ", () => {
      render(<Input {...defaultProps} />);
      expect(screen.getByRole("textbox")).toHaveAttribute("type", "text");
    });
  });

  describe("タイプ", () => {
    it("email typeを設定できる", () => {
      render(<Input {...defaultProps} type="email" />);
      expect(screen.getByRole("textbox")).toHaveAttribute("type", "email");
    });

    it("search typeを設定できる", () => {
      render(<Input {...defaultProps} type="search" />);
      expect(screen.getByRole("searchbox")).toHaveAttribute("type", "search");
    });

    it("password typeを設定できる", () => {
      render(<Input {...defaultProps} type="password" />);
      // password inputはrole="textbox"を持たない
      const input = document.querySelector('input[type="password"]');
      expect(input).toBeInTheDocument();
    });
  });

  describe("インタラクション", () => {
    it("入力時にonChangeを呼び出す", async () => {
      const handleChange = vi.fn();
      render(<Input value="" onChange={handleChange} />);
      const input = screen.getByRole("textbox");
      await userEvent.type(input, "a");
      expect(handleChange).toHaveBeenCalledWith("a");
    });

    it("Enterキーでの onEnter を呼び出す", () => {
      const handleEnter = vi.fn();
      render(<Input {...defaultProps} onEnter={handleEnter} />);
      const input = screen.getByRole("textbox");
      fireEvent.keyDown(input, { key: "Enter" });
      expect(handleEnter).toHaveBeenCalledTimes(1);
    });

    it("他のキーでは onEnter を呼び出さない", () => {
      const handleEnter = vi.fn();
      render(<Input {...defaultProps} onEnter={handleEnter} />);
      const input = screen.getByRole("textbox");
      fireEvent.keyDown(input, { key: "Escape" });
      expect(handleEnter).not.toHaveBeenCalled();
    });

    it("onFocusを呼び出す", () => {
      const handleFocus = vi.fn();
      render(<Input {...defaultProps} onFocus={handleFocus} />);
      const input = screen.getByRole("textbox");
      fireEvent.focus(input);
      expect(handleFocus).toHaveBeenCalledTimes(1);
    });

    it("onBlurを呼び出す", () => {
      const handleBlur = vi.fn();
      render(<Input {...defaultProps} onBlur={handleBlur} />);
      const input = screen.getByRole("textbox");
      fireEvent.blur(input);
      expect(handleBlur).toHaveBeenCalledTimes(1);
    });
  });

  describe("状態", () => {
    it("disabled状態で入力できない", () => {
      render(<Input {...defaultProps} disabled />);
      expect(screen.getByRole("textbox")).toBeDisabled();
    });

    it("error状態でaria-invalidを設定する", () => {
      render(<Input {...defaultProps} error />);
      expect(screen.getByRole("textbox")).toHaveAttribute(
        "aria-invalid",
        "true",
      );
    });

    it("error状態でエラースタイルを適用する", () => {
      render(<Input {...defaultProps} error />);
      expect(screen.getByRole("textbox")).toHaveClass("border-red-500");
    });
  });

  describe("アイコン", () => {
    it("leftIconを表示する", () => {
      const { container } = render(<Input {...defaultProps} leftIcon="menu" />);
      const icon = container.querySelector('[aria-hidden="true"]');
      expect(icon).toBeInTheDocument();
    });

    it("rightIconを表示する", () => {
      const { container } = render(<Input {...defaultProps} rightIcon="x" />);
      const icon = container.querySelector('[aria-hidden="true"]');
      expect(icon).toBeInTheDocument();
    });

    it("leftIconがある場合、パディングを調整する", () => {
      render(<Input {...defaultProps} leftIcon="menu" />);
      expect(screen.getByRole("textbox")).toHaveClass("pl-10");
    });

    it("rightIconがある場合、パディングを調整する", () => {
      render(<Input {...defaultProps} rightIcon="x" />);
      expect(screen.getByRole("textbox")).toHaveClass("pr-10");
    });
  });

  describe("アクセシビリティ", () => {
    it("idを設定できる", () => {
      render(<Input {...defaultProps} id="my-input" />);
      expect(screen.getByRole("textbox")).toHaveAttribute("id", "my-input");
    });

    it("nameを設定できる", () => {
      render(<Input {...defaultProps} name="username" />);
      expect(screen.getByRole("textbox")).toHaveAttribute("name", "username");
    });

    it("aria-describedbyを設定できる", () => {
      render(<Input {...defaultProps} aria-describedby="help-text" />);
      expect(screen.getByRole("textbox")).toHaveAttribute(
        "aria-describedby",
        "help-text",
      );
    });

    it("フォーカス可能である", () => {
      render(<Input {...defaultProps} />);
      const input = screen.getByRole("textbox");
      input.focus();
      expect(document.activeElement).toBe(input);
    });
  });

  describe("ref", () => {
    it("refを正しく転送する", () => {
      const ref = vi.fn();
      render(<Input {...defaultProps} ref={ref} />);
      expect(ref).toHaveBeenCalled();
      expect(ref.mock.calls[0][0]).toBeInstanceOf(HTMLInputElement);
    });
  });
});
