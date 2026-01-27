/**
 * FileContextList コンポーネントテスト
 *
 * Phase 4: TDD Red - 失敗するテストを作成
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { FileContextList } from "../FileContextList";
import type { FileContext } from "../../types";

// テスト用モックデータ
const createMockContext = (
  id: string,
  overrides?: Partial<FileContext>,
): FileContext => ({
  id,
  filePath: `/path/to/${id}.ts`,
  fileName: `${id}.ts`,
  content: "const x = 1;",
  language: "typescript",
  addedAt: new Date("2026-01-24T00:00:00Z"),
  fileSize: 1024,
  ...overrides,
});

// useFileContextのモック
const mockRemoveFileContext = vi.fn();
const mockSetActiveContext = vi.fn();
const mockUseFileContext = vi.fn(() => ({
  fileContexts: [],
  activeContextId: null,
  removeFileContext: mockRemoveFileContext,
  setActiveContext: mockSetActiveContext,
}));

vi.mock("../../hooks", () => ({
  useFileContext: () => mockUseFileContext(),
}));

describe("FileContextList", () => {
  const mockFiles = [
    createMockContext("file-1"),
    createMockContext("file-2"),
    createMockContext("file-3"),
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseFileContext.mockReturnValue({
      fileContexts: mockFiles,
      activeContextId: null,
      removeFileContext: mockRemoveFileContext,
      setActiveContext: mockSetActiveContext,
    });
  });

  describe("表示", () => {
    it("ファイル一覧を表示する", () => {
      render(<FileContextList contexts={mockFiles} />);

      expect(screen.getByText("file-1.ts")).toBeInTheDocument();
      expect(screen.getByText("file-2.ts")).toBeInTheDocument();
      expect(screen.getByText("file-3.ts")).toBeInTheDocument();
    });

    it("空の場合はemptyMessageを表示する", () => {
      render(<FileContextList contexts={[]} />);
      expect(
        screen.getByText("ファイルが添付されていません"),
      ).toBeInTheDocument();
    });

    it("カスタムemptyMessageを表示できる", () => {
      render(
        <FileContextList contexts={[]} emptyMessage="ドラッグ&ドロップ" />,
      );
      expect(screen.getByText("ドラッグ&ドロップ")).toBeInTheDocument();
    });

    it("contextsが省略された場合はstoreから取得する", () => {
      mockUseFileContext.mockReturnValue({
        fileContexts: mockFiles,
        activeContextId: null,
        removeFileContext: mockRemoveFileContext,
        setActiveContext: mockSetActiveContext,
      });

      render(<FileContextList />);

      expect(screen.getByText("file-1.ts")).toBeInTheDocument();
    });
  });

  describe("インタラクション", () => {
    it("削除ボタンクリックでonRemoveが呼ばれる", async () => {
      const user = userEvent.setup();
      const onRemove = vi.fn();
      render(<FileContextList contexts={mockFiles} onRemove={onRemove} />);

      const removeButtons = screen.getAllByRole("button", { name: /削除/ });
      await user.click(removeButtons[0]);

      expect(onRemove).toHaveBeenCalledWith("file-1");
    });

    it("onRemoveが未定義の場合はremoveFileContextが呼ばれる", async () => {
      const user = userEvent.setup();
      render(<FileContextList contexts={mockFiles} />);

      const removeButtons = screen.getAllByRole("button", { name: /削除/ });
      await user.click(removeButtons[0]);

      expect(mockRemoveFileContext).toHaveBeenCalledWith("file-1");
    });

    it("バッジクリックでonSelectが呼ばれる", async () => {
      const user = userEvent.setup();
      const onSelect = vi.fn();
      render(<FileContextList contexts={mockFiles} onSelect={onSelect} />);

      const badges = screen.getAllByRole("listitem");
      await user.click(badges[0]);

      expect(onSelect).toHaveBeenCalledWith("file-1");
    });

    it("onSelectが未定義の場合はsetActiveContextが呼ばれる", async () => {
      const user = userEvent.setup();
      render(<FileContextList contexts={mockFiles} />);

      const badges = screen.getAllByRole("listitem");
      await user.click(badges[0]);

      expect(mockSetActiveContext).toHaveBeenCalledWith("file-1");
    });
  });

  describe("選択状態", () => {
    it("selectedIdで選択状態を指定できる", () => {
      render(<FileContextList contexts={mockFiles} selectedId="file-2" />);

      const badges = screen.getAllByRole("listitem");
      expect(badges[1]).toHaveAttribute("aria-current", "true");
    });

    it("selectedIdが省略された場合はactiveContextIdを使用する", () => {
      mockUseFileContext.mockReturnValue({
        fileContexts: mockFiles,
        activeContextId: "file-3",
        removeFileContext: mockRemoveFileContext,
        setActiveContext: mockSetActiveContext,
      });

      render(<FileContextList contexts={mockFiles} />);

      const badges = screen.getAllByRole("listitem");
      expect(badges[2]).toHaveAttribute("aria-current", "true");
    });
  });

  describe("スクロール", () => {
    it("maxHeightでスクロール領域の高さを制限できる", () => {
      render(<FileContextList contexts={mockFiles} maxHeight="200px" />);

      const list = screen.getByRole("list");
      expect(list).toHaveStyle({ maxHeight: "200px" });
    });

    it("maxHeightに数値を指定できる", () => {
      render(<FileContextList contexts={mockFiles} maxHeight={150} />);

      const list = screen.getByRole("list");
      expect(list).toHaveStyle({ maxHeight: "150px" });
    });
  });

  describe("アクセシビリティ", () => {
    it("role=listが設定されている", () => {
      render(<FileContextList contexts={mockFiles} />);
      const list = screen.getByRole("list");
      expect(list).toBeInTheDocument();
    });

    it("aria-labelが設定されている", () => {
      render(<FileContextList contexts={mockFiles} />);
      const list = screen.getByRole("list");
      expect(list).toHaveAttribute("aria-label", "添付ファイル一覧");
    });

    it("空状態にrole=statusが設定されている", () => {
      render(<FileContextList contexts={[]} />);
      const status = screen.getByRole("status");
      expect(status).toBeInTheDocument();
    });

    it("Tabキーでバッジ間を移動できる", async () => {
      const user = userEvent.setup();
      render(<FileContextList contexts={mockFiles} />);

      const badges = screen.getAllByRole("listitem");

      // 最初のバッジにフォーカス
      badges[0].focus();
      expect(document.activeElement).toBe(badges[0]);

      // Tab で次のバッジへ
      await user.tab();
      // Tabはブラウザのフォーカス順序に従うため、
      // 削除ボタンがある場合はそこにフォーカスが移動する可能性がある
      expect(document.activeElement).not.toBe(badges[0]);
    });
  });

  describe("スタイリング", () => {
    it("classNameプロパティでカスタムクラスを追加できる", () => {
      render(<FileContextList contexts={mockFiles} className="custom-class" />);
      const list = screen.getByRole("list");
      expect(list).toHaveClass("custom-class");
    });
  });

  describe("エッジケース", () => {
    it("大量のファイル（12件）が正しく表示される", () => {
      const manyFiles = Array(12)
        .fill(null)
        .map((_, i) => createMockContext(`file-${i}`));

      render(<FileContextList contexts={manyFiles} />);

      expect(screen.getAllByRole("listitem")).toHaveLength(12);
    });

    it("ファイル追加後にリストが更新される", () => {
      const { rerender } = render(<FileContextList contexts={mockFiles} />);

      expect(screen.getAllByRole("listitem")).toHaveLength(3);

      const newFiles = [...mockFiles, createMockContext("file-4")];
      rerender(<FileContextList contexts={newFiles} />);

      expect(screen.getAllByRole("listitem")).toHaveLength(4);
    });

    it("ファイル削除後にリストが更新される", () => {
      const { rerender } = render(<FileContextList contexts={mockFiles} />);

      expect(screen.getAllByRole("listitem")).toHaveLength(3);

      const fewerFiles = mockFiles.slice(0, 2);
      rerender(<FileContextList contexts={fewerFiles} />);

      expect(screen.getAllByRole("listitem")).toHaveLength(2);
    });
  });
});
