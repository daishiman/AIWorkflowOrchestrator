/**
 * @file SkillCreateWizard.store-integration.test.tsx
 * @description SkillCreateWizard Store統合テスト
 * @task TASK-10A-F Phase 4
 * P39準拠: fireEventのみ使用（happy-dom環境でuserEvent禁止）
 * P9準拠: beforeEachで状態リセット
 * P40準拠: apps/desktop ディレクトリから実行
 *
 * Store action経由でのスキル作成フローを検証。
 * window.electronAPI直接呼び出しが発生しないことを保証する。
 */

import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { SkillCreateWizard } from "../SkillCreateWizard";

// Store セレクタモック
const mockCreateSkill = vi.fn();

vi.mock("../../../store", () => ({
  useCreateSkill: () => mockCreateSkill,
}));

// window.electronAPI スパイ（直接呼び出しがないことを検証）
const spySkillCreate = vi.fn();

describe("SkillCreateWizard Store統合", () => {
  let mockOnClose: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
    mockOnClose = vi.fn();
    mockCreateSkill.mockResolvedValue("/path/to/new-skill");

    (window as Record<string, unknown>).electronAPI = {
      skill: { create: spySkillCreate },
    };
  });

  afterEach(() => {
    delete (window as Record<string, unknown>).electronAPI;
  });

  describe("store action 経由のスキル作成", () => {
    it("「スキルを生成」クリックで store.createSkill が呼ばれる（window.electronAPI.skill.create は直接呼ばれない）", async () => {
      render(<SkillCreateWizard onClose={mockOnClose} />);
      fireEvent.change(screen.getByRole("textbox"), {
        target: { value: "テストスキル" },
      });
      fireEvent.click(screen.getByRole("button", { name: "次へ" }));
      await act(async () => {
        fireEvent.click(screen.getByRole("button", { name: "スキルを生成" }));
      });
      expect(mockCreateSkill).toHaveBeenCalledTimes(1);
      expect(spySkillCreate).not.toHaveBeenCalled();
    });

    it("store.createSkill に description と options が正しく渡される", async () => {
      render(<SkillCreateWizard onClose={mockOnClose} />);
      fireEvent.change(screen.getByRole("textbox"), {
        target: { value: "テスト説明" },
      });
      fireEvent.click(screen.getByRole("button", { name: "次へ" }));
      await act(async () => {
        fireEvent.click(screen.getByRole("button", { name: "スキルを生成" }));
      });
      expect(mockCreateSkill).toHaveBeenCalledWith("テスト説明", {
        generateTasks: true,
        addAgents: false,
        addReferences: false,
      });
    });

    it("store.createSkill 成功後に Step 4（完了）に遷移し、生成パスが表示される", async () => {
      render(<SkillCreateWizard onClose={mockOnClose} />);
      fireEvent.change(screen.getByRole("textbox"), {
        target: { value: "テスト" },
      });
      fireEvent.click(screen.getByRole("button", { name: "次へ" }));
      await act(async () => {
        fireEvent.click(screen.getByRole("button", { name: "スキルを生成" }));
      });
      expect(screen.getByText("スキルが作成されました")).toBeInTheDocument();
      expect(screen.getByText("/path/to/new-skill")).toBeInTheDocument();
    });

    it("store.createSkill 失敗時にエラーメッセージが表示される", async () => {
      mockCreateSkill.mockRejectedValue(new Error("生成失敗"));
      render(<SkillCreateWizard onClose={mockOnClose} />);
      fireEvent.change(screen.getByRole("textbox"), {
        target: { value: "テスト" },
      });
      fireEvent.click(screen.getByRole("button", { name: "次へ" }));
      await act(async () => {
        fireEvent.click(screen.getByRole("button", { name: "スキルを生成" }));
      });
      expect(screen.getByText("生成失敗")).toBeInTheDocument();
    });

    it("store.createSkill 失敗時に Error 以外のオブジェクトでもフォールバックメッセージが表示される", async () => {
      mockCreateSkill.mockRejectedValue("unknown");
      render(<SkillCreateWizard onClose={mockOnClose} />);
      fireEvent.change(screen.getByRole("textbox"), {
        target: { value: "テスト" },
      });
      fireEvent.click(screen.getByRole("button", { name: "次へ" }));
      await act(async () => {
        fireEvent.click(screen.getByRole("button", { name: "スキルを生成" }));
      });
      expect(screen.getByText("スキル生成に失敗しました")).toBeInTheDocument();
    });

    it("store.createSkill が空文字列を返した場合にフォールバックエラーが表示される", async () => {
      mockCreateSkill.mockResolvedValue("");
      render(<SkillCreateWizard onClose={mockOnClose} />);
      fireEvent.change(screen.getByRole("textbox"), {
        target: { value: "テスト" },
      });
      fireEvent.click(screen.getByRole("button", { name: "次へ" }));
      await act(async () => {
        fireEvent.click(screen.getByRole("button", { name: "スキルを生成" }));
      });
      expect(screen.getByText("スキル生成に失敗しました")).toBeInTheDocument();
    });

    it("生成中は GenerateStep にローディング状態が表示される", async () => {
      mockCreateSkill.mockReturnValue(new Promise(() => {}));
      render(<SkillCreateWizard onClose={mockOnClose} />);
      fireEvent.change(screen.getByRole("textbox"), {
        target: { value: "テスト" },
      });
      fireEvent.click(screen.getByRole("button", { name: "次へ" }));
      await act(async () => {
        fireEvent.click(screen.getByRole("button", { name: "スキルを生成" }));
      });
      expect(screen.getByTestId("wizard-step-generate")).toBeInTheDocument();
    });
  });

  describe("状態遷移", () => {
    it("初期状態は Step 0（説明入力）", () => {
      render(<SkillCreateWizard onClose={mockOnClose} />);
      expect(screen.getByTestId("wizard-step-describe")).toBeInTheDocument();
    });

    it("生成成功で Step 3（完了）に遷移する", async () => {
      render(<SkillCreateWizard onClose={mockOnClose} />);
      fireEvent.change(screen.getByRole("textbox"), {
        target: { value: "テスト" },
      });
      fireEvent.click(screen.getByRole("button", { name: "次へ" }));
      await act(async () => {
        fireEvent.click(screen.getByRole("button", { name: "スキルを生成" }));
      });
      expect(screen.getByTestId("wizard-step-complete")).toBeInTheDocument();
    });

    it("生成失敗で Step 2（生成中）のまま（エラー表示）", async () => {
      mockCreateSkill.mockRejectedValue(new Error("失敗"));
      render(<SkillCreateWizard onClose={mockOnClose} />);
      fireEvent.change(screen.getByRole("textbox"), {
        target: { value: "テスト" },
      });
      fireEvent.click(screen.getByRole("button", { name: "次へ" }));
      await act(async () => {
        fireEvent.click(screen.getByRole("button", { name: "スキルを生成" }));
      });
      expect(screen.getByTestId("wizard-step-generate")).toBeInTheDocument();
    });
  });
});
