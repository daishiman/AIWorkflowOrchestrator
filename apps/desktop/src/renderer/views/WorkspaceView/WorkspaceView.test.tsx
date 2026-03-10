import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { FolderId, FolderPath } from "@/renderer/store/types/workspace";
import { resetWorkspaceLayoutStorage } from "./hooks/useWorkspaceLayout";
import { WorkspaceView } from "./index";

const mockLoadWorkspace = vi.fn();
const mockAddFolder = vi.fn().mockResolvedValue(undefined);
const mockSetWorkspaceSelectedFile = vi.fn();
const mockAddFiles = vi.fn();

const mockStore = {
  workspace: {
    id: "default",
    folders: [
      {
        id: "folder-1" as FolderId,
        path: "/workspace" as FolderPath,
        displayName: "workspace",
        isExpanded: true,
        expandedPaths: new Set<string>(),
        addedAt: new Date(),
      },
    ],
    lastSelectedFileId: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  folderFileTrees: new Map([
    [
      "folder-1" as FolderId,
      [
        {
          id: "file-1",
          name: "app.ts",
          type: "file",
          path: "/workspace/app.ts",
        },
      ],
    ],
  ]),
  workspaceLoading: false,
  workspaceError: null,
};

vi.mock("@/renderer/store", () => ({
  useWorkspace: () => mockStore.workspace,
  useFolderFileTrees: () => mockStore.folderFileTrees,
  useWorkspaceLoading: () => mockStore.workspaceLoading,
  useWorkspaceError: () => mockStore.workspaceError,
  useLoadWorkspace: () => mockLoadWorkspace,
  useAddFolder: () => mockAddFolder,
  useSetWorkspaceSelectedFile: () => mockSetWorkspaceSelectedFile,
  useAddFiles: () => mockAddFiles,
}));

function setViewportWidth(width: number): void {
  Object.defineProperty(window, "innerWidth", {
    configurable: true,
    writable: true,
    value: width,
  });
  window.dispatchEvent(new Event("resize"));
}

describe("WorkspaceView", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    resetWorkspaceLayoutStorage();
    setViewportWidth(1280);
    window.electronAPI = {
      ...(window.electronAPI ?? {}),
      file: {
        ...(window.electronAPI?.file ?? {}),
        read: vi.fn().mockResolvedValue({
          success: true,
          data: {
            content: "const app = true;",
            metadata: {
              size: 16,
              lastModified: new Date("2026-03-10T00:00:00.000Z"),
              encoding: "utf-8",
            },
          },
        }),
        watchStart: vi
          .fn()
          .mockResolvedValue({ success: true, watchId: "watch-1" }),
        watchStop: vi.fn().mockResolvedValue({ success: true }),
        onChanged: vi.fn().mockReturnValue(() => {}),
      },
    } as typeof window.electronAPI;
  });

  it("初期表示は chat-only", () => {
    render(<WorkspaceView />);

    expect(screen.getByTestId("workspace-view")).toBeInTheDocument();
    expect(
      screen.queryByTestId("workspace-file-panel"),
    ).not.toBeInTheDocument();
    expect(screen.getByTestId("workspace-status-layout")).toHaveTextContent(
      "chat-only",
    );
  });

  it("file toggle で file panel を表示する", () => {
    render(<WorkspaceView />);

    fireEvent.click(screen.getByTestId("workspace-toggle-file"));

    expect(screen.getByTestId("workspace-file-panel")).toBeInTheDocument();
    expect(screen.getByTestId("workspace-status-layout")).toHaveTextContent(
      "chat+files",
    );
  });

  it("mobile では overlay で panel を開く", async () => {
    setViewportWidth(800);
    render(<WorkspaceView />);

    fireEvent.click(screen.getByTestId("workspace-toggle-file"));

    expect(
      await screen.findByRole("dialog", { name: "ファイル" }),
    ).toBeInTheDocument();
  });

  it("file click で status bar と read を更新する", async () => {
    render(<WorkspaceView />);

    fireEvent.click(screen.getByTestId("workspace-toggle-file"));
    fireEvent.click(screen.getByTestId("workspace-treeitem-file-1"));

    await waitFor(() => {
      expect(mockSetWorkspaceSelectedFile).toHaveBeenCalled();
    });
    expect(screen.getByRole("status")).toHaveTextContent("/workspace/app.ts");
  });

  it("選択ファイルを背景情報へ追加できる", async () => {
    render(<WorkspaceView />);

    fireEvent.click(screen.getByTestId("workspace-toggle-file"));
    fireEvent.click(screen.getByTestId("workspace-treeitem-file-1"));

    await screen.findByTestId("workspace-attach-selected-file");
    fireEvent.click(screen.getByTestId("workspace-attach-selected-file"));

    expect(mockAddFiles).toHaveBeenCalledWith([
      expect.objectContaining({
        path: "/workspace/app.ts",
        name: "app.ts",
        extension: ".ts",
        size: 16,
        mimeType: "text/typescript",
      }),
    ]);
  });

  it("context menu から preview を開ける", async () => {
    setViewportWidth(1600);
    render(<WorkspaceView />);

    fireEvent.click(screen.getByTestId("workspace-toggle-file"));
    fireEvent.contextMenu(screen.getByTestId("workspace-treeitem-file-1"), {
      clientX: 10,
      clientY: 12,
    });
    fireEvent.click(screen.getByRole("menuitem", { name: "プレビューを開く" }));

    expect(
      await screen.findByTestId("workspace-preview-panel"),
    ).toBeInTheDocument();
  });

  it("file read 失敗時は status bar に error を表示する", async () => {
    window.electronAPI.file.read = vi.fn().mockResolvedValue({
      success: false,
      error: "Permission denied",
    });

    render(<WorkspaceView />);

    fireEvent.click(screen.getByTestId("workspace-toggle-file"));
    fireEvent.click(screen.getByTestId("workspace-treeitem-file-1"));

    await waitFor(() => {
      expect(screen.getByRole("status")).toHaveTextContent("Permission denied");
    });
  });
});
