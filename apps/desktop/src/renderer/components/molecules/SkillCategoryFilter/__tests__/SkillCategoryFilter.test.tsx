import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { SkillCategoryFilter } from "../index";
import type { SkillCategory } from "@repo/shared/types/skill";

const mockCategories: SkillCategory[] = [
  "testing",
  "development",
  "design",
  "documentation",
];

describe("SkillCategoryFilter", () => {
  describe("表示", () => {
    it("セレクト要素をレンダリングする", () => {
      render(
        <SkillCategoryFilter
          value={null}
          onChange={vi.fn()}
          categories={mockCategories}
        />,
      );
      expect(screen.getByRole("combobox")).toBeInTheDocument();
    });

    it("全てのカテゴリを表示する", () => {
      render(
        <SkillCategoryFilter
          value={null}
          onChange={vi.fn()}
          categories={mockCategories}
        />,
      );
      fireEvent.click(screen.getByRole("combobox"));

      // SKILL_CATEGORIESのラベルが表示される
      expect(screen.getByText("テスト")).toBeInTheDocument();
      expect(screen.getByText("開発")).toBeInTheDocument();
      expect(screen.getByText("設計")).toBeInTheDocument();
      expect(screen.getByText("ドキュメント")).toBeInTheDocument();
    });

    it("null値で「全て」オプションを表示する", () => {
      render(
        <SkillCategoryFilter
          value={null}
          onChange={vi.fn()}
          categories={mockCategories}
        />,
      );
      expect(screen.getByDisplayValue("全て")).toBeInTheDocument();
    });

    it("選択されたカテゴリを表示する", () => {
      render(
        <SkillCategoryFilter
          value="testing"
          onChange={vi.fn()}
          categories={mockCategories}
        />,
      );
      // 選択されたオプションのラベル「テスト」が表示される
      expect(screen.getByDisplayValue("テスト")).toBeInTheDocument();
    });
  });

  describe("インタラクション", () => {
    it("カテゴリ選択時にonChangeを呼び出す", () => {
      const handleChange = vi.fn();
      render(
        <SkillCategoryFilter
          value={null}
          onChange={handleChange}
          categories={mockCategories}
        />,
      );

      fireEvent.change(screen.getByRole("combobox"), {
        target: { value: "testing" },
      });
      expect(handleChange).toHaveBeenCalledWith("testing");
    });

    it("「全て」選択時にnullでonChangeを呼び出す", () => {
      const handleChange = vi.fn();
      render(
        <SkillCategoryFilter
          value="testing"
          onChange={handleChange}
          categories={mockCategories}
        />,
      );

      fireEvent.change(screen.getByRole("combobox"), { target: { value: "" } });
      expect(handleChange).toHaveBeenCalledWith(null);
    });
  });

  describe("アクセシビリティ", () => {
    it("適切なaria-labelを持つ", () => {
      render(
        <SkillCategoryFilter
          value={null}
          onChange={vi.fn()}
          categories={mockCategories}
        />,
      );
      expect(screen.getByRole("combobox")).toHaveAttribute(
        "aria-label",
        "カテゴリでフィルター",
      );
    });

    it("combobox roleを持つ", () => {
      render(
        <SkillCategoryFilter
          value={null}
          onChange={vi.fn()}
          categories={mockCategories}
        />,
      );
      expect(screen.getByRole("combobox")).toBeInTheDocument();
    });
  });

  describe("空のカテゴリ", () => {
    it("カテゴリがない場合は「全て」のみ表示", () => {
      render(
        <SkillCategoryFilter value={null} onChange={vi.fn()} categories={[]} />,
      );
      const options = screen.getAllByRole("option");
      expect(options).toHaveLength(1);
      expect(options[0]).toHaveTextContent("全て");
    });
  });

  describe("スタイル", () => {
    it("GlassPanelスタイルを適用する", () => {
      const { container } = render(
        <SkillCategoryFilter
          value={null}
          onChange={vi.fn()}
          categories={mockCategories}
        />,
      );
      expect(container.firstChild).toHaveClass("backdrop-blur-sm");
    });

    it("フォーカス時にリングを表示する", () => {
      render(
        <SkillCategoryFilter
          value={null}
          onChange={vi.fn()}
          categories={mockCategories}
        />,
      );
      const select = screen.getByRole("combobox");
      expect(select).toHaveClass("focus:ring-2");
    });
  });
});
