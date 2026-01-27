/**
 * FileContextBadge コンポーネントテスト
 *
 * Phase 4: TDD Red - 失敗するテストを作成
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { FileContextBadge } from "../FileContextBadge";
import type { FileContext } from "../../types";

// テスト用モックデータ
const createMockContext = (overrides?: Partial<FileContext>): FileContext => ({
  id: "test-id-1",
  filePath: "/path/to/test.ts",
  fileName: "test.ts",
  content: "const x = 1;",
  language: "typescript",
  addedAt: new Date("2026-01-24T00:00:00Z"),
  fileSize: 1024,
  ...overrides,
});

describe("FileContextBadge", () => {
  let mockContext: FileContext;

  beforeEach(() => {
    mockContext = createMockContext();
  });

  describe("表示", () => {
    it("ファイル名を表示する", () => {
      render(<FileContextBadge context={mockContext} />);
      expect(screen.getByText("test.ts")).toBeInTheDocument();
    });

    it("長いファイル名を省略表示する", () => {
      const longFileName = "very-long-file-name-that-should-be-truncated.ts";
      const contextWithLongName = createMockContext({
        fileName: longFileName,
      });

      render(<FileContextBadge context={contextWithLongName} />);

      const fileNameElement = screen.getByText(longFileName);
      expect(fileNameElement).toHaveClass("truncate");
    });

    it("削除ボタンを表示する", () => {
      const onRemove = vi.fn();
      render(<FileContextBadge context={mockContext} onRemove={onRemove} />);

      const removeButton = screen.getByRole("button", { name: /削除/ });
      expect(removeButton).toBeInTheDocument();
    });

    it("onRemoveが未定義の場合は削除ボタンを表示しない", () => {
      render(<FileContextBadge context={mockContext} />);

      const removeButton = screen.queryByRole("button", { name: /削除/ });
      expect(removeButton).not.toBeInTheDocument();
    });
  });

  describe("インタラクション", () => {
    it("削除ボタンクリックでonRemoveが呼ばれる", async () => {
      const user = userEvent.setup();
      const onRemove = vi.fn();

      render(<FileContextBadge context={mockContext} onRemove={onRemove} />);

      const removeButton = screen.getByRole("button", { name: /削除/ });
      await user.click(removeButton);

      expect(onRemove).toHaveBeenCalledTimes(1);
    });

    it("バッジクリックでonSelectが呼ばれる", async () => {
      const user = userEvent.setup();
      const onSelect = vi.fn();

      render(<FileContextBadge context={mockContext} onSelect={onSelect} />);

      const badge = screen.getByRole("listitem");
      await user.click(badge);

      expect(onSelect).toHaveBeenCalledTimes(1);
    });

    it("Deleteキーでファイルが削除される", async () => {
      const user = userEvent.setup();
      const onRemove = vi.fn();

      render(<FileContextBadge context={mockContext} onRemove={onRemove} />);

      const badge = screen.getByRole("listitem");
      badge.focus();
      await user.keyboard("{Delete}");

      expect(onRemove).toHaveBeenCalledTimes(1);
    });

    it("Backspaceキーでファイルが削除される", async () => {
      const user = userEvent.setup();
      const onRemove = vi.fn();

      render(<FileContextBadge context={mockContext} onRemove={onRemove} />);

      const badge = screen.getByRole("listitem");
      badge.focus();
      await user.keyboard("{Backspace}");

      expect(onRemove).toHaveBeenCalledTimes(1);
    });

    it("Enterキーでバッジが選択される", async () => {
      const user = userEvent.setup();
      const onSelect = vi.fn();

      render(<FileContextBadge context={mockContext} onSelect={onSelect} />);

      const badge = screen.getByRole("listitem");
      badge.focus();
      await user.keyboard("{Enter}");

      expect(onSelect).toHaveBeenCalledTimes(1);
    });

    it("Spaceキーでバッジが選択される", async () => {
      const user = userEvent.setup();
      const onSelect = vi.fn();

      render(<FileContextBadge context={mockContext} onSelect={onSelect} />);

      const badge = screen.getByRole("listitem");
      badge.focus();
      await user.keyboard(" ");

      expect(onSelect).toHaveBeenCalledTimes(1);
    });
  });

  describe("アクセシビリティ", () => {
    it("role=listitemが設定されている", () => {
      render(<FileContextBadge context={mockContext} />);

      const badge = screen.getByRole("listitem");
      expect(badge).toBeInTheDocument();
    });

    it("削除ボタンにaria-labelが設定されている", () => {
      const onRemove = vi.fn();
      render(<FileContextBadge context={mockContext} onRemove={onRemove} />);

      const removeButton = screen.getByRole("button");
      expect(removeButton).toHaveAttribute("aria-label", "test.tsを削除");
    });

    it("tabIndexが設定されてフォーカス可能", () => {
      render(<FileContextBadge context={mockContext} />);

      const badge = screen.getByRole("listitem");
      expect(badge).toHaveAttribute("tabIndex", "0");
    });

    it("アクティブ状態でaria-currentがtrueになる", () => {
      render(<FileContextBadge context={mockContext} isActive={true} />);

      const badge = screen.getByRole("listitem");
      expect(badge).toHaveAttribute("aria-current", "true");
    });

    it("非アクティブ状態でaria-currentが設定されない", () => {
      render(<FileContextBadge context={mockContext} isActive={false} />);

      const badge = screen.getByRole("listitem");
      expect(badge).not.toHaveAttribute("aria-current");
    });
  });

  describe("ツールチップ", () => {
    it("showTooltip=trueでファイルパスがtitle属性に設定される", () => {
      render(<FileContextBadge context={mockContext} showTooltip={true} />);

      const fileNameElement = screen.getByText("test.ts");
      expect(fileNameElement).toHaveAttribute("title", "/path/to/test.ts");
    });

    it("showTooltip=falseでtitle属性が設定されない", () => {
      render(<FileContextBadge context={mockContext} showTooltip={false} />);

      const fileNameElement = screen.getByText("test.ts");
      expect(fileNameElement).not.toHaveAttribute("title");
    });

    it("showTooltipのデフォルト値はtrue", () => {
      render(<FileContextBadge context={mockContext} />);

      const fileNameElement = screen.getByText("test.ts");
      expect(fileNameElement).toHaveAttribute("title", "/path/to/test.ts");
    });
  });

  describe("スタイリング", () => {
    it("アクティブ状態で視覚的なフィードバックがある", () => {
      render(<FileContextBadge context={mockContext} isActive={true} />);

      const badge = screen.getByRole("listitem");
      expect(badge.className).toMatch(/ring-2|ring-blue/);
    });

    it("classNameプロパティでカスタムクラスを追加できる", () => {
      render(
        <FileContextBadge context={mockContext} className="custom-class" />,
      );

      const badge = screen.getByRole("listitem");
      expect(badge).toHaveClass("custom-class");
    });
  });

  // Phase 6: エッジケーステスト
  describe("エッジケース", () => {
    it("非常に長いファイル名（100文字以上）が正しく表示される", () => {
      const longFileName = "a".repeat(100) + ".ts";
      const contextWithLongName = createMockContext({
        fileName: longFileName,
        filePath: `/path/to/${longFileName}`,
      });

      render(<FileContextBadge context={contextWithLongName} />);

      const fileNameElement = screen.getByText(longFileName);
      expect(fileNameElement).toBeInTheDocument();
      expect(fileNameElement).toHaveClass("truncate");
    });

    it("特殊文字を含むファイル名が正しく表示される", () => {
      const specialFileName = "test @#$%&()[]{}!.tsx";
      const contextWithSpecialName = createMockContext({
        fileName: specialFileName,
        filePath: `/path/to/${specialFileName}`,
      });

      render(<FileContextBadge context={contextWithSpecialName} />);

      expect(screen.getByText(specialFileName)).toBeInTheDocument();
    });

    it("日本語ファイル名が正しく表示される", () => {
      const japaneseFileName = "テストファイル.tsx";
      const contextWithJapaneseName = createMockContext({
        fileName: japaneseFileName,
        filePath: `/path/to/${japaneseFileName}`,
      });

      render(<FileContextBadge context={contextWithJapaneseName} />);

      expect(screen.getByText(japaneseFileName)).toBeInTheDocument();
    });

    it("空のファイルパスでもクラッシュしない", () => {
      const contextWithEmptyPath = createMockContext({
        filePath: "",
        fileName: "test.ts",
      });

      render(
        <FileContextBadge context={contextWithEmptyPath} showTooltip={true} />,
      );

      const fileNameElement = screen.getByText("test.ts");
      expect(fileNameElement).toHaveAttribute("title", "");
    });

    it("onSelectが未定義の場合、クリックしてもエラーが発生しない", async () => {
      const user = userEvent.setup();

      render(<FileContextBadge context={mockContext} />);

      const badge = screen.getByRole("listitem");
      await user.click(badge);

      // エラーなく処理が完了することを確認
      expect(badge).toBeInTheDocument();
    });

    it("onRemoveが未定義の場合、Delete キーを押してもエラーが発生しない", async () => {
      const user = userEvent.setup();

      render(<FileContextBadge context={mockContext} />);

      const badge = screen.getByRole("listitem");
      badge.focus();
      await user.keyboard("{Delete}");

      // エラーなく処理が完了することを確認
      expect(badge).toBeInTheDocument();
    });
  });
});
