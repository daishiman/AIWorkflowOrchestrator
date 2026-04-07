import React from "react";

/**
 * @file SkillCreateWizard.test.tsx
 * @description SkillCreateWizard 統合コンポーネント ユニットテスト
 * @phase Phase 4: テスト作成（TDD: Red -> Green）
 * @task TASK-10A-C, TASK-10A-F (Store統合)
 *
 * P39準拠: fireEventのみ使用（happy-dom環境でuserEvent禁止）
 * P9準拠: beforeEachで状態リセット
 * TASK-10A-F: window.electronAPI直接呼び出しからStore action経由に移行
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { SkillCreateWizard } from "../SkillCreateWizard";
import { useCreateSkill } from "../../../store";

const mockCreateSkill = vi.fn();
const mockUseWorkflowSnapshot = vi.fn(() => null);

vi.mock("../../../store", () => ({
  useCreateSkill: () => mockCreateSkill,
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
  useWorkflowSnapshot: () => mockUseWorkflowSnapshot(),
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

const DEFAULT_PURPOSE = "テストスキルの目的説明";
const DEFAULT_CATEGORY = "自動化";

const enterPurpose = (purpose = DEFAULT_PURPOSE) => {
  fireEvent.change(screen.getByLabelText(/目的・背景/), {
    target: { value: purpose },
  });
};

const selectCategory = (categoryLabel = DEFAULT_CATEGORY) => {
  fireEvent.click(screen.getByRole("button", { name: categoryLabel }));
};

const completeStep0 = (
  purpose = DEFAULT_PURPOSE,
  categoryLabel = DEFAULT_CATEGORY,
) => {
  enterPurpose(purpose);
  selectCategory(categoryLabel);
};

const advanceToConfigure = (
  purpose = DEFAULT_PURPOSE,
  categoryLabel = DEFAULT_CATEGORY,
) => {
  completeStep0(purpose, categoryLabel);
  fireEvent.click(screen.getByRole("button", { name: "次へ" }));
};

describe("SkillCreateWizard", () => {
  let mockOnClose: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
    mockOnClose = vi.fn();
    mockCreateSkill.mockResolvedValue("/path/to/new-skill");
    mockUseWorkflowSnapshot.mockReturnValue(null);
  });

  describe("初期表示", () => {
    it("Step 0（スキル情報）が最初に表示される", () => {
      render(<SkillCreateWizard onClose={mockOnClose} />);

      expect(screen.getByLabelText(/スキル名/)).toBeInTheDocument();
      expect(screen.getByLabelText(/目的・背景/)).toBeInTheDocument();
      expect(
        screen.getByRole("group", { name: "カテゴリを選択" }),
      ).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "次へ" })).toBeDisabled();
    });

    it("StepIndicator が表示される", () => {
      render(<SkillCreateWizard onClose={mockOnClose} />);

      const nav = screen.getByRole("navigation");
      expect(nav).toBeInTheDocument();
      expect(nav).toHaveAttribute("aria-label", "ウィザードの進捗");
    });

    it("root 要素が destination route として描画される", () => {
      render(<SkillCreateWizard onClose={mockOnClose} />);

      expect(screen.getByTestId("skill-create-wizard")).toHaveAttribute(
        "data-route-kind",
        "destination",
      );
    });

    it("workflowSnapshot に warningNote がある場合は mainline summary を表示する", () => {
      mockUseWorkflowSnapshot.mockReturnValue({
        sourceProvenance: {
          warningNote: "複数候補から選定しました",
        },
      });

      render(<SkillCreateWizard onClose={mockOnClose} />);

      const summary = screen.getByTestId("provenance-warning-summary");
      expect(summary).toHaveTextContent("複数候補から選定しました");
      expect(summary).toHaveAttribute("data-route-kind", "mainline-summary");
    });
  });

  describe("ステップ遷移", () => {
    it("Step 0 で目的とカテゴリを入力すると Step 2（設定）に遷移する", () => {
      render(<SkillCreateWizard onClose={mockOnClose} />);

      advanceToConfigure();

      expect(screen.getByText("タスク生成")).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "戻る" })).toBeInTheDocument();
    });

    it("Step 2 で「戻る」クリックで Step 0 に戻る", () => {
      render(<SkillCreateWizard onClose={mockOnClose} />);

      advanceToConfigure();
      fireEvent.click(screen.getByRole("button", { name: "戻る" }));

      expect(screen.getByLabelText(/目的・背景/)).toHaveValue(DEFAULT_PURPOSE);
      expect(
        screen.getByRole("button", { name: DEFAULT_CATEGORY }),
      ).toHaveAttribute("aria-pressed", "true");
      expect(screen.getByRole("button", { name: "次へ" })).toBeEnabled();
    });

    it("Step 2 で「スキルを生成」クリックで store action が呼ばれる", async () => {
      render(<SkillCreateWizard onClose={mockOnClose} />);

      advanceToConfigure();
      await act(async () => {
        fireEvent.click(screen.getByRole("button", { name: "スキルを生成" }));
      });

      expect(mockCreateSkill).toHaveBeenCalledTimes(1);
    });

    it("store action 成功後に Step 4（完了）に遷移する", async () => {
      render(<SkillCreateWizard onClose={mockOnClose} />);

      advanceToConfigure();
      await act(async () => {
        fireEvent.click(screen.getByRole("button", { name: "スキルを生成" }));
      });
      await act(async () => {
        await mockCreateSkill.mock.results[0]?.value;
      });

      expect(screen.getByText("スキルが作成されました")).toBeInTheDocument();
      expect(screen.getByText("/path/to/new-skill")).toBeInTheDocument();
    });

    it("CompleteStep の「閉じる」で onClose が呼ばれる", async () => {
      render(<SkillCreateWizard onClose={mockOnClose} />);

      advanceToConfigure();
      await act(async () => {
        fireEvent.click(screen.getByRole("button", { name: "スキルを生成" }));
      });
      await act(async () => {
        await mockCreateSkill.mock.results[0]?.value;
      });

      fireEvent.click(screen.getByRole("button", { name: "閉じる" }));
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });
  });

  describe("IPC / Store 呼び出し", () => {
    it("createSkill が description と options を正しく受け取る", async () => {
      render(<SkillCreateWizard onClose={mockOnClose} />);

      const purpose = "テスト説明テスト説明";
      advanceToConfigure(purpose);

      await act(async () => {
        fireEvent.click(screen.getByRole("button", { name: "スキルを生成" }));
      });

      expect(mockCreateSkill).toHaveBeenCalledWith(purpose, {
        generateTasks: true,
        addAgents: false,
        addReferences: false,
      });
    });

    it("createSkill 失敗時にエラーカードが表示される", async () => {
      mockCreateSkill.mockRejectedValue(new Error("生成失敗"));

      render(<SkillCreateWizard onClose={mockOnClose} />);

      advanceToConfigure();
      await act(async () => {
        fireEvent.click(screen.getByRole("button", { name: "スキルを生成" }));
      });

      expect(screen.getByRole("alert")).toBeInTheDocument();
      expect(screen.getByText("生成失敗")).toBeInTheDocument();
    });

    it("createSkill 失敗時に Error 以外の値でもフォールバックメッセージが表示される", async () => {
      mockCreateSkill.mockRejectedValue("unknown error");

      render(<SkillCreateWizard onClose={mockOnClose} />);

      advanceToConfigure();
      await act(async () => {
        fireEvent.click(screen.getByRole("button", { name: "スキルを生成" }));
      });

      expect(screen.getByRole("alert")).toBeInTheDocument();
      expect(screen.getByText("スキル生成に失敗しました")).toBeInTheDocument();
    });
  });

  describe("バリデーション", () => {
    it("目的が空のとき「次へ」ボタンが disabled", () => {
      render(<SkillCreateWizard onClose={mockOnClose} />);

      expect(screen.getByRole("button", { name: "次へ" })).toBeDisabled();
    });

    it("目的を入力してもカテゴリ未選択なら「次へ」ボタンは disabled", () => {
      render(<SkillCreateWizard onClose={mockOnClose} />);

      // purpose は 10 文字以上にし、category の未選択だけを原因にする
      enterPurpose("入力テスト入力テスト");
      expect(screen.getByRole("button", { name: "次へ" })).toBeDisabled();
    });

    it("目的とカテゴリを入力すると「次へ」ボタンが enabled になる", () => {
      render(<SkillCreateWizard onClose={mockOnClose} />);

      completeStep0("入力テスト入力テスト");
      expect(screen.getByRole("button", { name: "次へ" })).toBeEnabled();
    });

    it("スペースのみの入力では「次へ」ボタンが disabled のまま", () => {
      render(<SkillCreateWizard onClose={mockOnClose} />);

      enterPurpose("   ");
      selectCategory();
      expect(screen.getByRole("button", { name: "次へ" })).toBeDisabled();
    });
  });

  describe("状態保持", () => {
    it("Step 2 から Step 0 に戻った際に入力した目的とカテゴリが保持される", () => {
      render(<SkillCreateWizard onClose={mockOnClose} />);

      advanceToConfigure("保持テスト用の十分長い目的");
      fireEvent.click(screen.getByRole("button", { name: "戻る" }));

      expect(screen.getByLabelText(/目的・背景/)).toHaveValue(
        "保持テスト用の十分長い目的",
      );
      expect(
        screen.getByRole("button", { name: DEFAULT_CATEGORY }),
      ).toHaveAttribute("aria-pressed", "true");
    });
  });

  describe("オプション設定フロー", () => {
    it("Step 2 でオプションを変更して生成すると正しいオプションが IPC に渡される", async () => {
      render(<SkillCreateWizard onClose={mockOnClose} />);

      const purpose = "オプション検証用の十分長い目的";
      advanceToConfigure(purpose);

      const checkboxes = screen.getAllByRole("checkbox");
      fireEvent.click(checkboxes[0]);

      await act(async () => {
        fireEvent.click(screen.getByRole("button", { name: "スキルを生成" }));
      });

      expect(mockCreateSkill).toHaveBeenCalledWith(purpose, {
        generateTasks: false,
        addAgents: false,
        addReferences: false,
      });
    });

    it("全オプション ON で生成しても IPC が呼ばれる", async () => {
      render(<SkillCreateWizard onClose={mockOnClose} />);

      advanceToConfigure("オプション検証用の十分長い目的");

      const checkboxes = screen.getAllByRole("checkbox");
      fireEvent.click(checkboxes[1]);
      fireEvent.click(checkboxes[2]);

      await act(async () => {
        fireEvent.click(screen.getByRole("button", { name: "スキルを生成" }));
      });

      expect(mockCreateSkill).toHaveBeenCalledTimes(1);
    });
  });

  describe("useCreateSkill 安定参照", () => {
    it("useCreateSkill が複数レンダー間で同一参照を返す", () => {
      const refs: Array<ReturnType<typeof useCreateSkill>> = [];

      const TestComponent = () => {
        const createSkillFn = useCreateSkill();
        refs.push(createSkillFn);
        return null;
      };

      const { rerender } = render(<TestComponent />);
      rerender(<TestComponent />);
      rerender(<TestComponent />);

      expect(refs.length).toBeGreaterThanOrEqual(3);
      expect(refs[0]).toBe(refs[1]);
      expect(refs[1]).toBe(refs[2]);
    });

    it("useCreateSkill の参照変化が useEffect 無限ループを引き起こさない", () => {
      let effectRunCount = 0;

      const TestComponent = () => {
        const createSkillFn = useCreateSkill();

        React.useEffect(() => {
          effectRunCount++;
        }, [createSkillFn]);

        return <div data-testid="p31-test" />;
      };

      render(<TestComponent />);
      expect(effectRunCount).toBeLessThanOrEqual(2);
    });
  });
});
