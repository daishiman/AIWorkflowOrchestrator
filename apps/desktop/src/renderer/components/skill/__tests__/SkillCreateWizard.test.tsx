/**
 * @file SkillCreateWizard.test.tsx
 * @description SkillCreateWizard 統合コンポーネント ユニットテスト
 * @phase Phase 4: テスト作成（TDD: Red -> Green）
 * @task TASK-10A-C, TASK-10A-F (Store統合)
 *
 * W2-seq-03a 更新:
 * - Step 0: DescribeStep → SkillInfoStep（purpose 10文字以上 + category 必須）
 * - 「閉じる」ボタン → 「今すぐ実行する」ボタン
 * - getByRole("textbox") を { name: /目的/ } で特定
 *
 * P39準拠: fireEventのみ使用（happy-dom環境でuserEvent禁止）
 * P9準拠: beforeEachで状態リセット
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { SkillCreateWizard } from "../SkillCreateWizard";

// Store セレクタモック
const mockCreateSkill = vi.fn();
const mockExecuteSkill = vi.fn();
const mockSelectSkillByName = vi.fn();
const mockSetCurrentView = vi.fn();
const mockSetCurrentSkillName = vi.fn();
const mockUseWorkflowSnapshot = vi.fn(() => null);

vi.mock("../../../store", () => ({
  useCreateSkill: () => mockCreateSkill,
  useExecuteSkill: () => mockExecuteSkill,
  useSelectSkillByName: () => mockSelectSkillByName,
  useSetCurrentView: () => mockSetCurrentView,
  useSetCurrentSkillName: () => mockSetCurrentSkillName,
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

// ── テストヘルパー ──────────────────────────────────────────────────────────────

/**
 * Step 0 (SkillInfoStep) から Step 1 (ConversationRoundStep) へ遷移するヘルパー。
 * SkillInfoStep は purpose(10文字以上) + category 選択が必要。
 */
function navigateToStep1(
  purpose = "テストスキルの説明文",
  category = "自動化",
) {
  fireEvent.change(screen.getByRole("textbox", { name: /目的/ }), {
    target: { value: purpose },
  });
  fireEvent.click(screen.getByRole("button", { name: category }));
  fireEvent.click(screen.getByRole("button", { name: "次へ" }));
}

describe("SkillCreateWizard", () => {
  let mockOnClose: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
    mockOnClose = vi.fn();
    mockCreateSkill.mockResolvedValue("/mock/skills/new-skill");
    mockUseWorkflowSnapshot.mockReturnValue(null);
  });

  // ============================================================
  // 初期表示
  // ============================================================
  describe("初期表示", () => {
    it("Step 0（スキル情報入力）が最初に表示される", () => {
      render(<SkillCreateWizard onClose={mockOnClose} />);

      expect(screen.getByTestId("wizard-step-info")).toBeInTheDocument();
      expect(screen.getByText("目的・背景")).toBeInTheDocument();
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

  // ============================================================
  // ステップ遷移
  // ============================================================
  describe("ステップ遷移", () => {
    it("スキル情報入力後「次へ」クリックで Step 1（ConversationRoundStep）に遷移する", () => {
      render(<SkillCreateWizard onClose={mockOnClose} />);

      navigateToStep1();

      expect(
        screen.getByRole("button", { name: "今すぐ生成する" }),
      ).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "戻る" })).toBeInTheDocument();
    });

    it("カテゴリを external-integration にすると Step 1 で Q5 必須表示が出る", () => {
      render(<SkillCreateWizard onClose={mockOnClose} />);

      navigateToStep1("Slack に毎日通知するための目的説明", "外部連携");

      fireEvent.click(screen.getByRole("button", { name: "次のページ" }));

      expect(screen.getByText(/Q5.*必須|必須.*Q5/)).toBeInTheDocument();
    });

    it("Step 1 で「戻る」クリックで Step 0 に戻る", () => {
      render(<SkillCreateWizard onClose={mockOnClose} />);

      navigateToStep1();

      fireEvent.click(screen.getByRole("button", { name: "戻る" }));

      expect(screen.getByTestId("wizard-step-info")).toBeInTheDocument();
      expect(screen.getByText("目的・背景")).toBeInTheDocument();
    });

    it("Step 1 で「今すぐ生成する」→「生成する」クリックで IPC が呼ばれる", async () => {
      render(<SkillCreateWizard onClose={mockOnClose} />);

      navigateToStep1();

      fireEvent.click(screen.getByRole("button", { name: "今すぐ生成する" }));
      await act(async () => {
        fireEvent.click(screen.getByRole("button", { name: "生成する" }));
      });

      expect(mockCreateSkill).toHaveBeenCalledTimes(1);
    });

    it("IPC 成功後に Step 3（完了）に遷移する", async () => {
      render(<SkillCreateWizard onClose={mockOnClose} />);

      navigateToStep1();

      fireEvent.click(screen.getByRole("button", { name: "今すぐ生成する" }));
      await act(async () => {
        fireEvent.click(screen.getByRole("button", { name: "生成する" }));
      });
      await act(async () => {
        await mockCreateSkill.mock.results[0]?.value;
      });

      expect(screen.getByTestId("wizard-step-complete")).toBeInTheDocument();
      expect(screen.getByTestId("complete-step-header")).toBeInTheDocument();
    });

    it("CompleteStep の「別のスキルを作る」で Step 0 にリセットされる", async () => {
      render(<SkillCreateWizard onClose={mockOnClose} />);

      navigateToStep1();

      fireEvent.click(screen.getByRole("button", { name: "今すぐ生成する" }));
      await act(async () => {
        fireEvent.click(screen.getByRole("button", { name: "生成する" }));
      });
      await act(async () => {
        await mockCreateSkill.mock.results[0]?.value;
      });

      fireEvent.click(
        screen.getByTestId("complete-step-action-create-another"),
      );
      expect(screen.getByTestId("wizard-step-info")).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "次へ" })).toBeDisabled();
      expect(mockOnClose).not.toHaveBeenCalled();
    });
  });

  // ============================================================
  // IPC 呼び出し
  // ============================================================
  describe("IPC 呼び出し", () => {
    it("skill.create が purpose と options を正しく渡して呼ばれる", async () => {
      render(<SkillCreateWizard onClose={mockOnClose} />);

      const purpose = "このスキルの目的と説明文";
      navigateToStep1(purpose);

      fireEvent.click(screen.getByRole("button", { name: "今すぐ生成する" }));
      await act(async () => {
        fireEvent.click(screen.getByRole("button", { name: "生成する" }));
      });

      expect(mockCreateSkill).toHaveBeenCalledWith(purpose, {
        generateTasks: true,
        addAgents: false,
        addReferences: false,
      });
    });

    it("IPC 失敗時にエラーカードが表示される", async () => {
      mockCreateSkill.mockRejectedValue(new Error("生成失敗"));

      render(<SkillCreateWizard onClose={mockOnClose} />);

      navigateToStep1();

      fireEvent.click(screen.getByRole("button", { name: "今すぐ生成する" }));
      await act(async () => {
        fireEvent.click(screen.getByRole("button", { name: "生成する" }));
      });
      await act(async () => {
        try {
          await mockCreateSkill.mock.results[0]?.value;
        } catch {
          // 期待されるエラー
        }
      });

      expect(screen.getByRole("alert")).toBeInTheDocument();
      expect(screen.getByText("生成失敗")).toBeInTheDocument();
    });

    it("IPC 失敗時に Error 以外のオブジェクトでもフォールバックメッセージが表示される", async () => {
      mockCreateSkill.mockRejectedValue("unknown error");

      render(<SkillCreateWizard onClose={mockOnClose} />);

      navigateToStep1();

      fireEvent.click(screen.getByRole("button", { name: "今すぐ生成する" }));
      await act(async () => {
        fireEvent.click(screen.getByRole("button", { name: "生成する" }));
      });
      await act(async () => {
        try {
          await mockCreateSkill.mock.results[0]?.value;
        } catch {
          // 期待されるエラー
        }
      });

      expect(screen.getByRole("alert")).toBeInTheDocument();
      expect(screen.getByText("スキル生成に失敗しました")).toBeInTheDocument();
    });
  });

  // ============================================================
  // モーダル制御
  // ============================================================
  describe("モーダル制御", () => {
    it("Step 3 で「今すぐ実行する」クリックで onClose が呼ばれる", async () => {
      render(<SkillCreateWizard onClose={mockOnClose} />);

      navigateToStep1();

      fireEvent.click(screen.getByRole("button", { name: "今すぐ生成する" }));
      await act(async () => {
        fireEvent.click(screen.getByRole("button", { name: "生成する" }));
      });
      await act(async () => {
        await mockCreateSkill.mock.results[0]?.value;
      });

      fireEvent.click(screen.getByTestId("complete-step-action-execute"));
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });
  });

  // ============================================================
  // バリデーション
  // ============================================================
  describe("バリデーション", () => {
    it("初期状態で「次へ」ボタンが disabled", () => {
      render(<SkillCreateWizard onClose={mockOnClose} />);

      const button = screen.getByRole("button", { name: "次へ" });
      expect(button).toBeDisabled();
    });

    it("目的を10文字以上入力してカテゴリを選択すると「次へ」ボタンが enabled になる", () => {
      render(<SkillCreateWizard onClose={mockOnClose} />);

      fireEvent.change(screen.getByRole("textbox", { name: /目的/ }), {
        target: { value: "テストスキルの説明文" }, // 10文字
      });
      fireEvent.click(screen.getByRole("button", { name: "自動化" }));

      const button = screen.getByRole("button", { name: "次へ" });
      expect(button).toBeEnabled();
    });

    it("スペースのみの入力では「次へ」ボタンが disabled のまま", () => {
      render(<SkillCreateWizard onClose={mockOnClose} />);

      fireEvent.change(screen.getByRole("textbox", { name: /目的/ }), {
        target: { value: "   " },
      });

      const button = screen.getByRole("button", { name: "次へ" });
      expect(button).toBeDisabled();
    });
  });

  // ============================================================
  // 状態保持
  // ============================================================
  describe("状態保持", () => {
    it("Step 1 から Step 0 に戻った際に入力した目的が保持される", () => {
      render(<SkillCreateWizard onClose={mockOnClose} />);

      const purpose = "保持テストの入力データ";
      navigateToStep1(purpose);

      fireEvent.click(screen.getByRole("button", { name: "戻る" }));

      const textarea = screen.getByRole("textbox", {
        name: /目的/,
      }) as HTMLTextAreaElement;
      expect(textarea.value).toBe(purpose);
    });
  });

  // ============================================================
  // オプション設定フロー（SKILL_GENERATION_OPTIONS 固定）
  // ============================================================
  describe("オプション設定フロー", () => {
    it("生成すると固定 SKILL_GENERATION_OPTIONS が IPC に渡される", async () => {
      render(<SkillCreateWizard onClose={mockOnClose} />);

      navigateToStep1("テストスキルの説明文");

      fireEvent.click(screen.getByRole("button", { name: "今すぐ生成する" }));
      await act(async () => {
        fireEvent.click(screen.getByRole("button", { name: "生成する" }));
      });

      expect(mockCreateSkill).toHaveBeenCalledWith("テストスキルの説明文", {
        generateTasks: true,
        addAgents: false,
        addReferences: false,
      });
    });

    it("「今すぐ生成する」→「生成する」で IPC が呼ばれる", async () => {
      render(<SkillCreateWizard onClose={mockOnClose} />);

      navigateToStep1();

      fireEvent.click(screen.getByRole("button", { name: "今すぐ生成する" }));
      await act(async () => {
        fireEvent.click(screen.getByRole("button", { name: "生成する" }));
      });

      expect(mockCreateSkill).toHaveBeenCalledTimes(1);
    });
  });

  // ============================================================
  // 境界値・異常系テスト
  // ============================================================
  describe("境界値・異常系テスト", () => {
    it("TC-CW-S01: 生成中（isGenerating=true）にプログレスバーとステップ表示がされる", async () => {
      let resolvePromise: (value: string) => void;
      mockCreateSkill.mockReturnValue(
        new Promise<string>((resolve) => {
          resolvePromise = resolve;
        }),
      );

      render(<SkillCreateWizard onClose={mockOnClose} />);

      navigateToStep1();

      fireEvent.click(screen.getByRole("button", { name: "今すぐ生成する" }));
      await act(async () => {
        fireEvent.click(screen.getByRole("button", { name: "生成する" }));
      });

      // GenerateStep が表示される
      expect(screen.getByRole("progressbar")).toBeInTheDocument();
      expect(
        screen.getByText("スキルの構造を計画しています..."),
      ).toBeInTheDocument();

      await act(async () => {
        resolvePromise!("/path/to/skill");
      });
    });
  });

  // ============================================================
  // IPC パラメータ詳細検証
  // ============================================================
  describe("IPC パラメータ詳細検証", () => {
    it("skill.create が1回だけ呼ばれる（重複呼び出しなし）", async () => {
      render(<SkillCreateWizard onClose={mockOnClose} />);

      navigateToStep1();

      fireEvent.click(screen.getByRole("button", { name: "今すぐ生成する" }));
      await act(async () => {
        fireEvent.click(screen.getByRole("button", { name: "生成する" }));
      });

      expect(mockCreateSkill).toHaveBeenCalledTimes(1);
    });

    it("IPC 完了後に CompleteStep へ遷移する（新設計: パスは UI 非表示）", async () => {
      mockCreateSkill.mockResolvedValue("/custom/generated/path");

      render(<SkillCreateWizard onClose={mockOnClose} />);

      navigateToStep1();

      fireEvent.click(screen.getByRole("button", { name: "今すぐ生成する" }));
      await act(async () => {
        fireEvent.click(screen.getByRole("button", { name: "生成する" }));
      });
      await act(async () => {
        await mockCreateSkill.mock.results[0]?.value;
      });

      // 新設計: generatedSkill は親コンテキスト用のため UI には表示しない
      expect(screen.getByTestId("complete-step-header")).toBeInTheDocument();
      expect(
        screen.queryByText("/custom/generated/path"),
      ).not.toBeInTheDocument();
    });
  });
});
