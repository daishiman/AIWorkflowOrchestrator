import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { TemplateListItem } from "./index";
import type { PromptTemplate } from "@renderer/store/types";

describe("TemplateListItem", () => {
  const mockTemplate: PromptTemplate = {
    id: "test-1",
    name: "テストテンプレート",
    content: "テストコンテンツ",
    isPreset: false,
    createdAt: new Date("2025-01-01"),
    updatedAt: new Date("2025-01-02"),
  };

  const defaultProps = {
    template: mockTemplate,
    isSelected: false,
    onClick: vi.fn(),
    onEdit: vi.fn(),
    onDelete: vi.fn(),
  };

  describe("レンダリング", () => {
    it("テンプレート名を表示する", () => {
      render(<TemplateListItem {...defaultProps} />);
      expect(screen.getByText("テストテンプレート")).toBeInTheDocument();
    });

    it("role=optionを設定する", () => {
      render(<TemplateListItem {...defaultProps} />);
      expect(screen.getByRole("option")).toBeInTheDocument();
    });

    it("aria-selectedを設定する（未選択）", () => {
      render(<TemplateListItem {...defaultProps} />);
      expect(screen.getByRole("option")).toHaveAttribute(
        "aria-selected",
        "false",
      );
    });

    it("aria-selectedを設定する（選択済み）", () => {
      render(<TemplateListItem {...defaultProps} isSelected />);
      expect(screen.getByRole("option")).toHaveAttribute(
        "aria-selected",
        "true",
      );
    });
  });

  describe("インタラクション", () => {
    it("クリック時にonClickを呼び出す", () => {
      const handleClick = vi.fn();
      render(<TemplateListItem {...defaultProps} onClick={handleClick} />);
      fireEvent.click(screen.getByRole("option"));
      expect(handleClick).toHaveBeenCalledWith(mockTemplate);
    });

    it("Enterキーでの選択でonClickを呼び出す", () => {
      const handleClick = vi.fn();
      render(<TemplateListItem {...defaultProps} onClick={handleClick} />);
      fireEvent.keyDown(screen.getByRole("option"), { key: "Enter" });
      expect(handleClick).toHaveBeenCalledWith(mockTemplate);
    });

    it("Spaceキーでの選択でonClickを呼び出す", () => {
      const handleClick = vi.fn();
      render(<TemplateListItem {...defaultProps} onClick={handleClick} />);
      fireEvent.keyDown(screen.getByRole("option"), { key: " " });
      expect(handleClick).toHaveBeenCalledWith(mockTemplate);
    });
  });

  describe("アクションボタン（カスタムテンプレート）", () => {
    it("カスタムテンプレートには編集ボタンを表示する", () => {
      render(<TemplateListItem {...defaultProps} />);
      const item = screen.getByRole("option");
      fireEvent.mouseEnter(item);
      expect(screen.getByLabelText("編集")).toBeInTheDocument();
    });

    it("カスタムテンプレートには削除ボタンを表示する", () => {
      render(<TemplateListItem {...defaultProps} />);
      const item = screen.getByRole("option");
      fireEvent.mouseEnter(item);
      expect(screen.getByLabelText("削除")).toBeInTheDocument();
    });

    it("プリセットテンプレートにはアクションボタンを表示しない", () => {
      const presetTemplate = { ...mockTemplate, isPreset: true };
      render(<TemplateListItem {...defaultProps} template={presetTemplate} />);
      const item = screen.getByRole("option");
      fireEvent.mouseEnter(item);
      expect(screen.queryByLabelText("編集")).not.toBeInTheDocument();
      expect(screen.queryByLabelText("削除")).not.toBeInTheDocument();
    });

    it("編集ボタンクリック時にonEditを呼び出す", () => {
      const handleEdit = vi.fn();
      render(<TemplateListItem {...defaultProps} onEdit={handleEdit} />);
      const item = screen.getByRole("option");
      fireEvent.mouseEnter(item);
      fireEvent.click(screen.getByLabelText("編集"));
      expect(handleEdit).toHaveBeenCalledWith(mockTemplate.id);
    });

    it("削除ボタンクリック時にonDeleteを呼び出す", () => {
      const handleDelete = vi.fn();
      render(<TemplateListItem {...defaultProps} onDelete={handleDelete} />);
      const item = screen.getByRole("option");
      fireEvent.mouseEnter(item);
      fireEvent.click(screen.getByLabelText("削除"));
      expect(handleDelete).toHaveBeenCalledWith(mockTemplate.id);
    });

    it("アクションボタンクリック時にonClickを呼び出さない", () => {
      const handleClick = vi.fn();
      render(<TemplateListItem {...defaultProps} onClick={handleClick} />);
      const item = screen.getByRole("option");
      fireEvent.mouseEnter(item);
      fireEvent.click(screen.getByLabelText("削除"));
      expect(handleClick).not.toHaveBeenCalled();
    });
  });

  describe("スタイリング", () => {
    it("未選択時のスタイルを適用する", () => {
      render(<TemplateListItem {...defaultProps} />);
      const item = screen.getByRole("option");
      expect(item).toHaveClass("bg-transparent");
    });

    it("選択時のスタイルを適用する", () => {
      render(<TemplateListItem {...defaultProps} isSelected />);
      const item = screen.getByRole("option");
      expect(item).toHaveClass("bg-white/10");
    });

    it("ホバー時のスタイルを適用する", () => {
      render(<TemplateListItem {...defaultProps} />);
      const item = screen.getByRole("option");
      fireEvent.mouseEnter(item);
      expect(item).toHaveClass("hover:bg-white/5");
    });

    it("選択済みアイテムにチェックマークアイコンを表示する", () => {
      render(<TemplateListItem {...defaultProps} isSelected />);
      const icon = screen.getByRole("option").querySelector("svg");
      expect(icon).toBeInTheDocument();
    });
  });

  describe("アクセシビリティ", () => {
    it("tabIndex=-1を設定する（nested interactive回避）", () => {
      render(<TemplateListItem {...defaultProps} />);
      expect(screen.getByRole("option")).toHaveAttribute("tabIndex", "-1");
    });

    it("aria-labelを設定する", () => {
      render(<TemplateListItem {...defaultProps} />);
      expect(screen.getByRole("option")).toHaveAttribute(
        "aria-label",
        "テストテンプレート",
      );
    });
  });
});
