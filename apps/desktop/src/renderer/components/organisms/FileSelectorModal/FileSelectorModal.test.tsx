/**
 * FileSelectorModal テスト
 *
 * @see docs/30-workflows/file-selector-integration/step01-design.md
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { FileSelectorModal } from "./index";

// =============================================================================
// Mocks
// =============================================================================

// Mock store hooks
import type { SelectedFile } from "@repo/shared/types";

// SelectedFile型のモックデータを作成するヘルパー
const createMockSelectedFile = (
  id: string,
  name: string,
  path: string,
  size: number,
): SelectedFile => ({
  id,
  name,
  path,
  extension: name.includes(".") ? "." + name.split(".").pop() : "",
  size,
  mimeType: "application/octet-stream",
  lastModified: new Date().toISOString(),
  createdAt: new Date().toISOString(),
});

const mockSelectedFiles = vi.fn((): SelectedFile[] => []);
const mockClearFiles = vi.fn();
const mockFolders: any[] = [];
const mockFileTrees = new Map();

vi.mock("../../../store", () => ({
  useSelectedFiles: () => mockSelectedFiles(),
  useHasSelectedFiles: () => mockSelectedFiles().length > 0,
  useFileFilterCategory: () => "all",
  useFileSelectionIsDragging: () => false,
  useFileSelectionIsLoading: () => false,
  useFileSelectionError: () => null,
  useAddFiles: () => vi.fn(),
  useRemoveFile: () => vi.fn(),
  useClearFiles: () => mockClearFiles,
  useSetFileSelectionIsDragging: () => vi.fn(),
  useSetFileSelectionIsLoading: () => vi.fn(),
  useSetFileSelectionError: () => vi.fn(),
  useSetFileFilterCategory: () => vi.fn(),
  // WorkspaceFileSelector用のモック
  useAppStore: vi.fn((selector: (state: any) => any) => {
    const state = {
      workspace: { folders: mockFolders },
      folderFileTrees: mockFileTrees,
    };
    return selector(state);
  }),
}));

// Mock createPortal
vi.mock("react-dom", async () => {
  const actual = await vi.importActual("react-dom");
  return {
    ...actual,
    createPortal: (node: React.ReactNode) => node,
  };
});

// Mock electronAPI
const mockOpenDialog = vi.fn();
const mockGetMultipleMetadata = vi.fn();

beforeEach(() => {
  window.electronAPI = {
    fileSelection: {
      openDialog: mockOpenDialog,
      getMultipleMetadata: mockGetMultipleMetadata,
    },
  } as unknown as typeof window.electronAPI;
});

// =============================================================================
// Tests
// =============================================================================

describe("FileSelectorModal", () => {
  const defaultProps = {
    open: true,
    onClose: vi.fn(),
    onConfirm: vi.fn(),
    mode: "external" as const, // 既存テストはexternalモードをテスト
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockSelectedFiles.mockReturnValue([]);
  });

  afterEach(() => {
    document.body.style.overflow = "";
  });

  // ===========================================================================
  // Rendering Tests
  // ===========================================================================

  describe("Rendering", () => {
    it("renders modal when open is true", () => {
      render(<FileSelectorModal {...defaultProps} />);

      expect(screen.getByTestId("file-selector-modal")).toBeInTheDocument();
      expect(
        screen.getByTestId("file-selector-modal-overlay"),
      ).toBeInTheDocument();
    });

    it("does not render when open is false", () => {
      render(<FileSelectorModal {...defaultProps} open={false} />);

      expect(
        screen.queryByTestId("file-selector-modal"),
      ).not.toBeInTheDocument();
    });

    it("renders with default title", () => {
      render(<FileSelectorModal {...defaultProps} />);

      expect(
        screen.getByRole("heading", { name: "ファイルを選択" }),
      ).toBeInTheDocument();
    });

    it("renders with custom title", () => {
      render(<FileSelectorModal {...defaultProps} title="カスタムタイトル" />);

      expect(
        screen.getByRole("heading", { name: "カスタムタイトル" }),
      ).toBeInTheDocument();
    });

    it("renders with default button labels", () => {
      render(<FileSelectorModal {...defaultProps} />);

      expect(
        screen.getByTestId("file-selector-modal-cancel"),
      ).toHaveTextContent("キャンセル");
      expect(
        screen.getByTestId("file-selector-modal-confirm"),
      ).toHaveTextContent("選択");
    });

    it("renders with custom button labels", () => {
      render(
        <FileSelectorModal
          {...defaultProps}
          confirmLabel="決定"
          cancelLabel="戻る"
        />,
      );

      expect(
        screen.getByTestId("file-selector-modal-cancel"),
      ).toHaveTextContent("戻る");
      expect(
        screen.getByTestId("file-selector-modal-confirm"),
      ).toHaveTextContent("決定");
    });

    it("renders FileSelector component", () => {
      render(<FileSelectorModal {...defaultProps} />);

      expect(screen.getByTestId("file-selector")).toBeInTheDocument();
    });
  });

  // ===========================================================================
  // Accessibility Tests
  // ===========================================================================

  describe("Accessibility", () => {
    it("has correct dialog role and aria attributes", () => {
      render(<FileSelectorModal {...defaultProps} />);

      const modal = screen.getByTestId("file-selector-modal");
      expect(modal).toHaveAttribute("role", "dialog");
      expect(modal).toHaveAttribute("aria-modal", "true");
      expect(modal).toHaveAttribute(
        "aria-labelledby",
        "file-selector-modal-title",
      );
      expect(modal).toHaveAttribute(
        "aria-describedby",
        "file-selector-modal-description",
      );
    });

    it("has screen reader description", () => {
      render(<FileSelectorModal {...defaultProps} />);

      expect(
        screen.getByText(
          "ファイルを選択してください。Escapeキーで閉じることができます。",
        ),
      ).toBeInTheDocument();
    });

    it("close button has aria-label", () => {
      render(<FileSelectorModal {...defaultProps} />);

      expect(
        screen.getByTestId("file-selector-modal-close"),
      ).toHaveAccessibleName("閉じる");
    });
  });

  // ===========================================================================
  // Interaction Tests
  // ===========================================================================

  describe("Interactions", () => {
    it("calls onClose when close button is clicked", async () => {
      const onClose = vi.fn();
      render(<FileSelectorModal {...defaultProps} onClose={onClose} />);

      await userEvent.click(screen.getByTestId("file-selector-modal-close"));

      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it("calls onClose when cancel button is clicked", async () => {
      const onClose = vi.fn();
      render(<FileSelectorModal {...defaultProps} onClose={onClose} />);

      await userEvent.click(screen.getByTestId("file-selector-modal-cancel"));

      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it("calls onClose when overlay is clicked", async () => {
      const onClose = vi.fn();
      render(<FileSelectorModal {...defaultProps} onClose={onClose} />);

      await userEvent.click(screen.getByTestId("file-selector-modal-overlay"));

      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it("does not call onClose when modal content is clicked", async () => {
      const onClose = vi.fn();
      render(<FileSelectorModal {...defaultProps} onClose={onClose} />);

      await userEvent.click(screen.getByTestId("file-selector-modal"));

      expect(onClose).not.toHaveBeenCalled();
    });

    it("calls onClose when Escape key is pressed", async () => {
      const onClose = vi.fn();
      render(<FileSelectorModal {...defaultProps} onClose={onClose} />);

      fireEvent.keyDown(document, { key: "Escape" });

      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it("confirm button is disabled when no files selected", () => {
      mockSelectedFiles.mockReturnValue([]);
      render(<FileSelectorModal {...defaultProps} />);

      expect(screen.getByTestId("file-selector-modal-confirm")).toBeDisabled();
    });

    it("confirm button is enabled when files are selected", () => {
      mockSelectedFiles.mockReturnValue([
        createMockSelectedFile("1", "test.txt", "/test.txt", 100),
      ]);
      render(<FileSelectorModal {...defaultProps} />);

      expect(
        screen.getByTestId("file-selector-modal-confirm"),
      ).not.toBeDisabled();
    });

    it("calls onConfirm with selected files when confirm button is clicked", async () => {
      const onConfirm = vi.fn();
      const selectedFiles = [
        createMockSelectedFile("1", "test.txt", "/test.txt", 100),
      ];
      mockSelectedFiles.mockReturnValue(selectedFiles);

      render(<FileSelectorModal {...defaultProps} onConfirm={onConfirm} />);

      await userEvent.click(screen.getByTestId("file-selector-modal-confirm"));

      expect(onConfirm).toHaveBeenCalledWith(selectedFiles);
    });
  });

  // ===========================================================================
  // Selected Files Display Tests
  // ===========================================================================

  describe("Selected Files Display", () => {
    it("shows default message when no files selected", () => {
      mockSelectedFiles.mockReturnValue([]);
      render(<FileSelectorModal {...defaultProps} />);

      expect(screen.getByTestId("selected-count")).toHaveTextContent(
        "ファイルを選択してください",
      );
    });

    it("shows selected count when files are selected", () => {
      mockSelectedFiles.mockReturnValue([
        createMockSelectedFile("1", "test1.txt", "/test1.txt", 100),
        createMockSelectedFile("2", "test2.txt", "/test2.txt", 200),
      ]);
      render(<FileSelectorModal {...defaultProps} />);

      expect(screen.getByTestId("selected-count")).toHaveTextContent(
        "2件選択中",
      );
    });
  });

  // ===========================================================================
  // Body Overflow Tests
  // ===========================================================================

  describe("Body Overflow", () => {
    it("sets body overflow to hidden when modal is open", () => {
      render(<FileSelectorModal {...defaultProps} open={true} />);

      expect(document.body.style.overflow).toBe("hidden");
    });

    it("resets body overflow when modal is closed", () => {
      const { rerender } = render(
        <FileSelectorModal {...defaultProps} open={true} />,
      );

      expect(document.body.style.overflow).toBe("hidden");

      rerender(<FileSelectorModal {...defaultProps} open={false} />);

      expect(document.body.style.overflow).toBe("");
    });
  });
});
