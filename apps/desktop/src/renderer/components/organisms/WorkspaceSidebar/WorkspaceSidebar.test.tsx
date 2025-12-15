/**
 * WorkspaceSidebar Component Tests
 *
 * このテストファイルは、設計書 UI-WS-001 に基づいて作成されています。
 *
 * テスト対象: WorkspaceSidebar（organism コンポーネント）
 * 参照設計書: docs/30-workflows/workspace-manager/task-step01-3-ui-design.md §3
 *
 * @vitest-environment happy-dom
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  render,
  screen,
  within,
  cleanup,
  waitFor,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom/vitest";
import type { WorkspaceSidebarProps } from "./WorkspaceSidebar";
import { WorkspaceSidebar } from "./WorkspaceSidebar";

// Mock useIpc for rename functionality
const mockInvoke = vi.fn();
vi.mock("@/hooks/useIpc", () => ({
  useIpc: () => ({ invoke: mockInvoke }),
}));
import type {
  Workspace,
  FolderEntry,
  FolderId,
  FolderPath,
} from "../../../store/types/workspace";
import type { FileNode } from "../../../store/types";

describe("WorkspaceSidebar", () => {
  // ============================================
  // テストデータのセットアップ
  // ============================================
  const mockFolderEntry: FolderEntry = {
    id: "folder-1" as FolderId,
    path: "/Users/test/project" as FolderPath,
    displayName: "project",
    isExpanded: false,
    expandedPaths: new Set(),
    addedAt: new Date("2024-01-15T10:00:00"),
  };

  const mockFileTree: FileNode[] = [
    {
      id: "file-1",
      name: "src",
      type: "folder",
      path: "/Users/test/project/src",
      children: [
        {
          id: "file-2",
          name: "index.ts",
          type: "file",
          path: "/Users/test/project/src/index.ts",
        },
      ],
    },
    {
      id: "file-3",
      name: "package.json",
      type: "file",
      path: "/Users/test/project/package.json",
    },
  ];

  const mockWorkspace: Workspace = {
    id: "default",
    folders: [mockFolderEntry],
    lastSelectedFileId: null,
    createdAt: new Date("2024-01-15T10:00:00"),
    updatedAt: new Date("2024-01-15T10:00:00"),
  };

  const mockEmptyWorkspace: Workspace = {
    id: "default",
    folders: [],
    lastSelectedFileId: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockFolderFileTrees = new Map<FolderId, FileNode[]>([
    ["folder-1" as FolderId, mockFileTree],
  ]);

  const createDefaultProps = (): WorkspaceSidebarProps => ({
    workspace: mockWorkspace,
    folderFileTrees: mockFolderFileTrees,
    selectedFile: null,
    unsavedFiles: new Set(),
    onAddFolder: vi.fn().mockResolvedValue(undefined),
    onRemoveFolder: vi.fn(),
    onToggleFolderExpansion: vi.fn(),
    onToggleSubfolder: vi.fn(),
    onSelectFile: vi.fn(),
  });

  beforeEach(() => {
    cleanup();
    vi.clearAllMocks();
    mockInvoke.mockResolvedValue({
      success: true,
      data: { oldPath: "", newPath: "" },
    });
  });

  // ============================================
  // レンダリングテスト
  // ============================================
  describe("Rendering", () => {
    it("ワークスペースサイドバーをレンダリングする", () => {
      const props = createDefaultProps();
      render(<WorkspaceSidebar {...props} />);

      const sidebar = screen.getByTestId("workspace-sidebar");
      expect(sidebar).toBeInTheDocument();
      expect(sidebar.tagName).toBe("ASIDE");
    });

    it("ヘッダーに「Workspace」タイトルを表示する", () => {
      const props = createDefaultProps();
      render(<WorkspaceSidebar {...props} />);

      const sidebar = screen.getByTestId("workspace-sidebar");
      const heading = within(sidebar).getByRole("heading", { level: 2 });
      expect(heading).toHaveTextContent("Workspace");
    });

    it("フォルダ追加ボタンを表示する", () => {
      const props = createDefaultProps();
      render(<WorkspaceSidebar {...props} />);

      expect(screen.getByTestId("add-folder-btn")).toBeInTheDocument();
    });

    it("フォルダリストを表示する", () => {
      const props = createDefaultProps();
      render(<WorkspaceSidebar {...props} />);

      expect(screen.getByTestId("folder-list")).toBeInTheDocument();
      const folderEntry = screen.getByTestId("folder-entry-folder-1");
      expect(within(folderEntry).getByText("project")).toBeInTheDocument();
    });

    it("空のワークスペースの場合、空状態を表示する", () => {
      const props = createDefaultProps();
      props.workspace = mockEmptyWorkspace;
      render(<WorkspaceSidebar {...props} />);

      expect(screen.getByTestId("workspace-empty")).toBeInTheDocument();
      expect(screen.getByText(/フォルダがありません/i)).toBeInTheDocument();
    });

    it("ローディング中はローディング表示する", () => {
      const props = createDefaultProps();
      render(<WorkspaceSidebar {...props} isLoading={true} />);

      expect(screen.getByTestId("workspace-loading")).toBeInTheDocument();
      expect(screen.getByText(/読み込み中/i)).toBeInTheDocument();
    });

    it("エラー時はエラーメッセージを表示する", () => {
      const props = createDefaultProps();
      render(<WorkspaceSidebar {...props} error="Failed to load workspace" />);

      expect(screen.getByTestId("workspace-error")).toBeInTheDocument();
      expect(screen.getByText(/Failed to load workspace/i)).toBeInTheDocument();
    });

    it("カスタムクラス名を適用する", () => {
      const props = createDefaultProps();
      render(<WorkspaceSidebar {...props} className="custom-class" />);

      const sidebar = screen.getByTestId("workspace-sidebar");
      expect(sidebar).toHaveClass("custom-class");
    });
  });

  // ============================================
  // インタラクションテスト - フォルダ追加
  // ============================================
  describe("Interactions - Add Folder", () => {
    it("フォルダ追加ボタンをクリックするとハンドラーが呼ばれる", async () => {
      const handleAddFolder = vi.fn().mockResolvedValue(undefined);
      const props = createDefaultProps();
      props.onAddFolder = handleAddFolder;
      render(<WorkspaceSidebar {...props} />);

      await userEvent.click(screen.getByTestId("add-folder-btn"));

      expect(handleAddFolder).toHaveBeenCalledTimes(1);
    });

    it("空状態のフォルダ追加ボタンをクリックするとハンドラーが呼ばれる", async () => {
      const handleAddFolder = vi.fn().mockResolvedValue(undefined);
      const props = createDefaultProps();
      props.workspace = mockEmptyWorkspace;
      props.onAddFolder = handleAddFolder;
      render(<WorkspaceSidebar {...props} />);

      await userEvent.click(screen.getByTestId("add-folder-empty-btn"));

      expect(handleAddFolder).toHaveBeenCalledTimes(1);
    });

    it("ローディング中はボタンを無効化する", () => {
      const props = createDefaultProps();
      render(<WorkspaceSidebar {...props} isLoading={true} />);

      const addButton = screen.getByTestId("add-folder-btn");
      expect(addButton).toBeDisabled();
    });

    it("追加処理中はボタンを無効化する", async () => {
      let resolveAddFolder: () => void;
      const addFolderPromise = new Promise<void>((resolve) => {
        resolveAddFolder = resolve;
      });
      const handleAddFolder = vi.fn().mockReturnValue(addFolderPromise);
      const props = createDefaultProps();
      props.onAddFolder = handleAddFolder;
      render(<WorkspaceSidebar {...props} />);

      const addButton = screen.getByTestId("add-folder-btn");
      await userEvent.click(addButton);

      expect(addButton).toBeDisabled();
      expect(screen.getByText("追加中...")).toBeInTheDocument();

      resolveAddFolder!();
      await addFolderPromise;
    });
  });

  // ============================================
  // インタラクションテスト - フォルダ展開/折りたたみ
  // ============================================
  describe("Interactions - Folder Expansion", () => {
    it("フォルダをクリックすると展開/折りたたみハンドラーが呼ばれる", async () => {
      const handleToggleExpansion = vi.fn();
      const props = createDefaultProps();
      props.onToggleFolderExpansion = handleToggleExpansion;
      render(<WorkspaceSidebar {...props} />);

      const folderEntry = screen.getByTestId("folder-entry-folder-1");
      await userEvent.click(within(folderEntry).getByText("project"));

      expect(handleToggleExpansion).toHaveBeenCalledWith("folder-1");
    });

    it("Enterキーでフォルダを展開する", async () => {
      const handleToggleExpansion = vi.fn();
      const props = createDefaultProps();
      props.onToggleFolderExpansion = handleToggleExpansion;
      render(<WorkspaceSidebar {...props} />);

      const folderHeader = screen
        .getByTestId("folder-entry-folder-1")
        .querySelector('[role="button"]') as HTMLElement;
      folderHeader.focus();
      await userEvent.keyboard("{Enter}");

      expect(handleToggleExpansion).toHaveBeenCalledWith("folder-1");
    });

    it("Spaceキーでフォルダを展開する", async () => {
      const handleToggleExpansion = vi.fn();
      const props = createDefaultProps();
      props.onToggleFolderExpansion = handleToggleExpansion;
      render(<WorkspaceSidebar {...props} />);

      const folderHeader = screen
        .getByTestId("folder-entry-folder-1")
        .querySelector('[role="button"]') as HTMLElement;
      folderHeader.focus();
      await userEvent.keyboard(" ");

      expect(handleToggleExpansion).toHaveBeenCalledWith("folder-1");
    });

    it("展開状態のフォルダは展開アイコンが変わる", () => {
      const props = createDefaultProps();
      props.workspace = {
        ...mockWorkspace,
        folders: [{ ...mockFolderEntry, isExpanded: true }],
      };
      render(<WorkspaceSidebar {...props} />);

      const expandIcon = screen.getByTestId("folder-expand-folder-1");
      expect(expandIcon).toHaveTextContent("▼");
    });

    it("折りたたみ状態のフォルダは折りたたみアイコンを表示", () => {
      const props = createDefaultProps();
      render(<WorkspaceSidebar {...props} />);

      const expandIcon = screen.getByTestId("folder-expand-folder-1");
      expect(expandIcon).toHaveTextContent("▶");
    });
  });

  // ============================================
  // インタラクションテスト - フォルダ削除
  // ============================================
  describe("Interactions - Remove Folder", () => {
    it("削除ボタンをクリックすると削除ハンドラーが呼ばれる", async () => {
      const handleRemoveFolder = vi.fn();
      const props = createDefaultProps();
      props.onRemoveFolder = handleRemoveFolder;
      render(<WorkspaceSidebar {...props} />);

      // 削除ボタンはCSSで非表示（opacity-0）だがDOMには存在する
      const removeButton = screen.getByTestId("folder-remove-folder-1");
      await userEvent.click(removeButton);

      expect(handleRemoveFolder).toHaveBeenCalledWith("folder-1");
    });

    it("削除ボタンに適切なaria-labelが設定されている", () => {
      const props = createDefaultProps();
      render(<WorkspaceSidebar {...props} />);

      const removeButton = screen.getByTestId("folder-remove-folder-1");
      expect(removeButton).toHaveAttribute("aria-label", "projectを削除");
    });
  });

  // ============================================
  // インタラクションテスト - ファイル選択
  // ============================================
  describe("Interactions - File Selection", () => {
    it("展開されたフォルダのファイルをクリックすると選択ハンドラーが呼ばれる", async () => {
      const handleSelectFile = vi.fn();
      const props = createDefaultProps();
      props.workspace = {
        ...mockWorkspace,
        folders: [{ ...mockFolderEntry, isExpanded: true }],
      };
      props.onSelectFile = handleSelectFile;
      render(<WorkspaceSidebar {...props} />);

      await userEvent.click(screen.getByText("package.json"));

      expect(handleSelectFile).toHaveBeenCalledWith(
        "/Users/test/project/package.json",
      );
    });

    it("選択されたファイルがハイライト表示される", () => {
      const props = createDefaultProps();
      props.workspace = {
        ...mockWorkspace,
        folders: [{ ...mockFolderEntry, isExpanded: true }],
      };
      props.selectedFile = "/Users/test/project/package.json";
      render(<WorkspaceSidebar {...props} />);

      // data-testidはdiv要素に設定されている（li要素の子）
      const fileItemDiv = screen.getByTestId("file-tree-item-file-3");
      expect(fileItemDiv).toBeInTheDocument();
      expect(fileItemDiv).toHaveClass("bg-blue-600/30");
    });
  });

  // ============================================
  // 未保存ファイルインジケーター
  // ============================================
  describe("Unsaved Files Indicator", () => {
    it("未保存ファイルにインジケーターを表示する", () => {
      const props = createDefaultProps();
      props.workspace = {
        ...mockWorkspace,
        folders: [{ ...mockFolderEntry, isExpanded: true }],
      };
      props.unsavedFiles = new Set(["/Users/test/project/package.json"]);
      render(<WorkspaceSidebar {...props} />);

      const fileItem = screen.getByTestId("file-tree-item-file-3");
      const indicator = within(fileItem).getByLabelText("未保存");
      expect(indicator).toBeInTheDocument();
    });

    it("保存済みファイルにはインジケーターを表示しない", () => {
      const props = createDefaultProps();
      props.workspace = {
        ...mockWorkspace,
        folders: [{ ...mockFolderEntry, isExpanded: true }],
      };
      props.unsavedFiles = new Set();
      render(<WorkspaceSidebar {...props} />);

      const fileItem = screen.getByTestId("file-tree-item-file-3");
      expect(
        within(fileItem).queryByLabelText("未保存"),
      ).not.toBeInTheDocument();
    });
  });

  // ============================================
  // コンテキストメニュー
  // ============================================
  describe("Context Menu", () => {
    it("フォルダを右クリックするとコンテキストメニューを表示する", async () => {
      const props = createDefaultProps();
      render(<WorkspaceSidebar {...props} />);

      const folderHeader = screen.getByTestId("folder-header-folder-1");

      // 右クリックでコンテキストメニューを表示
      await userEvent.pointer({ keys: "[MouseRight]", target: folderHeader });

      // コンテキストメニューが表示されていることを確認
      const contextMenu = screen.getByTestId("context-menu");
      expect(contextMenu).toBeInTheDocument();
    });

    it("コンテキストメニューに展開/折りたたみオプションがある", async () => {
      const props = createDefaultProps();
      render(<WorkspaceSidebar {...props} />);

      const folderHeader = screen.getByTestId("folder-header-folder-1");

      await userEvent.pointer({ keys: "[MouseRight]", target: folderHeader });

      const expandItem = screen.getByTestId(
        "context-menu-item-expand-collapse",
      );
      expect(expandItem).toBeInTheDocument();
      expect(expandItem).toHaveTextContent("展開する");
    });

    it("コンテキストメニューに削除オプションがある", async () => {
      const props = createDefaultProps();
      render(<WorkspaceSidebar {...props} />);

      const folderHeader = screen.getByTestId("folder-header-folder-1");

      await userEvent.pointer({ keys: "[MouseRight]", target: folderHeader });

      const removeItem = screen.getByTestId("context-menu-item-remove");
      expect(removeItem).toBeInTheDocument();
      expect(removeItem).toHaveTextContent("削除");
    });

    it("コンテキストメニューの削除をクリックするとonRemoveFolderが呼ばれる", async () => {
      const handleRemoveFolder = vi.fn();
      const props = createDefaultProps();
      props.onRemoveFolder = handleRemoveFolder;
      render(<WorkspaceSidebar {...props} />);

      const folderHeader = screen.getByTestId("folder-header-folder-1");

      await userEvent.pointer({ keys: "[MouseRight]", target: folderHeader });

      const removeItem = screen.getByTestId("context-menu-item-remove");
      await userEvent.click(removeItem);

      expect(handleRemoveFolder).toHaveBeenCalledWith("folder-1");
    });

    it("コンテキストメニュー外をクリックするとメニューが閉じる", async () => {
      const props = createDefaultProps();
      render(<WorkspaceSidebar {...props} />);

      const folderHeader = screen.getByTestId("folder-header-folder-1");

      await userEvent.pointer({ keys: "[MouseRight]", target: folderHeader });

      // コンテキストメニューが表示されていることを確認
      expect(screen.getByTestId("context-menu")).toBeInTheDocument();

      // メニュー外をクリック
      await userEvent.click(document.body);

      // メニューが閉じていることを確認
      expect(screen.queryByTestId("context-menu")).not.toBeInTheDocument();
    });

    it("Escキーでコンテキストメニューが閉じる", async () => {
      const props = createDefaultProps();
      render(<WorkspaceSidebar {...props} />);

      const folderHeader = screen.getByTestId("folder-header-folder-1");

      await userEvent.pointer({ keys: "[MouseRight]", target: folderHeader });

      expect(screen.getByTestId("context-menu")).toBeInTheDocument();

      // Escキーを押す
      await userEvent.keyboard("{Escape}");

      expect(screen.queryByTestId("context-menu")).not.toBeInTheDocument();
    });
  });

  // ============================================
  // アクセシビリティテスト
  // ============================================
  describe("Accessibility", () => {
    it("サイドバーにaria-labelが設定されている", () => {
      const props = createDefaultProps();
      render(<WorkspaceSidebar {...props} />);

      const sidebar = screen.getByTestId("workspace-sidebar");
      expect(sidebar).toHaveAttribute("aria-label", "ワークスペースサイドバー");
    });

    it("フォルダにaria-expandedが設定されている", () => {
      const props = createDefaultProps();
      render(<WorkspaceSidebar {...props} />);

      const folderHeader = screen
        .getByTestId("folder-entry-folder-1")
        .querySelector('[role="button"]');
      expect(folderHeader).toHaveAttribute("aria-expanded", "false");
    });

    it("展開されたフォルダはaria-expanded=trueになる", () => {
      const props = createDefaultProps();
      props.workspace = {
        ...mockWorkspace,
        folders: [{ ...mockFolderEntry, isExpanded: true }],
      };
      render(<WorkspaceSidebar {...props} />);

      const folderHeader = screen
        .getByTestId("folder-entry-folder-1")
        .querySelector('[role="button"]');
      expect(folderHeader).toHaveAttribute("aria-expanded", "true");
    });

    it("フォルダリストにtreeロールが設定されている", () => {
      const props = createDefaultProps();
      render(<WorkspaceSidebar {...props} />);

      const folderList = screen.getByTestId("folder-list");
      expect(folderList).toHaveAttribute("role", "tree");
    });

    it("ボタンに適切なaria-labelが設定されている", () => {
      const props = createDefaultProps();
      render(<WorkspaceSidebar {...props} />);

      const addButton = screen.getByTestId("add-folder-btn");
      expect(addButton).toHaveAttribute("aria-label", "フォルダを追加");
    });
  });

  // ============================================
  // エラーハンドリング
  // ============================================
  describe("Error Handling", () => {
    it("エラー発生時もアプリがクラッシュしない", () => {
      const handleAddFolder = vi
        .fn()
        .mockRejectedValue(new Error("Network error"));
      const props = createDefaultProps();
      props.onAddFolder = handleAddFolder;

      expect(() => {
        render(<WorkspaceSidebar {...props} />);
      }).not.toThrow();
    });

    it("エラーメッセージが適切に表示される", () => {
      const props = createDefaultProps();
      render(<WorkspaceSidebar {...props} error="Failed to load" />);

      expect(screen.getByTestId("workspace-error")).toBeInTheDocument();
      expect(screen.getByText(/Failed to load/i)).toBeInTheDocument();
    });

    it("エラー状態でもフォルダ追加ボタンは表示される", () => {
      const props = createDefaultProps();
      render(<WorkspaceSidebar {...props} error="Some error" />);

      expect(screen.getByTestId("add-folder-btn")).toBeInTheDocument();
    });
  });

  // ============================================
  // 境界値テスト
  // ============================================
  describe("Boundary Value Tests", () => {
    it("フォルダが0個の場合", () => {
      const props = createDefaultProps();
      props.workspace = mockEmptyWorkspace;
      render(<WorkspaceSidebar {...props} />);

      expect(screen.getByTestId("workspace-empty")).toBeInTheDocument();
    });

    it("フォルダが1個の場合", () => {
      const props = createDefaultProps();
      render(<WorkspaceSidebar {...props} />);

      const folderEntry = screen.getByTestId("folder-entry-folder-1");
      expect(within(folderEntry).getByText("project")).toBeInTheDocument();
    });

    it("フォルダが複数（10個）の場合", () => {
      const props = createDefaultProps();
      props.workspace = {
        ...mockWorkspace,
        folders: Array.from({ length: 10 }, (_, i) => ({
          ...mockFolderEntry,
          id: `folder-${i}` as FolderId,
          path: `/Users/test/project${i}` as FolderPath,
          displayName: `project${i}`,
        })),
      };
      render(<WorkspaceSidebar {...props} />);

      for (let i = 0; i < 10; i++) {
        expect(screen.getByText(`project${i}`)).toBeInTheDocument();
      }
    });

    it("未保存ファイルが0個の場合、ファイルにインジケーターなし", () => {
      const props = createDefaultProps();
      props.workspace = {
        ...mockWorkspace,
        folders: [{ ...mockFolderEntry, isExpanded: true }],
      };
      props.unsavedFiles = new Set();
      render(<WorkspaceSidebar {...props} />);

      const fileItem = screen.getByTestId("file-tree-item-file-3");
      expect(
        within(fileItem).queryByLabelText("未保存"),
      ).not.toBeInTheDocument();
    });

    it("未保存ファイルが1つの場合インジケーターを表示", () => {
      const props = createDefaultProps();
      props.workspace = {
        ...mockWorkspace,
        folders: [{ ...mockFolderEntry, isExpanded: true }],
      };
      props.unsavedFiles = new Set(["/Users/test/project/package.json"]);
      render(<WorkspaceSidebar {...props} />);

      const fileItem = screen.getByTestId("file-tree-item-file-3");
      expect(within(fileItem).getByLabelText("未保存")).toBeInTheDocument();
    });

    it("長いフォルダ名が省略表示される", () => {
      const props = createDefaultProps();
      props.workspace = {
        ...mockWorkspace,
        folders: [
          {
            ...mockFolderEntry,
            displayName:
              "very-long-folder-name-that-should-be-truncated-in-the-ui",
          },
        ],
      };
      render(<WorkspaceSidebar {...props} />);

      const folderText = screen.getByText(
        /very-long-folder-name-that-should-be-truncated-in-the-ui/,
      );
      expect(folderText).toHaveClass("truncate");
    });
  });

  // ============================================
  // スナップショットテスト
  // ============================================
  describe("Snapshot Tests", () => {
    it("デフォルト状態のスナップショット", () => {
      const props = createDefaultProps();
      const { container } = render(<WorkspaceSidebar {...props} />);
      expect(container.firstChild).toMatchSnapshot();
    });

    it("空状態のスナップショット", () => {
      const props = createDefaultProps();
      props.workspace = mockEmptyWorkspace;
      const { container } = render(<WorkspaceSidebar {...props} />);
      expect(container.firstChild).toMatchSnapshot();
    });

    it("ローディング状態のスナップショット", () => {
      const props = createDefaultProps();
      const { container } = render(
        <WorkspaceSidebar {...props} isLoading={true} />,
      );
      expect(container.firstChild).toMatchSnapshot();
    });

    it("エラー状態のスナップショット", () => {
      const props = createDefaultProps();
      const { container } = render(
        <WorkspaceSidebar {...props} error="Test error" />,
      );
      expect(container.firstChild).toMatchSnapshot();
    });
  });

  // ============================================
  // ファイルリネーム機能テスト
  // ============================================
  describe("File Rename Functionality", () => {
    it("ダブルクリックで編集モードに入る", async () => {
      const props = createDefaultProps();
      props.workspace = {
        ...mockWorkspace,
        folders: [{ ...mockFolderEntry, isExpanded: true }],
      };
      render(<WorkspaceSidebar {...props} />);

      const fileItem = screen.getByTestId("file-tree-item-file-3");
      await userEvent.dblClick(fileItem);

      await waitFor(() => {
        const input = screen.getByTestId("file-tree-rename-input");
        expect(input).toBeInTheDocument();
        expect(input).toHaveValue("package.json");
      });
    });

    it("F2キーで編集モードに入る", async () => {
      const props = createDefaultProps();
      props.workspace = {
        ...mockWorkspace,
        folders: [{ ...mockFolderEntry, isExpanded: true }],
      };
      render(<WorkspaceSidebar {...props} />);

      const fileItem = screen.getByTestId("file-tree-item-file-3");
      fileItem.focus();
      await userEvent.keyboard("{F2}");

      await waitFor(() => {
        const input = screen.getByTestId("file-tree-rename-input");
        expect(input).toBeInTheDocument();
      });
    });

    it("Enterキーでリネームを確定する", async () => {
      const handleRename = vi.fn();
      const props = createDefaultProps();
      props.workspace = {
        ...mockWorkspace,
        folders: [{ ...mockFolderEntry, isExpanded: true }],
      };
      props.onRename = handleRename;
      render(<WorkspaceSidebar {...props} />);

      const fileItem = screen.getByTestId("file-tree-item-file-3");
      await userEvent.dblClick(fileItem);

      await waitFor(() => {
        expect(
          screen.getByTestId("file-tree-rename-input"),
        ).toBeInTheDocument();
      });

      const input = screen.getByTestId("file-tree-rename-input");
      await userEvent.clear(input);
      await userEvent.type(input, "newname.json{enter}");

      await waitFor(() => {
        expect(mockInvoke).toHaveBeenCalledWith("file:rename", {
          oldPath: "/Users/test/project/package.json",
          newPath: "/Users/test/project/newname.json",
        });
      });
    });

    it("Escapeキーで編集をキャンセルする", async () => {
      const props = createDefaultProps();
      props.workspace = {
        ...mockWorkspace,
        folders: [{ ...mockFolderEntry, isExpanded: true }],
      };
      render(<WorkspaceSidebar {...props} />);

      const fileItem = screen.getByTestId("file-tree-item-file-3");
      await userEvent.dblClick(fileItem);

      await waitFor(() => {
        expect(
          screen.getByTestId("file-tree-rename-input"),
        ).toBeInTheDocument();
      });

      const input = screen.getByTestId("file-tree-rename-input");
      await userEvent.type(input, "newname{escape}");

      await waitFor(() => {
        expect(
          screen.queryByTestId("file-tree-rename-input"),
        ).not.toBeInTheDocument();
      });

      // Original name should still be displayed
      expect(screen.getByText("package.json")).toBeInTheDocument();
    });

    it("入力がフォーカスを失うとリネームを実行する", async () => {
      const props = createDefaultProps();
      props.workspace = {
        ...mockWorkspace,
        folders: [{ ...mockFolderEntry, isExpanded: true }],
      };
      render(<WorkspaceSidebar {...props} />);

      const fileItem = screen.getByTestId("file-tree-item-file-3");
      await userEvent.dblClick(fileItem);

      await waitFor(() => {
        expect(
          screen.getByTestId("file-tree-rename-input"),
        ).toBeInTheDocument();
      });

      const input = screen.getByTestId("file-tree-rename-input");
      await userEvent.clear(input);
      await userEvent.type(input, "blurred.json");
      input.blur();

      await waitFor(() => {
        expect(mockInvoke).toHaveBeenCalledWith("file:rename", {
          oldPath: "/Users/test/project/package.json",
          newPath: "/Users/test/project/blurred.json",
        });
      });
    });

    it("名前が変更されていない場合はリネームを実行しない", async () => {
      const props = createDefaultProps();
      props.workspace = {
        ...mockWorkspace,
        folders: [{ ...mockFolderEntry, isExpanded: true }],
      };
      render(<WorkspaceSidebar {...props} />);

      const fileItem = screen.getByTestId("file-tree-item-file-3");
      await userEvent.dblClick(fileItem);

      await waitFor(() => {
        expect(
          screen.getByTestId("file-tree-rename-input"),
        ).toBeInTheDocument();
      });

      const _input = screen.getByTestId("file-tree-rename-input");
      await userEvent.keyboard("{enter}");

      expect(mockInvoke).not.toHaveBeenCalled();
    });

    it("無効なファイル名の場合エラーを表示する", async () => {
      const props = createDefaultProps();
      props.workspace = {
        ...mockWorkspace,
        folders: [{ ...mockFolderEntry, isExpanded: true }],
      };
      render(<WorkspaceSidebar {...props} />);

      const fileItem = screen.getByTestId("file-tree-item-file-3");
      await userEvent.dblClick(fileItem);

      await waitFor(() => {
        expect(
          screen.getByTestId("file-tree-rename-input"),
        ).toBeInTheDocument();
      });

      const input = screen.getByTestId("file-tree-rename-input");
      await userEvent.clear(input);
      await userEvent.type(input, "invalid/name.json{enter}");

      await waitFor(() => {
        expect(screen.getByText(/invalid.*filename/i)).toBeInTheDocument();
      });
    });

    it("リネーム失敗時にエラーを表示する", async () => {
      mockInvoke.mockResolvedValue({
        success: false,
        error: "File already exists",
      });

      const props = createDefaultProps();
      props.workspace = {
        ...mockWorkspace,
        folders: [{ ...mockFolderEntry, isExpanded: true }],
      };
      render(<WorkspaceSidebar {...props} />);

      const fileItem = screen.getByTestId("file-tree-item-file-3");
      await userEvent.dblClick(fileItem);

      await waitFor(() => {
        expect(
          screen.getByTestId("file-tree-rename-input"),
        ).toBeInTheDocument();
      });

      const input = screen.getByTestId("file-tree-rename-input");
      await userEvent.clear(input);
      await userEvent.type(input, "newname.json{enter}");

      await waitFor(() => {
        expect(screen.getByText(/file already exists/i)).toBeInTheDocument();
      });
    });

    it("フォルダをダブルクリックでリネームモードに入る", async () => {
      const props = createDefaultProps();
      props.workspace = {
        ...mockWorkspace,
        folders: [{ ...mockFolderEntry, isExpanded: true }],
      };
      render(<WorkspaceSidebar {...props} />);

      const folderItem = screen.getByTestId("file-tree-item-file-1");
      await userEvent.dblClick(folderItem);

      await waitFor(() => {
        const input = screen.getByTestId("file-tree-rename-input");
        expect(input).toBeInTheDocument();
        expect(input).toHaveValue("src");
      });
    });

    it("入力フィールドクリックは選択イベントを発火しない", async () => {
      const handleSelectFile = vi.fn();
      const props = createDefaultProps();
      props.workspace = {
        ...mockWorkspace,
        folders: [{ ...mockFolderEntry, isExpanded: true }],
      };
      props.onSelectFile = handleSelectFile;
      render(<WorkspaceSidebar {...props} />);

      const fileItem = screen.getByTestId("file-tree-item-file-3");
      await userEvent.dblClick(fileItem);

      await waitFor(() => {
        expect(
          screen.getByTestId("file-tree-rename-input"),
        ).toBeInTheDocument();
      });

      // Clear previous calls from double-click
      handleSelectFile.mockClear();

      // Click on the input field should not trigger selection (stopPropagation)
      const input = screen.getByTestId("file-tree-rename-input");
      await userEvent.click(input);

      expect(handleSelectFile).not.toHaveBeenCalled();
    });

    it("拡張子なしのファイル名でリネームする", async () => {
      const props = createDefaultProps();
      props.workspace = {
        ...mockWorkspace,
        folders: [{ ...mockFolderEntry, isExpanded: true }],
      };
      render(<WorkspaceSidebar {...props} />);

      const fileItem = screen.getByTestId("file-tree-item-file-3");
      await userEvent.dblClick(fileItem);

      await waitFor(() => {
        expect(
          screen.getByTestId("file-tree-rename-input"),
        ).toBeInTheDocument();
      });

      const input = screen.getByTestId("file-tree-rename-input");
      await userEvent.clear(input);
      await userEvent.type(input, "Makefile{enter}");

      await waitFor(() => {
        expect(mockInvoke).toHaveBeenCalledWith("file:rename", {
          oldPath: "/Users/test/project/package.json",
          newPath: "/Users/test/project/Makefile",
        });
      });
    });
  });
});
