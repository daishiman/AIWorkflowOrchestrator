import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { SkillList } from "../index";
import type { Skill } from "@repo/shared/types/skill";

const mockSkills: Skill[] = [
  {
    id: "skill-1",
    name: "tdd-principles",
    slug: "tdd-principles",
    description: "TDD原則",
    path: ".claude/skills/tdd-principles/SKILL.md",
    triggers: ["tdd", "test"],
    anchors: [],
    category: "testing",
  },
  {
    id: "skill-2",
    name: "code-review",
    slug: "code-review",
    description: "コードレビューガイド",
    path: ".claude/skills/code-review/SKILL.md",
    triggers: ["review", "code"],
    anchors: [],
    category: "development",
  },
];

describe("SkillList", () => {
  describe("スキル一覧表示", () => {
    it("スキルカードを表示する", () => {
      render(
        <SkillList
          skills={mockSkills}
          selectedSkillId={null}
          onSkillSelect={vi.fn()}
          isLoading={false}
          filter=""
          category={null}
        />,
      );
      expect(screen.getByText("tdd-principles")).toBeInTheDocument();
      expect(screen.getByText("code-review")).toBeInTheDocument();
    });

    it("グリッドレイアウトで表示する", () => {
      const { container } = render(
        <SkillList
          skills={mockSkills}
          selectedSkillId={null}
          onSkillSelect={vi.fn()}
          isLoading={false}
          filter=""
          category={null}
        />,
      );
      expect(container.firstChild).toHaveClass("grid");
    });
  });

  describe("ローディング状態", () => {
    it("ローディング中はスケルトンを表示する", () => {
      render(
        <SkillList
          skills={[]}
          selectedSkillId={null}
          onSkillSelect={vi.fn()}
          isLoading={true}
          filter=""
          category={null}
        />,
      );
      expect(screen.getByRole("status")).toBeInTheDocument();
    });

    it("ローディング中はaria-busy=trueを持つ", () => {
      const { container } = render(
        <SkillList
          skills={[]}
          selectedSkillId={null}
          onSkillSelect={vi.fn()}
          isLoading={true}
          filter=""
          category={null}
        />,
      );
      expect(container.firstChild).toHaveAttribute("aria-busy", "true");
    });
  });

  describe("空状態", () => {
    it("スキルがない場合に空状態メッセージを表示する", () => {
      render(
        <SkillList
          skills={[]}
          selectedSkillId={null}
          onSkillSelect={vi.fn()}
          isLoading={false}
          filter=""
          category={null}
        />,
      );
      expect(
        screen.getByText("スキルがインポートされていません"),
      ).toBeInTheDocument();
    });

    it("インポートボタンを表示する", () => {
      render(
        <SkillList
          skills={[]}
          selectedSkillId={null}
          onSkillSelect={vi.fn()}
          isLoading={false}
          filter=""
          category={null}
        />,
      );
      expect(
        screen.getByRole("button", { name: /インポート/i }),
      ).toBeInTheDocument();
    });

    it("インポートボタンクリックでonImportClickを呼び出す", () => {
      const handleImportClick = vi.fn();
      render(
        <SkillList
          skills={[]}
          selectedSkillId={null}
          onSkillSelect={vi.fn()}
          isLoading={false}
          filter=""
          category={null}
          onImportClick={handleImportClick}
        />,
      );
      fireEvent.click(screen.getByRole("button", { name: /インポート/i }));
      expect(handleImportClick).toHaveBeenCalledTimes(1);
    });
  });

  describe("フィルター結果なし状態", () => {
    it("検索で一致するスキルがない場合にメッセージを表示する", () => {
      render(
        <SkillList
          skills={mockSkills}
          selectedSkillId={null}
          onSkillSelect={vi.fn()}
          isLoading={false}
          filter="存在しないスキル"
          category={null}
        />,
      );
      expect(
        screen.getByText("条件に一致するスキルが見つかりません"),
      ).toBeInTheDocument();
    });

    it("カテゴリフィルターで一致するスキルがない場合にメッセージを表示する", () => {
      render(
        <SkillList
          skills={mockSkills}
          selectedSkillId={null}
          onSkillSelect={vi.fn()}
          isLoading={false}
          filter=""
          category="documentation"
        />,
      );
      expect(
        screen.getByText("条件に一致するスキルが見つかりません"),
      ).toBeInTheDocument();
    });
  });

  describe("検索フィルター", () => {
    it("検索語でスキルを絞り込む", () => {
      render(
        <SkillList
          skills={mockSkills}
          selectedSkillId={null}
          onSkillSelect={vi.fn()}
          isLoading={false}
          filter="tdd"
          category={null}
        />,
      );
      expect(screen.getByText("tdd-principles")).toBeInTheDocument();
      expect(screen.queryByText("code-review")).not.toBeInTheDocument();
    });

    it("名前でマッチする", () => {
      render(
        <SkillList
          skills={mockSkills}
          selectedSkillId={null}
          onSkillSelect={vi.fn()}
          isLoading={false}
          filter="review"
          category={null}
        />,
      );
      expect(screen.queryByText("tdd-principles")).not.toBeInTheDocument();
      expect(screen.getByText("code-review")).toBeInTheDocument();
    });

    it("説明でマッチする", () => {
      render(
        <SkillList
          skills={mockSkills}
          selectedSkillId={null}
          onSkillSelect={vi.fn()}
          isLoading={false}
          filter="コードレビュー"
          category={null}
        />,
      );
      expect(screen.queryByText("tdd-principles")).not.toBeInTheDocument();
      expect(screen.getByText("code-review")).toBeInTheDocument();
    });

    it("トリガーでマッチする", () => {
      render(
        <SkillList
          skills={mockSkills}
          selectedSkillId={null}
          onSkillSelect={vi.fn()}
          isLoading={false}
          filter="test"
          category={null}
        />,
      );
      expect(screen.getByText("tdd-principles")).toBeInTheDocument();
      expect(screen.queryByText("code-review")).not.toBeInTheDocument();
    });
  });

  describe("カテゴリフィルター", () => {
    it("カテゴリでスキルを絞り込む", () => {
      render(
        <SkillList
          skills={mockSkills}
          selectedSkillId={null}
          onSkillSelect={vi.fn()}
          isLoading={false}
          filter=""
          category="testing"
        />,
      );
      expect(screen.getByText("tdd-principles")).toBeInTheDocument();
      expect(screen.queryByText("code-review")).not.toBeInTheDocument();
    });
  });

  describe("選択状態", () => {
    it("選択されたスキルをハイライトする", () => {
      render(
        <SkillList
          skills={mockSkills}
          selectedSkillId="skill-1"
          onSkillSelect={vi.fn()}
          isLoading={false}
          filter=""
          category={null}
        />,
      );
      const selectedCard = screen.getByText("tdd-principles").closest("button");
      expect(selectedCard).toHaveClass("ring-2");
    });
  });

  describe("アクセシビリティ", () => {
    it("リストのroleを持つ", () => {
      render(
        <SkillList
          skills={mockSkills}
          selectedSkillId={null}
          onSkillSelect={vi.fn()}
          isLoading={false}
          filter=""
          category={null}
        />,
      );
      expect(screen.getByRole("list")).toBeInTheDocument();
    });

    it("各カードがlistitem roleを持つ", () => {
      render(
        <SkillList
          skills={mockSkills}
          selectedSkillId={null}
          onSkillSelect={vi.fn()}
          isLoading={false}
          filter=""
          category={null}
        />,
      );
      const listitems = screen.getAllByRole("listitem");
      expect(listitems).toHaveLength(2);
    });
  });

  describe("エッジケース", () => {
    it("大量のスキル(50件)を正しく表示する", () => {
      const manySkills: Skill[] = Array.from({ length: 50 }, (_, i) => ({
        id: `skill-${i}`,
        name: `skill-name-${i}`,
        slug: `skill-name-${i}`,
        description: `説明${i}`,
        path: `.claude/skills/skill-${i}/SKILL.md`,
        triggers: [`trigger-${i}`],
        anchors: [],
        category: "testing" as const,
      }));
      render(
        <SkillList
          skills={manySkills}
          selectedSkillId={null}
          onSkillSelect={vi.fn()}
          isLoading={false}
          filter=""
          category={null}
        />,
      );
      const listitems = screen.getAllByRole("listitem");
      expect(listitems).toHaveLength(50);
    });

    it("スキル選択時にonSkillSelectを呼び出す", () => {
      const handleSelect = vi.fn();
      render(
        <SkillList
          skills={mockSkills}
          selectedSkillId={null}
          onSkillSelect={handleSelect}
          isLoading={false}
          filter=""
          category={null}
        />,
      );
      fireEvent.click(screen.getByText("tdd-principles"));
      expect(handleSelect).toHaveBeenCalledTimes(1);
      expect(handleSelect).toHaveBeenCalledWith(mockSkills[0]);
    });

    it("カスタムクラスを適用する", () => {
      const { container } = render(
        <SkillList
          skills={mockSkills}
          selectedSkillId={null}
          onSkillSelect={vi.fn()}
          isLoading={false}
          filter=""
          category={null}
          className="custom-class"
        />,
      );
      expect(container.firstChild).toHaveClass("custom-class");
    });

    it("複合フィルター（検索+カテゴリ）を正しく適用する", () => {
      const multiCategorySkills: Skill[] = [
        ...mockSkills,
        {
          id: "skill-3",
          name: "test-helper",
          slug: "test-helper",
          description: "テストヘルパー",
          path: ".claude/skills/test-helper/SKILL.md",
          triggers: ["helper"],
          anchors: [],
          category: "testing",
        },
      ];
      render(
        <SkillList
          skills={multiCategorySkills}
          selectedSkillId={null}
          onSkillSelect={vi.fn()}
          isLoading={false}
          filter="test"
          category="testing"
        />,
      );
      // "tdd-principles"（testing、triggerにtestを含む）とtest-helper（testing、nameにtestを含む）のみ表示
      expect(screen.getByText("tdd-principles")).toBeInTheDocument();
      expect(screen.getByText("test-helper")).toBeInTheDocument();
      expect(screen.queryByText("code-review")).not.toBeInTheDocument();
    });

    it("onImportClickがundefinedでもクラッシュしない", () => {
      render(
        <SkillList
          skills={[]}
          selectedSkillId={null}
          onSkillSelect={vi.fn()}
          isLoading={false}
          filter=""
          category={null}
          onImportClick={undefined}
        />,
      );
      // クラッシュせずにボタンが表示される
      expect(
        screen.getByRole("button", { name: /インポート/i }),
      ).toBeInTheDocument();
    });
  });
});
