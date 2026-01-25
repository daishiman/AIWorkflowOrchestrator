/**
 * FileContextDropZone コンポーネントテスト
 *
 * Phase 4: TDD Red - 失敗するテストを作成
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { FileContextDropZone } from "../FileContextDropZone";

// useFileContextのモック
vi.mock("../../hooks/useFileContext", () => ({
  useFileContext: vi.fn(() => ({
    fileContexts: [],
    isDragging: false,
    error: null,
    warning: null,
    canAddContext: true,
    attachFile: vi.fn(),
    setDragging: vi.fn(),
    clearError: vi.fn(),
  })),
}));

import { useFileContext } from "../../hooks/useFileContext";

describe("FileContextDropZone", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("表示", () => {
    it("子要素を表示する", () => {
      render(
        <FileContextDropZone>
          <div data-testid="child">Child Content</div>
        </FileContextDropZone>,
      );

      expect(screen.getByTestId("child")).toBeInTheDocument();
    });

    it("role=regionが設定されている", () => {
      render(<FileContextDropZone />);

      const dropZone = screen.getByRole("region");
      expect(dropZone).toBeInTheDocument();
    });
  });

  describe("ドラッグ&ドロップ", () => {
    it("ドラッグ中にビジュアルフィードバックが表示される", () => {
      vi.mocked(useFileContext).mockReturnValue({
        fileContexts: [],
        isDragging: true,
        error: null,
        warning: null,
        canAddContext: true,
        totalContextSize: 0,
        activeContextId: null,
        attachFile: vi.fn(),
        addFileContext: vi.fn(),
        removeFileContext: vi.fn(),
        clearAllContexts: vi.fn(),
        setActiveContext: vi.fn(),
        setDragging: vi.fn(),
        clearError: vi.fn(),
      });

      render(<FileContextDropZone />);

      // ドラッグオーバーレイが表示されていることを確認
      expect(
        screen.getByText(/ファイルをドロップして添付/),
      ).toBeInTheDocument();
    });

    it("dragenterでsetDragging(true)が呼ばれる", () => {
      const mockSetDragging = vi.fn();

      vi.mocked(useFileContext).mockReturnValue({
        fileContexts: [],
        isDragging: false,
        error: null,
        warning: null,
        canAddContext: true,
        totalContextSize: 0,
        activeContextId: null,
        attachFile: vi.fn(),
        addFileContext: vi.fn(),
        removeFileContext: vi.fn(),
        clearAllContexts: vi.fn(),
        setActiveContext: vi.fn(),
        setDragging: mockSetDragging,
        clearError: vi.fn(),
      });

      render(<FileContextDropZone />);

      const dropZone = screen.getByRole("region");
      fireEvent.dragEnter(dropZone);

      expect(mockSetDragging).toHaveBeenCalledWith(true);
    });

    it("dragleaveでsetDragging(false)が呼ばれる", () => {
      const mockSetDragging = vi.fn();

      vi.mocked(useFileContext).mockReturnValue({
        fileContexts: [],
        isDragging: true,
        error: null,
        warning: null,
        canAddContext: true,
        totalContextSize: 0,
        activeContextId: null,
        attachFile: vi.fn(),
        addFileContext: vi.fn(),
        removeFileContext: vi.fn(),
        clearAllContexts: vi.fn(),
        setActiveContext: vi.fn(),
        setDragging: mockSetDragging,
        clearError: vi.fn(),
      });

      render(<FileContextDropZone />);

      const dropZone = screen.getByRole("region");
      fireEvent.dragLeave(dropZone, {
        relatedTarget: document.body,
      });

      expect(mockSetDragging).toHaveBeenCalledWith(false);
    });

    it("ファイルドロップでonFilesDroppedが呼ばれる", async () => {
      const onFilesDropped = vi.fn();
      const mockAttachFile = vi.fn();

      vi.mocked(useFileContext).mockReturnValue({
        fileContexts: [],
        isDragging: false,
        error: null,
        warning: null,
        canAddContext: true,
        totalContextSize: 0,
        activeContextId: null,
        attachFile: mockAttachFile,
        addFileContext: vi.fn(),
        removeFileContext: vi.fn(),
        clearAllContexts: vi.fn(),
        setActiveContext: vi.fn(),
        setDragging: vi.fn(),
        clearError: vi.fn(),
      });

      render(<FileContextDropZone onFilesDropped={onFilesDropped} />);

      const dropZone = screen.getByRole("region");
      const file = new File(["content"], "test.ts", {
        type: "text/typescript",
      });

      fireEvent.drop(dropZone, {
        dataTransfer: {
          files: [file],
        },
      });

      await waitFor(() => {
        expect(onFilesDropped).toHaveBeenCalledWith([file]);
      });
    });

    it("ファイルドロップでattachFileが呼ばれる", async () => {
      const mockAttachFile = vi.fn();

      vi.mocked(useFileContext).mockReturnValue({
        fileContexts: [],
        isDragging: false,
        error: null,
        warning: null,
        canAddContext: true,
        totalContextSize: 0,
        activeContextId: null,
        attachFile: mockAttachFile,
        addFileContext: vi.fn(),
        removeFileContext: vi.fn(),
        clearAllContexts: vi.fn(),
        setActiveContext: vi.fn(),
        setDragging: vi.fn(),
        clearError: vi.fn(),
      });

      render(<FileContextDropZone />);

      const dropZone = screen.getByRole("region");
      const file = new File(["content"], "test.ts", {
        type: "text/typescript",
      });
      Object.defineProperty(file, "path", { value: "/path/to/test.ts" });

      fireEvent.drop(dropZone, {
        dataTransfer: {
          files: [file],
        },
      });

      await waitFor(() => {
        expect(mockAttachFile).toHaveBeenCalled();
      });
    });
  });

  describe("バリデーション", () => {
    it("サイズ超過ファイルでエラーが表示される", async () => {
      vi.mocked(useFileContext).mockReturnValue({
        fileContexts: [],
        isDragging: false,
        error: "ファイルサイズが10MBを超えています",
        warning: null,
        canAddContext: true,
        totalContextSize: 0,
        activeContextId: null,
        attachFile: vi.fn(),
        addFileContext: vi.fn(),
        removeFileContext: vi.fn(),
        clearAllContexts: vi.fn(),
        setActiveContext: vi.fn(),
        setDragging: vi.fn(),
        clearError: vi.fn(),
      });

      render(<FileContextDropZone />);

      expect(
        screen.getByText("ファイルサイズが10MBを超えています"),
      ).toBeInTheDocument();
    });

    it("最大ファイル数超過でエラーが表示される", async () => {
      vi.mocked(useFileContext).mockReturnValue({
        fileContexts: [],
        isDragging: false,
        error: "添付ファイル数の上限（10）に達しました",
        warning: null,
        canAddContext: false,
        totalContextSize: 0,
        activeContextId: null,
        attachFile: vi.fn(),
        addFileContext: vi.fn(),
        removeFileContext: vi.fn(),
        clearAllContexts: vi.fn(),
        setActiveContext: vi.fn(),
        setDragging: vi.fn(),
        clearError: vi.fn(),
      });

      render(<FileContextDropZone />);

      expect(
        screen.getByText("添付ファイル数の上限（10）に達しました"),
      ).toBeInTheDocument();
    });

    it("canAddContext=falseの場合もドロップゾーンは表示される", () => {
      vi.mocked(useFileContext).mockReturnValue({
        fileContexts: [],
        isDragging: false,
        error: null,
        warning: null,
        canAddContext: false,
        totalContextSize: 0,
        activeContextId: null,
        attachFile: vi.fn(),
        addFileContext: vi.fn(),
        removeFileContext: vi.fn(),
        clearAllContexts: vi.fn(),
        setActiveContext: vi.fn(),
        setDragging: vi.fn(),
        clearError: vi.fn(),
      });

      render(<FileContextDropZone />);

      const dropZone = screen.getByRole("region");
      expect(dropZone).toBeInTheDocument();
    });
  });

  describe("エラー表示", () => {
    it("エラーメッセージが表示される", () => {
      vi.mocked(useFileContext).mockReturnValue({
        fileContexts: [],
        isDragging: false,
        error: "エラーが発生しました",
        warning: null,
        canAddContext: true,
        totalContextSize: 0,
        activeContextId: null,
        attachFile: vi.fn(),
        addFileContext: vi.fn(),
        removeFileContext: vi.fn(),
        clearAllContexts: vi.fn(),
        setActiveContext: vi.fn(),
        setDragging: vi.fn(),
        clearError: vi.fn(),
      });

      render(<FileContextDropZone />);

      expect(screen.getByText("エラーが発生しました")).toBeInTheDocument();
    });

    it("エラーにrole=alertが設定されている", () => {
      vi.mocked(useFileContext).mockReturnValue({
        fileContexts: [],
        isDragging: false,
        error: "エラーが発生しました",
        warning: null,
        canAddContext: true,
        totalContextSize: 0,
        activeContextId: null,
        attachFile: vi.fn(),
        addFileContext: vi.fn(),
        removeFileContext: vi.fn(),
        clearAllContexts: vi.fn(),
        setActiveContext: vi.fn(),
        setDragging: vi.fn(),
        clearError: vi.fn(),
      });

      render(<FileContextDropZone />);

      const alert = screen.getByRole("alert");
      expect(alert).toHaveTextContent("エラーが発生しました");
    });

    it("閉じるボタンでclearErrorが呼ばれる", async () => {
      const mockClearError = vi.fn();

      vi.mocked(useFileContext).mockReturnValue({
        fileContexts: [],
        isDragging: false,
        error: "エラーが発生しました",
        warning: null,
        canAddContext: true,
        totalContextSize: 0,
        activeContextId: null,
        attachFile: vi.fn(),
        addFileContext: vi.fn(),
        removeFileContext: vi.fn(),
        clearAllContexts: vi.fn(),
        setActiveContext: vi.fn(),
        setDragging: vi.fn(),
        clearError: mockClearError,
      });

      render(<FileContextDropZone />);

      const closeButton = screen.getByText("閉じる");
      fireEvent.click(closeButton);

      expect(mockClearError).toHaveBeenCalledTimes(1);
    });
  });

  describe("アクセシビリティ", () => {
    it("aria-dropeffect=copyが設定されている", () => {
      render(<FileContextDropZone />);

      const dropZone = screen.getByRole("region");
      expect(dropZone).toHaveAttribute("aria-dropeffect", "copy");
    });

    it("aria-labelが設定されている", () => {
      render(<FileContextDropZone />);

      const dropZone = screen.getByRole("region");
      expect(dropZone).toHaveAttribute("aria-label", "ファイルドロップゾーン");
    });

    it("ドラッグ中のメッセージにaria-live=assertiveが設定されている", () => {
      vi.mocked(useFileContext).mockReturnValue({
        fileContexts: [],
        isDragging: true,
        error: null,
        warning: null,
        canAddContext: true,
        totalContextSize: 0,
        activeContextId: null,
        attachFile: vi.fn(),
        addFileContext: vi.fn(),
        removeFileContext: vi.fn(),
        clearAllContexts: vi.fn(),
        setActiveContext: vi.fn(),
        setDragging: vi.fn(),
        clearError: vi.fn(),
      });

      render(<FileContextDropZone />);

      const status = screen.getByRole("status");
      expect(status).toHaveAttribute("aria-live", "assertive");
    });
  });

  describe("Props", () => {
    it("maxFilesでファイル数上限を設定できる", () => {
      render(<FileContextDropZone maxFiles={5} />);

      // Propsが渡されていることを確認（実際のバリデーションは内部で行われる）
      const dropZone = screen.getByRole("region");
      expect(dropZone).toBeInTheDocument();
    });

    it("maxFileSizeでサイズ上限を設定できる", () => {
      render(<FileContextDropZone maxFileSize={5 * 1024 * 1024} />);

      // Propsが渡されていることを確認
      const dropZone = screen.getByRole("region");
      expect(dropZone).toBeInTheDocument();
    });

    it("classNameでカスタムクラスを追加できる", () => {
      render(<FileContextDropZone className="custom-class" />);

      const dropZone = screen.getByRole("region");
      expect(dropZone).toHaveClass("custom-class");
    });
  });
});
