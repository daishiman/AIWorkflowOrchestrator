import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { FileTreeNode } from "./FileTreeNode";

describe("FileTreeNode", () => {
  it("folder の keyboard 操作で展開し、ArrowDown で次要素へ移動する", () => {
    const onToggleFolder = vi.fn();

    render(
      <ul role="tree" aria-label="workspace tree">
        <FileTreeNode
          node={{
            id: "folder-1",
            name: "src",
            type: "folder",
            path: "/workspace/src",
            children: [
              {
                id: "file-1",
                name: "app.ts",
                type: "file",
                path: "/workspace/src/app.ts",
              },
            ],
          }}
          selectedFilePath={null}
          onSelectFile={vi.fn()}
          onOpenContextMenu={vi.fn()}
          expandedFolders={new Set()}
          onToggleFolder={onToggleFolder}
        />
        <FileTreeNode
          node={{
            id: "file-2",
            name: "README.md",
            type: "file",
            path: "/workspace/README.md",
          }}
          selectedFilePath={null}
          onSelectFile={vi.fn()}
          onOpenContextMenu={vi.fn()}
          expandedFolders={new Set()}
          onToggleFolder={vi.fn()}
        />
      </ul>,
    );

    const folder = screen.getByTestId("workspace-treeitem-folder-1");
    const sibling = screen.getByTestId("workspace-treeitem-file-2");

    folder.focus();
    fireEvent.keyDown(folder, { key: "ArrowRight" });
    expect(onToggleFolder).toHaveBeenCalledWith("/workspace/src");

    fireEvent.keyDown(folder, { key: "ArrowDown" });
    expect(document.activeElement).toBe(sibling);
  });

  it("file の Enter / contextmenu で選択とメニューを開く", () => {
    const onSelectFile = vi.fn();
    const onOpenContextMenu = vi.fn();

    render(
      <ul role="tree" aria-label="workspace tree">
        <FileTreeNode
          node={{
            id: "file-1",
            name: "app.ts",
            type: "file",
            path: "/workspace/app.ts",
          }}
          selectedFilePath="/workspace/app.ts"
          onSelectFile={onSelectFile}
          onOpenContextMenu={onOpenContextMenu}
          expandedFolders={new Set()}
          onToggleFolder={vi.fn()}
        />
      </ul>,
    );

    const file = screen.getByTestId("workspace-treeitem-file-1");
    fireEvent.keyDown(file, { key: "Enter" });
    fireEvent.contextMenu(file, { clientX: 12, clientY: 24 });

    expect(onSelectFile).toHaveBeenCalledWith("/workspace/app.ts");
    expect(onOpenContextMenu).toHaveBeenCalledWith(12, 24, "/workspace/app.ts");
    expect(file).toHaveAttribute("aria-selected", "true");
  });

  it("expanded folder は children を描画し、ArrowLeft と Space に反応する", () => {
    const onToggleFolder = vi.fn();

    render(
      <ul role="tree" aria-label="workspace tree">
        <FileTreeNode
          node={{
            id: "folder-1",
            name: "src",
            type: "folder",
            path: "/workspace/src",
            children: [
              {
                id: "file-1",
                name: "app.ts",
                type: "file",
                path: "/workspace/src/app.ts",
              },
            ],
          }}
          selectedFilePath={null}
          onSelectFile={vi.fn()}
          onOpenContextMenu={vi.fn()}
          expandedFolders={new Set(["/workspace/src"])}
          onToggleFolder={onToggleFolder}
        />
      </ul>,
    );

    const folder = screen.getByTestId("workspace-treeitem-folder-1");
    expect(screen.getByRole("group")).toBeInTheDocument();

    fireEvent.keyDown(folder, { key: "ArrowLeft" });
    fireEvent.keyDown(folder, { key: " " });

    expect(onToggleFolder).toHaveBeenCalledTimes(2);
  });
});
