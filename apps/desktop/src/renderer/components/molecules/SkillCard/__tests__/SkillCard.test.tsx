import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { SkillCard } from "../index";
import type { Skill } from "@repo/shared/types/skill";

const mockSkill: Skill = {
  id: "skill-1",
  name: "tdd-principles",
  slug: "tdd-principles",
  description: "TDD原則に従った開発ガイド",
  path: ".claude/skills/tdd-principles/SKILL.md",
  triggers: ["tdd", "test"],
  anchors: [
    {
      source: "TDD by Example",
      application: "Red-Green-Refactor",
      purpose: "テスト駆動開発",
    },
  ],
  category: "testing",
  lastModified: new Date("2024-01-01"),
};

describe("SkillCard", () => {
  describe("表示", () => {
    it("スキル名を表示する", () => {
      render(
        <SkillCard skill={mockSkill} isSelected={false} onClick={vi.fn()} />,
      );
      expect(screen.getByText("tdd-principles")).toBeInTheDocument();
    });

    it("スキル説明を表示する", () => {
      render(
        <SkillCard skill={mockSkill} isSelected={false} onClick={vi.fn()} />,
      );
      expect(screen.getByText("TDD原則に従った開発ガイド")).toBeInTheDocument();
    });

    it("トリガーバッジを表示する", () => {
      render(
        <SkillCard skill={mockSkill} isSelected={false} onClick={vi.fn()} />,
      );
      expect(screen.getByText("tdd")).toBeInTheDocument();
      expect(screen.getByText("test")).toBeInTheDocument();
    });
  });

  describe("選択状態", () => {
    it("選択時にハイライトする", () => {
      render(
        <SkillCard skill={mockSkill} isSelected={true} onClick={vi.fn()} />,
      );
      const card = screen.getByRole("button");
      expect(card).toHaveClass("ring-2");
    });

    it("非選択時はハイライトしない", () => {
      render(
        <SkillCard skill={mockSkill} isSelected={false} onClick={vi.fn()} />,
      );
      const card = screen.getByRole("button");
      expect(card).not.toHaveClass("ring-2");
    });
  });

  describe("インタラクション", () => {
    it("クリック時にonClickを呼び出す", () => {
      const handleClick = vi.fn();
      render(
        <SkillCard
          skill={mockSkill}
          isSelected={false}
          onClick={handleClick}
        />,
      );
      fireEvent.click(screen.getByRole("button"));
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it("Enterキーでクリックできる", () => {
      const handleClick = vi.fn();
      render(
        <SkillCard
          skill={mockSkill}
          isSelected={false}
          onClick={handleClick}
        />,
      );
      const card = screen.getByRole("button");
      fireEvent.keyDown(card, { key: "Enter" });
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it("Spaceキーでクリックできる", () => {
      const handleClick = vi.fn();
      render(
        <SkillCard
          skill={mockSkill}
          isSelected={false}
          onClick={handleClick}
        />,
      );
      const card = screen.getByRole("button");
      fireEvent.keyDown(card, { key: " " });
      expect(handleClick).toHaveBeenCalledTimes(1);
    });
  });

  describe("アクセシビリティ", () => {
    it("適切なaria-labelを持つ", () => {
      render(
        <SkillCard skill={mockSkill} isSelected={false} onClick={vi.fn()} />,
      );
      const card = screen.getByRole("button");
      expect(card).toHaveAttribute("aria-label", "スキル: tdd-principles");
    });

    it("選択時にaria-pressed=trueを持つ", () => {
      render(
        <SkillCard skill={mockSkill} isSelected={true} onClick={vi.fn()} />,
      );
      const card = screen.getByRole("button");
      expect(card).toHaveAttribute("aria-pressed", "true");
    });

    it("非選択時にaria-pressed=falseを持つ", () => {
      render(
        <SkillCard skill={mockSkill} isSelected={false} onClick={vi.fn()} />,
      );
      const card = screen.getByRole("button");
      expect(card).toHaveAttribute("aria-pressed", "false");
    });
  });

  describe("スタイル", () => {
    it("GlassPanelスタイルを適用する", () => {
      const { container } = render(
        <SkillCard skill={mockSkill} isSelected={false} onClick={vi.fn()} />,
      );
      expect(container.firstChild).toHaveClass("backdrop-blur-sm");
    });

    it("ホバー時にスケールアップする", () => {
      const { container } = render(
        <SkillCard skill={mockSkill} isSelected={false} onClick={vi.fn()} />,
      );
      expect(container.firstChild).toHaveClass("hover:scale-[1.02]");
    });
  });

  describe("エッジケース", () => {
    it("カテゴリなしのスキルを正しく表示する", () => {
      const skillWithoutCategory = { ...mockSkill, category: undefined };
      render(
        <SkillCard
          skill={skillWithoutCategory}
          isSelected={false}
          onClick={vi.fn()}
        />,
      );
      // カテゴリバッジが表示されないことを確認
      expect(screen.queryByText("テスト")).not.toBeInTheDocument();
      expect(screen.getByText("tdd-principles")).toBeInTheDocument();
    });

    it("空のトリガー配列を持つスキルを表示する", () => {
      const skillWithEmptyTriggers = { ...mockSkill, triggers: [] };
      render(
        <SkillCard
          skill={skillWithEmptyTriggers}
          isSelected={false}
          onClick={vi.fn()}
        />,
      );
      expect(screen.getByText("tdd-principles")).toBeInTheDocument();
      // トリガーバッジが表示されないことを確認
      expect(screen.queryByText("tdd")).not.toBeInTheDocument();
    });

    it("長い説明文を正しく表示する", () => {
      const skillWithLongDescription = {
        ...mockSkill,
        description: "a".repeat(200),
      };
      render(
        <SkillCard
          skill={skillWithLongDescription}
          isSelected={false}
          onClick={vi.fn()}
        />,
      );
      expect(screen.getByText("a".repeat(200))).toBeInTheDocument();
    });

    it("特殊文字を含むスキル名を表示する", () => {
      const skillWithSpecialChars = {
        ...mockSkill,
        name: "skill-with-特殊文字<>&",
      };
      render(
        <SkillCard
          skill={skillWithSpecialChars}
          isSelected={false}
          onClick={vi.fn()}
        />,
      );
      expect(screen.getByText("skill-with-特殊文字<>&")).toBeInTheDocument();
    });
  });
});
