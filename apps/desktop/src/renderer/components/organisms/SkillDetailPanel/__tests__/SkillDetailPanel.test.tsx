import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { SkillDetailPanel } from "../index";
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
      name: "TDD by Example",
      application: "Red-Green-Refactor",
      purpose: "テスト駆動開発",
    },
    {
      name: "Clean Code",
      application: "テスト可読性",
      purpose: "メンテナンス性",
    },
  ],
  category: "testing",
};

describe("SkillDetailPanel", () => {
  describe("表示", () => {
    it("スキル名を表示する", () => {
      render(
        <SkillDetailPanel
          skill={mockSkill}
          onExecute={vi.fn()}
          onDelete={vi.fn()}
          onClose={vi.fn()}
        />,
      );
      expect(
        screen.getByRole("heading", { name: "tdd-principles" }),
      ).toBeInTheDocument();
    });

    it("スキル説明を表示する", () => {
      render(
        <SkillDetailPanel
          skill={mockSkill}
          onExecute={vi.fn()}
          onDelete={vi.fn()}
          onClose={vi.fn()}
        />,
      );
      expect(screen.getByText("TDD原則に従った開発ガイド")).toBeInTheDocument();
    });

    it("トリガーを表示する", () => {
      render(
        <SkillDetailPanel
          skill={mockSkill}
          onExecute={vi.fn()}
          onDelete={vi.fn()}
          onClose={vi.fn()}
        />,
      );
      expect(screen.getByText("tdd")).toBeInTheDocument();
      expect(screen.getByText("test")).toBeInTheDocument();
    });

    it("アンカーリストを表示する", () => {
      render(
        <SkillDetailPanel
          skill={mockSkill}
          onExecute={vi.fn()}
          onDelete={vi.fn()}
          onClose={vi.fn()}
        />,
      );
      expect(screen.getByText("TDD by Example")).toBeInTheDocument();
      expect(screen.getByText("Clean Code")).toBeInTheDocument();
    });

    it("パスを表示する", () => {
      render(
        <SkillDetailPanel
          skill={mockSkill}
          onExecute={vi.fn()}
          onDelete={vi.fn()}
          onClose={vi.fn()}
        />,
      );
      expect(
        screen.getByText(".claude/skills/tdd-principles/SKILL.md"),
      ).toBeInTheDocument();
    });

    it("カテゴリを表示する", () => {
      render(
        <SkillDetailPanel
          skill={mockSkill}
          onExecute={vi.fn()}
          onDelete={vi.fn()}
          onClose={vi.fn()}
        />,
      );
      expect(screen.getByText("testing")).toBeInTheDocument();
    });
  });

  describe("アクション", () => {
    it("実行ボタンクリックでonExecuteを呼び出す", () => {
      const handleExecute = vi.fn();
      render(
        <SkillDetailPanel
          skill={mockSkill}
          onExecute={handleExecute}
          onDelete={vi.fn()}
          onClose={vi.fn()}
        />,
      );
      fireEvent.click(screen.getByRole("button", { name: /実行/i }));
      expect(handleExecute).toHaveBeenCalledWith(mockSkill);
    });

    it("削除ボタンクリックで確認ダイアログを表示", () => {
      render(
        <SkillDetailPanel
          skill={mockSkill}
          onExecute={vi.fn()}
          onDelete={vi.fn()}
          onClose={vi.fn()}
        />,
      );
      fireEvent.click(screen.getByRole("button", { name: /削除/i }));
      expect(screen.getByText(/このスキルを削除しますか/i)).toBeInTheDocument();
    });

    it("削除確認でonDeleteを呼び出す", () => {
      const handleDelete = vi.fn();
      render(
        <SkillDetailPanel
          skill={mockSkill}
          onExecute={vi.fn()}
          onDelete={handleDelete}
          onClose={vi.fn()}
        />,
      );
      fireEvent.click(screen.getByRole("button", { name: /削除/i }));
      fireEvent.click(screen.getByRole("button", { name: /はい/i }));
      expect(handleDelete).toHaveBeenCalledWith(mockSkill);
    });

    it("削除キャンセルでonDeleteを呼び出さない", () => {
      const handleDelete = vi.fn();
      render(
        <SkillDetailPanel
          skill={mockSkill}
          onExecute={vi.fn()}
          onDelete={handleDelete}
          onClose={vi.fn()}
        />,
      );
      fireEvent.click(screen.getByRole("button", { name: /削除/i }));
      fireEvent.click(screen.getByRole("button", { name: /キャンセル/i }));
      expect(handleDelete).not.toHaveBeenCalled();
    });

    it("閉じるボタンクリックでonCloseを呼び出す", () => {
      const handleClose = vi.fn();
      render(
        <SkillDetailPanel
          skill={mockSkill}
          onExecute={vi.fn()}
          onDelete={vi.fn()}
          onClose={handleClose}
        />,
      );
      fireEvent.click(screen.getByRole("button", { name: /閉じる/i }));
      expect(handleClose).toHaveBeenCalledTimes(1);
    });
  });

  describe("キーボード操作", () => {
    it("Escapeキーで閉じる", () => {
      const handleClose = vi.fn();
      render(
        <SkillDetailPanel
          skill={mockSkill}
          onExecute={vi.fn()}
          onDelete={vi.fn()}
          onClose={handleClose}
        />,
      );
      fireEvent.keyDown(document, { key: "Escape" });
      expect(handleClose).toHaveBeenCalledTimes(1);
    });
  });

  describe("null skill", () => {
    it("skillがnullの場合はnullを返す", () => {
      const { container } = render(
        <SkillDetailPanel
          skill={null}
          onExecute={vi.fn()}
          onDelete={vi.fn()}
          onClose={vi.fn()}
        />,
      );
      expect(container.firstChild).toBeNull();
    });
  });

  describe("アクセシビリティ", () => {
    it("complementary roleを持つ", () => {
      render(
        <SkillDetailPanel
          skill={mockSkill}
          onExecute={vi.fn()}
          onDelete={vi.fn()}
          onClose={vi.fn()}
        />,
      );
      expect(screen.getByRole("complementary")).toBeInTheDocument();
    });

    it("適切なaria-labelを持つ", () => {
      render(
        <SkillDetailPanel
          skill={mockSkill}
          onExecute={vi.fn()}
          onDelete={vi.fn()}
          onClose={vi.fn()}
        />,
      );
      expect(screen.getByRole("complementary")).toHaveAttribute(
        "aria-label",
        "スキル詳細: tdd-principles",
      );
    });
  });

  describe("スタイル", () => {
    it("GlassPanelスタイルを適用する", () => {
      const { container } = render(
        <SkillDetailPanel
          skill={mockSkill}
          onExecute={vi.fn()}
          onDelete={vi.fn()}
          onClose={vi.fn()}
        />,
      );
      expect(container.firstChild).toHaveClass("backdrop-blur-sm");
    });
  });
});
