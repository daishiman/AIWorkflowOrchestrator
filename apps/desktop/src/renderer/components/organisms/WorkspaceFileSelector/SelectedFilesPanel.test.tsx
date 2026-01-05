/**
 * SelectedFilesPanel コンポーネントのテスト
 *
 * @see docs/30-workflows/file-selector-integration/step09-workspace-file-selector-design.md
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SelectedFilesPanel } from "./SelectedFilesPanel";
import type { WorkspaceSelectedFile } from "./types";

describe("SelectedFilesPanel", () => {
  const user = userEvent.setup();

  const mockSelectedFiles: WorkspaceSelectedFile[] = [
    {
      id: "/project/src/index.ts",
      name: "index.ts",
      path: "/project/src/index.ts",
      folderId: "folder-1",
    },
    {
      id: "/project/src/utils.ts",
      name: "utils.ts",
      path: "/project/src/utils.ts",
      folderId: "folder-1",
    },
  ];

  const defaultProps = {
    selectedFiles: mockSelectedFiles,
    onRemove: vi.fn(),
    onClearAll: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("レンダリング", () => {
    it("選択されたファイルのリストが表示される", () => {
      render(<SelectedFilesPanel {...defaultProps} />);

      expect(screen.getByText("index.ts")).toBeInTheDocument();
      expect(screen.getByText("utils.ts")).toBeInTheDocument();
    });

    it("選択数が表示される", () => {
      render(<SelectedFilesPanel {...defaultProps} />);

      expect(screen.getByText(/2件.*選択/)).toBeInTheDocument();
    });

    it("空の場合はプレースホルダーが表示される", () => {
      render(<SelectedFilesPanel {...defaultProps} selectedFiles={[]} />);

      // 空状態のプレースホルダーテキストが表示される
      const placeholders = screen.getAllByText(/ファイルを選択/);
      expect(placeholders.length).toBeGreaterThan(0);
    });

    it("「すべてクリア」ボタンが表示される", () => {
      render(<SelectedFilesPanel {...defaultProps} />);

      expect(screen.getByText(/すべてクリア/)).toBeInTheDocument();
    });

    it("空の場合は「すべてクリア」ボタンが非表示", () => {
      render(<SelectedFilesPanel {...defaultProps} selectedFiles={[]} />);

      expect(screen.queryByText(/すべてクリア/)).not.toBeInTheDocument();
    });
  });

  describe("削除操作", () => {
    it("削除ボタンをクリックするとonRemoveが呼ばれる", async () => {
      const onRemove = vi.fn();
      render(<SelectedFilesPanel {...defaultProps} onRemove={onRemove} />);

      const removeButton = screen.getByTestId("remove-file-index.ts");
      await user.click(removeButton);

      expect(onRemove).toHaveBeenCalledWith("/project/src/index.ts");
    });

    it("「すべてクリア」をクリックするとonClearAllが呼ばれる", async () => {
      const onClearAll = vi.fn();
      render(<SelectedFilesPanel {...defaultProps} onClearAll={onClearAll} />);

      await user.click(screen.getByText(/すべてクリア/));

      expect(onClearAll).toHaveBeenCalled();
    });
  });

  describe("アクセシビリティ", () => {
    it("region roleが設定されている", () => {
      render(<SelectedFilesPanel {...defaultProps} />);

      expect(screen.getByRole("region")).toBeInTheDocument();
    });

    it("aria-labelが設定されている", () => {
      render(<SelectedFilesPanel {...defaultProps} />);

      const region = screen.getByRole("region");
      expect(region).toHaveAttribute(
        "aria-label",
        expect.stringContaining("選択"),
      );
    });

    it("リストがlist roleを持つ", () => {
      render(<SelectedFilesPanel {...defaultProps} />);

      expect(screen.getByRole("list")).toBeInTheDocument();
    });

    it("削除ボタンにaria-labelが設定されている", () => {
      render(<SelectedFilesPanel {...defaultProps} />);

      const removeButton = screen.getByTestId("remove-file-index.ts");
      expect(removeButton).toHaveAttribute(
        "aria-label",
        expect.stringContaining("削除"),
      );
    });
  });

  describe("スタイリング", () => {
    it("ファイルアイテムにホバースタイルがある", () => {
      render(<SelectedFilesPanel {...defaultProps} />);

      const items = screen.getAllByRole("listitem");
      items.forEach((item) => {
        expect(item).toHaveClass(/hover/);
      });
    });
  });
});
