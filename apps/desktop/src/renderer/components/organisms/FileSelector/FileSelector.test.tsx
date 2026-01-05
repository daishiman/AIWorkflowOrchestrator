/**
 * FileSelector コンポーネントテスト
 *
 * T-03-4: TDD Red Phase
 *
 * @see docs/30-workflows/file-selection/step06-ui-design.md
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { FileSelector } from "./index";
import type { SelectedFile } from "@repo/shared/types";

// =============================================================================
// Mocks: Zustand Store
// =============================================================================

const mockAddFiles = vi.fn();
const mockRemoveFile = vi.fn();
const mockClearFiles = vi.fn();
const mockSetIsDragging = vi.fn();
const mockSetIsLoading = vi.fn();
const mockSetError = vi.fn();
const mockSetFilterCategory = vi.fn();

vi.mock("../../../store", () => ({
  useSelectedFiles: vi.fn(() => []),
  useHasSelectedFiles: vi.fn(() => false),
  useFileFilterCategory: vi.fn(() => "all"),
  useFileSelectionIsDragging: vi.fn(() => false),
  useFileSelectionIsLoading: vi.fn(() => false),
  useFileSelectionError: vi.fn(() => null),
  useAddFiles: vi.fn(() => mockAddFiles),
  useRemoveFile: vi.fn(() => mockRemoveFile),
  useClearFiles: vi.fn(() => mockClearFiles),
  useSetFileSelectionIsDragging: vi.fn(() => mockSetIsDragging),
  useSetFileSelectionIsLoading: vi.fn(() => mockSetIsLoading),
  useSetFileSelectionError: vi.fn(() => mockSetError),
  useSetFileFilterCategory: vi.fn(() => mockSetFilterCategory),
}));

// =============================================================================
// Mocks: Electron API
// =============================================================================

const mockOpenDialog = vi.fn();
const mockGetMultipleMetadata = vi.fn();

const mockElectronAPI = {
  fileSelection: {
    openDialog: mockOpenDialog,
    getMultipleMetadata: mockGetMultipleMetadata,
  },
};

// Inject mock into window using Object.defineProperty to preserve jsdom environment
Object.defineProperty(window, "electronAPI", {
  value: mockElectronAPI,
  writable: true,
});

// =============================================================================
// Test Fixtures
// =============================================================================

const mockFile1: SelectedFile = {
  id: "file-1",
  path: "/Users/test/Documents/document.pdf",
  name: "document.pdf",
  extension: ".pdf",
  size: 1024 * 100, // 100KB
  mimeType: "application/pdf",
  lastModified: "2025-01-01T00:00:00.000Z",
  createdAt: "2025-01-01T00:00:00.000Z",
};

const mockFile2: SelectedFile = {
  id: "file-2",
  path: "/Users/test/Documents/image.png",
  name: "image.png",
  extension: ".png",
  size: 1024 * 200, // 200KB
  mimeType: "image/png",
  lastModified: "2025-01-02T00:00:00.000Z",
  createdAt: "2025-01-02T00:00:00.000Z",
};

// =============================================================================
// Test Suite
// =============================================================================

describe("FileSelector", () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    // Reset mock implementations to default values
    const storeModule = await import("../../../store");
    vi.mocked(storeModule.useSelectedFiles).mockReturnValue([]);
    vi.mocked(storeModule.useHasSelectedFiles).mockReturnValue(false);
    vi.mocked(storeModule.useFileFilterCategory).mockReturnValue("all");
    vi.mocked(storeModule.useFileSelectionIsDragging).mockReturnValue(false);
    vi.mocked(storeModule.useFileSelectionIsLoading).mockReturnValue(false);
    vi.mocked(storeModule.useFileSelectionError).mockReturnValue(null);
    vi.mocked(storeModule.useAddFiles).mockReturnValue(mockAddFiles);
    vi.mocked(storeModule.useRemoveFile).mockReturnValue(mockRemoveFile);
    vi.mocked(storeModule.useClearFiles).mockReturnValue(mockClearFiles);
    vi.mocked(storeModule.useSetFileSelectionIsDragging).mockReturnValue(
      mockSetIsDragging,
    );
    vi.mocked(storeModule.useSetFileSelectionIsLoading).mockReturnValue(
      mockSetIsLoading,
    );
    vi.mocked(storeModule.useSetFileSelectionError).mockReturnValue(
      mockSetError,
    );
    vi.mocked(storeModule.useSetFileFilterCategory).mockReturnValue(
      mockSetFilterCategory,
    );
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  // ===========================================================================
  // Rendering Tests
  // ===========================================================================

  describe("レンダリング", () => {
    it("正常にレンダリングされる", () => {
      render(<FileSelector />);
      expect(screen.getByTestId("file-selector")).toBeInTheDocument();
    });

    it("ドロップゾーンが表示される", () => {
      render(<FileSelector />);
      expect(screen.getByTestId("file-drop-zone")).toBeInTheDocument();
    });

    it("ファイル選択ボタンが表示される", () => {
      render(<FileSelector />);
      expect(
        screen.getByRole("button", { name: /ファイルを選択/i }),
      ).toBeInTheDocument();
    });

    it("フィルター選択が表示される", () => {
      render(<FileSelector />);
      expect(screen.getByLabelText(/フィルター/i)).toBeInTheDocument();
    });
  });

  // ===========================================================================
  // File Selection Dialog Tests
  // ===========================================================================

  describe("ファイル選択ダイアログ", () => {
    it("ボタンクリックでダイアログが開く", async () => {
      mockOpenDialog.mockResolvedValue({
        success: true,
        data: { canceled: false, filePaths: [mockFile1.path] },
      });
      mockGetMultipleMetadata.mockResolvedValue({
        success: true,
        data: { files: [mockFile1], errors: [] },
      });

      render(<FileSelector />);
      const button = screen.getByRole("button", { name: /ファイルを選択/i });
      await userEvent.click(button);

      expect(mockOpenDialog).toHaveBeenCalledTimes(1);
    });

    it("ダイアログでファイル選択後、ストアに追加される", async () => {
      mockOpenDialog.mockResolvedValue({
        success: true,
        data: { canceled: false, filePaths: [mockFile1.path] },
      });
      mockGetMultipleMetadata.mockResolvedValue({
        success: true,
        data: { files: [mockFile1], errors: [] },
      });

      render(<FileSelector />);
      const button = screen.getByRole("button", { name: /ファイルを選択/i });
      await userEvent.click(button);

      await waitFor(() => {
        expect(mockGetMultipleMetadata).toHaveBeenCalledWith({
          filePaths: [mockFile1.path],
        });
      });

      await waitFor(() => {
        expect(mockAddFiles).toHaveBeenCalledWith([mockFile1]);
      });
    });

    it("複数ファイル選択後、ストアに追加される", async () => {
      mockOpenDialog.mockResolvedValue({
        success: true,
        data: { canceled: false, filePaths: [mockFile1.path, mockFile2.path] },
      });
      mockGetMultipleMetadata.mockResolvedValue({
        success: true,
        data: { files: [mockFile1, mockFile2], errors: [] },
      });

      render(<FileSelector />);
      const button = screen.getByRole("button", { name: /ファイルを選択/i });
      await userEvent.click(button);

      await waitFor(() => {
        expect(mockAddFiles).toHaveBeenCalledWith([mockFile1, mockFile2]);
      });
    });

    it("ダイアログキャンセル時、ストアは更新されない", async () => {
      mockOpenDialog.mockResolvedValue({
        success: true,
        data: { canceled: true, filePaths: [] },
      });

      render(<FileSelector />);
      const button = screen.getByRole("button", { name: /ファイルを選択/i });
      await userEvent.click(button);

      await waitFor(() => {
        expect(mockOpenDialog).toHaveBeenCalled();
      });

      expect(mockGetMultipleMetadata).not.toHaveBeenCalled();
      expect(mockAddFiles).not.toHaveBeenCalled();
    });

    it("ダイアログエラー時、エラーが設定される", async () => {
      const errorMessage = "ダイアログエラー";
      mockOpenDialog.mockResolvedValue({
        success: false,
        error: errorMessage,
      });

      render(<FileSelector />);
      const button = screen.getByRole("button", { name: /ファイルを選択/i });
      await userEvent.click(button);

      await waitFor(() => {
        expect(mockSetError).toHaveBeenCalledWith(errorMessage);
      });
    });
  });

  // ===========================================================================
  // Drag & Drop Tests
  // ===========================================================================

  describe("ドラッグ&ドロップ", () => {
    it("ドラッグエンター時、isDraggingがtrueになる", () => {
      render(<FileSelector />);
      const dropZone = screen.getByTestId("file-drop-zone");

      fireEvent.dragEnter(dropZone, {
        dataTransfer: { files: [] },
      });

      expect(mockSetIsDragging).toHaveBeenCalledWith(true);
    });

    it("ドラッグリーブ時、isDraggingがfalseになる", () => {
      render(<FileSelector />);
      const dropZone = screen.getByTestId("file-drop-zone");

      fireEvent.dragLeave(dropZone, {
        dataTransfer: { files: [] },
      });

      expect(mockSetIsDragging).toHaveBeenCalledWith(false);
    });

    it("ドロップ時、ファイルが追加される", async () => {
      const mockFiles = [
        new File(["content"], "test.pdf", { type: "application/pdf" }),
      ];
      Object.defineProperty(mockFiles[0], "path", {
        value: mockFile1.path,
        writable: false,
      });

      mockGetMultipleMetadata.mockResolvedValue({
        success: true,
        data: { files: [mockFile1], errors: [] },
      });

      render(<FileSelector />);
      const dropZone = screen.getByTestId("file-drop-zone");

      fireEvent.drop(dropZone, {
        dataTransfer: { files: mockFiles },
      });

      await waitFor(() => {
        expect(mockSetIsDragging).toHaveBeenCalledWith(false);
      });

      await waitFor(() => {
        expect(mockGetMultipleMetadata).toHaveBeenCalled();
      });
    });

    it("ローディング中はドラッグを受け付けない", async () => {
      const storeModule =
        await vi.importMock<typeof import("../../../store")>("../../../store");
      storeModule.useFileSelectionIsLoading.mockReturnValue(true);

      render(<FileSelector />);
      const dropZone = screen.getByTestId("file-drop-zone");

      fireEvent.dragEnter(dropZone);

      expect(mockSetIsDragging).not.toHaveBeenCalled();
    });
  });

  // ===========================================================================
  // Filter Tests
  // ===========================================================================

  describe("フィルター", () => {
    it("フィルターカテゴリを変更できる", async () => {
      render(<FileSelector />);
      const filterSelect = screen.getByLabelText(/フィルター/i);

      await userEvent.selectOptions(filterSelect, "office");

      expect(mockSetFilterCategory).toHaveBeenCalledWith("office");
    });

    it("フィルター変更後、ダイアログに反映される", async () => {
      const storeModule = vi.mocked(await import("../../../store"));
      storeModule.useFileFilterCategory.mockReturnValue("office");

      mockOpenDialog.mockResolvedValue({
        success: true,
        data: { canceled: true, filePaths: [] },
      });

      render(<FileSelector />);
      const button = screen.getByRole("button", { name: /ファイルを選択/i });
      await userEvent.click(button);

      expect(mockOpenDialog).toHaveBeenCalledWith(
        expect.objectContaining({
          filterCategory: "office",
        }),
      );
    });
  });

  // ===========================================================================
  // Selected Files Display Tests
  // ===========================================================================

  describe("選択されたファイルの表示", () => {
    it("ファイルが選択されていない場合、ファイルリストは表示されない", () => {
      render(<FileSelector />);
      expect(
        screen.queryByTestId("selected-files-list"),
      ).not.toBeInTheDocument();
    });

    it("ファイル選択後、ファイルリストが表示される", async () => {
      const storeModule = vi.mocked(await import("../../../store"));
      storeModule.useSelectedFiles.mockReturnValue([mockFile1]);
      storeModule.useHasSelectedFiles.mockReturnValue(true);

      render(<FileSelector />);

      expect(screen.getByTestId("selected-files-list")).toBeInTheDocument();
      expect(screen.getByText("document.pdf")).toBeInTheDocument();
    });

    it("複数ファイル選択時、すべて表示される", async () => {
      const storeModule = vi.mocked(await import("../../../store"));
      storeModule.useSelectedFiles.mockReturnValue([mockFile1, mockFile2]);
      storeModule.useHasSelectedFiles.mockReturnValue(true);

      render(<FileSelector />);

      expect(screen.getByText("document.pdf")).toBeInTheDocument();
      expect(screen.getByText("image.png")).toBeInTheDocument();
    });

    it("ファイル削除ボタンをクリックすると削除される", async () => {
      const storeModule = vi.mocked(await import("../../../store"));
      storeModule.useSelectedFiles.mockReturnValue([mockFile1]);
      storeModule.useHasSelectedFiles.mockReturnValue(true);

      render(<FileSelector />);

      const deleteButton = screen.getByRole("button", {
        name: /削除|remove/i,
      });
      await userEvent.click(deleteButton);

      expect(mockRemoveFile).toHaveBeenCalledWith(mockFile1.id);
    });

    it("全クリアボタンをクリックするとすべて削除される", async () => {
      const storeModule = vi.mocked(await import("../../../store"));
      storeModule.useSelectedFiles.mockReturnValue([mockFile1, mockFile2]);
      storeModule.useHasSelectedFiles.mockReturnValue(true);

      render(<FileSelector />);

      const clearButton = screen.getByRole("button", {
        name: /すべてクリア|clear all/i,
      });
      await userEvent.click(clearButton);

      expect(mockClearFiles).toHaveBeenCalledTimes(1);
    });
  });

  // ===========================================================================
  // Loading State Tests
  // ===========================================================================

  describe("ローディング状態", () => {
    it("ローディング中はスピナーが表示される", async () => {
      const storeModule = vi.mocked(await import("../../../store"));
      storeModule.useFileSelectionIsLoading.mockReturnValue(true);

      render(<FileSelector />);

      expect(screen.getByTestId("loading-spinner")).toBeInTheDocument();
    });

    it("ローディング中はファイル選択ボタンが無効になる", async () => {
      const storeModule = vi.mocked(await import("../../../store"));
      storeModule.useFileSelectionIsLoading.mockReturnValue(true);

      render(<FileSelector />);

      const button = screen.getByRole("button", { name: /ファイルを選択/i });
      expect(button).toBeDisabled();
    });

    it("ローディング完了後、ボタンが有効になる", async () => {
      const storeModule = vi.mocked(await import("../../../store"));
      storeModule.useFileSelectionIsLoading.mockReturnValue(false);

      render(<FileSelector />);

      const button = screen.getByRole("button", { name: /ファイルを選択/i });
      expect(button).not.toBeDisabled();
    });
  });

  // ===========================================================================
  // Error State Tests
  // ===========================================================================

  describe("エラー状態", () => {
    it("エラーメッセージが表示される", async () => {
      const errorMessage = "ファイル読み込みエラー";
      const storeModule = vi.mocked(await import("../../../store"));
      storeModule.useFileSelectionError.mockReturnValue(errorMessage);

      render(<FileSelector />);

      expect(screen.getByText(errorMessage)).toBeInTheDocument();
      expect(screen.getByRole("alert")).toBeInTheDocument();
    });

    it("エラーメッセージがない場合は表示されない", () => {
      render(<FileSelector />);

      expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    });

    it("エラーメッセージクローズボタンで消える", async () => {
      const errorMessage = "エラーが発生しました";
      const storeModule = vi.mocked(await import("../../../store"));
      storeModule.useFileSelectionError.mockReturnValue(errorMessage);

      render(<FileSelector />);

      const closeButton = screen.getByRole("button", { name: /閉じる|close/i });
      await userEvent.click(closeButton);

      expect(mockSetError).toHaveBeenCalledWith(null);
    });
  });

  // ===========================================================================
  // Accessibility Tests
  // ===========================================================================

  describe("アクセシビリティ", () => {
    it("適切なARIA属性が設定されている", () => {
      render(<FileSelector />);

      const dropZone = screen.getByTestId("file-drop-zone");
      expect(dropZone).toHaveAttribute("role", "region");
      expect(dropZone).toHaveAttribute(
        "aria-label",
        expect.stringContaining("ファイル"),
      );
    });

    it("ローディング中のaria-busyが設定される", async () => {
      const storeModule = vi.mocked(await import("../../../store"));
      storeModule.useFileSelectionIsLoading.mockReturnValue(true);

      render(<FileSelector />);

      const dropZone = screen.getByTestId("file-drop-zone");
      expect(dropZone).toHaveAttribute("aria-busy", "true");
    });

    it("エラー時のaria-invalidが設定される", async () => {
      const storeModule = vi.mocked(await import("../../../store"));
      storeModule.useFileSelectionError.mockReturnValue("Error");

      render(<FileSelector />);

      const dropZone = screen.getByTestId("file-drop-zone");
      expect(dropZone).toHaveAttribute("aria-invalid", "true");
    });

    it("キーボードでファイル選択ボタンを操作できる", async () => {
      mockOpenDialog.mockResolvedValue({
        success: true,
        data: { canceled: true, filePaths: [] },
      });

      render(<FileSelector />);
      const button = screen.getByRole("button", { name: /ファイルを選択/i });

      button.focus();
      expect(button).toHaveFocus();

      await userEvent.keyboard("{Enter}");

      expect(mockOpenDialog).toHaveBeenCalledTimes(1);
    });

    it("スクリーンリーダー用のライブリージョンがある", () => {
      render(<FileSelector />);

      const liveRegion = screen.getByRole("status", { hidden: true });
      expect(liveRegion).toHaveAttribute("aria-live", "polite");
    });

    it("ファイル数がスクリーンリーダーに通知される", async () => {
      const storeModule = vi.mocked(await import("../../../store"));
      storeModule.useSelectedFiles.mockReturnValue([mockFile1, mockFile2]);
      storeModule.useHasSelectedFiles.mockReturnValue(true);

      render(<FileSelector />);

      const liveRegion = screen.getByRole("status", { hidden: true });
      expect(liveRegion).toHaveTextContent(/2.*ファイル/);
    });
  });

  // ===========================================================================
  // Edge Cases Tests
  // ===========================================================================

  describe("エッジケース", () => {
    it("ファイルパスがないファイルは無視される", async () => {
      const invalidFile = new File(["content"], "test.pdf");
      // pathプロパティなし

      render(<FileSelector />);
      const dropZone = screen.getByTestId("file-drop-zone");

      fireEvent.drop(dropZone, {
        dataTransfer: { files: [invalidFile] },
      });

      await waitFor(() => {
        expect(mockSetIsDragging).toHaveBeenCalledWith(false);
      });

      expect(mockGetMultipleMetadata).not.toHaveBeenCalled();
    });

    it("メタデータ取得エラーでもUIはクラッシュしない", async () => {
      mockOpenDialog.mockResolvedValue({
        success: true,
        data: { canceled: false, filePaths: [mockFile1.path] },
      });
      mockGetMultipleMetadata.mockResolvedValue({
        success: false,
        error: "メタデータ取得エラー",
      });

      render(<FileSelector />);
      const button = screen.getByRole("button", { name: /ファイルを選択/i });
      await userEvent.click(button);

      await waitFor(() => {
        expect(mockSetError).toHaveBeenCalledWith("メタデータ取得エラー");
      });

      // コンポーネントは引き続き表示されている
      expect(screen.getByTestId("file-selector")).toBeInTheDocument();
    });

    it("部分的なメタデータエラーでも成功したファイルは追加される", async () => {
      mockOpenDialog.mockResolvedValue({
        success: true,
        data: { canceled: false, filePaths: [mockFile1.path, mockFile2.path] },
      });
      mockGetMultipleMetadata.mockResolvedValue({
        success: true,
        data: {
          files: [mockFile1],
          errors: [{ filePath: mockFile2.path, error: "アクセス拒否" }],
        },
      });

      render(<FileSelector />);
      const button = screen.getByRole("button", { name: /ファイルを選択/i });
      await userEvent.click(button);

      await waitFor(() => {
        expect(mockAddFiles).toHaveBeenCalledWith([mockFile1]);
      });
    });
  });
});
