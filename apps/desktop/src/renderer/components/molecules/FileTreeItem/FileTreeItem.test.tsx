import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { FileTreeItem, type FileNode } from "./index";

describe("FileTreeItem", () => {
  const mockFile: FileNode = {
    id: "file-1",
    name: "index.ts",
    type: "file",
    path: "/src/index.ts",
  };

  const mockFolder: FileNode = {
    id: "folder-1",
    name: "components",
    type: "folder",
    children: [],
  };

  const defaultFileProps = {
    node: mockFile,
    level: 0,
    selected: false,
    onClick: vi.fn(),
  };

  const defaultFolderProps = {
    node: mockFolder,
    level: 0,
    selected: false,
    onClick: vi.fn(),
    onToggle: vi.fn(),
  };

  describe("レンダリング", () => {
    it("ファイルアイテムをレンダリングする", () => {
      render(<FileTreeItem {...defaultFileProps} />);
      expect(screen.getByRole("treeitem")).toBeInTheDocument();
    });

    it("ファイル名を表示する", () => {
      render(<FileTreeItem {...defaultFileProps} />);
      expect(screen.getByText("index.ts")).toBeInTheDocument();
    });

    it("フォルダ名を表示する", () => {
      render(<FileTreeItem {...defaultFolderProps} />);
      expect(screen.getByText("components")).toBeInTheDocument();
    });
  });

  describe("アイコン", () => {
    it("ファイルにfile-textアイコンを表示する", () => {
      const { container } = render(<FileTreeItem {...defaultFileProps} />);
      const icon = container.querySelector("svg");
      expect(icon).toBeInTheDocument();
      expect(icon).toHaveClass("text-gray-400");
    });

    it("閉じたフォルダにfolderアイコンを表示する", () => {
      const { container } = render(
        <FileTreeItem {...defaultFolderProps} expanded={false} />,
      );
      const icon = container.querySelector("svg");
      expect(icon).toBeInTheDocument();
      expect(icon).toHaveClass("text-blue-400");
    });

    it("開いたフォルダにfolder-openアイコンを表示する", () => {
      const { container } = render(
        <FileTreeItem {...defaultFolderProps} expanded={true} />,
      );
      const icon = container.querySelector("svg");
      expect(icon).toBeInTheDocument();
      expect(icon).toHaveClass("text-blue-400");
    });
  });

  describe("インタラクション", () => {
    it("クリック時にonClickを呼び出す", () => {
      const handleClick = vi.fn();
      render(<FileTreeItem {...defaultFileProps} onClick={handleClick} />);
      fireEvent.click(screen.getByRole("treeitem"));
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it("フォルダクリック時にonToggleとonClickの両方を呼び出す", () => {
      const handleClick = vi.fn();
      const handleToggle = vi.fn();
      render(
        <FileTreeItem
          {...defaultFolderProps}
          onClick={handleClick}
          onToggle={handleToggle}
        />,
      );
      fireEvent.click(screen.getByRole("treeitem"));
      expect(handleToggle).toHaveBeenCalledTimes(1);
      expect(handleClick).toHaveBeenCalledTimes(1);
    });
  });

  describe("インデント", () => {
    it("level 0でベースパディングを適用する", () => {
      render(<FileTreeItem {...defaultFileProps} level={0} />);
      const item = screen.getByRole("treeitem");
      expect(item).toHaveStyle({ paddingLeft: "12px" });
    });

    it("level 1で追加パディングを適用する", () => {
      render(<FileTreeItem {...defaultFileProps} level={1} />);
      const item = screen.getByRole("treeitem");
      expect(item).toHaveStyle({ paddingLeft: "28px" }); // 12 + 16
    });

    it("level 2でさらに追加パディングを適用する", () => {
      render(<FileTreeItem {...defaultFileProps} level={2} />);
      const item = screen.getByRole("treeitem");
      expect(item).toHaveStyle({ paddingLeft: "44px" }); // 12 + 32
    });
  });

  describe("選択状態", () => {
    it("selected=trueでaria-selected=trueを設定する", () => {
      render(<FileTreeItem {...defaultFileProps} selected={true} />);
      expect(screen.getByRole("treeitem")).toHaveAttribute(
        "aria-selected",
        "true",
      );
    });

    it("selected=falseでaria-selected=falseを設定する", () => {
      render(<FileTreeItem {...defaultFileProps} selected={false} />);
      expect(screen.getByRole("treeitem")).toHaveAttribute(
        "aria-selected",
        "false",
      );
    });

    it("selected=trueで選択スタイルを適用する", () => {
      render(<FileTreeItem {...defaultFileProps} selected={true} />);
      expect(screen.getByRole("treeitem")).toHaveClass("bg-white/10");
    });
  });

  describe("展開状態（フォルダ）", () => {
    it("expanded=trueでaria-expanded=trueを設定する", () => {
      render(<FileTreeItem {...defaultFolderProps} expanded={true} />);
      expect(screen.getByRole("treeitem")).toHaveAttribute(
        "aria-expanded",
        "true",
      );
    });

    it("expanded=falseでaria-expanded=falseを設定する", () => {
      render(<FileTreeItem {...defaultFolderProps} expanded={false} />);
      expect(screen.getByRole("treeitem")).toHaveAttribute(
        "aria-expanded",
        "false",
      );
    });

    it("ファイルにはaria-expandedを設定しない", () => {
      render(<FileTreeItem {...defaultFileProps} />);
      expect(screen.getByRole("treeitem")).not.toHaveAttribute("aria-expanded");
    });
  });

  describe("未保存の変更", () => {
    it("hasUnsavedChanges=trueでインジケーターを表示する", () => {
      render(<FileTreeItem {...defaultFileProps} hasUnsavedChanges={true} />);
      expect(screen.getByLabelText("Unsaved changes")).toBeInTheDocument();
    });

    it("hasUnsavedChanges=falseでインジケーターを表示しない", () => {
      render(<FileTreeItem {...defaultFileProps} hasUnsavedChanges={false} />);
      expect(
        screen.queryByLabelText("Unsaved changes"),
      ).not.toBeInTheDocument();
    });

    it("デフォルトでインジケーターを表示しない", () => {
      render(<FileTreeItem {...defaultFileProps} />);
      expect(
        screen.queryByLabelText("Unsaved changes"),
      ).not.toBeInTheDocument();
    });
  });

  describe("displayName", () => {
    it("displayNameが設定されている", () => {
      expect(FileTreeItem.displayName).toBe("FileTreeItem");
    });
  });
});
