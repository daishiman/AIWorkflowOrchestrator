/**
 * RestoreDialog Component Tests
 *
 * TDD Red Phase: These tests are designed to fail until implementation is complete.
 */
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi, describe, it, expect, beforeEach } from "vitest";
import { RestoreDialog } from "../RestoreDialog";

// Types (will be imported from actual types when implemented)
interface VersionHistoryItem {
  conversionId: string;
  fileId: string;
  version: number;
  createdAt: string;
  size: number;
  mimeType: string;
  hash: string;
  isLatest: boolean;
}

// Mock factory
const createMockVersionHistoryItem = (
  overrides?: Partial<VersionHistoryItem>,
): VersionHistoryItem => ({
  conversionId: "conv-001",
  fileId: "file-123",
  version: 2,
  createdAt: "2026-01-10T00:00:00Z",
  size: 1024,
  mimeType: "text/markdown",
  hash: "abc123",
  isLatest: false,
  ...overrides,
});

describe("RestoreDialog", () => {
  const defaultProps = {
    isOpen: true,
    version: createMockVersionHistoryItem(),
    onConfirm: vi.fn(),
    onCancel: vi.fn(),
    isLoading: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("ダイアログ表示 (FR-04)", () => {
    it("RD-001: isOpen=trueの場合ダイアログが表示される", () => {
      // Given: isOpen=true
      render(<RestoreDialog {...defaultProps} isOpen={true} />);

      // Then: ダイアログが表示される
      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });

    it("RD-002: isOpen=falseの場合何も表示されない", () => {
      // Given: isOpen=false
      const { container } = render(
        <RestoreDialog {...defaultProps} isOpen={false} />,
      );

      // Then: nullがレンダリングされる
      expect(container).toBeEmptyDOMElement();
    });

    it("RD-003: 復元対象のバージョン番号が表示される", () => {
      // Given: version情報が渡されている
      render(<RestoreDialog {...defaultProps} />);

      // Then: バージョン番号が表示される
      expect(screen.getByText(/v2/i)).toBeInTheDocument();
    });

    it("RD-004: 復元対象の作成日時が表示される", () => {
      // Given: version情報が渡されている
      render(<RestoreDialog {...defaultProps} />);

      // Then: 作成日時が表示される（フォーマットは実装に依存）
      expect(screen.getByText(/2026/)).toBeInTheDocument();
    });

    it("RD-005: 警告メッセージが表示される", () => {
      // Given: ダイアログが表示されている
      render(<RestoreDialog {...defaultProps} />);

      // Then: 警告メッセージが表示される
      expect(
        screen.getByText(/現在のバージョンは履歴として保存されます/),
      ).toBeInTheDocument();
    });
  });

  describe("復元実行 (FR-03)", () => {
    it("RD-006: 「復元する」クリックでonConfirmが呼ばれる", async () => {
      // Given: ダイアログが表示されている
      const onConfirm = vi.fn();
      render(<RestoreDialog {...defaultProps} onConfirm={onConfirm} />);

      // When: 「復元する」をクリック
      await userEvent.click(screen.getByRole("button", { name: /復元する/i }));

      // Then: onConfirmが呼ばれる
      expect(onConfirm).toHaveBeenCalledTimes(1);
    });

    it("RD-007: 復元中はボタンがdisabledになる", () => {
      // Given: isLoading=true
      render(<RestoreDialog {...defaultProps} isLoading={true} />);

      // Then: 復元ボタンがdisabled
      expect(
        screen.getByRole("button", { name: /復元中|復元する/i }),
      ).toBeDisabled();
    });

    it("RD-008: 復元中はボタンテキストが「復元中...」", () => {
      // Given: isLoading=true
      render(<RestoreDialog {...defaultProps} isLoading={true} />);

      // Then: ボタンテキストが「復元中...」
      expect(screen.getByText(/復元中/)).toBeInTheDocument();
    });
  });

  describe("キャンセル", () => {
    it("RD-009: 「キャンセル」クリックでonCancelが呼ばれる", async () => {
      // Given: ダイアログが表示されている
      const onCancel = vi.fn();
      render(<RestoreDialog {...defaultProps} onCancel={onCancel} />);

      // When: 「キャンセル」をクリック
      await userEvent.click(
        screen.getByRole("button", { name: /キャンセル/i }),
      );

      // Then: onCancelが呼ばれる
      expect(onCancel).toHaveBeenCalledTimes(1);
    });
  });

  describe("アクセシビリティ (NFR-01)", () => {
    it("RD-010: Escapeキーでダイアログが閉じる", async () => {
      // Given: ダイアログが表示されている
      const onCancel = vi.fn();
      render(<RestoreDialog {...defaultProps} onCancel={onCancel} />);

      // When: Escapeキーを押す
      fireEvent.keyDown(screen.getByRole("dialog"), { key: "Escape" });

      // Then: onCancelが呼ばれる
      expect(onCancel).toHaveBeenCalledTimes(1);
    });

    it('RD-011: role="dialog"が設定されている', () => {
      // Given: ダイアログが表示されている
      render(<RestoreDialog {...defaultProps} />);

      // Then: role="dialog"が設定されている
      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });

    it('RD-012: aria-modal="true"が設定されている', () => {
      // Given: ダイアログが表示されている
      render(<RestoreDialog {...defaultProps} />);

      // Then: aria-modal="true"が設定されている
      expect(screen.getByRole("dialog")).toHaveAttribute("aria-modal", "true");
    });
  });
});
