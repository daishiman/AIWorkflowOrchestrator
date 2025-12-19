/**
 * SelectableFileTreeItem コンポーネントのテスト
 *
 * @see docs/30-workflows/file-selector-integration/step09-workspace-file-selector-design.md
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SelectableFileTreeItem } from "./SelectableFileTreeItem";
import type { FileNode } from "../../../store/types";
import type { FolderId } from "../../../store/types/workspace";

describe("SelectableFileTreeItem", () => {
  const user = userEvent.setup();

  const mockFileNode: FileNode = {
    id: "file1",
    name: "index.ts",
    type: "file",
    path: "/project/src/index.ts",
  };

  const mockFolderNode: FileNode = {
    id: "folder1",
    name: "src",
    type: "folder",
    path: "/project/src",
    children: [
      {
        id: "file1",
        name: "index.ts",
        type: "file",
        path: "/project/src/index.ts",
      },
    ],
  };

  const mockFolderId = "folder-123" as FolderId;

  const defaultProps = {
    node: mockFileNode,
    folderId: mockFolderId,
    expandedPaths: new Set<string>(),
    selectedPaths: new Set<string>(),
    selectionMode: "multiple" as const,
    onFileToggle: vi.fn(),
    onFolderToggle: vi.fn(),
    depth: 0,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("ファイルアイテム", () => {
    it("ファイル名が表示される", () => {
      render(<SelectableFileTreeItem {...defaultProps} />);

      expect(screen.getByText("index.ts")).toBeInTheDocument();
    });

    it("ファイルアイコンが表示される", () => {
      render(<SelectableFileTreeItem {...defaultProps} />);

      // ファイルアイコン（📄）または適切なアイコンが表示されることを確認
      expect(screen.getByLabelText(/ファイル/)).toBeInTheDocument();
    });

    it("複数選択モードでチェックボックスが表示される", () => {
      render(
        <SelectableFileTreeItem {...defaultProps} selectionMode="multiple" />,
      );

      expect(screen.getByRole("checkbox")).toBeInTheDocument();
    });

    it("単一選択モードでチェックボックスが表示されない", () => {
      render(
        <SelectableFileTreeItem {...defaultProps} selectionMode="single" />,
      );

      expect(screen.queryByRole("checkbox")).not.toBeInTheDocument();
    });

    it("チェックボックスのonChangeイベントでファイルを選択できる", async () => {
      const onFileToggle = vi.fn();
      render(
        <SelectableFileTreeItem
          {...defaultProps}
          onFileToggle={onFileToggle}
          selectionMode="multiple"
        />,
      );

      const checkbox = screen.getByRole("checkbox");
      await user.click(checkbox);

      expect(onFileToggle).toHaveBeenCalledWith(
        mockFileNode.path,
        mockFileNode,
      );
    });

    it("クリックで選択コールバックが呼ばれる", async () => {
      const onFileToggle = vi.fn();
      render(
        <SelectableFileTreeItem
          {...defaultProps}
          onFileToggle={onFileToggle}
        />,
      );

      await user.click(screen.getByText("index.ts"));

      expect(onFileToggle).toHaveBeenCalledWith(
        mockFileNode.path,
        mockFileNode,
      );
    });

    it("選択状態でハイライトされる", () => {
      render(
        <SelectableFileTreeItem
          {...defaultProps}
          selectedPaths={new Set([mockFileNode.path])}
        />,
      );

      const item = screen.getByRole("treeitem");
      expect(item).toHaveAttribute("aria-selected", "true");
      expect(item).toHaveClass(/selected|bg-blue/);
    });

    it("未選択状態ではハイライトされない", () => {
      render(<SelectableFileTreeItem {...defaultProps} />);

      const item = screen.getByRole("treeitem");
      expect(item).toHaveAttribute("aria-selected", "false");
    });
  });

  describe("フォルダアイテム", () => {
    it("フォルダ名が表示される", () => {
      render(
        <SelectableFileTreeItem {...defaultProps} node={mockFolderNode} />,
      );

      expect(screen.getByText("src")).toBeInTheDocument();
    });

    it("フォルダアイコンが表示される", () => {
      render(
        <SelectableFileTreeItem {...defaultProps} node={mockFolderNode} />,
      );

      expect(screen.getByLabelText(/フォルダ/)).toBeInTheDocument();
    });

    it("展開/折りたたみアイコンが表示される", () => {
      render(
        <SelectableFileTreeItem {...defaultProps} node={mockFolderNode} />,
      );

      // ▶ or ▼ or chevron アイコンが表示される
      expect(screen.getByLabelText(/展開|折りたたみ/)).toBeInTheDocument();
    });

    it("折りたたまれているとき子要素が表示されない", () => {
      render(
        <SelectableFileTreeItem
          {...defaultProps}
          node={mockFolderNode}
          expandedPaths={new Set()}
        />,
      );

      expect(screen.queryByText("index.ts")).not.toBeInTheDocument();
    });

    it("展開されているとき子要素が表示される", () => {
      render(
        <SelectableFileTreeItem
          {...defaultProps}
          node={mockFolderNode}
          expandedPaths={new Set([mockFolderNode.path])}
        />,
      );

      expect(screen.getByText("index.ts")).toBeInTheDocument();
    });

    it("フォルダクリックで展開/折りたたみコールバックが呼ばれる", async () => {
      const onFolderToggle = vi.fn();
      render(
        <SelectableFileTreeItem
          {...defaultProps}
          node={mockFolderNode}
          onFolderToggle={onFolderToggle}
        />,
      );

      await user.click(screen.getByText("src"));

      expect(onFolderToggle).toHaveBeenCalledWith(mockFolderNode.path);
    });

    it("fileOnly=trueのときフォルダは選択できない", async () => {
      const onFileToggle = vi.fn();
      render(
        <SelectableFileTreeItem
          {...defaultProps}
          node={mockFolderNode}
          fileOnly
          onFileToggle={onFileToggle}
        />,
      );

      await user.click(screen.getByText("src"));

      // フォルダクリックでは選択コールバックは呼ばれない
      expect(onFileToggle).not.toHaveBeenCalled();
    });
  });

  describe("キーボード操作", () => {
    it("Spaceキーでファイルを選択できる", () => {
      const onFileToggle = vi.fn();
      render(
        <SelectableFileTreeItem
          {...defaultProps}
          onFileToggle={onFileToggle}
        />,
      );

      const item = screen.getByRole("treeitem");
      fireEvent.keyDown(item, { key: " ", code: "Space" });

      expect(onFileToggle).toHaveBeenCalled();
    });

    it("Enterキーでファイルを選択できる", () => {
      const onFileToggle = vi.fn();
      render(
        <SelectableFileTreeItem
          {...defaultProps}
          onFileToggle={onFileToggle}
        />,
      );

      const item = screen.getByRole("treeitem");
      fireEvent.keyDown(item, { key: "Enter", code: "Enter" });

      expect(onFileToggle).toHaveBeenCalledWith(
        mockFileNode.path,
        mockFileNode,
      );
    });

    it("Enterキーでフォルダを展開/折りたたみできる", () => {
      const onFolderToggle = vi.fn();
      render(
        <SelectableFileTreeItem
          {...defaultProps}
          node={mockFolderNode}
          onFolderToggle={onFolderToggle}
        />,
      );

      const item = screen.getByRole("treeitem");
      fireEvent.keyDown(item, { key: "Enter", code: "Enter" });

      expect(onFolderToggle).toHaveBeenCalled();
    });

    it("ArrowRightでフォルダを展開できる", () => {
      const onFolderToggle = vi.fn();
      render(
        <SelectableFileTreeItem
          {...defaultProps}
          node={mockFolderNode}
          expandedPaths={new Set()}
          onFolderToggle={onFolderToggle}
        />,
      );

      const item = screen.getByRole("treeitem");
      fireEvent.keyDown(item, { key: "ArrowRight", code: "ArrowRight" });

      expect(onFolderToggle).toHaveBeenCalledWith(mockFolderNode.path);
    });

    it("ArrowLeftでフォルダを折りたたみできる", () => {
      const onFolderToggle = vi.fn();
      render(
        <SelectableFileTreeItem
          {...defaultProps}
          node={mockFolderNode}
          expandedPaths={new Set([mockFolderNode.path])}
          onFolderToggle={onFolderToggle}
        />,
      );

      // 複数のtreeitemがある場合、フォルダ（src）を含む最初のアイテムを取得
      const items = screen.getAllByRole("treeitem");
      const folderItem = items.find((item) =>
        item.textContent?.includes("src"),
      );
      if (folderItem) {
        fireEvent.keyDown(folderItem, { key: "ArrowLeft", code: "ArrowLeft" });
      }

      expect(onFolderToggle).toHaveBeenCalledWith(mockFolderNode.path);
    });
  });

  describe("アクセシビリティ", () => {
    it("role='treeitem'が設定されている", () => {
      render(<SelectableFileTreeItem {...defaultProps} />);

      expect(screen.getByRole("treeitem")).toBeInTheDocument();
    });

    it("aria-selectedが設定されている", () => {
      render(<SelectableFileTreeItem {...defaultProps} />);

      const item = screen.getByRole("treeitem");
      expect(item).toHaveAttribute("aria-selected", "false");
    });

    it("フォルダにaria-expandedが設定されている", () => {
      render(
        <SelectableFileTreeItem
          {...defaultProps}
          node={mockFolderNode}
          expandedPaths={new Set([mockFolderNode.path])}
        />,
      );

      // 複数のtreeitemがある場合、フォルダ（src）を含む最初のアイテムを取得
      const items = screen.getAllByRole("treeitem");
      const folderItem = items.find((item) =>
        item.textContent?.includes("src"),
      );
      expect(folderItem).toHaveAttribute("aria-expanded", "true");
    });

    it("チェックボックスにaria-labelが設定されている", () => {
      render(<SelectableFileTreeItem {...defaultProps} />);

      const checkbox = screen.getByRole("checkbox");
      expect(checkbox).toHaveAttribute(
        "aria-label",
        expect.stringContaining("index.ts"),
      );
    });
  });

  describe("インデント", () => {
    it("depth=0のときインデントなし", () => {
      render(<SelectableFileTreeItem {...defaultProps} depth={0} />);

      const item = screen.getByRole("treeitem");
      // padding-leftが0または最小値であることを確認
      expect(item).toHaveStyle({ paddingLeft: "0px" });
    });

    it("depth=2のときインデントがある", () => {
      render(<SelectableFileTreeItem {...defaultProps} depth={2} />);

      const item = screen.getByRole("treeitem");
      // padding-leftがdepthに応じた値であることを確認
      const style = window.getComputedStyle(item);
      expect(parseInt(style.paddingLeft)).toBeGreaterThan(0);
    });
  });

  describe("ホバー状態", () => {
    it("ホバー時にスタイルが変わる", async () => {
      render(<SelectableFileTreeItem {...defaultProps} />);

      const item = screen.getByRole("treeitem");

      await user.hover(item);

      // hover状態のスタイルが適用されることを確認
      expect(item).toHaveClass(/hover/);
    });
  });

  describe("フォルダチェックボックス（一括選択）", () => {
    const mockGetSelectionState = vi.fn();
    const mockOnFolderSelectionToggle = vi.fn();

    beforeEach(() => {
      mockGetSelectionState.mockReturnValue("unselected");
      mockOnFolderSelectionToggle.mockClear();
    });

    it("getSelectionStateとonFolderSelectionToggleがあるとき、フォルダにチェックボックスが表示される", () => {
      render(
        <SelectableFileTreeItem
          {...defaultProps}
          node={mockFolderNode}
          selectionMode="multiple"
          getSelectionState={mockGetSelectionState}
          onFolderSelectionToggle={mockOnFolderSelectionToggle}
        />,
      );

      const checkboxes = screen.getAllByRole("checkbox");
      expect(checkboxes.length).toBeGreaterThan(0);
    });

    it("getSelectionStateがないときフォルダにチェックボックスが表示されない", () => {
      render(
        <SelectableFileTreeItem
          {...defaultProps}
          node={mockFolderNode}
          selectionMode="multiple"
        />,
      );

      // チェックボックスが存在しないことを確認
      expect(screen.queryByRole("checkbox")).not.toBeInTheDocument();
    });

    it("selectionMode=singleのときフォルダチェックボックスが表示されない", () => {
      render(
        <SelectableFileTreeItem
          {...defaultProps}
          node={mockFolderNode}
          selectionMode="single"
          getSelectionState={mockGetSelectionState}
          onFolderSelectionToggle={mockOnFolderSelectionToggle}
        />,
      );

      expect(screen.queryByRole("checkbox")).not.toBeInTheDocument();
    });

    it("unselected状態のフォルダチェックボックスが正しく表示される", () => {
      mockGetSelectionState.mockReturnValue("unselected");

      render(
        <SelectableFileTreeItem
          {...defaultProps}
          node={mockFolderNode}
          selectionMode="multiple"
          getSelectionState={mockGetSelectionState}
          onFolderSelectionToggle={mockOnFolderSelectionToggle}
        />,
      );

      const checkbox = screen.getByRole("checkbox") as HTMLInputElement;
      expect(checkbox.checked).toBe(false);
      expect(checkbox.indeterminate).toBe(false);
      expect(checkbox).toHaveAttribute("aria-checked", "false");
    });

    it("indeterminate状態のフォルダチェックボックスが正しく表示される", () => {
      mockGetSelectionState.mockReturnValue("indeterminate");

      render(
        <SelectableFileTreeItem
          {...defaultProps}
          node={mockFolderNode}
          selectionMode="multiple"
          getSelectionState={mockGetSelectionState}
          onFolderSelectionToggle={mockOnFolderSelectionToggle}
        />,
      );

      const checkbox = screen.getByRole("checkbox") as HTMLInputElement;
      expect(checkbox.checked).toBe(false);
      expect(checkbox.indeterminate).toBe(true);
      expect(checkbox).toHaveAttribute("aria-checked", "mixed");
    });

    it("selected状態のフォルダチェックボックスが正しく表示される", () => {
      mockGetSelectionState.mockReturnValue("selected");

      render(
        <SelectableFileTreeItem
          {...defaultProps}
          node={mockFolderNode}
          selectionMode="multiple"
          getSelectionState={mockGetSelectionState}
          onFolderSelectionToggle={mockOnFolderSelectionToggle}
        />,
      );

      const checkbox = screen.getByRole("checkbox") as HTMLInputElement;
      expect(checkbox.checked).toBe(true);
      expect(checkbox.indeterminate).toBe(false);
      expect(checkbox).toHaveAttribute("aria-checked", "true");
    });

    it("フォルダチェックボックスをクリックするとonFolderSelectionToggleが呼ばれる", async () => {
      mockGetSelectionState.mockReturnValue("unselected");

      render(
        <SelectableFileTreeItem
          {...defaultProps}
          node={mockFolderNode}
          selectionMode="multiple"
          getSelectionState={mockGetSelectionState}
          onFolderSelectionToggle={mockOnFolderSelectionToggle}
        />,
      );

      const checkbox = screen.getByRole("checkbox");
      await user.click(checkbox);

      expect(mockOnFolderSelectionToggle).toHaveBeenCalledWith(
        mockFolderNode.path,
        mockFolderNode,
      );
    });

    it("フォルダチェックボックスにaria-labelが設定されている", () => {
      mockGetSelectionState.mockReturnValue("unselected");

      render(
        <SelectableFileTreeItem
          {...defaultProps}
          node={mockFolderNode}
          selectionMode="multiple"
          getSelectionState={mockGetSelectionState}
          onFolderSelectionToggle={mockOnFolderSelectionToggle}
        />,
      );

      const checkbox = screen.getByRole("checkbox");
      expect(checkbox).toHaveAttribute(
        "aria-label",
        `${mockFolderNode.name} フォルダを選択`,
      );
    });

    it("Spaceキーでフォルダ一括選択が呼ばれる", () => {
      mockGetSelectionState.mockReturnValue("unselected");

      render(
        <SelectableFileTreeItem
          {...defaultProps}
          node={mockFolderNode}
          selectionMode="multiple"
          getSelectionState={mockGetSelectionState}
          onFolderSelectionToggle={mockOnFolderSelectionToggle}
        />,
      );

      const item = screen.getByRole("treeitem");
      fireEvent.keyDown(item, { key: " ", code: "Space" });

      expect(mockOnFolderSelectionToggle).toHaveBeenCalledWith(
        mockFolderNode.path,
        mockFolderNode,
      );
    });

    it("ChevronアイコンをクリックするとonFolderToggleが呼ばれる", async () => {
      const onFolderToggle = vi.fn();
      mockGetSelectionState.mockReturnValue("unselected");

      render(
        <SelectableFileTreeItem
          {...defaultProps}
          node={mockFolderNode}
          selectionMode="multiple"
          onFolderToggle={onFolderToggle}
          getSelectionState={mockGetSelectionState}
          onFolderSelectionToggle={mockOnFolderSelectionToggle}
        />,
      );

      const chevron = screen.getByLabelText(/展開/);
      await user.click(chevron);

      expect(onFolderToggle).toHaveBeenCalledWith(mockFolderNode.path);
      // フォルダ選択コールバックは呼ばれない（Chevronのクリックは展開のみ）
      expect(mockOnFolderSelectionToggle).not.toHaveBeenCalled();
    });
  });
});
