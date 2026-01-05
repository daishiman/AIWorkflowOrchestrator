/**
 * WorkspaceSearchInput コンポーネントのテスト
 *
 * @see docs/30-workflows/file-selector-integration/step09-workspace-file-selector-design.md
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { WorkspaceSearchInput } from "./WorkspaceSearchInput";

describe("WorkspaceSearchInput", () => {
  const user = userEvent.setup();

  const defaultProps = {
    value: "",
    onChange: vi.fn(),
    onClear: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("レンダリング", () => {
    it("入力フィールドが表示される", () => {
      render(<WorkspaceSearchInput {...defaultProps} />);

      expect(screen.getByRole("searchbox")).toBeInTheDocument();
    });

    it("プレースホルダーが表示される", () => {
      render(
        <WorkspaceSearchInput
          {...defaultProps}
          placeholder="ファイルを検索..."
        />,
      );

      expect(
        screen.getByPlaceholderText("ファイルを検索..."),
      ).toBeInTheDocument();
    });

    it("デフォルトのプレースホルダーが表示される", () => {
      render(<WorkspaceSearchInput {...defaultProps} />);

      expect(screen.getByPlaceholderText(/ファイルを検索/)).toBeInTheDocument();
    });

    it("検索アイコンが表示される", () => {
      render(<WorkspaceSearchInput {...defaultProps} />);

      expect(screen.getByLabelText(/検索アイコン/)).toBeInTheDocument();
    });

    it("値が入力されている場合、クリアボタンが表示される", () => {
      render(<WorkspaceSearchInput {...defaultProps} value="test" />);

      expect(screen.getByLabelText(/クリア/)).toBeInTheDocument();
    });

    it("値が空の場合、クリアボタンが非表示", () => {
      render(<WorkspaceSearchInput {...defaultProps} value="" />);

      expect(screen.queryByLabelText(/クリア/)).not.toBeInTheDocument();
    });
  });

  describe("入力操作", () => {
    it("入力するとonChangeが呼ばれる", async () => {
      const onChange = vi.fn();
      render(<WorkspaceSearchInput {...defaultProps} onChange={onChange} />);

      const input = screen.getByRole("searchbox");
      await user.type(input, "test");

      // Controlled componentでは各キー入力で単一文字のイベントが発生
      expect(onChange).toHaveBeenCalledTimes(4);
      expect(onChange).toHaveBeenCalledWith("t");
      expect(onChange).toHaveBeenCalledWith("e");
      expect(onChange).toHaveBeenCalledWith("s");
      expect(onChange).toHaveBeenCalledWith("t");
    });

    it("クリアボタンをクリックするとonClearが呼ばれる", async () => {
      const onClear = vi.fn();
      render(
        <WorkspaceSearchInput
          {...defaultProps}
          value="test"
          onClear={onClear}
        />,
      );

      await user.click(screen.getByLabelText(/クリア/));

      expect(onClear).toHaveBeenCalled();
    });

    it("Escapeキーでクリアできる", () => {
      const onClear = vi.fn();
      render(
        <WorkspaceSearchInput
          {...defaultProps}
          value="test"
          onClear={onClear}
        />,
      );

      const input = screen.getByRole("searchbox");
      fireEvent.keyDown(input, { key: "Escape", code: "Escape" });

      expect(onClear).toHaveBeenCalled();
    });

    it("空の状態でEscapeキーを押してもonClearは呼ばれない", () => {
      const onClear = vi.fn();
      render(
        <WorkspaceSearchInput {...defaultProps} value="" onClear={onClear} />,
      );

      const input = screen.getByRole("searchbox");
      fireEvent.keyDown(input, { key: "Escape", code: "Escape" });

      expect(onClear).not.toHaveBeenCalled();
    });
  });

  describe("アクセシビリティ", () => {
    it("role='searchbox'が設定されている", () => {
      render(<WorkspaceSearchInput {...defaultProps} />);

      expect(screen.getByRole("searchbox")).toBeInTheDocument();
    });

    it("aria-labelが設定されている", () => {
      render(<WorkspaceSearchInput {...defaultProps} />);

      const input = screen.getByRole("searchbox");
      expect(input).toHaveAttribute("aria-label");
    });

    it("クリアボタンにaria-labelが設定されている", () => {
      render(<WorkspaceSearchInput {...defaultProps} value="test" />);

      const clearButton = screen.getByLabelText(/クリア/);
      expect(clearButton).toHaveAttribute("aria-label");
    });

    it("フォーカス時にフォーカスリングが表示される", () => {
      render(<WorkspaceSearchInput {...defaultProps} />);

      const input = screen.getByRole("searchbox");
      input.focus();

      // フォーカスリングのスタイルが適用されることを確認
      expect(input).toHaveFocus();
      expect(input).toHaveClass(/focus/);
    });
  });

  describe("スタイリング", () => {
    it("適切な幅が設定されている", () => {
      render(<WorkspaceSearchInput {...defaultProps} />);

      const container = screen.getByRole("searchbox").parentElement;
      expect(container).toHaveClass(/w-full/);
    });
  });
});
