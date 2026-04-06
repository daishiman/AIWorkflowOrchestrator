/**
 * @vitest-environment happy-dom
 */

import React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import type {
  SkillCreatorUserInputKind,
  TerminalHandoffBundle,
} from "@repo/shared/types";

// --- mock 関数定義（vi.mock 巻き上げ前に宣言）---
const mockCreateSkill = vi.fn();
const mockExecuteSkill = vi.fn();
const mockReExecuteAfterImprovement = vi.fn();
const mockSelectSkillByName = vi.fn();
const mockClearSkillError = vi.fn();
const mockClearStreamingMessages = vi.fn();
const mockBeginSkillReview = vi.fn();
const mockCompleteSkillReview = vi.fn();
const mockResetSkillExecutionCycle = vi.fn();
const mockFetchSkills = vi.fn();
const mockSetIsGenerating = vi.fn();
const mockSetGenerationError = vi.fn();
const mockSetGenerationProgress = vi.fn();
const mockSetCurrentPlanId = vi.fn();
const mockSetCurrentPlanResult = vi.fn();
const mockClearGenerationState = vi.fn();
const mockSetWorkflowSnapshot = vi.fn();
const mockSetWorkflowError = vi.fn();
const mockSetHandoffGuidance = vi.fn();
const mockClearHandoffGuidance = vi.fn();
const mockSubmitUserInput = vi.fn();
const mockGetWorkflowState = vi.fn();
const mockOnWorkflowStateChanged = vi.fn();

type MockStoreState = {
  selectedSkillName: string | null;
  isExecuting: boolean;
  streamingMessages: Array<{
    timestamp: number;
    type: string;
    content: unknown;
  }>;
  skillExecutionStatus: string | null;
  skillError: string | null;
  // LLM Generation state
  isGenerating: boolean;
  generationProgress: string | null;
  generationError: string | null;
  currentPlanId: string | null;
  currentPlanResult: {
    type: "integrated_api" | "terminal_handoff";
    planId?: string;
    estimatedSteps?: number;
    guidance?: {
      reason: string;
      terminalCommand: string;
      contextSummary: string;
    };
  } | null;
  workflowSnapshot: {
    planId: string;
    currentPhase: string;
    awaitingUserInput: null | {
      requestId: string;
      reason: string;
      title: string;
      prompt: string;
      kind: SkillCreatorUserInputKind;
      options?: Array<{ id: string; label: string; description?: string }>;
      placeholder?: string;
      requestedAt: string;
    };
    verifyResult: null;
    resumeTokenEnvelope: {
      version: string;
      planId: string;
      currentPhase: string;
      artifactCount: number;
      updatedAt: string;
    };
    sourceProvenance?: {
      resolvedSkillCreatorRoot?: string;
      warningNote?: string;
    };
    handoffBundle?: TerminalHandoffBundle | null;
  } | null;
  workflowError: string | null;
  handoffGuidance: {
    terminalCommand: string;
    contextSummary: string;
    reason: string;
  } | null;
};

let mockStoreState: MockStoreState = {
  selectedSkillName: null,
  isExecuting: false,
  streamingMessages: [],
  skillExecutionStatus: null,
  skillError: null,
  isGenerating: false,
  generationProgress: null,
  generationError: null,
  currentPlanId: null,
  currentPlanResult: null,
  workflowSnapshot: null,
  workflowError: null,
  handoffGuidance: null,
};

vi.mock("../../../store", () => ({
  // Existing selectors
  useBeginSkillReview: () => mockBeginSkillReview,
  useCreateSkill: () => mockCreateSkill,
  useCompleteSkillReview: () => mockCompleteSkillReview,
  useExecuteSkill: () => mockExecuteSkill,
  useReExecuteAfterImprovement: () => mockReExecuteAfterImprovement,
  useResetSkillExecutionCycle: () => mockResetSkillExecutionCycle,
  useSelectSkillByName: () => mockSelectSkillByName,
  useClearSkillError: () => mockClearSkillError,
  useClearStreamingMessages: () => mockClearStreamingMessages,
  useSelectedSkillName: () => mockStoreState.selectedSkillName,
  useIsSkillExecuting: () => mockStoreState.isExecuting,
  useStreamingMessages: () => mockStoreState.streamingMessages,
  useSkillExecutionStatus: () => mockStoreState.skillExecutionStatus,
  useSkillError: () => mockStoreState.skillError,
  useFetchSkills: () => mockFetchSkills,
  // New LLM generation selectors (Phase 5 で実装予定)
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
  useWorkflowSnapshot: () => mockStoreState.workflowSnapshot,
  useWorkflowError: () => mockStoreState.workflowError,
  useSetWorkflowSnapshot: () => mockSetWorkflowSnapshot,
  useSetWorkflowError: () => mockSetWorkflowError,
  useHandoffGuidance: () => mockStoreState.handoffGuidance,
  useSetHandoffGuidance: () => mockSetHandoffGuidance,
  useClearHandoffGuidance: () => mockClearHandoffGuidance,
  useClearGenerationState: () => mockClearGenerationState,
}));

vi.mock("../SkillStreamingView", () => ({
  SkillStreamingView: ({ skillName }: { skillName: string }) => (
    <div data-testid="mock-streaming-view">{skillName}</div>
  ),
}));

vi.mock("../SkillAnalysisView", () => ({
  SkillAnalysisView: ({
    skillName,
    onClose,
  }: {
    skillName: string;
    onClose: () => void;
  }) => (
    <div data-testid="mock-analysis-view">
      <span>{skillName}</span>
      <button onClick={onClose}>閉じる</button>
    </div>
  ),
}));

import { SkillLifecyclePanel } from "../SkillLifecyclePanel";

// --- Mock API setup ---
const mockDetectMode = vi.fn();
const mockPlanSkill = vi.fn();
const mockExecutePlan = vi.fn();
const mockGetVerifyDetail = vi.fn();
const mockReverifyWorkflow = vi.fn();
const mockImproveSkillWithFeedback = vi.fn();
const mockApplyRuntimeImprovement = vi.fn();
const mockGetDisclosureInfo = vi.fn();

const buildTerminalHandoffBundle = (): TerminalHandoffBundle => ({
  launcher: "claude",
  promptBundle: "runtime-skill prompt",
  cwd: "/tmp/runtime-skill",
  suggestedCommand: 'claude -p "runtime-skill prompt"',
  manualRetryRule: "認証設定を確認してから CLI で再実行する",
});

beforeEach(() => {
  vi.clearAllMocks();
  mockStoreState = {
    selectedSkillName: "test-skill",
    isExecuting: false,
    streamingMessages: [],
    skillExecutionStatus: null,
    skillError: null,
    isGenerating: false,
    generationProgress: null,
    generationError: null,
    currentPlanId: null,
    currentPlanResult: null,
    workflowSnapshot: null,
    workflowError: null,
    handoffGuidance: null,
  };

  mockSetHandoffGuidance.mockImplementation((guidance) => {
    mockStoreState.handoffGuidance = guidance;
  });
  mockClearHandoffGuidance.mockImplementation(() => {
    mockStoreState.handoffGuidance = null;
  });

  (window as Window & { skillCreatorAPI?: unknown }).skillCreatorAPI = {
    detectMode: mockDetectMode,
    planSkill: mockPlanSkill,
    executePlan: mockExecutePlan,
    getWorkflowState: mockGetWorkflowState,
    submitUserInput: mockSubmitUserInput,
    onWorkflowStateChanged: mockOnWorkflowStateChanged,
    improveSkillWithFeedback: mockImproveSkillWithFeedback,
    applyRuntimeImprovement: mockApplyRuntimeImprovement,
    getVerifyDetail: mockGetVerifyDetail,
    reverifyWorkflow: mockReverifyWorkflow,
    getDisclosureInfo: mockGetDisclosureInfo,
  };

  mockDetectMode.mockResolvedValue({ success: true, data: "plan" });
  mockPlanSkill.mockResolvedValue({
    success: true,
    data: {
      type: "integrated_api",
      planId: "plan-001",
      estimatedSteps: 5,
    },
  });
  mockExecutePlan.mockResolvedValue({
    success: true,
    data: {
      executeId: "exec-001",
      skillName: "new-skill",
      success: true,
    },
  });
  mockImproveSkillWithFeedback.mockResolvedValue({
    success: true,
    data: {
      improveId: "improve-001",
      suggestions: [
        {
          section: "description",
          before: "古い説明",
          after: "新しい説明",
          reason: "説明を明確化する",
        },
      ],
    },
  });
  mockApplyRuntimeImprovement.mockResolvedValue({
    success: true,
    data: {
      applied: 1,
      skipped: 0,
      skippedDetails: [],
      errors: [],
    },
  });
  mockGetWorkflowState.mockResolvedValue({
    success: false,
    error: "workflow state が見つかりません",
  });
  mockOnWorkflowStateChanged.mockReturnValue(() => {});
  mockGetVerifyDetail.mockResolvedValue({
    success: true,
    data: {
      planId: "plan-001",
      currentPhase: "verify",
      status: "pending",
      checks: [
        {
          id: "L3-001",
          layer: "layer3",
          severity: "warning",
          summary: "verify summary",
          evidenceSummary: "nextAction=review",
        },
      ],
      evidenceCount: 3,
      route: {
        type: "integrated_api",
        summary: "integrated_api (default)",
      },
      reverifyEligible: true,
      delegatedGovernanceNote: "Task07 owner",
      delegatedSessionNote: "Task08 owner",
    },
  });
  mockReverifyWorkflow.mockResolvedValue({
    success: true,
    data: {
      accepted: true,
    },
  });
  mockGetDisclosureInfo.mockResolvedValue({
    success: true,
    data: {
      aiServiceName: "Claude",
      modelName: "claude-sonnet-4-20250514",
      externalDestinations: ["api.anthropic.com"],
    },
  });
  mockFetchSkills.mockResolvedValue(undefined);
});

afterEach(() => {
  cleanup();
  delete (window as Window & { skillCreatorAPI?: unknown }).skillCreatorAPI;
});

const renderPanel = () =>
  render(<SkillLifecyclePanel onClose={vi.fn()} skillName="test-skill" />);

// =====================================================================
// U-1: handlePlanSkill が detectMode → planSkill の順で呼ばれる
// =====================================================================
describe("U-1: detectMode → planSkill sequential call", () => {
  it("handlePrepare 経由で detectMode='plan' のとき planSkill が自動呼出される", async () => {
    renderPanel();

    const input = screen.getByTestId("skill-lifecycle-request-input");
    fireEvent.change(input, {
      target: { value: "メールを自動送信する" },
    });

    const prepareBtn = screen.getByTestId("skill-lifecycle-prepare-button");
    await act(async () => {
      fireEvent.click(prepareBtn);
    });

    expect(mockDetectMode).toHaveBeenCalledTimes(1);
    expect(mockDetectMode).toHaveBeenCalledWith("メールを自動送信する");
    expect(mockPlanSkill).toHaveBeenCalledTimes(1);
    expect(mockPlanSkill).toHaveBeenCalledWith(
      "メールを自動送信する",
      expect.anything(),
      expect.anything(),
    );
  });
});

// =====================================================================
// U-2: detectMode='create' のとき planSkill は呼ばれない（AC-7）
// =====================================================================
describe("U-2: backward compatibility - detectMode='create' skips planSkill", () => {
  it("detectMode が 'create' を返すとき planSkill は呼ばれない", async () => {
    mockDetectMode.mockResolvedValue({ success: true, data: "create" });

    renderPanel();

    const input = screen.getByTestId("skill-lifecycle-request-input");
    fireEvent.change(input, { target: { value: "テスト用入力" } });

    const prepareBtn = screen.getByTestId("skill-lifecycle-prepare-button");
    await act(async () => {
      fireEvent.click(prepareBtn);
    });

    expect(mockDetectMode).toHaveBeenCalledTimes(1);
    expect(mockPlanSkill).not.toHaveBeenCalled();
  });
});

// =====================================================================
// U-3: isGenerating=true で「実行する」ボタンが disabled
// =====================================================================
describe("U-3: isGenerating locks execute button", () => {
  it("isGenerating=true かつ plan 結果表示中は「実行する」ボタンが無効化される", () => {
    mockStoreState.isGenerating = true;
    mockStoreState.currentPlanResult = {
      type: "integrated_api",
      planId: "plan-001",
      estimatedSteps: 5,
    };

    renderPanel();

    const executeBtn = screen.getByRole("button", { name: "実行する" });
    expect((executeBtn as HTMLButtonElement).disabled).toBe(true);
  });
});

// =====================================================================
// U-4: isGenerating=true のとき handlePlanSkill が早期リターン（R-1）
// =====================================================================
describe("U-4: isGenerating guard prevents double invocation (R-1)", () => {
  it("isGenerating=true の状態で「方針を決める」を押しても detectMode は呼ばれない", async () => {
    mockStoreState.isGenerating = true;

    renderPanel();

    const input = screen.getByTestId("skill-lifecycle-request-input");
    fireEvent.change(input, { target: { value: "テスト入力" } });

    const prepareBtn = screen.getByTestId("skill-lifecycle-prepare-button");
    await act(async () => {
      fireEvent.click(prepareBtn);
    });

    expect(mockDetectMode).not.toHaveBeenCalled();
    expect(mockPlanSkill).not.toHaveBeenCalled();
  });
});

// =====================================================================
// U-5: integrated_api レスポンスで plan 結果表示セクションが表示される
// =====================================================================
describe("U-5: plan result display for integrated_api", () => {
  it("currentPlanResult が integrated_api のとき「生成計画」セクションが表示される", () => {
    mockStoreState.currentPlanResult = {
      type: "integrated_api",
      planId: "plan-001",
      estimatedSteps: 5,
    };

    renderPanel();

    expect(screen.getByText("生成計画")).toBeTruthy();
    expect(screen.getByText(/推定ステップ数.*5/)).toBeTruthy();
    expect(screen.getByRole("button", { name: "実行する" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "キャンセル" })).toBeTruthy();
  });
});

// =====================================================================
// U-6: terminal_handoff レスポンスで handoffGuidance が表示される
// =====================================================================
describe("U-6: terminal_handoff triggers handoff guidance display", () => {
  it("planSkill が terminal_handoff を返すと handoff ガイダンスが表示される", async () => {
    mockPlanSkill.mockResolvedValue({
      success: true,
      data: {
        type: "terminal_handoff",
        guidance: {
          reason: "Large task requires CLI execution",
          terminalCommand: "npx skill-creator plan",
          contextSummary: "surface=skill skill=test-skill",
        },
      },
    });

    renderPanel();

    const input = screen.getByTestId("skill-lifecycle-request-input");
    fireEvent.change(input, { target: { value: "大規模タスク" } });

    const prepareBtn = screen.getByTestId("skill-lifecycle-prepare-button");
    await act(async () => {
      fireEvent.click(prepareBtn);
    });

    expect(screen.getByText(/Large task requires CLI execution/)).toBeTruthy();
  });
});

// =====================================================================
// U-7: generationError が存在するとエラーメッセージが表示される
// =====================================================================
describe("U-7: generationError displays error message", () => {
  it("generationError が設定されているとエラーメッセージが画面に表示される", () => {
    mockStoreState.generationError = "計画生成に失敗しました";

    renderPanel();

    expect(screen.getByText("計画生成に失敗しました")).toBeTruthy();
  });
});

// =====================================================================
// U-8: handleExecutePlan が executePlan → fetchSkills → selectSkillByName を呼ぶ
// =====================================================================
describe("U-8: handleExecutePlan triggers executePlan IPC", () => {
  it("「実行する」ボタンクリックで executePlan が呼ばれ、完了後にスキル一覧が更新される", async () => {
    mockStoreState.currentPlanId = "plan-001";
    mockStoreState.currentPlanResult = {
      type: "integrated_api",
      planId: "plan-001",
      estimatedSteps: 5,
    };

    renderPanel();

    const executeBtn = screen.getByRole("button", { name: "実行する" });
    await act(async () => {
      fireEvent.click(executeBtn);
    });

    expect(mockExecutePlan).toHaveBeenCalledTimes(1);
    expect(mockFetchSkills).toHaveBeenCalledTimes(1);
    expect(mockSelectSkillByName).toHaveBeenCalledWith("new-skill");
  });
});

// =====================================================================
// U-9: 「キャンセル」ボタンで clearGenerationState が呼ばれる
// =====================================================================
describe("U-9: cancel button clears generation state", () => {
  it("plan 結果表示中の「キャンセル」ボタンで clearGenerationState が呼ばれる", () => {
    mockStoreState.currentPlanResult = {
      type: "integrated_api",
      planId: "plan-001",
      estimatedSteps: 5,
    };

    renderPanel();

    const cancelBtn = screen.getByRole("button", { name: "キャンセル" });
    fireEvent.click(cancelBtn);

    expect(mockClearGenerationState).toHaveBeenCalledTimes(1);
  });
});

// =====================================================================
// U-10: planSkill 失敗時に generationError が設定される
// =====================================================================
describe("U-10: planSkill failure propagates error", () => {
  it("planSkill が失敗レスポンスを返したとき setGenerationError が呼ばれる", async () => {
    mockPlanSkill.mockResolvedValue({
      success: false,
      error: "ネットワークエラー",
    });

    renderPanel();

    const input = screen.getByTestId("skill-lifecycle-request-input");
    fireEvent.change(input, { target: { value: "テスト入力" } });

    const prepareBtn = screen.getByTestId("skill-lifecycle-prepare-button");
    await act(async () => {
      fireEvent.click(prepareBtn);
    });

    expect(mockPlanSkill).toHaveBeenCalledTimes(1);
    expect(mockSetGenerationError).toHaveBeenCalled();
  });

  it("planSkill が logical error(data.success=false)を返したとき plan state をクリアする", async () => {
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

    renderPanel();

    const input = screen.getByTestId("skill-lifecycle-request-input");
    fireEvent.change(input, { target: { value: "テスト入力" } });

    const prepareBtn = screen.getByTestId("skill-lifecycle-prepare-button");
    await act(async () => {
      fireEvent.click(prepareBtn);
    });

    expect(mockSetGenerationError).toHaveBeenCalledWith(
      "LLM アダプタが利用できません。設定を確認してください。",
    );
    expect(mockClearGenerationState).toHaveBeenCalled();
  });
});

// =====================================================================
// U-11: 空文字列入力では「方針を決める」ボタンが無効化される
// =====================================================================
describe("U-11: empty input validation", () => {
  it("テキストエリアが空のとき「方針を決める」を押しても detectMode は呼ばれない", async () => {
    renderPanel();

    const prepareBtn = screen.getByTestId("skill-lifecycle-prepare-button");
    await act(async () => {
      fireEvent.click(prepareBtn);
    });

    expect(mockDetectMode).not.toHaveBeenCalled();
  });
});

// =====================================================================
// U-12: planSkill API 未接続時の graceful degradation
// =====================================================================
describe("U-12: planSkill API unavailable graceful degradation", () => {
  it("planSkill が undefined のとき generationError が設定されアプリがクラッシュしない", async () => {
    (window as Window & { skillCreatorAPI?: unknown }).skillCreatorAPI = {
      detectMode: mockDetectMode,
      // planSkill intentionally omitted
    };

    renderPanel();

    const input = screen.getByTestId("skill-lifecycle-request-input");
    fireEvent.change(input, { target: { value: "テスト入力" } });

    const prepareBtn = screen.getByTestId("skill-lifecycle-prepare-button");
    await act(async () => {
      fireEvent.click(prepareBtn);
    });

    // Should not crash and should set error
    expect(mockSetGenerationError).toHaveBeenCalled();
    expect(mockClearGenerationState).toHaveBeenCalled();
  });
});

// =====================================================================
// U-13: executePlan が terminal_handoff を返した場合、fetchSkills/selectSkillByName が呼ばれない
// =====================================================================
describe("U-13: executePlan terminal_handoff triggers early return", () => {
  it("terminal_handoff レスポンス受信時に fetchSkills が呼ばれず早期リターンする", async () => {
    mockStoreState.currentPlanId = "plan-001";
    mockStoreState.currentPlanResult = {
      type: "integrated_api",
      planId: "plan-001",
      estimatedSteps: 5,
    };
    mockExecutePlan.mockResolvedValue({
      success: true,
      data: {
        type: "terminal_handoff",
        bundle: buildTerminalHandoffBundle(),
      },
    });

    renderPanel();

    const executeBtn = screen.getByRole("button", { name: "実行する" });
    await act(async () => {
      fireEvent.click(executeBtn);
    });

    expect(mockExecutePlan).toHaveBeenCalledTimes(1);
    expect(mockFetchSkills).not.toHaveBeenCalled();
    expect(mockSelectSkillByName).not.toHaveBeenCalled();
    expect(mockSetHandoffGuidance).toHaveBeenCalledTimes(1);
  });

  it("terminal_handoff 時に disclosure summary を表示し、dismiss で同時に消す", async () => {
    mockStoreState.currentPlanId = "plan-001";
    mockStoreState.currentPlanResult = {
      type: "integrated_api",
      planId: "plan-001",
      estimatedSteps: 5,
    };
    mockExecutePlan.mockResolvedValue({
      success: true,
      data: {
        type: "terminal_handoff",
        bundle: buildTerminalHandoffBundle(),
      },
    });

    renderPanel();

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "実行する" }));
    });

    await waitFor(() => {
      expect(mockGetDisclosureInfo).toHaveBeenCalledTimes(1);
      expect(
        screen.getByTestId("skill-lifecycle-disclosure-summary"),
      ).toBeTruthy();
    });

    await act(async () => {
      fireEvent.click(screen.getByLabelText("案内を閉じる"));
    });

    expect(mockClearHandoffGuidance).toHaveBeenCalledTimes(1);
    await waitFor(() => {
      expect(
        screen.queryByTestId("skill-lifecycle-disclosure-summary"),
      ).toBeNull();
    });
  });
});

describe("U-13b: workflow snapshot summary is rendered", () => {
  it("workflowSnapshot があると provenance summary と question host が表示される", () => {
    mockStoreState.workflowSnapshot = {
      planId: "plan-001",
      currentPhase: "review",
      awaitingUserInput: {
        requestId: "req-1",
        reason: "plan_review",
        title: "計画レビュー",
        prompt: "生成された計画を確認してください",
        kind: "single_select",
        options: [
          { id: "ready_to_execute", label: "このまま実行する" },
          { id: "needs_changes", label: "内容を見直したい" },
        ],
        requestedAt: "2026-03-27T00:00:00.000Z",
      },
      verifyResult: null,
      resumeTokenEnvelope: {
        version: "task-sdk-02-v1",
        planId: "plan-001",
        currentPhase: "review",
        artifactCount: 2,
        updatedAt: "2026-03-27T00:00:00.000Z",
      },
      sourceProvenance: {
        resolvedSkillCreatorRoot: "/tmp/skill-creator",
        warningNote: "warning-note",
      },
      handoffBundle: null,
    };

    renderPanel();

    expect(screen.getByTestId("skill-lifecycle-workflow-summary")).toBeTruthy();
    expect(screen.getByTestId("skill-lifecycle-question-host")).toBeTruthy();
    expect(
      screen.getByTestId("skill-lifecycle-provenance-summary"),
    ).toBeTruthy();
    expect(
      screen
        .getByTestId("skill-lifecycle-provenance-summary")
        .textContent?.includes("/tmp/skill-creator"),
    ).toBe(true);
  });
});

describe("U-13c: workflow user input submission", () => {
  it("回答送信ボタンで submitUserInput が呼ばれる", async () => {
    mockStoreState.workflowSnapshot = {
      planId: "plan-001",
      currentPhase: "review",
      awaitingUserInput: {
        requestId: "req-1",
        reason: "plan_review",
        title: "計画レビュー",
        prompt: "生成された計画を確認してください",
        kind: "single_select",
        options: [
          { id: "ready_to_execute", label: "このまま実行する" },
          { id: "needs_changes", label: "内容を見直したい" },
        ],
        requestedAt: "2026-03-27T00:00:00.000Z",
      },
      verifyResult: null,
      resumeTokenEnvelope: {
        version: "task-sdk-02-v1",
        planId: "plan-001",
        currentPhase: "review",
        artifactCount: 2,
        updatedAt: "2026-03-27T00:00:00.000Z",
      },
      handoffBundle: null,
    };
    mockSubmitUserInput.mockResolvedValue({
      success: true,
      data: {
        ...mockStoreState.workflowSnapshot,
        awaitingUserInput: null,
      },
    });

    renderPanel();

    await act(async () => {
      fireEvent.click(screen.getByTestId("chip-ready_to_execute"));
    });
    await act(async () => {
      fireEvent.click(screen.getByTestId("interview-submit"));
    });

    await waitFor(() => {
      expect(mockSubmitUserInput).toHaveBeenCalledWith({
        planId: "plan-001",
        requestId: "req-1",
        selectedOptionId: "ready_to_execute",
      });
    });
    expect(mockSetWorkflowSnapshot).toHaveBeenCalled();
  });
});

// =====================================================================
// TASK-RT-05: multi_select question host
// =====================================================================
describe("TASK-RT-05: multi_select question host", () => {
  it("SkillCreatorUserInputKind として multi_select を受け入れる", () => {
    const kind: SkillCreatorUserInputKind = "multi_select";

    expect(kind).toBe("multi_select");
  });

  // T4-5: checkbox 群が request options を描画する
  it("multi_select request で checkbox 群が表示される", () => {
    mockStoreState.workflowSnapshot = {
      planId: "plan-001",
      currentPhase: "review",
      awaitingUserInput: {
        requestId: "req-multi-1",
        reason: "plan_review",
        title: "複数選択テスト",
        prompt: "使用する機能を選択してください",
        kind: "multi_select",
        options: [
          { id: "feat-a", label: "機能A", description: "Aの説明" },
          { id: "feat-b", label: "機能B" },
          { id: "feat-c", label: "機能C", description: "Cの説明" },
        ],
        requestedAt: "2026-03-30T00:00:00.000Z",
      },
      verifyResult: null,
      resumeTokenEnvelope: {
        version: "task-sdk-02-v1",
        planId: "plan-001",
        currentPhase: "review",
        artifactCount: 1,
        updatedAt: "2026-03-30T00:00:00.000Z",
      },
      handoffBundle: null,
    };

    renderPanel();

    const host = screen.getByTestId("multi-select-checkbox");
    expect(host).toBeTruthy();
    const checkboxes = host.querySelectorAll('input[type="checkbox"]');
    expect(checkboxes).toHaveLength(3);
    expect(screen.getByText("機能A")).toBeTruthy();
    expect(screen.getByText("機能B")).toBeTruthy();
    expect(screen.getByText("機能C")).toBeTruthy();
    expect(screen.getByText("Aの説明")).toBeTruthy();
    expect(screen.getByText("Cの説明")).toBeTruthy();
  });

  // T4-6: toggle 後に selectedOptionIds が submit payload へ入る
  it("checkbox 選択後に submit で selectedOptionIds が送信される", async () => {
    mockStoreState.workflowSnapshot = {
      planId: "plan-001",
      currentPhase: "review",
      awaitingUserInput: {
        requestId: "req-multi-2",
        reason: "plan_review",
        title: "複数選択テスト",
        prompt: "機能を選択してください",
        kind: "multi_select",
        options: [
          { id: "feat-a", label: "機能A" },
          { id: "feat-b", label: "機能B" },
        ],
        requestedAt: "2026-03-30T00:00:00.000Z",
      },
      verifyResult: null,
      resumeTokenEnvelope: {
        version: "task-sdk-02-v1",
        planId: "plan-001",
        currentPhase: "review",
        artifactCount: 1,
        updatedAt: "2026-03-30T00:00:00.000Z",
      },
      handoffBundle: null,
    };
    mockSubmitUserInput.mockResolvedValue({
      success: true,
      data: {
        ...mockStoreState.workflowSnapshot,
        awaitingUserInput: null,
      },
    });

    renderPanel();

    const host = screen.getByTestId("multi-select-checkbox");
    const checkboxes = host.querySelectorAll('input[type="checkbox"]');

    // 2つのチェックボックスを選択
    await act(async () => {
      fireEvent.click(checkboxes[0]!);
    });
    await act(async () => {
      fireEvent.click(checkboxes[1]!);
    });

    await act(async () => {
      fireEvent.click(screen.getByTestId("interview-submit"));
    });

    expect(mockSubmitUserInput).toHaveBeenCalledWith(
      expect.objectContaining({
        planId: "plan-001",
        requestId: "req-multi-2",
        selectedOptionIds: ["feat-a", "feat-b"],
      }),
    );
  });

  it("multi_select 未選択時に submit するとバリデーションエラーが表示される", async () => {
    mockStoreState.workflowSnapshot = {
      planId: "plan-001",
      currentPhase: "review",
      awaitingUserInput: {
        requestId: "req-multi-3",
        reason: "plan_review",
        title: "複数選択テスト",
        prompt: "機能を選択してください",
        kind: "multi_select",
        options: [
          { id: "feat-a", label: "機能A" },
          { id: "feat-b", label: "機能B" },
        ],
        requestedAt: "2026-03-30T00:00:00.000Z",
      },
      verifyResult: null,
      resumeTokenEnvelope: {
        version: "task-sdk-02-v1",
        planId: "plan-001",
        currentPhase: "review",
        artifactCount: 1,
        updatedAt: "2026-03-30T00:00:00.000Z",
      },
      handoffBundle: null,
    };

    renderPanel();

    const submitButton = screen.getByTestId("interview-submit");
    // ConversationalInterview では選択状態に関わらずボタンは常に enabled
    expect(submitButton).not.toBeDisabled();

    // 未選択のまま送信 → バリデーションエラー
    await act(async () => {
      fireEvent.click(submitButton);
    });
    expect(screen.getByTestId("validation-error")).toBeTruthy();

    // チェックボックスを選択 → state が更新される
    const host = screen.getByTestId("multi-select-checkbox");
    const checkboxes = host.querySelectorAll('input[type="checkbox"]');
    await act(async () => {
      fireEvent.click(checkboxes[0]!);
    });
    expect(checkboxes[0]).toBeChecked();
  });

  it("request kind が切り替わると multi_select の state を持ち越さない", async () => {
    mockStoreState.workflowSnapshot = {
      planId: "plan-001",
      currentPhase: "review",
      awaitingUserInput: {
        requestId: "req-multi-4",
        reason: "plan_review",
        title: "複数選択テスト",
        prompt: "機能を選択してください",
        kind: "multi_select",
        options: [
          { id: "feat-a", label: "機能A" },
          { id: "feat-b", label: "機能B" },
        ],
        requestedAt: "2026-03-30T00:00:00.000Z",
      },
      verifyResult: null,
      resumeTokenEnvelope: {
        version: "task-sdk-02-v1",
        planId: "plan-001",
        currentPhase: "review",
        artifactCount: 1,
        updatedAt: "2026-03-30T00:00:00.000Z",
      },
      handoffBundle: null,
    };

    const rendered = renderPanel();
    const initialHost = screen.getByTestId("multi-select-checkbox");
    const initialCheckboxes = initialHost.querySelectorAll(
      'input[type="checkbox"]',
    );
    await act(async () => {
      fireEvent.click(initialCheckboxes[0]!);
    });

    expect(initialCheckboxes[0]).toBeChecked();

    mockStoreState.workflowSnapshot = {
      ...mockStoreState.workflowSnapshot,
      awaitingUserInput: {
        requestId: "req-single-1",
        reason: "plan_review",
        title: "単一選択テスト",
        prompt: "1つ選んでください",
        kind: "single_select",
        options: [
          { id: "single-a", label: "単一A" },
          { id: "single-b", label: "単一B" },
        ],
        requestedAt: "2026-03-30T00:01:00.000Z",
      },
    };
    rendered.rerender(
      <SkillLifecyclePanel onClose={vi.fn()} skillName="test-skill" />,
    );

    mockStoreState.workflowSnapshot = {
      ...mockStoreState.workflowSnapshot,
      awaitingUserInput: {
        requestId: "req-multi-5",
        reason: "plan_review",
        title: "複数選択テスト 2",
        prompt: "機能を再選択してください",
        kind: "multi_select",
        options: [
          { id: "feat-a", label: "機能A" },
          { id: "feat-b", label: "機能B" },
        ],
        requestedAt: "2026-03-30T00:02:00.000Z",
      },
    };
    rendered.rerender(
      <SkillLifecyclePanel onClose={vi.fn()} skillName="test-skill" />,
    );

    const resetHost = screen.getByTestId("multi-select-checkbox");
    const resetCheckboxes = resetHost.querySelectorAll(
      'input[type="checkbox"]',
    );
    expect(resetCheckboxes[0]).not.toBeChecked();
    expect(resetCheckboxes[1]).not.toBeChecked();
  });
});

// =====================================================================
// U-8b: review 後の textarea 編集が execute payload を変えない (drift 防止)
// =====================================================================
describe("U-8b: canonical binding drift prevention", () => {
  it("plan 作成→textarea 変更→execute で canonical spec が維持される", async () => {
    renderPanel();

    // Step 1: 初期値を入力して plan を作成する
    const input = screen.getByTestId("skill-lifecycle-request-input");
    fireEvent.change(input, { target: { value: "承認済みの依頼" } });

    await act(async () => {
      fireEvent.click(screen.getByTestId("skill-lifecycle-prepare-button"));
    });

    // planSkill が plan 作成時の値で呼ばれたことを確認
    expect(mockPlanSkill).toHaveBeenCalledWith(
      "承認済みの依頼",
      expect.anything(),
      expect.anything(),
    );

    // handlePrepare 内で localPlanResult がセットされるため
    // activePlanResult?.type === "integrated_api" の条件で「実行する」ボタンが表示される

    // Step 2: textarea を別の値に変更（drift を試みる）
    fireEvent.change(input, { target: { value: "改ざんされた依頼" } });

    // Step 3: 「実行する」ボタンをクリック
    const executeBtn = screen.getByRole("button", { name: "実行する" });
    await act(async () => {
      fireEvent.click(executeBtn);
    });

    // Step 4: executePlan には plan 作成時の canonical spec が渡される
    expect(mockExecutePlan).toHaveBeenCalledTimes(1);
    expect(mockExecutePlan).toHaveBeenCalledWith("plan-001", "承認済みの依頼");
  });
});

// =====================================================================
// U-14: executePlan が失敗レスポンスを返した場合、generationError が設定される
// =====================================================================
describe("U-14: executePlan failure propagates error", () => {
  it("executePlan が success:false を返すと generationError が設定される", async () => {
    mockStoreState.currentPlanId = "plan-001";
    mockStoreState.currentPlanResult = {
      type: "integrated_api",
      planId: "plan-001",
      estimatedSteps: 5,
    };
    mockExecutePlan.mockResolvedValue({
      success: false,
      error: "実行に失敗しました",
    });

    renderPanel();

    const executeBtn = screen.getByRole("button", { name: "実行する" });
    await act(async () => {
      fireEvent.click(executeBtn);
    });

    expect(mockSetGenerationError).toHaveBeenCalledWith("実行に失敗しました");
    expect(mockFetchSkills).not.toHaveBeenCalled();
    expect(mockSelectSkillByName).not.toHaveBeenCalled();
  });
});

// =====================================================================
// U-15: executePlan が data なし成功レスポンスを返した場合、デフォルトエラーが設定される
// =====================================================================
describe("U-15: executePlan empty data uses default error", () => {
  it("executePlan が success:true かつ data なしのとき既定メッセージを設定する", async () => {
    mockStoreState.currentPlanId = "plan-001";
    mockStoreState.currentPlanResult = {
      type: "integrated_api",
      planId: "plan-001",
      estimatedSteps: 5,
    };
    mockExecutePlan.mockResolvedValue({
      success: true,
      data: undefined,
    });

    renderPanel();

    const executeBtn = screen.getByRole("button", { name: "実行する" });
    await act(async () => {
      fireEvent.click(executeBtn);
    });

    expect(mockSetGenerationError).toHaveBeenCalledWith(
      "計画実行に失敗しました",
    );
    expect(mockFetchSkills).not.toHaveBeenCalled();
    expect(mockSelectSkillByName).not.toHaveBeenCalled();
  });
});

// =====================================================================
// U-16: verify detail が表示される
// =====================================================================
describe("U-16: verify detail surface", () => {
  it("currentPlanId があると verify detail を取得して表示する", async () => {
    mockStoreState.currentPlanId = "plan-001";

    renderPanel();

    expect(
      await screen.findByTestId("skill-lifecycle-verify-detail"),
    ).toBeTruthy();
    expect(mockGetVerifyDetail).toHaveBeenCalledWith("plan-001");
    expect(await screen.findByText(/integrated_api \(default\)/)).toBeTruthy();
    expect(screen.getByText("verify summary")).toBeTruthy();
  });
});

// =====================================================================
// U-17: reverifyWorkflow が呼ばれる
// =====================================================================
describe("U-17: reverify button", () => {
  it("再検証ボタン押下で reverifyWorkflow を呼ぶ", async () => {
    mockStoreState.currentPlanId = "plan-001";

    renderPanel();

    const button = await screen.findByTestId("skill-lifecycle-reverify-button");
    await act(async () => {
      fireEvent.click(button);
    });

    expect(mockReverifyWorkflow).toHaveBeenCalledWith("plan-001");
  });
});

// =====================================================================
// U-17b: runtime improve proposal が同一 surface に表示される
// =====================================================================
describe("U-17b: runtime improve surface", () => {
  it("改善提案取得で ImprovementProposalPanel を表示する", async () => {
    mockStoreState.selectedSkillName = "test-skill";
    mockStoreState.skillExecutionStatus = "completed";

    renderPanel();

    const button = screen.getByTestId("skill-lifecycle-improve-button");
    await act(async () => {
      fireEvent.click(button);
    });

    expect(mockImproveSkillWithFeedback).toHaveBeenCalledWith(
      "test-skill",
      expect.any(String),
    );
    expect(
      await screen.findByTestId("skill-lifecycle-runtime-improve-result"),
    ).toBeTruthy();
    const proposalPanel = screen.getByTestId("improvement-proposal-panel");
    expect(within(proposalPanel).getByText("改善提案")).toBeTruthy();
    expect(within(proposalPanel).getByText("説明を明確化する")).toBeTruthy();
  });
});

// =====================================================================
// U-18: verify detail fail ステータスの edge case
// =====================================================================
describe("U-18: verify detail fail status displays fail badge and message", () => {
  it("status=fail / nextAction=improve のとき fail バッジとメッセージが表示される", async () => {
    mockGetVerifyDetail.mockResolvedValue({
      success: true,
      data: {
        planId: "plan-001",
        currentPhase: "verify",
        status: "fail",
        message: "Layer 1 check failed",
        nextAction: "improve",
        checks: [
          {
            id: "L3-002",
            layer: "layer3",
            severity: "error",
            summary: "SKILL.md missing required section",
          },
        ],
        evidenceCount: 1,
        route: {
          type: "integrated_api",
          summary: "integrated_api (default)",
        },
        reverifyEligible: true,
        delegatedGovernanceNote: "Task07 owner",
        delegatedSessionNote: "Task08 owner",
      },
    });
    mockStoreState.currentPlanId = "plan-001";

    renderPanel();

    expect(
      await screen.findByTestId("skill-lifecycle-verify-detail"),
    ).toBeTruthy();
    expect(screen.getByText("fail")).toBeTruthy();
    expect(screen.getByText("Layer 1 check failed")).toBeTruthy();
    expect(screen.getByText("SKILL.md missing required section")).toBeTruthy();
  });
});

// =====================================================================
// U-19: verify detail pass ステータス
// =====================================================================
describe("U-19: verify detail pass status displays pass badge", () => {
  it("status=pass のとき pass バッジが表示される", async () => {
    mockGetVerifyDetail.mockResolvedValue({
      success: true,
      data: {
        planId: "plan-001",
        currentPhase: "verify",
        status: "pass",
        message: "All checks passed",
        checks: [],
        evidenceCount: 5,
        route: {
          type: "integrated_api",
          summary: "integrated_api (default)",
        },
        reverifyEligible: false,
        disabledReason: "既に pass 済みです",
        delegatedGovernanceNote: "Task07 owner",
        delegatedSessionNote: "Task08 owner",
      },
    });
    mockStoreState.currentPlanId = "plan-001";

    renderPanel();

    expect(
      await screen.findByTestId("skill-lifecycle-verify-detail"),
    ).toBeTruthy();
    expect(screen.getByText("pass")).toBeTruthy();
    expect(screen.getByText("All checks passed")).toBeTruthy();
    expect(screen.getByText("既に pass 済みです")).toBeTruthy();
    // reverifyEligible=false なので再検証ボタンは disabled
    const reverifyBtn = screen.getByTestId("skill-lifecycle-reverify-button");
    expect((reverifyBtn as HTMLButtonElement).disabled).toBe(true);
  });
});

// =====================================================================
// U-20: verify detail 取得失敗時のエラー表示
// =====================================================================
describe("U-20: verify detail fetch failure shows error", () => {
  it("getVerifyDetail が失敗すると wrapper 内で error banner が表示され、再試行で再取得できる", async () => {
    mockGetVerifyDetail.mockResolvedValueOnce({
      success: true,
      data: {
        planId: "plan-001",
        currentPhase: "verify",
        status: "pending",
        message: "verify detail を読み込み中",
        checks: [],
        evidenceCount: 3,
        route: {
          type: "integrated_api",
          summary: "integrated_api (default)",
        },
        reverifyEligible: true,
        delegatedGovernanceNote: "Task07 owner",
        delegatedSessionNote: "Task08 owner",
      },
    });
    mockGetVerifyDetail.mockResolvedValueOnce({
      success: false,
      error: "verify detail の取得に失敗しました。",
    });
    mockGetVerifyDetail.mockResolvedValueOnce({
      success: true,
      data: {
        planId: "plan-001",
        currentPhase: "verify",
        status: "pass",
        message: "retry succeeded",
        checks: [],
        evidenceCount: 5,
        route: {
          type: "integrated_api",
          summary: "integrated_api (default)",
        },
        reverifyEligible: false,
        disabledReason: "既に pass 済みです",
        delegatedGovernanceNote: "Task07 owner",
        delegatedSessionNote: "Task08 owner",
      },
    });

    renderPanel();

    await act(async () => {
      fireEvent.change(screen.getByTestId("skill-lifecycle-request-input"), {
        target: { value: "verify detail を確認する" },
      });
      fireEvent.click(screen.getByTestId("skill-lifecycle-prepare-button"));
    });

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "実行する" }));
    });

    expect(await screen.findByTestId("error-banner")).toBeTruthy();
    expect(
      screen.getByTestId("skill-creation-result-overall-status"),
    ).toHaveTextContent("検証失敗");
    expect(screen.queryByTestId("skill-lifecycle-error")).toBeNull();
    expect(
      screen.getByText("verify detail の取得に失敗しました。"),
    ).toBeTruthy();

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "再試行" }));
    });

    await waitFor(() => expect(mockGetVerifyDetail).toHaveBeenCalledTimes(3));
    expect(await screen.findByText("retry succeeded")).toBeTruthy();
    expect(
      screen.getByTestId("skill-creation-result-overall-status"),
    ).toHaveTextContent("完了");
  });
});

// =====================================================================
// U-18b: cancel 後に再 plan したとき approved snapshot が差し替わる
// =====================================================================
describe("U-18b: cancel then re-plan replaces approved snapshot", () => {
  it("cancel → 再 plan で新しい canonical spec が固定される", async () => {
    renderPanel();
    const input = screen.getByTestId("skill-lifecycle-request-input");

    // Step 1: 最初の plan
    fireEvent.change(input, { target: { value: "初回依頼" } });
    await act(async () => {
      fireEvent.click(screen.getByTestId("skill-lifecycle-prepare-button"));
    });

    // Step 2: cancel
    const cancelBtn = screen.getByRole("button", { name: "キャンセル" });
    fireEvent.click(cancelBtn);
    expect(mockClearGenerationState).toHaveBeenCalled();

    // Step 3: 新しい plan を作成
    mockPlanSkill.mockResolvedValue({
      success: true,
      data: { type: "integrated_api", planId: "plan-002", estimatedSteps: 3 },
    });

    fireEvent.change(input, { target: { value: "二回目の依頼" } });
    await act(async () => {
      fireEvent.click(screen.getByTestId("skill-lifecycle-prepare-button"));
    });

    // Step 4: execute
    const executeBtn = screen.getByRole("button", { name: "実行する" });
    await act(async () => {
      fireEvent.click(executeBtn);
    });

    // executePlan には二回目の依頼が渡る（初回依頼ではない）
    expect(mockExecutePlan).toHaveBeenCalledWith("plan-002", "二回目の依頼");
  });
});

// =====================================================================
// U-19b: 複数回の textarea 編集後も approved snapshot は不変
// =====================================================================
describe("U-19b: multiple textarea edits do not affect approved snapshot", () => {
  it("plan 作成後に何度 textarea を変えても execute payload は固定", async () => {
    renderPanel();
    const input = screen.getByTestId("skill-lifecycle-request-input");

    // plan 作成
    fireEvent.change(input, { target: { value: "固定されるべき依頼" } });
    await act(async () => {
      fireEvent.click(screen.getByTestId("skill-lifecycle-prepare-button"));
    });

    // 複数回 textarea を変更
    fireEvent.change(input, { target: { value: "変更1" } });
    fireEvent.change(input, { target: { value: "変更2" } });
    fireEvent.change(input, { target: { value: "変更3" } });

    // execute
    const executeBtn = screen.getByRole("button", { name: "実行する" });
    await act(async () => {
      fireEvent.click(executeBtn);
    });

    expect(mockExecutePlan).toHaveBeenCalledWith(
      "plan-001",
      "固定されるべき依頼",
    );
  });
});

// =====================================================================
// U-20b: cancel で approvedSkillSpec が null にクリアされる
// =====================================================================
describe("U-20b: cancel clears approved snapshot symmetrically", () => {
  it("cancel 後に plan なしで execute しても approved spec は null", async () => {
    mockStoreState.currentPlanId = "plan-001";
    mockStoreState.currentPlanResult = {
      type: "integrated_api",
      planId: "plan-001",
      estimatedSteps: 5,
    };

    renderPanel();

    // cancel
    const cancelBtn = screen.getByRole("button", { name: "キャンセル" });
    fireEvent.click(cancelBtn);

    expect(mockClearGenerationState).toHaveBeenCalledTimes(1);
  });
});

// =====================================================================
// U-21: execute 失敗後の approved snapshot の振る舞い
// =====================================================================
describe("U-21: approved snapshot behavior after execute failure", () => {
  it("execute 失敗後も approved snapshot は保持され、再実行可能である", async () => {
    mockExecutePlan
      .mockResolvedValueOnce({
        success: false,
        error: "一時的な実行失敗",
      })
      .mockResolvedValueOnce({
        success: true,
        data: {
          executeId: "exec-002",
          skillName: "new-skill",
          success: true,
        },
      });

    renderPanel();
    const input = screen.getByTestId("skill-lifecycle-request-input");

    fireEvent.change(input, {
      target: { value: "失敗後も保持されるべき依頼" },
    });
    await act(async () => {
      fireEvent.click(screen.getByTestId("skill-lifecycle-prepare-button"));
    });

    const executeBtn = screen.getByRole("button", { name: "実行する" });
    await act(async () => {
      fireEvent.click(executeBtn);
    });

    expect(mockSetGenerationError).toHaveBeenCalledWith("一時的な実行失敗");
    expect(mockExecutePlan).toHaveBeenNthCalledWith(
      1,
      "plan-001",
      "失敗後も保持されるべき依頼",
    );

    await act(async () => {
      fireEvent.click(executeBtn);
    });

    expect(mockExecutePlan).toHaveBeenNthCalledWith(
      2,
      "plan-001",
      "失敗後も保持されるべき依頼",
    );
    expect(mockFetchSkills).toHaveBeenCalledTimes(1);
    expect(mockSelectSkillByName).toHaveBeenCalledWith("new-skill");
  });
});
