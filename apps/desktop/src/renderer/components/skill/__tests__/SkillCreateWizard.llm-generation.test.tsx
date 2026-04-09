/**
 * @vitest-environment happy-dom
 * @file SkillCreateWizard.llm-generation.test.tsx
 * @description SkillCreateWizard LLM 生成フロー統合テスト
 * @phase Phase 4: テスト作成（TDD: Red -> Green）
 * @task TASK-SC-07
 *
 * AC-2: LLM選択 -> planSkill 呼出
 * AC-4: executePlan -> CompleteStep 遷移
 * AC-5: キャンセル -> DescribeStep 戻り
 * AC-8: テンプレートフロー非破壊
 * AC-9: PlanResult Single Source of Truth
 * AC-10: 対称クリア
 */

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
} from "@testing-library/react";
import { SkillCreateWizard } from "../SkillCreateWizard";
import type { SkillCreatorWorkflowUiSnapshot } from "@repo/shared/types";

// --- mock 関数定義（vi.mock 巻き上げ前に宣言）---
const mockCreateSkill = vi.fn();
const mockSetIsGenerating = vi.fn();
const mockSetGenerationError = vi.fn();
const mockSetGenerationProgress = vi.fn();
const mockSetCurrentPlanId = vi.fn();
const mockSetCurrentPlanResult = vi.fn();
const mockClearGenerationState = vi.fn();
const mockGetWorkflowState = vi.fn();
const mockExecuteSkill = vi.fn();
const mockSelectSkillByName = vi.fn();
const mockSetCurrentView = vi.fn();
const mockSetCurrentSkillName = vi.fn();

function createWorkflowSnapshot(
  overrides: Partial<SkillCreatorWorkflowUiSnapshot> = {},
): SkillCreatorWorkflowUiSnapshot {
  return {
    planId: "plan-001",
    currentPhase: "review",
    awaitingUserInput: null,
    verifyResult: {
      status: "pass",
      nextAction: "handoff",
    },
    resumeTokenEnvelope: {
      version: "task-sdk-02-v1",
      planId: "plan-001",
      currentPhase: "review",
      artifactCount: 1,
      updatedAt: "2026-04-04T00:00:00.000Z",
    },
    handoffBundle: null,
    ...overrides,
  };
}

function createDeferred<T>() {
  let resolve!: (value: T | PromiseLike<T>) => void;
  let reject!: (reason?: unknown) => void;

  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });

  return { promise, resolve, reject };
}

type MockStoreState = {
  isGenerating: boolean;
  generationProgress: string | null;
  generationError: string | null;
  currentPlanId: string | null;
  currentPlanResult: {
    type: "integrated_api" | "terminal_handoff";
    planId?: string;
    skillSpec?: string;
    estimatedSteps?: number;
    guidance?: { reason: string; command: string };
  } | null;
};

let mockStoreState: MockStoreState = {
  isGenerating: false,
  generationProgress: null,
  generationError: null,
  currentPlanId: null,
  currentPlanResult: null,
};

vi.mock("../../../store", () => ({
  useCreateSkill: () => mockCreateSkill,
  useExecuteSkill: () => mockExecuteSkill,
  useSelectSkillByName: () => mockSelectSkillByName,
  useSetCurrentView: () => mockSetCurrentView,
  useSetCurrentSkillName: () => mockSetCurrentSkillName,
  useIsSkillGenerating: () => mockStoreState.isGenerating,
  useGenerationProgress: () => mockStoreState.generationProgress,
  useGenerationError: () => mockStoreState.generationError,
  useCurrentPlanId: () => mockStoreState.currentPlanId,
  useCurrentPlanResult: () => mockStoreState.currentPlanResult,
  useSetIsSkillGenerating: () => mockSetIsGenerating,
  useSetGenerationError: () => mockSetGenerationError,
  useSetGenerationProgress: () => mockSetGenerationProgress,
  useSetCurrentPlanId: () => mockSetCurrentPlanId,
  useSetCurrentPlanResult: () => mockSetCurrentPlanResult,
  useClearGenerationState: () => mockClearGenerationState,
  useWorkflowSnapshot: () => null,
  useResetStreamingProgress: () => vi.fn(),
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

// --- window.skillCreatorAPI モック ---
const mockPlanSkill = vi.fn();
const mockExecutePlan = vi.fn();

describe("SkillCreateWizard LLM生成フロー", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockStoreState = {
      isGenerating: false,
      generationProgress: null,
      generationError: null,
      currentPlanId: null,
      currentPlanResult: null,
    };
    mockCreateSkill.mockResolvedValue("/path/to/skill");
    mockPlanSkill.mockResolvedValue({
      success: true,
      data: {
        type: "integrated_api",
        planId: "plan-001",
        skillSpec: "# generated skill spec",
        estimatedSteps: 3,
      },
    });
    mockExecutePlan.mockResolvedValue({
      success: true,
      data: { accepted: true, planId: "plan-001" },
    });
    mockGetWorkflowState.mockResolvedValue({
      success: true,
      data: createWorkflowSnapshot(),
    });
    Object.defineProperty(window, "skillCreatorAPI", {
      value: {
        planSkill: mockPlanSkill,
        executePlan: mockExecutePlan,
        getWorkflowState: mockGetWorkflowState,
      },
      writable: true,
      configurable: true,
    });
  });

  afterEach(() => {
    cleanup();
    Reflect.deleteProperty(window, "skillCreatorAPI");
  });

  // ============================================================
  // AC-1: 生成モード選択UI
  // ============================================================
  describe("AC-1: 生成モード選択UI", () => {
    it("DescribeStep に生成モード選択のラジオボタンが表示される", () => {
      render(<SkillCreateWizard onClose={vi.fn()} />);
      expect(
        screen.getByRole("radio", { name: /テンプレート/ }),
      ).toBeInTheDocument();
      expect(screen.getByRole("radio", { name: /LLM/ })).toBeInTheDocument();
    });

    it("デフォルトでテンプレートラジオが選択されている", () => {
      render(<SkillCreateWizard onClose={vi.fn()} />);
      expect(screen.getByRole("radio", { name: /テンプレート/ })).toBeChecked();
    });

    it("LLM モードで説明が空のとき「次へ」が disabled になる", () => {
      render(<SkillCreateWizard onClose={vi.fn()} />);
      fireEvent.click(screen.getByRole("radio", { name: /LLM/ }));

      expect(screen.getByRole("button", { name: "次へ" })).toBeDisabled();
    });
  });

  // ============================================================
  // W-1, W-2, W-3 (AC-2): LLMモード -> planSkill
  // ============================================================
  describe("AC-2: LLMモード -> planSkill呼出", () => {
    it("W-1: LLMモード選択 + 次へクリックで planSkill が呼ばれる", async () => {
      render(<SkillCreateWizard onClose={vi.fn()} />);

      fireEvent.click(screen.getByRole("radio", { name: /LLM/ }));
      fireEvent.change(screen.getByRole("textbox"), {
        target: { value: "テストスキル" },
      });
      fireEvent.click(screen.getByRole("button", { name: "次へ" }));

      await act(async () => {
        await Promise.resolve();
      });

      expect(mockPlanSkill).toHaveBeenCalledWith("テストスキル");
    });

    it("W-2: planSkill 呼出し時に setGenerationProgress が呼ばれる", async () => {
      render(<SkillCreateWizard onClose={vi.fn()} />);

      fireEvent.click(screen.getByRole("radio", { name: /LLM/ }));
      fireEvent.change(screen.getByRole("textbox"), {
        target: { value: "テスト" },
      });
      fireEvent.click(screen.getByRole("button", { name: "次へ" }));

      await act(async () => {
        await Promise.resolve();
      });

      expect(mockSetGenerationProgress).toHaveBeenCalledWith("計画を生成中...");
    });

    it("W-3: planSkill 成功時に setCurrentPlanResult が呼ばれる", async () => {
      render(<SkillCreateWizard onClose={vi.fn()} />);

      fireEvent.click(screen.getByRole("radio", { name: /LLM/ }));
      fireEvent.change(screen.getByRole("textbox"), {
        target: { value: "テスト" },
      });
      fireEvent.click(screen.getByRole("button", { name: "次へ" }));

      await act(async () => {
        await Promise.resolve();
      });

      expect(mockSetCurrentPlanResult).toHaveBeenCalledWith({
        type: "integrated_api",
        planId: "plan-001",
        skillSpec: "# generated skill spec",
        estimatedSteps: 3,
      });
    });
  });

  // ============================================================
  // W-4, W-5 (AC-4): executePlan -> CompleteStep
  // ============================================================
  describe("AC-4: executePlan -> CompleteStep遷移", () => {
    it("W-4: 実行するクリックで executePlan が呼ばれる", async () => {
      // planSkill成功後の状態をセットアップ
      mockStoreState.currentPlanId = "plan-001";
      mockStoreState.currentPlanResult = {
        type: "integrated_api",
        planId: "plan-001",
        skillSpec: "# generated skill spec",
        estimatedSteps: 3,
      };

      render(<SkillCreateWizard onClose={vi.fn()} />);

      // LLMモード選択して次へ
      fireEvent.click(screen.getByRole("radio", { name: /LLM/ }));
      fireEvent.change(screen.getByRole("textbox"), {
        target: { value: "テスト" },
      });
      fireEvent.click(screen.getByRole("button", { name: "次へ" }));

      await act(async () => {
        await Promise.resolve();
      });

      // planSkill成功後、ローカルにplanResultが設定されるので実行ボタンが表示されるはず
      // ただし store mock は planSkill 後にre-renderされないため、
      // localPlanResult を使って実行ボタンが出ることをテスト
      await vi.waitFor(() => {
        expect(
          screen.getByRole("button", { name: "実行する" }),
        ).toBeInTheDocument();
      });

      await act(async () => {
        fireEvent.click(screen.getByRole("button", { name: "実行する" }));
      });

      expect(mockExecutePlan).toHaveBeenCalledWith(
        "plan-001",
        "# generated skill spec",
      );
    });

    it("W-5: executePlan 成功後に CompleteStep に遷移する", async () => {
      mockStoreState.currentPlanId = "plan-001";
      mockStoreState.currentPlanResult = {
        type: "integrated_api",
        planId: "plan-001",
        skillSpec: "# generated skill spec",
        estimatedSteps: 3,
      };
      mockGetWorkflowState.mockResolvedValueOnce({
        success: true,
        data: createWorkflowSnapshot({
          persistResult: {
            skillPath: "/tmp/generated-skill",
            files: ["SKILL.md"],
          },
        }),
      });

      render(<SkillCreateWizard onClose={vi.fn()} />);

      fireEvent.click(screen.getByRole("radio", { name: /LLM/ }));
      fireEvent.change(screen.getByRole("textbox"), {
        target: { value: "テスト" },
      });
      fireEvent.click(screen.getByRole("button", { name: "次へ" }));

      await act(async () => {
        await Promise.resolve();
      });

      await vi.waitFor(() => {
        expect(
          screen.getByRole("button", { name: "実行する" }),
        ).toBeInTheDocument();
      });

      await act(async () => {
        fireEvent.click(screen.getByRole("button", { name: "実行する" }));
      });

      await act(async () => {
        await Promise.resolve();
      });

      expect(screen.getByTestId("complete-step-header")).toBeInTheDocument();
      expect(screen.getByTestId("complete-step-skill-path")).toHaveTextContent(
        "/tmp/generated-skill",
      );
      expect(
        screen.getByText("スキルの骨格を生成しました"),
      ).toBeInTheDocument();
    });

    it("W-6: executePlan ack の後に failure snapshot が返ると生成エラーを表示する", async () => {
      mockStoreState.currentPlanId = "plan-001";
      mockStoreState.currentPlanResult = {
        type: "integrated_api",
        planId: "plan-001",
        skillSpec: "# generated skill spec",
        estimatedSteps: 3,
      };
      mockGetWorkflowState.mockResolvedValueOnce({
        success: true,
        data: createWorkflowSnapshot({
          verifyResult: {
            status: "fail",
            reason: "verification_review",
            message: "LLMAdapter の初期化中です。しばらくお待ちください",
            nextAction: "review",
            updatedAt: "2026-04-04T00:00:00.000Z",
          },
        }),
      });

      render(<SkillCreateWizard onClose={vi.fn()} />);

      fireEvent.click(screen.getByRole("radio", { name: /LLM/ }));
      fireEvent.change(screen.getByRole("textbox"), {
        target: { value: "テスト" },
      });
      fireEvent.click(screen.getByRole("button", { name: "次へ" }));

      await act(async () => {
        await Promise.resolve();
      });

      await vi.waitFor(() => {
        expect(
          screen.getByRole("button", { name: "実行する" }),
        ).toBeInTheDocument();
      });

      await act(async () => {
        fireEvent.click(screen.getByRole("button", { name: "実行する" }));
      });

      await vi.waitFor(() => {
        expect(mockSetGenerationError).toHaveBeenLastCalledWith(
          "LLMAdapter の初期化中です。しばらくお待ちください",
        );
      });
      expect(mockGetWorkflowState).toHaveBeenCalledWith("plan-001");
      expect(
        screen.queryByTestId("complete-step-header"),
      ).not.toBeInTheDocument();
    });

    it("W-6b: executePlan ack の後に handoff snapshot が返ると guidance を表示する", async () => {
      mockStoreState.currentPlanId = "plan-001";
      mockStoreState.currentPlanResult = {
        type: "integrated_api",
        planId: "plan-001",
        skillSpec: "# generated skill spec",
        estimatedSteps: 3,
      };
      mockGetWorkflowState.mockResolvedValueOnce({
        success: true,
        data: createWorkflowSnapshot({
          handoffBundle: {
            launcher: "terminal",
            promptBundle: "bundle",
            cwd: "/tmp",
            suggestedCommand: "codex run --handoff",
            manualRetryRule: "ターミナルで続行してください",
          },
        }),
      });

      render(<SkillCreateWizard onClose={vi.fn()} />);

      fireEvent.click(screen.getByRole("radio", { name: /LLM/ }));
      fireEvent.change(screen.getByRole("textbox"), {
        target: { value: "テスト" },
      });
      fireEvent.click(screen.getByRole("button", { name: "次へ" }));

      await vi.waitFor(() => {
        expect(
          screen.getByRole("button", { name: "実行する" }),
        ).toBeInTheDocument();
      });

      await act(async () => {
        fireEvent.click(screen.getByRole("button", { name: "実行する" }));
      });

      await vi.waitFor(() => {
        expect(
          screen.getByText("ターミナルで続行してください"),
        ).toBeInTheDocument();
      });
      expect(screen.getByText("codex run --handoff")).toBeInTheDocument();
      expect(
        screen.queryByRole("button", { name: "実行する" }),
      ).not.toBeInTheDocument();
      expect(mockGetWorkflowState).toHaveBeenCalledWith("plan-001");
    });

    it("W-6c: キャンセル後に遅延した snapshot が返っても CompleteStep に進まない", async () => {
      mockStoreState.currentPlanId = "plan-001";
      mockStoreState.currentPlanResult = {
        type: "integrated_api",
        planId: "plan-001",
        skillSpec: "# generated skill spec",
        estimatedSteps: 3,
      };
      const deferredSnapshot = createDeferred<{
        success: boolean;
        data: SkillCreatorWorkflowUiSnapshot;
      }>();
      mockGetWorkflowState.mockReturnValueOnce(deferredSnapshot.promise);

      render(<SkillCreateWizard onClose={vi.fn()} />);

      fireEvent.click(screen.getByRole("radio", { name: /LLM/ }));
      fireEvent.change(screen.getByRole("textbox"), {
        target: { value: "テスト" },
      });
      fireEvent.click(screen.getByRole("button", { name: "次へ" }));

      await vi.waitFor(() => {
        expect(
          screen.getByRole("button", { name: "実行する" }),
        ).toBeInTheDocument();
      });

      await act(async () => {
        fireEvent.click(screen.getByRole("button", { name: "実行する" }));
      });

      await act(async () => {
        fireEvent.click(screen.getByRole("button", { name: "キャンセル" }));
      });

      await act(async () => {
        deferredSnapshot.resolve({
          success: true,
          data: createWorkflowSnapshot({
            persistResult: {
              skillPath: "/tmp/stale-skill",
              files: ["SKILL.md"],
            },
          }),
        });
        await Promise.resolve();
      });

      expect(screen.getByLabelText("目的・背景")).toBeInTheDocument();
      expect(
        screen.queryByTestId("complete-step-header"),
      ).not.toBeInTheDocument();
    });
  });

  // ============================================================
  // W-6 (AC-5): キャンセル -> DescribeStep
  // ============================================================
  describe("AC-5: キャンセル -> DescribeStep戻り", () => {
    it("W-6: キャンセルクリックで DescribeStep に戻る", async () => {
      mockStoreState.currentPlanId = "plan-001";
      mockStoreState.currentPlanResult = {
        type: "integrated_api",
        planId: "plan-001",
        skillSpec: "# generated skill spec",
        estimatedSteps: 3,
      };

      render(<SkillCreateWizard onClose={vi.fn()} />);

      fireEvent.click(screen.getByRole("radio", { name: /LLM/ }));
      fireEvent.change(screen.getByRole("textbox"), {
        target: { value: "テスト" },
      });
      fireEvent.click(screen.getByRole("button", { name: "次へ" }));

      await act(async () => {
        await Promise.resolve();
      });

      await vi.waitFor(() => {
        expect(
          screen.getByRole("button", { name: "キャンセル" }),
        ).toBeInTheDocument();
      });

      fireEvent.click(screen.getByRole("button", { name: "キャンセル" }));

      // DescribeStep に戻っている
      expect(screen.getByRole("textbox")).toBeInTheDocument();
      expect(screen.getByText("スキルの説明")).toBeInTheDocument();
    });
  });

  // ============================================================
  // W-7, W-8 (AC-8): テンプレートフロー非破壊
  // ============================================================
  describe("AC-8: テンプレートフロー非破壊", () => {
    it("W-7: テンプレートモード（デフォルト）で ConversationRoundStep に遷移する", () => {
      render(<SkillCreateWizard onClose={vi.fn()} />);

      fireEvent.change(screen.getByRole("textbox", { name: /目的/ }), {
        target: { value: "テストスキルの詳細な説明文" },
      });
      fireEvent.click(screen.getByRole("button", { name: "自動化" }));
      fireEvent.click(screen.getByRole("button", { name: "次へ" }));

      expect(
        screen.getByRole("button", { name: "今すぐ生成する" }),
      ).toBeInTheDocument();
      expect(mockPlanSkill).not.toHaveBeenCalled();
    });

    it("W-8: テンプレートモードで createSkill が呼ばれる", async () => {
      render(<SkillCreateWizard onClose={vi.fn()} />);

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

    it("W-8b: キャンセル後に遅延した template 生成結果が返っても Step 3 に進まない", async () => {
      const deferredCreateSkill = createDeferred<string>();
      mockCreateSkill.mockReturnValueOnce(deferredCreateSkill.promise);

      render(<SkillCreateWizard onClose={vi.fn()} />);

      fireEvent.change(screen.getByRole("textbox", { name: /目的/ }), {
        target: { value: "テストスキルの詳細な説明文" },
      });
      fireEvent.click(screen.getByRole("button", { name: "自動化" }));
      fireEvent.click(screen.getByRole("button", { name: "次へ" }));
      fireEvent.click(screen.getByRole("button", { name: "今すぐ生成する" }));

      await act(async () => {
        fireEvent.click(screen.getByRole("button", { name: "キャンセル" }));
      });

      await act(async () => {
        deferredCreateSkill.resolve("/tmp/template-skill");
        await Promise.resolve();
      });

      expect(screen.getByLabelText("目的・背景")).toBeInTheDocument();
      expect(
        screen.queryByTestId("complete-step-header"),
      ).not.toBeInTheDocument();
    });
  });

  // ============================================================
  // W-10, W-11 (AC-10): 対称クリア
  // ============================================================
  describe("AC-10: 対称クリア", () => {
    it("W-10: executePlan 成功後に clearGenerationState が呼ばれる", async () => {
      mockStoreState.currentPlanId = "plan-001";
      mockStoreState.currentPlanResult = {
        type: "integrated_api",
        planId: "plan-001",
        skillSpec: "# generated skill spec",
        estimatedSteps: 3,
      };

      render(<SkillCreateWizard onClose={vi.fn()} />);

      fireEvent.click(screen.getByRole("radio", { name: /LLM/ }));
      fireEvent.change(screen.getByRole("textbox"), {
        target: { value: "テスト" },
      });
      fireEvent.click(screen.getByRole("button", { name: "次へ" }));

      await act(async () => {
        await Promise.resolve();
      });

      await vi.waitFor(() => {
        expect(
          screen.getByRole("button", { name: "実行する" }),
        ).toBeInTheDocument();
      });

      await act(async () => {
        fireEvent.click(screen.getByRole("button", { name: "実行する" }));
      });

      await act(async () => {
        await Promise.resolve();
      });

      expect(mockClearGenerationState).toHaveBeenCalledTimes(1);
    });

    it("W-11: キャンセル後に clearGenerationState が呼ばれる（対称クリア）", async () => {
      mockStoreState.currentPlanId = "plan-001";
      mockStoreState.currentPlanResult = {
        type: "integrated_api",
        planId: "plan-001",
        skillSpec: "# generated skill spec",
        estimatedSteps: 3,
      };

      render(<SkillCreateWizard onClose={vi.fn()} />);

      fireEvent.click(screen.getByRole("radio", { name: /LLM/ }));
      fireEvent.change(screen.getByRole("textbox"), {
        target: { value: "テスト" },
      });
      fireEvent.click(screen.getByRole("button", { name: "次へ" }));

      await act(async () => {
        await Promise.resolve();
      });

      await vi.waitFor(() => {
        expect(
          screen.getByRole("button", { name: "キャンセル" }),
        ).toBeInTheDocument();
      });

      fireEvent.click(screen.getByRole("button", { name: "キャンセル" }));

      expect(mockClearGenerationState).toHaveBeenCalledTimes(1);
    });
  });

  // ============================================================
  // E-3 (AC-7): executePlan 失敗パス
  // ============================================================
  describe("executePlan エラーパス", () => {
    it("E-3: executePlan が失敗レスポンスを返すとき setGenerationError が呼ばれる", async () => {
      mockExecutePlan.mockResolvedValue({
        success: false,
        error: "スキル生成に失敗しました",
      });
      mockStoreState.currentPlanId = "plan-001";
      mockStoreState.currentPlanResult = {
        type: "integrated_api",
        planId: "plan-001",
        skillSpec: "# generated skill spec",
        estimatedSteps: 3,
      };

      render(<SkillCreateWizard onClose={vi.fn()} />);

      fireEvent.click(screen.getByRole("radio", { name: /LLM/ }));
      fireEvent.change(screen.getByRole("textbox"), {
        target: { value: "テスト" },
      });
      fireEvent.click(screen.getByRole("button", { name: "次へ" }));

      await act(async () => {
        await Promise.resolve();
      });

      await vi.waitFor(() => {
        expect(
          screen.getByRole("button", { name: "実行する" }),
        ).toBeInTheDocument();
      });

      await act(async () => {
        fireEvent.click(screen.getByRole("button", { name: "実行する" }));
      });

      await act(async () => {
        await Promise.resolve();
      });

      expect(mockSetGenerationError).toHaveBeenCalledWith(
        "スキル生成に失敗しました",
      );
    });

    it("E-5: executePlan が例外をスローするとき setGenerationError が呼ばれる", async () => {
      mockExecutePlan.mockRejectedValue(new Error("ネットワークエラー"));
      mockStoreState.currentPlanId = "plan-001";
      mockStoreState.currentPlanResult = {
        type: "integrated_api",
        planId: "plan-001",
        estimatedSteps: 3,
      };

      render(<SkillCreateWizard onClose={vi.fn()} />);

      fireEvent.click(screen.getByRole("radio", { name: /LLM/ }));
      fireEvent.change(screen.getByRole("textbox"), {
        target: { value: "テスト" },
      });
      fireEvent.click(screen.getByRole("button", { name: "次へ" }));

      await act(async () => {
        await Promise.resolve();
      });

      await vi.waitFor(() => {
        expect(
          screen.getByRole("button", { name: "実行する" }),
        ).toBeInTheDocument();
      });

      await act(async () => {
        fireEvent.click(screen.getByRole("button", { name: "実行する" }));
      });

      await act(async () => {
        await Promise.resolve();
      });

      expect(mockSetGenerationError).toHaveBeenCalledWith("ネットワークエラー");
    });

    it("E-7: executePlan 失敗時に CompleteStep に遷移しない", async () => {
      mockExecutePlan.mockResolvedValue({
        success: false,
        error: "実行環境が不正です",
      });
      mockStoreState.currentPlanId = "plan-001";
      mockStoreState.currentPlanResult = {
        type: "integrated_api",
        planId: "plan-001",
        estimatedSteps: 3,
      };

      render(<SkillCreateWizard onClose={vi.fn()} />);

      fireEvent.click(screen.getByRole("radio", { name: /LLM/ }));
      fireEvent.change(screen.getByRole("textbox"), {
        target: { value: "テスト" },
      });
      fireEvent.click(screen.getByRole("button", { name: "次へ" }));

      await vi.waitFor(() => {
        expect(
          screen.getByRole("button", { name: "実行する" }),
        ).toBeInTheDocument();
      });

      await act(async () => {
        fireEvent.click(screen.getByRole("button", { name: "実行する" }));
      });

      await act(async () => {
        await Promise.resolve();
      });

      // CompleteStep に遷移しないことを確認
      expect(
        screen.queryByTestId("complete-step-header"),
      ).not.toBeInTheDocument();
    });

    it("E-6: executePlan が terminal_handoff を返すと command 付きエラーを表示する", async () => {
      mockExecutePlan.mockResolvedValue({
        success: true,
        data: {
          type: "terminal_handoff",
          bundle: {
            launcher: "terminal",
            promptBundle: "bundle",
            cwd: "/tmp",
            suggestedCommand: "codex run --handoff",
            manualRetryRule: "manual",
          },
        },
      });
      mockStoreState.currentPlanId = "plan-001";
      mockStoreState.currentPlanResult = {
        type: "integrated_api",
        planId: "plan-001",
        estimatedSteps: 3,
      };

      render(<SkillCreateWizard onClose={vi.fn()} />);

      fireEvent.click(screen.getByRole("radio", { name: /LLM/ }));
      fireEvent.change(screen.getByRole("textbox"), {
        target: { value: "テスト" },
      });
      fireEvent.click(screen.getByRole("button", { name: "次へ" }));

      await act(async () => {
        await Promise.resolve();
      });

      await vi.waitFor(() => {
        expect(
          screen.getByRole("button", { name: "実行する" }),
        ).toBeInTheDocument();
      });

      await act(async () => {
        fireEvent.click(screen.getByRole("button", { name: "実行する" }));
      });

      expect(mockSetGenerationError).toHaveBeenCalledWith(
        "ターミナル実行が必要です: codex run --handoff",
      );
    });
  });

  // ============================================================
  // Phase 6: エラーパス (E シリーズ)
  // ============================================================
  describe("planSkill エラーパス", () => {
    it("E-1: planSkill が失敗レスポンスを返すとき setGenerationError が呼ばれる", async () => {
      mockPlanSkill.mockResolvedValue({
        success: false,
        error: "APIキーが無効です",
      });

      render(<SkillCreateWizard onClose={vi.fn()} />);

      fireEvent.click(screen.getByRole("radio", { name: /LLM/ }));
      fireEvent.change(screen.getByRole("textbox"), {
        target: { value: "テスト" },
      });
      fireEvent.click(screen.getByRole("button", { name: "次へ" }));

      await act(async () => {
        await Promise.resolve();
      });

      expect(mockSetGenerationError).toHaveBeenCalledWith("APIキーが無効です");
    });

    it("E-2: planSkill が例外をスローするとき setGenerationError が呼ばれる", async () => {
      mockPlanSkill.mockRejectedValue(new Error("ネットワークエラー"));

      render(<SkillCreateWizard onClose={vi.fn()} />);

      fireEvent.click(screen.getByRole("radio", { name: /LLM/ }));
      fireEvent.change(screen.getByRole("textbox"), {
        target: { value: "テスト" },
      });
      fireEvent.click(screen.getByRole("button", { name: "次へ" }));

      await act(async () => {
        await Promise.resolve();
      });

      expect(mockSetGenerationError).toHaveBeenCalledWith("ネットワークエラー");
    });

    it("E-2b: planSkill logical error(success:false in data)時に plan state をクリアする", async () => {
      mockPlanSkill.mockResolvedValue({
        success: true,
        data: {
          success: false,
          error: {
            code: "llm_adapter_unavailable",
            message: "LLM アダプタが利用できません。設定を確認してください。",
          },
        },
      });

      render(<SkillCreateWizard onClose={vi.fn()} />);

      fireEvent.click(screen.getByRole("radio", { name: /LLM/ }));
      fireEvent.change(screen.getByRole("textbox"), {
        target: { value: "テスト" },
      });
      fireEvent.click(screen.getByRole("button", { name: "次へ" }));

      await act(async () => {
        await Promise.resolve();
      });

      expect(mockSetGenerationError).toHaveBeenCalledWith(
        "LLM アダプタが利用できません。設定を確認してください。",
      );
      expect(mockSetCurrentPlanResult).toHaveBeenCalledWith(null);
      expect(mockSetCurrentPlanId).toHaveBeenCalledWith(null);
    });

    it("E-4: planSkill 失敗後に setIsGenerating(false) が呼ばれる", async () => {
      mockPlanSkill.mockRejectedValue(new Error("失敗"));

      render(<SkillCreateWizard onClose={vi.fn()} />);

      fireEvent.click(screen.getByRole("radio", { name: /LLM/ }));
      fireEvent.change(screen.getByRole("textbox"), {
        target: { value: "テスト" },
      });
      fireEvent.click(screen.getByRole("button", { name: "次へ" }));

      await act(async () => {
        await Promise.resolve();
      });

      const calls = mockSetIsGenerating.mock.calls;
      expect(calls[calls.length - 1]).toEqual([false]);
    });
  });

  // ============================================================
  // Phase 6: API 未接続フォールバック (F シリーズ)
  // ============================================================
  describe("API未接続フォールバック", () => {
    it("F-3: executePlan が undefined のとき setGenerationError が呼ばれてクラッシュしない", async () => {
      // planSkill は成功させ、executePlan を意図的に省く
      Object.defineProperty(window, "skillCreatorAPI", {
        value: {
          planSkill: mockPlanSkill,
          getWorkflowState: mockGetWorkflowState,
        },
        writable: true,
        configurable: true,
      });

      render(<SkillCreateWizard onClose={vi.fn()} />);

      fireEvent.click(screen.getByRole("radio", { name: /LLM/ }));
      fireEvent.change(screen.getByRole("textbox"), {
        target: { value: "テスト" },
      });
      fireEvent.click(screen.getByRole("button", { name: "次へ" }));

      await vi.waitFor(() => {
        expect(
          screen.getByRole("button", { name: "実行する" }),
        ).toBeInTheDocument();
      });

      await act(async () => {
        fireEvent.click(screen.getByRole("button", { name: "実行する" }));
      });

      expect(mockSetGenerationError).toHaveBeenCalled();
    });

    it("F-2: planSkill が undefined のとき setGenerationError が呼ばれてクラッシュしない", async () => {
      Object.defineProperty(window, "skillCreatorAPI", {
        value: {
          executePlan: mockExecutePlan,
          getWorkflowState: mockGetWorkflowState,
        },
        writable: true,
        configurable: true,
      });

      render(<SkillCreateWizard onClose={vi.fn()} />);

      fireEvent.click(screen.getByRole("radio", { name: /LLM/ }));
      fireEvent.change(screen.getByRole("textbox"), {
        target: { value: "テスト" },
      });
      fireEvent.click(screen.getByRole("button", { name: "次へ" }));

      await act(async () => {
        await Promise.resolve();
      });

      expect(mockSetGenerationError).toHaveBeenCalled();
    });
  });

  // ============================================================
  // Phase 6: 二重呼出防止 (G シリーズ)
  // ============================================================
  describe("二重呼出防止ガード", () => {
    it("G-1: isGenerating=true 中に planSkill が呼ばれない", async () => {
      mockStoreState.isGenerating = true;

      render(<SkillCreateWizard onClose={vi.fn()} />);

      fireEvent.click(screen.getByRole("radio", { name: /LLM/ }));
      fireEvent.change(screen.getByRole("textbox"), {
        target: { value: "テスト" },
      });
      fireEvent.click(screen.getByRole("button", { name: "次へ" }));

      await act(async () => {
        await Promise.resolve();
      });

      expect(mockPlanSkill).not.toHaveBeenCalled();
    });
  });

  // ============================================================
  // Phase 6: モード切替検証 (M シリーズ)
  // ============================================================
  describe("generationMode切替後の遷移", () => {
    it("M-1: LLM から テンプレートに切替後 ConversationRoundStep に遷移する", () => {
      render(<SkillCreateWizard onClose={vi.fn()} />);

      fireEvent.click(screen.getByRole("radio", { name: /LLM/ }));
      fireEvent.click(screen.getByRole("radio", { name: /テンプレート/ }));

      fireEvent.change(screen.getByRole("textbox"), {
        target: { value: "テスト" },
      });
      fireEvent.click(screen.getByRole("button", { name: "次へ" }));

      expect(
        screen.getByRole("button", { name: "今すぐ生成する" }),
      ).toBeInTheDocument();
      expect(mockPlanSkill).not.toHaveBeenCalled();
    });

    it("M-3: デフォルトはテンプレートモードで ConversationRoundStep に遷移する", () => {
      render(<SkillCreateWizard onClose={vi.fn()} />);

      fireEvent.change(screen.getByRole("textbox", { name: /目的/ }), {
        target: { value: "テストスキルの詳細な説明文" },
      });
      fireEvent.click(screen.getByRole("button", { name: "自動化" }));
      fireEvent.click(screen.getByRole("button", { name: "次へ" }));

      expect(
        screen.getByRole("button", { name: "今すぐ生成する" }),
      ).toBeInTheDocument();
    });
  });
});
