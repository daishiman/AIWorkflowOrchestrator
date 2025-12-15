/**
 * SearchOptionsBar コンポーネントのテスト
 */

import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SearchOptionsBar, type SearchOptions } from "../SearchOptionsBar";

describe("SearchOptionsBar", () => {
  const defaultOptions: SearchOptions = {
    caseSensitive: false,
    wholeWord: false,
    useRegex: false,
  };

  const createProps = (overrides = {}) => ({
    options: defaultOptions,
    onOptionToggle: vi.fn(),
    ...overrides,
  });

  describe("レンダリング", () => {
    it("3つのオプションボタンを表示する", () => {
      render(<SearchOptionsBar {...createProps()} />);

      expect(screen.getByLabelText(/case sensitive/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/whole word/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/regex/i)).toBeInTheDocument();
    });

    it("各ボタンに正しいラベルを表示する", () => {
      render(<SearchOptionsBar {...createProps()} />);

      expect(screen.getByText("Aa")).toBeInTheDocument();
      expect(screen.getByText("Ab")).toBeInTheDocument();
      expect(screen.getByText(".*")).toBeInTheDocument();
    });

    it("checkbox roleを持つ", () => {
      render(<SearchOptionsBar {...createProps()} />);

      const buttons = screen.getAllByRole("checkbox");
      expect(buttons).toHaveLength(3);
    });
  });

  describe("状態表示", () => {
    it("caseSensitiveがtrueの場合、チェック状態を表示する", () => {
      const options = { ...defaultOptions, caseSensitive: true };
      render(<SearchOptionsBar {...createProps({ options })} />);

      const button = screen.getByLabelText(/case sensitive/i);
      expect(button).toHaveAttribute("aria-checked", "true");
      expect(button).toHaveClass("bg-blue-500");
    });

    it("wholeWordがtrueの場合、チェック状態を表示する", () => {
      const options = { ...defaultOptions, wholeWord: true };
      render(<SearchOptionsBar {...createProps({ options })} />);

      const button = screen.getByLabelText(/whole word/i);
      expect(button).toHaveAttribute("aria-checked", "true");
      expect(button).toHaveClass("bg-blue-500");
    });

    it("useRegexがtrueの場合、チェック状態を表示する", () => {
      const options = { ...defaultOptions, useRegex: true };
      render(<SearchOptionsBar {...createProps({ options })} />);

      const button = screen.getByLabelText(/regex/i);
      expect(button).toHaveAttribute("aria-checked", "true");
      expect(button).toHaveClass("bg-blue-500");
    });

    it("すべてfalseの場合、非チェック状態を表示する", () => {
      render(<SearchOptionsBar {...createProps()} />);

      const buttons = screen.getAllByRole("checkbox");
      buttons.forEach((button) => {
        expect(button).toHaveAttribute("aria-checked", "false");
        expect(button).toHaveClass("bg-slate-700");
      });
    });
  });

  describe("インタラクション", () => {
    it("caseSensitiveボタンクリックでonOptionToggleを呼び出す", async () => {
      const user = userEvent.setup();
      const onOptionToggle = vi.fn();
      render(<SearchOptionsBar {...createProps({ onOptionToggle })} />);

      await user.click(screen.getByLabelText(/case sensitive/i));

      expect(onOptionToggle).toHaveBeenCalledWith("caseSensitive");
    });

    it("wholeWordボタンクリックでonOptionToggleを呼び出す", async () => {
      const user = userEvent.setup();
      const onOptionToggle = vi.fn();
      render(<SearchOptionsBar {...createProps({ onOptionToggle })} />);

      await user.click(screen.getByLabelText(/whole word/i));

      expect(onOptionToggle).toHaveBeenCalledWith("wholeWord");
    });

    it("useRegexボタンクリックでonOptionToggleを呼び出す", async () => {
      const user = userEvent.setup();
      const onOptionToggle = vi.fn();
      render(<SearchOptionsBar {...createProps({ onOptionToggle })} />);

      await user.click(screen.getByLabelText(/regex/i));

      expect(onOptionToggle).toHaveBeenCalledWith("useRegex");
    });
  });

  describe("無効化状態", () => {
    it("disabledがtrueの場合、すべてのボタンが無効化される", () => {
      render(<SearchOptionsBar {...createProps({ disabled: true })} />);

      const buttons = screen.getAllByRole("checkbox");
      buttons.forEach((button) => {
        expect(button).toBeDisabled();
        expect(button).toHaveClass("opacity-50");
      });
    });

    it("disabledがtrueの場合、クリックしてもonOptionToggleを呼び出さない", async () => {
      const user = userEvent.setup();
      const onOptionToggle = vi.fn();
      render(
        <SearchOptionsBar
          {...createProps({ onOptionToggle, disabled: true })}
        />,
      );

      // disabled buttonはクリックできないが、念のためテスト
      const button = screen.getByLabelText(/case sensitive/i);
      await user.click(button);

      expect(onOptionToggle).not.toHaveBeenCalled();
    });
  });

  describe("カスタムクラス", () => {
    it("classNameプロパティが適用される", () => {
      const { container } = render(
        <SearchOptionsBar {...createProps({ className: "custom-class" })} />,
      );

      expect(container.firstChild).toHaveClass("custom-class");
    });
  });
});
