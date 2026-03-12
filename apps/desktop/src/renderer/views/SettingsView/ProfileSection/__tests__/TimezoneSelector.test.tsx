/**
 * TimezoneSelector コンポーネントテスト
 *
 * @description
 * タイムゾーン選択UIコンポーネントのテスト
 *
 * 対象機能:
 * - タイムゾーン選択ドロップダウン
 * - 現在のタイムゾーン表示
 * - タイムゾーン変更時のコールバック
 * - よく使うタイムゾーンのクイック選択
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TimezoneSelector } from "../TimezoneSelector";

// =============================================================================
// テストスイート
// =============================================================================

describe("TimezoneSelector", () => {
  const mockOnChange = vi.fn();
  const defaultProps = {
    value: "Asia/Tokyo",
    onChange: mockOnChange,
    disabled: false,
    isLoading: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("レンダリング", () => {
    it("タイムゾーン選択コンポーネントをレンダリングする", () => {
      render(<TimezoneSelector {...defaultProps} />);
      expect(screen.getByTestId("timezone-selector")).toBeInTheDocument();
    });

    it("現在のタイムゾーンラベルを表示する", () => {
      render(<TimezoneSelector {...defaultProps} />);
      expect(screen.getByText(/日本標準時/)).toBeInTheDocument();
    });

    it("タイムゾーンラベルを表示する", () => {
      render(<TimezoneSelector {...defaultProps} />);
      expect(screen.getByText("タイムゾーン")).toBeInTheDocument();
    });

    it("現在時刻のプレビューを表示する", () => {
      render(<TimezoneSelector {...defaultProps} />);
      expect(screen.getByText(/現在の時刻:/)).toBeInTheDocument();
    });
  });

  describe("ドロップダウン操作", () => {
    it("クリックするとドロップダウンが開く", async () => {
      render(<TimezoneSelector {...defaultProps} />);
      const combobox = screen.getByRole("combobox", { name: /タイムゾーン/i });
      await userEvent.click(combobox);
      expect(screen.getByRole("listbox")).toBeInTheDocument();
    });

    it("よく使うタイムゾーンが表示される", async () => {
      render(<TimezoneSelector {...defaultProps} />);
      const combobox = screen.getByRole("combobox", { name: /タイムゾーン/i });
      await userEvent.click(combobox);
      expect(screen.getByText(/米国東部時間/)).toBeInTheDocument();
    });

    it("タイムゾーンを検索できる", async () => {
      render(<TimezoneSelector {...defaultProps} />);
      const combobox = screen.getByRole("combobox", { name: /タイムゾーン/i });
      await userEvent.click(combobox);

      const searchInput = screen.getByPlaceholderText(/検索/i);
      await userEvent.type(searchInput, "London");
      expect(screen.getByText(/英国時間/)).toBeInTheDocument();
    });
  });

  describe("タイムゾーン変更", () => {
    it("タイムゾーンを選択するとonChangeが呼ばれる", async () => {
      render(<TimezoneSelector {...defaultProps} />);
      const combobox = screen.getByRole("combobox", { name: /タイムゾーン/i });
      await userEvent.click(combobox);

      const newYorkOption = screen.getByRole("option", {
        name: /米国東部時間/,
      });
      await userEvent.click(newYorkOption);

      expect(mockOnChange).toHaveBeenCalledWith("America/New_York");
    });
  });

  describe("クイック選択", () => {
    it("「現在地のタイムゾーン」ボタンを表示する", () => {
      render(<TimezoneSelector {...defaultProps} />);
      expect(
        screen.getByRole("button", { name: /現在地/i }),
      ).toBeInTheDocument();
    });

    it("「現在地のタイムゾーン」をクリックするとブラウザのタイムゾーンが設定される", async () => {
      render(<TimezoneSelector {...defaultProps} />);
      const detectButton = screen.getByRole("button", { name: /現在地/i });
      await userEvent.click(detectButton);

      // ブラウザのタイムゾーンがonChangeに渡される
      expect(mockOnChange).toHaveBeenCalled();
    });
  });

  describe("ローディング状態", () => {
    it("ローディング中は選択が無効化される", () => {
      render(<TimezoneSelector {...defaultProps} isLoading={true} />);
      const combobox = screen.getByRole("combobox", { name: /タイムゾーン/i });
      expect(combobox).toBeDisabled();
    });

    it("ローディングインジケーターを表示する", () => {
      render(<TimezoneSelector {...defaultProps} isLoading={true} />);
      expect(screen.getByRole("status")).toBeInTheDocument();
    });
  });

  describe("アクセシビリティ", () => {
    it("aria-labelを持つ", () => {
      render(<TimezoneSelector {...defaultProps} />);
      const combobox = screen.getByRole("combobox", { name: /タイムゾーン/i });
      expect(combobox).toHaveAttribute("aria-label");
    });

    it("Escキーでドロップダウンを閉じる", async () => {
      render(<TimezoneSelector {...defaultProps} />);
      const combobox = screen.getByRole("combobox", { name: /タイムゾーン/i });
      await userEvent.click(combobox);
      expect(screen.getByRole("listbox")).toBeInTheDocument();

      fireEvent.keyDown(screen.getByTestId("timezone-selector"), {
        key: "Escape",
      });
      expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
    });
  });

  describe("Props", () => {
    it("classNameを追加できる", () => {
      render(<TimezoneSelector {...defaultProps} className="custom-class" />);
      expect(screen.getByTestId("timezone-selector")).toHaveClass(
        "custom-class",
      );
    });

    it("disabledでコンポーネントを無効化できる", () => {
      render(<TimezoneSelector {...defaultProps} disabled={true} />);
      const combobox = screen.getByRole("combobox", { name: /タイムゾーン/i });
      expect(combobox).toBeDisabled();
    });
  });
});
