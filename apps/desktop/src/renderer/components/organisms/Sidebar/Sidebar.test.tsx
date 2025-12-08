import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Sidebar } from "./index";
import type { FileNode } from "../../molecules/FileTreeItem";

describe("Sidebar", () => {
  const mockFileTree: FileNode[] = [
    {
      id: "folder-1",
      name: "src",
      type: "folder",
      children: [
        { id: "file-1", name: "index.ts", type: "file", path: "/src/index.ts" },
        { id: "file-2", name: "App.tsx", type: "file", path: "/src/App.tsx" },
      ],
    },
    { id: "file-3", name: "package.json", type: "file", path: "/package.json" },
  ];

  const defaultProps = {
    fileTree: mockFileTree,
    selectedFile: null,
    expandedFolders: new Set<string>(),
    onFileSelect: vi.fn(),
    onFolderToggle: vi.fn(),
  };

  describe("レンダリング", () => {
    it("サイドバーをレンダリングする", () => {
      render(<Sidebar {...defaultProps} />);
      expect(screen.getByRole("complementary")).toBeInTheDocument();
    });

    it("aria-labelを設定する", () => {
      render(<Sidebar {...defaultProps} />);
      expect(screen.getByRole("complementary")).toHaveAttribute(
        "aria-label",
        "File explorer",
      );
    });

    it("Filesヘッダーを表示する", () => {
      render(<Sidebar {...defaultProps} />);
      expect(screen.getByText("Files")).toBeInTheDocument();
    });

    it("ファイルツリーをレンダリングする", () => {
      render(<Sidebar {...defaultProps} />);
      expect(screen.getByRole("tree")).toBeInTheDocument();
    });
  });

  describe("ファイルツリー表示", () => {
    it("ルートレベルのアイテムを表示する", () => {
      render(<Sidebar {...defaultProps} />);
      expect(screen.getByText("src")).toBeInTheDocument();
      expect(screen.getByText("package.json")).toBeInTheDocument();
    });

    it("空のファイルツリーでメッセージを表示する", () => {
      render(<Sidebar {...defaultProps} fileTree={[]} />);
      expect(screen.getByText("No files found")).toBeInTheDocument();
    });

    it("展開されたフォルダの子要素を表示する", () => {
      render(
        <Sidebar {...defaultProps} expandedFolders={new Set(["folder-1"])} />,
      );
      expect(screen.getByText("index.ts")).toBeInTheDocument();
      expect(screen.getByText("App.tsx")).toBeInTheDocument();
    });

    it("閉じたフォルダの子要素を表示しない", () => {
      render(<Sidebar {...defaultProps} expandedFolders={new Set()} />);
      expect(screen.queryByText("index.ts")).not.toBeInTheDocument();
    });
  });

  describe("インタラクション", () => {
    it("ファイルクリック時にonFileSelectを呼び出す", () => {
      const handleFileSelect = vi.fn();
      render(
        <Sidebar
          {...defaultProps}
          onFileSelect={handleFileSelect}
          expandedFolders={new Set(["folder-1"])}
        />,
      );
      fireEvent.click(screen.getByText("index.ts"));
      expect(handleFileSelect).toHaveBeenCalledWith(
        expect.objectContaining({
          id: "file-1",
          name: "index.ts",
          type: "file",
        }),
      );
    });

    it("フォルダクリック時にonFolderToggleを呼び出す", () => {
      const handleFolderToggle = vi.fn();
      render(<Sidebar {...defaultProps} onFolderToggle={handleFolderToggle} />);
      fireEvent.click(screen.getByText("src"));
      expect(handleFolderToggle).toHaveBeenCalledWith("folder-1");
    });
  });

  describe("選択状態", () => {
    it("選択されたファイルをハイライトする", () => {
      const selectedFile = {
        id: "file-3",
        name: "package.json",
        type: "file" as const,
        path: "/package.json",
      };
      render(<Sidebar {...defaultProps} selectedFile={selectedFile} />);
      const item = screen
        .getByText("package.json")
        .closest('[role="treeitem"]');
      expect(item).toHaveAttribute("aria-selected", "true");
    });

    it("選択されていないファイルはハイライトしない", () => {
      render(<Sidebar {...defaultProps} selectedFile={null} />);
      const item = screen
        .getByText("package.json")
        .closest('[role="treeitem"]');
      expect(item).toHaveAttribute("aria-selected", "false");
    });
  });

  describe("ネストされたファイルツリー", () => {
    const deepFileTree: FileNode[] = [
      {
        id: "folder-1",
        name: "level1",
        type: "folder",
        children: [
          {
            id: "folder-2",
            name: "level2",
            type: "folder",
            children: [
              {
                id: "file-1",
                name: "deep.ts",
                type: "file",
                path: "/level1/level2/deep.ts",
              },
            ],
          },
        ],
      },
    ];

    it("ネストされたフォルダを展開できる", () => {
      render(
        <Sidebar
          {...defaultProps}
          fileTree={deepFileTree}
          expandedFolders={new Set(["folder-1", "folder-2"])}
        />,
      );
      expect(screen.getByText("level1")).toBeInTheDocument();
      expect(screen.getByText("level2")).toBeInTheDocument();
      expect(screen.getByText("deep.ts")).toBeInTheDocument();
    });
  });

  describe("アクセシビリティ", () => {
    it("展開されたフォルダの子要素にrole=groupを設定する", () => {
      render(
        <Sidebar {...defaultProps} expandedFolders={new Set(["folder-1"])} />,
      );
      expect(screen.getByRole("group")).toHaveAttribute(
        "aria-label",
        "src contents",
      );
    });
  });

  describe("className", () => {
    it("カスタムclassNameを追加する", () => {
      render(<Sidebar {...defaultProps} className="custom-class" />);
      expect(screen.getByRole("complementary")).toHaveClass("custom-class");
    });
  });

  describe("displayName", () => {
    it("displayNameが設定されている", () => {
      expect(Sidebar.displayName).toBe("Sidebar");
    });
  });
});
