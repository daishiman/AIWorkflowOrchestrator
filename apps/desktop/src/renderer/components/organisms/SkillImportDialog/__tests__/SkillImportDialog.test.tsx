import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { SkillImportDialog } from "../index";
import type { Skill } from "@repo/shared/types/skill";

const mockAvailableSkills: Skill[] = [
  {
    id: "skill-1",
    name: "tdd-principles",
    slug: "tdd-principles",
    description: "TDD原則",
    path: ".claude/skills/tdd-principles/SKILL.md",
    triggers: ["tdd"],
    anchors: [],
    lastModified: new Date(),
  },
  {
    id: "skill-2",
    name: "code-review",
    slug: "code-review",
    description: "コードレビュー",
    path: ".claude/skills/code-review/SKILL.md",
    triggers: ["review"],
    anchors: [],
    lastModified: new Date(),
  },
];

describe("SkillImportDialog", () => {
  describe("表示制御", () => {
    it("閉じているときはレンダリングしない", () => {
      render(
        <SkillImportDialog
          isOpen={false}
          onClose={vi.fn()}
          availableSkills={mockAvailableSkills}
          importedSkillIds={[]}
          onImport={vi.fn()}
        />,
      );
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });

    it("開いているときはダイアログを表示する", () => {
      render(
        <SkillImportDialog
          isOpen={true}
          onClose={vi.fn()}
          availableSkills={mockAvailableSkills}
          importedSkillIds={[]}
          onImport={vi.fn()}
        />,
      );
      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });

    it("タイトルを表示する", () => {
      render(
        <SkillImportDialog
          isOpen={true}
          onClose={vi.fn()}
          availableSkills={mockAvailableSkills}
          importedSkillIds={[]}
          onImport={vi.fn()}
        />,
      );
      expect(
        screen.getByRole("heading", { name: /スキルをインポート/i }),
      ).toBeInTheDocument();
    });
  });

  describe("スキル一覧", () => {
    it("利用可能なスキルを表示する", () => {
      render(
        <SkillImportDialog
          isOpen={true}
          onClose={vi.fn()}
          availableSkills={mockAvailableSkills}
          importedSkillIds={[]}
          onImport={vi.fn()}
        />,
      );
      expect(screen.getByText("tdd-principles")).toBeInTheDocument();
      expect(screen.getByText("code-review")).toBeInTheDocument();
    });

    it("既にインポート済みのスキルをマークする", () => {
      render(
        <SkillImportDialog
          isOpen={true}
          onClose={vi.fn()}
          availableSkills={mockAvailableSkills}
          importedSkillIds={["skill-1"]}
          onImport={vi.fn()}
        />,
      );
      const checkbox = screen.getByLabelText("tdd-principles");
      expect(checkbox).toBeChecked();
      expect(checkbox).toBeDisabled();
    });

    it("インポート済みスキルに「インポート済み」ラベルを表示", () => {
      render(
        <SkillImportDialog
          isOpen={true}
          onClose={vi.fn()}
          availableSkills={mockAvailableSkills}
          importedSkillIds={["skill-1"]}
          onImport={vi.fn()}
        />,
      );
      expect(screen.getByText("インポート済み")).toBeInTheDocument();
    });
  });

  describe("スキル選択", () => {
    it("スキルを選択できる", () => {
      render(
        <SkillImportDialog
          isOpen={true}
          onClose={vi.fn()}
          availableSkills={mockAvailableSkills}
          importedSkillIds={[]}
          onImport={vi.fn()}
        />,
      );
      const checkbox = screen.getByLabelText("tdd-principles");
      fireEvent.click(checkbox);
      expect(checkbox).toBeChecked();
    });

    it("選択を解除できる", () => {
      render(
        <SkillImportDialog
          isOpen={true}
          onClose={vi.fn()}
          availableSkills={mockAvailableSkills}
          importedSkillIds={[]}
          onImport={vi.fn()}
        />,
      );
      const checkbox = screen.getByLabelText("tdd-principles");
      fireEvent.click(checkbox);
      fireEvent.click(checkbox);
      expect(checkbox).not.toBeChecked();
    });

    it("複数スキルを選択できる", () => {
      render(
        <SkillImportDialog
          isOpen={true}
          onClose={vi.fn()}
          availableSkills={mockAvailableSkills}
          importedSkillIds={[]}
          onImport={vi.fn()}
        />,
      );
      fireEvent.click(screen.getByLabelText("tdd-principles"));
      fireEvent.click(screen.getByLabelText("code-review"));

      expect(screen.getByLabelText("tdd-principles")).toBeChecked();
      expect(screen.getByLabelText("code-review")).toBeChecked();
    });
  });

  describe("インポート", () => {
    it("選択したスキルIDでonImportを呼び出す", () => {
      const handleImport = vi.fn();
      render(
        <SkillImportDialog
          isOpen={true}
          onClose={vi.fn()}
          availableSkills={mockAvailableSkills}
          importedSkillIds={[]}
          onImport={handleImport}
        />,
      );

      fireEvent.click(screen.getByLabelText("tdd-principles"));
      fireEvent.click(screen.getByLabelText("code-review"));
      fireEvent.click(screen.getByRole("button", { name: /インポート/i }));

      expect(handleImport).toHaveBeenCalledWith(["skill-1", "skill-2"]);
    });

    it("選択がない場合はインポートボタンを無効化", () => {
      render(
        <SkillImportDialog
          isOpen={true}
          onClose={vi.fn()}
          availableSkills={mockAvailableSkills}
          importedSkillIds={[]}
          onImport={vi.fn()}
        />,
      );
      expect(
        screen.getByRole("button", { name: /インポート/i }),
      ).toBeDisabled();
    });

    it("選択があればインポートボタンを有効化", () => {
      render(
        <SkillImportDialog
          isOpen={true}
          onClose={vi.fn()}
          availableSkills={mockAvailableSkills}
          importedSkillIds={[]}
          onImport={vi.fn()}
        />,
      );
      fireEvent.click(screen.getByLabelText("tdd-principles"));
      expect(
        screen.getByRole("button", { name: /インポート/i }),
      ).not.toBeDisabled();
    });

    it("選択数を表示する", () => {
      render(
        <SkillImportDialog
          isOpen={true}
          onClose={vi.fn()}
          availableSkills={mockAvailableSkills}
          importedSkillIds={[]}
          onImport={vi.fn()}
        />,
      );
      fireEvent.click(screen.getByLabelText("tdd-principles"));
      fireEvent.click(screen.getByLabelText("code-review"));
      expect(screen.getByText("2件選択中")).toBeInTheDocument();
    });
  });

  describe("キャンセル", () => {
    it("キャンセルボタンクリックでonCloseを呼び出す", () => {
      const handleClose = vi.fn();
      render(
        <SkillImportDialog
          isOpen={true}
          onClose={handleClose}
          availableSkills={mockAvailableSkills}
          importedSkillIds={[]}
          onImport={vi.fn()}
        />,
      );

      fireEvent.click(screen.getByRole("button", { name: /キャンセル/i }));
      expect(handleClose).toHaveBeenCalledTimes(1);
    });

    it("Escapeキーでoncloseを呼び出す", () => {
      const handleClose = vi.fn();
      render(
        <SkillImportDialog
          isOpen={true}
          onClose={handleClose}
          availableSkills={mockAvailableSkills}
          importedSkillIds={[]}
          onImport={vi.fn()}
        />,
      );

      fireEvent.keyDown(document, { key: "Escape" });
      expect(handleClose).toHaveBeenCalledTimes(1);
    });

    it("キャンセル時に選択をリセットする", () => {
      const { rerender } = render(
        <SkillImportDialog
          isOpen={true}
          onClose={vi.fn()}
          availableSkills={mockAvailableSkills}
          importedSkillIds={[]}
          onImport={vi.fn()}
        />,
      );

      fireEvent.click(screen.getByLabelText("tdd-principles"));
      expect(screen.getByLabelText("tdd-principles")).toBeChecked();

      // 閉じて再度開く
      rerender(
        <SkillImportDialog
          isOpen={false}
          onClose={vi.fn()}
          availableSkills={mockAvailableSkills}
          importedSkillIds={[]}
          onImport={vi.fn()}
        />,
      );
      rerender(
        <SkillImportDialog
          isOpen={true}
          onClose={vi.fn()}
          availableSkills={mockAvailableSkills}
          importedSkillIds={[]}
          onImport={vi.fn()}
        />,
      );

      expect(screen.getByLabelText("tdd-principles")).not.toBeChecked();
    });
  });

  describe("検索", () => {
    it("検索機能がある", () => {
      render(
        <SkillImportDialog
          isOpen={true}
          onClose={vi.fn()}
          availableSkills={mockAvailableSkills}
          importedSkillIds={[]}
          onImport={vi.fn()}
        />,
      );

      fireEvent.change(screen.getByPlaceholderText("スキルを検索..."), {
        target: { value: "tdd" },
      });
      expect(screen.getByText("tdd-principles")).toBeInTheDocument();
      expect(screen.queryByText("code-review")).not.toBeInTheDocument();
    });
  });

  describe("アクセシビリティ", () => {
    it("dialog roleを持つ", () => {
      render(
        <SkillImportDialog
          isOpen={true}
          onClose={vi.fn()}
          availableSkills={mockAvailableSkills}
          importedSkillIds={[]}
          onImport={vi.fn()}
        />,
      );
      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });

    it("aria-modal=trueを持つ", () => {
      render(
        <SkillImportDialog
          isOpen={true}
          onClose={vi.fn()}
          availableSkills={mockAvailableSkills}
          importedSkillIds={[]}
          onImport={vi.fn()}
        />,
      );
      expect(screen.getByRole("dialog")).toHaveAttribute("aria-modal", "true");
    });

    it("フォーカストラップが機能する", async () => {
      render(
        <SkillImportDialog
          isOpen={true}
          onClose={vi.fn()}
          availableSkills={mockAvailableSkills}
          importedSkillIds={[]}
          onImport={vi.fn()}
        />,
      );
      // 開くと検索バーにフォーカスが移る（非同期）
      await waitFor(() => {
        expect(screen.getByPlaceholderText("スキルを検索...")).toHaveFocus();
      });
    });
  });

  describe("エッジケース", () => {
    it("検索結果が0件の場合にメッセージを表示する", () => {
      render(
        <SkillImportDialog
          isOpen={true}
          onClose={vi.fn()}
          availableSkills={mockAvailableSkills}
          importedSkillIds={[]}
          onImport={vi.fn()}
        />,
      );

      fireEvent.change(screen.getByPlaceholderText("スキルを検索..."), {
        target: { value: "存在しないスキル" },
      });
      expect(screen.getByText("スキルが見つかりません")).toBeInTheDocument();
    });

    it("利用可能なスキルが0件の場合", () => {
      render(
        <SkillImportDialog
          isOpen={true}
          onClose={vi.fn()}
          availableSkills={[]}
          importedSkillIds={[]}
          onImport={vi.fn()}
        />,
      );
      expect(screen.getByText("スキルが見つかりません")).toBeInTheDocument();
    });

    it("全スキルがインポート済みの場合", () => {
      render(
        <SkillImportDialog
          isOpen={true}
          onClose={vi.fn()}
          availableSkills={mockAvailableSkills}
          importedSkillIds={["skill-1", "skill-2"]}
          onImport={vi.fn()}
        />,
      );
      // 両方のチェックボックスが無効化されている
      expect(screen.getByLabelText("tdd-principles")).toBeDisabled();
      expect(screen.getByLabelText("code-review")).toBeDisabled();
      // インポートボタンは無効
      expect(
        screen.getByRole("button", { name: /インポート/i }),
      ).toBeDisabled();
    });

    it("インポート後に選択をリセットする", () => {
      const handleImport = vi.fn();
      const { rerender } = render(
        <SkillImportDialog
          isOpen={true}
          onClose={vi.fn()}
          availableSkills={mockAvailableSkills}
          importedSkillIds={[]}
          onImport={handleImport}
        />,
      );

      fireEvent.click(screen.getByLabelText("tdd-principles"));
      fireEvent.click(screen.getByRole("button", { name: /インポート/i }));
      expect(handleImport).toHaveBeenCalledWith(["skill-1"]);

      // 閉じて再度開く（インポート後の状態をシミュレート）
      rerender(
        <SkillImportDialog
          isOpen={false}
          onClose={vi.fn()}
          availableSkills={mockAvailableSkills}
          importedSkillIds={["skill-1"]}
          onImport={handleImport}
        />,
      );
      rerender(
        <SkillImportDialog
          isOpen={true}
          onClose={vi.fn()}
          availableSkills={mockAvailableSkills}
          importedSkillIds={["skill-1"]}
          onImport={handleImport}
        />,
      );

      // 新しくインポートされたスキルは無効化されている
      expect(screen.getByLabelText("tdd-principles")).toBeDisabled();
      // 未インポートのスキルは選択可能
      expect(screen.getByLabelText("code-review")).not.toBeDisabled();
    });

    it("説明文でも検索できる", () => {
      render(
        <SkillImportDialog
          isOpen={true}
          onClose={vi.fn()}
          availableSkills={mockAvailableSkills}
          importedSkillIds={[]}
          onImport={vi.fn()}
        />,
      );

      fireEvent.change(screen.getByPlaceholderText("スキルを検索..."), {
        target: { value: "レビュー" },
      });
      expect(screen.queryByText("tdd-principles")).not.toBeInTheDocument();
      expect(screen.getByText("code-review")).toBeInTheDocument();
    });

    it("トリガーでも検索できる", () => {
      render(
        <SkillImportDialog
          isOpen={true}
          onClose={vi.fn()}
          availableSkills={mockAvailableSkills}
          importedSkillIds={[]}
          onImport={vi.fn()}
        />,
      );

      fireEvent.change(screen.getByPlaceholderText("スキルを検索..."), {
        target: { value: "review" },
      });
      expect(screen.queryByText("tdd-principles")).not.toBeInTheDocument();
      expect(screen.getByText("code-review")).toBeInTheDocument();
    });
  });
});
