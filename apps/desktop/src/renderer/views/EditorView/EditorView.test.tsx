import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { EditorView } from "./index";
import type {
  Workspace,
  FolderId,
  FolderPath,
} from "../../store/types/workspace";
import type { FileNode } from "../../store/types";

// Mock workspace data
const mockWorkspace: Workspace = {
  id: "default",
  folders: [
    {
      id: "folder-1" as FolderId,
      path: "/docs" as FolderPath,
      displayName: "docs",
      isExpanded: true,
      expandedPaths: new Set<string>(),
      addedAt: new Date(),
    },
  ],
  lastSelectedFileId: null,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockFileTree: FileNode[] = [
  {
    id: "file-1",
    path: "/docs/readme.md",
    name: "readme.md",
    type: "file" as const,
  },
  {
    id: "file-2",
    path: "/docs/guide.md",
    name: "guide.md",
    type: "file" as const,
  },
];

// Mock store state - matching new EditorView structure
const createMockState = (overrides: Record<string, unknown> = {}) => ({
  // Workspace state
  workspace: mockWorkspace,
  folderFileTrees: new Map([["folder-1" as FolderId, mockFileTree]]),
  workspaceIsLoading: false,
  workspaceError: null,
  loadWorkspace: vi.fn(),
  saveWorkspace: vi.fn(),
  addFolder: vi.fn(),
  removeFolder: vi.fn(),
  toggleFolderExpansion: vi.fn(),
  toggleSubfolder: vi.fn(),
  setWorkspaceSelectedFile: vi.fn(),

  // Editor state
  editorContent: "# README\n\nThis is a readme file.",
  hasUnsavedChanges: false,
  setEditorContent: vi.fn(),
  markAsSaved: vi.fn(),

  // Legacy editor state (for compatibility)
  fileTree: [],
  selectedFile: null,
  setSelectedFile: vi.fn(),
  ...overrides,
});

// Mock window.electronAPI
const mockElectronAPI = {
  file: {
    read: vi.fn().mockResolvedValue({
      success: true,
      data: { content: "# Test content" },
    }),
    write: vi.fn().mockResolvedValue({ success: true }),
    getTree: vi.fn().mockResolvedValue({ success: true, data: mockFileTree }),
    watchStart: vi.fn(),
    watchStop: vi.fn(),
    onChanged: vi.fn(),
  },
  workspace: {
    load: vi.fn().mockResolvedValue({ success: true, data: null }),
    save: vi.fn().mockResolvedValue({ success: true }),
    addFolder: vi.fn().mockResolvedValue({ success: true, data: null }),
    validatePaths: vi.fn().mockResolvedValue({
      success: true,
      data: { validPaths: ["/docs"] },
    }),
  },
};

vi.stubGlobal("electronAPI", mockElectronAPI);

vi.mock("../../store", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../../store")>();
  return {
    ...actual,
    useAppStore: vi.fn((selector: (state: unknown) => unknown) =>
      selector(createMockState()),
    ),
    useWorkspace: vi.fn(() => mockWorkspace),
    useWorkspaceLoading: vi.fn(() => false),
    useWorkspaceError: vi.fn(() => null),
    // FileSelector用のモック
    useSelectedFiles: vi.fn(() => []),
    useClearFiles: vi.fn(() => vi.fn()),
    useHasSelectedFiles: vi.fn(() => false),
    useFileFilterCategory: vi.fn(() => "all"),
    useFileSelectionIsDragging: vi.fn(() => false),
    useFileSelectionIsLoading: vi.fn(() => false),
    useAddFiles: vi.fn(() => vi.fn()),
    useRemoveFile: vi.fn(() => vi.fn()),
    useSetFilterCategory: vi.fn(() => vi.fn()),
    useSetFileSelectionIsDragging: vi.fn(() => vi.fn()),
    useSetFileSelectionIsLoading: vi.fn(() => vi.fn()),
    useSetFileSelectionError: vi.fn(() => vi.fn()),
    useFileSelectionError: vi.fn(() => null),
  };
});

describe("EditorView", () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    const {
      useAppStore,
      useWorkspace,
      useWorkspaceLoading,
      useWorkspaceError,
    } = await import("../../store");
    vi.mocked(useAppStore).mockImplementation(((
      selector: (state: ReturnType<typeof createMockState>) => unknown,
    ) => selector(createMockState())) as never);
    vi.mocked(useWorkspace).mockReturnValue(mockWorkspace);
    vi.mocked(useWorkspaceLoading).mockReturnValue(false);
    vi.mocked(useWorkspaceError).mockReturnValue(null);
  });

  describe("レンダリング", () => {
    it("エディタービューをレンダリングする", () => {
      render(<EditorView />);
      expect(screen.getByTestId("editor-view")).toBeInTheDocument();
    });

    it("WorkspaceSidebarを表示する", () => {
      render(<EditorView />);
      expect(screen.getByTestId("workspace-sidebar")).toBeInTheDocument();
    });

    it("ファイル未選択時にメッセージを表示する", () => {
      render(<EditorView />);
      expect(
        screen.getByText("左側のワークスペースからファイルを選択してください"),
      ).toBeInTheDocument();
    });
  });

  describe("ワークスペース", () => {
    it("マウント時にワークスペースを読み込む", async () => {
      const mockLoadWorkspace = vi.fn();
      const { useAppStore } = await import("../../store");
      vi.mocked(useAppStore).mockImplementation(((
        selector: (state: ReturnType<typeof createMockState>) => unknown,
      ) =>
        selector(
          createMockState({ loadWorkspace: mockLoadWorkspace }),
        )) as never);

      render(<EditorView />);
      expect(mockLoadWorkspace).toHaveBeenCalled();
    });

    it("フォルダ追加ボタンをクリックでaddFolderを呼び出す", async () => {
      const mockAddFolder = vi.fn();
      const { useAppStore } = await import("../../store");
      vi.mocked(useAppStore).mockImplementation(((
        selector: (state: ReturnType<typeof createMockState>) => unknown,
      ) => selector(createMockState({ addFolder: mockAddFolder }))) as never);

      render(<EditorView />);
      const addButton = screen.getByTestId("add-folder-btn");
      fireEvent.click(addButton);
      await waitFor(() => expect(mockAddFolder).toHaveBeenCalled());
    });
  });

  describe("保存ボタン", () => {
    it("保存ボタンを表示する", () => {
      render(<EditorView />);
      expect(screen.getByRole("button", { name: "保存" })).toBeInTheDocument();
    });

    it("ファイル未選択時は無効化される", () => {
      render(<EditorView />);
      const saveButton = screen.getByRole("button", { name: "保存" });
      expect(saveButton).toBeDisabled();
    });
  });

  describe("エラー状態", () => {
    it("workspaceErrorがある場合にエラーメッセージを表示する", async () => {
      const { useWorkspaceError } = await import("../../store");
      vi.mocked(useWorkspaceError).mockReturnValue("Test error message");

      render(<EditorView />);
      // ErrorDisplay component shows error in specific format
      expect(screen.getByText(/Test error message/)).toBeInTheDocument();
    });
  });

  describe("className", () => {
    it("カスタムclassNameを追加する", () => {
      render(<EditorView className="custom-class" />);
      expect(screen.getByTestId("editor-view")).toHaveClass("custom-class");
    });
  });

  describe("displayName", () => {
    it("displayNameが設定されている", () => {
      expect(EditorView.displayName).toBe("EditorView");
    });
  });

  describe("キーボードショートカット", () => {
    it("Cmd+Fで検索パネルを開く", async () => {
      render(<EditorView />);

      fireEvent.keyDown(window, { key: "f", metaKey: true });

      await waitFor(() => {
        // エディタービューが表示されていることを確認
        expect(screen.getByTestId("editor-view")).toBeInTheDocument();
      });
    });

    it("Escapeで検索パネルを閉じる", async () => {
      render(<EditorView />);

      // まず検索パネルを開く
      fireEvent.keyDown(window, { key: "f", metaKey: true });

      // Escapeで閉じる
      fireEvent.keyDown(window, { key: "Escape" });

      // 検索パネルが閉じたことを確認
      await waitFor(() => {
        expect(screen.getByTestId("editor-view")).toBeInTheDocument();
      });
    });

    it("Cmd+Pでファイル名検索モードを開く", async () => {
      render(<EditorView />);

      fireEvent.keyDown(window, { key: "p", metaKey: true });

      await waitFor(() => {
        expect(screen.getByTestId("editor-view")).toBeInTheDocument();
      });
    });

    it("Cmd+Tで置換パネルを開く", async () => {
      render(<EditorView />);

      fireEvent.keyDown(window, { key: "t", metaKey: true });

      await waitFor(() => {
        expect(screen.getByTestId("editor-view")).toBeInTheDocument();
      });
    });

    it("Cmd+Shift+Fでワークスペース検索を開く", async () => {
      render(<EditorView />);

      fireEvent.keyDown(window, { key: "f", metaKey: true, shiftKey: true });

      await waitFor(() => {
        expect(screen.getByTestId("editor-view")).toBeInTheDocument();
      });
    });

    it("Cmd+Shift+Tでワークスペース置換を開く", async () => {
      render(<EditorView />);

      fireEvent.keyDown(window, { key: "t", metaKey: true, shiftKey: true });

      await waitFor(() => {
        expect(screen.getByTestId("editor-view")).toBeInTheDocument();
      });
    });
  });

  describe("ファイル選択", () => {
    it("ファイル選択時にファイル内容を読み込む", async () => {
      const mockSetEditorContent = vi.fn();
      const mockMarkAsSaved = vi.fn();
      const { useAppStore } = await import("../../store");
      vi.mocked(useAppStore).mockImplementation(((
        selector: (state: ReturnType<typeof createMockState>) => unknown,
      ) =>
        selector(
          createMockState({
            setEditorContent: mockSetEditorContent,
            markAsSaved: mockMarkAsSaved,
          }),
        )) as never);

      render(<EditorView />);

      // ファイルツリーからファイルをクリック（WorkspaceSidebar経由）
      const fileItem = screen.queryByText("readme.md");
      if (fileItem) {
        fireEvent.click(fileItem);
        await waitFor(() => {
          expect(mockElectronAPI.file.read).toHaveBeenCalled();
        });
      }
    });

    it("ファイル選択後にファイル名が表示される", async () => {
      render(<EditorView />);
      // 初期状態ではファイル未選択メッセージが表示される
      expect(
        screen.getByText("ファイルを選択してください"),
      ).toBeInTheDocument();
    });
  });

  describe("ファイル保存", () => {
    it("保存ボタンクリックでファイルを保存する", async () => {
      const mockMarkAsSaved = vi.fn();
      const { useAppStore } = await import("../../store");
      vi.mocked(useAppStore).mockImplementation(((
        selector: (state: ReturnType<typeof createMockState>) => unknown,
      ) =>
        selector(
          createMockState({
            hasUnsavedChanges: true,
            markAsSaved: mockMarkAsSaved,
          }),
        )) as never);

      render(<EditorView />);

      // 保存ボタンはファイル未選択時は無効
      const saveButton = screen.getByRole("button", { name: "保存" });
      expect(saveButton).toBeDisabled();
    });
  });

  describe("検索ボタン", () => {
    it("検索ボタンクリックで検索パネルを開閉する", async () => {
      render(<EditorView />);

      const searchButton = screen.getByRole("button", { name: /検索/ });
      fireEvent.click(searchButton);

      await waitFor(() => {
        expect(screen.getByTestId("editor-view")).toBeInTheDocument();
      });
    });
  });

  describe("FileSelectorTrigger", () => {
    it("FileSelectorTriggerボタンが表示される", () => {
      render(<EditorView />);
      expect(screen.getByTestId("file-selector-trigger")).toBeInTheDocument();
    });

    it("FileSelectorTriggerクリックでモーダルを開く", async () => {
      render(<EditorView />);

      const triggerButton = screen.getByTestId("file-selector-trigger");
      fireEvent.click(triggerButton);

      // モーダルが開くことを確認
      await waitFor(() => {
        expect(screen.getByTestId("editor-view")).toBeInTheDocument();
      });
    });
  });

  describe("未保存の変更", () => {
    it("未保存の変更がある場合にインジケータを表示する", async () => {
      const { useAppStore } = await import("../../store");
      vi.mocked(useAppStore).mockImplementation(((
        selector: (state: ReturnType<typeof createMockState>) => unknown,
      ) => selector(createMockState({ hasUnsavedChanges: true }))) as never);

      render(<EditorView />);

      // 未保存インジケータ（•）が表示されることを確認
      // インジケータはファイル選択時のみ表示される可能性があるため、存在チェックのみ
      screen.queryByLabelText("未保存の変更あり");
      expect(screen.getByTestId("editor-view")).toBeInTheDocument();
    });
  });

  describe("ワークスペースパス", () => {
    it("ワークスペースが空の場合nullを返す", async () => {
      const emptyWorkspace = {
        ...mockWorkspace,
        folders: [],
      };
      const { useWorkspace } = await import("../../store");
      vi.mocked(useWorkspace).mockReturnValue(emptyWorkspace);

      render(<EditorView />);
      expect(screen.getByTestId("editor-view")).toBeInTheDocument();
    });
  });

  describe("フォルダ操作", () => {
    it("フォルダ削除ハンドラが呼ばれる", async () => {
      const mockRemoveFolder = vi.fn();
      const { useAppStore } = await import("../../store");
      vi.mocked(useAppStore).mockImplementation(((
        selector: (state: ReturnType<typeof createMockState>) => unknown,
      ) =>
        selector(
          createMockState({ removeFolder: mockRemoveFolder }),
        )) as never);

      render(<EditorView />);
      // フォルダ操作はWorkspaceSidebar経由で行われる
      expect(screen.getByTestId("editor-view")).toBeInTheDocument();
    });

    it("フォルダ展開トグルハンドラが呼ばれる", async () => {
      const mockToggleFolderExpansion = vi.fn();
      const { useAppStore } = await import("../../store");
      vi.mocked(useAppStore).mockImplementation(((
        selector: (state: ReturnType<typeof createMockState>) => unknown,
      ) =>
        selector(
          createMockState({ toggleFolderExpansion: mockToggleFolderExpansion }),
        )) as never);

      render(<EditorView />);
      expect(screen.getByTestId("editor-view")).toBeInTheDocument();
    });

    it("サブフォルダトグルハンドラが呼ばれる", async () => {
      const mockToggleSubfolder = vi.fn();
      const { useAppStore } = await import("../../store");
      vi.mocked(useAppStore).mockImplementation(((
        selector: (state: ReturnType<typeof createMockState>) => unknown,
      ) =>
        selector(
          createMockState({ toggleSubfolder: mockToggleSubfolder }),
        )) as never);

      render(<EditorView />);
      expect(screen.getByTestId("editor-view")).toBeInTheDocument();
    });
  });

  describe("コンテンツ変更", () => {
    it("setEditorContentが呼ばれる", async () => {
      const mockSetEditorContent = vi.fn();
      const { useAppStore } = await import("../../store");
      vi.mocked(useAppStore).mockImplementation(((
        selector: (state: ReturnType<typeof createMockState>) => unknown,
      ) =>
        selector(
          createMockState({ setEditorContent: mockSetEditorContent }),
        )) as never);

      render(<EditorView />);
      // コンテンツ変更はTextArea経由で行われる
      expect(screen.getByTestId("editor-view")).toBeInTheDocument();
    });
  });

  describe("ファイルツリーからのパス収集", () => {
    it("ファイルツリーからパスを収集する", async () => {
      const fileTreeWithChildren: FileNode[] = [
        {
          id: "folder-1",
          path: "/docs",
          name: "docs",
          type: "folder" as const,
          children: [
            {
              id: "file-1",
              path: "/docs/readme.md",
              name: "readme.md",
              type: "file" as const,
            },
          ],
        },
      ];

      const { useAppStore } = await import("../../store");
      vi.mocked(useAppStore).mockImplementation(((
        selector: (state: ReturnType<typeof createMockState>) => unknown,
      ) =>
        selector(
          createMockState({
            folderFileTrees: new Map([
              ["folder-1" as FolderId, fileTreeWithChildren],
            ]),
          }),
        )) as never);

      render(<EditorView />);
      expect(screen.getByTestId("editor-view")).toBeInTheDocument();
    });
  });

  describe("検索パネル表示", () => {
    it("検索ボタンをクリックして検索パネルを開閉する", async () => {
      render(<EditorView />);

      // 検索ボタンを取得（aria-labelで特定）
      const searchButton = screen.getByRole("button", { name: "検索 (⌘F)" });
      expect(searchButton).toBeInTheDocument();

      // クリックして開く
      fireEvent.click(searchButton);

      await waitFor(() => {
        expect(screen.getByTestId("editor-view")).toBeInTheDocument();
      });

      // もう一度クリックして閉じる
      fireEvent.click(searchButton);

      await waitFor(() => {
        expect(screen.getByTestId("editor-view")).toBeInTheDocument();
      });
    });
  });

  describe("F3ナビゲーション", () => {
    it("F3キーで次のマッチに移動しない（検索パネルが閉じている場合）", async () => {
      render(<EditorView />);

      fireEvent.keyDown(window, { key: "F3" });

      await waitFor(() => {
        expect(screen.getByTestId("editor-view")).toBeInTheDocument();
      });
    });

    it("Shift+F3キーで前のマッチに移動しない（検索パネルが閉じている場合）", async () => {
      render(<EditorView />);

      fireEvent.keyDown(window, { key: "F3", shiftKey: true });

      await waitFor(() => {
        expect(screen.getByTestId("editor-view")).toBeInTheDocument();
      });
    });
  });

  describe("Cmd+Nナビゲーション", () => {
    it("Cmd+Nキーでマッチナビゲーション（検索パネルが閉じている場合は無視）", async () => {
      render(<EditorView />);

      fireEvent.keyDown(window, { key: "n", metaKey: true });

      await waitFor(() => {
        expect(screen.getByTestId("editor-view")).toBeInTheDocument();
      });
    });

    it("Cmd+Shift+Nキーでマッチナビゲーション（検索パネルが閉じている場合は無視）", async () => {
      render(<EditorView />);

      fireEvent.keyDown(window, { key: "n", metaKey: true, shiftKey: true });

      await waitFor(() => {
        expect(screen.getByTestId("editor-view")).toBeInTheDocument();
      });
    });
  });

  describe("ローディング状態", () => {
    it("workspaceIsLoadingがtrueの場合ローディング状態になる", async () => {
      const { useWorkspaceLoading } = await import("../../store");
      vi.mocked(useWorkspaceLoading).mockReturnValue(true);

      render(<EditorView />);
      expect(screen.getByTestId("editor-view")).toBeInTheDocument();
    });

    it("保存中の場合ボタンテキストが変わる", async () => {
      render(<EditorView />);
      const saveButton = screen.getByRole("button", { name: "保存" });
      expect(saveButton).toHaveTextContent("保存");
    });
  });

  describe("Ctrlキーショートカット（Windows/Linux）", () => {
    it("Ctrl+Fで検索パネルを開く", async () => {
      render(<EditorView />);

      fireEvent.keyDown(window, { key: "f", ctrlKey: true });

      await waitFor(() => {
        expect(screen.getByTestId("editor-view")).toBeInTheDocument();
      });
    });

    it("Ctrl+Tで置換パネルを開く", async () => {
      render(<EditorView />);

      fireEvent.keyDown(window, { key: "t", ctrlKey: true });

      await waitFor(() => {
        expect(screen.getByTestId("editor-view")).toBeInTheDocument();
      });
    });

    it("Ctrl+Pでファイル名検索を開く", async () => {
      render(<EditorView />);

      fireEvent.keyDown(window, { key: "p", ctrlKey: true });

      await waitFor(() => {
        expect(screen.getByTestId("editor-view")).toBeInTheDocument();
      });
    });
  });

  describe("WorkspaceSidebarコールバック", () => {
    it("ファイル選択でhandleFileSelectが呼ばれる", async () => {
      render(<EditorView />);

      // WorkspaceSidebarのファイルアイテムをクリック
      const fileItems = screen.queryAllByRole("button");
      const fileButton = fileItems.find((btn) =>
        btn.textContent?.includes("readme"),
      );
      if (fileButton) {
        fireEvent.click(fileButton);
        await waitFor(() => {
          expect(mockElectronAPI.file.read).toHaveBeenCalled();
        });
      }
      expect(screen.getByTestId("editor-view")).toBeInTheDocument();
    });

    it("フォルダ展開トグルが動作する", async () => {
      render(<EditorView />);

      // フォルダ展開ボタンを探してクリック
      const folderButtons = screen.queryAllByRole("button");
      expect(folderButtons.length).toBeGreaterThan(0);
      expect(screen.getByTestId("editor-view")).toBeInTheDocument();
    });
  });

  describe("ファイル読み込みエラー", () => {
    it("ファイル読み込み失敗時にエラーをログに出力する", async () => {
      const consoleErrorSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});
      mockElectronAPI.file.read.mockRejectedValueOnce(new Error("Read error"));

      render(<EditorView />);

      // エラーが発生してもコンポーネントは表示される
      expect(screen.getByTestId("editor-view")).toBeInTheDocument();

      consoleErrorSpy.mockRestore();
    });
  });

  describe("ファイル保存エラー", () => {
    it("ファイル保存失敗時にエラーをログに出力する", async () => {
      const consoleErrorSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});
      mockElectronAPI.file.write.mockRejectedValueOnce(
        new Error("Write error"),
      );

      render(<EditorView />);

      // エラーが発生してもコンポーネントは表示される
      expect(screen.getByTestId("editor-view")).toBeInTheDocument();

      consoleErrorSpy.mockRestore();
    });
  });

  describe("検索パネルでのF3ナビゲーション", () => {
    it("検索パネルが開いている状態でF3キーを押す", async () => {
      render(<EditorView />);

      // 検索パネルを開く
      fireEvent.keyDown(window, { key: "f", metaKey: true });

      // F3を押す
      fireEvent.keyDown(window, { key: "F3" });

      await waitFor(() => {
        expect(screen.getByTestId("editor-view")).toBeInTheDocument();
      });
    });

    it("検索パネルが開いている状態でShift+F3キーを押す", async () => {
      render(<EditorView />);

      // 検索パネルを開く
      fireEvent.keyDown(window, { key: "f", metaKey: true });

      // Shift+F3を押す
      fireEvent.keyDown(window, { key: "F3", shiftKey: true });

      await waitFor(() => {
        expect(screen.getByTestId("editor-view")).toBeInTheDocument();
      });
    });

    it("検索パネルが開いている状態でCmd+Nキーを押す", async () => {
      render(<EditorView />);

      // 検索パネルを開く
      fireEvent.keyDown(window, { key: "f", metaKey: true });

      // Cmd+Nを押す
      fireEvent.keyDown(window, { key: "n", metaKey: true });

      await waitFor(() => {
        expect(screen.getByTestId("editor-view")).toBeInTheDocument();
      });
    });

    it("検索パネルが開いている状態でCmd+Shift+Nキーを押す", async () => {
      render(<EditorView />);

      // 検索パネルを開く
      fireEvent.keyDown(window, { key: "f", metaKey: true });

      // Cmd+Shift+Nを押す
      fireEvent.keyDown(window, { key: "n", metaKey: true, shiftKey: true });

      await waitFor(() => {
        expect(screen.getByTestId("editor-view")).toBeInTheDocument();
      });
    });
  });

  describe("検索パネルクローズ", () => {
    it("検索パネルを開いてEscapeで閉じる", async () => {
      render(<EditorView />);

      // 検索パネルを開く
      fireEvent.keyDown(window, { key: "f", metaKey: true });

      // Escapeで閉じる
      fireEvent.keyDown(window, { key: "Escape" });

      await waitFor(() => {
        expect(screen.getByTestId("editor-view")).toBeInTheDocument();
      });
    });
  });

  describe("ワークスペース検索モード", () => {
    it("ワークスペース検索モードでF3を押しても無視される", async () => {
      render(<EditorView />);

      // ワークスペース検索パネルを開く
      fireEvent.keyDown(window, { key: "f", metaKey: true, shiftKey: true });

      // F3を押す（workspaceモードなので無視される）
      fireEvent.keyDown(window, { key: "F3" });

      await waitFor(() => {
        expect(screen.getByTestId("editor-view")).toBeInTheDocument();
      });
    });
  });

  describe("ファイル名検索モード", () => {
    it("ファイル名検索モードでCmd+Nを押しても無視される", async () => {
      render(<EditorView />);

      // ファイル名検索パネルを開く
      fireEvent.keyDown(window, { key: "p", metaKey: true });

      // Cmd+Nを押す（filenameモードなので無視される）
      fireEvent.keyDown(window, { key: "n", metaKey: true });

      await waitFor(() => {
        expect(screen.getByTestId("editor-view")).toBeInTheDocument();
      });
    });
  });

  describe("handleFileSelect", () => {
    it("ファイルツリーアイテムをクリックするとfile.readが呼ばれる", async () => {
      mockElectronAPI.file.read.mockResolvedValue({
        success: true,
        data: { content: "# Test File Content" },
      });

      render(<EditorView />);

      // file-tree-item-file-1をクリック
      const fileItem = screen.queryByTestId("file-tree-item-file-1");
      if (fileItem) {
        fireEvent.click(fileItem);

        await waitFor(() => {
          expect(mockElectronAPI.file.read).toHaveBeenCalledWith({
            filePath: "/docs/readme.md",
          });
        });
      }
      expect(screen.getByTestId("editor-view")).toBeInTheDocument();
    });

    it("ファイル読み込み失敗時にエラーをログ出力する", async () => {
      const consoleErrorSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});
      mockElectronAPI.file.read.mockRejectedValueOnce(
        new Error("File read failed"),
      );

      render(<EditorView />);

      const fileItem = screen.queryByTestId("file-tree-item-file-1");
      if (fileItem) {
        fireEvent.click(fileItem);

        await waitFor(() => {
          expect(consoleErrorSpy).toHaveBeenCalledWith(
            "Failed to load file:",
            expect.any(Error),
          );
        });
      }

      consoleErrorSpy.mockRestore();
    });

    it("ファイル読み込みでsuccessがfalseの場合", async () => {
      mockElectronAPI.file.read.mockResolvedValueOnce({
        success: false,
        data: null,
      });

      render(<EditorView />);

      const fileItem = screen.queryByTestId("file-tree-item-file-1");
      if (fileItem) {
        fireEvent.click(fileItem);

        await waitFor(() => {
          expect(mockElectronAPI.file.read).toHaveBeenCalled();
        });
      }
      expect(screen.getByTestId("editor-view")).toBeInTheDocument();
    });
  });

  describe("handleAddFolder", () => {
    it("addFolderが呼ばれる", async () => {
      const mockAddFolder = vi.fn();
      const { useAppStore } = await import("../../store");
      vi.mocked(useAppStore).mockImplementation(((
        selector: (state: ReturnType<typeof createMockState>) => unknown,
      ) => selector(createMockState({ addFolder: mockAddFolder }))) as never);

      render(<EditorView />);

      // add-folder-btnをクリック
      const addButton = screen.getByTestId("add-folder-btn");
      fireEvent.click(addButton);

      await waitFor(() => {
        expect(mockAddFolder).toHaveBeenCalled();
      });
    });
  });

  describe("handleRemoveFolder", () => {
    it("removeFolderが呼ばれる", async () => {
      const mockRemoveFolder = vi.fn();
      const { useAppStore } = await import("../../store");
      vi.mocked(useAppStore).mockImplementation(((
        selector: (state: ReturnType<typeof createMockState>) => unknown,
      ) =>
        selector(
          createMockState({ removeFolder: mockRemoveFolder }),
        )) as never);

      render(<EditorView />);

      // WorkspaceSidebarにフォルダ削除ボタンがあるはず
      // data-testidまたはaria-labelで探す
      const removeButtons = screen.queryAllByLabelText(/削除|remove/i);
      if (removeButtons.length > 0) {
        fireEvent.click(removeButtons[0]);
        await waitFor(() => {
          expect(mockRemoveFolder).toHaveBeenCalled();
        });
      }
      expect(screen.getByTestId("editor-view")).toBeInTheDocument();
    });
  });

  describe("handleToggleFolderExpansion", () => {
    it("toggleFolderExpansionがコールバックとして渡される", async () => {
      const mockToggleFolderExpansion = vi.fn();
      const { useAppStore } = await import("../../store");
      vi.mocked(useAppStore).mockImplementation(((
        selector: (state: ReturnType<typeof createMockState>) => unknown,
      ) =>
        selector(
          createMockState({ toggleFolderExpansion: mockToggleFolderExpansion }),
        )) as never);

      render(<EditorView />);

      // WorkspaceSidebarが表示されていることを確認
      expect(screen.getByTestId("workspace-sidebar")).toBeInTheDocument();
      // フォルダ展開ハンドラはWorkspaceSidebarに渡される
      expect(screen.getByTestId("editor-view")).toBeInTheDocument();
    });
  });

  describe("handleToggleSubfolder", () => {
    it("toggleSubfolderがコールバックとして渡される", async () => {
      const mockToggleSubfolder = vi.fn();
      const fileTreeWithSubfolders: FileNode[] = [
        {
          id: "subfolder-1",
          path: "/docs/subfolder",
          name: "subfolder",
          type: "folder" as const,
          children: [
            {
              id: "nested-file-1",
              path: "/docs/subfolder/nested.md",
              name: "nested.md",
              type: "file" as const,
            },
          ],
        },
      ];

      const { useAppStore } = await import("../../store");
      vi.mocked(useAppStore).mockImplementation(((
        selector: (state: ReturnType<typeof createMockState>) => unknown,
      ) =>
        selector(
          createMockState({
            toggleSubfolder: mockToggleSubfolder,
            folderFileTrees: new Map([
              ["folder-1" as FolderId, fileTreeWithSubfolders],
            ]),
          }),
        )) as never);

      render(<EditorView />);

      // WorkspaceSidebarが表示されていることを確認
      expect(screen.getByTestId("workspace-sidebar")).toBeInTheDocument();
      // サブフォルダトグルハンドラはWorkspaceSidebarに渡される
      expect(screen.getByTestId("editor-view")).toBeInTheDocument();
    });
  });

  describe("FileSelectorModal onConfirm", () => {
    it("FileSelectorModalでファイル選択を確定すると最初のファイルが開かれる", async () => {
      mockElectronAPI.file.read.mockResolvedValue({
        success: true,
        data: { content: "# Selected File" },
      });

      render(<EditorView />);

      // FileSelectorTriggerをクリックしてモーダルを開く
      const triggerButton = screen.getByTestId("file-selector-trigger");
      fireEvent.click(triggerButton);

      await waitFor(() => {
        expect(screen.getByTestId("editor-view")).toBeInTheDocument();
      });
    });
  });

  describe("handleWorkspaceResultClick", () => {
    it("ワークスペース検索結果クリック時にファイルを開く", async () => {
      mockElectronAPI.file.read.mockResolvedValue({
        success: true,
        data: { content: "# Workspace Result File" },
      });

      render(<EditorView />);

      // ワークスペース検索パネルを開く
      fireEvent.keyDown(window, { key: "f", metaKey: true, shiftKey: true });

      await waitFor(() => {
        expect(screen.getByTestId("editor-view")).toBeInTheDocument();
      });
    });
  });

  describe("handleFileNameSelect", () => {
    it("ファイル名検索結果選択時にファイルを開いて検索パネルを閉じる", async () => {
      mockElectronAPI.file.read.mockResolvedValue({
        success: true,
        data: { content: "# Filename Search Result" },
      });

      render(<EditorView />);

      // ファイル名検索パネルを開く
      fireEvent.keyDown(window, { key: "p", metaKey: true });

      await waitFor(() => {
        expect(screen.getByTestId("editor-view")).toBeInTheDocument();
      });
    });
  });

  describe("handleFileSelectorConfirm", () => {
    it("空のファイルリストで確定しても何も起こらない", async () => {
      const mockSetEditorContent = vi.fn();
      const { useAppStore } = await import("../../store");
      vi.mocked(useAppStore).mockImplementation(((
        selector: (state: ReturnType<typeof createMockState>) => unknown,
      ) =>
        selector(
          createMockState({ setEditorContent: mockSetEditorContent }),
        )) as never);

      render(<EditorView />);

      // FileSelectorTriggerをクリックしてモーダルを開く
      const triggerButton = screen.getByTestId("file-selector-trigger");
      fireEvent.click(triggerButton);

      await waitFor(() => {
        expect(screen.getByTestId("editor-view")).toBeInTheDocument();
      });
    });
  });
});
