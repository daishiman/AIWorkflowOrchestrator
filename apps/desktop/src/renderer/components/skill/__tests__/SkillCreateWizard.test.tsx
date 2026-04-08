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

// Store セレクタモック（TASK-10A-F: Store action経由に統一）
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
  // TASK-SC-07: LLM generation hooks (テンプレートフロー非破壊テスト用)
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
    it("Step 1（説明入力）が最初に表示される", () => {
      render(<SkillCreateWizard onClose={mockOnClose} />);

      expect(screen.getByLabelText(/目的/)).toBeInTheDocument();
      expect(screen.getByRole("textbox", { name: /目的/ })).toBeInTheDocument();
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
    it("説明入力後「次へ」クリックで Step 2（ConversationRoundStep）に遷移する", () => {
      render(<SkillCreateWizard onClose={mockOnClose} />);

      fireEvent.change(screen.getByRole("textbox", { name: /目的/ }), {
        target: { value: "テストスキルの詳細な説明文" },
      });
      fireEvent.click(screen.getByRole("button", { name: "自動化" }));
      fireEvent.click(screen.getByRole("button", { name: "次へ" }));

      expect(
        screen.getByRole("button", { name: "今すぐ生成する" }),
      ).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "戻る" })).toBeInTheDocument();
    });

    it("カテゴリを external-integration にすると Step 2 で Q5 必須表示が出る", () => {
      render(<SkillCreateWizard onClose={mockOnClose} />);

      fireEvent.change(screen.getByRole("textbox", { name: /目的/ }), {
        target: { value: "Slack に毎日通知する" },
      });
      fireEvent.click(screen.getByRole("button", { name: "外部連携" }));
      fireEvent.click(screen.getByRole("button", { name: "次へ" }));

      // Page 2 へ進む
      fireEvent.click(screen.getByRole("button", { name: "次のページ" }));

      expect(screen.getByText(/Q5.*必須|必須.*Q5/)).toBeInTheDocument();
    });

    it("Step 2 で「戻る」クリックで Step 1 に戻る", () => {
      render(<SkillCreateWizard onClose={mockOnClose} />);

      // Step 1 -> Step 2
      fireEvent.change(screen.getByRole("textbox", { name: /目的/ }), {
        target: { value: "テストスキルの詳細な説明文" },
      });
      fireEvent.click(screen.getByRole("button", { name: "自動化" }));
      fireEvent.click(screen.getByRole("button", { name: "次へ" }));

      // Step 2 -> Step 1
      fireEvent.click(screen.getByRole("button", { name: "戻る" }));

      expect(screen.getByRole("textbox", { name: /目的/ })).toBeInTheDocument();
      expect(screen.getByLabelText(/目的/)).toBeInTheDocument();
    });

    it("Step 2 で「今すぐ生成する」→「生成する」クリックで IPC が呼ばれる", async () => {
      render(<SkillCreateWizard onClose={mockOnClose} />);

      // Step 1 -> Step 2
      fireEvent.change(screen.getByRole("textbox", { name: /目的/ }), {
        target: { value: "テストスキルの詳細な説明文" },
      });
      fireEvent.click(screen.getByRole("button", { name: "自動化" }));
      fireEvent.click(screen.getByRole("button", { name: "次へ" }));

      // Step 2 -> 生成
      fireEvent.click(screen.getByRole("button", { name: "今すぐ生成する" }));
      await act(async () => {
        fireEvent.click(screen.getByRole("button", { name: "生成する" }));
      });

      expect(mockCreateSkill).toHaveBeenCalledTimes(1);
    });

    it("IPC 成功後に Step 4（完了）に遷移する", async () => {
      render(<SkillCreateWizard onClose={mockOnClose} />);

      // Step 1 -> Step 2
      fireEvent.change(screen.getByRole("textbox", { name: /目的/ }), {
        target: { value: "テストスキルの詳細な説明文" },
      });
      fireEvent.click(screen.getByRole("button", { name: "自動化" }));
      fireEvent.click(screen.getByRole("button", { name: "次へ" }));

      // Step 2 -> 生成 -> 完了
      fireEvent.click(screen.getByRole("button", { name: "今すぐ生成する" }));
      await act(async () => {
        fireEvent.click(screen.getByRole("button", { name: "生成する" }));
      });
      await act(async () => {
        await mockCreateSkill.mock.results[0]?.value;
      });

      expect(screen.getByTestId("complete-step-header")).toBeInTheDocument();
      expect(
        screen.getByText("スキルの骨格を生成しました"),
      ).toBeInTheDocument();
      expect(
        screen.getByTestId("complete-step-action-execute"),
      ).toBeInTheDocument();
      expect(
        screen.getByTestId("complete-step-action-open-editor"),
      ).toBeInTheDocument();
      expect(
        screen.getByTestId("complete-step-feedback-satisfied"),
      ).toBeInTheDocument();
    });

    it("CompleteStep の「別のスキルを作る」で Step 0 にリセットされる", async () => {
      render(<SkillCreateWizard onClose={mockOnClose} />);

      // Step 1 -> Step 2
      fireEvent.change(screen.getByRole("textbox", { name: /目的/ }), {
        target: { value: "テストスキルの詳細な説明文" },
      });
      fireEvent.click(screen.getByRole("button", { name: "自動化" }));
      fireEvent.click(screen.getByRole("button", { name: "次へ" }));

      // Step 2 -> 生成 -> 完了
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
      expect(screen.getByRole("textbox", { name: /目的/ })).toHaveValue("");
      expect(screen.getByRole("button", { name: "次へ" })).toBeDisabled();
      expect(mockOnClose).not.toHaveBeenCalled();
    });
  });

  // ============================================================
  // IPC 呼び出し
  // ============================================================
  describe("IPC 呼び出し", () => {
    it("skill.create が description と options を正しく渡して呼ばれる", async () => {
      render(<SkillCreateWizard onClose={mockOnClose} />);

      // Step 1 -> Step 2
      fireEvent.change(screen.getByRole("textbox", { name: /目的/ }), {
        target: { value: "テストスキルの詳細な説明文" },
      });
      fireEvent.click(screen.getByRole("button", { name: "自動化" }));
      fireEvent.click(screen.getByRole("button", { name: "次へ" }));

      // Step 2 -> 生成
      fireEvent.click(screen.getByRole("button", { name: "今すぐ生成する" }));
      await act(async () => {
        fireEvent.click(screen.getByRole("button", { name: "生成する" }));
      });

      expect(mockCreateSkill).toHaveBeenCalledWith(
        "テストスキルの詳細な説明文",
        {
          generateTasks: true,
          addAgents: false,
          addReferences: false,
        },
      );
    });

    it("IPC 失敗時にエラーカードが表示される", async () => {
      mockCreateSkill.mockRejectedValue(new Error("生成失敗"));

      render(<SkillCreateWizard onClose={mockOnClose} />);

      // Step 1 -> Step 2
      fireEvent.change(screen.getByRole("textbox", { name: /目的/ }), {
        target: { value: "テストスキルの詳細な説明文" },
      });
      fireEvent.click(screen.getByRole("button", { name: "自動化" }));
      fireEvent.click(screen.getByRole("button", { name: "次へ" }));

      // Step 2 -> 生成（失敗）
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

      // Step 1 -> Step 2
      fireEvent.change(screen.getByRole("textbox", { name: /目的/ }), {
        target: { value: "テストスキルの詳細な説明文" },
      });
      fireEvent.click(screen.getByRole("button", { name: "自動化" }));
      fireEvent.click(screen.getByRole("button", { name: "次へ" }));

      // Step 2 -> 生成（失敗）
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
    it("Step 4 で CompleteStep が表示される（新設計: 閉じるボタンなし）", async () => {
      render(<SkillCreateWizard onClose={mockOnClose} />);

      // Step 1 -> Step 2
      fireEvent.change(screen.getByRole("textbox", { name: /目的/ }), {
        target: { value: "テストスキルの詳細な説明文" },
      });
      fireEvent.click(screen.getByRole("button", { name: "自動化" }));
      fireEvent.click(screen.getByRole("button", { name: "次へ" }));

      // Step 2 -> 生成 -> 完了
      fireEvent.click(screen.getByRole("button", { name: "今すぐ生成する" }));
      await act(async () => {
        fireEvent.click(screen.getByRole("button", { name: "生成する" }));
      });
      await act(async () => {
        await mockCreateSkill.mock.results[0]?.value;
      });

      // Step 4: CompleteStep が表示される（新設計では閉じるボタンなし）
      expect(screen.getByTestId("wizard-step-complete")).toBeInTheDocument();
      expect(screen.getByTestId("complete-step-header")).toBeInTheDocument();
    });
  });

  // ============================================================
  // バリデーション
  // ============================================================
  describe("バリデーション", () => {
    it("説明が空のとき「次へ」ボタンが disabled", () => {
      render(<SkillCreateWizard onClose={mockOnClose} />);

      const button = screen.getByRole("button", { name: "次へ" });
      expect(button).toBeDisabled();
    });

    it("説明を入力すると「次へ」ボタンが enabled になる", () => {
      render(<SkillCreateWizard onClose={mockOnClose} />);

      fireEvent.change(screen.getByRole("textbox", { name: /目的/ }), {
        target: { value: "入力テストの詳細説明文" },
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
  // Step 1 に戻った際の状態保持
  // ============================================================
  describe("状態保持", () => {
    it("Step 2 から Step 1 に戻った際に入力した説明が保持される", () => {
      render(<SkillCreateWizard onClose={mockOnClose} />);

      // Step 1: 説明入力
      fireEvent.change(screen.getByRole("textbox", { name: /目的/ }), {
        target: { value: "保持テストの詳細説明文" },
      });
      fireEvent.click(screen.getByRole("button", { name: "自動化" }));
      fireEvent.click(screen.getByRole("button", { name: "次へ" }));

      // Step 2 -> Step 1
      fireEvent.click(screen.getByRole("button", { name: "戻る" }));

      const textarea = screen.getByRole("textbox", {
        name: /目的/,
      }) as HTMLTextAreaElement;
      expect(textarea.value).toBe("保持テストの詳細説明文");
    });
  });

  // ============================================================
  // Phase 6: オプション設定フロー（TEMPLATE_OPTIONS 固定）
  // ============================================================
  describe("オプション設定フロー", () => {
    it("生成すると固定 TEMPLATE_OPTIONS が IPC に渡される", async () => {
      render(<SkillCreateWizard onClose={mockOnClose} />);

      // Step 1 -> Step 2
      fireEvent.change(screen.getByRole("textbox", { name: /目的/ }), {
        target: { value: "テストスキルの詳細な説明文" },
      });
      fireEvent.click(screen.getByRole("button", { name: "自動化" }));
      fireEvent.click(screen.getByRole("button", { name: "次へ" }));

      fireEvent.click(screen.getByRole("button", { name: "今すぐ生成する" }));
      await act(async () => {
        fireEvent.click(screen.getByRole("button", { name: "生成する" }));
      });

      expect(mockCreateSkill).toHaveBeenCalledWith(
        "テストスキルの詳細な説明文",
        {
          generateTasks: true,
          addAgents: false,
          addReferences: false,
        },
      );
    });

    it("「今すぐ生成する」→「生成する」で IPC が呼ばれる", async () => {
      render(<SkillCreateWizard onClose={mockOnClose} />);

      // Step 1 -> Step 2
      fireEvent.change(screen.getByRole("textbox", { name: /目的/ }), {
        target: { value: "テストスキルの詳細な説明文" },
      });
      fireEvent.click(screen.getByRole("button", { name: "自動化" }));
      fireEvent.click(screen.getByRole("button", { name: "次へ" }));

      fireEvent.click(screen.getByRole("button", { name: "今すぐ生成する" }));
      await act(async () => {
        fireEvent.click(screen.getByRole("button", { name: "生成する" }));
      });

      expect(mockCreateSkill).toHaveBeenCalledTimes(1);
    });
  });

  // ============================================================
  // Phase 6: 境界値・異常系テスト
  // ============================================================
  describe("境界値・異常系テスト", () => {
    it("TC-CW-S01: 生成中（isGenerating=true）にプログレスバーとステップ表示がされる", async () => {
      // createSkill を解決しないまま保留して isGenerating=true 状態をキャプチャ
      let resolvePromise: (value: string) => void;
      mockCreateSkill.mockReturnValue(
        new Promise<string>((resolve) => {
          resolvePromise = resolve;
        }),
      );

      render(<SkillCreateWizard onClose={mockOnClose} />);

      // Step 1 -> Step 2
      fireEvent.change(screen.getByRole("textbox", { name: /目的/ }), {
        target: { value: "テストスキルの詳細な説明文" },
      });
      fireEvent.click(screen.getByRole("button", { name: "自動化" }));
      fireEvent.click(screen.getByRole("button", { name: "次へ" }));

      // Step 2 -> 生成開始（Promiseは未解決のまま）
      fireEvent.click(screen.getByRole("button", { name: "今すぐ生成する" }));
      await act(async () => {
        fireEvent.click(screen.getByRole("button", { name: "生成する" }));
      });

      // GenerateStep が表示される（ストリーミング idle + isGenerating=true → planning ステージ）
      expect(screen.getByRole("progressbar")).toBeInTheDocument();
      expect(
        screen.getByText("スキルの構造を計画しています..."),
      ).toBeInTheDocument();

      // テスト終了のためPromiseを解決
      await act(async () => {
        resolvePromise!("/path/to/skill");
      });
    });
  });

  // ============================================================
  // Phase 6: IPC パラメータ詳細検証
  // ============================================================
  describe("IPC パラメータ詳細検証", () => {
    it("skill.create が1回だけ呼ばれる（重複呼び出しなし）", async () => {
      render(<SkillCreateWizard onClose={mockOnClose} />);

      // Step 1 -> Step 2
      fireEvent.change(screen.getByRole("textbox", { name: /目的/ }), {
        target: { value: "テストスキルの詳細な説明文" },
      });
      fireEvent.click(screen.getByRole("button", { name: "自動化" }));
      fireEvent.click(screen.getByRole("button", { name: "次へ" }));

      fireEvent.click(screen.getByRole("button", { name: "今すぐ生成する" }));
      await act(async () => {
        fireEvent.click(screen.getByRole("button", { name: "生成する" }));
      });

      expect(mockCreateSkill).toHaveBeenCalledTimes(1);
    });

    it("IPC 完了後に CompleteStep へ遷移し skillPath が表示される", async () => {
      mockCreateSkill.mockResolvedValue("/custom/generated/path");

      render(<SkillCreateWizard onClose={mockOnClose} />);

      // Step 1 -> Step 2 -> 生成 -> 完了
      fireEvent.change(screen.getByRole("textbox", { name: /目的/ }), {
        target: { value: "テストスキルの詳細な説明文" },
      });
      fireEvent.click(screen.getByRole("button", { name: "自動化" }));
      fireEvent.click(screen.getByRole("button", { name: "次へ" }));

      fireEvent.click(screen.getByRole("button", { name: "今すぐ生成する" }));
      await act(async () => {
        fireEvent.click(screen.getByRole("button", { name: "生成する" }));
      });
      await act(async () => {
        await mockCreateSkill.mock.results[0]?.value;
      });

      expect(screen.getByTestId("complete-step-header")).toBeInTheDocument();
      expect(screen.getByTestId("complete-step-skill-path")).toHaveTextContent(
        "/custom/generated/path",
      );
    });
  });
});
