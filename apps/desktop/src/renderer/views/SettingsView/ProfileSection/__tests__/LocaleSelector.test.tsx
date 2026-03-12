/**
 * LocaleSelector コンポーネントテスト
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { LocaleSelector } from "../LocaleSelector";
import type { Locale } from "@repo/shared/types/auth";

describe("LocaleSelector", () => {
  const mockOnChange = vi.fn();
  const defaultProps = {
    value: "ja" as Locale,
    onChange: mockOnChange,
    disabled: false,
    isLoading: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("レンダリング", () => {
    it("ロケール選択コンポーネントをレンダリングする", () => {
      render(<LocaleSelector {...defaultProps} />);
      expect(screen.getByTestId("locale-selector")).toBeInTheDocument();
    });

    it("現在のロケールを表示する", () => {
      render(<LocaleSelector {...defaultProps} />);
      expect(screen.getByText("日本語")).toBeInTheDocument();
    });

    it("言語ラベルを表示する", () => {
      render(<LocaleSelector {...defaultProps} />);
      expect(screen.getByText("言語")).toBeInTheDocument();
    });
  });

  describe("ドロップダウン操作", () => {
    it("クリックするとドロップダウンが開く", async () => {
      render(<LocaleSelector {...defaultProps} />);
      const combobox = screen.getByRole("combobox", { name: /言語/i });
      await userEvent.click(combobox);
      expect(screen.getByRole("listbox")).toBeInTheDocument();
    });

    it("サポート言語オプションが表示される", async () => {
      render(<LocaleSelector {...defaultProps} />);
      const combobox = screen.getByRole("combobox", { name: /言語/i });
      await userEvent.click(combobox);

      expect(screen.getByText("English")).toBeInTheDocument();
      expect(screen.getByText("简体中文")).toBeInTheDocument();
      expect(screen.getByText("繁體中文")).toBeInTheDocument();
      expect(screen.getByText("한국어")).toBeInTheDocument();
    });
  });

  describe("ロケール変更", () => {
    it("言語を選択するとonChangeが呼ばれる", async () => {
      render(<LocaleSelector {...defaultProps} />);
      const combobox = screen.getByRole("combobox", { name: /言語/i });
      await userEvent.click(combobox);

      const englishOption = screen.getByRole("option", { name: /English/i });
      await userEvent.click(englishOption);

      expect(mockOnChange).toHaveBeenCalledWith("en");
    });
  });

  describe("ローディング状態", () => {
    it("ローディング中は選択が無効化される", () => {
      render(<LocaleSelector {...defaultProps} isLoading={true} />);
      const combobox = screen.getByRole("combobox", { name: /言語/i });
      expect(combobox).toBeDisabled();
    });
  });

  describe("アクセシビリティ", () => {
    it("aria-labelを持つ", () => {
      render(<LocaleSelector {...defaultProps} />);
      const combobox = screen.getByRole("combobox", { name: /言語/i });
      expect(combobox).toHaveAttribute("aria-label");
    });

    it("Escキーでドロップダウンを閉じる", async () => {
      render(<LocaleSelector {...defaultProps} />);
      const combobox = screen.getByRole("combobox", { name: /言語/i });
      await userEvent.click(combobox);
      expect(screen.getByRole("listbox")).toBeInTheDocument();

      fireEvent.keyDown(screen.getByTestId("locale-selector"), {
        key: "Escape",
      });
      expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
    });
  });

  describe("Props", () => {
    it("classNameを追加できる", () => {
      render(<LocaleSelector {...defaultProps} className="custom-class" />);
      expect(screen.getByTestId("locale-selector")).toHaveClass("custom-class");
    });

    it("disabledでコンポーネントを無効化できる", () => {
      render(<LocaleSelector {...defaultProps} disabled={true} />);
      const combobox = screen.getByRole("combobox", { name: /言語/i });
      expect(combobox).toBeDisabled();
    });
  });
});
