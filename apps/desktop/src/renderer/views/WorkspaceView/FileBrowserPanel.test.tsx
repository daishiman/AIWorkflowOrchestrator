import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type {
  FolderId,
  FolderPath,
  Workspace,
} from "@/renderer/store/types/workspace";
import { FileBrowserPanel } from "./FileBrowserPanel";

const emptyWorkspace: Workspace = {
  id: "workspace",
  folders: [],
  lastSelectedFileId: null,
  createdAt: new Date("2026-03-10T00:00:00.000Z"),
  updatedAt: new Date("2026-03-10T00:00:00.000Z"),
};

const populatedWorkspace: Workspace = {
  ...emptyWorkspace,
  folders: [
    {
      id: "folder-1" as FolderId,
      path: "/workspace" as FolderPath,
      displayName: "workspace",
      isExpanded: true,
      expandedPaths: new Set<string>(),
      addedAt: new Date("2026-03-10T00:00:00.000Z"),
    },
  ],
};

describe("FileBrowserPanel", () => {
  it("workspace が空のとき zero state を表示する", () => {
    const onAddFolder = vi.fn().mockResolvedValue(undefined);

    render(
      <FileBrowserPanel
        workspace={emptyWorkspace}
        folderFileTrees={new Map()}
        selectedFilePath={null}
        workspaceError={null}
        workspaceIsLoading={false}
        expandedFolders={new Set()}
        onToggleFolder={vi.fn()}
        onAddFolder={onAddFolder}
        onSelectFile={vi.fn()}
        contextMenu={null}
        onCloseContextMenu={vi.fn()}
        onAttachSelectedFile={vi.fn()}
        onOpenPreviewFromContextMenu={vi.fn()}
        onOpenContextMenu={vi.fn()}
      />,
    );

    expect(screen.getByTestId("workspace-zero-state")).toBeInTheDocument();
    fireEvent.click(screen.getByTestId("workspace-add-folder"));
    expect(onAddFolder).toHaveBeenCalledTimes(1);
  });

  it("folders があると tree を表示する", () => {
    render(
      <FileBrowserPanel
        workspace={populatedWorkspace}
        folderFileTrees={
          new Map([
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
          ])
        }
        selectedFilePath="/workspace/app.ts"
        workspaceError={null}
        workspaceIsLoading={false}
        expandedFolders={new Set()}
        onToggleFolder={vi.fn()}
        onAddFolder={vi.fn().mockResolvedValue(undefined)}
        onSelectFile={vi.fn()}
        contextMenu={null}
        onCloseContextMenu={vi.fn()}
        onAttachSelectedFile={vi.fn()}
        onOpenPreviewFromContextMenu={vi.fn()}
        onOpenContextMenu={vi.fn()}
      />,
    );

    expect(
      screen.getByRole("tree", { name: "ワークスペースファイル一覧" }),
    ).toBeInTheDocument();
    expect(screen.getByTestId("workspace-treeitem-file-1")).toHaveAttribute(
      "aria-selected",
      "true",
    );
  });

  it("error / loading / context menu action を表示する", () => {
    const onCloseContextMenu = vi.fn();
    const onAttachSelectedFile = vi.fn();
    const onOpenPreviewFromContextMenu = vi.fn();

    render(
      <FileBrowserPanel
        workspace={populatedWorkspace}
        folderFileTrees={new Map()}
        selectedFilePath={null}
        workspaceError="EACCES"
        workspaceIsLoading={true}
        expandedFolders={new Set()}
        onToggleFolder={vi.fn()}
        onAddFolder={vi.fn().mockResolvedValue(undefined)}
        onSelectFile={vi.fn()}
        contextMenu={{ x: 8, y: 16, filePath: "/workspace/app.ts" }}
        onCloseContextMenu={onCloseContextMenu}
        onAttachSelectedFile={onAttachSelectedFile}
        onOpenPreviewFromContextMenu={onOpenPreviewFromContextMenu}
        onOpenContextMenu={vi.fn()}
      />,
    );

    expect(screen.getByRole("alert")).toHaveTextContent("EACCES");
    expect(screen.getByText("読み込み中...")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("menuitem", { name: "背景情報に追加" }));
    fireEvent.click(screen.getByRole("menuitem", { name: "プレビューを開く" }));

    expect(onAttachSelectedFile).toHaveBeenCalledWith("/workspace/app.ts");
    expect(onOpenPreviewFromContextMenu).toHaveBeenCalledWith(
      "/workspace/app.ts",
    );
    expect(onCloseContextMenu).toHaveBeenCalled();
  });
});
