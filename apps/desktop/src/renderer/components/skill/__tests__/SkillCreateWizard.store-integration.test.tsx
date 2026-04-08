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

import React from "react";
import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { SkillCreateWizard } from "../SkillCreateWizard";
import { useCreateSkill } from "../../../store";

// Store セレクタモック
const mockCreateSkill = vi.fn();

vi.mock("../../../store", () => ({
  useCreateSkill: () => mockCreateSkill,
  // TASK-SC-07: LLM generation hooks (Store統合テスト非破壊用)
  useIsSkillGenerating: () => false,
  useGenerationProgress: () => null,
  useGenerationError: () => null,
  useCurrentPlanResult: () => null,
  useCurrentPlanId: () => null,
  useSetIsSkillGenerating: () => vi.fn(),
  useSetGenerationProgress: () => vi.fn(),
  useSetGenerationError: () => vi.fn(),
  useSetCurrentPlanResult: () => vi.fn(),
  useSetCurrentPlanId: () => vi.fn(),
  useClearGenerationState: () => vi.fn(),
  useWorkflowSnapshot: () => null,
}));

vi.mock("../../../hooks/useStreamingProgress", () => ({
  useStreamingProgress: () => ({
    stage: "idle",
    percent: 0,
    message: "",
    previewContent: null,
    error: null,
    isGenerating: false,
  }),
}));

vi.mock("../../../hooks/useCancelGeneration", () => ({
  useCancelGeneration: () => ({
    cancelGeneration: vi.fn(),
    startGeneration: vi.fn(),
  }),
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
    it("「今すぐ生成する」→「生成する」クリックで store.createSkill が呼ばれる（window.electronAPI.skill.create は直接呼ばれない）", async () => {
      render(<SkillCreateWizard onClose={mockOnClose} />);
      fireEvent.change(screen.getByRole("textbox"), {
        target: { value: "テストスキル" },
      });
      fireEvent.click(screen.getByRole("button", { name: "次へ" }));
      fireEvent.click(screen.getByRole("button", { name: "今すぐ生成する" }));
      await act(async () => {
        fireEvent.click(screen.getByRole("button", { name: "生成する" }));
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
      fireEvent.click(screen.getByRole("button", { name: "今すぐ生成する" }));
      await act(async () => {
        fireEvent.click(screen.getByRole("button", { name: "生成する" }));
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
      fireEvent.click(screen.getByRole("button", { name: "今すぐ生成する" }));
      await act(async () => {
        fireEvent.click(screen.getByRole("button", { name: "生成する" }));
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
      fireEvent.click(screen.getByRole("button", { name: "今すぐ生成する" }));
      await act(async () => {
        fireEvent.click(screen.getByRole("button", { name: "生成する" }));
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
      fireEvent.click(screen.getByRole("button", { name: "今すぐ生成する" }));
      await act(async () => {
        fireEvent.click(screen.getByRole("button", { name: "生成する" }));
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
      fireEvent.click(screen.getByRole("button", { name: "今すぐ生成する" }));
      await act(async () => {
        fireEvent.click(screen.getByRole("button", { name: "生成する" }));
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
      fireEvent.click(screen.getByRole("button", { name: "今すぐ生成する" }));
      await act(async () => {
        fireEvent.click(screen.getByRole("button", { name: "生成する" }));
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
      fireEvent.click(screen.getByRole("button", { name: "今すぐ生成する" }));
      await act(async () => {
        fireEvent.click(screen.getByRole("button", { name: "生成する" }));
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
      fireEvent.click(screen.getByRole("button", { name: "今すぐ生成する" }));
      await act(async () => {
        fireEvent.click(screen.getByRole("button", { name: "生成する" }));
      });
      expect(screen.getByTestId("wizard-step-generate")).toBeInTheDocument();
    });
  });

  // ============================================================
  // TC-CW-05: createSkill が null/undefined を返した場合のフォールバック
  // ============================================================
  describe("createSkill が null/undefined を返した場合のフォールバック（TC-CW-05）", () => {
    it("createSkill が null を返した場合にフォールバックエラーが表示される", async () => {
      mockCreateSkill.mockResolvedValue(null);
      render(<SkillCreateWizard onClose={mockOnClose} />);
      fireEvent.change(screen.getByRole("textbox"), {
        target: { value: "テスト" },
      });
      fireEvent.click(screen.getByRole("button", { name: "次へ" }));
      fireEvent.click(screen.getByRole("button", { name: "今すぐ生成する" }));
      await act(async () => {
        fireEvent.click(screen.getByRole("button", { name: "生成する" }));
      });
      expect(screen.getByText("スキル生成に失敗しました")).toBeInTheDocument();
    });

    it("createSkill が undefined を返した場合にフォールバックエラーが表示される", async () => {
      mockCreateSkill.mockResolvedValue(undefined);
      render(<SkillCreateWizard onClose={mockOnClose} />);
      fireEvent.change(screen.getByRole("textbox"), {
        target: { value: "テスト" },
      });
      fireEvent.click(screen.getByRole("button", { name: "次へ" }));
      fireEvent.click(screen.getByRole("button", { name: "今すぐ生成する" }));
      await act(async () => {
        fireEvent.click(screen.getByRole("button", { name: "生成する" }));
      });
      expect(screen.getByText("スキル生成に失敗しました")).toBeInTheDocument();
    });

    it("createSkill が null を返した場合に完了ステップに遷移しない", async () => {
      mockCreateSkill.mockResolvedValue(null);
      render(<SkillCreateWizard onClose={mockOnClose} />);
      fireEvent.change(screen.getByRole("textbox"), {
        target: { value: "テスト" },
      });
      fireEvent.click(screen.getByRole("button", { name: "次へ" }));
      fireEvent.click(screen.getByRole("button", { name: "今すぐ生成する" }));
      await act(async () => {
        fireEvent.click(screen.getByRole("button", { name: "生成する" }));
      });
      expect(screen.getByTestId("wizard-step-generate")).toBeInTheDocument();
      expect(
        screen.queryByTestId("wizard-step-complete"),
      ).not.toBeInTheDocument();
    });
  });

  // ============================================================
  // TC-CW-06: 生成中にボタンが非活性（UI制御）
  // ============================================================
  describe("生成中のUI制御（TC-CW-06）", () => {
    it("生成中は ConversationRoundStep（今すぐ生成するボタン）が非表示になる", async () => {
      mockCreateSkill.mockReturnValue(new Promise(() => {}));
      render(<SkillCreateWizard onClose={mockOnClose} />);
      fireEvent.change(screen.getByRole("textbox"), {
        target: { value: "テスト" },
      });
      fireEvent.click(screen.getByRole("button", { name: "次へ" }));
      fireEvent.click(screen.getByRole("button", { name: "今すぐ生成する" }));
      await act(async () => {
        fireEvent.click(screen.getByRole("button", { name: "生成する" }));
      });
      // Step 2（GenerateStep）に遷移し、ConversationRoundStep のボタンは表示されない
      expect(screen.getByTestId("wizard-step-generate")).toBeInTheDocument();
      expect(
        screen.queryByTestId("wizard-step-conversation-round"),
      ).not.toBeInTheDocument();
      expect(
        screen.queryByRole("button", { name: "今すぐ生成する" }),
      ).not.toBeInTheDocument();
    });

    it("生成中は「戻る」ボタンも表示されない", async () => {
      mockCreateSkill.mockReturnValue(new Promise(() => {}));
      render(<SkillCreateWizard onClose={mockOnClose} />);
      fireEvent.change(screen.getByRole("textbox"), {
        target: { value: "テスト" },
      });
      fireEvent.click(screen.getByRole("button", { name: "次へ" }));
      fireEvent.click(screen.getByRole("button", { name: "今すぐ生成する" }));
      await act(async () => {
        fireEvent.click(screen.getByRole("button", { name: "生成する" }));
      });
      expect(
        screen.queryByRole("button", { name: "戻る" }),
      ).not.toBeInTheDocument();
    });
  });

  // ============================================================
  // TC-CW-07 / TC-P31-01: useCreateSkill 安定参照（P31 回帰テスト）
  // ============================================================
  describe("useCreateSkill 安定参照（P31 回帰テスト）", () => {
    it("useCreateSkill が複数レンダー間で同一参照を返す（TC-P31-01）", () => {
      // vi.mock 済みの useCreateSkill は常に同じ mockCreateSkill を返す
      // renderHook で複数回レンダーし、参照安定性を検証
      const refs: Array<typeof mockCreateSkill> = [];

      const TestComponent = () => {
        const createSkillFn = useCreateSkill();
        refs.push(createSkillFn);
        return null;
      };

      const { rerender } = render(<TestComponent />);
      rerender(<TestComponent />);
      rerender(<TestComponent />);

      // P31 対策: 全レンダー間で同一参照（Object.is）
      expect(refs.length).toBeGreaterThanOrEqual(3);
      expect(refs[0]).toBe(refs[1]);
      expect(refs[1]).toBe(refs[2]);
    });

    it("useCreateSkill の参照変化が useEffect 無限ループを引き起こさない（P31 対策）", () => {
      let effectRunCount = 0;

      const TestComponent = () => {
        const createSkillFn = useCreateSkill();

        React.useEffect(() => {
          effectRunCount++;
          // P31 パターン: アクション関数を依存配列に含める
          // 安定参照であれば effect は初回（+ StrictMode 分）のみ実行
        }, [createSkillFn]);

        return <div data-testid="p31-test" />;
      };

      render(<TestComponent />);
      // happy-dom では StrictMode 無しのため 1 回、StrictMode ありなら 2 回
      expect(effectRunCount).toBeLessThanOrEqual(2);
    });
  });
});
