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

vi.mock("../../store", () => ({
  useAppStore: vi.fn((selector: (state: unknown) => unknown) =>
    selector(createMockState()),
  ),
  useWorkspace: vi.fn(() => mockWorkspace),
  useWorkspaceLoading: vi.fn(() => false),
  useWorkspaceError: vi.fn(() => null),
}));

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
});
