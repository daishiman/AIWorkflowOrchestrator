import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ThemeSelector } from "./index";
import type { ThemeMode } from "../../../store/types";

// Note: This file tests ThemeSelector component which doesn't exist yet (TDD Red phase)
// Tests will fail until implementation is created

describe("ThemeSelector", () => {
  const mockOnChange = vi.fn();
  const defaultProps = {
    value: "system" as ThemeMode,
    onChange: mockOnChange,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("レンダリング", () => {
    it("3つのテーマオプションボタンを表示する", () => {
      render(<ThemeSelector {...defaultProps} />);

      expect(
        screen.getByRole("radio", { name: /ライト/i }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("radio", { name: /ダーク/i }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("radio", { name: /システム/i }),
      ).toBeInTheDocument();
    });

    it("radiogroupロールを持つ", () => {
      render(<ThemeSelector {...defaultProps} />);
      expect(screen.getByRole("radiogroup")).toBeInTheDocument();
    });

    it("各オプションにradioロールを持つ", () => {
      render(<ThemeSelector {...defaultProps} />);
      const radios = screen.getAllByRole("radio");
      expect(radios).toHaveLength(3);
    });

    it("アイコンを表示する", () => {
      render(<ThemeSelector {...defaultProps} />);

      // アイコンはaria-hiddenなので、テストID or 親要素から確認
      expect(screen.getByTestId("theme-icon-sun")).toBeInTheDocument();
      expect(screen.getByTestId("theme-icon-moon")).toBeInTheDocument();
      expect(screen.getByTestId("theme-icon-monitor")).toBeInTheDocument();
    });
  });

  describe("選択状態", () => {
    it("lightが選択されている時、lightボタンがchecked状態になる", () => {
      render(<ThemeSelector {...defaultProps} value="light" />);

      const lightRadio = screen.getByRole("radio", { name: /ライト/i });
      expect(lightRadio).toHaveAttribute("aria-checked", "true");
    });

    it("darkが選択されている時、darkボタンがchecked状態になる", () => {
      render(<ThemeSelector {...defaultProps} value="dark" />);

      const darkRadio = screen.getByRole("radio", { name: /ダーク/i });
      expect(darkRadio).toHaveAttribute("aria-checked", "true");
    });

    it("systemが選択されている時、systemボタンがchecked状態になる", () => {
      render(<ThemeSelector {...defaultProps} value="system" />);

      const systemRadio = screen.getByRole("radio", { name: /システム/i });
      expect(systemRadio).toHaveAttribute("aria-checked", "true");
    });

    it("選択されたボタンは選択スタイルを持つ", () => {
      render(<ThemeSelector {...defaultProps} value="dark" />);

      const darkButton = screen.getByRole("radio", { name: /ダーク/i });
      // CSS変数を使用したスタイル
      expect(darkButton).toHaveClass("bg-[var(--status-primary)]");
    });

    it("未選択のボタンは未選択スタイルを持つ", () => {
      render(<ThemeSelector {...defaultProps} value="dark" />);

      const lightButton = screen.getByRole("radio", { name: /ライト/i });
      expect(lightButton).not.toHaveClass("bg-[var(--status-primary)]");
    });
  });

  describe("インタラクション", () => {
    it("ボタンクリックでonChangeが呼ばれる", () => {
      render(<ThemeSelector {...defaultProps} value="system" />);

      const lightButton = screen.getByRole("radio", { name: /ライト/i });
      fireEvent.click(lightButton);

      expect(mockOnChange).toHaveBeenCalledWith("light");
    });

    it("darkボタンクリックでonChange('dark')が呼ばれる", () => {
      render(<ThemeSelector {...defaultProps} value="system" />);

      const darkButton = screen.getByRole("radio", { name: /ダーク/i });
      fireEvent.click(darkButton);

      expect(mockOnChange).toHaveBeenCalledWith("dark");
    });

    it("systemボタンクリックでonChange('system')が呼ばれる", () => {
      render(<ThemeSelector {...defaultProps} value="light" />);

      const systemButton = screen.getByRole("radio", { name: /システム/i });
      fireEvent.click(systemButton);

      expect(mockOnChange).toHaveBeenCalledWith("system");
    });

    it("既に選択されているボタンをクリックしてもonChangeが呼ばれる", () => {
      render(<ThemeSelector {...defaultProps} value="dark" />);

      const darkButton = screen.getByRole("radio", { name: /ダーク/i });
      fireEvent.click(darkButton);

      expect(mockOnChange).toHaveBeenCalledWith("dark");
    });
  });

  describe("サイズ", () => {
    it("smサイズのスタイルを適用する", () => {
      render(<ThemeSelector {...defaultProps} size="sm" />);

      const buttons = screen.getAllByRole("radio");
      buttons.forEach((button) => {
        expect(button).toHaveClass("h-8");
      });
    });

    it("mdサイズ（デフォルト）のスタイルを適用する", () => {
      render(<ThemeSelector {...defaultProps} />);

      const buttons = screen.getAllByRole("radio");
      buttons.forEach((button) => {
        expect(button).toHaveClass("h-10");
      });
    });

    it("lgサイズのスタイルを適用する", () => {
      render(<ThemeSelector {...defaultProps} size="lg" />);

      const buttons = screen.getAllByRole("radio");
      buttons.forEach((button) => {
        expect(button).toHaveClass("h-12");
      });
    });
  });

  describe("無効状態", () => {
    it("disabled時にボタンがdisabled属性を持つ", () => {
      render(<ThemeSelector {...defaultProps} disabled />);

      const buttons = screen.getAllByRole("radio");
      buttons.forEach((button) => {
        expect(button).toBeDisabled();
      });
    });

    it("disabled時にクリックしてもonChangeが呼ばれない", () => {
      render(<ThemeSelector {...defaultProps} disabled />);

      const lightButton = screen.getByRole("radio", { name: /ライト/i });
      fireEvent.click(lightButton);

      expect(mockOnChange).not.toHaveBeenCalled();
    });

    it("disabled時に無効スタイルを適用する", () => {
      render(<ThemeSelector {...defaultProps} disabled />);

      const container = screen.getByRole("radiogroup");
      expect(container).toHaveClass("opacity-50");
    });
  });

  describe("ラベル表示", () => {
    it("showLabels=trueでラベルテキストを表示する", () => {
      render(<ThemeSelector {...defaultProps} showLabels />);

      expect(screen.getByText("ライト")).toBeInTheDocument();
      expect(screen.getByText("ダーク")).toBeInTheDocument();
      expect(screen.getByText("システム")).toBeInTheDocument();
    });

    it("showLabels=falseでラベルテキストを非表示にする", () => {
      render(<ThemeSelector {...defaultProps} showLabels={false} />);

      // アイコンは表示されているが、テキストラベルは非表示
      expect(screen.queryByText("ライト")).not.toBeInTheDocument();
      expect(screen.queryByText("ダーク")).not.toBeInTheDocument();
      expect(screen.queryByText("システム")).not.toBeInTheDocument();
    });

    it("showLabels=false時もaria-labelが設定される", () => {
      render(<ThemeSelector {...defaultProps} showLabels={false} />);

      const lightButton = screen.getByRole("radio", { name: /ライト/i });
      expect(lightButton).toHaveAttribute("aria-label", "ライト");
    });
  });

  describe("fullWidth", () => {
    it("fullWidth=trueでw-fullクラスを適用する", () => {
      render(<ThemeSelector {...defaultProps} fullWidth />);

      const container = screen.getByRole("radiogroup");
      expect(container).toHaveClass("w-full");
    });

    it("fullWidth=false（デフォルト）でw-fullクラスを持たない", () => {
      render(<ThemeSelector {...defaultProps} />);

      const container = screen.getByRole("radiogroup");
      expect(container).not.toHaveClass("w-full");
    });
  });

  describe("アクセシビリティ", () => {
    it("キーボードナビゲーション: 矢印キーでフォーカス移動", () => {
      render(<ThemeSelector {...defaultProps} value="light" />);

      const lightButton = screen.getByRole("radio", { name: /ライト/i });
      lightButton.focus();

      fireEvent.keyDown(lightButton, { key: "ArrowRight" });

      // 次のボタン（ダーク）にフォーカスが移動
      const darkButton = screen.getByRole("radio", { name: /ダーク/i });
      expect(darkButton).toHaveFocus();
    });

    it("キーボードナビゲーション: スペースキーで選択", () => {
      render(<ThemeSelector {...defaultProps} value="light" />);

      const darkButton = screen.getByRole("radio", { name: /ダーク/i });
      darkButton.focus();

      fireEvent.keyDown(darkButton, { key: " " });

      expect(mockOnChange).toHaveBeenCalledWith("dark");
    });

    it("キーボードナビゲーション: Enterキーで選択", () => {
      render(<ThemeSelector {...defaultProps} value="light" />);

      const darkButton = screen.getByRole("radio", { name: /ダーク/i });
      darkButton.focus();

      fireEvent.keyDown(darkButton, { key: "Enter" });

      expect(mockOnChange).toHaveBeenCalledWith("dark");
    });

    it("aria-labelledbyが設定される", () => {
      render(<ThemeSelector {...defaultProps} aria-labelledby="theme-label" />);

      const radiogroup = screen.getByRole("radiogroup");
      expect(radiogroup).toHaveAttribute("aria-labelledby", "theme-label");
    });

    it("各オプションにaria-descriptionが設定される", () => {
      render(<ThemeSelector {...defaultProps} />);

      const lightButton = screen.getByRole("radio", { name: /ライト/i });
      expect(lightButton).toHaveAttribute(
        "aria-description",
        "常にライトテーマを使用",
      );
    });
  });

  describe("カスタムクラス", () => {
    it("classNameプロパティでカスタムクラスを追加できる", () => {
      render(<ThemeSelector {...defaultProps} className="custom-class" />);

      const container = screen.getByRole("radiogroup");
      expect(container).toHaveClass("custom-class");
    });
  });
});
