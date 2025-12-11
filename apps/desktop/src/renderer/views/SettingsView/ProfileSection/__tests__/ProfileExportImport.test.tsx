/**
 * ProfileExportImport コンポーネントテスト
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ProfileExportImport } from "../ProfileExportImport";

describe("ProfileExportImport", () => {
  const mockOnExport = vi.fn();
  const mockOnImport = vi.fn();
  const defaultProps = {
    onExport: mockOnExport,
    onImport: mockOnImport,
    disabled: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockOnExport.mockResolvedValue({
      success: true,
      filePath: "/path/to/profile-export.json",
    });
    mockOnImport.mockResolvedValue({ success: true });
  });

  describe("レンダリング", () => {
    it("エクスポート/インポートセクションをレンダリングする", () => {
      render(<ProfileExportImport {...defaultProps} />);
      expect(screen.getByTestId("profile-export-import")).toBeInTheDocument();
    });

    it("セクションタイトル「データ管理」を表示する", () => {
      render(<ProfileExportImport {...defaultProps} />);
      expect(screen.getByText("データ管理")).toBeInTheDocument();
    });

    it("エクスポートボタンを表示する", () => {
      render(<ProfileExportImport {...defaultProps} />);
      expect(
        screen.getByRole("button", { name: /エクスポート/i }),
      ).toBeInTheDocument();
    });

    it("インポートボタンを表示する", () => {
      render(<ProfileExportImport {...defaultProps} />);
      expect(
        screen.getByRole("button", { name: /インポート/i }),
      ).toBeInTheDocument();
    });

    it("説明テキストを表示する", () => {
      render(<ProfileExportImport {...defaultProps} />);
      expect(
        screen.getByText(/設定をファイルに保存・復元できます/i),
      ).toBeInTheDocument();
    });

    it("セキュリティ説明を表示する", () => {
      render(<ProfileExportImport {...defaultProps} />);
      expect(
        screen.getByText(/メールアドレスやアカウント情報は含まれません/i),
      ).toBeInTheDocument();
    });
  });

  describe("エクスポート機能", () => {
    it("エクスポートボタンをクリックするとonExportが呼ばれる", async () => {
      render(<ProfileExportImport {...defaultProps} />);
      const exportButton = screen.getByRole("button", {
        name: /エクスポート/i,
      });
      await userEvent.click(exportButton);
      expect(mockOnExport).toHaveBeenCalled();
    });

    it("エクスポート成功時に成功メッセージが表示される", async () => {
      render(<ProfileExportImport {...defaultProps} />);
      const exportButton = screen.getByRole("button", {
        name: /エクスポート/i,
      });
      await userEvent.click(exportButton);
      await waitFor(() => {
        expect(
          screen.getByText(/エクスポートが完了しました/i),
        ).toBeInTheDocument();
      });
    });

    it("エクスポート失敗時にエラーメッセージが表示される", async () => {
      mockOnExport.mockResolvedValue({
        success: false,
        error: "エクスポートに失敗しました",
      });

      render(<ProfileExportImport {...defaultProps} />);
      const exportButton = screen.getByRole("button", {
        name: /エクスポート/i,
      });
      await userEvent.click(exportButton);
      await waitFor(() => {
        expect(
          screen.getByText(/エクスポートに失敗しました/i),
        ).toBeInTheDocument();
      });
    });
  });

  describe("ローディング状態", () => {
    it("disabledでボタンが無効化される", () => {
      render(<ProfileExportImport {...defaultProps} disabled={true} />);
      expect(
        screen.getByRole("button", { name: /エクスポート/i }),
      ).toBeDisabled();
      expect(
        screen.getByRole("button", { name: /インポート/i }),
      ).toBeDisabled();
    });
  });

  describe("アクセシビリティ", () => {
    it("セクションにaria-labelがある", () => {
      render(<ProfileExportImport {...defaultProps} />);
      expect(
        screen.getByRole("region", { name: /データ管理/i }),
      ).toBeInTheDocument();
    });

    it("ボタンに適切なaria-labelがある", () => {
      render(<ProfileExportImport {...defaultProps} />);
      expect(
        screen.getByRole("button", { name: /エクスポート/i }),
      ).toHaveAttribute("aria-label");
      expect(
        screen.getByRole("button", { name: /インポート/i }),
      ).toHaveAttribute("aria-label");
    });
  });

  describe("Props", () => {
    it("classNameを追加できる", () => {
      render(
        <ProfileExportImport {...defaultProps} className="custom-class" />,
      );
      expect(screen.getByTestId("profile-export-import")).toHaveClass(
        "custom-class",
      );
    });

    it("exportOnlyモードでインポートボタンを非表示にできる", () => {
      render(<ProfileExportImport {...defaultProps} exportOnly />);
      expect(
        screen.getByRole("button", { name: /エクスポート/i }),
      ).toBeInTheDocument();
      expect(
        screen.queryByRole("button", { name: /インポート/i }),
      ).not.toBeInTheDocument();
    });
  });
});
