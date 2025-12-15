/**
 * SearchInputField コンポーネントのテスト
 */

import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SearchInputField } from "../SearchInputField";

describe("SearchInputField", () => {
  const createProps = (overrides = {}) => ({
    value: "",
    onChange: vi.fn(),
    ...overrides,
  });

  describe("レンダリング", () => {
    it("入力フィールドを表示する", () => {
      render(<SearchInputField {...createProps()} />);

      expect(screen.getByRole("textbox")).toBeInTheDocument();
    });

    it("valueプロパティの値を表示する", () => {
      render(<SearchInputField {...createProps({ value: "test query" })} />);

      expect(screen.getByRole("textbox")).toHaveValue("test query");
    });

    it("placeholderを表示する", () => {
      render(<SearchInputField {...createProps({ placeholder: "検索..." })} />);

      expect(screen.getByPlaceholderText("検索...")).toBeInTheDocument();
    });
  });

  describe("入力処理", () => {
    it("入力時にonChangeを呼び出す", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      const { rerender } = render(
        <SearchInputField {...createProps({ onChange })} />,
      );

      // 制御されたコンポーネントのため、各入力後にrerenderが必要
      let currentValue = "";
      onChange.mockImplementation((newValue: string) => {
        currentValue = newValue;
      });

      const input = screen.getByRole("textbox");
      await user.type(input, "t");
      rerender(
        <SearchInputField
          {...createProps({ value: currentValue, onChange })}
        />,
      );
      await user.type(input, "e");
      rerender(
        <SearchInputField
          {...createProps({ value: currentValue, onChange })}
        />,
      );
      await user.type(input, "s");
      rerender(
        <SearchInputField
          {...createProps({ value: currentValue, onChange })}
        />,
      );
      await user.type(input, "t");

      expect(onChange).toHaveBeenCalledTimes(4);
      expect(onChange).toHaveBeenLastCalledWith("test");
    });

    it("値をクリアするとonChangeを呼び出す", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(
        <SearchInputField {...createProps({ value: "test", onChange })} />,
      );

      await user.clear(screen.getByRole("textbox"));

      expect(onChange).toHaveBeenCalledWith("");
    });
  });

  describe("エラー状態", () => {
    it("hasErrorがfalseの場合、通常のボーダーを表示する", () => {
      render(<SearchInputField {...createProps({ hasError: false })} />);

      expect(screen.getByRole("textbox")).toHaveClass("border-slate-600");
      expect(screen.getByRole("textbox")).not.toHaveClass("border-red-500");
    });

    it("hasErrorがtrueの場合、エラーボーダーを表示する", () => {
      render(<SearchInputField {...createProps({ hasError: true })} />);

      expect(screen.getByRole("textbox")).toHaveClass("border-red-500");
      expect(screen.getByRole("textbox")).not.toHaveClass("border-slate-600");
    });
  });

  describe("IME対応", () => {
    it("compositionstartイベントでonCompositionStartを呼び出す", async () => {
      const onCompositionStart = vi.fn();
      render(<SearchInputField {...createProps({ onCompositionStart })} />);

      const input = screen.getByRole("textbox");
      // fireEventを使用してReactのイベントハンドラをトリガー
      await import("@testing-library/react").then(({ fireEvent }) => {
        fireEvent.compositionStart(input);
      });

      expect(onCompositionStart).toHaveBeenCalled();
    });

    it("compositionendイベントでonCompositionEndを呼び出す", async () => {
      const onCompositionEnd = vi.fn();
      render(<SearchInputField {...createProps({ onCompositionEnd })} />);

      const input = screen.getByRole("textbox");
      // fireEventを使用してReactのイベントハンドラをトリガー
      await import("@testing-library/react").then(({ fireEvent }) => {
        fireEvent.compositionEnd(input);
      });

      expect(onCompositionEnd).toHaveBeenCalled();
    });
  });

  describe("その他のプロパティ", () => {
    it("aria-labelを設定できる", () => {
      render(
        <SearchInputField {...createProps({ "aria-label": "検索入力" })} />,
      );

      expect(screen.getByLabelText("検索入力")).toBeInTheDocument();
    });

    it("disabledを設定できる", () => {
      render(<SearchInputField {...createProps({ disabled: true })} />);

      expect(screen.getByRole("textbox")).toBeDisabled();
    });

    it("classNameが適用される", () => {
      render(
        <SearchInputField {...createProps({ className: "custom-class" })} />,
      );

      expect(screen.getByRole("textbox")).toHaveClass("custom-class");
    });

    it("data-testidを設定できる", () => {
      render(
        <SearchInputField
          {...createProps({ "data-testid": "search-input" })}
        />,
      );

      expect(screen.getByTestId("search-input")).toBeInTheDocument();
    });
  });

  describe("refの転送", () => {
    it("refを正しく転送する", () => {
      const ref = vi.fn();
      render(<SearchInputField {...createProps()} ref={ref} />);

      expect(ref).toHaveBeenCalled();
      expect(ref.mock.calls[0][0]).toBeInstanceOf(HTMLInputElement);
    });
  });
});
