import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { FileTreeNode } from "../components/FileTreePanel/FileTreeNode";
import { createFileNode, createDirectoryNode } from "./helpers/test-factories";

describe("FileTreeNode", () => {
  const mockOnSelect = vi.fn();
  const _mockOnToggleExpand = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  // FTN-01
  it("ファイルノードのファイル名を表示する", () => {
    const node = createFileNode({ name: "SKILL.md", path: "SKILL.md" });
    render(
      <FileTreeNode
        node={node}
        depth={0}
        isSelected={false}
        onSelect={mockOnSelect}
      />,
    );
    expect(screen.getByText("SKILL.md")).toBeInTheDocument();
  });

  // FTN-02
  it("ファイルノードにファイルアイコンを表示する", () => {
    const node = createFileNode({ name: "test.md", path: "test.md" });
    render(
      <FileTreeNode
        node={node}
        depth={0}
        isSelected={false}
        onSelect={mockOnSelect}
      />,
    );
    expect(screen.getByTestId("file-icon")).toBeInTheDocument();
  });

  // FTN-03
  it("ディレクトリノードにフォルダアイコンを表示する", () => {
    const node = createDirectoryNode({ name: "agents", path: "agents/" });
    render(
      <FileTreeNode
        node={node}
        depth={0}
        isSelected={false}
        onSelect={mockOnSelect}
      />,
    );
    expect(screen.getByTestId("folder-icon")).toBeInTheDocument();
  });

  // FTN-04
  it("ノードクリック時に onSelect コールバックを呼び出す", () => {
    const node = createFileNode({
      name: "SKILL.md",
      path: "SKILL.md",
    });
    render(
      <FileTreeNode
        node={node}
        depth={0}
        isSelected={false}
        onSelect={mockOnSelect}
      />,
    );
    fireEvent.click(screen.getByRole("treeitem"));
    expect(mockOnSelect).toHaveBeenCalledTimes(1);
    expect(mockOnSelect).toHaveBeenCalledWith("SKILL.md");
  });

  // FTN-05
  it("選択状態のノードにハイライトクラスを適用する", () => {
    const node = createFileNode({ name: "SKILL.md", path: "SKILL.md" });
    render(
      <FileTreeNode
        node={node}
        depth={0}
        isSelected={true}
        onSelect={mockOnSelect}
      />,
    );
    const treeItem = screen.getByRole("treeitem");
    expect(treeItem.className).toContain("bg-[var(--status-primary)]");
    expect(treeItem.className).toContain("bg-opacity-10");
  });

  // FTN-06
  it("ファイルノードに role='treeitem' を付与する", () => {
    const node = createFileNode({ name: "test.md", path: "test.md" });
    render(
      <FileTreeNode
        node={node}
        depth={0}
        isSelected={false}
        onSelect={mockOnSelect}
      />,
    );
    expect(screen.getByRole("treeitem")).toBeInTheDocument();
  });

  // FTN-07
  it("ネストレベルに応じたインデントを適用する", () => {
    const node = createFileNode({
      name: "deep.md",
      path: "agents/sub/deep.md",
    });
    render(
      <FileTreeNode
        node={node}
        depth={2}
        isSelected={false}
        onSelect={mockOnSelect}
      />,
    );
    const treeItem = screen.getByRole("treeitem");
    expect(treeItem.style.paddingLeft).toBe("32px");
  });
});
