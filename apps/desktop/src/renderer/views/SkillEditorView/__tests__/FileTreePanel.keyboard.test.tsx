/**
 * FileTreePanel キーボードナビゲーション テスト
 * UT-UI-05A-001: FileTree キーボードナビゲーション
 *
 * Phase 4 - TDD Red
 *
 * テスト方針:
 * - fireEvent のみ使用（userEvent 禁止 — P39 対策）
 * - ARIA 属性による状態検証（role="tree", role="treeitem", aria-expanded, aria-current）
 * - キーボードナビゲーション: ArrowUp/Down/Left/Right, Enter, Space, Escape, Home, End
 *
 * Red 理由: FileTreePanel に tabIndex, aria-current, キーボードハンドラが
 * 未実装のため、フォーカス管理・キーイベント処理が動作しない。
 *
 * @module SkillEditorView/__tests__/FileTreePanel.keyboard.test
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { FileTreePanel } from "../components/FileTreePanel/FileTreePanel";
import { sampleFileTree } from "./test-utils";

describe("FileTreePanel キーボードナビゲーション", () => {
  const defaultProps = {
    fileTree: sampleFileTree,
    selectedFile: "",
    unsavedFiles: new Set<string>(),
    onSelectFile: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("フォーカス管理", () => {
    it("Tab キーでツリーコンテナにフォーカスが移動する", () => {
      render(<FileTreePanel {...defaultProps} />);
      const tree = screen.getByRole("tree");
      expect(tree).toHaveAttribute("tabIndex", "0");
    });

    it("フォーカスリングが表示される", () => {
      render(<FileTreePanel {...defaultProps} />);
      const tree = screen.getByRole("tree");
      fireEvent.focus(tree);
      // Implementation should add focus:ring-2 class
      expect(tree.className).toMatch(/focus:ring-2|ring-2/);
    });

    it("Escape キーでフォーカスが解放される", () => {
      render(<FileTreePanel {...defaultProps} />);
      const tree = screen.getByRole("tree");
      fireEvent.focus(tree);
      fireEvent.keyDown(tree, { key: "Escape" });
      // Tree should blur
      expect(document.activeElement).not.toBe(tree);
    });
  });

  describe("矢印キーナビゲーション", () => {
    it("ArrowDown で次のノードにフォーカスが移動する", () => {
      render(<FileTreePanel {...defaultProps} />);
      const tree = screen.getByRole("tree");
      fireEvent.focus(tree);
      fireEvent.keyDown(tree, { key: "ArrowDown" });

      const treeItems = screen.getAllByRole("treeitem");
      // First visible item should be focused (aria-current or focus indicator)
      expect(treeItems[0]).toHaveAttribute("aria-current", "true");
    });

    it("ArrowUp で前のノードにフォーカスが移動する", () => {
      render(<FileTreePanel {...defaultProps} />);
      const tree = screen.getByRole("tree");
      fireEvent.focus(tree);
      // Move down twice, then up once
      fireEvent.keyDown(tree, { key: "ArrowDown" });
      fireEvent.keyDown(tree, { key: "ArrowDown" });
      fireEvent.keyDown(tree, { key: "ArrowUp" });

      const treeItems = screen.getAllByRole("treeitem");
      expect(treeItems[0]).toHaveAttribute("aria-current", "true");
    });

    it("Home キーで最初のノードに移動する", () => {
      render(<FileTreePanel {...defaultProps} />);
      const tree = screen.getByRole("tree");
      fireEvent.focus(tree);
      // Move down several times
      fireEvent.keyDown(tree, { key: "ArrowDown" });
      fireEvent.keyDown(tree, { key: "ArrowDown" });
      fireEvent.keyDown(tree, { key: "ArrowDown" });
      // Press Home
      fireEvent.keyDown(tree, { key: "Home" });

      const treeItems = screen.getAllByRole("treeitem");
      expect(treeItems[0]).toHaveAttribute("aria-current", "true");
    });

    it("End キーで最後のノードに移動する", () => {
      render(<FileTreePanel {...defaultProps} />);
      const tree = screen.getByRole("tree");
      fireEvent.focus(tree);
      fireEvent.keyDown(tree, { key: "End" });

      const treeItems = screen.getAllByRole("treeitem");
      const lastItem = treeItems[treeItems.length - 1];
      expect(lastItem).toHaveAttribute("aria-current", "true");
    });
  });

  describe("ディレクトリ展開/折りたたみ", () => {
    it("ArrowRight で閉じたディレクトリを展開する", () => {
      render(<FileTreePanel {...defaultProps} />);
      const tree = screen.getByRole("tree");
      fireEvent.focus(tree);
      // Navigate to agents directory (second item)
      fireEvent.keyDown(tree, { key: "ArrowDown" });
      fireEvent.keyDown(tree, { key: "ArrowDown" });
      // Expand
      fireEvent.keyDown(tree, { key: "ArrowRight" });

      const agentsItem = screen
        .getByText("agents")
        .closest("[role='treeitem']");
      expect(agentsItem).toHaveAttribute("aria-expanded", "true");
    });

    it("ArrowLeft で開いたディレクトリを折りたたむ", () => {
      render(<FileTreePanel {...defaultProps} />);
      const tree = screen.getByRole("tree");
      fireEvent.focus(tree);
      // Navigate to agents directory and expand
      fireEvent.keyDown(tree, { key: "ArrowDown" });
      fireEvent.keyDown(tree, { key: "ArrowDown" });
      fireEvent.keyDown(tree, { key: "ArrowRight" });
      // Collapse
      fireEvent.keyDown(tree, { key: "ArrowLeft" });

      const agentsItem = screen
        .getByText("agents")
        .closest("[role='treeitem']");
      expect(agentsItem).toHaveAttribute("aria-expanded", "false");
    });

    it("ArrowLeft で閉じたディレクトリの場合、親に移動する", () => {
      render(<FileTreePanel {...defaultProps} />);
      const tree = screen.getByRole("tree");
      fireEvent.focus(tree);
      // Navigate to agents directory
      fireEvent.keyDown(tree, { key: "ArrowDown" });
      fireEvent.keyDown(tree, { key: "ArrowDown" });
      // Expand agents
      fireEvent.keyDown(tree, { key: "ArrowRight" });
      // Move to first child
      fireEvent.keyDown(tree, { key: "ArrowDown" });
      // ArrowLeft should move to parent (agents)
      fireEvent.keyDown(tree, { key: "ArrowLeft" });

      const agentsItem = screen
        .getByText("agents")
        .closest("[role='treeitem']");
      expect(agentsItem).toHaveAttribute("aria-current", "true");
    });

    it("ArrowRight でファイルノードの場合、ファイルを選択する", () => {
      render(<FileTreePanel {...defaultProps} />);
      const tree = screen.getByRole("tree");
      fireEvent.focus(tree);
      // Navigate to first file (SKILL.md)
      fireEvent.keyDown(tree, { key: "ArrowDown" });
      // ArrowRight on file = select
      fireEvent.keyDown(tree, { key: "ArrowRight" });

      expect(defaultProps.onSelectFile).toHaveBeenCalledWith("SKILL.md");
    });
  });

  describe("選択操作", () => {
    it("Enter キーでファイルを選択する", () => {
      render(<FileTreePanel {...defaultProps} />);
      const tree = screen.getByRole("tree");
      fireEvent.focus(tree);
      fireEvent.keyDown(tree, { key: "ArrowDown" });
      fireEvent.keyDown(tree, { key: "Enter" });

      expect(defaultProps.onSelectFile).toHaveBeenCalledWith("SKILL.md");
    });

    it("Space キーでファイルを選択する", () => {
      render(<FileTreePanel {...defaultProps} />);
      const tree = screen.getByRole("tree");
      fireEvent.focus(tree);
      fireEvent.keyDown(tree, { key: "ArrowDown" });
      fireEvent.keyDown(tree, { key: " " });

      expect(defaultProps.onSelectFile).toHaveBeenCalledWith("SKILL.md");
    });
  });

  describe("ARIA 属性", () => {
    it("ツリーコンテナに role=tree が設定されている", () => {
      render(<FileTreePanel {...defaultProps} />);
      expect(screen.getByRole("tree")).toBeInTheDocument();
    });

    it("各ノードに正確な ARIA 属性が設定されている", () => {
      render(<FileTreePanel {...defaultProps} />);
      const treeItems = screen.getAllByRole("treeitem");

      // First item is a file (SKILL.md) - should have aria-selected
      expect(treeItems[0]).toHaveAttribute("aria-selected");

      // Second item is a directory (agents) - should have aria-expanded
      expect(treeItems[1]).toHaveAttribute("aria-expanded");
    });
  });
});
