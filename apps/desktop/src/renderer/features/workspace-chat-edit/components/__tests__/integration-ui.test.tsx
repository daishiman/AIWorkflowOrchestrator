/**
 * UIコンポーネント統合テスト
 *
 * FileAttachmentButton、FileContextList、FileContextBadgeの連携テスト
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { FileAttachmentButton } from "../FileAttachmentButton";
import { FileContextList } from "../FileContextList";
import type { FileContext } from "../../types";

// テスト用モックデータ
const createMockContext = (
  id: string,
  overrides?: Partial<FileContext>,
): FileContext => ({
  id,
  filePath: `/path/to/${id}.ts`,
  fileName: `${id}.ts`,
  content: "const x = 1;",
  language: "typescript",
  addedAt: new Date("2026-01-24T00:00:00Z"),
  fileSize: 1024,
  ...overrides,
});

// useFileContextのモック
const mockAttachFile = vi.fn();
const mockRemoveFileContext = vi.fn();
const mockSetActiveContext = vi.fn();

let mockFileContexts: FileContext[] = [];
let mockActiveContextId: string | null = null;

const mockUseFileContext = vi.fn(() => ({
  fileContexts: mockFileContexts,
  activeContextId: mockActiveContextId,
  canAddContext: mockFileContexts.length < 10,
  attachFile: mockAttachFile,
  removeFileContext: mockRemoveFileContext,
  setActiveContext: mockSetActiveContext,
  error: null,
}));

vi.mock("../../hooks", () => ({
  useFileContext: () => mockUseFileContext(),
}));

// electronAPIのモック
const mockOpenDialog = vi.fn();

describe("UIコンポーネント統合テスト", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // 状態をリセット
    mockFileContexts = [];
    mockActiveContextId = null;

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
        filePaths: ["/path/to/newfile.ts"],
      },
    });
  });

  afterEach(() => {
    delete (window as unknown as { electronAPI?: unknown }).electronAPI;
  });

  describe("ファイル添付フロー", () => {
    it("ボタンクリック→ファイル選択→リスト表示の連携", async () => {
      const user = userEvent.setup();
      const onFilesSelected = vi.fn();

      // 初期状態：空のリスト
      const { rerender } = render(
        <div>
          <FileAttachmentButton onFilesSelected={onFilesSelected} />
          <FileContextList contexts={mockFileContexts} />
        </div>,
      );

      // リストは空状態メッセージを表示
      expect(
        screen.getByText("ファイルが添付されていません"),
      ).toBeInTheDocument();

      // ボタンをクリック
      await user.click(screen.getByRole("button", { name: /ファイルを添付/ }));

      // ダイアログが開かれたことを確認
      expect(mockOpenDialog).toHaveBeenCalledTimes(1);

      await waitFor(() => {
        expect(onFilesSelected).toHaveBeenCalledWith(["/path/to/newfile.ts"]);
      });

      // ファイルが追加された状態を再現
      mockFileContexts = [createMockContext("newfile")];
      mockUseFileContext.mockReturnValue({
        fileContexts: mockFileContexts,
        activeContextId: null,
        canAddContext: true,
        attachFile: mockAttachFile,
        removeFileContext: mockRemoveFileContext,
        setActiveContext: mockSetActiveContext,
        error: null,
      });

      // 再レンダリング
      rerender(
        <div>
          <FileAttachmentButton onFilesSelected={onFilesSelected} />
          <FileContextList contexts={mockFileContexts} />
        </div>,
      );

      // リストにファイルが表示される
      expect(screen.getByText("newfile.ts")).toBeInTheDocument();
    });

    it("複数ファイル選択の連携", async () => {
      const user = userEvent.setup();
      mockOpenDialog.mockResolvedValue({
        success: true,
        data: {
          canceled: false,
          filePaths: ["/path/to/file1.ts", "/path/to/file2.ts"],
        },
      });

      render(
        <div>
          <FileAttachmentButton />
          <FileContextList contexts={[]} />
        </div>,
      );

      await user.click(screen.getByRole("button", { name: /ファイルを添付/ }));

      await waitFor(() => {
        expect(mockAttachFile).toHaveBeenCalledWith("/path/to/file1.ts");
        expect(mockAttachFile).toHaveBeenCalledWith("/path/to/file2.ts");
      });
    });
  });

  describe("ファイル削除フロー", () => {
    it("削除ボタンクリック→リスト更新の連携", async () => {
      const user = userEvent.setup();
      const initialFiles = [
        createMockContext("file-1"),
        createMockContext("file-2"),
      ];

      mockFileContexts = initialFiles;
      mockUseFileContext.mockReturnValue({
        fileContexts: mockFileContexts,
        activeContextId: null,
        canAddContext: true,
        attachFile: mockAttachFile,
        removeFileContext: mockRemoveFileContext,
        setActiveContext: mockSetActiveContext,
        error: null,
      });

      const { rerender } = render(
        <FileContextList contexts={mockFileContexts} />,
      );

      // 2つのファイルが表示される
      expect(screen.getByText("file-1.ts")).toBeInTheDocument();
      expect(screen.getByText("file-2.ts")).toBeInTheDocument();

      // 削除ボタンをクリック
      const removeButtons = screen.getAllByRole("button", { name: /削除/ });
      await user.click(removeButtons[0]);

      // removeFileContextが呼ばれる
      expect(mockRemoveFileContext).toHaveBeenCalledWith("file-1");

      // ファイルが削除された状態を再現
      mockFileContexts = [createMockContext("file-2")];
      rerender(<FileContextList contexts={mockFileContexts} />);

      // 1つのファイルのみ表示
      expect(screen.queryByText("file-1.ts")).not.toBeInTheDocument();
      expect(screen.getByText("file-2.ts")).toBeInTheDocument();
    });
  });

  describe("ファイル選択フロー", () => {
    it("バッジクリック→選択状態変更の連携", async () => {
      const user = userEvent.setup();
      const initialFiles = [
        createMockContext("file-1"),
        createMockContext("file-2"),
      ];

      mockFileContexts = initialFiles;
      mockUseFileContext.mockReturnValue({
        fileContexts: mockFileContexts,
        activeContextId: null,
        canAddContext: true,
        attachFile: mockAttachFile,
        removeFileContext: mockRemoveFileContext,
        setActiveContext: mockSetActiveContext,
        error: null,
      });

      const { rerender } = render(
        <FileContextList contexts={mockFileContexts} />,
      );

      // 最初のファイルをクリック
      const badges = screen.getAllByRole("listitem");
      await user.click(badges[0]);

      // setActiveContextが呼ばれる
      expect(mockSetActiveContext).toHaveBeenCalledWith("file-1");

      // 選択状態を更新
      mockActiveContextId = "file-1";
      rerender(
        <FileContextList contexts={mockFileContexts} selectedId="file-1" />,
      );

      // 選択状態が反映される
      expect(badges[0]).toHaveAttribute("aria-current", "true");
    });
  });

  describe("最大ファイル数制限", () => {
    it("最大数に達したらボタンが無効化される", () => {
      // 最大数（10件）のファイル
      mockFileContexts = Array(10)
        .fill(null)
        .map((_, i) => createMockContext(`file-${i}`));
      mockUseFileContext.mockReturnValue({
        fileContexts: mockFileContexts,
        activeContextId: null,
        canAddContext: false,
        attachFile: mockAttachFile,
        removeFileContext: mockRemoveFileContext,
        setActiveContext: mockSetActiveContext,
        error: null,
      });

      render(
        <div>
          <FileAttachmentButton />
          <FileContextList contexts={mockFileContexts} maxHeight="200px" />
        </div>,
      );

      // ボタンが無効化されている
      const button = screen.getByRole("button", { name: /ファイルを添付/ });
      expect(button).toBeDisabled();
      expect(button).toHaveAttribute("aria-disabled", "true");

      // リストに10件のファイルが表示
      expect(screen.getAllByRole("listitem")).toHaveLength(10);
    });
  });

  describe("キーボードナビゲーション", () => {
    it("Tab→Enter→削除の連携", async () => {
      const user = userEvent.setup();
      const initialFiles = [createMockContext("file-1")];

      mockFileContexts = initialFiles;
      mockUseFileContext.mockReturnValue({
        fileContexts: mockFileContexts,
        activeContextId: null,
        canAddContext: true,
        attachFile: mockAttachFile,
        removeFileContext: mockRemoveFileContext,
        setActiveContext: mockSetActiveContext,
        error: null,
      });

      render(
        <div>
          <FileAttachmentButton />
          <FileContextList contexts={mockFileContexts} />
        </div>,
      );

      // Tabでボタンにフォーカス
      await user.tab();
      const button = screen.getByRole("button", { name: /ファイルを添付/ });
      expect(document.activeElement).toBe(button);

      // Enterでダイアログを開く
      await user.keyboard("{Enter}");
      expect(mockOpenDialog).toHaveBeenCalledTimes(1);
    });

    it("ファイルバッジでのキーボード操作", async () => {
      const user = userEvent.setup();
      const initialFiles = [createMockContext("file-1")];

      mockFileContexts = initialFiles;
      mockUseFileContext.mockReturnValue({
        fileContexts: mockFileContexts,
        activeContextId: null,
        canAddContext: true,
        attachFile: mockAttachFile,
        removeFileContext: mockRemoveFileContext,
        setActiveContext: mockSetActiveContext,
        error: null,
      });

      render(<FileContextList contexts={mockFileContexts} />);

      const badge = screen.getByRole("listitem");
      badge.focus();

      // Enterで選択
      await user.keyboard("{Enter}");
      expect(mockSetActiveContext).toHaveBeenCalledWith("file-1");

      // Deleteで削除
      await user.keyboard("{Delete}");
      expect(mockRemoveFileContext).toHaveBeenCalledWith("file-1");
    });
  });

  describe("エラー状態", () => {
    it("ダイアログキャンセル時にファイルが追加されない", async () => {
      const user = userEvent.setup();
      mockOpenDialog.mockResolvedValue({
        success: true,
        data: { canceled: true, filePaths: [] },
      });

      render(
        <div>
          <FileAttachmentButton />
          <FileContextList contexts={[]} />
        </div>,
      );

      await user.click(screen.getByRole("button", { name: /ファイルを添付/ }));

      await waitFor(() => {
        expect(mockOpenDialog).toHaveBeenCalledTimes(1);
      });

      // attachFileが呼ばれない
      expect(mockAttachFile).not.toHaveBeenCalled();

      // リストは空のまま
      expect(
        screen.getByText("ファイルが添付されていません"),
      ).toBeInTheDocument();
    });

    it("ダイアログエラー時にクラッシュしない", async () => {
      const user = userEvent.setup();
      mockOpenDialog.mockResolvedValue({
        success: false,
        error: "ダイアログエラー",
      });

      render(
        <div>
          <FileAttachmentButton />
          <FileContextList contexts={[]} />
        </div>,
      );

      // エラーなくクリックできる
      await user.click(screen.getByRole("button", { name: /ファイルを添付/ }));

      await waitFor(() => {
        expect(mockOpenDialog).toHaveBeenCalledTimes(1);
      });

      // attachFileが呼ばれない
      expect(mockAttachFile).not.toHaveBeenCalled();
    });
  });

  describe("状態同期", () => {
    it("Propsとstoreの両方から状態を取得できる", () => {
      const propsFiles = [createMockContext("props-file")];
      const storeFiles = [createMockContext("store-file")];

      mockFileContexts = storeFiles;
      mockUseFileContext.mockReturnValue({
        fileContexts: mockFileContexts,
        activeContextId: "store-file",
        canAddContext: true,
        attachFile: mockAttachFile,
        removeFileContext: mockRemoveFileContext,
        setActiveContext: mockSetActiveContext,
        error: null,
      });

      // Propsを渡した場合はPropsが優先
      const { rerender } = render(
        <FileContextList contexts={propsFiles} selectedId="props-file" />,
      );
      expect(screen.getByText("props-file.ts")).toBeInTheDocument();
      expect(screen.queryByText("store-file.ts")).not.toBeInTheDocument();

      // Propsを省略した場合はstoreから取得
      rerender(<FileContextList />);
      expect(screen.getByText("store-file.ts")).toBeInTheDocument();
    });
  });
});
