/**
 * @vitest-environment happy-dom
 *
 * @file TASK-FIX-LIFECYCLE-PANEL-ERROR-001 — エラー永続化テスト
 * @description SkillLifecyclePanel の onWorkflowStateChanged コールバックが
 * currentPhase: 'handoff' 時に setWorkflowError(null) を呼ばないことを検証する。
 *
 * テストケース:
 *   TC-EP-01: currentPhase: 'handoff' の snapshot を受け取ったとき setWorkflowError(null) が呼ばれない
 *   TC-EP-02: currentPhase: 'execute' の snapshot を受け取ったとき setWorkflowError(null) が呼ばれる
 *   TC-EP-03: currentPhase: 'verify' の snapshot を受け取ったとき setWorkflowError(null) が呼ばれる
 *   TC-EP-04: currentPhase: 'handoff' でも handoffBundle が存在する場合は setHandoffGuidance が呼ばれる
 *   TC-EP-05: currentPhase: 'execute' で handoffBundle が null の場合は setHandoffGuidance が呼ばれない
 */

import React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, cleanup, render, waitFor } from "@testing-library/react";
import type {
  SkillCreatorWorkflowUiSnapshot,
  TerminalHandoffBundle,
} from "@repo/shared/types";

// ============================================================
// Store モック
// ============================================================

const mockSetWorkflowSnapshot = vi.fn();
const mockSetWorkflowError = vi.fn();
const mockSetHandoffGuidance = vi.fn();
const mockClearHandoffGuidance = vi.fn();

type MockStoreState = {
  selectedSkillName: string | null;
  isExecuting: boolean;
  streamingMessages: never[];
  skillExecutionStatus: string | null;
  skillError: string | null;
  isGenerating: boolean;
  generationProgress: string | null;
  generationError: string | null;
  currentPlanId: string | null;
  currentPlanResult: unknown | null;
  workflowSnapshot: null;
  workflowError: string | null;
  handoffGuidance: null;
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
  useBeginSkillReview: () => vi.fn(),
  useCreateSkill: () => vi.fn(),
  useCompleteSkillReview: () => vi.fn(),
  useExecuteSkill: () => vi.fn(),
  useFetchSkills: () => vi.fn(),
  useReExecuteAfterImprovement: () => vi.fn(),
  useResetSkillExecutionCycle: () => vi.fn(),
  useSelectSkillByName: () => vi.fn(),
  useClearSkillError: () => vi.fn(),
  useClearStreamingMessages: () => vi.fn(),
  useClearGenerationState: () => vi.fn(),
  useSelectedSkillName: () => mockStoreState.selectedSkillName,
  useIsSkillExecuting: () => mockStoreState.isExecuting,
  useStreamingMessages: () => mockStoreState.streamingMessages,
  useSkillExecutionStatus: () => mockStoreState.skillExecutionStatus,
  useSkillError: () => mockStoreState.skillError,
  useIsSkillGenerating: () => mockStoreState.isGenerating,
  useGenerationProgress: () => mockStoreState.generationProgress,
  useGenerationError: () => mockStoreState.generationError,
  useCurrentPlanId: () => mockStoreState.currentPlanId,
  useCurrentPlanResult: () => mockStoreState.currentPlanResult,
  useSetIsSkillGenerating: () => vi.fn(),
  useSetGenerationError: () => vi.fn(),
  useSetGenerationProgress: () => vi.fn(),
  useSetCurrentPlanId: () => vi.fn(),
  useSetCurrentPlanResult: () => vi.fn(),
  useWorkflowSnapshot: () => mockStoreState.workflowSnapshot,
  useWorkflowError: () => mockStoreState.workflowError,
  useSetWorkflowSnapshot: () => mockSetWorkflowSnapshot,
  useSetWorkflowError: () => mockSetWorkflowError,
  useHandoffGuidance: () => mockStoreState.handoffGuidance,
  useSetHandoffGuidance: () => mockSetHandoffGuidance,
  useClearHandoffGuidance: () => mockClearHandoffGuidance,
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

vi.mock("../ConversationalInterview", () => ({
  ConversationalInterview: ({
    workflowSnapshot,
    onSubmit,
  }: {
    workflowSnapshot: SkillCreatorWorkflowUiSnapshot | null;
    onSubmit: (submission: SkillCreatorUserInputSubmission) => Promise<void>;
  }) => (
    <button
      data-testid="mock-conversational-interview-submit"
      onClick={() => {
        if (!workflowSnapshot?.awaitingUserInput) {
          return;
        }
        void onSubmit({
          planId: workflowSnapshot.planId,
          requestId: workflowSnapshot.awaitingUserInput.requestId,
          selectedOptionId: "option-1",
        });
      }}
    >
      interview-submit
    </button>
  ),
}));

import { SkillLifecyclePanel } from "../SkillLifecyclePanel";

// ============================================================
// Skill Creator API モック
// ============================================================

const mockOnWorkflowStateChanged = vi.fn();
const mockDetectMode = vi.fn();
const mockGetWorkflowState = vi.fn();
const mockExecutePlan = vi.fn();
const mockSubmitUserInput = vi.fn();
const mockGetDisclosureInfo = vi.fn();
const mockGetVerifyDetail = vi.fn();

// ============================================================
// テスト用スナップショットビルダー
// ============================================================

function buildSnapshot(
  currentPhase: SkillCreatorWorkflowUiSnapshot["currentPhase"],
  handoffBundle?: TerminalHandoffBundle | null,
  overrides: Partial<SkillCreatorWorkflowUiSnapshot> = {},
): SkillCreatorWorkflowUiSnapshot {
  return {
    planId: "test-plan-001",
    currentPhase,
    awaitingUserInput: null,
    verifyResult: null,
    resumeTokenEnvelope: {
      version: "task-sdk-02-v1",
      planId: "test-plan-001",
      currentPhase,
      artifactCount: 0,
      updatedAt: new Date().toISOString(),
    },
    handoffBundle: handoffBundle ?? null,
    ...overrides,
  };
}

// ============================================================
// onWorkflowStateChanged コールバックをキャプチャするヘルパー
// ============================================================

function setupCallbackCapture(): {
  triggerCallback: (snapshot: SkillCreatorWorkflowUiSnapshot) => void;
} {
  let capturedCallback:
    | ((snapshot: SkillCreatorWorkflowUiSnapshot) => void)
    | undefined;

  mockOnWorkflowStateChanged.mockImplementation(
    (cb: (snapshot: SkillCreatorWorkflowUiSnapshot) => void) => {
      capturedCallback = cb;
      return () => {};
    },
  );

  return {
    triggerCallback: (snapshot) => {
      if (!capturedCallback) {
        throw new Error(
          "onWorkflowStateChanged callback が登録されていません。コンポーネントがレンダリングされているか確認してください。",
        );
      }
      capturedCallback(snapshot);
    },
  };
}

// ============================================================
// テスト本体
// ============================================================

describe("SkillLifecyclePanel - onWorkflowStateChanged エラー永続化", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockStoreState = {
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

    mockDetectMode.mockResolvedValue({ success: false });
    mockGetWorkflowState.mockResolvedValue({ success: false });
    mockExecutePlan.mockResolvedValue({ success: false });
    mockSubmitUserInput.mockResolvedValue({ success: false });
    mockGetDisclosureInfo.mockResolvedValue({ success: false });
    mockGetVerifyDetail.mockResolvedValue({ success: false });

    (window as Window & { electronAPI?: unknown }).electronAPI = {
      skillCreator: {
        detectMode: mockDetectMode,
        executePlan: mockExecutePlan,
        getWorkflowState: mockGetWorkflowState,
        onWorkflowStateChanged: mockOnWorkflowStateChanged,
        submitUserInput: mockSubmitUserInput,
        getDisclosureInfo: mockGetDisclosureInfo,
        getVerifyDetail: mockGetVerifyDetail,
      },
    };
  });

  afterEach(() => {
    cleanup();
  });

  // AC-1: currentPhase === 'handoff' のとき setWorkflowError(null) が呼ばれないこと
  it("TC-EP-01: currentPhase: 'handoff' の snapshot を受け取ったとき setWorkflowError(null) が呼ばれない", async () => {
    const { triggerCallback } = setupCallbackCapture();

    render(
      <SkillLifecyclePanel
        isOpen={true}
        onClose={vi.fn()}
        defaultTab="create"
      />,
    );

    await act(async () => {
      triggerCallback(buildSnapshot("handoff"));
    });

    // setWorkflowSnapshot は呼ばれる（スナップショットの更新は行う）
    expect(mockSetWorkflowSnapshot).toHaveBeenCalledWith(
      expect.objectContaining({ currentPhase: "handoff" }),
    );
    // setWorkflowError(null) は呼ばれない（エラーを保持する）
    expect(mockSetWorkflowError).not.toHaveBeenCalledWith(null);
  });

  // AC-2: currentPhase !== 'handoff' のとき setWorkflowError(null) が呼ばれること（既存動作維持）
  it("TC-EP-02: currentPhase: 'execute' の snapshot を受け取ったとき setWorkflowError(null) が呼ばれる", async () => {
    const { triggerCallback } = setupCallbackCapture();

    render(
      <SkillLifecyclePanel
        isOpen={true}
        onClose={vi.fn()}
        defaultTab="create"
      />,
    );

    await act(async () => {
      triggerCallback(buildSnapshot("execute"));
    });

    expect(mockSetWorkflowSnapshot).toHaveBeenCalledWith(
      expect.objectContaining({ currentPhase: "execute" }),
    );
    expect(mockSetWorkflowError).toHaveBeenCalledWith(null);
  });

  // AC-2 追加: currentPhase: 'verify' でも既存動作が維持されること
  it("TC-EP-03: currentPhase: 'verify' の snapshot を受け取ったとき setWorkflowError(null) が呼ばれる", async () => {
    const { triggerCallback } = setupCallbackCapture();

    render(
      <SkillLifecyclePanel
        isOpen={true}
        onClose={vi.fn()}
        defaultTab="create"
      />,
    );

    await act(async () => {
      triggerCallback(buildSnapshot("verify"));
    });

    expect(mockSetWorkflowSnapshot).toHaveBeenCalledWith(
      expect.objectContaining({ currentPhase: "verify" }),
    );
    expect(mockSetWorkflowError).toHaveBeenCalledWith(null);
  });

  // AC-3: handoffBundle の処理は currentPhase に関わらず変わらないこと
  it("TC-EP-04: currentPhase: 'handoff' でも handoffBundle が存在する場合は setHandoffGuidance が呼ばれる", async () => {
    const { triggerCallback } = setupCallbackCapture();

    render(
      <SkillLifecyclePanel
        isOpen={true}
        onClose={vi.fn()}
        defaultTab="create"
      />,
    );

    const mockHandoffBundle: TerminalHandoffBundle = {
      launcher: "claude",
      promptBundle: "test prompt",
      cwd: "/test/cwd",
      suggestedCommand: "claude --help",
      manualRetryRule: "retry on error",
    };

    await act(async () => {
      triggerCallback(buildSnapshot("handoff", mockHandoffBundle));
    });

    // handoffBundle 処理は currentPhase に関わらず実行される
    expect(mockSetHandoffGuidance).toHaveBeenCalled();
    // setWorkflowError(null) は呼ばれない（currentPhase: 'handoff'）
    expect(mockSetWorkflowError).not.toHaveBeenCalledWith(null);
  });

  it("TC-EP-05: currentPhase: 'execute' で handoffBundle が null の場合は setHandoffGuidance が呼ばれない", async () => {
    const { triggerCallback } = setupCallbackCapture();

    render(
      <SkillLifecyclePanel
        isOpen={true}
        onClose={vi.fn()}
        defaultTab="create"
      />,
    );

    await act(async () => {
      triggerCallback(buildSnapshot("execute", null));
    });

    expect(mockSetHandoffGuidance).not.toHaveBeenCalled();
    // setWorkflowError(null) は呼ばれる（currentPhase: 'execute'）
    expect(mockSetWorkflowError).toHaveBeenCalledWith(null);
  });

  it("TC-EP-06: getWorkflowState が handoff snapshot を返す場合は setWorkflowError(null) を呼ばない", async () => {
    mockStoreState.currentPlanId = "test-plan-001";
    mockGetWorkflowState.mockResolvedValue({
      success: true,
      data: buildSnapshot("handoff"),
    });

    render(
      <SkillLifecyclePanel
        isOpen={true}
        onClose={vi.fn()}
        defaultTab="create"
      />,
    );

    await waitFor(() => {
      expect(mockGetWorkflowState).toHaveBeenCalledWith("test-plan-001");
    });

    expect(mockSetWorkflowSnapshot).toHaveBeenCalledWith(
      expect.objectContaining({ currentPhase: "handoff" }),
    );
    expect(mockSetWorkflowError).not.toHaveBeenCalledWith(null);
  });

  it("TC-EP-07: submitUserInput が handoff snapshot を返す場合は setWorkflowError(null) を呼ばない", async () => {
    mockStoreState.workflowSnapshot = buildSnapshot("review", null, {
      awaitingUserInput: {
        requestId: "req-001",
        kind: "single_select",
        prompt: "Choose",
        options: [
          {
            id: "option-1",
            label: "Option 1",
            description: "desc",
          },
        ],
      },
    });
    mockSubmitUserInput.mockResolvedValue({
      success: true,
      data: buildSnapshot("handoff"),
    });

    const { getByTestId } = render(
      <SkillLifecyclePanel
        isOpen={true}
        onClose={vi.fn()}
        defaultTab="create"
      />,
    );

    await act(async () => {
      getByTestId("mock-conversational-interview-submit").click();
    });

    await waitFor(() => {
      expect(mockSubmitUserInput).toHaveBeenCalledWith(
        expect.objectContaining({
          planId: "test-plan-001",
          requestId: "req-001",
          selectedOptionId: "option-1",
        }),
      );
    });

    expect(mockSetWorkflowSnapshot).toHaveBeenCalledWith(
      expect.objectContaining({ currentPhase: "handoff" }),
    );
    expect(mockSetWorkflowError).not.toHaveBeenCalledWith(null);
  });

  it("TC-EP-08: execute 後の getWorkflowState 再取得が handoff snapshot を返す場合は setWorkflowError(null) を呼ばない", async () => {
    const mockHandoffBundle: TerminalHandoffBundle = {
      launcher: "claude",
      promptBundle: "test prompt",
      cwd: "/test/cwd",
      suggestedCommand: "claude --help",
      manualRetryRule: "retry on error",
    };
    mockStoreState.currentPlanId = "test-plan-001";
    mockStoreState.currentPlanResult = {
      type: "integrated_api",
      planId: "test-plan-001",
      estimatedSteps: 3,
    };
    mockExecutePlan.mockResolvedValue({
      success: true,
      data: {
        type: "terminal_handoff",
        bundle: mockHandoffBundle,
      },
    });
    mockGetWorkflowState.mockResolvedValue({
      success: true,
      data: buildSnapshot("handoff", mockHandoffBundle),
    });
    mockGetDisclosureInfo.mockResolvedValue({
      success: true,
      data: {
        aiServiceName: "Claude",
        modelName: "claude-sonnet-4-6",
        externalDestinations: [],
      },
    });

    const { getByText } = render(
      <SkillLifecyclePanel
        isOpen={true}
        onClose={vi.fn()}
        defaultTab="create"
      />,
    );

    await act(async () => {
      getByText("実行する").click();
    });

    await waitFor(() => {
      expect(mockExecutePlan).toHaveBeenCalledWith("test-plan-001", undefined);
    });

    await waitFor(() => {
      expect(mockGetWorkflowState).toHaveBeenCalledWith("test-plan-001");
    });

    expect(mockSetWorkflowSnapshot).toHaveBeenCalledWith(
      expect.objectContaining({ currentPhase: "handoff" }),
    );
    expect(mockSetWorkflowError).not.toHaveBeenCalledWith(null);
  });
});
