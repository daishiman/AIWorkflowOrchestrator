/**
 * FileAttachmentButton コンポーネントテスト
 *
 * Phase 4: TDD Red - 失敗するテストを作成
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { FileAttachmentButton } from "../FileAttachmentButton";

// useFileContextのモック
const mockAttachFile = vi.fn();
const mockUseFileContext = vi.fn(() => ({
  fileContexts: [],
  canAddContext: true,
  attachFile: mockAttachFile,
  error: null,
}));

vi.mock("../../hooks", () => ({
  useFileContext: () => mockUseFileContext(),
}));

// electronAPIのモック
const mockOpenDialog = vi.fn();

describe("FileAttachmentButton", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // useFileContextモックをリセット
    mockUseFileContext.mockReturnValue({
      fileContexts: [],
      canAddContext: true,
      attachFile: mockAttachFile,
      error: null,
    });

    // electronAPI モックをセットアップ
    (window as unknown as { electronAPI: unknown }).electronAPI = {
      fileSelection: {
        openDialog: mockOpenDialog,
      },
    };

    mockOpenDialog.mockResolvedValue({
      success: true,
      data: {
        canceled: false,
        filePaths: ["/path/to/file1.ts", "/path/to/file2.ts"],
      },
    });
  });

  afterEach(() => {
    delete (window as unknown as { electronAPI?: unknown }).electronAPI;
  });

  describe("表示", () => {
    it("デフォルトでボタンが表示される", () => {
      render(<FileAttachmentButton />);
      const button = screen.getByRole("button");
      expect(button).toBeInTheDocument();
    });

    it("childrenが渡された場合はその内容を表示する", () => {
      render(<FileAttachmentButton>カスタムテキスト</FileAttachmentButton>);
      expect(screen.getByText("カスタムテキスト")).toBeInTheDocument();
    });

    it("デフォルトテキストはファイルを添付", () => {
      render(<FileAttachmentButton />);
      expect(screen.getByText("ファイルを添付")).toBeInTheDocument();
    });
  });

  describe("インタラクション", () => {
    it("クリックでファイル選択ダイアログが開く", async () => {
      const user = userEvent.setup();
      render(<FileAttachmentButton />);

      const button = screen.getByRole("button");
      await user.click(button);

      expect(mockOpenDialog).toHaveBeenCalledTimes(1);
    });

    it("ファイル選択後にattachFileが呼ばれる", async () => {
      const user = userEvent.setup();
      render(<FileAttachmentButton />);

      const button = screen.getByRole("button");
      await user.click(button);

      await waitFor(() => {
        expect(mockAttachFile).toHaveBeenCalledWith("/path/to/file1.ts");
        expect(mockAttachFile).toHaveBeenCalledWith("/path/to/file2.ts");
      });
    });

    it("ファイル選択後にonFilesSelectedコールバックが呼ばれる", async () => {
      const user = userEvent.setup();
      const onFilesSelected = vi.fn();
      render(<FileAttachmentButton onFilesSelected={onFilesSelected} />);

      const button = screen.getByRole("button");
      await user.click(button);

      await waitFor(() => {
        expect(onFilesSelected).toHaveBeenCalledWith([
          "/path/to/file1.ts",
          "/path/to/file2.ts",
        ]);
      });
    });

    it("ダイアログがキャンセルされた場合は何もしない", async () => {
      mockOpenDialog.mockResolvedValue({
        success: true,
        data: { canceled: true, filePaths: [] },
      });

      const user = userEvent.setup();
      render(<FileAttachmentButton />);

      const button = screen.getByRole("button");
      await user.click(button);

      expect(mockAttachFile).not.toHaveBeenCalled();
    });

    it("Enterキーでダイアログが開く", async () => {
      const user = userEvent.setup();
      render(<FileAttachmentButton />);

      const button = screen.getByRole("button");
      button.focus();
      await user.keyboard("{Enter}");

      expect(mockOpenDialog).toHaveBeenCalledTimes(1);
    });

    it("Spaceキーでダイアログが開く", async () => {
      const user = userEvent.setup();
      render(<FileAttachmentButton />);

      const button = screen.getByRole("button");
      button.focus();
      await user.keyboard(" ");

      expect(mockOpenDialog).toHaveBeenCalledTimes(1);
    });
  });

  describe("無効化", () => {
    it("disabled=trueでクリック不可", async () => {
      const user = userEvent.setup();
      render(<FileAttachmentButton disabled />);

      const button = screen.getByRole("button");
      await user.click(button);

      expect(mockOpenDialog).not.toHaveBeenCalled();
    });

    it("canAddContext=falseでクリック不可", async () => {
      mockUseFileContext.mockReturnValue({
        fileContexts: Array(10).fill({}),
        canAddContext: false,
        attachFile: mockAttachFile,
        error: null,
      });

      const user = userEvent.setup();
      render(<FileAttachmentButton />);

      const button = screen.getByRole("button");
      await user.click(button);

      expect(mockOpenDialog).not.toHaveBeenCalled();
    });

    it("disabled時にaria-disabled=trueが設定される", () => {
      render(<FileAttachmentButton disabled />);
      const button = screen.getByRole("button");
      expect(button).toHaveAttribute("aria-disabled", "true");
    });
  });

  describe("ファイル数制限", () => {
    it("maxFilesで選択ファイル数を制限できる", async () => {
      mockOpenDialog.mockResolvedValue({
        success: true,
        data: {
          canceled: false,
          filePaths: [
            "/path/to/file1.ts",
            "/path/to/file2.ts",
            "/path/to/file3.ts",
          ],
        },
      });

      const user = userEvent.setup();
      render(<FileAttachmentButton maxFiles={2} />);

      const button = screen.getByRole("button");
      await user.click(button);

      await waitFor(() => {
        expect(mockAttachFile).toHaveBeenCalledTimes(2);
      });
    });
  });

  describe("アクセシビリティ", () => {
    it("role=buttonが設定されている", () => {
      render(<FileAttachmentButton />);
      const button = screen.getByRole("button");
      expect(button).toBeInTheDocument();
    });

    it("aria-labelが設定されている", () => {
      render(<FileAttachmentButton />);
      const button = screen.getByRole("button");
      expect(button).toHaveAttribute("aria-label", "ファイルを添付");
    });

    it("tabIndexが0でフォーカス可能", () => {
      render(<FileAttachmentButton />);
      const button = screen.getByRole("button");
      expect(button).toHaveAttribute("tabIndex", "0");
    });

    it("disabled時にtabIndex=-1になる", () => {
      render(<FileAttachmentButton disabled />);
      const button = screen.getByRole("button");
      expect(button).toHaveAttribute("tabIndex", "-1");
    });
  });

  describe("エラーハンドリング", () => {
    it("electronAPIが存在しない場合はエラーを出さない", async () => {
      delete (window as unknown as { electronAPI?: unknown }).electronAPI;

      const user = userEvent.setup();
      render(<FileAttachmentButton />);

      const button = screen.getByRole("button");
      await user.click(button);

      // エラーなく処理が完了することを確認
      expect(button).toBeInTheDocument();
    });

    it("openDialogがエラーを返した場合でもクラッシュしない", async () => {
      mockOpenDialog.mockResolvedValue({
        success: false,
        error: "ダイアログエラー",
      });

      const user = userEvent.setup();
      render(<FileAttachmentButton />);

      const button = screen.getByRole("button");
      await user.click(button);

      expect(mockAttachFile).not.toHaveBeenCalled();
    });
  });

  describe("スタイリング", () => {
    it("classNameプロパティでカスタムクラスを追加できる", () => {
      render(<FileAttachmentButton className="custom-class" />);
      const button = screen.getByRole("button");
      expect(button).toHaveClass("custom-class");
    });
  });
});
